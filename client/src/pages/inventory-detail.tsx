import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import MobileResponsiveLayout from '@/components/layout/mobile-responsive-layout';
import StatsGrid from '@/components/layout/stats-grid';
import { 
  Car, 
  DollarSign, 
  Calendar,
  Gauge,
  FileText,
  Edit,
  Save,
  X,
  Eye,
  TrendingUp,
  MapPin,
  User
} from 'lucide-react';
import type { Vehicle } from '@shared/schema';

export default function InventoryDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Vehicle>>({});

  // Fetch vehicle data
  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ['/api/vehicles', id],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${id}`);
      if (!response.ok) throw new Error('Vehicle not found');
      return response.json();
    }
  });

  // Update vehicle mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Vehicle>) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles', id] });
      setIsEditing(false);
      toast({ title: 'Success', description: 'Vehicle updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update vehicle', variant: 'destructive' });
    }
  });

  if (isLoading || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(editData);
    trackInteraction('button_click', { action: 'save_vehicle', vehicleId: id });
  };

  const stats = [
    { 
      label: 'List Price', 
      value: `$${vehicle.price?.toLocaleString()}`, 
      icon: <DollarSign className="w-4 h-4" />,
      color: 'orange' as const
    },
    { 
      label: 'Year', 
      value: vehicle.year, 
      icon: <Calendar className="w-4 h-4" />,
      color: 'blue' as const
    },
    { 
      label: 'Mileage', 
      value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A', 
      icon: <Gauge className="w-4 h-4" />,
      color: 'green' as const
    },
    { 
      label: 'Status', 
      value: vehicle.status || 'Unknown', 
      icon: <Car className="w-4 h-4" />,
      color: 'default' as const
    }
  ];

  const headerActions = (
    <>
      {isEditing ? (
        <>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" onClick={() => trackInteraction('button_click', { action: 'view_pricing', vehicleId: id })}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Pricing Analysis
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </>
      )}
    </>
  );

  return (
    <MobileResponsiveLayout
      title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      subtitle={`VIN: ${vehicle.vin}`}
      headerActions={headerActions}
    >
      <div className="space-y-6">
        <StatsGrid stats={stats} cols={4} />

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Make & Model</p>
                    <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Year</p>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">VIN</p>
                    <p className="font-medium font-mono text-sm">{vehicle.vin}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mileage</p>
                    <p className="font-medium">
                      {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                      {vehicle.status || 'Unknown'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">List Price</p>
                    <p className="font-medium text-lg">${vehicle.price?.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cost</p>
                    <p className="font-medium">
                      {vehicle.cost ? `$${vehicle.cost.toLocaleString()}` : 'Not available'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Potential Profit</p>
                    <p className="font-medium text-green-600">
                      {vehicle.cost && vehicle.price ? 
                        `$${(vehicle.price - vehicle.cost).toLocaleString()}` : 
                        'N/A'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date Added</p>
                    <p className="font-medium">
                      {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {vehicle.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{vehicle.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Market Pricing Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">
                  Pricing analysis coming soon. This will show competitive pricing data and market trends.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">
                  Vehicle history tracking coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Photos & Media</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">
                  Vehicle media gallery coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileResponsiveLayout>
  );
}