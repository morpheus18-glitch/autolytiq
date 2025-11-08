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
  AlarmClockCheck,
  ClipboardList,
  HandCoins,
  PieChart,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const roTrend = [
  { month: "Jan", labor: 198000, parts: 162000 },
  { month: "Feb", labor: 205000, parts: 158000 },
  { month: "Mar", labor: 218000, parts: 171000 },
  { month: "Apr", labor: 232000, parts: 180000 },
  { month: "May", labor: 244000, parts: 188000 },
  { month: "Jun", labor: 258000, parts: 195000 },
];

const advisorMetrics = [
  {
    name: "James Kim",
    efficiency: 96,
    upsell: "$420",
    csat: "4.9",
    route: "/service/appointments?advisor=james-kim",
  },
  {
    name: "Maya Patel",
    efficiency: 92,
    upsell: "$385",
    csat: "4.8",
    route: "/service/appointments?advisor=maya-patel",
  },
  {
    name: "Morgan Lee",
    efficiency: 89,
    upsell: "$360",
    csat: "4.7",
    route: "/service/appointments?advisor=morgan-lee",
  },
];

export default function ServiceReports() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Performance</h1>
          <p className="text-muted-foreground">
            Track bay efficiency, advisor effectiveness, and profitability across
            service operations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/service">Service Overview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/service/appointments">Appointments</Link>
          </Button>
          <Button asChild>
            <Link to="/service/reports">
              Fixed Ops Console
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>RO Count</CardDescription>
            <CardTitle className="text-3xl font-bold">318</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4 text-blue-500" />
            +18 vs prior month
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Labor Hours</CardDescription>
            <CardTitle className="text-3xl font-bold">1,248</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={84} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              84% shop capacity utilization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gross Profit</CardDescription>
            <CardTitle className="text-3xl font-bold">$453K</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <HandCoins className="h-4 w-4 text-emerald-500" />
            +11% YoY
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CSI Score</CardDescription>
            <CardTitle className="text-3xl font-bold">97.4</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            Based on 812 survey responses
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repair Order Revenue Mix</CardTitle>
          <CardDescription>Analyze labor and parts contribution by month</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roTrend}>
              <defs>
                <linearGradient id="labor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="parts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="labor" stroke="#2563eb" fill="url(#labor)" strokeWidth={2} name="Labor" />
              <Area type="monotone" dataKey="parts" stroke="#22c55e" fill="url(#parts)" strokeWidth={2} name="Parts" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advisor Performance</CardTitle>
          <CardDescription>Coach advisors using predictive efficiency scoring</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {advisorMetrics.map((advisor) => (
            <div key={advisor.name} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{advisor.name}</p>
                  <p className="text-sm text-muted-foreground">Efficiency {advisor.efficiency}%</p>
                </div>
                <Badge variant="secondary">CSAT {advisor.csat}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Upsell per RO {advisor.upsell}</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to={advisor.route}>Open Workbench</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational Playbooks</CardTitle>
          <CardDescription>Automated actions to drive service revenue and retention</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlarmClockCheck className="h-4 w-4 text-amber-500" />
              Express Lane Optimization
            </div>
            <p className="text-sm text-muted-foreground">
              Deploy AI to auto-schedule quick service visits during soft windows.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/service/appointments?view=express">Optimize Schedule</Link>
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wrench className="h-4 w-4 text-blue-500" />
              Technician Cross-Training
            </div>
            <p className="text-sm text-muted-foreground">
              Identify technicians ready for EV certification and assign training.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/service/schedule?view=training">Launch Plan</Link>
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <PieChart className="h-4 w-4 text-emerald-500" />
              Loyalty Retention Campaigns
            </div>
            <p className="text-sm text-muted-foreground">
              Target owners at risk of defection with dynamic offers and messaging.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/market-leads?segment=service-loyalty">Build Campaign</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
