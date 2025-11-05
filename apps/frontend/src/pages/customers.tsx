import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { useDealStudioLauncher } from '@/hooks/useDealStudioLauncher';
import { CustomerEntryForm } from '@/components/forms/CustomerEntryForm';
import {
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  Star,
  Bell,
  ChevronRight,
  AlertCircle,
  Calculator,
  Plus
} from 'lucide-react';
import type { Customer } from '@shared/schema';

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  const [, setLocation] = useLocation();
  const { openDealStudio } = useDealStudioLauncher();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCustomerForm, setShowCustomerForm] = useState(false);

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

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer: Customer) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'hot') return customer.status === 'hot';
    if (selectedFilter === 'warm') return customer.status === 'warm';
    if (selectedFilter === 'cold') return customer.status === 'cold';
    if (selectedFilter === 'customer') return customer.status === 'customer';
    if (selectedFilter === 'due-today') return false; // TODO: implement follow-up date logic
    if (selectedFilter === 'active-deals') return false; // TODO: implement active deals logic
    return true;
  });

  // Calculate stats
  const totalLeads = customers.length;
  const hotLeads = customers.filter(c => c.status === 'hot').length;
  const dueToday = 0; // TODO: implement follow-up date logic

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

  // Get mock score for customer (0-100)
  const getCustomerScore = (customer: Customer) => {
    // Simple mock scoring based on customer ID
    return 45 + (customer.id * 7) % 50;
  };

  // Get mock lifetime value
  const getLifetimeValue = (customer: Customer) => {
    return (customer.id * 3000) + 20000;
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

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <div 
      onClick={() => {
        trackInteraction('customer_view', { customerId: customer.id });
        setLocation(`/customers/${customer.id}`);
      }}
      className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
      data-testid={`card-customer-${customer.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
            {getInitials(customer.firstName, customer.lastName)}
          </div>
          <div>
            <h3 className="font-bold">{customer.firstName} {customer.lastName}</h3>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(customer.status || 'prospect')}`}>
          {getStatusLabel(customer.status || 'prospect')}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Last contact: {customer.lastContactDate ? new Date(customer.lastContactDate).toLocaleDateString() : '2 hours ago'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Next follow-up: {customer.nextFollowUpDate ? new Date(customer.nextFollowUpDate).toLocaleDateString() : 'Today, 3:00 PM'}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold">Score: {getCustomerScore(customer)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
            <DollarSign className="w-4 h-4" />
            {(getLifetimeValue(customer) / 1000).toFixed(0)}K LTV
          </div>
        </div>

        {/* Start Deal Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            trackInteraction('start_deal', { customerId: customer.id });
            openDealStudio({ customerId: customer.id });
          }}
          className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <Calculator className="w-4 h-4" />
          Start Deal
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold" data-testid="text-page-title">Customer CRM</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustomerForm(true)}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-md"
                data-testid="button-add-customer"
              >
                <Plus className="w-4 h-4" />
                Add Customer
              </button>
              <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3" data-testid="stat-total-leads">
              <div className="text-2xl font-bold">{totalLeads}</div>
              <div className="text-xs text-indigo-100">Total Leads</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3" data-testid="stat-hot-leads">
              <div className="text-2xl font-bold">{hotLeads}</div>
              <div className="text-xs text-indigo-100">Hot Leads</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3" data-testid="stat-due-today">
              <div className="text-2xl font-bold">{dueToday}</div>
              <div className="text-xs text-indigo-100">Due Today</div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button 
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedFilter === 'all' ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              data-testid="filter-all-customers"
            >
              All Customers
            </button>
            <button 
              onClick={() => setSelectedFilter('hot')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedFilter === 'hot' ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              data-testid="filter-hot-leads"
            >
              Hot Leads
            </button>
            <button 
              onClick={() => setSelectedFilter('due-today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedFilter === 'due-today' ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              data-testid="filter-followup-today"
            >
              Follow-up Today
            </button>
            <button 
              onClick={() => setSelectedFilter('active-deals')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedFilter === 'active-deals' ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              data-testid="filter-active-deals"
            >
              Active Deals
            </button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map(customer => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No customers found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Entry Form Modal */}
      <CustomerEntryForm
        isOpen={showCustomerForm}
        onClose={() => setShowCustomerForm(false)}
        onSuccess={(customer) => {
          setShowCustomerForm(false);
          toast({ title: `Customer ${customer.firstName} ${customer.lastName} added successfully!` });
        }}
      />
    </div>
  );
}
