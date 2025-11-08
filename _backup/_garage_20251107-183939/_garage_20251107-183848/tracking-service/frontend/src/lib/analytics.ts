import type { AnalyticsMetrics, CustomerSession } from '../types/tracking.types';

type FetchOptions = {
  period?: string;
  signal?: AbortSignal;
};

type FetchHotLeadsOptions = FetchOptions & {
  limit?: number;
  minScore?: number;
};

const DEFAULT_PERIOD = '7d';

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_TRACKING_URL || 'http://localhost:5001/api/tracking';
  }
  return (window as any).__TRACKING_API_URL__ || process.env.NEXT_PUBLIC_TRACKING_URL || '/api/tracking';
}

async function fetchJson<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.NEXT_PUBLIC_TRACKING_API_KEY
        ? { 'x-api-key': process.env.NEXT_PUBLIC_TRACKING_API_KEY }
        : {}),
      ...(process.env.NEXT_PUBLIC_TRACKING_TENANT
        ? { 'x-tenant-id': process.env.NEXT_PUBLIC_TRACKING_TENANT }
        : {}),
      ...init.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Tracking API request failed: ${response.status} ${body}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchDashboardAnalytics(options: FetchOptions = {}): Promise<AnalyticsMetrics> {
  const params = new URLSearchParams({ period: options.period || DEFAULT_PERIOD });
  return fetchJson<AnalyticsMetrics>(`/analytics/dashboard?${params.toString()}`, {
    signal: options.signal,
  });
}

export async function fetchCustomerJourney(customerId: string, options: FetchOptions = {}) {
  const params = new URLSearchParams({ period: options.period || DEFAULT_PERIOD });
  return fetchJson(`/analytics/customer/${customerId}?${params.toString()}`, {
    signal: options.signal,
  });
}

export async function fetchSessionReplay(sessionId: string, options: FetchOptions = {}) {
  return fetchJson(`/analytics/session/${sessionId}`, {
    signal: options.signal,
  });
}

export async function fetchHotLeads(options: FetchHotLeadsOptions = {}) {
  const params = new URLSearchParams({
    period: options.period || DEFAULT_PERIOD,
    limit: String(options.limit ?? 50),
    minScore: String(options.minScore ?? 50),
  });

  return fetchJson(`/analytics/hot-leads?${params.toString()}`, {
    signal: options.signal,
  });
}

export async function fetchVehicleAnalytics(options: FetchOptions = {}) {
  const params = new URLSearchParams({ period: options.period || DEFAULT_PERIOD });
  return fetchJson(`/analytics/vehicles?${params.toString()}`, {
    signal: options.signal,
  });
}

export async function fetchHeatmapData(pagePath: string, options: FetchOptions = {}) {
  const params = new URLSearchParams({ period: options.period || DEFAULT_PERIOD });
  return fetchJson(`/analytics/heatmap/${encodeURIComponent(pagePath)}?${params.toString()}`, {
    signal: options.signal,
  });
}

export async function exportAnalytics(type: 'events' | 'sessions' | 'funnels', format: 'json' | 'csv', options: FetchOptions = {}) {
  const params = new URLSearchParams({
    period: options.period || DEFAULT_PERIOD,
    type,
    format,
  });

  const response = await fetch(`${getApiBaseUrl()}/analytics/export?${params.toString()}`, {
    credentials: 'include',
    headers: {
      ...(process.env.NEXT_PUBLIC_TRACKING_API_KEY
        ? { 'x-api-key': process.env.NEXT_PUBLIC_TRACKING_API_KEY }
        : {}),
      ...(process.env.NEXT_PUBLIC_TRACKING_TENANT
        ? { 'x-tenant-id': process.env.NEXT_PUBLIC_TRACKING_TENANT }
        : {}),
    },
    signal: options.signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Tracking export failed: ${response.status} ${body}`);
  }

  if (format === 'csv') {
    return response.text();
  }

  return response.json();
}

export type { CustomerSession };
