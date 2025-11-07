import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  PageHeader
} from '@repo/ui';
import {
  ArrowLeft,
  Edit,
  Car,
  DollarSign,
  Calendar,
  MapPin,
  Fuel,
  Settings,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@repo/ui';
import type { Vehicle } from '@shared/schema';

export default function VehicleDetail() {
  const { toast } = useToast();
  const { id } = useParams();

  const { data: vehicle, isLoading, error } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${id}`],
    enabled: !!id,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'success' as const;
      case 'pending': return 'warning' as const;
      case 'sold': return 'info' as const;
      case 'maintenance': return 'error' as const;
      case 'reserved': return 'secondary' as const;
      default: return 'secondary' as const;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>Loading vehicle information...</CardContent>
      </Card>
    );
  }

  if (error || !vehicle) {
    return (
      <>
        <PageHeader
          title="Vehicle Not Found"
          description="The vehicle you're looking for doesn't exist or has been removed."
        />
        <Link to="/inventory">
          <Button>
            <ArrowLeft />
            Back to Inventory
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to="/inventory">
        <Button variant="outline" size="sm">
          <ArrowLeft />
          Back
        </Button>
      </Link>

      <PageHeader
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        description={`Stock #: ${vehicle.id}`}
        actions={
          <>
            <Badge variant={getStatusVariant(vehicle.status)}>
              {vehicle.status}
            </Badge>
            <Button variant="outline">
              <Edit />
              Edit
            </Button>
            <Button variant="outline">
              <TrendingUp />
              Pricing Insights
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>
            <Car />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>VIN: {vehicle.vin}</p>
          <p>Make / Model / Year: {vehicle.make} {vehicle.model} {vehicle.year}</p>
          {vehicle.color && <p>Color: {vehicle.color}</p>}
          {vehicle.transmission && <p>Transmission: {vehicle.transmission}</p>}
          {vehicle.fuelType && (
            <>
              <Fuel />
              <p>Fuel Type: {vehicle.fuelType}</p>
            </>
          )}
          {vehicle.mileage && <p>Mileage: {vehicle.mileage.toLocaleString()} miles</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <DollarSign />
            Pricing & Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Asking Price: ${vehicle.price.toLocaleString()}</p>
          {vehicle.cost && <p>Cost: ${vehicle.cost.toLocaleString()}</p>}
          <MapPin />
          <p>Location: {vehicle.location || 'Lot A'}</p>
          {vehicle.cost && (
            <p>Potential Profit: ${(vehicle.price - vehicle.cost).toLocaleString()}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Calendar />
            Vehicle Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Added to Inventory: {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'Unknown'}</p>
          {vehicle.updatedAt && (
            <p>Last Updated: {new Date(vehicle.updatedAt).toLocaleDateString()}</p>
          )}
          {vehicle.status === 'sold' && <p>Sold: Date not available</p>}
        </CardContent>
      </Card>

      {vehicle.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>{vehicle.description}</CardContent>
        </Card>
      )}

      {vehicle.features && vehicle.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle.features.map((feature, index) => (
              <Badge key={index} variant="outline">
                {feature}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Link to={`/professional-deal-desk?vehicleId=${vehicle.id}`}>
        <Button>Start Deal</Button>
      </Link>
      <Button variant="outline">
        <TrendingUp />
        Generate Pricing Report
      </Button>
      <Button variant="outline">
        <Eye />
        View Photos
      </Button>
      <Button variant="outline">
        <Settings />
        Manage Listing
      </Button>
    </>
  );
}
