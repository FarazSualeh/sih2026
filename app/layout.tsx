import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MockStoreProvider } from "@/lib/mock-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://skillconnect.vercel.app"),
  title: {
    default: "SkillConnect | Skills, assessments and opportunity",
    template: "%s | SkillConnect",
  },
  description: "SkillConnect connects learners, academicians and industry through verified skills, standardized assessments and career opportunities.",
  applicationName: "SkillConnect",
  keywords: ["skill mapping", "student placement", "industry academia collaboration", "skill assessments", "internships"],
  authors: [{ name: "SkillConnect" }],
  creator: "SkillConnect",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "SkillConnect",
    title: "SkillConnect | Skills, assessments and opportunity",
    description: "A skills-first ecosystem connecting learners, institutions and industry.",
  },
  twitter: {
    card: "summary",
    title: "SkillConnect | Skills, assessments and opportunity",
    description: "Connect verified skills with learning and career opportunities.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><MockStoreProvider>{children}</MockStoreProvider></body>
    </html>
  );
}
