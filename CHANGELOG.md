# Changelog

## [0.3.0] - 2026-04-08 — Product Overhaul: AI + Interconnected Pages

### Added
- **AI Integration**: Qwen (通义千问) API client with OpenAI-compatible format and rules-engine fallback
- **Resume → AI Career Profile**: paste resume → skill extraction + career profile (industry, function, level, cross-industry potential)
- **Industry × Role Match Matrix**: landing page shows match % across all 9 industries and top roles
- **Skill Gap Analysis**: industry page role cards show "you have" (green) vs "you need" (red) skills
- **Job Search Links**: LinkedIn, Indeed, StepStone links on every role card
- **Signal Sidebar**: industry detail page shows related market signals with impact analysis
- **8 Mock News Events**: EU CBAM, Tesla expansion, China robotics plan, semiconductor controls, German immigration act, CATL gigafactory, AI quality inspection, Siemens-SAP digital twin
- **30-Day Trend Summary**: aggregated industry impact scores with personal impact panel
- **Gap-Driven Learning**: learn page shows personalized priority list based on skill gaps
- **Anchor Links**: industry page "missing skill" links directly to learn page with highlight

### Changed
- **Renamed**: 转行宝 → 职业透镜 (CareerLens)
- **Landing Page**: from dual-path cards to resume-first with AI profile + match matrix
- **Industries Page**: added skill gap display, sorting controls (match/salary/growth), signal sidebar
- **Learn Page**: gap priorities at top, Suspense boundary for query params
- **Signals Page**: from 5 static events to 8 news items with per-industry positive/negative impact visualization
- **Navbar**: simplified to 3 links (Industries & Jobs, Learn, Signals), light theme
- **Theme**: consistent light slate-50/white across all pages

### Architecture
- `src/lib/ai/` — AI client, resume analyzer, mock signals, types
- `src/lib/resume-parser.ts` — keyword matching engine (150+ skills, Chinese aliases)
- Shopping cart model planned for next version

## [0.2.0] - 2026-04-08 — Industry Career Maps + IndustryToolMap

### Added
- **9 Industry Career Maps**: automotive, robotics, electronics, aerospace, energy, medical devices, industrial automation, IT manufacturing, consulting
- **60+ Roles × 5 Levels**: junior → director salary ladders for CN and DE markets
- **SVG Radial Industry Map**: interactive hub with sub-category nodes on hover
- **IndustryToolMap**: 1000+ entries — skills → tools → training → GitHub → capstone projects
- **Sub-categories**: each industry has 3-5 sub-sectors (e.g., automotive: EV, autonomous, connected, powertrain)
- **Shared Skills Context**: localStorage persistence across pages
- **UTM Tracking**: affiliate link tracking for training/tool recommendations
- **Static Export**: 209 routes pre-generated for Cloudflare Pages

## [0.1.0] - 2026-04-07 — Initial WebApp

### Added
- Next.js 16 App Router setup
- Opportunity leaderboard (200+ jobs, CN + DE)
- Skill assessment with 15-category taxonomy
- Macro signals page (5 global events)
- Job detail pages with score breakdown
- Career events (10 concrete projects)
- Trilingual support (EN/DE/ZH)
- Dark theme (later changed to light)
