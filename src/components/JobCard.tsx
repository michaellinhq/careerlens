import { ScoreRing } from '@/components/ui/ScoreRing';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { ScoreBar } from '@/components/ui/ScoreBar';
import type { Job } from '@/lib/data';
import { t, type Locale } from '@/lib/i18n';

export function JobCard({ job, locale, matchPct, userSkills, onClick }: {
  job: Job; locale: Locale; matchPct: number | null; userSkills: string[]; onClick: () => void;
}) {
  const title = locale === 'de' ? (job.title_de || job.title) : locale === 'zh' ? job.title_zh : job.title;
  return (
    <div className="job-card bg-card border border-border rounded-xl p-5 cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-4">
        <ScoreRing score={job.opportunity_score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm leading-tight">{title}</h3>
            {matchPct !== null && <MatchBadge pct={matchPct} />}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-accent-light font-mono font-bold text-lg">{job.salary_display}</span>
            <span className="text-muted text-xs">{job.currency === 'CNY' ? t(locale, 'per_month') : t(locale, 'per_year')}</span>
            <span className="text-muted text-xs ml-auto">{job.source}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <ScoreBar label={t(locale, 'salary')} value={job.breakdown.salary} color="#818cf8" />
        <ScoreBar label={t(locale, 'competition')} value={job.breakdown.competition} color="#34d399" />
        <ScoreBar label={t(locale, 'growth')} value={job.breakdown.growth} color="#fbbf24" />
        <ScoreBar label={t(locale, 'barrier')} value={job.breakdown.barrier} color="#a78bfa" />
        <ScoreBar label={t(locale, 'ai_resilience')} value={job.breakdown.ai_resilience} color="#fb923c" />
      </div>
      {job.skills && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map(s => {
            const hasSkill = userSkills.length > 0 && userSkills.some(us => s.toLowerCase().includes(us.toLowerCase()) || us.toLowerCase().includes(s.toLowerCase()));
            return (
              <span key={s} className={`px-2 py-0.5 text-[10px] rounded-full border ${
                userSkills.length > 0 && hasSkill
                  ? 'bg-green-500/10 text-green-600 border-green-500/25'
                  : userSkills.length > 0
                    ? 'bg-red-500/10 text-red-600/70 border-red-500/15'
                    : 'bg-accent/10 text-accent-light border-accent/20'
              }`}>{s}</span>
            );
          })}
        </div>
      )}
    </div>
  );
}
