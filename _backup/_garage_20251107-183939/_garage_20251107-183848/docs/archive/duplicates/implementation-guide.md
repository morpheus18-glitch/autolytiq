# IMPLEMENTATION GUIDE
## Building the Enterprise Application

This guide provides implementation patterns for building out the comprehensive menu system with the Prisma schema.

---

## 📋 PROJECT STRUCTURE

```
src/
├── app/
│   ├── api/
│   │   ├── clients/
│   │   │   ├── route.ts                 # GET, POST /api/clients
│   │   │   ├── [id]/route.ts           # GET, PATCH, DELETE /api/clients/:id
│   │   │   ├── [id]/interactions/route.ts
│   │   │   ├── [id]/opportunities/route.ts
│   │   │   ├── [id]/documents/route.ts
│   │   │   ├── assignments/route.ts
│   │   │   └── segments/route.ts
│   │   ├── outreach/
│   │   │   ├── campaigns/
│   │   │   ├── messages/
│   │   │   ├── templates/
│   │   │   └── segments/
│   │   ├── automation/
│   │   │   ├── workflows/
│   │   │   ├── executions/
│   │   │   └── rules/
│   │   ├── sales/
│   │   │   ├── opportunities/
│   │   │   ├── products/
│   │   │   └── pipeline/
│   │   ├── financial/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   └── contracts/
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   ├── tasks/
│   │   │   ├── time-entries/
│   │   │   └── milestones/
│   │   ├── analytics/
│   │   │   ├── reports/
│   │   │   ├── dashboards/
│   │   │   └── export/
│   │   ├── documents/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── integrations/
│   │   │   ├── route.ts
│   │   │   └── sync/
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   └── settings/
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── logout/route.ts
│   │       └── session/route.ts
│   ├── (dashboard)/
│   │   ├── clients/
│   │   ├── outreach/
│   │   ├── sales/
│   │   ├── projects/
│   │   └── analytics/
│   └── layout.tsx
├── components/
│   ├── ui/                              # Shadcn components
│   ├── layouts/
│   │   ├── Navigation.tsx
│   │   ├── Sidebar.tsx
│   │   └── Breadcrumbs.tsx
│   ├── clients/
│   ├── outreach/
│   ├── analytics/
│   └── shared/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── permissions.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── useClients.ts
└── types/
    ├── client.ts
    ├── campaign.ts
    └── index.ts
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Auth Middleware
```typescript
// lib/auth.ts
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export async function authenticateRequest(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          role: {
            include: { permissions: true }
          },
          organization: true
        }
      }
    }
  });

  if (!session || session.expiresAt < new Date()) {
    return { error: 'Session expired', status: 401 };
  }

  return { user: session.user };
}

export async function checkPermission(
  userId: string, 
  module: string, 
  action: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: { permissions: true }
      }
    }
  });

  if (!user) return false;

  return user.role.permissions.some(
    p => p.module === module && p.action === action
  );
}
```

---

## 👥 CLIENT MANAGEMENT APIS

### List Clients
```typescript
// app/api/clients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, checkPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const hasPermission = await checkPermission(auth.user.id, 'clients', 'view');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const where: any = {
    organizationId: auth.user.organizationId
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        assignments: {
          include: { user: true }
        },
        _count: {
          select: {
            interactions: true,
            opportunities: true,
            projects: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.client.count({ where })
  ]);

  return NextResponse.json({
    data: clients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const hasPermission = await checkPermission(auth.user.id, 'clients', 'create');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  // Duplicate detection
  const existing = await prisma.client.findFirst({
    where: {
      organizationId: auth.user.organizationId,
      email: body.email
    }
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Client with this email already exists', duplicate: existing },
      { status: 409 }
    );
  }

  const client = await prisma.client.create({
    data: {
      ...body,
      organizationId: auth.user.organizationId,
      createdById: auth.user.id
    },
    include: {
      assignments: true,
      createdBy: true
    }
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: 'create',
      entityType: 'client',
      entityId: client.id,
      changes: { new: client }
    }
  });

  // Create initial activity
  await prisma.activity.create({
    data: {
      organizationId: auth.user.organizationId,
      type: 'client_created',
      entityType: 'client',
      entityId: client.id,
      clientId: client.id,
      description: `Client ${client.firstName} ${client.lastName} was created`,
      performedBy: auth.user.id
    }
  });

  return NextResponse.json(client, { status: 201 });
}
```

### Client Details
```typescript
// app/api/clients/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      organizationId: auth.user.organizationId
    },
    include: {
      assignments: {
        include: { user: true }
      },
      interactions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      opportunities: {
        orderBy: { createdAt: 'desc' }
      },
      projects: {
        orderBy: { createdAt: 'desc' }
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      activities: {
        orderBy: { occurredAt: 'desc' },
        take: 20
      },
      customFieldValues: {
        include: { customField: true }
      },
      satisfactionScores: {
        orderBy: { recordedAt: 'desc' }
      }
    }
  });

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const hasPermission = await checkPermission(auth.user.id, 'clients', 'edit');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  const existing = await prisma.client.findFirst({
    where: {
      id: params.id,
      organizationId: auth.user.organizationId
    }
  });

  if (!existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const updated = await prisma.client.update({
    where: { id: params.id },
    data: body,
    include: {
      assignments: true
    }
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: 'update',
      entityType: 'client',
      entityId: updated.id,
      changes: {
        old: existing,
        new: updated
      }
    }
  });

  return NextResponse.json(updated);
}
```

---

## 📣 CAMPAIGN MANAGEMENT

### Create Campaign
```typescript
// app/api/outreach/campaigns/route.ts
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  const campaign = await prisma.campaign.create({
    data: {
      ...body,
      organizationId: auth.user.organizationId
    }
  });

  // If sequences are provided, create them
  if (body.sequences && Array.isArray(body.sequences)) {
    await prisma.campaignSequence.createMany({
      data: body.sequences.map((seq: any, index: number) => ({
        ...seq,
        campaignId: campaign.id,
        stepNumber: index + 1
      }))
    });
  }

  return NextResponse.json(campaign, { status: 201 });
}
```

### Send Campaign Messages
```typescript
// app/api/outreach/campaigns/[id]/send/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      organizationId: auth.user.organizationId
    },
    include: {
      targetSegment: {
        include: {
          members: {
            include: { client: true }
          }
        }
      },
      sequences: {
        include: { template: true },
        orderBy: { stepNumber: 'asc' }
      }
    }
  });

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Get recipients
  const recipients = campaign.targetSegment?.members.map(m => m.client) || [];

  // Queue messages for first sequence step
  const firstStep = campaign.sequences[0];
  if (!firstStep) {
    return NextResponse.json({ error: 'No sequences configured' }, { status: 400 });
  }

  const messages = await Promise.all(
    recipients.map(async (recipient) => {
      // Personalize content
      const content = personalizeContent(
        firstStep.content || firstStep.template?.content || '',
        recipient
      );

      return prisma.message.create({
        data: {
          campaignId: campaign.id,
          senderId: auth.user.id,
          recipientEmail: recipient.email,
          recipientPhone: recipient.phone,
          recipientName: `${recipient.firstName} ${recipient.lastName}`,
          type: 'email',
          subject: firstStep.subject || firstStep.template?.subject,
          content,
          status: 'queued'
        }
      });
    })
  );

  // Update campaign status
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      status: 'active',
      startDate: new Date()
    }
  });

  return NextResponse.json({
    message: 'Campaign started',
    messagesQueued: messages.length
  });
}

function personalizeContent(template: string, client: any): string {
  return template
    .replace(/{{firstName}}/g, client.firstName)
    .replace(/{{lastName}}/g, client.lastName)
    .replace(/{{companyName}}/g, client.companyName || '')
    .replace(/{{email}}/g, client.email);
}
```

---

## 📊 ANALYTICS & REPORTING

### Report Generation
```typescript
// app/api/analytics/reports/generate/route.ts
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { reportType, dateRange, filters, metrics } = body;

  let data;

  switch (reportType) {
    case 'sales_pipeline':
      data = await generateSalesPipelineReport(
        auth.user.organizationId,
        dateRange,
        filters
      );
      break;

    case 'campaign_performance':
      data = await generateCampaignReport(
        auth.user.organizationId,
        dateRange,
        filters
      );
      break;

    case 'client_engagement':
      data = await generateEngagementReport(
        auth.user.organizationId,
        dateRange,
        filters
      );
      break;

    default:
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      );
  }

  return NextResponse.json({ data });
}

async function generateSalesPipelineReport(
  organizationId: string,
  dateRange: any,
  filters: any
) {
  const opportunities = await prisma.opportunity.findMany({
    where: {
      client: { organizationId },
      createdAt: {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end)
      },
      ...filters
    },
    include: {
      client: true,
      products: {
        include: { product: true }
      }
    }
  });

  // Group by stage
  const byStage = opportunities.reduce((acc: any, opp) => {
    if (!acc[opp.stage]) {
      acc[opp.stage] = {
        count: 0,
        totalValue: 0,
        opportunities: []
      };
    }
    acc[opp.stage].count++;
    acc[opp.stage].totalValue += Number(opp.amount);
    acc[opp.stage].opportunities.push(opp);
    return acc;
  }, {});

  // Calculate win rate
  const closedWon = opportunities.filter(o => o.stage === 'closed_won').length;
  const closedLost = opportunities.filter(o => o.stage === 'closed_lost').length;
  const winRate = (closedWon / (closedWon + closedLost)) * 100;

  return {
    summary: {
      totalOpportunities: opportunities.length,
      totalValue: opportunities.reduce((sum, o) => sum + Number(o.amount), 0),
      winRate: winRate || 0,
      averageDealSize: opportunities.length > 0 
        ? opportunities.reduce((sum, o) => sum + Number(o.amount), 0) / opportunities.length 
        : 0
    },
    byStage,
    opportunities
  };
}

async function generateCampaignReport(
  organizationId: string,
  dateRange: any,
  filters: any
) {
  const campaigns = await prisma.campaign.findMany({
    where: {
      organizationId,
      startDate: {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end)
      },
      ...filters
    },
    include: {
      messages: true,
      analytics: {
        where: {
          date: {
            gte: new Date(dateRange.start),
            lte: new Date(dateRange.end)
          }
        }
      }
    }
  });

  return campaigns.map(campaign => {
    const analytics = campaign.analytics.reduce((acc: any, day) => {
      acc.sent += day.sent;
      acc.delivered += day.delivered;
      acc.opened += day.opened;
      acc.clicked += day.clicked;
      acc.converted += day.converted;
      return acc;
    }, {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0
    });

    return {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      analytics,
      rates: {
        deliveryRate: (analytics.delivered / analytics.sent) * 100 || 0,
        openRate: (analytics.opened / analytics.delivered) * 100 || 0,
        clickRate: (analytics.clicked / analytics.opened) * 100 || 0,
        conversionRate: (analytics.converted / analytics.sent) * 100 || 0
      }
    };
  });
}
```

---

## 🤖 WORKFLOW AUTOMATION

### Workflow Execution
```typescript
// lib/workflow-engine.ts
export class WorkflowEngine {
  async executeWorkflow(workflowId: string, clientId: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    });

    if (!workflow || !workflow.isActive) {
      throw new Error('Workflow not found or inactive');
    }

    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        clientId,
        status: 'running'
      }
    });

    // Execute steps sequentially
    for (const step of workflow.steps) {
      await this.executeStep(execution.id, step, clientId);
      
      // Add delay if configured
      if (step.delayDays > 0 || step.delayHours > 0) {
        // Schedule next step
        const delay = (step.delayDays * 24 + step.delayHours) * 3600000;
        // In production, use a job queue (Bull, BullMQ, etc.)
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Mark as completed
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    return execution;
  }

  async executeStep(
    executionId: string,
    step: any,
    clientId: string
  ) {
    const action = await prisma.workflowAction.create({
      data: {
        executionId,
        stepNumber: step.stepNumber,
        actionType: step.type,
        status: 'pending'
      }
    });

    try {
      switch (step.type) {
        case 'send_email':
          await this.sendEmail(step.configuration, clientId);
          break;

        case 'send_sms':
          await this.sendSms(step.configuration, clientId);
          break;

        case 'create_task':
          await this.createTask(step.configuration, clientId);
          break;

        case 'update_field':
          await this.updateField(step.configuration, clientId);
          break;

        case 'wait':
          // Already handled by delay
          break;

        case 'condition':
          const conditionMet = await this.evaluateCondition(
            step.configuration,
            clientId
          );
          if (!conditionMet) {
            // Skip remaining steps or branch
          }
          break;
      }

      await prisma.workflowAction.update({
        where: { id: action.id },
        data: {
          status: 'completed',
          executedAt: new Date()
        }
      });
    } catch (error: any) {
      await prisma.workflowAction.update({
        where: { id: action.id },
        data: {
          status: 'failed',
          errorMessage: error.message
        }
      });
      throw error;
    }
  }

  private async sendEmail(config: any, clientId: string) {
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) throw new Error('Client not found');

    await prisma.message.create({
      data: {
        recipientEmail: client.email,
        recipientName: `${client.firstName} ${client.lastName}`,
        type: 'email',
        subject: config.subject,
        content: personalizeContent(config.content, client),
        status: 'queued'
      }
    });
  }

  private async createTask(config: any, clientId: string) {
    await prisma.task.create({
      data: {
        title: config.title,
        description: config.description,
        dueDate: new Date(Date.now() + config.dueDays * 86400000),
        assignedToId: config.assignedTo,
        status: 'todo'
      }
    });
  }

  private async updateField(config: any, clientId: string) {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        [config.fieldName]: config.value
      }
    });
  }

  private async evaluateCondition(config: any, clientId: string): Promise<boolean> {
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) return false;

    // Simple condition evaluation
    const fieldValue = (client as any)[config.field];
    
    switch (config.operator) {
      case 'equals':
        return fieldValue === config.value;
      case 'not_equals':
        return fieldValue !== config.value;
      case 'greater_than':
        return fieldValue > config.value;
      case 'less_than':
        return fieldValue < config.value;
      case 'contains':
        return String(fieldValue).includes(config.value);
      default:
        return false;
    }
  }
}
```

---

## 🎨 FRONTEND COMPONENTS

### Navigation Component
```typescript
// components/layouts/Navigation.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, MessageSquare, Workflow, DollarSign, 
  FolderOpen, BarChart3, Settings 
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
    children: [
      { name: 'Client Directory', href: '/clients' },
      { name: 'Segments', href: '/clients/segments' },
      { name: 'Interactions', href: '/clients/interactions' },
      { name: 'Import Clients', href: '/clients/import' }
    ]
  },
  {
    name: 'Outreach',
    href: '/outreach',
    icon: MessageSquare,
    children: [
      { name: 'Campaigns', href: '/outreach/campaigns' },
      { name: 'Messages', href: '/outreach/messages' },
      { name: 'Templates', href: '/outreach/templates' },
      { name: 'Segments', href: '/outreach/segments' }
    ]
  },
  {
    name: 'Automation',
    href: '/automation',
    icon: Workflow,
    children: [
      { name: 'Workflows', href: '/automation/workflows' },
      { name: 'Rules', href: '/automation/rules' },
      { name: 'Executions', href: '/automation/executions' }
    ]
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: DollarSign,
    children: [
      { name: 'Pipeline', href: '/sales/pipeline' },
      { name: 'Opportunities', href: '/sales/opportunities' },
      { name: 'Products', href: '/sales/products' },
      { name: 'Forecasts', href: '/sales/forecasts' }
    ]
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    children: [
      { name: 'All Projects', href: '/projects' },
      { name: 'Tasks', href: '/projects/tasks' },
      { name: 'Time Tracking', href: '/projects/time' },
      { name: 'Milestones', href: '/projects/milestones' }
    ]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
      { name: 'Dashboards', href: '/analytics/dashboards' },
      { name: 'Reports', href: '/analytics/reports' },
      { name: 'Export Data', href: '/analytics/export' }
    ]
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Settings,
    children: [
      { name: 'Users', href: '/admin/users' },
      { name: 'Roles', href: '/admin/roles' },
      { name: 'Settings', href: '/admin/settings' },
      { name: 'Integrations', href: '/admin/integrations' }
    ]
  }
];

export function Navigation() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  return (
    <nav className="w-64 bg-gray-900 text-white h-screen overflow-y-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Enterprise CRM</h1>
      </div>
      
      <div className="space-y-1 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.name);
          const isActive = pathname.startsWith(item.href);

          return (
            <div key={item.name}>
              <button
                onClick={() => toggleExpanded(item.name)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg
                  transition-colors
                  ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}
                `}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`
                        block px-3 py-2 rounded-lg text-sm
                        ${pathname === child.href ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}
                      `}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Auth
JWT_SECRET="your-secret-key"
SESSION_EXPIRY="7d"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-password"

# File Storage
AWS_BUCKET="your-bucket"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY="your-key"
AWS_SECRET_KEY="your-secret"

# Integrations
STRIPE_KEY="sk_test_..."
TWILIO_SID="AC..."
TWILIO_TOKEN="your-token"
```

### Database Migration
```bash
# Generate Prisma Client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name init

# Deploy to production
pnpm prisma migrate deploy

# Seed initial data
pnpm prisma db seed
```

### Production Setup
1. Set up external PostgreSQL (Neon, Supabase, Railway)
2. Configure environment variables
3. Deploy to Vercel/Railway/your hosting
4. Set up job queue for workflows (Bull/BullMQ)
5. Configure file storage (S3/CloudFlare R2)
6. Set up monitoring (Sentry, LogRocket)
7. Configure analytics (PostHog, Mixpanel)

---

This implementation guide provides the foundation for building a comprehensive enterprise application with all the features outlined in the menu structure.
