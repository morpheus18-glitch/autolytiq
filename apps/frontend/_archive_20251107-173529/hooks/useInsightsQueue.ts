/**
 * useInsightsQueue Hook
 *
 * Provides access to the user's prioritized insight queue
 * with automatic refetching
 */

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './useAuth';

export interface InsightQueueItem {
  id: string;
  tenantId: string;
  role: string;
  userId?: string;
  ruleKey: string;
  severity: 'urgent' | 'warning' | 'notice' | 'info';
  score: number;
  message: string;
  card: {
    type: string;
    payload: any;
  };
  state: 'new' | 'seen' | 'done';
  expiresAt?: string;
  snoozeUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsightsQueueResponse {
  queue: InsightQueueItem[];
  count: number;
}

/**
 * Hook to fetch and manage the insights queue
 */
export function useInsightsQueue(role?: string) {
  const { user } = useAuth();

  return useQuery<InsightsQueueResponse>({
    queryKey: ['insights', 'queue', role],
    queryFn: async () => {
      const queryParams = role ? `?role=${encodeURIComponent(role)}` : '';
      const res = await apiRequest('GET', `/api/insights/queue${queryParams}`);
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 20_000, // Consider stale after 20 seconds
  });
}

/**
 * Hook to get count of insights by severity
 */
export function useInsightsCounts(role?: string) {
  const { data, isLoading } = useInsightsQueue(role);

  const counts = {
    urgent: 0,
    warning: 0,
    notice: 0,
    info: 0,
    total: 0,
  };

  if (data?.queue) {
    data.queue.forEach((insight) => {
      counts[insight.severity]++;
      counts.total++;
    });
  }

  return { counts, isLoading };
}
