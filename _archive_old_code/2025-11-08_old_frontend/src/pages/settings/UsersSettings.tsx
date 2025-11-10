import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  settingsUserInputSchema,
  settingsUserPermissionKeys,
  settingsUserRoles,
  settingsUserStatuses,
  type SettingsUser,
  type SettingsUserInput,
} from '@shared/settings-schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@repo/ui';
import { usePermissions } from '@/hooks/usePermissions';
import {
  createUser,
  updateUser,
  fetchUsers,
  deactivateUser,
  resetUserPassword,
  type FetchUsersParams,
} from '@/lib/settingsUsersApi';
import { cn } from '@/lib/utils';
import { MoreVertical, Plus, ShieldAlert } from 'lucide-react';

const userFormSchema = settingsUserInputSchema.extend({
  password: z.preprocess(
    (value) => (typeof value === 'string' && value.trim().length === 0 ? undefined : value),
    z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long')
      .optional(),
  ),
});

type UserFormValues = z.infer<typeof userFormSchema>;

type PermissionKey = Extract<keyof SettingsUserInput['permissions'], string>;

const permissionKeys = settingsUserPermissionKeys as readonly PermissionKey[];

const applyPermissionDefaults = (
  source?: SettingsUserInput['permissions'],
): SettingsUserInput['permissions'] =>
  permissionKeys.reduce<SettingsUserInput['permissions']>((accumulator, key) => {
    accumulator[key] = source?.[key] ?? false;
    return accumulator;
  }, {} as SettingsUserInput['permissions']);

const createEmptyPermissions = (): SettingsUserInput['permissions'] => applyPermissionDefaults();

const defaultValues: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'SALES',
  status: 'ACTIVE',
  permissions: createEmptyPermissions(),
  password: undefined,
};

const permissionLabels: Record<keyof SettingsUserInput['permissions'], string> = {
  viewAllDeals: 'View all deals',
  editAllDeals: 'Edit all deals',
  deleteDeals: 'Delete deals',
  viewReports: 'View analytics reports',
  manageInventory: 'Manage inventory',
  approveDeals: 'Approve deal structures',
  accessAccounting: 'Access accounting workspace',
  manageSettings: 'Manage platform settings',
};

const statusLabel: Record<SettingsUser['status'], string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const buildPageRange = (current: number, total: number, max = 7): number[] => {
  if (total <= max) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

interface SortState {
  sortBy: FetchUsersParams['sortBy'];
  sortOrder: NonNullable<FetchUsersParams['sortOrder']>;
}

export function UsersSettings(): JSX.Element {
  const { hasRole } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SettingsUser | null>(null);
  const [filters, setFilters] = useState<{ role?: string; status?: string }>({});
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortState>({ sortBy: 'name', sortOrder: 'asc' });
  const [deactivateTarget, setDeactivateTarget] = useState<SettingsUser | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  const queryParams: FetchUsersParams = useMemo(
    () => ({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: search || undefined,
      role: filters.role && filters.role !== 'ALL' ? filters.role : undefined,
      status: filters.status && filters.status !== 'ALL' ? filters.status : undefined,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    }),
    [filters.role, filters.status, pagination.page, pagination.pageSize, search, sort.sortBy, sort.sortOrder],
  );

  const usersQuery = useQuery({
    queryKey: ['settings', 'users', queryParams],
    queryFn: () => fetchUsers(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const users = usersQuery.data?.data ?? [];
  const total = usersQuery.data?.meta.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));
  const pageNumbers = useMemo(() => buildPageRange(pagination.page, pageCount), [pagination.page, pageCount]);

  const upsertMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const permissions = applyPermissionDefaults(values.permissions);

      if (editingUser) {
        const payload = {
          ...values,
          permissions,
        } satisfies SettingsUserInput;

        const updatePayload = values.password ? { ...payload, password: values.password } : payload;
        return updateUser(editingUser.id, updatePayload);
      }

      if (!values.password) {
        throw new Error('Password is required for new users.');
      }

      const payload = {
        ...values,
        permissions,
        password: values.password,
      } satisfies SettingsUserInput & { password: string };
      return createUser(payload);
    },
    onSuccess: (user) => {
      toast({
        title: editingUser ? 'User updated' : 'User added',
        description: `${user.firstName} ${user.lastName} ${editingUser ? 'was updated successfully.' : 'has been invited.'}`,
      });
      setDialogOpen(false);
      setEditingUser(null);
      form.reset({ ...defaultValues, permissions: createEmptyPermissions() });
      void queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save user record.';
      if (message.includes('Email already exists')) {
        form.setError('email', { message: 'A user with this email already exists for this tenant.' });
      }
      toast({
        title: 'Action failed',
        description: message.replace(/^\d+:\s*/, ''),
        variant: 'destructive',
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => deactivateUser(userId),
    onSuccess: () => {
      toast({ title: 'User deactivated' });
      setDeactivateTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update user status.';
      toast({ title: 'Action failed', description: message.replace(/^\d+:\s*/, ''), variant: 'destructive' });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (user: SettingsUser) => {
      const response = await resetUserPassword(user.id);
      return { user, response };
    },
    onSuccess: ({ user, response }) => {
      toast({
        title: 'Password reset issued',
        description: (
          <div className="space-y-1">
            <p>
              Temporary password for <span className="font-medium">{user.email}</span>
            </p>
            {response.temporaryPassword ? (
              <code className="inline-block rounded bg-muted px-2 py-1 text-sm font-semibold">
                {response.temporaryPassword}
              </code>
            ) : null}
          </div>
        ),
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to reset password.';
      toast({ title: 'Action failed', description: message.replace(/^\d+:\s*/, ''), variant: 'destructive' });
    },
  });

  const openForCreate = () => {
    setEditingUser(null);
    form.reset({ ...defaultValues, permissions: createEmptyPermissions() });
    setDialogOpen(true);
  };

  const openForEdit = (user: SettingsUser) => {
    setEditingUser(user);
    form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      status: user.status,
      permissions: applyPermissionDefaults(user.permissions ?? undefined),
      password: undefined,
    });
    setDialogOpen(true);
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (!editingUser && !values.password) {
      form.setError('password', { message: 'Password is required for new users.' });
      return;
    }
    upsertMutation.mutate(values);
  });

  const toggleSort = (column: SortState['sortBy']) => {
    setSort((current) => {
      if (current.sortBy !== column) {
        return { sortBy: column, sortOrder: 'asc' };
      }
      return { sortBy: column, sortOrder: current.sortOrder === 'asc' ? 'desc' : 'asc' };
    });
  };

  const handlePageChange = (nextPage: number) => {
    setPagination((current) => ({ ...current, page: nextPage }));
  };

  if (!hasRole('ADMIN')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <ShieldAlert className="h-5 w-5" /> Restricted Access
          </CardTitle>
          <CardDescription>You need administrator privileges to manage users and roles.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Team Members</CardTitle>
            <p className="text-sm text-muted-foreground">Invite and manage users across every dealership role.</p>
          </div>
          <Button onClick={openForCreate} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
              placeholder="Search by name or email"
              className="w-full max-w-md"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select
                value={filters.role ?? 'ALL'}
                onValueChange={(value) => {
                  setFilters((current) => ({ ...current, role: value }));
                  setPagination((current) => ({ ...current, page: 1 }));
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All roles</SelectItem>
                  {settingsUserRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status ?? 'ALL'}
                onValueChange={(value) => {
                  setFilters((current) => ({ ...current, status: value }));
                  setPagination((current) => ({ ...current, page: 1 }));
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {settingsUserStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabel[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'role', label: 'Role' },
                    { key: 'status', label: 'Status' },
                    { key: 'lastLogin', label: 'Last Login' },
                  ].map(({ key, label }) => (
                    <TableHead key={key} className="cursor-pointer select-none" onClick={() => toggleSort(key as SortState['sortBy'])}>
                      <span className="flex items-center gap-2">
                        {label}
                        {sort.sortBy === key ? (
                          <span className="text-xs uppercase text-muted-foreground">
                            {sort.sortOrder === 'asc' ? 'ASC' : 'DESC'}
                          </span>
                        ) : null}
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.isLoading ? (
                  Array.from({ length: pagination.pageSize }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No team members match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className={cn(user.status === 'INACTIVE' && 'opacity-60')}> 
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{statusLabel[user.status]}</Badge>
                      </TableCell>
                      <TableCell>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openForEdit(user)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => resetPasswordMutation.mutate(user)}>Reset Password</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setDeactivateTarget(user)}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.page > 1) {
                      handlePageChange(pagination.page - 1);
                    }
                  }}
                  aria-disabled={pagination.page === 1}
                  className={cn(pagination.page === 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
              {pageNumbers.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pagination.page === pageNumber}
                    onClick={(event) => {
                      event.preventDefault();
                      handlePageChange(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.page < pageCount) {
                      handlePageChange(pagination.page + 1);
                    }
                  }}
                  aria-disabled={pagination.page >= pageCount}
                  className={cn(pagination.page >= pageCount && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingUser(null);
          form.reset({ ...defaultValues, permissions: createEmptyPermissions() });
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Update User' : 'Invite New User'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Update role-based permissions and contact details for this team member.'
                : 'Invite a new teammate and define the permissions they need to succeed.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="given-name" />
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
                        <Input {...field} autoComplete="family-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} autoComplete="email" />
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
                        <Input {...field} placeholder="(555) 123-4567" autoComplete="tel" />
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                  {settingsUserRoles.map((role) => (
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Status</FormLabel>
                        <DialogDescription>
                          Inactive team members retain audit history but lose access immediately.
                        </DialogDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value === 'ACTIVE'} onCheckedChange={(checked) => field.onChange(checked ? 'ACTIVE' : 'INACTIVE')} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {!editingUser ? (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
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

              <div>
                <h3 className="text-sm font-medium">Permissions</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Choose the capabilities this user should have across the platform.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {permissionKeys.map((permissionKey) => (
                    <FormField
                      key={permissionKey}
                      control={form.control}
                      name={`permissions.${permissionKey}` as const}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="text-sm font-medium leading-none">
                              {permissionLabels[permissionKey]}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={upsertMutation.isPending}>
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

      <AlertDialog open={deactivateTarget !== null} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate user?</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget
                ? `This will immediately remove access for ${deactivateTarget.firstName} ${deactivateTarget.lastName}.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deactivateTarget && deactivateMutation.mutate(deactivateTarget.id)}
              disabled={deactivateMutation.isPending}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default UsersSettings;
