import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Role, Department, Permission } from "@shared/schema";

export default function RolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/permissions"],
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: { name: string; description: string; departmentId: number }) => {
      return await apiRequest("/api/roles", {
        method: "POST",
        body: roleData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({ title: "Role created successfully" });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create role", variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Role> }) => {
      return await apiRequest(`/api/roles/${id}`, {
        method: "PUT",
        body: updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({ title: "Role updated successfully" });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update role", variant: "destructive" });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/roles/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({ title: "Role deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete role", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      departmentId: parseInt(formData.get("departmentId") as string),
    };

    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, updates: roleData });
    } else {
      createRoleMutation.mutate(roleData);
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteRoleMutation.mutate(id);
    }
  };

  const handlePermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionModalOpen(true);
  };

  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return "No Department";
    const department = departments.find(d => d.id === departmentId);
    return department?.name || "Unknown";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-gray-600">Manage user roles and their permissions</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedRole(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedRole ? "Edit Role" : "Create New Role"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedRole?.name || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={selectedRole?.description || ""}
                />
              </div>
              <div>
                <Label htmlFor="departmentId">Department</Label>
                <Select name="departmentId" defaultValue={selectedRole?.departmentId?.toString() || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id.toString()}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRoleMutation.isPending || updateRoleMutation.isPending}>
                  {selectedRole ? "Update" : "Create"} Role
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rolesLoading ? (
          <div className="text-center py-8">Loading roles...</div>
        ) : roles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No roles found</h3>
              <p className="text-gray-600">Create your first role to get started.</p>
            </CardContent>
          </Card>
        ) : (
          roles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {getDepartmentName(role.departmentId)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePermissions(role)}
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(role)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(role.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Permission Management Modal */}
      <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Permissions for {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox id={`permission-${permission.id}`} />
                  <Label htmlFor={`permission-${permission.id}`} className="flex-1">
                    <div>
                      <div className="font-medium">{permission.name}</div>
                      <div className="text-sm text-gray-600">
                        {permission.description} • {permission.resource}:{permission.action}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)}>
                Cancel
              </Button>
              <Button>Save Permissions</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}