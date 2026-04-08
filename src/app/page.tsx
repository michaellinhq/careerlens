'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { analyzeResume, isAIAvailable } from '@/lib/ai';
import type { CareerProfile } from '@/lib/ai';
import { allIndustries } from '@/lib/career-map';
import { calcRoleMatch } from '@/lib/resume-parser';
import type { Locale } from '@/lib/i18n';

/* ─── i18n content ─── */
const ui = {
  en: {
    hero: 'Career Intelligence for Engineers',
    sub: 'Paste your resume — AI analyzes your career profile and matches you to the highest-paying roles across 9 industries.',
    placeholder: 'Paste your resume or describe your experience here...\n\nExample:\n• 8 years automotive quality engineer at Tier-1 supplier (Magna)\n• IATF 16949 lead auditor, FMEA, SPC, VDA 6.3\n• CATIA V5, SolidWorks, GD&T\n• Lean Manufacturing, Six Sigma Green Belt\n• Python data analysis, SQL, Power BI\n• German B1, English fluent',
    analyze: 'Analyze My Career Profile',
    skip: 'Skip — browse industries directly',
    analyzing: 'AI is analyzing your career profile...',
    profileTitle: 'Your Career Profile',
    level: 'Level',
    experience: 'Experience',
    years: 'years',
    coreStrengths: 'Core Strengths',
    languages: 'Languages',
    crossIndustry: 'Cross-Industry Potential',
    matchMatrix: 'Industry × Role Match Matrix',
    matrixHint: 'Click any cell to explore that industry and role',
    topOpp: 'Best Opportunity',
    topCross: 'Best Cross-Industry Move',
    signalHint: 'Market validation',
    editResume: 'Edit Resume',
    stats: ['9 Industries', '60+ Roles', '5 Career Levels', 'CN + DE Markets'],
    footer: 'Data from BLS, O*NET, Eurostat, Hays, Michael Page. Free & open source.',
    aiPowered: 'Powered by Qwen AI',
    rulesPowered: 'Skill matching (AI available when API key configured)',
    noSkills: 'Could not identify skills. Try adding more detail about your tools, certifications, and experience.',
    salaryRange: 'Salary range',
    perMonth: '/mo',
    perYear: '/yr',
    viewIndustry: 'View details',
  },
  de: {
    hero: 'Karriere-Intelligenz für Ingenieure',
    sub: 'Lebenslauf einfügen — KI analysiert dein Profil und matcht dich mit den bestbezahlten Rollen in 9 Branchen.',
    placeholder: 'Lebenslauf oder Erfahrung hier einfügen...\n\nBeispiel:\n• 8 Jahre Qualitätsingenieur Automotive bei Tier-1 (Magna)\n• IATF 16949, FMEA, SPC, VDA 6.3\n• CATIA V5, SolidWorks, GD&T\n• Lean, Six Sigma Green Belt\n• Python, SQL, Power BI\n• Deutsch B1, Englisch fließend',
    analyze: 'Karriereprofil analysieren',
    skip: 'Überspringen — Branchen direkt ansehen',
    analyzing: 'KI analysiert dein Karriereprofil...',
    profileTitle: 'Dein Karriereprofil',
    level: 'Stufe',
    experience: 'Erfahrung',
    years: 'Jahre',
    coreStrengths: 'Kernkompetenzen',
    languages: 'Sprachen',
    crossIndustry: 'Branchenübergreifendes Potenzial',
    matchMatrix: 'Branche × Rolle Match-Matrix',
    matrixHint: 'Klicke auf eine Zelle für Details',
    topOpp: 'Beste Chance',
    topCross: 'Bester Branchenwechsel',
    signalHint: 'Marktvalidierung',
    editResume: 'Lebenslauf bearbeiten',
    stats: ['9 Branchen', '60+ Rollen', '5 Karrierestufen', 'CN + DE Märkte'],
    footer: 'Daten von BLS, O*NET, Eurostat, Hays, Michael Page. Kostenlos & Open Source.',
    aiPowered: 'Powered by Qwen KI',
    rulesPowered: 'Skill-Matching (KI verfügbar mit API-Key)',
    noSkills: 'Keine Skills erkannt. Mehr Details zu Tools, Zertifikaten und Erfahrung hinzufügen.',
    salaryRange: 'Gehaltsbereich',
    perMonth: '/Mo',
    perYear: '/Jahr',
    viewIndustry: 'Details ansehen',
  },
  zh: {
    hero: '工程师职业情报平台',
    sub: '粘贴简历 — AI分析你的职业画像，匹配9大行业中薪资最高的岗位。',
    placeholder: '在此粘贴简历或描述你的经验...\n\n示例：\n• 8年一级供应商(麦格纳)汽车质量工程师\n• IATF 16949主任审核员, FMEA, SPC, VDA 6.3\n• CATIA V5, SolidWorks, GD&T\n• 精益生产, 六西格玛绿带\n• Python数据分析, SQL, Power BI\n• 德语B1, 英语流利',
    analyze: 'AI分析我的职业画像',
    skip: '跳过 — 直接浏览行业',
    analyzing: 'AI正在分析你的职业画像...',
    profileTitle: '你的职业画像',
    level: '级别',
    experience: '经验',
    years: '年',
    coreStrengths: '核心竞争力',
    languages: '语言能力',
    crossIndustry: '跨行业潜力',
    matchMatrix: '行业 × 岗位匹配矩阵',
    matrixHint: '点击任意格子查看行业和岗位详情',
    topOpp: '最佳机会',
    topCross: '最佳跨行业方向',
    signalHint: '市场验证',
    editResume: '修改简历',
    stats: ['9大行业', '60+岗位', '5级职业阶梯', '中德双市场'],
    footer: '数据来源：BLS, O*NET, Eurostat, Hays, Michael Page。免费开源。',
    aiPowered: '由通义千问AI驱动',
    rulesPowered: '技能匹配模式（配置API密钥后启用AI）',
    noSkills: '未识别到技能。请添加更多关于工具、证书和工作经验的描述。',
    salaryRange: '薪资范围',
    perMonth: '/月',
    perYear: '/年',
    viewIndustry: '查看详情',
  },
};

function LangSwitcher() {
  const { locale, setLocale } = useLocale();
  const next: Locale = locale === 'en' ? 'de' : locale === 'de' ? 'zh' : 'en';
  const label = locale === 'en' ? 'DE' : locale === 'de' ? '中文' : 'EN';
  return (
    <button onClick={() => setLocale(next)}
      className="absolute top-5 right-5 px-3 py-1 text-xs border border-slate-300 rounded-full text-slate-500 hover:text-slate-900 hover:border-blue-400 transition-colors z-10">
      {label}
    </button>
  );
}

/* ─── Career Profile Card ─── */
function ProfileCard({ profile, locale, c }: { profile: CareerProfile; locale: string; c: typeof ui.en }) {
  const isZh = locale === 'zh';
  const levelColors: Record<string, string> = {
    junior: 'bg-slate-100 text-slate-700',
    senior: 'bg-blue-100 text-blue-800',
    lead: 'bg-indigo-100 text-indigo-800',
    manager: 'bg-purple-100 text-purple-800',
    director: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-4">{c.profileTitle}</h2>

      {/* Summary */}
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        {isZh ? profile.summary_zh : profile.summary}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Industry */}
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{isZh ? '行业背景' : 'Industry'}</div>
          <div className="text-sm font-semibold text-slate-900">{isZh ? profile.industry_zh : profile.industry}</div>
        </div>
        {/* Function */}
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{isZh ? '职能方向' : 'Function'}</div>
          <div className="text-sm font-semibold text-slate-900">{isZh ? profile.function_area_zh : profile.function_area}</div>
        </div>
        {/* Level */}
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{c.level}</div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColors[profile.level] || ''}`}>
            {isZh ? profile.level_zh : profile.level.toUpperCase()}
          </span>
        </div>
        {/* Experience */}
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{c.experience}</div>
          <div className="text-sm font-semibold text-slate-900">{profile.years_experience} {c.years}</div>
        </div>
      </div>

      {/* Core Strengths */}
      <div className="mb-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">{c.coreStrengths}</div>
        <div className="flex flex-wrap gap-1.5">
          {profile.core_competencies.map(s => (
            <span key={s} className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">{s}</span>
          ))}
        </div>
      </div>

      {/* Languages + Cross-industry in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">{c.languages}</div>
          <div className="flex gap-2">
            {profile.languages.map(l => (
              <span key={l.language} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{l.language} {l.level}</span>
            ))}
          </div>
        </div>
        {profile.cross_industry.length > 0 && (
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">{c.crossIndustry}</div>
            <div className="space-y-1">
              {profile.cross_industry.map(ci => {
                const ind = allIndustries.find(i => i.id === ci.industry_id);
                return (
                  <div key={ci.industry_id} className="text-xs text-slate-600">
                    <span className="mr-1">{ind?.icon}</span>
                    <span className="font-medium">{isZh ? ind?.name_zh : ind?.name}</span>
                    <span className="text-slate-400 ml-1">— {isZh ? ci.reason_zh : ci.reason}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Match Matrix — Industry × Top Roles ─── */
function MatchMatrix({ skills, locale, c, onNavigate }: {
  skills: string[];
  locale: string;
  c: typeof ui.en;
  onNavigate: (industryId: string) => void;
}) {
  const isZh = locale === 'zh';

  // For each industry, get top 3 roles by match
  const matrix = allIndustries.map(ind => {
    const roleMatches = ind.roles.map(r => ({
      role: r,
      match: calcRoleMatch(skills, r),
      seniorSalary: r.levels[1]?.salary_cn.mid || 0, // senior level mid
    })).sort((a, b) => b.match - a.match);

    const topRoles = roleMatches.slice(0, 3);
    const industryMatch = topRoles.length > 0
      ? Math.round(topRoles.reduce((s, r) => s + r.match, 0) / topRoles.length)
      : 0;

    return { ind, industryMatch, topRoles };
  }).sort((a, b) => b.industryMatch - a.industryMatch);

  const matchColor = (m: number) =>
    m >= 60 ? 'bg-emerald-500 text-white' :
    m >= 40 ? 'bg-emerald-100 text-emerald-800' :
    m >= 20 ? 'bg-amber-100 text-amber-800' :
    m > 0 ? 'bg-slate-100 text-slate-500' :
    'bg-slate-50 text-slate-300';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-1">{c.matchMatrix}</h2>
      <p className="text-xs text-slate-400 mb-4">{c.matrixHint}</p>

      <div className="space-y-3">
        {matrix.map(({ ind, industryMatch, topRoles }) => (
          <div key={ind.id} className="border border-slate-100 rounded-xl p-3 hover:border-blue-200 transition-colors">
            <button onClick={() => onNavigate(ind.id)} className="w-full text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{ind.icon}</span>
                <span className="text-sm font-bold text-slate-900">{isZh ? ind.name_zh : ind.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${matchColor(industryMatch)}`}>
                  {industryMatch}%
                </span>
                <span className="text-[10px] text-slate-400 ml-auto">
                  ¥{ind.avg_salary_cn}K{c.perMonth} · €{ind.avg_salary_de}K{c.perYear}
                </span>
              </div>
            </button>
            {/* Top 3 roles */}
            <div className="grid grid-cols-3 gap-2">
              {topRoles.map(({ role, match }) => (
                <button
                  key={role.id}
                  onClick={() => onNavigate(ind.id)}
                  className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${matchColor(match)}`}>
                      {match}%
                    </span>
                    {role.growth_outlook === 'high' && <span className="text-[10px]">🔥</span>}
                  </div>
                  <div className="text-xs font-medium text-slate-800 truncate">
                    {isZh ? role.title_zh : role.title}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ¥{role.levels[1]?.salary_cn.mid || '?'}K-{role.levels[4]?.salary_cn.mid || '?'}K
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const { locale } = useLocale();
  const { setUserSkills } = useSkills();
  const router = useRouter();
  const c = ui[locale];

  const [resumeText, setResumeText] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [mode, setMode] = useState<'ai' | 'rules' | null>(null);
  const [phase, setPhase] = useState<'input' | 'loading' | 'results'>('input');

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim()) return;
    setPhase('loading');

    try {
      const result = await analyzeResume(resumeText);
      setSkills(result.skills);
      setProfile(result.profile);
      setMode(result.mode);
      setUserSkills(result.skills);
      setPhase('results');
    } catch {
      setPhase('input');
    }
  }, [resumeText, setUserSkills]);

  const handleNavigate = useCallback((industryId: string) => {
    router.push(`/industries?focus=${industryId}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LangSwitcher />

      {/* Hero */}
      <header className="flex flex-col items-center px-4 pt-14 pb-4">
        <div className="text-3xl mb-3">🔬</div>
        <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-2">
          {c.hero}
        </h1>
        <p className="text-slate-500 text-center max-w-xl text-sm mb-4">{c.sub}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {c.stats.map(s => (
            <span key={s} className="px-2.5 py-1 bg-white rounded-full text-[10px] text-slate-500 border border-slate-200">{s}</span>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 pb-10">
        <div className="max-w-4xl mx-auto">

          {/* Phase: Input */}
          {phase === 'input' && (
            <div className="space-y-4 mt-4">
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder={c.placeholder}
                className="w-full h-56 md:h-64 p-4 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none shadow-sm"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!resumeText.trim()}
                  className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-sm"
                >
                  {c.analyze}
                </button>
                <button
                  onClick={() => router.push('/industries')}
                  className="py-3 px-6 border border-slate-200 text-slate-500 rounded-xl hover:text-slate-900 hover:border-blue-300 transition-colors text-sm"
                >
                  {c.skip}
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400">
                {isAIAvailable() ? c.aiPowered : c.rulesPowered}
              </p>
            </div>
          )}

          {/* Phase: Loading */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center py-24">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-sm">{c.analyzing}</p>
            </div>
          )}

          {/* Phase: Results */}
          {phase === 'results' && profile && (
            <div className="space-y-5 mt-2">
              {/* Edit button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {skills.length} skills · {mode === 'ai' ? 'AI' : 'Rules'}
                  </span>
                </div>
                <button onClick={() => { setPhase('input'); setProfile(null); }} className="text-xs text-blue-600 hover:underline">
                  {c.editResume}
                </button>
              </div>

              {/* Career Profile */}
              <ProfileCard profile={profile} locale={locale} c={c} />

              {/* Match Matrix */}
              {skills.length > 0 ? (
                <MatchMatrix skills={skills} locale={locale} c={c} onNavigate={handleNavigate} />
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-sm text-slate-500">{c.noSkills}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-5 border-t border-slate-200 text-center text-[11px] text-slate-400">
        {c.footer}
      </footer>
    </div>
  );
}
