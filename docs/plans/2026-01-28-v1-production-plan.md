# LearnFlow AI - V1 Production Plan

**Date:** January 28, 2026
**Status:** Approved
**Approach:** Sequential Phases

---

## Overview

Transform LearnFlow AI from 75-80% MVP state to full production-ready v1 with:
- Complete AI agent system (6 agents)
- Full content management & delivery
- Enterprise features with team management
- Tiered certification system (Bronze/Silver/Gold)
- Production infrastructure with monitoring
- Comprehensive test coverage

---

## Current State Assessment

### What's Complete
- User authentication (NextAuth v5)
- Database schema (users, content, progress, gamification, certifications, AI, organizations)
- tRPC API routers (course, gamification, user, progress)
- 50+ UI components (shadcn/ui)
- 8 pages (dashboard, courses, achievements, analytics, certifications, settings, help, auth)
- 3 AI agents working (Tutor, Assessor, Mentor)
- Gamification backend (XP, levels, streaks, achievements, leaderboards)
- CI/CD pipeline definitions
- Docker/Kubernetes configs

### What's Missing
- Tests (unit, integration, e2e)
- 3 AI agents incomplete (Code Review, Project Guide, Quiz Generator)
- Admin panel for content management
- Real lesson content & seed data
- Code execution sandbox
- Enterprise UI (org management, teams)
- Certification logic & PDF generation
- Onboarding flow
- Production hardening (logging, monitoring, security)

---

## Phase 1: Critical Fixes & Testing

**Goal:** CI pipeline passes, foundation solid for further development.

### 1.1 Fix Critical Issues

| Task | File(s) | Description |
|------|---------|-------------|
| Remove hardcoded TEST_USER_ID | `src/app/page.tsx`, multiple pages | Use real session user from `auth()` |
| Add missing npm scripts | `package.json` | `typecheck`, `test:unit`, `test:integration`, `test:e2e` |
| Fix analytics stub tabs | `src/app/analytics/page.tsx` | Implement Courses & Skills tabs |
| Fix achievement category filter | `src/app/achievements/page.tsx` | Implement filtering logic |
| Settings persistence | `src/lib/trpc/routers/user.ts` | Save settings to database |

### 1.2 Testing Setup

| Task | File(s) |
|------|---------|
| Vitest configuration | `vitest.config.ts`, `vitest.setup.ts` |
| Playwright configuration | `playwright.config.ts` |
| MSW handlers for API mocking | `src/__tests__/mocks/handlers.ts` |
| Test utilities & helpers | `src/__tests__/utils/` |

### 1.3 Unit Tests

| Area | Test Files | Coverage Target |
|------|------------|-----------------|
| tRPC routers | `course.test.ts`, `gamification.test.ts`, `user.test.ts`, `progress.test.ts` | 80% |
| AI agents | `tutor.test.ts`, `assessor.test.ts`, `mentor.test.ts` | 80% |
| Utilities | `xp-calculator.test.ts`, `streak-calculator.test.ts` | 90% |
| Auth | `auth.test.ts`, `rate-limit.test.ts` | 80% |

### 1.4 Integration Tests

| Flow | Test File |
|------|-----------|
| Authentication flow | `auth.integration.test.ts` |
| Course enrollment | `enrollment.integration.test.ts` |
| Progress tracking | `progress.integration.test.ts` |
| Gamification rewards | `gamification.integration.test.ts` |
| AI chat session | `ai-chat.integration.test.ts` |

### 1.5 E2E Tests

| User Journey | Test File |
|--------------|-----------|
| Sign up → Onboarding → First lesson | `onboarding.e2e.ts` |
| Complete lesson → Earn XP → Level up | `lesson-completion.e2e.ts` |
| Enroll course → Progress → Certificate | `certification.e2e.ts` |
| Login → Dashboard → Navigate app | `navigation.e2e.ts` |

### Phase 1 Deliverables
- [ ] All hardcoded IDs removed
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test:unit` runs with 80%+ coverage
- [ ] `pnpm test:integration` passes
- [ ] `pnpm test:e2e` passes critical flows
- [ ] CI pipeline green

---

## Phase 2: AI Agents Complete

**Goal:** All 6 AI agents fully functional with RAG integration.

### 2.1 Code Review Agent Enhancement

**File:** `src/lib/ai/agents/code-review.ts`

Features:
- Code analysis for correctness, efficiency, style
- Issue detection without giving direct solutions
- Debugging methodology teaching
- Language-specific best practices (JS/TS/Python)
- Security vulnerability detection
- Performance suggestions

**Prompts:** `src/lib/ai/prompts/code-review-prompts.ts`

### 2.2 Project Guide Agent Enhancement

**File:** `src/lib/ai/agents/project-guide.ts`

Features:
- Project milestone breakdown
- Architecture decision review
- Progress checkpoint validation
- Final submission evaluation
- Portfolio-readiness assessment
- Feedback on code quality & documentation

**Prompts:** `src/lib/ai/prompts/project-guide-prompts.ts`

### 2.3 Quiz Generator Agent (New)

**File:** `src/lib/ai/agents/quiz-generator.ts`

Features:
- Generate questions from course content (RAG)
- Multiple question types:
  - Multiple choice (MCQ)
  - Code completion
  - Bug finding/debugging
  - Output prediction
  - Concept explanation
- Difficulty scaling (beginner/intermediate/advanced)
- Distractor generation for MCQs
- Hint generation

**Prompts:** `src/lib/ai/prompts/quiz-generator-prompts.ts`

### 2.4 RAG Pipeline Enhancement

| Task | File(s) |
|------|---------|
| Content chunking strategy | `src/lib/ai/rag/chunker.ts` |
| Embedding generation | `src/lib/ai/rag/embeddings.ts` |
| Qdrant collection setup | `src/lib/ai/rag/qdrant.ts` |
| Content ingestion script | `scripts/ingest-content.ts` |
| Retrieval with reranking | `src/lib/ai/rag/retriever.ts` |

### 2.5 Orchestrator Updates

**File:** `src/lib/ai/orchestrator/router.ts`

- Add Quiz Generator routing
- Improve intent detection
- Add context handoff between agents
- Implement conversation memory limits

### Phase 2 Deliverables
- [ ] Code Review Agent: full implementation with tests
- [ ] Project Guide Agent: full implementation with tests
- [ ] Quiz Generator Agent: new agent with tests
- [ ] RAG pipeline: content ingestion working
- [ ] Orchestrator: routes to all 6 agents correctly
- [ ] Agent integration tests passing

---

## Phase 3: Content System

**Goal:** Admin can create content, learners can consume real lessons.

### 3.1 Admin Panel - Layout

| Component | Path |
|-----------|------|
| Admin layout | `src/app/admin/layout.tsx` |
| Admin sidebar | `src/components/admin/admin-sidebar.tsx` |
| Admin header | `src/components/admin/admin-header.tsx` |
| Admin dashboard | `src/app/admin/page.tsx` |

### 3.2 Admin Panel - Content Management

| Page | Path | Features |
|------|------|----------|
| Domains list | `src/app/admin/content/domains/page.tsx` | CRUD, reorder |
| Tracks list | `src/app/admin/content/tracks/page.tsx` | CRUD, assign to domain |
| Courses list | `src/app/admin/content/courses/page.tsx` | CRUD, assign to track |
| Modules list | `src/app/admin/content/modules/page.tsx` | CRUD, reorder |
| Lessons editor | `src/app/admin/content/lessons/[id]/page.tsx` | Rich editor, preview |
| Content types | Lesson content editor | Concept, Code, Visualization, Challenge, Quiz |

### 3.3 Admin Panel - User Management

| Page | Path | Features |
|------|------|----------|
| Users list | `src/app/admin/users/page.tsx` | Search, filter, pagination |
| User detail | `src/app/admin/users/[id]/page.tsx` | Profile, progress, certificates |
| Roles management | `src/app/admin/users/roles/page.tsx` | Assign roles |

### 3.4 Admin tRPC Routers

**File:** `src/lib/trpc/routers/admin.ts`

```typescript
// Procedures needed
admin.content.createDomain
admin.content.updateDomain
admin.content.deleteDomain
admin.content.createTrack
admin.content.createCourse
admin.content.createModule
admin.content.createLesson
admin.content.updateLesson
admin.content.reorderModules
admin.users.list
admin.users.get
admin.users.updateRole
admin.analytics.overview
```

### 3.5 Code Execution Sandbox

| Task | Description |
|------|-------------|
| Sandbox service | Integrate Piston API or Judge0 for code execution |
| Supported languages | JavaScript, TypeScript, Python (initially) |
| Security | Timeout limits, memory limits, no network access |
| Test runner | Run test cases against user code |
| Output capture | Capture stdout, stderr, errors |

**Files:**
- `src/lib/sandbox/executor.ts`
- `src/lib/sandbox/languages.ts`
- `src/app/api/sandbox/execute/route.ts`

### 3.6 Lesson Content Rendering

| Canvas Type | File | Rendering |
|-------------|------|-----------|
| Concept | `src/components/learning/concept-canvas.tsx` | Markdown with syntax highlighting |
| Code | `src/components/learning/code-editor-canvas.tsx` | Monaco editor + sandbox execution |
| Visualization | `src/components/learning/visualization-canvas.tsx` | D3.js / Recharts interactive |
| Challenge | `src/components/learning/challenge-canvas.tsx` | Problem + editor + test runner |
| Quiz | `src/components/learning/quiz-canvas.tsx` | MCQ, code completion UI |

### 3.7 Seed Data

**File:** `scripts/seed-content.ts`

Create complete sample content:
- 1 Domain: Technology
- 1 Track: Web Development Fundamentals
- 1 Course: JavaScript Essentials
  - 6 Modules
  - 30 Lessons (mix of all content types)
  - Real educational content

### Phase 3 Deliverables
- [ ] Admin panel: full CRUD for content hierarchy
- [ ] Admin panel: user management
- [ ] Code sandbox: execute JS/TS/Python safely
- [ ] Lesson rendering: all 5 content types working
- [ ] Seed data: complete JavaScript course
- [ ] RAG: seed content indexed in Qdrant
- [ ] Tests: admin routes, sandbox execution

---

## Phase 4: Certifications

**Goal:** Issue and verify Bronze/Silver/Gold certifications.

### 4.1 Certification Logic

| Tier | Criteria | Implementation |
|------|----------|----------------|
| Bronze | Complete all lessons in course | Auto-issue on 100% lesson completion |
| Silver | Pass final assessment (80%+) | Quiz Generator creates exam, Assessor grades |
| Gold | Project submission approved | Project Guide reviews, manual approval workflow |

### 4.2 tRPC Router

**File:** `src/lib/trpc/routers/certification.ts`

```typescript
certification.checkEligibility  // Check if user qualifies
certification.issueBronze       // Auto-issue
certification.startSilverExam   // Generate exam
certification.submitSilverExam  // Grade and issue
certification.submitGoldProject // Start review
certification.approveGold       // Admin approval
certification.verify            // Public verification
certification.list              // User's certificates
certification.download          // Get PDF URL
```

### 4.3 Assessment Flow (Silver)

1. User clicks "Take Certification Exam"
2. Quiz Generator creates 20-question exam from course content
3. User completes exam (timed: 45 minutes)
4. Assessor Agent grades answers
5. If score >= 80%: issue Silver certificate
6. If score < 80%: show feedback, allow retry after 24h

### 4.4 Project Review Flow (Gold)

1. User submits project (GitHub URL + deployed URL)
2. Project Guide Agent does initial review
3. Creates review with scores (code quality, functionality, documentation)
4. Admin reviews AI assessment
5. Admin approves/requests changes
6. On approval: issue Gold certificate

### 4.5 PDF Generation

**File:** `src/lib/certificates/generator.ts`

- Use `@react-pdf/renderer` or `puppeteer`
- Dynamic content: name, course, date, cert ID, QR code
- 3 templates: Bronze (simple), Silver (elegant), Gold (premium)
- Store in S3/R2, return signed URL

### 4.6 Verification Page

**File:** `src/app/verify/[certId]/page.tsx`

- Public page (no auth required)
- Display: recipient name, course, tier, issue date
- Verify authenticity via cert ID lookup
- Show "Valid" badge

### 4.7 LinkedIn Integration

- Generate LinkedIn Add-to-Profile URL
- Include certification name, issuing org, credential ID, credential URL

### Phase 4 Deliverables
- [ ] Bronze: auto-issue on completion
- [ ] Silver: exam generation, grading, issuance
- [ ] Gold: project submission, AI review, admin approval
- [ ] PDF: 3 certificate templates generating correctly
- [ ] Verification: public page working
- [ ] LinkedIn: share integration working
- [ ] Tests: all certification flows

---

## Phase 5: Enterprise

**Goal:** Organizations can manage teams and track learning.

### 5.1 Organization Management

| Page | Path | Features |
|------|------|----------|
| Org settings | `src/app/org/settings/page.tsx` | Name, logo, branding colors |
| Org dashboard | `src/app/org/page.tsx` | Org-wide stats, team overview |
| Billing | `src/app/org/billing/page.tsx` | Plan, usage, invoices (stub for v1) |

### 5.2 Team Management

| Page | Path | Features |
|------|------|----------|
| Teams list | `src/app/org/teams/page.tsx` | Create teams, view summary |
| Team detail | `src/app/org/teams/[id]/page.tsx` | Members, progress, assignments |
| Add members | Modal | Email invite, CSV import |
| Assignments | `src/app/org/assignments/page.tsx` | Assign courses to teams/individuals |

### 5.3 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| Super Admin | Full system access, all orgs |
| Enterprise Admin | Manage org, all teams, all users in org |
| Team Manager | Manage assigned team, view team progress |
| Learner | Own progress only |

**Implementation:**
- Middleware check: `src/middleware.ts`
- tRPC context: `src/lib/trpc/context.ts`
- UI guards: `src/components/auth/role-guard.tsx`

### 5.4 Enterprise tRPC Router

**File:** `src/lib/trpc/routers/organization.ts`

```typescript
organization.create
organization.update
organization.get
organization.getStats
team.create
team.update
team.delete
team.addMember
team.removeMember
team.getProgress
assignment.create
assignment.list
assignment.getProgress
```

### 5.5 Enterprise Dashboard

| Widget | Data |
|--------|------|
| Active learners | Users active in last 7 days |
| Course completions | This month vs last month |
| Certifications earned | By tier, by team |
| Top performers | Leaderboard by XP |
| At-risk learners | No activity in 14+ days |
| Compliance tracker | Required courses completion % |

### Phase 5 Deliverables
- [ ] Org management: settings, branding
- [ ] Teams: CRUD, member management
- [ ] RBAC: enforced across app
- [ ] Assignments: assign courses to teams
- [ ] Enterprise dashboard: all widgets
- [ ] Bulk invite: email + CSV
- [ ] Tests: all enterprise flows

---

## Phase 6: Onboarding

**Goal:** New users go through personalized setup flow.

### 6.1 Onboarding Flow

```
Register → Role Select → Skill Assessment → Goal Setting → Learning Style → Path Recommendation → Start
```

### 6.2 Pages

| Step | Page | Description |
|------|------|-------------|
| 1 | `src/app/onboarding/role/page.tsx` | Student / Professional / Self-learner |
| 2 | `src/app/onboarding/assessment/page.tsx` | AI-driven skill diagnostic |
| 3 | `src/app/onboarding/goals/page.tsx` | Career goals, target skills |
| 4 | `src/app/onboarding/schedule/page.tsx` | Time commitment, preferred times |
| 5 | `src/app/onboarding/style/page.tsx` | Learning style quiz |
| 6 | `src/app/onboarding/path/page.tsx` | AI-recommended track |

### 6.3 Skill Assessment

- Assessor Agent generates diagnostic questions
- 15-20 questions across skill areas
- Adaptive: harder questions if doing well
- Results: skill map with proficiency levels
- Store in user profile

### 6.4 Path Recommendation

- Based on: role, goals, current skills, time commitment
- AI generates personalized track recommendation
- User can accept or browse alternatives
- Creates initial course enrollments

### 6.5 Onboarding State

**Schema addition:**
```typescript
onboardingStatus: enum('not_started', 'in_progress', 'completed')
onboardingStep: integer // Current step (1-6)
onboardingData: jsonb // Collected data
```

**Middleware:** Redirect incomplete onboarding to `/onboarding`

### Phase 6 Deliverables
- [ ] 6-step onboarding flow
- [ ] Skill assessment: working with Assessor Agent
- [ ] Goal setting: stored in profile
- [ ] Learning style: quiz and results
- [ ] Path recommendation: AI-generated
- [ ] Middleware: enforces onboarding completion
- [ ] Tests: full onboarding flow

---

## Phase 7: Production Hardening

**Goal:** Production-ready infrastructure with monitoring.

### 7.1 Error Handling

| Task | File(s) |
|------|---------|
| Global error boundary | `src/app/error.tsx`, `src/app/global-error.tsx` |
| Not found page | `src/app/not-found.tsx` |
| tRPC error formatter | `src/lib/trpc/error-handler.ts` |
| API error responses | Consistent error shape with codes |
| Toast error display | `src/components/ui/error-toast.tsx` |

### 7.2 Logging

| Task | File(s) |
|------|---------|
| Logger setup (Pino) | `src/lib/logger.ts` |
| Request logging | `src/middleware.ts` |
| tRPC procedure logging | `src/lib/trpc/trpc.ts` |
| AI agent logging | `src/lib/ai/logger.ts` |
| Error logging | Automatic with stack traces |

### 7.3 Monitoring

| Task | Tool/Service |
|------|--------------|
| OpenTelemetry setup | `src/lib/telemetry.ts` |
| Traces export | Jaeger / Honeycomb / Datadog |
| Metrics export | Prometheus format |
| Health endpoint | `src/app/api/health/route.ts` |
| Readiness endpoint | `src/app/api/ready/route.ts` |

### 7.4 Security

| Task | Implementation |
|------|----------------|
| Rate limiting (global) | Upstash Ratelimit on all API routes |
| CORS | `next.config.ts` allowed origins |
| CSP headers | `next.config.ts` Content-Security-Policy |
| Input validation | Zod schemas on all inputs |
| SQL injection prevention | Drizzle parameterized queries (already safe) |
| XSS prevention | React auto-escaping + CSP |
| CSRF | NextAuth CSRF tokens |

### 7.5 Database Production

| Task | Description |
|------|-------------|
| Migrations | `drizzle-kit generate` + version control |
| Indexes | Add indexes for common query patterns |
| Connection pool | Configure for production load |
| Backups | Automated daily backups |

### 7.6 Kubernetes Production

| Resource | File |
|----------|------|
| Staging overlay | `k8s/overlays/staging/` |
| Production overlay | `k8s/overlays/production/` |
| Secrets | External Secrets Operator config |
| HPA tuning | Based on CPU/memory metrics |
| PDB | Ensure availability during deploys |
| Network policies | Restrict pod communication |
| Ingress TLS | cert-manager + Let's Encrypt |

### Phase 7 Deliverables
- [ ] Error boundaries: graceful error UI
- [ ] Logging: structured JSON logs
- [ ] Monitoring: traces and metrics exporting
- [ ] Health checks: K8s probes working
- [ ] Security: all headers configured
- [ ] Rate limiting: global limits enforced
- [ ] Database: migrations, indexes, backups
- [ ] K8s: staging + production overlays complete

---

## Phase 8: UX Polish

**Goal:** Polished, accessible, delightful user experience.

### 8.1 Notifications

| Component | Description |
|-----------|-------------|
| Notification center | Bell icon, dropdown with notifications |
| In-app notifications | Achievement, streak, course updates |
| Email service | Welcome, streak at risk, certificate earned |
| Notification preferences | User can toggle each type |

**Files:**
- `src/components/notifications/notification-center.tsx`
- `src/lib/notifications/service.ts`
- `src/lib/email/templates/`

### 8.2 Gamification Polish

| Feature | Description |
|---------|-------------|
| Level-up celebration | Full-screen animation with confetti |
| Achievement unlock | Animated toast with achievement details |
| Streak freeze | Purchase with XP, UI to use |
| XP breakdown | Modal showing XP sources |
| Daily challenges | Optional daily tasks for bonus XP |

### 8.3 Accessibility

| Task | Description |
|------|-------------|
| Keyboard navigation | Full tab navigation, focus indicators |
| Screen reader | ARIA labels, announcements |
| Color contrast | WCAG AA compliance |
| Reduced motion | Respect `prefers-reduced-motion` |
| Focus management | Proper focus on modals, navigation |

### 8.4 Mobile Responsiveness

| Area | Tasks |
|------|-------|
| Navigation | Mobile hamburger menu |
| Dashboard | Stack cards vertically |
| Lesson view | Full-width on mobile |
| Code editor | Responsive Monaco |
| Tables | Horizontal scroll or card view |

### 8.5 Performance

| Task | Description |
|------|-------------|
| Image optimization | Next.js Image component |
| Code splitting | Dynamic imports for heavy components |
| Bundle analysis | Reduce bundle size |
| Caching | Appropriate cache headers |
| Loading states | Consistent skeletons |

### 8.6 Interactive Tutorial

- First-time user guided tour
- Highlight key features
- Step-by-step walkthrough
- Skip option

### Phase 8 Deliverables
- [ ] Notifications: in-app + email working
- [ ] Gamification: all celebrations polished
- [ ] Accessibility: WCAG AA compliant
- [ ] Mobile: fully responsive
- [ ] Performance: good Lighthouse scores
- [ ] Tutorial: first-time user tour
- [ ] All stub features completed

---

## Success Criteria for V1 Launch

### Functional
- [ ] User can sign up, complete onboarding, get personalized path
- [ ] User can browse and enroll in courses
- [ ] User can complete lessons (all 5 content types)
- [ ] User can interact with all 6 AI agents
- [ ] User can earn XP, level up, unlock achievements
- [ ] User can earn Bronze/Silver/Gold certifications
- [ ] Certificates can be verified publicly
- [ ] Enterprise admin can manage org and teams
- [ ] Admin can create and manage content

### Technical
- [ ] CI pipeline green (lint, typecheck, tests)
- [ ] 80%+ test coverage
- [ ] All pages load < 3s
- [ ] No critical security vulnerabilities
- [ ] Logging and monitoring operational
- [ ] Database migrations versioned
- [ ] K8s deployment automated

### Quality
- [ ] No major UI bugs
- [ ] Mobile responsive
- [ ] Accessible (WCAG AA)
- [ ] Error states handled gracefully
- [ ] Loading states consistent

---

## Appendix: File Structure After V1

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   ├── page.tsx (dashboard)
│   │   ├── courses/
│   │   ├── achievements/
│   │   ├── analytics/
│   │   ├── certifications/
│   │   ├── settings/
│   │   └── help/
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── content/
│   │   └── users/
│   ├── org/
│   │   ├── page.tsx
│   │   ├── teams/
│   │   ├── assignments/
│   │   └── settings/
│   ├── onboarding/
│   │   ├── role/
│   │   ├── assessment/
│   │   ├── goals/
│   │   ├── schedule/
│   │   ├── style/
│   │   └── path/
│   ├── verify/[certId]/
│   ├── api/
│   │   ├── auth/
│   │   ├── trpc/
│   │   ├── ai/
│   │   ├── sandbox/
│   │   ├── health/
│   │   └── webhooks/
│   └── lesson/[id]/
├── components/
│   ├── ui/ (shadcn)
│   ├── layout/
│   ├── learning/
│   ├── gamification/
│   ├── admin/
│   ├── enterprise/
│   ├── notifications/
│   └── onboarding/
├── lib/
│   ├── ai/
│   │   ├── agents/
│   │   ├── orchestrator/
│   │   ├── prompts/
│   │   └── rag/
│   ├── auth/
│   ├── certificates/
│   ├── db/
│   ├── email/
│   ├── logger.ts
│   ├── notifications/
│   ├── sandbox/
│   ├── telemetry.ts
│   ├── trpc/
│   └── utils/
├── stores/
└── __tests__/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Next Steps

1. Set up isolated git worktree for v1 development
2. Create detailed implementation plan for Phase 1
3. Begin Phase 1: Critical Fixes & Testing
