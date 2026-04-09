'use client';

import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend,
} from 'recharts';
import type { Job } from '@/lib/data';

/* ─── Constants ─── */

const INDUSTRY_COLORS: Record<string, string> = {
  automotive:              '#3b82f6',
  electronics:             '#8b5cf6',
  'digital-manufacturing': '#06b6d4',
  energy:                  '#10b981',
  quality:                 '#f59e0b',
  manufacturing:           '#6366f1',
  'supply-chain':          '#ec4899',
  management:              '#f97316',
  consulting:              '#14b8a6',
};

const INDUSTRY_LABELS_ZH: Record<string, string> = {
  automotive:              '汽车',
  electronics:             '电子',
  'digital-manufacturing': '数字制造',
  energy:                  '能源',
  quality:                 '质量',
  manufacturing:           '制造',
  'supply-chain':          '供应链',
  management:              '管理',
  consulting:              '咨询',
};

interface QuadrantInfo {
  key: string;
  label: string;
  label_zh: string;
  emoji: string;
  description: string;
  description_zh: string;
  color: string;
}

const QUADRANTS: QuadrantInfo[] = [
  {
    key: 'gold',
    label: 'Golden Track',
    label_zh: '黄金赛道',
    emoji: '⭐',
    description: 'High salary + strong demand + AI-safe. The arbitrage sweet spot — high reward with structural tailwinds.',
    description_zh: '高薪 + 强需求 + AI安全。套利甜蜜点——结构性利好带来高回报。',
    color: '#f59e0b',
  },
  {
    key: 'red-ocean',
    label: 'Red Ocean',
    label_zh: '内卷红海',
    emoji: '🔴',
    description: 'High salary but fierce competition or rising AI risk. Money is good, but the moat is narrowing.',
    description_zh: '高薪但竞争激烈或AI风险上升。钱不少，但护城河在收窄。',
    color: '#ef4444',
  },
  {
    key: 'blue-ocean',
    label: 'Emerging Blue Ocean',
    label_zh: '潜力蓝海',
    emoji: '🌊',
    description: 'Moderate salary but extreme demand. Ideal stepping stone — salary will catch up as supply stays scarce.',
    description_zh: '薪资中等但需求极度饥渴。理想跳板——供给持续稀缺，薪资会追上来。',
    color: '#3b82f6',
  },
  {
    key: 'sunset',
    label: 'Sunset Zone',
    label_zh: '夕阳赛道',
    emoji: '🌅',
    description: 'Low salary + oversupplied + AI-threatened. Avoid unless you already have deep expertise here.',
    description_zh: '低薪 + 供过于求 + AI威胁。除非已有深厚积累，否则避开。',
    color: '#94a3b8',
  },
];

/* ─── Helpers ─── */

function calcDemandTension(b: Job['breakdown']): number {
  return (
    b.demand_growth * 0.30 +
    b.barrier * 0.25 +
    b.ai_resilience * 0.30 +
    (100 - b.competition) * 0.15
  );
}

function getQuadrant(salary: number, tension: number, medSalary: number, medTension: number): QuadrantInfo {
  if (salary >= medSalary && tension >= medTension) return QUADRANTS[0]; // gold
  if (salary >= medSalary && tension < medTension) return QUADRANTS[1];  // red ocean
  if (salary < medSalary && tension >= medTension) return QUADRANTS[2];  // blue ocean
  return QUADRANTS[3]; // sunset
}

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/* ─── Custom Tooltip ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MapTooltip({ active, payload, isZh, currency }: {
  active?: boolean;
  payload?: readonly any[];
  isZh: boolean;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ScatterPoint;
  const q = d._quadrant;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg max-w-[260px]">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{q.emoji}</span>
        <span className="text-xs font-bold text-slate-900">{isZh ? d.title_zh : d.title}</span>
      </div>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">{isZh ? '薪资' : 'Salary'}</span>
          <span className="font-mono font-bold text-slate-800">{currency}{d.salary_display}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">{isZh ? '供需张力' : 'Demand Tension'}</span>
          <span className="font-mono font-bold text-slate-800">{d.tension.toFixed(0)}/100</span>
        </div>
        <div className="border-t border-slate-100 pt-1 mt-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">{isZh ? '需求增速' : 'Demand'}</span>
            <span className="font-mono">{d.demand_growth}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">{isZh ? '进入壁垒' : 'Barrier'}</span>
            <span className="font-mono">{d.barrier}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">{isZh ? 'AI抗性' : 'AI Safety'}</span>
            <span className="font-mono">{d.ai_resilience}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">{isZh ? '竞争度' : 'Competition'}</span>
            <span className="font-mono">{d.competition}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 pt-1.5 border-t border-slate-100">
        <span className="text-[10px] font-semibold" style={{ color: q.color }}>{q.emoji} {isZh ? q.label_zh : q.label}</span>
      </div>
    </div>
  );
}

/* ─── Types ─── */

interface ScatterPoint {
  code: string;
  title: string;
  title_zh: string;
  salary_raw: number;
  salary_display: string;
  tension: number;
  opportunity_score: number;
  industry: string;
  demand_growth: number;
  barrier: number;
  ai_resilience: number;
  competition: number;
  _quadrant: QuadrantInfo;
}

/* ─── Main Component ─── */

export function ArbitrageMap({
  jobs,
  locale,
  market,
  highlightCodes,
}: {
  jobs: Job[];
  locale: 'en' | 'de' | 'zh';
  market: 'CN' | 'DE';
  highlightCodes?: Set<string>;
}) {
  const isZh = locale === 'zh';
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);
  const currency = market === 'CN' ? '¥' : '€';

  // Transform jobs into scatter points
  const { points, medSalary, medTension, quadrantCounts, industries } = useMemo(() => {
    const filtered = jobs.filter(j => j.country === market);
    const pts: ScatterPoint[] = filtered.map(j => ({
      code: j.code,
      title: j.title,
      title_zh: j.title_zh,
      salary_raw: j.salary_raw,
      salary_display: j.salary_display,
      tension: calcDemandTension(j.breakdown),
      opportunity_score: j.opportunity_score,
      industry: j.industry || 'manufacturing',
      demand_growth: j.breakdown.demand_growth,
      barrier: j.breakdown.barrier,
      ai_resilience: j.breakdown.ai_resilience,
      competition: j.breakdown.competition,
      _quadrant: QUADRANTS[0], // placeholder, set below
    }));

    const medS = median(pts.map(p => p.salary_raw));
    const medT = median(pts.map(p => p.tension));

    // Assign quadrants
    const counts = { gold: 0, 'red-ocean': 0, 'blue-ocean': 0, sunset: 0 };
    for (const p of pts) {
      p._quadrant = getQuadrant(p.salary_raw, p.tension, medS, medT);
      counts[p._quadrant.key as keyof typeof counts]++;
    }

    // Unique industries
    const indSet = [...new Set(pts.map(p => p.industry))].sort();

    return { points: pts, medSalary: medS, medTension: medT, quadrantCounts: counts, industries: indSet };
  }, [jobs, market]);

  // Filtered points
  const visiblePoints = activeIndustry
    ? points.filter(p => p.industry === activeIndustry)
    : points;

  const dimmedPoints = activeIndustry
    ? points.filter(p => p.industry !== activeIndustry)
    : [];

  // Determine which interpretation to show
  const interpretation = useMemo(() => {
    if (hoveredPoint) {
      const q = hoveredPoint._quadrant;
      return {
        emoji: q.emoji,
        title: isZh ? hoveredPoint.title_zh : hoveredPoint.title,
        zone: isZh ? q.label_zh : q.label,
        zoneColor: q.color,
        text: isZh ? q.description_zh : q.description,
        detail: isZh
          ? `供需张力 ${hoveredPoint.tension.toFixed(0)}/100 — 需求增速${hoveredPoint.demand_growth} · 壁垒${hoveredPoint.barrier} · AI抗性${hoveredPoint.ai_resilience}`
          : `Tension ${hoveredPoint.tension.toFixed(0)}/100 — Demand ${hoveredPoint.demand_growth} · Barrier ${hoveredPoint.barrier} · AI-safe ${hoveredPoint.ai_resilience}`,
      };
    }

    // Default: market summary
    const goldPct = Math.round((quadrantCounts.gold / points.length) * 100);
    const sunsetPct = Math.round((quadrantCounts.sunset / points.length) * 100);
    return {
      emoji: '📊',
      title: isZh ? '市场全景' : 'Market Overview',
      zone: isZh
        ? `${points.length}个岗位 · ${market === 'CN' ? '中国' : '德国'}市场`
        : `${points.length} roles · ${market === 'CN' ? 'China' : 'Germany'} market`,
      zoneColor: '#3b82f6',
      text: isZh
        ? `${goldPct}% 的岗位位于黄金赛道（高薪+强需求+AI安全），${sunsetPct}% 处于夕阳区域。悬停查看每个岗位的深度分析。`
        : `${goldPct}% of roles sit in the Golden Track (high pay + strong demand + AI-safe), ${sunsetPct}% in the Sunset Zone. Hover over any dot for deep analysis.`,
      detail: isZh
        ? `中位薪资 ${currency}${(medSalary / 1000).toFixed(0)}K · 中位张力 ${medTension.toFixed(0)}/100`
        : `Median salary ${currency}${(medSalary / 1000).toFixed(0)}K · Median tension ${medTension.toFixed(0)}/100`,
    };
  }, [hoveredPoint, quadrantCounts, points.length, medSalary, medTension, market, currency, isZh]);

  // Format salary for Y axis
  const formatSalary = (v: number) => `${currency}${(v / 1000).toFixed(0)}K`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-900">
          {isZh ? '职业套利象限图' : 'Career Arbitrage Map'}
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          {QUADRANTS.map(q => (
            <span key={q.key} className="flex items-center gap-1">
              <span>{q.emoji}</span>
              <span>{isZh ? q.label_zh : q.label}</span>
            </span>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mb-4">
        {isZh
          ? '每个点 = 一个岗位。右上角 = 高薪+高需求+AI安全 = 最佳套利机会。点越大 = 综合得分越高。'
          : 'Each dot = one role. Top-right = high salary + high demand + AI-safe = best arbitrage. Larger dots = higher composite score.'}
      </p>

      {/* Industry filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setActiveIndustry(null)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
            !activeIndustry
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
          }`}
        >
          {isZh ? '全部' : 'All'} ({points.length})
        </button>
        {industries.map(ind => {
          const count = points.filter(p => p.industry === ind).length;
          const color = INDUSTRY_COLORS[ind] || '#6b7280';
          return (
            <button
              key={ind}
              onClick={() => setActiveIndustry(activeIndustry === ind ? null : ind)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                activeIndustry === ind
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
              style={activeIndustry === ind ? { backgroundColor: color, borderColor: color } : {}}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: color }} />
              {isZh ? (INDUSTRY_LABELS_ZH[ind] || ind) : ind} ({count})
            </button>
          );
        })}
      </div>

      {/* Chart + Interpretation side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
        {/* Scatter plot */}
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="tension"
                name={isZh ? '供需张力' : 'Demand Tension'}
                domain={[20, 90]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                label={{ value: isZh ? '供需张力 →' : 'Demand Tension →', position: 'insideBottomRight', offset: -5, fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="number"
                dataKey="salary_raw"
                name={isZh ? '薪资' : 'Salary'}
                tickFormatter={formatSalary}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                label={{ value: isZh ? '薪资 →' : 'Salary →', position: 'insideTopLeft', offset: -5, fontSize: 11, fill: '#64748b', angle: -90 }}
              />

              {/* Quadrant dividers */}
              <ReferenceLine x={medTension} stroke="#cbd5e1" strokeDasharray="6 4" />
              <ReferenceLine y={medSalary} stroke="#cbd5e1" strokeDasharray="6 4" />

              {/* Dimmed dots (non-selected industry) */}
              {dimmedPoints.length > 0 && (
                <Scatter data={dimmedPoints} fill="#e2e8f0" fillOpacity={0.3} strokeOpacity={0}>
                  {dimmedPoints.map((p, i) => (
                    <Cell
                      key={`dim-${i}`}
                      r={3}
                    />
                  ))}
                </Scatter>
              )}

              {/* Active dots */}
              <Scatter
                data={visiblePoints}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onMouseEnter={(data: any) => setHoveredPoint(data as ScatterPoint)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {visiblePoints.map((p, i) => {
                  const isHighlighted = highlightCodes?.has(p.code);
                  const baseR = Math.max(4, Math.min(10, p.opportunity_score / 12));
                  return (
                    <Cell
                      key={`vis-${i}`}
                      fill={INDUSTRY_COLORS[p.industry] || '#6b7280'}
                      fillOpacity={0.8}
                      stroke={isHighlighted ? '#f59e0b' : INDUSTRY_COLORS[p.industry] || '#6b7280'}
                      strokeWidth={isHighlighted ? 3 : 1}
                      r={isHighlighted ? baseR + 2 : baseR}
                    />
                  );
                })}
              </Scatter>

              <Tooltip
                content={(props) => (
                  <MapTooltip {...props} isZh={isZh} currency={currency} />
                )}
                cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Interpretation panel */}
        <div className="flex flex-col gap-3">
          {/* Dynamic insight */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{interpretation.emoji}</span>
              <div>
                <div className="text-xs font-bold text-slate-900">{interpretation.title}</div>
                <div className="text-[10px] font-medium" style={{ color: interpretation.zoneColor }}>
                  {interpretation.zone}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
              {interpretation.text}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {interpretation.detail}
            </p>
          </div>

          {/* Quadrant legend with counts */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {isZh ? '象限分布' : 'Quadrant Distribution'}
            </span>
            {QUADRANTS.map(q => {
              const count = quadrantCounts[q.key as keyof typeof quadrantCounts];
              const pct = Math.round((count / points.length) * 100);
              return (
                <div key={q.key} className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{q.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-medium text-slate-700">{isZh ? q.label_zh : q.label}</span>
                      <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-0.5">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: q.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Axis explanation */}
          <div className="text-[10px] text-slate-400 space-y-1 pt-2 border-t border-slate-200">
            <div>
              <span className="font-semibold text-slate-500">Y: </span>
              {isZh ? '实际薪资（中位数水平）' : 'Actual salary (median level)'}
            </div>
            <div>
              <span className="font-semibold text-slate-500">X: </span>
              {isZh
                ? '供需张力 = 需求增速×0.3 + 壁垒×0.25 + AI抗性×0.3 + 空间×0.15'
                : 'Tension = Demand×0.3 + Barrier×0.25 + AI-safe×0.3 + Space×0.15'}
            </div>
            <div>
              <span className="font-semibold text-slate-500">{isZh ? '大小' : 'Size'}: </span>
              {isZh ? '综合机会得分' : 'Composite opportunity score'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
