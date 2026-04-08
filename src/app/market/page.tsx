'use client';

import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { useLocale } from '@/lib/locale-context';
import { useCart } from '@/lib/cart-context';
import { allIndustries } from '@/lib/career-map';

/* ─── City data ─── */
interface CityData {
  id: string;
  name: string;
  name_zh: string;
  name_de: string;
  x: number; // % position on map SVG
  y: number;
  industries: string[]; // industry IDs strong in this city
  companies: { name: string; industry: string }[];
  jobPortal: string; // regional job search URL
}

const CHINA_CITIES: CityData[] = [
  { id: 'shanghai', name: 'Shanghai', name_zh: '上海', name_de: 'Shanghai', x: 78, y: 55, industries: ['automotive', 'electronics', 'consulting', 'it-manufacturing'], companies: [{ name: 'SAIC Motor', industry: 'automotive' }, { name: 'NIO', industry: 'automotive' }, { name: 'SMIC', industry: 'electronics' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Shanghai' },
  { id: 'shenzhen', name: 'Shenzhen', name_zh: '深圳', name_de: 'Shenzhen', x: 72, y: 72, industries: ['electronics', 'it-manufacturing', 'robotics', 'energy'], companies: [{ name: 'BYD', industry: 'automotive' }, { name: 'Huawei', industry: 'electronics' }, { name: 'DJI', industry: 'robotics' }, { name: 'Foxconn', industry: 'electronics' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Shenzhen' },
  { id: 'beijing', name: 'Beijing', name_zh: '北京', name_de: 'Peking', x: 72, y: 32, industries: ['aerospace', 'automotive', 'consulting', 'energy'], companies: [{ name: 'BAIC', industry: 'automotive' }, { name: 'COMAC (nearby)', industry: 'aerospace' }, { name: 'Xiaomi Auto', industry: 'automotive' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Beijing' },
  { id: 'changchun', name: 'Changchun', name_zh: '长春', name_de: 'Changchun', x: 82, y: 18, industries: ['automotive'], companies: [{ name: 'FAW Group', industry: 'automotive' }, { name: 'FAW-VW', industry: 'automotive' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Changchun' },
  { id: 'wuhan', name: 'Wuhan', name_zh: '武汉', name_de: 'Wuhan', x: 68, y: 55, industries: ['automotive', 'energy', 'medical-devices'], companies: [{ name: 'Dongfeng Motor', industry: 'automotive' }, { name: 'CATL (nearby)', industry: 'energy' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Wuhan' },
  { id: 'chongqing', name: 'Chongqing', name_zh: '重庆', name_de: 'Chongqing', x: 55, y: 57, industries: ['automotive', 'industrial-automation'], companies: [{ name: 'Changan Auto', industry: 'automotive' }, { name: 'SERES (Seres Group)', industry: 'automotive' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Chongqing' },
  { id: 'guangzhou', name: 'Guangzhou', name_zh: '广州', name_de: 'Guangzhou', x: 68, y: 72, industries: ['automotive', 'electronics', 'robotics'], companies: [{ name: 'GAC Group', industry: 'automotive' }, { name: 'XPeng', industry: 'automotive' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Guangzhou' },
  { id: 'suzhou', name: 'Suzhou', name_zh: '苏州', name_de: 'Suzhou', x: 79, y: 52, industries: ['electronics', 'medical-devices', 'industrial-automation'], companies: [{ name: 'Bosch China', industry: 'automotive' }, { name: 'Hella', industry: 'automotive' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Suzhou' },
  { id: 'ningbo', name: 'Ningbo', name_zh: '宁波', name_de: 'Ningbo', x: 81, y: 57, industries: ['automotive', 'energy', 'industrial-automation'], companies: [{ name: 'Geely', industry: 'automotive' }, { name: 'Joyson Electronics', industry: 'electronics' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Ningbo' },
  { id: 'xian', name: "Xi'an", name_zh: '西安', name_de: "Xi'an", x: 55, y: 44, industries: ['aerospace', 'electronics'], companies: [{ name: 'AVIC', industry: 'aerospace' }, { name: 'Samsung SDI', industry: 'electronics' }], jobPortal: "https://www.linkedin.com/jobs/search/?location=Xi'an" },
  { id: 'hefei', name: 'Hefei', name_zh: '合肥', name_de: 'Hefei', x: 74, y: 52, industries: ['automotive', 'electronics', 'energy'], companies: [{ name: 'NIO HQ', industry: 'automotive' }, { name: 'VW Anhui', industry: 'automotive' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Hefei' },
  { id: 'changsha', name: 'Changsha', name_zh: '长沙', name_de: 'Changsha', x: 66, y: 62, industries: ['industrial-automation', 'robotics'], companies: [{ name: 'SANY Heavy', industry: 'industrial-automation' }, { name: 'Zoomlion', industry: 'industrial-automation' }], jobPortal: 'https://www.linkedin.com/jobs/search/?location=Changsha' },
];

const GERMANY_CITIES: CityData[] = [
  { id: 'munich', name: 'Munich', name_zh: '慕尼黑', name_de: 'München', x: 62, y: 78, industries: ['automotive', 'aerospace', 'consulting', 'electronics'], companies: [{ name: 'BMW', industry: 'automotive' }, { name: 'Siemens', industry: 'industrial-automation' }, { name: 'Airbus Defence', industry: 'aerospace' }], jobPortal: 'https://www.stepstone.de/jobs/münchen' },
  { id: 'stuttgart', name: 'Stuttgart', name_zh: '斯图加特', name_de: 'Stuttgart', x: 48, y: 72, industries: ['automotive', 'industrial-automation', 'consulting'], companies: [{ name: 'Mercedes-Benz', industry: 'automotive' }, { name: 'Porsche', industry: 'automotive' }, { name: 'Bosch', industry: 'automotive' }], jobPortal: 'https://www.stepstone.de/jobs/stuttgart' },
  { id: 'wolfsburg', name: 'Wolfsburg', name_zh: '沃尔夫斯堡', name_de: 'Wolfsburg', x: 55, y: 32, industries: ['automotive'], companies: [{ name: 'Volkswagen', industry: 'automotive' }, { name: 'Continental', industry: 'automotive' }], jobPortal: 'https://www.stepstone.de/jobs/wolfsburg' },
  { id: 'berlin', name: 'Berlin', name_zh: '柏林', name_de: 'Berlin', x: 68, y: 28, industries: ['it-manufacturing', 'consulting', 'medical-devices'], companies: [{ name: 'Siemens HQ', industry: 'industrial-automation' }, { name: 'Tesla Gigafactory (nearby)', industry: 'automotive' }], jobPortal: 'https://www.stepstone.de/jobs/berlin' },
  { id: 'hamburg', name: 'Hamburg', name_zh: '汉堡', name_de: 'Hamburg', x: 50, y: 20, industries: ['aerospace', 'energy', 'consulting'], companies: [{ name: 'Airbus', industry: 'aerospace' }, { name: 'Nordex', industry: 'energy' }], jobPortal: 'https://www.stepstone.de/jobs/hamburg' },
  { id: 'frankfurt', name: 'Frankfurt', name_zh: '法兰克福', name_de: 'Frankfurt', x: 44, y: 52, industries: ['consulting', 'it-manufacturing'], companies: [{ name: 'ABB Germany', industry: 'industrial-automation' }, { name: 'Accenture DE', industry: 'consulting' }], jobPortal: 'https://www.stepstone.de/jobs/frankfurt' },
  { id: 'ingolstadt', name: 'Ingolstadt', name_zh: '英戈尔施塔特', name_de: 'Ingolstadt', x: 59, y: 72, industries: ['automotive'], companies: [{ name: 'Audi', industry: 'automotive' }], jobPortal: 'https://www.stepstone.de/jobs/ingolstadt' },
  { id: 'nuremberg', name: 'Nuremberg', name_zh: '纽伦堡', name_de: 'Nürnberg', x: 58, y: 65, industries: ['electronics', 'industrial-automation', 'energy'], companies: [{ name: 'Siemens Energy', industry: 'energy' }, { name: 'Schaeffler', industry: 'automotive' }], jobPortal: 'https://www.stepstone.de/jobs/nürnberg' },
  { id: 'aachen', name: 'Aachen', name_zh: '亚琛', name_de: 'Aachen', x: 28, y: 42, industries: ['automotive', 'robotics', 'electronics'], companies: [{ name: 'FEV Group', industry: 'automotive' }, { name: 'RWTH Spin-offs', industry: 'robotics' }], jobPortal: 'https://www.stepstone.de/jobs/aachen' },
  { id: 'dresden', name: 'Dresden', name_zh: '德累斯顿', name_de: 'Dresden', x: 70, y: 42, industries: ['electronics'], companies: [{ name: 'Infineon', industry: 'electronics' }, { name: 'Globalfoundries', industry: 'electronics' }, { name: 'Bosch Semiconductor', industry: 'electronics' }], jobPortal: 'https://www.stepstone.de/jobs/dresden' },
];

/* ─── i18n ─── */
const ui = {
  en: {
    title: 'Start Walking!',
    sub: 'See where your target industries are hiring — click a city to see companies and job links',
    china: 'China',
    germany: 'Germany',
    companies: 'Companies',
    searchJobs: 'Search Jobs',
    blueCard: 'EU Blue Card Info',
    blueCardHint: 'Germany offers EU Blue Card for qualified professionals. Min salary: €45,300/yr (€41,042 for shortage occupations like engineering).',
    hotIndustries: 'Hot industries',
    yourIndustries: 'Your target industries here',
  },
  de: {
    title: 'Los geht\'s!',
    sub: 'Wo deine Zielbranchen einstellen — klicke auf eine Stadt für Unternehmen und Stellenangebote',
    china: 'China',
    germany: 'Deutschland',
    companies: 'Unternehmen',
    searchJobs: 'Jobs suchen',
    blueCard: 'EU Blue Card Info',
    blueCardHint: 'Deutschland bietet die EU Blue Card für qualifizierte Fachkräfte. Mindestgehalt: €45.300/Jahr (€41.042 für Mangelberufe wie Ingenieurwesen).',
    hotIndustries: 'Top-Branchen',
    yourIndustries: 'Deine Zielbranchen hier',
  },
  zh: {
    title: '开始走！',
    sub: '看看你的目标行业在哪里招聘 — 点击城市查看公司和招聘链接',
    china: '中国',
    germany: '德国',
    companies: '主要公司',
    searchJobs: '搜索招聘',
    blueCard: 'EU蓝卡信息',
    blueCardHint: '德国为高技能人才提供EU蓝卡。最低年薪要求：€45,300（工程等紧缺职业：€41,042）。',
    hotIndustries: '热门行业',
    yourIndustries: '你的目标行业在这里',
  },
};

/* ─── City Dot on Map ─── */
function CityDot({ city, locale, isSelected, onSelect, relevantIndustries }: {
  city: CityData; locale: string; isSelected: boolean; onSelect: () => void; relevantIndustries: string[];
}) {
  const isZh = locale === 'zh';
  const isDe = locale === 'de';
  const name = isZh ? city.name_zh : isDe ? city.name_de : city.name;
  const hasRelevant = relevantIndustries.some(ri => city.industries.includes(ri));
  const dotSize = hasRelevant ? 8 : 5;
  const color = hasRelevant ? '#2563eb' : '#94a3b8';

  return (
    <g className="cursor-pointer" onClick={onSelect}>
      {/* Pulse animation for relevant cities */}
      {hasRelevant && (
        <circle cx={`${city.x}%`} cy={`${city.y}%`} r={12} fill="rgba(37,99,235,0.15)">
          <animate attributeName="r" from="8" to="16" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={`${city.x}%`} cy={`${city.y}%`} r={dotSize}
        fill={isSelected ? '#1d4ed8' : color}
        stroke="white" strokeWidth="2" />
      <text x={`${city.x}%`} y={`${city.y - 3}%`} textAnchor="middle"
        fill={hasRelevant ? '#1e293b' : '#64748b'} fontSize={hasRelevant ? '10' : '8'} fontWeight={hasRelevant ? '600' : '400'}>
        {name}
      </text>
    </g>
  );
}

/* ─── City Detail Panel ─── */
function CityDetail({ city, locale, c }: { city: CityData; locale: string; c: typeof ui.en }) {
  const isZh = locale === 'zh';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-2">
        {isZh ? city.name_zh : locale === 'de' ? city.name_de : city.name}
      </h3>

      {/* Industries in this city */}
      <div className="mb-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">{c.hotIndustries}</div>
        <div className="flex flex-wrap gap-1.5">
          {city.industries.map(indId => {
            const ind = allIndustries.find(i => i.id === indId);
            if (!ind) return null;
            return (
              <span key={indId} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {ind.icon} {isZh ? ind.name_zh : ind.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Companies */}
      <div className="mb-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">{c.companies}</div>
        <div className="space-y-1">
          {city.companies.map(comp => {
            const ind = allIndustries.find(i => i.id === comp.industry);
            return (
              <div key={comp.name} className="flex items-center gap-2 text-xs text-slate-700">
                <span>{ind?.icon || '🏢'}</span>
                <span className="font-medium">{comp.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Job search link */}
      <a href={city.jobPortal} target="_blank" rel="noopener noreferrer"
        className="block text-center py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        {c.searchJobs} →
      </a>
    </div>
  );
}

/* ─── Main Page ─── */
export default function MarketPage() {
  const { locale } = useLocale();
  const { cart } = useCart();
  const c = ui[locale];
  const isZh = locale === 'zh';

  const [activeMap, setActiveMap] = useState<'CN' | 'DE'>('CN');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);

  // Get industries from cart for highlighting
  const relevantIndustries = useMemo(() => {
    return [...new Set(cart.map(item => item.industryId))];
  }, [cart]);

  const cities = activeMap === 'CN' ? CHINA_CITIES : GERMANY_CITIES;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{c.title}</h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">{c.sub}</p>
        </div>

        {/* Map toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5">
            <button onClick={() => { setActiveMap('CN'); setSelectedCity(null); }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeMap === 'CN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
              🇨🇳 {c.china}
            </button>
            <button onClick={() => { setActiveMap('DE'); setSelectedCity(null); }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeMap === 'DE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
              🇩🇪 {c.germany}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Map area */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <svg viewBox="0 0 400 300" className="w-full" style={{ minHeight: 350 }}>
              {/* Background shape */}
              {activeMap === 'CN' ? (
                // Simplified China outline
                <g>
                  <rect x="20%" y="5%" width="70%" height="90%" rx="20" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                  <text x="50%" y="3%" textAnchor="middle" fill="#94a3b8" fontSize="10">{isZh ? '中国制造业热力图' : 'China Manufacturing Hotspots'}</text>
                </g>
              ) : (
                // Simplified Germany outline
                <g>
                  <rect x="15%" y="5%" width="70%" height="90%" rx="20" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                  <text x="50%" y="3%" textAnchor="middle" fill="#94a3b8" fontSize="10">{isZh ? '德国制造业热力图' : 'Germany Manufacturing Hotspots'}</text>
                </g>
              )}

              {/* City dots */}
              {cities.map(city => (
                <CityDot key={city.id} city={city} locale={locale}
                  isSelected={selectedCity?.id === city.id}
                  onSelect={() => setSelectedCity(city)}
                  relevantIndustries={relevantIndustries} />
              ))}
            </svg>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span>{isZh ? '你的目标行业' : 'Your target industries'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span>{isZh ? '其他制造中心' : 'Other manufacturing hubs'}</span>
              </div>
            </div>
          </div>

          {/* Detail sidebar */}
          <div className="space-y-4">
            {selectedCity ? (
              <CityDetail city={selectedCity} locale={locale} c={c} />
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
                <div className="text-3xl mb-2">📍</div>
                <p className="text-sm text-slate-500">{isZh ? '点击城市查看详情' : 'Click a city to see details'}</p>
              </div>
            )}

            {/* Blue Card info for Germany */}
            {activeMap === 'DE' && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-indigo-800 mb-2">🇪🇺 {c.blueCard}</h4>
                <p className="text-[11px] text-indigo-700 leading-relaxed">{c.blueCardHint}</p>
                <a href="https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card" target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-[10px] text-indigo-600 hover:underline">
                  {isZh ? '了解更多 →' : 'Learn more →'}
                </a>
              </div>
            )}

            {/* Cart context */}
            {cart.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mb-2">{c.yourIndustries}</div>
                <div className="flex flex-wrap gap-1.5">
                  {relevantIndustries.map(indId => {
                    const ind = allIndustries.find(i => i.id === indId);
                    if (!ind) return null;
                    return (
                      <span key={indId} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white text-blue-700 rounded-full border border-blue-200">
                        {ind.icon} {isZh ? ind.name_zh : ind.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
