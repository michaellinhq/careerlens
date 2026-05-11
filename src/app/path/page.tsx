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
import type {
  PathMode,
  PathResult,
  ProfessionalPathInput,
  StudentPathInput,
} from '@/lib/path-engine';

const modeLabels: Partial<Record<PathMode, string>> = {
  student: '学生路径',
  professional: '职场路径',
  role: '岗位反查',
  resume: '简历捷径',
};

function ShortcutCard({
  mode,
  onBack,
  onChooseStudent,
  onChooseProfessional,
}: {
  mode: Extract<PathMode, 'role' | 'resume'>;
  onBack: () => void;
  onChooseStudent: () => void;
  onChooseProfessional: () => void;
}) {
  const copy = mode === 'role'
    ? {
        eyebrow: 'Deep link preview',
        title: '岗位反查是后续捷径',
        body: '这里会直接打开岗位卡，反查技能、证据项目和市场现实。当前版本先从学生或职场路径生成完整地图，再进入岗位卡。',
        tone: 'border-orange-200 bg-orange-50 text-orange-800',
      }
    : {
        eyebrow: 'Shortcut preview',
        title: '简历入口是加速器',
        body: '这里会把已有简历解析成任务、技能和业绩证据。当前版本先用结构化选择完成无简历路径，避免把简历当成唯一入口。',
        tone: 'border-blue-200 bg-blue-50 text-blue-800',
      };

  return (
    <section className="px-4 py-6">
      <div className={`rounded-2xl border p-4 shadow-sm ${copy.tone}`}>
        <div className="text-xs font-bold uppercase tracking-wide opacity-75">{copy.eyebrow}</div>
        <h1 className="mt-3 text-xl font-bold text-slate-950">{copy.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{copy.body}</p>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={onChooseStudent}
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white active:scale-[0.99]"
          >
            从学生路径开始
          </button>
          <button
            type="button"
            onClick={onChooseProfessional}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 active:scale-[0.99]"
          >
            从职场路径开始
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 active:scale-[0.99]"
          >
            返回入口选择
          </button>
        </div>
      </div>
    </section>
  );
}

export default function PathPage() {
  const [mode, setMode] = useState<PathMode | null>(null);
  const [result, setResult] = useState<PathResult | null>(null);

  const primaryRole = useMemo(() => result?.roleSignals[0] ?? null, [result]);

  function chooseMode(nextMode: PathMode) {
    setMode(nextMode);
    setResult(null);
  }

  function reset() {
    setMode(null);
    setResult(null);
  }

  function backToModeStart() {
    setResult(null);
  }

  function handleStudentSubmit(input: StudentPathInput) {
    setResult(buildStudentPath(input));
  }

  function handleProfessionalSubmit(input: ProfessionalPathInput) {
    setResult(buildProfessionalPath(input));
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-3rem)] w-full max-w-md overflow-x-hidden bg-white shadow-sm">
        {!mode ? <EntrySelector onSelect={chooseMode} /> : null}

        {mode && !result ? (
          <div className="flex items-center justify-between px-4 pt-5">
            <button type="button" onClick={reset} className="text-sm font-medium text-slate-500">
              返回
            </button>
            <div className="text-xs font-semibold text-blue-600">{modeLabels[mode]}</div>
          </div>
        ) : null}

        {mode === 'student' && !result ? <StudentPathForm onSubmit={handleStudentSubmit} /> : null}
        {mode === 'professional' && !result ? <ProfessionalPathForm onSubmit={handleProfessionalSubmit} /> : null}
        {mode === 'role' && !result ? (
          <ShortcutCard
            mode="role"
            onBack={reset}
            onChooseStudent={() => chooseMode('student')}
            onChooseProfessional={() => chooseMode('professional')}
          />
        ) : null}
        {mode === 'resume' && !result ? (
          <ShortcutCard
            mode="resume"
            onBack={reset}
            onChooseStudent={() => chooseMode('student')}
            onChooseProfessional={() => chooseMode('professional')}
          />
        ) : null}

        {result ? (
          <>
            <div className="flex items-center justify-between px-4 pt-5">
              <button type="button" onClick={backToModeStart} className="text-sm font-medium text-slate-500">
                返回修改
              </button>
              <button type="button" onClick={reset} className="text-sm font-semibold text-blue-600">
                重新选择
              </button>
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
