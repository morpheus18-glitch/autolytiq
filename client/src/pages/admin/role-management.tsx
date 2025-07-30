import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Shield, 
  Edit, 
  Trash2, 
  Plus,
  Check,
  X,
  Settings,
  Eye,
  Lock,
  Unlock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function RoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Mock roles data - would be fetched from backend
  const roles: Role[] = [
    {
      id: '1',
      name: 'General Manager',
      description: 'Full system access with all administrative privileges',
      permissions: ['all'],
      userCount: 2,
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sales Manager',
      description: 'Sales team oversight with inventory and customer management',
      permissions: ['sales_read', 'sales_write', 'inventory_read', 'customers_read', 'customers_write'],
      userCount: 5,
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'F&I Manager',
      description: 'Finance and insurance operations management',
      permissions: ['finance_read', 'finance_write', 'deals_read', 'deals_write', 'compliance_read'],
      userCount: 3,
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '4',
      name: 'Sales Consultant',
      description: 'Customer interaction and basic sales operations',
      permissions: ['customers_read', 'customers_write', 'inventory_read', 'leads_read', 'leads_write'],
      userCount: 15,
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '5',
      name: 'Service Advisor',
      description: 'Service department operations and customer communication',
      permissions: ['service_read', 'service_write', 'customers_read'],
      userCount: 8,
      isActive: true,
      createdAt: '2024-01-15'
    }
  ];

  // Mock permissions data
  const availablePermissions: Permission[] = [
    { id: 'sales_read', name: 'View Sales', category: 'Sales', description: 'View sales data and reports' },
    { id: 'sales_write', name: 'Manage Sales', category: 'Sales', description: 'Create and edit sales records' },
    { id: 'inventory_read', name: 'View Inventory', category: 'Inventory', description: 'View vehicle inventory' },
    { id: 'inventory_write', name: 'Manage Inventory', category: 'Inventory', description: 'Add, edit, and remove inventory' },
    { id: 'customers_read', name: 'View Customers', category: 'CRM', description: 'View customer information' },
    { id: 'customers_write', name: 'Manage Customers', category: 'CRM', description: 'Create and edit customer records' },
    { id: 'finance_read', name: 'View Finance', category: 'Finance', description: 'View finance and insurance data' },
    { id: 'finance_write', name: 'Manage Finance', category: 'Finance', description: 'Process F&I transactions' },
    { id: 'deals_read', name: 'View Deals', category: 'Deals', description: 'View deal information' },
    { id: 'deals_write', name: 'Manage Deals', category: 'Deals', description: 'Create and edit deals' },
    { id: 'reports_read', name: 'View Reports', category: 'Reports', description: 'Access reporting dashboard' },
    { id: 'admin_read', name: 'View Admin', category: 'Administration', description: 'View admin settings' },
    { id: 'admin_write', name: 'Manage Admin', category: 'Administration', description: 'Modify system settings' },
    { id: 'compliance_read', name: 'View Compliance', category: 'Compliance', description: 'View compliance reports' }
  ];

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      await apiRequest(`/api/roles/${roleId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({ title: 'Role deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete role', variant: 'destructive' });
    }
  });

  const handleDeleteRole = (role: Role) => {
    if (role.userCount > 0) {
      toast({
        title: 'Cannot delete role',
        description: 'This role is assigned to users. Please reassign users before deleting.',
        variant: 'destructive'
      });
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const getPermissionsByCategory = (permissions: string[]) => {
    const categories: { [key: string]: Permission[] } = {};
    availablePermissions
      .filter(p => permissions.includes(p.id) || permissions.includes('all'))
      .forEach(permission => {
        if (!categories[permission.category]) {
          categories[permission.category] = [];
        }
        categories[permission.category].push(permission);
      });
    return categories;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-gray-600">Define and manage user roles and permissions</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Role Name</label>
                <Input placeholder="Enter role name..." />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Enter role description..." />
              </div>
              <div>
                <label className="text-sm font-medium">Permissions</label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                  {Object.entries(
                    availablePermissions.reduce((acc, permission) => {
                      if (!acc[permission.category]) acc[permission.category] = [];
                      acc[permission.category].push(permission);
                      return acc;
                    }, {} as { [key: string]: Permission[] })
                  ).map(([category, permissions]) => (
                    <div key={category} className="border rounded-lg p-3">
                      <div className="font-medium text-sm mb-2">{category}</div>
                      {permissions.map(permission => (
                        <label key={permission.id} className="flex items-center space-x-2 text-sm">
                          <input type="checkbox" />
                          <span>{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold">{roles.filter(r => r.isActive).length}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{roles.reduce((sum, role) => sum + role.userCount, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Permissions</p>
                <p className="text-2xl font-bold">{availablePermissions.length}</p>
              </div>
              <Lock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {role.userCount} users
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.includes('all') ? (
                        <Badge className="bg-purple-100 text-purple-800">All Permissions</Badge>
                      ) : (
                        Object.entries(getPermissionsByCategory(role.permissions)).map(([category, perms]) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category} ({perms.length})
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={role.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {role.isActive ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                      {role.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                        disabled={role.userCount > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}