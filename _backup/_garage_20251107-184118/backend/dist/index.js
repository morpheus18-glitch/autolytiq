var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/socket.ts
var socket_exports = {};
__export(socket_exports, {
  TENANT_ROOM_PREFIX: () => TENANT_ROOM_PREFIX,
  emitTenantEvent: () => emitTenantEvent,
  getSocketServer: () => getSocketServer,
  getTenantRoom: () => getTenantRoom,
  getTenantRoomName: () => getTenantRoomName,
  registerSocket: () => registerSocket,
  registerSocketServer: () => registerSocketServer
});
function registerSocket(server) {
  socketServer = server;
}
function getSocketServer() {
  return socketServer;
}
function getTenantRoom(tenantId) {
  return `${TENANT_ROOM_PREFIX}${tenantId}`;
}
function emitTenantEvent(tenantId, event, payload) {
  socketServer?.to(getTenantRoom(tenantId)).emit(event, payload);
}
var TENANT_ROOM_PREFIX, socketServer, registerSocketServer, getTenantRoomName;
var init_socket = __esm({
  "src/lib/socket.ts"() {
    "use strict";
    TENANT_ROOM_PREFIX = "tenant:";
    registerSocketServer = registerSocket;
    getTenantRoomName = getTenantRoom;
  }
});

// src/sockets/lead.channel.ts
var lead_channel_exports = {};
__export(lead_channel_exports, {
  registerLeadChannel: () => registerLeadChannel
});
function resolveTenantId2(tenantId) {
  return tenantId && tenantId.length > 0 ? tenantId : PUBLIC_TENANT_ID;
}
function extractLeadId(input) {
  if (!input) {
    return void 0;
  }
  if (typeof input === "string") {
    return input;
  }
  if (typeof input === "object") {
    if ("leadId" in input && typeof input.leadId === "string") {
      return input.leadId;
    }
    if ("id" in input && typeof input.id === "string") {
      return input.id;
    }
  }
  return void 0;
}
function getLeadRoomName(tenantRoom, leadId) {
  return `${tenantRoom}:${LEAD_ROOM_PREFIX}:${leadId}`;
}
function registerLeadChannel(socket, tenantId) {
  const resolvedTenantId = resolveTenantId2(tenantId);
  const tenantRoom = getTenantRoom(resolvedTenantId);
  const joinLeadRoom = (leadIdentifier) => {
    const leadId = extractLeadId(leadIdentifier);
    if (!leadId) {
      return;
    }
    const leadRoom = getLeadRoomName(tenantRoom, leadId);
    socket.join(leadRoom);
  };
  const leaveLeadRoom = (leadIdentifier) => {
    const leadId = extractLeadId(leadIdentifier);
    if (!leadId) {
      return;
    }
    const leadRoom = getLeadRoomName(tenantRoom, leadId);
    socket.leave(leadRoom);
  };
  socket.on("lead:subscribe", (leadIdentifier) => {
    joinLeadRoom(leadIdentifier);
  });
  socket.on("lead:unsubscribe", (leadIdentifier) => {
    leaveLeadRoom(leadIdentifier);
  });
  socket.on("lead:updated", (payload) => {
    emitTenantEvent(resolvedTenantId, "lead:updated", payload);
    if (payload?.id) {
      const leadRoom = getLeadRoomName(tenantRoom, payload.id);
      socket.to(leadRoom).emit("lead:updated", payload);
    }
  });
}
var PUBLIC_TENANT_ID, LEAD_ROOM_PREFIX;
var init_lead_channel = __esm({
  "src/sockets/lead.channel.ts"() {
    "use strict";
    init_socket();
    PUBLIC_TENANT_ID = "public";
    LEAD_ROOM_PREFIX = "lead";
  }
});

// src/index.ts
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import path4 from "path";
import express2 from "express";

// src/server.ts
import express from "express";

// src/lib/errors.ts
var ApiError = class extends Error {
  code;
  status;
  details;
  constructor(code, message, options = {}) {
    super(message);
    this.code = code;
    this.status = options.status ?? 500;
    this.details = options.details;
    if (options.cause) {
      this.cause = options.cause;
    }
    this.name = "ApiError";
  }
};
function toApiError(error) {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof Error) {
    const status2 = typeof error.status === "number" ? error.status : 500;
    return new ApiError("UNEXPECTED_ERROR", error.message, { status: status2, cause: error });
  }
  return new ApiError("UNEXPECTED_ERROR", "An unexpected error occurred", { status: 500 });
}

// src/middleware/context.ts
var initializeContext = (req, _res, next) => {
  const current = req.context ?? {};
  req.context = {
    ...current,
    roles: current.roles ?? []
  };
  next();
};

// src/routes/index.ts
import { Router as Router27 } from "express";

// src/middleware/auth.ts
import jwt from "jsonwebtoken";

// src/config/env.ts
import { config } from "dotenv";
import { z } from "zod";
config();
var envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_ISSUER: z.string().optional().default("autolytiq"),
  JWT_AUDIENCE: z.string().optional().default("autolytiq-api"),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM: z.string().optional().default("noreply@autolytiq.com"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),
  TWILIO_CALLER_ID: z.string().optional(),
  SOCKET_IO_CORS_ORIGIN: z.string().optional().default("*"),
  APP_URL: z.string().optional().default("http://localhost:3000"),
  API_URL: z.string().optional().default("http://localhost:5000"),
  ML_SERVICE_URL: z.string().url("ML_SERVICE_URL must be a valid URL").default("http://localhost:8000"),
  ML_SERVICE_TOKEN: z.string().min(1, "ML_SERVICE_TOKEN is required").default("dev-ml-token"),
  REDIS_URL: z.string().url("REDIS_URL must be a valid redis connection string").optional(),
  AWS_REGION: z.string().min(1).optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(1).optional(),
  S3_CLOUDFRONT_URL: z.string().url().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  CLAMAV_HOST: z.string().optional(),
  CLAMAV_PORT: z.coerce.number().int().positive().optional(),
  PORT: z.string().default("5000").transform((value) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      throw new Error("PORT must be a positive integer");
    }
    return parsed;
  })
}).transform((values) => ({
  ...values,
  JWT_PRIVATE_KEY: values.JWT_PRIVATE_KEY ? values.JWT_PRIVATE_KEY.replace(/\\n/g, "\n") : void 0,
  JWT_PUBLIC_KEY: values.JWT_PUBLIC_KEY ? values.JWT_PUBLIC_KEY.replace(/\\n/g, "\n") : void 0
}));
var env;
try {
  env = envSchema.parse(process.env);
  if (!env.JWT_PRIVATE_KEY) {
    console.warn("\u26A0\uFE0F  Warning: JWT_PRIVATE_KEY not set - token signing may not work");
  }
  if (!env.JWT_PUBLIC_KEY) {
    console.warn("\u26A0\uFE0F  Warning: JWT_PUBLIC_KEY not set - authentication may not work");
  }
  if (!env.SENDGRID_API_KEY) {
    console.warn("\u26A0\uFE0F  Warning: SENDGRID_API_KEY not set - email sending disabled");
  }
  if (!env.TWILIO_ACCOUNT_SID) {
    console.warn("\u26A0\uFE0F  Warning: TWILIO_ACCOUNT_SID not set - SMS sending disabled");
  }
  if (!env.REDIS_URL && env.NODE_ENV === "production") {
    console.warn("\u26A0\uFE0F  Warning: REDIS_URL not set in production - session storage may be unreliable");
  }
} catch (error) {
  console.error("\u274C Environment validation failed:");
  if (error instanceof z.ZodError) {
    console.error("Missing or invalid environment variables:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.error(error);
  }
  process.exit(1);
}

// src/types/roles.ts
var Roles = [
  "ADMIN",
  "MANAGER",
  "SALES_MANAGER",
  "FINANCE",
  "FI_MANAGER",
  "SALES",
  "BDC",
  "SERVICE"
];

// src/middleware/auth.ts
function extractTenantId(payload) {
  if (payload.tenantId && typeof payload.tenantId === "string") {
    return payload.tenantId;
  }
  if (payload.tenant_id && typeof payload.tenant_id === "string") {
    return payload.tenant_id;
  }
  const customTenant = payload["https://autolytiq.com/tenant"];
  if (typeof customTenant === "string") {
    return customTenant;
  }
  return void 0;
}
function normalizeRoles(rawRoles) {
  if (!rawRoles) {
    return [];
  }
  const normalize = (value) => value.trim().toUpperCase();
  const allowed = new Set(Roles);
  if (Array.isArray(rawRoles)) {
    return rawRoles.map(normalize).filter((role) => allowed.has(role));
  }
  return rawRoles.split(",").map(normalize).filter((role) => role.length > 0 && allowed.has(role));
}
var publicKey = env.JWT_PUBLIC_KEY;
var authenticate = async (req, res, next) => {
  if (process.env.BYPASS_AUTH === "true") {
    console.log("[AUTH BYPASS] Skipping JWT validation, auto-logging in first active user");
    req.context = {
      ...req.context,
      user: {
        id: "c0600bf6-def8-4e56-98cd-73bff976acf4",
        email: "developer@sunrisemotors.demo",
        name: "Dana Reeves",
        tenantId: "fdc31355-36b9-4e44-8982-7a231f74e1fd"
      },
      roles: ["ADMIN"]
    };
    return next();
  }
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }
  const token = authorization.slice(7);
  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      audience: env.JWT_AUDIENCE,
      issuer: env.JWT_ISSUER
    });
    if (!payload.sub) {
      return res.status(401).json({ message: "Token subject missing" });
    }
    const tenantId = extractTenantId(payload);
    const roles = normalizeRoles(payload.roles);
    req.context = {
      ...req.context,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        tenantId
      },
      roles
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// src/lib/prisma.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { AsyncLocalStorage } from "async_hooks";

// src/shared/search-vector.ts
var DIACRITIC_REGEX = new RegExp("\\p{Diacritic}", "gu");
var TOKEN_SPLIT_REGEX = /[^a-z0-9]+/gu;
function normalizeBase(value) {
  return value.normalize("NFKD").replace(DIACRITIC_REGEX, "").toLowerCase();
}
function tokenize(value) {
  if (!value) {
    return [];
  }
  const normalized = normalizeBase(value);
  return normalized.split(TOKEN_SPLIT_REGEX).filter(Boolean);
}
function addTokens(target, tokens) {
  for (const token of tokens) {
    if (token) {
      target.add(token);
    }
  }
}
function addEmailTokens(target, email) {
  if (!email) {
    return;
  }
  const normalized = normalizeBase(email);
  addTokens(target, normalized.split(TOKEN_SPLIT_REGEX).filter(Boolean));
  const compact = normalized.replace(/[^a-z0-9]/gu, "");
  if (compact) {
    target.add(compact);
  }
}
function addPhoneTokens(target, phone) {
  if (!phone) {
    return;
  }
  addTokens(target, tokenize(phone));
  const digitsOnly = phone.replace(/\D+/gu, "");
  if (digitsOnly.length >= 4) {
    target.add(digitsOnly);
  }
}
function addVinTokens(target, vin) {
  if (!vin) {
    return;
  }
  const normalized = normalizeBase(vin);
  addTokens(target, normalized.split(TOKEN_SPLIT_REGEX).filter(Boolean));
  const compact = normalized.replace(/[^a-z0-9]/gu, "");
  if (compact) {
    target.add(compact);
  }
}
function buildVector(tokens) {
  if (tokens.size === 0) {
    return null;
  }
  return Array.from(tokens).sort().join(" ");
}
function buildCustomerSearchVector(input) {
  const tokens = /* @__PURE__ */ new Set();
  addTokens(tokens, tokenize(input.firstName));
  addTokens(tokens, tokenize(input.lastName));
  addEmailTokens(tokens, input.email);
  addPhoneTokens(tokens, input.phone);
  return buildVector(tokens);
}
function buildVehicleSearchVector(input) {
  const tokens = /* @__PURE__ */ new Set();
  addVinTokens(tokens, input.vin);
  addTokens(tokens, tokenize(input.make));
  addTokens(tokens, tokenize(input.model));
  return buildVector(tokens);
}

// src/lib/prisma.ts
var tenantStorage = new AsyncLocalStorage();
var tenantScopedModels = /* @__PURE__ */ new Set([
  // Core CRM
  Prisma.ModelName.User,
  Prisma.ModelName.Customer,
  Prisma.ModelName.CustomerInteraction,
  Prisma.ModelName.CustomerVehicle,
  Prisma.ModelName.Lead,
  Prisma.ModelName.LeadScore,
  Prisma.ModelName.Activity,
  Prisma.ModelName.Appointment,
  Prisma.ModelName.Communication,
  // Templates & Automation
  Prisma.ModelName.EmailTemplate,
  Prisma.ModelName.SMSTemplate,
  Prisma.ModelName.Automation,
  Prisma.ModelName.AutomationExecution,
  // Inventory
  Prisma.ModelName.Vehicle,
  Prisma.ModelName.VehicleHistory,
  Prisma.ModelName.Appraisal,
  Prisma.ModelName.ReconItem,
  Prisma.ModelName.PriceHistory,
  Prisma.ModelName.AuctionPurchase,
  Prisma.ModelName.WholesaleListing,
  Prisma.ModelName.MarketComp,
  // Deals & F&I
  Prisma.ModelName.Deal,
  Prisma.ModelName.DealWorksheet,
  Prisma.ModelName.DealVersion,
  Prisma.ModelName.DealOptimization,
  Prisma.ModelName.DealJacket,
  Prisma.ModelName.CounterOffer,
  Prisma.ModelName.ApprovalPrediction,
  Prisma.ModelName.CreditSubmissionDraft,
  Prisma.ModelName.ComplianceChecklist,
  Prisma.ModelName.CreditApplication,
  Prisma.ModelName.CreditReport,
  Prisma.ModelName.Contract,
  Prisma.ModelName.DealDocument,
  Prisma.ModelName.FundingChecklist,
  Prisma.ModelName.FundingRequest,
  // F&I Products & Lenders
  Prisma.ModelName.FIProduct,
  Prisma.ModelName.MenuConfiguration,
  Prisma.ModelName.Lender,
  Prisma.ModelName.LenderSubmission,
  // Accounting
  Prisma.ModelName.GLAccount,
  Prisma.ModelName.JournalEntry,
  Prisma.ModelName.JournalEntryLine,
  Prisma.ModelName.Commission,
  // Workflow & Operations
  Prisma.ModelName.WorkflowDefinition,
  Prisma.ModelName.WorkflowStage,
  Prisma.ModelName.VehicleWorkflow,
  Prisma.ModelName.StageTransition,
  Prisma.ModelName.WorkflowTask,
  Prisma.ModelName.TransportOrder,
  // System
  Prisma.ModelName.Notification,
  Prisma.ModelName.Report,
  Prisma.ModelName.PipelineAggregate,
  Prisma.ModelName.AuditLog,
  Prisma.ModelName.SystemSetting
]);
var SEARCH_VECTOR_MODELS = /* @__PURE__ */ new Set(["Customer", "Vehicle"]);
var CUSTOMER_SEARCH_FIELDS = ["firstName", "lastName", "email", "phone"];
var VEHICLE_SEARCH_FIELDS = ["vin", "make", "model"];
function withTenantGuard(params) {
  if (!params.model || !tenantScopedModels.has(params.model)) {
    return { params, tenantId: void 0 };
  }
  const store = tenantStorage.getStore();
  const tenantId = store?.tenantId;
  if (!tenantId) {
    throw new Error(`Tenant context is required for ${params.model} operations.`);
  }
  return { params, tenantId };
}
function applyTenantFilters(params, tenantId) {
  params.args = params.args ?? {};
  switch (params.action) {
    case "findUnique": {
      params.action = "findFirst";
      params.args.where = { AND: [params.args.where ?? {}, { tenantId }] };
      break;
    }
    case "findFirst":
    case "findMany":
    case "count":
    case "aggregate":
    case "groupBy":
    case "delete":
    case "deleteMany":
    case "update":
    case "updateMany": {
      params.args.where = { AND: [params.args.where ?? {}, { tenantId }] };
      break;
    }
    case "create":
    case "createMany": {
      if (Array.isArray(params.args.data)) {
        params.args.data = params.args.data.map((entry) => ({
          tenantId,
          ...entry
        }));
      } else if (params.args.data) {
        params.args.data = { tenantId, ...params.args.data };
      }
      break;
    }
    case "upsert": {
      params.args.where = { AND: [params.args.where ?? {}, { tenantId }] };
      if (params.args.create) {
        params.args.create = { tenantId, ...params.args.create };
      }
      if (params.args.update) {
        params.args.update = { ...params.args.update, tenantId };
      }
      break;
    }
    default:
      break;
  }
  return params;
}
function isSearchVectorModel(model) {
  return typeof model === "string" && SEARCH_VECTOR_MODELS.has(model);
}
function extractScalarString(value) {
  if (value === void 0) {
    return void 0;
  }
  if (value === null || typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && value !== null && "set" in value) {
    const setValue = value.set;
    if (setValue === void 0 || setValue === null || typeof setValue === "string") {
      return setValue;
    }
  }
  return void 0;
}
function shouldRebuildSearchVector(model, data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  const keys = model === "Customer" ? CUSTOMER_SEARCH_FIELDS : VEHICLE_SEARCH_FIELDS;
  return keys.some((field) => field in data);
}
function mergeCustomerFields(data, fallback) {
  const result = {
    firstName: fallback?.firstName ?? void 0,
    lastName: fallback?.lastName ?? void 0,
    email: fallback?.email ?? void 0,
    phone: fallback?.phone ?? void 0
  };
  for (const field of CUSTOMER_SEARCH_FIELDS) {
    const value = extractScalarString(data[field]);
    if (value !== void 0) {
      result[field] = value;
    }
  }
  return result;
}
function mergeVehicleFields(data, fallback) {
  const result = {
    vin: fallback?.vin ?? void 0,
    make: fallback?.make ?? void 0,
    model: fallback?.model ?? void 0
  };
  for (const field of VEHICLE_SEARCH_FIELDS) {
    const value = extractScalarString(data[field]);
    if (value !== void 0) {
      result[field] = value;
    }
  }
  return result;
}
function combineWithTenantFilter(where, tenantId) {
  if (!where || Object.keys(where).length === 0) {
    return { tenantId };
  }
  return { AND: [where, { tenantId }] };
}
var CUSTOMER_SNAPSHOT_SELECT = {
  id: true,
  tenantId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  searchVector: true
};
var VEHICLE_SNAPSHOT_SELECT = {
  id: true,
  tenantId: true,
  vin: true,
  make: true,
  model: true,
  searchVector: true
};
function setSearchVectorValue(model, target, fallback) {
  if (model === "Customer") {
    const merged2 = mergeCustomerFields(target, fallback);
    const vector2 = buildCustomerSearchVector({
      firstName: merged2.firstName ?? null,
      lastName: merged2.lastName ?? null,
      email: merged2.email ?? null,
      phone: merged2.phone ?? null
    });
    target.searchVector = vector2 ?? null;
    return;
  }
  const merged = mergeVehicleFields(target, fallback);
  const vector = buildVehicleSearchVector({
    vin: merged.vin ?? null,
    make: merged.make ?? null,
    model: merged.model ?? null
  });
  target.searchVector = vector ?? null;
}
function runWithoutSearchVector(tenantId, callback) {
  const current = tenantStorage.getStore() ?? {};
  const context = { ...current, tenantId, skipSearchVector: true };
  return tenantStorage.run(context, callback);
}
async function fetchCustomerSnapshot(client3, where, tenantId) {
  return runWithoutSearchVector(
    tenantId,
    () => client3.customer.findFirst({
      where: combineWithTenantFilter(where, tenantId),
      select: CUSTOMER_SNAPSHOT_SELECT
    })
  );
}
async function fetchCustomerSnapshots(client3, where, tenantId) {
  return runWithoutSearchVector(
    tenantId,
    () => client3.customer.findMany({
      where: combineWithTenantFilter(where, tenantId),
      select: CUSTOMER_SNAPSHOT_SELECT
    })
  );
}
async function fetchVehicleSnapshot(client3, where, tenantId) {
  return runWithoutSearchVector(
    tenantId,
    () => client3.vehicle.findFirst({
      where: combineWithTenantFilter(where, tenantId),
      select: VEHICLE_SNAPSHOT_SELECT
    })
  );
}
async function fetchVehicleSnapshots(client3, where, tenantId) {
  return runWithoutSearchVector(
    tenantId,
    () => client3.vehicle.findMany({
      where: combineWithTenantFilter(where, tenantId),
      select: VEHICLE_SNAPSHOT_SELECT
    })
  );
}
async function persistCustomerSearchVector(client3, tenantId, snapshot) {
  const vector = buildCustomerSearchVector(snapshot);
  if (vector === snapshot.searchVector) {
    return vector;
  }
  await runWithoutSearchVector(
    tenantId,
    () => client3.customer.updateMany({
      where: { id: snapshot.id, tenantId },
      data: { searchVector: vector }
    })
  );
  return vector;
}
async function persistVehicleSearchVector(client3, tenantId, snapshot) {
  const vector = buildVehicleSearchVector(snapshot);
  if (vector === snapshot.searchVector) {
    return vector;
  }
  await runWithoutSearchVector(
    tenantId,
    () => client3.vehicle.updateMany({
      where: { id: snapshot.id, tenantId },
      data: { searchVector: vector }
    })
  );
  return vector;
}
function applySearchVectorPreprocess(model, action, args) {
  if (!args) {
    return;
  }
  switch (action) {
    case "create":
    case "createMany": {
      const data = args.data;
      if (!data) {
        return;
      }
      if (Array.isArray(data)) {
        for (const entry of data) {
          setSearchVectorValue(model, entry);
        }
      } else {
        setSearchVectorValue(model, data);
      }
      break;
    }
    case "upsert": {
      if (args.create) {
        setSearchVectorValue(model, args.create);
      }
      break;
    }
    default:
      break;
  }
}
async function rebuildSearchVectorsAfterAction(client3, tenantId, model, action, args, result) {
  if (action === "updateMany") {
    const data = args?.data;
    if (!shouldRebuildSearchVector(model, data)) {
      return;
    }
    if (model === "Customer") {
      const snapshots2 = await fetchCustomerSnapshots(client3, args?.where, tenantId);
      for (const snapshot of snapshots2) {
        await persistCustomerSearchVector(client3, tenantId, snapshot);
      }
      return;
    }
    const snapshots = await fetchVehicleSnapshots(client3, args?.where, tenantId);
    for (const snapshot of snapshots) {
      await persistVehicleSearchVector(client3, tenantId, snapshot);
    }
    return;
  }
  if (action === "update" || action === "upsert") {
    const data = action === "upsert" ? args?.update : args?.data;
    if (!shouldRebuildSearchVector(model, data)) {
      return;
    }
    if (model === "Customer") {
      const snapshot2 = await fetchCustomerSnapshot(client3, args?.where, tenantId);
      if (!snapshot2) {
        return;
      }
      const vector2 = await persistCustomerSearchVector(client3, tenantId, snapshot2);
      if (result && typeof result === "object" && result !== null && "searchVector" in result) {
        result.searchVector = vector2 ?? null;
      }
      return;
    }
    const snapshot = await fetchVehicleSnapshot(client3, args?.where, tenantId);
    if (!snapshot) {
      return;
    }
    const vector = await persistVehicleSearchVector(client3, tenantId, snapshot);
    if (result && typeof result === "object" && result !== null && "searchVector" in result) {
      result.searchVector = vector ?? null;
    }
  }
}
function createPrismaClient() {
  const client3 = new PrismaClient({
    log: true ? ["query", "warn", "error"] : ["warn", "error"]
  });
  client3.$use(async (params, next) => {
    const store = tenantStorage.getStore();
    if (store?.skipSearchVector) {
      return next(params);
    }
    const { params: guardedParams, tenantId } = withTenantGuard(params);
    if (!tenantId) {
      return next(guardedParams);
    }
    if (isSearchVectorModel(guardedParams.model)) {
      applySearchVectorPreprocess(guardedParams.model, guardedParams.action, guardedParams.args);
    }
    const scopedParams = applyTenantFilters(guardedParams, tenantId);
    const result = await next(scopedParams);
    if (isSearchVectorModel(guardedParams.model)) {
      await rebuildSearchVectorsAfterAction(
        client3,
        tenantId,
        guardedParams.model,
        guardedParams.action,
        scopedParams.args,
        result
      );
    }
    return result;
  });
  return client3;
}
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? createPrismaClient();
if (true) {
  globalForPrisma.prisma = prisma;
}
var tenantContext = tenantStorage;
function runWithTenant(tenantId, callback) {
  const current = tenantStorage.getStore() ?? {};
  return tenantStorage.run({ ...current, tenantId }, callback);
}
function getTenantId() {
  return tenantStorage.getStore()?.tenantId;
}
function isTenantScoped() {
  return Boolean(getTenantId());
}
function toInputJson(value) {
  return JSON.parse(JSON.stringify(value));
}

// src/middleware/tenant.ts
var TENANT_HEADER = "x-tenant-id";
var tenantScope = (req, res, next) => {
  const headerTenant = req.get(TENANT_HEADER) ?? req.get(TENANT_HEADER.toUpperCase());
  const tenantId = req.context?.user?.tenantId ?? headerTenant ?? req.context?.tenantId;
  if (!tenantId) {
    return res.status(403).json({ message: "Tenant scope is required" });
  }
  req.context = {
    ...req.context,
    tenantId
  };
  tenantContext.run({ tenantId }, () => {
    next();
  });
};

// src/middleware/rbac.ts
function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.context?.user;
    const userRoles = req.context?.roles ?? [];
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (roles.length === 0) {
      return next();
    }
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

// src/routes/leads.ts
import { Router } from "express";

// src/lib/request.ts
import { randomUUID } from "crypto";
var REQUEST_ID_HEADER = "x-request-id";
function resolveRequestId(req) {
  const header = req.get(REQUEST_ID_HEADER) ?? req.get(REQUEST_ID_HEADER.toUpperCase());
  if (header && header.trim().length > 0) {
    return header.trim();
  }
  const generated = randomUUID();
  req.headers[REQUEST_ID_HEADER] = generated;
  return generated;
}

// src/services/lead-score.service.ts
init_socket();

// src/services/lead-intelligence.service.ts
import { AppointmentStatus, ActivityType, CommunicationDirection, CommunicationType } from "@prisma/client";
import { subDays } from "date-fns";
var MS_IN_DAY = 1e3 * 60 * 60 * 24;
var LeadNotFoundError = class extends Error {
  status = 404;
  constructor(message) {
    super(message);
    this.name = "LeadNotFoundError";
  }
};
function calculateDaysBetween(start, end) {
  return Number(((end.getTime() - start.getTime()) / MS_IN_DAY).toFixed(2));
}
function safeNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return value;
}
function normalizeTags(tags) {
  return Array.isArray(tags) ? tags.filter((tag) => Boolean(tag)).map((tag) => tag.trim()) : [];
}
function extractBudgetFromDescription(description) {
  if (!description) {
    return null;
  }
  const budgetMatch = description.match(/\$?\s*(\d{2,3}(?:[\s,]?\d{3})+|\d+(?:\.\d+)?)(?:\s*([kK]))?/);
  if (!budgetMatch) {
    return null;
  }
  const numeric = Number.parseFloat(budgetMatch[1].replace(/[$,\s]/g, ""));
  if (!Number.isFinite(numeric)) {
    return null;
  }
  const multiplier = budgetMatch[2] ? 1e3 : 1;
  const value = numeric * multiplier;
  return value >= 1e3 ? value : null;
}
function computeBudgetSignals(description, tags, priority, rating) {
  const loweredTags = tags.map((tag) => tag.toLowerCase());
  const estimatedBudget = extractBudgetFromDescription(description);
  const hasBudget = typeof estimatedBudget === "number";
  const tradeIn = loweredTags.some((tag) => tag.includes("trade"));
  const financingInterest = loweredTags.some((tag) => tag.includes("finance") || tag.includes("loan"));
  return {
    hasBudget,
    estimatedBudget: hasBudget ? estimatedBudget : null,
    tradeIn,
    financingInterest,
    priority: priority ?? null,
    rating: typeof rating === "number" ? rating : null
  };
}
function computeActivityAggregate(activitySamples, communicationSamples) {
  let emailOpens = 0;
  let emailClicks = 0;
  let calls = 0;
  let sms = 0;
  let websiteVisits = 0;
  let meetings = 0;
  let inboundResponses = 0;
  const now = /* @__PURE__ */ new Date();
  const last7Window = subDays(now, 7);
  const previous7Window = subDays(now, 14);
  let last7Interactions = 0;
  let previous7Interactions = 0;
  for (const activity of activitySamples) {
    if (activity.type === ActivityType.EMAIL) {
      if (activity.opened) emailOpens += 1;
      if (activity.clicked) emailClicks += 1;
    }
    if (activity.type === ActivityType.CALL) {
      calls += 1;
    }
    if (activity.type === ActivityType.MEETING || activity.type === ActivityType.TEST_DRIVE) {
      meetings += 1;
    }
    if (activity.type === ActivityType.VISIT) {
      websiteVisits += 1;
    }
    if (activity.createdAt >= last7Window) {
      last7Interactions += 1;
    } else if (activity.createdAt >= previous7Window) {
      previous7Interactions += 1;
    }
  }
  for (const communication of communicationSamples) {
    if (communication.type === CommunicationType.CALL) {
      calls += 1;
    }
    if (communication.type === CommunicationType.SMS) {
      sms += 1;
    }
    if (communication.direction === CommunicationDirection.INBOUND) {
      inboundResponses += 1;
    }
    if (communication.createdAt >= last7Window) {
      last7Interactions += 1;
    } else if (communication.createdAt >= previous7Window) {
      previous7Interactions += 1;
    }
  }
  const totalInteractions = activitySamples.length + communicationSamples.length;
  return {
    emailOpens,
    emailClicks,
    calls,
    sms,
    websiteVisits,
    meetings,
    inboundResponses,
    totalInteractions,
    last7DayInteractions: last7Interactions,
    previous7DayInteractions: previous7Interactions
  };
}
function computeTimetable(lead, aggregate) {
  const now = /* @__PURE__ */ new Date();
  const lastActivityAt = lead.lastActivityAt ?? null;
  const daysInPipeline = calculateDaysBetween(lead.createdAt, now);
  const hoursSinceLastActivity = lastActivityAt ? (now.getTime() - lastActivityAt.getTime()) / (1e3 * 60 * 60) : null;
  const lastInteractionDays = hoursSinceLastActivity !== null ? Number((hoursSinceLastActivity / 24).toFixed(2)) : null;
  const upcomingAppointment = lead.appointments.find(
    (appointment) => appointment.startAt && appointment.startAt > now && appointment.status !== AppointmentStatus.CANCELLED && appointment.status !== AppointmentStatus.NO_SHOW
  );
  const upcomingAppointmentInHours = upcomingAppointment ? Number(((upcomingAppointment.startAt.getTime() - now.getTime()) / (1e3 * 60 * 60)).toFixed(2)) : null;
  const velocityDelta = aggregate.last7DayInteractions - aggregate.previous7DayInteractions;
  const momentum = aggregate.previous7DayInteractions ? Number((velocityDelta / Math.max(aggregate.previous7DayInteractions, 1)).toFixed(2)) : aggregate.last7DayInteractions > 0 ? 1 : 0;
  return {
    daysInPipeline,
    hoursSinceLastActivity: safeNumber(hoursSinceLastActivity),
    lastInteractionDays,
    nextActionAt: lead?.nextActionAt ? lead.nextActionAt.toISOString() : null,
    upcomingAppointmentInHours,
    engagementMomentum: safeNumber(momentum)
  };
}
function computeSimilaritySignals(convertedLeads, leadTags, leadSource, leadPriority, leadRating) {
  if (convertedLeads.length === 0) {
    return {
      score: 0.45,
      sampleSize: 0,
      sourceMatchRate: 0,
      priorityMatchRate: 0,
      tagOverlapRate: 0
    };
  }
  let sourceMatches = 0;
  let priorityMatches = 0;
  let tagOverlap = 0;
  for (const converted of convertedLeads) {
    if (converted.source && converted.source === leadSource) {
      sourceMatches += 1;
    }
    if (converted.priority && converted.priority === leadPriority) {
      priorityMatches += 1;
    }
    const convertedTags = Array.isArray(converted.tags) ? converted.tags : [];
    if (convertedTags.length) {
      const overlap = convertedTags.filter((tag) => leadTags.includes(tag)).length;
      tagOverlap += overlap;
    }
  }
  const sampleSize = convertedLeads.length;
  const sourceMatchRate = sourceMatches / sampleSize;
  const priorityMatchRate = priorityMatches / sampleSize;
  const tagOverlapRate = leadTags.length ? tagOverlap / (leadTags.length * sampleSize) : 0;
  const ratingFactor = typeof leadRating === "number" ? Math.max(leadRating, 0) / 100 : 0.5;
  const baseScore = 0.25 + sourceMatchRate * 0.3 + priorityMatchRate * 0.25 + tagOverlapRate * 0.2 + ratingFactor * 0.1;
  return {
    score: Number(Math.min(Math.max(baseScore, 0.15), 0.95).toFixed(4)),
    sampleSize,
    sourceMatchRate: Number(sourceMatchRate.toFixed(4)),
    priorityMatchRate: Number(priorityMatchRate.toFixed(4)),
    tagOverlapRate: Number(tagOverlapRate.toFixed(4))
  };
}
function computeDerivedEngagement(aggregate) {
  const raw = aggregate.emailOpens * 2 + aggregate.emailClicks * 4 + aggregate.calls * 6 + aggregate.sms * 3 + aggregate.websiteVisits * 3 + aggregate.meetings * 8 + aggregate.inboundResponses * 5;
  let trendBonus = 0;
  if (aggregate.previous7DayInteractions) {
    const delta = aggregate.last7DayInteractions - aggregate.previous7DayInteractions;
    trendBonus = Math.min(Math.max(delta / Math.max(aggregate.previous7DayInteractions, 1), -0.25), 0.5) * 20;
  } else if (aggregate.last7DayInteractions > 0) {
    trendBonus = 10;
  }
  const engagement = Math.tanh(raw / 40) * 100 + trendBonus;
  return Number(Math.min(Math.max(engagement, 0), 100).toFixed(2));
}
async function buildLeadInsights(leadId) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId },
    include: {
      appointments: {
        orderBy: { startAt: "asc" },
        take: 5,
        select: { startAt: true, status: true }
      },
      scores: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { score: true, createdAt: true }
      }
    }
  });
  if (!lead) {
    throw new LeadNotFoundError(`Lead ${leadId} not found`);
  }
  const ninetyDaysAgo = subDays(/* @__PURE__ */ new Date(), 90);
  const [activities, communications, convertedLeads] = await Promise.all([
    prisma.activity.findMany({
      where: {
        leadId,
        createdAt: { gte: ninetyDaysAgo }
      },
      select: {
        type: true,
        opened: true,
        clicked: true,
        createdAt: true
      }
    }),
    prisma.communication.findMany({
      where: {
        leadId,
        createdAt: { gte: ninetyDaysAgo }
      },
      select: {
        type: true,
        direction: true,
        createdAt: true
      }
    }),
    prisma.lead.findMany({
      where: {
        isConverted: true,
        id: { not: leadId }
      },
      select: {
        source: true,
        priority: true,
        tags: true,
        rating: true
      },
      take: 75
    })
  ]);
  const tags = normalizeTags(lead.tags);
  const aggregate = computeActivityAggregate(activities, communications);
  const timetable = computeTimetable(lead, aggregate);
  const budgetSignals = computeBudgetSignals(lead.description, tags, lead.priority, lead.rating ?? null);
  const similarity = computeSimilaritySignals(convertedLeads, tags, lead.source, lead.priority, lead.rating ?? null);
  const derivedEngagement = computeDerivedEngagement(aggregate);
  const metadata = {
    id: lead.id,
    status: lead.status,
    source: lead.source,
    priority: lead.priority,
    rating: lead.rating ?? null,
    tags,
    createdAt: lead.createdAt.toISOString(),
    assignedToId: lead.assignedToId,
    ownerId: lead.ownerId,
    latestScore: lead.score ?? null,
    stage: lead.status
  };
  return {
    leadId,
    tenantId: lead.tenantId,
    metadata,
    activities: aggregate,
    timetable,
    budgetSignals,
    similarity,
    derivedEngagementScore: derivedEngagement,
    latestScore: lead.scores[0] ? {
      score: lead.scores[0].score,
      createdAt: lead.scores[0].createdAt.toISOString()
    } : null
  };
}

// src/services/ml.service.ts
import axios from "axios";
var RETRYABLE_STATUS = /* @__PURE__ */ new Set([408, 425, 429, 500, 502, 503, 504]);
var RETRYABLE_CODES = /* @__PURE__ */ new Set(["ECONNABORTED", "ECONNRESET", "ENOTFOUND", "ETIMEDOUT"]);
var CircuitBreaker = class {
  constructor(failureThreshold = 5, resetTimeout = 3e4) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }
  failureCount = 0;
  state = "CLOSED";
  nextAttempt = 0;
  transitionToOpen() {
    this.state = "OPEN";
    this.nextAttempt = Date.now() + this.resetTimeout;
  }
  onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }
  onFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold || this.state === "HALF_OPEN") {
      this.transitionToOpen();
    }
  }
  async exec(operation) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        const error = new Error("ML service circuit breaker is open");
        error.status = 503;
        throw error;
      }
      this.state = "HALF_OPEN";
    }
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
};
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
var MLService = class {
  client = axios.create({
    baseURL: env.ML_SERVICE_URL,
    timeout: 300,
    // 300ms - fail fast with fallbacks
    headers: { "Content-Type": "application/json" }
  });
  circuitBreaker = new CircuitBreaker();
  maxRetries = 3;
  baseDelay = 200;
  buildHeaders(requestId, tenantId) {
    return {
      Authorization: `Bearer ${env.ML_SERVICE_TOKEN}`,
      ...requestId ? { "X-Request-Id": requestId } : {},
      ...tenantId ? { "X-Tenant-Id": tenantId } : {}
    };
  }
  isRetryable(error) {
    if (!axios.isAxiosError(error)) {
      return false;
    }
    const status2 = error.response?.status;
    if (status2 && RETRYABLE_STATUS.has(status2)) {
      return true;
    }
    if (error.code && RETRYABLE_CODES.has(error.code)) {
      return true;
    }
    return false;
  }
  wrapError(error) {
    if (axios.isAxiosError(error)) {
      const status2 = error.response?.status ?? 502;
      const message = (typeof error.response?.data === "object" && error.response?.data && "detail" in error.response.data ? error.response.data.detail : void 0) || error.message;
      const wrapped = new Error(`ML service request failed${status2 ? ` (status ${status2})` : ""}: ${message}`);
      wrapped.status = status2;
      return wrapped;
    }
    return error instanceof Error ? error : new Error("Unknown ML service error");
  }
  async withRetry(operation) {
    let attempt = 0;
    let lastError;
    while (attempt <= this.maxRetries) {
      try {
        return await this.circuitBreaker.exec(operation);
      } catch (error) {
        lastError = error;
        if (!this.isRetryable(error) || attempt === this.maxRetries) {
          throw this.wrapError(error);
        }
        await delay(this.baseDelay * 2 ** attempt);
        attempt += 1;
      }
    }
    throw this.wrapError(lastError);
  }
  async scoreLead(payload) {
    const headers = this.buildHeaders(payload.requestId, payload.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post("/score-lead", payload, { headers });
      return response.data;
    });
  }
  async nextAction(payload) {
    const headers = this.buildHeaders(payload.requestId, payload.context.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post("/next-action", payload, { headers });
      return response.data;
    });
  }
  async sentimentAnalysis(payload) {
    const headers = this.buildHeaders(payload.requestId, payload.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post("/sentiment-analysis", payload, { headers });
      return response.data;
    });
  }
  async optimizeDeal(payload, options) {
    const headers = this.buildHeaders(options.requestId, options.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post("/desking/optimize", payload, { headers });
      const traceId = response.headers["x-ml-trace-id"];
      return { result: response.data, traceId: typeof traceId === "string" ? traceId : void 0 };
    });
  }
  async analyzeCounter(payload, options) {
    const headers = this.buildHeaders(options.requestId, options.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post("/desking/counter", payload, { headers });
      const traceId = response.headers["x-ml-trace-id"];
      return { result: response.data, traceId: typeof traceId === "string" ? traceId : void 0 };
    });
  }
  async predictApproval(payload, options) {
    const headers = this.buildHeaders(options.requestId, options.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post("/desking/approval", payload, { headers });
      const traceId = response.headers["x-ml-trace-id"];
      return { result: response.data, traceId: typeof traceId === "string" ? traceId : void 0 };
    });
  }
  async closeProbability(params) {
    const headers = this.buildHeaders(params.requestId, params.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.get(
        "/close-probability",
        {
          headers,
          params: {
            leadId: params.leadId,
            score: params.score,
            engagementScore: params.engagementScore,
            daysInPipeline: params.daysInPipeline,
            lastInteractionDays: params.lastInteractionDays ?? void 0,
            similarity: params.similarity
          }
        }
      );
      return response.data;
    });
  }
};
var mlService = new MLService();

// src/services/lead-score.service.ts
var MODEL_KEY = "ml-fastapi-heuristic-v1";
async function calculateLeadScore(leadId, requestId) {
  const insights = await buildLeadInsights(leadId);
  const tenantId = insights.tenantId;
  if (!tenantId) {
    throw new Error("Lead insights missing tenant context for scoring.");
  }
  const scoreResponse = await mlService.scoreLead({ ...insights, requestId, tenantId });
  const previousScore = insights.metadata.latestScore ?? null;
  const scoreDelta = previousScore !== null ? scoreResponse.score - previousScore : null;
  const { leadScore, lead } = await prisma.$transaction(async (tx) => {
    const leadScore2 = await tx.leadScore.create({
      data: {
        leadId,
        tenantId,
        modelKey: MODEL_KEY,
        score: scoreResponse.score,
        scoreDelta,
        reason: scoreResponse.factors[0]?.reason?.slice(0, 255) ?? null,
        metadata: toInputJson(scoreResponse)
      }
    });
    const lead2 = await tx.lead.update({
      where: { id: leadId },
      data: { score: scoreResponse.score },
      select: { id: true, tenantId: true, score: true, status: true }
    });
    return { leadScore: leadScore2, lead: lead2 };
  });
  emitTenantEvent(lead.tenantId, "lead:scoreUpdated", {
    leadId,
    score: scoreResponse.score,
    scoreDelta,
    modelKey: MODEL_KEY,
    confidence: scoreResponse.confidence,
    factors: scoreResponse.factors,
    calculatedAt: leadScore.createdAt
  });
  return {
    insights: {
      ...insights,
      metadata: { ...insights.metadata, latestScore: scoreResponse.score },
      latestScore: {
        score: scoreResponse.score,
        createdAt: leadScore.createdAt.toISOString()
      }
    },
    score: scoreResponse,
    requestId: scoreResponse.requestId,
    leadScoreRecord: {
      id: leadScore.id,
      leadId: leadScore.leadId,
      score: leadScore.score,
      scoreDelta: leadScore.scoreDelta,
      modelKey: leadScore.modelKey,
      createdAt: leadScore.createdAt
    }
  };
}
async function fetchCloseProbability(leadId, requestId) {
  const insights = await buildLeadInsights(leadId);
  const scoreReference = insights.latestScore?.score ?? insights.metadata.latestScore ?? null;
  const response = await mlService.closeProbability({
    leadId,
    score: scoreReference ?? void 0,
    engagementScore: insights.derivedEngagementScore,
    daysInPipeline: insights.timetable.daysInPipeline,
    lastInteractionDays: insights.timetable.lastInteractionDays,
    similarity: insights.similarity.score,
    requestId,
    tenantId: insights.tenantId
  });
  return {
    probability: response.probability,
    horizonDays: response.horizonDays,
    requestId: response.requestId,
    insights
  };
}

// src/routes/leads.ts
var allowedRoles = ["ADMIN", "BDC", "SALES"];
var leadRouter = Router();
leadRouter.get("/", requireRole(...allowedRoles), async (req, res, next) => {
  try {
    if (!isTenantScoped()) {
      return res.status(500).json({ message: "Tenant context not established" });
    }
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        assignedTo: true,
        customer: true,
        scores: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
    res.json({ data: leads });
  } catch (error) {
    next(error);
  }
});
leadRouter.post("/:id/score/calculate", requireRole(...allowedRoles), async (req, res, next) => {
  const requestId = resolveRequestId(req);
  res.setHeader("X-Request-Id", requestId);
  try {
    const result = await calculateLeadScore(req.params.id, requestId);
    res.setHeader("X-Request-Id", result.requestId);
    res.json({
      data: {
        score: result.score,
        leadScore: result.leadScoreRecord,
        insights: {
          metadata: result.insights.metadata,
          activities: result.insights.activities,
          timetable: result.insights.timetable,
          budgetSignals: result.insights.budgetSignals,
          similarity: result.insights.similarity,
          derivedEngagementScore: result.insights.derivedEngagementScore
        }
      },
      requestId: result.requestId
    });
  } catch (error) {
    if (error instanceof LeadNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

// src/routes/webhooks.routes.ts
import { Router as Router2, json, urlencoded } from "express";

// src/services/webhook.service.ts
import {
  ActivityStatus as ActivityStatus4,
  CommunicationDirection as CommunicationDirection3,
  CommunicationStatus as CommunicationStatus3,
  CommunicationType as CommunicationType4,
  LeadPriority as LeadPriority3,
  LeadSource as LeadSource3,
  LeadStatus as LeadStatus3
} from "@prisma/client";

// src/services/inbox.service.ts
import { CommunicationStatus, CommunicationType as CommunicationType2 } from "@prisma/client";
var inboxInclude = {
  lead: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  activity: { select: { id: true, type: true, status: true, outcome: true, opened: true, clicked: true } },
  user: { select: { id: true, firstName: true, lastName: true, email: true } }
};
function normalizeFilter(value) {
  if (!value) {
    return void 0;
  }
  return Array.isArray(value) ? value : [value];
}
function buildInboxFilters(query) {
  const where = {};
  const types = normalizeFilter(query.type);
  if (types && types.length > 0) {
    where.type = { in: types };
  }
  const statuses = normalizeFilter(query.status);
  if (statuses && statuses.length > 0) {
    where.status = { in: statuses };
  }
  if (query.leadId) {
    where.leadId = query.leadId;
  }
  if (query.customerId) {
    where.customerId = query.customerId;
  }
  if (query.search) {
    where.OR = [
      { subject: { contains: query.search, mode: "insensitive" } },
      { body: { contains: query.search, mode: "insensitive" } },
      { to: { contains: query.search, mode: "insensitive" } },
      { from: { contains: query.search, mode: "insensitive" } }
    ];
  }
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) {
      where.createdAt.gte = query.from;
    }
    if (query.to) {
      where.createdAt.lte = query.to;
    }
  }
  return where;
}
async function getInbox(query) {
  const where = buildInboxFilters(query);
  const skip = (query.page - 1) * query.pageSize;
  const take = query.pageSize;
  const [items, total] = await prisma.$transaction([
    prisma.communication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: inboxInclude
    }),
    prisma.communication.count({ where })
  ]);
  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    pages: Math.max(1, Math.ceil(total / query.pageSize))
  };
}
async function getCallLogs(query) {
  const inboxQuery = {
    ...query,
    type: CommunicationType2.CALL,
    status: void 0,
    search: void 0
  };
  return getInbox({ ...inboxQuery, page: query.page, pageSize: query.pageSize });
}
function mapTwilioStatus(status2) {
  switch ((status2 ?? "").toLowerCase()) {
    case "queued":
    case "accepted":
      return CommunicationStatus.QUEUED;
    case "sending":
    case "in-progress":
    case "ringing":
      return CommunicationStatus.SENT;
    case "sent":
    case "delivered":
    case "completed":
      return CommunicationStatus.DELIVERED;
    case "failed":
    case "undelivered":
    case "busy":
    case "no-answer":
      return CommunicationStatus.FAILED;
    case "canceled":
    case "cancelled":
      return CommunicationStatus.CANCELLED;
    default:
      return void 0;
  }
}
function mapSendGridStatus(event) {
  switch (event) {
    case "processed":
    case "delivered":
      return CommunicationStatus.DELIVERED;
    case "open":
    case "click":
      return CommunicationStatus.DELIVERED;
    case "bounce":
    case "dropped":
    case "spamreport":
    case "unsubscribe":
      return CommunicationStatus.FAILED;
    default:
      return void 0;
  }
}

// src/services/twilio.service.ts
import twilio from "twilio";
var cachedClient;
function getClient() {
  if (!cachedClient) {
    cachedClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }
  return cachedClient;
}
async function initiateVoiceCall(options) {
  const client3 = getClient();
  const fromNumber = options.from ?? env.TWILIO_CALLER_ID;
  const statusCallback = options.statusCallback;
  const twimlUrl = options.twimlUrl ?? `${env.API_URL.replace(/\/$/, "")}/api/communications/twilio/voice`;
  const call = await client3.calls.create({
    to: options.to,
    from: fromNumber,
    url: twimlUrl,
    statusCallback,
    statusCallbackMethod: statusCallback ? "POST" : void 0
  });
  return call;
}
async function sendSms(options) {
  const client3 = getClient();
  const statusCallback = options.statusCallback;
  const message = await client3.messages.create({
    to: options.to,
    from: options.from,
    body: options.body,
    messagingServiceSid: options.from ? void 0 : env.TWILIO_MESSAGING_SERVICE_SID,
    statusCallback,
    mediaUrl: options.mediaUrls
  });
  return message;
}
function normalizePhoneNumber(value) {
  return value.replace(/[^+\d]/g, "");
}

// src/services/activity.service.ts
import { ActivityStatus, ActivityType as ActivityType2, Prisma as Prisma4 } from "@prisma/client";
var defaultActivityInclude = {
  lead: {
    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
  },
  customer: {
    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
  },
  user: {
    select: { id: true, firstName: true, lastName: true, email: true }
  },
  communications: {
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, status: true, providerId: true, createdAt: true }
  }
};
function requireTenantId() {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error("Tenant context is required for activity operations");
  }
  return tenantId;
}
function applyOptionalRelation(value) {
  if (!value) {
    return void 0;
  }
  return { connect: { id: value } };
}
async function safeTouchLead(leadId, data) {
  if (!leadId) {
    return;
  }
  try {
    await prisma.lead.update({ where: { id: leadId }, data });
  } catch (error) {
    if (error instanceof Prisma4.PrismaClientKnownRequestError && error.code === "P2025") {
      return;
    }
    throw error;
  }
}
function buildActivityFilters(query) {
  const filters = {};
  if (query.type) {
    filters.type = query.type;
  }
  if (query.leadId) {
    filters.leadId = query.leadId;
  }
  if (query.customerId) {
    filters.customerId = query.customerId;
  }
  if (query.userId) {
    filters.userId = query.userId;
  }
  if (query.from || query.to) {
    filters.createdAt = {};
    if (query.from) {
      filters.createdAt.gte = query.from;
    }
    if (query.to) {
      filters.createdAt.lte = query.to;
    }
  }
  return filters;
}
async function listActivities(query) {
  const where = buildActivityFilters(query);
  const skip = (query.page - 1) * query.pageSize;
  const take = query.pageSize;
  const [items, total] = await prisma.$transaction([
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: defaultActivityInclude
    }),
    prisma.activity.count({ where })
  ]);
  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    pages: Math.max(1, Math.ceil(total / query.pageSize))
  };
}
async function getActivity(id) {
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: defaultActivityInclude
  });
  if (!activity) {
    throw Object.assign(new Error("Activity not found"), { status: 404 });
  }
  return activity;
}
async function createActivity(input) {
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation(input.leadId),
      customer: applyOptionalRelation(input.customerId),
      user: applyOptionalRelation(input.userId),
      type: input.type,
      status: input.status ?? ActivityStatus.PENDING,
      subject: input.subject ?? null,
      description: input.description ?? null,
      outcome: input.outcome ?? null,
      dueAt: input.dueAt ?? null,
      startedAt: input.startedAt ?? null,
      completedAt: input.completedAt ?? null
    },
    include: defaultActivityInclude
  });
  await safeTouchLead(activity.leadId, {
    lastActivityAt: /* @__PURE__ */ new Date()
  });
  return activity;
}
async function updateActivity(id, input) {
  const data = {};
  if (input.leadId) {
    data.lead = { connect: { id: input.leadId } };
  }
  if (input.customerId) {
    data.customer = { connect: { id: input.customerId } };
  }
  if (input.userId) {
    data.user = { connect: { id: input.userId } };
  }
  if (input.type) {
    data.type = input.type;
  }
  if (input.status) {
    data.status = input.status;
  }
  if (input.subject !== void 0) {
    data.subject = input.subject ?? null;
  }
  if (input.description !== void 0) {
    data.description = input.description ?? null;
  }
  if (input.outcome !== void 0) {
    data.outcome = input.outcome ?? null;
  }
  if (input.dueAt !== void 0) {
    data.dueAt = input.dueAt ?? null;
  }
  if (input.startedAt !== void 0) {
    data.startedAt = input.startedAt ?? null;
  }
  if (input.completedAt !== void 0) {
    data.completedAt = input.completedAt ?? null;
  }
  const activity = await prisma.activity.update({
    where: { id },
    data,
    include: defaultActivityInclude
  });
  await safeTouchLead(activity.leadId, {
    lastActivityAt: /* @__PURE__ */ new Date()
  });
  return activity;
}
async function logCallActivity(input) {
  const now = /* @__PURE__ */ new Date();
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation(input.leadId),
      customer: applyOptionalRelation(input.customerId),
      user: applyOptionalRelation(input.userId),
      type: ActivityType2.CALL,
      status: input.completedAt ? ActivityStatus.COMPLETED : ActivityStatus.PENDING,
      subject: input.subject ?? "Call logged",
      description: input.notes ?? null,
      outcome: input.outcome ?? null,
      startedAt: input.startedAt ?? now,
      completedAt: input.completedAt ?? null,
      metadata: {
        callSid: input.callSid,
        recordingUrl: input.recordingUrl,
        durationSeconds: input.durationSeconds
      }
    },
    include: defaultActivityInclude
  });
  await safeTouchLead(activity.leadId, {
    lastActivityAt: now,
    lastCommunicationAt: now
  });
  return activity;
}
async function logEmailActivity(input) {
  const now = /* @__PURE__ */ new Date();
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation(input.leadId),
      customer: applyOptionalRelation(input.customerId),
      user: applyOptionalRelation(input.userId),
      type: ActivityType2.EMAIL,
      status: ActivityStatus.COMPLETED,
      subject: input.subject ?? null,
      description: input.body ?? null,
      completedAt: now,
      metadata: {
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        providerId: input.providerId
      }
    },
    include: defaultActivityInclude
  });
  await safeTouchLead(activity.leadId, {
    lastActivityAt: now,
    lastCommunicationAt: now
  });
  return activity;
}
async function logSmsActivity(input) {
  const now = /* @__PURE__ */ new Date();
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation(input.leadId),
      customer: applyOptionalRelation(input.customerId),
      user: applyOptionalRelation(input.userId),
      type: ActivityType2.SMS,
      status: ActivityStatus.COMPLETED,
      description: input.body ?? null,
      completedAt: now,
      metadata: {
        to: input.to,
        from: input.from,
        providerId: input.providerId
      }
    },
    include: defaultActivityInclude
  });
  await safeTouchLead(activity.leadId, {
    lastActivityAt: now,
    lastCommunicationAt: now
  });
  return activity;
}
async function logNoteActivity(input) {
  const now = /* @__PURE__ */ new Date();
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation(input.leadId),
      customer: applyOptionalRelation(input.customerId),
      user: applyOptionalRelation(input.userId),
      type: ActivityType2.NOTE,
      status: ActivityStatus.COMPLETED,
      subject: input.subject ?? null,
      description: input.body ?? null,
      completedAt: now
    },
    include: defaultActivityInclude
  });
  await safeTouchLead(activity.leadId, {
    lastActivityAt: now
  });
  return activity;
}

// src/services/lead-routing.service.ts
init_socket();
import {
  LeadPriority as LeadPriority2,
  LeadSource as LeadSource2,
  LeadStatus as LeadStatus2,
  UserRole,
  UserStatus
} from "@prisma/client";
import { subDays as subDays2 } from "date-fns";
import { z as z3 } from "zod";

// src/services/automation.service.ts
import {
  ActivityStatus as ActivityStatus3,
  ActivityType as ActivityType4,
  AppointmentStatus as AppointmentStatus2,
  AppointmentType,
  AutomationExecutionStatus,
  LeadPriority,
  LeadSource,
  LeadStatus,
  NotificationType
} from "@prisma/client";
import { z as z2 } from "zod";

// src/services/communication.service.ts
import {
  ActivityStatus as ActivityStatus2,
  ActivityType as ActivityType3,
  CommunicationDirection as CommunicationDirection2,
  CommunicationStatus as CommunicationStatus2,
  CommunicationType as CommunicationType3,
  Prisma as Prisma5
} from "@prisma/client";

// src/services/sendgrid.service.ts
import sgMail from "@sendgrid/mail";
var initialized = false;
function ensureInitialized() {
  if (!initialized) {
    sgMail.setApiKey(env.SENDGRID_API_KEY);
    initialized = true;
  }
}
function applyMergeFields(content, data) {
  if (!content || !data) {
    return content;
  }
  return content.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key) => {
    const value = data[key];
    return value === void 0 || value === null ? "" : String(value);
  });
}
async function sendEmail(options) {
  ensureInitialized();
  const payload = {
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    from: env.SENDGRID_FROM,
    subject: options.subject,
    html: applyMergeFields(options.html, options.templateData),
    text: applyMergeFields(options.text, options.templateData),
    attachments: options.attachments,
    mailSettings: {
      sandboxMode: {
        enable: false
      }
    }
  };
  if (options.templateId) {
    payload.templateId = options.templateId;
    payload.dynamicTemplateData = options.templateData;
  }
  const [response] = await sgMail.send(payload);
  const messageId = response.headers["x-message-id"] ?? response.headers["X-Message-Id"];
  return {
    statusCode: response.statusCode,
    messageId: Array.isArray(messageId) ? messageId[0] : messageId,
    headers: response.headers
  };
}

// src/services/communication.service.ts
function requireTenantId2() {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error("Tenant context is required for communications");
  }
  return tenantId;
}
function optionalRelation(value) {
  if (!value) {
    return void 0;
  }
  return { connect: { id: value } };
}
function toJson(value) {
  if (!value) {
    return void 0;
  }
  return value;
}
function mergeMetadata(base, extra) {
  return { ...base ?? {}, ...extra };
}
async function fetchLead(leadId) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, smsOptOut: true, emailOptOut: true, callOptOut: true }
  });
  if (!lead) {
    throw Object.assign(new Error("Lead not found"), { status: 404 });
  }
  return lead;
}
function assertConsent(lead, type) {
  if (type === CommunicationType3.SMS && lead.smsOptOut) {
    throw Object.assign(new Error("Lead has opted out of SMS communications"), { status: 409 });
  }
  if (type === CommunicationType3.EMAIL && lead.emailOptOut) {
    throw Object.assign(new Error("Lead has opted out of email communications"), { status: 409 });
  }
  if (type === CommunicationType3.CALL && lead.callOptOut) {
    throw Object.assign(new Error("Lead has opted out of phone communications"), { status: 409 });
  }
}
async function touchLeadCommunication(leadId) {
  if (!leadId) {
    return;
  }
  try {
    await prisma.lead.update({ where: { id: leadId }, data: { lastCommunicationAt: /* @__PURE__ */ new Date(), lastActivityAt: /* @__PURE__ */ new Date() } });
  } catch (error) {
    if (error instanceof Prisma5.PrismaClientKnownRequestError && error.code === "P2025") {
      return;
    }
    throw error;
  }
}
function deriveActivityStatus(status2) {
  switch (status2) {
    case CommunicationStatus2.DELIVERED:
      return ActivityStatus2.COMPLETED;
    case CommunicationStatus2.FAILED:
    case CommunicationStatus2.CANCELLED:
      return ActivityStatus2.CANCELED;
    default:
      return ActivityStatus2.PENDING;
  }
}
async function linkActivity(communicationId, tenantId, payload) {
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: optionalRelation(payload.leadId),
      customer: optionalRelation(payload.customerId),
      user: optionalRelation(payload.userId),
      type: payload.type,
      status: deriveActivityStatus(payload.status),
      subject: payload.subject,
      description: payload.description,
      outcome: payload.outcome,
      metadata: toJson(payload.metadata)
    }
  });
  await prisma.communication.update({
    where: { id: communicationId },
    data: { activityId: activity.id }
  });
  await touchLeadCommunication(activity.leadId);
  return activity;
}
async function initiateCall(payload) {
  const tenantId = requireTenantId2();
  let lead;
  if (payload.leadId) {
    lead = await fetchLead(payload.leadId);
    assertConsent(lead, CommunicationType3.CALL);
  }
  const fromNumber = payload.from ? normalizePhoneNumber(payload.from) : env.TWILIO_CALLER_ID;
  const communication = await prisma.communication.create({
    data: {
      tenant: { connect: { id: tenantId } },
      type: CommunicationType3.CALL,
      direction: CommunicationDirection2.OUTBOUND,
      to: normalizePhoneNumber(payload.to),
      from: fromNumber,
      metadata: toJson(payload.metadata),
      status: CommunicationStatus2.QUEUED,
      lead: optionalRelation(payload.leadId),
      customer: optionalRelation(payload.customerId),
      user: optionalRelation(payload.userId)
    }
  });
  try {
    const callbackBase = env.API_URL.replace(/\/$/, "");
    const statusCallback = `${callbackBase}/api/communications/twilio/webhook?tenantId=${encodeURIComponent(communication.tenantId)}`;
    const call = await initiateVoiceCall({
      to: communication.to,
      from: fromNumber,
      twimlUrl: payload.twimlUrl,
      statusCallback,
      metadata: payload.metadata
    });
    const status2 = mapTwilioStatus(call.status) ?? CommunicationStatus2.SENT;
    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        providerId: call.sid,
        status: status2,
        metadata: mergeMetadata(communication.metadata, {
          callSid: call.sid,
          direction: call.direction
        })
      }
    });
    const activity = await linkActivity(updated.id, tenantId, {
      type: ActivityType3.CALL,
      subject: "Outbound call initiated",
      description: payload.metadata?.notes,
      outcome: call.status,
      leadId: updated.leadId,
      customerId: updated.customerId,
      userId: updated.userId,
      metadata: {
        provider: "twilio",
        callSid: call.sid
      },
      status: status2
    });
    return { communication: updated, activity, provider: call };
  } catch (error) {
    await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: CommunicationStatus2.FAILED,
        metadata: mergeMetadata(communication.metadata, {
          error: error instanceof Error ? error.message : String(error)
        })
      }
    });
    throw error;
  }
}
async function sendSmsMessage(payload) {
  const tenantId = requireTenantId2();
  let lead;
  if (payload.leadId) {
    lead = await fetchLead(payload.leadId);
    assertConsent(lead, CommunicationType3.SMS);
  }
  const fromNumber = payload.from ? normalizePhoneNumber(payload.from) : env.TWILIO_CALLER_ID;
  const communication = await prisma.communication.create({
    data: {
      tenant: { connect: { id: tenantId } },
      type: CommunicationType3.SMS,
      direction: CommunicationDirection2.OUTBOUND,
      to: normalizePhoneNumber(payload.to),
      from: fromNumber,
      body: payload.body,
      metadata: toJson(payload.metadata),
      status: CommunicationStatus2.QUEUED,
      lead: optionalRelation(payload.leadId),
      customer: optionalRelation(payload.customerId),
      user: optionalRelation(payload.userId)
    }
  });
  try {
    const callbackBase = env.API_URL.replace(/\/$/, "");
    const statusCallback = `${callbackBase}/api/communications/twilio/webhook?tenantId=${encodeURIComponent(communication.tenantId)}`;
    const message = await sendSms({
      to: communication.to,
      from: fromNumber,
      body: payload.body,
      mediaUrls: payload.mediaUrls,
      statusCallback
    });
    const status2 = mapTwilioStatus(message.status) ?? CommunicationStatus2.SENT;
    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        providerId: message.sid,
        status: status2,
        metadata: mergeMetadata(communication.metadata, {
          messageSid: message.sid,
          segments: message.numSegments
        })
      }
    });
    const activity = await linkActivity(updated.id, tenantId, {
      type: ActivityType3.SMS,
      description: payload.body,
      outcome: message.status,
      leadId: updated.leadId,
      customerId: updated.customerId,
      userId: updated.userId,
      metadata: {
        provider: "twilio",
        messageSid: message.sid
      },
      status: status2
    });
    return { communication: updated, activity, provider: message };
  } catch (error) {
    await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: CommunicationStatus2.FAILED,
        metadata: mergeMetadata(communication.metadata, {
          error: error instanceof Error ? error.message : String(error)
        })
      }
    });
    throw error;
  }
}
async function sendEmailMessage(payload) {
  const tenantId = requireTenantId2();
  let lead;
  if (payload.leadId) {
    lead = await fetchLead(payload.leadId);
    assertConsent(lead, CommunicationType3.EMAIL);
  }
  const communication = await prisma.communication.create({
    data: {
      tenant: { connect: { id: tenantId } },
      type: CommunicationType3.EMAIL,
      direction: CommunicationDirection2.OUTBOUND,
      to: payload.to.join(","),
      from: env.SENDGRID_FROM,
      subject: payload.subject ?? null,
      body: payload.html ?? payload.text ?? null,
      metadata: toJson({
        ...payload.metadata,
        to: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        attachments: payload.attachments?.map(({ filename }) => filename),
        templateId: payload.templateId
      }),
      status: CommunicationStatus2.QUEUED,
      lead: optionalRelation(payload.leadId),
      customer: optionalRelation(payload.customerId),
      user: optionalRelation(payload.userId)
    }
  });
  try {
    const response = await sendEmail({
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      templateId: payload.templateId,
      templateData: payload.templateData,
      attachments: payload.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        type: attachment.type,
        disposition: attachment.disposition
      }))
    });
    const status2 = response.statusCode >= 200 && response.statusCode < 300 ? CommunicationStatus2.SENT : CommunicationStatus2.FAILED;
    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        providerId: response.messageId ?? void 0,
        status: status2,
        metadata: mergeMetadata(communication.metadata, {
          messageId: response.messageId,
          statusCode: response.statusCode
        })
      }
    });
    const activity = await linkActivity(updated.id, tenantId, {
      type: ActivityType3.EMAIL,
      subject: payload.subject,
      description: payload.html ?? payload.text ?? void 0,
      outcome: status2 === CommunicationStatus2.SENT ? "Queued" : "Failed to send",
      leadId: updated.leadId,
      customerId: updated.customerId,
      userId: updated.userId,
      metadata: {
        provider: "sendgrid",
        messageId: response.messageId
      },
      status: status2
    });
    return { communication: updated, activity, provider: response };
  } catch (error) {
    await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: CommunicationStatus2.FAILED,
        metadata: mergeMetadata(communication.metadata, {
          error: error instanceof Error ? error.message : String(error)
        })
      }
    });
    throw error;
  }
}

// src/services/automation.service.ts
var automationTriggerTypeSchema = z2.enum([
  "NEW_LEAD",
  "LEAD_SCORE_DELTA",
  "NEGATIVE_SENTIMENT",
  "APPOINTMENT_CREATED",
  "APPOINTMENT_COMPLETED",
  "APPOINTMENT_NO_SHOW",
  "BIRTHDAY",
  "ANNIVERSARY",
  "SERVICE_DUE"
]);
var sentimentSchema = z2.enum(["NEGATIVE", "NEUTRAL", "POSITIVE"]);
var automationTriggerSchema = z2.object({
  type: automationTriggerTypeSchema,
  filters: z2.object({
    sources: z2.array(z2.nativeEnum(LeadSource)).optional(),
    minScore: z2.number().optional(),
    minScoreDelta: z2.number().optional(),
    sentiments: z2.array(sentimentSchema).optional(),
    appointmentStatuses: z2.array(z2.nativeEnum(AppointmentStatus2)).optional(),
    appointmentTypes: z2.array(z2.nativeEnum(AppointmentType)).optional(),
    leadStatuses: z2.array(z2.nativeEnum(LeadStatus)).optional(),
    tags: z2.array(z2.string().trim().min(1)).optional()
  }).default({})
});
var recipientTargetSchema = z2.enum(["LEAD", "CUSTOMER", "ASSIGNEE", "CUSTOM"]);
var userTargetSchema = z2.enum(["ASSIGNEE", "CUSTOM"]);
var sendSmsActionSchema = z2.object({
  type: z2.literal("SEND_SMS"),
  params: z2.object({
    target: recipientTargetSchema.default("LEAD"),
    message: z2.string().trim().min(1),
    customPhone: z2.string().trim().min(5).optional()
  })
});
var sendEmailActionSchema = z2.object({
  type: z2.literal("SEND_EMAIL"),
  params: z2.object({
    target: recipientTargetSchema.default("LEAD"),
    subject: z2.string().trim().min(1),
    body: z2.string().trim().min(1),
    customEmail: z2.string().email().optional()
  })
});
var createTaskActionSchema = z2.object({
  type: z2.literal("CREATE_TASK"),
  params: z2.object({
    subject: z2.string().trim().min(1),
    description: z2.string().trim().max(4e3).optional(),
    dueInMinutes: z2.number().int().min(0).default(0),
    assignTo: userTargetSchema.default("ASSIGNEE"),
    customUserId: z2.string().trim().min(1).optional()
  })
});
var scheduleFollowUpActionSchema = z2.object({
  type: z2.literal("SCHEDULE_FOLLOW_UP"),
  params: z2.object({
    dueInMinutes: z2.number().int().min(1),
    subject: z2.string().trim().min(1).default("Automation follow-up"),
    description: z2.string().trim().max(4e3).optional()
  })
});
var updateLeadActionSchema = z2.object({
  type: z2.literal("UPDATE_LEAD"),
  params: z2.object({
    status: z2.nativeEnum(LeadStatus).optional(),
    priority: z2.nativeEnum(LeadPriority).optional()
  })
});
var tagLeadActionSchema = z2.object({
  type: z2.literal("TAG_LEAD"),
  params: z2.object({
    tags: z2.array(z2.string().trim().min(1)).nonempty()
  })
});
var notifyUserActionSchema = z2.object({
  type: z2.literal("NOTIFY_USER"),
  params: z2.object({
    target: userTargetSchema.default("ASSIGNEE"),
    customUserId: z2.string().trim().min(1).optional(),
    title: z2.string().trim().min(1),
    message: z2.string().trim().min(1),
    url: z2.string().url().optional()
  })
});
var startNurtureActionSchema = z2.object({
  type: z2.literal("START_NURTURE_SEQUENCE"),
  params: z2.object({
    sequenceId: z2.string().trim().min(1)
  })
});
var automationActionSchema = z2.discriminatedUnion("type", [
  sendSmsActionSchema,
  sendEmailActionSchema,
  createTaskActionSchema,
  scheduleFollowUpActionSchema,
  updateLeadActionSchema,
  tagLeadActionSchema,
  notifyUserActionSchema,
  startNurtureActionSchema
]);
var automationDefinitionSchema = z2.object({
  name: z2.string().trim().min(1),
  trigger: automationTriggerSchema,
  actions: z2.array(automationActionSchema).nonempty(),
  isActive: z2.boolean().default(true)
});
var manualExecutionSchema = z2.object({
  automationId: z2.string().optional(),
  trigger: automationTriggerTypeSchema,
  context: z2.object({
    leadId: z2.string().optional(),
    customerId: z2.string().optional(),
    appointmentId: z2.string().optional(),
    score: z2.number().optional(),
    scoreDelta: z2.number().optional(),
    sentiment: sentimentSchema.optional(),
    occurredAt: z2.coerce.date().optional(),
    metadata: z2.record(z2.unknown()).optional()
  }).default({}),
  force: z2.boolean().optional()
});
var automationTriggerContextSchema = manualExecutionSchema.shape.context;
function ensureTenantId() {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error("Tenant context is required for automations");
  }
  return tenantId;
}
function cloneValue(value) {
  const globalClone = globalThis.structuredClone;
  if (typeof globalClone === "function") {
    return globalClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}
function toJson2(value) {
  return cloneValue(value);
}
var automationDebounceWindowMs = 6e4;
var automationDebounce = /* @__PURE__ */ new Map();
function getDebounceKey(tenantId, automationId, context) {
  return [tenantId, automationId, context.leadId ?? context.customerId ?? "none", context.trigger].join(":");
}
function shouldDebounce(key, force) {
  if (force) {
    return false;
  }
  const last = automationDebounce.get(key);
  if (!last) {
    return false;
  }
  return Date.now() - last < automationDebounceWindowMs;
}
function recordDebounce(key) {
  automationDebounce.set(key, Date.now());
}
function renderTemplate(template, context) {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    const value = context[key.trim()];
    if (value === void 0 || value === null) {
      return "";
    }
    return String(value);
  });
}
function buildTemplateContext(runtime) {
  const lead = runtime.lead;
  const customer = runtime.customer ?? lead?.customer ?? null;
  const assigned = lead?.assignedTo ?? runtime.appointment?.assignedTo ?? null;
  return {
    "lead.firstName": lead?.firstName ?? null,
    "lead.lastName": lead?.lastName ?? null,
    "lead.email": lead?.email ?? null,
    "lead.phone": lead?.phone ?? null,
    "lead.fullName": lead ? `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() || null : null,
    "customer.firstName": customer?.firstName ?? null,
    "customer.lastName": customer?.lastName ?? null,
    "customer.email": customer?.email ?? null,
    "customer.phone": customer?.phone ?? customer?.mobile ?? null,
    "assigned.firstName": assigned?.firstName ?? null,
    "assigned.lastName": assigned?.lastName ?? null,
    "assigned.email": assigned?.email ?? null,
    trigger: runtime.trigger
  };
}
function automationToRecord(raw) {
  return {
    id: raw.id,
    name: raw.name,
    trigger: automationTriggerSchema.parse(raw.trigger),
    actions: z2.array(automationActionSchema).parse(raw.actions),
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}
async function loadLeadContext(leadId) {
  return prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          mobile: true,
          dateOfBirth: true,
          addressStreet: true,
          addressCity: true,
          addressState: true,
          addressZip: true,
          tags: true
        }
      },
      assignedTo: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true }
      }
    }
  });
}
async function loadCustomerContext(customerId) {
  return prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      mobile: true,
      dateOfBirth: true,
      tags: true
    }
  });
}
async function loadAppointmentContext(appointmentId) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      assignedTo: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true }
      },
      lead: { select: { id: true } },
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true }
      }
    }
  });
}
async function buildRuntimeContext(trigger, input) {
  const occurredAt = input.occurredAt ?? /* @__PURE__ */ new Date();
  let lead;
  if (input.leadId) {
    lead = await loadLeadContext(input.leadId);
  }
  let customer;
  if (input.customerId) {
    customer = await loadCustomerContext(input.customerId);
  } else if (lead?.customer?.id) {
    customer = await loadCustomerContext(lead.customer.id);
  }
  let appointment;
  if (input.appointmentId) {
    appointment = await loadAppointmentContext(input.appointmentId);
  }
  return {
    trigger,
    lead: lead ?? void 0,
    customer: customer ?? void 0,
    appointment: appointment ?? void 0,
    score: input.score ?? lead?.score ?? null,
    scoreDelta: input.scoreDelta ?? null,
    sentiment: input.sentiment,
    occurredAt,
    metadata: input.metadata ?? {}
  };
}
function matchesTriggerFilters(definition, runtime) {
  if (definition.type !== runtime.trigger) {
    return false;
  }
  const filters = definition.filters;
  const lead = runtime.lead;
  const customer = runtime.customer ?? lead?.customer ?? null;
  const appointment = runtime.appointment ?? null;
  if (filters.sources && lead?.source && !filters.sources.includes(lead.source)) {
    return false;
  }
  if (filters.leadStatuses && lead && !filters.leadStatuses.includes(lead.status)) {
    return false;
  }
  if (filters.tags && filters.tags.length > 0) {
    const leadTags = new Set(lead?.tags ?? []);
    const customerTagList = customer && typeof customer.tags !== "undefined" ? customer.tags ?? [] : [];
    const customerTags = new Set(customerTagList);
    const hasTags = filters.tags.every((tag) => leadTags.has(tag) || customerTags.has(tag));
    if (!hasTags) {
      return false;
    }
  }
  if (filters.minScore !== void 0) {
    const score = runtime.score ?? lead?.score ?? null;
    if ((score ?? -Infinity) < filters.minScore) {
      return false;
    }
  }
  if (filters.minScoreDelta !== void 0 && Math.abs(runtime.scoreDelta ?? 0) < filters.minScoreDelta) {
    return false;
  }
  if (filters.sentiments && runtime.sentiment && !filters.sentiments.includes(runtime.sentiment)) {
    return false;
  }
  if (filters.appointmentStatuses && appointment && !filters.appointmentStatuses.includes(appointment.status)) {
    return false;
  }
  if (filters.appointmentTypes && appointment && !filters.appointmentTypes.includes(appointment.type)) {
    return false;
  }
  switch (definition.type) {
    case "LEAD_SCORE_DELTA":
      if (runtime.scoreDelta === null || runtime.scoreDelta === void 0) {
        return false;
      }
      break;
    case "NEGATIVE_SENTIMENT":
      if (runtime.sentiment !== "NEGATIVE") {
        return false;
      }
      break;
    case "APPOINTMENT_CREATED":
    case "APPOINTMENT_COMPLETED":
    case "APPOINTMENT_NO_SHOW":
      if (!appointment) {
        return false;
      }
      break;
    case "BIRTHDAY":
    case "ANNIVERSARY":
    case "SERVICE_DUE":
      if (!customer && !lead) {
        return false;
      }
      break;
    default:
      break;
  }
  return true;
}
async function executeSendSms(action, runtime) {
  const lead = runtime.lead;
  const customer = runtime.customer ?? lead?.customer ?? null;
  const assigned = lead?.assignedTo ?? runtime.appointment?.assignedTo ?? null;
  let phone = null;
  switch (action.params.target) {
    case "LEAD":
      phone = lead?.phone ?? customer?.mobile ?? customer?.phone ?? null;
      break;
    case "CUSTOMER":
      phone = customer?.mobile ?? customer?.phone ?? null;
      break;
    case "ASSIGNEE":
      phone = assigned?.phone ?? null;
      break;
    case "CUSTOM":
      phone = action.params.customPhone ?? null;
      break;
    default:
      phone = null;
      break;
  }
  if (!lead?.id) {
    return { type: action.type, status: "FAILED", error: "Lead context is required to send SMS" };
  }
  if (!phone) {
    return { type: action.type, status: "FAILED", error: "No phone number available for SMS delivery" };
  }
  const templateContext = buildTemplateContext(runtime);
  const body = renderTemplate(action.params.message, templateContext);
  const response = await sendSmsMessage({
    to: phone,
    body,
    leadId: lead.id,
    metadata: { automation: true }
  });
  return {
    type: action.type,
    status: "SUCCESS",
    detail: `SMS queued with provider id ${response.communication.providerId ?? "unknown"}`
  };
}
async function executeSendEmail(action, runtime) {
  const lead = runtime.lead;
  const customer = runtime.customer ?? lead?.customer ?? null;
  const assigned = lead?.assignedTo ?? runtime.appointment?.assignedTo ?? null;
  let email = null;
  switch (action.params.target) {
    case "LEAD":
      email = lead?.email ?? customer?.email ?? null;
      break;
    case "CUSTOMER":
      email = customer?.email ?? null;
      break;
    case "ASSIGNEE":
      email = assigned?.email ?? null;
      break;
    case "CUSTOM":
      email = action.params.customEmail ?? null;
      break;
    default:
      email = null;
      break;
  }
  if (!lead?.id) {
    return { type: action.type, status: "FAILED", error: "Lead context is required to send email" };
  }
  if (!email) {
    return { type: action.type, status: "FAILED", error: "No email address available for email delivery" };
  }
  const templateContext = buildTemplateContext(runtime);
  const subject = renderTemplate(action.params.subject, templateContext);
  const body = renderTemplate(action.params.body, templateContext);
  await sendEmailMessage({
    to: [email],
    subject,
    html: body,
    leadId: lead.id,
    metadata: { automation: true }
  });
  return {
    type: action.type,
    status: "SUCCESS",
    detail: `Email queued to ${email}`
  };
}
async function executeCreateTask(action, runtime) {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: "FAILED", error: "Lead context is required to create a task" };
  }
  let userId;
  if (action.params.assignTo === "ASSIGNEE") {
    userId = lead.assignedTo?.id ?? void 0;
  } else if (action.params.assignTo === "CUSTOM") {
    userId = action.params.customUserId;
  }
  const dueAt = action.params.dueInMinutes ? new Date(Date.now() + action.params.dueInMinutes * 6e4) : void 0;
  await createActivity({
    leadId: lead.id,
    userId,
    type: ActivityType4.TASK,
    status: ActivityStatus3.PENDING,
    subject: action.params.subject,
    description: action.params.description,
    dueAt
  });
  return {
    type: action.type,
    status: "SUCCESS",
    detail: `Task scheduled${userId ? ` for user ${userId}` : ""}`
  };
}
async function executeScheduleFollowUp(action, runtime) {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: "FAILED", error: "Lead context is required for follow-up scheduling" };
  }
  const dueAt = new Date(Date.now() + action.params.dueInMinutes * 6e4);
  await createActivity({
    leadId: lead.id,
    userId: lead.assignedTo?.id ?? void 0,
    type: ActivityType4.FOLLOW_UP,
    status: ActivityStatus3.PENDING,
    subject: action.params.subject,
    description: action.params.description,
    dueAt
  });
  return {
    type: action.type,
    status: "SUCCESS",
    detail: `Follow-up scheduled for ${dueAt.toISOString()}`
  };
}
async function executeUpdateLead(action, runtime) {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: "FAILED", error: "Lead context is required to update lead status" };
  }
  const updates = {};
  if (action.params.status) {
    updates.status = action.params.status;
  }
  if (action.params.priority) {
    updates.priority = action.params.priority;
  }
  if (Object.keys(updates).length === 0) {
    return { type: action.type, status: "FAILED", error: "No lead updates were specified" };
  }
  await prisma.lead.update({ where: { id: lead.id }, data: updates });
  return {
    type: action.type,
    status: "SUCCESS",
    detail: `Lead updated${action.params.status ? ` status=${action.params.status}` : ""}${action.params.priority ? ` priority=${action.params.priority}` : ""}`
  };
}
async function executeTagLead(action, runtime) {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: "FAILED", error: "Lead context is required to tag lead" };
  }
  const currentTags = new Set(lead.tags ?? []);
  for (const tag of action.params.tags) {
    currentTags.add(tag);
  }
  await prisma.lead.update({
    where: { id: lead.id },
    data: { tags: Array.from(currentTags) }
  });
  return {
    type: action.type,
    status: "SUCCESS",
    detail: `Lead tagged with ${action.params.tags.join(", ")}`
  };
}
async function executeNotifyUser(action, runtime, tenantId) {
  const lead = runtime.lead;
  let userId;
  if (action.params.target === "ASSIGNEE") {
    userId = lead?.assignedTo?.id ?? void 0;
  } else if (action.params.target === "CUSTOM") {
    userId = action.params.customUserId;
  }
  if (!userId) {
    return { type: action.type, status: "FAILED", error: "Unable to resolve notification recipient" };
  }
  await prisma.notification.create({
    data: {
      tenant: { connect: { id: tenantId } },
      user: { connect: { id: userId } },
      type: NotificationType.SYSTEM,
      title: action.params.title,
      message: action.params.message,
      actionUrl: action.params.url ?? null
    }
  });
  return {
    type: action.type,
    status: "SUCCESS",
    detail: `Notification queued for user ${userId}`
  };
}
async function executeStartNurtureSequence(action, runtime) {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: "FAILED", error: "Lead context is required to start nurture sequence" };
  }
  const tag = `NURTURE:${action.params.sequenceId}`;
  const tags = new Set(lead.tags ?? []);
  tags.add(tag);
  await prisma.lead.update({
    where: { id: lead.id },
    data: { tags: Array.from(tags), nextActionAt: new Date(Date.now() + 24 * 60 * 60 * 1e3) }
  });
  await createActivity({
    leadId: lead.id,
    type: ActivityType4.NOTE,
    status: ActivityStatus3.COMPLETED,
    subject: "Nurture sequence started",
    description: `Automation enrolled lead in sequence ${action.params.sequenceId}`
  });
  return {
    type: action.type,
    status: "SUCCESS",
    detail: `Lead enrolled into nurture sequence ${action.params.sequenceId}`
  };
}
async function executeActionDefinition(action, runtime, tenantId) {
  switch (action.type) {
    case "SEND_SMS":
      return executeSendSms(action, runtime);
    case "SEND_EMAIL":
      return executeSendEmail(action, runtime);
    case "CREATE_TASK":
      return executeCreateTask(action, runtime);
    case "SCHEDULE_FOLLOW_UP":
      return executeScheduleFollowUp(action, runtime);
    case "UPDATE_LEAD":
      return executeUpdateLead(action, runtime);
    case "TAG_LEAD":
      return executeTagLead(action, runtime);
    case "NOTIFY_USER":
      return executeNotifyUser(action, runtime, tenantId);
    case "START_NURTURE_SEQUENCE":
      return executeStartNurtureSequence(action, runtime);
    default:
      throw new Error(`Unsupported automation action: ${action.type}`);
  }
}
async function recordAutomationExecution(tenantId, automation, runtime, status2, actions, error) {
  await prisma.automationExecution.create({
    data: {
      tenant: { connect: { id: tenantId } },
      automation: { connect: { id: automation.id } },
      triggerType: runtime.trigger,
      status: status2,
      context: toJson2({
        leadId: runtime.lead?.id ?? null,
        customerId: runtime.customer?.id ?? null,
        appointmentId: runtime.appointment?.id ?? null,
        score: runtime.score ?? null,
        scoreDelta: runtime.scoreDelta ?? null,
        sentiment: runtime.sentiment ?? null,
        occurredAt: runtime.occurredAt.toISOString()
      }),
      result: toJson2({ actions }),
      error: error ?? null,
      completedAt: /* @__PURE__ */ new Date()
    }
  });
}
async function runAutomation(tenantId, automation, runtime, force) {
  const key = getDebounceKey(tenantId, automation.id, {
    leadId: runtime.lead?.id,
    customerId: runtime.customer?.id,
    trigger: runtime.trigger
  });
  if (shouldDebounce(key, force)) {
    await recordAutomationExecution(tenantId, automation, runtime, AutomationExecutionStatus.SKIPPED, [], "debounced");
    return {
      automationId: automation.id,
      name: automation.name,
      status: AutomationExecutionStatus.SKIPPED,
      actions: [],
      skipped: true,
      error: "debounced"
    };
  }
  const results = [];
  let status2 = AutomationExecutionStatus.SUCCESS;
  let errorMessage;
  for (const action of automation.actions) {
    try {
      const result = await executeActionDefinition(action, runtime, tenantId);
      results.push(result);
      if (result.status === "FAILED") {
        status2 = AutomationExecutionStatus.FAILED;
        errorMessage = result.error;
        break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ type: action.type, status: "FAILED", error: message });
      status2 = AutomationExecutionStatus.FAILED;
      errorMessage = message;
      break;
    }
  }
  recordDebounce(key);
  await recordAutomationExecution(tenantId, automation, runtime, status2, results, errorMessage);
  return {
    automationId: automation.id,
    name: automation.name,
    status: status2,
    actions: results,
    skipped: false,
    error: errorMessage
  };
}
async function triggerAutomations(trigger, context, options) {
  const tenantId = ensureTenantId();
  const parsedContext = automationTriggerContextSchema.parse(context ?? {});
  const runtime = await buildRuntimeContext(trigger, parsedContext);
  const where = {
    trigger: { path: ["type"], equals: trigger }
  };
  if (options?.automationId) {
    where.id = options.automationId;
  }
  if (!options?.force) {
    where.isActive = true;
  }
  const automationsRaw = await prisma.automation.findMany({ where, orderBy: { createdAt: "desc" } });
  const automations = automationsRaw.map(automationToRecord);
  const results = [];
  for (const automation of automations) {
    if (!options?.force && !automation.isActive) {
      continue;
    }
    if (!matchesTriggerFilters(automation.trigger, runtime)) {
      continue;
    }
    try {
      const result = await runAutomation(tenantId, automation, runtime, options?.force);
      results.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await recordAutomationExecution(
        tenantId,
        automation,
        runtime,
        AutomationExecutionStatus.FAILED,
        [],
        message
      );
      results.push({
        automationId: automation.id,
        name: automation.name,
        status: AutomationExecutionStatus.FAILED,
        actions: [],
        skipped: false,
        error: message
      });
    }
  }
  return results;
}
async function listAutomations() {
  ensureTenantId();
  const automations = await prisma.automation.findMany({ orderBy: { createdAt: "desc" } });
  return automations.map(automationToRecord);
}
async function createAutomation(input) {
  const tenantId = ensureTenantId();
  const payload = automationDefinitionSchema.parse(input);
  const created = await prisma.automation.create({
    data: {
      tenant: { connect: { id: tenantId } },
      name: payload.name,
      trigger: toJson2(payload.trigger),
      actions: toJson2(payload.actions),
      isActive: payload.isActive
    }
  });
  return automationToRecord(created);
}
async function updateAutomation(id, input) {
  ensureTenantId();
  const payload = automationDefinitionSchema.parse(input);
  const updated = await prisma.automation.update({
    where: { id },
    data: {
      name: payload.name,
      trigger: toJson2(payload.trigger),
      actions: toJson2(payload.actions),
      isActive: payload.isActive
    }
  });
  return automationToRecord(updated);
}
var togglePayloadSchema = z2.object({ isActive: z2.boolean().optional() });
async function toggleAutomation(id, input) {
  ensureTenantId();
  const payload = togglePayloadSchema.parse(input ?? {});
  const existing = await prisma.automation.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error("Automation not found"), { status: 404 });
  }
  const updated = await prisma.automation.update({
    where: { id },
    data: { isActive: payload.isActive ?? !existing.isActive }
  });
  return automationToRecord(updated);
}
async function executeAutomation(input) {
  const payload = manualExecutionSchema.parse(input ?? {});
  return triggerAutomations(payload.trigger, payload.context, {
    automationId: payload.automationId,
    force: payload.force
  });
}

// src/services/lead-routing.service.ts
var CLOSED_LEAD_STATUSES = [
  LeadStatus2.WON,
  LeadStatus2.LOST,
  LeadStatus2.ARCHIVED,
  LeadStatus2.CUSTOMER
];
var DEFAULT_MAX_ACTIVE_LEADS = 40;
var LEAD_ROUTING_SECTION_KEY = "leadRouting";
var leadRoutingTriggerSchema = z3.enum(["LEAD_CREATED", "SCORE_UPDATED", "MANUAL"]);
var hourWindowSchema = z3.object({
  startHour: z3.number().int().min(0).max(23),
  endHour: z3.number().int().min(0).max(23),
  startMinute: z3.number().int().min(0).max(59).optional(),
  endMinute: z3.number().int().min(0).max(59).optional(),
  timeZone: z3.string().min(2).optional(),
  days: z3.array(z3.number().int().min(0).max(6)).optional()
});
var territorySchema = z3.object({
  zipPrefix: z3.string().trim().min(2),
  userId: z3.string().trim().min(1)
});
var teamDefinitionSchema = z3.union([
  z3.object({
    type: z3.literal("ROLE"),
    role: z3.nativeEnum(UserRole)
  }),
  z3.object({
    type: z3.literal("STATIC"),
    userIds: z3.array(z3.string().trim().min(1)).nonempty()
  })
]);
var assignmentStrategySchema = z3.discriminatedUnion("type", [
  z3.object({
    type: z3.literal("TEAM_ROUND_ROBIN"),
    team: z3.string().trim().min(1)
  }),
  z3.object({
    type: z3.literal("TOP_PERFORMER"),
    team: z3.string().trim().min(1),
    windowDays: z3.number().int().min(1).max(180).optional()
  }),
  z3.object({
    type: z3.literal("DIRECT"),
    userId: z3.string().trim().min(1)
  }),
  z3.object({
    type: z3.literal("ROUND_ROBIN"),
    userIds: z3.array(z3.string().trim().min(1)).nonempty(),
    key: z3.string().trim().min(1).optional()
  }),
  z3.object({
    type: z3.literal("TERRITORY"),
    territories: z3.array(territorySchema).nonempty().optional()
  })
]);
var leadRoutingRuleSchema = z3.object({
  id: z3.string().trim().min(1),
  name: z3.string().trim().min(1),
  priority: z3.number().int().default(0),
  conditions: z3.object({
    triggers: z3.array(leadRoutingTriggerSchema).optional(),
    sources: z3.array(z3.nativeEnum(LeadSource2)).optional(),
    minScore: z3.number().optional(),
    maxScore: z3.number().optional(),
    scoreDeltaGte: z3.number().optional(),
    zipPrefixes: z3.array(z3.string().trim().min(2)).optional(),
    hourWindows: z3.array(hourWindowSchema).optional()
  }).default({}),
  assignment: assignmentStrategySchema,
  fallback: assignmentStrategySchema.optional()
});
var leadRoutingConfigSchema = z3.object({
  rules: z3.array(leadRoutingRuleSchema).default([]),
  defaultRule: assignmentStrategySchema.optional(),
  teams: z3.record(teamDefinitionSchema).default({}),
  availability: z3.object({
    defaultMaxActiveLeads: z3.number().int().min(1).default(DEFAULT_MAX_ACTIVE_LEADS),
    userCaps: z3.record(z3.number().int().min(1)).default({})
  }).default({ defaultMaxActiveLeads: DEFAULT_MAX_ACTIVE_LEADS, userCaps: {} }),
  territories: z3.array(territorySchema).default([]),
  topPerformerWindowDays: z3.number().int().min(1).max(365).default(30),
  timeZone: z3.string().min(2).optional()
});
var DEFAULT_LEAD_ROUTING_CONFIG = {
  teams: {
    BDC: { type: "ROLE", role: UserRole.BDC },
    SALES: { type: "ROLE", role: UserRole.SALES },
    NIGHT_TEAM: { type: "ROLE", role: UserRole.BDC }
  },
  availability: {
    defaultMaxActiveLeads: DEFAULT_MAX_ACTIVE_LEADS,
    userCaps: {}
  },
  territories: [],
  topPerformerWindowDays: 30,
  rules: [
    {
      id: "after-hours-night-team",
      name: "After-hours leads go to night team",
      priority: 200,
      conditions: {
        hourWindows: [
          {
            startHour: 20,
            endHour: 7
          }
        ]
      },
      assignment: {
        type: "TEAM_ROUND_ROBIN",
        team: "NIGHT_TEAM"
      }
    },
    {
      id: "hot-website-top-performer",
      name: "Hot website leads go to top performer",
      priority: 100,
      conditions: {
        sources: [LeadSource2.WEBSITE],
        minScore: 80
      },
      assignment: {
        type: "TOP_PERFORMER",
        team: "SALES",
        windowDays: 30
      },
      fallback: {
        type: "TEAM_ROUND_ROBIN",
        team: "SALES"
      }
    }
  ],
  defaultRule: {
    type: "TEAM_ROUND_ROBIN",
    team: "BDC"
  }
};
var simulationInputSchema = z3.object({
  leadId: z3.string().optional(),
  source: z3.nativeEnum(LeadSource2).optional(),
  score: z3.number().optional(),
  scoreDelta: z3.number().optional(),
  zip: z3.string().trim().min(2).optional(),
  trigger: leadRoutingTriggerSchema.default("MANUAL"),
  occurredAt: z3.coerce.date().optional()
});
function ensureTenantId2() {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error("Tenant context is required for lead routing");
  }
  return tenantId;
}
function cloneValue2(value) {
  const globalClone = globalThis.structuredClone;
  if (typeof globalClone === "function") {
    return globalClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}
function cloneSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return cloneValue2(value);
}
function extractLeadRoutingSection(settings) {
  const section = settings[LEAD_ROUTING_SECTION_KEY];
  if (!section || typeof section !== "object" || Array.isArray(section)) {
    return {};
  }
  return cloneValue2(section);
}
function extractRoundRobinState(section) {
  const state = section.roundRobin;
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return {};
  }
  const cloned = cloneValue2(state);
  return Object.fromEntries(
    Object.entries(cloned).filter((entry) => typeof entry[1] === "string").map(([key, value]) => [key, value])
  );
}
function extractConfig(section) {
  const config2 = section.config;
  if (!config2 || typeof config2 !== "object" || Array.isArray(config2)) {
    return void 0;
  }
  try {
    return leadRoutingConfigSchema.parse(config2);
  } catch (error) {
    console.warn("Invalid lead routing configuration detected. Falling back to defaults.", error);
    return void 0;
  }
}
function extractTimeZone(settings, config2) {
  if (config2?.timeZone) {
    return config2.timeZone;
  }
  const direct = settings.timezone;
  if (typeof direct === "string" && direct.trim().length > 0) {
    return direct;
  }
  const section = extractLeadRoutingSection(settings);
  const sectionTz = section.timeZone;
  if (typeof sectionTz === "string" && sectionTz.trim().length > 0) {
    return sectionTz;
  }
  return "UTC";
}
async function persistLeadRoutingSettings(client3, tenantId, settingsValue) {
  await client3.tenant.update({
    where: { id: tenantId },
    data: { settings: settingsValue }
  });
}
function mergeLeadRoutingSettings(existingSettings, updates) {
  const settings = cloneSettings(existingSettings);
  const section = extractLeadRoutingSection(settings);
  const nextSection = { ...section, ...updates };
  settings[LEAD_ROUTING_SECTION_KEY] = nextSection;
  return settings;
}
async function loadLeadRoutingContext(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true }
  });
  const settings = cloneSettings(tenant?.settings ?? null);
  const section = extractLeadRoutingSection(settings);
  const config2 = extractConfig(section) ?? cloneValue2(DEFAULT_LEAD_ROUTING_CONFIG);
  const roundRobin = extractRoundRobinState(section);
  const timeZone = extractTimeZone(settings, config2);
  if (!section.config) {
    const nextSettings = mergeLeadRoutingSettings(tenant?.settings ?? null, { config: config2 });
    await persistLeadRoutingSettings(prisma, tenantId, nextSettings);
  }
  return { config: config2, roundRobin, timeZone };
}
async function updateRoundRobinState(tenantId, key, userId, client3 = prisma) {
  const tenant = await client3.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true }
  });
  const settings = cloneSettings(tenant?.settings ?? null);
  const section = extractLeadRoutingSection(settings);
  const current = extractRoundRobinState(section);
  const nextState = { ...current, [key]: userId };
  const nextSettings = mergeLeadRoutingSettings(tenant?.settings ?? null, { roundRobin: nextState });
  await persistLeadRoutingSettings(client3, tenantId, nextSettings);
}
function mapTeamToRole(team) {
  const normalized = team.toUpperCase();
  switch (normalized) {
    case "BDC":
      return UserRole.BDC;
    case "SALES":
      return UserRole.SALES;
    case "NIGHT_TEAM":
      return UserRole.BDC;
    default:
      return void 0;
  }
}
async function loadUsersByIds(tenantId, userIds) {
  if (userIds.length === 0) {
    return [];
  }
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, tenantId, status: UserStatus.ACTIVE },
    select: { id: true, firstName: true, lastName: true, email: true, role: true }
  });
  return users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email ?? null,
    role: user.role
  }));
}
async function loadUsersByRole(tenantId, role) {
  const users = await prisma.user.findMany({
    where: { tenantId, role, status: UserStatus.ACTIVE },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
    orderBy: { createdAt: "asc" }
  });
  return users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email ?? null,
    role: user.role
  }));
}
async function buildCandidates(tenantId, users, config2) {
  if (users.length === 0) {
    return [];
  }
  const caps = config2.availability.userCaps ?? {};
  const defaultCap = config2.availability.defaultMaxActiveLeads ?? DEFAULT_MAX_ACTIVE_LEADS;
  const ids = users.map((user) => user.id);
  const workloads = await prisma.lead.groupBy({
    by: ["assignedToId"],
    where: {
      tenantId,
      assignedToId: { in: ids },
      status: { notIn: CLOSED_LEAD_STATUSES },
      isArchived: false
    },
    _count: { _all: true }
  });
  const workloadMap = /* @__PURE__ */ new Map();
  for (const workload of workloads) {
    if (workload.assignedToId) {
      workloadMap.set(workload.assignedToId, workload._count._all);
    }
  }
  return users.map((user) => {
    const activeLeadCount = workloadMap.get(user.id) ?? 0;
    const capacity = caps[user.id] ?? defaultCap;
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      activeLeadCount,
      capacity
    };
  }).filter((candidate) => candidate.activeLeadCount < candidate.capacity);
}
async function resolveTeamCandidates(tenantId, team, config2) {
  const definition = config2.teams?.[team];
  if (definition?.type === "STATIC") {
    const users2 = await loadUsersByIds(tenantId, definition.userIds);
    return buildCandidates(tenantId, users2, config2);
  }
  const role = definition?.type === "ROLE" ? definition.role : mapTeamToRole(team);
  if (!role) {
    return [];
  }
  const users = await loadUsersByRole(tenantId, role);
  return buildCandidates(tenantId, users, config2);
}
async function resolveSpecificCandidates(tenantId, userIds, config2) {
  const users = await loadUsersByIds(tenantId, userIds);
  return buildCandidates(tenantId, users, config2);
}
function computeNextRoundRobinCandidate(candidates, roundRobin, key) {
  if (candidates.length === 0) {
    return void 0;
  }
  const lastId = roundRobin[key];
  if (!lastId) {
    return candidates[0];
  }
  const index = candidates.findIndex((candidate) => candidate.id === lastId);
  if (index === -1 || index === candidates.length - 1) {
    return candidates[0];
  }
  return candidates[index + 1];
}
async function resolveTopPerformer(tenantId, candidates, config2, strategy, options) {
  if (candidates.length === 0) {
    return void 0;
  }
  const windowSize = Math.max(1, strategy.windowDays ?? config2.topPerformerWindowDays ?? 30);
  const since = subDays2(options.occurredAt ?? /* @__PURE__ */ new Date(), windowSize);
  const ids = candidates.map((candidate) => candidate.id);
  const totals = await prisma.lead.groupBy({
    by: ["assignedToId"],
    where: {
      tenantId,
      assignedToId: { in: ids },
      updatedAt: { gte: since },
      status: { in: [LeadStatus2.WON, LeadStatus2.LOST] }
    },
    _count: { _all: true }
  });
  const wins = await prisma.lead.groupBy({
    by: ["assignedToId"],
    where: {
      tenantId,
      assignedToId: { in: ids },
      updatedAt: { gte: since },
      status: LeadStatus2.WON
    },
    _count: { _all: true }
  });
  const totalMap = /* @__PURE__ */ new Map();
  const winMap = /* @__PURE__ */ new Map();
  for (const entry of totals) {
    if (entry.assignedToId) {
      totalMap.set(entry.assignedToId, entry._count._all);
    }
  }
  for (const entry of wins) {
    if (entry.assignedToId) {
      winMap.set(entry.assignedToId, entry._count._all);
    }
  }
  let best;
  let bestRate = -1;
  let bestWins = -1;
  for (const candidate of candidates) {
    const total = totalMap.get(candidate.id) ?? 0;
    const winCount = winMap.get(candidate.id) ?? 0;
    const winRate = total === 0 ? 0 : winCount / total;
    if (winRate > bestRate || winRate === bestRate && winCount > bestWins || winRate === bestRate && winCount === bestWins && candidate.activeLeadCount < (best?.activeLeadCount ?? Infinity)) {
      best = candidate;
      bestRate = winRate;
      bestWins = winCount;
    }
  }
  return best ?? candidates[0];
}
function getRoundRobinKey(scope, identifier) {
  return `${scope}:${identifier}`;
}
function isWithinHourWindow(date, window, timeZone) {
  const zone = window.timeZone ?? timeZone;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short"
  });
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((part) => part.type === "hour");
  const minutePart = parts.find((part) => part.type === "minute");
  const weekdayPart = parts.find((part) => part.type === "weekday");
  const hour = hourPart ? Number.parseInt(hourPart.value, 10) : 0;
  const minute = minutePart ? Number.parseInt(minutePart.value, 10) : 0;
  const totalMinutes = hour * 60 + minute;
  const start = window.startHour * 60 + (window.startMinute ?? 0);
  const end = window.endHour * 60 + (window.endMinute ?? 0);
  if (window.days && weekdayPart) {
    const dayMap = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6
    };
    const currentDay = dayMap[weekdayPart.value];
    if (currentDay === void 0 || !window.days.includes(currentDay)) {
      return false;
    }
  }
  if (start <= end) {
    return totalMinutes >= start && totalMinutes < end;
  }
  return totalMinutes >= start || totalMinutes < end;
}
function matchesRule(rule, lead, options, timeZone) {
  const { conditions } = rule;
  const score = options.score ?? lead.score ?? null;
  const scoreDelta = options.scoreDelta ?? null;
  if (conditions.triggers && !conditions.triggers.includes(options.trigger)) {
    return false;
  }
  if (conditions.sources && lead.source && !conditions.sources.includes(lead.source)) {
    return false;
  }
  if (conditions.minScore !== void 0 && (score ?? -Infinity) < conditions.minScore) {
    return false;
  }
  if (conditions.maxScore !== void 0 && (score ?? Infinity) > conditions.maxScore) {
    return false;
  }
  if (conditions.scoreDeltaGte !== void 0 && Math.abs(scoreDelta ?? 0) < conditions.scoreDeltaGte) {
    return false;
  }
  if (conditions.zipPrefixes && conditions.zipPrefixes.length > 0) {
    const zip = lead.customer?.addressZip ?? "";
    if (!conditions.zipPrefixes.some((prefix) => zip.startsWith(prefix))) {
      return false;
    }
  }
  if (conditions.hourWindows && conditions.hourWindows.length > 0) {
    const matched = conditions.hourWindows.some((window) => isWithinHourWindow(options.occurredAt ?? /* @__PURE__ */ new Date(), window, timeZone));
    if (!matched) {
      return false;
    }
  }
  return true;
}
async function resolveAssignment(tenantId, lead, config2, roundRobin, options, rule, strategy) {
  switch (strategy.type) {
    case "DIRECT": {
      const candidates = await resolveSpecificCandidates(tenantId, [strategy.userId], config2);
      const candidate = candidates[0];
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: "direct",
        reason: `Direct assignment to ${candidate.firstName} ${candidate.lastName}`,
        rule: rule ?? void 0
      };
    }
    case "ROUND_ROBIN": {
      const candidates = await resolveSpecificCandidates(tenantId, strategy.userIds, config2);
      const key = getRoundRobinKey("list", strategy.key ?? strategy.userIds.sort().join(","));
      const candidate = computeNextRoundRobinCandidate(candidates, roundRobin, key);
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: "round_robin",
        reason: `Round robin rotation across ${candidates.length} teammates`,
        rule: rule ?? void 0,
        roundRobinKey: key
      };
    }
    case "TEAM_ROUND_ROBIN": {
      const candidates = await resolveTeamCandidates(tenantId, strategy.team, config2);
      const key = getRoundRobinKey("team", strategy.team.toUpperCase());
      const candidate = computeNextRoundRobinCandidate(candidates, roundRobin, key);
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: `team_round_robin:${strategy.team}`,
        reason: `Team ${strategy.team.toUpperCase()} round robin assignment`,
        rule: rule ?? void 0,
        roundRobinKey: key
      };
    }
    case "TOP_PERFORMER": {
      const candidates = await resolveTeamCandidates(tenantId, strategy.team, config2);
      const candidate = await resolveTopPerformer(tenantId, candidates, config2, strategy, options);
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: `top_performer:${strategy.team}`,
        reason: `Top performer selected from ${strategy.team.toUpperCase()} based on recent win rate`,
        rule: rule ?? void 0
      };
    }
    case "TERRITORY": {
      const territories = strategy.territories && strategy.territories.length > 0 ? strategy.territories : config2.territories;
      if (!territories || territories.length === 0) {
        return null;
      }
      const zip = lead.customer?.addressZip ?? "";
      const match = territories.filter((territory) => zip.startsWith(territory.zipPrefix)).sort((a, b) => b.zipPrefix.length - a.zipPrefix.length)[0];
      if (!match) {
        return null;
      }
      const candidates = await resolveSpecificCandidates(tenantId, [match.userId], config2);
      const candidate = candidates[0];
      if (!candidate) {
        return null;
      }
      return {
        candidate,
        strategy: "territory",
        reason: `Zip ${zip} matched to territory prefix ${match.zipPrefix}`,
        rule: rule ?? void 0
      };
    }
    default:
      return null;
  }
}
async function evaluateRouting(tenantId, lead, config2, roundRobin, options, timeZone) {
  const rules = [...config2.rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  for (const rule of rules) {
    if (!matchesRule(rule, lead, options, timeZone)) {
      continue;
    }
    const primary = await resolveAssignment(tenantId, lead, config2, roundRobin, options, rule, rule.assignment);
    if (primary) {
      primary.reason = `Rule "${rule.name}" satisfied. ${primary.reason}`;
      return primary;
    }
    if (rule.fallback) {
      const fallback = await resolveAssignment(tenantId, lead, config2, roundRobin, options, rule, rule.fallback);
      if (fallback) {
        fallback.reason = `Rule "${rule.name}" fallback applied. ${fallback.reason}`;
        return fallback;
      }
    }
  }
  if (config2.defaultRule) {
    const fallback = await resolveAssignment(tenantId, lead, config2, roundRobin, options, null, config2.defaultRule);
    if (fallback) {
      fallback.reason = `Default routing applied. ${fallback.reason}`;
      return fallback;
    }
  }
  return null;
}
async function fetchLeadForRouting(leadId) {
  return prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      customer: { select: { addressZip: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, role: true } }
    }
  });
}
async function evaluateLeadRoutingForLead(leadId, options) {
  const tenantId = ensureTenantId2();
  const lead = await fetchLeadForRouting(leadId);
  if (!lead) {
    return null;
  }
  const { config: config2, roundRobin, timeZone } = await loadLeadRoutingContext(tenantId);
  const resolution = await evaluateRouting(tenantId, lead, config2, roundRobin, options, timeZone);
  if (!resolution) {
    return null;
  }
  if (lead.assignedToId === resolution.candidate.id) {
    if (resolution.roundRobinKey) {
      await updateRoundRobinState(tenantId, resolution.roundRobinKey, resolution.candidate.id);
    }
    return {
      leadId: lead.id,
      assignedToId: resolution.candidate.id,
      previousAssignedToId: lead.assignedToId ?? null,
      ruleId: resolution.rule?.id ?? null,
      ruleName: resolution.rule?.name ?? null,
      strategy: resolution.strategy,
      reason: resolution.reason,
      candidate: resolution.candidate
    };
  }
  const updatedLead = await prisma.$transaction(async (tx) => {
    const saved = await tx.lead.update({
      where: { id: lead.id },
      data: { assignedToId: resolution.candidate.id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, role: true } }
      }
    });
    if (resolution.roundRobinKey) {
      await updateRoundRobinState(tenantId, resolution.roundRobinKey, resolution.candidate.id, tx);
    }
    return saved;
  });
  emitTenantEvent(tenantId, "lead:assigned", {
    leadId: lead.id,
    assignedToId: updatedLead.assignedToId,
    previousAssignedToId: lead.assignedToId ?? null,
    ruleId: resolution.rule?.id ?? null,
    ruleName: resolution.rule?.name ?? null,
    strategy: resolution.strategy
  });
  return {
    leadId: lead.id,
    assignedToId: updatedLead.assignedToId,
    previousAssignedToId: lead.assignedToId ?? null,
    ruleId: resolution.rule?.id ?? null,
    ruleName: resolution.rule?.name ?? null,
    strategy: resolution.strategy,
    reason: resolution.reason,
    candidate: resolution.candidate
  };
}
async function handleLeadCreated(leadId) {
  const occurredAt = /* @__PURE__ */ new Date();
  const result = await evaluateLeadRoutingForLead(leadId, { trigger: "LEAD_CREATED", occurredAt });
  try {
    await triggerAutomations("NEW_LEAD", { leadId, occurredAt });
  } catch (error) {
    console.error("Failed to trigger new lead automations", error);
  }
  return result;
}
async function simulateLeadRouting(input) {
  const parsed = simulationInputSchema.parse(input);
  const tenantId = ensureTenantId2();
  const { config: config2, roundRobin, timeZone } = await loadLeadRoutingContext(tenantId);
  const lead = {
    id: parsed.leadId ?? `sim-${Date.now()}`,
    tenantId,
    customerId: null,
    assignedToId: null,
    ownerId: null,
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    status: LeadStatus2.NEW,
    source: parsed.source ?? LeadSource2.WEBSITE,
    priority: LeadPriority2.MEDIUM,
    rating: null,
    score: parsed.score ?? null,
    smsOptOut: false,
    emailOptOut: false,
    callOptOut: false,
    isArchived: false,
    isConverted: false,
    lastActivityAt: null,
    lastCommunicationAt: null,
    nextActionAt: null,
    convertedAt: null,
    description: null,
    tags: [],
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date(),
    customer: { addressZip: parsed.zip ?? null },
    assignedTo: null
  };
  const options = {
    trigger: parsed.trigger,
    score: parsed.score ?? null,
    scoreDelta: parsed.scoreDelta ?? null,
    occurredAt: parsed.occurredAt ?? /* @__PURE__ */ new Date()
  };
  const resolution = await evaluateRouting(tenantId, lead, config2, roundRobin, options, timeZone);
  if (!resolution) {
    return null;
  }
  return {
    leadId: lead.id,
    assignedToId: resolution.candidate.id,
    previousAssignedToId: null,
    ruleId: resolution.rule?.id ?? null,
    ruleName: resolution.rule?.name ?? null,
    strategy: resolution.strategy,
    reason: resolution.reason,
    candidate: resolution.candidate
  };
}

// src/services/webhook.service.ts
function deriveActivityStatus2(status2) {
  switch (status2) {
    case CommunicationStatus3.DELIVERED:
      return ActivityStatus4.COMPLETED;
    case CommunicationStatus3.FAILED:
    case CommunicationStatus3.CANCELLED:
      return ActivityStatus4.CANCELED;
    default:
      return ActivityStatus4.PENDING;
  }
}
function requireTenantId3() {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error("Tenant context is required for webhook processing");
  }
  return tenantId;
}
function optionalRelation2(value) {
  if (!value) {
    return void 0;
  }
  return { connect: { id: value } };
}
function mergeJson(base, extra) {
  const normalizedBase = base ?? {};
  return toInputJson({ ...normalizedBase, ...extra });
}
async function upsertLeadByPhone(phone, source) {
  const tenantId = requireTenantId3();
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) {
    return { leadId: void 0, customerId: void 0 };
  }
  let created = false;
  let lead = await prisma.lead.findFirst({
    where: { phone: normalized },
    select: { id: true, customerId: true }
  });
  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        tenant: { connect: { id: tenantId } },
        phone: normalized,
        source,
        status: LeadStatus3.NEW,
        priority: LeadPriority3.MEDIUM,
        tags: ["AUTO_CREATED"]
      },
      select: { id: true, customerId: true }
    });
    created = true;
  }
  if (created && lead.id) {
    try {
      await handleLeadCreated(lead.id);
    } catch (error) {
      console.error("Failed to route new lead", error);
    }
  }
  return { leadId: lead.id, customerId: lead.customerId };
}
async function updateActivityFromCommunication(communicationId, status2, outcome) {
  const communication = await prisma.communication.findUnique({
    where: { id: communicationId },
    select: { activityId: true, leadId: true }
  });
  if (!communication?.activityId) {
    return;
  }
  const updates = {};
  if (status2) {
    updates.status = deriveActivityStatus2(status2);
  }
  if (outcome) {
    updates.outcome = outcome;
  }
  if (status2 && (status2 === CommunicationStatus3.DELIVERED || status2 === CommunicationStatus3.FAILED || status2 === CommunicationStatus3.CANCELLED)) {
    updates.completedAt = /* @__PURE__ */ new Date();
  }
  await prisma.activity.update({ where: { id: communication.activityId }, data: updates });
}
function readString(payload, key) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : void 0;
}
async function handleTwilioWebhook(payload) {
  const tenantId = requireTenantId3();
  const messageSid = readString(payload, "MessageSid") ?? readString(payload, "SmsSid");
  const callSid = readString(payload, "CallSid");
  if (messageSid) {
    const status2 = mapTwilioStatus(readString(payload, "MessageStatus") ?? readString(payload, "SmsStatus"));
    const direction = (readString(payload, "Direction") ?? readString(payload, "MessageDirection") ?? "").toLowerCase();
    if ((readString(payload, "SmsStatus") ?? "").toLowerCase() === "received" || direction === "inbound") {
      const from = normalizePhoneNumber(readString(payload, "From") ?? "");
      const to = normalizePhoneNumber(readString(payload, "To") ?? "");
      const body = readString(payload, "Body") ?? "";
      const { leadId, customerId } = await upsertLeadByPhone(from, LeadSource3.PHONE);
      const communication2 = await prisma.communication.create({
        data: {
          tenant: { connect: { id: tenantId } },
          type: CommunicationType4.SMS,
          direction: CommunicationDirection3.INBOUND,
          to,
          from,
          body,
          providerId: messageSid,
          status: CommunicationStatus3.DELIVERED,
          metadata: toInputJson({ twilio: payload }),
          lead: optionalRelation2(leadId),
          customer: optionalRelation2(customerId)
        }
      });
      const activity = await logSmsActivity({
        leadId,
        customerId: customerId ?? void 0,
        body,
        to,
        from,
        providerId: messageSid
      });
      await prisma.communication.update({ where: { id: communication2.id }, data: { activityId: activity.id } });
      return;
    }
    const communication = await prisma.communication.findFirst({
      where: { providerId: messageSid },
      select: { id: true, metadata: true }
    });
    if (!communication) {
      return;
    }
    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: status2 ?? void 0,
        metadata: mergeJson(communication.metadata, {
          lastEvent: payload
        })
      }
    });
    await updateActivityFromCommunication(
      updated.id,
      updated.status ?? void 0,
      readString(payload, "MessageStatus") ?? readString(payload, "SmsStatus")
    );
    return;
  }
  if (callSid) {
    const status2 = mapTwilioStatus(readString(payload, "CallStatus"));
    const direction = (readString(payload, "Direction") ?? "").toLowerCase();
    const existing = await prisma.communication.findFirst({ where: { providerId: callSid } });
    if (!existing) {
      const from = normalizePhoneNumber(readString(payload, "From") ?? "");
      const to = normalizePhoneNumber(readString(payload, "To") ?? "");
      const { leadId, customerId } = await upsertLeadByPhone(direction === "inbound" ? from : to, LeadSource3.PHONE);
      const communication = await prisma.communication.create({
        data: {
          tenant: { connect: { id: tenantId } },
          type: CommunicationType4.CALL,
          direction: direction === "inbound" ? CommunicationDirection3.INBOUND : CommunicationDirection3.OUTBOUND,
          to,
          from,
          providerId: callSid,
          status: status2 ?? CommunicationStatus3.SENT,
          metadata: toInputJson({ twilio: payload }),
          lead: optionalRelation2(leadId),
          customer: optionalRelation2(customerId)
        }
      });
      const activity = await logCallActivity({
        leadId,
        customerId: customerId ?? void 0,
        startedAt: /* @__PURE__ */ new Date(),
        completedAt: status2 === CommunicationStatus3.DELIVERED ? /* @__PURE__ */ new Date() : void 0,
        callSid,
        recordingUrl: readString(payload, "RecordingUrl"),
        outcome: readString(payload, "CallStatus"),
        durationSeconds: readString(payload, "CallDuration") ? Number(readString(payload, "CallDuration")) : void 0
      });
      await prisma.communication.update({ where: { id: communication.id }, data: { activityId: activity.id } });
      return;
    }
    const updated = await prisma.communication.update({
      where: { id: existing.id },
      data: {
        status: status2 ?? void 0,
        metadata: mergeJson(existing.metadata, {
          lastEvent: payload,
          recordingUrl: readString(payload, "RecordingUrl") ?? existing.metadata?.recordingUrl
        })
      }
    });
    await updateActivityFromCommunication(updated.id, updated.status ?? void 0, readString(payload, "CallStatus"));
  }
}
async function handleSendGridWebhook(events) {
  for (const event of events) {
    const rawMessageId = event.sg_message_id ?? event["sg_message_id"];
    if (!rawMessageId) {
      continue;
    }
    const messageId = String(rawMessageId).split(".")[0];
    const status2 = mapSendGridStatus(event.event);
    const communication = await prisma.communication.findFirst({
      where: {
        OR: [
          { providerId: messageId },
          { metadata: { path: ["messageId"], equals: messageId } }
        ]
      }
    });
    if (!communication) {
      continue;
    }
    const metadata = communication.metadata;
    const existingEvents = Array.isArray(metadata?.events) ? metadata.events : [];
    const events2 = [
      ...existingEvents,
      { type: event.event, timestamp: event.timestamp ?? Date.now() }
    ];
    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: status2 ?? void 0,
        metadata: toInputJson({
          ...metadata ?? {},
          lastEvent: event,
          events: events2,
          messageId
        })
      }
    });
    if (updated.activityId) {
      const activityUpdates = {};
      if (status2) {
        activityUpdates.status = deriveActivityStatus2(status2);
        if (status2 === CommunicationStatus3.DELIVERED || status2 === CommunicationStatus3.FAILED) {
          activityUpdates.completedAt = /* @__PURE__ */ new Date();
        }
      }
      if (event.event === "open") {
        activityUpdates.opened = true;
        activityUpdates.outcome = "Email opened";
      }
      if (event.event === "click") {
        activityUpdates.clicked = true;
        activityUpdates.outcome = "Email clicked";
      }
      await prisma.activity.update({ where: { id: updated.activityId }, data: activityUpdates });
    }
    if (["bounce", "spamreport", "unsubscribe"].includes(event.event) && communication.leadId) {
      await prisma.lead.update({ where: { id: communication.leadId }, data: { emailOptOut: true } });
    }
  }
}

// src/controllers/webhooks.controller.ts
function resolveTenantId(req) {
  const queryTenant = typeof req.query.tenantId === "string" ? req.query.tenantId : void 0;
  const bodyTenant = typeof req.body?.tenantId === "string" ? req.body.tenantId : void 0;
  const bodyTenantAlt = typeof req.body?.TenantId === "string" ? req.body.TenantId : void 0;
  return queryTenant ?? bodyTenant ?? bodyTenantAlt;
}
function isSendGridEvent(value) {
  return typeof value === "object" && value !== null && "event" in value && typeof value.event === "string";
}
async function handleTwilioWebhook2(req, res) {
  const tenantId = resolveTenantId(req);
  if (!tenantId) {
    res.status(400).json({ message: "tenantId is required" });
    return;
  }
  await runWithTenant(tenantId, async () => {
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    await handleTwilioWebhook(payload);
  });
  res.type("text/xml").send("<Response></Response>");
}
async function handleSendGridWebhook2(req, res) {
  const tenantId = resolveTenantId(req);
  if (!tenantId) {
    res.status(400).json({ message: "tenantId is required" });
    return;
  }
  let events;
  try {
    events = Array.isArray(req.body) ? req.body.filter((item) => isSendGridEvent(item)) : typeof req.body === "string" ? JSON.parse(req.body).filter(isSendGridEvent) : typeof req.body === "object" && req.body !== null && isSendGridEvent(req.body) ? [req.body] : [];
  } catch (error) {
    res.status(400).json({ message: "Invalid SendGrid payload", detail: error instanceof Error ? error.message : String(error) });
    return;
  }
  await runWithTenant(tenantId, async () => {
    await handleSendGridWebhook(events);
  });
  res.json({ ok: true });
}

// src/routes/webhooks.routes.ts
var webhookRouter = Router2();
webhookRouter.post("/communications/twilio/webhook", urlencoded({ extended: true }), handleTwilioWebhook2);
webhookRouter.post("/communications/sendgrid/webhook", json({ type: "*/*" }), handleSendGridWebhook2);
var webhooks_routes_default = webhookRouter;

// src/routes/activity.routes.ts
import { Router as Router3 } from "express";

// src/validations/activity.validation.ts
import { ActivityStatus as ActivityStatus5, ActivityType as ActivityType5 } from "@prisma/client";
import { z as z4 } from "zod";
var cuidSchema = z4.string().min(1);
var optionalDate = z4.preprocess((value) => {
  if (value === void 0 || value === null || value === "") {
    return void 0;
  }
  if (value instanceof Date) {
    return value;
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? void 0 : date;
}, z4.date().optional());
var activityListQuerySchema = z4.object({
  page: z4.coerce.number().int().min(1).default(1),
  pageSize: z4.coerce.number().int().min(1).max(100).default(25),
  type: z4.nativeEnum(ActivityType5).optional(),
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  from: optionalDate,
  to: optionalDate
});
var activityCreateSchema = z4.object({
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  type: z4.nativeEnum(ActivityType5),
  status: z4.nativeEnum(ActivityStatus5).default(ActivityStatus5.PENDING).optional(),
  subject: z4.string().trim().max(255).optional(),
  description: z4.string().trim().max(4e3).optional(),
  outcome: z4.string().trim().max(255).optional(),
  dueAt: z4.coerce.date().optional(),
  startedAt: z4.coerce.date().optional(),
  completedAt: z4.coerce.date().optional()
});
var activityUpdateSchema = activityCreateSchema.partial();
var callActivitySchema = z4.object({
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  subject: z4.string().trim().max(255).optional(),
  notes: z4.string().trim().max(4e3).optional(),
  outcome: z4.string().trim().max(255).optional(),
  startedAt: z4.coerce.date().optional(),
  completedAt: z4.coerce.date().optional(),
  callSid: z4.string().trim().max(128).optional(),
  recordingUrl: z4.string().url().optional(),
  durationSeconds: z4.coerce.number().int().min(0).optional()
}).refine(
  (value) => {
    if (value.startedAt && value.completedAt) {
      return value.completedAt >= value.startedAt;
    }
    return true;
  },
  { message: "completedAt must be later than startedAt" }
);
var emailActivitySchema = z4.object({
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  to: z4.array(z4.string().email()).nonempty(),
  cc: z4.array(z4.string().email()).optional(),
  bcc: z4.array(z4.string().email()).optional(),
  subject: z4.string().trim().min(1).max(255),
  body: z4.string().trim().min(1),
  providerId: z4.string().trim().max(128).optional()
});
var smsActivitySchema = z4.object({
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  to: z4.string().trim().min(5),
  from: z4.string().trim().min(5).optional(),
  body: z4.string().trim().min(1).max(1600),
  providerId: z4.string().trim().max(128).optional()
});
var noteActivitySchema = z4.object({
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  subject: z4.string().trim().max(255).optional(),
  body: z4.string().trim().min(1).max(8e3)
});

// src/utils/http-errors.ts
function hasStatusAndMessage(error) {
  return typeof error === "object" && error !== null;
}
function resolveHttpError(error, fallbackStatus = 500, fallbackMessage = "Unexpected error") {
  const status2 = hasStatusAndMessage(error) && typeof error.status === "number" ? error.status : fallbackStatus;
  if (error instanceof Error) {
    return { status: status2, message: error.message || fallbackMessage };
  }
  if (hasStatusAndMessage(error) && typeof error.message === "string") {
    return { status: status2, message: error.message };
  }
  return { status: status2, message: fallbackMessage };
}

// src/controllers/activity.controller.ts
function ensureTenant(req, res) {
  const tenantId = req.context?.tenantId;
  if (!tenantId) {
    res.status(403).json({ message: "Tenant scope is required" });
    return void 0;
  }
  return tenantId;
}
async function listActivities2(req, res) {
  if (!ensureTenant(req, res)) {
    return;
  }
  const parsed = activityListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid activity filters", details: parsed.error.flatten() });
    return;
  }
  const result = await listActivities(parsed.data);
  res.json({ data: result.items, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, pages: result.pages } });
}
async function createActivity2(req, res) {
  if (!ensureTenant(req, res)) {
    return;
  }
  const parsed = activityCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid activity payload", details: parsed.error.flatten() });
    return;
  }
  const activity = await createActivity(parsed.data);
  res.status(201).json({ data: activity });
}
async function getActivity2(req, res) {
  if (!ensureTenant(req, res)) {
    return;
  }
  try {
    const activity = await getActivity(req.params.id);
    res.json({ data: activity });
  } catch (error) {
    const { status: status2, message } = resolveHttpError(error, 500, "Unable to fetch activity");
    res.status(status2).json({ message });
  }
}
async function updateActivity2(req, res) {
  if (!ensureTenant(req, res)) {
    return;
  }
  const parsed = activityUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid activity payload", details: parsed.error.flatten() });
    return;
  }
  try {
    const activity = await updateActivity(req.params.id, parsed.data);
    res.json({ data: activity });
  } catch (error) {
    const { status: status2, message } = resolveHttpError(error, 500, "Unable to update activity");
    res.status(status2).json({ message });
  }
}
async function logCall(req, res) {
  if (!ensureTenant(req, res)) {
    return;
  }
  const parsed = callActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid call log payload", details: parsed.error.flatten() });
    return;
  }
  const activity = await logCallActivity(parsed.data);
  res.status(201).json({ data: activity });
}
async function logEmail(req, res) {
  if (!ensureTenant(req, res)) {
    return;
  }
  const parsed = emailActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid email log payload", details: parsed.error.flatten() });
    return;
  }
  const activity = await logEmailActivity(parsed.data);
  res.status(201).json({ data: activity });
}
async function logSms(req, res) {
  if (!ensureTenant(req, res)) {
    return;
  }
  const parsed = smsActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid SMS log payload", details: parsed.error.flatten() });
    return;
  }
  const activity = await logSmsActivity(parsed.data);
  res.status(201).json({ data: activity });
}
async function logNote(req, res) {
  if (!ensureTenant(req, res)) {
    return;
  }
  const parsed = noteActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid note payload", details: parsed.error.flatten() });
    return;
  }
  const activity = await logNoteActivity(parsed.data);
  res.status(201).json({ data: activity });
}

// src/routes/activity.routes.ts
var activityRoles = ["ADMIN", "SALES", "BDC", "SERVICE"];
function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}
var activityRouter = Router3();
activityRouter.get("/", requireRole(...activityRoles), wrap(listActivities2));
activityRouter.post("/", requireRole(...activityRoles), wrap(createActivity2));
activityRouter.get("/:id", requireRole(...activityRoles), wrap(getActivity2));
activityRouter.put("/:id", requireRole(...activityRoles), wrap(updateActivity2));
activityRouter.post("/call", requireRole(...activityRoles), wrap(logCall));
activityRouter.post("/email", requireRole(...activityRoles), wrap(logEmail));
activityRouter.post("/sms", requireRole(...activityRoles), wrap(logSms));
activityRouter.post("/note", requireRole(...activityRoles), wrap(logNote));

// src/routes/communication.routes.ts
import { Router as Router4 } from "express";

// src/validations/communication.validation.ts
import { CommunicationStatus as CommunicationStatus4, CommunicationType as CommunicationType5 } from "@prisma/client";
import { z as z5 } from "zod";
var cuidSchema2 = z5.string().min(1);
var phoneSchema = z5.string().min(5).transform((value) => value.replace(/[^+\d]/g, ""));
var callRequestSchema = z5.object({
  to: phoneSchema,
  from: phoneSchema.optional(),
  leadId: cuidSchema2.optional(),
  customerId: cuidSchema2.optional(),
  userId: cuidSchema2.optional(),
  twimlUrl: z5.string().url().optional(),
  metadata: z5.record(z5.unknown()).optional()
});
var smsRequestSchema = z5.object({
  to: phoneSchema,
  from: phoneSchema.optional(),
  leadId: cuidSchema2.optional(),
  customerId: cuidSchema2.optional(),
  userId: cuidSchema2.optional(),
  body: z5.string().trim().min(1).max(1600),
  mediaUrls: z5.array(z5.string().url()).optional(),
  metadata: z5.record(z5.unknown()).optional()
});
var emailAddressSchema = z5.string().email();
var attachmentSchema = z5.object({
  filename: z5.string().min(1),
  content: z5.string().min(1),
  type: z5.string().optional(),
  disposition: z5.enum(["inline", "attachment"]).optional()
});
var emailRequestSchema = z5.object({
  to: z5.array(emailAddressSchema).nonempty(),
  cc: z5.array(emailAddressSchema).optional(),
  bcc: z5.array(emailAddressSchema).optional(),
  subject: z5.string().trim().min(1).max(255).optional(),
  html: z5.string().trim().optional(),
  text: z5.string().trim().optional(),
  templateId: z5.string().trim().optional(),
  templateData: z5.record(z5.unknown()).optional(),
  attachments: z5.array(attachmentSchema).optional(),
  leadId: cuidSchema2.optional(),
  customerId: cuidSchema2.optional(),
  userId: cuidSchema2.optional(),
  metadata: z5.record(z5.unknown()).optional()
}).refine(
  (value) => {
    if (value.templateId) {
      return Boolean(value.templateData || value.subject || value.html || value.text);
    }
    return Boolean(value.subject && (value.html || value.text));
  },
  {
    message: "Email subject and content are required for ad-hoc emails, or templateId with data for templates.",
    path: ["subject"]
  }
);
var inboxQuerySchema = z5.object({
  page: z5.coerce.number().int().min(1).default(1),
  pageSize: z5.coerce.number().int().min(1).max(100).default(25),
  type: z5.union([z5.nativeEnum(CommunicationType5), z5.array(z5.nativeEnum(CommunicationType5))]).optional(),
  status: z5.union([z5.nativeEnum(CommunicationStatus4), z5.array(z5.nativeEnum(CommunicationStatus4))]).optional(),
  leadId: cuidSchema2.optional(),
  customerId: cuidSchema2.optional(),
  search: z5.string().trim().optional(),
  from: z5.string().optional().transform((value) => value ? new Date(value) : void 0),
  to: z5.string().optional().transform((value) => value ? new Date(value) : void 0)
});
var callLogQuerySchema = inboxQuerySchema.pick({
  page: true,
  pageSize: true,
  leadId: true,
  customerId: true,
  from: true,
  to: true
});

// src/controllers/communication.controller.ts
function ensureTenant2(req, res) {
  const tenantId = req.context?.tenantId;
  if (!tenantId) {
    res.status(403).json({ message: "Tenant scope is required" });
    return void 0;
  }
  return tenantId;
}
function handleServiceError(error, res, defaultMessage) {
  const { status: status2, message } = resolveHttpError(error, 500, defaultMessage);
  res.status(status2).json({ message });
}
async function initiateCall2(req, res) {
  if (!ensureTenant2(req, res)) {
    return;
  }
  const parsed = callRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid call request", details: parsed.error.flatten() });
    return;
  }
  try {
    const result = await initiateCall(parsed.data);
    res.status(201).json({ data: result });
  } catch (error) {
    handleServiceError(error, res, "Unable to initiate call");
  }
}
async function sendSms2(req, res) {
  if (!ensureTenant2(req, res)) {
    return;
  }
  const parsed = smsRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid SMS request", details: parsed.error.flatten() });
    return;
  }
  try {
    const result = await sendSmsMessage(parsed.data);
    res.status(201).json({ data: result });
  } catch (error) {
    handleServiceError(error, res, "Unable to send SMS");
  }
}
async function sendEmail2(req, res) {
  if (!ensureTenant2(req, res)) {
    return;
  }
  const parsed = emailRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid email request", details: parsed.error.flatten() });
    return;
  }
  try {
    const result = await sendEmailMessage(parsed.data);
    res.status(201).json({ data: result });
  } catch (error) {
    handleServiceError(error, res, "Unable to send email");
  }
}
async function getInbox2(req, res) {
  if (!ensureTenant2(req, res)) {
    return;
  }
  const parsed = inboxQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid inbox filters", details: parsed.error.flatten() });
    return;
  }
  const result = await getInbox(parsed.data);
  res.json({ data: result.items, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, pages: result.pages } });
}
async function getCallLogs2(req, res) {
  if (!ensureTenant2(req, res)) {
    return;
  }
  const parsed = callLogQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid call log filters", details: parsed.error.flatten() });
    return;
  }
  const result = await getCallLogs(parsed.data);
  res.json({ data: result.items, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, pages: result.pages } });
}

// src/routes/communication.routes.ts
var communicationRoles = ["ADMIN", "SALES", "BDC", "SERVICE"];
function wrap2(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}
var communicationRouter = Router4();
communicationRouter.post("/call", requireRole(...communicationRoles), wrap2(initiateCall2));
communicationRouter.post("/sms", requireRole(...communicationRoles), wrap2(sendSms2));
communicationRouter.post("/email", requireRole(...communicationRoles), wrap2(sendEmail2));
communicationRouter.get("/inbox", requireRole(...communicationRoles), wrap2(getInbox2));
communicationRouter.get("/call-logs", requireRole(...communicationRoles), wrap2(getCallLogs2));

// src/routes/appointment.routes.ts
import { Router as Router5 } from "express";

// src/validations/appointment.validation.ts
import { AppointmentStatus as AppointmentStatus3, AppointmentType as AppointmentType2 } from "@prisma/client";
import { z as z6 } from "zod";
var appointmentListQuerySchema = z6.object({
  status: z6.nativeEnum(AppointmentStatus3).optional(),
  type: z6.nativeEnum(AppointmentType2).optional(),
  assignedToId: z6.string().min(1).optional(),
  leadId: z6.string().min(1).optional(),
  customerId: z6.string().min(1).optional(),
  vehicleId: z6.string().min(1).optional(),
  from: z6.coerce.date().optional(),
  to: z6.coerce.date().optional(),
  page: z6.coerce.number().int().positive().default(1),
  pageSize: z6.coerce.number().int().positive().max(100).default(20)
}).refine((data) => {
  if (data.from && data.to) {
    return data.to >= data.from;
  }
  return true;
}, { message: "to must be greater than or equal to from", path: ["to"] });
var appointmentCreateSchema = z6.object({
  title: z6.string().min(1),
  notes: z6.string().optional(),
  type: z6.nativeEnum(AppointmentType2),
  status: z6.nativeEnum(AppointmentStatus3).optional(),
  location: z6.string().optional(),
  timeZone: z6.string().min(1).optional(),
  startAt: z6.coerce.date(),
  endAt: z6.coerce.date().optional(),
  leadId: z6.string().min(1).optional(),
  customerId: z6.string().min(1).optional(),
  assignedToId: z6.string().min(1).optional(),
  vehicleId: z6.string().min(1).optional()
}).refine((data) => {
  if (data.endAt) {
    return data.endAt > data.startAt;
  }
  return true;
}, { message: "endAt must be after startAt", path: ["endAt"] });
var appointmentUpdateSchema = z6.object({
  title: z6.string().min(1).optional(),
  notes: z6.string().optional().nullable(),
  type: z6.nativeEnum(AppointmentType2).optional(),
  status: z6.nativeEnum(AppointmentStatus3).optional(),
  location: z6.string().optional().nullable(),
  timeZone: z6.string().min(1).optional(),
  startAt: z6.coerce.date().optional(),
  endAt: z6.coerce.date().optional().nullable(),
  leadId: z6.string().min(1).optional().nullable(),
  customerId: z6.string().min(1).optional().nullable(),
  assignedToId: z6.string().min(1).optional().nullable(),
  vehicleId: z6.string().min(1).optional().nullable()
}).refine((data) => {
  if (data.startAt && data.endAt) {
    return data.endAt > data.startAt;
  }
  return true;
}, { message: "endAt must be after startAt", path: ["endAt"] });
var appointmentCheckInSchema = z6.object({
  timestamp: z6.coerce.date().optional()
});
var appointmentCompleteSchema = z6.object({
  outcome: z6.string().max(2e3).optional(),
  createDeal: z6.boolean().optional()
});
var appointmentNoShowSchema = z6.object({
  note: z6.string().max(2e3).optional()
});

// src/services/appointment.service.ts
import { ActivityStatus as ActivityStatus7, ActivityType as ActivityType7, AppointmentStatus as AppointmentStatus5 } from "@prisma/client";
import { addHours as addHours2, addMinutes as addMinutes2 } from "date-fns";

// src/services/appointment.types.ts
var appointmentInclude = {
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      mobile: true
    }
  },
  lead: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          mobile: true
        }
      }
    }
  },
  assignedTo: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true
    }
  },
  vehicle: {
    select: {
      id: true,
      vin: true,
      stockNumber: true,
      year: true,
      make: true,
      model: true,
      trim: true
    }
  },
  followUpTask: {
    select: {
      id: true,
      status: true,
      subject: true,
      dueAt: true
    }
  }
};

// src/services/appointment.service.ts
init_socket();

// src/queues/appointment.jobs.ts
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import cron from "node-cron";
import { addHours, addMinutes, differenceInMilliseconds } from "date-fns";
import { ActivityStatus as ActivityStatus6, ActivityType as ActivityType6, AppointmentStatus as AppointmentStatus4 } from "@prisma/client";

// src/services/notification.service.ts
function formatDateTime(date, timeZone, options) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
    ...options
  });
  return formatter.format(date);
}
function resolveTimeZone(appointment) {
  return appointment.timeZone ?? "UTC";
}
function buildAppointmentSummary(appointment) {
  const timeZone = resolveTimeZone(appointment);
  const startLabel = formatDateTime(appointment.startAt, timeZone);
  const endLabel = appointment.endAt ? formatDateTime(appointment.endAt, timeZone) : void 0;
  const location = appointment.location ?? "Dealership";
  const vehicle = appointment.vehicle ? [appointment.vehicle.year, appointment.vehicle.make, appointment.vehicle.model, appointment.vehicle.trim].filter((value) => value !== null && value !== void 0 && String(value).length > 0).join(" ") : void 0;
  const customerRecord = appointment.customer ?? appointment.lead?.customer ?? void 0;
  const leadRecord = appointment.lead ?? void 0;
  const customerName = customerRecord ? `${customerRecord.firstName ?? ""} ${customerRecord.lastName ?? ""}`.trim() : leadRecord ? `${leadRecord.firstName ?? ""} ${leadRecord.lastName ?? ""}`.trim() : void 0;
  const salesperson = appointment.assignedTo;
  const salespersonName = salesperson ? `${salesperson.firstName} ${salesperson.lastName}`.trim() : void 0;
  return {
    timeZone,
    startLabel,
    endLabel,
    location,
    vehicle,
    customerName: customerName && customerName.length > 0 ? customerName : "there",
    salespersonName
  };
}
function buildVehicleLine(vehicle) {
  return vehicle ? `<p><strong>Vehicle:</strong> ${vehicle}</p>` : "";
}
function sanitizePhone(value) {
  return normalizePhoneNumber(value);
}
async function sendCustomerReminderEmail(context, offset) {
  const summary = buildAppointmentSummary(context.appointment);
  const greetingName = context.customerName ?? summary.customerName;
  const subject = offset === "24h" ? `Reminder: Your appointment on ${summary.startLabel}` : `Reminder: Your appointment today at ${summary.startLabel}`;
  const html = `
    <p>Hi ${greetingName || "there"},</p>
    <p>This is a reminder about your ${context.appointment.type.toLowerCase().replace(/_/g, " ")} appointment.</p>
    <p><strong>When:</strong> ${summary.startLabel}${summary.endLabel ? ` &ndash; ${summary.endLabel}` : ""}</p>
    <p><strong>Where:</strong> ${summary.location}</p>
    ${buildVehicleLine(context.vehicleLabel ?? summary.vehicle)}
    <p>If you need to reschedule, please reply to this email or call us at your earliest convenience.</p>
    <p>We look forward to seeing you!</p>
  `;
  const text = `Hi ${greetingName || "there"}, this is a reminder about your upcoming appointment on ${summary.startLabel} at ${summary.location}.`;
  await sendEmail({
    to: [context.customerEmail],
    subject,
    html,
    text
  });
}
async function sendCustomerReminderSms(context, offset) {
  const summary = buildAppointmentSummary(context.appointment);
  const greetingName = context.customerName ?? summary.customerName;
  const whenLabel = offset === "24h" ? summary.startLabel : `today at ${summary.startLabel}`;
  const message = `Reminder: ${greetingName || "Hi"}, your appointment is ${whenLabel} at ${summary.location}. Reply if you need to make changes.`;
  await sendSms({ to: sanitizePhone(context.customerPhone), body: message });
}
async function sendSalespersonReminderEmail(context, _offset) {
  const summary = buildAppointmentSummary(context.appointment);
  const greeting = context.salespersonName ?? summary.salespersonName ?? "team";
  const subject = `Upcoming appointment in 30 minutes: ${summary.customerName}`;
  const html = `
    <p>Hi ${greeting},</p>
    <p>This is a heads-up that your appointment with ${summary.customerName} begins at ${summary.startLabel}.</p>
    <p><strong>Location:</strong> ${summary.location}</p>
    ${buildVehicleLine(summary.vehicle)}
    <p>Please ensure the guest is greeted promptly and prepared for their visit.</p>
  `;
  const text = `Reminder: Appointment with ${summary.customerName} at ${summary.startLabel} in ${summary.location}.`;
  await sendEmail({
    to: [context.salespersonEmail],
    subject,
    html,
    text
  });
}
async function sendSalespersonReminderSms(context, _offset) {
  const summary = buildAppointmentSummary(context.appointment);
  const greeting = context.salespersonName ?? summary.salespersonName ?? "Team";
  const message = `${greeting}: appointment with ${summary.customerName} at ${summary.startLabel} (${summary.location}).`;
  await sendSms({ to: sanitizePhone(context.salespersonPhone), body: message });
}
async function sendPostAppointmentSurvey(context) {
  const summary = buildAppointmentSummary(context.appointment);
  const greeting = context.customerName ?? summary.customerName ?? "there";
  const subject = "Thanks for visiting \u2014 how did we do?";
  const html = `
    <p>Hi ${greeting},</p>
    <p>Thank you for taking the time to meet with us on ${summary.startLabel}. We would appreciate your feedback so we can continue improving the experience for our guests.</p>
    <p><a href="${process.env.APP_URL ?? "#"}" target="_blank" rel="noopener">Share your feedback</a></p>
    <p>If you have any follow-up questions, reply to this email and our team will reach out.</p>
  `;
  const text = `Thanks for visiting us on ${summary.startLabel}. We'd love your feedback\u2014reply to this message with any questions.`;
  await sendEmail({
    to: [context.customerEmail],
    subject,
    html,
    text
  });
}

// src/queues/appointment.jobs.ts
var redisUrl = env.REDIS_URL;
var queue;
var fallbackJobs = /* @__PURE__ */ new Map();
var fallbackTask;
var ACTIVE_REMINDER_STATUSES = /* @__PURE__ */ new Set([
  AppointmentStatus4.SCHEDULED,
  AppointmentStatus4.CONFIRMED
]);
function buildJobId(name, data) {
  if (name === "postAppointmentFollowup") {
    return `${data.appointmentId}:post`;
  }
  const reminder = data;
  const channel = name === "sendAppointmentReminderEmail" ? "email" : "sms";
  return `${reminder.appointmentId}:${channel}:${reminder.audience}:${reminder.offset}`;
}
function getDelay(target) {
  const diff = differenceInMilliseconds(target, /* @__PURE__ */ new Date());
  return diff > 0 ? diff : 0;
}
async function loadAppointment(tenantId, appointmentId) {
  return runWithTenant(
    tenantId,
    () => prisma.appointment.findUnique({ where: { id: appointmentId }, include: appointmentInclude })
  );
}
function resolveContactInfo(appointment) {
  const customerRecord = appointment.customer ?? appointment.lead?.customer ?? void 0;
  const leadRecord = appointment.lead ?? void 0;
  const customerName = customerRecord ? `${customerRecord.firstName ?? ""} ${customerRecord.lastName ?? ""}`.trim() : leadRecord ? `${leadRecord.firstName ?? ""} ${leadRecord.lastName ?? ""}`.trim() : void 0;
  const customerEmail = customerRecord?.email ?? leadRecord?.email ?? void 0;
  const customerPhone = customerRecord?.mobile ?? customerRecord?.phone ?? leadRecord?.phone ?? void 0;
  const salesperson = appointment.assignedTo ?? void 0;
  const salespersonName = salesperson ? `${salesperson.firstName} ${salesperson.lastName}`.trim() : void 0;
  const salespersonEmail = salesperson?.email ?? void 0;
  const salespersonPhone = salesperson?.phone ?? void 0;
  const vehicle = appointment.vehicle;
  const vehicleLabel = vehicle ? [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter((value) => value !== null && value !== void 0 && String(value).length > 0).join(" ") : void 0;
  return {
    customerName: customerName && customerName.length > 0 ? customerName : void 0,
    customerEmail,
    customerPhone,
    salespersonName,
    salespersonEmail,
    salespersonPhone,
    vehicleLabel
  };
}
async function handleReminderEmailJob(data) {
  const appointment = await loadAppointment(data.tenantId, data.appointmentId);
  if (!appointment) {
    return;
  }
  const contacts = resolveContactInfo(appointment);
  if (data.audience === "customer") {
    if (data.offset === "30m") {
      return;
    }
    if (!contacts.customerEmail) {
      return;
    }
    await sendCustomerReminderEmail(
      {
        appointment,
        customerEmail: contacts.customerEmail,
        customerName: contacts.customerName,
        vehicleLabel: contacts.vehicleLabel
      },
      data.offset
    );
    return;
  }
  if (data.offset !== "30m") {
    return;
  }
  if (!contacts.salespersonEmail) {
    return;
  }
  await sendSalespersonReminderEmail(
    {
      appointment,
      salespersonEmail: contacts.salespersonEmail,
      salespersonName: contacts.salespersonName
    },
    data.offset
  );
}
async function handleReminderSmsJob(data) {
  const appointment = await loadAppointment(data.tenantId, data.appointmentId);
  if (!appointment) {
    return;
  }
  const contacts = resolveContactInfo(appointment);
  if (data.audience === "customer") {
    if (data.offset === "30m") {
      return;
    }
    if (!contacts.customerPhone) {
      return;
    }
    await sendCustomerReminderSms(
      {
        appointment,
        customerPhone: contacts.customerPhone,
        customerName: contacts.customerName
      },
      data.offset
    );
    return;
  }
  if (data.offset !== "30m") {
    return;
  }
  if (!contacts.salespersonPhone) {
    return;
  }
  await sendSalespersonReminderSms(
    {
      appointment,
      salespersonPhone: contacts.salespersonPhone,
      salespersonName: contacts.salespersonName
    },
    data.offset
  );
}
async function ensureFollowUpTask(tenantId, appointment) {
  if (appointment.followUpTaskId) {
    return;
  }
  const subject = `Follow up on ${appointment.title}`;
  const dueAt = addHours(appointment.endAt ?? addMinutes(appointment.startAt, 60), 24);
  const customerId = appointment.customerId ?? appointment.lead?.customer?.id ?? void 0;
  const activityData = {
    tenantId,
    leadId: appointment.leadId ?? null,
    customerId: customerId ?? null,
    userId: appointment.assignedToId ?? null,
    type: ActivityType6.FOLLOW_UP,
    status: ActivityStatus6.PENDING,
    subject,
    description: "Automated follow-up generated from appointment completion.",
    dueAt
  };
  const activity = await runWithTenant(tenantId, () => prisma.activity.create({ data: activityData }));
  await runWithTenant(
    tenantId,
    () => prisma.appointment.update({
      where: { id: appointment.id },
      data: { followUpTask: { connect: { id: activity.id } } }
    })
  );
}
async function handleFollowupJob(data) {
  const appointment = await loadAppointment(data.tenantId, data.appointmentId);
  if (!appointment) {
    return;
  }
  await ensureFollowUpTask(data.tenantId, appointment);
  if (appointment.status !== AppointmentStatus4.COMPLETED) {
    return;
  }
  const contacts = resolveContactInfo(appointment);
  if (contacts.customerEmail) {
    await sendPostAppointmentSurvey({
      appointment,
      customerEmail: contacts.customerEmail,
      customerName: contacts.customerName
    });
  }
}
async function processAppointmentJob(name, data) {
  if (name === "sendAppointmentReminderEmail") {
    await handleReminderEmailJob(data);
    return;
  }
  if (name === "sendAppointmentReminderSMS") {
    await handleReminderSmsJob(data);
    return;
  }
  if (name === "postAppointmentFollowup") {
    await handleFollowupJob(data);
  }
}
function scheduleFallbackProcessor() {
  if (fallbackTask) {
    return;
  }
  fallbackTask = cron.schedule("* * * * *", async () => {
    const now = /* @__PURE__ */ new Date();
    const dueJobs = Array.from(fallbackJobs.values()).filter((job) => job.runAt <= now);
    for (const job of dueJobs) {
      fallbackJobs.delete(job.id);
      try {
        await processAppointmentJob(job.name, job.data);
      } catch (error) {
        console.error("Failed to execute fallback job", job.name, job.id, error);
      }
    }
  });
}
async function enqueueJob(name, data, runAt) {
  const jobId = buildJobId(name, data);
  if (queue) {
    const options = {
      jobId,
      delay: getDelay(runAt),
      removeOnComplete: true,
      removeOnFail: true
    };
    await queue.add(name, data, options);
    return;
  }
  fallbackJobs.set(jobId, { id: jobId, name, data, runAt });
  scheduleFallbackProcessor();
}
async function removeJob(jobId) {
  if (queue) {
    await queue.remove(jobId).catch(() => void 0);
    return;
  }
  fallbackJobs.delete(jobId);
}
async function scheduleReminderJobs(appointment) {
  if (!ACTIVE_REMINDER_STATUSES.has(appointment.status)) {
    return;
  }
  const now = /* @__PURE__ */ new Date();
  if (appointment.startAt <= now) {
    return;
  }
  const contacts = resolveContactInfo(appointment);
  const startAt = appointment.startAt;
  if (contacts.customerEmail) {
    const runAt = addHours(startAt, -24);
    if (runAt > now) {
      await enqueueJob(
        "sendAppointmentReminderEmail",
        { appointmentId: appointment.id, tenantId: appointment.tenantId, audience: "customer", offset: "24h" },
        runAt
      );
    }
  }
  if (contacts.customerPhone) {
    const runAt = addHours(startAt, -2);
    if (runAt > now) {
      await enqueueJob(
        "sendAppointmentReminderSMS",
        { appointmentId: appointment.id, tenantId: appointment.tenantId, audience: "customer", offset: "2h" },
        runAt
      );
    }
  }
  if (contacts.salespersonEmail) {
    const runAt = addMinutes(startAt, -30);
    if (runAt > now) {
      await enqueueJob(
        "sendAppointmentReminderEmail",
        { appointmentId: appointment.id, tenantId: appointment.tenantId, audience: "sales", offset: "30m" },
        runAt
      );
    }
  }
  if (contacts.salespersonPhone) {
    const runAt = addMinutes(startAt, -30);
    if (runAt > now) {
      await enqueueJob(
        "sendAppointmentReminderSMS",
        { appointmentId: appointment.id, tenantId: appointment.tenantId, audience: "sales", offset: "30m" },
        runAt
      );
    }
  }
}
async function scheduleFollowupJob(appointment) {
  if (appointment.status === AppointmentStatus4.CANCELLED) {
    return;
  }
  const now = /* @__PURE__ */ new Date();
  const baseEnd = appointment.endAt ?? addMinutes(appointment.startAt, 60);
  const runAt = addMinutes(baseEnd, 15);
  if (runAt <= now) {
    await processAppointmentJob("postAppointmentFollowup", {
      appointmentId: appointment.id,
      tenantId: appointment.tenantId,
      runAfter: now.toISOString()
    });
    return;
  }
  await enqueueJob(
    "postAppointmentFollowup",
    { appointmentId: appointment.id, tenantId: appointment.tenantId, runAfter: runAt.toISOString() },
    runAt
  );
}
async function cancelReminderJobs(appointmentId) {
  const prefixes = ["email:customer:24h", "sms:customer:2h", "email:sales:30m", "sms:sales:30m"];
  const removals = prefixes.map((prefix) => removeJob(`${appointmentId}:${prefix}`));
  await Promise.all(removals);
}
async function cancelFollowupJob(appointmentId) {
  await removeJob(`${appointmentId}:post`);
}
async function scheduleAppointmentJobs(appointment, options = {}) {
  const { reminders = true, followUp = true } = options;
  if (reminders) {
    await cancelReminderJobs(appointment.id);
    await scheduleReminderJobs(appointment);
  }
  if (followUp) {
    await cancelFollowupJob(appointment.id);
    await scheduleFollowupJob(appointment);
  }
}
async function cancelAppointmentJobs(appointmentId, options = {}) {
  const { reminders = true, followUp = true } = options;
  const operations = [];
  if (reminders) {
    operations.push(cancelReminderJobs(appointmentId));
  }
  if (followUp) {
    operations.push(cancelFollowupJob(appointmentId));
  }
  await Promise.all(operations);
}

// src/services/appointment.service.ts
var ACTIVE_CONFLICT_STATUSES = [
  AppointmentStatus5.SCHEDULED,
  AppointmentStatus5.CONFIRMED,
  AppointmentStatus5.IN_PROGRESS
];
async function dispatchAppointmentAutomation(trigger, appointment, occurredAt) {
  const leadId = appointment.lead?.id ?? appointment.leadId ?? void 0;
  const customerId = appointment.customer?.id ?? appointment.customerId ?? void 0;
  const eventTime = occurredAt ?? appointment.startAt ?? /* @__PURE__ */ new Date();
  try {
    await triggerAutomations(trigger, {
      appointmentId: appointment.id,
      leadId: leadId ?? void 0,
      customerId: customerId ?? void 0,
      occurredAt: eventTime
    });
  } catch (error) {
    console.error(`Failed to trigger ${trigger} automations`, error);
  }
}
function requireTenantId4() {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw Object.assign(new Error("Tenant context is required"), { status: 403 });
  }
  return tenantId;
}
function createHttpError(status2, message) {
  return Object.assign(new Error(message), { status: status2 });
}
function validateInitialStatus(status2) {
  if (status2 !== AppointmentStatus5.SCHEDULED && status2 !== AppointmentStatus5.CONFIRMED) {
    throw createHttpError(400, "New appointments can only start in SCHEDULED or CONFIRMED status");
  }
}
function assertStatusTransition(current, next) {
  if (current === next) {
    return;
  }
  switch (current) {
    case AppointmentStatus5.SCHEDULED:
      if (next === AppointmentStatus5.CONFIRMED || next === AppointmentStatus5.CANCELLED) {
        return;
      }
      break;
    case AppointmentStatus5.CONFIRMED:
      if (next === AppointmentStatus5.SCHEDULED || next === AppointmentStatus5.IN_PROGRESS || next === AppointmentStatus5.CANCELLED) {
        return;
      }
      break;
    case AppointmentStatus5.IN_PROGRESS:
      if (next === AppointmentStatus5.COMPLETED || next === AppointmentStatus5.CANCELLED || next === AppointmentStatus5.NO_SHOW) {
        return;
      }
      break;
    default:
      break;
  }
  throw createHttpError(400, `Cannot transition appointment from ${current} to ${next}`);
}
function buildListFilters(query) {
  const where = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.assignedToId) {
    where.assignedToId = query.assignedToId;
  }
  if (query.leadId) {
    where.leadId = query.leadId;
  }
  if (query.customerId) {
    where.customerId = query.customerId;
  }
  if (query.vehicleId) {
    where.vehicleId = query.vehicleId;
  }
  if (query.from || query.to) {
    where.startAt = {};
    if (query.from) {
      where.startAt.gte = query.from;
    }
    if (query.to) {
      where.startAt.lte = query.to;
    }
  }
  return where;
}
async function ensureAvailability(input) {
  const effectiveEnd = input.endAt ?? addMinutes2(input.startAt, 60);
  const checkResource = async (field, value) => {
    if (!value) {
      return;
    }
    const existing = await prisma.appointment.findMany({
      where: {
        id: input.excludeId ? { not: input.excludeId } : void 0,
        status: { in: ACTIVE_CONFLICT_STATUSES },
        [field]: value,
        startAt: { lt: effectiveEnd }
      },
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true
      }
    });
    for (const appointment of existing) {
      const existingEnd = appointment.endAt ?? addMinutes2(appointment.startAt, 60);
      if (existingEnd > input.startAt) {
        const label = field === "assignedToId" ? "assignee" : "resource";
        throw createHttpError(
          409,
          `The selected ${label} already has an appointment (${appointment.title}) overlapping this time.`
        );
      }
    }
  };
  await Promise.all([checkResource("assignedToId", input.assignedToId), checkResource("vehicleId", input.vehicleId)]);
}
async function listAppointments(query) {
  requireTenantId4();
  const where = buildListFilters(query);
  const skip = (query.page - 1) * query.pageSize;
  const take = query.pageSize;
  const [items, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      orderBy: { startAt: "asc" },
      skip,
      take,
      include: appointmentInclude
    }),
    prisma.appointment.count({ where })
  ]);
  const pages = Math.ceil(total / query.pageSize) || 1;
  return { items, total, page: query.page, pageSize: query.pageSize, pages };
}
async function getAppointment(id) {
  requireTenantId4();
  const appointment = await prisma.appointment.findUnique({ where: { id }, include: appointmentInclude });
  if (!appointment) {
    throw createHttpError(404, "Appointment not found");
  }
  return appointment;
}
async function createAppointment(input) {
  const tenantId = requireTenantId4();
  const status2 = input.status ?? AppointmentStatus5.SCHEDULED;
  validateInitialStatus(status2);
  await ensureAvailability({
    assignedToId: input.assignedToId,
    vehicleId: input.vehicleId,
    startAt: input.startAt,
    endAt: input.endAt
  });
  const appointment = await prisma.appointment.create({
    data: {
      title: input.title,
      notes: input.notes ?? void 0,
      type: input.type,
      status: status2,
      location: input.location ?? void 0,
      timeZone: input.timeZone ?? "UTC",
      startAt: input.startAt,
      endAt: input.endAt ?? void 0,
      lead: input.leadId ? { connect: { id: input.leadId } } : void 0,
      customer: input.customerId ? { connect: { id: input.customerId } } : void 0,
      assignedTo: input.assignedToId ? { connect: { id: input.assignedToId } } : void 0,
      vehicle: input.vehicleId ? { connect: { id: input.vehicleId } } : void 0,
      tenant: { connect: { id: tenantId } }
    },
    include: appointmentInclude
  });
  await scheduleAppointmentJobs(appointment);
  emitTenantEvent(tenantId, "appointment:created", { appointment });
  await dispatchAppointmentAutomation("APPOINTMENT_CREATED", appointment, appointment.startAt);
  return appointment;
}
async function updateAppointment(id, input) {
  const tenantId = requireTenantId4();
  const existing = await getAppointment(id);
  if (input.status) {
    assertStatusTransition(existing.status, input.status);
  }
  const startAt = input.startAt ?? existing.startAt;
  const endAt = input.endAt === null ? null : input.endAt ?? existing.endAt;
  const assignedToId = input.assignedToId === null ? null : input.assignedToId ?? existing.assignedToId;
  const vehicleId = input.vehicleId === null ? null : input.vehicleId ?? existing.vehicleId;
  await ensureAvailability({
    assignedToId,
    vehicleId,
    startAt,
    endAt,
    excludeId: id
  });
  const data = {
    title: input.title,
    notes: input.notes === null ? null : input.notes,
    type: input.type,
    status: input.status,
    location: input.location === null ? null : input.location,
    timeZone: input.timeZone,
    startAt: input.startAt,
    endAt: input.endAt === null ? null : input.endAt,
    lead: input.leadId === null ? { disconnect: true } : input.leadId ? { connect: { id: input.leadId } } : void 0,
    customer: input.customerId === null ? { disconnect: true } : input.customerId ? { connect: { id: input.customerId } } : void 0,
    assignedTo: input.assignedToId === null ? { disconnect: true } : input.assignedToId ? { connect: { id: input.assignedToId } } : void 0,
    vehicle: input.vehicleId === null ? { disconnect: true } : input.vehicleId ? { connect: { id: input.vehicleId } } : void 0
  };
  const appointment = await prisma.appointment.update({
    where: { id },
    data,
    include: appointmentInclude
  });
  if (input.status === AppointmentStatus5.CANCELLED || input.status === AppointmentStatus5.NO_SHOW || input.status === AppointmentStatus5.COMPLETED) {
    await cancelAppointmentJobs(appointment.id);
    if (input.status === AppointmentStatus5.COMPLETED) {
      await scheduleAppointmentJobs(appointment, { reminders: false, followUp: true });
    }
  } else {
    const shouldReschedule = Boolean(input.startAt) || input.endAt !== void 0 || input.assignedToId !== void 0 || input.vehicleId !== void 0 || input.status !== void 0;
    if (shouldReschedule) {
      await scheduleAppointmentJobs(appointment);
    }
  }
  emitTenantEvent(tenantId, "appointment:updated", { appointment });
  if (input.status && input.status !== existing.status) {
    if (appointment.status === AppointmentStatus5.COMPLETED) {
      await dispatchAppointmentAutomation(
        "APPOINTMENT_COMPLETED",
        appointment,
        appointment.completedAt ?? /* @__PURE__ */ new Date()
      );
    } else if (appointment.status === AppointmentStatus5.NO_SHOW) {
      await dispatchAppointmentAutomation(
        "APPOINTMENT_NO_SHOW",
        appointment,
        appointment.noShowAt ?? /* @__PURE__ */ new Date()
      );
    }
  }
  return appointment;
}
async function deleteAppointment(id) {
  const tenantId = requireTenantId4();
  await cancelAppointmentJobs(id);
  await prisma.appointment.delete({ where: { id } });
  emitTenantEvent(tenantId, "appointment:deleted", { id });
}
async function checkInAppointment(id, input) {
  const tenantId = requireTenantId4();
  const appointment = await getAppointment(id);
  if (appointment.status !== AppointmentStatus5.SCHEDULED && appointment.status !== AppointmentStatus5.CONFIRMED && appointment.status !== AppointmentStatus5.IN_PROGRESS) {
    throw createHttpError(400, "Only scheduled or confirmed appointments can be checked in");
  }
  const timestamp = input.timestamp ?? /* @__PURE__ */ new Date();
  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus5.IN_PROGRESS,
      checkedInAt: timestamp
    },
    include: appointmentInclude
  });
  await cancelAppointmentJobs(id, { reminders: true, followUp: false });
  await scheduleAppointmentJobs(updated, { reminders: false, followUp: true });
  emitTenantEvent(tenantId, "appointment:status", { appointment: updated });
  return updated;
}
async function completeAppointment(id, input) {
  const tenantId = requireTenantId4();
  const appointment = await getAppointment(id);
  if (appointment.status !== AppointmentStatus5.IN_PROGRESS && appointment.status !== AppointmentStatus5.CONFIRMED) {
    throw createHttpError(400, "Only in-progress or confirmed appointments can be completed");
  }
  const completedAt = /* @__PURE__ */ new Date();
  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus5.COMPLETED,
      completedAt,
      outcome: input.outcome
    },
    include: appointmentInclude
  });
  await cancelAppointmentJobs(id, { reminders: true, followUp: true });
  await scheduleAppointmentJobs(updated, { reminders: false, followUp: true });
  if (input.createDeal) {
    const taskData = {
      tenantId,
      leadId: updated.leadId ?? null,
      customerId: updated.customerId ?? null,
      userId: updated.assignedToId ?? null,
      type: ActivityType7.TASK,
      status: ActivityStatus7.PENDING,
      subject: `Prepare deal for ${updated.title}`,
      description: "Generated automatically from appointment completion.",
      dueAt: addHours2(completedAt, 4)
    };
    await prisma.activity.create({ data: taskData });
  }
  emitTenantEvent(tenantId, "appointment:status", { appointment: updated });
  await dispatchAppointmentAutomation("APPOINTMENT_COMPLETED", updated, updated.completedAt ?? completedAt);
  return updated;
}
async function markAppointmentNoShow(id, _input) {
  const tenantId = requireTenantId4();
  const appointment = await getAppointment(id);
  if (appointment.status !== AppointmentStatus5.SCHEDULED && appointment.status !== AppointmentStatus5.CONFIRMED && appointment.status !== AppointmentStatus5.IN_PROGRESS) {
    throw createHttpError(400, "Only upcoming appointments can be marked as no-show");
  }
  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus5.NO_SHOW,
      noShowAt: /* @__PURE__ */ new Date()
    },
    include: appointmentInclude
  });
  await cancelAppointmentJobs(id, { reminders: true, followUp: true });
  await scheduleAppointmentJobs(updated, { reminders: false, followUp: true });
  emitTenantEvent(tenantId, "appointment:status", { appointment: updated });
  await dispatchAppointmentAutomation("APPOINTMENT_NO_SHOW", updated, updated.noShowAt ?? /* @__PURE__ */ new Date());
  return updated;
}

// src/controllers/appointment.controller.ts
function ensureTenant3(req, res) {
  const tenantId = req.context?.tenantId;
  if (!tenantId) {
    res.status(403).json({ message: "Tenant scope is required" });
    return void 0;
  }
  return tenantId;
}
var DEFAULT_ERROR_MESSAGE = "Unexpected error";
function extractError(error) {
  return resolveHttpError(error, 500, DEFAULT_ERROR_MESSAGE);
}
async function listAppointments2(req, res) {
  if (!ensureTenant3(req, res)) {
    return;
  }
  const parsed = appointmentListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid appointment filters", details: parsed.error.flatten() });
    return;
  }
  try {
    const result = await listAppointments(parsed.data);
    res.json({
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        pages: result.pages
      }
    });
  } catch (error) {
    const { status: status2, message } = extractError(error);
    res.status(status2).json({ message });
  }
}
async function createAppointment2(req, res) {
  if (!ensureTenant3(req, res)) {
    return;
  }
  const parsed = appointmentCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid appointment payload", details: parsed.error.flatten() });
    return;
  }
  try {
    const appointment = await createAppointment(parsed.data);
    res.status(201).json({ data: appointment });
  } catch (error) {
    const { status: status2, message } = extractError(error);
    res.status(status2).json({ message });
  }
}
async function getAppointment2(req, res) {
  if (!ensureTenant3(req, res)) {
    return;
  }
  try {
    const appointment = await getAppointment(req.params.id);
    res.json({ data: appointment });
  } catch (error) {
    const { status: status2, message } = extractError(error);
    res.status(status2).json({ message });
  }
}
async function updateAppointment2(req, res) {
  if (!ensureTenant3(req, res)) {
    return;
  }
  const parsed = appointmentUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid appointment payload", details: parsed.error.flatten() });
    return;
  }
  try {
    const appointment = await updateAppointment(req.params.id, parsed.data);
    res.json({ data: appointment });
  } catch (error) {
    const { status: status2, message } = extractError(error);
    res.status(status2).json({ message });
  }
}
async function deleteAppointment2(req, res) {
  if (!ensureTenant3(req, res)) {
    return;
  }
  try {
    await deleteAppointment(req.params.id);
    res.status(204).send();
  } catch (error) {
    const { status: status2, message } = extractError(error);
    res.status(status2).json({ message });
  }
}
async function checkInAppointment2(req, res) {
  if (!ensureTenant3(req, res)) {
    return;
  }
  const parsed = appointmentCheckInSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid check-in payload", details: parsed.error.flatten() });
    return;
  }
  try {
    const appointment = await checkInAppointment(req.params.id, parsed.data);
    res.json({ data: appointment });
  } catch (error) {
    const { status: status2, message } = extractError(error);
    res.status(status2).json({ message });
  }
}
async function completeAppointment2(req, res) {
  if (!ensureTenant3(req, res)) {
    return;
  }
  const parsed = appointmentCompleteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid completion payload", details: parsed.error.flatten() });
    return;
  }
  try {
    const appointment = await completeAppointment(req.params.id, parsed.data);
    res.json({ data: appointment });
  } catch (error) {
    const { status: status2, message } = extractError(error);
    res.status(status2).json({ message });
  }
}
async function markAppointmentNoShow2(req, res) {
  if (!ensureTenant3(req, res)) {
    return;
  }
  const parsed = appointmentNoShowSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid no-show payload", details: parsed.error.flatten() });
    return;
  }
  try {
    const appointment = await markAppointmentNoShow(req.params.id, parsed.data);
    res.json({ data: appointment });
  } catch (error) {
    const { status: status2, message } = extractError(error);
    res.status(status2).json({ message });
  }
}

// src/routes/appointment.routes.ts
var appointmentRouter = Router5();
appointmentRouter.get("/", listAppointments2);
appointmentRouter.post("/", createAppointment2);
appointmentRouter.get("/:id", getAppointment2);
appointmentRouter.put("/:id", updateAppointment2);
appointmentRouter.delete("/:id", deleteAppointment2);
appointmentRouter.post("/:id/check-in", checkInAppointment2);
appointmentRouter.post("/:id/complete", completeAppointment2);
appointmentRouter.post("/:id/no-show", markAppointmentNoShow2);

// src/routes/automation.routes.ts
import { Router as Router6 } from "express";
var automationRoles = ["ADMIN", "BDC"];
function wrap3(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}
var automationRouter = Router6();
automationRouter.get("/", requireRole(...automationRoles), wrap3(async (req, res) => {
  const data = await listAutomations();
  res.json({ data });
}));
automationRouter.post("/", requireRole(...automationRoles), wrap3(async (req, res) => {
  const automation = await createAutomation(req.body);
  res.status(201).json({ data: automation });
}));
automationRouter.post("/execute", requireRole(...automationRoles), wrap3(async (req, res) => {
  const results = await executeAutomation(req.body);
  res.json({ data: results });
}));
automationRouter.post("/:id/toggle", requireRole(...automationRoles), wrap3(async (req, res) => {
  const automation = await toggleAutomation(req.params.id, req.body);
  res.json({ data: automation });
}));
automationRouter.put("/:id", requireRole(...automationRoles), wrap3(async (req, res) => {
  const automation = await updateAutomation(req.params.id, req.body);
  res.json({ data: automation });
}));

// src/routes/ml.routes.ts
import { Router as Router7 } from "express";
var allowedRoles2 = ["ADMIN", "BDC", "SALES"];
var mlRouter = Router7();
mlRouter.post("/next-action", requireRole(...allowedRoles2), async (req, res, next) => {
  const requestId = resolveRequestId(req);
  res.setHeader("X-Request-Id", requestId);
  try {
    const { leadId, prompt, channel } = req.body ?? {};
    if (!leadId || typeof leadId !== "string") {
      return res.status(400).json({ message: "leadId is required" });
    }
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ message: "prompt is required" });
    }
    const insights = await buildLeadInsights(leadId);
    const response = await mlService.nextAction({
      leadId,
      prompt,
      channel,
      context: insights,
      requestId
    });
    res.setHeader("X-Request-Id", response.requestId);
    res.json({
      data: response,
      requestId: response.requestId,
      insights: {
        metadata: insights.metadata,
        activities: insights.activities,
        timetable: insights.timetable,
        budgetSignals: insights.budgetSignals,
        similarity: insights.similarity
      }
    });
  } catch (error) {
    if (error instanceof LeadNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});
mlRouter.post("/sentiment-analysis", requireRole(...allowedRoles2), async (req, res, next) => {
  const requestId = resolveRequestId(req);
  res.setHeader("X-Request-Id", requestId);
  try {
    const { text, messages } = req.body ?? {};
    const normalizedMessages = Array.isArray(messages) ? messages.filter((message) => message && typeof message.text === "string" && message.text.trim().length > 0).map((message) => ({
      speaker: typeof message.speaker === "string" ? message.speaker : "unknown",
      text: message.text,
      timestamp: typeof message.timestamp === "string" ? message.timestamp : void 0
    })) : void 0;
    if ((!text || typeof text !== "string" || text.trim().length === 0) && (!normalizedMessages || normalizedMessages.length === 0)) {
      return res.status(400).json({ message: "text or messages are required for sentiment analysis" });
    }
    const payload = {
      text: typeof text === "string" && text.trim().length > 0 ? text : void 0,
      messages: normalizedMessages,
      requestId,
      tenantId: req.context?.tenantId
    };
    const response = await mlService.sentimentAnalysis(payload);
    res.setHeader("X-Request-Id", response.requestId);
    res.json({ data: response, requestId: response.requestId });
  } catch (error) {
    next(error);
  }
});
mlRouter.get("/close-probability", requireRole(...allowedRoles2), async (req, res, next) => {
  const requestId = resolveRequestId(req);
  res.setHeader("X-Request-Id", requestId);
  try {
    const { leadId } = req.query;
    if (!leadId || typeof leadId !== "string") {
      return res.status(400).json({ message: "leadId query parameter is required" });
    }
    const result = await fetchCloseProbability(leadId, requestId);
    res.setHeader("X-Request-Id", result.requestId);
    res.json({
      data: { probability: result.probability, horizonDays: result.horizonDays },
      requestId: result.requestId,
      insights: {
        derivedEngagementScore: result.insights.derivedEngagementScore,
        timetable: result.insights.timetable,
        similarity: result.insights.similarity
      }
    });
  } catch (error) {
    if (error instanceof LeadNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

// src/routes/fi/index.ts
import { Router as Router9 } from "express";

// src/routes/fi/compliance.routes.ts
import { Router as Router8 } from "express";

// src/fi/compliance.service.ts
import { Prisma as Prisma9 } from "@prisma/client";
import PDFDocument from "pdfkit";

// src/lib/storage/s3.ts
import { DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import net from "net";
function assertS3Config() {
  if (!env.S3_BUCKET || !env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("S3 storage is not configured. Missing credentials or bucket configuration.");
  }
}
function createClient() {
  assertS3Config();
  const config2 = {
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
  };
  if (env.S3_ENDPOINT) {
    config2.endpoint = env.S3_ENDPOINT;
    config2.forcePathStyle = true;
  }
  return new S3Client(config2);
}
var client = null;
function getClient2() {
  if (!client) {
    client = createClient();
  }
  return client;
}
function buildComplianceDocumentKey(options) {
  const sanitizedType = options.documentType.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const sanitizedName = options.fileName.trim().toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  return ["deal-jackets", options.tenantId, options.dealId, "compliance", `${Date.now()}-${sanitizedType}-${sanitizedName}`].filter(Boolean).join("/");
}
function resolvePublicUrl(key) {
  if (env.S3_CLOUDFRONT_URL) {
    return `${env.S3_CLOUDFRONT_URL.replace(/\/$/, "")}/${key}`;
  }
  return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}
async function uploadBufferToS3({
  key,
  body,
  contentType,
  metadata
}) {
  const uploader = new Upload({
    client: getClient2(),
    params: {
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata
    }
  });
  await uploader.done();
  return {
    key,
    url: resolvePublicUrl(key)
  };
}
async function runVirusScan(buffer) {
  const host = env.CLAMAV_HOST;
  if (!host) {
    return { clean: true };
  }
  const port = env.CLAMAV_PORT ?? 3310;
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.write("zINSTREAM\0");
      const chunkSize = 64 * 1024;
      for (let offset = 0; offset < buffer.length; offset += chunkSize) {
        const chunk = buffer.subarray(offset, Math.min(buffer.length, offset + chunkSize));
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length, 0);
        socket.write(size);
        socket.write(chunk);
      }
      const zero = Buffer.alloc(4);
      zero.writeUInt32BE(0, 0);
      socket.write(zero);
    });
    let response = "";
    socket.on("data", (data) => {
      response += data.toString();
    });
    socket.on("end", () => {
      if (response.includes("FOUND")) {
        resolve({ clean: false, signature: response.trim() });
      } else {
        resolve({ clean: true });
      }
    });
    socket.on("error", (error) => {
      reject(error);
    });
  });
}

// src/fi/compliance.service.ts
var DealNotFoundError = class extends Error {
  status = 404;
  constructor(message) {
    super(message);
    this.name = "DealNotFoundError";
  }
};
var DocumentGenerationError = class extends Error {
  status = 500;
  constructor(message) {
    super(message);
    this.name = "DocumentGenerationError";
  }
};
var DOCUMENT_ITEM_MAP = {
  "buyers-guide": {
    group: "federal",
    itemId: "federal-buyers-guide",
    title: "FTC Buyer\u2019s Guide",
    fileName: "buyers-guide.pdf"
  },
  tila: {
    group: "federal",
    itemId: "federal-tila-disclosure",
    title: "Truth in Lending Disclosure",
    fileName: "tila-disclosure.pdf"
  }
};
var FEDERAL_RULES = [
  {
    id: "federal-buyers-guide",
    title: "FTC Buyer\u2019s Guide",
    description: "Provide Buyer\u2019s Guide window form per FTC Used Car Rule (16 CFR 455).",
    statute: "FTC 16 CFR 455",
    autoGenerateType: "buyers-guide"
  },
  {
    id: "federal-tila-disclosure",
    title: "Truth in Lending (Reg Z)",
    description: "Deliver Truth in Lending Act disclosures including APR, finance charge, and payment schedule.",
    statute: "15 U.S.C. \xA71601 et seq.",
    autoGenerateType: "tila"
  },
  {
    id: "federal-ecoa-tracking",
    title: "ECOA Adverse Action Log",
    description: "Maintain adverse action tracking and notices under Equal Credit Opportunity Act.",
    statute: "12 CFR 1002 (Regulation B)"
  },
  {
    id: "federal-fcra-privacy",
    title: "FCRA Privacy Notice",
    description: "Provide Fair Credit Reporting Act disclosures and obtain permissible purpose certifications.",
    statute: "15 U.S.C. \xA71681"
  },
  {
    id: "federal-glba-privacy",
    title: "GLBA Privacy & Safeguards",
    description: "Deliver Gramm-Leach-Bliley privacy notice and document Safeguards Rule compliance.",
    statute: "16 CFR 314"
  },
  {
    id: "federal-odometer",
    title: "Odometer Disclosure",
    description: "Complete odometer statement for transfers exceeding 16,000 pounds or under 10 model years.",
    statute: "49 CFR 580"
  },
  {
    id: "federal-red-flags",
    title: "Red Flags Identity Verification",
    description: "Document Red Flags Rule identity verification and resolution steps.",
    statute: "16 CFR 681"
  }
];
var STATE_REQUIREMENTS = {
  CA: {
    label: "California",
    requirements: [
      {
        id: "ca-reg-262",
        title: "REG 262 Transfer Disclosure",
        description: "Complete REG 262 (Vehicle/Vessel Transfer and Reassignment Form) for title transfer.",
        statute: "CA DMV Handbook \xA76.080"
      },
      {
        id: "ca-smog-cert",
        title: "Smog Certification or Exemption",
        description: "Provide proof of smog certification or exemption for vehicles older than four model-years.",
        statute: "California Health & Safety Code \xA744015"
      },
      {
        id: "ca-bhp-hfa",
        title: "BHPH Fairness & Affirmation",
        description: "Document Buy-Here-Pay-Here disclosure of payment terms and GPS disclosures.",
        statute: "California Civil Code \xA72982.7"
      }
    ]
  },
  TX: {
    label: "Texas",
    requirements: [
      {
        id: "tx-form-130u",
        title: "Form 130-U Application for Texas Title",
        description: "Ensure Form 130-U is fully executed with supporting ownership documents.",
        statute: "Texas Administrative Code \xA7217.25"
      },
      {
        id: "tx-spot-delivery",
        title: "Spot Delivery Conditional Notice",
        description: "Provide conditional delivery disclosure for pending financing approvals.",
        statute: "Texas Finance Code \xA7348.1015"
      },
      {
        id: "tx-vit-statement",
        title: "Vehicle Inventory Tax Statement",
        description: "Collect buyer acknowledgement of vehicle inventory tax on sales price.",
        statute: "Texas Tax Code \xA723.121"
      }
    ]
  },
  FL: {
    label: "Florida",
    requirements: [
      {
        id: "fl-hsmv-82040",
        title: "HSMV 82040 Title Application",
        description: "File HSMV 82040 Application for Certificate of Title with/without registration.",
        statute: "Florida Statutes \xA7319.23"
      },
      {
        id: "fl-temp-tag-log",
        title: "Temporary Tag Issuance Log",
        description: "Log issuance of temporary tags and provide buyer receipt.",
        statute: "Florida Statutes \xA7320.131"
      },
      {
        id: "fl-english-spanish",
        title: "Bilingual Retail Installment Contract",
        description: "Provide English/Spanish TILA disclosures when sale is negotiated in Spanish.",
        statute: "Florida Statutes \xA7520.07"
      }
    ]
  }
};
var DEFAULT_STATE_REQUIREMENTS = {
  label: "General State Compliance",
  requirements: [
    {
      id: "state-temp-tag",
      title: "Temporary Tag Compliance",
      description: "Verify temporary tag issuance log, expiration, and buyer acknowledgement.",
      statute: "State DMV Regulations"
    },
    {
      id: "state-tax-fees",
      title: "Tax & Fee Disclosure",
      description: "Provide state-specific tax, title, and registration fee disclosure summary.",
      statute: "State Revenue Code"
    },
    {
      id: "state-contract-language",
      title: "State Contract Addenda",
      description: "Attach any required state addenda, arbitration disclosures, or cooling-off notices.",
      statute: "State Consumer Protection Statutes"
    }
  ]
};
var INTERNAL_REQUIREMENTS = [
  {
    id: "internal-deal-review",
    title: "Desk Manager Deal Review",
    description: "Desk manager review of deal structure, stipulations, and gross profit allocation."
  },
  {
    id: "internal-product-audit",
    title: "F&I Product Enrollment Audit",
    description: "Confirm all sold F&I products have signed contracts, warranty registrations, and remittance notes."
  },
  {
    id: "internal-safeguards",
    title: "Safeguards & Privacy Checklist",
    description: "Validate secure handling of credit apps, driver\u2019s licenses, and contract packages per GLBA Safeguards."
  },
  {
    id: "internal-stip-tracking",
    title: "Funding Stipulation Tracker",
    description: "Confirm lender stipulations are logged, assigned, and tracked for completion before funding."
  }
];
function resolveStateRegistry(state) {
  const normalized = state.toUpperCase();
  return STATE_REQUIREMENTS[normalized] ?? DEFAULT_STATE_REQUIREMENTS;
}
function buildVehicleDescription(deal) {
  const { vehicle } = deal;
  const parts = [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Vehicle TBD";
}
function deriveStateFromDeal(deal) {
  const customer = deal.customer;
  const state = customer?.addressState || customer?.licenseState;
  return state ? state.toUpperCase() : "GENERAL";
}
function decimalToNumber(value) {
  if (value === null || value === void 0) {
    return null;
  }
  if (value instanceof Prisma9.Decimal) {
    return Number(value.toString());
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
function formatCurrency(value) {
  const numeric = decimalToNumber(value);
  if (numeric === null) {
    return "\u2014";
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numeric);
}
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function buildFederalBaseline() {
  return FEDERAL_RULES.map((rule) => ({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    statute: rule.statute,
    required: true,
    completed: false,
    completedAt: null,
    source: "federal",
    autoGenerateType: rule.autoGenerateType
  }));
}
function buildStateBaseline(state) {
  const registry = resolveStateRegistry(state);
  return registry.requirements.map((rule) => ({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    statute: rule.statute,
    required: true,
    completed: false,
    completedAt: null,
    source: "state"
  }));
}
function buildInternalBaseline() {
  return INTERNAL_REQUIREMENTS.map((rule) => ({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    required: true,
    completed: false,
    completedAt: null,
    source: "internal"
  }));
}
function normalizeStipulationId(index, rawId) {
  if (typeof rawId === "string" && rawId.trim().length > 0) {
    return rawId.trim();
  }
  return `lender-stip-${index + 1}`;
}
function buildLenderBaseline(submission) {
  const stipulations = submission?.stipulations;
  const items = [];
  if (Array.isArray(stipulations)) {
    stipulations.forEach((entry, index) => {
      if (!entry) return;
      if (typeof entry === "string") {
        items.push({
          id: normalizeStipulationId(index, entry),
          title: entry,
          description: "Complete lender requested stipulation.",
          required: true,
          completed: false,
          completedAt: null,
          source: "lender"
        });
        return;
      }
      if (typeof entry === "object") {
        const typed = entry;
        const id = normalizeStipulationId(index, typed.id ?? typed.code);
        const status2 = String(typed.status ?? "").toUpperCase();
        const description = typeof typed.description === "string" ? typed.description : typeof typed.title === "string" ? typed.title : "Complete lender stipulation.";
        const required = status2 === "WAIVED" ? false : true;
        const completed = ["SATISFIED", "RECEIVED", "COMPLETE", "FULFILLED"].includes(status2);
        items.push({
          id,
          title: description,
          description: typeof typed.notes === "string" && typed.notes.trim().length > 0 ? typed.notes : "Lender requested supporting document or action.",
          required,
          completed,
          completedAt: completed ? nowIso() : null,
          source: "lender",
          dueDate: typeof typed.dueDate === "string" ? typed.dueDate : void 0,
          notes: typeof typed.notes === "string" ? typed.notes : void 0,
          metadata: {
            lenderName: submission?.lender?.name ?? null,
            status: status2
          }
        });
      }
    });
  } else if (stipulations && typeof stipulations === "object") {
    const record = stipulations;
    Object.entries(record).forEach(([key, value], index) => {
      if (!value) return;
      const description = typeof value === "string" ? value : key;
      items.push({
        id: normalizeStipulationId(index, key),
        title: description,
        description: "Lender requested supporting documentation.",
        required: true,
        completed: false,
        completedAt: null,
        source: "lender"
      });
    });
  }
  if (items.length === 0) {
    items.push(
      {
        id: "lender-proof-of-income",
        title: "Proof of Income",
        description: "Collect and upload borrower proof of income per lender stipulations.",
        required: true,
        completed: false,
        completedAt: null,
        source: "lender"
      },
      {
        id: "lender-proof-of-residence",
        title: "Proof of Residence",
        description: "Collect borrower proof of residence and attach to funding package.",
        required: true,
        completed: false,
        completedAt: null,
        source: "lender"
      }
    );
  }
  return items;
}
function mergeItems(base, stored) {
  if (!stored || stored.length === 0) {
    return base;
  }
  const storedMap = new Map(stored.map((item) => [item.id, item]));
  const merged = base.map((item) => {
    const existing = storedMap.get(item.id);
    if (!existing) {
      return item;
    }
    return {
      ...item,
      completed: existing.completed ?? item.completed,
      completedAt: existing.completedAt ?? item.completedAt ?? null,
      documentUrl: existing.documentUrl ?? item.documentUrl,
      notes: existing.notes ?? item.notes,
      dueDate: existing.dueDate ?? item.dueDate,
      autoGenerated: existing.autoGenerated ?? item.autoGenerated,
      required: typeof existing.required === "boolean" ? existing.required : item.required
    };
  });
  stored.filter((item) => !merged.some((baseItem) => baseItem.id === item.id)).forEach((item) => {
    merged.push({
      ...item,
      completed: item.completed ?? false,
      completedAt: item.completedAt ?? null,
      required: item.required ?? false
    });
  });
  return merged;
}
function serializeItems(items) {
  const normalized = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    required: item.required,
    completed: item.completed,
    completedAt: item.completedAt,
    statute: item.statute ?? null,
    source: item.source,
    documentUrl: item.documentUrl ?? null,
    notes: item.notes ?? null,
    dueDate: item.dueDate ?? null,
    autoGenerateType: item.autoGenerateType ?? null,
    autoGenerated: item.autoGenerated ?? false,
    metadata: item.metadata ?? null
  }));
  return toInputJson(normalized);
}
function parseStoredItems(value) {
  if (!value || !Array.isArray(value)) {
    return [];
  }
  const results = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      continue;
    }
    const object = entry;
    const source = object.source;
    const group = source === "state" || source === "lender" || source === "internal" ? source : "federal";
    const autoType = object.autoGenerateType;
    const autoGenerateType = autoType === "buyers-guide" || autoType === "tila" ? autoType : void 0;
    const metadata = object.metadata && typeof object.metadata === "object" && !Array.isArray(object.metadata) ? object.metadata : void 0;
    const normalized = {
      id: typeof object.id === "string" ? object.id : "",
      title: typeof object.title === "string" ? object.title : "Untitled requirement",
      description: typeof object.description === "string" ? object.description : "",
      required: object.required !== false,
      completed: Boolean(object.completed),
      completedAt: typeof object.completedAt === "string" ? object.completedAt : null,
      statute: typeof object.statute === "string" ? object.statute : null,
      source: group,
      documentUrl: typeof object.documentUrl === "string" ? object.documentUrl : null,
      notes: typeof object.notes === "string" ? object.notes : null,
      dueDate: typeof object.dueDate === "string" ? object.dueDate : null,
      autoGenerateType,
      autoGenerated: Boolean(object.autoGenerated),
      metadata
    };
    if (normalized.id) {
      results.push(normalized);
    }
  }
  return results;
}
function computeProgress(groups) {
  const allItems = [...groups.federal, ...groups.state, ...groups.lender, ...groups.internal];
  const requiredItems = allItems.filter((item) => item.required !== false);
  const totalRequired = requiredItems.length;
  const completedRequired = requiredItems.filter((item) => item.completed).length;
  const percent = totalRequired === 0 ? 100 : completedRequired / totalRequired * 100;
  const roundedPercent = Math.round(percent * 100) / 100;
  const isComplete = totalRequired === 0 || completedRequired === totalRequired;
  return {
    totalItems: totalRequired,
    completedItems: completedRequired,
    percent: roundedPercent,
    isComplete
  };
}
async function syncFundingChecklist(dealId, isComplete) {
  await prisma.fundingChecklist.updateMany({
    where: { dealId },
    data: {
      completed: isComplete,
      completedAt: isComplete ? /* @__PURE__ */ new Date() : null,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
}
function cloneGroups(groups) {
  return {
    federal: groups.federal.map((item) => ({ ...item })),
    state: groups.state.map((item) => ({ ...item })),
    lender: groups.lender.map((item) => ({ ...item })),
    internal: groups.internal.map((item) => ({ ...item }))
  };
}
async function persistChecklist(options) {
  const { deal, existing, groups, state } = options;
  const progress = computeProgress(groups);
  const sharedData = {
    state,
    federalItems: serializeItems(groups.federal),
    stateItems: serializeItems(groups.state),
    lenderItems: serializeItems(groups.lender),
    internalItems: serializeItems(groups.internal),
    completedItems: progress.completedItems,
    totalItems: progress.totalItems,
    percentComplete: new Prisma9.Decimal(progress.percent.toFixed(2)),
    isComplete: progress.isComplete,
    completedAt: progress.isComplete ? existing?.completedAt ?? /* @__PURE__ */ new Date() : null
  };
  let record;
  if (existing) {
    record = await prisma.complianceChecklist.update({
      where: { id: existing.id },
      data: sharedData
    });
  } else {
    record = await prisma.complianceChecklist.create({
      data: {
        ...sharedData,
        tenant: { connect: { id: deal.tenantId } },
        deal: { connect: { id: deal.id } }
      }
    });
  }
  await syncFundingChecklist(deal.id, progress.isComplete);
  return record;
}
function buildChecklistView(record, groups, deal, submission) {
  const registry = resolveStateRegistry(record.state);
  return {
    id: record.id,
    dealId: deal.id,
    state: record.state,
    progress: {
      completedItems: record.completedItems,
      totalItems: record.totalItems,
      percentComplete: Number(record.percentComplete),
      isComplete: record.isComplete,
      completedAt: record.completedAt ? record.completedAt.toISOString() : null
    },
    groups: cloneGroups(groups),
    metadata: {
      stateLabel: registry.label,
      dealNumber: deal.dealNumber,
      customerName: `${deal.customer.firstName} ${deal.customer.lastName}`.trim(),
      vehicleDescription: buildVehicleDescription(deal),
      lenderName: submission?.lender?.name ?? null,
      lenderSubmissionId: submission?.id ?? null,
      lenderStatus: submission?.status ?? null,
      lastUpdated: record.updatedAt.toISOString()
    }
  };
}
async function loadDealContext(dealId) {
  const deal = await prisma.dealJacket.findFirst({
    where: { id: dealId },
    include: {
      customer: true,
      vehicle: true
    }
  });
  if (!deal) {
    throw new DealNotFoundError("Deal jacket not found for compliance processing.");
  }
  const submission = await prisma.lenderSubmission.findFirst({
    where: { dealId, isSelected: true },
    include: { lender: true },
    orderBy: [{ selectedAt: "desc" }, { submittedAt: "desc" }]
  });
  return { deal, submission };
}
async function loadChecklistRecord(dealId) {
  return prisma.complianceChecklist.findFirst({ where: { dealId } });
}
function applyUpdates(groups, updates, completeAll) {
  if (completeAll) {
    const timestamp = nowIso();
    Object.keys(groups).forEach((groupKey) => {
      groups[groupKey] = groups[groupKey].map((item) => ({
        ...item,
        completed: item.required ? true : item.completed,
        completedAt: item.required ? timestamp : item.completedAt
      }));
    });
    return groups;
  }
  if (!updates || updates.length === 0) {
    return groups;
  }
  for (const update of updates) {
    const groupItems = groups[update.group];
    const index = groupItems.findIndex((item) => item.id === update.itemId);
    if (index === -1) {
      continue;
    }
    const completed = Boolean(update.completed);
    groupItems[index] = {
      ...groupItems[index],
      completed,
      completedAt: completed ? nowIso() : null,
      documentUrl: update.documentUrl ?? groupItems[index].documentUrl,
      notes: update.notes ?? groupItems[index].notes
    };
  }
  return groups;
}
async function createPdf(render) {
  const doc = new PDFDocument({ size: "LETTER", margin: 36 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  return await new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (error) => reject(error));
    render(doc);
    doc.end();
  });
}
async function renderBuyersGuide(deal) {
  return createPdf((doc) => {
    const customerName = `${deal.customer.firstName} ${deal.customer.lastName}`.trim();
    doc.font("Helvetica-Bold").fontSize(20).text("Buyer\u2019s Guide", { align: "center" });
    doc.moveDown();
    doc.font("Helvetica").fontSize(10);
    doc.text("FTC Used Car Rule - 16 CFR 455 Compliance Document");
    doc.moveDown();
    doc.text(`Deal Number: ${deal.dealNumber}`);
    doc.text(`Customer: ${customerName || "\u2014"}`);
    doc.text(`Vehicle: ${buildVehicleDescription(deal)} (VIN: ${deal.vehicle.vin ?? "N/A"})`);
    doc.moveDown();
    doc.font("Helvetica-Bold").text("Warranties");
    doc.font("Helvetica").text("\u2610 Full Warranty   \u2611 Implied Warranty   \u2610 Service Contract");
    doc.moveDown();
    doc.font("Helvetica-Bold").text("Major Defects That May Occur in Used Vehicles:");
    doc.font("Helvetica").list([
      "Engine, transmission, and drivetrain failures",
      "Electrical system issues or battery failure",
      "Frame, suspension, and steering defects",
      "Air conditioning and heating system malfunctions"
    ]);
    doc.moveDown();
    doc.font("Helvetica-Bold").text("Dealer Promises & Acknowledgements");
    doc.font("Helvetica").text(
      "The dealer has inspected the vehicle and discloses all known material defects. Buyer acknowledges receipt of the FTC Buyer\u2019s Guide prior to sale completion."
    );
    doc.moveDown();
    doc.text(`Prepared: ${(/* @__PURE__ */ new Date()).toLocaleString("en-US")}`);
    doc.text("Dealer Representative: ________________________________");
    doc.text("Buyer Signature: ______________________________________");
  });
}
async function renderTilaDisclosure(deal) {
  return createPdf((doc) => {
    const customerName = `${deal.customer.firstName} ${deal.customer.lastName}`.trim();
    doc.font("Helvetica-Bold").fontSize(18).text("Truth in Lending Disclosure", { align: "center" });
    doc.moveDown();
    doc.font("Helvetica").fontSize(10);
    doc.text("Regulation Z (12 CFR 1026) Sample Disclosure");
    doc.moveDown();
    doc.text(`Deal Number: ${deal.dealNumber}`);
    doc.text(`Customer: ${customerName || "\u2014"}`);
    doc.text(`Vehicle: ${buildVehicleDescription(deal)} (VIN: ${deal.vehicle.vin ?? "N/A"})`);
    doc.moveDown();
    doc.font("Helvetica-Bold").text("Federal Disclosure Summary:");
    doc.font("Helvetica").text(`Amount Financed: ${formatCurrency(deal.amountFinanced)}`);
    doc.text(`Annual Percentage Rate (APR): ${decimalToNumber(deal.apr) ?? "\u2014"}%`);
    doc.text(`Finance Charge: ${formatCurrency(deal.amountFinanced)} (estimate)`);
    doc.text(`Total of Payments: ${formatCurrency(deal.monthlyPayment)} x ${deal.term ?? "\u2014"} months`);
    doc.moveDown();
    doc.font("Helvetica-Bold").text("Payment Schedule:");
    doc.font("Helvetica").list([
      `First Payment Date: ${deal.dealDate.toLocaleDateString("en-US")}`,
      `Number of Payments: ${deal.term ?? "\u2014"}`,
      `Monthly Payment Amount: ${formatCurrency(deal.monthlyPayment)}`
    ]);
    doc.moveDown();
    doc.font("Helvetica-Bold").text("Late Payment & Prepayment Disclosures:");
    doc.font("Helvetica").text(
      "Late Fee: A late charge up to 5% of the payment amount may be assessed if payment is more than 10 days late. No prepayment penalty will be charged."
    );
    doc.moveDown();
    doc.text("Security Interest: Dealer retains a security interest in the financed vehicle until contract payoff.");
    doc.moveDown();
    doc.text(`Prepared: ${(/* @__PURE__ */ new Date()).toLocaleString("en-US")}`);
    doc.text("Finance Manager Signature: _____________________________");
    doc.text("Buyer Signature: ______________________________________");
  });
}
async function renderDocumentBuffer(type, deal) {
  switch (type) {
    case "buyers-guide":
      return renderBuyersGuide(deal);
    case "tila":
      return renderTilaDisclosure(deal);
    default:
      throw new DocumentGenerationError(`Unsupported compliance document type: ${type}`);
  }
}
function updateGeneratedItem(groups, type, documentUrl) {
  const mapping = DOCUMENT_ITEM_MAP[type];
  const items = groups[mapping.group];
  const index = items.findIndex((item) => item.id === mapping.itemId);
  if (index === -1) {
    return;
  }
  items[index] = {
    ...items[index],
    completed: true,
    completedAt: nowIso(),
    documentUrl,
    autoGenerated: true
  };
}
async function getComplianceChecklist(dealId) {
  const { deal, submission } = await loadDealContext(dealId);
  const existingRecord = await loadChecklistRecord(dealId);
  const state = (existingRecord?.state ?? deriveStateFromDeal(deal)).toUpperCase();
  const groups = {
    federal: buildFederalBaseline(),
    state: buildStateBaseline(state),
    lender: buildLenderBaseline(submission),
    internal: buildInternalBaseline()
  };
  if (existingRecord) {
    groups.federal = mergeItems(groups.federal, parseStoredItems(existingRecord.federalItems));
    groups.state = mergeItems(groups.state, parseStoredItems(existingRecord.stateItems));
    groups.lender = mergeItems(groups.lender, parseStoredItems(existingRecord.lenderItems));
    groups.internal = mergeItems(groups.internal, parseStoredItems(existingRecord.internalItems));
  }
  const record = await persistChecklist({ deal, existing: existingRecord, groups, state });
  return buildChecklistView(record, groups, deal, submission);
}
async function updateComplianceChecklist(payload) {
  const { deal, submission } = await loadDealContext(payload.dealId);
  const existingRecord = await loadChecklistRecord(payload.dealId);
  const state = (existingRecord?.state ?? deriveStateFromDeal(deal)).toUpperCase();
  const groups = {
    federal: buildFederalBaseline(),
    state: buildStateBaseline(state),
    lender: buildLenderBaseline(submission),
    internal: buildInternalBaseline()
  };
  if (existingRecord) {
    groups.federal = mergeItems(groups.federal, parseStoredItems(existingRecord.federalItems));
    groups.state = mergeItems(groups.state, parseStoredItems(existingRecord.stateItems));
    groups.lender = mergeItems(groups.lender, parseStoredItems(existingRecord.lenderItems));
    groups.internal = mergeItems(groups.internal, parseStoredItems(existingRecord.internalItems));
  }
  applyUpdates(groups, payload.updates, payload.completeAll);
  const record = await persistChecklist({ deal, existing: existingRecord, groups, state });
  return buildChecklistView(record, groups, deal, submission);
}
async function generateComplianceDocument(payload) {
  const { deal, submission } = await loadDealContext(payload.dealId);
  const existingRecord = await loadChecklistRecord(payload.dealId);
  const state = (existingRecord?.state ?? deriveStateFromDeal(deal)).toUpperCase();
  const groups = {
    federal: buildFederalBaseline(),
    state: buildStateBaseline(state),
    lender: buildLenderBaseline(submission),
    internal: buildInternalBaseline()
  };
  if (existingRecord) {
    groups.federal = mergeItems(groups.federal, parseStoredItems(existingRecord.federalItems));
    groups.state = mergeItems(groups.state, parseStoredItems(existingRecord.stateItems));
    groups.lender = mergeItems(groups.lender, parseStoredItems(existingRecord.lenderItems));
    groups.internal = mergeItems(groups.internal, parseStoredItems(existingRecord.internalItems));
  }
  const buffer = await renderDocumentBuffer(payload.type, deal).catch((error) => {
    const message = error instanceof Error ? error.message : "Failed to render PDF.";
    throw new DocumentGenerationError(message);
  });
  const scan = await runVirusScan(buffer);
  if (!scan.clean) {
    throw new DocumentGenerationError(`Generated document failed antivirus scan: ${scan.signature ?? "infected file"}`);
  }
  const mapping = DOCUMENT_ITEM_MAP[payload.type];
  const key = buildComplianceDocumentKey({
    tenantId: deal.tenantId,
    dealId: deal.id,
    documentType: payload.type,
    fileName: mapping.fileName
  });
  const upload = await uploadBufferToS3({
    key,
    body: buffer,
    contentType: "application/pdf",
    metadata: {
      dealId: deal.id,
      tenantId: deal.tenantId,
      type: payload.type
    }
  }).catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown upload failure";
    throw new DocumentGenerationError(`Unable to upload compliance document: ${message}`);
  });
  updateGeneratedItem(groups, payload.type, upload.url);
  const record = await persistChecklist({ deal, existing: existingRecord, groups, state });
  const view = buildChecklistView(record, groups, deal, submission);
  const document = await prisma.dealDocument.create({
    data: {
      dealId: deal.id,
      type: "compliance",
      category: "Compliance",
      name: mapping.title,
      fileName: mapping.fileName,
      fileUrl: upload.url,
      mimeType: "application/pdf",
      fileSize: buffer.length,
      uploadedBy: payload.requestedBy
    }
  });
  return {
    checklist: view,
    document: {
      id: document.id,
      type: payload.type,
      url: upload.url,
      fileName: mapping.fileName
    }
  };
}
function getStateRequirements(state) {
  const normalized = state?.trim().toUpperCase() || "GENERAL";
  const registry = resolveStateRegistry(normalized);
  return {
    state: normalized,
    label: registry.label,
    requirements: registry.requirements
  };
}

// src/routes/fi/compliance.routes.ts
var allowedRoles3 = ["ADMIN", "SALES"];
var complianceRouter = Router8();
function isDocumentType(value) {
  return value === "buyers-guide" || value === "tila";
}
function isGroupKey(value) {
  return value === "federal" || value === "state" || value === "lender" || value === "internal";
}
function handleError(error, res, next) {
  if (error instanceof DealNotFoundError || error instanceof DocumentGenerationError) {
    return res.status(error.status).json({ message: error.message });
  }
  const resolved = resolveHttpError(error, 500, "Request failed");
  if (resolved.status !== 500 || resolved.message !== "Request failed") {
    return res.status(resolved.status).json({ message: resolved.message });
  }
  return next(error);
}
complianceRouter.get("/checklist/:dealId", requireRole(...allowedRoles3), async (req, res, next) => {
  try {
    const { dealId } = req.params;
    if (!dealId || typeof dealId !== "string") {
      return res.status(400).json({ message: "dealId parameter is required" });
    }
    const checklist = await getComplianceChecklist(dealId);
    return res.json({ data: checklist });
  } catch (error) {
    handleError(error, res, next);
  }
});
complianceRouter.post("/generate-doc/:type", requireRole(...allowedRoles3), async (req, res, next) => {
  try {
    const { type } = req.params;
    const { dealId } = req.body ?? {};
    if (!dealId || typeof dealId !== "string") {
      return res.status(400).json({ message: "dealId is required in request body" });
    }
    if (!isDocumentType(type)) {
      return res.status(400).json({ message: "Unsupported compliance document type" });
    }
    const requestedBy = req.context?.user?.id ?? "system";
    const result = await generateComplianceDocument({ dealId, type, requestedBy });
    return res.json({ data: result });
  } catch (error) {
    handleError(error, res, next);
  }
});
complianceRouter.post("/mark-complete", requireRole(...allowedRoles3), async (req, res, next) => {
  try {
    const { dealId, updates, completeAll } = req.body ?? {};
    if (!dealId || typeof dealId !== "string") {
      return res.status(400).json({ message: "dealId is required in request body" });
    }
    let normalizedUpdates;
    if (Array.isArray(updates)) {
      normalizedUpdates = [];
      for (const entry of updates) {
        if (!entry || typeof entry !== "object") {
          continue;
        }
        const { group, itemId, completed, documentUrl, notes } = entry;
        if (!isGroupKey(group) || typeof itemId !== "string") {
          continue;
        }
        normalizedUpdates.push({
          group,
          itemId,
          completed: Boolean(completed),
          documentUrl: typeof documentUrl === "string" ? documentUrl : void 0,
          notes: typeof notes === "string" ? notes : void 0
        });
      }
    }
    const checklist = await updateComplianceChecklist({
      dealId,
      updates: normalizedUpdates,
      completeAll: Boolean(completeAll)
    });
    return res.json({ data: checklist });
  } catch (error) {
    handleError(error, res, next);
  }
});
complianceRouter.get("/state-requirements/:state", requireRole(...allowedRoles3), async (req, res, next) => {
  try {
    const { state } = req.params;
    if (!state || typeof state !== "string") {
      return res.status(400).json({ message: "state parameter is required" });
    }
    const requirements = getStateRequirements(state);
    return res.json({ data: requirements });
  } catch (error) {
    handleError(error, res, next);
  }
});

// src/routes/fi/index.ts
var fiRouter = Router9();
fiRouter.use("/compliance", complianceRouter);

// src/routes/desking.routes.ts
import { Router as Router10 } from "express";

// src/validations/desking.validation.ts
import { z as z8 } from "zod";

// src/domain/desking/schemas.ts
import { z as z7 } from "zod";
var DealStatus = z7.enum(["WORKING", "PENCILED", "SUBMITTED", "CLOSED", "LOST"]);
var CreditTier = z7.enum(["TIER_1", "TIER_2", "TIER_3", "TIER_4", "TIER_5", "TIER_6"]);
var ResidenceType = z7.enum(["OWN", "RENT", "LEASE", "FAMILY", "MILITARY", "OTHER"]);
var Recommendation = z7.enum(["STRONG", "MODERATE", "WEAK", "DO_NOT_SUBMIT"]);
var Money = z7.number().finite();
var Percentage = z7.number().finite();
var Rate = z7.number().finite();
var TermMonths = z7.number().int().min(1);
var Id = z7.string().min(1);
var ISODate = z7.string().datetime({ offset: true }).or(z7.string().datetime());
var FeeLine = z7.object({
  code: z7.string(),
  label: z7.string(),
  amount: Money,
  taxable: z7.boolean().optional()
});
var BackendProduct = z7.object({
  code: z7.string(),
  name: z7.string(),
  price: Money,
  cost: Money.optional(),
  termMonths: z7.number().int().min(0).optional()
});
var VehicleInfo = z7.object({
  id: Id.optional(),
  vin: z7.string().min(1),
  stockNumber: z7.string().optional(),
  year: z7.number().int().min(1900),
  make: z7.string().min(1),
  model: z7.string().min(1),
  trim: z7.string().optional(),
  mileage: z7.number().int().min(0).optional(),
  msrp: Money.optional(),
  salePrice: Money.optional(),
  cost: Money.optional(),
  pack: Money.optional(),
  daysInStock: z7.number().int().min(0).optional(),
  modelCategory: z7.string().optional(),
  color: z7.string().optional(),
  age: z7.number().int().min(0).optional()
});
var CustomerProfile = z7.object({
  id: Id.optional(),
  firstName: z7.string().min(1),
  lastName: z7.string().min(1),
  email: z7.string().email().optional(),
  creditScore: z7.number().int().min(300).max(900),
  creditTier: CreditTier,
  residenceType: ResidenceType,
  residenceDurationMonths: z7.number().int().min(0).optional(),
  monthlyIncome: Money.optional(),
  employmentStatus: z7.string().optional(),
  employerName: z7.string().optional(),
  debtToIncomeRatio: Percentage.optional(),
  hasCoBuyer: z7.boolean().optional()
});
var PaymentCalculation = z7.object({
  amountFinanced: Money,
  apr: Rate,
  termMonths: TermMonths,
  monthlyPayment: Money,
  dueAtSigning: Money.optional()
});
var GrossCalculation = z7.object({
  frontEnd: Money,
  backEnd: Money,
  financeReserve: Money.optional(),
  docFee: Money.optional(),
  pack: Money.optional(),
  total: Money
});
var DealStructure = z7.object({
  pricing: z7.object({
    msrp: Money.optional(),
    salePrice: Money,
    dealerDiscounts: z7.array(
      z7.object({
        label: z7.string(),
        amount: Money
      })
    ).optional(),
    accessories: z7.array(
      z7.object({
        label: z7.string(),
        amount: Money
      })
    ).optional()
  }),
  trade: z7.object({
    allowance: Money.optional(),
    payoff: Money.optional(),
    equity: Money.optional(),
    description: z7.string().optional(),
    vehicle: VehicleInfo.optional()
  }).optional(),
  cashDown: z7.object({
    customerCash: Money.optional(),
    manufacturerRebate: Money.optional(),
    tradeEquity: Money.optional(),
    total: Money
  }).optional(),
  fees: z7.array(FeeLine),
  taxes: z7.array(
    z7.object({
      jurisdiction: z7.string(),
      rate: Percentage,
      amount: Money
    })
  ),
  backendProducts: z7.array(BackendProduct).optional(),
  lender: z7.object({
    preferredLenderId: Id.optional(),
    backupLenderId: Id.optional(),
    maxTerm: z7.number().int().min(0).optional(),
    minTerm: z7.number().int().min(0).optional(),
    targetPayment: Money.optional()
  }).optional()
});
var OptimizationGoals = z7.object({
  targetPayment: Money.optional(),
  minimumGross: Money.optional(),
  maximumTerm: z7.number().int().min(0).optional(),
  preserveProducts: z7.array(z7.string()).optional(),
  lenderPreference: Id.optional()
});
var OptimizationConstraints = z7.object({
  maxTerm: z7.number().int().min(0).optional(),
  minTerm: z7.number().int().min(0).optional(),
  minCashDown: Money.optional(),
  maxCashDown: Money.optional(),
  allowedTiers: z7.array(CreditTier).optional(),
  residenceType: ResidenceType.optional(),
  bannedProducts: z7.array(z7.string()).optional()
});
var OptimizationRequest = z7.object({
  dealId: Id,
  worksheetId: Id.optional(),
  versionId: Id.optional(),
  structure: DealStructure,
  customerProfile: CustomerProfile,
  vehicle: VehicleInfo,
  currentPayment: PaymentCalculation,
  goals: OptimizationGoals,
  constraints: OptimizationConstraints.optional().default({}),
  scoringOverride: z7.object({
    gross_weight: Percentage.optional(),
    close_weight: Percentage.optional(),
    approval_weight: Percentage.optional(),
    payment_weight: Percentage.optional()
  }).partial().optional()
});
var CounterAnalysisRequest = z7.object({
  dealId: Id,
  worksheetId: Id,
  versionId: Id.optional(),
  customerInput: z7.object({
    customerConcern: z7.string().min(1),
    requestedPayment: Money.optional(),
    requestedTerm: z7.number().int().min(0).optional(),
    requestedCashDown: Money.optional(),
    requestedApr: Percentage.optional(),
    notes: z7.string().optional()
  })
});
var CounterCustomerInput = CounterAnalysisRequest.shape.customerInput;
var CounterOption = z7.object({
  id: Id,
  label: z7.string(),
  structure: DealStructure,
  payment: PaymentCalculation,
  gross: GrossCalculation,
  probabilityOfClose: Percentage.optional(),
  notes: z7.string().optional()
});
var CounterAnalysisResponse = z7.object({
  summary: z7.string(),
  options: z7.array(CounterOption),
  recommendation: z7.string().optional(),
  recommendedOptionId: Id.optional(),
  confidence: Percentage.optional(),
  outcome: Recommendation.optional()
});
var ApprovalPredictionRequest = z7.object({
  dealId: Id,
  worksheetId: Id.optional(),
  versionId: Id.optional(),
  lenderId: Id,
  structure: DealStructure,
  customerProfile: CustomerProfile,
  vehicle: VehicleInfo,
  payment: PaymentCalculation
});
var StipulationPrediction = z7.object({
  code: z7.string(),
  label: z7.string(),
  required: z7.boolean().optional()
});
var ApprovalPrediction = z7.object({
  lenderId: Id,
  lenderName: z7.string(),
  approvalProbability: Percentage,
  recommendedTier: CreditTier,
  estimatedRate: Rate.optional(),
  estimatedReserve: Money.optional(),
  strengths: z7.array(z7.string()),
  weaknesses: z7.array(z7.string()),
  stipulations: z7.array(StipulationPrediction),
  recommendation: Recommendation
});

// src/validations/desking.validation.ts
var worksheetTotalsSchema = z8.object({
  salePrice: z8.number(),
  tradeAllowance: z8.number().optional(),
  tradePayoff: z8.number().optional(),
  tradeEquity: z8.number().optional(),
  cashDown: z8.number().optional(),
  fees: z8.number().optional(),
  backendProducts: z8.number().optional(),
  taxes: z8.number().optional(),
  amountFinanced: z8.number(),
  dueAtSigning: z8.number().optional(),
  frontEndGross: z8.number().optional(),
  backEndGross: z8.number().optional(),
  financeReserve: z8.number().optional(),
  totalGross: z8.number().optional()
});
var worksheetSaveSchema = z8.object({
  worksheetId: z8.string().min(1).optional(),
  customerId: z8.string().min(1),
  vehicleId: z8.string().min(1),
  salespersonId: z8.string().min(1).optional(),
  status: DealStatus.default("WORKING"),
  structure: DealStructure,
  totals: worksheetTotalsSchema,
  payment: PaymentCalculation,
  aiScore: z8.number().min(0).max(1).optional(),
  commitVersion: z8.object({
    label: z8.string().optional(),
    grossBreakdown: GrossCalculation.optional(),
    closeProbability: z8.number().min(0).max(1).optional(),
    approvalProbability: z8.number().min(0).max(1).optional(),
    aiScore: z8.number().min(0).max(1).optional()
  }).optional()
});
var worksheetPrintSchema = z8.object({
  worksheetId: z8.string().min(1),
  versionId: z8.string().min(1).optional()
});
var versionSelectSchema = z8.object({
  worksheetId: z8.string().min(1),
  versionId: z8.string().min(1)
});
var scoringOverrideSchema = z8.object({
  gross_weight: z8.number().min(0).max(100).optional(),
  close_weight: z8.number().min(0).max(100).optional(),
  approval_weight: z8.number().min(0).max(100).optional(),
  payment_weight: z8.number().min(0).max(100).optional()
}).partial();
var optimizeDealSchema = OptimizationRequest.extend({
  scoringOverride: scoringOverrideSchema.optional()
});
var counterAnalysisSchema = CounterAnalysisRequest;
var approvalRefreshSchema = ApprovalPredictionRequest;

// src/utils/authz.ts
function assertTenantContext(req) {
  const tenantId = req.context?.tenantId;
  const userId = req.context?.user?.id;
  const userRoles = req.context?.roles ?? [];
  const permissions = req.context?.permissions ?? [];
  const isSuperAdmin = req.context?.isSuperAdmin ?? false;
  if (!req.context?.user || !userId) {
    throw new ApiError("AUTHENTICATION_REQUIRED", "Authentication is required to access this resource.", {
      status: 401
    });
  }
  if (!tenantId) {
    throw new ApiError("TENANT_REQUIRED", "Tenant context is required to access this resource.", {
      status: 403
    });
  }
  return { tenantId, userId, userRoles, permissions, isSuperAdmin };
}
function assertRole(req, minimumRole) {
  const { userRoles, isSuperAdmin } = assertTenantContext(req);
  if (isSuperAdmin) {
    return;
  }
  const ROLE_PERMISSIONS = {
    ADMIN: ["*"],
    MANAGER: ["*"],
    SALES_MANAGER: ["deals.*", "leads.*", "customers.*", "inventory.view"],
    FI_MANAGER: ["finance.*", "deals.viewPricing", "deals.editPricing"],
    FINANCE: ["finance.view", "deals.viewPricing"],
    SALES: ["deals.view", "leads.view", "customers.view"],
    BDC: ["leads.*", "customers.view"],
    SERVICE: ["service.*"]
  };
  const requiredPermissions = ROLE_PERMISSIONS[minimumRole] || [];
  const hasRolePermissions = userRoles.some((role) => {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    return rolePerms.includes("*") || requiredPermissions.some((reqPerm) => rolePerms.includes(reqPerm));
  });
  if (!hasRolePermissions) {
    throw new ApiError("INSUFFICIENT_PERMISSIONS", "You do not have permission to perform this action.", {
      status: 403,
      details: { requiredRole: minimumRole, roles: userRoles }
    });
  }
}

// src/utils/pdf.ts
import PDFDocument2 from "pdfkit";
function formatCurrency2(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "\u2014";
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
function writeSectionTitle(doc, title) {
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(12).text(title);
  doc.moveDown(0.25);
  doc.strokeColor("#d0d0d0").lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.35);
  doc.font("Helvetica").fontSize(10);
}
function writeKeyValue(doc, label, value) {
  doc.font("Helvetica-Bold").text(`${label}:`, { continued: true });
  doc.font("Helvetica").text(` ${value}`);
}
async function renderWorksheetPreview(payload) {
  const doc = new PDFDocument2({ margin: 48, size: "LETTER" });
  const chunks = [];
  doc.on("data", (chunk) => {
    chunks.push(chunk);
  });
  const completion = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  doc.font("Helvetica-Bold").fontSize(18).text("Deal Worksheet", { align: "left" });
  doc.font("Helvetica").fontSize(10).text(`Deal ID: ${payload.dealId}`);
  doc.text(`Worksheet: ${payload.worksheetId}`);
  if (payload.versionLabel) {
    doc.text(`Version: ${payload.versionLabel}`);
  }
  doc.moveDown();
  writeSectionTitle(doc, "Customer & Vehicle");
  writeKeyValue(doc, "Customer", payload.customerName);
  writeKeyValue(doc, "Salesperson", payload.salesperson ?? "Unassigned");
  writeKeyValue(doc, "Vehicle", `${payload.vehicle.year} ${payload.vehicle.make} ${payload.vehicle.model}${payload.vehicle.trim ? ` ${payload.vehicle.trim}` : ""}`);
  writeKeyValue(doc, "VIN", payload.vehicle.vin);
  if (payload.vehicle.stockNumber) {
    writeKeyValue(doc, "Stock #", payload.vehicle.stockNumber);
  }
  writeSectionTitle(doc, "Payment Summary");
  writeKeyValue(doc, "Amount Financed", formatCurrency2(payload.payment.amountFinanced));
  writeKeyValue(doc, "APR", `${(payload.payment.apr * 100).toFixed(2)}%`);
  writeKeyValue(doc, "Term", `${payload.payment.termMonths} months`);
  writeKeyValue(doc, "Monthly Payment", formatCurrency2(payload.payment.monthlyPayment));
  if (payload.payment.dueAtSigning) {
    writeKeyValue(doc, "Due at Signing", formatCurrency2(payload.payment.dueAtSigning));
  }
  writeSectionTitle(doc, "Deal Structure");
  writeKeyValue(doc, "Sale Price", formatCurrency2(payload.structure.pricing.salePrice));
  if (payload.structure.pricing.msrp) {
    writeKeyValue(doc, "MSRP", formatCurrency2(payload.structure.pricing.msrp));
  }
  if (payload.structure.trade?.allowance) {
    writeKeyValue(doc, "Trade Allowance", formatCurrency2(payload.structure.trade.allowance));
  }
  if (payload.structure.trade?.payoff) {
    writeKeyValue(doc, "Trade Payoff", formatCurrency2(payload.structure.trade.payoff));
  }
  if (payload.structure.cashDown?.total) {
    writeKeyValue(doc, "Cash Down", formatCurrency2(payload.structure.cashDown.total));
  }
  if (payload.structure.backendProducts?.length) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("Backend Products");
    doc.font("Helvetica");
    payload.structure.backendProducts.forEach((product) => {
      doc.text(`\u2022 ${product.name} (${product.code}) \u2014 ${formatCurrency2(product.price)}`);
    });
  }
  if (payload.structure.fees.length) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("Fees");
    doc.font("Helvetica");
    payload.structure.fees.forEach((fee) => {
      doc.text(`\u2022 ${fee.label} (${fee.code}) \u2014 ${formatCurrency2(fee.amount)}`);
    });
  }
  writeSectionTitle(doc, "Financial Summary");
  Object.entries(payload.totals).forEach(([key, value]) => {
    if (typeof value === "number") {
      writeKeyValue(doc, key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()), formatCurrency2(value));
    }
  });
  if (payload.gross) {
    writeSectionTitle(doc, "Gross Breakdown");
    writeKeyValue(doc, "Front-End Gross", formatCurrency2(payload.gross.frontEnd));
    writeKeyValue(doc, "Back-End Gross", formatCurrency2(payload.gross.backEnd));
    if (payload.gross.financeReserve) {
      writeKeyValue(doc, "Finance Reserve", formatCurrency2(payload.gross.financeReserve));
    }
    if (payload.gross.docFee) {
      writeKeyValue(doc, "Doc Fee", formatCurrency2(payload.gross.docFee));
    }
    if (payload.gross.pack) {
      writeKeyValue(doc, "Pack", formatCurrency2(payload.gross.pack));
    }
    writeKeyValue(doc, "Total Gross", formatCurrency2(payload.gross.total));
  }
  doc.end();
  return completion;
}

// src/services/desking.service.ts
import { Prisma as Prisma10 } from "@prisma/client";

// src/lib/event-bus.ts
import { randomUUID as randomUUID2 } from "crypto";
import { setImmediate } from "timers";
function createDomainEvent(name, payload, metadata) {
  return {
    id: randomUUID2(),
    name,
    occurredAt: /* @__PURE__ */ new Date(),
    payload,
    metadata
  };
}
var InMemoryEventBus = class {
  constructor(contextDefaults = {}) {
    this.contextDefaults = contextDefaults;
  }
  handlers = /* @__PURE__ */ new Map();
  async publish(event) {
    const handlers = this.handlers.get(event.name);
    if (!handlers?.size) {
      return;
    }
    const correlationId = typeof event.metadata?.correlationId === "string" && event.metadata.correlationId || event.id;
    await Promise.all(
      Array.from(handlers).map(
        (handler) => new Promise((resolve, reject) => {
          setImmediate(async () => {
            try {
              await handler(event, { ...this.contextDefaults, correlationId, causationId: event.id });
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        })
      )
    );
  }
  subscribe(name, handler) {
    const bucket = this.handlers.get(name) ?? /* @__PURE__ */ new Set();
    bucket.add(handler);
    this.handlers.set(name, bucket);
    return {
      unsubscribe: () => {
        const current = this.handlers.get(name);
        if (!current) {
          return;
        }
        current.delete(handler);
        if (current.size === 0) {
          this.handlers.delete(name);
        }
      }
    };
  }
};
var eventBus = new InMemoryEventBus();

// src/events/topics.ts
var EVENT_TOPICS = {
  DEAL_WORKSHEET_CREATED: "deal.worksheet.created",
  DEAL_VERSION_CREATED: "deal.version.created",
  DEAL_VERSION_SELECTED: "deal.version.selected",
  DEAL_STATUS_UPDATED: "deal.status.updated",
  DEAL_STATUS_LOST: "deal.status.lost",
  DEAL_STATUS_CLOSED: "deal.status.closed",
  DEAL_OPTIMIZED: "deal.optimized",
  DEAL_COUNTER_ACCEPTED: "deal.counter.accepted",
  INVENTORY_VEHICLE_RESERVED: "inventory.vehicle.reserved",
  INVENTORY_VEHICLE_RELEASED: "inventory.vehicle.released",
  INVENTORY_DAYS_IN_STOCK_UPDATED: "inventory.vehicle.days-in-stock.updated",
  ACCOUNTING_JOURNAL_CREATED: "accounting.journal.created"
};

// src/events/index.ts
function emitEvent(topic, payload, metadata) {
  const event = createDomainEvent(topic, payload, metadata);
  return eventBus.publish(event);
}
function subscribeToEvent(topic, handler) {
  return eventBus.subscribe(topic, handler);
}

// src/services/desking.service.ts
async function getDealContext(tx, tenantId, dealId) {
  const deal = await tx.deal.findFirst({
    where: { tenantId, id: dealId },
    select: { customerId: true, vehicleId: true, salesPersonId: true }
  });
  if (!deal) {
    throw new ApiError("DEAL_NOT_FOUND", "Deal could not be located for the provided worksheet.", { status: 404 });
  }
  return {
    customerId: deal.customerId,
    vehicleId: deal.vehicleId,
    salespersonId: deal.salesPersonId ?? null
  };
}
function decimalToNumber2(value) {
  if (value == null) {
    return null;
  }
  if (value instanceof Prisma10.Decimal) {
    return value.toNumber();
  }
  const parsed = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
}
function mapWorksheet(record) {
  const payment = {
    amountFinanced: decimalToNumber2(record.amountFinanced) ?? 0,
    apr: decimalToNumber2(record.apr) ?? 0,
    termMonths: record.term ?? 0,
    monthlyPayment: decimalToNumber2(record.payment) ?? 0,
    dueAtSigning: record.totals?.dueAtSigning
  };
  return {
    id: record.id,
    dealId: record.dealId,
    customerId: record.customerId,
    vehicleId: record.vehicleId,
    salespersonId: record.salespersonId ?? null,
    status: record.status,
    structure: record.structure,
    totals: record.totals,
    payment,
    aiScore: decimalToNumber2(record.aiScore),
    printablePdfUrl: record.printablePdfUrl ?? null,
    currentVersionId: record.versionPointerId ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}
function mapVersion(record) {
  return {
    id: record.id,
    dealId: record.dealId,
    worksheetId: record.worksheetId,
    label: record.label,
    closeProbability: decimalToNumber2(record.closeProbability),
    approvalProbability: decimalToNumber2(record.approvalProbability),
    aiScore: decimalToNumber2(record.aiScore),
    grossBreakdown: record.grossBreakdown,
    createdAt: record.createdAt.toISOString()
  };
}
function mapOptimization(record) {
  return {
    id: record.id,
    worksheetId: record.worksheetId ?? null,
    versionId: record.versionId ?? null,
    goals: record.goals,
    constraints: record.constraints,
    recommendedStructure: record.recommendedStructure,
    alternatives: record.alternatives,
    insights: record.insights,
    warnings: record.warnings,
    projectedGross: decimalToNumber2(record.projectedGross),
    mlTraceId: record.mlTraceId ?? null,
    createdAt: record.createdAt.toISOString()
  };
}
function mapCounterOffer(record) {
  const response = record.aiResponse;
  return {
    id: record.id,
    worksheetId: record.worksheetId ?? null,
    versionId: record.originalVersionId,
    outcome: record.outcome,
    summary: response.summary,
    options: response.options,
    recommendation: response.recommendation,
    selectedOption: record.selectedOption,
    createdAt: record.createdAt.toISOString()
  };
}
function mapApproval(record) {
  return {
    id: record.id,
    lenderId: record.lenderId,
    lenderName: record.lenderName,
    approvalProbability: decimalToNumber2(record.approvalProbability) ?? 0,
    recommendedTier: record.recommendedTier,
    estimatedRate: decimalToNumber2(record.estimatedRate),
    estimatedReserve: decimalToNumber2(record.estimatedReserve),
    strengths: record.strengths,
    weaknesses: record.weaknesses,
    stipulations: record.stipulations,
    recommendation: record.recommendation,
    versionId: record.versionId ?? null,
    worksheetId: record.worksheetId ?? null,
    createdAt: record.createdAt.toISOString()
  };
}
async function getWorksheet(tenantId, dealId) {
  const worksheet = await prisma.dealWorksheet.findFirst({
    where: { tenantId, dealId },
    include: { versionPointer: true }
  });
  if (!worksheet) {
    throw new ApiError("WORKSHEET_NOT_FOUND", "No worksheet exists for the requested deal.", { status: 404 });
  }
  return mapWorksheet(worksheet);
}
async function getWorksheetPrintContext(tenantId, worksheetId) {
  const record = await prisma.dealWorksheet.findFirst({
    where: { tenantId, id: worksheetId },
    include: { versionPointer: true, customer: true, vehicle: true, salesperson: true }
  });
  if (!record) {
    throw new ApiError("WORKSHEET_NOT_FOUND", "Worksheet could not be located.", { status: 404 });
  }
  const worksheet = mapWorksheet(record);
  return {
    worksheet,
    customer: {
      id: record.customerId,
      firstName: record.customer.firstName,
      lastName: record.customer.lastName
    },
    vehicle: {
      id: record.vehicleId,
      vin: record.vehicle.vin,
      year: record.vehicle.year,
      make: record.vehicle.make,
      model: record.vehicle.model,
      trim: record.vehicle.trim ?? null,
      stockNumber: record.vehicle.stockNumber ?? null
    },
    salesperson: record.salesperson ? {
      id: record.salesperson.id,
      displayName: ([record.salesperson.firstName, record.salesperson.lastName].filter(Boolean).join(" ") || record.salesperson.email) ?? null
    } : null,
    versionLabel: record.versionPointer?.label ?? null
  };
}
async function saveWorksheet(tenantId, dealId, userId, payload) {
  const postCommit = [];
  const result = await prisma.$transaction(async (tx) => {
    const dealContext = await getDealContext(tx, tenantId, dealId);
    const existing = payload.worksheetId ? await tx.dealWorksheet.findFirst({ where: { id: payload.worksheetId, tenantId, dealId } }) : null;
    if (payload.worksheetId && !existing) {
      throw new ApiError("WORKSHEET_NOT_FOUND", "Worksheet could not be located for update.", { status: 404 });
    }
    const previousStatus = existing?.status ?? null;
    let worksheetRecord;
    if (existing) {
      worksheetRecord = await tx.dealWorksheet.update({
        where: { id: existing.id },
        data: {
          customerId: payload.customerId,
          vehicleId: payload.vehicleId,
          salespersonId: payload.salespersonId ?? null,
          structure: toInputJson(payload.structure),
          totals: toInputJson(payload.totals),
          amountFinanced: new Prisma10.Decimal(payload.payment.amountFinanced),
          term: payload.payment.termMonths,
          apr: new Prisma10.Decimal(payload.payment.apr),
          payment: new Prisma10.Decimal(payload.payment.monthlyPayment),
          status: payload.status,
          aiScore: payload.aiScore != null ? new Prisma10.Decimal(payload.aiScore) : null
        }
      });
    } else {
      worksheetRecord = await tx.dealWorksheet.create({
        data: {
          id: payload.worksheetId,
          tenantId,
          dealId,
          customerId: payload.customerId,
          vehicleId: payload.vehicleId,
          salespersonId: payload.salespersonId ?? null,
          structure: toInputJson(payload.structure),
          totals: toInputJson(payload.totals),
          amountFinanced: new Prisma10.Decimal(payload.payment.amountFinanced),
          term: payload.payment.termMonths,
          apr: new Prisma10.Decimal(payload.payment.apr),
          payment: new Prisma10.Decimal(payload.payment.monthlyPayment),
          status: payload.status,
          aiScore: payload.aiScore != null ? new Prisma10.Decimal(payload.aiScore) : null
        }
      });
      postCommit.push(
        () => emitEvent(EVENT_TOPICS.DEAL_WORKSHEET_CREATED, {
          tenantId,
          dealId,
          worksheetId: worksheetRecord.id,
          vehicleId: dealContext.vehicleId,
          customerId: dealContext.customerId,
          salespersonId: worksheetRecord.salespersonId ?? dealContext.salespersonId,
          status: worksheetRecord.status
        })
      );
    }
    let versionRecord = null;
    if (payload.commitVersion) {
      const grossBreakdown = payload.commitVersion.grossBreakdown ? toInputJson(payload.commitVersion.grossBreakdown) : void 0;
      versionRecord = await tx.dealVersion.create({
        data: {
          tenantId,
          dealId,
          worksheetId: worksheetRecord.id,
          snapshot: toInputJson({
            structure: payload.structure,
            totals: payload.totals,
            payment: payload.payment
          }),
          grossBreakdown: grossBreakdown ?? void 0,
          closeProbability: payload.commitVersion.closeProbability != null ? new Prisma10.Decimal(payload.commitVersion.closeProbability) : void 0,
          approvalProbability: payload.commitVersion.approvalProbability != null ? new Prisma10.Decimal(payload.commitVersion.approvalProbability) : void 0,
          aiScore: payload.commitVersion.aiScore != null ? new Prisma10.Decimal(payload.commitVersion.aiScore) : void 0,
          label: payload.commitVersion.label ?? null,
          createdById: userId
        }
      });
      worksheetRecord = await tx.dealWorksheet.update({
        where: { id: worksheetRecord.id },
        data: { versionPointerId: versionRecord.id }
      });
      postCommit.push(
        () => emitEvent(EVENT_TOPICS.DEAL_VERSION_CREATED, {
          tenantId,
          dealId,
          worksheetId: worksheetRecord.id,
          versionId: versionRecord.id,
          createdBy: userId,
          customerId: dealContext.customerId,
          vehicleId: dealContext.vehicleId,
          salespersonId: worksheetRecord.salespersonId ?? dealContext.salespersonId
        })
      );
    }
    if (previousStatus !== worksheetRecord.status) {
      postCommit.push(
        () => emitEvent(EVENT_TOPICS.DEAL_STATUS_UPDATED, {
          tenantId,
          dealId,
          worksheetId: worksheetRecord.id,
          previousStatus,
          nextStatus: worksheetRecord.status
        })
      );
      if (worksheetRecord.status === "LOST") {
        postCommit.push(
          () => emitEvent(EVENT_TOPICS.DEAL_STATUS_LOST, {
            tenantId,
            dealId,
            worksheetId: worksheetRecord.id,
            vehicleId: dealContext.vehicleId,
            customerId: dealContext.customerId,
            salespersonId: worksheetRecord.salespersonId ?? dealContext.salespersonId,
            reason: void 0
          })
        );
      }
      if (worksheetRecord.status === "CLOSED") {
        postCommit.push(
          () => emitEvent(EVENT_TOPICS.DEAL_STATUS_CLOSED, {
            tenantId,
            dealId,
            worksheetId: worksheetRecord.id,
            vehicleId: dealContext.vehicleId,
            totals: payload.totals,
            salespersonId: worksheetRecord.salespersonId ?? dealContext.salespersonId,
            customerId: dealContext.customerId
          })
        );
      }
    }
    return { worksheet: mapWorksheet(worksheetRecord), version: versionRecord ? mapVersion(versionRecord) : null };
  });
  for (const trigger of postCommit) {
    await trigger();
  }
  return result;
}
async function listVersions(tenantId, dealId) {
  const versions = await prisma.dealVersion.findMany({
    where: { tenantId, dealId },
    orderBy: { createdAt: "desc" }
  });
  return versions.map(mapVersion);
}
async function selectVersion(tenantId, dealId, worksheetId, versionId, userId) {
  const version = await prisma.dealVersion.findFirst({ where: { tenantId, dealId, id: versionId, worksheetId } });
  if (!version) {
    throw new ApiError("VERSION_NOT_FOUND", "The requested version does not exist for this deal.", { status: 404 });
  }
  const worksheet = await prisma.dealWorksheet.update({
    where: { id: worksheetId },
    data: { versionPointerId: versionId },
    include: { versionPointer: true }
  });
  const dealContext = await prisma.deal.findFirst({
    where: { tenantId, id: dealId },
    select: { customerId: true, vehicleId: true, salesPersonId: true }
  });
  const snapshot = version.snapshot ?? {};
  const structure = snapshot.structure ?? {};
  const totals = snapshot.totals ?? {};
  const payment = snapshot.payment ?? {};
  if (dealContext) {
    await emitEvent(EVENT_TOPICS.DEAL_VERSION_SELECTED, {
      tenantId,
      dealId,
      worksheetId,
      versionId,
      selectedBy: userId,
      customerId: dealContext.customerId,
      vehicleId: dealContext.vehicleId,
      salespersonId: worksheet.salespersonId ?? dealContext.salesPersonId ?? null,
      structure,
      totals,
      payment
    });
  }
  return mapWorksheet(worksheet);
}
async function recordOptimization(tenantId, dealId, userId, request, response, traceId) {
  const optimization = await prisma.dealOptimization.create({
    data: {
      tenantId,
      dealId,
      worksheetId: response.worksheetId ?? request.worksheetId ?? null,
      versionId: response.versionId ?? request.versionId ?? null,
      goals: toInputJson(request.goals),
      constraints: toInputJson(request.constraints),
      recommendedStructure: toInputJson(response.recommendedStructure),
      alternatives: toInputJson(response.alternatives),
      insights: response.insights,
      warnings: response.warnings,
      projectedGross: response.projectedGross?.total != null ? new Prisma10.Decimal(response.projectedGross.total) : void 0,
      runById: userId,
      mlTraceId: traceId ?? null
    }
  });
  const dealContext = await prisma.deal.findFirst({
    where: { tenantId, id: dealId },
    select: { customerId: true, salesPersonId: true }
  });
  if (dealContext) {
    await emitEvent(EVENT_TOPICS.DEAL_OPTIMIZED, {
      tenantId,
      dealId,
      worksheetId: optimization.worksheetId,
      versionId: optimization.versionId,
      optimizationId: optimization.id,
      runBy: userId,
      customerId: dealContext.customerId,
      salespersonId: dealContext.salesPersonId ?? null
    });
  }
  return mapOptimization(optimization);
}
async function recordCounterOffer(tenantId, dealId, userId, request, response) {
  if (!request.versionId) {
    throw new ApiError("VERSION_REQUIRED", "A base version is required to record a counter offer.", { status: 400 });
  }
  const counter = await prisma.counterOffer.create({
    data: {
      tenantId,
      dealId,
      worksheetId: request.worksheetId ?? null,
      originalVersionId: request.versionId,
      input: toInputJson(request.customerInput),
      aiResponse: toInputJson(response),
      selectedOption: response.recommendedOptionId ? toInputJson(response.options.find((option) => option.id === response.recommendedOptionId) ?? null) : void 0,
      outcome: response.outcome ?? "PENDING",
      handledById: userId
    }
  });
  if (counter.outcome === "ACCEPTED") {
    const dealContext = await prisma.deal.findFirst({
      where: { tenantId, id: dealId },
      select: { customerId: true, salesPersonId: true }
    });
    if (dealContext) {
      await emitEvent(EVENT_TOPICS.DEAL_COUNTER_ACCEPTED, {
        tenantId,
        dealId,
        worksheetId: counter.worksheetId,
        counterId: counter.id,
        handledBy: userId,
        customerId: dealContext.customerId,
        salespersonId: dealContext.salesPersonId ?? null
      });
    }
  }
  return mapCounterOffer(counter);
}
async function recordApproval(tenantId, dealId, request) {
  const existing = await prisma.approvalPrediction.findFirst({
    where: { tenantId, dealId, lenderId: request.lenderId }
  });
  let approval;
  const data = {
    tenantId,
    dealId,
    worksheetId: request.worksheetId ?? null,
    versionId: request.versionId ?? null,
    lenderId: request.lenderId,
    lenderName: request.lenderName,
    approvalProbability: new Prisma10.Decimal(request.approvalProbability),
    recommendedTier: request.recommendedTier,
    estimatedRate: request.estimatedRate != null ? new Prisma10.Decimal(request.estimatedRate) : void 0,
    estimatedReserve: request.estimatedReserve != null ? new Prisma10.Decimal(request.estimatedReserve) : void 0,
    strengths: request.strengths,
    weaknesses: request.weaknesses,
    stipulations: toInputJson(request.stipulations),
    recommendation: request.recommendation
  };
  if (existing) {
    approval = await prisma.approvalPrediction.update({
      where: { id: existing.id },
      data
    });
  } else {
    approval = await prisma.approvalPrediction.create({ data });
  }
  return mapApproval(approval);
}
async function listOptimizations(tenantId, dealId) {
  const optimizations = await prisma.dealOptimization.findMany({
    where: { tenantId, dealId },
    orderBy: { createdAt: "desc" }
  });
  return optimizations.map(mapOptimization);
}
async function listCounterOffers(tenantId, dealId) {
  const counters = await prisma.counterOffer.findMany({
    where: { tenantId, dealId },
    orderBy: { createdAt: "desc" }
  });
  return counters.map(mapCounterOffer);
}
async function listApprovals(tenantId, dealId) {
  const approvals = await prisma.approvalPrediction.findMany({
    where: { tenantId, dealId },
    orderBy: { createdAt: "desc" }
  });
  return approvals.map(mapApproval);
}
async function updateWorksheetPrintUrl(tenantId, worksheetId, url) {
  const worksheet = await prisma.dealWorksheet.update({
    where: { id: worksheetId },
    data: { printablePdfUrl: url },
    include: { versionPointer: true }
  });
  if (worksheet.tenantId !== tenantId) {
    throw new ApiError("WORKSHEET_NOT_FOUND", "Worksheet could not be located.", { status: 404 });
  }
  return mapWorksheet(worksheet);
}

// src/services/dealOptimizer.service.ts
import { Prisma as Prisma11, RetailDealStatus } from "@prisma/client";

// src/config/scoring.ts
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import chokidar from "chokidar";
var CONFIG_PATH = process.env.SCORING_CONFIG_PATH ?? path.resolve(process.cwd(), "ml_backend/config/scoring.yaml");
var currentConfig;
var watcher;
function normalizeWeights(config2) {
  const cloned = structuredClone(config2);
  const weights = cloned.objectives;
  const sum3 = weights.gross_weight + weights.close_weight + weights.approval_weight + weights.payment_weight;
  if (Math.abs(sum3 - 1) < 1e-6) {
    return cloned;
  }
  if (Math.abs(sum3 - 100) < 1e-6) {
    weights.gross_weight /= 100;
    weights.close_weight /= 100;
    weights.approval_weight /= 100;
    weights.payment_weight /= 100;
    return cloned;
  }
  throw new Error(`Invalid scoring weights; sum=${sum3}`);
}
function loadFromDisk() {
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  const parsed = yaml.load(raw);
  return normalizeWeights(parsed);
}
function getScoringConfig() {
  if (!currentConfig) {
    currentConfig = loadFromDisk();
  }
  return currentConfig;
}
function watchScoringConfig(onReload) {
  if (watcher) {
    return watcher;
  }
  watcher = chokidar.watch(CONFIG_PATH, { ignoreInitial: true });
  watcher.on("change", () => {
    try {
      currentConfig = loadFromDisk();
      onReload?.(currentConfig);
      console.log(`[scoring] reloaded ${CONFIG_PATH}`);
    } catch (error) {
      console.error("[scoring] reload failed:", error);
    }
  });
  return watcher;
}

// src/services/marketPricing.service.ts
var roundToCents = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
var defaultAgingBands = [
  { maxDays: 30, adjustmentPercent: 0 },
  { maxDays: 45, adjustmentPercent: -0.01 },
  { maxDays: 60, adjustmentPercent: -0.02 },
  { maxDays: 90, adjustmentPercent: -0.03 },
  { maxDays: Number.POSITIVE_INFINITY, adjustmentPercent: -0.05 }
];
var toDate = (value) => {
  if (value instanceof Date) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid date value: ${value}`);
  }
  return date;
};
var daysBetween = (start, end) => {
  const diff = start.getTime() - end.getTime();
  return Math.floor(diff / (1e3 * 60 * 60 * 24));
};
var calculateAverage = (values) => {
  if (values.length === 0) {
    return 0;
  }
  const sum3 = values.reduce((total, value) => total + value, 0);
  return sum3 / values.length;
};
var calculateMedian = (values) => {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
  }
  return sorted[midpoint];
};
var calculateStdDeviation = (values, average2) => {
  if (values.length <= 1) {
    return 0;
  }
  const variance = values.reduce((total, value) => total + Math.pow(value - average2, 2), 0) / values.length;
  return Math.sqrt(variance);
};
var matchesVehicle = (subject, comparable, yearVariance) => {
  if (subject.make.toLowerCase() !== comparable.make.toLowerCase()) {
    return false;
  }
  if (subject.model.toLowerCase() !== comparable.model.toLowerCase()) {
    return false;
  }
  if (Math.abs(subject.year - comparable.year) > yearVariance) {
    return false;
  }
  if (subject.segment && comparable.segment && subject.segment.toLowerCase() !== comparable.segment.toLowerCase()) {
    return false;
  }
  return true;
};
var getMarketData = (vehicle, comparables, options = {}) => {
  const windowDays = options.windowDays ?? 30;
  const yearVariance = options.yearVariance ?? 1;
  const asOfDate = options.asOfDate ?? /* @__PURE__ */ new Date();
  const filtered = comparables.filter((sale) => {
    const saleDate = toDate(sale.saleDate);
    const age = daysBetween(asOfDate, saleDate);
    if (age < 0 || age > windowDays) {
      return false;
    }
    return matchesVehicle(vehicle, sale.vehicle, yearVariance);
  });
  const prices = filtered.map((sale) => sale.salePrice).filter((price) => Number.isFinite(price));
  const average2 = calculateAverage(prices);
  const median = calculateMedian(prices);
  const stdDeviation = calculateStdDeviation(prices, average2);
  const min = prices.length > 0 ? Math.min(...prices) : 0;
  const max = prices.length > 0 ? Math.max(...prices) : 0;
  return {
    sampleSize: filtered.length,
    averagePrice: roundToCents(average2),
    medianPrice: roundToCents(median),
    minPrice: roundToCents(min),
    maxPrice: roundToCents(max),
    stdDeviation: roundToCents(stdDeviation),
    comparables: filtered
  };
};
var competitiveRange = (summary) => {
  if (summary.sampleSize === 0) {
    return { floor: 0, target: 0, ceiling: 0 };
  }
  const spread = summary.stdDeviation || (summary.maxPrice - summary.minPrice) / 4 || summary.medianPrice * 0.02;
  const floor = Math.max(summary.minPrice, summary.medianPrice - spread);
  const ceiling = Math.min(summary.maxPrice || summary.medianPrice + spread, summary.medianPrice + spread);
  return {
    floor: roundToCents(floor),
    target: roundToCents(summary.medianPrice),
    ceiling: roundToCents(Math.max(ceiling, summary.medianPrice))
  };
};

// src/services/similarDeals.service.ts
var roundToCents2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
var toDate2 = (value) => {
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new RangeError(`Invalid date supplied: ${value}`);
  }
  return parsed;
};
var daysBetween2 = (start, end) => {
  const diff = start.getTime() - end.getTime();
  return Math.floor(diff / (1e3 * 60 * 60 * 24));
};
var matchesVehicleClass = (target, candidate, yearVariance) => {
  if (target.make.toLowerCase() !== candidate.make.toLowerCase()) {
    return false;
  }
  if (target.model.toLowerCase() !== candidate.model.toLowerCase()) {
    return false;
  }
  return Math.abs(target.year - candidate.year) <= yearVariance;
};
var average = (values) => {
  if (values.length === 0) {
    return 0;
  }
  const sum3 = values.reduce((total, value) => total + value, 0);
  return sum3 / values.length;
};
var findSimilarDeals = (vehicle, deals, options = {}, asOf = /* @__PURE__ */ new Date()) => {
  const windowDays = options.windowDays ?? 90;
  const yearVariance = options.yearVariance ?? 2;
  const relevantDeals = deals.filter((deal) => {
    const closeDate = toDate2(deal.closeDate);
    const age = daysBetween2(asOf, closeDate);
    if (age < 0 || age > windowDays) {
      return false;
    }
    return matchesVehicleClass(vehicle, deal.vehicle, yearVariance);
  });
  const closedDeals = relevantDeals.filter((deal) => deal.status === "closed");
  const opportunityCount = relevantDeals.filter((deal) => deal.status === "closed" || deal.status === "lost").length;
  const closeRate = opportunityCount === 0 ? 0 : closedDeals.length / opportunityCount;
  const frontGrossAvg = average(closedDeals.map((deal) => deal.frontGross));
  const reserveAvg = average(closedDeals.map((deal) => deal.financeReserve));
  const totalGrossAvg = average(closedDeals.map((deal) => deal.totalGross ?? deal.frontGross + deal.financeReserve));
  return {
    deals: closedDeals,
    metrics: {
      sampleSize: closedDeals.length,
      averageFrontGross: roundToCents2(frontGrossAvg),
      averageReserve: roundToCents2(reserveAvg),
      averageTotalGross: roundToCents2(totalGrossAvg),
      closeRate: Math.round((closeRate + Number.EPSILON) * 1e4) / 1e4
    }
  };
};

// src/services/lenderRules.service.ts
var roundToCents3 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
var toDate3 = (value) => {
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new RangeError(`Invalid date supplied: ${value}`);
  }
  return parsed;
};
var isRateSheetActive = (tier, asOfDate) => {
  const effectiveFrom = toDate3(tier.effectiveFrom);
  if (effectiveFrom > asOfDate) {
    return false;
  }
  if (!tier.effectiveTo) {
    return true;
  }
  return toDate3(tier.effectiveTo) >= asOfDate;
};
var getActiveLenders = (tenantId, lenders, asOf = /* @__PURE__ */ new Date()) => {
  return lenders.filter((lender) => lender.tenantId === tenantId && lender.status !== "inactive").map((lender) => ({
    ...lender,
    activeRateSheets: lender.rateSheets.filter((tier) => isRateSheetActive(tier, asOf))
  })).filter((lender) => lender.activeRateSheets.length > 0);
};
var computeTier = (customer, lender) => {
  const sorted = [...lender.activeRateSheets].sort((a, b) => b.minScore - a.minScore);
  return sorted.find((tier) => {
    if (customer.creditScore < tier.minScore) {
      return false;
    }
    if (tier.maxScore !== void 0 && customer.creditScore > tier.maxScore) {
      return false;
    }
    return true;
  }) ?? null;
};
var DEFAULT_MAX_RESERVE_RATIO = 0.1;
var DEFAULT_MAX_LTV = 1.25;
var DEFAULT_MAX_PTI = 0.2;
var maxReserve = (deal, lender, tier) => {
  if (!Number.isFinite(deal.amountFinanced) || deal.amountFinanced < 0) {
    throw new RangeError("amountFinanced must be a non-negative finite number");
  }
  const reserveLimit = Math.min(
    lender.maxReserve ?? Number.POSITIVE_INFINITY,
    tier?.maxReserve ?? Number.POSITIVE_INFINITY,
    deal.amountFinanced * DEFAULT_MAX_RESERVE_RATIO
  );
  if (!Number.isFinite(reserveLimit)) {
    return Number.POSITIVE_INFINITY;
  }
  return roundToCents3(Math.max(reserveLimit, 0));
};
var maxLTV = (lender, tier) => {
  const limit = Math.min(
    lender.maxLtv ?? Number.POSITIVE_INFINITY,
    tier?.maxLtv ?? Number.POSITIVE_INFINITY,
    DEFAULT_MAX_LTV
  );
  if (!Number.isFinite(limit)) {
    return DEFAULT_MAX_LTV;
  }
  return Math.max(limit, 0);
};
var maxPTI = (lender, tier) => {
  const limit = Math.min(
    lender.maxPti ?? Number.POSITIVE_INFINITY,
    tier?.maxPti ?? Number.POSITIVE_INFINITY,
    DEFAULT_MAX_PTI
  );
  if (!Number.isFinite(limit)) {
    return DEFAULT_MAX_PTI;
  }
  return Math.max(limit, 0);
};
var listViolations = (context, lender) => {
  const violations = [];
  const tier = computeTier(context.customer, lender);
  if (!tier) {
    violations.push({ code: "TIER", message: "Customer does not qualify for any active tier" });
    return violations;
  }
  const termLimit = tier.maxTermMonths ?? lender.maxTermMonths;
  if (termLimit !== void 0 && context.deal.termMonths > termLimit) {
    violations.push({
      code: "TERM",
      message: `Requested term exceeds lender maximum of ${termLimit} months`,
      limit: termLimit,
      actual: context.deal.termMonths
    });
  }
  if (!Number.isFinite(context.deal.advanceValue) || context.deal.advanceValue <= 0) {
    throw new RangeError("advanceValue must be a positive finite number");
  }
  const ltvLimit = maxLTV(lender, tier);
  const ltv = context.deal.amountFinanced / context.deal.advanceValue;
  if (ltvLimit > 0 && ltv > ltvLimit) {
    violations.push({
      code: "LTV",
      message: `Requested structure exceeds LTV limit of ${(ltvLimit * 100).toFixed(1)}%`,
      limit: ltvLimit,
      actual: Math.round((ltv + Number.EPSILON) * 1e4) / 1e4
    });
  }
  if (!Number.isFinite(context.customer.monthlyIncome) || context.customer.monthlyIncome <= 0) {
    throw new RangeError("monthlyIncome must be a positive finite number");
  }
  const ptiLimit = maxPTI(lender, tier);
  const pti = context.deal.monthlyPayment / context.customer.monthlyIncome;
  if (ptiLimit > 0 && pti > ptiLimit) {
    violations.push({
      code: "PTI",
      message: `Payment to income ratio exceeds ${(ptiLimit * 100).toFixed(1)}% limit`,
      limit: ptiLimit,
      actual: Math.round((pti + Number.EPSILON) * 1e4) / 1e4
    });
  }
  if (context.deal.reserveAmount !== void 0) {
    const reserveLimit = maxReserve(context.deal, lender, tier);
    if (Number.isFinite(reserveLimit) && context.deal.reserveAmount > reserveLimit) {
      violations.push({
        code: "RESERVE",
        message: "Requested reserve exceeds lender maximum",
        limit: reserveLimit,
        actual: roundToCents3(context.deal.reserveAmount)
      });
    }
  }
  return violations;
};

// src/services/paymentCalculator.service.ts
var roundToCents4 = (value) => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};
var parseTermString = (term) => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) {
    throw new RangeError("Term cannot be empty");
  }
  const numericPart = parseFloat(normalized.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numericPart) || numericPart <= 0) {
    throw new RangeError(`Unable to parse term: ${term}`);
  }
  if (normalized.includes("y")) {
    return Math.round(numericPart * 12);
  }
  return Math.round(numericPart);
};
var ensurePositiveFinite = (value, name) => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number`);
  }
};
var normalizeTerm = (term) => {
  if (typeof term === "number") {
    ensurePositiveFinite(term, "term");
    const rounded = Math.round(term);
    if (rounded === 0) {
      throw new RangeError("Term must be at least 1 month");
    }
    return rounded;
  }
  if (typeof term === "string") {
    return parseTermString(term);
  }
  if (typeof term === "object" && term !== null) {
    const { months, years } = term;
    if (years !== void 0) {
      ensurePositiveFinite(years, "years");
      return Math.round(years * 12);
    }
    if (months !== void 0) {
      ensurePositiveFinite(months, "months");
      const rounded = Math.round(months);
      if (rounded === 0) {
        throw new RangeError("Term must be at least 1 month");
      }
      return rounded;
    }
  }
  throw new TypeError("Unsupported loan term input");
};
var toMonthlyRate = (apr) => {
  if (!Number.isFinite(apr) || apr < 0) {
    throw new RangeError("APR must be a non-negative finite number");
  }
  return apr / 1200;
};
var amortization = (input) => {
  const termInMonths = normalizeTerm(input.term);
  if (termInMonths <= 0) {
    throw new RangeError("Loan term must be at least one month");
  }
  const principal = input.amountFinanced + (input.fees ?? 0);
  ensurePositiveFinite(principal, "amountFinanced + fees");
  if (principal === 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      termInMonths
    };
  }
  const monthlyRate = toMonthlyRate(input.apr);
  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termInMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termInMonths);
    monthlyPayment = principal * monthlyRate * factor / (factor - 1);
  }
  const roundedMonthly = roundToCents4(monthlyPayment);
  const totalPayment = roundToCents4(roundedMonthly * termInMonths);
  const totalInterest = roundToCents4(totalPayment - roundToCents4(principal));
  return {
    monthlyPayment: roundedMonthly,
    totalPayment,
    totalInterest,
    termInMonths
  };
};

// src/services/grossCalculator.service.ts
var roundToCents5 = (value) => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};
var sum = (values) => values.reduce((total, value) => total + value, 0);
var ensureNonNegative = (value, label) => {
  if (value === void 0) {
    return 0;
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative finite number`);
  }
  return value;
};
var normalizePercentage = (value, fallback = 0) => {
  if (value === void 0) {
    return fallback;
  }
  if (!Number.isFinite(value)) {
    throw new RangeError("Percentage inputs must be finite numbers");
  }
  return value;
};
var calculateFinanceReserve = (amountFinanced, markup, termMonths, participation) => {
  if (!Number.isFinite(amountFinanced) || amountFinanced < 0) {
    throw new RangeError("amountFinanced must be a non-negative finite number");
  }
  if (!Number.isFinite(termMonths) || termMonths <= 0) {
    return 0;
  }
  const normalizedParticipation = Math.min(Math.max(participation, 0), 1);
  const reserve = amountFinanced * (markup / 100) * (termMonths / 12) * normalizedParticipation;
  return roundToCents5(Math.max(reserve, 0));
};
var calculateGross = (input) => {
  const sellingPrice = ensureNonNegative(input.sellingPrice, "sellingPrice");
  const vehicleCost = ensureNonNegative(input.vehicleCost, "vehicleCost");
  const pack = ensureNonNegative(input.pack, "pack");
  const overAllow = ensureNonNegative(input.overAllow, "overAllow");
  const tradeReserve = ensureNonNegative(input.tradeReserve, "tradeReserve");
  const amountFinanced = input.amountFinanced ?? sellingPrice;
  if (!Number.isFinite(amountFinanced) || amountFinanced < 0) {
    throw new RangeError("amountFinanced must be a non-negative finite number");
  }
  const frontGross = roundToCents5(
    sellingPrice - vehicleCost - pack - overAllow + tradeReserve
  );
  const termMonths = input.termMonths ?? 0;
  const rateMarkup = normalizePercentage(input.rateMarkup);
  const participation = input.participation ?? 1;
  const financeReserve = calculateFinanceReserve(amountFinanced, rateMarkup, termMonths, participation);
  const backendProducts = (input.backendProducts ?? []).map((product) => {
    const revenue = ensureNonNegative(product.price, `backend product ${product.name} price`);
    const cost = ensureNonNegative(product.cost, `backend product ${product.name} cost`);
    const effectiveParticipation = product.participation ?? 1;
    const recognizedRevenue = revenue * effectiveParticipation;
    const recognizedCost = cost * effectiveParticipation;
    const gross = roundToCents5(recognizedRevenue - recognizedCost);
    return {
      id: product.id,
      name: product.name,
      revenue: roundToCents5(recognizedRevenue),
      cost: roundToCents5(recognizedCost),
      gross
    };
  });
  const backendGross = roundToCents5(sum(backendProducts.map((product) => product.gross)));
  const backendRevenue = roundToCents5(sum(backendProducts.map((product) => product.revenue)));
  const backendCost = roundToCents5(sum(backendProducts.map((product) => product.cost)));
  const totalGross = roundToCents5(frontGross + financeReserve + backendGross);
  const totalRevenue = roundToCents5(sellingPrice + backendRevenue + financeReserve + tradeReserve);
  const totalCost = roundToCents5(vehicleCost + pack + overAllow + backendCost);
  return {
    frontGross,
    financeReserve,
    backendGross,
    totalGross,
    totalRevenue,
    totalCost,
    backendProducts
  };
};

// src/services/dealOptimizer.service.ts
var RETAIL_CLOSED_STATUSES = [
  RetailDealStatus.APPROVED,
  RetailDealStatus.FUNDED,
  RetailDealStatus.DELIVERED
];
var CREDIT_TIER_VALUES = [
  "TIER_1",
  "TIER_2",
  "TIER_3",
  "TIER_4",
  "TIER_5",
  "TIER_6"
];
var toCreditTier = (value) => CREDIT_TIER_VALUES.includes(value) ? value : "TIER_1";
var roundToCents6 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
var decimalToNumber3 = (value) => {
  if (value == null) {
    return null;
  }
  if (value instanceof Prisma11.Decimal) {
    return value.toNumber();
  }
  const parsed = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};
var sum2 = (values) => values.reduce((total, value) => total + value, 0);
var isJsonObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var parseWorksheetSnapshot = (value) => {
  if (!isJsonObject(value)) {
    return null;
  }
  if (!("structure" in value) || !("payment" in value)) {
    return null;
  }
  return value;
};
var parseGrossSnapshot = (value) => {
  if (!isJsonObject(value)) {
    return void 0;
  }
  return value;
};
function normalizeObjectiveWeights(base, override) {
  const merged = {
    gross_weight: base.gross_weight,
    close_weight: base.close_weight,
    approval_weight: base.approval_weight,
    payment_weight: base.payment_weight
  };
  if (override) {
    for (const [key, value] of Object.entries(override)) {
      if (value == null || Number.isNaN(value)) {
        continue;
      }
      switch (key) {
        case "gross_weight":
          merged.gross_weight = value;
          break;
        case "close_weight":
          merged.close_weight = value;
          break;
        case "approval_weight":
          merged.approval_weight = value;
          break;
        case "payment_weight":
          merged.payment_weight = value;
          break;
        default:
          break;
      }
    }
  }
  const total = merged.gross_weight + merged.close_weight + merged.approval_weight + merged.payment_weight;
  if (total <= 0) {
    return merged;
  }
  const normalize = (value) => value / total;
  return {
    gross_weight: normalize(merged.gross_weight),
    close_weight: normalize(merged.close_weight),
    approval_weight: normalize(merged.approval_weight),
    payment_weight: normalize(merged.payment_weight)
  };
}
function deriveStructureFinancials(structure) {
  const dealerDiscounts = sum2((structure.pricing.dealerDiscounts ?? []).map((line) => line.amount));
  const accessories = sum2((structure.pricing.accessories ?? []).map((line) => line.amount));
  const fees = sum2(structure.fees.map((fee) => fee.amount));
  const taxes = sum2(structure.taxes.map((tax) => tax.amount));
  const backend = sum2((structure.backendProducts ?? []).map((product) => product.price));
  const cashDownBreakdown = structure.cashDown ? [
    structure.cashDown.customerCash,
    structure.cashDown.manufacturerRebate,
    structure.cashDown.tradeEquity
  ].filter((value) => typeof value === "number") : [];
  const cashDown = structure.cashDown?.total ?? sum2(cashDownBreakdown);
  const tradeAllowance = structure.trade?.allowance ?? 0;
  const tradePayoff = structure.trade?.payoff ?? 0;
  const tradeEquity = structure.trade?.equity ?? roundToCents6(tradeAllowance - tradePayoff);
  const basePrice = roundToCents6(structure.pricing.salePrice - dealerDiscounts + accessories);
  const advanceValue = structure.pricing.msrp ?? structure.pricing.salePrice;
  const amountFinanced = roundToCents6(basePrice - cashDown - tradeEquity + fees + taxes + backend);
  const dueAtSigning = roundToCents6(Math.max(cashDown + fees + taxes, 0));
  return {
    basePrice,
    dealerDiscounts,
    accessories,
    fees,
    taxes,
    backend,
    cashDown,
    tradeAllowance,
    tradePayoff,
    tradeEquity,
    amountFinanced: Math.max(amountFinanced, 0),
    dueAtSigning,
    advanceValue: Math.max(roundToCents6(advanceValue), 1)
  };
}
function buildPayment(amountFinanced, apr, termMonths, dueAtSigning) {
  const schedule = amortization({ amountFinanced, apr, term: termMonths });
  return {
    amountFinanced: roundToCents6(amountFinanced),
    apr,
    termMonths: schedule.termInMonths,
    monthlyPayment: roundToCents6(schedule.monthlyPayment),
    dueAtSigning: roundToCents6(dueAtSigning)
  };
}
function buildTotals(structure, metrics, payment) {
  return {
    salePrice: structure.pricing.salePrice,
    tradeAllowance: metrics.tradeAllowance,
    tradePayoff: metrics.tradePayoff,
    tradeEquity: metrics.tradeEquity,
    cashDown: metrics.cashDown,
    fees: metrics.fees,
    backendProducts: metrics.backend,
    taxes: metrics.taxes,
    amountFinanced: payment.amountFinanced,
    dueAtSigning: payment.dueAtSigning ?? metrics.dueAtSigning
  };
}
function buildGross(structure, metrics, payment, vehicleCost) {
  const gross = calculateGross({
    sellingPrice: structure.pricing.salePrice,
    vehicleCost: vehicleCost?.cost ?? structure.pricing.salePrice * 0.88,
    pack: vehicleCost?.pack,
    overAllow: Math.max(metrics.tradePayoff - metrics.tradeAllowance, 0),
    tradeReserve: Math.max(metrics.tradeEquity, 0),
    amountFinanced: payment.amountFinanced,
    termMonths: payment.termMonths,
    rateMarkup: 0,
    participation: 1,
    backendProducts: (structure.backendProducts ?? []).map((product) => ({
      id: product.code,
      name: product.name,
      price: product.price,
      cost: product.cost ?? 0,
      participation: 1
    }))
  });
  return {
    frontEnd: roundToCents6(gross.frontGross),
    backEnd: roundToCents6(gross.backendGross),
    financeReserve: roundToCents6(gross.financeReserve),
    docFee: structure.fees.find((fee) => fee.code.toLowerCase().includes("doc"))?.amount,
    pack: vehicleCost?.pack ? roundToCents6(vehicleCost.pack) : void 0,
    total: roundToCents6(gross.totalGross)
  };
}
async function loadVehicleCost(tenantId, vehicle) {
  const where = vehicle.id ? { tenantId, id: vehicle.id } : vehicle.vin ? { tenantId, vin: vehicle.vin } : null;
  if (!where) {
    return null;
  }
  const record = await prisma.vehicle.findFirst({ where });
  if (!record) {
    return null;
  }
  const cost = decimalToNumber3(record.acquisitionCost) ?? decimalToNumber3(record.invoiceCost) ?? decimalToNumber3(record.marketValue) ?? decimalToNumber3(record.msrp) ?? 0;
  const pack = decimalToNumber3(record.reconActual) ?? decimalToNumber3(record.reconEstimate) ?? void 0;
  return { cost, pack: pack ?? void 0 };
}
function toMarketComparableSummary(summary) {
  const contextSummary = {
    sampleSize: summary.sampleSize,
    averagePrice: summary.averagePrice,
    medianPrice: summary.medianPrice,
    minPrice: summary.minPrice,
    maxPrice: summary.maxPrice,
    stdDeviation: summary.stdDeviation
  };
  const rangeResult = competitiveRange(summary);
  const range = {
    floor: rangeResult.floor,
    target: rangeResult.target,
    ceiling: rangeResult.ceiling
  };
  const comparables = summary.comparables.map((sale) => ({
    vehicle: {
      vin: sale.vehicle.vin,
      year: sale.vehicle.year,
      make: sale.vehicle.make,
      model: sale.vehicle.model,
      trim: sale.vehicle.trim,
      segment: sale.vehicle.segment
    },
    salePrice: sale.salePrice,
    saleDate: sale.saleDate instanceof Date ? sale.saleDate.toISOString() : sale.saleDate,
    daysInStock: sale.daysInStock,
    mileage: sale.mileage,
    source: sale.source
  }));
  return {
    summary: contextSummary,
    competitiveRange: range,
    comparables
  };
}
function toSimilarDealsContext(result) {
  const deals = result.deals.map((deal) => ({
    id: deal.id,
    status: deal.status,
    closeDate: deal.closeDate instanceof Date ? deal.closeDate.toISOString() : deal.closeDate,
    vehicle: {
      vin: deal.vehicle.vin,
      year: deal.vehicle.year,
      make: deal.vehicle.make,
      model: deal.vehicle.model,
      trim: deal.vehicle.trim
    },
    frontGross: deal.frontGross,
    financeReserve: deal.financeReserve,
    totalGross: deal.totalGross
  }));
  const metrics = {
    sampleSize: result.metrics.sampleSize,
    averageFrontGross: result.metrics.averageFrontGross,
    averageReserve: result.metrics.averageReserve,
    averageTotalGross: result.metrics.averageTotalGross,
    closeRate: result.metrics.closeRate
  };
  return { deals, metrics };
}
function buildRateSheetTier(lender, program, tier, index, total) {
  const minScore = lender.minCreditScore ?? 300;
  const maxScore = lender.maxCreditScore ?? 850;
  const span = Math.max(Math.floor((maxScore - minScore + 1) / total), 1);
  const lower = minScore + span * index;
  const upper = index === total - 1 ? maxScore : lower + span - 1;
  return {
    id: `${lender.id}:${tier.tier}:${index}`,
    tier: tier.tier,
    minScore: lower,
    maxScore: upper,
    buyRate: tier.apr,
    sellRate: tier.reserve != null ? tier.apr + tier.reserve * 100 : tier.apr,
    participation: tier.reserve ?? void 0,
    maxTermMonths: tier.maxTerm,
    maxReserve: tier.reserve ?? void 0,
    effectiveFrom: new Date(program.effectiveFrom),
    effectiveTo: program.effectiveTo ? new Date(program.effectiveTo) : void 0
  };
}
function parseLenderProfiles(tenantId, records) {
  return records.map((record) => {
    const credentials3 = record.apiCredentials ?? {};
    const sheets = (credentials3.rateSheets ?? []).flatMap(
      (sheet) => (sheet.tiers ?? []).map(
        (tier, index, array) => buildRateSheetTier(
          {
            id: record.id,
            tenantId,
            name: record.name,
            status: record.isActive ? "active" : "inactive",
            rateSheets: [],
            maxReserve: void 0,
            maxLtv: decimalToNumber3(record.maxLtv) ?? void 0,
            maxPti: void 0,
            maxTermMonths: record.maxTerm ?? void 0,
            minCreditScore: record.minCreditScore ?? void 0,
            maxCreditScore: record.maxCreditScore ?? void 0
          },
          sheet,
          tier,
          index,
          array.length
        )
      )
    );
    return {
      id: record.id,
      tenantId,
      name: record.name,
      status: record.isActive ? "active" : "inactive",
      rateSheets: sheets,
      maxReserve: void 0,
      maxLtv: decimalToNumber3(record.maxLtv) ?? void 0,
      maxPti: void 0,
      maxTermMonths: record.maxTerm ?? void 0,
      minCreditScore: record.minCreditScore ?? void 0,
      maxCreditScore: record.maxCreditScore ?? void 0
    };
  });
}
function summarizeViolations(violations) {
  return violations.map((violation) => ({
    code: violation.code,
    message: violation.message,
    limit: violation.limit,
    actual: violation.actual
  }));
}
async function buildLenderCriteria(tenantId, request, metrics) {
  const lenders = await prisma.lender.findMany({
    where: { tenantId, isActive: true },
    select: {
      id: true,
      name: true,
      apiCredentials: true,
      isActive: true,
      maxLtv: true,
      maxTerm: true,
      minCreditScore: true,
      maxCreditScore: true
    }
  });
  if (lenders.length === 0) {
    return [];
  }
  const profiles = parseLenderProfiles(tenantId, lenders);
  const active = getActiveLenders(tenantId, profiles);
  const contextDeal = {
    amountFinanced: metrics.amountFinanced,
    advanceValue: metrics.advanceValue,
    monthlyPayment: request.currentPayment.monthlyPayment,
    termMonths: request.currentPayment.termMonths,
    reserveAmount: 0
  };
  const customer = {
    creditScore: request.customerProfile.creditScore,
    monthlyIncome: Math.max(request.customerProfile.monthlyIncome ?? 1, 1),
    monthlyDebt: request.customerProfile.debtToIncomeRatio && request.customerProfile.monthlyIncome ? request.customerProfile.debtToIncomeRatio * request.customerProfile.monthlyIncome : void 0
  };
  const entries = [];
  for (const lender of active) {
    let violations = [];
    try {
      violations = listViolations({ customer, deal: contextDeal }, lender);
    } catch (error) {
      if (true) {
        console.warn("Unable to evaluate lender criteria", { lenderId: lender.id, error });
      }
      violations = [];
    }
    entries.push({
      lenderId: lender.id,
      lenderName: lender.name,
      maxTermMonths: lender.maxTermMonths,
      maxLtv: lender.maxLtv,
      maxPti: lender.maxPti,
      tiers: lender.activeRateSheets.map((tier) => ({
        id: tier.id,
        tier: toCreditTier(tier.tier),
        minScore: tier.minScore,
        maxScore: tier.maxScore,
        buyRate: tier.buyRate,
        sellRate: tier.sellRate,
        participation: tier.participation,
        maxTermMonths: tier.maxTermMonths,
        maxReserve: tier.maxReserve
      })),
      violations: summarizeViolations(violations)
    });
  }
  return entries;
}
async function createOptimizationVersion(tenantId, dealId, worksheetId, userId, structure, payment, gross) {
  const metrics = deriveStructureFinancials(structure);
  const totals = buildTotals(structure, metrics, payment);
  const version = await prisma.dealVersion.create({
    data: {
      tenantId,
      dealId,
      worksheetId,
      snapshot: toInputJson({ structure, totals, payment }),
      grossBreakdown: gross ? toInputJson(gross) : void 0,
      createdById: userId,
      label: "AI Recommendation"
    }
  });
  await prisma.dealWorksheet.update({
    where: { id: worksheetId },
    data: { versionPointerId: version.id }
  });
  return {
    id: version.id,
    dealId: version.dealId,
    worksheetId: version.worksheetId,
    label: version.label,
    closeProbability: null,
    approvalProbability: null,
    aiScore: null,
    grossBreakdown: gross ?? null,
    createdAt: version.createdAt.toISOString()
  };
}
function ensureOptionMetrics(option, vehicleCost, fallbackPayment) {
  const metrics = deriveStructureFinancials(option.structure);
  const payment = option.payment ?? fallbackPayment;
  const normalizedPayment = buildPayment(
    payment.amountFinanced && payment.amountFinanced > 0 ? payment.amountFinanced : metrics.amountFinanced,
    payment.apr ?? fallbackPayment.apr,
    payment.termMonths && payment.termMonths > 0 ? payment.termMonths : fallbackPayment.termMonths,
    metrics.dueAtSigning
  );
  const gross = buildGross(option.structure, metrics, normalizedPayment, vehicleCost);
  return {
    ...option,
    payment: normalizedPayment,
    gross,
    rebuttalScript: generateRebuttal(option.label, normalizedPayment, gross, fallbackPayment)
  };
}
function generateRebuttal(label, payment, gross, baseline) {
  const delta = payment.monthlyPayment - baseline.monthlyPayment;
  const change = delta === 0 ? "matches your target payment" : delta > 0 ? `is $${Math.abs(delta).toFixed(2)} higher` : `saves $${Math.abs(delta).toFixed(2)}`;
  return `${label}: Payment ${change} with total gross of $${gross.total.toFixed(2)} keeps the deal approvable.`;
}
async function optimizeDeal(params) {
  const { tenantId, dealId, userId, request, requestId, scoringOverride } = params;
  const vehicleContext = {
    vin: request.vehicle.vin,
    year: request.vehicle.year,
    make: request.vehicle.make,
    model: request.vehicle.model,
    trim: request.vehicle.trim
  };
  const [vehicleCost, marketData, similarDeals] = await Promise.all([
    loadVehicleCost(tenantId, { id: request.vehicle.id, vin: request.vehicle.vin }),
    (async () => {
      const comparables = await prisma.marketComp.findMany({
        where: request.vehicle.id ? { tenantId, vehicleId: request.vehicle.id } : {
          tenantId,
          vehicle: {
            make: { equals: request.vehicle.make, mode: "insensitive" },
            model: { equals: request.vehicle.model, mode: "insensitive" }
          }
        },
        orderBy: { listedAt: "desc" },
        take: 50
      });
      const comparableSales = comparables.map((comp) => ({
        vehicle: {
          vin: comp.compVin ?? void 0,
          year: comp.year ?? request.vehicle.year,
          make: comp.make ?? request.vehicle.make,
          model: comp.model ?? request.vehicle.model,
          trim: comp.trim ?? void 0,
          segment: void 0
        },
        salePrice: decimalToNumber3(comp.price) ?? request.vehicle.salePrice ?? request.structure.pricing.salePrice,
        saleDate: comp.listedAt ?? /* @__PURE__ */ new Date(),
        daysInStock: comp.distance ?? void 0,
        mileage: comp.mileage ?? void 0,
        source: comp.source ?? void 0
      }));
      const summary = getMarketData(vehicleContext, comparableSales);
      return toMarketComparableSummary({ ...summary, comparables: comparableSales });
    })(),
    (async () => {
      const deals = await prisma.deal.findMany({
        where: {
          tenantId,
          status: { in: RETAIL_CLOSED_STATUSES },
          vehicle: {
            make: { equals: request.vehicle.make, mode: "insensitive" },
            model: { equals: request.vehicle.model, mode: "insensitive" }
          }
        },
        include: { vehicle: true },
        orderBy: { dealDate: "desc" },
        take: 100
      });
      const snapshots = deals.map((deal) => ({
        id: deal.id,
        status: "closed",
        closeDate: deal.dealDate,
        vehicle: {
          vin: deal.vehicle.vin,
          year: deal.vehicle.year,
          make: deal.vehicle.make,
          model: deal.vehicle.model,
          trim: deal.vehicle.trim ?? void 0
        },
        frontGross: decimalToNumber3(deal.frontEndGross) ?? 0,
        financeReserve: decimalToNumber3(deal.dealerReserve) ?? 0,
        totalGross: decimalToNumber3(deal.totalGross) ?? void 0
      }));
      const result2 = findSimilarDeals(vehicleContext, snapshots);
      return toSimilarDealsContext(result2);
    })()
  ]);
  const structureMetrics = deriveStructureFinancials(request.structure);
  const lenderCriteria = await buildLenderCriteria(tenantId, request, structureMetrics);
  const scoringConfig = getScoringConfig();
  const effectiveObjectives = normalizeObjectiveWeights(scoringConfig.objectives, scoringOverride ?? void 0);
  const scoringSnapshot = structuredClone(scoringConfig);
  scoringSnapshot.objectives = effectiveObjectives;
  const payload = {
    ...request,
    ...scoringOverride ? { scoringOverride: scoringSnapshot.objectives } : {},
    marketData,
    similarDeals,
    lenderCriteria,
    scoringConfig: scoringSnapshot
  };
  const { result, traceId } = await mlService.optimizeDeal(payload, { tenantId, requestId });
  const recommendedMetrics = deriveStructureFinancials(result.recommendedStructure);
  const recommendedPayment = buildPayment(
    recommendedMetrics.amountFinanced,
    request.currentPayment.apr,
    request.currentPayment.termMonths,
    recommendedMetrics.dueAtSigning
  );
  const recommendedGross = buildGross(result.recommendedStructure, recommendedMetrics, recommendedPayment, vehicleCost);
  const alternatives = result.alternatives.map((alternative) => {
    const metrics = deriveStructureFinancials(alternative.structure);
    const payment = buildPayment(
      alternative.payment.amountFinanced ?? metrics.amountFinanced,
      alternative.payment.apr ?? request.currentPayment.apr,
      alternative.payment.termMonths ?? request.currentPayment.termMonths,
      metrics.dueAtSigning
    );
    const gross = buildGross(alternative.structure, metrics, payment, vehicleCost);
    return {
      ...alternative,
      payment,
      gross
    };
  });
  const enrichedResponse = {
    ...result,
    worksheetId: result.worksheetId ?? request.worksheetId ?? "",
    versionId: result.versionId,
    recommendedStructure: result.recommendedStructure,
    projectedGross: recommendedGross,
    alternatives
  };
  let version = null;
  if (request.worksheetId) {
    version = await createOptimizationVersion(
      tenantId,
      dealId,
      request.worksheetId,
      userId,
      result.recommendedStructure,
      recommendedPayment,
      recommendedGross
    );
    enrichedResponse.versionId = version.id;
  }
  if (traceId) {
    console.info("ML optimizeDeal trace", { tenantId, dealId, traceId });
  }
  const optimization = await recordOptimization(tenantId, dealId, userId, request, enrichedResponse, traceId);
  return { optimization, recommendation: enrichedResponse, version, traceId };
}
async function analyzeCounter(params) {
  const { tenantId, dealId, userId, request, requestId } = params;
  const version = await prisma.dealVersion.findFirst({
    where: { tenantId, dealId, id: request.versionId }
  });
  if (!version) {
    throw new Error("Base version not found for counter analysis.");
  }
  const snapshot = parseWorksheetSnapshot(version.snapshot);
  if (!snapshot) {
    throw new Error("Stored version snapshot is missing desking data.");
  }
  const worksheet = request.worksheetId ? await prisma.dealWorksheet.findFirst({
    where: { tenantId, id: request.worksheetId },
    include: { vehicle: true }
  }) : null;
  const vehicleLookup = worksheet ? { id: worksheet.vehicleId } : { id: snapshot.structure.trade?.vehicle?.id, vin: snapshot.structure.trade?.vehicle?.vin };
  const vehicleCost = await loadVehicleCost(tenantId, vehicleLookup);
  const vehicleContext = {
    vin: worksheet?.vehicle?.vin ?? snapshot.structure.trade?.vehicle?.vin ?? "",
    year: worksheet?.vehicle?.year ?? snapshot.structure.trade?.vehicle?.year ?? request.customerInput.requestedTerm ?? (/* @__PURE__ */ new Date()).getFullYear(),
    make: worksheet?.vehicle?.make ?? snapshot.structure.trade?.vehicle?.make ?? request.customerInput.customerConcern,
    model: worksheet?.vehicle?.model ?? snapshot.structure.trade?.vehicle?.model ?? "Vehicle",
    trim: worksheet?.vehicle?.trim ?? snapshot.structure.trade?.vehicle?.trim ?? void 0
  };
  const comparables = await prisma.marketComp.findMany({
    where: worksheet ? { tenantId, vehicleId: worksheet.vehicleId } : { tenantId, vehicle: { make: { equals: vehicleContext.make, mode: "insensitive" } } },
    orderBy: { listedAt: "desc" },
    take: 50
  });
  const comparableSales = comparables.map((comp) => ({
    vehicle: {
      vin: comp.compVin ?? void 0,
      year: comp.year ?? vehicleContext.year,
      make: comp.make ?? vehicleContext.make,
      model: comp.model ?? vehicleContext.model,
      trim: comp.trim ?? void 0,
      segment: void 0
    },
    salePrice: decimalToNumber3(comp.price) ?? snapshot.structure.pricing.salePrice,
    saleDate: comp.listedAt ?? /* @__PURE__ */ new Date(),
    daysInStock: comp.distance ?? void 0,
    mileage: comp.mileage ?? void 0,
    source: comp.source ?? void 0
  }));
  const marketSummary = toMarketComparableSummary({ ...getMarketData(vehicleContext, comparableSales), comparables: comparableSales });
  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      status: { in: RETAIL_CLOSED_STATUSES },
      vehicle: worksheet ? { id: worksheet.vehicleId } : { make: { equals: vehicleContext.make, mode: "insensitive" }, model: { equals: vehicleContext.model, mode: "insensitive" } }
    },
    include: { vehicle: true },
    orderBy: { dealDate: "desc" },
    take: 100
  });
  const similarSnapshots = deals.map((deal) => ({
    id: deal.id,
    status: "closed",
    closeDate: deal.dealDate,
    vehicle: {
      vin: deal.vehicle.vin,
      year: deal.vehicle.year,
      make: deal.vehicle.make,
      model: deal.vehicle.model,
      trim: deal.vehicle.trim ?? void 0
    },
    frontGross: decimalToNumber3(deal.frontEndGross) ?? 0,
    financeReserve: decimalToNumber3(deal.dealerReserve) ?? 0,
    totalGross: decimalToNumber3(deal.totalGross) ?? void 0
  }));
  const similarContext = toSimilarDealsContext(findSimilarDeals(vehicleContext, similarSnapshots));
  const payload = {
    ...request,
    originalStructure: snapshot.structure,
    originalPayment: snapshot.payment,
    originalGross: parseGrossSnapshot(version.grossBreakdown),
    marketData: marketSummary,
    similarDeals: similarContext
  };
  const { result, traceId } = await mlService.analyzeCounter(payload, { tenantId, requestId });
  const normalizedOptions = result.options.map((option) => ensureOptionMetrics(option, vehicleCost, snapshot.payment));
  const analysis = {
    ...result,
    options: normalizedOptions.map((option) => ({
      ...option,
      rebuttalScript: generateRebuttal(option.label, option.payment, option.gross, snapshot.payment)
    }))
  };
  if (!analysis.recommendedOptionId && analysis.options.length > 0) {
    analysis.recommendedOptionId = analysis.options[0].id;
  }
  if (traceId) {
    console.info("ML analyzeCounter trace", { tenantId, dealId, traceId });
  }
  const counter = await recordCounterOffer(tenantId, dealId, userId, request, analysis);
  return { counter, analysis, traceId };
}

// src/services/approvalPredictor.service.ts
function cloneStructure(structure) {
  return JSON.parse(JSON.stringify(structure));
}
async function predictApprovals(params, options = {}) {
  const { tenantId, dealId, worksheetId, versionId, structure, customer, vehicle, payment, requestId, lenderIds } = params;
  const lenders = await prisma.lender.findMany({
    where: {
      tenantId,
      isActive: true,
      ...lenderIds && lenderIds.length > 0 ? { id: { in: lenderIds } } : {}
    },
    select: { id: true, name: true, maxTerm: true }
  });
  const traceMap = {};
  const approvals = [];
  for (const lender of lenders) {
    const request = {
      dealId,
      worksheetId,
      versionId,
      lenderId: lender.id,
      structure: cloneStructure(structure),
      customerProfile: customer,
      vehicle,
      payment
    };
    const { result, traceId } = await mlService.predictApproval(request, { tenantId, requestId });
    approvals.push(result);
    traceMap[lender.id] = traceId;
    if (traceId) {
      console.info("ML predictApproval trace", { tenantId, dealId, lenderId: lender.id, traceId });
    }
    if (options.persist !== false) {
      await recordApproval(tenantId, dealId, result);
    }
  }
  return { approvals, traces: traceMap };
}

// src/workers/deskingWorker.ts
import { randomUUID as randomUUID3 } from "crypto";
var queue2 = [];
var activeJobs = 0;
var MAX_CONCURRENCY = 2;
function scheduleNext() {
  if (activeJobs >= MAX_CONCURRENCY) {
    return;
  }
  const job = queue2.shift();
  if (!job) {
    return;
  }
  activeJobs += 1;
  job.execute().then((result) => {
    job.resolve(result);
  }).catch((error) => {
    if (job.attemptsRemaining > 0) {
      job.attemptsRemaining -= 1;
      queue2.push(job);
    } else {
      job.reject(error);
    }
  }).finally(() => {
    activeJobs -= 1;
    scheduleNext();
  });
}
function enqueueDeskingJob(execute, options = {}) {
  return new Promise((resolve, reject) => {
    const job = {
      id: randomUUID3(),
      attemptsRemaining: options.retries ?? 2,
      execute,
      resolve: (value) => resolve(value),
      reject
    };
    queue2.push(job);
    scheduleNext();
  });
}

// src/controllers/desking.controller.ts
var SALES_ROLE = "SALES";
var MANAGER_ROLE = "MANAGER";
function sendError(res, error) {
  const normalized = toApiError(error);
  const payload = {
    code: normalized.code,
    message: normalized.message
  };
  if (typeof normalized.details !== "undefined") {
    payload.details = normalized.details;
  }
  res.status(normalized.status).json(payload);
}
async function fetchWorksheet(req, res) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const worksheet = await getWorksheet(tenantId, dealId);
    const [versions, optimizations, counterOffers, approvals] = await Promise.all([
      listVersions(tenantId, dealId),
      listOptimizations(tenantId, dealId),
      listCounterOffers(tenantId, dealId),
      listApprovals(tenantId, dealId)
    ]);
    res.json({
      data: {
        worksheet,
        versions,
        optimizations,
        counterOffers,
        approvals
      }
    });
  } catch (error) {
    sendError(res, error);
  }
}
async function upsertWorksheet(req, res) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId, userId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = worksheetSaveSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError("INVALID_WORKSHEET", "Worksheet payload is invalid.", {
        status: 400,
        details: parsed.error.flatten()
      });
    }
    const payload = parsed.data;
    const result = await saveWorksheet(tenantId, dealId, userId, {
      ...payload,
      status: payload.status
    });
    res.status(result.version ? 201 : 200).json({ data: result });
  } catch (error) {
    sendError(res, error);
  }
}
async function printWorksheet(req, res) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = worksheetPrintSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError("INVALID_PRINT_REQUEST", "Print payload is invalid.", {
        status: 400,
        details: parsed.error.flatten()
      });
    }
    const payload = parsed.data;
    const { worksheetId } = payload;
    const context = await getWorksheetPrintContext(tenantId, worksheetId);
    if (context.worksheet.dealId !== dealId) {
      throw new ApiError("WORKSHEET_MISMATCH", "Worksheet does not belong to the specified deal.", { status: 400 });
    }
    const result = await enqueueDeskingJob(
      async () => {
        const pdf = await renderWorksheetPreview({
          dealId,
          worksheetId,
          customerName: `${context.customer.firstName} ${context.customer.lastName}`.trim(),
          vehicle: {
            vin: context.vehicle.vin,
            year: context.vehicle.year,
            make: context.vehicle.make,
            model: context.vehicle.model,
            trim: context.vehicle.trim,
            stockNumber: context.vehicle.stockNumber
          },
          salesperson: context.salesperson?.displayName ?? null,
          structure: context.worksheet.structure,
          payment: context.worksheet.payment,
          gross: context.worksheet.totals.totalGross ? {
            frontEnd: context.worksheet.totals.frontEndGross ?? 0,
            backEnd: context.worksheet.totals.backEndGross ?? 0,
            financeReserve: context.worksheet.totals.financeReserve,
            docFee: void 0,
            pack: void 0,
            total: context.worksheet.totals.totalGross
          } : null,
          totals: context.worksheet.totals,
          versionLabel: context.versionLabel ?? payload.versionId ?? null
        });
        const key = ["desking", tenantId, dealId, worksheetId, `${Date.now()}.pdf`].join("/");
        const upload = await uploadBufferToS3({
          key,
          body: pdf,
          contentType: "application/pdf",
          metadata: { dealId, worksheetId }
        });
        const worksheet = await updateWorksheetPrintUrl(tenantId, worksheetId, upload.url);
        return {
          url: upload.url,
          worksheet
        };
      },
      { retries: 3 }
    );
    res.status(201).json({ data: result });
  } catch (error) {
    sendError(res, error);
  }
}
async function optimizeWorksheet(req, res) {
  try {
    assertRole(req, MANAGER_ROLE);
    const { tenantId, userId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = optimizeDealSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError("INVALID_OPTIMIZATION_REQUEST", "Optimization payload is invalid.", {
        status: 400,
        details: parsed.error.flatten()
      });
    }
    const payload = parsed.data;
    if (payload.dealId !== dealId) {
      throw new ApiError("DEAL_MISMATCH", "Optimization request deal does not match URL parameter.", { status: 400 });
    }
    const requestId = req.get("x-request-id") ?? void 0;
    const rawOverride = req.body?.scoringOverride;
    const scoringOverride = rawOverride && typeof rawOverride === "object" ? {
      gross_weight: typeof rawOverride.gross_weight === "number" ? rawOverride.gross_weight : void 0,
      close_weight: typeof rawOverride.close_weight === "number" ? rawOverride.close_weight : void 0,
      approval_weight: typeof rawOverride.approval_weight === "number" ? rawOverride.approval_weight : void 0,
      payment_weight: typeof rawOverride.payment_weight === "number" ? rawOverride.payment_weight : void 0
    } : void 0;
    const { optimization, recommendation, version, traceId } = await optimizeDeal({
      tenantId,
      dealId,
      userId,
      request: payload,
      requestId,
      scoringOverride
    });
    res.status(201).json({ data: { optimization, recommendation, version, traceId } });
  } catch (error) {
    sendError(res, error);
  }
}
async function analyzeCounterOffer(req, res) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId, userId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = counterAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError("INVALID_COUNTER_REQUEST", "Counter analysis payload is invalid.", {
        status: 400,
        details: parsed.error.flatten()
      });
    }
    const payload = parsed.data;
    if (payload.dealId !== dealId) {
      throw new ApiError("DEAL_MISMATCH", "Counter analysis deal does not match URL parameter.", { status: 400 });
    }
    const requestId = req.get("x-request-id") ?? void 0;
    const { counter, analysis, traceId } = await analyzeCounter({
      tenantId,
      dealId,
      userId,
      request: payload,
      requestId
    });
    res.status(201).json({ data: { counter, analysis, traceId } });
  } catch (error) {
    sendError(res, error);
  }
}
async function listWorksheetVersions(req, res) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const versions = await listVersions(tenantId, dealId);
    res.json({ data: versions });
  } catch (error) {
    sendError(res, error);
  }
}
async function selectWorksheetVersion(req, res) {
  try {
    assertRole(req, MANAGER_ROLE);
    const { tenantId, userId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = versionSelectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError("INVALID_VERSION_SELECTION", "Version selection payload is invalid.", {
        status: 400,
        details: parsed.error.flatten()
      });
    }
    const payload = parsed.data;
    const worksheet = await selectVersion(tenantId, dealId, payload.worksheetId, payload.versionId, userId);
    res.json({ data: worksheet });
  } catch (error) {
    sendError(res, error);
  }
}
async function listApprovalPredictions(req, res) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const approvals = await listApprovals(tenantId, dealId);
    res.json({ data: approvals });
  } catch (error) {
    sendError(res, error);
  }
}
async function refreshApprovalPrediction(req, res) {
  try {
    assertRole(req, MANAGER_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = approvalRefreshSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError("INVALID_APPROVAL_REQUEST", "Approval refresh payload is invalid.", {
        status: 400,
        details: parsed.error.flatten()
      });
    }
    const payload = parsed.data;
    if (payload.dealId !== dealId) {
      throw new ApiError("DEAL_MISMATCH", "Approval prediction deal does not match URL parameter.", { status: 400 });
    }
    const requestId = req.get("x-request-id") ?? void 0;
    const { approvals, traces } = await predictApprovals({
      tenantId,
      dealId,
      worksheetId: payload.worksheetId,
      versionId: payload.versionId,
      structure: payload.structure,
      customer: payload.customerProfile,
      vehicle: payload.vehicle,
      payment: payload.payment,
      requestId,
      lenderIds: payload.lenderId ? [payload.lenderId] : void 0
    });
    res.status(201).json({ data: { approvals, traces } });
  } catch (error) {
    sendError(res, error);
  }
}

// src/services/tax.service.ts
var STATE_TAX_DATA = {
  CA: {
    baseTaxRate: 0.0725,
    // 7.25%
    docFee: 85,
    titleFee: 23,
    registrationFee: 60,
    plateFee: 23,
    localTaxByCounty: {
      // Add specific counties if needed
      "Los Angeles": 0.0175,
      // Additional 1.75%
      "San Francisco": 0.015,
      "San Diego": 0.01
    }
  },
  TX: {
    baseTaxRate: 0.0625,
    // 6.25%
    docFee: 150,
    titleFee: 33,
    registrationFee: 75,
    plateFee: 50.75
  },
  FL: {
    baseTaxRate: 0.06,
    // 6%
    docFee: 399.99,
    // FL allows up to $899
    titleFee: 77.25,
    registrationFee: 225,
    plateFee: 28
  },
  NY: {
    baseTaxRate: 0.04,
    // 4%
    docFee: 175,
    titleFee: 50,
    registrationFee: 140,
    plateFee: 25
  },
  // Default for other states
  DEFAULT: {
    baseTaxRate: 0.065,
    // 6.5%
    docFee: 200,
    titleFee: 50,
    registrationFee: 100,
    plateFee: 30
  }
};
function getStateFromZip(zipCode) {
  const zip = zipCode.substring(0, 3);
  const zipNum = parseInt(zip, 10);
  if (zipNum >= 900 && zipNum <= 961) return "CA";
  if (zipNum >= 750 && zipNum <= 799 || zipNum === 885) return "TX";
  if (zipNum >= 320 && zipNum <= 349) return "FL";
  if (zipNum >= 100 && zipNum <= 149) return "NY";
  return "DEFAULT";
}
function calculateTax(input) {
  const { salePrice, zipCode, state, isNew = false } = input;
  const actualState = state || getStateFromZip(zipCode);
  const taxData = STATE_TAX_DATA[actualState] || STATE_TAX_DATA.DEFAULT;
  let totalTaxRate = taxData.baseTaxRate;
  if (actualState === "CA" && zipCode.startsWith("90")) {
    totalTaxRate += 0.0175;
  }
  const salesTaxAmount = salePrice * totalTaxRate;
  const registrationFee = isNew ? taxData.registrationFee * 1.2 : taxData.registrationFee;
  const breakdown = [
    { label: `Sales Tax (${(totalTaxRate * 100).toFixed(2)}%)`, amount: salesTaxAmount },
    { label: "Documentation Fee", amount: taxData.docFee },
    { label: "Title Fee", amount: taxData.titleFee },
    { label: "Registration Fee", amount: registrationFee },
    { label: "License Plate Fee", amount: taxData.plateFee }
  ];
  const totalTaxesAndFees = breakdown.reduce((sum3, item) => sum3 + item.amount, 0);
  return {
    salesTaxRate: totalTaxRate,
    salesTaxAmount,
    registrationFee,
    docFee: taxData.docFee,
    titleFee: taxData.titleFee,
    plateFee: taxData.plateFee,
    totalTaxesAndFees,
    breakdown
  };
}

// src/routes/desking.routes.ts
var deskingRouter = Router10();
deskingRouter.get("/:dealId/worksheet", fetchWorksheet);
deskingRouter.post("/:dealId/worksheet", upsertWorksheet);
deskingRouter.post("/:dealId/worksheet/print", printWorksheet);
deskingRouter.post("/:dealId/optimize", optimizeWorksheet);
deskingRouter.post("/:dealId/counter", analyzeCounterOffer);
deskingRouter.get("/:dealId/versions", listWorksheetVersions);
deskingRouter.post("/:dealId/version/select", selectWorksheetVersion);
deskingRouter.get("/:dealId/approvals", listApprovalPredictions);
deskingRouter.post("/:dealId/approvals/refresh", refreshApprovalPrediction);
deskingRouter.post(
  "/calculate-tax",
  async (req, res, next) => {
    try {
      const { salePrice, zipCode, state, isNew } = req.body;
      if (!salePrice || !zipCode) {
        return res.status(400).json({
          error: "Missing required fields: salePrice and zipCode"
        });
      }
      const result = calculateTax({
        salePrice,
        zipCode,
        state,
        isNew
      });
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

// src/routes/health.routes.ts
import { Router as Router11 } from "express";

// src/services/ml-cache.service.ts
import { Prisma as Prisma12 } from "@prisma/client";

// src/lib/logger.ts
import { randomUUID as randomUUID4 } from "crypto";
import { AsyncLocalStorage as AsyncLocalStorage2 } from "async_hooks";
var requestContext = new AsyncLocalStorage2();
function initializeRequestContext(context) {
  const ctx = {
    traceId: context?.traceId ?? randomUUID4(),
    spanId: context?.spanId ?? randomUUID4(),
    parentSpanId: context?.parentSpanId,
    userId: context?.userId,
    ...context
  };
  requestContext.enterWith(ctx);
  return ctx;
}
function createLogEntry(level, message, metadata, error) {
  const ctx = requestContext.getStore();
  const tenantId = getTenantId();
  const entry = {
    level,
    message,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    traceId: ctx?.traceId ?? "no-trace",
    spanId: ctx?.spanId,
    tenantId,
    userId: ctx?.userId,
    ...metadata
  };
  if (error) {
    entry.error = {
      message: error.message,
      stack: error.stack,
      code: error.code
    };
  }
  return entry;
}
var logger = {
  /**
   * Log debug message (verbose, only in development)
   */
  debug(message, metadata) {
    if (true) {
      const entry = createLogEntry("debug" /* DEBUG */, message, metadata);
      console.debug(JSON.stringify(entry));
    }
  },
  /**
   * Log informational message
   */
  info(message, metadata) {
    const entry = createLogEntry("info" /* INFO */, message, metadata);
    console.log(JSON.stringify(entry));
  },
  /**
   * Log warning message (potential issues)
   */
  warn(message, metadata) {
    const entry = createLogEntry("warn" /* WARN */, message, metadata);
    console.warn(JSON.stringify(entry));
  },
  /**
   * Log error message
   */
  error(message, error, metadata) {
    const entry = createLogEntry("error" /* ERROR */, message, metadata, error);
    console.error(JSON.stringify(entry));
  },
  /**
   * Log operation timing (for performance monitoring)
   */
  timing(operation, durationMs, metadata) {
    const entry = createLogEntry("info" /* INFO */, `Operation completed: ${operation}`, {
      operation,
      durationMs,
      ...metadata
    });
    console.log(JSON.stringify(entry));
  }
};
function requestTracingMiddleware(req, res, next) {
  const traceId = req.headers["x-trace-id"] ?? req.headers["x-request-id"] ?? randomUUID4();
  const userId = req.user?.id;
  initializeRequestContext({
    traceId,
    userId
  });
  res.setHeader("X-Trace-Id", traceId);
  logger.info("HTTP request received", {
    method: req.method,
    path: req.path,
    userAgent: req.headers["user-agent"]
  });
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP request completed", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration
    });
  });
  next();
}

// src/services/ml-cache.service.ts
async function getCacheStats(tenantId) {
  const where = tenantId ? { tenantId } : {};
  const [total, expired, byFeatureType] = await Promise.all([
    // Total entries
    prisma.mLFeatureCache.count({ where }),
    // Expired entries
    prisma.mLFeatureCache.count({
      where: {
        ...where,
        expiresAt: { lt: /* @__PURE__ */ new Date() }
      }
    }),
    // Breakdown by feature type
    prisma.mLFeatureCache.groupBy({
      by: ["featureType"],
      where,
      _count: true
    })
  ]);
  return {
    total,
    expired,
    active: total - expired,
    byFeatureType: byFeatureType.map((item) => ({
      featureType: item.featureType,
      count: item._count
    }))
  };
}

// src/services/pricing.service.ts
import { existsSync } from "fs";
import path2 from "path";
import { fileURLToPath } from "url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
var protoDir = path2.dirname(fileURLToPath(import.meta.url));
var protoSegments = ["proto", "pricing", "v1", "pricing.proto"];
var resolveProtoPath = () => {
  const candidatePaths = [
    path2.resolve(protoDir, "..", ...protoSegments),
    path2.resolve(protoDir, ...protoSegments),
    path2.resolve(process.cwd(), ...protoSegments),
    path2.resolve(process.cwd(), "dist", ...protoSegments)
  ];
  for (const candidate of candidatePaths) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `Pricing proto definition not found. Checked: ${candidatePaths.join(", ")}`
  );
};
var PROTO_PATH = resolveProtoPath();
var PRICING_SERVICE_URL = process.env.PRICING_GRPC_ADDR || "localhost:50051";
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
var pricingProto = protoDescriptor.pricing.v1;
var client2 = new pricingProto.PricingService(
  PRICING_SERVICE_URL,
  grpc.credentials.createInsecure()
);
async function checkHealth() {
  return new Promise((resolve) => {
    client2.check({}, { deadline: Date.now() + 1e3 }, (error, response) => {
      if (error) {
        resolve({ healthy: false });
      } else {
        resolve({ healthy: true, version: response.version });
      }
    });
  });
}

// src/routes/health.routes.ts
var router = Router11();
router.get("/health", async (req, res) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      services: {
        database: {
          status: "healthy",
          latency: dbLatency
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      error: error.message
    });
  }
});
router.get("/health/pricing", async (_req, res) => {
  const start = Date.now();
  try {
    const health = await checkHealth();
    const latency = Date.now() - start;
    if (health.healthy) {
      res.json({
        status: "healthy",
        latency,
        version: health.version,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      res.status(503).json({
        status: "unhealthy",
        latency,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  } catch (error) {
    const latency = Date.now() - start;
    res.status(503).json({
      status: "unhealthy",
      latency,
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.get("/health/ml", async (req, res) => {
  const start = Date.now();
  try {
    const response = await fetch(`${process.env.ML_SERVICE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(1e3)
      // 1 second timeout
    });
    const latency = Date.now() - start;
    const data = await response.json();
    if (response.ok) {
      res.json({
        status: "healthy",
        latency,
        version: data.version,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      res.status(503).json({
        status: "unhealthy",
        latency,
        error: "ML service returned non-200 status",
        statusCode: response.status,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  } catch (error) {
    const latency = Date.now() - start;
    res.status(503).json({
      status: "unhealthy",
      latency,
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.get("/health/ml/cache", async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      cache: {
        total: stats.total,
        active: stats.active,
        expired: stats.expired,
        hitRate: stats.total > 0 ? (stats.active / stats.total * 100).toFixed(2) : "0.00",
        byFeatureType: stats.byFeatureType
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.get("/health/database", async (req, res) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const queryLatency = Date.now() - start;
    const canConnect = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables LIMIT 1`;
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: {
        connected: true,
        queryLatency,
        canQuery: !!canConnect
      }
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      error: error.message
    });
  }
});
router.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ready",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: "not_ready",
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.get("/live", (req, res) => {
  res.json({
    status: "alive",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
});

// src/routes/timeline.routes.ts
import { Router as Router12 } from "express";
import { z as z9 } from "zod";

// src/services/timeline.service.ts
function requireTenantId5() {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error("Tenant context required for timeline operations");
  }
  return tenantId;
}
async function buildCustomerTimeline(query) {
  const tenantId = requireTenantId5();
  const limit = query.limit ?? 50;
  const cursor = query.cursor ? new Date(query.cursor) : null;
  if (!query.customerId && !query.leadId) {
    throw new Error("Either customerId or leadId must be provided");
  }
  const buildBaseWhere = (cursorField = "createdAt") => {
    const where = { tenantId };
    if (query.customerId && query.leadId) {
      where.OR = [{ customerId: query.customerId }, { leadId: query.leadId }];
    } else if (query.customerId) {
      where.customerId = query.customerId;
    } else if (query.leadId) {
      where.leadId = query.leadId;
    }
    if (cursor) {
      where[cursorField] = { lt: cursor };
    }
    if (query.fromDate || query.toDate) {
      const dateFilter = {};
      if (query.fromDate) dateFilter.gte = query.fromDate;
      if (query.toDate) dateFilter.lte = query.toDate;
      if (cursor) {
        where[cursorField] = { ...where[cursorField], ...dateFilter };
      } else {
        where[cursorField] = dateFilter;
      }
    }
    if (query.actorId) {
      where.userId = query.actorId;
    }
    return where;
  };
  let activities = [];
  if (!query.categories || query.categories.includes("ACTIVITY")) {
    const activityWhere = buildBaseWhere();
    if (query.types) {
      activityWhere.type = { in: query.types };
    }
    const activityRecords = await prisma.activity.findMany({
      where: activityWhere,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
    activities = activityRecords.map(
      (a) => ({
        id: a.id,
        category: "ACTIVITY",
        type: a.type,
        title: a.subject,
        body: a.description,
        occurredAt: a.createdAt,
        createdAt: a.createdAt,
        actor: a.user,
        status: a.status,
        outcome: a.outcome ?? void 0,
        dueAt: a.dueAt ?? void 0,
        metadata: a.metadata
      })
    );
  }
  let communications = [];
  if (!query.categories || query.categories.includes("COMMUNICATION")) {
    const commWhere = buildBaseWhere();
    if (query.types) {
      commWhere.type = { in: query.types };
    }
    const commRecords = await prisma.communication.findMany({
      where: commWhere,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
    communications = commRecords.map(
      (c) => ({
        id: c.id,
        category: "COMMUNICATION",
        type: c.type,
        title: c.subject,
        body: c.body,
        occurredAt: c.createdAt,
        createdAt: c.createdAt,
        actor: c.user,
        direction: c.direction,
        status: c.status,
        provider: c.metadata?.provider,
        to: c.to ?? void 0,
        from: c.from ?? void 0,
        metadata: c.metadata
      })
    );
  }
  let appointments = [];
  if (!query.categories || query.categories.includes("APPOINTMENT")) {
    const apptWhere = buildBaseWhere("startAt");
    if (query.types) {
      apptWhere.type = { in: query.types };
    }
    if (query.actorId) {
      delete apptWhere.userId;
      apptWhere.assignedToId = query.actorId;
    }
    const apptRecords = await prisma.appointment.findMany({
      where: apptWhere,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { startAt: "desc" },
      take: limit
    });
    appointments = apptRecords.map(
      (a) => ({
        id: a.id,
        category: "APPOINTMENT",
        type: a.type,
        title: a.title,
        body: a.notes,
        occurredAt: a.startAt,
        createdAt: a.createdAt,
        actor: a.assignedTo,
        status: a.status,
        startAt: a.startAt,
        endAt: a.endAt ?? void 0,
        location: a.location ?? void 0,
        outcome: a.outcome ?? void 0
      })
    );
  }
  const allEvents = [...activities, ...communications, ...appointments].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
  );
  const events = allEvents.slice(0, limit);
  const hasMore = allEvents.length > limit;
  const nextCursor = hasMore ? events[events.length - 1].occurredAt.toISOString() : null;
  return {
    events,
    nextCursor,
    hasMore
  };
}
async function getTimelineStats(customerId) {
  const tenantId = requireTenantId5();
  const [activityCount, communicationCount, appointmentCount, lastActivity, lastCommunication] = await Promise.all([
    prisma.activity.count({
      where: { tenantId, customerId }
    }),
    prisma.communication.count({
      where: { tenantId, customerId }
    }),
    prisma.appointment.count({
      where: { tenantId, customerId }
    }),
    prisma.activity.findFirst({
      where: { tenantId, customerId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true }
    }),
    prisma.communication.findFirst({
      where: { tenantId, customerId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true }
    })
  ]);
  const lastInteraction = lastActivity && lastCommunication ? lastActivity.createdAt > lastCommunication.createdAt ? lastActivity.createdAt : lastCommunication.createdAt : lastActivity?.createdAt ?? lastCommunication?.createdAt ?? null;
  return {
    totalEvents: activityCount + communicationCount + appointmentCount,
    activityCount,
    communicationCount,
    appointmentCount,
    lastInteraction
  };
}

// src/routes/timeline.routes.ts
var router2 = Router12();
var timelineQuerySchema = z9.object({
  customerId: z9.string().optional(),
  leadId: z9.string().optional(),
  categories: z9.array(z9.enum(["ACTIVITY", "COMMUNICATION", "APPOINTMENT", "DEAL", "SERVICE"])).optional(),
  types: z9.array(z9.string()).optional(),
  actorId: z9.string().optional(),
  fromDate: z9.coerce.date().optional(),
  toDate: z9.coerce.date().optional(),
  cursor: z9.string().optional(),
  limit: z9.coerce.number().min(1).max(100).optional()
});
router2.get("/", async (req, res, next) => {
  try {
    const query = timelineQuerySchema.parse(req.query);
    if (!query.customerId && !query.leadId) {
      return res.status(400).json({
        error: {
          code: "INVALID_QUERY",
          message: "Either customerId or leadId is required"
        }
      });
    }
    const timeline = await buildCustomerTimeline(query);
    res.json(timeline);
  } catch (error) {
    if (error instanceof z9.ZodError) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: error.errors
        }
      });
    }
    next(error);
  }
});
router2.get("/stats/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;
    if (!customerId) {
      return res.status(400).json({
        error: {
          code: "INVALID_PARAMETER",
          message: "customerId is required"
        }
      });
    }
    const stats = await getTimelineStats(customerId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});
var timeline_routes_default = router2;

// src/routes/auth.routes.ts
import { Router as Router13 } from "express";
import bcryptjs from "bcryptjs";
import jwt2 from "jsonwebtoken";
var router3 = Router13();
router3.post("/login", async (req, res, next) => {
  try {
    const { storeId, username, password } = req.body;
    if (!username || !password) {
      throw new ApiError("VALIDATION_ERROR", "Username and password are required");
    }
    const users = await prisma.$queryRawUnsafe(`
      SELECT u.id, u.tenant_id as "tenantId", u.email, u.password, u.first_name as "firstName", u.last_name as "lastName",
             u.role, u.is_super_admin as "isSuperAdmin", u.permissions, u.custom_permissions as "customPermissions", u.status,
             t.id as "tenant_id", t.name as "tenant_name", t.subdomain as "tenant_subdomain", t.status as "tenant_status"
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
        AND u.status = 'ACTIVE'
      LIMIT 1
    `, username);
    if (!users || users.length === 0) {
      throw new ApiError("UNAUTHORIZED", "Invalid credentials", { status: 401 });
    }
    const user = users[0];
    if (!user) {
      throw new ApiError("UNAUTHORIZED", "Invalid credentials", { status: 401 });
    }
    if (user.tenant_status !== "ACTIVE") {
      throw new ApiError("FORBIDDEN", "Account is not active");
    }
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError("UNAUTHORIZED", "Invalid credentials", { status: 401 });
    }
    await prisma.$executeRawUnsafe(
      `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
      user.id
    );
    const privateKey = env.JWT_PRIVATE_KEY;
    if (!privateKey) {
      throw new ApiError("SERVER_ERROR", "JWT private key not configured");
    }
    const token = jwt2.sign(
      {
        sub: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        roles: [user.role],
        isSuperAdmin: user.isSuperAdmin
      },
      privateKey,
      {
        algorithm: "RS256",
        expiresIn: "7d",
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE
      }
    );
    res.json({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      permissions: user.permissions,
      customPermissions: user.customPermissions,
      token,
      access: {
        homePath: "/dashboard",
        allowedRoutes: ["*"],
        // TODO: implement route-level permissions
        navigationSections: ["inventory", "crm", "sales", "finance", "reports"],
        quickActions: ["/customers", "/inventory", "/deals"]
      }
    });
  } catch (error) {
    next(error);
  }
});
router3.get("/user", async (req, res, next) => {
  try {
    if (process.env.BYPASS_AUTH === "true") {
      console.log("[AUTH BYPASS] Auto-logging in first active user");
      const users = await prisma.$queryRawUnsafe(`
        SELECT u.id, u.tenant_id as "tenantId", u.email, u.first_name as "firstName", u.last_name as "lastName",
               u.role, u.is_super_admin as "isSuperAdmin", u.permissions, u.custom_permissions as "customPermissions", u.status
        FROM users u
        WHERE u.status = 'ACTIVE'
        LIMIT 1
      `);
      if (users && users.length > 0) {
        const user2 = users[0];
        console.log("[AUTH BYPASS] Logged in as:", user2.email);
        return res.json({
          id: user2.id,
          tenantId: user2.tenantId,
          email: user2.email,
          firstName: user2.firstName,
          lastName: user2.lastName,
          role: user2.role,
          isSuperAdmin: user2.isSuperAdmin,
          permissions: user2.permissions,
          customPermissions: user2.customPermissions,
          access: {
            homePath: "/dashboard",
            allowedRoutes: ["*"],
            navigationSections: ["inventory", "crm", "sales", "finance", "reports"],
            quickActions: ["/customers", "/inventory", "/deals"]
          }
        });
      }
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError("UNAUTHORIZED", "No authorization token provided", { status: 401 });
    }
    const token = authHeader.substring(7);
    const publicKey2 = env.JWT_PUBLIC_KEY;
    if (!publicKey2) {
      throw new ApiError("SERVER_ERROR", "JWT public key not configured");
    }
    const decoded = jwt2.verify(token, publicKey2, {
      algorithms: ["RS256"],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE
    });
    if (!decoded.sub) {
      throw new ApiError("UNAUTHORIZED", "Invalid token format", { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        }
      }
    });
    if (!user) {
      throw new ApiError("UNAUTHORIZED", "User not found", { status: 401 });
    }
    res.json({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      permissions: user.permissions,
      customPermissions: user.customPermissions,
      access: {
        homePath: "/dashboard",
        allowedRoutes: ["*"],
        navigationSections: ["inventory", "crm", "sales", "finance", "reports"],
        quickActions: ["/customers", "/inventory", "/deals"]
      }
    });
  } catch (error) {
    next(error);
  }
});
router3.post("/logout", async (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// src/routes/pricing.routes.ts
import { Router as Router14 } from "express";

// src/lib/grpc/priceEngineClient.ts
import * as grpc2 from "@grpc/grpc-js";
import * as protoLoader2 from "@grpc/proto-loader";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename = fileURLToPath2(import.meta.url);
var __dirname = path3.dirname(__filename);
var isDocker = process.env.DOCKER_ENV === "true";
var protoBaseDir = isDocker ? "/app/services/rust/proto" : path3.resolve(__dirname, "../../../../../services/rust/proto");
var PROTO_PATH2 = path3.join(protoBaseDir, "price_engine.proto");
var COMMON_PROTO_PATH = path3.join(protoBaseDir, "common.proto");
var packageDefinition2 = protoLoader2.loadSync([PROTO_PATH2, COMMON_PROTO_PATH], {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path3.resolve("/app/services/rust/proto")]
});
var priceEnginePackage = grpc2.loadPackageDefinition(packageDefinition2);
var priceEngineProto = priceEnginePackage.autolytiq.pricing;
var PriceEngineClient = class {
  client;
  url;
  constructor(url = process.env.PRICE_ENGINE_URL || "localhost:50051") {
    this.url = url;
    this.client = new priceEngineProto.PriceEngine(
      url,
      grpc2.credentials.createInsecure()
    );
    logger.info(`PriceEngine gRPC client connected to ${url}`);
  }
  /**
   * Create request metadata from tenant context
   */
  createMetadata(tenantId, userId, idempotencyKey) {
    return {
      request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenant_id: tenantId,
      user_id: userId,
      idempotency_key: idempotencyKey,
      timestamp_ms: Date.now()
    };
  }
  /**
   * Convert dollars to Money protobuf type
   */
  dollarsToMoney(dollars, currency = "USD") {
    return {
      amount_cents: Math.round(dollars * 100),
      currency
    };
  }
  /**
   * Convert Money protobuf type to dollars
   */
  moneyToDollars(money) {
    if (!money) return 0;
    return money.amount_cents / 100;
  }
  /**
   * Get market data and competitive pricing range
   */
  async getMarketData(tenantId, request) {
    return new Promise((resolve, reject) => {
      const fullRequest = {
        ...request,
        metadata: this.createMetadata(tenantId)
      };
      const metadata = new grpc2.Metadata();
      metadata.add("x-tenant-id", tenantId);
      this.client.GetMarketData(fullRequest, metadata, (error, response) => {
        if (error) {
          logger.error(
            "PriceEngine GetMarketData error",
            error instanceof Error ? error : void 0,
            { request: fullRequest }
          );
          reject(error);
        } else {
          logger.debug("PriceEngine GetMarketData success", { response });
          resolve(response);
        }
      });
    });
  }
  /**
   * Calculate gross profit breakdown
   */
  async calculateGross(tenantId, request) {
    return new Promise((resolve, reject) => {
      const fullRequest = {
        ...request,
        metadata: this.createMetadata(tenantId)
      };
      const metadata = new grpc2.Metadata();
      metadata.add("x-tenant-id", tenantId);
      this.client.CalculateGross(fullRequest, metadata, (error, response) => {
        if (error) {
          logger.error(
            "PriceEngine CalculateGross error",
            error instanceof Error ? error : void 0,
            { request: fullRequest }
          );
          reject(error);
        } else {
          logger.debug("PriceEngine CalculateGross success", { response });
          resolve(response);
        }
      });
    });
  }
  /**
   * Calculate payment and amortization
   */
  async calculatePayment(tenantId, request) {
    return new Promise((resolve, reject) => {
      const fullRequest = {
        ...request,
        metadata: this.createMetadata(tenantId)
      };
      const metadata = new grpc2.Metadata();
      metadata.add("x-tenant-id", tenantId);
      this.client.CalculatePayment(fullRequest, metadata, (error, response) => {
        if (error) {
          logger.error(
            "PriceEngine CalculatePayment error",
            error instanceof Error ? error : void 0,
            { request: fullRequest }
          );
          reject(error);
        } else {
          logger.debug("PriceEngine CalculatePayment success", { response });
          resolve(response);
        }
      });
    });
  }
  /**
   * Suggest price markdown based on aging
   */
  async suggestMarkdown(tenantId, request) {
    return new Promise((resolve, reject) => {
      const fullRequest = {
        ...request,
        metadata: this.createMetadata(tenantId)
      };
      const metadata = new grpc2.Metadata();
      metadata.add("x-tenant-id", tenantId);
      this.client.SuggestMarkdown(fullRequest, metadata, (error, response) => {
        if (error) {
          logger.error(
            "PriceEngine SuggestMarkdown error",
            error instanceof Error ? error : void 0,
            { request: fullRequest }
          );
          reject(error);
        } else {
          logger.debug("PriceEngine SuggestMarkdown success", { response });
          resolve(response);
        }
      });
    });
  }
  /**
   * Health check
   */
  async healthCheck() {
    return new Promise((resolve, reject) => {
      this.client.GetHealth({ include_dependencies: true }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
  /**
   * Close the client connection
   */
  close() {
    this.client.close();
    logger.info("PriceEngine gRPC client closed");
  }
};
var priceEngineClient = new PriceEngineClient();

// src/services/rustPricing.service.ts
function logRustServiceError(message, error, metadata) {
  if (error instanceof Error) {
    logger.error(message, error, metadata);
    return;
  }
  logger.error(message, void 0, { ...metadata, error });
}
var RustPricingService = class {
  /**
   * Get market data for a vehicle
   */
  async getMarketData(params) {
    try {
      const response = await priceEngineClient.getMarketData(params.tenantId, {
        year: params.year,
        make: params.make,
        model: params.model,
        trim: params.trim,
        mileage: params.mileage,
        zip_code: params.zipCode,
        radius_miles: params.radiusMiles || 100,
        time_window_days: params.timeWindowDays || 90
      });
      return this.transformMarketDataResponse(response);
    } catch (error) {
      logRustServiceError("Failed to get market data from Rust service", error, { params });
      throw new Error("Failed to get market data");
    }
  }
  /**
   * Calculate gross profit breakdown
   */
  async calculateGross(params) {
    try {
      const response = await priceEngineClient.calculateGross(params.tenantId, {
        vehicle_price: this.toMoney(params.vehiclePrice),
        vehicle_cost: this.toMoney(params.vehicleCost),
        pack: params.pack ? this.toMoney(params.pack) : void 0,
        trade_value: params.tradeValue ? this.toMoney(params.tradeValue) : void 0,
        trade_payoff: params.tradePayoff ? this.toMoney(params.tradePayoff) : void 0,
        trade_allowance: params.tradeAllowance ? this.toMoney(params.tradeAllowance) : void 0,
        rate_markup: params.rateMarkup ? { value: params.rateMarkup.toString() } : void 0,
        term_months: params.termMonths || 0,
        amount_financed: params.amountFinanced ? this.toMoney(params.amountFinanced) : void 0,
        participation: params.participation || 1,
        products: params.products?.map((p) => ({
          type: p.type,
          price: this.toMoney(p.price),
          cost: this.toMoney(p.cost),
          participation: p.participation
        }))
      });
      return this.transformGrossResponse(response);
    } catch (error) {
      logRustServiceError("Failed to calculate gross from Rust service", error, { params });
      throw new Error("Failed to calculate gross");
    }
  }
  /**
   * Calculate payment details
   */
  async calculatePayment(params) {
    try {
      const response = await priceEngineClient.calculatePayment(params.tenantId, {
        amount_financed: this.toMoney(params.amountFinanced),
        apr: { value: params.apr.toString() },
        term_months: params.termMonths,
        gross_monthly_income: params.grossMonthlyIncome ? this.toMoney(params.grossMonthlyIncome) : void 0,
        total_monthly_debt: params.totalMonthlyDebt ? this.toMoney(params.totalMonthlyDebt) : void 0
      });
      return this.transformPaymentResponse(response);
    } catch (error) {
      logRustServiceError("Failed to calculate payment from Rust service", error, { params });
      throw new Error("Failed to calculate payment");
    }
  }
  /**
   * Suggest price markdown
   */
  async suggestMarkdown(params) {
    try {
      const response = await priceEngineClient.suggestMarkdown(params.tenantId, {
        current_price: this.toMoney(params.currentPrice),
        cost: this.toMoney(params.cost),
        days_in_stock: params.daysInStock,
        market_range: params.marketRange ? {
          floor_price: this.toMoney(params.marketRange.floorPrice),
          target_price: this.toMoney(params.marketRange.targetPrice),
          ceiling_price: this.toMoney(params.marketRange.ceilingPrice),
          average_price: this.toMoney(params.marketRange.averagePrice),
          comp_count: params.marketRange.compCount,
          days_to_sale_avg: params.marketRange.daysToSaleAvg
        } : void 0
      });
      return this.transformMarkdownResponse(response);
    } catch (error) {
      logRustServiceError("Failed to suggest markdown from Rust service", error, { params });
      throw new Error("Failed to suggest markdown");
    }
  }
  // Helper methods for type conversion
  toMoney(dollars) {
    return {
      amount_cents: Math.round(dollars * 100),
      currency: "USD"
    };
  }
  fromMoney(money) {
    if (!money) return 0;
    return money.amount_cents / 100;
  }
  transformMarketDataResponse(response) {
    return {
      competitiveRange: response.competitive_range ? {
        floorPrice: this.fromMoney(response.competitive_range.floor_price),
        targetPrice: this.fromMoney(response.competitive_range.target_price),
        ceilingPrice: this.fromMoney(response.competitive_range.ceiling_price),
        averagePrice: this.fromMoney(response.competitive_range.average_price),
        compCount: response.competitive_range.comp_count,
        daysToSaleAvg: response.competitive_range.days_to_sale_avg
      } : null,
      comparables: response.comparables.map((comp) => ({
        id: comp.id,
        vin: comp.vin,
        year: comp.year,
        make: comp.make,
        model: comp.model,
        trim: comp.trim,
        mileage: comp.mileage,
        price: this.fromMoney(comp.price),
        daysOnMarket: comp.days_on_market,
        saleDate: comp.sale_date,
        source: comp.source,
        matchScore: comp.match_score
      })),
      statistics: response.statistics ? {
        totalCompsFound: response.statistics.total_comps_found,
        compsUsed: response.statistics.comps_used,
        priceStdDev: response.statistics.price_std_dev,
        mileageStdDev: response.statistics.mileage_std_dev,
        pricePerMile: this.fromMoney(response.statistics.price_per_mile)
      } : null
    };
  }
  transformGrossResponse(response) {
    const breakdown = response.breakdown;
    if (!breakdown) return null;
    return {
      frontEndGross: this.fromMoney(breakdown.front_end_gross),
      tradeReserve: this.fromMoney(breakdown.trade_reserve),
      totalFrontGross: this.fromMoney(breakdown.total_front_gross),
      financeReserve: this.fromMoney(breakdown.finance_reserve),
      backEndGross: this.fromMoney(breakdown.back_end_gross),
      productProfits: breakdown.product_profits.map((p) => ({
        type: p.type,
        sellingPrice: this.fromMoney(p.selling_price),
        cost: this.fromMoney(p.cost),
        profit: this.fromMoney(p.profit),
        participation: p.participation
      })),
      totalGross: this.fromMoney(breakdown.total_gross),
      grossPercentage: breakdown.gross_percentage
    };
  }
  transformPaymentResponse(response) {
    return {
      monthlyPayment: this.fromMoney(response.monthly_payment),
      totalInterest: this.fromMoney(response.total_interest),
      totalPayment: this.fromMoney(response.total_payment),
      ptiRatio: response.pti_ratio,
      dtiRatio: response.dti_ratio,
      amortizationSchedule: response.amortization_schedule.map((entry) => ({
        paymentNumber: entry.payment_number,
        paymentAmount: this.fromMoney(entry.payment_amount),
        principal: this.fromMoney(entry.principal),
        interest: this.fromMoney(entry.interest),
        balance: this.fromMoney(entry.balance)
      }))
    };
  }
  transformMarkdownResponse(response) {
    return {
      suggestedPrice: this.fromMoney(response.suggested_price),
      markdownAmount: this.fromMoney(response.markdown_amount),
      markdownPercentage: response.markdown_percentage,
      agingBand: response.aging_band,
      competitivePosition: response.competitive_position,
      recommendation: response.recommendation,
      projectedGross: this.fromMoney(response.projected_gross),
      estimatedDaysToSale: response.estimated_days_to_sale
    };
  }
};
var rustPricingService = new RustPricingService();

// src/routes/pricing.routes.ts
var pricingRouter = Router14();
pricingRouter.post("/calculate-payment", async (req, res) => {
  try {
    const { amountFinanced, apr, termMonths, grossMonthlyIncome, totalMonthlyDebt } = req.body;
    if (!amountFinanced || !apr || !termMonths) {
      return res.status(400).json({
        error: "Missing required fields: amountFinanced, apr, termMonths"
      });
    }
    const tenantId = req.tenantId || "default";
    const result = await rustPricingService.calculatePayment({
      tenantId,
      amountFinanced,
      apr,
      termMonths,
      grossMonthlyIncome,
      totalMonthlyDebt
    });
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error("Failed to calculate payment", error instanceof Error ? error : void 0, { body: req.body });
    return res.status(500).json({
      error: "Failed to calculate payment",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
pricingRouter.post("/calculate-gross", async (req, res) => {
  try {
    const {
      vehiclePrice,
      vehicleCost,
      pack,
      tradeValue,
      tradePayoff,
      tradeAllowance,
      rateMarkup,
      termMonths,
      amountFinanced,
      participation,
      products
    } = req.body;
    if (!vehiclePrice || !vehicleCost) {
      return res.status(400).json({
        error: "Missing required fields: vehiclePrice, vehicleCost"
      });
    }
    const tenantId = req.tenantId || "default";
    const result = await rustPricingService.calculateGross({
      tenantId,
      vehiclePrice,
      vehicleCost,
      pack,
      tradeValue,
      tradePayoff,
      tradeAllowance,
      rateMarkup,
      termMonths,
      amountFinanced,
      participation,
      products
    });
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error("Failed to calculate gross", error instanceof Error ? error : void 0, { body: req.body });
    return res.status(500).json({
      error: "Failed to calculate gross",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
pricingRouter.post("/market-data", async (req, res) => {
  try {
    const { year, make, model, trim, mileage, zipCode, radiusMiles, timeWindowDays } = req.body;
    if (!year || !make || !model || !mileage) {
      return res.status(400).json({
        error: "Missing required fields: year, make, model, mileage"
      });
    }
    const tenantId = req.tenantId || "default";
    const result = await rustPricingService.getMarketData({
      tenantId,
      year,
      make,
      model,
      trim,
      mileage,
      zipCode,
      radiusMiles,
      timeWindowDays
    });
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error("Failed to get market data", error instanceof Error ? error : void 0, { body: req.body });
    return res.status(500).json({
      error: "Failed to get market data",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
pricingRouter.post("/suggest-markdown", async (req, res) => {
  try {
    const { currentPrice, cost, daysInStock, marketRange } = req.body;
    if (!currentPrice || !cost || daysInStock === void 0) {
      return res.status(400).json({
        error: "Missing required fields: currentPrice, cost, daysInStock"
      });
    }
    const tenantId = req.tenantId || "default";
    const result = await rustPricingService.suggestMarkdown({
      tenantId,
      currentPrice,
      cost,
      daysInStock,
      marketRange
    });
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error("Failed to suggest markdown", error instanceof Error ? error : void 0, { body: req.body });
    return res.status(500).json({
      error: "Failed to suggest markdown",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
pricingRouter.get("/health", async (_req, res) => {
  try {
    const result = await rustPricingService.calculatePayment({
      tenantId: "healthcheck",
      amountFinanced: 3e4,
      apr: 5.99,
      termMonths: 60
    });
    return res.json({
      success: true,
      status: "healthy",
      message: "Rust pricing service is operational",
      sampleCalculation: {
        monthlyPayment: result.monthlyPayment
      }
    });
  } catch (error) {
    logger.error("Rust pricing service health check failed", error instanceof Error ? error : void 0);
    return res.status(503).json({
      success: false,
      status: "unhealthy",
      error: "Rust pricing service is not available",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// src/routes/customer.routes.ts
import { Router as Router15 } from "express";
import { db } from "@repo/db";
import { z as z10 } from "zod";
var customerRouter = Router15();
var customerSchema = z10.object({
  // Required fields
  firstName: z10.string().min(1, "First name is required"),
  lastName: z10.string().min(1, "Last name is required"),
  // Optional personal info
  middleName: z10.string().optional(),
  suffix: z10.string().optional(),
  email: z10.string().email("Invalid email").optional(),
  phone: z10.string().optional(),
  phoneSecondary: z10.string().optional(),
  mobile: z10.string().optional(),
  dateOfBirth: z10.string().datetime().optional(),
  // License info
  licenseNumber: z10.string().optional(),
  licenseState: z10.string().optional(),
  licenseExpiry: z10.string().datetime().optional(),
  ssn: z10.string().optional(),
  // Address
  addressStreet: z10.string().optional(),
  addressCity: z10.string().optional(),
  addressState: z10.string().optional(),
  addressZip: z10.string().optional(),
  addressCountry: z10.string().optional(),
  county: z10.string().optional(),
  // Contact preferences
  preferredContactMethod: z10.enum(["EMAIL", "PHONE", "SMS", "MAIL"]).default("EMAIL"),
  // Lead info
  leadSource: z10.enum(["WEBSITE", "PHONE", "WALKIN", "REFERRAL", "SOCIAL", "EMAIL", "PAID_AD", "ORGANIC_SEARCH", "EVENT", "OTHER"]).default("WEBSITE"),
  leadStatus: z10.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "ARCHIVED"]).default("NEW"),
  leadScore: z10.number().int().min(0).max(100).default(0),
  creditScore: z10.number().int().min(300).max(850).optional(),
  assignedToUserId: z10.string().optional(),
  // Employment
  employerName: z10.string().optional(),
  employerPhone: z10.string().optional(),
  monthlyIncome: z10.number().int().optional(),
  // Housing
  housingStatus: z10.string().optional(),
  monthlyPayment: z10.number().int().optional(),
  yearsAtAddress: z10.number().int().optional(),
  // Consent
  consentTcpa: z10.boolean().default(false),
  consentCredit: z10.boolean().default(false),
  // Co-buyer
  coBuyerFirstName: z10.string().optional(),
  coBuyerLastName: z10.string().optional(),
  coBuyerEmail: z10.string().email("Invalid co-buyer email").optional(),
  coBuyerPhone: z10.string().optional(),
  coBuyerDateOfBirth: z10.string().datetime().optional(),
  coBuyerSsn: z10.string().optional(),
  coBuyerEmployer: z10.string().optional(),
  coBuyerIncome: z10.number().int().optional(),
  // Additional
  tags: z10.array(z10.string()).default([]),
  notes: z10.string().optional()
});
customerRouter.get(
  "/",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { search, limit = 50 } = req.query;
      const customers = await db.customer.findMany({
        where: {
          tenantId,
          ...search && {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } }
            ]
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          addressZip: true,
          creditScore: true,
          leadStatus: true
        },
        take: parseInt(limit, 10),
        orderBy: {
          updatedAt: "desc"
        }
      });
      res.json({ data: customers });
    } catch (error) {
      next(error);
    }
  }
);
customerRouter.get(
  "/:id",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const customer = await db.customer.findFirst({
        where: {
          id,
          tenantId
        },
        include: {
          vehicles: {
            where: {
              status: "OWNED"
            },
            select: {
              id: true,
              vin: true,
              year: true,
              make: true,
              model: true,
              trim: true,
              purchaseDate: true,
              purchasePrice: true,
              currentMileage: true,
              status: true
            }
          }
        }
      });
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json({ data: customer });
    } catch (error) {
      next(error);
    }
  }
);
customerRouter.post(
  "/",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      const validationResult = customerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors
        });
      }
      const data = validationResult.data;
      const customerData = {
        ...data,
        tenantId,
        createdById: userId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : void 0,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : void 0,
        coBuyerDateOfBirth: data.coBuyerDateOfBirth ? new Date(data.coBuyerDateOfBirth) : void 0,
        consentDate: data.consentTcpa || data.consentCredit ? /* @__PURE__ */ new Date() : void 0
      };
      const customer = await db.customer.create({
        data: customerData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          addressZip: true,
          creditScore: true,
          leadStatus: true,
          createdAt: true
        }
      });
      res.status(201).json({ data: customer });
    } catch (error) {
      console.error("Error creating customer:", error);
      next(error);
    }
  }
);
customerRouter.put(
  "/:id",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const updateSchema = customerSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors
        });
      }
      const data = validationResult.data;
      const existingCustomer = await db.customer.findFirst({
        where: { id, tenantId }
      });
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      const updateData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : void 0,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : void 0,
        coBuyerDateOfBirth: data.coBuyerDateOfBirth ? new Date(data.coBuyerDateOfBirth) : void 0
      };
      const customer = await db.customer.update({
        where: { id },
        data: updateData
      });
      res.json({ data: customer });
    } catch (error) {
      console.error("Error updating customer:", error);
      next(error);
    }
  }
);
customerRouter.post(
  "/scan-license",
  async (req, res, next) => {
    try {
      const extractedData = {
        firstName: "John",
        lastName: "Doe",
        middleName: "A",
        dateOfBirth: "1985-03-15T00:00:00Z",
        licenseNumber: "D1234567",
        licenseState: "CA",
        licenseExpiry: "2028-03-15T00:00:00Z",
        addressStreet: "123 Main Street",
        addressCity: "Los Angeles",
        addressState: "CA",
        addressZip: "90001",
        addressCountry: "USA"
      };
      res.json({
        success: true,
        data: extractedData,
        message: "License scanned successfully (mock data - OCR integration pending)"
      });
    } catch (error) {
      console.error("Error scanning license:", error);
      next(error);
    }
  }
);

// src/routes/vehicle.routes.ts
import { Router as Router16 } from "express";
import { db as db2 } from "@repo/db";
import { z as z11 } from "zod";
var vehicleRouter = Router16();
async function decodeVIN(vin) {
  return {
    vin,
    year: 2024,
    make: "Ford",
    model: "F-150",
    trim: "Lariat",
    bodyStyle: "Crew Cab Pickup",
    engineType: "3.5L V6 EcoBoost",
    transmission: "10-Speed Automatic",
    drivetrain: "4WD",
    fuelType: "GASOLINE",
    msrp: 65e3,
    valid: true
  };
}
var vehicleSchema = z11.object({
  // Required fields
  stockNumber: z11.string().min(1, "Stock number is required"),
  vin: z11.string().length(17, "VIN must be 17 characters"),
  year: z11.number().int().min(1900).max((/* @__PURE__ */ new Date()).getFullYear() + 2),
  make: z11.string().min(1, "Make is required"),
  model: z11.string().min(1, "Model is required"),
  type: z11.enum(["NEW", "USED", "CERTIFIED"]),
  // Optional fields
  trim: z11.string().optional(),
  bodyStyle: z11.string().optional(),
  exteriorColor: z11.string().optional(),
  interiorColor: z11.string().optional(),
  mileage: z11.number().int().min(0).optional(),
  engineType: z11.string().optional(),
  transmission: z11.string().optional(),
  drivetrain: z11.string().optional(),
  fuelType: z11.enum(["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "PLUGIN_HYBRID", "OTHER"]).default("GASOLINE"),
  condition: z11.enum(["NEW", "EXCELLENT", "GOOD", "FAIR", "POOR"]).optional(),
  status: z11.enum(["AVAILABLE", "SOLD", "PENDING", "ON_HOLD", "IN_TRANSIT", "AT_AUCTION"]).default("AVAILABLE"),
  // Pricing (in cents to avoid floating point issues)
  costCents: z11.number().int().min(0).optional(),
  priceCents: z11.number().int().min(0).optional(),
  msrpCents: z11.number().int().min(0).optional(),
  invoiceCents: z11.number().int().min(0).optional(),
  packCents: z11.number().int().min(0).optional(),
  reconCostCents: z11.number().int().min(0).optional(),
  minPriceCents: z11.number().int().min(0).optional(),
  acquisitionCostCents: z11.number().int().min(0).optional(),
  // Acquisition
  acquiredFrom: z11.string().optional(),
  acquiredDate: z11.string().datetime().optional(),
  acquisitionType: z11.enum(["TRADE_IN", "AUCTION", "WHOLESALE", "DEALER_TRANSFER", "MANUFACTURER", "LEASE_RETURN", "REPO", "OTHER"]).optional(),
  // Location
  location: z11.string().optional(),
  locationId: z11.string().optional(),
  // Additional
  features: z11.array(z11.string()).default([]),
  images: z11.array(z11.string()).default([]),
  imageUrls: z11.array(z11.string()).default([]),
  primaryImageUrl: z11.string().optional(),
  videoUrl: z11.string().optional(),
  certifiedPreOwned: z11.boolean().default(false),
  certificationNumber: z11.string().optional(),
  notes: z11.string().optional()
});
vehicleRouter.get(
  "/",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { search, status: status2 = "AVAILABLE", limit = 50 } = req.query;
      const vehicles = await db2.vehicle.findMany({
        where: {
          tenantId,
          status: status2,
          ...search && {
            OR: [
              { stockNumber: { contains: search, mode: "insensitive" } },
              { vin: { contains: search, mode: "insensitive" } },
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } }
            ]
          }
        },
        select: {
          id: true,
          stockNumber: true,
          vin: true,
          year: true,
          make: true,
          model: true,
          trim: true,
          mileage: true,
          priceCents: true,
          costCents: true,
          msrpCents: true,
          status: true,
          daysInStock: true,
          exteriorColor: true,
          location: true
        },
        take: parseInt(limit, 10),
        orderBy: {
          updatedAt: "desc"
        }
      });
      const vehiclesWithPrices = vehicles.map((v) => ({
        ...v,
        price: v.priceCents ? v.priceCents / 100 : 0,
        cost: v.costCents ? v.costCents / 100 : 0,
        msrp: v.msrpCents ? v.msrpCents / 100 : 0
      }));
      res.json({ data: vehiclesWithPrices });
    } catch (error) {
      next(error);
    }
  }
);
vehicleRouter.get(
  "/:id",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const vehicle = await db2.vehicle.findFirst({
        where: {
          id,
          tenantId
        }
      });
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      const vehicleWithPrices = {
        ...vehicle,
        price: vehicle.priceCents ? vehicle.priceCents / 100 : 0,
        cost: vehicle.costCents ? vehicle.costCents / 100 : 0,
        msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : 0,
        invoiceCost: vehicle.invoiceCents ? vehicle.invoiceCents / 100 : 0
      };
      res.json({ data: vehicleWithPrices });
    } catch (error) {
      next(error);
    }
  }
);
vehicleRouter.post(
  "/decode-vin",
  async (req, res, next) => {
    try {
      const { vin } = req.body;
      if (!vin || vin.length !== 17) {
        return res.status(400).json({ error: "Valid 17-character VIN required" });
      }
      const decodedData = await decodeVIN(vin);
      res.json({
        success: true,
        data: decodedData,
        message: "VIN decoded successfully (mock data - API integration pending)"
      });
    } catch (error) {
      console.error("Error decoding VIN:", error);
      next(error);
    }
  }
);
vehicleRouter.post(
  "/",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const validationResult = vehicleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors
        });
      }
      const data = validationResult.data;
      const existingVehicle = await db2.vehicle.findUnique({
        where: { vin: data.vin }
      });
      if (existingVehicle) {
        return res.status(409).json({ error: "Vehicle with this VIN already exists" });
      }
      const dateReceived = data.acquiredDate ? new Date(data.acquiredDate) : /* @__PURE__ */ new Date();
      const daysInStock = Math.floor(((/* @__PURE__ */ new Date()).getTime() - dateReceived.getTime()) / (1e3 * 60 * 60 * 24));
      const vehicleData = {
        ...data,
        tenantId,
        acquiredDate: data.acquiredDate ? new Date(data.acquiredDate) : void 0,
        dateReceived,
        daysInStock
      };
      const vehicle = await db2.vehicle.create({
        data: vehicleData
      });
      const vehicleWithPrices = {
        ...vehicle,
        price: vehicle.priceCents ? vehicle.priceCents / 100 : 0,
        cost: vehicle.costCents ? vehicle.costCents / 100 : 0,
        msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : 0,
        invoiceCost: vehicle.invoiceCents ? vehicle.invoiceCents / 100 : 0
      };
      res.status(201).json({ data: vehicleWithPrices });
    } catch (error) {
      console.error("Error creating vehicle:", error);
      next(error);
    }
  }
);
vehicleRouter.put(
  "/:id",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const updateSchema = vehicleSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors
        });
      }
      const data = validationResult.data;
      const existingVehicle = await db2.vehicle.findFirst({
        where: { id, tenantId }
      });
      if (!existingVehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      if (data.vin && data.vin !== existingVehicle.vin) {
        const vinConflict = await db2.vehicle.findUnique({
          where: { vin: data.vin }
        });
        if (vinConflict) {
          return res.status(409).json({ error: "Another vehicle with this VIN already exists" });
        }
      }
      const updateData = {
        ...data,
        acquiredDate: data.acquiredDate ? new Date(data.acquiredDate) : void 0
      };
      if (data.priceCents && data.priceCents !== existingVehicle.priceCents) {
        updateData.lastPriceChangeDate = /* @__PURE__ */ new Date();
      }
      const vehicle = await db2.vehicle.update({
        where: { id },
        data: updateData
      });
      const vehicleWithPrices = {
        ...vehicle,
        price: vehicle.priceCents ? vehicle.priceCents / 100 : 0,
        cost: vehicle.costCents ? vehicle.costCents / 100 : 0,
        msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : 0,
        invoiceCost: vehicle.invoiceCents ? vehicle.invoiceCents / 100 : 0
      };
      res.json({ data: vehicleWithPrices });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      next(error);
    }
  }
);

// src/routes/dashboard.routes.ts
import { Router as Router17 } from "express";
import { db as db3 } from "@repo/db";
import { z as z12 } from "zod";

// src/services/dashboard.service.ts
var DEFAULT_LAYOUTS = {
  SALES: {
    columns: 4,
    widgets: [
      { id: "w1", key: "active-deals", position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: "w2", key: "today-appointments", position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: "w3", key: "hot-leads", position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: "w4", key: "pending-tasks", position: { x: 0, y: 2 }, size: { w: 2, h: 1 } },
      { id: "w5", key: "sales-leaderboard", position: { x: 2, y: 2 }, size: { w: 2, h: 1 } }
    ]
  },
  SERVICE: {
    columns: 4,
    widgets: [
      { id: "w1", key: "service-appointments", position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: "w2", key: "open-ros", position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: "w3", key: "pending-approvals", position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: "w4", key: "technician-dispatch", position: { x: 0, y: 2 }, size: { w: 4, h: 1 } }
    ]
  },
  FINANCE: {
    columns: 4,
    widgets: [
      { id: "w1", key: "pending-fi-deals", position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: "w2", key: "lender-submissions", position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: "w3", key: "fi-products-sold", position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: "w4", key: "average-pvr", position: { x: 0, y: 2 }, size: { w: 1, h: 1 } },
      { id: "w5", key: "backend-profit", position: { x: 1, y: 2 }, size: { w: 1, h: 1 } }
    ]
  },
  ACCOUNTING: {
    columns: 4,
    widgets: [
      { id: "w1", key: "unreconciled-deals", position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: "w2", key: "cash-flow-summary", position: { x: 0, y: 2 }, size: { w: 4, h: 1 } },
      { id: "w3", key: "pending-invoices", position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: "w4", key: "bank-reconciliation", position: { x: 2, y: 1 }, size: { w: 2, h: 1 } }
    ]
  },
  INVENTORY: {
    columns: 4,
    widgets: [
      { id: "w1", key: "aging-inventory", position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: "w2", key: "recent-acquisitions", position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: "w3", key: "pricing-alerts", position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: "w4", key: "needs-photos", position: { x: 0, y: 2 }, size: { w: 1, h: 1 } },
      { id: "w5", key: "wholesale-candidates", position: { x: 1, y: 2 }, size: { w: 1, h: 1 } }
    ]
  },
  DEVELOPER: {
    columns: 4,
    widgets: [
      { id: "w1", key: "system-health", position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: "w2", key: "api-performance", position: { x: 0, y: 2 }, size: { w: 4, h: 1 } },
      { id: "w3", key: "error-logs", position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: "w4", key: "database-queries", position: { x: 2, y: 1 }, size: { w: 2, h: 1 } }
    ]
  },
  ADMIN: {
    columns: 4,
    widgets: [
      { id: "w1", key: "dealership-overview", position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: "w2", key: "user-activity", position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: "w3", key: "audit-log", position: { x: 0, y: 2 }, size: { w: 4, h: 1 } },
      { id: "w4", key: "integration-status", position: { x: 2, y: 1 }, size: { w: 2, h: 1 } }
    ]
  },
  MANAGER: {
    columns: 4,
    widgets: [
      { id: "w1", key: "dealership-overview", position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: "w2", key: "active-deals", position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: "w3", key: "sales-leaderboard", position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: "w4", key: "cash-flow-summary", position: { x: 0, y: 2 }, size: { w: 4, h: 1 } }
    ]
  }
};
function getDefaultLayout(role) {
  if (!role || !(role in DEFAULT_LAYOUTS)) {
    return DEFAULT_LAYOUTS.SALES;
  }
  return DEFAULT_LAYOUTS[role];
}

// src/routes/dashboard.routes.ts
var dashboardRouter = Router17();
var layoutSchema = z12.object({
  columns: z12.number().min(1).max(4).default(4),
  widgets: z12.array(z12.object({
    id: z12.string(),
    key: z12.string(),
    position: z12.object({
      x: z12.number().min(0),
      y: z12.number().min(0)
    }),
    size: z12.object({
      w: z12.number().min(1).max(4),
      h: z12.number().min(1).max(4)
    }),
    config: z12.any().optional()
  }))
});
dashboardRouter.get(
  "/layout",
  async (req, res, next) => {
    try {
      const { role } = req.query;
      const userId = req.userId;
      const tenantId = req.tenantId;
      let layout = await db3.dashboardLayout.findUnique({
        where: {
          userId_role: {
            userId,
            role: role || null
          }
        }
      });
      if (!layout) {
        const defaultLayout = getDefaultLayout(role);
        return res.json({
          data: {
            layout: defaultLayout,
            isDefault: true
          }
        });
      }
      res.json({
        data: {
          layout: layout.layout,
          isDefault: layout.isDefault
        }
      });
    } catch (error) {
      next(error);
    }
  }
);
dashboardRouter.put(
  "/layout",
  async (req, res, next) => {
    try {
      const { role, layout } = req.body;
      const userId = req.userId;
      const tenantId = req.tenantId;
      const validationResult = layoutSchema.safeParse(layout);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid layout format",
          details: validationResult.error.errors
        });
      }
      const savedLayout = await db3.dashboardLayout.upsert({
        where: {
          userId_role: {
            userId,
            role: role || null
          }
        },
        update: {
          layout: validationResult.data,
          updatedAt: /* @__PURE__ */ new Date()
        },
        create: {
          userId,
          tenantId,
          role: role || null,
          layout: validationResult.data,
          isDefault: false
        }
      });
      res.json({ data: savedLayout });
    } catch (error) {
      next(error);
    }
  }
);
dashboardRouter.delete(
  "/layout",
  async (req, res, next) => {
    try {
      const { role } = req.query;
      const userId = req.userId;
      await db3.dashboardLayout.deleteMany({
        where: {
          userId,
          role: role || null
        }
      });
      const defaultLayout = getDefaultLayout(role);
      res.json({
        data: {
          layout: defaultLayout,
          isDefault: true
        }
      });
    } catch (error) {
      next(error);
    }
  }
);
dashboardRouter.get(
  "/defaults/:role",
  async (req, res, next) => {
    try {
      const { role } = req.params;
      const defaultLayout = getDefaultLayout(role);
      res.json({ data: defaultLayout });
    } catch (error) {
      next(error);
    }
  }
);

// src/routes/search.routes.ts
import { Router as Router18 } from "express";
import { z as z13 } from "zod";

// src/services/search.service.ts
import { db as db4 } from "@repo/db";
async function performSearch(options) {
  const startTime = Date.now();
  const { tenantId, userId, query, filters = {}, limit = 20, offset = 0 } = options;
  const sanitizedQuery = query.trim().slice(0, 200);
  if (!sanitizedQuery) {
    return {
      results: [],
      total: 0,
      executionTime: Date.now() - startTime,
      suggestions: await getPopularSearches(tenantId)
    };
  }
  const intent = detectIntent(sanitizedQuery);
  let results = [];
  let total = 0;
  switch (intent.type) {
    case "entity_search":
      const entityResults = await searchEntities(tenantId, sanitizedQuery, limit, offset);
      results = entityResults.results;
      total = entityResults.total;
      break;
    case "filter_query":
      const filterResults = await executeFilterQuery(tenantId, intent, limit, offset);
      results = filterResults.results;
      total = filterResults.total;
      break;
    case "analytics":
      const analyticsResults = await executeAnalyticsQuery(tenantId, intent);
      results = analyticsResults.results;
      total = analyticsResults.total;
      break;
    default:
      const multiResults = await searchEntities(tenantId, sanitizedQuery, limit, offset);
      results = multiResults.results;
      total = multiResults.total;
  }
  const executionTime = Date.now() - startTime;
  await trackSearch({
    tenantId,
    userId,
    query: sanitizedQuery,
    parsedQuery: intent,
    resultType: results[0]?.type || "none",
    resultCount: results.length,
    executionTime
  });
  await updatePopularSearch(tenantId, sanitizedQuery, results[0]?.type || "general");
  return {
    results,
    total,
    executionTime,
    suggestions: await generateSuggestions(tenantId, sanitizedQuery),
    parsedQuery: intent
  };
}
async function searchEntities(tenantId, query, limit, offset) {
  const results = [];
  const [customers, vehicles, deals, leads] = await Promise.all([
    searchCustomers(tenantId, query, limit),
    searchVehicles(tenantId, query, limit),
    searchDeals(tenantId, query, limit),
    searchLeads(tenantId, query, limit)
  ]);
  results.push(...customers, ...vehicles, ...deals, ...leads);
  results.sort((a, b) => b.score - a.score);
  const paginatedResults = results.slice(offset, offset + limit);
  return {
    results: paginatedResults,
    total: results.length
  };
}
async function searchCustomers(tenantId, query, limit) {
  const customers = await db4.$queryRaw`
    SELECT
      c.id,
      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.mobile,
      c.credit_score,
      c.lead_status,
      ts_rank(
        to_tsvector('english',
          COALESCE(c.first_name, '') || ' ' ||
          COALESCE(c.last_name, '') || ' ' ||
          COALESCE(c.email, '') || ' ' ||
          COALESCE(c.phone, '') || ' ' ||
          COALESCE(c.mobile, '')
        ),
        to_tsquery('english', ${query.split(" ").join(" & ")})
      ) as rank
    FROM customers c
    WHERE c.tenant_id = ${tenantId}
      AND (
        to_tsvector('english',
          COALESCE(c.first_name, '') || ' ' ||
          COALESCE(c.last_name, '') || ' ' ||
          COALESCE(c.email, '') || ' ' ||
          COALESCE(c.phone, '') || ' ' ||
          COALESCE(c.mobile, '')
        ) @@ to_tsquery('english', ${query.split(" ").join(" & ")})
        OR c.first_name ILIKE ${`%${query}%`}
        OR c.last_name ILIKE ${`%${query}%`}
        OR c.email ILIKE ${`%${query}%`}
        OR c.phone ILIKE ${`%${query}%`}
        OR c.mobile ILIKE ${`%${query}%`}
      )
    ORDER BY rank DESC
    LIMIT ${limit}
  `;
  return customers.map((c) => ({
    type: "customer",
    id: c.id,
    score: parseFloat(c.rank || 0.5),
    data: {
      name: `${c.first_name} ${c.last_name}`,
      email: c.email,
      phone: c.phone || c.mobile,
      creditScore: c.credit_score,
      status: c.lead_status
    },
    url: `/customers/detail/${c.id}`
  }));
}
async function searchVehicles(tenantId, query, limit) {
  const vehicles = await db4.$queryRaw`
    SELECT
      v.id,
      v.year,
      v.make,
      v.model,
      v.trim,
      v.vin,
      v.stock_number,
      v.status,
      v.asking_price,
      v.created_at,
      ts_rank(
        to_tsvector('english',
          COALESCE(v.make, '') || ' ' ||
          COALESCE(v.model, '') || ' ' ||
          COALESCE(v.trim, '') || ' ' ||
          COALESCE(v.vin, '') || ' ' ||
          COALESCE(v.stock_number, '')
        ),
        to_tsquery('english', ${query.split(" ").join(" & ")})
      ) as rank
    FROM vehicles v
    WHERE v.tenant_id = ${tenantId}
      AND (
        to_tsvector('english',
          COALESCE(v.make, '') || ' ' ||
          COALESCE(v.model, '') || ' ' ||
          COALESCE(v.trim, '') || ' ' ||
          COALESCE(v.vin, '') || ' ' ||
          COALESCE(v.stock_number, '')
        ) @@ to_tsquery('english', ${query.split(" ").join(" & ")})
        OR v.make ILIKE ${`%${query}%`}
        OR v.model ILIKE ${`%${query}%`}
        OR v.vin ILIKE ${`%${query}%`}
        OR v.stock_number ILIKE ${`%${query}%`}
      )
    ORDER BY rank DESC
    LIMIT ${limit}
  `;
  return vehicles.map((v) => ({
    type: "vehicle",
    id: v.id,
    score: parseFloat(v.rank || 0.5),
    data: {
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim,
      vin: v.vin,
      stockNumber: v.stock_number,
      status: v.status,
      price: v.asking_price,
      daysInStock: Math.floor((Date.now() - new Date(v.created_at).getTime()) / (1e3 * 60 * 60 * 24))
    },
    url: `/inventory/detail/${v.id}`
  }));
}
async function searchDeals(tenantId, query, limit) {
  const deals = await db4.deal.findMany({
    where: {
      tenantId,
      OR: [
        { id: { contains: query, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } }
            ]
          }
        }
      ]
    },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      vehicle: { select: { year: true, make: true, model: true } }
    },
    take: limit
  });
  return deals.map((d) => ({
    type: "deal",
    id: d.id,
    score: 0.7,
    data: {
      customer: `${d.customer.firstName} ${d.customer.lastName}`,
      vehicle: d.vehicle ? `${d.vehicle.year} ${d.vehicle.make} ${d.vehicle.model}` : null,
      stage: d.stage,
      status: d.status,
      amount: d.sellingPrice,
      createdAt: d.createdAt
    },
    url: `/deals/${d.id}`
  }));
}
async function searchLeads(tenantId, query, limit) {
  const leads = await db4.lead.findMany({
    where: {
      tenantId,
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } }
      ]
    },
    take: limit
  });
  return leads.map((l) => ({
    type: "lead",
    id: l.id,
    score: 0.6,
    data: {
      name: `${l.firstName} ${l.lastName}`,
      email: l.email,
      phone: l.phone,
      status: l.status,
      leadScore: l.leadScore,
      source: l.source
    },
    url: `/crm/leads/${l.id}`
  }));
}
function detectIntent(query) {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("more than") || lowerQuery.includes("less than") || lowerQuery.includes("over") || lowerQuery.includes("under") || lowerQuery.includes("older than") || lowerQuery.includes("newer than")) {
    return { type: "filter_query", query };
  }
  if (lowerQuery.includes("average") || lowerQuery.includes("total") || lowerQuery.includes("sum") || lowerQuery.includes("count")) {
    return { type: "analytics", query };
  }
  return { type: "entity_search", query };
}
async function executeFilterQuery(tenantId, intent, limit, offset) {
  return { results: [], total: 0 };
}
async function executeAnalyticsQuery(tenantId, intent) {
  return { results: [], total: 0 };
}
async function trackSearch(data) {
  await db4.searchQuery.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId,
      query: data.query,
      parsedQuery: data.parsedQuery,
      resultType: data.resultType,
      resultCount: data.resultCount,
      executionTime: data.executionTime
    }
  });
}
async function updatePopularSearch(tenantId, query, category) {
  await db4.popularSearch.upsert({
    where: {
      tenantId_query: { tenantId, query }
    },
    update: {
      count: { increment: 1 },
      lastUsed: /* @__PURE__ */ new Date()
    },
    create: {
      tenantId,
      query,
      category,
      count: 1
    }
  });
}
async function getPopularSearches(tenantId, limit = 10) {
  const popular = await db4.popularSearch.findMany({
    where: { tenantId },
    orderBy: { count: "desc" },
    take: limit,
    select: { query: true }
  });
  return popular.map((p) => p.query);
}
async function generateSuggestions(tenantId, query) {
  const popular = await db4.popularSearch.findMany({
    where: {
      tenantId,
      query: { contains: query, mode: "insensitive" }
    },
    orderBy: { count: "desc" },
    take: 5,
    select: { query: true }
  });
  const suggestions = popular.map((p) => p.query);
  if (suggestions.length < 3) {
    const templates = [
      `${query} this week`,
      `${query} this month`,
      `pending ${query}`,
      `active ${query}`
    ];
    suggestions.push(...templates.slice(0, 5 - suggestions.length));
  }
  return suggestions;
}
async function getRecentSearches(tenantId, userId, limit = 10) {
  const recent = await db4.searchQuery.findMany({
    where: { tenantId, userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      query: true,
      createdAt: true,
      resultType: true
    }
  });
  return recent.map((r) => ({
    query: r.query,
    timestamp: r.createdAt,
    type: r.resultType
  }));
}

// src/routes/search.routes.ts
var searchRouter = Router18();
var searchSchema = z13.object({
  query: z13.string().min(1).max(200),
  filters: z13.object({
    dateRange: z13.enum(["today", "week", "month", "quarter", "year"]).optional(),
    status: z13.array(z13.string()).optional(),
    assignedTo: z13.string().optional()
  }).optional(),
  limit: z13.number().min(1).max(100).optional().default(20),
  offset: z13.number().min(0).optional().default(0)
});
searchRouter.post(
  "/",
  async (req, res, next) => {
    try {
      const validation = searchSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const { query, filters, limit, offset } = validation.data;
      const tenantId = req.tenantId;
      const userId = req.userId;
      const results = await performSearch({
        tenantId,
        userId,
        query,
        filters,
        limit,
        offset
      });
      res.json({ data: results });
    } catch (error) {
      console.error("Search error:", error);
      next(error);
    }
  }
);
searchRouter.get(
  "/suggestions",
  async (req, res, next) => {
    try {
      const query = req.query.q;
      const tenantId = req.tenantId;
      if (!query || query.length < 2) {
        return res.json({ data: { suggestions: [] } });
      }
      const suggestions = await getPopularSearches(tenantId, 10);
      const filtered = suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
      res.json({
        data: {
          suggestions: filtered.map((text) => ({
            text,
            category: "popular"
          }))
        }
      });
    } catch (error) {
      console.error("Suggestions error:", error);
      next(error);
    }
  }
);
searchRouter.get(
  "/recent",
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const tenantId = req.tenantId;
      const userId = req.userId;
      const recent = await getRecentSearches(tenantId, userId, limit);
      res.json({ data: { recent } });
    } catch (error) {
      console.error("Recent searches error:", error);
      next(error);
    }
  }
);
searchRouter.get(
  "/popular",
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const tenantId = req.tenantId;
      const popular = await getPopularSearches(tenantId, limit);
      res.json({
        data: {
          popular: popular.map((query) => ({ query, category: "general" }))
        }
      });
    } catch (error) {
      console.error("Popular searches error:", error);
      next(error);
    }
  }
);
searchRouter.post(
  "/track-click",
  async (req, res, next) => {
    try {
      const { searchQueryId } = req.body;
      if (!searchQueryId) {
        return res.status(400).json({ error: "Missing searchQueryId" });
      }
      res.json({ data: { success: true } });
    } catch (error) {
      console.error("Track click error:", error);
      next(error);
    }
  }
);
searchRouter.delete(
  "/history",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      res.json({ data: { success: true } });
    } catch (error) {
      console.error("Clear history error:", error);
      next(error);
    }
  }
);

// src/routes/pipeline.routes.ts
import { Router as Router19 } from "express";
import { z as z14 } from "zod";
import { DealStage, DealStatus as DealStatus2 } from "@prisma/client";
import { db as db6 } from "@repo/db";

// src/services/pipeline.service.ts
import { db as db5 } from "@repo/db";
async function getPipelineData(filters) {
  const { tenantId, salesPersonId, salesManagerId, dateFrom, dateTo, status: status2, minValue, maxValue } = filters;
  const where = {
    tenantId,
    deletedAt: null
  };
  if (salesPersonId) {
    where.salesPersonId = salesPersonId;
  }
  if (salesManagerId) {
    where.salesManagerId = salesManagerId;
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }
  if (status2 && status2.length > 0) {
    where.status = { in: status2 };
  }
  if (minValue !== void 0 || maxValue !== void 0) {
    where.sellingPrice = {};
    if (minValue !== void 0) where.sellingPrice.gte = minValue;
    if (maxValue !== void 0) where.sellingPrice.lte = maxValue;
  }
  const deals = await db5.deal.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true
        }
      },
      salesPerson: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      stageTransitions: {
        orderBy: { transitionedAt: "desc" },
        take: 1
      }
    },
    orderBy: [{ stage: "asc" }, { createdAt: "desc" }]
  });
  const stages = [
    "LEAD",
    "WORKING",
    "PENDING_FINANCE",
    "APPROVED",
    "PENDING_DELIVERY",
    "DELIVERED",
    "LOST"
  ];
  const columns = stages.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    const pipelineDeals = stageDeals.map((deal) => {
      const now = /* @__PURE__ */ new Date();
      const createdAt = new Date(deal.createdAt);
      const totalDays = Math.floor((now.getTime() - createdAt.getTime()) / (1e3 * 60 * 60 * 24));
      const lastTransition = deal.stageTransitions[0];
      const stageStartDate = lastTransition ? new Date(lastTransition.transitionedAt) : createdAt;
      const daysInStage = Math.floor(
        (now.getTime() - stageStartDate.getTime()) / (1e3 * 60 * 60 * 24)
      );
      return {
        id: deal.id,
        stage: deal.stage,
        status: deal.status,
        customer: {
          id: deal.customer.id,
          name: `${deal.customer.firstName} ${deal.customer.lastName}`,
          email: deal.customer.email,
          phone: deal.customer.phone
        },
        vehicle: deal.vehicle ? {
          id: deal.vehicle.id,
          year: deal.vehicle.year,
          make: deal.vehicle.make,
          model: deal.vehicle.model,
          vin: deal.vehicle.vin
        } : null,
        salesperson: deal.salesPerson ? {
          id: deal.salesPerson.id,
          name: `${deal.salesPerson.firstName} ${deal.salesPerson.lastName}`
        } : null,
        sellingPrice: deal.sellingPrice ? parseFloat(deal.sellingPrice) : null,
        grossProfit: deal.grossProfit ? parseFloat(deal.grossProfit) : null,
        createdAt: deal.createdAt,
        updatedAt: deal.updatedAt,
        daysInStage,
        totalDays
      };
    });
    const totalValue2 = pipelineDeals.reduce((sum3, d) => sum3 + (d.sellingPrice || 0), 0);
    const avgDaysInStage = pipelineDeals.length > 0 ? pipelineDeals.reduce((sum3, d) => sum3 + d.daysInStage, 0) / pipelineDeals.length : 0;
    return {
      stage,
      deals: pipelineDeals,
      totalDeals: pipelineDeals.length,
      totalValue: totalValue2,
      avgDaysInStage: Math.round(avgDaysInStage)
    };
  });
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum3, d) => sum3 + parseFloat(d.sellingPrice || "0"), 0);
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;
  const deliveredDeals = deals.filter((d) => d.stage === "DELIVERED");
  const avgDaysToClose = deliveredDeals.length > 0 ? deliveredDeals.reduce((sum3, d) => {
    const days = Math.floor(
      (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()) / (1e3 * 60 * 60 * 24)
    );
    return sum3 + days;
  }, 0) / deliveredDeals.length : 0;
  return {
    columns,
    summary: {
      totalDeals,
      totalValue,
      avgDealValue,
      avgDaysToClose: Math.round(avgDaysToClose)
    }
  };
}
async function moveDealToStage(dealId, newStage, userId, tenantId, notes) {
  const deal = await db5.deal.findUnique({
    where: { id: dealId },
    select: { stage: true, tenantId: true }
  });
  if (!deal) {
    throw new Error("Deal not found");
  }
  if (deal.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  const oldStage = deal.stage;
  await db5.deal.update({
    where: { id: dealId },
    data: {
      stage: newStage,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  await db5.stageTransition.create({
    data: {
      tenantId,
      dealId,
      fromStage: oldStage,
      toStage: newStage,
      transitionedBy: userId,
      transitionedAt: /* @__PURE__ */ new Date(),
      notes
    }
  });
  await db5.activity.create({
    data: {
      tenantId,
      userId,
      type: "STAGE_CHANGE",
      entityType: "DEAL",
      entityId: dealId,
      description: `Moved deal from ${oldStage} to ${newStage}`,
      metadata: {
        oldStage,
        newStage,
        notes
      }
    }
  });
}
async function bulkUpdateDeals(dealIds, updates, userId, tenantId) {
  const deals = await db5.deal.findMany({
    where: {
      id: { in: dealIds },
      tenantId
    },
    select: { id: true, stage: true }
  });
  if (deals.length !== dealIds.length) {
    throw new Error("Some deals not found or unauthorized");
  }
  await db5.deal.updateMany({
    where: {
      id: { in: dealIds },
      tenantId
    },
    data: {
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  if (updates.stage) {
    const transitions = deals.map((deal) => ({
      tenantId,
      dealId: deal.id,
      fromStage: deal.stage,
      toStage: updates.stage,
      transitionedBy: userId,
      transitionedAt: /* @__PURE__ */ new Date()
    }));
    await db5.stageTransition.createMany({
      data: transitions
    });
  }
  await db5.activity.create({
    data: {
      tenantId,
      userId,
      type: "BULK_UPDATE",
      entityType: "DEAL",
      description: `Bulk updated ${dealIds.length} deals`,
      metadata: {
        dealIds,
        updates
      }
    }
  });
}
async function getPipelineStats(tenantId, dateFrom, dateTo) {
  const where = {
    tenantId,
    deletedAt: null
  };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }
  const stageDistribution = await db5.deal.groupBy({
    by: ["stage"],
    where,
    _count: { id: true },
    _sum: { sellingPrice: true }
  });
  const totalDeals = await db5.deal.count({ where });
  const deliveredDeals = await db5.deal.count({
    where: { ...where, stage: "DELIVERED" }
  });
  const lostDeals = await db5.deal.count({
    where: { ...where, stage: "LOST" }
  });
  const conversionRate = totalDeals > 0 ? deliveredDeals / totalDeals * 100 : 0;
  const lossRate = totalDeals > 0 ? lostDeals / totalDeals * 100 : 0;
  const avgTimeByStage = await db5.$queryRaw`
    SELECT
      st.to_stage as stage,
      AVG(EXTRACT(DAY FROM (COALESCE(next_transition.transitioned_at, NOW()) - st.transitioned_at))) as avg_days
    FROM stage_transitions st
    LEFT JOIN LATERAL (
      SELECT transitioned_at
      FROM stage_transitions
      WHERE deal_id = st.deal_id
        AND transitioned_at > st.transitioned_at
      ORDER BY transitioned_at ASC
      LIMIT 1
    ) next_transition ON true
    WHERE st.tenant_id = ${tenantId}
    GROUP BY st.to_stage
  `;
  return {
    stageDistribution: stageDistribution.map((s) => ({
      stage: s.stage,
      count: s._count.id,
      value: parseFloat(s._sum.sellingPrice || "0")
    })),
    conversionRate: Math.round(conversionRate * 10) / 10,
    lossRate: Math.round(lossRate * 10) / 10,
    avgTimeByStage: avgTimeByStage.map((s) => ({
      stage: s.stage,
      avgDays: Math.round(s.avg_days)
    })),
    totalDeals,
    deliveredDeals,
    lostDeals
  };
}

// src/routes/pipeline.routes.ts
var pipelineRouter = Router19();
var pipelineFiltersSchema = z14.object({
  salesPersonId: z14.string().optional(),
  salesManagerId: z14.string().optional(),
  dateFrom: z14.string().datetime().optional(),
  dateTo: z14.string().datetime().optional(),
  status: z14.array(z14.nativeEnum(DealStatus2)).optional(),
  minValue: z14.number().optional(),
  maxValue: z14.number().optional()
});
var moveDealSchema = z14.object({
  stage: z14.nativeEnum(DealStage),
  notes: z14.string().optional()
});
var bulkUpdateSchema = z14.object({
  dealIds: z14.array(z14.string()).min(1),
  updates: z14.object({
    stage: z14.nativeEnum(DealStage).optional(),
    status: z14.nativeEnum(DealStatus2).optional(),
    salesPersonId: z14.string().optional(),
    salesManagerId: z14.string().optional()
  })
});
pipelineRouter.get(
  "/",
  async (req, res, next) => {
    try {
      const validation = pipelineFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid filters",
          details: validation.error.errors
        });
      }
      const filters = validation.data;
      const tenantId = req.tenantId;
      const pipelineData = await getPipelineData({
        tenantId,
        ...filters,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : void 0,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : void 0
      });
      res.json({ data: pipelineData });
    } catch (error) {
      console.error("Pipeline fetch error:", error);
      next(error);
    }
  }
);
pipelineRouter.patch(
  "/deals/:id/stage",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = moveDealSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const { stage, notes } = validation.data;
      const tenantId = req.tenantId;
      const userId = req.userId;
      await moveDealToStage(id, stage, userId, tenantId, notes);
      res.json({
        data: {
          success: true,
          message: `Deal moved to ${stage}`
        }
      });
    } catch (error) {
      console.error("Move deal error:", error);
      if (error.message === "Deal not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
pipelineRouter.post(
  "/deals/bulk-update",
  async (req, res, next) => {
    try {
      const validation = bulkUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const { dealIds, updates } = validation.data;
      const tenantId = req.tenantId;
      const userId = req.userId;
      await bulkUpdateDeals(dealIds, updates, userId, tenantId);
      res.json({
        data: {
          success: true,
          message: `${dealIds.length} deals updated`
        }
      });
    } catch (error) {
      console.error("Bulk update error:", error);
      if (error.message.includes("not found") || error.message.includes("unauthorized")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);
pipelineRouter.get(
  "/stats",
  async (req, res, next) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const tenantId = req.tenantId;
      const stats = await getPipelineStats(
        tenantId,
        dateFrom ? new Date(dateFrom) : void 0,
        dateTo ? new Date(dateTo) : void 0
      );
      res.json({ data: stats });
    } catch (error) {
      console.error("Pipeline stats error:", error);
      next(error);
    }
  }
);
pipelineRouter.get(
  "/deals/:id/history",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const transitions = await db6.stageTransition.findMany({
        where: {
          dealId: id,
          tenantId
        },
        include: {
          transitionedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { transitionedAt: "desc" }
      });
      res.json({
        data: transitions.map((t) => ({
          id: t.id,
          fromStage: t.fromStage,
          toStage: t.toStage,
          transitionedAt: t.transitionedAt,
          transitionedBy: {
            id: t.transitionedByUser.id,
            name: `${t.transitionedByUser.firstName} ${t.transitionedByUser.lastName}`
          },
          notes: t.notes
        }))
      });
    } catch (error) {
      console.error("Deal history error:", error);
      next(error);
    }
  }
);

// src/routes/service-order.routes.ts
import { Router as Router20 } from "express";
import { z as z15 } from "zod";
import { ServiceOrderStatus } from "@prisma/client";

// src/services/service-order.service.ts
import { db as db7 } from "@repo/db";
async function getServiceOrders(filters) {
  const { tenantId, status: status2, advisorId, technicianId, customerId, vehicleId, dateFrom, dateTo } = filters;
  const where = {
    tenantId,
    deletedAt: null
  };
  if (status2 && status2.length > 0) {
    where.status = { in: status2 };
  }
  if (advisorId) {
    where.advisorId = advisorId;
  }
  if (technicianId) {
    where.technicianId = technicianId;
  }
  if (customerId) {
    where.customerId = customerId;
  }
  if (vehicleId) {
    where.vehicleId = vehicleId;
  }
  if (dateFrom || dateTo) {
    where.scheduledDate = {};
    if (dateFrom) where.scheduledDate.gte = dateFrom;
    if (dateTo) where.scheduledDate.lte = dateTo;
  }
  const serviceOrders = await db7.serviceOrder.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true
        }
      },
      advisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      technician: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      lineItems: true
    },
    orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }]
  });
  return serviceOrders.map((order) => ({
    ...order,
    customer: {
      ...order.customer,
      name: `${order.customer.firstName} ${order.customer.lastName}`
    },
    advisor: order.advisor ? {
      ...order.advisor,
      name: `${order.advisor.firstName} ${order.advisor.lastName}`
    } : null,
    technician: order.technician ? {
      ...order.technician,
      name: `${order.technician.firstName} ${order.technician.lastName}`
    } : null
  }));
}
async function getServiceOrderById(id, tenantId) {
  const serviceOrder = await db7.serviceOrder.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true,
          mileage: true
        }
      },
      advisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      technician: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      lineItems: true
    }
  });
  if (!serviceOrder) {
    throw new Error("Service order not found");
  }
  if (serviceOrder.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  return {
    ...serviceOrder,
    customer: {
      ...serviceOrder.customer,
      name: `${serviceOrder.customer.firstName} ${serviceOrder.customer.lastName}`
    },
    advisor: serviceOrder.advisor ? {
      ...serviceOrder.advisor,
      name: `${serviceOrder.advisor.firstName} ${serviceOrder.advisor.lastName}`
    } : null,
    technician: serviceOrder.technician ? {
      ...serviceOrder.technician,
      name: `${serviceOrder.technician.firstName} ${serviceOrder.technician.lastName}`
    } : null
  };
}
async function createServiceOrder(input) {
  const serviceOrder = await db7.serviceOrder.create({
    data: {
      tenantId: input.tenantId,
      roNumber: input.roNumber,
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      locationId: input.locationId,
      type: input.type,
      advisorId: input.advisorId,
      technicianId: input.technicianId,
      scheduledDate: input.scheduledDate,
      promisedDate: input.promisedDate,
      mileageIn: input.mileageIn,
      customerConcern: input.customerConcern,
      notes: input.notes,
      internalNotes: input.internalNotes
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true
        }
      },
      advisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      technician: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
  await db7.activity.create({
    data: {
      tenantId: input.tenantId,
      userId: input.advisorId || input.technicianId,
      type: "SERVICE_ORDER_CREATED",
      entityType: "SERVICE_ORDER",
      entityId: serviceOrder.id,
      description: `Created service order ${input.roNumber}`,
      metadata: {
        roNumber: input.roNumber,
        customerId: input.customerId,
        vehicleId: input.vehicleId
      }
    }
  });
  return serviceOrder;
}
async function updateServiceOrder(id, tenantId, userId, updates) {
  const existingOrder = await db7.serviceOrder.findUnique({
    where: { id },
    select: { tenantId: true, status: true }
  });
  if (!existingOrder) {
    throw new Error("Service order not found");
  }
  if (existingOrder.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  const serviceOrder = await db7.serviceOrder.update({
    where: { id },
    data: updates,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true
        }
      },
      advisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      technician: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
  if (updates.status && updates.status !== existingOrder.status) {
    await db7.activity.create({
      data: {
        tenantId,
        userId,
        type: "SERVICE_ORDER_STATUS_CHANGED",
        entityType: "SERVICE_ORDER",
        entityId: id,
        description: `Changed service order status from ${existingOrder.status} to ${updates.status}`,
        metadata: {
          oldStatus: existingOrder.status,
          newStatus: updates.status
        }
      }
    });
  }
  return serviceOrder;
}
async function deleteServiceOrder(id, tenantId, userId) {
  const existingOrder = await db7.serviceOrder.findUnique({
    where: { id },
    select: { tenantId: true, roNumber: true }
  });
  if (!existingOrder) {
    throw new Error("Service order not found");
  }
  if (existingOrder.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  await db7.serviceOrder.update({
    where: { id },
    data: {
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  await db7.activity.create({
    data: {
      tenantId,
      userId,
      type: "SERVICE_ORDER_DELETED",
      entityType: "SERVICE_ORDER",
      entityId: id,
      description: `Deleted service order ${existingOrder.roNumber}`
    }
  });
}
async function addServiceOrderLineItems(serviceOrderId, tenantId, lineItems) {
  const order = await db7.serviceOrder.findUnique({
    where: { id: serviceOrderId },
    select: { tenantId: true }
  });
  if (!order) {
    throw new Error("Service order not found");
  }
  if (order.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  const createdLineItems = await db7.serviceLineItem.createMany({
    data: lineItems.map((item) => ({
      tenantId,
      serviceOrderId,
      type: item.type,
      description: item.description,
      hours: item.hours,
      rateCents: item.rateCents,
      amountCents: item.amountCents
    }))
  });
  const allLineItems = await db7.serviceLineItem.findMany({
    where: { serviceOrderId, tenantId }
  });
  const totalCents = allLineItems.reduce((sum3, item) => sum3 + item.amountCents, 0);
  await db7.serviceOrder.update({
    where: { id: serviceOrderId },
    data: {
      subtotalCents: totalCents,
      totalCents: totalCents + (order.tenantId ? 0 : 0)
      // Add tax calculation here
    }
  });
  return createdLineItems;
}
async function getServiceOrderStats(tenantId, dateFrom, dateTo) {
  const where = {
    tenantId,
    deletedAt: null
  };
  if (dateFrom || dateTo) {
    where.scheduledDate = {};
    if (dateFrom) where.scheduledDate.gte = dateFrom;
    if (dateTo) where.scheduledDate.lte = dateTo;
  }
  const statusDistribution = await db7.serviceOrder.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
    _sum: { totalCents: true }
  });
  const technicianWorkload = await db7.serviceOrder.groupBy({
    by: ["technicianId"],
    where: {
      ...where,
      technicianId: { not: null }
    },
    _count: { id: true }
  });
  const typeDistribution = await db7.serviceOrder.groupBy({
    by: ["type"],
    where,
    _count: { id: true }
  });
  const totalOrders = await db7.serviceOrder.count({ where });
  const completedOrders = await db7.serviceOrder.count({
    where: { ...where, status: "COMPLETED" }
  });
  return {
    statusDistribution: statusDistribution.map((s) => ({
      status: s.status,
      count: s._count.id,
      totalRevenue: s._sum.totalCents || 0
    })),
    technicianWorkload: technicianWorkload.map((t) => ({
      technicianId: t.technicianId,
      orderCount: t._count.id
    })),
    typeDistribution: typeDistribution.map((t) => ({
      type: t.type,
      count: t._count.id
    })),
    totalOrders,
    completedOrders,
    completionRate: totalOrders > 0 ? completedOrders / totalOrders * 100 : 0
  };
}

// src/routes/service-order.routes.ts
var serviceOrderRouter = Router20();
var serviceOrderFiltersSchema = z15.object({
  status: z15.array(z15.nativeEnum(ServiceOrderStatus)).optional(),
  advisorId: z15.string().optional(),
  technicianId: z15.string().optional(),
  customerId: z15.string().optional(),
  vehicleId: z15.string().optional(),
  dateFrom: z15.string().datetime().optional(),
  dateTo: z15.string().datetime().optional()
});
var createServiceOrderSchema = z15.object({
  roNumber: z15.string().min(1),
  customerId: z15.string(),
  vehicleId: z15.string(),
  locationId: z15.string().optional(),
  type: z15.string(),
  advisorId: z15.string().optional(),
  technicianId: z15.string().optional(),
  scheduledDate: z15.string().datetime().optional(),
  promisedDate: z15.string().datetime().optional(),
  mileageIn: z15.number().optional(),
  customerConcern: z15.string().optional(),
  notes: z15.string().optional(),
  internalNotes: z15.string().optional()
});
var updateServiceOrderSchema = z15.object({
  status: z15.nativeEnum(ServiceOrderStatus).optional(),
  advisorId: z15.string().optional(),
  technicianId: z15.string().optional(),
  scheduledDate: z15.string().datetime().optional(),
  startedAt: z15.string().datetime().optional(),
  completedAt: z15.string().datetime().optional(),
  promisedDate: z15.string().datetime().optional(),
  mileageIn: z15.number().optional(),
  mileageOut: z15.number().optional(),
  customerConcern: z15.string().optional(),
  causeOfFailure: z15.string().optional(),
  correction: z15.string().optional(),
  laborCents: z15.number().optional(),
  partsCents: z15.number().optional(),
  subletCents: z15.number().optional(),
  shopSuppliesCents: z15.number().optional(),
  subtotalCents: z15.number().optional(),
  taxCents: z15.number().optional(),
  totalCents: z15.number().optional(),
  isPaid: z15.boolean().optional(),
  paidAt: z15.string().datetime().optional(),
  notes: z15.string().optional(),
  internalNotes: z15.string().optional()
});
var addLineItemsSchema = z15.object({
  lineItems: z15.array(
    z15.object({
      type: z15.string(),
      description: z15.string().optional(),
      hours: z15.number().optional(),
      rateCents: z15.number().optional(),
      amountCents: z15.number()
    })
  )
});
serviceOrderRouter.get(
  "/",
  async (req, res, next) => {
    try {
      const validation = serviceOrderFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid filters",
          details: validation.error.errors
        });
      }
      const filters = validation.data;
      const tenantId = req.tenantId;
      const serviceOrders = await getServiceOrders({
        tenantId,
        ...filters,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : void 0,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : void 0
      });
      res.json({ data: serviceOrders });
    } catch (error) {
      console.error("Service orders fetch error:", error);
      next(error);
    }
  }
);
serviceOrderRouter.get(
  "/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const serviceOrder = await getServiceOrderById(id, tenantId);
      res.json({ data: serviceOrder });
    } catch (error) {
      console.error("Service order fetch error:", error);
      if (error.message === "Service order not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
serviceOrderRouter.post(
  "/",
  async (req, res, next) => {
    try {
      const validation = createServiceOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const serviceOrderData = validation.data;
      const serviceOrder = await createServiceOrder({
        tenantId,
        ...serviceOrderData,
        scheduledDate: serviceOrderData.scheduledDate ? new Date(serviceOrderData.scheduledDate) : void 0,
        promisedDate: serviceOrderData.promisedDate ? new Date(serviceOrderData.promisedDate) : void 0
      });
      res.status(201).json({ data: serviceOrder });
    } catch (error) {
      console.error("Service order creation error:", error);
      next(error);
    }
  }
);
serviceOrderRouter.put(
  "/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updateServiceOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const userId = req.userId;
      const updates = validation.data;
      const processedUpdates = {
        ...updates,
        scheduledDate: updates.scheduledDate ? new Date(updates.scheduledDate) : void 0,
        startedAt: updates.startedAt ? new Date(updates.startedAt) : void 0,
        completedAt: updates.completedAt ? new Date(updates.completedAt) : void 0,
        promisedDate: updates.promisedDate ? new Date(updates.promisedDate) : void 0,
        paidAt: updates.paidAt ? new Date(updates.paidAt) : void 0
      };
      const serviceOrder = await updateServiceOrder(id, tenantId, userId, processedUpdates);
      res.json({ data: serviceOrder });
    } catch (error) {
      console.error("Service order update error:", error);
      if (error.message === "Service order not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
serviceOrderRouter.delete(
  "/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const userId = req.userId;
      await deleteServiceOrder(id, tenantId, userId);
      res.json({
        data: {
          success: true,
          message: "Service order deleted successfully"
        }
      });
    } catch (error) {
      console.error("Service order deletion error:", error);
      if (error.message === "Service order not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
serviceOrderRouter.post(
  "/:id/line-items",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = addLineItemsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const { lineItems } = validation.data;
      await addServiceOrderLineItems(id, tenantId, lineItems);
      res.status(201).json({
        data: {
          success: true,
          message: `${lineItems.length} line items added successfully`
        }
      });
    } catch (error) {
      console.error("Line items creation error:", error);
      if (error.message === "Service order not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
serviceOrderRouter.get(
  "/stats/overview",
  async (req, res, next) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const tenantId = req.tenantId;
      const stats = await getServiceOrderStats(
        tenantId,
        dateFrom ? new Date(dateFrom) : void 0,
        dateTo ? new Date(dateTo) : void 0
      );
      res.json({ data: stats });
    } catch (error) {
      console.error("Service order stats error:", error);
      next(error);
    }
  }
);

// src/routes/inventory.routes.ts
import { Router as Router21 } from "express";
import { z as z16 } from "zod";
import { VehicleStatus, VehicleType } from "@prisma/client";

// src/services/inventory.service.ts
import { db as db8 } from "@repo/db";
async function getInventory(filters) {
  const {
    tenantId,
    status: status2,
    type,
    year,
    make,
    model,
    locationId,
    priceMin,
    priceMax,
    daysInStockMin,
    daysInStockMax,
    search
  } = filters;
  const where = {
    tenantId,
    deletedAt: null
  };
  if (status2 && status2.length > 0) {
    where.status = { in: status2 };
  }
  if (type && type.length > 0) {
    where.type = { in: type };
  }
  if (year) {
    where.year = {};
    if (year.min) where.year.gte = year.min;
    if (year.max) where.year.lte = year.max;
  }
  if (make && make.length > 0) {
    where.make = { in: make };
  }
  if (model && model.length > 0) {
    where.model = { in: model };
  }
  if (locationId) {
    where.locationId = locationId;
  }
  if (priceMin !== void 0 || priceMax !== void 0) {
    where.priceCents = {};
    if (priceMin !== void 0) where.priceCents.gte = priceMin * 100;
    if (priceMax !== void 0) where.priceCents.lte = priceMax * 100;
  }
  if (daysInStockMin !== void 0 || daysInStockMax !== void 0) {
    where.daysInStock = {};
    if (daysInStockMin !== void 0) where.daysInStock.gte = daysInStockMin;
    if (daysInStockMax !== void 0) where.daysInStock.lte = daysInStockMax;
  }
  if (search) {
    where.OR = [
      { vin: { contains: search, mode: "insensitive" } },
      { stockNumber: { contains: search, mode: "insensitive" } },
      { make: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } }
    ];
  }
  const vehicles = await db8.vehicle.findMany({
    where,
    include: {
      locationRef: {
        select: {
          id: true,
          name: true
        }
      },
      deals: {
        where: {
          status: { in: ["WORKING", "PENDING", "APPROVED"] }
        },
        select: {
          id: true,
          status: true,
          salesperson: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
    orderBy: [{ createdAt: "desc" }]
  });
  return vehicles.map((vehicle) => ({
    ...vehicle,
    price: vehicle.priceCents ? vehicle.priceCents / 100 : null,
    cost: vehicle.costCents ? vehicle.costCents / 100 : null,
    msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : null,
    minPrice: vehicle.minPriceCents ? vehicle.minPriceCents / 100 : null,
    grossProfit: vehicle.priceCents && vehicle.costCents ? (vehicle.priceCents - vehicle.costCents) / 100 : null,
    hasActiveDeals: vehicle.deals.length > 0,
    activeDealCount: vehicle.deals.length
  }));
}
async function getVehicleById(id, tenantId) {
  const vehicle = await db8.vehicle.findUnique({
    where: { id },
    include: {
      locationRef: {
        select: {
          id: true,
          name: true,
          address: true
        }
      },
      deals: {
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          salesperson: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      priceHistory: {
        orderBy: { changedAt: "desc" },
        take: 10
      },
      appraisals: {
        orderBy: { createdAt: "desc" },
        take: 5
      },
      serviceOrders: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5
      },
      reconItems: {
        orderBy: { createdAt: "desc" }
      },
      histories: {
        orderBy: { timestamp: "desc" },
        take: 20
      }
    }
  });
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }
  if (vehicle.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  return {
    ...vehicle,
    price: vehicle.priceCents ? vehicle.priceCents / 100 : null,
    cost: vehicle.costCents ? vehicle.costCents / 100 : null,
    msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : null,
    minPrice: vehicle.minPriceCents ? vehicle.minPriceCents / 100 : null,
    grossProfit: vehicle.priceCents && vehicle.costCents ? (vehicle.priceCents - vehicle.costCents) / 100 : null
  };
}
async function createVehicle(input) {
  const existingVehicle = await db8.vehicle.findUnique({
    where: { vin: input.vin }
  });
  if (existingVehicle && !existingVehicle.deletedAt) {
    throw new Error("Vehicle with this VIN already exists");
  }
  const daysInStock = input.acquiredDate ? Math.floor((Date.now() - input.acquiredDate.getTime()) / (1e3 * 60 * 60 * 24)) : 0;
  const vehicle = await db8.vehicle.create({
    data: {
      tenantId: input.tenantId,
      stockNumber: input.stockNumber,
      vin: input.vin,
      type: input.type,
      year: input.year,
      make: input.make,
      model: input.model,
      trim: input.trim,
      bodyStyle: input.bodyStyle,
      exteriorColor: input.exteriorColor,
      interiorColor: input.interiorColor,
      mileage: input.mileage,
      engineType: input.engineType,
      transmission: input.transmission,
      drivetrain: input.drivetrain,
      fuelType: input.fuelType,
      condition: input.condition,
      costCents: input.costCents,
      msrpCents: input.msrpCents,
      priceCents: input.priceCents,
      minPriceCents: input.minPriceCents,
      locationId: input.locationId,
      acquiredFrom: input.acquiredFrom,
      acquiredDate: input.acquiredDate,
      daysInStock,
      features: input.features || [],
      imageUrls: input.images || [],
      primaryImageUrl: input.primaryImageUrl,
      certifiedPreOwned: input.certifiedPreOwned || false,
      notes: input.notes
    },
    include: {
      locationRef: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  await db8.activity.create({
    data: {
      tenantId: input.tenantId,
      userId: input.tenantId,
      // TODO: Pass actual user ID
      type: "VEHICLE_ADDED",
      entityType: "VEHICLE",
      entityId: vehicle.id,
      description: `Added vehicle ${input.year} ${input.make} ${input.model} (Stock: ${input.stockNumber})`,
      metadata: {
        vin: input.vin,
        stockNumber: input.stockNumber,
        year: input.year,
        make: input.make,
        model: input.model
      }
    }
  });
  return vehicle;
}
async function updateVehicle(id, tenantId, userId, updates) {
  const existingVehicle = await db8.vehicle.findUnique({
    where: { id },
    select: { tenantId: true, status: true, priceCents: true }
  });
  if (!existingVehicle) {
    throw new Error("Vehicle not found");
  }
  if (existingVehicle.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  const vehicle = await db8.vehicle.update({
    where: { id },
    data: updates,
    include: {
      locationRef: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  if (updates.status && updates.status !== existingVehicle.status) {
    await db8.activity.create({
      data: {
        tenantId,
        userId,
        type: "VEHICLE_STATUS_CHANGED",
        entityType: "VEHICLE",
        entityId: id,
        description: `Changed vehicle status from ${existingVehicle.status} to ${updates.status}`,
        metadata: {
          oldStatus: existingVehicle.status,
          newStatus: updates.status
        }
      }
    });
  }
  return vehicle;
}
async function deleteVehicle(id, tenantId, userId) {
  const existingVehicle = await db8.vehicle.findUnique({
    where: { id },
    select: { tenantId: true, stockNumber: true, make: true, model: true, year: true }
  });
  if (!existingVehicle) {
    throw new Error("Vehicle not found");
  }
  if (existingVehicle.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  await db8.vehicle.update({
    where: { id },
    data: {
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  await db8.activity.create({
    data: {
      tenantId,
      userId,
      type: "VEHICLE_DELETED",
      entityType: "VEHICLE",
      entityId: id,
      description: `Deleted vehicle ${existingVehicle.year} ${existingVehicle.make} ${existingVehicle.model} (Stock: ${existingVehicle.stockNumber})`
    }
  });
}
async function updateVehicleStatus(id, tenantId, userId, status2, notes) {
  const vehicle = await db8.vehicle.findUnique({
    where: { id },
    select: { tenantId: true, status: true }
  });
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }
  if (vehicle.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  const updatedVehicle = await db8.vehicle.update({
    where: { id },
    data: {
      status: status2,
      ...status2 === "SOLD" && { dateSold: /* @__PURE__ */ new Date() }
    }
  });
  await db8.activity.create({
    data: {
      tenantId,
      userId,
      type: "VEHICLE_STATUS_CHANGED",
      entityType: "VEHICLE",
      entityId: id,
      description: `Changed vehicle status from ${vehicle.status} to ${status2}`,
      metadata: {
        oldStatus: vehicle.status,
        newStatus: status2,
        notes
      }
    }
  });
  return updatedVehicle;
}
async function updateVehiclePrice(id, tenantId, priceUpdate) {
  const vehicle = await db8.vehicle.findUnique({
    where: { id },
    select: { tenantId: true, priceCents: true, stockNumber: true }
  });
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }
  if (vehicle.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }
  const updatedVehicle = await db8.vehicle.update({
    where: { id },
    data: {
      priceCents: priceUpdate.priceCents,
      minPriceCents: priceUpdate.minPriceCents,
      pricingNotes: priceUpdate.pricingNotes,
      lastPriceChangeDate: /* @__PURE__ */ new Date()
    }
  });
  await db8.priceHistory.create({
    data: {
      tenantId,
      vehicleId: id,
      priceCents: priceUpdate.priceCents,
      previousPriceCents: vehicle.priceCents,
      changedBy: priceUpdate.userId,
      reason: priceUpdate.pricingNotes || "Manual price adjustment"
    }
  });
  await db8.activity.create({
    data: {
      tenantId,
      userId: priceUpdate.userId,
      type: "VEHICLE_PRICE_CHANGED",
      entityType: "VEHICLE",
      entityId: id,
      description: `Changed price from $${vehicle.priceCents ? vehicle.priceCents / 100 : 0} to $${priceUpdate.priceCents / 100}`,
      metadata: {
        oldPrice: vehicle.priceCents,
        newPrice: priceUpdate.priceCents,
        stockNumber: vehicle.stockNumber
      }
    }
  });
  return updatedVehicle;
}
async function getInventoryMetrics(tenantId) {
  const [
    totalInventory,
    availableCount,
    soldThisMonth,
    avgDaysInStock,
    totalInventoryValue,
    statusDistribution,
    typeDistribution
  ] = await Promise.all([
    // Total inventory count
    db8.vehicle.count({
      where: {
        tenantId,
        deletedAt: null
      }
    }),
    // Available vehicles
    db8.vehicle.count({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ["AVAILABLE", "IN_STOCK"] }
      }
    }),
    // Sold this month
    db8.vehicle.count({
      where: {
        tenantId,
        status: "SOLD",
        dateSold: {
          gte: new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1)
        }
      }
    }),
    // Average days in stock
    db8.vehicle.aggregate({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ["AVAILABLE", "IN_STOCK"] }
      },
      _avg: {
        daysInStock: true
      }
    }),
    // Total inventory value
    db8.vehicle.aggregate({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ["AVAILABLE", "IN_STOCK"] }
      },
      _sum: {
        costCents: true
      }
    }),
    // Status distribution
    db8.vehicle.groupBy({
      by: ["status"],
      where: {
        tenantId,
        deletedAt: null
      },
      _count: { id: true }
    }),
    // Type distribution
    db8.vehicle.groupBy({
      by: ["type"],
      where: {
        tenantId,
        deletedAt: null
      },
      _count: { id: true }
    })
  ]);
  return {
    totalInventory,
    availableCount,
    soldThisMonth,
    avgDaysInStock: Math.round(avgDaysInStock._avg.daysInStock || 0),
    totalInventoryValue: totalInventoryValue._sum.costCents ? totalInventoryValue._sum.costCents / 100 : 0,
    statusDistribution: statusDistribution.map((s) => ({
      status: s.status,
      count: s._count.id
    })),
    typeDistribution: typeDistribution.map((t) => ({
      type: t.type,
      count: t._count.id
    }))
  };
}
async function getAgingAnalysis(tenantId) {
  const vehicles = await db8.vehicle.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: { in: ["AVAILABLE", "IN_STOCK"] }
    },
    select: {
      id: true,
      stockNumber: true,
      year: true,
      make: true,
      model: true,
      daysInStock: true,
      priceCents: true,
      costCents: true
    }
  });
  const buckets = {
    "0-30": [],
    "31-60": [],
    "61-90": [],
    "91-120": [],
    "121+": []
  };
  vehicles.forEach((vehicle) => {
    const days = vehicle.daysInStock || 0;
    if (days <= 30) buckets["0-30"].push(vehicle);
    else if (days <= 60) buckets["31-60"].push(vehicle);
    else if (days <= 90) buckets["61-90"].push(vehicle);
    else if (days <= 120) buckets["91-120"].push(vehicle);
    else buckets["121+"].push(vehicle);
  });
  return {
    buckets: Object.entries(buckets).map(([range, vehicles2]) => ({
      range,
      count: vehicles2.length,
      totalValue: vehicles2.reduce((sum3, v) => sum3 + (v.costCents || 0), 0) / 100,
      vehicles: vehicles2.map((v) => ({
        id: v.id,
        stockNumber: v.stockNumber,
        description: `${v.year} ${v.make} ${v.model}`,
        daysInStock: v.daysInStock,
        price: v.priceCents ? v.priceCents / 100 : null
      }))
    }))
  };
}
async function getTurnRateMetrics(tenantId, months = 12) {
  const startDate = /* @__PURE__ */ new Date();
  startDate.setMonth(startDate.getMonth() - months);
  const soldVehicles = await db8.vehicle.findMany({
    where: {
      tenantId,
      status: "SOLD",
      dateSold: {
        gte: startDate
      }
    },
    select: {
      dateSold: true,
      daysInStock: true,
      acquiredDate: true
    }
  });
  const avgInventory = await db8.vehicle.count({
    where: {
      tenantId,
      deletedAt: null,
      status: { in: ["AVAILABLE", "IN_STOCK"] }
    }
  });
  const soldCount = soldVehicles.length;
  const turnRate = avgInventory > 0 ? soldCount / avgInventory * (12 / months) : 0;
  const avgTimeToSell = soldVehicles.length > 0 ? soldVehicles.reduce((sum3, v) => sum3 + (v.daysInStock || 0), 0) / soldVehicles.length : 0;
  return {
    period: `${months} months`,
    soldCount,
    avgInventory,
    turnRate: Math.round(turnRate * 100) / 100,
    avgTimeToSell: Math.round(avgTimeToSell)
  };
}

// src/routes/inventory.routes.ts
var inventoryRouter = Router21();
var inventoryFiltersSchema = z16.object({
  status: z16.array(z16.nativeEnum(VehicleStatus)).optional(),
  type: z16.array(z16.nativeEnum(VehicleType)).optional(),
  yearMin: z16.coerce.number().optional(),
  yearMax: z16.coerce.number().optional(),
  make: z16.array(z16.string()).optional(),
  model: z16.array(z16.string()).optional(),
  locationId: z16.string().optional(),
  priceMin: z16.coerce.number().optional(),
  priceMax: z16.coerce.number().optional(),
  daysInStockMin: z16.coerce.number().optional(),
  daysInStockMax: z16.coerce.number().optional(),
  search: z16.string().optional()
});
var createVehicleSchema = z16.object({
  stockNumber: z16.string().min(1),
  vin: z16.string().min(17).max(17),
  type: z16.nativeEnum(VehicleType),
  year: z16.number().int().min(1900).max(2100),
  make: z16.string().min(1),
  model: z16.string().min(1),
  trim: z16.string().optional(),
  bodyStyle: z16.string().optional(),
  exteriorColor: z16.string().optional(),
  interiorColor: z16.string().optional(),
  mileage: z16.number().int().min(0).optional(),
  engineType: z16.string().optional(),
  transmission: z16.string().optional(),
  drivetrain: z16.string().optional(),
  fuelType: z16.string(),
  condition: z16.string().optional(),
  costCents: z16.number().int().min(0).optional(),
  msrpCents: z16.number().int().min(0).optional(),
  priceCents: z16.number().int().min(0).optional(),
  minPriceCents: z16.number().int().min(0).optional(),
  locationId: z16.string().optional(),
  acquiredFrom: z16.string().optional(),
  acquiredDate: z16.string().datetime().optional(),
  features: z16.array(z16.string()).optional(),
  images: z16.array(z16.string()).optional(),
  primaryImageUrl: z16.string().optional(),
  certifiedPreOwned: z16.boolean().optional(),
  notes: z16.string().optional()
});
var updateVehicleSchema = z16.object({
  stockNumber: z16.string().min(1).optional(),
  status: z16.nativeEnum(VehicleStatus).optional(),
  mileage: z16.number().int().min(0).optional(),
  condition: z16.string().optional(),
  costCents: z16.number().int().min(0).optional(),
  msrpCents: z16.number().int().min(0).optional(),
  priceCents: z16.number().int().min(0).optional(),
  minPriceCents: z16.number().int().min(0).optional(),
  locationId: z16.string().optional(),
  exteriorColor: z16.string().optional(),
  interiorColor: z16.string().optional(),
  features: z16.array(z16.string()).optional(),
  images: z16.array(z16.string()).optional(),
  primaryImageUrl: z16.string().optional(),
  certifiedPreOwned: z16.boolean().optional(),
  notes: z16.string().optional(),
  reconEstimate: z16.number().optional(),
  reconActual: z16.number().optional(),
  reconCompletedAt: z16.string().datetime().optional(),
  agingBucket: z16.string().optional()
});
var updateStatusSchema = z16.object({
  status: z16.nativeEnum(VehicleStatus),
  notes: z16.string().optional()
});
var updatePriceSchema = z16.object({
  priceCents: z16.number().int().min(0),
  minPriceCents: z16.number().int().min(0).optional(),
  pricingNotes: z16.string().optional()
});
inventoryRouter.get(
  "/",
  async (req, res, next) => {
    try {
      const validation = inventoryFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid filters",
          details: validation.error.errors
        });
      }
      const filters = validation.data;
      const tenantId = req.tenantId;
      const vehicles = await getInventory({
        tenantId,
        status: filters.status,
        type: filters.type,
        year: {
          min: filters.yearMin,
          max: filters.yearMax
        },
        make: filters.make,
        model: filters.model,
        locationId: filters.locationId,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        daysInStockMin: filters.daysInStockMin,
        daysInStockMax: filters.daysInStockMax,
        search: filters.search
      });
      res.json({ data: vehicles });
    } catch (error) {
      console.error("Inventory fetch error:", error);
      next(error);
    }
  }
);
inventoryRouter.get(
  "/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const vehicle = await getVehicleById(id, tenantId);
      res.json({ data: vehicle });
    } catch (error) {
      console.error("Vehicle fetch error:", error);
      if (error.message === "Vehicle not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
inventoryRouter.post(
  "/",
  async (req, res, next) => {
    try {
      const validation = createVehicleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const vehicleData = validation.data;
      const vehicle = await createVehicle({
        tenantId,
        ...vehicleData,
        acquiredDate: vehicleData.acquiredDate ? new Date(vehicleData.acquiredDate) : void 0
      });
      res.status(201).json({ data: vehicle });
    } catch (error) {
      console.error("Vehicle creation error:", error);
      if (error.message === "Vehicle with this VIN already exists") {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }
);
inventoryRouter.put(
  "/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updateVehicleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const userId = req.userId;
      const updates = validation.data;
      const processedUpdates = {
        ...updates,
        reconCompletedAt: updates.reconCompletedAt ? new Date(updates.reconCompletedAt) : void 0
      };
      const vehicle = await updateVehicle(id, tenantId, userId, processedUpdates);
      res.json({ data: vehicle });
    } catch (error) {
      console.error("Vehicle update error:", error);
      if (error.message === "Vehicle not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
inventoryRouter.delete(
  "/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const userId = req.userId;
      await deleteVehicle(id, tenantId, userId);
      res.json({
        data: {
          success: true,
          message: "Vehicle deleted successfully"
        }
      });
    } catch (error) {
      console.error("Vehicle deletion error:", error);
      if (error.message === "Vehicle not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
inventoryRouter.patch(
  "/:id/status",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updateStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const userId = req.userId;
      const { status: status2, notes } = validation.data;
      const vehicle = await updateVehicleStatus(id, tenantId, userId, status2, notes);
      res.json({ data: vehicle });
    } catch (error) {
      console.error("Status update error:", error);
      if (error.message === "Vehicle not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
inventoryRouter.patch(
  "/:id/price",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updatePriceSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const userId = req.userId;
      const priceUpdate = validation.data;
      const vehicle = await updateVehiclePrice(id, tenantId, {
        ...priceUpdate,
        userId
      });
      res.json({ data: vehicle });
    } catch (error) {
      console.error("Price update error:", error);
      if (error.message === "Vehicle not found" || error.message === "Unauthorized") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
inventoryRouter.get(
  "/metrics/overview",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const metrics = await getInventoryMetrics(tenantId);
      res.json({ data: metrics });
    } catch (error) {
      console.error("Inventory metrics error:", error);
      next(error);
    }
  }
);
inventoryRouter.get(
  "/metrics/aging",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const agingAnalysis = await getAgingAnalysis(tenantId);
      res.json({ data: agingAnalysis });
    } catch (error) {
      console.error("Aging analysis error:", error);
      next(error);
    }
  }
);
inventoryRouter.get(
  "/metrics/turn-rate",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const months = req.query.months ? parseInt(req.query.months) : 12;
      const turnRateMetrics = await getTurnRateMetrics(tenantId, months);
      res.json({ data: turnRateMetrics });
    } catch (error) {
      console.error("Turn rate metrics error:", error);
      next(error);
    }
  }
);

// src/routes/pricing-intelligence.routes.ts
import { Router as Router22 } from "express";
import { z as z17 } from "zod";

// src/services/pricing-intelligence.service.ts
import { db as db9 } from "@repo/db";
import axios2 from "axios";
var ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
async function getAIPricingRecommendation(vehicleId, tenantId) {
  const vehicle = await db9.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      priceHistory: {
        orderBy: { changedAt: "desc" },
        take: 10
      },
      marketComps: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
            // Last 7 days
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error("Vehicle not found");
  }
  const marketComps = await getMarketComps(vehicle);
  const mlResponse = await callMLPricingService({
    vin: vehicle.vin,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim || "",
    mileage: vehicle.mileage || 0,
    condition: vehicle.condition || "GOOD",
    currentPrice: vehicle.priceCents ? vehicle.priceCents / 100 : 0,
    costBasis: vehicle.costCents ? vehicle.costCents / 100 : 0,
    daysInStock: vehicle.daysInStock || 0,
    marketComps: marketComps.slice(0, 20),
    priceHistory: vehicle.priceHistory.map((ph) => ({
      price: ph.priceCents / 100,
      date: ph.changedAt.toISOString()
    }))
  });
  const competitiveIndex = calculateCompetitiveIndex(
    mlResponse.recommendedPrice,
    marketComps
  );
  const avgMarketPrice = marketComps.length > 0 ? marketComps.reduce((sum3, c) => sum3 + c.priceCents, 0) / marketComps.length / 100 : mlResponse.recommendedPrice;
  let marketPosition = "AT_MARKET";
  const currentPrice = vehicle.priceCents ? vehicle.priceCents / 100 : 0;
  if (currentPrice > avgMarketPrice * 1.05) marketPosition = "ABOVE_MARKET";
  else if (currentPrice < avgMarketPrice * 0.95) marketPosition = "BELOW_MARKET";
  await db9.activity.create({
    data: {
      tenantId,
      userId: tenantId,
      // System user
      type: "PRICING_RECOMMENDATION",
      entityType: "VEHICLE",
      entityId: vehicleId,
      description: `AI pricing recommendation: $${mlResponse.recommendedPrice.toFixed(0)} (${mlResponse.reason})`,
      metadata: {
        currentPrice,
        recommendedPrice: mlResponse.recommendedPrice,
        confidence: mlResponse.confidence,
        marketPosition
      }
    }
  });
  return {
    vehicleId,
    currentPrice,
    recommendedPrice: mlResponse.recommendedPrice,
    priceAdjustment: mlResponse.recommendedPrice - currentPrice,
    priceAdjustmentPercent: (mlResponse.recommendedPrice - currentPrice) / currentPrice * 100,
    confidence: mlResponse.confidence,
    reason: mlResponse.reason,
    marketPosition,
    daysToSell: mlResponse.daysToSell,
    probabilityOfSale30Days: mlResponse.probabilityOfSale30Days,
    competitiveIndex,
    recommendations: {
      aggressive: mlResponse.recommendedPrice * 0.95,
      market: mlResponse.recommendedPrice,
      premium: mlResponse.recommendedPrice * 1.05
    },
    marketData: {
      avgPrice: avgMarketPrice,
      medianPrice: calculateMedian2(marketComps.map((c) => c.priceCents / 100)),
      minPrice: Math.min(...marketComps.map((c) => c.priceCents / 100)),
      maxPrice: Math.max(...marketComps.map((c) => c.priceCents / 100)),
      totalComps: marketComps.length,
      avgDaysOnMarket: marketComps.reduce((sum3, c) => sum3 + (c.daysOnMarket || 0), 0) / marketComps.length
    }
  };
}
async function getMarketAnalysis(vehicleId, tenantId) {
  const vehicle = await db9.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      locationRef: true
    }
  });
  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error("Vehicle not found");
  }
  const localComps = await getMarketComps(vehicle, 50);
  const regionalComps = await getMarketComps(vehicle, 200);
  const localAvgPrice = calculateAverage2(localComps.map((c) => c.priceCents / 100));
  const regionalAvgPrice = calculateAverage2(regionalComps.map((c) => c.priceCents / 100));
  const localAvgDOM = calculateAverage2(localComps.map((c) => c.daysOnMarket || 0));
  const competitorPricing = localComps.slice(0, 10).map((comp) => ({
    competitorId: comp.id,
    competitorName: comp.dealerName || "Unknown Dealer",
    distance: comp.distance || 0,
    price: comp.priceCents / 100,
    mileage: comp.mileage || 0,
    daysOnMarket: comp.daysOnMarket || 0,
    listingUrl: comp.listingUrl
  }));
  const priceHistory = await db9.priceHistory.findMany({
    where: {
      vehicleId,
      changedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)
      }
    },
    orderBy: { changedAt: "asc" }
  });
  const priceDirection = determinePriceDirection(priceHistory);
  const demandScore = calculateDemandScore(vehicle, localComps);
  const seasonalFactor = getSeasonalFactor(vehicle.make, vehicle.bodyStyle);
  return {
    vehicleId,
    vin: vehicle.vin,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim || void 0,
    mileage: vehicle.mileage || void 0,
    localMarket: {
      avgPrice: localAvgPrice,
      medianPrice: calculateMedian2(localComps.map((c) => c.priceCents / 100)),
      inventory: localComps.length,
      avgDaysOnMarket: localAvgDOM,
      demandScore
    },
    regionalMarket: {
      avgPrice: regionalAvgPrice,
      medianPrice: calculateMedian2(regionalComps.map((c) => c.priceCents / 100)),
      inventory: regionalComps.length,
      avgDaysOnMarket: calculateAverage2(regionalComps.map((c) => c.daysOnMarket || 0))
    },
    nationalMarket: {
      avgPrice: regionalAvgPrice * 1.02,
      // Approximate
      medianPrice: calculateMedian2(regionalComps.map((c) => c.priceCents / 100)),
      avgDaysOnMarket: localAvgDOM * 1.1
    },
    competitorPricing,
    trendAnalysis: {
      priceDirection,
      demandTrend: demandScore > 70 ? "HIGH" : demandScore > 40 ? "MODERATE" : "LOW",
      seasonalFactor,
      marketVelocity: localAvgDOM < 20 ? "FAST" : localAvgDOM < 40 ? "AVERAGE" : "SLOW"
    }
  };
}
async function getAppraisalValuation(input, tenantId) {
  const mlResponse = await axios2.post(`${ML_SERVICE_URL}/api/appraisal/valuate`, {
    vin: input.vin,
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim,
    mileage: input.mileage,
    condition: input.condition,
    zipCode: input.zipCode
  });
  const valuation = mlResponse.data;
  const adjustments = [];
  const avgMileageForYear = ((/* @__PURE__ */ new Date()).getFullYear() - input.year) * 12e3;
  if (input.mileage < avgMileageForYear * 0.7) {
    adjustments.push({
      factor: "Low Mileage",
      impact: 500,
      reason: "Below average mileage increases value"
    });
  } else if (input.mileage > avgMileageForYear * 1.3) {
    adjustments.push({
      factor: "High Mileage",
      impact: -800,
      reason: "Above average mileage decreases value"
    });
  }
  const conditionImpact = {
    EXCELLENT: 1e3,
    GOOD: 0,
    FAIR: -1500,
    POOR: -3e3
  };
  if (input.condition !== "GOOD") {
    adjustments.push({
      factor: `${input.condition} Condition`,
      impact: conditionImpact[input.condition],
      reason: `Vehicle condition affects resale value`
    });
  }
  return {
    vin: input.vin,
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim,
    mileage: input.mileage,
    condition: input.condition,
    valuation: {
      retail: valuation.retail || valuation.tradeIn * 1.3,
      wholesale: valuation.wholesale || valuation.tradeIn * 0.85,
      tradeIn: valuation.tradeIn,
      privateParty: valuation.privateParty || valuation.tradeIn * 1.15
    },
    adjustments,
    confidenceScore: valuation.confidence || 85,
    dataAge: "2 hours ago",
    sources: ["Black Book", "Manheim Market Report", "Local Market Data"]
  };
}
async function getBatchPricingRecommendations(tenantId, filters) {
  const where = {
    tenantId,
    deletedAt: null,
    status: filters?.status ? { in: filters.status } : { in: ["AVAILABLE", "IN_STOCK"] }
  };
  if (filters?.daysInStockMin) {
    where.daysInStock = { gte: filters.daysInStockMin };
  }
  const vehicles = await db9.vehicle.findMany({
    where,
    take: 100,
    // Process 100 at a time
    orderBy: { daysInStock: "desc" }
  });
  const recommendations = await Promise.all(
    vehicles.map((v) => getAIPricingRecommendation(v.id, tenantId).catch((err) => null))
  );
  return recommendations.filter((r) => r !== null);
}
async function getMarketComps(vehicle, radiusMiles = 100) {
  return await db9.marketComp.findMany({
    where: {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      distance: { lte: radiusMiles },
      createdAt: {
        gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3)
        // Last 14 days
      }
    },
    orderBy: { distance: "asc" },
    take: 50
  });
}
async function callMLPricingService(data) {
  try {
    const response = await axios2.post(`${ML_SERVICE_URL}/api/pricing/recommend`, data, {
      timeout: 5e3
    });
    return response.data;
  } catch (error) {
    return {
      recommendedPrice: data.currentPrice || data.costBasis * 1.15,
      confidence: 0.6,
      reason: "ML service unavailable, using cost-plus pricing",
      daysToSell: 45,
      probabilityOfSale30Days: 0.5
    };
  }
}
function calculateCompetitiveIndex(price, comps) {
  if (comps.length === 0) return 50;
  const avgPrice = comps.reduce((sum3, c) => sum3 + c.priceCents / 100, 0) / comps.length;
  const percentDiff = (price - avgPrice) / avgPrice * 100;
  return Math.max(0, Math.min(100, 50 - percentDiff));
}
function calculateAverage2(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum3, n) => sum3 + n, 0) / numbers.length;
}
function calculateMedian2(numbers) {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
function determinePriceDirection(priceHistory) {
  if (priceHistory.length < 2) return "STABLE";
  const first = priceHistory[0].priceCents;
  const last = priceHistory[priceHistory.length - 1].priceCents;
  const change = (last - first) / first * 100;
  if (change > 2) return "INCREASING";
  if (change < -2) return "DECREASING";
  return "STABLE";
}
function calculateDemandScore(vehicle, comps) {
  const avgDOM = comps.length > 0 ? comps.reduce((sum3, c) => sum3 + (c.daysOnMarket || 0), 0) / comps.length : 45;
  const vehicleDays = vehicle.daysInStock || 0;
  if (vehicleDays < avgDOM * 0.5) return 95;
  if (vehicleDays < avgDOM * 0.75) return 80;
  if (vehicleDays < avgDOM) return 65;
  if (vehicleDays < avgDOM * 1.5) return 45;
  return 25;
}
function getSeasonalFactor(make, bodyStyle) {
  const month = (/* @__PURE__ */ new Date()).getMonth();
  if (bodyStyle?.toLowerCase().includes("convertible")) {
    return month >= 3 && month <= 8 ? 1.15 : 0.85;
  }
  if (bodyStyle?.toLowerCase().includes("truck") || bodyStyle?.toLowerCase().includes("suv")) {
    return month >= 9 || month <= 2 ? 1.1 : 0.95;
  }
  return 1;
}

// src/routes/pricing-intelligence.routes.ts
var pricingIntelligenceRouter = Router22();
var appraisalInputSchema = z17.object({
  vin: z17.string().min(17).max(17),
  year: z17.number().int().min(1900).max(2100),
  make: z17.string().min(1),
  model: z17.string().min(1),
  trim: z17.string().optional(),
  mileage: z17.number().int().min(0),
  condition: z17.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  zipCode: z17.string().optional()
});
var batchPricingFiltersSchema = z17.object({
  daysInStockMin: z17.coerce.number().optional(),
  status: z17.array(z17.string()).optional()
});
pricingIntelligenceRouter.get(
  "/vehicles/:id/recommendation",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const recommendation = await getAIPricingRecommendation(id, tenantId);
      res.json({ data: recommendation });
    } catch (error) {
      console.error("Pricing recommendation error:", error);
      if (error.message === "Vehicle not found") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
pricingIntelligenceRouter.get(
  "/vehicles/:id/market-analysis",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const analysis = await getMarketAnalysis(id, tenantId);
      res.json({ data: analysis });
    } catch (error) {
      console.error("Market analysis error:", error);
      if (error.message === "Vehicle not found") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
pricingIntelligenceRouter.post(
  "/appraisal",
  async (req, res, next) => {
    try {
      const validation = appraisalInputSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const appraisalInput = validation.data;
      const valuation = await getAppraisalValuation(appraisalInput, tenantId);
      res.json({ data: valuation });
    } catch (error) {
      console.error("Appraisal error:", error);
      next(error);
    }
  }
);
pricingIntelligenceRouter.get(
  "/batch-recommendations",
  async (req, res, next) => {
    try {
      const validation = batchPricingFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid filters",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const filters = validation.data;
      const recommendations = await getBatchPricingRecommendations(tenantId, filters);
      res.json({
        data: recommendations,
        meta: {
          total: recommendations.length,
          needsAttention: recommendations.filter((r) => r.marketPosition === "ABOVE_MARKET").length,
          opportunities: recommendations.filter((r) => r.marketPosition === "BELOW_MARKET").length
        }
      });
    } catch (error) {
      console.error("Batch pricing recommendations error:", error);
      next(error);
    }
  }
);

// src/routes/merchandising.routes.ts
import { Router as Router23 } from "express";

// src/services/merchandising.service.ts
import { db as db10 } from "@repo/db";
import axios3 from "axios";
var ML_SERVICE_URL2 = process.env.ML_SERVICE_URL || "http://localhost:8000";
async function generateMerchandisingContent(vehicleId, tenantId) {
  const vehicle = await db10.vehicle.findUnique({
    where: { id: vehicleId }
  });
  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error("Vehicle not found");
  }
  const mlResponse = await axios3.post(`${ML_SERVICE_URL2}/api/merchandising/generate`, {
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    mileage: vehicle.mileage,
    condition: vehicle.condition,
    features: vehicle.features,
    bodyStyle: vehicle.bodyStyle,
    exteriorColor: vehicle.exteriorColor,
    interiorColor: vehicle.interiorColor,
    engineType: vehicle.engineType,
    transmission: vehicle.transmission,
    drivetrain: vehicle.drivetrain
  }).catch(() => ({
    data: generateFallbackContent(vehicle)
  }));
  const content = mlResponse.data;
  await db10.vehicle.update({
    where: { id: vehicleId },
    data: {
      notes: content.description.fullDescription,
      features: content.features.standard.concat(
        content.features.premium,
        content.features.safety,
        content.features.technology
      )
    }
  });
  await db10.activity.create({
    data: {
      tenantId,
      userId: tenantId,
      type: "CONTENT_GENERATED",
      entityType: "VEHICLE",
      entityId: vehicleId,
      description: "AI-generated merchandising content",
      metadata: {
        wordCount: content.description.fullDescription.split(" ").length,
        featureCount: Object.values(content.features).flat().length
      }
    }
  });
  return {
    vehicleId,
    description: content.description,
    features: content.features,
    seoData: content.seoData,
    socialMedia: content.socialMedia,
    generatedAt: /* @__PURE__ */ new Date(),
    confidence: content.confidence || 0.85
  };
}
async function calculateRetailReadiness(vehicleId, tenantId) {
  const vehicle = await db10.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      priceHistory: true,
      reconItems: true
    }
  });
  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error("Vehicle not found");
  }
  const photoScore = assessPhotos(vehicle);
  const pricingScore = assessPricing(vehicle);
  const descriptionScore = assessDescription(vehicle);
  const reconScore = assessRecon(vehicle);
  const documentationScore = assessDocumentation(vehicle);
  const overallScore = Math.round(
    photoScore.score * 0.3 + pricingScore.score * 0.25 + descriptionScore.score * 0.2 + reconScore.score * 0.15 + documentationScore.score * 0.1
  );
  const recommendations = generateRecommendations(
    photoScore,
    pricingScore,
    descriptionScore,
    reconScore,
    documentationScore
  );
  const estimatedImpact = {
    potentialViews: Math.round((100 - overallScore) * 10),
    // More views with better score
    potentialLeads: Math.round((100 - overallScore) * 0.5),
    pricingOpportunity: overallScore < 70 ? 0 : Math.round((overallScore - 70) * 50)
  };
  return {
    vehicleId,
    overallScore,
    breakdown: {
      photos: photoScore,
      pricing: pricingScore,
      description: descriptionScore,
      recon: reconScore,
      documentation: documentationScore
    },
    recommendations,
    estimatedImpact
  };
}
async function getVDPAnalytics(vehicleId, tenantId, periodDays = 30) {
  const vehicle = await db10.vehicle.findUnique({
    where: { id: vehicleId }
  });
  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error("Vehicle not found");
  }
  const mockData = generateMockVDPAnalytics(vehicle, periodDays);
  return mockData;
}
async function getBatchRetailReadiness(tenantId) {
  const vehicles = await db10.vehicle.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: { in: ["AVAILABLE", "IN_STOCK"] }
    },
    include: {
      priceHistory: true,
      reconItems: true
    },
    take: 100
  });
  return vehicles.map((vehicle) => {
    const photoScore = assessPhotos(vehicle);
    const pricingScore = assessPricing(vehicle);
    const descriptionScore = assessDescription(vehicle);
    const reconScore = assessRecon(vehicle);
    const documentationScore = assessDocumentation(vehicle);
    const overallScore = Math.round(
      photoScore.score * 0.3 + pricingScore.score * 0.25 + descriptionScore.score * 0.2 + reconScore.score * 0.15 + documentationScore.score * 0.1
    );
    const criticalIssues = [
      ...photoScore.issues.filter(() => photoScore.status === "CRITICAL"),
      ...pricingScore.issues.filter(() => pricingScore.status === "CRITICAL"),
      ...reconScore.issues.filter(() => reconScore.status === "CRITICAL")
    ];
    return {
      vehicleId: vehicle.id,
      score: overallScore,
      criticalIssues
    };
  });
}
function assessPhotos(vehicle) {
  const photoCount = vehicle.imageUrls?.length || 0;
  const hasInterior = vehicle.imageUrls?.some((url) => url.includes("interior")) || false;
  const hasExterior = vehicle.imageUrls?.some((url) => url.includes("exterior")) || false;
  const has360 = vehicle.imageUrls?.some((url) => url.includes("360")) || false;
  const issues = [];
  let score = 0;
  if (photoCount === 0) {
    issues.push("No photos uploaded");
    return { score: 0, status: "CRITICAL", issues, photoCount, has360, hasInterior, hasExterior };
  }
  if (photoCount < 10) issues.push("Need at least 10 photos");
  else if (photoCount < 20) score += 30;
  else score += 50;
  if (!hasExterior) issues.push("Missing exterior photos");
  else score += 20;
  if (!hasInterior) issues.push("Missing interior photos");
  else score += 20;
  if (has360) score += 10;
  else issues.push("Consider adding 360\xB0 view");
  const status2 = score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : score >= 40 ? "NEEDS_WORK" : "CRITICAL";
  return { score, status: status2, issues, photoCount, has360, hasInterior, hasExterior };
}
function assessPricing(vehicle) {
  const issues = [];
  let score = 50;
  const hasPrice = vehicle.priceCents && vehicle.priceCents > 0;
  if (!hasPrice) {
    issues.push("No price set");
    return { score: 0, status: "CRITICAL", issues, marketPosition: "UNKNOWN", daysWithoutPriceChange: 0 };
  }
  score += 20;
  const daysWithoutPriceChange = vehicle.lastPriceChangeDate ? Math.floor((Date.now() - vehicle.lastPriceChangeDate.getTime()) / (1e3 * 60 * 60 * 24)) : vehicle.daysInStock || 0;
  if (daysWithoutPriceChange > 30 && vehicle.daysInStock > 30) {
    issues.push("Price not adjusted in 30+ days");
    score -= 10;
  } else {
    score += 15;
  }
  if (vehicle.daysInStock > 60) {
    issues.push("Consider price reduction for aging inventory");
    score -= 10;
  } else {
    score += 15;
  }
  const status2 = score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : score >= 40 ? "NEEDS_WORK" : "CRITICAL";
  const marketPosition = score >= 70 ? "COMPETITIVE" : "NEEDS_REVIEW";
  return { score, status: status2, issues, marketPosition, daysWithoutPriceChange };
}
function assessDescription(vehicle) {
  const issues = [];
  let score = 0;
  const description = vehicle.notes || "";
  const wordCount = description.split(" ").length;
  const hasKeyFeatures = (vehicle.features?.length || 0) > 5;
  if (wordCount === 0) {
    issues.push("No description provided");
    return { score: 0, status: "CRITICAL", issues, wordCount, hasKeyFeatures };
  }
  if (wordCount < 50) {
    issues.push("Description too short (min 50 words)");
    score += 20;
  } else if (wordCount < 100) {
    score += 50;
  } else {
    score += 70;
  }
  if (!hasKeyFeatures) {
    issues.push("Add key features and highlights");
    score -= 10;
  } else {
    score += 30;
  }
  const status2 = score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : score >= 40 ? "NEEDS_WORK" : "CRITICAL";
  return { score, status: status2, issues, wordCount, hasKeyFeatures };
}
function assessRecon(vehicle) {
  const issues = [];
  let score = 50;
  const hasReconItems = vehicle.reconItems && vehicle.reconItems.length > 0;
  const isComplete = vehicle.reconCompletedAt !== null;
  const inRecon = vehicle.status === "RECON";
  if (inRecon) {
    const daysInRecon2 = vehicle.daysInStock || 0;
    if (daysInRecon2 > 14) {
      issues.push("Recon taking too long (14+ days)");
      score -= 20;
    }
  }
  if (isComplete) {
    score += 50;
  } else if (!inRecon) {
    score += 30;
  } else {
    issues.push("Recon not complete");
  }
  const status2 = score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : score >= 40 ? "NEEDS_WORK" : "CRITICAL";
  const daysInRecon = inRecon ? vehicle.daysInStock || 0 : 0;
  return { score, status: status2, issues, isComplete, daysInRecon };
}
function assessDocumentation(vehicle) {
  const issues = [];
  let score = 40;
  const hasCarfax = vehicle.hasCarfax || false;
  const hasAutocheck = vehicle.hasAutocheck || false;
  const hasCertification = vehicle.certifiedPreOwned || false;
  if (hasCarfax) score += 25;
  else issues.push("Add Carfax report");
  if (hasAutocheck) score += 15;
  else issues.push("Consider adding AutoCheck report");
  if (hasCertification) score += 20;
  const status2 = score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : score >= 40 ? "NEEDS_WORK" : "CRITICAL";
  return { score, status: status2, issues, hasCarfax, hasAutocheck, hasCertification };
}
function generateRecommendations(photoScore, pricingScore, descriptionScore, reconScore, documentationScore) {
  const recommendations = [];
  if (photoScore.score < 60) {
    recommendations.push({
      priority: "HIGH",
      action: "Add professional photos (minimum 15 photos with interior and exterior)",
      impact: "Increase views by 40-60%"
    });
  }
  if (pricingScore.score < 60) {
    recommendations.push({
      priority: "HIGH",
      action: "Review and adjust pricing based on market data",
      impact: "Improve time-to-sale by 25%"
    });
  }
  if (descriptionScore.score < 60) {
    recommendations.push({
      priority: "MEDIUM",
      action: "Generate AI-powered description with key features",
      impact: "Increase engagement by 15-20%"
    });
  }
  if (reconScore.score < 60) {
    recommendations.push({
      priority: "HIGH",
      action: "Complete recon and move to retail status",
      impact: "Make vehicle saleable immediately"
    });
  }
  if (documentationScore.score < 60) {
    recommendations.push({
      priority: "MEDIUM",
      action: "Add vehicle history report (Carfax/AutoCheck)",
      impact: "Increase buyer confidence and leads by 10-15%"
    });
  }
  return recommendations;
}
function generateFallbackContent(vehicle) {
  const year = vehicle.year;
  const make = vehicle.make;
  const model = vehicle.model;
  const trim = vehicle.trim || "";
  const headline = `${year} ${make} ${model} ${trim}`.trim();
  const summary = `Experience the perfect blend of performance and reliability with this ${year} ${make} ${model}. This vehicle offers exceptional value and comes ready to drive.`;
  const fullDescription = `Discover this outstanding ${year} ${make} ${model} ${trim}. This vehicle combines style, comfort, and performance in one impressive package. With ${vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : "low mileage"}, this ${make} ${model} is in ${vehicle.condition?.toLowerCase() || "excellent"} condition and ready for its next owner. Don't miss this opportunity to own a quality vehicle at a great price.`;
  return {
    description: {
      headline,
      summary,
      fullDescription,
      sellingPoints: [
        `${year} ${make} ${model}`,
        vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : "Low mileage",
        vehicle.condition ? `${vehicle.condition} condition` : "Great condition",
        "Well maintained",
        "Ready to drive"
      ],
      keywords: [make.toLowerCase(), model.toLowerCase(), year.toString(), "used car", "for sale"]
    },
    features: {
      standard: vehicle.features || [],
      premium: [],
      safety: [],
      technology: [],
      comfort: []
    },
    seoData: {
      metaTitle: `${year} ${make} ${model} ${trim} For Sale`.trim(),
      metaDescription: summary,
      slug: `${year}-${make}-${model}-${vehicle.vin.slice(-6)}`.toLowerCase().replace(/\s+/g, "-"),
      keywords: [make, model, year.toString(), "car", "sale"]
    },
    socialMedia: {
      facebookPost: `\u{1F697} ${headline}

${summary}

Contact us today for more information!`,
      instagramCaption: `${headline} \u2728

${summary}

#${make} #${model} #UsedCars #CarSales`,
      twitterPost: `\u{1F697} ${headline} - ${summary}`
    },
    confidence: 0.6
  };
}
function generateMockVDPAnalytics(vehicle, periodDays) {
  const baseViews = 100 + Math.floor(Math.random() * 400);
  const uniqueViews = Math.floor(baseViews * 0.7);
  const leads = Math.floor(uniqueViews * 0.05);
  return {
    vehicleId: vehicle.id,
    period: `Last ${periodDays} days`,
    metrics: {
      views: baseViews,
      uniqueViews,
      avgTimeOnPage: 45 + Math.floor(Math.random() * 60),
      bounceRate: 35 + Math.floor(Math.random() * 30),
      leads,
      conversationRate: leads / baseViews,
      photoViews: baseViews * 5,
      videoPlays: Math.floor(baseViews * 0.3),
      saveCount: Math.floor(uniqueViews * 0.08),
      shareCount: Math.floor(uniqueViews * 0.02),
      printCount: Math.floor(uniqueViews * 0.01)
    },
    traffic: {
      sources: [
        { source: "Cars.com", views: Math.floor(baseViews * 0.35), leads: Math.floor(leads * 0.4) },
        { source: "AutoTrader", views: Math.floor(baseViews * 0.25), leads: Math.floor(leads * 0.3) },
        { source: "Direct", views: Math.floor(baseViews * 0.2), leads: Math.floor(leads * 0.2) },
        { source: "Google", views: Math.floor(baseViews * 0.15), leads: Math.floor(leads * 0.1) },
        { source: "Facebook", views: Math.floor(baseViews * 0.05), leads: 0 }
      ],
      devices: {
        desktop: Math.floor(baseViews * 0.35),
        mobile: Math.floor(baseViews * 0.55),
        tablet: Math.floor(baseViews * 0.1)
      }
    },
    engagement: {
      photoEngagement: 0.75,
      videoEngagement: 0.3,
      avgPhotosViewed: 5.2,
      ctaClicks: {
        contactDealer: Math.floor(baseViews * 0.08),
        scheduleTestDrive: Math.floor(baseViews * 0.03),
        getFinancing: Math.floor(baseViews * 0.02),
        viewCarfax: Math.floor(baseViews * 0.12)
      }
    },
    comparison: {
      vsAverage: {
        views: Math.floor(Math.random() * 40) - 20,
        leads: Math.floor(Math.random() * 50) - 25,
        conversionRate: Math.floor(Math.random() * 30) - 15
      },
      ranking: Math.floor(Math.random() * 50) + 1
    }
  };
}

// src/routes/merchandising.routes.ts
var merchandisingRouter = Router23();
merchandisingRouter.post(
  "/vehicles/:id/generate-content",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const content = await generateMerchandisingContent(id, tenantId);
      res.json({ data: content });
    } catch (error) {
      console.error("Content generation error:", error);
      if (error.message === "Vehicle not found") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
merchandisingRouter.get(
  "/vehicles/:id/retail-readiness",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const readiness = await calculateRetailReadiness(id, tenantId);
      res.json({ data: readiness });
    } catch (error) {
      console.error("Retail readiness error:", error);
      if (error.message === "Vehicle not found") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
merchandisingRouter.get(
  "/vehicles/:id/vdp-analytics",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const periodDays = req.query.periodDays ? parseInt(req.query.periodDays) : 30;
      const analytics = await getVDPAnalytics(id, tenantId, periodDays);
      res.json({ data: analytics });
    } catch (error) {
      console.error("VDP analytics error:", error);
      if (error.message === "Vehicle not found") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
merchandisingRouter.get(
  "/batch-retail-readiness",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const readinessScores = await getBatchRetailReadiness(tenantId);
      const sorted = readinessScores.sort((a, b) => a.score - b.score);
      res.json({
        data: sorted,
        meta: {
          total: sorted.length,
          needsAttention: sorted.filter((v) => v.score < 60).length,
          critical: sorted.filter((v) => v.criticalIssues.length > 0).length,
          avgScore: Math.round(sorted.reduce((sum3, v) => sum3 + v.score, 0) / sorted.length)
        }
      });
    } catch (error) {
      console.error("Batch retail readiness error:", error);
      next(error);
    }
  }
);

// src/routes/appraisal.routes.ts
import { Router as Router24 } from "express";
import { z as z18 } from "zod";
import { AppraisalStatus, AppraisalConditionGrade } from "@prisma/client";

// src/services/appraisal.service.ts
import { db as db11 } from "@repo/db";
import axios4 from "axios";
var ML_SERVICE_URL3 = process.env.ML_SERVICE_URL || "http://localhost:8000";
var VIN_DECODER_API = process.env.VIN_DECODER_API || "https://vpic.nhtsa.dot.gov/api/vehicles";
async function decodeVIN2(vin) {
  try {
    const response = await axios4.get(`${VIN_DECODER_API}/DecodeVin/${vin}?format=json`, {
      timeout: 5e3
    });
    const data = response.data.Results;
    const year = parseInt(data.find((r) => r.Variable === "Model Year")?.Value || "0");
    const make = data.find((r) => r.Variable === "Make")?.Value || "";
    const model = data.find((r) => r.Variable === "Model")?.Value || "";
    const trim = data.find((r) => r.Variable === "Trim")?.Value || null;
    const bodyStyle = data.find((r) => r.Variable === "Body Class")?.Value || null;
    const engineType = data.find((r) => r.Variable === "Engine Configuration")?.Value || null;
    const transmission = data.find((r) => r.Variable === "Transmission Style")?.Value || null;
    const drivetrain = data.find((r) => r.Variable === "Drive Type")?.Value || null;
    const fuelType = data.find((r) => r.Variable === "Fuel Type - Primary")?.Value || null;
    const doors = parseInt(data.find((r) => r.Variable === "Doors")?.Value || "0");
    const valid = year > 0 && make && model;
    return {
      vin,
      year,
      make,
      model,
      trim: trim || void 0,
      bodyStyle: bodyStyle || void 0,
      engineType: engineType || void 0,
      transmission: transmission || void 0,
      drivetrain: drivetrain || void 0,
      fuelType: fuelType || void 0,
      doors: doors || void 0,
      valid
    };
  } catch (error) {
    console.error("VIN decode error:", error);
    return {
      vin,
      year: 0,
      make: "",
      model: "",
      valid: false,
      errorMessage: "Failed to decode VIN"
    };
  }
}
async function createAppraisal(input) {
  let vehicleInfo = {
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim
  };
  if (!input.year || !input.make || !input.model) {
    const decoded = await decodeVIN2(input.vin);
    if (decoded.valid) {
      vehicleInfo = {
        year: decoded.year,
        make: decoded.make,
        model: decoded.model,
        trim: decoded.trim || input.trim
      };
    }
  }
  const valuation = await getAppraisalValuation(
    {
      vin: input.vin,
      year: vehicleInfo.year,
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      trim: vehicleInfo.trim,
      mileage: input.mileage,
      condition: mapConditionGradeToValuation(input.conditionGrade || "AVERAGE")
    },
    input.tenantId
  );
  const reconEstimate = await estimateReconCosts(
    {
      year: vehicleInfo.year,
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      mileage: input.mileage,
      conditionGrade: input.conditionGrade || "AVERAGE",
      warningLights: input.warningLights || []
    },
    input.tenantId
  );
  const conditionScore = calculateConditionScore(
    input.conditionGrade || "AVERAGE",
    input.mileage,
    vehicleInfo.year,
    input.warningLights?.length || 0
  );
  const expiresAt = /* @__PURE__ */ new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  const appraisal = await db11.appraisal.create({
    data: {
      tenantId: input.tenantId,
      appraiserId: input.appraiserId,
      vin: input.vin,
      year: vehicleInfo.year,
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      trim: vehicleInfo.trim,
      mileage: input.mileage,
      exteriorColor: input.exteriorColor,
      interiorColor: input.interiorColor,
      conditionGrade: input.conditionGrade || "AVERAGE",
      conditionScore,
      conditionNotes: input.conditionNotes,
      warningLights: input.warningLights || [],
      photos: input.photos || [],
      estimatedValue: valuation.valuation.tradeIn,
      marketValue: valuation.valuation.retail,
      aiSuggestedValue: valuation.valuation.tradeIn * 0.95,
      // Offer slightly less than trade-in value
      reconEstimate,
      status: "DRAFT",
      expiresAt,
      notes: input.notes
    },
    include: {
      appraiser: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
  if (input.customerId) {
    await db11.customer.update({
      where: { id: input.customerId },
      data: {
        // Could add appraisal reference
      }
    });
  }
  if (input.leadId) {
    await db11.lead.update({
      where: { id: input.leadId },
      data: {
        // Could add appraisal reference
      }
    });
  }
  await db11.activity.create({
    data: {
      tenantId: input.tenantId,
      userId: input.appraiserId,
      type: "APPRAISAL_CREATED",
      entityType: "APPRAISAL",
      entityId: appraisal.id,
      description: `Created appraisal for ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} (VIN: ${input.vin})`,
      metadata: {
        vin: input.vin,
        year: vehicleInfo.year,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        mileage: input.mileage,
        estimatedValue: valuation.valuation.tradeIn
      }
    }
  });
  return appraisal;
}
async function getAppraisalById(id, tenantId) {
  const appraisal = await db11.appraisal.findUnique({
    where: { id },
    include: {
      appraiser: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      reconItems: true
    }
  });
  if (!appraisal || appraisal.tenantId !== tenantId) {
    throw new Error("Appraisal not found");
  }
  const marketData = await getMarketDataForAppraisal(appraisal);
  const reconCost = appraisal.reconEstimate?.totalCost || 0;
  const acv = parseFloat(appraisal.estimatedValue?.toString() || "0") + reconCost;
  const projectedRetail = parseFloat(appraisal.marketValue?.toString() || "0");
  const estimatedProfit = projectedRetail - acv;
  const profitMargin = projectedRetail > 0 ? estimatedProfit / projectedRetail * 100 : 0;
  return {
    id: appraisal.id,
    vin: appraisal.vin,
    year: appraisal.year,
    make: appraisal.make,
    model: appraisal.model,
    trim: appraisal.trim || void 0,
    mileage: appraisal.mileage,
    conditionGrade: appraisal.conditionGrade,
    conditionScore: appraisal.conditionScore || void 0,
    photos: appraisal.photos,
    status: appraisal.status,
    valuations: {
      retail: parseFloat(appraisal.marketValue?.toString() || "0"),
      wholesale: parseFloat(appraisal.estimatedValue?.toString() || "0") * 0.85,
      tradeIn: parseFloat(appraisal.estimatedValue?.toString() || "0"),
      privateParty: parseFloat(appraisal.estimatedValue?.toString() || "0") * 1.15,
      aiSuggested: parseFloat(appraisal.aiSuggestedValue?.toString() || "0"),
      offerAmount: parseFloat(appraisal.aiSuggestedValue?.toString() || "0")
    },
    reconEstimate: appraisal.reconEstimate || { items: [], totalCost: 0 },
    profitAnalysis: {
      acv,
      projectedRetail,
      estimatedProfit,
      profitMargin,
      daysToTurn: marketData.avgDaysOnMarket,
      roi: acv > 0 ? estimatedProfit / acv * 100 : 0
    },
    marketData,
    appraiser: {
      id: appraisal.appraiser.id,
      name: `${appraisal.appraiser.firstName} ${appraisal.appraiser.lastName}`
    },
    manager: appraisal.manager ? {
      id: appraisal.manager.id,
      name: `${appraisal.manager.firstName} ${appraisal.manager.lastName}`
    } : void 0,
    createdAt: appraisal.createdAt,
    updatedAt: appraisal.updatedAt,
    expiresAt: appraisal.expiresAt || void 0
  };
}
async function updateAppraisal(id, tenantId, userId, updates) {
  const existing = await db11.appraisal.findUnique({
    where: { id },
    select: { tenantId: true, status: true }
  });
  if (!existing || existing.tenantId !== tenantId) {
    throw new Error("Appraisal not found");
  }
  if (existing.status === "APPROVED" || existing.status === "REJECTED") {
    throw new Error("Cannot update approved or rejected appraisal");
  }
  let conditionScore = updates.conditionScore;
  if (updates.conditionGrade || updates.mileage) {
    conditionScore = calculateConditionScore(
      updates.conditionGrade || "AVERAGE",
      updates.mileage || 0,
      2020,
      // TODO: Get actual year
      updates.warningLights?.length || 0
    );
  }
  const appraisal = await db11.appraisal.update({
    where: { id },
    data: {
      ...updates,
      conditionScore,
      estimatedValue: updates.estimatedValue !== void 0 ? updates.estimatedValue : void 0
    }
  });
  await db11.activity.create({
    data: {
      tenantId,
      userId,
      type: "APPRAISAL_UPDATED",
      entityType: "APPRAISAL",
      entityId: id,
      description: "Updated appraisal details",
      metadata: updates
    }
  });
  return appraisal;
}
async function submitAppraisal(id, tenantId, userId) {
  const appraisal = await db11.appraisal.findUnique({
    where: { id },
    select: { tenantId: true, status: true }
  });
  if (!appraisal || appraisal.tenantId !== tenantId) {
    throw new Error("Appraisal not found");
  }
  if (appraisal.status !== "DRAFT") {
    throw new Error("Appraisal already submitted");
  }
  const updated = await db11.appraisal.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      submittedAt: /* @__PURE__ */ new Date()
    }
  });
  await db11.activity.create({
    data: {
      tenantId,
      userId,
      type: "APPRAISAL_SUBMITTED",
      entityType: "APPRAISAL",
      entityId: id,
      description: "Submitted appraisal for manager review"
    }
  });
  return updated;
}
async function processApprovalDecision(decision) {
  const appraisal = await db11.appraisal.findUnique({
    where: { id: decision.appraisalId }
  });
  if (!appraisal) {
    throw new Error("Appraisal not found");
  }
  if (appraisal.status !== "SUBMITTED" && appraisal.status !== "IN_REVIEW") {
    throw new Error("Appraisal not in reviewable state");
  }
  let expiresAt = appraisal.expiresAt;
  if (decision.approved && decision.expiresInHours) {
    expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setHours(expiresAt.getHours() + decision.expiresInHours);
  }
  const updated = await db11.appraisal.update({
    where: { id: decision.appraisalId },
    data: {
      status: decision.approved ? "APPROVED" : "REJECTED",
      managerId: decision.managerId,
      approvedAt: decision.approved ? /* @__PURE__ */ new Date() : null,
      rejectedAt: decision.approved ? null : /* @__PURE__ */ new Date(),
      aiSuggestedValue: decision.offerAmount || appraisal.aiSuggestedValue,
      expiresAt,
      notes: decision.notes ? `${appraisal.notes || ""}

Manager: ${decision.notes}`.trim() : appraisal.notes
    }
  });
  await db11.activity.create({
    data: {
      tenantId: appraisal.tenantId,
      userId: decision.managerId,
      type: decision.approved ? "APPRAISAL_APPROVED" : "APPRAISAL_REJECTED",
      entityType: "APPRAISAL",
      entityId: decision.appraisalId,
      description: decision.approved ? `Approved appraisal with offer of $${decision.offerAmount || 0}` : "Rejected appraisal",
      metadata: {
        offerAmount: decision.offerAmount,
        reason: decision.adjustmentReason
      }
    }
  });
  return updated;
}
async function convertAppraisalToInventory(input) {
  const appraisal = await db11.appraisal.findUnique({
    where: { id: input.appraisalId },
    include: {
      reconItems: true
    }
  });
  if (!appraisal || appraisal.tenantId !== input.tenantId) {
    throw new Error("Appraisal not found");
  }
  if (appraisal.status !== "APPROVED") {
    throw new Error("Only approved appraisals can be converted to inventory");
  }
  const vehicle = await db11.vehicle.create({
    data: {
      tenantId: input.tenantId,
      stockNumber: input.stockNumber,
      vin: appraisal.vin,
      type: determineVehicleType(appraisal.year, appraisal.mileage),
      year: appraisal.year,
      make: appraisal.make,
      model: appraisal.model,
      trim: appraisal.trim,
      exteriorColor: appraisal.exteriorColor,
      interiorColor: appraisal.interiorColor,
      mileage: appraisal.mileage,
      costCents: input.costCents,
      priceCents: input.priceCents,
      status: input.status || "RECON",
      locationId: input.locationId,
      imageUrls: appraisal.photos,
      daysInStock: 0,
      acquiredDate: /* @__PURE__ */ new Date(),
      acquiredFrom: "Trade-In",
      fuelType: "GASOLINE",
      // Default
      condition: mapConditionGradeToVehicleCondition(appraisal.conditionGrade)
    }
  });
  await db11.appraisal.update({
    where: { id: input.appraisalId },
    data: {
      vehicleId: vehicle.id
    }
  });
  if (appraisal.reconItems && appraisal.reconItems.length > 0) {
    await db11.reconItem.createMany({
      data: appraisal.reconItems.map((item) => ({
        tenantId: input.tenantId,
        vehicleId: vehicle.id,
        title: item.title,
        description: item.description,
        category: item.category,
        estimatedCost: item.estimatedCost,
        status: "PENDING"
      }))
    });
  }
  await db11.activity.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      type: "APPRAISAL_CONVERTED_TO_INVENTORY",
      entityType: "VEHICLE",
      entityId: vehicle.id,
      description: `Converted appraisal to inventory (Stock: ${input.stockNumber})`,
      metadata: {
        appraisalId: input.appraisalId,
        vin: vehicle.vin,
        stockNumber: input.stockNumber
      }
    }
  });
  return vehicle;
}
async function getAppraisals(filters) {
  const where = {
    tenantId: filters.tenantId
  };
  if (filters.status) {
    where.status = { in: filters.status };
  }
  if (filters.appraiserId) {
    where.appraiserId = filters.appraiserId;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }
  const appraisals = await db11.appraisal.findMany({
    where,
    include: {
      appraiser: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return appraisals.map((a) => ({
    ...a,
    appraiserName: `${a.appraiser.firstName} ${a.appraiser.lastName}`,
    managerName: a.manager ? `${a.manager.firstName} ${a.manager.lastName}` : null
  }));
}
function mapConditionGradeToValuation(grade) {
  const map = {
    EXCELLENT: "EXCELLENT",
    CLEAN: "GOOD",
    AVERAGE: "FAIR",
    ROUGH: "POOR"
  };
  return map[grade];
}
function mapConditionGradeToVehicleCondition(grade) {
  const map = {
    EXCELLENT: "EXCELLENT",
    CLEAN: "GOOD",
    AVERAGE: "FAIR",
    ROUGH: "POOR"
  };
  return map[grade];
}
function calculateConditionScore(grade, mileage, year, warningLightsCount) {
  let score = 0;
  const gradeScores = {
    EXCELLENT: 90,
    CLEAN: 75,
    AVERAGE: 60,
    ROUGH: 40
  };
  score = gradeScores[grade];
  const avgMileageForYear = ((/* @__PURE__ */ new Date()).getFullYear() - year) * 12e3;
  if (mileage < avgMileageForYear * 0.7) score += 10;
  else if (mileage > avgMileageForYear * 1.3) score -= 10;
  score -= warningLightsCount * 5;
  return Math.max(0, Math.min(100, score));
}
async function estimateReconCosts(vehicle, tenantId) {
  const items = [];
  items.push({
    category: "DETAILING",
    description: "Full interior and exterior detailing",
    estimatedCost: 150,
    priority: "HIGH",
    required: true
  });
  if (vehicle.conditionGrade === "ROUGH" || vehicle.conditionGrade === "AVERAGE") {
    items.push({
      category: "BODY",
      description: "Paint touch-up and minor body work",
      estimatedCost: 400,
      priority: "MEDIUM",
      required: true
    });
  }
  const avgMileage = ((/* @__PURE__ */ new Date()).getFullYear() - vehicle.year) * 12e3;
  if (vehicle.mileage > avgMileage * 1.2) {
    items.push({
      category: "MECHANICAL",
      description: "Brake inspection and service",
      estimatedCost: 300,
      priority: "HIGH",
      required: true
    });
  }
  if (vehicle.warningLights.length > 0) {
    items.push({
      category: "MECHANICAL",
      description: "Diagnostic scan and repair",
      estimatedCost: 500,
      priority: "HIGH",
      required: true
    });
  }
  if (vehicle.mileage > 6e4) {
    items.push({
      category: "TIRES",
      description: "Tire replacement (if needed)",
      estimatedCost: 600,
      priority: "MEDIUM",
      required: false
    });
  }
  const totalCost = items.reduce((sum3, item) => sum3 + item.estimatedCost, 0);
  const estimatedDays = Math.ceil(items.filter((i) => i.required).length * 1.5);
  return {
    items,
    totalCost,
    estimatedDays
  };
}
async function getMarketDataForAppraisal(appraisal) {
  const comps = await db11.marketComp.findMany({
    where: {
      year: appraisal.year,
      make: appraisal.make,
      model: appraisal.model,
      distance: { lte: 100 }
    },
    take: 20
  });
  const avgPrice = comps.length > 0 ? comps.reduce((sum3, c) => sum3 + c.priceCents, 0) / comps.length / 100 : 0;
  const avgDaysOnMarket = comps.length > 0 ? comps.reduce((sum3, c) => sum3 + (c.daysOnMarket || 0), 0) / comps.length : 45;
  return {
    localComps: comps.length,
    avgMarketPrice: avgPrice,
    demandScore: avgDaysOnMarket < 30 ? 80 : avgDaysOnMarket < 45 ? 60 : 40,
    avgDaysOnMarket: Math.round(avgDaysOnMarket),
    marketVelocity: avgDaysOnMarket < 30 ? "FAST" : avgDaysOnMarket < 45 ? "AVERAGE" : "SLOW"
  };
}
function determineVehicleType(year, mileage) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const age = currentYear - year;
  if (age <= 1 && mileage < 15e3) return "NEW";
  if (age <= 5 && mileage < 5e4) return "CPO";
  return "USED";
}

// src/routes/appraisal.routes.ts
var appraisalRouter = Router24();
var createAppraisalSchema = z18.object({
  customerId: z18.string().optional(),
  leadId: z18.string().optional(),
  vin: z18.string().min(17).max(17),
  year: z18.number().int().min(1900).max(2100).optional(),
  make: z18.string().optional(),
  model: z18.string().optional(),
  trim: z18.string().optional(),
  mileage: z18.number().int().min(0),
  exteriorColor: z18.string().optional(),
  interiorColor: z18.string().optional(),
  conditionGrade: z18.nativeEnum(AppraisalConditionGrade).optional(),
  conditionNotes: z18.string().optional(),
  warningLights: z18.array(z18.string()).optional(),
  photos: z18.array(z18.string()).optional(),
  notes: z18.string().optional()
});
var updateAppraisalSchema = z18.object({
  mileage: z18.number().int().min(0).optional(),
  exteriorColor: z18.string().optional(),
  interiorColor: z18.string().optional(),
  conditionGrade: z18.nativeEnum(AppraisalConditionGrade).optional(),
  conditionScore: z18.number().int().min(0).max(100).optional(),
  conditionNotes: z18.string().optional(),
  warningLights: z18.array(z18.string()).optional(),
  photos: z18.array(z18.string()).optional(),
  notes: z18.string().optional(),
  estimatedValue: z18.number().optional()
});
var approvalDecisionSchema = z18.object({
  approved: z18.boolean(),
  offerAmount: z18.number().min(0).optional(),
  adjustmentReason: z18.string().optional(),
  expiresInHours: z18.number().int().min(1).max(168).optional(),
  // Max 1 week
  notes: z18.string().optional()
});
var convertToInventorySchema = z18.object({
  stockNumber: z18.string().min(1),
  costCents: z18.number().int().min(0),
  priceCents: z18.number().int().min(0),
  locationId: z18.string().optional(),
  status: z18.string().optional()
});
var appraisalFiltersSchema = z18.object({
  status: z18.array(z18.nativeEnum(AppraisalStatus)).optional(),
  appraiserId: z18.string().optional(),
  dateFrom: z18.string().datetime().optional(),
  dateTo: z18.string().datetime().optional()
});
appraisalRouter.post(
  "/decode-vin",
  async (req, res, next) => {
    try {
      const { vin } = req.body;
      if (!vin || vin.length !== 17) {
        return res.status(400).json({ error: "Valid 17-character VIN required" });
      }
      const decoded = await decodeVIN2(vin);
      res.json({ data: decoded });
    } catch (error) {
      console.error("VIN decode error:", error);
      next(error);
    }
  }
);
appraisalRouter.get(
  "/",
  async (req, res, next) => {
    try {
      const validation = appraisalFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid filters",
          details: validation.error.errors
        });
      }
      const filters = validation.data;
      const tenantId = req.tenantId;
      const appraisals = await getAppraisals({
        tenantId,
        status: filters.status,
        appraiserId: filters.appraiserId,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : void 0,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : void 0
      });
      res.json({ data: appraisals });
    } catch (error) {
      console.error("Appraisals fetch error:", error);
      next(error);
    }
  }
);
appraisalRouter.get(
  "/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const appraisal = await getAppraisalById(id, tenantId);
      res.json({ data: appraisal });
    } catch (error) {
      console.error("Appraisal fetch error:", error);
      if (error.message === "Appraisal not found") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
appraisalRouter.post(
  "/",
  async (req, res, next) => {
    try {
      const validation = createAppraisalSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const userId = req.userId;
      const appraisalData = validation.data;
      const appraisal = await createAppraisal({
        tenantId,
        appraiserId: userId,
        ...appraisalData
      });
      res.status(201).json({ data: appraisal });
    } catch (error) {
      console.error("Appraisal creation error:", error);
      next(error);
    }
  }
);
appraisalRouter.put(
  "/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updateAppraisalSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const userId = req.userId;
      const updates = validation.data;
      const appraisal = await updateAppraisal(id, tenantId, userId, updates);
      res.json({ data: appraisal });
    } catch (error) {
      console.error("Appraisal update error:", error);
      if (error.message === "Appraisal not found" || error.message.includes("Cannot update")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);
appraisalRouter.post(
  "/:id/submit",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const userId = req.userId;
      const appraisal = await submitAppraisal(id, tenantId, userId);
      res.json({ data: appraisal });
    } catch (error) {
      console.error("Appraisal submission error:", error);
      if (error.message === "Appraisal not found" || error.message.includes("already submitted")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);
appraisalRouter.post(
  "/:id/approve",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = approvalDecisionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const userId = req.userId;
      const decision = validation.data;
      const appraisal = await processApprovalDecision({
        appraisalId: id,
        managerId: userId,
        ...decision
      });
      res.json({ data: appraisal });
    } catch (error) {
      console.error("Approval decision error:", error);
      if (error.message === "Appraisal not found" || error.message.includes("not in reviewable")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);
appraisalRouter.post(
  "/:id/convert-to-inventory",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = convertToInventorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const userId = req.userId;
      const conversionData = validation.data;
      const vehicle = await convertAppraisalToInventory({
        appraisalId: id,
        tenantId,
        userId,
        ...conversionData
      });
      res.status(201).json({ data: vehicle });
    } catch (error) {
      console.error("Appraisal conversion error:", error);
      if (error.message === "Appraisal not found" || error.message.includes("Only approved")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);

// src/routes/accounting.routes.ts
import { Router as Router25 } from "express";
import { z as z19 } from "zod";

// src/services/accounting.service.ts
import { db as prisma2 } from "@repo/db";
import {
  JournalStatus,
  JournalEntryType,
  LineType,
  AccountType
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
async function ensureStandardGLAccounts(tenantId) {
  const accounts = /* @__PURE__ */ new Map();
  const standardAccounts = [
    // ASSETS (1000-1999)
    { number: "1000", name: "Cash", type: AccountType.ASSET, balance: "DEBIT" },
    { number: "1100", name: "Accounts Receivable", type: AccountType.ASSET, balance: "DEBIT" },
    { number: "1200", name: "Vehicle Inventory", type: AccountType.ASSET, balance: "DEBIT" },
    { number: "1210", name: "Parts Inventory", type: AccountType.ASSET, balance: "DEBIT" },
    { number: "1500", name: "Fixed Assets", type: AccountType.ASSET, balance: "DEBIT" },
    // LIABILITIES (2000-2999)
    { number: "2000", name: "Accounts Payable", type: AccountType.LIABILITY, balance: "CREDIT" },
    { number: "2100", name: "Floor Plan Payable", type: AccountType.LIABILITY, balance: "CREDIT" },
    { number: "2200", name: "Commissions Payable", type: AccountType.LIABILITY, balance: "CREDIT" },
    { number: "2500", name: "Long-Term Debt", type: AccountType.LIABILITY, balance: "CREDIT" },
    // EQUITY (3000-3999)
    { number: "3000", name: "Owner's Capital", type: AccountType.EQUITY, balance: "CREDIT" },
    { number: "3900", name: "Retained Earnings", type: AccountType.EQUITY, balance: "CREDIT" },
    // REVENUE (4000-4999)
    { number: "4000", name: "Vehicle Sales Revenue", type: AccountType.REVENUE, balance: "CREDIT" },
    { number: "4100", name: "F&I Product Revenue", type: AccountType.REVENUE, balance: "CREDIT" },
    { number: "4200", name: "Service Revenue", type: AccountType.REVENUE, balance: "CREDIT" },
    { number: "4300", name: "Finance Reserve", type: AccountType.REVENUE, balance: "CREDIT" },
    // COGS (5000-5999)
    { number: "5000", name: "Vehicle Cost of Sales", type: AccountType.EXPENSE, balance: "DEBIT" },
    { number: "5100", name: "Reconditioning Cost", type: AccountType.EXPENSE, balance: "DEBIT" },
    { number: "5200", name: "Pack Amount", type: AccountType.EXPENSE, balance: "DEBIT" },
    { number: "5300", name: "Parts Cost of Sales", type: AccountType.EXPENSE, balance: "DEBIT" },
    // OPERATING EXPENSES (6000-6999)
    { number: "6000", name: "Salaries Expense", type: AccountType.EXPENSE, balance: "DEBIT" },
    { number: "6100", name: "Commission Expense", type: AccountType.EXPENSE, balance: "DEBIT" },
    { number: "6200", name: "Advertising Expense", type: AccountType.EXPENSE, balance: "DEBIT" },
    { number: "6300", name: "Rent Expense", type: AccountType.EXPENSE, balance: "DEBIT" },
    { number: "6400", name: "Utilities Expense", type: AccountType.EXPENSE, balance: "DEBIT" },
    { number: "6500", name: "Insurance Expense", type: AccountType.EXPENSE, balance: "DEBIT" },
    { number: "6900", name: "Miscellaneous Expense", type: AccountType.EXPENSE, balance: "DEBIT" }
  ];
  for (const acct of standardAccounts) {
    const existing = await prisma2.gLAccount.findUnique({
      where: {
        tenantId_accountNumber: {
          tenantId,
          accountNumber: acct.number
        }
      }
    });
    if (existing) {
      accounts.set(acct.number, existing);
    } else {
      const created = await prisma2.gLAccount.create({
        data: {
          tenantId,
          accountNumber: acct.number,
          accountName: acct.name,
          accountType: acct.type,
          normalBalance: acct.balance,
          balance: new Decimal(0)
        }
      });
      accounts.set(acct.number, created);
    }
  }
  return accounts;
}
async function getGLAccountByNumber(tenantId, accountNumber) {
  return prisma2.gLAccount.findUnique({
    where: {
      tenantId_accountNumber: { tenantId, accountNumber }
    }
  });
}
async function createJournalEntry(input) {
  const totalDebits = input.lines.filter((l) => l.type === LineType.DEBIT).reduce((sum3, l) => sum3 + l.amount, 0);
  const totalCredits = input.lines.filter((l) => l.type === LineType.CREDIT).reduce((sum3, l) => sum3 + l.amount, 0);
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    throw new Error(`Journal entry not balanced: Debits ${totalDebits} != Credits ${totalCredits}`);
  }
  const count = await prisma2.journalEntry.count({ where: { tenantId: input.tenantId } });
  const entryNumber = `JE-${String(count + 1).padStart(6, "0")}`;
  const entry = await prisma2.journalEntry.create({
    data: {
      tenantId: input.tenantId,
      entryNumber,
      memo: input.memo,
      entryType: input.entryType,
      status: JournalStatus.DRAFT,
      postingDate: input.postingDate,
      postedById: input.userId,
      dealId: input.dealId,
      amountCents: Math.round(totalDebits * 100),
      lines: {
        create: input.lines.map((line) => ({
          tenantId: input.tenantId,
          glAccountId: line.glAccountId,
          type: line.type,
          amount: new Decimal(line.amount),
          description: line.description
        }))
      }
    },
    include: {
      lines: {
        include: {
          glAccount: true
        }
      }
    }
  });
  return entry;
}
async function postJournalEntry(journalEntryId, tenantId, userId) {
  const entry = await prisma2.journalEntry.findUnique({
    where: { id: journalEntryId },
    include: {
      lines: {
        include: {
          glAccount: true
        }
      }
    }
  });
  if (!entry || entry.tenantId !== tenantId) {
    throw new Error("Journal entry not found");
  }
  if (entry.status === JournalStatus.POSTED) {
    throw new Error("Journal entry already posted");
  }
  for (const line of entry.lines) {
    const account = line.glAccount;
    const currentBalance = account.balance ? parseFloat(account.balance.toString()) : 0;
    const lineAmount = parseFloat(line.amount.toString());
    let newBalance;
    if (account.normalBalance === "DEBIT") {
      newBalance = line.type === LineType.DEBIT ? currentBalance + lineAmount : currentBalance - lineAmount;
    } else {
      newBalance = line.type === LineType.CREDIT ? currentBalance + lineAmount : currentBalance - lineAmount;
    }
    await prisma2.gLAccount.update({
      where: { id: account.id },
      data: { balance: new Decimal(newBalance) }
    });
  }
  const posted = await prisma2.journalEntry.update({
    where: { id: journalEntryId },
    data: {
      status: JournalStatus.POSTED,
      postedAt: /* @__PURE__ */ new Date()
    },
    include: {
      lines: {
        include: {
          glAccount: true
        }
      }
    }
  });
  return posted;
}
async function postDealJournalEntry(input) {
  const { dealId, tenantId, userId, postingDate = /* @__PURE__ */ new Date() } = input;
  const deal = await prisma2.deal.findUnique({
    where: { id: dealId },
    include: {
      vehicle: true,
      customer: true,
      tradeIn: true
    }
  });
  if (!deal || deal.tenantId !== tenantId) {
    throw new Error("Deal not found");
  }
  const accounts = await ensureStandardGLAccounts(tenantId);
  const lines = [];
  const cashDown = deal.cashDownCents ? deal.cashDownCents / 100 : 0;
  const tradeEquity = deal.tradeEquityCents ? deal.tradeEquityCents / 100 : 0;
  const totalCash = cashDown + tradeEquity;
  if (totalCash > 0) {
    lines.push({
      glAccountId: accounts.get("1000").id,
      type: LineType.DEBIT,
      amount: totalCash,
      description: `Cash received - Deal ${deal.dealNumber}`
    });
  }
  const financed = deal.amountFinancedCents ? deal.amountFinancedCents / 100 : 0;
  if (financed > 0) {
    lines.push({
      glAccountId: accounts.get("1100").id,
      type: LineType.DEBIT,
      amount: financed,
      description: `Financed amount - Deal ${deal.dealNumber}`
    });
  }
  const sellingPrice = deal.sellingPriceCents ? deal.sellingPriceCents / 100 : parseFloat(deal.netVehiclePrice.toString());
  lines.push({
    glAccountId: accounts.get("4000").id,
    type: LineType.CREDIT,
    amount: sellingPrice,
    description: `Vehicle sale - ${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model}`
  });
  const vehicleCost = deal.dealerCostCents ? deal.dealerCostCents / 100 : 0;
  if (vehicleCost > 0) {
    lines.push({
      glAccountId: accounts.get("5000").id,
      type: LineType.DEBIT,
      amount: vehicleCost,
      description: `Cost of vehicle sold - ${deal.vehicle.stockNumber}`
    });
  }
  if (vehicleCost > 0) {
    lines.push({
      glAccountId: accounts.get("1200").id,
      type: LineType.CREDIT,
      amount: vehicleCost,
      description: `Remove from inventory - ${deal.vehicle.stockNumber}`
    });
  }
  const fiRevenue = deal.totalFiCents ? deal.totalFiCents / 100 : 0;
  if (fiRevenue > 0) {
    lines.push({
      glAccountId: accounts.get("4100").id,
      type: LineType.CREDIT,
      amount: fiRevenue,
      description: `F&I products - Deal ${deal.dealNumber}`
    });
  }
  const reserve = deal.reserveGrossCents ? deal.reserveGrossCents / 100 : 0;
  if (reserve > 0) {
    lines.push({
      glAccountId: accounts.get("4300").id,
      type: LineType.CREDIT,
      amount: reserve,
      description: `Finance reserve - Deal ${deal.dealNumber}`
    });
  }
  const pack = deal.packCents ? deal.packCents / 100 : 0;
  if (pack > 0) {
    lines.push({
      glAccountId: accounts.get("5200").id,
      type: LineType.DEBIT,
      amount: pack,
      description: `Pack - Deal ${deal.dealNumber}`
    });
  }
  const entry = await createJournalEntry({
    tenantId,
    entryType: JournalEntryType.DEAL_POSTING,
    memo: `Auto-posted from Deal ${deal.dealNumber} - ${deal.customer.firstName} ${deal.customer.lastName}`,
    postingDate,
    userId,
    dealId,
    lines
  });
  return postJournalEntry(entry.id, tenantId, userId);
}
async function generateProfitLoss(tenantId, startDate, endDate) {
  const deals = await prisma2.deal.findMany({
    where: {
      tenantId,
      dealDate: {
        gte: startDate,
        lte: endDate
      },
      status: "DELIVERED"
    },
    include: {
      vehicle: true
    }
  });
  const vehicleSales = deals.reduce((sum3, d) => {
    const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
    return sum3 + price;
  }, 0);
  const fiProducts = deals.reduce((sum3, d) => {
    const fi = d.totalFiCents ? d.totalFiCents / 100 : 0;
    return sum3 + fi;
  }, 0);
  const serviceOrders = await prisma2.serviceOrder.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      status: "COMPLETED"
    }
  });
  const serviceRevenue = serviceOrders.reduce((sum3, so) => {
    return sum3 + parseFloat(so.totalPrice.toString());
  }, 0);
  const totalRevenue = vehicleSales + fiProducts + serviceRevenue;
  const vehicleCost = deals.reduce((sum3, d) => {
    const cost = d.dealerCostCents ? d.dealerCostCents / 100 : 0;
    return sum3 + cost;
  }, 0);
  const reconCost = 0;
  const packAmount = deals.reduce((sum3, d) => {
    const pack = d.packCents ? d.packCents / 100 : 0;
    return sum3 + pack;
  }, 0);
  const totalCOGS = vehicleCost + reconCost + packAmount;
  const frontEndGross = deals.reduce((sum3, d) => {
    const gross = d.frontGrossCents ? d.frontGrossCents / 100 : 0;
    return sum3 + gross;
  }, 0);
  const backEndGross = deals.reduce((sum3, d) => {
    const gross = d.backGrossCents ? d.backGrossCents / 100 : 0;
    return sum3 + gross;
  }, 0);
  const totalGross = frontEndGross + backEndGross + serviceRevenue;
  const grossMargin = totalRevenue > 0 ? totalGross / totalRevenue * 100 : 0;
  const commissions = await prisma2.commission.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      status: { in: ["APPROVED", "PAID"] }
    }
  });
  const commissionTotal = commissions.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0);
  const expenseAccounts = await prisma2.gLAccount.findMany({
    where: {
      tenantId,
      accountType: AccountType.EXPENSE,
      accountNumber: {
        gte: "6000",
        lt: "7000"
      }
    }
  });
  const expensesByCategory = {
    salaries: expenseAccounts.find((a) => a.accountNumber === "6000")?.balance ? parseFloat(expenseAccounts.find((a) => a.accountNumber === "6000").balance.toString()) : 0,
    commissions: commissionTotal,
    advertising: expenseAccounts.find((a) => a.accountNumber === "6200")?.balance ? parseFloat(expenseAccounts.find((a) => a.accountNumber === "6200").balance.toString()) : 0,
    rent: expenseAccounts.find((a) => a.accountNumber === "6300")?.balance ? parseFloat(expenseAccounts.find((a) => a.accountNumber === "6300").balance.toString()) : 0,
    utilities: expenseAccounts.find((a) => a.accountNumber === "6400")?.balance ? parseFloat(expenseAccounts.find((a) => a.accountNumber === "6400").balance.toString()) : 0,
    insurance: expenseAccounts.find((a) => a.accountNumber === "6500")?.balance ? parseFloat(expenseAccounts.find((a) => a.accountNumber === "6500").balance.toString()) : 0,
    other: expenseAccounts.find((a) => a.accountNumber === "6900")?.balance ? parseFloat(expenseAccounts.find((a) => a.accountNumber === "6900").balance.toString()) : 0
  };
  const totalExpenses = Object.values(expensesByCategory).reduce((sum3, val) => sum3 + val, 0);
  const netIncome = totalGross - totalExpenses;
  const netMargin = totalRevenue > 0 ? netIncome / totalRevenue * 100 : 0;
  return {
    startDate,
    endDate,
    revenue: {
      vehicleSales,
      fiProducts,
      serviceRevenue,
      total: totalRevenue
    },
    cogs: {
      vehicleCost,
      reconCost,
      packAmount,
      total: totalCOGS
    },
    grossProfit: {
      frontEnd: frontEndGross,
      backEnd: backEndGross,
      service: serviceRevenue,
      total: totalGross,
      margin: grossMargin
    },
    expenses: expensesByCategory,
    netIncome,
    netMargin
  };
}
async function generateBalanceSheet(tenantId, asOfDate = /* @__PURE__ */ new Date()) {
  const accounts = await prisma2.gLAccount.findMany({
    where: { tenantId, isActive: true }
  });
  const getBalance = (accountNumber) => {
    const account = accounts.find((a) => a.accountNumber === accountNumber);
    return account?.balance ? parseFloat(account.balance.toString()) : 0;
  };
  const inventoryValue = await prisma2.vehicle.aggregate({
    where: {
      tenantId,
      status: { in: ["AVAILABLE", "PENDING", "RECON"] }
    },
    _sum: {
      costCents: true
    }
  });
  const inventory = inventoryValue._sum.costCents ? inventoryValue._sum.costCents / 100 : 0;
  const cash = getBalance("1000");
  const ar = getBalance("1100");
  const fixedAssets = getBalance("1500");
  const totalAssets = cash + ar + inventory + fixedAssets;
  const ap = getBalance("2000");
  const flooring = getBalance("2100");
  const commissionsPayable = getBalance("2200");
  const totalCurrentLiabilities = ap + flooring + commissionsPayable;
  const longTermDebt = getBalance("2500");
  const totalLiabilities = totalCurrentLiabilities + longTermDebt;
  const capital = getBalance("3000");
  const retainedEarnings = getBalance("3900");
  const currentPeriod = totalAssets - totalLiabilities - capital - retainedEarnings;
  const totalEquity = capital + retainedEarnings + currentPeriod;
  return {
    asOfDate,
    assets: {
      cash,
      accountsReceivable: ar,
      inventory,
      totalCurrent: cash + ar + inventory,
      fixedAssets,
      totalAssets
    },
    liabilities: {
      accountsPayable: ap,
      flooring,
      totalCurrent: totalCurrentLiabilities,
      longTermDebt,
      totalLiabilities
    },
    equity: {
      capital,
      retainedEarnings,
      currentPeriod,
      totalEquity
    }
  };
}
async function generateCashReconciliation(tenantId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  const cashAccount = await getGLAccountByNumber(tenantId, "1000");
  const openingBalance = cashAccount?.balance ? parseFloat(cashAccount.balance.toString()) : 0;
  const deals = await prisma2.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startOfDay, lte: endOfDay },
      status: { in: ["DELIVERED", "FUNDED"] }
    }
  });
  const cashSales = deals.reduce((sum3, d) => {
    const cash = d.cashDownCents ? d.cashDownCents / 100 : 0;
    return sum3 + cash;
  }, 0);
  const downPayments = cashSales;
  const commissions = await prisma2.commission.findMany({
    where: {
      tenantId,
      paidDate: { gte: startOfDay, lte: endOfDay },
      status: "PAID"
    }
  });
  const commissionsPaid = commissions.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0);
  const totalReceipts = cashSales + downPayments;
  const totalDisbursements = commissionsPaid;
  const closingBalance = openingBalance + totalReceipts - totalDisbursements;
  return {
    date,
    openingBalance,
    cashSales,
    downPayments,
    otherReceipts: 0,
    totalReceipts,
    expenses: 0,
    commissions: commissionsPaid,
    otherDisbursements: 0,
    totalDisbursements,
    closingBalance
  };
}
async function getDealProfitAnalysis(tenantId, startDate, endDate) {
  const deals = await prisma2.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startDate, lte: endDate },
      status: { in: ["DELIVERED", "FUNDED"] }
    },
    include: {
      customer: true,
      vehicle: true,
      salesPerson: true,
      commissions: {
        include: {
          user: true
        }
      }
    }
  });
  return deals.map((deal) => {
    const frontGross = deal.frontGrossCents ? deal.frontGrossCents / 100 : 0;
    const backGross = deal.backGrossCents ? deal.backGrossCents / 100 : 0;
    const reserveGross = deal.reserveGrossCents ? deal.reserveGrossCents / 100 : 0;
    const totalGross = deal.totalGrossCents ? deal.totalGrossCents / 100 : 0;
    const totalCost = deal.dealerCostCents ? deal.dealerCostCents / 100 : 0;
    const netProfit = totalGross - totalCost;
    const profitMargin = totalGross > 0 ? netProfit / totalGross * 100 : 0;
    return {
      dealId: deal.id,
      dealNumber: deal.dealNumber,
      customerId: deal.customerId,
      customerName: `${deal.customer.firstName} ${deal.customer.lastName}`,
      vehicleId: deal.vehicleId,
      vehicleDescription: `${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model}`,
      dealDate: deal.dealDate,
      salesPerson: `${deal.salesPerson.firstName} ${deal.salesPerson.lastName}`,
      frontEndGross: frontGross,
      backEndGross: backGross,
      reserveGross,
      totalGross,
      totalCost,
      netProfit,
      profitMargin,
      commissions: deal.commissions.map((c) => ({
        userId: c.userId,
        userName: `${c.user.firstName} ${c.user.lastName}`,
        type: c.commissionType,
        amount: parseFloat(c.amount.toString())
      }))
    };
  });
}

// src/services/commission.service.ts
import { db as prisma3 } from "@repo/db";
import {
  CommissionType,
  CommissionStatus
} from "@prisma/client";
import { Decimal as Decimal2 } from "@prisma/client/runtime/library";
async function calculateDealCommissions(input) {
  const { dealId, tenantId, userId } = input;
  const deal = await prisma3.deal.findUnique({
    where: { id: dealId },
    include: {
      salesPerson: true,
      salesManager: true,
      financeManager: true,
      vehicle: true
    }
  });
  if (!deal || deal.tenantId !== tenantId) {
    throw new Error("Deal not found");
  }
  const calculations = [];
  const frontGross = deal.frontGrossCents ? deal.frontGrossCents / 100 : 0;
  const backGross = deal.backGrossCents ? deal.backGrossCents / 100 : 0;
  const reserveGross = deal.reserveGrossCents ? deal.reserveGrossCents / 100 : 0;
  const totalGross = deal.totalGrossCents ? deal.totalGrossCents / 100 : 0;
  const salesPersonCalc = {
    dealId: deal.id,
    dealNumber: deal.dealNumber,
    userId: deal.salesPersonId,
    userName: `${deal.salesPerson.firstName} ${deal.salesPerson.lastName}`,
    role: "Salesperson",
    commissions: [],
    totalCommission: 0
  };
  if (frontGross > 0) {
    const frontRate = 0.25;
    const frontCommission = frontGross * frontRate;
    salesPersonCalc.commissions.push({
      type: CommissionType.FRONT,
      baseAmount: frontGross,
      rate: frontRate * 100,
      amount: frontCommission,
      notes: `25% of front-end gross profit`
    });
    salesPersonCalc.totalCommission += frontCommission;
  }
  if (backGross > 0) {
    const backRate = 0.1;
    const backCommission = backGross * backRate;
    salesPersonCalc.commissions.push({
      type: CommissionType.BACK,
      baseAmount: backGross,
      rate: backRate * 100,
      amount: backCommission,
      notes: `10% of F&I products gross profit`
    });
    salesPersonCalc.totalCommission += backCommission;
  }
  if (totalGross >= 3e3) {
    const bonus = 200;
    salesPersonCalc.commissions.push({
      type: CommissionType.BONUS,
      baseAmount: totalGross,
      rate: 0,
      amount: bonus,
      notes: `High-profit deal bonus (>$3000)`
    });
    salesPersonCalc.totalCommission += bonus;
  }
  calculations.push(salesPersonCalc);
  if (deal.salesManagerId && deal.salesManager) {
    const managerCalc = {
      dealId: deal.id,
      dealNumber: deal.dealNumber,
      userId: deal.salesManagerId,
      userName: `${deal.salesManager.firstName} ${deal.salesManager.lastName}`,
      role: "Sales Manager",
      commissions: [],
      totalCommission: 0
    };
    if (totalGross > 0) {
      const managerRate = 0.05;
      const managerCommission = totalGross * managerRate;
      managerCalc.commissions.push({
        type: CommissionType.FRONT,
        baseAmount: totalGross,
        rate: managerRate * 100,
        amount: managerCommission,
        notes: `5% of total gross profit (manager override)`
      });
      managerCalc.totalCommission += managerCommission;
    }
    calculations.push(managerCalc);
  }
  if (deal.financeManagerId && deal.financeManager) {
    const fiManagerCalc = {
      dealId: deal.id,
      dealNumber: deal.dealNumber,
      userId: deal.financeManagerId,
      userName: `${deal.financeManager.firstName} ${deal.financeManager.lastName}`,
      role: "F&I Manager",
      commissions: [],
      totalCommission: 0
    };
    const fiTotal = backGross + reserveGross;
    if (fiTotal > 0) {
      const fiRate = 0.2;
      const fiCommission = fiTotal * fiRate;
      fiManagerCalc.commissions.push({
        type: CommissionType.BACK,
        baseAmount: fiTotal,
        rate: fiRate * 100,
        amount: fiCommission,
        notes: `20% of F&I products and reserve`
      });
      fiManagerCalc.totalCommission += fiCommission;
    }
    calculations.push(fiManagerCalc);
  }
  return calculations;
}
async function createCommissionsFromCalculation(calculation, tenantId) {
  const commissions = [];
  for (const comm of calculation.commissions) {
    const created = await prisma3.commission.create({
      data: {
        tenantId,
        dealId: calculation.dealId,
        userId: calculation.userId,
        commissionType: comm.type,
        amount: new Decimal2(comm.amount),
        rate: new Decimal2(comm.rate),
        status: CommissionStatus.PENDING,
        notes: comm.notes
      }
    });
    commissions.push(created);
  }
  return commissions;
}
async function autoCalculateCommissions(dealId, tenantId, userId) {
  const existing = await prisma3.commission.findMany({
    where: { dealId, tenantId }
  });
  if (existing.length > 0) {
    throw new Error("Commissions already calculated for this deal");
  }
  const calculations = await calculateDealCommissions({ dealId, tenantId, userId });
  const allCommissions = [];
  for (const calc of calculations) {
    const commissions = await createCommissionsFromCalculation(calc, tenantId);
    allCommissions.push(...commissions);
  }
  return allCommissions;
}
async function approveCommissions(commissionIds, tenantId, approverId) {
  const updated = await prisma3.$transaction(
    commissionIds.map(
      (id) => prisma3.commission.update({
        where: { id },
        data: { status: CommissionStatus.APPROVED }
      })
    )
  );
  return updated;
}
async function markCommissionsPaid(payment) {
  const { commissionIds, tenantId, paymentDate, paymentMethod, notes } = payment;
  const commissions = await prisma3.commission.findMany({
    where: {
      id: { in: commissionIds },
      tenantId
    }
  });
  if (commissions.length !== commissionIds.length) {
    throw new Error("Some commissions not found");
  }
  const notApproved = commissions.filter((c) => c.status !== CommissionStatus.APPROVED);
  if (notApproved.length > 0) {
    throw new Error("Cannot pay unapproved commissions");
  }
  const updated = await prisma3.$transaction(
    commissionIds.map(
      (id) => prisma3.commission.update({
        where: { id },
        data: {
          status: CommissionStatus.PAID,
          paidDate: paymentDate,
          notes: notes ? `${notes} | Payment method: ${paymentMethod}` : `Payment method: ${paymentMethod}`
        }
      })
    )
  );
  return updated;
}
async function chargebackCommission(commissionId, tenantId, reason) {
  const commission = await prisma3.commission.findUnique({
    where: { id: commissionId }
  });
  if (!commission || commission.tenantId !== tenantId) {
    throw new Error("Commission not found");
  }
  if (commission.status === CommissionStatus.CHARGEBACK) {
    throw new Error("Commission already charged back");
  }
  const updated = await prisma3.commission.update({
    where: { id: commissionId },
    data: {
      status: CommissionStatus.CHARGEBACK,
      notes: `CHARGEBACK: ${reason}`
    }
  });
  return updated;
}
async function getUserCommissions(userId, tenantId, startDate, endDate) {
  return prisma3.commission.findMany({
    where: {
      userId,
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      deal: {
        include: {
          customer: true,
          vehicle: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
async function generateCommissionReport(tenantId, startDate, endDate) {
  const commissions = await prisma3.commission.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      user: true,
      deal: true
    },
    orderBy: {
      userId: "asc"
    }
  });
  const userMap = /* @__PURE__ */ new Map();
  for (const commission of commissions) {
    const userId = commission.userId;
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId,
        userName: `${commission.user.firstName} ${commission.user.lastName}`,
        role: commission.user.role,
        dealCount: /* @__PURE__ */ new Set(),
        frontCommission: 0,
        backCommission: 0,
        bonuses: 0,
        spiffs: 0,
        totalCommission: 0,
        status: {
          pending: 0,
          approved: 0,
          paid: 0
        }
      });
    }
    const userData = userMap.get(userId);
    const amount = parseFloat(commission.amount.toString());
    userData.dealCount.add(commission.dealId);
    switch (commission.commissionType) {
      case CommissionType.FRONT:
        userData.frontCommission += amount;
        break;
      case CommissionType.BACK:
        userData.backCommission += amount;
        break;
      case CommissionType.BONUS:
        userData.bonuses += amount;
        break;
      case CommissionType.SPIFF:
        userData.spiffs += amount;
        break;
    }
    switch (commission.status) {
      case CommissionStatus.PENDING:
        userData.status.pending += amount;
        break;
      case CommissionStatus.APPROVED:
        userData.status.approved += amount;
        break;
      case CommissionStatus.PAID:
        userData.status.paid += amount;
        break;
    }
    userData.totalCommission += amount;
  }
  const byUser = Array.from(userMap.values()).map((user) => ({
    ...user,
    dealCount: user.dealCount.size,
    avgPerDeal: user.dealCount.size > 0 ? user.totalCommission / user.dealCount.size : 0
  }));
  const totals = byUser.reduce(
    (acc, user) => ({
      totalDeals: acc.totalDeals + user.dealCount,
      totalCommissions: acc.totalCommissions + user.totalCommission,
      totalPaid: acc.totalPaid + user.status.paid,
      totalPending: acc.totalPending + user.status.pending
    }),
    { totalDeals: 0, totalCommissions: 0, totalPaid: 0, totalPending: 0 }
  );
  return {
    startDate,
    endDate,
    byUser,
    totals
  };
}
async function getPendingCommissions(tenantId) {
  return prisma3.commission.findMany({
    where: {
      tenantId,
      status: CommissionStatus.PENDING
    },
    include: {
      user: true,
      deal: {
        include: {
          customer: true,
          vehicle: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
async function getApprovedCommissions(tenantId) {
  return prisma3.commission.findMany({
    where: {
      tenantId,
      status: CommissionStatus.APPROVED
    },
    include: {
      user: true,
      deal: {
        include: {
          customer: true,
          vehicle: true
        }
      }
    },
    orderBy: [
      { userId: "asc" },
      { createdAt: "desc" }
    ]
  });
}
async function getCommissionSummary(tenantId) {
  const thisMonth = /* @__PURE__ */ new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const commissions = await prisma3.commission.findMany({
    where: {
      tenantId,
      createdAt: { gte: thisMonth }
    }
  });
  const pending = commissions.filter((c) => c.status === CommissionStatus.PENDING);
  const approved = commissions.filter((c) => c.status === CommissionStatus.APPROVED);
  const paid = commissions.filter((c) => c.status === CommissionStatus.PAID);
  return {
    thisMonth: {
      total: commissions.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0),
      pending: pending.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0),
      approved: approved.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0),
      paid: paid.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0),
      counts: {
        total: commissions.length,
        pending: pending.length,
        approved: approved.length,
        paid: paid.length
      }
    }
  };
}

// src/services/financial-reporting.service.ts
import { db as prisma4 } from "@repo/db";
async function generateDailySalesSummary(tenantId, date = /* @__PURE__ */ new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  const deals = await prisma4.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startOfDay, lte: endOfDay },
      status: { in: ["DELIVERED", "FUNDED"] }
    },
    include: {
      salesPerson: true,
      vehicle: true
    }
  });
  if (deals.length === 0) {
    return {
      date,
      totalDeals: 0,
      vehiclesSold: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalGrossProfit: 0,
      avgGrossPerDeal: 0,
      frontEndGross: 0,
      backEndGross: 0,
      reserveGross: 0,
      avgSellingPrice: 0,
      avgDealCost: 0,
      dealsByType: { RETAIL: 0, LEASE: 0, CASH: 0, FINANCE: 0 },
      topSalespeople: []
    };
  }
  const totalRevenue = deals.reduce((sum3, d) => {
    const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
    return sum3 + price;
  }, 0);
  const totalCost = deals.reduce((sum3, d) => {
    const cost = d.dealerCostCents ? d.dealerCostCents / 100 : 0;
    return sum3 + cost;
  }, 0);
  const frontEndGross = deals.reduce((sum3, d) => {
    const gross = d.frontGrossCents ? d.frontGrossCents / 100 : 0;
    return sum3 + gross;
  }, 0);
  const backEndGross = deals.reduce((sum3, d) => {
    const gross = d.backGrossCents ? d.backGrossCents / 100 : 0;
    return sum3 + gross;
  }, 0);
  const reserveGross = deals.reduce((sum3, d) => {
    const gross = d.reserveGrossCents ? d.reserveGrossCents / 100 : 0;
    return sum3 + gross;
  }, 0);
  const totalGrossProfit = frontEndGross + backEndGross + reserveGross;
  const dealsByType = {
    RETAIL: deals.filter((d) => d.dealType === "RETAIL").length,
    LEASE: deals.filter((d) => d.dealType === "LEASE").length,
    CASH: deals.filter((d) => d.dealType === "CASH").length,
    FINANCE: deals.filter((d) => d.dealType === "FINANCE").length
  };
  const salesPersonMap = /* @__PURE__ */ new Map();
  deals.forEach((deal) => {
    const spId = deal.salesPersonId;
    const gross = deal.totalGrossCents ? deal.totalGrossCents / 100 : 0;
    if (!salesPersonMap.has(spId)) {
      salesPersonMap.set(spId, {
        name: `${deal.salesPerson.firstName} ${deal.salesPerson.lastName}`,
        dealCount: 0,
        totalGross: 0
      });
    }
    const sp = salesPersonMap.get(spId);
    sp.dealCount += 1;
    sp.totalGross += gross;
  });
  const topSalespeople = Array.from(salesPersonMap.entries()).map(([id, data]) => ({ id, ...data })).sort((a, b) => b.totalGross - a.totalGross).slice(0, 5);
  return {
    date,
    totalDeals: deals.length,
    vehiclesSold: deals.length,
    totalRevenue,
    totalCost,
    totalGrossProfit,
    avgGrossPerDeal: totalGrossProfit / deals.length,
    frontEndGross,
    backEndGross,
    reserveGross,
    avgSellingPrice: totalRevenue / deals.length,
    avgDealCost: totalCost / deals.length,
    dealsByType,
    topSalespeople
  };
}
async function generateMonthlyPerformanceSummary(tenantId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  const prevMonthStart = new Date(year, month - 2, 1);
  const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);
  const deals = await prisma4.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startDate, lte: endDate }
    },
    include: {
      vehicle: true
    }
  });
  const delivered = deals.filter((d) => d.status === "DELIVERED" || d.status === "FUNDED");
  const pending = deals.filter((d) => d.status === "PENDING");
  const cancelled = deals.filter((d) => d.status === "CANCELLED");
  const vehicleSales = delivered.reduce((sum3, d) => {
    const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
    return sum3 + price;
  }, 0);
  const fiProducts = delivered.reduce((sum3, d) => {
    const fi = d.totalFiCents ? d.totalFiCents / 100 : 0;
    return sum3 + fi;
  }, 0);
  const serviceOrders = await prisma4.serviceOrder.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      status: "COMPLETED"
    }
  });
  const serviceRevenue = serviceOrders.reduce((sum3, so) => sum3 + parseFloat(so.totalPrice.toString()), 0);
  const frontEnd = delivered.reduce((sum3, d) => {
    const gross = d.frontGrossCents ? d.frontGrossCents / 100 : 0;
    return sum3 + gross;
  }, 0);
  const backEnd = delivered.reduce((sum3, d) => {
    const gross = d.backGrossCents ? d.backGrossCents / 100 : 0;
    return sum3 + gross;
  }, 0);
  const totalProfit = frontEnd + backEnd + serviceRevenue;
  const totalRevenue = vehicleSales + fiProducts + serviceRevenue;
  const profitMargin = totalRevenue > 0 ? totalProfit / totalRevenue * 100 : 0;
  const inventory = await prisma4.vehicle.findMany({
    where: {
      tenantId,
      status: { in: ["AVAILABLE", "PENDING", "RECON"] }
    }
  });
  const avgDaysInStock = inventory.length > 0 ? inventory.reduce((sum3, v) => sum3 + v.daysInStock, 0) / inventory.length : 0;
  const totalInventoryValue = inventory.reduce((sum3, v) => {
    const cost = v.costCents ? v.costCents / 100 : 0;
    return sum3 + cost;
  }, 0);
  const turnRate = avgDaysInStock > 0 ? 365 / avgDaysInStock : 0;
  const prevDeals = await prisma4.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: prevMonthStart, lte: prevMonthEnd },
      status: { in: ["DELIVERED", "FUNDED"] }
    }
  });
  const prevRevenue = prevDeals.reduce((sum3, d) => {
    const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
    return sum3 + price;
  }, 0);
  const prevProfit = prevDeals.reduce((sum3, d) => {
    const gross = d.totalGrossCents ? d.totalGrossCents / 100 : 0;
    return sum3 + gross;
  }, 0);
  const dealsChange = prevDeals.length > 0 ? (delivered.length - prevDeals.length) / prevDeals.length * 100 : 0;
  const revenueChange = prevRevenue > 0 ? (totalRevenue - prevRevenue) / prevRevenue * 100 : 0;
  const profitChange = prevProfit > 0 ? (totalProfit - prevProfit) / prevProfit * 100 : 0;
  return {
    month: `${year}-${String(month).padStart(2, "0")}`,
    deals: {
      total: deals.length,
      delivered: delivered.length,
      pending: pending.length,
      cancelled: cancelled.length
    },
    revenue: {
      vehicleSales,
      fiProducts,
      service: serviceRevenue,
      total: totalRevenue
    },
    profit: {
      frontEnd,
      backEnd,
      service: serviceRevenue,
      total: totalProfit,
      margin: profitMargin
    },
    inventory: {
      unitsInStock: inventory.length,
      avgDaysInStock,
      turnRate,
      totalValue: totalInventoryValue
    },
    comparedToLastMonth: {
      dealsChange,
      revenueChange,
      profitChange
    }
  };
}
async function generateSalespersonPerformance(tenantId, startDate, endDate) {
  const salespeople = await prisma4.user.findMany({
    where: {
      tenantId,
      role: { in: ["SALES", "SALES_MANAGER"] }
    }
  });
  const performances = [];
  for (const salesperson of salespeople) {
    const deals = await prisma4.deal.findMany({
      where: {
        tenantId,
        salesPersonId: salesperson.id,
        dealDate: { gte: startDate, lte: endDate }
      },
      include: {
        customer: true
      }
    });
    const delivered = deals.filter((d) => d.status === "DELIVERED" || d.status === "FUNDED");
    const pending = deals.filter((d) => d.status === "PENDING");
    const totalSales = delivered.reduce((sum3, d) => {
      const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
      return sum3 + price;
    }, 0);
    const totalGross = delivered.reduce((sum3, d) => {
      const gross = d.totalGrossCents ? d.totalGrossCents / 100 : 0;
      return sum3 + gross;
    }, 0);
    const frontEnd = delivered.reduce((sum3, d) => {
      const gross = d.frontGrossCents ? d.frontGrossCents / 100 : 0;
      return sum3 + gross;
    }, 0);
    const backEnd = delivered.reduce((sum3, d) => {
      const gross = d.backGrossCents ? d.backGrossCents / 100 : 0;
      return sum3 + gross;
    }, 0);
    const reserve = delivered.reduce((sum3, d) => {
      const gross = d.reserveGrossCents ? d.reserveGrossCents / 100 : 0;
      return sum3 + gross;
    }, 0);
    const commissions = await prisma4.commission.findMany({
      where: {
        userId: salesperson.id,
        tenantId,
        createdAt: { gte: startDate, lte: endDate }
      }
    });
    const commissionTotal = commissions.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0);
    const commissionPending = commissions.filter((c) => c.status === "PENDING").reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0);
    const commissionApproved = commissions.filter((c) => c.status === "APPROVED").reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0);
    const commissionPaid = commissions.filter((c) => c.status === "PAID").reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0);
    const totalLeads = await prisma4.lead.count({
      where: {
        tenantId,
        assignedToId: salesperson.id,
        createdAt: { gte: startDate, lte: endDate }
      }
    });
    const closeRate = totalLeads > 0 ? delivered.length / totalLeads * 100 : 0;
    const avgDaysToClose = delivered.length > 0 ? delivered.reduce((sum3, d) => {
      const created = new Date(d.createdAt);
      const dealDate = new Date(d.dealDate);
      const days = Math.floor((dealDate.getTime() - created.getTime()) / (1e3 * 60 * 60 * 24));
      return sum3 + days;
    }, 0) / delivered.length : 0;
    const avgGrossPerUnit = delivered.length > 0 ? totalGross / delivered.length : 0;
    performances.push({
      userId: salesperson.id,
      name: `${salesperson.firstName} ${salesperson.lastName}`,
      role: salesperson.role,
      period: { startDate, endDate },
      deals: {
        total: deals.length,
        delivered: delivered.length,
        pendingDelivery: pending.length,
        averagePerMonth: 0
        // Will calculate after sorting
      },
      revenue: {
        totalSales,
        avgPerDeal: delivered.length > 0 ? totalSales / delivered.length : 0
      },
      profit: {
        totalGross,
        avgPerDeal: delivered.length > 0 ? totalGross / delivered.length : 0,
        frontEnd,
        backEnd,
        reserve
      },
      commissions: {
        total: commissionTotal,
        pending: commissionPending,
        approved: commissionApproved,
        paid: commissionPaid
      },
      metrics: {
        closeRate,
        avgDaysToClose,
        avgGrossPerUnit
      },
      ranking: {
        byDealsCount: 0,
        byTotalGross: 0,
        byAvgGross: 0
      }
    });
  }
  const sortedByDeals = [...performances].sort((a, b) => b.deals.delivered - a.deals.delivered);
  const sortedByGross = [...performances].sort((a, b) => b.profit.totalGross - a.profit.totalGross);
  const sortedByAvgGross = [...performances].sort((a, b) => b.profit.avgPerDeal - a.profit.avgPerDeal);
  performances.forEach((perf) => {
    perf.ranking.byDealsCount = sortedByDeals.findIndex((p) => p.userId === perf.userId) + 1;
    perf.ranking.byTotalGross = sortedByGross.findIndex((p) => p.userId === perf.userId) + 1;
    perf.ranking.byAvgGross = sortedByAvgGross.findIndex((p) => p.userId === perf.userId) + 1;
  });
  return performances;
}
async function generateDepartmentPerformance(tenantId, startDate, endDate) {
  const deals = await prisma4.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startDate, lte: endDate },
      status: { in: ["DELIVERED", "FUNDED"] }
    },
    include: {
      vehicle: true
    }
  });
  const newDeals = deals.filter((d) => d.vehicle.condition === "NEW");
  const usedDeals = deals.filter((d) => d.vehicle.condition === "USED");
  const calcMetrics = (dealList) => {
    const units = dealList.length;
    const revenue = dealList.reduce((sum3, d) => {
      const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
      return sum3 + price;
    }, 0);
    const gross = dealList.reduce((sum3, d) => {
      const g = d.totalGrossCents ? d.totalGrossCents / 100 : 0;
      return sum3 + g;
    }, 0);
    const margin = revenue > 0 ? gross / revenue * 100 : 0;
    return { unitsSold: units, revenue, grossProfit: gross, margin };
  };
  const newMetrics = calcMetrics(newDeals);
  const usedMetrics = calcMetrics(usedDeals);
  const totalMetrics = calcMetrics(deals);
  const dealsWithFI = deals.filter((d) => (d.totalFiCents ?? 0) > 0).length;
  const fiRevenue = deals.reduce((sum3, d) => {
    const fi = d.totalFiCents ? d.totalFiCents / 100 : 0;
    return sum3 + fi;
  }, 0);
  const reserveRevenue = deals.reduce((sum3, d) => {
    const r = d.reserveGrossCents ? d.reserveGrossCents / 100 : 0;
    return sum3 + r;
  }, 0);
  const totalFIGross = deals.reduce((sum3, d) => {
    const back = d.backGrossCents ? d.backGrossCents / 100 : 0;
    const reserve = d.reserveGrossCents ? d.reserveGrossCents / 100 : 0;
    return sum3 + back + reserve;
  }, 0);
  const penetrationRate = deals.length > 0 ? dealsWithFI / deals.length * 100 : 0;
  const avgFIPerDeal = deals.length > 0 ? totalFIGross / deals.length : 0;
  const serviceOrders = await prisma4.serviceOrder.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      status: "COMPLETED"
    }
  });
  const serviceRevenue = serviceOrders.reduce((sum3, so) => sum3 + parseFloat(so.totalPrice.toString()), 0);
  const serviceCost = serviceOrders.reduce((sum3, so) => sum3 + parseFloat(so.laborCost.toString()) + parseFloat(so.partsCost.toString()), 0);
  const serviceGross = serviceRevenue - serviceCost;
  const serviceMargin = serviceRevenue > 0 ? serviceGross / serviceRevenue * 100 : 0;
  const avgRO = serviceOrders.length > 0 ? serviceRevenue / serviceOrders.length : 0;
  const totalRevenue = totalMetrics.revenue + fiRevenue + serviceRevenue;
  const totalGrossProfit = totalMetrics.grossProfit + totalFIGross + serviceGross;
  const overallMargin = totalRevenue > 0 ? totalGrossProfit / totalRevenue * 100 : 0;
  return {
    period: { startDate, endDate },
    sales: {
      newVehicles: newMetrics,
      usedVehicles: usedMetrics,
      total: totalMetrics
    },
    finance: {
      dealsFinanced: dealsWithFI,
      fiRevenue,
      reserveRevenue,
      totalGross: totalFIGross,
      penetrationRate,
      avgPerDeal: avgFIPerDeal
    },
    service: {
      roCount: serviceOrders.length,
      revenue: serviceRevenue,
      grossProfit: serviceGross,
      margin: serviceMargin,
      avgRO
    },
    totals: {
      totalRevenue,
      totalGrossProfit,
      overallMargin
    }
  };
}

// src/routes/accounting.routes.ts
import { JournalEntryType as JournalEntryType2, LineType as LineType2 } from "@prisma/client";
var accountingRouter = Router25();
accountingRouter.get(
  "/gl-accounts/initialize",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const accounts = await ensureStandardGLAccounts(tenantId);
      res.json({
        data: Array.from(accounts.values()),
        meta: {
          count: accounts.size
        }
      });
    } catch (error) {
      console.error("GL account initialization error:", error);
      next(error);
    }
  }
);
var createJournalEntrySchema = z19.object({
  entryType: z19.nativeEnum(JournalEntryType2),
  memo: z19.string().min(1),
  postingDate: z19.string().datetime().optional(),
  dealId: z19.string().optional(),
  lines: z19.array(
    z19.object({
      glAccountId: z19.string(),
      type: z19.nativeEnum(LineType2),
      amount: z19.number().positive(),
      description: z19.string().optional()
    })
  ).min(2)
});
accountingRouter.post(
  "/journal-entries",
  async (req, res, next) => {
    try {
      const validation = createJournalEntrySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const userId = req.userId;
      const data = validation.data;
      const entry = await createJournalEntry({
        tenantId,
        entryType: data.entryType,
        memo: data.memo,
        postingDate: data.postingDate ? new Date(data.postingDate) : /* @__PURE__ */ new Date(),
        userId,
        dealId: data.dealId,
        lines: data.lines
      });
      res.status(201).json({ data: entry });
    } catch (error) {
      console.error("Journal entry creation error:", error);
      if (error.message.includes("not balanced")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);
accountingRouter.post(
  "/journal-entries/:id/post",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;
      const userId = req.userId;
      const entry = await postJournalEntry(id, tenantId, userId);
      res.json({ data: entry });
    } catch (error) {
      console.error("Journal entry posting error:", error);
      if (error.message === "Journal entry not found" || error.message.includes("already posted")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);
accountingRouter.post(
  "/deals/:dealId/post-journal-entry",
  async (req, res, next) => {
    try {
      const { dealId } = req.params;
      const tenantId = req.tenantId;
      const userId = req.userId;
      const entry = await postDealJournalEntry({
        dealId,
        tenantId,
        userId,
        postingDate: req.body.postingDate ? new Date(req.body.postingDate) : void 0
      });
      res.status(201).json({ data: entry });
    } catch (error) {
      console.error("Deal journal entry error:", error);
      if (error.message === "Deal not found") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
accountingRouter.get(
  "/reports/profit-loss",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date((/* @__PURE__ */ new Date()).setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate) : /* @__PURE__ */ new Date();
      const statement = await generateProfitLoss(tenantId, startDate, endDate);
      res.json({ data: statement });
    } catch (error) {
      console.error("P&L generation error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/reports/balance-sheet",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : /* @__PURE__ */ new Date();
      const statement = await generateBalanceSheet(tenantId, asOfDate);
      res.json({ data: statement });
    } catch (error) {
      console.error("Balance sheet generation error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/reports/cash-reconciliation",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const date = req.query.date ? new Date(req.query.date) : /* @__PURE__ */ new Date();
      const reconciliation = await generateCashReconciliation(tenantId, date);
      res.json({ data: reconciliation });
    } catch (error) {
      console.error("Cash reconciliation error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/reports/deal-profit-analysis",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date((/* @__PURE__ */ new Date()).setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate) : /* @__PURE__ */ new Date();
      const analysis = await getDealProfitAnalysis(tenantId, startDate, endDate);
      res.json({
        data: analysis,
        meta: {
          total: analysis.length,
          totalGross: analysis.reduce((sum3, d) => sum3 + d.totalGross, 0),
          avgGross: analysis.length > 0 ? analysis.reduce((sum3, d) => sum3 + d.totalGross, 0) / analysis.length : 0
        }
      });
    } catch (error) {
      console.error("Deal profit analysis error:", error);
      next(error);
    }
  }
);
accountingRouter.post(
  "/deals/:dealId/calculate-commissions",
  async (req, res, next) => {
    try {
      const { dealId } = req.params;
      const tenantId = req.tenantId;
      const userId = req.userId;
      const calculations = await calculateDealCommissions({ dealId, tenantId, userId });
      res.json({ data: calculations });
    } catch (error) {
      console.error("Commission calculation error:", error);
      if (error.message === "Deal not found") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
);
accountingRouter.post(
  "/deals/:dealId/auto-calculate-commissions",
  async (req, res, next) => {
    try {
      const { dealId } = req.params;
      const tenantId = req.tenantId;
      const userId = req.userId;
      const commissions = await autoCalculateCommissions(dealId, tenantId, userId);
      res.status(201).json({
        data: commissions,
        meta: {
          count: commissions.length,
          totalAmount: commissions.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0)
        }
      });
    } catch (error) {
      console.error("Auto commission calculation error:", error);
      if (error.message === "Deal not found" || error.message.includes("already calculated")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);
accountingRouter.get(
  "/commissions/pending",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const commissions = await getPendingCommissions(tenantId);
      res.json({
        data: commissions,
        meta: {
          count: commissions.length,
          totalAmount: commissions.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0)
        }
      });
    } catch (error) {
      console.error("Pending commissions error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/commissions/approved",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const commissions = await getApprovedCommissions(tenantId);
      res.json({
        data: commissions,
        meta: {
          count: commissions.length,
          totalAmount: commissions.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0)
        }
      });
    } catch (error) {
      console.error("Approved commissions error:", error);
      next(error);
    }
  }
);
accountingRouter.post(
  "/commissions/approve",
  async (req, res, next) => {
    try {
      const { commissionIds } = req.body;
      const tenantId = req.tenantId;
      const userId = req.userId;
      if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
        return res.status(400).json({ error: "commissionIds array required" });
      }
      const approved = await approveCommissions(commissionIds, tenantId, userId);
      res.json({ data: approved });
    } catch (error) {
      console.error("Commission approval error:", error);
      next(error);
    }
  }
);
var markPaidSchema = z19.object({
  commissionIds: z19.array(z19.string()).min(1),
  paymentDate: z19.string().datetime(),
  paymentMethod: z19.string().min(1),
  notes: z19.string().optional()
});
accountingRouter.post(
  "/commissions/mark-paid",
  async (req, res, next) => {
    try {
      const validation = markPaidSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.errors
        });
      }
      const tenantId = req.tenantId;
      const data = validation.data;
      const paid = await markCommissionsPaid({
        ...data,
        tenantId,
        paymentDate: new Date(data.paymentDate)
      });
      res.json({ data: paid });
    } catch (error) {
      console.error("Mark paid error:", error);
      if (error.message.includes("not found") || error.message.includes("unapproved")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);
accountingRouter.post(
  "/commissions/:id/chargeback",
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const tenantId = req.tenantId;
      if (!reason) {
        return res.status(400).json({ error: "Chargeback reason required" });
      }
      const commission = await chargebackCommission(id, tenantId, reason);
      res.json({ data: commission });
    } catch (error) {
      console.error("Chargeback error:", error);
      if (error.message.includes("not found") || error.message.includes("already charged back")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);
accountingRouter.get(
  "/commissions/summary",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const summary = await getCommissionSummary(tenantId);
      res.json({ data: summary });
    } catch (error) {
      console.error("Commission summary error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/users/:userId/commissions",
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const tenantId = req.tenantId;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date((/* @__PURE__ */ new Date()).setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate) : /* @__PURE__ */ new Date();
      const commissions = await getUserCommissions(userId, tenantId, startDate, endDate);
      res.json({
        data: commissions,
        meta: {
          count: commissions.length,
          totalAmount: commissions.reduce((sum3, c) => sum3 + parseFloat(c.amount.toString()), 0)
        }
      });
    } catch (error) {
      console.error("User commissions error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/reports/commission-report",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date((/* @__PURE__ */ new Date()).setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate) : /* @__PURE__ */ new Date();
      const report = await generateCommissionReport(tenantId, startDate, endDate);
      res.json({ data: report });
    } catch (error) {
      console.error("Commission report error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/reports/daily-sales",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const date = req.query.date ? new Date(req.query.date) : /* @__PURE__ */ new Date();
      const summary = await generateDailySalesSummary(tenantId, date);
      res.json({ data: summary });
    } catch (error) {
      console.error("Daily sales summary error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/reports/monthly-performance",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const year = req.query.year ? parseInt(req.query.year) : (/* @__PURE__ */ new Date()).getFullYear();
      const month = req.query.month ? parseInt(req.query.month) : (/* @__PURE__ */ new Date()).getMonth() + 1;
      const summary = await generateMonthlyPerformanceSummary(tenantId, year, month);
      res.json({ data: summary });
    } catch (error) {
      console.error("Monthly performance error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/reports/salesperson-performance",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date((/* @__PURE__ */ new Date()).setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate) : /* @__PURE__ */ new Date();
      const report = await generateSalespersonPerformance(tenantId, startDate, endDate);
      res.json({
        data: report,
        meta: {
          totalSalespeople: report.length,
          topPerformer: report.length > 0 ? report.reduce((best, sp) => sp.profit.totalGross > best.profit.totalGross ? sp : best) : null
        }
      });
    } catch (error) {
      console.error("Salesperson performance error:", error);
      next(error);
    }
  }
);
accountingRouter.get(
  "/reports/department-performance",
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date((/* @__PURE__ */ new Date()).setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate) : /* @__PURE__ */ new Date();
      const report = await generateDepartmentPerformance(tenantId, startDate, endDate);
      res.json({ data: report });
    } catch (error) {
      console.error("Department performance error:", error);
      next(error);
    }
  }
);

// src/routes/insights.ts
import { Router as Router26 } from "express";
import { z as z20 } from "zod";

// src/services/insights/evaluator.ts
import { PrismaClient as PrismaClient3 } from "@repo/db";

// src/services/insights/fetchers.ts
import { PrismaClient as PrismaClient2 } from "@repo/db";
var prisma5 = new PrismaClient2();
async function executeQuery(query, args) {
  return prisma5.$queryRawUnsafe(query, ...args || []);
}

// src/services/insights/evaluator.ts
var prisma6 = new PrismaClient3();
var INSIGHTS_ENABLED = process.env.INSIGHTS_ENABLED === "true";
async function isRuleMuted(tenantId, userId, ruleKey) {
  const mutes = await prisma6.insightMute.findMany({
    where: {
      tenantId,
      ruleKey,
      OR: [{ userId: userId || null }, { userId: null }]
    }
  });
  const now = /* @__PURE__ */ new Date();
  return mutes.some((mute) => !mute.until || mute.until > now);
}
async function isInCooldown(tenantId, userId, ruleKey, cooldownMinutes) {
  const cooldownThreshold = new Date(Date.now() - cooldownMinutes * 60 * 1e3);
  const recentItems = await prisma6.insightQueue.count({
    where: {
      tenantId,
      userId: userId || void 0,
      ruleKey,
      createdAt: { gte: cooldownThreshold }
    }
  });
  return recentItems > 0;
}
async function evaluateRule(rule, context) {
  const startTime = Date.now();
  try {
    if (await isRuleMuted(context.tenantId, context.userId, rule.key)) {
      return { matched: false, executionTimeMs: Date.now() - startTime };
    }
    if (rule.cooldownMinutes && await isInCooldown(context.tenantId, context.userId, rule.key, rule.cooldownMinutes)) {
      return { matched: false, executionTimeMs: Date.now() - startTime };
    }
    const predicateCtx = {
      tenantId: context.tenantId,
      userId: context.userId,
      role: context.role,
      now: context.now,
      fetch: async (query, args) => {
        return executeQuery(query, args);
      }
    };
    const matched = await rule.when(predicateCtx);
    if (!matched) {
      return { matched: false, executionTimeMs: Date.now() - startTime };
    }
    const score = rule.score ? await rule.score(predicateCtx) : 0.5;
    const message = await rule.message(predicateCtx);
    return {
      matched: true,
      score,
      message,
      executionTimeMs: Date.now() - startTime
    };
  } catch (error) {
    return {
      matched: false,
      error: error.message,
      executionTimeMs: Date.now() - startTime
    };
  }
}
async function evaluateRules(context) {
  if (!INSIGHTS_ENABLED) {
    return;
  }
  const rules = [];
  for (const rule of rules) {
    const hasAccess = rule.audience.userIds?.includes(context.userId) || rule.audience.roles.includes(context.role);
    if (!hasAccess) {
      continue;
    }
    const result = await evaluateRule(rule, context);
    if (result.matched && result.message) {
      const expiresAt = rule.ttlMinutes ? new Date(Date.now() + rule.ttlMinutes * 60 * 1e3) : null;
      await prisma6.insightQueue.upsert({
        where: {
          // Composite key would be ideal, but we'll use create/update pattern
          id: "temp"
          // This will be replaced by actual logic
        },
        create: {
          tenantId: context.tenantId,
          role: context.role,
          userId: rule.audience.userIds?.includes(context.userId) ? context.userId : void 0,
          ruleKey: rule.key,
          severity: rule.severity,
          score: result.score || 0.5,
          message: result.message,
          card: rule.card,
          state: "new",
          expiresAt: expiresAt || void 0
        },
        update: {
          score: result.score || 0.5,
          message: result.message,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
    }
  }
}
async function dryRunEvaluation(context) {
  const rules = [];
  const results = [];
  for (const rule of rules) {
    const hasAccess = rule.audience.userIds?.includes(context.userId) || rule.audience.roles.includes(context.role);
    if (!hasAccess) {
      continue;
    }
    const result = await evaluateRule(rule, context);
    results.push({
      ruleKey: rule.key,
      domain: rule.domain,
      severity: rule.severity,
      ...result
    });
  }
  return results;
}

// src/services/insights/queue.ts
import { PrismaClient as PrismaClient4 } from "@repo/db";
import { cuid } from "@paralleldrive/cuid2";
var prisma7 = new PrismaClient4();
async function getQueue(tenantId, role, userId) {
  const now = /* @__PURE__ */ new Date();
  return prisma7.insightQueue.findMany({
    where: {
      tenantId,
      role,
      userId: userId || void 0,
      state: { in: ["new", "seen"] },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ],
      AND: [
        {
          OR: [
            { snoozeUntil: null },
            { snoozeUntil: { lte: now } }
          ]
        }
      ]
    },
    orderBy: [
      { score: "desc" },
      { createdAt: "desc" }
    ]
  });
}
async function ackInsight(id, userId) {
  const insight = await prisma7.insightQueue.findUnique({
    where: { id }
  });
  if (!insight) {
    throw new Error("Insight not found");
  }
  return prisma7.insightQueue.update({
    where: { id },
    data: {
      state: "done",
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
}
async function snoozeInsight(id, minutes, userId) {
  const insight = await prisma7.insightQueue.findUnique({
    where: { id }
  });
  if (!insight) {
    throw new Error("Insight not found");
  }
  const snoozeUntil = new Date(Date.now() + minutes * 60 * 1e3);
  return prisma7.insightQueue.update({
    where: { id },
    data: {
      state: "seen",
      snoozeUntil,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
}
async function muteRule(tenantId, ruleKey, minutes, userId) {
  const until = minutes ? new Date(Date.now() + minutes * 60 * 1e3) : null;
  const existingMute = await prisma7.insightMute.findFirst({
    where: {
      tenantId,
      ruleKey,
      userId: userId || null
    }
  });
  if (existingMute) {
    return prisma7.insightMute.update({
      where: { id: existingMute.id },
      data: {
        until,
        createdAt: /* @__PURE__ */ new Date()
        // Reset creation time
      }
    });
  }
  return prisma7.insightMute.create({
    data: {
      id: cuid(),
      tenantId,
      ruleKey,
      userId: userId || null,
      until,
      createdAt: /* @__PURE__ */ new Date()
    }
  });
}
async function unmuteRule(tenantId, ruleKey, userId) {
  const mute = await prisma7.insightMute.findFirst({
    where: {
      tenantId,
      ruleKey,
      userId: userId || null
    }
  });
  if (!mute) {
    throw new Error("Mute not found");
  }
  return prisma7.insightMute.delete({
    where: { id: mute.id }
  });
}
async function getMutes(tenantId, userId) {
  const now = /* @__PURE__ */ new Date();
  return prisma7.insightMute.findMany({
    where: {
      tenantId,
      userId: userId || void 0,
      OR: [
        { until: null },
        { until: { gt: now } }
      ]
    },
    orderBy: { createdAt: "desc" }
  });
}
async function cleanupExpired(tenantId) {
  const now = /* @__PURE__ */ new Date();
  const [deletedInsights, deletedMutes] = await Promise.all([
    // Delete expired insights
    prisma7.insightQueue.deleteMany({
      where: {
        tenantId,
        expiresAt: { lte: now }
      }
    }),
    // Delete expired mutes
    prisma7.insightMute.deleteMany({
      where: {
        tenantId,
        until: { lte: now }
      }
    })
  ]);
  return {
    deletedInsights: deletedInsights.count,
    deletedMutes: deletedMutes.count
  };
}

// src/routes/insights.ts
var router4 = Router26();
var dryRunSchema = z20.object({
  role: z20.string().optional(),
  userId: z20.string().optional()
});
var ackSchema = z20.object({
  id: z20.string().min(1)
});
var snoozeSchema = z20.object({
  id: z20.string().min(1),
  minutes: z20.number().min(1).max(10080)
  // Max 1 week
});
var muteSchema = z20.object({
  ruleKey: z20.string().min(1),
  minutes: z20.number().min(1).optional(),
  userId: z20.string().optional()
});
var unmuteSchema = z20.object({
  ruleKey: z20.string().min(1),
  userId: z20.string().optional()
});
var evaluateSchema = z20.object({
  role: z20.string().optional(),
  userId: z20.string().optional()
});
router4.get("/rules", async (req, res) => {
  try {
    res.json({
      rules: [],
      count: 0
    });
  } catch (error) {
    console.error("Failed to list rules:", error);
    res.status(500).json({ error: "Failed to list rules" });
  }
});
router4.post("/evaluate/dry-run", async (req, res) => {
  try {
    const body = dryRunSchema.parse(req.body);
    const tenantId = req.tenantId;
    const userId = body.userId || req.user?.id;
    const role = body.role || req.user?.roles?.[0] || "sales";
    const results = await dryRunEvaluation({
      tenantId,
      userId,
      role,
      now: /* @__PURE__ */ new Date()
    });
    res.json({
      results,
      count: results.length,
      matched: results.filter((r) => r.matched).length
    });
  } catch (error) {
    if (error instanceof z20.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Failed to run dry-run evaluation:", error);
    res.status(500).json({ error: "Failed to run evaluation" });
  }
});
router4.post("/evaluate", async (req, res) => {
  try {
    const body = evaluateSchema.parse(req.body);
    const tenantId = req.tenantId;
    const userId = body.userId || req.user?.id;
    const role = body.role || req.user?.roles?.[0] || "sales";
    await evaluateRules({
      tenantId,
      userId,
      role,
      now: /* @__PURE__ */ new Date()
    });
    res.json({ success: true, message: "Evaluation completed" });
  } catch (error) {
    if (error instanceof z20.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Failed to run evaluation:", error);
    res.status(500).json({ error: "Failed to run evaluation" });
  }
});
router4.get("/queue", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user?.id;
    const role = req.query.role || req.user?.roles?.[0] || "sales";
    const queue3 = await getQueue(tenantId, role, userId);
    res.json({
      queue: queue3,
      count: queue3.length
    });
  } catch (error) {
    console.error("Failed to get queue:", error);
    res.status(500).json({ error: "Failed to get queue" });
  }
});
router4.post("/queue/ack", async (req, res) => {
  try {
    const body = ackSchema.parse(req.body);
    const userId = req.user.id;
    const updated = await ackInsight(body.id, userId);
    res.json(updated);
  } catch (error) {
    if (error instanceof z20.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Failed to acknowledge insight:", error);
    res.status(500).json({ error: "Failed to acknowledge insight" });
  }
});
router4.post("/queue/snooze", async (req, res) => {
  try {
    const body = snoozeSchema.parse(req.body);
    const userId = req.user.id;
    const updated = await snoozeInsight(body.id, body.minutes, userId);
    res.json(updated);
  } catch (error) {
    if (error instanceof z20.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Failed to snooze insight:", error);
    res.status(500).json({ error: "Failed to snooze insight" });
  }
});
router4.post("/mute", async (req, res) => {
  try {
    const body = muteSchema.parse(req.body);
    const tenantId = req.tenantId;
    const userId = body.userId || req.user?.id;
    const mute = await muteRule(tenantId, body.ruleKey, body.minutes, userId);
    res.json(mute);
  } catch (error) {
    if (error instanceof z20.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Failed to mute rule:", error);
    res.status(500).json({ error: "Failed to mute rule" });
  }
});
router4.delete("/mute/:ruleKey", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const ruleKey = req.params.ruleKey;
    const userId = req.user?.id;
    await unmuteRule(tenantId, ruleKey, userId);
    res.status(204).send();
  } catch (error) {
    console.error("Failed to unmute rule:", error);
    res.status(500).json({ error: "Failed to unmute rule" });
  }
});
router4.get("/mutes", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user?.id;
    const mutes = await getMutes(tenantId, userId);
    res.json({
      mutes,
      count: mutes.length
    });
  } catch (error) {
    console.error("Failed to get mutes:", error);
    res.status(500).json({ error: "Failed to get mutes" });
  }
});
router4.post("/cleanup", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const result = await cleanupExpired(tenantId);
    res.json(result);
  } catch (error) {
    console.error("Failed to cleanup expired items:", error);
    res.status(500).json({ error: "Failed to cleanup" });
  }
});
var insights_default = router4;

// src/routes/index.ts
function registerRoutes(app) {
  app.use("/", router);
  app.use("/api/auth", router3);
  const apiRouter = Router27();
  apiRouter.use(authenticate);
  apiRouter.use(tenantScope);
  apiRouter.use("/leads", leadRouter);
  apiRouter.use("/activities", activityRouter);
  apiRouter.use("/communications", communicationRouter);
  apiRouter.use("/appointments", appointmentRouter);
  apiRouter.use("/automations", automationRouter);
  apiRouter.use("/timeline", timeline_routes_default);
  apiRouter.use("/ml", mlRouter);
  apiRouter.use("/fi", fiRouter);
  apiRouter.use("/desking", deskingRouter);
  apiRouter.use("/pricing", pricingRouter);
  apiRouter.use("/customers", customerRouter);
  apiRouter.use("/vehicles", vehicleRouter);
  apiRouter.use("/dashboard", dashboardRouter);
  apiRouter.use("/search", searchRouter);
  apiRouter.use("/pipeline", pipelineRouter);
  apiRouter.use("/service-orders", serviceOrderRouter);
  apiRouter.use("/inventory", inventoryRouter);
  apiRouter.use("/pricing-intelligence", pricingIntelligenceRouter);
  apiRouter.use("/merchandising", merchandisingRouter);
  apiRouter.use("/appraisals", appraisalRouter);
  apiRouter.use("/accounting", accountingRouter);
  apiRouter.use("/insights", insights_default);
  const leadRoutingRoles = ["ADMIN", "BDC", "SALES"];
  apiRouter.post(
    "/lead-routing/test",
    requireRole(...leadRoutingRoles),
    async (req, res, next) => {
      try {
        const result = await simulateLeadRouting(req.body ?? {});
        res.json({ data: result });
      } catch (error) {
        next(error);
      }
    }
  );
  app.use("/api", webhooks_routes_default);
  app.use("/api", apiRouter);
}

// src/integrations/fi.integration.ts
async function primeCreditSubmissionDraft(payload) {
  await prisma.creditSubmissionDraft.upsert({
    where: {
      tenantId_versionId: {
        tenantId: payload.tenantId,
        versionId: payload.versionId
      }
    },
    update: {
      payload: toInputJson({
        structure: payload.structure,
        totals: payload.totals,
        payment: payload.payment,
        vehicleId: payload.vehicleId,
        customerId: payload.customerId,
        dealId: payload.dealId,
        worksheetId: payload.worksheetId,
        selectedBy: payload.selectedBy,
        preparedAt: (/* @__PURE__ */ new Date()).toISOString()
      }),
      status: "PENDING"
    },
    create: {
      tenantId: payload.tenantId,
      dealId: payload.dealId,
      worksheetId: payload.worksheetId,
      versionId: payload.versionId,
      payload: toInputJson({
        structure: payload.structure,
        totals: payload.totals,
        payment: payload.payment,
        vehicleId: payload.vehicleId,
        customerId: payload.customerId,
        dealId: payload.dealId,
        worksheetId: payload.worksheetId,
        selectedBy: payload.selectedBy,
        preparedAt: (/* @__PURE__ */ new Date()).toISOString()
      }),
      status: "PENDING"
    }
  });
}

// src/integrations/inventory.integration.ts
import { Prisma as Prisma13, VehicleStatus as VehicleStatus2 } from "@prisma/client";
function isPrismaNotFound(error) {
  return error instanceof Prisma13.PrismaClientKnownRequestError && (error.code === "P2025" || error.code === "P2001");
}
async function updateVehicle2(vehicleId, data) {
  try {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data
    });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return;
    }
    throw error;
  }
}
async function refreshVehicleAging(tenantId, vehicleId) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { dateReceived: true }
  });
  if (!vehicle?.dateReceived) {
    return;
  }
  const now = /* @__PURE__ */ new Date();
  const millis = now.getTime() - vehicle.dateReceived.getTime();
  const daysInStock = Math.max(0, Math.floor(millis / (1e3 * 60 * 60 * 24)));
  await updateVehicle2(vehicleId, { daysInStock });
  await emitEvent(EVENT_TOPICS.INVENTORY_DAYS_IN_STOCK_UPDATED, {
    tenantId,
    vehicleId,
    daysInStock
  });
}
async function reserveVehicleInventory(tenantId, dealId, worksheetId, vehicleId) {
  await updateVehicle2(vehicleId, {
    status: VehicleStatus2.PENDING
  });
  await emitEvent(EVENT_TOPICS.INVENTORY_VEHICLE_RESERVED, {
    tenantId,
    dealId,
    vehicleId,
    reservedByWorksheetId: worksheetId
  });
  await refreshVehicleAging(tenantId, vehicleId);
}
async function releaseVehicleInventory(tenantId, dealId, worksheetId, vehicleId, releaseReason) {
  const nextStatus = releaseReason === "CLOSED" ? VehicleStatus2.SOLD : VehicleStatus2.AVAILABLE;
  const update = {
    status: nextStatus
  };
  if (releaseReason === "CLOSED") {
    update.dateSold = /* @__PURE__ */ new Date();
  }
  await updateVehicle2(vehicleId, update);
  await emitEvent(EVENT_TOPICS.INVENTORY_VEHICLE_RELEASED, {
    tenantId,
    dealId,
    vehicleId,
    releasedByWorksheetId: worksheetId,
    status: releaseReason
  });
  await refreshVehicleAging(tenantId, vehicleId);
}

// src/integrations/crm.integration.ts
import { ActivityStatus as ActivityStatus8, ActivityType as ActivityType8 } from "@prisma/client";
function optionalConnect(id) {
  if (!id) {
    return void 0;
  }
  return { connect: { id } };
}
async function appendDealTimelineEntry(params) {
  await prisma.activity.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      customer: optionalConnect(params.customerId),
      user: optionalConnect(params.salespersonId ?? void 0),
      type: ActivityType8.NOTE,
      status: ActivityStatus8.COMPLETED,
      subject: params.title,
      description: params.description,
      completedAt: params.occurredAt ?? /* @__PURE__ */ new Date(),
      metadata: toInputJson({
        dealId: params.dealId,
        timeline: true
      })
    }
  });
}
async function scheduleDealFollowUp(params) {
  const dueAt = new Date(Date.now() + (params.dueInHours ?? 24) * 60 * 60 * 1e3);
  await prisma.activity.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      customer: optionalConnect(params.customerId),
      user: optionalConnect(params.salespersonId ?? void 0),
      type: ActivityType8.TASK,
      status: ActivityStatus8.PENDING,
      subject: params.subject,
      dueAt,
      metadata: toInputJson({
        dealId: params.dealId,
        followUp: true
      })
    }
  });
}

// src/integrations/accounting.integration.ts
import { CommissionType as CommissionType2, JournalStatus as JournalStatus2, LineType as LineType3, Prisma as Prisma15 } from "@prisma/client";
var FRONT_REVENUE_ACCOUNT = "4000";
var BACKEND_REVENUE_ACCOUNT = "4100";
var COST_OF_SALE_ACCOUNT = "5000";
async function resolvePoster(tenantId, preferredUserId) {
  if (preferredUserId) {
    return preferredUserId;
  }
  const fallback = await prisma.user.findFirst({
    where: { tenantId },
    select: { id: true },
    orderBy: { createdAt: "asc" }
  });
  if (!fallback) {
    throw new Error("Unable to resolve posting user for accounting entry");
  }
  return fallback.id;
}
async function loadGlAccountIds(tenantId) {
  const accounts = await prisma.gLAccount.findMany({
    where: {
      tenantId,
      accountNumber: {
        in: [FRONT_REVENUE_ACCOUNT, BACKEND_REVENUE_ACCOUNT, COST_OF_SALE_ACCOUNT]
      }
    },
    select: { id: true, accountNumber: true }
  });
  const map = new Map(accounts.map((account) => [account.accountNumber, account.id]));
  if (!map.has(FRONT_REVENUE_ACCOUNT) || !map.has(BACKEND_REVENUE_ACCOUNT) || !map.has(COST_OF_SALE_ACCOUNT)) {
    throw new Error("Required GL accounts are not configured for accounting integration");
  }
  return map;
}
function toDecimal(value) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return new Prisma15.Decimal(Number.isFinite(numberValue) ? numberValue : 0);
}
async function createDealCloseJournal(params) {
  const frontGross = Number(params.totals?.frontEndGross ?? 0);
  const backGross = Number(params.totals?.backEndGross ?? 0);
  const reserve = Number(params.totals?.financeReserve ?? 0);
  const postedById = await resolvePoster(params.tenantId, params.salespersonId ?? void 0);
  const accountMap = await loadGlAccountIds(params.tenantId);
  const lines = [];
  if (frontGross > 0) {
    lines.push({
      tenant: { connect: { id: params.tenantId } },
      glAccount: { connect: { id: accountMap.get(FRONT_REVENUE_ACCOUNT) } },
      type: LineType3.CREDIT,
      amount: toDecimal(frontGross),
      description: "Front-end gross recognition"
    });
    lines.push({
      tenant: { connect: { id: params.tenantId } },
      glAccount: { connect: { id: accountMap.get(COST_OF_SALE_ACCOUNT) } },
      type: LineType3.DEBIT,
      amount: toDecimal(frontGross),
      description: "Cost of sale offset"
    });
  }
  const backendTotal = backGross + reserve;
  if (backendTotal > 0) {
    lines.push({
      tenant: { connect: { id: params.tenantId } },
      glAccount: { connect: { id: accountMap.get(BACKEND_REVENUE_ACCOUNT) } },
      type: LineType3.CREDIT,
      amount: toDecimal(backendTotal),
      description: "Backend and reserve accrual"
    });
  }
  if (!lines.length) {
    return "";
  }
  const journal = await prisma.journalEntry.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      deal: { connect: { id: params.dealId } },
      entryNumber: `DEAL-${params.dealId}-${Date.now()}`,
      memo: "Deal close posting",
      status: JournalStatus2.DRAFT,
      postingDate: /* @__PURE__ */ new Date(),
      postedBy: { connect: { id: postedById } },
      lines: { create: lines }
    },
    select: { id: true }
  });
  await emitEvent(EVENT_TOPICS.ACCOUNTING_JOURNAL_CREATED, {
    tenantId: params.tenantId,
    dealId: params.dealId,
    journalEntryId: journal.id
  });
  return journal.id;
}
async function createSalesCommissionStub(params) {
  if (!params.salespersonId || params.frontGross <= 0) {
    return;
  }
  const commissionAmount = params.frontGross * 0.25;
  await prisma.commission.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      deal: { connect: { id: params.dealId } },
      user: { connect: { id: params.salespersonId } },
      commissionType: CommissionType2.FRONT,
      amount: new Prisma15.Decimal(commissionAmount),
      rate: new Prisma15.Decimal(25),
      notes: "Auto-generated on deal close"
    }
  });
}

// src/services/dealEventLog.service.ts
async function recordDealEvent(params) {
  await prisma.auditLog.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      user: params.userId ? { connect: { id: params.userId } } : void 0,
      action: "DEAL_EVENT",
      resource: `deal:${params.dealId}`,
      details: params.payload ? toInputJson({ event: params.event, ...params.payload }) : toInputJson({ event: params.event })
    }
  });
}

// src/integrations/index.ts
var subscriptions = [];
var initialized2 = false;
function register(subscription) {
  subscriptions.push(subscription);
}
function logIntegrationError(topic, error) {
  console.error(`[integration] ${topic} handler failed`, error);
}
function initializeDomainIntegrations() {
  if (initialized2) {
    return;
  }
  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_WORKSHEET_CREATED, async (event) => {
      try {
        await reserveVehicleInventory(
          event.payload.tenantId,
          event.payload.dealId,
          event.payload.worksheetId,
          event.payload.vehicleId
        );
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.salespersonId ?? void 0,
          event: "WORKSHEET_CREATED",
          payload: event.payload
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_WORKSHEET_CREATED, error);
      }
    })
  );
  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_VERSION_CREATED, async (event) => {
      try {
        await appendDealTimelineEntry({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? void 0,
          title: "Pencil generated",
          description: "New pricing pencil created and ready for review."
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.createdBy ?? void 0,
          event: "VERSION_CREATED",
          payload: event.payload
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_VERSION_CREATED, error);
      }
    })
  );
  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_VERSION_SELECTED, async (event) => {
      try {
        await primeCreditSubmissionDraft({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          worksheetId: event.payload.worksheetId,
          versionId: event.payload.versionId,
          customerId: event.payload.customerId,
          vehicleId: event.payload.vehicleId,
          structure: event.payload.structure,
          totals: event.payload.totals,
          payment: event.payload.payment,
          selectedBy: event.payload.selectedBy
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.selectedBy,
          event: "VERSION_SELECTED",
          payload: event.payload
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_VERSION_SELECTED, error);
      }
    })
  );
  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_OPTIMIZED, async (event) => {
      try {
        await appendDealTimelineEntry({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? void 0,
          title: "AI optimized scenario",
          description: "Optimization completed for the active pencil."
        });
        await scheduleDealFollowUp({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? void 0,
          subject: "Review AI optimization results",
          dueInHours: 12
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.runBy,
          event: "OPTIMIZED",
          payload: event.payload
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_OPTIMIZED, error);
      }
    })
  );
  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_COUNTER_ACCEPTED, async (event) => {
      try {
        await appendDealTimelineEntry({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? void 0,
          title: "Counter accepted",
          description: "Customer accepted the negotiated counter offer."
        });
        await scheduleDealFollowUp({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? void 0,
          subject: "Confirm delivery details after counter acceptance",
          dueInHours: 6
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.handledBy,
          event: "COUNTER_ACCEPTED",
          payload: event.payload
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_COUNTER_ACCEPTED, error);
      }
    })
  );
  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_STATUS_LOST, async (event) => {
      try {
        await releaseVehicleInventory(
          event.payload.tenantId,
          event.payload.dealId,
          event.payload.worksheetId,
          event.payload.vehicleId,
          "LOST"
        );
        await scheduleDealFollowUp({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? void 0,
          subject: "Reconnect after lost deal",
          dueInHours: 24
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.salespersonId ?? void 0,
          event: "STATUS_LOST",
          payload: event.payload
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_STATUS_LOST, error);
      }
    })
  );
  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_STATUS_CLOSED, async (event) => {
      try {
        await releaseVehicleInventory(
          event.payload.tenantId,
          event.payload.dealId,
          event.payload.worksheetId,
          event.payload.vehicleId,
          "CLOSED"
        );
        const journalId = await createDealCloseJournal({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          worksheetId: event.payload.worksheetId,
          vehicleId: event.payload.vehicleId,
          salespersonId: event.payload.salespersonId,
          totals: event.payload.totals
        });
        await createSalesCommissionStub({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          salespersonId: event.payload.salespersonId,
          frontGross: Number(event.payload.totals?.frontEndGross ?? 0)
        });
        await appendDealTimelineEntry({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? void 0,
          title: "Deal closed",
          description: journalId ? `Accounting entry ${journalId} created.` : "Deal marked as closed."
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.salespersonId ?? void 0,
          event: "STATUS_CLOSED",
          payload: event.payload
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_STATUS_CLOSED, error);
      }
    })
  );
  initialized2 = true;
}

// src/server.ts
watchScoringConfig();
initializeDomainIntegrations();
function createApp() {
  const app = express();
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://app.autolytiq.com",
      "https://autolytiq.com",
      "http://localhost:5173",
      "http://localhost:3000"
    ];
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization"
    );
    res.setHeader("Access-Control-Max-Age", "1728000");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.use(requestTracingMiddleware);
  app.use(initializeContext);
  app.use(express.json());
  registerRoutes(app);
  app.use((err, req, res, _next) => {
    const normalized = toApiError(err);
    logger.error("Request error", err, {
      path: req.path,
      method: req.method,
      statusCode: normalized.status,
      errorCode: normalized.code
    });
    const payload = {
      code: normalized.code,
      message: normalized.message
    };
    if (typeof normalized.details !== "undefined") {
      payload.details = normalized.details;
    }
    if (err instanceof Error) {
      payload.stack = err.stack;
    }
    res.status(normalized.status).json(payload);
  });
  return app;
}

// src/index.ts
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection", reason, {
    promise: String(promise)
  });
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  setTimeout(() => {
    process.exit(1);
  }, 1e3);
});
async function startServer() {
  try {
    logger.info("Starting AutolytiQ server...", {
      nodeEnv: "development",
      port: process.env.PORT || 5e3
    });
    const app = await createApp();
    if (process.env.SERVE_STATIC === "true") {
      const publicPath = path4.resolve(process.cwd(), "public");
      logger.info("Serving static files", { publicPath });
      app.use(express2.static(publicPath));
      app.get("*", (_req, res) => {
        res.sendFile(path4.join(publicPath, "index.html"));
      });
    }
    const httpServer = createServer(app);
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(",").map((entry) => entry.trim()) || "*",
        credentials: true
      }
    });
    try {
      const { registerSocket: registerSocket2, getTenantRoom: getTenantRoom2 } = await Promise.resolve().then(() => (init_socket(), socket_exports));
      const { registerLeadChannel: registerLeadChannel2 } = await Promise.resolve().then(() => (init_lead_channel(), lead_channel_exports));
      registerSocket2(io);
      io.on("connection", (socket) => {
        const rawTenantId = socket.handshake.query.tenantId;
        const tenantId = typeof rawTenantId === "string" && rawTenantId.length > 0 ? rawTenantId : void 0;
        socket.join(getTenantRoom2(tenantId ?? "public"));
        registerLeadChannel2(socket, tenantId);
        socket.on("disconnect", () => {
        });
      });
      logger.info("Socket.IO initialized successfully");
    } catch (err) {
      logger.warn("Socket.IO handlers not found, continuing without websockets", { error: err.message });
    }
    const PORT = Number(process.env.PORT) || 5e3;
    httpServer.listen(PORT, () => {
      logger.info("AutolytiQ API server started successfully", {
        port: PORT,
        environment: "development",
        nodeVersion: process.version
      });
      console.log(`[AutolytiQ] API listening on port ${PORT}`);
    });
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully...");
      httpServer.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });
    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully...");
      httpServer.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    throw err;
  }
}
startServer().catch((err) => {
  logger.error("Fatal startup error", err);
  console.error("Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=index.js.map