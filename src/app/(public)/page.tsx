"use client";

import Link from "next/link";

import { ArrowRight, BookOpen, Brain, CheckCircle2, Code, Database, GraduationCap, Sparkles, Target, Trophy, UserCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const featureCards = [
  {
    title: "AI-Powered Learning",
    description: "Six specialized agents help you learn faster, code smarter, and close every gap.",
    items: ["Tutor", "Assessor", "Mentor", "Code Review", "Project Guide", "Quiz Generator"],
    icon: Brain,
  },
  {
    title: "Gamification",
    description: "Progress compounds with every action through XP, levels, streaks, and meaningful milestones.",
    items: ["XP rewards", "Level progression", "Daily streaks", "Achievement unlocks", "Challenge paths", "Skill growth analytics"],
    icon: Target,
  },
  {
    title: "Certifications",
    description: "Validate your progress with trusted achievement tiers built for real hiring confidence.",
    items: ["Bronze", "Silver", "Gold"],
    icon: Trophy,
  },
];

const domains = [
  {
    name: "Python",
    description: "From syntax and scripting to automation and APIs.",
    icon: Code,
  },
  {
    name: "Data Science",
    description: "Master analytics, SQL, visualization, and data-driven reasoning.",
    icon: Database,
  },
  {
    name: "AI/ML",
    description: "Build models, understand inference, and ship intelligent applications.",
    icon: Sparkles,
  },
];

const howItWorks = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your account and tell us your goals, experience level, and interests.",
    icon: GraduationCap,
  },
  {
    number: "02",
    title: "Choose Your Path",
    description: "Pick Python, Data Science, or AI/ML and follow a personalized curriculum.",
    icon: BookOpen,
  },
  {
    number: "03",
    title: "Learn with AI",
    description: "Work with your Guru agent and complete guided sessions, projects, and assessments.",
    icon: UserCheck,
  },
];

const stats = [
  { label: "AI Agents", value: "6" },
  { label: "Courses", value: "8" },
  { label: "Domains", value: "3" },
  { label: "Achievements", value: "9" },
];

export default function PublicLandingPage() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-center px-4 pb-12 pt-16 sm:px-6 lg:px-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/30 opacity-40" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-border/20 opacity-30" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-border/10 opacity-20" />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
          />
        </div>

        <div className="mx-auto max-w-4xl text-center animate-guru-entrance">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div
                className="animate-chakra w-16 h-16 rounded-full border-[3px] border-dashed border-gold"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground mb-6 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-gold" aria-hidden />
            The way of the Guru. The path of mastery.
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-none mb-4">
            <span className="block text-foreground">Dronacharya</span>
            <span className="block mt-2 gradient-text-brand" style={{ lineHeight: 1.1 }}>
              AI that teaches like a Guru.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Six specialized AI agents. Adaptive learning paths. Real certifications.{" "}
            <span className="font-semibold text-foreground">Master Python, Data Science, and AI/ML</span>{" "}
            guided by the wisdom of a legendary teacher.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gradient-brand border-0 text-white shadow-lg hover:opacity-90 transition-opacity px-8 text-base"
            >
              <Link href="/auth/register">
                Begin Your Journey
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 text-base">
              <a href="#features">Explore the Path</a>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-col gap-2 text-center">
          <p
            className="text-sm font-semibold uppercase tracking-[0.18em] text-gold"
          >
            What makes Dronacharya work
          </p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Learning Features</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title}>
                <Card className="h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <CardHeader>
                    <div
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-brand animate-sacred-glow",
                        i === 0 ? "animate-flame" : "animate-lotus-bloom"
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
                    <CardDescription className="mt-2">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {feature.items.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-gold" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <p
            className="text-sm font-semibold uppercase tracking-[0.18em] text-gold"
          >
            Domains
          </p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Choose your learning domain</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {domains.map((domain) => {
            const Icon = domain.icon;
            return (
              <div key={domain.name}>
                <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                  <CardContent className="px-6 py-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:gradient-brand group-hover:text-white transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{domain.name}</h3>
                    <p className="mt-2 text-muted-foreground">{domain.description}</p>
                    <Button variant="ghost" className="mt-4 px-0 text-primary hover:text-primary/80 hover:bg-transparent">
                      Explore {domain.name}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr] lg:items-start">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-[0.18em] text-gold"
            >
              Learning loop
            </p>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">How it works</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              A simple flow designed to keep momentum: pick your path, learn with AI, and prove your growth.
            </p>
          </div>
          <div className="grid gap-4">
            {howItWorks.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number}>
                  <Card className="group">
                    <CardContent className="flex gap-4">
                      <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold tracking-wider gradient-text-gold">{step.number}</p>
                          <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 border rounded-2xl overflow-hidden bg-card">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn("px-8 py-6 text-center", i < stats.length - 1 && "border-r border-b sm:border-b-0")}
            >
              <p className="text-3xl font-extrabold gradient-text-brand">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-primary text-primary-foreground py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
              <div
                className="animate-chakra w-5 h-5 rounded-full border-2 border-dashed border-gold/80 opacity-80"
              />
              <p className="text-sm uppercase tracking-[0.16em] font-semibold text-gold/90">
                Ready to begin?
              </p>
            </div>
            <h2 className="mt-2 text-2xl font-bold">Begin your guided AI learning journey today</h2>
            <p className="mt-2 text-sm opacity-80">Free account. Immediate access. Guided by a Guru.</p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gold text-[oklch(0.15_0.025_40)] hover:opacity-90 transition-opacity font-semibold"
          >
            <Link href="/auth/register">Register Now</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
