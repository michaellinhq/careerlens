'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { useCart } from '@/lib/cart-context';
import { type Locale } from '@/lib/i18n';

const NAV: Record<string, Record<Locale, string>> = {
  '/path':       { en: 'Path Builder',    de: 'Pfadplaner', zh: '路径生成' },
  '/industries': { en: 'Opportunity Map', de: 'Chancenkarte', zh: '机会地图' },
  '/assess':     { en: 'Assessment',      de: 'Selbstdiagnose', zh: '自我诊断' },
  '/plan':       { en: 'Action Plan',     de: 'Aktionsplan', zh: '行动计划' },
  '/market':     { en: 'Landing Market',  de: 'Zielmarkt', zh: '落点市场' },
};

export function Navbar() {
  const { locale, setLocale } = useLocale();
  const { cart } = useCart();
  const pathname = usePathname();

  const nextLocale: Locale = locale === 'en' ? 'de' : locale === 'de' ? 'zh' : 'en';
  const nextLabel = locale === 'en' ? 'DE' : locale === 'de' ? '中文' : 'EN';
  const consultLabel = locale === 'zh' ? '顾问评审' : locale === 'de' ? 'Beratung' : 'Advisor Review';

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" className="shrink-0 font-bold text-base text-blue-600">
            🔬 {locale === 'zh' ? '职业透镜' : 'CareerLens'}
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            {Object.entries(NAV).map(([href, labels]) => {
              const isActive = pathname === href || pathname?.startsWith(href + '/');
              return (
                <Link key={href} href={href}
                  className={`text-sm transition-colors relative ${isActive ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'}`}>
                  {labels[locale]}
                  {href === '/plan' && cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-3 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/consult" className="hidden sm:inline-flex px-3 py-1 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            {consultLabel}
          </Link>
          <button onClick={() => setLocale(nextLocale)}
            className="px-3 py-1 text-xs border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 hover:border-blue-400 transition-colors">
            {nextLabel}
          </button>
        </div>
      </div>
    </nav>
  );
}
