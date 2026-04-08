'use client';

import { useState } from 'react';
import { skillCategories } from '@/lib/data';
import { t, type Locale } from '@/lib/i18n';

export function SkillPanel({ userSkills, setUserSkills, locale }: { userSkills: string[]; setUserSkills: (s: string[]) => void; locale: Locale }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = (skill: string) => {
    setUserSkills(userSkills.includes(skill) ? userSkills.filter(s => s !== skill) : [...userSkills, skill]);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-card-hover transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-light font-bold text-lg">
            {userSkills.length || '?'}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground text-sm">{t(locale, 'my_skills')}</h3>
            <p className="text-xs text-muted">
              {userSkills.length > 0
                ? `${userSkills.length} ${t(locale, 'selected')}`
                : t(locale, 'my_skills_desc')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userSkills.length > 0 && (
            <button onClick={e => { e.stopPropagation(); setUserSkills([]); }}
              className="text-[10px] text-muted hover:text-red-400 px-2 py-1 rounded border border-border">
              {t(locale, 'clear_skills')}
            </button>
          )}
          <svg className={`w-5 h-5 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {!expanded && userSkills.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-1.5">
          {userSkills.map(s => (
            <span key={s} className="px-2 py-0.5 text-[10px] bg-accent/20 text-accent-light rounded-full border border-accent/30 cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
              onClick={() => toggle(s)}>{s} ×</span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {skillCategories.map(cat => {
            const catName = locale === 'zh' ? cat.name_zh : locale === 'de' ? cat.name_de : cat.name;
            return (
              <div key={cat.id}>
                <h4 className="text-xs font-semibold text-muted mb-2">{catName}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map(skill => {
                    const active = userSkills.includes(skill);
                    return (
                      <button key={skill} onClick={() => toggle(skill)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                          active
                            ? 'bg-accent/25 text-accent-light border-accent/40 shadow-sm shadow-accent/10'
                            : 'bg-surface text-muted border-border hover:border-accent/30 hover:text-foreground'
                        }`}>
                        {active && <span className="mr-1">✓</span>}{skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
