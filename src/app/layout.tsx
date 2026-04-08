import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/locale-context";
import { SkillsProvider } from "@/lib/skills-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerLens — Data-Driven Career Intelligence",
  description: "Find high-value, low-competition careers. Reverse-engineer the path to get there. Powered by BLS, O*NET, Eurostat data.",
  metadataBase: new URL('https://careerlens.pages.dev'),
  openGraph: {
    title: 'CareerLens — 转行宝',
    description: 'Data-driven career intelligence: 200+ jobs ranked, skill matching, industry learning paths.',
    type: 'website',
    siteName: 'CareerLens',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CareerLens — Data-Driven Career Intelligence',
    description: 'Find high-value, low-competition manufacturing careers in China and Germany.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LocaleProvider>
          <SkillsProvider>
            {children}
          </SkillsProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
