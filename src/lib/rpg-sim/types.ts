export type MeterKey = 'energy' | 'money' | 'skill' | 'portfolio' | 'confidence' | 'reputation';

export type ActionCategory = 'learn' | 'build' | 'network' | 'apply' | 'rest';

export type EventTone = 'risk' | 'chance' | 'story';

export interface IdentityProfile {
  id: string;
  nameZh: string;
  archetypeZh: string;
  descriptionZh: string;
  startingMeters: Record<MeterKey, number>;
  traits: string[];
}

export interface TargetRole {
  id: string;
  roleCode: string;
  titleZh: string;
  titleEn: string;
  salaryDisplay: string;
  opportunityScore: number;
  coreSkillIds: string[];
  evidenceIds: string[];
  tagsZh: string[];
}

export interface CityMarket {
  id: string;
  cityZh: string;
  rentPerMonth: number;
  roleDemand: Partial<Record<string, number>>;
  networkingBonus: number;
  livingPressure: number;
}

export interface MeterDelta {
  energy?: number;
  money?: number;
  skill?: number;
  portfolio?: number;
  confidence?: number;
  reputation?: number;
}

export interface ActionCard {
  id: string;
  titleZh: string;
  category: ActionCategory;
  descriptionZh: string;
  durationDays: number;
  effects: MeterDelta;
  roleSkillIds?: string[];
  unlocksFlag?: string;
}

export interface RpgEventChoice {
  id: string;
  labelZh: string;
  outcomeZh: string;
  effects: MeterDelta;
  addsFlag?: string;
}

export interface RpgEvent {
  id: string;
  day: number;
  titleZh: string;
  tone: EventTone;
  bodyZh: string;
  choices: RpgEventChoice[];
}

export interface ProjectQuest {
  id: string;
  titleZh: string;
  sourceEvidenceId: string;
  stages: Array<{
    id: string;
    titleZh: string;
    requiredPortfolio: number;
    reward: MeterDelta;
  }>;
  resumeBulletZh: string;
}

export interface InterviewScenario {
  id: string;
  titleZh: string;
  roleId: string;
  rounds: Array<{
    id: string;
    titleZh: string;
    checks: Array<{ meter: MeterKey; target: number; labelZh: string }>;
  }>;
}

export interface EndingSummary {
  titleZh: string;
  bodyZh: string;
  offerChance: number;
  score: number;
  strongestMetric: MeterKey;
  nextStepZh: string;
}

export interface RunLogEntry {
  day: number;
  titleZh: string;
  bodyZh: string;
  effects: MeterDelta;
}

export interface RunState {
  day: number;
  identityId: string;
  targetRoleId: string;
  cityId: string;
  meters: Record<MeterKey, number>;
  completedActionIds: string[];
  flags: string[];
  log: RunLogEntry[];
}

export interface MarketForRole {
  role: TargetRole;
  city: CityMarket;
  demandScore: number;
  pressureScore: number;
  fitHintZh: string;
}

export interface TransitionResult {
  state: RunState;
  summary: EndingSummary;
  triggeredEvent?: RpgEvent;
}
