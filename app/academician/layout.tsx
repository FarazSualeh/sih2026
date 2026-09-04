import type { Metadata } from 'next';
import { AcademicianProfileProvider } from '@/components/academician/profile-provider';

export const metadata: Metadata = {
  title: 'Academician workspace',
  robots: { index: false, follow: false },
};

export default function AcademicianLayout({ children }: { children: React.ReactNode }) {
  return <AcademicianProfileProvider>{children}</AcademicianProfileProvider>;
}
