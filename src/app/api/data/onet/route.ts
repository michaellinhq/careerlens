/**
 * O*NET Occupation Data API Route
 *
 * GET /api/data/onet?soc=17-2112.00              — full occupation data
 * GET /api/data/onet?soc=17-2112.00&fields=skills — skills only
 * GET /api/data/onet?soc=17-2112.00&fields=tech   — technologies only
 *
 * Requires ONET_USERNAME and ONET_PASSWORD environment variables.
 * Data is cached server-side for 7 days.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { fetchOccupation, fetchSkills, fetchTechnologies, isOnetConfigured } from '@/lib/data-sources';

export async function GET(request: NextRequest) {
  if (!isOnetConfigured()) {
    return NextResponse.json(
      {
        error: 'O*NET API not configured',
        hint: 'Set ONET_USERNAME and ONET_PASSWORD in .env.local. Register free at https://services.onetcenter.org/developer/signup',
      },
      { status: 503 }
    );
  }

  const socCode = request.nextUrl.searchParams.get('soc');
  const fields = request.nextUrl.searchParams.get('fields');

  if (!socCode) {
    return NextResponse.json(
      { error: 'Missing ?soc= parameter. Provide a SOC code like 17-2112.00' },
      { status: 400 }
    );
  }

  // Validate SOC code format
  const socPattern = /^\d{2}-\d{4}\.\d{2}$/;
  if (!socPattern.test(socCode)) {
    return NextResponse.json(
      { error: `Invalid SOC code format: "${socCode}". Expected format: 17-2112.00` },
      { status: 400 }
    );
  }

  try {
    // Skills-only request
    if (fields === 'skills') {
      const skills = await fetchSkills(socCode);
      return NextResponse.json({ soc_code: socCode, skills, source: 'onet' });
    }

    // Technologies-only request
    if (fields === 'tech') {
      const technologies = await fetchTechnologies(socCode);
      return NextResponse.json({ soc_code: socCode, technologies, source: 'onet' });
    }

    // Full occupation data
    const data = await fetchOccupation(socCode);
    if (!data) {
      return NextResponse.json(
        { error: `No O*NET data found for SOC ${socCode}`, soc_code: socCode },
        { status: 404 }
      );
    }

    return NextResponse.json({ data, source: 'onet' });
  } catch (error) {
    console.error('O*NET API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch O*NET data', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}
