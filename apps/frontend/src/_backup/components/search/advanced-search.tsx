import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  SlidersHorizontal,
  Download,
  RefreshCw,
  Plus,
  ChevronDown
} from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  value: any;
  type: 'text' | 'select' | 'date' | 'range' | 'multiselect';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface AdvancedSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onClearFilters: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  resultCount?: number;
  loading?: boolean;
}

export default function AdvancedSearch({
  searchTerm,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  onExport,
  onRefresh,
  resultCount,
  loading = false
}: AdvancedSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState<string | null>(null);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const renderFilter = (filter: FilterOption) => {
    const value = activeFilters[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => onFilterChange(filter.id, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => onFilterChange(filter.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {filter.label}</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover open={datePickerOpen === filter.id} onOpenChange={(open) => setDatePickerOpen(open ? filter.id : null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : `Select ${filter.label.toLowerCase()}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => {
                  onFilterChange(filter.id, date?.toISOString());
                  setDatePickerOpen(null);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'range':
        return (
          <div className="flex gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={value?.min || ''}
              onChange={(e) => onFilterChange(filter.id, { ...value, min: e.target.value })}
            />
            <Input
              placeholder="Max"
              type="number"
              value={value?.max || ''}
              onChange={(e) => onFilterChange(filter.id, { ...value, max: e.target.value })}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search across all fields..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Advanced
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Advanced Search & Filters</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <Label htmlFor={filter.id}>{filter.label}</Label>
                    {renderFilter(filter)}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" onClick={onClearFilters}>
                  Clear All Filters
                </Button>
                <Button onClick={() => setShowAdvanced(false)}>
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {Object.entries(activeFilters).map(([filterId, value]) => {
            if (!value) return null;
            
            const filter = filters.find(f => f.id === filterId);
            if (!filter) return null;

            let displayValue = value;
            if (filter.type === 'date' && value) {
              displayValue = format(new Date(value), "MMM dd, yyyy");
            } else if (filter.type === 'range' && value) {
              displayValue = `${value.min || '0'} - ${value.max || '∞'}`;
            } else if (filter.type === 'select' && filter.options) {
              const option = filter.options.find(opt => opt.value === value);
              displayValue = option ? option.label : value;
            }

            return (
              <Badge key={filterId} variant="secondary" className="gap-1">
                {filter.label}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => onFilterChange(filterId, null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Results Summary */}
      {resultCount !== undefined && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {loading ? 'Searching...' : `${resultCount.toLocaleString()} results found`}
          </span>
          {searchTerm && (
            <span>for "{searchTerm}"</span>
          )}
        </div>
      )}
    </div>
  );
}