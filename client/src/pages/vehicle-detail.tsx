import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Car, DollarSign, Calendar, MapPin, Fuel, Settings, Eye, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle } from '@shared/schema';

export default function VehicleDetail() {
  const { toast } = useToast();
  const { id } = useParams();
  
  const { data: vehicle, isLoading, error } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${id}`],
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
          <p className="text-gray-600 mb-4">The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link href="/inventory">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(vehicle.status)}>
                {vehicle.status}
              </Badge>
              <span className="text-gray-500">Stock #: {vehicle.id}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Pricing Insights
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">VIN</p>
              <p className="text-sm text-gray-600 font-mono">{vehicle.vin}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Make / Model / Year</p>
              <p className="text-sm text-gray-600">
                {vehicle.make} {vehicle.model} {vehicle.year}
              </p>
            </div>
            {vehicle.color && (
              <div>
                <p className="text-sm font-medium">Color</p>
                <p className="text-sm text-gray-600">{vehicle.color}</p>
              </div>
            )}
            {vehicle.transmission && (
              <div>
                <p className="text-sm font-medium">Transmission</p>
                <p className="text-sm text-gray-600">{vehicle.transmission}</p>
              </div>
            )}
            {vehicle.fuelType && (
              <div className="flex items-center space-x-3">
                <Fuel className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Fuel Type</p>
                  <p className="text-sm text-gray-600">{vehicle.fuelType}</p>
                </div>
              </div>
            )}
            {vehicle.mileage && (
              <div>
                <p className="text-sm font-medium">Mileage</p>
                <p className="text-sm text-gray-600">{vehicle.mileage.toLocaleString()} miles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Pricing & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Asking Price</p>
              <p className="text-2xl font-bold text-green-600">
                ${vehicle.price.toLocaleString()}
              </p>
            </div>
            {vehicle.cost && (
              <div>
                <p className="text-sm font-medium">Cost</p>
                <p className="text-lg font-semibold text-gray-600">
                  ${vehicle.cost.toLocaleString()}
                </p>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-gray-600">{vehicle.location || 'Lot A'}</p>
              </div>
            </div>
            {vehicle.cost && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">Potential Profit</p>
                <p className="text-lg font-semibold text-blue-600">
                  ${(vehicle.price - vehicle.cost).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Vehicle Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Added to Inventory</p>
                  <p className="text-xs text-gray-500">
                    {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              {vehicle.updatedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-gray-500">
                      {new Date(vehicle.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {vehicle.status === 'sold' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Sold</p>
                    <p className="text-xs text-gray-500">Date not available</p>
                  </div>
                </div>
              )}
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
            <p className="text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      {vehicle.features && vehicle.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {vehicle.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="justify-start">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Link href={`/deal-desk?vehicleId=${vehicle.id}`}>
          <Button>
            Start Deal
          </Button>
        </Link>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Generate Pricing Report
        </Button>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          View Photos
        </Button>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Manage Listing
        </Button>
      </div>
    </div>
  );
}