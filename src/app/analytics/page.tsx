'use client';

import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Clock,
  Target,
  Zap,
  Calendar,
  BookOpen,
  Brain,
} from 'lucide-react';

// Mock data for analytics
const weeklyActivity = [
  { day: 'Mon', minutes: 45, xp: 120 },
  { day: 'Tue', minutes: 30, xp: 85 },
  { day: 'Wed', minutes: 60, xp: 150 },
  { day: 'Thu', minutes: 25, xp: 60 },
  { day: 'Fri', minutes: 50, xp: 130 },
  { day: 'Sat', minutes: 90, xp: 220 },
  { day: 'Sun', minutes: 40, xp: 100 },
];

export default function AnalyticsPage() {
  const { data: profile } = trpc.gamification.getProfile.useQuery();

  const totalWeeklyMinutes = weeklyActivity.reduce((sum, d) => sum + d.minutes, 0);
  const totalWeeklyXP = weeklyActivity.reduce((sum, d) => sum + d.xp, 0);
  const avgDailyMinutes = Math.round(totalWeeklyMinutes / 7);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track your learning progress and statistics
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(totalWeeklyMinutes / 60)}h {totalWeeklyMinutes % 60}m
              </div>
              <p className="text-xs text-emerald flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +15% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                XP Earned
              </CardTitle>
              <Zap className="h-4 w-4 text-amber" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWeeklyXP.toLocaleString()}</div>
              <p className="text-xs text-emerald flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +22% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Daily Average
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDailyMinutes} min</div>
              <p className="text-xs text-muted-foreground mt-1">
                Goal: 30 min/day
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lessons Completed
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Your learning activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Simple bar chart using divs */}
            <div className="flex items-end justify-between gap-2 h-48 pt-4">
              {weeklyActivity.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{day.xp} XP</span>
                    <div
                      className="w-full gradient-brand rounded-t-md transition-all duration-500"
                      style={{ height: `${(day.minutes / 90) * 100}%`, minHeight: '8px' }}
                    />
                  </div>
                  <span className="text-xs font-medium">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Learning Streak */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-rose" />
                    Learning Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current Streak</span>
                      <span className="text-2xl font-bold text-rose">
                        {profile?.currentStreak || 0} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Longest Streak</span>
                      <span className="font-semibold">{profile?.longestStreak || 0} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Active Days</span>
                      <span className="font-semibold">42 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Style */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-violet" />
                    Learning Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Best Learning Time</span>
                      <span className="font-semibold">Evening (6-9 PM)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Preferred Content</span>
                      <span className="font-semibold">Interactive Coding</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Avg. Session Length</span>
                      <span className="font-semibold">35 minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground py-8">
                  Course analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground py-8">
                  Skills analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
