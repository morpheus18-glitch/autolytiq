import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CustomerProfileCard } from '@/components/shared/CustomerProfileCard';
import { VehicleDetailsCard } from '@/components/shared/VehicleDetailsCard';

interface QuickViewContextType {
  openCustomerCard: (customerId: string) => void;
  openVehicleCard: (vehicleId: string) => void;
  closeAll: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [customerCardState, setCustomerCardState] = useState<{
    open: boolean;
    customerId: string | null;
  }>({ open: false, customerId: null });

  const [vehicleCardState, setVehicleCardState] = useState<{
    open: boolean;
    vehicleId: string | null;
  }>({ open: false, vehicleId: null });

  const openCustomerCard = (customerId: string) => {
    setCustomerCardState({ open: true, customerId });
  };

  const openVehicleCard = (vehicleId: string) => {
    setVehicleCardState({ open: true, vehicleId });
  };

  const closeAll = () => {
    setCustomerCardState({ open: false, customerId: null });
    setVehicleCardState({ open: false, vehicleId: null });
  };

  return (
    <QuickViewContext.Provider value={{ openCustomerCard, openVehicleCard, closeAll }}>
      {children}

      {/* Global Quick View Cards */}
      <CustomerProfileCard
        customerId={customerCardState.customerId}
        open={customerCardState.open}
        onOpenChange={(open) =>
          setCustomerCardState((prev) => ({ ...prev, open }))
        }
      />
      <VehicleDetailsCard
        vehicleId={vehicleCardState.vehicleId}
        open={vehicleCardState.open}
        onOpenChange={(open) =>
          setVehicleCardState((prev) => ({ ...prev, open }))
        }
      />
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}
