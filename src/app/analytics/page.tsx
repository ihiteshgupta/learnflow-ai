'use client';

import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Target,
  Zap,
  Calendar,
  TrendingUp,
  Brain,
} from 'lucide-react';
import { PageHeader, StatCard } from '@/components/brand';

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
        <PageHeader
          title="Analytics"
          description="Track your learning progress and statistics"
        />

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="This Week" value={`${Math.floor(totalWeeklyMinutes / 60)}h ${totalWeeklyMinutes % 60}m`} icon={<Clock className="h-5 w-5" />} />
          <StatCard label="Weekly XP" value={totalWeeklyXP} icon={<Zap className="h-5 w-5" />} />
          <StatCard label="Daily Avg" value={`${avgDailyMinutes}m`} icon={<Target className="h-5 w-5" />} />
          <StatCard label="Current Streak" value={`${profile?.currentStreak || 0} days`} icon={<TrendingUp className="h-5 w-5" />} />
        </div>

        {/* Activity Chart */}
        <Card className="">
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
              <Card className="">
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
              <Card className="">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
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
            <Card className="">
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground py-8">
                  Course analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card className="">
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
