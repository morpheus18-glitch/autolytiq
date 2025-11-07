/**
 * Built-in Insight Rules
 *
 * Canonical rule definitions using the DSL
 */

import { registerRule } from '@repo/shared/insights';
import type { InsightRule, PredicateCtx } from '@repo/shared/insights';
import {
  getPendingFIOver,
  getLeadNoContact,
  getHotLeadsCooling,
  getAgingInventory,
  getServiceROsApprovedNoParts,
  getDealsNoActivity,
} from './fetchers';
import { defaultScore } from '@repo/shared/insights';
import { cuid } from '@paralleldrive/cuid2';

/**
 * Rule 1: Deal Pending F&I Too Long
 */
registerRule({
  id: cuid(),
  key: 'deal.pendingFI.tooLong',
  domain: 'fi',
  audience: { roles: ['fi', 'sales'] },
  severity: 'warning',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    const deals = await getPendingFIOver(ctx.tenantId, 45);
    return deals.length > 0;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    return defaultScore('warning', 45, ctx.role);
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    const deals = await getPendingFIOver(ctx.tenantId, 45);
    const count = deals.length;
    if (count === 1) {
      const deal = deals[0];
      return `Deal #${deal.id.slice(0, 8)} has been pending F&I for over 45 minutes`;
    }
    return `${count} deals have been pending F&I for over 45 minutes`;
  },
  card: {
    type: 'action',
    payload: {
      action: 'open',
      target: 'deals',
      filter: { fiStatus: 'pending' },
    },
  },
  ttlMinutes: 240,
  cooldownMinutes: 60,
  tags: ['time', 'sla', 'fi'],
});

/**
 * Rule 2: Hot Lead Not Contacted
 */
registerRule({
  id: cuid(),
  key: 'lead.noContact.hot',
  domain: 'sales',
  audience: { roles: ['sales'] },
  severity: 'urgent',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    const leads = await getLeadNoContact(ctx.tenantId, 2, 80); // 2 hours, score >= 80
    return leads.length > 0;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    // Urgent + recent = high score
    return defaultScore('urgent', 120, ctx.role);
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    const leads = await getLeadNoContact(ctx.tenantId, 2, 80);
    const count = leads.length;
    if (count === 1) {
      const lead = leads[0];
      return `Hot lead ${lead.customer?.name || lead.id.slice(0, 8)} (score: ${lead.score}) has not been contacted`;
    }
    return `${count} hot leads have not been contacted yet`;
  },
  card: {
    type: 'action',
    payload: {
      action: 'open',
      target: 'leads',
      filter: { status: 'new', minScore: 80 },
    },
  },
  ttlMinutes: 180,
  cooldownMinutes: 30,
  tags: ['time', 'sla', 'leads'],
});

/**
 * Rule 3: Hot Lead Cooling Off
 */
registerRule({
  id: cuid(),
  key: 'lead.hot.cooling',
  domain: 'sales',
  audience: { roles: ['sales'] },
  severity: 'warning',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    const leads = await getHotLeadsCooling(ctx.tenantId, 48); // 48 hours no contact
    return leads.length > 0;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    return defaultScore('warning', 2880, ctx.role); // 48 hours
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    const leads = await getHotLeadsCooling(ctx.tenantId, 48);
    const count = leads.length;
    if (count === 1) {
      const lead = leads[0];
      return `Hot lead ${lead.customer?.name || lead.id.slice(0, 8)} has had no contact for 48+ hours`;
    }
    return `${count} hot leads have had no contact for 48+ hours`;
  },
  card: {
    type: 'alert',
    payload: {
      action: 'open',
      target: 'leads',
      filter: { status: ['hot', 'engaged'], noContactHours: 48 },
    },
  },
  ttlMinutes: 480,
  cooldownMinutes: 120,
  tags: ['engagement', 'leads'],
});

/**
 * Rule 4: Service RO Approved But No Parts Ordered
 */
registerRule({
  id: cuid(),
  key: 'service.ro.approvedNoParts',
  domain: 'service',
  audience: { roles: ['service'] },
  severity: 'notice',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    const ros = await getServiceROsApprovedNoParts(ctx.tenantId, 120); // 2 hours
    return Array.isArray(ros) && ros.length > 0;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    return defaultScore('notice', 120, ctx.role);
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    const ros = await getServiceROsApprovedNoParts(ctx.tenantId, 120);
    const count = Array.isArray(ros) ? ros.length : 0;
    if (count === 1) {
      const ro: any = ros[0];
      return `Service RO #${ro.id.slice(0, 8)} approved but parts not ordered yet`;
    }
    return `${count} approved service ROs are waiting for parts orders`;
  },
  card: {
    type: 'action',
    payload: {
      action: 'open',
      target: 'service',
      filter: { status: 'approved', partsOrdered: false },
    },
  },
  ttlMinutes: 360,
  cooldownMinutes: 60,
  tags: ['service', 'parts', 'sla'],
});

/**
 * Rule 5: Aging Inventory Alert
 */
registerRule({
  id: cuid(),
  key: 'inventory.aging.over45days',
  domain: 'inventory',
  audience: { roles: ['inventory', 'sales'] },
  severity: 'warning',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    const vehicles = await getAgingInventory(ctx.tenantId, 45);
    return vehicles.length > 0;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    return defaultScore('warning', 64800, ctx.role); // 45 days in minutes
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    const vehicles = await getAgingInventory(ctx.tenantId, 45);
    const count = vehicles.length;
    if (count === 1) {
      const vehicle = vehicles[0];
      return `${vehicle.year} ${vehicle.make} ${vehicle.model} has been in stock for ${vehicle.daysInStock} days`;
    }
    return `${count} vehicles have been in stock for over 45 days`;
  },
  card: {
    type: 'alert',
    payload: {
      action: 'open',
      target: 'inventory',
      filter: { minDaysInStock: 45 },
    },
  },
  ttlMinutes: 1440, // 24 hours
  cooldownMinutes: 360, // 6 hours
  tags: ['inventory', 'aging', 'pricing'],
});

/**
 * Rule 6: Deal Stalled - No Activity
 */
registerRule({
  id: cuid(),
  key: 'deal.stalled.noActivity',
  domain: 'sales',
  audience: { roles: ['sales', 'fi'] },
  severity: 'warning',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    const deals = await getDealsNoActivity(ctx.tenantId, 2880); // 48 hours
    return Array.isArray(deals) && deals.length > 0;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    return defaultScore('warning', 2880, ctx.role);
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    const deals = await getDealsNoActivity(ctx.tenantId, 2880);
    const count = Array.isArray(deals) ? deals.length : 0;
    if (count === 1) {
      const deal: any = deals[0];
      return `Deal #${deal.id.slice(0, 8)} has had no activity for 48+ hours`;
    }
    return `${count} deals have had no activity for 48+ hours`;
  },
  card: {
    type: 'alert',
    payload: {
      action: 'open',
      target: 'deals',
      filter: { noActivityHours: 48 },
    },
  },
  ttlMinutes: 480,
  cooldownMinutes: 180,
  tags: ['deals', 'engagement', 'stalled'],
});

/**
 * Rule 7: Unread SMS Messages
 */
registerRule({
  id: cuid(),
  key: 'msg.sms.unread',
  domain: 'sales',
  audience: { roles: ['sales', 'fi'] },
  severity: 'notice',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    // Placeholder - would query Communication table
    // For now, always return false (can be wired up when Communications model is ready)
    return false;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    return defaultScore('notice', 15, ctx.role);
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    return 'You have unread SMS messages';
  },
  card: {
    type: 'action',
    payload: {
      action: 'open',
      target: 'messages',
      filter: { type: 'sms', unread: true },
    },
  },
  ttlMinutes: 60,
  cooldownMinutes: 15,
  tags: ['messages', 'sms'],
});

/**
 * Rule 8: Price Opportunity - Below Market
 */
registerRule({
  id: cuid(),
  key: 'inventory.price.belowMarket',
  domain: 'inventory',
  audience: { roles: ['inventory', 'sales'] },
  severity: 'info',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    // Placeholder - would check marketValue vs price
    return false;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    return defaultScore('info', 60, ctx.role);
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    return 'Some vehicles are priced below market value';
  },
  card: {
    type: 'summary',
    payload: {
      action: 'open',
      target: 'inventory',
      filter: { priceBelowMarket: true },
    },
  },
  ttlMinutes: 720,
  cooldownMinutes: 240,
  tags: ['inventory', 'pricing', 'opportunity'],
});

/**
 * Rule 9: Credit Application Pending
 */
registerRule({
  id: cuid(),
  key: 'fi.creditApp.pending',
  domain: 'fi',
  audience: { roles: ['fi'] },
  severity: 'notice',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    // Placeholder - would query CreditApplication table
    return false;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    return defaultScore('notice', 60, ctx.role);
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    return 'Credit applications are pending review';
  },
  card: {
    type: 'action',
    payload: {
      action: 'open',
      target: 'fi',
      filter: { creditStatus: 'pending' },
    },
  },
  ttlMinutes: 240,
  cooldownMinutes: 60,
  tags: ['fi', 'credit'],
});

/**
 * Rule 10: Appointment No-Show Follow-Up
 */
registerRule({
  id: cuid(),
  key: 'lead.appointment.noShow',
  domain: 'sales',
  audience: { roles: ['sales'] },
  severity: 'warning',
  when: async (ctx: PredicateCtx): Promise<boolean> => {
    // Placeholder - would query Appointment table
    return false;
  },
  score: async (ctx: PredicateCtx): Promise<number> => {
    return defaultScore('warning', 30, ctx.role);
  },
  message: async (ctx: PredicateCtx): Promise<string> => {
    return 'Customers missed appointments and need follow-up';
  },
  card: {
    type: 'action',
    payload: {
      action: 'open',
      target: 'appointments',
      filter: { status: 'no_show', followedUp: false },
    },
  },
  ttlMinutes: 180,
  cooldownMinutes: 60,
  tags: ['appointments', 'leads', 'follow-up'],
});

console.log('[InsightRules] Registered 10 builtin rules');
