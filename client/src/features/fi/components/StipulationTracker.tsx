import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { LenderStipulationDto } from '../api';

interface StipulationTrackerProps {
  stipulations: LenderStipulationDto[];
  onSatisfy?: (stipulationId: string) => void;
  disabled?: boolean;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getStatusVariant(status: LenderStipulationDto['status']) {
  switch (status) {
    case 'SATISFIED':
      return 'default' as const;
    case 'WAIVED':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

export default function StipulationTracker({ stipulations, onSatisfy, disabled }: StipulationTrackerProps) {
  if (!stipulations.length) {
    return <p className="text-sm text-muted-foreground">No stipulations on this submission.</p>;
  }

  return (
    <div className="space-y-3">
      {stipulations.map((stipulation) => {
        const dueDate = formatDate(stipulation.dueDate);
        const receivedAt = formatDate(stipulation.receivedAt);
        const isSatisfied = stipulation.status !== 'REQUIRED';
        return (
          <div
            key={stipulation.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-muted bg-card p-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(stipulation.status)}>{stipulation.status}</Badge>
                {dueDate ? <span className="text-xs text-muted-foreground">Due {dueDate}</span> : null}
                {receivedAt ? <span className="text-xs text-muted-foreground">Received {receivedAt}</span> : null}
              </div>
              <p className="text-sm font-medium text-foreground">{stipulation.description}</p>
              {stipulation.notes ? <p className="text-xs text-muted-foreground">{stipulation.notes}</p> : null}
            </div>
            {onSatisfy && stipulation.status === 'REQUIRED' ? (
              <Button variant="outline" size="sm" onClick={() => onSatisfy(stipulation.id)} disabled={disabled}>
                Mark satisfied
              </Button>
            ) : null}
            {isSatisfied && !stipulation.receivedAt && stipulation.status === 'SATISFIED' ? (
              <span className="text-xs text-muted-foreground">Pending confirmation</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
