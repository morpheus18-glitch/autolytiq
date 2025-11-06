import * as React from 'react';
import { cn } from '../utils/cn.js';
import { Card, CardHeader, CardTitle, CardContent } from './Card.js';
import { Badge } from './Badge.js';
import { Skeleton } from './Skeleton.js';

export type VehicleSummary = {
  id: string;
  stock?: string;
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  miles?: number;
  price?: number;
  daysInStock?: number;
  demandTag?: 'High' | 'Normal' | 'Low';
  acv?: number; // from pricing (optional)
  grossHint?: number; // from pricing (optional)
};

export type VehicleCardProps = {
  vehicle?: VehicleSummary;
  loading?: boolean;
  onOpenQuickView?: (id: string) => void;
  className?: string;
};

export function VehicleCard({
  vehicle,
  loading,
  onOpenQuickView,
  className,
}: VehicleCardProps) {
  if (loading) {
    return (
      <Card variant="outline" className="bg-surface-subtle">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-4 w-36" />
        </CardContent>
      </Card>
    );
  }

  if (!vehicle) return null;

  const title = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
    .filter(Boolean)
    .join(' ');
  const subtitle = [
    vehicle.stock ? `Stock ${vehicle.stock}` : null,
    vehicle.vin ? vehicle.vin.slice(-6).toUpperCase() : null,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Card
      hover={!!onOpenQuickView}
      className={cn('ui-elev-1 hover:ui-elev-2 transition-shadow', className)}
      onClick={() => onOpenQuickView?.(vehicle.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="truncate">{title}</CardTitle>
        {vehicle.demandTag && (
          <Badge
            variant={
              vehicle.demandTag === 'High'
                ? 'success'
                : vehicle.demandTag === 'Low'
                ? 'error'
                : 'secondary'
            }
          >
            {vehicle.demandTag} demand
          </Badge>
        )}
      </CardHeader>

      <CardContent className="text-sm text-text-secondary space-y-2">
        <div className="flex gap-3 flex-wrap">
          {vehicle.miles != null && (
            <span className="tabular-nums">
              {vehicle.miles.toLocaleString()} mi
            </span>
          )}
          {vehicle.daysInStock != null && (
            <span className="tabular-nums">{vehicle.daysInStock} days</span>
          )}
          {vehicle.price != null && (
            <span className="tabular-nums">
              ${vehicle.price.toLocaleString()}
            </span>
          )}
          {vehicle.grossHint != null && (
            <span className="tabular-nums">
              ~${vehicle.grossHint.toLocaleString()} gross
            </span>
          )}
        </div>
        {subtitle && (
          <div className="text-xs text-text-tertiary">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
}
