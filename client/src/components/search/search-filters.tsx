import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Filter, 
  X, 
  ChevronDown, 
  Calendar as CalendarIcon,
  DollarSign,
  Hash,
  Type,
  Clock
} from "lucide-react";

interface QuickFilter {
  id: string;
  label: string;
  type: 'status' | 'category' | 'priority' | 'date' | 'price' | 'custom';
  options?: string[];
  icon?: React.ReactNode;
}

interface SearchFiltersProps {
  onFilterChange: (filters: Record<string, any>) => void;
  activeFilters: Record<string, any>;
  quickFilters?: QuickFilter[];
  showPriceRange?: boolean;
  showDateRange?: boolean;
  customFilters?: React.ReactNode;
}

export default function SearchFilters({
  onFilterChange,
  activeFilters,
  quickFilters = [],
  showPriceRange = false,
  showDateRange = false,
  customFilters
}: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const defaultQuickFilters: QuickFilter[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'status',
      options: ['Active', 'Pending', 'Completed', 'Cancelled'],
      icon: <Hash className="w-4 h-4" />
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'priority',
      options: ['Low', 'Medium', 'High', 'Critical'],
      icon: <Type className="w-4 h-4" />
    }
  ];

  const allFilters = quickFilters.length > 0 ? quickFilters : defaultQuickFilters;

  const handleQuickFilterChange = (filterId: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (newFilters[filterId] === value) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    const newFilters = { ...activeFilters };
    newFilters.priceRange = { min: values[0], max: values[1] };
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (type: 'from' | 'to', date: Date | undefined) => {
    if (type === 'from') {
      setDateFrom(date);
    } else {
      setDateTo(date);
    }

    const newFilters = { ...activeFilters };
    newFilters.dateRange = {
      from: type === 'from' ? date : dateFrom,
      to: type === 'to' ? date : dateTo
    };
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setPriceRange([0, 100000]);
    setDateFrom(undefined);
    setDateTo(undefined);
    onFilterChange({});
  };

  const getFilterColor = (type: string) => {
    const colors = {
      status: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      category: 'bg-green-100 text-green-800 hover:bg-green-200',
      priority: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      date: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      price: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      custom: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.custom;
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {allFilters.map((filter) => (
          <Popover key={filter.id}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`gap-2 ${activeFilters[filter.id] ? getFilterColor(filter.type) : ''}`}
              >
                {filter.icon}
                {filter.label}
                {activeFilters[filter.id] && (
                  <Badge variant="secondary" className="ml-1 px-1">
                    1
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{filter.label}</h4>
                {filter.options?.map((option) => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => handleQuickFilterChange(filter.id, option)}
                  >
                    <Checkbox
                      checked={activeFilters[filter.id] === option}
                      onChange={() => handleQuickFilterChange(filter.id, option)}
                    />
                    <span className="text-sm">{option}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ))}

        {/* Price Range Filter */}
        {showPriceRange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`gap-2 ${activeFilters.priceRange ? getFilterColor('price') : ''}`}
              >
                <DollarSign className="w-4 h-4" />
                Price Range
                {activeFilters.priceRange && (
                  <Badge variant="secondary" className="ml-1 px-1">
                    1
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Price Range</h4>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={100000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Date Range Filter */}
        {showDateRange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`gap-2 ${activeFilters.dateRange ? getFilterColor('date') : ''}`}
              >
                <CalendarIcon className="w-4 h-4" />
                Date Range
                {activeFilters.dateRange && (
                  <Badge variant="secondary" className="ml-1 px-1">
                    1
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Date Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">From</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={(date) => handleDateRangeChange('from', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">To</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={(date) => handleDateRangeChange('to', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Custom Filters */}
        {customFilters}

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
            <X className="w-4 h-4" />
            Clear All ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            
            let displayValue = value;
            if (key === 'priceRange') {
              displayValue = `$${value.min.toLocaleString()} - $${value.max.toLocaleString()}`;
            } else if (key === 'dateRange') {
              displayValue = `${value.from ? format(new Date(value.from), "MMM dd") : '...'} - ${value.to ? format(new Date(value.to), "MMM dd") : '...'}`;
            }

            return (
              <Badge key={key} variant="secondary" className="gap-1 text-xs">
                {key}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => {
                    const newFilters = { ...activeFilters };
                    delete newFilters[key];
                    onFilterChange(newFilters);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}