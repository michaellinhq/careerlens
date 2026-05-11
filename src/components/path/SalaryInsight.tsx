import { SalaryDistribution } from '@/components/ui/SalaryDistribution';
import type { RoleSignal } from '@/lib/path-engine';

export function SalaryInsight({ role }: { role: RoleSignal }) {
  if (role.salaryPercentiles.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
        暂无可展示的薪资分位数据，先显示岗位薪资区间：{role.salaryDisplay}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-900">薪资分位</div>
        <div className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">P10-P90</div>
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
