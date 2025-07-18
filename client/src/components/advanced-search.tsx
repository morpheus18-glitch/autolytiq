import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  ChevronDown,
  SlidersHorizontal
} from "lucide-react";
import { format } from "date-fns";

export interface FilterOption {
  id: string;
  label: string;
  type: "select" | "multiselect" | "range" | "date" | "boolean" | "text";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface SearchFilters {
  searchTerm: string;
  [key: string]: any;
}

interface AdvancedSearchProps {
  searchPlaceholder?: string;
  filters: FilterOption[];
  onFiltersChange: (filters: SearchFilters) => void;
  onClear: () => void;
  className?: string;
}

export default function AdvancedSearch({
  searchPlaceholder = "Search...",
  filters,
  onFiltersChange,
  onClear,
  className = ""
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({ searchTerm: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRanges, setDateRanges] = useState<{ [key: string]: { from?: Date; to?: Date } }>({});

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const newFilters = { ...activeFilters, searchTerm: value };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...activeFilters, [filterId]: value };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (filterId: string, range: { from?: Date; to?: Date }) => {
    setDateRanges(prev => ({ ...prev, [filterId]: range }));
    const newFilters = { ...activeFilters, [filterId]: range };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setActiveFilters({ searchTerm: "" });
    setDateRanges({});
    onClear();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (key !== "searchTerm" && value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (typeof value === "object" && value.from) count++;
        else if (typeof value === "string" && value.trim()) count++;
        else if (typeof value === "boolean") count++;
        else if (typeof value === "number") count++;
      }
    });
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
        {activeCount > 0 && (
          <Button variant="outline" onClick={clearAllFilters} size="sm">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="px-3 py-1">
              Search: "{searchTerm}"
              <X 
                className="w-3 h-3 ml-2 cursor-pointer" 
                onClick={() => handleSearchChange("")}
              />
            </Badge>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            if (key === "searchTerm" || !value) return null;
            
            const filter = filters.find(f => f.id === key);
            if (!filter) return null;

            let displayValue = value;
            if (Array.isArray(value)) {
              displayValue = value.join(", ");
            } else if (typeof value === "object" && value.from) {
              displayValue = `${format(value.from, "MMM dd")} - ${value.to ? format(value.to, "MMM dd") : "..."}`;
            } else if (filter.type === "select" && filter.options) {
              const option = filter.options.find(opt => opt.value === value);
              displayValue = option?.label || value;
            }

            return (
              <Badge key={key} variant="secondary" className="px-3 py-1">
                {filter.label}: {displayValue}
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handleFilterChange(key, undefined)}
                />
              </Badge>
            );
          })}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label htmlFor={filter.id}>{filter.label}</Label>
                  
                  {filter.type === "select" && (
                    <Select
                      value={activeFilters[filter.id] || "all"}
                      onValueChange={(value) => handleFilterChange(filter.id, value === "all" ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === "multiselect" && (
                    <div className="space-y-2">
                      {filter.options?.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${filter.id}-${option.value}`}
                            checked={(activeFilters[filter.id] || []).includes(option.value)}
                            onCheckedChange={(checked) => {
                              const currentValues = activeFilters[filter.id] || [];
                              const newValues = checked
                                ? [...currentValues, option.value]
                                : currentValues.filter((v: string) => v !== option.value);
                              handleFilterChange(filter.id, newValues);
                            }}
                          />
                          <Label htmlFor={`${filter.id}-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {filter.type === "range" && (
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder={`Min ${filter.min || 0}`}
                        value={activeFilters[filter.id]?.min || ""}
                        onChange={(e) => handleFilterChange(filter.id, {
                          ...activeFilters[filter.id],
                          min: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                      />
                      <Input
                        type="number"
                        placeholder={`Max ${filter.max || 999999}`}
                        value={activeFilters[filter.id]?.max || ""}
                        onChange={(e) => handleFilterChange(filter.id, {
                          ...activeFilters[filter.id],
                          max: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                      />
                    </div>
                  )}

                  {filter.type === "date" && (
                    <div className="flex space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRanges[filter.id]?.from ? (
                              dateRanges[filter.id]?.to ? (
                                `${format(dateRanges[filter.id].from!, "LLL dd, y")} - ${format(dateRanges[filter.id].to!, "LLL dd, y")}`
                              ) : (
                                format(dateRanges[filter.id].from!, "LLL dd, y")
                              )
                            ) : (
                              "Pick a date range"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRanges[filter.id]?.from}
                            selected={dateRanges[filter.id]}
                            onSelect={(range) => handleDateRangeChange(filter.id, range || {})}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {filter.type === "boolean" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={filter.id}
                        checked={activeFilters[filter.id] || false}
                        onCheckedChange={(checked) => handleFilterChange(filter.id, checked)}
                      />
                      <Label htmlFor={filter.id} className="text-sm">
                        {filter.label}
                      </Label>
                    </div>
                  )}

                  {filter.type === "text" && (
                    <Input
                      placeholder={filter.placeholder || "Enter text..."}
                      value={activeFilters[filter.id] || ""}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}