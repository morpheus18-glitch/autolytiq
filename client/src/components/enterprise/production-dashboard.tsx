import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  DollarSign, 
  Target, 
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Award
} from "lucide-react";
import { Link } from "wouter";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, change, trend, icon, color }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          {trend === 'up' ? (
            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>{change}</span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface DealPipelineStageProps {
  stage: string;
  count: number;
  value: string;
  percentage: number;
  color: string;
}

function DealPipelineStage({ stage, count, value, percentage, color }: DealPipelineStageProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <div>
          <div className="font-medium text-gray-900">{stage}</div>
          <div className="text-sm text-gray-500">{count} deals • {value}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-gray-900">{percentage}%</div>
        <Progress value={percentage} className="w-16 h-1 mt-1" />
      </div>
    </div>
  );
}

interface TopPerformerProps {
  name: string;
  role: string;
  sales: number;
  units: number;
  avatar: string;
  badge?: string;
}

function TopPerformer({ name, role, sales, units, avatar, badge }: TopPerformerProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">{avatar}</span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{name}</span>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                <Award className="w-3 h-3 mr-1" />
                {badge}
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500">{role}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-gray-900">${sales.toLocaleString()}</div>
        <div className="text-sm text-gray-500">{units} units</div>
      </div>
    </div>
  );
}

export default function ProductionDashboard() {
  const metrics = [
    {
      title: "Monthly Revenue",
      value: "$2.4M",
      change: "+12.3%",
      trend: 'up' as const,
      icon: <DollarSign className="w-4 h-4 text-white" />,
      color: "bg-green-500"
    },
    {
      title: "Units Sold",
      value: "142",
      change: "+8.7%",
      trend: 'up' as const,
      icon: <Car className="w-4 h-4 text-white" />,
      color: "bg-blue-500"
    },
    {
      title: "Active Leads",
      value: "1,247",
      change: "+15.2%",
      trend: 'up' as const,
      icon: <Users className="w-4 h-4 text-white" />,
      color: "bg-purple-500"
    },
    {
      title: "Conversion Rate",
      value: "23.4%",
      change: "-2.1%",
      trend: 'down' as const,
      icon: <Target className="w-4 h-4 text-white" />,
      color: "bg-orange-500"
    },
    {
      title: "Avg Deal Size",
      value: "$34,567",
      change: "+5.8%",
      trend: 'up' as const,
      icon: <TrendingUp className="w-4 h-4 text-white" />,
      color: "bg-indigo-500"
    },
    {
      title: "Inventory Turn",
      value: "4.2x",
      change: "+0.3x",
      trend: 'up' as const,
      icon: <Activity className="w-4 h-4 text-white" />,
      color: "bg-teal-500"
    }
  ];

  const pipelineStages = [
    { stage: "Prospects", count: 342, value: "$8.2M", percentage: 35, color: "bg-gray-400" },
    { stage: "Qualified", count: 187, value: "$4.8M", percentage: 60, color: "bg-blue-400" },
    { stage: "Demo/Test Drive", count: 93, value: "$3.1M", percentage: 75, color: "bg-yellow-400" },
    { stage: "Negotiating", count: 45, value: "$1.9M", percentage: 85, color: "bg-orange-400" },
    { stage: "Closing", count: 23, value: "$890K", percentage: 95, color: "bg-green-400" }
  ];

  const topPerformers = [
    { name: "Sarah Johnson", role: "Senior Sales", sales: 127500, units: 8, avatar: "SJ", badge: "Top Seller" },
    { name: "Michael Chen", role: "Sales Manager", sales: 98200, units: 6, avatar: "MC", badge: "Leader" },
    { name: "Amanda Rodriguez", role: "Senior Sales", sales: 89300, units: 7, avatar: "AR" },
    { name: "David Kim", role: "Sales Associate", sales: 76800, units: 5, avatar: "DK" },
    { name: "Jessica Brown", role: "Senior Sales", sales: 71200, units: 4, avatar: "JB" }
  ];

  const urgentTasks = [
    { title: "Follow up with hot leads", count: 12, priority: "high" },
    { title: "Inventory photos needed", count: 8, priority: "medium" },
    { title: "Pending finance approvals", count: 6, priority: "high" },
    { title: "Customer deliveries scheduled", count: 4, priority: "medium" },
    { title: "Trade appraisals due", count: 3, priority: "low" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Dashboard</h1>
          <p className="text-gray-600">Real-time dealership performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Systems Online
          </Badge>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            This Month
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Deal Pipeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Sales Pipeline
              </CardTitle>
              <Button variant="outline" size="sm">
                <PieChart className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {pipelineStages.map((stage, index) => (
                <DealPipelineStage key={index} {...stage} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPerformers.map((performer, index) => (
                <TopPerformer key={index} {...performer} />
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Urgent Tasks
              </div>
              <Badge variant="destructive">{urgentTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' : 
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{task.title}</span>
                </div>
                <Badge variant="secondary">{task.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/inventory">
              <Button variant="outline" className="w-full justify-start h-12">
                <Car className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" className="w-full justify-start h-12">
                <Users className="w-4 h-4 mr-2" />
                New Customer
              </Button>
            </Link>
            <Link href="/sales">
              <Button variant="outline" className="w-full justify-start h-12">
                <Target className="w-4 h-4 mr-2" />
                Create Lead
              </Button>
            </Link>
            <Link href="/showroom-manager">
              <Button variant="outline" className="w-full justify-start h-12">
                <Activity className="w-4 h-4 mr-2" />
                Deal Desk
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" className="w-full justify-start h-12">
                <LineChart className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </Link>
            <Link href="/competitive-pricing">
              <Button variant="outline" className="w-full justify-start h-12">
                <DollarSign className="w-4 h-4 mr-2" />
                Price Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}