import { getToolMapEntries } from '@/lib/toolmap';
import type { SkillProof } from './types';

function normalizeToolMapQuery(skill: string): string {
  const lower = skill.toLowerCase();
  if (lower.includes('plc')) return 'PLC Programming';
  if (lower.includes('python') || lower.includes('data analysis')) return 'Python for Manufacturing';
  if (lower.includes('sql') || lower.includes('power bi')) return 'Python for Manufacturing';
  if (lower.includes('root cause') || lower.includes('8d')) return 'Root Cause Analysis (8D)';
  if (lower.includes('fmea') || lower.includes('dfmea')) return 'FMEA';
  if (lower.includes('gd&t')) return 'GD&T';
  if (lower.includes('solidworks')) return 'SolidWorks';
  if (lower.includes('ansys') || lower.includes('fea') || lower.includes('cae')) return 'ANSYS';
  if (lower.includes('product development') || lower.includes('dfm') || lower.includes('dfa')) return 'DFM/DFA';
  if (lower.includes('lean')) return 'Lean Manufacturing';
  if (lower.includes('spc')) return 'SPC';
  if (lower.includes('project')) return 'Project Management';
  if (lower.includes('sensor')) return 'Sensor Technology';
  if (lower.includes('embedded')) return 'Embedded C/C++';
  return skill;
}

export function buildSkillProofs(skills: string[], industry?: string): SkillProof[] {
  return skills.slice(0, 5).flatMap((skill) => {
    const query = normalizeToolMapQuery(skill);
    const entry = getToolMapEntries(query, industry)[0] ?? getToolMapEntries(skill, industry)[0];
    if (!entry) return [];

    return [{
      skill: entry.skill,
      skillZh: entry.skill_zh,
      tools: entry.tools.slice(0, 3).map((tool) => ({
        name: tool.name,
        nameZh: tool.name_zh,
        url: tool.url,
        tier: tool.tier,
      })),
      training: entry.training.slice(0, 2).map((training) => ({
        name: training.name,
        nameZh: training.name_zh,
        url: training.url,
        region: training.region,
        priceRange: training.price_range,
      })),
      githubPath: entry.github_path.slice(0, 2).map((step) => ({
        repoName: step.repo_name,
        repoUrl: step.repo_url,
        stars: step.stars,
        whatToLearnZh: step.what_to_learn_zh,
        estimatedHours: step.estimated_hours,
      })),
      capstone: {
        titleZh: entry.capstone.title_zh,
        difficulty: entry.capstone.difficulty,
        timeHours: entry.capstone.time_hours,
        deliverablesZh: entry.capstone.deliverables_zh,
        provesToEmployerZh: entry.capstone.proves_to_employer_zh,
      },
    }];
  }).slice(0, 3);
}
