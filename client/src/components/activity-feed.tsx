import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Handshake, Plus, UserPlus, Users } from "lucide-react";
import type { Activity } from "@shared/schema";

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale_completed":
        return <Handshake className="text-green-600 text-sm" />;
      case "vehicle_added":
        return <Plus className="text-primary text-sm" />;
      case "lead_created":
        return <UserPlus className="text-orange-600 text-sm" />;
      default:
        return <Users className="text-gray-600 text-sm" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "sale_completed":
        return "bg-green-100";
      case "vehicle_added":
        return "bg-blue-100";
      case "lead_created":
        return "bg-orange-100";
      default:
        return "bg-gray-100";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / 60000);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {activities?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              activities?.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="text-gray-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-500">12 sales this month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">$340K</p>
                <p className="text-xs text-green-600">+15%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="text-gray-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">8 sales this month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">$245K</p>
                <p className="text-xs text-green-600">+8%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="text-gray-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mike Wilson</p>
                  <p className="text-sm text-gray-500">7 sales this month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">$198K</p>
                <p className="text-xs text-green-600">+12%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
