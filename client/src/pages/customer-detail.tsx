import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { 
  User, 
  Phone, 
  Mail, 
  ChevronRight,
  DollarSign,
  Star,
  Clock,
  Activity,
  FileText,
  MessageSquare,
  Calendar
} from 'lucide-react';
import type { Customer, Lead, Sale } from '@shared/schema';

export default function CustomerDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction, setTrackedCustomer } = usePixelTracker();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'lead'
  });

  // Fetch customer data
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['/api/customers', id],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${id}`);
      if (!response.ok) throw new Error('Customer not found');
      return response.json();
    }
  });

  // Associate pixel tracker with this customer
  useEffect(() => {
    if (customer) {
      setTrackedCustomer(customer.id.toString());
    }
  }, [customer, setTrackedCustomer]);

  // Fetch customer leads
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['/api/leads', 'customer', id],
    queryFn: async () => {
      const response = await fetch(`/api/leads?customerId=${id}`);
      return response.json();
    }
  });

  // Fetch customer sales
  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ['/api/sales', 'customer', id],
    queryFn: async () => {
      const response = await fetch(`/api/sales?customerId=${id}`);
      return response.json();
    }
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      return await apiRequest(`/api/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  // Populate edit form when customer data loads
  useEffect(() => {
    if (customer) {
      setEditForm({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        status: customer.status || 'lead'
      });
    }
  }, [customer]);

  if (isLoading || !customer) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Get customer initials
  const getInitials = () => {
    const first = customer.firstName?.[0] || '';
    const last = customer.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'CU';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hot': return 'Hot Lead';
      case 'warm': return 'Warm Lead';
      case 'cold': return 'Cold Lead';
      case 'customer': return 'Customer';
      case 'prospect': return 'Prospect';
      default: return 'Lead';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-700';
      case 'warm': return 'bg-orange-100 text-orange-700';
      case 'cold': return 'bg-blue-100 text-blue-700';
      case 'customer': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Mock data for demo
  const lifetimeValue = (customer.id * 3000) + 20000;
  const leadScore = 45 + (customer.id * 7) % 50;
  const vehiclesOwned = sales.length;
  
  const currentInterests = [
    '2024 Toyota Camry XSE',
    '2024 Honda Accord Sport'
  ];

  const interactions = [
    { type: 'email', date: '2 hours ago', subject: 'Follow-up on test drive' },
    { type: 'call', date: 'Yesterday', subject: 'Discussed financing options' },
    { type: 'visit', date: '3 days ago', subject: 'Test drove Camry XSE' }
  ];

  const InteractionTimeline = () => (
    <div className="space-y-4">
      {interactions.map((interaction, index) => (
        <div key={index} className="flex gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            interaction.type === 'email' ? 'bg-blue-100' :
            interaction.type === 'call' ? 'bg-green-100' :
            'bg-purple-100'
          }`}>
            {interaction.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
            {interaction.type === 'call' && <Phone className="w-5 h-5 text-green-600" />}
            {interaction.type === 'visit' && <User className="w-5 h-5 text-purple-600" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold capitalize">{interaction.type}</span>
              <span className="text-sm text-gray-500">{interaction.date}</span>
            </div>
            <p className="text-sm text-gray-600">{interaction.subject}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-50 pb-6">
      {/* Content */}
      <div className="px-4 py-4">
        {/* Back Button */}
        <button 
          onClick={() => setLocation('/customers')}
          className="flex items-center gap-2 text-indigo-600 font-medium mb-4"
          data-testid="button-back-to-customers"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          Back to Customers
        </button>

        {/* Customer Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                {getInitials()}
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1" data-testid="text-customer-name">
                  {customer.firstName} {customer.lastName}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{customer.email}</span>
                  <span>•</span>
                  <span>{customer.phone}</span>
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(customer.status || 'prospect')}`}>
              {getStatusLabel(customer.status || 'prospect')}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg" data-testid="metric-lifetime-value">
              <div className="text-2xl font-bold text-green-600">
                ${(lifetimeValue / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-600">Lifetime Value</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg" data-testid="metric-lead-score">
              <div className="text-2xl font-bold text-yellow-600">{leadScore}</div>
              <div className="text-xs text-gray-600">Lead Score</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg" data-testid="metric-vehicles-owned">
              <div className="text-2xl font-bold text-blue-600">
                {vehiclesOwned}
              </div>
              <div className="text-xs text-gray-600">Vehicles Owned</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600'
              }`}
              data-testid="tab-overview"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600'
              }`}
              data-testid="tab-activity"
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'deals'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600'
              }`}
              data-testid="tab-deals"
            >
              Deals
            </button>
          </div>

          <div className="p-5">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Current Interests */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Current Interests
                  </h3>
                  <div className="space-y-2">
                    {currentInterests.map((interest, index) => (
                      <div key={index} className="p-3 bg-indigo-50 rounded-lg">
                        <div className="font-medium">{interest}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicles Owned */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Vehicle History
                  </h3>
                  <div className="space-y-2">
                    {sales.length > 0 ? (
                      sales.map((sale, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">
                              Vehicle Purchase
                            </div>
                            <div className="text-sm text-gray-500">Sale #{sale.id} - ${sale.salePrice?.toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No vehicle history</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    Notes
                  </h3>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-gray-700">{customer.notes || 'No notes available'}</p>
                  </div>
                </div>

                {/* Source Info */}
                <div>
                  <h3 className="font-bold mb-3">Lead Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Source</span>
                      <span className="font-medium capitalize">{customer.leadSource || 'Website'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Last Contact</span>
                      <span className="font-medium">
                        {customer.lastContactDate ? new Date(customer.lastContactDate).toLocaleDateString() : '2 hours ago'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Next Follow-up</span>
                      <span className="font-medium text-indigo-600">
                        {customer.nextFollowUpDate ? new Date(customer.nextFollowUpDate).toLocaleDateString() : 'Today, 3:00 PM'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Interaction Timeline
                </h3>
                <InteractionTimeline />
              </div>
            )}

            {activeTab === 'deals' && (
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  Active Deals
                </h3>
                {sales.length > 0 ? (
                  <div className="space-y-3">
                    {sales.map((sale, index) => (
                      <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-lg">Vehicle Sale</div>
                            <div className="text-sm text-gray-600">Deal ID: #{sale.id}</div>
                          </div>
                          <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                            Completed
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-green-200">
                          <span className="text-gray-600">Deal Value</span>
                          <span className="text-xl font-bold text-green-600">
                            ${sale.salePrice?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No active deals</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              trackInteraction('button_click', { action: 'call_customer', customerId: id });
              window.open(`tel:${customer.phone}`);
            }}
            className="py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            data-testid="button-call-customer"
          >
            <Phone className="w-4 h-4" />
            Call
          </button>
          <button 
            onClick={() => {
              trackInteraction('button_click', { action: 'email_customer', customerId: id });
              window.open(`mailto:${customer.email}`);
            }}
            className="py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            data-testid="button-email-customer"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button 
            onClick={() => {
              trackInteraction('button_click', { action: 'edit_customer', customerId: id });
              setEditDialogOpen(true);
            }}
            className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            data-testid="button-edit-customer"
          >
            Edit Customer
          </button>
          <button 
            onClick={() => {
              trackInteraction('button_click', { action: 'create_deal', customerId: id });
              setLocation(`/professional-deal-desk?customerId=${id}`);
            }}
            className="py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            data-testid="button-create-deal"
          >
            Create Deal
          </button>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                data-testid="input-edit-firstname"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                data-testid="input-edit-lastname"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                data-testid="input-edit-email"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                data-testid="input-edit-phone"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger data-testid="select-edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="hot">Hot Lead</SelectItem>
                  <SelectItem value="warm">Warm Lead</SelectItem>
                  <SelectItem value="cold">Cold Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => updateCustomerMutation.mutate(editForm)}
              disabled={updateCustomerMutation.isPending}
              className="w-full"
              data-testid="button-save-customer"
            >
              {updateCustomerMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
