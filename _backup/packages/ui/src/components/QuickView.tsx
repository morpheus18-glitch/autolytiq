import * as React from 'react';

/**
 * QuickView Component
 *
 * Hook-in point for quick view functionality.
 * The app will attach content to a sheet/modal via portal or route.
 * This keeps the UI library pure and allows apps to control the detail content.
 */

export type QuickViewProps = {
  id: string;
  type?: 'vehicle' | 'customer' | 'deal' | 'lead';
  className?: string;
};

export function QuickView({ id, type, className }: QuickViewProps) {
  return (
    <div
      data-quickview-id={id}
      data-quickview-type={type}
      className={`hidden ${className || ''}`}
    />
  );
}
