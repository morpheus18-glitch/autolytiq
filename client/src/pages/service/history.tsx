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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  CalendarDays,
  ClipboardSignature,
  FileCheck2,
  History,
  Wrench,
} from "lucide-react";

const serviceHistory = [
  {
    id: "RO-12388",
    completedOn: "2024-03-18",
    customer: "Jordan Scott",
    vehicle: "2021 Mercedes GLS 580",
    advisor: "Morgan Lee",
    services: ["B-Service", "Brake Fluid", "Detailing"],
    total: "$2,180",
  },
  {
    id: "RO-12377",
    completedOn: "2024-03-17",
    customer: "Alana Brooks",
    vehicle: "2023 Rivian R1T",
    advisor: "Noah Wright",
    services: ["EV Battery Cooling", "Alignment"],
    total: "$1,640",
  },
  {
    id: "RO-12365",
    completedOn: "2024-03-15",
    customer: "Elias Chen",
    vehicle: "2020 Porsche 911 Carrera",
    advisor: "Sophia Patel",
    services: ["Porsche 30k Service", "Performance Inspection"],
    total: "$3,420",
  },
];

const retentionInsights = [
  {
    title: "First Service Conversions",
    metric: "86%",
    description: "New vehicle buyers booking 1st year service packages.",
    cta: "View Outreach",
    route: "/customers?segment=first-service",
  },
  {
    title: "Warranty Declines",
    metric: "14",
    description: "Customers approaching warranty expiration without coverage.",
    cta: "Launch Renewal",
    route: "/workflow-assistant?playbook=warranty",
  },
  {
    title: "High Value EV Owners",
    metric: "9",
    description: "Owners with >$2k average RO in the last quarter.",
    cta: "Build Campaign",
    route: "/market-leads?filter=ev-service",
  },
];

export default function ServiceHistory() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service History</h1>
          <p className="text-muted-foreground">
            Access a fully auditable repair log with documentation, media, and
            approvals captured for every RO.
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
            <Link href="/service/reports">Service Analytics</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                Recent Repair Orders
              </CardTitle>
              <CardDescription>
                Deep links into completed ROs with annotated technician media
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/service/orders?status=completed">Open Archive</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RO</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden xl:table-cell">Vehicle</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.completedOn}</TableCell>
                    <TableCell>{item.customer}</TableCell>
                    <TableCell className="hidden xl:table-cell">{item.vehicle}</TableCell>
                    <TableCell>{item.total}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/service/orders?ro=${item.id}`}>
                            View RO
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/customers/${item.id.replace('RO-', 'cust-')}`}>
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
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Retention Intelligence
            </CardTitle>
            <CardDescription>
              AI-driven opportunities to increase lifetime service value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {retentionInsights.map((insight) => (
              <div key={insight.title} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{insight.metric}</p>
                    <p className="text-sm text-muted-foreground">{insight.title}</p>
                  </div>
                  <Badge variant="outline">Priority</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {insight.description}
                </p>
                <Button asChild size="sm" className="mt-3">
                  <Link href={insight.route}>{insight.cta}</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardSignature className="h-5 w-5 text-indigo-500" />
            Documentation & Media
          </CardTitle>
          <CardDescription>
            Everything captured during service events — inspections, authorizations, and technician media
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-80">
            <div className="space-y-4 pr-4">
              {serviceHistory.map((item) => (
                <div key={`${item.id}-media`} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{item.vehicle}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.customer} • {item.completedOn}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Inspection</Badge>
                      <Badge variant="secondary">Photos</Badge>
                      <Badge variant="secondary">Advisor Notes</Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <Button asChild variant="outline" className="justify-start">
                      <Link href={`/service/orders?ro=${item.id}&view=media`}>
                        <Wrench className="mr-2 h-4 w-4" /> Technician Media
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                      <Link href={`/service/orders?ro=${item.id}&view=inspection`}>
                        <FileCheck2 className="mr-2 h-4 w-4" /> Inspection Report
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                      <Link href={`/service/orders?ro=${item.id}&view=approvals`}>
                        <CalendarDays className="mr-2 h-4 w-4" /> Approvals Timeline
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
