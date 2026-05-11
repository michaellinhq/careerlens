'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useLocale } from '@/lib/locale-context';
import { trackEvent } from '@/lib/tracking';

const CONTACT_EMAIL = 'michaellinhq@gmail.com';
const WECHAT_ID = 'haiqing_tech';
const GITHUB_URL = 'https://github.com/michaellinhq/careerlens/issues';

const ui = {
  en: {
    eyebrow: 'Advisor Review',
    title: 'Turn your analysis into a concrete migration strategy.',
    sub: 'For engineers who want a faster read on role choice, skill sequence, and China-Germany market landing.',
    pilot: 'Pilot offer',
    pilotHint: 'Built from the current CareerLens product roadmap and founder offer assumptions.',
    reportTitle: 'Premium migration brief',
    reportPrice: '¥99 / €15',
    reportDesc: 'A sharper written version of your path: target role logic, skill gap order, and proof-project suggestions.',
    sessionTitle: '1:1 strategy review',
    sessionPrice: '¥299 / €45',
    sessionDesc: 'A live review of your background, hidden transition options, and the fastest path to a stronger market position.',
    includes: 'What you get',
    reportItems: ['Opportunity-first role shortlist', 'Priority skill sequence', 'CN + DE market interpretation'],
    sessionItems: ['45-minute review', 'Role selection sanity check', 'Action plan feedback'],
    channels: 'Contact channels',
    email: 'Email founder',
    github: 'Open GitHub issue',
    wechat: 'Copy WeChat ID',
    copied: 'WeChat ID copied',
    note: 'Best for users who already completed the first analysis and want expert judgment on where to focus.',
    backPlan: 'Back to action plan',
    startFree: 'Start with free analysis',
  },
  de: {
    eyebrow: 'Beratungsreview',
    title: 'Mache aus der Analyse eine konkrete Wechselstrategie.',
    sub: 'Für Ingenieure, die schneller Klarheit über Zielrolle, Skill-Reihenfolge und CN-DE-Markteintritt wollen.',
    pilot: 'Pilotangebot',
    pilotHint: 'Basierend auf der aktuellen CareerLens-Roadmap und dem bestehenden Gründerangebot.',
    reportTitle: 'Premium-Migrationsbriefing',
    reportPrice: '¥99 / €15',
    reportDesc: 'Eine schärfere schriftliche Version deines Pfads: Zielrollenlogik, Skill-Reihenfolge und Proof-Projekte.',
    sessionTitle: '1:1 Strategiereview',
    sessionPrice: '¥299 / €45',
    sessionDesc: 'Live-Review deines Hintergrunds, versteckter Wechseloptionen und des schnellsten Pfads zu einer stärkeren Marktposition.',
    includes: 'Enthalten',
    reportItems: ['Opportunity-basierte Rollenliste', 'Priorisierte Skill-Reihenfolge', 'CN + DE Marktübersetzung'],
    sessionItems: ['45-Minuten-Review', 'Reality-Check für Zielrollen', 'Feedback zum Aktionsplan'],
    channels: 'Kontaktkanäle',
    email: 'E-Mail an Gründer',
    github: 'GitHub-Issue öffnen',
    wechat: 'WeChat-ID kopieren',
    copied: 'WeChat-ID kopiert',
    note: 'Am sinnvollsten für Nutzer, die die erste Analyse bereits abgeschlossen haben und nun Expertenurteil wollen.',
    backPlan: 'Zurück zum Aktionsplan',
    startFree: 'Mit kostenloser Analyse starten',
  },
  zh: {
    eyebrow: '顾问评审',
    title: '把分析结果变成一份更具体的职业迁移策略。',
    sub: '适合已经有分析结果、现在需要更快判断目标岗位、技能顺序和中德市场落点的工程师。',
    pilot: '试运行报价',
    pilotHint: '定价来自仓库现有 pitch deck 中的产品化假设，可作为当前网站的商业入口。',
    reportTitle: '高级迁移简报',
    reportPrice: '¥99 / €15',
    reportDesc: '把你的路径写得更清楚：目标岗位逻辑、技能缺口顺序、证明项目建议。',
    sessionTitle: '1 对 1 策略评审',
    sessionPrice: '¥299 / €45',
    sessionDesc: '实时看你的背景、隐藏跃迁方向，以及哪条路径最值得优先投入。',
    includes: '你会得到',
    reportItems: ['机会优先的目标岗位清单', '技能补齐优先级', '中德市场翻译与落点建议'],
    sessionItems: ['45 分钟评审', '目标岗位合理性校准', '行动计划反馈'],
    channels: '联系渠道',
    email: '邮件联系作者',
    github: '通过 GitHub 留言',
    wechat: '复制微信号',
    copied: '微信号已复制',
    note: '最适合已经完成第一轮分析、希望有人帮你判断“现在到底该先做什么”的用户。',
    backPlan: '返回行动计划',
    startFree: '先做免费分析',
  },
};

export default function ConsultPage() {
  const { locale } = useLocale();
  const c = ui[locale];
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WECHAT_ID);
      setCopied(true);
      trackEvent('consult_copy_wechat', { locale });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <section className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-8 md:p-10 shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
            <span>●</span>
            <span>{c.eyebrow}</span>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl md:text-5xl font-semibold tracking-tight text-slate-950 leading-[1.05]">
            {c.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-600 leading-8">
            {c.sub}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">{c.pilot}:</span>
            <span>{c.pilotHint}</span>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">{c.reportTitle}</h2>
              <span className="text-sm font-bold text-blue-700">{c.reportPrice}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{c.reportDesc}</p>
            <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{c.includes}</div>
            <div className="mt-3 space-y-2">
              {c.reportItems.map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="mt-1 text-emerald-600">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">{c.sessionTitle}</h2>
              <span className="text-sm font-bold text-blue-700">{c.sessionPrice}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{c.sessionDesc}</p>
            <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{c.includes}</div>
            <div className="mt-3 space-y-2">
              {c.sessionItems.map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="mt-1 text-emerald-600">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{c.channels}</div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=CareerLens%20Advisor%20Review`}
              onClick={() => trackEvent('consult_email_click', { locale })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-white transition-colors"
            >
              {c.email}
              <div className="mt-1 text-xs text-slate-400">{CONTACT_EMAIL}</div>
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('consult_github_click', { locale })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-white transition-colors"
            >
              {c.github}
              <div className="mt-1 text-xs text-slate-400">github.com/michaellinhq/careerlens</div>
            </a>
            <button
              onClick={handleCopy}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-white transition-colors"
            >
              {c.wechat}
              <div className="mt-1 text-xs text-slate-400">{copied ? c.copied : WECHAT_ID}</div>
            </button>
          </div>
          <p className="mt-5 text-sm text-slate-500 leading-6">{c.note}</p>
        </section>

        <section className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              trackEvent('consult_back_plan', { locale });
              router.push('/plan');
            }}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {c.backPlan}
          </button>
          <button
            onClick={() => {
              trackEvent('consult_start_free', { locale });
              router.push('/');
            }}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-slate-900 transition-colors"
          >
            {c.startFree}
          </button>
        </section>
      </main>
    </div>
  );
}
