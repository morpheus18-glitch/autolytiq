import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { apiRequest } from '@/lib/queryClient';
import EnhancedSalesSearch from '@/components/enhanced-sales-search';
import LeadModal from '@/components/lead-modal';
import { 
  SlidersHorizontal, 
  List, 
  Target, 
  BarChart3, 
  Download, 
  Upload,
  Plus,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import type { Lead } from '@shared/schema';

export default function Sales() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'enhanced' | 'basic'>('enhanced');

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({ title: 'Lead deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete lead', variant: 'destructive' });
    },
  });

  const handleEdit = (lead: Lead) => {
    trackInteraction('lead_edit', `lead-${lead.id}`, lead.id);
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    trackInteraction('lead_add', 'add-lead-button');
    setSelectedLead(null);
    setIsAddModalOpen(true);
  };

  const handleView = (lead: Lead) => {
    trackInteraction('lead_view', `lead-${lead.id}`, lead.id);
    // Could open a detailed view modal here
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      trackInteraction('lead_delete', `lead-${id}`, id);
      deleteLeadMutation.mutate(id);
    }
  };

  const handleExport = () => {
    trackInteraction('sales_export', 'export-button');
    toast({ title: 'Export started', description: 'Your sales data is being exported...' });
  };

  const handleImport = () => {
    trackInteraction('sales_import', 'import-button');
    toast({ title: 'Import ready', description: 'Select a file to import sales data...' });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AutolytiQ - Sales Management</h1>
          <p className="text-gray-600">Advanced lead tracking and sales pipeline management</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleAdd} className="bg-primary hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'enhanced' | 'basic')}>
          <TabsList>
            <TabsTrigger value="enhanced" className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Enhanced Search
            </TabsTrigger>
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Basic View
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Target className="w-4 h-4 mr-1" />
            Lead Pipeline
          </Badge>
          <Badge variant="outline">
            <TrendingUp className="w-4 h-4 mr-1" />
            Sales Analytics
          </Badge>
          <Badge variant="outline">
            <DollarSign className="w-4 h-4 mr-1" />
            Revenue Tracking
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {viewMode === 'enhanced' ? (
          <EnhancedSalesSearch
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onAdd={handleAdd}
            showAddButton={true}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Basic Sales View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Switch to Enhanced Search for advanced lead management and sales analytics</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setViewMode('enhanced')}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Try Enhanced Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lead Modal */}
      {isAddModalOpen && (
        <LeadModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          lead={null}
        />
      )}
      
      {isEditModalOpen && (
        <LeadModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          lead={selectedLead}
        />
      )}
    </div>
  );
}