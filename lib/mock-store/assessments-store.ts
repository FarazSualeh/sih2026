export type AssessmentBreakdown = {
  skill: string;
  score: number;
};

export type AssessmentResult = {
  id: string;
  studentName: string;
  department: string;
  assessmentId: string;
  semester: string;
  score: number;
  percentage: number;
  completionDate: string;
  breakdown: AssessmentBreakdown[];
};
