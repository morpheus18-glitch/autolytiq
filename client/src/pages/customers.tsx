import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  User,
  Car,
  Calendar,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageCircle,
  DollarSign,
  CreditCard,
  Shield
} from 'lucide-react';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  cellPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  creditScore: number;
  income: number;
  status: string;
  salesConsultant: string;
  leadSource: string;
  notes: string;
  createdAt: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  purchaseHistory?: any[];
  tags?: string[];
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cellPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    creditScore: '',
    income: '',
    status: 'prospect',
    salesConsultant: '',
    leadSource: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['/api/customers'],
    retry: 1,
    retryDelay: 1000,
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customer: any) => {
      const customerData = {
        ...customer,
        name: `${customer.firstName} ${customer.lastName}`,
        creditScore: customer.creditScore ? parseInt(customer.creditScore) : null,
        income: customer.income ? parseFloat(customer.income) : null,
        tags: customer.tags || [],
        isActive: true
      };
      return await apiRequest('/api/customers', 'POST', customerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setShowAddDialog(false);
      setNewCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        cellPhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        creditScore: '',
        income: '',
        status: 'prospect',
        salesConsultant: '',
        leadSource: '',
        notes: ''
      });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      return await apiRequest(`/api/customers/${id}`, 'PUT', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setSelectedCustomer(null);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/customers/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      case 'prospect': return 'bg-gray-100 text-gray-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }
    createCustomerMutation.mutate(newCustomer);
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
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Customer Management</h1>
          <p className="text-gray-600">Manage your customer relationships and sales pipeline</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="cellPhone">Cell Phone</Label>
                <Input
                  id="cellPhone"
                  value={newCustomer.cellPhone}
                  onChange={(e) => setNewCustomer({...newCustomer, cellPhone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newCustomer.status} onValueChange={(value) => setNewCustomer({...newCustomer, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="hot">Hot Lead</SelectItem>
                    <SelectItem value="warm">Warm Lead</SelectItem>
                    <SelectItem value="cold">Cold Lead</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                  placeholder="Austin"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newCustomer.state}
                  onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}
                  placeholder="TX"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={newCustomer.zipCode}
                  onChange={(e) => setNewCustomer({...newCustomer, zipCode: e.target.value})}
                  placeholder="78701"
                />
              </div>
              <div>
                <Label htmlFor="creditScore">Credit Score</Label>
                <Input
                  id="creditScore"
                  type="number"
                  value={newCustomer.creditScore}
                  onChange={(e) => setNewCustomer({...newCustomer, creditScore: e.target.value})}
                  placeholder="750"
                />
              </div>
              <div>
                <Label htmlFor="income">Annual Income</Label>
                <Input
                  id="income"
                  type="number"
                  value={newCustomer.income}
                  onChange={(e) => setNewCustomer({...newCustomer, income: e.target.value})}
                  placeholder="65000"
                />
              </div>
              <div>
                <Label htmlFor="salesConsultant">Sales Consultant</Label>
                <Input
                  id="salesConsultant"
                  value={newCustomer.salesConsultant}
                  onChange={(e) => setNewCustomer({...newCustomer, salesConsultant: e.target.value})}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label htmlFor="leadSource">Lead Source</Label>
                <Select value={newCustomer.leadSource} onValueChange={(value) => setNewCustomer({...newCustomer, leadSource: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="walk-in">Walk-in</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="advertising">Advertising</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                  placeholder="Customer notes and preferences..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCustomer} disabled={createCustomerMutation.isPending}>
                {createCustomerMutation.isPending ? 'Creating...' : 'Create Customer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="hot">Hot Leads</SelectItem>
            <SelectItem value="warm">Warm Leads</SelectItem>
            <SelectItem value="cold">Cold Leads</SelectItem>
            <SelectItem value="prospect">Prospects</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading customers...</p>
          </div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No customers found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first customer'}
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredCustomers.map((customer: Customer) => (
              <Card key={customer.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.salesConsultant}</p>
                  </div>
                  <Badge className={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                  {customer.creditScore && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className={`text-sm ${getCreditScoreColor(customer.creditScore)}`}>
                        {customer.creditScore}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteCustomerMutation.mutate(customer.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>Sales Consultant</TableHead>
                    <TableHead>Lead Source</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer: Customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-600">{customer.city}, {customer.state}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.creditScore && (
                          <span className={getCreditScoreColor(customer.creditScore)}>
                            {customer.creditScore}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{customer.salesConsultant}</TableCell>
                      <TableCell>{customer.leadSource}</TableCell>
                      <TableCell>
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteCustomerMutation.mutate(customer.id)}
                          >
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
        </div>
      )}
    </div>
  );
}