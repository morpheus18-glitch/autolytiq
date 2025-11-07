/**
 * Showroom Board - Deal Lifecycle Kanban
 *
 * Visual board for tracking deals through their lifecycle
 * Lanes: New → Working → Pending F&I → Delivered → Unwound → Title/Problem
 * Drag & drop with local state, POST /api/deals/:id/move when backend exists
 */

import { useState, useMemo } from 'react';
import {
  LaneBoard,
  Lane,
  LaneCard,
  LaneCardHeader,
  LaneCardTitle,
  LaneCardDescription,
  LaneCardContent,
  LaneCardFooter,
  LaneCardBadge,
} from '@repo/ui';
import { Car, User, DollarSign, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Deal statuses matching backend schema
export type DealStatus =
  | 'NEW'
  | 'WORKING'
  | 'PENDING_FI'
  | 'DELIVERED'
  | 'UNWOUND'
  | 'TITLE_PROBLEM';

export interface ShowroomDeal {
  id: string;
  dealNumber: string;
  status: DealStatus;
  customer: {
    name: string;
    phone?: string;
  };
  vehicle: {
    year: number;
    make: string;
    model: string;
    vin: string;
    stockNumber?: string;
  };
  pricing: {
    salePrice: number;
    monthlyPayment?: number;
  };
  salesperson: string;
  createdAt: string;
  updatedAt: string;
  daysInStage: number;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}

interface ShowroomBoardProps {
  /** Initial deals (if server-side rendered) */
  initialDeals?: ShowroomDeal[];
  /** Callback when deal is moved */
  onDealMove?: (dealId: string, fromStatus: DealStatus, toStatus: DealStatus) => Promise<void>;
}

/**
 * Showroom Deal Board - Kanban view of deal lifecycle
 */
export function ShowroomBoard({ initialDeals = [], onDealMove }: ShowroomBoardProps) {
  const [deals, setDeals] = useState<ShowroomDeal[]>(initialDeals);
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // Group deals by status
  const dealsByStatus = useMemo(() => {
    const grouped: Record<DealStatus, ShowroomDeal[]> = {
      NEW: [],
      WORKING: [],
      PENDING_FI: [],
      DELIVERED: [],
      UNWOUND: [],
      TITLE_PROBLEM: [],
    };

    deals.forEach((deal) => {
      grouped[deal.status].push(deal);
    });

    // Sort by daysInStage descending (oldest first)
    Object.keys(grouped).forEach((status) => {
      grouped[status as DealStatus].sort((a, b) => b.daysInStage - a.daysInStage);
    });

    return grouped;
  }, [deals]);

  /**
   * Handle drag start
   */
  const handleDragStart = (dealId: string) => {
    setDraggingDealId(dealId);
  };

  /**
   * Handle drop onto lane
   */
  const handleDrop = async (newStatus: DealStatus) => {
    if (!draggingDealId) return;

    const deal = deals.find((d) => d.id === draggingDealId);
    if (!deal) return;

    const oldStatus = deal.status;
    if (oldStatus === newStatus) {
      setDraggingDealId(null);
      return;
    }

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        d.id === draggingDealId
          ? { ...d, status: newStatus, updatedAt: new Date().toISOString(), daysInStage: 0 }
          : d
      )
    );

    setDraggingDealId(null);
    setIsMoving(true);

    try {
      // Call backend if callback provided
      if (onDealMove) {
        await onDealMove(draggingDealId, oldStatus, newStatus);
      } else {
        // Mock API call (replace when backend exists)
        await new Promise((resolve) => setTimeout(resolve, 300));
        console.log(`[Mock API] Moving deal ${draggingDealId} from ${oldStatus} to ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to move deal:', err);
      // Revert on error
      setDeals((prev) =>
        prev.map((d) => (d.id === draggingDealId ? { ...d, status: oldStatus } : d))
      );
    } finally {
      setIsMoving(false);
    }
  };

  /**
   * Prevent default drag over to enable drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="h-full bg-surface-base p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Showroom Board</h1>
        <p className="text-sm text-text-secondary mt-1">
          Track deals through their lifecycle • Drag & drop to move stages
        </p>
      </div>

      {/* Kanban Board */}
      <LaneBoard height="full" className="h-[calc(100vh-160px)]">
        {/* New Deals */}
        <Lane
          title="New"
          count={dealsByStatus.NEW.length}
          color="blue"
          onDrop={() => handleDrop('NEW')}
          onDragOver={handleDragOver}
        >
          {dealsByStatus.NEW.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isDragging={draggingDealId === deal.id}
              onDragStart={() => handleDragStart(deal.id)}
            />
          ))}
        </Lane>

        {/* Working Deals */}
        <Lane
          title="Working"
          count={dealsByStatus.WORKING.length}
          color="yellow"
          onDrop={() => handleDrop('WORKING')}
          onDragOver={handleDragOver}
        >
          {dealsByStatus.WORKING.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isDragging={draggingDealId === deal.id}
              onDragStart={() => handleDragStart(deal.id)}
            />
          ))}
        </Lane>

        {/* Pending F&I */}
        <Lane
          title="Pending F&I"
          count={dealsByStatus.PENDING_FI.length}
          color="purple"
          onDrop={() => handleDrop('PENDING_FI')}
          onDragOver={handleDragOver}
        >
          {dealsByStatus.PENDING_FI.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isDragging={draggingDealId === deal.id}
              onDragStart={() => handleDragStart(deal.id)}
            />
          ))}
        </Lane>

        {/* Delivered */}
        <Lane
          title="Delivered"
          count={dealsByStatus.DELIVERED.length}
          color="green"
          onDrop={() => handleDrop('DELIVERED')}
          onDragOver={handleDragOver}
        >
          {dealsByStatus.DELIVERED.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isDragging={draggingDealId === deal.id}
              onDragStart={() => handleDragStart(deal.id)}
            />
          ))}
        </Lane>

        {/* Unwound */}
        <Lane
          title="Unwound"
          count={dealsByStatus.UNWOUND.length}
          color="red"
          onDrop={() => handleDrop('UNWOUND')}
          onDragOver={handleDragOver}
        >
          {dealsByStatus.UNWOUND.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isDragging={draggingDealId === deal.id}
              onDragStart={() => handleDragStart(deal.id)}
            />
          ))}
        </Lane>

        {/* Title/Problem */}
        <Lane
          title="Title/Problem"
          count={dealsByStatus.TITLE_PROBLEM.length}
          color="red"
          onDrop={() => handleDrop('TITLE_PROBLEM')}
          onDragOver={handleDragOver}
        >
          {dealsByStatus.TITLE_PROBLEM.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isDragging={draggingDealId === deal.id}
              onDragStart={() => handleDragStart(deal.id)}
            />
          ))}
        </Lane>
      </LaneBoard>

      {/* Moving indicator */}
      {isMoving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Updating deal...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Deal Card Component
 */
interface DealCardProps {
  deal: ShowroomDeal;
  isDragging: boolean;
  onDragStart: () => void;
}

function DealCard({ deal, isDragging, onDragStart }: DealCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getToneFromPriority = (priority?: string) => {
    if (priority === 'high') return 'error';
    if (priority === 'medium') return 'warning';
    return 'neutral';
  };

  return (
    <LaneCard
      tone={getToneFromPriority(deal.priority)}
      isDragging={isDragging}
      draggable
      onDragStart={onDragStart}
    >
      <LaneCardHeader>
        <div className="flex items-center justify-between">
          <LaneCardTitle className="text-sm">{deal.dealNumber}</LaneCardTitle>
          {deal.priority && (
            <LaneCardBadge variant={deal.priority === 'high' ? 'error' : 'warning'}>
              {deal.priority}
            </LaneCardBadge>
          )}
        </div>
        {deal.daysInStage > 0 && (
          <LaneCardDescription>
            {deal.daysInStage} day{deal.daysInStage > 1 ? 's' : ''} in stage
          </LaneCardDescription>
        )}
      </LaneCardHeader>

      <LaneCardContent>
        {/* Customer */}
        <div className="flex items-center gap-2 text-xs">
          <User className="h-3.5 w-3.5 text-accent-primary flex-shrink-0" />
          <span className="font-semibold text-text-primary truncate">{deal.customer.name}</span>
        </div>

        {/* Vehicle */}
        <div className="flex items-center gap-2 text-xs">
          <Car className="h-3.5 w-3.5 text-accent-secondary flex-shrink-0" />
          <span className="text-text-secondary truncate">
            {deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 text-xs">
          <DollarSign className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
          <span className="font-mono font-semibold text-text-primary">
            {formatCurrency(deal.pricing.salePrice)}
          </span>
          {deal.pricing.monthlyPayment && (
            <span className="text-text-tertiary">
              @ {formatCurrency(deal.pricing.monthlyPayment)}/mo
            </span>
          )}
        </div>
      </LaneCardContent>

      <LaneCardFooter>
        <span className="text-xs text-text-tertiary">{deal.salesperson}</span>
        <span className="text-xs text-text-tertiary">
          {new Date(deal.updatedAt).toLocaleDateString()}
        </span>
      </LaneCardFooter>
    </LaneCard>
  );
}

/**
 * Mock data generator for testing
 */
export function generateMockDeals(): ShowroomDeal[] {
  const customers = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown', 'Chris Wilson'];
  const vehicles = [
    { year: 2023, make: 'Toyota', model: 'Camry' },
    { year: 2024, make: 'Honda', model: 'Accord' },
    { year: 2023, make: 'Ford', model: 'F-150' },
    { year: 2024, make: 'Chevrolet', model: 'Silverado' },
    { year: 2023, make: 'Tesla', model: 'Model 3' },
  ];
  const salespeople = ['Alice Chen', 'Bob Martinez', 'Carol Davis', 'David Lee'];
  const statuses: DealStatus[] = ['NEW', 'WORKING', 'PENDING_FI', 'DELIVERED', 'UNWOUND', 'TITLE_PROBLEM'];

  return Array.from({ length: 24 }, (_, i) => ({
    id: `deal-${i + 1}`,
    dealNumber: `D${(1000 + i).toString()}`,
    status: statuses[i % statuses.length],
    customer: {
      name: customers[i % customers.length],
      phone: `(555) ${String(i).padStart(3, '0')}-${String(i * 11).padStart(4, '0')}`,
    },
    vehicle: {
      ...vehicles[i % vehicles.length],
      vin: `1HGBH41JXMN${String(i).padStart(6, '0')}`,
      stockNumber: `STK${String(i + 1).padStart(4, '0')}`,
    },
    pricing: {
      salePrice: 25000 + i * 1000,
      monthlyPayment: i % 2 === 0 ? 450 + i * 10 : undefined,
    },
    salesperson: salespeople[i % salespeople.length],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    daysInStage: Math.floor(Math.random() * 14),
    priority: i % 5 === 0 ? 'high' : i % 3 === 0 ? 'medium' : undefined,
  }));
}
