// src/projector.ts
var stateStore = /* @__PURE__ */ new Map();
function projectEvent(event) {
  const key = `${event.entityType}:${event.entityId}`;
  const existing = stateStore.get(key);
  const now = new Date(event.timestamp);
  const lastUpdated = existing ? new Date(existing.lastUpdated) : now;
  const timeInState = existing ? now.getTime() - lastUpdated.getTime() : 0;
  let state;
  switch (event.type) {
    case "deal.created":
      state = {
        id: event.payload.dealId,
        type: "deal",
        tenantId: event.tenantId,
        currentState: event.payload.state,
        ownerId: event.payload.salesPersonId,
        ownerRole: "SALESPERSON",
        timeInState: 0,
        lastUpdated: event.timestamp,
        metadata: event.payload
      };
      break;
    case "deal.stateChanged":
      state = existing || createDefaultState(event);
      state.currentState = event.payload.toState;
      state.timeInState = 0;
      state.lastUpdated = event.timestamp;
      state.metadata.previousState = event.payload.fromState;
      break;
    case "ro.created":
      state = {
        id: event.payload.roId,
        type: "ro",
        tenantId: event.tenantId,
        currentState: event.payload.state,
        ownerId: event.payload.advisorId,
        ownerRole: "SERVICE_ADVISOR",
        timeInState: 0,
        lastUpdated: event.timestamp,
        metadata: event.payload
      };
      break;
    case "ro.stateChanged":
      state = existing || createDefaultState(event);
      state.currentState = event.payload.toState;
      state.timeInState = 0;
      state.lastUpdated = event.timestamp;
      break;
    case "vehicle.acquired":
      state = {
        id: event.payload.vehicleId,
        type: "vehicle",
        tenantId: event.tenantId,
        currentState: "in-stock",
        timeInState: 0,
        lastUpdated: event.timestamp,
        metadata: event.payload
      };
      break;
    case "title.received":
      state = {
        id: event.payload.titleId,
        type: "title",
        tenantId: event.tenantId,
        currentState: "received",
        timeInState: 0,
        lastUpdated: event.timestamp,
        metadata: event.payload
      };
      break;
    default:
      state = existing || createDefaultState(event);
      state.lastUpdated = event.timestamp;
      if (existing) {
        state.timeInState = timeInState;
      }
  }
  stateStore.set(key, state);
  return state;
}
function createDefaultState(event) {
  return {
    id: event.entityId,
    type: event.entityType,
    tenantId: event.tenantId,
    currentState: "unknown",
    timeInState: 0,
    lastUpdated: event.timestamp,
    metadata: event.payload
  };
}
function getEntityState(entityType, entityId) {
  return stateStore.get(`${entityType}:${entityId}`);
}
function queryStates(filter) {
  return Array.from(stateStore.values()).filter((state) => {
    if (filter.type && state.type !== filter.type) return false;
    if (filter.tenantId && state.tenantId !== filter.tenantId) return false;
    if (filter.currentState && state.currentState !== filter.currentState) return false;
    if (filter.ownerId && state.ownerId !== filter.ownerId) return false;
    if (filter.minTimeInState && state.timeInState < filter.minTimeInState) return false;
    return true;
  });
}
function clearStates() {
  stateStore.clear();
}

// src/pubsub.ts
var channels = /* @__PURE__ */ new Map();
function publish(channel, event) {
  const subscribers = channels.get(channel);
  if (subscribers) {
    subscribers.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error(`Subscriber error on channel ${channel}:`, err);
      }
    });
  }
}
function subscribe(channel, handler) {
  if (!channels.has(channel)) {
    channels.set(channel, /* @__PURE__ */ new Set());
  }
  channels.get(channel).add(handler);
  return () => {
    channels.get(channel)?.delete(handler);
  };
}
function unsubscribeAll(channel) {
  channels.delete(channel);
}
var Channels = {
  // All events for a tenant
  tenant: (tenantId) => `tenant:${tenantId}:*`,
  // Specific entity type events
  deal: (tenantId) => `tenant:${tenantId}:deal:*`,
  ro: (tenantId) => `tenant:${tenantId}:ro:*`,
  vehicle: (tenantId) => `tenant:${tenantId}:vehicle:*`,
  title: (tenantId) => `tenant:${tenantId}:title:*`,
  // Specific entity
  entity: (tenantId, type, id) => `tenant:${tenantId}:${type}:${id}`,
  // User's owned entities
  user: (tenantId, userId) => `tenant:${tenantId}:user:${userId}:*`
};
export {
  Channels,
  clearStates,
  getEntityState,
  projectEvent,
  publish,
  queryStates,
  subscribe,
  unsubscribeAll
};
//# sourceMappingURL=index.js.map