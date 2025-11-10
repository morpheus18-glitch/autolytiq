/**
 * DealWorkspace - Complete Deal Management Workspace
 *
 * Unified workspace combining:
 * - Deal Jacket (documents)
 * - Deal State Machine
 * - Timeline/Activity
 * - Notes & Communications
 * - AI Recommendations
 *
 * Features:
 * - State-aware interface (adapts to current deal stage)
 * - Contextual actions based on state
 * - Integrated document management
 * - Real-time collaboration
 * - Activity timeline
 * - Quick actions sidebar
 *
 * Perfect for: Deal Desking, F&I workflow, Manager review
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Play,
  Pause,
  X,
} from 'lucide-react';
import { Button } from './Button.js';
import { Badge } from './Badge.js';
import { Tabs } from './Tabs.js';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type DealStage =
  | 'lead'
  | 'qualified'
  | 'appointment'
  | 'showroom'
  | 'test_drive'
  | 'negotiation'
  | 'pending_approval'
  | 'approved'
  | 'finance'
  | 'contracted'
  | 'delivered'
  | 'lost';

export interface DealStateTransition {
  from: DealStage;
  to: DealStage;
  action: string;
  requiredPermission?: string;
  requiredDocuments?: string[];
  validations?: {
    field: string;
    message: string;
    validator: (deal: DealWorkspaceData) => boolean;
  }[];
}

export interface DealActivity {
  id: string;
  timestamp: Date;
  user: string;
  userRole: string;
  type: 'status_change' | 'document' | 'note' | 'communication' | 'ai_action' | 'approval';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface DealWorkspaceData {
  dealId: string;
  dealNumber: string;
  stage: DealStage;
  status: 'active' | 'paused' | 'on_hold' | 'cancelled';

  // Customer
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    creditScore?: number;
  };

  cobuyer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };

  // Vehicle
  vehicle: {
    id: string;
    vin: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    stock: string;
    cost: number;
    price: number;
  };

  // Trade-in (if applicable)
  tradeIn?: {
    vin: string;
    year: number;
    make: string;
    model: string;
    mileage: number;
    condition: string;
    estimatedValue: number;
    payoffAmount?: number;
  };

  // Deal Structure
  structure?: {
    salePrice: number;
    downPayment: number;
    tradeAllowance?: number;
    amountFinanced: number;
    term: number; // months
    rate: number; // APR
    monthlyPayment: number;
  };

  // Metrics
  metrics: {
    grossProfit: number;
    frontEndProfit: number;
    backEndProfit: number;
    totalProfit: number;
    approvalProbability?: number;
    closeProbability?: number;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  stageEnteredAt: Date;
  timeInStage: number; // minutes

  // Assigned Users
  assignedTo: {
    salesperson?: string;
    manager?: string;
    fiManager?: string;
  };

  // Activities
  activities: DealActivity[];

  // Quick Stats
  stats: {
    documentsComplete: number;
    documentsTotal: number;
    signaturesComplete: number;
    signaturesTotal: number;
    tasksComplete: number;
    tasksTotal: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// DEAL STATE MACHINE
// ═══════════════════════════════════════════════════════════════

export const DEAL_TRANSITIONS: DealStateTransition[] = [
  {
    from: 'lead',
    to: 'qualified',
    action: 'Qualify Lead',
  },
  {
    from: 'qualified',
    to: 'appointment',
    action: 'Schedule Appointment',
  },
  {
    from: 'appointment',
    to: 'showroom',
    action: 'Customer Arrived',
  },
  {
    from: 'showroom',
    to: 'test_drive',
    action: 'Start Test Drive',
    requiredDocuments: ['drivers_license'],
  },
  {
    from: 'test_drive',
    to: 'negotiation',
    action: 'Begin Negotiation',
  },
  {
    from: 'negotiation',
    to: 'pending_approval',
    action: 'Request Manager Approval',
    validations: [
      {
        field: 'structure',
        message: 'Deal structure must be complete',
        validator: (deal) => !!deal.structure,
      },
    ],
  },
  {
    from: 'pending_approval',
    to: 'approved',
    action: 'Approve Deal',
    requiredPermission: 'APPROVE_DEAL',
  },
  {
    from: 'approved',
    to: 'finance',
    action: 'Send to Finance',
    requiredDocuments: ['buyers_order', 'credit_app'],
  },
  {
    from: 'finance',
    to: 'contracted',
    action: 'Complete F&I',
    requiredDocuments: ['finance_contract'],
  },
  {
    from: 'contracted',
    to: 'delivered',
    action: 'Deliver Vehicle',
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface DealWorkspaceProps {
  data: DealWorkspaceData;
  onStageChange?: (newStage: DealStage) => Promise<void>;
  onStatusChange?: (newStatus: 'active' | 'paused' | 'on_hold' | 'cancelled') => void;
  onActivityAdd?: (activity: Omit<DealActivity, 'id' | 'timestamp'>) => void;
  onDocumentAction?: (action: 'upload' | 'view' | 'sign') => void;
  readOnly?: boolean;
  className?: string;
}

export const DealWorkspace: React.FC<DealWorkspaceProps> = ({
  data,
  onStageChange,
  onStatusChange,
  onActivityAdd,
  onDocumentAction,
  readOnly = false,
  className,
}) => {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  const [transitioning, setTransitioning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'documents' | 'activity' | 'ai'>('overview');

  // ═══════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════

  const availableTransitions = DEAL_TRANSITIONS.filter((t) => t.from === data.stage);

  const getStageColor = (stage: DealStage): string => {
    const stageColors: Record<DealStage, string> = {
      lead: 'bg-surface-subtle text-text-secondary',
      qualified: 'bg-accent-primary/10 text-accent-primary',
      appointment: 'bg-accent-primary/10 text-accent-primary',
      showroom: 'bg-accent-primary/10 text-accent-primary',
      test_drive: 'bg-accent-primary/20 text-accent-primary',
      negotiation: 'bg-status-warning/10 text-status-warning',
      pending_approval: 'bg-status-warning/20 text-status-warning',
      approved: 'bg-status-success/10 text-status-success',
      finance: 'bg-accent-primary/20 text-accent-primary',
      contracted: 'bg-status-success/20 text-status-success',
      delivered: 'bg-status-success text-white',
      lost: 'bg-status-error/10 text-status-error',
    };
    return stageColors[stage] || 'bg-surface-subtle text-text-secondary';
  };

  const getStageIcon = (stage: DealStage) => {
    const stageIcons: Record<DealStage, React.ReactNode> = {
      lead: <Users className="w-4 h-4" />,
      qualified: <CheckCircle className="w-4 h-4" />,
      appointment: <Calendar className="w-4 h-4" />,
      showroom: <Users className="w-4 h-4" />,
      test_drive: <Play className="w-4 h-4" />,
      negotiation: <DollarSign className="w-4 h-4" />,
      pending_approval: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      finance: <FileText className="w-4 h-4" />,
      contracted: <FileText className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      lost: <X className="w-4 h-4" />,
    };
    return stageIcons[stage] || <Users className="w-4 h-4" />;
  };

  const getActivityIcon = (type: DealActivity['type']) => {
    switch (type) {
      case 'status_change':
        return <TrendingUp className="w-4 h-4 text-accent-primary" />;
      case 'document':
        return <FileText className="w-4 h-4 text-text-secondary" />;
      case 'note':
        return <MessageSquare className="w-4 h-4 text-text-secondary" />;
      case 'communication':
        return <MessageSquare className="w-4 h-4 text-accent-primary" />;
      case 'ai_action':
        return <TrendingUp className="w-4 h-4 text-accent-primary" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-status-success" />;
      default:
        return <Clock className="w-4 h-4 text-text-tertiary" />;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleTransition = async (transition: DealStateTransition) => {
    if (transitioning || !onStageChange) return;

    // Validate
    if (transition.validations) {
      for (const validation of transition.validations) {
        if (!validation.validator(data)) {
          alert(validation.message);
          return;
        }
      }
    }

    setTransitioning(true);
    try {
      await onStageChange(transition.to);

      // Log activity
      onActivityAdd?.({
        user: 'Current User', // Should come from auth context
        userRole: 'Salesperson',
        type: 'status_change',
        title: transition.action,
        description: `Deal moved from ${transition.from} to ${transition.to}`,
      });
    } catch (error) {
      console.error('Transition failed:', error);
    } finally {
      setTransitioning(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className={cn('flex h-full bg-surface-base', className)}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-base bg-surface-elevated">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-text-primary">
                  Deal #{data.dealNumber}
                </h1>
                <Badge
                  variant={data.status === 'active' ? 'success' : 'default'}
                  size="sm"
                >
                  {data.status}
                </Badge>
              </div>
              <div className="mt-1 text-sm text-text-secondary">
                {data.customer.name} • {data.vehicle.year} {data.vehicle.make} {data.vehicle.model}
              </div>
            </div>

            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium', getStageColor(data.stage))}>
              {getStageIcon(data.stage)}
              <span>{data.stage.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data.status === 'active' && !readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange?.('paused')}
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 border-b border-border-base bg-surface-subtle">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-text-secondary">
                Docs: {data.stats.documentsComplete}/{data.stats.documentsTotal}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-text-secondary">
                Signatures: {data.stats.signaturesComplete}/{data.stats.signaturesTotal}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-text-secondary">
                Time in stage: {Math.floor(data.timeInStage / 60)}h {data.timeInStage % 60}m
              </span>
            </div>
            {data.metrics.closeProbability && (
              <div className="flex items-center gap-1.5 ml-auto">
                <TrendingUp className="w-3.5 h-3.5 text-accent-primary" />
                <span className="text-accent-primary font-medium">
                  {Math.round(data.metrics.closeProbability * 100)}% Close Prob
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="h-full flex flex-col"
          >
            <div className="border-b border-border-base px-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={cn(
                    'px-1 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'overview'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  )}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={cn(
                    'px-1 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'documents'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  )}
                >
                  Documents ({data.stats.documentsTotal})
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={cn(
                    'px-1 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'activity'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  )}
                >
                  Activity ({data.activities.length})
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={cn(
                    'px-1 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'ai'
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  )}
                >
                  AI Insights
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-text-secondary uppercase">Customer</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Name</span>
                        <span className="text-text-primary font-medium">{data.customer.name}</span>
                      </div>
                      {data.customer.email && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Email</span>
                          <span className="text-text-primary">{data.customer.email}</span>
                        </div>
                      )}
                      {data.customer.phone && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Phone</span>
                          <span className="text-text-primary">{data.customer.phone}</span>
                        </div>
                      )}
                      {data.customer.creditScore && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Credit Score</span>
                          <span className="text-text-primary font-medium">{data.customer.creditScore}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-text-secondary uppercase">Vehicle</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Stock</span>
                        <span className="text-text-primary font-medium">{data.vehicle.stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">VIN</span>
                        <span className="text-text-primary font-mono text-xs">{data.vehicle.vin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Cost</span>
                        <span className="text-text-primary">${data.vehicle.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Price</span>
                        <span className="text-text-primary font-medium">${data.vehicle.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deal Structure (if exists) */}
                  {data.structure && (
                    <div className="space-y-4 col-span-2">
                      <h3 className="text-sm font-medium text-text-secondary uppercase">Deal Structure</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Sale Price</span>
                          <span className="text-text-primary font-medium">${data.structure.salePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Down Payment</span>
                          <span className="text-text-primary">${data.structure.downPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Amount Financed</span>
                          <span className="text-text-primary">${data.structure.amountFinanced.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Term</span>
                          <span className="text-text-primary">{data.structure.term} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Rate</span>
                          <span className="text-text-primary">{data.structure.rate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Payment</span>
                          <span className="text-text-primary font-bold text-lg">${data.structure.monthlyPayment.toLocaleString()}/mo</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profitability */}
                  <div className="space-y-4 col-span-2 pt-4 border-t border-border-base">
                    <h3 className="text-sm font-medium text-text-secondary uppercase">Profitability</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-text-secondary">Front End</div>
                        <div className="text-2xl font-bold text-accent-primary">${data.metrics.frontEndProfit.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-text-secondary">Back End</div>
                        <div className="text-2xl font-bold text-accent-primary">${data.metrics.backEndProfit.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-text-secondary">Gross Profit</div>
                        <div className="text-2xl font-bold text-status-success">${data.metrics.grossProfit.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-text-secondary">Total Profit</div>
                        <div className="text-3xl font-bold text-status-success">${data.metrics.totalProfit.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-3">
                  {data.activities
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border-base bg-surface-elevated"
                      >
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">{activity.title}</span>
                            <Badge variant="outline" size="sm">{activity.userRole}</Badge>
                          </div>
                          {activity.description && (
                            <div className="mt-0.5 text-xs text-text-secondary">{activity.description}</div>
                          )}
                          <div className="mt-1 text-xs text-text-tertiary">
                            {activity.user} • {activity.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Sidebar - Next Actions */}
      <div className="w-80 border-l border-border-base bg-surface-elevated p-4 space-y-4">
        <h3 className="text-sm font-medium text-text-secondary uppercase">Next Actions</h3>

        {data.timeInStage > 60 && (
          <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning" />
              <span className="text-sm font-medium text-text-primary">Deal Stalling</span>
            </div>
            <div className="mt-1 text-xs text-text-secondary">
              Deal has been in {data.stage.replace('_', ' ')} for {Math.floor(data.timeInStage / 60)} hours
            </div>
          </div>
        )}

        <div className="space-y-2">
          {availableTransitions.map((transition) => (
            <Button
              key={transition.to}
              variant="outline"
              size="sm"
              className="w-full justify-between"
              onClick={() => handleTransition(transition)}
              disabled={transitioning || readOnly}
            >
              <span>{transition.action}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {data.stats.documentsComplete < data.stats.documentsTotal && (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => onDocumentAction?.('upload')}
          >
            <FileText className="w-4 h-4" />
            Upload Documents ({data.stats.documentsTotal - data.stats.documentsComplete} remaining)
          </Button>
        )}
      </div>
    </div>
  );
};

DealWorkspace.displayName = 'DealWorkspace';

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const canTransition = (
  from: DealStage,
  to: DealStage,
  userPermissions: string[]
): boolean => {
  const transition = DEAL_TRANSITIONS.find((t) => t.from === from && t.to === to);
  if (!transition) return false;

  if (transition.requiredPermission) {
    return userPermissions.includes(transition.requiredPermission);
  }

  return true;
};

export const getStageProgress = (stage: DealStage): number => {
  const stages: DealStage[] = [
    'lead',
    'qualified',
    'appointment',
    'showroom',
    'test_drive',
    'negotiation',
    'pending_approval',
    'approved',
    'finance',
    'contracted',
    'delivered',
  ];

  const index = stages.indexOf(stage);
  return index >= 0 ? ((index + 1) / stages.length) * 100 : 0;
};
