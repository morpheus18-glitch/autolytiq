import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import { Button } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Progress } from '@repo/ui';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Boxes,
  Gauge,
  Layers,
  TrendingUp,
} from "lucide-react";

const agingData = [
  { range: "0-15", vehicles: 42 },
  { range: "16-30", vehicles: 37 },
  { range: "31-45", vehicles: 28 },
  { range: "46-60", vehicles: 19 },
  { range: "60+", vehicles: 11 },
];

const turnPerformance = [
  { month: "Jan", days: 41 },
  { month: "Feb", days: 39 },
  { month: "Mar", days: 36 },
  { month: "Apr", days: 33 },
  { month: "May", days: 31 },
  { month: "Jun", days: 29 },
];

const stockingAlerts = [
  {
    title: "EV Allocation",
    description: "Incoming VINs scheduled within 72 hours require merchandising packages.",
    action: "Build Launch Plan",
    route: "/inventory?focus=ev",
  },
  {
    title: "Luxury SUV Demand",
    description: "Market velocity up 12%. Replenish with 3 certified pre-owned units.",
    action: "Request Buy List",
    route: "/market-leads?segment=luxury-suv",
  },
  {
    title: "Aging Performance",
    description: "7 vehicles > 60 days with high MSRP. Enable geo-targeted campaigns.",
    action: "Activate Campaign",
    route: "/competitive-pricing?segment=performance",
  },
];

export default function InventoryReports() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Insights</h1>
          <p className="text-muted-foreground">
            Balance turn, margin, and acquisition with predictive stocking
            guidance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/inventory">Inventory Workspace</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/inventory/lot-management">Lot Management</Link>
          </Button>
          <Button asChild>
            <Link to="/inventory/pricing">
              Pricing Intelligence
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Inventory</CardDescription>
            <CardTitle className="text-3xl font-bold">137</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Boxes className="h-4 w-4 text-blue-500" />
            18 units arriving this week
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Days Supply</CardDescription>
            <CardTitle className="text-3xl font-bold">29</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={70} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Goal &lt; 32 days across rooftops
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Turn Velocity</CardDescription>
            <CardTitle className="text-3xl font-bold">+3.2%</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Powered by ML demand scoring
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Optimal Mix Score</CardDescription>
            <CardTitle className="text-3xl font-bold">92</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4 text-indigo-500" />
            Cross rooftop blended index
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aging Distribution</CardTitle>
          <CardDescription>Identify over-exposed segments and aging pockets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {agingData.map((item) => (
              <div key={item.range} className="rounded-lg border p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.range} Days
                </p>
                <p className="mt-2 text-2xl font-bold">{item.vehicles}</p>
                <Badge variant={item.vehicles > 30 ? "destructive" : "secondary"}>
                  {item.vehicles > 30 ? "Monitor" : "Healthy"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Turn Performance</CardTitle>
          <CardDescription>AI forecasting on inventory liquidity</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={turnPerformance}>
              <defs>
                <linearGradient id="turn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="days" stroke="#2563eb" fill="url(#turn)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stocking Alerts</CardTitle>
          <CardDescription>Coordinated actions across acquisition and merchandising</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {stockingAlerts.map((alert) => (
            <div key={alert.title} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{alert.title}</p>
                <Layers className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{alert.description}</p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link to={alert.route}>{alert.action}</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
