'use client';

import type { PathMode } from '@/lib/path-engine';

type EntryOption = {
  mode: PathMode;
  title: string;
  body: string;
  icon: string;
  tone: string;
  iconTone: string;
};

const entryOptions: EntryOption[] = [
  {
    mode: 'student',
    title: '我是学生',
    body: '从专业、课程和兴趣生成职业路径',
    icon: '学',
    tone: 'border-blue-200 bg-blue-50',
    iconTone: 'bg-blue-600 text-white',
  },
  {
    mode: 'professional',
    title: '我是职场人',
    body: '拆解任务和成果，找到可迁移方向',
    icon: '职',
    tone: 'border-emerald-200 bg-emerald-50',
    iconTone: 'bg-emerald-600 text-white',
  },
  {
    mode: 'role',
    title: '看岗位要什么',
    body: '反查岗位需要的技能、证据和市场现实',
    icon: '岗',
    tone: 'border-slate-200 bg-white',
    iconTone: 'bg-slate-900 text-white',
  },
  {
    mode: 'resume',
    title: '已有简历',
    body: '把简历作为快捷入口，加速路径生成',
    icon: '简',
    tone: 'border-slate-200 bg-slate-50',
    iconTone: 'bg-white text-slate-900',
  },
];

export function EntrySelector({ onSelect }: { onSelect: (mode: PathMode) => void }) {
  return (
    <section className="px-4 py-7">
      <div className="mb-6">
        <div className="text-sm font-semibold text-blue-600">CareerLens / 转行宝</div>
        <h1 className="mt-7 text-3xl font-bold tracking-normal text-slate-950">从你的起点开始</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">选择起点，生成路径地图、岗位卡和行动清单。</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {entryOptions.map((entry) => (
          <button
            key={entry.mode}
            type="button"
            onClick={() => onSelect(entry.mode)}
            className={`min-h-36 rounded-xl border p-4 text-left font-sans shadow-sm transition active:scale-[0.99] ${entry.tone}`}
          >
            <span className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold shadow-sm ${entry.iconTone}`}>
              {entry.icon}
            </span>
            <span className="block text-base font-bold text-slate-950">{entry.title}</span>
            <span className="mt-2 block text-xs leading-5 text-slate-500">{entry.body}</span>
          </button>
        ))}
      </div>

      <p className="mt-5 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs leading-5 text-slate-500">
        规则优先，AI 可选；结果用于规划，不保证录取或 offer。
      </p>
    </section>
  );
}
