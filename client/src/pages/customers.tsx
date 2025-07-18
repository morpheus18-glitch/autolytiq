import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  User,
  TrendingUp,
  CheckCircle,
  CreditCard,
  AlertCircle,
  Users,
  TrendingDown,
  UserCheck,
  Info
} from 'lucide-react';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  cellPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  creditScore?: number;
  income?: number;
  status: string;
  salesConsultant?: string;
  leadSource?: string;
  notes?: string;
  createdAt: string;
  isActive: boolean;
}

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
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
    leadSource: 'website',
    notes: ''
  });

  const { data: customers = [], isLoading, error } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customer: any) => {
      const customerData = {
        ...customer,
        name: `${customer.firstName} ${customer.lastName}`,
        creditScore: customer.creditScore ? parseInt(customer.creditScore) : null,
        income: customer.income ? parseFloat(customer.income) : null,
        isActive: true
      };
      return await apiRequest('/api/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });
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
        leadSource: 'website',
        notes: ''
      });
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/customers/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const handleCreateCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email || !newCustomer.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createCustomerMutation.mutate(newCustomer);
  };

  const handleDeleteCustomer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomerMutation.mutate(id);
    }
  };

  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'customer': return <UserCheck className="h-3 w-3" />;
      case 'prospect': return <User className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
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
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-3xl font-bold">Customer Management</h1>
          <p className="text-sm md:text-base text-gray-600">Complete CRM system for managing customer relationships</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
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
                      placeholder="720"
                    />
                  </div>
                  <div>
                    <Label htmlFor="income">Annual Income</Label>
                    <Input
                      id="income"
                      type="number"
                      value={newCustomer.income}
                      onChange={(e) => setNewCustomer({...newCustomer, income: e.target.value})}
                      placeholder="75000"
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
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="walk-in">Walk-in</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="advertising">Advertising</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                      placeholder="Additional notes about the customer..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCustomer} disabled={createCustomerMutation.isPending}>
                    {createCustomerMutation.isPending ? 'Adding...' : 'Add Customer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center">
              <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-600 mr-2" />
              <span className="text-lg md:text-2xl font-bold">{customers.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Hot Leads</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-red-600 mr-2" />
              <span className="text-lg md:text-2xl font-bold">{customers.filter(c => c.status === 'hot').length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Active Customers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600 mr-2" />
              <span className="text-lg md:text-2xl font-bold">{customers.filter(c => c.status === 'customer').length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Avg Credit Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center">
              <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-purple-600 mr-2" />
              <span className="text-lg md:text-2xl font-bold">
                {Math.round(customers.reduce((sum, c) => sum + (c.creditScore || 0), 0) / customers.length) || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[100px] md:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="hot">Hot Lead</SelectItem>
              <SelectItem value="warm">Warm Lead</SelectItem>
              <SelectItem value="cold">Cold Lead</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Customer Database</CardTitle>
          <CardDescription>
            {filteredCustomers.length} customers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-gray-600 mb-4">Add your first customer to get started</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer: Customer) => (
                <div key={customer.id} className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm md:text-base">{customer.name}</h3>
                          <Badge className={`${getStatusColor(customer.status)} text-xs`}>
                            {getStatusIcon(customer.status)}
                            <span className="ml-1">{customer.status}</span>
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="hidden md:inline">{customer.email}</span>
                            <span className="md:hidden">{customer.email.split('@')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.city}, {customer.state}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {customer.creditScore}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        <Phone className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Call</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        <Mail className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Email</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        <Edit className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}