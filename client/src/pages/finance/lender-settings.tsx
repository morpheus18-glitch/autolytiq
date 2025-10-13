import { useMemo } from "react";
import { Link, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { lenderData } from "./lenders";

const SECTIONS = {
  overview: "Overview",
  routing: "Routing rules",
  approvals: "Approval workflow",
  notifications: "Notifications",
} as const;

type SectionKey = keyof typeof SECTIONS;

export default function LenderSettings() {
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const section = (params.get("section") as SectionKey | null) ?? "overview";
  const lenderId = params.get("lender") ?? lenderData[0]?.id;
  const lender = lenderData.find((entry) => entry.id === lenderId) ?? lenderData[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lender configuration</h1>
          <p className="text-gray-600">
            Manage routing rules, approval thresholds, and notification preferences for
            each lender partner.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/finance/lenders">Back to lenders</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(SECTIONS) as SectionKey[]).map((key) => (
          <Button
            key={key}
            asChild
            variant={section === key ? "default" : "outline"}
          >
            <Link href={`/finance/lenders/settings?section=${key}&lender=${lender.id}`}>
              {SECTIONS[key]}
            </Link>
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{lender.name}</CardTitle>
          <CardDescription>
            {lender.type} lender &mdash; priority {lender.priority} | contact {lender.contact.rep}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {section === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-600">Approval rate</p>
                  <p className="text-2xl font-semibold">{lender.performance.approvalRate}%</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-600">Average reserve</p>
                  <p className="text-2xl font-semibold">{lender.performance.avgReserve}%</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-600">Monthly volume</p>
                  <p className="text-2xl font-semibold">{lender.performance.volume}</p>
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">Supported products</p>
                <div className="flex flex-wrap gap-2">
                  {lender.products.map((product) => (
                    <Badge key={product} variant="outline">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === "routing" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Routing rules</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit tier</TableHead>
                    <TableHead>Min FICO</TableHead>
                    <TableHead>Max LTV</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Prime</TableCell>
                    <TableCell>{lender.terms.minFico}+ FICO</TableCell>
                    <TableCell>{lender.terms.maxLtv}%</TableCell>
                    <TableCell>
                      <Switch defaultChecked />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sub-prime</TableCell>
                    <TableCell>{lender.terms.minFico - 40}+ FICO</TableCell>
                    <TableCell>{lender.terms.maxLtv - 10}%</TableCell>
                    <TableCell>
                      <Switch />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {section === "approvals" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Approval workflow</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Deals over $75,000 require manager sign-off</p>
                    <p className="text-sm text-gray-600">
                      Escalate automatically to finance leadership when the amount exceeds the
                      configured limit.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Auto-decline below minimum FICO</p>
                    <p className="text-sm text-gray-600">
                      Decline applications when the applicant score is 25 points below the
                      minimum.
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Email underwriting decisions</p>
                    <p className="text-sm text-gray-600">
                      Send an email summary to {lender.contact.email} when decisions are made.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Slack alerts</p>
                    <p className="text-sm text-gray-600">
                      Push notifications to the finance operations channel for pending deals.
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
