# Serious Path Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the serious mobile-first CareerLens path product with student and professional entry flows that produce a path map, role card, and action list without requiring a resume.

**Architecture:** Add a small rules-first `path-engine` catalog and scoring layer under `src/lib/path-engine`, then build reusable mobile components under `src/components/path`. Add a new `/path` route that supports student, professional, role lookup, and resume shortcut modes while reusing existing role, industry, salary, and skill data.

**Tech Stack:** Next.js App Router, React 19, TypeScript, TailwindCSS 4, existing `career-map`, `jobs-cn`, `jobs-de`, `resume-parser`, `cart-context`, and `locale-context`.

**Implementation Status (2026-05-05):** MVP implemented on branch `serious-path-product-mvp`.

- Added `/path` route with student, professional, role lookup, and resume shortcut entries.
- Added `src/lib/path-engine` rules-first catalog, scoring, proof, student path, professional path, and action generation modules.
- Added mobile components for entry selection, forms, path map, market snapshot, salary insight, skill proof, role card, and action list.
- Integrated the homepage primary CTA into `/path`, keeping resume analysis as the secondary acceleration path.
- Reused existing high-value modules by compressing `ArbitrageMap` logic into market quadrant tags, wrapping `SalaryDistribution`, and bridging `toolmap` proof assets into role/action cards.
- Verification run: `npx tsc --noEmit --pretty`, targeted ESLint for new path files, `npm run build`, and mobile browser checks at 390px width.
- Full `npm run lint` is still blocked by existing source lint issues outside this MVP scope, but generated `.open-next` and `public/pdf-worker` outputs are now ignored.

---

## Spec

Primary spec: `webapp/docs/superpowers/specs/2026-05-05-serious-path-product-design.md`

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `webapp/eslint.config.mjs` | Ignore OpenNext generated artifacts so lint output reflects source files |
| Create | `webapp/src/lib/path-engine/types.ts` | Shared TypeScript interfaces for catalog entities, inputs, scoring, and output |
| Create | `webapp/src/lib/path-engine/catalog.ts` | Seed catalog for major families, courses, work tasks, skills, evidence, and role links |
| Create | `webapp/src/lib/path-engine/scoring.ts` | Explainable scoring functions for student fit, professional fit, evidence strength, quadrant position, and market risk |
| Create | `webapp/src/lib/path-engine/proof.ts` | Bridge missing skills to existing `toolmap` tools, GitHub paths, training, and capstones |
| Create | `webapp/src/lib/path-engine/student-path.ts` | Build a path result from student inputs |
| Create | `webapp/src/lib/path-engine/professional-path.ts` | Build a path result from professional task selections and optional resume hints |
| Create | `webapp/src/lib/path-engine/actions.ts` | Generate student and professional action lists |
| Create | `webapp/src/lib/path-engine/index.ts` | Public exports for the path engine |
| Create | `webapp/src/components/path/EntrySelector.tsx` | Four-card mobile entry selector |
| Create | `webapp/src/components/path/StudentPathForm.tsx` | Major, stage, course, and interest selection |
| Create | `webapp/src/components/path/ProfessionalPathForm.tsx` | Role, task, tool, achievement, and goal selection |
| Create | `webapp/src/components/path/PathMap.tsx` | Shared chain visualization for student and professional modes |
| Create | `webapp/src/components/path/SeriousRoleCard.tsx` | Role card for salary, skills, backgrounds, evidence, and market signals |
| Create | `webapp/src/components/path/MarketSnapshot.tsx` | Mobile summary of quadrant, competition, barrier, and demand tension |
| Create | `webapp/src/components/path/SalaryInsight.tsx` | Mobile wrapper around `SalaryDistribution` |
| Create | `webapp/src/components/path/SkillProofPanel.tsx` | Mobile wrapper for `toolmap` GitHub, training, tool, and capstone recommendations |
| Create | `webapp/src/components/path/ActionList.tsx` | Concrete action list renderer |
| Create | `webapp/src/app/path/page.tsx` | Client route that hosts the new path flow |
| Modify | `webapp/src/app/page.tsx` | Make choice-first path flow the dominant homepage CTA and demote resume paste |

---

### Task 1: Lint Scope Hygiene

**Files:**
- Modify: `webapp/eslint.config.mjs`

- [ ] **Step 1: Add OpenNext generated output to global ignores**

Change the ignore list to:

```typescript
globalIgnores([
  ".next/**",
  "out/**",
  "build/**",
	  ".open-next/**",
	  "public/pdf-worker/**",
	  "next-env.d.ts",
	]),
```

- [ ] **Step 2: Run lint and confirm generated files disappear from output**

Run:

```bash
cd /Users/haiqing/WeChatProjects/miniprogram-2/webapp
npm run lint
```

Expected:

```text
No diagnostics from .open-next, .next, out, or public/pdf-worker paths.
Source-level lint findings may remain.
```

- [ ] **Step 3: Commit**

Run:

```bash
git add eslint.config.mjs
git commit -m "chore: ignore opennext generated files in lint"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 2: Path Engine Types

**Files:**
- Create: `webapp/src/lib/path-engine/types.ts`

- [ ] **Step 1: Create the path engine directory**

Run:

```bash
cd /Users/haiqing/WeChatProjects/miniprogram-2/webapp
mkdir -p src/lib/path-engine
```

- [ ] **Step 2: Add shared interfaces**

Create `src/lib/path-engine/types.ts`:

```typescript
export type PathMode = 'student' | 'professional' | 'role' | 'resume';
export type Market = 'CN' | 'DE';

export interface LabelSet {
  en: string;
  zh: string;
  de?: string;
  gameLabel?: string;
  gameCategory?: string;
  gameHint?: string;
}

export interface MajorFamily {
  id: string;
  labels: LabelSet;
  courseIds: string[];
  skillIds: string[];
  roleCodes: string[];
}

export interface CourseEntry {
  id: string;
  labels: LabelSet;
  majorFamilyIds: string[];
  skillIds: string[];
  difficulty: 'foundation' | 'intermediate' | 'advanced';
}

export interface SkillEntry {
  id: string;
  labels: LabelSet;
  category: 'engineering' | 'data' | 'automation' | 'quality' | 'business' | 'communication';
  roleCodes: string[];
  evidenceIds: string[];
  learningWeeks: number;
}

export interface WorkTaskEntry {
  id: string;
  labels: LabelSet;
  skillIds: string[];
  evidenceIds: string[];
  adjacentRoleCodes: string[];
}

export interface EvidenceEntry {
  id: string;
  labels: LabelSet;
  provesSkillIds: string[];
  roleCodes: string[];
  deliverables: string[];
  deliverablesZh: string[];
  resumeBulletPatternZh: string;
  resumeBulletPatternEn: string;
  evidenceType: 'student-project' | 'professional-achievement' | 'portfolio-project';
  estimatedWeeks: number;
}

export interface SalaryPercentileRow {
  label: 'CN' | 'DE' | 'US';
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  currency: '¥' | '€' | '$';
  unit: 'K/月' | 'K/yr';
  userValue?: number;
  sourceNote: string;
}

export interface MarketPosition {
  demandTension: number;
  quadrantKey: 'gold' | 'red-ocean' | 'blue-ocean' | 'sunset';
  quadrantLabelZh: string;
  quadrantBodyZh: string;
}

export interface SkillProof {
  skill: string;
  skillZh: string;
  tools: Array<{ name: string; nameZh: string; url: string; tier: string }>;
  training: Array<{ name: string; nameZh: string; url: string; region: string; priceRange: string }>;
  githubPath: Array<{ repoName: string; repoUrl: string; stars: string; whatToLearnZh: string; estimatedHours: number }>;
  capstone?: {
    titleZh: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeHours: number;
    deliverablesZh: string[];
    provesToEmployerZh: string;
  };
}

export interface StudentPathInput {
  mode: 'student';
  identity: 'high-school' | 'university' | 'early-graduate';
  majorFamilyId: string;
  stage: 'choosing-major' | 'year-1' | 'year-2' | 'year-3' | 'year-4' | 'graduated';
  courseIds: string[];
  interestSkillIds: string[];
  targetRoleCode?: string;
  market: Market;
}

export interface ProfessionalPathInput {
  mode: 'professional';
  currentRole: string;
  currentIndustry: string;
  taskIds: string[];
  toolSkillIds: string[];
  achievementHints: string[];
  goal: 'salary' | 'industry-switch' | 'overseas' | 'stability' | 'lower-burnout' | 'expert' | 'entrepreneurship';
  targetRoleCode?: string;
  market: Market;
}

export interface PathStep {
  id: string;
  kind: 'major' | 'course' | 'work-task' | 'skill' | 'evidence' | 'role' | 'industry';
  labels: LabelSet;
  summaryZh: string;
  score?: number;
}

export interface RoleSignal {
  roleCode: string;
  title: string;
  titleZh: string;
  industry: string;
  salaryDisplay: string;
  opportunityScore: number;
  competitionLabelZh: string;
  barrierLabelZh: string;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  evidenceIds: string[];
  marketPosition: MarketPosition;
  salaryPercentiles: SalaryPercentileRow[];
  skillProofs: SkillProof[];
}

export interface ActionItem {
  id: string;
  titleZh: string;
  bodyZh: string;
  actionType: 'course' | 'project' | 'resume' | 'search' | 'interview' | 'portfolio';
  effortWeeks: number;
  linkedSkillIds: string[];
  proof?: SkillProof;
}

export interface PathResult {
  mode: PathMode;
  steps: PathStep[];
  roleSignals: RoleSignal[];
  recommendedRoleCode: string;
  actionItems: ActionItem[];
  explanationZh: string;
}
```

- [ ] **Step 3: Verify TypeScript accepts the new file**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no new TypeScript errors caused by `src/lib/path-engine/types.ts`.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/lib/path-engine/types.ts
git commit -m "feat: add serious path engine types"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 3: Seed Path Catalog

**Files:**
- Create: `webapp/src/lib/path-engine/catalog.ts`
- Read: `webapp/src/lib/jobs-cn.ts`
- Read: `webapp/src/lib/jobs-de.ts`

- [ ] **Step 1: Add the initial audited catalog**

Create `src/lib/path-engine/catalog.ts`:

```typescript
import type { CourseEntry, EvidenceEntry, MajorFamily, SkillEntry, WorkTaskEntry } from './types';

export const majorFamilies: MajorFamily[] = [
  {
    id: 'mechanical',
    labels: { en: 'Mechanical Engineering', zh: '机械类', gameLabel: '机械门', gameCategory: 'faction' },
    courseIds: ['engineering-mechanics', 'mechanical-design', 'cad-foundation'],
    skillIds: ['cad', 'gd-t', 'mechanical-design', 'root-cause-analysis'],
    roleCodes: ['CN-ME', 'CN-RDE', 'CN-TE', 'DE-MFG-002', 'DE-MFG-009'],
  },
  {
    id: 'automation',
    labels: { en: 'Automation', zh: '自动化类', gameLabel: '自动化宗', gameCategory: 'faction' },
    courseIds: ['control-theory', 'sensor-systems', 'plc-foundation'],
    skillIds: ['plc', 'python', 'sensor-systems', 'control-systems'],
    roleCodes: ['CN-MNE', 'CN-IE', 'DE-MFG-006', 'DE-MFG-007'],
  },
  {
    id: 'electronics',
    labels: { en: 'Electronic Information', zh: '电子信息类', gameLabel: '电子谷', gameCategory: 'faction' },
    courseIds: ['circuit-analysis', 'embedded-systems', 'signal-processing'],
    skillIds: ['embedded-c', 'circuit-analysis', 'testing-validation', 'python'],
    roleCodes: ['CN-RDE', 'DE-MFG-009'],
  },
  {
    id: 'computer-data',
    labels: { en: 'Computer and Data', zh: '计算机/数据类', gameLabel: '计算机派', gameCategory: 'faction' },
    courseIds: ['data-structures', 'database-foundation', 'data-analysis'],
    skillIds: ['python', 'sql', 'power-bi', 'data-analysis'],
    roleCodes: ['CN-IE', 'CN-LEAN', 'DE-MFG-007'],
  },
  {
    id: 'energy',
    labels: { en: 'Energy and Power', zh: '能源动力类', gameLabel: '能源殿', gameCategory: 'faction' },
    courseIds: ['thermodynamics', 'battery-systems', 'energy-management'],
    skillIds: ['energy-management', 'testing-validation', 'data-analysis', 'root-cause-analysis'],
    roleCodes: ['CN-RDE', 'CN-NPI', 'DE-MFG-008', 'DE-MFG-009'],
  },
];

export const courses: CourseEntry[] = [
  { id: 'engineering-mechanics', labels: { en: 'Engineering Mechanics', zh: '工程力学', gameLabel: '力学心法' }, majorFamilyIds: ['mechanical'], skillIds: ['mechanical-design', 'root-cause-analysis'], difficulty: 'foundation' },
  { id: 'mechanical-design', labels: { en: 'Mechanical Design', zh: '机械设计', gameLabel: '结构锻造术' }, majorFamilyIds: ['mechanical'], skillIds: ['cad', 'mechanical-design', 'gd-t'], difficulty: 'intermediate' },
  { id: 'cad-foundation', labels: { en: 'CAD Foundation', zh: 'CAD基础', gameLabel: '制图器法' }, majorFamilyIds: ['mechanical'], skillIds: ['cad'], difficulty: 'foundation' },
  { id: 'control-theory', labels: { en: 'Control Theory', zh: '控制原理', gameLabel: '控制心法' }, majorFamilyIds: ['automation'], skillIds: ['control-systems', 'sensor-systems'], difficulty: 'intermediate' },
  { id: 'sensor-systems', labels: { en: 'Sensor Systems', zh: '传感器与检测', gameLabel: '感知术' }, majorFamilyIds: ['automation', 'electronics'], skillIds: ['sensor-systems', 'testing-validation'], difficulty: 'intermediate' },
  { id: 'plc-foundation', labels: { en: 'PLC Foundation', zh: 'PLC基础', gameLabel: '机关控制术' }, majorFamilyIds: ['automation'], skillIds: ['plc', 'control-systems'], difficulty: 'intermediate' },
  { id: 'circuit-analysis', labels: { en: 'Circuit Analysis', zh: '电路分析', gameLabel: '电路心法' }, majorFamilyIds: ['electronics'], skillIds: ['circuit-analysis'], difficulty: 'foundation' },
  { id: 'embedded-systems', labels: { en: 'Embedded Systems', zh: '嵌入式系统', gameLabel: '嵌入式机关术' }, majorFamilyIds: ['electronics'], skillIds: ['embedded-c', 'testing-validation'], difficulty: 'advanced' },
  { id: 'signal-processing', labels: { en: 'Signal Processing', zh: '信号处理', gameLabel: '信号辨识术' }, majorFamilyIds: ['electronics'], skillIds: ['python', 'data-analysis'], difficulty: 'advanced' },
  { id: 'data-structures', labels: { en: 'Data Structures', zh: '数据结构', gameLabel: '算法心法' }, majorFamilyIds: ['computer-data'], skillIds: ['python'], difficulty: 'foundation' },
  { id: 'database-foundation', labels: { en: 'Database Foundation', zh: '数据库基础', gameLabel: '数据仓术' }, majorFamilyIds: ['computer-data'], skillIds: ['sql'], difficulty: 'foundation' },
  { id: 'data-analysis', labels: { en: 'Data Analysis', zh: '数据分析', gameLabel: '洞察镜法' }, majorFamilyIds: ['computer-data'], skillIds: ['python', 'sql', 'power-bi', 'data-analysis'], difficulty: 'intermediate' },
  { id: 'thermodynamics', labels: { en: 'Thermodynamics', zh: '热力学', gameLabel: '热能心法' }, majorFamilyIds: ['energy'], skillIds: ['energy-management'], difficulty: 'foundation' },
  { id: 'battery-systems', labels: { en: 'Battery Systems', zh: '电池系统', gameLabel: '储能术' }, majorFamilyIds: ['energy'], skillIds: ['testing-validation', 'data-analysis'], difficulty: 'advanced' },
  { id: 'energy-management', labels: { en: 'Energy Management', zh: '能源管理', gameLabel: '能效阵法' }, majorFamilyIds: ['energy'], skillIds: ['energy-management', 'power-bi'], difficulty: 'intermediate' },
];

export const skills: SkillEntry[] = [
  { id: 'cad', labels: { en: 'CAD', zh: 'CAD制图' }, category: 'engineering', roleCodes: ['CN-ME', 'CN-RDE', 'DE-MFG-002'], evidenceIds: ['mechanical-assembly-project'], learningWeeks: 4 },
  { id: 'gd-t', labels: { en: 'GD&T', zh: 'GD&T几何尺寸与公差' }, category: 'engineering', roleCodes: ['CN-ME', 'CN-CNC', 'DE-MFG-002'], evidenceIds: ['mechanical-assembly-project'], learningWeeks: 3 },
  { id: 'mechanical-design', labels: { en: 'Mechanical Design', zh: '机械设计' }, category: 'engineering', roleCodes: ['CN-ME', 'CN-RDE', 'DE-MFG-009'], evidenceIds: ['mechanical-assembly-project'], learningWeeks: 6 },
  { id: 'plc', labels: { en: 'PLC', zh: 'PLC控制' }, category: 'automation', roleCodes: ['CN-MNE', 'DE-MFG-006'], evidenceIds: ['plc-mini-line-project'], learningWeeks: 6 },
  { id: 'python', labels: { en: 'Python', zh: 'Python' }, category: 'data', roleCodes: ['CN-IE', 'CN-LEAN', 'DE-MFG-007'], evidenceIds: ['quality-dashboard-project', 'plc-mini-line-project'], learningWeeks: 6 },
  { id: 'sensor-systems', labels: { en: 'Sensor Systems', zh: '传感器应用' }, category: 'automation', roleCodes: ['CN-MNE', 'DE-MFG-006'], evidenceIds: ['plc-mini-line-project'], learningWeeks: 4 },
  { id: 'control-systems', labels: { en: 'Control Systems', zh: '控制系统' }, category: 'automation', roleCodes: ['CN-MNE', 'DE-MFG-006'], evidenceIds: ['plc-mini-line-project'], learningWeeks: 8 },
  { id: 'sql', labels: { en: 'SQL', zh: 'SQL' }, category: 'data', roleCodes: ['CN-IE', 'CN-LEAN'], evidenceIds: ['quality-dashboard-project'], learningWeeks: 4 },
  { id: 'power-bi', labels: { en: 'Power BI', zh: 'Power BI' }, category: 'data', roleCodes: ['CN-IE', 'CN-LEAN', 'DE-MFG-007'], evidenceIds: ['quality-dashboard-project'], learningWeeks: 3 },
  { id: 'data-analysis', labels: { en: 'Data Analysis', zh: '数据分析' }, category: 'data', roleCodes: ['CN-IE', 'CN-LEAN', 'DE-MFG-007'], evidenceIds: ['quality-dashboard-project'], learningWeeks: 5 },
  { id: 'root-cause-analysis', labels: { en: 'Root Cause Analysis', zh: '根因分析' }, category: 'quality', roleCodes: ['CN-PE', 'CN-ME', 'DE-MFG-001'], evidenceIds: ['8d-achievement-case'], learningWeeks: 3 },
  { id: 'testing-validation', labels: { en: 'Testing and Validation', zh: '测试验证' }, category: 'engineering', roleCodes: ['CN-RDE', 'CN-NPI', 'DE-MFG-008'], evidenceIds: ['test-validation-report'], learningWeeks: 5 },
  { id: 'embedded-c', labels: { en: 'Embedded C', zh: '嵌入式C' }, category: 'automation', roleCodes: ['CN-RDE', 'DE-MFG-009'], evidenceIds: ['test-validation-report'], learningWeeks: 8 },
  { id: 'circuit-analysis', labels: { en: 'Circuit Analysis', zh: '电路分析' }, category: 'engineering', roleCodes: ['CN-RDE', 'DE-MFG-009'], evidenceIds: ['test-validation-report'], learningWeeks: 6 },
  { id: 'energy-management', labels: { en: 'Energy Management', zh: '能源管理' }, category: 'engineering', roleCodes: ['CN-PLE', 'DE-MFG-005'], evidenceIds: ['energy-efficiency-report'], learningWeeks: 5 },
];

export const workTasks: WorkTaskEntry[] = [
  { id: 'quality-complaint-8d', labels: { en: 'Customer complaint and 8D closure', zh: '客户投诉与8D闭环' }, skillIds: ['root-cause-analysis', 'data-analysis'], evidenceIds: ['8d-achievement-case'], adjacentRoleCodes: ['CN-PE', 'CN-LEAN', 'DE-MFG-001'] },
  { id: 'production-efficiency', labels: { en: 'Production efficiency improvement', zh: '生产效率改善' }, skillIds: ['root-cause-analysis', 'power-bi', 'data-analysis'], evidenceIds: ['quality-dashboard-project'], adjacentRoleCodes: ['CN-IE', 'CN-LEAN', 'DE-MFG-007'] },
  { id: 'equipment-troubleshooting', labels: { en: 'Equipment troubleshooting', zh: '设备故障排查' }, skillIds: ['plc', 'sensor-systems', 'root-cause-analysis'], evidenceIds: ['plc-mini-line-project'], adjacentRoleCodes: ['CN-MNE', 'DE-MFG-006'] },
  { id: 'supplier-coordination', labels: { en: 'Supplier coordination', zh: '供应商协调' }, skillIds: ['root-cause-analysis', 'testing-validation'], evidenceIds: ['8d-achievement-case'], adjacentRoleCodes: ['CN-NPI', 'DE-MFG-008'] },
  { id: 'engineering-data-reporting', labels: { en: 'Engineering data reporting', zh: '工程数据报表' }, skillIds: ['sql', 'power-bi', 'data-analysis'], evidenceIds: ['quality-dashboard-project'], adjacentRoleCodes: ['CN-IE', 'CN-LEAN', 'DE-MFG-007'] },
];

export const evidence: EvidenceEntry[] = [
  {
    id: 'plc-mini-line-project',
    labels: { en: 'Mini production-line control project', zh: '小型产线控制项目', gameLabel: '小车控制副本' },
    provesSkillIds: ['plc', 'sensor-systems', 'control-systems', 'python'],
    roleCodes: ['CN-MNE', 'DE-MFG-006'],
    deliverables: ['control logic diagram', 'short demo video', 'sensor input and output table'],
    deliverablesZh: ['控制逻辑图', '演示视频', '传感器输入输出表'],
    resumeBulletPatternZh: '完成一个小型产线控制项目，设计PLC/传感器逻辑并输出可演示的控制流程。',
    resumeBulletPatternEn: 'Built a mini production-line control project with PLC and sensor logic, including a demo workflow and input-output documentation.',
    evidenceType: 'student-project',
    estimatedWeeks: 6,
  },
  {
    id: 'quality-dashboard-project',
    labels: { en: 'Quality data dashboard', zh: '质量数据看板' },
    provesSkillIds: ['python', 'sql', 'power-bi', 'data-analysis'],
    roleCodes: ['CN-IE', 'CN-LEAN', 'DE-MFG-007'],
    deliverables: ['sample dataset', 'Pareto analysis', 'SPC chart', 'dashboard screenshot'],
    deliverablesZh: ['样例数据集', '帕累托分析', 'SPC图表', '看板截图'],
    resumeBulletPatternZh: '基于质量数据构建分析看板，输出不良分布、趋势追踪和改善优先级。',
    resumeBulletPatternEn: 'Built a quality analytics dashboard covering defect distribution, trend tracking, and improvement priorities.',
    evidenceType: 'portfolio-project',
    estimatedWeeks: 4,
  },
  {
    id: '8d-achievement-case',
    labels: { en: '8D problem-solving case', zh: '8D问题解决案例' },
    provesSkillIds: ['root-cause-analysis', 'data-analysis', 'testing-validation'],
    roleCodes: ['CN-PE', 'CN-LEAN', 'DE-MFG-001'],
    deliverables: ['problem statement', 'root cause tree', 'corrective action list', 'before-after metric'],
    deliverablesZh: ['问题描述', '根因树', '纠正措施清单', '改善前后指标'],
    resumeBulletPatternZh: '主导客户投诉8D分析，协调生产、工艺和供应商团队完成根因定位与纠正预防措施。',
    resumeBulletPatternEn: 'Led an 8D analysis for customer complaints by coordinating production, process, and supplier teams to identify root causes and corrective actions.',
    evidenceType: 'professional-achievement',
    estimatedWeeks: 2,
  },
  {
    id: 'test-validation-report',
    labels: { en: 'Test validation report', zh: '测试验证报告' },
    provesSkillIds: ['testing-validation', 'embedded-c', 'circuit-analysis'],
    roleCodes: ['CN-RDE', 'CN-NPI', 'DE-MFG-008'],
    deliverables: ['test plan', 'test data', 'failure analysis', 'final report'],
    deliverablesZh: ['测试计划', '测试数据', '失效分析', '最终报告'],
    resumeBulletPatternZh: '完成产品测试验证报告，覆盖测试计划、失效分析和改进建议。',
    resumeBulletPatternEn: 'Completed a product validation report covering test planning, failure analysis, and improvement recommendations.',
    evidenceType: 'student-project',
    estimatedWeeks: 5,
  },
  {
    id: 'energy-efficiency-report',
    labels: { en: 'Energy efficiency report', zh: '能效改善报告' },
    provesSkillIds: ['energy-management', 'data-analysis', 'power-bi'],
    roleCodes: ['CN-PLE', 'DE-MFG-005'],
    deliverables: ['baseline estimate', 'energy loss map', 'improvement proposal', 'savings estimate'],
    deliverablesZh: ['能耗基线估算', '能耗损失地图', '改善方案', '节省估算'],
    resumeBulletPatternZh: '完成能效改善分析，识别主要能耗损失点并提出节能改善方案。',
    resumeBulletPatternEn: 'Completed an energy-efficiency analysis identifying major loss points and improvement actions.',
    evidenceType: 'portfolio-project',
    estimatedWeeks: 4,
  },
];
```

- [ ] **Step 2: Verify catalog IDs are unique**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/lib/path-engine/catalog.ts
git commit -m "feat: add serious path seed catalog"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 4: Skill Proof Bridge

**Files:**
- Create: `webapp/src/lib/path-engine/proof.ts`
- Read: `webapp/src/lib/toolmap/index.ts`
- Read: `webapp/src/lib/toolmap/types.ts`

- [ ] **Step 1: Bridge missing skills to existing toolmap data**

Create `src/lib/path-engine/proof.ts`:

```typescript
import { getToolMapEntries } from '@/lib/toolmap';
import type { SkillProof } from './types';

export function buildSkillProofs(skills: string[], industry?: string): SkillProof[] {
  return skills.slice(0, 3).map((skill) => {
    const entry = getToolMapEntries(skill, industry)[0];
    if (!entry) {
      return {
        skill,
        skillZh: skill,
        tools: [],
        training: [],
        githubPath: [],
      };
    }

    return {
      skill: entry.skill,
      skillZh: entry.skill_zh,
      tools: entry.tools.slice(0, 3).map((tool) => ({
        name: tool.name,
        nameZh: tool.name_zh,
        url: tool.url,
        tier: tool.tier,
      })),
      training: entry.training.slice(0, 2).map((training) => ({
        name: training.name,
        nameZh: training.name_zh,
        url: training.url,
        region: training.region,
        priceRange: training.price_range,
      })),
      githubPath: entry.github_path.slice(0, 2).map((step) => ({
        repoName: step.repo_name,
        repoUrl: step.repo_url,
        stars: step.stars,
        whatToLearnZh: step.what_to_learn_zh,
        estimatedHours: step.estimated_hours,
      })),
      capstone: {
        titleZh: entry.capstone.title_zh,
        difficulty: entry.capstone.difficulty,
        timeHours: entry.capstone.time_hours,
        deliverablesZh: entry.capstone.deliverables_zh,
        provesToEmployerZh: entry.capstone.proves_to_employer_zh,
      },
    };
  });
}
```

- [ ] **Step 2: Verify TypeScript**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no TypeScript errors from `proof.ts`.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/lib/path-engine/proof.ts
git commit -m "feat: bridge path skills to proof resources"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 5: Role Resolution and Scoring

**Files:**
- Create: `webapp/src/lib/path-engine/scoring.ts`
- Read: `webapp/src/lib/data.ts`
- Read: `webapp/src/lib/jobs-cn.ts`
- Read: `webapp/src/lib/jobs-de.ts`
- Read: `webapp/src/lib/path-engine/proof.ts`

- [ ] **Step 1: Add scoring helpers**

Create `src/lib/path-engine/scoring.ts`:

```typescript
import { chinaJobs } from '@/lib/jobs-cn';
import { germanyJobs } from '@/lib/jobs-de';
import { buildSkillProofs } from './proof';
import type { EvidenceEntry, Market, MarketPosition, RoleSignal, SalaryPercentileRow, SkillEntry } from './types';

const allJobs = [...chinaJobs, ...germanyJobs];

export function resolveJobByCode(roleCode: string) {
  return allJobs.find((job) => job.code === roleCode) ?? null;
}

export function getMarketRoleCodes(roleCodes: string[], market: Market): string[] {
  const prefix = market === 'CN' ? 'CN-' : 'DE-';
  const filtered = roleCodes.filter((code) => code.startsWith(prefix));
  return filtered.length > 0 ? filtered : roleCodes;
}

export function labelCompetition(score: number): string {
  if (score >= 80) return '竞争较弱，市场空间相对友好';
  if (score >= 60) return '竞争中等，需要清晰证据';
  if (score >= 40) return '竞争较强，需要项目或业绩证明';
  return '竞争很强，不建议裸投';
}

export function labelBarrier(score: number): string {
  if (score >= 80) return '门槛较高，适合有硬技能或项目的人';
  if (score >= 60) return '门槛中等，补齐关键技能后可尝试';
  if (score >= 40) return '门槛较低，但需要避免同质化竞争';
  return '入门容易，差异化证据很重要';
}

export function estimateSkillCoverage(roleSkills: string[], ownedSkills: string[]): number {
  if (roleSkills.length === 0) return 0;
  const owned = ownedSkills.map((skill) => skill.toLowerCase());
  const matched = roleSkills.filter((skill) => {
    const lower = skill.toLowerCase();
    return owned.some((ownedSkill) => ownedSkill.includes(lower) || lower.includes(ownedSkill));
  });
  return Math.round((matched.length / roleSkills.length) * 100);
}

function calcDemandTension(b: { demand_growth: number; barrier: number; ai_resilience: number; competition: number }): number {
  return Math.round(
    b.demand_growth * 0.30 +
    b.barrier * 0.25 +
    b.ai_resilience * 0.30 +
    (100 - b.competition) * 0.15,
  );
}

function buildMarketPosition(job: NonNullable<ReturnType<typeof resolveJobByCode>>): MarketPosition {
  const tension = calcDemandTension(job.breakdown);
  const salaryScore = job.breakdown.salary;
  if (salaryScore >= 60 && tension >= 60) {
    return {
      demandTension: tension,
      quadrantKey: 'gold',
      quadrantLabelZh: '黄金赛道',
      quadrantBodyZh: '薪资和需求张力都较强，适合优先研究，但仍需要证据支撑。',
    };
  }
  if (salaryScore >= 60) {
    return {
      demandTension: tension,
      quadrantKey: 'red-ocean',
      quadrantLabelZh: '竞争红海',
      quadrantBodyZh: '薪资吸引力较强，但竞争或供需张力不够友好，需要差异化证据。',
    };
  }
  if (tension >= 60) {
    return {
      demandTension: tension,
      quadrantKey: 'blue-ocean',
      quadrantLabelZh: '潜力蓝海',
      quadrantBodyZh: '当前薪资未必最高，但需求张力较强，适合作为提前布局方向。',
    };
  }
  return {
    demandTension: tension,
    quadrantKey: 'sunset',
    quadrantLabelZh: '谨慎观察',
    quadrantBodyZh: '薪资和需求张力都不突出，除非已有明显积累，否则不建议作为主路径。',
  };
}

function buildSalaryPercentiles(job: NonNullable<ReturnType<typeof resolveJobByCode>>): SalaryPercentileRow[] {
  const median = job.currency === 'CNY' ? Math.round(job.salary_raw / 1000) : Math.round(job.salary_raw / 1000);
  if (!Number.isFinite(median) || median <= 0) return [];
  return [{
    label: job.country === 'CN' ? 'CN' : 'DE',
    p10: Math.max(1, Math.round(median * 0.65)),
    p25: Math.max(1, Math.round(median * 0.82)),
    median,
    p75: Math.round(median * 1.18),
    p90: Math.round(median * 1.40),
    currency: job.currency === 'CNY' ? '¥' : '€',
    unit: job.currency === 'CNY' ? 'K/月' : 'K/yr',
    sourceNote: 'MVP estimate derived from the current role median; replace with source percentiles when available.',
  }];
}

export function buildRoleSignal(
  roleCode: string,
  skills: SkillEntry[],
  evidence: EvidenceEntry[],
): RoleSignal | null {
  const job = resolveJobByCode(roleCode);
  if (!job) return null;

  const roleSkillNames = [...job.skills, ...job.technology_skills];
  const matchedSkills = skills
    .filter((skill) => skill.roleCodes.includes(roleCode))
    .map((skill) => skill.labels.zh);
  const missingSkills = roleSkillNames.filter((skill) => {
    const lower = skill.toLowerCase();
    return !matchedSkills.some((owned) => owned.toLowerCase().includes(lower) || lower.includes(owned.toLowerCase()));
  });

  return {
    roleCode: job.code,
    title: job.title,
    titleZh: job.title_zh,
    industry: job.industry,
    salaryDisplay: job.salary_display,
    opportunityScore: job.opportunity_score,
    competitionLabelZh: labelCompetition(job.breakdown.competition),
    barrierLabelZh: labelBarrier(job.breakdown.barrier),
    requiredSkills: roleSkillNames,
    matchedSkills,
    missingSkills,
    evidenceIds: evidence.filter((item) => item.roleCodes.includes(roleCode)).map((item) => item.id),
    marketPosition: buildMarketPosition(job),
    salaryPercentiles: buildSalaryPercentiles(job),
    skillProofs: buildSkillProofs(missingSkills.length > 0 ? missingSkills : roleSkillNames.slice(0, 3), job.industry),
  };
}

export function sortSignals(signals: RoleSignal[]): RoleSignal[] {
  return [...signals].sort((a, b) => b.opportunityScore - a.opportunityScore);
}
```

- [ ] **Step 2: Verify build-time imports**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no module resolution errors for `@/lib/jobs-cn` or `@/lib/jobs-de`.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/lib/path-engine/scoring.ts
git commit -m "feat: add serious path role scoring"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 6: Student Path Builder

**Files:**
- Create: `webapp/src/lib/path-engine/student-path.ts`
- Read: `webapp/src/lib/path-engine/catalog.ts`
- Read: `webapp/src/lib/path-engine/scoring.ts`

- [ ] **Step 1: Add student path generation**

Create `src/lib/path-engine/student-path.ts`:

```typescript
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
    actionItems: [],
    explanationZh: `这条路径把${major.labels.zh}拆成课程、技能、项目证据和岗位落点。`,
  };
}
```

- [ ] **Step 2: Verify TypeScript**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no TypeScript errors from `student-path.ts`.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/lib/path-engine/student-path.ts
git commit -m "feat: add student serious path builder"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 7: Professional Path Builder

**Files:**
- Create: `webapp/src/lib/path-engine/professional-path.ts`
- Read: `webapp/src/lib/path-engine/catalog.ts`
- Read: `webapp/src/lib/path-engine/scoring.ts`

- [ ] **Step 1: Add professional path generation**

Create `src/lib/path-engine/professional-path.ts`:

```typescript
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
    actionItems: [],
    explanationZh: `这条路径把${input.currentRole || '已有经历'}拆成任务、技能、业绩证据和相邻岗位。`,
  };
}
```

- [ ] **Step 2: Verify TypeScript**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no TypeScript errors from `professional-path.ts`.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/lib/path-engine/professional-path.ts
git commit -m "feat: add professional experience path builder"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 8: Action List Generator and Public Exports

**Files:**
- Create: `webapp/src/lib/path-engine/actions.ts`
- Create: `webapp/src/lib/path-engine/index.ts`
- Modify: `webapp/src/lib/path-engine/student-path.ts`
- Modify: `webapp/src/lib/path-engine/professional-path.ts`

- [ ] **Step 1: Add action list generation**

Create `src/lib/path-engine/actions.ts`:

```typescript
import { evidence, skills } from './catalog';
import type { ActionItem, EvidenceEntry, RoleSignal } from './types';

function firstEvidence(role: RoleSignal): EvidenceEntry | undefined {
  return evidence.find((item) => role.evidenceIds.includes(item.id));
}

export function buildStudentActions(role: RoleSignal | undefined): ActionItem[] {
  if (!role) return [];
  const evidenceItem = firstEvidence(role);
  const missingSkill = role.missingSkills[0] ?? '一个关键岗位技能';
  const primaryProof = role.skillProofs[0];
  return [
    {
      id: 'student-course',
      titleZh: `选一门补强${missingSkill}的课程`,
      bodyZh: `优先选择能产出作业、实验或课程设计的课程，避免只停留在听课。`,
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
      bodyZh: `用岗位名、核心技能和行业名组合搜索，不只搜索专业名称。`,
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
      titleZh: role.missingSkills[0] ? `补一个${role.missingSkills[0]}小项目` : '补一个迁移项目',
      bodyZh: `项目目标是证明你能进入${role.titleZh}的工作语境，而不是重新证明所有经历。`,
      actionType: 'portfolio',
      effortWeeks: 4,
      linkedSkillIds: [],
      proof: primaryProof,
    },
    {
      id: 'professional-search',
      titleZh: `投递相邻岗位关键词`,
      bodyZh: `搜索${role.titleZh}、${role.industry}、${role.requiredSkills.slice(0, 2).join('、')}，先找经验继承率高的岗位。`,
      actionType: 'search',
      effortWeeks: 1,
      linkedSkillIds: [],
    },
  ];
}
```

- [ ] **Step 2: Wire actions into path builders**

In `src/lib/path-engine/student-path.ts`, import and use `buildStudentActions`:

```typescript
import { buildStudentActions } from './actions';
```

Change the returned `actionItems` line to:

```typescript
actionItems: buildStudentActions(roleSignals[0]),
```

In `src/lib/path-engine/professional-path.ts`, import and use `buildProfessionalActions`:

```typescript
import { buildProfessionalActions } from './actions';
```

Change the returned `actionItems` line to:

```typescript
actionItems: buildProfessionalActions(roleSignals[0]),
```

- [ ] **Step 3: Add public exports**

Create `src/lib/path-engine/index.ts`:

```typescript
export * from './types';
export * from './catalog';
export * from './scoring';
export * from './proof';
export * from './student-path';
export * from './professional-path';
export * from './actions';
```

- [ ] **Step 4: Verify TypeScript**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no TypeScript errors from path engine exports.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/path-engine
git commit -m "feat: add serious path action generation"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 9: Mobile Path Components

**Files:**
- Create: `webapp/src/components/path/EntrySelector.tsx`
- Create: `webapp/src/components/path/PathMap.tsx`
- Create: `webapp/src/components/path/MarketSnapshot.tsx`
- Create: `webapp/src/components/path/SalaryInsight.tsx`
- Create: `webapp/src/components/path/SkillProofPanel.tsx`
- Create: `webapp/src/components/path/SeriousRoleCard.tsx`
- Create: `webapp/src/components/path/ActionList.tsx`

- [ ] **Step 1: Create component directory**

Run:

```bash
mkdir -p src/components/path
```

- [ ] **Step 2: Add `EntrySelector`**

Create `src/components/path/EntrySelector.tsx`:

```tsx
'use client';

import type { PathMode } from '@/lib/path-engine';

const entries: Array<{ mode: PathMode; title: string; body: string; icon: string; tone: string }> = [
  { mode: 'student', title: '我是学生', body: '从专业和课程找到职业路径', icon: '▣', tone: 'border-blue-200 bg-blue-50' },
  { mode: 'professional', title: '我是职场人', body: '拆解经历，找到可迁移方向', icon: '◆', tone: 'border-emerald-200 bg-emerald-50' },
  { mode: 'role', title: '看岗位要什么', body: '反查岗位需要的技能与证据', icon: '◇', tone: 'border-orange-200 bg-orange-50' },
  { mode: 'resume', title: '已有简历', body: '用简历作为快捷入口', icon: '□', tone: 'border-violet-200 bg-violet-50' },
];

export function EntrySelector({ onSelect }: { onSelect: (mode: PathMode) => void }) {
  return (
    <section className="px-4 py-8">
      <div className="mb-7">
        <div className="text-sm font-semibold text-blue-600">CareerLens / 转行宝</div>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-950">从你的起点开始</h1>
        <p className="mt-2 text-sm text-slate-500">选择一个入口，找到你的职业路径</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {entries.map((entry) => (
          <button
            key={entry.mode}
            type="button"
            onClick={() => onSelect(entry.mode)}
            className={`min-h-36 rounded-2xl border p-4 text-left shadow-sm transition active:scale-[0.99] ${entry.tone}`}
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-bold text-blue-600 shadow-sm">
              {entry.icon}
            </div>
            <div className="text-base font-bold text-slate-950">{entry.title}</div>
            <div className="mt-2 text-xs leading-5 text-slate-500">{entry.body}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add `PathMap`**

Create `src/components/path/PathMap.tsx`:

```tsx
import type { PathResult } from '@/lib/path-engine';

const stepNames: Record<string, string> = {
  major: '专业',
  course: '课程',
  'work-task': '任务',
  skill: '技能',
  evidence: '证据',
  role: '岗位',
  industry: '行业',
};

export function PathMap({ result }: { result: PathResult }) {
  return (
    <section className="px-4 py-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
          {result.mode === 'student' ? '从专业到行业，找到你的方向' : '从经历到新岗位，重新定价你的经验'}
        </div>
        <div className="space-y-3">
          {result.steps.map((step, index) => (
            <div key={`${step.kind}-${step.id}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {index + 1}
                </div>
                {index < result.steps.length - 1 ? <div className="h-8 w-px bg-emerald-300" /> : null}
              </div>
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">{stepNames[step.kind]}</div>
                  {typeof step.score === 'number' ? <div className="text-xs font-semibold text-emerald-700">{step.score}/100</div> : null}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{step.labels.zh}</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{step.summaryZh}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add high-value signal components**

Create `src/components/path/MarketSnapshot.tsx`:

```tsx
import type { RoleSignal } from '@/lib/path-engine';

export function MarketSnapshot({ role }: { role: RoleSignal }) {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-orange-700">市场位置</div>
          <div className="mt-1 text-sm font-bold text-slate-950">{role.marketPosition.quadrantLabelZh}</div>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-700">
          张力 {role.marketPosition.demandTension}/100
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-orange-800">{role.marketPosition.quadrantBodyZh}</p>
      <div className="mt-3 grid gap-2">
        <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600">{role.competitionLabelZh}</div>
        <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600">{role.barrierLabelZh}</div>
      </div>
    </div>
  );
}
```

Create `src/components/path/SalaryInsight.tsx`:

```tsx
import { SalaryDistribution } from '@/components/ui/SalaryDistribution';
import type { RoleSignal } from '@/lib/path-engine';

export function SalaryInsight({ role }: { role: RoleSignal }) {
  if (role.salaryPercentiles.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        暂无可展示的薪资分位数据，先显示岗位薪资区间：{role.salaryDisplay}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-bold text-slate-900">薪资分位</div>
        <div className="text-[10px] text-slate-400">P10-P90</div>
      </div>
      <SalaryDistribution
        compact
        data={role.salaryPercentiles.map((row) => ({
          p10: row.p10,
          p25: row.p25,
          median: row.median,
          p75: row.p75,
          p90: row.p90,
          currency: row.currency,
          unit: row.unit,
          label: row.label,
          userValue: row.userValue,
        }))}
      />
      <p className="mt-2 text-[10px] leading-4 text-slate-400">{role.salaryPercentiles[0]?.sourceNote}</p>
    </div>
  );
}
```

Create `src/components/path/SkillProofPanel.tsx`:

```tsx
import type { SkillProof } from '@/lib/path-engine';

export function SkillProofPanel({ proof }: { proof?: SkillProof }) {
  if (!proof) return null;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3">
      <div className="text-sm font-bold text-slate-950">技能验证：{proof.skillZh}</div>
      {proof.capstone ? (
        <div className="mt-2 rounded-xl bg-white p-3">
          <div className="text-xs font-semibold text-blue-700">推荐证据项目</div>
          <div className="mt-1 text-sm font-bold text-slate-950">{proof.capstone.titleZh}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{proof.capstone.provesToEmployerZh}</p>
          <div className="mt-2 text-[11px] text-slate-400">预计 {proof.capstone.timeHours} 小时</div>
        </div>
      ) : null}
      {proof.githubPath.length > 0 ? (
        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-700">验证仓库</div>
          <div className="mt-2 space-y-2">
            {proof.githubPath.map((step) => (
              <a
                key={step.repoUrl}
                href={step.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-white px-3 py-2 text-xs text-slate-600"
              >
                <span className="font-semibold text-blue-700">{step.repoName}</span>
                <span className="ml-2 text-slate-400">星标 {step.stars} · {step.estimatedHours}h</span>
                <div className="mt-1 text-slate-500">{step.whatToLearnZh}</div>
              </a>
            ))}
          </div>
        </div>
      ) : null}
      {proof.tools.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {proof.tools.map((tool) => (
            <a key={tool.url} href={tool.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-600">
              {tool.nameZh}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Add `SeriousRoleCard`**

Create `src/components/path/SeriousRoleCard.tsx`:

```tsx
import { MarketSnapshot } from './MarketSnapshot';
import { SalaryInsight } from './SalaryInsight';
import { SkillProofPanel } from './SkillProofPanel';
import type { RoleSignal } from '@/lib/path-engine';

export function SeriousRoleCard({ role }: { role: RoleSignal }) {
  return (
    <section className="px-4 py-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white">岗</div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-950">{role.titleZh}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{role.salaryDisplay}</span>
              <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">机会 {role.opportunityScore}/100</span>
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <div className="text-sm font-bold text-slate-900">需要技能</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {role.requiredSkills.slice(0, 8).map((skill) => (
                <span key={skill} className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-700">{skill}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">市场现实</div>
            <div className="mt-2 grid gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">{role.competitionLabelZh}</div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">{role.barrierLabelZh}</div>
            </div>
          </div>
          <MarketSnapshot role={role} />
          <SalaryInsight role={role} />
          <SkillProofPanel proof={role.skillProofs[0]} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Add `ActionList`**

Create `src/components/path/ActionList.tsx`:

```tsx
import { SkillProofPanel } from './SkillProofPanel';
import type { ActionItem } from '@/lib/path-engine';

export function ActionList({ items }: { items: ActionItem[] }) {
  return (
    <section className="px-4 py-4 pb-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
          <div className="text-sm font-bold text-emerald-800">行动清单</div>
          <div className="mt-1 text-xs text-emerald-700">先完成这些动作，让路径更清晰。</div>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{index + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-950">{item.titleZh}</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.bodyZh}</p>
                <div className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
                  预计 {item.effortWeeks} 周
                </div>
                <div className="mt-3">
                  <SkillProofPanel proof={item.proof} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Verify TypeScript**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no TypeScript errors from the new path components.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/components/path
git commit -m "feat: add mobile serious path components"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 10: Student and Professional Forms

**Files:**
- Create: `webapp/src/components/path/StudentPathForm.tsx`
- Create: `webapp/src/components/path/ProfessionalPathForm.tsx`
- Read: `webapp/src/lib/path-engine/catalog.ts`

- [ ] **Step 1: Add `StudentPathForm`**

Create `src/components/path/StudentPathForm.tsx`:

```tsx
'use client';

import { courses, majorFamilies } from '@/lib/path-engine';
import type { Market, StudentPathInput } from '@/lib/path-engine';

export function StudentPathForm({ onSubmit }: { onSubmit: (input: StudentPathInput) => void }) {
  return (
    <section className="px-4 py-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">学生路径</h2>
        <p className="mt-1 text-sm text-slate-500">先选专业族，再看它能通向哪些岗位。</p>
        <div className="mt-4 grid gap-3">
          {majorFamilies.map((major) => (
            <button
              key={major.id}
              type="button"
              onClick={() => {
                const input: StudentPathInput = {
                  mode: 'student',
                  identity: 'university',
                  majorFamilyId: major.id,
                  stage: 'year-2',
                  courseIds: courses.filter((course) => course.majorFamilyIds.includes(major.id)).slice(0, 3).map((course) => course.id),
                  interestSkillIds: [],
                  market: 'CN' satisfies Market,
                };
                onSubmit(input);
              }}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left active:scale-[0.99]"
            >
              <div className="font-bold text-slate-950">{major.labels.zh}</div>
              <div className="mt-1 text-xs text-slate-500">点击生成专业到岗位路径</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `ProfessionalPathForm`**

Create `src/components/path/ProfessionalPathForm.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { workTasks } from '@/lib/path-engine';
import type { ProfessionalPathInput } from '@/lib/path-engine';

export function ProfessionalPathForm({ onSubmit }: { onSubmit: (input: ProfessionalPathInput) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <section className="px-4 py-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">职场人路径</h2>
        <p className="mt-1 text-sm text-slate-500">不要先想技能，先选你做过的任务。</p>
        <div className="mt-4 grid gap-3">
          {workTasks.map((task) => {
            const active = selected.includes(task.id);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => toggle(task.id)}
                className={`rounded-2xl border p-4 text-left active:scale-[0.99] ${active ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
              >
                <div className="font-bold text-slate-950">{task.labels.zh}</div>
                <div className="mt-1 text-xs text-slate-500">可拆出 {task.skillIds.length} 类技能证据</div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onSubmit({
            mode: 'professional',
            currentRole: '制造业从业者',
            currentIndustry: '制造业',
            taskIds: selected,
            toolSkillIds: [],
            achievementHints: [],
            goal: 'industry-switch',
            market: 'CN',
          })}
          className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          拆解我的经历
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no TypeScript errors from the new forms.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/components/path/StudentPathForm.tsx src/components/path/ProfessionalPathForm.tsx
git commit -m "feat: add serious path input forms"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 11: New `/path` Route

**Files:**
- Create: `webapp/src/app/path/page.tsx`
- Read: `webapp/src/components/Navbar.tsx`
- Read: `webapp/src/lib/path-engine/index.ts`

- [ ] **Step 1: Add the route page**

Create `src/app/path/page.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ActionList } from '@/components/path/ActionList';
import { EntrySelector } from '@/components/path/EntrySelector';
import { PathMap } from '@/components/path/PathMap';
import { ProfessionalPathForm } from '@/components/path/ProfessionalPathForm';
import { SeriousRoleCard } from '@/components/path/SeriousRoleCard';
import { StudentPathForm } from '@/components/path/StudentPathForm';
import { buildProfessionalPath, buildStudentPath } from '@/lib/path-engine';
import type { PathMode, PathResult, ProfessionalPathInput, StudentPathInput } from '@/lib/path-engine';

export default function PathPage() {
  const [mode, setMode] = useState<PathMode | null>(null);
  const [result, setResult] = useState<PathResult | null>(null);

  const primaryRole = useMemo(() => result?.roleSignals[0], [result]);

  function reset() {
    setMode(null);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-3rem)] max-w-md bg-white shadow-sm">
        {!mode ? <EntrySelector onSelect={setMode} /> : null}
        {mode === 'student' && !result ? <StudentPathForm onSubmit={(input: StudentPathInput) => setResult(buildStudentPath(input))} /> : null}
        {mode === 'professional' && !result ? <ProfessionalPathForm onSubmit={(input: ProfessionalPathInput) => setResult(buildProfessionalPath(input))} /> : null}
        {mode === 'role' && !result ? (
          <section className="px-4 py-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              岗位反查入口会复用岗位卡，本阶段先从学生或职场人入口进入。
            </div>
          </section>
        ) : null}
        {mode === 'resume' && !result ? (
          <section className="px-4 py-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              简历入口保留为快捷入口，本阶段先用结构化选择完成无简历路径。
            </div>
          </section>
        ) : null}
        {result ? (
          <>
            <div className="flex items-center justify-between px-4 pt-5">
              <button type="button" onClick={reset} className="text-sm font-medium text-slate-500">重新选择</button>
              <div className="text-xs font-semibold text-blue-600">{result.mode === 'student' ? '学生路径' : '职场路径'}</div>
            </div>
            <PathMap result={result} />
            {primaryRole ? <SeriousRoleCard role={primaryRole} /> : null}
            <ActionList items={result.actionItems} />
          </>
        ) : null}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify route compiles**

Run:

```bash
npx tsc --noEmit --pretty
```

Expected: no TypeScript errors from `src/app/path/page.tsx`.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: the route list includes `/path`.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/app/path/page.tsx
git commit -m "feat: add serious path route"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 12: Homepage CTA Shift

**Files:**
- Modify: `webapp/src/app/page.tsx`

- [ ] **Step 1: Change primary homepage CTA copy**

In `src/app/page.tsx`, update the English and Chinese UI strings so resume paste is no longer the dominant first action.

Use these values:

```typescript
hero: 'Start from your real starting point. See where your major or experience can go.',
heroSub: 'CareerLens maps majors, courses, work tasks, skills, evidence, roles, and industries into one practical path.',
heroPrimary: 'Choose My Starting Point',
heroSecondary: 'See Opportunity Map',
analyzerTitle: 'Resume shortcut',
analyzerSub: 'Already have a resume? Paste or upload it to speed up the path. If not, use the choice-first path above.',
```

Chinese values:

```typescript
hero: '从你的真实起点开始，看专业或经验能通向哪里。',
heroSub: 'CareerLens 把专业、课程、工作任务、技能、证据、岗位和行业连成一条可行动路径。',
heroPrimary: '选择我的起点',
heroSecondary: '先看机会地图',
analyzerTitle: '简历快捷入口',
analyzerSub: '如果你已有简历，可以粘贴或上传来加速路径生成；没有简历也可以先用选择式路径。',
```

- [ ] **Step 2: Route the primary CTA to `/path`**

Find the primary CTA button in `src/app/page.tsx` and make it navigate to `/path`:

```tsx
<button
  onClick={() => router.push('/path')}
  className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
>
  {copy.heroPrimary}
</button>
```

- [ ] **Step 3: Keep resume analyzer lower on the page**

Do not delete the existing resume analyzer. Keep it as the resume shortcut section below the first CTA area.

- [ ] **Step 4: Verify build**

Run:

```bash
npm run build
```

Expected: build succeeds and route list includes `/` and `/path`.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/app/page.tsx
git commit -m "feat: make path selection primary homepage CTA"
```

If this workspace is not a git repository, record the command output in the implementation notes and continue.

---

### Task 13: Browser Verification

**Files:**
- Verify only

- [ ] **Step 1: Start production server**

Run:

```bash
cd /Users/haiqing/WeChatProjects/miniprogram-2/webapp
npm run build
npm run start -- -p 3010
```

Expected:

```text
Local: http://localhost:3010
```

If port 3010 is occupied, use the next free port and record it in the implementation notes.

- [ ] **Step 2: Verify homepage CTA**

Open:

```text
http://localhost:3010/
```

Expected:

- primary CTA says "Choose My Starting Point" or "选择我的起点"
- clicking it navigates to `/path`
- resume section is still present lower on the page

- [ ] **Step 3: Verify student flow**

Open:

```text
http://localhost:3010/path
```

Expected:

- tapping "我是学生" shows major family cards
- tapping "自动化类" shows a path map
- a role card appears
- an action list appears
- the role card includes a compact market-position card derived from the four-quadrant logic
- the role card includes a salary percentile section or an explicit no-percentile fallback
- the role card includes a skill proof section when `toolmap` has a matching missing skill

- [ ] **Step 4: Verify professional flow**

Open:

```text
http://localhost:3010/path
```

Expected:

- tapping "我是职场人" shows task cards
- selecting "客户投诉与8D闭环" enables the submit button
- submitting shows a task-to-skill-to-evidence path
- the action list includes a resume evidence action
- at least one action card shows a proof expansion with capstone, tool, or GitHub validation data when available
- market and salary sections remain readable on a 390px-wide mobile viewport

- [ ] **Step 5: Verify mobile screenshot**

Use Playwright or the browser plugin at a mobile-sized viewport:

```text
390 x 844
```

Expected:

- no horizontal scrolling
- no overlapping text
- path rows keep fixed readable spacing
- role card high-value modules are stacked vertically
- action list cards remain readable with proof panels expanded

- [ ] **Step 6: Stop local server**

Stop the `next start` process with `Ctrl-C`.

Expected:

```text
No process remains listening on the chosen port.
```

---

## Self-Review Checklist

- Spec coverage: student flow, professional flow, resume as shortcut, role cards, action list, market reality, mobile four-quadrant integration, salary percentile integration, skill proof resources, and game compatibility fields are covered.
- Scope boundary: game UI is not part of this plan.
- Verification: TypeScript, build, browser checks, and mobile viewport checks are included.
- Known source lint: this plan fixes generated artifact lint noise first, but existing source lint findings may still require a separate cleanup plan.
