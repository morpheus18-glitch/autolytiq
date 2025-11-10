/**
 * usePricing Hook
 *
 * Bridge to Rust pricing service (via backend proxy).
 * Provides instant calculations with debouncing for smooth UX.
 *
 * NOTE: This is a temporary location until @repo/domain is created.
 * Future location: packages/domain/src/pricing/usePricing.ts
 */

import * as React from 'react';

type PricingRequest = {
  tenantId: string;
  vehiclePrice: number;
  vehicleCost: number;
  pack?: number;
};

type PricingResponse = {
  gross: number;
  acv?: number;
  hint?: number;
};

export function usePricing(tenantId: string) {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<PricingResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const controller = React.useRef<AbortController | null>(null);
  const debounce = React.useRef<number>();

  const calculate = React.useCallback(
    (req: Omit<PricingRequest, 'tenantId'>) => {
      window.clearTimeout(debounce.current);
      debounce.current = window.setTimeout(async () => {
        controller.current?.abort();
        controller.current = new AbortController();
        setLoading(true);
        setError(null);

        try {
          const res = await fetch(`/api/pricing/gross`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId, ...req }),
            signal: controller.current.signal,
          });

          if (!res.ok) {
            throw new Error('Failed to calculate pricing');
          }

          const json = (await res.json()) as PricingResponse;
          setData(json);
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            // Ignore abort errors (from debouncing)
            return;
          }
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      }, 120); // 120ms debounce for instant-but-batched feel
    },
    [tenantId]
  );

  const reset = React.useCallback(() => {
    window.clearTimeout(debounce.current);
    controller.current?.abort();
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { loading, data, error, calculate, reset };
}
