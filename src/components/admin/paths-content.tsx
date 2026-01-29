'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Route,
  Users,
  BookOpen,
  Eye,
  EyeOff,
  Star,
  MoreVertical,
  Edit,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
  expert: 'bg-red-100 text-red-700',
};

export default function AdminPathsContent() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [publishedFilter, setPublishedFilter] = useState<string | undefined>(undefined);

  const { data: paths, isLoading } = trpc.admin.listPaths.useQuery({
    published: publishedFilter === 'all' ? undefined : publishedFilter === 'published',
    limit: 50,
  });

  const togglePublishedMutation = trpc.admin.togglePathPublished.useMutation({
    onSuccess: (data) => {
      toast({
        title: data.isPublished ? 'Path published' : 'Path unpublished',
        description: `The learning path has been ${data.isPublished ? 'published' : 'unpublished'}.`,
      });
      utils.admin.listPaths.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleFeaturedMutation = trpc.admin.togglePathFeatured.useMutation({
    onSuccess: (data) => {
      toast({
        title: data.isFeatured ? 'Path featured' : 'Path unfeatured',
        description: `The learning path has been ${data.isFeatured ? 'added to' : 'removed from'} featured.`,
      });
      utils.admin.listPaths.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Paths</h1>
          <p className="text-muted-foreground">Manage curated learning paths</p>
        </div>
        <Button asChild>
          <Link href="/admin/paths/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Path
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={publishedFilter || 'all'} onValueChange={(v: string) => setPublishedFilter(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Paths</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Paths List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            All Learning Paths
          </CardTitle>
          <CardDescription>
            {paths?.length || 0} learning paths
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
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
          ) : paths && paths.length > 0 ? (
            <div className="space-y-2">
              {paths.map((path) => (
                <div
                  key={path.id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                    <Route className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{path.name}</p>
                      <Badge className={DIFFICULTY_COLORS[path.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                        {path.difficulty}
                      </Badge>
                      {path.isPublished ? (
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
                      {path.isFeatured && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {path.courseCount} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {path.enrollmentCount} enrolled
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Publish</span>
                      <Switch
                        checked={path.isPublished || false}
                        onCheckedChange={() => togglePublishedMutation.mutate({
                          pathId: path.id,
                          isPublished: !path.isPublished,
                        })}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/paths/${path.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Path
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => toggleFeaturedMutation.mutate({
                            pathId: path.id,
                            isFeatured: !path.isFeatured,
                          })}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          {path.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No learning paths found.</p>
              <Button asChild>
                <Link href="/admin/paths/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Path
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
