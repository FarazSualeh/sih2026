"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  admin: "Admin",
  users: "Users",
  skills: "Skills",
  assessments: "Assessments",
  opportunities: "Opportunities",
  applications: "Applications",
  analytics: "Analytics",
  reports: "Reports",
  settings: "Settings",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted"><Link href="/admin" className="hover:text-ink">Admin</Link>{segments.slice(1).map((segment, index) => <span key={segment} className="flex items-center gap-1.5"><span aria-hidden="true">/</span>{index === segments.length - 2 ? <span className="font-semibold text-ink">{labels[segment] ?? segment}</span> : <Link href={`/admin/${segments.slice(1, index + 2).join("/")}`} className="hover:text-ink">{labels[segment] ?? segment}</Link>}</span>)}</nav>;
}
