import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  Calculator,
  FilePieChart,
  LineChart,
  ShieldDollar,
  TrendingUp,
} from "lucide-react";

const pAndLData = [
  { month: "Jan", revenue: 1180000, expense: 890000 },
  { month: "Feb", revenue: 1230000, expense: 915000 },
  { month: "Mar", revenue: 1310000, expense: 948000 },
  { month: "Apr", revenue: 1390000, expense: 972000 },
  { month: "May", revenue: 1450000, expense: 998000 },
  { month: "Jun", revenue: 1540000, expense: 1036000 },
];

const balanceSheetData = [
  { month: "Jan", assets: 8200000, liabilities: 4820000 },
  { month: "Mar", assets: 8450000, liabilities: 5010000 },
  { month: "May", assets: 8720000, liabilities: 5170000 },
];

const alerts = [
  {
    title: "Floorplan Optimization",
    message: "12 units eligible for payoff to reduce interest exposure.",
    action: "Review Vehicles",
    route: "/finance/reports?view=floorplan",
  },
  {
    title: "Warranty Claims",
    message: "Outstanding claims aging beyond 21 days require escalation.",
    action: "Open Claims",
    route: "/accounting/reports?focus=warranty",
  },
  {
    title: "Expense Variance",
    message: "Marketing spend running 8% above plan for the quarter.",
    action: "Audit Detail",
    route: "/accounting/transactions?filter=marketing",
  },
];

export default function FinancialReports() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Intelligence</h1>
          <p className="text-muted-foreground">
            Consolidated profitability, cash flow, and compliance readiness for
            multi-rooftop operations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/accounting">Accounting Hub</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/finance">Finance Desk</Link>
          </Button>
          <Button asChild>
            <Link href="/reports">
              Executive Summary
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Profit</CardDescription>
            <CardTitle className="text-3xl font-bold">$504K</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            +14% vs prior quarter
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>EBITDA Margin</CardDescription>
            <CardTitle className="text-3xl font-bold">18.7%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={78} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Driven by F&I and service absorption gains
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cash Position</CardDescription>
            <CardTitle className="text-3xl font-bold">$3.1M</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Banknote className="h-4 w-4 text-blue-500" />
            92 days of runway
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Compliance Status</CardDescription>
            <CardTitle className="text-3xl font-bold">Green</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldDollar className="h-4 w-4 text-indigo-500" />
            Audit controls verified this week
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss</CardTitle>
          <CardDescription>Six-month trend of revenue and operating expenses</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pAndLData}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revenue)" name="Revenue" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" stroke="#f59e0b" fill="url(#expense)" name="Expense" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet Snapshot</CardTitle>
          <CardDescription>Quarterly view of assets versus liabilities</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={balanceSheetData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="assets" name="Assets" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="liabilities" name="Liabilities" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controller Checklist</CardTitle>
          <CardDescription>Stay audit-ready across payroll, tax, and compliance</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calculator className="h-4 w-4 text-emerald-500" />
              Month-End Close
            </div>
            <p className="text-sm text-muted-foreground">
              Reconcile all ledgers and deliver financial statements by day 3.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/accounting/monthly-close">Open Checklist</Link>
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FilePieChart className="h-4 w-4 text-blue-500" />
              Tax & Regulatory Filings
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor state filings, submit EFT payments, and sync confirmation numbers.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/accounting/reports?focus=tax">Manage Filings</Link>
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <LineChart className="h-4 w-4 text-amber-500" />
              Forecast Scenario Planning
            </div>
            <p className="text-sm text-muted-foreground">
              Stress test inventory acquisition and F&I penetration scenarios.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/finance/structuring">Launch Scenario</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Alerts</CardTitle>
          <CardDescription>Automated insights requiring controller attention</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {alerts.map((alert) => (
            <div key={alert.title} className="rounded-lg border p-4">
              <p className="text-lg font-semibold">{alert.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href={alert.route}>{alert.action}</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
