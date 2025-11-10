/**
 * RoleDashboard - Role-Based Intuitive State Dashboard
 *
 * Intelligent dashboard system that adapts to user role and current state.
 * Shows the right information at the right time based on:
 * - User role (Salesperson, Manager, F&I, GM, Admin)
 * - Current deal state
 * - Active priorities
 * - Time-sensitive actions
 *
 * Features:
 * - Role-specific layouts and widgets
 * - State-aware content (what you need NOW)
 * - Priority-based action lists
 * - Real-time updates
 * - Customizable widget grid
 * - Saved dashboard presets
 *
 * Perfect for: Daily operations, Manager oversight, Executive reporting
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';
import {
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
  Clock,
  Users,
  Car,
  DollarSign,
  Target,
  Bell,
  Settings,
  Plus,
  GripVertical,
} from 'lucide-react';
import { Button } from './Button.js';
import { Badge } from './Badge.js';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type UserRole =
  | 'salesperson'
  | 'sales_manager'
  | 'fi_manager'
  | 'gm'
  | 'admin'
  | 'inventory_manager'
  | 'bdc_agent';

export type WidgetType =
  | 'active_deals'
  | 'hot_leads'
  | 'appointments_today'
  | 'pending_approvals'
  | 'revenue_today'
  | 'revenue_month'
  | 'conversion_rate'
  | 'inventory_alerts'
  | 'aged_inventory'
  | 'pending_deliveries'
  | 'finance_pending'
  | 'credit_approvals'
  | 'profitability'
  | 'team_performance'
  | 'ai_insights'
  | 'tasks'
  | 'recent_activity'
  | 'sales_funnel';

export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl';
export type Priority = 'critical' | 'high' | 'normal' | 'low';

export interface WidgetData {
  id: string;
  type: WidgetType;
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    value: number;
    label?: string;
  };
  priority?: Priority;
  actionLabel?: string;
  onAction?: () => void;
  metadata?: Record<string, any>;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  position: { row: number; col: number };
  data?: WidgetData;
  visible: boolean;
}

export interface DashboardPreset {
  id: string;
  name: string;
  role: UserRole;
  widgets: Omit<DashboardWidget, 'data'>[];
  isDefault?: boolean;
}

export interface DealState {
  id: string;
  status:
    | 'lead'
    | 'in_showroom'
    | 'test_drive'
    | 'negotiation'
    | 'pending_approval'
    | 'approved'
    | 'pending_fi'
    | 'contracted'
    | 'delivered';
  customerName: string;
  vehicleDescription: string;
  priority: Priority;
  urgencyScore: number; // 0-100
  nextAction: string;
  timeInState: number; // minutes
  assignedTo?: string;
}

export interface StateAwareContext {
  activeDeals: DealState[];
  urgentActions: {
    id: string;
    type: 'approval' | 'signature' | 'document' | 'follow_up' | 'appointment';
    description: string;
    deadline?: Date;
    priority: Priority;
    onClick?: () => void;
  }[];
  metrics: {
    revenue: { today: number; month: number; goal: number };
    deals: { active: number; closed: number; goal: number };
    leads: { hot: number; total: number };
  };
}

// ═══════════════════════════════════════════════════════════════
// ROLE-BASED DASHBOARD PRESETS
// ═══════════════════════════════════════════════════════════════

export const DASHBOARD_PRESETS: Record<UserRole, DashboardPreset> = {
  salesperson: {
    id: 'salesperson_default',
    name: 'Salesperson Dashboard',
    role: 'salesperson',
    isDefault: true,
    widgets: [
      { id: 'w1', type: 'active_deals', size: 'lg', position: { row: 0, col: 0 }, visible: true },
      { id: 'w2', type: 'hot_leads', size: 'md', position: { row: 0, col: 2 }, visible: true },
      { id: 'w3', type: 'appointments_today', size: 'md', position: { row: 1, col: 0 }, visible: true },
      { id: 'w4', type: 'ai_insights', size: 'md', position: { row: 1, col: 1 }, visible: true },
      { id: 'w5', type: 'revenue_month', size: 'sm', position: { row: 2, col: 0 }, visible: true },
      { id: 'w6', type: 'conversion_rate', size: 'sm', position: { row: 2, col: 1 }, visible: true },
    ],
  },
  sales_manager: {
    id: 'sales_manager_default',
    name: 'Sales Manager Dashboard',
    role: 'sales_manager',
    isDefault: true,
    widgets: [
      { id: 'w1', type: 'team_performance', size: 'xl', position: { row: 0, col: 0 }, visible: true },
      { id: 'w2', type: 'pending_approvals', size: 'md', position: { row: 0, col: 3 }, visible: true },
      { id: 'w3', type: 'sales_funnel', size: 'lg', position: { row: 1, col: 0 }, visible: true },
      { id: 'w4', type: 'revenue_month', size: 'md', position: { row: 1, col: 2 }, visible: true },
      { id: 'w5', type: 'ai_insights', size: 'md', position: { row: 2, col: 0 }, visible: true },
      { id: 'w6', type: 'inventory_alerts', size: 'md', position: { row: 2, col: 1 }, visible: true },
    ],
  },
  fi_manager: {
    id: 'fi_manager_default',
    name: 'F&I Manager Dashboard',
    role: 'fi_manager',
    isDefault: true,
    widgets: [
      { id: 'w1', type: 'finance_pending', size: 'lg', position: { row: 0, col: 0 }, visible: true },
      { id: 'w2', type: 'credit_approvals', size: 'md', position: { row: 0, col: 2 }, visible: true },
      { id: 'w3', type: 'profitability', size: 'md', position: { row: 1, col: 0 }, visible: true },
      { id: 'w4', type: 'pending_deliveries', size: 'md', position: { row: 1, col: 1 }, visible: true },
      { id: 'w5', type: 'revenue_month', size: 'sm', position: { row: 2, col: 0 }, visible: true },
      { id: 'w6', type: 'ai_insights', size: 'md', position: { row: 2, col: 1 }, visible: true },
    ],
  },
  gm: {
    id: 'gm_default',
    name: 'GM Dashboard',
    role: 'gm',
    isDefault: true,
    widgets: [
      { id: 'w1', type: 'revenue_month', size: 'xl', position: { row: 0, col: 0 }, visible: true },
      { id: 'w2', type: 'profitability', size: 'lg', position: { row: 1, col: 0 }, visible: true },
      { id: 'w3', type: 'team_performance', size: 'lg', position: { row: 1, col: 2 }, visible: true },
      { id: 'w4', type: 'aged_inventory', size: 'md', position: { row: 2, col: 0 }, visible: true },
      { id: 'w5', type: 'sales_funnel', size: 'md', position: { row: 2, col: 1 }, visible: true },
      { id: 'w6', type: 'ai_insights', size: 'md', position: { row: 2, col: 2 }, visible: true },
    ],
  },
  admin: {
    id: 'admin_default',
    name: 'Admin Dashboard',
    role: 'admin',
    isDefault: true,
    widgets: [
      { id: 'w1', type: 'recent_activity', size: 'xl', position: { row: 0, col: 0 }, visible: true },
      { id: 'w2', type: 'tasks', size: 'md', position: { row: 1, col: 0 }, visible: true },
      { id: 'w3', type: 'revenue_month', size: 'sm', position: { row: 1, col: 1 }, visible: true },
      { id: 'w4', type: 'team_performance', size: 'lg', position: { row: 2, col: 0 }, visible: true },
    ],
  },
  inventory_manager: {
    id: 'inventory_manager_default',
    name: 'Inventory Manager Dashboard',
    role: 'inventory_manager',
    isDefault: true,
    widgets: [
      { id: 'w1', type: 'inventory_alerts', size: 'lg', position: { row: 0, col: 0 }, visible: true },
      { id: 'w2', type: 'aged_inventory', size: 'md', position: { row: 0, col: 2 }, visible: true },
      { id: 'w3', type: 'pending_deliveries', size: 'md', position: { row: 1, col: 0 }, visible: true },
      { id: 'w4', type: 'revenue_month', size: 'sm', position: { row: 1, col: 1 }, visible: true },
      { id: 'w5', type: 'ai_insights', size: 'md', position: { row: 2, col: 0 }, visible: true },
    ],
  },
  bdc_agent: {
    id: 'bdc_agent_default',
    name: 'BDC Agent Dashboard',
    role: 'bdc_agent',
    isDefault: true,
    widgets: [
      { id: 'w1', type: 'hot_leads', size: 'lg', position: { row: 0, col: 0 }, visible: true },
      { id: 'w2', type: 'appointments_today', size: 'md', position: { row: 0, col: 2 }, visible: true },
      { id: 'w3', type: 'tasks', size: 'md', position: { row: 1, col: 0 }, visible: true },
      { id: 'w4', type: 'conversion_rate', size: 'sm', position: { row: 1, col: 1 }, visible: true },
      { id: 'w5', type: 'recent_activity', size: 'md', position: { row: 2, col: 0 }, visible: true },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface RoleDashboardProps {
  role: UserRole;
  context: StateAwareContext;
  preset?: DashboardPreset;
  onWidgetAction?: (widgetId: string, action: string) => void;
  onCustomize?: () => void;
  onPresetChange?: (preset: DashboardPreset) => void;
  editable?: boolean;
  className?: string;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  role,
  context,
  preset: customPreset,
  onWidgetAction,
  onCustomize,
  onPresetChange,
  editable = false,
  className,
}) => {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  const [activePreset, setActivePreset] = React.useState<DashboardPreset>(
    customPreset || DASHBOARD_PRESETS[role]
  );

  // ═══════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════

  const urgentActionCount = context.urgentActions.filter(
    (a) => a.priority === 'critical' || a.priority === 'high'
  ).length;

  const getWidgetIcon = (type: WidgetType) => {
    const iconMap: Record<WidgetType, React.ReactNode> = {
      active_deals: <Target className="w-5 h-5" />,
      hot_leads: <Users className="w-5 h-5" />,
      appointments_today: <Clock className="w-5 h-5" />,
      pending_approvals: <AlertCircle className="w-5 h-5" />,
      revenue_today: <DollarSign className="w-5 h-5" />,
      revenue_month: <DollarSign className="w-5 h-5" />,
      conversion_rate: <TrendingUp className="w-5 h-5" />,
      inventory_alerts: <Car className="w-5 h-5" />,
      aged_inventory: <Car className="w-5 h-5" />,
      pending_deliveries: <Car className="w-5 h-5" />,
      finance_pending: <DollarSign className="w-5 h-5" />,
      credit_approvals: <TrendingUp className="w-5 h-5" />,
      profitability: <TrendingUp className="w-5 h-5" />,
      team_performance: <Users className="w-5 h-5" />,
      ai_insights: <Bell className="w-5 h-5" />,
      tasks: <Clock className="w-5 h-5" />,
      recent_activity: <LayoutDashboard className="w-5 h-5" />,
      sales_funnel: <TrendingUp className="w-5 h-5" />,
    };
    return iconMap[type] || <LayoutDashboard className="w-5 h-5" />;
  };

  const getWidgetSizeClasses = (size: WidgetSize): string => {
    const sizeMap: Record<WidgetSize, string> = {
      sm: 'col-span-1 row-span-1',
      md: 'col-span-1 row-span-1 md:col-span-2',
      lg: 'col-span-1 row-span-2 md:col-span-2',
      xl: 'col-span-1 row-span-2 md:col-span-4',
    };
    return sizeMap[size];
  };

  const getPriorityColor = (priority: Priority): string => {
    const colorMap: Record<Priority, string> = {
      critical: 'text-status-error',
      high: 'text-status-warning',
      normal: 'text-accent-primary',
      low: 'text-text-secondary',
    };
    return colorMap[priority];
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER WIDGET CONTENT
  // ═══════════════════════════════════════════════════════════════

  const renderWidgetContent = (widget: DashboardWidget) => {
    // In production, this would fetch real data per widget type
    // For now, we'll use the context data to populate widgets

    switch (widget.type) {
      case 'active_deals':
        return (
          <div className="space-y-2">
            {context.activeDeals.slice(0, 5).map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between p-3 rounded-md bg-surface-elevated border border-border-base hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {deal.customerName}
                    </span>
                    <Badge
                      variant={deal.priority === 'critical' ? 'error' : 'default'}
                      size="sm"
                    >
                      {deal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-text-tertiary truncate">
                    {deal.vehicleDescription} • {deal.timeInState}m in state
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onWidgetAction?.(widget.id, 'view_deal')}>
                  View
                </Button>
              </div>
            ))}
          </div>
        );

      case 'hot_leads':
        return (
          <div className="space-y-2">
            <div className="text-4xl font-bold text-text-primary">{context.metrics.leads.hot}</div>
            <div className="text-sm text-text-secondary">
              Out of {context.metrics.leads.total} total leads
            </div>
          </div>
        );

      case 'revenue_month':
        const revenueProgress = (context.metrics.revenue.month / context.metrics.revenue.goal) * 100;
        return (
          <div className="space-y-3">
            <div className="text-4xl font-bold text-text-primary">
              ${(context.metrics.revenue.month / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-text-secondary">
              ${(context.metrics.revenue.goal / 1000).toFixed(0)}K goal • {Math.round(revenueProgress)}%
            </div>
            <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-primary transition-all"
                style={{ width: `${Math.min(revenueProgress, 100)}%` }}
              />
            </div>
          </div>
        );

      case 'pending_approvals':
        const approvalCount = context.urgentActions.filter((a) => a.type === 'approval').length;
        return (
          <div className="space-y-2">
            <div className="text-4xl font-bold text-status-warning">{approvalCount}</div>
            <div className="text-sm text-text-secondary">Deals awaiting approval</div>
            {approvalCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => onWidgetAction?.(widget.id, 'view_approvals')}
              >
                Review Now
              </Button>
            )}
          </div>
        );

      case 'ai_insights':
        const criticalInsights = context.urgentActions.filter((a) => a.priority === 'critical').length;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-accent-primary">{criticalInsights}</div>
              <div className="text-sm text-text-secondary">critical insights</div>
            </div>
            {context.urgentActions.slice(0, 3).map((action) => (
              <div
                key={action.id}
                className="p-2 rounded-md bg-surface-elevated border border-border-base text-xs"
              >
                <div className={cn('font-medium', getPriorityColor(action.priority))}>
                  {action.type.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-text-secondary mt-0.5">{action.description}</div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-text-tertiary">
            <div className="text-center">
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs mt-1">No data</div>
            </div>
          </div>
        );
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className={cn('flex flex-col h-full bg-surface-base', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-base bg-surface-elevated">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{activePreset.name}</h1>
          <div className="mt-1 text-sm text-text-secondary">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {urgentActionCount > 0 && (
            <Badge variant="error" size="lg">
              {urgentActionCount} Urgent Actions
            </Badge>
          )}
          {editable && (
            <>
              <Button variant="outline" size="sm" onClick={onCustomize}>
                <Settings className="w-4 h-4" />
                Customize
              </Button>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
                Add Widget
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Urgent Actions Banner */}
      {urgentActionCount > 0 && (
        <div className="px-6 py-3 bg-status-warning/10 border-b border-status-warning/20">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-status-warning" />
            <span className="font-medium text-text-primary">
              You have {urgentActionCount} urgent {urgentActionCount === 1 ? 'action' : 'actions'} requiring attention
            </span>
            <Button variant="ghost" size="sm" className="ml-auto">
              View All
            </Button>
          </div>
        </div>
      )}

      {/* Widget Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {activePreset.widgets
            .filter((w) => w.visible)
            .map((widget) => (
              <div
                key={widget.id}
                className={cn(
                  'relative rounded-lg border border-border-base bg-surface-elevated p-4 transition-shadow hover:shadow-md',
                  getWidgetSizeClasses(widget.size),
                  editable && 'cursor-move'
                )}
              >
                {/* Widget Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-accent-primary">
                      {getWidgetIcon(widget.type)}
                    </div>
                    <h3 className="text-sm font-medium text-text-primary">
                      {widget.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h3>
                  </div>
                  {editable && (
                    <GripVertical className="w-4 h-4 text-text-tertiary" />
                  )}
                </div>

                {/* Widget Content */}
                <div className="h-[calc(100%-2rem)]">
                  {renderWidgetContent(widget)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

RoleDashboard.displayName = 'RoleDashboard';

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const calculateUrgencyScore = (deal: DealState): number => {
  let score = 0;

  // Time in state (more time = higher urgency)
  if (deal.timeInState > 120) score += 40; // Over 2 hours
  else if (deal.timeInState > 60) score += 25;
  else if (deal.timeInState > 30) score += 10;

  // Priority
  if (deal.priority === 'critical') score += 30;
  else if (deal.priority === 'high') score += 20;
  else if (deal.priority === 'normal') score += 10;

  // Status-based urgency
  if (deal.status === 'negotiation') score += 20;
  if (deal.status === 'pending_approval') score += 15;
  if (deal.status === 'in_showroom') score += 10;

  return Math.min(score, 100);
};

export const getRecommendedWidgetsForRole = (role: UserRole): WidgetType[] => {
  const roleWidgets: Record<UserRole, WidgetType[]> = {
    salesperson: ['active_deals', 'hot_leads', 'appointments_today', 'revenue_month', 'ai_insights'],
    sales_manager: ['team_performance', 'pending_approvals', 'sales_funnel', 'revenue_month', 'ai_insights'],
    fi_manager: ['finance_pending', 'credit_approvals', 'profitability', 'pending_deliveries', 'ai_insights'],
    gm: ['revenue_month', 'profitability', 'team_performance', 'sales_funnel', 'aged_inventory'],
    admin: ['recent_activity', 'tasks', 'revenue_month', 'team_performance'],
    inventory_manager: ['inventory_alerts', 'aged_inventory', 'pending_deliveries', 'revenue_month'],
    bdc_agent: ['hot_leads', 'appointments_today', 'tasks', 'conversion_rate', 'recent_activity'],
  };

  return roleWidgets[role] || [];
};
