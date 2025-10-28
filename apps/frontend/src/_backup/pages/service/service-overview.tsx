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
  CalendarCheck,
  Clock3,
  Gauge,
  Hammer,
  TrendingUp,
  Wrench,
} from "lucide-react";

const technicianPerformance = [
  {
    name: "Avery Collins",
    completed: 18,
    efficiency: 92,
    specialty: "EV Diagnostics",
  },
  {
    name: "Noah Wright",
    completed: 16,
    efficiency: 88,
    specialty: "Transmission",
  },
  {
    name: "Sophia Patel",
    completed: 20,
    efficiency: 94,
    specialty: "Luxury Imports",
  },
];

export default function ServiceOverview() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Command Center</h1>
          <p className="text-muted-foreground">
            Real-time visibility into appointments, technician performance, and
            fixed ops profitability.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/service/appointments">Appointments</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/service/orders">Repair Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/service/reports">
              Service Analytics
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Appointments Today</CardDescription>
            <CardTitle className="text-3xl font-bold">42</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarCheck className="h-4 w-4 text-blue-500" />
            16 EV services in the queue
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Shop Capacity</CardDescription>
            <CardTitle className="text-3xl font-bold">78%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={78} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Peak hours 9:00am – 2:00pm
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average RO Value</CardDescription>
            <CardTitle className="text-3xl font-bold">$1,145</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Up 11% vs prior 30 days
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CSI Score</CardDescription>
            <CardTitle className="text-3xl font-bold">97.2</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4 text-indigo-500" />
            Rolling 90-day average
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-amber-500" />
                Workflow Summary
              </CardTitle>
              <CardDescription>
                Track every stage from intake to delivery with AI prioritization
              </CardDescription>
            </div>
            <Badge variant="secondary">Updated 4 minutes ago</Badge>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-semibold">Intake & Diagnostics</p>
                <p className="text-xs text-muted-foreground">
                  AI triage recommends 6 EV specialists
                </p>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/service/appointments?view=intake">View Queue</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-semibold">In Progress Repairs</p>
                <p className="text-xs text-muted-foreground">
                  14 ROs flagged for advisor review
                </p>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/service/orders?filter=in-progress">Manage Orders</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-semibold">Ready for Pickup</p>
                <p className="text-xs text-muted-foreground">
                  Customer notifications automated via SMS
                </p>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/customers?segment=service">Notify Customers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="h-5 w-5 text-emerald-500" />
              Technician Performance
            </CardTitle>
            <CardDescription>Utilization and efficiency by specialization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {technicianPerformance.map((tech) => (
              <div key={tech.name} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tech.specialty}
                    </p>
                  </div>
                  <Badge variant="outline">{tech.completed} ROs</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wrench className="h-4 w-4 text-blue-500" />
                    Efficiency
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={tech.efficiency} className="h-2 w-24" />
                    <span className="text-sm font-semibold">{tech.efficiency}%</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href={`/service/schedule?tech=${encodeURIComponent(tech.name)}`}>
                      View Schedule
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/service/history?tech=${encodeURIComponent(tech.name)}`}>
                      Repair History
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
