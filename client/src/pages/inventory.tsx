import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Car, 
  DollarSign, 
  Calendar, 
  BarChart3,
  TrendingUp,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Filter,
  Download,
  Upload,
  Camera,
  Star,
  Award,
  Zap,
  Target,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  CreditCard,
  Truck,
  Key,
  Wrench,
  Shield,
  Info
} from 'lucide-react';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  status: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMake, setFilterMake] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    price: '',
    status: 'available',
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ['/api/vehicles'],
    retry: 1,
    retryDelay: 1000,
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicle: any) => {
      const vehicleData = {
        ...vehicle,
        year: parseInt(vehicle.year),
        price: parseFloat(vehicle.price),
        imageUrl: null
      };
      return await apiRequest('/api/vehicles', 'POST', vehicleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      setShowAddDialog(false);
      setNewVehicle({
        make: '',
        model: '',
        year: '',
        vin: '',
        price: '',
        status: 'available',
        description: ''
      });
      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle",
        variant: "destructive",
      });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      return await apiRequest(`/api/vehicles/${id}`, 'PUT', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      setSelectedVehicle(null);
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/vehicles/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  const getPricingInsightsMutation = useMutation({
    mutationFn: async (vehicleId: number) => {
      // Simulate API call for pricing insights
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        marketValue: 26500,
        suggestedPrice: 28500,
        competitorPrices: [27000, 28000, 29000],
        daysOnMarket: 45,
        priceHistory: [29000, 28500, 28000]
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Pricing Insights",
        description: `Market value: $${data.marketValue.toLocaleString()}, Suggested: $${data.suggestedPrice.toLocaleString()}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get pricing insights",
        variant: "destructive",
      });
    },
  });

  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    const matchesSearch = vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    const matchesMake = filterMake === 'all' || vehicle.make === filterMake;
    return matchesSearch && matchesStatus && matchesMake;
  });

  const uniqueMakes = [...new Set(vehicles.map((v: Vehicle) => v.make))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'sold': return <Award className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const handleCreateVehicle = () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.year || !newVehicle.vin || !newVehicle.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createVehicleMutation.mutate(newVehicle);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Inventory</h3>
          <p className="text-gray-600 mb-4">Unable to load inventory data</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">Manage your vehicle inventory with pricing insights</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    placeholder="Camry"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                    placeholder="2023"
                  />
                </div>
                <div>
                  <Label htmlFor="vin">VIN *</Label>
                  <Input
                    id="vin"
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                    placeholder="1HGBH41JXMN109186"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newVehicle.price}
                    onChange={(e) => setNewVehicle({...newVehicle, price: e.target.value})}
                    placeholder="28500"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newVehicle.status} onValueChange={(value) => setNewVehicle({...newVehicle, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newVehicle.description}
                    onChange={(e) => setNewVehicle({...newVehicle, description: e.target.value})}
                    placeholder="Excellent condition, low mileage"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateVehicle} disabled={createVehicleMutation.isPending}>
                  {createVehicleMutation.isPending ? 'Adding...' : 'Add Vehicle'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="w-full md:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inventory</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {vehicles.filter((v: Vehicle) => v.status === 'available').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {vehicles.filter((v: Vehicle) => v.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">
                  ${vehicles.reduce((sum: number, v: Vehicle) => sum + v.price, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by make, model, or VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterMake} onValueChange={setFilterMake}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by make" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Makes</SelectItem>
            {uniqueMakes.map(make => (
              <SelectItem key={make} value={make}>{make}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading inventory...</p>
          </div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterMake !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first vehicle'}
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredVehicles.map((vehicle: Vehicle) => (
              <Card key={vehicle.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-gray-600">{vehicle.vin}</p>
                  </div>
                  <Badge className={getStatusColor(vehicle.status)}>
                    {getStatusIcon(vehicle.status)}
                    <span className="ml-1">{vehicle.status}</span>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="font-semibold">${vehicle.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Added:</span>
                    <span className="text-sm">{new Date(vehicle.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => getPricingInsightsMutation.mutate(vehicle.id)}
                    disabled={getPricingInsightsMutation.isPending}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteVehicleMutation.mutate(vehicle.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle: Vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                          <div className="text-sm text-gray-600">{vehicle.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{vehicle.vin}</TableCell>
                      <TableCell className="font-semibold">${vehicle.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(vehicle.status)}>
                          {getStatusIcon(vehicle.status)}
                          <span className="ml-1">{vehicle.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(vehicle.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => getPricingInsightsMutation.mutate(vehicle.id)}
                            disabled={getPricingInsightsMutation.isPending}
                            title="Get Pricing Insights"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Edit Vehicle">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                            title="Delete Vehicle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}