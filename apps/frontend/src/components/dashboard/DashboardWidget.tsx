import { Suspense, lazy } from 'react';
import { useAuth } from '@repo/ui';
import { canAccessCard } from '@/lib/dashboard/resolveCards';
import { getCardComponent, getCardDef } from '@/lib/dashboard/cardRegistry';

interface WidgetConfig {
  id: string;
  key: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config?: any;
}

interface DashboardWidgetProps {
  widget: WidgetConfig;
  isEditing: boolean;
}

// Legacy widget registry - maps widget keys to components
// NOTE: This is being phased out in favor of cardRegistry
// Keeping for backward compatibility during migration
const legacyWidgetComponents: Record<string, any> = {
  'active-deals': lazy(() => import('@/components/widgets/ActiveDealsWidget')),
  'hot-leads': lazy(() => import('@/components/widgets/HotLeadsWidget')),
  'today-appointments': lazy(() => import('@/components/widgets/TodayAppointmentsWidget')),
  'pending-tasks': lazy(() => import('@/components/widgets/PendingTasksWidget')),
  'sales-leaderboard': lazy(() => import('@/components/widgets/SalesLeaderboardWidget')),
  'dealership-overview': lazy(() => import('@/components/widgets/DealershipOverviewWidget')),
  'system-health': lazy(() => import('@/components/widgets/SystemHealthWidget')),
};

function WidgetLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function WidgetError({ widgetKey }: { widgetKey: string }) {
  return (
    <div className="flex items-center justify-center h-full text-center p-4">
      <div>
        <p className="text-red-600 font-semibold mb-1">Widget Error</p>
        <p className="text-sm text-gray-600">
          Widget "{widgetKey}" not found
        </p>
      </div>
    </div>
  );
}

function WidgetPermissionDenied({ widgetKey }: { widgetKey: string }) {
  return (
    <div className="flex items-center justify-center h-full text-center p-4">
      <div>
        <p className="text-gray-600 font-medium mb-1">Access Restricted</p>
        <p className="text-xs text-gray-500">
          You don't have permission to view "{widgetKey}"
        </p>
      </div>
    </div>
  );
}

export function DashboardWidget({ widget, isEditing }: DashboardWidgetProps) {
  const { user } = useAuth();

  // Try to get card definition from new registry
  const cardDef = getCardDef(widget.key);

  // Check permissions if card is registered in new system
  const hasAccess = cardDef
    ? canAccessCard(widget.key, {
        user,
        featureFlags: [], // TODO: Get from context
        entityContext: {}, // TODO: Get from context
      })
    : true; // Legacy widgets bypass permission checks (for now)

  // Get component from new registry or fall back to legacy
  const WidgetComponent = getCardComponent(widget.key) || legacyWidgetComponents[widget.key];

  const gridColumn = `span ${widget.size.w}`;
  const gridRow = `span ${widget.size.h}`;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all ${
        isEditing ? 'ring-2 ring-blue-400 ring-offset-2 cursor-move' : ''
      }`}
      style={{
        gridColumn,
        gridRow,
        minHeight: widget.size.h === 1 ? '200px' : '400px',
      }}
    >
      {isEditing && (
        <div className="bg-blue-50 border-b border-blue-200 px-3 py-2 flex justify-between items-center">
          <span className="text-xs font-medium text-blue-700">
            {widget.key}
          </span>
          <button className="text-gray-500 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-4 h-full">
        {/* Permission check - show denied state if no access */}
        {!hasAccess ? (
          <WidgetPermissionDenied widgetKey={widget.key} />
        ) : !WidgetComponent ? (
          <WidgetError widgetKey={widget.key} />
        ) : (
          <Suspense fallback={<WidgetLoading />}>
            <WidgetComponent config={widget.config} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
