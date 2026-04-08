'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { calcRoleMatch, calcIndustryMatch } from '@/lib/resume-parser';
import { t } from '@/lib/i18n';
import { allIndustries } from '@/lib/career-map';
import type { IndustryCareerMap, CareerRole, CareerLevel } from '@/lib/career-map';

const LEVEL_LABELS: Record<CareerLevel, { en: string; zh: string; de: string }> = {
  junior: { en: 'Junior', zh: '初级', de: 'Junior' },
  senior: { en: 'Senior', zh: '高级', de: 'Senior' },
  lead: { en: 'Lead', zh: '主管', de: 'Teamleiter' },
  manager: { en: 'Manager', zh: '经理', de: 'Manager' },
  director: { en: 'Director', zh: '总监', de: 'Direktor' },
};

const LEVELS: CareerLevel[] = ['junior', 'senior', 'lead', 'manager', 'director'];

/* ─── Match Badge ─── */
function MatchBadge({ match }: { match: number }) {
  if (match <= 0) return null;
  const color = match >= 40 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : match >= 20 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-500 bg-slate-50 border-slate-200';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color}`}>
      {match}%
    </span>
  );
}

/* ─── Salary Bar ─── */
function SalaryBar({ low, mid, high, max, currency }: { low: number; mid: number; high: number; max: number; currency: string }) {
  const pctLow = (low / max) * 100;
  const pctMid = (mid / max) * 100;
  const pctHigh = (high / max) * 100;
  return (
    <div className="relative h-7 bg-slate-100 rounded-md overflow-hidden">
      <div className="absolute top-0 h-full bg-blue-100 rounded-md" style={{ left: `${pctLow}%`, width: `${pctHigh - pctLow}%` }} />
      <div className="absolute top-0 h-full w-0.5 bg-blue-600" style={{ left: `${pctMid}%` }} />
      <div className="absolute inset-0 flex items-center px-2 text-xs font-mono">
        <span className="text-slate-400">{currency}{low}K</span>
        <span className="mx-auto font-bold text-blue-700">{currency}{mid}K</span>
        <span className="text-slate-400">{currency}{high}K</span>
      </div>
    </div>
  );
}

/* ─── Role Card (expandable) ─── */
function RoleCard({ role, market, locale, maxSalary, matchPct }: { role: CareerRole; market: 'CN' | 'DE'; locale: 'en' | 'de' | 'zh'; maxSalary: number; matchPct: number }) {
  const [expanded, setExpanded] = useState(false);
  const title = locale === 'zh' ? role.title_zh : locale === 'de' ? role.title_de : role.title;
  const funcArea = locale === 'zh' ? role.function_area_zh : role.function_area;
  const currency = market === 'CN' ? '¥' : '€';
  const unit = market === 'CN' ? '/月' : '/yr';

  const growthColor = role.growth_outlook === 'high' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : role.growth_outlook === 'medium' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{funcArea}</span>
            <MatchBadge match={matchPct} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${growthColor}`}>
              {role.growth_outlook === 'high' ? '🔥' : role.growth_outlook === 'medium' ? '→' : '↓'}
            </span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {/* Mini bar chart */}
        <div className="flex items-end gap-[3px] h-8">
          {role.levels.map((lv, i) => {
            const salary = market === 'CN' ? lv.salary_cn : lv.salary_de;
            const height = (salary.mid / maxSalary) * 100;
            const colors = ['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'];
            return (
              <div key={lv.level} className="flex-1 flex flex-col items-center">
                <span className="text-[8px] font-mono text-slate-400 mb-0.5">{currency}{salary.mid}K</span>
                <div className="w-full rounded-t-sm" style={{ height: `${Math.max(height * 0.32, 3)}px`, background: colors[i] }} />
              </div>
            );
          })}
        </div>
        <div className="flex gap-0 mt-0.5">
          {LEVELS.map(l => (
            <span key={l} className="flex-1 text-center text-[8px] text-slate-400">
              {locale === 'zh' ? LEVEL_LABELS[l].zh : LEVEL_LABELS[l].en}
            </span>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{locale === 'zh' ? '核心技能' : 'Core Skills'}</span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {role.core_skills.map(s => (
                <span key={s} className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700 border border-blue-200">{s}</span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[90px_1fr_auto] gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>{locale === 'zh' ? '级别' : 'Level'}</span>
              <span>{locale === 'zh' ? '薪资范围' : 'Salary'} ({currency}K{unit})</span>
              <span>{locale === 'zh' ? '经验' : 'Exp'}</span>
            </div>
            {role.levels.map(lv => {
              const salary = market === 'CN' ? lv.salary_cn : lv.salary_de;
              const levelLabel = locale === 'zh' ? lv.level_zh : locale === 'de' ? lv.level_de : LEVEL_LABELS[lv.level].en;
              return (
                <div key={lv.level}>
                  <div className="grid grid-cols-[90px_1fr_auto] gap-2 items-center">
                    <span className="text-xs font-medium text-slate-800">{levelLabel}</span>
                    <SalaryBar low={salary.low} mid={salary.mid} high={salary.high} max={maxSalary} currency={currency} />
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{lv.years_experience}y</span>
                  </div>
                  <div className="ml-[90px] pl-2 mt-0.5 mb-1">
                    <span className="text-[10px] text-slate-400">{lv.key_skills.join(' · ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Industry Hub (SVG radial map) ─── */
function IndustryHub({ industries, locale, onSelect, matchMap }: {
  industries: IndustryCareerMap[];
  locale: 'en' | 'de' | 'zh';
  onSelect: (id: string) => void;
  matchMap: Map<string, number>;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const cx = 300, cy = 280, outerR = 220, innerR = 70;

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 600 560" className="w-full max-w-[600px]">
        {/* Center hub */}
        <circle cx={cx} cy={cy} r={innerR} fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2" />
        <text x={cx} y={cy - 14} textAnchor="middle" fill="#1e40af" fontSize="13" fontWeight="700">
          {locale === 'zh' ? '高端制造' : 'Advanced'}
        </text>
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#1e40af" fontSize="13" fontWeight="700">
          {locale === 'zh' ? '行业图谱' : 'Manufacturing'}
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" fill="#3b82f6" fontSize="10">
          {locale === 'zh' ? `${industries.length}个行业 · 2026` : `${industries.length} Industries · 2026`}
        </text>

        {/* Industry nodes */}
        {industries.map((ind, i) => {
          const angle = (Math.PI * 2 * i) / industries.length - Math.PI / 2;
          const nx = cx + outerR * Math.cos(angle);
          const ny = cy + outerR * Math.sin(angle);
          const isHovered = hovered === ind.id;
          const nodeR = isHovered ? 52 : 46;
          const name = locale === 'zh' ? ind.name_zh : locale === 'de' ? ind.name_de : ind.name;
          const shortName = name.length > 8 ? name.slice(0, 7) + '…' : name;
          const match = matchMap.get(ind.id) || 0;

          // Sub-categories
          const subs = ind.sub_categories || [];
          const subR = 78;

          return (
            <g key={ind.id}>
              {/* Connection line */}
              <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={isHovered ? '#3b82f6' : '#e2e8f0'} strokeWidth={isHovered ? 2 : 1} strokeDasharray={isHovered ? '' : '4 4'} />

              {/* Sub-category nodes (only when hovered) */}
              {isHovered && subs.map((sub, si) => {
                const subAngle = angle + ((si - (subs.length - 1) / 2) * 0.35);
                const sx = nx + subR * Math.cos(subAngle);
                const sy = ny + subR * Math.sin(subAngle);
                const subName = locale === 'zh' ? sub.name_zh : locale === 'de' ? sub.name_de : sub.name;
                return (
                  <g key={sub.name}>
                    <line x1={nx} y1={ny} x2={sx} y2={sy} stroke="#93c5fd" strokeWidth="1" />
                    <circle cx={sx} cy={sy} r={22} fill="#eff6ff" stroke="#93c5fd" strokeWidth="1" />
                    <text x={sx} y={sy - 5} textAnchor="middle" fill="#1e40af" fontSize="11">{sub.icon}</text>
                    <text x={sx} y={sy + 9} textAnchor="middle" fill="#475569" fontSize="7" fontWeight="500">
                      {subName.length > 6 ? subName.slice(0, 5) + '…' : subName}
                    </text>
                  </g>
                );
              })}

              {/* Main industry node */}
              <g className="cursor-pointer" onClick={() => onSelect(ind.id)}
                onMouseEnter={() => setHovered(ind.id)} onMouseLeave={() => setHovered(null)}>
                <circle cx={nx} cy={ny} r={nodeR} fill={isHovered ? '#dbeafe' : 'white'}
                  stroke={isHovered ? '#3b82f6' : '#cbd5e1'} strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{ transition: 'all 0.2s' }} />
                <text x={nx} y={ny - 10} textAnchor="middle" fontSize="20">{ind.icon}</text>
                <text x={nx} y={ny + 8} textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="600">
                  {shortName}
                </text>
                {match > 0 ? (
                  <text x={nx} y={ny + 20} textAnchor="middle" fill={match >= 40 ? '#059669' : match >= 20 ? '#d97706' : '#6b7280'} fontSize="8" fontWeight="700">
                    {match}% match
                  </text>
                ) : (
                  <text x={nx} y={ny + 20} textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="700">
                    #{ind.ranking_2026}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Main Page ─── */
export default function IndustriesPageWrapper() {
  return (
    <Suspense>
      <IndustriesPage />
    </Suspense>
  );
}

function IndustriesPage() {
  const { locale } = useLocale();
  const { userSkills } = useSkills();
  const searchParams = useSearchParams();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [market, setMarket] = useState<'CN' | 'DE'>('CN');

  // Handle ?focus= query param from landing page
  useEffect(() => {
    const focus = searchParams.get('focus');
    if (focus && allIndustries.some(i => i.id === focus)) {
      setSelectedIndustry(focus);
    }
  }, [searchParams]);

  const industry = selectedIndustry ? allIndustries.find(i => i.id === selectedIndustry) : null;

  // Industry match map (for SVG hub and cards)
  const industryMatchMap = useMemo(() => {
    const map = new Map<string, number>();
    if (userSkills.length === 0) return map;
    for (const ind of allIndustries) {
      map.set(ind.id, calcIndustryMatch(userSkills, ind));
    }
    return map;
  }, [userSkills]);

  // Role match cache for selected industry
  const roleMatchMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!industry || userSkills.length === 0) return map;
    for (const role of industry.roles) {
      map.set(role.id, calcRoleMatch(userSkills, role));
    }
    return map;
  }, [industry, userSkills]);

  const maxSalary = industry
    ? Math.max(...industry.roles.flatMap(r => r.levels.map(l => market === 'CN' ? l.salary_cn.high : l.salary_de.high)))
    : 0;

  // Sort roles: by match% (desc) if user has skills, else by director salary
  const sortedRoles = useMemo(() => {
    if (!industry) return [];
    return [...industry.roles].sort((a, b) => {
      if (userSkills.length > 0) {
        const matchDiff = (roleMatchMap.get(b.id) || 0) - (roleMatchMap.get(a.id) || 0);
        if (matchDiff !== 0) return matchDiff;
      }
      const aMax = market === 'CN' ? a.levels[4].salary_cn.mid : a.levels[4].salary_de.mid;
      const bMax = market === 'CN' ? b.levels[4].salary_cn.mid : b.levels[4].salary_de.mid;
      return bMax - aMax;
    });
  }, [industry, userSkills, roleMatchMap, market]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">

        {!selectedIndustry ? (
          <>
            {/* Hero */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {locale === 'zh' ? '高端制造业 · 行业图谱' : locale === 'de' ? 'Hightech-Fertigung · Branchenlandkarte' : 'Advanced Manufacturing · Industry Map'}
              </h1>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm">
                {locale === 'zh'
                  ? '2026年全球高收入工程行业排名 — 选择行业，查看每个岗位从初级到总监的完整薪资阶梯'
                  : locale === 'de'
                    ? 'Top-Ingenieurbranchen 2026 — Wählen Sie eine Branche für vollständige Karrierestufen und Gehälter'
                    : '2026 Top Engineering Industries — Select an industry to see complete career ladders from Junior to Director'}
              </p>
              {userSkills.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  {locale === 'zh'
                    ? `✓ 已识别 ${userSkills.length} 项技能 — 行业匹配度已根据你的技能计算`
                    : `✓ ${userSkills.length} skills detected — industry match % calculated from your profile`}
                </p>
              )}
            </div>

            {/* SVG Industry Map */}
            <IndustryHub industries={allIndustries} locale={locale} onSelect={setSelectedIndustry} matchMap={industryMatchMap} />

            {/* Industry cards grid below the map */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
              {[...allIndustries]
                .sort((a, b) => {
                  // Sort by match if available, otherwise by ranking
                  if (userSkills.length > 0) {
                    const matchDiff = (industryMatchMap.get(b.id) || 0) - (industryMatchMap.get(a.id) || 0);
                    if (matchDiff !== 0) return matchDiff;
                  }
                  return a.ranking_2026 - b.ranking_2026;
                })
                .map(ind => {
                  const name = locale === 'zh' ? ind.name_zh : locale === 'de' ? ind.name_de : ind.name;
                  const match = industryMatchMap.get(ind.id) || 0;
                  return (
                    <button key={ind.id} onClick={() => setSelectedIndustry(ind.id)}
                      className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{ind.icon}</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">#{ind.ranking_2026}</span>
                        </div>
                        {match > 0 && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${match >= 40 ? 'text-emerald-700 bg-emerald-50' : match >= 20 ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-100'}`}>
                            {match}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-mono text-blue-600">¥{ind.avg_salary_cn}K<span className="text-slate-400 font-normal">/月</span></span>
                        <span className="font-mono text-blue-600">€{ind.avg_salary_de}K<span className="text-slate-400 font-normal">/yr</span></span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1.5">
                        {ind.roles.length} {locale === 'zh' ? '岗位' : 'roles'} · {ind.sub_categories?.length || 0} {locale === 'zh' ? '子领域' : 'sub-sectors'}
                      </div>
                    </button>
                  );
                })}
            </div>
          </>
        ) : industry && (
          <>
            {/* Back */}
            <button onClick={() => setSelectedIndustry(null)} className="text-xs text-blue-600 hover:underline mb-5 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {locale === 'zh' ? '返回行业图谱' : 'Back to Industry Map'}
            </button>

            {/* Industry header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-5xl">{industry.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {locale === 'zh' ? industry.name_zh : locale === 'de' ? industry.name_de : industry.name}
                    </h1>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      #{industry.ranking_2026} {locale === 'zh' ? '高薪排名' : 'Salary Rank'}
                    </span>
                    {(industryMatchMap.get(industry.id) || 0) > 0 && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        (industryMatchMap.get(industry.id) || 0) >= 40
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        {industryMatchMap.get(industry.id)}% {locale === 'zh' ? '技能匹配' : 'Skill Match'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-3 max-w-2xl">
                    {locale === 'zh' ? industry.description_zh : locale === 'de' ? industry.description_de : industry.description}
                  </p>
                  {/* Sub-categories */}
                  {industry.sub_categories && industry.sub_categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {industry.sub_categories.map(sub => (
                        <span key={sub.name} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                          {sub.icon} {locale === 'zh' ? sub.name_zh : locale === 'de' ? sub.name_de : sub.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Benefits */}
                  <div className="flex flex-wrap gap-1.5">
                    {(locale === 'zh' ? industry.top_benefits_zh : industry.top_benefits).map(b => (
                      <span key={b} className="px-2 py-0.5 text-[10px] text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">✓ {b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Market switch */}
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5">
                {(['CN', 'DE'] as const).map(m => (
                  <button key={m} onClick={() => setMarket(m)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${market === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                    {m === 'CN' ? '🇨🇳 China (¥/月)' : '🇩🇪 Germany (€/年)'}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400">
                {industry.roles.length} {locale === 'zh' ? '个岗位' : 'roles'} × 5 {locale === 'zh' ? '个级别' : 'levels'}
              </span>
            </div>

            {/* Salary overview chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                {locale === 'zh' ? '薪资全景 — 初级到总监' : 'Salary Overview — Junior to Director'}
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                {userSkills.length > 0
                  ? (locale === 'zh' ? '按你的技能匹配度排序 · 横条显示从初级到总监的中位薪资' : 'Sorted by your skill match · Bars show median salary from Junior to Director')
                  : (locale === 'zh' ? '横条显示每个岗位从初级(左)到总监(右)的中位薪资范围' : 'Bars show median salary range from Junior (left) to Director (right)')
                }
              </p>
              <div className="space-y-2">
                {sortedRoles.map(role => {
                  const juniorMid = market === 'CN' ? role.levels[0].salary_cn.mid : role.levels[0].salary_de.mid;
                  const directorMid = market === 'CN' ? role.levels[4].salary_cn.mid : role.levels[4].salary_de.mid;
                  const title = locale === 'zh' ? role.title_zh : locale === 'de' ? role.title_de : role.title;
                  const currency = market === 'CN' ? '¥' : '€';
                  const pctJunior = (juniorMid / maxSalary) * 100;
                  const pctDirector = (directorMid / maxSalary) * 100;
                  const growthDot = role.growth_outlook === 'high' ? '🔥' : '';
                  const roleMatch = roleMatchMap.get(role.id) || 0;

                  return (
                    <div key={role.id} className="flex items-center gap-3">
                      <span className="text-xs text-slate-700 w-36 shrink-0 truncate font-medium">{growthDot}{title}</span>
                      {roleMatch > 0 && (
                        <span className={`text-[10px] font-bold w-10 shrink-0 text-right ${roleMatch >= 40 ? 'text-emerald-600' : roleMatch >= 20 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {roleMatch}%
                        </span>
                      )}
                      <div className="flex-1 relative h-6 bg-slate-100 rounded">
                        <div className="absolute top-0 h-full rounded bg-gradient-to-r from-blue-200 to-blue-500"
                          style={{ left: `${pctJunior}%`, width: `${pctDirector - pctJunior}%` }} />
                        <div className="absolute top-0 h-full flex items-center text-[10px] font-mono" style={{ left: `${pctJunior}%` }}>
                          <span className="text-slate-500 ml-1">{currency}{juniorMid}K</span>
                        </div>
                        <div className="absolute top-0 h-full flex items-center justify-end text-[10px] font-mono" style={{ left: '0', width: `${pctDirector}%` }}>
                          <span className="text-blue-800 font-bold mr-1">{currency}{directorMid}K</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 ml-36 pl-3">
                <span>{locale === 'zh' ? '← 初级' : '← Junior'}</span>
                <span>{locale === 'zh' ? '总监 →' : 'Director →'}</span>
              </div>
            </div>

            {/* Role cards */}
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              {locale === 'zh' ? '岗位详情 — 点击展开完整薪资阶梯' : 'Role Details — Click to expand full salary ladder'}
              {userSkills.length > 0 && (
                <span className="text-[11px] text-blue-600 font-normal ml-2">
                  ({locale === 'zh' ? '按匹配度排序' : 'sorted by match %'})
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedRoles.map(role => (
                <RoleCard key={role.id} role={role} market={market} locale={locale} maxSalary={maxSalary} matchPct={roleMatchMap.get(role.id) || 0} />
              ))}
            </div>
          </>
        )}

        <footer className="mt-16 py-6 border-t border-slate-200 text-center text-xs text-slate-400">
          {t(locale, 'footer')}
        </footer>
      </main>
    </div>
  );
}
