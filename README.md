# CareerLens 职业透镜

Career Intelligence for Engineers / 工程师职业情报平台

Find high-value career opportunities across 9 advanced manufacturing industries, then reverse-engineer the path to get there.

## What It Does

```
我是谁 → 去哪里 → 怎么去 → 开始走
Profile → Industries → Plan → Market
```

1. **Career Profile** — Paste resume, AI analyzes your skills, experience level, and market value
2. **Industry & Jobs** — Browse 9 industries × 60+ roles × 5 career levels with CN+DE salary data, add target roles to cart
3. **Action Plan** — For your selected roles: precise skill gaps, tools, certifications, and capstone projects
4. **Market Map** — Interactive China/Germany maps showing industry hotspots, top companies, and live job links

## Target Users

- Chinese engineers exploring career transitions
- German automotive workers facing industry transformation (VW/Continental/ZF layoffs)
- Mid-career professionals seeking data-driven career decisions

## Data

- **9 Industries:** Automotive, Robotics, Electronics, Aerospace, Energy, Medical Devices, Industrial Automation, IT Manufacturing, Consulting
- **60+ Roles** with 5-level salary ladders (Junior → Director)
- **150+ Skills** across 15 categories
- **1000+ Learning Paths** with tools, training, GitHub repos, capstone projects
- **Dual Market:** China (¥K/month) + Germany (€K/year)
- **Sources:** BLS, O*NET, Eurostat, Hays, Michael Page salary reports

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4
- Static export → Cloudflare Pages
- AI: Qwen (通义千问) with rules-engine fallback

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Static export to ./out
```

## AI Configuration

Optional — the app works without AI using rules-based skill matching.

```bash
# .env.local
NEXT_PUBLIC_QWEN_API_KEY=sk-your-key-here
```

## Deploy

```bash
npx wrangler pages deploy out --project-name careerlens
```

## License

MIT

## Author

Michael Lin (林海青) — 10+ years automotive electronics quality management at Magna
