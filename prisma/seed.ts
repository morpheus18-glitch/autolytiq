import {
  PrismaClient,
  TenantPlan,
  TenantStatus,
  UserRole,
  LeadStatus,
  LeadSource,
  PreferredContactMethod,
  VehicleStatus,
  VehicleType,
  FuelType,
  InteractionType,
  InteractionDirection,
  CustomerVehicleStatus,
  VehicleHistoryType,
  DealStatus,
  DealType,
  DealDocumentType,
  CommissionStatus,
  ReportType,
  NotificationType,
  AuditAction,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = 'DealerPass123!';
const SALT_ROUNDS = 10;

faker.seed(42);

const manufacturerCatalog = [
  { make: 'Toyota', models: ['Camry', 'RAV4', 'Highlander', 'Corolla'] },
  { make: 'Ford', models: ['F-150', 'Explorer', 'Mustang', 'Escape'] },
  { make: 'Chevrolet', models: ['Silverado', 'Tahoe', 'Equinox', 'Malibu'] },
  { make: 'Honda', models: ['Civic', 'CR-V', 'Pilot', 'Accord'] },
  { make: 'BMW', models: ['X5', '3 Series', '5 Series', 'X3'] },
  { make: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'GLC', 'GLE'] },
];

const tenantSeeds = [
  {
    name: 'Northwind Auto Group',
    subdomain: 'northwind',
    plan: TenantPlan.ENTERPRISE,
    status: TenantStatus.ACTIVE,
    billingEmail: 'finance@northwind-auto.com',
  },
  {
    name: 'Velocity Motors',
    subdomain: 'velocity',
    plan: TenantPlan.PROFESSIONAL,
    status: TenantStatus.ACTIVE,
    billingEmail: 'billing@velocitymotors.com',
  },
  {
    name: 'Sunrise Luxury Auto',
    subdomain: 'sunrise',
    plan: TenantPlan.BASIC,
    status: TenantStatus.ACTIVE,
    billingEmail: 'accounting@sunriseauto.com',
  },
];

async function cleanupDatabase() {
  await prisma.systemSetting.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.commission.deleteMany({});
  await prisma.journalEntryLine.deleteMany({});
  await prisma.journalEntry.deleteMany({});
  await prisma.dealDocument.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.vehicleHistory.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.customerInteraction.deleteMany({});
  await prisma.customerVehicle.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
}

function randomFrom<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function generateVin(): string {
  const transliteration: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0,
  };

  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const allowed = 'ABCDEFGHJKLMNPRSTUVWXYZ1234567890';
  const chars: string[] = [];

  for (let i = 0; i < 17; i++) {
    chars[i] = allowed[Math.floor(Math.random() * allowed.length)];
  }

  let sum = 0;
  for (let i = 0; i < chars.length; i++) {
    sum += (transliteration[chars[i]] ?? 0) * weights[i];
  }

  const checkDigitValue = sum % 11;
  chars[8] = checkDigitValue === 10 ? 'X' : checkDigitValue.toString();
  return chars.join('');
}

async function seedUsers(tenantId: string, passwordHash: string) {
  const roleDistribution: UserRole[] = [
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MANAGER,
    UserRole.SALES,
    UserRole.SALES,
    UserRole.SALES,
    UserRole.SALES,
    UserRole.FINANCE,
    UserRole.FINANCE,
    UserRole.SERVICE,
  ];

  const users = [];

  for (let i = 0; i < roleDistribution.length; i++) {
    const role = roleDistribution[i];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const user = await prisma.user.create({
      data: {
        tenant: { connect: { id: tenantId } },
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role,
        permissions: [],
        isActive: true,
        lastLoginAt: faker.date.recent({ days: 15 }),
      },
    });

    users.push(user);
  }

  return users;
}

async function seedCustomers(tenantId: string, salesUsers: string[]) {
  const customers = [];

  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const leadStatus = randomFrom(Object.values(LeadStatus));
    const assignedTo = randomFrom(salesUsers);

    const customer = await prisma.customer.create({
      data: {
        tenant: { connect: { id: tenantId } },
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.phone.number('###-###-####'),
        mobile: faker.phone.number('###-###-####'),
        dateOfBirth: faker.date.birthdate({ min: 1955, max: 2005, mode: 'year' }),
        driversLicenseNumber: faker.string.alphanumeric({ length: 12 }).toUpperCase(),
        driversLicenseState: faker.location.state({ abbreviated: true }),
        ssn: faker.string.numeric(9),
        addressStreet: faker.location.streetAddress(),
        addressCity: faker.location.city(),
        addressState: faker.location.state({ abbreviated: true }),
        addressZip: faker.location.zipCode('#####'),
        addressCountry: 'USA',
        preferredContactMethod: randomFrom(Object.values(PreferredContactMethod)),
        leadSource: randomFrom(Object.values(LeadSource)),
        leadStatus,
        leadScore: faker.number.int({ min: 10, max: 100 }),
        creditScore: faker.number.int({ min: 550, max: 820 }),
        assignedToUser: { connect: { id: assignedTo } },
        tags: faker.helpers.arrayElements(['EV', 'Luxury', 'SUV', 'Truck', 'Finance', 'Cash'], { min: 1, max: 3 }),
        notes: faker.lorem.sentences({ min: 2, max: 4 }),
        lifetimeValue: new Decimal(0),
      },
    });

    customers.push(customer);
  }

  // Ensure specific scenarios
  await prisma.customer.update({
    where: { id: customers[0].id },
    data: {
      leadStatus: LeadStatus.HOT,
      leadScore: 98,
      interactions: {
        create: {
          tenantId,
          userId: salesUsers[0],
          type: 'CALL',
          direction: 'OUTBOUND',
          subject: 'Initial Qualification Call',
          notes: 'Customer interested in luxury SUV. Scheduled test drive.',
          scheduledAt: faker.date.soon({ days: 3 }),
        },
      },
    },
  });

  return customers;
}

async function seedCustomerVehicles(tenantId: string, customers: { id: string }[]) {
  const customerVehicles = [];

  for (const customer of customers) {
    if (Math.random() > 0.6) {
      continue;
    }

    const ownedVehicleCount = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < ownedVehicleCount; i++) {
      const catalogEntry = randomFrom(manufacturerCatalog);
      const model = randomFrom(catalogEntry.models);

      const vehicle = await prisma.customerVehicle.create({
        data: {
          tenant: { connect: { id: tenantId } },
          customer: { connect: { id: customer.id } },
          vin: generateVin(),
          year: faker.number.int({ min: 2008, max: 2023 }),
          make: catalogEntry.make,
          model,
          trim: faker.vehicle.model(),
          purchaseDate: faker.date.past({ years: 5 }),
          purchasePrice: new Decimal(faker.number.int({ min: 6000, max: 45000 })),
          currentMileage: faker.number.int({ min: 20000, max: 120000 }),
          status: randomFrom(Object.values(CustomerVehicleStatus)),
          notes: faker.lorem.sentence(),
        },
      });

      customerVehicles.push(vehicle);
    }
  }

  return customerVehicles;
}

async function seedInventory(tenantId: string) {
  const vehicles = [];

  for (let i = 0; i < 30; i++) {
    const catalogEntry = randomFrom(manufacturerCatalog);
    const model = randomFrom(catalogEntry.models);
    const year = faker.number.int({ min: 2019, max: 2024 });
    const received = faker.date.past({ years: 1 });
    const daysInStock = Math.max(0, Math.floor((Date.now() - received.getTime()) / (1000 * 60 * 60 * 24)));

    const status = i < 5 ? VehicleStatus.SOLD : randomFrom(Object.values(VehicleStatus));

    const vehicle = await prisma.vehicle.create({
      data: {
        tenant: { connect: { id: tenantId } },
        stockNumber: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.number.int({ min: 1000, max: 9999 })}`,
        vin: generateVin(),
        type: randomFrom(Object.values(VehicleType)),
        year,
        make: catalogEntry.make,
        model,
        trim: faker.vehicle.model(),
        exteriorColor: faker.vehicle.color(),
        interiorColor: faker.vehicle.color(),
        mileage: status === VehicleStatus.NEW ? 0 : faker.number.int({ min: 500, max: 75000 }),
        engineType: faker.vehicle.type(),
        transmission: faker.helpers.arrayElement(['Automatic', 'Manual', 'CVT']),
        drivetrain: faker.helpers.arrayElement(['AWD', 'FWD', 'RWD', '4WD']),
        fuelType: randomFrom(Object.values(FuelType)),
        msrp: new Decimal(faker.number.int({ min: 25000, max: 85000 })),
        invoiceCost: new Decimal(faker.number.int({ min: 20000, max: 70000 })),
        listPrice: new Decimal(faker.number.int({ min: 22000, max: 90000 })),
        specialPrice: Math.random() > 0.5 ? new Decimal(faker.number.int({ min: 20000, max: 88000 })) : null,
        status,
        location: `Lot ${faker.helpers.arrayElement(['A', 'B', 'C'])}-${faker.number.int({ min: 1, max: 40 })}`,
        dateReceived: received,
        dateSold: status === VehicleStatus.SOLD ? faker.date.recent({ days: 60 }) : null,
        daysInStock,
        images: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => faker.image.urlLoremFlickr({ category: 'car' })),
        features: faker.helpers.arrayElements(['Leather Seats', 'Navigation', 'Bluetooth', 'Backup Camera', 'Heated Seats'], { min: 2, max: 5 }),
        certificationNumber: Math.random() > 0.7 ? faker.string.alphanumeric({ length: 10 }).toUpperCase() : null,
        floorPlanId: faker.string.alphanumeric({ length: 12 }).toUpperCase(),
        floorPlanDate: faker.date.past({ years: 1 }),
        floorPlanInterestRate: new Decimal(faker.number.float({ min: 2.5, max: 8, fractionDigits: 2 })),
        notes: faker.lorem.sentences({ min: 1, max: 3 }),
      },
    });

    vehicles.push(vehicle);
  }

  // Guarantee aged inventory scenario
  await prisma.vehicle.updateMany({
    where: { tenantId, status: VehicleStatus.AVAILABLE },
    data: { daysInStock: 65 },
  });

  return vehicles;
}

async function seedVehicleHistories(tenantId: string, vehicles: { id: string }[]) {
  for (const vehicle of vehicles.slice(0, 10)) {
    await prisma.vehicleHistory.create({
      data: {
        tenant: { connect: { id: tenantId } },
        vehicle: { connect: { id: vehicle.id } },
        type: randomFrom([
          VehicleHistoryType.SERVICE,
          VehicleHistoryType.INSPECTION,
          VehicleHistoryType.OWNERSHIP,
        ]),
        date: faker.date.past({ years: 2 }),
        description: faker.lorem.sentences({ min: 1, max: 2 }),
        documentUrl: faker.internet.url(),
      },
    });
  }
}

async function seedDeals(
  tenantId: string,
  customers: { id: string; assignedToUserId: string | null }[],
  vehicles: { id: string }[],
  users: { id: string; role: UserRole }[],
  customerVehicles: { id: string; tenantId: string }[],
) {
  const deals = [];

  for (let i = 0; i < 20; i++) {
    const customer = randomFrom(customers);
    const salesPerson = randomFrom(users.filter((user) => user.role === UserRole.SALES || user.role === UserRole.MANAGER));
    const financeManager = randomFrom(users.filter((user) => user.role === UserRole.FINANCE));
    const vehicle = vehicles[i % vehicles.length];

    const vehiclePrice = new Decimal(faker.number.int({ min: 20000, max: 90000 }));
    const discount = new Decimal(faker.number.int({ min: 0, max: 5000 }));
    const netVehiclePrice = vehiclePrice.minus(discount);
    const tradeIn = Math.random() > 0.5 ? randomFrom(customerVehicles) : null;
    const tradeAllowance = tradeIn ? new Decimal(faker.number.int({ min: 2000, max: 25000 })) : null;
    const tradePayoff = tradeIn ? new Decimal(faker.number.int({ min: 1000, max: 20000 })) : null;
    const tradeEquity = tradeAllowance && tradePayoff ? tradeAllowance.minus(tradePayoff) : null;
    const downPayment = new Decimal(faker.number.int({ min: 2000, max: 10000 }));
    const financedBeforeSanity = netVehiclePrice.minus(downPayment).minus(tradeEquity ?? new Decimal(0));
    const amountFinanced = financedBeforeSanity.greaterThan(0) ? financedBeforeSanity : new Decimal(0);
    const apr = new Decimal(faker.number.float({ min: 2.9, max: 8.5, fractionDigits: 2 }));
    const term = faker.number.int({ min: 24, max: 84 });
    const monthlyPayment = amountFinanced.greaterThan(0)
      ? amountFinanced.dividedBy(term)
      : new Decimal(0);
    const frontEndGross = netVehiclePrice.minus(new Decimal(faker.number.int({ min: 15000, max: 50000 })));
    const backEndGross = new Decimal(faker.number.int({ min: 500, max: 2500 }));
    const totalGross = frontEndGross.plus(backEndGross);

    const deal = await prisma.deal.create({
      data: {
        tenant: { connect: { id: tenantId } },
        dealNumber: `D-${faker.number.int({ min: 1000, max: 9999 })}`,
        customer: { connect: { id: customer.id } },
        vehicle: { connect: { id: vehicle.id } },
        salesPerson: { connect: { id: salesPerson.id } },
        financeManager: { connect: { id: financeManager.id } },
        dealType: randomFrom(Object.values(DealType)),
        status: randomFrom(Object.values(DealStatus)),
        vehiclePrice,
        discount,
        netVehiclePrice,
        tradeVehicle: tradeIn ? { connect: { id: tradeIn.id } } : undefined,
        tradeAllowance,
        tradePayoff,
        tradeEquity,
        downPayment,
        amountFinanced,
        apr,
        term,
        monthlyPayment,
        lenderName: faker.company.name(),
        lenderRate: new Decimal(faker.number.float({ min: 2.5, max: 12, fractionDigits: 2 })),
        dealerReserve: new Decimal(faker.number.int({ min: 200, max: 2500 })),
        docFee: new Decimal(595),
        registrationFee: new Decimal(faker.number.int({ min: 100, max: 500 })),
        salesTax: new Decimal(faker.number.int({ min: 500, max: 5000 })),
        otherFees: { acquisition: faker.number.int({ min: 100, max: 450 }) },
        warrantyProduct: faker.helpers.arrayElement(['Platinum Coverage', 'Extended Warranty', null]),
        warrantyCost: new Decimal(faker.number.int({ min: 500, max: 3000 })),
        gapInsurance: Math.random() > 0.5,
        gapCost: new Decimal(faker.number.int({ min: 300, max: 1200 })),
        maintenancePlan: Math.random() > 0.5,
        maintenanceCost: new Decimal(faker.number.int({ min: 400, max: 1500 })),
        otherProducts: { tireProtection: faker.number.int({ min: 150, max: 500 }) },
        frontEndGross,
        backEndGross,
        totalGross,
        packAmount: new Decimal(faker.number.int({ min: 0, max: 1200 })),
        dealDate: faker.date.recent({ days: 120 }),
        fundedDate: Math.random() > 0.5 ? faker.date.recent({ days: 60 }) : null,
        deliveryDate: faker.date.recent({ days: 90 }),
        notes: faker.lorem.paragraph(),
      },
      include: {
        commissions: true,
      },
    });

    deals.push(deal);

    await prisma.dealDocument.create({
      data: {
        tenant: { connect: { id: tenantId } },
        deal: { connect: { id: deal.id } },
        type: randomFrom(Object.values(DealDocumentType)),
        name: `${deal.dealNumber}-contract.pdf`,
        fileUrl: faker.internet.url(),
        signedAt: Math.random() > 0.4 ? faker.date.recent({ days: 20 }) : null,
        uploadedBy: salesPerson.id,
      },
    });
  }

  // Specific scenario adjustments
  const pendingDeal = deals[0];
  await prisma.deal.update({
    where: { id: pendingDeal.id },
    data: { status: DealStatus.PENDING, totalGross: new Decimal(6000) },
  });

  const fullProductsDeal = deals[1];
  await prisma.deal.update({
    where: { id: fullProductsDeal.id },
    data: {
      status: DealStatus.DELIVERED,
      gapInsurance: true,
      maintenancePlan: true,
      warrantyProduct: 'Elite Protection',
      warrantyCost: new Decimal(2500),
      otherProducts: { tireProtection: 299, dingShield: 199 },
    },
  });

  const negativeEquityDeal = deals[2];
  await prisma.deal.update({
    where: { id: negativeEquityDeal.id },
    data: {
      tradeEquity: new Decimal(-1500),
      tradeAllowance: new Decimal(8000),
      tradePayoff: new Decimal(9500),
    },
  });

  const voidedDeal = deals[3];
  await prisma.deal.update({
    where: { id: voidedDeal.id },
    data: { status: DealStatus.CANCELLED },
  });

  return deals;
}

async function seedInteractions(tenantId: string, customers: { id: string; assignedToUserId: string | null }[]) {
  for (const customer of customers) {
    const interactionCount = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < interactionCount; i++) {
      await prisma.customerInteraction.create({
        data: {
          tenant: { connect: { id: tenantId } },
          customer: { connect: { id: customer.id } },
          user: { connect: { id: customer.assignedToUserId! } },
          type: randomFrom(Object.values(InteractionType)),
          direction: randomFrom(Object.values(InteractionDirection)),
          subject: faker.lorem.words({ min: 3, max: 6 }),
          notes: faker.lorem.paragraph(),
          duration: faker.number.int({ min: 5, max: 40 }),
          scheduledAt: Math.random() > 0.6 ? faker.date.soon({ days: 14 }) : null,
          completedAt: Math.random() > 0.3 ? faker.date.recent({ days: 30 }) : null,
        },
      });
    }
  }
}

async function seedChartOfAccounts(tenantId: string) {
  const accounts = [
    {
      accountNumber: '1000',
      accountName: 'Assets',
      accountType: 'ASSET',
      normalBalance: 'DEBIT',
      children: [
        { accountNumber: '1010', accountName: 'Cash', accountType: 'ASSET', normalBalance: 'DEBIT' },
        { accountNumber: '1020', accountName: 'Inventory', accountType: 'ASSET', normalBalance: 'DEBIT' },
        { accountNumber: '1030', accountName: 'Accounts Receivable', accountType: 'ASSET', normalBalance: 'DEBIT' },
      ],
    },
    {
      accountNumber: '2000',
      accountName: 'Liabilities',
      accountType: 'LIABILITY',
      normalBalance: 'CREDIT',
      children: [
        { accountNumber: '2010', accountName: 'Floor Plan Payable', accountType: 'LIABILITY', normalBalance: 'CREDIT' },
        { accountNumber: '2020', accountName: 'Accounts Payable', accountType: 'LIABILITY', normalBalance: 'CREDIT' },
      ],
    },
    {
      accountNumber: '3000',
      accountName: 'Equity',
      accountType: 'EQUITY',
      normalBalance: 'CREDIT',
      children: [
        { accountNumber: '3010', accountName: 'Owner Equity', accountType: 'EQUITY', normalBalance: 'CREDIT' },
      ],
    },
    {
      accountNumber: '4000',
      accountName: 'Revenue',
      accountType: 'REVENUE',
      normalBalance: 'CREDIT',
      children: [
        { accountNumber: '4010', accountName: 'Vehicle Sales', accountType: 'REVENUE', normalBalance: 'CREDIT' },
        { accountNumber: '4020', accountName: 'F&I Income', accountType: 'REVENUE', normalBalance: 'CREDIT' },
      ],
    },
    {
      accountNumber: '5000',
      accountName: 'Expenses',
      accountType: 'EXPENSE',
      normalBalance: 'DEBIT',
      children: [
        { accountNumber: '5010', accountName: 'Cost of Goods Sold', accountType: 'EXPENSE', normalBalance: 'DEBIT' },
        { accountNumber: '5020', accountName: 'Advertising Expense', accountType: 'EXPENSE', normalBalance: 'DEBIT' },
      ],
    },
  ];

  const parentIds: Record<string, string> = {};

  for (const account of accounts) {
    const parent = await prisma.gLAccount.create({
      data: {
        tenant: { connect: { id: tenantId } },
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        accountType: account.accountType as any,
        normalBalance: account.normalBalance as any,
        isActive: true,
      },
    });

    parentIds[account.accountNumber] = parent.id;

    for (const child of account.children) {
      const childAccount = await prisma.gLAccount.create({
        data: {
          tenant: { connect: { id: tenantId } },
          accountNumber: child.accountNumber,
          accountName: child.accountName,
          accountType: child.accountType as any,
          normalBalance: child.normalBalance as any,
          parentAccount: { connect: { id: parent.id } },
          isActive: true,
        },
      });

      parentIds[child.accountNumber] = childAccount.id;
    }
  }

  return parentIds;
}

async function seedJournalEntries(tenantId: string, deals: { id: string; totalGross: Decimal }[], accounts: Record<string, string>, users: { id: string }[]) {
  const poster = users.find((user) => true)!;

  for (const deal of deals.slice(0, 10)) {
    const entry = await prisma.journalEntry.create({
      data: {
        tenant: { connect: { id: tenantId } },
        entryNumber: `JE-${faker.number.int({ min: 1000, max: 9999 })}`,
        deal: { connect: { id: deal.id } },
        entryDate: faker.date.recent({ days: 60 }),
        description: 'Sales recognition entry',
        status: Math.random() > 0.2 ? 'POSTED' : 'DRAFT',
        postedBy: { connect: { id: poster.id } },
        postedAt: faker.date.recent({ days: 30 }),
      },
    });

    const grossAmount = deal.totalGross ?? new Decimal(0);
    const debitAmount = grossAmount.abs().plus(new Decimal(500));

    await prisma.journalEntryLine.create({
      data: {
        tenant: { connect: { id: tenantId } },
        journalEntry: { connect: { id: entry.id } },
        glAccount: { connect: { id: accounts['1010'] } },
        type: 'DEBIT',
        amount: debitAmount,
        description: 'Cash received from sale',
      },
    });

    await prisma.journalEntryLine.create({
      data: {
        tenant: { connect: { id: tenantId } },
        journalEntry: { connect: { id: entry.id } },
        glAccount: { connect: { id: accounts['4010'] } },
        type: 'CREDIT',
        amount: debitAmount,
        description: 'Recognize vehicle sales revenue',
      },
    });
  }
}

async function seedCommissions(tenantId: string, deals: { id: string; salesPersonId: string }[], users: { id: string }[]) {
  for (const deal of deals.slice(0, 15)) {
    const commissionAmount = new Decimal(faker.number.int({ min: 250, max: 2500 }));

    await prisma.commission.create({
      data: {
        tenant: { connect: { id: tenantId } },
        deal: { connect: { id: deal.id } },
        user: { connect: { id: deal.salesPersonId } },
        commissionType: randomFrom(['FRONT', 'BACK', 'BONUS', 'SPIFF'] as const),
        amount: commissionAmount,
        rate: new Decimal(faker.number.float({ min: 0.01, max: 0.12, fractionDigits: 2 })),
        status: randomFrom(Object.values(CommissionStatus)),
        paidDate: Math.random() > 0.5 ? faker.date.recent({ days: 30 }) : null,
        notes: faker.lorem.sentence(),
      },
    });
  }

  // Commission scenarios
  const paidDeal = deals[0];
  await prisma.commission.updateMany({
    where: { tenantId, dealId: paidDeal.id },
    data: { status: CommissionStatus.PAID, paidDate: faker.date.recent({ days: 5 }) },
  });

  const chargebackDeal = deals[3];
  await prisma.commission.create({
    data: {
      tenant: { connect: { id: tenantId } },
      deal: { connect: { id: chargebackDeal.id } },
      user: { connect: { id: chargebackDeal.salesPersonId } },
      commissionType: 'FRONT',
      amount: new Decimal(750),
      rate: new Decimal(0.04),
      status: CommissionStatus.CHARGEBACK,
      notes: 'Voided deal chargeback.',
    },
  });
}

async function seedReportsAndNotifications(tenantId: string, users: { id: string }[]) {
  const admin = users[0];

  await prisma.report.createMany({
    data: [
      {
        tenantId,
        name: 'Monthly Sales Performance',
        type: ReportType.SALES,
        parameters: { interval: 'monthly' },
        schedule: '0 7 1 * *',
        lastRunAt: faker.date.recent({ days: 1 }),
        createdById: admin.id,
      },
      {
        tenantId,
        name: 'Inventory Aging',
        type: ReportType.INVENTORY,
        parameters: { minDays: 30 },
        schedule: '0 6 * * 1',
        lastRunAt: faker.date.recent({ days: 2 }),
        createdById: admin.id,
      },
    ],
  });

  await prisma.notification.createMany({
    data: users.slice(0, 5).map((user, index) => ({
      tenantId,
      userId: user.id,
      type: index % 2 === 0 ? NotificationType.DEAL_APPROVAL : NotificationType.FOLLOW_UP,
      title: index % 2 === 0 ? 'Pending Deal Approval' : 'Follow-up Reminder',
      message: faker.lorem.sentence(),
      actionUrl: '/dashboard',
      isRead: index % 3 === 0,
      readAt: index % 3 === 0 ? faker.date.recent({ days: 1 }) : null,
    })),
  });
}

async function seedAuditLogsAndSettings(tenantId: string, users: { id: string }[]) {
  await prisma.auditLog.create({
    data: {
      tenant: { connect: { id: tenantId } },
      user: { connect: { id: users[0].id } },
      entityType: 'Customer',
      entityId: 'seed-initial',
      action: AuditAction.CREATE,
      changes: { message: 'Initial tenant seed data created.' },
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
    },
  });

  await prisma.systemSetting.createMany({
    data: [
      {
        tenantId,
        key: 'sales_tax_rate',
        value: { rate: 0.0825 },
        updatedById: users[0].id,
      },
      {
        tenantId,
        key: 'default_timezone',
        value: { timezone: 'America/Chicago' },
        updatedById: users[0].id,
      },
    ],
  });
}

async function updateCustomerLifetimeValue(tenantId: string) {
  const aggregates = await prisma.deal.groupBy({
    by: ['customerId'],
    where: { tenantId, status: { in: [DealStatus.APPROVED, DealStatus.DELIVERED, DealStatus.FUNDED] } },
    _sum: { netVehiclePrice: true },
  });

  for (const aggregate of aggregates) {
    await prisma.customer.updateMany({
      where: { id: aggregate.customerId, tenantId },
      data: { lifetimeValue: aggregate._sum.netVehiclePrice ?? new Decimal(0) },
    });
  }
}

async function seedTenant(tenantId: string) {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  const users = await seedUsers(tenantId, passwordHash);
  const salesUsers = users.filter((user) => user.role === UserRole.SALES || user.role === UserRole.MANAGER).map((user) => user.id);
  const customers = await seedCustomers(tenantId, salesUsers);
  const customerVehicles = await seedCustomerVehicles(tenantId, customers);
  const vehicles = await seedInventory(tenantId);
  await seedVehicleHistories(tenantId, vehicles);
  const deals = await seedDeals(tenantId, customers, vehicles, users, customerVehicles);
  await seedInteractions(tenantId, customers);
  const accounts = await seedChartOfAccounts(tenantId);
  await seedJournalEntries(tenantId, deals, accounts, users);
  await seedCommissions(tenantId, deals, users);
  await seedReportsAndNotifications(tenantId, users);
  await seedAuditLogsAndSettings(tenantId, users);
  await updateCustomerLifetimeValue(tenantId);
}

async function main() {
  await cleanupDatabase();

  const tenants = await Promise.all(
    tenantSeeds.map((tenant) =>
      prisma.tenant.create({
        data: {
          name: tenant.name,
          subdomain: tenant.subdomain,
          plan: tenant.plan,
          status: tenant.status,
          settings: {
            branding: {
              primaryColor: faker.color.rgb(),
              secondaryColor: faker.color.rgb(),
            },
            features: {
              crm: true,
              desking: true,
              accounting: true,
            },
            limits: {
              users: 50,
              storageGb: 100,
            },
          },
          billingEmail: tenant.billingEmail,
          subscriptionEndsAt: faker.date.soon({ days: 180 }),
        },
      })
    )
  );

  for (const tenant of tenants) {
    await seedTenant(tenant.id);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seeding error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
