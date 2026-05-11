import { buildProfessionalActions } from './actions';
import { evidence, skills, workTasks } from './catalog';
import { buildRoleSignal, getMarketRoleCodes, sortSignals } from './scoring';
import type { PathResult, PathStep, ProfessionalPathInput } from './types';

export function buildProfessionalPath(input: ProfessionalPathInput): PathResult {
  const selectedTasks = workTasks.filter((task) => input.taskIds.includes(task.id));
  const skillIds = [...new Set([...selectedTasks.flatMap((task) => task.skillIds), ...input.toolSkillIds])];
  const selectedSkills = skills.filter((skill) => skillIds.includes(skill.id));
  const evidenceIds = [...new Set([...selectedTasks.flatMap((task) => task.evidenceIds), ...selectedSkills.flatMap((skill) => skill.evidenceIds)])];
  const selectedEvidence = evidence.filter((item) => evidenceIds.includes(item.id));
  const roleCodes = getMarketRoleCodes(
    [...new Set([...selectedTasks.flatMap((task) => task.adjacentRoleCodes), ...selectedSkills.flatMap((skill) => skill.roleCodes), input.targetRoleCode].filter(Boolean) as string[])],
    input.market,
  );
  const roleSignals = sortSignals(
    roleCodes
      .map((roleCode) => buildRoleSignal(roleCode, selectedSkills, selectedEvidence))
      .filter((signal): signal is NonNullable<typeof signal> => Boolean(signal)),
  );
  const recommendedRoleCode = roleSignals[0]?.roleCode ?? roleCodes[0] ?? '';

  const steps: PathStep[] = [
    {
      id: 'current-role',
      kind: 'work-task',
      labels: { en: input.currentRole, zh: input.currentRole },
      summaryZh: `从你当前的${input.currentRole || '工作经历'}开始，先拆解日常任务而不是直接判断岗位。`,
    },
    ...selectedTasks.slice(0, 2).map((task): PathStep => ({
      id: task.id,
      kind: 'work-task',
      labels: task.labels,
      summaryZh: `${task.labels.zh}可以拆出${task.skillIds.map((id) => skills.find((skill) => skill.id === id)?.labels.zh).filter(Boolean).join('、')}。`,
    })),
    ...selectedSkills.slice(0, 2).map((skill): PathStep => ({
      id: skill.id,
      kind: 'skill',
      labels: skill.labels,
      summaryZh: `${skill.labels.zh}是可迁移技能，可以连接相邻岗位。`,
    })),
    ...selectedEvidence.slice(0, 1).map((item): PathStep => ({
      id: item.id,
      kind: 'evidence',
      labels: item.labels,
      summaryZh: `${item.labels.zh}可以把经验翻译成简历和面试证据。`,
    })),
    {
      id: recommendedRoleCode,
      kind: 'role',
      labels: { en: roleSignals[0]?.title ?? 'Target role', zh: roleSignals[0]?.titleZh ?? '目标岗位' },
      summaryZh: roleSignals[0] ? `${roleSignals[0].titleZh}是当前经验继承率较高的目标岗位。` : '当前路径需要继续补充岗位数据。',
      score: roleSignals[0]?.opportunityScore,
    },
  ];

  return {
    mode: 'professional',
    steps,
    roleSignals,
    recommendedRoleCode,
    actionItems: buildProfessionalActions(roleSignals[0]),
    explanationZh: `这条路径把${input.currentRole || '已有经历'}拆成任务、技能、业绩证据和相邻岗位。`,
  };
}
