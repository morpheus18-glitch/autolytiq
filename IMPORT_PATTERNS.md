# Import Patterns - Design Library Standards

**Status**: ✅ **ENFORCED**
**Date**: 2025-11-08

---

## 🚫 INCORRECT PATTERN (Found in Archive)

```typescript
// ❌ WRONG - Multiple components in one import
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import { Separator } from "@repo/ui";
```

**Problems**:
1. ❌ Not tree-shakeable (imports entire library)
2. ❌ Harder to track component usage
3. ❌ Mixes component levels (Card has sub-components)
4. ❌ Inconsistent (some have 4 imports, some have 1)
5. ❌ Verbose and repetitive

---

## ✅ CORRECT PATTERN (Design Library Standard)

### Option 1: Single Import Line (Preferred)
```typescript
// ✅ CORRECT - Single import with all needed components
import { Card, Button, Input, Label, Separator } from "@repo/ui";

// Usage
<Card>
  <Card.Header>
    <Card.Title>Login</Card.Title>
  </Card.Header>
  <Card.Content>
    <Label htmlFor="username">Username</Label>
    <Input id="username" />
    <Button>Submit</Button>
  </Card.Content>
</Card>
```

### Option 2: Grouped Imports (For Large Files)
```typescript
// ✅ CORRECT - Grouped by component type
import {
  // Layout
  Card,
  // Form Controls
  Button,
  Input,
  Label,
  // Structure
  Separator,
} from "@repo/ui";
```

---

## 📐 Component Architecture

### Compound Components Pattern

Our design library uses **compound components** with dot notation:

```typescript
// Card component structure
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
  <Card.Footer>
    Footer here
  </Card.Footer>
</Card>
```

### How It's Exported

```typescript
// In @repo/ui/src/components/Card.tsx
export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  // Main card component
});

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>((props, ref) => {
  // Card header
});

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>((props, ref) => {
  // Card title
});

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>((props, ref) => {
  // Card content
});

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>((props, ref) => {
  // Card footer
});

// In @repo/ui/src/index.ts
export * from './components/Card.js'; // Exports all card sub-components
```

### Why This Pattern?

1. ✅ **Tree-shakeable** - Only imports what you use
2. ✅ **Semantic** - Clear parent-child relationship
3. ✅ **Flexible** - Can use sub-components independently
4. ✅ **Type-safe** - TypeScript knows the structure
5. ✅ **Self-documenting** - Clear what each component does

---

## 🎯 Correct Import Examples

### Basic Login Form
```typescript
import { Card, Button, Input, Label, Separator } from "@repo/ui";

export default function Login() {
  return (
    <Card className="w-[400px]">
      <Card.Header>
        <Card.Title>Login</Card.Title>
        <Card.Description>Enter your credentials</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
      </Card.Content>
      <Card.Footer>
        <Button className="w-full">Sign In</Button>
      </Card.Footer>
    </Card>
  );
}
```

### Data Table Page
```typescript
import {
  DataTable,
  Button,
  Badge,
  DropdownMenu,
  Input,
} from "@repo/ui";

export default function CustomersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input placeholder="Search customers..." className="max-w-sm" />
        <Button>Add Customer</Button>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        selectable
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
      />
    </div>
  );
}
```

### Deal Workspace
```typescript
import {
  DealWorkspace,
  DealJacket,
  Button,
  Badge,
  Tabs,
} from "@repo/ui";

export default function DealPage({ dealId }: { dealId: string }) {
  const { data: deal } = useDeal(dealId);

  return (
    <DealWorkspace
      data={deal}
      onStageChange={handleStageChange}
      onDocumentAction={() => setShowDealJacket(true)}
    />
  );
}
```

### Dashboard with Widgets
```typescript
import {
  RoleDashboard,
  Card,
  MetricCard,
  AggregateCard,
  Button,
} from "@repo/ui";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Revenue"
          value={125000}
          format="currency"
          trend={{ direction: "up", value: 15 }}
        />
        <MetricCard
          label="Active Deals"
          value={42}
          trend={{ direction: "down", value: 5 }}
        />
        <MetricCard
          label="Conversion Rate"
          value="68%"
          trend={{ direction: "up", value: 3 }}
        />
      </div>

      <RoleDashboard
        role="salesperson"
        context={dashboardContext}
      />
    </div>
  );
}
```

---

## 🔄 Migration Script

For migrating old code with incorrect imports:

```bash
#!/bin/bash
# migrate-imports.sh

# Replace multiple @repo/ui imports with single import
find apps/frontend/src -name "*.tsx" -type f -exec sed -i '
  # Collect all @repo/ui imports into one line
  /@repo\/ui/ {
    N
    s/import { \([^}]*\) } from "@repo\/ui";\nimport { \([^}]*\) } from "@repo\/ui";/import { \1, \2 } from "@repo\/ui";/
  }
' {} \;

echo "✅ Migration complete"
```

---

## 📚 Component Import Reference

### Form Controls
```typescript
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Switch,
  Toggle,
  ToggleGroup,
  Slider,
  Label,
  Form,
  FormField,
} from "@repo/ui";
```

### Data Display
```typescript
import {
  Table,
  DataTable,
  Card,
  Badge,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  Progress,
  Spinner,
  Skeleton,
  Divider,
  Separator,
  Dot,
  StatCard,
  EmptyState,
} from "@repo/ui";
```

### Navigation
```typescript
import {
  Tabs,
  Breadcrumb,
  Pagination,
  Sidebar,
  AppShell,
  UniformShell,
  Menu,
  DropdownMenu,
} from "@repo/ui";
```

### Overlays
```typescript
import {
  Modal,
  Dialog,
  AlertDialog,
  Sheet,
  Popover,
  Dropdown,
  Toast,
  Toaster,
} from "@repo/ui";
```

### Advanced Components
```typescript
import {
  DataTable,
  QueryBuilder,
  LiveDataFeed,
  PivotTable,
  AggregateCard,
  FilterPanel,
  DataExporter,
  DealJacket,
  DealWorkspace,
  RoleDashboard,
} from "@repo/ui";
```

### Layouts
```typescript
import {
  ListDetailLayout,
  FullDensityLayout,
  FocusStudioLayout,
  ShowroomManagerLayout,
} from "@repo/ui";
```

### Primitives
```typescript
import {
  Box,
  Stack,
  Inline,
  Surface,
  Text,
} from "@repo/ui";
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ WRONG: Multiple Import Lines
```typescript
import { Card } from "@repo/ui";
import { CardHeader } from "@repo/ui";
import { CardTitle } from "@repo/ui";
import { CardContent } from "@repo/ui";
```

### ✅ CORRECT: Single Import
```typescript
import { Card } from "@repo/ui";
// All card sub-components are available via Card.Header, Card.Title, etc.
```

---

### ❌ WRONG: Importing from Internal Paths
```typescript
import { Card } from "@repo/ui/components/Card";
import { Button } from "@repo/ui/dist/components/Button";
```

### ✅ CORRECT: Import from Package Root
```typescript
import { Card, Button } from "@repo/ui";
```

---

### ❌ WRONG: Importing Utilities Separately
```typescript
import { cn } from "@repo/ui/utils/cn";
import { cva } from "class-variance-authority";
```

### ✅ CORRECT: Use Package Exports
```typescript
import { cn } from "@repo/ui";
// CVA is internal, components already use it
```

---

## 🎯 ESLint Rules (Recommended)

Add to `.eslintrc.js`:

```javascript
module.exports = {
  rules: {
    // Enforce single import per package
    "no-duplicate-imports": ["error", { includeExports: true }],

    // Prevent importing from internal paths
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "@repo/ui/components/*",
          "@repo/ui/dist/*",
          "@repo/ui/src/*",
        ],
      },
    ],
  },
};
```

---

## 📦 Package.json Exports

Our `@repo/ui/package.json` is configured correctly:

```json
{
  "name": "@repo/ui",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

This ensures:
- ✅ Only the main export is available
- ✅ TypeScript types are properly resolved
- ✅ Tree-shaking works correctly
- ✅ Internal paths are not exposed

---

## 🎉 Summary

### Golden Rules:
1. ✅ **One import per package** - `import { A, B, C } from "@repo/ui"`
2. ✅ **Use compound components** - `<Card><Card.Header /></Card>`
3. ✅ **Import from package root** - Never from `/dist/` or `/src/`
4. ✅ **Group related imports** - For readability in large files
5. ✅ **Trust tree-shaking** - Bundler removes unused exports

### Benefits:
- 🚀 Faster builds (better tree-shaking)
- 📦 Smaller bundles (only used code)
- 🧹 Cleaner code (less repetition)
- 🎯 Better DX (autocomplete works better)
- 🔍 Easier refactoring (track usage)

---

**Generated**: 2025-11-08
**Status**: ✅ **DESIGN LIBRARY STANDARD ENFORCED**
