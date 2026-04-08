/**
 * Superposition Analysis Engine
 *
 * Finds the cross-industry "superposition states" — roles where the user
 * is only 1-3 skills away from qualifying for a completely different industry.
 *
 * This is CareerLens's core differentiator:
 * LinkedIn says "you're fit for X". We say "you're 1 skill away from becoming Y."
 */

import { allIndustries } from '@/lib/career-map';
import type { CareerRole, IndustryCareerMap } from '@/lib/career-map';

export interface SuperpositionState {
  /** Target industry */
  industry: IndustryCareerMap;
  /** Target role in that industry */
  role: CareerRole;
  /** Skills user already has that apply to this role */
  haveSkills: string[];
  /** Skills user needs to learn (the "gap") */
  gapSkills: string[];
  /** Number of skills to learn */
  gapCount: number;
  /** Match percentage (how much of the role they already cover) */
  matchPct: number;
  /** AI risk of the TARGET role (low/medium/high) */
  targetAiRisk: string;
  /** Estimated AI replacement rate reduction (percentage points) */
  aiDefenseGain: number;
  /** Salary uplift potential (% increase from current role avg to target) */
  salaryUplift: number;
  /** Growth outlook of target role */
  growthOutlook: string;
}

// AI risk → numeric replacement rate estimate
const AI_RISK_RATE: Record<string, number> = {
  high: 72,
  medium: 45,
  low: 18,
};

/**
 * Analyze superposition states for a user.
 *
 * @param userSkills - Skills detected from user's resume
 * @param currentIndustryId - User's current industry (from AI profile), optional
 * @param currentAiRisk - AI risk level of user's current role, defaults to 'medium'
 */
export function analyzeSuperposition(
  userSkills: string[],
  currentIndustryId?: string,
  currentAiRisk: string = 'medium',
): SuperpositionState[] {
  if (userSkills.length === 0) return [];

  const userLower = userSkills.map(s => s.toLowerCase());
  const currentRate = AI_RISK_RATE[currentAiRisk] ?? 45;

  const candidates: SuperpositionState[] = [];

  for (const ind of allIndustries) {
    // Skip user's current industry for cross-industry moves
    // but still include it if not specified
    const isCrossIndustry = currentIndustryId ? ind.id !== currentIndustryId : true;

    for (const role of ind.roles) {
      const allRoleSkills = [...new Set([
        ...role.core_skills,
        ...role.levels.slice(0, 2).flatMap(l => l.key_skills), // junior + senior skills
      ])];

      const haveSkills: string[] = [];
      const gapSkills: string[] = [];

      for (const skill of allRoleSkills) {
        const skillLower = skill.toLowerCase();
        const matched = userLower.some(
          us => us.includes(skillLower) || skillLower.includes(us),
        );
        if (matched) {
          haveSkills.push(skill);
        } else {
          gapSkills.push(skill);
        }
      }

      // Only interesting if user has SOME skills (>= 2) and gap is small (1-5)
      if (haveSkills.length < 2 || gapSkills.length < 1 || gapSkills.length > 5) continue;

      const matchPct = Math.round((haveSkills.length / allRoleSkills.length) * 100);
      const targetRate = AI_RISK_RATE[role.ai_risk] ?? 45;
      const aiDefenseGain = currentRate - targetRate;

      // Estimate salary uplift: compare target senior salary to average
      const targetSeniorSalary = role.levels[1]?.salary_cn.mid ?? 0;
      // Rough estimate of "average" engineer salary
      const avgSalary = 18; // ¥18K/month average for experienced engineer
      const salaryUplift = avgSalary > 0
        ? Math.round(((targetSeniorSalary - avgSalary) / avgSalary) * 100)
        : 0;

      candidates.push({
        industry: ind,
        role,
        haveSkills,
        gapSkills,
        gapCount: gapSkills.length,
        matchPct,
        targetAiRisk: role.ai_risk,
        aiDefenseGain,
        salaryUplift,
        growthOutlook: role.growth_outlook,
      });
    }
  }

  // Score and sort: prefer fewer gaps, higher salary, lower AI risk, cross-industry
  return candidates
    .sort((a, b) => {
      // Primary: fewer gap skills
      const gapDiff = a.gapCount - b.gapCount;
      if (gapDiff !== 0) return gapDiff;
      // Secondary: higher AI defense gain
      const aiDiff = b.aiDefenseGain - a.aiDefenseGain;
      if (aiDiff !== 0) return aiDiff;
      // Tertiary: higher growth
      const gv = { high: 3, medium: 2, low: 1 };
      return (gv[b.growthOutlook as keyof typeof gv] ?? 0) - (gv[a.growthOutlook as keyof typeof gv] ?? 0);
    })
    // Deduplicate by industry — max 1 role per industry
    .filter((item, idx, arr) => {
      return arr.findIndex(x => x.industry.id === item.industry.id) === idx;
    })
    .slice(0, 5); // Top 5 superposition states
}

/**
 * Get the AI replacement rate for a given risk level.
 */
export function getAiReplacementRate(risk: string): number {
  return AI_RISK_RATE[risk] ?? 45;
}

/**
 * Calculate the AI defense improvement of learning a specific skill,
 * based on whether it's a "human-advantage" skill.
 */
const HUMAN_ADVANTAGE_SKILLS = new Set([
  'audit', 'vda 6.3', 'negotiation', 'leadership', 'stakeholder management',
  'cross-functional', 'root cause analysis', 'fmea', 'customer quality',
  'supplier management', 'project management', 'functional safety',
  'homologation', 'regulatory', 'iso 26262', 'iso 13485',
]);

export function getSkillAiDefense(skill: string): number {
  const lower = skill.toLowerCase();
  for (const adv of HUMAN_ADVANTAGE_SKILLS) {
    if (lower.includes(adv) || adv.includes(lower)) return 15; // high human-advantage
  }
  return 5; // standard technical skill
}
