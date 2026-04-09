'use client';

import { Navbar } from '@/components/Navbar';
import { useLocale } from '@/lib/locale-context';
import Link from 'next/link';

const ui = {
  en: {
    title: 'Know Yourself First',
    sub: 'Before planning your career move, understand your natural strengths and energy patterns.',
    personality_title: 'Career Friction Diagnostic',
    personality_desc: 'Discover your engineer archetype through 14 real manufacturing scenarios. Find out which roles energize you — and which drain you.',
    personality_time: '~5 min',
    personality_cta: 'Start Diagnostic',
    personality_done: 'View My Results',
    scenarios: '14 industry scenarios',
    archetypes: '8 engineer archetypes',
    harmony: 'Role harmony scoring',
    privacy: 'All data stays in your browser. Nothing is sent to any server.',
    skills_title: 'Skill Self-Assessment',
    skills_desc: 'Select the skills you already have to see personalized match scores across 200+ roles.',
    skills_cta: 'Go to Industries & Jobs',
  },
  de: {
    title: 'Erkenne dich selbst',
    sub: 'Bevor du deinen Karrierewechsel planst, verstehe deine natürlichen Stärken und Energiemuster.',
    personality_title: 'Karriere-Reibungs-Diagnose',
    personality_desc: 'Entdecke deinen Ingenieur-Archetyp durch 14 reale Fertigungsszenarien. Finde heraus, welche Rollen dich energetisieren — und welche dich auslaugen.',
    personality_time: '~5 Min',
    personality_cta: 'Diagnose starten',
    personality_done: 'Meine Ergebnisse ansehen',
    scenarios: '14 Branchenszenarien',
    archetypes: '8 Ingenieur-Archetypen',
    harmony: 'Rollen-Harmonie-Bewertung',
    privacy: 'Alle Daten bleiben in deinem Browser. Nichts wird an einen Server gesendet.',
    skills_title: 'Skill-Selbstbewertung',
    skills_desc: 'Wähle deine vorhandenen Skills für personalisierte Ergebnisse über 200+ Rollen.',
    skills_cta: 'Zu Branchen & Jobs',
  },
  zh: {
    title: '先认识自己',
    sub: '在规划职业转型之前，先了解你的天然优势和能量模式。',
    personality_title: '职业摩擦力诊断',
    personality_desc: '通过14个真实制造业场景，发现你的工程师原型。找出哪些角色让你充满能量——哪些让你疲惫。',
    personality_time: '约5分钟',
    personality_cta: '开始诊断',
    personality_done: '查看我的结果',
    scenarios: '14个行业场景',
    archetypes: '8种工程师原型',
    harmony: '岗位和谐度评分',
    privacy: '所有数据留在你的浏览器中，不会发送到任何服务器。',
    skills_title: '技能自评',
    skills_desc: '选择你已有的技能，查看200+岗位的个性化匹配分数。',
    skills_cta: '去看行业与岗位',
  },
};

export default function AssessPage() {
  const { locale } = useLocale();
  const c = ui[locale];

  // Check if personality result exists
  let hasResult = false;
  if (typeof window !== 'undefined') {
    try { hasResult = !!localStorage.getItem('careerlens_personality'); } catch {}
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-10 pb-16">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{c.title}</h1>
        <p className="text-sm text-slate-500 mb-8">{c.sub}</p>

        {/* Personality Diagnostic Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{c.personality_title}</h2>
              <span className="text-xs text-slate-400">{c.personality_time}</span>
            </div>
            <span className="text-2xl">🧬</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">{c.personality_desc}</p>

          <div className="flex flex-wrap gap-3 mb-4">
            {[c.scenarios, c.archetypes, c.harmony].map((tag) => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/assess/personality"
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              {hasResult ? c.personality_done : c.personality_cta}
            </Link>
            {hasResult && (
              <span className="text-xs text-green-600 font-medium">✓ completed</span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-3">{c.privacy}</p>
        </div>

        {/* Skill Assessment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">{c.skills_title}</h2>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">{c.skills_desc}</p>
          <Link href="/industries"
            className="inline-block px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
            {c.skills_cta} →
          </Link>
        </div>
      </main>
    </div>
  );
}
