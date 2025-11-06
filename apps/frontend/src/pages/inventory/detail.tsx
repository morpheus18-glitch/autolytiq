import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  PageHeader,
  StatCard
} from '@repo/ui';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import {
  Car,
  DollarSign,
  Calendar,
  Gauge,
  Edit,
  Save,
  X,
  Calculator,
  TrendingUp
} from 'lucide-react';
import type { Vehicle } from '@shared/schema';

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Vehicle>>({});

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ['/api/vehicles', id],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${id}`);
      if (!response.ok) throw new Error('Vehicle not found');
      return response.json();
    }
  });

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
      <Card>
        <CardContent>Loading vehicle details...</CardContent>
      </Card>
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
      icon: <DollarSign />,
      trend: 'up' as const
    },
    {
      label: 'Year',
      value: vehicle.year,
      icon: <Calendar />,
      trend: 'neutral' as const
    },
    {
      label: 'Mileage',
      value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A',
      icon: <Gauge />,
      trend: 'neutral' as const
    },
    {
      label: 'Status',
      value: vehicle.status || 'Unknown',
      icon: <Car />,
      trend: 'neutral' as const
    }
  ];

  const headerActions = isEditing ? (
    <>
      <Button variant="outline" onClick={() => setIsEditing(false)}>
        <X />
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={updateMutation.isPending}>
        <Save />
        Save Changes
      </Button>
    </>
  ) : (
    <>
      <Button
        variant="default"
        onClick={() => {
          trackInteraction('button_click', { action: 'create_deal', vehicleId: id });
          navigate(`/professional-deal-desk?vehicleId=${id}`);
        }}
        data-testid="button-create-deal"
      >
        <Calculator />
        Create Deal
      </Button>
      <Button variant="outline" onClick={() => trackInteraction('button_click', { action: 'view_pricing', vehicleId: id })}>
        <TrendingUp />
        Pricing
      </Button>
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        <Edit />
        Edit
      </Button>
    </>
  );

  return (
    <>
      <PageHeader
        icon={<Car />}
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        description={`VIN: ${vehicle.vin}`}
        actions={headerActions}
      />

      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Make & Model: {vehicle.make} {vehicle.model}</p>
              <p>Year: {vehicle.year}</p>
              <p>VIN: {vehicle.vin}</p>
              <p>Mileage: {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'Not specified'}</p>
              <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                {vehicle.status || 'Unknown'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>List Price: ${vehicle.price?.toLocaleString()}</p>
              <p>Cost: {vehicle.cost ? `$${vehicle.cost.toLocaleString()}` : 'Not available'}</p>
              <p>Potential Profit: {vehicle.cost && vehicle.price ? `$${(vehicle.price - vehicle.cost).toLocaleString()}` : 'N/A'}</p>
              <p>Date Added: {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'Unknown'}</p>
            </CardContent>
          </Card>

          {vehicle.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {vehicle.description}
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
              Pricing analysis coming soon. This will show competitive pricing data and market trends.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle History</CardTitle>
            </CardHeader>
            <CardContent>
              Vehicle history tracking coming soon.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Photos & Media</CardTitle>
            </CardHeader>
            <CardContent>
              Vehicle media gallery coming soon.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
