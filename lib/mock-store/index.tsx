"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { assessmentSummaries, students } from "@/lib/mock-data/academician";
import {
  getStoredApplications,
  getStoredOpportunities,
} from "@/lib/mock-data/industry";
import type { ApplicationStatus, CandidateApplication, SkillRequirement } from "@/lib/types";
import type { AssessmentResult } from "./assessments-store";
import { getAssessmentResults, getPublishedAssessments } from "@/lib/assessment-storage";

export type PublishedAssessment = {
  id: string;
  title: string;
  skill: string;
  department: string;
  semester: string;
  deadline: string;
  status: "Published";
  assignment: { departments: string[]; semesters: string[]; studentIds: string[] };
  questions: unknown[];
};

export type PublishedOpportunity = {
  id: string;
  title: string;
  company: string;
  skills: SkillRequirement[];
  eligibility: string;
  deadline: string;
  openings: number;
  status: "Live";
};

type SharedApplication = CandidateApplication & { resumeStatus: string };

type MockStore = {
  applications: SharedApplication[];
  opportunities: PublishedOpportunity[];
  assessments: PublishedAssessment[];
  results: AssessmentResult[];
  publishAssessment: (assessment: PublishedAssessment) => void;
  publishOpportunity: (opportunity: PublishedOpportunity) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, interviewDate?: string) => void;
};

const initialPublishedAssessments: PublishedAssessment[] = assessmentSummaries.map((assessment, index) => ({
  id: `published-assessment-${index + 1}`,
  title: assessment.title,
  skill: assessment.title.replace(/\s+(Foundations|Essentials|Readiness)$/i, ""),
  department: "Computer Engineering",
  semester: "Semester 6",
  deadline: "2026-09-30",
  status: "Published",
  assignment: { departments: ["Computer Engineering"], semesters: ["Semester 6"], studentIds: students.map((student) => student.id) },
  questions: [],
}));

const initialResults: AssessmentResult[] = students.flatMap((student, studentIndex) =>
  student.assessments.filter((assessment) => assessment.completed).map((assessment, assessmentIndex) => ({
    id: `result-${studentIndex + 1}-${assessmentIndex + 1}`,
    studentName: student.name,
    department: student.department,
    assessmentId: assessment.id,
    semester: "Semester 6",
    score: assessment.score ?? 0,
    percentage: assessment.score ?? 0,
    completionDate: "2026-08-28",
    breakdown: student.topSkills.map((skill) => ({ skill: skill.name, score: skill.proficiency })),
  })),
);

const StoreContext = createContext<MockStore | null>(null);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<SharedApplication[]>(() => getStoredApplications().map((application) => ({ ...application, resumeStatus: "Verified" })));
  const [opportunities, setOpportunities] = useState<PublishedOpportunity[]>(() =>
    getStoredOpportunities().map((opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      company: opportunity.company,
      skills: opportunity.skillRequirements,
      eligibility: opportunity.eligibility,
      deadline: opportunity.deadline,
      openings: opportunity.openPositions,
      status: "Live",
    })),
  );
  const [assessments, setAssessments] = useState<PublishedAssessment[]>(() => [
    ...getPublishedAssessments().map((assessment) => ({ id: assessment.id, title: assessment.title, skill: assessment.skill, department: assessment.assignedDepartments[0] ?? "Computer Engineering", semester: "Semester 6", deadline: "2026-09-30", status: "Published" as const, assignment: { departments: assessment.assignedDepartments, semesters: ["Semester 6"], studentIds: [] }, questions: assessment.questions ?? [] })),
    ...initialPublishedAssessments,
  ]);
  const [results] = useState<AssessmentResult[]>(() => [
    ...getAssessmentResults().map((result) => ({ ...result, semester: "Semester 6", breakdown: [{ skill: result.skill, score: result.percentage }] })),
    ...initialResults,
  ]);

  const value: MockStore = {
    applications,
    opportunities,
    assessments,
    results,
    publishAssessment: (assessment) => setAssessments((current) => [...current.filter((item) => item.id !== assessment.id), assessment]),
    publishOpportunity: (opportunity) => setOpportunities((current) => [...current.filter((item) => item.id !== opportunity.id), opportunity]),
    updateApplicationStatus: (id, status, interviewDate) =>
      setApplications((current) => current.map((application) => application.id === id ? { ...application, status, interviewDate } : application)),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useMockStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useMockStore must be used inside MockStoreProvider");
  return store;
}

