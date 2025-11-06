import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Badge,
  Card,
  CardContent,
  Alert,
  Avatar,
  PageHeader,
  StatCard
} from '@repo/ui';
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
  const navigate = useNavigate();
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'hot': return 'error' as const;
      case 'warm': return 'warning' as const;
      case 'cold': return 'info' as const;
      case 'customer': return 'success' as const;
      default: return 'secondary' as const;
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
        <Alert variant="error" className="max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Customers</h3>
            <p className="mb-4">Unable to load customer data</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/customers'] })}>
              Try Again
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <Card
      onClick={() => {
        trackInteraction('customer_view', { customerId: customer.id });
        navigate(`/customers/${customer.id}`);
      }}
      hover
      className="cursor-pointer"
      data-testid={`card-customer-${customer.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar size="md" className="bg-gradient-to-br from-blue-500 to-blue-600">
              {getInitials(customer.firstName, customer.lastName)}
            </Avatar>
            <div>
              <h3 className="font-bold">{customer.firstName} {customer.lastName}</h3>
              <p className="text-sm text-text-secondary">{customer.email}</p>
            </div>
          </div>
          <Badge variant={getStatusVariant(customer.status || 'prospect')}>
            {getStatusLabel(customer.status || 'prospect')}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="w-4 h-4" />
            <span>Last contact: {customer.lastContactDate ? new Date(customer.lastContactDate).toLocaleDateString() : '2 hours ago'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Calendar className="w-4 h-4" />
            <span>Next follow-up: {customer.nextFollowUpDate ? new Date(customer.nextFollowUpDate).toLocaleDateString() : 'Today, 3:00 PM'}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border-base">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold">Score: {getCustomerScore(customer)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-status-success">
              <DollarSign className="w-4 h-4" />
              {(getLifetimeValue(customer) / 1000).toFixed(0)}K LTV
            </div>
          </div>

          {/* Start Deal Button */}
          <Button
            variant="primary"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              trackInteraction('start_deal', { customerId: customer.id });
              openDealStudio({ customerId: customer.id });
            }}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Start Deal
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-surface-base min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold" data-testid="text-page-title">Customer CRM</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowCustomerForm(true)}
                data-testid="button-add-customer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <StatCard label="Total Leads" value={totalLeads} variant="glass" data-testid="stat-total-leads" />
            <StatCard label="Hot Leads" value={hotLeads} variant="glass" data-testid="stat-hot-leads" />
            <StatCard label="Due Today" value={dueToday} variant="glass" data-testid="stat-due-today" />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedFilter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
              className={selectedFilter === 'all' ? '' : 'text-white hover:bg-white/20'}
              data-testid="filter-all-customers"
            >
              All Customers
            </Button>
            <Button
              variant={selectedFilter === 'hot' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilter('hot')}
              className={selectedFilter === 'hot' ? '' : 'text-white hover:bg-white/20'}
              data-testid="filter-hot-leads"
            >
              Hot Leads
            </Button>
            <Button
              variant={selectedFilter === 'due-today' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilter('due-today')}
              className={selectedFilter === 'due-today' ? '' : 'text-white hover:bg-white/20'}
              data-testid="filter-followup-today"
            >
              Follow-up Today
            </Button>
            <Button
              variant={selectedFilter === 'active-deals' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilter('active-deals')}
              className={selectedFilter === 'active-deals' ? '' : 'text-white hover:bg-white/20'}
              data-testid="filter-active-deals"
            >
              Active Deals
            </Button>
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
              <div className="text-center py-12">
                <User className="w-12 h-12 mx-auto mb-3 text-text-tertiary" />
                <p className="text-text-secondary">No customers found</p>
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
