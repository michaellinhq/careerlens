import { skillCategories } from './data';
import { allIndustries } from './career-map';

// Build keyword → canonical skill mapping at module level
interface SkillAlias {
  canonical: string;
  pattern: RegExp;
}

function buildAliases(): SkillAlias[] {
  const aliases: SkillAlias[] = [];
  const seen = new Set<string>();

  // 1. From skillCategories (user-facing taxonomy)
  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      if (seen.has(skill.toLowerCase())) continue;
      seen.add(skill.toLowerCase());
      aliases.push({ canonical: skill, pattern: buildPattern(skill) });
    }
  }

  // 2. From career-map core_skills + key_skills (industry-specific)
  for (const industry of allIndustries) {
    for (const role of industry.roles) {
      for (const skill of role.core_skills) {
        const key = skill.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        aliases.push({ canonical: skill, pattern: buildPattern(skill) });
      }
      for (const lv of role.levels) {
        for (const skill of lv.key_skills) {
          const key = skill.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          aliases.push({ canonical: skill, pattern: buildPattern(skill) });
        }
      }
    }
  }

  return aliases;
}

function buildPattern(skill: string): RegExp {
  // Escape regex special chars, then create word-boundary pattern
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // For short skills (<=3 chars like "R", "Go", "C#"), require word boundaries
  // For longer ones, allow partial matching with boundaries
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

// Extra aliases: Chinese names, abbreviations, common resume variants
const EXTRA_ALIASES: [string, string[]][] = [
  ['Python', ['python3', 'python2', 'Python开发', 'Python编程']],
  ['C/C++', ['C++', 'c语言', 'cpp']],
  ['C#', ['C#/.NET', 'csharp', '.NET']],
  ['MATLAB/Simulink', ['MATLAB', 'Simulink', '仿真建模']],
  ['Six Sigma', ['6sigma', '六西格玛', 'DMAIC', 'Green Belt', 'Black Belt', '绿带', '黑带']],
  ['Lean Manufacturing', ['精益生产', '精益制造', 'Lean']],
  ['SolidWorks', ['solidworks', 'SW三维建模']],
  ['CATIA', ['catia v5', 'catia v6']],
  ['PLC Programming', ['PLC', 'SPS', 'S7-1500', 'S7-1200', 'TIA Portal']],
  ['ISO 9001', ['质量管理体系', 'QMS']],
  ['IATF 16949', ['TS 16949', '汽车质量管理']],
  ['FMEA', ['失效模式分析', '故障模式分析', 'PFMEA', 'DFMEA']],
  ['SPC/SQC', ['SPC', 'SQC', '统计过程控制']],
  ['GD&T', ['几何尺寸和公差', '形位公差']],
  ['AUTOSAR', ['autosar classic', 'autosar adaptive']],
  ['CAN/LIN', ['CAN总线', 'CAN bus', 'LIN bus']],
  ['ROS2', ['ROS', 'ROS 2', '机器人操作系统']],
  ['Docker', ['docker-compose', 'dockerfile', '容器化']],
  ['Kubernetes', ['k8s', 'K8s']],
  ['Machine Learning', ['机器学习', 'ML', 'sklearn']],
  ['Deep Learning', ['深度学习', 'DL']],
  ['Computer Vision', ['计算机视觉', 'CV', '视觉检测']],
  ['Project Management', ['项目管理', 'PMP', 'IPMA']],
  ['Data Analysis', ['数据分析', '数据处理']],
  ['SQL', ['MySQL', 'PostgreSQL', 'SQL Server', 'Oracle DB']],
  ['Power BI', ['Power BI', 'Tableau', '数据可视化']],
  ['SAP MM', ['SAP', 'SAP PP', 'SAP QM', 'S/4HANA']],
  ['Agile/Scrum', ['Scrum', 'Agile', 'Kanban', '敏捷']],
  ['ISO 13485', ['医疗器械质量', '医疗器械']],
  ['FDA 21 CFR 820', ['FDA', '510(k)', 'PMA']],
  ['Functional Safety (ISO 26262)', ['ISO 26262', '功能安全', 'ASIL']],
  ['EMC', ['EMC Design', '电磁兼容', 'EMI']],
  ['PCB Design', ['PCB', '电路板设计', 'Altium', 'Cadence Allegro']],
  ['Circuit Design', ['电路设计', '模拟电路', '数字电路']],
  ['FPGA', ['Xilinx', 'Intel Quartus', 'Vivado', 'Verilog', 'VHDL']],
  ['German B1+', ['德语', 'Deutsch', 'Goethe', 'TestDaF', 'DSH']],
  ['English C1+', ['英语', 'IELTS', 'TOEFL', 'CET-6']],
  ['Root Cause Analysis (8D)', ['8D', '8D Report', '根因分析', 'Root Cause']],
  ['Audit (VDA 6.3)', ['VDA 6.3', 'VDA 6.5', '过程审核', 'Process Audit']],
  ['DO-178C', ['DO-178B', 'DO-178C', '机载软件']],
  ['AS9100', ['AS9100', 'AS9102', '航空质量']],
  ['Wind/Solar Engineering', ['风电', '光伏', '新能源', 'Wind Energy', 'Solar']],
  ['Battery Systems', ['电池', '锂电', 'Battery', '储能']],
  ['Hydrogen/Fuel Cell', ['氢能', '燃料电池', 'Hydrogen', 'Fuel Cell']],
  ['IIoT', ['工业物联网', 'Industrial IoT']],
  ['Digital Twin', ['数字孪生']],
  ['SCADA', ['SCADA', 'DCS', '组态']],
  ['MES', ['MES', 'MOM', '制造执行系统']],
];

let _aliases: SkillAlias[] | null = null;

function getAllAliases(): SkillAlias[] {
  if (_aliases) return _aliases;

  _aliases = buildAliases();

  // Add extra aliases
  for (const [canonical, variants] of EXTRA_ALIASES) {
    for (const v of variants) {
      const key = v.toLowerCase();
      // Only add if not already covered
      if (!_aliases.some(a => a.canonical.toLowerCase() === key)) {
        _aliases.push({ canonical, pattern: buildPattern(v) });
      }
    }
  }

  return _aliases;
}

/**
 * Parse resume text and extract matching skills.
 * Returns canonical skill names sorted by relevance (longer matches first).
 */
export function parseResume(text: string): string[] {
  if (!text || text.trim().length < 10) return [];

  const aliases = getAllAliases();
  const matched = new Set<string>();

  for (const alias of aliases) {
    if (alias.pattern.test(text)) {
      matched.add(alias.canonical);
    }
  }

  // Sort: longer skill names first (more specific = more valuable)
  return Array.from(matched).sort((a, b) => b.length - a.length);
}

/**
 * Calculate match percentage between user skills and a role's required skills.
 */
export function calcRoleMatch(userSkills: string[], role: { core_skills: string[]; levels: { key_skills: string[] }[] }): number {
  if (!userSkills.length) return 0;

  const roleSkills = new Set<string>();
  for (const s of role.core_skills) roleSkills.add(s.toLowerCase());
  for (const lv of role.levels) {
    for (const s of lv.key_skills) roleSkills.add(s.toLowerCase());
  }

  if (roleSkills.size === 0) return 0;

  const userLower = userSkills.map(s => s.toLowerCase());
  let matchCount = 0;
  for (const rs of roleSkills) {
    if (userLower.some(us =>
      us.includes(rs) || rs.includes(us) ||
      us.replace(/[/()]/g, ' ').includes(rs.replace(/[/()]/g, ' '))
    )) {
      matchCount++;
    }
  }

  return Math.round((matchCount / roleSkills.size) * 100);
}

/**
 * Calculate industry match — average of top role matches.
 */
export function calcIndustryMatch(userSkills: string[], industry: { roles: { core_skills: string[]; levels: { key_skills: string[] }[] }[] }): number {
  if (!userSkills.length || !industry.roles.length) return 0;

  const roleMatches = industry.roles.map(r => calcRoleMatch(userSkills, r));
  roleMatches.sort((a, b) => b - a);

  // Use top 3 roles or all if fewer
  const topN = roleMatches.slice(0, Math.min(3, roleMatches.length));
  return Math.round(topN.reduce((sum, m) => sum + m, 0) / topN.length);
}
