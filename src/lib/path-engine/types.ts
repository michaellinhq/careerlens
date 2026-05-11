export type PathMode = 'student' | 'professional' | 'role' | 'resume';
export type Market = 'CN' | 'DE';

export interface LabelSet {
  en: string;
  zh: string;
  de?: string;
  gameLabel?: string;
  gameCategory?: string;
  gameHint?: string;
}

export interface MajorFamily {
  id: string;
  labels: LabelSet;
  courseIds: string[];
  skillIds: string[];
  roleCodes: string[];
}

export interface CourseEntry {
  id: string;
  labels: LabelSet;
  majorFamilyIds: string[];
  skillIds: string[];
  difficulty: 'foundation' | 'intermediate' | 'advanced';
}

export interface SkillEntry {
  id: string;
  labels: LabelSet;
  category: 'engineering' | 'data' | 'automation' | 'quality' | 'business' | 'communication';
  roleCodes: string[];
  evidenceIds: string[];
  learningWeeks: number;
}

export interface WorkTaskEntry {
  id: string;
  labels: LabelSet;
  skillIds: string[];
  evidenceIds: string[];
  adjacentRoleCodes: string[];
}

export interface EvidenceEntry {
  id: string;
  labels: LabelSet;
  provesSkillIds: string[];
  roleCodes: string[];
  deliverables: string[];
  deliverablesZh: string[];
  resumeBulletPatternZh: string;
  resumeBulletPatternEn: string;
  evidenceType: 'student-project' | 'professional-achievement' | 'portfolio-project';
  estimatedWeeks: number;
}

export interface SalaryPercentileRow {
  label: 'CN' | 'DE' | 'US';
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  currency: '¥' | '€' | '$';
  unit: 'K/月' | 'K/yr';
  userValue?: number;
  sourceNote: string;
}

export interface MarketPosition {
  demandTension: number;
  quadrantKey: 'gold' | 'red-ocean' | 'blue-ocean' | 'sunset';
  quadrantLabelZh: string;
  quadrantBodyZh: string;
}

export interface SkillProof {
  skill: string;
  skillZh: string;
  tools: Array<{ name: string; nameZh: string; url: string; tier: string }>;
  training: Array<{ name: string; nameZh: string; url: string; region: string; priceRange: string }>;
  githubPath: Array<{ repoName: string; repoUrl: string; stars: string; whatToLearnZh: string; estimatedHours: number }>;
  capstone?: {
    titleZh: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeHours: number;
    deliverablesZh: string[];
    provesToEmployerZh: string;
  };
}

export interface StudentPathInput {
  mode: 'student';
  identity: 'high-school' | 'university' | 'early-graduate';
  majorFamilyId: string;
  stage: 'choosing-major' | 'year-1' | 'year-2' | 'year-3' | 'year-4' | 'graduated';
  courseIds: string[];
  interestSkillIds: string[];
  targetRoleCode?: string;
  market: Market;
}

export interface ProfessionalPathInput {
  mode: 'professional';
  currentRole: string;
  currentIndustry: string;
  taskIds: string[];
  toolSkillIds: string[];
  achievementHints: string[];
  goal: 'salary' | 'industry-switch' | 'overseas' | 'stability' | 'lower-burnout' | 'expert' | 'entrepreneurship';
  targetRoleCode?: string;
  market: Market;
}

export interface PathStep {
  id: string;
  kind: 'major' | 'course' | 'work-task' | 'skill' | 'evidence' | 'role' | 'industry';
  labels: LabelSet;
  summaryZh: string;
  score?: number;
}

export interface RoleSignal {
  roleCode: string;
  title: string;
  titleZh: string;
  industry: string;
  salaryDisplay: string;
  opportunityScore: number;
  competitionLabelZh: string;
  barrierLabelZh: string;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  evidenceIds: string[];
  marketPosition: MarketPosition;
  salaryPercentiles: SalaryPercentileRow[];
  skillProofs: SkillProof[];
}

export interface ActionItem {
  id: string;
  titleZh: string;
  bodyZh: string;
  actionType: 'course' | 'project' | 'resume' | 'search' | 'interview' | 'portfolio';
  effortWeeks: number;
  linkedSkillIds: string[];
  proof?: SkillProof;
}

export interface PathResult {
  mode: PathMode;
  steps: PathStep[];
  roleSignals: RoleSignal[];
  recommendedRoleCode: string;
  actionItems: ActionItem[];
  explanationZh: string;
}
