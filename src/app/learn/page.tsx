'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/locale-context';
import { industryToolMap, getToolMapByIndustry, getAvailableIndustries } from '@/lib/toolmap';
import type { IndustryId, IndustryToolMapEntry } from '@/lib/toolmap';
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

function EntryCard({ entry, locale }: { entry: IndustryToolMapEntry; locale: 'en' | 'de' | 'zh' }) {
  const [open, setOpen] = useState(false);
  const skillLabel = locale === 'zh' ? entry.skill_zh : entry.skill;
  const context = locale === 'zh' ? entry.industry_context_zh : entry.industry_context;
  const tierColor = (tier: string) => tier === 'essential' ? 'text-red-400 bg-red-500/10 border-red-500/20' : tier === 'recommended' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  const tierLabel = (tier: string) => t(locale, tier === 'essential' ? 'essential' : tier === 'recommended' ? 'recommended' : 'emerging');
  const diffColor = (d: string) => d === 'beginner' ? 'text-green-400' : d === 'intermediate' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">{skillLabel}</h3>
            <p className="text-xs text-muted mt-1 line-clamp-2">{context}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {entry.tools.slice(0, 3).map(tool => (
                <span key={tool.name} className={`px-2 py-0.5 text-[10px] rounded-full border ${tierColor(tool.tier)}`}>
                  {locale === 'zh' ? tool.name_zh : tool.name}
                </span>
              ))}
              {entry.tools.length > 3 && <span className="text-[10px] text-muted">+{entry.tools.length - 3}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="flex gap-1.5 text-[10px] text-muted">
              <span>{entry.tools.length} tools</span>
              <span>{entry.training.length} training</span>
              <span>{entry.github_path.length} repos</span>
            </div>
            <svg className={`w-5 h-5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">
          {/* Industry Context */}
          <div className="bg-accent/5 rounded-lg p-3 border border-accent/10">
            <h4 className="text-xs font-semibold text-foreground mb-1">{t(locale, 'industry_context')}</h4>
            <p className="text-xs text-muted">{context}</p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-3">🔧 {t(locale, 'tools_section')}</h4>
            <div className="grid grid-cols-1 gap-2">
              {entry.tools.map(tool => (
                <div key={tool.name} className="bg-surface rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <a href={trackUrl(tool.url, 'tool', entry.id)} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-light hover:underline font-medium">
                        {locale === 'zh' ? tool.name_zh : tool.name}
                      </a>
                      <span className={`px-1.5 py-0.5 text-[10px] rounded border ${tierColor(tool.tier)}`}>{tierLabel(tool.tier)}</span>
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">{tool.vendor}</div>
                  </div>
                  <div className="text-right">
                    {tool.free_tier && (
                      <div className="text-[10px] text-green-400">✓ {t(locale, 'free_tier')}</div>
                    )}
                    {tool.free_tier_note && <div className="text-[10px] text-muted">{tool.free_tier_note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training */}
          {entry.training.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3">📚 {t(locale, 'training_section')}</h4>
              <div className="space-y-2">
                {entry.training.map(tr => (
                  <div key={tr.name} className="bg-surface rounded-lg p-3">
                    <a href={trackUrl(tr.url, 'training', entry.id)} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-light hover:underline font-medium">
                      {locale === 'zh' ? tr.name_zh : tr.name}
                    </a>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-muted">
                      <span className="text-accent-light font-medium">{tr.price_range}</span>
                      <span>{tr.format === 'online' ? '🌐' : tr.format === 'offline' ? '🏫' : '🔄'} {tr.format}</span>
                      <span>{tr.region}</span>
                      <span>{tr.language.join(' / ')}</span>
                      {tr.certification && <span className="text-yellow-400">🏅 {tr.certification}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Path */}
          {entry.github_path.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3">🐙 {t(locale, 'github_path')}</h4>
              <div className="space-y-2">
                {entry.github_path.map(step => (
                  <div key={step.order} className="flex gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-accent/20 text-accent-light flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <a href={step.repo_url} target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline font-medium">{step.repo_name}</a>
                        <span className="text-muted">⭐ {step.stars}</span>
                        <span className="text-muted">({step.estimated_hours}h)</span>
                      </div>
                      <p className="text-muted mt-0.5">{locale === 'zh' ? step.what_to_learn_zh : step.what_to_learn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capstone */}
          <div className="bg-gradient-to-r from-accent/10 to-transparent rounded-xl p-4 border border-accent/15">
            <h4 className="text-xs font-semibold text-foreground mb-2">🎯 {t(locale, 'capstone_section')}</h4>
            <p className="text-base font-bold text-foreground">{locale === 'zh' ? entry.capstone.title_zh : entry.capstone.title}</p>
            <div className="flex gap-3 mt-2 text-xs text-muted">
              <span className={diffColor(entry.capstone.difficulty)}>
                {t(locale, entry.capstone.difficulty === 'beginner' ? 'beginner' : entry.capstone.difficulty === 'intermediate' ? 'intermediate' : 'advanced')}
              </span>
              <span>{entry.capstone.time_hours}h</span>
            </div>
            <div className="mt-2 text-xs text-muted">
              <span className="font-medium text-foreground">{t(locale, 'deliverables_label')}:</span>{' '}
              {(locale === 'zh' ? entry.capstone.deliverables_zh : entry.capstone.deliverables).join(' · ')}
            </div>
            <div className="mt-2 text-xs text-green-400/80">
              <span className="font-medium">{t(locale, 'proves_to_employer')}:</span>{' '}
              {locale === 'zh' ? entry.capstone.proves_to_employer_zh : entry.capstone.proves_to_employer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  const { locale } = useLocale();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId | 'all'>('all');

  const industries = getAvailableIndustries();
  const entries = selectedIndustry === 'all' ? industryToolMap : getToolMapByIndustry(selectedIndustry);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t(locale, 'learn_title')}</h2>
          <p className="text-muted max-w-2xl mx-auto text-sm">{t(locale, 'learn_subtitle')}</p>
        </div>

        {/* Industry filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button onClick={() => setSelectedIndustry('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${selectedIndustry === 'all' ? 'bg-accent/20 text-accent-light border border-accent/40' : 'bg-card text-muted border border-border hover:border-muted'}`}>
            {t(locale, 'all_industries')} ({industryToolMap.length})
          </button>
          {industries.map(ind => {
            const labels = INDUSTRY_LABELS[ind.id];
            const label = labels ? (locale === 'zh' ? labels.zh : locale === 'de' ? labels.de : labels.en) : ind.id;
            return (
              <button key={ind.id} onClick={() => setSelectedIndustry(ind.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${selectedIndustry === ind.id ? 'bg-accent/20 text-accent-light border border-accent/40' : 'bg-card text-muted border border-border hover:border-muted'}`}>
                {label} ({ind.count})
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-accent-light">{entries.length}</div>
            <div className="text-[10px] text-muted mt-1">{locale === 'zh' ? '技能路线图' : locale === 'de' ? 'Skill-Roadmaps' : 'Skill Roadmaps'}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{entries.reduce((s, e) => s + e.tools.length, 0)}</div>
            <div className="text-[10px] text-muted mt-1">{locale === 'zh' ? '行业工具' : locale === 'de' ? 'Branchen-Tools' : 'Industry Tools'}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{entries.reduce((s, e) => s + e.training.length, 0)}</div>
            <div className="text-[10px] text-muted mt-1">{locale === 'zh' ? '培训资源' : locale === 'de' ? 'Schulungsangebote' : 'Training Providers'}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{entries.reduce((s, e) => s + e.github_path.length, 0)}</div>
            <div className="text-[10px] text-muted mt-1">{locale === 'zh' ? 'GitHub仓库' : locale === 'de' ? 'GitHub-Repos' : 'GitHub Repos'}</div>
          </div>
        </div>

        {/* Entry list */}
        <div className="space-y-3">
          {entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} locale={locale} />
          ))}
        </div>

        <footer className="mt-16 py-6 border-t border-border text-center text-xs text-muted">
          {t(locale, 'footer')}
        </footer>
      </main>
    </div>
  );
}
