-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'SALES', 'SALES_MANAGER', 'FINANCE', 'FI_MANAGER', 'SERVICE', 'BDC');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PreferredContactMethod" AS ENUM ('EMAIL', 'PHONE', 'SMS');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'WALKIN', 'WALK_IN', 'PHONE', 'EMAIL', 'SOCIAL_MEDIA', 'THIRD_PARTY', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'SCHEDULED', 'NEGOTIATION', 'WON', 'HOT', 'WARM', 'COLD', 'LOST', 'CUSTOMER', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('NOTE', 'CALL', 'EMAIL', 'SMS', 'TASK', 'MEETING', 'VISIT', 'TEST_DRIVE', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('TEST_DRIVE', 'DELIVERY', 'FINANCE', 'SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('CALL', 'SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "CommunicationDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('CALL', 'EMAIL', 'SMS', 'VISIT', 'TEST_DRIVE', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "InteractionDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CustomerVehicleStatus" AS ENUM ('OWNED', 'TRADED', 'SOLD');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('NEW', 'USED', 'CERTIFIED');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'PENDING', 'SOLD', 'IN_TRANSIT', 'SERVICE', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "VehicleHistoryType" AS ENUM ('SERVICE', 'ACCIDENT', 'OWNERSHIP', 'INSPECTION');

-- CreateEnum
CREATE TYPE "VehicleAcquisitionType" AS ENUM ('TRADE_IN', 'AUCTION', 'PURCHASE', 'FLOOR_PLAN', 'CONSIGNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AppraisalStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AppraisalConditionGrade" AS ENUM ('ROUGH', 'AVERAGE', 'CLEAN', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "ReconItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PriceChangeType" AS ENUM ('MANUAL', 'MARKET', 'AI_RECOMMENDATION', 'FLOOR_PLAN');

-- CreateEnum
CREATE TYPE "AuctionPurchaseStatus" AS ENUM ('PENDING', 'WON', 'LOST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WholesaleListingStatus" AS ENUM ('DRAFT', 'LISTED', 'UNDER_CONTRACT', 'SOLD', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "MarketCompSource" AS ENUM ('RETAIL_LISTING', 'WHOLESALE_LISTING', 'AUCTION_RESULT', 'THIRD_PARTY', 'INTERNAL');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('CASH', 'FINANCE', 'LEASE');

-- CreateEnum
CREATE TYPE "RetailDealStatus" AS ENUM ('DRAFT', 'PENDING', 'SUBMITTED', 'APPROVED', 'FUNDED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('WORKING', 'PENCILED', 'SUBMITTED', 'CLOSED', 'LOST');

-- CreateEnum
CREATE TYPE "CreditTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5', 'TIER_6');

-- CreateEnum
CREATE TYPE "ResidenceType" AS ENUM ('OWN', 'RENT', 'LEASE', 'FAMILY', 'MILITARY', 'OTHER');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('STRONG', 'MODERATE', 'WEAK', 'DO_NOT_SUBMIT');

-- CreateEnum
CREATE TYPE "CounterOfferOutcome" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "NormalBalance" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "JournalStatus" AS ENUM ('DRAFT', 'POSTED', 'VOID');

-- CreateEnum
CREATE TYPE "LineType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('FRONT', 'BACK', 'BONUS', 'SPIFF');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CHARGEBACK');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('SALES', 'INVENTORY', 'FINANCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DEAL_APPROVAL', 'FOLLOW_UP', 'INVENTORY_ALERT', 'TASK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "WorkflowTaskType" AS ENUM ('DETAIL', 'PHOTOS', 'RECON', 'TRANSPORT', 'PRICING', 'LISTING', 'QA', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkflowTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "TransportOrderStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AutomationExecutionStatus" AS ENUM ('SUCCESS', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "plan" "TenantPlan" NOT NULL DEFAULT 'BASIC',
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "settings" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "billingEmail" TEXT NOT NULL,
    "subscriptionEndsAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'SALES',
    "permissions" JSONB NOT NULL DEFAULT jsonb_build_array(),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "dateOfBirth" DATE,
    "driversLicenseNumber" TEXT,
    "driversLicenseState" TEXT,
    "ssn" TEXT,
    "addressStreet" TEXT,
    "addressCity" TEXT,
    "addressState" TEXT,
    "addressZip" TEXT,
    "addressCountry" TEXT,
    "preferredContactMethod" "PreferredContactMethod" NOT NULL DEFAULT 'EMAIL',
    "leadSource" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
    "leadStatus" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "creditScore" INTEGER,
    "assignedToUserId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "lifetimeValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),
    "search_vector" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerInteraction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "direction" "InteractionDirection" NOT NULL,
    "subject" TEXT,
    "notes" TEXT,
    "duration" INTEGER,
    "scheduledAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "CustomerInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT,
    "assignedToId" TEXT,
    "ownerId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "rating" INTEGER,
    "score" INTEGER,
    "smsOptOut" BOOLEAN NOT NULL DEFAULT false,
    "emailOptOut" BOOLEAN NOT NULL DEFAULT false,
    "callOptOut" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isConverted" BOOLEAN NOT NULL DEFAULT false,
    "lastActivityAt" TIMESTAMPTZ(6),
    "lastCommunicationAt" TIMESTAMPTZ(6),
    "nextActionAt" TIMESTAMPTZ(6),
    "convertedAt" TIMESTAMPTZ(6),
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "userId" TEXT,
    "type" "ActivityType" NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'PENDING',
    "subject" TEXT,
    "description" TEXT,
    "outcome" TEXT,
    "metadata" JSONB,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "dueAt" TIMESTAMPTZ(6),
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "assignedToId" TEXT,
    "vehicleId" TEXT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "location" TEXT,
    "timeZone" TEXT DEFAULT 'UTC',
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "endAt" TIMESTAMPTZ(6),
    "checkedInAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "cancelledAt" TIMESTAMPTZ(6),
    "noShowAt" TIMESTAMPTZ(6),
    "outcome" TEXT,
    "followUpTaskId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadScore" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "modelKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "scoreDelta" INTEGER,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "direction" "CommunicationDirection" NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "providerId" TEXT,
    "status" "CommunicationStatus",
    "metadata" JSONB,
    "leadId" TEXT,
    "customerId" TEXT,
    "activityId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "text" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SMSTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SMSTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationExecution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "automationId" TEXT,
    "triggerType" TEXT NOT NULL,
    "status" "AutomationExecutionStatus" NOT NULL DEFAULT 'SUCCESS',
    "context" JSONB,
    "result" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(6),

    CONSTRAINT "AutomationExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerVehicle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "purchaseDate" TIMESTAMPTZ(6),
    "purchasePrice" DECIMAL(18,2),
    "currentMileage" INTEGER,
    "status" "CustomerVehicleStatus" NOT NULL DEFAULT 'OWNED',
    "tradedInDate" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CustomerVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stockNumber" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "exteriorColor" TEXT,
    "interiorColor" TEXT,
    "mileage" INTEGER,
    "engineType" TEXT,
    "transmission" TEXT,
    "drivetrain" TEXT,
    "fuelType" "FuelType" NOT NULL,
    "msrp" DECIMAL(18,2),
    "invoiceCost" DECIMAL(18,2),
    "listPrice" DECIMAL(18,2),
    "specialPrice" DECIMAL(18,2),
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT,
    "dateReceived" TIMESTAMPTZ(6),
    "dateSold" TIMESTAMPTZ(6),
    "daysInStock" INTEGER DEFAULT 0,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certificationNumber" TEXT,
    "floorPlanId" TEXT,
    "floorPlanDate" TIMESTAMPTZ(6),
    "floorPlanInterestRate" DECIMAL(5,2),
    "acquisitionType" "VehicleAcquisitionType",
    "acquisitionSource" TEXT,
    "acquisitionDate" TIMESTAMPTZ(6),
    "acquisitionCost" DECIMAL(18,2),
    "floorPrice" DECIMAL(18,2),
    "wholesaleValue" DECIMAL(18,2),
    "marketValue" DECIMAL(18,2),
    "targetPrice" DECIMAL(18,2),
    "aiPrice" DECIMAL(18,2),
    "pricingNotes" TEXT,
    "appraisalStatus" "AppraisalStatus",
    "lastAppraisedAt" TIMESTAMPTZ(6),
    "reconEstimate" DECIMAL(18,2),
    "reconActual" DECIMAL(18,2),
    "reconCompletedAt" TIMESTAMPTZ(6),
    "agingBucket" TEXT,
    "nextPriceReviewDate" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),
    "search_vector" TEXT,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "VehicleHistoryType" NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "description" TEXT NOT NULL,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "VehicleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appraisal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "appraiserId" TEXT NOT NULL,
    "managerId" TEXT,
    "vin" TEXT NOT NULL,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "exteriorColor" TEXT,
    "interiorColor" TEXT,
    "mileage" INTEGER,
    "conditionGrade" "AppraisalConditionGrade",
    "conditionScore" INTEGER,
    "conditionNotes" TEXT,
    "warningLights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedValue" DECIMAL(18,2),
    "marketValue" DECIMAL(18,2),
    "aiSuggestedValue" DECIMAL(18,2),
    "reconEstimate" JSONB,
    "status" "AppraisalStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMPTZ(6),
    "approvedAt" TIMESTAMPTZ(6),
    "rejectedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Appraisal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "appraisalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" "ReconItemStatus" NOT NULL DEFAULT 'PENDING',
    "vendor" TEXT,
    "estimatedCost" DECIMAL(18,2),
    "actualCost" DECIMAL(18,2),
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "beforePhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "afterPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ReconItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "changedById" TEXT,
    "changeType" "PriceChangeType" NOT NULL DEFAULT 'MANUAL',
    "oldPrice" DECIMAL(18,2),
    "newPrice" DECIMAL(18,2) NOT NULL,
    "adjustment" DECIMAL(18,2),
    "sourceReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionPurchase" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "provider" TEXT,
    "auctionName" TEXT NOT NULL,
    "auctionDate" TIMESTAMPTZ(6),
    "lane" TEXT,
    "runNumber" TEXT,
    "status" "AuctionPurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "hammerPrice" DECIMAL(18,2),
    "buyerFees" DECIMAL(18,2),
    "transportCost" DECIMAL(18,2),
    "reconditioningCost" DECIMAL(18,2),
    "totalCost" DECIMAL(18,2),
    "conditionGrade" TEXT,
    "inspectorNotes" TEXT,
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AuctionPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WholesaleListing" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" "WholesaleListingStatus" NOT NULL DEFAULT 'DRAFT',
    "askingPrice" DECIMAL(18,2),
    "reservePrice" DECIMAL(18,2),
    "minimumAcceptable" DECIMAL(18,2),
    "publishedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "soldAt" TIMESTAMPTZ(6),
    "buyerName" TEXT,
    "buyerContact" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WholesaleListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketComp" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "source" "MarketCompSource" NOT NULL DEFAULT 'THIRD_PARTY',
    "compVin" TEXT,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "mileage" INTEGER,
    "price" DECIMAL(18,2),
    "distance" INTEGER,
    "location" TEXT,
    "listedAt" TIMESTAMPTZ(6),
    "payload" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MarketComp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "salesPersonId" TEXT NOT NULL,
    "financeManagerId" TEXT,
    "dealType" "DealType" NOT NULL,
    "status" "RetailDealStatus" NOT NULL DEFAULT 'DRAFT',
    "vehiclePrice" DECIMAL(18,2) NOT NULL,
    "discount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "netVehiclePrice" DECIMAL(18,2) NOT NULL,
    "tradeVehicleId" TEXT,
    "tradeAllowance" DECIMAL(18,2),
    "tradePayoff" DECIMAL(18,2),
    "tradeEquity" DECIMAL(18,2),
    "downPayment" DECIMAL(18,2),
    "amountFinanced" DECIMAL(18,2),
    "apr" DECIMAL(5,2),
    "term" INTEGER,
    "monthlyPayment" DECIMAL(18,2),
    "lenderName" TEXT,
    "lenderRate" DECIMAL(5,2),
    "dealerReserve" DECIMAL(18,2),
    "docFee" DECIMAL(18,2),
    "registrationFee" DECIMAL(18,2),
    "salesTax" DECIMAL(18,2),
    "otherFees" JSONB,
    "warrantyProduct" TEXT,
    "warrantyCost" DECIMAL(18,2),
    "gapInsurance" BOOLEAN NOT NULL DEFAULT false,
    "gapCost" DECIMAL(18,2),
    "maintenancePlan" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceCost" DECIMAL(18,2),
    "otherProducts" JSONB,
    "frontEndGross" DECIMAL(18,2),
    "backEndGross" DECIMAL(18,2),
    "totalGross" DECIMAL(18,2),
    "packAmount" DECIMAL(18,2),
    "dealDate" TIMESTAMPTZ(6) NOT NULL,
    "fundedDate" TIMESTAMPTZ(6),
    "deliveryDate" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealWorksheet" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "salespersonId" TEXT,
    "structure" JSONB NOT NULL,
    "amountFinanced" DECIMAL(18,2),
    "term" INTEGER,
    "apr" DECIMAL(6,3),
    "payment" DECIMAL(18,2),
    "totals" JSONB NOT NULL,
    "aiScore" DECIMAL(5,4),
    "status" "DealStatus" NOT NULL DEFAULT 'WORKING',
    "versionPointerId" TEXT,
    "printablePdfUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DealWorksheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "worksheetId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "grossBreakdown" JSONB,
    "closeProbability" DECIMAL(5,4),
    "approvalProbability" DECIMAL(5,4),
    "aiScore" DECIMAL(5,4),
    "label" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditSubmissionDraft" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "worksheetId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CreditSubmissionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealOptimization" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "worksheetId" TEXT,
    "versionId" TEXT,
    "goals" JSONB NOT NULL,
    "constraints" JSONB NOT NULL,
    "recommendedStructure" JSONB NOT NULL,
    "alternatives" JSONB NOT NULL,
    "insights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "warnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "projectedGross" DECIMAL(18,2),
    "runById" TEXT,
    "mlTraceId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DealOptimization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounterOffer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "worksheetId" TEXT,
    "originalVersionId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "aiResponse" JSONB NOT NULL,
    "selectedOption" JSONB,
    "scriptUsed" TEXT,
    "outcome" "CounterOfferOutcome" NOT NULL DEFAULT 'PENDING',
    "handledById" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CounterOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalPrediction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "worksheetId" TEXT,
    "versionId" TEXT,
    "lenderId" TEXT NOT NULL,
    "lenderName" TEXT NOT NULL,
    "approvalProbability" DECIMAL(5,4) NOT NULL,
    "recommendedTier" "CreditTier" NOT NULL,
    "estimatedRate" DECIMAL(6,3),
    "estimatedReserve" DECIMAL(18,2),
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stipulations" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "recommendation" "Recommendation" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ApprovalPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealJacket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "salespersonId" TEXT NOT NULL,
    "fiManagerId" TEXT,
    "sellingPrice" DECIMAL(18,2) NOT NULL,
    "tradeValue" DECIMAL(18,2),
    "tradePayoff" DECIMAL(18,2),
    "netTrade" DECIMAL(18,2),
    "cashDown" DECIMAL(18,2) NOT NULL,
    "amountFinanced" DECIMAL(18,2) NOT NULL,
    "lenderId" TEXT,
    "apr" DECIMAL(6,3),
    "term" INTEGER,
    "monthlyPayment" DECIMAL(18,2),
    "fiProducts" JSONB NOT NULL,
    "totalFiGross" DECIMAL(18,2),
    "status" TEXT NOT NULL,
    "dealDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractDate" TIMESTAMP(3),
    "fundedDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealJacket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT,
    "pdfUrl" TEXT,
    "docusignEnvelopeId" TEXT,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMPTZ(6),
    "viewedAt" TIMESTAMPTZ(6),
    "signedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "signers" JSONB NOT NULL,
    "contractData" JSONB NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signature" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signerRole" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "signedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FIProduct" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverageDetails" JSONB NOT NULL,
    "cost" DECIMAL(18,2) NOT NULL,
    "retailPrice" DECIMAL(18,2) NOT NULL,
    "markup" DECIMAL(18,2) NOT NULL,
    "term" INTEGER,
    "termType" TEXT,
    "deductible" DECIMAL(18,2),
    "minVehicleAge" INTEGER,
    "maxVehicleAge" INTEGER,
    "minMileage" INTEGER,
    "maxMileage" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FIProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuConfiguration" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "selectedOption" TEXT,
    "selectedAt" TIMESTAMP(3),
    "selectedProducts" JSONB,
    "totalProductCost" DECIMAL(18,2),
    "totalMarkup" DECIMAL(18,2),
    "paymentImpact" DECIMAL(18,2),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealDocument" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceChecklist" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "federalItems" JSONB NOT NULL,
    "stateItems" JSONB NOT NULL,
    "lenderItems" JSONB NOT NULL,
    "internalItems" JSONB NOT NULL,
    "completedItems" INTEGER NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "percentComplete" DECIMAL(5,2) NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditApplication" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "ssn" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currentStreet" TEXT NOT NULL,
    "currentCity" TEXT NOT NULL,
    "currentState" TEXT NOT NULL,
    "currentZip" TEXT NOT NULL,
    "yearsAtAddress" INTEGER NOT NULL,
    "monthsAtAddress" INTEGER NOT NULL,
    "residenceType" TEXT NOT NULL,
    "monthlyPayment" DECIMAL(18,2),
    "previousStreet" TEXT,
    "previousCity" TEXT,
    "previousState" TEXT,
    "previousZip" TEXT,
    "employer" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "yearsEmployed" INTEGER NOT NULL,
    "monthsEmployed" INTEGER NOT NULL,
    "monthlyIncome" DECIMAL(18,2) NOT NULL,
    "employerPhone" TEXT NOT NULL,
    "otherIncomeSource" TEXT,
    "otherIncomeAmount" DECIMAL(18,2),
    "coApplicant" JSONB,
    "references" JSONB NOT NULL,
    "authorizeCredit" BOOLEAN NOT NULL,
    "certifyAccuracy" BOOLEAN NOT NULL,
    "privacyConsent" BOOLEAN NOT NULL,
    "signature" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "creditApplicationId" TEXT NOT NULL,
    "bureau" TEXT NOT NULL,
    "pullType" TEXT NOT NULL,
    "experianScore" INTEGER,
    "transUnionScore" INTEGER,
    "equifaxScore" INTEGER,
    "mergedScore" INTEGER,
    "scoreRange" TEXT,
    "totalAccounts" INTEGER NOT NULL,
    "openAccounts" INTEGER NOT NULL,
    "totalRevolvingCredit" DECIMAL(18,2) NOT NULL,
    "totalRevolvingBalance" DECIMAL(18,2) NOT NULL,
    "utilizationPercent" DECIMAL(5,2) NOT NULL,
    "totalInstallmentDebt" DECIMAL(18,2) NOT NULL,
    "monthlyDebtObligations" DECIMAL(18,2) NOT NULL,
    "onTimePaymentPercent" DECIMAL(5,2) NOT NULL,
    "late30Days" INTEGER NOT NULL,
    "late60Days" INTEGER NOT NULL,
    "late90PlusDays" INTEGER NOT NULL,
    "collections" INTEGER NOT NULL,
    "chargeOffs" INTEGER NOT NULL,
    "bankruptcies" INTEGER NOT NULL,
    "foreclosures" INTEGER NOT NULL,
    "hardInquiries" INTEGER NOT NULL,
    "softInquiries" INTEGER NOT NULL,
    "tradeLines" JSONB NOT NULL,
    "rawResponse" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "pulledBy" TEXT NOT NULL,
    "pulledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lender" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "apiProvider" TEXT NOT NULL,
    "apiCredentials" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tierRange" TEXT NOT NULL,
    "maxTerm" INTEGER NOT NULL,
    "maxLtv" DECIMAL(6,3) NOT NULL,
    "minCreditScore" INTEGER,
    "maxCreditScore" INTEGER,
    "applicationFee" DECIMAL(18,2),

    CONSTRAINT "Lender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LenderSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT NOT NULL,
    "requestPayload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "responsePayload" JSONB,
    "amountApproved" DECIMAL(18,2),
    "apr" DECIMAL(6,3),
    "buyRate" DECIMAL(6,3),
    "dealerReserve" DECIMAL(6,3),
    "maxReserve" DECIMAL(6,3),
    "term" INTEGER,
    "monthlyPayment" DECIMAL(18,2),
    "declineReason" TEXT,
    "declineCode" TEXT,
    "stipulations" JSONB,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "selectedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "LenderSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingChecklist" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingRequest" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "amountRequested" DECIMAL(18,2) NOT NULL,
    "fundingMethod" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "status" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "fundedAt" TIMESTAMP(3),
    "fundedAmount" DECIMAL(18,2),
    "lenderRefNumber" TEXT,
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "journalEntryId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GLAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "normalBalance" "NormalBalance" NOT NULL,
    "parentAccountId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "balance" DECIMAL(18,2),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "GLAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entryNumber" TEXT NOT NULL,
    "memo" TEXT,
    "status" "JournalStatus" NOT NULL DEFAULT 'DRAFT',
    "postingDate" TIMESTAMPTZ(6) NOT NULL,
    "dealId" TEXT,
    "postedById" TEXT NOT NULL,
    "postedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntryLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "glAccountId" TEXT NOT NULL,
    "type" "LineType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commissionType" "CommissionType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "rate" DECIMAL(5,2),
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paidDate" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "parameters" JSONB,
    "schedule" TEXT,
    "lastRunAt" TIMESTAMPTZ(6),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'system',
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ(6),
    "payload" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "slaHours" INTEGER,
    "wipLimit" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleWorkflow" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "currentStageId" TEXT,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "VehicleWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageTransition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "fromStageId" TEXT,
    "toStageId" TEXT NOT NULL,
    "at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "byUserId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "StageTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "stageId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "WorkflowTaskType" NOT NULL DEFAULT 'OTHER',
    "status" "WorkflowTaskStatus" NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMPTZ(6),
    "assigneeId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "checklist" JSONB,
    "costCents" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WorkflowTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "stageId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "vendor" TEXT,
    "pickupAddress" TEXT,
    "dropoffAddress" TEXT,
    "scheduledAt" TIMESTAMPTZ(6),
    "status" "TransportOrderStatus" NOT NULL DEFAULT 'REQUESTED',
    "costCents" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TransportOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineAggregate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "stageKey" TEXT NOT NULL,
    "bucketStart" TIMESTAMPTZ(6) NOT NULL,
    "avgTimeInStageMinutes" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "slaHitRate" DECIMAL(5,2),
    "wipMax" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PipelineAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "User_isSuperAdmin_idx" ON "User"("isSuperAdmin");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Customer_tenantId_leadStatus_idx" ON "Customer"("tenantId", "leadStatus");

-- CreateIndex
CREATE INDEX "Customer_tenantId_assignedToUserId_idx" ON "Customer"("tenantId", "assignedToUserId");

-- CreateIndex
CREATE INDEX "Customer_tenantId_idx" ON "Customer"("tenantId");

-- CreateIndex
CREATE INDEX "Customer_tenantId_search_vector_idx" ON "Customer"("tenantId", "search_vector");

-- CreateIndex
CREATE INDEX "Customer_tenantId_lastName_firstName_idx" ON "Customer"("tenantId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "CustomerInteraction_tenantId_customerId_idx" ON "CustomerInteraction"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "CustomerInteraction_tenantId_scheduledAt_idx" ON "CustomerInteraction"("tenantId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Lead_tenantId_status_idx" ON "Lead"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Lead_tenantId_assignedToId_idx" ON "Lead"("tenantId", "assignedToId");

-- CreateIndex
CREATE INDEX "Lead_tenantId_ownerId_idx" ON "Lead"("tenantId", "ownerId");

-- CreateIndex
CREATE INDEX "Lead_tenantId_source_idx" ON "Lead"("tenantId", "source");

-- CreateIndex
CREATE INDEX "Lead_tenantId_isArchived_status_idx" ON "Lead"("tenantId", "isArchived", "status");

-- CreateIndex
CREATE INDEX "Lead_tenantId_createdAt_idx" ON "Lead"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_tenantId_leadId_idx" ON "Activity"("tenantId", "leadId");

-- CreateIndex
CREATE INDEX "Activity_tenantId_userId_idx" ON "Activity"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Activity_tenantId_dueAt_idx" ON "Activity"("tenantId", "dueAt");

-- CreateIndex
CREATE INDEX "Activity_tenantId_status_idx" ON "Activity"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_followUpTaskId_key" ON "Appointment"("followUpTaskId");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_startAt_idx" ON "Appointment"("tenantId", "startAt");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_status_idx" ON "Appointment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_leadId_idx" ON "Appointment"("tenantId", "leadId");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_assignedToId_idx" ON "Appointment"("tenantId", "assignedToId");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_vehicleId_idx" ON "Appointment"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "LeadScore_tenantId_leadId_idx" ON "LeadScore"("tenantId", "leadId");

-- CreateIndex
CREATE INDEX "LeadScore_tenantId_createdAt_idx" ON "LeadScore"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Communication_tenantId_type_idx" ON "Communication"("tenantId", "type");

-- CreateIndex
CREATE INDEX "Communication_tenantId_leadId_idx" ON "Communication"("tenantId", "leadId");

-- CreateIndex
CREATE INDEX "Communication_tenantId_createdAt_idx" ON "Communication"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "EmailTemplate_tenantId_updatedAt_idx" ON "EmailTemplate"("tenantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_tenantId_name_key" ON "EmailTemplate"("tenantId", "name");

-- CreateIndex
CREATE INDEX "SMSTemplate_tenantId_updatedAt_idx" ON "SMSTemplate"("tenantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SMSTemplate_tenantId_name_key" ON "SMSTemplate"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Automation_tenantId_isActive_idx" ON "Automation"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Automation_tenantId_name_key" ON "Automation"("tenantId", "name");

-- CreateIndex
CREATE INDEX "AutomationExecution_tenantId_triggerType_idx" ON "AutomationExecution"("tenantId", "triggerType");

-- CreateIndex
CREATE INDEX "AutomationExecution_tenantId_automationId_idx" ON "AutomationExecution"("tenantId", "automationId");

-- CreateIndex
CREATE INDEX "CustomerVehicle_tenantId_customerId_idx" ON "CustomerVehicle"("tenantId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerVehicle_tenantId_vin_key" ON "CustomerVehicle"("tenantId", "vin");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_status_idx" ON "Vehicle"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_make_model_idx" ON "Vehicle"("tenantId", "make", "model");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_acquisitionType_idx" ON "Vehicle"("tenantId", "acquisitionType");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_appraisalStatus_idx" ON "Vehicle"("tenantId", "appraisalStatus");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_idx" ON "Vehicle"("tenantId");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_search_vector_idx" ON "Vehicle"("tenantId", "search_vector");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_tenantId_stockNumber_key" ON "Vehicle"("tenantId", "stockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE INDEX "VehicleHistory_tenantId_vehicleId_idx" ON "VehicleHistory"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "Appraisal_tenantId_status_idx" ON "Appraisal"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Appraisal_tenantId_vehicleId_idx" ON "Appraisal"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "Appraisal_tenantId_vin_idx" ON "Appraisal"("tenantId", "vin");

-- CreateIndex
CREATE INDEX "ReconItem_tenantId_vehicleId_idx" ON "ReconItem"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "ReconItem_tenantId_status_idx" ON "ReconItem"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PriceHistory_tenantId_vehicleId_idx" ON "PriceHistory"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "PriceHistory_tenantId_createdAt_idx" ON "PriceHistory"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuctionPurchase_tenantId_vehicleId_idx" ON "AuctionPurchase"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "AuctionPurchase_tenantId_status_idx" ON "AuctionPurchase"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionPurchase_vehicleId_key" ON "AuctionPurchase"("vehicleId");

-- CreateIndex
CREATE INDEX "WholesaleListing_tenantId_vehicleId_idx" ON "WholesaleListing"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "WholesaleListing_tenantId_status_idx" ON "WholesaleListing"("tenantId", "status");

-- CreateIndex
CREATE INDEX "MarketComp_tenantId_vehicleId_idx" ON "MarketComp"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "MarketComp_tenantId_source_idx" ON "MarketComp"("tenantId", "source");

-- CreateIndex
CREATE INDEX "Deal_tenantId_status_idx" ON "Deal"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Deal_tenantId_customerId_idx" ON "Deal"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "Deal_tenantId_salesPersonId_idx" ON "Deal"("tenantId", "salesPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_tenantId_dealNumber_key" ON "Deal"("tenantId", "dealNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DealWorksheet_versionPointerId_key" ON "DealWorksheet"("versionPointerId");

-- CreateIndex
CREATE INDEX "DealWorksheet_tenantId_dealId_idx" ON "DealWorksheet"("tenantId", "dealId");

-- CreateIndex
CREATE INDEX "DealWorksheet_tenantId_customerId_idx" ON "DealWorksheet"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "DealWorksheet_tenantId_vehicleId_idx" ON "DealWorksheet"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "DealWorksheet_tenantId_status_idx" ON "DealWorksheet"("tenantId", "status");

-- CreateIndex
CREATE INDEX "DealWorksheet_dealId_createdAt_idx" ON "DealWorksheet"("dealId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DealWorksheet_tenantId_versionPointerId_idx" ON "DealWorksheet"("tenantId", "versionPointerId");

-- CreateIndex
CREATE INDEX "DealWorksheet_structure_idx" ON "DealWorksheet" USING GIN ("structure");

-- CreateIndex
CREATE INDEX "DealWorksheet_totals_idx" ON "DealWorksheet" USING GIN ("totals");

-- CreateIndex
CREATE INDEX "DealVersion_tenantId_dealId_idx" ON "DealVersion"("tenantId", "dealId");

-- CreateIndex
CREATE INDEX "DealVersion_tenantId_worksheetId_idx" ON "DealVersion"("tenantId", "worksheetId");

-- CreateIndex
CREATE INDEX "DealVersion_dealId_createdAt_idx" ON "DealVersion"("dealId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DealVersion_worksheetId_createdAt_idx" ON "DealVersion"("worksheetId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DealVersion_snapshot_idx" ON "DealVersion" USING GIN ("snapshot");

-- CreateIndex
CREATE INDEX "DealVersion_grossBreakdown_idx" ON "DealVersion" USING GIN ("grossBreakdown");

-- CreateIndex
CREATE INDEX "CreditSubmissionDraft_tenantId_dealId_idx" ON "CreditSubmissionDraft"("tenantId", "dealId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditSubmissionDraft_tenantId_versionId_key" ON "CreditSubmissionDraft"("tenantId", "versionId");

-- CreateIndex
CREATE INDEX "DealOptimization_tenantId_dealId_idx" ON "DealOptimization"("tenantId", "dealId");

-- CreateIndex
CREATE INDEX "DealOptimization_dealId_createdAt_idx" ON "DealOptimization"("dealId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DealOptimization_tenantId_worksheetId_idx" ON "DealOptimization"("tenantId", "worksheetId");

-- CreateIndex
CREATE INDEX "DealOptimization_tenantId_versionId_idx" ON "DealOptimization"("tenantId", "versionId");

-- CreateIndex
CREATE INDEX "DealOptimization_tenantId_mlTraceId_idx" ON "DealOptimization"("tenantId", "mlTraceId");

-- CreateIndex
CREATE INDEX "DealOptimization_goals_idx" ON "DealOptimization" USING GIN ("goals");

-- CreateIndex
CREATE INDEX "DealOptimization_recommendedStructure_idx" ON "DealOptimization" USING GIN ("recommendedStructure");

-- CreateIndex
CREATE INDEX "DealOptimization_alternatives_idx" ON "DealOptimization" USING GIN ("alternatives");

-- CreateIndex
CREATE INDEX "CounterOffer_tenantId_dealId_idx" ON "CounterOffer"("tenantId", "dealId");

-- CreateIndex
CREATE INDEX "CounterOffer_tenantId_outcome_idx" ON "CounterOffer"("tenantId", "outcome");

-- CreateIndex
CREATE INDEX "CounterOffer_dealId_createdAt_idx" ON "CounterOffer"("dealId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CounterOffer_input_idx" ON "CounterOffer" USING GIN ("input");

-- CreateIndex
CREATE INDEX "CounterOffer_aiResponse_idx" ON "CounterOffer" USING GIN ("aiResponse");

-- CreateIndex
CREATE INDEX "ApprovalPrediction_tenantId_dealId_idx" ON "ApprovalPrediction"("tenantId", "dealId");

-- CreateIndex
CREATE INDEX "ApprovalPrediction_tenantId_lenderId_idx" ON "ApprovalPrediction"("tenantId", "lenderId");

-- CreateIndex
CREATE INDEX "ApprovalPrediction_tenantId_recommendation_idx" ON "ApprovalPrediction"("tenantId", "recommendation");

-- CreateIndex
CREATE INDEX "ApprovalPrediction_dealId_createdAt_idx" ON "ApprovalPrediction"("dealId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ApprovalPrediction_stipulations_idx" ON "ApprovalPrediction" USING GIN ("stipulations");

-- CreateIndex
CREATE UNIQUE INDEX "DealJacket_dealNumber_key" ON "DealJacket"("dealNumber");

-- CreateIndex
CREATE INDEX "DealJacket_tenantId_idx" ON "DealJacket"("tenantId");

-- CreateIndex
CREATE INDEX "DealJacket_customerId_idx" ON "DealJacket"("customerId");

-- CreateIndex
CREATE INDEX "DealJacket_status_idx" ON "DealJacket"("status");

-- CreateIndex
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");

-- CreateIndex
CREATE INDEX "Contract_dealId_idx" ON "Contract"("dealId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Signature_contractId_idx" ON "Signature"("contractId");

-- CreateIndex
CREATE INDEX "FIProduct_tenantId_idx" ON "FIProduct"("tenantId");

-- CreateIndex
CREATE INDEX "FIProduct_category_idx" ON "FIProduct"("category");

-- CreateIndex
CREATE UNIQUE INDEX "MenuConfiguration_dealId_key" ON "MenuConfiguration"("dealId");

-- CreateIndex
CREATE INDEX "MenuConfiguration_tenantId_idx" ON "MenuConfiguration"("tenantId");

-- CreateIndex
CREATE INDEX "MenuConfiguration_dealId_idx" ON "MenuConfiguration"("dealId");

-- CreateIndex
CREATE INDEX "DealDocument_dealId_idx" ON "DealDocument"("dealId");

-- CreateIndex
CREATE INDEX "DealDocument_type_idx" ON "DealDocument"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceChecklist_dealId_key" ON "ComplianceChecklist"("dealId");

-- CreateIndex
CREATE INDEX "ComplianceChecklist_tenantId_idx" ON "ComplianceChecklist"("tenantId");

-- CreateIndex
CREATE INDEX "ComplianceChecklist_dealId_idx" ON "ComplianceChecklist"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditApplication_dealId_key" ON "CreditApplication"("dealId");

-- CreateIndex
CREATE INDEX "CreditApplication_tenantId_idx" ON "CreditApplication"("tenantId");

-- CreateIndex
CREATE INDEX "CreditApplication_dealId_idx" ON "CreditApplication"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditReport_creditApplicationId_key" ON "CreditReport"("creditApplicationId");

-- CreateIndex
CREATE INDEX "CreditReport_tenantId_idx" ON "CreditReport"("tenantId");

-- CreateIndex
CREATE INDEX "CreditReport_creditApplicationId_idx" ON "CreditReport"("creditApplicationId");

-- CreateIndex
CREATE INDEX "Lender_tenantId_idx" ON "Lender"("tenantId");

-- CreateIndex
CREATE INDEX "LenderSubmission_tenantId_idx" ON "LenderSubmission"("tenantId");

-- CreateIndex
CREATE INDEX "LenderSubmission_dealId_idx" ON "LenderSubmission"("dealId");

-- CreateIndex
CREATE INDEX "LenderSubmission_status_idx" ON "LenderSubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FundingChecklist_dealId_key" ON "FundingChecklist"("dealId");

-- CreateIndex
CREATE INDEX "FundingChecklist_tenantId_idx" ON "FundingChecklist"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FundingRequest_dealId_key" ON "FundingRequest"("dealId");

-- CreateIndex
CREATE INDEX "FundingRequest_tenantId_idx" ON "FundingRequest"("tenantId");

-- CreateIndex
CREATE INDEX "FundingRequest_dealId_idx" ON "FundingRequest"("dealId");

-- CreateIndex
CREATE INDEX "FundingRequest_status_idx" ON "FundingRequest"("status");

-- CreateIndex
CREATE INDEX "GLAccount_tenantId_parentAccountId_idx" ON "GLAccount"("tenantId", "parentAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "GLAccount_tenantId_accountNumber_key" ON "GLAccount"("tenantId", "accountNumber");

-- CreateIndex
CREATE INDEX "JournalEntry_tenantId_dealId_idx" ON "JournalEntry"("tenantId", "dealId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_tenantId_entryNumber_key" ON "JournalEntry"("tenantId", "entryNumber");

-- CreateIndex
CREATE INDEX "JournalEntryLine_tenantId_journalEntryId_idx" ON "JournalEntryLine"("tenantId", "journalEntryId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_tenantId_glAccountId_idx" ON "JournalEntryLine"("tenantId", "glAccountId");

-- CreateIndex
CREATE INDEX "Commission_tenantId_userId_idx" ON "Commission"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Commission_tenantId_status_idx" ON "Commission"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Report_tenantId_type_idx" ON "Report"("tenantId", "type");

-- CreateIndex
CREATE INDEX "Notification_tenantId_userId_isRead_idx" ON "Notification"("tenantId", "userId", "isRead");

-- CreateIndex
CREATE INDEX "WorkflowDefinition_tenantId_idx" ON "WorkflowDefinition"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_tenantId_name_key" ON "WorkflowDefinition"("tenantId", "name");

-- CreateIndex
CREATE INDEX "WorkflowStage_tenantId_definitionId_position_idx" ON "WorkflowStage"("tenantId", "definitionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_tenantId_definitionId_key_key" ON "WorkflowStage"("tenantId", "definitionId", "key");

-- CreateIndex
CREATE INDEX "VehicleWorkflow_tenantId_definitionId_idx" ON "VehicleWorkflow"("tenantId", "definitionId");

-- CreateIndex
CREATE INDEX "VehicleWorkflow_tenantId_currentStageId_idx" ON "VehicleWorkflow"("tenantId", "currentStageId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleWorkflow_tenantId_vehicleId_key" ON "VehicleWorkflow"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "StageTransition_tenantId_workflowId_at_idx" ON "StageTransition"("tenantId", "workflowId", "at");

-- CreateIndex
CREATE INDEX "WorkflowTask_tenantId_vehicleId_idx" ON "WorkflowTask"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "WorkflowTask_tenantId_workflowId_idx" ON "WorkflowTask"("tenantId", "workflowId");

-- CreateIndex
CREATE INDEX "WorkflowTask_tenantId_status_idx" ON "WorkflowTask"("tenantId", "status");

-- CreateIndex
CREATE INDEX "WorkflowTask_tenantId_type_idx" ON "WorkflowTask"("tenantId", "type");

-- CreateIndex
CREATE INDEX "TransportOrder_tenantId_vehicleId_idx" ON "TransportOrder"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "TransportOrder_tenantId_workflowId_idx" ON "TransportOrder"("tenantId", "workflowId");

-- CreateIndex
CREATE INDEX "TransportOrder_tenantId_status_idx" ON "TransportOrder"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PipelineAggregate_tenantId_bucketStart_idx" ON "PipelineAggregate"("tenantId", "bucketStart");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineAggregate_tenantId_definitionId_stageKey_bucketStar_key" ON "PipelineAggregate"("tenantId", "definitionId", "stageKey", "bucketStart");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_resource_idx" ON "AuditLog"("tenantId", "resource");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_userId_idx" ON "AuditLog"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "SystemSetting_tenantId_idx" ON "SystemSetting"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_tenantId_key_key" ON "SystemSetting"("tenantId", "key");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInteraction" ADD CONSTRAINT "CustomerInteraction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInteraction" ADD CONSTRAINT "CustomerInteraction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInteraction" ADD CONSTRAINT "CustomerInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_followUpTaskId_fkey" FOREIGN KEY ("followUpTaskId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadScore" ADD CONSTRAINT "LeadScore_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadScore" ADD CONSTRAINT "LeadScore_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMSTemplate" ADD CONSTRAINT "SMSTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerVehicle" ADD CONSTRAINT "CustomerVehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerVehicle" ADD CONSTRAINT "CustomerVehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleHistory" ADD CONSTRAINT "VehicleHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleHistory" ADD CONSTRAINT "VehicleHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_appraiserId_fkey" FOREIGN KEY ("appraiserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconItem" ADD CONSTRAINT "ReconItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconItem" ADD CONSTRAINT "ReconItem_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconItem" ADD CONSTRAINT "ReconItem_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "Appraisal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionPurchase" ADD CONSTRAINT "AuctionPurchase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionPurchase" ADD CONSTRAINT "AuctionPurchase_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleListing" ADD CONSTRAINT "WholesaleListing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleListing" ADD CONSTRAINT "WholesaleListing_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketComp" ADD CONSTRAINT "MarketComp_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketComp" ADD CONSTRAINT "MarketComp_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_financeManagerId_fkey" FOREIGN KEY ("financeManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_tradeVehicleId_fkey" FOREIGN KEY ("tradeVehicleId") REFERENCES "CustomerVehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealWorksheet" ADD CONSTRAINT "DealWorksheet_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealWorksheet" ADD CONSTRAINT "DealWorksheet_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealWorksheet" ADD CONSTRAINT "DealWorksheet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealWorksheet" ADD CONSTRAINT "DealWorksheet_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealWorksheet" ADD CONSTRAINT "DealWorksheet_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealWorksheet" ADD CONSTRAINT "DealWorksheet_versionPointerId_fkey" FOREIGN KEY ("versionPointerId") REFERENCES "DealVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealVersion" ADD CONSTRAINT "DealVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealVersion" ADD CONSTRAINT "DealVersion_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealVersion" ADD CONSTRAINT "DealVersion_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealVersion" ADD CONSTRAINT "DealVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditSubmissionDraft" ADD CONSTRAINT "CreditSubmissionDraft_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditSubmissionDraft" ADD CONSTRAINT "CreditSubmissionDraft_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditSubmissionDraft" ADD CONSTRAINT "CreditSubmissionDraft_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditSubmissionDraft" ADD CONSTRAINT "CreditSubmissionDraft_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "DealVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealOptimization" ADD CONSTRAINT "DealOptimization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealOptimization" ADD CONSTRAINT "DealOptimization_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealOptimization" ADD CONSTRAINT "DealOptimization_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealOptimization" ADD CONSTRAINT "DealOptimization_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "DealVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealOptimization" ADD CONSTRAINT "DealOptimization_runById_fkey" FOREIGN KEY ("runById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounterOffer" ADD CONSTRAINT "CounterOffer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounterOffer" ADD CONSTRAINT "CounterOffer_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounterOffer" ADD CONSTRAINT "CounterOffer_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounterOffer" ADD CONSTRAINT "CounterOffer_originalVersionId_fkey" FOREIGN KEY ("originalVersionId") REFERENCES "DealVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounterOffer" ADD CONSTRAINT "CounterOffer_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalPrediction" ADD CONSTRAINT "ApprovalPrediction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalPrediction" ADD CONSTRAINT "ApprovalPrediction_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalPrediction" ADD CONSTRAINT "ApprovalPrediction_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "DealWorksheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalPrediction" ADD CONSTRAINT "ApprovalPrediction_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "DealVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalPrediction" ADD CONSTRAINT "ApprovalPrediction_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealJacket" ADD CONSTRAINT "DealJacket_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealJacket" ADD CONSTRAINT "DealJacket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealJacket" ADD CONSTRAINT "DealJacket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealJacket" ADD CONSTRAINT "DealJacket_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealJacket" ADD CONSTRAINT "DealJacket_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealJacket" ADD CONSTRAINT "DealJacket_fiManagerId_fkey" FOREIGN KEY ("fiManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FIProduct" ADD CONSTRAINT "FIProduct_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuConfiguration" ADD CONSTRAINT "MenuConfiguration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuConfiguration" ADD CONSTRAINT "MenuConfiguration_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealDocument" ADD CONSTRAINT "DealDocument_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceChecklist" ADD CONSTRAINT "ComplianceChecklist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceChecklist" ADD CONSTRAINT "ComplianceChecklist_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditApplication" ADD CONSTRAINT "CreditApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditApplication" ADD CONSTRAINT "CreditApplication_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditReport" ADD CONSTRAINT "CreditReport_creditApplicationId_fkey" FOREIGN KEY ("creditApplicationId") REFERENCES "CreditApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditReport" ADD CONSTRAINT "CreditReport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lender" ADD CONSTRAINT "Lender_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderSubmission" ADD CONSTRAINT "LenderSubmission_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderSubmission" ADD CONSTRAINT "LenderSubmission_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderSubmission" ADD CONSTRAINT "LenderSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingChecklist" ADD CONSTRAINT "FundingChecklist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingChecklist" ADD CONSTRAINT "FundingChecklist_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingChecklist" ADD CONSTRAINT "FundingChecklist_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "DealJacket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GLAccount" ADD CONSTRAINT "GLAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GLAccount" ADD CONSTRAINT "GLAccount_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "GLAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_glAccountId_fkey" FOREIGN KEY ("glAccountId") REFERENCES "GLAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowDefinition" ADD CONSTRAINT "WorkflowDefinition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleWorkflow" ADD CONSTRAINT "VehicleWorkflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleWorkflow" ADD CONSTRAINT "VehicleWorkflow_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleWorkflow" ADD CONSTRAINT "VehicleWorkflow_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleWorkflow" ADD CONSTRAINT "VehicleWorkflow_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "VehicleWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "WorkflowStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_byUserId_fkey" FOREIGN KEY ("byUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "VehicleWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "VehicleWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineAggregate" ADD CONSTRAINT "PipelineAggregate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineAggregate" ADD CONSTRAINT "PipelineAggregate_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

