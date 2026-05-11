import type { SkillProof } from '@/lib/path-engine';

export function SkillProofPanel({ proof }: { proof?: SkillProof }) {
  if (!proof) return null;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
      <div className="text-sm font-bold text-slate-950">技能验证：{proof.skillZh}</div>

      {proof.capstone ? (
        <div className="mt-3 rounded-xl bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-blue-700">推荐证据项目</div>
            <div className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">{proof.capstone.difficulty}</div>
          </div>
          <div className="mt-1 text-sm font-bold text-slate-950">{proof.capstone.titleZh}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{proof.capstone.provesToEmployerZh}</p>
          <div className="mt-2 text-[11px] text-slate-400">预计 {proof.capstone.timeHours} 小时</div>
          {proof.capstone.deliverablesZh.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {proof.capstone.deliverablesZh.map((deliverable) => (
                <span key={deliverable} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                  {deliverable}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {proof.githubPath.length > 0 ? (
        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-700">GitHub 验证路径</div>
          <div className="mt-2 space-y-2">
            {proof.githubPath.map((step) => (
              <a
                key={step.repoUrl}
                href={step.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-white px-3 py-2 text-xs leading-5 text-slate-600"
              >
                <span className="font-semibold text-blue-700">{step.repoName}</span>
                <span className="ml-2 text-slate-400">星标 {step.stars} · {step.estimatedHours}h</span>
                <span className="mt-1 block text-slate-500">{step.whatToLearnZh}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {proof.tools.length > 0 ? (
        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-700">工具</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {proof.tools.map((tool) => (
              <a
                key={tool.url}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-600"
              >
                {tool.nameZh}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {proof.training.length > 0 ? (
        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-700">训练资源</div>
          <div className="mt-2 grid gap-2">
            {proof.training.map((training) => (
              <a
                key={training.url}
                href={training.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white px-3 py-2 text-xs leading-5 text-slate-600"
              >
                <span className="font-semibold text-blue-700">{training.nameZh}</span>
                <span className="ml-2 text-slate-400">{training.region} · {training.priceRange}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
