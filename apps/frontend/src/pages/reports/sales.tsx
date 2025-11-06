import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Award,
  DollarSign,
  Gauge,
  Target,
  Users,
} from "lucide-react";

const monthlySales = [
  { month: "Jan", vehicles: 48, frontGross: 185000, backGross: 124000 },
  { month: "Feb", vehicles: 52, frontGross: 198000, backGross: 131000 },
  { month: "Mar", vehicles: 61, frontGross: 224000, backGross: 146000 },
  { month: "Apr", vehicles: 67, frontGross: 245000, backGross: 158000 },
  { month: "May", vehicles: 71, frontGross: 252000, backGross: 162000 },
  { month: "Jun", vehicles: 75, frontGross: 264000, backGross: 171000 },
];

const leaderboard = [
  {
    name: "Jordan Diaz",
    units: 22,
    gross: "$86,400",
    closing: "61%",
    route: "/customers?owner=jordan-diaz",
  },
  {
    name: "Avery Morgan",
    units: 19,
    gross: "$78,150",
    closing: "57%",
    route: "/customers?owner=avery-morgan",
  },
  {
    name: "Priya Patel",
    units: 18,
    gross: "$74,980",
    closing: "63%",
    route: "/customers?owner=priya-patel",
  },
];

export default function SalesReports() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Performance</h1>
          <p className="text-muted-foreground">
            Monitor unit velocity, gross optimization, and advisor performance in
            real time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/reports">Executive Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/professional-deal-desk">Deal Desk</Link>
          </Button>
          <Button asChild>
            <Link to="/sales">
              Manage Pipeline
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Units Sold</CardDescription>
            <CardTitle className="text-3xl font-bold">75</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            +6 vs last 30 days
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Front Gross</CardDescription>
            <CardTitle className="text-3xl font-bold">$264K</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 text-blue-500" />
            $3,520 average per vehicle
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Back-End Gross</CardDescription>
            <CardTitle className="text-3xl font-bold">$171K</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4 text-indigo-500" />
            PVR up 9.4%
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Close Rate</CardDescription>
            <CardTitle className="text-3xl font-bold">58%</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4 text-rose-500" />
            +4 pts vs rolling average
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Track volume and gross trends across rooftops</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="vehicles" name="Units" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="frontGross" name="Front Gross" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="backGross" name="Back Gross" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advisor Leaderboard</CardTitle>
          <CardDescription>Celebrate high performers and identify coaching opportunities</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {leaderboard.map((advisor) => (
            <div key={advisor.name} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{advisor.name}</p>
                  <p className="text-sm text-muted-foreground">{advisor.units} units • {advisor.gross}</p>
                </div>
                <Badge variant="secondary">{advisor.closing}</Badge>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to={advisor.route}>
                  Review Pipeline
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Best Actions</CardTitle>
          <CardDescription>AI recommended plays to boost closing performance</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-blue-500" />
              Revive aging internet leads
            </div>
            <p className="text-sm text-muted-foreground">
              Launch omni-channel outreach for leads in nurture stage &gt; 21 days.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/market-leads?playbook=revive">Launch Playbook</Link>
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Award className="h-4 w-4 text-amber-500" />
              Increase F&I product penetration
            </div>
            <p className="text-sm text-muted-foreground">
              Target deals with low reserve contribution and high credit scores.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/finance/reports?focus=penetration">View Opportunities</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
