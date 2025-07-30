import { ReactNode } from 'react';
import MobileResponsiveLayout from './layout/mobile-responsive-layout';

interface SidebarManagerProps {
  children: ReactNode;
}

export default function SidebarManager({ children }: SidebarManagerProps) {
  return (
    <MobileResponsiveLayout
      title="Dashboard"
      subtitle="Enterprise dealership management"
    >
      {children}
    </MobileResponsiveLayout>
  );
}