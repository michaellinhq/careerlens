import type { PathResult, PathStep } from '@/lib/path-engine';
import { MarketSnapshot } from './MarketSnapshot';

const stepNames: Record<PathStep['kind'], string> = {
  major: '专业',
  course: '课程',
  'work-task': '任务',
  skill: '技能',
  evidence: '证据',
  role: '岗位',
  industry: '行业',
};

export function PathMap({ result }: { result: PathResult }) {
  const primaryRole = result.roleSignals.find((role) => role.roleCode === result.recommendedRoleCode) ?? result.roleSignals[0];

  return (
    <section className="px-4 py-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-xs font-medium leading-5 text-blue-700">
          {result.mode === 'student' ? '从专业到行业，找到你的方向。' : '从经历到新岗位，重新定价你的经验。'}
        </div>

        <div className="space-y-3">
          {result.steps.map((step, index) => (
            <div key={`${step.kind}-${step.id}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</div>
                {index < result.steps.length - 1 ? <div className="h-8 w-px bg-emerald-300" /> : null}
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
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

        {primaryRole ? (
          <div className="mt-4">
            <MarketSnapshot role={primaryRole} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
