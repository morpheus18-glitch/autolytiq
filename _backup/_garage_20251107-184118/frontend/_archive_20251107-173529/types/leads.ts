export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface LeadAssignment {
  userId: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface LeadVehicleInterest {
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  description?: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  source: string;
  sourceUrl?: string | null;
  status: LeadStatus;
  lifecycleStage: string;
  intentScore: number;
  vehicleInterest?: string[] | LeadVehicleInterest[] | null;
  timeframe?: string | null;
  budgetRange?: string | null;
  region?: string | null;
  notes?: string | null;
  isConverted?: boolean | null;
  assignedTo?: LeadAssignment | null;
  createdAt?: string;
  updatedAt?: string;
  lastInteractionAt?: string | null;
  nextTaskAt?: string | null;
  tenantId?: string | null;
}

export interface LeadActivityItem {
  id: string;
  leadId: string;
  type: 'email' | 'sms' | 'call' | 'note' | 'task' | 'status_change' | 'meeting' | 'system';
  detail: string;
  timestamp: string;
  author?: string | null;
  authorId?: string | null;
  direction?: 'inbound' | 'outbound';
  channel?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LeadActivityPage {
  items: LeadActivityItem[];
  nextCursor?: string | null;
}

export interface LeadDetail extends Lead {
  activities?: LeadActivityItem[];
  alerts?: Array<{
    id: string;
    trigger: string;
    message: string;
    priority: string;
    createdAt: string;
  }>;
  scoreHistory?: Array<{ timestamp: string; score: number }>;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  cta: {
    label: string;
    action: 'call' | 'sms' | 'email' | 'task' | 'note' | 'meeting';
  };
  supportingPoints?: string[];
}

export interface Appointment {
  id: string;
  startsAt: string;
  endsAt: string;
  location: string;
  topic: string;
  attendees: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface SMSMessage {
  id: string;
  sender: 'lead' | 'agent';
  body: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}
