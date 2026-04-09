'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { useCart } from '@/lib/cart-context';
import { calcRoleMatch, calcIndustryMatch } from '@/lib/resume-parser';
import { t } from '@/lib/i18n';
import { allIndustries } from '@/lib/career-map';
import { mockNews } from '@/lib/ai/mock-signals';
import type { IndustryCareerMap, CareerRole, CareerLevel } from '@/lib/career-map';
import { getRoleDataLinks } from '@/lib/data-sources';
import { getEntgeltatlasUrl } from '@/lib/data-sources';
import { SalaryDistribution } from '@/components/ui/SalaryDistribution';
import { ArbitrageMap } from '@/components/ArbitrageMap';
import { TransitionStories } from '@/components/TransitionStories';
import { chinaJobs } from '@/lib/jobs-cn';
import { germanyJobs } from '@/lib/jobs-de';
import type { Job } from '@/lib/data';

/* ─── BLS inline data type ─── */
interface BLSInline {
  annual_mean: number;
  annual_median: number;
  annual_10th: number;
  annual_25th: number;
  annual_75th: number;
  annual_90th: number;
  employment: number;
  url: string;
}

const LEVEL_LABELS: Record<CareerLevel, { en: string; zh: string; de: string }> = {
  junior: { en: 'Junior', zh: '初级', de: 'Junior' },
  senior: { en: 'Senior', zh: '高级', de: 'Senior' },
  lead: { en: 'Lead', zh: '主管', de: 'Teamleiter' },
  manager: { en: 'Manager', zh: '经理', de: 'Manager' },
  director: { en: 'Director', zh: '总监', de: 'Direktor' },
};

const LEVELS: CareerLevel[] = ['junior', 'senior', 'lead', 'manager', 'director'];

function matchColor(m: number): string {
  return m >= 60 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : m >= 40 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : m >= 20 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-slate-500 bg-slate-50 border-slate-200';
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

/* ─── Job Search Links ─── */
function JobSearchLinks({ role, locale }: { role: CareerRole; locale: string }) {
  const title = encodeURIComponent(locale === 'de' ? role.title_de : role.title);
  return (
    <div className="flex gap-2 mt-2">
      <a href={`https://www.linkedin.com/jobs/search/?keywords=${title}`} target="_blank" rel="noopener noreferrer"
        className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
        LinkedIn Jobs
      </a>
      <a href={`https://www.indeed.com/jobs?q=${title}`} target="_blank" rel="noopener noreferrer"
        className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors">
        Indeed
      </a>
      <a href={`https://www.stepstone.de/jobs/${encodeURIComponent(role.title_de)}`} target="_blank" rel="noopener noreferrer"
        className="text-[10px] px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors">
        StepStone
      </a>
    </div>
  );
}

/* ─── Cart Button ─── */
function CartButton({ role, industryId }: { role: CareerRole; industryId: string }) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(role.id);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); inCart ? removeFromCart(role.id) : addToCart(role.id, industryId); }}
      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
        inCart
          ? 'bg-blue-600 text-white shadow-sm hover:bg-red-500'
          : 'bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600 border border-slate-200'
      }`}
      title={inCart ? 'Remove from plan' : 'Add to plan'}
    >
      {inCart ? '✓' : '+'}
    </button>
  );
}

/* ─── Role Card ─── */
function RoleCard({ role, industryId, market, locale, maxSalary, matchPct, userSkills }: {
  role: CareerRole; industryId: string; market: 'CN' | 'DE'; locale: 'en' | 'de' | 'zh'; maxSalary: number; matchPct: number; userSkills: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [blsData, setBlsData] = useState<BLSInline | null>(null);
  const [blsLoading, setBlsLoading] = useState(false);
  const isZh = locale === 'zh';
  const title = isZh ? role.title_zh : locale === 'de' ? role.title_de : role.title;
  const funcArea = isZh ? role.function_area_zh : role.function_area;

  // Fetch BLS data when expanded
  useEffect(() => {
    if (!expanded || blsData || blsLoading) return;
    setBlsLoading(true);
    fetch(`/api/data/bls?soc=${role.soc_code}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) setBlsData({
          annual_mean: d.data.annual_mean,
          annual_median: d.data.annual_median,
          annual_10th: d.data.annual_10th,
          annual_25th: d.data.annual_25th ?? d.data.annual_10th,
          annual_75th: d.data.annual_75th ?? d.data.annual_90th,
          annual_90th: d.data.annual_90th,
          employment: d.data.employment,
          url: d.data.attribution?.url || '',
        });
      })
      .catch(() => {})
      .finally(() => setBlsLoading(false));
  }, [expanded, blsData, blsLoading, role.soc_code]);
  const currency = market === 'CN' ? '¥' : '€';
  const unit = market === 'CN' ? '/月' : '/yr';

  const allRoleSkills = [...new Set([...role.core_skills, ...role.levels.flatMap(l => l.key_skills)])];
  const userLower = userSkills.map(s => s.toLowerCase());
  const haveSkills = allRoleSkills.filter(s => userLower.some(us => us.includes(s.toLowerCase()) || s.toLowerCase().includes(us)));
  const missingSkills = allRoleSkills.filter(s => !haveSkills.includes(s));

  const growthColor = role.growth_outlook === 'high' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : role.growth_outlook === 'medium' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 p-4">
        <button onClick={() => setExpanded(!expanded)} className="flex-1 text-left hover:bg-slate-50 transition-colors -m-4 p-4 pr-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{funcArea}</span>
              {matchPct > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${matchColor(matchPct)}`}>
                  {matchPct}%
                </span>
              )}
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
          {/* Percentile distribution bar — career salary trajectory */}
          {(() => {
            const salaries = role.levels.map(lv => market === 'CN' ? lv.salary_cn : lv.salary_de);
            // Map career levels to percentiles: junior.low→P10, junior.mid→P25, lead.mid→P50, manager.mid→P75, director.high→P90
            const p10 = salaries[0].low;
            const p25 = salaries[0].mid;
            const med = salaries[2].mid;   // lead level
            const p75 = salaries[3].mid;   // manager level
            const p90 = salaries[4].high;  // director high
            return (
              <SalaryDistribution
                data={[{ p10, p25, median: med, p75, p90, currency, unit: market === 'CN' ? 'K/月' : 'K/yr' }]}
                compact
              />
            );
          })()}
          <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-0.5">
            <span>{isZh ? '初级' : 'Jr'}</span>
            <span>{isZh ? '主管' : 'Lead'}</span>
            <span>{isZh ? '总监' : 'Dir'}</span>
          </div>
        </button>
        {/* Cart button */}
        <CartButton role={role} industryId={industryId} />
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
          {userSkills.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                  ✓ {isZh ? '你已具备' : 'You have'} ({haveSkills.length})
                </span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {haveSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{s}</span>
                  ))}
                  {haveSkills.length === 0 && <span className="text-[10px] text-slate-400">—</span>}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">
                  ✗ {isZh ? '补上即可入行' : 'Skills to learn'} ({missingSkills.length})
                </span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {missingSkills.slice(0, 8).map(s => (
                    <span key={s} className="px-2 py-0.5 text-[10px] rounded-full bg-red-50 text-red-600 border border-red-200">
                      {s}
                    </span>
                  ))}
                  {missingSkills.length > 8 && <span className="text-[10px] text-slate-400">+{missingSkills.length - 8}</span>}
                </div>
              </div>
            </div>
          )}

          {userSkills.length === 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{isZh ? '核心技能' : 'Core Skills'}</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {role.core_skills.map(s => (
                  <span key={s} className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700 border border-blue-200">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="grid grid-cols-[90px_1fr_auto] gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>{isZh ? '级别' : 'Level'}</span>
              <span>{isZh ? '薪资分布' : 'Salary Distribution'} <span className="font-normal text-slate-400">P25 · P50 · P75</span></span>
              <span>{isZh ? '经验' : 'Exp'}</span>
            </div>
            {role.levels.map(lv => {
              const salary = market === 'CN' ? lv.salary_cn : lv.salary_de;
              const levelLabel = isZh ? lv.level_zh : locale === 'de' ? lv.level_de : LEVEL_LABELS[lv.level].en;
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

          {/* ─── Global Benchmark Panel ─── */}
          <div className="bg-white border border-blue-100 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                {isZh ? '全球数据对标' : locale === 'de' ? 'Globaler Datenvergleich' : 'Global Benchmark'}
              </span>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <span className="font-mono">SOC {role.soc_code}</span>
                <span>·</span>
                <span className="font-mono">KldB {role.kldb_code}</span>
              </div>
            </div>

            {/* BLS US salary — real data */}
            <div className="flex items-stretch gap-2">
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs">🇺🇸</span>
                  <span className="text-[10px] font-bold text-blue-900">US BLS</span>
                  {blsLoading && <span className="text-[9px] text-blue-400 animate-pulse">loading...</span>}
                </div>
                {blsData ? (
                  <div>
                    <div className="text-lg font-bold text-blue-900 font-mono">${(blsData.annual_median / 1000).toFixed(0)}K<span className="text-[10px] font-normal text-blue-500">/yr median</span></div>
                    <div className="mt-2">
                      <SalaryDistribution data={[{
                        p10: Math.round(blsData.annual_10th / 1000),
                        p25: Math.round(blsData.annual_25th / 1000),
                        median: Math.round(blsData.annual_median / 1000),
                        p75: Math.round(blsData.annual_75th / 1000),
                        p90: Math.round(blsData.annual_90th / 1000),
                        currency: '$',
                        unit: 'K/yr',
                      }]} compact />
                    </div>
                    <div className="text-[10px] text-blue-500 mt-1.5 font-mono">
                      {(blsData.employment / 1000).toFixed(0)}K {isZh ? '就业' : 'employed'}
                    </div>
                  </div>
                ) : !blsLoading ? (
                  <div className="text-[10px] text-blue-400">{isZh ? '无数据' : 'No data available'}</div>
                ) : null}
              </div>

              <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs">🇩🇪</span>
                  <span className="text-[10px] font-bold text-emerald-900">BA Entgeltatlas</span>
                </div>
                <a href={getEntgeltatlasUrl(role.kldb_code)} target="_blank" rel="noopener noreferrer"
                  className="block">
                  <div className="text-sm font-bold text-emerald-800">
                    {isZh ? '查看德国官方薪资' : locale === 'de' ? 'Offizielle Gehaltsdaten' : 'View official DE salary'}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">
                    KldB {role.kldb_code} · {isZh ? '含地区/性别/年龄分布' : 'by region, gender, age'}
                  </div>
                  <div className="text-[9px] text-emerald-400 mt-1 hover:underline">
                    entgeltatlas.arbeitsagentur.de →
                  </div>
                </a>
              </div>
            </div>

            {/* Quick links row */}
            <div className="flex flex-wrap gap-1.5">
              {Object.values(getRoleDataLinks(role.soc_code, role.kldb_code)).map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium bg-slate-50 border border-slate-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors text-slate-500 hover:text-blue-700">
                  <span>{link.icon}</span>
                  <span>{isZh ? link.label_zh : link.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{isZh ? '查看真实招聘' : 'Search Real Jobs'}</span>
            <JobSearchLinks role={role} locale={locale} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Signal Sidebar ─── */
function SignalSidebar({ industryId, locale }: { industryId: string; locale: string }) {
  const isZh = locale === 'zh';
  const relevant = mockNews.filter(n => n.impacts.some(i => i.industry_id === industryId)).slice(0, 3);
  if (relevant.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <h4 className="text-xs font-semibold text-slate-900 mb-3">
        {isZh ? '相关市场信号' : 'Related Market Signals'}
      </h4>
      <div className="space-y-3">
        {relevant.map(news => {
          const impact = news.impacts.find(i => i.industry_id === industryId)!;
          return (
            <div key={news.id} className="border-l-2 pl-3" style={{
              borderColor: impact.direction === 'positive' ? '#10b981' : impact.direction === 'negative' ? '#ef4444' : '#6b7280'
            }}>
              <div className="text-[10px] text-slate-400 mb-0.5">{news.date} · {news.source}</div>
              <div className="text-xs font-medium text-slate-800 mb-1">{isZh ? news.headline_zh : news.headline}</div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold ${impact.direction === 'positive' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {impact.direction === 'positive' ? '↑' : '↓'}{impact.magnitude}%
                </span>
                <span className="text-[10px] text-slate-500">{isZh ? impact.reason_zh : impact.reason}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Industry Hub SVG ─── */
function IndustryHub({ industries, locale, onSelect, matchMap }: {
  industries: IndustryCareerMap[];
  locale: 'en' | 'de' | 'zh';
  onSelect: (id: string) => void;
  matchMap: Map<string, number>;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const cx = 300, cy = 280, outerR = 220, innerR = 70;
  const isZh = locale === 'zh';

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 600 560" className="w-full max-w-[600px]">
        <circle cx={cx} cy={cy} r={innerR} fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2" />
        <text x={cx} y={cy - 14} textAnchor="middle" fill="#1e40af" fontSize="13" fontWeight="700">
          {isZh ? '高端制造' : 'Advanced'}
        </text>
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#1e40af" fontSize="13" fontWeight="700">
          {isZh ? '行业图谱' : 'Manufacturing'}
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" fill="#3b82f6" fontSize="10">
          {isZh ? `${industries.length}个行业 · 2026` : `${industries.length} Industries · 2026`}
        </text>

        {industries.map((ind, i) => {
          const angle = (Math.PI * 2 * i) / industries.length - Math.PI / 2;
          const nx = cx + outerR * Math.cos(angle);
          const ny = cy + outerR * Math.sin(angle);
          const isHov = hovered === ind.id;
          const nodeR = isHov ? 52 : 46;
          const name = isZh ? ind.name_zh : locale === 'de' ? ind.name_de : ind.name;
          const shortName = name.length > 8 ? name.slice(0, 7) + '...' : name;
          const match = matchMap.get(ind.id) || 0;
          const subs = ind.sub_categories || [];
          const subR = 78;

          return (
            <g key={ind.id}>
              <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={isHov ? '#3b82f6' : '#e2e8f0'} strokeWidth={isHov ? 2 : 1} strokeDasharray={isHov ? '' : '4 4'} />
              {isHov && subs.map((sub, si) => {
                const subAngle = angle + ((si - (subs.length - 1) / 2) * 0.35);
                const sx = nx + subR * Math.cos(subAngle);
                const sy = ny + subR * Math.sin(subAngle);
                const subName = isZh ? sub.name_zh : locale === 'de' ? sub.name_de : sub.name;
                return (
                  <g key={sub.name}>
                    <line x1={nx} y1={ny} x2={sx} y2={sy} stroke="#93c5fd" strokeWidth="1" />
                    <circle cx={sx} cy={sy} r={22} fill="#eff6ff" stroke="#93c5fd" strokeWidth="1" />
                    <text x={sx} y={sy - 5} textAnchor="middle" fill="#1e40af" fontSize="11">{sub.icon}</text>
                    <text x={sx} y={sy + 9} textAnchor="middle" fill="#475569" fontSize="7" fontWeight="500">
                      {subName.length > 6 ? subName.slice(0, 5) + '...' : subName}
                    </text>
                  </g>
                );
              })}
              <g className="cursor-pointer" onClick={() => onSelect(ind.id)}
                onMouseEnter={() => setHovered(ind.id)} onMouseLeave={() => setHovered(null)}>
                <circle cx={nx} cy={ny} r={nodeR} fill={isHov ? '#dbeafe' : 'white'}
                  stroke={isHov ? '#3b82f6' : '#cbd5e1'} strokeWidth={isHov ? 2.5 : 1.5}
                  style={{ transition: 'all 0.2s' }} />
                <text x={nx} y={ny - 10} textAnchor="middle" fontSize="20">{ind.icon}</text>
                <text x={nx} y={ny + 8} textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="600">{shortName}</text>
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

/* ─── Floating Cart Bar ─── */
function FloatingCartBar({ locale }: { locale: string }) {
  const { cart } = useCart();
  const router = useRouter();
  const isZh = locale === 'zh';

  if (cart.length === 0) return null;

  const roleNames = cart.slice(0, 3).map(c => {
    for (const ind of allIndustries) {
      const role = ind.roles.find(r => r.id === c.roleId);
      if (role) return isZh ? role.title_zh : role.title;
    }
    return '?';
  });

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-blue-200 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-blue-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
            {cart.length}
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {isZh ? '已选目标岗位' : 'Target roles selected'}
            </div>
            <div className="text-xs text-slate-500 truncate max-w-[300px]">
              {roleNames.join(', ')}{cart.length > 3 ? ` +${cart.length - 3}` : ''}
            </div>
          </div>
        </div>
        <button onClick={() => router.push('/plan')}
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm">
          {isZh ? '制定行动计划 →' : locale === 'de' ? 'Aktionsplan erstellen →' : 'Build Action Plan →'}
        </button>
      </div>
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
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'growth'>('match');
  const [showArbitrage, setShowArbitrage] = useState(false);
  const isZh = locale === 'zh';

  // All jobs for the scatter plot
  const allJobs: Job[] = useMemo(() => [...chinaJobs, ...germanyJobs], []);

  useEffect(() => {
    const focus = searchParams.get('focus');
    if (focus && allIndustries.some(i => i.id === focus)) setSelectedIndustry(focus);
  }, [searchParams]);

  const industry = selectedIndustry ? allIndustries.find(i => i.id === selectedIndustry) : null;

  const industryMatchMap = useMemo(() => {
    const map = new Map<string, number>();
    if (userSkills.length === 0) return map;
    for (const ind of allIndustries) map.set(ind.id, calcIndustryMatch(userSkills, ind));
    return map;
  }, [userSkills]);

  const roleMatchMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!industry || userSkills.length === 0) return map;
    for (const role of industry.roles) map.set(role.id, calcRoleMatch(userSkills, role));
    return map;
  }, [industry, userSkills]);

  const maxSalary = industry
    ? Math.max(...industry.roles.flatMap(r => r.levels.map(l => market === 'CN' ? l.salary_cn.high : l.salary_de.high)))
    : 0;

  const sortedRoles = useMemo(() => {
    if (!industry) return [];
    return [...industry.roles].sort((a, b) => {
      if (sortBy === 'match' && userSkills.length > 0) {
        const d = (roleMatchMap.get(b.id) || 0) - (roleMatchMap.get(a.id) || 0);
        if (d !== 0) return d;
      }
      if (sortBy === 'growth') {
        const gv = { high: 3, medium: 2, low: 1 };
        const d = gv[b.growth_outlook] - gv[a.growth_outlook];
        if (d !== 0) return d;
      }
      const aMax = market === 'CN' ? a.levels[4].salary_cn.mid : a.levels[4].salary_de.mid;
      const bMax = market === 'CN' ? b.levels[4].salary_cn.mid : b.levels[4].salary_de.mid;
      return bMax - aMax;
    });
  }, [industry, userSkills, roleMatchMap, market, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">

        {!selectedIndustry ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                {isZh ? '去哪里？' : locale === 'de' ? 'Wohin?' : 'Where To Go?'}
              </h1>
              <p className="text-sm text-blue-600 font-medium mb-2">
                {isZh ? '高端制造业 · 行业图谱' : 'Advanced Manufacturing · Industry Map'}
              </p>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm">
                {isZh ? '浏览行业和岗位，将目标岗位加入购物车，生成精准行动计划'
                  : 'Browse industries and roles. Add target roles to your cart, then build a precise action plan.'}
              </p>
              {userSkills.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  ✓ {userSkills.length} {isZh ? '项技能已识别 — 匹配度已计算' : 'skills detected — match % calculated'}
                </p>
              )}
            </div>

            <IndustryHub industries={allIndustries} locale={locale} onSelect={setSelectedIndustry} matchMap={industryMatchMap} />

            {/* Arbitrage Map — global scatter plot */}
            <div className="mt-8 mb-6">
              <button
                onClick={() => setShowArbitrage(!showArbitrage)}
                className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-3 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📊</span>
                  <div className="text-left">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                      {isZh ? '职业套利象限图' : 'Career Arbitrage Map'}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {isZh ? '用供需张力×薪资定位最优岗位 — 200个岗位的风险溢价分析' : 'Position optimal roles by demand tension × salary — risk premium analysis of 200 roles'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Market toggle */}
                  <div className="inline-flex bg-slate-100 rounded-lg p-0.5" onClick={e => e.stopPropagation()}>
                    {(['CN', 'DE'] as const).map(m => (
                      <button key={m} onClick={() => setMarket(m)}
                        className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${market === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                        {m === 'CN' ? '🇨🇳 CN' : '🇩🇪 DE'}
                      </button>
                    ))}
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${showArbitrage ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showArbitrage && (
                <div className="mt-3">
                  <ArbitrageMap jobs={allJobs} locale={locale} market={market} />
                </div>
              )}
            </div>

            {/* Transition Stories */}
            <TransitionStories locale={locale} />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...allIndustries]
                .sort((a, b) => {
                  if (userSkills.length > 0) {
                    const d = (industryMatchMap.get(b.id) || 0) - (industryMatchMap.get(a.id) || 0);
                    if (d !== 0) return d;
                  }
                  return a.ranking_2026 - b.ranking_2026;
                })
                .map(ind => {
                  const name = isZh ? ind.name_zh : locale === 'de' ? ind.name_de : ind.name;
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
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${matchColor(match)}`}>{match}%</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-mono text-blue-600">¥{ind.avg_salary_cn}K<span className="text-slate-400 font-normal">/月</span></span>
                        <span className="font-mono text-blue-600">€{ind.avg_salary_de}K<span className="text-slate-400 font-normal">/yr</span></span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1.5">{ind.roles.length} {isZh ? '岗位' : 'roles'}</div>
                    </button>
                  );
                })}
            </div>
          </>
        ) : industry && (
          <>
            <button onClick={() => setSelectedIndustry(null)} className="text-xs text-blue-600 hover:underline mb-5 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {isZh ? '返回行业图谱' : 'Back to Industry Map'}
            </button>

            {/* Industry header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-5xl">{industry.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {isZh ? industry.name_zh : locale === 'de' ? industry.name_de : industry.name}
                    </h1>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      #{industry.ranking_2026}
                    </span>
                    {(industryMatchMap.get(industry.id) || 0) > 0 && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${matchColor(industryMatchMap.get(industry.id) || 0)}`}>
                        {industryMatchMap.get(industry.id)}% {isZh ? '技能匹配' : 'Skill Match'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-3 max-w-2xl">
                    {isZh ? industry.description_zh : locale === 'de' ? industry.description_de : industry.description}
                  </p>
                  {industry.sub_categories && industry.sub_categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {industry.sub_categories.map(sub => (
                        <span key={sub.name} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                          {sub.icon} {isZh ? sub.name_zh : locale === 'de' ? sub.name_de : sub.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {(isZh ? industry.top_benefits_zh : industry.top_benefits).map(b => (
                      <span key={b} className="px-2 py-0.5 text-[10px] text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">✓ {b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5">
                {(['CN', 'DE'] as const).map(m => (
                  <button key={m} onClick={() => setMarket(m)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${market === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                    {m === 'CN' ? '🇨🇳 ¥/月' : '🇩🇪 €/年'}
                  </button>
                ))}
              </div>
              {userSkills.length > 0 && (
                <div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5">
                  {([
                    { v: 'match' as const, l: isZh ? '匹配度↓' : 'Match↓' },
                    { v: 'salary' as const, l: isZh ? '薪资↓' : 'Salary↓' },
                    { v: 'growth' as const, l: isZh ? '增长前景' : 'Growth' },
                  ]).map(s => (
                    <button key={s.v} onClick={() => setSortBy(s.v)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortBy === s.v ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                      {s.l}
                    </button>
                  ))}
                </div>
              )}
              <span className="text-xs text-slate-400">
                {industry.roles.length} {isZh ? '个岗位' : 'roles'} × 5 {isZh ? '个级别' : 'levels'}
                {' · '}
                <span className="text-blue-600">{isZh ? '点击 + 加入计划' : 'Click + to add to plan'}</span>
              </span>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
              <div>
                {/* Salary overview */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    {isZh ? '薪资全景' : 'Salary Overview'}
                  </h3>
                  <div className="space-y-2">
                    {sortedRoles.map(role => {
                      const juniorMid = market === 'CN' ? role.levels[0].salary_cn.mid : role.levels[0].salary_de.mid;
                      const directorMid = market === 'CN' ? role.levels[4].salary_cn.mid : role.levels[4].salary_de.mid;
                      const title = isZh ? role.title_zh : locale === 'de' ? role.title_de : role.title;
                      const cur = market === 'CN' ? '¥' : '€';
                      const pctJ = (juniorMid / maxSalary) * 100;
                      const pctD = (directorMid / maxSalary) * 100;
                      const rm = roleMatchMap.get(role.id) || 0;

                      return (
                        <div key={role.id} className="flex items-center gap-2">
                          <span className="text-xs text-slate-700 w-32 shrink-0 truncate font-medium">
                            {role.growth_outlook === 'high' ? '🔥' : ''}{title}
                          </span>
                          {rm > 0 && <span className={`text-[10px] font-bold w-9 shrink-0 text-right ${rm >= 40 ? 'text-emerald-600' : rm >= 20 ? 'text-amber-600' : 'text-slate-400'}`}>{rm}%</span>}
                          <div className="flex-1 relative h-5 bg-slate-100 rounded">
                            <div className="absolute top-0 h-full rounded bg-gradient-to-r from-blue-200 to-blue-500"
                              style={{ left: `${pctJ}%`, width: `${pctD - pctJ}%` }} />
                            <div className="absolute top-0 h-full flex items-center text-[9px] font-mono" style={{ left: `${pctJ}%` }}>
                              <span className="text-slate-500 ml-0.5">{cur}{juniorMid}K</span>
                            </div>
                            <div className="absolute top-0 h-full flex items-center justify-end text-[9px] font-mono" style={{ left: '0', width: `${pctD}%` }}>
                              <span className="text-blue-800 font-bold mr-0.5">{cur}{directorMid}K</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Role cards */}
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  {isZh ? '岗位详情 — 展开查看薪资和技能差距，点击 + 加入计划' : 'Role Details — Expand for salary & skill gaps, click + to add to plan'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sortedRoles.map(role => (
                    <RoleCard key={role.id} role={role} industryId={industry.id} market={market} locale={locale} maxSalary={maxSalary}
                      matchPct={roleMatchMap.get(role.id) || 0} userSkills={userSkills} />
                  ))}
                </div>
              </div>

              {/* Signal sidebar */}
              <div className="space-y-4">
                <SignalSidebar industryId={industry.id} locale={locale} />
              </div>
            </div>
          </>
        )}

        <footer className="mt-16 py-6 border-t border-slate-200 text-center text-xs text-slate-400">
          {t(locale, 'footer')}
        </footer>
      </main>

      <FloatingCartBar locale={locale} />
    </div>
  );
}
