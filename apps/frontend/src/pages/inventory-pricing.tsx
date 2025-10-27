import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Gauge,
  LineChart as LineChartIcon,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const pricingTrendData = [
  { month: "Jan", optimal: 102, market: 98 },
  { month: "Feb", optimal: 104, market: 100 },
  { month: "Mar", optimal: 108, market: 103 },
  { month: "Apr", optimal: 111, market: 105 },
  { month: "May", optimal: 115, market: 107 },
  { month: "Jun", optimal: 118, market: 110 },
];

const marginOpportunities = [
  {
    model: "2024 Audi Q5 Premium",
    currentPrice: "$47,995",
    suggestedPrice: "$49,450",
    upside: "+$1,455",
    confidence: 92,
  },
  {
    model: "2023 BMW X3 M40i",
    currentPrice: "$54,880",
    suggestedPrice: "$55,900",
    upside: "+$1,020",
    confidence: 88,
  },
  {
    model: "2024 Lexus RX 350",
    currentPrice: "$51,400",
    suggestedPrice: "$52,375",
    upside: "+$975",
    confidence: 85,
  },
];

const marketAlerts = [
  {
    segment: "Compact SUV",
    change: "+3.4%",
    vehicles: 18,
    action: "Review Pricing",
  },
  {
    segment: "Luxury Sedan",
    change: "-1.8%",
    vehicles: 9,
    action: "Promote",
  },
  {
    segment: "Performance",
    change: "+5.2%",
    vehicles: 6,
    action: "Hold Margin",
  },
];

export default function InventoryPricing() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Pricing Intelligence
          </h1>
          <p className="text-muted-foreground">
            Optimize margins with real-time market benchmarking and ML-powered
            pricing recommendations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/inventory">View Inventory</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/competitive-pricing">Competitive Landscape</Link>
          </Button>
          <Button asChild>
            <Link href="/ml-model-comparison">
              Launch Pricing Models
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardDescription>Portfolio Lift</CardDescription>
            <CardTitle className="text-3xl font-bold">$4,720</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Potential monthly margin increase across 36 vehicles
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardDescription>Pricing Accuracy</CardDescription>
            <CardTitle className="text-3xl font-bold">96.4%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={96.4} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              ML recommendations accepted by sales management this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardDescription>Average Market Spread</CardDescription>
            <CardTitle className="text-3xl font-bold">$1,180</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4 text-blue-500" />
            Higher than competitors in 72% of active segments
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardDescription>Dynamic Updates</CardDescription>
            <CardTitle className="text-3xl font-bold">12 mins</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            Average time from market shift to repricing recommendation
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-blue-500" />
                Optimal vs Market Price Trend
              </CardTitle>
              <CardDescription>
                ML pricing guidance compared to local competitive averages
              </CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Last 6 Months
            </Badge>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pricingTrendData}>
                <defs>
                  <linearGradient id="optimal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="market" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Area
                  type="monotone"
                  dataKey="optimal"
                  stroke="#2563eb"
                  fill="url(#optimal)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="market"
                  stroke="#10b981"
                  fill="url(#market)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Margin Opportunities
            </CardTitle>
            <CardDescription>Vehicles with actionable pricing lift</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {marginOpportunities.map((item) => (
              <div key={item.model} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.model}</p>
                  <Badge variant="outline">{item.upside}</Badge>
                </div>
                <div className="grid gap-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Current Price</span>
                    <span>{item.currentPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suggested Price</span>
                    <span>{item.suggestedPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidence</span>
                    <div className="flex items-center gap-2">
                      <Progress value={item.confidence} className="h-1.5 w-24" />
                      <span className="font-medium text-emerald-600">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
                <Button asChild size="sm" className="w-full">
                  <Link href="/professional-deal-desk?tab=pricing">
                    Review in Deal Desk
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Segment Alerts</CardTitle>
              <CardDescription>Market velocity shifts detected in the last 24 hours</CardDescription>
            </div>
            <Badge variant="secondary">Auto-refreshed</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segment</TableHead>
                  <TableHead className="hidden sm:table-cell">Vehicles</TableHead>
                  <TableHead>Market Change</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketAlerts.map((alert) => (
                  <TableRow key={alert.segment}>
                    <TableCell className="font-medium">{alert.segment}</TableCell>
                    <TableCell className="hidden sm:table-cell">{alert.vehicles}</TableCell>
                    <TableCell>
                      <Badge variant={alert.change.startsWith("-") ? "destructive" : "secondary"}>
                        {alert.change}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/inventory?focus=${encodeURIComponent(alert.segment)}`}>
                          {alert.action}
                          <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
            <CardDescription>Prioritized actions generated by the pricing AI assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="font-medium">Re-evaluate German luxury pricing</p>
              <p className="mt-1 text-sm text-muted-foreground">
                BMW and Audi segments show above-market demand. Adjust pricing and update merchandising packages.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/competitive-pricing?segment=luxury">
                    View Competitive Report
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/ml-developer-admin?model=pricing">
                    Review Model Output
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium">Launch weekend pricing experiment</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Deploy A/B pricing on crossover inventory and track impact on engagement and lead quality.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/reports/sales?view=segments">
                    Monitor Performance
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/workflow-assistant?playbook=pricing">
                    Automate Workflow
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
