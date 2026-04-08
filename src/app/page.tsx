'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { analyzeResume, isAIAvailable } from '@/lib/ai';
import type { CareerProfile } from '@/lib/ai';
import { allIndustries } from '@/lib/career-map';
import { calcRoleMatch } from '@/lib/resume-parser';
import { skillCategories } from '@/lib/data';
import { analyzeSuperposition, getAiReplacementRate } from '@/lib/superposition';
import type { SuperpositionState } from '@/lib/superposition';
import { useCart } from '@/lib/cart-context';
import { parseResumeFile, SUPPORTED_FORMATS, FORMAT_LABEL } from '@/lib/file-parser';
import { generateFollowUps, calculatePrecision } from '@/lib/follow-up-questions';
import type { FollowUpQuestion } from '@/lib/follow-up-questions';
import type { Locale } from '@/lib/i18n';
import { Navbar } from '@/components/Navbar';

/* ─── i18n ─── */
const ui = {
  en: {
    hero: 'Who Am I?',
    heroSub: 'Career Intelligence for Engineers',
    sub: 'Paste your resume — AI analyzes your career profile, skills, and market value across 9 industries.',
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
    skillRadar: 'Skill Radar',
    marketValue: 'Market Valuation',
    matchMatrix: 'Industry × Role Match Matrix',
    matrixHint: 'Click any industry to explore roles and add them to your plan',
    editResume: 'Edit Resume',
    stats: ['9 Industries', '60+ Roles', '5 Career Levels', 'CN + DE Markets'],
    footer: 'Data from BLS, O*NET, Eurostat, Hays, Michael Page. Free & open source.',
    aiPowered: 'Powered by Qwen AI',
    rulesPowered: 'Skill matching (AI available when API key configured)',
    noSkills: 'Could not identify skills. Try adding more detail about your tools, certifications, and experience.',
    perMonth: '/mo',
    perYear: '/yr',
    viewIndustry: 'View details',
    ctaTitle: 'Ready to explore?',
    ctaSub: 'Browse industries and add target roles to your career plan',
    ctaBtn: 'Explore Industries & Jobs',
    salaryEstimate: 'Estimated salary range',
    skillCoverage: 'Skill coverage',
    topMatch: 'Best match industry',
    empowering: 'Your experience is more valuable than you think',
    empoweringZh: '',
    tabPaste: 'Paste Text',
    tabUpload: 'Upload File',
    tabUrl: 'From URL',
    dropHint: 'Drag & drop your resume here, or click to browse',
    dropFormats: `Supports ${FORMAT_LABEL}`,
    uploadSuccess: 'File loaded successfully',
    uploadError: 'Could not read file. Try pasting the text instead.',
    urlPlaceholder: 'https://linkedin.com/in/your-profile',
    urlHint: 'Due to platform restrictions, we cannot directly import from LinkedIn. Please use the export feature on LinkedIn to download your profile as PDF, then upload it here.',
    urlExportGuide: 'How to export: LinkedIn → Your Profile → More → Save to PDF',
    // Progressive reveal
    scanStep1: 'Scanning resume...',
    scanStep2a: 'Found ',
    scanStep2b: ' skills across ',
    scanStep2c: ' industries',
    scanStep3: 'Superposition detected!',
    scanStep4: 'Full analysis ready',
    precision: 'Analysis Depth',
    precisionHint: 'Answer follow-up questions to increase precision',
    followUpTitle: 'Smart Follow-Up',
    followUpSub: 'A few targeted questions to sharpen your analysis',
    followUpSkip: 'Skip — results are good enough',
    followUpAnswer: 'Confirm',
    salaryNarrow: 'Salary estimate narrows as precision increases',
  },
  de: {
    hero: 'Wer bin ich?',
    heroSub: 'Karriere-Intelligenz für Ingenieure',
    sub: 'Lebenslauf einfügen — KI analysiert dein Profil, Fähigkeiten und Marktwert in 9 Branchen.',
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
    skillRadar: 'Kompetenz-Radar',
    marketValue: 'Marktwert',
    matchMatrix: 'Branche × Rolle Match-Matrix',
    matrixHint: 'Klicke auf eine Branche für Details und füge Rollen zum Plan hinzu',
    editResume: 'Lebenslauf bearbeiten',
    stats: ['9 Branchen', '60+ Rollen', '5 Karrierestufen', 'CN + DE Märkte'],
    footer: 'Daten von BLS, O*NET, Eurostat, Hays, Michael Page. Kostenlos & Open Source.',
    aiPowered: 'Powered by Qwen KI',
    rulesPowered: 'Skill-Matching (KI verfügbar mit API-Key)',
    noSkills: 'Keine Skills erkannt. Mehr Details zu Tools, Zertifikaten und Erfahrung hinzufügen.',
    perMonth: '/Mo',
    perYear: '/Jahr',
    viewIndustry: 'Details ansehen',
    ctaTitle: 'Bereit loszulegen?',
    ctaSub: 'Branchen durchsuchen und Zielrollen zum Karriereplan hinzufügen',
    ctaBtn: 'Branchen & Jobs erkunden',
    salaryEstimate: 'Geschätztes Gehalt',
    skillCoverage: 'Kompetenzabdeckung',
    topMatch: 'Beste Branche',
    empowering: 'Deine Erfahrung ist wertvoller als du denkst',
    empoweringZh: '',
    tabPaste: 'Text einfügen',
    tabUpload: 'Datei hochladen',
    tabUrl: 'Von URL',
    dropHint: 'Lebenslauf hierher ziehen oder klicken',
    dropFormats: `Unterstützt ${FORMAT_LABEL}`,
    uploadSuccess: 'Datei erfolgreich geladen',
    uploadError: 'Datei konnte nicht gelesen werden. Versuche den Text einzufügen.',
    urlPlaceholder: 'https://linkedin.com/in/dein-profil',
    urlHint: 'Aufgrund von Plattformbeschränkungen können wir nicht direkt von LinkedIn importieren. Bitte exportiere dein Profil als PDF und lade es hier hoch.',
    urlExportGuide: 'So exportierst du: LinkedIn → Dein Profil → Mehr → Als PDF speichern',
    scanStep1: 'Lebenslauf wird gescannt...',
    scanStep2a: '',
    scanStep2b: ' Fähigkeiten in ',
    scanStep2c: ' Branchen gefunden',
    scanStep3: 'Superposition erkannt!',
    scanStep4: 'Vollständige Analyse bereit',
    precision: 'Analysetiefe',
    precisionHint: 'Beantworte Rückfragen für präzisere Ergebnisse',
    followUpTitle: 'Intelligente Rückfragen',
    followUpSub: 'Gezielte Fragen für eine schärfere Analyse',
    followUpSkip: 'Überspringen — Ergebnisse sind ausreichend',
    followUpAnswer: 'Bestätigen',
    salaryNarrow: 'Gehaltsschätzung wird mit steigender Präzision genauer',
  },
  zh: {
    hero: '我是谁？',
    heroSub: '工程师职业情报平台',
    sub: '粘贴简历 — AI分析你的职业画像、技能和市场价值。',
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
    skillRadar: '技能雷达',
    marketValue: '市场估值',
    matchMatrix: '行业 × 岗位匹配矩阵',
    matrixHint: '点击行业探索岗位，将目标岗位加入你的职业计划',
    editResume: '修改简历',
    stats: ['9大行业', '60+岗位', '5级职业阶梯', '中德双市场'],
    footer: '数据来源：BLS, O*NET, Eurostat, Hays, Michael Page。免费开源。',
    aiPowered: '由通义千问AI驱动',
    rulesPowered: '技能匹配模式（配置API密钥后启用AI）',
    noSkills: '未识别到技能。请添加更多关于工具、证书和工作经验的描述。',
    perMonth: '/月',
    perYear: '/年',
    viewIndustry: '查看详情',
    ctaTitle: '准备好了吗？',
    ctaSub: '浏览行业，将目标岗位加入职业计划',
    ctaBtn: '去看行业与岗位',
    salaryEstimate: '预估薪资范围',
    skillCoverage: '技能覆盖率',
    topMatch: '最匹配行业',
    empowering: '你的经验比你想象的更有价值',
    empoweringZh: '',
    tabPaste: '粘贴文本',
    tabUpload: '上传文件',
    tabUrl: '从链接导入',
    dropHint: '拖拽简历到此处，或点击选择文件',
    dropFormats: `支持 ${FORMAT_LABEL}`,
    uploadSuccess: '文件加载成功',
    uploadError: '无法读取文件，请尝试直接粘贴文本。',
    urlPlaceholder: 'https://linkedin.com/in/your-profile',
    urlHint: '由于平台限制，我们无法直接从LinkedIn导入。请在LinkedIn上导出你的简历PDF，然后上传到这里。',
    urlExportGuide: '导出方法：LinkedIn → 你的主页 → 更多 → 保存为PDF',
    scanStep1: '正在扫描简历...',
    scanStep2a: '发现 ',
    scanStep2b: ' 项技能，跨越 ',
    scanStep2c: ' 个行业',
    scanStep3: '检测到能力叠加态！',
    scanStep4: '完整分析就绪',
    precision: '分析精度',
    precisionHint: '回答追问可提升分析精度',
    followUpTitle: '智能追问',
    followUpSub: '几个精准问题，让诊断更深入',
    followUpSkip: '跳过 — 当前结果已足够',
    followUpAnswer: '确认',
    salaryNarrow: '精度越高，薪资预估越窄',
  },
};

/* ─── Analysis Depth Bar ─── */
function AnalysisDepthBar({ precision, locale, onBoost }: {
  precision: number; locale: string; onBoost?: () => void;
}) {
  const isZh = locale === 'zh';
  const isDe = locale === 'de';
  const c = ui[locale as keyof typeof ui];

  const color = precision >= 80 ? 'bg-emerald-500' : precision >= 60 ? 'bg-blue-500' : 'bg-amber-500';
  const textColor = precision >= 80 ? 'text-emerald-700' : precision >= 60 ? 'text-blue-700' : 'text-amber-700';
  const label = precision >= 80
    ? (isZh ? '高精度分析' : isDe ? 'Hochpräzise Analyse' : 'High-Precision Analysis')
    : precision >= 60
    ? (isZh ? '增强分析' : isDe ? 'Erweiterte Analyse' : 'Enhanced Analysis')
    : (isZh ? '基础分析' : isDe ? 'Basisanalyse' : 'Basic Analysis');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">🔬</span>
          <span className="text-xs font-bold text-slate-900">{c.precision}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${textColor}`}>{label}</span>
          <span className={`text-lg font-bold ${textColor}`}>{precision}%</span>
        </div>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${precision}%` }} />
      </div>
      {precision < 80 && onBoost && (
        <button onClick={onBoost}
          className="mt-2 text-[10px] text-blue-600 hover:text-blue-800 hover:underline transition-colors">
          {c.precisionHint} →
        </button>
      )}
    </div>
  );
}

/* ─── Follow-Up Dialog ─── */
function FollowUpDialog({ questions, locale, onAnswer, onSkip }: {
  questions: FollowUpQuestion[];
  locale: string;
  onAnswer: (questionId: string, answer: string) => void;
  onSkip: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const c = ui[locale as keyof typeof ui];
  const isZh = locale === 'zh';

  if (questions.length === 0 || currentIdx >= questions.length) return null;

  const q = questions[currentIdx];
  const lang = locale as 'en' | 'de' | 'zh';

  const handleSubmit = (answer: string) => {
    if (!answer.trim()) return;
    onAnswer(q.id, answer);
    setAnswered(prev => new Set(prev).add(q.id));
    setTextInput('');
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onSkip(); // all done
    }
  };

  const handleQuickOption = (option: { en: string; de: string; zh: string }) => {
    handleSubmit(option[lang]);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🩺</span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{c.followUpTitle}</h3>
            <p className="text-[10px] text-slate-500">{c.followUpSub}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">
            {currentIdx + 1}/{questions.length}
          </span>
          <button onClick={onSkip} className="text-[10px] text-slate-400 hover:text-slate-600 underline">
            {c.followUpSkip}
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 mb-3">
        <p className="text-sm text-slate-800 font-medium leading-relaxed">
          {q.question[lang]}
        </p>

        {/* Quick options */}
        {q.quickOptions && (
          <div className="flex flex-wrap gap-2 mt-3">
            {q.quickOptions.map((opt, i) => (
              <button key={i} onClick={() => handleQuickOption(opt)}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors font-medium">
                {opt[lang]}
              </button>
            ))}
          </div>
        )}

        {/* Text input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(textInput)}
            placeholder={q.placeholder[lang]}
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
          <button onClick={() => handleSubmit(textInput)} disabled={!textInput.trim()}
            className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">
            {c.followUpAnswer}
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {questions.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${
            i < currentIdx ? 'bg-blue-500' : i === currentIdx ? 'bg-blue-400 scale-125' : 'bg-slate-200'
          }`} />
        ))}
      </div>
    </div>
  );
}

/* ─── Progressive Reveal Scanner ─── */
function ScanReveal({ step, skills, locale }: {
  step: number; skills: string[]; locale: string;
}) {
  const c = ui[locale as keyof typeof ui];
  const isZh = locale === 'zh';

  // Count industries that have matching skills
  const matchedIndustries = useMemo(() => {
    if (skills.length === 0) return 0;
    const lower = skills.map(s => s.toLowerCase());
    let count = 0;
    for (const ind of allIndustries) {
      const hasMatch = ind.roles.some(r =>
        r.core_skills.some(cs => lower.some(s => s.includes(cs.toLowerCase()) || cs.toLowerCase().includes(s)))
      );
      if (hasMatch) count++;
    }
    return count;
  }, [skills]);

  const steps = [
    { icon: '🔍', text: c.scanStep1, color: 'text-slate-500' },
    { icon: '💡', text: `${c.scanStep2a}${skills.length}${c.scanStep2b}${matchedIndustries}${c.scanStep2c}`, color: 'text-blue-700' },
    { icon: '⚛', text: c.scanStep3, color: 'text-indigo-700' },
  ];

  return (
    <div className="flex flex-col items-center py-8 space-y-4">
      {steps.map((s, i) => (
        <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${
          i < step ? 'opacity-100 translate-y-0' : i === step ? 'opacity-100 translate-y-0 animate-pulse' : 'opacity-0 translate-y-4'
        }`}>
          {i < step ? (
            <span className="text-emerald-500 text-lg">✓</span>
          ) : i === step ? (
            <span className="text-lg">{s.icon}</span>
          ) : null}
          {i <= step && (
            <span className={`text-sm font-medium ${i < step ? 'text-slate-400' : s.color}`}>
              {s.text}
            </span>
          )}
        </div>
      ))}
      {step < 3 && (
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mt-4" />
      )}
    </div>
  );
}

/* ─── Skill Radar SVG ─── */
function SkillRadar({ skills, locale, precision = 100 }: { skills: string[]; locale: string; precision?: number }) {
  // Group skills by category
  const categoryScores = useMemo(() => {
    const scores: { name: string; name_zh: string; count: number; total: number }[] = [];
    for (const cat of skillCategories) {
      const catSkillNames = cat.skills.map(s => s.toLowerCase());
      const matched = skills.filter(s => catSkillNames.some(cs => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs)));
      if (cat.skills.length > 0) {
        scores.push({
          name: cat.name,
          name_zh: cat.name_zh,
          count: matched.length,
          total: cat.skills.length,
        });
      }
    }
    return scores.filter(s => s.count > 0 || s.total >= 3).slice(0, 8);
  }, [skills]);

  if (categoryScores.length < 3) return null;

  const isZh = locale === 'zh';
  const n = categoryScores.length;
  const cx = 150, cy = 150, maxR = 110;
  const angleStep = (Math.PI * 2) / n;

  // Calculate points for the radar polygon
  const points = categoryScores.map((s, i) => {
    const pct = s.total > 0 ? Math.min(s.count / Math.max(s.total * 0.3, 1), 1) : 0;
    const r = maxR * Math.max(pct, 0.08);
    const angle = angleStep * i - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid circles
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{isZh ? '技能雷达' : 'Skill Radar'}</h3>
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
        {/* Grid */}
        {gridLevels.map(l => (
          <circle key={l} cx={cx} cy={cy} r={maxR * l} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        ))}
        {/* Axes */}
        {categoryScores.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return (
            <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)}
              stroke="#e2e8f0" strokeWidth="0.5" />
          );
        })}
        {/* Filled polygon — opacity driven by precision */}
        <polygon points={polygon}
          fill={`rgba(59,130,246,${0.05 + (precision / 100) * 0.2})`}
          stroke="#3b82f6"
          strokeWidth="2"
          opacity={0.3 + (precision / 100) * 0.7}
          className="transition-all duration-700"
        />
        {/* Dots + labels */}
        {categoryScores.map((s, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const labelR = maxR + 18;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          return (
            <g key={i}>
              <circle cx={points[i].x} cy={points[i].y} r="3" fill="#3b82f6" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fill="#475569" fontSize="8" fontWeight="500">
                {isZh ? s.name_zh : s.name}
              </text>
              <text x={lx} y={ly + 10} textAnchor="middle" fill="#94a3b8" fontSize="7">
                {s.count}/{s.total}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Market Valuation Panel ─── */
function MarketValuation({ skills, profile, locale, c, precision = 100 }: {
  skills: string[]; profile: CareerProfile; locale: string; c: typeof ui.en; precision?: number;
}) {
  const isZh = locale === 'zh';

  // Find best matching industry and its top role
  const bestMatch = useMemo(() => {
    let best = { industry: allIndustries[0], match: 0, topRole: allIndustries[0].roles[0], roleMatch: 0 };
    for (const ind of allIndustries) {
      for (const role of ind.roles) {
        const m = calcRoleMatch(skills, role);
        if (m > best.roleMatch) {
          best = { industry: ind, match: m, topRole: role, roleMatch: m };
        }
      }
    }
    return best;
  }, [skills]);

  // Estimate salary based on profile level
  const levelIdx = { junior: 0, senior: 1, lead: 2, manager: 3, director: 4 }[profile.level] ?? 1;
  const salaryLevel = bestMatch.topRole.levels[levelIdx];
  const baseCN = salaryLevel?.salary_cn;
  const baseDE = salaryLevel?.salary_de;

  // Salary range narrows with precision: at 40% → ±30% spread, at 95% → ±5% spread
  const spreadFactor = 1 - (precision - 40) / 110; // 1.0 at 40%, ~0 at 95%
  const narrowRange = (base: { low: number; mid: number; high: number }) => {
    const extraSpread = Math.round((base.high - base.low) * 0.3 * spreadFactor);
    return {
      low: Math.max(base.low - extraSpread, Math.round(base.mid * 0.7)),
      high: base.high + extraSpread,
    };
  };
  const salaryCN = baseCN ? { ...baseCN, ...narrowRange(baseCN) } : baseCN;
  const salaryDE = baseDE ? { ...baseDE, ...narrowRange(baseDE) } : baseDE;

  // Overall skill coverage
  const totalUniqueSkills = new Set(skillCategories.flatMap(c => c.skills.map(s => s.toLowerCase())));
  const coverage = Math.round((skills.length / Math.max(totalUniqueSkills.size, 1)) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{isZh ? '市场估值' : 'Market Valuation'}</h3>

      {/* Empowering message */}
      <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4">
        {isZh ? '你的经验比你想象的更有价值' : c.empowering}
      </p>

      <div className="space-y-4">
        {/* Salary estimate */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">{c.salaryEstimate}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 mb-0.5">🇨🇳 China</div>
              <div className="text-lg font-bold text-blue-700 transition-all duration-500">
                ¥{salaryCN?.low}K-{salaryCN?.high}K<span className="text-xs text-slate-400 font-normal">{c.perMonth}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 mb-0.5">🇩🇪 Germany</div>
              <div className="text-lg font-bold text-blue-700 transition-all duration-500">
                €{salaryDE?.low}K-{salaryDE?.high}K<span className="text-xs text-slate-400 font-normal">{c.perYear}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skill coverage bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{c.skillCoverage}</span>
            <span className="text-xs font-bold text-blue-700">{skills.length} skills ({coverage}%)</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(coverage, 100)}%` }} />
          </div>
        </div>

        {/* Top match */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">{c.topMatch}</div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{bestMatch.industry.icon}</span>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {isZh ? bestMatch.industry.name_zh : bestMatch.industry.name}
              </div>
              <div className="text-xs text-slate-500">
                {isZh ? bestMatch.topRole.title_zh : bestMatch.topRole.title} — {bestMatch.roleMatch}% match
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        {isZh ? profile.summary_zh : profile.summary}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{isZh ? '行业背景' : 'Industry'}</div>
          <div className="text-sm font-semibold text-slate-900">{isZh ? profile.industry_zh : profile.industry}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{isZh ? '职能方向' : 'Function'}</div>
          <div className="text-sm font-semibold text-slate-900">{isZh ? profile.function_area_zh : profile.function_area}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{c.level}</div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColors[profile.level] || ''}`}>
            {isZh ? profile.level_zh : profile.level.toUpperCase()}
          </span>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{c.experience}</div>
          <div className="text-sm font-semibold text-slate-900">{profile.years_experience} {c.years}</div>
        </div>
      </div>
      <div className="mb-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">{c.coreStrengths}</div>
        <div className="flex flex-wrap gap-1.5">
          {profile.core_competencies.map(s => (
            <span key={s} className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">{s}</span>
          ))}
        </div>
      </div>
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

/* ─── Career Vital Signs — AI Risk + Skill Decay + German Salary ─── */
function CareerVitalSigns({ skills, profile, locale, precision = 100 }: {
  skills: string[]; profile: CareerProfile; locale: string; precision?: number;
}) {
  const isZh = locale === 'zh';
  const isDe = locale === 'de';

  // Calculate AI replacement risk based on skill composition
  const aiRiskAnalysis = useMemo(() => {
    const humanSkills = ['audit', 'vda', 'negotiation', 'leadership', 'fmea', 'customer',
      'supplier management', 'project management', 'functional safety', 'iso 26262',
      'iso 13485', 'root cause', 'cross-functional', 'stakeholder', 'homologation', 'regulatory'];
    const automatable = ['data entry', 'reporting', 'documentation', 'testing', 'inspection',
      'data analysis', 'sql', 'excel', 'power bi', 'spc', 'measurement'];

    let humanCount = 0;
    let autoCount = 0;
    for (const s of skills) {
      const lower = s.toLowerCase();
      if (humanSkills.some(h => lower.includes(h))) humanCount++;
      if (automatable.some(a => lower.includes(a))) autoCount++;
    }
    const total = Math.max(skills.length, 1);
    const humanRatio = humanCount / total;
    const autoRatio = autoCount / total;

    // Base risk 50%, adjusted by skill composition
    const risk = Math.max(5, Math.min(95, Math.round(50 - humanRatio * 40 + autoRatio * 30)));
    return { risk, humanCount, autoCount };
  }, [skills]);

  // Skill decay rate based on profile level and industry
  const decayAnalysis = useMemo(() => {
    const digitalSkills = ['python', 'ai', 'machine learning', 'ros', 'digital twin',
      'cloud', 'docker', 'kubernetes', 'iot', 'autosar', 'adas'];
    const digitalCount = skills.filter(s =>
      digitalSkills.some(d => s.toLowerCase().includes(d))
    ).length;
    const digitalRatio = digitalCount / Math.max(skills.length, 1);

    // Higher digital ratio = slower decay
    const annualDecay = Math.max(3, Math.round(18 - digitalRatio * 15));
    const yearsUntilObsolete = Math.round(100 / annualDecay);
    return { annualDecay, yearsUntilObsolete, digitalCount };
  }, [skills]);

  // German city salary estimates
  const germanSalary = useMemo(() => {
    // Find best matching role for salary estimate
    let bestRole = allIndustries[0].roles[0];
    let bestMatch = 0;
    for (const ind of allIndustries) {
      for (const role of ind.roles) {
        const m = calcRoleMatch(skills, role);
        if (m > bestMatch) { bestMatch = m; bestRole = role; }
      }
    }
    const levelIdx = { junior: 0, senior: 1, lead: 2, manager: 3, director: 4 }[profile.level] ?? 1;
    const salary = bestRole.levels[levelIdx]?.salary_de;
    // Munich premium +12%, Stuttgart +8%, Berlin -5%
    // Salary range narrows with precision
    const spreadFactor = 1 - (precision - 40) / 110;
    const extraSpread = Math.round((salary.high - salary.low) * 0.25 * spreadFactor);
    return {
      munich: { low: Math.round(salary.low * 1.12) - extraSpread, high: Math.round(salary.high * 1.12) + extraSpread },
      stuttgart: { low: Math.round(salary.low * 1.08) - extraSpread, high: Math.round(salary.high * 1.08) + extraSpread },
      berlin: { low: Math.round(salary.low * 0.95) - extraSpread, high: Math.round(salary.high * 0.95) + extraSpread },
      role: bestRole,
    };
  }, [skills, profile, precision]);

  const riskColor = aiRiskAnalysis.risk >= 60 ? 'text-red-700' : aiRiskAnalysis.risk >= 35 ? 'text-amber-700' : 'text-emerald-700';
  const riskBg = aiRiskAnalysis.risk >= 60 ? 'bg-red-500' : aiRiskAnalysis.risk >= 35 ? 'bg-amber-500' : 'bg-emerald-500';
  const decayColor = decayAnalysis.annualDecay >= 12 ? 'text-red-700' : decayAnalysis.annualDecay >= 7 ? 'text-amber-700' : 'text-emerald-700';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💓</span>
        <h2 className="text-base font-bold text-slate-900">
          {isZh ? '职业心电图' : isDe ? 'Karriere-Vitalzeichen' : 'Career Vital Signs'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Replacement Risk */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
            {isZh ? 'AI替代风险指数' : isDe ? 'KI-Ersetzungsrisiko' : 'AI Replacement Risk'}
          </div>
          <div className={`text-3xl font-bold ${riskColor} mb-2`}>
            {aiRiskAnalysis.risk}%
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div className={`h-full ${riskBg} rounded-full transition-all`}
              style={{ width: `${aiRiskAnalysis.risk}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {aiRiskAnalysis.risk >= 60
              ? (isZh ? '⚠ 你的核心技能自动化风险较高。建议补充"人类优势"技能（审核、谈判、跨部门协调）。'
                : '⚠ High automation risk. Consider adding human-advantage skills (audit, negotiation, cross-functional coordination).')
              : aiRiskAnalysis.risk >= 35
              ? (isZh ? '→ 中等风险。你有一些不可替代的技能，但可以更强。'
                : '→ Moderate risk. You have some irreplaceable skills, but can improve.')
              : (isZh ? '✓ 你的技能组合具有较强的AI抗性。'
                : '✓ Your skill mix has strong AI resilience.')
            }
          </p>
        </div>

        {/* Skill Decay Rate */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
            {isZh ? '技能衰减速率' : isDe ? 'Kompetenz-Halbwertszeit' : 'Skill Decay Rate'}
          </div>
          <div className={`text-3xl font-bold ${decayColor} mb-2`}>
            -{decayAnalysis.annualDecay}%<span className="text-sm font-normal text-slate-400">/{isZh ? '年' : 'yr'}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${
                i < Math.ceil(decayAnalysis.annualDecay / 4) ? 'bg-red-400' : 'bg-slate-200'
              }`} />
            ))}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {decayAnalysis.annualDecay >= 12
              ? (isZh
                ? `⚠ 你的核心技能在当前市场的活跃度正以每年${decayAnalysis.annualDecay}%的速度衰减。补充${decayAnalysis.digitalCount > 0 ? '更多' : ''}数字化技能可显著降低。`
                : `⚠ Your core skills are losing market relevance at ${decayAnalysis.annualDecay}%/year. Add digital skills to slow this.`)
              : (isZh
                ? `✓ 你有${decayAnalysis.digitalCount}项数字化技能，衰减较慢。约${decayAnalysis.yearsUntilObsolete}年内保持竞争力。`
                : `✓ ${decayAnalysis.digitalCount} digital skills detected. Competitive for ~${decayAnalysis.yearsUntilObsolete} years.`)
            }
          </p>
        </div>

        {/* German Market Value */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
            {isZh ? '德国猎头询价区间' : isDe ? 'Headhunter-Preisbereich' : 'German Headhunter Range'}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">🏙 München</span>
              <span className="text-sm font-bold text-blue-700 transition-all duration-500">€{germanSalary.munich.low}K-{germanSalary.munich.high}K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">🏭 Stuttgart</span>
              <span className="text-sm font-bold text-blue-700 transition-all duration-500">€{germanSalary.stuttgart.low}K-{germanSalary.stuttgart.high}K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">🏛 Berlin</span>
              <span className="text-sm font-bold text-blue-700 transition-all duration-500">€{germanSalary.berlin.low}K-{germanSalary.berlin.high}K</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {isZh ? `基于 ${profile.level} 级 ${germanSalary.role.title} · 年薪(€K)` : `Based on ${profile.level} ${germanSalary.role.title} · annual (€K)`}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Superposition Panel ─── */
function SuperpositionPanel({ skills, profile, locale }: {
  skills: string[]; profile: CareerProfile; locale: string;
}) {
  const { addToCart, isInCart } = useCart();
  const router = useRouter();
  const isZh = locale === 'zh';

  const states = useMemo(() => {
    // Detect current industry from profile
    const currentIndId = allIndustries.find(i =>
      i.name.toLowerCase().includes(profile.industry.toLowerCase()) ||
      profile.industry.toLowerCase().includes(i.name.toLowerCase()) ||
      (profile.industry_zh && i.name_zh.includes(profile.industry_zh))
    )?.id;
    return analyzeSuperposition(skills, currentIndId);
  }, [skills, profile]);

  if (states.length === 0) return null;

  const currentAiRate = getAiReplacementRate('medium'); // default assumption

  const riskColor = (risk: string) =>
    risk === 'low' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    risk === 'medium' ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">⚛</span>
        <h2 className="text-lg font-bold text-slate-900">
          {isZh ? '你的能力叠加态' : locale === 'de' ? 'Deine Kompetenz-Superposition' : 'Your Skill Superposition'}
        </h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        {isZh
          ? '你离一个全新的职业身份，可能只差1-3个技能'
          : 'You might be just 1-3 skills away from a completely new career identity'}
      </p>

      <div className="space-y-3">
        {states.map((s, idx) => {
          const inCart = isInCart(s.role.id);
          return (
            <div key={s.role.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.industry.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {isZh ? s.role.title_zh : s.role.title}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isZh ? s.industry.name_zh : s.industry.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                    {isZh ? `差${s.gapCount}个技能` : `${s.gapCount} skill${s.gapCount > 1 ? 's' : ''} away`}
                  </span>
                  <button
                    onClick={() => { inCart ? router.push('/plan') : addToCart(s.role.id, s.industry.id); }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      inCart
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border border-indigo-200'
                    }`}
                    title={inCart ? 'View plan' : 'Add to plan'}
                  >
                    {inCart ? '✓' : '+'}
                  </button>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    {isZh ? 'AI替代率' : 'AI Risk'}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs text-red-400 line-through">{currentAiRate}%</span>
                    <span className="text-xs text-slate-400">→</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${riskColor(s.targetAiRisk)}`}>
                      {getAiReplacementRate(s.targetAiRisk)}%
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    {isZh ? '薪资提升' : 'Salary'}
                  </div>
                  <div className={`text-sm font-bold ${s.salaryUplift > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {s.salaryUplift > 0 ? `+${s.salaryUplift}%` : '—'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    {isZh ? '增长前景' : 'Growth'}
                  </div>
                  <div className={`text-sm font-bold ${s.growthOutlook === 'high' ? 'text-emerald-700' : s.growthOutlook === 'medium' ? 'text-amber-600' : 'text-slate-500'}`}>
                    {s.growthOutlook === 'high' ? '🔥' : s.growthOutlook === 'medium' ? '→' : '↓'}
                    {isZh
                      ? (s.growthOutlook === 'high' ? ' 高' : s.growthOutlook === 'medium' ? ' 中' : ' 低')
                      : ` ${s.growthOutlook.charAt(0).toUpperCase() + s.growthOutlook.slice(1)}`}
                  </div>
                </div>
              </div>

              {/* Gap skills */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                  {isZh ? '补上这些技能即可转型' : 'Learn these to transition'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.gapSkills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 text-[10px] rounded-full bg-red-50 text-red-700 border border-red-200 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Already have */}
              <div className="mt-2">
                <div className="text-[10px] text-emerald-600 mb-1">
                  ✓ {isZh ? `你已具备 ${s.haveSkills.length} 项相关技能` : `You already have ${s.haveSkills.length} relevant skills`}
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.haveSkills.slice(0, 6).map(skill => (
                    <span key={skill} className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {skill}
                    </span>
                  ))}
                  {s.haveSkills.length > 6 && <span className="text-[10px] text-slate-400">+{s.haveSkills.length - 6}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Match Matrix ─── */
function MatchMatrix({ skills, locale, c, onNavigate }: {
  skills: string[]; locale: string; c: typeof ui.en;
  onNavigate: (industryId: string) => void;
}) {
  const isZh = locale === 'zh';
  const matrix = allIndustries.map(ind => {
    const roleMatches = ind.roles.map(r => ({
      role: r,
      match: calcRoleMatch(skills, r),
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
            <div className="grid grid-cols-3 gap-2">
              {topRoles.map(({ role, match }) => (
                <button key={role.id} onClick={() => onNavigate(ind.id)}
                  className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${matchColor(match)}`}>{match}%</span>
                    {role.growth_outlook === 'high' && <span className="text-[10px]">🔥</span>}
                  </div>
                  <div className="text-xs font-medium text-slate-800 truncate">{isZh ? role.title_zh : role.title}</div>
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
  const [phase, setPhase] = useState<'input' | 'loading' | 'scanning' | 'results'>('input');
  const [scanStep, setScanStep] = useState(0); // 0=scanning, 1=found skills, 2=superposition detected
  const [inputTab, setInputTab] = useState<'paste' | 'upload' | 'url'>('paste');
  const [fileStatus, setFileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Follow-up & precision state
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([]);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const precision = calculatePrecision(answeredIds);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim()) return;
    setPhase('loading');
    try {
      const result = await analyzeResume(resumeText);
      setSkills(result.skills);
      setProfile(result.profile);
      setMode(result.mode);
      setUserSkills(result.skills);

      // Generate follow-up questions based on detected skills
      const fups = generateFollowUps(result.skills, 3);
      setFollowUps(fups);
      setAnsweredIds([]);
      setShowFollowUp(fups.length > 0);

      // Progressive reveal: scanning phase
      setPhase('scanning');
      setScanStep(0);

      // Step 1: "Found N skills" — after real analysis is done, show quickly
      setTimeout(() => setScanStep(1), 800);
      // Step 2: "Superposition detected!" — dramatic pause
      setTimeout(() => setScanStep(2), 2000);
      // Step 3: Transition to results
      setTimeout(() => setPhase('results'), 3000);
    } catch {
      setPhase('input');
    }
  }, [resumeText, setUserSkills]);

  const handleFile = useCallback(async (file: File) => {
    setFileStatus('loading');
    setFileName(file.name);
    try {
      const text = await parseResumeFile(file);
      if (text.trim().length < 10) throw new Error('Empty');
      setResumeText(text);
      setFileStatus('success');
      setInputTab('paste'); // switch to paste tab to show extracted text
    } catch {
      setFileStatus('error');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleNavigate = useCallback((industryId: string) => {
    router.push(`/industries?focus=${industryId}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <header className="flex flex-col items-center px-4 pt-10 pb-4">
        <div className="text-3xl mb-2">🔬</div>
        <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-1">
          {c.hero}
        </h1>
        <p className="text-sm text-blue-600 font-medium mb-2">{c.heroSub}</p>
        <p className="text-slate-500 text-center max-w-xl text-sm mb-3">{c.sub}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {c.stats.map(s => (
            <span key={s} className="px-2.5 py-1 bg-white rounded-full text-[10px] text-slate-500 border border-slate-200">{s}</span>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 pb-10">
        <div className="max-w-5xl mx-auto">

          {/* Phase: Input */}
          {phase === 'input' && (
            <div className="space-y-4 mt-4">
              {/* Input tabs */}
              <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 w-fit mx-auto">
                {([
                  { id: 'paste' as const, label: c.tabPaste, icon: '📝' },
                  { id: 'upload' as const, label: c.tabUpload, icon: '📄' },
                  { id: 'url' as const, label: c.tabUrl, icon: '🔗' },
                ]).map(tab => (
                  <button key={tab.id} onClick={() => setInputTab(tab.id)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${inputTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab: Paste */}
              {inputTab === 'paste' && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative transition-all ${dragOver ? 'ring-2 ring-blue-400 ring-offset-2 rounded-xl' : ''}`}
                >
                  <textarea
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    placeholder={c.placeholder}
                    className="w-full h-56 md:h-64 p-4 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none shadow-sm"
                  />
                  {dragOver && (
                    <div className="absolute inset-0 bg-blue-50/90 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center">
                      <p className="text-sm font-medium text-blue-700">{c.dropHint}</p>
                    </div>
                  )}
                  {fileStatus === 'success' && fileName && (
                    <p className="text-xs text-emerald-600 mt-1">✓ {c.uploadSuccess}: {fileName}</p>
                  )}
                </div>
              )}

              {/* Tab: Upload */}
              {inputTab === 'upload' && (
                <label
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-56 md:h-64 bg-white border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                  }`}
                >
                  <input type="file" accept={SUPPORTED_FORMATS} onChange={handleFileInput} className="hidden" />
                  {fileStatus === 'loading' ? (
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-sm text-slate-500">{fileName}</p>
                    </div>
                  ) : fileStatus === 'success' ? (
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-2">✓</div>
                      <p className="text-sm font-medium text-emerald-700">{c.uploadSuccess}</p>
                      <p className="text-xs text-slate-500 mt-1">{fileName}</p>
                      <p className="text-xs text-blue-600 mt-2">{locale === 'zh' ? '已提取文本，点击"分析"开始' : 'Text extracted. Click Analyze to start.'}</p>
                    </div>
                  ) : fileStatus === 'error' ? (
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-2">✗</div>
                      <p className="text-sm text-red-600">{c.uploadError}</p>
                      <p className="text-xs text-slate-400 mt-2">{c.dropFormats}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-3">📄</div>
                      <p className="text-sm font-medium text-slate-700">{c.dropHint}</p>
                      <p className="text-xs text-slate-400 mt-2">{c.dropFormats}</p>
                    </div>
                  )}
                </label>
              )}

              {/* Tab: URL (guidance) */}
              {inputTab === 'url' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">🔗</div>
                    <p className="text-sm text-slate-700 leading-relaxed max-w-md mx-auto">{c.urlHint}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-xs font-medium text-blue-800 mb-2">{c.urlExportGuide}</p>
                    <div className="flex justify-center gap-3 text-xs">
                      <span className="px-3 py-1.5 bg-white rounded-lg border border-blue-200 text-blue-700">1. LinkedIn</span>
                      <span className="text-blue-400">→</span>
                      <span className="px-3 py-1.5 bg-white rounded-lg border border-blue-200 text-blue-700">2. {locale === 'zh' ? '更多' : 'More'}</span>
                      <span className="text-blue-400">→</span>
                      <span className="px-3 py-1.5 bg-white rounded-lg border border-blue-200 text-blue-700">3. {locale === 'zh' ? '保存为PDF' : 'Save as PDF'}</span>
                    </div>
                    <button onClick={() => setInputTab('upload')} className="mt-3 text-xs text-blue-600 hover:underline">
                      {locale === 'zh' ? '下载后点击这里上传 →' : 'After download, click here to upload →'}
                    </button>
                  </div>

                  {/* Also support BOSS直聘 and other CN platforms */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 text-center">
                      {locale === 'zh'
                        ? '也支持：BOSS直聘、猎聘、脉脉导出的简历PDF'
                        : 'Also supports: exported resume PDFs from BOSS, Liepin, StepStone, Xing'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleAnalyze} disabled={!resumeText.trim()}
                  className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-sm">
                  {c.analyze}
                </button>
                <button onClick={() => router.push('/industries')}
                  className="py-3 px-6 border border-slate-200 text-slate-500 rounded-xl hover:text-slate-900 hover:border-blue-300 transition-colors text-sm">
                  {c.skip}
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400">
                {isAIAvailable() ? c.aiPowered : c.rulesPowered}
              </p>
            </div>
          )}

          {/* Phase: Loading (initial API call) */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center py-24">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-sm">{c.analyzing}</p>
            </div>
          )}

          {/* Phase: Scanning (progressive reveal after data is ready) */}
          {phase === 'scanning' && skills.length > 0 && (
            <ScanReveal step={scanStep} skills={skills} locale={locale} />
          )}

          {/* Phase: Results */}
          {phase === 'results' && profile && (
            <div className="space-y-5 mt-2">
              {/* Header bar + Precision */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {skills.length} skills · {mode === 'ai' ? 'AI' : 'Rules'}
                  </span>
                  <button onClick={() => { setPhase('input'); setProfile(null); setShowFollowUp(false); setAnsweredIds([]); }} className="text-xs text-blue-600 hover:underline">
                    {c.editResume}
                  </button>
                </div>
                {/* Analysis Depth Bar — the "nerve center" */}
                <AnalysisDepthBar
                  precision={precision}
                  locale={locale}
                  onBoost={followUps.length > 0 && showFollowUp ? undefined : followUps.length > answeredIds.length ? () => setShowFollowUp(true) : undefined}
                />
              </div>

              {/* ★ FIRST: Career Vital Signs — the urgent signal */}
              <CareerVitalSigns skills={skills} profile={profile} locale={locale} precision={precision} />

              {/* ★ SECOND: Superposition Panel — the "aha moment" */}
              {skills.length > 0 && profile && (
                <SuperpositionPanel skills={skills} profile={profile} locale={locale} />
              )}

              {/* ★ THIRD: Follow-Up Dialog — the "smart doctor" */}
              {showFollowUp && followUps.length > answeredIds.length && (
                <FollowUpDialog
                  questions={followUps}
                  locale={locale}
                  onAnswer={(qId, answer) => {
                    setAnsweredIds(prev => [...prev, qId]);
                  }}
                  onSkip={() => setShowFollowUp(false)}
                />
              )}

              {/* ★ FOURTH: CTA to action */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
                <h3 className="text-base font-bold text-slate-900 mb-1">{c.ctaTitle}</h3>
                <p className="text-sm text-slate-500 mb-3">{c.ctaSub}</p>
                <button onClick={() => router.push('/industries')}
                  className="py-3 px-8 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm">
                  {c.ctaBtn} →
                </button>
              </div>

              {/* Career Profile (now below the fold — "about you") */}
              <ProfileCard profile={profile} locale={locale} c={c} />

              {/* Skill Radar + Market Valuation side by side — precision-driven */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SkillRadar skills={skills} locale={locale} precision={precision} />
                <MarketValuation skills={skills} profile={profile} locale={locale} c={c} precision={precision} />
              </div>

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
