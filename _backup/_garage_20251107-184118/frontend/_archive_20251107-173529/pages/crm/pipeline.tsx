import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

// Types
interface PipelineDeal {
  id: string;
  stage: string;
  status: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    vin: string;
  } | null;
  salesperson: {
    id: string;
    name: string;
  } | null;
  sellingPrice: number | null;
  grossProfit: number | null;
  createdAt: string;
  updatedAt: string;
  daysInStage: number;
  totalDays: number;
}

interface PipelineColumn {
  stage: string;
  deals: PipelineDeal[];
  totalDeals: number;
  totalValue: number;
  avgDaysInStage: number;
}

interface PipelineData {
  columns: PipelineColumn[];
  summary: {
    totalDeals: number;
    totalValue: number;
    avgDealValue: number;
    avgDaysToClose: number;
  };
}

const STAGE_LABELS: Record<string, string> = {
  LEAD: 'Leads',
  WORKING: 'Working',
  PENDING_FINANCE: 'Pending Finance',
  APPROVED: 'Approved',
  PENDING_DELIVERY: 'Pending Delivery',
  DELIVERED: 'Delivered',
  LOST: 'Lost',
};

const STAGE_COLORS: Record<string, string> = {
  LEAD: 'bg-gray-100 border-gray-300',
  WORKING: 'bg-blue-50 border-blue-300',
  PENDING_FINANCE: 'bg-yellow-50 border-yellow-300',
  APPROVED: 'bg-green-50 border-green-300',
  PENDING_DELIVERY: 'bg-purple-50 border-purple-300',
  DELIVERED: 'bg-emerald-50 border-emerald-300',
  LOST: 'bg-red-50 border-red-300',
};

export default function PipelinePage() {
  const [filters, setFilters] = useState({
    salesPersonId: '',
    status: [] as string[],
  });

  const queryClient = useQueryClient();

  // Fetch pipeline data
  const { data: pipelineData, isLoading } = useQuery<PipelineData>({
    queryKey: ['pipeline', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.salesPersonId) params.append('salesPersonId', filters.salesPersonId);
      filters.status.forEach((s) => params.append('status', s));

      const response = await apiRequest('GET', `/api/pipeline?${params}`);
      return response.data;
    },
  });

  // Move deal mutation
  const moveDealMutation = useMutation({
    mutationFn: async ({ dealId, newStage }: { dealId: string; newStage: string }) => {
      await apiRequest('PATCH', `/api/pipeline/deals/${dealId}/stage`, {
        stage: newStage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, deal: PipelineDeal) => {
    e.dataTransfer.setData('dealId', deal.id);
    e.dataTransfer.setData('currentStage', deal.stage);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    const currentStage = e.dataTransfer.getData('currentStage');

    if (currentStage !== newStage) {
      moveDealMutation.mutate({ dealId, newStage });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deal Pipeline</h1>
            <p className="text-gray-600 mt-1">Track and manage all active deals</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + New Deal
          </button>
        </div>

        {/* Summary Stats */}
        {pipelineData && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Deals</div>
              <div className="text-2xl font-bold text-gray-900">
                {pipelineData.summary.totalDeals}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Value</div>
              <div className="text-2xl font-bold text-gray-900">
                ${(pipelineData.summary.totalValue / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Avg Deal Value</div>
              <div className="text-2xl font-bold text-gray-900">
                ${(pipelineData.summary.avgDealValue / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Avg Days to Close</div>
              <div className="text-2xl font-bold text-gray-900">
                {pipelineData.summary.avgDaysToClose} days
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineData?.columns.map((column) => (
          <div
            key={column.stage}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.stage)}
          >
            {/* Column Header */}
            <div className={`rounded-t-lg border-2 p-4 ${STAGE_COLORS[column.stage]}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-900">{STAGE_LABELS[column.stage]}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-semibold">
                  {column.totalDeals}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                <div>${(column.totalValue / 1000).toFixed(0)}K total</div>
                <div>{column.avgDaysInStage} days avg</div>
              </div>
            </div>

            {/* Column Body */}
            <div className="bg-gray-100 rounded-b-lg border-2 border-t-0 border-gray-300 p-2 min-h-[500px] max-h-[700px] overflow-y-auto">
              <div className="space-y-2">
                {column.deals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Deal Card Component
function DealCard({
  deal,
  onDragStart,
}: {
  deal: PipelineDeal;
  onDragStart: (e: React.DragEvent, deal: PipelineDeal) => void;
}) {
  // Color indicators based on days in stage
  const getDaysColor = (days: number) => {
    if (days < 3) return 'text-green-600';
    if (days < 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitColor = (profit: number | null) => {
    if (!profit) return 'text-gray-600';
    if (profit > 3000) return 'text-green-600';
    if (profit > 1500) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move p-4 border border-gray-200"
    >
      {/* Customer Name */}
      <div className="font-semibold text-gray-900 mb-2">{deal.customer.name}</div>

      {/* Vehicle */}
      {deal.vehicle && (
        <div className="text-sm text-gray-700 mb-2">
          {deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}
        </div>
      )}

      {/* Metrics */}
      <div className="flex justify-between items-center text-sm mb-2">
        <div>
          {deal.sellingPrice && (
            <div className="font-semibold text-gray-900">
              ${(deal.sellingPrice / 1000).toFixed(1)}K
            </div>
          )}
        </div>
        {deal.grossProfit !== null && (
          <div className={`font-semibold ${getProfitColor(deal.grossProfit)}`}>
            ${(deal.grossProfit / 1000).toFixed(1)}K profit
          </div>
        )}
      </div>

      {/* Salesperson */}
      {deal.salesperson && (
        <div className="text-xs text-gray-600 mb-2">{deal.salesperson.name}</div>
      )}

      {/* Days in stage */}
      <div className="flex justify-between items-center text-xs">
        <span className={`font-semibold ${getDaysColor(deal.daysInStage)}`}>
          {deal.daysInStage} days in stage
        </span>
        <span className="text-gray-500">{deal.totalDays} days total</span>
      </div>

      {/* Contact Info */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        {deal.customer.phone && (
          <div className="text-xs text-gray-600">{deal.customer.phone}</div>
        )}
        {deal.customer.email && (
          <div className="text-xs text-gray-600 truncate">{deal.customer.email}</div>
        )}
      </div>
    </div>
  );
}
