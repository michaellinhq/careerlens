import { evidence, skills } from './catalog';
import type { ActionItem, EvidenceEntry, RoleSignal } from './types';

function firstEvidence(role: RoleSignal): EvidenceEntry | undefined {
  return evidence.find((item) => role.evidenceIds.includes(item.id));
}

export function buildStudentActions(role: RoleSignal | undefined): ActionItem[] {
  if (!role) return [];
  const evidenceItem = firstEvidence(role);
  const primaryProof = role.skillProofs[0];
  const missingSkill = primaryProof?.skillZh ?? role.missingSkills[0] ?? '一个关键岗位技能';
  return [
    {
      id: 'student-course',
      titleZh: `选一门补强${missingSkill}的课程`,
      bodyZh: '优先选择能产出作业、实验或课程设计的课程，避免只停留在听课。',
      actionType: 'course',
      effortWeeks: 4,
      linkedSkillIds: [],
      proof: primaryProof,
    },
    {
      id: 'student-project',
      titleZh: evidenceItem ? `做一个${evidenceItem.labels.zh}` : '做一个可展示项目',
      bodyZh: evidenceItem ? `交付物包括：${evidenceItem.deliverablesZh.join('、')}。` : '项目必须能展示过程、结果和你承担的部分。',
      actionType: 'project',
      effortWeeks: evidenceItem?.estimatedWeeks ?? 4,
      linkedSkillIds: evidenceItem?.provesSkillIds ?? [],
      proof: primaryProof,
    },
    {
      id: 'student-search',
      titleZh: `搜索${role.titleZh}相关实习关键词`,
      bodyZh: '用岗位名、核心技能和行业名组合搜索，不只搜索专业名称。',
      actionType: 'search',
      effortWeeks: 1,
      linkedSkillIds: [],
    },
  ];
}

export function buildProfessionalActions(role: RoleSignal | undefined): ActionItem[] {
  if (!role) return [];
  const evidenceItem = firstEvidence(role);
  const skillHint = skills.find((skill) => role.matchedSkills.includes(skill.labels.zh))?.labels.zh ?? '可迁移技能';
  const primaryProof = role.skillProofs[0];
  const missingSkill = primaryProof?.skillZh ?? role.missingSkills[0];
  return [
    {
      id: 'professional-resume',
      titleZh: `把${skillHint}写成业绩证据`,
      bodyZh: evidenceItem?.resumeBulletPatternZh ?? '用动作、对象、方法和结果改写一条简历 bullet。',
      actionType: 'resume',
      effortWeeks: 1,
      linkedSkillIds: evidenceItem?.provesSkillIds ?? [],
      proof: primaryProof,
    },
    {
      id: 'professional-gap-project',
      titleZh: missingSkill ? `补一个${missingSkill}小项目` : '补一个迁移项目',
      bodyZh: `项目目标是证明你能进入${role.titleZh}的工作语境，而不是重新证明所有经历。`,
      actionType: 'portfolio',
      effortWeeks: 4,
      linkedSkillIds: [],
      proof: primaryProof,
    },
    {
      id: 'professional-search',
      titleZh: '投递相邻岗位关键词',
      bodyZh: `搜索${role.titleZh}、${role.industry}、${role.requiredSkills.slice(0, 2).join('、')}，先找经验继承率高的岗位。`,
      actionType: 'search',
      effortWeeks: 1,
      linkedSkillIds: [],
    },
  ];
}
