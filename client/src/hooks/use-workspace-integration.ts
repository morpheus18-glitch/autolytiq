import { useEffect } from 'react';
import { useWorkspaceStore, useActiveSession, WorkspaceCustomer, WorkspaceVehicle, WorkspaceDeal } from '@/stores/workspace-context';
import { useQuery } from '@tanstack/react-query';

// Hook for integrating customer data with workspace
export function useWorkspaceCustomer(customerId?: number) {
  const { session, setCustomer } = useActiveSession();
  
  const { data: customer } = useQuery({
    queryKey: [`/api/customers/${customerId}`],
    enabled: !!customerId,
  });

  useEffect(() => {
    if (customer && customerId && session) {
      const workspaceCustomer: WorkspaceCustomer = {
        id: customer.id || customerId,
        firstName: customer.firstName || 'Unknown',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone,
        creditScore: customer.creditScore,
        leadScore: customer.leadScore,
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
  
  const { data: vehicle } = useQuery({
    queryKey: [`/api/inventory/${vehicleId}`],
    enabled: !!vehicleId,
  });

  useEffect(() => {
    if (vehicle && vehicleId && session) {
      const workspaceVehicle: WorkspaceVehicle = {
        id: vehicle.id || vehicleId,
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
  
  const { data: deal } = useQuery({
    queryKey: [`/api/deals/${dealId}`],
    enabled: !!dealId,
  });

  useEffect(() => {
    if (deal && dealId && session) {
      const workspaceDeal: WorkspaceDeal = {
        id: deal.id || dealId,
        customerId: deal.customerId,
        vehicleId: deal.vehicleId,
        status: deal.status || 'draft',
        totalAmount: deal.totalAmount,
        tradeInId: deal.tradeInId,
        notes: deal.notes,
        createdAt: deal.createdAt || new Date().toISOString(),
        updatedAt: deal.updatedAt || new Date().toISOString(),
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