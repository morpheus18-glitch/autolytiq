import { useState } from 'react';
import CollapsibleSidebar from './collapsible-sidebar';

interface SidebarManagerProps {
  children: React.ReactNode;
}

export default function SidebarManager({ children }: SidebarManagerProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="layout h-screen bg-background relative">
      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />
      
      {/* Main content area - stays fixed on mobile, pushes on desktop */}
      <div className={`
        content flex-1 min-w-0 overflow-hidden flex flex-col h-full
        transition-all duration-300 ease-in-out
        md:ml-0 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'}
      `}>
        {children}
      </div>
    </div>
  );
}