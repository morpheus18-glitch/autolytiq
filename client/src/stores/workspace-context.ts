import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Core workspace entities
export interface WorkspaceCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  creditScore?: number;
  leadScore?: number;
}

export interface WorkspaceVehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  status: string;
  stockNumber: string;
}

export interface WorkspaceDeal {
  id: string;
  customerId?: number;
  vehicleId?: number;
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled';
  totalAmount?: number;
  tradeInId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSession {
  id: string;
  name: string;
  customer?: WorkspaceCustomer;
  vehicle?: WorkspaceVehicle;
  deal?: WorkspaceDeal;
  tradeIn?: WorkspaceVehicle;
  currentModule: 'customer' | 'inventory' | 'showroom' | 'deal-desk' | 'dashboard';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceStore {
  // Active sessions (multi-tab support)
  sessions: WorkspaceSession[];
  activeSessionId: string | null;
  
  // Quick actions state
  isSessionBarVisible: boolean;
  
  // Session management
  createSession: (name: string, initialModule?: string) => string;
  activateSession: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: Partial<WorkspaceSession>) => void;
  closeSession: (sessionId: string) => void;
  
  // Context management
  setCustomer: (sessionId: string, customer: WorkspaceCustomer) => void;
  setVehicle: (sessionId: string, vehicle: WorkspaceVehicle) => void;
  setDeal: (sessionId: string, deal: WorkspaceDeal) => void;
  setTradeIn: (sessionId: string, tradeIn: WorkspaceVehicle) => void;
  setCurrentModule: (sessionId: string, module: WorkspaceSession['currentModule']) => void;
  
  // Quick navigation
  pivotToCustomer: (sessionId: string, customerId: number) => void;
  pivotToVehicle: (sessionId: string, vehicleId: number) => void;
  pivotToDeal: (sessionId: string, dealId: string) => void;
  
  // Session bar
  toggleSessionBar: () => void;
  
  // Getters
  getActiveSession: () => WorkspaceSession | null;
  getSession: (sessionId: string) => WorkspaceSession | null;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set: any, get: any) => ({
      sessions: [],
      activeSessionId: null,
      isSessionBarVisible: true,
      
      createSession: (name: string, initialModule = 'dashboard') => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSession: WorkspaceSession = {
          id: sessionId,
          name,
          currentModule: initialModule as WorkspaceSession['currentModule'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: sessionId,
        }));
        
        return sessionId;
      },
      
      activateSession: (sessionId: string) => {
        set(state => ({
          activeSessionId: sessionId,
          sessions: state.sessions.map(session => ({
            ...session,
            isActive: session.id === sessionId,
            updatedAt: session.id === sessionId ? new Date().toISOString() : session.updatedAt,
          })),
        }));
      },
      
      updateSession: (sessionId: string, updates: Partial<WorkspaceSession>) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, ...updates, updatedAt: new Date().toISOString() }
              : session
          ),
        }));
      },
      
      closeSession: (sessionId: string) => {
        set(state => {
          const remainingSessions = state.sessions.filter(s => s.id !== sessionId);
          const newActiveSessionId = state.activeSessionId === sessionId
            ? remainingSessions.length > 0 ? remainingSessions[remainingSessions.length - 1].id : null
            : state.activeSessionId;
          
          return {
            sessions: remainingSessions,
            activeSessionId: newActiveSessionId,
          };
        });
      },
      
      setCustomer: (sessionId: string, customer: WorkspaceCustomer) => {
        get().updateSession(sessionId, { customer });
      },
      
      setVehicle: (sessionId: string, vehicle: WorkspaceVehicle) => {
        get().updateSession(sessionId, { vehicle });
      },
      
      setDeal: (sessionId: string, deal: WorkspaceDeal) => {
        get().updateSession(sessionId, { deal });
      },
      
      setTradeIn: (sessionId: string, tradeIn: WorkspaceVehicle) => {
        get().updateSession(sessionId, { tradeIn });
      },
      
      setCurrentModule: (sessionId: string, module: WorkspaceSession['currentModule']) => {
        get().updateSession(sessionId, { currentModule: module });
      },
      
      pivotToCustomer: (sessionId: string, customerId: number) => {
        // This would typically fetch customer data and set it
        get().setCurrentModule(sessionId, 'customer');
        // TODO: Fetch customer data and call setCustomer
      },
      
      pivotToVehicle: (sessionId: string, vehicleId: number) => {
        get().setCurrentModule(sessionId, 'inventory');
        // TODO: Fetch vehicle data and call setVehicle
      },
      
      pivotToDeal: (sessionId: string, dealId: string) => {
        get().setCurrentModule(sessionId, 'deal-desk');
        // TODO: Fetch deal data and call setDeal
      },
      
      toggleSessionBar: () => {
        set(state => ({ isSessionBarVisible: !state.isSessionBarVisible }));
      },
      
      getActiveSession: () => {
        const state = get();
        return state.sessions.find(s => s.id === state.activeSessionId) || null;
      },
      
      getSession: (sessionId: string) => {
        return get().sessions.find(s => s.id === sessionId) || null;
      },
    }),
    {
      name: 'autolytiq-workspace',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        isSessionBarVisible: state.isSessionBarVisible,
      }),
    }
  )
);

// Workspace hooks
export const useActiveSession = () => {
  const activeSession = useWorkspaceStore(state => state.getActiveSession());
  const setCurrentModule = useWorkspaceStore(state => state.setCurrentModule);
  const setCustomer = useWorkspaceStore(state => state.setCustomer);
  const setVehicle = useWorkspaceStore(state => state.setVehicle);
  const setDeal = useWorkspaceStore(state => state.setDeal);
  
  return {
    session: activeSession,
    setCurrentModule: (module: WorkspaceSession['currentModule']) => 
      activeSession && setCurrentModule(activeSession.id, module),
    setCustomer: (customer: WorkspaceCustomer) => 
      activeSession && setCustomer(activeSession.id, customer),
    setVehicle: (vehicle: WorkspaceVehicle) => 
      activeSession && setVehicle(activeSession.id, vehicle),
    setDeal: (deal: WorkspaceDeal) => 
      activeSession && setDeal(activeSession.id, deal),
  };
};