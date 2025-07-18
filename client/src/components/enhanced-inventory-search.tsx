import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdvancedSearch, { type FilterOption, type SearchFilters } from "@/components/advanced-search";
import { useAdvancedSearch, commonFilters } from "@/hooks/use-advanced-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye, Target, Car, DollarSign, Calendar, MapPin } from "lucide-react";
import type { Vehicle } from "@shared/schema";

interface EnhancedInventorySearchProps {
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: number) => void;
  onView?: (vehicle: Vehicle) => void;
  onGeneratePricing?: (vehicle: Vehicle) => void;
  showAddButton?: boolean;
  onAdd?: () => void;
}

export default function EnhancedInventorySearch({
  onEdit,
  onDelete,
  onView,
  onGeneratePricing,
  showAddButton = true,
  onAdd
}: EnhancedInventorySearchProps) {
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Define filter options
  const filterOptions: FilterOption[] = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "available", label: "Available" },
        { value: "pending", label: "Pending" },
        { value: "sold", label: "Sold" },
        { value: "maintenance", label: "In Maintenance" },
        { value: "reserved", label: "Reserved" }
      ]
    },
    {
      id: "make",
      label: "Make",
      type: "select",
      options: [
        { value: "honda", label: "Honda" },
        { value: "toyota", label: "Toyota" },
        { value: "ford", label: "Ford" },
        { value: "chevrolet", label: "Chevrolet" },
        { value: "nissan", label: "Nissan" },
        { value: "bmw", label: "BMW" },
        { value: "mercedes", label: "Mercedes-Benz" },
        { value: "audi", label: "Audi" },
        { value: "lexus", label: "Lexus" },
        { value: "volkswagen", label: "Volkswagen" }
      ]
    },
    {
      id: "year",
      label: "Year Range",
      type: "range",
      min: 2000,
      max: 2025
    },
    {
      id: "price",
      label: "Price Range",
      type: "range",
      min: 0,
      max: 100000
    },
    {
      id: "mileage",
      label: "Mileage Range",
      type: "range",
      min: 0,
      max: 200000
    },
    {
      id: "condition",
      label: "Condition",
      type: "multiselect",
      options: [
        { value: "excellent", label: "Excellent" },
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" }
      ]
    },
    {
      id: "transmission",
      label: "Transmission",
      type: "select",
      options: [
        { value: "automatic", label: "Automatic" },
        { value: "manual", label: "Manual" },
        { value: "cvt", label: "CVT" }
      ]
    },
    {
      id: "fuelType",
      label: "Fuel Type",
      type: "select",
      options: [
        { value: "gasoline", label: "Gasoline" },
        { value: "hybrid", label: "Hybrid" },
        { value: "electric", label: "Electric" },
        { value: "diesel", label: "Diesel" }
      ]
    },
    {
      id: "bodyStyle",
      label: "Body Style",
      type: "select",
      options: [
        { value: "sedan", label: "Sedan" },
        { value: "suv", label: "SUV" },
        { value: "truck", label: "Truck" },
        { value: "coupe", label: "Coupe" },
        { value: "hatchback", label: "Hatchback" },
        { value: "wagon", label: "Wagon" },
        { value: "convertible", label: "Convertible" }
      ]
    },
    {
      id: "dateAdded",
      label: "Date Added",
      type: "date"
    },
    {
      id: "certified",
      label: "Certified Pre-Owned",
      type: "boolean"
    }
  ];

  // Define custom filter functions
  const filterFunctions = {
    status: commonFilters.status,
    make: (vehicle: Vehicle, value: string) => 
      vehicle.make.toLowerCase() === value.toLowerCase(),
    year: commonFilters.numericRange<Vehicle>("year"),
    price: commonFilters.numericRange<Vehicle>("price"),
    mileage: commonFilters.numericRange<Vehicle>("mileage"),
    condition: commonFilters.multiSelect<Vehicle>("condition"),
    transmission: (vehicle: Vehicle, value: string) => 
      vehicle.transmission?.toLowerCase() === value.toLowerCase(),
    fuelType: (vehicle: Vehicle, value: string) => 
      vehicle.fuelType?.toLowerCase() === value.toLowerCase(),
    bodyStyle: (vehicle: Vehicle, value: string) => 
      vehicle.bodyStyle?.toLowerCase() === value.toLowerCase(),
    dateAdded: commonFilters.dateRange,
    certified: commonFilters.boolean<Vehicle>("certified")
  };

  // Use the advanced search hook
  const {
    filteredData,
    filters,
    handleFiltersChange,
    handleClear
  } = useAdvancedSearch({
    data: vehicles || [],
    searchFields: ["make", "model", "vin", "stockNumber", "color"],
    filterFunctions
  });

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalVehicles = filteredData.length;
    const totalValue = filteredData.reduce((sum, vehicle) => sum + (vehicle.price || 0), 0);
    const avgPrice = totalVehicles > 0 ? totalValue / totalVehicles : 0;
    const statusBreakdown = filteredData.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalVehicles,
      totalValue,
      avgPrice,
      statusBreakdown
    };
  }, [filteredData]);

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
      case "reserved":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advanced Search Component */}
      <AdvancedSearch
        searchPlaceholder="Search vehicles by make, model, VIN, stock number, or color..."
        filters={filterOptions}
        onFiltersChange={handleFiltersChange}
        onClear={handleClear}
      />

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold">{summaryStats.totalVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${summaryStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold">${summaryStats.avgPrice.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Status Breakdown</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(summaryStats.statusBreakdown).map(([status, count]) => (
                    <Badge key={status} variant="secondary" className="text-xs">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Vehicle Inventory ({filteredData.length} vehicles)
            </CardTitle>
            {showAddButton && onAdd && (
              <Button onClick={onAdd} className="bg-primary hover:bg-blue-700">
                Add Vehicle
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.color} • {vehicle.transmission} • {vehicle.fuelType}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{vehicle.vin}</TableCell>
                    <TableCell className="font-semibold">${vehicle.price?.toLocaleString()}</TableCell>
                    <TableCell>{vehicle.mileage?.toLocaleString()} miles</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {vehicle.location || "Lot A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {onView && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(vehicle)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(vehicle)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onGeneratePricing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGeneratePricing(vehicle)}
                          >
                            <Target className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(vehicle.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No vehicles found matching your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}