export const EVENT_TOPICS = {
  DEAL_WORKSHEET_CREATED: 'deal.worksheet.created',
  DEAL_VERSION_CREATED: 'deal.version.created',
  DEAL_VERSION_SELECTED: 'deal.version.selected',
  DEAL_STATUS_UPDATED: 'deal.status.updated',
  DEAL_STATUS_LOST: 'deal.status.lost',
  DEAL_STATUS_CLOSED: 'deal.status.closed',
  DEAL_OPTIMIZED: 'deal.optimized',
  DEAL_COUNTER_ACCEPTED: 'deal.counter.accepted',
  INVENTORY_VEHICLE_RESERVED: 'inventory.vehicle.reserved',
  INVENTORY_VEHICLE_RELEASED: 'inventory.vehicle.released',
  INVENTORY_DAYS_IN_STOCK_UPDATED: 'inventory.vehicle.days-in-stock.updated',
  ACCOUNTING_JOURNAL_CREATED: 'accounting.journal.created',
} as const;

export type DomainTopic = (typeof EVENT_TOPICS)[keyof typeof EVENT_TOPICS];

export type DomainEventPayloads = {
  [EVENT_TOPICS.DEAL_WORKSHEET_CREATED]: {
    tenantId: string;
    dealId: string;
    worksheetId: string;
    vehicleId: string;
    customerId: string;
    salespersonId: string | null;
    status: string;
  };
  [EVENT_TOPICS.DEAL_VERSION_CREATED]: {
    tenantId: string;
    dealId: string;
    worksheetId: string;
    versionId: string;
    createdBy: string | null;
    customerId: string;
    vehicleId: string;
    salespersonId: string | null;
  };
  [EVENT_TOPICS.DEAL_VERSION_SELECTED]: {
    tenantId: string;
    dealId: string;
    worksheetId: string;
    versionId: string;
    selectedBy: string;
    customerId: string;
    vehicleId: string;
    salespersonId: string | null;
    structure: Record<string, unknown>;
    totals: Record<string, unknown>;
    payment: Record<string, unknown>;
  };
  [EVENT_TOPICS.DEAL_STATUS_UPDATED]: {
    tenantId: string;
    dealId: string;
    worksheetId: string;
    previousStatus: string | null;
    nextStatus: string;
  };
  [EVENT_TOPICS.DEAL_STATUS_LOST]: {
    tenantId: string;
    dealId: string;
    worksheetId: string;
    vehicleId: string;
    customerId: string;
    salespersonId: string | null;
    reason?: string | null;
  };
  [EVENT_TOPICS.DEAL_STATUS_CLOSED]: {
    tenantId: string;
    dealId: string;
    worksheetId: string;
    vehicleId: string;
    totals: Record<string, unknown>;
    salespersonId: string | null;
    customerId: string;
  };
  [EVENT_TOPICS.DEAL_OPTIMIZED]: {
    tenantId: string;
    dealId: string;
    worksheetId: string | null;
    versionId: string | null;
    optimizationId: string;
    runBy: string;
    customerId: string;
    salespersonId: string | null;
  };
  [EVENT_TOPICS.DEAL_COUNTER_ACCEPTED]: {
    tenantId: string;
    dealId: string;
    worksheetId: string | null;
    counterId: string;
    handledBy: string;
    customerId: string;
    salespersonId: string | null;
  };
  [EVENT_TOPICS.INVENTORY_VEHICLE_RESERVED]: {
    tenantId: string;
    dealId: string;
    vehicleId: string;
    reservedByWorksheetId: string;
  };
  [EVENT_TOPICS.INVENTORY_VEHICLE_RELEASED]: {
    tenantId: string;
    dealId: string;
    vehicleId: string;
    releasedByWorksheetId: string;
    status: string;
  };
  [EVENT_TOPICS.INVENTORY_DAYS_IN_STOCK_UPDATED]: {
    tenantId: string;
    vehicleId: string;
    daysInStock: number;
  };
  [EVENT_TOPICS.ACCOUNTING_JOURNAL_CREATED]: {
    tenantId: string;
    dealId: string;
    journalEntryId: string;
  };
};
