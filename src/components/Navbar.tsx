'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { useCart } from '@/lib/cart-context';
import { type Locale } from '@/lib/i18n';

const NAV: Record<string, Record<Locale, string>> = {
  '/industries': { en: 'Industries & Jobs', de: 'Branchen & Jobs', zh: '去哪里' },
  '/plan':       { en: 'Action Plan',       de: 'Aktionsplan',     zh: '怎么去' },
  '/market':     { en: 'Market Map',        de: 'Marktkarte',      zh: '开始走' },
};

export function Navbar() {
  const { locale, setLocale } = useLocale();
  const { cart } = useCart();
  const pathname = usePathname();

  const nextLocale: Locale = locale === 'en' ? 'de' : locale === 'de' ? 'zh' : 'en';
  const nextLabel = locale === 'en' ? 'DE' : locale === 'de' ? '中文' : 'EN';

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" className="font-bold text-base text-blue-600">
            🔬 {locale === 'zh' ? '职业透镜' : 'CareerLens'}
          </Link>
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
        <button onClick={() => setLocale(nextLocale)}
          className="px-3 py-1 text-xs border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 hover:border-blue-400 transition-colors">
          {nextLabel}
        </button>
      </div>
    </nav>
  );
}
