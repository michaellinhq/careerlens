'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  actionCards,
  applyDailyAction,
  buildEndingSummary,
  events,
  getIndustryOption,
  getMarketDemand,
  identityProfiles,
  initialRun,
  marketCityOptions,
  projectQuest,
  resolveEventChoice,
  targetRoles,
} from '@/lib/rpg-sim';
import type { ActionCard, MeterDelta, MeterKey, RpgEvent, RunState } from '@/lib/rpg-sim';
import { RUN_KEY, SESSION_KEY, type CareerSimSession } from './login';

type AppTab = 'role' | 'action' | 'market' | 'quest' | 'battle' | 'review';

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: 'role', label: '角色' },
  { id: 'action', label: '行动' },
  { id: 'market', label: '市场' },
  { id: 'quest', label: '副本' },
  { id: 'battle', label: '面试' },
  { id: 'review', label: '复盘' },
];

const meterLabels: Record<MeterKey, { label: string; tone: string }> = {
  energy: { label: '精力', tone: 'bg-blue-500' },
  money: { label: '现金', tone: 'bg-emerald-500' },
  skill: { label: '技能', tone: 'bg-indigo-500' },
  portfolio: { label: '证据力', tone: 'bg-orange-500' },
  confidence: { label: '信心', tone: 'bg-rose-500' },
  reputation: { label: '人脉', tone: 'bg-slate-500' },
};

const meterOrder: MeterKey[] = ['money', 'energy', 'confidence', 'skill', 'portfolio', 'reputation'];

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
  const industry = getIndustryOption(session.industryId);
  return {
    ...initialRun,
    identityId: identity.id,
    targetRoleId: session.targetRoleId || industry.primaryRoleId,
    cityId: session.cityId || 'shanghai',
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

function SceneCard({ index, className = '' }: { index: number; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 bg-cover bg-no-repeat ${className}`}
      style={{
        backgroundImage: 'url(/rpg/scene-strip-wide.png)',
        backgroundPosition: `${(index / 6) * 100}% center`,
        backgroundSize: '700% 100%',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/70" />
    </div>
  );
}

function PhoneShell({ active, onTab, children }: { active: AppTab; onTab: (tab: AppTab) => void; children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-[744px] w-full max-w-[390px] rounded-[46px] border-[10px] border-[#171717] bg-[#171717] shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
      <div className="absolute left-1/2 top-2 z-20 h-7 w-24 -translate-x-1/2 rounded-b-2xl rounded-t-full bg-[#050505]" />
      <div className="h-full overflow-hidden rounded-[34px] bg-[#fbfaf7]">
        <div className="flex h-9 items-center justify-between px-6 pt-1 text-[11px] font-black text-slate-950">
          <span>9:41</span>
          <span className="tracking-[0.18em]">•••</span>
        </div>
        <div className="h-[640px] overflow-y-auto px-4 pb-4">{children}</div>
        <div className="absolute bottom-0 left-0 right-0 grid h-16 grid-cols-6 border-t border-slate-200 bg-white/95 px-2 backdrop-blur">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-black ${active === tab.id ? 'text-blue-600' : 'text-slate-400'}`}
            >
              <span className={`h-4 w-4 rounded ${active === tab.id ? 'bg-blue-600' : 'border border-slate-300 bg-white'}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatMeter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="grid grid-cols-[52px_1fr_42px] items-center gap-2">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <span className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <span className={`block h-full rounded-full ${tone}`} style={{ width: `${clamp(value)}%` }} />
      </span>
      <span className="text-right text-xs font-black text-slate-700">{clamp(value)}</span>
    </div>
  );
}

function TopHud({ day, offerChance }: { day: number; offerChance: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-sm font-black text-slate-950">Day {String(day).padStart(2, '0')}</div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500">剩余{90 - day}天</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">Offer {offerChance}%</span>
      </div>
    </div>
  );
}

function ActionRow({ action, onSelect }: { action: ActionCard; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(action.id)}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">{action.titleZh.slice(0, 1)}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-slate-950">{action.titleZh}</span>
        <span className="mt-1 block text-[11px] leading-4 text-slate-500">{action.descriptionZh}</span>
        <span className="mt-1 block text-[10px] font-black text-emerald-700">{formatDelta(action.effects)}</span>
      </span>
      <span className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-black text-white">选择</span>
    </button>
  );
}

export default function RpgPlayableApp() {
  const router = useRouter();
  const [session, setSession] = useState<CareerSimSession | null>(null);
  const [run, setRun] = useState<RunState | null>(null);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('role');

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
  const industry = getIndustryOption(session?.industryId);
  const role = targetRoles.find((item) => item.id === run?.targetRoleId) ?? targetRoles.find((item) => item.id === industry.primaryRoleId);
  const identity = identityProfiles.find((item) => item.id === run?.identityId) ?? identityProfiles[0];
  const city = marketCityOptions.find((item) => item.id === run?.cityId) ?? marketCityOptions[0];
  const cityDemand = getMarketDemand(city, industry.id);
  const adjustedOffer = summary ? clamp(summary.offerChance + Math.round((cityDemand - city.competitionScore) / 6)) : 0;
  const topCities = [...marketCityOptions]
    .sort((a, b) => getMarketDemand(b, industry.id) - b.competitionScore - (getMarketDemand(a, industry.id) - a.competitionScore));

  function updateRun(nextRun: RunState) {
    setRun(nextRun);
    persistRun(nextRun);
  }

  function chooseAction(actionId: string) {
    if (!run || pendingEvent || run.day >= 90) return;
    updateRun(applyDailyAction(run, actionId).state);
    setActiveTab('action');
  }

  function chooseEvent(choiceId: string) {
    if (!run || !pendingEvent) return;
    updateRun(resolveEventChoice(run, pendingEvent.id, choiceId).state);
  }

  function chooseCity(cityId: string) {
    if (!run) return;
    updateRun({ ...run, cityId });
    setActiveTab('market');
  }

  function resetGame() {
    if (!session) return;
    updateRun(buildInitialRun(session));
    setActiveTab('role');
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

  const screens: Record<AppTab, React.ReactNode> = {
    role: (
      <div className="pb-6">
        <TopHud day={run.day} offerChance={adjustedOffer} />
        <SceneCard index={0} className="h-40" />
        <h1 className="mt-4 text-3xl font-black leading-tight text-slate-950">你有90天<br />拿到Offer</h1>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-black text-slate-500">行业方向</div>
          <div className="mt-1 text-xl font-black text-slate-950">{industry.titleZh}</div>
          <p className="mt-2 text-xs leading-5 text-slate-500">{industry.signalZh}。系统会从行业反推岗位、技能、项目证据和城市市场。</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {industry.roleHintsZh.map((hint) => (
              <span key={hint} className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">{hint}</span>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {meterOrder.map((key) => (
            <StatMeter key={key} label={meterLabels[key].label} value={run.meters[key]} tone={meterLabels[key].tone} />
          ))}
        </div>
        <button onClick={() => setActiveTab('action')} className="mt-5 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-blue-200">进入第{run.day}天</button>
      </div>
    ),
    action: (
      <div className="pb-6">
        <TopHud day={run.day} offerChance={adjustedOffer} />
        <h1 className="mt-3 text-2xl font-black text-slate-950">今天怎么打</h1>
        <p className="mt-1 text-xs font-medium text-slate-500">每个行动都会改变资源数值和结局概率。</p>
        {pendingEvent ? (
          <div className="mt-4 rounded-3xl border border-orange-200 bg-orange-50 p-4">
            <div className="text-xs font-black text-orange-700">今日事件</div>
            <h2 className="mt-2 text-lg font-black text-slate-950">{pendingEvent.titleZh}</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">{pendingEvent.bodyZh}</p>
            <div className="mt-3 space-y-2">
              {pendingEvent.choices.map((choice) => (
                <button key={choice.id} onClick={() => chooseEvent(choice.id)} className="w-full rounded-2xl bg-white p-3 text-left text-xs font-black text-slate-800 shadow-sm">
                  {choice.labelZh}
                  <span className="mt-1 block text-[10px] font-bold text-orange-700">{formatDelta(choice.effects)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {actionCards.map((action) => <ActionRow key={action.id} action={action} onSelect={chooseAction} />)}
          </div>
        )}
      </div>
    ),
    market: (
      <div className="pb-6">
        <TopHud day={run.day} offerChance={adjustedOffer} />
        <h1 className="mt-2 text-xl font-black text-slate-950">城市与市场</h1>
        <SceneCard index={3} className="mt-3 h-56" />
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-lg font-black text-slate-950">{city.cityZh} · {industry.titleZh}</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-blue-50 p-3">
              <div className="text-[10px] font-black text-blue-700">需求张力</div>
              <div className="mt-1 text-xl font-black text-slate-950">{cityDemand}/100</div>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3">
              <div className="text-[10px] font-black text-orange-700">竞争强度</div>
              <div className="mt-1 text-xl font-black text-slate-950">{city.competitionScore}/100</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-[10px] font-black text-slate-500">薪资P50</div>
              <div className="mt-1 text-base font-black text-slate-950">{city.salaryP50}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <div className="text-[10px] font-black text-emerald-700">生活压力</div>
              <div className="mt-1 text-xl font-black text-slate-950">{city.livingPressure}</div>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">{city.clusterZh}</p>
        </div>
        <div className="mt-3 space-y-2">
          <div className="text-xs font-black text-slate-500">可切换城市</div>
          {topCities.map((item) => {
            const demand = getMarketDemand(item, industry.id);
            const active = item.id === city.id;
            return (
              <button
                key={item.id}
                onClick={() => chooseCity(item.id)}
                className={`w-full rounded-2xl border p-3 text-left shadow-sm ${active ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-slate-950">{item.cityZh}</span>
                  <span className="text-xs font-black text-blue-700">需求 {demand}</span>
                </div>
                <div className="mt-1 text-[11px] font-medium leading-4 text-slate-500">{item.clusterZh}</div>
              </button>
            );
          })}
        </div>
      </div>
    ),
    quest: (
      <div className="pb-6">
        <TopHud day={run.day} offerChance={adjustedOffer} />
        <SceneCard index={4} className="h-40" />
        <h1 className="mt-4 text-2xl font-black text-slate-950">{projectQuest.titleZh}</h1>
        <div className="mt-3 space-y-3">
          {projectQuest.stages.map((stage, index) => {
            const done = run.meters.portfolio >= stage.requiredPortfolio;
            return (
              <div key={stage.id} className={`rounded-2xl border p-3 shadow-sm ${done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                  <div>
                    <div className="text-sm font-black text-slate-950">{stage.titleZh}</div>
                    <div className="mt-1 text-[11px] font-bold text-slate-500">证据力门槛 {stage.requiredPortfolio}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => chooseAction('portfolio-build')} className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white">推进项目副本</button>
      </div>
    ),
    battle: (
      <div className="pb-6">
        <TopHud day={run.day} offerChance={adjustedOffer} />
        <h1 className="mt-2 text-xl font-black text-slate-950">Boss战：技术面</h1>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <SceneCard index={5} className="h-20 w-20 shrink-0 rounded-2xl" />
            <div>
              <div className="text-base font-black text-slate-950">技术面试官</div>
              <div className="mt-1 text-xs text-slate-500">{industry.titleZh} · 资深工程师</div>
              <div className="mt-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500">我们开始吧</div>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-black text-slate-500">问题</div>
          <div className="mt-2 text-lg font-black leading-7 text-slate-950">你如何把一个项目经历讲成岗位证据？</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {['STAR案例', '项目证据', '追问澄清', '稳定心态'].map((tool) => (
            <button key={tool} className="rounded-2xl border border-slate-200 bg-white px-2 py-3 text-xs font-black text-blue-700">{tool}</button>
          ))}
        </div>
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-xs font-black text-slate-500">预计通过率</div>
          <div className="mt-1 text-3xl font-black text-emerald-600">{Math.max(28, adjustedOffer - 8)}% → {Math.min(88, adjustedOffer + 9)}%</div>
        </div>
      </div>
    ),
    review: (
      <div className="pb-6">
        <TopHud day={run.day} offerChance={adjustedOffer} />
        <SceneCard index={6} className="h-32" />
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="text-4xl font-black text-orange-500">奖杯</div>
          <h1 className="mt-2 text-xl font-black text-slate-950">{adjustedOffer >= 55 ? '获得二面机会！' : '生存成功，继续补证据'}</h1>
          <div className="mt-1 text-sm font-black text-slate-700">Offer概率 {adjustedOffer}%</div>
          <p className="mt-2 text-xs leading-5 text-slate-500">{summary.nextStepZh}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
            <div className="text-[10px] font-black text-orange-700">最大短板</div>
            <div className="mt-1 text-sm font-black text-slate-950">证据力不足</div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
            <div className="text-[10px] font-black text-emerald-700">最强优势</div>
            <div className="mt-1 text-sm font-black text-slate-950">{industry.titleZh}方向清晰</div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-5 text-slate-950 md:px-6 md:py-8">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-500">
              <Link href="/rpg" className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">概念页</Link>
              <span>已登录：{session?.name}</span>
              <span>/</span>
              <span>{identity.nameZh}</span>
              <span>/</span>
              <span>{industry.titleZh}</span>
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-5xl">90天求职生存战</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">行业 → 城市市场 → 岗位建议 → 技能/项目证据 → 行动清单</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-3xl bg-blue-50 px-4 py-3">
              <div className="text-xs font-black text-blue-600">Day</div>
              <div className="text-2xl font-black text-slate-950">{run.day}</div>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-4 py-3">
              <div className="text-xs font-black text-emerald-700">Offer</div>
              <div className="text-2xl font-black text-slate-950">{adjustedOffer}%</div>
            </div>
            <button onClick={logout} className="rounded-3xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-500 transition hover:bg-slate-200">
              退出
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[410px_1fr]">
          <PhoneShell active={activeTab} onTab={setActiveTab}>
            {screens[activeTab]}
          </PhoneShell>

          <aside className="hidden space-y-4 lg:block">
            <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-blue-600">当前路径</div>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{industry.titleZh} · {city.cityZh}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                先不要让用户选很窄的岗位。系统会根据行业和城市，推荐可切入岗位：{industry.roleHintsZh.join('、')}。当前主线建议：{role?.titleZh ?? industry.roleHintsZh[0]}。
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ['需求', cityDemand],
                  ['竞争', city.competitionScore],
                  ['生活压力', city.livingPressure],
                  ['行业热度', industry.demandScore],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-[11px] font-black text-slate-500">{label}</div>
                    <div className="mt-1 text-2xl font-black text-slate-950">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-slate-500">城市市场</div>
                  <h2 className="mt-1 text-xl font-black text-slate-950">按行业匹配城市，不只三个</h2>
                </div>
                <button onClick={resetGame} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500 hover:bg-white">重开</button>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {topCities.map((item) => {
                  const demand = getMarketDemand(item, industry.id);
                  const active = item.id === city.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => chooseCity(item.id)}
                      className={`rounded-2xl border p-3 text-left transition ${active ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black text-slate-950">{item.cityZh}</span>
                        <span className="text-xs font-black text-blue-700">需求 {demand}</span>
                      </div>
                      <div className="mt-1 text-[11px] font-medium leading-4 text-slate-500">{item.countryZh} · {item.clusterZh}</div>
                      <div className="mt-2 text-[11px] font-black text-emerald-700">{item.salaryP50}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-black text-slate-500">下一步行动</div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {actionCards.slice(0, 4).map((action) => <ActionRow key={action.id} action={action} onSelect={chooseAction} />)}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
