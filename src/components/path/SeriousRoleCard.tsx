import type { RoleSignal } from '@/lib/path-engine';
import { MarketSnapshot } from './MarketSnapshot';
import { SalaryInsight } from './SalaryInsight';
import { SkillProofPanel } from './SkillProofPanel';

export function SeriousRoleCard({ role }: { role: RoleSignal }) {
  return (
    <section className="px-4 py-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">岗</div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-normal text-slate-950">{role.titleZh}</h2>
            <div className="mt-1 text-sm text-slate-500">{role.industry}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {role.salaryDisplay}
              </span>
              <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                机会 {role.opportunityScore}/100
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="text-sm font-bold text-slate-900">技能匹配</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {role.matchedSkills.map((skill) => (
                <span key={`matched-${skill}`} className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {skill}
                </span>
              ))}
              {role.missingSkills.map((skill) => (
                <span key={`missing-${skill}`} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  待补：{skill}
                </span>
              ))}
            </div>
          </div>

          {role.requiredSkills.length > 0 ? (
            <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer text-sm font-bold text-slate-900">岗位要求技能</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.requiredSkills.map((skill) => (
                  <span key={skill} className="rounded-lg bg-white px-3 py-1 text-xs text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </details>
          ) : null}

          <MarketSnapshot role={role} />
          <SalaryInsight role={role} />
          <SkillProofPanel proof={role.skillProofs[0]} />
        </div>
      </div>
    </section>
  );
}
