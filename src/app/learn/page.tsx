'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LearnPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/plan'); }, [router]);
  return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Redirecting...</div>;
}
