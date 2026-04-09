/**
 * Skill Type Classifier
 *
 * Classifies skills into actionable categories:
 * - tool: Software/hardware you operate (Python, CATIA, Minitab)
 * - method: Systematic processes you apply (FMEA, SPC, 8D, Lean)
 * - standard: Certifiable knowledge frameworks (IATF 16949, ISO 26262)
 * - domain: Broad knowledge areas, not directly testable (Thermal Management, Battery Systems)
 * - soft: Leadership/communication skills (Team Leadership, Negotiation)
 *
 * Plan page groups by type: tools + methods + standards are "actionable",
 * domain + soft are "secondary" and collapsed by default.
 */

export type SkillType = 'tool' | 'method' | 'standard' | 'domain' | 'soft';

export interface SkillTypeInfo {
  type: SkillType;
  icon: string;
  label: { en: string; de: string; zh: string };
}

export const SKILL_TYPE_META: Record<SkillType, { icon: string; label: { en: string; de: string; zh: string } }> = {
  tool: { icon: '🔧', label: { en: 'Tool Skills', de: 'Werkzeuge', zh: '工具技能' } },
  method: { icon: '📋', label: { en: 'Methods & Processes', de: 'Methoden', zh: '方法论' } },
  standard: { icon: '📜', label: { en: 'Standards & Certifications', de: 'Normen & Zertifikate', zh: '法规标准' } },
  domain: { icon: '🧠', label: { en: 'Domain Knowledge', de: 'Fachwissen', zh: '领域知识' } },
  soft: { icon: '🤝', label: { en: 'Leadership & Soft Skills', de: 'Führung & Soft Skills', zh: '管理与软技能' } },
};

/**
 * Skill → Type mapping.
 * Uses lowercase matching. Unmapped skills default to 'domain'.
 */
const CLASSIFICATION: Record<string, SkillType> = {
  // ─── TOOLS (software/hardware you operate) ───
  'python': 'tool',
  'javascript': 'tool',
  'typescript': 'tool',
  'java': 'tool',
  'c/c++': 'tool',
  'c#': 'tool',
  'go': 'tool',
  'rust': 'tool',
  'r': 'tool',
  'sql': 'tool',
  'matlab': 'tool',
  'matlab/simulink': 'tool',
  'solidworks': 'tool',
  'catia': 'tool',
  'catia/nx': 'tool',
  'nx/ug': 'tool',
  'autocad': 'tool',
  'creo': 'tool',
  'inventor': 'tool',
  'ansys': 'tool',
  'abaqus': 'tool',
  'comsol': 'tool',
  'adams': 'tool',
  'altium designer': 'tool',
  'docker': 'tool',
  'kubernetes': 'tool',
  'aws': 'tool',
  'azure': 'tool',
  'linux': 'tool',
  'terraform': 'tool',
  'git': 'tool',
  'spark': 'tool',
  'apache airflow': 'tool',
  'power bi': 'tool',
  'mongodb': 'tool',
  'postgresql': 'tool',
  'kafka': 'tool',
  'grafana': 'tool',
  'ros2': 'tool',
  'ros': 'tool',
  'tensorflow/pytorch': 'tool',
  'opencv': 'tool',
  'stm32': 'tool',
  'verilog/vhdl': 'tool',
  'fpga': 'tool',
  'siemens tia portal': 'tool',
  'tia portal/codesys': 'tool',
  'allen-bradley rslogix': 'tool',
  'plc programming': 'tool',
  'plc/sps': 'tool',
  'fanuc/kuka/abb programming': 'tool',
  'cognex/keyence': 'tool',
  'eplan': 'tool',
  'canape': 'tool',
  'canoe': 'tool',
  'vector canoe': 'tool',
  'capl scripting': 'tool',
  'ms project': 'tool',
  'sap mm': 'tool',
  'sap pp/pm': 'tool',
  'erp (sap)': 'tool',
  'sap': 'tool',
  'plm/teamcenter': 'tool',
  'doors': 'tool',
  'ibm doors': 'tool',
  'polarion': 'tool',
  'minitab': 'tool',
  'jmp': 'tool',
  'jira': 'tool',
  'confluence': 'tool',
  'hmi design': 'tool',
  'scada/dcs': 'tool',
  'mes': 'tool',
  'mes/mom': 'tool',
  'embedded c/c++': 'tool',
  'ladder logic': 'tool',
  'structured text': 'tool',
  'ci/cd': 'tool',
  'opc ua': 'tool',
  'mqtt': 'tool',
  'profinet/ethercat': 'tool',
  'eda tools': 'tool',
  'greenlight guru': 'tool',
  'mastercontrol': 'tool',

  // ─── METHODS (processes you can demonstrate) ───
  'fmea': 'method',
  'pfmea': 'method',
  'dfmea': 'method',
  'spc': 'method',
  'spc/sqc': 'method',
  'apqp/ppap': 'method',
  'ppap': 'method',
  'apqp': 'method',
  'lean manufacturing': 'method',
  'lean': 'method',
  'six sigma': 'method',
  'gd&t': 'method',
  'dfm/dfa': 'method',
  'value stream mapping': 'method',
  'root cause analysis (8d)': 'method',
  'root cause analysis': 'method',
  '8d': 'method',
  '8d report': 'method',
  'doe': 'method',
  'dvp&r': 'method',
  'halt/hass': 'method',
  'failure analysis': 'method',
  'reliability testing': 'method',
  'test planning': 'method',
  'test automation': 'method',
  'process optimization': 'method',
  'kaizen': 'method',
  'msa': 'method',
  'control plan': 'method',
  'etl/data pipeline': 'method',
  's&op': 'method',
  'demand forecasting': 'method',
  'inventory optimization': 'method',
  'cost reduction': 'method',
  'should-cost modeling': 'method',
  'data analysis': 'method',
  'feature engineering': 'method',
  'machine learning': 'method',
  'deep learning': 'method',
  'nlp': 'method',
  'computer vision': 'method',
  'image processing': 'method',
  'sensor fusion': 'method',
  'path planning': 'method',
  'slam/navigation': 'method',
  'offline programming': 'method',
  'model-based design': 'method',
  'cfd': 'method',
  'fea': 'method',
  'tolerance stack-up': 'method',
  'pid control': 'method',
  'motion control': 'method',
  'camera calibration': 'method',
  'lighting design': 'method',
  'defect detection algorithms': 'method',
  'risk management': 'method',
  'risk assessment': 'method',
  'problem solving': 'method',
  'lca': 'method',
  'cnc programming': 'method',
  'injection molding': 'method',
  'welding (mig/tig)': 'method',
  'casting/forging': 'method',
  'surface treatment': 'method',
  'tooling design': 'method',
  'circuit design': 'method',
  'pcb design': 'method',
  'emc': 'method',
  'robot kinematics': 'method',
  'servo tuning': 'method',
  'metrology/cmm': 'method',
  'agile/scrum': 'method',
  'rag architecture': 'method',
  'llm/prompt engineering': 'method',
  'predictive maintenance': 'method',
  'edge computing': 'method',
  'digital twin': 'method',
  'iiot': 'method',
  'carbon accounting': 'method',
  'esg reporting': 'method',
  'financial modeling': 'method',
  'smt process': 'method',

  // ─── STANDARDS (certifiable frameworks) ───
  'iso 9001': 'standard',
  'iatf 16949': 'standard',
  'iso 26262': 'standard',
  'functional safety (iso 26262)': 'standard',
  'functional safety': 'standard',
  'vda 6.3': 'standard',
  'audit (vda 6.3)': 'standard',
  'iso 14001': 'standard',
  'iso 50001': 'standard',
  'iso 13485': 'standard',
  'iso 10218': 'standard',
  'autosar': 'standard',
  'can/lin': 'standard',
  'misra': 'standard',
  'rtos': 'standard',
  'aspice': 'standard',
  'pmp/ipma': 'standard',
  'homologation': 'standard',
  'ul/ce compliance': 'standard',
  'ece/fmvss': 'standard',
  'v2x communication': 'standard',
  'ot cybersecurity': 'standard',
  'semiconductor process': 'standard',
  'safety standards (iso 10218)': 'standard',
  'contract law': 'standard',

  // ─── DOMAIN (broad knowledge, not directly testable) ───
  'battery/bms': 'domain',
  'battery systems': 'domain',
  'bms': 'domain',
  'ev powertrain': 'domain',
  'thermal management': 'domain',
  'power electronics': 'domain',
  'rf design': 'domain',
  'ic design': 'domain',
  'sensor technology': 'domain',
  'adas/autonomous driving': 'domain',
  'adas': 'domain',
  'industrial automation': 'domain',
  'industrial vision': 'domain',
  'wind/solar engineering': 'domain',
  'grid integration': 'domain',
  'energy storage': 'domain',
  'hydrogen/fuel cell': 'domain',
  'materials science': 'domain',
  'warehouse management': 'domain',
  'import/export/customs': 'domain',
  'patent/ip': 'domain',
  'time-series db': 'domain',

  // ─── SOFT (leadership, communication, management) ───
  'team leadership': 'soft',
  'project management': 'soft',
  'stakeholder management': 'soft',
  'cross-functional leadership': 'soft',
  'cross-functional coordination': 'soft',
  'cross-cultural communication': 'soft',
  'negotiation': 'soft',
  'presentation': 'soft',
  'technical writing': 'soft',
  'change management': 'soft',
  'business development': 'soft',
  'strategy': 'soft',
  'm&a due diligence': 'soft',
  'procurement/sourcing': 'soft',
  'supplier development': 'soft',
  'supplier management': 'soft',
  'customer quality': 'soft',
  'vendor management': 'soft',
  'budget management': 'soft',
  'budget planning': 'soft',
  'german b1+': 'soft',
  'english c1+': 'soft',
  'german job application standards': 'soft',
};

/**
 * Classify a skill by name. Case-insensitive fuzzy matching.
 */
export function classifySkill(skillName: string): SkillType {
  const lower = skillName.toLowerCase().trim();

  // Exact match
  if (CLASSIFICATION[lower]) return CLASSIFICATION[lower];

  // Partial match (skill contains a known key, or key contains skill)
  for (const [key, type] of Object.entries(CLASSIFICATION)) {
    if (lower.includes(key) || key.includes(lower)) return type;
  }

  // Heuristics for unmapped skills
  if (/strategy|roadmap|portfolio|reporting|leadership|management|team|board|executive/i.test(lower)) return 'soft';
  if (/iso\s*\d|iec\s*\d|vda|din\s*\d|astm|ul\s|ce\s|fda|gmp/i.test(lower)) return 'standard';
  if (/studio|portal|software|tool|ide|platform|matlab|cad|cam|erp|crm|sap/i.test(lower)) return 'tool';

  return 'domain'; // default: broad knowledge
}

/**
 * Group skills by type, preserving order within each group.
 */
export function groupSkillsByType(skills: string[]): Record<SkillType, string[]> {
  const groups: Record<SkillType, string[]> = {
    tool: [],
    method: [],
    standard: [],
    domain: [],
    soft: [],
  };
  for (const skill of skills) {
    groups[classifySkill(skill)].push(skill);
  }
  return groups;
}

/**
 * The "actionable" types that should be prominently displayed.
 * Domain and soft are secondary.
 */
export const ACTIONABLE_TYPES: SkillType[] = ['tool', 'method', 'standard'];
export const SECONDARY_TYPES: SkillType[] = ['domain', 'soft'];
