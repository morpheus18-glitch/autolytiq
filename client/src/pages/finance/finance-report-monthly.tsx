import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

const MONTHLY_REPORT = [
  { month: "September", deals: 112, financePenetration: 78, reserveIncome: 182000, avgRate: 4.9 },
  { month: "October", deals: 125, financePenetration: 81, reserveIncome: 195500, avgRate: 4.7 },
  { month: "November", deals: 118, financePenetration: 76, reserveIncome: 176250, avgRate: 4.8 },
  { month: "December", deals: 134, financePenetration: 84, reserveIncome: 205400, avgRate: 4.6 },
];

export default function FinanceMonthlyReport() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Monthly performance report</h1>
            <p className="text-gray-600">
              Detailed monthly summary of deal volume, penetration, and reserve performance.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/finance/reports">Back to F&amp;I reports</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key trends</CardTitle>
          <CardDescription>Highlights based on the last quarter</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Finance penetration</p>
            <p className="text-2xl font-semibold">84%</p>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +3.5 pts vs prior month
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Reserve income</p>
            <p className="text-2xl font-semibold">$205k</p>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +4.3% vs prior month
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Average rate</p>
            <p className="text-2xl font-semibold">4.6%</p>
            <p className="text-sm text-red-600 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" /> -0.2 pts vs prior month
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly breakdown</CardTitle>
          <CardDescription>Rolling four-month comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Deals funded</TableHead>
                <TableHead className="text-right">Finance penetration</TableHead>
                <TableHead className="text-right">Reserve income</TableHead>
                <TableHead className="text-right">Average APR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MONTHLY_REPORT.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right">{row.deals}</TableCell>
                  <TableCell className="text-right">{row.financePenetration}%</TableCell>
                  <TableCell className="text-right">${(row.reserveIncome / 1000).toFixed(1)}k</TableCell>
                  <TableCell className="text-right">{row.avgRate.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
