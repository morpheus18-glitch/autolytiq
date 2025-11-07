import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@repo/ui';
import { Select } from '@repo/ui';
import { KPIGroup } from '@/components/communications/KPIGroup.tsx';
import { useCommunicationsStore } from '@/stores/communications-store';
import { format, parseISO, subDays } from 'date-fns';
import { Download, Filter, Mail, MessageCircle, PhoneCall, TrendingUp, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const DATE_RANGES = [
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 180 days', value: 180 },
];

export default function CRMAnalytics() {
  const { metrics, communications, leads, appointments } = useCommunicationsStore((state) => ({
    metrics: state.metrics,
    communications: state.communications,
    leads: state.leads,
    appointments: state.appointments,
  }));

  const [range, setRange] = useState<number>(DATE_RANGES[0].value);
  const [selectedReps, setSelectedReps] = useState<string[]>(metrics.teamPerformance.map((rep) => rep.rep));

  const startDate = subDays(new Date(), range);

  const filteredCommunications = useMemo(
    () => communications.filter((message) => parseISO(message.createdAt) >= startDate),
    [communications, startDate],
  );

  const communicationsTimeline = useMemo(() => {
    const grouped: Record<string, { date: string; calls: number; sms: number; email: number }> = {};
    filteredCommunications.forEach((message) => {
      const dayKey = format(parseISO(message.createdAt), 'yyyy-MM-dd');
      if (!grouped[dayKey]) {
        grouped[dayKey] = { date: dayKey, calls: 0, sms: 0, email: 0 };
      }
      if (message.channel === 'call') grouped[dayKey].calls += 1;
      if (message.channel === 'sms') grouped[dayKey].sms += 1;
      if (message.channel === 'email') grouped[dayKey].email += 1;
    });
    return Object.values(grouped)
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .map((entry) => ({ ...entry, date: format(parseISO(entry.date), 'MMM d') }));
  }, [filteredCommunications]);

  const leadStatusData = useMemo(() => {
    const grouped: Record<string, number> = {};
    leads.forEach((lead) => {
      grouped[lead.status] = (grouped[lead.status] ?? 0) + 1;
    });
    return Object.entries(grouped).map(([status, value]) => ({ status, value }));
  }, [leads]);

  const teamPerformance = useMemo(() => {
    return metrics.teamPerformance.filter((rep) => selectedReps.includes(rep.rep));
  }, [metrics.teamPerformance, selectedReps]);

  const appointmentTrend = useMemo(() => {
    const grouped: Record<string, { date: string; scheduled: number; completed: number }> = {};
    appointments.forEach((appointment) => {
      const dateKey = format(parseISO(appointment.start), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, scheduled: 0, completed: 0 };
      }
      if (appointment.status === 'Completed') {
        grouped[dateKey].completed += 1;
      } else {
        grouped[dateKey].scheduled += 1;
      }
    });
    return Object.values(grouped)
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .map((entry) => ({ ...entry, date: format(parseISO(entry.date), 'MMM d') }));
  }, [appointments]);

  const kpis = useMemo(() => {
    return [
      {
        id: 'calls',
        label: 'Calls logged',
        value: metrics.totalCalls.toString(),
        change: 8,
        helperText: 'vs prior period',
        icon: <PhoneCall className="h-4 w-4 text-primary" />,
      },
      {
        id: 'sms',
        label: 'SMS sent',
        value: metrics.totalSms.toString(),
        change: 12,
        helperText: 'High engagement',
        icon: <MessageCircle className="h-4 w-4 text-emerald-500" />,
      },
      {
        id: 'emails',
        label: 'Emails delivered',
        value: metrics.totalEmails.toString(),
        change: 5,
        helperText: 'Deliverability stable',
        icon: <Mail className="h-4 w-4 text-sky-500" />,
      },
      {
        id: 'meetings',
        label: 'Meetings scheduled',
        value: metrics.meetingsScheduled.toString(),
        change: 18,
        helperText: 'Includes demos & deliveries',
        icon: <TrendingUp className="h-4 w-4 text-primary" />,
      },
    ];
  }, [metrics]);

  const exportCsv = () => {
    const headers = ['Rep', 'Calls', 'SMS', 'Emails', 'Meetings', 'Satisfaction'];
    const rows = metrics.teamPerformance.map((rep) => [
      rep.rep,
      rep.calls,
      rep.sms,
      rep.emails,
      rep.meetings,
      rep.satisfaction,
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'crm-analytics.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>CRM Analytics</h1>
          <p style={{ fontSize: '0.875rem' }}>
            Monitor communication velocity, conversion, and team effectiveness with live data.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Select value={range.toString()} onValueChange={(value: string) => setRange(Number(value))}>
            {DATE_RANGES.map((option) => (
              <option key={option.value} value={option.value.toString()}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={exportCsv}>
            <Download style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Export CSV
          </Button>
        </div>
      </div>

      <KPIGroup items={kpis} />

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}>
        <Card>
          <CardHeader style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sales performance
              <Badge variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Users style={{ width: '0.75rem', height: '0.75rem' }} /> {metrics.meetingsScheduled} in pipeline
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: '320px', paddingTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appointmentTrend}>
                <defs>
                  <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis dataKey="date" strokeOpacity={0.6} />
                <YAxis allowDecimals={false} strokeOpacity={0.6} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="scheduled" stroke="hsl(var(--primary))" fill="url(#colorScheduled)" />
                <Area type="monotone" dataKey="completed" stroke="hsl(var(--secondary))" fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Lead metrics
              <Badge variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Filter style={{ width: '0.75rem', height: '0.75rem' }} /> Status distribution
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: '320px', paddingTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadStatusData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis dataKey="status" strokeOpacity={0.6} />
                <YAxis allowDecimals={false} strokeOpacity={0.6} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <CardTitle style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Communication stats</CardTitle>
          </CardHeader>
          <CardContent style={{ height: '320px', paddingTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={communicationsTimeline}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis dataKey="date" strokeOpacity={0.6} />
                <YAxis allowDecimals={false} strokeOpacity={0.6} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calls" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="sms" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="email" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Team performance
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {metrics.teamPerformance.map((rep) => (
                  <Badge
                    key={rep.rep}
                    variant={selectedReps.includes(rep.rep) ? 'default' : 'outline'}
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      setSelectedReps((prev) =>
                        prev.includes(rep.rep)
                          ? prev.filter((name) => name !== rep.rep)
                          : [...prev, rep.rep],
                      )
                    }
                  >
                    {rep.rep}
                  </Badge>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: '320px', paddingTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis dataKey="rep" strokeOpacity={0.6} />
                <YAxis allowDecimals={false} strokeOpacity={0.6} />
                <Tooltip />
                <Legend />
                <Bar dataKey="calls" fill="hsl(var(--primary))" />
                <Bar dataKey="sms" fill="#10b981" />
                <Bar dataKey="emails" fill="#0ea5e9" />
                <Bar dataKey="meetings" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
