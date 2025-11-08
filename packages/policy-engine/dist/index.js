// src/rules.ts
var DEFAULT_GLOBAL_RULES = [
  {
    id: "global-deny-sensitive",
    name: "Global: Deny Sensitive Scopes",
    level: "global",
    effect: "deny",
    scopes: ["pii:export", "admin:system.health", "credit:pull"],
    priority: 1e3,
    enabled: true
  },
  {
    id: "global-mask-pii",
    name: "Global: Mask PII by Default",
    level: "global",
    effect: "allow",
    scopes: [],
    fieldMasks: [
      { path: "customer.ssn", action: "mask", replacement: "***-**-####" },
      { path: "customer.driversLicense.number", action: "mask", replacement: "****####" },
      { path: "customer.bankAccount.accountNumber", action: "mask", replacement: "****####" }
    ],
    priority: 900,
    enabled: true
  }
];
var DEFAULT_ROLE_RULES = {
  SALESPERSON: {
    id: "role-salesperson",
    name: "Salesperson Role",
    level: "role",
    roleId: "SALESPERSON",
    effect: "allow",
    scopes: [
      "deal:view",
      "deal:create",
      "deal:edit",
      "customer:view",
      "customer:edit",
      "pii:view",
      "inventory:view",
      "analytics:view"
    ],
    fieldMasks: [
      { path: "deal.cost", action: "hide" },
      { path: "deal.profit", action: "hide" },
      { path: "deal.margin", action: "hide" },
      { path: "inventory.cost", action: "hide" }
    ],
    priority: 100,
    enabled: true
  },
  SALES_MANAGER: {
    id: "role-sales-manager",
    name: "Sales Manager Role",
    level: "role",
    roleId: "SALES_MANAGER",
    effect: "allow",
    scopes: [
      "deal:view",
      "deal:create",
      "deal:edit",
      "deal:approve",
      "deal:cost.view",
      "deal:profit.view",
      "deal:margin.view",
      "customer:view",
      "customer:edit",
      "pii:view",
      "inventory:view",
      "inventory:cost.view",
      "analytics:view",
      "analytics:team.view"
    ],
    priority: 100,
    enabled: true
  },
  FINANCE_MANAGER: {
    id: "role-finance-manager",
    name: "Finance Manager Role",
    level: "role",
    roleId: "FINANCE_MANAGER",
    effect: "allow",
    scopes: [
      "deal:view",
      "deal:edit",
      "deal:approve",
      "deal:fi.view",
      "deal:cost.view",
      "deal:profit.view",
      "deal:margin.view",
      "customer:view",
      "customer:edit",
      "pii:view",
      "pii:edit",
      "credit:view",
      "credit:pull",
      "finance:profit.view",
      "finance:cost.view",
      "finance:reports.export",
      "analytics:view"
    ],
    priority: 100,
    enabled: true
  },
  CONTROLLER: {
    id: "role-controller",
    name: "Controller Role",
    level: "role",
    roleId: "CONTROLLER",
    effect: "allow",
    scopes: [
      "deal:view",
      "deal:cost.view",
      "deal:profit.view",
      "deal:margin.view",
      "accounting:gl.view",
      "accounting:ap.view",
      "accounting:ar.view",
      "finance:profit.view",
      "finance:cost.view",
      "finance:reports.export",
      "inventory:view",
      "inventory:cost.view",
      "analytics:view",
      "analytics:team.view",
      "analytics:store.view"
    ],
    priority: 100,
    enabled: true
  },
  SERVICE_ADVISOR: {
    id: "role-service-advisor",
    name: "Service Advisor Role",
    level: "role",
    roleId: "SERVICE_ADVISOR",
    effect: "allow",
    scopes: [
      "service:ro.view",
      "service:ro.create",
      "service:ro.close",
      "service:parts.view",
      "service:labor.edit",
      "customer:view",
      "inventory:view"
    ],
    priority: 100,
    enabled: true
  },
  TITLE_CLERK: {
    id: "role-title-clerk",
    name: "Title Clerk Role",
    level: "role",
    roleId: "TITLE_CLERK",
    effect: "allow",
    scopes: [
      "title:view",
      "title:status.view",
      "title:docs.upload",
      "title:lien.manage",
      "customer:view",
      "pii:view"
    ],
    priority: 100,
    enabled: true
  },
  GM: {
    id: "role-gm",
    name: "General Manager Role",
    level: "role",
    roleId: "GM",
    effect: "allow",
    scopes: [
      "deal:view",
      "deal:create",
      "deal:edit",
      "deal:delete",
      "deal:approve",
      "deal:cost.view",
      "deal:profit.view",
      "deal:margin.view",
      "deal:desk",
      "customer:view",
      "customer:edit",
      "customer:delete",
      "pii:view",
      "pii:edit",
      "credit:view",
      "inventory:view",
      "inventory:cost.view",
      "inventory:price.edit",
      "inventory:age.view",
      "service:ro.view",
      "service:ro.close",
      "title:view",
      "title:status.view",
      "accounting:gl.view",
      "accounting:ap.view",
      "accounting:ar.view",
      "finance:profit.view",
      "finance:cost.view",
      "finance:reports.export",
      "analytics:view",
      "analytics:team.view",
      "analytics:store.view",
      "admin:users.manage",
      "admin:roles.manage"
    ],
    priority: 100,
    enabled: true
  },
  ADMIN: {
    id: "role-admin",
    name: "Admin Role",
    level: "role",
    roleId: "ADMIN",
    effect: "allow",
    scopes: [
      "deal:view",
      "deal:create",
      "deal:edit",
      "deal:delete",
      "deal:approve",
      "deal:cost.view",
      "deal:profit.view",
      "deal:margin.view",
      "deal:desk",
      "deal:fi.view",
      "customer:view",
      "customer:edit",
      "customer:delete",
      "pii:view",
      "pii:edit",
      "pii:export",
      "credit:view",
      "credit:pull",
      "inventory:view",
      "inventory:cost.view",
      "inventory:price.edit",
      "inventory:age.view",
      "inventory:acquire",
      "service:ro.view",
      "service:ro.create",
      "service:ro.close",
      "service:parts.view",
      "service:labor.edit",
      "title:view",
      "title:status.view",
      "title:docs.upload",
      "title:lien.manage",
      "accounting:gl.view",
      "accounting:ap.view",
      "accounting:ar.view",
      "finance:profit.view",
      "finance:cost.view",
      "finance:reports.export",
      "analytics:view",
      "analytics:team.view",
      "analytics:store.view",
      "admin:users.manage",
      "admin:roles.manage",
      "admin:settings.edit",
      "admin:audit.view",
      "admin:system.health"
    ],
    priority: 100,
    enabled: true
  }
};

// src/evaluate.ts
function evaluateCondition(condition, ctx) {
  switch (condition.type) {
    case "owner":
      return ctx.resource?.ownerId === ctx.userId;
    case "team":
      return ctx.resource?.teamId === ctx.teamId;
    case "store":
      return condition.params.storeId === ctx.resource?.metadata?.storeId;
    case "timeWindow":
      const now = ctx.now || /* @__PURE__ */ new Date();
      const start = new Date(condition.params.start);
      const end = new Date(condition.params.end);
      return now >= start && now <= end;
    case "stateMatch":
      return condition.params.states.includes(ctx.resource?.state);
    case "custom":
      console.warn(`Custom condition not evaluated: ${JSON.stringify(condition)}`);
      return false;
    default:
      console.warn(`Unknown condition type: ${condition.type}`);
      return false;
  }
}
function ruleApplies(rule, ctx) {
  if (!rule.enabled) return false;
  if (rule.level === "user" && rule.userId !== ctx.userId) return false;
  if (rule.level === "team" && rule.teamId !== ctx.teamId) return false;
  if (rule.level === "role" && !ctx.roleIds.includes(rule.roleId)) return false;
  if (rule.level === "tenant" && rule.tenantId !== ctx.tenantId) return false;
  if (rule.conditions && rule.conditions.length > 0) {
    return rule.conditions.every((cond) => evaluateCondition(cond, ctx));
  }
  return true;
}
function evaluate(rules, ctx) {
  const decision = {
    scopes: /* @__PURE__ */ new Set(),
    denials: /* @__PURE__ */ new Set(),
    fieldMasks: [],
    guards: {},
    metadata: {
      rulesApplied: [],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
  const applicable = rules.filter((r) => ruleApplies(r, ctx)).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  for (const rule of applicable) {
    decision.metadata.rulesApplied.push(rule.id);
    if (rule.effect === "allow") {
      rule.scopes.forEach((scope) => decision.scopes.add(scope));
      if (rule.fieldMasks) {
        decision.fieldMasks.push(...rule.fieldMasks);
      }
    } else if (rule.effect === "deny") {
      rule.scopes.forEach((scope) => decision.denials.add(scope));
      rule.scopes.forEach((scope) => decision.scopes.delete(scope));
    }
  }
  decision.denials.forEach((scope) => decision.scopes.delete(scope));
  decision.guards = deriveGuards(decision);
  return decision;
}
function deriveGuards(decision) {
  const guards = {};
  const can = (scope) => {
    return decision.scopes.has(scope) && !decision.denials.has(scope);
  };
  guards["deal.view"] = can("deal:view");
  guards["deal.create"] = can("deal:create");
  guards["deal.edit"] = can("deal:edit");
  guards["deal.delete"] = can("deal:delete");
  guards["deal.approve"] = can("deal:approve");
  guards["deal.desk"] = can("deal:desk");
  guards["deal.cost.view"] = can("deal:cost.view");
  guards["deal.profit.view"] = can("deal:profit.view");
  guards["deal.margin.view"] = can("deal:margin.view");
  guards["deal.fi.view"] = can("deal:fi.view");
  guards["customer.view"] = can("customer:view");
  guards["customer.edit"] = can("customer:edit");
  guards["pii.view"] = can("pii:view");
  guards["pii.edit"] = can("pii:edit");
  guards["pii.export"] = can("pii:export");
  guards["credit.view"] = can("credit:view");
  guards["credit.pull"] = can("credit:pull");
  guards["title.view"] = can("title:view");
  guards["title.status.view"] = can("title:status.view");
  guards["title.docs.upload"] = can("title:docs.upload");
  guards["service.ro.view"] = can("service:ro.view");
  guards["service.ro.create"] = can("service:ro.create");
  guards["service.ro.close"] = can("service:ro.close");
  guards["inventory.view"] = can("inventory:view");
  guards["inventory.cost.view"] = can("inventory:cost.view");
  guards["inventory.price.edit"] = can("inventory:price.edit");
  guards["accounting.gl.view"] = can("accounting:gl.view");
  guards["accounting.ap.view"] = can("accounting:ap.view");
  guards["accounting.ar.view"] = can("accounting:ar.view");
  guards["fi.profit.view"] = can("finance:profit.view");
  guards["fi.cost.view"] = can("finance:cost.view");
  guards["fi.reports.export"] = can("finance:reports.export");
  guards["analytics.view"] = can("analytics:view");
  guards["analytics.team.view"] = can("analytics:team.view");
  guards["analytics.store.view"] = can("analytics:store.view");
  guards["admin.users.manage"] = can("admin:users.manage");
  guards["admin.roles.manage"] = can("admin:roles.manage");
  guards["admin.settings.edit"] = can("admin:settings.edit");
  guards["admin.audit.view"] = can("admin:audit.view");
  guards["admin.system.health"] = can("admin:system.health");
  return guards;
}
function canAccess(decision, scope) {
  return decision.scopes.has(scope) && !decision.denials.has(scope);
}
function getDenials(decision) {
  return Array.from(decision.denials);
}
function getAllowedScopes(decision) {
  return Array.from(decision.scopes);
}

// src/applyMasks.ts
function applyMasks(payload, masks) {
  for (const mask of masks) {
    applyMask(payload, mask);
  }
  return payload;
}
function applyMask(payload, mask) {
  const value = getPath(payload, mask.path);
  if (value === void 0) {
    return;
  }
  switch (mask.action) {
    case "hide":
      deletePath(payload, mask.path);
      break;
    case "redact":
      setPath(payload, mask.path, mask.replacement || "[REDACTED]");
      break;
    case "mask":
      const masked = maskValue(value, mask.replacement);
      setPath(payload, mask.path, masked);
      break;
  }
}
function getPath(obj, path) {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return void 0;
    current = current[part];
  }
  return current;
}
function setPath(obj, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  let current = obj;
  for (const part of parts) {
    if (current[part] == null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[last] = value;
}
function deletePath(obj, path) {
  const parts = path.split(".");
  const last = parts.pop();
  let current = obj;
  for (const part of parts) {
    if (current == null) return;
    current = current[part];
  }
  if (current != null) {
    delete current[last];
  }
}
function maskValue(value, pattern) {
  const str = String(value);
  if (!pattern) {
    return str.length > 4 ? "*".repeat(str.length - 4) + str.slice(-4) : "****";
  }
  const visibleCount = (pattern.match(/#/g) || []).length;
  if (visibleCount === 0) {
    return pattern;
  }
  const visible = str.slice(-visibleCount);
  let result = pattern;
  for (let i = visible.length - 1; i >= 0; i--) {
    result = result.replace(/#/, visible[i]);
  }
  return result;
}
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}
function applyMasksImmutable(payload, masks) {
  const cloned = deepClone(payload);
  return applyMasks(cloned, masks);
}
function applyMasksBatch(payloads, masks) {
  return payloads.map((payload) => applyMasksImmutable(payload, masks));
}
var MaskPatterns = {
  SSN: "***-**-####",
  PHONE: "(***) ***-####",
  EMAIL: "*****@*****.***",
  CARD: "**** **** **** ####",
  LICENSE: "****####",
  ACCOUNT: "****####",
  ROUTING: "****####",
  FULL_REDACT: "[REDACTED]",
  PARTIAL_NAME: "**** ####"
};

// src/registry.ts
var registry = {
  rules: /* @__PURE__ */ new Map(),
  lastUpdated: /* @__PURE__ */ new Date()
};
function initRegistry() {
  registry.rules.clear();
  for (const rule of DEFAULT_GLOBAL_RULES) {
    registry.rules.set(rule.id, rule);
  }
  for (const rule of Object.values(DEFAULT_ROLE_RULES)) {
    registry.rules.set(rule.id, rule);
  }
  registry.lastUpdated = /* @__PURE__ */ new Date();
}
function loadRules(rules) {
  for (const rule of rules) {
    registry.rules.set(rule.id, rule);
  }
  registry.lastUpdated = /* @__PURE__ */ new Date();
}
function upsertRule(rule) {
  registry.rules.set(rule.id, rule);
  registry.lastUpdated = /* @__PURE__ */ new Date();
}
function deleteRule(ruleId) {
  registry.rules.delete(ruleId);
  registry.lastUpdated = /* @__PURE__ */ new Date();
}
function getAllRules() {
  return Array.from(registry.rules.values());
}
function getRulesForContext(filter) {
  return Array.from(registry.rules.values()).filter((rule) => {
    if (rule.level === "global") return true;
    if (rule.level === "tenant" && rule.tenantId === filter.tenantId) return true;
    if (rule.level === "role" && filter.roleIds?.includes(rule.roleId)) return true;
    if (rule.level === "team" && rule.teamId === filter.teamId) return true;
    if (rule.level === "user" && rule.userId === filter.userId) return true;
    return false;
  });
}
function getRule(ruleId) {
  return registry.rules.get(ruleId);
}
function clearRegistry() {
  registry.rules.clear();
  registry.lastUpdated = /* @__PURE__ */ new Date();
}
function getRegistryInfo() {
  const rules = Array.from(registry.rules.values());
  const rulesByLevel = {};
  for (const rule of rules) {
    rulesByLevel[rule.level] = (rulesByLevel[rule.level] || 0) + 1;
  }
  return {
    ruleCount: rules.length,
    lastUpdated: registry.lastUpdated,
    rulesByLevel
  };
}
initRegistry();
export {
  DEFAULT_GLOBAL_RULES,
  DEFAULT_ROLE_RULES,
  MaskPatterns,
  applyMask,
  applyMasks,
  applyMasksBatch,
  applyMasksImmutable,
  canAccess,
  clearRegistry,
  deepClone,
  deletePath,
  deleteRule,
  deriveGuards,
  evaluate,
  evaluateCondition,
  getAllRules,
  getAllowedScopes,
  getDenials,
  getPath,
  getRegistryInfo,
  getRule,
  getRulesForContext,
  initRegistry,
  loadRules,
  maskValue,
  ruleApplies,
  setPath,
  upsertRule
};
//# sourceMappingURL=index.js.map