'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sun, Moon, Zap, Trophy, Flame, BookOpen, Brain, Code2, Target,
  TrendingUp, Star, CheckCircle, Lock, ArrowRight, Sparkles, Award,
  BarChart3, Users, Clock
} from 'lucide-react';

export default function ThemePreviewPage() {
  const { theme, setTheme } = useTheme();
  const [xp] = useState(2450);
  const [level] = useState(7);
  const [streak] = useState(12);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar with theme toggle */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">Dronacharya</span>
            <Badge variant="outline" className="text-xs">Theme Preview</Badge>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm font-medium"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 space-y-12">

        {/* SECTION 1: Hero / Dashboard Welcome */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section 1 — Dashboard Hero</p>
          <div className="relative overflow-hidden rounded-2xl p-8" style={{background: 'linear-gradient(135deg, var(--indigo) 0%, color-mix(in oklch, var(--indigo) 70%, var(--violet)) 100%)'}}>
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{background: 'radial-gradient(circle, white, transparent)'}} />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-5" style={{background: 'radial-gradient(circle, white, transparent)'}} />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Welcome back, <span style={{color: 'var(--gold)'}}>Hitesh!</span>
                </h1>
                <p className="mt-2 text-white/70">Continue your learning journey. You're on a roll!</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
                    <Zap className="h-4 w-4 text-yellow-300" />
                    {xp.toLocaleString()} XP
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
                    <Flame className="h-4 w-4 text-orange-300" />
                    {streak} day streak
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
                    <Star className="h-4 w-4 text-amber-300" />
                    Level {level}
                  </div>
                </div>
              </div>
              <Button size="lg" className="bg-white text-primary font-semibold hover:bg-white/90 shrink-0">
                Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 2: Stat Cards */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section 2 — Stat Cards</p>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="card-elevated card-stat-indigo">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Level</CardTitle>
                <div className="p-2 rounded-lg gradient-brand"><Trophy className="h-4 w-4 text-white" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{level}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={62} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">62%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated card-stat-gold">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total XP</CardTitle>
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><Zap className="h-4 w-4 text-amber-500" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums">{xp.toLocaleString()}</div>
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +340 this week
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated card-stat-rose">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30"><Flame className="h-4 w-4 text-rose-500" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums">{streak} <span className="text-lg font-normal text-muted-foreground">days</span></div>
                <p className="text-xs text-muted-foreground mt-1">Best: 21 days</p>
              </CardContent>
            </Card>

            <Card className="card-elevated card-stat-teal">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Badges</CardTitle>
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30"><Award className="h-4 w-4 text-teal-600" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums">8 <span className="text-lg font-normal text-muted-foreground">/ 24</span></div>
                <p className="text-xs text-muted-foreground mt-1">Badges earned</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION 3: Course Cards */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section 3 — Course Cards</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Python Fundamentals', desc: 'Variables, data types, control flow, functions', icon: Code2, color: 'from-emerald-500 to-cyan-500', progress: 75, lessons: 12, total: 16, badge: 'In Progress' },
              { title: 'Data Science with pandas', desc: 'DataFrames, cleaning, visualization, analysis', icon: BarChart3, color: 'from-violet-500 to-purple-500', progress: 30, lessons: 5, total: 18, badge: 'New' },
              { title: 'Machine Learning Basics', desc: 'Supervised learning, models, evaluation', icon: Brain, color: 'from-amber-500 to-rose-500', progress: 0, lessons: 0, total: 20, badge: 'Locked' },
            ].map((course) => (
              <Card key={course.title} className="card-elevated overflow-hidden group cursor-pointer">
                <div className="h-1.5 w-full" style={{background: `linear-gradient(to right, ${course.color.replace('from-', '').replace(' to-', ', ')})`}} />
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${course.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <course.icon className="h-5 w-5" />
                    </div>
                    <Badge variant={course.badge === 'Locked' ? 'outline' : course.badge === 'New' ? 'secondary' : 'default'}
                      className={course.badge === 'In Progress' ? 'gradient-brand text-white border-0 text-xs' : 'text-xs'}>
                      {course.badge}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-base group-hover:text-primary transition-colors">{course.title}</CardTitle>
                  <CardDescription className="text-sm">{course.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.lessons}/{course.total} lessons</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                  <Button className={`w-full mt-4 ${course.badge === 'Locked' ? 'opacity-50' : 'gradient-brand text-white'}`} disabled={course.badge === 'Locked'} size="sm">
                    {course.badge === 'Locked' ? <><Lock className="mr-2 h-3.5 w-3.5" /> Locked</> : <><BookOpen className="mr-2 h-3.5 w-3.5" /> {course.progress > 0 ? 'Continue' : 'Start'}</>}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 4: Achievement Cards */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section 4 — Achievements</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'First Steps', desc: 'Complete your first lesson', earned: true, xp: 50, category: 'milestone' },
              { name: 'Week Warrior', desc: '7-day learning streak', earned: true, xp: 100, category: 'streak' },
              { name: 'Code Ninja', desc: 'Write 100 lines of code', earned: false, xp: 200, category: 'coding' },
              { name: 'Quiz Master', desc: 'Score 100% on 5 quizzes', earned: false, xp: 300, category: 'quiz' },
            ].map((a) => (
              <Card key={a.name} className={`card-elevated relative overflow-hidden ${!a.earned ? 'opacity-70' : ''}`}>
                {a.earned && <div className="absolute top-0 left-0 right-0 h-1 gradient-success" />}
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl shrink-0 ${a.earned ? 'gradient-brand' : 'bg-muted'}`}>
                      <Trophy className={`h-5 w-5 ${a.earned ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.desc}</p>
                      <div className="mt-2">
                        <Badge className={a.earned ? 'gradient-success text-white border-0 text-xs' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 text-xs'}>
                          {a.earned ? <><CheckCircle className="h-3 w-3 mr-1" />Earned</> : <><Zap className="h-3 w-3 mr-1" />+{a.xp} XP</>}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 5: Lesson Activity Chart */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section 5 — Weekly Activity</p>
          <Card className="card-featured">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Your learning activity over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3 h-40">
                {[
                  { day: 'Mon', xp: 120, h: 55 },
                  { day: 'Tue', xp: 85, h: 39 },
                  { day: 'Wed', xp: 210, h: 96 },
                  { day: 'Thu', xp: 60, h: 28 },
                  { day: 'Fri', xp: 175, h: 80 },
                  { day: 'Sat', xp: 240, h: 100 },
                  { day: 'Sun', xp: 95, h: 44 },
                ].map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums">{d.xp}</span>
                    <div className="w-full rounded-t-md gradient-brand transition-all duration-500 hover:opacity-80" style={{height: `${d.h}%`, minHeight: '6px'}} />
                    <span className="text-xs font-medium">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">985 XP</span></span>
                  <span className="text-muted-foreground">Lessons: <span className="font-semibold text-foreground">14</span></span>
                </div>
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium"><TrendingUp className="h-3 w-3" />+23% vs last week</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 6: Certification Cards */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section 6 — Certifications</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'Python Fundamentals', tier: 'Bronze', status: 'earned', date: 'Jan 15, 2026', id: 'LF-PY-2026-001' },
              { name: 'Data Science Basics', tier: 'Silver', status: 'in-progress', progress: 65 },
              { name: 'ML Foundations', tier: 'Gold', status: 'locked', prereq: 'Complete Data Science first' },
            ].map((cert) => (
              <Card key={cert.name} className={`card-elevated overflow-hidden ${cert.status === 'locked' ? 'opacity-60' : ''}`}>
                <div className={`h-1 ${cert.tier === 'Bronze' ? 'gradient-brand' : cert.tier === 'Silver' ? 'bg-slate-400' : 'bg-amber-400'}`} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl ${cert.tier === 'Bronze' ? 'gradient-brand' : cert.tier === 'Silver' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                      {cert.status === 'locked'
                        ? <Lock className="h-6 w-6 text-muted-foreground" />
                        : <Award className={`h-6 w-6 ${cert.tier === 'Bronze' ? 'text-white' : cert.tier === 'Silver' ? 'text-slate-500' : 'text-amber-500'}`} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{cert.name}</p>
                        <Badge variant="outline" className="text-xs">{cert.tier}</Badge>
                      </div>
                      {cert.status === 'earned' && (
                        <p className="text-xs text-muted-foreground mt-1">Issued {cert.date} · {cert.id}</p>
                      )}
                      {cert.status === 'in-progress' && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Progress</span><span>{cert.progress}%</span></div>
                          <Progress value={cert.progress} className="h-1.5" />
                        </div>
                      )}
                      {cert.status === 'locked' && (
                        <p className="text-xs text-muted-foreground mt-1">{cert.prereq}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {cert.status === 'earned' && (
                      <Button variant="outline" size="sm" className="text-xs flex-1">Download</Button>
                    )}
                    {cert.status === 'in-progress' && (
                      <Button size="sm" className="gradient-brand text-white text-xs flex-1">Continue</Button>
                    )}
                    {cert.status === 'locked' && (
                      <Button variant="outline" size="sm" disabled className="text-xs flex-1 opacity-50">Locked</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 7: Leaderboard */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section 7 — Leaderboard</p>
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Top Learners</CardTitle>
                <Badge variant="secondary">This Week</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { rank: 1, name: 'Priya S.', xp: 3420, level: 12, you: false },
                { rank: 2, name: 'Arjun M.', xp: 2980, level: 10, you: false },
                { rank: 3, name: 'You', xp: 2450, level: 7, you: true },
                { rank: 4, name: 'Kavya R.', xp: 2100, level: 8, you: false },
              ].map((u) => (
                <div key={u.rank} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${u.you ? 'bg-primary/8 border border-primary/15' : 'hover:bg-muted/50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${u.rank === 1 ? 'bg-amber-100 text-amber-700' : u.rank === 2 ? 'bg-slate-100 text-slate-600' : u.rank === 3 && u.you ? 'gradient-brand text-white' : 'bg-muted text-muted-foreground'}`}>
                    {u.rank}
                  </div>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs gradient-brand text-white">{u.name.slice(0,2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${u.you ? 'text-primary' : ''}`}>{u.name} {u.you && <span className="text-xs font-normal text-muted-foreground">(you)</span>}</p>
                    <p className="text-xs text-muted-foreground">Level {u.level}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold tabular-nums">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    {u.xp.toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* SECTION 8: Buttons & Badges palette */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section 8 — Components Palette</p>
          <Card className="card-elevated">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground mb-3 font-medium">Buttons</p>
                <div className="flex flex-wrap gap-3">
                  <Button className="gradient-brand text-white">Primary</Button>
                  <Button variant="outline">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">Reward</Button>
                  <Button variant="outline" className="text-rose-500 border-rose-200 hover:bg-rose-50">Danger</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-3 font-medium">Badges</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="gradient-brand text-white border-0">Enrolled</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge className="gradient-success text-white border-0">Completed</Badge>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">+500 XP</Badge>
                  <Badge variant="outline" className="border-rose-200 text-rose-600">Locked</Badge>
                  <Badge variant="outline" className="border-indigo-200 text-indigo-600">Level 7</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-3 font-medium">Progress Bars</p>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Course Progress</span><span>75%</span></div><Progress value={75} className="h-2" /></div>
                  <div><div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Level XP</span><span>62%</span></div><Progress value={62} className="h-3" /></div>
                  <div><div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Weekly Goal</span><span>40%</span></div><Progress value={40} className="h-1.5" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="pb-8 text-center text-xs text-muted-foreground">
          Dronacharya Theme Preview · द्रोणाचार्य · "AI that teaches like a Guru"
        </div>
      </div>
    </div>
  );
}
