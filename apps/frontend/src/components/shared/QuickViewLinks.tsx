import { useQuickView } from '@/contexts/QuickViewContext';
import { cn } from '@/lib/utils';
import { User, Car } from 'lucide-react';

interface CustomerLinkProps {
  customerId: string;
  customerName: string;
  className?: string;
  showIcon?: boolean;
}

export function CustomerLink({
  customerId,
  customerName,
  className,
  showIcon = false
}: CustomerLinkProps) {
  const { openCustomerCard } = useQuickView();

  return (
    <button
      onClick={() => openCustomerCard(customerId)}
      className={cn(
        'inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline transition-colors font-medium',
        className
      )}
    >
      {showIcon && <User className="h-3.5 w-3.5" />}
      {customerName}
    </button>
  );
}

interface VehicleLinkProps {
  vehicleId: string;
  vehicleName: string;
  className?: string;
  showIcon?: boolean;
}

export function VehicleLink({
  vehicleId,
  vehicleName,
  className,
  showIcon = false
}: VehicleLinkProps) {
  const { openVehicleCard } = useQuickView();

  return (
    <button
      onClick={() => openVehicleCard(vehicleId)}
      className={cn(
        'inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline transition-colors font-medium',
        className
      )}
    >
      {showIcon && <Car className="h-3.5 w-3.5" />}
      {vehicleName}
    </button>
  );
}
