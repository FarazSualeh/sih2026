'use client';

import React, { useMemo, useState } from 'react';
import LayoutAcademician from '@/components/academician/layout-academician';
import { assessmentSummaries, opportunities, reportsOverview, skillGaps, students, trainingRecommendations } from '@/lib/mock-data/academician';
import { useMockStore } from '@/lib/mock-store';
import type { AssessmentResult } from '@/lib/mock-store/assessments-store';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const filters = ['All courses', 'Python', 'React', 'AWS', 'SQL'];

export default function ReportsPage() {
  const [selectedCourse, setSelectedCourse] = useState('All courses');
  const [department, setDepartment] = useState('All departments');
  const [assessment, setAssessment] = useState('All assessments');
  const [semester, setSemester] = useState('All semesters');
  const [outcome, setOutcome] = useState('All outcomes');
  const [selectedReport, setSelectedReport] = useState<AssessmentResult | null>(null);
  const { results, assessments: sharedAssessments } = useMockStore();
  const filteredReports = results.filter((report) => (department === 'All departments' || report.department === department) && (assessment === 'All assessments' || report.assessmentId === assessment) && (semester === 'All semesters' || report.semester === semester) && (outcome === 'All outcomes' || (outcome === 'Passed' ? report.percentage >= 60 : report.percentage < 60)));
  const averageReadiness = Math.round(students.reduce((sum, student) => sum + student.readiness, 0) / students.length);
  const completedAssessments = students.reduce((sum, student) => sum + student.assessments.filter((assessment) => assessment.completed).length, 0);
  const allAssessments = students.reduce((sum, student) => sum + student.assessments.length, 0);
  const averageScore = Math.round(assessmentSummaries.reduce((sum, item) => sum + item.score, 0) / assessmentSummaries.length);

  const filteredTrend = useMemo(() => {
    if (selectedCourse === 'All courses') return reportsOverview.monthlyTrend;
    return reportsOverview.monthlyTrend.map((value) => Math.max(52, value - 4));
  }, [selectedCourse]);

  return (
    <LayoutAcademician>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Reports</h2>
            <p className="text-sm text-slate-500 mt-1">Department-level analytics for learning outcomes and performance.</p>
          </div>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="rounded border border-slate-200 px-3 py-2 text-sm">
            {filters.map((filter) => <option key={filter} value={filter}>{filter}</option>)}
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-sky-600">Visible to Academician</p><h3 className="mt-1 text-xl font-semibold">Assessment Reports</h3><p className="mt-1 text-sm text-slate-500">Completed student reports only. Academicians never receive assessment questions.</p></div><div className="flex flex-wrap gap-2"><select value={department} onChange={(event) => setDepartment(event.target.value)} className="rounded border border-slate-200 px-3 py-2 text-xs"><option>All departments</option><option>Computer Engineering</option><option>IT</option></select><select value={assessment} onChange={(event) => setAssessment(event.target.value)} className="rounded border border-slate-200 px-3 py-2 text-xs"><option value="All assessments">All assessments</option>{sharedAssessments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><select value={semester} onChange={(event) => setSemester(event.target.value)} className="rounded border border-slate-200 px-3 py-2 text-xs"><option>All semesters</option><option>Semester 6</option><option>Semester 8</option></select><select value={outcome} onChange={(event) => setOutcome(event.target.value)} className="rounded border border-slate-200 px-3 py-2 text-xs"><option>All outcomes</option><option>Passed</option><option>Failed</option></select></div></div>
          <div className="mt-5 overflow-x-auto"><table className="w-full text-sm"><thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500"><tr>{['Student', 'Assessment', 'Department', 'Score', 'Completion Date', 'Status'].map((head) => <th key={head} className="px-3 py-3">{head}</th>)}</tr></thead><tbody>{filteredReports.map((report) => <tr key={report.id} onClick={() => setSelectedReport(report)} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"><td className="px-3 py-3 font-semibold">{report.studentName}</td><td className="px-3 py-3">{sharedAssessments.find((item) => item.id === report.assessmentId)?.title ?? report.assessmentId}</td><td className="px-3 py-3">{report.department}</td><td className="px-3 py-3">{report.percentage}%</td><td className="px-3 py-3">{report.completionDate}</td><td className="px-3 py-3"><Badge variant={report.percentage >= 60 ? 'success' : 'danger'}>{report.percentage >= 60 ? 'Passed' : 'Failed'}</Badge></td></tr>)}</tbody></table>{filteredReports.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No completed reports match these filters.</p>}</div>
        </div>

        <Dialog open={selectedReport !== null} onOpenChange={(open) => !open && setSelectedReport(null)}><DialogContent><DialogHeader><DialogTitle>Assessment report · {selectedReport?.studentName}</DialogTitle></DialogHeader>{selectedReport && <div className="space-y-4 text-sm"><p><strong>Student details:</strong> {selectedReport.studentName} · {selectedReport.department} · {selectedReport.semester}</p><p><strong>Overall score:</strong> {selectedReport.score}/{selectedReport.breakdown.length * 2} ({selectedReport.percentage}%)</p><div><strong>Skill-wise performance</strong>{selectedReport.breakdown.map((item) => <p key={item.skill} className="mt-2 flex justify-between"><span>{item.skill}</span><span>{item.score}%</span></p>)}</div><p><strong>Weak skills:</strong> {selectedReport.breakdown.filter((item) => item.score < 60).map((item) => item.skill).join(', ') || 'None identified'}</p><p><strong>Strong skills:</strong> {selectedReport.breakdown.filter((item) => item.score >= 75).map((item) => item.skill).join(', ') || 'Continue building consistency'}</p><p><strong>Readiness improvement:</strong> +{Math.max(4, Math.round(selectedReport.percentage / 12))} points</p><p><strong>AI recommendation:</strong> Practice applied {selectedReport.breakdown[0]?.skill ?? 'technical'} problems and retake a focused skill drill.</p></div>}</DialogContent></Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm"><p className="text-sm text-slate-500">Students in cohort</p><p className="text-3xl font-bold mt-2">{students.length}</p></div>
          <div className="bg-white p-5 rounded-lg shadow-sm"><p className="text-sm text-slate-500">Student readiness</p><p className="text-3xl font-bold mt-2">{averageReadiness}%</p></div>
          <div className="bg-white p-5 rounded-lg shadow-sm"><p className="text-sm text-slate-500">Assessment performance</p><p className="text-3xl font-bold mt-2">{averageScore}%</p></div>
          <div className="bg-white p-5 rounded-lg shadow-sm"><p className="text-sm text-slate-500">Active opportunities</p><p className="text-3xl font-bold mt-2">{opportunities.length}</p></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">Performance trend</h3>
            <div className="mt-4 flex h-44 items-end gap-3">
              {filteredTrend.map((value, index) => (
                <div key={`${value}-${index}`} className="flex-1">
                  <div className="flex h-32 items-end justify-center">
                    <div className="w-full rounded-t bg-sky-500/80" style={{ height: `${value}%` }} />
                  </div>
                  <div className="mt-2 text-center text-xs text-slate-500">M{index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">Score distribution</h3>
            <div className="mt-4 space-y-3">
              {reportsOverview.scoreDistribution.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-sm text-slate-600">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100">
                    <div className="h-2 rounded bg-emerald-500" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm"><p className="text-sm text-slate-500">Critical skill gaps</p><p className="text-2xl font-bold mt-2">{skillGaps.filter((gap) => gap.priority === 'Critical').length}</p></div>
          <div className="bg-white p-5 rounded-lg shadow-sm"><p className="text-sm text-slate-500">Assessment completion</p><p className="text-2xl font-bold mt-2">{allAssessments ? Math.round((completedAssessments / allAssessments) * 100) : 0}%</p></div>
          <div className="bg-white p-5 rounded-lg shadow-sm"><p className="text-sm text-slate-500">Training tracks available</p><p className="text-2xl font-bold mt-2">{trainingRecommendations.length}</p></div>
        </div>
      </div>
    </LayoutAcademician>
  );
}

