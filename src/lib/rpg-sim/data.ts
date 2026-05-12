import { evidence, skills } from '@/lib/path-engine/catalog';
import { chinaJobs } from '@/lib/jobs-cn';
import type {
  ActionCard,
  CityMarket,
  IdentityProfile,
  InterviewScenario,
  ProjectQuest,
  RpgEvent,
  TargetRole,
} from './types';

type SeedRoleCode = 'CN-IE' | 'CN-RDE' | 'CN-MNE' | 'CN-LEAN';

function buildRole(roleCode: SeedRoleCode, tagsZh: string[]): TargetRole {
  const job = chinaJobs.find((item) => item.code === roleCode);
  if (!job) {
    throw new Error(`Missing RPG role seed for ${roleCode}`);
  }

  return {
    id: roleCode.toLowerCase(),
    roleCode,
    titleZh: job.title_zh,
    titleEn: job.title,
    salaryDisplay: job.salary_display,
    opportunityScore: job.opportunity_score,
    coreSkillIds: skills.filter((skill) => skill.roleCodes.includes(roleCode)).map((skill) => skill.id),
    evidenceIds: evidence.filter((item) => item.roleCodes.includes(roleCode)).map((item) => item.id),
    tagsZh,
  };
}

export const identityProfiles: IdentityProfile[] = [
  {
    id: 'fresh-grad',
    nameZh: '应届生',
    archetypeZh: '时间多，证据少',
    descriptionZh: '有课程基础和试错空间，但作品集与面试信心需要从零搭起来。',
    startingMeters: { energy: 82, money: 38, skill: 28, portfolio: 10, confidence: 42, reputation: 12 },
    traits: ['学习效率+10', '现金压力偏高'],
  },
  {
    id: 'factory-switcher',
    nameZh: '转岗工程师',
    archetypeZh: '现场经验厚，表达证据薄',
    descriptionZh: '懂真实生产问题，但需要把经验翻译成目标岗位听得懂的证据。',
    startingMeters: { energy: 68, money: 55, skill: 42, portfolio: 20, confidence: 46, reputation: 24 },
    traits: ['声望起点较高', '精力恢复较慢'],
  },
  {
    id: 'returnee',
    nameZh: '海归求职者',
    archetypeZh: '履历亮，市场语境需校准',
    descriptionZh: '有外语和项目经历，但需要快速适配中文岗位关键词和城市市场。',
    startingMeters: { energy: 74, money: 62, skill: 38, portfolio: 24, confidence: 50, reputation: 18 },
    traits: ['面试表达+10', '本地人脉不足'],
  },
];

export const targetRoles: TargetRole[] = [
  buildRole('CN-IE', ['数据改善', '制造现场', '效率提升']),
  buildRole('CN-RDE', ['产品研发', '测试验证', '硬技能门槛']),
  buildRole('CN-MNE', ['设备维护', 'PLC', '现场响应']),
  buildRole('CN-LEAN', ['精益改善', '跨部门推动', '高证据要求']),
];

export const cityMarkets: CityMarket[] = [
  {
    id: 'shanghai',
    cityZh: '上海',
    rentPerMonth: 5200,
    roleDemand: { 'cn-ie': 74, 'cn-rde': 78, 'cn-mne': 58, 'cn-lean': 76 },
    networkingBonus: 12,
    livingPressure: 82,
  },
  {
    id: 'suzhou',
    cityZh: '苏州',
    rentPerMonth: 3000,
    roleDemand: { 'cn-ie': 72, 'cn-rde': 66, 'cn-mne': 76, 'cn-lean': 70 },
    networkingBonus: 8,
    livingPressure: 55,
  },
  {
    id: 'shenzhen',
    cityZh: '深圳',
    rentPerMonth: 4300,
    roleDemand: { 'cn-ie': 68, 'cn-rde': 82, 'cn-mne': 62, 'cn-lean': 69 },
    networkingBonus: 10,
    livingPressure: 76,
  },
];

export const actionCards: ActionCard[] = [
  {
    id: 'skill-sprint',
    titleZh: '技能冲刺',
    category: 'learn',
    descriptionZh: '围绕目标岗位补一个关键词技能，并产出学习笔记。',
    durationDays: 3,
    effects: { energy: -10, money: -3, skill: 9, confidence: 3 },
  },
  {
    id: 'portfolio-build',
    titleZh: '作品集副本',
    category: 'build',
    descriptionZh: '推进一个可展示项目，把过程、数据和结论整理成作品页。',
    durationDays: 4,
    effects: { energy: -14, money: -2, skill: 4, portfolio: 13, confidence: 4 },
    unlocksFlag: 'project-started',
  },
  {
    id: 'resume-rewrite',
    titleZh: '简历炼金',
    category: 'apply',
    descriptionZh: '把经历改写成岗位语言，突出动作、方法和结果。',
    durationDays: 2,
    effects: { energy: -6, portfolio: 4, confidence: 6, reputation: 3 },
  },
  {
    id: 'coffee-chat',
    titleZh: '内推情报',
    category: 'network',
    descriptionZh: '找一位目标岗位从业者聊真实工作内容和筛选标准。',
    durationDays: 2,
    effects: { energy: -7, money: -2, confidence: 5, reputation: 8 },
  },
  {
    id: 'batch-apply',
    titleZh: '精准投递',
    category: 'apply',
    descriptionZh: '只投匹配岗位，并为每个岗位调整前三条证据。',
    durationDays: 3,
    effects: { energy: -12, money: -1, confidence: -2, reputation: 6 },
  },
  {
    id: 'recover',
    titleZh: '回血整理',
    category: 'rest',
    descriptionZh: '复盘本周动作，恢复精力，降低连续求职带来的消耗。',
    durationDays: 1,
    effects: { energy: 16, money: -2, confidence: 2 },
  },
];

export const events: RpgEvent[] = [
  {
    id: 'rent-pressure',
    day: 18,
    titleZh: '房租结算日',
    tone: 'risk',
    bodyZh: '现金流开始影响选择，你需要决定是压缩生活成本还是接一个短期兼职。',
    choices: [
      { id: 'cut-cost', labelZh: '压缩开支', outcomeZh: '现金稳住了，但恢复速度下降。', effects: { money: 8, energy: -6, confidence: -2 }, addsFlag: 'frugal-mode' },
      { id: 'side-gig', labelZh: '接短期兼职', outcomeZh: '现金更安全，但项目进度被挤压。', effects: { money: 16, energy: -12, portfolio: -3 }, addsFlag: 'side-gig' },
    ],
  },
  {
    id: 'referral-window',
    day: 42,
    titleZh: '内推窗口',
    tone: 'chance',
    bodyZh: '一位前辈愿意帮你看简历，但只会推荐证据最清楚的候选人。',
    choices: [
      { id: 'show-project', labelZh: '展示项目证据', outcomeZh: '对方能快速判断你的能力边界。', effects: { reputation: 12, confidence: 5, portfolio: 4 }, addsFlag: 'warm-referral' },
      { id: 'ask-advice', labelZh: '先请教方向', outcomeZh: '你得到更清晰的岗位地图。', effects: { skill: 4, confidence: 8, reputation: 4 }, addsFlag: 'mentor-advice' },
    ],
  },
  {
    id: 'final-interview',
    day: 76,
    titleZh: '终面邀约',
    tone: 'story',
    bodyZh: '目标公司发来终面，你需要在项目深挖和业务理解之间选择准备重点。',
    choices: [
      { id: 'deep-project', labelZh: '深挖项目', outcomeZh: '技术追问更稳，但商业问题略显保守。', effects: { portfolio: 7, confidence: 5, energy: -8 }, addsFlag: 'project-defense' },
      { id: 'business-context', labelZh: '补业务理解', outcomeZh: '你能把技能放进真实岗位场景里讲。', effects: { reputation: 6, confidence: 7, energy: -8 }, addsFlag: 'business-ready' },
    ],
  },
];

export const projectQuest: ProjectQuest = {
  id: 'quality-dashboard-quest',
  titleZh: '质量数据看板副本',
  sourceEvidenceId: 'quality-dashboard-project',
  stages: [
    { id: 'dataset', titleZh: '整理样例数据集', requiredPortfolio: 18, reward: { skill: 4, portfolio: 6 } },
    { id: 'analysis', titleZh: '完成帕累托与趋势分析', requiredPortfolio: 34, reward: { skill: 6, portfolio: 8, confidence: 3 } },
    { id: 'story', titleZh: '写成业务改善故事', requiredPortfolio: 52, reward: { portfolio: 10, reputation: 6, confidence: 5 } },
  ],
  resumeBulletZh: '基于质量数据构建分析看板，输出不良分布、趋势追踪和改善优先级。',
};

export const interviewScenario: InterviewScenario = {
  id: 'manufacturing-final',
  titleZh: '制造业岗位终面',
  roleId: 'cn-ie',
  rounds: [
    {
      id: 'screen',
      titleZh: 'HR筛选',
      checks: [
        { meter: 'confidence', target: 45, labelZh: '表达清楚动机' },
        { meter: 'reputation', target: 24, labelZh: '履历可信度' },
      ],
    },
    {
      id: 'technical',
      titleZh: '技术深挖',
      checks: [
        { meter: 'skill', target: 58, labelZh: '方法掌握' },
        { meter: 'portfolio', target: 48, labelZh: '证据完整度' },
      ],
    },
    {
      id: 'manager',
      titleZh: '主管终面',
      checks: [
        { meter: 'confidence', target: 62, labelZh: '抗压表达' },
        { meter: 'reputation', target: 44, labelZh: '团队协作信号' },
      ],
    },
  ],
};
