/**
 * O*NET Web Services API Client
 *
 * API docs: https://services.onetcenter.org/reference/
 * Register (free): https://services.onetcenter.org/developer/signup
 *
 * Authentication: HTTP Basic Auth (username + password)
 *
 * Key endpoints:
 *   /ws/online/occupations/{soc_code}           — occupation summary
 *   /ws/online/occupations/{soc_code}/summary/skills     — skills
 *   /ws/online/occupations/{soc_code}/summary/knowledge  — knowledge areas
 *   /ws/online/occupations/{soc_code}/summary/technology  — tools & technology
 *   /ws/online/occupations/{soc_code}/summary/tasks      — work tasks
 *
 * Rate limits: 10 requests/second recommended
 */

import type { OnetOccupation, OnetSkill, OnetTechnology, DataAttribution } from './types';

const ONET_BASE_URL = 'https://services.onetcenter.org/ws';

// In-memory cache
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (O*NET data updates annually)

function getAuthHeader(): string | null {
  const username = process.env.ONET_USERNAME;
  const password = process.env.ONET_PASSWORD;
  if (!username || !password) return null;
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
}

async function onetFetch<T>(path: string): Promise<T | null> {
  const cacheKey = path;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }

  const auth = getAuthHeader();
  if (!auth) {
    console.warn('O*NET credentials not configured (ONET_USERNAME, ONET_PASSWORD)');
    return null;
  }

  try {
    const response = await fetch(`${ONET_BASE_URL}${path}`, {
      headers: {
        'Authorization': auth,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 422) {
        // SOC code not found
        return null;
      }
      throw new Error(`O*NET API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as T;
    cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
    return data;
  } catch (error) {
    console.error(`O*NET fetch failed for ${path}:`, error);
    return null;
  }
}

// ─── O*NET response types (partial, what we need) ───

interface OnetOccupationResponse {
  code: string;
  title: string;
  description: string;
  sample_of_reported_job_titles?: { title: string }[];
}

interface OnetSkillResponse {
  element: {
    id: string;
    name: string;
    description: string;
  }[];
}

interface OnetDetailedSkillResponse {
  element: {
    id: string;
    name: string;
    description: string;
    score: {
      value: string;
      scale_id: string; // "IM" = importance, "LV" = level
    };
  }[];
}

interface OnetTechResponse {
  category: {
    title: { name: string };
    example: {
      name: string;
      hot_technology?: boolean;
    }[];
  }[];
}

interface OnetTaskResponse {
  task: {
    statement: string;
    score: { value: string };
  }[];
}

/**
 * Fetch full occupation data including skills, knowledge, tech, and tasks.
 */
export async function fetchOccupation(socCode: string): Promise<OnetOccupation | null> {
  // Fetch all data in parallel
  const [occResp, skillsResp, knowledgeResp, techResp, tasksResp] = await Promise.all([
    onetFetch<OnetOccupationResponse>(`/online/occupations/${socCode}`),
    onetFetch<OnetDetailedSkillResponse>(`/online/occupations/${socCode}/summary/skills`),
    onetFetch<OnetDetailedSkillResponse>(`/online/occupations/${socCode}/summary/knowledge`),
    onetFetch<OnetTechResponse>(`/online/occupations/${socCode}/summary/technology`),
    onetFetch<OnetTaskResponse>(`/online/occupations/${socCode}/summary/tasks`),
  ]);

  if (!occResp) return null;

  const attribution: DataAttribution = {
    source: 'O*NET OnLine',
    source_short: 'O*NET',
    url: `https://www.onetonline.org/link/summary/${socCode}`,
    last_updated: new Date().toISOString().split('T')[0],
    note: 'O*NET 29.0 Database',
  };

  // Parse skills
  const skills: OnetSkill[] = (skillsResp?.element || []).map(e => ({
    element_id: e.id,
    name: e.name,
    description: e.description,
    level: e.score?.scale_id === 'LV' ? parseFloat(e.score.value) : 0,
    importance: e.score?.scale_id === 'IM' ? parseFloat(e.score.value) : 0,
  }));

  // Parse knowledge
  const knowledge: OnetSkill[] = (knowledgeResp?.element || []).map(e => ({
    element_id: e.id,
    name: e.name,
    description: e.description,
    level: e.score?.scale_id === 'LV' ? parseFloat(e.score.value) : 0,
    importance: e.score?.scale_id === 'IM' ? parseFloat(e.score.value) : 0,
  }));

  // Parse technologies
  const technologies: OnetTechnology[] = [];
  if (techResp?.category) {
    for (const cat of techResp.category) {
      for (const ex of cat.example || []) {
        technologies.push({
          name: ex.name,
          hot_technology: ex.hot_technology || false,
          category: cat.title.name,
        });
      }
    }
  }

  // Parse tasks
  const tasks: string[] = (tasksResp?.task || [])
    .sort((a, b) => parseFloat(b.score.value) - parseFloat(a.score.value))
    .map(t => t.statement);

  return {
    soc_code: socCode,
    title: occResp.title,
    description: occResp.description,
    skills,
    knowledge,
    technologies,
    tasks,
    attribution,
  };
}

/**
 * Fetch just the skills for a SOC code (lighter request).
 */
export async function fetchSkills(socCode: string): Promise<OnetSkill[]> {
  const resp = await onetFetch<OnetDetailedSkillResponse>(`/online/occupations/${socCode}/summary/skills`);
  if (!resp?.element) return [];
  return resp.element.map(e => ({
    element_id: e.id,
    name: e.name,
    description: e.description,
    level: e.score?.scale_id === 'LV' ? parseFloat(e.score.value) : 0,
    importance: e.score?.scale_id === 'IM' ? parseFloat(e.score.value) : 0,
  }));
}

/**
 * Fetch hot technologies for a SOC code.
 */
export async function fetchTechnologies(socCode: string): Promise<OnetTechnology[]> {
  const resp = await onetFetch<OnetTechResponse>(`/online/occupations/${socCode}/summary/technology`);
  if (!resp?.category) return [];
  const techs: OnetTechnology[] = [];
  for (const cat of resp.category) {
    for (const ex of cat.example || []) {
      techs.push({
        name: ex.name,
        hot_technology: ex.hot_technology || false,
        category: cat.title.name,
      });
    }
  }
  return techs;
}

/**
 * Check if O*NET credentials are configured.
 */
export function isOnetConfigured(): boolean {
  return !!(process.env.ONET_USERNAME && process.env.ONET_PASSWORD);
}

/**
 * Get the O*NET OnLine URL for a SOC code.
 */
export function getOnetUrl(socCode: string): string {
  return `https://www.onetonline.org/link/summary/${socCode}`;
}
