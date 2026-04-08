import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skill-Based Career Matching — CareerLens',
  description: 'Select your skills and discover which high-value manufacturing jobs match your profile. Personalized gap analysis with learning paths.',
  openGraph: {
    title: 'CareerLens — Skill-Based Career Matching',
    description: 'Input your skills, get matched to high-value careers with gap analysis and learning roadmaps.',
    type: 'website',
  },
};

export default function AssessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
