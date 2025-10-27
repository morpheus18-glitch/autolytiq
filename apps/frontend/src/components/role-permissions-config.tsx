import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Users, 
  Lock, 
  Unlock,
  Crown,
  Star,
  User,
  Building,
  Settings,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus
} from 'lucide-react';
import type { SystemRole, InsertSystemRole } from '@shared/schema';

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  hierarchy: number;
  isSystem: boolean;
  userCount: number;
  createdAt: string;
}

interface Permission {
  id: string;
  category: string;
  name: string;
  description: string;
}

const mockRoles: Role[] = [
  {
    id: 1,
    name: "super_admin",
    displayName: "Super Administrator",
    description: "Full system access with all administrative privileges",
    permissions: ["*"],
    hierarchy: 100,
    isSystem: true,
    userCount: 2,
    createdAt: "2025-01-21T08:00:00Z"
  },
  {
    id: 2,
    name: "sales_manager",
    displayName: "Sales Manager",
    description: "Manages sales team, leads, and deals",
    permissions: ["leads.view", "leads.assign", "deals.edit", "reports.view", "team.manage"],
    hierarchy: 80,
    isSystem: false,
    userCount: 3,
    createdAt: "2025-01-20T14:30:00Z"
  },
  {
    id: 3,
    name: "senior_sales_rep",
    displayName: "Senior Sales Representative",
    description: "Experienced sales representative with advanced privileges",
    permissions: ["leads.view", "deals.edit", "customers.manage", "inventory.view"],
    hierarchy: 60,
    isSystem: false,
    userCount: 8,
    createdAt: "2025-01-19T10:15:00Z"
  },
  {
    id: 4,
    name: "junior_sales_rep",
    displayName: "Junior Sales Representative",
    description: "Entry-level sales representative with basic permissions",
    permissions: ["leads.view", "deals.view", "customers.view"],
    hierarchy: 40,
    isSystem: false,
    userCount: 12,
    createdAt: "2025-01-18T16:45:00Z"
  },
  {
    id: 5,
    name: "bdc_rep",
    displayName: "BDC Representative",
    description: "Business Development Center representative",
    permissions: ["leads.view", "leads.contact", "appointments.schedule"],
    hierarchy: 30,
    isSystem: false,
    userCount: 4,
    createdAt: "2025-01-17T12:00:00Z"
  }
];

const availablePermissions: Permission[] = [
  // Lead Management
  { id: "leads.view", category: "Leads", name: "View Leads", description: "View all leads and lead details" },
  { id: "leads.assign", category: "Leads", name: "Assign Leads", description: "Assign leads to sales representatives" },
  { id: "leads.edit", category: "Leads", name: "Edit Leads", description: "Edit lead information and status" },
  { id: "leads.delete", category: "Leads", name: "Delete Leads", description: "Delete leads from the system" },
  { id: "leads.contact", category: "Leads", name: "Contact Leads", description: "Make contact with leads" },
  
  // Deal Management
  { id: "deals.view", category: "Deals", name: "View Deals", description: "View deal information" },
  { id: "deals.edit", category: "Deals", name: "Edit Deals", description: "Create and modify deals" },
  { id: "deals.approve", category: "Deals", name: "Approve Deals", description: "Approve deal structures and pricing" },
  { id: "deals.finalize", category: "Deals", name: "Finalize Deals", description: "Complete and finalize deals" },
  
  // Customer Management
  { id: "customers.view", category: "Customers", name: "View Customers", description: "View customer information" },
  { id: "customers.manage", category: "Customers", name: "Manage Customers", description: "Create, edit, and manage customers" },
  { id: "customers.delete", category: "Customers", name: "Delete Customers", description: "Delete customer records" },
  
  // Inventory Management
  { id: "inventory.view", category: "Inventory", name: "View Inventory", description: "View vehicle inventory" },
  { id: "inventory.manage", category: "Inventory", name: "Manage Inventory", description: "Add, edit, and manage vehicle inventory" },
  { id: "inventory.pricing", category: "Inventory", name: "Pricing Access", description: "View and edit vehicle pricing" },
  
  // Team Management
  { id: "team.view", category: "Team", name: "View Team", description: "View team member information" },
  { id: "team.manage", category: "Team", name: "Manage Team", description: "Manage team members and assignments" },
  
  // Reports & Analytics
  { id: "reports.view", category: "Reports", name: "View Reports", description: "Access reports and analytics" },
  { id: "reports.export", category: "Reports", name: "Export Reports", description: "Export reports and data" },
  
  // System Administration
  { id: "admin.users", category: "Admin", name: "User Management", description: "Manage user accounts and roles" },
  { id: "admin.settings", category: "Admin", name: "System Settings", description: "Configure system settings" },
  { id: "admin.audit", category: "Admin", name: "Audit Logs", description: "View system audit logs" },
  
  // Appointments
  { id: "appointments.schedule", category: "Appointments", name: "Schedule Appointments", description: "Schedule customer appointments" },
  { id: "appointments.manage", category: "Appointments", name: "Manage Appointments", description: "Manage appointment calendar" }
];

interface RolePermissionsConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RolePermissionsConfig({ isOpen, onClose }: RolePermissionsConfigProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [viewMode, setViewMode] = useState<'roles' | 'permissions'>('roles');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simulate roles query
  const { data: roles = mockRoles, isLoading } = useQuery({
    queryKey: ['/api/system-roles'],
    queryFn: async () => {
      // For demo purposes, return mock data
      // In production, this would fetch from /api/system-roles
      return mockRoles;
    }
  });

  const getRoleHierarchyIcon = (hierarchy: number) => {
    if (hierarchy >= 90) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (hierarchy >= 70) return <Star className="w-4 h-4 text-blue-500" />;
    if (hierarchy >= 50) return <Shield className="w-4 h-4 text-green-500" />;
    return <User className="w-4 h-4 text-gray-500" />;
  };

  const getPermissionsByCategory = () => {
    const grouped = availablePermissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
    
    return grouped;
  };

  const RoleForm = () => (
    <Dialog open={showRoleForm} onOpenChange={setShowRoleForm}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
        </DialogHeader>
        
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" placeholder="Senior Sales Representative" />
            </div>
            <div>
              <Label htmlFor="hierarchy">Hierarchy Level</Label>
              <Input id="hierarchy" type="number" placeholder="60" min="0" max="100" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe the role and its responsibilities..." />
          </div>

          {/* Permissions Selection */}
          <div>
            <Label className="text-base font-semibold">Permissions</Label>
            <div className="mt-2 space-y-4 border rounded-lg p-4 max-h-96 overflow-y-auto">
              {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                <div key={category} className="space-y-2">
                  <div className="font-medium text-sm text-gray-900 border-b pb-1">
                    {category}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox id={permission.id} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <Label 
                            htmlFor={permission.id}
                            className="text-xs font-medium cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isSystem" />
            <Label htmlFor="isSystem">System Role (Cannot be deleted)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowRoleForm(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role & Permissions Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div>
              <h3 className="font-semibold text-purple-900">Access Control Management</h3>
              <p className="text-sm text-purple-700">
                Configure user roles, permissions, and access hierarchy for secure system operations
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white rounded-lg p-1 shadow-sm border">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={viewMode === 'roles' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('roles')}
                    className="text-xs"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Roles
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'permissions' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('permissions')}
                    className="text-xs"
                  >
                    <Lock className="w-4 h-4 mr-1" />
                    Permissions
                  </Button>
                </div>
              </div>
              <Button onClick={() => setShowRoleForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Role
              </Button>
            </div>
          </div>

          {viewMode === 'roles' ? (
            /* Roles View */
            <div className="space-y-4">
              {/* Roles Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role</TableHead>
                          <TableHead>Hierarchy</TableHead>
                          <TableHead>Users</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getRoleHierarchyIcon(role.hierarchy)}
                                <div>
                                  <div className="font-medium">{role.displayName}</div>
                                  <div className="text-xs text-gray-500">{role.description}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                Level {role.hierarchy}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {role.userCount}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-gray-600">
                                {role.permissions[0] === '*' 
                                  ? 'Full Access' 
                                  : `${role.permissions.length} permissions`
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              {role.isSystem ? (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  System
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Custom
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRole(role);
                                    setIsEditing(true);
                                    setShowRoleForm(true);
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                {!role.isSystem && (
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Role Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Total Roles</p>
                        <p className="text-lg font-semibold">{roles.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Total Users</p>
                        <p className="text-lg font-semibold">{roles.reduce((sum, role) => sum + role.userCount, 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-xs text-gray-600">System Roles</p>
                        <p className="text-lg font-semibold">{roles.filter(r => r.isSystem).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <div>
                        <p className="text-xs text-gray-600">Admin Roles</p>
                        <p className="text-lg font-semibold">{roles.filter(r => r.hierarchy >= 80).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Permissions View */
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-base mb-3 pb-2 border-b">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permissions.map((permission) => (
                            <Card key={permission.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-sm">{permission.name}</h4>
                                    <p className="text-xs text-gray-600 mt-1">{permission.description}</p>
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      {permission.id}
                                    </Badge>
                                  </div>
                                  <Lock className="w-4 h-4 text-gray-400" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <RoleForm />
      </DialogContent>
    </Dialog>
  );
}