# Custom Permissions System Implementation

## Overview

This document describes the implementation of a fully custom, flexible permissions system that replaces the previous role-level (1-6) approach. The new system supports:

- **Granular permissions** - Individual permission flags for fine-grained access control
- **Role presets** - Predefined permission bundles for common job roles
- **Tenant-level customization** - Each tenant can create custom role presets
- **Per-user overrides** - Users can have custom permissions in addition to their role preset
- **Modern UI** - Enhanced login page and comprehensive permission management interfaces

## Architecture

### Database Schema

#### New Models

1. **PermissionDefinition** - System-wide permission catalog
   - `code`: Unique permission identifier (e.g., "deals.view")
   - `name`: Display name
   - `description`: What the permission grants
   - `category`: Permission grouping (customers, deals, leads, etc.)
   - `isActive`: Enable/disable permissions

2. **RolePreset** - Tenant-specific role templates
   - `tenantId`: Owner tenant
   - `name`: Role name (e.g., "Sales Manager")
   - `description`: Role description
   - `permissions`: Array of permission codes
   - `isSystem`: Whether it's a built-in preset
   - `isActive`: Enable/disable role

#### Updated Models

**User Model** - Enhanced with:
- `rolePresetId`: Reference to assigned role preset
- `customPermissions`: Additional permissions beyond role preset

### Permission Structure

Permissions follow a hierarchical naming convention: `<category>.<action>`

Example categories and permissions:

```
customers.*           # All customer permissions
  customers.view      # View customer data
  customers.create    # Create new customers
  customers.edit      # Edit customer data
  customers.delete    # Delete customers

deals.*              # All deal permissions
  deals.view         # View deals
  deals.create       # Create deals
  deals.approve      # Approve deals
  deals.viewPricing  # View pricing details
  deals.editPricing  # Edit pricing details

users.*              # All user management
  users.view         # View users
  users.edit         # Edit users
  users.managePermissions  # Manage user permissions
```

### Backend Implementation

#### Authorization Utilities (`apps/backend/src/utils/authz.ts`)

**New Functions:**
- `hasPermission(req, permission)` - Check if user has specific permission
- `hasAnyPermission(req, permissions)` - Check if user has any of the permissions
- `hasAllPermissions(req, permissions)` - Check if user has all permissions
- `assertPermission(req, permission)` - Assert permission or throw error
- `assertAnyPermission(req, permissions)` - Assert any permission or throw
- `assertAllPermissions(req, permissions)` - Assert all permissions or throw

**Legacy Support:**
- `assertRole(req, role)` - Deprecated, maps roles to permissions for backward compatibility

#### Permission Configuration (`apps/backend/src/config/permissions.ts`)

Centralized permission definitions:
- `PERMISSIONS` - Array of all available permissions
- `ROLE_PRESETS` - Predefined role templates
- `getPermissionsByCategory()` - Get permissions by category
- `getPermissionCategories()` - Get all categories with permissions
- `getRolePreset(name)` - Get preset by name

### Frontend Implementation

#### Components

1. **PermissionSelector** (`components/settings/PermissionSelector.tsx`)
   - Hierarchical permission tree
   - Search and filter
   - Category-level selection
   - Individual permission selection

2. **RolePresetCard** (`components/settings/RolePresetCard.tsx`)
   - Visual card for role presets
   - Shows permission count
   - Edit/Delete actions
   - System vs custom badges

#### Pages

1. **Login Page** (`pages/login.tsx`)
   - Enhanced styling with gradient buttons
   - Improved input fields with glass morphism
   - Better visual feedback
   - Multitenant support (Store ID field)

2. **Role Presets Management** (`pages/admin/role-presets.tsx`)
   - View all role presets
   - Create custom presets
   - Edit existing presets
   - Assign permissions to roles
   - Search and filter

3. **User Permissions** (`pages/admin/user-permissions.tsx`)
   - View all users
   - Assign role presets to users
   - Add custom per-user permissions
   - See effective permissions (role + custom)
   - Search users

### Permission Resolution

The system resolves permissions in this order:

1. **Super Admin Check** - isSuperAdmin = true grants all permissions
2. **Wildcard Check** - "*" permission grants everything
3. **Role Preset Permissions** - Base permissions from assigned role
4. **Custom User Permissions** - Additional permissions specific to user
5. **Category Wildcards** - "deals.*" grants all deal permissions

Example:
```typescript
User: Sarah Johnson
Role Preset: "Sales Manager"
  - customers.view
  - customers.create
  - deals.view
  - deals.create

Custom Permissions:
  - deals.editPricing

Effective Permissions:
  - customers.view
  - customers.create
  - deals.view
  - deals.create
  - deals.editPricing  ✓ (custom override)
```

## Setup Instructions

### 1. Database Migration

Run the Prisma migration to create the new tables:

```bash
cd /root/autolytiq/packages/db
npx prisma migrate dev --name add_custom_permissions
```

### 2. Seed Permissions

Populate the permission definitions and default role presets:

```bash
cd /root/autolytiq/apps/backend
npx tsx src/scripts/seed-permissions.ts
```

### 3. Update Existing Users

Optionally, map existing user roles to role presets:

```typescript
// Example migration script
const userRoleToPreset = {
  'ADMIN': 'Administrator',
  'SALES_MANAGER': 'Sales Manager',
  'SALES': 'Salesperson',
  'FI_MANAGER': 'F&I Manager',
  'FINANCE': 'Finance Specialist',
  'BDC': 'BDC Representative',
  'SERVICE': 'Service Technician',
};

for (const [role, presetName] of Object.entries(userRoleToPreset)) {
  const preset = await prisma.rolePreset.findFirst({
    where: { name: presetName, isSystem: true }
  });

  if (preset) {
    await prisma.user.updateMany({
      where: { role },
      data: { rolePresetId: preset.id }
    });
  }
}
```

## Usage Examples

### Backend - Protecting Routes

```typescript
// Old way (deprecated)
import { assertRole } from '../utils/authz.js';

router.get('/deals', (req, res) => {
  assertRole(req, 'SALES_MANAGER');
  // ...
});

// New way (recommended)
import { assertPermission, assertAnyPermission } from '../utils/authz.js';

router.get('/deals', (req, res) => {
  assertPermission(req, 'deals.view');
  // ...
});

router.post('/deals', (req, res) => {
  assertPermission(req, 'deals.create');
  // ...
});

router.get('/deals/:id/pricing', (req, res) => {
  assertAnyPermission(req, ['deals.viewPricing', 'deals.editPricing']);
  // ...
});
```

### Frontend - Conditional Rendering

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function DealsList() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <h1>Deals</h1>
      {hasPermission('deals.create') && (
        <Button>Create Deal</Button>
      )}
      {hasPermission('deals.viewPricing') && (
        <PricingColumn />
      )}
    </div>
  );
}
```

## Migration from Role Levels

The old system used numeric role levels (1-6):
```typescript
const ROLE_LEVEL = {
  ADMIN: 6,
  MANAGER: 5,
  SALES_MANAGER: 5,
  FI_MANAGER: 4,
  FINANCE: 3,
  SALES: 2,
  BDC: 2,
  SERVICE: 2,
};
```

This has been replaced with granular permissions. The `assertRole()` function is kept for backward compatibility but is deprecated.

### Migration Checklist

- [x] Update database schema with new models
- [x] Create permission definitions and presets
- [x] Update auth middleware
- [x] Create permission management UI
- [x] Enhanced login page design
- [ ] Run database migration
- [ ] Seed permissions and role presets
- [ ] Map existing users to role presets
- [ ] Update API routes to use new permission checks
- [ ] Test permission enforcement

## Benefits

1. **Flexibility** - No more fixed role levels; any combination of permissions
2. **Tenant Control** - Each tenant can create custom roles
3. **Granular Access** - Permission-level control instead of role-level
4. **User Overrides** - Individual users can have custom permissions
5. **Scalability** - Easy to add new permissions without code changes
6. **Audit Trail** - Clear permission assignments per user
7. **Better UX** - Visual permission management interface

## Best Practices

1. **Use specific permissions** - Prefer `assertPermission('deals.view')` over `assertRole('SALES')`
2. **Group related permissions** - Use categories like "deals", "customers", etc.
3. **Document permissions** - Add clear descriptions to all permissions
4. **Test permission boundaries** - Ensure users can't access unauthorized resources
5. **Regular audits** - Review and clean up unused permissions
6. **Principle of least privilege** - Grant minimal permissions needed

## Support

For questions or issues with the permission system:
- Review this documentation
- Check the permission configuration in `apps/backend/src/config/permissions.ts`
- Use the admin UI at `/admin/role-presets` and `/admin/user-permissions`
