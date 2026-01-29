'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Clock,
  BookOpen,
  Star,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
  expert: 'bg-red-100 text-red-700',
};

export default function LearningPathsContent() {
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);

  const { data: paths, isLoading } = trpc.learningPath.list.useQuery({
    difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert' | undefined,
  });

  const { data: featuredPaths } = trpc.learningPath.getFeatured.useQuery({ limit: 3 });

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Route className="h-8 w-8" />
              Learning Paths
            </h1>
            <p className="text-muted-foreground mt-1">
              Structured journeys to master new skills and advance your career
            </p>
          </div>

          <Select value={difficulty || 'all'} onValueChange={(v: string) => setDifficulty(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Featured Paths */}
        {featuredPaths && featuredPaths.length > 0 && !difficulty && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Featured Paths
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredPaths.map((path) => (
                <Link key={path.id} href={`/paths/${path.slug}`}>
                  <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={DIFFICULTY_COLORS[path.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                          {path.difficulty}
                        </Badge>
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {path.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {path.shortDescription || path.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {path.courses?.length || 0} courses
                        </span>
                        {path.estimatedHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {path.estimatedHours}h
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Paths */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {difficulty ? `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Paths` : 'All Learning Paths'}
          </h2>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-20 mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : paths && paths.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paths.map((path) => (
                <Link key={path.id} href={`/paths/${path.slug}`}>
                  <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={DIFFICULTY_COLORS[path.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                          {path.difficulty}
                        </Badge>
                        {path.isFeatured && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {path.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {path.shortDescription || path.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {path.courseCount} courses
                          </span>
                          {path.estimatedHours && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {path.estimatedHours}h
                            </span>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No learning paths found</h3>
                <p className="text-muted-foreground text-center">
                  {difficulty
                    ? `No ${difficulty} paths available yet. Try a different level.`
                    : 'Learning paths will appear here once they are published.'}
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
