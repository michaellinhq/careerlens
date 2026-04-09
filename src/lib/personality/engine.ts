/**
 * Personality Scoring Engine — all computation runs client-side
 *
 * Pipeline: SliderAnswers → RIASEC Profile → Holland Code → Archetype → Career Harmony
 */

import type {
  SliderAnswer, RIASECProfile, HollandCode, Archetype, ArchetypeId,
  HarmonyScore, PersonalityReport, RIASECDimension,
} from './types';
import { RIASEC_DIMENSIONS } from './types';
import { scenarios } from './scenarios';
import type { CareerRole } from '@/lib/career-map';

/* ═══════════════════════════════════════════════════════════════
   1. RIASEC SCORING
   ═══════════════════════════════════════════════════════════════ */

/**
 * Convert slider answers (-50 to +50) into a RIASEC profile (0-100 per dimension).
 * Each scenario loads on its primary dimension (and optionally a secondary).
 */
export function computeRIASEC(answers: SliderAnswer[]): RIASECProfile {
  const raw: Record<RIASECDimension, number[]> = { R: [], I: [], A: [], S: [], E: [], C: [] };

  for (const ans of answers) {
    const scenario = scenarios.find(s => s.id === ans.scenarioId);
    if (!scenario) continue;

    // Normalize slider from [-50, +50] to [0, 100]
    const normalized = ((ans.value + 50) / 100) * 100;

    // Primary dimension: full weight
    raw[scenario.dimension].push(normalized * scenario.weight);

    // Secondary dimension: 40% cross-load
    if (scenario.secondary) {
      raw[scenario.secondary].push(normalized * 0.4);
    }
  }

  // Average each dimension, default to 50 if no data
  const profile = {} as RIASECProfile;
  for (const dim of RIASEC_DIMENSIONS) {
    const vals = raw[dim];
    profile[dim] = vals.length > 0
      ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
      : 50;
  }

  return profile;
}

/**
 * Extract Holland Code (top 3 dimensions) from profile.
 */
export function getHollandCode(profile: RIASECProfile): HollandCode {
  return RIASEC_DIMENSIONS
    .sort((a, b) => profile[b] - profile[a])
    .slice(0, 3)
    .join('');
}

/* ═══════════════════════════════════════════════════════════════
   2. ARCHETYPE CLASSIFICATION
   ═══════════════════════════════════════════════════════════════ */

export const ARCHETYPES: Archetype[] = [
  {
    id: 'deep-analyst',
    name: 'Deep Analyst',
    name_zh: '深度分析者',
    name_de: 'Tiefenanalyst',
    emoji: '🔬',
    tagline: 'You solve what others give up on.',
    tagline_zh: '别人放弃的难题，是你的舞台。',
    energizers: 'Complex root cause analysis, reading standards, building evidence chains. You thrive when given a hard problem and uninterrupted time.',
    energizers_zh: '复杂的根因分析、研读标准、构建证据链。给你一个难题和不被打扰的时间，你就能发光。',
    drainers: 'Repetitive documentation, filling templates without thinking, status meetings that could be emails.',
    drainers_zh: '重复性文档工作、不动脑子的填表、本可以邮件替代的状态会议。',
    ideal_direction: 'Systems engineering, compliance architecture, functional safety specialist — roles where depth beats breadth.',
    ideal_direction_zh: '系统工程、合规架构、功能安全专家——深度胜于广度的岗位。',
    pattern: { high: ['I'], low: ['C', 'S'] },
    fit_functions: ['Engineering', 'Quality', 'R&D'],
  },
  {
    id: 'process-guardian',
    name: 'Process Guardian',
    name_zh: '流程守护者',
    name_de: 'Prozesshüter',
    emoji: '🛡',
    tagline: 'You make systems bulletproof.',
    tagline_zh: '你让系统无懈可击。',
    energizers: 'Building airtight documentation, preparing for audits, ensuring every record is traceable. Order is your art form.',
    energizers_zh: '构建无懈可击的文档体系、为审核做准备、确保每条记录可追溯。秩序是你的艺术。',
    drainers: 'Ambiguity, "move fast and break things" culture, being asked to skip validation steps.',
    drainers_zh: '模糊不清的要求、"快速迭代不怕出错"的文化、被要求跳过验证步骤。',
    ideal_direction: 'QMS management, audit specialist, regulatory affairs — roles where precision is the product.',
    ideal_direction_zh: '质量管理体系管理、审核专家、法规事务——精确本身就是产品的岗位。',
    pattern: { high: ['C', 'I'], low: ['A', 'E'] },
    fit_functions: ['Quality', 'Compliance', 'Operations'],
  },
  {
    id: 'tech-bridge',
    name: 'Tech Bridge Builder',
    name_zh: '技术桥梁者',
    name_de: 'Technik-Brückenbauer',
    emoji: '🌉',
    tagline: 'You translate between departments.',
    tagline_zh: '你是部门之间的翻译官。',
    energizers: 'Cross-functional meetings, explaining technical issues to non-technical stakeholders, resolving conflicts between teams.',
    energizers_zh: '跨部门会议、向非技术人员解释技术问题、调解团队之间的矛盾。',
    drainers: 'Working alone for long stretches, deep statistical analysis, tasks with zero human interaction.',
    drainers_zh: '长时间独自工作、深度统计分析、完全没有人际互动的任务。',
    ideal_direction: 'Project management, customer quality, SQE, technical sales — roles at the intersection.',
    ideal_direction_zh: '项目管理、客户质量、供应商质量工程师、技术销售——交叉领域的岗位。',
    pattern: { high: ['S', 'E'], low: ['R'] },
    fit_functions: ['Project Management', 'Customer Quality', 'Supply Chain'],
  },
  {
    id: 'hands-on-solver',
    name: 'Hands-On Solver',
    name_zh: '实战解决者',
    name_de: 'Praxislöser',
    emoji: '🔧',
    tagline: 'Your best thinking happens at the Gemba.',
    tagline_zh: '你在现场才能真正思考。',
    energizers: 'Shop floor problem-solving, hands-on debugging, working with machines and tools. Theory means nothing until you see it in metal.',
    energizers_zh: '车间现场问题解决、动手调试、和机器打交道。理论在没变成实物之前毫无意义。',
    drainers: 'PowerPoint culture, approval chains, writing reports about work instead of doing work.',
    drainers_zh: 'PPT文化、层层审批、写报告描述工作而不是实际做工作。',
    ideal_direction: 'Process engineering, NPI engineer, test engineer, manufacturing lead — roles where you touch the product.',
    ideal_direction_zh: '工艺工程、新产品导入、测试工程、制造主管——能摸到产品的岗位。',
    pattern: { high: ['R', 'I'], low: ['C', 'A'] },
    fit_functions: ['Manufacturing', 'Process Engineering', 'Testing'],
  },
  {
    id: 'system-architect',
    name: 'System Architect',
    name_zh: '系统架构师',
    name_de: 'Systemarchitekt',
    emoji: '🏗',
    tagline: 'You see the whole machine, not just the parts.',
    tagline_zh: '你看到的是整个系统，不只是零件。',
    energizers: 'Designing quality systems, integrating tools into workflows, building structures that scale. You think in systems, not tasks.',
    energizers_zh: '设计质量体系、将工具集成到工作流、构建可扩展的结构。你用系统思维，不是任务思维。',
    drainers: 'Firefighting individual defects, tasks that are purely tactical with no strategic value.',
    drainers_zh: '逐个灭火处理缺陷、纯粹战术性没有战略价值的任务。',
    ideal_direction: 'Quality system architect, digital transformation lead, ADAS/FuSa system engineer — roles that design how things work.',
    ideal_direction_zh: '质量体系架构师、数字化转型负责人、ADAS/功能安全系统工程师——设计"事物如何运作"的岗位。',
    pattern: { high: ['I', 'C'], low: ['R'] },
    fit_functions: ['Systems Engineering', 'Digital Manufacturing', 'Quality'],
  },
  {
    id: 'innovation-scout',
    name: 'Innovation Scout',
    name_zh: '创新侦察者',
    name_de: 'Innovationsscout',
    emoji: '🚀',
    tagline: 'You find the next thing before anyone else.',
    tagline_zh: '你总是比别人先发现下一个趋势。',
    energizers: 'Exploring new technologies, prototyping solutions, connecting ideas from different fields. Routine is your enemy.',
    energizers_zh: '探索新技术、快速原型、跨领域连接灵感。重复是你的天敌。',
    drainers: 'Maintaining legacy systems, following established procedures without questioning, any task that feels "already solved."',
    drainers_zh: '维护遗留系统、不假思索地遵循既有流程、任何感觉"已经解决了"的任务。',
    ideal_direction: 'R&D quality, Industry 4.0 specialist, AI/ML in manufacturing, innovation manager — roles at the frontier.',
    ideal_direction_zh: '研发质量、工业4.0专家、制造业AI/ML、创新经理——前沿领域的岗位。',
    pattern: { high: ['I', 'A'], low: ['C'] },
    fit_functions: ['R&D', 'Digital Manufacturing', 'Innovation'],
  },
  {
    id: 'efficiency-hunter',
    name: 'Efficiency Hunter',
    name_zh: '效率猎手',
    name_de: 'Effizienzjäger',
    emoji: '🎯',
    tagline: 'You make things faster, cheaper, better.',
    tagline_zh: '更快、更省、更好——你的三个执念。',
    energizers: 'Lean projects, value stream optimization, negotiating with suppliers, driving results with deadlines.',
    energizers_zh: '精益项目、价值流优化、供应商谈判、在deadline前拿到结果。',
    drainers: 'Open-ended research, tasks with no clear deliverable, philosophical discussions about quality culture.',
    drainers_zh: '开放式研究、没有明确交付物的任务、关于"质量文化"的哲学讨论。',
    ideal_direction: 'Lean/CI manager, operations director, supply chain lead, plant manager — roles that drive P&L.',
    ideal_direction_zh: '精益/持续改进经理、运营总监、供应链负责人、工厂厂长——驱动损益表的岗位。',
    pattern: { high: ['E', 'R'], low: ['A', 'I'] },
    fit_functions: ['Operations', 'Supply Chain', 'Management'],
  },
  {
    id: 'quality-sensei',
    name: 'Quality Sensei',
    name_zh: '质量导师',
    name_de: 'Qualitäts-Sensei',
    emoji: '🧘',
    tagline: 'You build people, not just systems.',
    tagline_zh: '你培养的是人，不只是系统。',
    energizers: 'Training teams, developing quality culture, coaching engineers through audits, building organizational capability.',
    energizers_zh: '培训团队、培育质量文化、辅导工程师通过审核、构建组织能力。',
    drainers: 'Working in isolation, purely technical tasks with no people development component, pressure to prioritize speed over quality.',
    drainers_zh: '独自工作、纯技术任务没有人才培养维度、被逼在速度和质量之间选速度。',
    ideal_direction: 'Quality training director, VDA/IATF auditor, consulting, organizational development — roles that multiply through others.',
    ideal_direction_zh: '质量培训总监、VDA/IATF审核员、咨询、组织发展——通过培养他人放大影响力的岗位。',
    pattern: { high: ['S', 'C'], low: ['R', 'A'] },
    fit_functions: ['Training', 'Consulting', 'Quality Management'],
  },
];

/**
 * Classify a RIASEC profile into the best-matching archetype.
 * Uses weighted distance from each archetype's ideal pattern.
 */
export function classifyArchetype(profile: RIASECProfile): Archetype {
  let bestFit: Archetype = ARCHETYPES[0];
  let bestScore = -Infinity;

  for (const arch of ARCHETYPES) {
    let score = 0;

    // Reward high dimensions matching the archetype's "high" pattern
    for (const dim of arch.pattern.high) {
      score += profile[dim] * 2; // double weight for key dimensions
    }

    // Penalize high scores in the archetype's "low" pattern
    for (const dim of arch.pattern.low) {
      score -= profile[dim] * 1.5;
    }

    // Moderate contribution from other dimensions
    for (const dim of RIASEC_DIMENSIONS) {
      if (!arch.pattern.high.includes(dim) && !arch.pattern.low.includes(dim)) {
        score += profile[dim] * 0.3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestFit = arch;
    }
  }

  return bestFit;
}

/* ═══════════════════════════════════════════════════════════════
   3. CAREER HARMONY SCORING
   ═══════════════════════════════════════════════════════════════ */

/**
 * Approximate RIASEC profile for a CareerRole based on its characteristics.
 * This is a heuristic — proper O*NET RIASEC data would be better.
 */
function estimateRoleRIASEC(role: CareerRole): RIASECProfile {
  const fa = role.function_area.toLowerCase();
  const skills = [...role.core_skills, ...role.levels.flatMap(l => l.key_skills)].join(' ').toLowerCase();

  let R = 40, I = 50, A = 30, S = 40, E = 40, C = 50;

  // Function area adjustments
  if (fa.includes('engineering') || fa.includes('process') || fa.includes('manufacturing')) R += 20;
  if (fa.includes('quality') || fa.includes('compliance')) C += 20;
  if (fa.includes('r&d') || fa.includes('research') || fa.includes('systems')) I += 20;
  if (fa.includes('management') || fa.includes('operations') || fa.includes('supply')) E += 20;
  if (fa.includes('training') || fa.includes('consulting')) S += 20;

  // Skill-based adjustments
  if (skills.includes('python') || skills.includes('matlab') || skills.includes('data')) I += 10;
  if (skills.includes('plc') || skills.includes('cnc') || skills.includes('robot')) R += 15;
  if (skills.includes('audit') || skills.includes('iso') || skills.includes('iatf')) C += 10;
  if (skills.includes('leadership') || skills.includes('negotiation') || skills.includes('strategy')) E += 15;
  if (skills.includes('design') || skills.includes('creative') || skills.includes('ux')) A += 15;
  if (skills.includes('training') || skills.includes('mentoring') || skills.includes('coaching')) S += 15;
  if (skills.includes('fmea') || skills.includes('doe') || skills.includes('root cause')) I += 10;
  if (skills.includes('lean') || skills.includes('kaizen')) E += 10;

  // Normalize to 0-100 range
  const clamp = (v: number) => Math.max(10, Math.min(95, v));
  return { R: clamp(R), I: clamp(I), A: clamp(A), S: clamp(S), E: clamp(E), C: clamp(C) };
}

/**
 * Compute harmony score between user profile and a role.
 * High harmony = user's high dimensions match role's high dimensions.
 */
export function computeHarmony(
  userProfile: RIASECProfile,
  role: CareerRole,
  isZh: boolean,
): HarmonyScore {
  const roleProfile = estimateRoleRIASEC(role);

  // Cosine similarity between user and role profiles
  let dotProduct = 0, userMag = 0, roleMag = 0;
  for (const dim of RIASEC_DIMENSIONS) {
    dotProduct += userProfile[dim] * roleProfile[dim];
    userMag += userProfile[dim] ** 2;
    roleMag += roleProfile[dim] ** 2;
  }
  const cosineSim = dotProduct / (Math.sqrt(userMag) * Math.sqrt(roleMag));
  const harmony = Math.round(cosineSim * 100);

  // Find friction: dimension where role demands high but user is low
  let maxFriction = 0;
  let frictionDim: RIASECDimension = 'C';
  let maxEnergy = 0;
  let energyDim: RIASECDimension = 'I';

  for (const dim of RIASEC_DIMENSIONS) {
    const gap = roleProfile[dim] - userProfile[dim];
    if (gap > maxFriction) {
      maxFriction = gap;
      frictionDim = dim;
    }
    // Energy: user high AND role high
    const match = Math.min(userProfile[dim], roleProfile[dim]);
    if (match > maxEnergy) {
      maxEnergy = match;
      energyDim = dim;
    }
  }

  const frictionExplanations: Record<RIASECDimension, { en: string; zh: string }> = {
    R: { en: 'This role requires more hands-on physical work than you enjoy.', zh: '这个岗位需要的动手操作超出了你的舒适区。' },
    I: { en: 'This role demands deep analytical work that may feel exhausting.', zh: '这个岗位要求的深度分析工作可能让你感到疲惫。' },
    A: { en: 'This role needs creative/design work that isn\'t your strength.', zh: '这个岗位需要的创意/设计工作不是你的强项。' },
    S: { en: 'This role involves heavy people management and mentoring.', zh: '这个岗位涉及大量的人员管理和辅导工作。' },
    E: { en: 'This role requires persuasion and leadership that may drain you.', zh: '这个岗位要求的说服力和领导力可能消耗你。' },
    C: { en: 'This role involves extensive documentation and procedural compliance.', zh: '这个岗位涉及大量文档工作和流程合规。' },
  };

  const energyExplanations: Record<RIASECDimension, { en: string; zh: string }> = {
    R: { en: 'The hands-on practical work in this role will energize you.', zh: '这个岗位的动手实操工作会让你充满能量。' },
    I: { en: 'The analytical depth this role offers matches your investigative nature.', zh: '这个岗位的分析深度和你的研究天性完美匹配。' },
    A: { en: 'The creative freedom in this role aligns with your design instincts.', zh: '这个岗位的创作自由和你的设计直觉高度契合。' },
    S: { en: 'The team collaboration and mentoring aspects will fuel you.', zh: '团队协作和导师角色会给你持续动力。' },
    E: { en: 'The leadership and decision-making authority matches your drive.', zh: '领导权和决策权和你的驱动力完美契合。' },
    C: { en: 'The structured, systematic nature of this work suits your precision.', zh: '这份工作的系统化、结构化特性符合你对精确的追求。' },
  };

  return {
    roleId: role.id,
    roleTitle: role.title,
    roleTitle_zh: role.title_zh,
    harmony,
    friction_source: frictionDim,
    friction_explanation: frictionExplanations[frictionDim].en,
    friction_explanation_zh: frictionExplanations[frictionDim].zh,
    energy_source: energyDim,
    energy_explanation: energyExplanations[energyDim].en,
    energy_explanation_zh: energyExplanations[energyDim].zh,
  };
}

/* ═══════════════════════════════════════════════════════════════
   4. FULL REPORT GENERATION
   ═══════════════════════════════════════════════════════════════ */

export function generateReport(
  answers: SliderAnswer[],
  targetRoles: { role: CareerRole; industryName: string }[],
  isZh: boolean,
): PersonalityReport {
  const profile = computeRIASEC(answers);
  const hollandCode = getHollandCode(profile);
  const archetype = classifyArchetype(profile);

  // Compute harmony for each target role
  const roleHarmony = targetRoles.map(({ role }) => computeHarmony(profile, role, isZh));
  const overallHarmony = roleHarmony.length > 0
    ? Math.round(roleHarmony.reduce((s, h) => s + h.harmony, 0) / roleHarmony.length)
    : 0;

  // Generate insight based on archetype and friction patterns
  const topFriction = roleHarmony.reduce((worst, h) =>
    h.harmony < (worst?.harmony ?? 100) ? h : worst, roleHarmony[0]);

  const insight = isZh
    ? `作为"${archetype.name_zh}"，你的核心驱动力是${archetype.energizers_zh.split('。')[0]}。但你当前的目标岗位中，${topFriction?.roleTitle_zh || '部分角色'}在${topFriction?.friction_explanation_zh || '某些维度'}这正是你感到内耗的根源。`
    : `As a "${archetype.name}", your core driver is ${archetype.energizers.split('.')[0].toLowerCase()}. But among your target roles, ${topFriction?.roleTitle || 'some roles'} ${topFriction?.friction_explanation?.toLowerCase() || 'create friction in certain dimensions.'} This is the root of your career friction.`;

  const recommendation = isZh
    ? `建议方向：${archetype.ideal_direction_zh} 你的${archetype.name_zh}特质在这些方向上会从"内耗源"变成"竞争优势"。`
    : `Recommended direction: ${archetype.ideal_direction} Your ${archetype.name} traits will shift from friction source to competitive advantage in these roles.`;

  return {
    profile,
    hollandCode,
    archetype,
    roleHarmony,
    overallHarmony,
    insight,
    insight_zh: insight, // already generated per language
    recommendation,
    recommendation_zh: recommendation,
    timestamp: new Date().toISOString(),
  };
}
