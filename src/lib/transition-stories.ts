/**
 * Representative transition stories.
 * These are based on repeated transition patterns observed in the automotive/manufacturing industry,
 * not verified individual case studies with disclosed personal records.
 */

export interface TransitionStory {
  id: string;
  from: string;
  from_zh: string;
  from_de: string;
  to: string;
  to_zh: string;
  to_de: string;
  duration_months: number;
  salary_before: string;
  salary_after: string;
  currency: '¥' | '€';
  evidence_note: string;
  evidence_note_zh: string;
  evidence_note_de: string;
  key_skill: string;
  quote: string;
  quote_zh: string;
  quote_de: string;
  industry: string;
  location: string;
  location_zh: string;
}

export const transitionStories: TransitionStory[] = [
  {
    id: 'ts1',
    from: 'Quality Inspector',
    from_zh: '质量检验员',
    from_de: 'Qualitätsprüfer',
    to: 'ADAS Validation Engineer',
    to_zh: 'ADAS验证工程师',
    to_de: 'ADAS-Validierungsingenieur',
    duration_months: 14,
    salary_before: '8K',
    salary_after: '22K',
    currency: '¥',
    evidence_note: 'Representative pattern from quality -> validation transitions',
    evidence_note_zh: '基于质量 -> 验证岗位跃迁的代表性样本',
    evidence_note_de: 'Repräsentatives Muster aus Übergängen Qualität -> Validierung',
    key_skill: 'Python + ASPICE',
    quote: 'I spent evenings learning Python to automate test scripts. The ASPICE knowledge from quality work was the bridge — validation teams need people who understand process rigor.',
    quote_zh: '我晚上自学Python写自动化测试脚本。质量工作中的ASPICE经验成了桥梁——验证团队需要懂过程严谨性的人。',
    quote_de: 'Abends habe ich Python gelernt, um Testskripte zu automatisieren. Das ASPICE-Wissen aus der Qualitätsarbeit war die Brücke.',
    industry: 'Automotive',
    location: 'Shanghai → Shanghai',
    location_zh: '上海 → 上海',
  },
  {
    id: 'ts2',
    from: 'Production Supervisor',
    from_zh: '产线班组长',
    from_de: 'Produktionsschichtleiter',
    to: 'Industrial IoT Engineer',
    to_zh: '工业物联网工程师',
    to_de: 'IIoT-Ingenieur',
    duration_months: 10,
    salary_before: '42K',
    salary_after: '62K',
    currency: '€',
    evidence_note: 'Representative pattern from shop-floor leadership -> IIoT',
    evidence_note_zh: '基于产线管理 -> 工业物联网的代表性样本',
    evidence_note_de: 'Repräsentatives Muster aus Fertigungsleitung -> IIoT',
    key_skill: 'PLC + Node-RED + MQTT',
    quote: 'I already knew the production floor better than any software engineer. Learning MQTT and Node-RED took 3 months — then I could connect the machines I had been supervising for years.',
    quote_zh: '我比任何软件工程师都了解产线。学MQTT和Node-RED花了3个月——然后我就能把管了多年的设备连起来了。',
    quote_de: 'Ich kannte die Produktion besser als jeder Software-Ingenieur. MQTT und Node-RED lernen dauerte 3 Monate.',
    industry: 'Industrial Automation',
    location: 'Stuttgart → Stuttgart',
    location_zh: '斯图加特 → 斯图加特',
  },
  {
    id: 'ts3',
    from: 'Mechanical Design Engineer',
    from_zh: '机械设计工程师',
    from_de: 'Konstruktionsingenieur',
    to: 'Robotics Application Engineer',
    to_zh: '机器人应用工程师',
    to_de: 'Robotik-Applikationsingenieur',
    duration_months: 8,
    salary_before: '15K',
    salary_after: '28K',
    currency: '¥',
    evidence_note: 'Representative pattern from mechanical design -> robotics application',
    evidence_note_zh: '基于机械设计 -> 机器人应用的代表性样本',
    evidence_note_de: 'Repräsentatives Muster aus Konstruktion -> Robotik-Applikation',
    key_skill: 'ROS2 + SolidWorks',
    quote: 'My SolidWorks expertise was 70% of the job already. The ROS2 online course filled the gap. The capstone project on my GitHub got me the interview.',
    quote_zh: 'SolidWorks的功底已经覆盖了70%的岗位要求。ROS2在线课程填补了剩下的。GitHub上的毕业项目拿到了面试机会。',
    quote_de: 'Mein SolidWorks-Know-how deckte schon 70% ab. Der ROS2-Kurs füllte die Lücke.',
    industry: 'Industrial Automation',
    location: 'Suzhou → Suzhou',
    location_zh: '苏州 → 苏州',
  },
  {
    id: 'ts4',
    from: 'SQE (Supplier Quality)',
    from_zh: '供应商质量工程师',
    from_de: 'Lieferantenqualitätsingenieur',
    to: 'Data Analyst, Supply Chain',
    to_zh: '供应链数据分析师',
    to_de: 'Datenanalyst Lieferkette',
    duration_months: 6,
    salary_before: '48K',
    salary_after: '65K',
    currency: '€',
    evidence_note: 'Representative pattern from SQE -> supply-chain analytics',
    evidence_note_zh: '基于 SQE -> 供应链分析的代表性样本',
    evidence_note_de: 'Repräsentatives Muster aus SQE -> Supply-Chain-Analyse',
    key_skill: 'SQL + Power BI + VDA 6.3',
    quote: 'Every SQE already does data analysis — we just call it "audit reporting." Learning SQL formalized what I was doing in Excel. The domain knowledge is the moat.',
    quote_zh: '每个SQE其实都在做数据分析——只是叫"审核报告"。学SQL把我Excel里做的事正规化了。行业知识才是真正的护城河。',
    quote_de: 'Jeder SQE macht schon Datenanalyse — wir nennen es nur "Auditberichte." SQL hat formalisiert, was ich in Excel tat.',
    industry: 'Automotive',
    location: 'Munich → Munich',
    location_zh: '慕尼黑 → 慕尼黑',
  },
  {
    id: 'ts5',
    from: 'Process Engineer, Chemical',
    from_zh: '化工工艺工程师',
    from_de: 'Verfahrensingenieur Chemie',
    to: 'Battery Cell Engineer',
    to_zh: '电池电芯工程师',
    to_de: 'Batteriezell-Ingenieur',
    duration_months: 12,
    salary_before: '12K',
    salary_after: '30K',
    currency: '¥',
    evidence_note: 'Representative pattern from process engineering -> battery manufacturing',
    evidence_note_zh: '基于工艺工程 -> 电池制造的代表性样本',
    evidence_note_de: 'Repräsentatives Muster aus Verfahrenstechnik -> Batteriefertigung',
    key_skill: 'Electrochemistry + DOE + Python',
    quote: 'Chemical process control and battery manufacturing share 80% of the same fundamentals. I took one Coursera course on electrochemistry and three months of DOE practice. The hiring manager said my process optimization mindset was exactly what they lacked.',
    quote_zh: '化工过程控制和电池制造有80%的基础知识重叠。我上了一门电化学Coursera课程，练了三个月DOE。面试官说我的过程优化思维正是他们缺的。',
    quote_de: 'Chemische Prozesskontrolle und Batteriefertigung teilen 80% der Grundlagen. Ein Coursera-Kurs zur Elektrochemie genügte.',
    industry: 'Energy Equipment',
    location: 'Nanjing → Hefei',
    location_zh: '南京 → 合肥',
  },
];
