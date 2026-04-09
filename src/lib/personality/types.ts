/**
 * Career Harmony Assessment — "职业内耗诊断"
 *
 * Scientific backbone: Holland/RIASEC (O*NET-compatible)
 * User-facing: Engineer personality archetypes (proprietary IP)
 * Privacy: All computation runs client-side. No data sent to server.
 */

/* ─── RIASEC Dimensions ─── */

export type RIASECDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export const RIASEC_META: Record<RIASECDimension, {
  name: string;
  name_zh: string;
  name_de: string;
  description: string;
  description_zh: string;
  color: string;
}> = {
  R: {
    name: 'Realistic',
    name_zh: '实际型',
    name_de: 'Praktisch',
    description: 'Hands-on, physical, tool-oriented',
    description_zh: '动手能力强，喜欢操作工具和实物',
    color: '#ef4444', // red
  },
  I: {
    name: 'Investigative',
    name_zh: '研究型',
    name_de: 'Forschend',
    description: 'Analytical, intellectual, problem-solving',
    description_zh: '善于分析、研究、解决复杂问题',
    color: '#3b82f6', // blue
  },
  A: {
    name: 'Artistic',
    name_zh: '创造型',
    name_de: 'Kreativ',
    description: 'Creative, expressive, design-oriented',
    description_zh: '有创意、善于表达和设计',
    color: '#a855f7', // purple
  },
  S: {
    name: 'Social',
    name_zh: '社会型',
    name_de: 'Sozial',
    description: 'Helping, mentoring, team-oriented',
    description_zh: '喜欢帮助他人、指导团队',
    color: '#10b981', // emerald
  },
  E: {
    name: 'Enterprising',
    name_zh: '企业型',
    name_de: 'Unternehmerisch',
    description: 'Leading, persuading, decision-making',
    description_zh: '善于领导、说服、推动决策',
    color: '#f59e0b', // amber
  },
  C: {
    name: 'Conventional',
    name_zh: '常规型',
    name_de: 'Konventionell',
    description: 'Organized, detail-oriented, systematic',
    description_zh: '注重细节、系统化、遵循流程',
    color: '#6b7280', // gray
  },
};

export const RIASEC_DIMENSIONS: RIASECDimension[] = ['R', 'I', 'A', 'S', 'E', 'C'];

/* ─── Scenario Question ─── */

export interface Scenario {
  id: string;
  /** Which RIASEC dimension this scenario primarily measures */
  dimension: RIASECDimension;
  /** Secondary dimension (some scenarios cross-load) */
  secondary?: RIASECDimension;
  /** Weight: 0-1, how strongly this loads on the dimension */
  weight: number;
  /** The task scenario description */
  text: string;
  text_zh: string;
  text_de: string;
  /** Contextual detail — makes it feel specific, not generic */
  context: string;
  context_zh: string;
  context_de: string;
}

/* ─── Slider Answer ─── */

export interface SliderAnswer {
  scenarioId: string;
  /** -50 (hate) to +50 (love). 0 = neutral. */
  value: number;
}

/* ─── RIASEC Profile ─── */

export interface RIASECProfile {
  R: number; // 0-100
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

/** Top 3 dimensions as Holland Code, e.g. "IRE" */
export type HollandCode = string;

/* ─── Engineer Personality Archetypes ─── */

export type ArchetypeId =
  | 'deep-analyst'       // 深度分析者 — high I, low C
  | 'process-guardian'   // 流程守护者 — high C, moderate S
  | 'tech-bridge'        // 技术桥梁者 — high S+E, moderate I
  | 'hands-on-solver'    // 实战解决者 — high R+I
  | 'system-architect'   // 系统架构师 — high I+C, moderate E
  | 'innovation-scout'   // 创新侦察者 — high I+A, low C
  | 'efficiency-hunter'  // 效率猎手 — high E+R, low A
  | 'quality-sensei';    // 质量导师 — high S+C, moderate I

export interface Archetype {
  id: ArchetypeId;
  name: string;
  name_zh: string;
  name_de: string;
  emoji: string;
  /** One-line hook */
  tagline: string;
  tagline_zh: string;
  /** What energizes this type */
  energizers: string;
  energizers_zh: string;
  /** What drains this type (内耗源) */
  drainers: string;
  drainers_zh: string;
  /** Ideal role direction */
  ideal_direction: string;
  ideal_direction_zh: string;
  /** RIASEC pattern: which dimensions must be high/low */
  pattern: {
    high: RIASECDimension[];   // top 2-3
    low: RIASECDimension[];    // bottom 1-2
  };
  /** Best-fit function areas from career-map */
  fit_functions: string[];
}

/* ─── Career Harmony Report ─── */

export interface HarmonyScore {
  roleId: string;
  roleTitle: string;
  roleTitle_zh: string;
  /** 0-100: how well personality fits this role's task profile */
  harmony: number;
  /** Which dimension causes the most friction */
  friction_source: RIASECDimension;
  friction_explanation: string;
  friction_explanation_zh: string;
  /** Which dimension provides the most energy */
  energy_source: RIASECDimension;
  energy_explanation: string;
  energy_explanation_zh: string;
}

export interface PersonalityReport {
  profile: RIASECProfile;
  hollandCode: HollandCode;
  archetype: Archetype;
  /** Harmony scores for each target role */
  roleHarmony: HarmonyScore[];
  /** Overall career harmony: 0-100 */
  overallHarmony: number;
  /** Key insight — the "扎心" conclusion */
  insight: string;
  insight_zh: string;
  /** Recommended direction shift */
  recommendation: string;
  recommendation_zh: string;
  timestamp: string;
}

/* ─── Assessment State ─── */

export type AssessmentStage = 'intro' | 'testing' | 'computing' | 'result';

export interface AssessmentState {
  stage: AssessmentStage;
  currentQuestion: number;
  answers: SliderAnswer[];
  report: PersonalityReport | null;
}
