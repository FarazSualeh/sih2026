"use client";

import React, { useRef, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Plus,
  Sliders,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Assessment, AssessmentStatus, Difficulty } from "@/lib/mock-data/assessments";

/* ────────────────────────────────────────────────
   Types
──────────────────────────────────────────────── */
export type QuestionType = "MCQ" | "True/False";

export interface QuestionDraft {
  id: string;
  prompt: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  marks: number;
}

export type AssessmentWithQuestions = Assessment & { authoredQuestions?: QuestionDraft[] };

/* ────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────── */
function uid() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const TRUE_FALSE_OPTIONS = ["True", "False"];

const DEFAULT_SKILLS = [
  "Python", "AWS", "React", "SQL", "Docker",
  "Java", "Machine Learning", "System Design", "Communication",
];

/** Generate and download a .xlsx-style CSV template */
function downloadTemplate() {
  const header = "Question,Type (MCQ|True/False),Option A,Option B,Option C,Option D,Correct Answer,Marks";
  const rows = [
    "What is the time complexity of dict lookup in Python?,MCQ,O(1),O(n),O(log n),O(n^2),O(1),5",
    "Python is an interpreted language.,True/False,True,False,,,True,3",
  ];
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "assessment_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse uploaded CSV/XLSX-as-CSV into QuestionDraft[] */
function parseCsv(text: string): QuestionDraft[] {
  const lines = text.trim().split(/\r?\n/).slice(1); // skip header
  return lines
    .map((line) => {
      // Support quoted fields
      const cols: string[] = [];
      let cur = "";
      let inQ = false;
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
        cur += ch;
      }
      cols.push(cur.trim());

      const [prompt, type, a, b, c, d, correct, marksStr] = cols;
      if (!prompt) return null;

      const qType = (type?.trim().toLowerCase() === "true/false") ? "True/False" : "MCQ";
      const options =
        qType === "True/False"
          ? TRUE_FALSE_OPTIONS
          : [a, b, c, d].filter(Boolean);

      return {
        id: uid(),
        prompt: prompt ?? "",
        type: qType,
        options,
        correctAnswer: correct?.trim() ?? "",
        marks: Number(marksStr) || 5,
      } as QuestionDraft;
    })
    .filter(Boolean) as QuestionDraft[];
}

/* ────────────────────────────────────────────────
   Main Dialog
──────────────────────────────────────────────── */
export function CreateAssessmentDialog({
  open,
  onOpenChange,
  assessment,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: Assessment;
  onSave: (assessment: AssessmentWithQuestions) => void;
}) {
  const [step, setStep] = useState<"details" | "questions" | "review">("details");

  /* ── Step 1 fields ── */
  const [title, setTitle]               = useState(assessment?.title ?? "");
  const [skill, setSkill]               = useState(assessment?.skill ?? "Python");
  const [description, setDescription]   = useState(assessment?.description ?? "");
  const [category, setCategory]         = useState(assessment?.category ?? "Technical");
  const [difficulty, setDifficulty]     = useState<Difficulty>(assessment?.difficulty ?? "Intermediate");
  const [duration, setDuration]         = useState(assessment?.duration?.toString() ?? "45");
  const [passingMarks, setPassingMarks] = useState(assessment?.passingMarks?.toString() ?? "65");
  const [attempts, setAttempts]         = useState(assessment?.attemptsAllowed?.toString() ?? "1");
  const [department, setDepartment]     = useState(assessment?.assignedDepartments?.[0] ?? "Computer Engineering");
  const [status, setStatus]             = useState<AssessmentStatus>("Draft");

  /* ── Step 2 Q&A ── */
  const [questions, setQuestions]     = useState<QuestionDraft[]>([]);
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const totalMarks = questions.reduce((s, q) => s + (Number(q.marks) || 0), 0);
  const canPublish = questions.length > 0;

  /* ── Q mutations ── */
  function addQuestion(type: QuestionType = "MCQ") {
    setQuestions((prev) => [
      ...prev,
      {
        id: uid(),
        prompt: "",
        type,
        options: type === "True/False" ? [...TRUE_FALSE_OPTIONS] : ["", "", "", ""],
        correctAnswer: type === "True/False" ? "True" : "",
        marks: 5,
      },
    ]);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, field: keyof QuestionDraft, value: QuestionDraft[keyof QuestionDraft]) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        if (field === "type") {
          const t = value as QuestionType;
          return {
            ...q,
            type: t,
            options: t === "True/False" ? [...TRUE_FALSE_OPTIONS] : ["", "", "", ""],
            correctAnswer: t === "True/False" ? "True" : "",
          };
        }
        return { ...q, [field]: value };
      })
    );
  }

  function updateOption(id: string, idx: number, text: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const opts = [...q.options];
        const old = opts[idx];
        opts[idx] = text;
        return {
          ...q,
          options: opts,
          correctAnswer: q.correctAnswer === old ? text : q.correctAnswer,
        };
      })
    );
  }

  /* ── Import CSV/XLSX ── */
  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = parseCsv(text);
        if (parsed.length === 0) {
          setImportError("No valid questions found. Ensure the file matches the template format.");
          return;
        }
        setQuestions((prev) => [...prev, ...parsed]);
      } catch {
        setImportError("Failed to parse file. Please use the downloaded template.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  /* ── Save ── */
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...(assessment ?? {
        id: `assessment-${Date.now()}`,
        participants: 0,
        completionRate: 0,
        averageScore: 0,
        createdBy: "SkillConnect Admin",
        assignedStudents: 120,
        topPerformers: [],
        createdDate: "Today",
      }),
      title: title.trim(),
      skill: skill.trim() || "General",
      description: description.trim(),
      category,
      difficulty,
      questions: Math.max(1, questions.length),
      authoredQuestions: questions,
      duration: Number(duration) || 45,
      passingMarks: Number(passingMarks) || 60,
      attemptsAllowed: Number(attempts) || 1,
      assignedDepartments: [department],
      status,
    });
    onOpenChange(false);
  }

  /* ── Step labels ── */
  const STEPS = [
    { id: "details",   icon: Sliders,       label: "Details" },
    { id: "questions", icon: BookOpen,       label: `Q&A (${questions.length})` },
    { id: "review",    icon: CheckCircle2,   label: "Review & Save" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl p-0 border-line bg-white shadow-2xl">
        {/* ── Header ── */}
        <div className="sticky top-0 z-20 border-b border-line bg-white/95 px-6 pt-5 pb-0 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-ink">
              {assessment ? "Edit Assessment" : "Create Assessment"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              Build a standardized assessment in 3 steps. Questions must be added before publishing.
            </DialogDescription>
          </DialogHeader>

          {/* Step tabs */}
          <div className="mt-4 flex gap-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                    active
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    active ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}>{i + 1}</span>
                  <Icon size={13} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <form onSubmit={submit} className="p-6 space-y-5">

          {/* ══ STEP 1: DETAILS ══ */}
          {step === "details" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Python Advanced Patterns"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">
                    Target Skill <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    placeholder="Python, AWS, React…"
                    className="h-10 text-sm"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {DEFAULT_SKILLS.slice(0, 6).map((sk) => (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => setSkill(sk)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                          skill === sk
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {sk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Outline the core concepts and real-world skills evaluated…"
                  className="w-full rounded-xl border border-line p-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white text-ink"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  { label: "Category", el: (
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs font-medium text-ink outline-none focus:ring-2 focus:ring-indigo-300">
                      {["Technical","Soft Skills","Domain","Emerging","Behavioral"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  )},
                  { label: "Difficulty", el: (
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs font-medium text-ink outline-none focus:ring-2 focus:ring-indigo-300">
                      {["Beginner","Intermediate","Advanced"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  )},
                  { label: "Duration (mins)", el: (
                    <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="h-10 text-sm" />
                  )},
                  { label: "Passing Benchmark (%)", el: (
                    <Input type="number" value={passingMarks} onChange={(e) => setPassingMarks(e.target.value)} className="h-10 text-sm" />
                  )},
                ].map(({ label, el }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">{label}</label>
                    {el}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs font-medium text-ink outline-none focus:ring-2 focus:ring-indigo-300">
                    {["Computer Engineering","AI & DS","IT","Electronics","Mechanical"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Semester</label>
                  <select className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs font-medium text-ink outline-none focus:ring-2 focus:ring-indigo-300">
                    {["Semester 7","Semester 6","Semester 5","All Semesters"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Allowed Attempts</label>
                  <select value={attempts} onChange={(e) => setAttempts(e.target.value)}
                    className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs font-medium text-ink outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="1">1 Attempt</option>
                    <option value="2">2 Attempts</option>
                    <option value="3">3 Attempts</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="button" onClick={() => { if (title.trim()) setStep("questions"); }} disabled={!title.trim()} className="gap-1.5">
                  Next: Add Questions <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: QUESTIONS ══ */}
          {step === "questions" && (
            <div className="space-y-5">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-slate-50 p-3">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-indigo-600" />
                    <strong>{questions.length}</strong> questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award size={14} className="text-emerald-600" />
                    <strong>{totalMarks}</strong> marks
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Download Template */}
                  <Button type="button" size="sm" variant="outline" onClick={downloadTemplate} className="gap-1.5 text-xs">
                    <Download size={13} /> Download Template
                  </Button>

                  {/* Import CSV */}
                  <Button
                    type="button" size="sm" variant="outline"
                    onClick={() => fileRef.current?.click()}
                    className="gap-1.5 text-xs"
                  >
                    <Upload size={13} /> Import File
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileImport}
                  />

                  {/* Add MCQ */}
                  <Button type="button" size="sm" onClick={() => addQuestion("MCQ")} className="gap-1 text-xs">
                    <Plus size={13} /> Add MCQ
                  </Button>

                  {/* Add True/False */}
                  <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("True/False")} className="gap-1 text-xs">
                    <Plus size={13} /> True / False
                  </Button>
                </div>
              </div>

              {importError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">{importError}</div>
              )}

              {/* Template hint */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs text-indigo-800">
                <strong>Tip:</strong> Download the template → fill Q&A in Excel/Sheets → save as CSV → Import File. Only MCQ and True/False types are supported.
              </div>

              {/* Question list */}
              {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 py-14 text-sm text-slate-400">
                  <FileSpreadsheet size={36} className="text-slate-300" />
                  <p>No questions yet — add them manually or import from file.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                      {/* Top row */}
                      <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-bold text-indigo-700">
                            {idx + 1}
                          </span>
                          <select
                            value={q.type}
                            onChange={(e) => updateQuestion(q.id, "type", e.target.value as QuestionType)}
                            className="h-7 rounded-lg border border-line bg-white px-2 text-xs font-semibold text-ink outline-none"
                          >
                            <option value="MCQ">MCQ</option>
                            <option value="True/False">True / False</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span>Marks:</span>
                          <input
                            type="number"
                            value={q.marks}
                            onChange={(e) => updateQuestion(q.id, "marks", Number(e.target.value) || 1)}
                            className="h-7 w-14 rounded-lg border border-line px-2 text-center text-xs font-semibold text-ink bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeQuestion(q.id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Prompt */}
                      <textarea
                        required
                        value={q.prompt}
                        onChange={(e) => updateQuestion(q.id, "prompt", e.target.value)}
                        rows={2}
                        placeholder="Enter the question…"
                        className="mt-3 w-full rounded-xl border border-line p-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white text-ink"
                      />

                      {/* Options */}
                      <div className="mt-3 space-y-2">
                        {q.options.map((opt, oi) => {
                          const correct = q.correctAnswer === opt && opt.trim() !== "";
                          return (
                            <div
                              key={oi}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
                                correct ? "border-emerald-300 bg-emerald-50" : "border-line bg-white"
                              }`}
                            >
                              <span className="text-[11px] font-bold text-slate-400 shrink-0">
                                {q.type === "True/False" ? opt : String.fromCharCode(65 + oi) + "."}
                              </span>
                              {q.type === "MCQ" ? (
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateOption(q.id, oi, e.target.value)}
                                  placeholder={`Option ${oi + 1}`}
                                  className="flex-1 bg-transparent text-xs font-medium text-ink outline-none"
                                />
                              ) : (
                                <span className="flex-1 text-xs font-medium text-ink">{opt}</span>
                              )}
                              <button
                                type="button"
                                onClick={() => updateQuestion(q.id, "correctAnswer", opt)}
                                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                  correct
                                    ? "bg-emerald-600 text-white"
                                    : "border border-line bg-white text-muted hover:border-emerald-300 hover:text-emerald-700"
                                }`}
                              >
                                {correct ? "✓ Correct" : "Set Correct"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-line pt-4">
                <Button type="button" variant="outline" onClick={() => setStep("details")}>
                  ← Back
                </Button>
                <Button type="button" onClick={() => setStep("review")} className="gap-1.5" disabled={questions.length === 0}>
                  Review Assessment <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* ══ STEP 3: REVIEW ══ */}
          {step === "review" && (
            <div className="space-y-5">
              {/* Summary card */}
              <div className="rounded-2xl border border-line bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">{skill}</span>
                      <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">{difficulty}</span>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{category}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-ink">{title || "Untitled"}</h3>
                    {description && <p className="mt-1 text-xs text-muted">{description}</p>}
                  </div>
                  <div className="text-right text-xs text-muted shrink-0">
                    <div className="font-semibold text-ink">{department}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    ["Questions", `${questions.length}`],
                    ["Total Marks", `${totalMarks} pts`],
                    ["Duration", `${duration} min`],
                    ["Pass Threshold", `${passingMarks}%`],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-xl border border-line bg-white p-3">
                      <div className="text-muted">{l}</div>
                      <div className="mt-1 text-base font-bold text-ink">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Q checklist */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Questions & Answer Keys</p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    const hasAnswer = q.correctAnswer.trim() !== "";
                    const hasPrompt = q.prompt.trim() !== "";
                    return (
                      <div key={q.id} className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                        hasAnswer && hasPrompt ? "border-line bg-white" : "border-rose-200 bg-rose-50"
                      }`}>
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="font-bold text-indigo-700">Q{idx + 1}.</span>
                          <span className="truncate text-ink">{q.prompt || "⚠ Empty prompt"}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            hasAnswer ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700"
                          }`}>
                            {hasAnswer ? `Key: ${q.correctAnswer}` : "No answer set"}
                          </span>
                          <span className="text-muted">{q.marks} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Publish toggle — only enabled when questions exist */}
              <div className={`flex items-center justify-between rounded-xl border p-4 ${
                canPublish ? "border-line bg-slate-50" : "border-slate-200 bg-slate-100 opacity-60"
              }`}>
                <div>
                  <div className="text-sm font-semibold text-ink">Publish Immediately</div>
                  <div className="text-xs text-muted">
                    {canPublish
                      ? "Make this assessment live for enrolled students."
                      : "Add at least one question before publishing."}
                  </div>
                </div>
                <input
                  type="checkbox"
                  disabled={!canPublish}
                  checked={status === "Active"}
                  onChange={(e) => setStatus(e.target.checked ? "Active" : "Draft")}
                  className="h-5 w-5 rounded border-line accent-indigo-600 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between border-t border-line pt-4">
                <Button type="button" variant="outline" onClick={() => setStep("questions")}>
                  ← Back to Questions
                </Button>
                <Button
                  type="submit"
                  disabled={questions.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  {status === "Active" ? "Save & Publish" : "Save as Draft"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
