import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card.js';
import { Badge } from './Badge.js';
import { Skeleton } from './Skeleton.js';

export type CustomerSummary = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  score?: number; // ML score 0-100
  lastTouch?: string; // ISO date string
  privacy?: { hasPII?: boolean }; // gate personal fields
};

export type CustomerCardProps = {
  customer?: CustomerSummary;
  loading?: boolean;
  className?: string;
};

export function CustomerCard({
  customer,
  loading,
  className,
}: CustomerCardProps) {
  if (loading) {
    return (
      <Card variant="outline" className={className}>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (!customer) return null;

  const redacted = customer.privacy?.hasPII;
  const contact = [
    redacted ? 'Phone: ••••' : customer.phone,
    redacted ? 'Email: ••••' : customer.email,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Card hover className={`ui-elev-1 hover:ui-elev-2 transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="truncate">{customer.name}</CardTitle>
        {customer.score != null && (
          <Badge
            variant={
              customer.score >= 75
                ? 'success'
                : customer.score >= 40
                ? 'warning'
                : 'secondary'
            }
          >
            Score {customer.score}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="text-sm text-text-secondary space-y-1">
        {contact && <div className="truncate">{contact}</div>}
        {customer.lastTouch && (
          <div className="text-xs text-text-tertiary">
            Last touch: {new Date(customer.lastTouch).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
