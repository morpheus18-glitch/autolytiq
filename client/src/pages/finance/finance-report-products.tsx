import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, TrendingUp } from "lucide-react";

const PRODUCT_PERFORMANCE = [
  { name: "Extended warranty", penetration: 46, attachmentRate: 38, revenue: 85000 },
  { name: "GAP insurance", penetration: 39, attachmentRate: 33, revenue: 42000 },
  { name: "Prepaid maintenance", penetration: 24, attachmentRate: 20, revenue: 28500 },
  { name: "Paint protection", penetration: 19, attachmentRate: 14, revenue: 18500 },
];

export default function FinanceProductReport() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PieChart className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">F&amp;I product report</h1>
            <p className="text-gray-600">
              Penetration, attachment, and revenue mix for key F&amp;I product offerings.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/finance/reports">Back to F&amp;I reports</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Highlights</CardTitle>
          <CardDescription>Performance of top F&amp;I products</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Highest penetration</p>
            <p className="text-2xl font-semibold flex items-center gap-2">
              Extended warranty <Badge variant="outline">46%</Badge>
            </p>
            <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4" /> Up 2 pts month-over-month
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Top revenue contributor</p>
            <p className="text-2xl font-semibold">$85k</p>
            <p className="text-sm text-gray-600">Extended warranty upsell bundle</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product performance</CardTitle>
          <CardDescription>Attachment metrics by product line</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Penetration</TableHead>
                <TableHead className="text-right">Attachment rate</TableHead>
                <TableHead className="text-right">Monthly revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PRODUCT_PERFORMANCE.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">{row.penetration}%</TableCell>
                  <TableCell className="text-right">{row.attachmentRate}%</TableCell>
                  <TableCell className="text-right">${(row.revenue / 1000).toFixed(1)}k</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
