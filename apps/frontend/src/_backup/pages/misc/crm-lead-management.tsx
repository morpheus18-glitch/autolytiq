import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Flag,
  Globe,
  LucideIcon,
  Mail,
  Megaphone,
  MessageSquare,
  Phone,
  Users,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

interface LeadChannel {
  id: string;
  name: string;
  icon: LucideIcon;
  share: number;
  volume: number;
  conversionRate: number;
  costPerLead: number;
  responseTime: string;
  qualityScore: number;
  trend: number;
  automationCoverage: number;
}

interface PipelineLead {
  id: string;
  customer: string;
  vehicle: string;
  value: number;
  probability: number;
  priority: "critical" | "high" | "standard" | "monitor";
  nextAction: string;
  owner: string;
  ageHours: number;
  channel: string;
  sentiment: "positive" | "neutral" | "negative";
}

interface StageStats {
  total: number;
  conversion: number;
  velocityHours: number;
  pipelineValue: number;
}

interface PipelineStage {
  id: string;
  title: string;
  description: string;
  status: "healthy" | "attention" | "at-risk";
  stageStats: StageStats;
  leads: PipelineLead[];
}

interface CustomerTouchpoint {
  id: string;
  channel: "email" | "call" | "sms" | "in_person";
  summary: string;
  owner: string;
  timestamp: string;
  outcome: string;
  nextStep: string;
  duration?: string;
  stage: string;
  sentiment: "positive" | "neutral" | "negative";
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "prospect" | "active" | "loyal";
  creditScore: number;
  lifetimeValue: number;
  equityPosition: string;
  stage: string;
  lastContact: string;
  preferences: {
    communication: string;
    financing: string;
    purchaseTimeline: string;
    loyaltyTier: string;
  };
  vehiclesOfInterest: string[];
  activeDeals: {
    id: string;
    status: string;
    payment: number;
    apr: number;
    term: number;
  }[];
  purchases: {
    vin: string;
    model: string;
    date: string;
    price: number;
    equity: string;
  }[];
  campaigns: string[];
  touchpoints: CustomerTouchpoint[];
}

interface CampaignStep {
  id: string;
  name: string;
  type: string;
  waitTime?: string;
  outcome: "scheduled" | "in_progress" | "completed";
}

interface CampaignPlaybook {
  id: string;
  name: string;
  status: "Active" | "Paused";
  audience: string;
  objective: string;
  primaryChannel: string;
  owner: string;
  cadence: string;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  influencedPipeline: number;
  touchedLeads: number;
  meetingsBooked: number;
  dealsInfluenced: number;
  roi: number;
  nextSync: string;
  activeSince: string;
  automations: CampaignStep[];
}

const crmMetrics = [
  { id: "totalLeads", label: "Active Leads", value: 482, change: 12, isPositive: true },
  { id: "pipeline", label: "Pipeline Value", value: 3890000, change: 8, isPositive: true },
  { id: "conversion", label: "Lead Conversion", value: 21.4, change: 1.2, isPositive: true },
  { id: "velocity", label: "Response SLA", value: 11, suffix: "min", change: -2, isPositive: true },
  { id: "campaigns", label: "Active Journeys", value: 14, change: 3, isPositive: true },
  { id: "retention", label: "Retention Index", value: 92, suffix: "%", change: 4, isPositive: true }
] as const;

const leadChannels: LeadChannel[] = [
  {
    id: "website",
    name: "Dealer Website",
    icon: Globe,
    share: 38,
    volume: 182,
    conversionRate: 24,
    costPerLead: 31,
    responseTime: "4m 12s",
    qualityScore: 92,
    trend: 9,
    automationCoverage: 100
  },
  {
    id: "marketplace",
    name: "Third-Party Marketplaces",
    icon: Megaphone,
    share: 27,
    volume: 128,
    conversionRate: 18,
    costPerLead: 48,
    responseTime: "7m 45s",
    qualityScore: 84,
    trend: 5,
    automationCoverage: 76
  },
  {
    id: "crm-imports",
    name: "OEM & CRM Imports",
    icon: Users,
    share: 17,
    volume: 81,
    conversionRate: 29,
    costPerLead: 21,
    responseTime: "5m 03s",
    qualityScore: 88,
    trend: 11,
    automationCoverage: 64
  },
  {
    id: "service",
    name: "Service Drive",
    icon: Flag,
    share: 11,
    volume: 52,
    conversionRate: 16,
    costPerLead: 14,
    responseTime: "12m 18s",
    qualityScore: 73,
    trend: -2,
    automationCoverage: 38
  },
  {
    id: "events",
    name: "Events & Walk-ins",
    icon: BarChart3,
    share: 7,
    volume: 33,
    conversionRate: 13,
    costPerLead: 54,
    responseTime: "18m 40s",
    qualityScore: 69,
    trend: 3,
    automationCoverage: 22
  }
];

const pipelineBoard: PipelineStage[] = [
  {
    id: "stage-new",
    title: "New",
    description: "Fresh inbound leads awaiting qualification.",
    status: "healthy",
    stageStats: { total: 112, conversion: 18, velocityHours: 2.6, pipelineValue: 620000 },
    leads: [
      {
        id: "L-2487",
        customer: "Ava Carter",
        vehicle: "2024 Toyota RAV4 Hybrid",
        value: 38400,
        probability: 18,
        priority: "high",
        nextAction: "Intro call at 3:00 PM",
        owner: "Chris Young",
        ageHours: 0.8,
        channel: "Website",
        sentiment: "positive"
      },
      {
        id: "L-2493",
        customer: "Devon Patel",
        vehicle: "2023 BMW X3",
        value: 56200,
        probability: 16,
        priority: "standard",
        nextAction: "Send payment scenarios",
        owner: "Amelia Price",
        ageHours: 1.4,
        channel: "Cars.com",
        sentiment: "neutral"
      }
    ]
  },
  {
    id: "stage-qualified",
    title: "Qualified",
    description: "Sales-qualified leads with verified intent.",
    status: "healthy",
    stageStats: { total: 94, conversion: 31, velocityHours: 7.4, pipelineValue: 1120000 },
    leads: [
      {
        id: "L-2331",
        customer: "Lena Rodriguez",
        vehicle: "2024 Lexus RX 350",
        value: 68900,
        probability: 42,
        priority: "high",
        nextAction: "Book appraisal appointment",
        owner: "Sarah Johnson",
        ageHours: 8.2,
        channel: "Referral",
        sentiment: "positive"
      },
      {
        id: "L-2190",
        customer: "Marcus Lee",
        vehicle: "2024 Tesla Model Y",
        value: 54200,
        probability: 38,
        priority: "standard",
        nextAction: "Finance pre-approval follow-up",
        owner: "Jordan Miles",
        ageHours: 6.7,
        channel: "Website",
        sentiment: "positive"
      }
    ]
  },
  {
    id: "stage-proposal",
    title: "Proposal",
    description: "Deal structure shared with customer.",
    status: "attention",
    stageStats: { total: 57, conversion: 46, velocityHours: 11.2, pipelineValue: 1350000 },
    leads: [
      {
        id: "L-2054",
        customer: "Simone Harris",
        vehicle: "2024 Ford F-150 Platinum",
        value: 74200,
        probability: 58,
        priority: "critical",
        nextAction: "Manager approval required",
        owner: "Michael Chen",
        ageHours: 10.5,
        channel: "AutoTrader",
        sentiment: "positive"
      },
      {
        id: "L-1975",
        customer: "Yusuf Ali",
        vehicle: "2024 Mercedes GLC",
        value: 68400,
        probability: 52,
        priority: "high",
        nextAction: "Prepare F&I product menu",
        owner: "Claire Matthews",
        ageHours: 9.4,
        channel: "OEM Lead",
        sentiment: "neutral"
      }
    ]
  },
  {
    id: "stage-contract",
    title: "Contracting",
    description: "Deal accepted and in F&I processing.",
    status: "healthy",
    stageStats: { total: 29, conversion: 74, velocityHours: 6.2, pipelineValue: 800000 },
    leads: [
      {
        id: "L-1920",
        customer: "Noah Bennett",
        vehicle: "2024 Audi Q7",
        value: 76800,
        probability: 81,
        priority: "critical",
        nextAction: "Awaiting e-signature",
        owner: "Hannah Li",
        ageHours: 4.1,
        channel: "Website",
        sentiment: "positive"
      },
      {
        id: "L-1882",
        customer: "Priya Desai",
        vehicle: "2024 Volvo XC60",
        value: 62400,
        probability: 76,
        priority: "high",
        nextAction: "Schedule delivery",
        owner: "Alex Morgan",
        ageHours: 3.6,
        channel: "CRM Import",
        sentiment: "positive"
      }
    ]
  }
];

const customerProfiles: CustomerProfile[] = [
  {
    id: "CUST-1024",
    name: "Michael Chen",
    email: "michael.chen@westsideauto.com",
    phone: "(312) 555-0194",
    status: "active",
    creditScore: 742,
    lifetimeValue: 128400,
    equityPosition: "+$3,200",
    stage: "proposal",
    lastContact: "2024-02-11T15:24:00-05:00",
    preferences: {
      communication: "Email",
      financing: "36-month lease",
      purchaseTimeline: "< 30 days",
      loyaltyTier: "Platinum"
    },
    vehiclesOfInterest: ["2024 Lexus RX 350", "2023 BMW X5"],
    activeDeals: [
      { id: "DL-4839", status: "Structuring", payment: 739, apr: 3.1, term: 36 }
    ],
    purchases: [
      { vin: "1HGCM82633A123456", model: "2021 Acura RDX", date: "2021-08-14", price: 47980, equity: "+$6,200" }
    ],
    campaigns: ["Luxury Retention Program", "EV Incentive Awareness"],
    touchpoints: [
      {
        id: "TP-992",
        channel: "email",
        summary: "Sent personalized payment scenarios",
        owner: "Sarah Johnson",
        timestamp: "2024-02-11T15:24:00-05:00",
        outcome: "Opened 7 minutes after send",
        nextStep: "Schedule delivery planning session",
        duration: "-",
        stage: "proposal",
        sentiment: "positive"
      },
      {
        id: "TP-981",
        channel: "call",
        summary: "Negotiated lease structure and incentives",
        owner: "Sarah Johnson",
        timestamp: "2024-02-10T18:10:00-05:00",
        outcome: "Agreed on payment target",
        nextStep: "Manager approval",
        duration: "12m",
        stage: "proposal",
        sentiment: "positive"
      },
      {
        id: "TP-966",
        channel: "sms",
        summary: "Confirmed Saturday appointment",
        owner: "AutolytiQ Concierge",
        timestamp: "2024-02-09T09:30:00-05:00",
        outcome: "Customer confirmed",
        nextStep: "Prepare vehicle",
        duration: "-",
        stage: "qualified",
        sentiment: "positive"
      }
    ]
  },
  {
    id: "CUST-1093",
    name: "Lena Rodriguez",
    email: "lena.rodriguez@email.com",
    phone: "(480) 555-4102",
    status: "prospect",
    creditScore: 688,
    lifetimeValue: 84500,
    equityPosition: "+$1,900",
    stage: "qualified",
    lastContact: "2024-02-11T12:02:00-07:00",
    preferences: {
      communication: "SMS",
      financing: "60-month finance",
      purchaseTimeline: "30-60 days",
      loyaltyTier: "Gold"
    },
    vehiclesOfInterest: ["2024 Lexus RX 350", "2023 Acura MDX"],
    activeDeals: [
      { id: "DL-4712", status: "Qualified", payment: 689, apr: 4.2, term: 60 }
    ],
    purchases: [
      { vin: "1GNSKHKC4MR123987", model: "2020 Chevy Tahoe", date: "2020-11-02", price: 55900, equity: "+$2,700" }
    ],
    campaigns: ["Luxury SUV Accelerator"],
    touchpoints: [
      {
        id: "TP-1042",
        channel: "call",
        summary: "Discussed trade appraisal results",
        owner: "Jordan Miles",
        timestamp: "2024-02-11T12:02:00-07:00",
        outcome: "Customer requested higher offer",
        nextStep: "Manager review",
        duration: "9m",
        stage: "qualified",
        sentiment: "neutral"
      },
      {
        id: "TP-1037",
        channel: "email",
        summary: "Sent curated luxury SUV inventory",
        owner: "Jordan Miles",
        timestamp: "2024-02-10T08:15:00-07:00",
        outcome: "Clicked 4 vehicles",
        nextStep: "Set showroom appointment",
        duration: "-",
        stage: "qualified",
        sentiment: "positive"
      }
    ]
  },
  {
    id: "CUST-1178",
    name: "Noah Bennett",
    email: "noah.bennett@email.com",
    phone: "(206) 555-2211",
    status: "loyal",
    creditScore: 801,
    lifetimeValue: 168300,
    equityPosition: "+$9,400",
    stage: "contract",
    lastContact: "2024-02-12T09:45:00-08:00",
    preferences: {
      communication: "Email",
      financing: "48-month finance",
      purchaseTimeline: "Immediate",
      loyaltyTier: "Platinum"
    },
    vehiclesOfInterest: ["2024 Audi Q7", "2024 Audi Q8"],
    activeDeals: [
      { id: "DL-4598", status: "Contracting", payment: 898, apr: 2.9, term: 48 }
    ],
    purchases: [
      { vin: "WA1AVBGE2MB123654", model: "2021 Audi Q5", date: "2021-03-22", price: 55220, equity: "+$4,100" },
      { vin: "WA1ECCFS7HR123321", model: "2017 Audi Q3", date: "2017-05-11", price: 38950, equity: "+$3,400" }
    ],
    campaigns: ["Audi Loyalty Upgrade"],
    touchpoints: [
      {
        id: "TP-1101",
        channel: "email",
        summary: "E-contract package delivered",
        owner: "Hannah Li",
        timestamp: "2024-02-12T09:45:00-08:00",
        outcome: "Awaiting signature",
        nextStep: "Schedule delivery",
        duration: "-",
        stage: "contract",
        sentiment: "positive"
      },
      {
        id: "TP-1098",
        channel: "call",
        summary: "Finalized protection products",
        owner: "Hannah Li",
        timestamp: "2024-02-11T17:40:00-08:00",
        outcome: "Accepted maintenance plan",
        nextStep: "Send contract",
        duration: "15m",
        stage: "contract",
        sentiment: "positive"
      }
    ]
  }
];

const campaignPlaybooks: CampaignPlaybook[] = [
  {
    id: "CMP-401",
    name: "EV Concierge Automation",
    status: "Active",
    audience: "EV In-market (Score ≥ 80)",
    objective: "Move high-scoring EV shoppers to appointments",
    primaryChannel: "Email + SMS",
    owner: "Marketing Ops",
    cadence: "Trigger-based · 6 touch journey",
    openRate: 64,
    clickRate: 41,
    conversionRate: 18,
    influencedPipeline: 820000,
    touchedLeads: 482,
    meetingsBooked: 126,
    dealsInfluenced: 32,
    roi: 6.4,
    nextSync: "58 minutes",
    activeSince: "2024-01-10",
    automations: [
      { id: "step-1", name: "Lead ingestion & grading", type: "Ingestion", outcome: "completed" },
      { id: "step-2", name: "EV welcome kit email", type: "Email", outcome: "completed" },
      { id: "step-3", name: "Concierge SMS follow-up", type: "SMS", waitTime: "+4 hours", outcome: "completed" },
      { id: "step-4", name: "Appointment routing", type: "Workflow", outcome: "in_progress" },
      { id: "step-5", name: "Manager escalation", type: "Task", waitTime: "+24 hours", outcome: "scheduled" },
      { id: "step-6", name: "Post-visit nurture", type: "Email", waitTime: "+2 days", outcome: "scheduled" }
    ]
  },
  {
    id: "CMP-318",
    name: "Equity Mining Pulse",
    status: "Active",
    audience: "Owners with ≥ $2.5K equity",
    objective: "Trigger upgrade conversations",
    primaryChannel: "Email",
    owner: "BDC Team",
    cadence: "Weekly touch · 4 steps",
    openRate: 58,
    clickRate: 36,
    conversionRate: 14,
    influencedPipeline: 460000,
    touchedLeads: 362,
    meetingsBooked: 97,
    dealsInfluenced: 21,
    roi: 4.2,
    nextSync: "2 hours",
    activeSince: "2023-12-04",
    automations: [
      { id: "step-1", name: "Equity signal ingestion", type: "Ingestion", outcome: "completed" },
      { id: "step-2", name: "Equity offer email", type: "Email", outcome: "completed" },
      { id: "step-3", name: "BDC call task", type: "Task", waitTime: "+1 day", outcome: "in_progress" },
      { id: "step-4", name: "Appointment confirmation", type: "SMS", waitTime: "+3 days", outcome: "scheduled" }
    ]
  }
];

const touchpointChannelIcon: Record<CustomerTouchpoint["channel"], LucideIcon> = {
  email: Mail,
  call: Phone,
  sms: MessageSquare,
  in_person: Users
};

const priorityStyles: Record<PipelineLead["priority"], string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  standard: "bg-blue-100 text-blue-700 border-blue-200",
  monitor: "bg-gray-100 text-gray-700 border-gray-200"
};

const stageStatusStyles: Record<PipelineStage["status"], { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  attention: { label: "Needs Attention", className: "bg-amber-100 text-amber-700 border-amber-200" },
  "at-risk": { label: "At Risk", className: "bg-red-100 text-red-700 border-red-200" }
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100000 ? 0 : 2
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatHours(value: number) {
  if (value < 1) {
    return `${Math.round(value * 60)}m`;
  }
  return `${value.toFixed(1)}h`;
}

export default function CRMLeadManagement() {
  const [activeTab, setActiveTab] = useState("acquisition");
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerProfiles[0]?.id ?? "");
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaignPlaybooks[0]?.id ?? "");

  const selectedCustomer = useMemo(
    () => customerProfiles.find((profile) => profile.id === selectedCustomerId),
    [selectedCustomerId]
  );

  const selectedCampaign = useMemo(
    () => campaignPlaybooks.find((campaign) => campaign.id === selectedCampaignId),
    [selectedCampaignId]
  );

  const totalPipelineValue = useMemo(
    () => pipelineBoard.reduce((total, stage) => total + stage.stageStats.pipelineValue, 0),
    []
  );

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <Badge className="w-fit bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
            Unified CRM Control Center
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            CRM & Lead Management Fabric
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Operate multi-channel lead acquisition, opportunity pipeline orchestration, and automated campaigns inside a
            unified customer record. Real-time intelligence keeps response times tight while preserving a complete Customer
            360° footprint.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Link href="/market-leads" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Megaphone className="mr-2 h-4 w-4" /> Marketplaces
            </Button>
          </Link>
          <Link href="/leads" className="w-full sm:w-auto">
            <Button className="btn-embossed w-full sm:w-auto">
              <Zap className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {crmMetrics.map((metric) => {
          const isCurrency = metric.id === "pipeline";
          const displayValue = isCurrency
            ? formatCurrency(metric.value)
            : `${metric.value}${"suffix" in metric ? metric.suffix : metric.id === "conversion" ? "%" : ""}`;
          const ChangeIcon = metric.change >= 0 ? ArrowUpRight : ArrowDownRight;
          const changeColor = metric.change >= 0 ? "text-emerald-600" : "text-red-600";

          return (
            <Card key={metric.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                      {metric.label}
                    </p>
                    <p className="text-lg font-semibold md:text-xl">{displayValue}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${changeColor}`}>
                    <ChangeIcon className="h-3.5 w-3.5" />
                    {Math.abs(metric.change)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1">
          <TabsTrigger value="acquisition">Lead Acquisition</TabsTrigger>
          <TabsTrigger value="pipeline">Opportunity Pipeline</TabsTrigger>
          <TabsTrigger value="customer">Customer 360°</TabsTrigger>
          <TabsTrigger value="touchpoints">Touchpoint History</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="acquisition" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>Lead Acquisition Engine</CardTitle>
                  <CardDescription>Multi-channel attribution with automated routing and SLA enforcement.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  100% coverage
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">Share</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                      <TableHead className="text-right">CPL</TableHead>
                      <TableHead className="text-right">SLA</TableHead>
                      <TableHead className="text-right">Automation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadChannels.map((channel) => {
                      const TrendIcon = channel.trend >= 0 ? ArrowUpRight : ArrowDownRight;
                      const trendColor = channel.trend >= 0 ? "text-emerald-600" : "text-red-600";
                      const ChannelIcon = channel.icon;

                      return (
                        <TableRow key={channel.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ChannelIcon className="h-4 w-4" />
                              </span>
                              <div>
                                <p className="font-medium text-sm">{channel.name}</p>
                                <p className="text-xs text-muted-foreground">Quality score {channel.qualityScore}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{channel.volume}</TableCell>
                          <TableCell className="text-right text-sm">{channel.share}%</TableCell>
                          <TableCell className="text-right text-sm">{channel.conversionRate}%</TableCell>
                          <TableCell className="text-right text-sm">${channel.costPerLead}</TableCell>
                          <TableCell className="text-right text-sm">{channel.responseTime}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                              <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
                              {channel.automationCoverage}%
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Live Ingestion Feed</CardTitle>
                <CardDescription>Omnichannel capture with attribution tags.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: "event-1",
                    timestamp: "09:42 AM",
                    summary: "Lead captured from website payment calculator",
                    detail: "Riley Summers • 2024 Kia EV6 • score 86",
                    owner: "Internet Team",
                    status: "Assigned to Sarah Johnson"
                  },
                  {
                    id: "event-2",
                    timestamp: "09:18 AM",
                    summary: "Marketplace lead - AutoTrader",
                    detail: "Marcus Lee • 2024 Tesla Model Y • hot",
                    owner: "BDC",
                    status: "Qualified SLA met"
                  },
                  {
                    id: "event-3",
                    timestamp: "08:55 AM",
                    summary: "Equity mining trigger",
                    detail: "Ava Carter • $4.8K equity • scheduled for outreach",
                    owner: "Automation",
                    status: "Campaign CMP-318 step 3"
                  }
                ].map((event) => (
                  <div key={event.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{event.timestamp}</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        Routed
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{event.summary}</p>
                    <p className="text-xs text-muted-foreground">{event.detail}</p>
                    <div className="mt-2 text-xs text-muted-foreground">{event.status}</div>
                    <div className="mt-1 text-xs font-medium text-blue-600">{event.owner}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {pipelineBoard.map((stage) => {
              const stagePercent = totalPipelineValue
                ? Math.round((stage.stageStats.pipelineValue / totalPipelineValue) * 100)
                : 0;
              const stageStatus = stageStatusStyles[stage.status];

              return (
                <Card key={stage.id} className="flex flex-col">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{stage.title}</CardTitle>
                      <Badge variant="secondary" className={stageStatus.className}>
                        {stageStatus.label}
                      </Badge>
                    </div>
                    <CardDescription>{stage.description}</CardDescription>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-medium text-foreground">{stage.stageStats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversion</span>
                        <span className="font-medium text-foreground">{stage.stageStats.conversion}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Velocity</span>
                        <span className="font-medium text-foreground">{formatHours(stage.stageStats.velocityHours)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pipeline</span>
                        <span className="font-medium text-foreground">{formatCurrency(stage.stageStats.pipelineValue)}</span>
                      </div>
                      <Progress value={stagePercent} className="h-2" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    {stage.leads.map((lead) => (
                      <div key={lead.id} className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{lead.customer}</p>
                            <p className="text-xs text-muted-foreground">{lead.vehicle}</p>
                          </div>
                          <Badge className={`text-[11px] border ${priorityStyles[lead.priority]}`}>
                            {lead.priority === "critical" ? "Critical" : lead.priority === "high" ? "High" : lead.priority === "standard" ? "Standard" : "Monitor"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="block text-muted-foreground/80">Next</span>
                            <span className="font-medium text-foreground">{lead.nextAction}</span>
                          </div>
                          <div>
                            <span className="block text-muted-foreground/80">Owner</span>
                            <span className="font-medium text-foreground">{lead.owner}</span>
                          </div>
                          <div>
                            <span className="block text-muted-foreground/80">Probability</span>
                            <span className="font-medium text-foreground">{lead.probability}%</span>
                          </div>
                          <div>
                            <span className="block text-muted-foreground/80">Age</span>
                            <span className="font-medium text-foreground">{formatHours(lead.ageHours)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{lead.channel}</span>
                          <span className="font-semibold text-foreground">{formatCurrency(lead.value)}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Customer 360°</CardTitle>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                    Unified Model
                  </Badge>
                </div>
                <CardDescription>Segment customers and drill into unified profile records.</CardDescription>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name} · {profile.stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-3">
                {customerProfiles.map((profile) => {
                  const isSelected = profile.id === selectedCustomerId;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => setSelectedCustomerId(profile.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        isSelected ? "border-blue-300 bg-blue-50 dark:bg-blue-950" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground">{profile.name}</p>
                        <Badge variant="outline" className="text-[11px]">
                          {profile.stage}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {profile.email}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        LTV {formatCurrency(profile.lifetimeValue)} · Equity {profile.equityPosition}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {selectedCustomer && (
              <Card className="lg:col-span-2">
                <CardHeader className="space-y-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>{selectedCustomer.name}</CardTitle>
                      <CardDescription>
                        {selectedCustomer.email} · {selectedCustomer.phone}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        Credit {selectedCustomer.creditScore}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">{selectedCustomer.status}</Badge>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        {selectedCustomer.preferences.loyaltyTier} tier
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                        Preferences
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Communication: {selectedCustomer.preferences.communication}</p>
                        <p>Financing: {selectedCustomer.preferences.financing}</p>
                        <p>Purchase timeline: {selectedCustomer.preferences.purchaseTimeline}</p>
                        <p>Equity position: {selectedCustomer.equityPosition}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                        Vehicles of Interest
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedCustomer.vehiclesOfInterest.map((vehicle) => (
                          <Badge key={vehicle} variant="outline" className="text-[11px]">
                            {vehicle}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Last contact {formatDateTime(selectedCustomer.lastContact)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                          Active Deal Structures
                        </p>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                          {selectedCustomer.activeDeals.length}
                        </Badge>
                      </div>
                      {selectedCustomer.activeDeals.map((deal) => (
                        <div key={deal.id} className="rounded-md border p-2 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{deal.id}</span>
                            <Badge variant="outline" className="text-[11px]">
                              {deal.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <span>Payment: {formatCurrency(deal.payment)}</span>
                            <span>APR: {deal.apr}%</span>
                            <span>Term: {deal.term} months</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                          Purchase History
                        </p>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {selectedCustomer.purchases.length}
                        </Badge>
                      </div>
                      {selectedCustomer.purchases.map((purchase) => (
                        <div key={purchase.vin} className="rounded-md border p-2 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{purchase.model}</span>
                            <span className="text-muted-foreground">{purchase.date}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{formatCurrency(purchase.price)}</span>
                            <span className="text-emerald-600 font-medium">{purchase.equity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                      Campaign Journey Enrollment
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCustomer.campaigns.map((campaign) => (
                        <Badge key={campaign} variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                          {campaign}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="touchpoints" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Omnichannel Interaction Ledger</CardTitle>
                <CardDescription>Chronological customer engagements with sentiment tracking.</CardDescription>
              </div>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customerProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer?.touchpoints.map((touchpoint) => {
                const ChannelIcon = touchpointChannelIcon[touchpoint.channel];
                const sentimentColor =
                  touchpoint.sentiment === "positive"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : touchpoint.sentiment === "negative"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-blue-100 text-blue-700 border-blue-200";

                return (
                  <div key={touchpoint.id} className="rounded-lg border p-3 md:p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ChannelIcon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{touchpoint.summary}</p>
                          <p className="text-xs text-muted-foreground">
                            {touchpoint.owner} · {touchpoint.stage}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge className={sentimentColor} variant="secondary">
                          {touchpoint.sentiment}
                        </Badge>
                        {touchpoint.duration && (
                          <Badge variant="outline" className="text-[11px]">
                            Duration {touchpoint.duration}
                          </Badge>
                        )}
                        <span className="text-muted-foreground">{formatDateTime(touchpoint.timestamp)}</span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block text-muted-foreground/80">Outcome</span>
                        <span className="text-foreground">{touchpoint.outcome}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground/80">Next step</span>
                        <span className="text-foreground">{touchpoint.nextStep}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <CardTitle>Automated Campaign Orchestration</CardTitle>
                  <CardDescription>AI-driven journeys powering nurture, equity, and retention workflows.</CardDescription>
                </div>
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignPlaybooks.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCampaign && (
                  <>
                    <div className="rounded-lg border p-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{selectedCampaign.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedCampaign.objective}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            {selectedCampaign.status}
                          </Badge>
                          <Badge variant="outline" className="text-[11px]">
                            {selectedCampaign.cadence}
                          </Badge>
                          <Badge variant="outline" className="text-[11px]">
                            Since {selectedCampaign.activeSince}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md bg-blue-50 p-2 dark:bg-blue-950/40">
                          <p className="text-muted-foreground/80">Open rate</p>
                          <p className="text-sm font-semibold">{selectedCampaign.openRate}%</p>
                        </div>
                        <div className="rounded-md bg-blue-50 p-2 dark:bg-blue-950/40">
                          <p className="text-muted-foreground/80">Click rate</p>
                          <p className="text-sm font-semibold">{selectedCampaign.clickRate}%</p>
                        </div>
                        <div className="rounded-md bg-emerald-50 p-2 dark:bg-emerald-950/40">
                          <p className="text-muted-foreground/80">Conversion</p>
                          <p className="text-sm font-semibold">{selectedCampaign.conversionRate}%</p>
                        </div>
                        <div className="rounded-md bg-emerald-50 p-2 dark:bg-emerald-950/40">
                          <p className="text-muted-foreground/80">Influenced pipeline</p>
                          <p className="text-sm font-semibold">{formatCurrency(selectedCampaign.influencedPipeline)}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span>Audience: {selectedCampaign.audience}</span>
                        <span>Primary channel: {selectedCampaign.primaryChannel}</span>
                        <span>Owner: {selectedCampaign.owner}</span>
                        <span>Next sync: {selectedCampaign.nextSync}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                        Automation steps
                      </p>
                      <div className="space-y-2">
                        {selectedCampaign.automations.map((step, index) => (
                          <div key={step.id} className="rounded-md border p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[11px]">
                                  Step {index + 1}
                                </Badge>
                                <span className="font-semibold text-foreground">{step.name}</span>
                              </div>
                              <Badge
                                variant="secondary"
                                className={
                                  step.outcome === "completed"
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : step.outcome === "in_progress"
                                      ? "bg-blue-100 text-blue-700 border-blue-200"
                                      : "bg-amber-100 text-amber-700 border-amber-200"
                                }
                              >
                                {step.outcome.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="mt-1 text-muted-foreground">
                              <span className="text-xs">Type: {step.type}</span>
                              {step.waitTime && <span className="ml-2 text-xs">Wait: {step.waitTime}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Portfolio Performance</CardTitle>
                <CardDescription>Rollup metrics across orchestration programs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                      <TableHead className="text-right">Click</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                      <TableHead className="text-right">Pipeline</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignPlaybooks.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-foreground">{campaign.name}</span>
                            <span className="text-xs text-muted-foreground">{campaign.audience}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">{campaign.openRate}%</TableCell>
                        <TableCell className="text-right text-sm">{campaign.clickRate}%</TableCell>
                        <TableCell className="text-right text-sm">{campaign.conversionRate}%</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(campaign.influencedPipeline)}</TableCell>
                        <TableCell className="text-right text-sm">{campaign.roi}x</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground/80">Total leads nurtured</p>
                    <p className="text-base font-semibold text-foreground">
                      {campaignPlaybooks.reduce((total, campaign) => total + campaign.touchedLeads, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground/80">Meetings booked</p>
                    <p className="text-base font-semibold text-foreground">
                      {campaignPlaybooks.reduce((total, campaign) => total + campaign.meetingsBooked, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground/80">Deals influenced</p>
                    <p className="text-base font-semibold text-foreground">
                      {campaignPlaybooks.reduce((total, campaign) => total + campaign.dealsInfluenced, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground/80">Average conversion lift</p>
                    <p className="text-base font-semibold text-foreground">+18%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

