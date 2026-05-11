import { chinaJobs } from '@/lib/jobs-cn';
import { germanyJobs } from '@/lib/jobs-de';
import { buildSkillProofs } from './proof';
import type { EvidenceEntry, Market, MarketPosition, RoleSignal, SalaryPercentileRow, SkillEntry } from './types';

const allJobs = [...chinaJobs, ...germanyJobs];

export function resolveJobByCode(roleCode: string) {
  return allJobs.find((job) => job.code === roleCode) ?? null;
}

export function getMarketRoleCodes(roleCodes: string[], market: Market): string[] {
  const prefix = market === 'CN' ? 'CN-' : 'DE-';
  const filtered = roleCodes.filter((code) => code.startsWith(prefix));
  return filtered.length > 0 ? filtered : roleCodes;
}

export function labelCompetition(score: number): string {
  if (score >= 80) return '竞争较弱，市场空间相对友好';
  if (score >= 60) return '竞争中等，需要清晰证据';
  if (score >= 40) return '竞争较强，需要项目或业绩证明';
  return '竞争很强，不建议裸投';
}

export function labelBarrier(score: number): string {
  if (score >= 80) return '门槛较高，适合有硬技能或项目的人';
  if (score >= 60) return '门槛中等，补齐关键技能后可尝试';
  if (score >= 40) return '门槛较低，但需要避免同质化竞争';
  return '入门容易，差异化证据很重要';
}

export function estimateSkillCoverage(roleSkills: string[], ownedSkills: string[]): number {
  if (roleSkills.length === 0) return 0;
  const owned = ownedSkills.map((skill) => skill.toLowerCase());
  const matched = roleSkills.filter((skill) => {
    const lower = skill.toLowerCase();
    return owned.some((ownedSkill) => ownedSkill.includes(lower) || lower.includes(ownedSkill));
  });
  return Math.round((matched.length / roleSkills.length) * 100);
}

function calcDemandTension(b: { demand_growth: number; barrier: number; ai_resilience: number; competition: number }): number {
  return Math.round(
    b.demand_growth * 0.30 +
    b.barrier * 0.25 +
    b.ai_resilience * 0.30 +
    (100 - b.competition) * 0.15,
  );
}

function buildMarketPosition(job: NonNullable<ReturnType<typeof resolveJobByCode>>): MarketPosition {
  const tension = calcDemandTension(job.breakdown);
  const salaryScore = job.breakdown.salary;
  if (salaryScore >= 60 && tension >= 60) {
    return {
      demandTension: tension,
      quadrantKey: 'gold',
      quadrantLabelZh: '黄金赛道',
      quadrantBodyZh: '薪资和需求张力都较强，适合优先研究，但仍需要证据支撑。',
    };
  }
  if (salaryScore >= 60) {
    return {
      demandTension: tension,
      quadrantKey: 'red-ocean',
      quadrantLabelZh: '竞争红海',
      quadrantBodyZh: '薪资吸引力较强，但竞争或供需张力不够友好，需要差异化证据。',
    };
  }
  if (tension >= 60) {
    return {
      demandTension: tension,
      quadrantKey: 'blue-ocean',
      quadrantLabelZh: '潜力蓝海',
      quadrantBodyZh: '当前薪资未必最高，但需求张力较强，适合作为提前布局方向。',
    };
  }
  return {
    demandTension: tension,
    quadrantKey: 'sunset',
    quadrantLabelZh: '谨慎观察',
    quadrantBodyZh: '薪资和需求张力都不突出，除非已有明显积累，否则不建议作为主路径。',
  };
}

function buildSalaryPercentiles(job: NonNullable<ReturnType<typeof resolveJobByCode>>): SalaryPercentileRow[] {
  const median = Math.round(job.salary_raw / 1000);
  if (!Number.isFinite(median) || median <= 0) return [];
  return [{
    label: job.country === 'CN' ? 'CN' : 'DE',
    p10: Math.max(1, Math.round(median * 0.65)),
    p25: Math.max(1, Math.round(median * 0.82)),
    median,
    p75: Math.round(median * 1.18),
    p90: Math.round(median * 1.40),
    currency: job.currency === 'CNY' ? '¥' : '€',
    unit: job.currency === 'CNY' ? 'K/月' : 'K/yr',
    sourceNote: 'MVP estimate derived from the current role median; replace with source percentiles when available.',
  }];
}

export function buildRoleSignal(
  roleCode: string,
  skills: SkillEntry[],
  evidence: EvidenceEntry[],
): RoleSignal | null {
  const job = resolveJobByCode(roleCode);
  if (!job) return null;

  const roleSkillNames = [...(job.skills ?? []), ...(job.technology_skills ?? [])];
  const matchedSkills = skills
    .filter((skill) => skill.roleCodes.includes(roleCode))
    .map((skill) => skill.labels.zh);
  const matchedSkillNames = skills
    .filter((skill) => skill.roleCodes.includes(roleCode))
    .flatMap((skill) => [skill.labels.en, skill.labels.zh]);
  const missingSkills = roleSkillNames.filter((skill) => {
    const lower = skill.toLowerCase();
    return !matchedSkillNames.some((owned) => owned.toLowerCase().includes(lower) || lower.includes(owned.toLowerCase()));
  });

  return {
    roleCode: job.code,
    title: job.title,
    titleZh: job.title_zh,
    industry: job.industry ?? 'manufacturing',
    salaryDisplay: job.salary_display,
    opportunityScore: job.opportunity_score,
    competitionLabelZh: labelCompetition(job.breakdown.competition),
    barrierLabelZh: labelBarrier(job.breakdown.barrier),
    requiredSkills: roleSkillNames,
    matchedSkills,
    missingSkills,
    evidenceIds: evidence.filter((item) => item.roleCodes.includes(roleCode)).map((item) => item.id),
    marketPosition: buildMarketPosition(job),
    salaryPercentiles: buildSalaryPercentiles(job),
    skillProofs: buildSkillProofs(missingSkills.length > 0 ? missingSkills : roleSkillNames.slice(0, 3), job.industry),
  };
}

export function sortSignals(signals: RoleSignal[]): RoleSignal[] {
  return [...signals].sort((a, b) => b.opportunityScore - a.opportunityScore);
}
