/**
 * Core types for the Insight Engine signal model
 */

export type InsightSeverity = 'critical' | 'high' | 'normal' | 'low';
export type InsightStatus = 'new' | 'acknowledged' | 'snoozed' | 'resolved';

export interface Insight {
  id: string;
  type: string; // 'deal.fundingAtRisk', 'recon.stalled', etc.
  severity: InsightSeverity;
  status: InsightStatus;
  summary: string;
  entityRef: {
    type: 'deal' | 'ro' | 'vehicle' | 'title';
    id: string;
  };
  quickAction?: {
    label: string;
    action: string; // 'navigate' | 'api_call' | 'modal'
    params?: Record<string, any>;
  };
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Signal {
  widgetType: string;
  insights: Insight[];
  aggregateData?: Record<string, any>;
}
