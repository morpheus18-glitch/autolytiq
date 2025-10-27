import dayjs from 'dayjs';
import { API_BASE_URL } from '@/config/api';
import { apiRequest } from '@/lib/queryClient';
import type {
  Lead,
  LeadDetail,
  LeadStatus,
  LeadActivityPage,
  LeadActivityItem,
} from '@/types/leads';

export interface LeadFilters {
  search?: string;
  sources?: string[];
  status?: LeadStatus | 'all';
  assignedTo?: string[];
  minScore?: number;
  maxScore?: number;
  startDate?: string;
  endDate?: string;
}

export interface LeadStatusPayload {
  id: string;
  status: LeadStatus;
}

function toQueryString(filters: LeadFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.sources?.length) {
    params.set('source', filters.sources.join(','));
  }

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }

  if (filters.assignedTo?.length) {
    params.set('assignedTo', filters.assignedTo.join(','));
  }

  if (typeof filters.minScore === 'number') {
    params.set('minScore', String(filters.minScore));
  }

  if (typeof filters.maxScore === 'number') {
    params.set('maxScore', String(filters.maxScore));
  }

  if (filters.startDate) {
    params.set('startDate', filters.startDate);
  }

  if (filters.endDate) {
    params.set('endDate', filters.endDate);
  }

  return params.toString();
}

export async function fetchLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  const query = toQueryString(filters);
  const url = query ? `/api/market-leads?${query}` : '/api/market-leads';
  const response = await fetch(`${API_BASE_URL}${url}`, { credentials: 'include' });

  if (!response.ok) {
    throw new Error('Failed to fetch leads');
  }

  const leads = (await response.json()) as Lead[];

  return leads.map((lead) => ({
    ...lead,
    status: lead.status ?? 'new',
    intentScore: Number(lead.intentScore ?? 0),
    createdAt: lead.createdAt ?? dayjs().toISOString(),
    updatedAt: lead.updatedAt ?? dayjs().toISOString(),
  }));
}

export async function fetchLeadDetail(id: string): Promise<LeadDetail> {
  const response = await fetch(`${API_BASE_URL}/api/market-leads/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch lead');
  }

  const lead = (await response.json()) as LeadDetail;

  return {
    ...lead,
    status: lead.status ?? 'new',
    intentScore: Number(lead.intentScore ?? 0),
    activities: lead.activities ?? [],
  };
}

export async function updateLeadStatus({ id, status }: LeadStatusPayload): Promise<void> {
  const res = await apiRequest('PUT', `/api/market-leads/${id}/status`, { status });

  if (!res.ok) {
    throw new Error('Failed to update lead status');
  }
}

export interface LeadTimelineParams {
  leadId: string;
  cursor?: string | null;
  pageSize?: number;
}

export async function fetchLeadTimeline({
  leadId,
  cursor,
  pageSize = 15,
}: LeadTimelineParams): Promise<LeadActivityPage> {
  const params = new URLSearchParams({ pageSize: String(pageSize) });

  if (cursor) {
    params.set('cursor', cursor);
  }

  const response = await fetch(`${API_BASE_URL}/api/lead-activity?leadId=${leadId}&${params.toString()}`, {
    credentials: 'include',
  });

  if (response.ok) {
    return (await response.json()) as LeadActivityPage;
  }

  // Fallback: derive from lead detail when endpoint is unavailable
  if (response.status === 404 || response.status === 501) {
    const detail = await fetchLeadDetail(leadId);
    const sortedActivities = [...(detail.activities ?? [])].sort((a, b) =>
      dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
    );

    if (!sortedActivities.length) {
      return { items: [], nextCursor: null };
    }

    const startIndex = cursor ? sortedActivities.findIndex((item) => item.id === cursor) + 1 : 0;
    const items = sortedActivities.slice(startIndex, startIndex + pageSize);
    const nextCursorValue = items.length === pageSize ? items[items.length - 1].id : null;

    return { items, nextCursor: nextCursorValue };
  }

  throw new Error('Failed to fetch lead activity timeline');
}

export async function createLeadActivity(
  leadId: string,
  payload: Omit<LeadActivityItem, 'id' | 'leadId' | 'timestamp'> & { timestamp?: string },
): Promise<LeadActivityItem> {
  const body = {
    ...payload,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };

  const response = await apiRequest('POST', `/api/lead-activity`, {
    leadId,
    ...body,
  });

  const json = await response.json();
  return json as LeadActivityItem;
}
