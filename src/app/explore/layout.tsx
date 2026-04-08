import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opportunity Leaderboard — CareerLens',
  description: 'Browse 200+ high-value career opportunities ranked by salary, growth, and competition across China and Germany manufacturing industries.',
  openGraph: {
    title: 'CareerLens — Opportunity Leaderboard',
    description: 'Find high-value, low-competition manufacturing careers in China and Germany.',
    type: 'website',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
