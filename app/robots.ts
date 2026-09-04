import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skillconnect.vercel.app";

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/academician/", "/industry/", "/student/", "/login", "/dashboard", "/applications", "/assessments", "/opportunities", "/portfolio", "/skills", "/student-dashboard"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}