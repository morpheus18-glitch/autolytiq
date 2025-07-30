import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import MobileResponsiveLayout from '@/components/layout/mobile-responsive-layout';
import AdvancedSearch from '@/components/search/advanced-search';
import SearchResults from '@/components/search/search-results';
import StatsGrid from '@/components/layout/stats-grid';
import { useSearch } from '@/hooks/use-search';
import { 
  Plus, 
  Users, 
  Phone, 
  Mail, 
  Star,
  TrendingUp,
  Eye,
  Edit,
  UserPlus
} from 'lucide-react';
import type { Customer } from '@shared/schema';

export default function EnhancedCustomers() {
  const { toast } = useToast();
  const { trackInteraction } = usePixelTracker();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Enhanced search with advanced filtering
  const {
    searchTerm,
    filters,
    updateSearchTerm,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useSearch({
    searchFields: ['name', 'firstName', 'lastName', 'email', 'phone'],
    initialFilters: {}
  });

  // Fetch customers data
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Filter options for advanced search
  const filterOptions = [
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Prospect', value: 'prospect' },
        { label: 'Sold', value: 'sold' },
        { label: 'Inactive', value: 'inactive' }
      ]
    },
    {
      id: 'leadSource',
      label: 'Lead Source',
      type: 'select' as const,
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Referral', value: 'referral' },
        { label: 'Walk-in', value: 'walk-in' },
        { label: 'Phone', value: 'phone' },
        { label: 'Social Media', value: 'social' },
        { label: 'Advertisement', value: 'advertisement' }
      ]
    },
    {
      id: 'creditScore',
      label: 'Credit Score',
      type: 'range' as const,
      placeholder: 'Enter credit score range'
    },
    {
      id: 'income',
      label: 'Annual Income',
      type: 'range' as const,
      placeholder: 'Enter income range'
    },
    {
      id: 'state',
      label: 'State',
      type: 'select' as const,
      options: [
        { label: 'Texas', value: 'TX' },
        { label: 'California', value: 'CA' },
        { label: 'Florida', value: 'FL' },
        { label: 'New York', value: 'NY' },
        { label: 'Illinois', value: 'IL' }
      ]
    },
    {
      id: 'createdAt',
      label: 'Date Added',
      type: 'date' as const,
      placeholder: 'Select date'
    }
  ];

  // Apply filters to customers
  const filteredCustomers = customers.filter(customer => {
    // Search term filter
    if (searchTerm) {
      const searchFields = [
        customer.name || '',
        customer.firstName || '',
        customer.lastName || '',
        customer.email || '',
        customer.phone || '',
        customer.notes || ''
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Advanced filters
    if (filters.status && customer.status !== filters.status) return false;
    if (filters.leadSource && customer.leadSource !== filters.leadSource) return false;
    if (filters.state && customer.state !== filters.state) return false;
    
    if (filters.creditScore) {
      const { min, max } = filters.creditScore;
      if (min && (customer.creditScore || 0) < parseInt(min)) return false;
      if (max && (customer.creditScore || 0) > parseInt(max)) return false;
    }
    
    if (filters.income) {
      const { min, max } = filters.income;
      if (min && (customer.income || 0) < parseFloat(min)) return false;
      if (max && (customer.income || 0) > parseFloat(max)) return false;
    }

    return true;
  });

  // Convert customers to search results format
  const searchResults = filteredCustomers.map(customer => ({
    id: customer.id,
    title: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
    subtitle: customer.email || 'No email provided',
    description: customer.notes || 'No notes available',
    badges: [
      { label: customer.status || 'Unknown', variant: customer.status === 'active' ? 'default' : 'secondary' as const },
      { label: customer.leadSource || 'Unknown Source', variant: 'outline' as const },
      ...(customer.creditScore ? [{ label: `Credit: ${customer.creditScore}`, variant: 'secondary' as const }] : [])
    ],
    metadata: {
      phone: customer.phone || 'N/A',
      location: customer.city && customer.state ? `${customer.city}, ${customer.state}` : 'N/A',
      income: customer.income ? `$${customer.income.toLocaleString()}` : 'N/A',
      creditScore: customer.creditScore || 'N/A',
      dateAdded: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'
    },
    actions: [
      {
        label: 'View Profile',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => {
          trackInteraction('button_click', { action: 'view_customer', customerId: customer.id });
          toast({ title: 'Customer Profile', description: `Viewing ${customer.name}` });
        }
      },
      {
        label: 'Edit',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => {
          trackInteraction('button_click', { action: 'edit_customer', customerId: customer.id });
          toast({ title: 'Edit Customer', description: 'Opening edit dialog...' });
        }
      },
      {
        label: 'Call',
        icon: <Phone className="w-4 h-4" />,
        onClick: () => {
          trackInteraction('button_click', { action: 'call_customer', customerId: customer.id });
          if (customer.phone) {
            window.open(`tel:${customer.phone}`);
          } else {
            toast({ title: 'No Phone Number', description: 'Customer has no phone number on file', variant: 'destructive' });
          }
        }
      },
      {
        label: 'Email',
        icon: <Mail className="w-4 h-4" />,
        onClick: () => {
          trackInteraction('button_click', { action: 'email_customer', customerId: customer.id });
          if (customer.email) {
            window.open(`mailto:${customer.email}`);
          } else {
            toast({ title: 'No Email Address', description: 'Customer has no email address on file', variant: 'destructive' });
          }
        }
      }
    ]
  }));

  // Stats for customers
  const stats = [
    {
      label: 'Total Customers',
      value: customers.length,
      icon: <Users className="w-4 h-4" />,
      color: 'blue' as const
    },
    {
      label: 'Active Customers',
      value: customers.filter(c => c.status === 'active').length,
      icon: <UserPlus className="w-4 h-4" />,
      color: 'green' as const
    },
    {
      label: 'Avg Credit Score',
      value: Math.round(customers.reduce((sum, c) => sum + (c.creditScore || 0), 0) / customers.filter(c => c.creditScore).length) || 0,
      icon: <Star className="w-4 h-4" />,
      color: 'orange' as const
    },
    {
      label: 'Filtered Results',
      value: filteredCustomers.length,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'default' as const
    }
  ];

  const headerActions = (
    <>
      <Button variant="outline" className="gap-2">
        <Phone className="w-4 h-4" />
        Call List
      </Button>
      <Button className="gap-2">
        <Plus className="w-4 h-4" />
        Add Customer
      </Button>
    </>
  );

  return (
    <MobileResponsiveLayout
      title="Customer Management"
      subtitle="Manage customer relationships with advanced search and filtering"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <StatsGrid stats={stats} cols={4} />

        {/* Advanced Search */}
        <AdvancedSearch
          searchTerm={searchTerm}
          onSearchChange={updateSearchTerm}
          filters={filterOptions}
          activeFilters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          onExport={() => {
            trackInteraction('button_click', { action: 'export_customers' });
            toast({ title: 'Export Started', description: 'Downloading customer data...' });
          }}
          onRefresh={() => {
            toast({ title: 'Data Refreshed', description: 'Customer data updated successfully' });
          }}
          resultCount={filteredCustomers.length}
          loading={isLoading}
        />

        {/* Search Results */}
        <SearchResults
          results={searchResults}
          loading={isLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOptions={[
            { label: 'Name', value: 'name' },
            { label: 'Credit Score', value: 'creditScore' },
            { label: 'Income', value: 'income' },
            { label: 'Date Added', value: 'createdAt' }
          ]}
          emptyMessage={hasActiveFilters ? 
            "No customers match your search criteria. Try adjusting your filters." :
            "No customers found. Add some customers to get started."
          }
          showActions={true}
        />
      </div>
    </MobileResponsiveLayout>
  );
}