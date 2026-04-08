'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { t, type Locale } from '@/lib/i18n';

export function Navbar() {
  const { locale, setLocale } = useLocale();
  const pathname = usePathname();

  const nextLocale: Locale = locale === 'en' ? 'de' : locale === 'de' ? 'zh' : 'en';
  const nextLabel = locale === 'en' ? 'DE' : locale === 'de' ? '中文' : 'EN';

  const links = [
    { href: '/industries', label: locale === 'zh' ? '行业与岗位' : locale === 'de' ? 'Branchen & Jobs' : 'Industries & Jobs' },
    { href: '/learn', label: t(locale, 'nav_learn') },
    { href: '/signals', label: t(locale, 'nav_signals') },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" className="font-bold text-base text-blue-600">🔬 {t(locale, 'site_name')}</Link>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm transition-colors ${pathname === l.href || pathname?.startsWith(l.href) ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <button onClick={() => setLocale(nextLocale)}
          className="px-3 py-1 text-xs border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 hover:border-blue-400 transition-colors">
          {nextLabel}
        </button>
      </div>
    </nav>
  );
}
