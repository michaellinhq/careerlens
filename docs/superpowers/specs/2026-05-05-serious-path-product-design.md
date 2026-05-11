# Serious Path Product Design

## Decision

CareerLens / 转行宝 will move first as a serious mobile-first path product. The game concept remains a second-stage expression layer that reuses the same data graph, but the first deliverable is not a game.

The serious product must answer two different starting questions:

- Student: "What can my major and courses become?"
- Professional: "How can my existing experience be re-priced into new roles?"

Both flows converge on the same core chain:

```text
Skills -> evidence -> roles -> industries -> action list
```

The product therefore has two entry chains:

```text
Student:
major -> courses -> skills -> project evidence -> roles -> industries -> action list

Professional:
current role or work tasks -> transferable skills -> performance evidence -> target roles -> industries -> action list
```

## Goals

- Replace resume-first onboarding with choice-first onboarding.
- Keep resume upload and paste as an optional acceleration path, not the main path.
- Help students understand how majors and courses connect to real roles.
- Help professionals decompose messy work experience into transferable skills and usable achievement evidence.
- Show market reality through competition, barrier, salary, demand, geography, and time-to-threshold signals.
- Produce short, concrete action lists instead of long reports.
- Store enough neutral label metadata now so a future game layer can translate the same graph into "major as faction, course as method, skill as equipment, project as quest" without changing product logic.

## Non-Goals

- Do not build the game mini-product in this phase.
- Do not build direct LinkedIn or job-platform application submission.
- Do not promise admission, job offers, salary outcomes, or guaranteed career transitions.
- Do not cover every major or every industry in the first release.
- Do not make AI a required dependency. The rules-first path must work without server keys.

## Audience Modes

### Student Mode

Student Mode covers high-school students, university students, and early graduates who do not have a strong resume yet.

Inputs:

- identity: high-school student, university student, early graduate
- major family or intended major family
- year or stage
- courses already taken or planned
- subject strengths and interest tags
- optional target role

Outputs:

- path map from major to industry
- course-to-skill translation
- project evidence suggestions
- role cards with salary, skills, suitable majors, projects, and market heat
- short action list for the next semester or next 30 days

### Professional Mode

Professional Mode covers experienced workers, career switchers, and "带艺投师" users who may or may not have a resume.

Inputs:

- current role and industry
- work-task selections
- tools, methods, standards, systems, and collaboration contexts
- achievements or metrics when available
- desired change: salary, industry switch, overseas path, stability, lower burnout, expert track, entrepreneurship
- optional resume text or uploaded file

Outputs:

- task decomposition
- transferable skill set
- achievement evidence drafts
- adjacent target roles
- gap skills and evidence projects
- industry landing map
- action list for resume, project, search keywords, and interview stories

## Information Architecture

The first mobile MVP has four core screens, matching the shared mockup direction:

1. Entry Selection
   - "我是学生"
   - "我是职场人"
   - "看岗位要什么"
   - "已有简历"

2. Path Map
   - Student chain: major, course, skill, project evidence, role, industry
   - Professional chain: current role, work tasks, transferable skills, performance evidence, target role, industry
   - Each step can expand into a plain-language explanation.

3. Role Card
   - role title
   - salary range for CN and DE where data exists
   - required skills
   - suitable majors or transferable backgrounds
   - evidence projects or achievement examples
   - market heat and risk tags

4. Action List
   - Student action list: courses, projects, internship keywords
   - Professional action list: resume bullets, gap project, adjacent roles, search keywords, interview story prompts

Bottom navigation remains simple:

- Path
- Explore
- Saved
- Me

## Screen-Level Product Contract

The new mobile flow must not flatten the current high-value outputs. It should repackage them as progressively disclosed decision modules. The path product is simple at the surface, but each screen exposes deeper evidence when the user needs it.

### Screen 1: Entry Selection

Purpose:

- Let users start without a resume.
- Clarify that the product supports both students and experienced professionals.
- Keep resume input as a shortcut instead of the dominant action.

Visible modules:

- Four entry cards: student, professional, role lookup, resume shortcut.
- One compact promise line: "选择起点，生成路径地图、岗位卡和行动清单".
- One trust footer: "规则优先，AI 可选；结果用于规划，不保证录取或 offer".

Hidden/deferred modules:

- No salary chart.
- No four-quadrant chart.
- No GitHub or training links.

Reason:

The first screen is about reducing friction, not proving all data depth.

### Screen 2: Path Map

Purpose:

- Show the user's route from starting point to role and industry.
- Make the student and professional flows feel like one coherent product.
- Introduce market reality without overwhelming the user.

Visible modules:

- Main chain:
  - Student: major, course, skill, project evidence, role, industry.
  - Professional: current role, work task, transferable skill, performance evidence, target role, industry.
- Per-step explanation chips:
  - why this step matters
  - what it proves
  - what it unlocks
- Compact "market snapshot" below the chain:
  - recommended role score
  - competition label
  - barrier label
  - time-to-threshold estimate

Integrated existing value:

- Four-quadrant logic from `ArbitrageMap` is used here as a compressed market tag, not as the full scatter plot.
- The path map should show labels such as "黄金赛道", "竞争较强", "潜力蓝海", or neutral serious equivalents based on the same salary/tension quadrant calculation.
- The full scatter chart remains available through "查看市场四象限".

Mobile layout:

- One vertical timeline.
- Each row is a fixed-height card with icon, step label, selected value, and one-sentence explanation.
- The market snapshot is a single compact card under the chain.

### Screen 3: Role Card

Purpose:

- Give the user a serious decision card for one target role.
- Combine salary, market position, skill gap, and proof requirements.

Visible modules:

- Role title and function area.
- CN and DE salary chips where available.
- Opportunity score.
- Required skills.
- Suitable majors or transferable backgrounds.
- Evidence projects or achievement examples.
- Market heat and risk labels.

Integrated existing value:

- `SalaryDistribution` appears inside a collapsible "薪资分位" section:
  - CN row when China salary data exists.
  - DE row when Germany salary data exists.
  - US row later if BLS percentile data is available.
  - For professionals, current salary can appear as the orange "you are here" marker.
- `ArbitrageMap` contributes the role's quadrant and demand tension:
  - role card shows a compact "市场位置" block.
  - deep view opens the full four-quadrant map and highlights the selected role.
- Existing role breakdown dimensions remain:
  - salary
  - competition
  - growth
  - barrier
  - AI resilience
  - demand growth
  - remote

Mobile layout:

- Top: role identity and salary chips.
- Middle: "Why this role appears" evidence block.
- Middle: required skill tags split into matched and missing.
- Bottom: market position, salary percentile, and proof modules as accordion sections.

### Screen 4: Action List

Purpose:

- Convert the role card into concrete next actions.
- Make the output short enough to act on immediately.

Visible modules:

- 3-5 action items.
- Each item has effort estimate, purpose, and output artifact.
- Student actions:
  - choose one course
  - do one evidence project
  - search internship keywords
  - prepare one portfolio artifact
- Professional actions:
  - rewrite one resume bullet
  - build or document one evidence project
  - search adjacent role keywords
  - prepare one interview story

Integrated existing value:

- `toolmap` entries are used inside action items:
  - tools
  - training providers
  - GitHub validation path
  - capstone project
- GitHub path is not shown as a generic list. It is tied to a missing skill and action item:
  - "补 PLC" -> repo/training/capstone path.
  - "补 Power BI / SQL" -> dashboard project and learning resources.
- Capstone project becomes the "evidence task" behind the action.

Mobile layout:

- Checklist cards.
- Each card has a primary action and an expandable "怎么证明" section.
- The "怎么证明" section can show:
  - deliverables
  - recommended tool
  - GitHub repo path
  - resume bullet pattern

### Deep-Dive Overlays

The MVP keeps the four-screen flow simple, but three deep-dive overlays preserve existing product depth:

1. Market Deep Dive
   - full `ArbitrageMap`
   - selected role highlighted
   - quadrant distribution
   - explanation of salary vs demand tension

2. Salary Deep Dive
   - `SalaryDistribution`
   - CN/DE/US rows where available
   - current salary marker for professionals when provided
   - source and last-updated label

3. Skill Proof Deep Dive
   - `toolmap` entry
   - tools
   - training providers
   - GitHub path
   - capstone
   - employer-proof explanation

These overlays are optional. The user can complete the core path without opening them.

## Core Domain Model

### Path Catalog

The MVP catalog is a local TypeScript data graph. It should start small and be easy to audit.

Initial scope:

- major families: mechanical, automation, electronics, computer-data, energy
- professional task families: quality, production, process, supplier, project, data, automation, customer, maintenance, audit
- skills: 30-50 reusable skill entries
- evidence templates: 25-40 project or achievement templates
- roles: reuse existing CN and DE role datasets where possible
- industries: reuse current `career-map` and job industry fields

### Labels

Every catalog entity supports serious labels now and game labels later.

```text
serious label: 自动化类
game label: 自动化宗
```

The serious UI uses only serious labels. The game labels are data compatibility fields and are not displayed in the serious MVP.

### Evidence

Evidence is the bridge between learning and hiring.

For students, evidence is usually:

- course project
- capstone project
- competition work
- lab work
- GitHub or portfolio artifact
- internship task

For professionals, evidence is usually:

- measurable improvement
- cross-functional project
- customer or supplier case
- process improvement
- cost reduction
- quality issue closure
- dashboard or reporting system
- standard, audit, or compliance work

Evidence entries must include:

- what it proves
- which skills it supports
- which role it helps unlock
- suggested deliverables
- resume bullet pattern
- confidence level based on user inputs

### Market Signals

Market signals should reuse existing job data and visualization logic.

For every role signal, store or derive:

- opportunity score
- salary display
- salary percentile rows when available
- demand tension
- quadrant key
- quadrant label
- competition label
- barrier label
- AI resilience label
- source labels

The four-quadrant model remains a high-value output, but it moves from "large default page section" to "market context behind a selected path".

### Skill Proof Links

Skill proof data should reuse `src/lib/toolmap`.

For each missing or bridge skill, derive:

- matching `IndustryToolMapEntry`
- recommended tools
- training providers
- GitHub path
- capstone project
- employer-proof explanation

The action list should prefer one strong proof path per skill instead of showing every available resource.

## Professional Experience Decomposition

Professional Mode should not ask "What skills do you have?" first. It should ask about work tasks.

Example task questions:

- Which problems do you often solve?
- Which teams or external parties do you coordinate with?
- Which metrics have you improved?
- Which tools, systems, standards, or methods do you use?
- Which kind of work gives you leverage: shop-floor problem solving, data analysis, supplier/customer coordination, process design, project delivery, or technical troubleshooting?

Mapping pattern:

```text
selected task -> inferred skill -> evidence draft -> adjacent roles -> gap skills -> action list
```

Example:

```text
Task:
handled customer complaints, led 8D, coordinated production and suppliers, tracked defect rate

Skills:
root cause analysis, 8D, cross-functional coordination, supplier quality, process improvement

Evidence:
led customer complaint 8D closure by coordinating production, process, and supplier teams to identify root cause and corrective actions

Adjacent roles:
quality engineer, supplier quality engineer, project quality engineer, quality data analyst, manufacturing consultant

Gap for quality data analyst:
SQL, Power BI, SPC dashboard, Python basics
```

## Scoring

The scoring layer should be transparent and explainable.

### Student Fit

Student fit combines:

- major relevance
- course coverage
- skill coverage
- project availability
- entry barrier
- market opportunity

### Professional Fit

Professional fit combines:

- experience inheritance rate
- transferable skill overlap
- evidence strength
- gap size
- income rollback risk
- market opportunity
- time-to-threshold

### Market Reality

Every role card should expose market reality without using shame-based language.

Signals:

- opportunity score
- competition intensity
- entry barrier
- demand growth
- AI exposure or resilience
- salary range
- geographic concentration
- time-to-threshold

Plain-language tags:

- high competition
- hard entry
- fast-growth niche
- stable but slower
- good adjacent path
- evidence-heavy

Game terms such as "红海杀场" can be stored as game labels, but the serious MVP should display neutral labels like "竞争较强".

## AI Policy

The serious MVP remains rules-first.

AI can enhance:

- resume parsing
- experience summarization
- achievement bullet rewriting
- follow-up question generation

AI must not be required for:

- path generation
- role matching
- action list creation
- catalog browsing

When AI is unavailable, structured questions and local mappings must still produce a useful path.

## Trust and Safety

The product must include clear decision boundaries:

- The result is planning guidance, not a guarantee.
- Salary ranges and market signals need source labels.
- Competition and risk labels must be explanatory, not insulting.
- User experience should avoid ranking people as weak or failed.
- For minors, the product should encourage discussion with family, teachers, and school advisors.
- No direct job application automation in the first release.

## Game Compatibility

The future game layer will reuse the same graph:

```text
major -> faction
course -> method
skill -> equipment
project evidence -> quest
role -> realm
industry -> world force
market risk -> battlefield condition
```

The serious MVP should support game compatibility through data fields only:

- `gameLabel`
- `gameCategory`
- `gameHint`

No game routes, game animations, game scoring UI, or share cards are part of this implementation phase.

## Success Metrics

Primary product metrics:

- percent of users who reach a role card without pasting a resume
- percent of users who generate an action list
- percent of professionals who select at least three work tasks
- percent of users who save a role
- percent of users who open a serious explanation for a skill or evidence item

Qualitative validation:

- students can explain what their major can become
- professionals can identify at least three transferable skills
- users say the action list feels concrete enough to act on
- the product feels serious enough for parents, teachers, and working adults

## MVP Acceptance Criteria

- The homepage no longer makes resume paste the dominant first action.
- A student can choose a major family and reach a path map, role card, and action list.
- A professional can answer structured experience questions and reach a path map, role card, and action list.
- Resume input remains available as an optional shortcut.
- The path map uses the same visual structure for both student and professional flows.
- Role cards reuse existing salary, skill, industry, and market data where available.
- The implementation keeps the game layer out of the UI while preserving future game label fields in data.
