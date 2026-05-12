'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  actionCards,
  applyDailyAction,
  buildEndingSummary,
  cityMarkets,
  events,
  getMarketForRole,
  identityProfiles,
  initialRun,
  projectQuest,
  resolveEventChoice,
  targetRoles,
} from '@/lib/rpg-sim';
import type { ActionCard, MeterDelta, MeterKey, RpgEvent, RunState } from '@/lib/rpg-sim';
import { RUN_KEY, SESSION_KEY, type CareerSimSession } from './login';

const meterLabels: Record<MeterKey, { label: string; tone: string }> = {
  energy: { label: '精力', tone: 'bg-blue-500' },
  money: { label: '现金', tone: 'bg-emerald-500' },
  skill: { label: '技能', tone: 'bg-indigo-500' },
  portfolio: { label: '证据力', tone: 'bg-orange-500' },
  confidence: { label: '信心', tone: 'bg-rose-500' },
  reputation: { label: '人脉', tone: 'bg-slate-500' },
};

const meterOrder: MeterKey[] = ['money', 'energy', 'skill', 'portfolio', 'confidence', 'reputation'];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function buildInitialRun(session: CareerSimSession): RunState {
  const identity = identityProfiles.find((item) => item.id === session.identityId) ?? identityProfiles[0];
  return {
    ...initialRun,
    identityId: identity.id,
    targetRoleId: session.targetRoleId,
    cityId: session.cityId,
    meters: { ...identity.startingMeters },
  };
}

function getPendingEvent(run: RunState): RpgEvent | undefined {
  return events.find((event) => event.day <= run.day && !run.flags.includes(`event:${event.id}`));
}

function formatDelta(delta: MeterDelta) {
  return meterOrder
    .filter((key) => delta[key])
    .map((key) => `${meterLabels[key].label}${delta[key]! > 0 ? '+' : ''}${delta[key]}`)
    .join(' · ');
}

function persistRun(nextRun: RunState) {
  window.localStorage.setItem(RUN_KEY, JSON.stringify(nextRun));
}

function StatMeter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="grid grid-cols-[54px_1fr_42px] items-center gap-3">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <span className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <span className={`block h-full rounded-full ${tone}`} style={{ width: `${clamp(value)}%` }} />
      </span>
      <span className="text-right text-xs font-black text-slate-700">{clamp(value)}</span>
    </div>
  );
}

function ActionButton({ action, disabled, onSelect }: { action: ActionCard; disabled: boolean; onSelect: (id: string) => void }) {
  const categoryStyle: Record<ActionCard['category'], string> = {
    learn: 'border-blue-100 bg-blue-50 text-blue-700',
    build: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    network: 'border-violet-100 bg-violet-50 text-violet-700',
    apply: 'border-orange-100 bg-orange-50 text-orange-700',
    rest: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(action.id)}
      className="rounded-[24px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-black text-slate-950">{action.titleZh}</div>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{action.descriptionZh}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${categoryStyle[action.category]}`}>
          {action.durationDays}天
        </span>
      </div>
      <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-[11px] font-black text-slate-600">
        {formatDelta(action.effects)}
      </div>
    </button>
  );
}

function EventPanel({ event, onResolve }: { event: RpgEvent; onResolve: (choiceId: string) => void }) {
  return (
    <section className="rounded-[28px] border border-orange-200 bg-orange-50 p-5 shadow-sm">
      <div className="text-xs font-black text-orange-700">今日事件 · Day {event.day}</div>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{event.titleZh}</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{event.bodyZh}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {event.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => onResolve(choice.id)}
            className="rounded-3xl border border-orange-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-sm font-black text-slate-950">{choice.labelZh}</div>
            <div className="mt-2 text-xs font-bold leading-5 text-orange-700">{formatDelta(choice.effects)}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{choice.outcomeZh}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function RpgPlayableApp() {
  const router = useRouter();
  const [session, setSession] = useState<CareerSimSession | null>(null);
  const [run, setRun] = useState<RunState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadedSession = safeParse<CareerSimSession>(window.localStorage.getItem(SESSION_KEY));
    if (!loadedSession) {
      router.replace('/rpg/login');
      return;
    }
    const loadedRun = safeParse<RunState>(window.localStorage.getItem(RUN_KEY));
    queueMicrotask(() => {
      setSession(loadedSession);
      setRun(loadedRun ?? buildInitialRun(loadedSession));
      setReady(true);
    });
  }, [router]);

  const summary = useMemo(() => (run ? buildEndingSummary(run) : null), [run]);
  const pendingEvent = useMemo(() => (run ? getPendingEvent(run) : undefined), [run]);
  const role = targetRoles.find((item) => item.id === run?.targetRoleId);
  const identity = identityProfiles.find((item) => item.id === run?.identityId);
  const market = run ? getMarketForRole(run.targetRoleId, run.cityId) : undefined;
  const isFinished = Boolean(run && run.day >= 90);

  function updateRun(nextRun: RunState) {
    setRun(nextRun);
    persistRun(nextRun);
  }

  function chooseAction(actionId: string) {
    if (!run || isFinished || pendingEvent) return;
    const result = applyDailyAction(run, actionId);
    updateRun(result.state);
  }

  function chooseEvent(choiceId: string) {
    if (!run || !pendingEvent) return;
    const result = resolveEventChoice(run, pendingEvent.id, choiceId);
    updateRun(result.state);
  }

  function chooseCity(cityId: string) {
    if (!run) return;
    updateRun({ ...run, cityId });
  }

  function resetGame() {
    if (!session) return;
    const freshRun = buildInitialRun(session);
    updateRun(freshRun);
  }

  function logout() {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(RUN_KEY);
    router.push('/rpg/login');
  }

  if (!ready || !run || !summary) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-4 text-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm font-black text-slate-600 shadow-sm">正在进入求职战场...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-5 text-slate-950 md:px-6 md:py-8">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-500">
              <Link href="/rpg" className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">概念页</Link>
              <span>已登录：{session?.name}</span>
              <span className="text-slate-300">/</span>
              <span>{identity?.nameZh}</span>
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-5xl">90天求职生存战</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">目标岗位：{role?.titleZh} · {market?.city.cityZh ?? '苏州'}市场 · 每次行动都会改变结局概率</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-3xl bg-blue-50 px-4 py-3">
              <div className="text-xs font-black text-blue-600">Day</div>
              <div className="text-2xl font-black text-slate-950">{run.day}</div>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-4 py-3">
              <div className="text-xs font-black text-emerald-700">Offer</div>
              <div className="text-2xl font-black text-slate-950">{summary.offerChance}%</div>
            </div>
            <button onClick={logout} className="rounded-3xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-500 transition hover:bg-slate-200">
              退出
            </button>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr_0.9fr]">
          <aside className="space-y-5">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-slate-500">当前角色</div>
                  <div className="mt-1 text-xl font-black text-slate-950">{identity?.nameZh}</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-2xl font-black text-blue-600">{identity?.nameZh.slice(0, 1)}</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">{identity?.descriptionZh}</p>
              <div className="mt-4 space-y-3">
                {meterOrder.map((key) => (
                  <StatMeter key={key} label={meterLabels[key].label} value={run.meters[key]} tone={meterLabels[key].tone} />
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-slate-500">城市市场</div>
              <div className="mt-3 grid gap-2">
                {cityMarkets.map((city) => {
                  const cityMarket = getMarketForRole(run.targetRoleId, city.id);
                  const active = city.id === run.cityId;
                  return (
                    <button
                      key={city.id}
                      onClick={() => chooseCity(city.id)}
                      className={`rounded-2xl border p-3 text-left transition ${active ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black text-slate-950">{city.cityZh}</span>
                        <span className="text-xs font-black text-blue-700">需求 {cityMarket?.demandScore ?? 0}</span>
                      </div>
                      <div className="mt-1 text-[11px] font-medium text-slate-500">压力 {city.livingPressure} · 房租 ¥{city.rentPerMonth}/月</div>
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          <div className="space-y-5">
            {pendingEvent ? <EventPanel event={pendingEvent} onResolve={chooseEvent} /> : null}

            <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-black text-blue-600">今日行动</div>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">{pendingEvent ? '先处理事件' : isFinished ? '90天结局已生成' : '选择下一步怎么打'}</h2>
                </div>
                <button onClick={resetGame} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500 hover:bg-white">重开一局</button>
              </div>

              {isFinished ? (
                <div className="mt-5 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5">
                  <div className="text-xs font-black text-emerald-700">第90天复盘</div>
                  <h3 className="mt-2 text-3xl font-black text-slate-950">{summary.titleZh}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{summary.bodyZh}</p>
                  <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-black text-slate-700">下一步：{summary.nextStepZh}</div>
                </div>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {actionCards.map((action) => (
                    <ActionButton key={action.id} action={action} disabled={Boolean(pendingEvent)} onSelect={chooseAction} />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-slate-500">行动日志</div>
                  <h2 className="mt-1 text-xl font-black text-slate-950">真实证据链</h2>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{run.log.length}条</div>
              </div>
              <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                {run.log.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 p-5 text-sm font-medium leading-6 text-slate-500">还没有行动。先选择一个行动，系统会把它转成可复盘的求职证据。</div>
                ) : (
                  [...run.log].reverse().map((entry, index) => (
                    <div key={`${entry.day}-${entry.titleZh}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-black text-slate-950">Day {entry.day} · {entry.titleZh}</div>
                        <div className="text-[11px] font-black text-blue-700">{formatDelta(entry.effects)}</div>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{entry.bodyZh}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-slate-500">岗位卡</div>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{role?.titleZh}</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <div className="text-[11px] font-black text-emerald-700">薪资</div>
                  <div className="mt-1 text-sm font-black text-slate-950">{role?.salaryDisplay}</div>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3">
                  <div className="text-[11px] font-black text-blue-700">机会分</div>
                  <div className="mt-1 text-sm font-black text-slate-950">{role?.opportunityScore}/100</div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">{market?.fitHintZh}</p>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-slate-500">项目副本</div>
              <h2 className="mt-1 text-xl font-black text-slate-950">{projectQuest.titleZh}</h2>
              <div className="mt-4 space-y-3">
                {projectQuest.stages.map((stage, index) => {
                  const complete = run.meters.portfolio >= stage.requiredPortfolio;
                  return (
                    <div key={stage.id} className={`rounded-2xl border p-3 ${complete ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${complete ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>{index + 1}</span>
                        <span className="text-sm font-black text-slate-950">{stage.titleZh}</span>
                      </div>
                      <div className="mt-2 text-[11px] font-bold text-slate-500">证据力门槛 {stage.requiredPortfolio}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-slate-500">结局预测</div>
              <div className="mt-2 text-4xl font-black text-emerald-600">{summary.offerChance}%</div>
              <div className="mt-2 text-lg font-black text-slate-950">{summary.titleZh}</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{summary.nextStepZh}</p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
