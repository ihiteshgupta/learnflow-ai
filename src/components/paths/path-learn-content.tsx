'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Route,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  Code,
  Loader2,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LESSON_TYPE_ICONS = {
  video: Video,
  article: FileText,
  exercise: Code,
  quiz: FileText,
};

export default function PathLearnContent() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const { data: path, isLoading: pathLoading } = trpc.learningPath.get.useQuery({ slug });
  const { data: progressData, isLoading: progressLoading } = trpc.learningPath.getProgress.useQuery(
    { pathId: path?.id! },
    { enabled: !!path?.id }
  );

  // Get the current course to show lessons
  const { data: currentCourse, isLoading: courseLoading } = trpc.course.getCourse.useQuery(
    { courseId: expandedCourseId! },
    { enabled: !!expandedCourseId }
  );

  // Get the selected lesson
  const { data: lessonData, isLoading: lessonLoading } = trpc.course.getLesson.useQuery(
    { lessonId: selectedLesson! },
    { enabled: !!selectedLesson }
  );

  const completeLesson = trpc.course.completeLesson.useMutation({
    onSuccess: (data) => {
      if (!data.alreadyCompleted) {
        toast({ title: 'Lesson completed!', description: 'Great progress!' });
      }
      utils.learningPath.getProgress.invalidate({ pathId: path?.id });
      utils.course.getCourse.invalidate({ courseId: expandedCourseId! });
      utils.course.getLesson.invalidate({ lessonId: selectedLesson! });
      utils.gamification.getProfile.invalidate();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Auto-expand first incomplete course on load
  useEffect(() => {
    if (progressData && !expandedCourseId) {
      const firstIncomplete = progressData.courses.find(c => !c.isCompleted && c.isUnlocked);
      if (firstIncomplete) {
        setExpandedCourseId(firstIncomplete.courseId);
      } else if (progressData.courses.length > 0) {
        setExpandedCourseId(progressData.courses[0].courseId);
      }
    }
  }, [progressData, expandedCourseId]);

  const isLoading = pathLoading || progressLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!path || !progressData?.enrollment) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Route className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Not Enrolled</h2>
          <p className="text-muted-foreground mb-4">
            You need to enroll in this path to start learning.
          </p>
          <Button asChild>
            <Link href={`/paths/${slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              View Path Details
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);
  };

  const handleMarkComplete = () => {
    if (!lessonData) return;
    completeLesson.mutate({ lessonId: lessonData.lesson.id });
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/paths/${slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{path.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{progressData.summary.completedCourses}/{progressData.summary.totalCourses} courses</span>
                <span>•</span>
                <span>{progressData.summary.percentage}% complete</span>
              </div>
            </div>
          </div>
          <Progress value={progressData.summary.percentage} className="w-32 h-2" />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar - Course/Lesson Navigation */}
          <Card className="border-0 shadow-md h-fit lg:sticky lg:top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="p-4 pt-0 space-y-2">
                  {progressData.courses.map((courseItem, idx) => {
                    const isExpanded = expandedCourseId === courseItem.courseId;
                    const isCompleted = courseItem.isCompleted;
                    const isUnlocked = courseItem.isUnlocked;

                    return (
                      <div key={courseItem.id} className="space-y-1">
                        <button
                          onClick={() => {
                            if (isUnlocked) {
                              setExpandedCourseId(isExpanded ? null : courseItem.courseId);
                            }
                          }}
                          disabled={!isUnlocked}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                            isExpanded ? 'bg-primary/10' : 'hover:bg-muted',
                            !isUnlocked && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <div className={cn(
                            'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium shrink-0',
                            isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-muted'
                          )}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : !isUnlocked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm font-medium truncate',
                              isExpanded && 'text-primary'
                            )}>
                              {courseItem.course.name}
                            </p>
                          </div>
                          {isUnlocked && (
                            isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            )
                          )}
                        </button>

                        {/* Lessons */}
                        {isExpanded && currentCourse && !courseLoading && (
                          <div className="ml-11 space-y-1">
                            {currentCourse.modules.map((module) => (
                              <div key={module.id} className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                                  {module.name}
                                </p>
                                {module.lessons.map((lesson) => {
                                  const lessonProgress = currentCourse.progress.find(
                                    p => p.lessonId === lesson.id
                                  );
                                  const isLessonCompleted = lessonProgress?.status === 'completed';
                                  const isSelected = selectedLesson === lesson.id;
                                  const Icon = LESSON_TYPE_ICONS[lesson.type as keyof typeof LESSON_TYPE_ICONS] || FileText;

                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => handleLessonSelect(lesson.id)}
                                      className={cn(
                                        'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                                        isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                        isLessonCompleted && !isSelected && 'text-emerald-600'
                                      )}
                                    >
                                      {isLessonCompleted ? (
                                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                                      ) : (
                                        <Icon className="h-3 w-3 shrink-0" />
                                      )}
                                      <span className="truncate">{lesson.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                        {isExpanded && courseLoading && (
                          <div className="ml-11 space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="space-y-4">
            {!selectedLesson ? (
              <Card className="border-0 shadow-md">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Select a Lesson</h2>
                  <p className="text-muted-foreground text-center max-w-md">
                    Choose a lesson from the course curriculum on the left to start learning.
                  </p>
                </CardContent>
              </Card>
            ) : lessonLoading ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-8 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ) : lessonData ? (
              <>
                {/* Lesson Header */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2 capitalize">
                          {lessonData.lesson.type}
                        </Badge>
                        <CardTitle>{lessonData.lesson.contentJson?.title || lessonData.lesson.name}</CardTitle>
                        {lessonData.lesson.contentJson?.objectives && (
                          <CardDescription className="mt-2">
                            {lessonData.lesson.contentJson.objectives.join(' • ')}
                          </CardDescription>
                        )}
                      </div>
                      {lessonData.lesson.estimatedMinutes && (
                        <Badge variant="outline">
                          ~{lessonData.lesson.estimatedMinutes} min
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Lesson Content */}
                    <div className="prose prose-sm max-w-none">
                      {lessonData.lesson.contentJson?.steps && lessonData.lesson.contentJson.steps.length > 0 ? (
                        <div className="space-y-4">
                          {lessonData.lesson.contentJson.steps.map((step, idx) => (
                            <div key={step.id || idx} className="bg-muted/50 rounded-lg p-4">
                              <p className="whitespace-pre-wrap">{step.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-muted/50 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-2" />
                            <p>Content for this lesson will appear here.</p>
                            <p className="text-sm mt-1">Complete this lesson to track your progress.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Completion Button */}
                    <div className="mt-6 flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {lessonData.progress?.status === 'completed' ? (
                          <span className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Lesson completed
                          </span>
                        ) : (
                          <span>Mark as complete when you&apos;re done</span>
                        )}
                      </div>
                      <Button
                        onClick={handleMarkComplete}
                        disabled={
                          lessonData.progress?.status === 'completed' ||
                          completeLesson.isPending
                        }
                        className={cn(
                          lessonData.progress?.status === 'completed'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'gradient-brand'
                        )}
                      >
                        {completeLesson.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : lessonData.progress?.status === 'completed' ? (
                          <>
                            <Trophy className="mr-2 h-4 w-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Complete
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
