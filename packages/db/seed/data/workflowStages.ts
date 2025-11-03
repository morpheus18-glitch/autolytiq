/**
 * Default Workflow Stages
 * Standard CRM workflow pipeline stages
 */

export const DEFAULT_WORKFLOW_STAGES = [
  {
    key: 'new',
    name: 'New Lead',
    slaHours: 2,
    wipLimit: null,
  },
  {
    key: 'contacted',
    name: 'Contacted',
    slaHours: 24,
    wipLimit: null,
  },
  {
    key: 'appointment-set',
    name: 'Appointment Set',
    slaHours: 48,
    wipLimit: null,
  },
  {
    key: 'showed',
    name: 'Customer Showed',
    slaHours: 24,
    wipLimit: null,
  },
  {
    key: 'negotiation',
    name: 'Negotiation',
    slaHours: null,
    wipLimit: 10,
  },
  {
    key: 'financing',
    name: 'Financing',
    slaHours: 72,
    wipLimit: null,
  },
  {
    key: 'paperwork',
    name: 'Paperwork',
    slaHours: 24,
    wipLimit: null,
  },
  {
    key: 'sold',
    name: 'Sold',
    slaHours: null,
    wipLimit: null,
  },
  {
    key: 'lost',
    name: 'Lost',
    slaHours: null,
    wipLimit: null,
  },
] as const;
