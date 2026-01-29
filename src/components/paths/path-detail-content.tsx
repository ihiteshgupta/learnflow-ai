'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Route,
  Clock,
  BookOpen,
  Star,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Target,
  Users,
  Loader2,
} from 'lucide-react';

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
  expert: 'bg-red-100 text-red-700',
};

export default function LearningPathDetailContent() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: path, isLoading } = trpc.learningPath.get.useQuery({ slug });
  const { data: progressData } = trpc.learningPath.getProgress.useQuery(
    { pathId: path?.id! },
    { enabled: !!path?.id }
  );

  const enrollMutation = trpc.learningPath.enroll.useMutation({
    onSuccess: () => {
      toast({
        title: 'Enrolled!',
        description: 'You have been enrolled in this learning path.',
      });
      utils.learningPath.getProgress.invalidate({ pathId: path?.id });
      utils.learningPath.getMyPaths.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const unenrollMutation = trpc.learningPath.unenroll.useMutation({
    onSuccess: () => {
      toast({
        title: 'Unenrolled',
        description: 'You have been removed from this learning path.',
      });
      utils.learningPath.getProgress.invalidate({ pathId: path?.id });
      utils.learningPath.getMyPaths.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isEnrolled = !!progressData?.enrollment;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!path) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Route className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Path Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This learning path doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/paths">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Paths
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back Link */}
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/paths">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Learning Paths
          </Link>
        </Button>

        {/* Header */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={DIFFICULTY_COLORS[path.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                {path.difficulty}
              </Badge>
              {path.isFeatured && (
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  Featured
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight">{path.name}</h1>

            {path.shortDescription && (
              <p className="text-lg text-muted-foreground">{path.shortDescription}</p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {path.courses?.length || 0} courses
              </span>
              {path.estimatedHours && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {path.estimatedHours} hours
                </span>
              )}
              {path.targetAudience && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {path.targetAudience}
                </span>
              )}
            </div>
          </div>

          {/* Enrollment Card */}
          <Card>
            <CardContent className="pt-6">
              {isEnrolled && progressData ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {progressData.summary.percentage}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {progressData.summary.completedCourses} of {progressData.summary.totalCourses} courses completed
                    </p>
                  </div>
                  <Progress value={progressData.summary.percentage} className="h-2" />
                  <Button className="w-full" asChild>
                    <Link href={`/paths/${slug}/learn`}>
                      <Play className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => unenrollMutation.mutate({ pathId: path.id })}
                    disabled={unenrollMutation.isPending}
                  >
                    {unenrollMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Unenroll
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <Route className="h-12 w-12 mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Start your journey with {path.courses?.length || 0} structured courses
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => enrollMutation.mutate({ pathId: path.id })}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enroll Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {path.description && (
          <Card>
            <CardHeader>
              <CardTitle>About This Path</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{path.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Outcomes */}
        {path.outcomes && path.outcomes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                What You&apos;ll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 md:grid-cols-2">
                {path.outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Prerequisites */}
        {path.prerequisites && path.prerequisites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {path.prerequisites.map((prereq, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Course List */}
        <Card>
          <CardHeader>
            <CardTitle>Course Curriculum</CardTitle>
            <CardDescription>
              {path.courses?.length || 0} courses in this learning path
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {path.courses?.map((lpc, index) => {
                const courseProgress = progressData?.courses?.find(c => c.courseId === lpc.courseId);
                const isCompleted = courseProgress?.isCompleted;
                const isUnlocked = courseProgress?.isUnlocked ?? true;

                return (
                  <div
                    key={lpc.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-200'
                        : isUnlocked
                        ? 'hover:bg-muted transition-colors'
                        : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted font-semibold">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : isUnlocked ? (
                        index + 1
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{lpc.course.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {lpc.course.modules?.length || 0} modules
                        {lpc.isOptional && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Optional
                          </Badge>
                        )}
                      </p>
                    </div>
                    {isEnrolled && isUnlocked && !isCompleted && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/courses/${lpc.courseId}`}>
                          Start
                        </Link>
                      </Button>
                    )}
                    {isCompleted && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                        Completed
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {path.tags && path.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {path.tags.map((tag, i) => (
              <Badge key={i} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
