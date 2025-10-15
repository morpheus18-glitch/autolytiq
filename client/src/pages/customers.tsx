import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Upload
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

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your customer relationships and contacts</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/customers/new" className="w-full sm:w-auto">
            <Button size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Total</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{customers.length}</p>
              </div>
              <User className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Hot</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
                  {customers.filter(c => c.status === 'hot').length}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-red-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Warm</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">
                  {customers.filter(c => c.status === 'warm').length}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-yellow-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Active</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                  {customers.filter(c => c.status === 'customer').length}
                </p>
              </div>
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.map((customer) => (
              <Card 
                key={customer.id} 
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setLocation(`/customers/${customer.id}`)}
                data-testid={`row-customer-${customer.id}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{customer.firstName} {customer.lastName}</h3>
                    <p className="text-xs text-gray-500">Customer #{customer.id}</p>
                  </div>
                  <Badge className={`${getStatusColor(customer.status || 'prospect')} text-xs px-2 py-1 ml-2`}>
                    {getStatusIcon(customer.status || 'prospect')}
                    <span className="ml-1 capitalize">{customer.status || 'prospect'}</span>
                  </Badge>
                </div>
                <div className="space-y-1 mb-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{customer.city}, {customer.state}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-1">
                  <CustomerQuickActions
                    customer={customer}
                    buttonVariant="outline"
                    buttonSize="icon"
                    className="p-2"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2"
                    title="Call"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${customer.phone}`);
                    }}
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="p-2"
                    title="Email"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`mailto:${customer.email}`);
                    }}
                  >
                    <Mail className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="p-2"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(customer.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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
                    onClick={() => setLocation(`/customers/${customer.id}`)}
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
                            window.open(`tel:${customer.phone}`);
                          }}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Email"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`mailto:${customer.email}`);
                          }}
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
  );
}