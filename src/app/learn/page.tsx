'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { industryToolMap, getToolMapByIndustry, getToolMapEntries, getAvailableIndustries } from '@/lib/toolmap';
import type { IndustryId, IndustryToolMapEntry } from '@/lib/toolmap';
import { allIndustries } from '@/lib/career-map';
import { calcRoleMatch } from '@/lib/resume-parser';
import { trackUrl } from '@/lib/tracking';

const INDUSTRY_LABELS: Record<IndustryId, { en: string; de: string; zh: string }> = {
  'common': { en: 'Common Manufacturing', de: 'Allgemeine Fertigung', zh: '通用制造' },
  'automotive': { en: 'Automotive', de: 'Automobil', zh: '汽车' },
  'electronics': { en: 'Electronics', de: 'Elektronik', zh: '电子/半导体' },
  'industrial-automation': { en: 'Industrial Automation', de: 'Industrieautomation', zh: '工业自动化' },
  'energy-equipment': { en: 'Energy Equipment', de: 'Energietechnik', zh: '能源装备' },
  'aerospace': { en: 'Aerospace', de: 'Luft- & Raumfahrt', zh: '航空航天' },
  'medical-devices': { en: 'Medical Devices', de: 'Medizintechnik', zh: '医疗器械' },
  'process-manufacturing': { en: 'Process Manufacturing', de: 'Prozessfertigung', zh: '流程制造' },
  'heavy-industry': { en: 'Heavy Industry', de: 'Schwerindustrie', zh: '重工业' },
  'consumer-electronics': { en: 'Consumer Electronics', de: 'Unterhaltungselektronik', zh: '消费电子' },
  'consulting': { en: 'Consulting', de: 'Beratung', zh: '咨询' },
};

function EntryCard({ entry, locale, highlight }: { entry: IndustryToolMapEntry; locale: 'en' | 'de' | 'zh'; highlight?: boolean }) {
  const [open, setOpen] = useState(!!highlight);
  const isZh = locale === 'zh';
  const skillLabel = isZh ? entry.skill_zh : entry.skill;
  const context = isZh ? entry.industry_context_zh : entry.industry_context;
  const tierColor = (tier: string) => tier === 'essential' ? 'text-red-600 bg-red-50 border-red-200' : tier === 'recommended' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-blue-600 bg-blue-50 border-blue-200';
  const tierLabel = (tier: string) => t(locale, tier === 'essential' ? 'essential' : tier === 'recommended' ? 'recommended' : 'emerging');
  const diffColor = (d: string) => d === 'beginner' ? 'text-emerald-600' : d === 'intermediate' ? 'text-amber-600' : 'text-red-600';

  return (
    <div id={`skill-${entry.skill.replace(/\s+/g, '-').toLowerCase()}`}
      className={`bg-white border rounded-xl overflow-hidden transition-colors ${highlight ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-200'}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">{skillLabel}</h3>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{context}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {entry.tools.slice(0, 3).map(tool => (
                <span key={tool.name} className={`px-2 py-0.5 text-[10px] rounded-full border ${tierColor(tool.tier)}`}>
                  {isZh ? tool.name_zh : tool.name}
                </span>
              ))}
              {entry.tools.length > 3 && <span className="text-[10px] text-slate-400">+{entry.tools.length - 3}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 ml-3">
            <div className="flex gap-1.5 text-[10px] text-slate-400">
              <span>{entry.tools.length} tools</span>
              <span>{entry.github_path.length} repos</span>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-3">
          {/* Industry Context */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <h4 className="text-[10px] font-semibold text-blue-800 mb-1">{t(locale, 'industry_context')}</h4>
            <p className="text-xs text-blue-700">{context}</p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">🔧 {t(locale, 'tools_section')}</h4>
            <div className="space-y-1.5">
              {entry.tools.map(tool => (
                <div key={tool.name} className="bg-slate-50 rounded-lg p-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <a href={trackUrl(tool.url, 'tool', entry.id)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                        {isZh ? tool.name_zh : tool.name}
                      </a>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded border ${tierColor(tool.tier)}`}>{tierLabel(tool.tier)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{tool.vendor}</div>
                  </div>
                  {tool.free_tier && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ {isZh ? '免费' : 'Free'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Training */}
          {entry.training.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">📚 {t(locale, 'training_section')}</h4>
              <div className="space-y-1.5">
                {entry.training.map(tr => (
                  <div key={tr.name} className="bg-slate-50 rounded-lg p-2.5">
                    <a href={trackUrl(tr.url, 'training', entry.id)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                      {isZh ? tr.name_zh : tr.name}
                    </a>
                    <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="text-blue-600 font-medium">{tr.price_range}</span>
                      <span>{tr.format}</span>
                      <span>{tr.region}</span>
                      {tr.certification && <span className="text-amber-600">🏅 {tr.certification}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Path */}
          {entry.github_path.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">🐙 {t(locale, 'github_path')}</h4>
              <div className="space-y-2">
                {entry.github_path.map(step => (
                  <div key={step.order} className="flex gap-2.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <a href={step.repo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">{step.repo_name}</a>
                        <span className="text-slate-400">⭐ {step.stars}</span>
                        <span className="text-slate-400">({step.estimated_hours}h)</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{isZh ? step.what_to_learn_zh : step.what_to_learn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capstone */}
          <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-xl p-4 border border-blue-100">
            <h4 className="text-[10px] font-semibold text-blue-800 mb-2">🎯 {t(locale, 'capstone_section')}</h4>
            <p className="text-sm font-bold text-slate-900">{isZh ? entry.capstone.title_zh : entry.capstone.title}</p>
            <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
              <span className={diffColor(entry.capstone.difficulty)}>
                {t(locale, entry.capstone.difficulty === 'beginner' ? 'beginner' : entry.capstone.difficulty === 'intermediate' ? 'intermediate' : 'advanced')}
              </span>
              <span>{entry.capstone.time_hours}h</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{t(locale, 'deliverables_label')}:</span>{' '}
              {(isZh ? entry.capstone.deliverables_zh : entry.capstone.deliverables).join(' · ')}
            </div>
            <div className="mt-1.5 text-xs text-emerald-600">
              <span className="font-medium">{t(locale, 'proves_to_employer')}:</span>{' '}
              {isZh ? entry.capstone.proves_to_employer_zh : entry.capstone.proves_to_employer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Gap-driven priority section ─── */
function GapPriorities({ userSkills, locale }: { userSkills: string[]; locale: 'en' | 'de' | 'zh' }) {
  const isZh = locale === 'zh';

  // Find all missing skills across top-matching roles
  const priorities = useMemo(() => {
    const skillImpact = new Map<string, { roles: string[]; industries: string[]; salaryBoost: number }>();

    for (const ind of allIndustries) {
      for (const role of ind.roles) {
        const match = calcRoleMatch(userSkills, role);
        if (match < 10) continue; // only consider somewhat relevant roles

        const allSkills = [...new Set([...role.core_skills, ...role.levels.flatMap(l => l.key_skills)])];
        const userLower = userSkills.map(s => s.toLowerCase());
        const missing = allSkills.filter(s => !userLower.some(us => us.includes(s.toLowerCase()) || s.toLowerCase().includes(us)));

        for (const skill of missing) {
          const existing = skillImpact.get(skill) || { roles: [], industries: [], salaryBoost: 0 };
          const roleName = isZh ? role.title_zh : role.title;
          const indName = isZh ? ind.name_zh : ind.name;
          if (!existing.roles.includes(roleName)) existing.roles.push(roleName);
          if (!existing.industries.includes(indName)) existing.industries.push(indName);
          existing.salaryBoost = Math.max(existing.salaryBoost, role.levels[2]?.salary_cn.mid || 0); // lead level
          skillImpact.set(skill, existing);
        }
      }
    }

    // Sort by number of impacted roles (most impactful first)
    return Array.from(skillImpact.entries())
      .sort((a, b) => b[1].roles.length - a[1].roles.length)
      .slice(0, 8);
  }, [userSkills, isZh]);

  if (priorities.length === 0) return null;

  return (
    <div className="bg-white border border-blue-200 rounded-2xl p-5 mb-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-1">
        {isZh ? '📋 你的学习优先级' : '📋 Your Learning Priorities'}
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        {isZh ? '基于你的技能画像，以下缺口影响最多高薪岗位' : 'Based on your profile, these gaps impact the most high-paying roles'}
      </p>

      <div className="space-y-3">
        {priorities.map(([skill, info], i) => {
          const entries = getToolMapEntries(skill);
          const hasLearning = entries.length > 0;

          return (
            <div key={skill} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{skill}</span>
                  <span className="text-[10px] text-slate-400">
                    {isZh ? `影响${info.roles.length}个岗位` : `impacts ${info.roles.length} roles`}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {info.industries.slice(0, 3).join(' · ')} · {info.roles.slice(0, 2).join(', ')}
                </div>
                {hasLearning && (
                  <a href={`#skill-${skill.replace(/\s+/g, '-').toLowerCase()}`}
                    className="inline-block mt-1.5 text-[10px] text-blue-600 font-medium hover:underline">
                    {isZh ? '查看学习路径 ↓' : 'View learning path ↓'}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function LearnPageWrapper() {
  return (
    <Suspense>
      <LearnPage />
    </Suspense>
  );
}

function LearnPage() {
  const { locale } = useLocale();
  const { userSkills } = useSkills();
  const searchParams = useSearchParams();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId | 'all'>('all');
  const [highlightSkill, setHighlightSkill] = useState<string | null>(null);

  const isZh = locale === 'zh';

  // Handle ?skill= query param from industry page
  useEffect(() => {
    const skill = searchParams.get('skill');
    if (skill) {
      setHighlightSkill(skill);
      // Scroll to the skill after render
      setTimeout(() => {
        const el = document.getElementById(`skill-${skill.replace(/\s+/g, '-').toLowerCase()}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [searchParams]);

  const industries = getAvailableIndustries();
  const entries = selectedIndustry === 'all' ? industryToolMap : getToolMapByIndustry(selectedIndustry);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {isZh ? '学习路径' : locale === 'de' ? 'Lernpfade' : 'Learning Paths'}
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm">
            {isZh ? '行业工具、培训、GitHub练手和实战项目' : 'Industry tools, training, GitHub repos, and capstone projects'}
          </p>
        </div>

        {/* Gap-driven priorities (only if user has skills) */}
        {userSkills.length > 0 && <GapPriorities userSkills={userSkills} locale={locale} />}

        {/* Industry filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button onClick={() => setSelectedIndustry('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedIndustry === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'}`}>
            {isZh ? '全部' : 'All'} ({industryToolMap.length})
          </button>
          {industries.map(ind => {
            const labels = INDUSTRY_LABELS[ind.id];
            const label = labels ? (isZh ? labels.zh : locale === 'de' ? labels.de : labels.en) : ind.id;
            return (
              <button key={ind.id} onClick={() => setSelectedIndustry(ind.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedIndustry === ind.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'}`}>
                {label} ({ind.count})
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { v: entries.length, l: isZh ? '技能' : 'Skills', c: 'text-blue-600' },
            { v: entries.reduce((s, e) => s + e.tools.length, 0), l: isZh ? '工具' : 'Tools', c: 'text-amber-600' },
            { v: entries.reduce((s, e) => s + e.training.length, 0), l: isZh ? '培训' : 'Training', c: 'text-emerald-600' },
            { v: entries.reduce((s, e) => s + e.github_path.length, 0), l: 'GitHub', c: 'text-purple-600' },
          ].map(s => (
            <div key={s.l} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Entry list */}
        <div className="space-y-3">
          {entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} locale={locale}
              highlight={highlightSkill?.toLowerCase() === entry.skill.toLowerCase()} />
          ))}
        </div>

        <footer className="mt-16 py-6 border-t border-slate-200 text-center text-xs text-slate-400">
          {t(locale, 'footer')}
        </footer>
      </main>
    </div>
  );
}
