import { useMemo, useState } from 'react';
import { Checkbox } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Badge } from '@repo/ui';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

export interface Permission {
  code: string;
  name: string;
  description?: string;
  category: string;
}

export interface PermissionSelectorProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function PermissionSelector({
  permissions,
  selectedPermissions,
  onChange,
  disabled = false,
  className,
}: PermissionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped = new Map<string, Permission[]>();

    permissions.forEach((permission) => {
      const category = permission.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(permission);
    });

    return grouped;
  }, [permissions]);

  // Filter permissions based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return permissionsByCategory;
    }

    const query = searchQuery.toLowerCase();
    const filtered = new Map<string, Permission[]>();

    permissionsByCategory.forEach((perms, category) => {
      const matchingPerms = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query)
      );

      if (matchingPerms.length > 0) {
        filtered.set(category, matchingPerms);
      }
    });

    return filtered;
  }, [permissionsByCategory, searchQuery]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handlePermissionToggle = (permissionCode: string) => {
    if (disabled) return;

    const newSelected = selectedPermissions.includes(permissionCode)
      ? selectedPermissions.filter((code) => code !== permissionCode)
      : [...selectedPermissions, permissionCode];

    onChange(newSelected);
  };

  const handleCategoryToggle = (category: string) => {
    if (disabled) return;

    const categoryPerms = permissionsByCategory.get(category) || [];
    const categoryPermCodes = categoryPerms.map((p) => p.code);
    const allSelected = categoryPermCodes.every((code) => selectedPermissions.includes(code));

    let newSelected: string[];
    if (allSelected) {
      // Remove all category permissions
      newSelected = selectedPermissions.filter((code) => !categoryPermCodes.includes(code));
    } else {
      // Add all category permissions
      newSelected = Array.from(new Set([...selectedPermissions, ...categoryPermCodes]));
    }

    onChange(newSelected);
  };

  const getCategoryStatus = (category: string): 'all' | 'some' | 'none' => {
    const categoryPerms = permissionsByCategory.get(category) || [];
    const categoryPermCodes = categoryPerms.map((p) => p.code);
    const selectedCount = categoryPermCodes.filter((code) => selectedPermissions.includes(code)).length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === categoryPermCodes.length) return 'all';
    return 'some';
  };

  // Auto-expand categories when searching
  useMemo(() => {
    if (searchQuery.trim()) {
      setExpandedCategories(new Set(Array.from(filteredCategories.keys())));
    }
  }, [searchQuery, filteredCategories]);

  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Permission counts */}
      <div className="flex items-center gap-3 text-sm">
        <Badge variant="secondary">
          {selectedPermissions.length} of {permissions.length} selected
        </Badge>
        {searchQuery && (
          <span className="text-muted-foreground">
            {Array.from(filteredCategories.values()).reduce((sum, perms) => sum + perms.length, 0)} results
          </span>
        )}
      </div>

      {/* Permission categories */}
      <div className="space-y-2 max-h-96 overflow-y-auto border border-border rounded-lg">
        {Array.from(filteredCategories.entries()).map(([category, categoryPerms]) => {
          const isExpanded = expandedCategories.has(category);
          const categoryStatus = getCategoryStatus(category);

          return (
            <div key={category} className="border-b border-border last:border-0">
              {/* Category Header */}
              <div
                className={cn(
                  'flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors',
                  disabled && 'opacity-60 cursor-not-allowed'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex-shrink-0 p-0.5 hover:bg-muted rounded"
                  disabled={disabled}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <Checkbox
                  checked={categoryStatus === 'all'}
                  onCheckedChange={() => handleCategoryToggle(category)}
                  disabled={disabled}
                  className={cn(categoryStatus === 'some' && 'data-[state=checked]:bg-primary/60')}
                />
                <div className="flex-1 flex items-center justify-between" onClick={() => toggleCategory(category)}>
                  <Label className="font-semibold text-foreground cursor-pointer">
                    {formatCategoryName(category)}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {categoryPerms.filter((p) => selectedPermissions.includes(p.code)).length} /{' '}
                    {categoryPerms.length}
                  </Badge>
                </div>
              </div>

              {/* Category Permissions */}
              {isExpanded && (
                <div className="bg-muted/30 px-3 pb-3 space-y-2">
                  {categoryPerms.map((permission) => (
                    <div
                      key={permission.code}
                      className={cn(
                        'flex items-start gap-3 p-3 bg-background rounded-md border border-border/50',
                        disabled && 'opacity-60'
                      )}
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(permission.code)}
                        onCheckedChange={() => handlePermissionToggle(permission.code)}
                        disabled={disabled}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          className={cn(
                            'font-medium text-sm cursor-pointer',
                            disabled ? 'cursor-not-allowed' : 'hover:text-primary'
                          )}
                          onClick={() => !disabled && handlePermissionToggle(permission.code)}
                        >
                          {permission.name}
                        </Label>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{permission.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground/70 mt-1 font-mono">{permission.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCategories.size === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No permissions found matching your search</p>
        </div>
      )}
    </div>
  );
}
