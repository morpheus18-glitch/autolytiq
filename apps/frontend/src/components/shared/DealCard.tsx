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
  TrendingUp,
  User,
  Car,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  MessageSquare,
  CheckCircle,
  Clock,
  Calculator
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { CustomerLink, VehicleLink } from './QuickViewLinks';

interface Deal {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleName: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  status: string;
  salePrice?: number;
  downPayment?: number;
  monthlyPayment?: number;
  term?: number;
  rate?: number;
  tradeInValue?: number;
  grossProfit?: number;
  salesPerson?: string;
  createdAt?: string;
  updatedAt?: string;
  nextStep?: string;
}

interface DealCardProps {
  dealId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DealCard({ dealId, open, onOpenChange }: DealCardProps) {
  const { data: deal, isLoading } = useQuery<Deal>({
    queryKey: [`/api/deals/${dealId}`],
    enabled: !!dealId && open,
  });

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (!dealId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : deal ? (
          <>
            <SheetHeader className="space-y-3 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">Deal #{deal.id.slice(0, 8)}</SheetTitle>
                    <SheetDescription>Active Deal Details</SheetDescription>
                  </div>
                </div>
                <Badge className={cn('rounded-full', getStatusColor(deal.status))}>
                  {deal.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Link href={`/deals/${deal.id}/desk`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Desk
                  </Button>
                </Link>
                <Link href={`/deals/${deal.id}/edit`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>

              <Separator />

              {/* Parties Involved */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Parties Involved
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Customer</div>
                        <CustomerLink
                          customerId={deal.customerId}
                          customerName={deal.customerName}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">View</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Vehicle</div>
                        <VehicleLink
                          vehicleId={deal.vehicleId}
                          vehicleName={`${deal.vehicleYear} ${deal.vehicleMake} ${deal.vehicleModel}`}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">View</Button>
                  </div>

                  {deal.salesPerson && (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Sales Person</div>
                          <div className="text-sm font-medium">{deal.salesPerson}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Deal Structure */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Deal Structure
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Sale Price</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(deal.salePrice)}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Down Payment</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(deal.downPayment)}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Monthly Payment</div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(deal.monthlyPayment)}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Term</div>
                    <div className="text-lg font-bold">
                      {deal.term ? `${deal.term} mo` : 'N/A'}
                    </div>
                  </div>
                </div>

                {deal.tradeInValue && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Trade-In Value</span>
                      <span className="text-base font-bold text-primary">
                        {formatCurrency(deal.tradeInValue)}
                      </span>
                    </div>
                  </div>
                )}

                {deal.grossProfit && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Gross Profit</span>
                      <span className="text-lg font-bold text-green-700">
                        {formatCurrency(deal.grossProfit)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Timeline
                </h3>
                <div className="space-y-3 text-sm">
                  {deal.createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {deal.updatedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">
                        {new Date(deal.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {deal.nextStep && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                            Next Step
                          </div>
                          <div className="text-sm text-yellow-900">{deal.nextStep}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <Link href={`/deals/${deal.id}`}>
                  <Button variant="default" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Deal
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/deals/${deal.id}/desk`}>
                    <Button variant="outline" className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Open in Desking
                    </Button>
                  </Link>
                  <Link href={`/communications/sms?customer=${deal.customerId}`}>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Text Customer
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Deal not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
