import React from 'react';
import { Building2, Check } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { Modal } from './Modal.js';

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
}

export interface TenantSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  currentTenantId: string;
  onSwitch: (tenantId: string) => void;
}

export function TenantSwitcher({
  isOpen,
  onClose,
  tenants,
  currentTenantId,
  onSwitch,
}: TenantSwitcherProps) {
  const handleSwitch = (tenantId: string) => {
    onSwitch(tenantId);
    onClose();
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()} title="Switch Dealership" size="sm">
      <div className="space-y-2">
        {tenants.map((tenant) => (
          <button
            key={tenant.id}
            onClick={() => handleSwitch(tenant.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors',
              tenant.id === currentTenantId
                ? 'border-action-primary bg-[rgb(var(--action-primary)_/_0.05)]'
                : 'border-border-base hover:bg-surface-muted'
            )}
          >
            {tenant.logo ? (
              <img src={tenant.logo} alt={tenant.name} className="h-8 w-8 rounded" />
            ) : (
              <div className="h-8 w-8 rounded bg-surface-muted flex items-center justify-center">
                <Building2 className="h-4 w-4 text-text-tertiary" />
              </div>
            )}
            <span className="flex-1 text-left text-sm font-medium text-text-primary">
              {tenant.name}
            </span>
            {tenant.id === currentTenantId && (
              <Check className="h-5 w-5 text-action-primary" />
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
}

TenantSwitcher.displayName = 'TenantSwitcher';
