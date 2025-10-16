import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { ModuleHeader } from '@/components/ui/module-header';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  DollarSign, 
  Calendar,
  FileText,
  Star,
  Edit,
  Save,
  X,
  Calculator,
  MoreVertical,
  CreditCard
} from 'lucide-react';
import type { Customer, Lead, Sale } from '@shared/schema';

export default function CustomerDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction, setTrackedCustomer } = usePixelTracker();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Customer>>({});
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Initialize editData whenever entering edit mode
  useEffect(() => {
    if (isEditing && customer) {
      setEditData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        state: customer.state,
        status: customer.status,
        leadSource: customer.leadSource,
        creditScore: customer.creditScore,
        income: customer.income,
        notes: customer.notes
      });
    }
  }, [isEditing, customer]);
  
  // Collapsible section states
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);

  // Fetch customer data
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['/api/customers', id],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${id}`);
      if (!response.ok) throw new Error('Customer not found');
      return response.json();
    }
  });

  // Associate pixel tracker with this customer for lifecycle tracking
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
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', id] });
      setIsEditing(false);
      toast({ title: 'Success', description: 'Customer updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update customer', variant: 'destructive' });
    }
  });

  if (isLoading || !customer) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(editData);
    trackInteraction('button_click', { action: 'save_customer', customerId: id });
  };

  // Get customer initials
  const getInitials = () => {
    if (customer.name) {
      return customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    const first = customer.firstName?.[0] || '';
    const last = customer.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'CU';
  };

  const stats = [
    { 
      label: 'Total Leads', 
      value: leads.length
    },
    { 
      label: 'Total Sales', 
      value: sales.length
    },
    { 
      label: 'Total Revenue', 
      value: `$${sales.reduce((sum, sale) => sum + (sale.salePrice || 0), 0).toLocaleString()}`
    },
    { 
      label: 'Credit Score', 
      value: customer.creditScore || 'N/A'
    }
  ];

  const handleNewDeal = () => {
    trackInteraction('button_click', { action: 'new_deal', customerId: id });
    setLocation(`/professional-deal-desk?customerId=${id}`);
    setIsBottomSheetOpen(false);
  };

  const handleCall = () => {
    trackInteraction('button_click', { action: 'call_customer', customerId: id });
    window.open(`tel:${customer.phone}`);
    setIsBottomSheetOpen(false);
  };

  const handleEmail = () => {
    trackInteraction('button_click', { action: 'email_customer', customerId: id });
    window.open(`mailto:${customer.email}`);
    setIsBottomSheetOpen(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsBottomSheetOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Module Header */}
      <ModuleHeader
        module="crm"
        title={customer.name || `${customer.firstName} ${customer.lastName}`}
        subtitle="Customer Profile"
        icon={User}
        stats={stats}
        action={
          isEditing ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelEdit}
                className="bg-white text-gray-900"
                data-testid="button-cancel-edit"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={updateMutation.isPending}
                className="bg-white text-indigo-600 hover:bg-white/90 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
                data-testid="button-save-customer"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsBottomSheetOpen(true)}
              className="bg-white text-gray-900"
              data-testid="button-actions"
            >
              <MoreVertical className="w-4 h-4 mr-2" />
              Actions
            </Button>
          )
        }
      />

      <div className="px-4 py-6 space-y-6">
        {/* Customer Avatar */}
        <div className="flex justify-center -mt-16 mb-6">
          <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white text-4xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            <TabsTrigger value="leads" data-testid="tab-leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="sales" data-testid="tab-sales">Sales ({sales.length})</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-6">
            {/* Contact Information */}
            <CollapsibleSection
              title="Contact Information"
              icon={Phone}
              isExpanded={isContactExpanded}
              onToggle={() => setIsContactExpanded(!isContactExpanded)}
              iconColor="text-indigo-600"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">First Name</p>
                  {isEditing ? (
                    <Input
                      value={editData.firstName || ''}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      data-testid="input-first-name"
                    />
                  ) : (
                    <p className="font-medium" data-testid="text-customer-first-name">{customer.firstName || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Last Name</p>
                  {isEditing ? (
                    <Input
                      value={editData.lastName || ''}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      data-testid="input-last-name"
                    />
                  ) : (
                    <p className="font-medium" data-testid="text-customer-last-name">{customer.lastName || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Phone Number</p>
                  {isEditing ? (
                    <Input
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      data-testid="input-phone"
                    />
                  ) : (
                    <p className="font-medium" data-testid="text-customer-phone">{customer.phone || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Email Address</p>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      data-testid="input-email"
                    />
                  ) : (
                    <p className="font-medium" data-testid="text-customer-email">{customer.email || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">City</p>
                    {isEditing ? (
                      <Input
                        value={editData.city || ''}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        data-testid="input-city"
                      />
                    ) : (
                      <p className="font-medium" data-testid="text-customer-city">{customer.city || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">State</p>
                    {isEditing ? (
                      <Input
                        value={editData.state || ''}
                        onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                        data-testid="input-state"
                      />
                    ) : (
                      <p className="font-medium" data-testid="text-customer-state">{customer.state || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Customer Details */}
            <CollapsibleSection
              title="Customer Details"
              icon={CreditCard}
              isExpanded={isDetailsExpanded}
              onToggle={() => setIsDetailsExpanded(!isDetailsExpanded)}
              iconColor="text-indigo-600"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Status</p>
                  {isEditing ? (
                    <Input
                      value={editData.status || ''}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      data-testid="input-status"
                    />
                  ) : (
                    <Badge 
                      variant={customer.status === 'active' ? 'default' : 'secondary'}
                      data-testid="badge-customer-status"
                    >
                      {customer.status || 'Unknown'}
                    </Badge>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Lead Source</p>
                  {isEditing ? (
                    <Input
                      value={editData.leadSource || ''}
                      onChange={(e) => setEditData({ ...editData, leadSource: e.target.value })}
                      data-testid="input-lead-source"
                    />
                  ) : (
                    <p className="font-medium" data-testid="text-lead-source">{customer.leadSource || 'Not specified'}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Credit Score</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.creditScore ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditData({ ...editData, creditScore: val === '' ? undefined : parseInt(val, 10) });
                      }}
                      data-testid="input-credit-score"
                    />
                  ) : (
                    <p className="font-medium" data-testid="text-credit-score">{customer.creditScore || 'Not available'}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Annual Income</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.income ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditData({ ...editData, income: val === '' ? undefined : parseInt(val, 10) });
                      }}
                      data-testid="input-income"
                    />
                  ) : (
                    <p className="font-medium" data-testid="text-annual-income">
                      {customer.income ? `$${customer.income.toLocaleString()}` : 'Not provided'}
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Date Added</p>
                  <p className="font-medium" data-testid="text-date-added">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Notes */}
            {(customer.notes || isEditing) && (
              <CollapsibleSection
                title="Notes"
                icon={FileText}
                isExpanded={isNotesExpanded}
                onToggle={() => setIsNotesExpanded(!isNotesExpanded)}
                iconColor="text-indigo-600"
              >
                {isEditing ? (
                  <Textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={4}
                    placeholder="Add notes about this customer..."
                    data-testid="input-notes"
                  />
                ) : (
                  <p className="text-gray-700" data-testid="text-customer-notes">{customer.notes}</p>
                )}
              </CollapsibleSection>
            )}
          </TabsContent>

          <TabsContent value="leads">
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
              <h3 className="font-semibold text-lg mb-4">Customer Leads</h3>
              {leads.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No leads found for this customer.</p>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        trackInteraction('button_click', { action: 'view_lead', leadId: lead.id });
                        setLocation(`/leads/${lead.id}`);
                      }}
                      data-testid={`card-lead-${lead.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{lead.leadNumber}</h4>
                        <Badge variant="outline">{lead.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{lead.notes}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Lead #{lead.id}</span>
                        <span>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
              <h3 className="font-semibold text-lg mb-4">Customer Sales</h3>
              {sales.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No sales found for this customer.</p>
              ) : (
                <div className="space-y-4">
                  {sales.map((sale) => (
                    <div 
                      key={sale.id} 
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        trackInteraction('button_click', { action: 'view_sale', saleId: sale.id });
                        setLocation(`/sales/${sale.id}`);
                      }}
                      data-testid={`card-sale-${sale.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Sale #{sale.id}</h4>
                        <Badge variant="default">${sale.salePrice?.toLocaleString()}</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Vehicle ID: {sale.vehicleId}</span>
                        <span>{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
              <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
              <p className="text-gray-600 text-center py-8">Activity tracking coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Sheet for Quick Actions */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Quick Actions"
      >
        <div className="space-y-3">
          <Button
            variant="default"
            className="w-full justify-start shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]"
            onClick={handleNewDeal}
            data-testid="button-new-deal"
          >
            <Calculator className="w-5 h-5 mr-3" />
            New Deal
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleCall}
            data-testid="button-call"
          >
            <Phone className="w-5 h-5 mr-3" />
            Call
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleEmail}
            data-testid="button-email"
          >
            <Mail className="w-5 h-5 mr-3" />
            Email
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleEdit}
            data-testid="button-edit"
          >
            <Edit className="w-5 h-5 mr-3" />
            Edit
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
