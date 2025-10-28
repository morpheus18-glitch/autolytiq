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
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Wrench,
} from "lucide-react";

const appointmentSchedule = [
  {
    id: "RO-12451",
    time: "8:00 AM",
    customer: "Evelyn Carter",
    customerId: "cust-8801",
    vehicle: "2023 Lucid Air Touring",
    advisor: "James Kim",
    status: "In Progress",
  },
  {
    id: "RO-12452",
    time: "8:30 AM",
    customer: "Hannah Singh",
    customerId: "cust-8802",
    vehicle: "2022 Range Rover Sport",
    advisor: "Maya Patel",
    status: "Vehicle Intake",
  },
  {
    id: "RO-12453",
    time: "9:15 AM",
    customer: "Rafael Ortiz",
    customerId: "cust-8803",
    vehicle: "2024 Porsche Taycan",
    advisor: "James Kim",
    status: "EV Diagnostics",
  },
  {
    id: "RO-12454",
    time: "10:00 AM",
    customer: "Zoe Mitchell",
    customerId: "cust-8804",
    vehicle: "2021 Audi Q7",
    advisor: "Avery Collins",
    status: "Ready for Advisor",
  },
];

export default function ServiceAppointments() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Appointments</h1>
          <p className="text-muted-foreground">
            Coordinate customer intake, technician dispatch, and proactive
            communication in real-time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/service">Service Overview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/service/orders">Repair Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/service/appointments?view=calendar">
              Launch Calendar View
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scheduled Today</CardDescription>
            <CardTitle className="text-3xl font-bold">42</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4 text-blue-500" />
            18 EV appointments prioritized
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>On-Time Arrival</CardDescription>
            <CardTitle className="text-3xl font-bold">92%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={92} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Based on connected kiosk check-ins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Advisor Coverage</CardDescription>
            <CardTitle className="text-3xl font-bold">6</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4 text-amber-500" />
            Advisors monitoring live queue
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customer CSAT</CardDescription>
            <CardTitle className="text-3xl font-bold">4.9/5</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Surveyed after service completion
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Intelligent Queue</CardTitle>
            <CardDescription>
              AI orchestrated sequence by technician skills and part availability
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/service/appointments?view=timeline">Timeline</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/service/schedule">Technician Grid</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/service/history?filter=appointments">Audit Trail</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RO</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden xl:table-cell">Vehicle</TableHead>
                <TableHead>Advisor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentSchedule.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.time}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell className="hidden xl:table-cell">{item.vehicle}</TableCell>
                  <TableCell>{item.advisor}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/service/orders?ro=${item.id}`}>View RO</Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/customers/${item.customerId}`}>Customer</Link>
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
          <CardTitle>Customer Communication</CardTitle>
          <CardDescription>Automated outreach sequences and live status updates</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Arrival Reminders</p>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              SMS reminders delivered 2 hours before appointment.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/customers/cust-communications/texting">
                Manage Templates
              </Link>
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Advisor Updates</p>
              <Badge variant="secondary">Live</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Advisors send multimedia updates directly from the shop floor.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/communication-demo?channel=service">
                Launch Workspace
              </Link>
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Pickup Coordination</p>
              <Badge variant="secondary">Automated</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Smart scheduling prevents congestion and increases CSI.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/service/schedule?view=pickup">Optimize Flow</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
