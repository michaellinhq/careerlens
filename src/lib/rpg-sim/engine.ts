import { actionCards, cityMarkets, events, identityProfiles, targetRoles } from './data';
import type {
  EndingSummary,
  MarketForRole,
  MeterDelta,
  MeterKey,
  RpgEvent,
  RunLogEntry,
  RunState,
  TargetRole,
  TransitionResult,
} from './types';

const meterKeys: MeterKey[] = ['energy', 'money', 'skill', 'portfolio', 'confidence', 'reputation'];

function clampMeter(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyDelta(state: RunState, delta: MeterDelta): RunState {
  const meters = { ...state.meters };
  for (const key of meterKeys) {
    meters[key] = clampMeter(meters[key] + (delta[key] ?? 0));
  }
  return { ...state, meters };
}

function appendLog(state: RunState, entry: Omit<RunLogEntry, 'day'>): RunState {
  return {
    ...state,
    log: [...state.log, { day: state.day, ...entry }],
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function getDueEvent(state: RunState): RpgEvent | undefined {
  return events.find((event) => event.day <= state.day && !state.flags.includes(`event:${event.id}`));
}

export function getRoleById(roleId: string): TargetRole | undefined {
  return targetRoles.find((role) => role.id === roleId || role.roleCode === roleId);
}

export function getMarketForRole(roleId: string, cityId = 'suzhou'): MarketForRole | undefined {
  const role = getRoleById(roleId);
  const city = cityMarkets.find((item) => item.id === cityId);
  if (!role || !city) return undefined;

  const demandScore = city.roleDemand[role.id] ?? role.opportunityScore;
  const pressureScore = clampMeter(city.livingPressure - Math.round((city.networkingBonus + demandScore - 60) / 2));
  const fitHintZh = demandScore >= 75
    ? `${city.cityZh}对${role.titleZh}需求强，适合主攻。`
    : demandScore >= 64
      ? `${city.cityZh}机会稳定，需要用项目证据提高命中率。`
      : `${city.cityZh}不是该岗位最优城市，建议扩大搜索半径。`;

  return { role, city, demandScore, pressureScore, fitHintZh };
}

export function buildEndingSummary(state: RunState): EndingSummary {
  const market = getMarketForRole(state.targetRoleId, state.cityId);
  const marketBoost = market ? Math.round((market.demandScore - market.pressureScore) / 5) : 0;
  const evidenceScore = Math.round(state.meters.skill * 0.28 + state.meters.portfolio * 0.34 + state.meters.confidence * 0.20 + state.meters.reputation * 0.18);
  const survivalPenalty = state.meters.energy < 20 ? 8 : 0;
  const score = clampMeter(evidenceScore + marketBoost - survivalPenalty);
  const offerChance = clampMeter(Math.round(score * 0.82 + state.meters.money * 0.08 + (state.flags.includes('warm-referral') ? 8 : 0)));
  const strongestMetric = meterKeys.reduce((best, key) => state.meters[key] > state.meters[best] ? key : best, 'skill');

  if (offerChance >= 72) {
    return {
      titleZh: '拿到强匹配Offer',
      bodyZh: '你把技能、项目和岗位语境串成了完整证据链，终面表现稳定。',
      offerChance,
      score,
      strongestMetric,
      nextStepZh: '开始比较薪资、成长路径和直属主管风格。',
    };
  }

  if (offerChance >= 52) {
    return {
      titleZh: '进入终面候选池',
      bodyZh: '你已经具备竞争力，但还需要补强一个能被面试官快速理解的硬证据。',
      offerChance,
      score,
      strongestMetric,
      nextStepZh: '优先完善作品集故事，并争取一次内推复盘。',
    };
  }

  return {
    titleZh: '生存成功，求职未通关',
    bodyZh: '你撑过了90天，但证据链仍偏散，投递命中率会比较波动。',
    offerChance,
    score,
    strongestMetric,
    nextStepZh: '缩小目标岗位范围，用两周补一个可展示项目。',
  };
}

export const initialRun: RunState = {
  day: 1,
  identityId: 'fresh-grad',
  targetRoleId: 'cn-ie',
  cityId: 'suzhou',
  meters: { ...identityProfiles[0].startingMeters },
  completedActionIds: [],
  flags: [],
  log: [],
};

export const endingSummary: EndingSummary = buildEndingSummary(initialRun);

export function applyDailyAction(run: RunState, actionId: string): TransitionResult {
  const action = actionCards.find((item) => item.id === actionId);
  if (!action) {
    return { state: run, summary: buildEndingSummary(run) };
  }

  const nextDay = Math.min(90, run.day + action.durationDays);
  const actionState = applyDelta({ ...run, day: nextDay }, action.effects);
  const flags = action.unlocksFlag ? unique([...actionState.flags, action.unlocksFlag]) : actionState.flags;
  const completedActionIds = unique([...actionState.completedActionIds, action.id]);
  const logged = appendLog({ ...actionState, flags, completedActionIds }, {
    titleZh: action.titleZh,
    bodyZh: action.descriptionZh,
    effects: action.effects,
  });
  const triggeredEvent = getDueEvent(logged);

  return {
    state: logged,
    summary: buildEndingSummary(logged),
    triggeredEvent,
  };
}

export function resolveEventChoice(run: RunState, eventId: string, choiceId: string): TransitionResult {
  const event = events.find((item) => item.id === eventId);
  const choice = event?.choices.find((item) => item.id === choiceId);
  if (!event || !choice) {
    return { state: run, summary: buildEndingSummary(run) };
  }

  const withEffects = applyDelta(run, choice.effects);
  const flags = unique([
    ...withEffects.flags,
    `event:${event.id}`,
    ...(choice.addsFlag ? [choice.addsFlag] : []),
  ]);
  const logged = appendLog({ ...withEffects, flags }, {
    titleZh: `${event.titleZh}：${choice.labelZh}`,
    bodyZh: choice.outcomeZh,
    effects: choice.effects,
  });
  const triggeredEvent = getDueEvent(logged);

  return {
    state: logged,
    summary: buildEndingSummary(logged),
    triggeredEvent,
  };
}
