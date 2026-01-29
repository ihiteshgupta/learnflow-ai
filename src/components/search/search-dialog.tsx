'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Route, FileText, Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: searchResults, isLoading } = trpc.search.query.useQuery(
    { q: debouncedQuery, limit: 10 },
    { enabled: debouncedQuery.length > 0 }
  );

  const { data: popularContent } = trpc.search.getPopular.useQuery(
    { limit: 6 },
    { enabled: open && debouncedQuery.length === 0 }
  );

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const handleSelect = useCallback((type: string, id: string) => {
    onOpenChange(false);
    setQuery('');

    switch (type) {
      case 'course':
        router.push(`/courses/${id}`);
        break;
      case 'path':
        router.push(`/paths/${id}`);
        break;
      case 'lesson':
        router.push(`/lesson/${id}`);
        break;
    }
  }, [router, onOpenChange]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'path':
        return <Route className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'lesson':
        return <FileText className="h-4 w-4 mr-2 text-muted-foreground" />;
      default:
        return <Search className="h-4 w-4 mr-2 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, paths, lessons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="p-4 pt-2">
            {isLoading && debouncedQuery.length > 0 && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && debouncedQuery.length > 0 && searchResults?.results.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No results found for "{debouncedQuery}"
              </div>
            )}

            {/* Search Results */}
            {!isLoading && debouncedQuery.length > 0 && searchResults && searchResults.results.length > 0 && (
              <div className="space-y-4">
                {searchResults.counts.courses > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Courses
                    </h4>
                    <div className="space-y-1">
                      {searchResults.results
                        .filter(r => r.type === 'course')
                        .map((result) => (
                          <button
                            key={`course-${result.id}`}
                            onClick={() => handleSelect('course', result.id)}
                            className={cn(
                              'flex items-center w-full px-3 py-2 text-sm rounded-md',
                              'hover:bg-muted transition-colors text-left'
                            )}
                          >
                            {getIcon('course')}
                            <span>{result.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {searchResults.counts.paths > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Learning Paths
                    </h4>
                    <div className="space-y-1">
                      {searchResults.results
                        .filter(r => r.type === 'path')
                        .map((result) => (
                          <button
                            key={`path-${result.id}`}
                            onClick={() => handleSelect('path', result.id)}
                            className={cn(
                              'flex items-center w-full px-3 py-2 text-sm rounded-md',
                              'hover:bg-muted transition-colors text-left'
                            )}
                          >
                            {getIcon('path')}
                            <span>{result.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {searchResults.counts.lessons > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Lessons
                    </h4>
                    <div className="space-y-1">
                      {searchResults.results
                        .filter(r => r.type === 'lesson')
                        .map((result) => (
                          <button
                            key={`lesson-${result.id}`}
                            onClick={() => handleSelect('lesson', result.id)}
                            className={cn(
                              'flex items-center w-full px-3 py-2 text-sm rounded-md',
                              'hover:bg-muted transition-colors text-left'
                            )}
                          >
                            {getIcon('lesson')}
                            <span>{result.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Popular Content (when no search query) */}
            {debouncedQuery.length === 0 && popularContent && (
              <div className="space-y-4">
                {popularContent.paths.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Featured Paths
                    </h4>
                    <div className="space-y-1">
                      {popularContent.paths.map((path) => (
                        <button
                          key={`popular-path-${path.id}`}
                          onClick={() => handleSelect('path', path.id)}
                          className={cn(
                            'flex items-center w-full px-3 py-2 text-sm rounded-md',
                            'hover:bg-muted transition-colors text-left'
                          )}
                        >
                          {getIcon('path')}
                          <span>{path.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {popularContent.courses.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Popular Courses
                    </h4>
                    <div className="space-y-1">
                      {popularContent.courses.map((course) => (
                        <button
                          key={`popular-course-${course.id}`}
                          onClick={() => handleSelect('course', course.id)}
                          className={cn(
                            'flex items-center w-full px-3 py-2 text-sm rounded-md',
                            'hover:bg-muted transition-colors text-left'
                          )}
                        >
                          {getIcon('course')}
                          <span>{course.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {popularContent.paths.length === 0 && popularContent.courses.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Start typing to search...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
