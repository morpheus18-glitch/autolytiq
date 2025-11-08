/**
 * useInsightActions Hook
 *
 * Provides mutations for insight queue actions:
 * - Acknowledge (mark as done)
 * - Snooze (temporarily hide)
 * - Mute (disable rule)
 * - Unmute (re-enable rule)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * Hook to perform actions on insights
 */
export function useInsightActions() {
  const queryClient = useQueryClient();

  // Acknowledge insight (mark as done)
  const ackInsight = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', '/api/insights/queue/ack', { id });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queue to refresh
      queryClient.invalidateQueries({ queryKey: ['insights', 'queue'] });
    },
  });

  // Snooze insight for X minutes
  const snoozeInsight = useMutation({
    mutationFn: async ({ id, minutes }: { id: string; minutes: number }) => {
      const res = await apiRequest('POST', '/api/insights/queue/snooze', {
        id,
        minutes,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'queue'] });
    },
  });

  // Mute a rule (temporarily or permanently)
  const muteRule = useMutation({
    mutationFn: async ({
      ruleKey,
      minutes,
    }: {
      ruleKey: string;
      minutes?: number;
    }) => {
      const res = await apiRequest('POST', '/api/insights/mute', {
        ruleKey,
        minutes,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['insights', 'mutes'] });
    },
  });

  // Unmute a rule
  const unmuteRule = useMutation({
    mutationFn: async (ruleKey: string) => {
      const res = await apiRequest('DELETE', `/api/insights/mute/${ruleKey}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['insights', 'mutes'] });
    },
  });

  // Trigger evaluation manually
  const triggerEvaluation = useMutation({
    mutationFn: async (role?: string) => {
      const res = await apiRequest('POST', '/api/insights/evaluate', { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'queue'] });
    },
  });

  return {
    ackInsight,
    snoozeInsight,
    muteRule,
    unmuteRule,
    triggerEvaluation,
  };
}

/**
 * Helper hook for quick acknowledgment
 */
export function useQuickAck() {
  const { ackInsight } = useInsightActions();

  return (id: string) => {
    ackInsight.mutate(id);
  };
}

/**
 * Helper hook for common snooze durations
 */
export function useCommonSnooze() {
  const { snoozeInsight } = useInsightActions();

  return {
    snooze15Min: (id: string) => snoozeInsight.mutate({ id, minutes: 15 }),
    snooze1Hour: (id: string) => snoozeInsight.mutate({ id, minutes: 60 }),
    snooze4Hours: (id: string) => snoozeInsight.mutate({ id, minutes: 240 }),
    snooze24Hours: (id: string) => snoozeInsight.mutate({ id, minutes: 1440 }),
    snoozeCustom: (id: string, minutes: number) =>
      snoozeInsight.mutate({ id, minutes }),
  };
}
