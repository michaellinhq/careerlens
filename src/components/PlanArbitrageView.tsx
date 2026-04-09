'use client';

import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, ReferenceLine, Cell, Tooltip,
} from 'recharts';
import type { CareerRole, IndustryCareerMap } from '@/lib/career-map';

/* ─── Helpers ─── */

interface RolePoint {
  id: string;
  title: string;
  title_zh: string;
  industry_icon: string;
  salary_now: number;     // salary at current achievable level
  salary_after: number;   // salary at target level after plan
  tension: number;        // supply-demand tension
  level_now: string;
  level_after: string;
  match_now: number;
  match_after: number;
  // scatter fields
  x: number;
  y: number;
}

function estimateTension(role: CareerRole): number {
  const demand = role.growth_outlook === 'high' ? 75 : role.growth_outlook === 'medium' ? 55 : 35;
  const barrier = Math.min(85, 40 + role.core_skills.length * 3);
  const aiSafe = role.ai_risk === 'low' ? 80 : role.ai_risk === 'medium' ? 55 : 30;
  const space = 100 - barrier * 0.5; // high barrier = less competition
  return demand * 0.30 + barrier * 0.25 + aiSafe * 0.30 + space * 0.15;
}

function matchToLevel(matchPct: number): number {
  // 0-20% → junior(0), 20-40% → senior(1), 40-60% → lead(2), 60-80% → manager(3), 80-100% → director(4)
  if (matchPct >= 80) return 4;
  if (matchPct >= 60) return 3;
  if (matchPct >= 40) return 2;
  if (matchPct >= 20) return 1;
  return 0;
}

const LEVEL_NAMES = {
  zh: ['初级', '高级', '主管', '经理', '总监'],
  en: ['Junior', 'Senior', 'Lead', 'Manager', 'Director'],
};

/* ─── Custom Tooltip ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PlanTooltip({ active, payload, isZh, currency, unit }: {
  active?: boolean;
  payload?: readonly any[];
  isZh: boolean;
  currency: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as RolePoint & { _type: 'now' | 'after' };
  const isAfter = d._type === 'after';

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg max-w-[240px]">
      <div className="flex items-center gap-2 mb-1">
        <span>{d.industry_icon}</span>
        <span className="text-xs font-bold text-slate-900">{isZh ? d.title_zh : d.title}</span>
      </div>
      <div className="text-[10px] font-semibold mb-1" style={{ color: isAfter ? '#059669' : '#6b7280' }}>
        {isAfter
          ? (isZh ? '📈 学完之后' : '📈 After Plan')
          : (isZh ? '📍 你现在' : '📍 You Now')}
      </div>
      <div className="space-y-0.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">{isZh ? '级别' : 'Level'}</span>
          <span className="font-medium">{isAfter ? d.level_after : d.level_now}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">{isZh ? '薪资' : 'Salary'}</span>
          <span className="font-mono font-bold">{currency}{isAfter ? d.salary_after : d.salary_now}K{unit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">{isZh ? '技能匹配' : 'Skill Match'}</span>
          <span className="font-mono">{isAfter ? d.match_after : d.match_now}%</span>
        </div>
        {isAfter && d.salary_after > d.salary_now && (
          <div className="pt-1 border-t border-slate-100 text-emerald-600 font-bold">
            +{currency}{d.salary_after - d.salary_now}K{unit} ({isZh ? '薪资增幅' : 'salary gain'})
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function PlanArbitrageView({
  resolvedRoles,
  matchMap,
  market,
  locale,
}: {
  resolvedRoles: { role: CareerRole; industry: IndustryCareerMap }[];
  matchMap: Map<string, number>;  // roleId → current match%
  market: 'CN' | 'DE';
  locale: 'en' | 'de' | 'zh';
}) {
  const isZh = locale === 'zh';
  const currency = market === 'CN' ? '¥' : '€';
  const unit = market === 'CN' ? '/月' : '/yr';

  const { nowPoints, afterPoints, arrows } = useMemo(() => {
    const now: (RolePoint & { _type: 'now' })[] = [];
    const after: (RolePoint & { _type: 'after' })[] = [];
    const arrowData: { x1: number; y1: number; x2: number; y2: number; title: string }[] = [];

    for (const { role, industry } of resolvedRoles) {
      const tension = estimateTension(role);
      const currentMatch = matchMap.get(role.id) || 0;
      const afterMatch = Math.min(100, currentMatch + 35); // assume plan closes ~35% of gap

      const levelNowIdx = matchToLevel(currentMatch);
      const levelAfterIdx = Math.min(4, matchToLevel(afterMatch) + 1); // at least one level up

      const salaryKey = market === 'CN' ? 'salary_cn' : 'salary_de';
      const salaryNow = role.levels[levelNowIdx]?.[salaryKey].mid || role.levels[0][salaryKey].mid;
      const salaryAfter = role.levels[levelAfterIdx]?.[salaryKey].mid || role.levels[4][salaryKey].mid;

      const base: RolePoint = {
        id: role.id,
        title: role.title,
        title_zh: role.title_zh,
        industry_icon: industry.icon,
        salary_now: salaryNow,
        salary_after: salaryAfter,
        tension,
        level_now: (isZh ? LEVEL_NAMES.zh : LEVEL_NAMES.en)[levelNowIdx],
        level_after: (isZh ? LEVEL_NAMES.zh : LEVEL_NAMES.en)[levelAfterIdx],
        match_now: currentMatch,
        match_after: afterMatch,
        x: tension,
        y: salaryNow,
      };

      now.push({ ...base, _type: 'now' });
      after.push({ ...base, y: salaryAfter, _type: 'after' });
      arrowData.push({ x1: tension, y1: salaryNow, x2: tension, y2: salaryAfter, title: isZh ? role.title_zh : role.title });
    }

    return { nowPoints: now, afterPoints: after, arrows: arrowData };
  }, [resolvedRoles, matchMap, market, isZh]);

  if (resolvedRoles.length === 0) return null;

  // Compute domains
  const allSalaries = [...nowPoints.map(p => p.y), ...afterPoints.map(p => p.y)];
  const allTensions = nowPoints.map(p => p.x);
  const minS = Math.min(...allSalaries) * 0.7;
  const maxS = Math.max(...allSalaries) * 1.15;
  const minT = Math.min(...allTensions) - 10;
  const maxT = Math.max(...allTensions) + 10;
  const medS = (minS + maxS) / 2;
  const medT = (minT + maxT) / 2;

  // Total salary gain
  const totalGain = afterPoints.reduce((s, p, i) => s + (p.y - nowPoints[i].y), 0);
  const avgGainPct = nowPoints.length > 0
    ? Math.round(afterPoints.reduce((s, p, i) => s + ((p.y - nowPoints[i].y) / nowPoints[i].y) * 100, 0) / nowPoints.length)
    : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {isZh ? '你的职业跃迁图' : 'Your Career Leap'}
          </h3>
          <p className="text-[11px] text-slate-500">
            {isZh
              ? '灰点 = 你现在的水平，绿点 = 完成计划后的水平，箭头 = 你的跃迁路径'
              : 'Gray dot = you now, green dot = after plan, arrow = your leap path'}
          </p>
        </div>
        {totalGain > 0 && (
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-600">
              +{currency}{totalGain}K
            </div>
            <div className="text-[10px] text-slate-400">
              ~{avgGainPct}% {isZh ? '薪资增幅' : 'salary uplift'}
            </div>
          </div>
        )}
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              type="number" dataKey="x"
              domain={[minT, maxT]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              label={{ value: isZh ? '供需张力 →' : 'Demand Tension →', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#64748b' }}
            />
            <YAxis
              type="number" dataKey="y"
              domain={[minS, maxS]}
              tickFormatter={v => `${currency}${v}K`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              label={{ value: isZh ? '薪资 →' : 'Salary →', position: 'insideTopLeft', offset: -5, fontSize: 10, fill: '#64748b', angle: -90 }}
            />

            <ReferenceLine x={medT} stroke="#e2e8f0" strokeDasharray="6 4" />
            <ReferenceLine y={medS} stroke="#e2e8f0" strokeDasharray="6 4" />

            {/* Arrows: render as custom SVG */}
            {arrows.map((a, i) => (
              <ReferenceLine
                key={`arrow-${i}`}
                segment={[{ x: a.x1, y: a.y1 }, { x: a.x2, y: a.y2 }]}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            ))}

            {/* "Now" dots — gray, smaller */}
            <Scatter data={nowPoints} fill="#94a3b8">
              {nowPoints.map((_, i) => (
                <Cell key={`now-${i}`} r={6} fill="#94a3b8" stroke="#64748b" strokeWidth={1.5} />
              ))}
            </Scatter>

            {/* "After" dots — green, larger, with glow */}
            <Scatter data={afterPoints} fill="#10b981">
              {afterPoints.map((_, i) => (
                <Cell key={`after-${i}`} r={9} fill="#10b981" stroke="#059669" strokeWidth={2} />
              ))}
            </Scatter>

            <Tooltip
              content={(props) => (
                <PlanTooltip {...props} isZh={isZh} currency={currency} unit={unit} />
              )}
              cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Role-by-role leap summary */}
      <div className="mt-3 space-y-2">
        {resolvedRoles.map(({ role, industry }, i) => {
          const now = nowPoints[i];
          const aft = afterPoints[i];
          if (!now || !aft) return null;
          const gain = aft.y - now.y;
          return (
            <div key={role.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
              <span className="text-base">{industry.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-800 truncate">
                  {isZh ? role.title_zh : role.title}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="text-slate-400">{now.level_now}</span>
                  <span className="text-emerald-500">→</span>
                  <span className="text-emerald-700 font-semibold">{aft.level_after}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-slate-400 line-through">{currency}{now.y}K</div>
                <div className="text-xs font-bold text-emerald-600">{currency}{aft.y}K</div>
              </div>
              {gain > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +{currency}{gain}K
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>{isZh ? '现在水平' : 'You now'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>{isZh ? '完成计划后' : 'After plan'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-0 border-t-2 border-dashed border-emerald-400" />
          <span>{isZh ? '跃迁路径' : 'Leap path'}</span>
        </div>
      </div>
    </div>
  );
}
