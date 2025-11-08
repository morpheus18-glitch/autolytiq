import { memo, useMemo } from 'react';
import { Phone, Mail, MessageSquare, ExternalLink, MapPin } from 'lucide-react';
import { Card, CardContent } from '@repo/ui';
import { Button } from '@repo/ui';
import LeadScoreBadge from '@/components/leads/LeadScoreBadge';
import type { Lead } from '@/types/leads';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onCall?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onText?: (lead: Lead) => void;
  onOpenDetail?: (lead: Lead) => void;
  highlight?: boolean;
}

const badgeClasses: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-slate-100 text-slate-700 border-slate-200',
  qualified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  proposal: 'bg-amber-100 text-amber-700 border-amber-200',
  won: 'bg-teal-100 text-teal-700 border-teal-200',
  lost: 'bg-rose-100 text-rose-700 border-rose-200',
};

function LeadCardComponent({ lead, onCall, onEmail, onText, onOpenDetail, highlight }: LeadCardProps) {
  const vehicleInterest = useMemo(() => {
    if (!lead.vehicleInterest || !lead.vehicleInterest.length) {
      return 'General interest';
    }

    if (typeof lead.vehicleInterest[0] === 'string') {
      return (lead.vehicleInterest as string[]).join(', ');
    }

    return (lead.vehicleInterest as any[])
      .map((vehicle) =>
        [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' '),
      )
      .filter(Boolean)
      .join(', ');
  }, [lead.vehicleInterest]);

  return (
    <Card
      data-lead-id={lead.id}
      className={cn(
        'group border border-slate-200 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing',
        highlight && 'ring-2 ring-emerald-400',
      )}
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onOpenDetail?.(lead)}
              className="text-left text-base font-semibold text-slate-900 hover:text-indigo-600"
            >
              {lead.name}
            </button>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {lead.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {lead.email}
                </span>
              )}
              {lead.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {lead.phone}
                </span>
              )}
              {lead.region && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {lead.region}
                </span>
              )}
            </div>
          </div>
          <LeadScoreBadge score={lead.intentScore} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium capitalize',
              badgeClasses[lead.status] ?? 'bg-slate-100 text-slate-700 border-slate-200',
            )}
          >
            {lead.status}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
            {lead.lifecycleStage}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
            {vehicleInterest}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            {lead.timeframe ? `Timeline: ${lead.timeframe}` : 'Timeline: TBD'}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onCall?.(lead)} title="Call lead">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onText?.(lead)} title="Text lead">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEmail?.(lead)} title="Email lead">
              <Mail className="h-4 w-4" />
            </Button>
            {lead.sourceUrl ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(lead.sourceUrl!, '_blank')}
                title="Open source"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const LeadCard = memo(LeadCardComponent);

export default LeadCard;
