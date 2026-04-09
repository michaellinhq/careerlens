/**
 * SalaryDistribution — compact percentile visualization
 *
 * Shows P10/P25/Median/P75/P90 as a gradient bar with tick marks
 * and an optional "you are here" marker. Designed to fit within
 * a ~350px card width.
 *
 * The visual itself IS the credibility signal — no attribution needed.
 */

interface PercentileData {
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  currency: string;     // "$", "¥", "€"
  unit: string;         // "K/yr", "K/月", "K/yr"
  label?: string;       // "US", "CN", "DE"
  userValue?: number;   // user's current or target salary
}

export function SalaryDistribution({
  data,
  compact = false,
}: {
  data: PercentileData[];
  compact?: boolean;
}) {
  // Find global min/max across all rows for aligned scales
  const globalMin = Math.min(...data.map(d => d.p10)) * 0.85;
  const globalMax = Math.max(...data.map(d => d.p90)) * 1.08;
  const range = globalMax - globalMin;

  const pct = (v: number) => ((v - globalMin) / range) * 100;

  return (
    <div className="space-y-2.5">
      {data.map((row, i) => {
        const leftWhisker = pct(row.p10);
        const leftBox = pct(row.p25);
        const medianPos = pct(row.median);
        const rightBox = pct(row.p75);
        const rightWhisker = pct(row.p90);
        const userPos = row.userValue != null ? pct(Math.max(row.p10, Math.min(row.p90, row.userValue))) : null;

        // Determine user's percentile bracket for the label
        let userPctLabel = '';
        if (row.userValue != null) {
          if (row.userValue <= row.p10) userPctLabel = '<P10';
          else if (row.userValue <= row.p25) userPctLabel = 'P10-25';
          else if (row.userValue <= row.median) userPctLabel = 'P25-50';
          else if (row.userValue <= row.p75) userPctLabel = 'P50-75';
          else if (row.userValue <= row.p90) userPctLabel = 'P75-90';
          else userPctLabel = '>P90';
        }

        // Color gradient: slate-300 whiskers, indigo-200 → indigo-400 box
        return (
          <div key={i} className="relative">
            {/* Country label */}
            {row.label && (
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{row.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {row.currency}{row.median}{row.unit}
                </span>
              </div>
            )}

            {/* The distribution bar — 28px tall */}
            <div className="relative h-7 w-full">
              {/* Background track */}
              <div className="absolute top-[12px] left-0 right-0 h-[4px] bg-slate-100 rounded-full" />

              {/* Whisker line: P10 to P90 */}
              <div
                className="absolute top-[12px] h-[4px] bg-slate-200 rounded-full"
                style={{ left: `${leftWhisker}%`, width: `${rightWhisker - leftWhisker}%` }}
              />

              {/* IQR box: P25 to P75 — the gradient core */}
              <div
                className="absolute top-[6px] h-[16px] rounded-md"
                style={{
                  left: `${leftBox}%`,
                  width: `${rightBox - leftBox}%`,
                  background: 'linear-gradient(90deg, #c7d2fe 0%, #818cf8 50%, #6366f1 100%)',
                  opacity: 0.85,
                }}
              />

              {/* P10 tick */}
              <div
                className="absolute top-[8px] w-[1.5px] h-[12px] bg-slate-300 rounded-full"
                style={{ left: `${leftWhisker}%` }}
              />
              {/* P90 tick */}
              <div
                className="absolute top-[8px] w-[1.5px] h-[12px] bg-slate-300 rounded-full"
                style={{ left: `${rightWhisker}%` }}
              />

              {/* Median marker — bold line */}
              <div
                className="absolute top-[4px] w-[2px] h-[20px] bg-white rounded-full shadow-sm"
                style={{ left: `${medianPos}%` }}
              />

              {/* User marker — diamond/triangle */}
              {userPos != null && (
                <div
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${userPos}%`, transform: 'translateX(-50%)' }}
                >
                  {/* Triangle pointing down */}
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: '5px solid #f97316',
                    }}
                  />
                  {/* Vertical line through the bar */}
                  <div className="w-[2px] h-[22px] bg-orange-400 rounded-full" />
                </div>
              )}
            </div>

            {/* Percentile labels row */}
            {!compact && (
              <div className="relative h-3 mt-0.5">
                <span className="absolute text-[9px] text-slate-400 font-mono" style={{ left: `${leftWhisker}%`, transform: 'translateX(-50%)' }}>
                  {row.currency}{row.p10}
                </span>
                <span className="absolute text-[9px] text-slate-500 font-mono font-semibold" style={{ left: `${medianPos}%`, transform: 'translateX(-50%)' }}>
                  {row.currency}{row.median}
                </span>
                <span className="absolute text-[9px] text-slate-400 font-mono" style={{ left: `${rightWhisker}%`, transform: 'translateX(-50%)' }}>
                  {row.currency}{row.p90}
                </span>
              </div>
            )}

            {/* User position callout */}
            {row.userValue != null && !compact && (
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                <span className="text-[10px] text-orange-600 font-medium">
                  {row.currency}{row.userValue}{row.unit} ({userPctLabel})
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Compact legend */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-full bg-slate-200" />
          <span className="text-[9px] text-slate-400">P10-P90</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-sm" style={{ background: 'linear-gradient(90deg, #c7d2fe, #6366f1)' }} />
          <span className="text-[9px] text-slate-400">P25-P75</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-[2px] h-2 bg-white border border-slate-300 rounded-full" />
          <span className="text-[9px] text-slate-400">Median</span>
        </div>
        {data.some(d => d.userValue != null) && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
            <span className="text-[9px] text-orange-500">You</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Convenience: multi-country salary comparison for a single role
 */
export function SalaryCompare({
  us,
  cn,
  de,
  userSalary,
}: {
  us?: { p10: number; p25: number; median: number; p75: number; p90: number };
  cn?: { p10: number; p25: number; median: number; p75: number; p90: number };
  de?: { p10: number; p25: number; median: number; p75: number; p90: number };
  userSalary?: { country: 'US' | 'CN' | 'DE'; value: number };
}) {
  const rows: PercentileData[] = [];

  if (us) rows.push({ ...us, currency: '$', unit: 'K/yr', label: 'US', userValue: userSalary?.country === 'US' ? userSalary.value : undefined });
  if (cn) rows.push({ ...cn, currency: '¥', unit: 'K/月', label: 'CN', userValue: userSalary?.country === 'CN' ? userSalary.value : undefined });
  if (de) rows.push({ ...de, currency: '€', unit: 'K/yr', label: 'DE', userValue: userSalary?.country === 'DE' ? userSalary.value : undefined });

  if (rows.length === 0) return null;

  return <SalaryDistribution data={rows} />;
}
