import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface UseSearchOptions {
  endpoint?: string;
  searchFields?: string[];
  initialFilters?: Record<string, any>;
  debounceMs?: number;
  autoSearch?: boolean;
}

interface SearchState {
  searchTerm: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export function useSearch({
  endpoint,
  searchFields = [],
  initialFilters = {},
  debounceMs = 300,
  autoSearch = true
}: UseSearchOptions = {}) {
  const [searchState, setSearchState] = useState<SearchState>({
    searchTerm: '',
    filters: initialFilters,
    sortBy: undefined,
    sortOrder: 'asc',
    page: 1,
    pageSize: 20
  });

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchState.searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchState.searchTerm, debounceMs]);

  // Build search query
  const searchQuery = useMemo(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) {
      params.append('search', debouncedSearchTerm);
    }
    
    Object.entries(searchState.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    if (searchState.sortBy) {
      params.append('sortBy', searchState.sortBy);
      params.append('sortOrder', searchState.sortOrder);
    }
    
    params.append('page', String(searchState.page));
    params.append('pageSize', String(searchState.pageSize));
    
    return params.toString();
  }, [debouncedSearchTerm, searchState.filters, searchState.sortBy, searchState.sortOrder, searchState.page, searchState.pageSize]);

  // API query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [endpoint || '/api/search', searchQuery],
    queryFn: async () => {
      if (!endpoint) {
        // Local search implementation
        return performLocalSearch();
      }
      
      const response = await fetch(`${endpoint}?${searchQuery}`);
      return await response.json();
    },
    enabled: autoSearch && (!!endpoint || !!debouncedSearchTerm || Object.keys(searchState.filters).length > 0),
    staleTime: 30000 // 30 seconds
  });

  // Local search function (when no endpoint provided)
  const performLocalSearch = () => {
    // This would be implemented based on local data
    // For now, return empty results
    return {
      results: [],
      total: 0,
      page: searchState.page,
      pageSize: searchState.pageSize
    };
  };

  // Search actions
  const updateSearchTerm = (term: string) => {
    setSearchState(prev => ({
      ...prev,
      searchTerm: term,
      page: 1 // Reset to first page when searching
    }));
  };

  const updateFilters = (filters: Record<string, any>) => {
    setSearchState(prev => ({
      ...prev,
      filters,
      page: 1 // Reset to first page when filtering
    }));
  };

  const updateFilter = (key: string, value: any) => {
    setSearchState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      },
      page: 1
    }));
  };

  const removeFilter = (key: string) => {
    setSearchState(prev => {
      const newFilters = { ...prev.filters };
      delete newFilters[key];
      return {
        ...prev,
        filters: newFilters,
        page: 1
      };
    });
  };

  const clearFilters = () => {
    setSearchState(prev => ({
      ...prev,
      filters: {},
      page: 1
    }));
  };

  const updateSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSearchState(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1
    }));
  };

  const updatePage = (page: number) => {
    setSearchState(prev => ({
      ...prev,
      page
    }));
  };

  const updatePageSize = (pageSize: number) => {
    setSearchState(prev => ({
      ...prev,
      pageSize,
      page: 1
    }));
  };

  const reset = () => {
    setSearchState({
      searchTerm: '',
      filters: initialFilters,
      sortBy: undefined,
      sortOrder: 'asc',
      page: 1,
      pageSize: 20
    });
  };

  return {
    // State
    searchTerm: searchState.searchTerm,
    filters: searchState.filters,
    sortBy: searchState.sortBy,
    sortOrder: searchState.sortOrder,
    page: searchState.page,
    pageSize: searchState.pageSize,
    
    // Data
    results: (data as any)?.results || [],
    total: (data as any)?.total || 0,
    isLoading,
    error,
    
    // Actions
    updateSearchTerm,
    updateFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    updateSort,
    updatePage,
    updatePageSize,
    reset,
    refetch,
    
    // Computed
    hasActiveFilters: Object.keys(searchState.filters).length > 0,
    hasResults: ((data as any)?.results || []).length > 0,
    totalPages: Math.ceil(((data as any)?.total || 0) / searchState.pageSize)
  };
}