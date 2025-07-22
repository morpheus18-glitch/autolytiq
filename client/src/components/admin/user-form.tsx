import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),
  preferences: z.object({
    theme: z.string().default("light"),
    notifications: z.boolean().default(true),
    emailUpdates: z.boolean().default(false),
    timezone: z.string().default("America/New_York"),
  }).default({
    theme: "light",
    notifications: true,
    emailUpdates: false,
    timezone: "America/New_York",
  }),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface SystemUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  department: string;
  phone?: string;
  address?: string;
  bio?: string;
  isActive: boolean;
  permissions: string[];
  preferences: {
    theme: string;
    notifications: boolean;
    emailUpdates: boolean;
    timezone: string;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserFormProps {
  user?: SystemUser;
  onSuccess?: () => void;
}

const availablePermissions = [
  { id: "*", label: "Full Access (Administrator)", description: "Complete system access" },
  { id: "admin.users", label: "User Management", description: "Create, edit, and delete users" },
  { id: "admin.settings", label: "System Settings", description: "Modify system configuration" },
  { id: "admin.audit", label: "Audit Logs", description: "View system activity logs" },
  { id: "sales.*", label: "Sales Operations", description: "Full sales functionality" },
  { id: "customers.*", label: "Customer Management", description: "Full customer access" },
  { id: "leads.*", label: "Lead Management", description: "Manage sales leads" },
  { id: "inventory.*", label: "Inventory Management", description: "Full inventory control" },
  { id: "inventory.read", label: "View Inventory", description: "Read-only inventory access" },
  { id: "reports.*", label: "Reports Access", description: "Generate and view reports" },
  { id: "finance.*", label: "Finance Operations", description: "Financial management access" },
];

const departments = [
  "Sales",
  "Finance",
  "Service", 
  "Parts",
  "Marketing",
  "IT",
  "Management",
  "Administration"
];

const roles = [
  "Administrator",
  "Sales Manager",
  "Sales Associate",
  "Finance Manager",
  "Service Manager",
  "Service Advisor",
  "Parts Manager",
  "Marketing Specialist",
  "General Manager"
];

export default function UserForm({ user, onSuccess }: UserFormProps) {
  const { toast } = useToast();
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      role: user?.role || "",
      department: user?.department || "",
      phone: user?.phone || "",
      address: user?.address || "",
      bio: user?.bio || "",
      isActive: user?.isActive ?? true,
      permissions: user?.permissions || [],
      preferences: user?.preferences || {
        theme: "light",
        notifications: true,
        emailUpdates: false,
        timezone: "America/New_York",
      },
      password: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      await apiRequest("/api/users", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      await apiRequest(`/api/users/${user?.id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    if (user) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.smith@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="john.smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(!user || user) && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{user ? "New Password (Optional)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    {user ? "Leave blank to keep current password" : "Minimum 6 characters"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Role and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address and Bio */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, City, State 12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief description about the user..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Active users can log in and access the system
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Permissions */}
        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Permissions</FormLabel>
                <FormDescription>
                  Select the permissions this user should have
                </FormDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <FormField
                    key={permission.id}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={permission.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, permission.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== permission.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              {permission.label}
                            </FormLabel>
                            <FormDescription className="text-xs">
                              {permission.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* User Preferences */}
        <div className="space-y-4">
          <div className="text-base font-medium">User Preferences</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="preferences.theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences.timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <FormField
              control={form.control}
              name="preferences.notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Push Notifications</FormLabel>
                    <FormDescription className="text-sm">
                      Receive push notifications for important updates
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences.emailUpdates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Email Updates</FormLabel>
                    <FormDescription className="text-sm">
                      Receive email notifications for system updates
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : (user ? "Update User" : "Create User")}
          </Button>
        </div>
      </form>
    </Form>
  );
}