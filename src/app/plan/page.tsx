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
import { groupSkillsByType, SKILL_TYPE_META, ACTIONABLE_TYPES, SECONDARY_TYPES, type SkillType } from '@/lib/skill-classifier';
import { calcRoleMatch } from '@/lib/resume-parser';
import { PlanArbitrageView } from '@/components/PlanArbitrageView';
import { getGermanTrainingLinks } from '@/lib/data-sources';

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
    otherSkills: 'Other Skills',
    otherSkillsHint: 'Domain knowledge & soft skills — important but harder to test',
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
    otherSkills: 'Weitere Skills',
    otherSkillsHint: 'Fachwissen & Soft Skills — wichtig, aber schwerer zu prüfen',
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
    otherSkills: '其他技能',
    otherSkillsHint: '领域知识与软技能——重要但不易量化考核',
  },
};

/* ─── AI Suggestion types ─── */
interface AISuggestion {
  tools?: { name: string; free?: boolean; note?: string }[];
  training?: { name: string; platform: string; price: string; url?: string }[];
  github?: { repo: string; desc: string; hours: number }[];
  capstone?: { title: string; title_zh: string; difficulty: string; hours: number; deliverables: string[]; proves: string };
}

/* ─── Skill Detail Card — compact "pocket guide" for one skill ─── */
function SkillDetailCard({ skill, toolmapEntries, aiSuggestion, locale, c, industryId }: {
  skill: string;
  toolmapEntries: IndustryToolMapEntry[];
  aiSuggestion?: AISuggestion;
  locale: string;
  c: typeof ui.en;
  industryId?: string;
}) {
  const [showFull, setShowFull] = useState(false);
  const isZh = locale === 'zh';
  const entry = toolmapEntries[0];
  const hasData = entry || aiSuggestion;
  const isAI = !entry && !!aiSuggestion;
  const aiDefense = getSkillAiDefense(skill);

  // Extract quick-look data: best tool + best free resource + hours estimate
  const topTool = entry?.tools.find(t => t.tier === 'essential') || entry?.tools[0];
  const topAiTool = aiSuggestion?.tools?.[0];
  const totalHours = entry?.github_path.reduce((s, g) => s + g.estimated_hours, 0)
    || aiSuggestion?.github?.reduce((s, g) => s + g.hours, 0) || 0;
  const topTraining = entry?.training[0];
  const topAiTraining = aiSuggestion?.training?.[0];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Compact row — always visible: skill name + quick-look badges */}
      <div className="flex items-center gap-2 p-3 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <span className="text-sm font-semibold text-slate-900">{skill}</span>
          {aiDefense >= 10 && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              🛡-{aiDefense}%
            </span>
          )}
          {/* Inline quick-look: best tool */}
          {(topTool || topAiTool) && (
            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              🔧 {topTool?.name || topAiTool?.name}
              {(topTool?.free_tier || topAiTool?.free) && <span className="text-emerald-600 ml-1">{c.free}</span>}
            </span>
          )}
          {/* Hours estimate */}
          {totalHours > 0 && (
            <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
              ~{totalHours}{c.hours}
            </span>
          )}
          {isAI && (
            <span className="text-[9px] text-blue-400 bg-blue-50 px-1 py-0.5 rounded">AI</span>
          )}
        </div>
        {hasData && (
          <button onClick={() => setShowFull(!showFull)}
            className="text-[10px] text-blue-600 hover:underline shrink-0">
            {showFull ? (isZh ? '收起' : 'Less') : (isZh ? '详情' : 'More')}
          </button>
        )}
      </div>

      {/* Expanded: compact cards, not the full encyclopedia */}
      {showFull && hasData && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-100">
          {/* Industry context — one line */}
          {entry?.industry_context && (
            <p className="text-[11px] text-amber-800 bg-amber-50 rounded-lg px-2.5 py-1.5 mt-2 leading-relaxed">
              💡 {isZh ? entry.industry_context_zh : entry.industry_context}
            </p>
          )}

          {/* Tools — compact list */}
          {(entry?.tools || aiSuggestion?.tools) && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(entry?.tools || []).map(tool => (
                <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    tool.tier === 'essential' ? 'bg-red-400' : tool.tier === 'recommended' ? 'bg-blue-400' : 'bg-purple-400'
                  }`} />
                  <span className="font-medium text-slate-700">{tool.name}</span>
                  {tool.free_tier && <span className="text-emerald-600 font-bold">{c.free}</span>}
                </a>
              ))}
              {(aiSuggestion?.tools || []).map(tool => (
                <span key={tool.name} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-blue-50 rounded-lg border border-blue-100">
                  <span className="font-medium text-slate-700">{tool.name}</span>
                  {tool.free && <span className="text-emerald-600 font-bold">{c.free}</span>}
                </span>
              ))}
            </div>
          )}

          {/* Training — single best option */}
          {(topTraining || topAiTraining) && (
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-amber-50 border border-amber-100 rounded-lg text-[10px]">
              <div className="flex items-center gap-2">
                <span>📚</span>
                <span className="font-medium text-slate-700">{isZh ? (topTraining?.name_zh || topAiTraining?.name) : (topTraining?.name || topAiTraining?.name)}</span>
                {topTraining?.certification && <span className="text-blue-600">🏅{topTraining.certification}</span>}
              </div>
              <span className="font-mono text-amber-700">{topTraining?.price_range || topAiTraining?.price}</span>
            </div>
          )}
          {/* More training if exists */}
          {entry && entry.training.length > 1 && (
            <div className="flex flex-wrap gap-1 ml-6">
              {entry.training.slice(1).map(t => (
                <span key={t.name} className="text-[9px] text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded">
                  {isZh ? t.name_zh : t.name} {t.price_range}
                </span>
              ))}
            </div>
          )}
          {/* KURSNET / BA Weiterbildung links for DE market */}
          {(() => {
            const deLinks = getGermanTrainingLinks(skill);
            return (
              <div className="flex flex-wrap gap-1.5">
                <a href={deLinks.kursnet.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-emerald-50 rounded-lg border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 transition-colors">
                  <span>{deLinks.kursnet.icon}</span>
                  <span className="font-medium text-emerald-800">{locale === 'de' ? deLinks.kursnet.label_de : locale === 'zh' ? deLinks.kursnet.label_zh : deLinks.kursnet.label}</span>
                  <span className="text-emerald-500">🇩🇪</span>
                </a>
                <a href={deLinks.weiterbildung.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-emerald-50 rounded-lg border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 transition-colors">
                  <span>{deLinks.weiterbildung.icon}</span>
                  <span className="font-medium text-emerald-800">{locale === 'de' ? deLinks.weiterbildung.label_de : locale === 'zh' ? deLinks.weiterbildung.label_zh : deLinks.weiterbildung.label}</span>
                  <span className="text-emerald-500">🇩🇪</span>
                </a>
              </div>
            );
          })()}

          {/* GitHub Path — numbered compact */}
          {(entry?.github_path || aiSuggestion?.github) && (
            <div className="flex flex-wrap gap-1.5">
              {(entry?.github_path || []).sort((a, b) => a.order - b.order).map(step => (
                <a key={step.repo_name} href={step.repo_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  title={isZh ? step.what_to_learn_zh : step.what_to_learn}>
                  <span className="text-blue-600 font-bold">{step.order}</span>
                  <span className="font-medium text-slate-700 truncate max-w-[120px]">{step.repo_name}</span>
                  <span className="text-slate-400">~{step.estimated_hours}h</span>
                </a>
              ))}
              {(aiSuggestion?.github || []).map((g, i) => (
                <span key={g.repo} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-blue-600 font-bold">{i + 1}</span>
                  <span className="font-medium text-slate-700 truncate max-w-[120px]">{g.repo}</span>
                  <span className="text-slate-400">~{g.hours}h</span>
                </span>
              ))}
            </div>
          )}

          {/* Capstone — one-liner */}
          {(entry?.capstone || aiSuggestion?.capstone) && (
            <div className="flex items-center gap-2 py-1.5 px-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px]">
              <span>🎯</span>
              <span className="font-medium text-slate-700 flex-1">
                {isZh ? (entry?.capstone?.title_zh || aiSuggestion?.capstone?.title_zh) : (entry?.capstone?.title || aiSuggestion?.capstone?.title)}
              </span>
              <span className="text-slate-400">
                ⏱{entry?.capstone?.time_hours || aiSuggestion?.capstone?.hours}h
              </span>
              <span className="text-indigo-600 font-medium truncate max-w-[150px]">
                → {isZh ? (entry?.capstone?.proves_to_employer_zh || aiSuggestion?.capstone?.proves) : (entry?.capstone?.proves_to_employer || aiSuggestion?.capstone?.proves)}
              </span>
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

  // Group skills by type for structured output
  const grouped = groupSkillsByType(analysis.prioritized);
  const allTypes: SkillType[] = [...ACTIONABLE_TYPES, ...SECONDARY_TYPES];

  for (const type of allTypes) {
    const skills = grouped[type];
    if (skills.length === 0) continue;
    const meta = SKILL_TYPE_META[type];
    const typeLabel = isZh ? meta.label.zh : meta.label.en;
    md += `## ${meta.icon} ${typeLabel}\n\n`;

    for (const skill of skills) {
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
    } // end skill loop
  } // end type loop

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
  const [secondaryOpen, setSecondaryOpen] = useState(false);

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

  // Match % for each target role (for arbitrage view)
  const roleMatchMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const { role } of resolvedRoles) {
      map.set(role.id, calcRoleMatch(userSkills, role));
    }
    return map;
  }, [resolvedRoles, userSkills]);

  // Market state for arbitrage view
  const [planMarket, setPlanMarket] = useState<'CN' | 'DE'>('CN');

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

  // PDF export — opens a new window with a clean print-optimized view
  const handlePdfExport = useCallback(() => {
    const md = generatePlanMarkdown(resolvedRoles, analysis, toolmapData, isZh);
    const date = new Date().toISOString().split('T')[0];
    const title = isZh ? `CareerLens 职业透镜 — 学习计划` : `CareerLens — Career Development Plan`;

    // Convert markdown to simple HTML
    const htmlContent = md
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      .replace(/---/g, '<hr/>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { margin: 1.5cm; size: A4; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 11px; line-height: 1.6; color: #1e293b; max-width: 700px; margin: 0 auto; padding: 20px; }
  h1 { font-size: 20px; color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-top: 0; }
  h2 { font-size: 14px; color: #334155; margin-top: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  h3 { font-size: 12px; color: #475569; margin-top: 12px; }
  blockquote { background: #fef3c7; border-left: 3px solid #f59e0b; padding: 6px 10px; margin: 8px 0; font-style: italic; border-radius: 4px; }
  li { margin: 2px 0; }
  strong { color: #1e293b; }
  hr { border: none; border-top: 1px solid #cbd5e1; margin: 16px 0; }
  .footer { text-align: center; color: #94a3b8; font-size: 9px; margin-top: 20px; }
</style></head><body>
  <p>${htmlContent}</p>
  <div class="footer">${title} | ${date}</div>
  <script>window.onload=function(){window.print();}<\/script>
</body></html>`);
    printWindow.document.close();
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

  // Group skills by type
  const skillsByType = useMemo(() => {
    return groupSkillsByType(analysis.prioritized);
  }, [analysis.prioritized]);

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
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={handlePdfExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              📄 PDF
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
              📥 MD
            </button>
          </div>
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
          {/* Per-type breakdown */}
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100">
            {([...ACTIONABLE_TYPES, ...SECONDARY_TYPES] as SkillType[]).map(type => {
              const count = skillsByType[type].length;
              if (count === 0) return null;
              const meta = SKILL_TYPE_META[type];
              const label = locale === 'zh' ? meta.label.zh : locale === 'de' ? meta.label.de : meta.label.en;
              return (
                <span key={type} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-50 rounded-full text-slate-600">
                  {meta.icon} {count} {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Career Leap visualization — before/after superposition */}
        {userSkills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-end gap-2 mb-2">
              <div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5">
                {(['CN', 'DE'] as const).map(m => (
                  <button key={m} onClick={() => setPlanMarket(m)}
                    className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${planMarket === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                    {m === 'CN' ? '🇨🇳 CN' : '🇩🇪 DE'}
                  </button>
                ))}
              </div>
            </div>
            <PlanArbitrageView
              resolvedRoles={resolvedRoles}
              matchMap={roleMatchMap}
              market={planMarket}
              locale={locale}
            />
          </div>
        )}

        {/* ─── Personality Harmony Hook ─── */}
        {(() => {
          try {
            const saved = typeof window !== 'undefined' ? localStorage.getItem('careerlens_personality') : null;
            const hasPersonality = saved && JSON.parse(saved)?.archetype;
            if (hasPersonality) {
              const p = JSON.parse(saved!);
              return (
                <div className="mb-6 bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.archetype.emoji}</span>
                    <div className="flex-1">
                      <div className="text-[10px] text-indigo-500 uppercase tracking-wider font-bold">
                        {isZh ? '职业和谐度' : 'Career Harmony'}
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {isZh ? p.archetype.name_zh : p.archetype.name}
                        <span className="text-slate-400 font-normal ml-2">{p.hollandCode}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{isZh ? p.archetype.tagline_zh : p.archetype.tagline}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${p.overallHarmony >= 70 ? 'text-emerald-600' : p.overallHarmony >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {p.overallHarmony}
                      </div>
                      <div className="text-[10px] text-slate-400">/100</div>
                    </div>
                  </div>
                </div>
              );
            }
            // No personality data — show conversion hook
            return (
              <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">🧠</span>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {isZh ? '你的技能匹配度不错，但……' : 'Your skill match looks good, but...'}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {isZh
                        ? '我们检测到你的目标岗位中可能存在性格排斥风险。想知道为什么有些工作让你精力充沛，有些却让你极度内耗吗？'
                        : 'We\'ve detected potential personality friction in your target roles. Want to know why some tasks energize you while others drain you?'}
                    </p>
                    <button onClick={() => router.push('/assess/personality')}
                      className="mt-3 px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                      {isZh ? '3分钟内耗诊断 →' : '3-min Career Friction Diagnostic →'}
                    </button>
                  </div>
                </div>
              </div>
            );
          } catch {
            return null;
          }
        })()}

        {/* Toggle expand all */}
        <div className="flex justify-end mb-3">
          <button onClick={() => setAllExpanded(!allExpanded)}
            className="text-xs text-blue-600 hover:underline">
            {allExpanded ? c.collapseAll : c.expandAll}
          </button>
        </div>

        {/* Skill cards — grouped by type */}
        <div className="space-y-6">
          {analysis.prioritized.length === 0 ? (
            <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-medium text-emerald-700">
                {isZh ? '你已具备所有所需技能！' : 'You already have all required skills!'}
              </p>
            </div>
          ) : (
            <>
              {/* Actionable types: Tool, Method, Standard — always visible */}
              {ACTIONABLE_TYPES.map(type => {
                const skills = skillsByType[type];
                if (skills.length === 0) return null;
                const meta = SKILL_TYPE_META[type];
                const label = locale === 'zh' ? meta.label.zh : locale === 'de' ? meta.label.de : meta.label.en;
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{meta.icon}</span>
                      <h2 className="text-sm font-bold text-slate-900">{label}</h2>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{skills.length}</span>
                    </div>
                    <div className="space-y-3">
                      {skills.map(skill => {
                        const entries = toolmapData.get(skill) || [];
                        const aiSug = aiSuggestions[skill];
                        const roleCount = analysis.skillRoleCount.get(skill) || 0;
                        return (
                          <div key={skill}>
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
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Secondary types: Domain, Soft — collapsed by default */}
              {SECONDARY_TYPES.some(type => skillsByType[type].length > 0) && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <button onClick={() => setSecondaryOpen(!secondaryOpen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📦</span>
                      <div>
                        <h2 className="text-sm font-bold text-slate-700">{c.otherSkills}</h2>
                        <p className="text-[10px] text-slate-400">{c.otherSkillsHint}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {SECONDARY_TYPES.reduce((sum, t) => sum + skillsByType[t].length, 0)}
                      </span>
                    </div>
                    <span className={`text-xs text-slate-400 transition-transform ${secondaryOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {secondaryOpen && (
                    <div className="px-4 pb-4 space-y-5 border-t border-slate-100">
                      {SECONDARY_TYPES.map(type => {
                        const skills = skillsByType[type];
                        if (skills.length === 0) return null;
                        const meta = SKILL_TYPE_META[type];
                        const label = locale === 'zh' ? meta.label.zh : locale === 'de' ? meta.label.de : meta.label.en;
                        return (
                          <div key={type} className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-base">{meta.icon}</span>
                              <h3 className="text-xs font-bold text-slate-600">{label}</h3>
                              <span className="text-[10px] text-slate-400">{skills.length}</span>
                            </div>
                            <div className="space-y-2">
                              {skills.map(skill => {
                                const entries = toolmapData.get(skill) || [];
                                const aiSug = aiSuggestions[skill];
                                return (
                                  <SkillDetailCard
                                    key={skill + allExpanded}
                                    skill={skill}
                                    toolmapEntries={entries}
                                    aiSuggestion={aiSug}
                                    locale={locale}
                                    c={c}
                                    industryId={resolvedRoles[0]?.industry.id}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* AI loading indicator */}
        {aiLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 py-4">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-blue-600">{c.aiLoading}</span>
          </div>
        )}

        {/* Mobile download buttons */}
        <div className="sm:hidden mt-6 flex gap-2">
          <button onClick={handlePdfExport}
            className="flex-1 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            📄 PDF
          </button>
          <button onClick={handleDownload}
            className="flex-1 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
            📥 MD
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
