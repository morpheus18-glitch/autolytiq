import { useQuery } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Car,
  DollarSign,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  TrendingUp,
  Edit,
  Eye,
  FileText,
  Package,
  BarChart3
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@shared/schema';

interface VehicleDetailsCardProps {
  vehicleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AccountingTransaction {
  id: string;
  date: string;
  type: 'purchase' | 'expense' | 'sale' | 'adjustment';
  description: string;
  amount: number;
  glAccount: string;
}

export function VehicleDetailsCard({ vehicleId, open, onOpenChange }: VehicleDetailsCardProps) {
  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
    enabled: !!vehicleId && open,
  });

  // Mock accounting history - in production, this would fetch real data
  const { data: accountingHistory } = useQuery<AccountingTransaction[]>({
    queryKey: [`/api/vehicles/${vehicleId}/accounting`],
    enabled: !!vehicleId && open,
    placeholderData: vehicle ? [
      {
        id: '1',
        date: new Date().toISOString(),
        type: 'purchase',
        description: 'Vehicle Purchase',
        amount: vehicle.cost || 0,
        glAccount: '1200 - Vehicle Inventory'
      },
      {
        id: '2',
        date: new Date(Date.now() - 86400000).toISOString(),
        type: 'expense',
        description: 'Reconditioning',
        amount: 850,
        glAccount: '5100 - Recon Expense'
      },
      {
        id: '3',
        date: new Date(Date.now() - 172800000).toISOString(),
        type: 'expense',
        description: 'Transport Fee',
        amount: 350,
        glAccount: '5200 - Transport Expense'
      }
    ] : []
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-600 bg-green-100';
      case 'expense': return 'text-red-600 bg-red-100';
      case 'sale': return 'text-blue-600 bg-blue-100';
      case 'adjustment': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return 'N/A';
    return new Intl.NumberFormat('en-US').format(mileage) + ' mi';
  };

  const calculateTotalInvestment = () => {
    const cost = vehicle?.cost || 0;
    const expenses = accountingHistory
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    return cost + expenses;
  };

  const calculateProfitMargin = () => {
    const totalInvestment = calculateTotalInvestment();
    const price = vehicle?.price || 0;
    if (!price || !totalInvestment) return 0;
    return ((price - totalInvestment) / price * 100).toFixed(1);
  };

  if (!vehicleId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : vehicle ? (
          <>
            <SheetHeader className="space-y-3 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </SheetTitle>
                    <SheetDescription>
                      {vehicle.trim && `${vehicle.trim} • `}
                      Stock #{vehicle.stockNumber || vehicle.id}
                    </SheetDescription>
                  </div>
                </div>
                <Badge className={cn('rounded-full', getStatusColor(vehicle.status))}>
                  {vehicle.status?.toUpperCase()}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/inventory/${vehicle.id}/edit`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Link href={`/desking/new?vehicle=${vehicle.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Desk Deal
                  </Button>
                </Link>
              </div>

              <Separator />

              {/* Vehicle Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">VIN</div>
                      <div className="font-mono text-xs">{vehicle.vin || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Mileage</div>
                      <div className="font-medium">{formatMileage(vehicle.mileage)}</div>
                    </div>
                  </div>
                  {vehicle.color && (
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Color</div>
                        <div className="font-medium">{vehicle.color}</div>
                      </div>
                    </div>
                  )}
                  {vehicle.transmission && (
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Transmission</div>
                        <div className="font-medium">{vehicle.transmission}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Pricing & Cost Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Pricing & Cost Information
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Cost</div>
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(vehicle.cost)}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Retail Price</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(vehicle.price)}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Margin</div>
                    <div className="text-lg font-bold text-blue-600">
                      {calculateProfitMargin()}%
                    </div>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Investment</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(calculateTotalInvestment())}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Includes cost and all expenses
                  </div>
                </div>
              </div>

              <Separator />

              {/* Accounting History */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Accounting History
                </h3>
                <div className="space-y-2">
                  {accountingHistory && accountingHistory.length > 0 ? (
                    accountingHistory.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-start justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="secondary"
                              className={cn('text-xs px-2 py-0', getTypeColor(transaction.type))}
                            >
                              {transaction.type}
                            </Badge>
                            <span className="text-sm font-medium">{transaction.description}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{transaction.glAccount}</span>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'text-base font-bold whitespace-nowrap ml-3',
                            transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                          )}
                        >
                          {transaction.type === 'expense' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No accounting history available
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <Link href={`/inventory/${vehicle.id}`}>
                  <Button variant="default" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                </Link>
                <Link href={`/accounting/vehicles/${vehicle.id}`}>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Accounting Records
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Vehicle not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
