'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { useCart } from '@/lib/cart-context';
import { allIndustries } from '@/lib/career-map';
import { getSkillAiDefense } from '@/lib/superposition';
import type { CareerRole, IndustryCareerMap } from '@/lib/career-map';

/* ─── i18n ─── */
const ui = {
  en: {
    title: 'How To Get There?',
    sub: 'Your personalized action plan based on selected target roles',
    empty: 'No target roles selected yet',
    emptyHint: 'Go to Industries & Jobs to browse and add roles to your plan.',
    browse: 'Browse Industries & Jobs',
    skills: 'Skills to Learn',
    skillsHint: 'Skills you need but don\'t have yet',
    tools: 'Tools & Software',
    toolsHint: 'Industry-standard tools to master',
    certs: 'Certifications',
    certsHint: 'Credentials that prove your competence',
    capstone: 'Capstone Projects',
    capstoneHint: 'Build these to prove you can do the job',
    youHave: 'You have',
    youNeed: 'You need',
    shared: 'Shared across roles',
    roleSpecific: 'Role-specific',
    remove: 'Remove',
    totalGap: 'Total skill gap',
    estimatedTime: 'Estimated learning time',
    months: 'months',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    nextStep: 'Ready to start?',
    nextStepHint: 'See where these roles are hiring on the Market Map',
    goToMarket: 'View Market Map',
  },
  de: {
    title: 'Wie komme ich dahin?',
    sub: 'Dein personalisierter Aktionsplan basierend auf deinen Zielrollen',
    empty: 'Noch keine Zielrollen ausgewählt',
    emptyHint: 'Gehe zu Branchen & Jobs, um Rollen zu deinem Plan hinzuzufügen.',
    browse: 'Branchen & Jobs durchsuchen',
    skills: 'Zu lernende Skills',
    skillsHint: 'Skills die du brauchst, aber noch nicht hast',
    tools: 'Tools & Software',
    toolsHint: 'Branchenstandard-Tools',
    certs: 'Zertifizierungen',
    certsHint: 'Nachweise deiner Kompetenz',
    capstone: 'Praxisprojekte',
    capstoneHint: 'Projekte die beweisen, dass du den Job kannst',
    youHave: 'Du hast',
    youNeed: 'Du brauchst',
    shared: 'Rollenübergreifend',
    roleSpecific: 'Rollenspezifisch',
    remove: 'Entfernen',
    totalGap: 'Skill-Lücke gesamt',
    estimatedTime: 'Geschätzte Lernzeit',
    months: 'Monate',
    priority: 'Priorität',
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
    nextStep: 'Bereit loszulegen?',
    nextStepHint: 'Sieh wo diese Rollen eingestellt werden',
    goToMarket: 'Marktkarte ansehen',
  },
  zh: {
    title: '怎么去？',
    sub: '基于你选择的目标岗位，为你定制的行动计划',
    empty: '还没有选择目标岗位',
    emptyHint: '去"行业与岗位"页面浏览，将感兴趣的岗位加入计划。',
    browse: '去看行业与岗位',
    skills: '需要学习的技能',
    skillsHint: '你需要但尚未掌握的技能',
    tools: '工具与软件',
    toolsHint: '行业标准工具，掌握后立刻可用',
    certs: '认证证书',
    certsHint: '能证明你能力的权威认证',
    capstone: '实战项目',
    capstoneHint: '做完这些项目，简历上多一行硬实力',
    youHave: '已具备',
    youNeed: '需要补上',
    shared: '多岗位通用',
    roleSpecific: '岗位特有',
    remove: '移除',
    totalGap: '技能缺口总数',
    estimatedTime: '预估学习时间',
    months: '个月',
    priority: '优先级',
    high: '高',
    medium: '中',
    low: '低',
    nextStep: '准备好了吗？',
    nextStepHint: '去市场地图看看这些岗位在哪里招聘',
    goToMarket: '查看市场地图',
  },
};

/* ─── Known tools/certs mapping from skill names ─── */
const SKILL_TOOLS: Record<string, string[]> = {
  'FMEA': ['APIS IQ-RM', 'Plato SCIO', 'Relyence FMEA'],
  'SPC': ['Minitab', 'JMP', 'Q-DAS'],
  'CATIA': ['CATIA V5/V6', 'Dassault 3DEXPERIENCE'],
  'SolidWorks': ['SolidWorks Premium', 'SolidWorks Simulation'],
  'Python': ['VS Code', 'Jupyter Notebook', 'PyCharm'],
  'SQL': ['MySQL Workbench', 'DBeaver', 'pgAdmin'],
  'Power BI': ['Power BI Desktop', 'DAX Studio'],
  'MATLAB': ['MATLAB', 'Simulink'],
  'ANSYS': ['ANSYS Workbench', 'ANSYS Fluent'],
  'AUTOSAR': ['Vector DaVinci', 'ETAS ISOLAR'],
  'PLC': ['Siemens TIA Portal', 'Codesys', 'Allen-Bradley Studio 5000'],
  'CANoe': ['Vector CANoe', 'CAPL scripting'],
  'SAP': ['SAP S/4HANA', 'SAP QM Module'],
  'IATF 16949': ['TÜV certification portal', 'SAP QM'],
  'Lean': ['Value Stream Mapping tools', 'Miro'],
  'Six Sigma': ['Minitab', 'JMP', 'SigmaXL'],
  'GD&T': ['GD&T Trainer', 'eMachineShop'],
  'DOORS': ['IBM DOORS', 'Polarion'],
  'ISO 13485': ['Greenlight Guru', 'MasterControl'],
};

const SKILL_CERTS: Record<string, { name: string; provider: string; est_cost: string }[]> = {
  'FMEA': [{ name: 'VDA FMEA Moderator', provider: 'VDA QMC', est_cost: '€800-1500' }],
  'IATF 16949': [{ name: 'IATF 16949 Lead Auditor', provider: 'TÜV/DEKRA', est_cost: '€1500-3000' }],
  'Six Sigma': [
    { name: 'Six Sigma Green Belt', provider: 'ASQ', est_cost: '$400-600' },
    { name: 'Six Sigma Black Belt', provider: 'ASQ', est_cost: '$600-900' },
  ],
  'PLC': [{ name: 'Siemens Certified Professional', provider: 'Siemens SITRAIN', est_cost: '€1000-2000' }],
  'Python': [{ name: 'PCAP – Python Associate', provider: 'Python Institute', est_cost: '$295' }],
  'AUTOSAR': [{ name: 'AUTOSAR Certified Professional', provider: 'AUTOSAR', est_cost: '€500-1000' }],
  'SAP': [{ name: 'SAP Certified Application Associate', provider: 'SAP', est_cost: '$550' }],
  'ISO 13485': [{ name: 'ISO 13485 Lead Auditor', provider: 'BSI/TÜV', est_cost: '€1500-2500' }],
  'Lean': [{ name: 'Lean Practitioner', provider: 'SME/AME', est_cost: '$300-500' }],
  'Power BI': [{ name: 'PL-300 Power BI Analyst', provider: 'Microsoft', est_cost: '$165' }],
};

const SKILL_CAPSTONES: Record<string, { title: string; title_zh: string; hours: number; deliverable: string }> = {
  'FMEA': { title: 'FMEA for EV Battery Assembly', title_zh: '电池装配过程FMEA分析', hours: 20, deliverable: 'GitHub repo + report' },
  'SPC': { title: 'SPC Dashboard for Manufacturing', title_zh: '制造过程SPC控制看板', hours: 15, deliverable: 'Python dashboard + GitHub' },
  'Python': { title: 'Manufacturing Data Pipeline', title_zh: '制造业数据自动化流水线', hours: 25, deliverable: 'GitHub repo + demo' },
  'PLC': { title: 'PLC-Controlled Sorting System', title_zh: 'PLC控制分拣系统仿真', hours: 30, deliverable: 'TIA Portal project + video' },
  'CATIA': { title: 'Automotive Part Design Portfolio', title_zh: '汽车零件设计作品集', hours: 40, deliverable: '3D models + technical drawings' },
  'CANoe': { title: 'CAN Bus Data Logger & Analyzer', title_zh: 'CAN总线数据记录分析器', hours: 20, deliverable: 'Python tool + GitHub' },
  'Six Sigma': { title: 'DMAIC Project on Defect Reduction', title_zh: 'DMAIC缺陷减少改善项目', hours: 30, deliverable: 'Full DMAIC report + presentation' },
  'Lean': { title: 'Value Stream Map Optimization', title_zh: '价值流图优化改善报告', hours: 15, deliverable: 'VSM before/after + savings calculation' },
  'AUTOSAR': { title: 'AUTOSAR SWC Integration Demo', title_zh: 'AUTOSAR软件组件集成演示', hours: 35, deliverable: 'Working SWC + documentation' },
};

/* ─── Path Verification (Expert Feedback) ─── */
function PathVerification({ locale }: { locale: string }) {
  const isZh = locale === 'zh';
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    // Store to localStorage for now — future: send to Supabase
    try {
      const existing = JSON.parse(localStorage.getItem('careerlens_feedback') || '[]');
      existing.push({ vote, feedback, timestamp: new Date().toISOString() });
      localStorage.setItem('careerlens_feedback', JSON.stringify(existing));
    } catch { /* ignore */ }
    setSubmitted(true);
  }, [vote, feedback]);

  if (submitted) {
    return (
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
        <div className="text-2xl mb-2">✓</div>
        <p className="text-sm font-medium text-emerald-800">
          {isZh ? '感谢你的反馈！你的行业经验让路径更精准。' : 'Thanks! Your industry expertise makes paths more accurate.'}
        </p>
        <p className="text-[10px] text-emerald-600 mt-1">
          {isZh ? '未来此功能将成为"专家积分系统"的一部分' : 'This will become part of the Expert Token system'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🔍</span>
        <h3 className="text-sm font-bold text-slate-900">
          {isZh ? '这个路径准确吗？' : 'Is this path accurate?'}
        </h3>
        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {isZh ? 'AI生成' : 'AI-generated'}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        {isZh
          ? '如果你是资深工程师，你的反馈将帮助我们改进路径推荐（未来可获得专家积分）'
          : 'If you\'re a senior engineer, your feedback improves path recommendations (future: earn Expert Tokens)'}
      </p>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => setVote('up')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-all ${
            vote === 'up' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-emerald-300'
          }`}>
          👍 {isZh ? '路径合理' : 'Path looks right'}
        </button>
        <button onClick={() => setVote('down')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-all ${
            vote === 'down' ? 'bg-red-50 border-red-300 text-red-700' : 'border-slate-200 text-slate-500 hover:border-red-300'
          }`}>
          👎 {isZh ? '需要改进' : 'Needs improvement'}
        </button>
      </div>
      {vote === 'down' && (
        <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
          placeholder={isZh ? '哪里不对？例如："ROS2不需要先学C++，直接Python更快"' : 'What\'s wrong? e.g., "ROS2 doesn\'t need C++ first, Python is faster"'}
          className="w-full h-20 p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none mb-3" />
      )}
      {vote && (
        <button onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          {isZh ? '提交反馈' : 'Submit feedback'}
        </button>
      )}
    </div>
  );
}

interface ResolvedRole {
  role: CareerRole;
  industry: IndustryCareerMap;
}

export default function PlanPage() {
  const { locale } = useLocale();
  const { userSkills } = useSkills();
  const { cart, removeFromCart } = useCart();
  const router = useRouter();
  const c = ui[locale];
  const isZh = locale === 'zh';

  // Resolve cart items to actual role/industry objects
  const resolvedRoles = useMemo((): ResolvedRole[] => {
    return cart.map(item => {
      const industry = allIndustries.find(i => i.id === item.industryId);
      const role = industry?.roles.find(r => r.id === item.roleId);
      if (!industry || !role) return null;
      return { role, industry };
    }).filter((r): r is ResolvedRole => r !== null);
  }, [cart]);

  // Aggregate all skills needed across all target roles
  const analysis = useMemo(() => {
    const allNeeded = new Set<string>();
    const allHave = new Set<string>();
    const allMissing = new Set<string>();
    const skillRoleCount = new Map<string, number>(); // how many roles need this skill

    const userLower = userSkills.map(s => s.toLowerCase());

    for (const { role } of resolvedRoles) {
      const roleSkills = [...new Set([...role.core_skills, ...role.levels.flatMap(l => l.key_skills)])];
      for (const skill of roleSkills) {
        allNeeded.add(skill);
        const have = userLower.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));
        if (have) {
          allHave.add(skill);
        } else {
          allMissing.add(skill);
          skillRoleCount.set(skill, (skillRoleCount.get(skill) || 0) + 1);
        }
      }
    }

    // Sort missing skills by priority (how many roles need them)
    const prioritized = [...allMissing].sort((a, b) => (skillRoleCount.get(b) || 0) - (skillRoleCount.get(a) || 0));

    return { allNeeded, allHave, allMissing, prioritized, skillRoleCount };
  }, [resolvedRoles, userSkills]);

  // Aggregate tools, certs, capstones from missing skills
  const tools = useMemo(() => {
    const result: { skill: string; tools: string[] }[] = [];
    for (const skill of analysis.prioritized) {
      const t = Object.entries(SKILL_TOOLS).find(([k]) => skill.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(skill.toLowerCase()));
      if (t) result.push({ skill, tools: t[1] });
    }
    return result;
  }, [analysis.prioritized]);

  const certs = useMemo(() => {
    const result: { skill: string; certs: { name: string; provider: string; est_cost: string }[] }[] = [];
    for (const skill of analysis.prioritized) {
      const c = Object.entries(SKILL_CERTS).find(([k]) => skill.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(skill.toLowerCase()));
      if (c) result.push({ skill, certs: c[1] });
    }
    return result;
  }, [analysis.prioritized]);

  const capstones = useMemo(() => {
    const result: { skill: string; project: typeof SKILL_CAPSTONES[string] }[] = [];
    for (const skill of analysis.prioritized) {
      const c = Object.entries(SKILL_CAPSTONES).find(([k]) => skill.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(skill.toLowerCase()));
      if (c) result.push({ skill, project: c[1] });
    }
    return result;
  }, [analysis.prioritized]);

  // Empty state
  if (resolvedRoles.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{c.empty}</h1>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">{c.emptyHint}</p>
          <button onClick={() => router.push('/industries')}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">
            {c.browse} →
          </button>
        </main>
      </div>
    );
  }

  const estimatedMonths = Math.max(1, Math.round(analysis.allMissing.size * 0.5));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{c.title}</h1>
          <p className="text-sm text-slate-500">{c.sub}</p>
        </div>

        {/* Selected roles strip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {resolvedRoles.map(({ role, industry }) => (
              <div key={role.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                <span className="text-sm">{industry.icon}</span>
                <span className="text-xs font-medium text-slate-800">{isZh ? role.title_zh : role.title}</span>
                <button onClick={() => removeFromCart(role.id)} className="text-slate-400 hover:text-red-500 text-xs">✕</button>
              </div>
            ))}
          </div>
          {/* Summary stats */}
          <div className="flex gap-6 mt-4 pt-3 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{c.totalGap}</div>
              <div className="text-lg font-bold text-slate-900">{analysis.allMissing.size} <span className="text-xs font-normal text-slate-400">skills</span></div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{c.youHave}</div>
              <div className="text-lg font-bold text-emerald-600">{analysis.allHave.size} <span className="text-xs font-normal text-slate-400">skills</span></div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{c.estimatedTime}</div>
              <div className="text-lg font-bold text-blue-700">{estimatedMonths} {c.months}</div>
            </div>
          </div>
        </div>

        {/* Four dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Dimension 1: Skills */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📚</span>
              <h2 className="text-base font-bold text-slate-900">{c.skills}</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">{c.skillsHint}</p>

            {analysis.prioritized.length === 0 ? (
              <p className="text-sm text-emerald-600 text-center py-4">
                {isZh ? '你已具备所有所需技能！' : 'You already have all required skills!'}
              </p>
            ) : (
              <div className="space-y-2">
                {analysis.prioritized.map(skill => {
                  const roleCount = analysis.skillRoleCount.get(skill) || 0;
                  const priorityColor = roleCount >= 3 ? 'bg-red-50 text-red-700 border-red-200' : roleCount >= 2 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200';
                  const aiDefense = getSkillAiDefense(skill);
                  return (
                    <div key={skill} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{skill}</span>
                        {aiDefense >= 10 && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            🛡 AI-{aiDefense}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityColor}`}>
                          {roleCount} {isZh ? '岗位需要' : 'roles'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-slate-400 mt-2">
                  🛡 = {isZh ? '学习此技能可降低AI替代率' : 'Learning this skill reduces your AI replacement risk'}
                </p>
              </div>
            )}

            {userSkills.length > 0 && analysis.allHave.size > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">✓ {c.youHave} ({analysis.allHave.size})</div>
                <div className="flex flex-wrap gap-1">
                  {[...analysis.allHave].slice(0, 12).map(s => (
                    <span key={s} className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dimension 2: Tools */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔧</span>
              <h2 className="text-base font-bold text-slate-900">{c.tools}</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">{c.toolsHint}</p>

            {tools.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                {isZh ? '暂无推荐工具（IndustryToolMap即将上线）' : 'No tool recommendations yet (coming soon)'}
              </p>
            ) : (
              <div className="space-y-3">
                {tools.map(({ skill, tools: t }) => (
                  <div key={skill}>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{skill}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.map(tool => (
                        <span key={tool} className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg border border-blue-200">{tool}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dimension 3: Certifications */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏅</span>
              <h2 className="text-base font-bold text-slate-900">{c.certs}</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">{c.certsHint}</p>

            {certs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                {isZh ? '暂无推荐认证' : 'No certification recommendations yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {certs.map(({ skill, certs: certList }) => (
                  <div key={skill}>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{skill}</div>
                    {certList.map(cert => (
                      <div key={cert.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 border border-amber-100 mb-1.5">
                        <div>
                          <div className="text-xs font-medium text-slate-800">{cert.name}</div>
                          <div className="text-[10px] text-slate-500">{cert.provider}</div>
                        </div>
                        <span className="text-xs font-mono text-amber-700">{cert.est_cost}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dimension 4: Capstone Projects */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🎯</span>
              <h2 className="text-base font-bold text-slate-900">{c.capstone}</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">{c.capstoneHint}</p>

            {capstones.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                {isZh ? '暂无推荐实战项目' : 'No capstone project recommendations yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {capstones.map(({ skill, project }) => (
                  <div key={skill} className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">{skill}</div>
                    <div className="text-sm font-medium text-slate-800 mb-1">{isZh ? project.title_zh : project.title}</div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>⏱ {project.hours}h</span>
                      <span>📦 {project.deliverable}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Path Verification */}
        <PathVerification locale={locale} />

        {/* CTA to Market Map */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <h3 className="text-base font-bold text-slate-900 mb-1">{c.nextStep}</h3>
          <p className="text-sm text-slate-500 mb-4">{c.nextStepHint}</p>
          <button onClick={() => router.push('/market')}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm">
            {c.goToMarket} →
          </button>
        </div>
      </main>
    </div>
  );
}
