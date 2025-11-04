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
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  CreditCard,
  MessageSquare,
  Edit,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import type { Customer } from '@shared/schema';

interface CustomerProfileCardProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerProfileCard({ customerId, open, onOpenChange }: CustomerProfileCardProps) {
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: [`/api/customers/${customerId}`],
    enabled: !!customerId && open,
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'hot_lead': return 'bg-red-100 text-red-800 border-red-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'customer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'repeat_customer': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cold_lead': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getCreditScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 740) return 'text-green-600';
    if (score >= 670) return 'text-blue-600';
    if (score >= 580) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (!customerId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : customer ? (
          <>
            <SheetHeader className="space-y-3 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">
                      {customer.firstName} {customer.lastName}
                    </SheetTitle>
                    <SheetDescription>Customer Profile</SheetDescription>
                  </div>
                </div>
                <Badge className={cn('rounded-full', getStatusColor(customer.status))}>
                  {customer.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/communications/sms?customer=${customer.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Text
                  </Button>
                </Link>
                <Link href={`/customers/${customer.id}/edit`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{customer.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="text-sm space-y-1">
                      <div>Phone: {formatPhone(customer.phone)}</div>
                      {customer.cellPhone && (
                        <div className="text-muted-foreground">Cell: {formatPhone(customer.cellPhone)}</div>
                      )}
                    </div>
                  </div>
                  {(customer.address || customer.city || customer.state) && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        {customer.address && <div>{customer.address}</div>}
                        <div>
                          {customer.city && customer.city}
                          {customer.city && customer.state && ', '}
                          {customer.state && customer.state}
                          {customer.zipCode && ` ${customer.zipCode}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Financial Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="flex items-center text-muted-foreground text-xs">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Credit Score
                    </div>
                    <div className={cn('text-lg font-bold', getCreditScoreColor(customer.creditScore))}>
                      {customer.creditScore || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="flex items-center text-muted-foreground text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Annual Income
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(customer.income)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sales Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Sales Information
                </h3>
                <div className="space-y-3 text-sm">
                  {customer.salesConsultant && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sales Consultant</span>
                      <span className="font-medium">{customer.salesConsultant}</span>
                    </div>
                  )}
                  {customer.leadSource && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Lead Source</span>
                      <Badge variant="secondary" className="text-xs">
                        {customer.leadSource.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                  {customer.createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Customer Since</span>
                      <span className="font-medium">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      Notes
                    </h3>
                    <p className="text-sm bg-muted/50 rounded-lg p-3">{customer.notes}</p>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <Link href={`/customers/${customer.id}`}>
                  <Button variant="default" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </Link>
                <Link href={`/deals/new?customer=${customer.id}`}>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Start New Deal
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Customer not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
