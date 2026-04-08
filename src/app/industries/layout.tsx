import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industry Career Ladders — CareerLens',
  description: 'Explore 8 high-income engineering industries with detailed salary ladders by role and level. Compare junior to director salaries across China and Germany.',
  openGraph: {
    title: 'CareerLens — Industry Career Ladders',
    description: 'See salary progression from Junior to Director across 8 engineering industries.',
  },
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
