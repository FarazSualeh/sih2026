# SkillConnect

**SIH 2026 · Problem Statement 44 — Portal for Academia-Industry Collaboration for Skill Mapping, Internships and Placement**

SkillConnect is a multi-role platform that bridges students, academicians, industry partners and administrators through verified skill profiles, centrally-governed assessments, skill-gap diagnostics, internship / placement opportunities and structured industry feedback.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Chart.js + `react-chartjs-2` |
| Icons | Lucide React |
| Linter | ESLint |
| Containerisation | Docker (Dockerfile included) |

All data is realistic **mock data** for the current frontend phase. Backend APIs, authentication, Supabase, AI/ML recommendations and persistent storage are intentionally not implemented yet.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

### Vercel deployment

This is a standard Next.js App Router project and can be imported directly into Vercel with the default build settings. For production canonical URLs and sitemap links, set:

```bash
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
```

The public landing page is indexable. Sign-in and role workspaces are marked `noindex` and excluded from `robots.txt` because they contain private, mock workspace data.

### Available Scripts

```bash
npm run dev     # Development server (hot-reload)
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # ESLint check
```

### Docker

```bash
docker build -t skillconnect .
docker run -p 3000:3000 skillconnect
```

---

## Roles & Routes

### 🏠 Landing / Auth
| Route | Description |
|---|---|
| `/` | Public landing page |
| `/login` | Login page (role selector) |

---

### 🎓 Student (`/student/*`)
| Route | Description |
|---|---|
| `/student` | Student dashboard — readiness scores, skill snapshots, opportunity matches |
| `/student/skills` | My Skills — categorised skill cards, verification states, skill-gap actions |
| `/student/assessments` | Assessment library — available, in-progress, completed |
| `/student/opportunities` | Internship & placement listings with filters |
| `/student/applications` | Application tracker with status timeline |
| `/student/portfolio` | Portfolio builder — projects, certifications, achievements |

> Legacy student routes (`/dashboard`, `/skills`, `/assessments`, `/opportunities`, `/applications`, `/portfolio`) are also present for backward compatibility.

---

### 👩‍🏫 Academician (`/academician/*`)
| Route | Description |
|---|---|
| `/academician` | Academician dashboard — cohort overview, skill gaps, alerts |
| `/academician/assessments` | Assessment Insights — view admin-published assessments, benchmark analytics, student skill-gap monitoring |
| `/academician/students` | Student roster — readiness, progress and skill-gap breakdown |
| `/academician/skill-gaps` | Skill gap analysis — cohort vs. industry demand heatmaps |
| `/academician/industry-demand` | Live industry demand signals mapped to curriculum |
| `/academician/opportunities` | Placement & internship listings relevant to cohort |
| `/academician/analytics` | Department performance analytics and trend charts |
| `/academician/reports` | Downloadable placement and skill reports |
| `/academician/profile` | Academician profile settings |

> **Assessment creation is centralised under Admin** to maintain standardised skill benchmarking. Academicians have a dedicated Insights view to monitor and address student skill gaps.

---

### 🏢 Industry (`/industry/*`)
| Route | Description |
|---|---|
| `/industry` | Industry dashboard — talent pool, pipeline stats, recent applications |
| `/industry/opportunities` | Manage posted opportunities (internships, full-time, projects) |
| `/industry/post-opportunity` | Create a new opportunity listing |
| `/industry/candidates` | Browse verified student profiles with skill filters |
| `/industry/talent-matches` | AI-matched talent recommendations |
| `/industry/applications` | Manage received applications |
| `/industry/shortlisted` | Shortlisted candidates pipeline |
| `/industry/analytics` | Hiring funnel and skill demand analytics |
| `/industry/feedback` | Provide structured skill feedback to the platform |
| `/industry/profile` | Company profile and branding |
| `/industry/settings` | Industry account settings |

---

### 🛡️ Admin (`/admin/*`)
| Route | Description |
|---|---|
| `/admin` | Admin dashboard — platform KPIs, quick actions, alerts |
| `/admin/assessments` | Assessment Management — create, publish, manage Q&A library, monitor participation |
| `/admin/users` | User management — students, academicians, industry users |
| `/admin/skills` | Skill catalogue — verified skills, categories, demand mapping |
| `/admin/opportunities` | Platform-wide opportunity oversight |
| `/admin/applications` | All-applications view with status management |
| `/admin/analytics` | Platform-wide analytics and trend reports |
| `/admin/reports` | Export and schedule reports |
| `/admin/settings` | Platform settings — institution config, roles & permissions, notifications, appearance (incl. **dark mode**) |

---

## Project Structure

```text
app/
  page.tsx                    Public landing page
  login/                      Login & role selection
  student/                    Student role pages
  academician/                Academician role pages
  industry/                   Industry role pages
  admin/                      Admin role pages
  globals.css                 Design tokens, dark mode, global styles
  layout.tsx                  Root layout & font loading

components/
  admin/                      Admin-specific components
    assessments/              Assessment library, dialogs, table, Q&A manager
    settings/                 Institution form, notifications, role permissions
    shared/                   Global search, notification panel, confirmation dialog
  academician/                Academician-specific components
  industry/                   Industry-specific components
  ui/                         Shared primitives (Button, Card, Badge, Input, Dialog …)

lib/
  mock-data/                  Typed mock datasets for all roles
  utils.ts                    Shared utility functions

public/                       Static assets
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Centralised assessment creation (Admin only)** | Ensures standardised skill benchmarking and prevents inflated assessments; academicians get rich insight views instead |
| **CSS-variable-driven dark mode** | Tailwind v4 `@theme` tokens are wired to CSS custom properties that flip under `.dark`, so every utility class adapts automatically without rebuild |
| **Mock data first** | All pages are fully functional with typed mock data, making it trivial to swap in real API responses |
| **Role-based layouts** | Each role (`/admin`, `/academician`, `/industry`, `/student`) has its own layout, sidebar and navbar — no shared shell |

---

## Product Roadmap

- [ ] Supabase / PostgreSQL backend integration
- [ ] Role-based authentication (Supabase Auth)
- [ ] Real assessment engine with timed attempts and result persistence (somewhat done)
- [ ] AI/ML skill-gap recommendations and talent matching
- [ ] Email / push notification delivery
- [ ] Industry feedback loop feeding curriculum suggestions