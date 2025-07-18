import { useState, useMemo } from "react";
import { SearchFilters } from "@/components/advanced-search";

export interface UseAdvancedSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFunctions?: {
    [key: string]: (item: T, value: any) => boolean;
  };
}

export function useAdvancedSearch<T>({
  data,
  searchFields,
  filterFunctions = {}
}: UseAdvancedSearchOptions<T>) {
  const [filters, setFilters] = useState<SearchFilters>({ searchTerm: "" });

  const filteredData = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    // Apply search term filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm);
        })
      );
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "searchTerm" || value === undefined || value === null || value === "") return;
      
      const filterFunction = filterFunctions[key];
      if (filterFunction) {
        filtered = filtered.filter(item => filterFunction(item, value));
      }
    });

    return filtered;
  }, [data, filters, searchFields, filterFunctions]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleClear = () => {
    setFilters({ searchTerm: "" });
  };

  return {
    filteredData,
    filters,
    handleFiltersChange,
    handleClear,
    setFilters
  };
}

// Common filter functions
export const commonFilters = {
  // Status filter
  status: <T extends { status: string }>(item: T, value: string) => {
    return item.status === value;
  },

  // Date range filter
  dateRange: <T extends { createdAt: string | Date }>(item: T, value: { from?: Date; to?: Date }) => {
    if (!value.from && !value.to) return true;
    
    const itemDate = new Date(item.createdAt);
    const fromDate = value.from ? new Date(value.from) : null;
    const toDate = value.to ? new Date(value.to) : null;
    
    if (fromDate && toDate) {
      return itemDate >= fromDate && itemDate <= toDate;
    } else if (fromDate) {
      return itemDate >= fromDate;
    } else if (toDate) {
      return itemDate <= toDate;
    }
    
    return true;
  },

  // Numeric range filter
  numericRange: <T>(field: keyof T) => (item: T, value: { min?: number; max?: number }) => {
    const itemValue = Number(item[field]);
    if (isNaN(itemValue)) return true;
    
    const min = value.min !== undefined ? value.min : -Infinity;
    const max = value.max !== undefined ? value.max : Infinity;
    
    return itemValue >= min && itemValue <= max;
  },

  // Multi-select filter
  multiSelect: <T>(field: keyof T) => (item: T, values: string[]) => {
    if (!values || values.length === 0) return true;
    return values.includes(String(item[field]));
  },

  // Boolean filter
  boolean: <T>(field: keyof T) => (item: T, value: boolean) => {
    return Boolean(item[field]) === value;
  },

  // Text contains filter
  textContains: <T>(field: keyof T) => (item: T, value: string) => {
    if (!value || !value.trim()) return true;
    const itemValue = String(item[field] || "").toLowerCase();
    return itemValue.includes(value.toLowerCase());
  }
};