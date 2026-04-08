'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { parseResume, calcIndustryMatch } from '@/lib/resume-parser';
import { allIndustries } from '@/lib/career-map';
import type { Locale } from '@/lib/i18n';

const content = {
  en: {
    hero: 'Discover Your Career Value',
    sub: 'Paste your resume or describe your experience — we\'ll instantly match you to the highest-paying roles across 9 industries.',
    placeholder: 'Paste your resume here, or describe your skills and experience...\n\nExample:\n• 5 years automotive quality engineer at Tier-1 supplier\n• IATF 16949, FMEA, SPC, VDA 6.3 audit experience\n• CATIA V5, SolidWorks, GD&T\n• Lean Manufacturing, Six Sigma Green Belt\n• Python for data analysis, SQL\n• German B1, English fluent',
    analyze: 'Analyze My Skills',
    skip: 'Skip — browse industries directly',
    stats: ['200+ Roles Ranked', '9 Industries', '5 Career Levels', 'CN + DE Markets'],
    footer: 'Data from BLS, O*NET, Eurostat, Hays, Michael Page. Free & open source.',
    extracting: 'Analyzing...',
    skillsFound: 'skills identified',
    topMatches: 'Your Top Industry Matches',
    matchLabel: 'Match',
    avgSalary: 'Avg Salary',
    rolesLabel: 'roles',
    viewAll: 'View Industry Details',
    perMonth: '¥K/mo',
    perYear: '€K/yr',
    tryAgain: 'Edit Resume',
    noSkills: 'No matching skills found. Try adding more details about your experience, tools, and certifications.',
    poweredBy: 'Powered by keyword matching across 200+ career roles and 150+ skill categories',
  },
  de: {
    hero: 'Entdecke deinen Karrierewert',
    sub: 'Füge deinen Lebenslauf ein oder beschreibe deine Erfahrung — wir matchen dich sofort mit den bestbezahlten Rollen in 9 Branchen.',
    placeholder: 'Lebenslauf hier einfügen oder Skills und Erfahrung beschreiben...\n\nBeispiel:\n• 5 Jahre Qualitätsingenieur Automotive bei Tier-1 Zulieferer\n• IATF 16949, FMEA, SPC, VDA 6.3 Audit\n• CATIA V5, SolidWorks, GD&T\n• Lean Manufacturing, Six Sigma Green Belt\n• Python für Datenanalyse, SQL\n• Deutsch Muttersprache, Englisch fließend',
    analyze: 'Skills analysieren',
    skip: 'Überspringen — Branchen direkt durchstöbern',
    stats: ['200+ Rollen bewertet', '9 Branchen', '5 Karrierestufen', 'CN + DE Märkte'],
    footer: 'Daten von BLS, O*NET, Eurostat, Hays, Michael Page. Kostenlos & Open Source.',
    extracting: 'Analysiere...',
    skillsFound: 'Skills identifiziert',
    topMatches: 'Deine Top-Branchenmatches',
    matchLabel: 'Match',
    avgSalary: 'Ø Gehalt',
    rolesLabel: 'Rollen',
    viewAll: 'Branchendetails ansehen',
    perMonth: '¥K/Mo',
    perYear: '€K/Jahr',
    tryAgain: 'Lebenslauf bearbeiten',
    noSkills: 'Keine passenden Skills gefunden. Versuche mehr Details zu Erfahrung, Tools und Zertifikaten.',
    poweredBy: 'Basierend auf Keyword-Matching über 200+ Karriererollen und 150+ Skill-Kategorien',
  },
  zh: {
    hero: '发现你的职业价值',
    sub: '粘贴简历或描述你的经验 — 我们立刻匹配你到9大行业中薪资最高的岗位。',
    placeholder: '在此粘贴简历，或描述你的技能和经验...\n\n示例：\n• 5年一级供应商汽车质量工程师\n• IATF 16949, FMEA, SPC, VDA 6.3审核经验\n• CATIA V5, SolidWorks, GD&T\n• 精益生产, 六西格玛绿带\n• Python数据分析, SQL\n• 德语B1, 英语流利',
    analyze: '分析我的技能',
    skip: '跳过 — 直接浏览行业',
    stats: ['200+ 岗位排名', '9 大行业', '5 级职业阶梯', '中国 + 德国市场'],
    footer: '数据来源：BLS, O*NET, Eurostat, Hays, Michael Page。免费开源。',
    extracting: '分析中...',
    skillsFound: '个技能已识别',
    topMatches: '你的行业匹配排名',
    matchLabel: '匹配度',
    avgSalary: '平均薪资',
    rolesLabel: '个岗位',
    viewAll: '查看行业详情',
    perMonth: '¥K/月',
    perYear: '€K/年',
    tryAgain: '修改简历',
    noSkills: '未找到匹配技能。请尝试添加更多关于工作经验、工具和证书的描述。',
    poweredBy: '基于200+职业岗位和150+技能分类的关键词匹配',
  },
};

function LangSwitcher() {
  const { locale, setLocale } = useLocale();
  const next: Locale = locale === 'en' ? 'de' : locale === 'de' ? 'zh' : 'en';
  const label = locale === 'en' ? 'DE' : locale === 'de' ? '中文' : 'EN';
  return (
    <button onClick={() => setLocale(next)}
      className="absolute top-6 right-6 px-3 py-1 text-xs border border-border rounded-full text-muted hover:text-foreground hover:border-accent transition-colors z-10">
      {label}
    </button>
  );
}

interface IndustryMatchResult {
  id: string;
  name: string;
  icon: string;
  match: number;
  avgSalaryCN: number;
  avgSalaryDE: number;
  roleCount: number;
}

export default function LandingPage() {
  const { locale } = useLocale();
  const { setUserSkills } = useSkills();
  const router = useRouter();
  const c = content[locale];

  const [resumeText, setResumeText] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [industryMatches, setIndustryMatches] = useState<IndustryMatchResult[]>([]);
  const [phase, setPhase] = useState<'input' | 'loading' | 'results'>('input');

  const handleAnalyze = useCallback(() => {
    if (!resumeText.trim()) return;

    setPhase('loading');

    // Small delay to show loading state
    setTimeout(() => {
      const skills = parseResume(resumeText);
      setExtractedSkills(skills);

      if (skills.length === 0) {
        setPhase('results');
        return;
      }

      // Save to global skills context
      setUserSkills(skills);

      // Calculate industry matches
      const matches: IndustryMatchResult[] = allIndustries.map(ind => {
        const nameKey = locale === 'zh' ? 'name_zh' : locale === 'de' ? 'name_de' : 'name';
        return {
          id: ind.id,
          name: ind[nameKey],
          icon: ind.icon,
          match: calcIndustryMatch(skills, ind),
          avgSalaryCN: ind.avg_salary_cn,
          avgSalaryDE: ind.avg_salary_de,
          roleCount: ind.roles.length,
        };
      });

      matches.sort((a, b) => b.match - a.match);
      setIndustryMatches(matches);
      setPhase('results');
    }, 300);
  }, [resumeText, locale, setUserSkills]);

  const handleReset = useCallback(() => {
    setPhase('input');
    setExtractedSkills([]);
    setIndustryMatches([]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <LangSwitcher />

      {/* Hero */}
      <header className="flex flex-col items-center px-4 pt-16 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
          <span className="gradient-text">{c.hero}</span>
        </h1>
        <p className="text-muted text-center max-w-2xl text-base mb-2">{c.sub}</p>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {c.stats.map(s => (
            <span key={s} className="px-3 py-1 bg-surface rounded-full text-[11px] text-muted border border-border">
              {s}
            </span>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-12">
        <div className="max-w-3xl mx-auto">

          {/* Phase: Input */}
          {phase === 'input' && (
            <div className="space-y-4">
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder={c.placeholder}
                className="w-full h-64 md:h-72 p-4 bg-card border border-border rounded-xl text-foreground text-sm leading-relaxed placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!resumeText.trim()}
                  className="flex-1 py-3 px-6 bg-accent text-white font-semibold rounded-xl hover:bg-accent-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  {c.analyze}
                </button>
                <button
                  onClick={() => router.push('/industries')}
                  className="py-3 px-6 border border-border text-muted rounded-xl hover:text-foreground hover:border-accent/50 transition-colors text-sm"
                >
                  {c.skip}
                </button>
              </div>
              <p className="text-center text-[11px] text-muted/60">{c.poweredBy}</p>
            </div>
          )}

          {/* Phase: Loading */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted text-sm">{c.extracting}</p>
            </div>
          )}

          {/* Phase: Results */}
          {phase === 'results' && (
            <div className="space-y-6">
              {/* Skills summary */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {extractedSkills.length > 0
                      ? `${extractedSkills.length} ${c.skillsFound}`
                      : c.noSkills.split('.')[0]
                    }
                  </h2>
                  <button onClick={handleReset} className="text-xs text-accent hover:underline">
                    {c.tryAgain}
                  </button>
                </div>

                {extractedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {extractedSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">{c.noSkills}</p>
                )}
              </div>

              {/* Industry matches */}
              {industryMatches.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">{c.topMatches}</h2>
                  <div className="space-y-3">
                    {industryMatches.map((ind, i) => (
                      <button
                        key={ind.id}
                        onClick={() => router.push(`/industries?focus=${ind.id}`)}
                        className="w-full bg-card border border-border rounded-xl p-4 hover:border-accent/40 hover:shadow-sm transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank + Icon */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-muted text-xs font-mono w-5 text-right">#{i + 1}</span>
                            <span className="text-2xl">{ind.icon}</span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground text-sm">{ind.name}</span>
                              <span className="text-[11px] text-muted">{ind.roleCount} {c.rolesLabel}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted">
                              <span>{c.avgSalary}: {ind.avgSalaryCN}{c.perMonth}</span>
                              <span className="text-border">|</span>
                              <span>{ind.avgSalaryDE}{c.perYear}</span>
                            </div>
                          </div>

                          {/* Match bar */}
                          <div className="shrink-0 w-28 text-right">
                            <div className="text-sm font-bold mb-1" style={{
                              color: ind.match >= 40 ? 'var(--accent)' : ind.match >= 20 ? '#f59e0b' : 'var(--muted)'
                            }}>
                              {ind.match}% {c.matchLabel}
                            </div>
                            <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(ind.match, 3)}%`,
                                  backgroundColor: ind.match >= 40 ? 'var(--accent)' : ind.match >= 20 ? '#f59e0b' : 'var(--muted)',
                                }}
                              />
                            </div>
                          </div>

                          {/* Arrow */}
                          <svg className="w-4 h-4 text-muted group-hover:text-accent transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="text-center mt-6">
                    <button
                      onClick={() => router.push('/industries')}
                      className="inline-flex items-center gap-2 py-2.5 px-5 bg-accent/10 text-accent text-sm font-medium rounded-xl hover:bg-accent/20 transition-colors"
                    >
                      {c.viewAll}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 border-t border-border text-center text-xs text-muted">
        {c.footer}
      </footer>
    </div>
  );
}
