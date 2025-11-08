/**
 * useLeadScore Hook
 *
 * Fetches ML-based lead score for a customer.
 * Score range: 0-100 (higher = more likely to convert)
 *
 * NOTE: This is a temporary location until @repo/domain is created.
 * Future location: packages/domain/src/customer/useLeadScore.ts
 */

import * as React from 'react';

export function useLeadScore(customerId?: string) {
  const [score, setScore] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!customerId) {
      setScore(null);
      return;
    }

    let ignore = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/ml/lead-score?customerId=${customerId}`);

        if (!res.ok) {
          throw new Error('Failed to fetch lead score');
        }

        const { score } = await res.json();

        if (!ignore) {
          setScore(score);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [customerId]);

  return { score, loading, error };
}
