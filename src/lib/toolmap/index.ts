import type { IndustryToolMapEntry, IndustryId } from './types';
import type { Job } from '../data';

import { commonEntries } from './common';
import { automotiveEntries } from './automotive';
import { electronicsEntries } from './electronics';
import { industrialAutomationEntries } from './industrial-automation';
import { energyEquipmentEntries } from './energy-equipment';
import { aerospaceEntries } from './aerospace';
import { medicalDevicesEntries } from './medical-devices';
import { processManufacturingEntries } from './process-manufacturing';
import { consultingEntries } from './consulting';

export type { IndustryToolMapEntry, IndustryId, ToolEntry, TrainingProvider, GitHubStep, CapstoneProject, ToolTier } from './types';

// Aggregated map
export const industryToolMap: IndustryToolMapEntry[] = [
  ...commonEntries,
  ...automotiveEntries,
  ...electronicsEntries,
  ...industrialAutomationEntries,
  ...energyEquipmentEntries,
  ...aerospaceEntries,
  ...medicalDevicesEntries,
  ...processManufacturingEntries,
  ...consultingEntries,
];

// Map job.industry values to IndustryId
const INDUSTRY_MAP: Record<string, IndustryId> = {
  'manufacturing': 'common',
  'automotive': 'automotive',
  'electronics': 'electronics',
  'quality': 'common',
  'supply-chain': 'common',
  'digital-manufacturing': 'industrial-automation',
  'management': 'common',
  'consulting': 'consulting',
  'energy': 'energy-equipment',
};

export function mapJobIndustryToToolMapIndustry(jobIndustry: string): IndustryId {
  return INDUSTRY_MAP[jobIndustry] || 'common';
}

// Core lookup: find entries by skill + optional industry (falls back to 'common')
export function getToolMapEntries(skill: string, industry?: string): IndustryToolMapEntry[] {
  const targetIndustry = industry ? mapJobIndustryToToolMapIndustry(industry) : undefined;
  const skillLower = skill.toLowerCase();

  // Try exact industry match first
  if (targetIndustry && targetIndustry !== 'common') {
    const industryMatches = industryToolMap.filter(e =>
      e.industry === targetIndustry &&
      (e.skill.toLowerCase().includes(skillLower) || skillLower.includes(e.skill.toLowerCase()))
    );
    if (industryMatches.length > 0) return industryMatches;
  }

  // Fall back to common
  const commonMatches = industryToolMap.filter(e =>
    e.industry === 'common' &&
    (e.skill.toLowerCase().includes(skillLower) || skillLower.includes(e.skill.toLowerCase()))
  );
  if (commonMatches.length > 0) return commonMatches;

  // Try any industry
  return industryToolMap.filter(e =>
    e.skill.toLowerCase().includes(skillLower) || skillLower.includes(e.skill.toLowerCase())
  ).slice(0, 3);
}

// For a job's missing skills, get all relevant entries
export function getToolMapForJob(job: Job, missingSkills: string[]): Map<string, IndustryToolMapEntry[]> {
  const result = new Map<string, IndustryToolMapEntry[]>();
  const jobIndustry = (job as Job & { industry?: string }).industry;

  for (const skill of missingSkills) {
    const entries = getToolMapEntries(skill, jobIndustry);
    if (entries.length > 0) {
      result.set(skill, entries);
    }
  }
  return result;
}

// Browse by industry
export function getToolMapByIndustry(industry: IndustryId): IndustryToolMapEntry[] {
  return industryToolMap.filter(e => e.industry === industry);
}

// Get all unique industries that have entries
export function getAvailableIndustries(): { id: IndustryId; count: number }[] {
  const counts = new Map<IndustryId, number>();
  for (const entry of industryToolMap) {
    counts.set(entry.industry, (counts.get(entry.industry) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}
