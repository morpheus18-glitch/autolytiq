import { useState } from 'react';
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Download,
  RefreshCw,
  FileText,
  PieChart
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line
} from 'recharts';

const BASE_METRICS = {
  totalFinanceVolume: 2450000,
  financeContractsPer100: 78,
  averageFinanceAmount: 28500,
  fiProductsPenetration: 65,
  reserveIncome: 185000,
  chargebackRate: 2.1,
  averageContractMargin: 1850
};

const BASE_MONTHLY_TRENDS = [
  { month: 'Jan', volume: 1800000, contracts: 65, avgAmount: 27500 },
  { month: 'Feb', volume: 2100000, contracts: 72, avgAmount: 28200 },
  { month: 'Mar', volume: 2450000, contracts: 78, avgAmount: 28500 },
  { month: 'Apr', volume: 2350000, contracts: 75, avgAmount: 29100 },
  { month: 'May', volume: 2650000, contracts: 82, avgAmount: 28800 },
  { month: 'Jun', volume: 2800000, contracts: 85, avgAmount: 29500 }
];

const BASE_PRODUCT_PERFORMANCE = [
  { name: 'Extended Warranty', penetration: 45, revenue: 85000 },
  { name: 'GAP Insurance', penetration: 38, revenue: 42000 },
  { name: 'Credit Life', penetration: 22, revenue: 28000 },
  { name: 'Service Contract', penetration: 35, revenue: 65000 },
  { name: 'Paint Protection', penetration: 18, revenue: 15000 }
];

const BASE_LENDER_PERFORMANCE = [
  { name: 'Bank of America', volume: 450000, rate: 4.2, approvalRate: 85 },
  { name: 'Wells Fargo', volume: 380000, rate: 4.5, approvalRate: 78 },
  { name: 'Chase Auto', volume: 320000, rate: 4.1, approvalRate: 82 },
  { name: 'Credit Union', volume: 280000, rate: 3.8, approvalRate: 88 },
  { name: 'Santander', volume: 240000, rate: 5.2, approvalRate: 65 }
];

export default function FinanceReports() {
  const [dateRange, setDateRange] = useState('30d');
  const [metrics, setMetrics] = useState(BASE_METRICS);
  const [trends, setTrends] = useState(BASE_MONTHLY_TRENDS);
  const [products, setProducts] = useState(BASE_PRODUCT_PERFORMANCE);
  const [lenders, setLenders] = useState(BASE_LENDER_PERFORMANCE);
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date().toISOString());
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const adjustNumber = (value: number, variance: number) =>
    Math.round(value * (1 + (Math.random() - 0.5) * variance));

  const handleRefresh = () => {
    setMetrics(prev => ({
      totalFinanceVolume: adjustNumber(prev.totalFinanceVolume, 0.04),
      financeContractsPer100: Math.max(0, Math.round(prev.financeContractsPer100 + (Math.random() - 0.5) * 4)),
      averageFinanceAmount: adjustNumber(prev.averageFinanceAmount, 0.03),
      fiProductsPenetration: Math.max(0, Math.round(prev.fiProductsPenetration + (Math.random() - 0.5) * 3)),
      reserveIncome: adjustNumber(prev.reserveIncome, 0.05),
      chargebackRate: Math.max(0, Number((prev.chargebackRate + (Math.random() - 0.5) * 0.3).toFixed(1))),
      averageContractMargin: adjustNumber(prev.averageContractMargin, 0.05)
    }));

    setTrends(prev => prev.map(entry => ({
      ...entry,
      volume: adjustNumber(entry.volume, 0.03),
      contracts: Math.max(0, Math.round(entry.contracts + (Math.random() - 0.5) * 5)),
      avgAmount: adjustNumber(entry.avgAmount, 0.02)
    })));

    setProducts(prev => prev.map(product => ({
      ...product,
      penetration: Math.max(0, Math.round(product.penetration + (Math.random() - 0.5) * 4)),
      revenue: adjustNumber(product.revenue, 0.05)
    })));

    setLenders(prev => prev.map(lender => ({
      ...lender,
      volume: adjustNumber(lender.volume, 0.05),
      rate: Number((lender.rate + (Math.random() - 0.5) * 0.2).toFixed(2)),
      approvalRate: Math.max(0, Math.round(lender.approvalRate + (Math.random() - 0.5) * 3))
    })));

    setExportStatus(null);
    setLastRefreshed(new Date().toISOString());
  };

  const handleExport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      dateRange,
      metrics,
      trends,
      products,
      lenders
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fi-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportStatus('F&I report exported successfully.');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">F&I Reports</h1>
            <p className="text-gray-600">Comprehensive finance and insurance performance analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-500">Last refreshed {new Date(lastRefreshed).toLocaleString()}</p>
      {exportStatus && <p className="text-sm text-green-600">{exportStatus}</p>}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Finance Volume</p>
                <p className="text-2xl font-bold">${(metrics.totalFinanceVolume / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-green-600">+12.5% vs last month</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Finance Per 100</p>
                <p className="text-2xl font-bold">{metrics.financeContractsPer100}</p>
                <p className="text-sm text-green-600">+3.2% vs last month</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Finance Amount</p>
                <p className="text-2xl font-bold">${metrics.averageFinanceAmount.toLocaleString()}</p>
                <p className="text-sm text-green-600">+5.8% vs last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reserve Income</p>
                <p className="text-2xl font-bold">${(metrics.reserveIncome / 1000).toFixed(0)}K</p>
                <p className="text-sm text-green-600">+8.7% vs last month</p>
              </div>
              <PieChart className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Finance Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Finance Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* F&I Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>F&I Product Penetration</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={products} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="penetration" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lender Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Lender Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lenders.map((lender) => (
                <div key={lender.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{lender.name}</div>
                    <div className="text-sm text-gray-600">
                      ${(lender.volume / 1000).toFixed(0)}K volume • {lender.rate}% avg rate
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{lender.approvalRate}%</div>
                    <div className="text-sm text-gray-600">approval rate</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contract Margin Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Margin Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgAmount" stroke="#8B5CF6" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Link href="/finance/reports/monthly">
                <span className="flex flex-col items-center">
                  <FileText className="w-6 h-6 mb-2" />
                  Generate Monthly Report
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Link href="/finance/reports/lender">
                <span className="flex flex-col items-center">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  Lender Analysis Report
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Link href="/finance/reports/products">
                <span className="flex flex-col items-center">
                  <PieChart className="w-6 h-6 mb-2" />
                  F&I Product Report
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}