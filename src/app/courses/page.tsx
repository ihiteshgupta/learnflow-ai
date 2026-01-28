'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Brain,
  Code,
  Search,
  Clock,
  Users,
  Play,
  Filter,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const domainIcons: Record<string, React.ReactNode> = {
  python: <Code className="h-5 w-5" />,
  'data-science': <Brain className="h-5 w-5" />,
  'machine-learning': <Zap className="h-5 w-5" />,
};

const domainColors: Record<string, string> = {
  python: 'from-emerald-500 to-cyan-500',
  'data-science': 'from-violet-500 to-purple-500',
  'machine-learning': 'from-amber-500 to-rose-500',
};

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const { data: domains, isLoading: domainsLoading } = trpc.course.getDomains.useQuery();
  const { data: tracks, isLoading: tracksLoading } = trpc.course.getTracks.useQuery(
    selectedDomain ? { domainId: selectedDomain } : undefined
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground">
              Explore learning tracks and start building your skills
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Domain Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" onClick={() => setSelectedDomain(null)}>
              All Domains
            </TabsTrigger>
            {domains?.map((domain) => (
              <TabsTrigger
                key={domain.id}
                value={domain.slug}
                onClick={() => setSelectedDomain(domain.id)}
                className="flex items-center gap-2"
              >
                {domainIcons[domain.slug] || <BookOpen className="h-4 w-4" />}
                {domain.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Domain Cards */}
            {!selectedDomain && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {domainsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse border-0 shadow-md">
                      <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-muted" />
                        <div className="h-5 w-32 bg-muted rounded mt-4" />
                        <div className="h-4 w-48 bg-muted rounded mt-2" />
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  domains?.map((domain) => (
                    <Card
                      key={domain.id}
                      className="card-hover cursor-pointer group border-0 shadow-md"
                      onClick={() => setSelectedDomain(domain.id)}
                    >
                      <CardHeader>
                        <div className={cn(
                          'p-3 rounded-xl bg-gradient-to-br text-white shadow-lg w-fit',
                          'transition-transform duration-300 group-hover:scale-110',
                          domainColors[domain.slug] || 'from-primary to-cyan'
                        )}>
                          {domainIcons[domain.slug] || <BookOpen className="h-6 w-6" />}
                        </div>
                        <CardTitle className="mt-4 group-hover:text-primary transition-colors">
                          {domain.name}
                        </CardTitle>
                        <CardDescription>{domain.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />5 tracks
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />40+ hours
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Tracks */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {selectedDomain ? 'Learning Tracks' : 'Popular Tracks'}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {tracksLoading ? (
                  [...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="h-6 w-48 bg-muted rounded mb-4" />
                        <div className="h-4 w-full bg-muted rounded mb-2" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  tracks?.map((track) => (
                    <Card key={track.id} className="card-hover border-0 shadow-md overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{track.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {track.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {track.difficulty}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {track.estimatedHours || 20}h
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {track.totalCourses} courses
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            1.2k enrolled
                          </span>
                        </div>

                        {/* Progress bar if enrolled */}
                        {track.enrollment && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">45%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full w-[45%] gradient-brand rounded-full" />
                            </div>
                          </div>
                        )}

                        <Button
                          className={cn(
                            'w-full',
                            track.enrollment
                              ? 'gradient-brand text-white'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          )}
                        >
                          {track.enrollment ? (
                            <>
                              <Play className="mr-2 h-4 w-4" /> Continue Learning
                            </>
                          ) : (
                            <>
                              <BookOpen className="mr-2 h-4 w-4" /> Start Track
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Individual domain tabs - show same content but filtered */}
          {domains?.map((domain) => (
            <TabsContent key={domain.id} value={domain.slug}>
              <div className="grid gap-4 md:grid-cols-2">
                {tracks?.map((track) => (
                  <Card key={track.id} className="card-hover border-0 shadow-md">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg">{track.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{track.description}</p>
                      <Button className="w-full mt-4 gradient-brand text-white">
                        Start Track
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
