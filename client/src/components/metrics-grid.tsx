import { Card, CardContent } from "@/components/ui/card";
import { Car, DollarSign, UserPlus, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">No metrics available</div>
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
    },
    {
      title: "Monthly Sales",
      value: `$${metrics.monthlySales.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      change: "+12.1%",
      changeColor: "text-green-600",
    },
    {
      title: "Active Leads",
      value: metrics.activeLeads.toString(),
      icon: UserPlus,
      color: "bg-orange-100 text-orange-600",
      change: "+3.8%",
      changeColor: "text-orange-600",
    },
    {
      title: "Avg. Days to Sale",
      value: metrics.avgDaysToSale.toString(),
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
      change: "-2.3 days",
      changeColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricItems.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.color}`}>
                  <Icon className="text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${metric.changeColor}`}>
                  {metric.change}
                </span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
