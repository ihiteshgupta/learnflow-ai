# Dronacharya Beta Launch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Launch Dronacharya beta at www.dronacharya.app with production infrastructure, marketing assets, analytics, error tracking, and beta testing workflows.

**Architecture:** Next.js 16 on Azure App Service with PostgreSQL Flexible Server, Redis, ACR. CI/CD via GitHub Actions. Public landing page for unauthenticated visitors, full app for logged-in users.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, PostgreSQL, Drizzle ORM, Azure, Terraform, PostHog, Sentry

**Codex Delegation Strategy:** Tasks marked with `[CODEX]` can be delegated to Codex via `codex_task`. Tasks marked with `[MANUAL]` require human action (Azure portal, DNS registrar, etc.). All other tasks are for the orchestrating agent.

---

## Task 1: Commit Pending Bug Fixes

**Files:**
- Modified: `src/components/paths/path-detail-content.tsx`
- Modified: `src/components/paths/path-learn-content.tsx`
- Modified: `src/lib/metrics/counters.ts`

**Step 1: Review the uncommitted changes**

These are already-written fixes:
- Replace non-null assertions (`!`) with nullish coalescing (`?? ''`)
- Replace `useEffect` auto-expand with `useMemo` (performance fix)
- Remove unused `Play` import

**Step 2: Run tests to verify fixes don't break anything**

```bash
cd ~/personal-projects/dronacharya
pnpm typecheck
pnpm test:unit
```

Expected: All pass

**Step 3: Commit**

```bash
git add src/components/paths/path-detail-content.tsx src/components/paths/path-learn-content.tsx src/lib/metrics/counters.ts
git commit -m "fix: path components type safety and performance

- Replace non-null assertions with nullish coalescing
- Replace useEffect auto-expand with useMemo for stable derivation
- Remove unused Play import"
```

---

## Task 2: Dependency Audit & Security Check

**Step 1: Run dependency audit**

```bash
pnpm audit --audit-level=moderate
```

**Step 2: Fix any moderate+ vulnerabilities**

```bash
pnpm audit --fix
```

**Step 3: Run full build to verify**

```bash
pnpm build
```

Expected: Production build succeeds with no errors

**Step 4: Commit if any fixes**

```bash
git add pnpm-lock.yaml package.json
git commit -m "fix: resolve dependency vulnerabilities"
```

---

## Task 3: Public Landing Page [CODEX]

Currently `src/app/page.tsx` is the dashboard (requires auth). We need a public landing page for unauthenticated visitors.

**Files:**
- Create: `src/app/(public)/page.tsx` — Public landing page
- Create: `src/app/(public)/layout.tsx` — Public layout (no sidebar)
- Move: `src/app/page.tsx` → `src/app/(app)/dashboard/page.tsx`
- Create: `src/app/(app)/layout.tsx` — Authenticated layout with sidebar
- Modify: `src/middleware.ts` — Route unauthenticated to public landing

**Step 1: Create public landing page**

The landing page should include:
- Hero section: "AI that teaches like a Guru" tagline, CTA buttons (Start Learning Free, See Demo)
- 3 feature cards: AI Agents, Gamification, Certifications
- Learning domains section: Python, Data Science, AI/ML
- How it works: 3-step flow (Sign Up → Choose Path → Learn with AI)
- Social proof section: Stats (6 AI Agents, 8 Courses, 3 Domains)
- CTA footer: "Ready to start your learning journey?"
- Brand colors: Deep Indigo (#1e1b4b) + Saffron/Gold (#f59e0b)
- Responsive, accessible (WCAG 2.1 AA)

**Step 2: Create route groups**

Use Next.js route groups:
- `(public)` — Landing, about, pricing (no auth required, no sidebar)
- `(app)` — Dashboard, courses, settings (auth required, sidebar layout)

**Step 3: Update middleware for auth routing**

Unauthenticated users hitting `/` see the landing page.
Authenticated users hitting `/` redirect to `/dashboard`.

**Step 4: Test**

```bash
pnpm build
# Verify: unauthenticated → landing page
# Verify: authenticated → dashboard
```

**Step 5: Commit**

```bash
git commit -m "feat: public landing page with route groups

- Add (public) route group with hero landing page
- Move dashboard to (app)/dashboard with auth layout
- Route unauthenticated users to landing page"
```

---

## Task 4: SEO — Sitemap & Robots.txt [CODEX]

**Files:**
- Create: `src/app/sitemap.ts` — Dynamic sitemap generation
- Create: `src/app/robots.ts` — Robots.txt generation

**Step 1: Create sitemap.ts**

```typescript
// src/app/sitemap.ts
import type { MetadatRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.dronacharya.app'
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
```

**Step 2: Create robots.ts**

```typescript
// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.dronacharya.app'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/settings/', '/admin/'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

**Step 3: Commit**

```bash
git commit -m "feat: add sitemap.xml and robots.txt generation"
```

---

## Task 5: Error Tracking — Sentry [CODEX]

**Files:**
- Create: `src/lib/sentry.ts` — Sentry initialization
- Modify: `src/app/global-error.tsx` — Report errors to Sentry
- Modify: `src/app/error.tsx` — Report errors to Sentry
- Modify: `next.config.ts` — Add Sentry webpack plugin
- Modify: `.env.example` — Add SENTRY_DSN

**Step 1: Install Sentry**

```bash
pnpm add @sentry/nextjs
```

**Step 2: Initialize Sentry**

Run the Sentry wizard or manually create:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Update `next.config.ts` with `withSentryConfig`

**Step 3: Add DSN to environment**

```bash
# .env.example
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

**Step 4: Wire up error boundaries**

Modify `global-error.tsx` and `error.tsx` to call `Sentry.captureException(error)`.

**Step 5: Test**

```bash
pnpm build
# Verify Sentry initializes without errors
```

**Step 6: Commit**

```bash
git commit -m "feat: add Sentry error tracking

- Initialize Sentry for client, server, and edge
- Wire up error boundaries to report exceptions
- Add source map upload for production builds"
```

---

## Task 6: Analytics — PostHog [CODEX]

**Files:**
- Create: `src/lib/posthog.ts` — PostHog client initialization
- Create: `src/components/providers/posthog-provider.tsx` — React provider
- Modify: `src/app/layout.tsx` — Add PostHog provider
- Modify: `.env.example` — Add PostHog keys

**Step 1: Install PostHog**

```bash
pnpm add posthog-js posthog-node
```

**Step 2: Create PostHog client**

```typescript
// src/lib/posthog.ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
    })
  }
}
```

**Step 3: Create provider and wrap app**

**Step 4: Add key events**

Track key user actions:
- `user_signed_up` — Registration complete
- `onboarding_completed` — Onboarding wizard done
- `lesson_started` — Lesson opened
- `lesson_completed` — Lesson finished
- `ai_chat_sent` — AI agent message sent
- `achievement_unlocked` — Achievement earned
- `course_enrolled` — Course enrollment

**Step 5: Commit**

```bash
git commit -m "feat: add PostHog analytics with key event tracking"
```

---

## Task 7: In-App Feedback Widget [CODEX]

**Files:**
- Create: `src/components/feedback/feedback-widget.tsx` — Floating feedback button + modal
- Create: `src/lib/trpc/routers/feedback.ts` — Feedback API
- Modify: `src/lib/trpc/root.ts` — Add feedback router
- Modify: `src/lib/db/schema/index.ts` — Add feedback table export
- Create: `src/lib/db/schema/feedback.ts` — Feedback table

**Step 1: Create feedback database table**

```typescript
// feedback table: id, userId, type (bug|feature|general), message, page, userAgent, createdAt
```

**Step 2: Create tRPC router**

```typescript
// submit feedback, list feedback (admin only)
```

**Step 3: Create floating feedback widget**

- Fixed bottom-right button (MessageSquare icon)
- Opens modal with: type selector (Bug / Feature Request / General), message textarea, current page auto-filled
- Submits via tRPC mutation
- Toast confirmation on submit

**Step 4: Add to authenticated layout**

**Step 5: Commit**

```bash
git commit -m "feat: in-app feedback widget with database storage"
```

---

## Task 8: Beta Invite System (Simple) [CODEX]

**Files:**
- Create: `src/lib/db/schema/beta.ts` — Beta invites table
- Create: `src/app/(public)/join-beta/page.tsx` — Beta signup page
- Modify: `src/app/auth/register/page.tsx` — Add invite code field
- Create: `src/lib/trpc/routers/beta.ts` — Beta invite API

**Step 1: Create beta invites table**

```typescript
// betaInvites: id, email, code, status (pending|accepted|expired), createdAt, acceptedAt
```

**Step 2: Create join-beta page**

Simple form: email + "Request Access" button.
On submit, creates a beta invite record.

**Step 3: Modify registration**

Add optional invite code field. If present, validate and mark as accepted.
Without invite code, registration still works (open beta).

**Step 4: Create admin API for managing invites**

- Generate invite codes
- List pending invites
- Bulk invite via email (future)

**Step 5: Commit**

```bash
git commit -m "feat: beta invite system with email signup and invite codes"
```

---

## Task 9: Azure Infrastructure Provisioning [MANUAL]

**Prerequisite:** Azure CLI logged in, Terraform installed

**Step 1: Review and update terraform variables**

```bash
cd ~/personal-projects/dronacharya/terraform/azure
```

Verify `variables.tf` has correct:
- Resource group name: `dronacharya-production-rg`
- Region: `centralindia` (or nearest)
- PostgreSQL SKU: `B_Standard_B1ms`
- Redis SKU: `Basic C0`
- App Service plan: `B1`

**Step 2: Initialize and apply**

```bash
export TF_VAR_postgres_admin_password="$(openssl rand -base64 24)"
export TF_VAR_anthropic_api_key="sk-ant-..."
export TF_VAR_openai_api_key="sk-..."
export TF_VAR_nextauth_secret="$(openssl rand -base64 32)"

terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

**Step 3: Save outputs**

```bash
terraform output -json > ~/personal-projects/dronacharya/.terraform-outputs.json
```

Note: DATABASE_URL, REDIS_URL, ACR login server from outputs.

**Step 4: Configure App Service environment variables**

```bash
az webapp config appsettings set \
  --name dronacharya-app \
  --resource-group dronacharya-production-rg \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="$(terraform output -raw database_url)" \
    REDIS_URL="$(terraform output -raw redis_url)" \
    NEXTAUTH_SECRET="$TF_VAR_nextauth_secret" \
    NEXTAUTH_URL="https://www.dronacharya.app" \
    NEXT_PUBLIC_APP_URL="https://www.dronacharya.app" \
    ANTHROPIC_API_KEY="$TF_VAR_anthropic_api_key" \
    OPENAI_API_KEY="$TF_VAR_openai_api_key"
```

---

## Task 10: CI/CD Pipeline Update [CODEX]

**Files:**
- Modify: `.github/workflows/ci.yml` — Add deploy job

**Step 1: Add deploy job to CI pipeline**

After build job succeeds on `main` branch:
1. Build Docker image
2. Push to ACR
3. Deploy to App Service via `az webapp deployment`

**Step 2: Add GitHub secrets**

```
AZURE_CREDENTIALS (service principal JSON)
ACR_LOGIN_SERVER
ACR_USERNAME
ACR_PASSWORD
SENTRY_AUTH_TOKEN
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_POSTHOG_KEY
```

**Step 3: Commit**

```bash
git commit -m "feat: add production deploy job to CI/CD pipeline"
```

---

## Task 11: Domain & SSL Setup [MANUAL]

**Step 1: Get Azure DNS nameservers**

```bash
az network dns zone show \
  --resource-group dronacharya-production-rg \
  --name dronacharya.app \
  --query nameServers -o tsv
```

**Step 2: Update domain registrar NS records**

Point dronacharya.app nameservers to Azure DNS values.

**Step 3: Add custom domains to App Service**

```bash
az webapp config hostname add \
  --webapp-name dronacharya-app \
  --resource-group dronacharya-production-rg \
  --hostname www.dronacharya.app

az webapp config hostname add \
  --webapp-name dronacharya-app \
  --resource-group dronacharya-production-rg \
  --hostname dronacharya.app
```

**Step 4: Enable managed SSL**

```bash
az webapp config ssl create \
  --name dronacharya-app \
  --resource-group dronacharya-production-rg \
  --hostname www.dronacharya.app

az webapp config ssl bind \
  --name dronacharya-app \
  --resource-group dronacharya-production-rg \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

**Step 5: Verify**

```bash
curl -I https://www.dronacharya.app
# Expected: 200 OK with valid SSL
```

---

## Task 12: Database Migration & Seed [MANUAL]

**Step 1: Connect to production PostgreSQL**

```bash
# Use connection string from terraform output
export DATABASE_URL="$(terraform -chdir=terraform/azure output -raw database_url)"
```

**Step 2: Push schema**

```bash
pnpm db:push
```

**Step 3: Seed beta content**

```bash
pnpm db:seed
```

**Step 4: Verify**

```bash
pnpm db:studio
# Check: domains (3), tracks (5), courses (8), achievements (9)
```

---

## Task 13: Smoke Test

**Step 1: Run smoke test checklist**

After deployment, verify:

| Test | URL | Expected |
|------|-----|----------|
| Landing page loads | `https://www.dronacharya.app` | Public landing page |
| Login page | `https://www.dronacharya.app/auth/login` | Login form |
| Register + onboarding | `https://www.dronacharya.app/auth/register` | Complete signup flow |
| Dashboard | `https://www.dronacharya.app/dashboard` | Stats, domains, achievements |
| Course catalog | `https://www.dronacharya.app/courses` | Course cards load |
| AI tutor | Open a lesson, send a message | AI responds within 5s |
| Health check | `https://www.dronacharya.app/api/health` | `{"status":"healthy"}` |
| Metrics | `https://www.dronacharya.app/api/metrics` | Prometheus format |
| Sitemap | `https://www.dronacharya.app/sitemap.xml` | Valid XML |
| Robots | `https://www.dronacharya.app/robots.txt` | Valid rules |

**Step 2: Monitor Sentry for errors**

Check Sentry dashboard for any exceptions during smoke testing.

**Step 3: Verify PostHog events**

Check PostHog dashboard for pageview and event tracking.

---

## Task 14: Product Hunt Launch Kit [CODEX]

**Files:**
- Create: `docs/marketing/product-hunt.md` — Product Hunt submission content
- Create: `public/marketing/` — Screenshots and gallery images

**Step 1: Write Product Hunt content**

```markdown
## Product Hunt Submission

**Name:** Dronacharya
**Tagline:** AI that teaches like a Guru — learn programming with 6 specialized AI agents
**Description:** (250 words)
**Topics:** AI, Education, Developer Tools, Learning Platform
**First Comment:** (personal story from maker)

## Gallery Images (5)
1. Dashboard with gamification stats
2. AI Tutor conversation
3. Course catalog
4. Achievement system
5. Learning path view
```

**Step 2: Create gallery screenshots**

Use Playwright to capture pages:
```bash
# Script to capture screenshots at 1270x760 (PH recommended)
```

**Step 3: Commit**

```bash
git commit -m "docs: Product Hunt launch kit with submission content"
```

---

## Task 15: Social Media Announcement [CODEX]

**Files:**
- Create: `docs/marketing/social-media.md` — Templates for launch posts

**Step 1: Write announcement templates**

```markdown
## Twitter/X Launch Thread

Tweet 1 (Hook):
"I built an AI learning platform with 6 specialized agents that teach you like a personal guru.

It's called Dronacharya, and today it's live. 🧵"

Tweet 2 (What it does):
"Dronacharya has 6 AI agents, each with a specific role:
- Tutor: Socratic questioning
- Assessor: Adaptive quizzes
- Mentor: Career guidance
- Code Review: Security + quality
- Project Guide: Portfolio help
- Quiz Generator: RAG-based questions"

Tweet 3 (Gamification):
"Learning is a game — literally.
XP, streaks, levels, achievements, leaderboards.
Every lesson earns progress."

Tweet 4 (Tech):
"Built with: Next.js 16, LangChain, Claude + GPT-4, PostgreSQL, Qdrant
Deployed on Azure. Open beta."

Tweet 5 (CTA):
"Try it free: www.dronacharya.app
Show us on Product Hunt: [link]"

---

## LinkedIn Post
(Professional announcement format)

## Reddit Post
(r/learnprogramming, r/artificial, r/webdev)
```

**Step 2: Commit**

```bash
git commit -m "docs: social media launch announcement templates"
```

---

## Task 16: Update README with Live URLs

**Files:**
- Modify: `README.md`

**Step 1: Add live URLs and badges**

Add to top of README:
- Live URL badge: www.dronacharya.app
- CI status badge from GitHub Actions
- License badge

Update any localhost references to production URLs.

**Step 2: Commit**

```bash
git commit -m "docs: update README with live URLs and badges"
```

---

## Execution Order & Dependencies

```
Task 1 (commit fixes) ──┐
Task 2 (audit)          ├── Sequential (stabilization)
                        │
Task 3 (landing page)   ┐
Task 4 (sitemap/robots) │
Task 5 (Sentry)         ├── Parallel [CODEX delegation]
Task 6 (PostHog)        │
Task 7 (feedback widget)│
Task 8 (beta invites)   ┘
                        │
Task 9 (Azure infra)    ┐
Task 10 (CI/CD update)  ├── Sequential [MANUAL + CODEX]
Task 11 (domain/SSL)    │
Task 12 (DB migrate)    ┘
                        │
Task 13 (smoke test)    ── After deployment
                        │
Task 14 (Product Hunt)  ┐
Task 15 (social media)  ├── Parallel [CODEX delegation]
Task 16 (README update) ┘
```

**Estimated Codex Delegations:** Tasks 3-8 and 14-15 can run as `codex_task` calls.
**Human Required:** Tasks 9, 11, 12 (Azure portal, DNS, database access).
