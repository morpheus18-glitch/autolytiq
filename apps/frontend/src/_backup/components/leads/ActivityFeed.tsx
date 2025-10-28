import { useEffect, useMemo, useRef } from 'react';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import {
  Mail,
  MessageSquare,
  Phone,
  NotebookPen,
  CalendarClock,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { LeadActivityPage, LeadActivityItem } from '@/types/leads';
import { cn } from '@/lib/utils';

dayjs.extend(relativeTime);

interface ActivityFeedProps {
  query: UseInfiniteQueryResult<InfiniteData<LeadActivityPage>, Error>;
  title?: string;
  emptyState?: string;
  enableRealtimeBadge?: boolean;
  highlightIds?: Set<string>;
}

function getIcon(activity: LeadActivityItem) {
  switch (activity.type) {
    case 'email':
      return <Mail className="h-4 w-4 text-sky-600" />;
    case 'sms':
      return <MessageSquare className="h-4 w-4 text-emerald-600" />;
    case 'call':
      return <Phone className="h-4 w-4 text-indigo-600" />;
    case 'task':
      return <CheckCircle className="h-4 w-4 text-amber-600" />;
    case 'meeting':
      return <CalendarClock className="h-4 w-4 text-purple-600" />;
    case 'note':
    default:
      return <NotebookPen className="h-4 w-4 text-slate-600" />;
  }
}

function formatTimestamp(timestamp: string) {
  const value = dayjs(timestamp);
  if (!value.isValid()) {
    return 'Just now';
  }

  const now = dayjs();
  if (now.diff(value, 'minute') < 2) {
    return 'Just now';
  }

  if (now.diff(value, 'hour') < 24) {
    return value.fromNow();
  }

  return value.format('MMM D, YYYY h:mm A');
}

export function ActivityFeed({ query, title = 'Timeline', emptyState, enableRealtimeBadge, highlightIds }: ActivityFeedProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
          void query.fetchNextPage();
        }
      },
      { threshold: 1 },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [query]);

  const activities = useMemo<LeadActivityItem[]>(() => {
    const pages = query.data?.pages ?? [];
    return pages.flatMap((page) => page.items);
  }, [query.data]);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
        {enableRealtimeBadge && query.isFetching && (
          <Badge variant="secondary" className="flex items-center gap-1 bg-emerald-50 text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" /> Live
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
            {emptyState ?? 'No recent activity for this lead yet.'}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  'flex gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-slate-200 hover:bg-slate-50/60',
                  highlightIds?.has(activity.id) && 'border-emerald-300 bg-emerald-50/80',
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  {getIcon(activity)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900">{activity.detail}</p>
                    <span className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {activity.author && <span>by {activity.author}</span>}
                    {activity.direction && <Badge variant="outline">{activity.direction}</Badge>}
                    {activity.channel && <Badge variant="outline">{activity.channel}</Badge>}
                  </div>
                </div>
              </div>
            ))}
            <div ref={sentinelRef} />
            {query.isFetchingNextPage && (
              <div className="flex items-center justify-center py-3 text-sm text-slate-500">
                Loading more activity…
              </div>
            )}
            {query.hasNextPage && !query.isFetchingNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActivityFeed;
