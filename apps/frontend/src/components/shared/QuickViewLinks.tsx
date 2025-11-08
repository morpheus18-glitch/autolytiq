import { useQuickView } from '@/contexts/QuickViewContext';
import { cn } from '@/lib/utils';
import { User, Car, TrendingUp, Phone, Mail, MessageSquare } from 'lucide-react';

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

interface DealLinkProps {
  dealId: string;
  dealName?: string;
  className?: string;
  showIcon?: boolean;
}

export function DealLink({
  dealId,
  dealName,
  className,
  showIcon = false
}: DealLinkProps) {
  const { openDealCard } = useQuickView();

  return (
    <button
      onClick={() => openDealCard(dealId)}
      className={cn(
        'inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline transition-colors font-medium',
        className
      )}
    >
      {showIcon && <TrendingUp className="h-3.5 w-3.5" />}
      {dealName || `Deal #${dealId.slice(0, 8)}`}
    </button>
  );
}

// Quick action buttons for contextual navigation
interface QuickActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'ghost',
  className
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        variant === 'ghost' && 'bg-muted/30 text-foreground hover:bg-muted/50',
        className
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// Contextual action menu for entities
interface ContextualActionsProps {
  entity: 'customer' | 'vehicle' | 'deal';
  entityId: string;
  entityData?: any;
  className?: string;
}

export function ContextualActions({ entity, entityId, entityData, className }: ContextualActionsProps) {
  const { openCustomerCard, openVehicleCard, openDealCard } = useQuickView();

  const renderActions = () => {
    switch (entity) {
      case 'customer':
        return (
          <>
            <QuickActionButton
              icon={User}
              label="View Profile"
              onClick={() => openCustomerCard(entityId)}
            />
            <QuickActionButton
              icon={MessageSquare}
              label="Text"
              onClick={() => window.location.href = `/communications/sms?customer=${entityId}`}
            />
            <QuickActionButton
              icon={Mail}
              label="Email"
              onClick={() => window.location.href = `/communications/email?customer=${entityId}`}
            />
            <QuickActionButton
              icon={TrendingUp}
              label="Start Deal"
              onClick={() => window.location.href = `/deals/new?customer=${entityId}`}
            />
          </>
        );
      case 'vehicle':
        return (
          <>
            <QuickActionButton
              icon={Car}
              label="View Details"
              onClick={() => openVehicleCard(entityId)}
            />
            <QuickActionButton
              icon={TrendingUp}
              label="Desk Deal"
              onClick={() => window.location.href = `/desking/new?vehicle=${entityId}`}
            />
          </>
        );
      case 'deal':
        return (
          <>
            <QuickActionButton
              icon={TrendingUp}
              label="View Deal"
              onClick={() => openDealCard(entityId)}
            />
            {entityData?.customerId && (
              <QuickActionButton
                icon={User}
                label="Customer"
                onClick={() => openCustomerCard(entityData.customerId)}
              />
            )}
            {entityData?.vehicleId && (
              <QuickActionButton
                icon={Car}
                label="Vehicle"
                onClick={() => openVehicleCard(entityData.vehicleId)}
              />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {renderActions()}
    </div>
  );
}
