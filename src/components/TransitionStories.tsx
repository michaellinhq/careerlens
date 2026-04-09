'use client';

import { useState } from 'react';
import { transitionStories, type TransitionStory } from '@/lib/transition-stories';
import type { Locale } from '@/lib/i18n';

const ui = {
  en: {
    title: 'Real Career Transitions',
    sub: 'People who made the leap — with real timelines and skills',
    months: 'mo',
    arrow: '→',
    keySkill: 'Key skill',
    showMore: 'Show all stories',
    showLess: 'Show less',
  },
  de: {
    title: 'Echte Karrierewechsel',
    sub: 'Menschen, die den Sprung gewagt haben',
    months: 'Mo',
    arrow: '→',
    keySkill: 'Schlüssel-Skill',
    showMore: 'Alle Geschichten zeigen',
    showLess: 'Weniger zeigen',
  },
  zh: {
    title: '真实转行案例',
    sub: '真人真事——真实的时间线和关键技能',
    months: '个月',
    arrow: '→',
    keySkill: '关键技能',
    showMore: '查看全部案例',
    showLess: '收起',
  },
};

function StoryCard({ story, locale }: { story: TransitionStory; locale: Locale }) {
  const isZh = locale === 'zh';
  const isDe = locale === 'de';
  const from = isZh ? story.from_zh : isDe ? story.from_de : story.from;
  const to = isZh ? story.to_zh : isDe ? story.to_de : story.to;
  const quote = isZh ? story.quote_zh : isDe ? story.quote_de : story.quote;
  const loc = isZh ? story.location_zh : story.location;
  const c = ui[locale];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
      {/* From → To header */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{from}</span>
        <span className="text-blue-500 font-bold text-sm">{c.arrow}</span>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{to}</span>
      </div>

      {/* Metrics row */}
      <div className="flex flex-wrap gap-3 mb-2 text-[10px]">
        <span className="text-slate-500">
          <span className="font-bold text-slate-900">{story.duration_months}</span> {c.months}
        </span>
        <span className="text-slate-500">
          {story.currency}{story.salary_before} → <span className="font-bold text-emerald-600">{story.currency}{story.salary_after}</span>
        </span>
        <span className="text-slate-400">{loc}</span>
      </div>

      {/* Key skill badge */}
      <div className="mb-2">
        <span className="text-[9px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          {c.keySkill}: {story.key_skill}
        </span>
      </div>

      {/* Quote */}
      <p className="text-[11px] text-slate-600 leading-relaxed italic">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}

export function TransitionStories({ locale }: { locale: Locale }) {
  const [showAll, setShowAll] = useState(false);
  const c = ui[locale];
  const visible = showAll ? transitionStories : transitionStories.slice(0, 3);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
          <p className="text-[11px] text-slate-400">{c.sub}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {visible.map(story => (
          <StoryCard key={story.id} story={story} locale={locale} />
        ))}
      </div>
      {transitionStories.length > 3 && (
        <button onClick={() => setShowAll(!showAll)}
          className="mt-2 text-xs text-blue-600 hover:underline">
          {showAll ? c.showLess : c.showMore}
        </button>
      )}
    </div>
  );
}
