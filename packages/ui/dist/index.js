import * as React30 from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { Check, Minus, AlertCircle, CheckCircle, Info, X, ChevronRight, TrendingDown, TrendingUp, Filter, Play, Pause, Download, ChevronDown, RefreshCw, Save, Loader2, Printer, Upload, Eye, Unlock, XCircle, Clock, User, MessageSquare, FileText, AlertTriangle, Settings, Plus, GripVertical, ChevronLeft, ChevronUp, FileSpreadsheet, FileJson, ChevronsUpDown, Lock, Users, WifiOff, Wifi, LayoutDashboard, Trash2, DollarSign, Calendar, Bell, Car, Target } from 'lucide-react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-smooth focus-ring disabled:disabled",
  {
    variants: {
      variant: {
        primary: "bg-accent-primary text-text-inverse hover:bg-accent-primary-hover active:scale-[0.98]",
        secondary: "bg-accent-secondary text-text-inverse hover:bg-accent-secondary-hover active:scale-[0.98]",
        outline: "border-2 border-border-base bg-surface-base hover:bg-surface-subtle active:scale-[0.98]",
        ghost: "hover:bg-surface-subtle active:bg-surface-muted active:scale-[0.98]",
        danger: "bg-status-error text-text-inverse hover:opacity-90 active:scale-[0.98]",
        success: "bg-status-success text-text-inverse hover:opacity-90 active:scale-[0.98]"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10"
      },
      fullWidth: {
        true: "w-full"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);
var Button = React30.forwardRef(
  ({
    className,
    variant,
    size,
    fullWidth,
    asChild = false,
    loading = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxs(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, fullWidth, className })),
        ref,
        disabled: disabled || loading,
        ...props,
        children: [
          loading && /* @__PURE__ */ jsxs(
            "svg",
            {
              className: "animate-spin h-4 w-4",
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              children: [
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    className: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    strokeWidth: "4"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "path",
                  {
                    className: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  }
                )
              ]
            }
          ),
          children
        ]
      }
    );
  }
);
Button.displayName = "Button";
var iconButtonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent-primary text-white hover:bg-accent-primary/90",
        ghost: "hover:bg-surface-subtle hover:text-text-primary",
        outline: "border border-border-base bg-transparent hover:bg-surface-subtle hover:text-text-primary",
        subtle: "bg-surface-subtle text-text-primary hover:bg-surface-muted",
        danger: "bg-status-error text-white hover:bg-status-error/90"
      },
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-14 w-14"
      },
      shape: {
        square: "rounded-md",
        rounded: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
      shape: "square"
    }
  }
);
var IconButton = React30.forwardRef(
  ({ icon, loading, variant, size, shape, className, disabled, ...props }, ref) => {
    const iconSize = size === "xs" ? "w-3 h-3" : size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : size === "xl" ? "w-7 h-7" : "w-5 h-5";
    return /* @__PURE__ */ jsx(
      "button",
      {
        ref,
        className: cn(iconButtonVariants({ variant, size, shape }), className),
        disabled: disabled || loading,
        ...props,
        children: loading ? /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "animate-spin rounded-full border-2 border-current border-t-transparent",
              iconSize
            )
          }
        ) : /* @__PURE__ */ jsx("span", { className: cn("flex items-center justify-center", iconSize), children: icon })
      }
    );
  }
);
IconButton.displayName = "IconButton";
var inputVariants = cva(
  "w-full rounded-md border bg-surface-base text-sm transition-smooth placeholder:text-text-placeholder focus-ring disabled:disabled",
  {
    variants: {
      variant: {
        default: "border-border-base",
        error: "border-status-error focus-visible:ring-status-error",
        success: "border-status-success focus-visible:ring-status-success"
      },
      size: {
        sm: "h-8 px-2.5 py-1 text-xs",
        md: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
var Input = React30.forwardRef(
  ({
    className,
    variant,
    size,
    error,
    success,
    leftIcon,
    rightIcon,
    type = "text",
    ...props
  }, ref) => {
    const computedVariant = error ? "error" : success ? "success" : variant;
    if (leftIcon || rightIcon) {
      return /* @__PURE__ */ jsxs("div", { className: "relative w-full", children: [
        leftIcon && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary", children: leftIcon }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type,
            className: cn(
              inputVariants({ variant: computedVariant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            ),
            ref,
            ...props
          }
        ),
        rightIcon && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary", children: rightIcon })
      ] });
    }
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(inputVariants({ variant: computedVariant, size }), className),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
var selectVariants = cva(
  "w-full rounded-md border bg-surface-base text-text-primary transition-smooth focus-ring disabled:disabled",
  {
    variants: {
      variant: {
        default: "border-border-base",
        error: "border-status-error focus-visible:ring-status-error",
        success: "border-status-success focus-visible:ring-status-success"
      },
      size: {
        sm: "h-8 px-2.5 py-1 text-xs",
        md: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
var Select = React30.forwardRef(function Select2({
  className,
  variant,
  size,
  error,
  success,
  options,
  placeholder,
  onValueChange,
  defaultValue,
  value,
  children,
  ...rest
}, ref) {
  const computedVariant = error ? "error" : success ? "success" : variant;
  const handleChange = (e) => {
    onValueChange?.(e.target.value);
  };
  return /* @__PURE__ */ jsxs(
    "select",
    {
      ref,
      className: cn(selectVariants({ variant: computedVariant, size }), className),
      onChange: handleChange,
      value,
      defaultValue,
      ...rest,
      children: [
        placeholder && /* @__PURE__ */ jsx("option", { value: "", disabled: true, hidden: true, children: placeholder }),
        options?.map((o) => /* @__PURE__ */ jsx("option", { value: o.value, disabled: o.disabled, children: o.label }, o.value)),
        children
      ]
    }
  );
});
var checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-border-base ring-offset-surface-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-accent-primary data-[state=checked]:text-text-inverse data-[state=checked]:border-accent-primary",
        error: "border-status-error data-[state=checked]:bg-status-error data-[state=checked]:text-text-inverse data-[state=checked]:border-status-error",
        success: "border-status-success data-[state=checked]:bg-status-success data-[state=checked]:text-text-inverse data-[state=checked]:border-status-success"
      },
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
var Checkbox = React30.forwardRef(
  ({
    className,
    variant,
    size,
    error,
    label,
    indeterminate = false,
    checked,
    onChange,
    onCheckedChange,
    ...props
  }, ref) => {
    const computedVariant = error ? "error" : variant;
    const inputRef = React30.useRef(null);
    React30.useImperativeHandle(ref, () => inputRef.current);
    React30.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);
    const handleChange = (e) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };
    const iconSize = size === "sm" ? 10 : size === "lg" ? 16 : 12;
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative inline-flex items-center justify-center", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            className: checkboxVariants({ variant: computedVariant, size, className }),
            ref: inputRef,
            checked,
            onChange: handleChange,
            "data-state": checked ? "checked" : "unchecked",
            ...props
          }
        ),
        checked && !indeterminate && /* @__PURE__ */ jsx(
          Check,
          {
            className: "absolute pointer-events-none text-current",
            size: iconSize
          }
        ),
        indeterminate && /* @__PURE__ */ jsx(
          Minus,
          {
            className: "absolute pointer-events-none text-current",
            size: iconSize
          }
        )
      ] }),
      label && /* @__PURE__ */ jsx(
        "label",
        {
          className: "text-sm font-medium text-text-primary cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          onClick: () => inputRef.current?.click(),
          children: label
        }
      )
    ] });
  }
);
Checkbox.displayName = "Checkbox";
var radioVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-full border border-border-base ring-offset-surface-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:border-accent-primary data-[state=checked]:border-[5px]",
        error: "border-status-error data-[state=checked]:border-status-error data-[state=checked]:border-[5px]",
        success: "border-status-success data-[state=checked]:border-status-success data-[state=checked]:border-[5px]"
      },
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
var Radio = React30.forwardRef(
  ({ className, variant, size, error, label, ...props }, ref) => {
    const computedVariant = error ? "error" : variant;
    const inputRef = React30.useRef(null);
    React30.useImperativeHandle(ref, () => inputRef.current);
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "radio",
          className: radioVariants({ variant: computedVariant, size, className }),
          ref: inputRef,
          "data-state": props.checked ? "checked" : "unchecked",
          ...props
        }
      ),
      label && /* @__PURE__ */ jsx(
        "label",
        {
          className: "text-sm font-medium text-text-primary cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          onClick: () => inputRef.current?.click(),
          children: label
        }
      )
    ] });
  }
);
Radio.displayName = "Radio";
var RadioGroup = ({
  name,
  value,
  defaultValue,
  onValueChange,
  children,
  className
}) => {
  const [selectedValue, setSelectedValue] = React30.useState(defaultValue || "");
  const currentValue = value !== void 0 ? value : selectedValue;
  const handleChange = (newValue) => {
    if (value === void 0) {
      setSelectedValue(newValue);
    }
    onValueChange?.(newValue);
  };
  return /* @__PURE__ */ jsx("div", { className, role: "radiogroup", children: React30.Children.map(children, (child) => {
    if (React30.isValidElement(child) && child.type === Radio) {
      return React30.cloneElement(child, {
        name,
        checked: currentValue === child.props.value,
        onChange: () => handleChange(child.props.value)
      });
    }
    return child;
  }) });
};
RadioGroup.displayName = "RadioGroup";
var RadioGroupItem = Radio;
var switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-accent-primary data-[state=unchecked]:bg-neutral-200",
        error: "data-[state=checked]:bg-status-error data-[state=unchecked]:bg-neutral-200",
        success: "data-[state=checked]:bg-status-success data-[state=unchecked]:bg-neutral-200"
      },
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
var switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        lg: "h-6 w-6 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var Switch = React30.forwardRef(
  ({
    className,
    variant,
    size,
    error,
    label,
    checked,
    onChange,
    onCheckedChange,
    ...props
  }, ref) => {
    const computedVariant = error ? "error" : variant;
    const inputRef = React30.useRef(null);
    React30.useImperativeHandle(ref, () => inputRef.current);
    const handleChange = (e) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            className: "sr-only",
            ref: inputRef,
            checked,
            onChange: handleChange,
            ...props
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: switchVariants({ variant: computedVariant, size, className }),
            "data-state": checked ? "checked" : "unchecked",
            children: /* @__PURE__ */ jsx(
              "span",
              {
                className: switchThumbVariants({ size }),
                "data-state": checked ? "checked" : "unchecked"
              }
            )
          }
        )
      ] }),
      label && /* @__PURE__ */ jsx(
        "label",
        {
          className: "text-sm font-medium text-text-primary cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          onClick: () => inputRef.current?.click(),
          children: label
        }
      )
    ] });
  }
);
Switch.displayName = "Switch";
var labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-text-primary",
        error: "text-status-error",
        success: "text-status-success",
        muted: "text-text-secondary"
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
      },
      required: {
        true: 'after:content-["*"] after:ml-0.5 after:text-status-error',
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      required: false
    }
  }
);
var Label = React30.forwardRef(
  ({ className, variant, size, error, required, children, ...props }, ref) => {
    const computedVariant = error ? "error" : variant;
    return /* @__PURE__ */ jsx(
      "label",
      {
        ref,
        className: labelVariants({
          variant: computedVariant,
          size,
          required,
          className
        }),
        ...props,
        children
      }
    );
  }
);
Label.displayName = "Label";
var formFieldVariants = cva("flex flex-col gap-1.5", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-center gap-4"
    }
  },
  defaultVariants: {
    orientation: "vertical"
  }
});
var formDescriptionVariants = cva("text-xs", {
  variants: {
    variant: {
      default: "text-text-secondary",
      error: "text-status-error",
      success: "text-status-success",
      info: "text-accent-info"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
var FormField = React30.forwardRef(
  ({
    className,
    orientation,
    label,
    description,
    error,
    success,
    required,
    htmlFor,
    showIcon = true,
    children,
    ...props
  }, ref) => {
    const hasError = !!error;
    const hasSuccess = !!success;
    const hasDescription = !!description;
    const descriptionVariant = hasError ? "error" : hasSuccess ? "success" : hasDescription ? "info" : "default";
    const message = error || success || description;
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: formFieldVariants({ orientation, className }),
        ...props,
        children: [
          label && /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor,
              className: `text-sm font-medium ${hasError ? "text-status-error" : hasSuccess ? "text-status-success" : "text-text-primary"} ${required ? 'after:content-["*"] after:ml-0.5 after:text-status-error' : ""}`,
              children: label
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex-1", children }),
          message && /* @__PURE__ */ jsxs(
            "div",
            {
              className: `flex items-start gap-1.5 ${formDescriptionVariants({
                variant: descriptionVariant
              })}`,
              children: [
                showIcon && /* @__PURE__ */ jsxs("span", { className: "mt-0.5 flex-shrink-0", children: [
                  hasError && /* @__PURE__ */ jsx(AlertCircle, { className: "w-3.5 h-3.5" }),
                  hasSuccess && /* @__PURE__ */ jsx(CheckCircle, { className: "w-3.5 h-3.5" }),
                  hasDescription && !hasError && !hasSuccess && /* @__PURE__ */ jsx(Info, { className: "w-3.5 h-3.5" })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "flex-1", children: message })
              ]
            }
          )
        ]
      }
    );
  }
);
FormField.displayName = "FormField";
var tableVariants = cva("w-full caption-bottom text-sm", {
  variants: {
    variant: {
      default: "",
      striped: "[&_tbody_tr:nth-child(odd)]:bg-surface-subtle",
      bordered: "border border-border-base"
    },
    density: {
      compact: "[&_td]:py-2 [&_th]:py-2",
      normal: "[&_td]:py-3 [&_th]:py-3",
      comfortable: "[&_td]:py-4 [&_th]:py-4"
    }
  },
  defaultVariants: {
    variant: "default",
    density: "normal"
  }
});
var Table = React30.forwardRef(
  ({ className, variant, density, ...props }, ref) => /* @__PURE__ */ jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsx(
    "table",
    {
      ref,
      className: tableVariants({ variant, density, className }),
      ...props
    }
  ) })
);
Table.displayName = "Table";
var TableHeader = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "thead",
  {
    ref,
    className: `border-b border-border-base ${className || ""}`,
    ...props
  }
));
TableHeader.displayName = "TableHeader";
var TableBody = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("tbody", { ref, className: `[&_tr:last-child]:border-0 ${className || ""}`, ...props }));
TableBody.displayName = "TableBody";
var TableFooter = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "tfoot",
  {
    ref,
    className: `border-t border-border-base bg-surface-subtle font-medium ${className || ""}`,
    ...props
  }
));
TableFooter.displayName = "TableFooter";
var TableRow = React30.forwardRef(({ className, clickable, ...props }, ref) => /* @__PURE__ */ jsx(
  "tr",
  {
    ref,
    className: `border-b border-border-base transition-colors ${clickable ? "cursor-pointer hover:bg-surface-subtle data-[state=selected]:bg-surface-subtle" : "data-[state=selected]:bg-surface-subtle"} ${className || ""}`,
    ...props
  }
));
TableRow.displayName = "TableRow";
var TableHead = React30.forwardRef(({ className, sortable, children, ...props }, ref) => /* @__PURE__ */ jsx(
  "th",
  {
    ref,
    className: `h-12 px-4 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0 ${sortable ? "cursor-pointer hover:text-text-primary" : ""} ${className || ""}`,
    ...props,
    children: sortable ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      children,
      /* @__PURE__ */ jsx("span", { className: "text-xs opacity-50", children: "\u21C5" })
    ] }) : children
  }
));
TableHead.displayName = "TableHead";
var TableCell = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "td",
  {
    ref,
    className: `px-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ""}`,
    ...props
  }
));
TableCell.displayName = "TableCell";
var TableCaption = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "caption",
  {
    ref,
    className: `mt-4 text-sm text-text-secondary ${className || ""}`,
    ...props
  }
));
TableCaption.displayName = "TableCaption";
var cardVariants = cva(
  "rounded-2xl bg-surface-elevated text-text-primary",
  {
    variants: {
      variant: {
        default: "shadow-none border-0",
        elevated: "shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-0",
        outlined: "border border-border-base/30 shadow-none",
        ghost: "border-0 shadow-none bg-transparent"
      },
      interactive: {
        true: "cursor-pointer active:scale-[0.98] active:opacity-90 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
        false: ""
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-4",
        lg: "p-6"
      }
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
      padding: "md"
    }
  }
);
var Card = React30.forwardRef(
  ({ className, variant, interactive, padding, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn(cardVariants({ variant, interactive, padding }), className),
      ...props
    }
  )
);
Card.displayName = "Card";
var CardHeader = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex flex-col gap-1.5 px-6 py-5", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
var CardTitle = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h3",
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight text-text-primary", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardDescription = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "p",
  {
    ref,
    className: cn("text-sm text-text-secondary", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
var CardContent = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("px-6 py-4", className), ...props }));
CardContent.displayName = "CardContent";
var CardFooter = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex items-center px-6 py-4 border-t border-border-muted", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";
var badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-smooth",
  {
    variants: {
      variant: {
        default: "bg-accent-primary/10 text-accent-primary border border-accent-primary/20",
        secondary: "bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20",
        success: "bg-status-success/10 text-status-success border border-status-success/20",
        error: "bg-status-error/10 text-status-error border border-status-error/20",
        warning: "bg-status-warning/10 text-status-warning border border-status-warning/20",
        info: "bg-accent-info/10 text-accent-info border border-accent-info/20",
        outline: "border-2 border-border-base bg-transparent",
        solid: "bg-surface-elevated text-text-primary border border-border-base"
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm"
      },
      rounded: {
        true: "rounded-full",
        false: "rounded-md"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      rounded: true
    }
  }
);
var Badge = React30.forwardRef(
  ({ className, variant, size, rounded, icon, onRemove, children, ...props }, ref) => {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: cn(badgeVariants({ variant, size, rounded, className })),
        ...props,
        children: [
          icon && /* @__PURE__ */ jsx("span", { className: "flex-shrink-0", children: icon }),
          /* @__PURE__ */ jsx("span", { children }),
          onRemove && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onRemove,
              className: "ml-0.5 flex-shrink-0 hover:opacity-70 transition-opacity",
              "aria-label": "Remove",
              children: /* @__PURE__ */ jsxs(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "12",
                  height: "12",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                    /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
                  ]
                }
              )
            }
          )
        ]
      }
    );
  }
);
Badge.displayName = "Badge";
var chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-subtle text-text-primary border border-border-base",
        primary: "bg-accent-primary/10 text-accent-primary border border-accent-primary/20",
        success: "bg-status-success/10 text-status-success border border-status-success/20",
        warning: "bg-status-warning/10 text-status-warning border border-status-warning/20",
        error: "bg-status-error/10 text-status-error border border-status-error/20",
        outlined: "bg-transparent text-text-primary border-2 border-border-base"
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base"
      },
      clickable: {
        true: "cursor-pointer hover:opacity-80 active:scale-95",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      clickable: false
    }
  }
);
var Chip = React30.forwardRef(
  ({
    label,
    avatar,
    icon,
    onRemove,
    onClick,
    disabled,
    variant,
    size,
    clickable,
    className,
    ...props
  }, ref) => {
    const isClickable = clickable || !!onClick;
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: cn(
          chipVariants({ variant, size, clickable: isClickable && !disabled }),
          disabled && "opacity-50 cursor-not-allowed",
          className
        ),
        onClick: disabled ? void 0 : onClick,
        role: onClick ? "button" : void 0,
        tabIndex: onClick && !disabled ? 0 : void 0,
        ...props,
        children: [
          avatar && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: avatar }),
          icon && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 text-current", children: icon }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: label }),
          onRemove && !disabled && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "flex-shrink-0 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors",
              onClick: (e) => {
                e.stopPropagation();
                onRemove();
              },
              "aria-label": "Remove",
              children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
            }
          )
        ]
      }
    );
  }
);
Chip.displayName = "Chip";
var ChipGroup = ({
  children,
  spacing = "md",
  wrap = true,
  className
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "flex items-center",
        wrap && "flex-wrap",
        spacing === "sm" && "gap-1",
        spacing === "md" && "gap-2",
        spacing === "lg" && "gap-3",
        className
      ),
      children
    }
  );
};
ChipGroup.displayName = "ChipGroup";
var avatarVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-subtle",
  {
    variants: {
      size: {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var Avatar = React30.forwardRef(
  ({ className, size, src, alt, fallback, ...props }, ref) => {
    const [error, setError] = React30.useState(false);
    const initials = fallback ? fallback.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: cn(avatarVariants({ size, className })),
        ...props,
        children: src && !error ? /* @__PURE__ */ jsx(
          "img",
          {
            src,
            alt: alt || fallback || "Avatar",
            className: "w-full h-full object-cover",
            onError: () => setError(true)
          }
        ) : /* @__PURE__ */ jsx("span", { className: "font-medium text-text-secondary", children: initials })
      }
    );
  }
);
Avatar.displayName = "Avatar";
var AvatarImage = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "img",
  {
    ref,
    className: `aspect-square h-full w-full object-cover ${className || ""}`,
    ...props
  }
));
AvatarImage.displayName = "AvatarImage";
var AvatarFallback = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: `flex h-full w-full items-center justify-center rounded-full bg-surface-subtle text-text-secondary ${className || ""}`,
    ...props
  }
));
AvatarFallback.displayName = "AvatarFallback";
var tooltipVariants = cva(
  "absolute z-50 px-3 py-1.5 text-xs font-medium rounded-md shadow-md pointer-events-none transition-opacity duration-150",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white",
        light: "bg-white text-neutral-900 border border-border-base",
        error: "bg-status-error text-white",
        success: "bg-status-success text-white",
        warning: "bg-status-warning text-white",
        info: "bg-accent-info text-white"
      },
      side: {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2"
      }
    },
    defaultVariants: {
      variant: "default",
      side: "top"
    }
  }
);
var tooltipArrowVariants = cva("absolute w-2 h-2 rotate-45", {
  variants: {
    variant: {
      default: "bg-neutral-900",
      light: "bg-white border border-border-base",
      error: "bg-status-error",
      success: "bg-status-success",
      warning: "bg-status-warning",
      info: "bg-accent-info"
    },
    side: {
      top: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
      bottom: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
      left: "left-full top-1/2 -translate-x-1/2 -translate-y-1/2",
      right: "right-full top-1/2 translate-x-1/2 -translate-y-1/2"
    }
  },
  defaultVariants: {
    variant: "default",
    side: "top"
  }
});
var Tooltip = ({
  content,
  children,
  variant = "default",
  side = "top",
  showArrow = true,
  delayDuration = 200,
  disabled = false,
  className
}) => {
  const [isVisible, setIsVisible] = React30.useState(false);
  const timeoutRef = React30.useRef();
  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayDuration);
  };
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  React30.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative inline-flex",
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      children: [
        children,
        isVisible && content && /* @__PURE__ */ jsxs(
          "div",
          {
            className: tooltipVariants({ variant, side, className }),
            style: { opacity: isVisible ? 1 : 0 },
            role: "tooltip",
            children: [
              content,
              showArrow && /* @__PURE__ */ jsx("div", { className: tooltipArrowVariants({ variant, side }) })
            ]
          }
        )
      ]
    }
  );
};
Tooltip.displayName = "Tooltip";
var alertVariants = cva(
  "relative w-full rounded-lg border p-4 transition-smooth",
  {
    variants: {
      variant: {
        default: "bg-surface-elevated border-border-base text-text-primary",
        success: "bg-status-success/10 border-status-success/20 text-status-success",
        error: "bg-status-error/10 border-status-error/20 text-status-error",
        warning: "bg-status-warning/10 border-status-warning/20 text-status-warning",
        info: "bg-accent-info/10 border-accent-info/20 text-accent-info"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var Alert = React30.forwardRef(
  ({ className, variant, icon, title, action, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: cn(alertVariants({ variant, className })),
        role: "alert",
        ...props,
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          icon && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 mt-0.5", children: icon }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            title && /* @__PURE__ */ jsx("h5", { className: "mb-1 font-bold text-sm leading-none tracking-tight", children: title }),
            /* @__PURE__ */ jsx("div", { className: "text-sm opacity-90", children })
          ] }),
          action && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: action })
        ] })
      }
    );
  }
);
Alert.displayName = "Alert";
var AlertTitle = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h5",
  {
    ref,
    className: `mb-1 font-medium leading-none tracking-tight ${className || ""}`,
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: `text-sm [&_p]:leading-relaxed ${className || ""}`,
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";
var progressVariants = cva("w-full overflow-hidden rounded-full bg-surface-subtle", {
  variants: {
    size: {
      sm: "h-1",
      md: "h-2",
      lg: "h-3"
    }
  },
  defaultVariants: {
    size: "md"
  }
});
var progressBarVariants = cva("h-full transition-all duration-300 rounded-full", {
  variants: {
    variant: {
      default: "bg-accent-primary",
      success: "bg-status-success",
      warning: "bg-status-warning",
      error: "bg-status-error"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
var Progress = React30.forwardRef(
  ({ className, size, variant, value, max = 100, showLabel, ...props }, ref) => {
    const percentage = Math.min(Math.max(value / max * 100, 0), 100);
    return /* @__PURE__ */ jsxs("div", { ref, className: "w-full", ...props, children: [
      showLabel && /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center mb-1", children: /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-text-secondary", children: [
        percentage.toFixed(0),
        "%"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: cn(progressVariants({ size, className })), children: /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(progressBarVariants({ variant })),
          style: { width: `${percentage}%` },
          role: "progressbar",
          "aria-valuenow": value,
          "aria-valuemin": 0,
          "aria-valuemax": max
        }
      ) })
    ] });
  }
);
Progress.displayName = "Progress";
var spinnerVariants = cva("inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent", {
  variants: {
    size: {
      xs: "h-3 w-3 border",
      sm: "h-4 w-4 border",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-2",
      xl: "h-12 w-12 border-4"
    },
    variant: {
      default: "text-accent-primary",
      primary: "text-accent-primary",
      secondary: "text-text-secondary",
      success: "text-status-success",
      warning: "text-status-warning",
      error: "text-status-error"
    },
    speed: {
      fast: "animate-spin-fast",
      normal: "animate-spin",
      slow: "animate-spin-slow"
    }
  },
  defaultVariants: {
    size: "md",
    variant: "default",
    speed: "normal"
  }
});
var Spinner = React30.forwardRef(
  ({ size, variant, speed, label, labelPosition = "bottom", className, ...props }, ref) => {
    const spinner = /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(spinnerVariants({ size, variant, speed }), className),
        role: "status",
        "aria-label": label || "Loading",
        ...props,
        children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: label || "Loading..." })
      }
    );
    if (!label) {
      return spinner;
    }
    const labelElement = /* @__PURE__ */ jsx("span", { className: "text-sm text-text-secondary", children: label });
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: cn(
          "flex items-center gap-2",
          labelPosition === "top" && "flex-col",
          labelPosition === "bottom" && "flex-col",
          labelPosition === "left" && "flex-row-reverse",
          labelPosition === "right" && "flex-row"
        ),
        children: [
          (labelPosition === "top" || labelPosition === "left") && labelElement,
          spinner,
          (labelPosition === "bottom" || labelPosition === "right") && labelElement
        ]
      }
    );
  }
);
Spinner.displayName = "Spinner";
var skeletonVariants = cva(
  "animate-pulse bg-surface-subtle rounded",
  {
    variants: {
      variant: {
        default: "bg-surface-subtle",
        text: "bg-surface-subtle h-4",
        circular: "rounded-full",
        rectangular: "rounded-md"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var Skeleton = React30.forwardRef(
  ({ className, variant, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: cn(skeletonVariants({ variant, className })),
        ...props
      }
    );
  }
);
Skeleton.displayName = "Skeleton";
var dividerVariants = cva("", {
  variants: {
    orientation: {
      horizontal: "w-full border-t",
      vertical: "h-full border-l"
    },
    thickness: {
      thin: "",
      base: "",
      thick: ""
    },
    spacing: {
      none: "",
      sm: "",
      md: "",
      lg: ""
    }
  },
  compoundVariants: [
    // Horizontal thickness
    {
      orientation: "horizontal",
      thickness: "thin",
      className: "border-t"
    },
    {
      orientation: "horizontal",
      thickness: "base",
      className: "border-t-2"
    },
    {
      orientation: "horizontal",
      thickness: "thick",
      className: "border-t-4"
    },
    // Vertical thickness
    {
      orientation: "vertical",
      thickness: "thin",
      className: "border-l"
    },
    {
      orientation: "vertical",
      thickness: "base",
      className: "border-l-2"
    },
    {
      orientation: "vertical",
      thickness: "thick",
      className: "border-l-4"
    },
    // Horizontal spacing
    {
      orientation: "horizontal",
      spacing: "sm",
      className: "my-2"
    },
    {
      orientation: "horizontal",
      spacing: "md",
      className: "my-4"
    },
    {
      orientation: "horizontal",
      spacing: "lg",
      className: "my-6"
    },
    // Vertical spacing
    {
      orientation: "vertical",
      spacing: "sm",
      className: "mx-2"
    },
    {
      orientation: "vertical",
      spacing: "md",
      className: "mx-4"
    },
    {
      orientation: "vertical",
      spacing: "lg",
      className: "mx-6"
    }
  ],
  defaultVariants: {
    orientation: "horizontal",
    thickness: "thin",
    spacing: "md"
  }
});
var Divider = React30.forwardRef(
  ({ orientation, thickness, spacing, label, labelPosition = "center", className, ...props }, ref) => {
    if (label && orientation === "horizontal") {
      return /* @__PURE__ */ jsxs(
        "div",
        {
          ref,
          className: cn(
            "flex items-center",
            spacing === "sm" && "my-2",
            spacing === "md" && "my-4",
            spacing === "lg" && "my-6",
            className
          ),
          role: "separator",
          ...props,
          children: [
            labelPosition === "center" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: cn("flex-1 border-t border-border-base", thickness === "base" && "border-t-2", thickness === "thick" && "border-t-4") }),
              /* @__PURE__ */ jsx("span", { className: "px-3 text-sm text-text-secondary", children: label }),
              /* @__PURE__ */ jsx("div", { className: cn("flex-1 border-t border-border-base", thickness === "base" && "border-t-2", thickness === "thick" && "border-t-4") })
            ] }),
            labelPosition === "left" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "pr-3 text-sm text-text-secondary", children: label }),
              /* @__PURE__ */ jsx("div", { className: cn("flex-1 border-t border-border-base", thickness === "base" && "border-t-2", thickness === "thick" && "border-t-4") })
            ] }),
            labelPosition === "right" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: cn("flex-1 border-t border-border-base", thickness === "base" && "border-t-2", thickness === "thick" && "border-t-4") }),
              /* @__PURE__ */ jsx("span", { className: "pl-3 text-sm text-text-secondary", children: label })
            ] })
          ]
        }
      );
    }
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: cn(dividerVariants({ orientation, thickness, spacing }), "border-border-base", className),
        role: "separator",
        "aria-orientation": orientation || void 0,
        ...props
      }
    );
  }
);
Divider.displayName = "Divider";
var dotVariants = cva("rounded-full", {
  variants: {
    size: {
      xs: "h-1.5 w-1.5",
      sm: "h-2 w-2",
      md: "h-2.5 w-2.5",
      lg: "h-3 w-3",
      xl: "h-4 w-4"
    },
    variant: {
      default: "bg-text-secondary",
      primary: "bg-accent-primary",
      success: "bg-status-success",
      warning: "bg-status-warning",
      error: "bg-status-error",
      info: "bg-accent-primary",
      gray: "bg-surface-subtle"
    },
    pulse: {
      true: "animate-pulse",
      false: ""
    }
  },
  defaultVariants: {
    size: "md",
    variant: "default",
    pulse: false
  }
});
var Dot = React30.forwardRef(
  ({ size, variant, pulse, label, ping, position = "inline", className, ...props }, ref) => {
    const dot = /* @__PURE__ */ jsxs("div", { className: cn("relative inline-flex", position !== "inline" && "absolute"), children: [
      ping && /* @__PURE__ */ jsx(
        "span",
        {
          className: cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
            variant === "success" && "bg-status-success",
            variant === "warning" && "bg-status-warning",
            variant === "error" && "bg-status-error",
            variant === "primary" && "bg-accent-primary",
            variant === "info" && "bg-accent-primary",
            variant === "default" && "bg-text-secondary"
          )
        }
      ),
      /* @__PURE__ */ jsx(
        "span",
        {
          ref,
          className: cn(dotVariants({ size, variant, pulse }), className),
          role: "status",
          "aria-label": label || "Status indicator",
          ...props
        }
      )
    ] });
    if (!label || position !== "inline") {
      return dot;
    }
    return /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2", children: [
      dot,
      /* @__PURE__ */ jsx("span", { className: "text-sm text-text-primary", children: label })
    ] });
  }
);
Dot.displayName = "Dot";
var DotGroup = ({
  children,
  orientation = "horizontal",
  spacing = "md",
  className
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        spacing === "sm" && (orientation === "horizontal" ? "gap-1" : "gap-1"),
        spacing === "md" && (orientation === "horizontal" ? "gap-2" : "gap-2"),
        spacing === "lg" && (orientation === "horizontal" ? "gap-3" : "gap-3"),
        className
      ),
      children
    }
  );
};
DotGroup.displayName = "DotGroup";
var kbdVariants = cva(
  "inline-flex items-center justify-center font-mono font-medium rounded border border-border-base bg-surface-elevated shadow-sm",
  {
    variants: {
      size: {
        sm: "px-1.5 py-0.5 text-xs min-w-[20px]",
        md: "px-2 py-1 text-sm min-w-[24px]",
        lg: "px-2.5 py-1.5 text-base min-w-[28px]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var Kbd = React30.forwardRef(
  ({ keys, separator, platform = "auto", size, className, children, ...props }, ref) => {
    const isMac = React30.useMemo(() => {
      if (platform === "auto") {
        if (typeof window !== "undefined") {
          return /Mac|iPhone|iPad|iPod/.test(window.navigator.userAgent);
        }
        return false;
      }
      return platform === "mac";
    }, [platform]);
    const formatKey = (key) => {
      const keyMap = {
        // Modifier keys
        cmd: isMac ? "\u2318" : "Ctrl",
        command: isMac ? "\u2318" : "Ctrl",
        ctrl: isMac ? "\u2303" : "Ctrl",
        control: isMac ? "\u2303" : "Ctrl",
        alt: isMac ? "\u2325" : "Alt",
        option: isMac ? "\u2325" : "Alt",
        shift: isMac ? "\u21E7" : "Shift",
        meta: isMac ? "\u2318" : "Win",
        // Navigation
        enter: "\u21B5",
        return: "\u21B5",
        backspace: "\u232B",
        delete: isMac ? "\u2326" : "Del",
        esc: "Esc",
        escape: "Esc",
        tab: "\u21E5",
        space: "\u2423",
        spacebar: "\u2423",
        // Arrows
        up: "\u2191",
        down: "\u2193",
        left: "\u2190",
        right: "\u2192",
        arrowup: "\u2191",
        arrowdown: "\u2193",
        arrowleft: "\u2190",
        arrowright: "\u2192"
      };
      return keyMap[key.toLowerCase()] || key;
    };
    const renderKeys = () => {
      if (children) {
        return children;
      }
      if (!keys) {
        return null;
      }
      const keyArray = Array.isArray(keys) ? keys : [keys];
      const defaultSeparator = /* @__PURE__ */ jsx("span", { className: "mx-1 text-text-tertiary", children: "+" });
      return keyArray.map((key, index) => /* @__PURE__ */ jsxs(React30.Fragment, { children: [
        index > 0 && (separator !== void 0 ? separator : defaultSeparator),
        /* @__PURE__ */ jsx("kbd", { className: cn(kbdVariants({ size }), className), ...props, children: formatKey(key) })
      ] }, index));
    };
    if (children || !keys) {
      return /* @__PURE__ */ jsx("kbd", { ref, className: cn(kbdVariants({ size }), className), ...props, children });
    }
    return /* @__PURE__ */ jsx("span", { ref, children: renderKeys() });
  }
);
Kbd.displayName = "Kbd";
var Menu = React30.forwardRef(
  ({ items, groups, onItemClick, className }, ref) => {
    if (groups) {
      return /* @__PURE__ */ jsx(
        "div",
        {
          ref,
          className: cn(
            "min-w-[200px] rounded-lg border border-border-base bg-surface-elevated py-1 shadow-lg",
            className
          ),
          children: groups.map((group, groupIndex) => /* @__PURE__ */ jsxs("div", { children: [
            groupIndex > 0 && /* @__PURE__ */ jsx(MenuSeparator, {}),
            group.label && /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5 text-xs font-medium text-text-tertiary uppercase", children: group.label }),
            group.items.map((item) => /* @__PURE__ */ jsx(MenuItemComponent, { item, onItemClick }, item.id))
          ] }, groupIndex))
        }
      );
    }
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: cn(
          "min-w-[200px] rounded-lg border border-border-base bg-surface-elevated py-1 shadow-lg",
          className
        ),
        children: items?.map((item) => /* @__PURE__ */ jsx(MenuItemComponent, { item, onItemClick }, item.id))
      }
    );
  }
);
Menu.displayName = "Menu";
var MenuItemComponent = ({ item, onItemClick }) => {
  const [showSubMenu, setShowSubMenu] = React30.useState(false);
  const handleClick = () => {
    if (item.disabled) return;
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };
  const itemContent = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1", children: [
      item.type === "checkbox" && /* @__PURE__ */ jsx("div", { className: "w-4 h-4 flex items-center justify-center", children: item.checked && /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" }) }),
      item.type === "radio" && /* @__PURE__ */ jsx("div", { className: cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
        item.checked ? "border-accent-primary" : "border-border-base"
      ), children: item.checked && /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-accent-primary" }) }),
      item.icon && /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: item.icon }),
      /* @__PURE__ */ jsx("span", { className: "text-sm", children: item.label })
    ] }),
    item.shortcut && /* @__PURE__ */ jsx("span", { className: "text-xs text-text-tertiary", children: item.shortcut }),
    item.subMenu && /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-text-tertiary" })
  ] });
  if (item.href) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        href: item.href,
        className: cn(
          "flex items-center justify-between px-3 py-2 text-text-primary transition-colors",
          item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-surface-subtle"
        ),
        onClick: (e) => {
          if (item.disabled) {
            e.preventDefault();
          }
        },
        children: itemContent
      }
    );
  }
  const menuItem = /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex items-center justify-between px-3 py-2 text-text-primary transition-colors relative",
        item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-surface-subtle"
      ),
      onClick: handleClick,
      onMouseEnter: () => item.subMenu && setShowSubMenu(true),
      onMouseLeave: () => item.subMenu && setShowSubMenu(false),
      children: [
        itemContent,
        item.subMenu && showSubMenu && /* @__PURE__ */ jsx("div", { className: "absolute left-full top-0 ml-1", children: /* @__PURE__ */ jsx(Menu, { items: item.subMenu, onItemClick }) })
      ]
    }
  );
  return menuItem;
};
var MenuSeparator = ({ className }) => {
  return /* @__PURE__ */ jsx("div", { className: cn("my-1 h-px bg-border-base", className), role: "separator" });
};
MenuSeparator.displayName = "MenuSeparator";
var TabsContext = React30.createContext(void 0);
var Tabs = React30.forwardRef(
  ({ defaultValue, value: controlledValue, onValueChange, children, className, ...props }, ref) => {
    const [internalValue, setInternalValue] = React30.useState(defaultValue || "");
    const value = controlledValue ?? internalValue;
    const handleValueChange = (newValue) => {
      if (controlledValue === void 0) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };
    return /* @__PURE__ */ jsx(TabsContext.Provider, { value: { value, onValueChange: handleValueChange }, children: /* @__PURE__ */ jsx("div", { ref, className: cn("w-full", className), ...props, children }) });
  }
);
Tabs.displayName = "Tabs";
var TabsList = React30.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: cn(
          "inline-flex h-10 items-center justify-center rounded-lg bg-surface-subtle p-1 text-text-secondary",
          className
        ),
        role: "tablist",
        ...props
      }
    );
  }
);
TabsList.displayName = "TabsList";
var TabsTrigger = React30.forwardRef(
  ({ className, value, ...props }, ref) => {
    const context = React30.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");
    const isActive = context.value === value;
    return /* @__PURE__ */ jsx(
      "button",
      {
        ref,
        type: "button",
        role: "tab",
        "aria-selected": isActive,
        onClick: () => context.onValueChange(value),
        className: cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          isActive ? "bg-surface-elevated text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary",
          className
        ),
        ...props
      }
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";
var TabsContent = React30.forwardRef(
  ({ className, value, ...props }, ref) => {
    const context = React30.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");
    if (context.value !== value) return null;
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        role: "tabpanel",
        className: cn("mt-2", className),
        ...props
      }
    );
  }
);
TabsContent.displayName = "TabsContent";
var sheetOverlayVariants = cva(
  "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
  {
    variants: {
      state: {
        open: "opacity-100",
        closed: "opacity-0 pointer-events-none"
      }
    },
    defaultVariants: {
      state: "closed"
    }
  }
);
var sheetContentVariants = cva(
  "fixed z-50 bg-surface-base shadow-xl transition-transform duration-300 overflow-y-auto",
  {
    variants: {
      side: {
        top: "top-0 left-0 right-0 h-auto max-h-[80vh] border-b border-border-base",
        bottom: "bottom-0 left-0 right-0 h-auto max-h-[80vh] border-t border-border-base",
        left: "top-0 left-0 bottom-0 w-full sm:max-w-md border-r border-border-base",
        right: "top-0 right-0 bottom-0 w-full sm:max-w-md border-l border-border-base"
      },
      state: {
        open: "",
        closed: ""
      }
    },
    compoundVariants: [
      {
        side: "top",
        state: "open",
        className: "translate-y-0"
      },
      {
        side: "top",
        state: "closed",
        className: "-translate-y-full"
      },
      {
        side: "bottom",
        state: "open",
        className: "translate-y-0"
      },
      {
        side: "bottom",
        state: "closed",
        className: "translate-y-full"
      },
      {
        side: "left",
        state: "open",
        className: "translate-x-0"
      },
      {
        side: "left",
        state: "closed",
        className: "-translate-x-full"
      },
      {
        side: "right",
        state: "open",
        className: "translate-x-0"
      },
      {
        side: "right",
        state: "closed",
        className: "translate-x-full"
      }
    ],
    defaultVariants: {
      side: "right",
      state: "closed"
    }
  }
);
var Sheet = ({
  open = false,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "right",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}) => {
  const state = open ? "open" : "closed";
  React30.useEffect(() => {
    if (!closeOnEscape) return;
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        onOpenChange?.(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onOpenChange]);
  React30.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onOpenChange?.(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: sheetOverlayVariants({ state }),
        onClick: handleOverlayClick,
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: sheetContentVariants({ side, state, className }),
        role: "dialog",
        "aria-modal": "true",
        children: [
          (title || showCloseButton) && /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between p-6 border-b border-border-base", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              title && /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-text-primary", children: title }),
              description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-text-secondary", children: description })
            ] }),
            showCloseButton && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => onOpenChange?.(false),
                className: "ml-4 p-1 rounded-md hover:bg-surface-subtle transition-colors",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 text-text-secondary" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 p-6", children }),
          footer && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-3 p-6 border-t border-border-base", children: footer })
        ]
      }
    )
  ] });
};
Sheet.displayName = "Sheet";
var SheetPortal = ({ children }) => {
  return /* @__PURE__ */ jsx(Fragment, { children });
};
var SheetOverlay = React30.forwardRef(({ className, state = "closed", ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: sheetOverlayVariants({ state, className }),
    ...props
  }
));
SheetOverlay.displayName = "SheetOverlay";
var SheetContent = React30.forwardRef(({ className, side = "right", state = "open", children, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: sheetContentVariants({ side, state, className }),
    role: "dialog",
    "aria-modal": "true",
    ...props,
    children
  }
));
SheetContent.displayName = "SheetContent";
var SheetHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: `flex flex-col space-y-2 text-center sm:text-left ${className || ""}`,
    ...props
  }
);
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ""}`,
    ...props
  }
);
SheetFooter.displayName = "SheetFooter";
var SheetTitle = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h2",
  {
    ref,
    className: `text-lg font-semibold text-text-primary ${className || ""}`,
    ...props
  }
));
SheetTitle.displayName = "SheetTitle";
var SheetDescription = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "p",
  {
    ref,
    className: `text-sm text-text-secondary ${className || ""}`,
    ...props
  }
));
SheetDescription.displayName = "SheetDescription";
var SheetTrigger = React30.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx("button", { ref, ...props }));
SheetTrigger.displayName = "SheetTrigger";
var SheetClose = React30.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "button",
  {
    ref,
    className: `p-1 rounded-md hover:bg-surface-subtle transition-colors ${className || ""}`,
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 text-text-secondary" })
  }
));
SheetClose.displayName = "SheetClose";
function useSwipeable(options) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmoveEvent = false
  } = options;
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const handleTouchStart = useCallback((e) => {
    touchEnd.current = null;
    const touch = e.touches[0];
    if (!touch) return;
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);
  const handleTouchMove = useCallback(
    (e) => {
      if (preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }
      const touch = e.touches[0];
      if (!touch) return;
      touchEnd.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    },
    [preventDefaultTouchmoveEvent]
  );
  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;
    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    if (absDeltaX > absDeltaY) {
      if (absDeltaX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      if (absDeltaY > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
    touchStart.current = null;
    touchEnd.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}
function useSwipeableCard(options) {
  const {
    onSwipeLeftAction,
    onSwipeRightAction,
    threshold = 10,
    actionThreshold = 100
  } = options;
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStart = useRef(null);
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    setIsSwiping(true);
  }, []);
  const handleTouchMove = useCallback(
    (e) => {
      if (!touchStart.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        e.preventDefault();
        const limitedOffset = Math.max(-150, Math.min(150, deltaX));
        setSwipeOffset(limitedOffset);
      }
    },
    [threshold]
  );
  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current) return;
    const offset = swipeOffset;
    if (Math.abs(offset) >= actionThreshold) {
      if (offset > 0) {
        onSwipeRightAction?.();
      } else {
        onSwipeLeftAction?.();
      }
    }
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStart.current = null;
  }, [swipeOffset, actionThreshold, onSwipeLeftAction, onSwipeRightAction]);
  return {
    swipeOffset,
    isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}
function useLongPress(options) {
  const { onLongPress, delay = 500, onPress } = options;
  const timeoutRef = useRef(null);
  const pressedRef = useRef(false);
  const start = useCallback(
    (e) => {
      pressedRef.current = true;
      timeoutRef.current = setTimeout(() => {
        if (pressedRef.current) {
          onLongPress();
        }
      }, delay);
    },
    [onLongPress, delay]
  );
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pressedRef.current && onPress) {
      onPress();
    }
    pressedRef.current = false;
  }, [onPress]);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel
  };
}
var actionColors = {
  primary: "bg-accent-primary",
  success: "bg-accent-success",
  danger: "bg-accent-danger",
  warn: "bg-accent-warn"
};
var SwipeableCard = React30.forwardRef(
  ({ children, leftAction, rightAction, className, disabled = false }, ref) => {
    const { swipeOffset, isSwiping, handlers } = useSwipeableCard({
      onSwipeLeftAction: leftAction?.onClick,
      onSwipeRightAction: rightAction?.onClick,
      actionThreshold: 100
    });
    const [isMobile, setIsMobile] = React30.useState(false);
    React30.useEffect(() => {
      setIsMobile("ontouchstart" in window);
    }, []);
    if (!isMobile || disabled) {
      return /* @__PURE__ */ jsx("div", { ref, className: cn("relative", className), children });
    }
    const showLeftAction = swipeOffset > 50 && rightAction;
    const showRightAction = swipeOffset < -50 && leftAction;
    return /* @__PURE__ */ jsxs("div", { ref, className: cn("relative overflow-hidden", className), children: [
      rightAction && /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "absolute inset-y-0 left-0 flex items-center justify-start px-4",
            "transition-opacity duration-200",
            actionColors[rightAction.color || "primary"],
            showLeftAction ? "opacity-100" : "opacity-0"
          ),
          style: {
            width: Math.max(0, swipeOffset)
          },
          children: [
            rightAction.icon && /* @__PURE__ */ jsx("span", { className: "text-white", children: rightAction.icon }),
            /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm font-medium text-white", children: rightAction.label })
          ]
        }
      ),
      leftAction && /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "absolute inset-y-0 right-0 flex items-center justify-end px-4",
            "transition-opacity duration-200",
            actionColors[leftAction.color || "danger"],
            showRightAction ? "opacity-100" : "opacity-0"
          ),
          style: {
            width: Math.max(0, -swipeOffset)
          },
          children: [
            /* @__PURE__ */ jsx("span", { className: "mr-2 text-sm font-medium text-white", children: leftAction.label }),
            leftAction.icon && /* @__PURE__ */ jsx("span", { className: "text-white", children: leftAction.icon })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "relative bg-bg-1 transition-transform",
            isSwiping ? "duration-0" : "duration-300"
          ),
          style: {
            transform: `translateX(${swipeOffset}px)`
          },
          ...handlers,
          children
        }
      )
    ] });
  }
);
SwipeableCard.displayName = "SwipeableCard";
function usePullToRefresh(options) {
  const {
    onRefresh,
    threshold = 80,
    maxPullDistance = 120,
    resistance = 2.5,
    disabled = false
  } = options;
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const touchStart = useRef(null);
  const containerRef = useRef(null);
  const handleTouchStart = useCallback((e) => {
    if (disabled || isRefreshing) return;
    const container = containerRef.current;
    if (!container) return;
    if (container.scrollTop === 0) {
      const touch = e.touches[0];
      if (!touch) return;
      touchStart.current = {
        y: touch.clientY,
        scrollTop: container.scrollTop
      };
    }
  }, [disabled, isRefreshing]);
  const handleTouchMove = useCallback(
    (e) => {
      if (disabled || isRefreshing || !touchStart.current) return;
      const container = containerRef.current;
      if (!container || container.scrollTop > 0) {
        touchStart.current = null;
        return;
      }
      const touch = e.touches[0];
      if (!touch) return;
      const deltaY = touch.clientY - touchStart.current.y;
      if (deltaY > 0) {
        e.preventDefault();
        const distance = Math.min(
          maxPullDistance,
          deltaY / resistance
        );
        setPullDistance(distance);
        setCanRefresh(distance >= threshold);
      }
    },
    [disabled, isRefreshing, threshold, maxPullDistance, resistance]
  );
  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !touchStart.current) return;
    if (canRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setCanRefresh(false);
      }
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }
    touchStart.current = null;
  }, [disabled, isRefreshing, canRefresh, onRefresh]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  return {
    containerRef,
    pullDistance,
    isRefreshing,
    canRefresh
  };
}
var PullToRefresh = React30.forwardRef(
  ({ children, onRefresh, threshold = 80, className, disabled = false }, ref) => {
    const { containerRef, pullDistance, isRefreshing, canRefresh } = usePullToRefresh({
      onRefresh,
      threshold,
      disabled
    });
    const spinnerRotation = isRefreshing ? 0 : pullDistance / threshold * 360;
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref: (node) => {
          containerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        },
        className: cn("relative overflow-auto", className),
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity duration-200",
              style: {
                height: pullDistance,
                opacity: pullDistance > 0 ? 1 : 0
              },
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                    canRefresh ? "bg-accent-success text-white" : "bg-bg-2 text-text-muted"
                  ),
                  style: {
                    transform: `rotate(${spinnerRotation}deg)`,
                    transition: isRefreshing ? "none" : "transform 0.1s linear"
                  },
                  children: isRefreshing ? /* @__PURE__ */ jsxs(
                    "svg",
                    {
                      className: "animate-spin w-5 h-5",
                      xmlns: "http://www.w3.org/2000/svg",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      children: [
                        /* @__PURE__ */ jsx(
                          "circle",
                          {
                            className: "opacity-25",
                            cx: "12",
                            cy: "12",
                            r: "10",
                            stroke: "currentColor",
                            strokeWidth: "4"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "path",
                          {
                            className: "opacity-75",
                            fill: "currentColor",
                            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          }
                        )
                      ]
                    }
                  ) : /* @__PURE__ */ jsx(
                    "svg",
                    {
                      className: "w-5 h-5",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                      children: /* @__PURE__ */ jsx(
                        "path",
                        {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M19 14l-7 7m0 0l-7-7m7 7V3"
                        }
                      )
                    }
                  )
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                transform: `translateY(${pullDistance}px)`,
                transition: pullDistance === 0 ? "transform 0.3s ease-out" : "none"
              },
              children
            }
          )
        ]
      }
    );
  }
);
PullToRefresh.displayName = "PullToRefresh";
var dataTableVariants = cva(
  "w-full border-collapse bg-surface-base text-sm",
  {
    variants: {
      variant: {
        default: "border border-border-base rounded-lg overflow-hidden",
        bordered: "border-2 border-border-base",
        minimal: "border-0"
      },
      density: {
        compact: "[&_td]:py-1.5 [&_th]:py-2",
        normal: "[&_td]:py-2.5 [&_th]:py-3",
        comfortable: "[&_td]:py-3.5 [&_th]:py-4"
      },
      striped: {
        true: "[&_tbody_tr:nth-child(even)]:bg-surface-subtle",
        false: ""
      },
      hoverable: {
        true: "[&_tbody_tr]:hover:bg-surface-subtle [&_tbody_tr]:cursor-pointer [&_tbody_tr]:transition-colors",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      density: "normal",
      striped: false,
      hoverable: true
    }
  }
);
var DataTable = ({
  columns,
  data,
  getRowId,
  state: externalState,
  onStateChange,
  enableSorting = true,
  enableFiltering = false,
  enableRowSelection = false,
  enableMultiRowSelection = false,
  enablePagination = false,
  enableVirtualization = false,
  onRowClick,
  onRowSelect,
  onSort,
  onFilter,
  loading = false,
  loadingRows = 5,
  emptyMessage = "No data available",
  pageSize: externalPageSize = 50,
  pageIndex: externalPageIndex = 0,
  totalRows,
  stickyHeader = false,
  maxHeight,
  variant,
  density,
  striped,
  hoverable,
  className,
  ...props
}) => {
  const [internalState, setInternalState] = React30.useState({
    sorting: externalState?.sorting || [],
    filters: externalState?.filters || [],
    selectedRows: externalState?.selectedRows || /* @__PURE__ */ new Set(),
    pagination: externalState?.pagination || {
      pageIndex: externalPageIndex,
      pageSize: externalPageSize
    }
  });
  const state = externalState ? {
    sorting: externalState.sorting || [],
    filters: externalState.filters || [],
    selectedRows: externalState.selectedRows || /* @__PURE__ */ new Set(),
    pagination: externalState.pagination || { pageIndex: externalPageIndex, pageSize: externalPageSize }
  } : internalState;
  const setState = onStateChange || setInternalState;
  const handleSort = (columnId) => {
    if (!enableSorting) return;
    const existingSort = state.sorting.find((s) => s.columnId === columnId);
    let newSorting;
    if (!existingSort) {
      newSorting = [{ columnId, direction: "asc" }];
    } else if (existingSort.direction === "asc") {
      newSorting = [{ columnId, direction: "desc" }];
    } else {
      newSorting = [];
    }
    const newState = {
      ...state,
      sorting: newSorting,
      filters: state.filters || [],
      selectedRows: state.selectedRows || /* @__PURE__ */ new Set(),
      pagination: state.pagination || { pageIndex: externalPageIndex, pageSize: externalPageSize }
    };
    setState(newState);
    onSort?.(newSorting);
  };
  const getSortIcon = (columnId) => {
    const sort = state.sorting.find((s) => s.columnId === columnId);
    if (!sort) return /* @__PURE__ */ jsx(ChevronsUpDown, { className: "w-4 h-4 opacity-50" });
    return sort.direction === "asc" ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" });
  };
  const handleRowSelect = (rowId, isSelected) => {
    if (!enableRowSelection) return;
    const newSelected = new Set(state.selectedRows);
    if (enableMultiRowSelection) {
      if (isSelected) {
        newSelected.add(rowId);
      } else {
        newSelected.delete(rowId);
      }
    } else {
      newSelected.clear();
      if (isSelected) newSelected.add(rowId);
    }
    const newState = {
      ...state,
      selectedRows: newSelected
    };
    setState(newState);
    onRowSelect?.(newSelected);
  };
  const handleSelectAll = (isSelected) => {
    if (!enableMultiRowSelection) return;
    const newSelected = /* @__PURE__ */ new Set();
    if (isSelected) {
      processedData.forEach((row, index) => {
        const rowId = getRowId?.(row, index) || index;
        newSelected.add(rowId);
      });
    }
    const newState = {
      ...state,
      selectedRows: newSelected
    };
    setState(newState);
    onRowSelect?.(newSelected);
  };
  const processedData = React30.useMemo(() => {
    let result = [...data];
    if (state.filters.length > 0) {
      result = result.filter((row) => {
        return state.filters.every((filter) => {
          const column = columns.find((c) => c.id === filter.columnId);
          if (!column) return true;
          const value = column.accessorFn ? column.accessorFn(row) : column.accessorKey ? row[column.accessorKey] : null;
          switch (filter.operator || "equals") {
            case "equals":
              return value === filter.value;
            case "contains":
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case "gt":
              return value > filter.value;
            case "lt":
              return value < filter.value;
            default:
              return true;
          }
        });
      });
    }
    if (state.sorting.length > 0) {
      result.sort((a, b) => {
        for (const sort of state.sorting) {
          const column = columns.find((c) => c.id === sort.columnId);
          if (!column) continue;
          const aValue = column.accessorFn ? column.accessorFn(a) : column.accessorKey ? a[column.accessorKey] : null;
          const bValue = column.accessorFn ? column.accessorFn(b) : column.accessorKey ? b[column.accessorKey] : null;
          if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    if (enablePagination) {
      const start = state.pagination.pageIndex * state.pagination.pageSize;
      const end = start + state.pagination.pageSize;
      result = result.slice(start, end);
    }
    return result;
  }, [data, state.sorting, state.filters, state.pagination, columns, enablePagination]);
  const renderLoadingSkeleton = () => /* @__PURE__ */ jsx(Fragment, { children: Array.from({ length: loadingRows }).map((_, i) => /* @__PURE__ */ jsxs("tr", { children: [
    enableRowSelection && /* @__PURE__ */ jsx("td", { className: "px-4", children: /* @__PURE__ */ jsx("div", { className: "h-4 w-4 bg-surface-subtle animate-pulse rounded" }) }),
    columns.map((col) => /* @__PURE__ */ jsx("td", { className: "px-4", children: /* @__PURE__ */ jsx("div", { className: "h-4 bg-surface-subtle animate-pulse rounded", style: { width: `${60 + Math.random() * 40}%` } }) }, col.id))
  ] }, `loading-${i}`)) });
  const allSelected = processedData.length > 0 && processedData.every((row, index) => {
    const rowId = getRowId?.(row, index) || index;
    return state.selectedRows.has(rowId);
  });
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: cn("relative overflow-auto", stickyHeader && "border border-border-base rounded-lg"),
        style: { maxHeight },
        children: /* @__PURE__ */ jsxs(
          "table",
          {
            className: cn(dataTableVariants({ variant, density, striped, hoverable }), className),
            ...props,
            children: [
              /* @__PURE__ */ jsx("thead", { className: cn(
                "bg-surface-elevated border-b border-border-base",
                stickyHeader && "sticky top-0 z-10"
              ), children: /* @__PURE__ */ jsxs("tr", { children: [
                enableRowSelection && /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium text-text-secondary w-12", children: enableMultiRowSelection && /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: allSelected,
                    onChange: (e) => handleSelectAll(e.target.checked),
                    className: "rounded border-border-base"
                  }
                ) }),
                columns.map((column) => /* @__PURE__ */ jsx(
                  "th",
                  {
                    className: cn(
                      "px-4 py-3 font-medium text-text-secondary",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.sortable !== false && enableSorting && "cursor-pointer select-none hover:bg-surface-subtle"
                    ),
                    style: {
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth
                    },
                    onClick: () => column.sortable !== false && handleSort(column.id),
                    children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      column.header,
                      column.sortable !== false && enableSorting && getSortIcon(column.id)
                    ] })
                  },
                  column.id
                ))
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { children: loading ? renderLoadingSkeleton() : processedData.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length + (enableRowSelection ? 1 : 0), className: "px-4 py-12 text-center text-text-secondary", children: emptyMessage }) }) : processedData.map((row, rowIndex) => {
                const rowId = getRowId?.(row, rowIndex) || rowIndex;
                const isSelected = state.selectedRows.has(rowId);
                return /* @__PURE__ */ jsxs(
                  "tr",
                  {
                    className: cn(isSelected && "bg-accent-primary/10"),
                    onClick: () => onRowClick?.(row, rowIndex),
                    children: [
                      enableRowSelection && /* @__PURE__ */ jsx("td", { className: "px-4", children: /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "checkbox",
                          checked: isSelected,
                          onChange: (e) => {
                            e.stopPropagation();
                            handleRowSelect(rowId, e.target.checked);
                          },
                          className: "rounded border-border-base"
                        }
                      ) }),
                      columns.map((column) => {
                        const value = column.accessorFn ? column.accessorFn(row) : column.accessorKey ? row[column.accessorKey] : null;
                        const cellContent = column.cell ? column.cell({ row, value, rowIndex }) : value;
                        return /* @__PURE__ */ jsx(
                          "td",
                          {
                            className: cn(
                              "px-4 border-t border-border-muted",
                              column.align === "center" && "text-center",
                              column.align === "right" && "text-right"
                            ),
                            children: cellContent
                          },
                          column.id
                        );
                      })
                    ]
                  },
                  rowId
                );
              }) }),
              columns.some((c) => c.footer) && /* @__PURE__ */ jsx("tfoot", { className: "bg-surface-elevated border-t border-border-base", children: /* @__PURE__ */ jsxs("tr", { children: [
                enableRowSelection && /* @__PURE__ */ jsx("td", {}),
                columns.map((column) => /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium", children: column.footer }, column.id))
              ] }) })
            ]
          }
        )
      }
    ),
    enablePagination && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-border-base", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-text-secondary", children: [
        "Showing ",
        state.pagination.pageIndex * state.pagination.pageSize + 1,
        " to",
        " ",
        Math.min((state.pagination.pageIndex + 1) * state.pagination.pageSize, totalRows || data.length),
        " of",
        " ",
        totalRows || data.length,
        " rows"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "px-3 py-1 text-sm border border-border-base rounded hover:bg-surface-subtle disabled:opacity-50",
            disabled: state.pagination.pageIndex === 0,
            onClick: () => setState({
              ...state,
              pagination: {
                pageIndex: state.pagination.pageIndex - 1,
                pageSize: state.pagination.pageSize
              }
            }),
            children: "Previous"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "px-3 py-1 text-sm border border-border-base rounded hover:bg-surface-subtle disabled:opacity-50",
            disabled: (state.pagination.pageIndex + 1) * state.pagination.pageSize >= (totalRows || data.length),
            onClick: () => setState({
              ...state,
              pagination: {
                pageIndex: state.pagination.pageIndex + 1,
                pageSize: state.pagination.pageSize
              }
            }),
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
};
DataTable.displayName = "DataTable";
var OPERATORS_BY_TYPE = {
  string: ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "is_null", "is_not_null"],
  number: ["equals", "not_equals", "gt", "gte", "lt", "lte", "between", "is_null", "is_not_null"],
  date: ["equals", "not_equals", "gt", "gte", "lt", "lte", "between", "is_null", "is_not_null"],
  boolean: ["equals", "not_equals"],
  select: ["equals", "not_equals", "in", "not_in", "is_null", "is_not_null"],
  "multi-select": ["in", "not_in", "is_null", "is_not_null"]
};
var OPERATOR_LABELS = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  not_contains: "does not contain",
  starts_with: "starts with",
  ends_with: "ends with",
  gt: "greater than",
  gte: "greater than or equal",
  lt: "less than",
  lte: "less than or equal",
  between: "between",
  in: "is one of",
  not_in: "is not one of",
  is_null: "is empty",
  is_not_null: "is not empty"
};
var generateId = () => Math.random().toString(36).substr(2, 9);
var createEmptyCondition = () => ({
  id: generateId(),
  field: "",
  operator: "equals",
  value: null
});
var createEmptyGroup = (combinator = "AND") => ({
  id: generateId(),
  combinator,
  conditions: [createEmptyCondition()],
  groups: []
});
var ConditionRow = ({
  condition,
  fields,
  onChange,
  onRemove,
  canRemove
}) => {
  const selectedField = fields.find((f) => f.id === condition.field);
  const availableOperators = selectedField ? OPERATORS_BY_TYPE[selectedField.type] : [];
  const needsValue = !["is_null", "is_not_null"].includes(condition.operator);
  const needsSecondValue = condition.operator === "between";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 bg-surface-elevated border border-border-base rounded-lg group", children: [
    /* @__PURE__ */ jsx(GripVertical, { className: "w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" }),
    /* @__PURE__ */ jsx(
      Select,
      {
        value: condition.field,
        onValueChange: (field) => onChange({ ...condition, field, value: null }),
        options: fields.map((f) => ({ label: f.label, value: f.id })),
        placeholder: "Select field...",
        className: "min-w-[180px]"
      }
    ),
    selectedField && /* @__PURE__ */ jsx(
      Select,
      {
        value: condition.operator,
        onValueChange: (operator) => onChange({ ...condition, operator }),
        options: availableOperators.map((op) => ({
          label: OPERATOR_LABELS[op],
          value: op
        })),
        className: "min-w-[150px]"
      }
    ),
    selectedField && needsValue && /* @__PURE__ */ jsxs(Fragment, { children: [
      selectedField.type === "select" || selectedField.type === "multi-select" ? /* @__PURE__ */ jsx(
        Select,
        {
          value: condition.value,
          onValueChange: (value) => onChange({ ...condition, value }),
          options: selectedField.options || [],
          placeholder: selectedField.placeholder || "Select value...",
          className: "min-w-[180px]"
        }
      ) : selectedField.type === "boolean" ? /* @__PURE__ */ jsx(
        Select,
        {
          value: condition.value,
          onValueChange: (value) => onChange({ ...condition, value: value === "true" }),
          options: [
            { label: "True", value: "true" },
            { label: "False", value: "false" }
          ],
          className: "min-w-[120px]"
        }
      ) : /* @__PURE__ */ jsx(
        Input,
        {
          type: selectedField.type === "number" ? "number" : selectedField.type === "date" ? "date" : "text",
          value: condition.value || "",
          onChange: (e) => onChange({ ...condition, value: e.target.value }),
          placeholder: selectedField.placeholder || `Enter ${selectedField.type}...`,
          className: "min-w-[180px]"
        }
      ),
      needsSecondValue && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-text-secondary", children: "and" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: selectedField.type === "number" ? "number" : selectedField.type === "date" ? "date" : "text",
            value: condition.value?.[1] || "",
            onChange: (e) => onChange({
              ...condition,
              value: [condition.value?.[0], e.target.value]
            }),
            placeholder: "Max value",
            className: "min-w-[180px]"
          }
        )
      ] })
    ] }),
    canRemove && /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "icon",
        onClick: onRemove,
        className: "ml-auto opacity-0 group-hover:opacity-100",
        children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 text-status-error" })
      }
    )
  ] });
};
var QueryGroupComponent = ({
  group,
  fields,
  onChange,
  onRemove,
  depth = 0,
  maxDepth = 3
}) => {
  const handleCombinatorChange = (combinator) => {
    onChange({ ...group, combinator });
  };
  const handleConditionChange = (index, condition) => {
    const newConditions = [...group.conditions];
    newConditions[index] = condition;
    onChange({ ...group, conditions: newConditions });
  };
  const handleConditionRemove = (index) => {
    if (group.conditions.length === 1 && group.groups.length === 0) return;
    const newConditions = group.conditions.filter((_, i) => i !== index);
    onChange({ ...group, conditions: newConditions });
  };
  const handleAddCondition = () => {
    onChange({
      ...group,
      conditions: [...group.conditions, createEmptyCondition()]
    });
  };
  const handleAddGroup = () => {
    onChange({
      ...group,
      groups: [...group.groups, createEmptyGroup()]
    });
  };
  const handleGroupChange = (index, subGroup) => {
    const newGroups = [...group.groups];
    newGroups[index] = subGroup;
    onChange({ ...group, groups: newGroups });
  };
  const handleGroupRemove = (index) => {
    const newGroups = group.groups.filter((_, i) => i !== index);
    onChange({ ...group, groups: newGroups });
  };
  const canRemoveCondition = group.conditions.length > 1 || group.groups.length > 0;
  const canAddGroup = depth < maxDepth;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "p-4 rounded-lg border-2 border-dashed",
        depth === 0 ? "border-accent-primary bg-accent-primary/5" : "border-border-base bg-surface-base"
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-text-secondary uppercase", children: "Match" }),
            /* @__PURE__ */ jsx(
              Select,
              {
                value: group.combinator,
                onValueChange: (value) => handleCombinatorChange(value),
                options: [
                  { label: "ALL", value: "AND" },
                  { label: "ANY", value: "OR" }
                ],
                size: "sm",
                className: "w-24"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-text-secondary", children: "of the following:" })
          ] }),
          onRemove && depth > 0 && /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: onRemove, children: [
            /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 text-status-error" }),
            "Remove Group"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          group.conditions.map((condition, index) => /* @__PURE__ */ jsx(
            ConditionRow,
            {
              condition,
              fields,
              onChange: (c) => handleConditionChange(index, c),
              onRemove: () => handleConditionRemove(index),
              canRemove: canRemoveCondition
            },
            condition.id
          )),
          group.groups.map((subGroup, index) => /* @__PURE__ */ jsx(
            QueryGroupComponent,
            {
              group: subGroup,
              fields,
              onChange: (g) => handleGroupChange(index, g),
              onRemove: () => handleGroupRemove(index),
              depth: depth + 1,
              maxDepth
            },
            subGroup.id
          ))
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-4", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleAddCondition, children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "Add Condition"
          ] }),
          canAddGroup && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleAddGroup, children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "Add Group"
          ] })
        ] })
      ]
    }
  );
};
var QueryBuilder = ({
  fields,
  query: externalQuery,
  onChange,
  maxDepth = 3,
  className
}) => {
  const [internalQuery, setInternalQuery] = React30.useState({
    root: createEmptyGroup()
  });
  const query = externalQuery || internalQuery;
  const setQuery = onChange ? (q) => onChange(q) : setInternalQuery;
  const handleRootChange = (root) => {
    setQuery({ root });
  };
  return /* @__PURE__ */ jsx("div", { className: cn("space-y-4", className), children: /* @__PURE__ */ jsx(
    QueryGroupComponent,
    {
      group: query.root,
      fields,
      onChange: handleRootChange,
      maxDepth
    }
  ) });
};
QueryBuilder.displayName = "QueryBuilder";
var queryToSQL = (query, tableName) => {
  const buildCondition = (condition) => {
    const { field, operator, value } = condition;
    switch (operator) {
      case "equals":
        return `${field} = '${value}'`;
      case "not_equals":
        return `${field} != '${value}'`;
      case "contains":
        return `${field} LIKE '%${value}%'`;
      case "not_contains":
        return `${field} NOT LIKE '%${value}%'`;
      case "starts_with":
        return `${field} LIKE '${value}%'`;
      case "ends_with":
        return `${field} LIKE '%${value}'`;
      case "gt":
        return `${field} > ${value}`;
      case "gte":
        return `${field} >= ${value}`;
      case "lt":
        return `${field} < ${value}`;
      case "lte":
        return `${field} <= ${value}`;
      case "between":
        return `${field} BETWEEN ${value[0]} AND ${value[1]}`;
      case "in":
        return `${field} IN (${Array.isArray(value) ? value.map((v) => `'${v}'`).join(",") : `'${value}'`})`;
      case "not_in":
        return `${field} NOT IN (${Array.isArray(value) ? value.map((v) => `'${v}'`).join(",") : `'${value}'`})`;
      case "is_null":
        return `${field} IS NULL`;
      case "is_not_null":
        return `${field} IS NOT NULL`;
      default:
        return "";
    }
  };
  const buildGroup = (group) => {
    const conditions = group.conditions.filter((c) => c.field).map(buildCondition);
    const groups = group.groups.map(buildGroup);
    const all = [...conditions, ...groups].filter(Boolean);
    if (all.length === 0) return "";
    if (all.length === 1) return all[0] || "";
    return `(${all.join(` ${group.combinator} `)})`;
  };
  const whereClause = buildGroup(query.root);
  return whereClause ? `SELECT * FROM ${tableName} WHERE ${whereClause}` : `SELECT * FROM ${tableName}`;
};
var queryToJSON = (query) => {
  return JSON.stringify(query, null, 2);
};
var LiveDataFeed = ({
  url,
  onConnect,
  onDisconnect,
  onMessage,
  onError,
  messages: externalMessages,
  renderMessage,
  maxMessages = 500,
  autoScroll = true,
  showTimestamps = true,
  showTypes = true,
  groupByType = false,
  allowFilter = true,
  filterPlaceholder = "Filter messages...",
  filterFn,
  allowPause = true,
  allowExport = true,
  exportFilename = "live-data-feed.json",
  height = "600px",
  emptyMessage = "No messages yet...",
  className
}) => {
  const [messages, setMessages] = React30.useState(externalMessages || []);
  const [filteredMessages, setFilteredMessages] = React30.useState([]);
  const [filterText, setFilterText] = React30.useState("");
  const [isPaused, setIsPaused] = React30.useState(false);
  const [connectionStatus, setConnectionStatus] = React30.useState("disconnected");
  const [messageBuffer, setMessageBuffer] = React30.useState([]);
  const containerRef = React30.useRef(null);
  const wsRef = React30.useRef(null);
  const reconnectTimeoutRef = React30.useRef();
  const reconnectAttempts = React30.useRef(0);
  const connect = React30.useCallback(() => {
    if (!url || wsRef.current) return;
    try {
      setConnectionStatus("connecting");
      const ws = new WebSocket(url);
      ws.onopen = () => {
        console.log("[LiveDataFeed] Connected to", url);
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
        onConnect?.();
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const message = {
            id: data.id || Math.random().toString(36),
            timestamp: data.timestamp ? new Date(data.timestamp) : /* @__PURE__ */ new Date(),
            type: data.type,
            data: data.data || data,
            priority: data.priority || "normal"
          };
          onMessage?.(message);
          if (isPaused) {
            setMessageBuffer((prev) => [...prev, message]);
          } else {
            addMessage(message);
          }
        } catch (error) {
          console.error("[LiveDataFeed] Failed to parse message:", error);
        }
      };
      ws.onerror = (error) => {
        console.error("[LiveDataFeed] WebSocket error:", error);
        setConnectionStatus("error");
        onError?.(new Error("WebSocket connection error"));
      };
      ws.onclose = () => {
        console.log("[LiveDataFeed] Disconnected from", url);
        setConnectionStatus("disconnected");
        wsRef.current = null;
        onDisconnect?.();
        const delay = Math.min(1e3 * Math.pow(2, reconnectAttempts.current), 3e4);
        reconnectAttempts.current++;
        console.log(`[LiveDataFeed] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
      wsRef.current = ws;
    } catch (error) {
      console.error("[LiveDataFeed] Failed to connect:", error);
      setConnectionStatus("error");
      onError?.(error);
    }
  }, [url, isPaused, onConnect, onDisconnect, onMessage, onError]);
  const disconnect = React30.useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus("disconnected");
  }, []);
  const addMessage = React30.useCallback((message) => {
    setMessages((prev) => {
      const newMessages = [message, ...prev];
      return newMessages.slice(0, maxMessages);
    });
  }, [maxMessages]);
  const handlePauseToggle = () => {
    if (isPaused) {
      setMessages((prev) => [...messageBuffer, ...prev].slice(0, maxMessages));
      setMessageBuffer([]);
    }
    setIsPaused(!isPaused);
  };
  const handleExport = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", exportFilename);
    link.click();
  };
  React30.useEffect(() => {
    if (!filterText) {
      setFilteredMessages(messages);
      return;
    }
    const filtered = messages.filter((msg) => {
      if (filterFn) {
        return filterFn(msg, filterText);
      }
      const searchText = filterText.toLowerCase();
      const dataStr = JSON.stringify(msg.data).toLowerCase();
      const typeMatch = msg.type?.toLowerCase().includes(searchText);
      return dataStr.includes(searchText) || typeMatch;
    });
    setFilteredMessages(filtered);
  }, [messages, filterText, filterFn]);
  React30.useEffect(() => {
    if (autoScroll && !isPaused && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [filteredMessages, autoScroll, isPaused]);
  React30.useEffect(() => {
    if (url) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);
  React30.useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages);
    }
  }, [externalMessages]);
  const groupedMessages = React30.useMemo(() => {
    if (!groupByType) return { "": filteredMessages };
    const groups = {};
    filteredMessages.forEach((msg) => {
      const type = msg.type || "other";
      if (!groups[type]) groups[type] = [];
      groups[type].push(msg);
    });
    return groups;
  }, [filteredMessages, groupByType]);
  const statusColors = {
    connected: "text-status-success",
    connecting: "text-status-warning",
    disconnected: "text-text-tertiary",
    error: "text-status-error"
  };
  const statusIcons = {
    connected: /* @__PURE__ */ jsx(Wifi, { className: "w-4 h-4" }),
    connecting: /* @__PURE__ */ jsx(Wifi, { className: "w-4 h-4 animate-pulse" }),
    disconnected: /* @__PURE__ */ jsx(WifiOff, { className: "w-4 h-4" }),
    error: /* @__PURE__ */ jsx(WifiOff, { className: "w-4 h-4" })
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col border border-border-base rounded-lg bg-surface-base", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border-base bg-surface-elevated", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        url && /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-2", statusColors[connectionStatus]), children: [
          statusIcons[connectionStatus],
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium capitalize", children: connectionStatus })
        ] }),
        /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
          messages.length,
          " ",
          messages.length === 1 ? "message" : "messages"
        ] }),
        isPaused && messageBuffer.length > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "warning", children: [
          messageBuffer.length,
          " buffered"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        allowFilter && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: filterPlaceholder,
              value: filterText,
              onChange: (e) => setFilterText(e.target.value),
              leftIcon: /* @__PURE__ */ jsx(Filter, { size: 16 }),
              className: "w-64"
            }
          ),
          filterText && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setFilterText(""),
              className: "absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary",
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
            }
          )
        ] }),
        allowPause && /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handlePauseToggle,
            children: [
              isPaused ? /* @__PURE__ */ jsx(Play, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Pause, { className: "w-4 h-4" }),
              isPaused ? "Resume" : "Pause"
            ]
          }
        ),
        allowExport && /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handleExport,
            disabled: messages.length === 0,
            children: [
              /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
              "Export"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: containerRef,
        className: "overflow-y-auto p-4 space-y-2",
        style: { height },
        children: filteredMessages.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-text-secondary", children: emptyMessage }) : /* @__PURE__ */ jsx(Fragment, { children: Object.entries(groupedMessages).map(([type, msgs]) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          groupByType && type && /* @__PURE__ */ jsx("div", { className: "sticky top-0 bg-surface-elevated px-3 py-1 rounded-md border border-border-base", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase text-text-secondary", children: type }) }),
          msgs.map((message, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "p-3 rounded-lg border transition-all",
                message.priority === "critical" && "border-status-error bg-status-error/10",
                message.priority === "high" && "border-status-warning bg-status-warning/10",
                message.priority === "normal" && "border-border-base bg-surface-elevated",
                message.priority === "low" && "border-border-muted bg-surface-base opacity-70"
              ),
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
                    showTypes && message.type && /* @__PURE__ */ jsx(Badge, { variant: "outline", size: "sm", children: message.type }),
                    showTimestamps && /* @__PURE__ */ jsx("span", { className: "text-xs text-text-tertiary", children: message.timestamp.toLocaleTimeString() })
                  ] }),
                  message.priority && message.priority !== "normal" && /* @__PURE__ */ jsx(
                    Badge,
                    {
                      variant: message.priority === "critical" ? "error" : message.priority === "high" ? "warning" : "default",
                      size: "sm",
                      children: message.priority
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-sm", children: renderMessage(message, index) })
              ]
            },
            message.id
          ))
        ] }, type)) })
      }
    )
  ] });
};
LiveDataFeed.displayName = "LiveDataFeed";
var aggregateFunctions = {
  sum: (values) => values.reduce((sum, v) => sum + (Number(v) || 0), 0),
  avg: (values) => {
    const sum = values.reduce((s, v) => s + (Number(v) || 0), 0);
    return values.length > 0 ? sum / values.length : 0;
  },
  count: (values) => values.length,
  min: (values) => Math.min(...values.map((v) => Number(v) || 0)),
  max: (values) => Math.max(...values.map((v) => Number(v) || 0)),
  first: (values) => values[0],
  last: (values) => values[values.length - 1]
};
var PivotEngine = class {
  data;
  config;
  constructor(data, config) {
    this.data = data;
    this.config = config;
  }
  // Build pivot structure
  buildPivot() {
    const rowGroups = this.groupByDimensions(this.data, this.config.rows);
    const columnHeaders = this.buildColumnHeaders();
    const rows = this.buildRows(rowGroups, columnHeaders);
    return { rows, columnHeaders };
  }
  groupByDimensions(data, dimensions) {
    if (dimensions.length === 0) return /* @__PURE__ */ new Map([["_all", data]]);
    const groups = /* @__PURE__ */ new Map();
    data.forEach((row) => {
      const key = dimensions.map((dim) => String(row[dim.id] || "(blank)")).join("|||");
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(row);
    });
    return groups;
  }
  buildColumnHeaders() {
    if (this.config.columns.length === 0) {
      return [this.config.values.map((v) => v.label)];
    }
    const columnValues = this.config.columns.map((col) => {
      const uniqueValues = new Set(this.data.map((row) => row[col.id] || "(blank)"));
      return Array.from(uniqueValues).sort();
    });
    const headers = [];
    headers.push(columnValues[0] || []);
    return headers;
  }
  buildRows(groups, columnHeaders) {
    const rows = [];
    groups.forEach((groupData, key) => {
      const path = key.split("|||");
      const level = path.length - 1;
      const cells = {};
      this.config.values.forEach((valueField) => {
        const values = groupData.map((row) => row[valueField.id]);
        const aggregateFn = aggregateFunctions[valueField.aggregation];
        const value = aggregateFn(values);
        cells[valueField.id] = {
          rowPath: path,
          columnPath: [],
          value,
          count: values.length,
          rawValues: values
        };
      });
      rows.push({
        path,
        label: path[path.length - 1] || "",
        level,
        isExpanded: true,
        isSubtotal: false,
        isGrandTotal: false,
        cells
      });
    });
    const grandTotalCells = {};
    this.config.values.forEach((valueField) => {
      const allValues = this.data.map((row) => row[valueField.id]);
      const aggregateFn = aggregateFunctions[valueField.aggregation];
      const value = aggregateFn(allValues);
      grandTotalCells[valueField.id] = {
        rowPath: ["Grand Total"],
        columnPath: [],
        value,
        count: allValues.length,
        rawValues: allValues
      };
    });
    rows.push({
      path: ["Grand Total"],
      label: "Grand Total",
      level: 0,
      isExpanded: false,
      isSubtotal: false,
      isGrandTotal: true,
      cells: grandTotalCells
    });
    return rows;
  }
};
var PivotTable = ({
  data,
  config,
  onConfigChange,
  onCellClick,
  onExport,
  showSubtotals = true,
  showGrandTotals = true,
  className
}) => {
  const [expandedRows, setExpandedRows] = React30.useState(/* @__PURE__ */ new Set());
  const pivot = React30.useMemo(() => {
    const engine = new PivotEngine(data, config);
    return engine.buildPivot();
  }, [data, config]);
  const handleToggleRow = (rowPath) => {
    const key = rowPath.join("|||");
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };
  const formatValue = (valueField, value) => {
    if (valueField.format) {
      return valueField.format(value);
    }
    if (valueField.dataType === "number") {
      return value.toLocaleString(void 0, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return String(value);
  };
  const filteredRows = React30.useMemo(() => {
    if (!showGrandTotals) {
      return pivot.rows.filter((r) => !r.isGrandTotal);
    }
    return pivot.rows;
  }, [pivot.rows, showGrandTotals]);
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border-base bg-surface-elevated", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-text-secondary", children: [
        data.length,
        " rows \u2022 ",
        config.values.length,
        " metrics"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: onExport && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => onExport("csv"),
            children: [
              /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
              "CSV"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => onExport("excel"),
            children: [
              /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
              "Excel"
            ]
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-surface-elevated sticky top-0 z-10", children: /* @__PURE__ */ jsxs("tr", { children: [
        config.rows.map((row) => /* @__PURE__ */ jsx(
          "th",
          {
            className: "px-4 py-3 text-left font-medium text-text-secondary border-b-2 border-border-base",
            children: row.label
          },
          row.id
        )),
        config.values.map((value) => /* @__PURE__ */ jsxs(
          "th",
          {
            className: "px-4 py-3 text-right font-medium text-text-secondary border-b-2 border-border-base",
            children: [
              value.label,
              /* @__PURE__ */ jsxs("span", { className: "ml-1 text-xs text-text-tertiary", children: [
                "(",
                value.aggregation,
                ")"
              ] })
            ]
          },
          value.id
        ))
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: filteredRows.map((row, rowIndex) => {
        const rowKey = row.path.join("|||");
        const isExpanded = expandedRows.has(rowKey);
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            className: cn(
              "border-b border-border-muted transition-colors",
              row.isGrandTotal && "bg-surface-subtle font-bold border-t-2 border-border-base",
              row.isSubtotal && "bg-surface-subtle font-medium",
              !row.isGrandTotal && !row.isSubtotal && "hover:bg-surface-subtle"
            ),
            children: [
              config.rows.map((rowDim, dimIndex) => /* @__PURE__ */ jsx(
                "td",
                {
                  className: cn(
                    "px-4 py-2.5",
                    dimIndex === row.level && "font-medium"
                  ),
                  style: { paddingLeft: `${row.level * 16 + 16}px` },
                  children: dimIndex === row.level && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    row.level < config.rows.length - 1 && !row.isGrandTotal && /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => handleToggleRow(row.path),
                        className: "text-text-tertiary hover:text-text-primary",
                        children: isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { children: row.label })
                  ] })
                },
                rowDim.id
              )),
              config.values.map((valueField) => {
                const cell = row.cells[valueField.id];
                if (!cell) {
                  return /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-right text-text-tertiary", children: "-" }, valueField.id);
                }
                return /* @__PURE__ */ jsx(
                  "td",
                  {
                    className: cn(
                      "px-4 py-2.5 text-right tabular-nums",
                      onCellClick && !row.isGrandTotal && "cursor-pointer hover:bg-accent-primary/10"
                    ),
                    onClick: () => !row.isGrandTotal && cell && onCellClick?.(cell),
                    children: formatValue(valueField, cell.value)
                  },
                  valueField.id
                );
              })
            ]
          },
          rowKey
        );
      }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 border-t border-border-base bg-surface-elevated text-xs text-text-secondary", children: [
      "Showing ",
      filteredRows.length,
      " row groups"
    ] })
  ] });
};
PivotTable.displayName = "PivotTable";
var exportPivotToCSV = (pivot, config) => {
  const lines = [];
  const headers = [
    ...config.rows.map((r) => r.label),
    ...config.values.map((v) => `${v.label} (${v.aggregation})`)
  ];
  lines.push(headers.join(","));
  pivot.rows.forEach((row) => {
    const values = [
      ...row.path,
      ...config.values.map((v) => row.cells[v.id]?.value || 0)
    ];
    lines.push(values.join(","));
  });
  return lines.join("\n");
};
var aggregateCardVariants = cva(
  "relative overflow-hidden rounded-lg border bg-surface-elevated transition-all",
  {
    variants: {
      variant: {
        default: "border-border-base",
        success: "border-status-success/20 bg-status-success/5",
        warning: "border-status-warning/20 bg-status-warning/5",
        error: "border-status-error/20 bg-status-error/5",
        accent: "border-accent-primary/20 bg-accent-primary/5"
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
      },
      interactive: {
        true: "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false
    }
  }
);
var AggregateCard = React30.forwardRef(
  ({
    metric,
    trend,
    comparison,
    sparklineData,
    icon,
    status,
    description,
    tooltip,
    loading = false,
    onClick,
    variant,
    size,
    interactive,
    className,
    ...props
  }, ref) => {
    const formatMetricValue = () => {
      if (metric.format) {
        return metric.format(metric.value);
      }
      if (typeof metric.value === "number") {
        const formatted = metric.value.toLocaleString(void 0, {
          minimumFractionDigits: metric.decimals ?? 0,
          maximumFractionDigits: metric.decimals ?? 2
        });
        return metric.unit ? `${metric.unit}${formatted}` : formatted;
      }
      return String(metric.value);
    };
    const getTrendColor = () => {
      if (!trend) return "text-text-secondary";
      switch (trend.direction) {
        case "up":
          return status === "error" ? "text-status-error" : "text-status-success";
        case "down":
          return status === "error" ? "text-status-success" : "text-status-error";
        default:
          return "text-text-secondary";
      }
    };
    const getTrendIcon = () => {
      if (!trend) return null;
      switch (trend.direction) {
        case "up":
          return /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4" });
        case "down":
          return /* @__PURE__ */ jsx(TrendingDown, { className: "w-4 h-4" });
        default:
          return /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4" });
      }
    };
    const renderSparkline = () => {
      if (!sparklineData || sparklineData.length === 0) return null;
      const max = Math.max(...sparklineData);
      const min = Math.min(...sparklineData);
      const range = max - min || 1;
      const width = 100;
      const height = 32;
      const points = sparklineData.map((value, index) => {
        const x = index / (sparklineData.length - 1) * width;
        const y = height - (value - min) / range * height;
        return `${x},${y}`;
      });
      return /* @__PURE__ */ jsx(
        "svg",
        {
          width,
          height,
          className: "absolute bottom-0 right-0 opacity-20",
          viewBox: `0 0 ${width} ${height}`,
          children: /* @__PURE__ */ jsx(
            "polyline",
            {
              points: points.join(" "),
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        }
      );
    };
    const computedVariant = status && !variant && status !== "neutral" ? status : variant;
    const isInteractive = interactive || !!onClick;
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: cn(
          aggregateCardVariants({
            variant: computedVariant,
            size,
            interactive: isInteractive
          }),
          className
        ),
        onClick,
        ...props,
        children: loading ? /* @__PURE__ */ jsxs("div", { className: "space-y-3 animate-pulse", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 w-24 bg-surface-subtle rounded" }),
          /* @__PURE__ */ jsx("div", { className: "h-8 w-32 bg-surface-subtle rounded" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 w-20 bg-surface-subtle rounded" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-secondary", children: metric.label }),
              tooltip && /* @__PURE__ */ jsx(
                "button",
                {
                  className: "text-text-tertiary hover:text-text-primary",
                  title: tooltip,
                  children: /* @__PURE__ */ jsx(Info, { className: "w-3.5 h-3.5" })
                }
              )
            ] }),
            icon && /* @__PURE__ */ jsx("div", { className: "text-text-tertiary", children: icon })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-text-primary tabular-nums", children: formatMetricValue() }) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
            trend && /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-1 text-sm font-medium", getTrendColor()), children: [
              getTrendIcon(),
              /* @__PURE__ */ jsxs("span", { children: [
                Math.abs(trend.value),
                "%",
                trend.label && /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs text-text-tertiary font-normal", children: trend.label })
              ] })
            ] }),
            description && /* @__PURE__ */ jsx("div", { className: "text-xs text-text-tertiary", children: description }),
            comparison && /* @__PURE__ */ jsxs("div", { className: "text-xs text-text-secondary", children: [
              comparison.label,
              ":",
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: comparison.format ? comparison.format(comparison.previous) : comparison.previous.toLocaleString() }),
              " \u2192 ",
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: comparison.format ? comparison.format(comparison.current) : comparison.current.toLocaleString() })
            ] })
          ] }) }),
          renderSparkline()
        ] })
      }
    );
  }
);
AggregateCard.displayName = "AggregateCard";
var AggregateCardGrid = ({
  children,
  columns = 3,
  gap = 4,
  className
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6"
  };
  const gapClass = {
    2: "gap-2",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8"
  };
  return /* @__PURE__ */ jsx("div", { className: cn("grid", gridCols[columns], gapClass[gap], className), children });
};
AggregateCardGrid.displayName = "AggregateCardGrid";
var calculateTrend = (current, previous) => {
  const change = (current - previous) / previous * 100;
  return {
    direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
    value: Math.abs(change)
  };
};
var aggregateData = (data, field, aggregation) => {
  switch (aggregation) {
    case "sum":
      return data.reduce((sum2, row) => sum2 + (Number(row[field]) || 0), 0);
    case "avg":
      const sum = data.reduce((s, row) => s + (Number(row[field]) || 0), 0);
      return data.length > 0 ? sum / data.length : 0;
    case "count":
      return data.length;
    case "min":
      return Math.min(...data.map((row) => Number(row[field]) || 0));
    case "max":
      return Math.max(...data.map((row) => Number(row[field]) || 0));
    default:
      return 0;
  }
};
var FilterPanel = ({
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
  className
}) => {
  const [internalState, setInternalState] = React30.useState({
    activeFilters: []
  });
  const [isExpanded, setIsExpanded] = React30.useState(defaultExpanded);
  const [presetName, setPresetName] = React30.useState("");
  const [showSaveDialog, setShowSaveDialog] = React30.useState(false);
  const state = externalState || internalState;
  const setState = onChange || setInternalState;
  const handleFilterChange = (fieldId, value, operator) => {
    const newFilters = state.activeFilters.filter((f) => f.fieldId !== fieldId);
    if (value !== null && value !== void 0 && value !== "") {
      newFilters.push({
        fieldId,
        value,
        operator
      });
    }
    setState({
      ...state,
      activeFilters: newFilters,
      activePreset: void 0
      // Clear active preset when manually changing
    });
  };
  const handleClearAll = () => {
    setState({
      activeFilters: [],
      activePreset: void 0
    });
  };
  const handleRemoveFilter = (fieldId) => {
    setState({
      ...state,
      activeFilters: state.activeFilters.filter((f) => f.fieldId !== fieldId)
    });
  };
  const handleSavePreset = () => {
    if (presetName && onSavePreset) {
      onSavePreset(presetName, state.activeFilters);
      setPresetName("");
      setShowSaveDialog(false);
    }
  };
  const handleLoadPreset = (preset) => {
    setState({
      activeFilters: preset.filters,
      activePreset: preset.id
    });
    onLoadPreset?.(preset);
  };
  const renderFilterInput = (field) => {
    const activeFilter = state.activeFilters.find((f) => f.fieldId === field.id);
    const value = activeFilter?.value;
    switch (field.type) {
      case "text":
        return /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: field.placeholder || `Search ${field.label.toLowerCase()}...`,
            value: value || "",
            onChange: (e) => handleFilterChange(field.id, e.target.value, "contains")
          }
        );
      case "number":
        return /* @__PURE__ */ jsx(
          Input,
          {
            type: "number",
            placeholder: field.placeholder || "Enter value...",
            value: value || "",
            onChange: (e) => handleFilterChange(field.id, e.target.value, "equals"),
            min: field.min,
            max: field.max,
            step: field.step
          }
        );
      case "date":
        return /* @__PURE__ */ jsx(
          Input,
          {
            type: "date",
            value: value || "",
            onChange: (e) => handleFilterChange(field.id, e.target.value, "equals")
          }
        );
      case "select":
        return /* @__PURE__ */ jsx(
          Select,
          {
            placeholder: field.placeholder || "Select...",
            value: value || "",
            onValueChange: (v) => handleFilterChange(field.id, v, "equals"),
            options: field.options || []
          }
        );
      case "boolean":
        return /* @__PURE__ */ jsx(
          Select,
          {
            placeholder: "Any",
            value: value === void 0 ? "" : String(value),
            onValueChange: (v) => handleFilterChange(field.id, v === "true", "equals"),
            options: [
              { label: "True", value: "true" },
              { label: "False", value: "false" }
            ]
          }
        );
      case "range":
        return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              placeholder: "Min",
              value: value?.[0] || "",
              onChange: (e) => handleFilterChange(
                field.id,
                [e.target.value, value?.[1] || ""],
                "between"
              ),
              min: field.min,
              max: field.max
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              placeholder: "Max",
              value: value?.[1] || "",
              onChange: (e) => handleFilterChange(
                field.id,
                [value?.[0] || "", e.target.value],
                "between"
              ),
              min: field.min,
              max: field.max
            }
          )
        ] });
      default:
        return null;
    }
  };
  const activeFilterCount = state.activeFilters.length;
  return /* @__PURE__ */ jsxs("div", { className: cn("border border-border-base rounded-lg bg-surface-base", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border-base bg-surface-elevated", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 text-text-secondary" }),
        /* @__PURE__ */ jsx("h3", { className: "font-medium text-text-primary", children: "Filters" }),
        activeFilterCount > 0 && /* @__PURE__ */ jsx(Badge, { variant: "default", size: "sm", children: activeFilterCount })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        activeFilterCount > 0 && /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: handleClearAll,
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
              "Clear"
            ]
          }
        ),
        collapsible && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setIsExpanded(!isExpanded),
            children: isExpanded ? "Collapse" : "Expand"
          }
        )
      ] })
    ] }),
    isExpanded && /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-6", children: [
      activeFilterCount > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 pb-4 border-b border-border-muted", children: state.activeFilters.map((filter) => {
        const field = fields.find((f) => f.id === filter.fieldId);
        if (!field) return null;
        return /* @__PURE__ */ jsxs(
          Badge,
          {
            variant: "outline",
            onRemove: () => handleRemoveFilter(filter.fieldId),
            children: [
              field.label,
              ": ",
              String(filter.value)
            ]
          },
          filter.fieldId
        );
      }) }),
      showPresets && presets.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-text-secondary uppercase", children: "Saved Filters" }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: presets.map((preset) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleLoadPreset(preset),
            className: cn(
              "px-3 py-2 text-sm text-left rounded-md border transition-colors",
              state.activePreset === preset.id ? "border-accent-primary bg-accent-primary/10 text-accent-primary font-medium" : "border-border-base hover:bg-surface-subtle"
            ),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: preset.name }),
                preset.isDefault && /* @__PURE__ */ jsx(Badge, { variant: "outline", size: "sm", children: "Default" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-text-tertiary mt-0.5", children: [
                preset.filters.length,
                " filter",
                preset.filters.length !== 1 ? "s" : ""
              ] })
            ]
          },
          preset.id
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: fields.map((field) => /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-text-primary", children: field.label }),
        renderFilterInput(field)
      ] }, field.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-4 border-t border-border-muted", children: [
        onSavePreset && /* @__PURE__ */ jsx(Fragment, { children: showSaveDialog ? /* @__PURE__ */ jsxs("div", { className: "flex-1 flex gap-2", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Preset name...",
              value: presetName,
              onChange: (e) => setPresetName(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") handleSavePreset();
                if (e.key === "Escape") setShowSaveDialog(false);
              }
            }
          ),
          /* @__PURE__ */ jsx(Button, { size: "sm", onClick: handleSavePreset, disabled: !presetName, children: "Save" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => setShowSaveDialog(false),
              children: "Cancel"
            }
          )
        ] }) : /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setShowSaveDialog(true),
            disabled: activeFilterCount === 0,
            children: [
              /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
              "Save Preset"
            ]
          }
        ) }),
        showExport && onExport && /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: onExport,
            disabled: activeFilterCount === 0,
            children: [
              /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
              "Export"
            ]
          }
        )
      ] })
    ] })
  ] });
};
FilterPanel.displayName = "FilterPanel";
var applyFilters = (data, filters) => {
  return data.filter((row) => {
    return filters.every((filter) => {
      const value = row[filter.fieldId];
      switch (filter.operator) {
        case "equals":
          return value === filter.value;
        case "contains":
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case "gt":
          return Number(value) > Number(filter.value);
        case "gte":
          return Number(value) >= Number(filter.value);
        case "lt":
          return Number(value) < Number(filter.value);
        case "lte":
          return Number(value) <= Number(filter.value);
        case "between":
          return Number(value) >= Number(filter.value[0]) && Number(value) <= Number(filter.value[1]);
        case "in":
          return Array.isArray(filter.value) && filter.value.includes(value);
        default:
          return true;
      }
    });
  });
};
var exportFilters = (filters) => {
  return JSON.stringify(filters, null, 2);
};
var importFilters = (json) => {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
};
var exportToCSV = (data, columns, options) => {
  const selectedColumns = columns.filter(
    (col) => !options.columns || options.columns.includes(col.id)
  );
  const lines = [];
  if (options.includeHeaders !== false) {
    lines.push(selectedColumns.map((col) => `"${col.label}"`).join(","));
  }
  data.forEach((row) => {
    const values = selectedColumns.map((col) => {
      const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
      const formatted = col.format ? col.format(value, row) : String(value ?? "");
      return `"${formatted.replace(/"/g, '""')}"`;
    });
    lines.push(values.join(","));
  });
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${options.filename || "export"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
var exportToJSON = (data, columns, options) => {
  const selectedColumns = columns.filter(
    (col) => !options.columns || options.columns.includes(col.id)
  );
  const exportData = data.map((row) => {
    const obj = {};
    selectedColumns.forEach((col) => {
      const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
      obj[col.id] = col.format ? col.format(value, row) : value;
    });
    return obj;
  });
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${options.filename || "export"}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
var exportToExcel = (data, columns, options) => {
  exportToCSV(data, columns, { ...options, filename: options.filename?.replace(".csv", "") });
  console.warn("[DataExporter] Excel export uses CSV format. Consider using xlsx library for true Excel support.");
};
var DataExporter = ({
  data,
  columns,
  filename = "export",
  formats = ["csv", "json", "excel"],
  defaultFormat = "csv",
  onExport,
  renderTrigger,
  className
}) => {
  const [isOpen, setIsOpen] = React30.useState(false);
  const [selectedFormat, setSelectedFormat] = React30.useState(defaultFormat);
  const [selectedColumns, setSelectedColumns] = React30.useState(
    new Set(columns.map((c) => c.id))
  );
  const [includeHeaders, setIncludeHeaders] = React30.useState(true);
  const [isExporting, setIsExporting] = React30.useState(false);
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options = {
        filename,
        format: selectedFormat,
        columns: Array.from(selectedColumns),
        includeHeaders
      };
      if (onExport) {
        onExport(selectedFormat, options);
      } else {
        switch (selectedFormat) {
          case "csv":
            exportToCSV(data, columns, options);
            break;
          case "json":
            exportToJSON(data, columns, options);
            break;
          case "excel":
            exportToExcel(data, columns, options);
            break;
          default:
            console.warn(`[DataExporter] Format ${selectedFormat} not implemented`);
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error("[DataExporter] Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };
  const handleToggleColumn = (columnId) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };
  const handleSelectAll = () => {
    setSelectedColumns(new Set(columns.map((c) => c.id)));
  };
  const handleDeselectAll = () => {
    setSelectedColumns(/* @__PURE__ */ new Set());
  };
  const formatIcons = {
    csv: /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }),
    json: /* @__PURE__ */ jsx(FileJson, { className: "w-4 h-4" }),
    excel: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-4 h-4" }),
    pdf: /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" })
  };
  if (!isOpen) {
    return renderTrigger ? renderTrigger({ onClick: () => setIsOpen(true), loading: isExporting }) : /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "outline",
        onClick: () => setIsOpen(true),
        loading: isExporting,
        className,
        children: [
          /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
          "Export Data"
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("border border-border-base rounded-lg bg-surface-base p-4 space-y-4", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-medium text-text-primary", children: "Export Data" }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsOpen(false), children: "Close" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-text-secondary", children: "Export Format" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: formats.map((format) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setSelectedFormat(format),
          className: cn(
            "flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors",
            selectedFormat === format ? "border-accent-primary bg-accent-primary/10 text-accent-primary" : "border-border-base hover:bg-surface-subtle"
          ),
          children: [
            formatIcons[format],
            /* @__PURE__ */ jsx("span", { className: "uppercase", children: format })
          ]
        },
        format
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm font-medium text-text-secondary", children: [
          "Columns (",
          selectedColumns.size,
          "/",
          columns.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSelectAll,
              className: "text-xs text-accent-primary hover:underline",
              children: "Select All"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleDeselectAll,
              className: "text-xs text-text-tertiary hover:underline",
              children: "Deselect All"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-48 overflow-y-auto border border-border-base rounded-md p-2 space-y-1", children: columns.map((column) => /* @__PURE__ */ jsxs(
        "label",
        {
          className: "flex items-center gap-2 px-2 py-1 rounded hover:bg-surface-subtle cursor-pointer",
          children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: selectedColumns.has(column.id),
                onCheckedChange: () => handleToggleColumn(column.id)
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: column.label })
          ]
        },
        column.id
      )) })
    ] }),
    (selectedFormat === "csv" || selectedFormat === "excel") && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-text-secondary", children: "Options" }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 px-2 py-1 rounded hover:bg-surface-subtle cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          Checkbox,
          {
            checked: includeHeaders,
            onCheckedChange: (checked) => setIncludeHeaders(!!checked)
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Include column headers" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-border-muted", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-text-secondary", children: [
        data.length,
        " row",
        data.length !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleExport,
          loading: isExporting,
          disabled: selectedColumns.size === 0,
          children: isExporting ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
            "Exporting..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
            "Export ",
            selectedFormat.toUpperCase()
          ] })
        }
      )
    ] })
  ] });
};
DataExporter.displayName = "DataExporter";
var DealJacket = ({
  data,
  onDocumentUpload,
  onDocumentDownload,
  onDocumentPreview,
  onDocumentDelete,
  onSignatureRequest,
  onStatusChange,
  onPrintPacket,
  readOnly = false,
  className
}) => {
  const [activeTab, setActiveTab] = React30.useState(
    "documents"
  );
  const [uploadingDocs, setUploadingDocs] = React30.useState(/* @__PURE__ */ new Set());
  const totalDocuments = data.documents.length;
  data.documents.filter((d) => d.required).length;
  const uploadedDocuments = data.documents.filter(
    (d) => d.status !== "pending" && d.status !== "rejected"
  ).length;
  data.documents.filter((d) => d.status === "signed").length;
  const completionPercentage = totalDocuments > 0 ? uploadedDocuments / totalDocuments * 100 : 0;
  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "text-text-secondary";
      case "pending_signatures":
        return "text-status-warning";
      case "submitted":
      case "in_review":
        return "text-accent-primary";
      case "approved":
      case "funded":
        return "text-status-success";
      case "rejected":
      case "cancelled":
        return "text-status-error";
      default:
        return "text-text-secondary";
    }
  };
  const getStatusLabel = (status) => {
    return status.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };
  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-text-tertiary" });
      case "uploaded":
        return /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-accent-primary" });
      case "signed":
        return /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-status-success" });
      case "verified":
        return /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-status-success" });
      case "rejected":
        return /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4 text-status-error" });
      default:
        return /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-text-tertiary" });
    }
  };
  const handleFileUpload = async (docType, file) => {
    if (!onDocumentUpload) return;
    setUploadingDocs((prev) => /* @__PURE__ */ new Set([...prev, docType]));
    try {
      await onDocumentUpload(docType, file);
    } finally {
      setUploadingDocs((prev) => {
        const next = new Set(prev);
        next.delete(docType);
        return next;
      });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col h-full bg-surface-base rounded-lg border border-border-base", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border-base bg-surface-elevated", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-text-primary", children: "Deal Jacket" }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", children: data.dealNumber }),
          /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-1.5 text-sm font-medium", getStatusColor(data.status)), children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-current" }),
            getStatusLabel(data.status)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1 text-sm text-text-secondary", children: [
          data.customerName,
          " \u2022 ",
          data.vehicleDescription
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: !readOnly && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: onPrintPacket, children: [
          /* @__PURE__ */ jsx(Printer, { className: "w-4 h-4" }),
          "Print Packet"
        ] }),
        data.status === "draft" && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "primary",
            size: "sm",
            onClick: () => onStatusChange?.("submitted"),
            disabled: completionPercentage < 100,
            children: "Submit for Review"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-border-base bg-surface-subtle", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-text-primary", children: [
          "Completion: ",
          uploadedDocuments,
          " / ",
          totalDocuments,
          " documents"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-text-secondary", children: [
          Math.round(completionPercentage),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Progress, { value: completionPercentage, className: "h-2" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex border-b border-border-base bg-surface-elevated", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("documents"),
          className: cn(
            "px-4 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === "documents" ? "border-accent-primary text-accent-primary" : "border-transparent text-text-secondary hover:text-text-primary"
          ),
          children: [
            "Documents (",
            totalDocuments,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("compliance"),
          className: cn(
            "px-4 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === "compliance" ? "border-accent-primary text-accent-primary" : "border-transparent text-text-secondary hover:text-text-primary"
          ),
          children: [
            "Compliance (",
            data.complianceChecks.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("audit"),
          className: cn(
            "px-4 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === "audit" ? "border-accent-primary text-accent-primary" : "border-transparent text-text-secondary hover:text-text-primary"
          ),
          children: [
            "Audit Trail (",
            data.auditTrail.length,
            ")"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto p-6", children: [
      activeTab === "documents" && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: data.documents.map((doc) => {
        const isUploading = uploadingDocs.has(doc.type);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "flex items-center justify-between px-4 py-3 rounded-lg border transition-colors",
              doc.status === "verified" ? "border-status-success/20 bg-status-success/5" : doc.status === "rejected" ? "border-status-error/20 bg-status-error/5" : "border-border-base bg-surface-elevated hover:bg-surface-subtle"
            ),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-1", children: [
                getDocumentStatusIcon(doc.status),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-text-primary", children: doc.label }),
                    doc.required && /* @__PURE__ */ jsx(Badge, { variant: "outline", size: "sm", children: "Required" }),
                    doc.version && doc.version > 1 && /* @__PURE__ */ jsxs(Badge, { variant: "outline", size: "sm", children: [
                      "v",
                      doc.version
                    ] })
                  ] }),
                  doc.fileName && /* @__PURE__ */ jsxs("div", { className: "mt-0.5 text-xs text-text-tertiary", children: [
                    doc.fileName,
                    " \u2022 ",
                    ((doc.fileSize || 0) / 1024).toFixed(1),
                    " KB",
                    doc.uploadedBy && ` \u2022 Uploaded by ${doc.uploadedBy}`
                  ] }),
                  doc.rejectionReason && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-status-error", children: doc.rejectionReason })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                doc.status === "pending" && !readOnly && /* @__PURE__ */ jsxs("label", { children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "file",
                      className: "sr-only",
                      onChange: (e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(doc.type, file);
                      },
                      disabled: isUploading
                    }
                  ),
                  /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", disabled: isUploading, asChild: true, children: /* @__PURE__ */ jsxs("span", { children: [
                    /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }),
                    isUploading ? "Uploading..." : "Upload"
                  ] }) })
                ] }),
                doc.fileUrl && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      onClick: () => onDocumentPreview?.(doc),
                      children: [
                        /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
                        "Preview"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      onClick: () => onDocumentDownload?.(doc),
                      children: /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" })
                    }
                  )
                ] }),
                doc.status === "uploaded" && !readOnly && /* @__PURE__ */ jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => onSignatureRequest?.([data.customerName]),
                    children: [
                      /* @__PURE__ */ jsx(Unlock, { className: "w-4 h-4" }),
                      "Request Signature"
                    ]
                  }
                )
              ] })
            ]
          },
          doc.id
        );
      }) }),
      activeTab === "compliance" && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: data.complianceChecks.map((check) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "flex items-start justify-between px-4 py-3 rounded-lg border",
            check.status === "passed" ? "border-status-success/20 bg-status-success/5" : check.status === "failed" ? "border-status-error/20 bg-status-error/5" : "border-border-base bg-surface-elevated"
          ),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              check.status === "passed" && /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5 text-status-success mt-0.5" }),
              check.status === "failed" && /* @__PURE__ */ jsx(XCircle, { className: "w-5 h-5 text-status-error mt-0.5" }),
              check.status === "pending" && /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-text-tertiary mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-text-primary", children: check.label }),
                check.message && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-text-secondary", children: check.message })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              Badge,
              {
                variant: check.status === "passed" ? "success" : check.status === "failed" ? "error" : "default",
                size: "sm",
                children: check.status
              }
            )
          ]
        },
        check.id
      )) }),
      activeTab === "audit" && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: data.auditTrail.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((entry) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-start gap-3 px-4 py-3 rounded-lg bg-surface-elevated border border-border-base",
          children: [
            /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-text-tertiary mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-text-primary", children: entry.user }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-text-tertiary", children: entry.timestamp.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-sm text-text-secondary", children: entry.action }),
              entry.details && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-text-tertiary", children: entry.details })
            ] })
          ]
        },
        entry.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-border-base bg-surface-elevated", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-text-secondary uppercase mb-2", children: "Signatures" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          data.signatures.customer ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-status-success" }) : /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-text-tertiary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-text-primary", children: "Customer" })
        ] }),
        data.signatures.cobuyer !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          data.signatures.cobuyer ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-status-success" }) : /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-text-tertiary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-text-primary", children: "Co-Buyer" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          data.signatures.salesPerson ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-status-success" }) : /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-text-tertiary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-text-primary", children: "Salesperson" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          data.signatures.manager ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-status-success" }) : /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-text-tertiary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-text-primary", children: "Manager" })
        ] }),
        data.signatures.fiManager !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          data.signatures.fiManager ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-status-success" }) : /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-text-tertiary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-text-primary", children: "F&I Manager" })
        ] })
      ] })
    ] })
  ] });
};
DealJacket.displayName = "DealJacket";
var getRequiredDocumentsForDealType = (dealType) => {
  const common = [
    "buyers_order",
    "drivers_license",
    "insurance_card",
    "odometer_disclosure"
  ];
  if (dealType === "finance" || dealType === "lease") {
    return [...common, "credit_app", "finance_contract"];
  }
  return common;
};
var calculateDocumentCompletionScore = (documents) => {
  const requiredDocs = documents.filter((d) => d.required);
  if (requiredDocs.length === 0) return 100;
  const completedRequired = requiredDocs.filter(
    (d) => d.status === "verified" || d.status === "signed"
  ).length;
  return completedRequired / requiredDocs.length * 100;
};
var DEAL_TRANSITIONS = [
  {
    from: "lead",
    to: "qualified",
    action: "Qualify Lead"
  },
  {
    from: "qualified",
    to: "appointment",
    action: "Schedule Appointment"
  },
  {
    from: "appointment",
    to: "showroom",
    action: "Customer Arrived"
  },
  {
    from: "showroom",
    to: "test_drive",
    action: "Start Test Drive",
    requiredDocuments: ["drivers_license"]
  },
  {
    from: "test_drive",
    to: "negotiation",
    action: "Begin Negotiation"
  },
  {
    from: "negotiation",
    to: "pending_approval",
    action: "Request Manager Approval",
    validations: [
      {
        field: "structure",
        message: "Deal structure must be complete",
        validator: (deal) => !!deal.structure
      }
    ]
  },
  {
    from: "pending_approval",
    to: "approved",
    action: "Approve Deal",
    requiredPermission: "APPROVE_DEAL"
  },
  {
    from: "approved",
    to: "finance",
    action: "Send to Finance",
    requiredDocuments: ["buyers_order", "credit_app"]
  },
  {
    from: "finance",
    to: "contracted",
    action: "Complete F&I",
    requiredDocuments: ["finance_contract"]
  },
  {
    from: "contracted",
    to: "delivered",
    action: "Deliver Vehicle"
  }
];
var DealWorkspace = ({
  data,
  onStageChange,
  onStatusChange,
  onActivityAdd,
  onDocumentAction,
  readOnly = false,
  className
}) => {
  const [transitioning, setTransitioning] = React30.useState(false);
  const [activeTab, setActiveTab] = React30.useState("overview");
  const availableTransitions = DEAL_TRANSITIONS.filter((t) => t.from === data.stage);
  const getStageColor = (stage) => {
    const stageColors = {
      lead: "bg-surface-subtle text-text-secondary",
      qualified: "bg-accent-primary/10 text-accent-primary",
      appointment: "bg-accent-primary/10 text-accent-primary",
      showroom: "bg-accent-primary/10 text-accent-primary",
      test_drive: "bg-accent-primary/20 text-accent-primary",
      negotiation: "bg-status-warning/10 text-status-warning",
      pending_approval: "bg-status-warning/20 text-status-warning",
      approved: "bg-status-success/10 text-status-success",
      finance: "bg-accent-primary/20 text-accent-primary",
      contracted: "bg-status-success/20 text-status-success",
      delivered: "bg-status-success text-white",
      lost: "bg-status-error/10 text-status-error"
    };
    return stageColors[stage] || "bg-surface-subtle text-text-secondary";
  };
  const getStageIcon = (stage) => {
    const stageIcons = {
      lead: /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }),
      qualified: /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }),
      appointment: /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
      showroom: /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }),
      test_drive: /* @__PURE__ */ jsx(Play, { className: "w-4 h-4" }),
      negotiation: /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4" }),
      pending_approval: /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
      approved: /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }),
      finance: /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }),
      contracted: /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }),
      delivered: /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }),
      lost: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
    };
    return stageIcons[stage] || /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" });
  };
  const getActivityIcon = (type) => {
    switch (type) {
      case "status_change":
        return /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4 text-accent-primary" });
      case "document":
        return /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-text-secondary" });
      case "note":
        return /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-text-secondary" });
      case "communication":
        return /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-accent-primary" });
      case "ai_action":
        return /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4 text-accent-primary" });
      case "approval":
        return /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-status-success" });
      default:
        return /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-text-tertiary" });
    }
  };
  const handleTransition = async (transition) => {
    if (transitioning || !onStageChange) return;
    if (transition.validations) {
      for (const validation of transition.validations) {
        if (!validation.validator(data)) {
          alert(validation.message);
          return;
        }
      }
    }
    setTransitioning(true);
    try {
      await onStageChange(transition.to);
      onActivityAdd?.({
        user: "Current User",
        // Should come from auth context
        userRole: "Salesperson",
        type: "status_change",
        title: transition.action,
        description: `Deal moved from ${transition.from} to ${transition.to}`
      });
    } catch (error) {
      console.error("Transition failed:", error);
    } finally {
      setTransitioning(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("flex h-full bg-surface-base", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border-base bg-surface-elevated", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("h1", { className: "text-xl font-bold text-text-primary", children: [
                "Deal #",
                data.dealNumber
              ] }),
              /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: data.status === "active" ? "success" : "default",
                  size: "sm",
                  children: data.status
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 text-sm text-text-secondary", children: [
              data.customer.name,
              " \u2022 ",
              data.vehicle.year,
              " ",
              data.vehicle.make,
              " ",
              data.vehicle.model
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", getStageColor(data.stage)), children: [
            getStageIcon(data.stage),
            /* @__PURE__ */ jsx("span", { children: data.stage.replace("_", " ").toUpperCase() })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          data.status === "active" && !readOnly && /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => onStatusChange?.("paused"),
              children: [
                /* @__PURE__ */ jsx(Pause, { className: "w-4 h-4" }),
                "Pause"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" }),
            "Add Note"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-6 py-3 border-b border-border-base bg-surface-subtle", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(FileText, { className: "w-3.5 h-3.5 text-text-tertiary" }),
          /* @__PURE__ */ jsxs("span", { className: "text-text-secondary", children: [
            "Docs: ",
            data.stats.documentsComplete,
            "/",
            data.stats.documentsTotal
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(CheckCircle, { className: "w-3.5 h-3.5 text-text-tertiary" }),
          /* @__PURE__ */ jsxs("span", { className: "text-text-secondary", children: [
            "Signatures: ",
            data.stats.signaturesComplete,
            "/",
            data.stats.signaturesTotal
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5 text-text-tertiary" }),
          /* @__PURE__ */ jsxs("span", { className: "text-text-secondary", children: [
            "Time in stage: ",
            Math.floor(data.timeInStage / 60),
            "h ",
            data.timeInStage % 60,
            "m"
          ] })
        ] }),
        data.metrics.closeProbability && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 ml-auto", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "w-3.5 h-3.5 text-accent-primary" }),
          /* @__PURE__ */ jsxs("span", { className: "text-accent-primary font-medium", children: [
            Math.round(data.metrics.closeProbability * 100),
            "% Close Prob"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxs(
        Tabs,
        {
          value: activeTab,
          onValueChange: (v) => setActiveTab(v),
          className: "h-full flex flex-col",
          children: [
            /* @__PURE__ */ jsx("div", { className: "border-b border-border-base px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setActiveTab("overview"),
                  className: cn(
                    "px-1 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "overview" ? "border-accent-primary text-accent-primary" : "border-transparent text-text-secondary hover:text-text-primary"
                  ),
                  children: "Overview"
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setActiveTab("documents"),
                  className: cn(
                    "px-1 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "documents" ? "border-accent-primary text-accent-primary" : "border-transparent text-text-secondary hover:text-text-primary"
                  ),
                  children: [
                    "Documents (",
                    data.stats.documentsTotal,
                    ")"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setActiveTab("activity"),
                  className: cn(
                    "px-1 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "activity" ? "border-accent-primary text-accent-primary" : "border-transparent text-text-secondary hover:text-text-primary"
                  ),
                  children: [
                    "Activity (",
                    data.activities.length,
                    ")"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setActiveTab("ai"),
                  className: cn(
                    "px-1 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "ai" ? "border-accent-primary text-accent-primary" : "border-transparent text-text-secondary hover:text-text-primary"
                  ),
                  children: "AI Insights"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto p-6", children: [
              activeTab === "overview" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-secondary uppercase", children: "Customer" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Name" }),
                      /* @__PURE__ */ jsx("span", { className: "text-text-primary font-medium", children: data.customer.name })
                    ] }),
                    data.customer.email && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Email" }),
                      /* @__PURE__ */ jsx("span", { className: "text-text-primary", children: data.customer.email })
                    ] }),
                    data.customer.phone && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Phone" }),
                      /* @__PURE__ */ jsx("span", { className: "text-text-primary", children: data.customer.phone })
                    ] }),
                    data.customer.creditScore && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Credit Score" }),
                      /* @__PURE__ */ jsx("span", { className: "text-text-primary font-medium", children: data.customer.creditScore })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-secondary uppercase", children: "Vehicle" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Stock" }),
                      /* @__PURE__ */ jsx("span", { className: "text-text-primary font-medium", children: data.vehicle.stock })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "VIN" }),
                      /* @__PURE__ */ jsx("span", { className: "text-text-primary font-mono text-xs", children: data.vehicle.vin })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Cost" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-text-primary", children: [
                        "$",
                        data.vehicle.cost.toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Price" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-text-primary font-medium", children: [
                        "$",
                        data.vehicle.price.toLocaleString()
                      ] })
                    ] })
                  ] })
                ] }),
                data.structure && /* @__PURE__ */ jsxs("div", { className: "space-y-4 col-span-2", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-secondary uppercase", children: "Deal Structure" }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Sale Price" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-text-primary font-medium", children: [
                        "$",
                        data.structure.salePrice.toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Down Payment" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-text-primary", children: [
                        "$",
                        data.structure.downPayment.toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Amount Financed" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-text-primary", children: [
                        "$",
                        data.structure.amountFinanced.toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Term" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-text-primary", children: [
                        data.structure.term,
                        " months"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Rate" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-text-primary", children: [
                        data.structure.rate.toFixed(2),
                        "%"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Payment" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-text-primary font-bold text-lg", children: [
                        "$",
                        data.structure.monthlyPayment.toLocaleString(),
                        "/mo"
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-4 col-span-2 pt-4 border-t border-border-base", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-secondary uppercase", children: "Profitability" }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4 text-sm", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "text-text-secondary", children: "Front End" }),
                      /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-accent-primary", children: [
                        "$",
                        data.metrics.frontEndProfit.toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "text-text-secondary", children: "Back End" }),
                      /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-accent-primary", children: [
                        "$",
                        data.metrics.backEndProfit.toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "text-text-secondary", children: "Gross Profit" }),
                      /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-status-success", children: [
                        "$",
                        data.metrics.grossProfit.toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "text-text-secondary", children: "Total Profit" }),
                      /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-status-success", children: [
                        "$",
                        data.metrics.totalProfit.toLocaleString()
                      ] })
                    ] })
                  ] })
                ] })
              ] }),
              activeTab === "activity" && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: data.activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((activity) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-start gap-3 p-3 rounded-lg border border-border-base bg-surface-elevated",
                  children: [
                    getActivityIcon(activity.type),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-text-primary", children: activity.title }),
                        /* @__PURE__ */ jsx(Badge, { variant: "outline", size: "sm", children: activity.userRole })
                      ] }),
                      activity.description && /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-xs text-text-secondary", children: activity.description }),
                      /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-text-tertiary", children: [
                        activity.user,
                        " \u2022 ",
                        activity.timestamp.toLocaleString()
                      ] })
                    ] })
                  ]
                },
                activity.id
              )) })
            ] })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "w-80 border-l border-border-base bg-surface-elevated p-4 space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-secondary uppercase", children: "Next Actions" }),
      data.timeInStage > 60 && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-status-warning/10 border border-status-warning/20", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 text-status-warning" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-text-primary", children: "Deal Stalling" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs text-text-secondary", children: [
          "Deal has been in ",
          data.stage.replace("_", " "),
          " for ",
          Math.floor(data.timeInStage / 60),
          " hours"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: availableTransitions.map((transition) => /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "w-full justify-between",
          onClick: () => handleTransition(transition),
          disabled: transitioning || readOnly,
          children: [
            /* @__PURE__ */ jsx("span", { children: transition.action }),
            /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
          ]
        },
        transition.to
      )) }),
      data.stats.documentsComplete < data.stats.documentsTotal && /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "primary",
          size: "sm",
          className: "w-full",
          onClick: () => onDocumentAction?.("upload"),
          children: [
            /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }),
            "Upload Documents (",
            data.stats.documentsTotal - data.stats.documentsComplete,
            " remaining)"
          ]
        }
      )
    ] })
  ] });
};
DealWorkspace.displayName = "DealWorkspace";
var canTransition = (from, to, userPermissions) => {
  const transition = DEAL_TRANSITIONS.find((t) => t.from === from && t.to === to);
  if (!transition) return false;
  if (transition.requiredPermission) {
    return userPermissions.includes(transition.requiredPermission);
  }
  return true;
};
var getStageProgress = (stage) => {
  const stages = [
    "lead",
    "qualified",
    "appointment",
    "showroom",
    "test_drive",
    "negotiation",
    "pending_approval",
    "approved",
    "finance",
    "contracted",
    "delivered"
  ];
  const index = stages.indexOf(stage);
  return index >= 0 ? (index + 1) / stages.length * 100 : 0;
};
var DASHBOARD_PRESETS = {
  salesperson: {
    id: "salesperson_default",
    name: "Salesperson Dashboard",
    role: "salesperson",
    isDefault: true,
    widgets: [
      { id: "w1", type: "active_deals", size: "lg", position: { row: 0, col: 0 }, visible: true },
      { id: "w2", type: "hot_leads", size: "md", position: { row: 0, col: 2 }, visible: true },
      { id: "w3", type: "appointments_today", size: "md", position: { row: 1, col: 0 }, visible: true },
      { id: "w4", type: "ai_insights", size: "md", position: { row: 1, col: 1 }, visible: true },
      { id: "w5", type: "revenue_month", size: "sm", position: { row: 2, col: 0 }, visible: true },
      { id: "w6", type: "conversion_rate", size: "sm", position: { row: 2, col: 1 }, visible: true }
    ]
  },
  sales_manager: {
    id: "sales_manager_default",
    name: "Sales Manager Dashboard",
    role: "sales_manager",
    isDefault: true,
    widgets: [
      { id: "w1", type: "team_performance", size: "xl", position: { row: 0, col: 0 }, visible: true },
      { id: "w2", type: "pending_approvals", size: "md", position: { row: 0, col: 3 }, visible: true },
      { id: "w3", type: "sales_funnel", size: "lg", position: { row: 1, col: 0 }, visible: true },
      { id: "w4", type: "revenue_month", size: "md", position: { row: 1, col: 2 }, visible: true },
      { id: "w5", type: "ai_insights", size: "md", position: { row: 2, col: 0 }, visible: true },
      { id: "w6", type: "inventory_alerts", size: "md", position: { row: 2, col: 1 }, visible: true }
    ]
  },
  fi_manager: {
    id: "fi_manager_default",
    name: "F&I Manager Dashboard",
    role: "fi_manager",
    isDefault: true,
    widgets: [
      { id: "w1", type: "finance_pending", size: "lg", position: { row: 0, col: 0 }, visible: true },
      { id: "w2", type: "credit_approvals", size: "md", position: { row: 0, col: 2 }, visible: true },
      { id: "w3", type: "profitability", size: "md", position: { row: 1, col: 0 }, visible: true },
      { id: "w4", type: "pending_deliveries", size: "md", position: { row: 1, col: 1 }, visible: true },
      { id: "w5", type: "revenue_month", size: "sm", position: { row: 2, col: 0 }, visible: true },
      { id: "w6", type: "ai_insights", size: "md", position: { row: 2, col: 1 }, visible: true }
    ]
  },
  gm: {
    id: "gm_default",
    name: "GM Dashboard",
    role: "gm",
    isDefault: true,
    widgets: [
      { id: "w1", type: "revenue_month", size: "xl", position: { row: 0, col: 0 }, visible: true },
      { id: "w2", type: "profitability", size: "lg", position: { row: 1, col: 0 }, visible: true },
      { id: "w3", type: "team_performance", size: "lg", position: { row: 1, col: 2 }, visible: true },
      { id: "w4", type: "aged_inventory", size: "md", position: { row: 2, col: 0 }, visible: true },
      { id: "w5", type: "sales_funnel", size: "md", position: { row: 2, col: 1 }, visible: true },
      { id: "w6", type: "ai_insights", size: "md", position: { row: 2, col: 2 }, visible: true }
    ]
  },
  admin: {
    id: "admin_default",
    name: "Admin Dashboard",
    role: "admin",
    isDefault: true,
    widgets: [
      { id: "w1", type: "recent_activity", size: "xl", position: { row: 0, col: 0 }, visible: true },
      { id: "w2", type: "tasks", size: "md", position: { row: 1, col: 0 }, visible: true },
      { id: "w3", type: "revenue_month", size: "sm", position: { row: 1, col: 1 }, visible: true },
      { id: "w4", type: "team_performance", size: "lg", position: { row: 2, col: 0 }, visible: true }
    ]
  },
  inventory_manager: {
    id: "inventory_manager_default",
    name: "Inventory Manager Dashboard",
    role: "inventory_manager",
    isDefault: true,
    widgets: [
      { id: "w1", type: "inventory_alerts", size: "lg", position: { row: 0, col: 0 }, visible: true },
      { id: "w2", type: "aged_inventory", size: "md", position: { row: 0, col: 2 }, visible: true },
      { id: "w3", type: "pending_deliveries", size: "md", position: { row: 1, col: 0 }, visible: true },
      { id: "w4", type: "revenue_month", size: "sm", position: { row: 1, col: 1 }, visible: true },
      { id: "w5", type: "ai_insights", size: "md", position: { row: 2, col: 0 }, visible: true }
    ]
  },
  bdc_agent: {
    id: "bdc_agent_default",
    name: "BDC Agent Dashboard",
    role: "bdc_agent",
    isDefault: true,
    widgets: [
      { id: "w1", type: "hot_leads", size: "lg", position: { row: 0, col: 0 }, visible: true },
      { id: "w2", type: "appointments_today", size: "md", position: { row: 0, col: 2 }, visible: true },
      { id: "w3", type: "tasks", size: "md", position: { row: 1, col: 0 }, visible: true },
      { id: "w4", type: "conversion_rate", size: "sm", position: { row: 1, col: 1 }, visible: true },
      { id: "w5", type: "recent_activity", size: "md", position: { row: 2, col: 0 }, visible: true }
    ]
  }
};
var RoleDashboard = ({
  role,
  context,
  preset: customPreset,
  onWidgetAction,
  onCustomize,
  onPresetChange,
  editable = false,
  className
}) => {
  const [activePreset, setActivePreset] = React30.useState(
    customPreset || DASHBOARD_PRESETS[role]
  );
  const urgentActionCount = context.urgentActions.filter(
    (a) => a.priority === "critical" || a.priority === "high"
  ).length;
  const getWidgetIcon = (type) => {
    const iconMap = {
      active_deals: /* @__PURE__ */ jsx(Target, { className: "w-5 h-5" }),
      hot_leads: /* @__PURE__ */ jsx(Users, { className: "w-5 h-5" }),
      appointments_today: /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5" }),
      pending_approvals: /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5" }),
      revenue_today: /* @__PURE__ */ jsx(DollarSign, { className: "w-5 h-5" }),
      revenue_month: /* @__PURE__ */ jsx(DollarSign, { className: "w-5 h-5" }),
      conversion_rate: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5" }),
      inventory_alerts: /* @__PURE__ */ jsx(Car, { className: "w-5 h-5" }),
      aged_inventory: /* @__PURE__ */ jsx(Car, { className: "w-5 h-5" }),
      pending_deliveries: /* @__PURE__ */ jsx(Car, { className: "w-5 h-5" }),
      finance_pending: /* @__PURE__ */ jsx(DollarSign, { className: "w-5 h-5" }),
      credit_approvals: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5" }),
      profitability: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5" }),
      team_performance: /* @__PURE__ */ jsx(Users, { className: "w-5 h-5" }),
      ai_insights: /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" }),
      tasks: /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5" }),
      recent_activity: /* @__PURE__ */ jsx(LayoutDashboard, { className: "w-5 h-5" }),
      sales_funnel: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5" })
    };
    return iconMap[type] || /* @__PURE__ */ jsx(LayoutDashboard, { className: "w-5 h-5" });
  };
  const getWidgetSizeClasses = (size) => {
    const sizeMap = {
      sm: "col-span-1 row-span-1",
      md: "col-span-1 row-span-1 md:col-span-2",
      lg: "col-span-1 row-span-2 md:col-span-2",
      xl: "col-span-1 row-span-2 md:col-span-4"
    };
    return sizeMap[size];
  };
  const getPriorityColor = (priority) => {
    const colorMap = {
      critical: "text-status-error",
      high: "text-status-warning",
      normal: "text-accent-primary",
      low: "text-text-secondary"
    };
    return colorMap[priority];
  };
  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case "active_deals":
        return /* @__PURE__ */ jsx("div", { className: "space-y-2", children: context.activeDeals.slice(0, 5).map((deal) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between p-3 rounded-md bg-surface-elevated border border-border-base hover:bg-surface-subtle transition-colors cursor-pointer",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-text-primary truncate", children: deal.customerName }),
                  /* @__PURE__ */ jsx(
                    Badge,
                    {
                      variant: deal.priority === "critical" ? "error" : "default",
                      size: "sm",
                      children: deal.status.replace("_", " ")
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-0.5 text-xs text-text-tertiary truncate", children: [
                  deal.vehicleDescription,
                  " \u2022 ",
                  deal.timeInState,
                  "m in state"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => onWidgetAction?.(widget.id, "view_deal"), children: "View" })
            ]
          },
          deal.id
        )) });
      case "hot_leads":
        return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-text-primary", children: context.metrics.leads.hot }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-text-secondary", children: [
            "Out of ",
            context.metrics.leads.total,
            " total leads"
          ] })
        ] });
      case "revenue_month":
        const revenueProgress = context.metrics.revenue.month / context.metrics.revenue.goal * 100;
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-4xl font-bold text-text-primary", children: [
            "$",
            (context.metrics.revenue.month / 1e3).toFixed(1),
            "K"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-text-secondary", children: [
            "$",
            (context.metrics.revenue.goal / 1e3).toFixed(0),
            "K goal \u2022 ",
            Math.round(revenueProgress),
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 bg-surface-subtle rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-accent-primary transition-all",
              style: { width: `${Math.min(revenueProgress, 100)}%` }
            }
          ) })
        ] });
      case "pending_approvals":
        const approvalCount = context.urgentActions.filter((a) => a.type === "approval").length;
        return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-status-warning", children: approvalCount }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-text-secondary", children: "Deals awaiting approval" }),
          approvalCount > 0 && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "w-full mt-2",
              onClick: () => onWidgetAction?.(widget.id, "view_approvals"),
              children: "Review Now"
            }
          )
        ] });
      case "ai_insights":
        const criticalInsights = context.urgentActions.filter((a) => a.priority === "critical").length;
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-accent-primary", children: criticalInsights }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-text-secondary", children: "critical insights" })
          ] }),
          context.urgentActions.slice(0, 3).map((action) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "p-2 rounded-md bg-surface-elevated border border-border-base text-xs",
              children: [
                /* @__PURE__ */ jsx("div", { className: cn("font-medium", getPriorityColor(action.priority)), children: action.type.replace("_", " ").toUpperCase() }),
                /* @__PURE__ */ jsx("div", { className: "text-text-secondary mt-0.5", children: action.description })
              ]
            },
            action.id
          ))
        ] });
      default:
        return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-text-tertiary", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: "--" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs mt-1", children: "No data" })
        ] }) });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col h-full bg-surface-base", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border-base bg-surface-elevated", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-text-primary", children: activePreset.name }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-text-secondary", children: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        urgentActionCount > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "error", size: "lg", children: [
          urgentActionCount,
          " Urgent Actions"
        ] }),
        editable && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: onCustomize, children: [
            /* @__PURE__ */ jsx(Settings, { className: "w-4 h-4" }),
            "Customize"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "Add Widget"
          ] })
        ] })
      ] })
    ] }),
    urgentActionCount > 0 && /* @__PURE__ */ jsx("div", { className: "px-6 py-3 bg-status-warning/10 border-b border-status-warning/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-status-warning" }),
      /* @__PURE__ */ jsxs("span", { className: "font-medium text-text-primary", children: [
        "You have ",
        urgentActionCount,
        " urgent ",
        urgentActionCount === 1 ? "action" : "actions",
        " requiring attention"
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "ml-auto", children: "View All" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto p-6", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]", children: activePreset.widgets.filter((w) => w.visible).map((widget) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "relative rounded-lg border border-border-base bg-surface-elevated p-4 transition-shadow hover:shadow-md",
          getWidgetSizeClasses(widget.size),
          editable && "cursor-move"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "text-accent-primary", children: getWidgetIcon(widget.type) }),
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-text-primary", children: widget.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) })
            ] }),
            editable && /* @__PURE__ */ jsx(GripVertical, { className: "w-4 h-4 text-text-tertiary" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-[calc(100%-2rem)]", children: renderWidgetContent(widget) })
        ]
      },
      widget.id
    )) }) })
  ] });
};
RoleDashboard.displayName = "RoleDashboard";
var calculateUrgencyScore = (deal) => {
  let score = 0;
  if (deal.timeInState > 120) score += 40;
  else if (deal.timeInState > 60) score += 25;
  else if (deal.timeInState > 30) score += 10;
  if (deal.priority === "critical") score += 30;
  else if (deal.priority === "high") score += 20;
  else if (deal.priority === "normal") score += 10;
  if (deal.status === "negotiation") score += 20;
  if (deal.status === "pending_approval") score += 15;
  if (deal.status === "in_showroom") score += 10;
  return Math.min(score, 100);
};
var getRecommendedWidgetsForRole = (role) => {
  const roleWidgets = {
    salesperson: ["active_deals", "hot_leads", "appointments_today", "revenue_month", "ai_insights"],
    sales_manager: ["team_performance", "pending_approvals", "sales_funnel", "revenue_month", "ai_insights"],
    fi_manager: ["finance_pending", "credit_approvals", "profitability", "pending_deliveries", "ai_insights"],
    gm: ["revenue_month", "profitability", "team_performance", "sales_funnel", "aged_inventory"],
    admin: ["recent_activity", "tasks", "revenue_month", "team_performance"],
    inventory_manager: ["inventory_alerts", "aged_inventory", "pending_deliveries", "revenue_month"],
    bdc_agent: ["hot_leads", "appointments_today", "tasks", "conversion_rate", "recent_activity"]
  };
  return roleWidgets[role] || [];
};
var BREAKPOINTS = {
  // Mobile (< 640px)
  sm: 640,
  // Large mobile / Small tablet
  md: 768,
  // Tablet
  lg: 1024,
  // Desktop
  xl: 1280,
  // Large desktop
  "2xl": 1536
  // Extra large desktop
};
function getBreakpoint(width) {
  if (width < BREAKPOINTS.sm) return "xs";
  if (width < BREAKPOINTS.md) return "sm";
  if (width < BREAKPOINTS.lg) return "md";
  if (width < BREAKPOINTS.xl) return "lg";
  if (width < BREAKPOINTS["2xl"]) return "xl";
  return "2xl";
}
function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(
    () => typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "lg"
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(document.documentElement);
      return () => {
        resizeObserver.disconnect();
      };
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return breakpoint;
}
function useMobileBreakpoint() {
  const breakpoint = useBreakpoint();
  return breakpoint === "xs";
}
function ListDetailLayout({
  list,
  detail,
  showDetail = false,
  onBack,
  listWidth = "md",
  className
}) {
  const isMobile = useMobileBreakpoint();
  const widthClasses = {
    sm: "w-80",
    // 320px
    md: "w-96",
    // 384px
    lg: "w-[480px]"
    // 480px
  };
  if (isMobile) {
    return /* @__PURE__ */ jsxs("div", { className: cn("h-full", className), children: [
      /* @__PURE__ */ jsx("div", { className: cn("h-full overflow-auto", showDetail && "hidden"), children: list }),
      showDetail && detail && /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
        /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-10 flex items-center gap-2 border-b border-default bg-elevated px-4 py-3", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onBack,
            className: "flex items-center gap-2 text-sm text-secondary hover:text-primary",
            children: [
              /* @__PURE__ */ jsx(ChevronLeft, { className: "h-[18px] w-[18px]" }),
              /* @__PURE__ */ jsx("span", { children: "Back" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto", children: detail })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("flex h-full", className), children: [
    /* @__PURE__ */ jsx("div", { className: cn(
      "flex-shrink-0 border-r border-default bg-elevated overflow-auto",
      widthClasses[listWidth]
    ), children: list }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto bg-canvas", children: detail || /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-center text-tertiary", children: /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Select an item to view details" }) }) }) })
  ] });
}
ListDetailLayout.displayName = "ListDetailLayout";
function FullDensityLayout({
  children,
  toolbar,
  mobileSummary,
  maxWidth = "full",
  padding = "md",
  className
}) {
  const isMobile = useMobileBreakpoint();
  const maxWidthClasses = {
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-none"
  };
  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };
  return /* @__PURE__ */ jsx("div", { className: cn("h-full overflow-auto", className), children: /* @__PURE__ */ jsxs("div", { className: cn("mx-auto", maxWidthClasses[maxWidth], paddingClasses[padding]), children: [
    toolbar && /* @__PURE__ */ jsx("div", { className: "mb-4 flex items-center justify-between", children: toolbar }),
    isMobile && mobileSummary ? (
      // Mobile: Show summary cards instead of full DataTable
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: mobileSummary })
    ) : (
      // Desktop: Show full content
      children
    )
  ] }) });
}
FullDensityLayout.displayName = "FullDensityLayout";
function FocusStudioLayout({
  left,
  center,
  right,
  mobileHeader,
  onClose,
  className
}) {
  const isMobile = useMobileBreakpoint();
  const [aiCollapsed, setAiCollapsed] = useState(false);
  if (isMobile) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 z-40 bg-black/50",
          onClick: onClose
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col rounded-t-2xl bg-canvas shadow-2xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-10 flex items-center justify-between border-b border-default bg-elevated px-4 py-3", children: [
          mobileHeader || /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold", children: "Deal Studio" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              className: "rounded p-1.5 text-secondary hover:bg-inset hover:text-primary",
              children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto", children: [
          /* @__PURE__ */ jsx("div", { className: "border-b border-default p-4", children: left }),
          /* @__PURE__ */ jsxs("div", { className: "border-b border-default", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setAiCollapsed(!aiCollapsed),
                className: "flex w-full items-center justify-between bg-elevated px-4 py-3 text-left",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-primary", children: "AI Recommendations" }),
                  aiCollapsed ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-[18px] w-[18px]" }) : /* @__PURE__ */ jsx(ChevronUp, { className: "h-[18px] w-[18px]" })
                ]
              }
            ),
            !aiCollapsed && /* @__PURE__ */ jsx("div", { className: "p-4", children: right })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-4", children: center })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("flex h-full", className), children: [
    /* @__PURE__ */ jsx("div", { className: "w-1/4 border-r border-default bg-elevated overflow-auto", children: left }),
    /* @__PURE__ */ jsx("div", { className: "w-1/2 overflow-auto bg-canvas", children: center }),
    /* @__PURE__ */ jsx("div", { className: "w-1/4 border-l border-default bg-elevated overflow-auto", children: right })
  ] });
}
FocusStudioLayout.displayName = "FocusStudioLayout";
var boxVariants = cva("", {
  variants: {
    /**
     * Display mode
     */
    display: {
      block: "block",
      inline: "inline",
      "inline-block": "inline-block",
      flex: "flex",
      "inline-flex": "inline-flex",
      grid: "grid",
      "inline-grid": "inline-grid",
      none: "hidden"
    },
    /**
     * Position
     */
    position: {
      static: "static",
      relative: "relative",
      absolute: "absolute",
      fixed: "fixed",
      sticky: "sticky"
    },
    /**
     * Padding (using tokens from @repo/tokens)
     */
    padding: {
      none: "p-0",
      xs: "p-1",
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
      xl: "p-6",
      "2xl": "p-8"
    },
    /**
     * Margin (using tokens from @repo/tokens)
     */
    margin: {
      none: "m-0",
      xs: "m-1",
      sm: "m-2",
      md: "m-3",
      lg: "m-4",
      xl: "m-6",
      "2xl": "m-8",
      auto: "m-auto"
    },
    /**
     * Width
     */
    width: {
      auto: "w-auto",
      full: "w-full",
      screen: "w-screen",
      min: "w-min",
      max: "w-max",
      fit: "w-fit"
    },
    /**
     * Height
     */
    height: {
      auto: "h-auto",
      full: "h-full",
      screen: "h-screen",
      min: "h-min",
      max: "h-max",
      fit: "h-fit"
    },
    /**
     * Overflow
     */
    overflow: {
      visible: "overflow-visible",
      hidden: "overflow-hidden",
      scroll: "overflow-scroll",
      auto: "overflow-auto"
    }
  },
  defaultVariants: {
    display: "block",
    position: "relative"
  }
});
var Box = React30.forwardRef(
  ({
    as: Component = "div",
    className,
    display,
    position,
    padding,
    margin,
    width,
    height,
    overflow,
    children,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      Component,
      {
        ref,
        className: cn(
          boxVariants({
            display,
            position,
            padding,
            margin,
            width,
            height,
            overflow
          }),
          className
        ),
        ...props,
        children
      }
    );
  }
);
Box.displayName = "Box";
var stackVariants = cva("flex flex-col", {
  variants: {
    /**
     * Gap between items (from @repo/tokens spacing)
     */
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-6",
      "2xl": "gap-8"
    },
    /**
     * Alignment on cross-axis (horizontal)
     */
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline"
    },
    /**
     * Justification on main-axis (vertical)
     */
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly"
    },
    /**
     * Width control
     */
    width: {
      auto: "w-auto",
      full: "w-full"
    }
  },
  defaultVariants: {
    gap: "md",
    align: "stretch",
    justify: "start",
    width: "full"
  }
});
var Stack = React30.forwardRef(
  ({ as: Component = "div", className, gap, align, justify, width, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Component,
      {
        ref,
        className: cn(stackVariants({ gap, align, justify, width }), className),
        ...props,
        children
      }
    );
  }
);
Stack.displayName = "Stack";
var inlineVariants = cva("flex flex-row", {
  variants: {
    /**
     * Gap between items (from @repo/tokens spacing)
     */
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-6",
      "2xl": "gap-8"
    },
    /**
     * Alignment on cross-axis (vertical)
     */
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline"
    },
    /**
     * Justification on main-axis (horizontal)
     */
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly"
    },
    /**
     * Wrap behavior
     */
    wrap: {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      "wrap-reverse": "flex-wrap-reverse"
    }
  },
  defaultVariants: {
    gap: "md",
    align: "center",
    justify: "start",
    wrap: "nowrap"
  }
});
var Inline = React30.forwardRef(
  ({ as: Component = "div", className, gap, align, justify, wrap, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Component,
      {
        ref,
        className: cn(inlineVariants({ gap, align, justify, wrap }), className),
        ...props,
        children
      }
    );
  }
);
Inline.displayName = "Inline";
var surfaceVariants = cva("rounded-lg", {
  variants: {
    /**
     * Background variant (from @repo/tokens surface colors)
     */
    variant: {
      base: "bg-slate-50 dark:bg-gray-900",
      elevated: "bg-white dark:bg-gray-800",
      subtle: "bg-slate-100 dark:bg-gray-850",
      transparent: "bg-transparent",
      // Semantic status variants (from @repo/tokens status colors)
      ok: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      caution: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
      risk: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
      info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
      muted: "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
    },
    /**
     * Elevation level (shadow depth from @repo/tokens)
     */
    elevation: {
      none: "shadow-none",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl"
    },
    /**
     * Border style
     */
    border: {
      none: "border-0",
      default: "border border-slate-200 dark:border-gray-700",
      strong: "border-2 border-slate-300 dark:border-gray-600"
    },
    /**
     * Padding (from @repo/tokens spacing)
     */
    padding: {
      none: "p-0",
      xs: "p-1",
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
      xl: "p-6",
      "2xl": "p-8"
    },
    /**
     * Border radius
     */
    radius: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full"
    },
    /**
     * Interactive states
     */
    interactive: {
      none: "",
      hover: "hover:shadow-lg transition-shadow duration-200 cursor-pointer",
      press: "active:scale-[0.98] transition-transform duration-100 cursor-pointer"
    }
  },
  defaultVariants: {
    variant: "elevated",
    elevation: "sm",
    border: "default",
    padding: "md",
    radius: "lg",
    interactive: "none"
  }
});
var Surface = React30.forwardRef(
  ({
    as: Component = "div",
    className,
    variant,
    elevation,
    border,
    padding,
    radius,
    interactive,
    children,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      Component,
      {
        ref,
        className: cn(
          surfaceVariants({ variant, elevation, border, padding, radius, interactive }),
          className
        ),
        ...props,
        children
      }
    );
  }
);
Surface.displayName = "Surface";
var textVariants = cva("", {
  variants: {
    /**
     * Typography variant (from @repo/tokens typography)
     */
    variant: {
      // iOS Typography Scale
      largeTitle: "text-[34px] font-bold leading-[1.1] tracking-[-0.02em]",
      title1: "text-[28px] font-bold leading-[1.15] tracking-[-0.015em]",
      title2: "text-[22px] font-semibold leading-[1.2] tracking-[-0.01em]",
      title3: "text-[20px] font-semibold leading-[1.25]",
      body: "text-[17px] font-normal leading-[1.4]",
      bodySemibold: "text-[17px] font-semibold leading-[1.4] tracking-[-0.003em]",
      subheadline: "text-[15px] font-normal leading-[1.35]",
      footnote: "text-[13px] font-normal leading-[1.3]",
      footnoteSemibold: "text-[13px] font-semibold leading-[1.3]",
      caption: "text-[12px] font-normal leading-[1.3]",
      captionSemibold: "text-[12px] font-semibold leading-[1.3]",
      // Legacy variants (for backwards compatibility)
      display: "text-4xl font-bold tracking-tight",
      h1: "text-3xl font-bold",
      h2: "text-2xl font-semibold",
      h3: "text-xl font-semibold",
      h4: "text-lg font-medium",
      ui: "text-sm font-medium",
      mono: "font-mono text-sm"
    },
    /**
     * Color variant (from @repo/tokens text colors)
     */
    color: {
      primary: "text-slate-900 dark:text-slate-100",
      secondary: "text-slate-600 dark:text-slate-300",
      tertiary: "text-slate-500 dark:text-slate-400",
      muted: "text-slate-400 dark:text-slate-500",
      accent: "text-blue-600 dark:text-blue-400",
      success: "text-green-600 dark:text-green-400",
      warning: "text-orange-600 dark:text-orange-400",
      error: "text-red-600 dark:text-red-400",
      info: "text-sky-600 dark:text-sky-400"
    },
    /**
     * Font weight
     */
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold"
    },
    /**
     * Text alignment
     */
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify"
    },
    /**
     * Truncation
     */
    truncate: {
      none: "",
      single: "truncate",
      double: "line-clamp-2",
      triple: "line-clamp-3"
    }
  },
  defaultVariants: {
    variant: "body",
    color: "primary"
  }
});
var Text = React30.forwardRef(
  ({
    as: Component = "p",
    className,
    variant,
    color,
    weight,
    align,
    truncate,
    children,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      Component,
      {
        ref,
        className: cn(textVariants({ variant, color, weight, align, truncate }), className),
        ...props,
        children
      }
    );
  }
);
Text.displayName = "Text";
var cardShellVariants = cva("", {
  variants: {
    /**
     * Priority level (affects border color and visual emphasis)
     */
    priority: {
      critical: "border-l-4 border-l-red-500",
      high: "border-l-4 border-l-orange-500",
      normal: "",
      low: "opacity-90"
    },
    /**
     * Size
     */
    size: {
      SMALL: "min-h-[120px]",
      MEDIUM: "min-h-[200px]",
      LARGE: "min-h-[320px]",
      WIDE: "min-h-[160px]",
      FULL: "min-h-[400px]"
    }
  },
  defaultVariants: {
    priority: "normal",
    size: "MEDIUM"
  }
});
var CardShell = React30.forwardRef(
  ({
    as = "section",
    className,
    title,
    description,
    priority,
    size,
    isLoading,
    error,
    onRetry,
    interactive = false,
    role = "region",
    children,
    ...props
  }, ref) => {
    if (isLoading) {
      return /* @__PURE__ */ jsx(
        Surface,
        {
          as,
          ref,
          className: cn(cardShellVariants({ priority, size }), className),
          elevation: "sm",
          padding: "lg",
          role,
          "aria-label": title,
          "aria-busy": "true",
          "aria-live": "polite",
          ...props,
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-1/2" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-full" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-3/4" })
          ] })
        }
      );
    }
    if (error) {
      const errorMessage = typeof error === "string" ? error : error.message;
      return /* @__PURE__ */ jsx(
        Surface,
        {
          as,
          ref,
          className: cn(cardShellVariants({ priority, size }), className),
          elevation: "sm",
          padding: "lg",
          role,
          "aria-label": title,
          "aria-live": "assertive",
          ...props,
          children: /* @__PURE__ */ jsxs(Alert, { variant: "error", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Failed to load card" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 mt-1", children: errorMessage }),
            onRetry && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onRetry,
                className: "mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium underline",
                children: "Retry"
              }
            )
          ] })
        }
      );
    }
    return /* @__PURE__ */ jsx(
      Surface,
      {
        as,
        ref,
        className: cn(cardShellVariants({ priority, size }), className),
        elevation: "sm",
        padding: "lg",
        interactive: interactive ? "hover" : "none",
        role,
        "aria-label": title,
        "aria-description": description,
        tabIndex: interactive ? 0 : void 0,
        ...props,
        children
      }
    );
  }
);
CardShell.displayName = "CardShell";
var CardHeader2 = React30.forwardRef(
  ({ className, title, description, action, icon, ...props }, ref) => {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: cn("flex items-start justify-between mb-4", className),
        ...props,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [
            icon && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 mt-0.5", children: icon }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 dark:text-gray-100 truncate", children: title }),
              description && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate", children: description })
            ] })
          ] }),
          action && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 ml-2", children: action })
        ]
      }
    );
  }
);
CardHeader2.displayName = "CardHeader";
var metricVariants = cva("", {
  variants: {
    /**
     * Metric trend direction
     */
    trend: {
      up: "text-green-600 dark:text-green-400",
      down: "text-red-600 dark:text-red-400",
      neutral: "text-gray-600 dark:text-gray-400",
      none: ""
    }
  },
  defaultVariants: {
    trend: "none"
  }
});
var MetricCard = React30.forwardRef(
  ({
    className,
    title,
    description,
    value,
    label,
    change,
    trend = "none",
    icon,
    badge,
    action,
    size = "SMALL",
    ...shellProps
  }, ref) => {
    return /* @__PURE__ */ jsx(
      CardShell,
      {
        ref,
        className: cn("", className),
        title,
        description,
        size,
        ...shellProps,
        children: /* @__PURE__ */ jsxs(Stack, { gap: "md", align: "start", children: [
          title && /* @__PURE__ */ jsx(
            CardHeader2,
            {
              title,
              description,
              icon,
              action
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col justify-center", children: [
            /* @__PURE__ */ jsxs(Inline, { gap: "sm", align: "baseline", wrap: "wrap", children: [
              /* @__PURE__ */ jsx(
                Text,
                {
                  as: "span",
                  variant: "display",
                  color: "primary",
                  className: "font-bold",
                  children: value
                }
              ),
              change && /* @__PURE__ */ jsx(
                Text,
                {
                  as: "span",
                  variant: "ui",
                  className: cn(metricVariants({ trend })),
                  children: change
                }
              ),
              badge && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "ml-2", children: badge })
            ] }),
            /* @__PURE__ */ jsx(Text, { variant: "ui", color: "secondary", className: "mt-1", children: label })
          ] })
        ] })
      }
    );
  }
);
MetricCard.displayName = "MetricCard";
var ScrollArea = React30.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  ScrollAreaPrimitive.Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsx(ScrollBar, {}),
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Corner, {})
    ]
  }
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
var ScrollBar = React30.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx(
  ScrollAreaPrimitive.ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
var EmptyState = React30.forwardRef(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: cn(
          "flex flex-col items-center justify-center text-center p-8 min-h-[200px]",
          className
        ),
        ...props,
        children: [
          icon && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 rounded-full bg-surface-subtle text-text-tertiary", children: icon }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-text-primary mb-2", children: title }),
          description && /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary max-w-sm mb-4", children: description }),
          action && /* @__PURE__ */ jsx("div", { children: action })
        ]
      }
    );
  }
);
EmptyState.displayName = "EmptyState";
var DefaultListItem = ({
  item,
  onClick
}) => {
  const isClickable = !!onClick;
  return /* @__PURE__ */ jsx(
    "div",
    {
      onClick,
      className: cn(
        "p-3 rounded-md border border-slate-200 dark:border-gray-700",
        "hover:border-blue-300 dark:hover:border-blue-600 transition-colors",
        isClickable && "cursor-pointer active:scale-[0.99]"
      ),
      role: isClickable ? "button" : void 0,
      tabIndex: isClickable ? 0 : void 0,
      onKeyDown: isClickable ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      } : void 0,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        item.icon && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 mt-0.5", children: item.icon }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100 truncate", children: item.primary }),
          item.secondary && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate", children: item.secondary }),
          item.tertiary && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: item.tertiary })
        ] }),
        item.action && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: item.action })
      ] })
    }
  );
};
var ListCard = React30.forwardRef(
  ({
    className,
    title,
    description,
    items,
    emptyMessage = "No items to display",
    maxHeight,
    renderItem,
    icon,
    action,
    size = "MEDIUM",
    ...shellProps
  }, ref) => {
    const hasItems = items.length > 0;
    return /* @__PURE__ */ jsx(
      CardShell,
      {
        ref,
        className: cn("", className),
        title,
        description,
        size,
        ...shellProps,
        children: /* @__PURE__ */ jsxs(Stack, { gap: "md", className: "h-full", children: [
          title && /* @__PURE__ */ jsx(
            CardHeader2,
            {
              title,
              description,
              icon,
              action
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0", children: hasItems ? /* @__PURE__ */ jsx(
            ScrollArea,
            {
              className: "h-full",
              style: { maxHeight: maxHeight || "none" },
              children: /* @__PURE__ */ jsx(Stack, { gap: "sm", children: items.map(
                (item, index) => renderItem ? /* @__PURE__ */ jsx(React30.Fragment, { children: renderItem(item, index) }, item.id) : /* @__PURE__ */ jsx(DefaultListItem, { item, onClick: item.onClick }, item.id)
              ) })
            }
          ) : /* @__PURE__ */ jsx(
            EmptyState,
            {
              title: "No items",
              description: emptyMessage,
              className: "py-8"
            }
          ) })
        ] })
      }
    );
  }
);
ListCard.displayName = "ListCard";
var Sparkline = ({ data, className }) => {
  if (!data || data.length < 2) return null;
  const width = 200;
  const height = 40;
  const padding = 4;
  const values = data.map((d) => d.y);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = data.map((point, index) => {
    const x = index / (data.length - 1) * (width - padding * 2) + padding;
    const y = height - padding - (point.y - min) / range * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");
  return /* @__PURE__ */ jsx(
    "svg",
    {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      className: cn("text-blue-500", className),
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx(
        "polyline",
        {
          points,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
};
var TrendCard = React30.forwardRef(
  ({
    className,
    title,
    description,
    value,
    label,
    change,
    trend = "neutral",
    data,
    period,
    icon,
    action,
    size = "SMALL",
    ...shellProps
  }, ref) => {
    const trendColor = {
      up: "text-green-600 dark:text-green-400",
      down: "text-red-600 dark:text-red-400",
      neutral: "text-gray-600 dark:text-gray-400"
    }[trend];
    return /* @__PURE__ */ jsx(
      CardShell,
      {
        ref,
        className: cn("", className),
        title,
        description,
        size,
        ...shellProps,
        children: /* @__PURE__ */ jsxs(Stack, { gap: "md", children: [
          title && /* @__PURE__ */ jsx(CardHeader2, { title, description, icon, action }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(Inline, { gap: "sm", align: "baseline", wrap: "wrap", children: [
              /* @__PURE__ */ jsx(Text, { as: "span", variant: "display", color: "primary", className: "font-bold", children: value }),
              change && /* @__PURE__ */ jsx(Text, { as: "span", variant: "ui", className: trendColor, children: change })
            ] }),
            /* @__PURE__ */ jsx(Text, { variant: "ui", color: "secondary", className: "mt-1", children: label })
          ] }),
          data && data.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
            /* @__PURE__ */ jsx(Sparkline, { data }),
            period && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "mt-2", children: period })
          ] })
        ] })
      }
    );
  }
);
TrendCard.displayName = "TrendCard";
var BREAKPOINTS2 = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1920
};
function useMobile(breakpoint = "tablet") {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < BREAKPOINTS2[breakpoint];
  });
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS2[breakpoint] - 1}px)`);
    const handleChange = (e) => {
      setIsMobile(e.matches);
    };
    setIsMobile(mediaQuery.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [breakpoint]);
  return isMobile;
}
function useBreakpoint2() {
  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === "undefined") return "desktop";
    const width = window.innerWidth;
    if (width >= BREAKPOINTS2.ultrawide) return "ultrawide";
    if (width >= BREAKPOINTS2.wide) return "wide";
    if (width >= BREAKPOINTS2.desktop) return "desktop";
    if (width >= BREAKPOINTS2.tablet) return "tablet";
    return "mobile";
  });
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint;
      if (width >= BREAKPOINTS2.ultrawide) {
        newBreakpoint = "ultrawide";
      } else if (width >= BREAKPOINTS2.wide) {
        newBreakpoint = "wide";
      } else if (width >= BREAKPOINTS2.desktop) {
        newBreakpoint = "desktop";
      } else if (width >= BREAKPOINTS2.tablet) {
        newBreakpoint = "tablet";
      } else {
        newBreakpoint = "mobile";
      }
      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return breakpoint;
}
function useViewport() {
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") {
      return { width: 1024, height: 768 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  });
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return viewport;
}
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (e) => {
      setMatches(e.matches);
    };
    setMatches(mediaQuery.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [query]);
  return matches;
}
function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });
  useEffect(() => {
    const checkTouch = () => {
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener("touchstart", checkTouch, { once: true });
    return () => window.removeEventListener("touchstart", checkTouch);
  }, []);
  return isTouch;
}
function useResponsiveValue(values) {
  const breakpoint = useBreakpoint2();
  if (values[breakpoint] !== void 0) {
    return values[breakpoint];
  }
  const breakpointOrder = ["mobile", "tablet", "desktop", "wide", "ultrawide"];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  for (let i = currentIndex - 1; i >= 0; i--) {
    const fallbackBreakpoint = breakpointOrder[i];
    if (fallbackBreakpoint && values[fallbackBreakpoint] !== void 0) {
      return values[fallbackBreakpoint];
    }
  }
  return void 0;
}
var Home = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
  /* @__PURE__ */ jsx("polyline", { points: "9 22 9 12 15 12 15 22" })
] });
var Briefcase = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("rect", { x: "2", y: "7", width: "20", height: "14", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx("path", { d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" })
] });
var BarChart3 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M3 3v18h18" }),
  /* @__PURE__ */ jsx("path", { d: "M18 17V9" }),
  /* @__PURE__ */ jsx("path", { d: "M13 17V5" }),
  /* @__PURE__ */ jsx("path", { d: "M8 17v-3" })
] });
var Settings2 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" }),
  /* @__PURE__ */ jsx("path", { d: "M12 1v6m0 6v6m5.2-13a9 9 0 0 1 0 14m-10.4 0a9 9 0 0 1 0-14M1 12h6m6 0h6" })
] });
var ChevronRight4 = ({ size = 24, ...props }) => /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsx("polyline", { points: "9 18 15 12 9 6" }) });
var Phone = ({ size = 24, ...props }) => /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsx("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" }) });
var MessageSquare2 = ({ size = 24, ...props }) => /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) });
var Calendar3 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
] });
var Users3 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
  /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
  /* @__PURE__ */ jsx("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
  /* @__PURE__ */ jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
] });
var Car2 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M5 17h2m10 0h2M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-9-9h8l1.5 4.5H4.5L6 8z" }),
  /* @__PURE__ */ jsx("path", { d: "M3 11.5V17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5.5" })
] });
var FileText4 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
  /* @__PURE__ */ jsx("polyline", { points: "14 2 14 8 20 8" }),
  /* @__PURE__ */ jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
  /* @__PURE__ */ jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" }),
  /* @__PURE__ */ jsx("polyline", { points: "10 9 9 9 8 9" })
] });
var CheckCircle4 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
  /* @__PURE__ */ jsx("polyline", { points: "22 4 12 14.01 9 11.01" })
] });
var AlertCircle3 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
] });
var Clock4 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })
] });
var DollarSign3 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "1", x2: "12", y2: "23" }),
  /* @__PURE__ */ jsx("path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" })
] });
var TrendingUp4 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("polyline", { points: "23 6 13.5 15.5 8.5 10.5 1 18" }),
  /* @__PURE__ */ jsx("polyline", { points: "17 6 23 6 23 12" })
] });
var TrendingDown2 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("polyline", { points: "23 18 13.5 8.5 8.5 13.5 1 6" }),
  /* @__PURE__ */ jsx("polyline", { points: "17 18 23 18 23 12" })
] });
var X7 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
var MenuIcon = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
] });
var Search = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
  /* @__PURE__ */ jsx("path", { d: "m21 21-4.35-4.35" })
] });
var Sun = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "4" }),
  /* @__PURE__ */ jsx("path", { d: "M12 2v2" }),
  /* @__PURE__ */ jsx("path", { d: "M12 20v2" }),
  /* @__PURE__ */ jsx("path", { d: "m4.93 4.93 1.41 1.41" }),
  /* @__PURE__ */ jsx("path", { d: "m17.66 17.66 1.41 1.41" }),
  /* @__PURE__ */ jsx("path", { d: "M2 12h2" }),
  /* @__PURE__ */ jsx("path", { d: "M20 12h2" }),
  /* @__PURE__ */ jsx("path", { d: "m6.34 17.66-1.41 1.41" }),
  /* @__PURE__ */ jsx("path", { d: "m19.07 4.93-1.41 1.41" })
] });
var Moon = ({ size = 24, ...props }) => /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsx("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }) });
var Bell2 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
  /* @__PURE__ */ jsx("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" })
] });
var User2 = ({ size = 24, ...props }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }),
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "7", r: "4" })
] });

export { AggregateCard, AggregateCardGrid, Alert, AlertCircle3 as AlertCircle, AlertDescription, AlertTitle, Avatar, AvatarFallback, AvatarImage, BREAKPOINTS2 as BREAKPOINTS, Badge, BarChart3, Bell2 as Bell, Box, Briefcase, Button, Calendar3 as Calendar, Car2 as Car, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CheckCircle4 as CheckCircle, Checkbox, ChevronRight4 as ChevronRight, Chip, ChipGroup, Clock4 as Clock, DASHBOARD_PRESETS, DEAL_TRANSITIONS, DataExporter, DataTable, DealJacket, DealWorkspace, Divider, DollarSign3 as DollarSign, Dot, DotGroup, FileText4 as FileText, FilterPanel, FocusStudioLayout, FormField, FullDensityLayout, Home, IconButton, Inline, Input, Kbd, Label, ListCard, ListDetailLayout, LiveDataFeed, Menu, MenuIcon, MenuSeparator, MessageSquare2 as MessageSquare, MetricCard, Moon, Phone, PivotTable, Progress, PullToRefresh, QueryBuilder, Radio, RadioGroup, RadioGroupItem, RoleDashboard, Search, Select, Settings2 as Settings, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger, Skeleton, Spinner, Stack, Sun, Surface, SwipeableCard, Switch, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Text, Tooltip, TrendCard, TrendingDown2 as TrendingDown, TrendingUp4 as TrendingUp, User2 as User, Users3 as Users, X7 as X, aggregateData, alertVariants, applyFilters, avatarVariants, badgeVariants, boxVariants, buttonVariants, calculateDocumentCompletionScore, calculateTrend, calculateUrgencyScore, canTransition, cardVariants, checkboxVariants, cn, exportFilters, exportPivotToCSV, formDescriptionVariants, formFieldVariants, getRecommendedWidgetsForRole, getRequiredDocumentsForDealType, getStageProgress, importFilters, inlineVariants, inputVariants, labelVariants, metricVariants, progressBarVariants, progressVariants, queryToJSON, queryToSQL, radioVariants, selectVariants, sheetContentVariants, sheetOverlayVariants, skeletonVariants, stackVariants, surfaceVariants, switchVariants, tableVariants, textVariants, tooltipVariants, useBreakpoint2 as useBreakpoint, useLongPress, useMediaQuery, useMobile, usePullToRefresh, useResponsiveValue, useSwipeable, useSwipeableCard, useTouchDevice, useViewport };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map