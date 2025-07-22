import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Car, User, DollarSign, ArrowRight } from "lucide-react";

interface QuickDealCreatorProps {
  selectedCustomerId?: string;
  selectedVehicleId?: string;
  onDealCreated?: (dealId: string) => void;
}

export default function QuickDealCreator({ 
  selectedCustomerId, 
  selectedVehicleId, 
  onDealCreated 
}: QuickDealCreatorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  const [customerId, setCustomerId] = useState(selectedCustomerId || '');
  const [vehicleId, setVehicleId] = useState(selectedVehicleId || '');
  const [dealType, setDealType] = useState('retail');
  const [salePrice, setSalePrice] = useState('');
  const [cashDown, setCashDown] = useState('');

  // Fetch customers and vehicles
  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      const response = await apiRequest('POST', '/api/deals', dealData);
      return response.json();
    },
    onSuccess: (deal) => {
      toast({
        title: "Deal Created Successfully",
        description: `Deal ${deal.dealNumber} has been created and is ready for structuring.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      
      if (onDealCreated) {
        onDealCreated(deal.id);
      } else {
        // Navigate to deal desk with the new deal
        navigate(`/deals`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Deal",
        description: error.message || "There was an error creating the deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedCustomer = customers.find((c: any) => c.id.toString() === customerId);
  const selectedVehicle = vehicles.find((v: any) => v.id.toString() === vehicleId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || !vehicleId) {
      toast({
        title: "Missing Information",
        description: "Please select both a customer and a vehicle to create a deal.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCustomer || !selectedVehicle) {
      toast({
        title: "Invalid Selection",
        description: "Selected customer or vehicle not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const dealData = {
      customerId: customerId,
      vehicleId: vehicleId,
      buyerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      dealType: dealType,
      salePrice: salePrice ? parseInt(salePrice) : selectedVehicle.price || 0,
      cashDown: cashDown ? parseInt(cashDown) : 0,
      status: 'structuring',
    };

    createDealMutation.mutate(dealData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Quick Deal Creator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer
            </Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer: any) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.firstName} {customer.lastName} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Vehicle
            </Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle: any) => (
                  <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price?.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deal Type */}
          <div className="space-y-2">
            <Label htmlFor="dealType">Deal Type</Label>
            <Select value={dealType} onValueChange={setDealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="lease">Lease</SelectItem>
                <SelectItem value="cash">Cash Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sale Price */}
          <div className="space-y-2">
            <Label htmlFor="salePrice" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Sale Price
            </Label>
            <Input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder={selectedVehicle?.price?.toString() || "Enter sale price"}
            />
          </div>

          {/* Cash Down */}
          <div className="space-y-2">
            <Label htmlFor="cashDown">Cash Down Payment</Label>
            <Input
              type="number"
              value={cashDown}
              onChange={(e) => setCashDown(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Selected Items Summary */}
          {(selectedCustomer || selectedVehicle) && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <h4 className="font-medium text-blue-900">Deal Summary</h4>
              {selectedCustomer && (
                <p className="text-sm text-blue-700">
                  Customer: {selectedCustomer.firstName} {selectedCustomer.lastName}
                </p>
              )}
              {selectedVehicle && (
                <p className="text-sm text-blue-700">
                  Vehicle: {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </p>
              )}
              {salePrice && (
                <p className="text-sm text-blue-700">
                  Sale Price: ${parseInt(salePrice).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full btn-aiq-primary"
            disabled={createDealMutation.isPending || !customerId || !vehicleId}
          >
            {createDealMutation.isPending ? "Creating Deal..." : "Create Deal & Start Structuring"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}