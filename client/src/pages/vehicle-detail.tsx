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
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import type { Vehicle } from '@shared/schema';

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
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Vehicle>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newTag, setNewTag] = useState('');
  const [newNote, setNewNote] = useState('');

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ['/api/vehicles', id],
    queryFn: async () => {
      const response = await apiRequest(`/api/vehicles/${id}`, {
        method: 'GET',
      });
      return response;
    },
    enabled: !!id,
  });

  const { data: valuations } = useQuery<ValuationData>({
    queryKey: ['/api/valuations', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/valuations/${id}`);
      return response.json();
    },
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

  useEffect(() => {
    if (vehicle) {
      setEditData(vehicle);
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
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/inventory')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inventory
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-sm text-gray-500">VIN: {vehicle.vin}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} disabled={updateVehicleMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateVehicleMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Make</Label>
                    {isEditing ? (
                      <Input
                        value={editData.make || ''}
                        onChange={(e) => setEditData({ ...editData, make: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg font-medium">{vehicle.make}</p>
                    )}
                  </div>
                  <div>
                    <Label>Model</Label>
                    {isEditing ? (
                      <Input
                        value={editData.model || ''}
                        onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg font-medium">{vehicle.model}</p>
                    )}
                  </div>
                  <div>
                    <Label>Year</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.year || ''}
                        onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) })}
                      />
                    ) : (
                      <p className="text-lg font-medium">{vehicle.year}</p>
                    )}
                  </div>
                  <div>
                    <Label>Trim</Label>
                    {isEditing ? (
                      <Input
                        value={editData.trim || ''}
                        onChange={(e) => setEditData({ ...editData, trim: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg font-medium">{vehicle.trim || 'N/A'}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Mileage</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.mileage || ''}
                        onChange={(e) => setEditData({ ...editData, mileage: parseInt(e.target.value) })}
                      />
                    ) : (
                      <p className="text-lg font-medium">{vehicle.mileage?.toLocaleString() || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Price</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.price || ''}
                        onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) })}
                      />
                    ) : (
                      <p className="text-lg font-medium">${vehicle.price?.toLocaleString()}</p>
                    )}
                  </div>
                  <div>
                    <Label>Status</Label>
                    {isEditing ? (
                      <select
                        value={editData.status || ''}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    ) : (
                      <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                        {vehicle.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-600">{vehicle.description || 'No description available'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultValue="valuations" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="valuations">Market Valuations</TabsTrigger>
                <TabsTrigger value="history">Price History</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="valuations" className="space-y-4">
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
                        <Button variant="outline" className="mt-4">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Media
                        </Button>
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
            </Tabs>
          </div>

          {/* Right Column - Tags and Quick Actions */}
          <div className="space-y-6">
            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
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
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Pricing Report
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Download PDF Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Listing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}