import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Department, Role, User } from "@shared/schema";

export default function DepartmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createDepartmentMutation = useMutation({
    mutationFn: async (departmentData: { name: string; description: string }) => {
      return await apiRequest("/api/departments", {
        method: "POST",
        body: departmentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({ title: "Department created successfully" });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create department", variant: "destructive" });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Department> }) => {
      return await apiRequest(`/api/departments/${id}`, {
        method: "PUT",
        body: updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({ title: "Department updated successfully" });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update department", variant: "destructive" });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/departments/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({ title: "Department deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete department", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const departmentData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    if (selectedDepartment) {
      updateDepartmentMutation.mutate({ id: selectedDepartment.id, updates: departmentData });
    } else {
      createDepartmentMutation.mutate(departmentData);
    }
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      deleteDepartmentMutation.mutate(id);
    }
  };

  const getDepartmentStats = (departmentId: number) => {
    const departmentRoles = roles.filter(role => role.departmentId === departmentId);
    const departmentUsers = users.filter(user => user.departmentId === departmentId);
    return {
      rolesCount: departmentRoles.length,
      usersCount: departmentUsers.length,
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-gray-600">Manage organizational departments and structure</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedDepartment(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedDepartment ? "Edit Department" : "Create New Department"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedDepartment?.name || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={selectedDepartment?.description || ""}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}>
                  {selectedDepartment ? "Update" : "Create"} Department
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Department Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {departmentsLoading ? (
          <div className="text-center py-8">Loading departments...</div>
        ) : departments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No departments found</h3>
              <p className="text-gray-600">Create your first department to get started.</p>
            </CardContent>
          </Card>
        ) : (
          departments.map((department) => {
            const stats = getDepartmentStats(department.id);
            return (
              <Card key={department.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{department.name}</CardTitle>
                        <p className="text-sm text-gray-600">{department.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {stats.rolesCount} roles
                      </Badge>
                      <Badge variant="secondary">
                        {stats.usersCount} users
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(department)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(department.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}