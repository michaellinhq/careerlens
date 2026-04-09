/**
 * Data Sources — unified exports for BLS, O*NET, and future APIs.
 */

export { fetchSalaryBySOC, fetchSalaryBatch, getOEWSSeriesUrl } from './bls-client';
export { fetchOccupation, fetchSkills, fetchTechnologies, isOnetConfigured, getOnetUrl } from './onet-client';
export type { DataAttribution, SalaryDataPoint, OnetOccupation, OnetSkill, OnetTechnology, OnetAiExposure } from './types';
export { getEntgeltatlasUrl, getBerufenetUrl, getBlsUrl, getOnetUrl as getOnetOnlineUrl, getRoleDataLinks, getKursnetUrl, getWeiterbildungUrl, getGermanTrainingLinks } from './links';
