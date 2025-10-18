import bcrypt from 'bcrypt';
import {
  AccountType,
  CommissionStatus,
  CommissionType,
  CustomerVehicleStatus,
  DealDocumentType,
  DealStatus,
  DealType,
  FuelType,
  InteractionDirection,
  InteractionType,
  JournalStatus,
  LeadSource,
  LeadStatus,
  LineType,
  NormalBalance,
  NotificationType,
  PreferredContactMethod,
  PrismaClient,
  ReportType,
  TenantPlan,
  TenantStatus,
  UserRole,
  UserStatus,
  VehicleHistoryType,
  VehicleStatus,
  VehicleType,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import { addMonths, eachMonthOfInterval, endOfMonth, startOfMonth, subYears } from 'date-fns';

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
  await prisma.notification.deleteMany({ where: { tenantId } });
  await prisma.report.deleteMany({ where: { tenantId } });
  await prisma.commission.deleteMany({ where: { tenantId } });
  await prisma.journalEntryLine.deleteMany({ where: { tenantId } });
  await prisma.journalEntry.deleteMany({ where: { tenantId } });
  await prisma.dealDocument.deleteMany({ where: { tenantId } });
  await prisma.deal.deleteMany({ where: { tenantId } });
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
          LeadSource.SOCIAL_MEDIA,
        ]),
        leadStatus: faker.helpers.arrayElement([
          LeadStatus.HOT,
          LeadStatus.WARM,
          LeadStatus.COLD,
          LeadStatus.CUSTOMER,
          LeadStatus.QUALIFIED,
        ]),
        leadScore: faker.number.int({ min: 20, max: 95 }),
        creditScore: faker.number.int({ min: 580, max: 830 }),
        assignedToUserId: faker.helpers.arrayElement(salesTeam).id,
        tags: faker.helpers.arrayElements(['internet', 'trade-in', 'finance', 'lease', 'repeat'], { min: 1, max: 3 }),
        notes: faker.lorem.sentence({ min: 6, max: 12 }),
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

  const inventoryVehicles = [] as Awaited<ReturnType<typeof prisma.vehicle.create>>[];
  for (let i = 0; i < 75; i += 1) {
    const { msrp, invoiceCost, listPrice } = buildVehiclePrice();
    const received = faker.date.between({
      from: subYears(new Date(), 2),
      to: new Date(),
    });

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

      await prisma.dealDocument.create({
        data: {
          tenantId: tenant.id,
          dealId: deal.id,
          type: DealDocumentType.CONTRACT,
          name: 'Retail Installment Contract',
          fileUrl: `https://docs.example.com/deals/${deal.id}/contract.pdf`,
          signedAt: dealDate,
          uploadedBy: adminUser.id,
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
