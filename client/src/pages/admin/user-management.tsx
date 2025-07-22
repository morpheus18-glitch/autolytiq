import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UserForm from "@/components/admin/user-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Shield, 
  Key, 
  UserCog,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SystemUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  department: string;
  phone?: string;
  isActive: boolean;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
};

type SystemRole = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch roles  
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/roles"],
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const filteredUsers = (users as SystemUser[]).filter((user: SystemUser) =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                User Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Manage users, roles, and permissions
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setSelectedUser(null);
                  setIsUserDialogOpen(true);
                }}
                className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Roles</span>
              <span className="sm:hidden">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="text-xs sm:text-sm">
              <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Permissions</span>
              <span className="sm:hidden">Perms</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-lg sm:text-xl">System Users</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64 text-sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="p-4 sm:p-8 text-center">
                    <div className="animate-pulse">Loading users...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Name</TableHead>
                          <TableHead className="text-xs sm:text-sm">Email</TableHead>
                          <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Role</TableHead>
                          <TableHead className="text-xs sm:text-sm hidden md:table-cell">Department</TableHead>
                          <TableHead className="text-xs sm:text-sm">Status</TableHead>
                          <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user: SystemUser) => (
                          <TableRow key={user.id}>
                            <TableCell className="text-xs sm:text-sm">
                              <div>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-gray-500 sm:hidden">{user.role}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">{user.email}</TableCell>
                            <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm hidden md:table-cell">{user.department}</TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              <Badge 
                                variant={user.isActive ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                    <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">System Roles</CardTitle>
              </CardHeader>
              <CardContent>
                {rolesLoading ? (
                  <div className="p-4 sm:p-8 text-center">
                    <div className="animate-pulse">Loading roles...</div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {(roles as SystemRole[]).map((role: SystemRole) => (
                      <div key={role.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm sm:text-base">{role.name}</h3>
                              <Badge 
                                variant={role.isActive ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {role.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {role.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {role.permissions.slice(0, 3).map((permission, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                              {role.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 ml-2">
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">System Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  {[
                    { category: "Dashboard", permissions: ["View Dashboard", "Manage Widgets"] },
                    { category: "Users", permissions: ["View Users", "Create Users", "Edit Users", "Delete Users"] },
                    { category: "Vehicles", permissions: ["View Inventory", "Add Vehicles", "Edit Vehicles", "Delete Vehicles"] },
                    { category: "Customers", permissions: ["View Customers", "Add Customers", "Edit Customers", "Contact Customers"] },
                    { category: "Sales", permissions: ["View Sales", "Create Deals", "Manage Finance", "Access Reports"] },
                    { category: "Settings", permissions: ["System Settings", "User Management", "Security Settings"] }
                  ].map((group, index) => (
                    <div key={index} className="border rounded-lg p-3 sm:p-4">
                      <h3 className="font-medium text-sm sm:text-base mb-2">{group.category}</h3>
                      <div className="grid gap-2">
                        {group.permissions.map((permission, permIndex) => (
                          <div key={permIndex} className="flex items-center justify-between text-xs sm:text-sm">
                            <span>{permission}</span>
                            <Badge variant="outline" className="text-xs">
                              Active
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {selectedUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              user={selectedUser || undefined}
              onClose={() => {
                setIsUserDialogOpen(false);
                setSelectedUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}