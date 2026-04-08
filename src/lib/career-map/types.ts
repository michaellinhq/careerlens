export type CareerLevel = 'junior' | 'senior' | 'lead' | 'manager' | 'director';

export interface SalaryRange {
  low: number;
  mid: number;
  high: number;
}

export interface RoleLevel {
  level: CareerLevel;
  level_zh: string;
  level_de: string;
  years_experience: string;
  salary_cn: SalaryRange;   // monthly ¥K
  salary_de: SalaryRange;   // annual €K
  key_skills: string[];     // additional skills at this level
}

export interface CareerRole {
  id: string;
  title: string;
  title_zh: string;
  title_de: string;
  function_area: string;         // e.g. "Quality", "Engineering", "Supply Chain"
  function_area_zh: string;
  core_skills: string[];         // skills common to all levels
  levels: RoleLevel[];
  growth_outlook: 'high' | 'medium' | 'low';
  ai_risk: 'low' | 'medium' | 'high';
}

export interface SubCategory {
  name: string;
  name_zh: string;
  name_de: string;
  icon: string;
}

export interface IndustryCareerMap {
  id: string;
  name: string;
  name_zh: string;
  name_de: string;
  icon: string;                  // emoji or icon identifier
  description: string;
  description_zh: string;
  description_de: string;
  avg_salary_cn: number;         // avg monthly ¥K across all roles
  avg_salary_de: number;         // avg annual €K across all roles
  top_benefits: string[];        // e.g. ["Housing allowance", "13th month salary"]
  top_benefits_zh: string[];
  ranking_2026: number;          // industry ranking by avg salary
  sub_categories?: SubCategory[];  // sub-sectors for visual map
  roles: CareerRole[];
}
