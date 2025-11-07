import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Textarea } from '@repo/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@repo/ui';
import { RolePresetCard, type RolePreset } from '@/components/settings/RolePresetCard.tsx';
import { PermissionSelector, type Permission } from '@/components/settings/PermissionSelector.tsx';
import { Plus, Search, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@repo/ui';

// Mock permissions data - in production, this would come from your API
const MOCK_PERMISSIONS: Permission[] = [
  // Customers
  { code: 'customers.view', name: 'View Customers', description: 'View customer information', category: 'customers' },
  { code: 'customers.create', name: 'Create Customers', description: 'Create new customers', category: 'customers' },
  { code: 'customers.edit', name: 'Edit Customers', description: 'Edit customer information', category: 'customers' },
  { code: 'customers.delete', name: 'Delete Customers', description: 'Delete customers', category: 'customers' },
  { code: 'customers.export', name: 'Export Customers', description: 'Export customer data', category: 'customers' },

  // Leads
  { code: 'leads.view', name: 'View Leads', description: 'View lead information', category: 'leads' },
  { code: 'leads.create', name: 'Create Leads', description: 'Create new leads', category: 'leads' },
  { code: 'leads.edit', name: 'Edit Leads', description: 'Edit lead information', category: 'leads' },
  { code: 'leads.delete', name: 'Delete Leads', description: 'Delete leads', category: 'leads' },
  { code: 'leads.assign', name: 'Assign Leads', description: 'Assign leads to team members', category: 'leads' },
  { code: 'leads.viewAll', name: 'View All Leads', description: 'View all leads (not just assigned)', category: 'leads' },

  // Deals
  { code: 'deals.view', name: 'View Deals', description: 'View deal information', category: 'deals' },
  { code: 'deals.create', name: 'Create Deals', description: 'Create new deals', category: 'deals' },
  { code: 'deals.edit', name: 'Edit Deals', description: 'Edit deal information', category: 'deals' },
  { code: 'deals.delete', name: 'Delete Deals', description: 'Delete deals', category: 'deals' },
  { code: 'deals.approve', name: 'Approve Deals', description: 'Approve deal submissions', category: 'deals' },
  { code: 'deals.viewAll', name: 'View All Deals', description: 'View all deals (not just own)', category: 'deals' },
  { code: 'deals.viewPricing', name: 'View Deal Pricing', description: 'View deal pricing and margins', category: 'deals' },
  { code: 'deals.editPricing', name: 'Edit Deal Pricing', description: 'Edit deal pricing and margins', category: 'deals' },

  // Settings
  { code: 'settings.view', name: 'View Settings', description: 'View system settings', category: 'settings' },
  { code: 'settings.edit', name: 'Edit Settings', description: 'Edit system settings', category: 'settings' },
  { code: 'settings.roles', name: 'Manage Roles', description: 'Manage role presets', category: 'settings' },

  // Users
  { code: 'users.view', name: 'View Users', description: 'View user information', category: 'users' },
  { code: 'users.create', name: 'Create Users', description: 'Create new users', category: 'users' },
  { code: 'users.edit', name: 'Edit Users', description: 'Edit user information', category: 'users' },
  { code: 'users.delete', name: 'Delete Users', description: 'Delete users', category: 'users' },
  { code: 'users.managePermissions', name: 'Manage User Permissions', description: 'Manage user permissions and roles', category: 'users' },
];

// Mock role presets - in production, this would come from your API
const MOCK_ROLE_PRESETS: RolePreset[] = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: MOCK_PERMISSIONS.map((p) => p.code),
    isSystem: true,
    isActive: true,
  },
  {
    id: '2',
    name: 'Sales Manager',
    description: 'Sales team management and oversight',
    permissions: [
      'customers.view',
      'customers.create',
      'customers.edit',
      'leads.view',
      'leads.create',
      'leads.edit',
      'leads.assign',
      'leads.viewAll',
      'deals.view',
      'deals.create',
      'deals.edit',
      'deals.approve',
      'deals.viewAll',
      'deals.viewPricing',
      'users.view',
    ],
    isSystem: true,
    isActive: true,
  },
  {
    id: '3',
    name: 'Salesperson',
    description: 'Sales team member access',
    permissions: [
      'customers.view',
      'customers.create',
      'customers.edit',
      'leads.view',
      'leads.create',
      'leads.edit',
      'deals.view',
      'deals.create',
      'deals.edit',
    ],
    isSystem: true,
    isActive: true,
  },
];

export default function RolePresetsPage() {
  const { toast } = useToast();
  const [rolePresets, setRolePresets] = useState<RolePreset[]>(MOCK_ROLE_PRESETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<RolePreset | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return rolePresets;

    const query = searchQuery.toLowerCase();
    return rolePresets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(query) || preset.description.toLowerCase().includes(query)
    );
  }, [rolePresets, searchQuery]);

  const handleCreatePreset = () => {
    setFormName('');
    setFormDescription('');
    setFormPermissions([]);
    setEditingPreset(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditPreset = (preset: RolePreset) => {
    setFormName(preset.name);
    setFormDescription(preset.description);
    setFormPermissions(preset.permissions);
    setEditingPreset(preset);
    setIsCreateDialogOpen(true);
  };

  const handleSavePreset = () => {
    if (!formName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a role name',
        variant: 'destructive',
      });
      return;
    }

    if (formPermissions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one permission',
        variant: 'destructive',
      });
      return;
    }

    if (editingPreset) {
      // Update existing preset
      setRolePresets((prev) =>
        prev.map((preset) =>
          preset.id === editingPreset.id
            ? {
                ...preset,
                name: formName,
                description: formDescription,
                permissions: formPermissions,
              }
            : preset
        )
      );

      toast({
        title: 'Role Updated',
        description: `${formName} has been updated successfully`,
      });
    } else {
      // Create new preset
      const newPreset: RolePreset = {
        id: Date.now().toString(),
        name: formName,
        description: formDescription,
        permissions: formPermissions,
        isSystem: false,
        isActive: true,
      };

      setRolePresets((prev) => [...prev, newPreset]);

      toast({
        title: 'Role Created',
        description: `${formName} has been created successfully`,
      });
    }

    setIsCreateDialogOpen(false);
  };

  const handleDeletePreset = (preset: RolePreset) => {
    if (preset.isSystem) {
      toast({
        title: 'Cannot Delete',
        description: 'System role presets cannot be deleted',
        variant: 'destructive',
      });
      return;
    }

    setRolePresets((prev) => prev.filter((p) => p.id !== preset.id));

    toast({
      title: 'Role Deleted',
      description: `${preset.name} has been deleted`,
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Presets</h1>
          <p className="text-muted-foreground mt-2">
            Manage role presets with custom permissions for your organization
          </p>
        </div>
        <Button onClick={handleCreatePreset} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Role Preset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Roles</CardDescription>
            <CardTitle className="text-3xl">{rolePresets.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>System Roles</CardDescription>
            <CardTitle className="text-3xl">{rolePresets.filter((r) => r.isSystem).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Custom Roles</CardDescription>
            <CardTitle className="text-3xl">{rolePresets.filter((r) => !r.isSystem).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search role presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Role Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map((preset) => (
          <RolePresetCard
            key={preset.id}
            preset={preset}
            onEdit={() => handleEditPreset(preset)}
            onDelete={() => handleDeletePreset(preset)}
            permissionCount={preset.permissions.length}
          />
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No role presets found</p>
            <p className="text-sm mt-2">Try adjusting your search or create a new role preset</p>
          </div>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPreset ? 'Edit Role Preset' : 'Create Role Preset'}</DialogTitle>
            <DialogDescription>
              {editingPreset
                ? 'Update the role preset configuration'
                : 'Create a new role preset with custom permissions'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sales Manager"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role and its responsibilities..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label>Permissions</Label>
              <PermissionSelector
                permissions={MOCK_PERMISSIONS}
                selectedPermissions={formPermissions}
                onChange={setFormPermissions}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset}>
              {editingPreset ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
