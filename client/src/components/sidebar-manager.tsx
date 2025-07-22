import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileSidebar from '@/components/mobile-sidebar';
import DesktopSidebar from '@/components/desktop-sidebar';

interface SidebarManagerProps {
  children: React.ReactNode;
}

export default function SidebarManager({ children }: SidebarManagerProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div className="layout h-screen bg-background flex flex-col md:flex-row">
      {isMobile ? (
        <>
          {/* Mobile overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeMobileSidebar}
            />
          )}
          
          {/* Mobile Sidebar */}
          <MobileSidebar 
            isOpen={isMobileSidebarOpen} 
            onClose={closeMobileSidebar}
            onToggle={toggleMobileSidebar}
          />
        </>
      ) : (
        /* Desktop Sidebar */
        <DesktopSidebar />
      )}
      
      {/* Main content area */}
      <div className="content flex-1 min-w-0 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}