import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Car,
  DollarSign,
  Edit,
  Save,
  X,
  History,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { usePixelTracker } from "@/hooks/use-pixel-tracker";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'interested' | 'negotiating' | 'sold' | 'lost';
  creditScore?: number;
  preferredContact: 'phone' | 'email' | 'text';
  notes?: string;
  assignedSalesperson?: string;
  source: 'website' | 'referral' | 'walk-in' | 'phone' | 'social';
  lastContact?: string;
  interestedVehicles?: string[];
  createdAt: string;
  updatedAt: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface Deal {
  id: number;
  customerId: number;
  vehicleId: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  salePrice: number;
  tradeValue?: number;
  financing?: string;
  createdAt: string;
}

export default function CustomerDetail() {
  const { trackInteraction } = usePixelTracker();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute("/customers/:id");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Partial<Customer>>({});

  const customerId = params?.id ? parseInt(params.id) : 0;

  // Fetch customer data
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['/api/customers', customerId],
    enabled: !!customerId,
  });

  // Fetch customer deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals', 'customer', customerId],
    enabled: !!customerId,
  });

  useEffect(() => {
    if (customer) {
      setEditedCustomer(customer);
      trackInteraction('customer_detail_view', `customer-${customerId}`);
    }
  }, [customer, customerId, trackInteraction]);

  const updateCustomer = useMutation({
    mutationFn: async (updatedData: Partial<Customer>) => {
      return apiRequest(`/api/customers/${customerId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setIsEditing(false);
      toast({
        title: "Customer Updated",
        description: "Customer information has been successfully updated.",
      });
      trackInteraction('customer_updated', `customer-${customerId}`);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update customer information.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateCustomer.mutate(editedCustomer);
  };

  const handleCancel = () => {
    setEditedCustomer(customer || {});
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'qualified': 'bg-green-100 text-green-800 border-green-200',
      'interested': 'bg-purple-100 text-purple-800 border-purple-200',
      'negotiating': 'bg-orange-100 text-orange-800 border-orange-200',
      'sold': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'lost': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  if (!match || !customerId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Customer not found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested customer could not be found.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Customer not found</h3>
          <p className="mt-1 text-sm text-gray-500">Customer ID {customerId} does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-xl font-medium text-white">
                {customer.firstName?.[0]}{customer.lastName?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {customer.firstName} {customer.lastName}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <Badge className={`${getStatusColor(customer.status)} border`}>
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">ID: {customer.id}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Customer
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={editedCustomer.firstName || ''}
                          onChange={(e) => setEditedCustomer({...editedCustomer, firstName: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{customer.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={editedCustomer.lastName || ''}
                          onChange={(e) => setEditedCustomer({...editedCustomer, lastName: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{customer.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedCustomer.email || ''}
                        onChange={(e) => setEditedCustomer({...editedCustomer, email: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-sm">{customer.email || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedCustomer.phone || ''}
                        onChange={(e) => setEditedCustomer({...editedCustomer, phone: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-sm">{customer.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sales Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Sales Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <Select
                      value={editedCustomer.status || customer.status}
                      onValueChange={(value) => setEditedCustomer({...editedCustomer, status: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="negotiating">Negotiating</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`${getStatusColor(customer.status)} border mt-1`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </Badge>
                  )}
                </div>

                <div>
                  <Label htmlFor="creditScore">Credit Score</Label>
                  {isEditing ? (
                    <Input
                      id="creditScore"
                      type="number"
                      value={editedCustomer.creditScore || ''}
                      onChange={(e) => setEditedCustomer({...editedCustomer, creditScore: parseInt(e.target.value)})}
                    />
                  ) : (
                    <p className="text-sm mt-1">{customer.creditScore || 'Not assessed'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="assignedSalesperson">Assigned Salesperson</Label>
                  {isEditing ? (
                    <Input
                      id="assignedSalesperson"
                      value={editedCustomer.assignedSalesperson || ''}
                      onChange={(e) => setEditedCustomer({...editedCustomer, assignedSalesperson: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm mt-1">{customer.assignedSalesperson || 'Not assigned'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="source">Lead Source</Label>
                  {isEditing ? (
                    <Select
                      value={editedCustomer.source || customer.source}
                      onValueChange={(value) => setEditedCustomer({...editedCustomer, source: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="walk-in">Walk-in</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm mt-1 capitalize">{customer.source}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Customer Deals
                </div>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Deal
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dealsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading deals...</p>
                </div>
              ) : deals.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No deals yet</h3>
                  <p className="mt-1 text-sm text-gray-500">This customer hasn't started any deals.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div key={deal.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Deal #{deal.id}</h4>
                          <p className="text-sm text-gray-600">Sale Price: ${deal.salePrice.toLocaleString()}</p>
                        </div>
                        <Badge variant="outline">{deal.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                <p className="mt-1 text-sm text-gray-500">Customer activity will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedCustomer.notes || ''}
                  onChange={(e) => setEditedCustomer({...editedCustomer, notes: e.target.value})}
                  placeholder="Add notes about this customer..."
                  className="min-h-[200px]"
                />
              ) : (
                <div className="min-h-[200px]">
                  {customer.notes ? (
                    <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
                  ) : (
                    <p className="text-gray-500 text-sm">No notes available. Click Edit Customer to add notes.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}