'use client';

import { macroEvents, signalWinners, signalLosers } from '@/lib/data';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/locale-context';
import { Navbar } from '@/components/Navbar';
import { SignalCard } from '@/components/SignalCard';

export default function SignalsPage() {
  const { locale } = useLocale();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t(locale, 'macro_signals')}</h2>
          <p className="text-muted max-w-xl mx-auto text-sm">{t(locale, 'macro_subtitle')}</p>
        </div>

        <div className="mb-10">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t(locale, 'current_events')}</h3>
          <div className="flex flex-wrap gap-3">
            {macroEvents.map(e => {
              const color = e.intensity >= 0.7 ? 'border-red-500/40 bg-red-500/5' : e.intensity >= 0.5 ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-border bg-surface';
              const label = e.intensity >= 0.7 ? t(locale, 'high') : e.intensity >= 0.5 ? t(locale, 'medium') : t(locale, 'low');
              return (
                <div key={e.name} className={`px-4 py-2.5 rounded-xl border ${color}`}>
                  <div className="text-sm text-foreground font-medium">{locale === 'de' ? e.name_de : e.name}</div>
                  <div className="text-[10px] text-muted mt-0.5">{t(locale, 'intensity')}: {label} ({(e.intensity * 100).toFixed(0)}%)</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full signal-up" />
              {t(locale, 'winners')}
            </h3>
            <div className="space-y-3">
              {signalWinners.map(j => <SignalCard key={j.job_en} job={j} locale={locale} />)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-400 rounded-full signal-down" />
              {t(locale, 'losers')}
            </h3>
            <div className="space-y-3">
              {signalLosers.map(j => <SignalCard key={j.job_en} job={j} locale={locale} />)}
            </div>
          </div>
        </div>

        <footer className="mt-16 py-6 border-t border-border text-center text-xs text-muted">
          {t(locale, 'footer')}
        </footer>
      </main>
    </div>
  );
}
