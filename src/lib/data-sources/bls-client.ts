/**
 * BLS (Bureau of Labor Statistics) API Client
 *
 * API v2 docs: https://www.bls.gov/developers/api_signature_v2.htm
 *
 * Rate limits:
 *   - Without key: 25 requests/day, 10 years of data
 *   - With key: 500 requests/day, 20 years of data
 *
 * Series ID format for Occupational Employment and Wage Statistics (OEWS):
 *   OEUM [area_code] [industry_code] [soc_code] [data_type]
 *   Example: OEUN0000000000017-211201 (national, all industries, Industrial Engineers, annual mean wage)
 *
 * Area codes: 0000000 = national
 * Industry codes: 000000 = all industries
 * Data types: 01 = employment, 04 = mean wage, 07 = median wage,
 *             08 = 10th pct, 09 = 25th pct, 11 = 75th pct, 12 = 90th pct
 */

import type { SalaryDataPoint, DataAttribution } from './types';

const BLS_API_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

// Simple in-memory cache (server-side, lives for the duration of the serverless function warm period)
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Build OEWS series ID from SOC code and data type.
 * National level, all industries.
 */
function buildSeriesId(socCode: string, dataType: string): string {
  // SOC code format: "17-2112.00" → "172112" (remove dash, drop minor .XX)
  const cleanSoc = socCode.replace('-', '').replace(/\.\d+$/, '');
  // OEUN + 0000000 (area=national) + 000000 (industry=all) + SOC(6) + datatype(2)
  return `OEUN0000000000000${cleanSoc}${dataType}`;
}

interface BLSResponse {
  status: string;
  responseTime: number;
  message: string[];
  Results?: {
    series: {
      seriesID: string;
      data: {
        year: string;
        period: string;
        periodName: string;
        value: string;
        footnotes: { code: string; text: string }[];
      }[];
    }[];
  };
}

/**
 * Fetch multiple series from BLS API in a single request.
 * API v2 allows up to 50 series per request.
 */
async function fetchBLSSeries(seriesIds: string[], startYear?: number, endYear?: number): Promise<BLSResponse> {
  const cacheKey = seriesIds.sort().join(',');
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as BLSResponse;
  }

  const currentYear = new Date().getFullYear();
  // OEWS data lags ~2 years; request a wider window to ensure we get the latest available
  const body: Record<string, unknown> = {
    seriesid: seriesIds,
    startyear: String(startYear || currentYear - 3),
    endyear: String(endYear || currentYear),
  };

  // Use API key if available (500 req/day vs 25)
  const apiKey = process.env.BLS_API_KEY;
  if (apiKey) {
    body.registrationkey = apiKey;
  }

  const response = await fetch(BLS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`BLS API error: ${response.status} ${response.statusText}`);
  }

  const data: BLSResponse = await response.json();

  if (data.status !== 'REQUEST_SUCCEEDED') {
    throw new Error(`BLS API failed: ${data.message?.join(', ') || 'Unknown error'}`);
  }

  cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
  return data;
}

/**
 * Get the latest value from a BLS series.
 */
function getLatestValue(series: { seriesID: string; data: { year: string; period: string; periodName: string; value: string; footnotes: { code: string; text: string }[] }[] }): number | null {
  if (!series.data || series.data.length === 0) return null;
  // BLS returns data in reverse chronological order; first entry is most recent
  const latest = series.data[0];
  const val = parseFloat(latest.value);
  return isNaN(val) ? null : val;
}

/**
 * Fetch comprehensive salary data for a SOC code.
 * Returns mean, median, and percentile wages.
 */
export async function fetchSalaryBySOC(socCode: string): Promise<SalaryDataPoint | null> {
  // BLS OEWS data type codes (national level):
  // 01=employment, 03=hourly_mean, 04=annual_mean, 11=annual_10th, 12=annual_25th,
  // 13=annual_median, 14=annual_75th, 15=annual_90th
  const dataTypes = {
    '04': 'annual_mean',
    '13': 'annual_median',
    '11': 'annual_10th',
    '12': 'annual_25th',
    '14': 'annual_75th',
    '15': 'annual_90th',
    '03': 'hourly_mean',
    '01': 'employment',
  } as const;

  const seriesIds = Object.keys(dataTypes).map(dt => buildSeriesId(socCode, dt));

  try {
    const response = await fetchBLSSeries(seriesIds);
    if (!response.Results?.series) return null;

    const values: Record<string, number> = {};
    for (const series of response.Results.series) {
      // Extract data type from series ID (last 2 chars)
      const dt = series.seriesID.slice(-2);
      const key = dataTypes[dt as keyof typeof dataTypes];
      const val = getLatestValue(series);
      if (key && val !== null) {
        values[key] = val;
      }
    }

    if (!values.annual_mean && !values.annual_median) return null;

    const attribution: DataAttribution = {
      source: 'U.S. Bureau of Labor Statistics',
      source_short: 'BLS',
      url: `https://www.bls.gov/oes/current/oes${socCode.replace('-', '').replace('.00', '')}.htm`,
      last_updated: new Date().toISOString().split('T')[0],
      note: 'Occupational Employment and Wage Statistics (OEWS), annual data',
    };

    return {
      soc_code: socCode,
      title: '', // Will be filled by caller or O*NET
      annual_mean: values.annual_mean || 0,
      annual_median: values.annual_median || 0,
      annual_10th: values.annual_10th || 0,
      annual_25th: values.annual_25th || 0,
      annual_75th: values.annual_75th || 0,
      annual_90th: values.annual_90th || 0,
      hourly_mean: values.hourly_mean || 0,
      employment: values.employment || 0,
      attribution,
    };
  } catch (error) {
    console.error(`BLS fetch failed for SOC ${socCode}:`, error);
    return null;
  }
}

/**
 * Fetch salary data for multiple SOC codes (batched).
 * BLS allows up to 50 series per request, so we batch accordingly.
 */
export async function fetchSalaryBatch(socCodes: string[]): Promise<Map<string, SalaryDataPoint>> {
  const result = new Map<string, SalaryDataPoint>();
  const unique = [...new Set(socCodes)];

  // Each SOC needs 8 series, BLS limit is 50 → max 6 SOCs per request
  const BATCH_SIZE = 6;

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    const promises = batch.map(soc => fetchSalaryBySOC(soc));
    const results = await Promise.all(promises);

    for (let j = 0; j < batch.length; j++) {
      if (results[j]) {
        result.set(batch[j], results[j]!);
      }
    }
  }

  return result;
}

/**
 * Get all unique SOC codes used in our career map.
 * Useful for pre-warming the cache.
 */
export function getOEWSSeriesUrl(socCode: string): string {
  const clean = socCode.replace('-', '').replace('.00', '');
  return `https://www.bls.gov/oes/current/oes${clean}.htm`;
}
