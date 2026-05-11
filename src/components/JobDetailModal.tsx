'use client';

import { useState } from 'react';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { StatCard } from '@/components/ui/StatCard';
import type { Job } from '@/lib/data';
import { calculateMatch, getSkillGap, getRelevantEvents, getRelevantEvidence, calculateTransition, calculateEventBoost } from '@/lib/data';
import { t, type Locale } from '@/lib/i18n';
import { getToolMapEntries, mapJobIndustryToToolMapIndustry } from '@/lib/toolmap';
import type { IndustryToolMapEntry } from '@/lib/toolmap';
import { trackUrl } from '@/lib/tracking';
import { getGermanTrainingLinks } from '@/lib/data-sources';

function ToolMapCard({ entry, locale }: { entry: IndustryToolMapEntry; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const skillLabel = locale === 'zh' ? entry.skill_zh : entry.skill;
  const context = locale === 'zh' ? entry.industry_context_zh : entry.industry_context;
  const tierColor = (tier: string) => tier === 'essential' ? 'text-red-400 bg-red-500/10 border-red-500/20' : tier === 'recommended' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  const tierLabel = (tier: string) => t(locale, tier === 'essential' ? 'essential' : tier === 'recommended' ? 'recommended' : 'emerging');
  const diffColor = (d: string) => d === 'beginner' ? 'text-green-400' : d === 'intermediate' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-surface rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 hover:bg-card-hover transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-accent-light">{skillLabel}</span>
            <span className="ml-2 text-[10px] text-muted bg-surface px-2 py-0.5 rounded">{entry.industry}</span>
          </div>
          <svg className={`w-4 h-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <p className="text-xs text-muted mt-1 line-clamp-2">{context}</p>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Tools */}
          <div>
            <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
              <span>🔧</span> {t(locale, 'tools_section')}
            </h5>
            <div className="space-y-1.5">
              {entry.tools.map(tool => (
                <div key={tool.name} className="flex items-center gap-2 text-xs">
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] ${tierColor(tool.tier)}`}>{tierLabel(tool.tier)}</span>
                  <a href={trackUrl(tool.url, 'tool', entry.id)} target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">{locale === 'zh' ? tool.name_zh : tool.name}</a>
                  <span className="text-muted">({tool.vendor})</span>
                  {tool.free_tier && <span className="text-green-400 text-[10px]">✓ {t(locale, 'free_tier')}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Training */}
          {entry.training.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                <span>📚</span> {t(locale, 'training_section')}
              </h5>
              <div className="space-y-2">
                {entry.training.map(tr => (
                  <div key={tr.name} className="bg-surface rounded-lg p-2.5">
                    <a href={trackUrl(tr.url, 'training', entry.id)} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-light hover:underline font-medium">
                      {locale === 'zh' ? tr.name_zh : tr.name}
                    </a>
                    <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-muted">
                      <span>{tr.price_range}</span>
                      <span>{tr.format}</span>
                      <span>{tr.region}</span>
                      <span>{tr.language.join('/')}</span>
                      {tr.certification && <span className="text-yellow-400">🏅 {tr.certification}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KURSNET / BA Weiterbildung links */}
          {(() => {
            const deLinks = getGermanTrainingLinks(entry.skill);
            return (
              <div className="flex flex-wrap gap-2">
                <a href={deLinks.kursnet.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] bg-emerald-500/10 rounded-lg border border-emerald-500/20 hover:border-emerald-400 transition-colors">
                  <span>🎓</span>
                  <span className="font-medium text-emerald-400">{locale === 'de' ? deLinks.kursnet.label_de : locale === 'zh' ? deLinks.kursnet.label_zh : deLinks.kursnet.label}</span>
                  <span className="text-[9px]">🇩🇪</span>
                </a>
                <a href={deLinks.weiterbildung.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] bg-emerald-500/10 rounded-lg border border-emerald-500/20 hover:border-emerald-400 transition-colors">
                  <span>📚</span>
                  <span className="font-medium text-emerald-400">{locale === 'de' ? deLinks.weiterbildung.label_de : locale === 'zh' ? deLinks.weiterbildung.label_zh : deLinks.weiterbildung.label}</span>
                  <span className="text-[9px]">🇩🇪</span>
                </a>
              </div>
            );
          })()}

          {/* GitHub Path */}
          {entry.github_path.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                <span>🐙</span> {t(locale, 'github_path')}
              </h5>
              <div className="space-y-1.5">
                {entry.github_path.map(step => (
                  <div key={step.order} className="flex items-start gap-2 text-xs">
                    <span className="text-muted font-mono w-4 shrink-0">{step.order}.</span>
                    <div>
                      <a href={step.repo_url} target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">{step.repo_name}</a>
                      <span className="text-muted ml-1">⭐ {step.stars}</span>
                      <span className="text-muted ml-1">({step.estimated_hours}h)</span>
                      <p className="text-muted mt-0.5">{locale === 'zh' ? step.what_to_learn_zh : step.what_to_learn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capstone */}
          <div className="bg-gradient-to-r from-accent/5 to-transparent rounded-lg p-3 border border-accent/10">
            <h5 className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
              <span>🎯</span> {t(locale, 'capstone_section')}
            </h5>
            <p className="text-sm text-foreground font-medium">{locale === 'zh' ? entry.capstone.title_zh : entry.capstone.title}</p>
            <div className="flex gap-3 mt-1 text-[10px] text-muted">
              <span className={diffColor(entry.capstone.difficulty)}>{t(locale, entry.capstone.difficulty === 'beginner' ? 'beginner' : entry.capstone.difficulty === 'intermediate' ? 'intermediate' : 'advanced')}</span>
              <span>{entry.capstone.time_hours}h</span>
            </div>
            <div className="mt-2 text-[10px] text-muted">
              <span className="text-muted font-medium">{t(locale, 'proves_to_employer')}:</span>{' '}
              {locale === 'zh' ? entry.capstone.proves_to_employer_zh : entry.capstone.proves_to_employer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function JobDetailModal({ job, locale, userSkills, onClose }: { job: Job; locale: Locale; userSkills: string[]; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'gap' | 'path'>('overview');
  const title = locale === 'de' ? (job.title_de || job.title) : locale === 'zh' ? job.title_zh : job.title;

  const matchPct = userSkills.length > 0 ? calculateMatch(userSkills, job.skills || []) : null;
  const gap = getSkillGap(userSkills, job.skills || []);
  const events = getRelevantEvents(job.title, job.skills || [], job.country);
  const evidence = getRelevantEvidence(gap.missing);
  const transition = calculateTransition(gap.missing);

  const eventBoosts = events.map(evt => ({
    event: evt,
    boost: calculateEventBoost(evt, job.skills || [], userSkills),
  })).filter(e => e.boost > 0).sort((a, b) => b.boost - a.boost);

  const totalBoost = eventBoosts.reduce((s, e) => s + e.boost, 0);
  const afterMatch = matchPct !== null ? Math.min(100, matchPct + totalBoost) : null;

  const dims = [
    { key: 'salary', label: t(locale, 'salary'), value: job.breakdown.salary, color: '#818cf8' },
    { key: 'competition', label: t(locale, 'competition'), value: job.breakdown.competition, color: '#34d399' },
    { key: 'growth', label: t(locale, 'growth'), value: job.breakdown.growth, color: '#fbbf24' },
    { key: 'barrier', label: t(locale, 'barrier'), value: job.breakdown.barrier, color: '#a78bfa' },
    { key: 'ai_resilience', label: t(locale, 'ai_resilience'), value: job.breakdown.ai_resilience, color: '#fb923c' },
    { key: 'demand', label: t(locale, 'demand'), value: job.breakdown.demand_growth, color: '#38bdf8' },
    { key: 'remote', label: t(locale, 'remote'), value: job.breakdown.remote, color: '#f472b6' },
  ];

  const cx = 140, cy = 140, maxR = 110;
  const angles = dims.map((_, i) => (Math.PI * 2 * i) / dims.length - Math.PI / 2);
  const points = dims.map((d, i) => {
    const r = (d.value / 100) * maxR;
    return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`;
  }).join(' ');
  const gridLevels = [25, 50, 75, 100];

  const tabs = [
    { id: 'overview' as const, label: t(locale, 'overview') },
    { id: 'gap' as const, label: t(locale, 'gap_tab') },
    { id: 'path' as const, label: t(locale, 'path_tab') },
  ];
  const evidenceCopy = locale === 'zh'
    ? {
        title: '为什么会推荐这个岗位',
        summary: '这个结果结合了岗位价值评分、你的技能覆盖情况，以及当前数据源里的岗位信号，不是单纯关键词命中。',
        covered: '已覆盖技能',
        missing: '桥接技能',
        anchor: '数据锚点',
        coveredHint: '与你当前背景直接重合的要求',
        missingHint: '通常是跨过去前最值得优先补上的能力',
        anchorHint: '薪资和岗位价值来自当前外部数据源映射',
        score: '机会分',
      }
    : locale === 'de'
    ? {
        title: 'Warum diese Rolle erscheint',
        summary: 'Dieses Ergebnis kombiniert Rollenwert, Skill-Abdeckung und aktuelle Marktsignale statt nur Keywords zu zählen.',
        covered: 'Abgedeckte Skills',
        missing: 'Brückenskills',
        anchor: 'Datenanker',
        coveredHint: 'Anforderungen mit direkter Passung zu deinem Profil',
        missingHint: 'Meist die sinnvollsten Fähigkeiten für den nächsten Sprung',
        anchorHint: 'Gehalt und Marktwert folgen der verknüpften externen Quelle',
        score: 'Chance',
      }
    : {
        title: 'Why this role appears',
        summary: 'This result combines role value, skill coverage, and current market signals instead of relying on keyword hits alone.',
        covered: 'Skills covered',
        missing: 'Bridge skills',
        anchor: 'Data anchor',
        coveredHint: 'Requirements already aligned with your background',
        missingHint: 'Usually the next skills that unlock the move',
        anchorHint: 'Salary and market value are mapped from the linked external source',
        score: 'Opportunity',
      };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border rounded-t-2xl z-10">
          <div className="p-6 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-accent-light font-mono text-2xl font-bold">{job.salary_display}</span>
                  <span className="text-muted">{job.currency === 'CNY' ? t(locale, 'per_month') : t(locale, 'per_year')}</span>
                  {matchPct !== null && <MatchBadge pct={matchPct} />}
                </div>
              </div>
              <ScoreRing score={job.opportunity_score} size={72} />
            </div>
          </div>
          <div className="flex gap-0 px-6">
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === tb.id ? 'border-accent text-foreground' : 'border-transparent text-muted hover:text-foreground'
                }`}>
                {tb.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <>
              <div className="mb-6 rounded-2xl border border-accent/15 bg-accent/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-2xl">
                    <h3 className="text-sm font-semibold text-foreground">{evidenceCopy.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{evidenceCopy.summary}</p>
                  </div>
                  <div className="rounded-full border border-accent/15 bg-card px-3 py-1 text-[11px] font-medium text-accent-light">
                    {evidenceCopy.score} {job.opportunity_score}/100
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted">{evidenceCopy.covered}</div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{gap.have.length}</div>
                    <div className="text-[11px] text-muted">{evidenceCopy.coveredHint}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted">{evidenceCopy.missing}</div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{gap.missing.length}</div>
                    <div className="text-[11px] text-muted">{evidenceCopy.missingHint}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted">{evidenceCopy.anchor}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{job.source}</div>
                    <div className="text-[11px] text-muted">{evidenceCopy.anchorHint}</div>
                  </div>
                </div>
              </div>

              {userSkills.length > 0 && gap.missing.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <StatCard label={t(locale, 'months_to_ready')} value={transition.months} unit={locale === 'zh' ? '月' : 'mo'} accent="text-accent-light" />
                  <StatCard label={t(locale, 'total_hours')} value={transition.hours} unit="h" />
                  <StatCard label={t(locale, 'est_cost')} value={transition.cost_high > 0 ? `${job.currency === 'CNY' ? '¥' : '€'}${transition.cost_high.toLocaleString()}` : locale === 'zh' ? '免费' : 'Free'} />
                  <StatCard label={t(locale, 'salary_gain')} value={job.salary_display} accent="text-green-400" />
                </div>
              )}

              {/* Radar Chart */}
              <div className="flex justify-center mb-6">
                <svg width={280} height={280}>
                  {gridLevels.map(level => {
                    const r = (level / 100) * maxR;
                    const gp = angles.map(a => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`).join(' ');
                    return <polygon key={level} points={gp} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
                  })}
                  {angles.map((a, i) => (
                    <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)} stroke="#e2e8f0" strokeWidth="1" />
                  ))}
                  <polygon points={points} fill="rgba(102,126,234,0.2)" stroke="#667eea" strokeWidth="2" />
                  {dims.map((d, i) => {
                    const r = (d.value / 100) * maxR;
                    return <circle key={i} cx={cx + r * Math.cos(angles[i])} cy={cy + r * Math.sin(angles[i])} r={4} fill={d.color} />;
                  })}
                  {dims.map((d, i) => {
                    const lr = maxR + 22;
                    return (
                      <text key={i} x={cx + lr * Math.cos(angles[i])} y={cy + lr * Math.sin(angles[i])}
                        textAnchor="middle" dominantBaseline="central" fill="#64748b" fontSize="10">
                        {d.label} {d.value}
                      </text>
                    );
                  })}
                </svg>
              </div>

              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">{t(locale, 'score_breakdown')}</h3>
                {dims.map(d => <ScoreBar key={d.key} label={d.label} value={d.value} color={d.color} />)}
              </div>

              {job.skills && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t(locale, 'skills_needed')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(s => {
                      const hasIt = userSkills.length > 0 && userSkills.some(us => s.toLowerCase().includes(us.toLowerCase()) || us.toLowerCase().includes(s.toLowerCase()));
                      return (
                        <span key={s} className={`px-3 py-1 text-xs rounded-full border ${
                          userSkills.length === 0
                            ? 'bg-accent/10 text-accent-light border-accent/20'
                            : hasIt
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {userSkills.length > 0 && (hasIt ? '✓ ' : '✗ ')}{s}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* GAP ANALYSIS TAB */}
          {tab === 'gap' && (
            <>
              {gap.missing.length === 0 && userSkills.length > 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-green-400 font-semibold">{t(locale, 'perfect_match')}</p>
                </div>
              ) : (
                <>
                  {userSkills.length === 0 && (
                    <div className="bg-accent/5 border border-accent/15 rounded-xl p-3 mb-6 flex items-center gap-3">
                      <span className="text-lg">💡</span>
                      <p className="text-xs text-muted">
                        {locale === 'zh' ? '下方展示该岗位所有必需技能的学习路径。前往「我的技能」页面选择已有技能，可查看个性化差距分析。'
                          : locale === 'de' ? 'Unten sehen Sie Lernpfade für alle benötigten Skills. Gehen Sie zu „Meine Skills", um eine personalisierte Analyse zu erhalten.'
                          : 'Below are learning paths for all required skills. Go to "My Skills" to select your skills for personalized gap analysis.'}
                      </p>
                    </div>
                  )}

                  {userSkills.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-xs text-muted mb-2">
                        <span>{t(locale, 'skill_gap')}</span>
                        <span>{gap.have.length}/{(job.skills || []).length} {t(locale, 'skills_covered')}</span>
                      </div>
                      <div className="h-4 bg-surface rounded-full overflow-hidden flex">
                        <div className="h-full bg-green-500/60 transition-all duration-700" style={{ width: `${matchPct}%` }} />
                        <div className="h-full bg-red-500/30 transition-all duration-700" style={{ width: `${100 - (matchPct || 0)}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1">
                        <span className="text-green-400">{gap.have.length} {t(locale, 'skills_covered')}</span>
                        <span className="text-red-400">{gap.missing.length} {t(locale, 'skills_missing')}</span>
                      </div>
                    </div>
                  )}

                  {userSkills.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="text-xs font-semibold text-green-400 mb-2">✓ {t(locale, 'skills_covered')}</h4>
                        <div className="space-y-1">
                          {gap.have.map(s => (
                            <div key={s} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                              <span className="text-foreground">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-red-400 mb-2">✗ {t(locale, 'skills_missing')}</h4>
                        <div className="space-y-1">
                          {gap.missing.map(s => (
                            <div key={s} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                              <span className="text-foreground">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Industry Tool Map for missing skills */}
                  {gap.missing.length > 0 && (() => {
                    const jobIndustry = (job as Job & { industry?: string }).industry;
                    const toolEntries = gap.missing.flatMap(skill => {
                      const entries = getToolMapEntries(skill, jobIndustry);
                      return entries.length > 0 ? entries : [];
                    });
                    // Dedupe by id
                    const seen = new Set<string>();
                    const uniqueEntries = toolEntries.filter(e => {
                      if (seen.has(e.id)) return false;
                      seen.add(e.id);
                      return true;
                    });
                    return uniqueEntries.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">{t(locale, 'skill_roadmap')}</h3>
                        <p className="text-[10px] text-muted mb-3">
                          {locale === 'zh' ? '行业工具、培训机构、GitHub练手和实战项目' : locale === 'de' ? 'Branchentools, Schulungen, GitHub-Übungen und Projekte' : 'Industry tools, training, GitHub practice, and capstone projects'}
                        </p>
                        <div className="space-y-2">
                          {uniqueEntries.map(entry => (
                            <ToolMapCard key={entry.id} entry={entry} locale={locale} />
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {evidence.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">{t(locale, 'evidence')} — {t(locale, 'evidence_desc')}</h3>
                      <div className="space-y-3">
                        {evidence.map(ev => (
                          <div key={ev.skill} className="bg-surface rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-accent-light">{locale === 'zh' ? ev.skill_zh : ev.skill}</span>
                              <span className="text-[10px] text-muted uppercase bg-surface px-2 py-0.5 rounded">{ev.demand} demand</span>
                            </div>
                            <div className="space-y-2">
                              {ev.repos.slice(0, 3).map(repo => (
                                <div key={repo.name} className="flex items-start gap-2 text-xs">
                                  <span className="text-muted shrink-0">⭐ {repo.stars}</span>
                                  <div>
                                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">{repo.name}</a>
                                    <p className="text-muted mt-0.5">{repo.what_to_learn}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                              <span className="text-[10px] text-muted">{t(locale, 'build_project')}: {locale === 'zh' ? ev.build_project_zh : ev.build_project}</span>
                              <span className="text-[10px] text-muted">{ev.build_hours}h build + {ev.learning_hours}h learn</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* CAREER PATH TAB */}
          {tab === 'path' && (
            <>
              {userSkills.length > 0 && matchPct !== null && eventBoosts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t(locale, 'waterfall_title')}</h3>
                  <div className="bg-surface rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-muted w-28 shrink-0">{t(locale, 'current_match')}</span>
                      <div className="flex-1 h-5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent/60 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                          style={{ width: `${matchPct}%` }}>
                          <span className="text-[10px] font-bold text-white">{matchPct}%</span>
                        </div>
                      </div>
                    </div>
                    {eventBoosts.slice(0, 4).map((eb, i) => {
                      const cumulative = matchPct + eventBoosts.slice(0, i + 1).reduce((s, e) => s + e.boost, 0);
                      return (
                        <div key={eb.event.id} className="flex items-center gap-3 mb-2">
                          <span className="text-xs text-muted w-28 shrink-0 truncate">+{eb.event.title_zh.slice(0, 8)}...</span>
                          <div className="flex-1 h-5 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-green-500/50 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                              style={{ width: `${Math.min(100, cumulative)}%` }}>
                              <span className="text-[10px] font-bold text-white">{Math.min(100, cumulative)}%</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-green-400 font-mono w-10">+{eb.boost}%</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                      <span className="text-xs font-semibold text-foreground w-28">{t(locale, 'after_events')}</span>
                      <div className="flex-1 h-6 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent to-green-500 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                          style={{ width: `${Math.min(100, afterMatch || 0)}%` }}>
                          <span className="text-xs font-bold text-white">{Math.min(100, afterMatch || 0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-sm font-semibold text-foreground mb-1">{t(locale, 'career_boosters')}</h3>
              <p className="text-xs text-muted mb-4">{t(locale, 'boosters_desc')}</p>

              {events.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">{t(locale, 'no_skills_yet')}</p>
              ) : (
                <div className="space-y-3">
                  {events.map(evt => {
                    const boost = calculateEventBoost(evt, job.skills || [], userSkills);
                    const evtTitle = locale === 'zh' ? evt.title_zh : evt.title;
                    const diffColor = evt.difficulty === 'beginner' ? 'text-green-400' : evt.difficulty === 'intermediate' ? 'text-yellow-400' : 'text-red-400';
                    return (
                      <div key={evt.id} className="bg-surface rounded-xl p-4 hover:bg-card-hover transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{evtTitle}</h4>
                            <div className="flex items-center gap-3 mt-1 text-[10px]">
                              <span className={diffColor}>{evt.difficulty}</span>
                              <span className="text-muted">{evt.time_hours}h</span>
                              <span className="text-muted">{evt.cost}</span>
                              <span className="text-muted bg-surface px-1.5 py-0.5 rounded">{evt.output_type}</span>
                            </div>
                          </div>
                          {boost > 0 && (
                            <div className="text-right">
                              <span className="text-green-400 font-mono font-bold text-lg">+{boost}%</span>
                              <div className="text-[10px] text-muted">{t(locale, 'probability_boost')}</div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {evt.skills_gained.map(sg => (
                            <span key={sg.skill} className="px-2 py-0.5 text-[10px] bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                              {sg.skill} +{Math.round(sg.delta * 100)}%
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-muted mb-2">
                          <span className="text-muted font-medium">{t(locale, 'deliverables')}:</span>{' '}
                          {(locale === 'zh' ? evt.deliverables_zh : evt.deliverables).join(' · ')}
                        </div>
                        {evt.github_repos.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {evt.github_repos.map(repo => (
                              <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] text-accent-light hover:underline bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10">
                                <span>⭐ {repo.stars}</span>
                                <span>{repo.name}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>{t(locale, 'source')}: {job.source}</span>
          <span>{job.country === 'CN' ? '🇨🇳' : '🇩🇪'} {job.code}</span>
        </div>
      </div>
    </div>
  );
}
