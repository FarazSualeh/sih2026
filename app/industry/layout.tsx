import type { Metadata } from 'next';
import { IndustryProfileProvider } from '@/components/industry/industry-profile-provider';

export const metadata: Metadata = {
  title: 'Industry workspace',
  robots: { index: false, follow: false },
};

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
  return <IndustryProfileProvider>{children}</IndustryProfileProvider>;
}
