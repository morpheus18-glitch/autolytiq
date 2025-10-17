import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const userRoleSchema = z.enum(['ADMIN', 'MANAGER', 'SALES', 'FINANCE', 'SERVICE', 'BDC']);

const userListSchema = z.object({
  users: z
    .array(
      z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        role: z.string(),
        status: z.string(),
        lastLoginAt: z.string().optional().nullable(),
      }),
    )
    .default([]),
});

type UserListResponse = z.infer<typeof userListSchema>;

const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Provide a valid email'),
  phone: z.string().optional(),
  role: userRoleSchema,
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserRow extends UserFormValues {
  id: string;
  lastLoginAt?: string | null;
}

const defaultFormValues: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'SALES',
  status: 'ACTIVE',
  password: '',
};

export function UsersSettings(): JSX.Element {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const { data, isLoading } = useQuery<UserListResponse>({
    queryKey: ['settings', 'users', 'list'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/users');
      const json = (await response.json()) as unknown;
      const parsed = userListSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return { users: [] } satisfies UserListResponse;
    },
  });

  const users = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return data?.users ?? [];
    }
    return (data?.users ?? []).filter((user) => {
      return (
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    });
  }, [data?.users, searchTerm]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: defaultFormValues,
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    form.reset(defaultFormValues);
  };

  const upsertMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const payload: Record<string, unknown> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        status: values.status,
      };

      if (values.password) {
        payload.password = values.password;
      }

      if (editingUser) {
        const response = await apiRequest('PUT', `/api/settings/users/${editingUser.id}`, payload);
        return response.json();
      }

      const response = await apiRequest('POST', '/api/settings/users', payload);
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings', 'users', 'list'] });
      toast({ title: editingUser ? 'User updated' : 'User added' });
      closeDialog();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save user record.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('DELETE', `/api/settings/users/${userId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings', 'users', 'list'] });
      toast({ title: 'User deactivated' });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update user status.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    upsertMutation.mutate(values);
  });

  const openForCreate = () => {
    setEditingUser(null);
    form.reset(defaultFormValues);
    setDialogOpen(true);
  };

  const openForEdit = (user: UserRow) => {
    setEditingUser(user);
    form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role as UserFormValues['role'],
      status: (user.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
      password: '',
    });
    setDialogOpen(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Team Members</CardTitle>
            <p className="text-sm text-muted-foreground">Manage access for your dealership staff.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
            <DialogTrigger asChild>
              <Button onClick={openForCreate}>Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Update User' : 'Invite New User'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
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
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userRoleSchema.options.map((role) => (
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {!editingUser ? (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Temporary Password</FormLabel>
                            <FormControl>
                              <Input type="password" autoComplete="new-password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : null}
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={closeDialog} disabled={upsertMutation.isPending}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={upsertMutation.isPending}>
                      {upsertMutation.isPending ? 'Saving…' : editingUser ? 'Update User' : 'Invite User'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search team members"
              className="w-full sm:max-w-sm"
            />
          </div>
          <div className="overflow-hidden rounded border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/70">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card/30">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 text-sm text-foreground">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.role}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.status}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openForEdit(user)}>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deactivateMutation.mutate(user.id)}
                            disabled={deactivateMutation.isPending}
                          >
                            Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Access Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleSwitch
            enabled
            onChange={() => {
              /* toggle 2FA placeholder for future logic */
            }}
            label="Require two-factor authentication"
            description="Applies to all admin and finance roles."
          />
          <ToggleSwitch
            enabled
            onChange={() => {
              /* placeholder for forcing password reset */
            }}
            label="Enforce quarterly password rotation"
            description="Automatically prompts users to update their password every 90 days."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default UsersSettings;
