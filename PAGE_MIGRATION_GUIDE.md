# Page Migration Guide - Mobile-First Components

## 🎯 Goal
Migrate all pages to use mobile-first components from `@repo/ui` with design tokens.

## 📊 Status

**Total Pages**: ~152
**Need Migration**: 30 pages with hardcoded colors/spacing
**Completed**: chart-of-accounts.tsx (example)

## 🔧 Migration Pattern

### Before (Old Pattern)
```tsx
export default function MyPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
          <p className="text-gray-600">Description</p>
        </div>
        <div className="flex gap-2">
          <Button><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button><Plus className="h-4 w-4 mr-2" />Add</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map(metric => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <Badge className="bg-green-100 text-green-800">{metric.label}</Badge>
              <p className="text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### After (New Pattern)
```tsx
import { 
  PageContainer, 
  PageHeader, 
  ResponsiveGrid, 
  ResponsiveButton,
  ResponsiveActions,
  Card,
  CardContent,
  Badge
} from '@repo/ui';

export default function MyPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Page Title"
        description="Description"
        icon={<Icon className="h-6 w-6" />}
        actions={
          <ResponsiveActions>
            <ResponsiveButton icon={<Download className="h-4 w-4" />} text="Export" variant="outline" />
            <ResponsiveButton icon={<Plus className="h-4 w-4" />} text="Add" />
          </ResponsiveActions>
        }
      />

      <ResponsiveGrid cols={4} mobileCols={2}>
        {metrics.map(metric => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <Badge className="bg-[rgb(var(--success)_/_0.15)] text-[rgb(var(--success))]">
                {metric.label}
              </Badge>
              <p className="text-2xl font-bold text-text-primary">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </ResponsiveGrid>
    </PageContainer>
  );
}
```

## 📝 Search & Replace Patterns

### 1. Container
```bash
# Find
<div className="p-6 space-y-6 bg-gray-50">

# Replace with
<PageContainer>
```

### 2. Header
```bash
# Find
<div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    <p className="text-gray-600">{description}</p>
  </div>
  <div className="flex gap-2">
    {buttons}
  </div>
</div>

# Replace with
<PageHeader
  title={title}
  description={description}
  icon={icon}
  actions={<ResponsiveActions>{buttons}</ResponsiveActions>}
/>
```

### 3. Grids
```bash
# Find
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

# Replace with
<ResponsiveGrid cols={4} mobileCols={2}>
```

### 4. Buttons
```bash
# Find
<Button><Icon className="h-4 w-4 mr-2" />Text</Button>

# Replace with
<ResponsiveButton icon={<Icon className="h-4 w-4" />} text="Text" />
```

### 5. Colors (Design Tokens)
```bash
# Success/Green
bg-green-100 text-green-800 → bg-[rgb(var(--success)_/_0.15)] text-[rgb(var(--success))]

# Error/Red  
bg-red-100 text-red-800 → bg-[rgb(var(--error)_/_0.15)] text-[rgb(var(--error))]

# Primary/Blue
bg-blue-100 text-blue-800 → bg-[rgb(var(--action-primary)_/_0.15)] text-[rgb(var(--action-primary))]

# Warning/Orange
bg-orange-100 text-orange-800 → bg-[rgb(var(--warning)_/_0.15)] text-[rgb(var(--warning))]

# Accent/Purple
bg-purple-100 text-purple-800 → bg-[rgb(var(--accent-primary)_/_0.15)] text-[rgb(var(--accent-primary))]

# Text
text-gray-900 → text-text-primary
text-gray-600 → text-text-secondary
text-gray-400 → text-text-tertiary

# Backgrounds
bg-gray-50 → (remove, use PageContainer)
bg-gray-100 → bg-surface-inset
bg-white → bg-surface-elevated
```

## 🚀 Automated Migration Script

```bash
#!/bin/bash

PAGE=$1

if [ -z "$PAGE" ]; then
  echo "Usage: ./migrate-page.sh <path-to-page.tsx>"
  exit 1
fi

echo "🔄 Migrating $PAGE..."

# Add imports
sed -i '1 i\import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveButton, ResponsiveActions } from "@repo/ui";' "$PAGE"

# Replace container
sed -i 's/<div className="p-6 space-y-6 bg-gray-50">/<PageContainer>/g' "$PAGE"
sed -i 's/<div className="p-6 space-y-6">/<PageContainer>/g' "$PAGE"

# Replace grids
sed -i 's/grid grid-cols-1 md:grid-cols-2/ResponsiveGrid cols={2} mobileCols={1}/g' "$PAGE"
sed -i 's/grid grid-cols-1 md:grid-cols-3/ResponsiveGrid cols={3} mobileCols={1}/g' "$PAGE"
sed -i 's/grid grid-cols-1 md:grid-cols-4/ResponsiveGrid cols={4} mobileCols={2}/g' "$PAGE"
sed -i 's/grid grid-cols-1 md:grid-cols-5/ResponsiveGrid cols={5} mobileCols={2}/g' "$PAGE"

# Replace colors
sed -i 's/bg-green-100 text-green-800/bg-[rgb(var(--success)_\/_0.15)] text-[rgb(var(--success))]/g' "$PAGE"
sed -i 's/bg-red-100 text-red-800/bg-[rgb(var(--error)_\/_0.15)] text-[rgb(var(--error))]/g' "$PAGE"
sed -i 's/bg-blue-100 text-blue-800/bg-[rgb(var(--action-primary)_\/_0.15)] text-[rgb(var(--action-primary))]/g' "$PAGE"
sed -i 's/bg-orange-100 text-orange-800/bg-[rgb(var(--warning)_\/_0.15)] text-[rgb(var(--warning))]/g' "$PAGE"
sed -i 's/bg-purple-100 text-purple-800/bg-[rgb(var(--accent-primary)_\/_0.15)] text-[rgb(var(--accent-primary))]/g' "$PAGE"

# Replace text colors
sed -i 's/text-gray-900/text-text-primary/g' "$PAGE"
sed -i 's/text-gray-800/text-text-primary/g' "$PAGE"
sed -i 's/text-gray-600/text-text-secondary/g' "$PAGE"
sed -i 's/text-gray-500/text-text-secondary/g' "$PAGE"
sed -i 's/text-gray-400/text-text-tertiary/g' "$PAGE"

echo "✅ Migration complete! Manual review needed for:"
echo "  - PageHeader conversion"
echo "  - ResponsiveButton conversion"
echo "  - Table responsive classes"
```

## 📋 Pages Needing Migration (Priority Order)

### High Traffic (Do First)
1. `/leads/lead-management.tsx`
2. `/leads/LeadsDashboard.tsx`
3. `/accounting/transactions.tsx` ← Next to fix
4. `/accounting/accounting-dashboard.tsx`
5. `/inventory/lot-management.tsx`
6. `/deals/deal-desk.tsx`
7. `/crm/lead-pipeline.tsx`
8. `/search.tsx`

### Medium Priority
9. `/accounting/deal-finalization.tsx`
10. `/accounting/finance-reserves.tsx`
11. `/accounting/reports.tsx`
12. `/accounting/vehicle-profit.tsx`
13. `/accounting/monthly-close.tsx`
14. `/finance/finance-reports.tsx` ← User reported
15. `/communications.tsx`
16. `/customers/detail.tsx`

### Lower Priority
17-30. Other pages (see full list above)

## ✅ Checklist Per Page

- [ ] Import mobile components from `@repo/ui`
- [ ] Replace `<div className="p-6...">` with `<PageContainer>`
- [ ] Replace header with `<PageHeader>` component
- [ ] Replace grids with `<ResponsiveGrid>`
- [ ] Replace buttons with `<ResponsiveButton>`
- [ ] Replace hardcoded colors with design tokens
- [ ] Replace `text-gray-*` with `text-text-*`
- [ ] Add mobile table optimizations (hidden columns)
- [ ] Test on mobile (< 768px width)
- [ ] Test in dark mode

## 🎨 Design Token Reference

```tsx
// Success (Green)
bg-[rgb(var(--success)_/_0.15)] text-[rgb(var(--success))]

// Error (Red)
bg-[rgb(var(--error)_/_0.15)] text-[rgb(var(--error))]

// Primary (Blue)
bg-[rgb(var(--action-primary)_/_0.15)] text-[rgb(var(--action-primary))]

// Warning (Orange/Yellow)
bg-[rgb(var(--warning)_/_0.15)] text-[rgb(var(--warning))]

// Accent (Purple)
bg-[rgb(var(--accent-primary)_/_0.15)] text-[rgb(var(--accent-primary))]

// Text
text-text-primary    // Main text (gray-900 light, gray-100 dark)
text-text-secondary  // Secondary text (gray-600 light, gray-400 dark)
text-text-tertiary   // Tertiary text (gray-400 light, gray-600 dark)

// Backgrounds
bg-surface-base      // Page background
bg-surface-elevated  // Card background
bg-surface-inset     // Input/inset background

// Borders
border-border-base   // Default borders
```

## 📚 Examples

See completed migrations:
- `/accounting/chart-of-accounts.tsx` - Full example with all patterns
- `MOBILE_COMPONENTS_GUIDE.md` - Component documentation

---

**Next Steps**:
1. Run migration script on high-priority pages
2. Manual review and fix PageHeader/ResponsiveButton
3. Test each page on mobile
4. Commit batch of 5-10 pages at a time
