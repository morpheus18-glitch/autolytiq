/**
 * ShowroomManagerLayout
 *
 * Layout for Showroom/Inventory Manager pages.
 * Desktop: 5/7 split (left: list, right: detail)
 * Mobile: Tabbed view with bottom sheet pattern
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';

export type ShowroomManagerLayoutProps = {
  className?: string;
  left: React.ReactNode; // Vehicles list
  right: React.ReactNode; // Detail (vehicle/customer)
  mobileTabs?: React.ReactNode; // optional: tabs selector on mobile
};

export function ShowroomManagerLayout({
  left,
  right,
  mobileTabs,
  className,
}: ShowroomManagerLayoutProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: 5/7 split view */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5">{left}</div>
          <div className="col-span-7">{right}</div>
        </div>
      </div>

      {/* Mobile: tabs + stack pattern */}
      <div className="lg:hidden space-y-3">
        {mobileTabs}
        <div>{left}</div>
        {/* Detail opens via Sheet from the app side */}
      </div>
    </div>
  );
}
