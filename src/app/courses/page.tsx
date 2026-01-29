'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
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
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DIFFICULTY_LEVELS = ['all', 'beginner', 'intermediate', 'advanced', 'expert'] as const;
type Difficulty = typeof DIFFICULTY_LEVELS[number];

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
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [enrollingTrackId, setEnrollingTrackId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: domains, isLoading: domainsLoading } = trpc.course.getDomains.useQuery();
  const { data: tracks, isLoading: tracksLoading } = trpc.course.getTracks.useQuery(
    selectedDomain ? { domainId: selectedDomain } : undefined
  );

  const enrollMutation = trpc.course.enroll.useMutation({
    onSuccess: (_, variables) => {
      toast({ title: 'Enrolled!', description: 'You have been enrolled in this track.' });
      utils.course.getTracks.invalidate();
      // Find the track to get its slug for navigation
      const track = tracks?.find(t => t.id === variables.trackId);
      if (track) {
        router.push(`/paths/${track.slug}/learn`);
      }
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
    onSettled: () => {
      setEnrollingTrackId(null);
    },
  });

  const handleEnroll = (trackId: string) => {
    setEnrollingTrackId(trackId);
    enrollMutation.mutate({ trackId });
  };

  const handleContinueLearning = (trackSlug: string) => {
    router.push(`/paths/${trackSlug}/learn`);
  };

  // Filter tracks based on search query and difficulty
  const filteredTracks = tracks?.filter((track) => {
    const matchesSearch = searchQuery === '' ||
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' ||
      track.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedDifficulty !== 'all';

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={cn(hasActiveFilters && 'border-primary')}>
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Difficulty Level</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as Difficulty)}>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <DropdownMenuRadioItem key={level} value={level} className="capitalize">
                      {level === 'all' ? 'All Levels' : level}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                <X className="h-4 w-4" />
              </Button>
            )}
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
                            <BookOpen className="h-4 w-4" />Multiple tracks
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
                ) : filteredTracks?.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-muted-foreground">No courses found matching your filters.</p>
                    {hasActiveFilters && (
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredTracks?.map((track) => (
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
                            {track.estimatedHours ? `${track.estimatedHours}h` : 'Self-paced'}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {track.totalCourses} course{track.totalCourses !== 1 ? 's' : ''}
                          </span>
                          {track.enrollment && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Users className="h-4 w-4" />
                              Enrolled
                            </span>
                          )}
                        </div>

                        {/* Shows enrolled badge if user has enrolled - progress shown on detail page */}

                        <Button
                          className={cn(
                            'w-full',
                            track.enrollment
                              ? 'gradient-brand text-white'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          )}
                          onClick={() => track.enrollment
                            ? handleContinueLearning(track.slug)
                            : handleEnroll(track.id)
                          }
                          disabled={enrollingTrackId === track.id}
                        >
                          {enrollingTrackId === track.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...
                            </>
                          ) : track.enrollment ? (
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
                {filteredTracks?.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-muted-foreground">No courses found matching your filters.</p>
                    {hasActiveFilters && (
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : filteredTracks?.map((track) => (
                  <Card key={track.id} className="card-hover border-0 shadow-md">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg">{track.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{track.description}</p>
                      <Button
                        className={cn(
                          'w-full mt-4',
                          track.enrollment
                            ? 'gradient-brand text-white'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        )}
                        onClick={() => track.enrollment
                          ? handleContinueLearning(track.slug)
                          : handleEnroll(track.id)
                        }
                        disabled={enrollingTrackId === track.id}
                      >
                        {enrollingTrackId === track.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...
                          </>
                        ) : track.enrollment ? (
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
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
