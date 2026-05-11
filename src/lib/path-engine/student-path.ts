import { buildStudentActions } from './actions';
import { courses, evidence, majorFamilies, skills } from './catalog';
import { buildRoleSignal, getMarketRoleCodes, sortSignals } from './scoring';
import type { PathResult, PathStep, StudentPathInput } from './types';

export function buildStudentPath(input: StudentPathInput): PathResult {
  const major = majorFamilies.find((item) => item.id === input.majorFamilyId) ?? majorFamilies[0];
  const selectedCourseIds = input.courseIds.length > 0 ? input.courseIds : major.courseIds;
  const selectedCourses = courses.filter((course) => selectedCourseIds.includes(course.id));
  const skillIds = [...new Set([...major.skillIds, ...selectedCourses.flatMap((course) => course.skillIds), ...input.interestSkillIds])];
  const selectedSkills = skills.filter((skill) => skillIds.includes(skill.id));
  const evidenceIds = [...new Set(selectedSkills.flatMap((skill) => skill.evidenceIds))];
  const selectedEvidence = evidence.filter((item) => evidenceIds.includes(item.id));
  const roleCodes = getMarketRoleCodes(
    [...new Set([...major.roleCodes, ...selectedSkills.flatMap((skill) => skill.roleCodes), input.targetRoleCode].filter(Boolean) as string[])],
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
      id: major.id,
      kind: 'major',
      labels: major.labels,
      summaryZh: `从${major.labels.zh}出发，先识别课程能沉淀出的可迁移技能。`,
    },
    ...selectedCourses.slice(0, 2).map((course): PathStep => ({
      id: course.id,
      kind: 'course',
      labels: course.labels,
      summaryZh: `${course.labels.zh}主要支持${course.skillIds.map((id) => skills.find((skill) => skill.id === id)?.labels.zh).filter(Boolean).join('、')}。`,
    })),
    ...selectedSkills.slice(0, 2).map((skill): PathStep => ({
      id: skill.id,
      kind: 'skill',
      labels: skill.labels,
      summaryZh: `${skill.labels.zh}可以支持${skill.roleCodes.slice(0, 2).join('、')}等岗位方向。`,
    })),
    ...selectedEvidence.slice(0, 1).map((item): PathStep => ({
      id: item.id,
      kind: 'evidence',
      labels: item.labels,
      summaryZh: `${item.labels.zh}可以把课程学习转成可展示证据。`,
    })),
    {
      id: recommendedRoleCode,
      kind: 'role',
      labels: { en: roleSignals[0]?.title ?? 'Target role', zh: roleSignals[0]?.titleZh ?? '目标岗位' },
      summaryZh: roleSignals[0] ? `${roleSignals[0].titleZh}是当前路径的优先岗位卡。` : '当前路径需要继续补充岗位数据。',
      score: roleSignals[0]?.opportunityScore,
    },
  ];

  return {
    mode: 'student',
    steps,
    roleSignals,
    recommendedRoleCode,
    actionItems: buildStudentActions(roleSignals[0]),
    explanationZh: `这条路径把${major.labels.zh}拆成课程、技能、项目证据和岗位落点。`,
  };
}
