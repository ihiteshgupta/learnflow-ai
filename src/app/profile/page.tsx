'use client';

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Trophy,
  Flame,
  Zap,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  Target,
  Settings,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: profile, isLoading: profileLoading } = trpc.gamification.getProfile.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.analytics.getPersonalStats.useQuery();
  const { data: achievements, isLoading: achievementsLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: courseProgress, isLoading: progressLoading } = trpc.analytics.getCourseProgress.useQuery();

  const isLoading = profileLoading || statsLoading;

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const earnedAchievements = achievements?.filter(a => a.earned) ?? [];
  const completedCourses = courseProgress?.filter(c => c.isCompleted) ?? [];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-32 gradient-brand" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? 'User'} />
                <AvatarFallback className="gradient-brand text-white text-3xl font-bold">
                  {getInitials(session?.user?.name ?? 'U')}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 md:pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{session?.user?.name ?? 'User'}</h1>
                    <p className="text-muted-foreground">{session?.user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="gap-1">
                        <Trophy className="h-3 w-3" />
                        Level {profile?.level ?? 1}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date().getFullYear()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                    <Link href="/settings">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total XP</CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{profile?.totalXp?.toLocaleString() ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.totalXpEarned?.toLocaleString() ?? 0} lifetime
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{profile?.currentStreak ?? 0} days</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best: {profile?.longestStreak ?? 0} days
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Courses Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.completedCourses ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.completedLessons ?? 0} lessons done
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Achievements</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{earnedAchievements.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievements?.length ?? 0} total available
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Level Progress</CardTitle>
            </div>
            <CardDescription>
              {profile?.levelProgress?.current ?? 0} / {profile?.levelProgress?.required ?? 100} XP to Level {(profile?.level ?? 1) + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={profile?.levelProgress?.percentage ?? 0} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Level {profile?.level ?? 1}</span>
              <span>{profile?.levelProgress?.percentage ?? 0}%</span>
              <span>Level {(profile?.level ?? 1) + 1}</span>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Achievements */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <CardTitle>Achievements</CardTitle>
                </div>
                <Link href="/achievements">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : earnedAchievements.length > 0 ? (
                <div className="space-y-3">
                  {earnedAchievements.slice(0, 5).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Trophy className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge className="gradient-brand text-white border-0">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No achievements earned yet</p>
                  <p className="text-sm text-muted-foreground">Complete courses to earn badges!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Courses */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <CardTitle>Completed Courses</CardTitle>
                </div>
                <Link href="/courses">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {progressLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : completedCourses.length > 0 ? (
                <div className="space-y-3">
                  {completedCourses.slice(0, 5).map((course) => (
                    <div
                      key={course.courseId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{course.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.totalLessons} lessons completed
                        </p>
                      </div>
                      {course.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(course.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No courses completed yet</p>
                  <p className="text-sm text-muted-foreground">Start learning to complete courses!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Learning Statistics */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Learning Statistics</CardTitle>
            </div>
            <CardDescription>Your overall learning progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-primary">{stats?.enrolledTracks ?? 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Tracks Enrolled</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-emerald-500">{stats?.completionRate ?? 0}%</div>
                <p className="text-sm text-muted-foreground mt-1">Completion Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-amber-500">{stats?.coursesInProgress ?? 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Courses In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
