# Product Hunt Launch Kit

## Submission Details

**Name:** Dronacharya
**Tagline:** AI that teaches like a Guru — learn programming with 6 specialized AI agents
**URL:** https://www.dronacharya.app
**Topics:** AI, Education, Developer Tools, Learning Platform, EdTech

## Description (250 words)

Dronacharya is an AI-powered learning platform where six specialized agents guide you through programming, data science, and AI/ML — like having a personal team of expert tutors.

Unlike generic AI chatbots, each Dronacharya agent has a focused role:

- **Tutor** uses Socratic questioning to help you understand concepts deeply, not just memorize answers
- **Assessor** generates adaptive quizzes that match your skill level and identify knowledge gaps
- **Mentor** provides career guidance and keeps you motivated through your learning journey
- **Code Review** analyzes your code for bugs, security issues, and best practices
- **Project Guide** helps you build portfolio-worthy projects with real-world architecture
- **Quiz Generator** creates RAG-based questions from actual course content

The platform includes full gamification: XP rewards, level progression, daily streaks, achievements, and leaderboards that make learning feel like a game. Three certification tiers (Bronze, Silver, Gold) validate your progress with verifiable credentials.

Built with Next.js 16, LangChain, Claude + GPT-4, PostgreSQL, and Qdrant for RAG. Currently in open beta with three learning domains: Python, Data Science, and AI/ML.

Named after the legendary teacher from Mahabharata, Dronacharya embodies the philosophy that great teaching adapts to each student.

## First Comment (Maker's Story)

I built Dronacharya because I was frustrated with AI tutoring tools that are just chatbot wrappers. Real teaching needs different modes — sometimes you need Socratic questioning, sometimes you need code review, sometimes you need a quiz to test yourself.

So I built a system with 6 specialized AI agents, each designed for a specific teaching interaction. The gamification keeps you coming back, and the certifications give you something to show for your effort.

Tech: Next.js 16 + LangChain + Claude/GPT-4 + PostgreSQL + Qdrant. Built as a solo developer over several months.

Try it free at www.dronacharya.app — would love your feedback.

## Gallery Images (5 screenshots needed)

1. **Landing Page** — Hero section with "AI that teaches like a Guru" headline
2. **Dashboard** — Gamification stats (XP, level, streak, badges) with domain cards
3. **AI Tutor** — Conversation with the Tutor agent showing Socratic dialogue
4. **Course Catalog** — Course cards with progress indicators
5. **Achievement System** — Badges, levels, and certification tiers

### Screenshot Capture Script

```bash
# Use Playwright to capture at Product Hunt recommended 1270x760
npx playwright screenshot --viewport-size=1270,760 https://www.dronacharya.app public/marketing/ph-1-landing.png
npx playwright screenshot --viewport-size=1270,760 https://www.dronacharya.app/dashboard public/marketing/ph-2-dashboard.png
npx playwright screenshot --viewport-size=1270,760 https://www.dronacharya.app/courses public/marketing/ph-3-courses.png
npx playwright screenshot --viewport-size=1270,760 https://www.dronacharya.app/achievements public/marketing/ph-4-achievements.png
```

## Launch Strategy

- Post on Tuesday-Thursday between 12:01 AM PST (optimal PH timing)
- Share in relevant communities: r/learnprogramming, r/artificial, HN, Indie Hackers
- Engage with every comment within the first 4 hours
- Cross-post to Twitter and LinkedIn simultaneously
