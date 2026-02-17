[![Live](https://img.shields.io/badge/Live-www.dronacharya.app-1e1b4b?style=flat-square)](https://www.dronacharya.app)
[![CI](https://img.shields.io/github/actions/workflow/status/hiteshgupta/dronacharya/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/hiteshgupta/dronacharya/actions)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)]()

# Dronacharya (द्रोणाचार्य)

> AI that teaches like a Guru

AI-powered learning platform with agentic workflows, gamification, and tiered certifications. Built with Next.js, LangChain, and PostgreSQL.

## Features

- **AI Agents** — Tutor (Socratic questioning), Mentor (career guidance), Assessor (quizzes), Code Review, Project Guide
- **Gamification** — XP, levels, streaks, achievements, leaderboards
- **Certifications** — Bronze (completion), Silver (exam), Gold (project review) with verifiable credentials
- **Adaptive Learning** — Personalized content based on skill level and pace
- **3 Domains (Beta)** — Python, Data Science, AI/ML

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL + Drizzle ORM |
| AI/LLM | LangChain (Claude, OpenAI) |
| Vector DB | Qdrant |
| Auth | NextAuth.js v5 |
| State | Zustand, TanStack Query |
| API | tRPC, Hono |
| Testing | Vitest, Playwright |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Redis 8+ (for rate limiting)
- Qdrant (optional for local dev, required for production RAG features) - See [Qdrant Setup Guide](./docs/QDRANT_SETUP.md)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Push schema to database
pnpm db:push

# Seed beta content
pnpm tsx scripts/seed-beta-content.ts

# Start development server
pnpm dev
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dronacharya

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-secret-32-chars>

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Vector DB (optional for local, required for production)
QDRANT_URL=http://localhost:6333      # or Qdrant Cloud URL
QDRANT_API_KEY=                        # required for Qdrant Cloud
```

See [QDRANT_SETUP.md](./docs/QDRANT_SETUP.md) for detailed Qdrant configuration.

## Development

```bash
pnpm dev              # Dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm test:unit        # Unit tests (Vitest)
pnpm test:integration # Integration tests
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Drizzle Studio
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components (ui, layout, learning, ai, gamification)
├── lib/
│   ├── ai/           # AI agents and prompts
│   ├── trpc/         # tRPC routers
│   ├── db/           # Drizzle schema and migrations
│   └── auth/         # NextAuth configuration
├── stores/           # Zustand stores
└── __tests__/        # Unit, integration, e2e tests
```

## Deployment

```
Production: https://www.dronacharya.app
Staging: deployed via GitHub Actions on push to main
```

```bash
# Docker
docker build -t dronacharya .
docker run -p 3000:3000 dronacharya

# Kubernetes
kubectl apply -f k8s/
```

Production is deployed on Azure App Service.

Health endpoints:
- `GET /api/health` — Liveness probe
- `GET /api/ready` — Readiness probe (checks DB)

## License

Private. All rights reserved.
