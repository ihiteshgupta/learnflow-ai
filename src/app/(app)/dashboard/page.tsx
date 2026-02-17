'use client';

import { trpc } from '@/lib/trpc/client';
import { useOnboardingStore } from '@/stores/onboarding-store';
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
    <>
      <OnboardingWizard open={!onboardingComplete} />

      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back
              {profile && (
                <span className="gradient-text animate-shimmer">, Learner!</span>
              )}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Continue your learning journey and level up your skills
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
            {profile && (
              <>
                <XPDisplay xp={profile.totalXp || 0} />
                <StreakDisplay streak={profile.currentStreak || 0} />
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Level</CardTitle>
              <div className="p-1.5 sm:p-2 rounded-lg gradient-brand">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="text-2xl sm:text-3xl font-bold">{profile?.level || 1}</div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-brand transition-all duration-500"
                    style={{ width: `${profile?.levelProgress?.percentage || 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {profile?.levelProgress?.percentage || 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total XP</CardTitle>
              <div className="p-1.5 sm:p-2 rounded-lg gradient-xp">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="text-2xl sm:text-3xl font-bold tabular-nums">{(profile?.totalXp || 0).toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald shrink-0" />
                <span className="text-xs text-emerald font-medium tabular-nums">
                  +{(profile?.weeklyXP || 0).toLocaleString()}<span className="hidden sm:inline"> this week</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Streak</CardTitle>
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-rose to-rose-600">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="text-2xl sm:text-3xl font-bold tabular-nums">{profile?.currentStreak || 0} <span className="text-base sm:text-lg font-normal text-muted-foreground">days</span></div>
              <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                Longest: {profile?.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Badges</CardTitle>
              <div className="p-1.5 sm:p-2 rounded-lg gradient-success">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="text-2xl sm:text-3xl font-bold tabular-nums">
                {achievements?.filter((a) => a.earned).length || 0}
                <span className="text-base sm:text-lg font-normal text-muted-foreground">
                  {' / '}{achievements?.length || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        {profile && (
          <Card className="border shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 gradient-brand shadow-sm" />
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
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Explore Domains</h2>
            <Button variant="ghost" className="text-primary text-sm sm:text-base">
              <span className="hidden sm:inline">View all</span>
              <span className="sm:hidden">All</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {domainsLoading ? (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {domains?.map((domain) => (
                <Card
                  key={domain.id}
                  className="card-hover cursor-pointer group border shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 hover:border-primary/20"
                >
                  <CardHeader className="px-4 sm:px-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={cn(
                          'p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br text-white shadow-lg shrink-0',
                          'transition-transform duration-300 group-hover:scale-110',
                          domainColors[domain.slug] || 'from-primary to-cyan'
                        )}>
                          {domainIcons[domain.slug] || <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                            {domain.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-1 text-xs sm:text-sm">
                            {domain.description}
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Multiple tracks</span>
                      </div>
                      <Button className="btn-shine gradient-brand text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
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
                    'card-hover border shadow-sm hover:shadow-md relative overflow-hidden transition-all duration-300',
                    !achievement.earned && 'opacity-60 grayscale hover:opacity-75'
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
    </>
  );
}
