import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui';
import { CustomerLink, VehicleLink } from '@/components/shared/QuickViewLinks';
import { Button } from '@repo/ui';
import { useQuickView } from '@/contexts/QuickViewContext';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Users, Car } from 'lucide-react';
import type { Customer, Vehicle } from '@shared/schema';

export default function DemoQuickView() {
  const { openCustomerCard, openVehicleCard } = useQuickView();

  // Fetch some sample customers
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    select: (data) => data?.slice(0, 5) // Get first 5
  });

  // Fetch some sample vehicles
  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    select: (data) => data?.slice(0, 5) // Get first 5
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Unified Navigation Demo</h1>
        </div>
        <p className="text-muted-foreground">
          Click any customer name or vehicle to view quick details in a slide-out panel.
          No page navigation required!
        </p>
      </div>

      {/* Demo Section: Showroom Manager Scenario */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Showroom Manager Scenario</CardTitle>
          <CardDescription>
            You're on the showroom floor. Click any customer or vehicle name to instantly view
            their details without leaving this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="text-sm">
              <span className="font-medium">Active Deal:</span> Customer{' '}
              {customers?.[0] && (
                <CustomerLink
                  customerId={customers[0].id}
                  customerName={`${customers[0].firstName} ${customers[0].lastName}`}
                  showIcon
                />
              )}{' '}
              is interested in{' '}
              {vehicles?.[0] && (
                <VehicleLink
                  vehicleId={vehicles[0].id}
                  vehicleName={`${vehicles[0].year} ${vehicles[0].make} ${vehicles[0].model}`}
                  showIcon
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Send to Desking
              </Button>
              <Button size="sm" variant="outline">
                Get Trade-In Value
              </Button>
              <Button size="sm" variant="outline">
                Text Customer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Customers
          </CardTitle>
          <CardDescription>Click any customer name to view their profile</CardDescription>
        </CardHeader>
        <CardContent>
          {customers && customers.length > 0 ? (
            <div className="space-y-3">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <CustomerLink
                      customerId={customer.id}
                      customerName={`${customer.firstName} ${customer.lastName}`}
                      showIcon
                      className="text-base"
                    />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{customer.email}</span>
                      <span>•</span>
                      <span>{customer.phone}</span>
                      {customer.creditScore && (
                        <>
                          <span>•</span>
                          <span>Credit: {customer.creditScore}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openCustomerCard(customer.id)}
                  >
                    Quick View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No customers found. Add some customers to test the quick view.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Available Inventory
          </CardTitle>
          <CardDescription>Click any vehicle to view details and accounting history</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <VehicleLink
                    vehicleId={vehicle.id}
                    vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    showIcon
                    className="text-base mb-2"
                  />
                  <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                    <span>Stock #{vehicle.stockNumber || vehicle.id}</span>
                    {vehicle.mileage && (
                      <>
                        <span>•</span>
                        <span>{vehicle.mileage.toLocaleString()} mi</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {vehicle.cost && (
                        <div className="text-xs text-red-600">
                          Cost: ${vehicle.cost.toLocaleString()}
                        </div>
                      )}
                      {vehicle.price && (
                        <div className="text-xs text-green-600">
                          Price: ${vehicle.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openVehicleCard(vehicle.id)}
                    >
                      Quick View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No vehicles found. Add some inventory to test the quick view.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">Usage in Your Code</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-white rounded-lg p-4 text-xs overflow-x-auto">
            <code>{`import { CustomerLink, VehicleLink } from '@/components/shared/QuickViewLinks';
import { useQuickView } from '@/contexts/QuickViewContext';

// In your component:
const { openCustomerCard, openVehicleCard } = useQuickView();

// Use as clickable links:
<CustomerLink
  customerId="cust_123"
  customerName="John Doe"
  showIcon
/>

<VehicleLink
  vehicleId="veh_456"
  vehicleName="2023 Toyota Camry"
  showIcon
/>

// Or programmatically:
<Button onClick={() => openCustomerCard('cust_123')}>
  View Customer
</Button>`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
