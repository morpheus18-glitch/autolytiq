import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border border-gray-200',
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  'credit pulled': 'bg-blue-100 text-blue-700 border border-blue-200',
  submitted: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  approved: 'bg-green-100 text-green-700 border border-green-200',
  contracted: 'bg-purple-100 text-purple-700 border border-purple-200',
  funded: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  delivered: 'bg-black text-white border border-black/10',
  cancelled: 'bg-red-100 text-red-700 border border-red-200',
};

export interface DealStatusBadgeProps {
  status: string;
  className?: string;
}

export function DealStatusBadge({ status, className }: DealStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const styles = STATUS_STYLES[normalized] ?? 'bg-slate-100 text-slate-700 border border-slate-200';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
        styles,
        className,
      )}
    >
      {status}
    </span>
  );
}

export default DealStatusBadge;
