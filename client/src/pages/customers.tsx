import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ModuleHeader, FilterPill } from '@/components/ui/module-header';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  User,
  MapPin,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Users
} from 'lucide-react';
import CustomerQuickActions from '@/components/customer-quick-actions';
import type { Customer } from '@shared/schema';

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  const [, setLocation] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: customers = [], isLoading, error } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({ title: 'Customer deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete customer', variant: 'destructive' });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      trackInteraction('customer_delete', { customerId: id });
      deleteCustomerMutation.mutate(id);
    }
  };

  // Filter customers based on search and status
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = searchTerm === '' || 
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hot': return <TrendingUp className="h-3 w-3" />;
      case 'warm': return <TrendingUp className="h-3 w-3" />;
      case 'cold': return <TrendingDown className="h-3 w-3" />;
      case 'customer': return <CheckCircle className="h-3 w-3" />;
      case 'prospect': return <User className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Customers</h3>
          <p className="text-gray-600 mb-4">Unable to load customer data</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/customers'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalCustomers = customers.length;
  const hotCustomers = customers.filter(c => c.status === 'hot').length;
  const warmCustomers = customers.filter(c => c.status === 'warm').length;
  const activeCustomers = customers.filter(c => c.status === 'customer').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ModuleHeader with stats and filters */}
      <ModuleHeader
        module="crm"
        title="Customers"
        subtitle="Manage your customer relationships and contacts"
        icon={Users}
        action={
          <Link href="/customers/new">
            <Button 
              size="sm" 
              className="bg-white text-indigo-600 hover:bg-white/90 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
              data-testid="button-add-customer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </Link>
        }
        stats={[
          { label: 'Total', value: totalCustomers },
          { label: 'Hot', value: hotCustomers },
          { label: 'Warm', value: warmCustomers },
          { label: 'Active', value: activeCustomers }
        ]}
        filters={
          <>
            <FilterPill 
              active={filterStatus === 'all'} 
              onClick={() => setFilterStatus('all')}
              testId="filter-all"
            >
              All
            </FilterPill>
            <FilterPill 
              active={filterStatus === 'hot'} 
              onClick={() => setFilterStatus('hot')}
              testId="filter-hot"
            >
              Hot
            </FilterPill>
            <FilterPill 
              active={filterStatus === 'warm'} 
              onClick={() => setFilterStatus('warm')}
              testId="filter-warm"
            >
              Warm
            </FilterPill>
            <FilterPill 
              active={filterStatus === 'cold'} 
              onClick={() => setFilterStatus('cold')}
              testId="filter-cold"
            >
              Cold
            </FilterPill>
            <FilterPill 
              active={filterStatus === 'customer'} 
              onClick={() => setFilterStatus('customer')}
              testId="filter-customer"
            >
              Customer
            </FilterPill>
            <FilterPill 
              active={filterStatus === 'prospect'} 
              onClick={() => setFilterStatus('prospect')}
              testId="filter-prospect"
            >
              Prospect
            </FilterPill>
          </>
        }
      />

      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Search and Additional Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-customers"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" data-testid="button-import">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Customer List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Mobile Cards - New Design */}
            <div className="md:hidden space-y-3">
              {filteredCustomers.map((customer) => (
                <Card 
                  key={customer.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => {
                    trackInteraction('customer_view', { customerId: customer.id });
                    setLocation(`/customers/${customer.id}`);
                  }}
                  data-testid={`card-customer-${customer.id}`}
                >
                  <CardContent className="p-4">
                    {/* Top Section: Avatar + Name + Status Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold">
                            {getInitials(customer.firstName, customer.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-sm dark:text-white">{customer.firstName} {customer.lastName}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(customer.status || 'prospect')} text-xs px-2 py-1 ml-2 capitalize`}>
                        {customer.status || 'prospect'}
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span>{customer.city}, {customer.state}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                      <CustomerQuickActions
                        customer={customer}
                        buttonVariant="outline"
                        buttonSize="sm"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        title="Call"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackInteraction('customer_call', { customerId: customer.id });
                          window.open(`tel:${customer.phone}`);
                        }}
                        data-testid={`button-call-${customer.id}`}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        title="Email"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackInteraction('customer_email', { customerId: customer.id });
                          window.open(`mailto:${customer.email}`);
                        }}
                        data-testid={`button-email-${customer.id}`}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(customer.id);
                        }}
                        data-testid={`button-delete-${customer.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table */}
            <Card className="hidden md:block">
              <CardHeader>
                <CardTitle>Customer Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Lead Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => {
                        trackInteraction('customer_view', { customerId: customer.id });
                        setLocation(`/customers/${customer.id}`);
                      }}
                      data-testid={`row-customer-${customer.id}`}
                    >
                      <TableCell>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Customer #{customer.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status || 'prospect')}>
                          {getStatusIcon(customer.status || 'prospect')}
                          <span className="ml-1 capitalize">{customer.status || 'prospect'}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {customer.city}, {customer.state}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{customer.leadSource || 'website'}</span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <CustomerQuickActions customer={customer} buttonVariant="ghost" buttonSize="icon" />
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Call"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackInteraction('customer_call', { customerId: customer.id });
                              window.open(`tel:${customer.phone}`);
                            }}
                            data-testid={`button-call-${customer.id}`}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Email"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackInteraction('customer_email', { customerId: customer.id });
                              window.open(`mailto:${customer.email}`);
                            }}
                            data-testid={`button-email-${customer.id}`}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(customer.id);
                            }}
                            data-testid={`button-delete-${customer.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
