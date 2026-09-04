import Link from "next/link";
import { ArrowUpRight, BellRing, ChartNoAxesCombined, ClipboardCheck, Sparkles } from "lucide-react";

import { KpiCard } from "@/components/admin/kpi-card";
import { SectionHeader } from "@/components/admin/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  adminSummary,
  kpiCards,
  pendingActions,
  platformActivity,
  quickActions,
} from "@/lib/mock-data/admin-dashboard";

const primaryKpis = kpiCards.slice(0, 4);
const secondaryKpis = kpiCards.slice(4);

const overviewRouteMap: Record<string, string> = {
  "Total Students": "/admin/users",
  "Academicians": "/admin/users",
  "Registered Industries": "/admin/users",
  "Active Opportunities": "/admin/opportunities",
  "Total Applications": "/admin/applications",
  "Placement Rate": "/admin/analytics",
  "Average Skill Readiness": "/admin/skills",
  "Students with Skill Gaps": "/admin/skills",
};

const statusStyles: Record<string, string> = {
  "Pending Approval": "warning",
  Completed: "success",
  Verified: "info",
  Active: "default",
};

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Admin dashboard</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.06em] text-ink sm:text-5xl">
            {adminSummary.greeting}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">{adminSummary.subtitle}</p>
        </div>

        <Link href="/admin/reports?generate=true"><Button className="w-fit">Generate report</Button></Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryKpis.map((item) => (
          <KpiCard
            key={item.title}
            title={item.title}
            value={item.value}
            trend={item.trend}
            accent={item.accent}
            icon={item.icon}
            href={overviewRouteMap[item.title]}
          />
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Overview</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] text-ink">More platform metrics</h2>
          </div>
          <Link href="/admin/analytics" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink">
            View analytics
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {secondaryKpis.map((item) => (
            <KpiCard
              key={item.title}
              title={item.title}
              value={item.value}
              trend={item.trend}
              accent={item.accent}
              icon={item.icon}
              href={overviewRouteMap[item.title]}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Operations</p>
              <CardTitle className="mt-2">Pending actions</CardTitle>
            </div>
            <BellRing className="h-5 w-5 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {pendingActions.map((item) => (
                <div key={item.title} className="rounded-2xl border border-line bg-[#fafaf8] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{item.title}</p>
                    </div>
                    <Badge variant={item.tone === "warning" ? "warning" : item.tone === "info" ? "info" : "success"}>
                      {item.count}
                    </Badge>
                  </div>

                  <p className="mt-5 font-display text-3xl font-semibold tracking-[-0.06em] text-ink">{item.count}</p>
                  <p className="mt-2 text-xs leading-5 text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Quick actions</p>
            <CardTitle className="mt-2">Admin tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const content = (
                <Button variant="secondary" className="w-full justify-between">
                  <span>{action.label}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              );
              return action.href ? (
                <Link key={action.label} href={action.href} className="block">
                  {content}
                </Link>
              ) : (
                <div key={action.label}>{content}</div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <SectionHeader
              eyebrow="Activity"
              title="Recent platform activity"
              action={
                <Link href="/admin/reports?section=activity"><Button variant="ghost" className="text-xs uppercase tracking-[0.12em] text-muted">
                  View all
                </Button></Link>
              }
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platformActivity.map((row) => (
                  <TableRow key={`${row.time}-${row.event}`}>
                    <TableCell>{row.time}</TableCell>
                    <TableCell>{row.event}</TableCell>
                    <TableCell>
                      <Badge variant={statusStyles[row.status] as "warning" | "success" | "info" | "default"}>{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Insights</p>
            <CardTitle className="mt-2">Platform health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-[#f7f8f5] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted">User engagement</span>
                <ChartNoAxesCombined className="h-4 w-4 text-olive" />
              </div>
              <p className="mt-4 font-display text-3xl font-semibold tracking-[-0.06em] text-ink">83%</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#ebefe9]">
                <div className="h-full w-[83%] rounded-full bg-olive" />
              </div>
            </div>

            <div className="rounded-2xl bg-[#f7f8f5] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted">Assessment completion</span>
                <ClipboardCheck className="h-4 w-4 text-coral" />
              </div>
              <p className="mt-4 font-display text-3xl font-semibold tracking-[-0.06em] text-ink">91%</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#ebefe9]">
                <div className="h-full w-[91%] rounded-full bg-coral" />
              </div>
            </div>

            <div className="rounded-2xl bg-[#f7f8f5] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted">New skill adoption</span>
                <Sparkles className="h-4 w-4 text-sky" />
              </div>
              <p className="mt-4 font-display text-3xl font-semibold tracking-[-0.06em] text-ink">68%</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#ebefe9]">
                <div className="h-full w-[68%] rounded-full bg-sky" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
