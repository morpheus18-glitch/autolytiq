import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import MetricsGrid from "@/components/metrics-grid";
import InventoryTable from "@/components/inventory-table";
import ActivityFeed from "@/components/activity-feed";
import CompetitiveInsights from "@/components/competitive-insights";
import { useState } from "react";
import VehicleModal from "@/components/vehicle-modal";
import { useToast } from "@/hooks/use-toast";
import { usePixelTracker } from "@/hooks/use-pixel-tracker";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { trackInteraction } = usePixelTracker();

  const handleNotificationClick = () => {
    trackInteraction('notification_click', 'dashboard-bell');
    toast({
      title: "Notifications",
      description: "You have 3 new notifications: 2 new leads and 1 inventory alert",
    });
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 text-sm sm:text-base hidden sm:block">Welcome back, here's what's happening at your dealership</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              size="sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Vehicle</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <div className="relative">
              <Bell 
                className="text-gray-400 text-lg sm:text-xl cursor-pointer hover:text-gray-600" 
                onClick={handleNotificationClick}
              />
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                3
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-3 sm:p-6">
        <MetricsGrid />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InventoryTable showAddButton={false} limit={10} />
          </div>
          
          <div className="space-y-6">
            <ActivityFeed />
            <CompetitiveInsights />
          </div>
        </div>
      </main>

      <VehicleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        vehicle={null}
      />
    </div>
  );
}
