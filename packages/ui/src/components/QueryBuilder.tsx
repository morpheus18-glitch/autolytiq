/**
 * QueryBuilder - Visual query builder for complex data filtering
 *
 * Features:
 * - Visual AND/OR logic builder
 * - Field selection with type awareness
 * - Operator selection (equals, contains, gt, lt, between, in, etc.)
 * - Value input with type validation
 * - Nested condition groups
 * - Export to SQL/JSON
 * - Query templates
 *
 * Perfect for: Financial reports, CRM filters, inventory search
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from './Button.js';
import { Select } from './Select.js';
import { Input } from './Input.js';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multi-select';

export interface QueryField {
  id: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: any }[]; // For select/multi-select
  placeholder?: string;
}

export type OperatorType =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null';

export interface QueryCondition {
  id: string;
  field: string;
  operator: OperatorType;
  value: any;
}

export interface QueryGroup {
  id: string;
  combinator: 'AND' | 'OR';
  conditions: QueryCondition[];
  groups: QueryGroup[];
}

export interface Query {
  root: QueryGroup;
}

// ═══════════════════════════════════════════════════════════════
// OPERATOR CONFIGS
// ═══════════════════════════════════════════════════════════════

const OPERATORS_BY_TYPE: Record<FieldType, OperatorType[]> = {
  string: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_null', 'is_not_null'],
  number: ['equals', 'not_equals', 'gt', 'gte', 'lt', 'lte', 'between', 'is_null', 'is_not_null'],
  date: ['equals', 'not_equals', 'gt', 'gte', 'lt', 'lte', 'between', 'is_null', 'is_not_null'],
  boolean: ['equals', 'not_equals'],
  select: ['equals', 'not_equals', 'in', 'not_in', 'is_null', 'is_not_null'],
  'multi-select': ['in', 'not_in', 'is_null', 'is_not_null'],
};

const OPERATOR_LABELS: Record<OperatorType, string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  gt: 'greater than',
  gte: 'greater than or equal',
  lt: 'less than',
  lte: 'less than or equal',
  between: 'between',
  in: 'is one of',
  not_in: 'is not one of',
  is_null: 'is empty',
  is_not_null: 'is not empty',
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyCondition = (): QueryCondition => ({
  id: generateId(),
  field: '',
  operator: 'equals',
  value: null,
});

const createEmptyGroup = (combinator: 'AND' | 'OR' = 'AND'): QueryGroup => ({
  id: generateId(),
  combinator,
  conditions: [createEmptyCondition()],
  groups: [],
});

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface ConditionRowProps {
  condition: QueryCondition;
  fields: QueryField[];
  onChange: (condition: QueryCondition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ConditionRow: React.FC<ConditionRowProps> = ({
  condition,
  fields,
  onChange,
  onRemove,
  canRemove,
}) => {
  const selectedField = fields.find(f => f.id === condition.field);
  const availableOperators = selectedField
    ? OPERATORS_BY_TYPE[selectedField.type]
    : [];

  const needsValue = !['is_null', 'is_not_null'].includes(condition.operator);
  const needsSecondValue = condition.operator === 'between';

  return (
    <div className="flex items-center gap-2 p-3 bg-surface-elevated border border-border-base rounded-lg group">
      <GripVertical className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

      {/* Field */}
      <Select
        value={condition.field}
        onValueChange={(field) => onChange({ ...condition, field, value: null })}
        options={fields.map(f => ({ label: f.label, value: f.id }))}
        placeholder="Select field..."
        className="min-w-[180px]"
      />

      {/* Operator */}
      {selectedField && (
        <Select
          value={condition.operator}
          onValueChange={(operator) => onChange({ ...condition, operator: operator as OperatorType })}
          options={availableOperators.map(op => ({
            label: OPERATOR_LABELS[op],
            value: op,
          }))}
          className="min-w-[150px]"
        />
      )}

      {/* Value Input */}
      {selectedField && needsValue && (
        <>
          {selectedField.type === 'select' || selectedField.type === 'multi-select' ? (
            <Select
              value={condition.value}
              onValueChange={(value) => onChange({ ...condition, value })}
              options={selectedField.options || []}
              placeholder={selectedField.placeholder || 'Select value...'}
              className="min-w-[180px]"
            />
          ) : selectedField.type === 'boolean' ? (
            <Select
              value={condition.value}
              onValueChange={(value) => onChange({ ...condition, value: value === 'true' })}
              options={[
                { label: 'True', value: 'true' },
                { label: 'False', value: 'false' },
              ]}
              className="min-w-[120px]"
            />
          ) : (
            <Input
              type={selectedField.type === 'number' ? 'number' : selectedField.type === 'date' ? 'date' : 'text'}
              value={condition.value || ''}
              onChange={(e) => onChange({ ...condition, value: e.target.value })}
              placeholder={selectedField.placeholder || `Enter ${selectedField.type}...`}
              className="min-w-[180px]"
            />
          )}

          {/* Second value for BETWEEN */}
          {needsSecondValue && (
            <>
              <span className="text-sm text-text-secondary">and</span>
              <Input
                type={selectedField.type === 'number' ? 'number' : selectedField.type === 'date' ? 'date' : 'text'}
                value={condition.value?.[1] || ''}
                onChange={(e) => onChange({
                  ...condition,
                  value: [condition.value?.[0], e.target.value]
                })}
                placeholder="Max value"
                className="min-w-[180px]"
              />
            </>
          )}
        </>
      )}

      {/* Remove Button */}
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="ml-auto opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4 text-status-error" />
        </Button>
      )}
    </div>
  );
};

interface QueryGroupComponentProps {
  group: QueryGroup;
  fields: QueryField[];
  onChange: (group: QueryGroup) => void;
  onRemove?: () => void;
  depth?: number;
  maxDepth?: number;
}

const QueryGroupComponent: React.FC<QueryGroupComponentProps> = ({
  group,
  fields,
  onChange,
  onRemove,
  depth = 0,
  maxDepth = 3,
}) => {
  const handleCombinatorChange = (combinator: 'AND' | 'OR') => {
    onChange({ ...group, combinator });
  };

  const handleConditionChange = (index: number, condition: QueryCondition) => {
    const newConditions = [...group.conditions];
    newConditions[index] = condition;
    onChange({ ...group, conditions: newConditions });
  };

  const handleConditionRemove = (index: number) => {
    if (group.conditions.length === 1 && group.groups.length === 0) return;
    const newConditions = group.conditions.filter((_, i) => i !== index);
    onChange({ ...group, conditions: newConditions });
  };

  const handleAddCondition = () => {
    onChange({
      ...group,
      conditions: [...group.conditions, createEmptyCondition()],
    });
  };

  const handleAddGroup = () => {
    onChange({
      ...group,
      groups: [...group.groups, createEmptyGroup()],
    });
  };

  const handleGroupChange = (index: number, subGroup: QueryGroup) => {
    const newGroups = [...group.groups];
    newGroups[index] = subGroup;
    onChange({ ...group, groups: newGroups });
  };

  const handleGroupRemove = (index: number) => {
    const newGroups = group.groups.filter((_, i) => i !== index);
    onChange({ ...group, groups: newGroups });
  };

  const canRemoveCondition = group.conditions.length > 1 || group.groups.length > 0;
  const canAddGroup = depth < maxDepth;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 border-dashed',
        depth === 0 ? 'border-accent-primary bg-accent-primary/5' : 'border-border-base bg-surface-base'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary uppercase">Match</span>
          <Select
            value={group.combinator}
            onValueChange={(value) => handleCombinatorChange(value as 'AND' | 'OR')}
            options={[
              { label: 'ALL', value: 'AND' },
              { label: 'ANY', value: 'OR' },
            ]}
            size="sm"
            className="w-24"
          />
          <span className="text-xs text-text-secondary">of the following:</span>
        </div>

        {onRemove && depth > 0 && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="w-4 h-4 text-status-error" />
            Remove Group
          </Button>
        )}
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        {group.conditions.map((condition, index) => (
          <ConditionRow
            key={condition.id}
            condition={condition}
            fields={fields}
            onChange={(c) => handleConditionChange(index, c)}
            onRemove={() => handleConditionRemove(index)}
            canRemove={canRemoveCondition}
          />
        ))}

        {/* Nested Groups */}
        {group.groups.map((subGroup, index) => (
          <QueryGroupComponent
            key={subGroup.id}
            group={subGroup}
            fields={fields}
            onChange={(g) => handleGroupChange(index, g)}
            onRemove={() => handleGroupRemove(index)}
            depth={depth + 1}
            maxDepth={maxDepth}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={handleAddCondition}>
          <Plus className="w-4 h-4" />
          Add Condition
        </Button>

        {canAddGroup && (
          <Button variant="outline" size="sm" onClick={handleAddGroup}>
            <Plus className="w-4 h-4" />
            Add Group
          </Button>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface QueryBuilderProps {
  fields: QueryField[];
  query?: Query;
  onChange?: (query: Query) => void;
  maxDepth?: number;
  className?: string;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  fields,
  query: externalQuery,
  onChange,
  maxDepth = 3,
  className,
}) => {
  const [internalQuery, setInternalQuery] = React.useState<Query>({
    root: createEmptyGroup(),
  });

  const query = externalQuery || internalQuery;
  const setQuery = onChange
    ? (q: Query) => onChange(q)
    : setInternalQuery;

  const handleRootChange = (root: QueryGroup) => {
    setQuery({ root });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <QueryGroupComponent
        group={query.root}
        fields={fields}
        onChange={handleRootChange}
        maxDepth={maxDepth}
      />
    </div>
  );
};

QueryBuilder.displayName = 'QueryBuilder';

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const queryToSQL = (query: Query, tableName: string): string => {
  const buildCondition = (condition: QueryCondition): string => {
    const { field, operator, value } = condition;

    switch (operator) {
      case 'equals':
        return `${field} = '${value}'`;
      case 'not_equals':
        return `${field} != '${value}'`;
      case 'contains':
        return `${field} LIKE '%${value}%'`;
      case 'not_contains':
        return `${field} NOT LIKE '%${value}%'`;
      case 'starts_with':
        return `${field} LIKE '${value}%'`;
      case 'ends_with':
        return `${field} LIKE '%${value}'`;
      case 'gt':
        return `${field} > ${value}`;
      case 'gte':
        return `${field} >= ${value}`;
      case 'lt':
        return `${field} < ${value}`;
      case 'lte':
        return `${field} <= ${value}`;
      case 'between':
        return `${field} BETWEEN ${value[0]} AND ${value[1]}`;
      case 'in':
        return `${field} IN (${Array.isArray(value) ? value.map(v => `'${v}'`).join(',') : `'${value}'`})`;
      case 'not_in':
        return `${field} NOT IN (${Array.isArray(value) ? value.map(v => `'${v}'`).join(',') : `'${value}'`})`;
      case 'is_null':
        return `${field} IS NULL`;
      case 'is_not_null':
        return `${field} IS NOT NULL`;
      default:
        return '';
    }
  };

  const buildGroup = (group: QueryGroup): string => {
    const conditions = group.conditions
      .filter(c => c.field)
      .map(buildCondition);

    const groups = group.groups.map(buildGroup);

    const all = [...conditions, ...groups].filter(Boolean);

    if (all.length === 0) return '';
    if (all.length === 1) return all[0] || '';

    return `(${all.join(` ${group.combinator} `)})`;
  };

  const whereClause = buildGroup(query.root);
  return whereClause
    ? `SELECT * FROM ${tableName} WHERE ${whereClause}`
    : `SELECT * FROM ${tableName}`;
};

export const queryToJSON = (query: Query): string => {
  return JSON.stringify(query, null, 2);
};
