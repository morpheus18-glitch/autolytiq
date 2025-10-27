import React, { useEffect, createContext, useContext } from 'react';
import { useWorkspaceStore } from '@/stores/workspace-context';

interface WorkspaceContextType {
  initializeWorkspace: () => void;
  syncWithCurrentRoute: (path: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { 
    sessions, 
    createSession, 
    activateSession 
  } = useWorkspaceStore();

  const initializeWorkspace = () => {
    // Create default session if none exists
    if (sessions.length === 0) {
      const sessionId = createSession('Main Session', 'dashboard');
      activateSession(sessionId);
    }
  };

  const syncWithCurrentRoute = (path: string) => {
    // This can be implemented later for route syncing
  };

  // Initialize workspace on mount
  useEffect(() => {
    initializeWorkspace();
  }, [sessions.length, createSession, activateSession]);

  const contextValue: WorkspaceContextType = {
    initializeWorkspace,
    syncWithCurrentRoute,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
  }
  return context;
}