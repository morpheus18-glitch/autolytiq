import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  badges?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }[];
  metadata?: Record<string, any>;
  actions?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
}

interface SearchResultsProps {
  results: SearchResult[];
  loading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  sortOptions?: { label: string; value: string }[];
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onResultClick?: (result: SearchResult) => void;
  showActions?: boolean;
  customResultRenderer?: (result: SearchResult) => ReactNode;
}

export default function SearchResults({
  results,
  loading = false,
  viewMode = 'list',
  onViewModeChange,
  sortBy,
  sortOrder = 'asc',
  onSortChange,
  sortOptions = [
    { label: 'Name', value: 'name' },
    { label: 'Date Created', value: 'createdAt' },
    { label: 'Last Modified', value: 'updatedAt' }
  ],
  emptyMessage = "No results found",
  emptyIcon = <Search className="w-12 h-12 text-gray-400" />,
  onResultClick,
  showActions = true,
  customResultRenderer
}: SearchResultsProps) {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-gray-600">Searching...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">{emptyIcon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  const ResultCard = ({ result }: { result: SearchResult }) => {
    if (customResultRenderer) {
      return <>{customResultRenderer(result)}</>;
    }

    return (
      <Card 
        className={`hover:shadow-md transition-shadow ${onResultClick ? 'cursor-pointer' : ''}`}
        onClick={() => onResultClick?.(result)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                {result.title}
              </CardTitle>
              {result.subtitle && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                  {result.subtitle}
                </p>
              )}
            </div>
            
            {showActions && result.actions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {result.actions.map((action, index) => (
                    <DropdownMenuItem 
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {result.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {result.description}
            </p>
          )}
          
          {result.badges && result.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {result.badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || 'secondary'}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
          
          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div className="text-xs text-gray-500 space-y-1">
              {Object.entries(result.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {results.length.toLocaleString()} results found
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sort Options */}
          {sortOptions.length > 0 && onSortChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSortChange(option.value, sortBy === option.value && sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {option.label}
                    {sortBy === option.value && (
                      <span className="ml-auto">
                        {sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => onViewModeChange('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none border-l-0"
                onClick={() => onViewModeChange('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
      }>
        {results.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}