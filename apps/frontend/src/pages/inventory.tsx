import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Badge,
  Card,
  CardContent,
  Alert,
  StatCard,
  SearchInput,
  Modal,
  PageHeader,
  EmptyState
} from '@repo/ui';
import { useToast } from '@repo/ui';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { useDealStudioLauncher } from '@/hooks/useDealStudioLauncher';
import { VehicleEntryForm } from '@/components/forms/VehicleEntryForm';
import {
  Search,
  Filter,
  Car,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  MapPin,
  Eye,
  Edit,
  Share2,
  Tag,
  AlertCircle,
  Calculator,
  Plus
} from 'lucide-react';
import type { Vehicle } from '@shared/schema';

export default function Inventory() {
  const { toast } = useToast();
  const { trackInteraction } = usePixelTracker();
  const navigate = useNavigate();
  const { openDealStudio } = useDealStudioLauncher();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedView, setSelectedView] = useState('grid');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  // Demo data for immediate functionality
  const demoVehicles: Vehicle[] = [
    {
      id: 'V001',
      stockNumber: 'STK-2024-001',
      vin: '1HGBH41JXMN109186',
      year: 2024,
      make: 'Toyota',
      model: 'Camry',
      trim: 'XSE',
      price: 32500,
      status: 'available',
      mileage: 15,
      daysInStock: 12,
    },
    {
      id: 'V002',
      stockNumber: 'STK-2024-002',
      vin: '2T3BFREV5HW123456',
      year: 2023,
      make: 'Honda',
      model: 'CR-V',
      trim: 'EX-L',
      price: 28900,
      status: 'available',
      mileage: 8245,
      daysInStock: 8,
    },
    {
      id: 'V003',
      stockNumber: 'STK-2024-003',
      vin: '1FTFW1ET9MFC12345',
      year: 2024,
      make: 'Ford',
      model: 'F-150',
      trim: 'XLT',
      price: 45200,
      status: 'available',
      mileage: 3200,
      daysInStock: 5,
    },
  ];

  const { data: vehicles = demoVehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/vehicles');
        const json = await response.json();
        return json.data || demoVehicles;
      } catch {
        return demoVehicles;
      }
    },
  });

  if (error) {
    return (
      <Alert variant="error">
        <AlertCircle />
        Error Loading Inventory - Unable to load vehicle data
      </Alert>
    );
  }

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vehicle.make?.toLowerCase().includes(query) ||
      vehicle.model?.toLowerCase().includes(query) ||
      vehicle.stockNumber?.toLowerCase().includes(query) ||
      vehicle.vin?.toLowerCase().includes(query)
    );
  });

  // Calculate stats
  const totalUnits = vehicles.length;
  const avgDaysInStock = vehicles.length > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.daysInStock || 0), 0) / vehicles.length)
    : 0;
  const totalValue = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);
  const availableCount = vehicles.filter(v => v.status === 'available').length;

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    const getStatusVariant = (status: string) => {
      switch (status) {
        case 'available': return 'success' as const;
        case 'in-transit': return 'info' as const;
        default: return 'secondary' as const;
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'available': return 'Available';
        case 'in-transit': return 'In Transit';
        default: return 'Sold';
      }
    };

    return (
      <Card hover>
        <CardContent>
          <Badge variant={getStatusVariant(vehicle.status || 'available')}>
            {getStatusLabel(vehicle.status || 'available')}
          </Badge>

          <Card>
            <CardContent>
              <Car />
              Stock #{vehicle.stockNumber}
            </CardContent>
          </Card>

          {vehicle.year} {vehicle.make}
          {vehicle.model} {vehicle.trim}

          <Calendar />
          {vehicle.daysInStock || 0} days

          <MapPin />
          {vehicle.location || 'Lot A'}

          <DollarSign />
          ${vehicle.price?.toLocaleString()}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedVehicle(vehicle)}
            data-testid={`button-view-vehicle-${vehicle.id}`}
          >
            <Eye />
          </Button>

          <Card>
            <CardContent>
              Potential Gross: ${((vehicle.price || 0) - (vehicle.cost || vehicle.price || 0) * 0.85).toLocaleString()}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  };

  const statsData = [
    { label: 'Total Units', value: totalUnits, change: '+3', icon: <Car />, trend: 'up' as const },
    { label: 'Avg Days in Stock', value: avgDaysInStock, change: '-2', icon: <Calendar />, trend: 'down' as const },
    { label: 'Total Value', value: `$${(totalValue / 1000000).toFixed(1)}M`, change: '+$120K', icon: <DollarSign />, trend: 'up' as const },
    { label: 'Available', value: availableCount, change: '+1', icon: <TrendingUp />, trend: 'up' as const }
  ];

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Manage vehicle inventory"
        actions={
          <Button variant="primary" onClick={() => setShowVehicleForm(true)} data-testid="button-add-vehicle">
            <Plus />
            Add Vehicle
          </Button>
        }
      />

      <SearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by stock, VIN, make, model..."
        data-testid="input-search-inventory"
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setFilterOpen(!filterOpen)}
        data-testid="button-filter"
      >
        <Filter />
      </Button>

      <Button
        variant={selectedView === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setSelectedView('grid')}
        data-testid="button-grid-view"
      >
        Grid View
      </Button>
      <Button
        variant={selectedView === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setSelectedView('list')}
        data-testid="button-list-view"
      >
        List View
      </Button>

      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}

      <Button variant="primary" size="sm" data-testid="filter-all">
        All ({totalUnits})
      </Button>
      <Button variant="secondary" size="sm" data-testid="filter-available">
        Available ({availableCount})
      </Button>
      <Button variant="secondary" size="sm" data-testid="filter-in-transit">
        In Transit (0)
      </Button>
      <Button variant="secondary" size="sm" data-testid="filter-aging">
        Aging (0)
      </Button>

      {isLoading ? (
        <Card>
          <CardContent>Loading...</CardContent>
        </Card>
      ) : filteredVehicles.length === 0 ? (
        <EmptyState
          icon={<Car />}
          title="No vehicles found"
          description="Try adjusting your search filters"
        />
      ) : (
        filteredVehicles.map(vehicle => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))
      )}

      {selectedVehicle && (
        <Modal
          open={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          title={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
          size="lg"
        >
          <Card>
            <CardContent>
              <Car />
            </CardContent>
          </Card>

          {selectedVehicle.trim}

          <Card>
            <CardContent>
              Stock Number: #{selectedVehicle.stockNumber}
              Status: {selectedVehicle.status}
              VIN: {selectedVehicle.vin}
              Location: {selectedVehicle.location || 'Lot A'}
              Exterior Color: {selectedVehicle.exteriorColor || 'N/A'}
              Mileage: {selectedVehicle.mileage?.toLocaleString() || '0'} mi
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              Financial Details
              Cost: ${((selectedVehicle.cost || selectedVehicle.price || 0) * 0.85).toLocaleString()}
              List Price: ${selectedVehicle.price?.toLocaleString()}
              Potential Gross: ${((selectedVehicle.price || 0) - (selectedVehicle.cost || selectedVehicle.price || 0) * 0.85).toLocaleString()}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              Aging Information
              Days in Stock: {selectedVehicle.daysInStock || 0} days
              Floor Plan Days: {selectedVehicle.daysInStock || 0} days
              Est. Floor Interest: ${Math.round(((selectedVehicle.cost || selectedVehicle.price || 0) * 0.85) * 0.05 * ((selectedVehicle.daysInStock || 0) / 365)).toLocaleString()}
            </CardContent>
          </Card>

          <Button
            variant="primary"
            onClick={() => {
              setSelectedVehicle(null);
              trackInteraction('start_deal_from_inventory', { vehicleId: selectedVehicle.id });
              openDealStudio({ vehicleId: selectedVehicle.id });
            }}
            data-testid="button-create-deal"
          >
            <Calculator />
            Start Deal
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedVehicle(null);
              navigate(`/inventory/edit/${selectedVehicle.id}`);
            }}
            data-testid="button-edit-vehicle"
          >
            <Edit />
            Edit
          </Button>
          <Button variant="secondary" data-testid="button-share-vehicle">
            <Share2 />
            Share
          </Button>
          <Button variant="secondary" data-testid="button-price-vehicle">
            <Tag />
            Price
          </Button>
        </Modal>
      )}

      <VehicleEntryForm
        isOpen={showVehicleForm}
        onClose={() => setShowVehicleForm(false)}
        onSuccess={(vehicle) => {
          setShowVehicleForm(false);
          toast({ title: `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} added successfully!` });
        }}
      />
    </>
  );
}
