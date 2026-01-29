'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Users,
  Layers,
  Eye,
  EyeOff,
  MoreVertical,
  Edit,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function AdminCoursesContent() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [publishedFilter, setPublishedFilter] = useState<string | undefined>(undefined);

  const { data: courses, isLoading } = trpc.admin.listCourses.useQuery({
    published: publishedFilter === 'all' ? undefined : publishedFilter === 'published',
    limit: 50,
  });

  const togglePublishedMutation = trpc.admin.toggleCoursePublished.useMutation({
    onSuccess: (data) => {
      toast({
        title: data.isPublished ? 'Course published' : 'Course unpublished',
        description: `The course has been ${data.isPublished ? 'published' : 'unpublished'}.`,
      });
      utils.admin.listCourses.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleTogglePublished = (courseId: string, currentState: boolean) => {
    togglePublishedMutation.mutate({
      courseId,
      isPublished: !currentState,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage courses and content</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={publishedFilter || 'all'} onValueChange={(v: string) => setPublishedFilter(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Courses
          </CardTitle>
          <CardDescription>
            {courses?.length || 0} courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{course.name}</p>
                      {course.isPublished ? (
                        <Badge variant="default" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <EyeOff className="h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {course.moduleCount} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrollmentCount} enrolled
                      </span>
                      {course.track && (
                        <span className="text-xs">
                          Track: {course.track.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <Switch
                        checked={course.isPublished || false}
                        onCheckedChange={() => handleTogglePublished(course.id, course.isPublished || false)}
                        disabled={togglePublishedMutation.isPending}
                      />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Layers className="mr-2 h-4 w-4" />
                          Manage Modules
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
