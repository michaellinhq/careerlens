/**
 * Common types for external data sources (BLS, O*NET, Eurostat).
 * All API clients return data through these normalized interfaces.
 */

export interface DataAttribution {
  source: string;        // e.g. "U.S. Bureau of Labor Statistics"
  source_short: string;  // e.g. "BLS"
  url: string;           // link to the specific data page
  last_updated: string;  // ISO date when data was last fetched
  note?: string;         // e.g. "Annual mean wage, May 2024"
}

export interface SalaryDataPoint {
  soc_code: string;
  title: string;
  annual_mean: number;       // USD
  annual_median: number;     // USD
  annual_10th: number;       // 10th percentile
  annual_25th: number;       // 25th percentile
  annual_75th: number;       // 75th percentile
  annual_90th: number;       // 90th percentile
  hourly_mean: number;
  employment: number;        // total employed
  attribution: DataAttribution;
}

export interface OnetSkill {
  element_id: string;        // e.g. "2.A.1.a"
  name: string;              // e.g. "Reading Comprehension"
  description: string;
  level: number;             // 0-7 importance/level scale
  importance: number;        // 0-100
}

export interface OnetTechnology {
  name: string;              // e.g. "Python"
  hot_technology: boolean;   // flagged as in-demand
  category: string;          // e.g. "Analytical or scientific software"
}

export interface OnetAiExposure {
  soc_code: string;
  title: string;
  exposure_score: number;    // 0-1, higher = more exposed to AI automation
  tasks_automatable: number; // count of tasks AI can perform
  tasks_total: number;
  source: string;            // e.g. "Felten et al. 2023" or "OpenAI/Eloundou 2023"
}

export interface OnetOccupation {
  soc_code: string;
  title: string;
  description: string;
  skills: OnetSkill[];
  knowledge: OnetSkill[];
  technologies: OnetTechnology[];
  tasks: string[];
  ai_exposure?: OnetAiExposure;
  attribution: DataAttribution;
}
