'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/brand';
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
  python: 'bg-forest/20 text-forest',
  'data-science': 'bg-primary/15 text-primary',
  'machine-learning': 'bg-gold/20 text-gold',
};

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const { data: domains, isLoading: domainsLoading } = trpc.course.getDomains.useQuery();
  const { data: tracks, isLoading: tracksLoading } = trpc.course.getTracks.useQuery(
    selectedDomain ? { domainId: selectedDomain } : undefined
  );

  const filteredDomains = domains?.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTracks = tracks?.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <PageHeader
          title="Course Catalog"
          description="Master Python, Data Science, and AI/ML with structured learning paths"
        />
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Domain Tabs */}
        <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full sm:w-auto overflow-x-auto flex-nowrap">
            <TabsTrigger value="all" onClick={() => setSelectedDomain(null)} className="text-xs sm:text-sm">
              All Domains
            </TabsTrigger>
            {domains?.map((domain) => (
              <TabsTrigger
                key={domain.id}
                value={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">{domainIcons[domain.slug] || <BookOpen className="h-4 w-4" />}</span>
                {domain.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4 sm:space-y-6">
            {/* Domain Cards */}
            {!selectedDomain && (
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {domainsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse ">
                      <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-muted" />
                        <div className="h-5 w-32 bg-muted rounded mt-4" />
                        <div className="h-4 w-48 bg-muted rounded mt-2" />
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  filteredDomains?.map((domain) => (
                    <button
                      key={domain.id}
                      className="w-full text-left"
                      onClick={() => setSelectedDomain(domain.id)}
                    >
                      <Card className="card-hover group h-full">
                        <CardHeader>
                          <div className={cn(
                            'p-3 rounded-xl w-fit transition-transform duration-300 group-hover:scale-110',
                            domainColors[domain.slug] || 'bg-primary/15 text-primary'
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
                              <BookOpen className="h-4 w-4" />
                              {tracks?.filter(t => t.domain?.id === domain.id).length ?? 0} tracks
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Tracks */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                {selectedDomain ? 'Learning Tracks' : 'Popular Tracks'}
              </h2>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {tracksLoading ? (
                  [...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse ">
                      <CardContent className="p-6">
                        <div className="h-6 w-48 bg-muted rounded mb-4" />
                        <div className="h-4 w-full bg-muted rounded mb-2" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredTracks?.map((track) => (
                    <Card key={track.id} className="card-hover overflow-hidden">
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
                          {track.enrollment && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Enrolled
                            </span>
                          )}
                        </div>

                        {/* Progress bar if enrolled */}
                        {track.enrollment && track.totalCourses > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                {track.totalCourses} courses &middot; {track.totalModules} modules
                              </span>
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
            <TabsContent key={domain.id} value={domain.id}>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTracks?.map((track) => (
                  <Card key={track.id} className="card-hover ">
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
