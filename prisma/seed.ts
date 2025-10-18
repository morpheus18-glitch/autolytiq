import bcrypt from 'bcrypt';
import {
  AccountType,
  AppraisalConditionGrade,
  AppraisalStatus,
  AuctionPurchaseStatus,
  CommissionStatus,
  CommissionType,
  CustomerVehicleStatus,
  DealStatus,
  DealType,
  ActivityStatus,
  ActivityType,
  AppointmentStatus,
  AppointmentType,
  CommunicationDirection,
  CommunicationStatus,
  CommunicationType,
  FuelType,
  InteractionDirection,
  InteractionType,
  JournalStatus,
  LeadSource,
  LeadStatus,
  LeadPriority,
  LineType,
  NormalBalance,
  NotificationType,
  PriceChangeType,
  PreferredContactMethod,
  PrismaClient,
  ReconItemStatus,
  ReportType,
  TenantPlan,
  TenantStatus,
  VehicleAcquisitionType,
  UserRole,
  UserStatus,
  VehicleHistoryType,
  WholesaleListingStatus,
  MarketCompSource,
  VehicleStatus,
  VehicleType,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import { addDays, addMonths, eachMonthOfInterval, endOfMonth, startOfMonth, subDays, subYears } from 'date-fns';

const prisma = new PrismaClient();

const DEALERSHIP_SUBDOMAIN = 'sunrise-motors';
const DEVELOPER_EMAIL = 'developer@sunrisemotors.demo';
const DEVELOPER_PASSWORD = 'DevAccess!2024';

const glAccounts = [
  {
    accountNumber: '1000',
    accountName: 'Operating Cash',
    accountType: AccountType.ASSET,
    normalBalance: NormalBalance.DEBIT,
  },
  {
    accountNumber: '1100',
    accountName: 'Accounts Receivable',
    accountType: AccountType.ASSET,
    normalBalance: NormalBalance.DEBIT,
  },
  {
    accountNumber: '1200',
    accountName: 'Vehicle Inventory',
    accountType: AccountType.ASSET,
    normalBalance: NormalBalance.DEBIT,
  },
  {
    accountNumber: '2000',
    accountName: 'Floor Plan Payable',
    accountType: AccountType.LIABILITY,
    normalBalance: NormalBalance.CREDIT,
  },
  {
    accountNumber: '3000',
    accountName: 'Retained Earnings',
    accountType: AccountType.EQUITY,
    normalBalance: NormalBalance.CREDIT,
  },
  {
    accountNumber: '4000',
    accountName: 'Vehicle Sales Revenue',
    accountType: AccountType.REVENUE,
    normalBalance: NormalBalance.CREDIT,
  },
  {
    accountNumber: '4100',
    accountName: 'Finance and Insurance Revenue',
    accountType: AccountType.REVENUE,
    normalBalance: NormalBalance.CREDIT,
  },
  {
    accountNumber: '5000',
    accountName: 'Cost of Goods Sold',
    accountType: AccountType.EXPENSE,
    normalBalance: NormalBalance.DEBIT,
  },
];

async function resetTenantData(tenantId: string) {
  await prisma.communication.deleteMany({ where: { tenantId } });
  await prisma.appointment.deleteMany({ where: { tenantId } });
  await prisma.activity.deleteMany({ where: { tenantId } });
  await prisma.leadScore.deleteMany({ where: { tenantId } });
  await prisma.lead.deleteMany({ where: { tenantId } });
  await prisma.emailTemplate.deleteMany({ where: { tenantId } });
  await prisma.sMSTemplate.deleteMany({ where: { tenantId } });
  await prisma.automationExecution.deleteMany({ where: { tenantId } });
  await prisma.automation.deleteMany({ where: { tenantId } });
  await prisma.notification.deleteMany({ where: { tenantId } });
  await prisma.report.deleteMany({ where: { tenantId } });
  await prisma.commission.deleteMany({ where: { tenantId } });
  await prisma.journalEntryLine.deleteMany({ where: { tenantId } });
  await prisma.journalEntry.deleteMany({ where: { tenantId } });
  await prisma.dealDocument.deleteMany({ where: { deal: { tenantId } } });
  await prisma.contract.deleteMany({ where: { tenantId } });
  await prisma.lenderSubmission.deleteMany({ where: { tenantId } });
  await prisma.creditApplication.deleteMany({ where: { tenantId } });
  await prisma.fundingChecklist.deleteMany({ where: { tenantId } });
  await prisma.dealJacket.deleteMany({ where: { tenantId } });
  await prisma.deal.deleteMany({ where: { tenantId } });
  await prisma.marketComp.deleteMany({ where: { tenantId } });
  await prisma.wholesaleListing.deleteMany({ where: { tenantId } });
  await prisma.auctionPurchase.deleteMany({ where: { tenantId } });
  await prisma.priceHistory.deleteMany({ where: { tenantId } });
  await prisma.reconItem.deleteMany({ where: { tenantId } });
  await prisma.appraisal.deleteMany({ where: { tenantId } });
  await prisma.vehicleHistory.deleteMany({ where: { tenantId } });
  await prisma.vehicle.deleteMany({ where: { tenantId } });
  await prisma.customerVehicle.deleteMany({ where: { tenantId } });
  await prisma.customerInteraction.deleteMany({ where: { tenantId } });
  await prisma.customer.deleteMany({ where: { tenantId } });
  await prisma.gLAccount.deleteMany({ where: { tenantId } });
  await prisma.auditLog.deleteMany({ where: { tenantId } });
  await prisma.systemSetting.deleteMany({ where: { tenantId } });
  await prisma.user.deleteMany({ where: { tenantId } });
  await prisma.tenant.delete({ where: { id: tenantId } });
}

function createMonthlyPeriods() {
  const end = endOfMonth(new Date());
  const start = startOfMonth(subYears(end, 2));
  return eachMonthOfInterval({ start, end });
}

function buildVehiclePrice() {
  const msrp = faker.number.float({ min: 18000, max: 75000, fractionDigits: 2 });
  const invoiceMultiplier = faker.number.float({ min: 0.88, max: 0.95, fractionDigits: 4 });
  const listMultiplier = faker.number.float({ min: 0.92, max: 1.02, fractionDigits: 4 });
  const invoice = msrp * invoiceMultiplier;
  const listPrice = msrp * listMultiplier;
  return {
    msrp: msrp.toFixed(2),
    invoiceCost: invoice.toFixed(2),
    listPrice: listPrice.toFixed(2),
  };
}

async function main() {
  const existingTenant = await prisma.tenant.findUnique({ where: { subdomain: DEALERSHIP_SUBDOMAIN } });
  if (existingTenant) {
    console.info('Existing tenant found – refreshing demo data.');
    await resetTenantData(existingTenant.id);
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Sunrise Motors',
      subdomain: DEALERSHIP_SUBDOMAIN,
      plan: TenantPlan.PROFESSIONAL,
      status: TenantStatus.ACTIVE,
      billingEmail: 'billing@sunrisemotors.demo',
      settings: {
        timezone: 'America/Chicago',
        currency: 'USD',
        inventoryAgingThreshold: 90,
        defaultDocFee: 489,
      },
    },
  });

  const passwordHash = await bcrypt.hash(DEVELOPER_PASSWORD, 12);

  const userSeed = [
    {
      email: DEVELOPER_EMAIL,
      firstName: 'Dana',
      lastName: 'Reeves',
      role: UserRole.ADMIN,
      isSuperAdmin: true,
      phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    },
    {
      email: 'sales.manager@sunrisemotors.demo',
      firstName: 'Jordan',
      lastName: 'Parker',
      role: UserRole.MANAGER,
      phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    },
    {
      email: 'finance.manager@sunrisemotors.demo',
      firstName: 'Avery',
      lastName: 'Nguyen',
      role: UserRole.FINANCE,
      phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    },
    {
      email: 'sales1@sunrisemotors.demo',
      firstName: 'Taylor',
      lastName: 'Stone',
      role: UserRole.SALES,
      phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    },
    {
      email: 'sales2@sunrisemotors.demo',
      firstName: 'Morgan',
      lastName: 'Lee',
      role: UserRole.SALES,
      phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    },
    {
      email: 'bdc@sunrisemotors.demo',
      firstName: 'Reese',
      lastName: 'Howard',
      role: UserRole.BDC,
      phone: faker.helpers.replaceSymbols('+1-###-###-####'),
    },
  ];

  const users = await Promise.all(
    userSeed.map((user) =>
      prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: user.email,
          password: passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          permissions: user.role === UserRole.ADMIN ? ['*'] : ['deals:read', 'customers:read'],
          status: UserStatus.ACTIVE,
          isSuperAdmin: user.isSuperAdmin ?? false,
        },
      })
    )
  );

  const usersByRole = users.reduce<Record<UserRole, typeof users>>((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {} as Record<UserRole, typeof users>);

  const glAccountRecords = await Promise.all(
    glAccounts.map((account) =>
      prisma.gLAccount.create({
        data: {
          tenantId: tenant.id,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          accountType: account.accountType,
          normalBalance: account.normalBalance,
          balance: '0',
        },
      })
    )
  );

  const glAccountMap = glAccountRecords.reduce<Record<string, string>>((map, account) => {
    map[account.accountNumber] = account.id;
    return map;
  }, {});

  const salesTeam = usersByRole[UserRole.SALES] ?? [];
  const financeManagers = usersByRole[UserRole.FINANCE] ?? [];
  const adminUser = users.find((user) => user.email === DEVELOPER_EMAIL) ?? users[0];

  const customers = [] as Awaited<ReturnType<typeof prisma.customer.create>>[];
  for (let i = 0; i < 60; i += 1) {
    const created = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email({ provider: 'example.com' }),
        phone: faker.helpers.replaceSymbols('+1-###-###-####'),
        mobile: faker.helpers.replaceSymbols('+1-###-###-####'),
        dateOfBirth: faker.date.birthdate({ min: 1955, max: 2002, mode: 'year' }),
        addressStreet: faker.location.streetAddress(),
        addressCity: faker.location.city(),
        addressState: faker.location.state({ abbreviated: true }),
        addressZip: faker.location.zipCode('#####'),
        addressCountry: 'USA',
        preferredContactMethod: faker.helpers.arrayElement([
          PreferredContactMethod.EMAIL,
          PreferredContactMethod.PHONE,
          PreferredContactMethod.SMS,
        ]),
        leadSource: faker.helpers.arrayElement([
          LeadSource.WEBSITE,
          LeadSource.REFERRAL,
          LeadSource.WALKIN,
          LeadSource.WALK_IN,
          LeadSource.SOCIAL_MEDIA,
          LeadSource.PHONE,
        ]),
        leadStatus: faker.helpers.arrayElement([
          LeadStatus.HOT,
          LeadStatus.WARM,
          LeadStatus.COLD,
          LeadStatus.CUSTOMER,
          LeadStatus.QUALIFIED,
          LeadStatus.SCHEDULED,
          LeadStatus.NEGOTIATION,
        ]),
        leadScore: faker.number.int({ min: 20, max: 95 }),
        creditScore: faker.number.int({ min: 580, max: 830 }),
        assignedToUserId: faker.helpers.arrayElement(salesTeam).id,
        tags: faker.helpers.arrayElements(['internet', 'trade-in', 'finance', 'lease', 'repeat'], { min: 1, max: 3 }),
        notes: faker.lorem.sentences({ min: 1, max: 2 }),
        lifetimeValue: '0',
      },
    });

    const interactionCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < interactionCount; j += 1) {
      await prisma.customerInteraction.create({
        data: {
          tenantId: tenant.id,
          customerId: created.id,
          userId: faker.helpers.arrayElement(salesTeam).id,
          type: faker.helpers.arrayElement(Object.values(InteractionType)),
          direction: faker.helpers.arrayElement(Object.values(InteractionDirection)),
          subject: faker.company.catchPhrase(),
          notes: faker.lorem.sentences({ min: 1, max: 2 }),
          scheduledAt: faker.date.recent({ days: 180 }),
          completedAt: faker.date.recent({ days: 90 }),
        },
      });
    }

    customers.push(created);
  }

  const leadStatusOptions = [
    LeadStatus.NEW,
    LeadStatus.CONTACTED,
    LeadStatus.QUALIFIED,
    LeadStatus.SCHEDULED,
    LeadStatus.NEGOTIATION,
    LeadStatus.HOT,
    LeadStatus.WARM,
    LeadStatus.COLD,
    LeadStatus.WON,
    LeadStatus.LOST,
    LeadStatus.ARCHIVED,
  ] as LeadStatus[];

  const leadPriorityOptions = [
    LeadPriority.LOW,
    LeadPriority.MEDIUM,
    LeadPriority.HIGH,
    LeadPriority.URGENT,
  ] as LeadPriority[];

  const selectSalesUser = () => (salesTeam.length ? faker.helpers.arrayElement(salesTeam) : adminUser);

  const leads = await Promise.all(
    Array.from({ length: 30 }).map(async () => {
      const customer = faker.helpers.arrayElement(customers);
      const assignedTo = selectSalesUser();
      const owner = faker.helpers.arrayElement(users);
      const status = faker.helpers.arrayElement(leadStatusOptions);
      const createdAt = faker.date.recent({ days: 160 });
      const lastActivityAt = faker.helpers.maybe(
        () => faker.date.between({ from: createdAt, to: new Date() }),
        { probability: 0.7 },
      );
      const lastCommunicationAt = faker.helpers.maybe(
        () => faker.date.between({ from: createdAt, to: new Date() }),
        { probability: 0.7 },
      );
      const nextActionAt = faker.helpers.maybe(
        () =>
          faker.date.soon({
            days: 21,
            refDate: lastActivityAt ?? createdAt,
          }),
        { probability: 0.6 },
      );
      const convertedAt =
        status === LeadStatus.WON || status === LeadStatus.CUSTOMER
          ? faker.date.between({ from: createdAt, to: new Date() })
          : undefined;
      const tags = faker.helpers.arrayElements(
        ['internet', 'showroom', 'trade-in', 'finance', 'lease', 'vip', 'service'],
        { min: 1, max: 3 },
      );

      return prisma.lead.create({
        data: {
          tenantId: tenant.id,
          customerId: customer.id,
          assignedToId: assignedTo.id,
          ownerId: owner.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email ?? faker.internet.email({ provider: 'example.com' }),
          phone: customer.phone ?? faker.helpers.replaceSymbols('+1-###-###-####'),
          status,
          source: faker.helpers.arrayElement([
            LeadSource.WEBSITE,
            LeadSource.REFERRAL,
            LeadSource.PHONE,
            LeadSource.EMAIL,
            LeadSource.SOCIAL_MEDIA,
            LeadSource.THIRD_PARTY,
          ]),
          priority: faker.helpers.arrayElement(leadPriorityOptions),
          rating: faker.number.int({ min: 1, max: 5 }),
          score: faker.number.int({ min: 35, max: 95 }),
          isArchived: status === LeadStatus.ARCHIVED,
          isConverted: status === LeadStatus.WON || status === LeadStatus.CUSTOMER,
          lastActivityAt: lastActivityAt ?? undefined,
          lastCommunicationAt: lastCommunicationAt ?? undefined,
          nextActionAt: nextActionAt ?? undefined,
          convertedAt: convertedAt ?? undefined,
          description: faker.lorem.sentences({ min: 1, max: 2 }),
          tags,
          createdAt,
        },
      });
    }),
  );

  await prisma.leadScore.createMany({
    data: leads.map((lead) => ({
      tenantId: tenant.id,
      leadId: lead.id,
      modelKey: 'engagement.v1',
      score: lead.score ?? faker.number.int({ min: 40, max: 95 }),
      scoreDelta: faker.number.int({ min: -10, max: 18 }),
      reason: faker.helpers.arrayElement([
        'High website engagement',
        'Recent appointment completed',
        'Missed follow-up deadline',
      ]),
      metadata: {
        priority: lead.priority,
        status: lead.status,
        tags: lead.tags,
      },
      createdAt: faker.date.recent({ days: 45 }),
    })),
  });

  const activities = [] as Awaited<ReturnType<typeof prisma.activity.create>>[];
  for (let i = 0; i < 50; i += 1) {
    const lead = faker.helpers.arrayElement(leads);
    const assignedUser = selectSalesUser();
    const startedAt = faker.helpers.maybe(() => faker.date.recent({ days: 20 }), { probability: 0.6 });
    const completedAt =
      startedAt && faker.datatype.boolean({ probability: 0.7 })
        ? faker.date.between({ from: startedAt, to: new Date() })
        : undefined;
    const status =
      completedAt !== undefined
        ? ActivityStatus.COMPLETED
        : faker.helpers.arrayElement([
            ActivityStatus.PENDING,
            ActivityStatus.CANCELED,
            ActivityStatus.SKIPPED,
          ] as ActivityStatus[]);
    const dueAt =
      status === ActivityStatus.PENDING
        ? faker.helpers.maybe(() => faker.date.soon({ days: 14 }), { probability: 0.7 })
        : undefined;

    const activity = await prisma.activity.create({
      data: {
        tenantId: tenant.id,
        leadId: lead.id,
        customerId: lead.customerId,
        userId: assignedUser.id,
        type: faker.helpers.arrayElement(Object.values(ActivityType) as ActivityType[]),
        status,
        subject: faker.company.buzzPhrase(),
        description: faker.lorem.sentences({ min: 1, max: 2 }),
        outcome: completedAt ? faker.lorem.sentences({ min: 1, max: 2 }) : null,
        dueAt: dueAt ?? undefined,
        startedAt: startedAt ?? undefined,
        completedAt: completedAt ?? undefined,
      },
    });

    activities.push(activity);
  }

  const appointments = [] as Awaited<ReturnType<typeof prisma.appointment.create>>[];
  for (let i = 0; i < 8; i += 1) {
    const lead = faker.helpers.arrayElement(leads);
    const assignedUser = selectSalesUser();
    const startAt = faker.date.soon({ days: 30 });
    const status = faker.helpers.arrayElement(
      [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.NO_SHOW,
        AppointmentStatus.CANCELLED,
      ] as AppointmentStatus[],
    );

    const appointment = await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        leadId: lead.id,
        customerId: lead.customerId,
        assignedToId: assignedUser.id,
        title: `${faker.company.catchPhrase()} with ${lead.firstName ?? lead.lastName ?? 'prospect'}`,
        notes: faker.lorem.sentences({ min: 1, max: 2 }),
        type: faker.helpers.arrayElement(Object.values(AppointmentType) as AppointmentType[]),
        status,
        location: faker.helpers.arrayElement([
          'Showroom A',
          'Showroom B',
          'Virtual Appointment',
          'Service Bay 1',
        ]),
        timeZone: faker.helpers.arrayElement(['America/Chicago', 'America/Los_Angeles', 'America/New_York']),
        startAt,
        endAt: new Date(startAt.getTime() + faker.number.int({ min: 30, max: 90 }) * 60000),
        checkedInAt:
          status === AppointmentStatus.IN_PROGRESS || status === AppointmentStatus.COMPLETED
            ? faker.date.between({ from: startAt, to: new Date(startAt.getTime() + 30 * 60000) })
            : undefined,
        completedAt:
          status === AppointmentStatus.COMPLETED
            ? faker.date.between({ from: startAt, to: new Date(startAt.getTime() + 90 * 60000) })
            : undefined,
        cancelledAt: status === AppointmentStatus.CANCELLED ? faker.date.recent({ days: 10 }) : undefined,
        noShowAt: status === AppointmentStatus.NO_SHOW ? faker.date.recent({ days: 5 }) : undefined,
      },
    });

    appointments.push(appointment);
  }

  const communications = [] as Awaited<ReturnType<typeof prisma.communication.create>>[];
  for (let i = 0; i < 50; i += 1) {
    const lead = faker.helpers.arrayElement(leads);
    const customer = customers.find((entry) => entry.id === lead.customerId) ?? faker.helpers.arrayElement(customers);
    const activity = faker.helpers.maybe(() => faker.helpers.arrayElement(activities), { probability: 0.4 });
    const type = faker.helpers.arrayElement(Object.values(CommunicationType) as CommunicationType[]);
    const direction = faker.helpers.arrayElement(Object.values(CommunicationDirection) as CommunicationDirection[]);
    const status = faker.helpers.arrayElement(Object.values(CommunicationStatus) as CommunicationStatus[]);
    const toContact =
      type === CommunicationType.EMAIL
        ? customer.email ?? faker.internet.email({ provider: 'example.com' })
        : faker.helpers.replaceSymbols('+1-###-###-####');
    const fromContact =
      type === CommunicationType.EMAIL ? 'sales@sunrisemotors.demo' : '+13125550000';

    const communication = await prisma.communication.create({
      data: {
        tenantId: tenant.id,
        type,
        direction,
        to: toContact,
        from: fromContact,
        subject: type === CommunicationType.EMAIL ? faker.company.catchPhrase() : null,
        body: type === CommunicationType.CALL
          ? faker.lorem.sentences({ min: 1, max: 2 })
          : faker.lorem.sentences({ min: 2, max: 4 }),
        providerId: type === CommunicationType.SMS ? faker.string.uuid() : null,
        status,
        metadata: {
          channel: type,
          direction,
          sentiment: faker.helpers.arrayElement(['positive', 'neutral', 'negative']),
        },
        leadId: lead.id,
        customerId: customer.id,
        activityId: activity?.id,
        userId: lead.assignedToId ?? selectSalesUser().id,
        createdAt: faker.date.recent({ days: 45 }),
      },
    });

    communications.push(communication);
  }

  await prisma.emailTemplate.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'Welcome Lead',
        subject: 'Thanks for contacting Sunrise Motors',
        html: '<p>Hi {{firstName}},</p><p>Thanks for reaching out to Sunrise Motors. Our team will follow up shortly.</p>',
        text: 'Thanks for reaching out to Sunrise Motors. Our team will follow up shortly.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        name: 'Appointment Reminder',
        subject: 'Reminder: Upcoming appointment at Sunrise Motors',
        html: '<p>We look forward to seeing you at your scheduled appointment.</p>',
        text: 'Reminder: your appointment at Sunrise Motors is coming up soon.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        name: 'Post-Visit Follow-up',
        subject: 'We appreciate your visit',
        html: '<p>Thank you for stopping by Sunrise Motors. Let us know if you have any questions.</p>',
        text: 'Thank you for visiting Sunrise Motors. We are here to help with any questions.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  await prisma.sMSTemplate.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'Lead Intro',
        body: 'Thanks for contacting Sunrise Motors! Reply YES to schedule a visit.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        name: 'Appointment Reminder SMS',
        body: 'Reminder: You have an appointment with Sunrise Motors tomorrow. Reply 1 to confirm.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        name: 'Post-Visit SMS',
        body: 'Thanks for visiting Sunrise Motors! Text us with any questions.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  await prisma.automation.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'New Lead Nurture',
        trigger: { type: 'lead.status.changed', status: 'NEW' },
        actions: [
          { type: 'EMAIL', template: 'Welcome Lead' },
          { type: 'TASK', assignee: 'BDC', dueInHours: 24 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        name: 'Appointment Reminder Flow',
        trigger: { type: 'appointment.upcoming', hoursBefore: 24 },
        actions: [
          { type: 'SMS', template: 'Appointment Reminder SMS' },
          { type: 'EMAIL', template: 'Appointment Reminder' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        name: 'Lead Re-Engagement',
        trigger: { type: 'lead.inactive', days: 7 },
        actions: [
          { type: 'EMAIL', template: 'Post-Visit Follow-up' },
          { type: 'TASK', assignee: 'SALES', dueInHours: 12 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  await Promise.all(
    leads.map(async (lead) => {
      const leadActivities = activities.filter((activity) => activity.leadId === lead.id);
      const latestActivity = leadActivities.reduce<Date | undefined>((latest, activity) => {
        const activityTimestamp = activity.completedAt ?? activity.startedAt ?? activity.dueAt ?? activity.createdAt;
        if (!latest || activityTimestamp > latest) {
          return activityTimestamp ?? undefined;
        }
        return latest;
      }, lead.lastActivityAt ?? undefined);

      const leadCommunications = communications.filter((communication) => communication.leadId === lead.id);
      const latestCommunication = leadCommunications.reduce<Date | undefined>((latest, communication) => {
        if (!latest || communication.createdAt > latest) {
          return communication.createdAt;
        }
        return latest;
      }, lead.lastCommunicationAt ?? undefined);

      const nextAction = leadActivities
        .filter((activity) => activity.status === ActivityStatus.PENDING && activity.dueAt)
        .map((activity) => activity.dueAt as Date)
        .sort((a, b) => a.getTime() - b.getTime())[0];

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          lastActivityAt: latestActivity ?? undefined,
          lastCommunicationAt: latestCommunication ?? undefined,
          nextActionAt: nextAction ?? undefined,
        },
      });
    }),
  );

  const inventoryVehicles = [] as Awaited<ReturnType<typeof prisma.vehicle.create>>[];
  for (let i = 0; i < 75; i += 1) {
    const { msrp, invoiceCost, listPrice } = buildVehiclePrice();
    const received = faker.date.between({
      from: subYears(new Date(), 2),
      to: new Date(),
    });
    const acquisitionType = i % 4 === 0
      ? VehicleAcquisitionType.AUCTION
      : i % 4 === 1
        ? VehicleAcquisitionType.TRADE_IN
        : i % 4 === 2
          ? VehicleAcquisitionType.PURCHASE
          : VehicleAcquisitionType.CONSIGNMENT;
    const acquisitionDate = faker.date.soon({ days: 10, refDate: received });
    const basePrice = Number(listPrice ?? invoiceCost ?? msrp ?? '25000');
    const acquisitionCost = Number(invoiceCost ?? msrp ?? listPrice ?? '0');
    const floorPrice = Number((basePrice * 0.9).toFixed(2));
    const wholesaleValue = Number((basePrice * 0.88).toFixed(2));
    const marketValue = Number((basePrice * faker.number.float({ min: 0.9, max: 1.05, fractionDigits: 4 })).toFixed(2));
    const targetPrice = Number((basePrice * 0.97).toFixed(2));
    const aiPrice = Number((basePrice * 0.965).toFixed(2));
    const reconEstimateValue = faker.number.float({ min: 350, max: 1800, fractionDigits: 2 });
    const reconActualValue = Number((reconEstimateValue * faker.number.float({ min: 0.85, max: 1.1, fractionDigits: 2 })).toFixed(2));
    const reconCompletedAt = faker.helpers.maybe(
      () => addDays(acquisitionDate, faker.number.int({ min: 3, max: 18 })),
      { probability: 0.65 }
    );
    const lastAppraisedAt = faker.helpers.maybe(
      () => subDays(new Date(), faker.number.int({ min: 3, max: 45 })),
      { probability: 0.55 }
    );
    const appraisalStatus = lastAppraisedAt ? AppraisalStatus.APPROVED : AppraisalStatus.SUBMITTED;
    const nextPriceReviewDate = faker.helpers.maybe(
      () => addDays(new Date(), faker.number.int({ min: 7, max: 30 })),
      { probability: 0.7 }
    );
    const agingBucket = faker.helpers.arrayElement(['0-30', '31-60', '61-90', '90+']);

    const vehicle = await prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        stockNumber: `SM-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
        vin: faker.vehicle.vin(),
        type: faker.helpers.arrayElement([VehicleType.NEW, VehicleType.USED, VehicleType.CERTIFIED]),
        year: faker.number.int({ min: 2018, max: 2024 }),
        make: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        trim: faker.vehicle.model(),
        exteriorColor: faker.vehicle.color(),
        interiorColor: faker.color.human(),
        mileage: faker.number.int({ min: 0, max: 85000 }),
        engineType: faker.vehicle.type(),
        transmission: faker.helpers.arrayElement(['Automatic', 'Manual']),
        drivetrain: faker.helpers.arrayElement(['FWD', 'RWD', 'AWD', '4WD']),
        fuelType: faker.helpers.arrayElement([
          FuelType.GASOLINE,
          FuelType.DIESEL,
          FuelType.HYBRID,
          FuelType.ELECTRIC,
        ]),
        msrp,
        invoiceCost,
        listPrice,
        acquisitionType,
        acquisitionSource: acquisitionType === VehicleAcquisitionType.AUCTION
          ? faker.helpers.arrayElement(['Manheim Dallas', 'ADESA Chicago', 'Manheim Orlando'])
          : acquisitionType === VehicleAcquisitionType.TRADE_IN
            ? 'Customer Trade'
            : acquisitionType === VehicleAcquisitionType.CONSIGNMENT
              ? 'Consignment'
              : faker.company.name(),
        acquisitionDate,
        acquisitionCost: acquisitionCost.toFixed(2),
        floorPrice: floorPrice.toFixed(2),
        wholesaleValue: wholesaleValue.toFixed(2),
        marketValue: marketValue.toFixed(2),
        targetPrice: targetPrice.toFixed(2),
        aiPrice: aiPrice.toFixed(2),
        pricingNotes: faker.lorem.sentence(),
        appraisalStatus,
        lastAppraisedAt,
        reconEstimate: reconEstimateValue.toFixed(2),
        reconActual: reconActualValue.toFixed(2),
        reconCompletedAt,
        agingBucket,
        nextPriceReviewDate,
        status: VehicleStatus.AVAILABLE,
        location: faker.location.city(),
        dateReceived: received,
        images: faker.helpers.arrayElements(
          [
            'https://images.example.com/vehicle-exterior.jpg',
            'https://images.example.com/vehicle-interior.jpg',
            'https://images.example.com/vehicle-dashboard.jpg',
          ],
          { min: 1, max: 3 }
        ),
        features: faker.helpers.arrayElements(
          ['Heated Seats', 'Bluetooth', 'Navigation', 'Backup Camera', 'Sunroof', 'Alloy Wheels'],
          { min: 2, max: 5 }
        ),
        notes: faker.vehicle.vrm(),
      },
    });

    inventoryVehicles.push(vehicle);
  }

  const managerUser = (usersByRole[UserRole.MANAGER] ?? [])[0] ?? adminUser;
  const appraiserUser = salesTeam[0] ?? managerUser;
  const sampleVehicle = inventoryVehicles[0];

  if (sampleVehicle) {
    const appraisalSubmittedAt = subDays(new Date(), 5);
    const appraisalApprovedAt = subDays(new Date(), 3);
    const appraisal = await prisma.appraisal.create({
      data: {
        tenantId: tenant.id,
        vehicleId: sampleVehicle.id,
        appraiserId: appraiserUser.id,
        managerId: managerUser.id,
        vin: sampleVehicle.vin,
        year: sampleVehicle.year,
        make: sampleVehicle.make,
        model: sampleVehicle.model,
        trim: sampleVehicle.trim,
        exteriorColor: sampleVehicle.exteriorColor,
        interiorColor: sampleVehicle.interiorColor,
        mileage: sampleVehicle.mileage,
        conditionGrade: AppraisalConditionGrade.CLEAN,
        conditionScore: faker.number.int({ min: 70, max: 92 }),
        conditionNotes: faker.lorem.sentence(),
        warningLights: faker.helpers.arrayElements(['ABS', 'TPMS', 'Check Engine'], { min: 0, max: 2 }),
        photos: [
          'https://images.example.com/appraisals/interior.jpg',
          'https://images.example.com/appraisals/exterior.jpg',
        ],
        estimatedValue: (Number(sampleVehicle.listPrice ?? sampleVehicle.msrp ?? '25000') * 0.9).toFixed(2),
        marketValue: (Number(sampleVehicle.listPrice ?? sampleVehicle.msrp ?? '25000') * 0.92).toFixed(2),
        aiSuggestedValue: (Number(sampleVehicle.listPrice ?? sampleVehicle.msrp ?? '25000') * 0.915).toFixed(2),
        reconEstimate: {
          interior: 180,
          exterior: 275,
          mechanical: 450,
        },
        status: AppraisalStatus.APPROVED,
        submittedAt: appraisalSubmittedAt,
        approvedAt: appraisalApprovedAt,
        notes: 'Approved appraisal used as pricing baseline.',
      },
    });

    await prisma.vehicle.update({
      where: { id: sampleVehicle.id },
      data: {
        appraisalStatus: AppraisalStatus.APPROVED,
        lastAppraisedAt: appraisalApprovedAt,
        marketValue: (Number(sampleVehicle.listPrice ?? sampleVehicle.msrp ?? '25000') * 0.92).toFixed(2),
      },
    });

    await prisma.reconItem.create({
      data: {
        tenantId: tenant.id,
        vehicleId: sampleVehicle.id,
        appraisalId: appraisal.id,
        title: 'Detail and paint correction',
        description: 'Full exterior buff with scratch repair and ceramic coating prep.',
        category: 'Appearance',
        status: ReconItemStatus.COMPLETED,
        vendor: 'ShineWorks Detailing',
        estimatedCost: '425.00',
        actualCost: '410.00',
        startedAt: addDays(appraisalApprovedAt, 1),
        completedAt: addDays(appraisalApprovedAt, 3),
        beforePhotos: ['https://images.example.com/recon/before-detail.jpg'],
        afterPhotos: ['https://images.example.com/recon/after-detail.jpg'],
        notes: 'Vehicle ready for front-line display.',
      },
    });

    await prisma.reconItem.create({
      data: {
        tenantId: tenant.id,
        vehicleId: sampleVehicle.id,
        appraisalId: appraisal.id,
        title: 'Brake pad replacement',
        description: 'Replace front brake pads and resurface rotors.',
        category: 'Mechanical',
        status: ReconItemStatus.IN_PROGRESS,
        vendor: 'Sunrise Service Bay',
        estimatedCost: '320.00',
        actualCost: null,
        startedAt: addDays(appraisalApprovedAt, 2),
        beforePhotos: ['https://images.example.com/recon/brakes-before.jpg'],
        notes: 'Waiting on parts arrival.',
      },
    });

    const oldPrice = Number(sampleVehicle.listPrice ?? sampleVehicle.msrp ?? '25000');
    const reducedPrice = Number((oldPrice - 750).toFixed(2));

    await prisma.priceHistory.create({
      data: {
        tenantId: tenant.id,
        vehicleId: sampleVehicle.id,
        changedById: managerUser.id,
        changeType: PriceChangeType.MARKET,
        oldPrice: oldPrice.toFixed(2),
        newPrice: reducedPrice.toFixed(2),
        adjustment: (reducedPrice - oldPrice).toFixed(2),
        sourceReference: 'appraisal-review',
        notes: 'Market realignment following approved appraisal.',
      },
    });

    await prisma.priceHistory.create({
      data: {
        tenantId: tenant.id,
        vehicleId: sampleVehicle.id,
        changedById: appraiserUser.id,
        changeType: PriceChangeType.AI_RECOMMENDATION,
        oldPrice: reducedPrice.toFixed(2),
        newPrice: (reducedPrice - 250).toFixed(2),
        adjustment: (-250).toFixed(2),
        sourceReference: 'ml-service',
        notes: 'Automated pricing suggestion applied after 30 days in stock.',
      },
    });

    await prisma.marketComp.createMany({
      data: [
        {
          tenantId: tenant.id,
          vehicleId: sampleVehicle.id,
          source: MarketCompSource.RETAIL_LISTING,
          compVin: faker.vehicle.vin(),
          year: sampleVehicle.year,
          make: sampleVehicle.make,
          model: sampleVehicle.model,
          trim: sampleVehicle.trim,
          mileage: faker.number.int({ min: sampleVehicle.mileage ?? 10000, max: (sampleVehicle.mileage ?? 10000) + 15000 }),
          price: (oldPrice * 0.98).toFixed(2),
          distance: faker.number.int({ min: 5, max: 120 }),
          location: faker.location.city(),
          listedAt: subDays(new Date(), faker.number.int({ min: 2, max: 10 })),
          payload: { provider: 'Cars.com' },
        },
        {
          tenantId: tenant.id,
          vehicleId: sampleVehicle.id,
          source: MarketCompSource.AUCTION_RESULT,
          compVin: faker.vehicle.vin(),
          year: sampleVehicle.year,
          make: sampleVehicle.make,
          model: sampleVehicle.model,
          trim: sampleVehicle.trim,
          mileage: faker.number.int({ min: 10000, max: 40000 }),
          price: (oldPrice * 0.85).toFixed(2),
          distance: faker.number.int({ min: 50, max: 250 }),
          location: faker.location.city(),
          listedAt: subDays(new Date(), faker.number.int({ min: 5, max: 14 })),
          payload: { auction: 'Manheim Nashville' },
        },
      ],
      skipDuplicates: true,
    });

    await prisma.wholesaleListing.create({
      data: {
        tenantId: tenant.id,
        vehicleId: sampleVehicle.id,
        platform: 'ACV Auctions',
        status: WholesaleListingStatus.LISTED,
        askingPrice: (oldPrice - 1200).toFixed(2),
        reservePrice: (oldPrice - 1600).toFixed(2),
        minimumAcceptable: (oldPrice - 2000).toFixed(2),
        publishedAt: subDays(new Date(), 1),
        expiresAt: addDays(new Date(), 5),
        notes: 'Listed for wholesale backup strategy.',
      },
    });
  }

  const auctionVehicle = inventoryVehicles.find((vehicle) => vehicle.acquisitionType === VehicleAcquisitionType.AUCTION) ?? sampleVehicle;

  if (auctionVehicle) {
    const auctionBase = Number(auctionVehicle.invoiceCost ?? auctionVehicle.listPrice ?? '22000');
    const hammerPrice = (auctionBase - 1500).toFixed(2);
    const totalCost = (auctionBase - 1500 + 425 + 325 + 585).toFixed(2);

    await prisma.auctionPurchase.upsert({
      where: {
        tenantId_vehicleId: {
          tenantId: tenant.id,
          vehicleId: auctionVehicle.id,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        vehicleId: auctionVehicle.id,
        provider: 'Manheim',
        auctionName: 'Manheim Dallas Evening Sale',
        auctionDate: subDays(new Date(), 12),
        lane: 'B',
        runNumber: `B-${faker.string.numeric(3)}`,
        status: AuctionPurchaseStatus.WON,
        hammerPrice,
        buyerFees: '425.00',
        transportCost: '325.00',
        reconditioningCost: '585.00',
        totalCost,
        conditionGrade: '3.6',
        inspectorNotes: 'Minor cosmetic scuffs, clean frame.',
        documents: ['https://docs.example.com/auction/condition-report.pdf'],
      },
    });
  }

  const months = createMonthlyPeriods();
  let dealCounter = 1;
  const deals = [] as Awaited<ReturnType<typeof prisma.deal.create>>[];

  for (const month of months) {
    const dealsThisMonth = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < dealsThisMonth; i += 1) {
      const vehicle = inventoryVehicles.shift();
      if (!vehicle) {
        break;
      }

      const customer = faker.helpers.arrayElement(customers);
      const salesPerson = faker.helpers.arrayElement(salesTeam);
      const financeManager = financeManagers.length
        ? faker.helpers.arrayElement(financeManagers)
        : adminUser;

      const dealDate = faker.date.between({
        from: startOfMonth(month),
        to: endOfMonth(month),
      });

      const basePrice = Number(vehicle.listPrice ?? vehicle.msrp ?? '25000');
      const discount = Number(faker.number.float({ min: 500, max: 2500, fractionDigits: 2 }).toFixed(2));
      const netVehiclePrice = basePrice - discount;
      const downPayment = Number(faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }).toFixed(2));
      const amountFinanced = Math.max(netVehiclePrice - downPayment, 0);
      const monthlyPayment = amountFinanced > 0
        ? Number((amountFinanced / faker.number.int({ min: 24, max: 72 })).toFixed(2))
        : null;
      const apr = amountFinanced > 0 ? Number(faker.number.float({ min: 1.9, max: 6.5, fractionDigits: 2 }).toFixed(2)) : null;
      const docFee = 489;
      const salesTax = Number((netVehiclePrice * 0.0825).toFixed(2));
      const costOfGoods = Number(vehicle.invoiceCost ?? '0');
      const frontGross = Number((netVehiclePrice - costOfGoods).toFixed(2));
      const backEndGross = Number(faker.number.int({ min: 300, max: 1800 }));
      const totalDealGross = Number((frontGross + backEndGross).toFixed(2));

      const deal = await prisma.deal.create({
        data: {
          tenantId: tenant.id,
          dealNumber: `SM-${dealDate.getFullYear()}-${String(dealCounter).padStart(4, '0')}`,
          customerId: customer.id,
          vehicleId: vehicle.id,
          salesPersonId: salesPerson.id,
          financeManagerId: financeManager.id,
          dealType: faker.helpers.arrayElement([DealType.CASH, DealType.FINANCE, DealType.LEASE]),
          status: DealStatus.DELIVERED,
          vehiclePrice: netVehiclePrice.toFixed(2),
          discount: discount.toFixed(2),
          netVehiclePrice: netVehiclePrice.toFixed(2),
          downPayment: downPayment.toFixed(2),
          amountFinanced: amountFinanced ? amountFinanced.toFixed(2) : null,
          apr: apr ? apr.toFixed(2) : null,
          term: amountFinanced ? faker.number.int({ min: 24, max: 72 }) : null,
          monthlyPayment: monthlyPayment ? monthlyPayment.toFixed(2) : null,
          lenderName: amountFinanced ? faker.company.name() : null,
          lenderRate: apr ? apr.toFixed(2) : null,
          dealerReserve: amountFinanced ? (amountFinanced * 0.02).toFixed(2) : '0.00',
          docFee: docFee.toFixed(2),
          registrationFee: faker.number.int({ min: 150, max: 400 }).toFixed(2),
          salesTax: salesTax.toFixed(2),
          otherFees: {
            serviceContract: faker.number.int({ min: 0, max: 1800 }),
            gap: faker.datatype.boolean() ? faker.number.int({ min: 0, max: 900 }) : 0,
          },
          warrantyProduct: faker.helpers.maybe(() => faker.commerce.productName(), { probability: 0.4 }),
          warrantyCost: faker.number.int({ min: 0, max: 1500 }).toFixed(2),
          gapInsurance: faker.datatype.boolean(),
          gapCost: faker.number.int({ min: 0, max: 700 }).toFixed(2),
          maintenancePlan: faker.datatype.boolean(),
          maintenanceCost: faker.number.int({ min: 0, max: 1200 }).toFixed(2),
          frontEndGross: frontGross.toFixed(2),
          backEndGross: backEndGross.toFixed(2),
          totalGross: totalDealGross.toFixed(2),
          packAmount: faker.number.int({ min: 200, max: 400 }).toFixed(2),
          dealDate,
          fundedDate: amountFinanced ? addMonths(dealDate, 1) : dealDate,
          deliveryDate: dealDate,
          notes: faker.lorem.sentences({ min: 1, max: 2 }),
        },
      });

      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          status: VehicleStatus.SOLD,
          dateSold: dealDate,
        },
      });

      const ownership = await prisma.customerVehicle.create({
        data: {
          tenantId: tenant.id,
          customerId: customer.id,
          vin: vehicle.vin,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          trim: vehicle.trim,
          purchaseDate: dealDate,
          purchasePrice: netVehiclePrice.toFixed(2),
          status: CustomerVehicleStatus.OWNED,
          notes: `Purchased via deal ${deal.dealNumber}`,
        },
      });

      await prisma.vehicleHistory.create({
        data: {
          tenantId: tenant.id,
          vehicleId: vehicle.id,
        type: VehicleHistoryType.OWNERSHIP,
          date: dealDate,
          description: `Ownership transferred to ${customer.firstName} ${customer.lastName}`,
          documentUrl: `https://docs.example.com/titles/${ownership.id}.pdf`,
        },
      });

      const entryNumber = `JE-${dealDate.getFullYear()}${String(dealDate.getMonth() + 1).padStart(2, '0')}-${String(
        dealCounter
      ).padStart(4, '0')}`;

      const journalEntry = await prisma.journalEntry.create({
        data: {
          tenantId: tenant.id,
          entryNumber,
          memo: `Vehicle sale for deal ${deal.dealNumber}`,
          status: JournalStatus.POSTED,
          postingDate: dealDate,
          dealId: deal.id,
          postedById: adminUser.id,
          postedAt: new Date(),
        },
      });

      const receivableAmount = (netVehiclePrice - downPayment).toFixed(2);
      const financeRevenue = Number(Math.max(backEndGross * 0.4, 200).toFixed(2));

      await prisma.journalEntryLine.createMany({
        data: [
          {
            tenantId: tenant.id,
            journalEntryId: journalEntry.id,
            glAccountId: glAccountMap['1000'],
            type: LineType.DEBIT,
            amount: downPayment.toFixed(2),
            description: 'Customer cash down payment',
          },
          {
            tenantId: tenant.id,
            journalEntryId: journalEntry.id,
            glAccountId: glAccountMap['1100'],
            type: LineType.DEBIT,
            amount: receivableAmount,
            description: 'Amount financed by lender',
          },
          {
            tenantId: tenant.id,
            journalEntryId: journalEntry.id,
            glAccountId: glAccountMap['4000'],
            type: LineType.CREDIT,
            amount: netVehiclePrice.toFixed(2),
            description: 'Vehicle sales revenue',
          },
          {
            tenantId: tenant.id,
            journalEntryId: journalEntry.id,
            glAccountId: glAccountMap['4100'],
            type: LineType.CREDIT,
            amount: financeRevenue.toFixed(2),
            description: 'F&I product revenue',
          },
          {
            tenantId: tenant.id,
            journalEntryId: journalEntry.id,
            glAccountId: glAccountMap['5000'],
            type: LineType.DEBIT,
            amount: costOfGoods.toFixed(2),
            description: 'Cost of vehicle sold',
          },
          {
            tenantId: tenant.id,
            journalEntryId: journalEntry.id,
            glAccountId: glAccountMap['1200'],
            type: LineType.CREDIT,
            amount: costOfGoods.toFixed(2),
            description: 'Reduce vehicle inventory',
          },
        ],
      });

      await prisma.commission.create({
        data: {
          tenantId: tenant.id,
          dealId: deal.id,
          userId: salesPerson.id,
          commissionType: CommissionType.FRONT,
          amount: Number((totalDealGross * 0.25).toFixed(2)).toString(),
          rate: '0.25',
          status: CommissionStatus.PAID,
          paidDate: addMonths(dealDate, 1),
          notes: 'Automatically generated demo commission',
        },
      });

      deals.push(deal);
      dealCounter += 1;
    }
  }

  await prisma.notification.createMany({
    data: deals.slice(-5).map((deal) => ({
      tenantId: tenant.id,
      userId: adminUser.id,
      type: NotificationType.DEAL_APPROVAL,
      title: `Deal ${deal.dealNumber} funded`,
      message: `Financing has been finalized for deal ${deal.dealNumber}.`,
      actionUrl: `/deals/${deal.id}`,
      isRead: false,
    })),
  });

  await prisma.report.create({
    data: {
      tenantId: tenant.id,
      name: 'Monthly Sales Performance',
      type: ReportType.SALES,
      parameters: {
        comparisonPeriod: 'monthly',
        trailingMonths: 12,
      },
      schedule: '0 7 1 * *',
      createdById: adminUser.id,
    },
  });

  await prisma.systemSetting.createMany({
    data: [
      {
        tenantId: tenant.id,
        key: 'docFee',
        value: { amount: 489, currency: 'USD' },
        updatedById: adminUser.id,
      },
      {
        tenantId: tenant.id,
        key: 'defaultLender',
        value: { name: 'Sunrise Credit Union', contact: 'lenders@sunrisemotors.demo' },
        updatedById: adminUser.id,
      },
    ],
  });

  if (deals.length > 0) {
    const sampleDeal = deals[0];
    const fiManagerId = sampleDeal.financeManagerId ?? adminUser.id;
    const sellingPrice = sampleDeal.vehiclePrice ?? '0';
    const tradeValue = sampleDeal.tradeAllowance ?? '0';
    const tradePayoff = sampleDeal.tradePayoff ?? '0';
    const netTrade = tradeValue && tradePayoff ? (Number(tradeValue) - Number(tradePayoff)).toFixed(2) : null;
    const cashDown = sampleDeal.downPayment ?? '0';
    const amountFinanced = sampleDeal.amountFinanced ?? '0';
    const monthlyPayment = sampleDeal.monthlyPayment ?? '0';
    const apr = sampleDeal.apr ?? '0';
    const totalFiGross = sampleDeal.backEndGross ?? '0';

    const baseFiProducts = [
      {
        name: 'Vehicle Service Contract',
        price: 1599,
        cost: 899,
        termMonths: 72,
      },
      {
        name: 'GAP Insurance',
        price: 799,
        cost: 299,
      },
    ];

    const dealJacket = await prisma.dealJacket.create({
      data: {
        tenantId: tenant.id,
        dealNumber: `${sampleDeal.dealNumber}-FI`,
        customerId: sampleDeal.customerId,
        vehicleId: sampleDeal.vehicleId,
        salespersonId: sampleDeal.salesPersonId,
        fiManagerId,
        sellingPrice,
        tradeValue: tradeValue ?? undefined,
        tradePayoff: tradePayoff ?? undefined,
        netTrade: netTrade ?? undefined,
        cashDown,
        amountFinanced,
        lenderId: 'sunrise-credit-union',
        apr: apr ?? undefined,
        term: sampleDeal.term ?? 72,
        monthlyPayment: monthlyPayment ?? undefined,
        fiProducts: baseFiProducts,
        totalFiGross: totalFiGross ?? undefined,
        status: 'Contracted',
        dealDate: sampleDeal.dealDate,
        contractDate: sampleDeal.contractDate ?? sampleDeal.dealDate,
        fundedDate: sampleDeal.fundedDate ?? sampleDeal.dealDate,
        deliveredDate: sampleDeal.deliveryDate ?? sampleDeal.dealDate,
      },
    });

    const documentBase = (process.env.S3_CLOUDFRONT_URL ?? '').replace(/\/$/, '');
    const sampleDocuments = [
      {
        type: 'contract',
        category: 'Contracts',
        name: 'Retail Installment Contract',
        path: '/seed/retail-installment-contract.pdf',
        size: 358_120,
      },
      {
        type: 'credit',
        category: 'Credit',
        name: 'Credit Application',
        path: '/seed/credit-application.pdf',
        size: 287_950,
      },
    ];

    for (const doc of sampleDocuments) {
      const url = documentBase
        ? `${documentBase}${doc.path}`
        : `https://files.autolytiq.dev${doc.path}`;
      await prisma.dealDocument.create({
        data: {
          dealId: dealJacket.id,
          type: doc.type,
          category: doc.category,
          name: doc.name,
          fileName: doc.name.replace(/\s+/g, '-').toLowerCase(),
          fileUrl: url,
          mimeType: 'application/pdf',
          fileSize: doc.size,
          uploadedBy: adminUser.id,
        },
      });
    }

    const statusScenarios: Array<{
      status: DealStatus;
      contractOffsetDays?: number;
      fundedOffsetDays?: number;
      deliveredOffsetDays?: number;
    }> = [
      { status: DealStatus.DRAFT },
      { status: DealStatus.PENDING },
      { status: DealStatus.SUBMITTED },
      { status: DealStatus.APPROVED, contractOffsetDays: 2 },
      { status: DealStatus.FUNDED, contractOffsetDays: 2, fundedOffsetDays: 6 },
      { status: DealStatus.DELIVERED, contractOffsetDays: 2, fundedOffsetDays: 6, deliveredOffsetDays: 9 },
    ];

    const scenarioBaseDate = new Date();

    for (const [index, scenario] of statusScenarios.entries()) {
      const dealDate = subDays(scenarioBaseDate, (statusScenarios.length - index) * 3);
      const contractDate =
        scenario.contractOffsetDays !== undefined ? addDays(dealDate, scenario.contractOffsetDays) : null;
      const fundedDate =
        scenario.fundedOffsetDays !== undefined ? addDays(dealDate, scenario.fundedOffsetDays) : null;
      const deliveredDate =
        scenario.deliveredOffsetDays !== undefined ? addDays(dealDate, scenario.deliveredOffsetDays) : null;

      const scenarioFiProducts =
        scenario.status === DealStatus.DRAFT || scenario.status === DealStatus.PENDING ? [] : baseFiProducts;

      const displayStatus = `${scenario.status.charAt(0)}${scenario.status.slice(1).toLowerCase()}`;

      await prisma.dealJacket.upsert({
        where: { dealNumber: `DEMO-${scenario.status}` },
        update: {
          sellingPrice,
          tradeValue: tradeValue ?? undefined,
          tradePayoff: tradePayoff ?? undefined,
          netTrade: netTrade ?? undefined,
          cashDown,
          amountFinanced,
          lenderId: scenario.status === DealStatus.DRAFT ? null : 'sunrise-credit-union',
          apr: apr ?? undefined,
          term: sampleDeal.term ?? 72,
          monthlyPayment: monthlyPayment ?? undefined,
          fiProducts: scenarioFiProducts,
          totalFiGross: scenarioFiProducts.length ? totalFiGross ?? undefined : '0',
          status: displayStatus,
          dealDate,
          contractDate: contractDate ?? undefined,
          fundedDate: fundedDate ?? undefined,
          deliveredDate: deliveredDate ?? undefined,
          salespersonId: sampleDeal.salesPersonId,
          fiManagerId,
          customerId: sampleDeal.customerId,
          vehicleId: sampleDeal.vehicleId,
        },
        create: {
          tenantId: tenant.id,
          dealNumber: `DEMO-${scenario.status}`,
          customerId: sampleDeal.customerId,
          vehicleId: sampleDeal.vehicleId,
          salespersonId: sampleDeal.salesPersonId,
          fiManagerId,
          sellingPrice,
          tradeValue: tradeValue ?? undefined,
          tradePayoff: tradePayoff ?? undefined,
          netTrade: netTrade ?? undefined,
          cashDown,
          amountFinanced,
          lenderId: scenario.status === DealStatus.DRAFT ? null : 'sunrise-credit-union',
          apr: apr ?? undefined,
          term: sampleDeal.term ?? 72,
          monthlyPayment: monthlyPayment ?? undefined,
          fiProducts: scenarioFiProducts,
          totalFiGross: scenarioFiProducts.length ? totalFiGross ?? undefined : '0',
          status: displayStatus,
          dealDate,
          contractDate: contractDate ?? undefined,
          fundedDate: fundedDate ?? undefined,
          deliveredDate: deliveredDate ?? undefined,
        },
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: adminUser.id,
      action: 'SEED',
      resource: 'demo-dataset',
      details: {
        description: 'Generated demo dealership data for analytics and testing',
        customers: customers.length,
        deals: deals.length,
      },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
  });

  console.info('Seed complete.');
  console.info(`Developer login: ${DEVELOPER_EMAIL} / ${DEVELOPER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
