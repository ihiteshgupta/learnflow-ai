'use client';

import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  BookOpen,
  Route,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  UserPlus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  const { data: activity, isLoading: activityLoading } = trpc.admin.getRecentActivity.useQuery({ limit: 5 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <UserPlus className="h-3 w-3" />
                  +{stats?.newUsersThisWeek} this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalCourses?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  published courses
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Paths</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalPaths?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  curated paths
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalCertifications?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  issued certificates
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Enrollment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Active Enrollments</p>
                      <p className="text-sm text-muted-foreground">Currently in progress</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{stats?.activeEnrollments?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">Completed Enrollments</p>
                      <p className="text-sm text-muted-foreground">Successfully finished</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{stats?.completedEnrollments?.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest course completions</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((item: typeof activity[number], index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.user?.avatarUrl || undefined} />
                      <AvatarFallback>
                        {item.user?.name?.charAt(0) || item.user?.email?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {item.user?.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        Completed {item.course?.name}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
