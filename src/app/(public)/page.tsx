"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, CheckCircle2, Database, GraduationCap, Sparkles, Target, Trophy, UserCheck, Zap, Code } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const featureCards = [
  {
    title: "AI-Powered Learning",
    description: "Six specialized agents help you learn faster, code smarter, and close every gap.",
    items: ["Tutor", "Assessor", "Mentor", "Code Review", "Project Guide", "Quiz Generator"],
    icon: Brain,
    accent: "from-[#1e1b4b] to-[#f59e0b]",
  },
  {
    title: "Gamification",
    description: "Progress compounds with every action through XP, levels, streaks, and meaningful milestones.",
    items: ["XP rewards", "Level progression", "Daily streaks", "Achievement unlocks", "Challenge paths", "Skill growth analytics"],
    icon: Target,
    accent: "from-[#f59e0b] to-[#1e1b4b]",
  },
  {
    title: "Certifications",
    description: "Validate your progress with trusted achievement tiers built for real hiring confidence.",
    items: ["Bronze", "Silver", "Gold"],
    icon: Trophy,
    accent: "from-[#312e81] to-[#1e1b4b]",
  },
];

const domains = [
  {
    name: "Python",
    description: "From syntax and scripting to automation and APIs.",
    icon: Code,
    gradient: "from-[#1e1b4b] to-[#312e81]",
  },
  {
    name: "Data Science",
    description: "Master analytics, SQL, visualization, and data-driven reasoning.",
    icon: Database,
    gradient: "from-[#1e1b4b] to-[#f59e0b]",
  },
  {
    name: "AI/ML",
    description: "Build models, understand inference, and ship intelligent applications.",
    icon: Sparkles,
    gradient: "from-[#f59e0b] to-[#1e1b4b]",
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
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <motion.div
          className="absolute -left-1/4 top-0 h-[32rem] w-[32rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(245,158,11,0.35) 0%, rgba(30,27,75,0.08) 55%, rgba(30,27,75,0) 72%)",
          }}
          animate={{ x: ["-10%", "10%", "-10%"], y: ["0%", "-8%", "0%"], scale: [1, 1.06, 1] }}
          transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-1/4 bottom-0 h-[36rem] w-[36rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(30,27,75,0.22) 0%, rgba(245,158,11,0.12) 58%, rgba(245,158,11,0) 78%)",
          }}
          animate={{ x: ["10%", "-10%", "10%"], y: ["0%", "8%", "0%"], scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>

      <section className="mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-center px-4 pb-12 pt-16 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="visible"
          variants={container}
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/35 bg-white/75 px-4 py-1 text-xs sm:text-sm font-medium text-[#1e1b4b] shadow-sm">
            <Zap className="h-4 w-4 text-[#f59e0b]" aria-hidden />
            Launch your path to mastery with AI
          </motion.div>
          <motion.h1
            variants={fadeIn}
            className="mt-5 text-4xl leading-tight font-bold tracking-tight text-[#1e1b4b] md:text-6xl"
          >
            Dronacharya
            <span className="block bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#f59e0b] bg-clip-text text-transparent">
              AI-powered learning, redefined.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg"
          >
            <span className="font-semibold text-[#1e1b4b]">AI that teaches like a Guru.</span>{" "}
            Learn with six expert agents, prove your progress, and build real AI-powered projects.
          </motion.p>
          <motion.div variants={fadeIn} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#f59e0b] text-white shadow-lg shadow-[#1e1b4b]/20 hover:brightness-110 focus-visible:ring-[#f59e0b]"
            >
              <Link href="/auth/register">
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#1e1b4b] text-[#1e1b4b] hover:border-[#f59e0b] hover:text-[#f59e0b]"
            >
              <a href="#features">See How It Works</a>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-col gap-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f59e0b]">
            What makes Dronacharya work
          </p>
          <h2 className="text-3xl font-bold text-[#1e1b4b] md:text-4xl">Learning Features</h2>
        </div>
        <motion.div
          className="grid gap-5 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={container}
        >
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={fadeIn}>
                <Card className="h-full border-[#e2e8f0] bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardHeader>
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r ${feature.accent}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="mt-4 text-xl text-[#1e1b4b]">{feature.title}</CardTitle>
                    <CardDescription className="mt-2 text-slate-700">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {feature.items.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#f59e0b]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f59e0b]">
            Domains
          </p>
          <h2 className="text-3xl font-bold text-[#1e1b4b] md:text-4xl">Choose your learning domain</h2>
        </div>
        <motion.div
          className="grid gap-4 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={container}
        >
          {domains.map((domain) => {
            const Icon = domain.icon;
            return (
              <motion.div key={domain.name} variants={fadeIn}>
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-[#f8fafc] p-0">
                  <div className={`h-1.5 bg-gradient-to-r ${domain.gradient}`} />
                  <CardContent className="px-6 py-8">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${domain.gradient}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-[#1e1b4b]">{domain.name}</h3>
                    <p className="mt-2 text-slate-700">{domain.description}</p>
                    <Button
                      variant="ghost"
                      className="mt-4 px-0 text-[#f59e0b] hover:text-[#1e1b4b] hover:bg-transparent"
                    >
                      Explore {domain.name}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr] lg:items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f59e0b]">Learning loop</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1e1b4b] md:text-4xl">How it works</h2>
            <p className="mt-4 max-w-md text-slate-700">
              A simple flow designed to keep momentum: pick your path, learn with AI, and prove your growth.
            </p>
          </motion.div>
          <div className="grid gap-4">
            {howItWorks.map((step) => {
              const StepIcon = step.icon;
              return (
                <motion.div key={step.number} variants={fadeIn}>
                  <Card className="group border-[#e2e8f0] bg-white/95">
                    <CardContent className="flex gap-4">
                      <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1e1b4b]/10 text-[#1e1b4b] group-hover:bg-[#1e1b4b] group-hover:text-white">
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold tracking-wider text-[#f59e0b]">{step.number}</p>
                          <h3 className="text-lg font-semibold text-[#1e1b4b]">{step.title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-2xl border border-[#e2e8f0] bg-[#fcfcff] p-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="rounded-xl border border-[#e2e8f0] bg-white p-5 text-center shadow-sm"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <p className="text-3xl font-bold text-[#1e1b4b]">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-700">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#e2e8f0] bg-gradient-to-r from-[#1e1b4b] to-[#312e81] py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left sm:px-6 lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-[#f59e0b]">Ready to start?</p>
            <h2 className="mt-2 text-2xl font-bold">Begin your guided AI learning journey today</h2>
            <p className="mt-2 text-sm text-white/85">
              Free account. Immediate access. Guided by a Guru.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#1e1b4b] shadow-lg shadow-[#f59e0b]/30"
          >
            <Link href="/auth/register">Register Now</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
