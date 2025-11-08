"use client";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/primitives/Box.tsx
import * as React from "react";
import { cva } from "class-variance-authority";

// src/utils/cn.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/primitives/Box.tsx
import { jsx } from "react/jsx-runtime";
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
var Box = React.forwardRef(
  ({
    as: Component2 = "div",
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
      Component2,
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

// src/primitives/Stack.tsx
import * as React2 from "react";
import { cva as cva2 } from "class-variance-authority";
import { jsx as jsx2 } from "react/jsx-runtime";
var stackVariants = cva2("flex flex-col", {
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
var Stack = React2.forwardRef(
  ({ as: Component2 = "div", className, gap, align, justify, width, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx2(
      Component2,
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

// src/primitives/Inline.tsx
import * as React3 from "react";
import { cva as cva3 } from "class-variance-authority";
import { jsx as jsx3 } from "react/jsx-runtime";
var inlineVariants = cva3("flex flex-row", {
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
var Inline = React3.forwardRef(
  ({ as: Component2 = "div", className, gap, align, justify, wrap, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx3(
      Component2,
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

// src/primitives/Surface.tsx
import * as React4 from "react";
import { cva as cva4 } from "class-variance-authority";
import { jsx as jsx4 } from "react/jsx-runtime";
var surfaceVariants = cva4("rounded-lg", {
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
var Surface = React4.forwardRef(
  ({
    as: Component2 = "div",
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
    return /* @__PURE__ */ jsx4(
      Component2,
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

// src/primitives/Text.tsx
import * as React5 from "react";
import { cva as cva5 } from "class-variance-authority";
import { jsx as jsx5 } from "react/jsx-runtime";
var textVariants = cva5("", {
  variants: {
    /**
     * Typography variant (from @repo/tokens typography)
     */
    variant: {
      display: "text-4xl font-bold tracking-tight",
      h1: "text-3xl font-bold",
      h2: "text-2xl font-semibold",
      h3: "text-xl font-semibold",
      h4: "text-lg font-medium",
      body: "text-base font-normal",
      ui: "text-sm font-medium",
      caption: "text-xs font-normal",
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
var Text = React5.forwardRef(
  ({
    as: Component2 = "p",
    className,
    variant,
    color,
    weight,
    align,
    truncate,
    children,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx5(
      Component2,
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

// src/patterns/cards/CardShell.tsx
import * as React8 from "react";
import { cva as cva8 } from "class-variance-authority";

// src/components/Skeleton.tsx
import * as React6 from "react";
import { cva as cva6 } from "class-variance-authority";
import { jsx as jsx6 } from "react/jsx-runtime";
var skeletonVariants = cva6(
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
var Skeleton = React6.forwardRef(
  ({ className, variant, ...props }, ref) => {
    return /* @__PURE__ */ jsx6(
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

// src/components/Alert.tsx
import * as React7 from "react";
import { cva as cva7 } from "class-variance-authority";
import { jsx as jsx7, jsxs } from "react/jsx-runtime";
var alertVariants = cva7(
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
var Alert = React7.forwardRef(
  ({ className, variant, icon, title, action, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx7(
      "div",
      {
        ref,
        className: cn(alertVariants({ variant, className })),
        role: "alert",
        ...props,
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          icon && /* @__PURE__ */ jsx7("div", { className: "flex-shrink-0 mt-0.5", children: icon }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            title && /* @__PURE__ */ jsx7("h5", { className: "mb-1 font-bold text-sm leading-none tracking-tight", children: title }),
            /* @__PURE__ */ jsx7("div", { className: "text-sm opacity-90", children })
          ] }),
          action && /* @__PURE__ */ jsx7("div", { className: "flex-shrink-0", children: action })
        ] })
      }
    );
  }
);
Alert.displayName = "Alert";
var AlertTitle = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx7(
  "h5",
  {
    ref,
    className: `mb-1 font-medium leading-none tracking-tight ${className || ""}`,
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = React7.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx7(
  "div",
  {
    ref,
    className: `text-sm [&_p]:leading-relaxed ${className || ""}`,
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";

// src/patterns/cards/CardShell.tsx
import { jsx as jsx8, jsxs as jsxs2 } from "react/jsx-runtime";
var cardShellVariants = cva8("", {
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
var CardShell = React8.forwardRef(
  ({
    as = "section",
    className,
    title,
    description,
    priority,
    size: size4,
    isLoading,
    error,
    onRetry,
    interactive = false,
    role = "region",
    children,
    ...props
  }, ref) => {
    if (isLoading) {
      return /* @__PURE__ */ jsx8(
        Surface,
        {
          as,
          ref,
          className: cn(cardShellVariants({ priority, size: size4 }), className),
          elevation: "sm",
          padding: "lg",
          role,
          "aria-label": title,
          "aria-busy": "true",
          "aria-live": "polite",
          ...props,
          children: /* @__PURE__ */ jsxs2("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx8(Skeleton, { className: "h-4 w-1/2" }),
            /* @__PURE__ */ jsx8(Skeleton, { className: "h-8 w-full" }),
            /* @__PURE__ */ jsx8(Skeleton, { className: "h-3 w-3/4" })
          ] })
        }
      );
    }
    if (error) {
      const errorMessage = typeof error === "string" ? error : error.message;
      return /* @__PURE__ */ jsx8(
        Surface,
        {
          as,
          ref,
          className: cn(cardShellVariants({ priority, size: size4 }), className),
          elevation: "sm",
          padding: "lg",
          role,
          "aria-label": title,
          "aria-live": "assertive",
          ...props,
          children: /* @__PURE__ */ jsxs2(Alert, { variant: "error", children: [
            /* @__PURE__ */ jsx8("p", { className: "text-sm font-medium", children: "Failed to load card" }),
            /* @__PURE__ */ jsx8("p", { className: "text-xs text-gray-600 mt-1", children: errorMessage }),
            onRetry && /* @__PURE__ */ jsx8(
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
    return /* @__PURE__ */ jsx8(
      Surface,
      {
        as,
        ref,
        className: cn(cardShellVariants({ priority, size: size4 }), className),
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
var CardHeader = React8.forwardRef(
  ({ className, title, description, action, icon, ...props }, ref) => {
    return /* @__PURE__ */ jsxs2(
      "div",
      {
        ref,
        className: cn("flex items-start justify-between mb-4", className),
        ...props,
        children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [
            icon && /* @__PURE__ */ jsx8("div", { className: "flex-shrink-0 mt-0.5", children: icon }),
            /* @__PURE__ */ jsxs2("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx8("h3", { className: "text-base font-semibold text-gray-900 dark:text-gray-100 truncate", children: title }),
              description && /* @__PURE__ */ jsx8("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate", children: description })
            ] })
          ] }),
          action && /* @__PURE__ */ jsx8("div", { className: "flex-shrink-0 ml-2", children: action })
        ]
      }
    );
  }
);
CardHeader.displayName = "CardHeader";

// src/patterns/cards/MetricCard.tsx
import * as React10 from "react";
import { cva as cva10 } from "class-variance-authority";

// src/components/Badge.tsx
import * as React9 from "react";
import { cva as cva9 } from "class-variance-authority";
import { jsx as jsx9, jsxs as jsxs3 } from "react/jsx-runtime";
var badgeVariants = cva9(
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
var Badge = React9.forwardRef(
  ({ className, variant, size: size4, rounded, icon, onRemove, children, ...props }, ref) => {
    return /* @__PURE__ */ jsxs3(
      "div",
      {
        ref,
        className: cn(badgeVariants({ variant, size: size4, rounded, className })),
        ...props,
        children: [
          icon && /* @__PURE__ */ jsx9("span", { className: "flex-shrink-0", children: icon }),
          /* @__PURE__ */ jsx9("span", { children }),
          onRemove && /* @__PURE__ */ jsx9(
            "button",
            {
              type: "button",
              onClick: onRemove,
              className: "ml-0.5 flex-shrink-0 hover:opacity-70 transition-opacity",
              "aria-label": "Remove",
              children: /* @__PURE__ */ jsxs3(
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
                    /* @__PURE__ */ jsx9("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                    /* @__PURE__ */ jsx9("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
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

// src/patterns/cards/MetricCard.tsx
import { jsx as jsx10, jsxs as jsxs4 } from "react/jsx-runtime";
var metricVariants = cva10("", {
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
var MetricCard = React10.forwardRef(
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
    size: size4 = "SMALL",
    ...shellProps
  }, ref) => {
    return /* @__PURE__ */ jsx10(
      CardShell,
      {
        ref,
        className: cn("", className),
        title,
        description,
        size: size4,
        ...shellProps,
        children: /* @__PURE__ */ jsxs4(Stack, { gap: "md", align: "start", children: [
          title && /* @__PURE__ */ jsx10(
            CardHeader,
            {
              title,
              description,
              icon,
              action
            }
          ),
          /* @__PURE__ */ jsxs4("div", { className: "flex-1 flex flex-col justify-center", children: [
            /* @__PURE__ */ jsxs4(Inline, { gap: "sm", align: "baseline", wrap: "wrap", children: [
              /* @__PURE__ */ jsx10(
                Text,
                {
                  as: "span",
                  variant: "display",
                  color: "primary",
                  className: "font-bold",
                  children: value
                }
              ),
              change && /* @__PURE__ */ jsx10(
                Text,
                {
                  as: "span",
                  variant: "ui",
                  className: cn(metricVariants({ trend })),
                  children: change
                }
              ),
              badge && /* @__PURE__ */ jsx10(Badge, { variant: "secondary", className: "ml-2", children: badge })
            ] }),
            /* @__PURE__ */ jsx10(Text, { variant: "ui", color: "secondary", className: "mt-1", children: label })
          ] })
        ] })
      }
    );
  }
);
MetricCard.displayName = "MetricCard";

// src/patterns/cards/ListCard.tsx
import * as React21 from "react";

// src/components/ScrollArea.tsx
import * as React19 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-scroll-area@1.2.4_@types+react-dom@18.3.1_@types+react@18.3.12_react-do_361d5f0a4891962e67e076ae4eb477e4/node_modules/@radix-ui/react-scroll-area/dist/index.mjs
import * as React23 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-primitive@2.0.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-primitive/dist/index.mjs
import * as React11 from "react";
import * as ReactDOM from "react-dom";
import { createSlot } from "@radix-ui/react-slot";
import { jsx as jsx11 } from "react/jsx-runtime";
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot5 = createSlot(`Primitive.${node}`);
  const Node2 = React11.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot5 : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsx11(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node2.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node2 };
}, {});
function dispatchDiscreteCustomEvent(target, event) {
  if (target) ReactDOM.flushSync(() => target.dispatchEvent(event));
}

// ../../node_modules/.pnpm/@radix-ui+react-presence@1.1.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-presence/dist/index.mjs
import * as React22 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-compose-refs/dist/index.mjs
import * as React12 from "react";
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return React12.useCallback(composeRefs(...refs), refs);
}

// ../../node_modules/.pnpm/@radix-ui+react-use-layout-effect@1.1.1_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
import * as React13 from "react";
var useLayoutEffect2 = globalThis?.document ? React13.useLayoutEffect : () => {
};

// ../../node_modules/.pnpm/@radix-ui+react-presence@1.1.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-presence/dist/index.mjs
import * as React14 from "react";
function useStateMachine(initialState, machine) {
  return React14.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
var Presence = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);
  const child = typeof children === "function" ? children({ present: presence.isPresent }) : React22.Children.only(children);
  const ref = useComposedRefs(presence.ref, getElementRef(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? React22.cloneElement(child, { ref }) : null;
};
Presence.displayName = "Presence";
function usePresence(present) {
  const [node, setNode] = React22.useState();
  const stylesRef = React22.useRef({});
  const prevPresentRef = React22.useRef(present);
  const prevAnimationNameRef = React22.useRef("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  React22.useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
  }, [state]);
  useLayoutEffect2(() => {
    const styles2 = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles2);
      if (present) {
        send("MOUNT");
      } else if (currentAnimationName === "none" || styles2?.display === "none") {
        send("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }
      prevPresentRef.current = present;
    }
  }, [present, send]);
  useLayoutEffect2(() => {
    if (node) {
      let timeoutId;
      const ownerWindow = node.ownerDocument.defaultView ?? window;
      const handleAnimationEnd = (event) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(event.animationName);
        if (event.target === node && isCurrentAnimation) {
          send("ANIMATION_END");
          if (!prevPresentRef.current) {
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = "forwards";
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === "forwards") {
                node.style.animationFillMode = currentFillMode;
              }
            });
          }
        }
      };
      const handleAnimationStart = (event) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      };
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    } else {
      send("ANIMATION_END");
    }
  }, [node, send]);
  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: React22.useCallback((node2) => {
      if (node2) stylesRef.current = getComputedStyle(node2);
      setNode(node2);
    }, [])
  };
}
function getAnimationName(styles2) {
  return styles2?.animationName || "none";
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

// ../../node_modules/.pnpm/@radix-ui+react-context@1.1.2_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-context/dist/index.mjs
import * as React15 from "react";
import { jsx as jsx12 } from "react/jsx-runtime";
function createContext2(rootComponentName, defaultContext) {
  const Context = React15.createContext(defaultContext);
  const Provider2 = (props) => {
    const { children, ...context } = props;
    const value = React15.useMemo(() => context, Object.values(context));
    return /* @__PURE__ */ jsx12(Context.Provider, { value, children });
  };
  Provider2.displayName = rootComponentName + "Provider";
  function useContext22(consumerName) {
    const context = React15.useContext(Context);
    if (context) return context;
    if (defaultContext !== void 0) return defaultContext;
    throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
  }
  return [Provider2, useContext22];
}
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext32(rootComponentName, defaultContext) {
    const BaseContext = React15.createContext(defaultContext);
    const index2 = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider2 = (props) => {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName]?.[index2] || BaseContext;
      const value = React15.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsx12(Context.Provider, { value, children });
    };
    Provider2.displayName = rootComponentName + "Provider";
    function useContext22(consumerName, scope) {
      const Context = scope?.[scopeName]?.[index2] || BaseContext;
      const context = React15.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider2, useContext22];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React15.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return React15.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext32, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return React15.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

// ../../node_modules/.pnpm/@radix-ui+react-use-callback-ref@1.1.1_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
import * as React16 from "react";
function useCallbackRef(callback) {
  const callbackRef = React16.useRef(callback);
  React16.useEffect(() => {
    callbackRef.current = callback;
  });
  return React16.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}

// ../../node_modules/.pnpm/@radix-ui+react-direction@1.1.1_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-direction/dist/index.mjs
import * as React17 from "react";
import { jsx as jsx13 } from "react/jsx-runtime";
var DirectionContext = React17.createContext(void 0);
function useDirection(localDir) {
  const globalDir = React17.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}

// ../../node_modules/.pnpm/@radix-ui+number@1.1.1/node_modules/@radix-ui/number/dist/index.mjs
function clamp(value, [min2, max2]) {
  return Math.min(max2, Math.max(min2, value));
}

// ../../node_modules/.pnpm/@radix-ui+primitive@1.1.2/node_modules/@radix-ui/primitive/dist/index.mjs
function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return function handleEvent(event) {
    originalEventHandler?.(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

// ../../node_modules/.pnpm/@radix-ui+react-scroll-area@1.2.4_@types+react-dom@18.3.1_@types+react@18.3.12_react-do_361d5f0a4891962e67e076ae4eb477e4/node_modules/@radix-ui/react-scroll-area/dist/index.mjs
import * as React18 from "react";
import { Fragment, jsx as jsx14, jsxs as jsxs5 } from "react/jsx-runtime";
function useStateMachine2(initialState, machine) {
  return React18.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
var SCROLL_AREA_NAME = "ScrollArea";
var [createScrollAreaContext, createScrollAreaScope] = createContextScope(SCROLL_AREA_NAME);
var [ScrollAreaProvider, useScrollAreaContext] = createScrollAreaContext(SCROLL_AREA_NAME);
var ScrollArea = React23.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeScrollArea,
      type = "hover",
      dir,
      scrollHideDelay = 600,
      ...scrollAreaProps
    } = props;
    const [scrollArea, setScrollArea] = React23.useState(null);
    const [viewport, setViewport] = React23.useState(null);
    const [content, setContent] = React23.useState(null);
    const [scrollbarX, setScrollbarX] = React23.useState(null);
    const [scrollbarY, setScrollbarY] = React23.useState(null);
    const [cornerWidth, setCornerWidth] = React23.useState(0);
    const [cornerHeight, setCornerHeight] = React23.useState(0);
    const [scrollbarXEnabled, setScrollbarXEnabled] = React23.useState(false);
    const [scrollbarYEnabled, setScrollbarYEnabled] = React23.useState(false);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setScrollArea(node));
    const direction = useDirection(dir);
    return /* @__PURE__ */ jsx14(
      ScrollAreaProvider,
      {
        scope: __scopeScrollArea,
        type,
        dir: direction,
        scrollHideDelay,
        scrollArea,
        viewport,
        onViewportChange: setViewport,
        content,
        onContentChange: setContent,
        scrollbarX,
        onScrollbarXChange: setScrollbarX,
        scrollbarXEnabled,
        onScrollbarXEnabledChange: setScrollbarXEnabled,
        scrollbarY,
        onScrollbarYChange: setScrollbarY,
        scrollbarYEnabled,
        onScrollbarYEnabledChange: setScrollbarYEnabled,
        onCornerWidthChange: setCornerWidth,
        onCornerHeightChange: setCornerHeight,
        children: /* @__PURE__ */ jsx14(
          Primitive.div,
          {
            dir: direction,
            ...scrollAreaProps,
            ref: composedRefs,
            style: {
              position: "relative",
              // Pass corner sizes as CSS vars to reduce re-renders of context consumers
              ["--radix-scroll-area-corner-width"]: cornerWidth + "px",
              ["--radix-scroll-area-corner-height"]: cornerHeight + "px",
              ...props.style
            }
          }
        )
      }
    );
  }
);
ScrollArea.displayName = SCROLL_AREA_NAME;
var VIEWPORT_NAME = "ScrollAreaViewport";
var ScrollAreaViewport = React23.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, children, nonce, ...viewportProps } = props;
    const context = useScrollAreaContext(VIEWPORT_NAME, __scopeScrollArea);
    const ref = React23.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onViewportChange);
    return /* @__PURE__ */ jsxs5(Fragment, { children: [
      /* @__PURE__ */ jsx14(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: `[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`
          },
          nonce
        }
      ),
      /* @__PURE__ */ jsx14(
        Primitive.div,
        {
          "data-radix-scroll-area-viewport": "",
          ...viewportProps,
          ref: composedRefs,
          style: {
            /**
             * We don't support `visible` because the intention is to have at least one scrollbar
             * if this component is used and `visible` will behave like `auto` in that case
             * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
             *
             * We don't handle `auto` because the intention is for the native implementation
             * to be hidden if using this component. We just want to ensure the node is scrollable
             * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
             * the browser from having to work out whether to render native scrollbars or not,
             * we tell it to with the intention of hiding them in CSS.
             */
            overflowX: context.scrollbarXEnabled ? "scroll" : "hidden",
            overflowY: context.scrollbarYEnabled ? "scroll" : "hidden",
            ...props.style
          },
          children: /* @__PURE__ */ jsx14("div", { ref: context.onContentChange, style: { minWidth: "100%", display: "table" }, children })
        }
      )
    ] });
  }
);
ScrollAreaViewport.displayName = VIEWPORT_NAME;
var SCROLLBAR_NAME = "ScrollAreaScrollbar";
var ScrollAreaScrollbar = React23.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context;
    const isHorizontal = props.orientation === "horizontal";
    React23.useEffect(() => {
      isHorizontal ? onScrollbarXEnabledChange(true) : onScrollbarYEnabledChange(true);
      return () => {
        isHorizontal ? onScrollbarXEnabledChange(false) : onScrollbarYEnabledChange(false);
      };
    }, [isHorizontal, onScrollbarXEnabledChange, onScrollbarYEnabledChange]);
    return context.type === "hover" ? /* @__PURE__ */ jsx14(ScrollAreaScrollbarHover, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "scroll" ? /* @__PURE__ */ jsx14(ScrollAreaScrollbarScroll, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "auto" ? /* @__PURE__ */ jsx14(ScrollAreaScrollbarAuto, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "always" ? /* @__PURE__ */ jsx14(ScrollAreaScrollbarVisible, { ...scrollbarProps, ref: forwardedRef }) : null;
  }
);
ScrollAreaScrollbar.displayName = SCROLLBAR_NAME;
var ScrollAreaScrollbarHover = React23.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [visible, setVisible] = React23.useState(false);
  React23.useEffect(() => {
    const scrollArea = context.scrollArea;
    let hideTimer = 0;
    if (scrollArea) {
      const handlePointerEnter = () => {
        window.clearTimeout(hideTimer);
        setVisible(true);
      };
      const handlePointerLeave = () => {
        hideTimer = window.setTimeout(() => setVisible(false), context.scrollHideDelay);
      };
      scrollArea.addEventListener("pointerenter", handlePointerEnter);
      scrollArea.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        window.clearTimeout(hideTimer);
        scrollArea.removeEventListener("pointerenter", handlePointerEnter);
        scrollArea.removeEventListener("pointerleave", handlePointerLeave);
      };
    }
  }, [context.scrollArea, context.scrollHideDelay]);
  return /* @__PURE__ */ jsx14(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsx14(
    ScrollAreaScrollbarAuto,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarScroll = React23.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const isHorizontal = props.orientation === "horizontal";
  const debounceScrollEnd = useDebounceCallback(() => send("SCROLL_END"), 100);
  const [state, send] = useStateMachine2("hidden", {
    hidden: {
      SCROLL: "scrolling"
    },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: {
      SCROLL: "interacting",
      POINTER_LEAVE: "idle"
    },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  React23.useEffect(() => {
    if (state === "idle") {
      const hideTimer = window.setTimeout(() => send("HIDE"), context.scrollHideDelay);
      return () => window.clearTimeout(hideTimer);
    }
  }, [state, context.scrollHideDelay, send]);
  React23.useEffect(() => {
    const viewport = context.viewport;
    const scrollDirection = isHorizontal ? "scrollLeft" : "scrollTop";
    if (viewport) {
      let prevScrollPos = viewport[scrollDirection];
      const handleScroll2 = () => {
        const scrollPos = viewport[scrollDirection];
        const hasScrollInDirectionChanged = prevScrollPos !== scrollPos;
        if (hasScrollInDirectionChanged) {
          send("SCROLL");
          debounceScrollEnd();
        }
        prevScrollPos = scrollPos;
      };
      viewport.addEventListener("scroll", handleScroll2);
      return () => viewport.removeEventListener("scroll", handleScroll2);
    }
  }, [context.viewport, isHorizontal, send, debounceScrollEnd]);
  return /* @__PURE__ */ jsx14(Presence, { present: forceMount || state !== "hidden", children: /* @__PURE__ */ jsx14(
    ScrollAreaScrollbarVisible,
    {
      "data-state": state === "hidden" ? "hidden" : "visible",
      ...scrollbarProps,
      ref: forwardedRef,
      onPointerEnter: composeEventHandlers(props.onPointerEnter, () => send("POINTER_ENTER")),
      onPointerLeave: composeEventHandlers(props.onPointerLeave, () => send("POINTER_LEAVE"))
    }
  ) });
});
var ScrollAreaScrollbarAuto = React23.forwardRef((props, forwardedRef) => {
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const { forceMount, ...scrollbarProps } = props;
  const [visible, setVisible] = React23.useState(false);
  const isHorizontal = props.orientation === "horizontal";
  const handleResize = useDebounceCallback(() => {
    if (context.viewport) {
      const isOverflowX = context.viewport.offsetWidth < context.viewport.scrollWidth;
      const isOverflowY = context.viewport.offsetHeight < context.viewport.scrollHeight;
      setVisible(isHorizontal ? isOverflowX : isOverflowY);
    }
  }, 10);
  useResizeObserver(context.viewport, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ jsx14(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsx14(
    ScrollAreaScrollbarVisible,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarVisible = React23.forwardRef((props, forwardedRef) => {
  const { orientation = "vertical", ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const thumbRef = React23.useRef(null);
  const pointerOffsetRef = React23.useRef(0);
  const [sizes, setSizes] = React23.useState({
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  });
  const thumbRatio = getThumbRatio(sizes.viewport, sizes.content);
  const commonProps = {
    ...scrollbarProps,
    sizes,
    onSizesChange: setSizes,
    hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
    onThumbChange: (thumb) => thumbRef.current = thumb,
    onThumbPointerUp: () => pointerOffsetRef.current = 0,
    onThumbPointerDown: (pointerPos) => pointerOffsetRef.current = pointerPos
  };
  function getScrollPosition(pointerPos, dir) {
    return getScrollPositionFromPointer(pointerPos, pointerOffsetRef.current, sizes, dir);
  }
  if (orientation === "horizontal") {
    return /* @__PURE__ */ jsx14(
      ScrollAreaScrollbarX,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollLeft;
            const offset4 = getThumbOffsetFromScroll(scrollPos, sizes, context.dir);
            thumbRef.current.style.transform = `translate3d(${offset4}px, 0, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollLeft = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) {
            context.viewport.scrollLeft = getScrollPosition(pointerPos, context.dir);
          }
        }
      }
    );
  }
  if (orientation === "vertical") {
    return /* @__PURE__ */ jsx14(
      ScrollAreaScrollbarY,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollTop;
            const offset4 = getThumbOffsetFromScroll(scrollPos, sizes);
            thumbRef.current.style.transform = `translate3d(0, ${offset4}px, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollTop = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) context.viewport.scrollTop = getScrollPosition(pointerPos);
        }
      }
    );
  }
  return null;
});
var ScrollAreaScrollbarX = React23.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = React23.useState();
  const ref = React23.useRef(null);
  const composeRefs2 = useComposedRefs(forwardedRef, ref, context.onScrollbarXChange);
  React23.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ jsx14(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "horizontal",
      ...scrollbarProps,
      ref: composeRefs2,
      sizes,
      style: {
        bottom: 0,
        left: context.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0,
        right: context.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0,
        ["--radix-scroll-area-thumb-width"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.x),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.x),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollLeft + event.deltaX;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollWidth,
            viewport: context.viewport.offsetWidth,
            scrollbar: {
              size: ref.current.clientWidth,
              paddingStart: toInt(computedStyle.paddingLeft),
              paddingEnd: toInt(computedStyle.paddingRight)
            }
          });
        }
      }
    }
  );
});
var ScrollAreaScrollbarY = React23.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = React23.useState();
  const ref = React23.useRef(null);
  const composeRefs2 = useComposedRefs(forwardedRef, ref, context.onScrollbarYChange);
  React23.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ jsx14(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "vertical",
      ...scrollbarProps,
      ref: composeRefs2,
      sizes,
      style: {
        top: 0,
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: "var(--radix-scroll-area-corner-height)",
        ["--radix-scroll-area-thumb-height"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.y),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.y),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollTop + event.deltaY;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollHeight,
            viewport: context.viewport.offsetHeight,
            scrollbar: {
              size: ref.current.clientHeight,
              paddingStart: toInt(computedStyle.paddingTop),
              paddingEnd: toInt(computedStyle.paddingBottom)
            }
          });
        }
      }
    }
  );
});
var [ScrollbarProvider, useScrollbarContext] = createScrollAreaContext(SCROLLBAR_NAME);
var ScrollAreaScrollbarImpl = React23.forwardRef((props, forwardedRef) => {
  const {
    __scopeScrollArea,
    sizes,
    hasThumb,
    onThumbChange,
    onThumbPointerUp,
    onThumbPointerDown,
    onThumbPositionChange,
    onDragScroll,
    onWheelScroll,
    onResize,
    ...scrollbarProps
  } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, __scopeScrollArea);
  const [scrollbar, setScrollbar] = React23.useState(null);
  const composeRefs2 = useComposedRefs(forwardedRef, (node) => setScrollbar(node));
  const rectRef = React23.useRef(null);
  const prevWebkitUserSelectRef = React23.useRef("");
  const viewport = context.viewport;
  const maxScrollPos = sizes.content - sizes.viewport;
  const handleWheelScroll = useCallbackRef(onWheelScroll);
  const handleThumbPositionChange = useCallbackRef(onThumbPositionChange);
  const handleResize = useDebounceCallback(onResize, 10);
  function handleDragScroll(event) {
    if (rectRef.current) {
      const x = event.clientX - rectRef.current.left;
      const y = event.clientY - rectRef.current.top;
      onDragScroll({ x, y });
    }
  }
  React23.useEffect(() => {
    const handleWheel = (event) => {
      const element = event.target;
      const isScrollbarWheel = scrollbar?.contains(element);
      if (isScrollbarWheel) handleWheelScroll(event, maxScrollPos);
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel, { passive: false });
  }, [viewport, scrollbar, maxScrollPos, handleWheelScroll]);
  React23.useEffect(handleThumbPositionChange, [sizes, handleThumbPositionChange]);
  useResizeObserver(scrollbar, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ jsx14(
    ScrollbarProvider,
    {
      scope: __scopeScrollArea,
      scrollbar,
      hasThumb,
      onThumbChange: useCallbackRef(onThumbChange),
      onThumbPointerUp: useCallbackRef(onThumbPointerUp),
      onThumbPositionChange: handleThumbPositionChange,
      onThumbPointerDown: useCallbackRef(onThumbPointerDown),
      children: /* @__PURE__ */ jsx14(
        Primitive.div,
        {
          ...scrollbarProps,
          ref: composeRefs2,
          style: { position: "absolute", ...scrollbarProps.style },
          onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
            const mainPointer = 0;
            if (event.button === mainPointer) {
              const element = event.target;
              element.setPointerCapture(event.pointerId);
              rectRef.current = scrollbar.getBoundingClientRect();
              prevWebkitUserSelectRef.current = document.body.style.webkitUserSelect;
              document.body.style.webkitUserSelect = "none";
              if (context.viewport) context.viewport.style.scrollBehavior = "auto";
              handleDragScroll(event);
            }
          }),
          onPointerMove: composeEventHandlers(props.onPointerMove, handleDragScroll),
          onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
            const element = event.target;
            if (element.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
            document.body.style.webkitUserSelect = prevWebkitUserSelectRef.current;
            if (context.viewport) context.viewport.style.scrollBehavior = "";
            rectRef.current = null;
          })
        }
      )
    }
  );
});
var THUMB_NAME = "ScrollAreaThumb";
var ScrollAreaThumb = React23.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...thumbProps } = props;
    const scrollbarContext = useScrollbarContext(THUMB_NAME, props.__scopeScrollArea);
    return /* @__PURE__ */ jsx14(Presence, { present: forceMount || scrollbarContext.hasThumb, children: /* @__PURE__ */ jsx14(ScrollAreaThumbImpl, { ref: forwardedRef, ...thumbProps }) });
  }
);
var ScrollAreaThumbImpl = React23.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, style, ...thumbProps } = props;
    const scrollAreaContext = useScrollAreaContext(THUMB_NAME, __scopeScrollArea);
    const scrollbarContext = useScrollbarContext(THUMB_NAME, __scopeScrollArea);
    const { onThumbPositionChange } = scrollbarContext;
    const composedRef = useComposedRefs(
      forwardedRef,
      (node) => scrollbarContext.onThumbChange(node)
    );
    const removeUnlinkedScrollListenerRef = React23.useRef(void 0);
    const debounceScrollEnd = useDebounceCallback(() => {
      if (removeUnlinkedScrollListenerRef.current) {
        removeUnlinkedScrollListenerRef.current();
        removeUnlinkedScrollListenerRef.current = void 0;
      }
    }, 100);
    React23.useEffect(() => {
      const viewport = scrollAreaContext.viewport;
      if (viewport) {
        const handleScroll2 = () => {
          debounceScrollEnd();
          if (!removeUnlinkedScrollListenerRef.current) {
            const listener = addUnlinkedScrollListener(viewport, onThumbPositionChange);
            removeUnlinkedScrollListenerRef.current = listener;
            onThumbPositionChange();
          }
        };
        onThumbPositionChange();
        viewport.addEventListener("scroll", handleScroll2);
        return () => viewport.removeEventListener("scroll", handleScroll2);
      }
    }, [scrollAreaContext.viewport, debounceScrollEnd, onThumbPositionChange]);
    return /* @__PURE__ */ jsx14(
      Primitive.div,
      {
        "data-state": scrollbarContext.hasThumb ? "visible" : "hidden",
        ...thumbProps,
        ref: composedRef,
        style: {
          width: "var(--radix-scroll-area-thumb-width)",
          height: "var(--radix-scroll-area-thumb-height)",
          ...style
        },
        onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, (event) => {
          const thumb = event.target;
          const thumbRect = thumb.getBoundingClientRect();
          const x = event.clientX - thumbRect.left;
          const y = event.clientY - thumbRect.top;
          scrollbarContext.onThumbPointerDown({ x, y });
        }),
        onPointerUp: composeEventHandlers(props.onPointerUp, scrollbarContext.onThumbPointerUp)
      }
    );
  }
);
ScrollAreaThumb.displayName = THUMB_NAME;
var CORNER_NAME = "ScrollAreaCorner";
var ScrollAreaCorner = React23.forwardRef(
  (props, forwardedRef) => {
    const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
    const hasBothScrollbarsVisible = Boolean(context.scrollbarX && context.scrollbarY);
    const hasCorner = context.type !== "scroll" && hasBothScrollbarsVisible;
    return hasCorner ? /* @__PURE__ */ jsx14(ScrollAreaCornerImpl, { ...props, ref: forwardedRef }) : null;
  }
);
ScrollAreaCorner.displayName = CORNER_NAME;
var ScrollAreaCornerImpl = React23.forwardRef((props, forwardedRef) => {
  const { __scopeScrollArea, ...cornerProps } = props;
  const context = useScrollAreaContext(CORNER_NAME, __scopeScrollArea);
  const [width, setWidth] = React23.useState(0);
  const [height, setHeight] = React23.useState(0);
  const hasSize = Boolean(width && height);
  useResizeObserver(context.scrollbarX, () => {
    const height2 = context.scrollbarX?.offsetHeight || 0;
    context.onCornerHeightChange(height2);
    setHeight(height2);
  });
  useResizeObserver(context.scrollbarY, () => {
    const width2 = context.scrollbarY?.offsetWidth || 0;
    context.onCornerWidthChange(width2);
    setWidth(width2);
  });
  return hasSize ? /* @__PURE__ */ jsx14(
    Primitive.div,
    {
      ...cornerProps,
      ref: forwardedRef,
      style: {
        width,
        height,
        position: "absolute",
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: 0,
        ...props.style
      }
    }
  ) : null;
});
function toInt(value) {
  return value ? parseInt(value, 10) : 0;
}
function getThumbRatio(viewportSize, contentSize) {
  const ratio = viewportSize / contentSize;
  return isNaN(ratio) ? 0 : ratio;
}
function getThumbSize(sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18);
}
function getScrollPositionFromPointer(pointerPos, pointerOffset, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset4 = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset4;
  const minPointerPos = sizes.scrollbar.paddingStart + offset4;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
  return interpolate(pointerPos);
}
function getThumbOffsetFromScroll(scrollPos, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}
var addUnlinkedScrollListener = (node, handler = () => {
}) => {
  let prevPosition = { left: node.scrollLeft, top: node.scrollTop };
  let rAF = 0;
  (function loop() {
    const position = { left: node.scrollLeft, top: node.scrollTop };
    const isHorizontalScroll = prevPosition.left !== position.left;
    const isVerticalScroll = prevPosition.top !== position.top;
    if (isHorizontalScroll || isVerticalScroll) handler();
    prevPosition = position;
    rAF = window.requestAnimationFrame(loop);
  })();
  return () => window.cancelAnimationFrame(rAF);
};
function useDebounceCallback(callback, delay) {
  const handleCallback = useCallbackRef(callback);
  const debounceTimerRef = React23.useRef(0);
  React23.useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);
  return React23.useCallback(() => {
    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(handleCallback, delay);
  }, [handleCallback, delay]);
}
function useResizeObserver(element, onResize) {
  const handleResize = useCallbackRef(onResize);
  useLayoutEffect2(() => {
    let rAF = 0;
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(element);
      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(element);
      };
    }
  }, [element, handleResize]);
}
var Root = ScrollArea;
var Viewport = ScrollAreaViewport;
var Corner = ScrollAreaCorner;

// src/components/ScrollArea.tsx
import { jsx as jsx15, jsxs as jsxs6 } from "react/jsx-runtime";
var ScrollArea2 = React19.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs6(
  Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx15(Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsx15(ScrollBar, {}),
      /* @__PURE__ */ jsx15(Corner, {})
    ]
  }
));
ScrollArea2.displayName = Root.displayName;
var ScrollBar = React19.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx15(
  ScrollAreaScrollbar,
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
    children: /* @__PURE__ */ jsx15(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;

// src/components/EmptyState.tsx
import * as React20 from "react";
import { jsx as jsx16, jsxs as jsxs7 } from "react/jsx-runtime";
var EmptyState = React20.forwardRef(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return /* @__PURE__ */ jsxs7(
      "div",
      {
        ref,
        className: cn(
          "flex flex-col items-center justify-center text-center p-8 min-h-[200px]",
          className
        ),
        ...props,
        children: [
          icon && /* @__PURE__ */ jsx16("div", { className: "mb-4 p-3 rounded-full bg-surface-subtle text-text-tertiary", children: icon }),
          /* @__PURE__ */ jsx16("h3", { className: "text-lg font-semibold text-text-primary mb-2", children: title }),
          description && /* @__PURE__ */ jsx16("p", { className: "text-sm text-text-secondary max-w-sm mb-4", children: description }),
          action && /* @__PURE__ */ jsx16("div", { children: action })
        ]
      }
    );
  }
);
EmptyState.displayName = "EmptyState";

// src/patterns/cards/ListCard.tsx
import { jsx as jsx17, jsxs as jsxs8 } from "react/jsx-runtime";
var DefaultListItem = ({
  item,
  onClick
}) => {
  const isClickable = !!onClick;
  return /* @__PURE__ */ jsx17(
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
      children: /* @__PURE__ */ jsxs8("div", { className: "flex items-start gap-3", children: [
        item.icon && /* @__PURE__ */ jsx17("div", { className: "flex-shrink-0 mt-0.5", children: item.icon }),
        /* @__PURE__ */ jsxs8("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx17("p", { className: "font-medium text-gray-900 dark:text-gray-100 truncate", children: item.primary }),
          item.secondary && /* @__PURE__ */ jsx17("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate", children: item.secondary }),
          item.tertiary && /* @__PURE__ */ jsx17("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: item.tertiary })
        ] }),
        item.action && /* @__PURE__ */ jsx17("div", { className: "flex-shrink-0", children: item.action })
      ] })
    }
  );
};
var ListCard = React21.forwardRef(
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
    size: size4 = "MEDIUM",
    ...shellProps
  }, ref) => {
    const hasItems = items.length > 0;
    return /* @__PURE__ */ jsx17(
      CardShell,
      {
        ref,
        className: cn("", className),
        title,
        description,
        size: size4,
        ...shellProps,
        children: /* @__PURE__ */ jsxs8(Stack, { gap: "md", className: "h-full", children: [
          title && /* @__PURE__ */ jsx17(
            CardHeader,
            {
              title,
              description,
              icon,
              action
            }
          ),
          /* @__PURE__ */ jsx17("div", { className: "flex-1 min-h-0", children: hasItems ? /* @__PURE__ */ jsx17(
            ScrollArea2,
            {
              className: "h-full",
              style: { maxHeight: maxHeight || "none" },
              children: /* @__PURE__ */ jsx17(Stack, { gap: "sm", children: items.map(
                (item, index2) => renderItem ? /* @__PURE__ */ jsx17(React21.Fragment, { children: renderItem(item, index2) }, item.id) : /* @__PURE__ */ jsx17(DefaultListItem, { item, onClick: item.onClick }, item.id)
              ) })
            }
          ) : /* @__PURE__ */ jsx17(
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

// src/patterns/cards/TrendCard.tsx
import * as React24 from "react";
import { jsx as jsx18, jsxs as jsxs9 } from "react/jsx-runtime";
var Sparkline = ({ data, className }) => {
  if (!data || data.length < 2) return null;
  const width = 200;
  const height = 40;
  const padding = 4;
  const values = data.map((d) => d.y);
  const min2 = Math.min(...values);
  const max2 = Math.max(...values);
  const range = max2 - min2 || 1;
  const points = data.map((point, index2) => {
    const x = index2 / (data.length - 1) * (width - padding * 2) + padding;
    const y = height - padding - (point.y - min2) / range * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");
  return /* @__PURE__ */ jsx18(
    "svg",
    {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      className: cn("text-blue-500", className),
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx18(
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
var TrendCard = React24.forwardRef(
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
    size: size4 = "SMALL",
    ...shellProps
  }, ref) => {
    const trendColor = {
      up: "text-green-600 dark:text-green-400",
      down: "text-red-600 dark:text-red-400",
      neutral: "text-gray-600 dark:text-gray-400"
    }[trend];
    return /* @__PURE__ */ jsx18(
      CardShell,
      {
        ref,
        className: cn("", className),
        title,
        description,
        size: size4,
        ...shellProps,
        children: /* @__PURE__ */ jsxs9(Stack, { gap: "md", children: [
          title && /* @__PURE__ */ jsx18(CardHeader, { title, description, icon, action }),
          /* @__PURE__ */ jsxs9("div", { children: [
            /* @__PURE__ */ jsxs9(Inline, { gap: "sm", align: "baseline", wrap: "wrap", children: [
              /* @__PURE__ */ jsx18(Text, { as: "span", variant: "display", color: "primary", className: "font-bold", children: value }),
              change && /* @__PURE__ */ jsx18(Text, { as: "span", variant: "ui", className: trendColor, children: change })
            ] }),
            /* @__PURE__ */ jsx18(Text, { variant: "ui", color: "secondary", className: "mt-1", children: label })
          ] }),
          data && data.length > 0 && /* @__PURE__ */ jsxs9("div", { className: "mt-2", children: [
            /* @__PURE__ */ jsx18(Sparkline, { data }),
            period && /* @__PURE__ */ jsx18(Badge, { variant: "secondary", className: "mt-2", children: period })
          ] })
        ] })
      }
    );
  }
);
TrendCard.displayName = "TrendCard";

// src/hooks/useBreakpoint.ts
import { useState as useState3, useEffect as useEffect4 } from "react";
var BREAKPOINTS = {
  xs: 0,
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
  const [breakpoint, setBreakpoint] = useState3(
    () => typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "lg"
  );
  useEffect4(() => {
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
function useBreakpointUp(target) {
  const current = useBreakpoint();
  const breakpointOrder = ["xs", "sm", "md", "lg", "xl", "2xl"];
  const currentIndex = breakpointOrder.indexOf(current);
  const targetIndex = breakpointOrder.indexOf(target);
  return currentIndex >= targetIndex;
}
function useBreakpointDown(target) {
  const current = useBreakpoint();
  const breakpointOrder = ["xs", "sm", "md", "lg", "xl", "2xl"];
  const currentIndex = breakpointOrder.indexOf(current);
  const targetIndex = breakpointOrder.indexOf(target);
  return currentIndex < targetIndex;
}
function useMobileBreakpoint() {
  const breakpoint = useBreakpoint();
  return breakpoint === "xs";
}
function useTabletBreakpoint() {
  const breakpoint = useBreakpoint();
  return breakpoint === "sm" || breakpoint === "md";
}
function useDesktopBreakpoint() {
  const breakpoint = useBreakpoint();
  return breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl";
}

// src/components/PageContainer.tsx
import { jsx as jsx19 } from "react/jsx-runtime";
var maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full"
};
function PageContainer({
  children,
  className,
  noPadding = false,
  maxWidth = "full"
}) {
  const isMobile = useMobileBreakpoint();
  return /* @__PURE__ */ jsx19(
    "div",
    {
      className: cn(
        "w-full mx-auto",
        !noPadding && (isMobile ? "p-4" : "p-6"),
        maxWidthClasses[maxWidth],
        className
      ),
      children
    }
  );
}

// src/components/ResponsiveGrid.tsx
import { jsx as jsx20 } from "react/jsx-runtime";
var colClasses = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
};
var mobileColClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2"
};
var gapClasses = {
  sm: "gap-3",
  md: "gap-3 sm:gap-4",
  lg: "gap-4 sm:gap-6"
};
function ResponsiveGrid({
  children,
  cols = 2,
  mobileCols = 1,
  gap = "md",
  className
}) {
  return /* @__PURE__ */ jsx20("div", { className: cn(
    "grid",
    mobileColClasses[mobileCols],
    colClasses[cols],
    gapClasses[gap],
    className
  ), children });
}

// src/components/Card.tsx
import * as React25 from "react";
import { cva as cva11 } from "class-variance-authority";
import { jsx as jsx21 } from "react/jsx-runtime";
var cardVariants = cva11("rounded-lg border transition-smooth", {
  variants: {
    variant: {
      default: "bg-surface-elevated border-border-base",
      outline: "bg-surface-base border-border-strong",
      ghost: "bg-surface-subtle border-transparent"
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6"
    },
    hover: {
      true: "hover:shadow-md hover:border-border-strong cursor-pointer"
    }
  },
  defaultVariants: {
    variant: "default",
    padding: "md"
  }
});
var Card = React25.forwardRef(
  ({ className, variant, padding, hover, ...props }, ref) => {
    return /* @__PURE__ */ jsx21(
      "div",
      {
        ref,
        className: cn(cardVariants({ variant, padding, hover, className })),
        ...props
      }
    );
  }
);
Card.displayName = "Card";
var CardHeader2 = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx21(
  "div",
  {
    ref,
    className: cn("flex flex-col gap-1.5", className),
    ...props
  }
));
CardHeader2.displayName = "CardHeader";
var CardTitle = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx21(
  "h3",
  {
    ref,
    className: cn("text-lg font-semibold text-text-primary", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardDescription = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx21(
  "p",
  {
    ref,
    className: cn("text-sm text-text-secondary", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
var CardContent = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx21("div", { ref, className: cn("", className), ...props }));
CardContent.displayName = "CardContent";
var CardFooter = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx21(
  "div",
  {
    ref,
    className: cn("flex items-center gap-2 pt-4", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";

// src/components/MobileCard.tsx
import { jsx as jsx22, jsxs as jsxs10 } from "react/jsx-runtime";
var paddingClasses = {
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8"
};
function MobileCard({
  mobileLayout,
  desktopLayout,
  className,
  padding = "md"
}) {
  const isMobile = useMobileBreakpoint();
  return /* @__PURE__ */ jsx22(Card, { className, children: /* @__PURE__ */ jsxs10(CardContent, { className: paddingClasses[padding], children: [
    /* @__PURE__ */ jsx22("div", { className: "sm:hidden", children: mobileLayout }),
    /* @__PURE__ */ jsx22("div", { className: "hidden sm:block", children: desktopLayout })
  ] }) });
}
var valueColorClasses = {
  default: "text-text-primary",
  success: "text-[rgb(var(--success))]",
  error: "text-[rgb(var(--error))]",
  warning: "text-[rgb(var(--warning))]"
};
function MobileListItem({
  primary,
  secondary,
  value,
  valueColor = "default",
  badges,
  meta,
  actions,
  className
}) {
  return /* @__PURE__ */ jsxs10("div", { className: cn("space-y-3", className), children: [
    /* @__PURE__ */ jsxs10("div", { className: "flex justify-between items-start gap-3", children: [
      /* @__PURE__ */ jsxs10("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx22("div", { className: "font-semibold text-sm text-text-primary truncate", children: primary }),
        secondary && /* @__PURE__ */ jsx22("div", { className: "text-xs text-text-secondary mt-0.5 truncate", children: secondary })
      ] }),
      value && /* @__PURE__ */ jsx22("div", { className: cn("font-bold text-lg flex-shrink-0", valueColorClasses[valueColor]), children: value })
    ] }),
    meta && /* @__PURE__ */ jsx22("div", { className: "flex items-center gap-2 text-xs text-text-tertiary", children: meta }),
    badges && /* @__PURE__ */ jsx22("div", { className: "flex items-center gap-2 flex-wrap", children: badges }),
    actions && /* @__PURE__ */ jsx22("div", { className: "flex gap-2 pt-2 border-t border-border-base", children: actions })
  ] });
}

// src/components/Button.tsx
import * as React26 from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva as cva12 } from "class-variance-authority";
import { jsx as jsx23, jsxs as jsxs11 } from "react/jsx-runtime";
var buttonVariants = cva12(
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
var Button = React26.forwardRef(
  ({
    className,
    variant,
    size: size4,
    fullWidth,
    asChild = false,
    loading = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxs11(
      Comp,
      {
        className: cn(buttonVariants({ variant, size: size4, fullWidth, className })),
        ref,
        disabled: disabled || loading,
        ...props,
        children: [
          loading && /* @__PURE__ */ jsxs11(
            "svg",
            {
              className: "animate-spin h-4 w-4",
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              children: [
                /* @__PURE__ */ jsx23(
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
                /* @__PURE__ */ jsx23(
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

// src/components/ResponsiveActions.tsx
import { jsx as jsx24, jsxs as jsxs12 } from "react/jsx-runtime";
function ResponsiveButton({
  text,
  icon,
  showTextOnMobile = false,
  size: size4 = "sm",
  className,
  ...props
}) {
  const isMobile = useMobileBreakpoint();
  return /* @__PURE__ */ jsxs12(Button, { size: size4, className, ...props, children: [
    icon && /* @__PURE__ */ jsx24("span", { className: cn(isMobile && !showTextOnMobile ? "" : "sm:mr-2"), children: icon }),
    /* @__PURE__ */ jsx24("span", { className: cn(
      isMobile && !showTextOnMobile && "sr-only",
      !isMobile && "inline"
    ), children: text })
  ] });
}
var alignClasses = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end"
};
function ResponsiveActions({
  children,
  className,
  align = "right"
}) {
  return /* @__PURE__ */ jsx24("div", { className: cn(
    "flex items-center gap-2 flex-wrap",
    alignClasses[align],
    className
  ), children });
}

// src/components/Input.tsx
import * as React27 from "react";
import { cva as cva13 } from "class-variance-authority";
import { jsx as jsx25, jsxs as jsxs13 } from "react/jsx-runtime";
var inputVariants = cva13(
  "flex w-full rounded-md border bg-surface-base px-3 py-2 text-sm transition-smooth focus-ring disabled:disabled file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary",
  {
    variants: {
      variant: {
        default: "border-border-base focus:border-accent-primary",
        error: "border-status-error focus:border-status-error",
        success: "border-status-success focus:border-status-success"
      },
      inputSize: {
        sm: "h-8 text-xs",
        md: "h-10",
        lg: "h-12 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md"
    }
  }
);
var Input = React27.forwardRef(
  ({
    className,
    variant,
    inputSize,
    type = "text",
    error,
    hint,
    label,
    leftIcon,
    rightIcon,
    id,
    ...props
  }, ref) => {
    const inputId = id || React27.useId();
    const hasError = Boolean(error);
    const effectiveVariant = hasError ? "error" : variant;
    return /* @__PURE__ */ jsxs13("div", { className: "flex flex-col gap-1.5 w-full", children: [
      label && /* @__PURE__ */ jsx25(
        "label",
        {
          htmlFor: inputId,
          className: "text-sm font-medium text-text-primary",
          children: label
        }
      ),
      /* @__PURE__ */ jsxs13("div", { className: "relative", children: [
        leftIcon && /* @__PURE__ */ jsx25("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary", children: leftIcon }),
        /* @__PURE__ */ jsx25(
          "input",
          {
            id: inputId,
            type,
            className: cn(
              inputVariants({ variant: effectiveVariant, inputSize }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            ),
            ref,
            "aria-invalid": hasError,
            "aria-describedby": error ? `${inputId}-error` : hint ? `${inputId}-hint` : void 0,
            ...props
          }
        ),
        rightIcon && /* @__PURE__ */ jsx25("div", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary", children: rightIcon })
      ] }),
      error && /* @__PURE__ */ jsx25(
        "p",
        {
          id: `${inputId}-error`,
          className: "text-xs text-status-error",
          role: "alert",
          children: error
        }
      ),
      hint && !error && /* @__PURE__ */ jsx25("p", { id: `${inputId}-hint`, className: "text-xs text-text-tertiary", children: hint })
    ] });
  }
);
Input.displayName = "Input";

// src/components/PageHeader.tsx
import * as React28 from "react";
import { jsx as jsx26, jsxs as jsxs14 } from "react/jsx-runtime";
var PageHeader = React28.forwardRef(
  ({ className, icon, title, description, actions, ...props }, ref) => {
    const isMobile = useMobileBreakpoint();
    return /* @__PURE__ */ jsx26(
      "div",
      {
        ref,
        className: cn("mb-4 sm:mb-6", className),
        ...props,
        children: /* @__PURE__ */ jsxs14("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4", children: [
          /* @__PURE__ */ jsxs14("div", { className: "flex items-start gap-3 min-w-0 flex-1", children: [
            icon && /* @__PURE__ */ jsx26("div", { className: cn(
              "flex-shrink-0 rounded-lg shadow-md bg-gradient-to-br from-accent-primary to-accent-secondary mt-1",
              isMobile ? "p-2" : "p-2.5"
            ), children: /* @__PURE__ */ jsx26("div", { className: cn(
              "text-text-inverse flex items-center justify-center",
              isMobile ? "w-5 h-5" : "w-6 h-6"
            ), children: icon }) }),
            /* @__PURE__ */ jsxs14("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx26("h1", { className: cn(
                "font-bold text-text-primary m-0",
                isMobile ? "text-xl" : "text-2xl sm:text-3xl"
              ), children: title }),
              description && /* @__PURE__ */ jsx26("p", { className: cn(
                "text-text-secondary m-0 mt-1",
                isMobile ? "text-sm" : "text-base"
              ), children: description })
            ] })
          ] }),
          actions && /* @__PURE__ */ jsx26("div", { className: cn(
            "flex items-center gap-2 flex-shrink-0",
            isMobile && "flex-wrap"
          ), children: actions })
        ] })
      }
    );
  }
);
PageHeader.displayName = "PageHeader";

// src/components/StatCard.tsx
import * as React29 from "react";
import { cva as cva14 } from "class-variance-authority";
import { jsx as jsx27, jsxs as jsxs15 } from "react/jsx-runtime";
var statCardVariants = cva14("cursor-pointer transition-all duration-200", {
  variants: {
    hover: {
      true: "hover:shadow-lg hover:-translate-y-0.5",
      false: ""
    }
  },
  defaultVariants: {
    hover: true
  }
});
var StatCard = React29.forwardRef(
  ({
    className,
    label,
    value,
    change,
    icon,
    iconBg = "bg-accent-primary/10",
    iconColor = "text-accent-primary",
    hover,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx27(
      Card,
      {
        ref,
        className: cn(statCardVariants({ hover }), className),
        padding: "md",
        ...props,
        children: /* @__PURE__ */ jsxs15("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxs15("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx27("p", { className: "text-xs font-medium text-text-secondary mb-1", children: label }),
            /* @__PURE__ */ jsx27("p", { className: "text-2xl font-bold text-text-primary m-0", children: value }),
            change && /* @__PURE__ */ jsx27("p", { className: "text-xs text-text-tertiary m-0 mt-0.5", children: change })
          ] }),
          icon && /* @__PURE__ */ jsx27("div", { className: cn("p-3 rounded-lg shadow-sm", iconBg), children: /* @__PURE__ */ jsx27("div", { className: cn("w-5 h-5 flex items-center justify-center", iconColor), children: icon }) })
        ] })
      }
    );
  }
);
StatCard.displayName = "StatCard";

// src/components/SearchInput.tsx
import * as React30 from "react";
import { jsx as jsx28, jsxs as jsxs16 } from "react/jsx-runtime";
var SearchInput = React30.forwardRef(
  ({ className, placeholder = "Search...", onSearch, onChange, ...props }, ref) => {
    const handleChange = (e) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };
    return /* @__PURE__ */ jsxs16("div", { className: "relative", children: [
      /* @__PURE__ */ jsxs16(
        "svg",
        {
          className: "absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none",
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          strokeWidth: 2,
          children: [
            /* @__PURE__ */ jsx28("circle", { cx: "11", cy: "11", r: "8" }),
            /* @__PURE__ */ jsx28("path", { d: "m21 21-4.35-4.35" })
          ]
        }
      ),
      /* @__PURE__ */ jsx28(
        Input,
        {
          ref,
          type: "text",
          className: cn("pl-8", className),
          placeholder,
          onChange: handleChange,
          ...props
        }
      )
    ] });
  }
);
SearchInput.displayName = "SearchInput";

// src/components/Avatar.tsx
import * as React31 from "react";
import { cva as cva15 } from "class-variance-authority";
import { jsx as jsx29 } from "react/jsx-runtime";
var avatarVariants = cva15(
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
var Avatar = React31.forwardRef(
  ({ className, size: size4, src, alt, fallback, ...props }, ref) => {
    const [error, setError] = React31.useState(false);
    const initials = fallback ? fallback.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";
    return /* @__PURE__ */ jsx29(
      "div",
      {
        ref,
        className: cn(avatarVariants({ size: size4, className })),
        ...props,
        children: src && !error ? /* @__PURE__ */ jsx29(
          "img",
          {
            src,
            alt: alt || fallback || "Avatar",
            className: "w-full h-full object-cover",
            onError: () => setError(true)
          }
        ) : /* @__PURE__ */ jsx29("span", { className: "font-medium text-text-secondary", children: initials })
      }
    );
  }
);
Avatar.displayName = "Avatar";
var AvatarImage = React31.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx29(
  "img",
  {
    ref,
    className: `aspect-square h-full w-full object-cover ${className || ""}`,
    ...props
  }
));
AvatarImage.displayName = "AvatarImage";
var AvatarFallback = React31.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx29(
  "div",
  {
    ref,
    className: `flex h-full w-full items-center justify-center rounded-full bg-surface-subtle text-text-secondary ${className || ""}`,
    ...props
  }
));
AvatarFallback.displayName = "AvatarFallback";

// src/components/Tabs.tsx
import * as React32 from "react";
import { jsx as jsx30 } from "react/jsx-runtime";
var TabsContext = React32.createContext(void 0);
var Tabs = React32.forwardRef(
  ({ defaultValue, value: controlledValue, onValueChange, children, className, ...props }, ref) => {
    const [internalValue, setInternalValue] = React32.useState(defaultValue || "");
    const value = controlledValue ?? internalValue;
    const handleValueChange = (newValue) => {
      if (controlledValue === void 0) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };
    return /* @__PURE__ */ jsx30(TabsContext.Provider, { value: { value, onValueChange: handleValueChange }, children: /* @__PURE__ */ jsx30("div", { ref, className: cn("w-full", className), ...props, children }) });
  }
);
Tabs.displayName = "Tabs";
var TabsList = React32.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx30(
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
var TabsTrigger = React32.forwardRef(
  ({ className, value, ...props }, ref) => {
    const context = React32.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");
    const isActive = context.value === value;
    return /* @__PURE__ */ jsx30(
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
var TabsContent = React32.forwardRef(
  ({ className, value, ...props }, ref) => {
    const context = React32.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");
    if (context.value !== value) return null;
    return /* @__PURE__ */ jsx30(
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

// src/components/QuickAction.tsx
import * as React33 from "react";
import { jsx as jsx31, jsxs as jsxs17 } from "react/jsx-runtime";
var QuickAction = React33.forwardRef(
  ({ className, icon, title, description, badge, ...props }, ref) => {
    return /* @__PURE__ */ jsx31(
      Card,
      {
        ref,
        hover: true,
        padding: "md",
        className: cn("cursor-pointer", className),
        ...props,
        children: /* @__PURE__ */ jsx31(CardContent, { children: /* @__PURE__ */ jsxs17("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx31("div", { className: "flex-shrink-0 p-2.5 rounded-lg bg-accent-primary/10", children: /* @__PURE__ */ jsx31("div", { className: "w-5 h-5 text-accent-primary flex items-center justify-center", children: icon }) }),
          /* @__PURE__ */ jsxs17("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs17("div", { className: "flex items-start justify-between gap-2 mb-1", children: [
              /* @__PURE__ */ jsx31("h3", { className: "font-bold text-text-primary text-sm", children: title }),
              badge
            ] }),
            description && /* @__PURE__ */ jsx31("p", { className: "text-xs text-text-secondary m-0", children: description })
          ] })
        ] }) })
      }
    );
  }
);
QuickAction.displayName = "QuickAction";

// src/components/Progress.tsx
import * as React34 from "react";
import { cva as cva16 } from "class-variance-authority";
import { jsx as jsx32, jsxs as jsxs18 } from "react/jsx-runtime";
var progressVariants = cva16("w-full overflow-hidden rounded-full bg-surface-subtle", {
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
var progressBarVariants = cva16("h-full transition-all duration-300 rounded-full", {
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
var Progress = React34.forwardRef(
  ({ className, size: size4, variant, value, max: max2 = 100, showLabel, ...props }, ref) => {
    const percentage = Math.min(Math.max(value / max2 * 100, 0), 100);
    return /* @__PURE__ */ jsxs18("div", { ref, className: "w-full", ...props, children: [
      showLabel && /* @__PURE__ */ jsx32("div", { className: "flex justify-between items-center mb-1", children: /* @__PURE__ */ jsxs18("span", { className: "text-sm font-medium text-text-secondary", children: [
        percentage.toFixed(0),
        "%"
      ] }) }),
      /* @__PURE__ */ jsx32("div", { className: cn(progressVariants({ size: size4, className })), children: /* @__PURE__ */ jsx32(
        "div",
        {
          className: cn(progressBarVariants({ variant })),
          style: { width: `${percentage}%` },
          role: "progressbar",
          "aria-valuenow": value,
          "aria-valuemin": 0,
          "aria-valuemax": max2
        }
      ) })
    ] });
  }
);
Progress.displayName = "Progress";

// src/components/Select.tsx
import * as React35 from "react";
import { cva as cva17 } from "class-variance-authority";
import { jsx as jsx33, jsxs as jsxs19 } from "react/jsx-runtime";
var selectVariants = cva17(
  "block w-full rounded-md border outline-none transition-colors bg-[var(--surface,white)] text-[var(--text,#0b1020)] border-[var(--border,#c9d3e3)] focus:ring-2 focus:ring-[var(--ring,rgba(42,125,225,0.28))] disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "h-8 px-2 text-[13px]",
        md: "h-10 px-3 text-[14px]",
        lg: "h-11 px-3 text-[15px]"
      },
      tone: {
        default: "",
        subtle: "bg-[var(--panel,#f7f9fc)]",
        danger: "border-[var(--danger-border,#ffb4b4)] focus:ring-[rgba(255,88,88,.28)]"
      }
    },
    defaultVariants: { size: "md", tone: "default" }
  }
);
var Select = React35.forwardRef(function Select2({ className, size: size4, tone, options, placeholder, onValueChange, defaultValue, value, children, ...rest }, ref) {
  const handleChange = (e) => {
    onValueChange?.(e.target.value);
  };
  return /* @__PURE__ */ jsxs19(
    "select",
    {
      ref,
      className: cn(selectVariants({ size: size4, tone }), className),
      onChange: handleChange,
      value,
      defaultValue,
      ...rest,
      children: [
        placeholder && /* @__PURE__ */ jsx33("option", { value: "", disabled: true, hidden: true, children: placeholder }),
        options?.map((o) => /* @__PURE__ */ jsx33("option", { value: o.value, disabled: o.disabled, children: o.label }, o.value)),
        children
      ]
    }
  );
});

// src/components/RadixSelect.tsx
import * as React36 from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { jsx as jsx34, jsxs as jsxs20 } from "react/jsx-runtime";
var SelectRoot = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = React36.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs20(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm",
      "bg-[var(--surface,white)] text-[var(--text,#0b1020)] border-[var(--border,#c9d3e3)]",
      "ring-offset-[var(--surface,white)]",
      "data-[placeholder]:text-[var(--text-muted,#6b7280)]",
      "focus:outline-none focus:ring-2 focus:ring-[var(--ring,rgba(42,125,225,0.28))] focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx34(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx34(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectScrollUpButton = React36.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx34(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx34(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
var SelectScrollDownButton = React36.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx34(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx34(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
var SelectContent = React36.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx34(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs20(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md",
      "bg-[var(--surface,white)] text-[var(--text,#0b1020)] border-[var(--border,#c9d3e3)]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "origin-[var(--radix-select-content-transform-origin)]",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx34(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx34(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx34(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = React36.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx34(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var SelectItem = React36.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs20(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      "focus:bg-[var(--surface-hover,#f7f9fc)] focus:text-[var(--text,#0b1020)]",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx34("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx34(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx34(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx34(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = React36.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx34(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-[var(--border,#c9d3e3)]", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// src/components/Textarea.tsx
import * as React37 from "react";
import { cva as cva18 } from "class-variance-authority";
import { jsx as jsx35, jsxs as jsxs21 } from "react/jsx-runtime";
var textareaVariants = cva18(
  "flex min-h-[80px] w-full rounded-md border bg-surface-base px-3 py-2 text-sm transition-smooth focus-ring disabled:disabled placeholder:text-text-tertiary",
  {
    variants: {
      variant: {
        default: "border-border-base focus:border-accent-primary",
        error: "border-status-error focus:border-status-error",
        success: "border-status-success focus:border-status-success"
      },
      textareaSize: {
        sm: "text-xs min-h-[60px]",
        md: "min-h-[80px]",
        lg: "text-base min-h-[120px]"
      }
    },
    defaultVariants: {
      variant: "default",
      textareaSize: "md"
    }
  }
);
var Textarea = React37.forwardRef(
  ({
    className,
    variant,
    textareaSize,
    error,
    hint,
    label,
    id,
    ...props
  }, ref) => {
    const textareaId = id || React37.useId();
    const hasError = Boolean(error);
    const effectiveVariant = hasError ? "error" : variant;
    return /* @__PURE__ */ jsxs21("div", { className: "flex flex-col gap-1.5 w-full", children: [
      label && /* @__PURE__ */ jsx35(
        "label",
        {
          htmlFor: textareaId,
          className: "text-sm font-medium text-text-primary",
          children: label
        }
      ),
      /* @__PURE__ */ jsx35(
        "textarea",
        {
          id: textareaId,
          className: cn(
            textareaVariants({ variant: effectiveVariant, textareaSize }),
            className
          ),
          ref,
          "aria-invalid": hasError,
          "aria-describedby": error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : void 0,
          ...props
        }
      ),
      error && /* @__PURE__ */ jsx35(
        "p",
        {
          id: `${textareaId}-error`,
          className: "text-xs text-status-error",
          role: "alert",
          children: error
        }
      ),
      hint && !error && /* @__PURE__ */ jsx35("p", { id: `${textareaId}-hint`, className: "text-xs text-text-tertiary", children: hint })
    ] });
  }
);
Textarea.displayName = "Textarea";

// src/components/Checkbox.tsx
import * as React38 from "react";
import { cva as cva19 } from "class-variance-authority";
import { Check as Check2, Minus } from "lucide-react";
import { jsx as jsx36, jsxs as jsxs22 } from "react/jsx-runtime";
var checkboxVariants = cva19(
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
var Checkbox = React38.forwardRef(
  ({
    className,
    variant,
    size: size4,
    error,
    label,
    indeterminate = false,
    checked,
    onChange,
    onCheckedChange,
    ...props
  }, ref) => {
    const computedVariant = error ? "error" : variant;
    const inputRef = React38.useRef(null);
    React38.useImperativeHandle(ref, () => inputRef.current);
    React38.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);
    const handleChange = (e) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };
    const iconSize = size4 === "sm" ? 10 : size4 === "lg" ? 16 : 12;
    return /* @__PURE__ */ jsxs22("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs22("div", { className: "relative inline-flex items-center justify-center", children: [
        /* @__PURE__ */ jsx36(
          "input",
          {
            type: "checkbox",
            className: checkboxVariants({ variant: computedVariant, size: size4, className }),
            ref: inputRef,
            checked,
            onChange: handleChange,
            "data-state": checked ? "checked" : "unchecked",
            ...props
          }
        ),
        checked && !indeterminate && /* @__PURE__ */ jsx36(
          Check2,
          {
            className: "absolute pointer-events-none text-current",
            size: iconSize
          }
        ),
        indeterminate && /* @__PURE__ */ jsx36(
          Minus,
          {
            className: "absolute pointer-events-none text-current",
            size: iconSize
          }
        )
      ] }),
      label && /* @__PURE__ */ jsx36(
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

// src/components/Radio.tsx
import * as React39 from "react";
import { cva as cva20 } from "class-variance-authority";
import { jsx as jsx37, jsxs as jsxs23 } from "react/jsx-runtime";
var radioVariants = cva20(
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
var Radio = React39.forwardRef(
  ({ className, variant, size: size4, error, label, ...props }, ref) => {
    const computedVariant = error ? "error" : variant;
    const inputRef = React39.useRef(null);
    React39.useImperativeHandle(ref, () => inputRef.current);
    return /* @__PURE__ */ jsxs23("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx37(
        "input",
        {
          type: "radio",
          className: radioVariants({ variant: computedVariant, size: size4, className }),
          ref: inputRef,
          "data-state": props.checked ? "checked" : "unchecked",
          ...props
        }
      ),
      label && /* @__PURE__ */ jsx37(
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
  const [selectedValue, setSelectedValue] = React39.useState(defaultValue || "");
  const currentValue = value !== void 0 ? value : selectedValue;
  const handleChange = (newValue) => {
    if (value === void 0) {
      setSelectedValue(newValue);
    }
    onValueChange?.(newValue);
  };
  return /* @__PURE__ */ jsx37("div", { className, role: "radiogroup", children: React39.Children.map(children, (child) => {
    if (React39.isValidElement(child) && child.type === Radio) {
      return React39.cloneElement(child, {
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

// src/components/Switch.tsx
import * as React40 from "react";
import { cva as cva21 } from "class-variance-authority";
import { jsx as jsx38, jsxs as jsxs24 } from "react/jsx-runtime";
var switchVariants = cva21(
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
var switchThumbVariants = cva21(
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
var Switch = React40.forwardRef(
  ({
    className,
    variant,
    size: size4,
    error,
    label,
    checked,
    onChange,
    onCheckedChange,
    ...props
  }, ref) => {
    const computedVariant = error ? "error" : variant;
    const inputRef = React40.useRef(null);
    React40.useImperativeHandle(ref, () => inputRef.current);
    const handleChange = (e) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };
    return /* @__PURE__ */ jsxs24("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs24("label", { className: "relative inline-flex items-center cursor-pointer", children: [
        /* @__PURE__ */ jsx38(
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
        /* @__PURE__ */ jsx38(
          "div",
          {
            className: switchVariants({ variant: computedVariant, size: size4, className }),
            "data-state": checked ? "checked" : "unchecked",
            children: /* @__PURE__ */ jsx38(
              "span",
              {
                className: switchThumbVariants({ size: size4 }),
                "data-state": checked ? "checked" : "unchecked"
              }
            )
          }
        )
      ] }),
      label && /* @__PURE__ */ jsx38(
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

// src/components/Label.tsx
import * as React41 from "react";
import { cva as cva22 } from "class-variance-authority";
import { jsx as jsx39 } from "react/jsx-runtime";
var labelVariants = cva22(
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
var Label2 = React41.forwardRef(
  ({ className, variant, size: size4, error, required, children, ...props }, ref) => {
    const computedVariant = error ? "error" : variant;
    return /* @__PURE__ */ jsx39(
      "label",
      {
        ref,
        className: labelVariants({
          variant: computedVariant,
          size: size4,
          required,
          className
        }),
        ...props,
        children
      }
    );
  }
);
Label2.displayName = "Label";

// src/components/FormField.tsx
import * as React42 from "react";
import { cva as cva23 } from "class-variance-authority";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { jsx as jsx40, jsxs as jsxs25 } from "react/jsx-runtime";
var formFieldVariants = cva23("flex flex-col gap-1.5", {
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
var formDescriptionVariants = cva23("text-xs", {
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
var FormField = React42.forwardRef(
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
    return /* @__PURE__ */ jsxs25(
      "div",
      {
        ref,
        className: formFieldVariants({ orientation, className }),
        ...props,
        children: [
          label && /* @__PURE__ */ jsx40(
            "label",
            {
              htmlFor,
              className: `text-sm font-medium ${hasError ? "text-status-error" : hasSuccess ? "text-status-success" : "text-text-primary"} ${required ? 'after:content-["*"] after:ml-0.5 after:text-status-error' : ""}`,
              children: label
            }
          ),
          /* @__PURE__ */ jsx40("div", { className: "flex-1", children }),
          message && /* @__PURE__ */ jsxs25(
            "div",
            {
              className: `flex items-start gap-1.5 ${formDescriptionVariants({
                variant: descriptionVariant
              })}`,
              children: [
                showIcon && /* @__PURE__ */ jsxs25("span", { className: "mt-0.5 flex-shrink-0", children: [
                  hasError && /* @__PURE__ */ jsx40(AlertCircle, { className: "w-3.5 h-3.5" }),
                  hasSuccess && /* @__PURE__ */ jsx40(CheckCircle, { className: "w-3.5 h-3.5" }),
                  hasDescription && !hasError && !hasSuccess && /* @__PURE__ */ jsx40(Info, { className: "w-3.5 h-3.5" })
                ] }),
                /* @__PURE__ */ jsx40("span", { className: "flex-1", children: message })
              ]
            }
          )
        ]
      }
    );
  }
);
FormField.displayName = "FormField";

// src/components/Slider.tsx
import * as React43 from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { jsx as jsx41, jsxs as jsxs26 } from "react/jsx-runtime";
var Slider = React43.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs26(
  SliderPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex w-full touch-none select-none items-center",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx41(SliderPrimitive.Track, { className: "relative h-2 w-full grow overflow-hidden rounded-full bg-surface-muted", children: /* @__PURE__ */ jsx41(SliderPrimitive.Range, { className: "absolute h-full bg-accent-primary" }) }),
      /* @__PURE__ */ jsx41(SliderPrimitive.Thumb, { className: "block h-5 w-5 rounded-full border-2 border-accent-primary bg-surface-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = SliderPrimitive.Root.displayName;

// src/components/Calendar.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { jsx as jsx42 } from "react/jsx-runtime";
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return /* @__PURE__ */ jsx42(
    DayPicker,
    {
      showOutsideDays,
      className: cn("p-3", className),
      classNames: {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-text-primary",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-text-tertiary rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent-primary/50 [&:has([aria-selected])]:bg-accent-primary first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-accent-primary text-white hover:bg-accent-primary hover:text-white focus:bg-accent-primary focus:text-white",
        day_today: "bg-surface-muted text-text-primary",
        day_outside: "day-outside text-text-tertiary aria-selected:bg-accent-primary/50 aria-selected:text-text-tertiary",
        day_disabled: "text-text-tertiary opacity-50",
        day_range_middle: "aria-selected:bg-accent-primary aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames
      },
      components: {
        IconLeft: ({ className: className2, ...props2 }) => /* @__PURE__ */ jsx42(ChevronLeft, { className: cn("h-4 w-4", className2), ...props2 }),
        IconRight: ({ className: className2, ...props2 }) => /* @__PURE__ */ jsx42(ChevronRight, { className: cn("h-4 w-4", className2), ...props2 })
      },
      ...props
    }
  );
}
Calendar.displayName = "Calendar";

// src/components/Notes.tsx
import * as React44 from "react";
import { useState as useState7, useEffect as useEffect6, useCallback as useCallback4, useRef as useRef7 } from "react";
import { cva as cva24 } from "class-variance-authority";
import { Clock, User, FileText, CheckCircle as CheckCircle2, AlertCircle as AlertCircle2 } from "lucide-react";
import { Fragment as Fragment3, jsx as jsx43, jsxs as jsxs27 } from "react/jsx-runtime";
var notesVariants = cva24("w-full", {
  variants: {
    height: {
      sm: "min-h-[100px]",
      md: "min-h-[150px]",
      lg: "min-h-[200px]",
      xl: "min-h-[300px]"
    }
  },
  defaultVariants: {
    height: "md"
  }
});
var CONTEXT_LABELS = {
  customer: {
    label: "Customer Note",
    icon: /* @__PURE__ */ jsx43(User, { className: "h-3 w-3" }),
    destination: "Saves to customer timeline"
  },
  showroom: {
    label: "Showroom Note",
    icon: /* @__PURE__ */ jsx43(User, { className: "h-3 w-3" }),
    destination: "Saves to customer timeline"
  },
  appraisal: {
    label: "Appraisal Note",
    icon: /* @__PURE__ */ jsx43(FileText, { className: "h-3 w-3" }),
    destination: "Saves with this appraisal"
  },
  deal: {
    label: "Deal Note",
    icon: /* @__PURE__ */ jsx43(FileText, { className: "h-3 w-3" }),
    destination: "Saves to deal history"
  },
  vehicle: {
    label: "Vehicle Note",
    icon: /* @__PURE__ */ jsx43(FileText, { className: "h-3 w-3" }),
    destination: "Saves with vehicle record"
  },
  lead: {
    label: "Lead Note",
    icon: /* @__PURE__ */ jsx43(User, { className: "h-3 w-3" }),
    destination: "Saves to lead timeline"
  },
  service: {
    label: "Service Note",
    icon: /* @__PURE__ */ jsx43(FileText, { className: "h-3 w-3" }),
    destination: "Saves to service order"
  },
  standalone: {
    label: "Note",
    icon: /* @__PURE__ */ jsx43(FileText, { className: "h-3 w-3" }),
    destination: "Saves to record"
  }
};
var CONTEXT_PLACEHOLDERS = {
  customer: 'Add a note about this customer... (e.g., "Prefers trucks", "Budget-conscious")',
  showroom: 'Add notes from showroom visit... (e.g., "Interested in F-150", "Test drove Camry")',
  appraisal: 'Add appraisal notes... (e.g., "Needs new tires", "Clean interior")',
  deal: 'Add notes about this deal... (e.g., "Customer wants to close by Friday")',
  vehicle: 'Add vehicle notes... (e.g., "Recent paint touch-up", "New battery installed")',
  lead: 'Add lead notes... (e.g., "Responded to Facebook ad", "Looking for SUV")',
  service: 'Add service notes... (e.g., "Customer mentioned brake noise")',
  standalone: "Add a note..."
};
var Notes = React44.forwardRef(
  ({
    context,
    entityId,
    entityType,
    value: initialValue = "",
    onSave,
    onChange,
    autoSaveDelay = 2e3,
    showCharacterCount = true,
    maxLength = 5e3,
    showSaveStatus = true,
    isPrivate = false,
    userId = "current-user",
    userName = "Current User",
    tags = [],
    contextPlaceholder = true,
    height = "md",
    placeholder,
    className,
    ...props
  }, ref) => {
    const [content, setContent] = useState7(initialValue);
    const [saveStatus, setSaveStatus] = useState7("idle");
    const [lastSaved, setLastSaved] = useState7(null);
    const saveTimeoutRef = useRef7();
    const saveNote = useCallback4(async () => {
      if (!content.trim()) {
        setSaveStatus("idle");
        return;
      }
      setSaveStatus("saving");
      try {
        const note = {
          id: `note-${Date.now()}`,
          content: content.trim(),
          context,
          entityId,
          entityType,
          createdBy: userId,
          createdByName: userName,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          isPrivate,
          tags
        };
        await new Promise((resolve) => setTimeout(resolve, 500));
        onSave?.(note);
        setSaveStatus("saved");
        setLastSaved(/* @__PURE__ */ new Date());
        setTimeout(() => setSaveStatus("idle"), 2e3);
      } catch (error) {
        console.error("Failed to save note:", error);
        setSaveStatus("error");
      }
    }, [content, context, entityId, entityType, userId, userName, isPrivate, tags, onSave]);
    useEffect6(() => {
      if (content !== initialValue) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveNote();
        }, autoSaveDelay);
      }
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, [content, initialValue, autoSaveDelay, saveNote]);
    const handleChange = (e) => {
      const newContent = e.target.value;
      setContent(newContent);
      onChange?.(newContent);
    };
    const contextInfo = CONTEXT_LABELS[context];
    const defaultPlaceholder = contextPlaceholder ? CONTEXT_PLACEHOLDERS[context] : "Add a note...";
    return /* @__PURE__ */ jsxs27("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs27("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs27("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs27(Badge, { variant: "outline", size: "sm", className: "gap-1", children: [
            contextInfo.icon,
            contextInfo.label
          ] }),
          /* @__PURE__ */ jsx43("span", { className: "text-xs text-text-tertiary", children: contextInfo.destination })
        ] }),
        showSaveStatus && saveStatus !== "idle" && /* @__PURE__ */ jsxs27("div", { className: "flex items-center gap-1.5 text-xs", children: [
          saveStatus === "saving" && /* @__PURE__ */ jsxs27(Fragment3, { children: [
            /* @__PURE__ */ jsx43(Clock, { className: "h-3 w-3 animate-spin text-text-tertiary" }),
            /* @__PURE__ */ jsx43("span", { className: "text-text-tertiary", children: "Saving..." })
          ] }),
          saveStatus === "saved" && /* @__PURE__ */ jsxs27(Fragment3, { children: [
            /* @__PURE__ */ jsx43(CheckCircle2, { className: "h-3 w-3 text-status-success" }),
            /* @__PURE__ */ jsx43("span", { className: "text-status-success", children: "Saved" })
          ] }),
          saveStatus === "error" && /* @__PURE__ */ jsxs27(Fragment3, { children: [
            /* @__PURE__ */ jsx43(AlertCircle2, { className: "h-3 w-3 text-status-error" }),
            /* @__PURE__ */ jsx43("span", { className: "text-status-error", children: "Failed to save" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx43(
        Textarea,
        {
          ref,
          value: content,
          onChange: handleChange,
          placeholder: placeholder || defaultPlaceholder,
          maxLength,
          className: cn(notesVariants({ height }), className),
          ...props
        }
      ),
      /* @__PURE__ */ jsxs27("div", { className: "flex items-center justify-between text-xs text-text-tertiary", children: [
        /* @__PURE__ */ jsxs27("div", { className: "flex items-center gap-3", children: [
          showCharacterCount && /* @__PURE__ */ jsxs27("span", { children: [
            content.length,
            " / ",
            maxLength,
            " characters"
          ] }),
          lastSaved && /* @__PURE__ */ jsxs27("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx43(Clock, { className: "h-3 w-3" }),
            "Last saved ",
            lastSaved.toLocaleTimeString()
          ] })
        ] }),
        isPrivate && /* @__PURE__ */ jsx43(Badge, { variant: "outline", size: "sm", children: "Private" })
      ] })
    ] });
  }
);
Notes.displayName = "Notes";

// src/components/Table.tsx
import * as React45 from "react";
import { cva as cva25 } from "class-variance-authority";
import { jsx as jsx44, jsxs as jsxs28 } from "react/jsx-runtime";
var tableVariants = cva25("w-full caption-bottom text-sm", {
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
var Table = React45.forwardRef(
  ({ className, variant, density, ...props }, ref) => /* @__PURE__ */ jsx44("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsx44(
    "table",
    {
      ref,
      className: tableVariants({ variant, density, className }),
      ...props
    }
  ) })
);
Table.displayName = "Table";
var TableHeader = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx44(
  "thead",
  {
    ref,
    className: `border-b border-border-base ${className || ""}`,
    ...props
  }
));
TableHeader.displayName = "TableHeader";
var TableBody = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx44("tbody", { ref, className: `[&_tr:last-child]:border-0 ${className || ""}`, ...props }));
TableBody.displayName = "TableBody";
var TableFooter = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx44(
  "tfoot",
  {
    ref,
    className: `border-t border-border-base bg-surface-subtle font-medium ${className || ""}`,
    ...props
  }
));
TableFooter.displayName = "TableFooter";
var TableRow = React45.forwardRef(({ className, clickable, ...props }, ref) => /* @__PURE__ */ jsx44(
  "tr",
  {
    ref,
    className: `border-b border-border-base transition-colors ${clickable ? "cursor-pointer hover:bg-surface-subtle data-[state=selected]:bg-surface-subtle" : "data-[state=selected]:bg-surface-subtle"} ${className || ""}`,
    ...props
  }
));
TableRow.displayName = "TableRow";
var TableHead = React45.forwardRef(({ className, sortable, children, ...props }, ref) => /* @__PURE__ */ jsx44(
  "th",
  {
    ref,
    className: `h-12 px-4 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0 ${sortable ? "cursor-pointer hover:text-text-primary" : ""} ${className || ""}`,
    ...props,
    children: sortable ? /* @__PURE__ */ jsxs28("div", { className: "flex items-center gap-2", children: [
      children,
      /* @__PURE__ */ jsx44("span", { className: "text-xs opacity-50", children: "\u21C5" })
    ] }) : children
  }
));
TableHead.displayName = "TableHead";
var TableCell = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx44(
  "td",
  {
    ref,
    className: `px-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ""}`,
    ...props
  }
));
TableCell.displayName = "TableCell";
var TableCaption = React45.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx44(
  "caption",
  {
    ref,
    className: `mt-4 text-sm text-text-secondary ${className || ""}`,
    ...props
  }
));
TableCaption.displayName = "TableCaption";

// src/components/Tooltip.tsx
import * as React46 from "react";
import { cva as cva26 } from "class-variance-authority";
import { jsx as jsx45, jsxs as jsxs29 } from "react/jsx-runtime";
var tooltipVariants = cva26(
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
var tooltipArrowVariants = cva26("absolute w-2 h-2 rotate-45", {
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
  const [isVisible, setIsVisible] = React46.useState(false);
  const timeoutRef = React46.useRef();
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
  React46.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return /* @__PURE__ */ jsxs29(
    "div",
    {
      className: "relative inline-flex",
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      children: [
        children,
        isVisible && content && /* @__PURE__ */ jsxs29(
          "div",
          {
            className: tooltipVariants({ variant, side, className }),
            style: { opacity: isVisible ? 1 : 0 },
            role: "tooltip",
            children: [
              content,
              showArrow && /* @__PURE__ */ jsx45("div", { className: tooltipArrowVariants({ variant, side }) })
            ]
          }
        )
      ]
    }
  );
};
Tooltip.displayName = "Tooltip";

// src/components/RadixTooltip.tsx
import * as React47 from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { jsx as jsx46 } from "react/jsx-runtime";
var TooltipProvider = ({
  delayDuration = 200,
  skipDelayDuration = 300,
  ...props
}) => /* @__PURE__ */ jsx46(
  TooltipPrimitive.Provider,
  {
    delayDuration,
    skipDelayDuration,
    ...props
  }
);
var TooltipRoot = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = React47.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx46(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md",
      "bg-[var(--surface,white)] text-[var(--text,#0b1020)] border-[var(--border,#c9d3e3)]",
      "animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "origin-[var(--radix-tooltip-content-transform-origin)]",
      className
    ),
    ...props
  }
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// src/components/Separator.tsx
import * as React48 from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { jsx as jsx47 } from "react/jsx-runtime";
var Separator2 = React48.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx47(
    SeparatorPrimitive.Root,
    {
      ref,
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border-base",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      ),
      ...props
    }
  )
);
Separator2.displayName = SeparatorPrimitive.Root.displayName;

// src/components/LaneBoard.tsx
import React49 from "react";
import { cva as cva27 } from "class-variance-authority";
import { jsx as jsx48, jsxs as jsxs30 } from "react/jsx-runtime";
var laneBoardVariants = cva27(
  "flex gap-4 overflow-x-auto pb-4",
  {
    variants: {
      padding: {
        none: "p-0",
        sm: "p-2",
        md: "p-4",
        lg: "p-6"
      },
      gap: {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6"
      },
      height: {
        auto: "h-auto",
        full: "h-full",
        screen: "h-screen"
      }
    },
    defaultVariants: {
      padding: "md",
      gap: "md",
      height: "auto"
    }
  }
);
var LaneBoard = React49.forwardRef(
  ({ className, padding, gap, height, children, ...props }, ref) => {
    return /* @__PURE__ */ jsx48(
      "div",
      {
        ref,
        className: cn(laneBoardVariants({ padding, gap, height }), className),
        ...props,
        children
      }
    );
  }
);
LaneBoard.displayName = "LaneBoard";
var laneVariants = cva27(
  "flex flex-col flex-shrink-0 bg-surface-subtle border border-border-base rounded-lg",
  {
    variants: {
      width: {
        sm: "w-64",
        md: "w-80",
        lg: "w-96",
        full: "w-full"
      },
      maxHeight: {
        none: "",
        sm: "max-h-96",
        md: "max-h-[600px]",
        lg: "max-h-[800px]",
        full: "max-h-full"
      }
    },
    defaultVariants: {
      width: "md",
      maxHeight: "md"
    }
  }
);
var Lane = React49.forwardRef(
  ({ className, width, maxHeight, title, count: count3, color = "neutral", children, ...props }, ref) => {
    const colorClasses = {
      neutral: "bg-surface-base border-border-base",
      blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
      green: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
      yellow: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
      red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
      purple: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
    };
    const badgeColorClasses = {
      neutral: "bg-surface-muted text-text-secondary",
      blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
      green: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
      yellow: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
      red: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
      purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
    };
    return /* @__PURE__ */ jsxs30(
      "div",
      {
        ref,
        className: cn(laneVariants({ width, maxHeight }), className),
        ...props,
        children: [
          /* @__PURE__ */ jsxs30("div", { className: cn("flex items-center justify-between p-4 border-b", colorClasses[color]), children: [
            /* @__PURE__ */ jsx48("h3", { className: "text-sm font-bold text-text-primary", children: title }),
            count3 !== void 0 && /* @__PURE__ */ jsx48(
              "span",
              {
                className: cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold",
                  badgeColorClasses[color]
                ),
                children: count3
              }
            )
          ] }),
          /* @__PURE__ */ jsx48("div", { className: "flex-1 overflow-y-auto p-3 space-y-2", children })
        ]
      }
    );
  }
);
Lane.displayName = "Lane";

// src/components/LaneCard.tsx
import React50 from "react";
import { cva as cva28 } from "class-variance-authority";
import { jsx as jsx49 } from "react/jsx-runtime";
var laneCardVariants = cva28(
  "bg-surface-base border rounded-lg transition-all cursor-pointer",
  {
    variants: {
      size: {
        sm: "p-2 text-xs",
        md: "p-3 text-sm",
        lg: "p-4 text-base"
      },
      tone: {
        neutral: "border-border-base hover:border-border-strong hover:shadow-md",
        success: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700",
        warning: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-700",
        error: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700",
        info: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700"
      },
      hover: {
        none: "",
        lift: "hover:scale-[1.02] hover:shadow-lg",
        glow: "hover:shadow-lg hover:ring-2 hover:ring-accent-primary/20",
        subtle: "hover:bg-surface-subtle"
      },
      dragging: {
        true: "opacity-50 rotate-2 scale-95 cursor-grabbing",
        false: ""
      },
      selected: {
        true: "ring-2 ring-accent-primary shadow-lg",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      tone: "neutral",
      hover: "lift",
      dragging: false,
      selected: false
    }
  }
);
var LaneCard = React50.forwardRef(
  ({
    className,
    size: size4,
    tone,
    hover,
    isDragging = false,
    isSelected = false,
    draggable = true,
    children,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx49(
      "div",
      {
        ref,
        draggable,
        className: cn(
          laneCardVariants({
            size: size4,
            tone,
            hover,
            dragging: isDragging,
            selected: isSelected
          }),
          className
        ),
        ...props,
        children
      }
    );
  }
);
LaneCard.displayName = "LaneCard";
var LaneCardHeader = React50.forwardRef(({ className, children, ...props }, ref) => {
  return /* @__PURE__ */ jsx49(
    "div",
    {
      ref,
      className: cn("mb-2 pb-2 border-b border-border-subtle", className),
      ...props,
      children
    }
  );
});
LaneCardHeader.displayName = "LaneCardHeader";
var LaneCardTitle = React50.forwardRef(({ className, children, ...props }, ref) => {
  return /* @__PURE__ */ jsx49(
    "h4",
    {
      ref,
      className: cn("font-semibold text-text-primary leading-tight", className),
      ...props,
      children
    }
  );
});
LaneCardTitle.displayName = "LaneCardTitle";
var LaneCardDescription = React50.forwardRef(({ className, children, ...props }, ref) => {
  return /* @__PURE__ */ jsx49(
    "p",
    {
      ref,
      className: cn("text-xs text-text-secondary mt-1", className),
      ...props,
      children
    }
  );
});
LaneCardDescription.displayName = "LaneCardDescription";
var LaneCardContent = React50.forwardRef(({ className, children, ...props }, ref) => {
  return /* @__PURE__ */ jsx49("div", { ref, className: cn("space-y-1", className), ...props, children });
});
LaneCardContent.displayName = "LaneCardContent";
var LaneCardFooter = React50.forwardRef(({ className, children, ...props }, ref) => {
  return /* @__PURE__ */ jsx49(
    "div",
    {
      ref,
      className: cn("mt-2 pt-2 border-t border-border-subtle flex items-center justify-between", className),
      ...props,
      children
    }
  );
});
LaneCardFooter.displayName = "LaneCardFooter";
var LaneCardBadge = React50.forwardRef(
  ({ className, variant = "neutral", children, ...props }, ref) => {
    const variantClasses = {
      neutral: "bg-surface-muted text-text-secondary",
      success: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
      warning: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
      error: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
      info: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
    };
    return /* @__PURE__ */ jsx49(
      "span",
      {
        ref,
        className: cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
          variantClasses[variant],
          className
        ),
        ...props,
        children
      }
    );
  }
);
LaneCardBadge.displayName = "LaneCardBadge";

// src/components/Modal.tsx
import * as React51 from "react";
import { cva as cva29 } from "class-variance-authority";
import { X } from "lucide-react";
import { Fragment as Fragment4, jsx as jsx50, jsxs as jsxs31 } from "react/jsx-runtime";
var modalOverlayVariants = cva29(
  "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
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
var modalContentVariants = cva29(
  "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full bg-surface-base rounded-lg shadow-xl transition-all duration-200",
  {
    variants: {
      size: {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw] max-h-[95vh]"
      },
      state: {
        open: "scale-100 opacity-100",
        closed: "scale-95 opacity-0 pointer-events-none"
      }
    },
    defaultVariants: {
      size: "md",
      state: "closed"
    }
  }
);
var Modal = ({
  open = false,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size: size4 = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}) => {
  const state = open ? "open" : "closed";
  React51.useEffect(() => {
    if (!closeOnEscape) return;
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        onOpenChange?.(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onOpenChange]);
  React51.useEffect(() => {
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
  if (!open && state === "closed") return null;
  return /* @__PURE__ */ jsxs31(Fragment4, { children: [
    /* @__PURE__ */ jsx50(
      "div",
      {
        className: modalOverlayVariants({ state }),
        onClick: handleOverlayClick,
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsxs31(
      "div",
      {
        className: modalContentVariants({ size: size4, state, className }),
        role: "dialog",
        "aria-modal": "true",
        onClick: (e) => e.stopPropagation(),
        children: [
          (title || showCloseButton) && /* @__PURE__ */ jsxs31("div", { className: "flex items-start justify-between p-6 border-b border-border-base", children: [
            /* @__PURE__ */ jsxs31("div", { className: "flex-1", children: [
              title && /* @__PURE__ */ jsx50("h2", { className: "text-lg font-semibold text-text-primary", children: title }),
              description && /* @__PURE__ */ jsx50("p", { className: "mt-1 text-sm text-text-secondary", children: description })
            ] }),
            showCloseButton && /* @__PURE__ */ jsx50(
              "button",
              {
                onClick: () => onOpenChange?.(false),
                className: "ml-4 p-1 rounded-md hover:bg-surface-subtle transition-colors",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsx50(X, { className: "w-5 h-5 text-text-secondary" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx50("div", { className: "p-6 overflow-y-auto max-h-[calc(95vh-200px)]", children }),
          footer && /* @__PURE__ */ jsx50("div", { className: "flex items-center justify-end gap-3 p-6 border-t border-border-base", children: footer })
        ]
      }
    )
  ] });
};
Modal.displayName = "Modal";

// src/components/Dropdown.tsx
import * as React52 from "react";
import { cva as cva30 } from "class-variance-authority";
import { ChevronRight as ChevronRight2 } from "lucide-react";
import { Fragment as Fragment5, jsx as jsx51, jsxs as jsxs32 } from "react/jsx-runtime";
var dropdownContentVariants = cva30(
  "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-border-base bg-surface-base p-1 shadow-lg transition-all duration-150",
  {
    variants: {
      align: {
        start: "left-0",
        center: "left-1/2 -translate-x-1/2",
        end: "right-0"
      },
      side: {
        top: "bottom-full mb-1",
        bottom: "top-full mt-1",
        left: "right-full mr-1",
        right: "left-full ml-1"
      },
      state: {
        open: "opacity-100 scale-100",
        closed: "opacity-0 scale-95 pointer-events-none"
      }
    },
    defaultVariants: {
      align: "start",
      side: "bottom",
      state: "closed"
    }
  }
);
var dropdownItemVariants = cva30(
  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
  {
    variants: {
      variant: {
        default: "hover:bg-surface-subtle focus:bg-surface-subtle",
        destructive: "text-status-error hover:bg-status-error/10 focus:bg-status-error/10"
      },
      disabled: {
        true: "pointer-events-none opacity-50",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      disabled: false
    }
  }
);
var Dropdown = ({
  trigger,
  items,
  onItemSelect,
  align = "start",
  side = "bottom",
  className,
  modal = false
}) => {
  const [isOpen, setIsOpen] = React52.useState(false);
  const [activeSubmenu, setActiveSubmenu] = React52.useState(null);
  const dropdownRef = React52.useRef(null);
  const state = isOpen ? "open" : "closed";
  React52.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);
  const handleItemClick = (item) => {
    if (item.disabled) return;
    if (item.submenu) return;
    item.onSelect?.();
    onItemSelect?.(item.value);
    setIsOpen(false);
    setActiveSubmenu(null);
  };
  const renderItem = (item, index2) => {
    if (item.separator) {
      return /* @__PURE__ */ jsx51("div", { className: "h-px my-1 bg-border-base" }, index2);
    }
    const hasSubmenu = !!item.submenu;
    return /* @__PURE__ */ jsxs32(
      "div",
      {
        className: "relative",
        onMouseEnter: () => hasSubmenu && setActiveSubmenu(index2),
        children: [
          /* @__PURE__ */ jsxs32(
            "div",
            {
              className: dropdownItemVariants({
                variant: item.destructive ? "destructive" : "default",
                disabled: item.disabled
              }),
              onClick: () => handleItemClick(item),
              children: [
                item.icon && /* @__PURE__ */ jsx51("span", { className: "mr-2 flex h-4 w-4 items-center justify-center", children: item.icon }),
                /* @__PURE__ */ jsx51("span", { className: "flex-1", children: item.label }),
                item.shortcut && /* @__PURE__ */ jsx51("span", { className: "ml-auto text-xs text-text-secondary", children: item.shortcut }),
                hasSubmenu && /* @__PURE__ */ jsx51(ChevronRight2, { className: "ml-auto h-4 w-4" })
              ]
            }
          ),
          hasSubmenu && activeSubmenu === index2 && /* @__PURE__ */ jsx51(
            "div",
            {
              className: dropdownContentVariants({
                align: "start",
                side: "right",
                state: "open"
              }),
              children: item.submenu.map(
                (subItem, subIndex) => renderItem(subItem, subIndex)
              )
            }
          )
        ]
      },
      index2
    );
  };
  return /* @__PURE__ */ jsxs32("div", { className: "relative inline-block", ref: dropdownRef, children: [
    /* @__PURE__ */ jsx51("div", { onClick: () => setIsOpen(!isOpen), children: trigger }),
    (isOpen || state === "open") && /* @__PURE__ */ jsxs32(Fragment5, { children: [
      modal && /* @__PURE__ */ jsx51(
        "div",
        {
          className: "fixed inset-0 z-40",
          onClick: () => setIsOpen(false)
        }
      ),
      /* @__PURE__ */ jsx51(
        "div",
        {
          className: dropdownContentVariants({ align, side, state, className }),
          children: items.map((item, index2) => renderItem(item, index2))
        }
      )
    ] })
  ] });
};
Dropdown.displayName = "Dropdown";

// src/components/Popover.tsx
import * as React53 from "react";
import { cva as cva31 } from "class-variance-authority";
import { X as X2 } from "lucide-react";
import { Fragment as Fragment6, jsx as jsx52, jsxs as jsxs33 } from "react/jsx-runtime";
var popoverContentVariants = cva31(
  "absolute z-50 rounded-md border border-border-base bg-surface-base shadow-lg outline-none transition-all duration-150",
  {
    variants: {
      align: {
        start: "left-0",
        center: "left-1/2 -translate-x-1/2",
        end: "right-0"
      },
      side: {
        top: "bottom-full mb-2",
        bottom: "top-full mt-2",
        left: "right-full mr-2",
        right: "left-full ml-2"
      },
      size: {
        sm: "w-64",
        md: "w-80",
        lg: "w-96",
        auto: "w-auto"
      },
      state: {
        open: "opacity-100 scale-100",
        closed: "opacity-0 scale-95 pointer-events-none"
      }
    },
    defaultVariants: {
      align: "start",
      side: "bottom",
      size: "md",
      state: "closed"
    }
  }
);
var popoverArrowVariants = cva31("absolute w-3 h-3 rotate-45 bg-surface-base border", {
  variants: {
    side: {
      top: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b border-border-base",
      bottom: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-l border-t border-border-base",
      left: "left-full top-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-t border-border-base",
      right: "right-full top-1/2 translate-x-1/2 -translate-y-1/2 border-l border-b border-border-base"
    }
  },
  defaultVariants: {
    side: "bottom"
  }
});
var Popover = ({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  align = "start",
  side = "bottom",
  size: size4 = "md",
  modal = false,
  showArrow = false,
  showCloseButton = false,
  title,
  className
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React53.useState(false);
  const popoverRef = React53.useRef(null);
  const isOpen = controlledOpen !== void 0 ? controlledOpen : uncontrolledOpen;
  const setIsOpen = onOpenChange || setUncontrolledOpen;
  const state = isOpen ? "open" : "closed";
  React53.useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen]);
  return /* @__PURE__ */ jsxs33("div", { className: "relative inline-block", ref: popoverRef, children: [
    /* @__PURE__ */ jsx52("div", { onClick: () => setIsOpen(!isOpen), children: trigger }),
    (isOpen || state === "open") && /* @__PURE__ */ jsxs33(Fragment6, { children: [
      modal && /* @__PURE__ */ jsx52("div", { className: "fixed inset-0 z-40", onClick: () => setIsOpen(false) }),
      /* @__PURE__ */ jsxs33(
        "div",
        {
          className: popoverContentVariants({ align, side, size: size4, state, className }),
          role: "dialog",
          children: [
            showArrow && /* @__PURE__ */ jsx52("div", { className: popoverArrowVariants({ side }) }),
            (title || showCloseButton) && /* @__PURE__ */ jsxs33("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border-base", children: [
              title && /* @__PURE__ */ jsx52("h3", { className: "text-sm font-semibold text-text-primary", children: title }),
              showCloseButton && /* @__PURE__ */ jsx52(
                "button",
                {
                  onClick: () => setIsOpen(false),
                  className: "p-1 rounded-md hover:bg-surface-subtle transition-colors ml-auto",
                  "aria-label": "Close",
                  children: /* @__PURE__ */ jsx52(X2, { className: "w-4 h-4 text-text-secondary" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx52("div", { className: "p-4", children })
          ]
        }
      )
    ] })
  ] });
};
Popover.displayName = "Popover";

// src/components/RadixPopover.tsx
import * as React54 from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { jsx as jsx53 } from "react/jsx-runtime";
var PopoverRoot = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverAnchor = PopoverPrimitive.Anchor;
var PopoverContent = React54.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx53(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx53(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border p-4 shadow-xl outline-none",
      "bg-[var(--surface,white)] text-[var(--text,#0b1020)] border-[var(--border,#c9d3e3)]",
      "ring-1 ring-[var(--ring,rgba(42,125,225,0.1))]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "origin-[var(--radix-popover-content-transform-origin)]",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// src/components/Sheet.tsx
import * as React55 from "react";
import { cva as cva32 } from "class-variance-authority";
import { X as X3 } from "lucide-react";
import { Fragment as Fragment7, jsx as jsx54, jsxs as jsxs34 } from "react/jsx-runtime";
var sheetOverlayVariants = cva32(
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
var sheetContentVariants = cva32(
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
  React55.useEffect(() => {
    if (!closeOnEscape) return;
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        onOpenChange?.(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onOpenChange]);
  React55.useEffect(() => {
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
  return /* @__PURE__ */ jsxs34(Fragment7, { children: [
    /* @__PURE__ */ jsx54(
      "div",
      {
        className: sheetOverlayVariants({ state }),
        onClick: handleOverlayClick,
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsxs34(
      "div",
      {
        className: sheetContentVariants({ side, state, className }),
        role: "dialog",
        "aria-modal": "true",
        children: [
          (title || showCloseButton) && /* @__PURE__ */ jsxs34("div", { className: "flex items-start justify-between p-6 border-b border-border-base", children: [
            /* @__PURE__ */ jsxs34("div", { className: "flex-1", children: [
              title && /* @__PURE__ */ jsx54("h2", { className: "text-lg font-semibold text-text-primary", children: title }),
              description && /* @__PURE__ */ jsx54("p", { className: "mt-1 text-sm text-text-secondary", children: description })
            ] }),
            showCloseButton && /* @__PURE__ */ jsx54(
              "button",
              {
                onClick: () => onOpenChange?.(false),
                className: "ml-4 p-1 rounded-md hover:bg-surface-subtle transition-colors",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsx54(X3, { className: "w-5 h-5 text-text-secondary" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx54("div", { className: "flex-1 p-6", children }),
          footer && /* @__PURE__ */ jsx54("div", { className: "flex items-center justify-end gap-3 p-6 border-t border-border-base", children: footer })
        ]
      }
    )
  ] });
};
Sheet.displayName = "Sheet";
var SheetPortal = ({ children }) => {
  return /* @__PURE__ */ jsx54(Fragment7, { children });
};
var SheetOverlay = React55.forwardRef(({ className, state = "closed", ...props }, ref) => /* @__PURE__ */ jsx54(
  "div",
  {
    ref,
    className: sheetOverlayVariants({ state, className }),
    ...props
  }
));
SheetOverlay.displayName = "SheetOverlay";
var SheetContent = React55.forwardRef(({ className, side = "right", state = "open", children, ...props }, ref) => /* @__PURE__ */ jsx54(
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
}) => /* @__PURE__ */ jsx54(
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
}) => /* @__PURE__ */ jsx54(
  "div",
  {
    className: `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ""}`,
    ...props
  }
);
SheetFooter.displayName = "SheetFooter";
var SheetTitle = React55.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx54(
  "h2",
  {
    ref,
    className: `text-lg font-semibold text-text-primary ${className || ""}`,
    ...props
  }
));
SheetTitle.displayName = "SheetTitle";
var SheetDescription = React55.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx54(
  "p",
  {
    ref,
    className: `text-sm text-text-secondary ${className || ""}`,
    ...props
  }
));
SheetDescription.displayName = "SheetDescription";
var SheetTrigger = React55.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx54("button", { ref, ...props }));
SheetTrigger.displayName = "SheetTrigger";
var SheetClose = React55.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx54(
  "button",
  {
    ref,
    className: `p-1 rounded-md hover:bg-surface-subtle transition-colors ${className || ""}`,
    ...props,
    children: /* @__PURE__ */ jsx54(X3, { className: "w-5 h-5 text-text-secondary" })
  }
));
SheetClose.displayName = "SheetClose";

// src/components/Toast.tsx
import * as React56 from "react";
import { cva as cva33 } from "class-variance-authority";
import { X as X4, CheckCircle as CheckCircle3, AlertCircle as AlertCircle3, Info as Info2, AlertTriangle } from "lucide-react";
import { jsx as jsx55, jsxs as jsxs35 } from "react/jsx-runtime";
var toastVariants = cva33(
  "pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-surface-base border-border-base",
        success: "bg-status-success/10 border-status-success/20",
        error: "bg-status-error/10 border-status-error/20",
        warning: "bg-status-warning/10 border-status-warning/20",
        info: "bg-accent-info/10 border-accent-info/20"
      },
      position: {
        "top-left": "top-4 left-4",
        "top-center": "top-4 left-1/2 -translate-x-1/2",
        "top-right": "top-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
        "bottom-right": "bottom-4 right-4"
      },
      state: {
        entering: "animate-in slide-in-from-top-2",
        entered: "opacity-100",
        exiting: "animate-out slide-out-to-top-2 opacity-0",
        exited: "opacity-0 pointer-events-none"
      }
    },
    defaultVariants: {
      variant: "default",
      position: "top-right",
      state: "entered"
    }
  }
);
var Toast = ({
  id,
  title,
  description,
  action,
  variant = "default",
  position = "top-right",
  duration = 5e3,
  onClose,
  showIcon = true,
  showCloseButton = true,
  className
}) => {
  const [state, setState] = React56.useState(
    "entering"
  );
  React56.useEffect(() => {
    const enterTimer = setTimeout(() => setState("entered"), 100);
    const dismissTimer = duration ? setTimeout(() => {
      setState("exiting");
      setTimeout(() => {
        setState("exited");
        onClose?.();
      }, 300);
    }, duration) : void 0;
    return () => {
      clearTimeout(enterTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);
  const handleClose = () => {
    setState("exiting");
    setTimeout(() => {
      setState("exited");
      onClose?.();
    }, 300);
  };
  const getIcon = () => {
    switch (variant) {
      case "success":
        return /* @__PURE__ */ jsx55(CheckCircle3, { className: "w-5 h-5 text-status-success" });
      case "error":
        return /* @__PURE__ */ jsx55(AlertCircle3, { className: "w-5 h-5 text-status-error" });
      case "warning":
        return /* @__PURE__ */ jsx55(AlertTriangle, { className: "w-5 h-5 text-status-warning" });
      case "info":
        return /* @__PURE__ */ jsx55(Info2, { className: "w-5 h-5 text-accent-info" });
      default:
        return null;
    }
  };
  if (state === "exited") return null;
  return /* @__PURE__ */ jsx55("div", { className: `fixed z-[100] ${toastVariants({ variant, position, state, className })}`, children: /* @__PURE__ */ jsxs35("div", { className: "flex gap-3 p-4", children: [
    showIcon && getIcon() && /* @__PURE__ */ jsx55("div", { className: "flex-shrink-0 mt-0.5", children: getIcon() }),
    /* @__PURE__ */ jsxs35("div", { className: "flex-1 min-w-0", children: [
      title && /* @__PURE__ */ jsx55("div", { className: "text-sm font-semibold text-text-primary", children: title }),
      description && /* @__PURE__ */ jsx55("div", { className: "mt-1 text-sm text-text-secondary", children: description }),
      action && /* @__PURE__ */ jsx55("div", { className: "mt-3", children: action })
    ] }),
    showCloseButton && /* @__PURE__ */ jsx55(
      "button",
      {
        onClick: handleClose,
        className: "flex-shrink-0 p-1 rounded-md hover:bg-surface-subtle transition-colors",
        "aria-label": "Close",
        children: /* @__PURE__ */ jsx55(X4, { className: "w-4 h-4 text-text-secondary" })
      }
    )
  ] }) });
};
Toast.displayName = "Toast";
var ToastContext = React56.createContext(void 0);
var useToast = () => {
  const context = React56.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
var ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React56.useState([]);
  const addToast = (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const removeAllToasts = () => {
    setToasts([]);
  };
  return /* @__PURE__ */ jsxs35(ToastContext.Provider, { value: { toasts, addToast, removeToast, removeAllToasts }, children: [
    children,
    toasts.map((toast) => /* @__PURE__ */ jsx55(Toast, { ...toast, onClose: () => removeToast(toast.id) }, toast.id))
  ] });
};

// src/components/Toaster.tsx
import { Fragment as Fragment8, jsx as jsx56 } from "react/jsx-runtime";
function Toaster() {
  const { toasts, removeToast } = useToast();
  return /* @__PURE__ */ jsx56(Fragment8, { children: toasts.map((toast) => /* @__PURE__ */ jsx56(
    Toast,
    {
      ...toast,
      onClose: () => removeToast(toast.id)
    },
    toast.id
  )) });
}

// src/components/RadixCommand.tsx
import * as React57 from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { jsx as jsx57, jsxs as jsxs36 } from "react/jsx-runtime";
var Command = React57.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx57(
  CommandPrimitive,
  {
    ref,
    className: cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md",
      "bg-[var(--surface,white)] text-[var(--text,#0b1020)]",
      className
    ),
    ...props
  }
));
Command.displayName = CommandPrimitive.displayName;
var CommandInput = React57.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs36("div", { className: "flex items-center border-b border-[var(--border,#c9d3e3)] px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsx57(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsx57(
    CommandPrimitive.Input,
    {
      ref,
      className: cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none",
        "placeholder:text-[var(--text-muted,#6b7280)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = CommandPrimitive.Input.displayName;
var CommandList = React57.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx57(
  CommandPrimitive.List,
  {
    ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = CommandPrimitive.List.displayName;
var CommandEmpty = React57.forwardRef((props, ref) => /* @__PURE__ */ jsx57(CommandPrimitive.Empty, { ref, className: "py-6 text-center text-sm", ...props }));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;
var CommandGroup = React57.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx57(
  CommandPrimitive.Group,
  {
    ref,
    className: cn(
      "overflow-hidden p-1",
      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
      "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
      "[&_[cmdk-group-heading]]:text-[var(--text-muted,#6b7280)]",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;
var CommandSeparator = React57.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx57(
  CommandPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 h-px bg-[var(--border,#c9d3e3)]", className),
    ...props
  }
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;
var CommandItem = React57.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx57(
  CommandPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      "data-[disabled=true]:pointer-events-none",
      'data-[selected="true"]:bg-[var(--surface-hover,#f7f9fc)]',
      "data-[selected=true]:text-[var(--text,#0b1020)]",
      "data-[disabled=true]:opacity-50",
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    ),
    ...props
  }
));
CommandItem.displayName = CommandPrimitive.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
  return /* @__PURE__ */ jsx57(
    "span",
    {
      className: cn(
        "ml-auto text-xs tracking-widest text-[var(--text-muted,#6b7280)]",
        className
      ),
      ...props
    }
  );
};
CommandShortcut.displayName = "CommandShortcut";

// src/components/AlertDialog.tsx
import * as React74 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-alert-dialog@1.1.7_@types+react-dom@18.3.1_@types+react@18.3.12_react-d_49b8c261ee123356a60b785fcb91dab5/node_modules/@radix-ui/react-alert-dialog/dist/index.mjs
import * as React73 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-dialog@1.1.7_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-dialog/dist/index.mjs
import * as React72 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-id@1.1.1_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-id/dist/index.mjs
import * as React58 from "react";
var useReactId = React58[" useId ".trim().toString()] || (() => void 0);
var count = 0;
function useId3(deterministicId) {
  const [id, setId] = React58.useState(useReactId());
  useLayoutEffect2(() => {
    if (!deterministicId) setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return deterministicId || (id ? `radix-${id}` : "");
}

// ../../node_modules/.pnpm/@radix-ui+react-use-controllable-state@1.1.1_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
import * as React59 from "react";
function useControllableState({
  prop,
  defaultProp,
  onChange = () => {
  }
}) {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({ defaultProp, onChange });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  const handleChange = useCallbackRef(onChange);
  const setValue = React59.useCallback(
    (nextValue) => {
      if (isControlled) {
        const setter = nextValue;
        const value2 = typeof nextValue === "function" ? setter(prop) : nextValue;
        if (value2 !== prop) handleChange(value2);
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, handleChange]
  );
  return [value, setValue];
}
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const uncontrolledState = React59.useState(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = React59.useRef(value);
  const handleChange = useCallbackRef(onChange);
  React59.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef, handleChange]);
  return uncontrolledState;
}

// ../../node_modules/.pnpm/@radix-ui+react-dismissable-layer@1.1.6_@types+react-dom@18.3.1_@types+react@18.3.12_re_05febf8f8359ad3bc44eaa1fcc58157a/node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
import * as React61 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-use-escape-keydown@1.1.1_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
import * as React60 from "react";
function useEscapeKeydown(onEscapeKeyDownProp, ownerDocument = globalThis?.document) {
  const onEscapeKeyDown = useCallbackRef(onEscapeKeyDownProp);
  React60.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onEscapeKeyDown(event);
      }
    };
    ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => ownerDocument.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [onEscapeKeyDown, ownerDocument]);
}

// ../../node_modules/.pnpm/@radix-ui+react-dismissable-layer@1.1.6_@types+react-dom@18.3.1_@types+react@18.3.12_re_05febf8f8359ad3bc44eaa1fcc58157a/node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
import { jsx as jsx58 } from "react/jsx-runtime";
var DISMISSABLE_LAYER_NAME = "DismissableLayer";
var CONTEXT_UPDATE = "dismissableLayer.update";
var POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
var FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
var originalBodyPointerEvents;
var DismissableLayerContext = React61.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
});
var DismissableLayer = React61.forwardRef(
  (props, forwardedRef) => {
    const {
      disableOutsidePointerEvents = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ...layerProps
    } = props;
    const context = React61.useContext(DismissableLayerContext);
    const [node, setNode] = React61.useState(null);
    const ownerDocument = node?.ownerDocument ?? globalThis?.document;
    const [, force] = React61.useState({});
    const composedRefs = useComposedRefs(forwardedRef, (node2) => setNode(node2));
    const layers = Array.from(context.layers);
    const [highestLayerWithOutsidePointerEventsDisabled] = [...context.layersWithOutsidePointerEventsDisabled].slice(-1);
    const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(highestLayerWithOutsidePointerEventsDisabled);
    const index2 = node ? layers.indexOf(node) : -1;
    const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
    const isPointerEventsEnabled = index2 >= highestLayerWithOutsidePointerEventsDisabledIndex;
    const pointerDownOutside = usePointerDownOutside((event) => {
      const target = event.target;
      const isPointerDownOnBranch = [...context.branches].some((branch) => branch.contains(target));
      if (!isPointerEventsEnabled || isPointerDownOnBranch) return;
      onPointerDownOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented) onDismiss?.();
    }, ownerDocument);
    const focusOutside = useFocusOutside((event) => {
      const target = event.target;
      const isFocusInBranch = [...context.branches].some((branch) => branch.contains(target));
      if (isFocusInBranch) return;
      onFocusOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented) onDismiss?.();
    }, ownerDocument);
    useEscapeKeydown((event) => {
      const isHighestLayer = index2 === context.layers.size - 1;
      if (!isHighestLayer) return;
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented && onDismiss) {
        event.preventDefault();
        onDismiss();
      }
    }, ownerDocument);
    React61.useEffect(() => {
      if (!node) return;
      if (disableOutsidePointerEvents) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
          ownerDocument.body.style.pointerEvents = "none";
        }
        context.layersWithOutsidePointerEventsDisabled.add(node);
      }
      context.layers.add(node);
      dispatchUpdate();
      return () => {
        if (disableOutsidePointerEvents && context.layersWithOutsidePointerEventsDisabled.size === 1) {
          ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
        }
      };
    }, [node, ownerDocument, disableOutsidePointerEvents, context]);
    React61.useEffect(() => {
      return () => {
        if (!node) return;
        context.layers.delete(node);
        context.layersWithOutsidePointerEventsDisabled.delete(node);
        dispatchUpdate();
      };
    }, [node, context]);
    React61.useEffect(() => {
      const handleUpdate = () => force({});
      document.addEventListener(CONTEXT_UPDATE, handleUpdate);
      return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
    }, []);
    return /* @__PURE__ */ jsx58(
      Primitive.div,
      {
        ...layerProps,
        ref: composedRefs,
        style: {
          pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : void 0,
          ...props.style
        },
        onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture),
        onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture),
        onPointerDownCapture: composeEventHandlers(
          props.onPointerDownCapture,
          pointerDownOutside.onPointerDownCapture
        )
      }
    );
  }
);
DismissableLayer.displayName = DISMISSABLE_LAYER_NAME;
var BRANCH_NAME = "DismissableLayerBranch";
var DismissableLayerBranch = React61.forwardRef((props, forwardedRef) => {
  const context = React61.useContext(DismissableLayerContext);
  const ref = React61.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  React61.useEffect(() => {
    const node = ref.current;
    if (node) {
      context.branches.add(node);
      return () => {
        context.branches.delete(node);
      };
    }
  }, [context.branches]);
  return /* @__PURE__ */ jsx58(Primitive.div, { ...props, ref: composedRefs });
});
DismissableLayerBranch.displayName = BRANCH_NAME;
function usePointerDownOutside(onPointerDownOutside, ownerDocument = globalThis?.document) {
  const handlePointerDownOutside = useCallbackRef(onPointerDownOutside);
  const isPointerInsideReactTreeRef = React61.useRef(false);
  const handleClickRef = React61.useRef(() => {
  });
  React61.useEffect(() => {
    const handlePointerDown = (event) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        let handleAndDispatchPointerDownOutsideEvent2 = function() {
          handleAndDispatchCustomEvent(
            POINTER_DOWN_OUTSIDE,
            handlePointerDownOutside,
            eventDetail,
            { discrete: true }
          );
        };
        var handleAndDispatchPointerDownOutsideEvent = handleAndDispatchPointerDownOutsideEvent2;
        const eventDetail = { originalEvent: event };
        if (event.pointerType === "touch") {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          handleClickRef.current = handleAndDispatchPointerDownOutsideEvent2;
          ownerDocument.addEventListener("click", handleClickRef.current, { once: true });
        } else {
          handleAndDispatchPointerDownOutsideEvent2();
        }
      } else {
        ownerDocument.removeEventListener("click", handleClickRef.current);
      }
      isPointerInsideReactTreeRef.current = false;
    };
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", handlePointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("click", handleClickRef.current);
    };
  }, [ownerDocument, handlePointerDownOutside]);
  return {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => isPointerInsideReactTreeRef.current = true
  };
}
function useFocusOutside(onFocusOutside, ownerDocument = globalThis?.document) {
  const handleFocusOutside = useCallbackRef(onFocusOutside);
  const isFocusInsideReactTreeRef = React61.useRef(false);
  React61.useEffect(() => {
    const handleFocus = (event) => {
      if (event.target && !isFocusInsideReactTreeRef.current) {
        const eventDetail = { originalEvent: event };
        handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
          discrete: false
        });
      }
    };
    ownerDocument.addEventListener("focusin", handleFocus);
    return () => ownerDocument.removeEventListener("focusin", handleFocus);
  }, [ownerDocument, handleFocusOutside]);
  return {
    onFocusCapture: () => isFocusInsideReactTreeRef.current = true,
    onBlurCapture: () => isFocusInsideReactTreeRef.current = false
  };
}
function dispatchUpdate() {
  const event = new CustomEvent(CONTEXT_UPDATE);
  document.dispatchEvent(event);
}
function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail });
  if (handler) target.addEventListener(name, handler, { once: true });
  if (discrete) {
    dispatchDiscreteCustomEvent(target, event);
  } else {
    target.dispatchEvent(event);
  }
}

// ../../node_modules/.pnpm/@radix-ui+react-focus-scope@1.1.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-do_c42f710521ff2d68a4f06b782dce924d/node_modules/@radix-ui/react-focus-scope/dist/index.mjs
import * as React62 from "react";
import { jsx as jsx59 } from "react/jsx-runtime";
var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var FOCUS_SCOPE_NAME = "FocusScope";
var FocusScope = React62.forwardRef((props, forwardedRef) => {
  const {
    loop = false,
    trapped = false,
    onMountAutoFocus: onMountAutoFocusProp,
    onUnmountAutoFocus: onUnmountAutoFocusProp,
    ...scopeProps
  } = props;
  const [container, setContainer] = React62.useState(null);
  const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp);
  const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp);
  const lastFocusedElementRef = React62.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, (node) => setContainer(node));
  const focusScope = React62.useRef({
    paused: false,
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    }
  }).current;
  React62.useEffect(() => {
    if (trapped) {
      let handleFocusIn2 = function(event) {
        if (focusScope.paused || !container) return;
        const target = event.target;
        if (container.contains(target)) {
          lastFocusedElementRef.current = target;
        } else {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleFocusOut2 = function(event) {
        if (focusScope.paused || !container) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget === null) return;
        if (!container.contains(relatedTarget)) {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleMutations2 = function(mutations) {
        const focusedElement = document.activeElement;
        if (focusedElement !== document.body) return;
        for (const mutation of mutations) {
          if (mutation.removedNodes.length > 0) focus(container);
        }
      };
      var handleFocusIn = handleFocusIn2, handleFocusOut = handleFocusOut2, handleMutations = handleMutations2;
      document.addEventListener("focusin", handleFocusIn2);
      document.addEventListener("focusout", handleFocusOut2);
      const mutationObserver = new MutationObserver(handleMutations2);
      if (container) mutationObserver.observe(container, { childList: true, subtree: true });
      return () => {
        document.removeEventListener("focusin", handleFocusIn2);
        document.removeEventListener("focusout", handleFocusOut2);
        mutationObserver.disconnect();
      };
    }
  }, [trapped, container, focusScope.paused]);
  React62.useEffect(() => {
    if (container) {
      focusScopesStack.add(focusScope);
      const previouslyFocusedElement = document.activeElement;
      const hasFocusedCandidate = container.contains(previouslyFocusedElement);
      if (!hasFocusedCandidate) {
        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
        container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        container.dispatchEvent(mountEvent);
        if (!mountEvent.defaultPrevented) {
          focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
          if (document.activeElement === previouslyFocusedElement) {
            focus(container);
          }
        }
      }
      return () => {
        container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        setTimeout(() => {
          const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
          container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          container.dispatchEvent(unmountEvent);
          if (!unmountEvent.defaultPrevented) {
            focus(previouslyFocusedElement ?? document.body, { select: true });
          }
          container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          focusScopesStack.remove(focusScope);
        }, 0);
      };
    }
  }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);
  const handleKeyDown = React62.useCallback(
    (event) => {
      if (!loop && !trapped) return;
      if (focusScope.paused) return;
      const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
      const focusedElement = document.activeElement;
      if (isTabKey && focusedElement) {
        const container2 = event.currentTarget;
        const [first, last] = getTabbableEdges(container2);
        const hasTabbableElementsInside = first && last;
        if (!hasTabbableElementsInside) {
          if (focusedElement === container2) event.preventDefault();
        } else {
          if (!event.shiftKey && focusedElement === last) {
            event.preventDefault();
            if (loop) focus(first, { select: true });
          } else if (event.shiftKey && focusedElement === first) {
            event.preventDefault();
            if (loop) focus(last, { select: true });
          }
        }
      }
    },
    [loop, trapped, focusScope.paused]
  );
  return /* @__PURE__ */ jsx59(Primitive.div, { tabIndex: -1, ...scopeProps, ref: composedRefs, onKeyDown: handleKeyDown });
});
FocusScope.displayName = FOCUS_SCOPE_NAME;
function focusFirst(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}
function getTabbableEdges(container) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last];
}
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
function findVisible(elements, container) {
  for (const element of elements) {
    if (!isHidden(element, { upTo: container })) return element;
  }
}
function isHidden(node, { upTo }) {
  if (getComputedStyle(node).visibility === "hidden") return true;
  while (node) {
    if (upTo !== void 0 && node === upTo) return false;
    if (getComputedStyle(node).display === "none") return true;
    node = node.parentElement;
  }
  return false;
}
function isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
function focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
      element.select();
  }
}
var focusScopesStack = createFocusScopesStack();
function createFocusScopesStack() {
  let stack = [];
  return {
    add(focusScope) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) {
        activeFocusScope?.pause();
      }
      stack = arrayRemove(stack, focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope) {
      stack = arrayRemove(stack, focusScope);
      stack[0]?.resume();
    }
  };
}
function arrayRemove(array, item) {
  const updatedArray = [...array];
  const index2 = updatedArray.indexOf(item);
  if (index2 !== -1) {
    updatedArray.splice(index2, 1);
  }
  return updatedArray;
}
function removeLinks(items) {
  return items.filter((item) => item.tagName !== "A");
}

// ../../node_modules/.pnpm/@radix-ui+react-portal@1.1.5_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-portal/dist/index.mjs
import * as React63 from "react";
import ReactDOM2 from "react-dom";
import { jsx as jsx60 } from "react/jsx-runtime";
var PORTAL_NAME = "Portal";
var Portal3 = React63.forwardRef((props, forwardedRef) => {
  const { container: containerProp, ...portalProps } = props;
  const [mounted, setMounted] = React63.useState(false);
  useLayoutEffect2(() => setMounted(true), []);
  const container = containerProp || mounted && globalThis?.document?.body;
  return container ? ReactDOM2.createPortal(/* @__PURE__ */ jsx60(Primitive.div, { ...portalProps, ref: forwardedRef }), container) : null;
});
Portal3.displayName = PORTAL_NAME;

// ../../node_modules/.pnpm/@radix-ui+react-focus-guards@1.1.2_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-focus-guards/dist/index.mjs
import * as React64 from "react";
var count2 = 0;
function useFocusGuards() {
  React64.useEffect(() => {
    const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
    document.body.insertAdjacentElement("afterbegin", edgeGuards[0] ?? createFocusGuard());
    document.body.insertAdjacentElement("beforeend", edgeGuards[1] ?? createFocusGuard());
    count2++;
    return () => {
      if (count2 === 1) {
        document.querySelectorAll("[data-radix-focus-guard]").forEach((node) => node.remove());
      }
      count2--;
    };
  }, []);
}
function createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-radix-focus-guard", "");
  element.tabIndex = 0;
  element.style.outline = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.pointerEvents = "none";
  return element;
}

// ../../node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.es6.mjs
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/Combination.js
import * as React71 from "react";

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/UI.js
import * as React67 from "react";

// ../../node_modules/.pnpm/react-remove-scroll-bar@2.3.8_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var zeroRightClassName = "right-scroll-bar-position";
var fullWidthClassName = "width-before-scroll-bar";
var noScrollbarsClassName = "with-scroll-bars-hidden";
var removedBarSizeVariable = "--removed-body-scroll-bar-size";

// ../../node_modules/.pnpm/use-callback-ref@1.3.3_@types+react@18.3.12_react@18.3.1/node_modules/use-callback-ref/dist/es2015/assignRef.js
function assignRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
  return ref;
}

// ../../node_modules/.pnpm/use-callback-ref@1.3.3_@types+react@18.3.12_react@18.3.1/node_modules/use-callback-ref/dist/es2015/useRef.js
import { useState as useState17 } from "react";
function useCallbackRef2(initialValue, callback) {
  var ref = useState17(function() {
    return {
      // value
      value: initialValue,
      // last callback
      callback,
      // "memoized" public interface
      facade: {
        get current() {
          return ref.value;
        },
        set current(value) {
          var last = ref.value;
          if (last !== value) {
            ref.value = value;
            ref.callback(value, last);
          }
        }
      }
    };
  })[0];
  ref.callback = callback;
  return ref.facade;
}

// ../../node_modules/.pnpm/use-callback-ref@1.3.3_@types+react@18.3.12_react@18.3.1/node_modules/use-callback-ref/dist/es2015/useMergeRef.js
import * as React65 from "react";
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? React65.useLayoutEffect : React65.useEffect;
var currentValues = /* @__PURE__ */ new WeakMap();
function useMergeRefs(refs, defaultValue) {
  var callbackRef = useCallbackRef2(defaultValue || null, function(newValue) {
    return refs.forEach(function(ref) {
      return assignRef(ref, newValue);
    });
  });
  useIsomorphicLayoutEffect(function() {
    var oldValue = currentValues.get(callbackRef);
    if (oldValue) {
      var prevRefs_1 = new Set(oldValue);
      var nextRefs_1 = new Set(refs);
      var current_1 = callbackRef.current;
      prevRefs_1.forEach(function(ref) {
        if (!nextRefs_1.has(ref)) {
          assignRef(ref, null);
        }
      });
      nextRefs_1.forEach(function(ref) {
        if (!prevRefs_1.has(ref)) {
          assignRef(ref, current_1);
        }
      });
    }
    currentValues.set(callbackRef, refs);
  }, [refs]);
  return callbackRef;
}

// ../../node_modules/.pnpm/use-sidecar@1.1.3_@types+react@18.3.12_react@18.3.1/node_modules/use-sidecar/dist/es2015/medium.js
function ItoI(a) {
  return a;
}
function innerCreateMedium(defaults, middleware) {
  if (middleware === void 0) {
    middleware = ItoI;
  }
  var buffer = [];
  var assigned = false;
  var medium = {
    read: function() {
      if (assigned) {
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      }
      if (buffer.length) {
        return buffer[buffer.length - 1];
      }
      return defaults;
    },
    useMedium: function(data) {
      var item = middleware(data, assigned);
      buffer.push(item);
      return function() {
        buffer = buffer.filter(function(x) {
          return x !== item;
        });
      };
    },
    assignSyncMedium: function(cb) {
      assigned = true;
      while (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
      }
      buffer = {
        push: function(x) {
          return cb(x);
        },
        filter: function() {
          return buffer;
        }
      };
    },
    assignMedium: function(cb) {
      assigned = true;
      var pendingQueue = [];
      if (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
        pendingQueue = buffer;
      }
      var executeQueue = function() {
        var cbs2 = pendingQueue;
        pendingQueue = [];
        cbs2.forEach(cb);
      };
      var cycle = function() {
        return Promise.resolve().then(executeQueue);
      };
      cycle();
      buffer = {
        push: function(x) {
          pendingQueue.push(x);
          cycle();
        },
        filter: function(filter) {
          pendingQueue = pendingQueue.filter(filter);
          return buffer;
        }
      };
    }
  };
  return medium;
}
function createSidecarMedium(options) {
  if (options === void 0) {
    options = {};
  }
  var medium = innerCreateMedium(null);
  medium.options = __assign({ async: true, ssr: false }, options);
  return medium;
}

// ../../node_modules/.pnpm/use-sidecar@1.1.3_@types+react@18.3.12_react@18.3.1/node_modules/use-sidecar/dist/es2015/exports.js
import * as React66 from "react";
var SideCar = function(_a) {
  var sideCar = _a.sideCar, rest = __rest(_a, ["sideCar"]);
  if (!sideCar) {
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  }
  var Target = sideCar.read();
  if (!Target) {
    throw new Error("Sidecar medium not found");
  }
  return React66.createElement(Target, __assign({}, rest));
};
SideCar.isSideCarExport = true;
function exportSidecar(medium, exported) {
  medium.useMedium(exported);
  return SideCar;
}

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/medium.js
var effectCar = createSidecarMedium();

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/UI.js
var nothing = function() {
  return;
};
var RemoveScroll = React67.forwardRef(function(props, parentRef) {
  var ref = React67.useRef(null);
  var _a = React67.useState({
    onScrollCapture: nothing,
    onWheelCapture: nothing,
    onTouchMoveCapture: nothing
  }), callbacks = _a[0], setCallbacks = _a[1];
  var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, gapMode = props.gapMode, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]);
  var SideCar2 = sideCar;
  var containerRef = useMergeRefs([ref, parentRef]);
  var containerProps = __assign(__assign({}, rest), callbacks);
  return React67.createElement(
    React67.Fragment,
    null,
    enabled && React67.createElement(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref, gapMode }),
    forwardProps ? React67.cloneElement(React67.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : React67.createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
  );
});
RemoveScroll.defaultProps = {
  enabled: true,
  removeScrollBar: true,
  inert: false
};
RemoveScroll.classNames = {
  fullWidth: fullWidthClassName,
  zeroRight: zeroRightClassName
};

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/SideEffect.js
import * as React70 from "react";

// ../../node_modules/.pnpm/react-remove-scroll-bar@2.3.8_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll-bar/dist/es2015/component.js
import * as React69 from "react";

// ../../node_modules/.pnpm/react-style-singleton@2.2.3_@types+react@18.3.12_react@18.3.1/node_modules/react-style-singleton/dist/es2015/hook.js
import * as React68 from "react";

// ../../node_modules/.pnpm/get-nonce@1.0.1/node_modules/get-nonce/dist/es2015/index.js
var currentNonce;
var getNonce = function() {
  if (currentNonce) {
    return currentNonce;
  }
  if (typeof __webpack_nonce__ !== "undefined") {
    return __webpack_nonce__;
  }
  return void 0;
};

// ../../node_modules/.pnpm/react-style-singleton@2.2.3_@types+react@18.3.12_react@18.3.1/node_modules/react-style-singleton/dist/es2015/singleton.js
function makeStyleTag() {
  if (!document)
    return null;
  var tag = document.createElement("style");
  tag.type = "text/css";
  var nonce = getNonce();
  if (nonce) {
    tag.setAttribute("nonce", nonce);
  }
  return tag;
}
function injectStyles(tag, css) {
  if (tag.styleSheet) {
    tag.styleSheet.cssText = css;
  } else {
    tag.appendChild(document.createTextNode(css));
  }
}
function insertStyleTag(tag) {
  var head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(tag);
}
var stylesheetSingleton = function() {
  var counter = 0;
  var stylesheet = null;
  return {
    add: function(style) {
      if (counter == 0) {
        if (stylesheet = makeStyleTag()) {
          injectStyles(stylesheet, style);
          insertStyleTag(stylesheet);
        }
      }
      counter++;
    },
    remove: function() {
      counter--;
      if (!counter && stylesheet) {
        stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);
        stylesheet = null;
      }
    }
  };
};

// ../../node_modules/.pnpm/react-style-singleton@2.2.3_@types+react@18.3.12_react@18.3.1/node_modules/react-style-singleton/dist/es2015/hook.js
var styleHookSingleton = function() {
  var sheet = stylesheetSingleton();
  return function(styles2, isDynamic) {
    React68.useEffect(function() {
      sheet.add(styles2);
      return function() {
        sheet.remove();
      };
    }, [styles2 && isDynamic]);
  };
};

// ../../node_modules/.pnpm/react-style-singleton@2.2.3_@types+react@18.3.12_react@18.3.1/node_modules/react-style-singleton/dist/es2015/component.js
var styleSingleton = function() {
  var useStyle = styleHookSingleton();
  var Sheet2 = function(_a) {
    var styles2 = _a.styles, dynamic = _a.dynamic;
    useStyle(styles2, dynamic);
    return null;
  };
  return Sheet2;
};

// ../../node_modules/.pnpm/react-remove-scroll-bar@2.3.8_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll-bar/dist/es2015/utils.js
var zeroGap = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
};
var parse = function(x) {
  return parseInt(x || "", 10) || 0;
};
var getOffset = function(gapMode) {
  var cs = window.getComputedStyle(document.body);
  var left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
  var top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
  var right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
  return [parse(left), parse(top), parse(right)];
};
var getGapWidth = function(gapMode) {
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  if (typeof window === "undefined") {
    return zeroGap;
  }
  var offsets = getOffset(gapMode);
  var documentWidth = document.documentElement.clientWidth;
  var windowWidth = window.innerWidth;
  return {
    left: offsets[0],
    top: offsets[1],
    right: offsets[2],
    gap: Math.max(0, windowWidth - documentWidth + offsets[2] - offsets[0])
  };
};

// ../../node_modules/.pnpm/react-remove-scroll-bar@2.3.8_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll-bar/dist/es2015/component.js
var Style = styleSingleton();
var lockAttribute = "data-scroll-locked";
var getStyles = function(_a, allowRelative, gapMode, important) {
  var left = _a.left, top = _a.top, right = _a.right, gap = _a.gap;
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  return "\n  .".concat(noScrollbarsClassName, " {\n   overflow: hidden ").concat(important, ";\n   padding-right: ").concat(gap, "px ").concat(important, ";\n  }\n  body[").concat(lockAttribute, "] {\n    overflow: hidden ").concat(important, ";\n    overscroll-behavior: contain;\n    ").concat([
    allowRelative && "position: relative ".concat(important, ";"),
    gapMode === "margin" && "\n    padding-left: ".concat(left, "px;\n    padding-top: ").concat(top, "px;\n    padding-right: ").concat(right, "px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(gap, "px ").concat(important, ";\n    "),
    gapMode === "padding" && "padding-right: ".concat(gap, "px ").concat(important, ";")
  ].filter(Boolean).join(""), "\n  }\n  \n  .").concat(zeroRightClassName, " {\n    right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " {\n    margin-right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(zeroRightClassName, " .").concat(zeroRightClassName, " {\n    right: 0 ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " .").concat(fullWidthClassName, " {\n    margin-right: 0 ").concat(important, ";\n  }\n  \n  body[").concat(lockAttribute, "] {\n    ").concat(removedBarSizeVariable, ": ").concat(gap, "px;\n  }\n");
};
var getCurrentUseCounter = function() {
  var counter = parseInt(document.body.getAttribute(lockAttribute) || "0", 10);
  return isFinite(counter) ? counter : 0;
};
var useLockAttribute = function() {
  React69.useEffect(function() {
    document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString());
    return function() {
      var newCounter = getCurrentUseCounter() - 1;
      if (newCounter <= 0) {
        document.body.removeAttribute(lockAttribute);
      } else {
        document.body.setAttribute(lockAttribute, newCounter.toString());
      }
    };
  }, []);
};
var RemoveScrollBar = function(_a) {
  var noRelative = _a.noRelative, noImportant = _a.noImportant, _b = _a.gapMode, gapMode = _b === void 0 ? "margin" : _b;
  useLockAttribute();
  var gap = React69.useMemo(function() {
    return getGapWidth(gapMode);
  }, [gapMode]);
  return React69.createElement(Style, { styles: getStyles(gap, !noRelative, gapMode, !noImportant ? "!important" : "") });
};

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/aggresiveCapture.js
var passiveSupported = false;
if (typeof window !== "undefined") {
  try {
    options = Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported = true;
        return true;
      }
    });
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (err) {
    passiveSupported = false;
  }
}
var options;
var nonPassive = passiveSupported ? { passive: false } : false;

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/handleScroll.js
var alwaysContainsScroll = function(node) {
  return node.tagName === "TEXTAREA";
};
var elementCanBeScrolled = function(node, overflow) {
  if (!(node instanceof Element)) {
    return false;
  }
  var styles2 = window.getComputedStyle(node);
  return (
    // not-not-scrollable
    styles2[overflow] !== "hidden" && // contains scroll inside self
    !(styles2.overflowY === styles2.overflowX && !alwaysContainsScroll(node) && styles2[overflow] === "visible")
  );
};
var elementCouldBeVScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowY");
};
var elementCouldBeHScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowX");
};
var locationCouldBeScrolled = function(axis, node) {
  var ownerDocument = node.ownerDocument;
  var current = node;
  do {
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host;
    }
    var isScrollable = elementCouldBeScrolled(axis, current);
    if (isScrollable) {
      var _a = getScrollVariables(axis, current), scrollHeight = _a[1], clientHeight = _a[2];
      if (scrollHeight > clientHeight) {
        return true;
      }
    }
    current = current.parentNode;
  } while (current && current !== ownerDocument.body);
  return false;
};
var getVScrollVariables = function(_a) {
  var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
  return [
    scrollTop,
    scrollHeight,
    clientHeight
  ];
};
var getHScrollVariables = function(_a) {
  var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
  return [
    scrollLeft,
    scrollWidth,
    clientWidth
  ];
};
var elementCouldBeScrolled = function(axis, node) {
  return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
};
var getScrollVariables = function(axis, node) {
  return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
};
var getDirectionFactor = function(axis, direction) {
  return axis === "h" && direction === "rtl" ? -1 : 1;
};
var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
  var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
  var delta = directionFactor * sourceDelta;
  var target = event.target;
  var targetInLock = endTarget.contains(target);
  var shouldCancelScroll = false;
  var isDeltaPositive = delta > 0;
  var availableScroll = 0;
  var availableScrollTop = 0;
  do {
    var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
    var elementScroll = scroll_1 - capacity - directionFactor * position;
    if (position || elementScroll) {
      if (elementCouldBeScrolled(axis, target)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }
    if (target instanceof ShadowRoot) {
      target = target.host;
    } else {
      target = target.parentNode;
    }
  } while (
    // portaled content
    !targetInLock && target !== document.body || // self content
    targetInLock && (endTarget.contains(target) || endTarget === target)
  );
  if (isDeltaPositive && (noOverscroll && Math.abs(availableScroll) < 1 || !noOverscroll && delta > availableScroll)) {
    shouldCancelScroll = true;
  } else if (!isDeltaPositive && (noOverscroll && Math.abs(availableScrollTop) < 1 || !noOverscroll && -delta > availableScrollTop)) {
    shouldCancelScroll = true;
  }
  return shouldCancelScroll;
};

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/SideEffect.js
var getTouchXY = function(event) {
  return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
};
var getDeltaXY = function(event) {
  return [event.deltaX, event.deltaY];
};
var extractRef = function(ref) {
  return ref && "current" in ref ? ref.current : ref;
};
var deltaCompare = function(x, y) {
  return x[0] === y[0] && x[1] === y[1];
};
var generateStyle = function(id) {
  return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
};
var idCounter = 0;
var lockStack = [];
function RemoveScrollSideCar(props) {
  var shouldPreventQueue = React70.useRef([]);
  var touchStartRef = React70.useRef([0, 0]);
  var activeAxis = React70.useRef();
  var id = React70.useState(idCounter++)[0];
  var Style2 = React70.useState(styleSingleton)[0];
  var lastProps = React70.useRef(props);
  React70.useEffect(function() {
    lastProps.current = props;
  }, [props]);
  React70.useEffect(function() {
    if (props.inert) {
      document.body.classList.add("block-interactivity-".concat(id));
      var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
      allow_1.forEach(function(el) {
        return el.classList.add("allow-interactivity-".concat(id));
      });
      return function() {
        document.body.classList.remove("block-interactivity-".concat(id));
        allow_1.forEach(function(el) {
          return el.classList.remove("allow-interactivity-".concat(id));
        });
      };
    }
    return;
  }, [props.inert, props.lockRef.current, props.shards]);
  var shouldCancelEvent = React70.useCallback(function(event, parent) {
    if ("touches" in event && event.touches.length === 2 || event.type === "wheel" && event.ctrlKey) {
      return !lastProps.current.allowPinchZoom;
    }
    var touch = getTouchXY(event);
    var touchStart = touchStartRef.current;
    var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
    var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
    var currentAxis;
    var target = event.target;
    var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    if ("touches" in event && moveDirection === "h" && target.type === "range") {
      return false;
    }
    var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    if (!canBeScrolledInMainDirection) {
      return true;
    }
    if (canBeScrolledInMainDirection) {
      currentAxis = moveDirection;
    } else {
      currentAxis = moveDirection === "v" ? "h" : "v";
      canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    }
    if (!canBeScrolledInMainDirection) {
      return false;
    }
    if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
      activeAxis.current = currentAxis;
    }
    if (!currentAxis) {
      return true;
    }
    var cancelingAxis = activeAxis.current || currentAxis;
    return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
  }, []);
  var shouldPrevent = React70.useCallback(function(_event) {
    var event = _event;
    if (!lockStack.length || lockStack[lockStack.length - 1] !== Style2) {
      return;
    }
    var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
    var sourceEvent = shouldPreventQueue.current.filter(function(e) {
      return e.name === event.type && (e.target === event.target || event.target === e.shadowParent) && deltaCompare(e.delta, delta);
    })[0];
    if (sourceEvent && sourceEvent.should) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    if (!sourceEvent) {
      var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
        return node.contains(event.target);
      });
      var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
      if (shouldStop) {
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    }
  }, []);
  var shouldCancel = React70.useCallback(function(name, delta, target, should) {
    var event = { name, delta, target, should, shadowParent: getOutermostShadowParent(target) };
    shouldPreventQueue.current.push(event);
    setTimeout(function() {
      shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e) {
        return e !== event;
      });
    }, 1);
  }, []);
  var scrollTouchStart = React70.useCallback(function(event) {
    touchStartRef.current = getTouchXY(event);
    activeAxis.current = void 0;
  }, []);
  var scrollWheel = React70.useCallback(function(event) {
    shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  var scrollTouchMove = React70.useCallback(function(event) {
    shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  React70.useEffect(function() {
    lockStack.push(Style2);
    props.setCallbacks({
      onScrollCapture: scrollWheel,
      onWheelCapture: scrollWheel,
      onTouchMoveCapture: scrollTouchMove
    });
    document.addEventListener("wheel", shouldPrevent, nonPassive);
    document.addEventListener("touchmove", shouldPrevent, nonPassive);
    document.addEventListener("touchstart", scrollTouchStart, nonPassive);
    return function() {
      lockStack = lockStack.filter(function(inst) {
        return inst !== Style2;
      });
      document.removeEventListener("wheel", shouldPrevent, nonPassive);
      document.removeEventListener("touchmove", shouldPrevent, nonPassive);
      document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
    };
  }, []);
  var removeScrollBar = props.removeScrollBar, inert = props.inert;
  return React70.createElement(
    React70.Fragment,
    null,
    inert ? React70.createElement(Style2, { styles: generateStyle(id) }) : null,
    removeScrollBar ? React70.createElement(RemoveScrollBar, { gapMode: props.gapMode }) : null
  );
}
function getOutermostShadowParent(node) {
  var shadowParent = null;
  while (node !== null) {
    if (node instanceof ShadowRoot) {
      shadowParent = node.host;
      node = node.host;
    }
    node = node.parentNode;
  }
  return shadowParent;
}

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/sidecar.js
var sidecar_default = exportSidecar(effectCar, RemoveScrollSideCar);

// ../../node_modules/.pnpm/react-remove-scroll@2.6.3_@types+react@18.3.12_react@18.3.1/node_modules/react-remove-scroll/dist/es2015/Combination.js
var ReactRemoveScroll = React71.forwardRef(function(props, ref) {
  return React71.createElement(RemoveScroll, __assign({}, props, { ref, sideCar: sidecar_default }));
});
ReactRemoveScroll.classNames = RemoveScroll.classNames;
var Combination_default = ReactRemoveScroll;

// ../../node_modules/.pnpm/aria-hidden@1.2.4/node_modules/aria-hidden/dist/es2015/index.js
var getDefaultParent = function(originalTarget) {
  if (typeof document === "undefined") {
    return null;
  }
  var sampleTarget = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
  return sampleTarget.ownerDocument.body;
};
var counterMap = /* @__PURE__ */ new WeakMap();
var uncontrolledNodes = /* @__PURE__ */ new WeakMap();
var markerMap = {};
var lockCount = 0;
var unwrapHost = function(node) {
  return node && (node.host || unwrapHost(node.parentNode));
};
var correctTargets = function(parent, targets) {
  return targets.map(function(target) {
    if (parent.contains(target)) {
      return target;
    }
    var correctedTarget = unwrapHost(target);
    if (correctedTarget && parent.contains(correctedTarget)) {
      return correctedTarget;
    }
    console.error("aria-hidden", target, "in not contained inside", parent, ". Doing nothing");
    return null;
  }).filter(function(x) {
    return Boolean(x);
  });
};
var applyAttributeToOthers = function(originalTarget, parentNode, markerName, controlAttribute) {
  var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  if (!markerMap[markerName]) {
    markerMap[markerName] = /* @__PURE__ */ new WeakMap();
  }
  var markerCounter = markerMap[markerName];
  var hiddenNodes = [];
  var elementsToKeep = /* @__PURE__ */ new Set();
  var elementsToStop = new Set(targets);
  var keep = function(el) {
    if (!el || elementsToKeep.has(el)) {
      return;
    }
    elementsToKeep.add(el);
    keep(el.parentNode);
  };
  targets.forEach(keep);
  var deep = function(parent) {
    if (!parent || elementsToStop.has(parent)) {
      return;
    }
    Array.prototype.forEach.call(parent.children, function(node) {
      if (elementsToKeep.has(node)) {
        deep(node);
      } else {
        try {
          var attr = node.getAttribute(controlAttribute);
          var alreadyHidden = attr !== null && attr !== "false";
          var counterValue = (counterMap.get(node) || 0) + 1;
          var markerValue = (markerCounter.get(node) || 0) + 1;
          counterMap.set(node, counterValue);
          markerCounter.set(node, markerValue);
          hiddenNodes.push(node);
          if (counterValue === 1 && alreadyHidden) {
            uncontrolledNodes.set(node, true);
          }
          if (markerValue === 1) {
            node.setAttribute(markerName, "true");
          }
          if (!alreadyHidden) {
            node.setAttribute(controlAttribute, "true");
          }
        } catch (e) {
          console.error("aria-hidden: cannot operate on ", node, e);
        }
      }
    });
  };
  deep(parentNode);
  elementsToKeep.clear();
  lockCount++;
  return function() {
    hiddenNodes.forEach(function(node) {
      var counterValue = counterMap.get(node) - 1;
      var markerValue = markerCounter.get(node) - 1;
      counterMap.set(node, counterValue);
      markerCounter.set(node, markerValue);
      if (!counterValue) {
        if (!uncontrolledNodes.has(node)) {
          node.removeAttribute(controlAttribute);
        }
        uncontrolledNodes.delete(node);
      }
      if (!markerValue) {
        node.removeAttribute(markerName);
      }
    });
    lockCount--;
    if (!lockCount) {
      counterMap = /* @__PURE__ */ new WeakMap();
      counterMap = /* @__PURE__ */ new WeakMap();
      uncontrolledNodes = /* @__PURE__ */ new WeakMap();
      markerMap = {};
    }
  };
};
var hideOthers = function(originalTarget, parentNode, markerName) {
  if (markerName === void 0) {
    markerName = "data-aria-hidden";
  }
  var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  var activeParentNode = parentNode || getDefaultParent(originalTarget);
  if (!activeParentNode) {
    return function() {
      return null;
    };
  }
  targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll("[aria-live]")));
  return applyAttributeToOthers(targets, activeParentNode, markerName, "aria-hidden");
};

// ../../node_modules/.pnpm/@radix-ui+react-dialog@1.1.7_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-dialog/dist/index.mjs
import { createSlot as createSlot2 } from "@radix-ui/react-slot";
import { Fragment as Fragment11, jsx as jsx61, jsxs as jsxs37 } from "react/jsx-runtime";
var DIALOG_NAME = "Dialog";
var [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME);
var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
var Dialog = (props) => {
  const {
    __scopeDialog,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const triggerRef = React72.useRef(null);
  const contentRef = React72.useRef(null);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ jsx61(
    DialogProvider,
    {
      scope: __scopeDialog,
      triggerRef,
      contentRef,
      contentId: useId3(),
      titleId: useId3(),
      descriptionId: useId3(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: React72.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children
    }
  );
};
Dialog.displayName = DIALOG_NAME;
var TRIGGER_NAME = "DialogTrigger";
var DialogTrigger = React72.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...triggerProps } = props;
    const context = useDialogContext(TRIGGER_NAME, __scopeDialog);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    return /* @__PURE__ */ jsx61(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.contentId,
        "data-state": getState(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
DialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME2 = "DialogPortal";
var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME2, {
  forceMount: void 0
});
var DialogPortal = (props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME2, __scopeDialog);
  return /* @__PURE__ */ jsx61(PortalProvider, { scope: __scopeDialog, forceMount, children: React72.Children.map(children, (child) => /* @__PURE__ */ jsx61(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx61(Portal3, { asChild: true, container, children: child }) })) });
};
DialogPortal.displayName = PORTAL_NAME2;
var OVERLAY_NAME = "DialogOverlay";
var DialogOverlay = React72.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsx61(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx61(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }
);
DialogOverlay.displayName = OVERLAY_NAME;
var Slot2 = createSlot2("DialogOverlay.RemoveScroll");
var DialogOverlayImpl = React72.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ jsx61(Combination_default, { as: Slot2, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ jsx61(
        Primitive.div,
        {
          "data-state": getState(context.open),
          ...overlayProps,
          ref: forwardedRef,
          style: { pointerEvents: "auto", ...overlayProps.style }
        }
      ) })
    );
  }
);
var CONTENT_NAME = "DialogContent";
var DialogContent = React72.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    return /* @__PURE__ */ jsx61(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsx61(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsx61(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
DialogContent.displayName = CONTENT_NAME;
var DialogContentModal = React72.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const contentRef = React72.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
    React72.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsx61(
      DialogContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          event.preventDefault();
          context.triggerRef.current?.focus();
        }),
        onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (isRightClick) event.preventDefault();
        }),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault()
        )
      }
    );
  }
);
var DialogContentNonModal = React72.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const hasInteractedOutsideRef = React72.useRef(false);
    const hasPointerDownOutsideRef = React72.useRef(false);
    return /* @__PURE__ */ jsx61(
      DialogContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          props.onCloseAutoFocus?.(event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          props.onInteractOutside?.(event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = context.triggerRef.current?.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }
);
var DialogContentImpl = React72.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, __scopeDialog);
    const contentRef = React72.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    useFocusGuards();
    return /* @__PURE__ */ jsxs37(Fragment11, { children: [
      /* @__PURE__ */ jsx61(
        FocusScope,
        {
          asChild: true,
          loop: true,
          trapped: trapFocus,
          onMountAutoFocus: onOpenAutoFocus,
          onUnmountAutoFocus: onCloseAutoFocus,
          children: /* @__PURE__ */ jsx61(
            DismissableLayer,
            {
              role: "dialog",
              id: context.contentId,
              "aria-describedby": context.descriptionId,
              "aria-labelledby": context.titleId,
              "data-state": getState(context.open),
              ...contentProps,
              ref: composedRefs,
              onDismiss: () => context.onOpenChange(false)
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs37(Fragment11, { children: [
        /* @__PURE__ */ jsx61(TitleWarning, { titleId: context.titleId }),
        /* @__PURE__ */ jsx61(DescriptionWarning, { contentRef, descriptionId: context.descriptionId })
      ] })
    ] });
  }
);
var TITLE_NAME = "DialogTitle";
var DialogTitle = React72.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext(TITLE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsx61(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }
);
DialogTitle.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "DialogDescription";
var DialogDescription = React72.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
    return /* @__PURE__ */ jsx61(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }
);
DialogDescription.displayName = DESCRIPTION_NAME;
var CLOSE_NAME = "DialogClose";
var DialogClose = React72.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...closeProps } = props;
    const context = useDialogContext(CLOSE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsx61(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }
);
DialogClose.displayName = CLOSE_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var TITLE_WARNING_NAME = "DialogTitleWarning";
var [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
  contentName: CONTENT_NAME,
  titleName: TITLE_NAME,
  docsSlug: "dialog"
});
var TitleWarning = ({ titleId }) => {
  const titleWarningContext = useWarningContext(TITLE_WARNING_NAME);
  const MESSAGE = `\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;
  React72.useEffect(() => {
    if (titleId) {
      const hasTitle = document.getElementById(titleId);
      if (!hasTitle) console.error(MESSAGE);
    }
  }, [MESSAGE, titleId]);
  return null;
};
var DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning";
var DescriptionWarning = ({ contentRef, descriptionId }) => {
  const descriptionWarningContext = useWarningContext(DESCRIPTION_WARNING_NAME);
  const MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${descriptionWarningContext.contentName}}.`;
  React72.useEffect(() => {
    const describedById = contentRef.current?.getAttribute("aria-describedby");
    if (descriptionId && describedById) {
      const hasDescription = document.getElementById(descriptionId);
      if (!hasDescription) console.warn(MESSAGE);
    }
  }, [MESSAGE, contentRef, descriptionId]);
  return null;
};
var Root7 = Dialog;
var Trigger4 = DialogTrigger;
var Portal4 = DialogPortal;
var Overlay = DialogOverlay;
var Content4 = DialogContent;
var Title = DialogTitle;
var Description = DialogDescription;
var Close = DialogClose;

// ../../node_modules/.pnpm/@radix-ui+react-alert-dialog@1.1.7_@types+react-dom@18.3.1_@types+react@18.3.12_react-d_49b8c261ee123356a60b785fcb91dab5/node_modules/@radix-ui/react-alert-dialog/dist/index.mjs
import { createSlottable } from "@radix-ui/react-slot";
import { jsx as jsx62, jsxs as jsxs38 } from "react/jsx-runtime";
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext, createAlertDialogScope] = createContextScope(ROOT_NAME, [
  createDialogScope
]);
var useDialogScope = createDialogScope();
var AlertDialog = (props) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsx62(Root7, { ...dialogScope, ...alertDialogProps, modal: true });
};
AlertDialog.displayName = ROOT_NAME;
var TRIGGER_NAME2 = "AlertDialogTrigger";
var AlertDialogTrigger = React73.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsx62(Trigger4, { ...dialogScope, ...triggerProps, ref: forwardedRef });
  }
);
AlertDialogTrigger.displayName = TRIGGER_NAME2;
var PORTAL_NAME3 = "AlertDialogPortal";
var AlertDialogPortal = (props) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsx62(Portal4, { ...dialogScope, ...portalProps });
};
AlertDialogPortal.displayName = PORTAL_NAME3;
var OVERLAY_NAME2 = "AlertDialogOverlay";
var AlertDialogOverlay = React73.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsx62(Overlay, { ...dialogScope, ...overlayProps, ref: forwardedRef });
  }
);
AlertDialogOverlay.displayName = OVERLAY_NAME2;
var CONTENT_NAME2 = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME2);
var Slottable = createSlottable("AlertDialogContent");
var AlertDialogContent = React73.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = React73.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = React73.useRef(null);
    return /* @__PURE__ */ jsx62(
      WarningProvider,
      {
        contentName: CONTENT_NAME2,
        titleName: TITLE_NAME2,
        docsSlug: "alert-dialog",
        children: /* @__PURE__ */ jsx62(AlertDialogContentProvider, { scope: __scopeAlertDialog, cancelRef, children: /* @__PURE__ */ jsxs38(
          Content4,
          {
            role: "alertdialog",
            ...dialogScope,
            ...contentProps,
            ref: composedRefs,
            onOpenAutoFocus: composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
              event.preventDefault();
              cancelRef.current?.focus({ preventScroll: true });
            }),
            onPointerDownOutside: (event) => event.preventDefault(),
            onInteractOutside: (event) => event.preventDefault(),
            children: [
              /* @__PURE__ */ jsx62(Slottable, { children }),
              /* @__PURE__ */ jsx62(DescriptionWarning2, { contentRef })
            ]
          }
        ) })
      }
    );
  }
);
AlertDialogContent.displayName = CONTENT_NAME2;
var TITLE_NAME2 = "AlertDialogTitle";
var AlertDialogTitle = React73.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsx62(Title, { ...dialogScope, ...titleProps, ref: forwardedRef });
  }
);
AlertDialogTitle.displayName = TITLE_NAME2;
var DESCRIPTION_NAME2 = "AlertDialogDescription";
var AlertDialogDescription = React73.forwardRef((props, forwardedRef) => {
  const { __scopeAlertDialog, ...descriptionProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsx62(Description, { ...dialogScope, ...descriptionProps, ref: forwardedRef });
});
AlertDialogDescription.displayName = DESCRIPTION_NAME2;
var ACTION_NAME = "AlertDialogAction";
var AlertDialogAction = React73.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsx62(Close, { ...dialogScope, ...actionProps, ref: forwardedRef });
  }
);
AlertDialogAction.displayName = ACTION_NAME;
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel = React73.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return /* @__PURE__ */ jsx62(Close, { ...dialogScope, ...cancelProps, ref });
  }
);
AlertDialogCancel.displayName = CANCEL_NAME;
var DescriptionWarning2 = ({ contentRef }) => {
  const MESSAGE = `\`${CONTENT_NAME2}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME2}\` by passing a \`${DESCRIPTION_NAME2}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME2}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
  React73.useEffect(() => {
    const hasDescription = document.getElementById(
      contentRef.current?.getAttribute("aria-describedby")
    );
    if (!hasDescription) console.warn(MESSAGE);
  }, [MESSAGE, contentRef]);
  return null;
};
var Root22 = AlertDialog;
var Trigger22 = AlertDialogTrigger;
var Portal22 = AlertDialogPortal;
var Overlay2 = AlertDialogOverlay;
var Content22 = AlertDialogContent;
var Action = AlertDialogAction;
var Cancel = AlertDialogCancel;
var Title2 = AlertDialogTitle;
var Description2 = AlertDialogDescription;

// src/components/AlertDialog.tsx
import { jsx as jsx63, jsxs as jsxs39 } from "react/jsx-runtime";
var AlertDialog2 = Root22;
var AlertDialogTrigger2 = Trigger22;
var AlertDialogPortal2 = Portal22;
var AlertDialogOverlay2 = React74.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx63(
  Overlay2,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay2.displayName = Overlay2.displayName;
var AlertDialogContent2 = React74.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs39(AlertDialogPortal2, { children: [
  /* @__PURE__ */ jsx63(AlertDialogOverlay2, {}),
  /* @__PURE__ */ jsx63(
    Content22,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent2.displayName = Content22.displayName;
var AlertDialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx63(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx63(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle2 = React74.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx63(
  Title2,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle2.displayName = Title2.displayName;
var AlertDialogDescription2 = React74.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx63(
  Description2,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription2.displayName = Description2.displayName;
var AlertDialogAction2 = React74.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx63(
  Action,
  {
    ref,
    className: cn(buttonVariants(), className),
    ...props
  }
));
AlertDialogAction2.displayName = Action.displayName;
var AlertDialogCancel2 = React74.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx63(
  Cancel,
  {
    ref,
    className: cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    ),
    ...props
  }
));
AlertDialogCancel2.displayName = Cancel.displayName;

// src/components/Dialog.tsx
import * as React75 from "react";
import { X as X5 } from "lucide-react";
import { jsx as jsx64, jsxs as jsxs40 } from "react/jsx-runtime";
var Dialog2 = Root7;
var DialogTrigger2 = Trigger4;
var DialogPortal2 = Portal4;
var DialogClose2 = Close;
var DialogOverlay2 = React75.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx64(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay2.displayName = Overlay.displayName;
var DialogContent2 = React75.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs40(DialogPortal2, { children: [
  /* @__PURE__ */ jsx64(DialogOverlay2, {}),
  /* @__PURE__ */ jsxs40(
    Content4,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/70 bg-popover p-6 text-popover-foreground shadow-2xl ring-1 ring-primary/10 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs40(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx64(X5, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx64("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent2.displayName = Content4.displayName;
var DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx64(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx64(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
var DialogTitle2 = React75.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx64(
  Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle2.displayName = Title.displayName;
var DialogDescription2 = React75.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx64(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription2.displayName = Description.displayName;

// src/components/DropdownMenu.tsx
import * as React84 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-dropdown-menu@2.1.7_@types+react-dom@18.3.1_@types+react@18.3.12_react-_197858f047cbeb258d357a3c3d672e7c/node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs
import * as React83 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-menu@2.1.7_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-menu/dist/index.mjs
import * as React82 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-collection@1.1.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom_fe3708d4a54692975723ed79502eb025/node_modules/@radix-ui/react-collection/dist/index.mjs
import React76 from "react";
import { createSlot as createSlot3 } from "@radix-ui/react-slot";
import { jsx as jsx65 } from "react/jsx-runtime";
function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope3] = createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = React76.useRef(null);
    const itemMap = React76.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ jsx65(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  };
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = createSlot3(COLLECTION_SLOT_NAME);
  const CollectionSlot = React76.forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsx65(CollectionSlotImpl, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = createSlot3(ITEM_SLOT_NAME);
  const CollectionItemSlot = React76.forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = React76.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      React76.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ jsx65(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection3(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = React76.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection3,
    createCollectionScope3
  ];
}

// ../../node_modules/.pnpm/@radix-ui+react-popper@1.2.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-popper/dist/index.mjs
import * as React80 from "react";

// ../../node_modules/.pnpm/@floating-ui+utils@0.2.9/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var sides = ["top", "right", "bottom", "left"];
var min = Math.min;
var max = Math.max;
var round = Math.round;
var floor = Math.floor;
var createCoords = (v) => ({
  x: v,
  y: v
});
var oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
var oppositeAlignmentMap = {
  start: "end",
  end: "start"
};
function clamp2(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr = ["left", "right"];
  const rl = ["right", "left"];
  const tb = ["top", "bottom"];
  const bt = ["bottom", "top"];
  switch (side) {
    case "top":
    case "bottom":
      if (rtl) return isStart ? rl : lr;
      return isStart ? lr : rl;
    case "left":
    case "right":
      return isStart ? tb : bt;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}

// ../../node_modules/.pnpm/@floating-ui+core@1.6.9/node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
var computePosition = async (reference, floating, config) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platform2,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
var arrow = (options) => ({
  name: "arrow",
  options,
  async fn(state) {
    const {
      x,
      y,
      placement,
      rects,
      platform: platform2,
      elements,
      middlewareData
    } = state;
    const {
      element,
      padding = 0
    } = evaluate(options, state) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = getPaddingObject(padding);
    const coords = {
      x,
      y
    };
    const axis = getAlignmentAxis(placement);
    const length = getAxisLength(axis);
    const arrowDimensions = await platform2.getDimensions(element);
    const isYAxis = axis === "y";
    const minProp = isYAxis ? "top" : "left";
    const maxProp = isYAxis ? "bottom" : "right";
    const clientProp = isYAxis ? "clientHeight" : "clientWidth";
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
    if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
      clientSize = elements.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = min(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
    const min$1 = minPadding;
    const max2 = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset4 = clamp2(min$1, center, max2);
    const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset4 && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max2 : 0;
    return {
      [axis]: coords[axis] + alignmentOffset,
      data: {
        [axis]: offset4,
        centerOffset: center - offset4 - alignmentOffset,
        ...shouldAddOffset && {
          alignmentOffset
        }
      },
      reset: shouldAddOffset
    };
  }
});
var flip = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform: platform2,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = "bestFit",
        fallbackAxisSideDirection = "none",
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements2 = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides2 = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];
      if (!overflows.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements2[nextIndex];
        if (nextPlacement) {
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$filter2;
              const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                if (hasFallbackAxisSideDirection) {
                  const currentSideAxis = getSideAxis(d.placement);
                  return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  currentSideAxis === "y";
                }
                return true;
              }).map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
function getSideOffsets(overflow, rect) {
  return {
    top: overflow.top - rect.height,
    right: overflow.right - rect.width,
    bottom: overflow.bottom - rect.height,
    left: overflow.left - rect.width
  };
}
function isAnySideFullyClipped(overflow) {
  return sides.some((side) => overflow[side] >= 0);
}
var hide = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "hide",
    options,
    async fn(state) {
      const {
        rects
      } = state;
      const {
        strategy = "referenceHidden",
        ...detectOverflowOptions
      } = evaluate(options, state);
      switch (strategy) {
        case "referenceHidden": {
          const overflow = await detectOverflow(state, {
            ...detectOverflowOptions,
            elementContext: "reference"
          });
          const offsets = getSideOffsets(overflow, rects.reference);
          return {
            data: {
              referenceHiddenOffsets: offsets,
              referenceHidden: isAnySideFullyClipped(offsets)
            }
          };
        }
        case "escaped": {
          const overflow = await detectOverflow(state, {
            ...detectOverflowOptions,
            altBoundary: true
          });
          const offsets = getSideOffsets(overflow, rects.floating);
          return {
            data: {
              escapedOffsets: offsets,
              escaped: isAnySideFullyClipped(offsets)
            }
          };
        }
        default: {
          return {};
        }
      }
    }
  };
};
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform: platform2,
    elements
  } = state;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
var offset = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x,
        y,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};
var shift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "shift",
    options,
    async fn(state) {
      const {
        x,
        y,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: (_ref) => {
            let {
              x: x2,
              y: y2
            } = _ref;
            return {
              x: x2,
              y: y2
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === "y" ? "top" : "left";
        const maxSide = mainAxis === "y" ? "bottom" : "right";
        const min2 = mainAxisCoord + overflow[minSide];
        const max2 = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp2(min2, mainAxisCoord, max2);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === "y" ? "top" : "left";
        const maxSide = crossAxis === "y" ? "bottom" : "right";
        const min2 = crossAxisCoord + overflow[minSide];
        const max2 = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp2(min2, crossAxisCoord, max2);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};
var limitShift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    options,
    fn(state) {
      const {
        x,
        y,
        placement,
        rects,
        middlewareData
      } = state;
      const {
        offset: offset4 = 0,
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const crossAxis = getSideAxis(placement);
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      const rawOffset = evaluate(offset4, state);
      const computedOffset = typeof rawOffset === "number" ? {
        mainAxis: rawOffset,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...rawOffset
      };
      if (checkMainAxis) {
        const len = mainAxis === "y" ? "height" : "width";
        const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
        const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
        if (mainAxisCoord < limitMin) {
          mainAxisCoord = limitMin;
        } else if (mainAxisCoord > limitMax) {
          mainAxisCoord = limitMax;
        }
      }
      if (checkCrossAxis) {
        var _middlewareData$offse, _middlewareData$offse2;
        const len = mainAxis === "y" ? "width" : "height";
        const isOriginSide = ["top", "left"].includes(getSide(placement));
        const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
        const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
        if (crossAxisCoord < limitMin) {
          crossAxisCoord = limitMin;
        } else if (crossAxisCoord > limitMax) {
          crossAxisCoord = limitMax;
        }
      }
      return {
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      };
    }
  };
};
var size = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "size",
    options,
    async fn(state) {
      var _state$middlewareData, _state$middlewareData2;
      const {
        placement,
        rects,
        platform: platform2,
        elements
      } = state;
      const {
        apply = () => {
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const side = getSide(placement);
      const alignment = getAlignment(placement);
      const isYAxis = getSideAxis(placement) === "y";
      const {
        width,
        height
      } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === "top" || side === "bottom") {
        heightSide = side;
        widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
      } else {
        widthSide = side;
        heightSide = alignment === "end" ? "top" : "bottom";
      }
      const maximumClippingHeight = height - overflow.top - overflow.bottom;
      const maximumClippingWidth = width - overflow.left - overflow.right;
      const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
      const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
      const noShift = !state.middlewareData.shift;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if ((_state$middlewareData = state.middlewareData.shift) != null && _state$middlewareData.enabled.x) {
        availableWidth = maximumClippingWidth;
      }
      if ((_state$middlewareData2 = state.middlewareData.shift) != null && _state$middlewareData2.enabled.y) {
        availableHeight = maximumClippingHeight;
      }
      if (noShift && !alignment) {
        const xMin = max(overflow.left, 0);
        const xMax = max(overflow.right, 0);
        const yMin = max(overflow.top, 0);
        const yMax = max(overflow.bottom, 0);
        if (isYAxis) {
          availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
        } else {
          availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
        }
      }
      await apply({
        ...state,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform2.getDimensions(elements.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};

// ../../node_modules/.pnpm/@floating-ui+utils@0.2.9/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle2(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
}
function isTableElement(element) {
  return ["table", "td", "th"].includes(getNodeName(element));
}
function isTopLayer(element) {
  return [":popover-open", ":modal"].some((selector) => {
    try {
      return element.matches(selector);
    } catch (e) {
      return false;
    }
  });
}
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle2(elementOrCss) : elementOrCss;
  return ["transform", "translate", "scale", "rotate", "perspective"].some((value) => css[value] ? css[value] !== "none" : false) || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || ["transform", "translate", "scale", "rotate", "perspective", "filter"].some((value) => (css.willChange || "").includes(value)) || ["paint", "layout", "strict", "content"].some((value) => (css.contain || "").includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
function isLastTraversableNode(node) {
  return ["html", "body", "#document"].includes(getNodeName(node));
}
function getComputedStyle2(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

// ../../node_modules/.pnpm/@floating-ui+dom@1.6.13/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
  const css = getComputedStyle2(element);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;
  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle2(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
  if (ignoreScrollbarX === void 0) {
    ignoreScrollbarX = false;
  }
  const htmlRect = documentElement.getBoundingClientRect();
  const x = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 : (
    // RTL <body> scrollbar.
    getWindowScrollBarX(documentElement, htmlRect)
  ));
  const y = htmlRect.top + scroll.scrollTop;
  return {
    x,
    y
  };
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll, true) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}
function getClientRects(element) {
  return Array.from(element.getClientRects());
}
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle2(body).direction === "rtl") {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle2(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle2(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle2(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}
function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element) {
  return getComputedStyle2(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}
var getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element) {
  return getComputedStyle2(element).direction === "rtl";
}
var platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
function rectsAreEqual(a, b) {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const elementRectForRootMargin = element.getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = elementRectForRootMargin;
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1e3);
        } else {
          refresh(false, ratio);
        }
      }
      if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
        refresh();
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener("resize", update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update);
      ancestorResize && ancestor.removeEventListener("resize", update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
var offset2 = offset;
var shift2 = shift;
var flip2 = flip;
var size2 = size;
var hide2 = hide;
var arrow2 = arrow;
var limitShift2 = limitShift;
var computePosition2 = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

// ../../node_modules/.pnpm/@floating-ui+react-dom@2.1.2_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@floating-ui/react-dom/dist/floating-ui.react-dom.mjs
import * as React77 from "react";
import { useLayoutEffect as useLayoutEffect4, useEffect as useEffect24 } from "react";
import * as ReactDOM3 from "react-dom";
var index = typeof document !== "undefined" ? useLayoutEffect4 : useEffect24;
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a === "function" && a.toString() === b.toString()) {
    return true;
  }
  let length;
  let i;
  let keys;
  if (a && b && typeof a === "object") {
    if (Array.isArray(a)) {
      length = a.length;
      if (length !== b.length) return false;
      for (i = length; i-- !== 0; ) {
        if (!deepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) {
      return false;
    }
    for (i = length; i-- !== 0; ) {
      if (!{}.hasOwnProperty.call(b, keys[i])) {
        return false;
      }
    }
    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (key === "_owner" && a.$$typeof) {
        continue;
      }
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return a !== a && b !== b;
}
function getDPR(element) {
  if (typeof window === "undefined") {
    return 1;
  }
  const win = element.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}
function roundByDPR(element, value) {
  const dpr = getDPR(element);
  return Math.round(value * dpr) / dpr;
}
function useLatestRef(value) {
  const ref = React77.useRef(value);
  index(() => {
    ref.current = value;
  });
  return ref;
}
function useFloating(options) {
  if (options === void 0) {
    options = {};
  }
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2,
    elements: {
      reference: externalReference,
      floating: externalFloating
    } = {},
    transform = true,
    whileElementsMounted,
    open
  } = options;
  const [data, setData] = React77.useState({
    x: 0,
    y: 0,
    strategy,
    placement,
    middlewareData: {},
    isPositioned: false
  });
  const [latestMiddleware, setLatestMiddleware] = React77.useState(middleware);
  if (!deepEqual(latestMiddleware, middleware)) {
    setLatestMiddleware(middleware);
  }
  const [_reference, _setReference] = React77.useState(null);
  const [_floating, _setFloating] = React77.useState(null);
  const setReference = React77.useCallback((node) => {
    if (node !== referenceRef.current) {
      referenceRef.current = node;
      _setReference(node);
    }
  }, []);
  const setFloating = React77.useCallback((node) => {
    if (node !== floatingRef.current) {
      floatingRef.current = node;
      _setFloating(node);
    }
  }, []);
  const referenceEl = externalReference || _reference;
  const floatingEl = externalFloating || _floating;
  const referenceRef = React77.useRef(null);
  const floatingRef = React77.useRef(null);
  const dataRef = React77.useRef(data);
  const hasWhileElementsMounted = whileElementsMounted != null;
  const whileElementsMountedRef = useLatestRef(whileElementsMounted);
  const platformRef = useLatestRef(platform2);
  const openRef = useLatestRef(open);
  const update = React77.useCallback(() => {
    if (!referenceRef.current || !floatingRef.current) {
      return;
    }
    const config = {
      placement,
      strategy,
      middleware: latestMiddleware
    };
    if (platformRef.current) {
      config.platform = platformRef.current;
    }
    computePosition2(referenceRef.current, floatingRef.current, config).then((data2) => {
      const fullData = {
        ...data2,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: openRef.current !== false
      };
      if (isMountedRef.current && !deepEqual(dataRef.current, fullData)) {
        dataRef.current = fullData;
        ReactDOM3.flushSync(() => {
          setData(fullData);
        });
      }
    });
  }, [latestMiddleware, placement, strategy, platformRef, openRef]);
  index(() => {
    if (open === false && dataRef.current.isPositioned) {
      dataRef.current.isPositioned = false;
      setData((data2) => ({
        ...data2,
        isPositioned: false
      }));
    }
  }, [open]);
  const isMountedRef = React77.useRef(false);
  index(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  index(() => {
    if (referenceEl) referenceRef.current = referenceEl;
    if (floatingEl) floatingRef.current = floatingEl;
    if (referenceEl && floatingEl) {
      if (whileElementsMountedRef.current) {
        return whileElementsMountedRef.current(referenceEl, floatingEl, update);
      }
      update();
    }
  }, [referenceEl, floatingEl, update, whileElementsMountedRef, hasWhileElementsMounted]);
  const refs = React77.useMemo(() => ({
    reference: referenceRef,
    floating: floatingRef,
    setReference,
    setFloating
  }), [setReference, setFloating]);
  const elements = React77.useMemo(() => ({
    reference: referenceEl,
    floating: floatingEl
  }), [referenceEl, floatingEl]);
  const floatingStyles = React77.useMemo(() => {
    const initialStyles = {
      position: strategy,
      left: 0,
      top: 0
    };
    if (!elements.floating) {
      return initialStyles;
    }
    const x = roundByDPR(elements.floating, data.x);
    const y = roundByDPR(elements.floating, data.y);
    if (transform) {
      return {
        ...initialStyles,
        transform: "translate(" + x + "px, " + y + "px)",
        ...getDPR(elements.floating) >= 1.5 && {
          willChange: "transform"
        }
      };
    }
    return {
      position: strategy,
      left: x,
      top: y
    };
  }, [strategy, transform, elements.floating, data.x, data.y]);
  return React77.useMemo(() => ({
    ...data,
    update,
    refs,
    elements,
    floatingStyles
  }), [data, update, refs, elements, floatingStyles]);
}
var arrow$1 = (options) => {
  function isRef(value) {
    return {}.hasOwnProperty.call(value, "current");
  }
  return {
    name: "arrow",
    options,
    fn(state) {
      const {
        element,
        padding
      } = typeof options === "function" ? options(state) : options;
      if (element && isRef(element)) {
        if (element.current != null) {
          return arrow2({
            element: element.current,
            padding
          }).fn(state);
        }
        return {};
      }
      if (element) {
        return arrow2({
          element,
          padding
        }).fn(state);
      }
      return {};
    }
  };
};
var offset3 = (options, deps) => ({
  ...offset2(options),
  options: [options, deps]
});
var shift3 = (options, deps) => ({
  ...shift2(options),
  options: [options, deps]
});
var limitShift3 = (options, deps) => ({
  ...limitShift2(options),
  options: [options, deps]
});
var flip3 = (options, deps) => ({
  ...flip2(options),
  options: [options, deps]
});
var size3 = (options, deps) => ({
  ...size2(options),
  options: [options, deps]
});
var hide3 = (options, deps) => ({
  ...hide2(options),
  options: [options, deps]
});
var arrow3 = (options, deps) => ({
  ...arrow$1(options),
  options: [options, deps]
});

// ../../node_modules/.pnpm/@radix-ui+react-arrow@1.1.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-arrow/dist/index.mjs
import * as React78 from "react";
import { jsx as jsx66 } from "react/jsx-runtime";
var NAME = "Arrow";
var Arrow = React78.forwardRef((props, forwardedRef) => {
  const { children, width = 10, height = 5, ...arrowProps } = props;
  return /* @__PURE__ */ jsx66(
    Primitive.svg,
    {
      ...arrowProps,
      ref: forwardedRef,
      width,
      height,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: props.asChild ? children : /* @__PURE__ */ jsx66("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
Arrow.displayName = NAME;
var Root8 = Arrow;

// ../../node_modules/.pnpm/@radix-ui+react-use-size@1.1.1_@types+react@18.3.12_react@18.3.1/node_modules/@radix-ui/react-use-size/dist/index.mjs
import * as React79 from "react";
function useSize(element) {
  const [size4, setSize] = React79.useState(void 0);
  useLayoutEffect2(() => {
    if (element) {
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) {
          return;
        }
        if (!entries.length) {
          return;
        }
        const entry = entries[0];
        let width;
        let height;
        if ("borderBoxSize" in entry) {
          const borderSizeEntry = entry["borderBoxSize"];
          const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
          width = borderSize["inlineSize"];
          height = borderSize["blockSize"];
        } else {
          width = element.offsetWidth;
          height = element.offsetHeight;
        }
        setSize({ width, height });
      });
      resizeObserver.observe(element, { box: "border-box" });
      return () => resizeObserver.unobserve(element);
    } else {
      setSize(void 0);
    }
  }, [element]);
  return size4;
}

// ../../node_modules/.pnpm/@radix-ui+react-popper@1.2.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-popper/dist/index.mjs
import { jsx as jsx67 } from "react/jsx-runtime";
var POPPER_NAME = "Popper";
var [createPopperContext, createPopperScope] = createContextScope(POPPER_NAME);
var [PopperProvider, usePopperContext] = createPopperContext(POPPER_NAME);
var Popper = (props) => {
  const { __scopePopper, children } = props;
  const [anchor, setAnchor] = React80.useState(null);
  return /* @__PURE__ */ jsx67(PopperProvider, { scope: __scopePopper, anchor, onAnchorChange: setAnchor, children });
};
Popper.displayName = POPPER_NAME;
var ANCHOR_NAME = "PopperAnchor";
var PopperAnchor = React80.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopper, virtualRef, ...anchorProps } = props;
    const context = usePopperContext(ANCHOR_NAME, __scopePopper);
    const ref = React80.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    React80.useEffect(() => {
      context.onAnchorChange(virtualRef?.current || ref.current);
    });
    return virtualRef ? null : /* @__PURE__ */ jsx67(Primitive.div, { ...anchorProps, ref: composedRefs });
  }
);
PopperAnchor.displayName = ANCHOR_NAME;
var CONTENT_NAME3 = "PopperContent";
var [PopperContentProvider, useContentContext] = createPopperContext(CONTENT_NAME3);
var PopperContent = React80.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopePopper,
      side = "bottom",
      sideOffset = 0,
      align = "center",
      alignOffset = 0,
      arrowPadding = 0,
      avoidCollisions = true,
      collisionBoundary = [],
      collisionPadding: collisionPaddingProp = 0,
      sticky = "partial",
      hideWhenDetached = false,
      updatePositionStrategy = "optimized",
      onPlaced,
      ...contentProps
    } = props;
    const context = usePopperContext(CONTENT_NAME3, __scopePopper);
    const [content, setContent] = React80.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setContent(node));
    const [arrow4, setArrow] = React80.useState(null);
    const arrowSize = useSize(arrow4);
    const arrowWidth = arrowSize?.width ?? 0;
    const arrowHeight = arrowSize?.height ?? 0;
    const desiredPlacement = side + (align !== "center" ? "-" + align : "");
    const collisionPadding = typeof collisionPaddingProp === "number" ? collisionPaddingProp : { top: 0, right: 0, bottom: 0, left: 0, ...collisionPaddingProp };
    const boundary = Array.isArray(collisionBoundary) ? collisionBoundary : [collisionBoundary];
    const hasExplicitBoundaries = boundary.length > 0;
    const detectOverflowOptions = {
      padding: collisionPadding,
      boundary: boundary.filter(isNotNull),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: hasExplicitBoundaries
    };
    const { refs, floatingStyles, placement, isPositioned, middlewareData } = useFloating({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: desiredPlacement,
      whileElementsMounted: (...args) => {
        const cleanup = autoUpdate(...args, {
          animationFrame: updatePositionStrategy === "always"
        });
        return cleanup;
      },
      elements: {
        reference: context.anchor
      },
      middleware: [
        offset3({ mainAxis: sideOffset + arrowHeight, alignmentAxis: alignOffset }),
        avoidCollisions && shift3({
          mainAxis: true,
          crossAxis: false,
          limiter: sticky === "partial" ? limitShift3() : void 0,
          ...detectOverflowOptions
        }),
        avoidCollisions && flip3({ ...detectOverflowOptions }),
        size3({
          ...detectOverflowOptions,
          apply: ({ elements, rects, availableWidth, availableHeight }) => {
            const { width: anchorWidth, height: anchorHeight } = rects.reference;
            const contentStyle = elements.floating.style;
            contentStyle.setProperty("--radix-popper-available-width", `${availableWidth}px`);
            contentStyle.setProperty("--radix-popper-available-height", `${availableHeight}px`);
            contentStyle.setProperty("--radix-popper-anchor-width", `${anchorWidth}px`);
            contentStyle.setProperty("--radix-popper-anchor-height", `${anchorHeight}px`);
          }
        }),
        arrow4 && arrow3({ element: arrow4, padding: arrowPadding }),
        transformOrigin({ arrowWidth, arrowHeight }),
        hideWhenDetached && hide3({ strategy: "referenceHidden", ...detectOverflowOptions })
      ]
    });
    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
    const handlePlaced = useCallbackRef(onPlaced);
    useLayoutEffect2(() => {
      if (isPositioned) {
        handlePlaced?.();
      }
    }, [isPositioned, handlePlaced]);
    const arrowX = middlewareData.arrow?.x;
    const arrowY = middlewareData.arrow?.y;
    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
    const [contentZIndex, setContentZIndex] = React80.useState();
    useLayoutEffect2(() => {
      if (content) setContentZIndex(window.getComputedStyle(content).zIndex);
    }, [content]);
    return /* @__PURE__ */ jsx67(
      "div",
      {
        ref: refs.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...floatingStyles,
          transform: isPositioned ? floatingStyles.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: contentZIndex,
          ["--radix-popper-transform-origin"]: [
            middlewareData.transformOrigin?.x,
            middlewareData.transformOrigin?.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...middlewareData.hide?.referenceHidden && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: props.dir,
        children: /* @__PURE__ */ jsx67(
          PopperContentProvider,
          {
            scope: __scopePopper,
            placedSide,
            onArrowChange: setArrow,
            arrowX,
            arrowY,
            shouldHideArrow: cannotCenterArrow,
            children: /* @__PURE__ */ jsx67(
              Primitive.div,
              {
                "data-side": placedSide,
                "data-align": placedAlign,
                ...contentProps,
                ref: composedRefs,
                style: {
                  ...contentProps.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: !isPositioned ? "none" : void 0
                }
              }
            )
          }
        )
      }
    );
  }
);
PopperContent.displayName = CONTENT_NAME3;
var ARROW_NAME = "PopperArrow";
var OPPOSITE_SIDE = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};
var PopperArrow = React80.forwardRef(function PopperArrow2(props, forwardedRef) {
  const { __scopePopper, ...arrowProps } = props;
  const contentContext = useContentContext(ARROW_NAME, __scopePopper);
  const baseSide = OPPOSITE_SIDE[contentContext.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ jsx67(
      "span",
      {
        ref: contentContext.onArrowChange,
        style: {
          position: "absolute",
          left: contentContext.arrowX,
          top: contentContext.arrowY,
          [baseSide]: 0,
          transformOrigin: {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0"
          }[contentContext.placedSide],
          transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: `rotate(180deg)`,
            left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[contentContext.placedSide],
          visibility: contentContext.shouldHideArrow ? "hidden" : void 0
        },
        children: /* @__PURE__ */ jsx67(
          Root8,
          {
            ...arrowProps,
            ref: forwardedRef,
            style: {
              ...arrowProps.style,
              // ensures the element can be measured correctly (mostly for if SVG)
              display: "block"
            }
          }
        )
      }
    )
  );
});
PopperArrow.displayName = ARROW_NAME;
function isNotNull(value) {
  return value !== null;
}
var transformOrigin = (options) => ({
  name: "transformOrigin",
  options,
  fn(data) {
    const { placement, rects, middlewareData } = data;
    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
    const isArrowHidden = cannotCenterArrow;
    const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
    const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
    const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
    const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
    const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
    let x = "";
    let y = "";
    if (placedSide === "bottom") {
      x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
      y = `${-arrowHeight}px`;
    } else if (placedSide === "top") {
      x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
      y = `${rects.floating.height + arrowHeight}px`;
    } else if (placedSide === "right") {
      x = `${-arrowHeight}px`;
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
    } else if (placedSide === "left") {
      x = `${rects.floating.width + arrowHeight}px`;
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
    }
    return { data: { x, y } };
  }
});
function getSideAndAlignFromPlacement(placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align];
}
var Root23 = Popper;
var Anchor2 = PopperAnchor;
var Content5 = PopperContent;
var Arrow2 = PopperArrow;

// ../../node_modules/.pnpm/@radix-ui+react-roving-focus@1.1.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-d_f143ac136461ddcbe5db1828944c4c4d/node_modules/@radix-ui/react-roving-focus/dist/index.mjs
import * as React81 from "react";
import { jsx as jsx68 } from "react/jsx-runtime";
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS2 = { bubbles: false, cancelable: true };
var GROUP_NAME = "RovingFocusGroup";
var [Collection, useCollection, createCollectionScope] = createCollection(GROUP_NAME);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME,
  [createCollectionScope]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
var RovingFocusGroup = React81.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsx68(Collection.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx68(Collection.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx68(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME;
var RovingFocusGroupImpl = React81.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = React81.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId = null, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId,
    onChange: onCurrentTabStopIdChange
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = React81.useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection(__scopeRovingFocusGroup);
  const isClickFocusRef = React81.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = React81.useState(0);
  React81.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsx68(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: React81.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: React81.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: React81.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: React81.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsx68(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS2);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst2(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME = "RovingFocusGroupItem";
var RovingFocusGroupItem = React81.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      ...itemProps
    } = props;
    const autoId = useId3();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove } = context;
    React81.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsx68(
      Collection.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsx68(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst2(candidateNodes));
              }
            })
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst2(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_, index2) => array[(startIndex + index2) % array.length]);
}
var Root9 = RovingFocusGroup;
var Item2 = RovingFocusGroupItem;

// ../../node_modules/.pnpm/@radix-ui+react-menu@2.1.7_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-menu/dist/index.mjs
import { createSlot as createSlot4 } from "@radix-ui/react-slot";
import { jsx as jsx69 } from "react/jsx-runtime";
var SELECTION_KEYS = ["Enter", " "];
var FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
var LAST_KEYS = ["ArrowUp", "PageDown", "End"];
var FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
var SUB_OPEN_KEYS = {
  ltr: [...SELECTION_KEYS, "ArrowRight"],
  rtl: [...SELECTION_KEYS, "ArrowLeft"]
};
var SUB_CLOSE_KEYS = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"]
};
var MENU_NAME = "Menu";
var [Collection2, useCollection2, createCollectionScope2] = createCollection(MENU_NAME);
var [createMenuContext, createMenuScope] = createContextScope(MENU_NAME, [
  createCollectionScope2,
  createPopperScope,
  createRovingFocusGroupScope
]);
var usePopperScope = createPopperScope();
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [MenuProvider, useMenuContext] = createMenuContext(MENU_NAME);
var [MenuRootProvider, useMenuRootContext] = createMenuContext(MENU_NAME);
var Menu = (props) => {
  const { __scopeMenu, open = false, children, dir, onOpenChange, modal = true } = props;
  const popperScope = usePopperScope(__scopeMenu);
  const [content, setContent] = React82.useState(null);
  const isUsingKeyboardRef = React82.useRef(false);
  const handleOpenChange = useCallbackRef(onOpenChange);
  const direction = useDirection(dir);
  React82.useEffect(() => {
    const handleKeyDown = () => {
      isUsingKeyboardRef.current = true;
      document.addEventListener("pointerdown", handlePointer, { capture: true, once: true });
      document.addEventListener("pointermove", handlePointer, { capture: true, once: true });
    };
    const handlePointer = () => isUsingKeyboardRef.current = false;
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("pointerdown", handlePointer, { capture: true });
      document.removeEventListener("pointermove", handlePointer, { capture: true });
    };
  }, []);
  return /* @__PURE__ */ jsx69(Root23, { ...popperScope, children: /* @__PURE__ */ jsx69(
    MenuProvider,
    {
      scope: __scopeMenu,
      open,
      onOpenChange: handleOpenChange,
      content,
      onContentChange: setContent,
      children: /* @__PURE__ */ jsx69(
        MenuRootProvider,
        {
          scope: __scopeMenu,
          onClose: React82.useCallback(() => handleOpenChange(false), [handleOpenChange]),
          isUsingKeyboardRef,
          dir: direction,
          modal,
          children
        }
      )
    }
  ) });
};
Menu.displayName = MENU_NAME;
var ANCHOR_NAME2 = "MenuAnchor";
var MenuAnchor = React82.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...anchorProps } = props;
    const popperScope = usePopperScope(__scopeMenu);
    return /* @__PURE__ */ jsx69(Anchor2, { ...popperScope, ...anchorProps, ref: forwardedRef });
  }
);
MenuAnchor.displayName = ANCHOR_NAME2;
var PORTAL_NAME4 = "MenuPortal";
var [PortalProvider2, usePortalContext2] = createMenuContext(PORTAL_NAME4, {
  forceMount: void 0
});
var MenuPortal = (props) => {
  const { __scopeMenu, forceMount, children, container } = props;
  const context = useMenuContext(PORTAL_NAME4, __scopeMenu);
  return /* @__PURE__ */ jsx69(PortalProvider2, { scope: __scopeMenu, forceMount, children: /* @__PURE__ */ jsx69(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx69(Portal3, { asChild: true, container, children }) }) });
};
MenuPortal.displayName = PORTAL_NAME4;
var CONTENT_NAME4 = "MenuContent";
var [MenuContentProvider, useMenuContentContext] = createMenuContext(CONTENT_NAME4);
var MenuContent = React82.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext2(CONTENT_NAME4, props.__scopeMenu);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useMenuContext(CONTENT_NAME4, props.__scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME4, props.__scopeMenu);
    return /* @__PURE__ */ jsx69(Collection2.Provider, { scope: props.__scopeMenu, children: /* @__PURE__ */ jsx69(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx69(Collection2.Slot, { scope: props.__scopeMenu, children: rootContext.modal ? /* @__PURE__ */ jsx69(MenuRootContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsx69(MenuRootContentNonModal, { ...contentProps, ref: forwardedRef }) }) }) });
  }
);
var MenuRootContentModal = React82.forwardRef(
  (props, forwardedRef) => {
    const context = useMenuContext(CONTENT_NAME4, props.__scopeMenu);
    const ref = React82.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    React82.useEffect(() => {
      const content = ref.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsx69(
      MenuContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: context.open,
        disableOutsideScroll: true,
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault(),
          { checkForDefaultPrevented: false }
        ),
        onDismiss: () => context.onOpenChange(false)
      }
    );
  }
);
var MenuRootContentNonModal = React82.forwardRef((props, forwardedRef) => {
  const context = useMenuContext(CONTENT_NAME4, props.__scopeMenu);
  return /* @__PURE__ */ jsx69(
    MenuContentImpl,
    {
      ...props,
      ref: forwardedRef,
      trapFocus: false,
      disableOutsidePointerEvents: false,
      disableOutsideScroll: false,
      onDismiss: () => context.onOpenChange(false)
    }
  );
});
var Slot3 = createSlot4("MenuContent.ScrollLock");
var MenuContentImpl = React82.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeMenu,
      loop = false,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEntryFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      disableOutsideScroll,
      ...contentProps
    } = props;
    const context = useMenuContext(CONTENT_NAME4, __scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME4, __scopeMenu);
    const popperScope = usePopperScope(__scopeMenu);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu);
    const getItems = useCollection2(__scopeMenu);
    const [currentItemId, setCurrentItemId] = React82.useState(null);
    const contentRef = React82.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef, context.onContentChange);
    const timerRef = React82.useRef(0);
    const searchRef = React82.useRef("");
    const pointerGraceTimerRef = React82.useRef(0);
    const pointerGraceIntentRef = React82.useRef(null);
    const pointerDirRef = React82.useRef("right");
    const lastPointerXRef = React82.useRef(0);
    const ScrollLockWrapper = disableOutsideScroll ? Combination_default : React82.Fragment;
    const scrollLockWrapperProps = disableOutsideScroll ? { as: Slot3, allowPinchZoom: true } : void 0;
    const handleTypeaheadSearch = (key) => {
      const search = searchRef.current + key;
      const items = getItems().filter((item) => !item.disabled);
      const currentItem = document.activeElement;
      const currentMatch = items.find((item) => item.ref.current === currentItem)?.textValue;
      const values = items.map((item) => item.textValue);
      const nextMatch = getNextMatch(values, search, currentMatch);
      const newItem = items.find((item) => item.textValue === nextMatch)?.ref.current;
      (function updateSearch(value) {
        searchRef.current = value;
        window.clearTimeout(timerRef.current);
        if (value !== "") timerRef.current = window.setTimeout(() => updateSearch(""), 1e3);
      })(search);
      if (newItem) {
        setTimeout(() => newItem.focus());
      }
    };
    React82.useEffect(() => {
      return () => window.clearTimeout(timerRef.current);
    }, []);
    useFocusGuards();
    const isPointerMovingToSubmenu = React82.useCallback((event) => {
      const isMovingTowards = pointerDirRef.current === pointerGraceIntentRef.current?.side;
      return isMovingTowards && isPointerInGraceArea(event, pointerGraceIntentRef.current?.area);
    }, []);
    return /* @__PURE__ */ jsx69(
      MenuContentProvider,
      {
        scope: __scopeMenu,
        searchRef,
        onItemEnter: React82.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault();
          },
          [isPointerMovingToSubmenu]
        ),
        onItemLeave: React82.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) return;
            contentRef.current?.focus();
            setCurrentItemId(null);
          },
          [isPointerMovingToSubmenu]
        ),
        onTriggerLeave: React82.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault();
          },
          [isPointerMovingToSubmenu]
        ),
        pointerGraceTimerRef,
        onPointerGraceIntentChange: React82.useCallback((intent) => {
          pointerGraceIntentRef.current = intent;
        }, []),
        children: /* @__PURE__ */ jsx69(ScrollLockWrapper, { ...scrollLockWrapperProps, children: /* @__PURE__ */ jsx69(
          FocusScope,
          {
            asChild: true,
            trapped: trapFocus,
            onMountAutoFocus: composeEventHandlers(onOpenAutoFocus, (event) => {
              event.preventDefault();
              contentRef.current?.focus({ preventScroll: true });
            }),
            onUnmountAutoFocus: onCloseAutoFocus,
            children: /* @__PURE__ */ jsx69(
              DismissableLayer,
              {
                asChild: true,
                disableOutsidePointerEvents,
                onEscapeKeyDown,
                onPointerDownOutside,
                onFocusOutside,
                onInteractOutside,
                onDismiss,
                children: /* @__PURE__ */ jsx69(
                  Root9,
                  {
                    asChild: true,
                    ...rovingFocusGroupScope,
                    dir: rootContext.dir,
                    orientation: "vertical",
                    loop,
                    currentTabStopId: currentItemId,
                    onCurrentTabStopIdChange: setCurrentItemId,
                    onEntryFocus: composeEventHandlers(onEntryFocus, (event) => {
                      if (!rootContext.isUsingKeyboardRef.current) event.preventDefault();
                    }),
                    preventScrollOnEntryFocus: true,
                    children: /* @__PURE__ */ jsx69(
                      Content5,
                      {
                        role: "menu",
                        "aria-orientation": "vertical",
                        "data-state": getOpenState(context.open),
                        "data-radix-menu-content": "",
                        dir: rootContext.dir,
                        ...popperScope,
                        ...contentProps,
                        ref: composedRefs,
                        style: { outline: "none", ...contentProps.style },
                        onKeyDown: composeEventHandlers(contentProps.onKeyDown, (event) => {
                          const target = event.target;
                          const isKeyDownInside = target.closest("[data-radix-menu-content]") === event.currentTarget;
                          const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
                          const isCharacterKey = event.key.length === 1;
                          if (isKeyDownInside) {
                            if (event.key === "Tab") event.preventDefault();
                            if (!isModifierKey && isCharacterKey) handleTypeaheadSearch(event.key);
                          }
                          const content = contentRef.current;
                          if (event.target !== content) return;
                          if (!FIRST_LAST_KEYS.includes(event.key)) return;
                          event.preventDefault();
                          const items = getItems().filter((item) => !item.disabled);
                          const candidateNodes = items.map((item) => item.ref.current);
                          if (LAST_KEYS.includes(event.key)) candidateNodes.reverse();
                          focusFirst3(candidateNodes);
                        }),
                        onBlur: composeEventHandlers(props.onBlur, (event) => {
                          if (!event.currentTarget.contains(event.target)) {
                            window.clearTimeout(timerRef.current);
                            searchRef.current = "";
                          }
                        }),
                        onPointerMove: composeEventHandlers(
                          props.onPointerMove,
                          whenMouse((event) => {
                            const target = event.target;
                            const pointerXHasChanged = lastPointerXRef.current !== event.clientX;
                            if (event.currentTarget.contains(target) && pointerXHasChanged) {
                              const newDir = event.clientX > lastPointerXRef.current ? "right" : "left";
                              pointerDirRef.current = newDir;
                              lastPointerXRef.current = event.clientX;
                            }
                          })
                        )
                      }
                    )
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
MenuContent.displayName = CONTENT_NAME4;
var GROUP_NAME2 = "MenuGroup";
var MenuGroup = React82.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...groupProps } = props;
    return /* @__PURE__ */ jsx69(Primitive.div, { role: "group", ...groupProps, ref: forwardedRef });
  }
);
MenuGroup.displayName = GROUP_NAME2;
var LABEL_NAME = "MenuLabel";
var MenuLabel = React82.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...labelProps } = props;
    return /* @__PURE__ */ jsx69(Primitive.div, { ...labelProps, ref: forwardedRef });
  }
);
MenuLabel.displayName = LABEL_NAME;
var ITEM_NAME2 = "MenuItem";
var ITEM_SELECT = "menu.itemSelect";
var MenuItem = React82.forwardRef(
  (props, forwardedRef) => {
    const { disabled = false, onSelect, ...itemProps } = props;
    const ref = React82.useRef(null);
    const rootContext = useMenuRootContext(ITEM_NAME2, props.__scopeMenu);
    const contentContext = useMenuContentContext(ITEM_NAME2, props.__scopeMenu);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const isPointerDownRef = React82.useRef(false);
    const handleSelect = () => {
      const menuItem = ref.current;
      if (!disabled && menuItem) {
        const itemSelectEvent = new CustomEvent(ITEM_SELECT, { bubbles: true, cancelable: true });
        menuItem.addEventListener(ITEM_SELECT, (event) => onSelect?.(event), { once: true });
        dispatchDiscreteCustomEvent(menuItem, itemSelectEvent);
        if (itemSelectEvent.defaultPrevented) {
          isPointerDownRef.current = false;
        } else {
          rootContext.onClose();
        }
      }
    };
    return /* @__PURE__ */ jsx69(
      MenuItemImpl,
      {
        ...itemProps,
        ref: composedRefs,
        disabled,
        onClick: composeEventHandlers(props.onClick, handleSelect),
        onPointerDown: (event) => {
          props.onPointerDown?.(event);
          isPointerDownRef.current = true;
        },
        onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
          if (!isPointerDownRef.current) event.currentTarget?.click();
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isTypingAhead = contentContext.searchRef.current !== "";
          if (disabled || isTypingAhead && event.key === " ") return;
          if (SELECTION_KEYS.includes(event.key)) {
            event.currentTarget.click();
            event.preventDefault();
          }
        })
      }
    );
  }
);
MenuItem.displayName = ITEM_NAME2;
var MenuItemImpl = React82.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, disabled = false, textValue, ...itemProps } = props;
    const contentContext = useMenuContentContext(ITEM_NAME2, __scopeMenu);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu);
    const ref = React82.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const [isFocused, setIsFocused] = React82.useState(false);
    const [textContent, setTextContent] = React82.useState("");
    React82.useEffect(() => {
      const menuItem = ref.current;
      if (menuItem) {
        setTextContent((menuItem.textContent ?? "").trim());
      }
    }, [itemProps.children]);
    return /* @__PURE__ */ jsx69(
      Collection2.ItemSlot,
      {
        scope: __scopeMenu,
        disabled,
        textValue: textValue ?? textContent,
        children: /* @__PURE__ */ jsx69(Item2, { asChild: true, ...rovingFocusGroupScope, focusable: !disabled, children: /* @__PURE__ */ jsx69(
          Primitive.div,
          {
            role: "menuitem",
            "data-highlighted": isFocused ? "" : void 0,
            "aria-disabled": disabled || void 0,
            "data-disabled": disabled ? "" : void 0,
            ...itemProps,
            ref: composedRefs,
            onPointerMove: composeEventHandlers(
              props.onPointerMove,
              whenMouse((event) => {
                if (disabled) {
                  contentContext.onItemLeave(event);
                } else {
                  contentContext.onItemEnter(event);
                  if (!event.defaultPrevented) {
                    const item = event.currentTarget;
                    item.focus({ preventScroll: true });
                  }
                }
              })
            ),
            onPointerLeave: composeEventHandlers(
              props.onPointerLeave,
              whenMouse((event) => contentContext.onItemLeave(event))
            ),
            onFocus: composeEventHandlers(props.onFocus, () => setIsFocused(true)),
            onBlur: composeEventHandlers(props.onBlur, () => setIsFocused(false))
          }
        ) })
      }
    );
  }
);
var CHECKBOX_ITEM_NAME = "MenuCheckboxItem";
var MenuCheckboxItem = React82.forwardRef(
  (props, forwardedRef) => {
    const { checked = false, onCheckedChange, ...checkboxItemProps } = props;
    return /* @__PURE__ */ jsx69(ItemIndicatorProvider, { scope: props.__scopeMenu, checked, children: /* @__PURE__ */ jsx69(
      MenuItem,
      {
        role: "menuitemcheckbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        ...checkboxItemProps,
        ref: forwardedRef,
        "data-state": getCheckedState(checked),
        onSelect: composeEventHandlers(
          checkboxItemProps.onSelect,
          () => onCheckedChange?.(isIndeterminate(checked) ? true : !checked),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
MenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME;
var RADIO_GROUP_NAME = "MenuRadioGroup";
var [RadioGroupProvider, useRadioGroupContext] = createMenuContext(
  RADIO_GROUP_NAME,
  { value: void 0, onValueChange: () => {
  } }
);
var MenuRadioGroup = React82.forwardRef(
  (props, forwardedRef) => {
    const { value, onValueChange, ...groupProps } = props;
    const handleValueChange = useCallbackRef(onValueChange);
    return /* @__PURE__ */ jsx69(RadioGroupProvider, { scope: props.__scopeMenu, value, onValueChange: handleValueChange, children: /* @__PURE__ */ jsx69(MenuGroup, { ...groupProps, ref: forwardedRef }) });
  }
);
MenuRadioGroup.displayName = RADIO_GROUP_NAME;
var RADIO_ITEM_NAME = "MenuRadioItem";
var MenuRadioItem = React82.forwardRef(
  (props, forwardedRef) => {
    const { value, ...radioItemProps } = props;
    const context = useRadioGroupContext(RADIO_ITEM_NAME, props.__scopeMenu);
    const checked = value === context.value;
    return /* @__PURE__ */ jsx69(ItemIndicatorProvider, { scope: props.__scopeMenu, checked, children: /* @__PURE__ */ jsx69(
      MenuItem,
      {
        role: "menuitemradio",
        "aria-checked": checked,
        ...radioItemProps,
        ref: forwardedRef,
        "data-state": getCheckedState(checked),
        onSelect: composeEventHandlers(
          radioItemProps.onSelect,
          () => context.onValueChange?.(value),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
MenuRadioItem.displayName = RADIO_ITEM_NAME;
var ITEM_INDICATOR_NAME = "MenuItemIndicator";
var [ItemIndicatorProvider, useItemIndicatorContext] = createMenuContext(
  ITEM_INDICATOR_NAME,
  { checked: false }
);
var MenuItemIndicator = React82.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, forceMount, ...itemIndicatorProps } = props;
    const indicatorContext = useItemIndicatorContext(ITEM_INDICATOR_NAME, __scopeMenu);
    return /* @__PURE__ */ jsx69(
      Presence,
      {
        present: forceMount || isIndeterminate(indicatorContext.checked) || indicatorContext.checked === true,
        children: /* @__PURE__ */ jsx69(
          Primitive.span,
          {
            ...itemIndicatorProps,
            ref: forwardedRef,
            "data-state": getCheckedState(indicatorContext.checked)
          }
        )
      }
    );
  }
);
MenuItemIndicator.displayName = ITEM_INDICATOR_NAME;
var SEPARATOR_NAME = "MenuSeparator";
var MenuSeparator = React82.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...separatorProps } = props;
    return /* @__PURE__ */ jsx69(
      Primitive.div,
      {
        role: "separator",
        "aria-orientation": "horizontal",
        ...separatorProps,
        ref: forwardedRef
      }
    );
  }
);
MenuSeparator.displayName = SEPARATOR_NAME;
var ARROW_NAME2 = "MenuArrow";
var MenuArrow = React82.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeMenu);
    return /* @__PURE__ */ jsx69(Arrow2, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
MenuArrow.displayName = ARROW_NAME2;
var SUB_NAME = "MenuSub";
var [MenuSubProvider, useMenuSubContext] = createMenuContext(SUB_NAME);
var MenuSub = (props) => {
  const { __scopeMenu, children, open = false, onOpenChange } = props;
  const parentMenuContext = useMenuContext(SUB_NAME, __scopeMenu);
  const popperScope = usePopperScope(__scopeMenu);
  const [trigger, setTrigger] = React82.useState(null);
  const [content, setContent] = React82.useState(null);
  const handleOpenChange = useCallbackRef(onOpenChange);
  React82.useEffect(() => {
    if (parentMenuContext.open === false) handleOpenChange(false);
    return () => handleOpenChange(false);
  }, [parentMenuContext.open, handleOpenChange]);
  return /* @__PURE__ */ jsx69(Root23, { ...popperScope, children: /* @__PURE__ */ jsx69(
    MenuProvider,
    {
      scope: __scopeMenu,
      open,
      onOpenChange: handleOpenChange,
      content,
      onContentChange: setContent,
      children: /* @__PURE__ */ jsx69(
        MenuSubProvider,
        {
          scope: __scopeMenu,
          contentId: useId3(),
          triggerId: useId3(),
          trigger,
          onTriggerChange: setTrigger,
          children
        }
      )
    }
  ) });
};
MenuSub.displayName = SUB_NAME;
var SUB_TRIGGER_NAME = "MenuSubTrigger";
var MenuSubTrigger = React82.forwardRef(
  (props, forwardedRef) => {
    const context = useMenuContext(SUB_TRIGGER_NAME, props.__scopeMenu);
    const rootContext = useMenuRootContext(SUB_TRIGGER_NAME, props.__scopeMenu);
    const subContext = useMenuSubContext(SUB_TRIGGER_NAME, props.__scopeMenu);
    const contentContext = useMenuContentContext(SUB_TRIGGER_NAME, props.__scopeMenu);
    const openTimerRef = React82.useRef(null);
    const { pointerGraceTimerRef, onPointerGraceIntentChange } = contentContext;
    const scope = { __scopeMenu: props.__scopeMenu };
    const clearOpenTimer = React82.useCallback(() => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }, []);
    React82.useEffect(() => clearOpenTimer, [clearOpenTimer]);
    React82.useEffect(() => {
      const pointerGraceTimer = pointerGraceTimerRef.current;
      return () => {
        window.clearTimeout(pointerGraceTimer);
        onPointerGraceIntentChange(null);
      };
    }, [pointerGraceTimerRef, onPointerGraceIntentChange]);
    return /* @__PURE__ */ jsx69(MenuAnchor, { asChild: true, ...scope, children: /* @__PURE__ */ jsx69(
      MenuItemImpl,
      {
        id: subContext.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": context.open,
        "aria-controls": subContext.contentId,
        "data-state": getOpenState(context.open),
        ...props,
        ref: composeRefs(forwardedRef, subContext.onTriggerChange),
        onClick: (event) => {
          props.onClick?.(event);
          if (props.disabled || event.defaultPrevented) return;
          event.currentTarget.focus();
          if (!context.open) context.onOpenChange(true);
        },
        onPointerMove: composeEventHandlers(
          props.onPointerMove,
          whenMouse((event) => {
            contentContext.onItemEnter(event);
            if (event.defaultPrevented) return;
            if (!props.disabled && !context.open && !openTimerRef.current) {
              contentContext.onPointerGraceIntentChange(null);
              openTimerRef.current = window.setTimeout(() => {
                context.onOpenChange(true);
                clearOpenTimer();
              }, 100);
            }
          })
        ),
        onPointerLeave: composeEventHandlers(
          props.onPointerLeave,
          whenMouse((event) => {
            clearOpenTimer();
            const contentRect = context.content?.getBoundingClientRect();
            if (contentRect) {
              const side = context.content?.dataset.side;
              const rightSide = side === "right";
              const bleed = rightSide ? -5 : 5;
              const contentNearEdge = contentRect[rightSide ? "left" : "right"];
              const contentFarEdge = contentRect[rightSide ? "right" : "left"];
              contentContext.onPointerGraceIntentChange({
                area: [
                  // Apply a bleed on clientX to ensure that our exit point is
                  // consistently within polygon bounds
                  { x: event.clientX + bleed, y: event.clientY },
                  { x: contentNearEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.bottom },
                  { x: contentNearEdge, y: contentRect.bottom }
                ],
                side
              });
              window.clearTimeout(pointerGraceTimerRef.current);
              pointerGraceTimerRef.current = window.setTimeout(
                () => contentContext.onPointerGraceIntentChange(null),
                300
              );
            } else {
              contentContext.onTriggerLeave(event);
              if (event.defaultPrevented) return;
              contentContext.onPointerGraceIntentChange(null);
            }
          })
        ),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isTypingAhead = contentContext.searchRef.current !== "";
          if (props.disabled || isTypingAhead && event.key === " ") return;
          if (SUB_OPEN_KEYS[rootContext.dir].includes(event.key)) {
            context.onOpenChange(true);
            context.content?.focus();
            event.preventDefault();
          }
        })
      }
    ) });
  }
);
MenuSubTrigger.displayName = SUB_TRIGGER_NAME;
var SUB_CONTENT_NAME = "MenuSubContent";
var MenuSubContent = React82.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext2(CONTENT_NAME4, props.__scopeMenu);
    const { forceMount = portalContext.forceMount, ...subContentProps } = props;
    const context = useMenuContext(CONTENT_NAME4, props.__scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME4, props.__scopeMenu);
    const subContext = useMenuSubContext(SUB_CONTENT_NAME, props.__scopeMenu);
    const ref = React82.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    return /* @__PURE__ */ jsx69(Collection2.Provider, { scope: props.__scopeMenu, children: /* @__PURE__ */ jsx69(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx69(Collection2.Slot, { scope: props.__scopeMenu, children: /* @__PURE__ */ jsx69(
      MenuContentImpl,
      {
        id: subContext.contentId,
        "aria-labelledby": subContext.triggerId,
        ...subContentProps,
        ref: composedRefs,
        align: "start",
        side: rootContext.dir === "rtl" ? "left" : "right",
        disableOutsidePointerEvents: false,
        disableOutsideScroll: false,
        trapFocus: false,
        onOpenAutoFocus: (event) => {
          if (rootContext.isUsingKeyboardRef.current) ref.current?.focus();
          event.preventDefault();
        },
        onCloseAutoFocus: (event) => event.preventDefault(),
        onFocusOutside: composeEventHandlers(props.onFocusOutside, (event) => {
          if (event.target !== subContext.trigger) context.onOpenChange(false);
        }),
        onEscapeKeyDown: composeEventHandlers(props.onEscapeKeyDown, (event) => {
          rootContext.onClose();
          event.preventDefault();
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isKeyDownInside = event.currentTarget.contains(event.target);
          const isCloseKey = SUB_CLOSE_KEYS[rootContext.dir].includes(event.key);
          if (isKeyDownInside && isCloseKey) {
            context.onOpenChange(false);
            subContext.trigger?.focus();
            event.preventDefault();
          }
        })
      }
    ) }) }) });
  }
);
MenuSubContent.displayName = SUB_CONTENT_NAME;
function getOpenState(open) {
  return open ? "open" : "closed";
}
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getCheckedState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
function focusFirst3(candidates) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus();
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray2(array, startIndex) {
  return array.map((_, index2) => array[(startIndex + index2) % array.length]);
}
function getNextMatch(values, search, currentMatch) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray2(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch) wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find(
    (value) => value.toLowerCase().startsWith(normalizedSearch.toLowerCase())
  );
  return nextMatch !== currentMatch ? nextMatch : void 0;
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function isPointerInGraceArea(event, area) {
  if (!area) return false;
  const cursorPos = { x: event.clientX, y: event.clientY };
  return isPointInPolygon(cursorPos, area);
}
function whenMouse(handler) {
  return (event) => event.pointerType === "mouse" ? handler(event) : void 0;
}
var Root32 = Menu;
var Anchor22 = MenuAnchor;
var Portal5 = MenuPortal;
var Content23 = MenuContent;
var Group2 = MenuGroup;
var Label3 = MenuLabel;
var Item22 = MenuItem;
var CheckboxItem = MenuCheckboxItem;
var RadioGroup2 = MenuRadioGroup;
var RadioItem = MenuRadioItem;
var ItemIndicator2 = MenuItemIndicator;
var Separator3 = MenuSeparator;
var Arrow22 = MenuArrow;
var Sub = MenuSub;
var SubTrigger = MenuSubTrigger;
var SubContent = MenuSubContent;

// ../../node_modules/.pnpm/@radix-ui+react-dropdown-menu@2.1.7_@types+react-dom@18.3.1_@types+react@18.3.12_react-_197858f047cbeb258d357a3c3d672e7c/node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs
import { jsx as jsx70 } from "react/jsx-runtime";
var DROPDOWN_MENU_NAME = "DropdownMenu";
var [createDropdownMenuContext, createDropdownMenuScope] = createContextScope(
  DROPDOWN_MENU_NAME,
  [createMenuScope]
);
var useMenuScope = createMenuScope();
var [DropdownMenuProvider, useDropdownMenuContext] = createDropdownMenuContext(DROPDOWN_MENU_NAME);
var DropdownMenu = (props) => {
  const {
    __scopeDropdownMenu,
    children,
    dir,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  const triggerRef = React83.useRef(null);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ jsx70(
    DropdownMenuProvider,
    {
      scope: __scopeDropdownMenu,
      triggerId: useId3(),
      triggerRef,
      contentId: useId3(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: React83.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children: /* @__PURE__ */ jsx70(Root32, { ...menuScope, open, onOpenChange: setOpen, dir, modal, children })
    }
  );
};
DropdownMenu.displayName = DROPDOWN_MENU_NAME;
var TRIGGER_NAME3 = "DropdownMenuTrigger";
var DropdownMenuTrigger = React83.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, disabled = false, ...triggerProps } = props;
    const context = useDropdownMenuContext(TRIGGER_NAME3, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx70(Anchor22, { asChild: true, ...menuScope, children: /* @__PURE__ */ jsx70(
      Primitive.button,
      {
        type: "button",
        id: context.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": context.open,
        "aria-controls": context.open ? context.contentId : void 0,
        "data-state": context.open ? "open" : "closed",
        "data-disabled": disabled ? "" : void 0,
        disabled,
        ...triggerProps,
        ref: composeRefs(forwardedRef, context.triggerRef),
        onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
          if (!disabled && event.button === 0 && event.ctrlKey === false) {
            context.onOpenToggle();
            if (!context.open) event.preventDefault();
          }
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (disabled) return;
          if (["Enter", " "].includes(event.key)) context.onOpenToggle();
          if (event.key === "ArrowDown") context.onOpenChange(true);
          if (["Enter", " ", "ArrowDown"].includes(event.key)) event.preventDefault();
        })
      }
    ) });
  }
);
DropdownMenuTrigger.displayName = TRIGGER_NAME3;
var PORTAL_NAME5 = "DropdownMenuPortal";
var DropdownMenuPortal = (props) => {
  const { __scopeDropdownMenu, ...portalProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx70(Portal5, { ...menuScope, ...portalProps });
};
DropdownMenuPortal.displayName = PORTAL_NAME5;
var CONTENT_NAME5 = "DropdownMenuContent";
var DropdownMenuContent = React83.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...contentProps } = props;
    const context = useDropdownMenuContext(CONTENT_NAME5, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    const hasInteractedOutsideRef = React83.useRef(false);
    return /* @__PURE__ */ jsx70(
      Content23,
      {
        id: context.contentId,
        "aria-labelledby": context.triggerId,
        ...menuScope,
        ...contentProps,
        ref: forwardedRef,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
          hasInteractedOutsideRef.current = false;
          event.preventDefault();
        }),
        onInteractOutside: composeEventHandlers(props.onInteractOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (!context.modal || isRightClick) hasInteractedOutsideRef.current = true;
        }),
        style: {
          ...props.style,
          // re-namespace exposed content custom properties
          ...{
            "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
            "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
            "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
            "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
            "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
          }
        }
      }
    );
  }
);
DropdownMenuContent.displayName = CONTENT_NAME5;
var GROUP_NAME3 = "DropdownMenuGroup";
var DropdownMenuGroup = React83.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...groupProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx70(Group2, { ...menuScope, ...groupProps, ref: forwardedRef });
  }
);
DropdownMenuGroup.displayName = GROUP_NAME3;
var LABEL_NAME2 = "DropdownMenuLabel";
var DropdownMenuLabel = React83.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...labelProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx70(Label3, { ...menuScope, ...labelProps, ref: forwardedRef });
  }
);
DropdownMenuLabel.displayName = LABEL_NAME2;
var ITEM_NAME3 = "DropdownMenuItem";
var DropdownMenuItem = React83.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...itemProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx70(Item22, { ...menuScope, ...itemProps, ref: forwardedRef });
  }
);
DropdownMenuItem.displayName = ITEM_NAME3;
var CHECKBOX_ITEM_NAME2 = "DropdownMenuCheckboxItem";
var DropdownMenuCheckboxItem = React83.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...checkboxItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx70(CheckboxItem, { ...menuScope, ...checkboxItemProps, ref: forwardedRef });
});
DropdownMenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME2;
var RADIO_GROUP_NAME2 = "DropdownMenuRadioGroup";
var DropdownMenuRadioGroup = React83.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioGroupProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx70(RadioGroup2, { ...menuScope, ...radioGroupProps, ref: forwardedRef });
});
DropdownMenuRadioGroup.displayName = RADIO_GROUP_NAME2;
var RADIO_ITEM_NAME2 = "DropdownMenuRadioItem";
var DropdownMenuRadioItem = React83.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx70(RadioItem, { ...menuScope, ...radioItemProps, ref: forwardedRef });
});
DropdownMenuRadioItem.displayName = RADIO_ITEM_NAME2;
var INDICATOR_NAME = "DropdownMenuItemIndicator";
var DropdownMenuItemIndicator = React83.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...itemIndicatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx70(ItemIndicator2, { ...menuScope, ...itemIndicatorProps, ref: forwardedRef });
});
DropdownMenuItemIndicator.displayName = INDICATOR_NAME;
var SEPARATOR_NAME2 = "DropdownMenuSeparator";
var DropdownMenuSeparator = React83.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...separatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx70(Separator3, { ...menuScope, ...separatorProps, ref: forwardedRef });
});
DropdownMenuSeparator.displayName = SEPARATOR_NAME2;
var ARROW_NAME3 = "DropdownMenuArrow";
var DropdownMenuArrow = React83.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...arrowProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx70(Arrow22, { ...menuScope, ...arrowProps, ref: forwardedRef });
  }
);
DropdownMenuArrow.displayName = ARROW_NAME3;
var DropdownMenuSub = (props) => {
  const { __scopeDropdownMenu, children, open: openProp, onOpenChange, defaultOpen } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ jsx70(Sub, { ...menuScope, open, onOpenChange: setOpen, children });
};
var SUB_TRIGGER_NAME2 = "DropdownMenuSubTrigger";
var DropdownMenuSubTrigger = React83.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...subTriggerProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx70(SubTrigger, { ...menuScope, ...subTriggerProps, ref: forwardedRef });
});
DropdownMenuSubTrigger.displayName = SUB_TRIGGER_NAME2;
var SUB_CONTENT_NAME2 = "DropdownMenuSubContent";
var DropdownMenuSubContent = React83.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...subContentProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx70(
    SubContent,
    {
      ...menuScope,
      ...subContentProps,
      ref: forwardedRef,
      style: {
        ...props.style,
        // re-namespace exposed content custom properties
        ...{
          "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
          "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
          "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    }
  );
});
DropdownMenuSubContent.displayName = SUB_CONTENT_NAME2;
var Root24 = DropdownMenu;
var Trigger5 = DropdownMenuTrigger;
var Portal23 = DropdownMenuPortal;
var Content24 = DropdownMenuContent;
var Group22 = DropdownMenuGroup;
var Label22 = DropdownMenuLabel;
var Item23 = DropdownMenuItem;
var CheckboxItem2 = DropdownMenuCheckboxItem;
var RadioGroup22 = DropdownMenuRadioGroup;
var RadioItem2 = DropdownMenuRadioItem;
var ItemIndicator22 = DropdownMenuItemIndicator;
var Separator22 = DropdownMenuSeparator;
var Sub2 = DropdownMenuSub;
var SubTrigger2 = DropdownMenuSubTrigger;
var SubContent2 = DropdownMenuSubContent;

// src/components/DropdownMenu.tsx
import { Check as Check4, ChevronRight as ChevronRight3, Circle } from "lucide-react";
import { jsx as jsx71, jsxs as jsxs41 } from "react/jsx-runtime";
var DropdownMenu2 = Root24;
var DropdownMenuTrigger2 = Trigger5;
var DropdownMenuGroup2 = Group22;
var DropdownMenuPortal2 = Portal23;
var DropdownMenuSub2 = Sub2;
var DropdownMenuRadioGroup2 = RadioGroup22;
var DropdownMenuSubTrigger2 = React84.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs41(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx71(ChevronRight3, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger2.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent2 = React84.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx71(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent2.displayName = SubContent2.displayName;
var DropdownMenuContent2 = React84.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx71(Portal23, { children: /* @__PURE__ */ jsx71(
  Content24,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[min(var(--radix-dropdown-menu-content-available-height),calc(100vh-100px))] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin] overscroll-contain",
      className
    ),
    onWheel: (e) => {
      e.stopPropagation();
    },
    ...props
  }
) }));
DropdownMenuContent2.displayName = Content24.displayName;
var DropdownMenuItem2 = React84.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx71(
  Item23,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem2.displayName = Item23.displayName;
var DropdownMenuCheckboxItem2 = React84.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs41(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx71("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx71(ItemIndicator22, { children: /* @__PURE__ */ jsx71(Check4, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem2.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem2 = React84.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs41(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx71("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx71(ItemIndicator22, { children: /* @__PURE__ */ jsx71(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem2.displayName = RadioItem2.displayName;
var DropdownMenuLabel2 = React84.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx71(
  Label22,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuLabel2.displayName = Label22.displayName;
var DropdownMenuSeparator2 = React84.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx71(
  Separator22,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator2.displayName = Separator22.displayName;
var DropdownMenuShortcut = ({
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsx71(
    "span",
    {
      className: cn("ml-auto text-xs tracking-widest opacity-60", className),
      ...props
    }
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// src/components/Form.tsx
import * as React86 from "react";
import { Slot as Slot4 } from "@radix-ui/react-slot";

// ../../node_modules/.pnpm/react-hook-form@7.55.0_react@18.3.1/node_modules/react-hook-form/dist/index.esm.mjs
import React85 from "react";
var isCheckBoxInput = (element) => element.type === "checkbox";
var isDateObject = (value) => value instanceof Date;
var isNullOrUndefined = (value) => value == null;
var isObjectType = (value) => typeof value === "object";
var isObject = (value) => !isNullOrUndefined(value) && !Array.isArray(value) && isObjectType(value) && !isDateObject(value);
var getEventValue = (event) => isObject(event) && event.target ? isCheckBoxInput(event.target) ? event.target.checked : event.target.value : event;
var getNodeParentName = (name) => name.substring(0, name.search(/\.\d+(\.|$)/)) || name;
var isNameInFieldArray = (names, name) => names.has(getNodeParentName(name));
var isPlainObject = (tempObject) => {
  const prototypeCopy = tempObject.constructor && tempObject.constructor.prototype;
  return isObject(prototypeCopy) && prototypeCopy.hasOwnProperty("isPrototypeOf");
};
var isWeb = typeof window !== "undefined" && typeof window.HTMLElement !== "undefined" && typeof document !== "undefined";
function cloneObject(data) {
  let copy;
  const isArray = Array.isArray(data);
  const isFileListInstance = typeof FileList !== "undefined" ? data instanceof FileList : false;
  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set(data);
  } else if (!(isWeb && (data instanceof Blob || isFileListInstance)) && (isArray || isObject(data))) {
    copy = isArray ? [] : {};
    if (!isArray && !isPlainObject(data)) {
      copy = data;
    } else {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          copy[key] = cloneObject(data[key]);
        }
      }
    }
  } else {
    return data;
  }
  return copy;
}
var compact = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
var isUndefined = (val) => val === void 0;
var get = (object, path, defaultValue) => {
  if (!path || !isObject(object)) {
    return defaultValue;
  }
  const result = compact(path.split(/[,[\].]+?/)).reduce((result2, key) => isNullOrUndefined(result2) ? result2 : result2[key], object);
  return isUndefined(result) || result === object ? isUndefined(object[path]) ? defaultValue : object[path] : result;
};
var isBoolean = (value) => typeof value === "boolean";
var isKey = (value) => /^\w*$/.test(value);
var stringToPath = (input) => compact(input.replace(/["|']|\]/g, "").split(/\.|\[/));
var set = (object, path, value) => {
  let index2 = -1;
  const tempPath = isKey(path) ? [path] : stringToPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;
  while (++index2 < length) {
    const key = tempPath[index2];
    let newValue = value;
    if (index2 !== lastIndex) {
      const objValue = object[key];
      newValue = isObject(objValue) || Array.isArray(objValue) ? objValue : !isNaN(+tempPath[index2 + 1]) ? [] : {};
    }
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return;
    }
    object[key] = newValue;
    object = object[key];
  }
};
var EVENTS = {
  BLUR: "blur",
  FOCUS_OUT: "focusout",
  CHANGE: "change"
};
var VALIDATION_MODE = {
  onBlur: "onBlur",
  onChange: "onChange",
  onSubmit: "onSubmit",
  onTouched: "onTouched",
  all: "all"
};
var HookFormContext = React85.createContext(null);
var useFormContext = () => React85.useContext(HookFormContext);
var FormProvider = (props) => {
  const { children, ...data } = props;
  return React85.createElement(HookFormContext.Provider, { value: data }, children);
};
var getProxyFormState = (formState, control, localProxyFormState, isRoot = true) => {
  const result = {
    defaultValues: control._defaultValues
  };
  for (const key in formState) {
    Object.defineProperty(result, key, {
      get: () => {
        const _key = key;
        if (control._proxyFormState[_key] !== VALIDATION_MODE.all) {
          control._proxyFormState[_key] = !isRoot || VALIDATION_MODE.all;
        }
        localProxyFormState && (localProxyFormState[_key] = true);
        return formState[_key];
      }
    });
  }
  return result;
};
function useFormState(props) {
  const methods = useFormContext();
  const { control = methods.control, disabled, name, exact } = props || {};
  const [formState, updateFormState] = React85.useState(control._formState);
  const _localProxyFormState = React85.useRef({
    isDirty: false,
    isLoading: false,
    dirtyFields: false,
    touchedFields: false,
    validatingFields: false,
    isValidating: false,
    isValid: false,
    errors: false
  });
  const _name = React85.useRef(name);
  _name.current = name;
  React85.useEffect(() => control._subscribe({
    name: _name.current,
    formState: _localProxyFormState.current,
    exact,
    callback: (formState2) => {
      !disabled && updateFormState({
        ...control._formState,
        ...formState2
      });
    }
  }), [control, disabled, exact]);
  React85.useEffect(() => {
    _localProxyFormState.current.isValid && control._setValid(true);
  }, [control]);
  return React85.useMemo(() => getProxyFormState(formState, control, _localProxyFormState.current, false), [formState, control]);
}
var isString = (value) => typeof value === "string";
var generateWatchOutput = (names, _names, formValues, isGlobal, defaultValue) => {
  if (isString(names)) {
    isGlobal && _names.watch.add(names);
    return get(formValues, names, defaultValue);
  }
  if (Array.isArray(names)) {
    return names.map((fieldName) => (isGlobal && _names.watch.add(fieldName), get(formValues, fieldName)));
  }
  isGlobal && (_names.watchAll = true);
  return formValues;
};
function useWatch(props) {
  const methods = useFormContext();
  const { control = methods.control, name, defaultValue, disabled, exact } = props || {};
  const _name = React85.useRef(name);
  const _defaultValue = React85.useRef(defaultValue);
  _name.current = name;
  React85.useEffect(() => control._subscribe({
    name: _name.current,
    formState: {
      values: true
    },
    exact,
    callback: (formState) => !disabled && updateValue(generateWatchOutput(_name.current, control._names, formState.values || control._formValues, false, _defaultValue.current))
  }), [control, disabled, exact]);
  const [value, updateValue] = React85.useState(control._getWatch(name, defaultValue));
  React85.useEffect(() => control._removeUnmounted());
  return value;
}
function useController(props) {
  const methods = useFormContext();
  const { name, disabled, control = methods.control, shouldUnregister } = props;
  const isArrayField = isNameInFieldArray(control._names.array, name);
  const value = useWatch({
    control,
    name,
    defaultValue: get(control._formValues, name, get(control._defaultValues, name, props.defaultValue)),
    exact: true
  });
  const formState = useFormState({
    control,
    name,
    exact: true
  });
  const _props = React85.useRef(props);
  const _registerProps = React85.useRef(control.register(name, {
    ...props.rules,
    value,
    ...isBoolean(props.disabled) ? { disabled: props.disabled } : {}
  }));
  const fieldState = React85.useMemo(() => Object.defineProperties({}, {
    invalid: {
      enumerable: true,
      get: () => !!get(formState.errors, name)
    },
    isDirty: {
      enumerable: true,
      get: () => !!get(formState.dirtyFields, name)
    },
    isTouched: {
      enumerable: true,
      get: () => !!get(formState.touchedFields, name)
    },
    isValidating: {
      enumerable: true,
      get: () => !!get(formState.validatingFields, name)
    },
    error: {
      enumerable: true,
      get: () => get(formState.errors, name)
    }
  }), [formState, name]);
  const onChange = React85.useCallback((event) => _registerProps.current.onChange({
    target: {
      value: getEventValue(event),
      name
    },
    type: EVENTS.CHANGE
  }), [name]);
  const onBlur = React85.useCallback(() => _registerProps.current.onBlur({
    target: {
      value: get(control._formValues, name),
      name
    },
    type: EVENTS.BLUR
  }), [name, control._formValues]);
  const ref = React85.useCallback((elm) => {
    const field2 = get(control._fields, name);
    if (field2 && elm) {
      field2._f.ref = {
        focus: () => elm.focus(),
        select: () => elm.select(),
        setCustomValidity: (message) => elm.setCustomValidity(message),
        reportValidity: () => elm.reportValidity()
      };
    }
  }, [control._fields, name]);
  const field = React85.useMemo(() => ({
    name,
    value,
    ...isBoolean(disabled) || formState.disabled ? { disabled: formState.disabled || disabled } : {},
    onChange,
    onBlur,
    ref
  }), [name, disabled, formState.disabled, onChange, onBlur, ref, value]);
  React85.useEffect(() => {
    const _shouldUnregisterField = control._options.shouldUnregister || shouldUnregister;
    control.register(name, {
      ..._props.current.rules,
      ...isBoolean(_props.current.disabled) ? { disabled: _props.current.disabled } : {}
    });
    const updateMounted = (name2, value2) => {
      const field2 = get(control._fields, name2);
      if (field2 && field2._f) {
        field2._f.mount = value2;
      }
    };
    updateMounted(name, true);
    if (_shouldUnregisterField) {
      const value2 = cloneObject(get(control._options.defaultValues, name));
      set(control._defaultValues, name, value2);
      if (isUndefined(get(control._formValues, name))) {
        set(control._formValues, name, value2);
      }
    }
    !isArrayField && control.register(name);
    return () => {
      (isArrayField ? _shouldUnregisterField && !control._state.action : _shouldUnregisterField) ? control.unregister(name) : updateMounted(name, false);
    };
  }, [name, control, isArrayField, shouldUnregister]);
  React85.useEffect(() => {
    control._setDisabledField({
      disabled,
      name
    });
  }, [disabled, name, control]);
  return React85.useMemo(() => ({
    field,
    formState,
    fieldState
  }), [field, formState, fieldState]);
}
var Controller = (props) => props.render(useController(props));
var defaultOptions = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true
};

// src/components/Form.tsx
import { jsx as jsx72 } from "react/jsx-runtime";
var Form = FormProvider;
var FormFieldContext = React86.createContext(
  {}
);
var FormField2 = ({
  ...props
}) => {
  return /* @__PURE__ */ jsx72(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsx72(Controller, { ...props }) });
};
var useFormField = () => {
  const fieldContext = React86.useContext(FormFieldContext);
  const itemContext = React86.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
var FormItemContext = React86.createContext(
  {}
);
var FormItem = React86.forwardRef(({ className, ...props }, ref) => {
  const id = React86.useId();
  return /* @__PURE__ */ jsx72(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsx72("div", { ref, className: cn("space-y-2", className), ...props }) });
});
FormItem.displayName = "FormItem";
var FormLabel = React86.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsx72(
    Label2,
    {
      ref,
      className: cn(error && "text-destructive", className),
      htmlFor: formItemId,
      ...props
    }
  );
});
FormLabel.displayName = "FormLabel";
var FormControl = React86.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsx72(
    Slot4,
    {
      ref,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
      ...props
    }
  );
});
FormControl.displayName = "FormControl";
var FormDescription = React86.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsx72(
    "p",
    {
      ref,
      id: formDescriptionId,
      className: cn("text-sm text-muted-foreground", className),
      ...props
    }
  );
});
FormDescription.displayName = "FormDescription";
var FormMessage = React86.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsx72(
    "p",
    {
      ref,
      id: formMessageId,
      className: cn("text-sm font-medium text-destructive", className),
      ...props,
      children: body
    }
  );
});
FormMessage.displayName = "FormMessage";

// src/components/Toggle.tsx
import * as React88 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-toggle@1.1.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@radix-ui/react-toggle/dist/index.mjs
import * as React87 from "react";
import { jsx as jsx73 } from "react/jsx-runtime";
var NAME2 = "Toggle";
var Toggle = React87.forwardRef((props, forwardedRef) => {
  const { pressed: pressedProp, defaultPressed = false, onPressedChange, ...buttonProps } = props;
  const [pressed = false, setPressed] = useControllableState({
    prop: pressedProp,
    onChange: onPressedChange,
    defaultProp: defaultPressed
  });
  return /* @__PURE__ */ jsx73(
    Primitive.button,
    {
      type: "button",
      "aria-pressed": pressed,
      "data-state": pressed ? "on" : "off",
      "data-disabled": props.disabled ? "" : void 0,
      ...buttonProps,
      ref: forwardedRef,
      onClick: composeEventHandlers(props.onClick, () => {
        if (!props.disabled) {
          setPressed(!pressed);
        }
      })
    }
  );
});
Toggle.displayName = NAME2;
var Root10 = Toggle;

// src/components/Toggle.tsx
import { cva as cva34 } from "class-variance-authority";
import { jsx as jsx74 } from "react/jsx-runtime";
var toggleVariants = cva34(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-10 px-3 min-w-10",
        sm: "h-9 px-2.5 min-w-9",
        lg: "h-11 px-5 min-w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Toggle2 = React88.forwardRef(({ className, variant, size: size4, ...props }, ref) => /* @__PURE__ */ jsx74(
  Root10,
  {
    ref,
    className: cn(toggleVariants({ variant, size: size4, className })),
    ...props
  }
));
Toggle2.displayName = Root10.displayName;

// src/components/ToggleGroup.tsx
import * as React90 from "react";

// ../../node_modules/.pnpm/@radix-ui+react-toggle-group@1.1.3_@types+react-dom@18.3.1_@types+react@18.3.12_react-d_614069cb8c967721fa1165cf14e01c9f/node_modules/@radix-ui/react-toggle-group/dist/index.mjs
import React89 from "react";
import { jsx as jsx75 } from "react/jsx-runtime";
var TOGGLE_GROUP_NAME = "ToggleGroup";
var [createToggleGroupContext, createToggleGroupScope] = createContextScope(TOGGLE_GROUP_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope2 = createRovingFocusGroupScope();
var ToggleGroup = React89.forwardRef((props, forwardedRef) => {
  const { type, ...toggleGroupProps } = props;
  if (type === "single") {
    const singleProps = toggleGroupProps;
    return /* @__PURE__ */ jsx75(ToggleGroupImplSingle, { ...singleProps, ref: forwardedRef });
  }
  if (type === "multiple") {
    const multipleProps = toggleGroupProps;
    return /* @__PURE__ */ jsx75(ToggleGroupImplMultiple, { ...multipleProps, ref: forwardedRef });
  }
  throw new Error(`Missing prop \`type\` expected on \`${TOGGLE_GROUP_NAME}\``);
});
ToggleGroup.displayName = TOGGLE_GROUP_NAME;
var [ToggleGroupValueProvider, useToggleGroupValueContext] = createToggleGroupContext(TOGGLE_GROUP_NAME);
var ToggleGroupImplSingle = React89.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...toggleGroupSingleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange
  });
  return /* @__PURE__ */ jsx75(
    ToggleGroupValueProvider,
    {
      scope: props.__scopeToggleGroup,
      type: "single",
      value: value ? [value] : [],
      onItemActivate: setValue,
      onItemDeactivate: React89.useCallback(() => setValue(""), [setValue]),
      children: /* @__PURE__ */ jsx75(ToggleGroupImpl, { ...toggleGroupSingleProps, ref: forwardedRef })
    }
  );
});
var ToggleGroupImplMultiple = React89.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...toggleGroupMultipleProps
  } = props;
  const [value = [], setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange
  });
  const handleButtonActivate = React89.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleButtonDeactivate = React89.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ jsx75(
    ToggleGroupValueProvider,
    {
      scope: props.__scopeToggleGroup,
      type: "multiple",
      value,
      onItemActivate: handleButtonActivate,
      onItemDeactivate: handleButtonDeactivate,
      children: /* @__PURE__ */ jsx75(ToggleGroupImpl, { ...toggleGroupMultipleProps, ref: forwardedRef })
    }
  );
});
ToggleGroup.displayName = TOGGLE_GROUP_NAME;
var [ToggleGroupContext, useToggleGroupContext] = createToggleGroupContext(TOGGLE_GROUP_NAME);
var ToggleGroupImpl = React89.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeToggleGroup,
      disabled = false,
      rovingFocus = true,
      orientation,
      dir,
      loop = true,
      ...toggleGroupProps
    } = props;
    const rovingFocusGroupScope = useRovingFocusGroupScope2(__scopeToggleGroup);
    const direction = useDirection(dir);
    const commonProps = { role: "group", dir: direction, ...toggleGroupProps };
    return /* @__PURE__ */ jsx75(ToggleGroupContext, { scope: __scopeToggleGroup, rovingFocus, disabled, children: rovingFocus ? /* @__PURE__ */ jsx75(
      Root9,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation,
        dir: direction,
        loop,
        children: /* @__PURE__ */ jsx75(Primitive.div, { ...commonProps, ref: forwardedRef })
      }
    ) : /* @__PURE__ */ jsx75(Primitive.div, { ...commonProps, ref: forwardedRef }) });
  }
);
var ITEM_NAME4 = "ToggleGroupItem";
var ToggleGroupItem = React89.forwardRef(
  (props, forwardedRef) => {
    const valueContext = useToggleGroupValueContext(ITEM_NAME4, props.__scopeToggleGroup);
    const context = useToggleGroupContext(ITEM_NAME4, props.__scopeToggleGroup);
    const rovingFocusGroupScope = useRovingFocusGroupScope2(props.__scopeToggleGroup);
    const pressed = valueContext.value.includes(props.value);
    const disabled = context.disabled || props.disabled;
    const commonProps = { ...props, pressed, disabled };
    const ref = React89.useRef(null);
    return context.rovingFocus ? /* @__PURE__ */ jsx75(
      Item2,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: pressed,
        ref,
        children: /* @__PURE__ */ jsx75(ToggleGroupItemImpl, { ...commonProps, ref: forwardedRef })
      }
    ) : /* @__PURE__ */ jsx75(ToggleGroupItemImpl, { ...commonProps, ref: forwardedRef });
  }
);
ToggleGroupItem.displayName = ITEM_NAME4;
var ToggleGroupItemImpl = React89.forwardRef(
  (props, forwardedRef) => {
    const { __scopeToggleGroup, value, ...itemProps } = props;
    const valueContext = useToggleGroupValueContext(ITEM_NAME4, __scopeToggleGroup);
    const singleProps = { role: "radio", "aria-checked": props.pressed, "aria-pressed": void 0 };
    const typeProps = valueContext.type === "single" ? singleProps : void 0;
    return /* @__PURE__ */ jsx75(
      Toggle,
      {
        ...typeProps,
        ...itemProps,
        ref: forwardedRef,
        onPressedChange: (pressed) => {
          if (pressed) {
            valueContext.onItemActivate(value);
          } else {
            valueContext.onItemDeactivate(value);
          }
        }
      }
    );
  }
);
var Root25 = ToggleGroup;
var Item24 = ToggleGroupItem;

// src/components/ToggleGroup.tsx
import { jsx as jsx76 } from "react/jsx-runtime";
var ToggleGroupContext2 = React90.createContext({
  size: "default",
  variant: "default"
});
var ToggleGroup2 = React90.forwardRef(({ className, variant, size: size4, children, ...props }, ref) => /* @__PURE__ */ jsx76(
  Root25,
  {
    ref,
    className: cn("flex items-center justify-center gap-1", className),
    ...props,
    children: /* @__PURE__ */ jsx76(ToggleGroupContext2.Provider, { value: { variant, size: size4 }, children })
  }
));
ToggleGroup2.displayName = Root25.displayName;
var ToggleGroupItem2 = React90.forwardRef(({ className, children, variant, size: size4, ...props }, ref) => {
  const context = React90.useContext(ToggleGroupContext2);
  return /* @__PURE__ */ jsx76(
    Item24,
    {
      ref,
      className: cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size4
        }),
        className
      ),
      ...props,
      children
    }
  );
});
ToggleGroupItem2.displayName = Item24.displayName;

// ../../node_modules/.pnpm/@radix-ui+react-collapsible@1.1.4_@types+react-dom@18.3.1_@types+react@18.3.12_react-do_acbc38ce4a560a38282bff0bbd75c28d/node_modules/@radix-ui/react-collapsible/dist/index.mjs
import * as React91 from "react";
import { jsx as jsx77 } from "react/jsx-runtime";
var COLLAPSIBLE_NAME = "Collapsible";
var [createCollapsibleContext, createCollapsibleScope] = createContextScope(COLLAPSIBLE_NAME);
var [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME);
var Collapsible = React91.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCollapsible,
      open: openProp,
      defaultOpen,
      disabled,
      onOpenChange,
      ...collapsibleProps
    } = props;
    const [open = false, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChange
    });
    return /* @__PURE__ */ jsx77(
      CollapsibleProvider,
      {
        scope: __scopeCollapsible,
        disabled,
        contentId: useId3(),
        open,
        onOpenToggle: React91.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        children: /* @__PURE__ */ jsx77(
          Primitive.div,
          {
            "data-state": getState2(open),
            "data-disabled": disabled ? "" : void 0,
            ...collapsibleProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Collapsible.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME4 = "CollapsibleTrigger";
var CollapsibleTrigger = React91.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCollapsible, ...triggerProps } = props;
    const context = useCollapsibleContext(TRIGGER_NAME4, __scopeCollapsible);
    return /* @__PURE__ */ jsx77(
      Primitive.button,
      {
        type: "button",
        "aria-controls": context.contentId,
        "aria-expanded": context.open || false,
        "data-state": getState2(context.open),
        "data-disabled": context.disabled ? "" : void 0,
        disabled: context.disabled,
        ...triggerProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
CollapsibleTrigger.displayName = TRIGGER_NAME4;
var CONTENT_NAME6 = "CollapsibleContent";
var CollapsibleContent = React91.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...contentProps } = props;
    const context = useCollapsibleContext(CONTENT_NAME6, props.__scopeCollapsible);
    return /* @__PURE__ */ jsx77(Presence, { present: forceMount || context.open, children: ({ present }) => /* @__PURE__ */ jsx77(CollapsibleContentImpl, { ...contentProps, ref: forwardedRef, present }) });
  }
);
CollapsibleContent.displayName = CONTENT_NAME6;
var CollapsibleContentImpl = React91.forwardRef((props, forwardedRef) => {
  const { __scopeCollapsible, present, children, ...contentProps } = props;
  const context = useCollapsibleContext(CONTENT_NAME6, __scopeCollapsible);
  const [isPresent, setIsPresent] = React91.useState(present);
  const ref = React91.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const heightRef = React91.useRef(0);
  const height = heightRef.current;
  const widthRef = React91.useRef(0);
  const width = widthRef.current;
  const isOpen = context.open || isPresent;
  const isMountAnimationPreventedRef = React91.useRef(isOpen);
  const originalStylesRef = React91.useRef(void 0);
  React91.useEffect(() => {
    const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
    return () => cancelAnimationFrame(rAF);
  }, []);
  useLayoutEffect2(() => {
    const node = ref.current;
    if (node) {
      originalStylesRef.current = originalStylesRef.current || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      heightRef.current = rect.height;
      widthRef.current = rect.width;
      if (!isMountAnimationPreventedRef.current) {
        node.style.transitionDuration = originalStylesRef.current.transitionDuration;
        node.style.animationName = originalStylesRef.current.animationName;
      }
      setIsPresent(present);
    }
  }, [context.open, present]);
  return /* @__PURE__ */ jsx77(
    Primitive.div,
    {
      "data-state": getState2(context.open),
      "data-disabled": context.disabled ? "" : void 0,
      id: context.contentId,
      hidden: !isOpen,
      ...contentProps,
      ref: composedRefs,
      style: {
        [`--radix-collapsible-content-height`]: height ? `${height}px` : void 0,
        [`--radix-collapsible-content-width`]: width ? `${width}px` : void 0,
        ...props.style
      },
      children: isOpen && children
    }
  );
});
function getState2(open) {
  return open ? "open" : "closed";
}
var Root11 = Collapsible;

// src/components/Collapsible.tsx
var Collapsible2 = Root11;
var CollapsibleTrigger2 = CollapsibleTrigger;
var CollapsibleContent2 = CollapsibleContent;

// src/components/CollapsibleSection.tsx
import { ChevronDown as ChevronDown2, ChevronUp as ChevronUp2 } from "lucide-react";
import { jsx as jsx78, jsxs as jsxs42 } from "react/jsx-runtime";
function CollapsibleSection({
  title,
  icon: Icon2,
  isExpanded,
  onToggle,
  children,
  badge,
  iconColor = "text-blue-600",
  className
}) {
  return /* @__PURE__ */ jsxs42("div", { className: cn("bg-white rounded-lg shadow-sm mb-3 overflow-hidden", className), children: [
    /* @__PURE__ */ jsxs42(
      "button",
      {
        onClick: onToggle,
        className: "w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 transition-colors",
        "data-testid": `collapsible-${title.toLowerCase().replace(/\s+/g, "-")}`,
        children: [
          /* @__PURE__ */ jsxs42("div", { className: "flex items-center gap-3", children: [
            Icon2 && /* @__PURE__ */ jsx78("div", { className: "w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center", children: /* @__PURE__ */ jsx78(Icon2, { className: cn("w-5 h-5", iconColor) }) }),
            /* @__PURE__ */ jsxs42("div", { className: "text-left", children: [
              /* @__PURE__ */ jsx78("h3", { className: "font-semibold text-gray-900", children: title }),
              badge && /* @__PURE__ */ jsx78("span", { className: "text-xs text-gray-500", children: badge })
            ] })
          ] }),
          isExpanded ? /* @__PURE__ */ jsx78(ChevronUp2, { className: "w-5 h-5 text-gray-400" }) : /* @__PURE__ */ jsx78(ChevronDown2, { className: "w-5 h-5 text-gray-400" })
        ]
      }
    ),
    isExpanded && /* @__PURE__ */ jsx78("div", { className: "p-4 pt-2 border-t border-gray-100", children })
  ] });
}

// src/components/Accordion.tsx
import * as React92 from "react";
import { cva as cva35 } from "class-variance-authority";
import { ChevronDown as ChevronDown3 } from "lucide-react";
import { jsx as jsx79, jsxs as jsxs43 } from "react/jsx-runtime";
var accordionVariants = cva35("divide-y divide-border-base", {
  variants: {
    variant: {
      default: "border border-border-base rounded-lg",
      ghost: "",
      separated: "space-y-2"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
var accordionItemVariants = cva35("", {
  variants: {
    variant: {
      default: "",
      ghost: "",
      separated: "border border-border-base rounded-lg"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
var accordionTriggerVariants = cva35(
  "flex w-full items-center justify-between py-4 px-4 font-medium transition-all hover:bg-surface-subtle",
  {
    variants: {
      variant: {
        default: "",
        ghost: "px-0",
        separated: ""
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var accordionContentVariants = cva35("overflow-hidden transition-all duration-300", {
  variants: {
    state: {
      open: "max-h-[1000px] opacity-100",
      closed: "max-h-0 opacity-0"
    }
  },
  defaultVariants: {
    state: "closed"
  }
});
var Accordion = ({
  items,
  type = "single",
  defaultValue,
  value: controlledValue,
  onValueChange,
  variant = "default",
  className,
  collapsible = true
}) => {
  const [uncontrolledValue, setUncontrolledValue] = React92.useState(
    defaultValue || (type === "multiple" ? [] : "")
  );
  const value = controlledValue !== void 0 ? controlledValue : uncontrolledValue;
  const setValue = onValueChange || setUncontrolledValue;
  const isOpen = (itemId) => {
    if (type === "multiple") {
      return Array.isArray(value) && value.includes(itemId);
    }
    return value === itemId;
  };
  const handleToggle = (itemId, disabled) => {
    if (disabled) return;
    if (type === "multiple") {
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.includes(itemId)) {
        setValue(currentValue.filter((id) => id !== itemId));
      } else {
        setValue([...currentValue, itemId]);
      }
    } else {
      if (value === itemId && collapsible) {
        setValue("");
      } else {
        setValue(itemId);
      }
    }
  };
  return /* @__PURE__ */ jsx79("div", { className: accordionVariants({ variant, className }), children: items.map((item) => {
    const open = isOpen(item.id);
    return /* @__PURE__ */ jsxs43("div", { className: accordionItemVariants({ variant }), children: [
      /* @__PURE__ */ jsxs43(
        "button",
        {
          type: "button",
          onClick: () => handleToggle(item.id, item.disabled),
          disabled: item.disabled,
          className: `${accordionTriggerVariants({ variant })} ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`,
          "aria-expanded": open,
          "aria-controls": `accordion-content-${item.id}`,
          children: [
            /* @__PURE__ */ jsxs43("div", { className: "flex items-center gap-3", children: [
              item.icon && /* @__PURE__ */ jsx79("span", { className: "flex-shrink-0 text-text-secondary", children: item.icon }),
              /* @__PURE__ */ jsx79("span", { className: "text-left text-text-primary", children: item.title })
            ] }),
            /* @__PURE__ */ jsx79(
              ChevronDown3,
              {
                className: `w-5 h-5 text-text-secondary transition-transform duration-300 ${open ? "rotate-180" : ""}`
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx79(
        "div",
        {
          id: `accordion-content-${item.id}`,
          className: accordionContentVariants({ state: open ? "open" : "closed" }),
          children: /* @__PURE__ */ jsx79("div", { className: "px-4 pb-4 pt-0 text-sm text-text-secondary", children: item.content })
        }
      )
    ] }, item.id);
  }) });
};
Accordion.displayName = "Accordion";

// src/components/Breadcrumb.tsx
import * as React93 from "react";
import { cva as cva36 } from "class-variance-authority";
import { ChevronRight as ChevronRight4, Home } from "lucide-react";
import { jsx as jsx80, jsxs as jsxs44 } from "react/jsx-runtime";
var breadcrumbVariants = cva36("flex items-center flex-wrap gap-1 text-sm", {
  variants: {
    variant: {
      default: "",
      subtle: "text-text-secondary"
    },
    size: {
      sm: "text-xs gap-0.5",
      md: "text-sm gap-1",
      lg: "text-base gap-2"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});
var breadcrumbItemVariants = cva36("transition-colors", {
  variants: {
    active: {
      true: "text-text-primary font-medium pointer-events-none",
      false: "text-text-secondary hover:text-text-primary cursor-pointer"
    }
  },
  defaultVariants: {
    active: false
  }
});
var Breadcrumb = ({
  items,
  separator,
  showHomeIcon = false,
  maxItems,
  variant = "default",
  size: size4 = "md",
  className
}) => {
  const Separator4 = separator || /* @__PURE__ */ jsx80(ChevronRight4, { className: "w-4 h-4 text-text-secondary" });
  let displayItems = items;
  let hasCollapsed = false;
  if (maxItems && items.length > maxItems) {
    hasCollapsed = true;
    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(items.length - (maxItems - 2));
    displayItems = [...firstItems, { label: "..." }, ...lastItems];
  }
  return /* @__PURE__ */ jsx80("nav", { "aria-label": "Breadcrumb", className: breadcrumbVariants({ variant, size: size4, className }), children: /* @__PURE__ */ jsx80("ol", { className: "flex items-center flex-wrap gap-1", children: displayItems.map((item, index2) => {
    const isLast = index2 === displayItems.length - 1;
    const isCollapsed = item.label === "...";
    return /* @__PURE__ */ jsxs44(React93.Fragment, { children: [
      /* @__PURE__ */ jsxs44("li", { className: "flex items-center gap-1", children: [
        index2 === 0 && showHomeIcon && /* @__PURE__ */ jsx80(Home, { className: "w-4 h-4 mr-1 text-text-secondary" }),
        isCollapsed ? /* @__PURE__ */ jsx80("span", { className: "px-1 text-text-secondary", children: "..." }) : item.href || item.onClick ? /* @__PURE__ */ jsxs44(
          "a",
          {
            href: item.href,
            onClick: (e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
            },
            className: breadcrumbItemVariants({ active: isLast }),
            "aria-current": isLast ? "page" : void 0,
            children: [
              item.icon && /* @__PURE__ */ jsx80("span", { className: "inline-flex mr-1.5", children: item.icon }),
              item.label
            ]
          }
        ) : /* @__PURE__ */ jsxs44(
          "span",
          {
            className: breadcrumbItemVariants({ active: isLast }),
            "aria-current": isLast ? "page" : void 0,
            children: [
              item.icon && /* @__PURE__ */ jsx80("span", { className: "inline-flex mr-1.5", children: item.icon }),
              item.label
            ]
          }
        )
      ] }),
      !isLast && /* @__PURE__ */ jsx80("li", { "aria-hidden": "true", className: "flex items-center", children: Separator4 })
    ] }, index2);
  }) }) });
};
Breadcrumb.displayName = "Breadcrumb";

// src/components/Pagination.tsx
import { cva as cva37 } from "class-variance-authority";
import {
  ChevronLeft as ChevronLeft2,
  ChevronRight as ChevronRight5,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from "lucide-react";
import { jsx as jsx81, jsxs as jsxs45 } from "react/jsx-runtime";
var paginationVariants = cva37("flex items-center gap-1", {
  variants: {
    variant: {
      default: "",
      compact: "gap-0"
    },
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});
var paginationButtonVariants = cva37(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "hover:bg-surface-subtle",
        ghost: "hover:bg-surface-subtle",
        outline: "border border-border-base hover:bg-surface-subtle"
      },
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-9 w-9 text-sm",
        lg: "h-10 w-10 text-base"
      },
      active: {
        true: "bg-accent-primary text-white hover:bg-accent-primary/90",
        false: "text-text-primary"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      active: false
    }
  }
);
var Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  siblingCount = 1,
  boundaryCount = 1,
  disabled = false,
  variant = "default",
  size: size4 = "md",
  buttonVariant = "default",
  className
}) => {
  const getPageNumbers = () => {
    const range = (start, end) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, i) => start + i);
    };
    const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2;
    if (totalNumbers >= totalPages) {
      return range(1, totalPages);
    }
    const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPages - boundaryCount
    );
    const showLeftDots = leftSiblingIndex > boundaryCount + 2;
    const showRightDots = rightSiblingIndex < totalPages - boundaryCount - 1;
    if (!showLeftDots && showRightDots) {
      const leftItemCount = siblingCount * 2 + boundaryCount + 2;
      return [
        ...range(1, leftItemCount),
        "dots-right",
        ...range(totalPages - boundaryCount + 1, totalPages)
      ];
    }
    if (showLeftDots && !showRightDots) {
      const rightItemCount = siblingCount * 2 + boundaryCount + 2;
      return [
        ...range(1, boundaryCount),
        "dots-left",
        ...range(totalPages - rightItemCount + 1, totalPages)
      ];
    }
    return [
      ...range(1, boundaryCount),
      "dots-left",
      ...range(leftSiblingIndex, rightSiblingIndex),
      "dots-right",
      ...range(totalPages - boundaryCount + 1, totalPages)
    ];
  };
  const pages = getPageNumbers();
  const handlePageClick = (page) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };
  return /* @__PURE__ */ jsxs45(
    "nav",
    {
      "aria-label": "Pagination",
      className: paginationVariants({ variant, size: size4, className }),
      children: [
        showFirstLast && /* @__PURE__ */ jsx81(
          "button",
          {
            onClick: () => handlePageClick(1),
            disabled: disabled || currentPage === 1,
            className: paginationButtonVariants({ variant: buttonVariant, size: size4 }),
            "aria-label": "Go to first page",
            children: /* @__PURE__ */ jsx81(ChevronsLeft, { className: "w-4 h-4" })
          }
        ),
        showPrevNext && /* @__PURE__ */ jsx81(
          "button",
          {
            onClick: () => handlePageClick(currentPage - 1),
            disabled: disabled || currentPage === 1,
            className: paginationButtonVariants({ variant: buttonVariant, size: size4 }),
            "aria-label": "Go to previous page",
            children: /* @__PURE__ */ jsx81(ChevronLeft2, { className: "w-4 h-4" })
          }
        ),
        pages.map((page, index2) => {
          if (page === "dots-left" || page === "dots-right") {
            return /* @__PURE__ */ jsx81(
              "span",
              {
                className: paginationButtonVariants({ variant: buttonVariant, size: size4 }),
                children: /* @__PURE__ */ jsx81(MoreHorizontal, { className: "w-4 h-4" })
              },
              `dots-${index2}`
            );
          }
          const pageNumber = page;
          return /* @__PURE__ */ jsx81(
            "button",
            {
              onClick: () => handlePageClick(pageNumber),
              disabled,
              className: paginationButtonVariants({
                variant: buttonVariant,
                size: size4,
                active: pageNumber === currentPage
              }),
              "aria-label": `Go to page ${pageNumber}`,
              "aria-current": pageNumber === currentPage ? "page" : void 0,
              children: pageNumber
            },
            pageNumber
          );
        }),
        showPrevNext && /* @__PURE__ */ jsx81(
          "button",
          {
            onClick: () => handlePageClick(currentPage + 1),
            disabled: disabled || currentPage === totalPages,
            className: paginationButtonVariants({ variant: buttonVariant, size: size4 }),
            "aria-label": "Go to next page",
            children: /* @__PURE__ */ jsx81(ChevronRight5, { className: "w-4 h-4" })
          }
        ),
        showFirstLast && /* @__PURE__ */ jsx81(
          "button",
          {
            onClick: () => handlePageClick(totalPages),
            disabled: disabled || currentPage === totalPages,
            className: paginationButtonVariants({ variant: buttonVariant, size: size4 }),
            "aria-label": "Go to last page",
            children: /* @__PURE__ */ jsx81(ChevronsRight, { className: "w-4 h-4" })
          }
        )
      ]
    }
  );
};
Pagination.displayName = "Pagination";

// src/components/VisuallyHidden.tsx
import * as React94 from "react";
import { cva as cva38 } from "class-variance-authority";
var visuallyHiddenVariants = cva38(
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
  {
    variants: {
      focusable: {
        true: "focus:static focus:w-auto focus:h-auto focus:p-2 focus:m-0 focus:overflow-visible focus:whitespace-normal focus:clip-auto",
        false: "clip-[rect(0,0,0,0)]"
      }
    },
    defaultVariants: {
      focusable: false
    }
  }
);
var VisuallyHidden = React94.forwardRef(
  ({ className, focusable, as: Component2 = "span", children, ...props }, ref) => {
    return React94.createElement(
      Component2,
      {
        ref,
        className: cn(visuallyHiddenVariants({ focusable }), className),
        ...props
      },
      children
    );
  }
);
VisuallyHidden.displayName = "VisuallyHidden";

// src/components/SkipLink.tsx
import * as React95 from "react";
import { cva as cva39 } from "class-variance-authority";
import { jsx as jsx82 } from "react/jsx-runtime";
var skipLinkVariants = cva39(
  "absolute left-0 top-0 z-[9999] px-4 py-2 font-medium transition-transform duration-200",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white",
        ghost: "bg-gray-900 text-white",
        outline: "bg-white text-gray-900 border-2 border-gray-900"
      },
      position: {
        "top-left": "left-0 top-0",
        "top-center": "left-1/2 -translate-x-1/2 top-0",
        "top-right": "right-0 top-0"
      }
    },
    defaultVariants: {
      variant: "default",
      position: "top-left"
    }
  }
);
var SkipLink = React95.forwardRef(
  ({ className, variant, position, href, label = "Skip to main content", ...props }, ref) => {
    return /* @__PURE__ */ jsx82(
      "a",
      {
        ref,
        href,
        className: cn(
          skipLinkVariants({ variant, position }),
          "-translate-y-full focus:translate-y-0",
          className
        ),
        ...props,
        children: label
      }
    );
  }
);
SkipLink.displayName = "SkipLink";
var SkipLinks = ({
  className,
  links,
  variant = "default",
  ...props
}) => {
  return /* @__PURE__ */ jsx82("div", { className: cn("sr-only focus-within:not-sr-only", className), ...props, children: links.map((link, index2) => /* @__PURE__ */ jsx82(SkipLink, { href: link.href, label: link.label, variant }, index2)) });
};
SkipLinks.displayName = "SkipLinks";

// src/components/FocusTrap.tsx
import * as React96 from "react";
import { jsx as jsx83 } from "react/jsx-runtime";
var FOCUSABLE_ELEMENTS = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");
var FocusTrap = React96.forwardRef(
  ({ active = true, returnFocus = true, children, ...props }, ref) => {
    const containerRef = React96.useRef(null);
    const previouslyFocused = React96.useRef(null);
    React96.useImperativeHandle(ref, () => containerRef.current);
    React96.useEffect(() => {
      if (!active) return;
      previouslyFocused.current = document.activeElement;
      const container = containerRef.current;
      if (!container) return;
      const getFocusableElements = () => {
        return Array.from(
          container.querySelectorAll(FOCUSABLE_ELEMENTS)
        ).filter((el) => {
          return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
        });
      };
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
      const handleKeyDown = (event) => {
        if (event.key !== "Tab") return;
        const focusableElements2 = getFocusableElements();
        if (focusableElements2.length === 0) return;
        const firstElement = focusableElements2[0];
        const lastElement = focusableElements2[focusableElements2.length - 1];
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      };
      container.addEventListener("keydown", handleKeyDown);
      return () => {
        container.removeEventListener("keydown", handleKeyDown);
        if (returnFocus && previouslyFocused.current) {
          previouslyFocused.current.focus();
        }
      };
    }, [active, returnFocus]);
    return /* @__PURE__ */ jsx83("div", { ref: containerRef, ...props, children });
  }
);
FocusTrap.displayName = "FocusTrap";

// src/utils/colorAccessibility.ts
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function getContrastRatio(foreground, background) {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) {
    throw new Error("Invalid hex color provided");
  }
  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
function checkContrast(foreground, background) {
  const ratio = getContrastRatio(foreground, background);
  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: {
      normal: ratio >= 4.5,
      large: ratio >= 3
    },
    AAA: {
      normal: ratio >= 7,
      large: ratio >= 4.5
    }
  };
}
function getSuggestedForeground(background) {
  const whiteContrast = getContrastRatio("#FFFFFF", background);
  const blackContrast = getContrastRatio("#000000", background);
  return whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
}
function isDark(color) {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance < 0.5;
}
function getComplianceLevel(ratio, isLargeText = false) {
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "Fail";
  } else {
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
    return "Fail";
  }
}

// src/components/ColorContrastChecker.tsx
import { jsx as jsx84, jsxs as jsxs46 } from "react/jsx-runtime";
function ColorContrastChecker({
  foreground,
  background,
  showLargeText = true,
  showBadges = true,
  showSwatches = true,
  className
}) {
  const result = checkContrast(foreground, background);
  const normalLevel = getComplianceLevel(result.ratio, false);
  const largeLevel = getComplianceLevel(result.ratio, true);
  const getLevelColor = (level) => {
    switch (level) {
      case "AAA":
        return "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100";
      case "AA":
        return "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-100";
      default:
        return "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-100";
    }
  };
  return /* @__PURE__ */ jsxs46("div", { className: cn("space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800", className), children: [
    showSwatches && /* @__PURE__ */ jsxs46("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxs46("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx84("div", { className: "mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400", children: "Foreground" }),
        /* @__PURE__ */ jsx84(
          "div",
          {
            className: "h-16 w-full rounded border border-neutral-300 dark:border-neutral-700",
            style: { backgroundColor: foreground }
          }
        ),
        /* @__PURE__ */ jsx84("div", { className: "mt-1 text-xs text-neutral-500 dark:text-neutral-500", children: foreground.toUpperCase() })
      ] }),
      /* @__PURE__ */ jsxs46("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx84("div", { className: "mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400", children: "Background" }),
        /* @__PURE__ */ jsx84(
          "div",
          {
            className: "h-16 w-full rounded border border-neutral-300 dark:border-neutral-700",
            style: { backgroundColor: background }
          }
        ),
        /* @__PURE__ */ jsx84("div", { className: "mt-1 text-xs text-neutral-500 dark:text-neutral-500", children: background.toUpperCase() })
      ] }),
      /* @__PURE__ */ jsxs46("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx84("div", { className: "mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400", children: "Preview" }),
        /* @__PURE__ */ jsx84(
          "div",
          {
            className: "flex h-16 w-full items-center justify-center rounded border border-neutral-300 text-sm font-medium dark:border-neutral-700",
            style: { backgroundColor: background, color: foreground },
            children: "Sample Text"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs46("div", { className: "flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800", children: [
      /* @__PURE__ */ jsxs46("div", { children: [
        /* @__PURE__ */ jsx84("div", { className: "text-xs font-medium text-neutral-600 dark:text-neutral-400", children: "Contrast Ratio" }),
        /* @__PURE__ */ jsxs46("div", { className: "text-2xl font-bold text-neutral-900 dark:text-neutral-100", children: [
          result.ratio,
          ":1"
        ] })
      ] }),
      showBadges && /* @__PURE__ */ jsxs46("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs46("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx84("div", { className: "mb-1 text-xs text-neutral-500", children: "Normal Text" }),
          /* @__PURE__ */ jsx84(Badge, { className: cn("text-xs font-semibold", getLevelColor(normalLevel)), children: normalLevel })
        ] }),
        showLargeText && /* @__PURE__ */ jsxs46("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx84("div", { className: "mb-1 text-xs text-neutral-500", children: "Large Text" }),
          /* @__PURE__ */ jsx84(Badge, { className: cn("text-xs font-semibold", getLevelColor(largeLevel)), children: largeLevel })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs46("div", { className: "grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4 text-xs dark:border-neutral-800", children: [
      /* @__PURE__ */ jsxs46("div", { children: [
        /* @__PURE__ */ jsx84("div", { className: "mb-2 font-semibold text-neutral-700 dark:text-neutral-300", children: "WCAG AA" }),
        /* @__PURE__ */ jsxs46("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs46("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx84("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Normal (4.5:1)" }),
            /* @__PURE__ */ jsx84("span", { className: cn("font-medium", result.AA.normal ? "text-success-600" : "text-error-600"), children: result.AA.normal ? "\u2713 Pass" : "\u2717 Fail" })
          ] }),
          showLargeText && /* @__PURE__ */ jsxs46("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx84("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Large (3:1)" }),
            /* @__PURE__ */ jsx84("span", { className: cn("font-medium", result.AA.large ? "text-success-600" : "text-error-600"), children: result.AA.large ? "\u2713 Pass" : "\u2717 Fail" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs46("div", { children: [
        /* @__PURE__ */ jsx84("div", { className: "mb-2 font-semibold text-neutral-700 dark:text-neutral-300", children: "WCAG AAA" }),
        /* @__PURE__ */ jsxs46("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs46("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx84("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Normal (7:1)" }),
            /* @__PURE__ */ jsx84("span", { className: cn("font-medium", result.AAA.normal ? "text-success-600" : "text-error-600"), children: result.AAA.normal ? "\u2713 Pass" : "\u2717 Fail" })
          ] }),
          showLargeText && /* @__PURE__ */ jsxs46("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx84("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Large (4.5:1)" }),
            /* @__PURE__ */ jsx84("span", { className: cn("font-medium", result.AAA.large ? "text-success-600" : "text-error-600"), children: result.AAA.large ? "\u2713 Pass" : "\u2717 Fail" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
ColorContrastChecker.displayName = "ColorContrastChecker";

// src/components/Sidebar.tsx
import * as React97 from "react";
import { cva as cva40 } from "class-variance-authority";
import { ChevronLeft as ChevronLeft3, ChevronRight as ChevronRight6 } from "lucide-react";
import { jsx as jsx85, jsxs as jsxs47 } from "react/jsx-runtime";
var sidebarVariants = cva40(
  "flex flex-col border-r bg-white transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "border-gray-200",
        dark: "bg-gray-900 border-gray-800",
        primary: "bg-primary-50 border-primary-200"
      },
      position: {
        left: "left-0",
        right: "right-0 border-l border-r-0"
      },
      size: {
        sm: "w-48",
        md: "w-64",
        lg: "w-80",
        full: "w-full"
      }
    },
    defaultVariants: {
      variant: "default",
      position: "left",
      size: "md"
    }
  }
);
var Sidebar = React97.forwardRef(
  ({
    className,
    variant,
    position,
    size: size4,
    collapsed = false,
    collapsible = false,
    onCollapse,
    children,
    ...props
  }, ref) => {
    const [isCollapsed, setIsCollapsed] = React97.useState(collapsed);
    React97.useEffect(() => {
      setIsCollapsed(collapsed);
    }, [collapsed]);
    const handleToggle = () => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onCollapse?.(newCollapsed);
    };
    return /* @__PURE__ */ jsxs47(
      "div",
      {
        ref,
        className: cn(
          sidebarVariants({ variant, position, size: size4 }),
          isCollapsed && "w-16",
          className
        ),
        ...props,
        children: [
          children,
          collapsible && /* @__PURE__ */ jsx85(
            "button",
            {
              onClick: handleToggle,
              className: cn(
                "absolute -right-3 top-4 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm hover:shadow-md transition-shadow",
                variant === "dark" && "bg-gray-800 border-gray-700"
              ),
              "aria-label": isCollapsed ? "Expand sidebar" : "Collapse sidebar",
              children: position === "left" ? isCollapsed ? /* @__PURE__ */ jsx85(ChevronRight6, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx85(ChevronLeft3, { className: "h-4 w-4" }) : isCollapsed ? /* @__PURE__ */ jsx85(ChevronLeft3, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx85(ChevronRight6, { className: "h-4 w-4" })
            }
          )
        ]
      }
    );
  }
);
Sidebar.displayName = "Sidebar";
var SidebarHeader = React97.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx85(
    "div",
    {
      ref,
      className: cn("flex items-center gap-2 p-4 border-b border-gray-200", className),
      ...props
    }
  );
});
SidebarHeader.displayName = "SidebarHeader";
var SidebarContent = React97.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx85(
    "div",
    {
      ref,
      className: cn("flex-1 overflow-y-auto overflow-x-hidden p-4", className),
      ...props
    }
  );
});
SidebarContent.displayName = "SidebarContent";
var SidebarFooter = React97.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx85(
    "div",
    {
      ref,
      className: cn("mt-auto p-4 border-t border-gray-200", className),
      ...props
    }
  );
});
SidebarFooter.displayName = "SidebarFooter";
var SidebarNav = React97.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx85("nav", { ref, className: cn("flex flex-col gap-1", className), ...props });
});
SidebarNav.displayName = "SidebarNav";
var SidebarNavItem = React97.forwardRef(
  ({ className, active, icon, children, ...props }, ref) => {
    return /* @__PURE__ */ jsxs47(
      "a",
      {
        ref,
        className: cn(
          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          active ? "bg-primary-100 text-primary-900" : "text-gray-700 hover:bg-gray-100",
          className
        ),
        ...props,
        children: [
          icon && /* @__PURE__ */ jsx85("span", { className: "flex-shrink-0", children: icon }),
          /* @__PURE__ */ jsx85("span", { className: "truncate", children })
        ]
      }
    );
  }
);
SidebarNavItem.displayName = "SidebarNavItem";

// src/components/AppShell.tsx
import * as React98 from "react";
import { cva as cva41 } from "class-variance-authority";
import { jsx as jsx86, jsxs as jsxs48 } from "react/jsx-runtime";
var appShellVariants = cva41("min-h-screen flex flex-col", {
  variants: {
    variant: {
      default: "bg-gray-50",
      clean: "bg-white",
      dark: "bg-gray-900"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
var AppShell = React98.forwardRef(
  ({ className, variant, header, sidebar, footer, aside, children, ...props }, ref) => {
    return /* @__PURE__ */ jsxs48("div", { ref, className: cn(appShellVariants({ variant }), className), ...props, children: [
      header && /* @__PURE__ */ jsx86("div", { className: "flex-shrink-0 z-10", children: header }),
      /* @__PURE__ */ jsxs48("div", { className: "flex flex-1 overflow-hidden", children: [
        sidebar && /* @__PURE__ */ jsx86("div", { className: "flex-shrink-0", children: sidebar }),
        /* @__PURE__ */ jsx86("main", { className: "flex-1 overflow-y-auto", children }),
        aside && /* @__PURE__ */ jsx86("div", { className: "flex-shrink-0", children: aside })
      ] }),
      footer && /* @__PURE__ */ jsx86("div", { className: "flex-shrink-0", children: footer })
    ] });
  }
);
AppShell.displayName = "AppShell";
var appHeaderVariants = cva41(
  "flex items-center justify-between border-b bg-white px-4 py-3",
  {
    variants: {
      variant: {
        default: "border-gray-200",
        dark: "bg-gray-900 border-gray-800",
        primary: "bg-primary-600 border-primary-700 text-white"
      },
      sticky: {
        true: "sticky top-0 z-50",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      sticky: true
    }
  }
);
var AppHeader = React98.forwardRef(
  ({ className, variant, sticky, logo, nav, actions, children, ...props }, ref) => {
    return /* @__PURE__ */ jsxs48(
      "header",
      {
        ref,
        className: cn(appHeaderVariants({ variant, sticky }), className),
        ...props,
        children: [
          logo && /* @__PURE__ */ jsx86("div", { className: "flex items-center gap-4", children: logo }),
          nav && /* @__PURE__ */ jsx86("nav", { className: "flex-1 px-4", children: nav }),
          actions && /* @__PURE__ */ jsx86("div", { className: "flex items-center gap-2", children: actions }),
          children
        ]
      }
    );
  }
);
AppHeader.displayName = "AppHeader";
var appFooterVariants = cva41("border-t bg-white px-4 py-6", {
  variants: {
    variant: {
      default: "border-gray-200 text-gray-600",
      dark: "bg-gray-900 border-gray-800 text-gray-400",
      minimal: "border-gray-100 text-gray-500 py-3"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
var AppFooter = React98.forwardRef(
  ({ className, variant, ...props }, ref) => {
    return /* @__PURE__ */ jsx86(
      "footer",
      {
        ref,
        className: cn(appFooterVariants({ variant }), className),
        ...props
      }
    );
  }
);
AppFooter.displayName = "AppFooter";
var AppMain = React98.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx86("div", { ref, className: cn("p-6", className), ...props });
  }
);
AppMain.displayName = "AppMain";
var appAsideVariants = cva41("border-l bg-white", {
  variants: {
    variant: {
      default: "border-gray-200",
      dark: "bg-gray-900 border-gray-800"
    },
    width: {
      sm: "w-64",
      md: "w-80",
      lg: "w-96"
    }
  },
  defaultVariants: {
    variant: "default",
    width: "md"
  }
});
var AppAside = React98.forwardRef(
  ({ className, variant, width, ...props }, ref) => {
    return /* @__PURE__ */ jsx86(
      "aside",
      {
        ref,
        className: cn(appAsideVariants({ variant, width }), className),
        ...props
      }
    );
  }
);
AppAside.displayName = "AppAside";

// src/components/Stepper.tsx
import * as React99 from "react";
import { cva as cva42 } from "class-variance-authority";
import { Check as Check5 } from "lucide-react";
import { Fragment as Fragment15, jsx as jsx87, jsxs as jsxs49 } from "react/jsx-runtime";
var stepperVariants = cva42("flex", {
  variants: {
    orientation: {
      horizontal: "flex-row items-center",
      vertical: "flex-col"
    },
    variant: {
      default: "",
      pills: "",
      dots: ""
    }
  },
  defaultVariants: {
    orientation: "horizontal",
    variant: "default"
  }
});
var Stepper = React99.forwardRef(
  ({
    className,
    orientation,
    variant,
    steps,
    currentStep,
    onStepClick,
    clickable = false,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx87(
      "div",
      {
        ref,
        className: cn(stepperVariants({ orientation, variant }), className),
        role: "navigation",
        "aria-label": "Progress",
        ...props,
        children: steps.map((step, index2) => {
          const isCompleted = index2 < currentStep;
          const isCurrent = index2 === currentStep;
          const isUpcoming = index2 > currentStep;
          return /* @__PURE__ */ jsxs49(React99.Fragment, { children: [
            /* @__PURE__ */ jsx87(
              StepItem,
              {
                step,
                index: index2,
                isCompleted,
                isCurrent,
                isUpcoming,
                clickable: clickable && index2 <= currentStep,
                onClick: () => clickable && index2 <= currentStep && onStepClick?.(index2),
                orientation: orientation || "horizontal",
                variant: variant || "default"
              }
            ),
            index2 < steps.length - 1 && /* @__PURE__ */ jsx87(
              StepConnector,
              {
                isCompleted,
                orientation: orientation || "horizontal"
              }
            )
          ] }, step.id);
        })
      }
    );
  }
);
Stepper.displayName = "Stepper";
var StepItem = ({
  step,
  index: index2,
  isCompleted,
  isCurrent,
  isUpcoming,
  clickable,
  onClick,
  orientation,
  variant
}) => {
  const Element2 = clickable ? "button" : "div";
  return /* @__PURE__ */ jsxs49(
    Element2,
    {
      className: cn(
        "flex items-center gap-3",
        orientation === "vertical" && "w-full",
        clickable && "cursor-pointer hover:opacity-80 transition-opacity"
      ),
      onClick: clickable ? onClick : void 0,
      "aria-current": isCurrent ? "step" : void 0,
      type: clickable ? "button" : void 0,
      children: [
        /* @__PURE__ */ jsx87(
          "div",
          {
            className: cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
              variant === "pills" && "rounded-lg",
              variant === "dots" && "h-3 w-3",
              isCompleted && "border-primary-600 bg-primary-600 text-white",
              isCurrent && "border-primary-600 bg-white text-primary-600",
              isUpcoming && "border-gray-300 bg-white text-gray-400"
            ),
            children: variant !== "dots" && /* @__PURE__ */ jsx87(Fragment15, { children: isCompleted ? /* @__PURE__ */ jsx87(Check5, { className: "h-5 w-5" }) : step.icon ? step.icon : /* @__PURE__ */ jsx87("span", { className: "text-sm font-semibold", children: index2 + 1 }) })
          }
        ),
        variant !== "dots" && /* @__PURE__ */ jsxs49(
          "div",
          {
            className: cn(
              "flex flex-col",
              orientation === "horizontal" && "min-w-0"
            ),
            children: [
              /* @__PURE__ */ jsx87(
                "span",
                {
                  className: cn(
                    "text-sm font-medium",
                    isCurrent && "text-primary-600",
                    isCompleted && "text-gray-900",
                    isUpcoming && "text-gray-500"
                  ),
                  children: step.label
                }
              ),
              step.description && /* @__PURE__ */ jsx87("span", { className: "text-xs text-gray-500", children: step.description }),
              step.optional && /* @__PURE__ */ jsx87("span", { className: "text-xs text-gray-400", children: "Optional" })
            ]
          }
        )
      ]
    }
  );
};
var StepConnector = ({
  isCompleted,
  orientation
}) => {
  return /* @__PURE__ */ jsx87(
    "div",
    {
      className: cn(
        "transition-colors",
        orientation === "horizontal" ? "h-0.5 flex-1 mx-2" : "w-0.5 h-8 ml-5",
        isCompleted ? "bg-primary-600" : "bg-gray-300"
      )
    }
  );
};

// src/components/ErrorBoundary.tsx
import * as React100 from "react";
import { AlertTriangle as AlertTriangle2, RefreshCw } from "lucide-react";
import { jsx as jsx88, jsxs as jsxs50 } from "react/jsx-runtime";
var ErrorBoundary = class extends React100.Component {
  constructor(props) {
    super(props);
    __publicField(this, "reset", () => {
      this.setState({ hasError: false, error: null });
    });
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }
  componentDidUpdate(prevProps) {
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;
      const hasResetKeyChanged = currentKeys.some(
        (key, index2) => key !== prevKeys[index2]
      );
      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsx88(
        DefaultErrorFallback,
        {
          error: this.state.error,
          onReset: this.reset
        }
      );
    }
    return this.props.children;
  }
};
var DefaultErrorFallback = ({ error, onReset }) => {
  return /* @__PURE__ */ jsx88("div", { className: "flex min-h-[400px] items-center justify-center p-6", children: /* @__PURE__ */ jsxs50("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx88("div", { className: "mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100", children: /* @__PURE__ */ jsx88(AlertTriangle2, { className: "h-8 w-8 text-red-600" }) }),
    /* @__PURE__ */ jsx88("h3", { className: "mb-2 text-lg font-semibold text-gray-900", children: "Something went wrong" }),
    /* @__PURE__ */ jsx88("p", { className: "mb-4 text-sm text-gray-600", children: "We're sorry, but something unexpected happened. Please try refreshing the page." }),
    error && process.env.NODE_ENV === "development" && /* @__PURE__ */ jsxs50("details", { className: "mb-4 text-left", children: [
      /* @__PURE__ */ jsx88("summary", { className: "cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900", children: "Error details" }),
      /* @__PURE__ */ jsxs50("pre", { className: "mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-800", children: [
        error.message,
        "\n\n",
        error.stack
      ] })
    ] }),
    /* @__PURE__ */ jsxs50(
      "button",
      {
        onClick: onReset,
        className: "inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors",
        children: [
          /* @__PURE__ */ jsx88(RefreshCw, { className: "h-4 w-4" }),
          "Try again"
        ]
      }
    )
  ] }) });
};
function withErrorBoundary(Component2, errorBoundaryProps) {
  const Wrapped = (props) => /* @__PURE__ */ jsx88(ErrorBoundary, { ...errorBoundaryProps, children: /* @__PURE__ */ jsx88(Component2, { ...props }) });
  Wrapped.displayName = `withErrorBoundary(${Component2.displayName || Component2.name})`;
  return Wrapped;
}
function useErrorHandler(givenError) {
  const [error, setError] = React100.useState(null);
  if (givenError != null) throw givenError;
  if (error != null) throw error;
  return setError;
}

// src/components/LoadingBoundary.tsx
import * as React101 from "react";
import { Loader2 } from "lucide-react";
import { Fragment as Fragment16, jsx as jsx89, jsxs as jsxs51 } from "react/jsx-runtime";
var LoadingBoundary = ({
  children,
  fallback,
  isLoading = false,
  delay = 0,
  minDuration = 0
}) => {
  const [shouldShow, setShouldShow] = React101.useState(delay === 0);
  const [startTime, setStartTime] = React101.useState(null);
  React101.useEffect(() => {
    if (isLoading) {
      setStartTime(Date.now());
      if (delay > 0) {
        const timer = setTimeout(() => {
          setShouldShow(true);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        setShouldShow(true);
      }
    } else if (startTime && minDuration > 0) {
      const elapsed = Date.now() - startTime;
      const remaining = minDuration - elapsed;
      if (remaining > 0) {
        const timer = setTimeout(() => {
          setShouldShow(false);
          setStartTime(null);
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        setShouldShow(false);
        setStartTime(null);
      }
    } else {
      setShouldShow(false);
      setStartTime(null);
    }
  }, [isLoading, delay, minDuration, startTime]);
  if (isLoading && shouldShow) {
    return /* @__PURE__ */ jsx89(Fragment16, { children: fallback || /* @__PURE__ */ jsx89(DefaultLoadingFallback, {}) });
  }
  return /* @__PURE__ */ jsx89(Fragment16, { children });
};
var DefaultLoadingFallback = () => {
  return /* @__PURE__ */ jsx89("div", { className: "flex min-h-[200px] items-center justify-center p-6", children: /* @__PURE__ */ jsxs51("div", { className: "flex flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsx89(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }),
    /* @__PURE__ */ jsx89("p", { className: "text-sm text-gray-600", children: "Loading..." })
  ] }) });
};
var Skeleton2 = ({
  className,
  width,
  height,
  circle = false,
  count: count3 = 1,
  ...props
}) => {
  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height
  };
  const skeletons = Array.from({ length: count3 }, (_, index2) => /* @__PURE__ */ jsx89(
    "div",
    {
      className: cn(
        "animate-pulse bg-gray-200",
        circle ? "rounded-full" : "rounded",
        !height && "h-4",
        className
      ),
      style,
      ...props
    },
    index2
  ));
  return count3 > 1 ? /* @__PURE__ */ jsx89("div", { className: "flex flex-col gap-2", children: skeletons }) : /* @__PURE__ */ jsx89(Fragment16, { children: skeletons });
};
function withLoadingBoundary(Component2, loadingBoundaryProps) {
  const Wrapped = (props) => /* @__PURE__ */ jsx89(LoadingBoundary, { ...loadingBoundaryProps, children: /* @__PURE__ */ jsx89(Component2, { ...props }) });
  Wrapped.displayName = `withLoadingBoundary(${Component2.displayName || Component2.name})`;
  return Wrapped;
}
var SuspenseBoundary = ({
  children,
  fallback
}) => {
  return /* @__PURE__ */ jsx89(React101.Suspense, { fallback: fallback || /* @__PURE__ */ jsx89(DefaultLoadingFallback, {}), children });
};

// src/components/FeatureFlag.tsx
import * as React102 from "react";
import { Fragment as Fragment17, jsx as jsx90 } from "react/jsx-runtime";
var FeatureFlagContext = React102.createContext(
  void 0
);
var FeatureFlagProvider = ({
  children,
  flags: initialFlags = {},
  fallback
}) => {
  const [flags, setFlags] = React102.useState(initialFlags);
  const isEnabled = React102.useCallback(
    (flag) => {
      return flags[flag] === true;
    },
    [flags]
  );
  const enable = React102.useCallback((flag) => {
    setFlags((prev) => ({ ...prev, [flag]: true }));
  }, []);
  const disable = React102.useCallback((flag) => {
    setFlags((prev) => ({ ...prev, [flag]: false }));
  }, []);
  const toggle = React102.useCallback((flag) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);
  const value = {
    flags,
    isEnabled,
    enable,
    disable,
    toggle
  };
  return /* @__PURE__ */ jsx90(FeatureFlagContext.Provider, { value, children });
};
function useFeatureFlags() {
  const context = React102.useContext(FeatureFlagContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagProvider");
  }
  return context;
}
function useFeatureFlag(flag) {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}
var FeatureFlag = ({
  flag,
  children,
  fallback = null
}) => {
  const isEnabled = useFeatureFlag(flag);
  if (!isEnabled) {
    return /* @__PURE__ */ jsx90(Fragment17, { children: fallback });
  }
  return /* @__PURE__ */ jsx90(Fragment17, { children });
};
var FeatureFlagSwitch = ({ flag, on, off }) => {
  const isEnabled = useFeatureFlag(flag);
  return /* @__PURE__ */ jsx90(Fragment17, { children: isEnabled ? on : off });
};
function withFeatureFlag(Component2, flag, fallback) {
  const Wrapped = (props) => {
    const isEnabled = useFeatureFlag(flag);
    if (!isEnabled) {
      return /* @__PURE__ */ jsx90(Fragment17, { children: fallback });
    }
    return /* @__PURE__ */ jsx90(Component2, { ...props });
  };
  Wrapped.displayName = `withFeatureFlag(${Component2.displayName || Component2.name})`;
  return Wrapped;
}
var MultiFeatureFlag = ({
  flags,
  children,
  fallback = null,
  requireAll = true
}) => {
  const { isEnabled } = useFeatureFlags();
  const shouldRender = requireAll ? flags.every((flag) => isEnabled(flag)) : flags.some((flag) => isEnabled(flag));
  if (!shouldRender) {
    return /* @__PURE__ */ jsx90(Fragment17, { children: fallback });
  }
  return /* @__PURE__ */ jsx90(Fragment17, { children });
};

// src/components/RoleGuard.tsx
import * as React103 from "react";
import { Fragment as Fragment18, jsx as jsx91 } from "react/jsx-runtime";
var AuthContext = React103.createContext(void 0);
var AuthProvider = ({ children, user }) => {
  const hasRole = React103.useCallback(
    (role) => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.some((r) => user.roles.includes(r));
    },
    [user]
  );
  const hasPermission = React103.useCallback(
    (permission) => {
      if (!user) return false;
      const permissions = Array.isArray(permission) ? permission : [permission];
      return permissions.some((p) => user.permissions.includes(p));
    },
    [user]
  );
  const hasAnyRole = React103.useCallback(
    (roles) => {
      if (!user) return false;
      return roles.some((role) => user.roles.includes(role));
    },
    [user]
  );
  const hasAllRoles = React103.useCallback(
    (roles) => {
      if (!user) return false;
      return roles.every((role) => user.roles.includes(role));
    },
    [user]
  );
  const hasAnyPermission = React103.useCallback(
    (permissions) => {
      if (!user) return false;
      return permissions.some((permission) => user.permissions.includes(permission));
    },
    [user]
  );
  const hasAllPermissions = React103.useCallback(
    (permissions) => {
      if (!user) return false;
      return permissions.every((permission) => user.permissions.includes(permission));
    },
    [user]
  );
  const value = {
    user,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    hasAnyPermission,
    hasAllPermissions
  };
  return /* @__PURE__ */ jsx91(AuthContext.Provider, { value, children });
};
function useAuth() {
  const context = React103.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
var RoleGuard = ({
  role,
  anyRole,
  allRoles,
  children,
  fallback = null
}) => {
  const { hasRole, hasAnyRole, hasAllRoles } = useAuth();
  let hasAccess = true;
  if (role !== void 0) {
    hasAccess = hasAccess && hasRole(role);
  }
  if (anyRole !== void 0) {
    hasAccess = hasAccess && hasAnyRole(anyRole);
  }
  if (allRoles !== void 0) {
    hasAccess = hasAccess && hasAllRoles(allRoles);
  }
  if (!hasAccess) {
    return /* @__PURE__ */ jsx91(Fragment18, { children: fallback });
  }
  return /* @__PURE__ */ jsx91(Fragment18, { children });
};
var PermissionGate = ({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  let hasAccess = true;
  if (permission !== void 0) {
    hasAccess = hasAccess && hasPermission(permission);
  }
  if (anyPermission !== void 0) {
    hasAccess = hasAccess && hasAnyPermission(anyPermission);
  }
  if (allPermissions !== void 0) {
    hasAccess = hasAccess && hasAllPermissions(allPermissions);
  }
  if (!hasAccess) {
    return /* @__PURE__ */ jsx91(Fragment18, { children: fallback });
  }
  return /* @__PURE__ */ jsx91(Fragment18, { children });
};
function withRoleGuard(Component2, roles, fallback) {
  const Wrapped = (props) => {
    const { hasRole } = useAuth();
    if (!hasRole(roles)) {
      return /* @__PURE__ */ jsx91(Fragment18, { children: fallback });
    }
    return /* @__PURE__ */ jsx91(Component2, { ...props });
  };
  Wrapped.displayName = `withRoleGuard(${Component2.displayName || Component2.name})`;
  return Wrapped;
}
function withPermissionGate(Component2, permissions, fallback) {
  const Wrapped = (props) => {
    const { hasPermission } = useAuth();
    if (!hasPermission(permissions)) {
      return /* @__PURE__ */ jsx91(Fragment18, { children: fallback });
    }
    return /* @__PURE__ */ jsx91(Component2, { ...props });
  };
  Wrapped.displayName = `withPermissionGate(${Component2.displayName || Component2.name})`;
  return Wrapped;
}
var Restricted = ({
  roles,
  permissions,
  requireAll = true,
  children,
  fallback = null
}) => {
  const { hasRole, hasPermission } = useAuth();
  const hasRoleAccess = roles !== void 0 ? hasRole(roles) : true;
  const hasPermissionAccess = permissions !== void 0 ? hasPermission(permissions) : true;
  const hasAccess = requireAll ? hasRoleAccess && hasPermissionAccess : hasRoleAccess || hasPermissionAccess;
  if (!hasAccess) {
    return /* @__PURE__ */ jsx91(Fragment18, { children: fallback });
  }
  return /* @__PURE__ */ jsx91(Fragment18, { children });
};

// src/components/Collapse.tsx
import * as React104 from "react";
import { jsx as jsx92 } from "react/jsx-runtime";
var Collapse = React104.forwardRef(
  ({ className, open, duration = 300, onOpenChange, children, ...props }, ref) => {
    const contentRef = React104.useRef(null);
    const [height, setHeight] = React104.useState(open ? "auto" : 0);
    const [isAnimating, setIsAnimating] = React104.useState(false);
    React104.useEffect(() => {
      if (!contentRef.current) return;
      const contentHeight = contentRef.current.scrollHeight;
      if (open) {
        setIsAnimating(true);
        setHeight(contentHeight);
        const timer = setTimeout(() => {
          setHeight("auto");
          setIsAnimating(false);
          onOpenChange?.(true);
        }, duration);
        return () => clearTimeout(timer);
      } else {
        setHeight(contentHeight);
        requestAnimationFrame(() => {
          setIsAnimating(true);
          setHeight(0);
        });
        const timer = setTimeout(() => {
          setIsAnimating(false);
          onOpenChange?.(false);
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [open, duration, onOpenChange]);
    return /* @__PURE__ */ jsx92(
      "div",
      {
        ref,
        className: cn("overflow-hidden", className),
        style: {
          height: height === "auto" ? "auto" : `${height}px`,
          transition: isAnimating ? `height ${duration}ms ease-in-out` : "none"
        },
        ...props,
        children: /* @__PURE__ */ jsx92("div", { ref: contentRef, children })
      }
    );
  }
);
Collapse.displayName = "Collapse";

// src/components/UniformShell.tsx
import { useState as useState33 } from "react";
import {
  Settings,
  ChevronLeft as ChevronLeft4,
  ChevronRight as ChevronRight7,
  Bell,
  Building2,
  LogOut,
  Sun,
  Moon
} from "lucide-react";

// src/components/IntelligentSearch.tsx
import { useState as useState32, useRef as useRef26, useEffect as useEffect33 } from "react";
import { Search as Search2, Clock as Clock2, TrendingUp, Filter } from "lucide-react";
import { Fragment as Fragment19, jsx as jsx93, jsxs as jsxs52 } from "react/jsx-runtime";
function IntelligentSearch({
  placeholder = "Search customers, deals, vehicles... or ask a question",
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  shortcuts = [],
  onSearch,
  onSuggestionClick,
  className
}) {
  const [query, setQuery] = useState32("");
  const [isOpen, setIsOpen] = useState32(false);
  const [highlightedIndex, setHighlightedIndex] = useState32(-1);
  const inputRef = useRef26(null);
  const dropdownRef = useRef26(null);
  useEffect33(() => {
    const handleKeyDown2 = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown2);
    return () => window.removeEventListener("keydown", handleKeyDown2);
  }, []);
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    const allItems = [...suggestions, ...recentSearches.map((r) => ({ text: r, category: "recent" }))];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => prev < allItems.length - 1 ? prev + 1 : prev);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && allItems[highlightedIndex]) {
        handleSelectSuggestion(allItems[highlightedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };
  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setIsOpen(false);
    }
  };
  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.text);
    onSearch(suggestion.text);
    if (onSuggestionClick && "icon" in suggestion) {
      onSuggestionClick(suggestion);
    }
    setIsOpen(false);
  };
  return /* @__PURE__ */ jsxs52("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsxs52("div", { className: "relative", children: [
      /* @__PURE__ */ jsx93(
        Input,
        {
          ref: inputRef,
          type: "text",
          placeholder,
          value: query,
          onChange: (e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          },
          onFocus: () => setIsOpen(true),
          onKeyDown: handleKeyDown,
          leftIcon: /* @__PURE__ */ jsx93(Search2, { className: "h-4 w-4" }),
          inputSize: "sm",
          className: "w-full pr-16 h-9"
        }
      ),
      /* @__PURE__ */ jsxs52("kbd", { className: "absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-text-tertiary bg-surface-muted rounded border border-border-base", children: [
        /* @__PURE__ */ jsx93("span", { className: "text-xs", children: "\u2318" }),
        "K"
      ] })
    ] }),
    isOpen && (query.length > 0 || recentSearches.length > 0 || shortcuts.length > 0) && /* @__PURE__ */ jsxs52(Fragment19, { children: [
      /* @__PURE__ */ jsx93("div", { className: "fixed inset-0 z-10", onClick: () => setIsOpen(false) }),
      /* @__PURE__ */ jsxs52(
        "div",
        {
          ref: dropdownRef,
          className: "absolute top-full mt-2 w-full min-w-[400px] max-h-96 overflow-y-auto rounded-lg border border-border-base bg-surface-elevated shadow-lg z-20",
          children: [
            suggestions.length > 0 && /* @__PURE__ */ jsxs52("div", { className: "py-2", children: [
              /* @__PURE__ */ jsx93("div", { className: "px-3 py-1 text-xs font-medium text-text-tertiary", children: "Suggestions" }),
              suggestions.map((suggestion, idx) => /* @__PURE__ */ jsxs52(
                "button",
                {
                  onClick: () => handleSelectSuggestion(suggestion),
                  className: cn(
                    "w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-surface-muted",
                    highlightedIndex === idx && "bg-surface-muted"
                  ),
                  children: [
                    suggestion.category === "filter" && /* @__PURE__ */ jsx93(Filter, { className: "h-4 w-4 text-text-tertiary" }),
                    /* @__PURE__ */ jsx93("span", { className: "flex-1 text-sm text-text-primary", children: suggestion.text }),
                    suggestion.count && /* @__PURE__ */ jsxs52("span", { className: "text-xs text-text-tertiary", children: [
                      suggestion.count,
                      " results"
                    ] })
                  ]
                },
                idx
              ))
            ] }),
            recentSearches.length > 0 && query.length === 0 && /* @__PURE__ */ jsxs52("div", { className: "py-2 border-t border-border-base", children: [
              /* @__PURE__ */ jsx93("div", { className: "px-3 py-1 text-xs font-medium text-text-tertiary", children: "Recent" }),
              recentSearches.map((search, idx) => /* @__PURE__ */ jsxs52(
                "button",
                {
                  onClick: () => handleSelectSuggestion({ text: search, category: "recent" }),
                  className: "w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-surface-muted",
                  children: [
                    /* @__PURE__ */ jsx93(Clock2, { className: "h-4 w-4 text-text-tertiary" }),
                    /* @__PURE__ */ jsx93("span", { className: "text-sm text-text-primary", children: search })
                  ]
                },
                idx
              ))
            ] }),
            popularSearches.length > 0 && query.length === 0 && /* @__PURE__ */ jsxs52("div", { className: "py-2 border-t border-border-base", children: [
              /* @__PURE__ */ jsx93("div", { className: "px-3 py-1 text-xs font-medium text-text-tertiary", children: "Popular" }),
              popularSearches.map((search, idx) => /* @__PURE__ */ jsxs52(
                "button",
                {
                  onClick: () => handleSelectSuggestion({ text: search, category: "popular" }),
                  className: "w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-surface-muted",
                  children: [
                    /* @__PURE__ */ jsx93(TrendingUp, { className: "h-4 w-4 text-text-tertiary" }),
                    /* @__PURE__ */ jsx93("span", { className: "text-sm text-text-primary", children: search })
                  ]
                },
                idx
              ))
            ] }),
            shortcuts.length > 0 && query.length === 0 && /* @__PURE__ */ jsxs52("div", { className: "py-2 border-t border-border-base", children: [
              /* @__PURE__ */ jsx93("div", { className: "px-3 py-1 text-xs font-medium text-text-tertiary", children: "Shortcuts" }),
              shortcuts.map((shortcut, idx) => /* @__PURE__ */ jsx93(
                "button",
                {
                  onClick: () => handleSelectSuggestion({ text: shortcut.query, category: "entity" }),
                  className: "w-full px-3 py-2 text-left hover:bg-surface-muted",
                  children: /* @__PURE__ */ jsx93("span", { className: "text-sm text-text-primary", children: shortcut.label })
                },
                idx
              ))
            ] })
          ]
        }
      )
    ] })
  ] });
}
IntelligentSearch.displayName = "IntelligentSearch";

// src/components/UniformShell.tsx
import { Fragment as Fragment20, jsx as jsx94, jsxs as jsxs53 } from "react/jsx-runtime";
function UniformShell({
  modules,
  activeModule,
  activeSubItem,
  tenant = "AutolytiQ",
  user = "User",
  userAvatar,
  notifications = 0,
  theme = "light",
  onThemeToggle,
  onNavigate,
  onSearch,
  searchSuggestions = [],
  recentSearches = [],
  popularSearches = [],
  searchShortcuts = [],
  onTenantSwitch,
  onUserMenuClick,
  onLogout,
  onSettings,
  children,
  className
}) {
  const [isCollapsed, setIsCollapsed] = useState33(false);
  const [expandedModule, setExpandedModule] = useState33(activeModule || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState33(false);
  const [userMenuOpen, setUserMenuOpen] = useState33(false);
  const isMobile = useMobileBreakpoint();
  const breakpoint = useBreakpoint();
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const handleModuleClick = (module) => {
    if (module.subItems && module.subItems.length > 0) {
      setExpandedModule(expandedModule === module.id ? null : module.id);
    } else {
      onNavigate?.(module.id);
      if (isMobile) setMobileMenuOpen(false);
    }
  };
  const handleSubItemClick = (moduleId, subItemId) => {
    onNavigate?.(moduleId, subItemId);
    if (isMobile) setMobileMenuOpen(false);
  };
  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  return /* @__PURE__ */ jsxs53("div", { className: cn("flex h-screen overflow-hidden bg-canvas", className), children: [
    !isMobile && /* @__PURE__ */ jsxs53(
      "aside",
      {
        className: cn(
          "flex flex-col border-r border-default bg-elevated transition-all duration-300",
          sidebarWidth
        ),
        children: [
          /* @__PURE__ */ jsxs53("div", { className: "flex h-14 items-center justify-between border-b border-default px-4", children: [
            !isCollapsed && /* @__PURE__ */ jsx94("span", { className: "text-lg font-semibold text-text-primary", children: "AutolytiQ" }),
            /* @__PURE__ */ jsx94(
              "button",
              {
                onClick: toggleSidebar,
                className: "rounded p-1.5 text-text-secondary hover:bg-inset hover:text-text-primary",
                "aria-label": isCollapsed ? "Expand sidebar" : "Collapse sidebar",
                children: isCollapsed ? /* @__PURE__ */ jsx94(ChevronRight7, { className: "h-[18px] w-[18px]" }) : /* @__PURE__ */ jsx94(ChevronLeft4, { className: "h-[18px] w-[18px]" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx94("nav", { className: "flex-1 overflow-y-auto py-4", children: modules.map((module) => /* @__PURE__ */ jsxs53("div", { children: [
            /* @__PURE__ */ jsxs53(
              "button",
              {
                onClick: () => handleModuleClick(module),
                className: cn(
                  "group relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  activeModule === module.id ? "bg-[rgb(var(--action-primary)_/_0.1)] text-[rgb(var(--action-primary))]" : "text-text-secondary hover:bg-inset hover:text-text-primary"
                ),
                children: [
                  /* @__PURE__ */ jsx94(module.icon, { className: "h-5 w-5 flex-shrink-0" }),
                  !isCollapsed && /* @__PURE__ */ jsx94("span", { className: "text-sm font-medium", children: module.label }),
                  isCollapsed && /* @__PURE__ */ jsx94("div", { className: "pointer-events-none absolute left-full ml-2 hidden rounded bg-surface-elevated px-2 py-1 text-xs text-text-primary opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100", children: module.label })
                ]
              }
            ),
            !isCollapsed && expandedModule === module.id && module.subItems && /* @__PURE__ */ jsx94("div", { className: "bg-inset py-1", children: module.subItems.map((subItem) => /* @__PURE__ */ jsx94(
              "button",
              {
                onClick: () => handleSubItemClick(module.id, subItem.id),
                className: cn(
                  "flex w-full items-center px-4 py-2 pl-12 text-left text-sm transition-colors",
                  activeSubItem === subItem.id ? "text-[rgb(var(--action-primary))] font-medium" : "text-text-tertiary hover:text-text-primary"
                ),
                children: subItem.label
              },
              subItem.id
            )) })
          ] }, module.id)) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs53("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxs53("header", { className: cn(
        "flex h-14 items-center justify-between border-b border-default bg-elevated px-4",
        isMobile && "sticky top-0 z-30 shadow-sm"
      ), children: [
        /* @__PURE__ */ jsxs53("div", { className: "flex items-center gap-3 flex-1", children: [
          isMobile && /* @__PURE__ */ jsx94("span", { className: "text-base font-bold text-[rgb(var(--action-primary))]", children: "AutolytiQ" }),
          /* @__PURE__ */ jsx94("div", { className: "hidden xs:block w-full sm:w-64", children: /* @__PURE__ */ jsx94(
            IntelligentSearch,
            {
              placeholder: "Search...",
              suggestions: searchSuggestions,
              recentSearches,
              popularSearches,
              shortcuts: searchShortcuts,
              onSearch: (query) => onSearch?.(query),
              className: "w-full"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs53("div", { className: "flex items-center gap-1 sm:gap-2", children: [
          /* @__PURE__ */ jsxs53(
            "button",
            {
              onClick: onTenantSwitch,
              className: "flex items-center gap-2 rounded px-3 py-1.5 text-sm text-text-secondary hover:bg-inset hover:text-text-primary",
              children: [
                /* @__PURE__ */ jsx94(Building2, { className: "h-4 w-4" }),
                !isMobile && /* @__PURE__ */ jsx94("span", { children: tenant })
              ]
            }
          ),
          onThemeToggle && /* @__PURE__ */ jsxs53(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: onThemeToggle,
              className: "h-9 w-9 p-0",
              children: [
                /* @__PURE__ */ jsx94(Sun, { className: "h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" }),
                /* @__PURE__ */ jsx94(Moon, { className: "absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" }),
                /* @__PURE__ */ jsxs53("span", { className: "sr-only", children: [
                  "Toggle theme (",
                  theme,
                  ")"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs53("button", { className: "relative rounded p-2 text-text-secondary hover:bg-inset hover:text-text-primary", children: [
            /* @__PURE__ */ jsx94(Bell, { className: "h-[18px] w-[18px]" }),
            notifications > 0 && /* @__PURE__ */ jsx94("span", { className: "absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[rgb(var(--error))] text-[10px] font-medium text-white", children: notifications > 9 ? "9+" : notifications })
          ] }),
          /* @__PURE__ */ jsxs53("div", { className: "relative", children: [
            /* @__PURE__ */ jsxs53(
              "button",
              {
                onClick: () => setUserMenuOpen(!userMenuOpen),
                className: "flex items-center gap-2 rounded px-2 py-1.5 hover:bg-inset",
                children: [
                  userAvatar ? /* @__PURE__ */ jsx94("img", { src: userAvatar, alt: user, className: "h-6 w-6 rounded-full" }) : /* @__PURE__ */ jsx94("div", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--action-primary))] text-xs font-medium text-white", children: user.charAt(0).toUpperCase() }),
                  !isMobile && /* @__PURE__ */ jsx94("span", { className: "text-sm text-text-secondary", children: user })
                ]
              }
            ),
            userMenuOpen && /* @__PURE__ */ jsxs53(Fragment20, { children: [
              /* @__PURE__ */ jsx94(
                "div",
                {
                  className: "fixed inset-0 z-10",
                  onClick: () => setUserMenuOpen(false)
                }
              ),
              /* @__PURE__ */ jsxs53("div", { className: "absolute right-0 top-full mt-2 w-48 z-20 rounded-lg border border-border-base bg-surface-elevated shadow-lg", children: [
                /* @__PURE__ */ jsxs53("div", { className: "px-4 py-3 border-b border-border-base", children: [
                  /* @__PURE__ */ jsx94("p", { className: "text-sm font-medium text-text-primary", children: user }),
                  /* @__PURE__ */ jsx94("p", { className: "text-xs text-text-tertiary", children: tenant })
                ] }),
                /* @__PURE__ */ jsxs53("div", { className: "py-1", children: [
                  /* @__PURE__ */ jsxs53(
                    "button",
                    {
                      onClick: () => {
                        onSettings?.();
                        setUserMenuOpen(false);
                      },
                      className: "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text-secondary hover:bg-inset hover:text-text-primary",
                      children: [
                        /* @__PURE__ */ jsx94(Settings, { className: "h-4 w-4" }),
                        "Settings"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs53(
                    "button",
                    {
                      onClick: () => {
                        onLogout?.();
                        setUserMenuOpen(false);
                      },
                      className: "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-status-error hover:bg-inset",
                      children: [
                        /* @__PURE__ */ jsx94(LogOut, { className: "h-4 w-4" }),
                        "Logout"
                      ]
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx94("main", { className: cn(
        "flex-1 overflow-auto bg-canvas",
        isMobile && "pb-20"
        // Add bottom padding on mobile for bottom nav
      ), children })
    ] }),
    isMobile && /* @__PURE__ */ jsx94("nav", { className: "fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border-base bg-surface-elevated shadow-[0_-2px_10px_rgba(0,0,0,0.1)] safe-area-inset-bottom", children: modules.slice(0, 5).map((module) => /* @__PURE__ */ jsxs53(
      "button",
      {
        onClick: () => handleModuleClick(module),
        className: cn(
          "flex flex-1 flex-col items-center gap-1 py-2 px-1 transition-colors",
          activeModule === module.id ? "text-[rgb(var(--action-primary))]" : "text-text-tertiary"
        ),
        children: [
          /* @__PURE__ */ jsx94(module.icon, { className: cn(
            "h-6 w-6",
            activeModule === module.id ? "stroke-[2.5]" : "stroke-2"
          ) }),
          /* @__PURE__ */ jsx94("span", { className: "text-[10px] font-medium leading-tight", children: module.label })
        ]
      },
      module.id
    )) }),
    isMobile && expandedModule && /* @__PURE__ */ jsxs53(
      "div",
      {
        className: cn(
          "fixed inset-0 z-40 transition-opacity duration-200",
          "opacity-100"
        ),
        children: [
          /* @__PURE__ */ jsx94(
            "div",
            {
              className: "absolute inset-0 bg-black/50",
              onClick: () => setExpandedModule(null)
            }
          ),
          /* @__PURE__ */ jsxs53("div", { className: "absolute bottom-16 left-0 right-0 max-h-[60vh] rounded-t-2xl border-t border-border-base bg-surface-elevated shadow-xl", children: [
            /* @__PURE__ */ jsx94("div", { className: "px-4 py-3 border-b border-border-base", children: /* @__PURE__ */ jsxs53("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx94("h3", { className: "text-lg font-semibold text-text-primary", children: modules.find((m) => m.id === expandedModule)?.label }),
              /* @__PURE__ */ jsx94(
                "button",
                {
                  onClick: () => setExpandedModule(null),
                  className: "rounded-full p-1.5 text-text-secondary hover:bg-inset",
                  children: /* @__PURE__ */ jsx94(ChevronLeft4, { className: "h-5 w-5" })
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx94("div", { className: "overflow-y-auto px-2 py-2", children: modules.find((m) => m.id === expandedModule)?.subItems?.map((subItem) => /* @__PURE__ */ jsx94(
              "button",
              {
                onClick: () => {
                  handleSubItemClick(expandedModule, subItem.id);
                  setExpandedModule(null);
                },
                className: cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                  activeSubItem === subItem.id ? "bg-[rgb(var(--action-primary)_/_0.15)] text-[rgb(var(--action-primary))] font-semibold" : "text-text-secondary hover:bg-inset hover:text-text-primary"
                ),
                children: /* @__PURE__ */ jsx94("span", { className: "text-sm", children: subItem.label })
              },
              subItem.id
            )) })
          ] })
        ]
      }
    )
  ] });
}
UniformShell.displayName = "UniformShell";

// src/components/TenantSwitcher.tsx
import { Building2 as Building22, Check as Check6 } from "lucide-react";
import { jsx as jsx95, jsxs as jsxs54 } from "react/jsx-runtime";
function TenantSwitcher({
  isOpen,
  onClose,
  tenants,
  currentTenantId,
  onSwitch
}) {
  const handleSwitch = (tenantId) => {
    onSwitch(tenantId);
    onClose();
  };
  return /* @__PURE__ */ jsx95(Modal, { open: isOpen, onOpenChange: (open) => !open && onClose(), title: "Switch Dealership", size: "sm", children: /* @__PURE__ */ jsx95("div", { className: "space-y-2", children: tenants.map((tenant) => /* @__PURE__ */ jsxs54(
    "button",
    {
      onClick: () => handleSwitch(tenant.id),
      className: cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors",
        tenant.id === currentTenantId ? "border-action-primary bg-[rgb(var(--action-primary)_/_0.05)]" : "border-border-base hover:bg-surface-muted"
      ),
      children: [
        tenant.logo ? /* @__PURE__ */ jsx95("img", { src: tenant.logo, alt: tenant.name, className: "h-8 w-8 rounded" }) : /* @__PURE__ */ jsx95("div", { className: "h-8 w-8 rounded bg-surface-muted flex items-center justify-center", children: /* @__PURE__ */ jsx95(Building22, { className: "h-4 w-4 text-text-tertiary" }) }),
        /* @__PURE__ */ jsx95("span", { className: "flex-1 text-left text-sm font-medium text-text-primary", children: tenant.name }),
        tenant.id === currentTenantId && /* @__PURE__ */ jsx95(Check6, { className: "h-5 w-5 text-action-primary" })
      ]
    },
    tenant.id
  )) }) });
}
TenantSwitcher.displayName = "TenantSwitcher";

// src/layouts/ListDetailLayout.tsx
import { ChevronLeft as ChevronLeft5 } from "lucide-react";
import { jsx as jsx96, jsxs as jsxs55 } from "react/jsx-runtime";
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
    return /* @__PURE__ */ jsxs55("div", { className: cn("h-full", className), children: [
      /* @__PURE__ */ jsx96("div", { className: cn("h-full overflow-auto", showDetail && "hidden"), children: list }),
      showDetail && detail && /* @__PURE__ */ jsxs55("div", { className: "flex h-full flex-col", children: [
        /* @__PURE__ */ jsx96("div", { className: "sticky top-0 z-10 flex items-center gap-2 border-b border-default bg-elevated px-4 py-3", children: /* @__PURE__ */ jsxs55(
          "button",
          {
            onClick: onBack,
            className: "flex items-center gap-2 text-sm text-secondary hover:text-primary",
            children: [
              /* @__PURE__ */ jsx96(ChevronLeft5, { className: "h-[18px] w-[18px]" }),
              /* @__PURE__ */ jsx96("span", { children: "Back" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx96("div", { className: "flex-1 overflow-auto", children: detail })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs55("div", { className: cn("flex h-full", className), children: [
    /* @__PURE__ */ jsx96("div", { className: cn(
      "flex-shrink-0 border-r border-default bg-elevated overflow-auto",
      widthClasses[listWidth]
    ), children: list }),
    /* @__PURE__ */ jsx96("div", { className: "flex-1 overflow-auto bg-canvas", children: detail || /* @__PURE__ */ jsx96("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx96("div", { className: "text-center text-tertiary", children: /* @__PURE__ */ jsx96("p", { className: "text-sm", children: "Select an item to view details" }) }) }) })
  ] });
}
ListDetailLayout.displayName = "ListDetailLayout";

// src/layouts/FullDensityLayout.tsx
import { jsx as jsx97, jsxs as jsxs56 } from "react/jsx-runtime";
function FullDensityLayout({
  children,
  toolbar,
  mobileSummary,
  maxWidth = "full",
  padding = "md",
  className
}) {
  const isMobile = useMobileBreakpoint();
  const maxWidthClasses2 = {
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-none"
  };
  const paddingClasses2 = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };
  return /* @__PURE__ */ jsx97("div", { className: cn("h-full overflow-auto", className), children: /* @__PURE__ */ jsxs56("div", { className: cn("mx-auto", maxWidthClasses2[maxWidth], paddingClasses2[padding]), children: [
    toolbar && /* @__PURE__ */ jsx97("div", { className: "mb-4 flex items-center justify-between", children: toolbar }),
    isMobile && mobileSummary ? (
      // Mobile: Show summary cards instead of full DataTable
      /* @__PURE__ */ jsx97("div", { className: "space-y-4", children: mobileSummary })
    ) : (
      // Desktop: Show full content
      children
    )
  ] }) });
}
FullDensityLayout.displayName = "FullDensityLayout";

// src/layouts/FocusStudioLayout.tsx
import { useState as useState34 } from "react";
import { X as X6, ChevronDown as ChevronDown4, ChevronUp as ChevronUp3 } from "lucide-react";
import { Fragment as Fragment21, jsx as jsx98, jsxs as jsxs57 } from "react/jsx-runtime";
function FocusStudioLayout({
  left,
  center,
  right,
  mobileHeader,
  onClose,
  className
}) {
  const isMobile = useMobileBreakpoint();
  const [aiCollapsed, setAiCollapsed] = useState34(false);
  if (isMobile) {
    return /* @__PURE__ */ jsxs57(Fragment21, { children: [
      /* @__PURE__ */ jsx98(
        "div",
        {
          className: "fixed inset-0 z-40 bg-black/50",
          onClick: onClose
        }
      ),
      /* @__PURE__ */ jsxs57("div", { className: "fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col rounded-t-2xl bg-canvas shadow-2xl", children: [
        /* @__PURE__ */ jsxs57("div", { className: "sticky top-0 z-10 flex items-center justify-between border-b border-default bg-elevated px-4 py-3", children: [
          mobileHeader || /* @__PURE__ */ jsx98("div", { className: "text-lg font-semibold", children: "Deal Studio" }),
          /* @__PURE__ */ jsx98(
            "button",
            {
              onClick: onClose,
              className: "rounded p-1.5 text-secondary hover:bg-inset hover:text-primary",
              children: /* @__PURE__ */ jsx98(X6, { className: "h-5 w-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs57("div", { className: "flex-1 overflow-auto", children: [
          /* @__PURE__ */ jsx98("div", { className: "border-b border-default p-4", children: left }),
          /* @__PURE__ */ jsxs57("div", { className: "border-b border-default", children: [
            /* @__PURE__ */ jsxs57(
              "button",
              {
                onClick: () => setAiCollapsed(!aiCollapsed),
                className: "flex w-full items-center justify-between bg-elevated px-4 py-3 text-left",
                children: [
                  /* @__PURE__ */ jsx98("span", { className: "font-medium text-primary", children: "AI Recommendations" }),
                  aiCollapsed ? /* @__PURE__ */ jsx98(ChevronDown4, { className: "h-[18px] w-[18px]" }) : /* @__PURE__ */ jsx98(ChevronUp3, { className: "h-[18px] w-[18px]" })
                ]
              }
            ),
            !aiCollapsed && /* @__PURE__ */ jsx98("div", { className: "p-4", children: right })
          ] }),
          /* @__PURE__ */ jsx98("div", { className: "p-4", children: center })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs57("div", { className: cn("flex h-full", className), children: [
    /* @__PURE__ */ jsx98("div", { className: "w-1/4 border-r border-default bg-elevated overflow-auto", children: left }),
    /* @__PURE__ */ jsx98("div", { className: "w-1/2 overflow-auto bg-canvas", children: center }),
    /* @__PURE__ */ jsx98("div", { className: "w-1/4 border-l border-default bg-elevated overflow-auto", children: right })
  ] });
}
FocusStudioLayout.displayName = "FocusStudioLayout";

// src/layouts/ShowroomManagerLayout.tsx
import { jsx as jsx99, jsxs as jsxs58 } from "react/jsx-runtime";
function ShowroomManagerLayout({
  left,
  right,
  mobileTabs,
  className
}) {
  return /* @__PURE__ */ jsxs58("div", { className: cn("w-full", className), children: [
    /* @__PURE__ */ jsx99("div", { className: "hidden lg:block", children: /* @__PURE__ */ jsxs58("div", { className: "grid grid-cols-12 gap-4", children: [
      /* @__PURE__ */ jsx99("div", { className: "col-span-5", children: left }),
      /* @__PURE__ */ jsx99("div", { className: "col-span-7", children: right })
    ] }) }),
    /* @__PURE__ */ jsxs58("div", { className: "lg:hidden space-y-3", children: [
      mobileTabs,
      /* @__PURE__ */ jsx99("div", { children: left })
    ] })
  ] });
}

// src/components/VehicleCard.tsx
import { jsx as jsx100, jsxs as jsxs59 } from "react/jsx-runtime";
function VehicleCard({
  vehicle,
  loading,
  onOpenQuickView,
  className
}) {
  if (loading) {
    return /* @__PURE__ */ jsxs59(Card, { variant: "outline", className: "bg-surface-subtle", children: [
      /* @__PURE__ */ jsx100(CardHeader2, { children: /* @__PURE__ */ jsx100(CardTitle, { children: /* @__PURE__ */ jsx100(Skeleton, { className: "h-5 w-40" }) }) }),
      /* @__PURE__ */ jsxs59(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsx100(Skeleton, { className: "h-4 w-64" }),
        /* @__PURE__ */ jsx100(Skeleton, { className: "h-4 w-52" }),
        /* @__PURE__ */ jsx100(Skeleton, { className: "h-4 w-36" })
      ] })
    ] });
  }
  if (!vehicle) return null;
  const title = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ");
  const subtitle = [
    vehicle.stock ? `Stock ${vehicle.stock}` : null,
    vehicle.vin ? vehicle.vin.slice(-6).toUpperCase() : null
  ].filter(Boolean).join(" \u2022 ");
  return /* @__PURE__ */ jsxs59(
    Card,
    {
      hover: !!onOpenQuickView,
      className: cn("ui-elev-1 hover:ui-elev-2 transition-shadow", className),
      onClick: () => onOpenQuickView?.(vehicle.id),
      children: [
        /* @__PURE__ */ jsxs59(CardHeader2, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsx100(CardTitle, { className: "truncate", children: title }),
          vehicle.demandTag && /* @__PURE__ */ jsxs59(
            Badge,
            {
              variant: vehicle.demandTag === "High" ? "success" : vehicle.demandTag === "Low" ? "error" : "secondary",
              children: [
                vehicle.demandTag,
                " demand"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs59(CardContent, { className: "text-sm text-text-secondary space-y-2", children: [
          /* @__PURE__ */ jsxs59("div", { className: "flex gap-3 flex-wrap", children: [
            vehicle.miles != null && /* @__PURE__ */ jsxs59("span", { className: "tabular-nums", children: [
              vehicle.miles.toLocaleString(),
              " mi"
            ] }),
            vehicle.daysInStock != null && /* @__PURE__ */ jsxs59("span", { className: "tabular-nums", children: [
              vehicle.daysInStock,
              " days"
            ] }),
            vehicle.price != null && /* @__PURE__ */ jsxs59("span", { className: "tabular-nums", children: [
              "$",
              vehicle.price.toLocaleString()
            ] }),
            vehicle.grossHint != null && /* @__PURE__ */ jsxs59("span", { className: "tabular-nums", children: [
              "~$",
              vehicle.grossHint.toLocaleString(),
              " gross"
            ] })
          ] }),
          subtitle && /* @__PURE__ */ jsx100("div", { className: "text-xs text-text-tertiary", children: subtitle })
        ] })
      ]
    }
  );
}

// src/components/CustomerCard.tsx
import { jsx as jsx101, jsxs as jsxs60 } from "react/jsx-runtime";
function CustomerCard({
  customer,
  loading,
  className
}) {
  if (loading) {
    return /* @__PURE__ */ jsxs60(Card, { variant: "outline", className, children: [
      /* @__PURE__ */ jsx101(CardHeader2, { children: /* @__PURE__ */ jsx101(CardTitle, { children: /* @__PURE__ */ jsx101(Skeleton, { className: "h-5 w-40" }) }) }),
      /* @__PURE__ */ jsxs60(CardContent, { className: "space-y-2", children: [
        /* @__PURE__ */ jsx101(Skeleton, { className: "h-4 w-64" }),
        /* @__PURE__ */ jsx101(Skeleton, { className: "h-4 w-40" })
      ] })
    ] });
  }
  if (!customer) return null;
  const redacted = customer.privacy?.hasPII;
  const contact = [
    redacted ? "Phone: \u2022\u2022\u2022\u2022" : customer.phone,
    redacted ? "Email: \u2022\u2022\u2022\u2022" : customer.email
  ].filter(Boolean).join(" \u2022 ");
  return /* @__PURE__ */ jsxs60(Card, { hover: true, className: `ui-elev-1 hover:ui-elev-2 transition-shadow ${className}`, children: [
    /* @__PURE__ */ jsxs60(CardHeader2, { className: "flex flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsx101(CardTitle, { className: "truncate", children: customer.name }),
      customer.score != null && /* @__PURE__ */ jsxs60(
        Badge,
        {
          variant: customer.score >= 75 ? "success" : customer.score >= 40 ? "warning" : "secondary",
          children: [
            "Score ",
            customer.score
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs60(CardContent, { className: "text-sm text-text-secondary space-y-1", children: [
      contact && /* @__PURE__ */ jsx101("div", { className: "truncate", children: contact }),
      customer.lastTouch && /* @__PURE__ */ jsxs60("div", { className: "text-xs text-text-tertiary", children: [
        "Last touch: ",
        new Date(customer.lastTouch).toLocaleString()
      ] })
    ] })
  ] });
}

// src/components/QuickView.tsx
import { jsx as jsx102 } from "react/jsx-runtime";
function QuickView({ id, type, className }) {
  return /* @__PURE__ */ jsx102(
    "div",
    {
      "data-quickview-id": id,
      "data-quickview-type": type,
      className: `hidden ${className || ""}`
    }
  );
}

// src/components/widgets/InsightCard.tsx
import { cva as cva43 } from "class-variance-authority";
import { jsx as jsx103, jsxs as jsxs61 } from "react/jsx-runtime";
var insightCardVariants = cva43(
  "rounded-lg border p-4 transition-smooth",
  {
    variants: {
      severity: {
        critical: "border-status-error bg-status-error/5",
        high: "border-status-warning bg-status-warning/5",
        normal: "border-border-base bg-surface-elevated",
        low: "border-border-subtle bg-surface-base"
      }
    },
    defaultVariants: {
      severity: "normal"
    }
  }
);
function InsightCard({ insight, severity, onAction, className }) {
  const handleAction = () => {
    if (insight.quickAction && onAction) {
      onAction(insight.quickAction.action, insight.quickAction.params);
    }
  };
  return /* @__PURE__ */ jsx103("div", { className: cn(insightCardVariants({ severity: severity || insight.severity }), className), children: /* @__PURE__ */ jsxs61("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs61("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx103("p", { className: "text-sm font-medium text-text-primary", children: insight.summary }),
      /* @__PURE__ */ jsxs61("p", { className: "text-xs text-text-secondary mt-1", children: [
        insight.entityRef.type,
        " \u2022 ",
        insight.entityRef.id.slice(0, 8)
      ] })
    ] }),
    insight.quickAction && /* @__PURE__ */ jsx103(
      "button",
      {
        onClick: handleAction,
        className: "text-xs font-medium text-accent-primary hover:text-accent-primary-hover",
        children: insight.quickAction.label
      }
    )
  ] }) });
}

// src/components/widgets/InsightList.tsx
import { jsx as jsx104 } from "react/jsx-runtime";
function InsightList({ insights, onAction, emptyMessage = "No insights" }) {
  if (insights.length === 0) {
    return /* @__PURE__ */ jsx104("div", { className: "text-center py-8 text-text-secondary text-sm", children: emptyMessage });
  }
  return /* @__PURE__ */ jsx104("div", { className: "space-y-2", children: insights.map((insight) => /* @__PURE__ */ jsx104(
    InsightCard,
    {
      insight,
      onAction
    },
    insight.id
  )) });
}

// src/components/widgets/StatusPulse.tsx
import { cva as cva44 } from "class-variance-authority";
import { jsx as jsx105, jsxs as jsxs62 } from "react/jsx-runtime";
var statusPulseVariants = cva44(
  "inline-flex items-center gap-2 text-xs font-medium",
  {
    variants: {
      status: {
        critical: "text-status-error",
        high: "text-status-warning",
        normal: "text-text-primary",
        low: "text-text-secondary",
        success: "text-status-success"
      }
    },
    defaultVariants: {
      status: "normal"
    }
  }
);
var pulseIndicatorVariants = cva44(
  "w-2 h-2 rounded-full animate-pulse",
  {
    variants: {
      status: {
        critical: "bg-status-error",
        high: "bg-status-warning",
        normal: "bg-accent-primary",
        low: "bg-text-tertiary",
        success: "bg-status-success"
      }
    }
  }
);
function StatusPulse({ status, label, count: count3, className }) {
  return /* @__PURE__ */ jsxs62("div", { className: cn(statusPulseVariants({ status }), className), children: [
    /* @__PURE__ */ jsx105("span", { className: pulseIndicatorVariants({ status }) }),
    /* @__PURE__ */ jsxs62("span", { children: [
      label,
      count3 !== void 0 && /* @__PURE__ */ jsxs62("span", { className: "ml-1", children: [
        "(",
        count3,
        ")"
      ] })
    ] })
  ] });
}

// src/hooks/useMobile.ts
import { useState as useState35, useEffect as useEffect34 } from "react";
var BREAKPOINTS2 = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1920
};
function useMobile(breakpoint = "tablet") {
  const [isMobile, setIsMobile] = useState35(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < BREAKPOINTS2[breakpoint];
  });
  useEffect34(() => {
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
  const [breakpoint, setBreakpoint] = useState35(() => {
    if (typeof window === "undefined") return "desktop";
    const width = window.innerWidth;
    if (width >= BREAKPOINTS2.ultrawide) return "ultrawide";
    if (width >= BREAKPOINTS2.wide) return "wide";
    if (width >= BREAKPOINTS2.desktop) return "desktop";
    if (width >= BREAKPOINTS2.tablet) return "tablet";
    return "mobile";
  });
  useEffect34(() => {
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
  const [viewport, setViewport] = useState35(() => {
    if (typeof window === "undefined") {
      return { width: 1024, height: 768 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  });
  useEffect34(() => {
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
  const [matches, setMatches] = useState35(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect34(() => {
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
  const [isTouch, setIsTouch] = useState35(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });
  useEffect34(() => {
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
    if (values[fallbackBreakpoint] !== void 0) {
      return values[fallbackBreakpoint];
    }
  }
  return void 0;
}

// src/hooks/useTheme.ts
import { useState as useState36, useEffect as useEffect35, useCallback as useCallback16 } from "react";
import {
  getTheme,
  setTheme as setThemeToken,
  watchSystemTheme
} from "@repo/tokens";
function useTheme() {
  const [theme, setThemeState] = useState36(() => getTheme());
  const [systemTheme, setSystemTheme] = useState36("light");
  useEffect35(() => {
    const currentTheme = getTheme();
    setThemeState(currentTheme);
    const unsubscribe = watchSystemTheme((newTheme) => {
      setSystemTheme(newTheme);
    });
    return unsubscribe;
  }, []);
  const setTheme = useCallback16((newTheme) => {
    setThemeToken(newTheme);
    setThemeState(newTheme);
  }, []);
  const toggleTheme = useCallback16(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [theme, setTheme]);
  return {
    theme,
    setTheme,
    toggleTheme,
    systemTheme,
    isDark: theme === "dark" || theme === "automotive",
    isLight: theme === "light",
    isHighContrast: theme === "high-contrast"
  };
}
function usePrefersDarkMode() {
  const [prefersDark, setPrefersDark] = useState36(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect35(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setPrefersDark(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);
  return prefersDark;
}
function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState36(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect35(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e) => {
      setPrefersReduced(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);
  return prefersReduced;
}

// src/hooks/useColorContrast.ts
import { useMemo as useMemo5 } from "react";
function useColorContrast({
  foreground,
  background,
  minRatio = 4.5
}) {
  const result = useMemo5(() => checkContrast(foreground, background), [foreground, background]);
  const suggestedForeground = useMemo5(() => getSuggestedForeground(background), [background]);
  const isDarkBackground = useMemo5(() => isDark(background), [background]);
  const isAccessible = useMemo5(() => result.ratio >= minRatio, [result.ratio, minRatio]);
  return {
    result,
    isAccessible,
    suggestedForeground,
    isDarkBackground
  };
}
function useAccessibleForeground(background) {
  return useMemo5(() => getSuggestedForeground(background), [background]);
}

// src/index.ts
var styles = "@repo/ui/styles.css";
export {
  Accordion,
  Alert,
  AlertDescription,
  AlertDialog2 as AlertDialog,
  AlertDialogAction2 as AlertDialogAction,
  AlertDialogCancel2 as AlertDialogCancel,
  AlertDialogContent2 as AlertDialogContent,
  AlertDialogDescription2 as AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay2 as AlertDialogOverlay,
  AlertDialogPortal2 as AlertDialogPortal,
  AlertDialogTitle2 as AlertDialogTitle,
  AlertDialogTrigger2 as AlertDialogTrigger,
  AlertTitle,
  AppAside,
  AppFooter,
  AppHeader,
  AppMain,
  AppShell,
  AuthProvider,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Box,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader2 as CardHeader,
  CardShell,
  CardTitle,
  Checkbox,
  Collapse,
  Collapsible2 as Collapsible,
  CollapsibleContent2 as CollapsibleContent,
  CollapsibleSection,
  CollapsibleTrigger2 as CollapsibleTrigger,
  ColorContrastChecker,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  CustomerCard,
  Dialog2 as Dialog,
  DialogClose2 as DialogClose,
  DialogContent2 as DialogContent,
  DialogDescription2 as DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay2 as DialogOverlay,
  DialogPortal2 as DialogPortal,
  DialogTitle2 as DialogTitle,
  DialogTrigger2 as DialogTrigger,
  Dropdown,
  DropdownMenu2 as DropdownMenu,
  DropdownMenuCheckboxItem2 as DropdownMenuCheckboxItem,
  DropdownMenuContent2 as DropdownMenuContent,
  DropdownMenuGroup2 as DropdownMenuGroup,
  DropdownMenuItem2 as DropdownMenuItem,
  DropdownMenuLabel2 as DropdownMenuLabel,
  DropdownMenuPortal2 as DropdownMenuPortal,
  DropdownMenuRadioGroup2 as DropdownMenuRadioGroup,
  DropdownMenuRadioItem2 as DropdownMenuRadioItem,
  DropdownMenuSeparator2 as DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub2 as DropdownMenuSub,
  DropdownMenuSubContent2 as DropdownMenuSubContent,
  DropdownMenuSubTrigger2 as DropdownMenuSubTrigger,
  DropdownMenuTrigger2 as DropdownMenuTrigger,
  EmptyState,
  ErrorBoundary,
  FeatureFlag,
  FeatureFlagProvider,
  FeatureFlagSwitch,
  FocusStudioLayout,
  FocusTrap,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FullDensityLayout,
  Inline,
  Input,
  InsightCard,
  InsightList,
  IntelligentSearch,
  Label2 as Label,
  Lane,
  LaneBoard,
  LaneCard,
  LaneCardBadge,
  LaneCardContent,
  LaneCardDescription,
  LaneCardFooter,
  LaneCardHeader,
  LaneCardTitle,
  ListCard,
  ListDetailLayout,
  LoadingBoundary,
  Skeleton2 as LoadingSkeleton,
  MetricCard,
  MobileCard,
  MobileListItem,
  Modal,
  MultiFeatureFlag,
  Notes,
  PageContainer,
  PageHeader,
  Pagination,
  PermissionGate,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
  Progress,
  QuickAction,
  QuickView,
  FormField2 as RHFFormField,
  Radio,
  RadioGroup,
  RadioGroupItem,
  PopoverRoot as RadixPopover,
  SelectRoot as RadixSelect,
  TooltipRoot as RadixTooltip,
  ResponsiveActions,
  ResponsiveButton,
  ResponsiveGrid,
  Restricted,
  RoleGuard,
  ScrollArea2 as ScrollArea,
  ScrollBar,
  SearchInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator2 as Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
  ShowroomManagerLayout,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  Skeleton,
  SkipLink,
  SkipLinks,
  Slider,
  Stack,
  StatCard,
  StatusPulse,
  Stepper,
  Surface,
  SuspenseBoundary,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TenantSwitcher,
  Text,
  Textarea,
  Toast,
  ToastProvider,
  Toaster,
  Toggle2 as Toggle,
  ToggleGroup2 as ToggleGroup,
  ToggleGroupItem2 as ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TrendCard,
  BREAKPOINTS as UI_BREAKPOINTS,
  UniformShell,
  VehicleCard,
  VisuallyHidden,
  accordionVariants,
  alertVariants,
  avatarVariants,
  badgeVariants,
  boxVariants,
  breadcrumbItemVariants,
  breadcrumbVariants,
  buttonVariants,
  cardShellVariants,
  cardVariants,
  checkContrast,
  checkboxVariants,
  cn,
  dropdownContentVariants,
  dropdownItemVariants,
  formDescriptionVariants,
  formFieldVariants,
  getComplianceLevel,
  getContrastRatio,
  getSuggestedForeground,
  inlineVariants,
  inputVariants,
  isDark,
  labelVariants,
  metricVariants,
  modalContentVariants,
  modalOverlayVariants,
  notesVariants,
  paginationButtonVariants,
  paginationVariants,
  popoverArrowVariants,
  popoverContentVariants,
  progressBarVariants,
  progressVariants,
  radioVariants,
  selectVariants,
  sheetContentVariants,
  sheetOverlayVariants,
  skeletonVariants,
  stackVariants,
  statCardVariants,
  styles,
  surfaceVariants,
  switchVariants,
  tableVariants,
  textVariants,
  textareaVariants,
  toastVariants,
  toggleVariants,
  tooltipVariants,
  useAccessibleForeground,
  useAuth,
  useBreakpoint,
  useBreakpointDown,
  useBreakpointUp,
  useColorContrast,
  useDesktopBreakpoint,
  useErrorHandler,
  useFeatureFlag,
  useFeatureFlags,
  useFormField,
  useMediaQuery,
  useMobile,
  useMobileBreakpoint,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  useResponsiveValue,
  useTabletBreakpoint,
  useTheme,
  useToast,
  useTouchDevice,
  useViewport,
  withErrorBoundary,
  withFeatureFlag,
  withLoadingBoundary,
  withPermissionGate,
  withRoleGuard
};
//# sourceMappingURL=index.js.map