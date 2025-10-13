import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building, TrendingUp, TrendingDown } from "lucide-react";

const LENDER_PERFORMANCE = [
  {
    lender: "Honda Finance",
    approvalRate: 84,
    avgRate: 4.7,
    reserve: 1.62,
    turnTime: 2.1,
    trend: "up",
  },
  {
    lender: "Bank of America",
    approvalRate: 78,
    avgRate: 5.2,
    reserve: 1.85,
    turnTime: 4.3,
    trend: "flat",
  },
  {
    lender: "Capital One",
    approvalRate: 72,
    avgRate: 7.6,
    reserve: 2.74,
    turnTime: 6.8,
    trend: "down",
  },
];

export default function FinanceLenderReport() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Lender analysis report</h1>
            <p className="text-gray-600">
              Performance and efficiency trends across all active finance partners.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/finance/reports">Back to F&amp;I reports</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Average lender metrics this month</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Avg approval rate</p>
            <p className="text-2xl font-semibold">78%</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Avg turn time</p>
            <p className="text-2xl font-semibold">4.4 hrs</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Avg reserve</p>
            <p className="text-2xl font-semibold">1.94%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lender breakdown</CardTitle>
          <CardDescription>Comparative performance by partner</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lender</TableHead>
                <TableHead className="text-right">Approval rate</TableHead>
                <TableHead className="text-right">Average rate</TableHead>
                <TableHead className="text-right">Reserve</TableHead>
                <TableHead className="text-right">Turn time</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LENDER_PERFORMANCE.map((row) => (
                <TableRow key={row.lender}>
                  <TableCell className="font-medium">{row.lender}</TableCell>
                  <TableCell className="text-right">{row.approvalRate}%</TableCell>
                  <TableCell className="text-right">{row.avgRate.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{row.reserve.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{row.turnTime.toFixed(1)} hrs</TableCell>
                  <TableCell className="text-right">
                    {row.trend === "up" && (
                      <span className="text-green-600 flex justify-end gap-1 items-center">
                        <TrendingUp className="w-4 h-4" /> Improving
                      </span>
                    )}
                    {row.trend === "flat" && (
                      <Badge variant="outline">Stable</Badge>
                    )}
                    {row.trend === "down" && (
                      <span className="text-red-600 flex justify-end gap-1 items-center">
                        <TrendingDown className="w-4 h-4" /> Declining
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
