'use client';

import { useParams, useRouter } from 'next/navigation';
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
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Play,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  Code,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const LESSON_TYPE_ICONS = {
  video: Video,
  article: FileText,
  exercise: Code,
  quiz: FileText,
  concept: FileText,
  code: Code,
  visualization: FileText,
  challenge: Code,
};

export default function CourseDetailContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { toast } = useToast();

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: course, isLoading } = trpc.course.getCourse.useQuery({ courseId });

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleStartLesson = (lessonId: string) => {
    // Navigate to the lesson within the course context
    router.push(`/lesson/${lessonId}`);
  };

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

  if (!course) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This course doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  );
  const completedLessons = course.progress.filter(
    p => p.status === 'completed'
  ).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Courses
          </Link>
        </Button>

        {/* Course Header */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              {course.track && (
                <Badge variant="outline">{course.track.name}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
            {course.description && (
              <p className="text-lg text-muted-foreground">{course.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.modules.length} modules
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {totalLessons} lessons
              </span>
              {course.estimatedMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.round(course.estimatedMinutes / 60)}h estimated
                </span>
              )}
            </div>
          </div>

          {/* Progress Card */}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {course.completionPercentage}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>
                <Progress value={course.completionPercentage} className="h-2" />
                {completedLessons < totalLessons ? (
                  <Button
                    className="w-full gradient-brand text-white"
                    onClick={() => {
                      // Find first incomplete lesson
                      for (const mod of course.modules) {
                        for (const lesson of mod.lessons) {
                          const prog = course.progress.find(p => p.lessonId === lesson.id);
                          if (!prog || prog.status !== 'completed') {
                            handleStartLesson(lesson.id);
                            return;
                          }
                        }
                      }
                    }}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {completedLessons > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                ) : (
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Course Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Modules */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              {course.modules.length} modules • {totalLessons} lessons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {course.modules.map((module, moduleIdx) => {
                const isExpanded = expandedModules.has(module.id);
                const moduleLessons = module.lessons;
                const moduleCompletedCount = moduleLessons.filter(l => {
                  const prog = course.progress.find(p => p.lessonId === l.id);
                  return prog?.status === 'completed';
                }).length;
                const isModuleComplete = moduleCompletedCount === moduleLessons.length;

                return (
                  <div key={module.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 text-left transition-colors',
                        isExpanded ? 'bg-muted' : 'hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium shrink-0',
                        isModuleComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'
                      )}>
                        {isModuleComplete ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          moduleIdx + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{module.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {moduleCompletedCount}/{moduleLessons.length} lessons completed
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t bg-background">
                        {moduleLessons.map((lesson) => {
                          const lessonProg = course.progress.find(p => p.lessonId === lesson.id);
                          const isComplete = lessonProg?.status === 'completed';
                          const Icon = LESSON_TYPE_ICONS[lesson.type as keyof typeof LESSON_TYPE_ICONS] || FileText;

                          return (
                            <div
                              key={lesson.id}
                              className={cn(
                                'flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors',
                                isComplete && 'bg-emerald-50/50'
                              )}
                            >
                              <div className={cn(
                                'flex items-center justify-center h-8 w-8 rounded-full shrink-0',
                                isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-muted'
                              )}>
                                {isComplete ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <Icon className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  'font-medium text-sm',
                                  isComplete && 'text-emerald-700'
                                )}>
                                  {lesson.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {lesson.type}
                                  </Badge>
                                  {lesson.estimatedMinutes && (
                                    <span>{lesson.estimatedMinutes} min</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={isComplete ? 'outline' : 'default'}
                                onClick={() => handleStartLesson(lesson.id)}
                              >
                                {isComplete ? 'Review' : 'Start'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
