import type { ActionItem, SkillProof } from '@/lib/path-engine';

const actionTypeLabels: Record<ActionItem['actionType'], string> = {
  course: '课程',
  project: '项目',
  resume: '简历',
  search: '搜索',
  interview: '面试',
  portfolio: '作品集',
};

function ActionProofSummary({ proof }: { proof: SkillProof }) {
  return (
    <div className="mt-3 rounded-xl border border-blue-100 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold text-blue-700">证据项目</div>
      <div className="mt-1 text-xs font-bold leading-5 text-slate-900">
        {proof.capstone?.titleZh ?? proof.skillZh}
      </div>
      <div className="mt-1 text-[11px] leading-5 text-slate-500">
        {proof.githubPath[0] ? `仓库：${proof.githubPath[0].repoName}` : null}
        {proof.githubPath[0] && proof.tools[0] ? ' · ' : null}
        {proof.tools[0] ? `工具：${proof.tools[0].nameZh}` : null}
      </div>
    </div>
  );
}

export function ActionList({ items }: { items: ActionItem[] }) {
  return (
    <section className="px-4 py-4 pb-24">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
          <div className="text-sm font-bold text-emerald-800">行动清单</div>
          <div className="mt-1 text-xs leading-5 text-emerald-700">先完成这些动作，让路径更清晰。</div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">暂无行动项</div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-bold text-slate-950">{item.titleZh}</div>
                    <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
                      {actionTypeLabels[item.actionType]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.bodyZh}</p>
                  <div className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-500">预计 {item.effortWeeks} 周</div>
                  {item.proof ? <ActionProofSummary proof={item.proof} /> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
