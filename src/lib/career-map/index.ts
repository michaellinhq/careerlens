import type { IndustryCareerMap, CareerRole, CareerLevel } from './types';
export type { IndustryCareerMap, CareerRole, CareerLevel, RoleLevel, SalaryRange } from './types';

import { automotiveCareerMap } from './automotive';
import { electronicsCareerMap } from './electronics';
import { aerospaceCareerMap } from './aerospace';
import { consultingCareerMap } from './consulting';
import { energyCareerMap } from './energy';
import { industrialAutomationCareerMap } from './industrial-automation';
import { medicalDevicesCareerMap } from './medical-devices';
import { itManufacturingCareerMap } from './it-manufacturing';
import { roboticsCareerMap } from './robotics';

export const allIndustries: IndustryCareerMap[] = [
  energyCareerMap,
  electronicsCareerMap,
  automotiveCareerMap,
  aerospaceCareerMap,
  consultingCareerMap,
  industrialAutomationCareerMap,
  medicalDevicesCareerMap,
  itManufacturingCareerMap,
  roboticsCareerMap,
].sort((a, b) => a.ranking_2026 - b.ranking_2026);

export function getIndustryById(id: string): IndustryCareerMap | undefined {
  return allIndustries.find(i => i.id === id);
}

export function getRoleById(industryId: string, roleId: string): CareerRole | undefined {
  const industry = getIndustryById(industryId);
  return industry?.roles.find(r => r.id === roleId);
}

// Get the highest paying roles across all industries at a given level
export function getTopRolesBySalary(market: 'CN' | 'DE', level: CareerLevel, limit = 10): { industry: IndustryCareerMap; role: CareerRole; salary_mid: number }[] {
  const results: { industry: IndustryCareerMap; role: CareerRole; salary_mid: number }[] = [];
  for (const industry of allIndustries) {
    for (const role of industry.roles) {
      const lv = role.levels.find(l => l.level === level);
      if (lv) {
        results.push({
          industry,
          role,
          salary_mid: market === 'CN' ? lv.salary_cn.mid : lv.salary_de.mid,
        });
      }
    }
  }
  return results.sort((a, b) => b.salary_mid - a.salary_mid).slice(0, limit);
}
