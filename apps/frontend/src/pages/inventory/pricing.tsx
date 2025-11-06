import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  PageHeader
} from "@repo/ui";
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
    <>
      <PageHeader
        title="Inventory Pricing Intelligence"
        description="Optimize margins with real-time market benchmarking and ML-powered pricing recommendations."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/inventory">View Inventory</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/competitive-pricing">Competitive Landscape</Link>
            </Button>
            <Button asChild>
              <Link href="/ml-model-comparison">
                <ArrowUpRight />
                Launch Pricing Models
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Lift</CardTitle>
        </CardHeader>
        <CardContent>
          $4,720
          <TrendingUp />
          Potential monthly margin increase across 36 vehicles
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          96.4%
          <Progress value={96.4} />
          ML recommendations accepted by sales management this week
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Market Spread</CardTitle>
        </CardHeader>
        <CardContent>
          $1,180
          <Gauge />
          Higher than competitors in 72% of active segments
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dynamic Updates</CardTitle>
        </CardHeader>
        <CardContent>
          12 mins
          <ShieldCheck />
          Average time from market shift to repricing recommendation
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <LineChartIcon />
            Optimal vs Market Price Trend
          </CardTitle>
          <Badge variant="secondary">
            <BarChart3 />
            Last 6 Months
          </Badge>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
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
          <CardTitle>
            <DollarSign />
            Margin Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marginOpportunities.map((item) => (
            <Card key={item.model}>
              <CardContent>
                <p>{item.model}</p>
                <Badge variant="outline">{item.upside}</Badge>
                <p>Current Price: {item.currentPrice}</p>
                <p>Suggested Price: {item.suggestedPrice}</p>
                <p>Confidence:</p>
                <Progress value={item.confidence} />
                <span>{item.confidence}%</span>
                <Button asChild size="sm">
                  <Link href="/professional-deal-desk?tab=pricing">
                    <ArrowUpRight />
                    Review in Deal Desk
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segment Alerts</CardTitle>
          <Badge variant="secondary">Auto-refreshed</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Market Change</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketAlerts.map((alert) => (
                <TableRow key={alert.segment}>
                  <TableCell>{alert.segment}</TableCell>
                  <TableCell>{alert.vehicles}</TableCell>
                  <TableCell>
                    <Badge variant={alert.change.startsWith("-") ? "error" : "secondary"}>
                      {alert.change}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/inventory?focus=${encodeURIComponent(alert.segment)}`}>
                        <ArrowUpRight />
                        {alert.action}
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
        </CardHeader>
        <CardContent>
          <Card>
            <CardContent>
              <p>Re-evaluate German luxury pricing</p>
              <p>BMW and Audi segments show above-market demand. Adjust pricing and update merchandising packages.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/competitive-pricing?segment=luxury">
                  <ArrowUpRight />
                  View Competitive Report
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/ml-developer-admin?model=pricing">
                  <ArrowUpRight />
                  Review Model Output
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p>Launch weekend pricing experiment</p>
              <p>Deploy A/B pricing on crossover inventory and track impact on engagement and lead quality.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/reports/sales?view=segments">
                  <ArrowUpRight />
                  Monitor Performance
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/workflow-assistant?playbook=pricing">
                  <ArrowUpRight />
                  Automate Workflow
                </Link>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </>
  );
}
