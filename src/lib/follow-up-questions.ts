/**
 * Smart Follow-Up Questions for "Light Verification" (轻验证)
 *
 * After AI scans a resume (L1), we generate targeted follow-up questions
 * based on detected skill keywords. Each answered question increases
 * analysis precision and brightens the corresponding radar axis.
 *
 * Design principle: "诊断过程" not "考试过程"
 * — feels like a doctor asking smart questions, not an exam.
 */

export interface FollowUpQuestion {
  id: string;
  /** Skill keywords that trigger this question (lowercase) */
  triggers: string[];
  /** The question text (trilingual) */
  question: { en: string; de: string; zh: string };
  /** Input placeholder (trilingual) */
  placeholder: { en: string; de: string; zh: string };
  /** How much precision this adds when answered (percentage points) */
  precisionBoost: number;
  /** Which skill category this confirms (for radar brightening) */
  skillCategory: string;
  /** Quick-select options (user can tap instead of typing) */
  quickOptions?: { en: string; de: string; zh: string }[];
}

/**
 * Master question bank — ordered by diagnostic value.
 * The system picks the top 3-4 questions matching the user's detected skills.
 */
export const FOLLOW_UP_BANK: FollowUpQuestion[] = [
  // ─── Automotive Quality ───
  {
    id: 'aspice',
    triggers: ['aspice', 'a-spice', 'automotive spice'],
    question: {
      zh: '检测到你有 ASPICE 经验。你是否主导过 CL2 级别以上的过程审核？',
      en: 'Detected ASPICE experience. Have you led a CL2+ process assessment?',
      de: 'ASPICE-Erfahrung erkannt. Hast du ein CL2+ Prozessassessment geleitet?',
    },
    placeholder: {
      zh: '例：主导过3次CL2评估，涉及嵌入式软件开发流程...',
      en: 'e.g., Led 3 CL2 assessments for embedded software processes...',
      de: 'z.B. 3 CL2-Assessments für Embedded-Software geleitet...',
    },
    precisionBoost: 8,
    skillCategory: 'Quality & Standards',
    quickOptions: [
      { zh: '是，CL2+', en: 'Yes, CL2+', de: 'Ja, CL2+' },
      { zh: '参与过，非主导', en: 'Participated, not led', de: 'Teilgenommen, nicht geleitet' },
    ],
  },
  {
    id: 'fmea',
    triggers: ['fmea', 'dfmea', 'pfmea', 'failure mode'],
    question: {
      zh: '你主导过几次 DFMEA/PFMEA？涉及哪类产品？',
      en: 'How many DFMEA/PFMEA sessions have you led? What product types?',
      de: 'Wie viele DFMEA/PFMEA hast du geleitet? Welche Produkttypen?',
    },
    placeholder: {
      zh: '例：主导过10+次PFMEA，涉及汽车电子ECU和传感器...',
      en: 'e.g., Led 10+ PFMEA sessions for automotive ECUs and sensors...',
      de: 'z.B. 10+ PFMEA für Automotive-ECUs und Sensoren geleitet...',
    },
    precisionBoost: 7,
    skillCategory: 'Quality & Standards',
    quickOptions: [
      { zh: '5次以上，主导', en: '5+ sessions, led', de: '5+ Sitzungen, geleitet' },
      { zh: '参与为主', en: 'Mostly participated', de: 'Hauptsächlich teilgenommen' },
    ],
  },
  {
    id: 'vda63',
    triggers: ['vda 6.3', 'vda6.3', 'vda'],
    question: {
      zh: '你是否持有 VDA 6.3 审核员证书？审核过多少家供应商？',
      en: 'Do you hold a VDA 6.3 auditor certificate? How many suppliers audited?',
      de: 'Hast du ein VDA 6.3 Auditor-Zertifikat? Wie viele Lieferanten auditiert?',
    },
    placeholder: {
      zh: '例：持有VDA 6.3证书，审核过20+家供应商...',
      en: 'e.g., VDA 6.3 certified, audited 20+ suppliers...',
      de: 'z.B. VDA 6.3 zertifiziert, 20+ Lieferanten auditiert...',
    },
    precisionBoost: 8,
    skillCategory: 'Quality & Standards',
    quickOptions: [
      { zh: '有证书，10+家', en: 'Certified, 10+', de: 'Zertifiziert, 10+' },
      { zh: '有证书，<10家', en: 'Certified, <10', de: 'Zertifiziert, <10' },
      { zh: '无证书，参与过', en: 'No cert, participated', de: 'Kein Zertifikat, teilgenommen' },
    ],
  },
  {
    id: 'iso26262',
    triggers: ['iso 26262', 'functional safety', 'asil', '功能安全'],
    question: {
      zh: '你参与过哪个 ASIL 等级的功能安全项目？负责哪个阶段？',
      en: 'Which ASIL level functional safety projects have you worked on? Which phase?',
      de: 'An welchen ASIL-Level Projekten hast du gearbeitet? Welche Phase?',
    },
    placeholder: {
      zh: '例：ASIL-C项目，负责HARA和技术安全概念...',
      en: 'e.g., ASIL-C project, responsible for HARA and TSC...',
      de: 'z.B. ASIL-C Projekt, verantwortlich für HARA und TSC...',
    },
    precisionBoost: 8,
    skillCategory: 'Quality & Standards',
    quickOptions: [
      { zh: 'ASIL-D', en: 'ASIL-D', de: 'ASIL-D' },
      { zh: 'ASIL-B/C', en: 'ASIL-B/C', de: 'ASIL-B/C' },
      { zh: 'QM/ASIL-A', en: 'QM/ASIL-A', de: 'QM/ASIL-A' },
    ],
  },
  {
    id: 'iatf',
    triggers: ['iatf', 'iatf 16949', '16949'],
    question: {
      zh: '你是 IATF 16949 主任审核员还是内审员？审核过几家工厂？',
      en: 'Are you an IATF 16949 lead auditor or internal auditor? How many plants?',
      de: 'Bist du IATF 16949 Lead Auditor oder interner Auditor? Wie viele Werke?',
    },
    placeholder: {
      zh: '例：主任审核员，审核过5家工厂...',
      en: 'e.g., Lead auditor, audited 5 plants...',
      de: 'z.B. Lead Auditor, 5 Werke auditiert...',
    },
    precisionBoost: 7,
    skillCategory: 'Quality & Standards',
    quickOptions: [
      { zh: '主任审核员', en: 'Lead auditor', de: 'Lead Auditor' },
      { zh: '内审员', en: 'Internal auditor', de: 'Interner Auditor' },
    ],
  },
  // ─── Tools & Software ───
  {
    id: 'spc',
    triggers: ['spc', 'statistical process', 'minitab', 'cpk'],
    question: {
      zh: '你用什么工具做 SPC？监控过哪些关键特性(CTQ)？',
      en: 'What tools for SPC? Which critical-to-quality characteristics did you monitor?',
      de: 'Welche SPC-Tools? Welche qualitätskritischen Merkmale (CTQ) überwacht?',
    },
    placeholder: {
      zh: '例：Minitab + Excel VBA，监控焊接强度和密封性Cpk...',
      en: 'e.g., Minitab + Excel VBA, monitoring weld strength and sealing Cpk...',
      de: 'z.B. Minitab + Excel VBA, Schweißfestigkeit und Dichtheit Cpk überwacht...',
    },
    precisionBoost: 6,
    skillCategory: 'Data & Analytics',
    quickOptions: [
      { zh: 'Minitab', en: 'Minitab', de: 'Minitab' },
      { zh: 'Excel/VBA', en: 'Excel/VBA', de: 'Excel/VBA' },
      { zh: 'Python', en: 'Python', de: 'Python' },
    ],
  },
  {
    id: 'python',
    triggers: ['python', 'pandas', 'numpy', 'data analysis'],
    question: {
      zh: '你用 Python 做过什么类型的项目？数据分析、自动化还是Web？',
      en: 'What kind of Python projects? Data analysis, automation, or web?',
      de: 'Welche Python-Projekte? Datenanalyse, Automatisierung oder Web?',
    },
    placeholder: {
      zh: '例：用pandas做质量数据分析，自动生成SPC报告...',
      en: 'e.g., pandas for quality data analysis, auto-generating SPC reports...',
      de: 'z.B. pandas für Qualitätsdatenanalyse, automatische SPC-Berichte...',
    },
    precisionBoost: 6,
    skillCategory: 'Digital & Software',
    quickOptions: [
      { zh: '数据分析', en: 'Data analysis', de: 'Datenanalyse' },
      { zh: '自动化脚本', en: 'Automation', de: 'Automatisierung' },
      { zh: 'Web/API', en: 'Web/API', de: 'Web/API' },
    ],
  },
  {
    id: 'cad',
    triggers: ['solidworks', 'catia', 'cad', 'siemens nx', 'creo'],
    question: {
      zh: '你用 CAD 做过的最复杂的产品是什么？装配体规模？',
      en: 'Most complex product you designed in CAD? Assembly size?',
      de: 'Komplexestes Produkt in CAD? Baugruppengröße?',
    },
    placeholder: {
      zh: '例：设计过200+零件的变速箱壳体总成...',
      en: 'e.g., Designed 200+ part gearbox housing assembly...',
      de: 'z.B. 200+ Teile Getriebegehäuse-Baugruppe konstruiert...',
    },
    precisionBoost: 6,
    skillCategory: 'Engineering Design',
  },
  // ─── Management & Leadership ───
  {
    id: 'sixsigma',
    triggers: ['six sigma', 'green belt', 'black belt', 'lean', 'kaizen'],
    question: {
      zh: '你的 Six Sigma 认证是什么级别？主导过几个改善项目？',
      en: 'What Six Sigma belt level? How many improvement projects led?',
      de: 'Welcher Six Sigma Belt? Wie viele Verbesserungsprojekte geleitet?',
    },
    placeholder: {
      zh: '例：绿带认证，主导过5个降本项目，累计节省$200K...',
      en: 'e.g., Green Belt, led 5 cost reduction projects, $200K saved...',
      de: 'z.B. Green Belt, 5 Kostensenkungsprojekte, $200K eingespart...',
    },
    precisionBoost: 7,
    skillCategory: 'Quality & Standards',
    quickOptions: [
      { zh: '黑带', en: 'Black Belt', de: 'Black Belt' },
      { zh: '绿带', en: 'Green Belt', de: 'Green Belt' },
      { zh: '参加过培训，无认证', en: 'Trained, no cert', de: 'Geschult, kein Zertifikat' },
    ],
  },
  {
    id: 'ppap',
    triggers: ['ppap', '8d', 'apqp', 'customer quality'],
    question: {
      zh: '你独立提交过 PPAP 吗？给哪些 OEM？Level 几？',
      en: 'Have you independently submitted PPAP? To which OEMs? What level?',
      de: 'Hast du eigenständig PPAP eingereicht? An welche OEMs? Welcher Level?',
    },
    placeholder: {
      zh: '例：独立提交Level 3 PPAP给BMW和VW，包括MSA和SPC...',
      en: 'e.g., Submitted Level 3 PPAP to BMW and VW, including MSA and SPC...',
      de: 'z.B. Level 3 PPAP an BMW und VW eingereicht, inkl. MSA und SPC...',
    },
    precisionBoost: 7,
    skillCategory: 'Quality & Standards',
    quickOptions: [
      { zh: 'Level 3+，给OEM', en: 'Level 3+, to OEMs', de: 'Level 3+, an OEMs' },
      { zh: '参与过，非独立', en: 'Participated, not independent', de: 'Teilgenommen, nicht eigenständig' },
    ],
  },
  {
    id: 'supplier',
    triggers: ['supplier', 'vendor', 'procurement', 'sqe', 'supplier quality'],
    question: {
      zh: '你管理过多少家供应商？涉及哪些品类？',
      en: 'How many suppliers have you managed? What categories?',
      de: 'Wie viele Lieferanten hast du betreut? Welche Kategorien?',
    },
    placeholder: {
      zh: '例：管理30+家供应商，涉及注塑件、冲压件、PCB...',
      en: 'e.g., Managed 30+ suppliers, injection molding, stamping, PCB...',
      de: 'z.B. 30+ Lieferanten betreut, Spritzguss, Stanzen, PCB...',
    },
    precisionBoost: 6,
    skillCategory: 'Quality & Standards',
    quickOptions: [
      { zh: '20+家', en: '20+', de: '20+' },
      { zh: '5-20家', en: '5-20', de: '5-20' },
      { zh: '<5家', en: '<5', de: '<5' },
    ],
  },
  {
    id: 'project_mgmt',
    triggers: ['project management', 'pmp', 'agile', 'scrum'],
    question: {
      zh: '你管理过最大的项目团队规模是多少人？项目周期？',
      en: 'Largest project team you managed? Project duration?',
      de: 'Größtes Projektteam? Projektdauer?',
    },
    placeholder: {
      zh: '例：15人团队，18个月整车开发项目...',
      en: 'e.g., 15-person team, 18-month vehicle development program...',
      de: 'z.B. 15-Personen-Team, 18-Monate Fahrzeugentwicklungsprojekt...',
    },
    precisionBoost: 6,
    skillCategory: 'Management',
    quickOptions: [
      { zh: '10+人', en: '10+ people', de: '10+ Personen' },
      { zh: '5-10人', en: '5-10 people', de: '5-10 Personen' },
      { zh: '独立/小组', en: 'Solo/small team', de: 'Solo/Kleingruppe' },
    ],
  },
  // ─── Cross-industry / Emerging ───
  {
    id: 'robotics',
    triggers: ['robot', 'ros', 'plc', 'automation', 'cobot'],
    question: {
      zh: '你操作/编程过哪些品牌的机器人？用什么编程语言？',
      en: 'Which robot brands have you programmed? What languages?',
      de: 'Welche Robotermarken hast du programmiert? Welche Sprachen?',
    },
    placeholder: {
      zh: '例：KUKA KRL编程，ABB RAPID，FANUC示教...',
      en: 'e.g., KUKA KRL programming, ABB RAPID, FANUC teach pendant...',
      de: 'z.B. KUKA KRL Programmierung, ABB RAPID, FANUC Teachpendant...',
    },
    precisionBoost: 7,
    skillCategory: 'Automation & Robotics',
  },
  {
    id: 'medical',
    triggers: ['iso 13485', 'fda', 'medical device', 'gmp', 'iec 62304'],
    question: {
      zh: '你接触过哪类医疗器械？Class 几？参与过哪些法规流程？',
      en: 'What class of medical devices? Which regulatory processes?',
      de: 'Welche Medizinprodukteklasse? Welche regulatorischen Prozesse?',
    },
    placeholder: {
      zh: '例：Class II有源医疗器械，参与过510(k)申报...',
      en: 'e.g., Class II active devices, participated in 510(k) submission...',
      de: 'z.B. Klasse II aktive Medizinprodukte, 510(k)-Einreichung...',
    },
    precisionBoost: 8,
    skillCategory: 'Quality & Standards',
  },
  {
    id: 'gdt',
    triggers: ['gd&t', 'geometric', 'tolerance', 'asme y14'],
    question: {
      zh: '你能独立定义 GD&T 吗？做过最复杂的公差分析是什么？',
      en: 'Can you independently define GD&T? Most complex tolerance analysis?',
      de: 'Kannst du eigenständig GD&T definieren? Komplexeste Toleranzanalyse?',
    },
    placeholder: {
      zh: '例：独立定义过变速箱壳体GD&T，用3DCS做过公差叠加分析...',
      en: 'e.g., Defined GD&T for gearbox housing, 3DCS stack-up analysis...',
      de: 'z.B. GD&T für Getriebegehäuse definiert, 3DCS Toleranzkettenanalyse...',
    },
    precisionBoost: 6,
    skillCategory: 'Engineering Design',
  },
];

/**
 * Generate follow-up questions based on detected skills.
 * Returns top N questions sorted by relevance (matching trigger count).
 */
export function generateFollowUps(
  detectedSkills: string[],
  maxQuestions: number = 3,
): FollowUpQuestion[] {
  if (detectedSkills.length === 0) return [];

  const lowerSkills = detectedSkills.map(s => s.toLowerCase());

  // Score each question by how many triggers match
  const scored = FOLLOW_UP_BANK.map(q => {
    const matchCount = q.triggers.filter(trigger =>
      lowerSkills.some(skill => skill.includes(trigger) || trigger.includes(skill))
    ).length;
    return { question: q, matchCount };
  }).filter(({ matchCount }) => matchCount > 0);

  // Sort by match count (most specific first), then by precision boost
  scored.sort((a, b) =>
    b.matchCount - a.matchCount || b.question.precisionBoost - a.question.precisionBoost
  );

  // Deduplicate by skill category — max 1 question per category for variety
  const seen = new Set<string>();
  const result: FollowUpQuestion[] = [];
  for (const { question } of scored) {
    if (result.length >= maxQuestions) break;
    if (!seen.has(question.skillCategory)) {
      result.push(question);
      seen.add(question.skillCategory);
    }
  }

  // If we still have room, add more from already-seen categories
  if (result.length < maxQuestions) {
    for (const { question } of scored) {
      if (result.length >= maxQuestions) break;
      if (!result.includes(question)) {
        result.push(question);
      }
    }
  }

  return result.slice(0, maxQuestions);
}

/**
 * Calculate precision level based on initial scan + answered questions.
 * Base: 40% (resume text only)
 * Each answered question adds its precisionBoost.
 * Max: 95% (100% requires expert verification on Page 3)
 */
export function calculatePrecision(
  answeredQuestionIds: string[],
): number {
  const BASE = 40;
  const MAX = 95;

  const boost = answeredQuestionIds.reduce((sum, id) => {
    const q = FOLLOW_UP_BANK.find(q => q.id === id);
    return sum + (q?.precisionBoost ?? 5);
  }, 0);

  return Math.min(MAX, BASE + boost);
}
