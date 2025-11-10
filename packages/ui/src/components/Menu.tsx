/**
 * Menu - Dropdown menu with items and groups
 *
 * Complete menu system with items, sub-menus, separators, and groups.
 *
 * Features:
 * - Menu items with icons and shortcuts
 * - Sub-menus (nested menus)
 * - Item groups with labels
 * - Separators
 * - Disabled items
 * - Checkbox items
 * - Radio groups
 *
 * Perfect for: Context menus, dropdown actions, command palettes
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';
import { Check, ChevronRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  type?: 'item' | 'checkbox' | 'radio';
  checked?: boolean;
  subMenu?: MenuItem[];
}

export interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

export interface MenuProps {
  items?: MenuItem[];
  groups?: MenuGroup[];
  onItemClick?: (item: MenuItem) => void;
  className?: string;
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ items, groups, onItemClick, className }, ref) => {
    if (groups) {
      return (
        <div
          ref={ref}
          className={cn(
            'min-w-[200px] rounded-lg border border-border-base bg-surface-elevated py-1 shadow-lg',
            className
          )}
        >
          {groups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {groupIndex > 0 && <MenuSeparator />}
              {group.label && (
                <div className="px-3 py-1.5 text-xs font-medium text-text-tertiary uppercase">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => (
                <MenuItemComponent key={item.id} item={item} onItemClick={onItemClick} />
              ))}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'min-w-[200px] rounded-lg border border-border-base bg-surface-elevated py-1 shadow-lg',
          className
        )}
      >
        {items?.map((item) => (
          <MenuItemComponent key={item.id} item={item} onItemClick={onItemClick} />
        ))}
      </div>
    );
  }
);

Menu.displayName = 'Menu';

// ═══════════════════════════════════════════════════════════════
// MENU ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════

interface MenuItemComponentProps {
  item: MenuItem;
  onItemClick?: (item: MenuItem) => void;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({ item, onItemClick }) => {
  const [showSubMenu, setShowSubMenu] = React.useState(false);

  const handleClick = () => {
    if (item.disabled) return;

    if (item.onClick) {
      item.onClick();
    }

    if (onItemClick) {
      onItemClick(item);
    }
  };

  const itemContent = (
    <>
      <div className="flex items-center gap-2 flex-1">
        {item.type === 'checkbox' && (
          <div className="w-4 h-4 flex items-center justify-center">
            {item.checked && <Check className="w-3.5 h-3.5" />}
          </div>
        )}
        {item.type === 'radio' && (
          <div className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
            item.checked ? "border-accent-primary" : "border-border-base"
          )}>
            {item.checked && <div className="w-2 h-2 rounded-full bg-accent-primary" />}
          </div>
        )}
        {item.icon && <span className="text-text-secondary">{item.icon}</span>}
        <span className="text-sm">{item.label}</span>
      </div>
      {item.shortcut && (
        <span className="text-xs text-text-tertiary">{item.shortcut}</span>
      )}
      {item.subMenu && <ChevronRight className="w-4 h-4 text-text-tertiary" />}
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className={cn(
          'flex items-center justify-between px-3 py-2 text-text-primary transition-colors',
          item.disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-surface-subtle'
        )}
        onClick={(e) => {
          if (item.disabled) {
            e.preventDefault();
          }
        }}
      >
        {itemContent}
      </a>
    );
  }

  const menuItem = (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 text-text-primary transition-colors relative',
        item.disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:bg-surface-subtle'
      )}
      onClick={handleClick}
      onMouseEnter={() => item.subMenu && setShowSubMenu(true)}
      onMouseLeave={() => item.subMenu && setShowSubMenu(false)}
    >
      {itemContent}

      {item.subMenu && showSubMenu && (
        <div className="absolute left-full top-0 ml-1">
          <Menu items={item.subMenu} onItemClick={onItemClick} />
        </div>
      )}
    </div>
  );

  return menuItem;
};

// ═══════════════════════════════════════════════════════════════
// MENU SEPARATOR
// ═══════════════════════════════════════════════════════════════

export const MenuSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('my-1 h-px bg-border-base', className)} role="separator" />;
};

MenuSeparator.displayName = 'MenuSeparator';
