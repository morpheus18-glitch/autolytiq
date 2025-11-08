/**
 * ListCard - Vertical List Display Pattern
 *
 * Use for displaying lists of items in cards.
 * Examples: Active Deals, Hot Leads, Recent Activities, Pending Tasks
 */

import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { CardShell, CardHeader, type CardShellProps } from './CardShell.js';
import { Stack } from '../../primitives/Stack.js';
import { ScrollArea } from '../../components/ScrollArea.js';
import { EmptyState } from '../../components/EmptyState.js';

export interface ListItem {
  id: string | number;
  /**
   * Primary text (required)
   */
  primary: string;
  /**
   * Secondary text (optional)
   */
  secondary?: string;
  /**
   * Tertiary text (optional, e.g., timestamp)
   */
  tertiary?: string;
  /**
   * Icon element (optional)
   */
  icon?: React.ReactNode;
  /**
   * Action element (optional, e.g., button, badge)
   */
  action?: React.ReactNode;
  /**
   * Click handler (optional)
   */
  onClick?: () => void;
  /**
   * Metadata for custom rendering
   */
  metadata?: Record<string, any>;
}

export interface ListCardProps extends Omit<CardShellProps, 'children'> {
  /**
   * List items to display
   */
  items: ListItem[];
  /**
   * Empty state message
   */
  emptyMessage?: string;
  /**
   * Maximum height (enables scrolling)
   */
  maxHeight?: number | string;
  /**
   * Custom render function for items
   */
  renderItem?: (item: ListItem, index: number) => React.ReactNode;
  /**
   * Icon for card header (optional)
   */
  icon?: React.ReactNode;
  /**
   * Action button for card header (optional)
   */
  action?: React.ReactNode;
}

/**
 * Default list item renderer
 */
const DefaultListItem = ({
  item,
  onClick,
}: {
  item: ListItem;
  onClick?: () => void;
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 rounded-md border border-slate-200 dark:border-gray-700',
        'hover:border-blue-300 dark:hover:border-blue-600 transition-colors',
        isClickable && 'cursor-pointer active:scale-[0.99]'
      )}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        {item.icon && <div className="flex-shrink-0 mt-0.5">{item.icon}</div>}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {item.primary}
          </p>
          {item.secondary && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
              {item.secondary}
            </p>
          )}
          {item.tertiary && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {item.tertiary}
            </p>
          )}
        </div>
        {item.action && <div className="flex-shrink-0">{item.action}</div>}
      </div>
    </div>
  );
};

/**
 * ListCard Component
 *
 * Display a scrollable list of items with consistent styling.
 *
 * @example
 * <ListCard
 *   title="Active Deals"
 *   description="Deals currently in progress"
 *   items={deals}
 *   emptyMessage="No active deals"
 *   maxHeight={400}
 *   priority="high"
 * />
 */
export const ListCard = React.forwardRef<HTMLElement, ListCardProps>(
  (
    {
      className,
      title,
      description,
      items,
      emptyMessage = 'No items to display',
      maxHeight,
      renderItem,
      icon,
      action,
      size = 'MEDIUM',
      ...shellProps
    },
    ref
  ) => {
    const hasItems = items.length > 0;

    return (
      <CardShell
        ref={ref}
        className={cn('', className)}
        title={title}
        description={description}
        size={size}
        {...shellProps}
      >
        <Stack gap="md" className="h-full">
          {/* Header */}
          {title && (
            <CardHeader
              title={title}
              description={description}
              icon={icon}
              action={action}
            />
          )}

          {/* List Content */}
          <div className="flex-1 min-h-0">
            {hasItems ? (
              <ScrollArea
                className="h-full"
                style={{ maxHeight: maxHeight || 'none' }}
              >
                <Stack gap="sm">
                  {items.map((item, index) =>
                    renderItem ? (
                      <React.Fragment key={item.id}>{renderItem(item, index)}</React.Fragment>
                    ) : (
                      <DefaultListItem key={item.id} item={item} onClick={item.onClick} />
                    )
                  )}
                </Stack>
              </ScrollArea>
            ) : (
              <EmptyState
                title="No items"
                description={emptyMessage}
                className="py-8"
              />
            )}
          </div>
        </Stack>
      </CardShell>
    );
  }
);

ListCard.displayName = 'ListCard';
