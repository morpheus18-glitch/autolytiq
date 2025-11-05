import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

const accordionVariants = cva('divide-y divide-border-base', {
  variants: {
    variant: {
      default: 'border border-border-base rounded-lg',
      ghost: '',
      separated: 'space-y-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: '',
      ghost: '',
      separated: 'border border-border-base rounded-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionTriggerVariants = cva(
  'flex w-full items-center justify-between py-4 px-4 font-medium transition-all hover:bg-surface-subtle',
  {
    variants: {
      variant: {
        default: '',
        ghost: 'px-0',
        separated: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const accordionContentVariants = cva('overflow-hidden transition-all duration-300', {
  variants: {
    state: {
      open: 'max-h-[1000px] opacity-100',
      closed: 'max-h-0 opacity-0',
    },
  },
  defaultVariants: {
    state: 'closed',
  },
});

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface AccordionProps extends VariantProps<typeof accordionVariants> {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  collapsible?: boolean;
}

const Accordion = ({
  items,
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  variant = 'default',
  className,
  collapsible = true,
}: AccordionProps) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
    defaultValue || (type === 'multiple' ? [] : '')
  );

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const setValue = onValueChange || setUncontrolledValue;

  const isOpen = (itemId: string) => {
    if (type === 'multiple') {
      return Array.isArray(value) && value.includes(itemId);
    }
    return value === itemId;
  };

  const handleToggle = (itemId: string, disabled?: boolean) => {
    if (disabled) return;

    if (type === 'multiple') {
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.includes(itemId)) {
        setValue(currentValue.filter((id) => id !== itemId));
      } else {
        setValue([...currentValue, itemId]);
      }
    } else {
      if (value === itemId && collapsible) {
        setValue('');
      } else {
        setValue(itemId);
      }
    }
  };

  return (
    <div className={accordionVariants({ variant, className })}>
      {items.map((item) => {
        const open = isOpen(item.id);
        return (
          <div key={item.id} className={accordionItemVariants({ variant })}>
            <button
              type="button"
              onClick={() => handleToggle(item.id, item.disabled)}
              disabled={item.disabled}
              className={`${accordionTriggerVariants({ variant })} ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-expanded={open}
              aria-controls={`accordion-content-${item.id}`}
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <span className="flex-shrink-0 text-text-secondary">
                    {item.icon}
                  </span>
                )}
                <span className="text-left text-text-primary">{item.title}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              id={`accordion-content-${item.id}`}
              className={accordionContentVariants({ state: open ? 'open' : 'closed' })}
            >
              <div className="px-4 pb-4 pt-0 text-sm text-text-secondary">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

Accordion.displayName = 'Accordion';

export { Accordion, accordionVariants };
