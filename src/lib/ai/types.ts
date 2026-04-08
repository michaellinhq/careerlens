/** AI resume analysis response types */

export interface CareerProfile {
  /** Industry background detected */
  industry: string;
  industry_zh: string;
  /** Functional area: Quality, Engineering, Management, etc. */
  function_area: string;
  function_area_zh: string;
  /** Estimated career level */
  level: 'junior' | 'senior' | 'lead' | 'manager' | 'director';
  level_zh: string;
  /** Years of experience (estimated) */
  years_experience: number;
  /** Core competencies (top 5-8 skills) */
  core_competencies: string[];
  /** Language abilities */
  languages: { language: string; level: string }[];
  /** AI-generated career summary (2-3 sentences) */
  summary: string;
  summary_zh: string;
  /** Cross-industry potential — which other industries user could transition to */
  cross_industry: { industry_id: string; reason: string; reason_zh: string }[];
}

export interface NewsImpact {
  industry_id: string;
  direction: 'positive' | 'negative' | 'neutral';
  magnitude: number; // 1-100
  reason: string;
  reason_zh: string;
}

export interface NewsAnalysis {
  id: string;
  date: string;
  headline: string;
  headline_zh: string;
  source: string;
  url?: string;
  impacts: NewsImpact[];
  /** Personal impact summary (if user has profile) */
  personal_impact?: string;
  personal_impact_zh?: string;
}

export interface SignalTrend {
  period: string; // e.g. "2026-03"
  summary: string;
  summary_zh: string;
  top_beneficiaries: { industry_id: string; change_pct: number }[];
  top_risks: { industry_id: string; change_pct: number }[];
}
