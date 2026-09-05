"use client";
import { StudentLayout } from "@/components/student-layout";
import { getAssessmentResults, getPublishedAssessments, saveAssessmentResult, type StoredAssessmentResult } from "@/lib/assessment-storage";
import { useEffect, useMemo, useState } from "react";

type IconName =
  | "grid"
  | "spark"
  | "clipboard"
  | "briefcase"
  | "file"
  | "user"
  | "search"
  | "bell"
  | "arrow"
  | "menu"
  | "close"
  | "chevron"
  | "clock"
  | "check"
  | "play";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3-1.5 6.5L4 11l6.5 1.5L12 19l1.5-6.5L20 11l-6.5-1.5L12 3Z" />
        <path d="m19 17-.6 2.4L16 20l2.4.6L19 23l.6-2.4L22 20l-2.4-.6L19 17Z" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5M9 11h6M9 15h4" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    file: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    play: <path d="m9 6 9 6-9 6V6Z" />,
  };
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}


type Assessment = {
  id: string;
  skill: string;
  category: string;
  difficulty: string;
  questions: number;
  time: string;
  status: "Not started" | "In progress" | "Completed";
  score?: number;
  color: string;
  mark: string;
  description: string;
  published?: boolean;
  authoredQuestions?: StudentQuestion[];
};

type StudentQuestion = {
  prompt: string;
  options: string[];
  answer: number;
};

const assessments: Assessment[] = [
  {
    id: "javascript",
    skill: "JavaScript",
    category: "Technical",
    difficulty: "Intermediate",
    questions: 20,
    time: "25 min",
    status: "In progress",
    color: "#fff0d8",
    mark: "JS",
    description: "Language fundamentals, DOM and modern ES6+ patterns.",
  },
  {
    id: "python",
    skill: "Python",
    category: "Technical",
    difficulty: "Intermediate",
    questions: 25,
    time: "30 min",
    status: "Completed",
    score: 72,
    color: "#e9f0e8",
    mark: "Py",
    description: "Core syntax, data structures and practical problem solving.",
  },
  {
    id: "sql",
    skill: "SQL",
    category: "Technical",
    difficulty: "Intermediate",
    questions: 20,
    time: "25 min",
    status: "Not started",
    color: "#e9f0ff",
    mark: "SQL",
    description:
      "Queries, joins, aggregations and working with relational data.",
  },
  {
    id: "seo",
    skill: "SEO",
    category: "Domain",
    difficulty: "Beginner",
    questions: 15,
    time: "20 min",
    status: "Not started",
    color: "#f9e9e9",
    mark: "SEO",
    description: "Search strategy, content discovery and performance signals.",
  },
  {
    id: "aws",
    skill: "AWS Foundations",
    category: "Technical",
    difficulty: "Beginner",
    questions: 18,
    time: "22 min",
    status: "Not started",
    color: "#e9f0e8",
    mark: "AWS",
    description: "Cloud concepts, core services and deployment fundamentals.",
  },
];

const questions = [
  {
    prompt:
      "Which method creates a new array with every element transformed by a callback?",
    options: ["forEach()", "map()", "filter()", "reduce()"],
    answer: 1,
  },
  {
    prompt: "What does a closure allow a function to do in JavaScript?",
    options: [
      "Run only once",
      "Change its own name",
      "Remember variables from its outer scope",
      "Avoid asynchronous code",
    ],
    answer: 2,
  },
  {
    prompt: "Which statement best describes a Promise?",
    options: [
      "A loop controller",
      "A value that may be available now, later, or never",
      "A CSS selector",
      "A browser storage API",
    ],
    answer: 1,
  },
  {
    prompt:
      "Which keyword declares a block-scoped variable that can be reassigned?",
    options: ["const", "var", "let", "static"],
    answer: 2,
  },
  {
    prompt: "What is the result of typeof null in JavaScript?",
    options: ["null", "undefined", "object", "boolean"],
    answer: 2,
  },
];

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-1 font-display text-[1.45rem] font-semibold tracking-[-0.03em] text-ink">
          {title}
        </h2>
      </div>
      {action && (
        <button className="hidden text-sm font-semibold text-coral transition hover:text-ink sm:block">
          {action} <span className="ml-1">&rarr;</span>
        </button>
      )}
    </div>
  );
}



function AssessmentCard({
  assessment,
  onStart,
}: {
  assessment: Assessment;
  onStart: (assessment: Assessment) => void;
}) {
  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d4d8cf] hover:shadow-[0_12px_30px_rgba(35,43,38,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className="grid h-11 min-w-11 place-items-center rounded-xl px-2 font-display text-sm font-bold"
          style={{ backgroundColor: assessment.color }}
        >
          {assessment.mark}
        </div>
        <span
          className={`rounded-md px-2 py-1 text-[0.65rem] font-bold ${assessment.status === "Completed" ? "bg-[#e9f0e8] text-olive" : assessment.status === "In progress" ? "bg-[#fff0d8] text-[#9b721c]" : "bg-[#f1f2ed] text-muted"}`}
        >
          {assessment.status}
        </span>
      </div>
      <p className="mt-5 text-xs font-semibold text-muted">
        {assessment.category} assessment
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold tracking-[-0.03em]">
        {assessment.skill}
      </h3>
      <p className="mt-2 min-h-10 text-xs leading-5 text-muted">
        {assessment.description}
      </p>
      <div className="mt-5 flex gap-4 border-t border-line pt-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Icon name="clipboard" size={14} />
          {assessment.questions} questions
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="clock" size={14} />
          {assessment.time}
        </span>
      </div>
      <button
        onClick={() => onStart(assessment)}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${assessment.status === "Completed" ? "border border-line text-ink hover:border-ink hover:bg-[#f8f8f5]" : "bg-ink text-white hover:bg-[#3b4740]"}`}
      >
        {assessment.status === "In progress" ? (
          <>
            <Icon name="play" size={15} />
            Continue assessment
          </>
        ) : assessment.status === "Completed" ? (
          <>
            Review results <Icon name="arrow" size={15} />
          </>
        ) : (
          <>
            Start assessment <Icon name="arrow" size={15} />
          </>
        )}
      </button>
    </article>
  );
}

function TakingAssessment({
  assessment,
  onExit,
  onComplete,
}: {
  assessment: Assessment;
  onExit: () => void;
  onComplete: (assessment: Assessment, score: number, total: number) => void;
}) {
  const questionBank: StudentQuestion[] = assessment.authoredQuestions?.length ? assessment.authoredQuestions : questions;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const question = questionBank[questionIndex];
  const score = questionBank.reduce(
    (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
    0,
  );
  if (submitted)
    return (
      <div className="mx-auto max-w-2xl py-4 sm:py-10">
        <div className="rounded-2xl border border-line bg-white p-6 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e9f0e8] text-olive">
            <Icon name="check" size={27} />
          </span>
          <p className="eyebrow mt-6">Assessment complete</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.05em]">
            Your result is ready.
          </h1>
            <p className="mt-3 text-sm text-muted">
            {assessment.skill} assessment Â· Submitted just now
          </p>
          <div className="mx-auto my-8 max-w-xs rounded-2xl bg-[#f8f8f5] p-6">
            <p className="font-display text-5xl font-semibold tracking-[-0.08em]">
              {Math.round((score / questionBank.length) * 100)}%
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted">
              skill score
            </p>
          </div>
          <p className="text-sm leading-6 text-muted">
            Your result will be added to your skill profile. Keep practicing to
            strengthen your readiness.
          </p>
          <button
            onClick={() => {
              onComplete(assessment, score, questionBank.length);
              onExit();
            }}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d85643]"
          >
            Back to assessments <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
    );
  return (
    <div className="mx-auto max-w-3xl py-4 sm:py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink"
        >
          <span className="rotate-180">
            <Icon name="arrow" size={16} />
          </span>
          Exit assessment
        </button>
        <span className="text-xs font-bold text-muted">
          {assessment.skill} Â· {assessment.time}
        </span>
      </div>
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs font-bold">
          <span>
            Question {questionIndex + 1} of {questionBank.length}
          </span>
          <span className="text-muted">
            {Math.round(((questionIndex + 1) / questionBank.length) * 100)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#e5e6df]">
          <div
            className="h-full rounded-full bg-coral transition-all duration-500"
            style={{
              width: `${((questionIndex + 1) / questionBank.length) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-10">
        <p className="eyebrow">{assessment.category} Â· Knowledge check</p>
        <h1 className="mt-4 max-w-2xl font-display text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">
          {question.prompt}
        </h1>
        <div className="mt-8 space-y-3">
          {question.options.map((option, index) => (
            <button
              key={option}
              onClick={() => setAnswers({ ...answers, [questionIndex]: index })}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left text-sm transition ${answers[questionIndex] === index ? "border-coral bg-[#fff4f1]" : "border-line hover:border-[#b9c1b7] hover:bg-[#f8f8f5]"}`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${answers[questionIndex] === index ? "border-coral bg-coral text-white" : "border-line text-muted"}`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>
        <div className="mt-9 flex items-center justify-between border-t border-line pt-6">
          <button
            disabled={questionIndex === 0}
            onClick={() => setQuestionIndex(questionIndex - 1)}
            className="flex items-center gap-2 text-sm font-bold text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span className="rotate-180">
              <Icon name="arrow" size={16} />
            </span>
            Previous
          </button>
          {questionIndex === questionBank.length - 1 ? (
            <button
              onClick={() => setSubmitted(true)}
              className="flex items-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d85643]"
            >
              Submit assessment <Icon name="check" size={16} />
            </button>
          ) : (
            <button
              onClick={() => setQuestionIndex(questionIndex + 1)}
              className="flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3b4740]"
            >
              Next <Icon name="arrow" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssessmentsPage() {
  const [filter, setFilter] = useState("All");
  const [taking, setTaking] = useState<Assessment | null>(null);
  const [storedAssessments, setStoredAssessments] = useState<Assessment[]>([]);
  const [results, setResults] = useState<StoredAssessmentResult[]>([]);
  useEffect(() => {
    setStoredAssessments(getPublishedAssessments().map((item) => ({ id: item.id, skill: item.skill, category: item.category, difficulty: item.difficulty, questions: item.questions?.length ?? 0, time: `${item.duration} min`, status: "Not started", color: "#e9f0ff", mark: item.skill.slice(0, 3), description: item.description, published: true, authoredQuestions: (item.questions ?? []).map((question) => { const draft = question as { prompt?: string; options?: string[]; correctAnswer?: string }; const options = draft.options ?? []; return { prompt: draft.prompt ?? "", options, answer: Math.max(0, options.indexOf(draft.correctAnswer ?? "")) }; }).filter((question) => question.prompt && question.options.length) })));
    setResults(getAssessmentResults());
  }, []);
  const availableAssessments = [...storedAssessments, ...assessments.filter((item) => !storedAssessments.some((stored) => stored.id === item.id))].map((item) => {
    const result = results.find((entry) => entry.assessmentId === item.id);
    return result ? { ...item, status: "Completed" as const, score: result.percentage } : item;
  });
  const filtered = useMemo(
    () =>
      availableAssessments.filter(
        (item) => filter === "All" || item.category === filter,
      ),
    [filter, availableAssessments],
  );
  const completeAssessment = (assessment: Assessment, score: number, total: number) => {
    saveAssessmentResult({ id: `${assessment.id}-Aarav Sharma`, assessmentId: assessment.id, assessmentTitle: assessment.skill, skill: assessment.skill, studentName: "Aarav Sharma", department: "Computer Science", score, total, percentage: Math.round(score / total * 100), completionDate: new Date().toISOString() });
    setResults(getAssessmentResults());
  };
  if (taking)
    return (
      <StudentLayout>
        <TakingAssessment assessment={taking} onExit={() => setTaking(null)} onComplete={completeAssessment} />
      </StudentLayout>
    );
  return (
    <StudentLayout>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Measure what matters</p>
          <h1 className="mt-2 font-display text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.055em] sm:text-[2.75rem]">
            Assessments <span className="text-coral">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-6 text-muted">
            Validate your industry-relevant skills with focused assessments
            built to show employers what you can do.
          </p>
        </div>
        <button
          onClick={() => setTaking(availableAssessments[0])}
          className="flex w-fit items-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm font-bold text-white shadow-[0_8px_16px_rgba(228,98,78,0.18)] transition hover:-translate-y-0.5 hover:bg-[#d85643]"
        >
          <Icon name="spark" size={16} />
          Take assessment <Icon name="arrow" size={16} />
        </button>
      </div>
      <section className="mb-10 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white sm:p-8">
          <div className="relative z-10 flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow text-[#b3b8b0]">Your assessment journey</p>
              <h2 className="mt-3 max-w-md font-display text-2xl font-semibold leading-tight tracking-[-0.04em]">
                Turn skill confidence into verified proof.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#b3b8b0]">
                Complete assessments to strengthen your profile and unlock
                better-fit opportunities.
              </p>
            </div>
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-[10px] border-coral/90 text-center">
              <p className="font-display text-3xl font-semibold">
                3<span className="text-base text-[#b3b8b0]">/5</span>
                <span className="block text-[0.58rem] uppercase tracking-[0.12em] text-[#b3b8b0]">
                  completed
                </span>
              </p>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-10 h-56 w-56 rounded-full border border-white/10" />
        </div>
        <div className="rounded-2xl border border-line bg-[#e9f0e8] p-6 sm:p-7">
          <p className="eyebrow text-olive">Continue where you left off</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.03em]">
                JavaScript
              </h2>
              <p className="mt-1 text-xs text-muted">Question 8 of 20</p>
            </div>
            <span className="font-display text-2xl font-semibold text-olive">
              40%
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full w-[40%] rounded-full bg-olive" />
          </div>
          <button
            onClick={() => setTaking(availableAssessments[0])}
            className="mt-6 flex items-center gap-2 text-sm font-bold text-olive transition hover:text-ink"
          >
            <Icon name="play" size={15} />
            Continue assessment <Icon name="arrow" size={15} />
          </button>
        </div>
      </section>
      <section>
        <SectionHeading
          eyebrow="Build credible proof"
          title="Available assessments"
        />
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1">
            {["All", "Technical", "Domain"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition ${filter === item ? "bg-ink text-white" : "text-muted hover:bg-[#f1f2ed] hover:text-ink"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            {filtered.length} assessments available
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onStart={setTaking}
            />
          ))}
        </div>
      </section>
      <section className="mt-10">
        <SectionHeading
          eyebrow="Your track record"
          title="Recent assessment results"
          action="View all results"
        />
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="hidden grid-cols-[1.2fr_1fr_0.65fr_0.65fr] border-b border-line px-6 py-4 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted sm:grid">
            <span>Assessment</span>
            <span>Skill assessed</span>
            <span>Score</span>
            <span>Date</span>
          </div>
          {results.map((result) => [result.assessmentTitle, result.skill, `${result.percentage}%`, new Date(result.completionDate).toLocaleDateString(), "bg-olive"]).map(([title, skill, score, date, tone]) => (
            <div
              key={title}
              className="grid grid-cols-[1fr_auto] gap-4 border-b border-line px-5 py-4 last:border-0 sm:grid-cols-[1.2fr_1fr_0.65fr_0.65fr] sm:items-center sm:px-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone} text-white`}
                >
                  <Icon name="check" size={15} />
                </span>
                <span className="text-sm font-semibold">{title}</span>
              </div>
              <span className="hidden text-sm text-muted sm:block">
                {skill}
              </span>
              <span className="font-display text-lg font-bold text-olive">
                {score}
              </span>
              <span className="hidden text-xs text-muted sm:block">{date}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-10 overflow-hidden rounded-2xl bg-[#e9f0e8] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-olive">Make your skills count</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em]">
              Ready to prove your next skill?
            </h2>
            <p className="mt-2 text-sm text-muted">
              A focused assessment takes less than 30 minutes.
            </p>
          </div>
          <button
            onClick={() => setTaking(assessments[0])}
            className="flex w-fit shrink-0 items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#3b4740]"
          >
            Start assessment <Icon name="arrow" size={16} />
          </button>
        </div>
      </section>
    </StudentLayout>
  );
}




