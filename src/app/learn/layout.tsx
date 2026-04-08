import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learning Paths by Industry — CareerLens',
  description: 'Industry-specific tools, training providers, GitHub repos, and capstone projects for 68+ manufacturing skills across 9 industries.',
  openGraph: {
    title: 'CareerLens — Industry Learning Paths',
    description: 'Discover the exact tools, training, and projects needed for manufacturing careers across 9 industries.',
    type: 'website',
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
