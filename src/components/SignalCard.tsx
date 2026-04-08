'use client';

import { useState } from 'react';
import type { SignalJob } from '@/lib/data';
import type { Locale } from '@/lib/i18n';

export function SignalCard({ job, locale }: { job: SignalJob; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const name = locale === 'de' ? job.job_de : locale === 'zh' ? job.job_zh : job.job_en;
  const isUp = job.direction === 'up';
  return (
    <div className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-accent/30 transition-colors" onClick={() => setOpen(!open)}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isUp ? '↑' : '↓'}
        </div>
        <div className="flex-1 min-w-0"><span className="font-medium text-foreground text-sm">{name}</span></div>
        <span className={`font-mono font-bold text-lg ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '+' : ''}{job.total_impact}%
        </span>
        <svg className={`w-4 h-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {job.signals.map((s, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-center gap-2">
                <span className={`font-mono font-medium ${s.impact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {s.impact > 0 ? '+' : ''}{s.impact}%
                </span>
                <span className="text-muted">{locale === 'de' ? s.event_de : s.event}</span>
              </div>
              <p className="mt-1 text-muted pl-12">{locale === 'de' ? s.reason_de : s.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
