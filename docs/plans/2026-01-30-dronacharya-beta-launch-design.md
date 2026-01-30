# Dronacharya Beta Launch Design

**Date:** January 30, 2026
**Status:** Approved
**Timeline:** 2.5 weeks (Target: February 15, 2026)
**Author:** Hitesh Gupta

---

## Overview

Rebrand LearnFlow AI to "Dronacharya" and launch as an open beta under the Margadeshaka umbrella. Complete all 6 AI agents, polish existing features, and deploy on Azure.

---

## Brand Identity

**Name:** Dronacharya (द्रोणाचार्य)
**Tagline:** "AI that teaches like a Guru"
**Domain:** dronacharya.ai (or dronacharya.margadeshaka.ai for beta)

### Brand Positioning
- Named after the legendary teacher from Mahabharata who trained the Pandavas
- Emphasizes mastery through personalized guidance
- Part of Margadeshaka family (alongside Sakha)

### Visual Identity
- **Primary colors:** Deep indigo (#1e1b4b) + Saffron/Gold (#f59e0b)
- **Accent:** Teal (#14b8a6) for progress/success states
- **Logo concept:** Stylized bow & arrow (Drona's signature) + neural network nodes
- **Typography:** Inter/Plus Jakarta Sans with Devanagari accent for logo

### Project Restructure
```
~/personal-projects/dronacharya/     # Renamed from learnflow-ai
├── src/
├── docs/
├── public/
│   └── brand/                       # Logo, icons, OG images
├── package.json                     # name: "dronacharya"
└── CLAUDE.md                        # Updated project docs
```

---

## Target Audience

- **Primary:** Developers, tech professionals, students learning programming
- **Domains:** Programming (Python), Data Science, AI/ML
- **Access:** Open beta - anyone can sign up

---

## Feature Scope

### Core Learning Experience (Must Have)

| Feature | Status | Work Needed |
|---------|--------|-------------|
| User Auth (Google, Email) | ✅ Done | Minor polish |
| Onboarding Flow | ❌ Missing | Build 4-step wizard |
| Dashboard with progress | ✅ Done | Rebrand styling |
| Course catalog (3 domains) | ✅ Partial | Add Python, Data Science, AI/ML content |
| Lesson viewer | ✅ Done | Test & polish |
| AI Tutor chat | ✅ Working | Enhance prompts |

### AI Agents (Complete All 6)

| Agent | Status | Priority |
|-------|--------|----------|
| Tutor | ✅ Working | Polish prompts |
| Assessor | ✅ Working | Add more question types |
| Mentor | ✅ Working | Career path integration |
| Code Review | 🟡 Partial | Finish implementation |
| Project Guide | 🟡 Partial | Milestone tracking |
| Quiz Generator | ❌ Missing | Build with RAG |

### Gamification (Ship Existing)
- XP system ✅
- Levels & progression ✅
- Streaks ✅
- Achievements ✅
- Leaderboards ✅

### Deferred to Post-Beta
- Certification PDF generation
- Code execution sandbox
- Enterprise/team features
- Admin panel
- Payment integration

### Content for Beta
- 3-5 courses per domain (Python basics → advanced, Data Science intro, ML fundamentals)
- Seed with curated free content, clearly marked as "Beta Content"

---

## Technical Architecture

### Stack (Keep Existing)
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **Backend:** tRPC, Hono, NextAuth v5
- **Database:** PostgreSQL (Azure Database for PostgreSQL)
- **AI:** LangChain + Anthropic Claude (primary), OpenAI (fallback)
- **Vector DB:** Qdrant (for RAG content retrieval)
- **State:** Zustand + TanStack Query

### Azure Infrastructure

```
Azure Resource Group: rg-dronacharya-prod
├── App Service Plan (B1 for beta)
│   └── Web App: dronacharya-app
├── Azure Database for PostgreSQL (Flexible Server)
├── Azure Blob Storage (content, user uploads)
├── Azure Key Vault (secrets)
├── Application Insights (monitoring)
└── Azure Front Door (CDN + custom domain)
```

### Environments
- `dev` — Local development
- `staging` — Azure preview slot for testing
- `prod` — Live beta at dronacharya.ai

### CI/CD Pipeline (GitHub Actions)
```
push to main → lint → typecheck → test → build → deploy staging
manual approval → deploy prod
```

### Database Schema Updates
- Rename `learnflow_` prefixes to `dronacharya_`
- Add `beta_feedback` table for user feedback collection
- Add `waitlist` table (for future use)

### Estimated Azure Costs (Beta)
- App Service B1: ~$13/month
- PostgreSQL Flexible (Burstable B1ms): ~$15/month
- Storage + CDN: ~$5/month
- **Total: ~$35/month**

---

## Implementation Timeline (2.5 Weeks)

### Week 1: Foundation & Rebrand (Days 1-5)

| Day | Focus | Deliverables |
|-----|-------|--------------|
| 1-2 | Project rebrand | Rename repo, update all references, new package.json, CLAUDE.md |
| 2-3 | Brand assets | Logo design, color system, favicon, OG images |
| 3-4 | UI rebrand | Update theme colors, typography, landing page |
| 4-5 | Onboarding flow | 4-step wizard (name → goals → skill level → first course) |
| 5 | Critical bug fixes | Remove hardcoded IDs, fix auth flow, settings persistence |

### Week 2: AI Agents & Content (Days 6-10)

| Day | Focus | Deliverables |
|-----|-------|--------------|
| 6-7 | Code Review Agent | Complete implementation, test with sample code |
| 7-8 | Project Guide Agent | Milestone tracking, progress validation |
| 8-9 | Quiz Generator Agent | RAG integration, 3 question types |
| 9-10 | Course content | Seed 3 Python courses, 2 Data Science, 2 ML |
| 10 | AI prompt polish | Refine all 6 agents, consistent Dronacharya personality |

### Week 3: Testing, Polish & Launch (Days 11-17)

| Day | Focus | Deliverables |
|-----|-------|--------------|
| 11-12 | Testing | Unit tests (80% coverage), integration tests, E2E critical paths |
| 12-13 | Azure deployment | Infra setup, staging deployment, DNS configuration |
| 13-14 | Beta polish | Performance optimization, error handling, loading states |
| 14-15 | Soft launch | Internal testing, fix blockers |
| 15-17 | Public beta | Launch announcement, monitor, hotfix as needed |

### Launch Checklist
- [ ] dronacharya.ai domain configured
- [ ] SSL certificate active
- [ ] Application Insights alerting
- [ ] Error tracking (Sentry or similar)
- [ ] Beta feedback widget integrated
- [ ] Social links and contact info

---

## Launch Strategy

### Pre-Launch (Days 1-14)
- Update margadeshaka.ai homepage with Dronacharya teaser
- Create "Coming Soon" section with email capture
- Prepare social media assets (Twitter/X, LinkedIn, Product Hunt draft)
- Write launch blog post for Margadeshaka blog

### Launch Day Channels
1. **Twitter/X** — Thread announcing Dronacharya with demo GIFs
2. **LinkedIn** — Professional announcement, your network
3. **Reddit** — r/learnprogramming, r/datascience, r/artificial (follow rules)
4. **Product Hunt** — Schedule for week after launch (once stable)
5. **Hacker News** — Show HN post if traction is good

### Beta Feedback Collection
- In-app feedback button (bottom-right corner)
- Post-session "How was your learning?" prompt
- Weekly email survey to active users
- Discord/Telegram community for power users (optional)

---

## Success Metrics

| Metric | Target (4 weeks post-launch) |
|--------|------------------------------|
| Sign-ups | 500+ |
| DAU (Daily Active Users) | 50+ |
| Lessons completed | 1000+ |
| AI conversations | 2000+ |
| Avg session duration | 10+ minutes |
| NPS score | 30+ |
| Critical bugs reported | <10 |

---

## Post-Beta Roadmap

1. Analyze user behavior — which courses, which agents, drop-off points
2. Prioritize based on feedback — certifications? more domains? mobile app?
3. Plan Sakha cross-promotion — offer Dronacharya to Sakha users
4. Consider pricing model — freemium vs subscription vs pay-per-course

---

## Decisions Made

| Question | Decision |
|----------|----------|
| Which app first? | LearnFlow AI (as Dronacharya) |
| Beta scope | Full platform preview |
| Target audience | Mixed/General with domain selection |
| Timeline | 2-3 weeks (aggressive) |
| Rebrand depth | Complete identity (logo, guidelines, assets) |
| Learning domains | Tech-only (Programming, Data Science, AI/ML) |
| Hosting | Azure (matches Sakha stack) |
| Beta access | Open beta (anyone can sign up) |
