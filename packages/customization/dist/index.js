// src/schema.ts
var DEFAULT_CONFIG = {
  dashboards: {
    layout: "grid",
    defaultView: "overview"
  },
  insights: {
    enabled: true,
    autoRefresh: true,
    refreshInterval: 3e5
    // 5 min
  },
  commandPalette: {
    enabled: true,
    recentCommands: 5
  },
  theme: {
    mode: "auto"
  }
};

// src/loader.ts
var cache = /* @__PURE__ */ new Map();
var CACHE_TTL = 6e4;
function getConfig(context) {
  const cacheKey = JSON.stringify(context);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.config;
  }
  const layers = [
    // Global would come from DB/config
    // Tenant would come from DB
    // Role would come from DB
    // Team would come from DB
    // User would come from DB
  ];
  const merged = mergeLayers(layers);
  cache.set(cacheKey, { config: merged, timestamp: Date.now() });
  return merged;
}
function mergeLayers(layers) {
  const sorted = [...layers].sort((a, b) => a.priority - b.priority);
  let result = {};
  for (const layer of sorted) {
    result = { ...result, ...layer.config };
  }
  return result;
}
function invalidateCache(context) {
  if (!context) {
    cache.clear();
    return;
  }
  const keys = Array.from(cache.keys());
  for (const key of keys) {
    const parsed = JSON.parse(key);
    if (context.tenantId && parsed.tenantId === context.tenantId || context.roleId && parsed.roleIds?.includes(context.roleId) || context.userId && parsed.userId === context.userId) {
      cache.delete(key);
    }
  }
}
export {
  DEFAULT_CONFIG,
  getConfig,
  invalidateCache,
  mergeLayers
};
//# sourceMappingURL=index.js.map