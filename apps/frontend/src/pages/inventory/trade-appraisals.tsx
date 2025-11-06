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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Car,
  ClipboardCheck,
  DollarSign,
  Gavel,
  Gauge,
  Plus,
  TrendingUp,
} from "lucide-react";

const appraisalPipeline = [
  {
    id: "APP-2411",
    customer: "Jordan Matthews",
    customerId: "cust-2411",
    vehicle: "2020 Audi A6 Prestige",
    condition: "Excellent",
    offer: "$42,800",
    status: "Awaiting Customer",
    confidence: 93,
  },
  {
    id: "APP-2412",
    customer: "Amelia Rhodes",
    customerId: "cust-2412",
    vehicle: "2019 BMW X5 xDrive40i",
    condition: "Very Good",
    offer: "$38,450",
    status: "Inspection Scheduled",
    confidence: 88,
  },
  {
    id: "APP-2413",
    customer: "Marcus Lee",
    customerId: "cust-2413",
    vehicle: "2021 Tesla Model Y Performance",
    condition: "Good",
    offer: "$46,200",
    status: "Counter Offer",
    confidence: 81,
  },
];

const wholesaleOpportunities = [
  {
    channel: "Manheim Digital",
    vehicles: 6,
    potential: "$124,600",
    action: "Launch Listing",
    route: "/professional-deal-desk?tab=wholesale",
  },
  {
    channel: "Direct to Dealer",
    vehicles: 4,
    potential: "$86,300",
    action: "Share Package",
    route: "/customers?view=wholesale",
  },
  {
    channel: "EV Marketplace",
    vehicles: 3,
    potential: "$97,450",
    action: "Sync Pricing",
    route: "/competitive-pricing?segment=ev",
  },
];

export default function TradeAppraisals() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Appraisals</h1>
          <p className="text-muted-foreground">
            Centralize appraisal decisions, track customer responses, and launch
            wholesale strategies from one command center.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/sales">Sales Pipeline</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/inventory">Inventory Desk</Link>
          </Button>
          <Button asChild>
            <Link to="/professional-deal-desk?tab=trade">
              <Plus className="mr-2 h-4 w-4" />
              New Appraisal
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Appraisals</CardDescription>
            <CardTitle className="text-3xl font-bold">27</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            8 progressing this week
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Equity</CardDescription>
            <CardTitle className="text-3xl font-bold">$5,820</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 text-blue-500" />
            Net equity across approved trades
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Time to Decision</CardDescription>
            <CardTitle className="text-3xl font-bold">42 min</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4 text-indigo-500" />
            Average since customer submission
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Wholesale Value</CardDescription>
            <CardTitle className="text-3xl font-bold">$308K</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gavel className="h-4 w-4 text-amber-500" />
            Opportunities validated by AI pricing
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-500" />
              Appraisal Pipeline
            </CardTitle>
            <CardDescription>
              Real-time updates from desking, mobile capture, and customer
              submissions
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/customers?segment=trade-in">
              View Customer History
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Vehicle</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appraisalPipeline.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.customer}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.condition}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{item.vehicle}</TableCell>
                  <TableCell>{item.offer}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/professional-deal-desk?trade=${item.id}`}>
                          Desk Deal
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/customers/${item.customerId}`}>
                          Customer 360
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-500" />
            Wholesale Channels
          </CardTitle>
          <CardDescription>
            Curated opportunities with direct access to partner marketplaces
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {wholesaleOpportunities.map((item) => (
            <div key={item.channel} className="space-y-3 rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-lg font-semibold">{item.channel}</p>
                <p className="text-sm text-muted-foreground">
                  {item.vehicles} vehicles ready • Potential {item.potential}
                </p>
              </div>
              <Progress value={Math.min(100, item.vehicles * 15)} className="h-2" />
              <Button asChild className="w-full">
                <Link to={item.route}>
                  {item.action}
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
