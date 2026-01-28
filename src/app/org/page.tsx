'use client';

import { useOrg } from './layout';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Users2,
  BookOpen,
  TrendingUp,
  UserPlus,
  Plus,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

export default function OrgDashboard() {
  const { orgId, org } = useOrg();

  const { data: stats, isLoading } = trpc.organization.getStats.useQuery(
    { orgId: orgId! },
    { enabled: !!orgId }
  );

  if (!orgId || !org) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <p className="text-muted-foreground">Organization Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalMembers ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  across all roles
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalTeams ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  active teams
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.coursesEnrolled ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  total enrollments
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.completionRate ?? 0}%</div>
                <p className="text-xs text-muted-foreground">
                  average completion
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for managing your organization</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/org/members">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/org/teams">
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/org/settings">
              <Activity className="mr-2 h-4 w-4" />
              Organization Settings
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Role Distribution */}
      {stats?.roleDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>Member Roles</CardTitle>
            <CardDescription>Distribution of roles in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {Object.entries(stats.roleDistribution).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium capitalize">{role}s</span>
                  <span className="text-2xl font-bold">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
