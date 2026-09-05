import type { Assessment } from "@/lib/mock-data/assessments";

export const PUBLISHED_ASSESSMENTS_KEY = "skillconnect.published-assessments";
export const ASSESSMENT_RESULTS_KEY = "skillconnect.assessment-results";

export type PublishedAssessment = Omit<Assessment, "questions"> & { questions?: unknown[] };

export type StoredAssessmentResult = {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  skill: string;
  studentName: string;
  department: string;
  score: number;
  total: number;
  percentage: number;
  completionDate: string;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

export function getPublishedAssessments() {
  return read<PublishedAssessment[]>(PUBLISHED_ASSESSMENTS_KEY, []);
}

export function savePublishedAssessment(assessment: PublishedAssessment) {
  const assessments = getPublishedAssessments().filter((item) => item.id !== assessment.id);
  write(PUBLISHED_ASSESSMENTS_KEY, [assessment, ...assessments]);
}

export function getAssessmentResults() {
  return read<StoredAssessmentResult[]>(ASSESSMENT_RESULTS_KEY, []);
}

export function saveAssessmentResult(result: StoredAssessmentResult) {
  const results = getAssessmentResults().filter((item) => item.id !== result.id);
  write(ASSESSMENT_RESULTS_KEY, [result, ...results]);
}
