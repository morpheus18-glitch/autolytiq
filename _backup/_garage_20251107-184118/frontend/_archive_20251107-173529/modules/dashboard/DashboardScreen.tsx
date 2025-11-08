import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer, PageHeader } from '@repo/ui';
import { InsightList, StatusPulse } from '@repo/ui';
import { loadDashboardConfig } from './dashboardLoader.js';
import { applyLayoutRecipe } from './applyLayoutRecipe.js';
import type { Insight } from '@repo/insights-engine';

export function DashboardScreen() {
  const [mockInsights] = React.useState<Insight[]>([
    {
      id: '1',
      type: 'deal.fundingAtRisk',
      severity: 'critical',
      status: 'new',
      summary: 'Deal #D-1234 funding at risk - CIT > 48hrs',
      entityRef: { type: 'deal', id: 'deal-1234' },
      quickAction: {
        label: 'View Deal',
        action: 'navigate',
        params: { path: '/deals/deal-1234' },
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'recon.stalled',
      severity: 'high',
      status: 'new',
      summary: 'Vehicle #V-5678 stalled in recon for 12 days',
      entityRef: { type: 'vehicle', id: 'vehicle-5678' },
      quickAction: {
        label: 'Check Status',
        action: 'navigate',
        params: { path: '/inventory/vehicle-5678' },
      },
      createdAt: new Date().toISOString(),
    },
  ]);

  const { data: config, isLoading } = useQuery({
    queryKey: ['dashboard-config'],
    queryFn: () => loadDashboardConfig({
      userId: 'user-1',
      tenantId: 'tenant-1',
      role: 'sales-manager',
      permissions: ['view_deals', 'view_inventory'],
    }),
  });

  const handleAction = (action: string, params?: Record<string, any>) => {
    console.log('Action triggered:', action, params);
    // In production: navigate or trigger modal
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Dashboard" />
        <div className="animate-pulse">Loading...</div>
      </PageContainer>
    );
  }

  const criticalCount = mockInsights.filter(i => i.severity === 'critical').length;
  const highCount = mockInsights.filter(i => i.severity === 'high').length;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Real-time insights and alerts"
      />

      <div className="flex gap-4 mb-6">
        <StatusPulse status="critical" label="Critical" count={criticalCount} />
        <StatusPulse status="high" label="High Priority" count={highCount} />
        <StatusPulse status="success" label="All Clear" count={0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border-base rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Recent Insights</h3>
          <InsightList
            insights={mockInsights}
            onAction={handleAction}
          />
        </div>

        <div className="border border-border-base rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
          <p className="text-sm text-text-secondary">Widget panel placeholder</p>
        </div>
      </div>
    </PageContainer>
  );
}
