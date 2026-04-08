'use client';

import { useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { mockNews, mockTrend } from '@/lib/ai/mock-signals';
import { allIndustries } from '@/lib/career-map';
import { calcIndustryMatch } from '@/lib/resume-parser';
import { t } from '@/lib/i18n';

export default function SignalsPage() {
  const { locale } = useLocale();
  const { userSkills } = useSkills();
  const isZh = locale === 'zh';

  const userTopIndustries = useMemo(() => {
    if (userSkills.length === 0) return [];
    return allIndustries
      .map(ind => ({ id: ind.id, name: isZh ? ind.name_zh : ind.name, icon: ind.icon, match: calcIndustryMatch(userSkills, ind) }))
      .filter(i => i.match > 10)
      .sort((a, b) => b.match - a.match)
      .slice(0, 5);
  }, [userSkills, isZh]);

  const industryTrends = useMemo(() => {
    const scores = new Map<string, number>();
    for (const news of mockNews) {
      for (const impact of news.impacts) {
        const current = scores.get(impact.industry_id) || 0;
        scores.set(impact.industry_id, current + (impact.direction === 'positive' ? impact.magnitude : -impact.magnitude));
      }
    }
    return Array.from(scores.entries())
      .map(([id, score]) => {
        const ind = allIndustries.find(i => i.id === id);
        return { id, name: isZh ? ind?.name_zh || id : ind?.name || id, icon: ind?.icon || '', score };
      })
      .sort((a, b) => b.score - a.score);
  }, [isZh]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            📡 {isZh ? '市场信号 · 高端制造业动态' : 'Market Signals · Advanced Manufacturing'}
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            {isZh ? '过去30天影响工程师职业的关键事件 — 点击查看对各行业的正/负影响'
              : 'Key events impacting engineering careers — click to see industry impacts'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              {isZh ? '📊 30天趋势总结' : '📊 30-Day Trend Summary'}
            </h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {isZh ? mockTrend.summary_zh : mockTrend.summary}
            </p>
            <div className="space-y-2">
              {industryTrends.map(({ id, name, icon, score }) => {
                const absScore = Math.abs(score);
                const maxScore = Math.max(...industryTrends.map(t => Math.abs(t.score)));
                const pct = (absScore / maxScore) * 100;
                const isPositive = score > 0;
                const userMatch = userTopIndustries.find(i => i.id === id);
                return (
                  <a key={id} href={`/industries?focus=${id}`} className="flex items-center gap-2 group">
                    <span className="text-base w-6 text-center">{icon}</span>
                    <span className="text-xs text-slate-700 w-28 shrink-0 truncate font-medium group-hover:text-blue-600 transition-colors">{name}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded relative overflow-hidden">
                      <div className={`absolute top-0 h-full rounded transition-all ${isPositive ? 'bg-emerald-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.max(pct, 5)}%` }} />
                      <span className={`absolute top-0 h-full flex items-center px-2 text-[10px] font-bold ${isPositive ? 'text-emerald-800' : 'text-red-800'}`}>
                        {isPositive ? '+' : ''}{score}
                      </span>
                    </div>
                    {userMatch && (
                      <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">{isZh ? '你匹配' : 'you match'}</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {userSkills.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-blue-800 mb-2">{isZh ? '🎯 对你的影响' : '🎯 Impact on You'}</h3>
                <div className="space-y-2">
                  {userTopIndustries.slice(0, 3).map(ind => {
                    const trend = industryTrends.find(t => t.id === ind.id);
                    if (!trend) return null;
                    return (
                      <div key={ind.id} className="flex items-center gap-2">
                        <span className="text-sm">{ind.icon}</span>
                        <span className="text-xs text-slate-700 flex-1">{ind.name}</span>
                        <span className={`text-xs font-bold ${trend.score > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {trend.score > 0 ? '↑' : '↓'}{Math.abs(trend.score)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-900 mb-2">{isZh ? '数据来源' : 'Sources'}</h3>
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>Reuters · Bloomberg · Xinhua</div>
                <div>Financial Times · WSJ · Handelsblatt</div>
                <div className="text-slate-400 mt-2">{isZh ? '未来接入实时RSS + AI分析' : 'Future: real-time RSS + AI'}</div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-sm font-bold text-slate-900 mb-4">{isZh ? '📰 近期事件详情' : '📰 Recent Events'}</h2>
        <div className="space-y-4">
          {mockNews.map(news => {
            const positives = news.impacts.filter(i => i.direction === 'positive').sort((a, b) => b.magnitude - a.magnitude);
            const negatives = news.impacts.filter(i => i.direction === 'negative').sort((a, b) => b.magnitude - a.magnitude);
            const isRelevant = news.impacts.some(i => userTopIndustries.some(u => u.id === i.industry_id));
            const getInd = (id: string) => { const ind = allIndustries.find(i => i.id === id); return { name: isZh ? ind?.name_zh || id : ind?.name || id, icon: ind?.icon || '' }; };

            return (
              <div key={news.id} className={`bg-white border rounded-xl p-5 shadow-sm ${isRelevant ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'}`}>
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-slate-400">{news.date} · {news.source}</span>
                    {isRelevant && <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{isZh ? '与你相关' : 'Relevant'}</span>}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{isZh ? news.headline_zh : news.headline}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {positives.length > 0 && (
                    <div>
                      <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">{isZh ? '正向影响 ↑' : 'Positive ↑'}</div>
                      {positives.map(impact => {
                        const info = getInd(impact.industry_id);
                        return (
                          <a key={impact.industry_id} href={`/industries?focus=${impact.industry_id}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                            <span className="text-sm">{info.icon}</span>
                            <span className="text-xs text-slate-700 flex-1">{info.name}</span>
                            <span className="text-xs font-bold text-emerald-600">+{impact.magnitude}%</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                  {negatives.length > 0 && (
                    <div>
                      <div className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-2">{isZh ? '负向影响 ↓' : 'Negative ↓'}</div>
                      {negatives.map(impact => {
                        const info = getInd(impact.industry_id);
                        return (
                          <a key={impact.industry_id} href={`/industries?focus=${impact.industry_id}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 transition-colors">
                            <span className="text-sm">{info.icon}</span>
                            <span className="text-xs text-slate-700 flex-1">{info.name}</span>
                            <span className="text-xs font-bold text-red-500">-{impact.magnitude}%</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-0.5">
                  {news.impacts.map(impact => {
                    const info = getInd(impact.industry_id);
                    return (
                      <div key={impact.industry_id} className="text-[10px] text-slate-500">
                        {info.icon} {isZh ? impact.reason_zh : impact.reason}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="mt-16 py-6 border-t border-slate-200 text-center text-xs text-slate-400">
          {t(locale, 'footer')}
        </footer>
      </main>
    </div>
  );
}
