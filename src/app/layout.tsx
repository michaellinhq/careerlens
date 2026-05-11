import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { LocaleProvider } from "@/lib/locale-context";
import { SkillsProvider } from "@/lib/skills-context";
import { CartProvider } from "@/lib/cart-context";


export const metadata: Metadata = {
  title: "CareerLens — Reverse Career Model for Manufacturing Engineers",
  description: "Find higher-value manufacturing roles first, then reverse-engineer the shortest path to get there across China and Germany.",
  metadataBase: new URL('https://careerlens.pages.dev'),
  openGraph: {
    title: 'CareerLens — 职业透镜',
    description: '制造业工程师跨行业、跨市场职业迁移引擎。',
    type: 'website',
    siteName: 'CareerLens',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CareerLens — Reverse Career Model',
    description: 'You may be 1-3 skills away from a higher-value manufacturing role.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LocaleProvider>
          <SkillsProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </SkillsProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
