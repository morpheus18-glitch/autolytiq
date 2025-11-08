import { useEffect } from 'react';
import { useWorkspaceStore, useActiveSession, WorkspaceCustomer, WorkspaceVehicle, WorkspaceDeal } from '@/stores/workspace-context';
import { useQuery } from '@tanstack/react-query';
import type { Customer, Vehicle, Deal } from '@shared/schema';

// Hook for integrating customer data with workspace
export function useWorkspaceCustomer(customerId?: number) {
  const { session, setCustomer } = useActiveSession();

  const { data: customer } = useQuery<Customer>({
    queryKey: [`/api/customers/${customerId}`],
    enabled: !!customerId,
  });

  useEffect(() => {
    if (customer && customerId && session) {
      const workspaceCustomer: WorkspaceCustomer = {
        id: typeof customer.id === 'string' ? parseInt(customer.id, 10) : customerId,
        firstName: customer.firstName || 'Unknown',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone ?? undefined,
        creditScore: customer.creditScore ?? undefined,
        leadScore: customer.leadScore ?? undefined,
      };
      setCustomer(workspaceCustomer);
    }
  }, [customer, customerId, session, setCustomer]);

  return {
    workspaceCustomer: session?.customer,
    isCustomerInWorkspace: !!session?.customer,
    addCustomerToWorkspace: setCustomer,
  };
}

// Hook for integrating vehicle data with workspace
export function useWorkspaceVehicle(vehicleId?: number) {
  const { session, setVehicle } = useActiveSession();

  const { data: vehicle } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
    enabled: !!vehicleId,
  });

  useEffect(() => {
    if (vehicle && vehicleId && session) {
      const workspaceVehicle: WorkspaceVehicle = {
        id: typeof vehicle.id === 'string' ? parseInt(vehicle.id, 10) : vehicleId,
        make: vehicle.make || 'Unknown',
        model: vehicle.model || 'Unknown',
        year: vehicle.year || new Date().getFullYear(),
        vin: vehicle.vin || '',
        price: vehicle.price || 0,
        status: vehicle.status || 'available',
        stockNumber: vehicle.stockNumber || '',
      };
      setVehicle(workspaceVehicle);
    }
  }, [vehicle, vehicleId, session, setVehicle]);

  return {
    workspaceVehicle: session?.vehicle,
    isVehicleInWorkspace: !!session?.vehicle,
    addVehicleToWorkspace: setVehicle,
  };
}

// Hook for integrating deal data with workspace
export function useWorkspaceDeal(dealId?: string) {
  const { session, setDeal } = useActiveSession();

  const { data: deal } = useQuery<Deal>({
    queryKey: [`/api/deals/${dealId}`],
    enabled: !!dealId,
  });

  useEffect(() => {
    if (deal && dealId && session) {
      const workspaceDeal: WorkspaceDeal = {
        id: deal.id || dealId,
        customerId: typeof deal.customerId === 'string' ? parseInt(deal.customerId, 10) : undefined,
        vehicleId: deal.vehicleId ? (typeof deal.vehicleId === 'string' ? parseInt(deal.vehicleId, 10) : deal.vehicleId) : undefined,
        status: deal.status.toLowerCase() as 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled',
        totalAmount: deal.totalAmount,
        createdAt: deal.createdAt instanceof Date ? deal.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: deal.updatedAt instanceof Date ? deal.updatedAt.toISOString() : new Date().toISOString(),
      };
      setDeal(workspaceDeal);
    }
  }, [deal, dealId, session, setDeal]);

  return {
    workspaceDeal: session?.deal,
    isDealInWorkspace: !!session?.deal,
    addDealToWorkspace: setDeal,
  };
}

// Hook for workspace-aware navigation
export function useWorkspaceNavigation() {
  const { 
    createSession, 
    activateSession, 
    getActiveSession,
    setCurrentModule,
    setCustomer,
    setVehicle,
    setDeal,
  } = useWorkspaceStore();

  const navigateWithContext = (
    module: 'customer' | 'inventory' | 'showroom' | 'deal-desk' | 'dashboard',
    options?: {
      customer?: WorkspaceCustomer;
      vehicle?: WorkspaceVehicle;
      deal?: WorkspaceDeal;
      sessionName?: string;
      createNewSession?: boolean;
    }
  ) => {
    let activeSession = getActiveSession();
    
    // Create new session if requested or no active session
    if (options?.createNewSession || !activeSession) {
      const sessionId = createSession(
        options?.sessionName || `${module.charAt(0).toUpperCase() + module.slice(1)} Session`
      );
      activateSession(sessionId);
      activeSession = getActiveSession();
    }

    if (activeSession) {
      // Set current module
      setCurrentModule(activeSession.id, module);
      
      // Set context data if provided
      if (options?.customer) {
        setCustomer(activeSession.id, options.customer);
      }
      if (options?.vehicle) {
        setVehicle(activeSession.id, options.vehicle);
      }
      if (options?.deal) {
        setDeal(activeSession.id, options.deal);
      }
    }
  };

  const pivotToCustomerWithVehicle = (customer: WorkspaceCustomer, vehicle?: WorkspaceVehicle) => {
    navigateWithContext('customer', { customer, vehicle });
  };

  const pivotToVehicleWithCustomer = (vehicle: WorkspaceVehicle, customer?: WorkspaceCustomer) => {
    navigateWithContext('inventory', { vehicle, customer });
  };

  const startDealWorkflow = (customer: WorkspaceCustomer, vehicle: WorkspaceVehicle) => {
    const deal: WorkspaceDeal = {
      id: `deal_${Date.now()}`,
      customerId: customer.id,
      vehicleId: vehicle.id,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    navigateWithContext('deal-desk', { customer, vehicle, deal, sessionName: 'Deal Session' });
  };

  return {
    navigateWithContext,
    pivotToCustomerWithVehicle,
    pivotToVehicleWithCustomer,
    startDealWorkflow,
    activeSession: getActiveSession(),
  };
}