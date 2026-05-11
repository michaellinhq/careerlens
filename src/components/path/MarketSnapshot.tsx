import type { RoleSignal } from '@/lib/path-engine';

const metricClassName = 'rounded-xl bg-white px-3 py-2 text-xs leading-5 text-slate-600';

export function MarketSnapshot({ role }: { role: RoleSignal }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-emerald-700">市场四象限</div>
          <div className="mt-1 text-base font-bold text-slate-950">{role.marketPosition.quadrantLabelZh}</div>
        </div>
        <div className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
          张力 {role.marketPosition.demandTension}/100
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-emerald-800">{role.marketPosition.quadrantBodyZh}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className={metricClassName}>
          <div className="font-semibold text-slate-900">竞争</div>
          <div className="mt-1">{role.competitionLabelZh}</div>
        </div>
        <div className={metricClassName}>
          <div className="font-semibold text-slate-900">门槛</div>
          <div className="mt-1">{role.barrierLabelZh}</div>
        </div>
        <div className={metricClassName}>
          <div className="font-semibold text-slate-900">机会</div>
          <div className="mt-1">{role.opportunityScore}/100</div>
        </div>
        <div className={metricClassName}>
          <div className="font-semibold text-slate-900">薪资</div>
          <div className="mt-1">{role.salaryDisplay}</div>
        </div>
      </div>
    </div>
  );
}
