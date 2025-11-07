/**
 * Customer Seeder
 * Creates customers with interactions, leads, activities, appointments, and communications
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import {
  PreferredContactMethod,
  LeadSource,
  LeadStatus,
  InteractionType,
  InteractionDirection,
  LeadPriority,
  ActivityStatus,
  ActivityType,
  AppointmentStatus,
  AppointmentType,
  CommunicationType,
  CommunicationDirection,
  CommunicationStatus,
} from '@prisma/client';

interface SeedCustomersResult {
  customers: Awaited<ReturnType<typeof PrismaClient.prototype.customer.create>>[];
  leads: Awaited<ReturnType<typeof PrismaClient.prototype.lead.create>>[];
  activities: Awaited<ReturnType<typeof PrismaClient.prototype.activity.create>>[];
  appointments: Awaited<ReturnType<typeof PrismaClient.prototype.appointment.create>>[];
  communications: Awaited<ReturnType<typeof PrismaClient.prototype.communication.create>>[];
}

/**
 * Seed customers and related CRM data
 */
export async function seedCustomers(
  prisma: PrismaClient,
  tenant: { id: string },
  store: { id: string },
  users: Awaited<ReturnType<typeof PrismaClient.prototype.user.findMany>>
): Promise<SeedCustomersResult> {
  console.log('\n👥 Seeding customers and CRM data...');

  const salesTeam = users.filter((user) => user.role === 'SALES');
  const selectSalesUser = () => (salesTeam.length ? faker.helpers.arrayElement(salesTeam) : users[0]);

  // Create customers
  console.log('  → Creating customers...');
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
        assignedToUserId: selectSalesUser().id,
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
          userId: selectSalesUser().id,
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
  console.log(`  ✓ Created ${customers.length} customers`);

  // Create leads
  console.log('  → Creating leads...');
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
  console.log(`  ✓ Created ${leads.length} leads`);

  // Create lead scores
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

  // Create activities
  console.log('  → Creating activities...');
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
  console.log(`  ✓ Created ${activities.length} activities`);

  // Create appointments
  console.log('  → Creating appointments...');
  const appointments = [] as Awaited<ReturnType<typeof prisma.appointment.create>>[];
  for (let i = 0; i < 8; i += 1) {
    const lead = faker.helpers.arrayElement(leads);
    const assignedUser = selectSalesUser();
    const startAt = faker.date.soon({ days: 30 });
    const status = faker.helpers.arrayElement([
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.IN_PROGRESS,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.NO_SHOW,
      AppointmentStatus.CANCELLED,
    ] as AppointmentStatus[]);

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
  console.log(`  ✓ Created ${appointments.length} appointments`);

  // Create communications
  console.log('  → Creating communications...');
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
  console.log(`  ✓ Created ${communications.length} communications`);

  // Create email templates
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

  // Create SMS templates
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

  // Create automations
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

  // Update lead activity timestamps
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

  console.log('  ✓ Customer seeding complete');

  return {
    customers,
    leads,
    activities,
    appointments,
    communications,
  };
}
