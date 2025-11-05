import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronRight } from 'lucide-react';

const dropdownContentVariants = cva(
  'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-border-base bg-surface-base p-1 shadow-lg transition-all duration-150',
  {
    variants: {
      align: {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
      },
      side: {
        top: 'bottom-full mb-1',
        bottom: 'top-full mt-1',
        left: 'right-full mr-1',
        right: 'left-full ml-1',
      },
      state: {
        open: 'opacity-100 scale-100',
        closed: 'opacity-0 scale-95 pointer-events-none',
      },
    },
    defaultVariants: {
      align: 'start',
      side: 'bottom',
      state: 'closed',
    },
  }
);

const dropdownItemVariants = cva(
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
  {
    variants: {
      variant: {
        default: 'hover:bg-surface-subtle focus:bg-surface-subtle',
        destructive:
          'text-status-error hover:bg-status-error/10 focus:bg-status-error/10',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      disabled: false,
    },
  }
);

export interface DropdownItem {
  label: React.ReactNode;
  value?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  submenu?: DropdownItem[];
  onSelect?: () => void;
}

export interface DropdownProps extends VariantProps<typeof dropdownContentVariants> {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onItemSelect?: (value?: string) => void;
  className?: string;
  modal?: boolean;
}

const Dropdown = ({
  trigger,
  items,
  onItemSelect,
  align = 'start',
  side = 'bottom',
  className,
  modal = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeSubmenu, setActiveSubmenu] = React.useState<number | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const state = isOpen ? 'open' : 'closed';

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    if (item.submenu) return;

    item.onSelect?.();
    onItemSelect?.(item.value);
    setIsOpen(false);
    setActiveSubmenu(null);
  };

  const renderItem = (item: DropdownItem, index: number) => {
    if (item.separator) {
      return <div key={index} className="h-px my-1 bg-border-base" />;
    }

    const hasSubmenu = !!item.submenu;

    return (
      <div
        key={index}
        className="relative"
        onMouseEnter={() => hasSubmenu && setActiveSubmenu(index)}
      >
        <div
          className={dropdownItemVariants({
            variant: item.destructive ? 'destructive' : 'default',
            disabled: item.disabled,
          })}
          onClick={() => handleItemClick(item)}
        >
          {item.icon && (
            <span className="mr-2 flex h-4 w-4 items-center justify-center">
              {item.icon}
            </span>
          )}
          <span className="flex-1">{item.label}</span>
          {item.shortcut && (
            <span className="ml-auto text-xs text-text-secondary">
              {item.shortcut}
            </span>
          )}
          {hasSubmenu && <ChevronRight className="ml-auto h-4 w-4" />}
        </div>

        {hasSubmenu && activeSubmenu === index && (
          <div
            className={dropdownContentVariants({
              align: 'start',
              side: 'right',
              state: 'open',
            })}
          >
            {item.submenu!.map((subItem, subIndex) =>
              renderItem(subItem, subIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {(isOpen || state === 'open') && (
        <>
          {modal && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
          <div
            className={dropdownContentVariants({ align, side, state, className })}
          >
            {items.map((item, index) => renderItem(item, index))}
          </div>
        </>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';

export { Dropdown, dropdownContentVariants, dropdownItemVariants };
