import { create } from 'zustand';
import type { LeadFilters } from '@/lib/leadsApi';
import type { LeadStatus } from '@/types/leads';

type ViewMode = 'kanban' | 'list';

type SortKey = 'name' | 'intentScore' | 'status' | 'updatedAt' | 'assignedTo';
type SortDirection = 'asc' | 'desc';

interface LeadDashboardState {
  viewMode: ViewMode;
  filters: LeadFilters & { scoreRange: [number, number] };
  sortKey: SortKey;
  sortDirection: SortDirection;
  setViewMode: (mode: ViewMode) => void;
  setFilter: <K extends keyof LeadDashboardState['filters']>(key: K, value: LeadDashboardState['filters'][K]) => void;
  resetFilters: () => void;
  setSort: (key: SortKey) => void;
  setStatusFilter: (status: LeadStatus | 'all') => void;
}

const DEFAULT_FILTERS: LeadDashboardState['filters'] = {
  search: '',
  sources: [],
  status: 'all',
  assignedTo: [],
  minScore: 0,
  maxScore: 100,
  scoreRange: [0, 100],
  startDate: undefined,
  endDate: undefined,
};

export const useLeadDashboardStore = create<LeadDashboardState>((set) => ({
  viewMode: 'kanban',
  filters: DEFAULT_FILTERS,
  sortKey: 'intentScore',
  sortDirection: 'desc',
  setViewMode: (mode) => set({ viewMode: mode }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        ...(key === 'scoreRange'
          ? { minScore: (value as [number, number])[0], maxScore: (value as [number, number])[1] }
          : null),
      },
    })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setSort: (key) =>
    set((state) => ({
      sortKey: key,
      sortDirection: state.sortKey === key && state.sortDirection === 'asc' ? 'desc' : 'asc',
    })),
  setStatusFilter: (status) =>
    set((state) => ({
      filters: {
        ...state.filters,
        status,
      },
    })),
}));
