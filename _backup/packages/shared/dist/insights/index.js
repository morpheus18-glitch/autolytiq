// src/insights.ts
var InsightStateTransitions = {
  new: ["ack", "snoozed", "claimed", "resolved"],
  ack: ["snoozed", "claimed", "resolved"],
  snoozed: ["new", "ack", "claimed", "resolved"],
  claimed: ["resolved"],
  resolved: []
  // Terminal state
};
function isValidTransition(from, to) {
  return InsightStateTransitions[from].includes(to);
}
function calculateSnoozeUntil(durationMs) {
  return new Date(Date.now() + durationMs);
}
function isInsightExpired(insight) {
  if (!insight.expiresAt) return false;
  return /* @__PURE__ */ new Date() > insight.expiresAt;
}
function isInsightSnoozed(state) {
  if (state.state !== "snoozed") return false;
  if (!state.snoozeUntil) return false;
  return /* @__PURE__ */ new Date() < state.snoozeUntil;
}
function getPriorityScore(priority) {
  const scores = {
    critical: 4,
    high: 3,
    normal: 2,
    low: 1
  };
  return scores[priority];
}

// src/insights/scoring.ts
var baseSeverityWeights = {
  info: 0.2,
  notice: 0.5,
  warning: 0.75,
  urgent: 1
};
function recencyBoost(minutes) {
  return Math.max(0.5, 1 - minutes / 1440 * 0.5);
}
function roleWeight(role) {
  const weights = {
    sales: 1,
    fi: 1,
    service: 0.9,
    inventory: 0.9,
    accounting: 0.8,
    admin: 0.8,
    dev: 0.6
  };
  return weights[role] ?? 0.8;
}
function combine(severityWeight, recency, custom = 0.5, roleW = 1) {
  const baseScore = severityWeight * 0.6 + recency * 0.2 + custom * 0.2;
  return Math.min(1, baseScore * roleW);
}
function defaultScore(severity, minutesSinceEvent, role) {
  return combine(
    baseSeverityWeights[severity],
    recencyBoost(minutesSinceEvent),
    0.5,
    // neutral custom factor
    roleWeight(role)
  );
}

// src/insights/registry.ts
var RULES = {};
function registerRule(rule) {
  if (RULES[rule.key]) {
    console.warn(`[InsightRegistry] Overwriting existing rule: ${rule.key}`);
  }
  RULES[rule.key] = rule;
}
function registerRules(rules) {
  rules.forEach(registerRule);
}
function listRules() {
  return Object.values(RULES);
}
function getRule(key) {
  return RULES[key];
}
function hasRule(key) {
  return key in RULES;
}
function unregisterRule(key) {
  if (RULES[key]) {
    delete RULES[key];
    return true;
  }
  return false;
}
function clearRules() {
  Object.keys(RULES).forEach((key) => delete RULES[key]);
}
function getRulesByDomain(domain) {
  return Object.values(RULES).filter((rule) => rule.domain === domain);
}
function getRulesBySeverity(severity) {
  return Object.values(RULES).filter((rule) => rule.severity === severity);
}
function getRulesByTag(tag) {
  return Object.values(RULES).filter((rule) => rule.tags?.includes(tag));
}

// src/insights/predicates/time.ts
function olderThan(minutes, dateExpr) {
  return async (ctx) => {
    const date = await dateExpr(ctx);
    if (!date) return false;
    const ageMs = ctx.now.getTime() - date.getTime();
    const ageMinutes = ageMs / (1e3 * 60);
    return ageMinutes > minutes;
  };
}
function within(minutes, dateExpr) {
  return async (ctx) => {
    const date = await dateExpr(ctx);
    if (!date) return false;
    const ageMs = ctx.now.getTime() - date.getTime();
    const ageMinutes = ageMs / (1e3 * 60);
    return ageMinutes <= minutes;
  };
}
function between(start, end) {
  return async (ctx) => {
    const startDate = await start(ctx);
    const endDate = await end(ctx);
    if (!startDate || !endDate) return false;
    return ctx.now >= startDate && ctx.now <= endDate;
  };
}
function minutesSince(date, now) {
  const diffMs = now.getTime() - date.getTime();
  return diffMs / (1e3 * 60);
}
function hoursSince(date, now) {
  return minutesSince(date, now) / 60;
}
function daysSince(date, now) {
  return hoursSince(date, now) / 24;
}

// src/insights/predicates/deals.ts
function pendingFIOver(minutes) {
  return async (ctx) => {
    const deals = await ctx.fetch(
      'SELECT id, "fiStatus", "fiSubmittedAt" FROM "Deal" WHERE "tenantId" = $1 AND "fiStatus" = $2',
      [ctx.tenantId, "pending"]
    );
    return deals.some((deal) => {
      if (!deal.fiSubmittedAt) return false;
      const ageMs = ctx.now.getTime() - deal.fiSubmittedAt.getTime();
      return ageMs > minutes * 60 * 1e3;
    });
  };
}
function stuckInStatus(status, minutes) {
  return async (ctx) => {
    const deals = await ctx.fetch(
      'SELECT id, status, "updatedAt" FROM "Deal" WHERE "tenantId" = $1 AND status = $2',
      [ctx.tenantId, status]
    );
    return deals.some((deal) => {
      const ageMs = ctx.now.getTime() - deal.updatedAt.getTime();
      return ageMs > minutes * 60 * 1e3;
    });
  };
}
function noActivityFor(minutes) {
  return async (ctx) => {
    const deals = await ctx.fetch(
      `SELECT d.id, d."updatedAt",
        COALESCE(MAX(da."createdAt"), d."updatedAt") as "lastActivity"
       FROM "Deal" d
       LEFT JOIN "DealActivity" da ON da."dealId" = d.id
       WHERE d."tenantId" = $1 AND d.status != 'closed' AND d.status != 'cancelled'
       GROUP BY d.id, d."updatedAt"`,
      [ctx.tenantId]
    );
    return deals.some((deal) => {
      const lastActivity = deal.lastActivity || deal.updatedAt;
      const ageMs = ctx.now.getTime() - new Date(lastActivity).getTime();
      return ageMs > minutes * 60 * 1e3;
    });
  };
}
function dealAtRisk() {
  return async (ctx) => {
    const atRiskDeals = await ctx.fetch(
      `SELECT d.id
       FROM "Deal" d
       LEFT JOIN "CreditApplication" ca ON ca."dealId" = d.id
       LEFT JOIN "Communication" c ON c."customerId" = d."customerId"
       WHERE d."tenantId" = $1
         AND d.status NOT IN ('closed', 'cancelled')
         AND (
           (ca.status = 'rejected' AND ca."updatedAt" < NOW() - INTERVAL '24 hours')
           OR (c."createdAt" < NOW() - INTERVAL '48 hours')
         )
       LIMIT 1`,
      [ctx.tenantId]
    );
    return atRiskDeals.length > 0;
  };
}

// src/insights/predicates/leads.ts
function leadNoContact(hours, minScore = 80) {
  return async (ctx) => {
    const leads = await ctx.fetch(
      `SELECT id, score, "lastContactAt", "createdAt"
       FROM "Lead"
       WHERE "tenantId" = $1
         AND status = 'new'
         AND score >= $2
         AND "lastContactAt" IS NULL`,
      [ctx.tenantId, minScore]
    );
    return leads.some((lead) => {
      const ageMs = ctx.now.getTime() - lead.createdAt.getTime();
      const ageHours = ageMs / (1e3 * 60 * 60);
      return ageHours > hours;
    });
  };
}
function hotLeadCooling(hours) {
  return async (ctx) => {
    const leads = await ctx.fetch(
      `SELECT id, score, "lastContactAt", "updatedAt"
       FROM "Lead"
       WHERE "tenantId" = $1
         AND status IN ('hot', 'engaged')
         AND score >= 70`,
      [ctx.tenantId]
    );
    return leads.some((lead) => {
      const lastContact = lead.lastContactAt || /* @__PURE__ */ new Date(0);
      const ageMs = ctx.now.getTime() - lastContact.getTime();
      const ageHours = ageMs / (1e3 * 60 * 60);
      return ageHours > hours;
    });
  };
}
function leadResponseOverdue(hours) {
  return async (ctx) => {
    const overdueLeads = await ctx.fetch(
      `SELECT l.id, MAX(c."createdAt") as "lastInbound"
       FROM "Lead" l
       JOIN "Communication" c ON c."leadId" = l.id
       WHERE l."tenantId" = $1
         AND l.status NOT IN ('closed', 'disqualified')
         AND c.direction = 'inbound'
       GROUP BY l.id
       HAVING MAX(c."createdAt") < NOW() - INTERVAL '${hours} hours'
         AND NOT EXISTS (
           SELECT 1 FROM "Communication" c2
           WHERE c2."leadId" = l.id
             AND c2.direction = 'outbound'
             AND c2."createdAt" > MAX(c."createdAt")
         )`,
      [ctx.tenantId]
    );
    return overdueLeads.length > 0;
  };
}
function appointmentUnconfirmed(hours) {
  return async (ctx) => {
    const futureTime = new Date(ctx.now.getTime() + hours * 60 * 60 * 1e3);
    const unconfirmed = await ctx.fetch(
      `SELECT a.id
       FROM "Appointment" a
       JOIN "Lead" l ON l.id = a."leadId"
       WHERE a."tenantId" = $1
         AND a."scheduledAt" < $2
         AND a.status = 'scheduled'
         AND a."confirmedAt" IS NULL`,
      [ctx.tenantId, futureTime]
    );
    return unconfirmed.length > 0;
  };
}

// src/insights/predicates/inventory.ts
function agingOver(days) {
  return async (ctx) => {
    const vehicles = await ctx.fetch(
      `SELECT id, vin, "daysInStock"
       FROM "Vehicle"
       WHERE "tenantId" = $1
         AND status = 'available'
         AND "daysInStock" > $2`,
      [ctx.tenantId, days]
    );
    return vehicles.length > 0;
  };
}
function pricedBelowMarket(percentBelow) {
  return async (ctx) => {
    const vehicles = await ctx.fetch(
      `SELECT v.id, v.price, v."marketValue"
       FROM "Vehicle" v
       WHERE v."tenantId" = $1
         AND v.status = 'available'
         AND v."marketValue" IS NOT NULL
         AND v.price < (v."marketValue" * (1 - $2))`,
      [ctx.tenantId, percentBelow / 100]
    );
    return vehicles.length > 0;
  };
}
function needsReconditioning() {
  return async (ctx) => {
    const vehicles = await ctx.fetch(
      `SELECT v.id
       FROM "Vehicle" v
       WHERE v."tenantId" = $1
         AND v.status = 'incoming'
         AND v."reconditioningStatus" = 'pending'
         AND v."arrivedAt" < NOW() - INTERVAL '48 hours'`,
      [ctx.tenantId]
    );
    return vehicles.length > 0;
  };
}
function highMarginAvailable(minMargin) {
  return async (ctx) => {
    const vehicles = await ctx.fetch(
      `SELECT v.id, v.cost, v.price
       FROM "Vehicle" v
       WHERE v."tenantId" = $1
         AND v.status = 'available'
         AND v.price IS NOT NULL
         AND v.cost IS NOT NULL
         AND ((v.price - v.cost) / v.cost) > $2`,
      [ctx.tenantId, minMargin / 100]
    );
    return vehicles.length > 0;
  };
}
function lowInventory(make, threshold) {
  return async (ctx) => {
    const query = make ? `SELECT COUNT(*) as count FROM "Vehicle" WHERE "tenantId" = $1 AND status = 'available' AND make = $2` : `SELECT COUNT(*) as count FROM "Vehicle" WHERE "tenantId" = $1 AND status = 'available'`;
    const params = make ? [ctx.tenantId, make] : [ctx.tenantId];
    const result = await ctx.fetch(query, params);
    return result[0].count < threshold;
  };
}

// src/insights/predicates/service.ts
function roApprovedNoParts(minutes) {
  return async (ctx) => {
    const ros = await ctx.fetch(
      `SELECT id, "approvedAt", "partsOrderedAt"
       FROM "ServiceRO"
       WHERE "tenantId" = $1
         AND status = 'approved'
         AND "approvedAt" IS NOT NULL
         AND "partsOrderedAt" IS NULL`,
      [ctx.tenantId]
    );
    return ros.some((ro) => {
      if (!ro.approvedAt) return false;
      const ageMs = ctx.now.getTime() - ro.approvedAt.getTime();
      return ageMs > minutes * 60 * 1e3;
    });
  };
}
function roAwaitingCustomerApproval(minutes) {
  return async (ctx) => {
    const ros = await ctx.fetch(
      `SELECT id, "createdAt"
       FROM "ServiceRO"
       WHERE "tenantId" = $1
         AND status = 'awaiting_approval'
         AND "createdAt" < NOW() - INTERVAL '${minutes} minutes'`,
      [ctx.tenantId]
    );
    return ros.length > 0;
  };
}
function partsDelayed(days) {
  return async (ctx) => {
    const ros = await ctx.fetch(
      `SELECT id, "partsOrderedAt"
       FROM "ServiceRO"
       WHERE "tenantId" = $1
         AND status = 'awaiting_parts'
         AND "partsOrderedAt" < NOW() - INTERVAL '${days} days'
         AND "partsReceivedAt" IS NULL`,
      [ctx.tenantId]
    );
    return ros.length > 0;
  };
}
function vehicleReadyNotNotified(hours) {
  return async (ctx) => {
    const ros = await ctx.fetch(
      `SELECT ro.id, ro."completedAt"
       FROM "ServiceRO" ro
       WHERE ro."tenantId" = $1
         AND ro.status = 'completed'
         AND ro."completedAt" < NOW() - INTERVAL '${hours} hours'
         AND NOT EXISTS (
           SELECT 1 FROM "Communication" c
           WHERE c."serviceROId" = ro.id
             AND c.type = 'ready_for_pickup'
         )`,
      [ctx.tenantId]
    );
    return ros.length > 0;
  };
}
export {
  InsightStateTransitions,
  agingOver,
  appointmentUnconfirmed,
  baseSeverityWeights,
  between,
  calculateSnoozeUntil,
  clearRules,
  combine,
  daysSince,
  dealAtRisk,
  defaultScore,
  getPriorityScore,
  getRule,
  getRulesByDomain,
  getRulesBySeverity,
  getRulesByTag,
  hasRule,
  highMarginAvailable,
  hotLeadCooling,
  hoursSince,
  isInsightExpired,
  isInsightSnoozed,
  isValidTransition,
  leadNoContact,
  leadResponseOverdue,
  listRules,
  lowInventory,
  minutesSince,
  needsReconditioning,
  noActivityFor,
  olderThan,
  partsDelayed,
  pendingFIOver,
  pricedBelowMarket,
  recencyBoost,
  registerRule,
  registerRules,
  roApprovedNoParts,
  roAwaitingCustomerApproval,
  roleWeight,
  stuckInStatus,
  unregisterRule,
  vehicleReadyNotNotified,
  within
};
//# sourceMappingURL=index.js.map