'use client';

import { useState, useMemo } from 'react';
import { chinaJobs, germanyJobs, calculateMatch } from '@/lib/data';
import type { Job } from '@/lib/data';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { Navbar } from '@/components/Navbar';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { SkillPanel } from '@/components/SkillPanel';
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

const assessContent = {
  en: {
    title: 'Skill-Based Career Matching',
    desc: 'Select your skills below, then see which high-value jobs match your profile best.',
    noSkills: 'Select your skills above to see personalized job matches ranked by fit.',
    resultsTitle: 'Your Best Matches',
    topMatch: 'Top Match',
  },
  de: {
    title: 'Skill-basiertes Karriere-Matching',
    desc: 'Wähle deine Skills und sieh, welche hochbezahlten Jobs am besten zu dir passen.',
    noSkills: 'Wähle oben deine Skills, um personalisierte Job-Matches zu sehen.',
    resultsTitle: 'Deine besten Matches',
    topMatch: 'Top-Match',
  },
  zh: {
    title: '技能匹配职业推荐',
    desc: '选择你已有的技能，查看哪些高价值岗位与你最匹配。',
    noSkills: '请先选择你的技能，系统会根据匹配度排序推荐岗位。',
    resultsTitle: '你的最佳匹配',
    topMatch: '最佳匹配',
  },
};

export default function AssessPage() {
  const { locale } = useLocale();
  const { userSkills, setUserSkills } = useSkills();
  const [market, setMarket] = useState<'CN' | 'DE'>('DE');
  const [industry, setIndustry] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const c = assessContent[locale];
  const allJobs = market === 'CN' ? chinaJobs : germanyJobs;

  const filteredJobs = useMemo(() => {
    return industry === 'all' ? allJobs : allJobs.filter(j => (j as Job & { industry?: string }).industry === industry);
  }, [allJobs, industry]);

  const jobMatches = useMemo(() => {
    if (userSkills.length === 0) return new Map<string, number>();
    const map = new Map<string, number>();
    filteredJobs.forEach(j => map.set(j.code, calculateMatch(userSkills, j.skills || [])));
    return map;
  }, [userSkills, filteredJobs]);

  const sortedJobs = useMemo(() => {
    if (userSkills.length === 0) return [];
    return [...filteredJobs].sort((a, b) => {
      const mA = jobMatches.get(a.code) || 0;
      const mB = jobMatches.get(b.code) || 0;
      if (mA !== mB) return mB - mA;
      return b.opportunity_score - a.opportunity_score;
    });
  }, [filteredJobs, userSkills, jobMatches]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{c.title}</h2>
          <p className="text-muted max-w-xl mx-auto text-sm">{c.desc}</p>
        </div>

        {/* Skill input */}
        <SkillPanel userSkills={userSkills} setUserSkills={setUserSkills} locale={locale} />

        {/* Market + Industry filters */}
        <div className="flex justify-center gap-2 mb-6">
          {(['DE', 'CN'] as const).map(m => (
            <button key={m} onClick={() => setMarket(m)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${market === m ? 'bg-accent text-white shadow-lg shadow-accent/15' : 'bg-card text-muted border border-border hover:border-accent/50'}`}>
              {m === 'CN' ? '🇨🇳' : '🇩🇪'} {m === 'CN' ? t(locale, 'market_china') : t(locale, 'market_germany')}
            </button>
          ))}
        </div>

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

        {/* Results */}
        {userSkills.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-muted text-sm max-w-md mx-auto">{c.noSkills}</p>
          </div>
        ) : (
          <>
            <div className="text-xs text-muted mb-4">
              {sortedJobs.length} {locale === 'zh' ? '个匹配岗位' : locale === 'de' ? ' passende Stellen' : ' matching jobs'}
            </div>

            {/* Top match spotlight */}
            {sortedJobs.length > 0 && (
              <div className="mb-8">
                {(() => {
                  const top = sortedJobs[0];
                  const topTitle = locale === 'de' ? (top.title_de || top.title) : locale === 'zh' ? top.title_zh : top.title;
                  const topMatch = jobMatches.get(top.code) || 0;
                  return (
                    <div className="job-card bg-gradient-to-r from-card to-card-hover border-2 border-accent/30 rounded-2xl p-6 cursor-pointer"
                      onClick={() => setSelectedJob(top)}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-accent/20 text-accent-light rounded-full">{c.topMatch}</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <ScoreRing score={top.opportunity_score} size={72} />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-foreground">{topTitle}</h3>
                            <MatchBadge pct={topMatch} />
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-accent-light font-mono text-2xl font-bold">{top.salary_display}</span>
                            <span className="text-muted text-xs">{top.currency === 'CNY' ? t(locale, 'per_month') : t(locale, 'per_year')}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <ScoreBar label={t(locale, 'salary')} value={top.breakdown.salary} color="#818cf8" />
                            <ScoreBar label={t(locale, 'competition')} value={top.breakdown.competition} color="#34d399" />
                            <ScoreBar label={t(locale, 'growth')} value={top.breakdown.growth} color="#fbbf24" />
                          </div>
                        </div>
                      </div>
                      {top.skills && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {top.skills.map(s => {
                            const has = userSkills.some(us => s.toLowerCase().includes(us.toLowerCase()) || us.toLowerCase().includes(s.toLowerCase()));
                            return (
                              <span key={s} className={`px-2 py-0.5 text-[10px] rounded-full border ${
                                has ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-red-500/10 text-red-400/70 border-red-500/15'
                              }`}>{has ? '✓ ' : '✗ '}{s}</span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Rest of results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedJobs.slice(1).map(job => (
                <JobCard key={job.code} job={job} locale={locale}
                  matchPct={jobMatches.get(job.code) ?? null}
                  userSkills={userSkills}
                  onClick={() => setSelectedJob(job)} />
              ))}
            </div>
          </>
        )}

        <footer className="mt-16 py-6 border-t border-border text-center text-xs text-muted">
          {t(locale, 'footer')}
        </footer>
      </main>

      {selectedJob && <JobDetailModal job={selectedJob} locale={locale} userSkills={userSkills} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}
