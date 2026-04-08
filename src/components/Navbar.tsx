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
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg gradient-text">{t(locale, 'site_name')}</Link>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm transition-colors ${pathname === l.href ? 'text-foreground font-medium' : 'text-muted hover:text-foreground'}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <button onClick={() => setLocale(nextLocale)}
          className="px-3 py-1 text-xs border border-border rounded-full text-muted hover:text-foreground hover:border-accent transition-colors">
          {nextLabel}
        </button>
      </div>
    </nav>
  );
}
