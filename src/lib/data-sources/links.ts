/**
 * Generate direct links to official salary/occupation data portals.
 * These links let users verify our data against authoritative sources.
 */

/**
 * BA Entgeltatlas — official German salary data by KldB code.
 * Shows median salary, gender gap, regional differences.
 */
export function getEntgeltatlasUrl(kldbCode: string): string {
  return `https://entgeltatlas.arbeitsagentur.de/entgeltatlas/ergebnis/${kldbCode}`;
}

/**
 * BERUFENET — BA's occupation encyclopedia by KldB code.
 * Shows tasks, requirements, training paths.
 */
export function getBerufenetUrl(kldbCode: string): string {
  return `https://berufenet.arbeitsagentur.de/berufenet/faces/index?path=null/suchergebnisse/kurzbeschreibung&dkz=${kldbCode}`;
}

/**
 * BLS OES — US salary data by SOC code.
 * Shows mean, median, percentiles, employment.
 */
export function getBlsUrl(socCode: string): string {
  const clean = socCode.replace('-', '').replace(/\.\d+$/, '');
  return `https://www.bls.gov/oes/current/oes${clean}.htm`;
}

/**
 * O*NET OnLine — US occupation details by SOC code.
 * Shows skills, knowledge, tasks, technologies.
 */
export function getOnetUrl(socCode: string): string {
  return `https://www.onetonline.org/link/summary/${socCode}`;
}

/**
 * KURSNET — BA's training/continuing education search.
 * Search by keyword to find Weiterbildung courses.
 */
export function getKursnetUrl(keyword: string, region?: string): string {
  const params = new URLSearchParams({
    keywords: keyword,
    ...(region ? { re: region } : {}),
  });
  return `https://kursnet-finden.arbeitsagentur.de/kurs/portal/bildungsangeboteSuche/suche?${params.toString()}`;
}

/**
 * BA Weiterbildungssuche — simplified training search.
 */
export function getWeiterbildungUrl(keyword: string): string {
  return `https://www.arbeitsagentur.de/karriere-und-weiterbildung/kurse-suchen?suchbegriff=${encodeURIComponent(keyword)}`;
}

/**
 * All external data links for a role.
 */
export function getRoleDataLinks(socCode: string, kldbCode: string) {
  return {
    entgeltatlas: { url: getEntgeltatlasUrl(kldbCode), label: 'BA Entgeltatlas', label_zh: 'BA薪资地图', icon: '🇩🇪' },
    berufenet: { url: getBerufenetUrl(kldbCode), label: 'BERUFENET', label_zh: 'BERUFENET职业百科', icon: '📖' },
    bls: { url: getBlsUrl(socCode), label: 'BLS Salary Data', label_zh: 'BLS薪资数据', icon: '🇺🇸' },
    onet: { url: getOnetUrl(socCode), label: 'O*NET Skills', label_zh: 'O*NET技能图谱', icon: '🔬' },
  };
}

/**
 * German training links for a skill — KURSNET + BA Weiterbildung.
 */
export function getGermanTrainingLinks(skillName: string) {
  return {
    kursnet: { url: getKursnetUrl(skillName), label: 'KURSNET Kurse', label_zh: 'KURSNET课程搜索', label_de: 'KURSNET Kurse', icon: '🎓' },
    weiterbildung: { url: getWeiterbildungUrl(skillName), label: 'BA Weiterbildung', label_zh: 'BA继续教育', label_de: 'BA Weiterbildung', icon: '📚' },
  };
}
