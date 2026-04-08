import { chatCompletion, isAIAvailable } from './qwen-client';
import { parseResume, calcRoleMatch, calcIndustryMatch } from '../resume-parser';
import { allIndustries } from '../career-map';
import type { CareerProfile } from './types';

const SYSTEM_PROMPT = `你是一位资深制造业人力资源顾问，专注于高端制造业（汽车、航空、机器人、电子、能源、医疗器械、工业自动化、IT制造、咨询）的职业发展分析。

用户会给你一段简历文本。请分析并返回JSON（不要Markdown代码块，直接返回JSON）：

{
  "industry": "Automotive Electronics",
  "industry_zh": "汽车电子",
  "function_area": "Quality Management",
  "function_area_zh": "质量管理",
  "level": "senior",
  "level_zh": "高级工程师",
  "years_experience": 8,
  "core_competencies": ["IATF 16949", "FMEA", "SPC", "VDA 6.3"],
  "languages": [{"language": "Chinese", "level": "Native"}, {"language": "English", "level": "C1"}],
  "summary": "Experienced automotive quality professional...",
  "summary_zh": "资深汽车质量专家...",
  "cross_industry": [
    {"industry_id": "medical-devices", "reason": "Quality systems (ISO 13485) overlap significantly with automotive IATF", "reason_zh": "质量体系(ISO 13485)与汽车IATF高度重合"},
    {"industry_id": "aerospace", "reason": "AS9100 shares DNA with automotive quality standards", "reason_zh": "AS9100与汽车质量标准同源"}
  ]
}

level必须是: junior, senior, lead, manager, director 之一。
industry_id必须是: automotive, electronics, aerospace, consulting, energy, industrial-automation, medical-devices, it-manufacturing, robotics 之一。
core_competencies用英文技能名（与行业标准一致）。
summary用2-3句话概括此人的职业竞争力和发展潜力。`;

/**
 * Analyze resume with AI (Qwen) or fall back to rule-based analysis.
 */
export async function analyzeResume(resumeText: string): Promise<{
  profile: CareerProfile;
  skills: string[];
  industryMatches: { id: string; name: string; name_zh: string; icon: string; match: number; avgSalaryCN: number; avgSalaryDE: number; roleCount: number }[];
  mode: 'ai' | 'rules';
}> {
  // Always extract skills with rules engine
  const skills = parseResume(resumeText);

  // Calculate industry matches
  const industryMatches = allIndustries.map(ind => ({
    id: ind.id,
    name: ind.name,
    name_zh: ind.name_zh,
    icon: ind.icon,
    match: calcIndustryMatch(skills, ind),
    avgSalaryCN: ind.avg_salary_cn,
    avgSalaryDE: ind.avg_salary_de,
    roleCount: ind.roles.length,
  })).sort((a, b) => b.match - a.match);

  // Try AI analysis
  if (isAIAvailable() && resumeText.length > 50) {
    try {
      const response = await chatCompletion([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: resumeText },
      ]);

      // Parse JSON from response (handle possible markdown wrapping)
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const profile: CareerProfile = JSON.parse(jsonStr);

      // Merge AI-detected competencies with rule-based skills
      for (const comp of profile.core_competencies) {
        if (!skills.includes(comp)) skills.push(comp);
      }

      return { profile, skills, industryMatches, mode: 'ai' };
    } catch (e) {
      console.warn('AI analysis failed, falling back to rules:', e);
    }
  }

  // Fallback: generate profile from rules
  const profile = generateRulesProfile(skills, resumeText);
  return { profile, skills, industryMatches, mode: 'rules' };
}

/** Generate a basic career profile using rule-based heuristics */
function generateRulesProfile(skills: string[], text: string): CareerProfile {
  // Detect industry from skill clusters
  const industryScores = allIndustries.map(ind => ({
    ind,
    score: calcIndustryMatch(skills, ind),
  })).sort((a, b) => b.score - a.score);

  const topIndustry = industryScores[0]?.ind;

  // Detect experience level from text patterns
  const yearMatch = text.match(/(\d{1,2})\s*(?:years?|年|Jahre?)/i);
  const years = yearMatch ? parseInt(yearMatch[1]) : estimateYears(skills);
  const level = years >= 15 ? 'director' : years >= 10 ? 'manager' : years >= 6 ? 'lead' : years >= 3 ? 'senior' : 'junior';
  const levelZh = { junior: '初级', senior: '高级', lead: '主管', manager: '经理', director: '总监' }[level];

  // Detect languages
  const languages: { language: string; level: string }[] = [];
  if (/中文|chinese|母语|native.*chinese/i.test(text)) languages.push({ language: 'Chinese', level: 'Native' });
  if (/english|英语|IELTS|TOEFL|CET/i.test(text)) languages.push({ language: 'English', level: detectLangLevel(text, 'english') });
  if (/german|deutsch|德语|Goethe|TestDaF/i.test(text)) languages.push({ language: 'German', level: detectLangLevel(text, 'german') });
  if (languages.length === 0) languages.push({ language: 'Chinese', level: 'Native' });

  // Detect function area
  const funcArea = detectFunctionArea(skills);

  // Cross-industry potential
  const crossIndustry = industryScores.slice(1, 4)
    .filter(x => x.score > 10)
    .map(x => ({
      industry_id: x.ind.id,
      reason: `${x.score}% skill overlap with ${x.ind.name}`,
      reason_zh: `与${x.ind.name_zh}有${x.score}%技能重合`,
    }));

  return {
    industry: topIndustry?.name || 'Manufacturing',
    industry_zh: topIndustry?.name_zh || '制造业',
    function_area: funcArea.en,
    function_area_zh: funcArea.zh,
    level,
    level_zh: levelZh,
    years_experience: years,
    core_competencies: skills.slice(0, 8),
    languages,
    summary: `${level.charAt(0).toUpperCase() + level.slice(1)}-level ${funcArea.en} professional with ${years} years of experience in ${topIndustry?.name || 'manufacturing'}. Key strengths in ${skills.slice(0, 3).join(', ')}.`,
    summary_zh: `${topIndustry?.name_zh || '制造业'}${funcArea.zh}方向，${levelZh}级别，约${years}年经验。核心优势：${skills.slice(0, 3).join('、')}。`,
    cross_industry: crossIndustry,
  };
}

function estimateYears(skills: string[]): number {
  // More skills generally = more experience
  if (skills.length >= 20) return 10;
  if (skills.length >= 12) return 6;
  if (skills.length >= 6) return 3;
  return 1;
}

function detectLangLevel(text: string, lang: string): string {
  const patterns: Record<string, Record<string, RegExp>> = {
    english: { 'C1+': /C1|C2|fluent|流利|IELTS\s*[789]/i, 'B2': /B2|good|良好|CET-?6/i, 'B1': /B1|intermediate|中等|CET-?4/i },
    german: { 'C1+': /C1|C2|fließend|流利/i, 'B2': /B2|gut|良好/i, 'B1': /B1|Goethe|基础/i },
  };
  for (const [level, regex] of Object.entries(patterns[lang] || {})) {
    if (regex.test(text)) return level;
  }
  return 'B1';
}

function detectFunctionArea(skills: string[]): { en: string; zh: string } {
  const skillSet = new Set(skills.map(s => s.toLowerCase()));
  const areas: { en: string; zh: string; keywords: string[] }[] = [
    { en: 'Quality Management', zh: '质量管理', keywords: ['iatf 16949', 'iso 9001', 'fmea', 'spc', 'vda 6.3', '8d', 'audit', 'iso 13485'] },
    { en: 'Software Engineering', zh: '软件工程', keywords: ['autosar', 'embedded c/c++', 'rtos', 'python', 'javascript', 'ros2'] },
    { en: 'Mechanical Engineering', zh: '机械工程', keywords: ['solidworks', 'catia', 'fea', 'gd&t', 'dfm/dfa', 'ansys'] },
    { en: 'Electrical Engineering', zh: '电气工程', keywords: ['pcb design', 'circuit design', 'emc', 'fpga', 'plc programming'] },
    { en: 'Process Engineering', zh: '工艺工程', keywords: ['lean manufacturing', 'six sigma', 'cnc programming', 'injection molding', 'spc/sqc'] },
    { en: 'Supply Chain', zh: '供应链', keywords: ['s&op', 'procurement/sourcing', 'sap mm', 'supplier development', 'demand forecasting'] },
    { en: 'Project Management', zh: '项目管理', keywords: ['pmp/ipma', 'agile/scrum', 'project management', 'stakeholder management'] },
    { en: 'Data & AI', zh: '数据与AI', keywords: ['machine learning', 'deep learning', 'data analysis', 'python', 'tensorflow/pytorch'] },
    { en: 'Automation & Robotics', zh: '自动化与机器人', keywords: ['plc programming', 'ros2', 'motion control', 'industrial automation', 'scada'] },
  ];

  let bestArea = areas[0];
  let bestScore = 0;
  for (const area of areas) {
    const score = area.keywords.filter(k => skillSet.has(k) || skills.some(s => s.toLowerCase().includes(k))).length;
    if (score > bestScore) { bestScore = score; bestArea = area; }
  }
  return { en: bestArea.en, zh: bestArea.zh };
}
