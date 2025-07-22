import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  TrendingUp,
  DollarSign,
  Users,
  Car,
  Target,
  Award,
  FileSpreadsheet,
  Mail,
  Printer
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  frequency: string;
  lastGenerated: string;
  onGenerate: () => void;
}

function ReportCard({ title, description, icon, category, frequency, lastGenerated, onGenerate }: ReportCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          <Badge variant="outline">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <div>Frequency: {frequency}</div>
            <div>Last: {lastGenerated}</div>
          </div>
          <Button size="sm" onClick={onGenerate}>
            <Download className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdvancedReporting() {
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({});
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");

  const reportCategories = [
    {
      name: "Sales Performance",
      reports: [
        {
          title: "Sales Summary Report",
          description: "Comprehensive sales performance with individual and team metrics",
          icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
          category: "Sales",
          frequency: "Daily",
          lastGenerated: "2 hours ago"
        },
        {
          title: "Lead Conversion Analysis",
          description: "Lead source performance, conversion rates, and pipeline analysis",
          icon: <Target className="w-5 h-5 text-green-600" />,
          category: "Sales",
          frequency: "Weekly",
          lastGenerated: "Yesterday"
        },
        {
          title: "Revenue Forecast",
          description: "Predictive revenue analysis with AI-powered insights",
          icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
          category: "Sales",
          frequency: "Monthly",
          lastGenerated: "3 days ago"
        }
      ]
    },
    {
      name: "Inventory Management",
      reports: [
        {
          title: "Inventory Aging Report",
          description: "Vehicle aging analysis with recommendations for pricing adjustments",
          icon: <Car className="w-5 h-5 text-orange-600" />,
          category: "Inventory",
          frequency: "Weekly",
          lastGenerated: "1 day ago"
        },
        {
          title: "Market Value Analysis",
          description: "Competitive pricing analysis with market positioning insights",
          icon: <DollarSign className="w-5 h-5 text-green-600" />,
          category: "Inventory",
          frequency: "Daily",
          lastGenerated: "4 hours ago"
        },
        {
          title: "Turn Rate Performance",
          description: "Inventory turn rates by category, make, model, and price range",
          icon: <LineChart className="w-5 h-5 text-blue-600" />,
          category: "Inventory",
          frequency: "Monthly",
          lastGenerated: "1 week ago"
        }
      ]
    },
    {
      name: "Customer Analytics",
      reports: [
        {
          title: "Customer Lifetime Value",
          description: "CLV analysis with segmentation and retention insights",
          icon: <Users className="w-5 h-5 text-indigo-600" />,
          category: "Customer",
          frequency: "Monthly",
          lastGenerated: "5 days ago"
        },
        {
          title: "Service Retention Report",
          description: "Service department performance and customer retention metrics",
          icon: <Award className="w-5 h-5 text-yellow-600" />,
          category: "Service",
          frequency: "Monthly",
          lastGenerated: "1 week ago"
        },
        {
          title: "Customer Satisfaction",
          description: "NPS scores, review analysis, and satisfaction trending",
          icon: <Target className="w-5 h-5 text-green-600" />,
          category: "Customer",
          frequency: "Weekly",
          lastGenerated: "2 days ago"
        }
      ]
    }
  ];

  const executiveReports = [
    {
      title: "Executive Dashboard Summary",
      description: "High-level KPIs and performance indicators for leadership",
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      category: "Executive",
      frequency: "Daily",
      lastGenerated: "1 hour ago"
    },
    {
      title: "Financial Performance Report",
      description: "P&L analysis, gross profit margins, and financial trending",
      icon: <DollarSign className="w-5 h-5 text-green-600" />,
      category: "Finance",
      frequency: "Monthly",
      lastGenerated: "3 days ago"
    },
    {
      title: "Operational Efficiency Report",
      description: "Process efficiency, bottleneck analysis, and improvement opportunities",
      icon: <Target className="w-5 h-5 text-purple-600" />,
      category: "Operations",
      frequency: "Weekly",
      lastGenerated: "Yesterday"
    }
  ];

  const handleGenerateReport = (reportTitle: string) => {
    console.log(`Generating report: ${reportTitle}`);
    // In production, this would trigger actual report generation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Reporting</h1>
          <p className="text-gray-600">Comprehensive business intelligence and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Schedule Reports
          </Button>
          <Button>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="parts">Parts</SelectItem>
                  <SelectItem value="finance">Finance & Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                  <SelectItem value="dashboard">Interactive Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customer">Customer Analytics</TabsTrigger>
          <TabsTrigger value="executive">Executive Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reportCategories[0].reports.map((report, index) => (
              <ReportCard
                key={index}
                {...report}
                onGenerate={() => handleGenerateReport(report.title)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reportCategories[1].reports.map((report, index) => (
              <ReportCard
                key={index}
                {...report}
                onGenerate={() => handleGenerateReport(report.title)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customer">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reportCategories[2].reports.map((report, index) => (
              <ReportCard
                key={index}
                {...report}
                onGenerate={() => handleGenerateReport(report.title)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executive">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {executiveReports.map((report, index) => (
              <ReportCard
                key={index}
                {...report}
                onGenerate={() => handleGenerateReport(report.title)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Daily Sales Summary", schedule: "Every day at 8:00 AM", recipients: "sales@dealer.com", status: "Active" },
              { name: "Weekly Inventory Report", schedule: "Mondays at 9:00 AM", recipients: "inventory@dealer.com", status: "Active" },
              { name: "Monthly Executive Summary", schedule: "1st of month at 7:00 AM", recipients: "executives@dealer.com", status: "Active" },
              { name: "Customer Satisfaction Report", schedule: "Fridays at 5:00 PM", recipients: "management@dealer.com", status: "Paused" }
            ].map((scheduled, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{scheduled.name}</div>
                  <div className="text-sm text-gray-500">{scheduled.schedule} → {scheduled.recipients}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={scheduled.status === 'Active' ? 'default' : 'secondary'}>
                    {scheduled.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}