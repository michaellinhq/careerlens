/**
 * Scenario Bank — 14 manufacturing-specific task scenarios
 *
 * Each scenario maps to a RIASEC dimension. Users rate how they
 * FEEL about doing this task (-50 = dread, +50 = energized).
 *
 * Key design principles:
 * - Every scenario uses specific industry terminology (ASPICE, CMM, PPAP, VDA 6.3)
 * - Scenarios describe CONCRETE situations, not abstract traits
 * - The specificity IS the credibility signal — only someone who's done this work writes these
 */

import type { Scenario } from './types';

export const scenarios: Scenario[] = [
  // ─── R: Realistic (实际型) — hands-on, physical, tool-oriented ───

  {
    id: 'r1',
    dimension: 'R',
    weight: 1.0,
    text: 'Manually calibrating a CMM probe in the metrology lab, running 50 measurement cycles until the Cpk hits 1.67.',
    text_zh: '在计量实验室里手动校准三坐标探头，反复跑50组测量循环直到Cpk达到1.67。',
    text_de: 'Manuelle Kalibrierung eines KMG-Tasters im Messlabor, 50 Messzyklen bis Cpk 1,67 erreicht ist.',
    context: 'Friday afternoon, the production line is waiting for your green light.',
    context_zh: '周五下午，产线在等你的放行结果。',
    context_de: 'Freitagnachmittag, die Produktionslinie wartet auf Ihre Freigabe.',
  },
  {
    id: 'r2',
    dimension: 'R',
    weight: 1.0,
    text: 'Debugging a robotic welding cell on the shop floor — adjusting torch angles, wire feed speed, and shielding gas flow by hand.',
    text_zh: '在车间现场调试机器人焊接工站——手动调整焊枪角度、送丝速度和保护气体流量。',
    text_de: 'Inbetriebnahme einer Roboter-Schweißzelle — Brennerwinkel, Drahtvorschub und Schutzgasfluss manuell einstellen.',
    context: 'The new cell must be qualified before Monday\'s SOP start.',
    context_zh: '新工站必须在周一SOP启动前完成验证。',
    context_de: 'Die Zelle muss vor dem SOP-Start am Montag qualifiziert sein.',
  },

  // ─── I: Investigative (研究型) — analytical, deep thinking ───

  {
    id: 'i1',
    dimension: 'I',
    weight: 1.0,
    text: 'Spending an entire day analyzing a complex field failure — cross-referencing 30 pages of ASPICE test logs to isolate the root cause.',
    text_zh: '花一整天分析一个复杂的外场失效——交叉比对30页ASPICE测试日志来定位根本原因。',
    text_de: 'Einen ganzen Tag damit verbringen, einen komplexen Feldausfall zu analysieren — 30 Seiten ASPICE-Testprotokolle abgleichen.',
    context: 'Nobody else could figure it out. Your manager gave you "full freedom to dig."',
    context_zh: '其他人都没查出来。你经理说"放手去查，别管时间"。',
    context_de: 'Niemand sonst konnte es herausfinden. Ihr Chef sagt: "Graben Sie so tief wie nötig."',
  },
  {
    id: 'i2',
    dimension: 'I',
    weight: 1.0,
    text: 'Designing a DOE experiment matrix to figure out which 3 injection molding parameters cause warpage — then running the statistical analysis yourself.',
    text_zh: '设计一组DOE实验矩阵，搞清楚是哪3个注塑参数导致了翘曲变形——然后亲自跑统计分析。',
    text_de: 'Eine DOE-Versuchsmatrix entwerfen, um die 3 Spritzgussparameter zu identifizieren, die Verzug verursachen — und die statistische Auswertung selbst durchführen.',
    context: 'You have Minitab open and a quiet conference room booked for the afternoon.',
    context_zh: '你打开了Minitab，预定了一个下午的安静会议室。',
    context_de: 'Minitab ist offen, der Besprechungsraum ist den ganzen Nachmittag für Sie reserviert.',
  },
  {
    id: 'i3',
    dimension: 'I',
    secondary: 'C',
    weight: 0.8,
    text: 'Reading a 200-page ISO 26262 standard cover-to-cover to understand a subtle safety integrity level classification dispute.',
    text_zh: '从头到尾阅读200页ISO 26262标准，为了搞清楚一个微妙的安全完整性等级分类争议。',
    text_de: 'Die 200-seitige ISO 26262 von Anfang bis Ende lesen, um eine subtile SIL-Klassifizierungsdiskussion zu verstehen.',
    context: 'The customer claims ASIL-B, your team says ASIL-A. You need to settle this.',
    context_zh: '客户说是ASIL-B，你们团队说是ASIL-A。你需要终结这个争论。',
    context_de: 'Der Kunde sagt ASIL-B, Ihr Team sagt ASIL-A. Sie müssen das klären.',
  },

  // ─── A: Artistic (创造型) — creative, design, visualization ───

  {
    id: 'a1',
    dimension: 'A',
    weight: 1.0,
    text: 'Redesigning your team\'s quality dashboard from scratch — choosing the right charts, colors, and layout to make KPIs tell a story.',
    text_zh: '从零重新设计你们组的质量看板——选择合适的图表、配色和布局，让KPI自己讲故事。',
    text_de: 'Das Qualitäts-Dashboard Ihres Teams von Grund auf neu gestalten — die richtigen Diagramme, Farben und Layouts wählen.',
    context: 'The old dashboard is a mess of Excel screenshots. You want management to actually look at it.',
    context_zh: '旧看板是一堆Excel截图的拼贴。你想让管理层真正看懂。',
    context_de: 'Das alte Dashboard ist ein Chaos aus Excel-Screenshots. Sie wollen, dass das Management es tatsächlich nutzt.',
  },
  {
    id: 'a2',
    dimension: 'A',
    secondary: 'S',
    weight: 0.8,
    text: 'Creating a training course for new hires about your company\'s quality system — structuring the knowledge in your own creative way.',
    text_zh: '为新员工设计一套关于公司质量体系的培训课程——用你觉得最清晰的方式组织知识。',
    text_de: 'Einen Schulungskurs für neue Mitarbeiter zum Qualitätsmanagementsystem erstellen — mit Ihrer eigenen kreativen Struktur.',
    context: 'Your boss said "make it not boring." You have complete creative freedom.',
    context_zh: '老板说"别做成催眠课"。你有完全的创作自由。',
    context_de: 'Ihr Chef sagte: "Mach es nicht langweilig." Sie haben volle kreative Freiheit.',
  },

  // ─── S: Social (社会型) — helping, mentoring, teamwork ───

  {
    id: 's1',
    dimension: 'S',
    weight: 1.0,
    text: 'Mentoring a junior quality engineer through their first customer audit — they\'re nervous, and you walk them through every step.',
    text_zh: '指导一个新人质量工程师完成他的第一次客户审核——他很紧张，你全程一步步带着他走。',
    text_de: 'Einen Junior-Qualitätsingenieur durch sein erstes Kundenaudit begleiten — er ist nervös, Sie führen ihn Schritt für Schritt.',
    context: 'This person reminds you of yourself 8 years ago.',
    context_zh: '这个人让你想起8年前的自己。',
    context_de: 'Diese Person erinnert Sie an sich selbst vor 8 Jahren.',
  },
  {
    id: 's2',
    dimension: 'S',
    secondary: 'E',
    weight: 0.8,
    text: 'Mediating a conflict between production and R&D — they blame each other for a recurring defect, and you need to find common ground.',
    text_zh: '调解生产部和研发部之间的冲突——他们互相甩锅一个反复出现的缺陷，你需要找到共识。',
    text_de: 'Einen Konflikt zwischen Produktion und F&E schlichten — sie beschuldigen sich gegenseitig für einen wiederkehrenden Defekt.',
    context: 'Both directors are in the room. The meeting is getting heated.',
    context_zh: '两个部门总监都在场。会议气氛越来越紧张。',
    context_de: 'Beide Abteilungsleiter sind im Raum. Die Stimmung wird hitzig.',
  },

  // ─── E: Enterprising (企业型) — leading, persuading, deciding ───

  {
    id: 'e1',
    dimension: 'E',
    weight: 1.0,
    text: 'Presenting your quality improvement proposal to the plant director — you need to convince them to invest €200K in a new inspection system.',
    text_zh: '向工厂总经理汇报你的质量改进方案——你需要说服他投入20万欧元采购新的检测系统。',
    text_de: 'Ihren Qualitätsverbesserungsvorschlag dem Werkleiter präsentieren — Sie müssen ihn von einer €200K-Investition überzeugen.',
    context: 'You have 20 minutes and 15 slides. The CFO is skeptical.',
    context_zh: '你有20分钟和15页PPT。CFO持怀疑态度。',
    context_de: 'Sie haben 20 Minuten und 15 Folien. Der CFO ist skeptisch.',
  },
  {
    id: 'e2',
    dimension: 'E',
    weight: 1.0,
    text: 'Negotiating with a customer\'s SQE after a major quality escape — buying time for your corrective action while maintaining the business relationship.',
    text_zh: '在一次重大质量逃逸后和客户SQE谈判——在维护合作关系的同时为你的纠正措施争取时间。',
    text_de: 'Nach einem schweren Qualitätsproblem mit dem Kunden-SQE verhandeln — Zeit für Korrekturmaßnahmen gewinnen und die Geschäftsbeziehung wahren.',
    context: 'The customer is threatening to dual-source. Your VP is watching.',
    context_zh: '客户威胁要引入第二供应商。你的VP在盯着你。',
    context_de: 'Der Kunde droht mit Dual-Sourcing. Ihr VP beobachtet Sie.',
  },

  // ─── C: Conventional (常规型) — organized, systematic, detail-oriented ───

  {
    id: 'c1',
    dimension: 'C',
    weight: 1.0,
    text: 'Updating the FMEA document library — going through 2 years of engineering changes and recording every single revision into the system.',
    text_zh: '更新FMEA文档库——翻阅过去两年的工程变更，把每一条修订逐一录入系统。',
    text_de: 'Die FMEA-Dokumentenbibliothek aktualisieren — 2 Jahre Konstruktionsänderungen durchgehen und jede Revision einzeln im System erfassen.',
    context: 'The VDA 6.3 audit is in 3 weeks. Every record must be traceable.',
    context_zh: 'VDA 6.3审核还有3周。每条记录都必须可追溯。',
    context_de: 'Das VDA 6.3-Audit ist in 3 Wochen. Jeder Eintrag muss rückverfolgbar sein.',
  },
  {
    id: 'c2',
    dimension: 'C',
    weight: 1.0,
    text: 'Compiling a 120-page PPAP submission package — control plans, MSA reports, dimensional results, material certs — checking every field is filled correctly.',
    text_zh: '整理一份120页的PPAP提交文件包——控制计划、MSA报告、尺寸检测结果、材料证书——确认每个字段都填写正确。',
    text_de: 'Ein 120-seitiges PPAP-Paket zusammenstellen — Kontrollpläne, MSA-Berichte, Maßergebnisse, Materialzertifikate — jedes Feld auf Korrektheit prüfen.',
    context: 'It\'s Thursday evening. The customer deadline is tomorrow noon.',
    context_zh: '周四傍晚。客户截止日期是明天中午。',
    context_de: 'Donnerstagabend. Die Kundendeadline ist morgen Mittag.',
  },
];

/** Randomized order for presentation — prevents pattern recognition */
export function getShuffledScenarios(): Scenario[] {
  const arr = [...scenarios];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
