import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import prisma from '../lib/prisma.js';
import { BadRequest, Forbidden, NotFound } from '../lib/errors.js';
import type { AppRole } from '../types/express.js';
import {
  buildDealDocumentKey,
  deleteFromS3,
  extractKeyFromUrl,
  generateDocumentId,
  getSignedDownloadUrl,
  runVirusScan,
  uploadBufferToS3,
} from '../lib/storage/s3.js';
import {
  contractGeneratorService,
  type ContractCustomerSummary,
  type ContractPricingSummary,
  type ContractVehicleSummary,
} from './contract-generator.service.js';
import { docuSignService } from './docusign.service.js';
import {
  CONTRACT_TYPES,
  REQUIRED_CONTRACT_TYPES,
  getContractDisplayName,
  type ContractSigner,
  type ContractType,
} from './contracts.types.js';
import {
  lenderIntegrationService,
  IntegrationConfigurationError,
  LenderIntegrationError,
  type RouteOneSubmission,
  type LenderDecision,
  type Stipulation,
} from './lender-integration.service.js';

interface UploadDescriptor {
  type: string;
  category: string;
  name?: string;
}

const READ_ROLES: AppRole[] = ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FINANCE', 'FI_MANAGER', 'SALES'];
const WRITE_ROLES: AppRole[] = ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FINANCE', 'FI_MANAGER'];
const ACTIVE_SUBMISSION_STATUSES = ['PENDING', 'CONDITIONAL', 'COUNTERED'];
const FINAL_APPROVAL_STATUSES = ['APPROVED', 'CONDITIONAL'];

function decimalToNumber(value: Prisma.Decimal | string | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Prisma.Decimal) {
    return Number(value.toNumber());
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }
  return Number.isFinite(value) ? Number(value) : null;
}

function toDecimal(value: number | null | undefined, scale: number | null = null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  if (scale !== null) {
    return new Prisma.Decimal(value.toFixed(scale));
  }
  return new Prisma.Decimal(value);
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateMonthlyPayment(
  amount: number,
  apr?: number | null,
  term?: number | null,
): number | null {
  if (!term || term <= 0) {
    return null;
  }

  if (amount <= 0) {
    return 0;
  }

  const rate = !apr ? 0 : apr / 100 / 12;

  if (rate === 0) {
    return amount / term;
  }

  const factor = (1 + rate) ** term;
  const payment = (amount * rate * factor) / (factor - 1);
  return Number.isFinite(payment) ? payment : null;
}

function roundToCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function updateStipulations(stipulations: Stipulation[], stipulationId: string, note?: string) {
  return stipulations.map((stipulation) => {
    if (stipulation.id !== stipulationId) {
      return stipulation;
    }
    return {
      ...stipulation,
      status: 'SATISFIED',
      receivedAt: new Date().toISOString(),
      notes: note ?? stipulation.notes ?? null,
    } satisfies Stipulation;
  });
}

function extractErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '');
  }
  return null;
}

type AuthenticatedUser = NonNullable<Request['user']>;

type DealWithContractContext = Prisma.DealJacketGetPayload<{
  include: {
    customer: true;
    vehicle: true;
    fiManager: { select: { id: true; firstName: true; lastName: true; email: true } };
    salesperson: { select: { id: true; firstName: true; lastName: true; email: true } };
    creditApplication: true;
    lender: true;
  };
}>;

interface RecipientStatusPayload {
  name: string;
  email: string;
  role?: string;
  status: string;
  completedDateTime?: string;
  ipAddress?: string;
  signatureData?: unknown;
}
type DealWithFinance = Prisma.DealJacketGetPayload<{
  include: {
    customer: true;
    vehicle: true;
    creditApplication: true;
  };
}>;

type FiProductDto = {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  coverageDetails: Prisma.JsonValue | null;
  cost: number;
  retailPrice: number;
  markup: number;
  margin: number;
  term: number | null;
  termType: string | null;
  deductible: number | null;
  minVehicleAge: number | null;
  maxVehicleAge: number | null;
  minMileage: number | null;
  maxMileage: number | null;
  isActive: boolean;
};

type MenuOptionProductSnapshot = {
  id: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  coverageDetails: Prisma.JsonValue | null;
  cost: number;
  retailPrice: number;
  markup: number;
  term: number | null;
  termType: string | null;
  deductible: number | null;
  minVehicleAge: number | null;
  maxVehicleAge: number | null;
  minMileage: number | null;
  maxMileage: number | null;
};

type MenuOptionSnapshot = {
  code: 'A' | 'B' | 'C' | 'D';
  label: string;
  products: MenuOptionProductSnapshot[];
  totalRetail: number;
  totalCost: number;
  totalMarkup: number;
  paymentImpact: number | null;
};

interface MenuOptionInput {
  code: 'A' | 'B' | 'C' | 'D';
  label?: string | null;
  productIds: string[];
}

interface BuildMenuPayload {
  dealId: string;
  options: MenuOptionInput[];
}

interface MenuAvailability {
  product: FiProductDto;
  eligible: boolean;
  reasons: string[];
}

interface MenuConfigurationSummary {
  id: string | null;
  dealId: string;
  options: MenuOptionSnapshot[];
  selectedOption: string | null;
  selectedProducts: MenuOptionSnapshot | null;
  totalProductCost: number | null;
  totalMarkup: number | null;
  paymentImpact: number | null;
  selectedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface MenuPresentationResponse {
  configuration: MenuConfigurationSummary;
  availableProducts: MenuAvailability[];
  baseAmountFinanced: number;
  baseMonthlyPayment: number | null;
  apr: number | null;
  term: number | null;
  vehicle: { year: number | null; mileage: number | null };
}

export class FiService {
  constructor(private readonly db = prisma) {}

  private ensureReadAccess(user: AuthenticatedUser) {
    if (user.isSuperAdmin) {
      return;
    }
    if (!READ_ROLES.includes(user.role)) {
      throw Forbidden('You do not have permission to view F&I deals');
    }
  }

  private ensureWriteAccess(user: AuthenticatedUser) {
    if (user.isSuperAdmin) {
      return;
    }
    if (!WRITE_ROLES.includes(user.role)) {
      throw Forbidden('You do not have permission to modify F&I deals');
    }
  }

  private async requireDealForTenant(dealId: string, tenantId: string) {
    const deal = await this.db.dealJacket.findFirst({
      where: { id: dealId, tenantId },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    return deal;
  }

  private getVehicleAge(vehicle?: Prisma.Vehicle | null) {
    if (!vehicle || !vehicle.year) {
      return null;
    }
    const now = new Date();
    const age = now.getFullYear() - vehicle.year;
    return age < 0 ? 0 : age;
  }

  private normalizeContractType(type: string): ContractType {
    const value = type?.toUpperCase().trim();
    if (!value) {
      throw BadRequest('Contract type is required');
    }
    if (!CONTRACT_TYPES.includes(value as ContractType)) {
      throw BadRequest(`Unsupported contract type: ${type}`);
    }
    return value as ContractType;
  }

  private buildPricingSummary(deal: DealWithContractContext): ContractPricingSummary {
    const sellingPrice = decimalToNumber(deal.sellingPrice) ?? 0;
    const cashDown = decimalToNumber(deal.cashDown) ?? 0;
    const amountFinanced = decimalToNumber(deal.amountFinanced) ?? 0;
    const tradeValue = decimalToNumber(deal.tradeValue);
    const tradePayoff = decimalToNumber(deal.tradePayoff);
    const monthlyPayment = decimalToNumber(deal.monthlyPayment);
    const apr = decimalToNumber(deal.apr);
    const products = this.extractProtectionProducts(deal.fiProducts);

    return {
      sellingPrice,
      cashDown,
      amountFinanced,
      tradeValue,
      tradePayoff,
      apr,
      termMonths: deal.term ?? null,
      monthlyPayment,
      products: products.length ? products : undefined,
    };
  }

  private buildVehicleSummary(deal: DealWithContractContext): ContractVehicleSummary {
    const vehicle = deal.vehicle;
    return {
      vin: vehicle.vin,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim ?? null,
      mileage: vehicle.mileage ?? null,
      stockNumber: vehicle.stockNumber ?? null,
    };
  }

  private buildCustomerSummary(customer: Prisma.Customer): ContractCustomerSummary {
    const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
    return {
      fullName,
      email: customer.email ?? null,
      phone: customer.phone ?? customer.mobile ?? null,
      addressLine1: customer.addressStreet ?? null,
      city: customer.addressCity ?? null,
      state: customer.addressState ?? null,
      postalCode: customer.addressZip ?? null,
    };
  }

  private buildCoBuyerSummary(deal: DealWithContractContext): ContractCustomerSummary | null {
    const coApplicant = deal.creditApplication?.coApplicant as
      | { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string; city?: string; state?: string; zip?: string }
      | null
      | undefined;
    if (!coApplicant) {
      return null;
    }

    const fullName = [coApplicant.firstName, coApplicant.lastName].filter(Boolean).join(' ').trim();
    if (!fullName) {
      return null;
    }

    return {
      fullName,
      email: coApplicant.email ?? null,
      phone: coApplicant.phone ?? null,
      addressLine1: coApplicant.address ?? null,
      city: coApplicant.city ?? null,
      state: coApplicant.state ?? null,
      postalCode: coApplicant.zip ?? null,
    };
  }

  private extractProtectionProducts(fiProducts: Prisma.JsonValue | null): NonNullable<ContractPricingSummary['products']> {
    const products: NonNullable<ContractPricingSummary['products']> = [];
    if (!fiProducts) {
      return products;
    }

    const raw = Array.isArray(fiProducts)
      ? (fiProducts as Array<Record<string, unknown>>)
      : (typeof fiProducts === 'object' && fiProducts !== null
          ? ((fiProducts as Record<string, unknown>).selectedProducts as Array<Record<string, unknown>>) ??
            ((fiProducts as Record<string, unknown>).products as Array<Record<string, unknown>>)
          : undefined);

    if (raw && Array.isArray(raw)) {
      for (const entry of raw) {
        const name = String(entry?.name ?? entry?.title ?? '').trim();
        if (!name) {
          continue;
        }
        const priceValue = entry?.price ?? entry?.retailPrice ?? entry?.amount;
        const price = typeof priceValue === 'number' ? priceValue : Number(priceValue ?? 0);
        const provider = (entry?.provider ?? entry?.vendor ?? null) as string | null;
        products.push({ name, price: Number.isFinite(price) ? price : 0, provider });
      }
    }

    return products;
  }

  private buildDefaultSigners(
    deal: DealWithContractContext,
    coBuyer: ContractCustomerSummary | null,
    type: ContractType,
  ): ContractSigner[] {
    const signers: ContractSigner[] = [];
    const buyer = this.buildCustomerSummary(deal.customer);
    if (buyer.fullName) {
      signers.push({
        name: buyer.fullName,
        email: buyer.email ?? '',
        role: 'BUYER',
        roleLabel: 'Buyer',
        routingOrder: 1,
      });
    }

    if (coBuyer) {
      signers.push({
        name: coBuyer.fullName,
        email: coBuyer.email ?? '',
        role: 'CO_BUYER',
        roleLabel: 'Co-Buyer',
        routingOrder: signers.length + 1,
      });
    }

    const dealerRepresentative = deal.fiManager ?? deal.salesperson;
    const requiresDealer = ['POA', 'ARBITRATION', 'BILL_OF_SALE', 'RISC', 'BUYERS_ORDER'].includes(type);
    if (requiresDealer && dealerRepresentative) {
      const dealerName = [dealerRepresentative.firstName, dealerRepresentative.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      signers.push({
        name: dealerName,
        email: dealerRepresentative.email ?? buyer.email ?? '',
        role: 'DEALER_REP',
        roleLabel: 'Dealer Representative',
        routingOrder: signers.length + 1,
      });
    }

    return signers;
  }

  private normalizeSigners(signers: ContractSigner[]): ContractSigner[] {
    return signers.map((signer, index) => ({
      ...signer,
      email: signer.email?.trim() ?? '',
      name: signer.name.trim(),
      routingOrder: signer.routingOrder ?? index + 1,
    }));
  }

  private extractEnvelopeId(payload: Record<string, any>): string | null {
    return (
      payload?.envelopeId ??
      payload?.EnvelopeID ??
      payload?.envelopeSummary?.envelopeId ??
      payload?.envelopeStatus?.envelopeId ??
      payload?.event?.envelopeId ??
      null
    );
  }

  private extractEnvelopeStatus(payload: Record<string, any>): string | null {
    const status =
      payload?.status ??
      payload?.envelopeStatus?.status ??
      payload?.envelopeSummary?.status ??
      payload?.event?.status ??
      payload?.envelopeStatus?.envelopeStatus ??
      null;

    return status ? String(status) : null;
  }

  private extractRecipientStatuses(payload: Record<string, any>): RecipientStatusPayload[] {
    const recipients: RecipientStatusPayload[] = [];
    const sources = [
      payload?.recipients?.signers,
      payload?.envelopeSummary?.recipients?.signers,
      payload?.envelopeStatus?.recipientStatuses,
      payload?.recipientStatuses,
    ];

    for (const source of sources) {
      if (!Array.isArray(source)) {
        continue;
      }

      for (const entry of source) {
        const email = String(entry?.email ?? entry?.emailAddress ?? entry?.recipientEmail ?? '').trim();
        const name = String(entry?.name ?? entry?.fullName ?? entry?.userName ?? email).trim();
        if (!email && !name) {
          continue;
        }

        recipients.push({
          email,
          name,
          role: entry?.roleName ?? entry?.role ?? entry?.recipientType ?? undefined,
          status: String(entry?.status ?? entry?.recipientStatus ?? '').trim(),
          completedDateTime: entry?.completedDateTime ?? entry?.completedOn ?? entry?.signedDateTime ?? undefined,
          ipAddress: entry?.clientIPAddress ?? entry?.ipAddress ?? entry?.signerIpAddress ?? undefined,
          signatureData: entry?.tabs ?? entry?.tabStatuses ?? entry?.signerAttachment ?? undefined,
        });
      }
    }

    return recipients;
  }

  private async upsertContractSignature(contractId: string, signer: RecipientStatusPayload) {
    if (!signer.email) {
      return;
    }

    const existing = await this.db.signature.findFirst({
      where: { contractId, signerEmail: signer.email },
    });

    const signedAt = signer.completedDateTime ? new Date(signer.completedDateTime) : new Date();
    const payload: Prisma.SignatureCreateInput = {
      contract: { connect: { id: contractId } },
      signerName: signer.name,
      signerEmail: signer.email,
      signerRole: signer.role ?? 'SIGNER',
      ipAddress: signer.ipAddress ?? 'unknown',
      signatureData: JSON.stringify(signer.signatureData ?? {}),
      signedAt,
    };

    if (existing) {
      await this.db.signature.update({
        where: { id: existing.id },
        data: {
          signerName: payload.signerName,
          signerRole: payload.signerRole,
          ipAddress: payload.ipAddress,
          signatureData: payload.signatureData,
          signedAt: payload.signedAt,
        },
      });
    } else {
      await this.db.signature.create({ data: payload });
    }
  }

  private async updateDealContractStatus(dealId: string, tenantId: string) {
    const contracts = await this.db.contract.findMany({
      where: {
        tenantId,
        dealId,
        type: { in: REQUIRED_CONTRACT_TYPES },
      },
      select: { type: true, status: true },
    });

    if (!contracts.length) {
      return;
    }

    const completed = new Set<ContractType>();
    for (const contract of contracts) {
      const status = String(contract.status).toUpperCase();
      if (status === 'COMPLETED' || status === 'SIGNED') {
        completed.add(this.normalizeContractType(contract.type));
      }
    }

    if (REQUIRED_CONTRACT_TYPES.every((type) => completed.has(type))) {
      await this.db.dealJacket.update({
        where: { id: dealId },
        data: { status: 'Contracted', contractDate: new Date() },
      });
    }
  }

  private formatFiProduct(product: Prisma.FIProductGetPayload<{}>): FiProductDto {
    const cost = decimalToNumber(product.cost) ?? 0;
    const retailPrice = decimalToNumber(product.retailPrice) ?? 0;
    const markup = decimalToNumber(product.markup) ?? roundToCurrency(retailPrice - cost);
    const deductible = decimalToNumber(product.deductible);

    return {
      id: product.id,
      tenantId: product.tenantId,
      name: product.name,
      category: product.category,
      provider: product.provider,
      description: product.description,
      coverageDetails: product.coverageDetails ?? null,
      cost: roundToCurrency(cost),
      retailPrice: roundToCurrency(retailPrice),
      markup: roundToCurrency(markup),
      margin: roundToCurrency(markup),
      term: product.term ?? null,
      termType: product.termType ?? null,
      deductible: deductible === null ? null : roundToCurrency(deductible),
      minVehicleAge: product.minVehicleAge ?? null,
      maxVehicleAge: product.maxVehicleAge ?? null,
      minMileage: product.minMileage ?? null,
      maxMileage: product.maxMileage ?? null,
      isActive: product.isActive,
    } satisfies FiProductDto;
  }

  private createProductSnapshot(product: Prisma.FIProductGetPayload<{}>): MenuOptionProductSnapshot {
    const formatted = this.formatFiProduct(product);
    return {
      id: formatted.id,
      name: formatted.name,
      category: formatted.category,
      provider: formatted.provider,
      description: formatted.description,
      coverageDetails: formatted.coverageDetails,
      cost: formatted.cost,
      retailPrice: formatted.retailPrice,
      markup: formatted.markup,
      term: formatted.term,
      termType: formatted.termType,
      deductible: formatted.deductible,
      minVehicleAge: formatted.minVehicleAge,
      maxVehicleAge: formatted.maxVehicleAge,
      minMileage: formatted.minMileage,
      maxMileage: formatted.maxMileage,
    } satisfies MenuOptionProductSnapshot;
  }

  private evaluateProductEligibility(
    product: Prisma.FIProductGetPayload<{}>,
    vehicleAge: number | null,
    vehicleMileage: number | null,
  ) {
    const reasons: string[] = [];
    const addReason = (reason: string) => {
      if (!reasons.includes(reason)) {
        reasons.push(reason);
      }
    };

    if (product.minVehicleAge !== null && product.minVehicleAge !== undefined) {
      if (vehicleAge === null) {
        addReason('Vehicle age information is required');
      } else if (vehicleAge < product.minVehicleAge) {
        addReason(`Vehicle must be at least ${product.minVehicleAge} years old`);
      }
    }

    if (product.maxVehicleAge !== null && product.maxVehicleAge !== undefined) {
      if (vehicleAge === null) {
        addReason('Vehicle age information is required');
      } else if (vehicleAge > product.maxVehicleAge) {
        addReason(`Vehicle must be no more than ${product.maxVehicleAge} years old`);
      }
    }

    if (product.minMileage !== null && product.minMileage !== undefined) {
      if (vehicleMileage === null) {
        addReason('Vehicle mileage information is required');
      } else if (vehicleMileage < product.minMileage) {
        addReason(`Vehicle mileage must be at least ${product.minMileage}`);
      }
    }

    if (product.maxMileage !== null && product.maxMileage !== undefined) {
      if (vehicleMileage === null) {
        addReason('Vehicle mileage information is required');
      } else if (vehicleMileage > product.maxMileage) {
        addReason(`Vehicle mileage must be no more than ${product.maxMileage}`);
      }
    }

    return { eligible: reasons.length === 0, reasons };
  }

  private async buildAvailableProducts(tenantId: string, vehicle?: Prisma.Vehicle | null) {
    const products = await this.db.fIProduct.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const vehicleAge = this.getVehicleAge(vehicle);
    const vehicleMileage = vehicle?.mileage ?? null;

    return products.map((product) => {
      const formatted = this.formatFiProduct(product);
      const eligibility = this.evaluateProductEligibility(product, vehicleAge, vehicleMileage);
      return {
        product: formatted,
        eligible: eligibility.eligible,
        reasons: eligibility.eligible ? [] : eligibility.reasons,
      } satisfies MenuAvailability;
    });
  }

  private getBaseAmountFinanced(
    deal: Prisma.DealJacket,
    configuration: Prisma.MenuConfiguration | null,
  ) {
    const amountFinanced = decimalToNumber(deal.amountFinanced) ?? 0;
    const currentMenuTotal = configuration
      ? decimalToNumber(configuration.totalProductCost) ?? 0
      : 0;
    const baseAmount = amountFinanced - currentMenuTotal;
    return baseAmount > 0 ? baseAmount : 0;
  }

  private buildOptionSnapshot(
    code: 'A' | 'B' | 'C' | 'D',
    label: string | null | undefined,
    products: MenuOptionProductSnapshot[],
    baseAmount: number,
    apr: number | null,
    term: number | null,
    baseMonthly: number | null,
  ): MenuOptionSnapshot {
    const totalRetail = roundToCurrency(
      products.reduce((sum, product) => sum + (product.retailPrice ?? 0), 0),
    );
    const totalCost = roundToCurrency(
      products.reduce((sum, product) => sum + (product.cost ?? 0), 0),
    );
    const totalMarkup = roundToCurrency(
      products.reduce((sum, product) => sum + (product.markup ?? 0), 0),
    );
    const newMonthly = calculateMonthlyPayment(baseAmount + totalRetail, apr, term);
    const paymentImpact =
      newMonthly !== null && baseMonthly !== null
        ? roundToCurrency(newMonthly - baseMonthly)
        : null;

    return {
      code,
      label: label && label.trim().length > 0 ? label.trim() : `Option ${code}`,
      products,
      totalRetail,
      totalCost,
      totalMarkup,
      paymentImpact,
    } satisfies MenuOptionSnapshot;
  }

  private normalizeOptions(
    rawOptions: Prisma.JsonValue | null | undefined,
    baseAmount: number,
    apr: number | null,
    term: number | null,
    baseMonthly: number | null,
  ): MenuOptionSnapshot[] {
    if (!Array.isArray(rawOptions)) {
      return [];
    }

    return rawOptions
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const option = entry as Record<string, unknown>;
        const code = option.code;
        if (code !== 'A' && code !== 'B' && code !== 'C' && code !== 'D') {
          return null;
        }
        const label = typeof option.label === 'string' ? option.label : undefined;
        const productsValue = option.products;
        const products: MenuOptionProductSnapshot[] = Array.isArray(productsValue)
          ? productsValue
              .map((product) => {
                if (!product || typeof product !== 'object') {
                  return null;
                }
                const snapshot = product as Record<string, unknown>;
                const id = typeof snapshot.id === 'string' ? snapshot.id : null;
                const name = typeof snapshot.name === 'string' ? snapshot.name : '';
                if (!id || !name) {
                  return null;
                }
                return {
                  id,
                  name,
                  category: typeof snapshot.category === 'string' ? snapshot.category : '',
                  provider: typeof snapshot.provider === 'string' ? snapshot.provider : '',
                  description:
                    typeof snapshot.description === 'string' ? snapshot.description : '',
                  coverageDetails: (snapshot.coverageDetails as Prisma.JsonValue) ?? null,
                  cost: roundToCurrency(Number(snapshot.cost ?? 0)),
                  retailPrice: roundToCurrency(Number(snapshot.retailPrice ?? 0)),
                  markup: roundToCurrency(Number(snapshot.markup ?? 0)),
                  term:
                    typeof snapshot.term === 'number' && Number.isFinite(snapshot.term)
                      ? (snapshot.term as number)
                      : null,
                  termType:
                    typeof snapshot.termType === 'string' ? (snapshot.termType as string) : null,
                  deductible:
                    snapshot.deductible === null || snapshot.deductible === undefined
                      ? null
                      : roundToCurrency(Number(snapshot.deductible)),
                  minVehicleAge:
                    typeof snapshot.minVehicleAge === 'number'
                      ? (snapshot.minVehicleAge as number)
                      : null,
                  maxVehicleAge:
                    typeof snapshot.maxVehicleAge === 'number'
                      ? (snapshot.maxVehicleAge as number)
                      : null,
                  minMileage:
                    typeof snapshot.minMileage === 'number'
                      ? (snapshot.minMileage as number)
                      : null,
                  maxMileage:
                    typeof snapshot.maxMileage === 'number'
                      ? (snapshot.maxMileage as number)
                      : null,
                } satisfies MenuOptionProductSnapshot;
              })
              .filter((value): value is MenuOptionProductSnapshot => value !== null)
          : [];

        return this.buildOptionSnapshot(code, label, products, baseAmount, apr, term, baseMonthly);
      })
      .filter((value): value is MenuOptionSnapshot => value !== null);
  }

  private formatMenuResponse(
    deal: Prisma.DealJacket & { vehicle?: Prisma.Vehicle | null },
    configuration: Prisma.MenuConfiguration | null,
    options: MenuOptionSnapshot[],
    availableProducts: MenuAvailability[],
    baseAmount: number,
    baseMonthly: number | null,
    apr: number | null,
    term: number | null,
  ): MenuPresentationResponse {
    const selectedOptionCode = configuration?.selectedOption ?? null;
    const selectedOption = selectedOptionCode
      ? options.find((option) => option.code === selectedOptionCode) ?? null
      : null;

    const fallbackCost =
      configuration?.totalProductCost !== undefined && configuration?.totalProductCost !== null
        ? roundToCurrency(decimalToNumber(configuration.totalProductCost) ?? 0)
        : null;
    const fallbackMarkup =
      configuration?.totalMarkup !== undefined && configuration?.totalMarkup !== null
        ? roundToCurrency(decimalToNumber(configuration.totalMarkup) ?? 0)
        : null;
    const fallbackImpact =
      configuration?.paymentImpact !== undefined && configuration?.paymentImpact !== null
        ? roundToCurrency(decimalToNumber(configuration.paymentImpact) ?? 0)
        : null;

    const summary: MenuConfigurationSummary = {
      id: configuration?.id ?? null,
      dealId: deal.id,
      options,
      selectedOption: selectedOptionCode,
      selectedProducts: selectedOption ?? null,
      totalProductCost: selectedOption?.totalRetail ?? fallbackCost,
      totalMarkup: selectedOption?.totalMarkup ?? fallbackMarkup,
      paymentImpact: selectedOption?.paymentImpact ?? fallbackImpact,
      selectedAt: configuration?.selectedAt ? configuration.selectedAt.toISOString() : null,
      createdAt: configuration?.createdAt ? configuration.createdAt.toISOString() : null,
      updatedAt: configuration?.updatedAt ? configuration.updatedAt.toISOString() : null,
    };

    return {
      configuration: summary,
      availableProducts,
      baseAmountFinanced: roundToCurrency(baseAmount),
      baseMonthlyPayment: baseMonthly === null ? null : roundToCurrency(baseMonthly),
      apr: apr === null ? null : Number(apr),
      term: term ?? null,
      vehicle: {
        year: deal.vehicle?.year ?? null,
        mileage: deal.vehicle?.mileage ?? null,
      },
    } satisfies MenuPresentationResponse;
  }

  async getDeal(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);

    const deal = await this.db.dealJacket.findFirst({
      where: { id: dealId, tenantId },
      include: {
        customer: true,
        vehicle: true,
        salesperson: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        fiManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    return deal;
  }

  async listLenders(user: AuthenticatedUser, tenantId: string) {
    this.ensureReadAccess(user);

    const lenders = await this.db.lender.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ tierRange: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        tenantId: true,
        name: true,
        type: true,
        apiProvider: true,
        isActive: true,
        tierRange: true,
        maxTerm: true,
        maxLtv: true,
        minCreditScore: true,
        maxCreditScore: true,
        applicationFee: true,
      },
    });

    return lenders;
  }

  async listFiProducts(user: AuthenticatedUser, tenantId: string) {
    this.ensureReadAccess(user);

    const products = await this.db.fIProduct.findMany({
      where: { tenantId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return products.map((product) => this.formatFiProduct(product));
  }

  async getMenuConfiguration(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);

    const deal = await this.db.dealJacket.findFirst({
      where: { id: dealId, tenantId },
      include: { vehicle: true },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    const configuration = await this.db.menuConfiguration.findFirst({
      where: { tenantId, dealId },
    });

    const baseAmount = this.getBaseAmountFinanced(deal, configuration ?? null);
    const apr = decimalToNumber(deal.apr);
    const term = deal.term ?? null;
    const baseMonthly = calculateMonthlyPayment(baseAmount, apr, term);
    const options = this.normalizeOptions(configuration?.options ?? null, baseAmount, apr, term, baseMonthly);
    const availableProducts = await this.buildAvailableProducts(tenantId, deal.vehicle);

    return this.formatMenuResponse(
      deal,
      configuration ?? null,
      options,
      availableProducts,
      baseAmount,
      baseMonthly,
      apr,
      term,
    );
  }

  async buildMenuConfiguration(user: AuthenticatedUser, tenantId: string, payload: BuildMenuPayload) {
    this.ensureWriteAccess(user);

    const deal = await this.db.dealJacket.findFirst({
      where: { id: payload.dealId, tenantId },
      include: { vehicle: true },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    const existingConfiguration = await this.db.menuConfiguration.findFirst({
      where: { tenantId, dealId: payload.dealId },
    });

    const baseAmount = this.getBaseAmountFinanced(deal, existingConfiguration ?? null);
    const apr = decimalToNumber(deal.apr);
    const term = deal.term ?? null;
    const baseMonthly = calculateMonthlyPayment(baseAmount, apr, term);

    const activeProducts = await this.db.fIProduct.findMany({
      where: { tenantId, isActive: true },
    });
    const productMap = new Map(activeProducts.map((product) => [product.id, product]));

    const vehicleAge = this.getVehicleAge(deal.vehicle);
    const vehicleMileage = deal.vehicle?.mileage ?? null;

    const seenCodes = new Set<MenuOptionInput['code']>();

    const optionSnapshots = payload.options.map((option) => {
      if (seenCodes.has(option.code)) {
        throw BadRequest(`Duplicate menu option code: ${option.code}`);
      }
      seenCodes.add(option.code);

      const uniqueProductIds = Array.from(new Set(option.productIds));
      const products = uniqueProductIds.map((productId) => {
        const product = productMap.get(productId);
        if (!product) {
          throw BadRequest('F&I product is not available for menu configuration', { productId });
        }

        const eligibility = this.evaluateProductEligibility(product, vehicleAge, vehicleMileage);
        if (!eligibility.eligible) {
          throw BadRequest('F&I product is not eligible for this vehicle', {
            productId,
            reasons: eligibility.reasons,
          });
        }

        return this.createProductSnapshot(product);
      });

      return this.buildOptionSnapshot(option.code, option.label ?? null, products, baseAmount, apr, term, baseMonthly);
    });

    const existingSelectedCode = existingConfiguration?.selectedOption ?? null;
    const preservedSelection = existingSelectedCode
      ? optionSnapshots.find((option) => option.code === existingSelectedCode) ?? null
      : null;
    const newMonthly = preservedSelection
      ? calculateMonthlyPayment(baseAmount + preservedSelection.totalRetail, apr, term)
      : null;
    const paymentImpact =
      preservedSelection && newMonthly !== null && baseMonthly !== null
        ? roundToCurrency(newMonthly - baseMonthly)
        : null;

    const { upsertedConfig, updatedDealRecord } = await this.db.$transaction(async (tx) => {
      const upsertedConfig = await tx.menuConfiguration.upsert({
        where: { dealId: payload.dealId },
        update: {
          options: optionSnapshots,
          ...(preservedSelection
            ? {
                selectedOption: existingSelectedCode,
                selectedProducts: preservedSelection,
                totalProductCost: toDecimal(preservedSelection.totalRetail, 2),
                totalMarkup: toDecimal(preservedSelection.totalMarkup, 2),
                paymentImpact: paymentImpact !== null ? toDecimal(paymentImpact, 2) : null,
              }
            : {
                selectedOption: null,
                selectedProducts: null,
                totalProductCost: null,
                totalMarkup: null,
                paymentImpact: null,
                selectedAt: null,
              }),
        },
        create: {
          dealId: payload.dealId,
          tenantId,
          createdBy: user.userId,
          options: optionSnapshots,
          selectedOption: preservedSelection ? existingSelectedCode : null,
          selectedProducts: preservedSelection ?? null,
          totalProductCost: preservedSelection ? toDecimal(preservedSelection.totalRetail, 2) : null,
          totalMarkup: preservedSelection ? toDecimal(preservedSelection.totalMarkup, 2) : null,
          paymentImpact: paymentImpact !== null ? toDecimal(paymentImpact, 2) : null,
        },
      });

      const amountFinancedValue = preservedSelection
        ? baseAmount + preservedSelection.totalRetail
        : baseAmount;
      const monthlyValue = preservedSelection
        ? newMonthly
        : baseMonthly;

      const updatedDealRecord = await tx.dealJacket.update({
        where: { id: deal.id },
        data: {
          fiProducts: preservedSelection ? preservedSelection.products : [],
          totalFiGross: preservedSelection ? toDecimal(preservedSelection.totalMarkup, 2) : null,
          amountFinanced: toDecimal(amountFinancedValue, 2),
          monthlyPayment: monthlyValue !== null ? toDecimal(monthlyValue, 2) : null,
        },
        include: { vehicle: true },
      });

      return { upsertedConfig, updatedDealRecord };
    });

    const menuConfig = upsertedConfig;
    const refreshedDeal = updatedDealRecord;

    const latestBaseAmount = this.getBaseAmountFinanced(refreshedDeal, menuConfig);
    const latestApr = decimalToNumber(refreshedDeal.apr);
    const latestTerm = refreshedDeal.term ?? null;
    const latestBaseMonthly = calculateMonthlyPayment(latestBaseAmount, latestApr, latestTerm);
    const normalizedOptions = this.normalizeOptions(
      menuConfig.options,
      latestBaseAmount,
      latestApr,
      latestTerm,
      latestBaseMonthly,
    );
    const availableProducts = await this.buildAvailableProducts(tenantId, refreshedDeal.vehicle);

    return this.formatMenuResponse(
      refreshedDeal,
      menuConfig,
      normalizedOptions,
      availableProducts,
      latestBaseAmount,
      latestBaseMonthly,
      latestApr,
      latestTerm,
    );
  }

  async selectMenuOption(
    user: AuthenticatedUser,
    tenantId: string,
    dealId: string,
    optionCode: string | null,
  ) {
    this.ensureWriteAccess(user);

    const deal = await this.db.dealJacket.findFirst({
      where: { id: dealId, tenantId },
      include: { vehicle: true },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    const configuration = await this.db.menuConfiguration.findFirst({
      where: { tenantId, dealId },
    });

    if (!configuration) {
      throw NotFound('Menu configuration not found for this deal');
    }

    const baseAmount = this.getBaseAmountFinanced(deal, configuration);
    const apr = decimalToNumber(deal.apr);
    const term = deal.term ?? null;
    const baseMonthly = calculateMonthlyPayment(baseAmount, apr, term);
    const options = this.normalizeOptions(configuration.options, baseAmount, apr, term, baseMonthly);

    const selectedOption = optionCode ? options.find((option) => option.code === optionCode) ?? null : null;
    if (optionCode && !selectedOption) {
      throw NotFound('Menu option not found for selection');
    }

    const newMonthly = selectedOption
      ? calculateMonthlyPayment(baseAmount + selectedOption.totalRetail, apr, term)
      : baseMonthly;
    const paymentImpact =
      selectedOption && newMonthly !== null && baseMonthly !== null
        ? roundToCurrency(newMonthly - baseMonthly)
        : null;

    const { updatedConfig, updatedDeal } = await this.db.$transaction(async (tx) => {
      const nextConfig = await tx.menuConfiguration.update({
        where: { dealId },
        data: {
          selectedOption: selectedOption ? selectedOption.code : null,
          selectedProducts: selectedOption ?? null,
          selectedAt: selectedOption ? new Date() : null,
          totalProductCost: selectedOption ? toDecimal(selectedOption.totalRetail, 2) : null,
          totalMarkup: selectedOption ? toDecimal(selectedOption.totalMarkup, 2) : null,
          paymentImpact: paymentImpact !== null ? toDecimal(paymentImpact, 2) : null,
        },
      });

      const amountFinancedValue = selectedOption
        ? baseAmount + selectedOption.totalRetail
        : baseAmount;

      const updatedDealRecord = await tx.dealJacket.update({
        where: { id: deal.id },
        data: {
          fiProducts: selectedOption ? selectedOption.products : [],
          totalFiGross: selectedOption ? toDecimal(selectedOption.totalMarkup, 2) : null,
          amountFinanced: toDecimal(amountFinancedValue, 2),
          monthlyPayment: newMonthly !== null ? toDecimal(newMonthly, 2) : null,
        },
        include: { vehicle: true },
      });

      return { updatedConfig: nextConfig, updatedDeal: updatedDealRecord };
    });

    const refreshedBaseAmount = this.getBaseAmountFinanced(updatedDeal, updatedConfig);
    const refreshedApr = decimalToNumber(updatedDeal.apr);
    const refreshedTerm = updatedDeal.term ?? null;
    const refreshedBaseMonthly = calculateMonthlyPayment(refreshedBaseAmount, refreshedApr, refreshedTerm);
    const normalizedOptions = this.normalizeOptions(
      updatedConfig.options,
      refreshedBaseAmount,
      refreshedApr,
      refreshedTerm,
      refreshedBaseMonthly,
    );
    const availableProducts = await this.buildAvailableProducts(tenantId, updatedDeal.vehicle);

    return this.formatMenuResponse(
      updatedDeal,
      updatedConfig,
      normalizedOptions,
      availableProducts,
      refreshedBaseAmount,
      refreshedBaseMonthly,
      refreshedApr,
      refreshedTerm,
    );
  }

  async getFiProductDetails(user: AuthenticatedUser, tenantId: string, productId: string) {
    this.ensureReadAccess(user);

    const product = await this.db.fIProduct.findFirst({
      where: { id: productId, tenantId },
    });

    if (!product) {
      throw NotFound('F&I product not found');
    }

    return this.formatFiProduct(product);
  }

  private buildSubmissionPayload(deal: DealWithFinance, desiredTerm?: number | null): RouteOneSubmission {
    const primaryApplicant = deal.creditApplication
      ? {
          firstName: deal.creditApplication.firstName,
          lastName: deal.creditApplication.lastName,
          middleName: deal.creditApplication.middleName ?? null,
          email: deal.creditApplication.email,
          phone: deal.creditApplication.phone,
          ssn: deal.creditApplication.ssn ?? undefined,
          dateOfBirth: deal.creditApplication.dateOfBirth?.toISOString() ?? null,
        }
      : {
          firstName: deal.customer.firstName,
          lastName: deal.customer.lastName,
          middleName: null,
          email: deal.customer.email ?? null,
          phone: deal.customer.phone ?? deal.customer.mobile ?? null,
          ssn: undefined,
          dateOfBirth: null,
        };

    const applicants: RouteOneSubmission['applicants'] = [primaryApplicant];

    if (deal.creditApplication?.coApplicant) {
      const coApplicant = deal.creditApplication.coApplicant as Record<string, unknown> | null;
      if (coApplicant) {
        const coFirst = coApplicant.firstName as string | undefined;
        const coLast = coApplicant.lastName as string | undefined;
        if (coFirst && coLast) {
          applicants.push({
            firstName: coFirst,
            lastName: coLast,
            middleName: (coApplicant.middleName as string | undefined) ?? null,
            email: (coApplicant.email as string | undefined) ?? null,
            phone: (coApplicant.phone as string | undefined) ?? null,
            ssn: (coApplicant.ssn as string | undefined) ?? undefined,
            dateOfBirth: (coApplicant.dateOfBirth as string | undefined) ?? null,
          });
        }
      }
    }

    const amountFinanced = decimalToNumber(deal.amountFinanced) ?? 0;
    const cashDown = decimalToNumber(deal.cashDown) ?? 0;
    const sellingPrice = decimalToNumber(deal.sellingPrice) ?? amountFinanced + cashDown;

    return {
      dealId: deal.id,
      applicationId: deal.creditApplication?.id ?? null,
      desiredTerm: desiredTerm ?? deal.term ?? null,
      amountFinanced,
      cashDown,
      sellingPrice,
      applicants,
      vehicle: deal.vehicle
        ? {
            vin: deal.vehicle.vin,
            year: deal.vehicle.year ?? null,
            make: deal.vehicle.make,
            model: deal.vehicle.model,
            mileage: deal.vehicle.mileage ?? null,
            stockNumber: deal.vehicle.stockNumber,
          }
        : null,
      dealerNotes: typeof deal.fiProducts === 'string' ? deal.fiProducts : null,
      reserveTarget: decimalToNumber(deal.totalFiGross),
    };
  }

  async submitLenderApplications(
    user: AuthenticatedUser,
    tenantId: string,
    payload: { dealId: string; lenderIds: string[]; desiredTerm?: number | null },
  ) {
    this.ensureWriteAccess(user);
    const uniqueLenderIds = Array.from(new Set(payload.lenderIds ?? [])).filter(Boolean);
    if (uniqueLenderIds.length === 0) {
      throw BadRequest('At least one lender must be selected');
    }

    const deal = await this.db.dealJacket.findFirst({
      where: { id: payload.dealId, tenantId },
      include: { customer: true, vehicle: true, creditApplication: true },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    const lenders = await this.db.lender.findMany({
      where: { tenantId, id: { in: uniqueLenderIds }, isActive: true },
    });

    if (lenders.length !== uniqueLenderIds.length) {
      throw BadRequest('One or more lenders are not available for this tenant');
    }

    const active = await this.db.lenderSubmission.findMany({
      where: {
        tenantId,
        dealId: payload.dealId,
        lenderId: { in: uniqueLenderIds },
        status: { in: ACTIVE_SUBMISSION_STATUSES },
        isSelected: false,
      },
      include: { lender: true },
    });

    if (active.length > 0) {
      const lenderNames = active.map((entry) => entry.lender?.name ?? 'selected lender');
      throw BadRequest(
        `An active submission already exists for ${lenderNames.join(', ')}. Please wait for a decision before resubmitting.`,
      );
    }

    const baseSubmission = this.buildSubmissionPayload(deal, payload.desiredTerm ?? deal.term ?? null);
    const results: Array<{
      lender: (typeof lenders)[number];
      request: RouteOneSubmission;
      decision: LenderDecision;
      errorDetails?: unknown;
    }> = [];

    for (const lender of lenders) {
      const request: RouteOneSubmission = {
        ...baseSubmission,
        applicants: baseSubmission.applicants.map((applicant) => ({ ...applicant })),
        vehicle: baseSubmission.vehicle ? { ...baseSubmission.vehicle } : null,
      };

      try {
        const decision = await lenderIntegrationService.submit(lender, request);
        results.push({ lender, request, decision });
      } catch (error) {
        const message =
          error instanceof IntegrationConfigurationError || error instanceof LenderIntegrationError
            ? error.message
            : 'Unexpected lender integration failure';
        const decision: LenderDecision = {
          status: 'DECLINED',
          declineReason: message,
          rawResponse: error instanceof LenderIntegrationError ? error.cause : undefined,
        };
        results.push({ lender, request, decision, errorDetails: error });
      }
    }

    const created = await this.db.$transaction(async (tx) => {
      const createdSubmissions = [] as Array<
        Prisma.LenderSubmissionGetPayload<{ include: { lender: true } }>
      >;

      for (const entry of results) {
        const declineMessage = entry.decision.declineReason ?? extractErrorMessage(entry.errorDetails);
        const submission = await tx.lenderSubmission.create({
          data: {
            tenantId,
            dealId: deal.id,
            lenderId: entry.lender.id,
            submittedBy: user.userId,
            requestPayload: entry.request,
            status: entry.decision.status,
            respondedAt: parseDate(entry.decision.respondedAt ?? null),
            responsePayload: entry.decision.rawResponse ?? entry.errorDetails ?? null,
            amountApproved: toDecimal(entry.decision.amountApproved ?? null, 2),
            apr: toDecimal(entry.decision.apr ?? null, 3),
            buyRate: toDecimal(entry.decision.buyRate ?? null, 3),
            dealerReserve: toDecimal(entry.decision.dealerReserve ?? null, 3),
            maxReserve: toDecimal(entry.decision.maxReserve ?? null, 3),
            term: entry.decision.term ?? baseSubmission.desiredTerm ?? deal.term ?? null,
            monthlyPayment: toDecimal(entry.decision.monthlyPayment ?? null, 2),
            declineReason: declineMessage,
            declineCode: entry.decision.declineCode ?? null,
            stipulations: entry.decision.stipulations?.length ? entry.decision.stipulations : null,
            expiresAt: parseDate(entry.decision.expiresAt ?? null),
          },
          include: { lender: true },
        });
        createdSubmissions.push(submission);
      }

      const nextStatus = FINAL_APPROVAL_STATUSES.includes(deal.status) ? deal.status : 'Submitted';
      await tx.dealJacket.update({
        where: { id: deal.id },
        data: {
          status: nextStatus,
          term: payload.desiredTerm ?? deal.term ?? null,
        },
      });

      return createdSubmissions;
    });

    return created;
  }

  async listLenderDecisions(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const submissions = await this.db.lenderSubmission.findMany({
      where: { tenantId, dealId },
      orderBy: [{ submittedAt: 'desc' }],
      include: { lender: true },
    });

    return submissions;
  }

  async selectLenderDecision(user: AuthenticatedUser, tenantId: string, submissionId: string) {
    this.ensureWriteAccess(user);

    const submission = await this.db.lenderSubmission.findFirst({
      where: { id: submissionId, tenantId },
      include: { deal: true, lender: true },
    });

    if (!submission) {
      throw NotFound('Lender submission not found');
    }

    const updated = await this.db.$transaction(async (tx) => {
      await tx.lenderSubmission.updateMany({
        where: { tenantId, dealId: submission.dealId },
        data: { isSelected: false, selectedAt: null },
      });

      const selected = await tx.lenderSubmission.update({
        where: { id: submission.id },
        data: {
          isSelected: true,
          selectedAt: new Date(),
          status: FINAL_APPROVAL_STATUSES.includes(submission.status) ? submission.status : 'APPROVED',
        },
        include: { lender: true },
      });

      await tx.dealJacket.update({
        where: { id: submission.dealId },
        data: {
          status: 'Approved',
          lenderId: submission.lenderId,
          apr: submission.apr,
          term: submission.term,
          monthlyPayment: submission.monthlyPayment,
        },
      });

      return selected;
    });

    return updated;
  }

  async recordCounterOffer(
    user: AuthenticatedUser,
    tenantId: string,
    payload: { submissionId: string; amount?: number | null; apr?: number | null; term?: number | null; message?: string | null },
  ) {
    this.ensureWriteAccess(user);

    const submission = await this.db.lenderSubmission.findFirst({
      where: { id: payload.submissionId, tenantId },
    });

    if (!submission) {
      throw NotFound('Lender submission not found');
    }

    const existingPayload = (submission.responsePayload as Record<string, unknown> | null) ?? {};
    const counterOffers = Array.isArray(existingPayload.counterOffers)
      ? (existingPayload.counterOffers as Array<Record<string, unknown>>)
      : [];

    counterOffers.push({
      amount: payload.amount ?? null,
      apr: payload.apr ?? null,
      term: payload.term ?? null,
      message: payload.message ?? null,
      submittedBy: user.userId,
      submittedAt: new Date().toISOString(),
    });

    const updateData: Prisma.LenderSubmissionUpdateInput = {
      status: 'COUNTERED',
      responsePayload: {
        ...existingPayload,
        counterOffers,
      },
      respondedAt: new Date(),
    };

    if (payload.amount !== undefined && payload.amount !== null) {
      updateData.amountApproved = toDecimal(payload.amount, 2);
    }
    if (payload.apr !== undefined && payload.apr !== null) {
      updateData.apr = toDecimal(payload.apr, 3);
    }
    if (payload.term !== undefined && payload.term !== null) {
      updateData.term = payload.term;
    }

    const updated = await this.db.lenderSubmission.update({
      where: { id: submission.id },
      data: updateData,
      include: { lender: true },
    });

    return updated;
  }

  async satisfyStipulation(
    user: AuthenticatedUser,
    tenantId: string,
    payload: { submissionId: string; stipulationId: string; note?: string | null },
  ) {
    this.ensureWriteAccess(user);

    const submission = await this.db.lenderSubmission.findFirst({
      where: { id: payload.submissionId, tenantId },
    });

    if (!submission) {
      throw NotFound('Lender submission not found');
    }

    const stipulations = (submission.stipulations as Stipulation[] | null) ?? [];
    if (!stipulations.length) {
      throw BadRequest('This submission does not have any outstanding stipulations');
    }

    if (!stipulations.some((entry) => entry.id === payload.stipulationId)) {
      throw NotFound('Stipulation not found for this submission');
    }

    const updatedStipulations = updateStipulations(stipulations, payload.stipulationId, payload.note ?? undefined);

    const updated = await this.db.lenderSubmission.update({
      where: { id: submission.id },
      data: { stipulations: updatedStipulations },
      include: { lender: true },
    });

    return updated;
  }

  async updateDeal(
    user: AuthenticatedUser,
    tenantId: string,
    dealId: string,
    payload: Record<string, unknown>,
  ) {
    this.ensureWriteAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const data: Prisma.DealJacketUpdateInput = {};

    if (payload.status && typeof payload.status === 'string') {
      data.status = payload.status;
    }

    if (payload.fiProducts) {
      if (typeof payload.fiProducts === 'string') {
        try {
          data.fiProducts = JSON.parse(payload.fiProducts);
        } catch (error) {
          throw BadRequest('fiProducts must be valid JSON');
        }
      } else {
        data.fiProducts = payload.fiProducts as Prisma.JsonValue;
      }
    }

    if ('fiManagerId' in payload) {
      const fiManagerId = payload.fiManagerId as string | null | undefined;
      data.fiManagerId = fiManagerId ?? null;
    }

    if (payload.lenderId !== undefined) {
      data.lenderId = payload.lenderId === null ? null : String(payload.lenderId);
    }

    if (payload.term !== undefined) {
      data.term = payload.term === null ? null : Number(payload.term);
    }

    const decimalFields: (keyof Prisma.DealJacketUpdateInput)[] = [
      'sellingPrice',
      'tradeValue',
      'tradePayoff',
      'netTrade',
      'cashDown',
      'amountFinanced',
      'apr',
      'monthlyPayment',
      'totalFiGross',
    ];

    for (const field of decimalFields) {
      if (payload[field as keyof typeof payload] !== undefined) {
        const value = payload[field as keyof typeof payload];
        if (value === null) {
          data[field] = null;
        } else if (value !== undefined) {
          const numericValue = typeof value === 'number' ? value : Number(value);
          if (Number.isNaN(numericValue)) {
            throw BadRequest(`Invalid numeric value for ${String(field)}`);
          }
          data[field] = new Prisma.Decimal(numericValue.toFixed(2));
        }
      }
    }

    const dateFields: Array<keyof Prisma.DealJacketUpdateInput> = [
      'contractDate',
      'fundedDate',
      'deliveredDate',
    ];

    for (const field of dateFields) {
      if (payload[field as keyof typeof payload] !== undefined) {
        const value = payload[field as keyof typeof payload];
        if (value === null || value === '') {
          data[field] = null;
        } else {
          const date = new Date(String(value));
          if (Number.isNaN(date.getTime())) {
            throw BadRequest(`Invalid date for ${String(field)}`);
          }
          data[field] = date;
        }
      }
    }

    const updated = await this.db.dealJacket.update({
      where: { id: dealId },
      data,
      include: {
        customer: true,
        vehicle: true,
        salesperson: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        fiManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return updated;
  }

  async listDocuments(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const documents = await this.db.dealDocument.findMany({
      where: { dealId },
      orderBy: { uploadedAt: 'desc' },
    });

    return documents;
  }

  async uploadDocument(
    user: AuthenticatedUser,
    tenantId: string,
    dealId: string,
    file: Express.Multer.File,
    descriptor: UploadDescriptor,
  ) {
    this.ensureWriteAccess(user);
    const deal = await this.requireDealForTenant(dealId, tenantId);

    if (!file) {
      throw BadRequest('A document upload is required');
    }

    const scanResult = await runVirusScan(file.buffer);
    if (!scanResult.clean) {
      throw BadRequest('Uploaded file failed virus scan', { signature: scanResult.signature });
    }

    const documentId = generateDocumentId();
    const key = buildDealDocumentKey({
      tenantId,
      dealId,
      documentId,
      originalName: file.originalname,
    });

    let uploadResult: { key: string; url: string };
    try {
      uploadResult = await uploadBufferToS3({
        key,
        body: file.buffer,
        contentType: file.mimetype,
        metadata: {
          dealId,
          documentId,
          tenantId,
          uploadedBy: user.userId,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload failure';
      throw BadRequest(`Unable to upload document: ${message}`);
    }

    const name = descriptor.name?.trim() || file.originalname;

    const document = await this.db.dealDocument.create({
      data: {
        id: documentId,
        dealId: deal.id,
        type: descriptor.type,
        category: descriptor.category,
        name,
        fileName: file.originalname,
        fileUrl: uploadResult.url,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedBy: user.userId,
      },
    });

    return document;
  }

  async deleteDocument(user: AuthenticatedUser, tenantId: string, dealId: string, documentId: string) {
    this.ensureWriteAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const document = await this.db.dealDocument.findFirst({
      where: { id: documentId, dealId },
    });

    if (!document) {
      throw NotFound('Document not found');
    }

    const key = extractKeyFromUrl(document.fileUrl);
    if (key) {
      try {
        await deleteFromS3(key);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown storage error';
        throw BadRequest(`Unable to delete file from storage: ${message}`);
      }
    }

    await this.db.dealDocument.delete({ where: { id: documentId } });
  }

  async generateContracts(
    user: AuthenticatedUser,
    tenantId: string,
    payload: {
      dealId: string;
      contracts: Array<{
        type: string;
        name?: string;
        templateId?: string | null;
        contractData?: Record<string, unknown>;
        signers?: ContractSigner[];
      }>;
    },
  ) {
    this.ensureWriteAccess(user);

    if (!payload.contracts?.length) {
      throw BadRequest('At least one contract is required to generate documents');
    }

    const deal = await this.db.dealJacket.findFirst({
      where: { id: payload.dealId, tenantId },
      include: {
        customer: true,
        vehicle: true,
        fiManager: { select: { id: true, firstName: true, lastName: true, email: true } },
        salesperson: { select: { id: true, firstName: true, lastName: true, email: true } },
        creditApplication: true,
        lender: true,
      },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    const pricing = this.buildPricingSummary(deal);
    const vehicle = this.buildVehicleSummary(deal);
    const customer = this.buildCustomerSummary(deal.customer);
    const coBuyer = this.buildCoBuyerSummary(deal);

    const generatedContracts = [] as Array<Prisma.ContractGetPayload<{}>>;

    for (const contract of payload.contracts) {
      const type = this.normalizeContractType(contract.type);
      const contractId = randomUUID();
      const name = contract.name?.trim() || getContractDisplayName(type);

      const signers = this.normalizeSigners(
        contract.signers?.length ? contract.signers : this.buildDefaultSigners(deal, coBuyer, type),
      );

      if (!signers.length) {
        throw BadRequest(`Contract ${name} does not have any signers configured`);
      }

      const context = {
        contractId,
        tenantId,
        dealId: deal.id,
        dealNumber: deal.dealNumber,
        type,
        name,
        generatedBy: user.userId,
        signers,
        pricing,
        vehicle,
        customer,
        coBuyer,
        lenderName: deal.lender?.name ?? null,
        contractData: contract.contractData ?? {},
      } satisfies Parameters<typeof contractGeneratorService.generate>[0];

      const generation = await contractGeneratorService.generate(context);

      const storedData: Record<string, unknown> = {
        pricing: context.pricing,
        vehicle: context.vehicle,
        customer: context.customer,
        coBuyer: context.coBuyer,
        lenderName: context.lenderName,
        custom: contract.contractData ?? {},
      };

      const created = await this.db.contract.create({
        data: {
          id: contractId,
          tenantId,
          dealId: deal.id,
          type,
          name,
          templateId: contract.templateId ?? null,
          pdfUrl: generation.url,
          status: 'DRAFT',
          signers: signers as unknown as Prisma.JsonValue,
          contractData: storedData as Prisma.JsonValue,
          generatedBy: user.userId,
        },
      });

      generatedContracts.push(created);
    }

    return generatedContracts;
  }

  async sendContractsForSignature(
    user: AuthenticatedUser,
    tenantId: string,
    payload: {
      dealId: string;
      contractIds?: string[];
      signers: ContractSigner[];
      message?: string;
    },
  ) {
    this.ensureWriteAccess(user);

    if (!payload.signers?.length) {
      throw BadRequest('At least one signer is required to send contracts for signature');
    }

    const deal = await this.db.dealJacket.findFirst({
      where: { id: payload.dealId, tenantId },
      select: { id: true, dealNumber: true },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    const contractFilter: Prisma.ContractWhereInput = {
      tenantId,
      dealId: deal.id,
    };

    if (payload.contractIds?.length) {
      contractFilter.id = { in: payload.contractIds };
    } else {
      contractFilter.status = { in: ['DRAFT', 'VIEWED'] };
    }

    const contracts = await this.db.contract.findMany({
      where: contractFilter,
      orderBy: { createdAt: 'asc' },
    });

    if (!contracts.length) {
      throw BadRequest('No contracts are available to send for signature');
    }

    const missingPdf = contracts.find((entry) => !entry.pdfUrl);
    if (missingPdf) {
      throw BadRequest(`Contract ${missingPdf.name} is missing a generated PDF. Please regenerate it before sending.`);
    }

    const signers = this.normalizeSigners(payload.signers);
    const envelopeSigners = signers.map((signer, index) => ({
      ...signer,
      recipientId: `${index + 1}`,
    }));

    const documents = contracts.map((contract, index) => ({
      documentId: `${index + 1}`,
      name: contract.name,
      pdfUrl: contract.pdfUrl!,
      type: this.normalizeContractType(contract.type),
    }));

    const envelope = await docuSignService.sendEnvelope({
      dealId: deal.id,
      emailSubject: `Deal ${deal.dealNumber} contract package`,
      emailBody: payload.message ?? undefined,
      documents,
      signers: envelopeSigners,
    });

    const envelopeId = envelope.envelopeId ?? envelope.envelopeID ?? envelope.id;
    if (!envelopeId) {
      throw BadRequest('DocuSign did not return an envelope identifier');
    }

    const sentAt = new Date();
    await this.db.contract.updateMany({
      where: { id: { in: contracts.map((entry) => entry.id) } },
      data: {
        status: 'SENT',
        sentAt,
        docusignEnvelopeId: envelopeId,
        signers: signers as unknown as Prisma.JsonValue,
      },
    });

    return {
      envelopeId,
      contractIds: contracts.map((entry) => entry.id),
      status: 'SENT',
      sentAt,
    };
  }

  async getContractStatuses(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const contracts = await this.db.contract.findMany({
      where: { tenantId, dealId },
      orderBy: { createdAt: 'asc' },
    });

    const completedTypes = new Set<ContractType>();
    for (const contract of contracts) {
      const status = String(contract.status).toUpperCase();
      if (status === 'COMPLETED' || status === 'SIGNED') {
        completedTypes.add(this.normalizeContractType(contract.type));
      }
    }

    const allSigned = REQUIRED_CONTRACT_TYPES.every((type) => completedTypes.has(type));

    return {
      contracts,
      allSigned,
      requiredCompleted: Array.from(completedTypes.values()),
    };
  }

  async getContractDownloadUrl(user: AuthenticatedUser, tenantId: string, contractId: string) {
    this.ensureReadAccess(user);

    const contract = await this.db.contract.findFirst({
      where: { id: contractId, tenantId },
      select: { id: true, pdfUrl: true, dealId: true },
    });

    if (!contract) {
      throw NotFound('Contract not found');
    }

    await this.requireDealForTenant(contract.dealId, tenantId);

    if (!contract.pdfUrl) {
      throw BadRequest('Contract PDF is not available. Please regenerate the document.');
    }

    const key = extractKeyFromUrl(contract.pdfUrl);
    const url = key ? await getSignedDownloadUrl(key) : contract.pdfUrl;

    return { url };
  }

  async handleContractWebhook(payload: Record<string, any>) {
    const envelopeId = this.extractEnvelopeId(payload);
    if (!envelopeId) {
      throw BadRequest('DocuSign webhook payload is missing an envelope identifier');
    }

    const contracts = await this.db.contract.findMany({
      where: { docusignEnvelopeId: envelopeId },
    });

    if (!contracts.length) {
      return { processed: false };
    }

    const status = this.extractEnvelopeStatus(payload) ?? 'SENT';
    const normalizedStatus = status.toUpperCase();
    const eventTimestamp = new Date(payload.timestamp ?? payload.timeGenerated ?? Date.now());

    const updateData: Prisma.ContractUpdateManyMutationInput = {
      status: normalizedStatus === 'DELIVERED' ? 'VIEWED' : normalizedStatus,
    };

    if (normalizedStatus === 'SENT') {
      updateData.sentAt = eventTimestamp;
    }
    if (normalizedStatus === 'DELIVERED') {
      updateData.viewedAt = eventTimestamp;
    }
    if (normalizedStatus === 'COMPLETED') {
      updateData.signedAt = contracts[0].signedAt ?? eventTimestamp;
      updateData.completedAt = eventTimestamp;
      updateData.status = 'COMPLETED';
    }
    if (normalizedStatus === 'VOIDED') {
      updateData.completedAt = null;
      updateData.signedAt = null;
      updateData.viewedAt = contracts[0].viewedAt ?? null;
    }

    await this.db.contract.updateMany({
      where: { id: { in: contracts.map((entry) => entry.id) } },
      data: updateData,
    });

    const signerStatuses = this.extractRecipientStatuses(payload);
    if (signerStatuses.length) {
      for (const contract of contracts) {
        for (const signer of signerStatuses) {
          if (signer.status.toLowerCase() !== 'completed') {
            continue;
          }
          await this.upsertContractSignature(contract.id, signer);
        }
      }
    }

    const first = contracts[0];
    await this.updateDealContractStatus(first.dealId, first.tenantId);

    return { processed: true };
  }
}

export const fiService = new FiService();
