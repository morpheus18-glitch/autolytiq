import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import dayjs from 'dayjs';
import { CalendarIcon, Filter, LayoutGrid, List, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Select,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from '@repo/ui';
// TODO: Missing components to be added to @repo/ui
import { Slider } from '@repo/ui';
import { Calendar } from '@repo/ui';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui';
import { useToast } from '@repo/ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLeadDashboardStore } from '@/stores/lead-dashboard-store';
import { useLeadSocket } from '@/hooks/use-lead-socket';
import { fetchLeads, updateLeadStatus } from '@/lib/leadsApi';
import type { Lead, LeadStatus } from '@/types/leads';
import LeadCard from '@/components/leads/LeadCard.tsx';
import LeadScoreBadge from '@/components/leads/LeadScoreBadge.tsx';
import type { DateRange } from 'react-day-picker';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const STATUS_COLUMNS: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal'];

interface KPIConfig {
  id: string;
  title: string;
  description: string;
  value: number;
  delta: number;
  badgeClass: string;
}

interface SortableLeadCardProps {
  lead: Lead;
  onOpenDetail: (lead: Lead) => void;
}

function SortableLeadCard({ lead, onOpenDetail }: SortableLeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { status: lead.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  } as const;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-manipulation">
      <LeadCard lead={lead} onOpenDetail={onOpenDetail} />
    </div>
  );
}

function calculateDelta(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(((current - previous) / previous) * 100);
}

function determineTemperature(lead: Lead) {
  if (lead.isConverted) return 'won';
  if (lead.intentScore >= 85) return 'hot';
  if (lead.intentScore >= 60) return 'warm';
  return 'cold';
}

export default function LeadsDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    filters,
    viewMode,
    setViewMode,
    setFilter,
    resetFilters,
    sortKey,
    sortDirection,
    setSort,
    setStatusFilter,
  } = useLeadDashboardStore();

  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [boardState, setBoardState] = useState<Record<LeadStatus, Lead[]>>({
    new: [],
    contacted: [],
    qualified: [],
    proposal: [],
    won: [],
    lost: [],
  });
  const boardStateRef = useRef(boardState);

  useEffect(() => {
    boardStateRef.current = boardState;
  }, [boardState]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const apiFilters = useMemo(
    () => ({
      search: filters.search?.trim() || undefined,
      sources: filters.sources,
      status: filters.status,
      assignedTo: filters.assignedTo,
      minScore: filters.scoreRange[0],
      maxScore: filters.scoreRange[1],
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
    [filters],
  );

  const leadsQuery = useQuery({
    queryKey: ['market-leads', apiFilters],
    queryFn: () => fetchLeads(apiFilters),
    staleTime: 1000 * 30,
  });

  const leads: Lead[] = leadsQuery.data ?? [];

  const dateRangeValue = useMemo<DateRange | undefined>(() => {
    if (!filters.startDate && !filters.endDate) {
      return undefined;
    }

    return {
      from: filters.startDate ? dayjs(filters.startDate).toDate() : undefined,
      to: filters.endDate ? dayjs(filters.endDate).toDate() : undefined,
    };
  }, [filters.startDate, filters.endDate]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filters.sources?.length && !filters.sources.includes(lead.source)) {
        return false;
      }

      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      if (filters.assignedTo?.length) {
        const assignedId = lead.assignedTo?.userId;
        if (!assignedId || !filters.assignedTo.includes(assignedId)) {
          return false;
        }
      }

      if (lead.intentScore < filters.scoreRange[0] || lead.intentScore > filters.scoreRange[1]) {
        return false;
      }

      if (filters.startDate && dayjs(lead.createdAt).isBefore(dayjs(filters.startDate))) {
        return false;
      }

      if (filters.endDate && dayjs(lead.createdAt).isAfter(dayjs(filters.endDate))) {
        return false;
      }

      if (filters.search) {
        const haystack = [lead.name, lead.email, lead.phone, lead.source].join(' ').toLowerCase();
        if (!haystack.includes(filters.search.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [leads, filters]);

  useEffect(() => {
    const nextState: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      won: [],
      lost: [],
    };

    filteredLeads.forEach((lead) => {
      const status = STATUS_COLUMNS.includes(lead.status) ? lead.status : 'new';
      nextState[status].push(lead);
    });

    setBoardState(nextState);
  }, [filteredLeads]);

  const updateLeadInCache = useCallback(
    (mutator: (existing: Lead[]) => Lead[]) => {
      const queries = queryClient.getQueriesData<Lead[]>({ queryKey: ['market-leads'] });
      queries.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData(queryKey, mutator(data));
      });
    },
    [queryClient],
  );

  const updateStatusMutation = useMutation({
    mutationFn: updateLeadStatus,
    onMutate: async ({ id, status }: { id: string; status: LeadStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['market-leads'] });
        const previousQueries = queryClient.getQueriesData<Lead[]>({ queryKey: ['market-leads'] });
      const previousBoard = boardStateRef.current;

      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData(queryKey, data.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
      });

      return { previousQueries, previousBoard };
    },
    onError: (error, variables, context) => {
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      if (context?.previousBoard) {
        setBoardState(context.previousBoard);
      }

      const message = error instanceof Error ? error.message : 'Unable to update lead status.';
      toast({ title: 'Update failed', description: message, variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Lead updated', description: 'Lead status was updated successfully.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['market-leads'] });
    },
  });

  useLeadSocket({
    onLeadCreated: () => {
      queryClient.invalidateQueries({ queryKey: ['market-leads'] });
    },
    onLeadUpdated: (lead) => {
      updateLeadInCache((existing) => existing.map((item) => (item.id === lead.id ? { ...item, ...lead } : item)));
    },
    onLeadStatusChanged: ({ id, status }) => {
      updateLeadInCache((existing) => existing.map((item) => (item.id === id ? { ...item, status } : item)));
      setBoardState((current) => {
        const withoutLead = Object.fromEntries(
          Object.entries(current).map(([key, list]) => [key, list.filter((lead) => lead.id !== id)]),
        ) as Record<LeadStatus, Lead[]>;
        const targetColumn = STATUS_COLUMNS.includes(status) ? status : 'new';
        const existingLead =
          Object.values(current)
            .flat()
            .find((lead) => lead.id === id) ||
          leads.find((lead) => lead.id === id);
        if (existingLead) {
          withoutLead[targetColumn] = [{ ...existingLead, status }, ...withoutLead[targetColumn]];
        }
        return withoutLead;
      });
    },
  });

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveLeadId(null);
    if (!over) return;

    const fromColumn = active.data.current?.status as LeadStatus | undefined;
    const toColumn = over.id as LeadStatus | undefined;

    if (!fromColumn || !toColumn || fromColumn === toColumn) {
      return;
    }

    const activeLead = boardState[fromColumn].find((lead) => lead.id === active.id);
    if (!activeLead) return;

    setBoardState((current) => {
      const nextState = { ...current };
      nextState[fromColumn] = nextState[fromColumn].filter((lead) => lead.id !== active.id);
      nextState[toColumn] = [{ ...activeLead, status: toColumn }, ...nextState[toColumn]];
      return nextState;
    });

    updateStatusMutation.mutate({ id: String(active.id), status: toColumn });
  };

  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads];
    sorted.sort((a, b) => {
      let compare = 0;
      switch (sortKey) {
        case 'name':
          compare = a.name.localeCompare(b.name);
          break;
        case 'intentScore':
          compare = a.intentScore - b.intentScore;
          break;
        case 'status':
          compare = a.status.localeCompare(b.status);
          break;
        case 'updatedAt':
          compare = dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf();
          break;
        case 'assignedTo':
          compare = (a.assignedTo?.name ?? 'Unassigned').localeCompare(b.assignedTo?.name ?? 'Unassigned');
          break;
        default:
          break;
      }
      return sortDirection === 'asc' ? compare : -compare;
    });
    return sorted;
  }, [filteredLeads, sortKey, sortDirection]);

  const uniqueSources = useMemo(() => Array.from(new Set(leads.map((lead) => lead.source))).sort(), [leads]);
  const uniqueOwners = useMemo(
    () =>
      Array.from(
        new Map(
          leads
            .filter((lead) => lead.assignedTo)
            .map((lead) => [lead.assignedTo!.userId, lead.assignedTo!]),
        ).values(),
      ),
    [leads],
  );

  const now = dayjs();
  const currentWindowStart = now.subtract(7, 'day');
  const previousWindowStart = now.subtract(14, 'day');

  const kpis: KPIConfig[] = useMemo(() => {
    const currentWindowLeads = leads.filter((lead) => dayjs(lead.createdAt).isAfter(currentWindowStart));
    const previousWindowLeads = leads.filter((lead) =>
      dayjs(lead.createdAt).isAfter(previousWindowStart) && dayjs(lead.createdAt).isBefore(currentWindowStart),
    );

    const getCount = (collection: Lead[], predicate: (lead: Lead) => boolean) => collection.filter(predicate).length;

    const currentStats = {
      new: getCount(currentWindowLeads, (lead) => lead.status === 'new'),
      hot: getCount(currentWindowLeads, (lead) => determineTemperature(lead) === 'hot'),
      warm: getCount(currentWindowLeads, (lead) => determineTemperature(lead) === 'warm'),
      cold: getCount(currentWindowLeads, (lead) => determineTemperature(lead) === 'cold'),
      won: getCount(currentWindowLeads, (lead) => lead.isConverted ?? false),
    };

    const previousStats = {
      new: getCount(previousWindowLeads, (lead) => lead.status === 'new'),
      hot: getCount(previousWindowLeads, (lead) => determineTemperature(lead) === 'hot'),
      warm: getCount(previousWindowLeads, (lead) => determineTemperature(lead) === 'warm'),
      cold: getCount(previousWindowLeads, (lead) => determineTemperature(lead) === 'cold'),
      won: getCount(previousWindowLeads, (lead) => lead.isConverted ?? false),
    };

    return [
      {
        id: 'new',
        title: 'New',
        description: 'Net new inbound leads',
        value: currentStats.new,
        delta: calculateDelta(currentStats.new, previousStats.new),
        badgeClass: 'bg-blue-100 text-blue-700',
      },
      {
        id: 'hot',
        title: 'Hot',
        description: 'Highly engaged buyers',
        value: currentStats.hot,
        delta: calculateDelta(currentStats.hot, previousStats.hot),
        badgeClass: 'bg-red-100 text-red-700',
      },
      {
        id: 'warm',
        title: 'Warm',
        description: 'Active nurtures',
        value: currentStats.warm,
        delta: calculateDelta(currentStats.warm, previousStats.warm),
        badgeClass: 'bg-orange-100 text-orange-700',
      },
      {
        id: 'cold',
        title: 'Cold',
        description: 'Requires re-engagement',
        value: currentStats.cold,
        delta: calculateDelta(currentStats.cold, previousStats.cold),
        badgeClass: 'bg-slate-100 text-slate-700',
      },
      {
        id: 'won',
        title: 'Won',
        description: 'Converted customers',
        value: currentStats.won,
        delta: calculateDelta(currentStats.won, previousStats.won),
        badgeClass: 'bg-emerald-100 text-emerald-700',
      },
    ];
  }, [leads, currentWindowStart, previousWindowStart]);

  const activeLead = activeLeadId
    ? leads.find((lead) => lead.id === activeLeadId) ?? null
    : null;

  const renderKpis = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">{kpi.title}</CardTitle>
              <Badge className={kpi.badgeClass}>{kpi.value}</Badge>
            </div>
            <p className="text-xs text-slate-500">{kpi.description}</p>
          </CardHeader>
          <CardContent>
            <div className={`text-sm font-medium ${kpi.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {kpi.delta >= 0 ? '+' : ''}
              {kpi.delta}% vs last 7d
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFilters = () => (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Filter className="h-4 w-4" /> Lead Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Search</label>
          <Input
            placeholder="Search by name, email, phone"
            value={filters.search ?? ''}
            onChange={(event) => setFilter('search', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Source</label>
          <Select
            value={filters.sources?.[0] ?? 'all'}
            onChange={(e) => setFilter('sources', e.target.value === 'all' ? [] : [e.target.value])}
          >
            <option value="all">All sources</option>
            {uniqueSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Status</label>
          <Select
            value={filters.status ?? 'all'}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
          >
            <option value="all">All statuses</option>
            {STATUS_COLUMNS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Owner</label>
          <Select
            value={filters.assignedTo?.[0] ?? 'all'}
            onChange={(e) => setFilter('assignedTo', e.target.value === 'all' ? [] : [e.target.value])}
          >
            <option value="all">All owners</option>
            {uniqueOwners.map((owner) => (
              <option key={owner.userId} value={owner.userId}>
                {owner.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Score</label>
          <div className="space-y-3">
            <Slider
              min={0}
              max={100}
              step={1}
              value={filters.scoreRange ?? [0, 100]}
              onValueChange={(value) => setFilter('scoreRange', value as [number, number])}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{filters.scoreRange?.[0] ?? 0}</span>
              <span>{filters.scoreRange?.[1] ?? 100}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Created Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRangeValue?.from ? (
                  dateRangeValue.to ? (
                    <span>
                      {dayjs(dateRangeValue.from).format('MMM D, YYYY')} – {dayjs(dateRangeValue.to).format('MMM D, YYYY')}
                    </span>
                  ) : (
                    dayjs(dateRangeValue.from).format('MMM D, YYYY')
                  )
                ) : (
                  <span>All time</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRangeValue}
                onSelect={(range) => {
                  setFilter('startDate', range?.from ? dayjs(range.from).startOf('day').toISOString() : undefined);
                  setFilter('endDate', range?.to ? dayjs(range.to).endOf('day').toISOString() : undefined);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-end justify-end">
          <Button variant="ghost" size="sm" onClick={() => resetFilters()} className="text-slate-500">
            <RefreshCw className="mr-2 h-4 w-4" /> Reset filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderKanban = () => (
    <div className="grid gap-4 xl:grid-cols-4">
      {STATUS_COLUMNS.map((column) => (
        <div key={column} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-sm font-semibold uppercase text-slate-500">{column}</h3>
              <p className="text-xs text-slate-400">{boardState[column].length} leads</p>
            </div>
            <Badge variant="secondary" className="bg-white text-slate-700">
              {Math.round(
                boardState[column].reduce((sum, lead) => sum + lead.intentScore, 0) /
                  Math.max(boardState[column].length || 1, 1),
              )}
            </Badge>
          </div>
          <div className="space-y-3">
            <SortableContext items={boardState[column].map((lead) => lead.id)}>
              {boardState[column].map((lead) => (
                <SortableLeadCard
                  key={lead.id}
                  lead={lead}
                  onOpenDetail={(selected) => navigate(`/leads/${selected.id}`)}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      ))}
    </div>
  );

  const renderList = () => (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => setSort('name')} className="cursor-pointer">
                Lead
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead onClick={() => setSort('intentScore')} className="cursor-pointer">
                Score
              </TableHead>
              <TableHead onClick={() => setSort('status')} className="cursor-pointer">
                Status
              </TableHead>
              <TableHead onClick={() => setSort('assignedTo')} className="cursor-pointer">
                Owner
              </TableHead>
              <TableHead onClick={() => setSort('updatedAt')} className="cursor-pointer">
                Updated
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="font-medium text-slate-900">{lead.name}</div>
                  <div className="text-xs text-slate-500">{lead.email ?? lead.phone ?? '—'}</div>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{lead.source}</TableCell>
                <TableCell>
                  <LeadScoreBadge score={lead.intentScore} size="sm" />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {lead.assignedTo?.name ?? 'Unassigned'}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {lead.updatedAt ? dayjs(lead.updatedAt).fromNow() : '—'}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/leads/${lead.id}`)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Lead Workspace</h1>
          <p className="text-sm text-slate-500">Monitor pipeline velocity and collaborate with your sales team in real-time.</p>
        </div>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'kanban' | 'list')}>
          <ToggleGroupItem value="kanban" aria-label="Kanban view">
            <LayoutGrid className="mr-2 h-4 w-4" /> Kanban
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="mr-2 h-4 w-4" /> List
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {renderKpis()}
      {renderFilters()}

      {leadsQuery.isLoading ? (
        <div className="grid gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={({ active }) => setActiveLeadId(String(active.id))}
          onDragCancel={() => setActiveLeadId(null)}
          onDragEnd={handleDragEnd}
        >
          {renderKanban()}
          <DragOverlay>{activeLead ? <LeadCard lead={activeLead} /> : null}</DragOverlay>
        </DndContext>
      ) : (
        renderList()
      )}
    </div>
  );
}
