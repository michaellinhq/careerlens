'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useLocale } from '@/lib/locale-context';
import { useSkills } from '@/lib/skills-context';
import { useCart } from '@/lib/cart-context';
import { allIndustries } from '@/lib/career-map';
import { getSkillAiDefense } from '@/lib/superposition';
import { getToolMapEntries } from '@/lib/toolmap';
import type { IndustryToolMapEntry } from '@/lib/toolmap/types';
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
    skillsHint: 'Prioritized by how many target roles need them',
    tools: 'Tools & Software',
    toolsHint: 'Industry-standard tools to master',
    certs: 'Certifications & Training',
    certsHint: 'Credentials and courses that prove your competence',
    capstone: 'Capstone Projects',
    capstoneHint: 'Build these to prove you can do the job',
    youHave: 'You have',
    youNeed: 'You need',
    remove: 'Remove',
    totalGap: 'Total skill gap',
    estimatedTime: 'Est. learning time',
    months: 'months',
    nextStep: 'Ready to start?',
    nextStepHint: 'See where these roles are hiring',
    goToMarket: 'View Market Map',
    downloadPlan: 'Download My Plan',
    downloadBrief: 'Download Task Brief',
    aiLoading: 'AI is generating recommendations...',
    aiPowered: 'AI-generated recommendations',
    free: 'FREE',
    essential: 'Essential',
    recommended: 'Recommended',
    emerging: 'Emerging',
    githubPath: 'GitHub Learning Path',
    hours: 'h',
    difficulty: 'Difficulty',
    deliverables: 'Deliverables',
    provesTo: 'Proves to employer',
    industryContext: 'Industry context',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
  },
  de: {
    title: 'Wie komme ich dahin?',
    sub: 'Dein personalisierter Aktionsplan',
    empty: 'Noch keine Zielrollen ausgewählt',
    emptyHint: 'Gehe zu Branchen & Jobs, um Rollen hinzuzufügen.',
    browse: 'Branchen & Jobs durchsuchen',
    skills: 'Zu lernende Skills',
    skillsHint: 'Priorisiert nach Anzahl der Zielrollen',
    tools: 'Tools & Software',
    toolsHint: 'Branchenstandard-Tools',
    certs: 'Zertifizierungen & Training',
    certsHint: 'Nachweise und Kurse',
    capstone: 'Praxisprojekte',
    capstoneHint: 'Projekte die beweisen, dass du den Job kannst',
    youHave: 'Du hast',
    youNeed: 'Du brauchst',
    remove: 'Entfernen',
    totalGap: 'Skill-Lücke',
    estimatedTime: 'Geschätzte Lernzeit',
    months: 'Monate',
    nextStep: 'Bereit?',
    nextStepHint: 'Sieh wo diese Rollen gesucht werden',
    goToMarket: 'Marktkarte ansehen',
    downloadPlan: 'Plan herunterladen',
    downloadBrief: 'Aufgabenstellung herunterladen',
    aiLoading: 'KI generiert Empfehlungen...',
    aiPowered: 'KI-generierte Empfehlungen',
    free: 'KOSTENLOS',
    essential: 'Essentiell',
    recommended: 'Empfohlen',
    emerging: 'Aufkommend',
    githubPath: 'GitHub-Lernpfad',
    hours: 'Std',
    difficulty: 'Schwierigkeit',
    deliverables: 'Liefergegenstände',
    provesTo: 'Beweist dem Arbeitgeber',
    industryContext: 'Branchenkontext',
    expandAll: 'Alle aufklappen',
    collapseAll: 'Alle zuklappen',
  },
  zh: {
    title: '怎么去？',
    sub: '基于目标岗位的个人行动计划',
    empty: '还没有选择目标岗位',
    emptyHint: '去"行业与岗位"页面浏览，将感兴趣的岗位加入计划。',
    browse: '去看行业与岗位',
    skills: '需要学习的技能',
    skillsHint: '按目标岗位需求优先排序',
    tools: '工具与软件',
    toolsHint: '行业标准工具，掌握后立刻可用',
    certs: '认证与培训',
    certsHint: '能证明你能力的权威认证和课程',
    capstone: '实战项目',
    capstoneHint: '做完这些项目，简历上多一行硬实力',
    youHave: '已具备',
    youNeed: '需要补上',
    remove: '移除',
    totalGap: '技能缺口',
    estimatedTime: '预估学习时间',
    months: '个月',
    nextStep: '准备好了吗？',
    nextStepHint: '去市场地图看看这些岗位在哪里招聘',
    goToMarket: '查看市场地图',
    downloadPlan: '下载我的学习计划',
    downloadBrief: '下载任务书',
    aiLoading: 'AI正在生成推荐...',
    aiPowered: 'AI生成的推荐',
    free: '免费',
    essential: '必备',
    recommended: '推荐',
    emerging: '新兴',
    githubPath: 'GitHub学习路径',
    hours: '小时',
    difficulty: '难度',
    deliverables: '交付物',
    provesTo: '向雇主证明',
    industryContext: '行业背景',
    expandAll: '全部展开',
    collapseAll: '全部收起',
  },
};

/* ─── AI Suggestion types ─── */
interface AISuggestion {
  tools?: { name: string; free?: boolean; note?: string }[];
  training?: { name: string; platform: string; price: string; url?: string }[];
  github?: { repo: string; desc: string; hours: number }[];
  capstone?: { title: string; title_zh: string; difficulty: string; hours: number; deliverables: string[]; proves: string };
}

/* ─── Skill Detail Card — shows toolmap or AI data for one skill ─── */
function SkillDetailCard({ skill, toolmapEntries, aiSuggestion, locale, c, industryId }: {
  skill: string;
  toolmapEntries: IndustryToolMapEntry[];
  aiSuggestion?: AISuggestion;
  locale: string;
  c: typeof ui.en;
  industryId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isZh = locale === 'zh';
  const entry = toolmapEntries[0]; // primary entry
  const hasData = entry || aiSuggestion;
  const isAI = !entry && !!aiSuggestion;
  const aiDefense = getSkillAiDefense(skill);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Header — always visible */}
      <button onClick={() => hasData && setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-semibold text-slate-900 truncate">{skill}</span>
          {aiDefense >= 10 && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
              🛡-{aiDefense}%
            </span>
          )}
          {isAI && (
            <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
              AI
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {entry && (
            <span className="text-[10px] text-slate-400">
              {entry.tools.length} tools · {entry.github_path.length} repos
            </span>
          )}
          {hasData && (
            <span className={`text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && hasData && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100">
          {/* Industry context */}
          {entry?.industry_context && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">{c.industryContext}</div>
              <p className="text-xs text-amber-900 leading-relaxed">
                {isZh ? entry.industry_context_zh : entry.industry_context}
              </p>
            </div>
          )}

          {/* Tools */}
          {(entry?.tools || aiSuggestion?.tools) && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{c.tools}</div>
              <div className="space-y-1.5">
                {(entry?.tools || []).map(tool => (
                  <div key={tool.name} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        tool.tier === 'essential' ? 'bg-red-100 text-red-700' :
                        tool.tier === 'recommended' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {c[tool.tier]}
                      </span>
                      <span className="text-xs font-medium text-slate-800">{tool.name}</span>
                      <span className="text-[10px] text-slate-400">{tool.vendor}</span>
                    </div>
                    {tool.free_tier && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {c.free} {tool.free_tier_note ? `· ${tool.free_tier_note}` : ''}
                      </span>
                    )}
                  </div>
                ))}
                {(aiSuggestion?.tools || []).map(tool => (
                  <div key={tool.name} className="flex items-center justify-between py-1.5 px-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-xs font-medium text-slate-800">{tool.name}</span>
                    {tool.free && <span className="text-[10px] font-bold text-emerald-600">{c.free}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training */}
          {(entry?.training || aiSuggestion?.training) && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{c.certs}</div>
              <div className="space-y-1.5">
                {(entry?.training || []).map(t => (
                  <div key={t.name} className="py-2 px-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-800">{isZh ? t.name_zh : t.name}</span>
                      <span className="text-xs font-mono text-amber-700">{t.price_range}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{t.format}</span>
                      {t.certification && <span className="text-[10px] text-blue-600">🏅 {t.certification}</span>}
                      <span className="text-[10px] text-slate-400">{t.language.join('/')}</span>
                    </div>
                  </div>
                ))}
                {(aiSuggestion?.training || []).map(t => (
                  <div key={t.name} className="py-2 px-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-800">{t.name}</span>
                      <span className="text-xs font-mono text-blue-700">{t.price}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{t.platform}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Path */}
          {(entry?.github_path || aiSuggestion?.github) && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{c.githubPath}</div>
              <div className="space-y-1.5">
                {(entry?.github_path || []).sort((a, b) => a.order - b.order).map(step => (
                  <div key={step.repo_name} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {step.order}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800 truncate">{step.repo_name} ⭐{step.stars}</div>
                      <div className="text-[10px] text-slate-500">{isZh ? step.what_to_learn_zh : step.what_to_learn}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">~{step.estimated_hours}{c.hours}</span>
                  </div>
                ))}
                {(aiSuggestion?.github || []).map(g => (
                  <div key={g.repo} className="flex items-center gap-3 py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800 truncate">{g.repo}</div>
                      <div className="text-[10px] text-slate-500">{g.desc}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">~{g.hours}{c.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capstone */}
          {(entry?.capstone || aiSuggestion?.capstone) && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">🎯 {c.capstone}</div>
              {entry?.capstone && (
                <>
                  <div className="text-sm font-semibold text-slate-900 mb-1">
                    {isZh ? entry.capstone.title_zh : entry.capstone.title}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mb-2">
                    <span>{c.difficulty}: {entry.capstone.difficulty}</span>
                    <span>⏱ {entry.capstone.time_hours}{c.hours}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 mb-1">
                    <span className="font-semibold">{c.deliverables}:</span> {isZh ? entry.capstone.deliverables_zh.join('、') : entry.capstone.deliverables.join(', ')}
                  </div>
                  <div className="text-[10px] text-indigo-700 font-medium">
                    {c.provesTo}: {isZh ? entry.capstone.proves_to_employer_zh : entry.capstone.proves_to_employer}
                  </div>
                </>
              )}
              {!entry?.capstone && aiSuggestion?.capstone && (
                <>
                  <div className="text-sm font-semibold text-slate-900 mb-1">
                    {isZh ? aiSuggestion.capstone.title_zh : aiSuggestion.capstone.title}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mb-2">
                    <span>{c.difficulty}: {aiSuggestion.capstone.difficulty}</span>
                    <span>⏱ {aiSuggestion.capstone.hours}{c.hours}</span>
                  </div>
                  <div className="text-[10px] text-indigo-700 font-medium">
                    {c.provesTo}: {aiSuggestion.capstone.proves}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Path Verification ─── */
function PathVerification({ locale }: { locale: string }) {
  const isZh = locale === 'zh';
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
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
          {isZh ? '感谢你的反馈！' : 'Thanks for your feedback!'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔍</span>
        <h3 className="text-sm font-bold text-slate-900">
          {isZh ? '这个路径准确吗？' : 'Is this path accurate?'}
        </h3>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => setVote('up')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-all ${
            vote === 'up' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-emerald-300'
          }`}>
          👍 {isZh ? '路径合理' : 'Looks right'}
        </button>
        <button onClick={() => setVote('down')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-all ${
            vote === 'down' ? 'bg-red-50 border-red-300 text-red-700' : 'border-slate-200 text-slate-500 hover:border-red-300'
          }`}>
          👎 {isZh ? '需要改进' : 'Needs work'}
        </button>
      </div>
      {vote === 'down' && (
        <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
          placeholder={isZh ? '哪里不对？' : "What's wrong?"}
          className="w-full h-20 p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none mb-3" />
      )}
      {vote && (
        <button onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          {isZh ? '提交' : 'Submit'}
        </button>
      )}
    </div>
  );
}

/* ─── Plan Download Generator ─── */
function generatePlanMarkdown(
  resolvedRoles: { role: CareerRole; industry: IndustryCareerMap }[],
  analysis: { allMissing: Set<string>; allHave: Set<string>; prioritized: string[]; skillRoleCount: Map<string, number> },
  toolmapData: Map<string, IndustryToolMapEntry[]>,
  isZh: boolean,
): string {
  const date = new Date().toISOString().split('T')[0];
  let md = `# ${isZh ? '个人职业发展计划' : 'Personal Career Development Plan'}\n`;
  md += `${isZh ? '生成日期' : 'Generated'}: ${date} | CareerLens\n\n`;

  md += `## ${isZh ? '目标岗位' : 'Target Roles'}\n\n`;
  for (const { role, industry } of resolvedRoles) {
    md += `- **${isZh ? role.title_zh : role.title}** (${isZh ? industry.name_zh : industry.name})\n`;
  }

  md += `\n## ${isZh ? '能力评估' : 'Skill Assessment'}\n\n`;
  md += `- ${isZh ? '已具备' : 'You have'}: ${analysis.allHave.size} ${isZh ? '项技能' : 'skills'}\n`;
  md += `- ${isZh ? '需要补上' : 'You need'}: ${analysis.allMissing.size} ${isZh ? '项技能' : 'skills'}\n\n`;

  md += `## ${isZh ? '学习路径（按优先级）' : 'Learning Path (by priority)'}\n\n`;
  for (const skill of analysis.prioritized) {
    const roleCount = analysis.skillRoleCount.get(skill) || 0;
    const aiDef = getSkillAiDefense(skill);
    md += `### ${skill}`;
    if (roleCount > 1) md += ` (${roleCount} ${isZh ? '岗位需要' : 'roles need this'})`;
    if (aiDef >= 10) md += ` 🛡AI-${aiDef}%`;
    md += '\n\n';

    const entries = toolmapData.get(skill);
    if (entries && entries[0]) {
      const e = entries[0];
      if (e.industry_context) {
        md += `> ${isZh ? e.industry_context_zh : e.industry_context}\n\n`;
      }
      if (e.tools.length > 0) {
        md += `**${isZh ? '工具' : 'Tools'}:**\n`;
        for (const t of e.tools) {
          md += `- ${t.name} (${t.vendor})${t.free_tier ? ` — ${isZh ? '有免费版' : 'free tier available'}` : ''}\n`;
        }
        md += '\n';
      }
      if (e.training.length > 0) {
        md += `**${isZh ? '培训' : 'Training'}:**\n`;
        for (const t of e.training) {
          md += `- ${isZh ? t.name_zh : t.name} | ${t.price_range} | ${t.format}\n`;
        }
        md += '\n';
      }
      if (e.github_path.length > 0) {
        md += `**GitHub ${isZh ? '学习路径' : 'Path'}:**\n`;
        for (const g of e.github_path.sort((a, b) => a.order - b.order)) {
          md += `${g.order}. ${g.repo_name} ⭐${g.stars} (~${g.estimated_hours}h) — ${isZh ? g.what_to_learn_zh : g.what_to_learn}\n`;
        }
        md += '\n';
      }
      if (e.capstone) {
        md += `**${isZh ? '实战项目' : 'Capstone'}:** ${isZh ? e.capstone.title_zh : e.capstone.title}\n`;
        md += `- ${isZh ? '难度' : 'Difficulty'}: ${e.capstone.difficulty} | ⏱ ${e.capstone.time_hours}h\n`;
        md += `- ${isZh ? '交付物' : 'Deliverables'}: ${isZh ? e.capstone.deliverables_zh.join('、') : e.capstone.deliverables.join(', ')}\n`;
        md += `- ${isZh ? '向雇主证明' : 'Proves'}: ${isZh ? e.capstone.proves_to_employer_zh : e.capstone.proves_to_employer}\n\n`;
      }
    } else {
      md += `${isZh ? '（暂无详细数据，建议搜索相关课程）' : '(No detailed data yet — search for related courses)'}\n\n`;
    }
  }

  md += `---\n${isZh ? '由 CareerLens 职业透镜生成' : 'Generated by CareerLens'} | https://webapp-ten-puce.vercel.app\n`;
  return md;
}

function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Types ─── */
interface ResolvedRole {
  role: CareerRole;
  industry: IndustryCareerMap;
}

/* ─── Main Page ─── */
export default function PlanPage() {
  const { locale } = useLocale();
  const { userSkills } = useSkills();
  const { cart, removeFromCart } = useCart();
  const router = useRouter();
  const c = ui[locale];
  const isZh = locale === 'zh';

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, AISuggestion>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);

  // Resolve cart → roles
  const resolvedRoles = useMemo((): ResolvedRole[] => {
    return cart.map(item => {
      const industry = allIndustries.find(i => i.id === item.industryId);
      const role = industry?.roles.find(r => r.id === item.roleId);
      if (!industry || !role) return null;
      return { role, industry };
    }).filter((r): r is ResolvedRole => r !== null);
  }, [cart]);

  // Analyze skill gaps
  const analysis = useMemo(() => {
    const allNeeded = new Set<string>();
    const allHave = new Set<string>();
    const allMissing = new Set<string>();
    const skillRoleCount = new Map<string, number>();
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

    const prioritized = [...allMissing].sort((a, b) => (skillRoleCount.get(b) || 0) - (skillRoleCount.get(a) || 0));
    return { allNeeded, allHave, allMissing, prioritized, skillRoleCount };
  }, [resolvedRoles, userSkills]);

  // Lookup toolmap for each missing skill
  const toolmapData = useMemo(() => {
    const result = new Map<string, IndustryToolMapEntry[]>();
    const primaryIndustry = resolvedRoles[0]?.industry.id;
    for (const skill of analysis.prioritized) {
      const entries = getToolMapEntries(skill, primaryIndustry);
      if (entries.length > 0) {
        result.set(skill, entries);
      }
    }
    return result;
  }, [analysis.prioritized, resolvedRoles]);

  // Find skills NOT covered by toolmap → request AI backfill
  const uncoveredSkills = useMemo(() => {
    return analysis.prioritized.filter(s => !toolmapData.has(s));
  }, [analysis.prioritized, toolmapData]);

  // AI backfill: fetch suggestions for uncovered skills
  useEffect(() => {
    if (uncoveredSkills.length === 0) return;

    // Check localStorage cache first
    const cacheKey = `careerlens_ai_suggestions`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      const allCached = uncoveredSkills.every(s => cached[s]);
      if (allCached) {
        setAiSuggestions(cached);
        return;
      }
    } catch { /* ignore */ }

    // Fetch from AI
    const skillsToFetch = uncoveredSkills.filter(s => !aiSuggestions[s]);
    if (skillsToFetch.length === 0) return;

    setAiLoading(true);
    const industry = resolvedRoles[0]?.industry.name || 'Manufacturing';

    fetch('/api/plan-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills: skillsToFetch, industry }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.suggestions) {
          setAiSuggestions(prev => {
            const merged = { ...prev, ...data.suggestions };
            // Cache to localStorage
            try { localStorage.setItem(cacheKey, JSON.stringify(merged)); } catch { /* ignore */ }
            return merged;
          });
        }
      })
      .catch(e => console.warn('AI plan suggestions failed:', e))
      .finally(() => setAiLoading(false));
  }, [uncoveredSkills.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Download handler
  const handleDownload = useCallback(() => {
    const md = generatePlanMarkdown(resolvedRoles, analysis, toolmapData, isZh);
    const filename = isZh ? `CareerLens_学习计划_${new Date().toISOString().split('T')[0]}.md` : `CareerLens_Plan_${new Date().toISOString().split('T')[0]}.md`;
    downloadMarkdown(md, filename);
  }, [resolvedRoles, analysis, toolmapData, isZh]);

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
  const toolmapCoverage = analysis.prioritized.filter(s => toolmapData.has(s)).length;
  const aiCoverage = uncoveredSkills.filter(s => aiSuggestions[s]).length;
  const totalCoverage = toolmapCoverage + aiCoverage;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{c.title}</h1>
            <p className="text-sm text-slate-500">{c.sub}</p>
          </div>
          <button onClick={handleDownload}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            📥 {c.downloadPlan}
          </button>
        </div>

        {/* Selected roles + stats */}
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
          <div className="flex flex-wrap gap-6 mt-4 pt-3 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{c.totalGap}</div>
              <div className="text-lg font-bold text-slate-900">{analysis.allMissing.size}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{c.youHave}</div>
              <div className="text-lg font-bold text-emerald-600">{analysis.allHave.size}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{c.estimatedTime}</div>
              <div className="text-lg font-bold text-blue-700">{estimatedMonths} {c.months}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {isZh ? '数据覆盖' : 'Data coverage'}
              </div>
              <div className="text-lg font-bold text-indigo-700">
                {totalCoverage}/{analysis.prioritized.length}
                {aiLoading && <span className="text-[10px] text-blue-500 ml-1 font-normal animate-pulse">AI...</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle expand all */}
        <div className="flex justify-end mb-3">
          <button onClick={() => setAllExpanded(!allExpanded)}
            className="text-xs text-blue-600 hover:underline">
            {allExpanded ? c.collapseAll : c.expandAll}
          </button>
        </div>

        {/* Skill cards — the main content */}
        <div className="space-y-3">
          {analysis.prioritized.length === 0 ? (
            <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-medium text-emerald-700">
                {isZh ? '你已具备所有所需技能！' : 'You already have all required skills!'}
              </p>
            </div>
          ) : (
            analysis.prioritized.map(skill => {
              const entries = toolmapData.get(skill) || [];
              const aiSug = aiSuggestions[skill];
              const roleCount = analysis.skillRoleCount.get(skill) || 0;
              return (
                <div key={skill}>
                  {/* Priority badge */}
                  {roleCount >= 2 && (
                    <div className="text-[10px] font-bold text-red-600 mb-1 ml-1">
                      {roleCount} {isZh ? '个目标岗位需要' : 'target roles need this'}
                    </div>
                  )}
                  <SkillDetailCard
                    key={skill + allExpanded}
                    skill={skill}
                    toolmapEntries={entries}
                    aiSuggestion={aiSug}
                    locale={locale}
                    c={c}
                    industryId={resolvedRoles[0]?.industry.id}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* AI loading indicator */}
        {aiLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 py-4">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-blue-600">{c.aiLoading}</span>
          </div>
        )}

        {/* Mobile download button */}
        <div className="sm:hidden mt-6">
          <button onClick={handleDownload}
            className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            📥 {c.downloadPlan}
          </button>
        </div>

        {/* Path Verification */}
        <PathVerification locale={locale} />

        {/* CTA */}
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
