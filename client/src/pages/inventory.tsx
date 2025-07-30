import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import EnhancedInventorySearch from '@/components/enhanced-inventory-search';
import VehicleModal from '@/components/vehicle-modal';
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
import type { Vehicle } from '@shared/schema';

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEnhancedSearch, setShowEnhancedSearch] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMake, setFilterMake] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    price: '',
    status: 'available',
    description: ''
  });
  const [vinDecoding, setVinDecoding] = useState(false);
  const [valuationModal, setValuationModal] = useState<{
    vehicle: Vehicle;
    data: any;
  } | null>(null);

  const { data: vehicles = [], isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicle: any) => {
      const vehicleData = {
        ...vehicle,
        year: parseInt(vehicle.year),
        price: parseFloat(vehicle.price)
      };
      return await apiRequest('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleData),
      });
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  const getPricingInsightsMutation = useMutation({
    mutationFn: async (vehicleId: number) => {
      return await apiRequest(`/api/pricing-insights/${vehicleId}`, {
        method: 'POST',
      });
    },
    onSuccess: (data, vehicleId) => {
      const vehicle = vehicles?.find(v => v.id === vehicleId);
      if (vehicle) {
        setValuationModal({ vehicle, data });
      }
      toast({
        title: "Pricing Insights",
        description: "Pricing analysis completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get pricing insights",
        variant: "destructive",
      });
    },
  });

  const handleVinDecode = async (vin: string) => {
    if (!vin || vin.length !== 17) {
      toast({
        title: "Invalid VIN",
        description: "VIN must be exactly 17 characters",
        variant: "destructive",
      });
      return;
    }

    setVinDecoding(true);
    try {
      const response = await fetch(`/api/decode-vin/${vin}`);
      if (response.ok) {
        const decodedData = await response.json();
        setNewVehicle(prev => ({
          ...prev,
          make: decodedData.make || prev.make,
          model: decodedData.model || prev.model,
          year: decodedData.year ? decodedData.year.toString() : prev.year,
          description: decodedData.trim ? `${decodedData.trim} ${decodedData.bodyStyle || ''}`.trim() : prev.description
        }));
        toast({
          title: "VIN Decoded Successfully",
          description: `${decodedData.year} ${decodedData.make} ${decodedData.model}`,
        });
      } else {
        throw new Error('Failed to decode VIN');
      }
    } catch (error) {
      toast({
        title: "VIN Decode Failed",
        description: "Unable to decode VIN. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setVinDecoding(false);
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

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowEditDialog(true);
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle || !editingVehicle.make || !editingVehicle.model || !editingVehicle.year || !editingVehicle.vin || !editingVehicle.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest(`/api/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        body: editingVehicle
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      setShowEditDialog(false);
      setEditingVehicle(null);
      
      toast({
        title: "Success",
        description: "Vehicle updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update vehicle",
        variant: "destructive"
      });
    }
  };

  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'sold': return <DollarSign className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
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
          <h1 className="text-2xl md:text-3xl font-bold">AutolytiQ - Inventory Management</h1>
          <p className="text-gray-600">Manage your vehicle inventory with VIN decoding and pricing insights</p>
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
              <div className="space-y-4">
                {/* VIN Input Section */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label htmlFor="vin" className="text-sm font-medium text-blue-900">VIN * (Auto-decode vehicle info)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="vin"
                      value={newVehicle.vin}
                      onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value.toUpperCase()})}
                      placeholder="1HGBH41JXMN109186"
                      className="flex-1"
                      maxLength={17}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleVinDecode(newVehicle.vin)}
                      disabled={vinDecoding || newVehicle.vin.length !== 17}
                      className="whitespace-nowrap"
                    >
                      {vinDecoding ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Decoding...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span>Decode</span>
                        </div>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Enter 17-character VIN and click Decode to auto-fill vehicle details</p>
                </div>

                {/* Vehicle Details Grid */}
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
                      min="1900"
                      max="2030"
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Inventory</p>
                <p className="text-lg md:text-2xl font-bold">{vehicles.length}</p>
              </div>
              <Car className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Available</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">
                  {vehicles.filter((v: Vehicle) => v.status === 'available').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Pending</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-600">
                  {vehicles.filter((v: Vehicle) => v.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Value</p>
                <p className="text-sm md:text-2xl font-bold">
                  ${vehicles.reduce((sum: number, v: Vehicle) => sum + v.price, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by make, model, or VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterMake} onValueChange={setFilterMake}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              {uniqueMakes.map(make => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
          <p className="text-gray-600 mb-4">Add your first vehicle to get started</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredVehicles.map((vehicle: Vehicle) => (
              <Card 
                key={vehicle.id} 
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  trackInteraction('vehicle_view', `vehicle-${vehicle.id}`, vehicle.id);
                  setSelectedVehicle(vehicle);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                    <p className="text-xs text-gray-600 font-mono truncate">{vehicle.vin}</p>
                  </div>
                  <Badge className={`${getStatusColor(vehicle.status)} text-xs px-2 py-1 ml-2`}>
                    {getStatusIcon(vehicle.status)}
                    <span className="ml-1 hidden sm:inline">{vehicle.status}</span>
                  </Badge>
                </div>
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Price:</span>
                    <span className="font-semibold text-sm">${vehicle.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Added:</span>
                    <span className="text-xs">{new Date(vehicle.createdAt).toLocaleDateString()}</span>
                  </div>
                  {vehicle.description && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-700 truncate">{vehicle.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => getPricingInsightsMutation.mutate(vehicle.id)}
                    disabled={getPricingInsightsMutation.isPending}
                    className="p-2"
                  >
                    <TrendingUp className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="p-2">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteVehicleMutation.mutate(vehicle.id)} className="p-2">
                    <Trash2 className="h-3 w-3" />
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
                    <TableRow 
                      key={vehicle.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        trackInteraction('vehicle_view', `vehicle-${vehicle.id}`, vehicle.id);
                        setSelectedVehicle(vehicle);
                        setIsModalOpen(true);
                      }}
                    >
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}

      {/* Valuation Modal */}
      <Dialog open={!!valuationModal} onOpenChange={() => setValuationModal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vehicle Valuation Report
            </DialogTitle>
            <DialogDescription>
              {valuationModal?.vehicle && `${valuationModal.vehicle.year} ${valuationModal.vehicle.make} ${valuationModal.vehicle.model}`}
            </DialogDescription>
          </DialogHeader>
          
          {valuationModal && (
            <div className="space-y-6">
              {/* Vehicle Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Vehicle</Label>
                    <p className="font-semibold">{valuationModal.vehicle.year} {valuationModal.vehicle.make} {valuationModal.vehicle.model}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">VIN</Label>
                    <p className="font-mono text-sm">{valuationModal.vehicle.vin}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Price</Label>
                    <p className="font-semibold text-lg text-blue-600">${valuationModal.vehicle.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className={getStatusColor(valuationModal.vehicle.status)}>
                      {valuationModal.vehicle.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Market Analysis */}
              {valuationModal.data.marketAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Average Market Value</Label>
                        <p className="text-2xl font-bold text-green-600">
                          {valuationModal.data.marketAnalysis.averageMarketValue 
                            ? `$${valuationModal.data.marketAnalysis.averageMarketValue.toLocaleString()}`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Recommended Price</Label>
                        <p className="text-2xl font-bold text-blue-600">
                          {valuationModal.data.marketAnalysis.recommendedPrice 
                            ? `$${valuationModal.data.marketAnalysis.recommendedPrice.toLocaleString()}`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Competitive Position</Label>
                        <div className="flex items-center justify-center gap-2">
                          {valuationModal.data.marketAnalysis.competitivePosition === 'above_market' ? (
                            <>
                              <AlertCircle className="h-5 w-5 text-orange-500" />
                              <span className="text-orange-600 font-semibold">Above Market</span>
                            </>
                          ) : valuationModal.data.marketAnalysis.competitivePosition === 'below_market' ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-green-600 font-semibold">Below Market</span>
                            </>
                          ) : (
                            <span className="text-gray-600">Unknown</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {valuationModal.data.marketAnalysis.pricingRecommendation && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <Label className="text-sm font-medium text-blue-800">Pricing Recommendation</Label>
                        <p className="text-blue-700 mt-1">{valuationModal.data.marketAnalysis.pricingRecommendation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Valuation Sources */}
              {valuationModal.data.valuations && valuationModal.data.valuations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Valuation Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {valuationModal.data.valuations.map((valuation: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{valuation.source}</h4>
                              <p className="text-sm text-gray-600">
                                Confidence: {valuation.confidence} • 
                                Updated: {new Date(valuation.lastUpdated).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {valuation.marketValue && (
                              <div>
                                <Label className="text-gray-600">Market Value</Label>
                                <p className="font-semibold">${valuation.marketValue.toLocaleString()}</p>
                              </div>
                            )}
                            {valuation.tradeInValue && (
                              <div>
                                <Label className="text-gray-600">Trade-In</Label>
                                <p className="font-semibold">${valuation.tradeInValue.toLocaleString()}</p>
                              </div>
                            )}
                            {valuation.retailValue && (
                              <div>
                                <Label className="text-gray-600">Retail</Label>
                                <p className="font-semibold">${valuation.retailValue.toLocaleString()}</p>
                              </div>
                            )}
                            {valuation.privatePartyValue && (
                              <div>
                                <Label className="text-gray-600">Private Party</Label>
                                <p className="font-semibold">${valuation.privatePartyValue.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* VIN Decode Data */}
              {valuationModal.data.vinData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vehicle Specifications</CardTitle>
                    <CardDescription>Data from VIN decode</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      {Object.entries(valuationModal.data.vinData).map(([key, value]) => (
                        value && (
                          <div key={key}>
                            <Label className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                            <p className="font-medium">{String(value)}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}