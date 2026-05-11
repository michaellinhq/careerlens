'use client';

import { useState } from 'react';
import { workTasks } from '@/lib/path-engine';
import type { ProfessionalPathInput } from '@/lib/path-engine';

type ProfessionalPathFormProps = {
  onSubmit: (input: ProfessionalPathInput) => void;
};

export function ProfessionalPathForm({ onSubmit }: ProfessionalPathFormProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  function toggleTask(taskId: string) {
    setSelectedTaskIds((current) => (current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]));
  }

  return (
    <section className="px-4 py-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">职</div>
          <div>
            <h2 className="text-xl font-bold tracking-normal text-slate-950">职场人路径</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">不要先想技能，先选你做过的任务。</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {workTasks.map((task) => {
            const active = selectedTaskIds.includes(task.id);

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
                className={`rounded-xl border p-4 text-left font-sans transition active:scale-[0.99] ${
                  active ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0 text-base font-bold text-slate-950">{task.labels.zh}</span>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${active ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500'}`}>
                    {active ? '已选' : '选择'}
                  </span>
                </span>
                <span className="mt-2 block text-xs leading-5 text-slate-500">可拆出 {task.skillIds.length} 类技能证据</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={selectedTaskIds.length === 0}
          onClick={() =>
            onSubmit({
              mode: 'professional',
              currentRole: '制造业从业者',
              currentIndustry: '制造业',
              taskIds: selectedTaskIds,
              toolSkillIds: [],
              achievementHints: [],
              goal: 'industry-switch',
              market: 'CN',
            })
          }
          className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          拆解我的经历
        </button>
      </div>
    </section>
  );
}
