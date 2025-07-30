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
  Target, 
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Phone,
  Calculator,
  FileText
} from 'lucide-react';
import type { Lead, Sale } from '@shared/schema';

export default function EnhancedSales() {
  const { toast } = useToast();
  const { trackInteraction } = usePixelTracker();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'leads' | 'sales'>('leads');

  // Enhanced search with advanced filtering
  const {
    searchTerm,
    filters,
    updateSearchTerm,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useSearch({
    searchFields: ['leadNumber', 'salesPerson', 'customerName', 'notes'],
    initialFilters: {}
  });

  // Fetch leads and sales data
  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ['/api/sales'],
  });

  const isLoading = leadsLoading || salesLoading;

  // Filter options for advanced search
  const leadFilterOptions = [
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Negotiating', value: 'negotiating' },
        { label: 'Closed Won', value: 'closed_won' },
        { label: 'Closed Lost', value: 'closed_lost' }
      ]
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' }
      ]
    },
    {
      id: 'source',
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
      id: 'estimatedValue',
      label: 'Estimated Value',
      type: 'range' as const,
      placeholder: 'Enter value range'
    },
    {
      id: 'salesPerson',
      label: 'Sales Person',
      type: 'select' as const,
      options: [
        { label: 'Austin Williams', value: 'Austin Williams' },
        { label: 'Sarah Johnson', value: 'Sarah Johnson' },
        { label: 'Mike Rodriguez', value: 'Mike Rodriguez' },
        { label: 'Jessica Park', value: 'Jessica Park' }
      ]
    },
    {
      id: 'createdAt',
      label: 'Date Created',
      type: 'date' as const,
      placeholder: 'Select date'
    }
  ];

  // Get current data based on active tab
  const currentData = activeTab === 'leads' ? leads : sales;

  // Apply filters to current data
  const filteredData = currentData.filter(item => {
    // Search term filter
    if (searchTerm) {
      const searchFields = [
        'leadNumber' in item ? item.leadNumber : '',
        'salesPerson' in item ? item.salesPerson : '',
        'notes' in item ? item.notes || '' : '',
        // Add customer name search if available
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Advanced filters
    if (filters.status && item.status !== filters.status) return false;
    if (filters.priority && 'priority' in item && item.priority !== filters.priority) return false;
    if (filters.source && 'source' in item && item.source !== filters.source) return false;
    if (filters.salesPerson && item.salesPerson !== filters.salesPerson) return false;
    
    if (filters.estimatedValue && 'estimatedValue' in item) {
      const { min, max } = filters.estimatedValue;
      if (min && (item.estimatedValue || 0) < parseFloat(min)) return false;
      if (max && (item.estimatedValue || 0) > parseFloat(max)) return false;
    }

    return true;
  });

  // Convert data to search results format
  const searchResults = filteredData.map(item => {
    const isLead = 'leadNumber' in item;
    const lead = item as Lead;
    const sale = item as Sale;

    return {
      id: item.id,
      title: isLead ? `Lead ${lead.leadNumber}` : `Sale #${sale.id}`,
      subtitle: isLead ? `${lead.salesPerson}` : `${sale.salesPerson} - $${sale.finalPrice?.toLocaleString()}`,
      description: item.notes || 'No notes available',
      badges: [
        { label: item.status || 'Unknown', variant: item.status === 'closed_won' ? 'default' : 'secondary' as const },
        ...(isLead && lead.priority ? [{ label: lead.priority, variant: 'outline' as const }] : []),
        ...(isLead && lead.estimatedValue ? [{ label: `$${lead.estimatedValue.toLocaleString()}`, variant: 'secondary' as const }] : [])
      ],
      metadata: {
        salesPerson: item.salesPerson,
        status: item.status,
        ...(isLead ? {
          priority: lead.priority || 'N/A',
          source: lead.source || 'N/A',
          estimatedValue: lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : 'N/A'
        } : {
          finalPrice: `$${sale.finalPrice?.toLocaleString()}`,
          commission: sale.commission ? `$${sale.commission.toLocaleString()}` : 'N/A',
          saleDate: sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'
        }),
        dateCreated: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
      },
      actions: [
        {
          label: 'View Details',
          icon: <Eye className="w-4 h-4" />,
          onClick: () => {
            trackInteraction('button_click', { action: `view_${activeTab}`, id: item.id });
            toast({ title: `${isLead ? 'Lead' : 'Sale'} Details`, description: `Viewing details...` });
          }
        },
        {
          label: 'Edit',
          icon: <Edit className="w-4 h-4" />,
          onClick: () => {
            trackInteraction('button_click', { action: `edit_${activeTab}`, id: item.id });
            toast({ title: `Edit ${isLead ? 'Lead' : 'Sale'}`, description: 'Opening edit dialog...' });
          }
        },
        ...(isLead ? [
          {
            label: 'Contact',
            icon: <Phone className="w-4 h-4" />,
            onClick: () => {
              trackInteraction('button_click', { action: 'contact_lead', leadId: item.id });
              toast({ title: 'Contact Lead', description: 'Opening contact options...' });
            }
          },
          {
            label: 'Convert to Sale',
            icon: <Calculator className="w-4 h-4" />,
            onClick: () => {
              trackInteraction('button_click', { action: 'convert_lead', leadId: item.id });
              toast({ title: 'Convert Lead', description: 'Opening deal desk...' });
            }
          }
        ] : [
          {
            label: 'View Contract',
            icon: <FileText className="w-4 h-4" />,
            onClick: () => {
              trackInteraction('button_click', { action: 'view_contract', saleId: item.id });
              toast({ title: 'View Contract', description: 'Opening contract...' });
            }
          }
        ])
      ]
    };
  });

  // Stats calculation
  const totalLeads = leads.length;
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.finalPrice || 0), 0);
  const avgDealSize = totalSales > 0 ? totalRevenue / totalSales : 0;

  const stats = [
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: <Target className="w-4 h-4" />,
      color: 'blue' as const
    },
    {
      label: 'Total Sales',
      value: totalSales,
      icon: <Users className="w-4 h-4" />,
      color: 'green' as const
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'orange' as const
    },
    {
      label: 'Avg Deal Size',
      value: `$${Math.round(avgDealSize).toLocaleString()}`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'default' as const
    }
  ];

  const headerActions = (
    <>
      <Button variant="outline" className="gap-2">
        <FileText className="w-4 h-4" />
        Reports
      </Button>
      <Button className="gap-2">
        <Plus className="w-4 h-4" />
        {activeTab === 'leads' ? 'Add Lead' : 'Add Sale'}
      </Button>
    </>
  );

  return (
    <MobileResponsiveLayout
      title="Sales & Lead Management"
      subtitle="Manage leads and sales with advanced search and filtering"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <StatsGrid stats={stats} cols={4} />

        {/* Tab Navigation */}
        <div className="flex border-b">
          <Button
            variant={activeTab === 'leads' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('leads')}
            className="rounded-b-none"
          >
            Leads ({totalLeads})
          </Button>
          <Button
            variant={activeTab === 'sales' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sales')}
            className="rounded-b-none"
          >
            Sales ({totalSales})
          </Button>
        </div>

        {/* Advanced Search */}
        <AdvancedSearch
          searchTerm={searchTerm}
          onSearchChange={updateSearchTerm}
          filters={leadFilterOptions}
          activeFilters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          onExport={() => {
            trackInteraction('button_click', { action: `export_${activeTab}` });
            toast({ title: 'Export Started', description: `Downloading ${activeTab} data...` });
          }}
          onRefresh={() => {
            toast({ title: 'Data Refreshed', description: `${activeTab} data updated successfully` });
          }}
          resultCount={filteredData.length}
          loading={isLoading}
        />

        {/* Search Results */}
        <SearchResults
          results={searchResults}
          loading={isLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOptions={[
            { label: 'Date Created', value: 'createdAt' },
            { label: 'Status', value: 'status' },
            { label: 'Sales Person', value: 'salesPerson' },
            ...(activeTab === 'leads' ? [
              { label: 'Priority', value: 'priority' },
              { label: 'Estimated Value', value: 'estimatedValue' }
            ] : [
              { label: 'Sale Amount', value: 'finalPrice' },
              { label: 'Sale Date', value: 'saleDate' }
            ])
          ]}
          emptyMessage={hasActiveFilters ? 
            `No ${activeTab} match your search criteria. Try adjusting your filters.` :
            `No ${activeTab} found. Add some ${activeTab} to get started.`
          }
          showActions={true}
        />
      </div>
    </MobileResponsiveLayout>
  );
}