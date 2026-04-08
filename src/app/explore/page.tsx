'use client';

import { useState, useMemo } from 'react';
import { chinaJobs, germanyJobs } from '@/lib/data';
import type { Job } from '@/lib/data';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { Navbar } from '@/components/Navbar';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { JobCard } from '@/components/JobCard';
import { JobDetailModal } from '@/components/JobDetailModal';

const INDUSTRIES = [
  { id: 'all', en: 'All', zh: '全部', de: 'Alle' },
  { id: 'manufacturing', en: 'Manufacturing', zh: '制造工程', de: 'Fertigung' },
  { id: 'automotive', en: 'Automotive', zh: '汽车', de: 'Automobil' },
  { id: 'electronics', en: 'Electronics', zh: '电子/半导体', de: 'Elektronik' },
  { id: 'quality', en: 'Quality', zh: '质量/安全', de: 'Qualität' },
  { id: 'supply-chain', en: 'Supply Chain', zh: '供应链', de: 'Lieferkette' },
  { id: 'digital-manufacturing', en: 'Industry 4.0', zh: '工业4.0', de: 'Industrie 4.0' },
  { id: 'management', en: 'Management', zh: '管理', de: 'Management' },
  { id: 'consulting', en: 'Consulting', zh: '咨询', de: 'Beratung' },
  { id: 'energy', en: 'Energy', zh: '能源', de: 'Energie' },
];

export default function ExplorePage() {
  const { locale } = useLocale();
  const { userSkills } = useSkills();
  const [market, setMarket] = useState<'CN' | 'DE'>('DE');
  const [industry, setIndustry] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const allJobs = market === 'CN' ? chinaJobs : germanyJobs;

  const filteredJobs = useMemo(() => {
    const jobs = industry === 'all' ? allJobs : allJobs.filter(j => (j as Job & { industry?: string }).industry === industry);
    return [...jobs].sort((a, b) => b.opportunity_score - a.opportunity_score);
  }, [allJobs, industry]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t(locale, 'opportunity_board')}</h2>
          <p className="text-muted max-w-xl mx-auto text-sm">{t(locale, 'tagline')}</p>
        </div>

        {/* Market tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {(['DE', 'CN'] as const).map(m => (
            <button key={m} onClick={() => setMarket(m)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${market === m ? 'bg-accent text-white shadow-lg shadow-accent/15' : 'bg-card text-muted border border-border hover:border-accent/50'}`}>
              {m === 'CN' ? '🇨🇳' : '🇩🇪'} {m === 'CN' ? t(locale, 'market_china') : t(locale, 'market_germany')}
            </button>
          ))}
        </div>

        {/* Industry filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {INDUSTRIES.map(ind => {
            const label = locale === 'zh' ? ind.zh : locale === 'de' ? ind.de : ind.en;
            return (
              <button key={ind.id} onClick={() => setIndustry(ind.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${industry === ind.id ? 'bg-accent/20 text-accent-light border border-accent/40' : 'bg-card text-muted border border-border hover:border-muted'}`}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Job count */}
        <div className="text-xs text-muted mb-4">
          {filteredJobs.length} {locale === 'zh' ? '个岗位' : locale === 'de' ? ' Stellen' : ' jobs'}
        </div>

        {/* Top 3 spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {filteredJobs.slice(0, 3).map((job, i) => {
            const jTitle = locale === 'de' ? (job.title_de || job.title) : locale === 'zh' ? job.title_zh : job.title;
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div key={job.code}
                className="job-card relative bg-gradient-to-br from-card to-card-hover border border-border rounded-2xl p-6 cursor-pointer overflow-hidden"
                onClick={() => setSelectedJob(job)}>
                <div className="absolute top-3 right-3 text-2xl">{medals[i]}</div>
                <div className="flex items-center gap-3 mb-3">
                  <ScoreRing score={job.opportunity_score} size={64} />
                  <div>
                    <span className="text-accent-light font-mono text-2xl font-bold">{job.salary_display}</span>
                    <span className="text-muted text-xs ml-1">{job.currency === 'CNY' ? t(locale, 'per_month') : t(locale, 'per_year')}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-3">{jTitle}</h3>
                <div className="space-y-1">
                  <ScoreBar label={t(locale, 'competition')} value={job.breakdown.competition} color="#34d399" />
                  <ScoreBar label={t(locale, 'growth')} value={job.breakdown.growth} color="#fbbf24" />
                  <ScoreBar label={t(locale, 'ai_resilience')} value={job.breakdown.ai_resilience} color="#fb923c" />
                </div>
                {job.skills && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.skills.slice(0, 4).map(s => (
                      <span key={s} className="px-2 py-0.5 text-[10px] rounded-full border bg-accent/10 text-accent-light border-accent/20">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.slice(3).map(job => (
            <JobCard key={job.code} job={job} locale={locale} matchPct={null} userSkills={userSkills}
              onClick={() => setSelectedJob(job)} />
          ))}
        </div>

        <footer className="mt-16 py-6 border-t border-border text-center text-xs text-muted">
          {t(locale, 'footer')}
        </footer>
      </main>

      {selectedJob && <JobDetailModal job={selectedJob} locale={locale} userSkills={userSkills} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}
