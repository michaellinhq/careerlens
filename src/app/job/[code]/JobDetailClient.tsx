'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { chinaJobs, germanyJobs, getRelevantEvents } from '@/lib/data';
import type { Job } from '@/lib/data';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/locale-context';
import { Navbar } from '@/components/Navbar';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ScoreBar } from '@/components/ui/ScoreBar';

function findJob(code: string): Job | undefined {
  return chinaJobs.find(j => j.code === code) || germanyJobs.find(j => j.code === code);
}

export default function JobDetailClient() {
  const { code } = useParams<{ code: string }>();
  const { locale } = useLocale();
  const job = findJob(code);

  if (!job) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Job not found</h2>
          <p className="text-muted mb-6">Code: {code}</p>
          <Link href="/explore" className="text-accent-light hover:underline">Back to Leaderboard</Link>
        </main>
      </div>
    );
  }

  const title = locale === 'de' ? (job.title_de || job.title) : locale === 'zh' ? job.title_zh : job.title;

  const dims = [
    { key: 'salary', label: t(locale, 'salary'), value: job.breakdown.salary, color: '#818cf8' },
    { key: 'competition', label: t(locale, 'competition'), value: job.breakdown.competition, color: '#34d399' },
    { key: 'growth', label: t(locale, 'growth'), value: job.breakdown.growth, color: '#fbbf24' },
    { key: 'barrier', label: t(locale, 'barrier'), value: job.breakdown.barrier, color: '#a78bfa' },
    { key: 'ai_resilience', label: t(locale, 'ai_resilience'), value: job.breakdown.ai_resilience, color: '#fb923c' },
    { key: 'demand', label: t(locale, 'demand'), value: job.breakdown.demand_growth, color: '#38bdf8' },
    { key: 'remote', label: t(locale, 'remote'), value: job.breakdown.remote, color: '#f472b6' },
  ];

  const cx = 160, cy = 160, maxR = 130;
  const angles = dims.map((_, i) => (Math.PI * 2 * i) / dims.length - Math.PI / 2);
  const points = dims.map((d, i) => {
    const r = (d.value / 100) * maxR;
    return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`;
  }).join(' ');
  const gridLevels = [25, 50, 75, 100];

  const events = getRelevantEvents(job.title, job.skills || [], job.country);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-xs text-muted mb-6">
          <Link href="/explore" className="hover:text-accent-light">{t(locale, 'nav_home')}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{title}</span>
        </div>

        <div className="flex items-start gap-6 mb-8">
          <ScoreRing score={job.opportunity_score} size={88} />
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{title}</h1>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-accent-light font-mono text-3xl font-bold">{job.salary_display}</span>
              <span className="text-muted">{job.currency === 'CNY' ? t(locale, 'per_month') : t(locale, 'per_year')}</span>
              <span className="text-muted text-xs">{job.country === 'CN' ? '🇨🇳' : '🇩🇪'}</span>
            </div>
            <p className="text-xs text-muted">{t(locale, 'source')}: {job.source}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t(locale, 'score_breakdown')}</h3>
            <div className="flex justify-center mb-4">
              <svg width={320} height={320}>
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
                  return <circle key={i} cx={cx + r * Math.cos(angles[i])} cy={cy + r * Math.sin(angles[i])} r={5} fill={d.color} />;
                })}
                {dims.map((d, i) => {
                  const lr = maxR + 25;
                  return (
                    <text key={i} x={cx + lr * Math.cos(angles[i])} y={cy + lr * Math.sin(angles[i])}
                      textAnchor="middle" dominantBaseline="central" fill="#64748b" fontSize="11">
                      {d.label} {d.value}
                    </text>
                  );
                })}
              </svg>
            </div>
            <div className="space-y-2">
              {dims.map(d => <ScoreBar key={d.key} label={d.label} value={d.value} color={d.color} />)}
            </div>
          </div>

          <div className="space-y-6">
            {job.skills && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">{t(locale, 'skills_needed')}</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => (
                    <span key={s} className="px-3 py-1 text-xs rounded-full border bg-accent/10 text-accent-light border-accent/20">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {events.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-1">{t(locale, 'career_boosters')}</h3>
                <p className="text-xs text-muted mb-4">{t(locale, 'boosters_desc')}</p>
                <div className="space-y-3">
                  {events.map(evt => {
                    const evtTitle = locale === 'zh' ? evt.title_zh : evt.title;
                    const diffColor = evt.difficulty === 'beginner' ? 'text-green-400' : evt.difficulty === 'intermediate' ? 'text-yellow-400' : 'text-red-400';
                    return (
                      <div key={evt.id} className="bg-surface rounded-xl p-3">
                        <h4 className="text-xs font-semibold text-foreground">{evtTitle}</h4>
                        <div className="flex items-center gap-3 mt-1 text-[10px]">
                          <span className={diffColor}>{evt.difficulty}</span>
                          <span className="text-muted">{evt.time_hours}h</span>
                          <span className="text-muted">{evt.cost}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {evt.skills_gained.map(sg => (
                            <span key={sg.skill} className="px-2 py-0.5 text-[10px] bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                              {sg.skill} +{Math.round(sg.delta * 100)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <p className="text-sm text-muted mb-4">
                {locale === 'zh' ? '想看这个岗位和你的匹配度？' : locale === 'de' ? 'Willst du sehen, wie du zu diesem Job passt?' : 'Want to see how you match this job?'}
              </p>
              <Link href="/assess"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent/80 transition-colors">
                {locale === 'zh' ? '评估我的技能' : locale === 'de' ? 'Meine Skills bewerten' : 'Assess My Skills'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-16 py-6 border-t border-border text-center text-xs text-muted">
          {t(locale, 'footer')}
        </footer>
      </main>
    </div>
  );
}
