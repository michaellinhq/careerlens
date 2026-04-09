'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useLocale } from '@/lib/locale-context';
import { useCart } from '@/lib/cart-context';
import { allIndustries } from '@/lib/career-map';
import {
  getShuffledScenarios, generateReport, RIASEC_META, RIASEC_DIMENSIONS,
} from '@/lib/personality';
import type { SliderAnswer, PersonalityReport, Scenario } from '@/lib/personality';

/* ─── i18n ─── */
const ui = {
  en: {
    title: 'Career Harmony Diagnostic',
    subtitle: 'Discover why some tasks drain you and others energize you',
    introP1: 'This is not a personality test. It\'s a diagnostic tool built by a 10-year automotive quality veteran.',
    introP2: 'You\'ll see 14 real engineering scenarios. For each, slide to show how you FEEL about doing this task. There are no right or wrong answers.',
    introP3: 'Takes about 3 minutes. All computation runs in your browser — no data leaves your device.',
    start: 'Begin Diagnostic',
    context: 'Scenario',
    sliderLeft: 'Dread this',
    sliderRight: 'Love this',
    sliderCenter: 'Neutral',
    next: 'Next',
    prev: 'Previous',
    finish: 'Generate Report',
    computing: 'Computing your career harmony profile...',
    yourType: 'Your engineer type',
    hollandCode: 'Holland Code',
    harmony: 'Career Harmony',
    harmonyWith: 'Harmony with',
    frictionSource: 'Friction source',
    energySource: 'Energy source',
    insight: 'Key Insight',
    recommendation: 'Recommended Direction',
    backToPlan: 'Apply to My Plan',
    retake: 'Retake Assessment',
    disclaimer: 'This assessment is for career exploration. It does not replace professional counseling.',
    noRoles: 'Add target roles first to see personalized harmony analysis.',
    goToIndustries: 'Browse Industries',
  },
  de: {
    title: 'Karriere-Harmonie-Diagnose',
    subtitle: 'Finden Sie heraus, warum manche Aufgaben Sie erschöpfen und andere beflügeln',
    introP1: 'Dies ist kein Persönlichkeitstest. Es ist ein Diagnosetool, entwickelt von einem 10-jährigen Automobil-Qualitätsveteranen.',
    introP2: 'Sie sehen 14 reale Ingenieur-Szenarien. Schieben Sie den Regler, um zu zeigen, wie Sie sich bei dieser Aufgabe FÜHLEN.',
    introP3: 'Dauert ca. 3 Minuten. Alle Berechnungen laufen in Ihrem Browser — keine Daten verlassen Ihr Gerät.',
    start: 'Diagnose starten',
    context: 'Szenario',
    sliderLeft: 'Ungern',
    sliderRight: 'Gerne',
    sliderCenter: 'Neutral',
    next: 'Weiter',
    prev: 'Zurück',
    finish: 'Bericht erstellen',
    computing: 'Ihr Karriere-Harmonie-Profil wird berechnet...',
    yourType: 'Ihr Ingenieur-Typ',
    hollandCode: 'Holland-Code',
    harmony: 'Karriere-Harmonie',
    harmonyWith: 'Harmonie mit',
    frictionSource: 'Reibungsquelle',
    energySource: 'Energiequelle',
    insight: 'Kernaussage',
    recommendation: 'Empfohlene Richtung',
    backToPlan: 'In meinen Plan übernehmen',
    retake: 'Erneut durchführen',
    disclaimer: 'Diese Bewertung dient der Karriereexploration und ersetzt keine professionelle Beratung.',
    noRoles: 'Fügen Sie zuerst Zielrollen hinzu.',
    goToIndustries: 'Branchen durchsuchen',
  },
  zh: {
    title: '职业内耗诊断',
    subtitle: '找到为什么有些工作让你精疲力尽，有些却让你充满干劲',
    introP1: '这不是性格测试。这是一个由10年汽车质量老兵设计的诊断工具。',
    introP2: '你会看到14个真实的工程场景。对每个场景，滑动滑块表示你对这项工作的真实感受。没有对错之分。',
    introP3: '大约3分钟。所有计算在你的浏览器中完成——没有数据离开你的设备。',
    start: '开始诊断',
    context: '场景',
    sliderLeft: '想到就头疼',
    sliderRight: '做这个很来劲',
    sliderCenter: '无感',
    next: '下一题',
    prev: '上一题',
    finish: '生成报告',
    computing: '正在计算你的职业和谐度...',
    yourType: '你的工程师类型',
    hollandCode: 'Holland代码',
    harmony: '职业和谐度',
    harmonyWith: '与岗位的和谐度',
    frictionSource: '内耗来源',
    energySource: '能量来源',
    insight: '核心洞察',
    recommendation: '建议方向',
    backToPlan: '应用到我的计划',
    retake: '重新测评',
    disclaimer: '本测评仅用于职业探索，不替代专业的职业咨询。',
    noRoles: '请先添加目标岗位，才能看到个性化的和谐度分析。',
    goToIndustries: '去浏览行业',
  },
};

/* ─── Emoji Slider ─── */
function EmotionSlider({ value, onChange, leftLabel, rightLabel, centerLabel }: {
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
  centerLabel: string;
}) {
  const pct = ((value + 50) / 100) * 100;
  const emoji = value <= -30 ? '😩' : value <= -10 ? '😕' : value <= 10 ? '😐' : value <= 30 ? '🙂' : '😊';
  const bgColor = value <= -20 ? 'from-red-100 to-slate-100'
    : value >= 20 ? 'from-slate-100 to-emerald-100'
    : 'from-slate-100 to-slate-100';

  return (
    <div className="space-y-2">
      <div className={`relative rounded-xl p-4 bg-gradient-to-r ${bgColor} transition-colors duration-300`}>
        {/* Emoji indicator */}
        <div className="text-center text-3xl mb-3 transition-all duration-200" style={{ transform: `scale(${1 + Math.abs(value) / 100})` }}>
          {emoji}
        </div>

        {/* Slider */}
        <input
          type="range"
          min={-50}
          max={50}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-600"
          style={{
            background: `linear-gradient(to right, #fca5a5 0%, #e2e8f0 50%, #86efac 100%)`,
          }}
        />

        {/* Center tick */}
        <div className="absolute left-1/2 bottom-[28px] w-[2px] h-3 bg-slate-300 -translate-x-1/2" />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[11px]">
        <span className="text-red-400">{leftLabel}</span>
        <span className="text-slate-400">{centerLabel}</span>
        <span className="text-emerald-500">{rightLabel}</span>
      </div>
    </div>
  );
}

/* ─── RIASEC Radar (pure CSS, no recharts dependency for this page) ─── */
function RIASECRadar({ profile, size = 200 }: { profile: { [K in import('@/lib/personality').RIASECDimension]: number }; size?: number }) {
  const dims = RIASEC_DIMENSIONS;
  const cx = size / 2, cy = size / 2, r = size / 2 - 30;

  const getPoint = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const polygonPoints = dims.map((_, i) => {
    const p = getPoint(i, profile[dims[i]]);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
      {/* Grid circles */}
      {[25, 50, 75, 100].map(v => (
        <circle key={v} cx={cx} cy={cy} r={(v / 100) * r} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}

      {/* Axis lines and labels */}
      {dims.map((dim, i) => {
        const p = getPoint(i, 100);
        const lp = getPoint(i, 120);
        const meta = RIASEC_META[dim];
        return (
          <g key={dim}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
              fontSize="10" fontWeight="600" fill={meta.color}>
              {dim} {profile[dim]}
            </text>
          </g>
        );
      })}

      {/* Data polygon */}
      <polygon points={polygonPoints} fill="#6366f1" fillOpacity="0.2" stroke="#6366f1" strokeWidth="2" />

      {/* Data points */}
      {dims.map((dim, i) => {
        const p = getPoint(i, profile[dim]);
        return <circle key={dim} cx={p.x} cy={p.y} r={4} fill={RIASEC_META[dim].color} />;
      })}
    </svg>
  );
}

/* ─── Main Page ─── */
export default function PersonalityAssessmentPage() {
  const { locale } = useLocale();
  const { cart } = useCart();
  const router = useRouter();
  const c = ui[locale];
  const isZh = locale === 'zh';

  const [stage, setStage] = useState<'intro' | 'testing' | 'computing' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [report, setReport] = useState<PersonalityReport | null>(null);

  // Shuffled scenarios — stable for the session
  const [shuffledScenarios] = useState<Scenario[]>(() => getShuffledScenarios());

  // Resolve cart → roles for harmony scoring
  const targetRoles = useMemo(() => {
    return cart.map(item => {
      const industry = allIndustries.find(i => i.id === item.industryId);
      const role = industry?.roles.find(r => r.id === item.roleId);
      if (!industry || !role) return null;
      return { role, industryName: isZh ? industry.name_zh : industry.name };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [cart, isZh]);

  const currentScenario = shuffledScenarios[currentQ];
  const currentValue = answers.get(currentScenario?.id) ?? 0;
  const progress = ((currentQ + 1) / shuffledScenarios.length) * 100;

  const handleSliderChange = useCallback((value: number) => {
    if (!currentScenario) return;
    setAnswers(prev => new Map(prev).set(currentScenario.id, value));
  }, [currentScenario]);

  const handleFinish = useCallback(() => {
    setStage('computing');
    // Simulate brief computation time for dramatic effect
    setTimeout(() => {
      const sliderAnswers: SliderAnswer[] = Array.from(answers.entries()).map(([scenarioId, value]) => ({
        scenarioId, value,
      }));
      const result = generateReport(sliderAnswers, targetRoles, isZh);
      setReport(result);
      // Save to localStorage
      try {
        localStorage.setItem('careerlens_personality', JSON.stringify(result));
      } catch { /* ignore */ }
      setStage('result');
    }, 1500);
  }, [answers, targetRoles, isZh]);

  // Load previous result
  useEffect(() => {
    try {
      const saved = localStorage.getItem('careerlens_personality');
      if (saved) {
        const parsed = JSON.parse(saved) as PersonalityReport;
        if (parsed.profile && parsed.archetype) {
          setReport(parsed);
          // Don't auto-show result — let user choose to retake or view
        }
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* ─── INTRO ─── */}
        {stage === 'intro' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🧠</div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{c.title}</h1>
              <p className="text-sm text-blue-600 font-medium">{c.subtitle}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <p className="text-sm text-slate-700 leading-relaxed">{c.introP1}</p>
              <p className="text-sm text-slate-700 leading-relaxed">{c.introP2}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{c.introP3}</p>
            </div>

            {targetRoles.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                ⚠️ {c.noRoles}
                <button onClick={() => router.push('/industries')} className="block mt-2 text-blue-600 hover:underline text-xs">
                  {c.goToIndustries} →
                </button>
              </div>
            )}

            <button onClick={() => setStage('testing')}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-base shadow-sm">
              {c.start} →
            </button>

            {report && (
              <button onClick={() => setStage('result')}
                className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                {isZh ? '查看上次结果' : 'View Previous Result'} ({report.archetype.emoji} {isZh ? report.archetype.name_zh : report.archetype.name})
              </button>
            )}
          </div>
        )}

        {/* ─── TESTING ─── */}
        {stage === 'testing' && currentScenario && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{c.context} {currentQ + 1}/{shuffledScenarios.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Scenario card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-base font-medium text-slate-900 leading-relaxed mb-3">
                {isZh ? currentScenario.text_zh : locale === 'de' ? currentScenario.text_de : currentScenario.text}
              </p>
              <p className="text-xs text-slate-500 italic">
                {isZh ? currentScenario.context_zh : locale === 'de' ? currentScenario.context_de : currentScenario.context}
              </p>
            </div>

            {/* Emotion slider */}
            <EmotionSlider
              value={currentValue}
              onChange={handleSliderChange}
              leftLabel={c.sliderLeft}
              rightLabel={c.sliderRight}
              centerLabel={c.sliderCenter}
            />

            {/* Navigation */}
            <div className="flex gap-3">
              {currentQ > 0 && (
                <button onClick={() => setCurrentQ(q => q - 1)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                  ← {c.prev}
                </button>
              )}
              {currentQ < shuffledScenarios.length - 1 ? (
                <button onClick={() => setCurrentQ(q => q + 1)}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  {c.next} →
                </button>
              ) : (
                <button onClick={handleFinish}
                  className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                  {c.finish}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── COMPUTING ─── */}
        {stage === 'computing' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-blue-600">{c.computing}</p>
          </div>
        )}

        {/* ─── RESULT ─── */}
        {stage === 'result' && report && (
          <div className="space-y-6">
            {/* Archetype hero */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
              <div className="text-5xl mb-3">{report.archetype.emoji}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{c.yourType}</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {isZh ? report.archetype.name_zh : locale === 'de' ? report.archetype.name_de : report.archetype.name}
              </h2>
              <p className="text-sm text-blue-600 font-medium mb-4">
                {isZh ? report.archetype.tagline_zh : report.archetype.tagline}
              </p>

              {/* Holland Code badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full">
                <span className="text-[10px] text-slate-500">{c.hollandCode}:</span>
                <span className="text-base font-mono font-bold text-indigo-700">{report.hollandCode}</span>
              </div>
            </div>

            {/* RIASEC Radar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 text-center">RIASEC Profile</h3>
              <RIASECRadar profile={report.profile} />
              <div className="grid grid-cols-3 gap-2 mt-4">
                {RIASEC_DIMENSIONS.map(dim => (
                  <div key={dim} className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RIASEC_META[dim].color }} />
                    <span className="text-slate-500">{isZh ? RIASEC_META[dim].name_zh : RIASEC_META[dim].name}</span>
                    <span className="font-mono font-bold text-slate-700">{report.profile[dim]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Energizers vs Drainers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
                  {isZh ? '能量来源' : 'What Energizes You'}
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {isZh ? report.archetype.energizers_zh : report.archetype.energizers}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2">
                  {isZh ? '内耗来源' : 'What Drains You'}
                </div>
                <p className="text-xs text-red-900 leading-relaxed">
                  {isZh ? report.archetype.drainers_zh : report.archetype.drainers}
                </p>
              </div>
            </div>

            {/* Key Insight */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">💡 {c.insight}</div>
              <p className="text-sm text-amber-900 leading-relaxed">{report.insight}</p>
            </div>

            {/* Career Harmony with target roles */}
            {report.roleHarmony.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">{c.harmony}</h3>
                  <span className={`text-lg font-bold ${
                    report.overallHarmony >= 70 ? 'text-emerald-600' :
                    report.overallHarmony >= 50 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {report.overallHarmony}/100
                  </span>
                </div>
                <div className="space-y-3">
                  {report.roleHarmony.map(h => (
                    <div key={h.roleId} className="border border-slate-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-800">
                          {isZh ? h.roleTitle_zh : h.roleTitle}
                        </span>
                        <span className={`text-sm font-bold ${
                          h.harmony >= 70 ? 'text-emerald-600' :
                          h.harmony >= 50 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {h.harmony}%
                        </span>
                      </div>
                      {/* Harmony bar */}
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${h.harmony}%`,
                          backgroundColor: h.harmony >= 70 ? '#10b981' : h.harmony >= 50 ? '#f59e0b' : '#ef4444',
                        }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-red-400 font-medium">{c.frictionSource}: </span>
                          <span className="text-slate-600">
                            {isZh ? RIASEC_META[h.friction_source].name_zh : RIASEC_META[h.friction_source].name}
                            {' — '}{isZh ? h.friction_explanation_zh : h.friction_explanation}
                          </span>
                        </div>
                        <div>
                          <span className="text-emerald-500 font-medium">{c.energySource}: </span>
                          <span className="text-slate-600">
                            {isZh ? RIASEC_META[h.energy_source].name_zh : RIASEC_META[h.energy_source].name}
                            {' — '}{isZh ? h.energy_explanation_zh : h.energy_explanation}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">🧭 {c.recommendation}</div>
              <p className="text-sm text-blue-900 leading-relaxed">{report.recommendation}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => router.push('/plan')}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">
                {c.backToPlan} →
              </button>
              <button onClick={() => {
                setStage('intro');
                setCurrentQ(0);
                setAnswers(new Map());
                setReport(null);
              }}
                className="py-3 px-5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                {c.retake}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center">{c.disclaimer}</p>
          </div>
        )}
      </main>
    </div>
  );
}
