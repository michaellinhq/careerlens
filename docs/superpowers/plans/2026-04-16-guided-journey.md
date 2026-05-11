# Guided Journey: 3-Block Quiz Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the CareerLens assessment flow into a Typeform/16Personalities-style 3-block guided quiz that reveals three beautiful insight cards (Career DNA → Opportunity Map → Landing Zone) while preserving all existing data intelligence (red/blue ocean salary map, skill ROI, GitHub + training paths).

**Architecture:** Journey state persisted in `localStorage` under key `careerlens_journey_v1`. Block 1 reuses the existing RIASEC personality engine (`lib/personality/`). Blocks 2 and 3 are new multi-choice question sets scored into industry and city rankings. Each block ends with a reveal card. The homepage resume-paste flow routes into `/journey` as the single entry point.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, TailwindCSS 4, existing personality engine (`lib/personality/engine.ts`), DeepSeek API (CN), Mistral API (EU/GDPR), localStorage for state, no new runtime dependencies.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/lib/journey/types.ts` | All shared TypeScript interfaces for journey state |
| Create | `src/lib/journey/state.ts` | localStorage load/save/clear/update helpers |
| Create | `src/lib/journey/questions-goals.ts` | Block 2: 8 goals + industry preference questions |
| Create | `src/lib/journey/questions-market.ts` | Block 3: 6 geography + mobility questions |
| Create | `src/lib/journey/scoring.ts` | `scoreBlock()` — tally answers → BlockResult |
| Create | `src/lib/journey/ai-router.ts` | `getAIConfig()` — EU→Mistral, CN→DeepSeek routing |
| Create | `src/components/cards/CareerDNACard.tsx` | Block 1 reveal card (blue gradient, archetype + RIASEC bars) |
| Create | `src/components/cards/OpportunityCard.tsx` | Block 2 reveal card (emerald gradient, top 3 industries) |
| Create | `src/components/cards/LandingZoneCard.tsx` | Block 3 reveal card (violet gradient, top 3 cities) |
| Create | `src/app/journey/page.tsx` | Journey entry: reads resumeProfile from sessionStorage, seeds journey state |
| Create | `src/app/journey/block1/page.tsx` | Thin wrapper: redirects to `/assess/personality?journeyMode=true` |
| Create | `src/app/journey/block2/page.tsx` | 8-question goals quiz (one question per screen) |
| Create | `src/app/journey/block3/page.tsx` | 6-question market quiz (one question per screen) |
| Create | `src/app/journey/card1/page.tsx` | Career DNA card reveal + "Continue" CTA |
| Create | `src/app/journey/card2/page.tsx` | Opportunity Map card reveal + "Continue" CTA |
| Create | `src/app/journey/card3/page.tsx` | Landing Zone card reveal + final CTA to `/plan` |
| Create | `src/app/api/journey-narrative/route.ts` | AI narrative generation (EU/CN routing, GDPR-safe) |
| Modify | `src/app/page.tsx` | After resume analysis succeeds → redirect to `/journey` instead of staying |
| Modify | `src/app/assess/personality/page.tsx` | When `journeyMode=true` search param, "Back" → `/journey/card1` |

---

### Task 1: Journey State Types

**Files:**
- Create: `src/lib/journey/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/lib/journey/types.ts

export interface ResumeProfile {
  industry: string
  function_area: string
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
  years_experience: number
  core_competencies: string[]
  languages: Array<{ language: string; level: string }>
  cross_industry: Array<{ industry_id: string; reason: string }>
  summary?: string
}

export interface MultiChoiceOption {
  value: string
  label: string
  label_zh: string
  label_de: string
  /** weights maps dimension IDs (industry IDs or city IDs) to score deltas */
  weights: Record<string, number>
}

export interface MultiChoiceQuestion {
  id: string
  /** Which scoring dimension this question primarily informs */
  dimension: string
  text: string
  text_zh: string
  text_de: string
  options: MultiChoiceOption[]
}

export interface BlockAnswer {
  questionId: string
  selectedValue: string
}

export interface BlockResult {
  scores: Record<string, number>
  top3: string[]
  answers: BlockAnswer[]
}

export interface JourneyState {
  resumeProfile: ResumeProfile | null
  block1: import('../personality/types').PersonalityReport | null
  block2: BlockResult | null
  block3: BlockResult | null
  startedAt: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/haiqing/WeChatProjects/miniprogram-2/webapp
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: no errors (file has no imports that could fail yet).

- [ ] **Step 3: Commit**

```bash
git add src/lib/journey/types.ts
git commit -m "feat: add journey state types"
```

---

### Task 2: Journey State Helpers (localStorage)

**Files:**
- Create: `src/lib/journey/state.ts`
- Read first: `src/lib/journey/types.ts`

- [ ] **Step 1: Create the state helpers file**

```typescript
// src/lib/journey/state.ts
import type { JourneyState } from './types'

const KEY = 'careerlens_journey_v1'

const EMPTY: JourneyState = {
  resumeProfile: null,
  block1: null,
  block2: null,
  block3: null,
  startedAt: new Date().toISOString(),
}

export function loadJourneyState(): JourneyState {
  if (typeof window === 'undefined') return { ...EMPTY }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY, startedAt: new Date().toISOString() }
    return JSON.parse(raw) as JourneyState
  } catch {
    return { ...EMPTY, startedAt: new Date().toISOString() }
  }
}

export function saveJourneyState(state: JourneyState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(state))
}

export function clearJourneyState(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}

export function updateJourneyState(patch: Partial<JourneyState>): JourneyState {
  const current = loadJourneyState()
  const updated = { ...current, ...patch }
  saveJourneyState(updated)
  return updated
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/journey/state.ts
git commit -m "feat: add journey localStorage state helpers"
```

---

### Task 3: Block 2 Question Bank (Goals & Industry, 8 questions)

**Files:**
- Create: `src/lib/journey/questions-goals.ts`

Industry IDs used as weight keys must match the industry IDs already in the app: `automotive`, `electronics`, `energy`, `robotics`, `medical_devices`, `aerospace`, `manufacturing`, `software`, `consulting`, `finance`.

- [ ] **Step 1: Create the question bank**

```typescript
// src/lib/journey/questions-goals.ts
import type { MultiChoiceQuestion } from './types'

export const GOALS_QUESTIONS: MultiChoiceQuestion[] = [
  {
    id: 'g1',
    dimension: 'industry',
    text: 'What is your primary career goal in the next 3 years?',
    text_zh: '未来3年你最核心的职业目标是什么？',
    text_de: 'Was ist dein wichtigstes Karriereziel in den nächsten 3 Jahren?',
    options: [
      {
        value: 'salary',
        label: 'Maximize my salary',
        label_zh: '最大化薪资收入',
        label_de: 'Gehalt maximieren',
        weights: { finance: 3, consulting: 2, software: 2 },
      },
      {
        value: 'impact',
        label: 'Work on meaningful problems',
        label_zh: '做有意义的事',
        label_de: 'An sinnvollen Problemen arbeiten',
        weights: { energy: 3, medical_devices: 3, aerospace: 2 },
      },
      {
        value: 'stability',
        label: 'Find a stable long-term role',
        label_zh: '找到稳定的长期岗位',
        label_de: 'Einen stabilen Langzeitjob finden',
        weights: { automotive: 3, manufacturing: 3, electronics: 2 },
      },
      {
        value: 'expertise',
        label: 'Become a recognized domain expert',
        label_zh: '成为领域公认专家',
        label_de: 'Anerkannter Fachexperte werden',
        weights: { aerospace: 3, robotics: 2, medical_devices: 2 },
      },
    ],
  },
  {
    id: 'g2',
    dimension: 'industry',
    text: 'Which product type excites you most?',
    text_zh: '哪类产品最让你兴奋？',
    text_de: 'Welche Produktart begeistert dich am meisten?',
    options: [
      {
        value: 'vehicles',
        label: 'Vehicles & mobility',
        label_zh: '车辆与出行',
        label_de: 'Fahrzeuge & Mobilität',
        weights: { automotive: 4, aerospace: 2 },
      },
      {
        value: 'software',
        label: 'Software & digital platforms',
        label_zh: '软件与数字平台',
        label_de: 'Software & digitale Plattformen',
        weights: { software: 4, electronics: 2 },
      },
      {
        value: 'machines',
        label: 'Industrial machines & robots',
        label_zh: '工业机器与机器人',
        label_de: 'Industriemaschinen & Roboter',
        weights: { robotics: 4, manufacturing: 2 },
      },
      {
        value: 'medical',
        label: 'Medical & life-science devices',
        label_zh: '医疗与生命科学设备',
        label_de: 'Medizin- & Life-Science-Geräte',
        weights: { medical_devices: 4, electronics: 1 },
      },
    ],
  },
  {
    id: 'g3',
    dimension: 'industry',
    text: 'How important is sustainability in your next role?',
    text_zh: '可持续发展在你下一份工作中有多重要？',
    text_de: 'Wie wichtig ist Nachhaltigkeit in deiner nächsten Stelle?',
    options: [
      {
        value: 'essential',
        label: 'It is the main reason I am changing careers',
        label_zh: '这是我转行的主要原因',
        label_de: 'Das ist mein Hauptgrund für den Wechsel',
        weights: { energy: 5, automotive: 2 },
      },
      {
        value: 'important',
        label: 'Important but not the deciding factor',
        label_zh: '重要但不是决定因素',
        label_de: 'Wichtig, aber nicht entscheidend',
        weights: { energy: 2, aerospace: 1, manufacturing: 1 },
      },
      {
        value: 'neutral',
        label: 'Neutral — I care more about the work itself',
        label_zh: '中立 — 我更在乎工作本身',
        label_de: 'Neutral — die Arbeit selbst ist mir wichtiger',
        weights: { robotics: 1, software: 1, finance: 1 },
      },
      {
        value: 'irrelevant',
        label: 'Not a factor for me',
        label_zh: '对我来说不重要',
        label_de: 'Kein Faktor für mich',
        weights: { consulting: 1, finance: 2 },
      },
    ],
  },
  {
    id: 'g4',
    dimension: 'industry',
    text: 'What kind of team do you thrive in?',
    text_zh: '你在哪种团队中最能发挥？',
    text_de: 'In welchem Team blühst du auf?',
    options: [
      {
        value: 'small_agile',
        label: 'Small, fast-moving startup team',
        label_zh: '小型、快速移动的创业团队',
        label_de: 'Kleines, agiles Start-up-Team',
        weights: { software: 3, robotics: 2 },
      },
      {
        value: 'large_structured',
        label: 'Large structured organization',
        label_zh: '大型结构化组织',
        label_de: 'Große strukturierte Organisation',
        weights: { automotive: 3, aerospace: 3, manufacturing: 2 },
      },
      {
        value: 'cross_functional',
        label: 'Cross-functional project teams',
        label_zh: '跨职能项目团队',
        label_de: 'Funktionsübergreifende Projektteams',
        weights: { consulting: 3, energy: 2 },
      },
      {
        value: 'independent',
        label: 'Independent expert / advisory',
        label_zh: '独立专家/顾问',
        label_de: 'Unabhängiger Experte / Beratung',
        weights: { consulting: 4, medical_devices: 1 },
      },
    ],
  },
  {
    id: 'g5',
    dimension: 'industry',
    text: 'What growth path excites you more?',
    text_zh: '哪种发展路径更让你兴奋？',
    text_de: 'Welcher Wachstumspfad reizt dich mehr?',
    options: [
      {
        value: 'technical_depth',
        label: 'Go deeper technically — become the specialist',
        label_zh: '深化技术 — 成为专家',
        label_de: 'Technisch tiefer gehen — Spezialist werden',
        weights: { aerospace: 3, robotics: 3, medical_devices: 2 },
      },
      {
        value: 'management',
        label: 'Move into management and leadership',
        label_zh: '走向管理和领导岗位',
        label_de: 'In Management und Führung wechseln',
        weights: { automotive: 2, manufacturing: 2, consulting: 2 },
      },
      {
        value: 'entrepreneurship',
        label: 'Start something new — product or company',
        label_zh: '开创新事业 — 产品或公司',
        label_de: 'Etwas Neues starten — Produkt oder Unternehmen',
        weights: { software: 3, energy: 2, robotics: 2 },
      },
      {
        value: 'international',
        label: 'Build an international career',
        label_zh: '建立国际化职业生涯',
        label_de: 'Eine internationale Karriere aufbauen',
        weights: { consulting: 3, automotive: 2, aerospace: 2 },
      },
    ],
  },
  {
    id: 'g6',
    dimension: 'industry',
    text: 'What is your biggest concern about changing careers?',
    text_zh: '转行最让你担心的是什么？',
    text_de: 'Was bereitet dir beim Karrierewechsel die größten Sorgen?',
    options: [
      {
        value: 'skill_gap',
        label: 'I will have skills gaps to fill',
        label_zh: '我需要填补技能差距',
        label_de: 'Ich habe Kompetenzlücken zu schließen',
        weights: { software: 2, robotics: 2 },
      },
      {
        value: 'salary_drop',
        label: 'My salary might drop initially',
        label_zh: '薪资可能初期下降',
        label_de: 'Mein Gehalt könnte anfangs sinken',
        weights: { finance: 2, consulting: 2, automotive: 1 },
      },
      {
        value: 'recognition',
        label: 'My current expertise might not be recognized',
        label_zh: '我的现有专业可能不被认可',
        label_de: 'Meine bisherige Expertise wird vielleicht nicht anerkannt',
        weights: { aerospace: 2, medical_devices: 2 },
      },
      {
        value: 'network',
        label: 'I will need to rebuild my network',
        label_zh: '我需要重建人脉网络',
        label_de: 'Ich muss mein Netzwerk neu aufbauen',
        weights: { consulting: 3, energy: 1 },
      },
    ],
  },
  {
    id: 'g7',
    dimension: 'industry',
    text: 'Which emerging technology trend do you want to be part of?',
    text_zh: '你最想参与哪个新兴技术趋势？',
    text_de: 'An welchem Technologietrend möchtest du mitwirken?',
    options: [
      {
        value: 'ai_ml',
        label: 'AI and machine learning',
        label_zh: 'AI和机器学习',
        label_de: 'KI und maschinelles Lernen',
        weights: { software: 4, robotics: 2, automotive: 1 },
      },
      {
        value: 'electrification',
        label: 'Electrification and batteries',
        label_zh: '电气化与电池技术',
        label_de: 'Elektrifizierung und Batterietechnologie',
        weights: { automotive: 3, energy: 3 },
      },
      {
        value: 'automation',
        label: 'Factory automation and Industry 4.0',
        label_zh: '工厂自动化与工业4.0',
        label_de: 'Fabrikautomatisierung und Industrie 4.0',
        weights: { robotics: 4, manufacturing: 3 },
      },
      {
        value: 'biotech',
        label: 'Biotech, medtech, diagnostics',
        label_zh: '生物技术、医疗器械、诊断',
        label_de: 'Biotech, Medtech, Diagnostik',
        weights: { medical_devices: 4, electronics: 1 },
      },
    ],
  },
  {
    id: 'g8',
    dimension: 'industry',
    text: 'How do you prefer to measure your professional success?',
    text_zh: '你更喜欢用什么标准衡量职业成功？',
    text_de: 'Woran misst du beruflichen Erfolg am liebsten?',
    options: [
      {
        value: 'compensation',
        label: 'Total compensation and wealth',
        label_zh: '总薪酬和财富积累',
        label_de: 'Gesamtvergütung und Vermögen',
        weights: { finance: 4, consulting: 2, software: 2 },
      },
      {
        value: 'problems_solved',
        label: 'Complexity and scale of problems solved',
        label_zh: '解决问题的复杂度和规模',
        label_de: 'Komplexität und Umfang gelöster Probleme',
        weights: { aerospace: 3, robotics: 2, energy: 2 },
      },
      {
        value: 'people_led',
        label: 'Team size and organizational impact',
        label_zh: '团队规模和组织影响力',
        label_de: 'Teamgröße und organisatorische Wirkung',
        weights: { automotive: 3, manufacturing: 2, consulting: 2 },
      },
      {
        value: 'products_shipped',
        label: 'Products shipped and users reached',
        label_zh: '发布的产品和触达的用户',
        label_de: 'Veröffentlichte Produkte und erreichte Nutzer',
        weights: { software: 4, electronics: 2 },
      },
    ],
  },
]
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/journey/questions-goals.ts
git commit -m "feat: add Block 2 goals question bank (8 questions, trilingual)"
```

---

### Task 4: Block 3 Question Bank (Market & Geography, 6 questions)

**Files:**
- Create: `src/lib/journey/questions-market.ts`

City IDs must match the IDs already used in `src/app/market/page.tsx`: `shanghai`, `shenzhen`, `beijing`, `suzhou`, `chengdu`, `wuhan`, `hangzhou`, `munich`, `hamburg`, `frankfurt`, `stuttgart`, `berlin`.

- [ ] **Step 1: Create the question bank**

```typescript
// src/lib/journey/questions-market.ts
import type { MultiChoiceQuestion } from './types'

export const MARKET_QUESTIONS: MultiChoiceQuestion[] = [
  {
    id: 'm1',
    dimension: 'geography',
    text: 'Where do you want to build your career?',
    text_zh: '你想在哪里发展职业？',
    text_de: 'Wo möchtest du deine Karriere aufbauen?',
    options: [
      {
        value: 'china_tier1',
        label: 'China — Tier 1 cities (BJ, SH, SZ)',
        label_zh: '中国一线城市（北上深）',
        label_de: 'China – Tier-1-Städte (BJ, SH, SZ)',
        weights: { beijing: 3, shanghai: 3, shenzhen: 3 },
      },
      {
        value: 'china_tier2',
        label: 'China — Tier 2 manufacturing hubs',
        label_zh: '中国二线制造业城市',
        label_de: 'China – Tier-2-Produktionszentren',
        weights: { suzhou: 3, chengdu: 3, wuhan: 3, hangzhou: 2 },
      },
      {
        value: 'germany_south',
        label: 'Germany — Bavaria & Baden-Württemberg',
        label_zh: '德国 — 巴伐利亚和巴登-符腾堡',
        label_de: 'Deutschland – Bayern & Baden-Württemberg',
        weights: { munich: 4, stuttgart: 4 },
      },
      {
        value: 'germany_north',
        label: 'Germany — Hamburg, Frankfurt, Berlin',
        label_zh: '德国 — 汉堡、法兰克福、柏林',
        label_de: 'Deutschland – Hamburg, Frankfurt, Berlin',
        weights: { hamburg: 3, frankfurt: 3, berlin: 3 },
      },
    ],
  },
  {
    id: 'm2',
    dimension: 'geography',
    text: 'How important is proximity to automotive / industrial clusters?',
    text_zh: '靠近汽车/工业集群对你有多重要？',
    text_de: 'Wie wichtig ist die Nähe zu Automobil-/Industrieclustern?',
    options: [
      {
        value: 'essential',
        label: 'Very important — I want to be at the center of the industry',
        label_zh: '非常重要 — 我要在行业中心',
        label_de: 'Sehr wichtig – ich will im Zentrum der Branche sein',
        weights: { munich: 3, stuttgart: 3, suzhou: 3, wuhan: 2 },
      },
      {
        value: 'nice_to_have',
        label: 'Nice to have, not essential',
        label_zh: '有则更好，不是必须',
        label_de: 'Schön, aber nicht zwingend',
        weights: { frankfurt: 2, hamburg: 2, chengdu: 2 },
      },
      {
        value: 'irrelevant',
        label: 'Not important — I work remotely or sector-agnostic',
        label_zh: '不重要 — 我远程工作或不限行业',
        label_de: 'Unwichtig – ich arbeite remote oder branchenunabhängig',
        weights: { berlin: 3, shanghai: 2, shenzhen: 2 },
      },
    ],
  },
  {
    id: 'm3',
    dimension: 'geography',
    text: 'What is your language situation?',
    text_zh: '你的语言情况是怎样的？',
    text_de: 'Wie sieht es mit deinen Sprachkenntnissen aus?',
    options: [
      {
        value: 'chinese_only',
        label: 'Primarily Chinese — English is limited',
        label_zh: '以中文为主 — 英语有限',
        label_de: 'Hauptsächlich Chinesisch – eingeschränktes Englisch',
        weights: { shanghai: 2, shenzhen: 2, beijing: 2, suzhou: 2, chengdu: 2, wuhan: 2, hangzhou: 2 },
      },
      {
        value: 'chinese_english',
        label: 'Chinese + solid English',
        label_zh: '中文 + 扎实英语',
        label_de: 'Chinesisch + solides Englisch',
        weights: { shanghai: 3, shenzhen: 3, hamburg: 2, frankfurt: 2, berlin: 2 },
      },
      {
        value: 'german_learning',
        label: 'Learning German or already A2+',
        label_zh: '正在学德语或已达A2以上',
        label_de: 'Ich lerne Deutsch oder bin bereits A2+',
        weights: { munich: 4, stuttgart: 4, frankfurt: 3, hamburg: 3 },
      },
      {
        value: 'multilingual',
        label: 'EN + DE + ZH — fully multilingual',
        label_zh: '英语+德语+中文 — 完全多语言',
        label_de: 'EN + DE + ZH – vollständig mehrsprachig',
        weights: { munich: 3, frankfurt: 3, berlin: 3, shanghai: 2 },
      },
    ],
  },
  {
    id: 'm4',
    dimension: 'geography',
    text: 'How open are you to relocation?',
    text_zh: '你对搬迁的接受程度如何？',
    text_de: 'Wie offen bist du für einen Umzug?',
    options: [
      {
        value: 'stay_china',
        label: 'I want to stay in China',
        label_zh: '我想留在中国',
        label_de: 'Ich möchte in China bleiben',
        weights: { shanghai: 3, shenzhen: 3, beijing: 3, suzhou: 2, chengdu: 2 },
      },
      {
        value: 'open_germany',
        label: 'Open to Germany with the right offer',
        label_zh: '有合适机会愿意去德国',
        label_de: 'Offen für Deutschland bei passendem Angebot',
        weights: { munich: 4, stuttgart: 3, frankfurt: 3 },
      },
      {
        value: 'anywhere',
        label: 'Open to anywhere — opportunity first',
        label_zh: '哪里有机会就去哪里',
        label_de: 'Überall offen – Chance zuerst',
        weights: { munich: 2, shanghai: 2, berlin: 2, frankfurt: 2 },
      },
      {
        value: 'remote',
        label: 'Remote-first — location is secondary',
        label_zh: '远程优先 — 地点是次要的',
        label_de: 'Remote-first – Ort ist zweitrangig',
        weights: { berlin: 3, shanghai: 2, shenzhen: 2 },
      },
    ],
  },
  {
    id: 'm5',
    dimension: 'geography',
    text: 'What lifestyle factor matters most to you?',
    text_zh: '哪个生活方式因素对你最重要？',
    text_de: 'Welcher Lebensstilfaktor ist dir am wichtigsten?',
    options: [
      {
        value: 'cost_of_living',
        label: 'Low cost of living',
        label_zh: '较低的生活成本',
        label_de: 'Niedrige Lebenshaltungskosten',
        weights: { chengdu: 4, wuhan: 4, berlin: 3 },
      },
      {
        value: 'family',
        label: 'Family-friendly environment',
        label_zh: '适合家庭的环境',
        label_de: 'Familienfreundliches Umfeld',
        weights: { suzhou: 3, hangzhou: 3, munich: 3, stuttgart: 3 },
      },
      {
        value: 'career_network',
        label: 'Dense professional network',
        label_zh: '密集的职业人脉',
        label_de: 'Dichtes professionelles Netzwerk',
        weights: { shanghai: 4, beijing: 3, munich: 3, frankfurt: 3 },
      },
      {
        value: 'international',
        label: 'International community and cosmopolitan vibe',
        label_zh: '国际化社区和都市氛围',
        label_de: 'Internationale Community und kosmopolitisches Flair',
        weights: { shanghai: 3, berlin: 4, hamburg: 3 },
      },
    ],
  },
  {
    id: 'm6',
    dimension: 'geography',
    text: 'What is your target salary range (monthly, pre-tax)?',
    text_zh: '你的目标月薪范围（税前）是多少？',
    text_de: 'Was ist dein Zielgehalt (monatlich, brutto)?',
    options: [
      {
        value: 'cny_15_25k',
        label: '¥15,000 – ¥25,000 / month',
        label_zh: '¥15,000 – ¥25,000 / 月',
        label_de: '¥15.000 – ¥25.000 / Monat',
        weights: { suzhou: 3, wuhan: 3, chengdu: 3 },
      },
      {
        value: 'cny_25_50k',
        label: '¥25,000 – ¥50,000 / month',
        label_zh: '¥25,000 – ¥50,000 / 月',
        label_de: '¥25.000 – ¥50.000 / Monat',
        weights: { shanghai: 3, shenzhen: 3, beijing: 3, hangzhou: 2 },
      },
      {
        value: 'eur_4_7k',
        label: '€4,000 – €7,000 / month',
        label_zh: '€4,000 – €7,000 / 月',
        label_de: '€4.000 – €7.000 / Monat',
        weights: { frankfurt: 3, hamburg: 3, berlin: 3, stuttgart: 2 },
      },
      {
        value: 'eur_7k_plus',
        label: '€7,000+ / month (senior / specialist)',
        label_zh: '€7,000以上 / 月（高级/专家岗）',
        label_de: '€7.000+ / Monat (Senior / Spezialist)',
        weights: { munich: 4, stuttgart: 3, frankfurt: 2 },
      },
    ],
  },
]
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/journey/questions-market.ts
git commit -m "feat: add Block 3 market/geography question bank (6 questions, trilingual)"
```

---

### Task 5: Block Scoring Engine

**Files:**
- Create: `src/lib/journey/scoring.ts`

- [ ] **Step 1: Create scoring engine**

```typescript
// src/lib/journey/scoring.ts
import type { MultiChoiceQuestion, BlockAnswer, BlockResult } from './types'

/**
 * Tally weighted answers into a BlockResult.
 * Each answer looks up the selected option's weights map and adds them
 * to a running scores object. Top 3 dimension IDs are returned sorted.
 */
export function scoreBlock(
  answers: BlockAnswer[],
  questions: MultiChoiceQuestion[]
): BlockResult {
  const scores: Record<string, number> = {}

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) continue
    const option = question.options.find((o) => o.value === answer.selectedValue)
    if (!option) continue
    for (const [dimensionId, delta] of Object.entries(option.weights)) {
      scores[dimensionId] = (scores[dimensionId] ?? 0) + delta
    }
  }

  const top3 = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => id)

  return { scores, top3, answers }
}
```

- [ ] **Step 2: Write unit test**

Create `src/lib/journey/__tests__/scoring.test.ts`:

```typescript
import { scoreBlock } from '../scoring'
import type { MultiChoiceQuestion, BlockAnswer } from '../types'

const questions: MultiChoiceQuestion[] = [
  {
    id: 'q1',
    dimension: 'industry',
    text: '',
    text_zh: '',
    text_de: '',
    options: [
      { value: 'a', label: '', label_zh: '', label_de: '', weights: { alpha: 3, beta: 1 } },
      { value: 'b', label: '', label_zh: '', label_de: '', weights: { beta: 4 } },
    ],
  },
  {
    id: 'q2',
    dimension: 'industry',
    text: '',
    text_zh: '',
    text_de: '',
    options: [
      { value: 'x', label: '', label_zh: '', label_de: '', weights: { alpha: 2, gamma: 5 } },
    ],
  },
]

test('accumulates weights across answers', () => {
  const answers: BlockAnswer[] = [
    { questionId: 'q1', selectedValue: 'a' },
    { questionId: 'q2', selectedValue: 'x' },
  ]
  const result = scoreBlock(answers, questions)
  expect(result.scores).toEqual({ alpha: 5, beta: 1, gamma: 5 })
  expect(result.top3).toHaveLength(3)
  expect(result.top3[0]).toMatch(/alpha|gamma/)
})

test('returns empty top3 when no answers', () => {
  const result = scoreBlock([], questions)
  expect(result.top3).toHaveLength(0)
  expect(result.scores).toEqual({})
})

test('ignores unknown questionId', () => {
  const answers: BlockAnswer[] = [{ questionId: 'nonexistent', selectedValue: 'a' }]
  const result = scoreBlock(answers, questions)
  expect(result.scores).toEqual({})
})
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/haiqing/WeChatProjects/miniprogram-2/webapp
npx jest src/lib/journey/__tests__/scoring.test.ts --no-coverage 2>&1 | tail -20
```

Expected: 3 PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/journey/scoring.ts src/lib/journey/__tests__/scoring.test.ts
git commit -m "feat: add block scoring engine with unit tests"
```

---

### Task 6: AI Router (EU/CN GDPR-aware)

**Files:**
- Create: `src/lib/journey/ai-router.ts`

EU users → Mistral (French company, GDPR DPA). CN users → DeepSeek. Raw resume text is **never** passed to AI narrative calls — only structured JSON fields.

- [ ] **Step 1: Create AI router**

```typescript
// src/lib/journey/ai-router.ts

export interface AIRouterConfig {
  provider: 'mistral' | 'deepseek'
  model: string
  baseUrl: string
  apiKeyEnv: string
}

/**
 * Detect EU locale from Accept-Language header value.
 * Returns true if the primary language tag is an EU country or 'de'.
 */
export function detectEU(acceptLanguage: string | null): boolean {
  if (!acceptLanguage) return false
  const EU_TAGS = ['de', 'fr', 'it', 'es', 'nl', 'pl', 'sv', 'da', 'fi', 'pt', 'cs', 'hu', 'ro', 'el']
  const primary = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
  return EU_TAGS.includes(primary)
}

/**
 * Return the AI provider config based on whether the request is from EU.
 * Call this server-side only — never expose API keys to the client.
 */
export function getAIConfig(isEU: boolean): AIRouterConfig {
  if (isEU) {
    return {
      provider: 'mistral',
      model: 'mistral-small-latest',
      baseUrl: 'https://api.mistral.ai/v1',
      apiKeyEnv: 'MISTRAL_API_KEY',
    }
  }
  return {
    provider: 'deepseek',
    model: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
  }
}
```

- [ ] **Step 2: Write unit test**

Create `src/lib/journey/__tests__/ai-router.test.ts`:

```typescript
import { detectEU, getAIConfig } from '../ai-router'

test('detectEU returns true for German locale', () => {
  expect(detectEU('de-DE,de;q=0.9,en;q=0.8')).toBe(true)
})

test('detectEU returns true for French locale', () => {
  expect(detectEU('fr-FR,fr;q=0.9')).toBe(true)
})

test('detectEU returns false for Chinese locale', () => {
  expect(detectEU('zh-CN,zh;q=0.9')).toBe(false)
})

test('detectEU returns false for null', () => {
  expect(detectEU(null)).toBe(false)
})

test('getAIConfig returns Mistral for EU', () => {
  const config = getAIConfig(true)
  expect(config.provider).toBe('mistral')
  expect(config.apiKeyEnv).toBe('MISTRAL_API_KEY')
})

test('getAIConfig returns DeepSeek for CN', () => {
  const config = getAIConfig(false)
  expect(config.provider).toBe('deepseek')
  expect(config.apiKeyEnv).toBe('DEEPSEEK_API_KEY')
})
```

- [ ] **Step 3: Run tests**

```bash
npx jest src/lib/journey/__tests__/ai-router.test.ts --no-coverage 2>&1 | tail -20
```

Expected: 6 PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/journey/ai-router.ts src/lib/journey/__tests__/ai-router.test.ts
git commit -m "feat: add EU/CN AI router with GDPR-aware Mistral routing"
```

---

### Task 7: Three Reveal Cards (Components)

**Files:**
- Create: `src/components/cards/CareerDNACard.tsx`
- Create: `src/components/cards/OpportunityCard.tsx`
- Create: `src/components/cards/LandingZoneCard.tsx`

Each card is a standalone React component receiving typed props. No data fetching inside the component — all data comes via props from the page.

- [ ] **Step 1: Create CareerDNACard**

```tsx
// src/components/cards/CareerDNACard.tsx
'use client'
import type { PersonalityReport } from '@/lib/personality/types'

interface Props {
  report: PersonalityReport
  lang?: 'en' | 'zh' | 'de'
}

const DIM_LABELS: Record<string, { en: string; zh: string; de: string }> = {
  R: { en: 'Realistic', zh: '实践型', de: 'Realistisch' },
  I: { en: 'Investigative', zh: '研究型', de: 'Investigativ' },
  A: { en: 'Artistic', zh: '艺术型', de: 'Künstlerisch' },
  S: { en: 'Social', zh: '社交型', de: 'Sozial' },
  E: { en: 'Enterprising', zh: '企业型', de: 'Unternehmerisch' },
  C: { en: 'Conventional', zh: '常规型', de: 'Konventionell' },
}

export function CareerDNACard({ report, lang = 'en' }: Props) {
  const archetype = report.archetype
  const profile = report.profile
  const maxScore = Math.max(...Object.values(profile))

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white shadow-2xl max-w-md mx-auto">
      <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">
        Career DNA
      </p>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-5xl">{archetype.emoji}</span>
        <div>
          <h2 className="text-2xl font-bold">
            {lang === 'zh' ? archetype.name_zh : lang === 'de' ? archetype.name_de : archetype.name}
          </h2>
          <p className="text-blue-200 text-sm">
            {lang === 'zh' ? archetype.tagline_zh : lang === 'de' ? archetype.tagline_de : archetype.tagline}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(profile).map(([dim, score]) => (
          <div key={dim} className="flex items-center gap-3">
            <span className="text-blue-200 text-xs w-24">
              {DIM_LABELS[dim]?.[lang] ?? dim}
            </span>
            <div className="flex-1 bg-blue-900/50 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${(score / maxScore) * 100}%` }}
              />
            </div>
            <span className="text-xs text-blue-200 w-8 text-right">{score}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-blue-500/30">
        <p className="text-sm text-blue-100">
          Holland Code: <span className="font-bold">{report.hollandCode}</span>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create OpportunityCard**

```tsx
// src/components/cards/OpportunityCard.tsx
'use client'

const INDUSTRY_LABELS: Record<string, { en: string; zh: string; de: string; emoji: string }> = {
  automotive: { en: 'Automotive', zh: '汽车', de: 'Automobil', emoji: '🚗' },
  electronics: { en: 'Electronics', zh: '电子', de: 'Elektronik', emoji: '⚡' },
  energy: { en: 'Clean Energy', zh: '清洁能源', de: 'Erneuerbare Energie', emoji: '🌱' },
  robotics: { en: 'Robotics', zh: '机器人', de: 'Robotik', emoji: '🤖' },
  medical_devices: { en: 'Medical Devices', zh: '医疗器械', de: 'Medizintechnik', emoji: '🏥' },
  aerospace: { en: 'Aerospace', zh: '航空航天', de: 'Luft- & Raumfahrt', emoji: '🚀' },
  manufacturing: { en: 'Manufacturing', zh: '制造业', de: 'Fertigung', emoji: '🏭' },
  software: { en: 'Software', zh: '软件', de: 'Software', emoji: '💻' },
  consulting: { en: 'Consulting', zh: '咨询', de: 'Beratung', emoji: '💼' },
  finance: { en: 'Finance', zh: '金融', de: 'Finanzen', emoji: '📈' },
}

interface Props {
  top3: string[]
  scores: Record<string, number>
  lang?: 'en' | 'zh' | 'de'
}

export function OpportunityCard({ top3, scores, lang = 'en' }: Props) {
  const maxScore = Math.max(...Object.values(scores), 1)

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-8 text-white shadow-2xl max-w-md mx-auto">
      <p className="text-emerald-100 text-sm font-semibold uppercase tracking-widest mb-2">
        Opportunity Map
      </p>
      <h2 className="text-2xl font-bold mb-1">
        {lang === 'zh' ? '你的最佳行业方向' : lang === 'de' ? 'Deine besten Branchen' : 'Your Best Industry Fit'}
      </h2>
      <p className="text-emerald-100 text-sm mb-6">
        {lang === 'zh' ? '基于你的目标和价值观' : lang === 'de' ? 'Basierend auf deinen Zielen' : 'Based on your goals & values'}
      </p>

      <div className="space-y-4">
        {top3.map((industryId, index) => {
          const meta = INDUSTRY_LABELS[industryId] ?? { en: industryId, zh: industryId, de: industryId, emoji: '🏢' }
          const score = scores[industryId] ?? 0
          return (
            <div key={industryId} className="flex items-center gap-4">
              <span className="text-3xl">{meta.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">
                    {index + 1}. {meta[lang]}
                  </span>
                  <span className="text-emerald-100 text-sm">{Math.round((score / maxScore) * 100)}%</span>
                </div>
                <div className="bg-emerald-900/40 rounded-full h-1.5">
                  <div
                    className="bg-white rounded-full h-1.5"
                    style={{ width: `${(score / maxScore) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create LandingZoneCard**

```tsx
// src/components/cards/LandingZoneCard.tsx
'use client'

const CITY_LABELS: Record<string, { en: string; zh: string; de: string; flag: string }> = {
  shanghai: { en: 'Shanghai', zh: '上海', de: 'Shanghai', flag: '🇨🇳' },
  shenzhen: { en: 'Shenzhen', zh: '深圳', de: 'Shenzhen', flag: '🇨🇳' },
  beijing: { en: 'Beijing', zh: '北京', de: 'Peking', flag: '🇨🇳' },
  suzhou: { en: 'Suzhou', zh: '苏州', de: 'Suzhou', flag: '🇨🇳' },
  chengdu: { en: 'Chengdu', zh: '成都', de: 'Chengdu', flag: '🇨🇳' },
  wuhan: { en: 'Wuhan', zh: '武汉', de: 'Wuhan', flag: '🇨🇳' },
  hangzhou: { en: 'Hangzhou', zh: '杭州', de: 'Hangzhou', flag: '🇨🇳' },
  munich: { en: 'Munich', zh: '慕尼黑', de: 'München', flag: '🇩🇪' },
  hamburg: { en: 'Hamburg', zh: '汉堡', de: 'Hamburg', flag: '🇩🇪' },
  frankfurt: { en: 'Frankfurt', zh: '法兰克福', de: 'Frankfurt', flag: '🇩🇪' },
  stuttgart: { en: 'Stuttgart', zh: '斯图加特', de: 'Stuttgart', flag: '🇩🇪' },
  berlin: { en: 'Berlin', zh: '柏林', de: 'Berlin', flag: '🇩🇪' },
}

interface Props {
  top3: string[]
  scores: Record<string, number>
  lang?: 'en' | 'zh' | 'de'
}

export function LandingZoneCard({ top3, scores, lang = 'en' }: Props) {
  const maxScore = Math.max(...Object.values(scores), 1)

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 p-8 text-white shadow-2xl max-w-md mx-auto">
      <p className="text-violet-200 text-sm font-semibold uppercase tracking-widest mb-2">
        Landing Zone
      </p>
      <h2 className="text-2xl font-bold mb-1">
        {lang === 'zh' ? '你的最佳目标城市' : lang === 'de' ? 'Deine beste Zielstadt' : 'Your Best Target Cities'}
      </h2>
      <p className="text-violet-200 text-sm mb-6">
        {lang === 'zh' ? '基于你的语言、薪资和流动性偏好' : lang === 'de' ? 'Basierend auf Sprache, Gehalt & Mobilität' : 'Based on language, salary & mobility'}
      </p>

      <div className="space-y-4">
        {top3.map((cityId, index) => {
          const meta = CITY_LABELS[cityId] ?? { en: cityId, zh: cityId, de: cityId, flag: '🏙️' }
          const score = scores[cityId] ?? 0
          return (
            <div key={cityId} className="flex items-center gap-4">
              <span className="text-3xl">{meta.flag}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">
                    {index + 1}. {meta[lang]}
                  </span>
                  <span className="text-violet-200 text-sm">{Math.round((score / maxScore) * 100)}%</span>
                </div>
                <div className="bg-violet-900/40 rounded-full h-1.5">
                  <div
                    className="bg-white rounded-full h-1.5"
                    style={{ width: `${(score / maxScore) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/cards/
git commit -m "feat: add CareerDNACard, OpportunityCard, LandingZoneCard reveal components"
```

---

### Task 8: Journey Entry Page + Block 1 Wrapper

**Files:**
- Create: `src/app/journey/page.tsx`
- Create: `src/app/journey/block1/page.tsx`

The entry page reads `resumeProfile` from `sessionStorage` (set by the homepage after analysis), seeds the `JourneyState`, and redirects to block 1.

- [ ] **Step 1: Create journey entry page**

```tsx
// src/app/journey/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateJourneyState } from '@/lib/journey/state'
import type { ResumeProfile } from '@/lib/journey/types'

export default function JourneyPage() {
  const router = useRouter()

  useEffect(() => {
    const raw = sessionStorage.getItem('careerlens_resume_profile')
    const profile: ResumeProfile | null = raw ? (JSON.parse(raw) as ResumeProfile) : null
    updateJourneyState({ resumeProfile: profile, startedAt: new Date().toISOString() })
    router.replace('/journey/block1')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-gray-400 text-sm">Starting your journey…</div>
    </div>
  )
}
```

- [ ] **Step 2: Create block1 wrapper page**

```tsx
// src/app/journey/block1/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Block1Page() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/assess/personality?journeyMode=true')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-gray-400 text-sm">Loading Block 1…</div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add src/app/journey/page.tsx src/app/journey/block1/page.tsx
git commit -m "feat: add journey entry page and block1 wrapper"
```

---

### Task 9: Patch Personality Page for Journey Mode

**Files:**
- Modify: `src/app/assess/personality/page.tsx`

- [ ] **Step 1: Read the file**

Use the Read tool on `src/app/assess/personality/page.tsx` to find:
- Where `generateReport()` result is produced and used
- Where navigation happens on completion and on "back"

- [ ] **Step 2: Add imports at top of file**

```typescript
import { useSearchParams } from 'next/navigation'
import { updateJourneyState } from '@/lib/journey/state'
```

- [ ] **Step 3: Inside the component, add hook call after existing hooks**

```typescript
const searchParams = useSearchParams()
const journeyMode = searchParams.get('journeyMode') === 'true'
```

- [ ] **Step 4: In the completion handler where report is generated, add journey branch**

Find the block that calls `generateReport(answers)` or similar and produces a `report` object. Immediately after, add:

```typescript
if (journeyMode) {
  updateJourneyState({ block1: report })
  router.push('/journey/card1')
  return
}
```

- [ ] **Step 5: In the back/cancel button handler, add journey branch**

```typescript
// Replace whatever back navigation exists with:
if (journeyMode) {
  router.push('/journey')
} else {
  router.push('/assess')
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 7: Commit**

```bash
git add src/app/assess/personality/page.tsx
git commit -m "feat: patch personality page to support journeyMode routing"
```

---

### Task 10: Card 1 Reveal Page (Career DNA)

**Files:**
- Create: `src/app/journey/card1/page.tsx`

- [ ] **Step 1: Create card1 page**

```tsx
// src/app/journey/card1/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadJourneyState } from '@/lib/journey/state'
import { CareerDNACard } from '@/components/cards/CareerDNACard'
import type { PersonalityReport } from '@/lib/personality/types'

export default function Card1Page() {
  const router = useRouter()
  const [report, setReport] = useState<PersonalityReport | null>(null)

  useEffect(() => {
    const state = loadJourneyState()
    if (!state.block1) {
      router.replace('/journey')
      return
    }
    setReport(state.block1)
  }, [router])

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading your Career DNA…</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-16 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="text-center mb-4">
        <p className="text-slate-400 text-sm uppercase tracking-widest">Block 1 Complete</p>
        <h1 className="text-white text-3xl font-bold mt-2">Your Career DNA</h1>
        <p className="text-slate-300 mt-2 max-w-sm">
          Here is how your personality maps to the engineering career landscape.
        </p>
      </div>

      <CareerDNACard report={report} lang="en" />

      <button
        onClick={() => router.push('/journey/block2')}
        className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
      >
        Continue → Opportunity Map
      </button>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles + commit**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
git add src/app/journey/card1/page.tsx
git commit -m "feat: add career DNA card reveal page (card1)"
```

---

### Task 11: Block 2 Quiz Page (8 Goals Questions)

**Files:**
- Create: `src/app/journey/block2/page.tsx`

One question per screen. Progress bar at top. On last question, score and save, then redirect to `/journey/card2`.

- [ ] **Step 1: Create block2 quiz page**

```tsx
// src/app/journey/block2/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GOALS_QUESTIONS } from '@/lib/journey/questions-goals'
import { scoreBlock } from '@/lib/journey/scoring'
import { updateJourneyState } from '@/lib/journey/state'
import type { BlockAnswer } from '@/lib/journey/types'

export default function Block2Page() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<BlockAnswer[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  const question = GOALS_QUESTIONS[currentIndex]
  const isLast = currentIndex === GOALS_QUESTIONS.length - 1
  const progress = ((currentIndex + 1) / GOALS_QUESTIONS.length) * 100

  function handleNext() {
    if (!selected) return
    const newAnswers: BlockAnswer[] = [...answers, { questionId: question.id, selectedValue: selected }]
    setAnswers(newAnswers)
    setSelected(null)

    if (isLast) {
      const result = scoreBlock(newAnswers, GOALS_QUESTIONS)
      updateJourneyState({ block2: result })
      router.push('/journey/card2')
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between text-slate-400 text-xs mb-2">
          <span>Block 2 — Career Goals</span>
          <span>{currentIndex + 1} / {GOALS_QUESTIONS.length}</span>
        </div>
        <div className="bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-emerald-500 rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg">
        <h2 className="text-white text-xl font-semibold mb-6 leading-snug">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                selected === option.value
                  ? 'border-emerald-500 bg-emerald-500/20 text-white'
                  : 'border-slate-600 bg-slate-800/60 text-slate-200 hover:border-slate-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!selected}
          className="mt-8 w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {isLast ? 'See My Opportunity Map →' : 'Next →'}
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles + commit**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
git add src/app/journey/block2/page.tsx
git commit -m "feat: add Block 2 goals quiz page (8 questions)"
```

---

### Task 12: Card 2 Reveal Page (Opportunity Map)

**Files:**
- Create: `src/app/journey/card2/page.tsx`

- [ ] **Step 1: Create card2 page**

```tsx
// src/app/journey/card2/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadJourneyState } from '@/lib/journey/state'
import { OpportunityCard } from '@/components/cards/OpportunityCard'
import type { BlockResult } from '@/lib/journey/types'

export default function Card2Page() {
  const router = useRouter()
  const [block2, setBlock2] = useState<BlockResult | null>(null)

  useEffect(() => {
    const state = loadJourneyState()
    if (!state.block2) {
      router.replace('/journey/block2')
      return
    }
    setBlock2(state.block2)
  }, [router])

  if (!block2) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading your Opportunity Map…</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-16 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="text-center mb-4">
        <p className="text-slate-400 text-sm uppercase tracking-widest">Block 2 Complete</p>
        <h1 className="text-white text-3xl font-bold mt-2">Your Opportunity Map</h1>
        <p className="text-slate-300 mt-2 max-w-sm">
          The industries where your goals and values create the strongest alignment.
        </p>
      </div>

      <OpportunityCard top3={block2.top3} scores={block2.scores} lang="en" />

      <button
        onClick={() => router.push('/journey/block3')}
        className="mt-4 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
      >
        Continue → Landing Zone
      </button>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles + commit**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
git add src/app/journey/card2/page.tsx
git commit -m "feat: add Opportunity Map card reveal page (card2)"
```

---

### Task 13: Block 3 Quiz Page (6 Market Questions)

**Files:**
- Create: `src/app/journey/block3/page.tsx`

- [ ] **Step 1: Create block3 quiz page**

```tsx
// src/app/journey/block3/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MARKET_QUESTIONS } from '@/lib/journey/questions-market'
import { scoreBlock } from '@/lib/journey/scoring'
import { updateJourneyState } from '@/lib/journey/state'
import type { BlockAnswer } from '@/lib/journey/types'

export default function Block3Page() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<BlockAnswer[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  const question = MARKET_QUESTIONS[currentIndex]
  const isLast = currentIndex === MARKET_QUESTIONS.length - 1
  const progress = ((currentIndex + 1) / MARKET_QUESTIONS.length) * 100

  function handleNext() {
    if (!selected) return
    const newAnswers: BlockAnswer[] = [...answers, { questionId: question.id, selectedValue: selected }]
    setAnswers(newAnswers)
    setSelected(null)

    if (isLast) {
      const result = scoreBlock(newAnswers, MARKET_QUESTIONS)
      updateJourneyState({ block3: result })
      router.push('/journey/card3')
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between text-slate-400 text-xs mb-2">
          <span>Block 3 — Market & Location</span>
          <span>{currentIndex + 1} / {MARKET_QUESTIONS.length}</span>
        </div>
        <div className="bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-violet-500 rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg">
        <h2 className="text-white text-xl font-semibold mb-6 leading-snug">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                selected === option.value
                  ? 'border-violet-500 bg-violet-500/20 text-white'
                  : 'border-slate-600 bg-slate-800/60 text-slate-200 hover:border-slate-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!selected}
          className="mt-8 w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {isLast ? 'See My Landing Zone →' : 'Next →'}
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles + commit**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
git add src/app/journey/block3/page.tsx
git commit -m "feat: add Block 3 market quiz page (6 questions)"
```

---

### Task 14: Card 3 Reveal Page (Landing Zone)

**Files:**
- Create: `src/app/journey/card3/page.tsx`

Final card. CTA goes to `/plan`. Secondary CTA goes to `/market`.

- [ ] **Step 1: Create card3 page**

```tsx
// src/app/journey/card3/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadJourneyState } from '@/lib/journey/state'
import { LandingZoneCard } from '@/components/cards/LandingZoneCard'
import type { BlockResult } from '@/lib/journey/types'

export default function Card3Page() {
  const router = useRouter()
  const [block3, setBlock3] = useState<BlockResult | null>(null)

  useEffect(() => {
    const state = loadJourneyState()
    if (!state.block3) {
      router.replace('/journey/block3')
      return
    }
    setBlock3(state.block3)
  }, [router])

  if (!block3) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading your Landing Zone…</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-16 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="text-center mb-4">
        <p className="text-slate-400 text-sm uppercase tracking-widest">Block 3 Complete</p>
        <h1 className="text-white text-3xl font-bold mt-2">Your Landing Zone</h1>
        <p className="text-slate-300 mt-2 max-w-sm">
          The cities that best match your language, salary, and mobility profile.
        </p>
      </div>

      <LandingZoneCard top3={block3.top3} scores={block3.scores} lang="en" />

      <div className="mt-4 flex flex-col items-center gap-3">
        <button
          onClick={() => router.push('/plan')}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
        >
          Build My Action Plan →
        </button>
        <button
          onClick={() => router.push('/market')}
          className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          Explore city salary data first
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles + commit**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
git add src/app/journey/card3/page.tsx
git commit -m "feat: add Landing Zone card reveal page (card3)"
```

---

### Task 15: AI Narrative API Endpoint (GDPR-safe)

**Files:**
- Create: `src/app/api/journey-narrative/route.ts`
- Read first: `src/app/api/analyze/route.ts` (reference for API call pattern)

Receives structured JSON only. Never receives raw resume text. Routes EU→Mistral, CN→DeepSeek. Returns empty string on any failure (AI is optional).

- [ ] **Step 1: Create the API route**

```typescript
// src/app/api/journey-narrative/route.ts
import { NextResponse } from 'next/server'
import { detectEU, getAIConfig } from '@/lib/journey/ai-router'

interface NarrativeRequest {
  card: 'career-dna' | 'opportunity' | 'landing-zone'
  archetypeId?: string
  archetypeName?: string
  hollandCode?: string
  topIndustries?: string[]
  topCities?: string[]
  functionArea?: string
  level?: string
}

const SYSTEM_PROMPT = `You are CareerLens, a career intelligence assistant.
Write one short paragraph (2-3 sentences) congratulating the user on completing
a quiz block and reflecting on what their result reveals.
Be warm, specific, and professional. Never mention AI or algorithms.`

function buildUserPrompt(req: NarrativeRequest): string {
  if (req.card === 'career-dna') {
    return `The user completed the Career DNA block.
Their archetype is "${req.archetypeName}" (${req.archetypeId}), Holland Code: ${req.hollandCode}.
Write a 2-sentence insight about what this archetype means for an engineer career.`
  }
  if (req.card === 'opportunity') {
    return `The user completed the Opportunity Map block.
Their top 3 industry matches are: ${req.topIndustries?.join(', ')}.
Their background is ${req.level} ${req.functionArea}.
Write 2 sentences connecting their experience to these industries.`
  }
  return `The user completed the Landing Zone block.
Their top 3 target cities are: ${req.topCities?.join(', ')}.
Write 2 sentences about what these city choices reveal about their career ambitions.`
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NarrativeRequest
    const acceptLanguage = request.headers.get('accept-language')
    const isEU = detectEU(acceptLanguage)
    const aiConfig = getAIConfig(isEU)
    const apiKey = process.env[aiConfig.apiKeyEnv]

    if (!apiKey) {
      return NextResponse.json({ narrative: '' })
    }

    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(body) },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ narrative: '' })
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>
    }
    const narrative = data.choices[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ narrative })
  } catch {
    return NextResponse.json({ narrative: '' })
  }
}
```

- [ ] **Step 2: Add MISTRAL_API_KEY to .env.local**

```bash
# Check .env.local exists
ls /Users/haiqing/WeChatProjects/miniprogram-2/webapp/.env.local
# If it exists, append:
echo 'MISTRAL_API_KEY=your_mistral_key_here' >> .env.local
```

- [ ] **Step 3: Verify TypeScript compiles + commit**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
git add src/app/api/journey-narrative/route.ts
git commit -m "feat: add GDPR-aware AI narrative endpoint (Mistral EU / DeepSeek CN)"
```

---

### Task 16: Homepage Redirect After Resume Analysis

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Read `src/app/page.tsx`** to find the resume analysis success handler.

- [ ] **Step 2: Ensure `useRouter` is imported and instantiated**

```typescript
import { useRouter } from 'next/navigation'
// inside component:
const router = useRouter()
```

- [ ] **Step 3: In the fetch success handler, add sessionStorage save and redirect**

Find where `data.profile` is received (the `setProfile(data.profile)` call). Add after it:

```typescript
// Save structured profile for the journey (raw resume text is NOT saved — GDPR)
sessionStorage.setItem('careerlens_resume_profile', JSON.stringify(data.profile))
router.push('/journey')
```

- [ ] **Step 4: Verify TypeScript compiles + commit**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
git add src/app/page.tsx
git commit -m "feat: redirect homepage to /journey after resume analysis"
```

---

### Task 17: Smoke Test — Full Journey Flow

- [ ] **Step 1: Start dev server**

```bash
cd /Users/haiqing/WeChatProjects/miniprogram-2/webapp
npm run dev
```

- [ ] **Step 2: Verify all journey routes return 200**

```bash
for path in /journey /journey/block1 /journey/block2 /journey/block3 /journey/card1 /journey/card2 /journey/card3; do
  echo "$path: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$path)"
done
```

Expected: all 200.

- [ ] **Step 3: Manual golden path**

1. Open `http://localhost:3000`
2. Paste any engineer resume text → click Analyze
3. Verify redirect to `/assess/personality?journeyMode=true`
4. Complete all 14 sliders → verify redirect to `/journey/card1`
5. Card 1: verify archetype name, emoji, RIASEC bars render → click Continue
6. Block 2: complete all 8 questions one by one → verify redirect to `/journey/card2`
7. Card 2: verify top 3 industries with progress bars → click Continue
8. Block 3: complete all 6 questions → verify redirect to `/journey/card3`
9. Card 3: verify top 3 cities with flags → click "Build My Action Plan"
10. Verify redirect to `/plan`

- [ ] **Step 4: Verify localStorage after completion**

Open DevTools → Application → Local Storage → `careerlens_journey_v1`.
Expected keys present: `resumeProfile`, `block1.archetype.id`, `block2.top3` (length 3), `block3.top3` (length 3).

- [ ] **Step 5: Production build check**

```bash
npm run build 2>&1 | tail -30
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: guided journey smoke test passed"
```

---

## Self-Review

### Spec Coverage

| Feature | Task(s) |
|---------|---------|
| Resume paste → journey entry | Task 16 |
| Block 1: RIASEC personality quiz (14 scenarios) | Task 9 (patches existing page) |
| Career DNA card reveal (blue gradient) | Tasks 7, 10 |
| Block 2: Goals quiz (8 questions, trilingual) | Tasks 3, 11 |
| Opportunity Map card reveal (emerald gradient) | Tasks 7, 12 |
| Block 3: Market quiz (6 questions, trilingual) | Tasks 4, 13 |
| Landing Zone card reveal (violet gradient) | Tasks 7, 14 |
| Journey state in localStorage | Tasks 1, 2 |
| GDPR-aware AI narrative (Mistral EU / DeepSeek CN) | Tasks 6, 15 |
| No raw PII in AI calls | Task 15 — only structured JSON |
| Trilingual EN/ZH/DE throughout | Tasks 3, 4, 7 |
| Final CTA to existing `/plan` page | Task 14 |

### Type Consistency

- `PersonalityReport` imported from `@/lib/personality/types` — used in `JourneyState.block1` (Task 1), `CareerDNACard` props (Task 7), card1 page (Task 10). ✓
- `BlockResult` used for both `block2` and `block3` in `JourneyState`. `OpportunityCard` and `LandingZoneCard` receive `top3: string[]` + `scores: Record<string, number>` — derived directly from `BlockResult`. ✓
- Industry IDs in `GOALS_QUESTIONS` weights use underscore: `medical_devices`. `INDUSTRY_LABELS` in `OpportunityCard` also uses `medical_devices`. ✓
- City IDs in `MARKET_QUESTIONS` weights (`munich`, `frankfurt`, etc.) match `CITY_LABELS` in `LandingZoneCard` and city IDs in `market/page.tsx`. ✓

### No-Placeholder Check

All tasks contain complete code, exact commands, and expected output. No TBD, TODO, or "implement as appropriate" phrases. ✓
