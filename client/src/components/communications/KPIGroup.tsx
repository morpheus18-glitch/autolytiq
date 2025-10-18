import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface KPIItem {
  id: string;
  label: string;
  value: string;
  change?: number;
  helperText?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export interface KPIGroupProps {
  items: KPIItem[];
  columns?: number;
}

export function KPIGroup({ items, columns = 4 }: KPIGroupProps) {
  return (
    <div className={cn('grid gap-4', columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4')}>
      {items.map((item) => (
        <Card key={item.id} className="border-border/60 bg-background shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold text-foreground">{item.value}</span>
              {typeof item.change === 'number' ? (
                <Badge
                  variant={item.change >= 0 ? 'default' : 'destructive'}
                  className="rounded-full text-xs uppercase tracking-wide"
                >
                  {item.change >= 0 ? '+' : ''}
                  {item.change}%
                </Badge>
              ) : null}
            </div>
            {item.helperText ? <p className="text-xs text-muted-foreground">{item.helperText}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default KPIGroup;
