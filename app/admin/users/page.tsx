"use client";

import { useCallback, useMemo, useState } from "react";
import { Building2, GraduationCap, Users } from "lucide-react";

import { UserDetailDialog, StatusBadge } from "@/components/admin/users/user-detail-dialog";
import { UserFilters } from "@/components/admin/users/user-filters";
import { UserStatCard } from "@/components/admin/users/user-stat-card";
import { UserTable } from "@/components/admin/users/user-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { academicians, industries, students, type Academician, type Industry, type Student } from "@/lib/mock-data/users";
import { readAdminStorage, writeAdminStorage } from "@/lib/admin-storage";
import { ConfirmationDialog } from "@/components/admin/shared/confirmation-dialog";
import { ReasonDialog } from "@/components/admin/shared/reason-dialog";

type UserTab = "students" | "academicians" | "industries";

const tabItems: Array<{ key: UserTab; label: string; icon: typeof GraduationCap }> = [
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "academicians", label: "Academicians", icon: Users },
  { key: "industries", label: "Industries", icon: Building2 },
];

const studentStatusOptions = ["Active", "Inactive", "Suspended"];
const academicianStatusOptions = ["Active", "Inactive", "Suspended"];
const industryStatusOptions = ["Verified", "Pending", "Rejected"];

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<UserTab>("students");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAcademician, setSelectedAcademician] = useState<Academician | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>(() => readAdminStorage("skillconnect-admin-user-status", {}));
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; label: string; status: string } | null>(null);
  const [rejectIndustry, setRejectIndustry] = useState<Industry | null>(null);

  const statusFor = useCallback((item: { id: string; status?: string; verificationStatus?: string }) => statusOverrides[item.id] ?? item.status ?? item.verificationStatus ?? "", [statusOverrides]);
  const updateStatus = (id: string, status: string) => { const next = { ...statusOverrides, [id]: status }; setStatusOverrides(next); writeAdminStorage("skillconnect-admin-user-status", next); setSelectedStudent((current) => current?.id === id ? { ...current, status: status as Student["status"] } : current); setSelectedAcademician((current) => current?.id === id ? { ...current, status: status as Academician["status"] } : current); setSelectedIndustry((current) => current?.id === id ? { ...current, verificationStatus: status as Industry["verificationStatus"] } : current); };

  const studentDepartments = Array.from(new Set(students.map((student) => student.department)));
  const academicianDepartments = Array.from(new Set(academicians.map((academician) => academician.department)));
  const industryDomains = Array.from(new Set(industries.map((industry) => industry.domain)));

  const currentDepartments =
    activeTab === "students"
      ? studentDepartments
      : activeTab === "academicians"
        ? academicianDepartments
        : industryDomains;

  const currentStatusOptions =
    activeTab === "students"
      ? studentStatusOptions
      : activeTab === "academicians"
        ? academicianStatusOptions
        : industryStatusOptions;

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()) ||
        student.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || statusFor(student) === statusFilter;
      const matchesDepartment = departmentFilter === "all" || student.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [departmentFilter, search, statusFilter, statusFor]);

  const filteredAcademicians = useMemo(() => {
    return academicians.filter((academician) => {
      const matchesSearch =
        academician.name.toLowerCase().includes(search.toLowerCase()) ||
        academician.email.toLowerCase().includes(search.toLowerCase()) ||
        academician.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || statusFor(academician) === statusFilter;
      const matchesDepartment = departmentFilter === "all" || academician.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [departmentFilter, search, statusFilter, statusFor]);

  const filteredIndustries = useMemo(() => {
    return industries.filter((industry) => {
      const matchesSearch =
        industry.name.toLowerCase().includes(search.toLowerCase()) ||
        industry.email.toLowerCase().includes(search.toLowerCase()) ||
        industry.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || statusFor(industry) === statusFilter;
      const matchesDepartment = departmentFilter === "all" || industry.domain === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [departmentFilter, search, statusFilter, statusFor]);

  const summaryCards =
    activeTab === "students"
      ? [
          { label: "Total students", value: String(students.length), detail: "Across 6 departments", accent: "blue" as const },
          { label: "Active accounts", value: String(students.filter((student) => student.status === "Active").length), detail: "Ready for placement", accent: "green" as const },
          { label: "Ready for interviews", value: `${Math.round((students.filter((student) => student.readiness >= 80).length / students.length) * 100)}%`, detail: "Above 80% readiness", accent: "purple" as const },
          { label: "At-risk", value: String(students.filter((student) => student.status === "Suspended").length), detail: "Requires follow-up", accent: "amber" as const },
        ]
      : activeTab === "academicians"
        ? [
            { label: "Faculty", value: String(academicians.length), detail: "Mentorship coverage", accent: "blue" as const },
            { label: "Active mentors", value: String(academicians.filter((person) => person.status === "Active").length), detail: "Currently engaged", accent: "green" as const },
            { label: "Mentored students", value: String(academicians.reduce((total, person) => total + person.studentsMentored, 0)), detail: "Total guidance reach", accent: "purple" as const },
            { label: "Suspended", value: String(academicians.filter((person) => person.status === "Suspended").length), detail: "Review required", accent: "amber" as const },
          ]
        : [
            { label: "Partner companies", value: String(industries.length), detail: "Platform sponsors", accent: "blue" as const },
            { label: "Verified", value: String(industries.filter((company) => company.verificationStatus === "Verified").length), detail: "Compliance approved", accent: "green" as const },
            { label: "Open internships", value: String(industries.reduce((total, company) => total + company.activeInternships, 0)), detail: "Currently active", accent: "purple" as const },
            { label: "Pending review", value: String(industries.filter((company) => company.verificationStatus === "Pending").length), detail: "Awaiting admin check", accent: "amber" as const },
          ];

  const tableRows =
    activeTab === "students"
      ? filteredStudents
      : activeTab === "academicians"
        ? filteredAcademicians
        : filteredIndustries;
  const displayRows = tableRows.map((row) => ({ ...row, ...(activeTab === "industries" ? { verificationStatus: statusFor(row as Industry) } : { status: statusFor(row as Student | Academician) }) }));

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  const renderStudentColumns = [
    { key: "id", label: "User ID", render: (row: Student) => <span className="font-medium text-slate-700">{row.id}</span> },
    { key: "name", label: "Student", render: (row: Student) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{row.avatar}</div>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.department}</p>
          </div>
        </div>
      ) },
    { key: "semester", label: "Semester", render: (row: Student) => <span>{row.semester}</span> },
    { key: "readiness", label: "Readiness", render: (row: Student) => <span className="font-medium text-slate-700">{row.readiness}%</span> },
    { key: "applications", label: "Applications", render: (row: Student) => <span>{row.applications}</span> },
    { key: "status", label: "Status", render: (row: Student) => <StatusBadge status={row.status} /> },
  ];

  const renderAcademicianColumns = [
    { key: "id", label: "Faculty ID", render: (row: Academician) => <span className="font-medium text-slate-700">{row.id}</span> },
    { key: "name", label: "Academician", render: (row: Academician) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{row.avatar}</div>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.department}</p>
          </div>
        </div>
      ) },
    { key: "studentsMentored", label: "Mentored", render: (row: Academician) => <span>{row.studentsMentored}</span> },
    { key: "assessmentsCreated", label: "Evaluated", render: (row: Academician) => <span>{row.assessmentsCreated}</span> },
    { key: "accessLevel", label: "Access", render: (row: Academician) => <StatusBadge status={row.accessLevel} /> },
    { key: "status", label: "Status", render: (row: Academician) => <StatusBadge status={row.status} /> },
  ];

  const renderIndustryColumns = [
    { key: "id", label: "Company ID", render: (row: Industry) => <span className="font-medium text-slate-700">{row.id}</span> },
    { key: "name", label: "Company", render: (row: Industry) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{row.logo}</div>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.domain}</p>
          </div>
        </div>
      ) },
    { key: "opportunitiesPosted", label: "Posts", render: (row: Industry) => <span>{row.opportunitiesPosted}</span> },
    { key: "applicationsReceived", label: "Applicants", render: (row: Industry) => <span>{row.applicationsReceived}</span> },
    { key: "verificationStatus", label: "Verification", render: (row: Industry) => <StatusBadge status={row.verificationStatus} /> },
    { key: "accountStatus", label: "Account", render: (row: Industry) => <StatusBadge status={row.accountStatus} /> },
  ];

  const selectedColumns =
    activeTab === "students"
      ? renderStudentColumns
      : activeTab === "academicians"
        ? renderAcademicianColumns
        : renderIndustryColumns;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Administration</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.06em] text-ink sm:text-5xl">Users</h1>
        </div>
        <Button className="w-fit">Add user</Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <UserStatCard key={card.label} label={card.label} value={card.value} detail={card.detail} accent={card.accent} />
        ))}
      </section>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Directory</p>
              <CardTitle className="mt-2">Platform account management</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key);
                      setStatusFilter("all");
                      setDepartmentFilter("all");
                    }}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-coral bg-coral text-white shadow-[0_10px_18px_rgba(228,98,78,0.18)]"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <UserFilters
            search={search}
            status={statusFilter}
            department={departmentFilter}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
            onDepartmentChange={setDepartmentFilter}
            onReset={handleReset}
            departments={currentDepartments}
            statusOptions={currentStatusOptions}
          />
        </CardContent>
      </Card>

      <UserTable
        title={
          activeTab === "students"
            ? "Students"
            : activeTab === "academicians"
              ? "Academicians"
              : "Industries"
        }
        rows={displayRows as unknown as Array<Student | Academician | Industry>}
        columns={selectedColumns as unknown as Array<{ key: string; label: string; render?: (row: Student | Academician | Industry) => React.ReactNode; className?: string }>}
        onView={
          activeTab === "students"
            ? (row) => setSelectedStudent(row as Student)
            : activeTab === "academicians"
              ? (row) => setSelectedAcademician(row as Academician)
              : (row) => setSelectedIndustry(row as Industry)
        }
      />

      {selectedStudent ? (
        <UserDetailDialog
          open={Boolean(selectedStudent)}
          title={`${selectedStudent.name}`}
          subtitle={`${selectedStudent.id} • ${selectedStudent.department}`}
          onClose={() => setSelectedStudent(null)}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">{selectedStudent.avatar}</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-slate-500">{selectedStudent.email}</p>
                </div>
              </div>
              <StatusBadge status={statusFor(selectedStudent)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Readiness</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedStudent.readiness}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Applications</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedStudent.applications}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Phone</p>
                <p className="mt-1 text-sm text-slate-700">{selectedStudent.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Semester</p>
                <p className="mt-1 text-sm text-slate-700">{selectedStudent.semester}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">LinkedIn</p>
                <p className="mt-1 text-sm text-slate-700">{selectedStudent.linkedIn}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">GitHub</p>
                <p className="mt-1 text-sm text-slate-700">{selectedStudent.github}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Top skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedStudent.topSkills.map((skill) => (
                  <Badge key={skill} className="border-0 bg-coral/10 text-coral">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Skill gaps</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedStudent.skillGaps.map((skill) => (
                  <Badge key={skill} className="border-0 bg-amber-100 text-amber-700">{skill}</Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-200 pt-4"><Button variant="outline" onClick={() => setConfirmTarget({ id: selectedStudent.id, label: selectedStudent.name, status: statusFor(selectedStudent) === "Suspended" ? "Active" : "Suspended" })}>{statusFor(selectedStudent) === "Suspended" ? "Reactivate" : "Suspend"} account</Button></div>
          </div>
        </UserDetailDialog>
      ) : null}

      {selectedAcademician ? (
        <UserDetailDialog
          open={Boolean(selectedAcademician)}
          title={`${selectedAcademician.name}`}
          subtitle={`${selectedAcademician.id} • ${selectedAcademician.department}`}
          onClose={() => setSelectedAcademician(null)}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">{selectedAcademician.avatar}</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedAcademician.name}</h3>
                  <p className="text-sm text-slate-500">{selectedAcademician.email}</p>
                </div>
              </div>
              <StatusBadge status={statusFor(selectedAcademician)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Mentored</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedAcademician.studentsMentored}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Evaluated Tests</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedAcademician.assessmentsCreated}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Access</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedAcademician.accessLevel}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Phone</p>
              <p className="mt-1 text-sm text-slate-700">{selectedAcademician.phone}</p>
            </div>
            <div className="flex justify-end border-t border-slate-200 pt-4"><Button variant="outline" onClick={() => setConfirmTarget({ id: selectedAcademician.id, label: selectedAcademician.name, status: statusFor(selectedAcademician) === "Suspended" ? "Active" : "Suspended" })}>{statusFor(selectedAcademician) === "Suspended" ? "Reactivate" : "Suspend"} account</Button></div>
          </div>
        </UserDetailDialog>
      ) : null}

      {selectedIndustry ? (
        <UserDetailDialog
          open={Boolean(selectedIndustry)}
          title={`${selectedIndustry.name}`}
          subtitle={`${selectedIndustry.id} • ${selectedIndustry.domain}`}
          onClose={() => setSelectedIndustry(null)}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">{selectedIndustry.logo}</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedIndustry.name}</h3>
                  <p className="text-sm text-slate-500">{selectedIndustry.location}</p>
                </div>
              </div>
              <StatusBadge status={statusFor(selectedIndustry)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Active roles</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedIndustry.activeInternships}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Applicants</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedIndustry.applicationsReceived}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Account</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedIndustry.accountStatus}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedIndustry.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Contact</p>
                <p className="mt-1 text-sm text-slate-700">{selectedIndustry.contactPerson}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Website</p>
                <p className="mt-1 text-sm text-slate-700">{selectedIndustry.website}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Email</p>
                <p className="mt-1 text-sm text-slate-700">{selectedIndustry.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Phone</p>
                <p className="mt-1 text-sm text-slate-700">{selectedIndustry.phone}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">{statusFor(selectedIndustry) === "Pending" ? <><Button onClick={() => setConfirmTarget({ id: selectedIndustry.id, label: selectedIndustry.name, status: "Verified" })}>Approve industry</Button><Button variant="outline" onClick={() => setRejectIndustry(selectedIndustry)}>Reject industry</Button></> : <Button variant="outline" onClick={() => setConfirmTarget({ id: selectedIndustry.id, label: selectedIndustry.name, status: statusFor(selectedIndustry) === "Verified" ? "Suspended" : "Verified" })}>{statusFor(selectedIndustry) === "Verified" ? "Suspend partner" : "Reactivate partner"}</Button>}</div>
          </div>
        </UserDetailDialog>
      ) : null}
      <ConfirmationDialog open={Boolean(confirmTarget)} onOpenChange={(open) => !open && setConfirmTarget(null)} title={`${confirmTarget?.status === "Verified" ? "Approve" : confirmTarget?.status === "Suspended" ? "Suspend" : "Reactivate"} ${confirmTarget?.label ?? "account"}?`} description="This status is saved in this browser for the admin workspace." onConfirm={() => { if (confirmTarget) updateStatus(confirmTarget.id, confirmTarget.status); setConfirmTarget(null); }} />
      <ReasonDialog open={Boolean(rejectIndustry)} onOpenChange={(open) => !open && setRejectIndustry(null)} title="Reject industry partner" description="A reason is required for the rejection decision." confirmLabel="Reject industry" onConfirm={() => { if (rejectIndustry) updateStatus(rejectIndustry.id, "Rejected"); setRejectIndustry(null); }} />
    </div>
  );
}
