import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Macro Signals — CareerLens',
  description: 'How geopolitics and economics reshape career opportunities. Track rising and declining manufacturing jobs in real time.',
  openGraph: {
    title: 'CareerLens — Macro Career Signals',
    description: 'Track how global events impact manufacturing career opportunities.',
    type: 'website',
  },
};

export default function SignalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
