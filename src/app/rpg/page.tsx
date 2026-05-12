'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

type StatTone = 'blue' | 'emerald' | 'orange' | 'rose' | 'slate';

type Stat = {
  label: string;
  value: string;
  score: number;
  tone: StatTone;
};

type Action = {
  id: string;
  title: string;
  subtitle: string;
  cost: string;
  result: string;
  tone: StatTone;
};

const stats: Stat[] = [
  { label: '现金', value: '¥6,000', score: 58, tone: 'emerald' },
  { label: '精力', value: '82/100', score: 82, tone: 'blue' },
  { label: '信心', value: '64/100', score: 64, tone: 'orange' },
  { label: '技能', value: '41/100', score: 41, tone: 'blue' },
  { label: '证据力', value: '18/100', score: 18, tone: 'orange' },
  { label: '人脉', value: '12/100', score: 12, tone: 'slate' },
];

const dailyActions: Action[] = [
  { id: 'plc', title: '学PLC', subtitle: '2小时 · 西门子基础', cost: '精力 -15', result: '技能 +10', tone: 'blue' },
  { id: 'project', title: '做项目', subtitle: '推进小型产线控制', cost: '精力 -20', result: '证据 +15', tone: 'emerald' },
  { id: 'resume', title: '改简历', subtitle: '优化1条项目经历', cost: '精力 -10', result: '命中率 +10%', tone: 'orange' },
  { id: 'apply', title: '投递岗位', subtitle: '精选5个岗位', cost: '精力 -10', result: '面邀机会 +1', tone: 'blue' },
  { id: 'rest', title: '休息回血', subtitle: '短暂停机恢复', cost: '现金 -20', result: '精力 +25', tone: 'slate' },
];

const screenLabels = ['开局角色', '今日事件', '行动选择', '城市市场', '项目副本', '面试战', '结局复盘'];

const toneClasses: Record<StatTone, { text: string; bg: string; bar: string; border: string }> = {
  blue: { text: 'text-blue-700', bg: 'bg-blue-50', bar: 'bg-blue-500', border: 'border-blue-100' },
  emerald: { text: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500', border: 'border-emerald-100' },
  orange: { text: 'text-orange-700', bg: 'bg-orange-50', bar: 'bg-orange-500', border: 'border-orange-100' },
  rose: { text: 'text-rose-700', bg: 'bg-rose-50', bar: 'bg-rose-500', border: 'border-rose-100' },
  slate: { text: 'text-slate-700', bg: 'bg-slate-50', bar: 'bg-slate-400', border: 'border-slate-200' },
};

function SceneHeader({ index, className = '' }: { index: number; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 bg-cover bg-no-repeat ${className}`}
      style={{
        backgroundImage: 'url(/rpg/scene-strip-wide.png)',
        backgroundPosition: `${(index / 6) * 100}% center`,
        backgroundSize: '700% 100%',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/75" />
    </div>
  );
}

function Avatar({ small = false }: { small?: boolean }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-2xl bg-blue-50 ${small ? 'h-16 w-16' : 'h-12 w-12'}`}>
      <div className="absolute left-1/2 top-3 h-7 w-8 -translate-x-1/2 rounded-full bg-[#f2c7a5]" />
      <div className="absolute left-1/2 top-1 h-6 w-10 -translate-x-1/2 rounded-t-full bg-slate-800" />
      <div className="absolute bottom-0 left-1/2 h-8 w-12 -translate-x-1/2 rounded-t-2xl bg-blue-500" />
      <div className="absolute left-[42%] top-6 h-1 w-1 rounded-full bg-slate-900" />
      <div className="absolute right-[42%] top-6 h-1 w-1 rounded-full bg-slate-900" />
    </div>
  );
}

function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-[690px] w-[232px] shrink-0 rounded-[42px] border-[9px] border-[#171717] bg-[#171717] shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
      <div className="absolute left-1/2 top-2 z-20 h-6 w-20 -translate-x-1/2 rounded-b-2xl rounded-t-full bg-[#050505]" />
      <div className="h-full overflow-hidden rounded-[32px] bg-[#fbfaf7]">
        <div className="flex h-8 items-center justify-between px-5 pt-1 text-[10px] font-bold text-slate-900">
          <span>9:41</span>
          <span className="tracking-[0.16em]">•••</span>
        </div>
        <div className="h-[640px] overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function ScreenFrame({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <PhoneShell>{children}</PhoneShell>
      <div className="flex items-center gap-3 text-lg font-bold text-slate-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm shadow-sm">{index + 1}</span>
        {screenLabels[index]}
      </div>
    </div>
  );
}

function TopHud({ title, right }: { title: string; right?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="text-sm font-black text-slate-950">{title}</div>
      {right ? <div className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{right}</div> : null}
    </div>
  );
}

function StatMeter({ stat, compact = false }: { stat: Stat; compact?: boolean }) {
  const tone = toneClasses[stat.tone];
  return (
    <div className={compact ? 'space-y-1' : 'grid grid-cols-[48px_1fr_44px] items-center gap-2'}>
      <div className="text-[11px] font-semibold text-slate-500">{stat.label}</div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${stat.score}%` }} />
      </div>
      <div className="text-right text-[10px] font-bold text-slate-600">{stat.value}</div>
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  const items = ['角色', '地图', '任务', '背包', '我的'];
  return (
    <div className="absolute bottom-0 left-0 right-0 flex h-14 items-center justify-around border-t border-slate-200 bg-white/92 px-2 text-[10px] font-semibold text-slate-400 backdrop-blur">
      {items.map((item) => (
        <div key={item} className={`flex flex-col items-center gap-1 ${item === active ? 'text-blue-600' : ''}`}>
          <span className={`h-4 w-4 rounded ${item === active ? 'bg-blue-600' : 'border border-slate-300'}`} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function StartScreen() {
  return (
    <div className="relative h-full pb-14">
      <SceneHeader index={0} className="mx-3 mt-1 h-40" />
      <div className="px-4 pt-3">
        <h2 className="text-2xl font-black leading-tight text-slate-950">你有90天<br />拿到Offer</h2>
        <div className="mt-2 text-[11px] font-medium text-slate-500">选择你的身份</div>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex rounded-full bg-slate-100 p-1 text-[11px] font-bold">
            <span className="flex-1 rounded-full bg-blue-600 py-1 text-center text-white">应届生</span>
            <span className="flex-1 py-1 text-center text-slate-400">职场转行</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar />
            <div>
              <div className="text-sm font-black text-slate-950">机械应届生</div>
              <div className="mt-1 text-[11px] text-slate-500">目标：自动化工程师</div>
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {stats.map((stat) => <StatMeter key={stat.label} stat={stat} />)}
        </div>
        <button className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-200">进入第1天</button>
      </div>
      <BottomNav active="角色" />
    </div>
  );
}

function EventScreen() {
  const [choice, setChoice] = useState('复盘短板');
  const choices = [
    { title: '比较焦虑，继续刷岗位', effect: '信心 -8', tone: 'orange' as const },
    { title: '冷静复盘自己的短板', effect: '证据 +2', tone: 'emerald' as const },
    { title: '找同学问面经', effect: '人脉 +5', tone: 'blue' as const },
  ];
  return (
    <div className="relative h-full pb-14">
      <TopHud title="Day 07" right="行动点 3/3" />
      <SceneHeader index={1} className="mx-3 h-36" />
      <div className="px-4 pt-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-black text-slate-950">事件：同学拿到了大厂实习Offer</div>
          <p className="mt-2 text-xs leading-5 text-slate-500">你在朋友圈看到同学晒出实习Offer，心里有点不是滋味。</p>
          <div className="mt-3 text-xs font-bold text-slate-700">你的选择</div>
          <div className="mt-2 space-y-2">
            {choices.map((item) => {
              const tone = toneClasses[item.tone];
              const active = choice === item.title;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setChoice(item.title)}
                  className={`w-full rounded-2xl border px-3 py-2 text-left ${active ? `${tone.bg} ${tone.border}` : 'border-slate-200 bg-slate-50'}`}
                >
                  <div className="text-xs font-black text-slate-900">{item.title}</div>
                  <div className={`mt-1 text-[10px] font-bold ${tone.text}`}>{item.effect}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex justify-between text-[10px] font-bold text-slate-500">
            <span>当前心情：有点焦虑</span>
            <span>平稳</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 w-[62%] rounded-full bg-gradient-to-r from-orange-400 to-emerald-500" />
          </div>
        </div>
      </div>
      <BottomNav active="任务" />
    </div>
  );
}

function ActionScreen() {
  const [selected, setSelected] = useState('plc');
  return (
    <div className="relative h-full pb-14">
      <TopHud title="Day 07" right="3/3" />
      <div className="px-4">
        <h2 className="mt-2 text-xl font-black text-slate-950">今天怎么打</h2>
        <p className="mt-1 text-[11px] text-slate-500">每个行动消耗1点行动点</p>
        <div className="mt-4 flex justify-around">
          {[1, 2, 3].map((slot) => (
            <div key={slot} className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-light text-slate-300 shadow-sm">+</div>
          ))}
        </div>
        <div className="mt-4 flex rounded-full bg-slate-100 p-1 text-[11px] font-bold text-slate-500">
          {['成长', '求职', '恢复', '社交'].map((tab, index) => (
            <span key={tab} className={`flex-1 rounded-full py-1 text-center ${index === 0 ? 'bg-white text-blue-600 shadow-sm' : ''}`}>{tab}</span>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {dailyActions.map((action) => {
            const tone = toneClasses[action.tone];
            const active = selected === action.id;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => setSelected(action.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left shadow-sm ${active ? `${tone.bg} ${tone.border}` : 'border-slate-200 bg-white'}`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.bg} ${tone.text} text-xs font-black`}>{action.title.slice(0, 1)}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-slate-950">{action.title}</div>
                  <div className="mt-1 text-[10px] text-slate-500">{action.subtitle}</div>
                  <div className="mt-1 flex gap-2 text-[10px] font-bold">
                    <span className="text-slate-400">{action.cost}</span>
                    <span className={tone.text}>{action.result}</span>
                  </div>
                </div>
                <span className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-black text-white">选择</span>
              </button>
            );
          })}
        </div>
        <button className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-200">结束今天</button>
      </div>
      <BottomNav active="任务" />
    </div>
  );
}

function CityMarketScreen() {
  const cities = [
    { name: '北京', x: 45, y: 20, score: '需求62 竞争70' },
    { name: '上海', x: 66, y: 44, score: '需求72 竞争65' },
    { name: '苏州', x: 39, y: 58, score: '需求66 竞争58' },
    { name: '深圳', x: 63, y: 71, score: '需求56 竞争75' },
    { name: '慕尼黑', x: 45, y: 84, score: '需求61 竞争40' },
  ];
  return (
    <div className="relative h-full pb-14">
      <TopHud title="城市与市场" right="自动化工程师" />
      <div className="px-4">
        <div className="relative mt-2 h-72 overflow-hidden rounded-3xl border border-slate-200 bg-[#eef3ed] shadow-sm">
          <SceneHeader index={3} className="absolute inset-0 rounded-none border-0 opacity-45" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
            <path d="M45 20 C62 26 70 35 66 44 C54 50 45 51 39 58 C48 65 57 70 63 71 C54 75 48 80 45 84" fill="none" stroke="#f97316" strokeDasharray="3 4" strokeWidth="1.2" />
          </svg>
          {cities.map((city) => (
            <div
              key={city.name}
              className={`absolute rounded-2xl border bg-white/90 px-3 py-2 text-xs shadow-md ${city.name === '上海' ? 'border-blue-300 text-blue-700' : 'border-slate-200 text-slate-600'}`}
              style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="font-black">{city.name}</div>
              <div className="mt-1 whitespace-nowrap text-[9px] text-slate-400">{city.score}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-sm font-black text-slate-950">上海 · 自动化工程师</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ['需求张力', '72/100'],
              ['竞争强度', '68/100'],
              ['岗位门槛', '64/100'],
              ['薪资P50', '¥25K/月'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-2">
                <div className="text-[10px] text-slate-500">{label}</div>
                <div className="mt-1 text-sm font-black text-slate-950">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] font-bold leading-5 text-orange-700">红海岗位：证据力低于50不建议硬投</div>
        </div>
      </div>
      <BottomNav active="地图" />
    </div>
  );
}

function ProjectScreen() {
  const steps = ['控制逻辑', '传感器表', 'Demo视频', 'GitHub说明'];
  return (
    <div className="relative h-full pb-14">
      <TopHud title="项目副本" right="副本章" />
      <SceneHeader index={4} className="mx-3 h-40" />
      <div className="px-4 pt-3">
        <h2 className="text-xl font-black text-slate-950">小型产线控制</h2>
        <div className="mt-3 space-y-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${index === 0 ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200' : index < 3 ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</div>
              <div>
                <div className="text-xs font-black text-slate-950">{step}</div>
                <div className="mt-1 text-[10px] text-slate-500">{index === 0 ? '完成控制流程设计' : index === 1 ? '整理传感器清单参数' : index === 2 ? '录制运行演示视频' : '撰写项目文档README'}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-black text-slate-900">副本奖励</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
            <span className="rounded-2xl bg-blue-50 py-2 text-blue-700">技能 +12</span>
            <span className="rounded-2xl bg-emerald-50 py-2 text-emerald-700">证据 +18</span>
            <span className="rounded-2xl bg-orange-50 py-2 text-orange-700">简历 +1</span>
          </div>
          <div className="mt-3 flex gap-2 text-[10px] font-bold text-blue-700">
            {['PLC', 'Python', '传感器'].map((skill) => <span key={skill} className="rounded-full bg-blue-50 px-3 py-1">{skill}</span>)}
          </div>
        </div>
        <button className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-200">开始第1步</button>
      </div>
      <BottomNav active="任务" />
    </div>
  );
}

function InterviewScreen() {
  return (
    <div className="relative h-full pb-14">
      <TopHud title="Boss战：技术面" right="规则" />
      <div className="px-4">
        <div className="mt-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <SceneHeader index={5} className="h-20 w-16 shrink-0 rounded-2xl" />
            <div>
              <div className="text-sm font-black text-slate-950">技术面试官</div>
              <div className="mt-1 text-[10px] text-slate-500">自动化部门 · 资深工程师</div>
              <div className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">我们开始吧</div>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] font-bold text-slate-500">第42天 · 第1轮</div>
          <div className="mt-2 text-base font-black leading-6 text-slate-950">你如何排查产线传感器误报？</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {['STAR案例', '项目证据', '追问澄清', '稳定心态'].map((tool, index) => (
            <button key={tool} className={`rounded-2xl border px-2 py-3 text-xs font-black ${index === 0 ? 'border-blue-100 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'}`}>{tool}</button>
          ))}
        </div>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-black text-slate-900">当前状态评估</div>
          <div className="mt-3 space-y-2">
            {[
              { label: '结构化表达', value: '62/100', score: 62, tone: 'emerald' as const },
              { label: '技术深度', value: '55/100', score: 55, tone: 'blue' as const },
              { label: '证据支撑', value: '48/100', score: 48, tone: 'emerald' as const },
              { label: '心态稳定', value: '70/100', score: 70, tone: 'blue' as const },
            ].map((stat) => <StatMeter key={stat.label} stat={stat} />)}
          </div>
        </div>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 text-center">
          <div className="text-[11px] font-bold text-slate-500">预计通过率</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">38% → 52%</div>
        </div>
        <button className="mt-3 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-200">提交回答</button>
      </div>
    </div>
  );
}

function EndingScreen() {
  return (
    <div className="relative h-full pb-14">
      <TopHud title="第90天结局" />
      <div className="px-4">
        <div className="mt-2 rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <SceneHeader index={6} className="mx-auto mb-3 h-24 w-full" />
          <div className="text-4xl font-black text-orange-500">奖杯</div>
          <h2 className="mt-2 text-xl font-black text-slate-950">获得二面机会！</h2>
          <div className="mt-1 text-sm font-black text-slate-700">Offer概率 47%</div>
          <p className="mt-2 text-[11px] text-slate-500">继续冲刺，胜利在望！</p>
        </div>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-black text-slate-900">90天求职数据</div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[
              ['37次', '投递'],
              ['5次', '面试'],
              ['1个', '项目副本'],
              ['12条', '简历优化'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-slate-50 px-1 py-2">
                <div className="text-sm font-black text-blue-700">{value}</div>
                <div className="mt-1 text-[9px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
            <div className="text-[10px] font-bold text-orange-700">最大短板</div>
            <div className="mt-1 text-xs font-black text-slate-950">证据力不足</div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
            <div className="text-[10px] font-bold text-emerald-700">最强优势</div>
            <div className="mt-1 text-xs font-black text-slate-950">自动化基础稳定</div>
          </div>
        </div>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-black text-slate-900">下一步现实行动</div>
          <div className="mt-2 space-y-2">
            {['重写2条简历bullet', '补完整项目README', '优先投苏州/上海自动化岗位'].map((item, index) => (
              <div key={item} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <button className="mt-3 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-200">导出现实行动清单</button>
      </div>
    </div>
  );
}

function DemoScreen({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <StartScreen />;
    case 1:
      return <EventScreen />;
    case 2:
      return <ActionScreen />;
    case 3:
      return <CityMarketScreen />;
    case 4:
      return <ProjectScreen />;
    case 5:
      return <InterviewScreen />;
    default:
      return <EndingScreen />;
  }
}

export default function RpgDemoPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f4ef] px-4 py-5 text-slate-950">
      <section className="mx-auto max-w-[1740px]">
        <div className="mb-7 text-center">
          <h1 className="text-4xl font-black tracking-normal text-slate-950 md:text-5xl">
            90天求职生存战 <span className="ml-3 hidden md:inline">Career Sim Roguelite</span>
          </h1>
          <p className="mt-4 text-base font-medium text-slate-500 md:text-lg">现实求职模拟游戏 · 每天选择行动 · 经营资源 · 提升竞争力 · 拿到Offer</p>
        </div>

        <div className="hidden justify-center gap-7 xl:flex">
          {screenLabels.map((_, index) => (
            <ScreenFrame key={index} index={index}>
              <DemoScreen index={index} />
            </ScreenFrame>
          ))}
        </div>

        <div className="xl:hidden">
          <div className="flex snap-x gap-5 overflow-x-auto pb-6">
            {screenLabels.map((_, index) => (
              <div key={index} className="snap-center">
                <ScreenFrame index={index}>
                  <DemoScreen index={index} />
                </ScreenFrame>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
