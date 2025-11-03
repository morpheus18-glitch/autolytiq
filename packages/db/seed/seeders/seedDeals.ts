/**
 * Deal Seeder
 * Creates deals, worksheets, financing, deal jackets, and related financial records
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { addDays, addMonths, eachMonthOfInterval, endOfMonth, startOfMonth, subDays, subYears } from 'date-fns';
import {
  DealType,
  RetailDealStatus,
  VehicleStatus,
  CustomerVehicleStatus,
  VehicleHistoryType,
  JournalStatus,
  LineType,
  CommissionType,
  CommissionStatus,
  NotificationType,
  ReportType,
  DealStatus as WorksheetStatus,
  CounterOfferOutcome,
  CreditTier,
  ResidenceType,
  Recommendation,
  LeadSource,
  LeadStatus,
  PreferredContactMethod,
  FuelType,
  VehicleType,
  VehicleAcquisitionType,
} from '@prisma/client';

interface SeedDealsResult {
  deals: Awaited<ReturnType<typeof PrismaClient.prototype.deal.create>>[];
  workingDeal: Awaited<ReturnType<typeof PrismaClient.prototype.deal.upsert>>;
  worksheet: Awaited<ReturnType<typeof PrismaClient.prototype.dealWorksheet.upsert>>;
}

function createMonthlyPeriods() {
  const end = endOfMonth(new Date());
  const start = startOfMonth(subYears(end, 2));
  return eachMonthOfInterval({ start, end });
}

/**
 * Seed deals and financing data
 */
export async function seedDeals(
  prisma: PrismaClient,
  tenant: { id: string },
  store: { id: string },
  users: Awaited<ReturnType<typeof PrismaClient.prototype.user.findMany>>,
  customers: Awaited<ReturnType<typeof PrismaClient.prototype.customer.findMany>>,
  inventoryVehicles: Awaited<ReturnType<typeof PrismaClient.prototype.vehicle.findMany>>,
  glAccountMap: Record<string, string>,
  lenders: { sunriseCreditUnion: any; horizonAutoFinance: any }
): Promise<SeedDealsResult> {
  console.log('\n💰 Seeding deals and financing...');

  const salesTeam = users.filter((user) => user.role === 'SALES');
  const financeManagers = users.filter((user) => user.role === 'FINANCE');
  const adminUser = users.find((user) => user.isSuperAdmin) ?? users[0];

  const months = createMonthlyPeriods();
  let dealCounter = 1;
  const deals = [] as Awaited<ReturnType<typeof prisma.deal.create>>[];

  console.log('  → Creating historical deals...');
  const vehiclesCopy = [...inventoryVehicles];

  for (const month of months) {
    const dealsThisMonth = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < dealsThisMonth; i += 1) {
      const vehicle = vehiclesCopy.shift();
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
          status: RetailDealStatus.DELIVERED,
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
  console.log(`  ✓ Created ${deals.length} historical deals`);

  // Create notifications
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

  // Create report
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

  // Create system settings
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

  // Create deal jacket and documents for first deal
  if (deals.length > 0) {
    console.log('  → Creating deal jackets and documents...');
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
        lenderId: lenders.sunriseCreditUnion.id,
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

    // Create demo deal jackets for different statuses
    const statusScenarios: Array<{
      status: RetailDealStatus;
      contractOffsetDays?: number;
      fundedOffsetDays?: number;
      deliveredOffsetDays?: number;
    }> = [
      { status: RetailDealStatus.DRAFT },
      { status: RetailDealStatus.PENDING },
      { status: RetailDealStatus.SUBMITTED },
      { status: RetailDealStatus.APPROVED, contractOffsetDays: 2 },
      { status: RetailDealStatus.FUNDED, contractOffsetDays: 2, fundedOffsetDays: 6 },
      { status: RetailDealStatus.DELIVERED, contractOffsetDays: 2, fundedOffsetDays: 6, deliveredOffsetDays: 9 },
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
        scenario.status === RetailDealStatus.DRAFT || scenario.status === RetailDealStatus.PENDING ? [] : baseFiProducts;

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
          lenderId: scenario.status === RetailDealStatus.DRAFT ? null : lenders.sunriseCreditUnion.id,
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
          lenderId: scenario.status === RetailDealStatus.DRAFT ? null : lenders.sunriseCreditUnion.id,
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

  // Create working deal with worksheet
  console.log('  → Creating working deal with worksheet...');
  const primarySalesPerson = salesTeam[0] ?? adminUser;
  const financeManagerUser = financeManagers[0] ?? adminUser;
  const now = new Date();

  const camryVehicle = await prisma.vehicle.upsert({
    where: { id: 'desking-toyota-camry' },
    update: {
      tenantId: tenant.id,
      stockNumber: 'DESK-CAMRY-001',
      vin: '4T1C11AK7PU123456',
      type: VehicleType.NEW,
      year: now.getFullYear(),
      make: 'Toyota',
      model: 'Camry',
      trim: 'XSE',
      exteriorColor: 'Celestial Silver Metallic',
      interiorColor: 'Black SofTex',
      mileage: 12,
      engineType: '2.5L I4',
      transmission: '8-Speed Automatic',
      drivetrain: 'FWD',
      fuelType: FuelType.GASOLINE,
      msrp: new Prisma.Decimal('30950.00'),
      invoiceCost: new Prisma.Decimal('28420.00'),
      listPrice: new Prisma.Decimal('29950.00'),
      specialPrice: new Prisma.Decimal('28950.00'),
      status: VehicleStatus.AVAILABLE,
      location: 'Showroom - Front Row',
      dateReceived: subDays(now, 5),
      images: ['https://files.autolytiq.dev/seed/camry-front.jpg'],
      features: ['Panoramic Roof', 'Toyota Safety Sense 3.0', 'Heated Seats'],
      acquisitionType: VehicleAcquisitionType.NEW_INVENTORY,
      acquisitionSource: 'Toyota Motor Sales',
      acquisitionDate: subDays(now, 5),
      acquisitionCost: new Prisma.Decimal('28420.00'),
    },
    create: {
      id: 'desking-toyota-camry',
      tenantId: tenant.id,
      stockNumber: 'DESK-CAMRY-001',
      vin: '4T1C11AK7PU123456',
      type: VehicleType.NEW,
      year: now.getFullYear(),
      make: 'Toyota',
      model: 'Camry',
      trim: 'XSE',
      exteriorColor: 'Celestial Silver Metallic',
      interiorColor: 'Black SofTex',
      mileage: 12,
      engineType: '2.5L I4',
      transmission: '8-Speed Automatic',
      drivetrain: 'FWD',
      fuelType: FuelType.GASOLINE,
      msrp: new Prisma.Decimal('30950.00'),
      invoiceCost: new Prisma.Decimal('28420.00'),
      listPrice: new Prisma.Decimal('29950.00'),
      specialPrice: new Prisma.Decimal('28950.00'),
      status: VehicleStatus.AVAILABLE,
      location: 'Showroom - Front Row',
      dateReceived: subDays(now, 5),
      images: ['https://files.autolytiq.dev/seed/camry-front.jpg'],
      features: ['Panoramic Roof', 'Toyota Safety Sense 3.0', 'Heated Seats'],
      acquisitionType: VehicleAcquisitionType.NEW_INVENTORY,
      acquisitionSource: 'Toyota Motor Sales',
      acquisitionDate: subDays(now, 5),
      acquisitionCost: new Prisma.Decimal('28420.00'),
    },
  });

  const tierOneCustomer = await prisma.customer.upsert({
    where: { id: 'desking-tier1-customer' },
    update: {
      tenantId: tenant.id,
      firstName: 'Jordan',
      lastName: 'Ellis',
      email: 'jordan.ellis@sunrisemotors.demo',
      phone: '(555) 867-1000',
      mobile: '(555) 867-1000',
      leadSource: LeadSource.WEBSITE,
      leadStatus: LeadStatus.QUALIFIED,
      creditScore: 762,
      addressStreet: '415 Lakeshore Dr',
      addressCity: 'Chicago',
      addressState: 'IL',
      addressZip: '60611',
      preferredContactMethod: PreferredContactMethod.EMAIL,
      tags: ['desking', 'tier-1'],
      notes: 'Prime customer interested in Camry with technology package.',
    },
    create: {
      id: 'desking-tier1-customer',
      tenantId: tenant.id,
      firstName: 'Jordan',
      lastName: 'Ellis',
      email: 'jordan.ellis@sunrisemotors.demo',
      phone: '(555) 867-1000',
      mobile: '(555) 867-1000',
      leadSource: LeadSource.WEBSITE,
      leadStatus: LeadStatus.QUALIFIED,
      creditScore: 762,
      addressStreet: '415 Lakeshore Dr',
      addressCity: 'Chicago',
      addressState: 'IL',
      addressZip: '60611',
      preferredContactMethod: PreferredContactMethod.EMAIL,
      tags: ['desking', 'tier-1'],
      notes: 'Prime customer interested in Camry with technology package.',
    },
  });

  const tradeAllowance = 6000;
  const tradePayoff = 3200;
  const tradeEquity = tradeAllowance - tradePayoff;
  const cashDown = 3250;
  const amountFinanced = 27778.44;
  const aprRate = 0.0349;
  const termMonths = 72;
  const monthlyPayment = 428.17;

  const worksheetStructure = {
    pricing: {
      msrp: 30950,
      salePrice: 28950,
      dealerDiscounts: [
        { label: 'Spring Upgrade Event', amount: 1000 },
      ],
      accessories: [
        { label: 'All-weather mats', amount: 199 },
        { label: 'Ceramic coating', amount: 349 },
      ],
    },
    trade: {
      allowance: tradeAllowance,
      payoff: tradePayoff,
      equity: tradeEquity,
      description: '2018 Honda Accord EX-L, 65k miles, excellent condition',
    },
    cashDown: {
      customerCash: 2500,
      manufacturerRebate: 750,
      total: cashDown,
    },
    fees: [
      { code: 'DOC', label: 'Documentation Fee', amount: 347, taxable: true },
      { code: 'TITLE', label: 'Title Fee', amount: 150, taxable: false },
      { code: 'REG', label: 'Registration', amount: 220, taxable: false },
    ],
    taxes: [
      { jurisdiction: 'IL-COOK', rate: 0.0875, amount: 2167.44 },
    ],
    backendProducts: [
      { code: 'VSC', name: 'Vehicle Service Contract', price: 1295, cost: 795, termMonths: 72 },
      { code: 'GAP', name: 'GAP Protection', price: 699, cost: 299 },
    ],
    lender: {
      preferredLenderId: lenders.sunriseCreditUnion.id,
      backupLenderId: lenders.horizonAutoFinance.id,
      maxTerm: 72,
      targetPayment: 400,
    },
  };

  const worksheetTotals = {
    salePrice: 28950,
    tradeAllowance,
    tradePayoff,
    tradeEquity,
    cashDown,
    fees: 717,
    backendProducts: 1994,
    taxes: 2167.44,
    amountFinanced,
    dueAtSigning: cashDown,
    frontEndGross: 2450,
    backEndGross: 1194,
    financeReserve: 350,
    totalGross: 3994,
  };

  const paymentSummary = {
    amountFinanced,
    apr: aprRate,
    termMonths,
    monthlyPayment,
    dueAtSigning: cashDown,
  };

  const grossBreakdown = {
    frontEnd: 2450,
    backEnd: 1194,
    financeReserve: 350,
    docFee: 347,
    pack: 495,
    total: 3994,
  };

  const workingDeal = await prisma.deal.upsert({
    where: { id: 'desking-camry-deal' },
    update: {
      tenantId: tenant.id,
      dealNumber: 'DESK-1001',
      customerId: tierOneCustomer.id,
      vehicleId: camryVehicle.id,
      salesPersonId: primarySalesPerson.id,
      financeManagerId: financeManagerUser.id,
      dealType: DealType.FINANCE,
      status: RetailDealStatus.PENDING,
      vehiclePrice: new Prisma.Decimal('28950.00'),
      discount: new Prisma.Decimal('1000.00'),
      netVehiclePrice: new Prisma.Decimal('27950.00'),
      tradeVehicleId: null,
      tradeAllowance: new Prisma.Decimal(tradeAllowance.toFixed(2)),
      tradePayoff: new Prisma.Decimal(tradePayoff.toFixed(2)),
      tradeEquity: new Prisma.Decimal(tradeEquity.toFixed(2)),
      downPayment: new Prisma.Decimal(cashDown.toFixed(2)),
      amountFinanced: new Prisma.Decimal(amountFinanced.toFixed(2)),
      apr: new Prisma.Decimal(aprRate.toFixed(3)),
      term: termMonths,
      monthlyPayment: new Prisma.Decimal(monthlyPayment.toFixed(2)),
      lenderName: lenders.sunriseCreditUnion.name,
      lenderRate: new Prisma.Decimal('3.49'),
      dealerReserve: new Prisma.Decimal('350.00'),
      docFee: new Prisma.Decimal('347.00'),
      registrationFee: new Prisma.Decimal('220.00'),
      salesTax: new Prisma.Decimal('2167.44'),
      otherFees: worksheetStructure.fees,
      warrantyProduct: 'Vehicle Service Contract',
      warrantyCost: new Prisma.Decimal('795.00'),
      gapInsurance: true,
      gapCost: new Prisma.Decimal('299.00'),
      maintenancePlan: false,
      otherProducts: worksheetStructure.backendProducts,
      frontEndGross: new Prisma.Decimal(grossBreakdown.frontEnd.toFixed(2)),
      backEndGross: new Prisma.Decimal(grossBreakdown.backEnd.toFixed(2)),
      totalGross: new Prisma.Decimal(grossBreakdown.total.toFixed(2)),
      packAmount: new Prisma.Decimal('495.00'),
      dealDate: now,
      fundedDate: null,
      deliveryDate: null,
      notes: 'Working desking deal generated by seed script.',
    },
    create: {
      id: 'desking-camry-deal',
      tenantId: tenant.id,
      dealNumber: 'DESK-1001',
      customerId: tierOneCustomer.id,
      vehicleId: camryVehicle.id,
      salesPersonId: primarySalesPerson.id,
      financeManagerId: financeManagerUser.id,
      dealType: DealType.FINANCE,
      status: RetailDealStatus.PENDING,
      vehiclePrice: new Prisma.Decimal('28950.00'),
      discount: new Prisma.Decimal('1000.00'),
      netVehiclePrice: new Prisma.Decimal('27950.00'),
      tradeVehicleId: null,
      tradeAllowance: new Prisma.Decimal(tradeAllowance.toFixed(2)),
      tradePayoff: new Prisma.Decimal(tradePayoff.toFixed(2)),
      tradeEquity: new Prisma.Decimal(tradeEquity.toFixed(2)),
      downPayment: new Prisma.Decimal(cashDown.toFixed(2)),
      amountFinanced: new Prisma.Decimal(amountFinanced.toFixed(2)),
      apr: new Prisma.Decimal(aprRate.toFixed(3)),
      term: termMonths,
      monthlyPayment: new Prisma.Decimal(monthlyPayment.toFixed(2)),
      lenderName: lenders.sunriseCreditUnion.name,
      lenderRate: new Prisma.Decimal('3.49'),
      dealerReserve: new Prisma.Decimal('350.00'),
      docFee: new Prisma.Decimal('347.00'),
      registrationFee: new Prisma.Decimal('220.00'),
      salesTax: new Prisma.Decimal('2167.44'),
      otherFees: worksheetStructure.fees,
      warrantyProduct: 'Vehicle Service Contract',
      warrantyCost: new Prisma.Decimal('795.00'),
      gapInsurance: true,
      gapCost: new Prisma.Decimal('299.00'),
      maintenancePlan: false,
      otherProducts: worksheetStructure.backendProducts,
      frontEndGross: new Prisma.Decimal(grossBreakdown.frontEnd.toFixed(2)),
      backEndGross: new Prisma.Decimal(grossBreakdown.backEnd.toFixed(2)),
      totalGross: new Prisma.Decimal(grossBreakdown.total.toFixed(2)),
      packAmount: new Prisma.Decimal('495.00'),
      dealDate: now,
      fundedDate: null,
      deliveryDate: null,
      notes: 'Working desking deal generated by seed script.',
    },
  });

  const amountFinancedValue = amountFinanced.toFixed(2);
  const aprValue = aprRate.toFixed(3);
  const paymentValue = monthlyPayment.toFixed(2);

  const worksheet = await prisma.dealWorksheet.upsert({
    where: { id: 'desking-camry-worksheet' },
    update: {
      tenantId: tenant.id,
      dealId: workingDeal.id,
      customerId: tierOneCustomer.id,
      vehicleId: camryVehicle.id,
      salespersonId: primarySalesPerson.id,
      structure: worksheetStructure,
      totals: worksheetTotals,
      amountFinanced: new Prisma.Decimal(amountFinancedValue),
      term: termMonths,
      apr: new Prisma.Decimal(aprValue),
      payment: new Prisma.Decimal(paymentValue),
      aiScore: new Prisma.Decimal('0.82'),
      status: WorksheetStatus.WORKING,
      printablePdfUrl: 'https://files.autolytiq.dev/seed/desking/DESK-1001.pdf',
    },
    create: {
      id: 'desking-camry-worksheet',
      tenantId: tenant.id,
      dealId: workingDeal.id,
      customerId: tierOneCustomer.id,
      vehicleId: camryVehicle.id,
      salespersonId: primarySalesPerson.id,
      structure: worksheetStructure,
      totals: worksheetTotals,
      amountFinanced: new Prisma.Decimal(amountFinancedValue),
      term: termMonths,
      apr: new Prisma.Decimal(aprValue),
      payment: new Prisma.Decimal(paymentValue),
      aiScore: new Prisma.Decimal('0.82'),
      status: WorksheetStatus.WORKING,
      printablePdfUrl: 'https://files.autolytiq.dev/seed/desking/DESK-1001.pdf',
    },
  });

  const versionSnapshot = {
    structure: worksheetStructure,
    totals: worksheetTotals,
    payment: paymentSummary,
    lender: {
      primary: lenders.sunriseCreditUnion.id,
      backup: lenders.horizonAutoFinance.id,
    },
  };

  const version = await prisma.dealVersion.upsert({
    where: { id: 'desking-camry-version-initial' },
    update: {
      tenantId: tenant.id,
      dealId: workingDeal.id,
      worksheetId: worksheet.id,
      snapshot: versionSnapshot,
      grossBreakdown,
      closeProbability: new Prisma.Decimal('0.66'),
      approvalProbability: new Prisma.Decimal('0.83'),
      aiScore: new Prisma.Decimal('0.81'),
      label: 'Initial pencil',
      createdById: adminUser.id,
    },
    create: {
      id: 'desking-camry-version-initial',
      tenantId: tenant.id,
      dealId: workingDeal.id,
      worksheetId: worksheet.id,
      snapshot: versionSnapshot,
      grossBreakdown,
      closeProbability: new Prisma.Decimal('0.66'),
      approvalProbability: new Prisma.Decimal('0.83'),
      aiScore: new Prisma.Decimal('0.81'),
      label: 'Initial pencil',
      createdById: adminUser.id,
    },
  });

  await prisma.dealWorksheet.update({
    where: { id: worksheet.id },
    data: { versionPointer: { connect: { id: version.id } } },
  });

  const alternativeStructures = [
    {
      id: 'alt-short-term',
      label: '60-month accelerated payoff',
      payment: { amountFinanced: 26450, apr: 0.0339, termMonths: 60, monthlyPayment: 479.62, dueAtSigning: cashDown },
      gross: { frontEnd: 2525, backEnd: 1095, financeReserve: 310, total: 3930 },
      structure: {
        ...worksheetStructure,
        cashDown: { ...worksheetStructure.cashDown, total: cashDown + 500, customerCash: 3000 },
      },
      probabilityOfClose: 0.58,
      notes: 'Higher payment but completes payoff a year sooner.',
    },
    {
      id: 'alt-payment-relief',
      label: '72-month payment relief',
      payment: { amountFinanced: 28250, apr: 0.0359, termMonths: 72, monthlyPayment: 439.87, dueAtSigning: cashDown - 500 },
      gross: { frontEnd: 2325, backEnd: 999, financeReserve: 275, total: 3600 },
      structure: {
        ...worksheetStructure,
        backendProducts: worksheetStructure.backendProducts?.filter((product) => product.code !== 'GAP'),
        cashDown: { ...worksheetStructure.cashDown, total: cashDown - 500, customerCash: 2000 },
      },
      probabilityOfClose: 0.71,
      notes: 'Lowers cash due at signing by reallocating rebates.',
    },
  ];

  await prisma.dealOptimization.upsert({
    where: { id: 'desking-camry-optimization' },
    update: {
      tenantId: tenant.id,
      dealId: workingDeal.id,
      worksheetId: worksheet.id,
      versionId: version.id,
      goals: {
        targetPayment: 400,
        minimumGross: 3500,
        preserveProducts: ['VSC', 'GAP'],
        lenderPreference: lenders.sunriseCreditUnion.id,
      },
      constraints: {
        maxTerm: 72,
        minCashDown: 3000,
        allowedTiers: [CreditTier.TIER_1, CreditTier.TIER_2],
        residenceType: ResidenceType.OWN,
      },
      recommendedStructure: worksheetStructure,
      alternatives: alternativeStructures,
      insights: [
        'Maintaining the service contract keeps backend gross above $1,100.',
        'Customer qualifies for Tier 1 with Sunrise Credit Union at 3.49% APR.',
      ],
      warnings: ['Dropping GAP coverage reduces reserve by $350 and weakens lender approval odds.'],
      projectedGross: new Prisma.Decimal('3994.00'),
      runById: adminUser.id,
      mlTraceId: 'seed-trace-worksheet-001',
    },
    create: {
      id: 'desking-camry-optimization',
      tenantId: tenant.id,
      dealId: workingDeal.id,
      worksheetId: worksheet.id,
      versionId: version.id,
      goals: {
        targetPayment: 400,
        minimumGross: 3500,
        preserveProducts: ['VSC', 'GAP'],
        lenderPreference: lenders.sunriseCreditUnion.id,
      },
      constraints: {
        maxTerm: 72,
        minCashDown: 3000,
        allowedTiers: [CreditTier.TIER_1, CreditTier.TIER_2],
        residenceType: ResidenceType.OWN,
      },
      recommendedStructure: worksheetStructure,
      alternatives: alternativeStructures,
      insights: [
        'Maintaining the service contract keeps backend gross above $1,100.',
        'Customer qualifies for Tier 1 with Sunrise Credit Union at 3.49% APR.',
      ],
      warnings: ['Dropping GAP coverage reduces reserve by $350 and weakens lender approval odds.'],
      projectedGross: new Prisma.Decimal('3994.00'),
      runById: adminUser.id,
      mlTraceId: 'seed-trace-worksheet-001',
    },
  });

  const counterOptions = alternativeStructures.map((option) => ({
    id: option.id,
    label: option.label,
    payment: option.payment,
    gross: option.gross,
    probabilityOfClose: option.probabilityOfClose,
    notes: option.notes,
  }));

  await prisma.counterOffer.upsert({
    where: { id: 'desking-camry-counteroffer' },
    update: {
      tenantId: tenant.id,
      dealId: workingDeal.id,
      worksheetId: worksheet.id,
      originalVersionId: version.id,
      input: {
        customerConcern: 'Monthly payment needs to start with a 3.',
        requestedPayment: 399,
        requestedTerm: termMonths,
        requestedCashDown: 2500,
      },
      aiResponse: {
        summary: 'Presented two concessions balancing payment relief and gross retention.',
        options: counterOptions,
        recommendation: 'Lead with payment relief plan, keep service contract.',
      },
      selectedOption: counterOptions[1],
      scriptUsed: 'Payment Relief Script v2',
      outcome: CounterOfferOutcome.PENDING,
      handledById: primarySalesPerson.id,
    },
    create: {
      id: 'desking-camry-counteroffer',
      tenantId: tenant.id,
      dealId: workingDeal.id,
      worksheetId: worksheet.id,
      originalVersionId: version.id,
      input: {
        customerConcern: 'Monthly payment needs to start with a 3.',
        requestedPayment: 399,
        requestedTerm: termMonths,
        requestedCashDown: 2500,
      },
      aiResponse: {
        summary: 'Presented two concessions balancing payment relief and gross retention.',
        options: counterOptions,
        recommendation: 'Lead with payment relief plan, keep service contract.',
      },
      selectedOption: counterOptions[1],
      scriptUsed: 'Payment Relief Script v2',
      outcome: CounterOfferOutcome.PENDING,
      handledById: primarySalesPerson.id,
    },
  });

  await prisma.approvalPrediction.upsert({
    where: { id: 'desking-camry-approval' },
    update: {
      tenantId: tenant.id,
      dealId: workingDeal.id,
      worksheetId: worksheet.id,
      versionId: version.id,
      lenderId: lenders.sunriseCreditUnion.id,
      lenderName: lenders.sunriseCreditUnion.name,
      approvalProbability: new Prisma.Decimal('0.84'),
      recommendedTier: CreditTier.TIER_1,
      estimatedRate: new Prisma.Decimal('3.29'),
      estimatedReserve: new Prisma.Decimal('450.00'),
      strengths: [
        'Prime credit score (762) with low revolving utilization.',
        'Stable employment with 5-year tenure at Techline Analytics.',
        'Down payment and trade equity cover fees and backend products.',
      ],
      weaknesses: ['Slightly elevated LTV due to accessories and backend products.'],
      stipulations: [
        { code: 'POI', description: 'Proof of income covering the last 30 days', required: true },
        { code: 'POR', description: 'Proof of residency (utility bill within 60 days)', required: true },
      ],
      recommendation: Recommendation.STRONG,
    },
    create: {
      id: 'desking-camry-approval',
      tenantId: tenant.id,
      dealId: workingDeal.id,
      worksheetId: worksheet.id,
      versionId: version.id,
      lenderId: lenders.sunriseCreditUnion.id,
      lenderName: lenders.sunriseCreditUnion.name,
      approvalProbability: new Prisma.Decimal('0.84'),
      recommendedTier: CreditTier.TIER_1,
      estimatedRate: new Prisma.Decimal('3.29'),
      estimatedReserve: new Prisma.Decimal('450.00'),
      strengths: [
        'Prime credit score (762) with low revolving utilization.',
        'Stable employment with 5-year tenure at Techline Analytics.',
        'Down payment and trade equity cover fees and backend products.',
      ],
      weaknesses: ['Slightly elevated LTV due to accessories and backend products.'],
      stipulations: [
        { code: 'POI', description: 'Proof of income covering the last 30 days', required: true },
        { code: 'POR', description: 'Proof of residency (utility bill within 60 days)', required: true },
      ],
      recommendation: Recommendation.STRONG,
    },
  });

  console.log('  ✓ Deal seeding complete');

  return {
    deals,
    workingDeal,
    worksheet,
  };
}
