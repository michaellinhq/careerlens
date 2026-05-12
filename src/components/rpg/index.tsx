"use client";

import type { ReactNode } from "react";
import {
  actionCards,
  cityMarkets,
  events,
  identityProfiles,
  interviewScenario,
  projectQuest,
  targetRoles,
} from "@/lib/rpg-sim";
import type {
  ActionCard as SimActionCard,
  IdentityProfile,
  InterviewScenario,
  MeterDelta,
  ProjectQuest as SimProjectQuest,
  RpgEvent as SimRpgEvent,
  TargetRole,
} from "@/lib/rpg-sim";

type Tone = "blue" | "emerald" | "orange" | "slate" | "red";

export type RpgStat = {
  label: string;
  value: number;
  max?: number;
  tone?: Tone;
  hint?: string;
};

export type RpgRole = {
  id: string;
  title: string;
  archetype: string;
  salary: string;
  tags: string[];
  stats: RpgStat[];
  description: string;
};

export type RpgChoice = {
  id: string;
  title: string;
  detail: string;
  cost?: string;
  reward?: string;
  risk?: string;
  tone?: Tone;
};

export type RpgEvent = {
  title: string;
  day: number;
  weather?: string;
  summary: string;
  pressure: number;
  options: RpgChoice[];
};

export type RpgMarketRole = {
  title: string;
  company: string;
  salary: string;
  heat: number;
  fit: number;
  requirement: string;
};

export type RpgQuest = {
  title: string;
  level: string;
  duration: string;
  progress: number;
  tasks: Array<{ title: string; done?: boolean; reward?: string }>;
  rewards: string[];
};

export type RpgBattleRound = {
  question: string;
  answer: string;
  score: number;
};

export type RpgEnding = {
  title: string;
  result: string;
  offer?: string;
  stats: RpgStat[];
  timeline: Array<{ day: number; title: string; effect: string }>;
  advice: string[];
};

type RpgPhoneShellProps = {
  title?: string;
  subtitle?: string;
  day?: number;
  cash?: number;
  stress?: number;
  children: ReactNode;
  footer?: ReactNode;
};

type RpgBottomNavProps = {
  active?: string;
  items?: Array<{ id: string; label: string; icon?: ReactNode }>;
  onSelect?: (id: string) => void;
};

type StatMeterProps = RpgStat & {
  compact?: boolean;
};

type ChoiceCardProps = RpgChoice & {
  selected?: boolean;
  onChoose?: (id: string) => void;
};

const toneMap: Record<Tone, { text: string; bg: string; border: string; fill: string; soft: string }> = {
  blue: {
    text: "text-blue-700",
    bg: "bg-blue-600",
    border: "border-blue-200",
    fill: "from-blue-500 to-blue-600",
    soft: "bg-blue-50",
  },
  emerald: {
    text: "text-emerald-700",
    bg: "bg-emerald-600",
    border: "border-emerald-200",
    fill: "from-emerald-500 to-emerald-600",
    soft: "bg-emerald-50",
  },
  orange: {
    text: "text-orange-700",
    bg: "bg-orange-500",
    border: "border-orange-200",
    fill: "from-orange-400 to-orange-500",
    soft: "bg-orange-50",
  },
  slate: {
    text: "text-slate-700",
    bg: "bg-slate-700",
    border: "border-slate-200",
    fill: "from-slate-500 to-slate-700",
    soft: "bg-slate-100",
  },
  red: {
    text: "text-red-700",
    bg: "bg-red-500",
    border: "border-red-200",
    fill: "from-red-400 to-red-500",
    soft: "bg-red-50",
  },
};

const meterCopy: Record<string, { label: string; tone: Tone }> = {
  energy: { label: "精力", tone: "blue" },
  money: { label: "现金", tone: "orange" },
  skill: { label: "技能", tone: "blue" },
  portfolio: { label: "作品集", tone: "emerald" },
  confidence: { label: "信心", tone: "emerald" },
  reputation: { label: "声望", tone: "slate" },
};

function formatEffect(value: number) {
  return `${value > 0 ? "+" : ""}${value}`;
}

function effectsToText(effects: MeterDelta, positive: boolean) {
  return (Object.entries(effects) as Array<[keyof MeterDelta, number | undefined]>)
    .filter(([, value]) => (positive ? Number(value) > 0 : Number(value) < 0))
    .map(([key, value]) => `${meterCopy[key]?.label ?? key} ${formatEffect(Number(value))}`)
    .join(" / ");
}

function identityToRole(profile: IdentityProfile, index: number): RpgRole {
  const primaryRole = targetRoles[index % targetRoles.length];

  return {
    id: profile.id,
    title: profile.nameZh,
    archetype: profile.archetypeZh,
    salary: primaryRole?.salaryDisplay ?? "12k-18k",
    tags: profile.traits,
    stats: Object.entries(profile.startingMeters).map(([key, value]) => ({
      label: meterCopy[key]?.label ?? key,
      value,
      tone: meterCopy[key]?.tone ?? "slate",
    })),
    description: profile.descriptionZh,
  };
}

function actionToChoice(action: SimActionCard): RpgChoice {
  const reward = effectsToText(action.effects, true);
  const cost = effectsToText(action.effects, false);
  const toneByCategory: Record<SimActionCard["category"], Tone> = {
    learn: "blue",
    build: "emerald",
    network: "blue",
    apply: "orange",
    rest: "slate",
  };

  return {
    id: action.id,
    title: action.titleZh,
    detail: `${action.descriptionZh} 预计 ${action.durationDays} 天。`,
    cost: cost || undefined,
    reward: reward || undefined,
    tone: toneByCategory[action.category],
  };
}

function eventToScreenEvent(event: SimRpgEvent): RpgEvent {
  const toneByEvent: Record<SimRpgEvent["tone"], Tone> = {
    chance: "emerald",
    risk: "orange",
    story: "blue",
  };

  return {
    title: event.titleZh,
    day: event.day,
    weather: event.tone === "risk" ? "阴" : event.tone === "chance" ? "晴" : "多云",
    summary: event.bodyZh,
    pressure: event.tone === "risk" ? 68 : event.tone === "chance" ? 44 : 55,
    options: event.choices.map((choice) => ({
      id: choice.id,
      title: choice.labelZh,
      detail: choice.outcomeZh,
      cost: effectsToText(choice.effects, false) || undefined,
      reward: effectsToText(choice.effects, true) || undefined,
      tone: toneByEvent[event.tone],
    })),
  };
}

function roleToMarketRole(role: TargetRole, index: number): RpgMarketRole {
  const city = cityMarkets[index % cityMarkets.length];
  const heat = city?.roleDemand[role.id] ?? role.opportunityScore;

  return {
    title: role.titleZh,
    company: `${city?.cityZh ?? "上海"} / ${role.tagsZh[0] ?? "目标岗位"}`,
    salary: role.salaryDisplay,
    heat,
    fit: Math.round((role.opportunityScore + heat) / 2),
    requirement: `${role.tagsZh.join(" + ")}，需要把经历转成可验证证据。`,
  };
}

function projectToQuest(quest: SimProjectQuest): RpgQuest {
  return {
    title: quest.titleZh,
    level: "B 级副本",
    duration: `共 ${quest.stages.length} 阶段`,
    progress: 58,
    tasks: quest.stages.map((stage, index) => ({
      title: stage.titleZh,
      done: index === 0,
      reward: effectsToText(stage.reward, true),
    })),
    rewards: ["简历子弹 +1", "作品集 +22", quest.resumeBulletZh],
  };
}

function scenarioToBattle(scenario: InterviewScenario): RpgBattleRound[] {
  return scenario.rounds.map((round) => {
    const score = Math.round(round.checks.reduce((sum, check) => sum + check.target, 0) / Math.max(round.checks.length, 1) + 18);

    return {
      question: round.titleZh,
      answer: round.checks.map((check) => check.labelZh).join("，"),
      score: Math.min(95, score),
    };
  });
}

const defaultStats: RpgStat[] = [
  { label: "技能", value: 62, tone: "blue", hint: "可投递中级岗位" },
  { label: "作品集", value: 48, tone: "emerald", hint: "还缺业务闭环" },
  { label: "现金", value: 72, tone: "orange", hint: "可撑 32 天" },
  { label: "心态", value: 57, tone: "slate", hint: "压力可控" },
];

const defaultRoles: RpgRole[] = identityProfiles.map(identityToRole);

const defaultEvent: RpgEvent = events[0] ? eventToScreenEvent(events[0]) : {
  day: 17,
  title: "今日事件：目标岗位突然收紧",
  weather: "阴转晴",
  summary: "你收藏的 6 个岗位里，有 3 个新增了“真实项目经验”要求。城市热度仍高，但筛选更硬。",
  pressure: 63,
  options: actionCards.slice(0, 2).map(actionToChoice),
};

const defaultMarket: RpgMarketRole[] = targetRoles.map(roleToMarketRole);

const defaultQuest: RpgQuest = projectToQuest(projectQuest);

const defaultBattle: RpgBattleRound[] = scenarioToBattle(interviewScenario);

const defaultEnding: RpgEnding = {
  title: "结局：稳态上岸",
  result: "第 83 天拿到 1 个正式 Offer，另有 2 个终面机会。",
  offer: "AI 产品助理 / 18k x 14",
  stats: defaultStats,
  timeline: [
    { day: 12, title: "第一次副本完成", effect: "作品集从 22 提升到 45" },
    { day: 31, title: "城市市场换线", effect: "从泛运营转向数据产品" },
    { day: 64, title: "面试战连胜", effect: "表达分提升 19 点" },
  ],
  advice: ["保留求职日志，入职后 30 天继续复盘。", "把项目副本升级成公开作品页。", "现金安全垫低于 30 天时减少高压行动。"],
};

function clampPercent(value: number, max = 100) {
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function MiniIcon({ label }: { label: string }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200">
      {label}
    </span>
  );
}

function SectionTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="space-y-1">
      {eyebrow ? <p className="text-xs font-bold text-blue-600">{eyebrow}</p> : null}
      <h2 className="text-xl font-black leading-tight tracking-normal text-slate-950">{title}</h2>
      {children ? <p className="text-sm leading-6 text-slate-600">{children}</p> : null}
    </div>
  );
}

export function RpgPhoneShell({ title = "90天求职生存战", subtitle = "Career Sim Roguelite", day = 1, cash = 6800, stress = 38, children, footer }: RpgPhoneShellProps) {
  return (
    <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border border-slate-200 bg-slate-950 p-2 shadow-2xl shadow-slate-300/50">
      <div className="min-h-[760px] overflow-hidden rounded-[1.5rem] bg-slate-50 text-slate-950">
        <header className="border-b border-slate-200 bg-white px-4 pb-3 pt-4">
          <div className="mb-3 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>DAY {String(day).padStart(2, "0")} / 90</span>
            <span>09:41</span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-lg font-black leading-tight tracking-normal text-slate-950">{title}</h1>
              <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
              <div className="text-[10px] font-bold text-slate-500">现金</div>
              <div className="font-mono text-sm font-black text-orange-600">¥{cash.toLocaleString("zh-CN")}</div>
            </div>
          </div>
          <div className="mt-3">
            <StatMeter label="压力值" value={stress} tone={stress > 70 ? "red" : stress > 48 ? "orange" : "emerald"} compact />
          </div>
        </header>
        <main className="space-y-4 px-4 py-4">{children}</main>
        {footer ? <footer className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">{footer}</footer> : null}
      </div>
    </div>
  );
}

export function RpgBottomNav({ active = "home", items, onSelect }: RpgBottomNavProps) {
  const navItems = items ?? [
    { id: "home", label: "角色", icon: <MiniIcon label="人" /> },
    { id: "city", label: "市场", icon: <MiniIcon label="城" /> },
    { id: "quest", label: "副本", icon: <MiniIcon label="卷" /> },
    { id: "battle", label: "面试", icon: <MiniIcon label="战" /> },
  ];

  return (
    <nav className="grid grid-cols-4 gap-2">
      {navItems.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[11px] font-bold transition ${
              selected ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function StatMeter({ label, value, max = 100, tone = "blue", hint, compact }: StatMeterProps) {
  const percent = clampPercent(value, max);
  const toneStyle = toneMap[tone];

  return (
    <div className={compact ? "space-y-1" : "rounded-xl border border-slate-200 bg-white p-3 shadow-sm"}>
      <div className="flex items-center justify-between gap-3">
        <span className={`${compact ? "text-xs" : "text-sm"} font-bold text-slate-700`}>{label}</span>
        <span className={`font-mono ${compact ? "text-xs" : "text-sm"} font-black ${toneStyle.text}`}>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full bg-gradient-to-r ${toneStyle.fill}`} style={{ width: `${percent}%` }} />
      </div>
      {!compact && hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function ChoiceCard({ id, title, detail, cost, reward, risk, tone = "blue", selected, onChoose }: ChoiceCardProps) {
  const toneStyle = toneMap[tone];

  return (
    <button
      type="button"
      onClick={() => onChoose?.(id)}
      className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? `${toneStyle.border} ring-2 ring-blue-100` : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 h-3 w-3 rounded-full ${toneStyle.bg}`} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black leading-5 text-slate-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cost ? <span className="rounded-lg bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-700">{cost}</span> : null}
            {reward ? <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">{reward}</span> : null}
            {risk ? <span className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">{risk}</span> : null}
          </div>
        </div>
      </div>
    </button>
  );
}

export function CharacterStartScreen({ roles = defaultRoles, onSelectRole }: { roles?: RpgRole[]; onSelectRole?: (id: string) => void }) {
  return (
    <RpgPhoneShell day={1} cash={7200} stress={26} footer={<RpgBottomNav active="home" />}>
      <SectionTitle eyebrow="01 开局角色" title="选择你的求职流派">
        90 天倒计时开始。每个角色有不同资源、技能债和市场入口。
      </SectionTitle>
      <div className="grid gap-3">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onSelectRole?.(role.id)}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-950">{role.title}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{role.archetype}</p>
              </div>
              <div className="rounded-xl bg-orange-50 px-3 py-2 text-right">
                <div className="text-[10px] font-bold text-orange-700">目标薪资</div>
                <div className="font-mono text-sm font-black text-orange-700">{role.salary}</div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{role.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {role.tags.map((tag) => (
                <span key={tag} className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              {role.stats.map((stat) => (
                <StatMeter key={stat.label} {...stat} compact />
              ))}
            </div>
          </button>
        ))}
      </div>
    </RpgPhoneShell>
  );
}

export function DailyEventScreen({ event = defaultEvent, onChoose }: { event?: RpgEvent; onChoose?: (id: string) => void }) {
  return (
    <RpgPhoneShell day={event.day} cash={6420} stress={event.pressure} title="今日事件">
      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
        <SectionTitle eyebrow="02 今日事件" title={event.title}>
          {event.summary}
        </SectionTitle>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          <span>城市天气：{event.weather ?? "晴"}</span>
          <span className="text-orange-700">压力 {event.pressure}</span>
        </div>
      </section>
      <div className="grid gap-3">
        {event.options.map((option) => (
          <ChoiceCard key={option.id} {...option} onChoose={onChoose} />
        ))}
      </div>
    </RpgPhoneShell>
  );
}

export function ActionChoiceScreen({ choices = defaultEvent.options, onChoose }: { choices?: RpgChoice[]; onChoose?: (id: string) => void }) {
  return (
    <RpgPhoneShell day={18} cash={6360} stress={55} title="行动选择">
      <SectionTitle eyebrow="03 行动选择" title="今天只能做两件事">
        时间、现金和心态都是资源。选择会改变后续市场、项目和面试事件。
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {defaultStats.map((stat) => (
          <StatMeter key={stat.label} {...stat} />
        ))}
      </div>
      <div className="grid gap-3">
        {choices.map((choice) => (
          <ChoiceCard key={choice.id} {...choice} onChoose={onChoose} />
        ))}
      </div>
    </RpgPhoneShell>
  );
}

export function CityMarketScreen({ roles = defaultMarket }: { roles?: RpgMarketRole[] }) {
  return (
    <RpgPhoneShell day={24} cash={5980} stress={47} title="城市市场" footer={<RpgBottomNav active="city" />}>
      <SectionTitle eyebrow="04 城市市场" title="选择下一轮投递战场">
        每座城市都有不同热度、薪资带和隐性门槛。别只看岗位数量。
      </SectionTitle>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
          <div>
            <div className="font-mono text-lg font-black text-blue-700">128</div>
            <div className="text-[11px] font-bold text-slate-500">新增岗位</div>
          </div>
          <div>
            <div className="font-mono text-lg font-black text-emerald-700">72%</div>
            <div className="text-[11px] font-bold text-slate-500">技能覆盖</div>
          </div>
          <div>
            <div className="font-mono text-lg font-black text-orange-700">19k</div>
            <div className="text-[11px] font-bold text-slate-500">中位薪资</div>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {roles.map((role) => (
          <article key={`${role.company}-${role.title}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-950">{role.title}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{role.company}</p>
              </div>
              <span className="rounded-lg bg-orange-50 px-2 py-1 font-mono text-xs font-black text-orange-700">{role.salary}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600">{role.requirement}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatMeter label="市场热度" value={role.heat} tone="blue" compact />
              <StatMeter label="当前匹配" value={role.fit} tone="emerald" compact />
            </div>
          </article>
        ))}
      </div>
    </RpgPhoneShell>
  );
}

export function ProjectQuestScreen({ quest = defaultQuest }: { quest?: RpgQuest }) {
  return (
    <RpgPhoneShell day={39} cash={5110} stress={52} title="项目副本" footer={<RpgBottomNav active="quest" />}>
      <section className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <SectionTitle eyebrow="05 项目副本" title={quest.title}>
            {quest.level} / {quest.duration}
          </SectionTitle>
          <MiniIcon label="副" />
        </div>
        <div className="mt-4">
          <StatMeter label="副本进度" value={quest.progress} tone="emerald" compact />
        </div>
      </section>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-950">任务链</h3>
        <div className="mt-3 space-y-3">
          {quest.tasks.map((task, index) => (
            <div key={task.title} className="flex gap-3">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${task.done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                {task.done ? "✓" : index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-800">{task.title}</div>
                {task.reward ? <div className="mt-0.5 text-xs font-semibold text-emerald-700">{task.reward}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {quest.rewards.map((reward) => (
          <span key={reward} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
            {reward}
          </span>
        ))}
      </div>
    </RpgPhoneShell>
  );
}

export function InterviewBattleScreen({ rounds = defaultBattle }: { rounds?: RpgBattleRound[] }) {
  const average = Math.round(rounds.reduce((sum, round) => sum + round.score, 0) / Math.max(rounds.length, 1));

  return (
    <RpgPhoneShell day={68} cash={3860} stress={71} title="面试战" footer={<RpgBottomNav active="battle" />}>
      <SectionTitle eyebrow="06 面试战" title="Boss：业务负责人">
        回答不是背稿，而是把经历变成可信证据。
      </SectionTitle>
      <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">本轮表现</div>
            <div className="font-mono text-3xl font-black text-orange-600">{average}</div>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 p-1">
            <div className="flex h-full w-full items-center justify-center rounded-[0.8rem] bg-white text-xl font-black text-slate-950">战</div>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {rounds.map((round, index) => (
          <article key={round.question} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <MiniIcon label={`Q${index + 1}`} />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-slate-950">{round.question}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">{round.answer}</p>
                <div className="mt-3">
                  <StatMeter label="说服力" value={round.score} tone={round.score >= 82 ? "emerald" : "blue"} compact />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </RpgPhoneShell>
  );
}

export function EndingReviewScreen({ ending = defaultEnding }: { ending?: RpgEnding }) {
  return (
    <RpgPhoneShell day={90} cash={2140} stress={34} title="结局复盘">
      <section className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
        <SectionTitle eyebrow="07 结局复盘" title={ending.title}>
          {ending.result}
        </SectionTitle>
        {ending.offer ? <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-3 text-sm font-black text-emerald-700">{ending.offer}</div> : null}
      </section>
      <div className="grid grid-cols-2 gap-3">
        {ending.stats.map((stat) => (
          <StatMeter key={stat.label} {...stat} />
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-950">关键回合</h3>
        <div className="mt-3 space-y-3">
          {ending.timeline.map((item) => (
            <div key={`${item.day}-${item.title}`} className="grid grid-cols-[48px_1fr] gap-3">
              <div className="rounded-lg bg-blue-50 py-2 text-center font-mono text-xs font-black text-blue-700">D{item.day}</div>
              <div>
                <div className="text-sm font-bold text-slate-900">{item.title}</div>
                <div className="text-xs leading-5 text-slate-500">{item.effect}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <h3 className="text-sm font-black text-orange-800">下周行动建议</h3>
        <ul className="mt-2 space-y-2">
          {ending.advice.map((item) => (
            <li key={item} className="text-xs leading-5 text-orange-900">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </RpgPhoneShell>
  );
}
