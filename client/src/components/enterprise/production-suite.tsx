import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Star, 
  Award,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Users,
  Car,
  DollarSign,
  Shield,
  Activity,
  Brain,
  Workflow,
  Settings,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import { Link } from "wouter";

interface ProductionModuleProps {
  title: string;
  description: string;
  status: 'live' | 'ready' | 'testing';
  performance: number;
  users: number;
  uptime: string;
  icon: React.ReactNode;
  features: string[];
  href: string;
}

function ProductionModule({ 
  title, 
  description, 
  status, 
  performance, 
  users, 
  uptime, 
  icon, 
  features, 
  href 
}: ProductionModuleProps) {
  const statusColors = {
    live: 'bg-green-100 text-green-800',
    ready: 'bg-blue-100 text-blue-800',
    testing: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
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
          <Badge className={statusColors[status]}>
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold text-lg text-green-600">{performance}%</div>
              <div className="text-gray-600">Performance</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold text-lg text-blue-600">{users}</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold text-lg text-purple-600">{uptime}</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>

          {/* Feature List */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Key Features:</div>
            <div className="space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-gray-600">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
              {features.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{features.length - 3} more features
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Link href={href}>
            <Button className="w-full" size="sm">
              Access Module
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductionSuite() {
  const productionModules = [
    {
      title: "Executive Dashboard",
      description: "Real-time KPIs, sales pipeline, and performance metrics",
      status: 'live' as const,
      performance: 98,
      users: 247,
      uptime: "99.9%",
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      features: [
        "Real-time sales metrics",
        "Performance analytics",
        "Team leaderboards",
        "Revenue forecasting",
        "Custom dashboards"
      ],
      href: "/"
    },
    {
      title: "Customer Intelligence",
      description: "AI-powered customer insights and behavioral analytics",
      status: 'live' as const,
      performance: 95,
      users: 189,
      uptime: "99.8%",
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      features: [
        "Predictive analytics",
        "Customer segmentation",
        "Behavior tracking",
        "Purchase predictions",
        "Churn prevention"
      ],
      href: "/ai-smart-search"
    },
    {
      title: "Workflow Automation",
      description: "Intelligent process automation and task management",
      status: 'live' as const,
      performance: 97,
      users: 156,
      uptime: "99.7%",
      icon: <Workflow className="w-5 h-5 text-green-600" />,
      features: [
        "Automated follow-ups",
        "Lead distribution",
        "Task scheduling",
        "Process templates",
        "Performance monitoring"
      ],
      href: "/workflow-assistant"
    },
    {
      title: "Advanced Reporting",
      description: "Comprehensive business intelligence and analytics",
      status: 'live' as const,
      performance: 94,
      users: 134,
      uptime: "99.6%",
      icon: <BarChart3 className="w-5 h-5 text-orange-600" />,
      features: [
        "Executive summaries",
        "Financial analytics",
        "Custom reports",
        "Scheduled delivery",
        "Data visualization"
      ],
      href: "/reports"
    },
    {
      title: "System Health Monitor",
      description: "Real-time system monitoring and performance tracking",
      status: 'live' as const,
      performance: 99,
      users: 23,
      uptime: "99.9%",
      icon: <Shield className="w-5 h-5 text-red-600" />,
      features: [
        "Real-time monitoring",
        "Security scanning",
        "Performance alerts",
        "Uptime tracking",
        "System diagnostics"
      ],
      href: "/system-health"
    },
    {
      title: "Enterprise Administration",
      description: "Comprehensive system configuration and user management",
      status: 'live' as const,
      performance: 96,
      users: 12,
      uptime: "99.8%",
      icon: <Settings className="w-5 h-5 text-indigo-600" />,
      features: [
        "User management",
        "Security controls",
        "System configuration",
        "API management",
        "Audit logging"
      ],
      href: "/enterprise-admin"
    },
    {
      title: "Mobile Deal Desk",
      description: "Full-featured mobile dealership management interface",
      status: 'live' as const,
      performance: 93,
      users: 89,
      uptime: "99.5%",
      icon: <Smartphone className="w-5 h-5 text-teal-600" />,
      features: [
        "Touch-friendly interface",
        "Real-time calculations",
        "Mobile optimized",
        "Offline capability",
        "Responsive design"
      ],
      href: "/showroom-manager"
    },
    {
      title: "Inventory Intelligence",
      description: "AI-powered inventory management and pricing optimization",
      status: 'live' as const,
      performance: 91,
      users: 167,
      uptime: "99.4%",
      icon: <Car className="w-5 h-5 text-yellow-600" />,
      features: [
        "Smart pricing",
        "Market analysis",
        "Inventory tracking",
        "Valuation tools",
        "Competitive insights"
      ],
      href: "/inventory"
    }
  ];

  const systemStats = [
    { label: "Total Active Users", value: "1,247", change: "+18%", icon: <Users className="w-5 h-5 text-blue-600" /> },
    { label: "Monthly Transactions", value: "$2.4M", change: "+12%", icon: <DollarSign className="w-5 h-5 text-green-600" /> },
    { label: "System Uptime", value: "99.8%", change: "+0.2%", icon: <Activity className="w-5 h-5 text-purple-600" /> },
    { label: "Performance Score", value: "96/100", change: "+4", icon: <Target className="w-5 h-5 text-orange-600" /> }
  ];

  const recentAchievements = [
    {
      title: "Production Deployment Complete",
      description: "All enterprise modules successfully deployed to production",
      time: "2 hours ago",
      type: "deployment"
    },
    {
      title: "99.9% Uptime Achieved",
      description: "Exceeded enterprise SLA targets for system availability",
      time: "1 day ago",
      type: "performance"
    },
    {
      title: "Security Audit Passed",
      description: "Enterprise security compliance verification completed",
      time: "2 days ago",
      type: "security"
    },
    {
      title: "User Adoption Milestone",
      description: "Reached 1,000+ active monthly users across all modules",
      time: "1 week ago",
      type: "growth"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AutolytiQ Production Suite</h1>
          <p className="text-gray-600 text-lg">Enterprise-grade dealership management platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            Production Ready
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 px-3 py-1">
            <Globe className="w-4 h-4 mr-2" />
            autolytiq.com
          </Badge>
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {systemStats.map((stat, index) => (
          <Card key={index} className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {stat.icon}
                <Badge variant="outline" className="text-green-600">
                  {stat.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Production Status Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="w-6 h-6 mr-2" />
            Production Status: LIVE & OPERATIONAL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">8/8</div>
              <div className="text-sm text-gray-700">Modules Deployed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">99.8%</div>
              <div className="text-sm text-gray-700">System Availability</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">1,247</div>
              <div className="text-sm text-gray-700">Active Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Modules Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Enterprise Modules</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {productionModules.map((module, index) => (
            <ProductionModule key={index} {...module} />
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  achievement.type === 'deployment' ? 'bg-green-500' :
                  achievement.type === 'performance' ? 'bg-blue-500' :
                  achievement.type === 'security' ? 'bg-red-500' : 'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{achievement.title}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                  <div className="text-xs text-gray-500 mt-1">{achievement.time}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {achievement.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/">
              <Button variant="outline" className="w-full h-16 flex-col">
                <Monitor className="w-5 h-5 mb-1" />
                <span className="text-xs">Dashboard</span>
              </Button>
            </Link>
            <Link href="/enterprise-admin">
              <Button variant="outline" className="w-full h-16 flex-col">
                <Settings className="w-5 h-5 mb-1" />
                <span className="text-xs">Admin</span>
              </Button>
            </Link>
            <Link href="/inventory">
              <Button variant="outline" className="w-full h-16 flex-col">
                <Car className="w-5 h-5 mb-1" />
                <span className="text-xs">Inventory</span>
              </Button>
            </Link>
            <Link href="/showroom-manager">
              <Button variant="outline" className="w-full h-16 flex-col">
                <Smartphone className="w-5 h-5 mb-1" />
                <span className="text-xs">Deal Desk</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}