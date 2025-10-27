import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ipAddress?: string;
  details?: string;
}

export interface AuditLogTableProps {
  logs: AuditLogEntry[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  onExport?: () => Promise<void> | void;
  className?: string;
}

function getPageRange(page: number, totalPages: number): number[] {
  const range: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let index = start; index <= end; index += 1) {
    range.push(index);
  }
  return range;
}

export function AuditLogTable({
  logs,
  loading = false,
  page,
  pageSize,
  total,
  onPageChange,
  filterValue,
  onFilterChange,
  onExport,
  className,
}: AuditLogTableProps): JSX.Element {
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageNumbers = useMemo(() => getPageRange(page, totalPages), [page, totalPages]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={filterValue ?? ''}
          onChange={(event) => onFilterChange?.(event.target.value)}
          placeholder="Search by user, action, or resource"
          className="w-full sm:max-w-sm"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const result = onExport?.();
            if (result instanceof Promise) {
              void result;
            }
          }}
        >
          Export CSV
        </Button>
      </div>
      <div className="overflow-hidden rounded border border-border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/70">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Timestamp</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Resource</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card/30">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="px-4 py-3" colSpan={5}>
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              : logs.map((log) => {
                  const isExpanded = expanded === log.id;
                  return (
                    <tr
                      key={log.id}
                      className={cn('cursor-pointer hover:bg-muted/60', isExpanded ? 'bg-muted/40' : undefined)}
                      onClick={() => setExpanded(isExpanded ? null : log.id)}
                    >
                      <td className="px-4 py-3 align-top text-sm text-foreground">
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                        {isExpanded && log.details ? (
                          <p className="mt-2 text-xs text-muted-foreground">{log.details}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-muted-foreground">{log.user}</td>
                      <td className="px-4 py-3 align-top text-sm text-muted-foreground">{log.action}</td>
                      <td className="px-4 py-3 align-top text-sm text-muted-foreground">{log.resource}</td>
                      <td className="px-4 py-3 align-top text-sm text-muted-foreground">{log.ipAddress ?? '—'}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {logs.length === 0 && !loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No audit events found.</div>
        ) : null}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (page > 1) {
                  onPageChange?.(page - 1);
                }
              }}
              aria-disabled={page === 1}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {pageNumbers.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === page}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange?.(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (page < totalPages) {
                  onPageChange?.(page + 1);
                }
              }}
              aria-disabled={page === totalPages}
              className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default AuditLogTable;
