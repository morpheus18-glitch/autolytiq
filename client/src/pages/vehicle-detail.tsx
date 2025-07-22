import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  DollarSign, 
  FileText, 
  Image, 
  ChevronLeft, 
  ChevronRight,
  Upload,
  Trash2,
  Eye,
  Tag,
  Clock,
  User,
  TrendingUp,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import type { Vehicle } from '@shared/schema';
import axios from 'axios';

interface ValuationData {
  kbb?: number;
  mmr?: number;
  blackBook?: number;
  jdPower?: number;
  lastUpdated?: string;
}

interface MediaItem {
  url: string;
  label: string;
  type: string;
}

interface AuditLog {
  user: string;
  action: string;
  timestamp: string;
}

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  usePixelTracker();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Vehicle>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newTag, setNewTag] = useState('');
  const [newNote, setNewNote] = useState('');
  const [pricingData, setPricingData] = useState({
    price: 0,
    reason: ''
  });

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ['/api/vehicles', id],
    enabled: !!id,
  });

  const { data: valuations } = useQuery<ValuationData>({
    queryKey: ['/api/valuations', id],
    enabled: !!id,
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: Partial<Vehicle>) => {
      const response = await apiRequest('PUT', `/api/vehicles/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({ title: 'Vehicle updated successfully' });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: 'Failed to update vehicle', variant: 'destructive' });
    },
  });

  const refreshValuationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/valuations/refresh/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/valuations', id] });
      toast({ title: 'Valuations refreshed successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to refresh valuations', variant: 'destructive' });
    },
  });

  const generatePhotosMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/vehicles/${id}/photos`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles', id] });
      toast({ title: 'Photos generated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to generate photos', variant: 'destructive' });
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: async (data: { price: number; reason: string; user: string }) => {
      const response = await axios.put(`/api/vehicles/${id}/pricing`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles', id] });
      toast({ title: 'Pricing updated successfully' });
      setPricingData({ price: 0, reason: '' });
    },
    onError: () => {
      toast({ title: 'Failed to update pricing', variant: 'destructive' });
    },
  });

  useEffect(() => {
    if (vehicle) {
      setEditData(vehicle);
      setPricingData({
        price: vehicle.price || 0,
        reason: ''
      });
    }
  }, [vehicle]);

  const handleSave = () => {
    updateVehicleMutation.mutate(editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(vehicle || {});
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const updatedTags = [...(editData.tags || []), newTag.trim()];
      setEditData({ ...editData, tags: updatedTags });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = (editData.tags || []).filter(tag => tag !== tagToRemove);
    setEditData({ ...editData, tags: updatedTags });
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newAuditLog: AuditLog = {
        user: 'Current User', // TODO: Get from auth context
        action: `Added note: ${newNote.trim()}`,
        timestamp: new Date().toISOString(),
      };
      const updatedLogs = [...(editData.auditLogs || []), newAuditLog];
      setEditData({ ...editData, auditLogs: updatedLogs });
      setNewNote('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
          <Button onClick={() => navigate('/inventory')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  const mediaItems: MediaItem[] = vehicle.media || [];
  const currentMedia = mediaItems[currentImageIndex];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/inventory')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={vehicle.status === 'available' ? 'default' : 'secondary'}
                    className="uppercase text-xs"
                  >
                    {vehicle.status}
                  </Badge>
                  <span className="text-sm font-bold text-green-600">
                    ${vehicle.price?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    size="sm"
                    disabled={updateVehicleMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">
                      {updateVehicleMutation.isPending ? 'Saving...' : 'Save'}
                    </span>
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile VIN Display */}
          <div className="mt-2 sm:hidden">
            <p className="text-xs text-gray-500 font-mono">VIN: {vehicle.vin}</p>
          </div>
          
          {/* Desktop VIN Display */}
          <div className="hidden sm:block mt-1">
            <p className="text-sm text-gray-500 font-mono">VIN: {vehicle.vin}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Quick Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600">Mileage</p>
  <p className="text-lg font-bold text-blue-900">
                    {vehicle?.mileage?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600">List Price</p>
                  <p className="text-lg font-bold text-green-900">
                    ${vehicle.price?.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-600">Days on Lot</p>
                  <p className="text-lg font-bold text-purple-900">
                    {vehicle.createdAt ? Math.floor((Date.now() - new Date(vehicle.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </p>
                </div>
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-orange-600">Market Value</p>
                  <p className="text-lg font-bold text-orange-900">
                    ${valuations?.kbb?.toLocaleString() || 'Loading...'}
                  </p>
                </div>
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Optimized Tabbed Interface */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Tabs defaultValue="details" className="w-full">
            <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg overflow-x-auto">
              <TabsList className="grid w-full grid-cols-6 bg-transparent h-auto p-0 min-w-max">
                <TabsTrigger 
                  value="details" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 py-3 px-3 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Vehicle </span>Details
                </TabsTrigger>
                <TabsTrigger 
                  value="valuations"
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 py-3 px-3 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Market </span>Valuations
                </TabsTrigger>
                <TabsTrigger 
                  value="history"
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 py-3 px-3 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Price </span>History
                </TabsTrigger>
                <TabsTrigger 
                  value="media"
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 py-3 px-3 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  <Image className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Media
                </TabsTrigger>
                <TabsTrigger 
                  value="pricing"
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 py-3 px-3 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Pricing
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 py-3 px-3 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Make</Label>
                          {isEditing ? (
                            <Input
                              value={editData.make || ''}
                              onChange={(e) => setEditData({ ...editData, make: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900 mt-1">{vehicle.make}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Model</Label>
                          {isEditing ? (
                            <Input
                              value={editData.model || ''}
                              onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900 mt-1">{vehicle.model}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Year</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editData.year || ''}
                              onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900 mt-1">{vehicle.year}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">VIN</Label>
                          <p className="text-sm font-mono text-gray-900 mt-1 bg-white p-2 rounded border">
                            {vehicle.vin}
                          </p>
                        </div>
                      </div>
                    </div>

                {/* Vehicle Specifications */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Mileage</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editData.mileage || ''}
                              onChange={(e) => setEditData({ ...editData, mileage: parseInt(e.target.value) })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {vehicle.mileage?.toLocaleString() || 'N/A'} miles
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Transmission</Label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {vehicle.transmission || 'Automatic'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Fuel Type</Label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {vehicle.fuelType || 'Gasoline'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Body Style</Label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {vehicle.bodyStyle || 'Sedan'}
                          </p>
                        </div>
                      </div>
                    </div>

              </div>
              
              {/* Pricing & Status - Full Width */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Pricing & Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">List Price</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editData.price || ''}
                              onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              ${vehicle.price?.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Status</Label>
                          {isEditing ? (
                            <select
                              value={editData.status || ''}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="w-full p-2 border rounded mt-1"
                            >
                              <option value="available">Available</option>
                              <option value="pending">Pending</option>
                              <option value="sold">Sold</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                          ) : (
                            <div className="mt-1">
                              <Badge 
                                variant={vehicle.status === 'available' ? 'default' : 'secondary'}
                                className="text-sm uppercase"
                              >
                                {vehicle.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Label className="text-sm font-medium text-gray-600">Description</Label>
                          {isEditing ? (
                            <Textarea
                              value={editData.description || ''}
                              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                              rows={3}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-gray-700 mt-1 p-3 bg-white rounded border">
                              {vehicle.description || 'No description available'}
                            </p>
                          )}
                  </div>
                </div>
              </div>
            </TabsContent>

                <TabsContent value="valuations" className="p-6 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Market Valuations</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshValuationsMutation.mutate()}
                      disabled={refreshValuationsMutation.isPending}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { key: 'kbb', label: 'KBB', color: 'bg-blue-100 text-blue-800' },
                        { key: 'mmr', label: 'MMR', color: 'bg-green-100 text-green-800' },
                        { key: 'blackBook', label: 'Black Book', color: 'bg-purple-100 text-purple-800' },
                        { key: 'jdPower', label: 'J.D. Power', color: 'bg-orange-100 text-orange-800' },
                      ].map((source) => (
                        <div key={source.key} className="text-center">
                          <div className={`p-4 rounded-lg ${source.color}`}>
                            <p className="font-medium">{source.label}</p>
                            <p className="text-2xl font-bold">
                              {valuations?.[source.key as keyof ValuationData] 
                                ? `$${valuations[source.key as keyof ValuationData]?.toLocaleString()}`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {valuations?.lastUpdated && (
                      <p className="text-sm text-gray-500 mt-4">
                        Last updated: {format(new Date(valuations.lastUpdated), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Audit Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vehicle.auditLogs?.map((log, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                          <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.action}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <User className="w-3 h-3" />
                              <span>{log.user}</span>
                              <span>•</span>
                              <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      )) || <p className="text-gray-500">No audit logs available</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Media Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mediaItems.length > 0 ? (
                      <div className="space-y-4">
                        {/* Main Image Display */}
                        <div className="relative">
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={currentMedia?.url || ''}
                              alt={currentMedia?.label || 'Vehicle image'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {mediaItems.length > 1 && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                onClick={() => setCurrentImageIndex(prev => 
                                  prev === 0 ? mediaItems.length - 1 : prev - 1
                                )}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                onClick={() => setCurrentImageIndex(prev => 
                                  prev === mediaItems.length - 1 ? 0 : prev + 1
                                )}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        
                        {/* Thumbnail Grid */}
                        <div className="grid grid-cols-4 gap-2">
                          {mediaItems.map((item, index) => (
                            <div
                              key={index}
                              className={`aspect-square bg-gray-100 rounded cursor-pointer overflow-hidden border-2 ${
                                index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <img
                                src={item.url}
                                alt={item.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No media available</p>
                        <div className="space-y-2 mt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => generatePhotosMutation.mutate()}
                            disabled={generatePhotosMutation.isPending}
                          >
                            <Image className="w-4 h-4 mr-2" />
                            {generatePhotosMutation.isPending ? 'Generating...' : 'Generate Stock Photos'}
                          </Button>
                          <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Media
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Note</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note about this vehicle..."
                        className="flex-1"
                      />
                      <Button onClick={handleAddNote}>Add</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="p-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Pricing Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Pricing */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Current List Price</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${vehicle?.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Price Update Form */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-gray-900">Update Pricing</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="new-price">New Price</Label>
                          <Input
                            id="new-price"
                            type="number"
                            value={pricingData.price}
                            onChange={(e) => setPricingData({
                              ...pricingData,
                              price: parseInt(e.target.value) || 0
                            })}
                            placeholder="Enter new price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="price-reason">Reason (Optional)</Label>
                          <Input
                            id="price-reason"
                            value={pricingData.reason}
                            onChange={(e) => setPricingData({
                              ...pricingData,
                              reason: e.target.value
                            })}
                            placeholder="e.g., Market adjustment"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => updatePricingMutation.mutate({
                          price: pricingData.price,
                          reason: pricingData.reason,
                          user: 'Current User'
                        })}
                        disabled={updatePricingMutation.isPending || pricingData.price === 0}
                        className="w-full sm:w-auto"
                      >
                        {updatePricingMutation.isPending ? 'Updating...' : 'Update Price'}
                      </Button>
                    </div>

                    {/* Price History */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Price History</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {vehicle?.priceHistory?.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">${entry.price.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">{entry.reason || 'Price update'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{entry.user}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        )) || (
                          <p className="text-gray-500 text-center py-4">No price history available</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
          </Tabs>
        </div>

        {/* Tags and Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Tags</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {vehicle.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                      {isEditing && (
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      )}
                    </Badge>
                  )) || <p className="text-gray-500">No tags</p>}
                </div>
                
                {isEditing && (
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag}>Add</Button>
                  </div>
            )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button className="w-full" variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="text-xs">Generate Pricing Report</span>
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-xs">Download PDF Report</span>
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                <span className="text-xs">Preview Listing</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}