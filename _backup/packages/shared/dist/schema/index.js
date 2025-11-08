// src/schema/index.ts
import { z } from "zod";

// src/schemas/card.ts
function deriveFromWidget(widgetConfig) {
  const mapSize = (w, h) => {
    if (!w || !h) return "MEDIUM";
    if (w === 1 && h === 1) return "SMALL";
    if (w === 2 && h === 2) return "LARGE";
    if (w >= 3 && h === 1) return "WIDE";
    if (w >= 3 && h >= 2) return "FULL";
    return "MEDIUM";
  };
  const inferKind = (key) => {
    if (key.includes("metric") || key.includes("count")) return "metric";
    if (key.includes("trend") || key.includes("chart")) return "trend";
    if (key.includes("list") || key.includes("leads")) return "list";
    if (key.includes("table") || key.includes("grid")) return "table";
    if (key.includes("calendar") || key.includes("schedule")) return "calendar";
    if (key.includes("kanban") || key.includes("board")) return "kanban";
    if (key.includes("alert") || key.includes("warning")) return "alert";
    return "custom";
  };
  return {
    key: widgetConfig.key,
    kind: inferKind(widgetConfig.key),
    context: "none",
    // Widgets don't specify context, default to none
    requiredPermissions: [],
    // No permission checks on legacy widgets (unsafe!)
    size: mapSize(widgetConfig.size?.w, widgetConfig.size?.h),
    componentPath: `@/components/widgets/${widgetConfig.key.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}Widget`,
    config: widgetConfig.config
  };
}
var EXAMPLE_CARDS = [
  {
    key: "active-deals",
    kind: "list",
    context: "none",
    requiredPermissions: ["DEAL_VIEW"],
    roles: ["SALESPERSON", "SALES_MANAGER", "GM"],
    size: "MEDIUM",
    componentPath: "@/components/widgets/ActiveDealsWidget",
    dataSource: "/api/deals?status=ACTIVE&limit=5",
    refreshInterval: 3e4,
    title: "Active Deals",
    description: "List of currently active deals in progress",
    priority: "high",
    tags: ["sales", "deals"]
  },
  {
    key: "hot-leads",
    kind: "list",
    context: "none",
    requiredPermissions: ["LEAD_VIEW"],
    roles: ["SALESPERSON", "BDC", "SALES_MANAGER"],
    size: "MEDIUM",
    componentPath: "@/components/widgets/HotLeadsWidget",
    dataSource: "/api/leads?status=HOT&limit=5",
    refreshInterval: 6e4,
    title: "Hot Leads",
    description: "High-priority leads requiring immediate follow-up",
    priority: "critical",
    tags: ["sales", "leads", "crm"]
  },
  {
    key: "sales-metrics",
    kind: "metric",
    context: "none",
    requiredPermissions: ["ANALYTICS_VIEW"],
    roles: ["SALES_MANAGER", "GM", "CONTROLLER"],
    size: "SMALL",
    componentPath: "@/components/widgets/SalesMetricsWidget",
    dataSource: "/api/analytics/sales/today",
    refreshInterval: 3e5,
    // 5 minutes
    title: "Sales Today",
    description: "Total sales count and revenue for today",
    priority: "normal",
    tags: ["analytics", "sales"]
  },
  {
    key: "inventory-aging",
    kind: "table",
    context: "none",
    requiredPermissions: ["INVENTORY_VIEW"],
    roles: ["SALES_MANAGER", "GM", "USED_CAR_MANAGER"],
    size: "LARGE",
    componentPath: "@/components/widgets/InventoryAgingWidget",
    dataSource: "/api/inventory/aging",
    refreshInterval: 36e5,
    // 1 hour
    title: "Inventory Aging",
    description: "Vehicles by days in stock with pricing recommendations",
    priority: "normal",
    tags: ["inventory", "analytics"]
  }
];

// src/schema/index.ts
var VIN_REGEX = /^[A-HJ-NPR-Z0-9]{11,17}$/i;
var vehicleStatusSchema = z.enum([
  "available",
  "pending",
  "sold",
  "maintenance",
  "in-transit",
  "reserved"
]);
var optionalUrl = z.union([z.string().url("Provide a valid URL"), z.literal("")]).optional();
var optionalNullableNumber = z.number().nonnegative().nullable().optional();
var insertVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number({ invalid_type_error: "Year is required" }).int().min(1900, "Enter a valid model year").max((/* @__PURE__ */ new Date()).getFullYear() + 2, "Model year is too far in the future"),
  vin: z.string().min(11, "VIN must be at least 11 characters").max(17, "VIN must be 17 characters or fewer").regex(VIN_REGEX, "VIN must contain only letters and numbers"),
  price: z.number({ invalid_type_error: "Price is required" }).nonnegative("Price must be positive"),
  status: vehicleStatusSchema,
  trim: z.string().optional(),
  description: z.string().max(4e3).optional(),
  imageUrl: optionalUrl,
  mileage: optionalNullableNumber,
  engine: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  bodyStyle: z.string().optional(),
  doors: z.number().int().min(0).optional(),
  drivetrain: z.string().optional(),
  color: z.string().optional(),
  location: z.string().optional(),
  msrp: optionalNullableNumber,
  cost: optionalNullableNumber
}).strict();
var vehicleSchema = insertVehicleSchema.extend({
  id: z.union([z.string(), z.number()]),
  tenantId: z.string().optional(),
  stockNumber: z.string().optional(),
  stockNo: z.string().optional(),
  salePrice: optionalNullableNumber,
  daysInStock: z.number().int().nonnegative().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  mileage: optionalNullableNumber,
  cost: optionalNullableNumber,
  features: z.array(z.string()).optional(),
  packages: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  aiInsights: z.object({
    demandScore: z.number().int().min(0).max(100).optional(),
    daysToSell: z.number().int().nonnegative().optional(),
    priceOptimal: z.boolean().optional(),
    recommendedActions: z.array(z.string()).optional()
  }).optional(),
  listing: z.object({
    isListed: z.boolean().optional(),
    channels: z.array(z.string()).optional()
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
  category: z.string().optional(),
  segment: z.string().optional()
}).strict();
export {
  EXAMPLE_CARDS,
  deriveFromWidget,
  insertVehicleSchema,
  vehicleSchema,
  vehicleStatusSchema
};
//# sourceMappingURL=index.js.map