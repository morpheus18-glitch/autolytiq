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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  CalendarClock,
  ClipboardCheck,
  Gauge,
  HardHat,
  MapPinned,
  Wrench,
} from "lucide-react";

const technicianSchedule = [
  {
    name: "Avery Collins",
    shift: "7:00 AM - 4:00 PM",
    specialization: "EV Systems",
    utilization: 94,
    nextTask: "Lucid Air battery conditioning",
  },
  {
    name: "Noah Wright",
    shift: "8:00 AM - 5:00 PM",
    specialization: "Transmission",
    utilization: 88,
    nextTask: "Range Rover gearbox calibration",
  },
  {
    name: "Sophia Patel",
    shift: "9:00 AM - 6:00 PM",
    specialization: "Performance",
    utilization: 91,
    nextTask: "Porsche Taycan thermal sync",
  },
];

const bayUtilization = [
  { bay: "EV Bay 1", status: "In Use", utilization: 100 },
  { bay: "EV Bay 2", status: "Reserved", utilization: 78 },
  { bay: "Performance", status: "In Use", utilization: 96 },
  { bay: "General 1", status: "Available", utilization: 42 },
  { bay: "General 2", status: "In Prep", utilization: 67 },
];

export default function ServiceSchedule() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technician Schedule</h1>
          <p className="text-muted-foreground">
            Live visibility into bay availability, technician assignments, and
            predicted completion windows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/service">Service Overview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/service/appointments">Appointments</Link>
          </Button>
          <Button asChild>
            <Link href="/service/orders">Repair Orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-blue-500" />
                Technician Rosters
              </CardTitle>
              <CardDescription>
                AI-suggested dispatching with skill and certification matching
              </CardDescription>
            </div>
            <Badge variant="secondary">Optimized hourly</Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-80">
              <div className="space-y-4 pr-4">
                {technicianSchedule.map((tech) => (
                  <div key={tech.name} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{tech.name}</p>
                        <p className="text-xs text-muted-foreground">{tech.specialization}</p>
                      </div>
                      <Badge variant="outline">{tech.shift}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        <Wrench className="mr-2 inline h-4 w-4 text-blue-500" />
                        {tech.nextTask}
                      </span>
                      <span className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-emerald-500" />
                        {tech.utilization}%
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/service/history?tech=${encodeURIComponent(tech.name)}`}>
                          Recent Repairs
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/service/appointments?tech=${encodeURIComponent(tech.name)}`}>
                          Manage Queue
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-500" />
              Bay Utilization
            </CardTitle>
            <CardDescription>
              View active jobs, reserve bays, and orchestrate pickup windows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bayUtilization.map((bay) => (
              <div key={bay.bay} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{bay.bay}</p>
                    <p className="text-xs text-muted-foreground">{bay.status}</p>
                  </div>
                  <Badge variant={bay.status === "Available" ? "outline" : "secondary"}>
                    {bay.utilization}%
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    <HardHat className="mr-2 inline h-4 w-4 text-amber-500" />
                    Technician Assigned
                  </span>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/service/appointments?bay=${encodeURIComponent(bay.bay)}`}>
                      View Queue
                    </Link>
                  </Button>
                </div>
                <Progress value={bay.utilization} className="mt-2 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-indigo-500" />
            Pickup & Delivery Logistics
          </CardTitle>
          <CardDescription>
            Coordinate shuttles, loaners, and valet routes with predictive ETA updates
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-lg border p-4">
            <p className="font-semibold">Loaner Fleet</p>
            <p className="text-sm text-muted-foreground">
              12 of 18 vehicles active • 3 due back within 2 hours
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/inventory?focus=loaners">Manage Fleet</Link>
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <p className="font-semibold">Valet Routes</p>
            <p className="text-sm text-muted-foreground">
              Real-time ETA sync with customer texting portal.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/customers/cust-communications/calls">Coordinate Calls</Link>
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <p className="font-semibold">Shuttle Demand</p>
            <p className="text-sm text-muted-foreground">
              6 riders booked • Average wait time 9 minutes
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/workflow-assistant?playbook=pickup">Optimize Routing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
