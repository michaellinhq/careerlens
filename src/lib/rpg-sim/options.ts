export interface IndustryOption {
  id: string;
  titleZh: string;
  subtitleZh: string;
  signalZh: string;
  demandScore: number;
  competitionScore: number;
  primaryRoleId: string;
  roleHintsZh: string[];
}

export interface MarketCityOption {
  id: string;
  cityZh: string;
  countryZh: string;
  clusterZh: string;
  salaryP50: string;
  livingPressure: number;
  baseDemand: number;
  competitionScore: number;
  industryDemand: Record<string, number>;
}

export const industryOptions: IndustryOption[] = [
  {
    id: 'new-energy',
    titleZh: '新能源',
    subtitleZh: '电池/储能/光伏/充电',
    signalZh: '岗位多，项目证据要求高',
    demandScore: 86,
    competitionScore: 74,
    primaryRoleId: 'cn-ie',
    roleHintsZh: ['自动化工程师', '工艺工程师', '质量改善', '设备工程师'],
  },
  {
    id: 'smart-manufacturing',
    titleZh: '智能制造',
    subtitleZh: '自动化/PLC/产线数字化',
    signalZh: '技能路线清晰，适合做项目副本',
    demandScore: 82,
    competitionScore: 66,
    primaryRoleId: 'cn-ie',
    roleHintsZh: ['工业工程师', '自动化工程师', 'MES实施', '生产数据分析'],
  },
  {
    id: 'semiconductor',
    titleZh: '半导体',
    subtitleZh: '设备/良率/工艺/厂务',
    signalZh: '门槛高，薪资上限高',
    demandScore: 80,
    competitionScore: 79,
    primaryRoleId: 'cn-rde',
    roleHintsZh: ['设备工程师', '工艺工程师', '测试工程师', '良率工程师'],
  },
  {
    id: 'automotive',
    titleZh: '汽车与零部件',
    subtitleZh: '整车/供应链/智能座舱',
    signalZh: '城市选择影响很大',
    demandScore: 78,
    competitionScore: 68,
    primaryRoleId: 'cn-lean',
    roleHintsZh: ['质量工程师', '供应链工程师', '精益生产', '项目工程师'],
  },
  {
    id: 'robotics',
    titleZh: '机器人',
    subtitleZh: '本体/集成/视觉/运动控制',
    signalZh: '作品集很关键',
    demandScore: 74,
    competitionScore: 72,
    primaryRoleId: 'cn-mne',
    roleHintsZh: ['机器人工程师', '现场应用', '调试工程师', '控制工程师'],
  },
  {
    id: 'medical-device',
    titleZh: '医疗器械',
    subtitleZh: '质量体系/研发/注册制造',
    signalZh: '稳定但重合规表达',
    demandScore: 70,
    competitionScore: 58,
    primaryRoleId: 'cn-lean',
    roleHintsZh: ['质量体系', '生产工程师', '验证工程师', '工艺转移'],
  },
  {
    id: 'consumer-electronics',
    titleZh: '消费电子',
    subtitleZh: '结构/测试/供应链/制造',
    signalZh: '节奏快，迭代压力高',
    demandScore: 76,
    competitionScore: 76,
    primaryRoleId: 'cn-rde',
    roleHintsZh: ['研发工程师', '测试工程师', 'NPI工程师', '供应商质量'],
  },
  {
    id: 'chemical-materials',
    titleZh: '化工与材料',
    subtitleZh: '工艺/安全/材料验证',
    signalZh: '专业匹配度更重要',
    demandScore: 68,
    competitionScore: 54,
    primaryRoleId: 'cn-lean',
    roleHintsZh: ['工艺工程师', 'EHS', '材料测试', '质量改善'],
  },
];

export const marketCityOptions: MarketCityOption[] = [
  { id: 'shanghai', cityZh: '上海', countryZh: '中国', clusterZh: '总部/研发/外企制造', salaryP50: '¥25K/月', livingPressure: 82, baseDemand: 78, competitionScore: 76, industryDemand: { 'new-energy': 80, 'smart-manufacturing': 76, semiconductor: 82, automotive: 78, robotics: 73 } },
  { id: 'suzhou', cityZh: '苏州', countryZh: '中国', clusterZh: '先进制造/自动化/外企工厂', salaryP50: '¥21K/月', livingPressure: 55, baseDemand: 76, competitionScore: 58, industryDemand: { 'new-energy': 82, 'smart-manufacturing': 84, semiconductor: 78, automotive: 74, robotics: 72 } },
  { id: 'shenzhen', cityZh: '深圳', countryZh: '中国', clusterZh: '硬件/机器人/消费电子', salaryP50: '¥24K/月', livingPressure: 76, baseDemand: 75, competitionScore: 79, industryDemand: { robotics: 84, 'consumer-electronics': 88, 'smart-manufacturing': 76, 'new-energy': 74 } },
  { id: 'beijing', cityZh: '北京', countryZh: '中国', clusterZh: '研发/央国企/智能硬件', salaryP50: '¥24K/月', livingPressure: 80, baseDemand: 70, competitionScore: 74, industryDemand: { robotics: 76, semiconductor: 74, 'new-energy': 70 } },
  { id: 'hangzhou', cityZh: '杭州', countryZh: '中国', clusterZh: '数字化/电商供应链/智能制造', salaryP50: '¥22K/月', livingPressure: 68, baseDemand: 72, competitionScore: 66, industryDemand: { 'smart-manufacturing': 78, robotics: 72, 'consumer-electronics': 70 } },
  { id: 'nanjing', cityZh: '南京', countryZh: '中国', clusterZh: '电子/汽车/高校人才', salaryP50: '¥19K/月', livingPressure: 58, baseDemand: 70, competitionScore: 60, industryDemand: { semiconductor: 76, automotive: 72, 'new-energy': 70 } },
  { id: 'hefei', cityZh: '合肥', countryZh: '中国', clusterZh: '新能源/显示/汽车', salaryP50: '¥18K/月', livingPressure: 46, baseDemand: 73, competitionScore: 55, industryDemand: { 'new-energy': 84, semiconductor: 78, automotive: 74 } },
  { id: 'wuhan', cityZh: '武汉', countryZh: '中国', clusterZh: '汽车/光电/制造基地', salaryP50: '¥17K/月', livingPressure: 48, baseDemand: 69, competitionScore: 54, industryDemand: { automotive: 78, 'smart-manufacturing': 72, semiconductor: 70 } },
  { id: 'chengdu', cityZh: '成都', countryZh: '中国', clusterZh: '电子/软件硬件/航空制造', salaryP50: '¥17K/月', livingPressure: 52, baseDemand: 66, competitionScore: 56, industryDemand: { 'consumer-electronics': 74, 'smart-manufacturing': 68, 'medical-device': 64 } },
  { id: 'guangzhou', cityZh: '广州', countryZh: '中国', clusterZh: '汽车/消费品/供应链', salaryP50: '¥19K/月', livingPressure: 64, baseDemand: 68, competitionScore: 63, industryDemand: { automotive: 78, 'consumer-electronics': 72, 'medical-device': 68 } },
  { id: 'ningbo', cityZh: '宁波', countryZh: '中国', clusterZh: '零部件/材料/港口制造', salaryP50: '¥17K/月', livingPressure: 50, baseDemand: 64, competitionScore: 49, industryDemand: { automotive: 70, 'chemical-materials': 76, 'smart-manufacturing': 66 } },
  { id: 'qingdao', cityZh: '青岛', countryZh: '中国', clusterZh: '装备制造/家电/海工', salaryP50: '¥16K/月', livingPressure: 47, baseDemand: 62, competitionScore: 46, industryDemand: { 'smart-manufacturing': 68, 'consumer-electronics': 66, 'chemical-materials': 64 } },
  { id: 'munich', cityZh: '慕尼黑', countryZh: '德国', clusterZh: '汽车/自动化/高端制造', salaryP50: '€65K/年', livingPressure: 84, baseDemand: 68, competitionScore: 48, industryDemand: { automotive: 80, robotics: 70, 'smart-manufacturing': 72 } },
  { id: 'stuttgart', cityZh: '斯图加特', countryZh: '德国', clusterZh: '汽车/机械/供应链', salaryP50: '€62K/年', livingPressure: 72, baseDemand: 66, competitionScore: 46, industryDemand: { automotive: 84, 'smart-manufacturing': 70, robotics: 66 } },
  { id: 'berlin', cityZh: '柏林', countryZh: '德国', clusterZh: '创业/硬件/医疗科技', salaryP50: '€58K/年', livingPressure: 70, baseDemand: 60, competitionScore: 50, industryDemand: { 'medical-device': 72, robotics: 64, 'consumer-electronics': 60 } },
  { id: 'hamburg', cityZh: '汉堡', countryZh: '德国', clusterZh: '港口/航空/医疗器械', salaryP50: '€57K/年', livingPressure: 66, baseDemand: 58, competitionScore: 44, industryDemand: { 'medical-device': 68, 'smart-manufacturing': 60, 'chemical-materials': 62 } },
];

export function getIndustryOption(industryId?: string): IndustryOption {
  return industryOptions.find((item) => item.id === industryId) ?? industryOptions[0];
}

export function getMarketDemand(city: MarketCityOption, industryId?: string): number {
  return city.industryDemand[industryId ?? ''] ?? city.baseDemand;
}
