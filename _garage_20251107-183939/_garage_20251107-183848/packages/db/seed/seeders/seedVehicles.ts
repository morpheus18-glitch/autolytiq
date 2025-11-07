/**
 * Vehicle Seeder
 * Creates vehicles with appraisals, pricing, recon, market comps, and workflow stages
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { addDays, addHours, subDays, subYears } from 'date-fns';
import {
  VehicleType,
  VehicleAcquisitionType,
  VehicleStatus,
  FuelType,
  AppraisalStatus,
  AppraisalConditionGrade,
  ReconItemStatus,
  PriceChangeType,
  MarketCompSource,
  WholesaleListingStatus,
  AuctionPurchaseStatus,
  WorkflowTaskStatus,
  WorkflowTaskType,
  TransportOrderStatus,
} from '@prisma/client';

interface SeedVehiclesResult {
  inventoryVehicles: Awaited<ReturnType<typeof PrismaClient.prototype.vehicle.create>>[];
}

interface WorkflowStage {
  id: string;
  key: string;
  name: string;
  position: number;
  slaHours: number | null;
  wipLimit: number | null;
  tenantId: string;
  definitionId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowDefinition {
  id: string;
  stages: WorkflowStage[];
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

/**
 * Seed vehicles and related inventory data
 */
export async function seedVehicles(
  prisma: PrismaClient,
  tenant: { id: string },
  store: { id: string },
  users: Awaited<ReturnType<typeof PrismaClient.prototype.user.findMany>>,
  workflowDefinition: WorkflowDefinition
): Promise<SeedVehiclesResult> {
  console.log('\n🚗 Seeding vehicles and inventory...');

  const pipelineStageMap = new Map(workflowDefinition.stages.map((stage) => [stage.key, stage]));
  const acquisitionStage = pipelineStageMap.get('ACQUISITION');
  if (!acquisitionStage) {
    throw new Error('Default pipeline is missing ACQUISITION stage');
  }
  const pipelineStageKeys = workflowDefinition.stages.map((stage) => stage.key);

  const inventoryVehicles = [] as Awaited<ReturnType<typeof prisma.vehicle.create>>[];

  console.log('  → Creating vehicles with workflow stages...');
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

    const stageProgressIndex = faker.number.int({ min: 0, max: pipelineStageKeys.length - 1 });
    const traversedStageKeys = pipelineStageKeys.slice(0, stageProgressIndex + 1);
    let transitionTimestamp = acquisitionDate ?? received ?? new Date();
    let previousStage: WorkflowStage | undefined;
    const stageTransitionsData: Prisma.StageTransitionCreateWithoutWorkflowInput[] = [];

    traversedStageKeys.forEach((stageKey, index) => {
      const stageEntity = pipelineStageMap.get(stageKey);
      if (!stageEntity) {
        return;
      }
      if (index > 0) {
        transitionTimestamp = addHours(transitionTimestamp, faker.number.int({ min: 6, max: 48 }));
      }
      stageTransitionsData.push({
        tenantId: tenant.id,
        fromStageId: previousStage?.id ?? null,
        toStageId: stageEntity.id,
        at: transitionTimestamp,
        byUserId: faker.helpers.arrayElement(users).id,
        note: index === 0 ? 'Pipeline initiated' : faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.35 }) ?? undefined,
      });
      previousStage = stageEntity;
    });

    const currentStage = previousStage ?? acquisitionStage;
    if (!currentStage) {
      throw new Error('Unable to resolve current workflow stage');
    }

    const completedAtDate = currentStage.key === 'SOLD'
      ? addDays(transitionTimestamp, faker.number.int({ min: 1, max: 7 }))
      : null;

    const workflowTaskCreates: Prisma.WorkflowTaskCreateWithoutWorkflowInput[] = [];
    const inspectionStage = pipelineStageMap.get('INSPECTION');
    if (inspectionStage && traversedStageKeys.includes('INSPECTION')) {
      workflowTaskCreates.push({
        tenantId: tenant.id,
        stageId: inspectionStage.id,
        vehicleId: vehicle.id,
        title: 'Complete inspection checklist',
        description: faker.lorem.sentence(),
        type: WorkflowTaskType.QA,
        status: traversedStageKeys.includes('RECON') ? WorkflowTaskStatus.DONE : WorkflowTaskStatus.IN_PROGRESS,
        dueAt: addDays(received, 2),
        assigneeId: faker.helpers.arrayElement(users).id,
        tags: ['inspection'],
        mentions: [],
        checklist: { items: ['Road test', 'Diagnostic scan', 'Cosmetic review'] },
      });
    }

    const reconStage = pipelineStageMap.get('RECON');
    if (reconStage) {
      workflowTaskCreates.push({
        tenantId: tenant.id,
        stageId: reconStage.id,
        vehicleId: vehicle.id,
        title: 'Review recon scope',
        description: faker.lorem.sentence(),
        type: WorkflowTaskType.RECON,
        status: traversedStageKeys.includes('DETAIL') ? WorkflowTaskStatus.DONE : WorkflowTaskStatus.IN_PROGRESS,
        dueAt: addDays(received, 5),
        assigneeId: faker.helpers.arrayElement(users).id,
        tags: ['recon'],
        mentions: [],
        checklist: { items: ['Estimate parts', 'Assign technician', 'Approve spend'] },
        costCents: faker.number.int({ min: 30000, max: 125000 }),
      });
    }

    const photoStage = pipelineStageMap.get('PHOTOS');
    if (photoStage && traversedStageKeys.includes('PHOTOS')) {
      workflowTaskCreates.push({
        tenantId: tenant.id,
        stageId: photoStage.id,
        vehicleId: vehicle.id,
        title: 'Capture marketing photos',
        description: 'Ensure hero, interior, and detail shots meet listing guidelines.',
        type: WorkflowTaskType.PHOTOS,
        status: traversedStageKeys.includes('LISTING') ? WorkflowTaskStatus.DONE : WorkflowTaskStatus.IN_PROGRESS,
        dueAt: addDays(received, 7),
        assigneeId: faker.helpers.arrayElement(users).id,
        tags: ['photos', 'marketing'],
        mentions: [],
        checklist: { items: ['Exterior hero', 'Interior cockpit', 'Detail highlights'] },
      });
    }

    const transportOrdersCreates: Prisma.TransportOrderCreateWithoutWorkflowInput[] = [];
    const transportStage = pipelineStageMap.get('TRANSPORT');
    if (transportStage && traversedStageKeys.includes('TRANSPORT')) {
      transportOrdersCreates.push({
        tenantId: tenant.id,
        vehicleId: vehicle.id,
        stageId: transportStage.id,
        vendor: faker.company.name(),
        pickupAddress: faker.location.streetAddress(),
        dropoffAddress: faker.location.streetAddress(),
        scheduledAt: addDays(transitionTimestamp, 1),
        status: faker.helpers.arrayElement([
          TransportOrderStatus.SCHEDULED,
          TransportOrderStatus.PICKED_UP,
          TransportOrderStatus.DELIVERED,
        ]),
        costCents: faker.number.int({ min: 35000, max: 95000 }),
      });
    }

    await prisma.vehicleWorkflow.create({
      data: {
        tenantId: tenant.id,
        vehicleId: vehicle.id,
        definitionId: workflowDefinition.id,
        currentStageId: currentStage.id,
        startedAt: stageTransitionsData[0]?.at ?? received ?? new Date(),
        completedAt: completedAtDate ?? undefined,
        transitions: { create: stageTransitionsData },
        tasks: workflowTaskCreates.length > 0 ? { create: workflowTaskCreates } : undefined,
        transportOrders: transportOrdersCreates.length > 0 ? { create: transportOrdersCreates } : undefined,
      },
    });

    inventoryVehicles.push(vehicle);
  }
  console.log(`  ✓ Created ${inventoryVehicles.length} vehicles`);

  // Create detailed appraisal and recon for sample vehicle
  const managerUser = users.find((u) => u.role === 'MANAGER') ?? users[0];
  const appraiserUser = users.find((u) => u.role === 'SALES') ?? users[0];
  const sampleVehicle = inventoryVehicles[0];

  if (sampleVehicle) {
    console.log('  → Creating appraisal and recon items...');
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

    console.log('  → Creating price history...');
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

    console.log('  → Creating market comps...');
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

    console.log('  → Creating wholesale listing...');
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

  // Create auction purchase for auction vehicle
  const auctionVehicle = inventoryVehicles.find((vehicle) => vehicle.acquisitionType === VehicleAcquisitionType.AUCTION) ?? sampleVehicle;

  if (auctionVehicle) {
    console.log('  → Creating auction purchase...');
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

  console.log('  ✓ Vehicle seeding complete');

  return {
    inventoryVehicles,
  };
}
