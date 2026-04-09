/**
 * BLS Salary Data API Route
 *
 * GET /api/data/bls?soc=17-2112.00
 * GET /api/data/bls?soc=17-2112.00,17-2141.00 (batch, max 10)
 *
 * Returns real US salary data from Bureau of Labor Statistics.
 * Data is cached server-side for 24 hours.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { fetchSalaryBySOC, fetchSalaryBatch } from '@/lib/data-sources';

export async function GET(request: NextRequest) {
  const socParam = request.nextUrl.searchParams.get('soc');

  if (!socParam) {
    return NextResponse.json(
      { error: 'Missing ?soc= parameter. Provide a SOC code like 17-2112.00' },
      { status: 400 }
    );
  }

  const socCodes = socParam.split(',').map(s => s.trim()).filter(Boolean);

  if (socCodes.length === 0) {
    return NextResponse.json({ error: 'No valid SOC codes provided' }, { status: 400 });
  }

  if (socCodes.length > 10) {
    return NextResponse.json({ error: 'Maximum 10 SOC codes per request' }, { status: 400 });
  }

  // Validate SOC code format: XX-XXXX.XX
  const socPattern = /^\d{2}-\d{4}\.\d{2}$/;
  for (const soc of socCodes) {
    if (!socPattern.test(soc)) {
      return NextResponse.json(
        { error: `Invalid SOC code format: "${soc}". Expected format: 17-2112.00` },
        { status: 400 }
      );
    }
  }

  try {
    if (socCodes.length === 1) {
      const data = await fetchSalaryBySOC(socCodes[0]);
      if (!data) {
        return NextResponse.json(
          { error: `No BLS data found for SOC ${socCodes[0]}`, soc_code: socCodes[0] },
          { status: 404 }
        );
      }
      return NextResponse.json({ data, source: 'bls' });
    }

    // Batch request
    const results = await fetchSalaryBatch(socCodes);
    const data: Record<string, unknown> = {};
    for (const [soc, salary] of results) {
      data[soc] = salary;
    }
    return NextResponse.json({
      data,
      count: results.size,
      requested: socCodes.length,
      source: 'bls',
    });
  } catch (error) {
    console.error('BLS API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BLS data', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}
