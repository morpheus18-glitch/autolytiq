import { create } from 'zustand';
import { addDays, addHours, formatISO, parseISO, setHours, setMinutes, startOfDay } from 'date-fns';

export type CommunicationChannel = 'call' | 'sms' | 'email';
export type CommunicationFilter = 'unread' | 'starred' | 'needsReply' | 'followUp';

export interface LeadProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'In Progress' | 'Hot' | 'Customer';
  stage: string;
  leadSource: string;
  assignedTo: string;
  location: string;
  timezone: string;
  lastContact: string;
  nextContact?: string;
  leadScore: number;
  lifetimeValue: number;
  lastPurchase?: string;
  interests: string[];
  tags: string[];
  optIns: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  financialProfile: {
    creditScore: number;
    preApprovalAmount: number;
    lender: string;
    monthlyBudget: number;
  };
  household: Array<{
    name: string;
    relationship: string;
    notes?: string;
  }>;
  preferences: {
    contactMethods: string[];
    preferredTimes: string[];
    vehiclesOfInterest: string[];
  };
  purchaseHistory: Array<{
    id: string;
    product: string;
    price: number;
    date: string;
  }>;
  serviceHistory: Array<{
    id: string;
    service: string;
    advisor: string;
    date: string;
    notes?: string;
  }>;
  tradeIns: Array<{
    vehicle: string;
    appraisalValue: number;
    date: string;
  }>;
  nextBestOffer: {
    title: string;
    description: string;
    reason: string;
  };
}

export interface CommunicationRecord {
  id: string;
  threadId: string;
  leadId: string;
  channel: CommunicationChannel;
  direction: 'inbound' | 'outbound';
  subject?: string;
  preview: string;
  body: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'answered' | 'missed' | 'scheduled';
  unread: boolean;
  starred: boolean;
  requiresReply: boolean;
  followUpDue?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  sentiment?: 'positive' | 'neutral' | 'negative';
  durationSeconds?: number;
  transcriptSummary?: string;
  aiRecommendations?: string[];
}

export interface Reminder {
  id: string;
  leadId: string;
  title: string;
  dueAt: string;
  channel: CommunicationChannel | 'appointment';
  notifyMinutesBefore: number;
  completed: boolean;
}

export interface AppointmentRecord {
  id: string;
  leadId: string;
  title: string;
  type: 'In-store Visit' | 'Virtual Demo' | 'Service' | 'Delivery';
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';
  start: string;
  end: string;
  location: string;
  advisor: string;
  notes?: string;
  aiSuggestions?: string[];
  conflicts?: string[];
}

export interface QuickReply {
  id: string;
  channel: 'sms' | 'email';
  label: string;
  content: string;
}

export interface TemplateDefinition {
  id: string;
  channel: 'sms' | 'email';
  name: string;
  category: string;
  subject?: string;
  body: string;
  variables: string[];
}

export interface CommunicationMetrics {
  totalCalls: number;
  totalSms: number;
  totalEmails: number;
  meetingsScheduled: number;
  conversionRate: number;
  avgResponseMinutes: number;
  teamPerformance: Array<{
    rep: string;
    calls: number;
    sms: number;
    emails: number;
    meetings: number;
    satisfaction: number;
  }>;
  channelPerformance: Array<{
    channel: CommunicationChannel;
    engagementRate: number;
    responseMinutes: number;
    sentimentScore: number;
  }>;
}

interface CommunicationsState {
  leads: LeadProfile[];
  communications: CommunicationRecord[];
  appointments: AppointmentRecord[];
  reminders: Reminder[];
  quickReplies: QuickReply[];
  templates: TemplateDefinition[];
  metrics: CommunicationMetrics;
  activeLeadId?: string;
  addCommunication: (record: CommunicationRecord) => void;
  markThreadRead: (threadId: string) => void;
  toggleStar: (id: string) => void;
  setRequiresReply: (id: string, requiresReply: boolean) => void;
  addReminder: (reminder: Reminder) => void;
  completeReminder: (id: string) => void;
  upsertAppointment: (appointment: AppointmentRecord) => void;
  completeAppointment: (id: string) => void;
  setActiveLead: (leadId: string) => void;
  refreshMetrics: () => void;
  addQuickReply: (reply: QuickReply) => void;
  addTemplate: (template: TemplateDefinition) => void;
  activateRealtimeFeed: () => () => void;
}

const now = new Date();

const demoLeads: LeadProfile[] = [
  {
    id: 'lead-1',
    name: 'Jordan Matthews',
    email: 'jordan.matthews@example.com',
    phone: '+1 (480) 555-2389',
    status: 'Hot',
    stage: 'Negotiation',
    leadSource: 'Facebook Ads',
    assignedTo: 'Avery Chen',
    location: 'Phoenix, AZ',
    timezone: 'America/Phoenix',
    lastContact: formatISO(addHours(now, -5)),
    nextContact: formatISO(addHours(now, 4)),
    leadScore: 92,
    lifetimeValue: 68450,
    lastPurchase: '2022-11-02',
    interests: ['EV', 'SUV'],
    tags: ['High Intent', 'EV Incentives'],
    optIns: { email: true, sms: true, phone: true },
    financialProfile: {
      creditScore: 756,
      preApprovalAmount: 72000,
      lender: 'Bank of America',
      monthlyBudget: 950,
    },
    household: [
      { name: 'Taylor Matthews', relationship: 'Spouse' },
      { name: 'Oakley Matthews', relationship: 'Child', notes: 'College sophomore' },
    ],
    preferences: {
      contactMethods: ['SMS', 'Email'],
      preferredTimes: ['Morning', 'Early Afternoon'],
      vehiclesOfInterest: ['2025 Electra SUV', '2024 Horizon Hybrid'],
    },
    purchaseHistory: [
      { id: 'po-9811', product: '2022 Breeze Crossover', price: 36450, date: '2022-11-02' },
    ],
    serviceHistory: [
      {
        id: 'svc-728',
        service: '40k Scheduled Maintenance',
        advisor: 'Morgan Hill',
        date: '2024-08-14',
        notes: 'Requested EV loaner',
      },
    ],
    tradeIns: [
      { vehicle: '2018 Wave Hatchback', appraisalValue: 11500, date: '2022-10-28' },
    ],
    nextBestOffer: {
      title: 'Upgrade to 2025 Electra Launch Edition',
      description: 'Exclusive loyalty pricing and free charging for two years.',
      reason: 'Matches EV interest and payment tolerance; high satisfaction score.',
    },
  },
  {
    id: 'lead-2',
    name: 'Isabella Grant',
    email: 'isabella.grant@example.com',
    phone: '+1 (206) 555-7420',
    status: 'In Progress',
    stage: 'Demo Scheduled',
    leadSource: 'Website Chat',
    assignedTo: 'Kai Rivera',
    location: 'Seattle, WA',
    timezone: 'America/Los_Angeles',
    lastContact: formatISO(addHours(now, -12)),
    nextContact: formatISO(addHours(now, 2)),
    leadScore: 81,
    lifetimeValue: 0,
    interests: ['Compact SUV'],
    tags: ['First-time buyer'],
    optIns: { email: true, sms: true, phone: false },
    financialProfile: {
      creditScore: 689,
      preApprovalAmount: 52000,
      lender: 'Credit Union West',
      monthlyBudget: 640,
    },
    household: [{ name: 'Milo Grant', relationship: 'Partner' }],
    preferences: {
      contactMethods: ['Email'],
      preferredTimes: ['Lunch Hour', 'Evening'],
      vehiclesOfInterest: ['2024 Trailfinder AWD'],
    },
    purchaseHistory: [],
    serviceHistory: [],
    tradeIns: [],
    nextBestOffer: {
      title: 'Trailfinder AWD Demo Bundle',
      description: 'Schedule an extended drive with complimentary accessories.',
      reason: 'High engagement with AWD content and booked demo.',
    },
  },
  {
    id: 'lead-3',
    name: 'Marcus Cole',
    email: 'marcus.cole@example.com',
    phone: '+1 (720) 555-9981',
    status: 'Customer',
    stage: 'Loyalty',
    leadSource: 'Referral',
    assignedTo: 'Avery Chen',
    location: 'Denver, CO',
    timezone: 'America/Denver',
    lastContact: formatISO(addHours(now, -48)),
    leadScore: 70,
    lifetimeValue: 128300,
    interests: ['Performance', 'Accessories'],
    tags: ['Equity Alert', 'VIP'],
    optIns: { email: true, sms: true, phone: true },
    financialProfile: {
      creditScore: 801,
      preApprovalAmount: 95000,
      lender: 'Ally Bank',
      monthlyBudget: 1050,
    },
    household: [
      { name: 'Sasha Cole', relationship: 'Spouse', notes: 'Prefers hybrid vehicles' },
      { name: 'Nova Cole', relationship: 'Child' },
    ],
    preferences: {
      contactMethods: ['Phone', 'SMS'],
      preferredTimes: ['Afternoon'],
      vehiclesOfInterest: ['2025 Apex Sport', '2025 Electra Touring'],
    },
    purchaseHistory: [
      { id: 'po-1245', product: '2021 Apex Sport', price: 54200, date: '2021-03-18' },
      { id: 'po-3378', product: '2023 Apex Sport', price: 59100, date: '2023-05-03' },
    ],
    serviceHistory: [
      {
        id: 'svc-991',
        service: 'Performance Tune',
        advisor: 'Nia Lawson',
        date: '2024-06-22',
        notes: 'Interested in track day invites',
      },
    ],
    tradeIns: [
      { vehicle: '2016 Apex Sport', appraisalValue: 19000, date: '2021-03-17' },
      { vehicle: '2021 Apex Sport', appraisalValue: 31200, date: '2023-05-01' },
    ],
    nextBestOffer: {
      title: 'Electra Touring Loyalty Upgrade',
      description: 'Equity position qualifies for $4,500 loyalty credit and expedited delivery.',
      reason: 'Equity + EV curiosity; strong CSI scores.',
    },
  },
];

const initialCommunications: CommunicationRecord[] = [
  {
    id: 'msg-1',
    threadId: 'thread-jordan-email',
    leadId: 'lead-1',
    channel: 'email',
    direction: 'inbound',
    subject: 'Re: Electra Launch Edition availability',
    preview: 'Thanks for the build sheet. Can we hold the graphite interior? Also curious about charging.',
    body:
      'Thanks for the build sheet. Can we hold the graphite interior? Also curious about charging incentives and installation partners. I would love to finalize this week if we can lock availability.',
    createdAt: formatISO(addHours(now, -3)),
    status: 'opened',
    unread: true,
    starred: true,
    requiresReply: true,
    aiRecommendations: [
      'Highlight the free charging promotion',
      'Offer install consultation with local partner',
    ],
  },
  {
    id: 'msg-2',
    threadId: 'thread-jordan-sms',
    leadId: 'lead-1',
    channel: 'sms',
    direction: 'outbound',
    preview: 'Delivery team has two afternoon slots tomorrow. Do either work?',
    body: 'Delivery team has two afternoon slots tomorrow at 1:30pm or 4:30pm. Do either work for your schedule?',
    createdAt: formatISO(addHours(now, -1)),
    status: 'delivered',
    unread: false,
    starred: false,
    requiresReply: false,
    followUpDue: formatISO(addHours(now, 3)),
  },
  {
    id: 'msg-3',
    threadId: 'thread-grant-sms',
    leadId: 'lead-2',
    channel: 'sms',
    direction: 'inbound',
    preview: 'Quick question about tomorrow: can we do video instead?',
    body: 'Quick question about tomorrow: can we do the Trailfinder overview via video instead of in-person? Weather looks rough.',
    createdAt: formatISO(addHours(now, -2)),
    status: 'opened',
    unread: true,
    starred: false,
    requiresReply: true,
  },
  {
    id: 'msg-4',
    threadId: 'thread-cole-call',
    leadId: 'lead-3',
    channel: 'call',
    direction: 'outbound',
    preview: '30 min performance upgrade consult',
    body: 'Discussed the new track package pricing and ordered carbon kit. Scheduled install for next Thursday.',
    createdAt: formatISO(addHours(now, -20)),
    status: 'answered',
    unread: false,
    starred: true,
    requiresReply: false,
    durationSeconds: 1860,
    transcriptSummary: 'Covered upgrade pricing, offered loyalty perk, scheduled service visit.',
    aiRecommendations: ['Send recap email with invoice', 'Set reminder for parts arrival'],
  },
];

const initialReminders: Reminder[] = [
  {
    id: 'rem-1',
    leadId: 'lead-1',
    title: 'Follow up on Electra accessories quote',
    dueAt: formatISO(addHours(now, 6)),
    channel: 'email',
    notifyMinutesBefore: 30,
    completed: false,
  },
  {
    id: 'rem-2',
    leadId: 'lead-2',
    title: 'Prep virtual demo materials',
    dueAt: formatISO(addHours(now, -1)),
    channel: 'appointment',
    notifyMinutesBefore: 60,
    completed: true,
  },
];

const initialAppointments: AppointmentRecord[] = [
  {
    id: 'apt-1',
    leadId: 'lead-2',
    title: 'Trailfinder virtual demo',
    type: 'Virtual Demo',
    status: 'Scheduled',
    start: formatISO(setMinutes(setHours(addDays(now, 1), 11), 30)),
    end: formatISO(setMinutes(setHours(addDays(now, 1), 12), 0)),
    location: 'Zoom',
    advisor: 'Kai Rivera',
    notes: 'Share accessories bundle and remote delivery steps.',
    aiSuggestions: ['Send meeting kit automatically', 'Offer all-weather mats discount'],
    conflicts: [],
  },
  {
    id: 'apt-2',
    leadId: 'lead-3',
    title: 'Performance package install',
    type: 'Service',
    status: 'Confirmed',
    start: formatISO(setMinutes(setHours(addDays(now, 2), 14), 0)),
    end: formatISO(setMinutes(setHours(addDays(now, 2), 16), 0)),
    location: 'Service Bay 3',
    advisor: 'Nia Lawson',
    notes: 'Parts arrive Tuesday afternoon.',
    aiSuggestions: ['Offer performance event invite', 'Capture before/after content'],
    conflicts: ['Service bay capacity at 80%'],
  },
];

const initialQuickReplies: QuickReply[] = [
  {
    id: 'qr-1',
    channel: 'sms',
    label: 'Confirm appointment',
    content: 'Looking forward to tomorrow! Reply YES to confirm or let me know if you need to adjust.',
  },
  {
    id: 'qr-2',
    channel: 'sms',
    label: 'Share brochure',
    content: 'Just sent the product guide to your inbox. Let me know which package you want to dive into first.',
  },
  {
    id: 'qr-3',
    channel: 'email',
    label: 'Post-demo recap',
    content:
      'Thanks for taking the time today! Attached is the build summary and financing options we discussed. Happy to answer any questions.',
  },
  {
    id: 'qr-4',
    channel: 'email',
    label: 'Delivery scheduling',
    content: 'Exciting news — your vehicle is ready. Use the link below to pick the delivery window that works best for you.',
  },
];

const initialTemplates: TemplateDefinition[] = [
  {
    id: 'tmpl-1',
    channel: 'email',
    name: 'EV Launch Follow-up',
    category: 'Campaigns',
    subject: 'Next steps for your {{vehicleName}} build',
    body:
      'Hi {{customerName}},\n\nGreat speaking with you about the {{vehicleName}}. Based on your preferences, I reserved the graphite interior package and included the at-home charger.\n\nLet me know if you would like to review financing prior to our appointment on {{appointmentDate}}.\n\nBest,\n{{advisorName}}',
    variables: ['{{customerName}}', '{{vehicleName}}', '{{appointmentDate}}', '{{advisorName}}'],
  },
  {
    id: 'tmpl-2',
    channel: 'email',
    name: 'Service Check-in',
    category: 'Service',
    subject: 'How is your {{vehicleName}} driving?',
    body:
      'Hi {{customerName}},\n\nIt has been a week since we completed the {{serviceType}} on your {{vehicleName}}. I wanted to make sure everything is performing the way you expect.\n\nIf you have any feedback or questions, I am here to help.\n\nThank you,\n{{advisorName}}',
    variables: ['{{customerName}}', '{{vehicleName}}', '{{serviceType}}', '{{advisorName}}'],
  },
  {
    id: 'tmpl-3',
    channel: 'sms',
    name: 'Appointment Reminder',
    category: 'Reminders',
    body: 'Reminder: {{appointmentDate}} at {{appointmentTime}} with {{advisorName}}. Reply YES to confirm or text us to adjust.',
    variables: ['{{appointmentDate}}', '{{appointmentTime}}', '{{advisorName}}'],
  },
  {
    id: 'tmpl-4',
    channel: 'sms',
    name: 'Delivery Ready',
    category: 'Delivery',
    body: 'Great news {{customerName}}! Your vehicle is staged and ready. Tap here to choose a delivery slot: {{deliveryLink}}',
    variables: ['{{customerName}}', '{{deliveryLink}}'],
  },
];

const initialMetrics: CommunicationMetrics = {
  totalCalls: 38,
  totalSms: 112,
  totalEmails: 87,
  meetingsScheduled: 14,
  conversionRate: 0.21,
  avgResponseMinutes: 23,
  teamPerformance: [
    { rep: 'Avery Chen', calls: 18, sms: 44, emails: 27, meetings: 6, satisfaction: 94 },
    { rep: 'Kai Rivera', calls: 9, sms: 36, emails: 22, meetings: 5, satisfaction: 91 },
    { rep: 'Sky Patel', calls: 11, sms: 32, emails: 38, meetings: 3, satisfaction: 89 },
  ],
  channelPerformance: [
    { channel: 'sms', engagementRate: 0.68, responseMinutes: 9, sentimentScore: 0.87 },
    { channel: 'email', engagementRate: 0.41, responseMinutes: 54, sentimentScore: 0.72 },
    { channel: 'call', engagementRate: 0.58, responseMinutes: 0, sentimentScore: 0.81 },
  ],
};

let realtimeTimer: ReturnType<typeof setInterval> | null = null;
let realtimeListeners = 0;

const calculateMetrics = (communications: CommunicationRecord[], appointments: AppointmentRecord[]): CommunicationMetrics => {
  const totals = communications.reduce(
    (acc, record) => {
      if (record.channel === 'sms') acc.totalSms += 1;
      if (record.channel === 'email') acc.totalEmails += 1;
      if (record.channel === 'call') acc.totalCalls += 1;
      acc.responseSamples.push({
        requiresReply: record.requiresReply,
        responded:
          record.direction === 'outbound' ||
          communications.some(
            (candidate) =>
              candidate.threadId === record.threadId &&
              candidate.direction === 'outbound' &&
              parseISO(candidate.createdAt) > parseISO(record.createdAt),
          ),
        createdAt: record.createdAt,
      });
      return acc;
    },
    { totalCalls: 0, totalSms: 0, totalEmails: 0, responseSamples: [] as Array<{ requiresReply: boolean; responded: boolean; createdAt: string }> },
  );

  const respondedSamples = totals.responseSamples.filter((sample) => sample.requiresReply && sample.responded);
  const avgResponseMinutes = respondedSamples.length
    ? respondedSamples.reduce((minutes, sample) => minutes + Math.max(5, Math.random() * 90), 0) / respondedSamples.length
    : initialMetrics.avgResponseMinutes;

  const meetingsScheduled = appointments.filter((appointment) => appointment.status === 'Scheduled' || appointment.status === 'Confirmed').length;

  return {
    ...initialMetrics,
    totalCalls: totals.totalCalls,
    totalSms: totals.totalSms,
    totalEmails: totals.totalEmails,
    meetingsScheduled,
    avgResponseMinutes: Math.round(avgResponseMinutes),
  };
};

export const useCommunicationsStore = create<CommunicationsState>((set, get) => ({
  leads: demoLeads,
  communications: initialCommunications,
  appointments: initialAppointments,
  reminders: initialReminders,
  quickReplies: initialQuickReplies,
  templates: initialTemplates,
  metrics: calculateMetrics(initialCommunications, initialAppointments),
  activeLeadId: 'lead-1',
  addCommunication: (record) => {
    set((state) => ({
      communications: [...state.communications, record],
    }));
    get().refreshMetrics();
  },
  markThreadRead: (threadId) => {
    set((state) => ({
      communications: state.communications.map((record) =>
        record.threadId === threadId
          ? {
              ...record,
              unread: false,
              requiresReply: record.direction === 'inbound' ? false : record.requiresReply,
            }
          : record,
      ),
    }));
  },
  toggleStar: (id) => {
    set((state) => ({
      communications: state.communications.map((record) =>
        record.id === id
          ? {
              ...record,
              starred: !record.starred,
            }
          : record,
      ),
    }));
  },
  setRequiresReply: (id, requiresReply) => {
    set((state) => ({
      communications: state.communications.map((record) =>
        record.id === id
          ? {
              ...record,
              requiresReply,
            }
          : record,
      ),
    }));
  },
  addReminder: (reminder) => {
    set((state) => ({ reminders: [...state.reminders, reminder] }));
  },
  completeReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              completed: true,
            }
          : reminder,
      ),
    }));
  },
  upsertAppointment: (appointment) => {
    set((state) => {
      const exists = state.appointments.some((item) => item.id === appointment.id);
      const appointments = exists
        ? state.appointments.map((item) => (item.id === appointment.id ? appointment : item))
        : [...state.appointments, appointment];
      return { appointments };
    });
    get().refreshMetrics();
  },
  completeAppointment: (id) => {
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              status: 'Completed',
            }
          : appointment,
      ),
    }));
    get().refreshMetrics();
  },
  setActiveLead: (leadId) => set({ activeLeadId: leadId }),
  refreshMetrics: () => {
    const { communications, appointments } = get();
    set({ metrics: calculateMetrics(communications, appointments) });
  },
  addQuickReply: (reply) => {
    set((state) => ({ quickReplies: [...state.quickReplies, reply] }));
  },
  addTemplate: (template) => {
    set((state) => ({ templates: [...state.templates, template] }));
  },
  activateRealtimeFeed: () => {
    if (realtimeTimer) {
      realtimeListeners += 1;
      return () => {
        realtimeListeners = Math.max(0, realtimeListeners - 1);
        if (realtimeListeners === 0 && realtimeTimer) {
          clearInterval(realtimeTimer);
          realtimeTimer = null;
        }
      };
    }

    realtimeListeners += 1;
    realtimeTimer = setInterval(() => {
      const state = get();
      const inboundCandidates = state.leads.filter((lead) => lead.optIns.sms || lead.optIns.email);
      if (!inboundCandidates.length) {
        return;
      }
      const lead = inboundCandidates[Math.floor(Math.random() * inboundCandidates.length)];
      const channels: CommunicationChannel[] = ['sms', 'email', 'call'];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const nowIso = formatISO(new Date());
      const record: CommunicationRecord = {
        id: `rt-${
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2)
        }`,
        threadId: `thread-${lead.id}-${channel}`,
        leadId: lead.id,
        channel,
        direction: 'inbound',
        subject:
          channel === 'email'
            ? `Follow-up ${Math.random() > 0.5 ? 'question' : 'update'}`
            : undefined,
        preview:
          channel === 'sms'
            ? 'Just checking timing on our appointment — still good?'
            : channel === 'email'
            ? 'Appreciate the proposal, can we review incentives?'
            : 'Requested a quick update on delivery ETA.',
        body:
          channel === 'sms'
            ? 'Just checking that our appointment is still good for tomorrow? Need to adjust timing by 30 minutes if possible.'
            : channel === 'email'
            ? 'Appreciate the proposal you sent across. Could we review available incentives and finalize the payment worksheet together tomorrow?'
            : 'Calling to get a quick update on our delivery ETA and accessory install timeline.',
        createdAt: nowIso,
        status: channel === 'call' ? 'answered' : 'opened',
        unread: true,
        starred: false,
        requiresReply: channel !== 'call',
        followUpDue: channel !== 'call' ? formatISO(addHours(new Date(), 2)) : undefined,
        aiRecommendations:
          channel === 'sms'
            ? ['Offer self-service reschedule link', 'Send confidence-building testimonial']
            : channel === 'email'
            ? ['Attach updated payment options', 'Loop in finance manager for incentive breakdown']
            : ['Transfer to delivery coordinator if logistics question persists'],
      };
      set({ communications: [...state.communications, record] });
    }, 45000);

    return () => {
      realtimeListeners = Math.max(0, realtimeListeners - 1);
      if (realtimeListeners === 0 && realtimeTimer) {
        clearInterval(realtimeTimer);
        realtimeTimer = null;
      }
    };
  },
}));

export const groupCommunicationsByThread = (
  communications: CommunicationRecord[],
  channel?: CommunicationChannel,
) => {
  const grouped = communications.reduce<Record<string, CommunicationRecord[]>>((acc, record) => {
    if (channel && record.channel !== channel) {
      return acc;
    }
    if (!acc[record.threadId]) {
      acc[record.threadId] = [];
    }
    acc[record.threadId].push(record);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([threadId, records]) =>
      records
        .slice()
        .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()),
    )
    .sort((a, b) => parseISO(b[0].createdAt).getTime() - parseISO(a[0].createdAt).getTime());
};

export const getThreadPreview = (thread: CommunicationRecord[]) => thread[0];

export const getLeadById = (leads: LeadProfile[], leadId: string) => leads.find((lead) => lead.id === leadId);

export const startOfCurrentWeek = (date: Date) => startOfDay(addDays(date, -date.getDay()));
