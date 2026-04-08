export type ToolTier = 'essential' | 'recommended' | 'emerging';

export type IndustryId =
  | 'common'
  | 'automotive'
  | 'aerospace'
  | 'medical-devices'
  | 'electronics'
  | 'industrial-automation'
  | 'energy-equipment'
  | 'process-manufacturing'
  | 'heavy-industry'
  | 'consumer-electronics'
  | 'consulting';

export interface ToolEntry {
  name: string;
  name_zh: string;
  vendor: string;
  tier: ToolTier;
  free_tier: boolean;
  free_tier_note?: string;
  url: string;
  alternatives?: string[];
}

export interface TrainingProvider {
  name: string;
  name_zh: string;
  region: 'CN' | 'DE' | 'EU' | 'global';
  url: string;
  price_range: string;
  format: 'online' | 'offline' | 'hybrid';
  certification?: string;
  language: ('zh' | 'de' | 'en')[];
}

export interface GitHubStep {
  order: number;
  repo_name: string;
  repo_url: string;
  stars: string;
  what_to_learn: string;
  what_to_learn_zh: string;
  estimated_hours: number;
}

export interface CapstoneProject {
  title: string;
  title_zh: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  time_hours: number;
  deliverables: string[];
  deliverables_zh: string[];
  proves_to_employer: string;
  proves_to_employer_zh: string;
}

export interface IndustryToolMapEntry {
  id: string;
  skill: string;
  skill_zh: string;
  industry: IndustryId;
  industry_context: string;
  industry_context_zh: string;
  tools: ToolEntry[];
  training: TrainingProvider[];
  github_path: GitHubStep[];
  capstone: CapstoneProject;
  monetization_potential: 'none' | 'affiliate' | 'premium';
}
