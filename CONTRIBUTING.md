# Contributing to CareerLens

Thank you for your interest in improving CareerLens! This project thrives on domain expertise from engineers who know their industries.

## Ways to Contribute

### 1. Add or Update Career Roles (Easiest)

Career roles live in `src/lib/career-map/<industry>.ts`. Each role follows this structure:

```typescript
{
  id: 'auto-battery-engineer',          // unique kebab-case ID
  title: 'Battery Systems Engineer',     // English title
  title_zh: '电池系统工程师',              // Chinese title
  title_de: 'Batteriesystemingenieur',   // German title
  soc_code: '17-2199.01',               // O*NET SOC code (look up at onetonline.org)
  function_area: 'EV Powertrain',
  function_area_zh: '新能源动力',
  core_skills: ['Battery/BMS', 'Thermal Management', 'Python', 'MATLAB/Simulink'],
  growth_outlook: 'high',               // 'high' | 'medium' | 'low'
  ai_risk: 'low',                       // 'high' | 'medium' | 'low'
  levels: [
    {
      level: 'junior',
      level_zh: '初级电池工程师',
      level_de: 'Junior Batterieingenieur',
      years_experience: '0-2',
      salary_cn: { low: 12, mid: 16, high: 22 },   // ¥10K/month
      salary_de: { low: 48, mid: 56, high: 65 },    // €K/year
      key_skills: ['Cell Testing', 'Data Logging'],
    },
    // ... senior, lead, manager, director levels
  ],
}
```

**How to submit**: Fork → edit the industry file → open a PR with your source for salary data.

### 2. Add Tool Map Entries (Medium)

Tool maps live in `src/lib/toolmap/<industry>.ts`. Each entry maps a skill to concrete learning resources:

```typescript
{
  id: 'auto-python',
  skill: 'Python',
  skill_zh: 'Python',
  industry: 'automotive',
  industry_context: 'In automotive, Python is used for CAN bus data collection, ECU test automation, and ADAS algorithm prototyping.',
  industry_context_zh: '在汽车行业，Python用于CAN总线数据采集、ECU测试自动化和ADAS算法原型开发。',
  tools: [
    {
      name: 'python-can',
      name_zh: 'python-can',
      vendor: 'Open Source',
      tier: 'essential',           // 'essential' | 'recommended' | 'emerging'
      free_tier: true,
      url: 'https://github.com/hardbyte/python-can',
    },
  ],
  training: [
    {
      name: 'Vector Academy: Python for Automotive',
      name_zh: 'Vector学院：汽车Python实战',
      region: 'EU',                // 'CN' | 'DE' | 'EU' | 'global'
      url: 'https://vector.com/academy',
      price_range: '€500-1200',
      format: 'online',           // 'online' | 'offline' | 'hybrid'
      certification: 'Vector Certificate',
      language: ['en', 'de'],
    },
  ],
  github_path: [
    {
      order: 1,
      repo_name: 'python-can',
      repo_url: 'https://github.com/hardbyte/python-can',
      stars: '1.2K',
      what_to_learn: 'CAN bus communication basics',
      what_to_learn_zh: 'CAN总线通信基础',
      estimated_hours: 3,
    },
  ],
  capstone: {
    title: 'CAN Bus Data Logger & Analyzer',
    title_zh: 'CAN总线数据记录分析器',
    difficulty: 'intermediate',
    time_hours: 20,
    deliverables: ['GitHub repo', 'Sample DBC parser', 'Visualization dashboard'],
    deliverables_zh: ['GitHub仓库', 'DBC文件解析器', '数据可视化面板'],
    proves_to_employer: 'You can write automotive-grade data acquisition scripts',
    proves_to_employer_zh: '你能编写汽车级数据采集脚本',
  },
  monetization_potential: 'affiliate',
}
```

### 3. Report Inaccurate Data

Open an issue with:
- Which role/skill is wrong
- What the correct data should be
- Your source (salary report, job posting, personal experience with years noted)

### 4. Improve Translations

All user-facing text supports three languages. If you spot awkward German or Chinese, PRs are welcome. Key files:
- `src/app/*/page.tsx` — each page has a `ui` object with `en/de/zh` keys
- `src/lib/career-map/*.ts` — role titles and descriptions
- `src/lib/toolmap/*.ts` — tool names and learning descriptions

### 5. Add Data Source Integrations

We're building API clients in `src/lib/data-sources/`. Priority integrations:
- **Eurostat** — EU salary data
- **BERUFENET/KURSNET** — German occupation and training data
- **OECD.Stat** — international wage comparisons

## Development Setup

```bash
git clone https://github.com/michaellinhq/careerlens.git
cd careerlens/webapp
npm install
npm run dev        # http://localhost:3000
npm run build      # Verify before submitting PR
```

## Code Conventions

- TypeScript strict mode
- Trilingual: always include `en`, `zh`, `de` for user-facing strings
- Salary data: China in ¥10K/month, Germany in €K/year
- SOC codes: use O*NET format (e.g., `17-2112.00`)
- Skill names: Title Case in English, match existing taxonomy in `skill-classifier.ts`

## PR Checklist

- [ ] `npm run build` passes
- [ ] Salary data has a cited source (even "personal experience, 8 years in industry" counts)
- [ ] All three languages included for new user-facing text
- [ ] No hardcoded API keys or credentials
- [ ] SOC code included for new roles (look up at [O*NET OnLine](https://www.onetonline.org/))

## Questions?

Open an issue or reach out to Michael Lin (林海青) via GitHub.
