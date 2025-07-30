import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import MobileResponsiveLayout from '@/components/layout/mobile-responsive-layout';
import StatsGrid from '@/components/layout/stats-grid';
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
  X
} from 'lucide-react';
import type { Customer, Lead, Sale } from '@shared/schema';

export default function CustomerDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Customer>>({});

  // Fetch customer data
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['/api/customers', id],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${id}`);
      if (!response.ok) throw new Error('Customer not found');
      return response.json();
    }
  });

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(editData);
    trackInteraction('button_click', { action: 'save_customer', customerId: id });
  };

  const stats = [
    { 
      label: 'Total Leads', 
      value: leads.length, 
      icon: <FileText className="w-4 h-4" />,
      color: 'blue' as const
    },
    { 
      label: 'Total Sales', 
      value: sales.length, 
      icon: <Car className="w-4 h-4" />,
      color: 'green' as const
    },
    { 
      label: 'Total Revenue', 
      value: `$${sales.reduce((sum, sale) => sum + (sale.finalPrice || 0), 0).toLocaleString()}`, 
      icon: <DollarSign className="w-4 h-4" />,
      color: 'orange' as const
    },
    { 
      label: 'Credit Score', 
      value: customer.creditScore || 'N/A', 
      icon: <Star className="w-4 h-4" />,
      color: 'default' as const
    }
  ];

  const headerActions = (
    <>
      {isEditing ? (
        <>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" onClick={() => window.open(`tel:${customer.phone}`)}>
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" onClick={() => window.open(`mailto:${customer.email}`)}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </>
      )}
    </>
  );

  return (
    <MobileResponsiveLayout
      title={customer.name || `${customer.firstName} ${customer.lastName}`}
      subtitle="Customer Profile"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        <StatsGrid stats={stats} cols={4} />

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="sales">Sales ({sales.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {customer.name || `${customer.firstName} ${customer.lastName}`}
                      </p>
                      <p className="text-sm text-gray-600">Full Name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{customer.phone || 'Not provided'}</p>
                      <p className="text-sm text-gray-600">Phone Number</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{customer.email || 'Not provided'}</p>
                      <p className="text-sm text-gray-600">Email Address</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {customer.city && customer.state ? `${customer.city}, ${customer.state}` : 'Not provided'}
                      </p>
                      <p className="text-sm text-gray-600">Location</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                      {customer.status || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lead Source</p>
                    <p className="font-medium">{customer.leadSource || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Credit Score</p>
                    <p className="font-medium">{customer.creditScore || 'Not available'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Annual Income</p>
                    <p className="font-medium">
                      {customer.income ? `$${customer.income.toLocaleString()}` : 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date Added</p>
                    <p className="font-medium">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {customer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{customer.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Customer Leads</CardTitle>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No leads found for this customer.</p>
                ) : (
                  <div className="space-y-4">
                    {leads.map((lead) => (
                      <div key={lead.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{lead.leadNumber}</h4>
                          <Badge variant="outline">{lead.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{lead.notes}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Sales Person: {lead.salesPerson}</span>
                          <span>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Customer Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No sales found for this customer.</p>
                ) : (
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div key={sale.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Sale #{sale.id}</h4>
                          <Badge variant="default">${sale.finalPrice?.toLocaleString()}</Badge>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Sales Person: {sale.salesPerson}</span>
                          <span>{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">Activity tracking coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileResponsiveLayout>
  );
}