# Notes Component - Quick Reference Guide

## Overview

The **Notes** component is a context-aware note-taking system that automatically saves notes to the right place based on where it's used in your application.

### Key Features

✅ **Context-Aware**: Automatically attaches notes to the correct entity (customer, appraisal, deal, etc.)
✅ **Auto-Save**: Debounced auto-save with visual status indicators
✅ **Timeline Integration**: Customer/lead notes appear in timeline/history
✅ **Appraisal Notes**: Stay with the appraisal record (not customer timeline)
✅ **Private Notes**: Only visible to the creator
✅ **Character Count**: Shows progress toward max length
✅ **Tags**: Categorize notes for better organization
✅ **Save Status**: Real-time saving/saved/error indicators

---

## Quick Start

```tsx
import { Notes } from '@repo/ui';

// In a customer page
<Notes
  context="customer"
  entityId={customerId}
  onSave={handleSave}
  userId="current-user-id"
  userName="John Doe"
/>
```

---

## Context Types

| Context | Where Notes Appear | Use Case |
|---------|-------------------|----------|
| `customer` | Customer timeline/history | General customer notes |
| `showroom` | Customer timeline/history | Showroom manager notes |
| `appraisal` | **Stays with appraisal** | Trade-in condition notes |
| `deal` | Deal history | Negotiation notes |
| `vehicle` | Vehicle record | Inventory notes |
| `lead` | Lead timeline | Lead qualification notes |
| `service` | Service order | Service RO notes |
| `standalone` | Generic entity | Custom use cases |

---

## Common Use Cases

### 1. Customer Page - Timeline Notes

```tsx
<Notes
  context="customer"
  entityId={customerId}
  onSave={async (note) => {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...note, customerId }),
    });
  }}
  userId="user-123"
  userName="Sales Rep"
  height="md"
/>
```

**Result**: Note appears in customer timeline ✅

---

### 2. Appraisal Page - Notes Stay With Appraisal

```tsx
<Notes
  context="appraisal"
  entityId={appraisalId}
  onSave={async (note) => {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...note, appraisalId }),
    });
  }}
  userId="user-456"
  userName="Appraiser"
  height="lg"
  tags={['exterior', 'condition']}
  placeholder="Document exterior condition, paint, damage..."
/>
```

**Result**: Note stays with THIS appraisal only ✅
**Does NOT** appear in customer timeline ❌

---

### 3. Showroom Manager - Also Goes to Timeline

```tsx
<Notes
  context="showroom"
  entityId={customerId}
  onSave={async (note) => {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...note, customerId }),
    });
  }}
  userId="user-789"
  userName="Showroom Manager"
/>
```

**Result**: Note appears in customer timeline ✅

---

### 4. Private Notes

```tsx
<Notes
  context="customer"
  entityId={customerId}
  isPrivate={true}
  onSave={handleSave}
  userId="user-123"
  userName="Manager"
/>
```

**Result**: Only you can see this note 🔒

---

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `context` | `NoteContext` | ✅ | Where the note is saved |
| `entityId` | `string` | ✅ | ID of the entity (customerId, appraisalId, etc.) |
| `onSave` | `(note: Note) => void` | ✅ | Callback when note is saved |
| `userId` | `string` | ❌ | Current user ID |
| `userName` | `string` | ❌ | Current user name |
| `value` | `string` | ❌ | Initial note content |
| `onChange` | `(content: string) => void` | ❌ | Callback on content change |
| `autoSaveDelay` | `number` | ❌ | Auto-save delay in ms (default: 2000) |
| `isPrivate` | `boolean` | ❌ | Make note private (default: false) |
| `tags` | `string[]` | ❌ | Tags for categorization |
| `height` | `'sm' \| 'md' \| 'lg' \| 'xl'` | ❌ | Textarea height |
| `showCharacterCount` | `boolean` | ❌ | Show character counter (default: true) |
| `showSaveStatus` | `boolean` | ❌ | Show save status (default: true) |
| `maxLength` | `number` | ❌ | Max characters (default: 5000) |

---

## API Integration

### Create a Note (POST /api/notes)

```typescript
const response = await fetch('/api/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: "Customer is interested in F-150",
    context: "CUSTOMER",
    entityId: "cust-123",
    customerId: "cust-123", // For timeline
    isPrivate: false,
    tags: ["interest", "truck"],
  }),
});
```

### Get Notes (GET /api/notes)

```typescript
// Get all customer notes
const response = await fetch(
  `/api/notes?context=CUSTOMER&entityId=${customerId}&includePrivate=true`
);
const notes = await response.json();

// Get appraisal notes with specific tags
const response = await fetch(
  `/api/notes?context=APPRAISAL&entityId=${appraisalId}&tags=exterior,interior`
);
```

---

## Database Schema

```prisma
model Note {
  id          String   @id @default(cuid())
  tenantId    String
  content     String   @db.Text
  context     NoteContext
  entityId    String
  entityType  String?

  // Optional relationships
  customerId   String?
  appraisalId  String?
  dealId       String?
  vehicleId    String?
  leadId       String?

  isPrivate    Boolean  @default(false)
  tags         String[] @default([])
  createdBy    String
  createdByName String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum NoteContext {
  CUSTOMER
  SHOWROOM
  APPRAISAL
  DEAL
  VEHICLE
  LEAD
  SERVICE
  STANDALONE
}
```

---

## Complete Example: Appraisal Page

```tsx
function AppraisalPage({ appraisalId }: { appraisalId: string }) {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Trade-In Appraisal</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Exterior Notes */}
        <div>
          <h3 className="text-sm font-medium mb-2">Exterior Condition</h3>
          <Notes
            context="appraisal"
            entityId={appraisalId}
            onSave={async (note) => {
              await fetch('/api/notes', {
                method: 'POST',
                body: JSON.stringify({ ...note, appraisalId }),
              });
            }}
            userId="user-123"
            userName="Appraiser"
            height="lg"
            tags={['exterior']}
            placeholder="Document paint, body panels, trim..."
          />
        </div>

        {/* Interior Notes */}
        <div>
          <h3 className="text-sm font-medium mb-2">Interior Condition</h3>
          <Notes
            context="appraisal"
            entityId={appraisalId}
            onSave={async (note) => {
              await fetch('/api/notes', {
                method: 'POST',
                body: JSON.stringify({ ...note, appraisalId }),
              });
            }}
            userId="user-123"
            userName="Appraiser"
            height="lg"
            tags={['interior']}
            placeholder="Document seats, dashboard, carpets..."
          />
        </div>
      </div>

      <p className="text-xs text-text-tertiary">
        ✅ All notes above stay with THIS appraisal and appear on the appraisal report
      </p>
    </div>
  );
}
```

---

## Migration from Old Notes

If you have existing notes, add the `context` field:

```sql
-- Add context to existing notes
UPDATE notes
SET context =
  CASE
    WHEN customer_id IS NOT NULL THEN 'CUSTOMER'
    WHEN appraisal_id IS NOT NULL THEN 'APPRAISAL'
    WHEN deal_id IS NOT NULL THEN 'DEAL'
    WHEN vehicle_id IS NOT NULL THEN 'VEHICLE'
    ELSE 'STANDALONE'
  END;
```

---

## Tips & Best Practices

### ✅ DO

- Use `context="appraisal"` for trade-in condition notes
- Use `context="customer"` for sales interaction notes
- Use `context="showroom"` for showroom manager notes (also goes to timeline)
- Add meaningful tags for better filtering
- Use `isPrivate={true}` for sensitive manager notes

### ❌ DON'T

- Don't use `context="customer"` for appraisal notes (they'll clutter the timeline)
- Don't mix contexts - keep appraisal notes separate from customer history
- Don't forget to pass `entityId` - notes need to know what they belong to

---

## Auto-Save Behavior

The Notes component auto-saves after **2 seconds** of inactivity (configurable via `autoSaveDelay` prop):

1. User types → Timer starts
2. User stops typing → Timer counts down
3. 2 seconds pass → Note is saved
4. "Saved" indicator shows briefly
5. Process repeats on next change

**Manual Save**: Press `Ctrl/Cmd + S` (coming soon)

---

## Timeline Integration

Notes with `context="customer"`, `context="showroom"`, or `context="lead"` automatically create timeline events:

```typescript
// Timeline event created automatically
{
  eventType: "NOTE_ADDED",
  title: "Note added by Sales Rep",
  description: "Customer is interested in F-150...",
  metadata: {
    noteId: "note-123",
    context: "CUSTOMER",
    tags: ["interest"]
  }
}
```

---

## Support

For questions or issues, check:
- `apps/frontend/src/components/examples/NotesExamples.tsx` - Complete examples
- `packages/ui/src/components/Notes.tsx` - Component source
- `apps/backend/src/routes/notes.ts` - API implementation

---

**Created**: 2025-11-06
**Version**: 1.0.0
**Status**: ✅ Ready for Production
