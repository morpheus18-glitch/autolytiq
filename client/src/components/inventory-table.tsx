import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePixelTracker } from "@/hooks/use-pixel-tracker";
import { Edit, Eye, Trash2, Filter, Target } from "lucide-react";
import type { Vehicle } from "@shared/schema";
import VehicleModal from "./vehicle-modal";

interface InventoryTableProps {
  showAddButton?: boolean;
  limit?: number;
}

export default function InventoryTable({ showAddButton = true, limit }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackVehicleView, trackSearch, trackFilterUsage, trackInteraction } = usePixelTracker();

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Vehicle deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete vehicle", variant: "destructive" });
    },
  });

  const generatePricingMutation = useMutation({
    mutationFn: async (vehicle: Vehicle) => {
      const response = await apiRequest("/api/generate-pricing-insights", {
        method: "POST",
        body: {
          vehicleId: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          currentPrice: parseFloat(vehicle.price),
          mileage: vehicle.mileage
        }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-insights"] });
      toast({ title: "Pricing insights generated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to generate pricing insights", variant: "destructive" });
    },
  });

  const handleEdit = (vehicle: Vehicle) => {
    trackInteraction('vehicle_edit', `vehicle-${vehicle.id}`, vehicle.id);
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      trackInteraction('vehicle_delete', `vehicle-${id}`, id);
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    trackInteraction('vehicle_add', 'add-vehicle-button');
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleVehicleView = (vehicle: Vehicle) => {
    trackVehicleView(vehicle.id, {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      status: vehicle.status
    });
    // Navigate to vehicle detail page
    setLocation(`/inventory/${vehicle.id}`);
  };

  const handleGeneratePricing = (vehicle: Vehicle) => {
    trackInteraction('pricing_insights', `vehicle-${vehicle.id}`, vehicle.id);
    generatePricingMutation.mutate(vehicle);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      trackSearch(term);
    }
  };

  const filteredVehicles = vehicles?.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const displayedVehicles = limit ? filteredVehicles.slice(0, limit) : filteredVehicles;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {limit ? "Recent Inventory" : "Inventory"}
            </h3>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
              {showAddButton && (
                <Button onClick={handleAddNew} className="bg-primary hover:bg-blue-700">
                  Add Vehicle
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No vehicles found
                    </td>
                  </tr>
                ) : (
                  displayedVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50" onClick={() => handleVehicleView(vehicle)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {vehicle.imageUrl ? (
                            <img
                              src={vehicle.imageUrl}
                              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                              className="w-16 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.year}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.vin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${vehicle.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(vehicle.status)} capitalize`}>
                          {vehicle.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(vehicle);
                            }}
                            className="text-primary hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVehicleView(vehicle);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGeneratePricing(vehicle);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            disabled={generatePricingMutation.isPending}
                            title="Generate Pricing Insights"
                          >
                            <Target className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(vehicle.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {!limit && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {displayedVehicles.length} of {filteredVehicles.length} vehicles
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                  <Button size="sm" className="bg-primary text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <VehicleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        vehicle={selectedVehicle}
      />
    </>
  );
}
