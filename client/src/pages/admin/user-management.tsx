import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  Key,
  Settings,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  department: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'inventory.read', name: 'View Inventory', category: 'Inventory' },
  { id: 'inventory.write', name: 'Manage Inventory', category: 'Inventory' },
  { id: 'inventory.delete', name: 'Delete Inventory', category: 'Inventory' },
  { id: 'sales.read', name: 'View Sales', category: 'Sales' },
  { id: 'sales.write', name: 'Manage Sales', category: 'Sales' },
  { id: 'sales.approve', name: 'Approve Deals', category: 'Sales' },
  { id: 'customers.read', name: 'View Customers', category: 'Customers' },
  { id: 'customers.write', name: 'Manage Customers', category: 'Customers' },
  { id: 'customers.sensitive', name: 'View Sensitive Data', category: 'Customers' },
  { id: 'fi.read', name: 'View F&I', category: 'Finance' },
  { id: 'fi.write', name: 'Manage F&I', category: 'Finance' },
  { id: 'fi.approve', name: 'Approve F&I Products', category: 'Finance' },
  { id: 'reports.read', name: 'View Reports', category: 'Reports' },
  { id: 'reports.export', name: 'Export Reports', category: 'Reports' },
  { id: 'admin.users', name: 'Manage Users', category: 'Administration' },
  { id: 'admin.settings', name: 'System Settings', category: 'Administration' },
  { id: 'admin.audit', name: 'View Audit Logs', category: 'Administration' },
];

const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    isActive: true
  },
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    description: 'Manage sales team and approve deals',
    permissions: ['inventory.read', 'inventory.write', 'sales.read', 'sales.write', 'sales.approve', 'customers.read', 'customers.write', 'customers.sensitive', 'reports.read', 'reports.export'],
    isActive: true
  },
  {
    id: 'salesperson',
    name: 'Sales Person',
    description: 'Basic sales functionality',
    permissions: ['inventory.read', 'sales.read', 'sales.write', 'customers.read', 'customers.write'],
    isActive: true
  },
  {
    id: 'fi_manager',
    name: 'F&I Manager',
    description: 'Finance and insurance operations',
    permissions: ['fi.read', 'fi.write', 'fi.approve', 'customers.read', 'customers.sensitive', 'reports.read'],
    isActive: true
  }
];

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("users");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Mock users data - replace with real API calls
  const users: User[] = [
    {
      id: 'user1',
      email: 'admin@autolytiq.com',
      firstName: 'John',
      lastName: 'Admin',
      username: 'jadmin',
      role: 'Administrator',
      department: 'Management',
      phone: '(555) 123-4567',
      isActive: true,
      lastLogin: '2025-01-22T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      permissions: AVAILABLE_PERMISSIONS.map(p => p.id)
    },
    {
      id: 'user2',
      email: 'sarah.manager@autolytiq.com',
      firstName: 'Sarah',
      lastName: 'Manager',
      username: 'smanager',
      role: 'Sales Manager',
      department: 'Sales',
      phone: '(555) 234-5678',
      isActive: true,
      lastLogin: '2025-01-22T09:15:00Z',
      createdAt: '2024-02-01T00:00:00Z',
      permissions: ['inventory.read', 'inventory.write', 'sales.read', 'sales.write', 'sales.approve']
    }
  ];

  const roles: Role[] = DEFAULT_ROLES;

  const handleCreateUser = (formData: FormData) => {
    const userData = {
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      phone: formData.get('phone') as string,
    };

    // Here you would make API call
    console.log('Creating user:', userData);
    toast({ title: 'User created successfully' });
    setIsUserDialogOpen(false);
  };

  const handleCreateRole = (formData: FormData) => {
    const roleData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      permissions: Array.from(formData.getAll('permissions')) as string[],
    };

    console.log('Creating role:', roleData);
    toast({ title: 'Role created successfully' });
    setIsRoleDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            User Management Center
          </CardTitle>
          <CardDescription className="text-sm">
            Comprehensive user, role, and permission management system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="users" className="text-xs md:text-sm">Users</TabsTrigger>
              <TabsTrigger value="roles" className="text-xs md:text-sm">Roles</TabsTrigger>
              <TabsTrigger value="permissions" className="text-xs md:text-sm">Permissions</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-base md:text-lg font-semibold">System Users</h3>
                  <p className="text-sm text-gray-600">Manage user accounts and access</p>
                </div>
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 w-full md:w-auto">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Add User</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg">Create New User</DialogTitle>
                      <DialogDescription className="text-sm">
                        Add a new user to the system with appropriate permissions
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      handleCreateUser(formData);
                    }}>
                      <div className="grid gap-3 py-4">
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="firstName" className="text-sm">First Name</Label>
                            <Input id="firstName" name="firstName" required className="text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                            <Input id="lastName" name="lastName" required className="text-sm" />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email" className="text-sm">Email Address</Label>
                          <Input id="email" name="email" type="email" required className="text-sm" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="username" className="text-sm">Username</Label>
                            <Input id="username" name="username" required className="text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-sm">Phone</Label>
                            <Input id="phone" name="phone" type="tel" className="text-sm" />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <Label htmlFor="password" className="text-sm">Password</Label>
                          <div className="relative">
                            <Input 
                              id="password" 
                              name="password" 
                              type={showPassword ? "text" : "password"} 
                              required 
                              className="text-sm pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Role and Department */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="role" className="text-sm">Role</Label>
                            <Select name="role" required>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="department" className="text-sm">Department</Label>
                            <Select name="department" required>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="finance">Finance & Insurance</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                                <SelectItem value="management">Management</SelectItem>
                                <SelectItem value="admin">Administration</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsUserDialogOpen(false)}
                          className="w-full md:w-auto text-sm"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="w-full md:w-auto text-sm">
                          Create User
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Mobile-optimized user cards */}
              <div className="block md:hidden space-y-3">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-sm">{user.firstName} {user.lastName}</h4>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                        <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-gray-500">Role:</span>
                          <p className="font-medium">{user.role}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Dept:</span>
                          <p className="font-medium">{user.department}</p>
                        </div>
                        {user.phone && (
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <p className="font-medium">{user.phone}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Last Login:</span>
                          <p className="font-medium">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Key className="h-3 w-3 mr-1" />
                          Permissions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{user.department}</TableCell>
                          <TableCell>
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-base md:text-lg font-semibold">System Roles</h3>
                  <p className="text-sm text-gray-600">Define user roles and their permissions</p>
                </div>
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 w-full md:w-auto">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Add Role</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg">Create New Role</DialogTitle>
                      <DialogDescription className="text-sm">
                        Define a new role with specific permissions
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      handleCreateRole(formData);
                    }}>
                      <div className="grid gap-3 py-4">
                        <div>
                          <Label htmlFor="name" className="text-sm">Role Name</Label>
                          <Input id="name" name="name" required className="text-sm" />
                        </div>
                        
                        <div>
                          <Label htmlFor="description" className="text-sm">Description</Label>
                          <Textarea id="description" name="description" rows={3} className="text-sm" />
                        </div>

                        <div>
                          <Label className="text-sm">Permissions</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                            {Object.entries(
                              AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
                                if (!acc[perm.category]) acc[perm.category] = [];
                                acc[perm.category].push(perm);
                                return acc;
                              }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)
                            ).map(([category, perms]) => (
                              <div key={category} className="space-y-2">
                                <h4 className="font-medium text-sm text-blue-600">{category}</h4>
                                {perms.map((perm) => (
                                  <div key={perm.id} className="flex items-center space-x-2">
                                    <input 
                                      type="checkbox" 
                                      id={perm.id} 
                                      name="permissions" 
                                      value={perm.id}
                                      className="rounded"
                                    />
                                    <Label htmlFor={perm.id} className="text-xs font-normal">
                                      {perm.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsRoleDialogOpen(false)}
                          className="w-full md:w-auto text-sm"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="w-full md:w-auto text-sm">
                          Create Role
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-3 md:gap-4">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base md:text-lg">{role.name}</CardTitle>
                          <CardDescription className="text-sm">{role.description}</CardDescription>
                        </div>
                        <Badge variant={role.isActive ? "default" : "secondary"} className="text-xs">
                          {role.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-600">Permissions ({role.permissions.length})</Label>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 6).map((permId) => {
                            const perm = AVAILABLE_PERMISSIONS.find(p => p.id === permId);
                            return perm ? (
                              <Badge key={permId} variant="outline" className="text-xs">
                                {perm.name}
                              </Badge>
                            ) : null;
                          })}
                          {role.permissions.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Permissions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-2">System Permissions</h3>
                <p className="text-sm text-gray-600 mb-4">Available permissions grouped by category</p>
              </div>

              <div className="grid gap-4">
                {Object.entries(
                  AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
                    if (!acc[perm.category]) acc[perm.category] = [];
                    acc[perm.category].push(perm);
                    return acc;
                  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)
                ).map(([category, perms]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        {category}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {perms.length} permissions available
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {perms.map((perm) => (
                          <div key={perm.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div>
                              <p className="font-medium text-sm">{perm.name}</p>
                              <p className="text-xs text-gray-600">{perm.id}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}