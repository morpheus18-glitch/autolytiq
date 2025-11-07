import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Badge } from '@repo/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@repo/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { PermissionSelector, type Permission } from '@/components/settings/PermissionSelector.tsx';
import { RolePresetCard, type RolePreset } from '@/components/settings/RolePresetCard.tsx';
import { Search, UserCog, Shield, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@repo/ui';

// Mock data - in production, this would come from your API
const MOCK_PERMISSIONS: Permission[] = [
  { code: 'customers.view', name: 'View Customers', description: 'View customer information', category: 'customers' },
  { code: 'customers.create', name: 'Create Customers', description: 'Create new customers', category: 'customers' },
  { code: 'customers.edit', name: 'Edit Customers', description: 'Edit customer information', category: 'customers' },
  { code: 'leads.view', name: 'View Leads', description: 'View lead information', category: 'leads' },
  { code: 'leads.create', name: 'Create Leads', description: 'Create new leads', category: 'leads' },
  { code: 'deals.view', name: 'View Deals', description: 'View deal information', category: 'deals' },
  { code: 'deals.create', name: 'Create Deals', description: 'Create new deals', category: 'deals' },
  { code: 'deals.viewPricing', name: 'View Deal Pricing', description: 'View deal pricing and margins', category: 'deals' },
  { code: 'users.view', name: 'View Users', description: 'View user information', category: 'users' },
  { code: 'users.edit', name: 'Edit Users', description: 'Edit user information', category: 'users' },
];

const MOCK_ROLE_PRESETS: RolePreset[] = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full system access',
    permissions: MOCK_PERMISSIONS.map((p) => p.code),
    isSystem: true,
    isActive: true,
  },
  {
    id: '2',
    name: 'Sales Manager',
    description: 'Sales management',
    permissions: ['customers.view', 'customers.create', 'customers.edit', 'leads.view', 'leads.create', 'deals.view', 'deals.create', 'deals.viewPricing', 'users.view'],
    isSystem: true,
    isActive: true,
  },
  {
    id: '3',
    name: 'Salesperson',
    description: 'Sales team member',
    permissions: ['customers.view', 'customers.create', 'leads.view', 'leads.create', 'deals.view', 'deals.create'],
    isSystem: true,
    isActive: true,
  },
];

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rolePresetId?: string;
  customPermissions: string[];
  status: 'active' | 'inactive';
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    rolePresetId: '2',
    customPermissions: [],
    status: 'active',
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    rolePresetId: '3',
    customPermissions: ['deals.viewPricing'],
    status: 'active',
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@example.com',
    rolePresetId: '1',
    customPermissions: [],
    status: 'active',
  },
];

export default function UserPermissionsPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [selectedRolePresetId, setSelectedRolePresetId] = useState<string>('');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setSelectedRolePresetId(user.rolePresetId || '');
    setCustomPermissions(user.customPermissions);
    setIsEditDialogOpen(true);
  };

  const handleSavePermissions = () => {
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              rolePresetId: selectedRolePresetId || undefined,
              customPermissions,
            }
          : user
      )
    );

    toast({
      title: 'Permissions Updated',
      description: `Permissions for ${editingUser.firstName} ${editingUser.lastName} have been updated`,
    });

    setIsEditDialogOpen(false);
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserRolePreset = (user: User): RolePreset | undefined => {
    return MOCK_ROLE_PRESETS.find((preset) => preset.id === user.rolePresetId);
  };

  const getUserEffectivePermissions = (user: User): string[] => {
    const rolePreset = getUserRolePreset(user);
    const basePermissions = rolePreset?.permissions || [];

    // Merge base permissions with custom permissions
    return Array.from(new Set([...basePermissions, ...user.customPermissions]));
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Permissions</h1>
          <p className="text-muted-foreground mt-2">
            Manage user permissions with role presets and custom overrides
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-3xl">{users.filter((u) => u.status === 'active').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Custom Permissions</CardDescription>
            <CardTitle className="text-3xl">
              {users.filter((u) => u.customPermissions.length > 0).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user permissions and role assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const rolePreset = getUserRolePreset(user);
              const effectivePermissions = getUserEffectivePermissions(user);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getUserInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-base">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {rolePreset && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {rolePreset.name}
                          </Badge>
                        )}
                        {user.customPermissions.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Settings className="h-3 w-3 mr-1" />
                            +{user.customPermissions.length} custom
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {effectivePermissions.length} total permissions
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                    <UserCog className="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm mt-2">Try adjusting your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Permissions - {editingUser?.firstName} {editingUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              Assign a role preset and customize individual permissions for this user
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="role" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="role">Role Preset</TabsTrigger>
              <TabsTrigger value="custom">Custom Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="role" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Role Preset</Label>
                <p className="text-sm text-muted-foreground">
                  Choose a role preset to grant a predefined set of permissions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_ROLE_PRESETS.map((preset) => (
                  <RolePresetCard
                    key={preset.id}
                    preset={preset}
                    isSelected={selectedRolePresetId === preset.id}
                    onSelect={() => setSelectedRolePresetId(preset.id)}
                    permissionCount={preset.permissions.length}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedRolePresetId('')}
                disabled={!selectedRolePresetId}
              >
                Clear Role Selection
              </Button>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Custom Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Add additional permissions beyond the assigned role preset
                </p>
              </div>

              <PermissionSelector
                permissions={MOCK_PERMISSIONS}
                selectedPermissions={customPermissions}
                onChange={setCustomPermissions}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
