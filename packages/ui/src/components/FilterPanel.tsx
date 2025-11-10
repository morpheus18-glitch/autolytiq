/**
 * FilterPanel - Advanced multi-field filtering sidebar
 *
 * Features:
 * - Multiple filter types (text, number, date, select, range)
 * - Saved filter presets
 * - Active filter badges
 * - Clear all filters
 * - Export/import filter state
 * - Filter summary
 *
 * Perfect for: Data tables, reports, search interfaces
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';
import { X, Filter, Save, Upload, Download, RefreshCw } from 'lucide-react';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Select } from './Select.js';
import { Badge } from './Badge.js';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type FilterType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'range' | 'boolean';

export interface FilterField {
  id: string;
  label: string;
  type: FilterType;
  options?: { label: string; value: any }[]; // For select/multiselect
  placeholder?: string;
  min?: number; // For number/range
  max?: number;
  step?: number;
}

export interface FilterValue {
  fieldId: string;
  value: any;
  operator?: 'equals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in';
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterValue[];
  isDefault?: boolean;
}

export interface FilterState {
  activeFilters: FilterValue[];
  activePreset?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface FilterPanelProps {
  fields: FilterField[];
  state?: FilterState;
  onChange?: (state: FilterState) => void;
  presets?: FilterPreset[];
  onSavePreset?: (name: string, filters: FilterValue[]) => void;
  onLoadPreset?: (preset: FilterPreset) => void;
  onExport?: () => void;
  onImport?: (filters: FilterValue[]) => void;
  showPresets?: boolean;
  showExport?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  state: externalState,
  onChange,
  presets = [],
  onSavePreset,
  onLoadPreset,
  onExport,
  onImport,
  showPresets = true,
  showExport = false,
  collapsible = true,
  defaultExpanded = true,
  className,
}) => {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  const [internalState, setInternalState] = React.useState<FilterState>({
    activeFilters: [],
  });

  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [presetName, setPresetName] = React.useState('');
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);

  const state = externalState || internalState;
  const setState = onChange || setInternalState;

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleFilterChange = (fieldId: string, value: any, operator?: string) => {
    const newFilters = state.activeFilters.filter(f => f.fieldId !== fieldId);

    // Only add if value is not empty
    if (value !== null && value !== undefined && value !== '') {
      newFilters.push({
        fieldId,
        value,
        operator: operator as any,
      });
    }

    setState({
      ...state,
      activeFilters: newFilters,
      activePreset: undefined, // Clear active preset when manually changing
    });
  };

  const handleClearAll = () => {
    setState({
      activeFilters: [],
      activePreset: undefined,
    });
  };

  const handleRemoveFilter = (fieldId: string) => {
    setState({
      ...state,
      activeFilters: state.activeFilters.filter(f => f.fieldId !== fieldId),
    });
  };

  const handleSavePreset = () => {
    if (presetName && onSavePreset) {
      onSavePreset(presetName, state.activeFilters);
      setPresetName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setState({
      activeFilters: preset.filters,
      activePreset: preset.id,
    });
    onLoadPreset?.(preset);
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER FILTER INPUTS
  // ═══════════════════════════════════════════════════════════════

  const renderFilterInput = (field: FilterField) => {
    const activeFilter = state.activeFilters.find(f => f.fieldId === field.id);
    const value = activeFilter?.value;

    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`}
            value={value || ''}
            onChange={(e) => handleFilterChange(field.id, e.target.value, 'contains')}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder || 'Enter value...'}
            value={value || ''}
            onChange={(e) => handleFilterChange(field.id, e.target.value, 'equals')}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleFilterChange(field.id, e.target.value, 'equals')}
          />
        );

      case 'select':
        return (
          <Select
            placeholder={field.placeholder || 'Select...'}
            value={value || ''}
            onValueChange={(v) => handleFilterChange(field.id, v, 'equals')}
            options={field.options || []}
          />
        );

      case 'boolean':
        return (
          <Select
            placeholder="Any"
            value={value === undefined ? '' : String(value)}
            onValueChange={(v) => handleFilterChange(field.id, v === 'true', 'equals')}
            options={[
              { label: 'True', value: 'true' },
              { label: 'False', value: 'false' },
            ]}
          />
        );

      case 'range':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={value?.[0] || ''}
              onChange={(e) => handleFilterChange(
                field.id,
                [e.target.value, value?.[1] || ''],
                'between'
              )}
              min={field.min}
              max={field.max}
            />
            <Input
              type="number"
              placeholder="Max"
              value={value?.[1] || ''}
              onChange={(e) => handleFilterChange(
                field.id,
                [value?.[0] || '', e.target.value],
                'between'
              )}
              min={field.min}
              max={field.max}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  const activeFilterCount = state.activeFilters.length;

  return (
    <div className={cn('border border-border-base rounded-lg bg-surface-base', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-base bg-surface-elevated">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-secondary" />
          <h3 className="font-medium text-text-primary">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="default" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
            >
              <RefreshCw className="w-4 h-4" />
              Clear
            </Button>
          )}

          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pb-4 border-b border-border-muted">
              {state.activeFilters.map(filter => {
                const field = fields.find(f => f.id === filter.fieldId);
                if (!field) return null;

                return (
                  <Badge
                    key={filter.fieldId}
                    variant="outline"
                    onRemove={() => handleRemoveFilter(filter.fieldId)}
                  >
                    {field.label}: {String(filter.value)}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Presets */}
          {showPresets && presets.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Saved Filters
              </label>
              <div className="grid gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className={cn(
                      'px-3 py-2 text-sm text-left rounded-md border transition-colors',
                      state.activePreset === preset.id
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary font-medium'
                        : 'border-border-base hover:bg-surface-subtle'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{preset.name}</span>
                      {preset.isDefault && (
                        <Badge variant="outline" size="sm">Default</Badge>
                      )}
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5">
                      {preset.filters.length} filter{preset.filters.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Fields */}
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.id} className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">
                  {field.label}
                </label>
                {renderFilterInput(field)}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t border-border-muted">
            {onSavePreset && (
              <>
                {showSaveDialog ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePreset();
                        if (e.key === 'Escape') setShowSaveDialog(false);
                      }}
                    />
                    <Button size="sm" onClick={handleSavePreset} disabled={!presetName}>
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSaveDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    disabled={activeFilterCount === 0}
                  >
                    <Save className="w-4 h-4" />
                    Save Preset
                  </Button>
                )}
              </>
            )}

            {showExport && onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={activeFilterCount === 0}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

FilterPanel.displayName = 'FilterPanel';

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const applyFilters = <T extends Record<string, any>>(
  data: T[],
  filters: FilterValue[]
): T[] => {
  return data.filter(row => {
    return filters.every(filter => {
      const value = row[filter.fieldId];

      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'gt':
          return Number(value) > Number(filter.value);
        case 'gte':
          return Number(value) >= Number(filter.value);
        case 'lt':
          return Number(value) < Number(filter.value);
        case 'lte':
          return Number(value) <= Number(filter.value);
        case 'between':
          return (
            Number(value) >= Number(filter.value[0]) &&
            Number(value) <= Number(filter.value[1])
          );
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value);
        default:
          return true;
      }
    });
  });
};

export const exportFilters = (filters: FilterValue[]): string => {
  return JSON.stringify(filters, null, 2);
};

export const importFilters = (json: string): FilterValue[] => {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
};
