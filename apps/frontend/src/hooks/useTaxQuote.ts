/**
 * useTaxQuote Hook
 *
 * Fetches tax and title calculations from Rust tax-svc
 * Integrates with Deal Studio for accurate OTD (Out-The-Door) pricing
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TaxQuoteRequest {
  /** Vehicle VIN (optional, for specific lookups) */
  vin?: string;
  /** Buyer's address */
  address: {
    line1: string;
    city: string;
    state: string;
    postal: string;
  };
  /** County (optional, will be normalized from postal if omitted) */
  county?: string;
  /** Sale price of vehicle */
  salePrice: number;
  /** Trade-in value (affects tax basis in some states) */
  tradeValue?: number;
  /** Additional fees (doc, dealer, etc.) */
  fees?: number;
}

export interface TaxJurisdiction {
  name: string;
  type: 'state' | 'county' | 'city' | 'district';
  rate: number;
  amount: number;
}

export interface TaxFee {
  name: string;
  type: 'registration' | 'title' | 'doc' | 'inspection' | 'other';
  amount: number;
  required: boolean;
}

export interface TaxQuoteResponse {
  /** Breakdown by jurisdiction */
  jurisdictions: TaxJurisdiction[];
  /** Government fees */
  fees: TaxFee[];
  /** Total sales tax */
  tax: number;
  /** Total fees */
  totalFees: number;
  /** Grand total (tax + fees) */
  total: number;
  /** Calculation version/ruleset */
  version: string;
  /** Response time from service (ms) */
  latencyMs: number;
  /** Effective date of rates */
  effectiveDate: string;
}

interface UseTaxQuoteOptions {
  /** Enable automatic fetching when input changes */
  autoFetch?: boolean;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Cache results for N minutes */
  cacheTTL?: number;
}

interface UseTaxQuoteReturn {
  /** Tax quote result */
  quote: TaxQuoteResponse | null;
  /** Whether fetch is in progress */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually fetch quote */
  fetch: (request: TaxQuoteRequest) => Promise<void>;
  /** Clear cached results */
  clearCache: () => void;
}

/**
 * Hook for fetching tax quotes from Rust tax-svc
 */
export function useTaxQuote(
  input: TaxQuoteRequest | null,
  options: UseTaxQuoteOptions = {}
): UseTaxQuoteReturn {
  const {
    autoFetch = true,
    debounceMs = 300,
    cacheTTL = 5, // 5 minutes
  } = options;

  const [quote, setQuote] = useState<TaxQuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, { quote: TaxQuoteResponse; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Generate cache key from request
   */
  const getCacheKey = useCallback((request: TaxQuoteRequest): string => {
    const { address, salePrice, tradeValue } = request;
    return `${address.postal}|${address.state}|${salePrice}|${tradeValue || 0}`;
  }, []);

  /**
   * Check if cache entry is fresh
   */
  const isCacheFresh = useCallback((timestamp: number): boolean => {
    const ageMs = Date.now() - timestamp;
    const maxAgeMs = cacheTTL * 60 * 1000;
    return ageMs < maxAgeMs;
  }, [cacheTTL]);

  /**
   * Fetch tax quote from backend
   */
  const fetch = useCallback(async (request: TaxQuoteRequest) => {
    // Check cache first
    const cacheKey = getCacheKey(request);
    const cached = cacheRef.current.get(cacheKey);
    if (cached && isCacheFresh(cached.timestamp)) {
      setQuote(cached.quote);
      setIsLoading(false);
      return;
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await window.fetch('/api/tax/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        throw new Error(`Tax quote failed: ${response.statusText}`);
      }

      const data: TaxQuoteResponse = await response.json();

      // Cache result
      cacheRef.current.set(cacheKey, {
        quote: data,
        timestamp: Date.now(),
      });

      setQuote(data);
      setIsLoading(false);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Tax quote error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tax quote');
        setIsLoading(false);
      }
    }
  }, [getCacheKey, isCacheFresh]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Auto-fetch on input changes
   */
  useEffect(() => {
    if (!autoFetch || !input) return;

    // Validate minimum required fields
    if (!input.address.postal || !input.address.state || !input.salePrice) {
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      fetch(input);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [input, autoFetch, debounceMs, fetch]);

  return {
    quote,
    isLoading,
    error,
    fetch,
    clearCache,
  };
}

/**
 * Calculate Out-The-Door (OTD) price including tax and fees
 */
export function calculateOTD(
  salePrice: number,
  downPayment: number,
  taxQuote: TaxQuoteResponse | null
): {
  subtotal: number;
  tax: number;
  fees: number;
  otd: number;
  cashDue: number;
} {
  const tax = taxQuote?.tax || 0;
  const fees = taxQuote?.totalFees || 0;
  const otd = salePrice + tax + fees;
  const cashDue = downPayment + tax + fees;

  return {
    subtotal: salePrice,
    tax,
    fees,
    otd,
    cashDue,
  };
}
