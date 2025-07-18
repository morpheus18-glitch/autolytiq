import { Card, CardContent } from "@/components/ui/card";
import { Car, DollarSign, UserPlus, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface MetricsData {
  totalInventory: number;
  monthlySales: number;
  activeLeads: number;
  avgDaysToSale: number;
}

export default function MetricsGrid() {
  const { data: metrics, isLoading } = useQuery<MetricsData>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3 sm:p-6">
              <div className="h-16 sm:h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="text-center text-gray-500 text-sm">No metrics available</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metricItems = [
    {
      title: "Total Inventory",
      value: metrics.totalInventory.toString(),
      icon: Car,
      color: "bg-blue-100 text-primary",
      change: "+5.2%",
      changeColor: "text-green-600",
      href: "/inventory",
    },
    {
      title: "Monthly Sales",
      value: `$${metrics.monthlySales.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      change: "+12.1%",
      changeColor: "text-green-600",
      href: "/sales",
    },
    {
      title: "Active Leads",
      value: metrics.activeLeads.toString(),
      icon: UserPlus,
      color: "bg-orange-100 text-orange-600",
      change: "+3.8%",
      changeColor: "text-orange-600",
      href: "/sales",
    },
    {
      title: "Avg. Days to Sale",
      value: metrics.avgDaysToSale.toString(),
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
      change: "-2.3 days",
      changeColor: "text-green-600",
      href: "/analytics",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {metricItems.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Link key={index} href={metric.href}>
            <Card className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">{metric.title}</p>
                    <p className="text-lg sm:text-3xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${metric.color} self-end sm:self-auto mt-2 sm:mt-0`}>
                    <Icon className="text-sm sm:text-xl" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-4 flex items-center">
                  <span className={`text-xs sm:text-sm font-medium ${metric.changeColor}`}>
                    {metric.change}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm ml-2 hidden sm:inline">from last month</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
