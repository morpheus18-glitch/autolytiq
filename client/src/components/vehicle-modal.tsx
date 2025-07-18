import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import VINDecoder from "@/components/vin-decoder";
import { insertVehicleSchema, type InsertVehicle, type Vehicle } from "@shared/schema";

interface VehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
}

export default function VehicleModal({ open, onOpenChange, vehicle }: VehicleModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      make: vehicle?.make || "",
      model: vehicle?.model || "",
      year: vehicle?.year || new Date().getFullYear(),
      vin: vehicle?.vin || "",
      price: vehicle?.price || 0,
      status: vehicle?.status || "available",
      description: vehicle?.description || "",
      imageUrl: vehicle?.imageUrl || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      const response = await apiRequest("POST", "/api/vehicles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Vehicle created successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create vehicle", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      const response = await apiRequest("PUT", `/api/vehicles/${vehicle?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Vehicle updated successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update vehicle", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertVehicle) => {
    if (vehicle) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleVINDecode = (decodedData: any) => {
    // Populate form with decoded data
    form.setValue("make", decodedData.make || "");
    form.setValue("model", decodedData.model || "");
    form.setValue("year", decodedData.year || new Date().getFullYear());
    form.setValue("vin", decodedData.vin || "");
    
    // Set additional fields if available
    if (decodedData.engine) form.setValue("engine", decodedData.engine);
    if (decodedData.transmission) form.setValue("transmission", decodedData.transmission);
    if (decodedData.fuelType) form.setValue("fuelType", decodedData.fuelType);
    if (decodedData.bodyStyle) form.setValue("bodyStyle", decodedData.bodyStyle);
    if (decodedData.doors) form.setValue("doors", decodedData.doors);
    if (decodedData.drivetrain) form.setValue("drivetrain", decodedData.drivetrain);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
        </DialogHeader>
        
        {!vehicle && (
          <div className="mb-6">
            <VINDecoder onDecodeSuccess={handleVINDecode} defaultVin={form.watch("vin")} />
          </div>
        )}
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                placeholder="e.g., BMW"
                {...form.register("make")}
                className="mt-1"
              />
              {form.formState.errors.make && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.make.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="e.g., M3"
                {...form.register("model")}
                className="mt-1"
              />
              {form.formState.errors.model && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.model.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max="2025"
                {...form.register("year", { valueAsNumber: true })}
                className="mt-1"
              />
              {form.formState.errors.year && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.year.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                placeholder="17-digit VIN"
                maxLength={17}
                {...form.register("vin")}
                className="mt-1"
              />
              {form.formState.errors.vin && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.vin.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="100"
                {...form.register("price", { valueAsNumber: true })}
                className="mt-1"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...form.register("imageUrl")}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Additional details about the vehicle..."
              {...form.register("description")}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {vehicle ? "Update" : "Save"} Vehicle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
