import { chinaJobs, germanyJobs } from '@/lib/data';
import JobDetailClient from './JobDetailClient';

export function generateStaticParams() {
  return [...chinaJobs, ...germanyJobs].map(j => ({ code: j.code }));
}

export default function JobPage() {
  return <JobDetailClient />;
}
