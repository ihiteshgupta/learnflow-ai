'use client';

import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  Clock,
  Target,
  Zap,
  Calendar,
  BookOpen,
  Brain,
  Flame,
  Trophy,
  CheckCircle2,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { data: profile } = trpc.gamification.getProfile.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.analytics.getPersonalStats.useQuery();
  const { data: timeline, isLoading: timelineLoading } = trpc.analytics.getLearningTimeline.useQuery({ days: 7 });
  const { data: courseProgress } = trpc.analytics.getCourseProgress.useQuery();
  const { data: skillProgress } = trpc.analytics.getSkillProgress.useQuery();

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
                Total XP
              </CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalXp?.toLocaleString() ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Level {stats?.level ?? 1}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.currentStreak ?? 0} days</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best: {stats?.longestStreak ?? 0} days
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lessons Done
              </CardTitle>
              <BookOpen className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.completedLessons ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.completedCourses ?? 0} courses completed
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.completionRate ?? 0}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.coursesInProgress ?? 0} in progress
                  </p>
                </>
              )}
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
            {timelineLoading ? (
              <div className="flex items-end justify-between gap-2 h-48 pt-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} className="flex-1 h-full" />
                ))}
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2 h-48 pt-4">
                {timeline?.timeline.slice(-7).map((day) => {
                  const maxXp = Math.max(...(timeline?.timeline.map(d => d.xp) ?? [1]), 1);
                  const height = day.xp > 0 ? Math.max((day.xp / maxXp) * 100, 10) : 5;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">{day.xp} XP</span>
                        <div
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            day.xp > 0 ? 'gradient-brand' : 'bg-muted'
                          }`}
                          style={{ height: `${height}%`, minHeight: '8px' }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {timeline && (
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{timeline.summary.totalXp}</p>
                  <p className="text-xs text-muted-foreground">XP This Week</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-500">{timeline.summary.totalLessons}</p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">{timeline.summary.activeDays}</p>
                  <p className="text-xs text-muted-foreground">Active Days</p>
                </div>
              </div>
            )}
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
                    <Calendar className="h-5 w-5 text-rose-500" />
                    Learning Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current Streak</span>
                      <span className="text-2xl font-bold text-rose-500">
                        {profile?.currentStreak || stats?.currentStreak || 0} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Longest Streak</span>
                      <span className="font-semibold">{profile?.longestStreak || stats?.longestStreak || 0} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total XP Earned</span>
                      <span className="font-semibold">{stats?.totalXpEarned?.toLocaleString() ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Style */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-violet-500" />
                    Learning Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Enrolled Tracks</span>
                      <span className="font-semibold">{stats?.enrolledTracks ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Courses In Progress</span>
                      <span className="font-semibold">{stats?.coursesInProgress ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Courses Completed</span>
                      <span className="font-semibold text-emerald-500">{stats?.completedCourses ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Progress
                </CardTitle>
                <CardDescription>Your progress across enrolled courses</CardDescription>
              </CardHeader>
              <CardContent>
                {courseProgress && courseProgress.length > 0 ? (
                  <div className="space-y-4">
                    {courseProgress.map((course) => (
                      <div key={course.courseId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {course.isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{course.courseName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No courses in progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Skills Progress
                </CardTitle>
                <CardDescription>Your progress by track/skill area</CardDescription>
              </CardHeader>
              <CardContent>
                {skillProgress && Object.keys(skillProgress.skills).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(skillProgress.skills).map(([trackName, data]) => (
                      <div key={trackName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{trackName}</span>
                          <span className="text-sm text-muted-foreground">
                            {data.completed}/{data.total} completed
                          </span>
                        </div>
                        <Progress
                          value={data.total > 0 ? (data.completed / data.total) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No skills data yet</p>
                    <p className="text-sm text-muted-foreground">Enroll in tracks to see your skill progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
