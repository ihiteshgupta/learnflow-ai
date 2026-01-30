'use client';

import { trpc } from '@/lib/trpc/client';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { MainLayout } from '@/components/layout';
import { OnboardingWizard } from '@/components/onboarding';
import { XPDisplay, StreakDisplay, LevelProgress } from '@/components/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Brain,
  Code,
  ChevronRight,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { isComplete: onboardingComplete } = useOnboardingStore();
  const { data: domains, isLoading: domainsLoading } = trpc.course.getDomains.useQuery();
  const { data: profile } = trpc.gamification.getProfile.useQuery();
  const { data: achievements } = trpc.gamification.getAchievements.useQuery();

  const domainIcons: Record<string, React.ReactNode> = {
    python: <Code className="h-6 w-6" />,
    'data-science': <Brain className="h-6 w-6" />,
    'machine-learning': <Zap className="h-6 w-6" />,
  };

  const domainColors: Record<string, string> = {
    python: 'from-emerald-500 to-cyan-500',
    'data-science': 'from-violet-500 to-purple-500',
    'machine-learning': 'from-amber-500 to-rose-500',
  };

  return (
    <MainLayout>
      {/* Onboarding wizard for new users */}
      <OnboardingWizard open={!onboardingComplete} />

      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back
              {profile && (
                <span className="gradient-text">, Learner!</span>
              )}
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey and level up your skills
            </p>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <>
                <XPDisplay xp={profile.totalXp || 0} />
                <StreakDisplay streak={profile.currentStreak || 0} />
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Level</CardTitle>
              <div className="p-2 rounded-lg gradient-brand">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile?.level || 1}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-brand transition-all duration-500"
                    style={{ width: `${profile?.levelProgress?.percentage || 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {profile?.levelProgress?.percentage || 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total XP</CardTitle>
              <div className="p-2 rounded-lg bg-amber/20">
                <Zap className="h-4 w-4 text-amber" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(profile?.totalXp || 0).toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald" />
                <span className="text-xs text-emerald font-medium">+250 this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
              <div className="p-2 rounded-lg bg-rose/20">
                <Target className="h-4 w-4 text-rose" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile?.currentStreak || 0} <span className="text-lg font-normal text-muted-foreground">days</span></div>
              <p className="text-xs text-muted-foreground mt-1">
                Longest: {profile?.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Achievements</CardTitle>
              <div className="p-2 rounded-lg bg-cyan/20">
                <Trophy className="h-4 w-4 text-cyan" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {achievements?.filter((a) => a.earned).length || 0}
                <span className="text-lg font-normal text-muted-foreground">
                  {' / '}{achievements?.length || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        {profile && (
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-brand" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Level Progress</CardTitle>
              </div>
              <CardDescription>
                Keep learning to reach Level {(profile.level || 1) + 1}!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LevelProgress
                level={profile.level || 1}
                currentXP={profile.levelProgress?.current || 0}
                requiredXP={profile.levelProgress?.required || 100}
              />
            </CardContent>
          </Card>
        )}

        {/* Learning Domains */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Explore Domains</h2>
            <Button variant="ghost" className="text-primary">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {domainsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse border-0 shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-muted" />
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-muted rounded" />
                        <div className="h-4 w-48 bg-muted rounded" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {domains?.map((domain) => (
                <Card
                  key={domain.id}
                  className="card-hover cursor-pointer group border-0 shadow-md overflow-hidden"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-3 rounded-xl bg-gradient-to-br text-white shadow-lg',
                          'transition-transform duration-300 group-hover:scale-110',
                          domainColors[domain.slug] || 'from-primary to-cyan'
                        )}>
                          {domainIcons[domain.slug] || <BookOpen className="h-6 w-6" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {domain.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-1">
                            {domain.description}
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>20+ hours</span>
                      </div>
                      <Button className="btn-shine gradient-brand text-white border-0">
                        Start Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Achievements Preview */}
        {achievements && achievements.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Recent Achievements</h2>
              <Button variant="ghost" className="text-primary">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {achievements.slice(0, 4).map((achievement) => (
                <Card
                  key={achievement.id}
                  className={cn(
                    'card-hover border-0 shadow-md relative overflow-hidden',
                    !achievement.earned && 'opacity-60 grayscale'
                  )}
                >
                  {achievement.earned && (
                    <div className="absolute top-0 left-0 right-0 h-1 gradient-success" />
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2.5 rounded-xl',
                        achievement.earned
                          ? 'bg-amber/20 text-amber'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        <Trophy className={cn(
                          'h-5 w-5',
                          achievement.earned && 'animate-float'
                        )} />
                      </div>
                      <CardTitle className="text-sm">{achievement.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
                    <Badge
                      variant={achievement.earned ? 'default' : 'outline'}
                      className={cn(
                        achievement.earned && 'gradient-success text-white border-0'
                      )}
                    >
                      {achievement.earned ? 'Earned' : `+${achievement.xpReward} XP`}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
