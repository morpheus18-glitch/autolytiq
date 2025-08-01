import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { apiRequest } from '@/lib/queryClient';
import EnhancedCustomerSearch from '@/components/enhanced-customer-search';
import CustomerModal from '@/components/customer-modal';
import { 
  SlidersHorizontal, 
  List, 
  Users, 
  BarChart3, 
  Download, 
  Upload,
  UserPlus
} from 'lucide-react';
import type { Customer } from '@shared/schema';

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'enhanced' | 'basic'>('enhanced');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    salesConsultant: '',
    leadSource: 'website',
    notes: ''
  });

  const { data: customers = [], isLoading, error } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const salesConsultants = users.filter(user => user.role?.toLowerCase().includes('sales') || user.department?.toLowerCase().includes('sales'));

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

  const handleEdit = (customer: Customer) => {
    trackInteraction('customer_edit', `customer-${customer.id}`, customer.id);
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    trackInteraction('customer_add', 'add-customer-button');
    setSelectedCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleView = (customer: Customer) => {
    trackInteraction('customer_view', `customer-${customer.id}`, customer.id);
    // Could open a detailed view modal here
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      trackInteraction('customer_delete', `customer-${id}`, id);
      deleteCustomerMutation.mutate(id);
    }
  };

  const handleExport = () => {
    trackInteraction('customer_export', 'export-button');
    toast({ title: 'Export started', description: 'Your customer data is being exported...' });
  };

  const handleImport = () => {
    trackInteraction('customer_import', 'import-button');
    toast({ title: 'Import ready', description: 'Select a file to import customer data...' });
  };

  // Filter customers based on search and status
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = searchTerm === '' || 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
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
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
        <div>
          <h1 className="text-xl md:text-3xl font-bold">AutolytiQ - Customer Management</h1>
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer record with contact information
                </DialogDescription>
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
                    <Select value={newCustomer.salesConsultant} onValueChange={(value) => setNewCustomer({...newCustomer, salesConsultant: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales consultant" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesConsultants.map((consultant) => (
                          <SelectItem key={consultant.id} value={consultant.name}>
                            {consultant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          
          {/* Edit Customer Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
                <DialogDescription>
                  Update customer information and contact details
                </DialogDescription>
              </DialogHeader>
              {editingCustomer && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editFirstName">First Name *</Label>
                      <Input
                        id="editFirstName"
                        value={editingCustomer.firstName}
                        onChange={(e) => setEditingCustomer({...editingCustomer, firstName: e.target.value})}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editLastName">Last Name *</Label>
                      <Input
                        id="editLastName"
                        value={editingCustomer.lastName}
                        onChange={(e) => setEditingCustomer({...editingCustomer, lastName: e.target.value})}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEmail">Email *</Label>
                      <Input
                        id="editEmail"
                        type="email"
                        value={editingCustomer.email}
                        onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editPhone">Phone *</Label>
                      <Input
                        id="editPhone"
                        value={editingCustomer.phone}
                        onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCellPhone">Cell Phone</Label>
                      <Input
                        id="editCellPhone"
                        value={editingCustomer.cellPhone || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, cellPhone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editAddress">Address</Label>
                      <Input
                        id="editAddress"
                        value={editingCustomer.address || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCity">City</Label>
                      <Input
                        id="editCity"
                        value={editingCustomer.city || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, city: e.target.value})}
                        placeholder="Austin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editState">State</Label>
                      <Input
                        id="editState"
                        value={editingCustomer.state || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, state: e.target.value})}
                        placeholder="TX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editZipCode">ZIP Code</Label>
                      <Input
                        id="editZipCode"
                        value={editingCustomer.zipCode || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, zipCode: e.target.value})}
                        placeholder="78701"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCreditScore">Credit Score</Label>
                      <Input
                        id="editCreditScore"
                        type="number"
                        value={editingCustomer.creditScore || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, creditScore: parseInt(e.target.value) || 0})}
                        placeholder="720"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editStatus">Status</Label>
                      <Select value={editingCustomer.status} onValueChange={(value) => setEditingCustomer({...editingCustomer, status: value})}>
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
                      <Label htmlFor="editSalesConsultant">Sales Consultant</Label>
                      <Select value={editingCustomer.salesConsultant || ''} onValueChange={(value) => setEditingCustomer({...editingCustomer, salesConsultant: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sales consultant" />
                        </SelectTrigger>
                        <SelectContent>
                          {salesConsultants.map((consultant) => (
                            <SelectItem key={consultant.id} value={consultant.name}>
                              {consultant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateCustomer}>
                      Update Customer
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('hot')}>
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('customer')}>
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSearchTerm('')}>
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
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => handleEditCustomer(customer)}>
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