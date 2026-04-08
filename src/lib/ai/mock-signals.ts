import type { NewsAnalysis, SignalTrend } from './types';

/** Mock news data for demo — will be replaced by RSS + AI analysis */
export const mockNews: NewsAnalysis[] = [
  {
    id: 'news-1',
    date: '2026-04-07',
    headline: 'EU CBAM Carbon Border Tax Phase 2 Takes Effect',
    headline_zh: '欧盟碳边境税CBAM第二阶段正式生效',
    source: 'Reuters',
    impacts: [
      { industry_id: 'energy', direction: 'positive', magnitude: 85, reason: 'Carbon accounting and ESG talent demand surges', reason_zh: '碳核算和ESG人才需求激增' },
      { industry_id: 'automotive', direction: 'positive', magnitude: 55, reason: 'Supply chain carbon footprint audit requirements', reason_zh: '供应链碳足迹审计需求增加' },
      { industry_id: 'aerospace', direction: 'positive', magnitude: 40, reason: 'Sustainable aviation fuel certification needs', reason_zh: '可持续航空燃料认证需求' },
      { industry_id: 'industrial-automation', direction: 'negative', magnitude: 25, reason: 'High-carbon legacy equipment phase-out pressure', reason_zh: '高碳排传统设备淘汰压力' },
    ],
  },
  {
    id: 'news-2',
    date: '2026-04-05',
    headline: 'Tesla Shanghai Announces Model Q Mass Production, 2000 Engineering Jobs',
    headline_zh: '特斯拉上海宣布Model Q量产计划，新增2000个工程岗位',
    source: 'Bloomberg',
    impacts: [
      { industry_id: 'automotive', direction: 'positive', magnitude: 78, reason: 'EV manufacturing and quality engineer demand spikes in Shanghai', reason_zh: '上海电动车制造和质量工程师需求激增' },
      { industry_id: 'robotics', direction: 'positive', magnitude: 65, reason: 'Production line automation and robot integration needs', reason_zh: '产线自动化和机器人集成需求' },
      { industry_id: 'electronics', direction: 'positive', magnitude: 50, reason: 'EV power electronics and BMS component demand', reason_zh: '电动车功率电子和BMS元件需求' },
    ],
  },
  {
    id: 'news-3',
    date: '2026-04-03',
    headline: 'China Releases National Robotics Industry Plan 2026-2030',
    headline_zh: '中国发布《机器人产业发展规划2026-2030》',
    source: 'Xinhua',
    impacts: [
      { industry_id: 'robotics', direction: 'positive', magnitude: 92, reason: 'Government subsidies and mandatory adoption targets for smart manufacturing', reason_zh: '政府补贴和智能制造强制推广目标' },
      { industry_id: 'industrial-automation', direction: 'positive', magnitude: 75, reason: 'Industrial upgrading drives PLC/SCADA/MES demand', reason_zh: '产业升级推动PLC/SCADA/MES需求' },
      { industry_id: 'electronics', direction: 'positive', magnitude: 45, reason: 'Sensor and chip demand for domestic robots', reason_zh: '国产机器人传感器和芯片需求' },
    ],
  },
  {
    id: 'news-4',
    date: '2026-04-01',
    headline: 'Siemens and SAP Announce Joint Digital Twin Platform for Manufacturing',
    headline_zh: 'Siemens和SAP联合发布制造业数字孪生平台',
    source: 'Financial Times',
    impacts: [
      { industry_id: 'industrial-automation', direction: 'positive', magnitude: 70, reason: 'Digital twin and MES integration skills become essential', reason_zh: '数字孪生和MES集成技能成为必备' },
      { industry_id: 'it-manufacturing', direction: 'positive', magnitude: 80, reason: 'IT-OT convergence creates new hybrid roles', reason_zh: 'IT-OT融合创造新型混合岗位' },
      { industry_id: 'consulting', direction: 'positive', magnitude: 55, reason: 'Digital transformation consulting demand increases', reason_zh: '数字化转型咨询需求增加' },
    ],
  },
  {
    id: 'news-5',
    date: '2026-03-28',
    headline: 'US Expands Semiconductor Export Controls to Include Mature Nodes',
    headline_zh: '美国将芯片出口管制扩大到成熟制程',
    source: 'WSJ',
    impacts: [
      { industry_id: 'electronics', direction: 'positive', magnitude: 88, reason: 'Domestic chip self-sufficiency push — IC design and fab engineers in extreme demand', reason_zh: '国产芯片自主化——IC设计和晶圆制造工程师极度紧缺' },
      { industry_id: 'automotive', direction: 'negative', magnitude: 30, reason: 'Automotive chip supply chain uncertainty', reason_zh: '汽车芯片供应链不确定性' },
      { industry_id: 'medical-devices', direction: 'negative', magnitude: 20, reason: 'Medical imaging chip sourcing challenges', reason_zh: '医疗影像芯片采购挑战' },
    ],
  },
  {
    id: 'news-6',
    date: '2026-03-25',
    headline: 'Germany Passes Skilled Immigration Act 2.0, Fast-Track for Engineers',
    headline_zh: '德国通过技术移民法2.0版，工程师快速通道',
    source: 'Handelsblatt',
    impacts: [
      { industry_id: 'automotive', direction: 'positive', magnitude: 60, reason: 'German auto OEMs can hire Chinese engineers faster', reason_zh: '德国车企可更快招聘中国工程师' },
      { industry_id: 'energy', direction: 'positive', magnitude: 55, reason: 'Renewable energy sector talent shortage eased', reason_zh: '新能源行业人才短缺缓解' },
      { industry_id: 'medical-devices', direction: 'positive', magnitude: 50, reason: 'Medical device certification engineers in demand', reason_zh: '医疗器械认证工程师需求' },
      { industry_id: 'aerospace', direction: 'positive', magnitude: 45, reason: 'Aerospace quality engineers needed for Airbus expansion', reason_zh: '空客扩产需要航空质量工程师' },
    ],
  },
  {
    id: 'news-7',
    date: '2026-03-22',
    headline: 'CATL Breaks Ground on European Battery Gigafactory #3 in Hungary',
    headline_zh: '宁德时代匈牙利第三座超级电池工厂动工',
    source: 'Reuters',
    impacts: [
      { industry_id: 'energy', direction: 'positive', magnitude: 82, reason: 'Battery engineers and electrochemistry experts critical', reason_zh: '电池工程师和电化学专家极度紧缺' },
      { industry_id: 'automotive', direction: 'positive', magnitude: 45, reason: 'EV supply chain localization in Europe', reason_zh: '电动车供应链欧洲本地化' },
      { industry_id: 'industrial-automation', direction: 'positive', magnitude: 40, reason: 'Gigafactory automation line engineering', reason_zh: '超级工厂自动化产线工程' },
    ],
  },
  {
    id: 'news-8',
    date: '2026-03-18',
    headline: 'AI-Powered Quality Inspection Replaces 40% of Manual Checks at Foxconn',
    headline_zh: '富士康AI质检系统替代40%人工检测',
    source: 'Nikkei Asia',
    impacts: [
      { industry_id: 'electronics', direction: 'positive', magnitude: 55, reason: 'AI quality + computer vision engineers in demand', reason_zh: 'AI质检+机器视觉工程师需求增加' },
      { industry_id: 'it-manufacturing', direction: 'positive', magnitude: 70, reason: 'AI deployment and MLOps roles created', reason_zh: 'AI部署和MLOps新岗位涌现' },
      { industry_id: 'robotics', direction: 'positive', magnitude: 45, reason: 'Vision-guided robot integration', reason_zh: '视觉引导机器人集成' },
    ],
  },
];

export const mockTrend: SignalTrend = {
  period: '2026-03',
  summary: 'Advanced manufacturing demand up 8% overall. EV/battery, robotics, and semiconductor sectors leading growth. German immigration policy opening new international opportunities.',
  summary_zh: '高端制造业整体需求上升8%。电动车/电池、机器人和半导体领域增长领先。德国移民政策为国际化发展开辟新机遇。',
  top_beneficiaries: [
    { industry_id: 'robotics', change_pct: 15 },
    { industry_id: 'energy', change_pct: 12 },
    { industry_id: 'electronics', change_pct: 10 },
    { industry_id: 'automotive', change_pct: 8 },
    { industry_id: 'it-manufacturing', change_pct: 7 },
  ],
  top_risks: [
    { industry_id: 'consulting', change_pct: -3 },
  ],
};
