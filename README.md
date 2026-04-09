# CareerLens 职业透镜

**AI-powered career intelligence for manufacturing engineers — bridging China and Germany.**

> Most career tools ask: "What can you do?" → then search for matching jobs.
> CareerLens flips the model: **Find the highest-value opportunities first** → reverse-engineer what you need to get there.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Why This Exists

There are **400,000+ Chinese engineers working in German manufacturing**. When they consider career transitions — from automotive to robotics, from quality to consulting — they face a unique problem:

- Chinese job platforms don't understand German industry standards (VDA, IATF)
- German career tools don't map Chinese qualifications
- Nobody tells you: *"You're 2 skills away from a completely different career with 40% higher pay"*

CareerLens solves this with a **reverse model** and **cross-industry superposition detection**.

## Core Features

### Reverse Career Model (逆向职业模型)
```
Traditional:  Major → Skills → Job Search → Hope for the best
CareerLens:   Best Opportunities → Required Skills → Learning Path → Proof Projects
```

### Superposition Detection (叠加态检测)
The signature algorithm. It scans 77 roles across 9 manufacturing industries and finds hidden transitions:

```
You: Automotive Quality Engineer (8 years, IATF 16949, SPC, FMEA)
     ↓ CareerLens detects:
     ├── Medical Device QA Lead    — gap: 2 skills (ISO 13485, FDA 21 CFR)
     ├── Aerospace Quality Manager — gap: 1 skill  (AS9100)
     └── Consulting Senior Manager — gap: 3 skills (Financial Modeling, M&A, Strategy)
         Each with: salary uplift %, AI defense gain %, growth outlook
```

### Dual-Market Intelligence (CN + DE)
Every role carries salary data for both markets, across 5 career levels:

| Level | China (¥K/mo) | Germany (€K/yr) |
|-------|---------------|------------------|
| Junior | 8-15 | 42-58 |
| Senior | 16-30 | 56-80 |
| Lead | 26-45 | 72-102 |
| Manager | 35-62 | 88-125 |
| Director | 52-95 | 110-170 |

### Industry Tool Map (工具知识图谱)
63 curated skill→tool mappings, each with:
- **Industry context** — "In automotive, Python means CAN bus data collection, not web dev"
- **Tool recommendations** — with essential/recommended/emerging tiers + free tier flags
- **Training providers** — CN/DE/global, with pricing and certification info
- **GitHub learning path** — step-by-step repos with time estimates
- **Capstone project** — "Build this, put it on your resume"

### Smart Skill Classification
200+ skills mapped to 5 actionable types:

| Type | Icon | Example | Actionability |
|------|------|---------|---------------|
| Tool | 🔧 | Python, CATIA, SAP | Install it, learn it |
| Method | 📋 | FMEA, SPC, Lean | Practice it, demonstrate it |
| Standard | 📜 | ISO 26262, IATF 16949 | Study it, get certified |
| Domain | 🧠 | Thermal Management | Broad knowledge, learn over time |
| Soft | 🤝 | Team Leadership | Develop through experience |

### AI-Enhanced Analysis
Upload a resume (PDF/DOCX/text) → AI extracts profile → rules engine matches skills → follow-up questions refine precision from 40% to 95%.

- **AI is optional** — rules engine works standalone
- **Server-side only** — API keys never reach the browser

## Data Sources

| Source | Type | What it provides | Status |
|--------|------|------------------|--------|
| **O*NET** | US Gov API | Skills, tasks, AI exposure per occupation | 🔜 Integrating |
| **US BLS** | US Gov API | 800+ occupations with salary data | 🔜 Integrating |
| **Eurostat** | EU API | EU28 earnings by occupation | 📋 Planned |
| **BERUFENET** | German BA | German occupation standards | 📋 Planned |
| **Career Map** | Curated | 77 roles × 5 levels × 2 markets | ✅ Live |
| **Tool Map** | Curated | 63 skill→tool→training→GitHub paths | ✅ Live |
| **Hays / Michael Page** | Annual PDF | Asia-Pacific salary benchmarks | 📋 Planned |

All SOC codes (Standard Occupational Classification) are mapped to enable cross-system data joins.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CareerLens Architecture               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Data Layer (src/lib/)                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │career-map│ │ toolmap  │ │ jobs-cn  │ │  jobs-de  │  │
│  │ 9 indust.│ │ 63 entry │ │ 95 jobs  │ │  95 jobs  │  │
│  │ 77 roles │ │ 9 indust.│ │ ¥ salary │ │ € salary  │  │
│  └────┬─────┘ └──────────┘ └──────────┘ └───────────┘  │
│       │ SOC codes                                       │
│  ┌────▼─────────────────────────────────────────────┐   │
│  │  Data Sources: BLS API → O*NET API → Eurostat    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Intelligence Layer                                     │
│  ┌──────────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │ Superposition│ │   Skill    │ │   Follow-up      │  │
│  │  Detection   │ │ Classifier │ │  Questions (27)  │  │
│  │ (cross-ind.) │ │ (5 types)  │ │  40% → 95%       │  │
│  └──────────────┘ └────────────┘ └──────────────────┘  │
│                                                         │
│  API Layer (server-side)                                │
│  ┌──────────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │ /api/analyze │ │ /api/plan- │ │ /api/data/bls    │  │
│  │ (DeepSeek)   │ │  suggest   │ │ /api/data/onet   │  │
│  └──────────────┘ └────────────┘ └──────────────────┘  │
│                                                         │
│  UI: 9 pages, trilingual (🇨🇳 🇩🇪 🇬🇧), responsive      │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
git clone https://github.com/michaellinhq/careerlens.git
cd careerlens/webapp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local` (all optional — the app works without any API keys):

```bash
# AI resume analysis (optional — rules engine works without it)
DEEPSEEK_API_KEY=sk-your-key

# O*NET Web Services (free — register at services.onetcenter.org)
ONET_USERNAME=your_username
ONET_PASSWORD=your_password

# BLS API (optional — increases rate limit from 25 to 500 req/day)
BLS_API_KEY=your_key
```

## Contributing

We especially need help with:

| Area | Impact | Difficulty |
|------|--------|------------|
| **Add industry roles** | Expand coverage beyond manufacturing | Easy — fill a JSON template |
| **Update salary data** | More accurate market intelligence | Easy — cite your source |
| **Add tool mappings** | More learning paths for users | Medium — requires domain knowledge |
| **New data source integrations** | Real-time data | Hard — API client + mapping |
| **Translation improvements** | Better DE/ZH/EN | Easy |

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for templates and guidelines.

## Roadmap

- [x] 9 manufacturing industries with 77 roles
- [x] Superposition detection algorithm
- [x] Skill type classification (tool/method/standard/domain/soft)
- [x] AI resume analysis with follow-up questions
- [x] Downloadable learning plans
- [ ] **BLS + O*NET API integration** (in progress)
- [ ] SOC code mapping for all roles
- [ ] Eurostat API for EU salary data
- [ ] User accounts + cloud persistence
- [ ] IT/Software industry expansion
- [ ] Finance/Consulting industry expansion
- [ ] PDF report generation (shareable)
- [ ] Mobile app (React Native / WeChat Mini Program v2)

## Author

**Michael Lin (林海青)** — 10+ years automotive electronics quality manager at Magna International, Germany. Built this because he saw too many talented engineers stuck in career dead-ends, not knowing they were 1-2 skills away from a much better role.

## License

[MIT](LICENSE) — free to use, modify, and distribute.

---

**Live**: [careerlens.vercel.app](https://webapp-ten-puce.vercel.app) | **Issues**: [GitHub Issues](https://github.com/michaellinhq/careerlens/issues)
