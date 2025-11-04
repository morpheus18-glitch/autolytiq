import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Wrench, Calendar, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceOrder, Customer, Vehicle, User } from "@shared/schema";

export default function ServiceOrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: serviceOrders = [], isLoading: ordersLoading } = useQuery<ServiceOrder[]>({
    queryKey: ["/api/service-orders"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("/api/service-orders", {
        method: "POST",
        body: orderData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      toast({ title: "Service order created successfully" });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create service order", variant: "destructive" });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<ServiceOrder> }) => {
      return await apiRequest(`/api/service-orders/${id}`, {
        method: "PUT",
        body: updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      toast({ title: "Service order updated successfully" });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update service order", variant: "destructive" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/service-orders/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      toast({ title: "Service order deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete service order", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const orderData = {
      workOrderNumber: formData.get("workOrderNumber") as string,
      customerId: parseInt(formData.get("customerId") as string),
      vehicleId: parseInt(formData.get("vehicleId") as string),
      serviceAdvisorId: parseInt(formData.get("serviceAdvisorId") as string),
      technicianId: parseInt(formData.get("technicianId") as string),
      status: formData.get("status") as string,
      serviceType: formData.get("serviceType") as string,
      description: formData.get("description") as string,
      laborRate: parseFloat(formData.get("laborRate") as string),
      scheduledDate: formData.get("scheduledDate") as string,
      notes: formData.get("notes") as string,
    };

    if (selectedOrder) {
      updateOrderMutation.mutate({ id: selectedOrder.id, updates: orderData });
    } else {
      createOrderMutation.mutate(orderData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "Unknown Customer";
  };

  const getVehicleInfo = (vehicleId: number | null) => {
    if (!vehicleId) return "No Vehicle";
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Unknown Vehicle";
  };

  const getUserName = (userId: number | null) => {
    if (!userId) return "Unassigned";
    const user = users.find(u => u.id === userId);
    return user?.name || "Unknown User";
  };

  const totalAmount = serviceOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || "0"), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Orders</h1>
          <p className="text-gray-600">Manage vehicle service and maintenance orders</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedOrder(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Service Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedOrder ? "Edit Service Order" : "Create New Service Order"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workOrderNumber">Work Order Number</Label>
                  <Input
                    id="workOrderNumber"
                    name="workOrderNumber"
                    defaultValue={selectedOrder?.workOrderNumber || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerId">Customer</Label>
                  <Select name="customerId" defaultValue={selectedOrder?.customerId.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleId">Vehicle</Label>
                  <Select name="vehicleId" defaultValue={selectedOrder?.vehicleId?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select name="serviceType" defaultValue={selectedOrder?.serviceType || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceAdvisorId">Service Advisor</Label>
                  <Select name="serviceAdvisorId" defaultValue={selectedOrder?.serviceAdvisorId?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service advisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="technicianId">Technician</Label>
                  <Select name="technicianId" defaultValue={selectedOrder?.technicianId?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedOrder?.status || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="laborRate">Labor Rate</Label>
                  <Input
                    id="laborRate"
                    name="laborRate"
                    type="number"
                    step="0.01"
                    defaultValue={selectedOrder?.laborRate || ""}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  name="scheduledDate"
                  type="datetime-local"
                  defaultValue={selectedOrder?.scheduledDate ? new Date(selectedOrder.scheduledDate).toISOString().slice(0, 16) : ""}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={selectedOrder?.description || ""}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={selectedOrder?.notes || ""}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createOrderMutation.isPending || updateOrderMutation.isPending}>
                  {selectedOrder ? "Update" : "Create"} Service Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Service Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{serviceOrders.length}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{serviceOrders.filter(o => o.status === 'in_progress').length}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{serviceOrders.filter(o => o.status === 'completed').length}</p>
              </div>
              <Wrench className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {ordersLoading ? (
          <div className="text-center py-8">Loading service orders...</div>
        ) : serviceOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No service orders found</h3>
              <p className="text-gray-600">Create your first service order to get started.</p>
            </CardContent>
          </Card>
        ) : (
          serviceOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">#{order.workOrderNumber}</CardTitle>
                      <p className="text-sm text-gray-600">{getCustomerName(order.customerId)} • {getVehicleInfo(order.vehicleId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.totalAmount}</p>
                      <p className="text-xs text-gray-500">{order.serviceType}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOrderMutation.mutate(order.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Service Advisor:</strong> {getUserName(order.serviceAdvisorId)}</p>
                    <p><strong>Technician:</strong> {getUserName(order.technicianId)}</p>
                  </div>
                  <div>
                    <p><strong>Scheduled:</strong> {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : 'Not scheduled'}</p>
                    <p><strong>Labor Hours:</strong> {order.laborHours || 0}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{order.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}