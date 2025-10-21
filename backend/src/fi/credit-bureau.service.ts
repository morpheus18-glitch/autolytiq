import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import sgMail from '@sendgrid/mail';
import crypto from 'node:crypto';
import { BadRequest, Forbidden, NotFound } from '../lib/errors.js';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';
import { buildDealDocumentKey, uploadBufferToS3, generateDocumentId } from '../lib/storage/s3.js';
import { logAudit } from '../services/settings.service.js';

type Bureau = 'experian' | 'transunion' | 'equifax' | 'tri-merge';
type PullType = 'soft' | 'hard';

export interface CreditReferenceInput {
  name: string;
  relationship: string;
  phone: string;
}

export interface CoApplicantInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  ssn?: string;
}

export interface CreditApplicationInput {
  dealId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  ssn?: string | null;
  dateOfBirth: string;
  phone: string;
  email: string;
  currentStreet: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  yearsAtAddress: number;
  monthsAtAddress: number;
  residenceType: string;
  monthlyPayment?: number | null;
  previousStreet?: string | null;
  previousCity?: string | null;
  previousState?: string | null;
  previousZip?: string | null;
  employer: string;
  jobTitle: string;
  yearsEmployed: number;
  monthsEmployed: number;
  monthlyIncome: number;
  employerPhone: string;
  otherIncomeSource?: string | null;
  otherIncomeAmount?: number | null;
  coApplicant?: CoApplicantInput | null;
  references: CreditReferenceInput[];
  authorizeCredit: boolean;
  certifyAccuracy: boolean;
  privacyConsent: boolean;
  signature?: string | null;
  signedAt?: string | null;
}

export interface PullCreditInput {
  dealId: string;
  bureau: Bureau;
  pullType: PullType;
  ipAddress?: string;
  userId: string;
  tenantId: string;
}

export interface ShareCreditReportInput {
  dealId: string;
  tenantId: string;
  userId: string;
  recipients: string[];
  message?: string;
}

type ExperianAddress = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

type ExperianEmployment = {
  employerName: string;
  jobTitle: string;
  yearsEmployed: number;
  monthsEmployed: number;
  annualIncome: number;
};

type ExperianRequest = {
  consumer: {
    firstName: string;
    middleName?: string;
    lastName: string;
    ssn: string;
    dateOfBirth: string;
    phone: string;
    email: string;
  };
  addresses: {
    current: ExperianAddress;
    previous?: ExperianAddress;
  };
  employment: ExperianEmployment;
  bureau: Bureau;
  pullType: PullType;
};

type ExperianResponse = {
  experianScore?: number;
  transUnionScore?: number;
  equifaxScore?: number;
  mergedScore?: number;
  scoreRange?: string;
  totalAccounts: number;
  openAccounts: number;
  totalRevolvingCredit: number;
  totalRevolvingBalance: number;
  utilizationPercent: number;
  totalInstallmentDebt: number;
  monthlyDebtObligations: number;
  onTimePaymentPercent: number;
  late30Days: number;
  late60Days: number;
  late90PlusDays: number;
  collections: number;
  chargeOffs: number;
  bankruptcies: number;
  foreclosures: number;
  hardInquiries: number;
  softInquiries: number;
  tradeLines: Array<{
    creditor: string;
    accountType: string;
    balance: number;
    highCredit?: number;
    status: string;
    openedOn: string;
    lastUpdatedOn: string;
    paymentStatus?: string;
  }>;
  raw: Record<string, unknown>;
  pdfBuffer?: Buffer;
};

function normalizeNumber(value: number | string | null | undefined, precision = 2): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) {
    throw BadRequest('Invalid numeric value provided for credit application');
  }
  return Number(numeric.toFixed(precision));
}

function decimalFrom(value: number | string | null | undefined, precision = 2): Prisma.Decimal | null {
  const numeric = normalizeNumber(value, precision);
  if (numeric === null) {
    return null;
  }
  return new Prisma.Decimal(numeric.toFixed(precision));
}

function decimalToString(value?: Prisma.Decimal | null) {
  if (!value) {
    return null;
  }
  return value.toFixed(2);
}

function ensureReferences(references: CreditReferenceInput[]): Prisma.JsonValue {
  if (!Array.isArray(references) || references.length === 0) {
    throw BadRequest('At least one credit reference is required');
  }
  const normalized = references.map((reference) => ({
    name: reference.name.trim(),
    relationship: reference.relationship.trim(),
    phone: reference.phone.trim(),
  }));
  return normalized as unknown as Prisma.JsonValue;
}

function coApplicantToJson(coApplicant?: CoApplicantInput | null): Prisma.JsonValue | null {
  if (!coApplicant) {
    return null;
  }
  return JSON.parse(JSON.stringify(coApplicant)) as Prisma.JsonValue;
}

function toIsoDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw BadRequest('Invalid date provided for credit application');
  }
  return date;
}

function maskSsn(ssn: string | null): string | null {
  if (!ssn || ssn.length < 4) {
    return null;
  }
  const last4 = ssn.slice(-4);
  return `***-**-${last4}`;
}

function hasExperianCredentials() {
  return Boolean(env.EXPERIAN_API_URL && env.EXPERIAN_API_KEY && env.EXPERIAN_CLIENT_ID && env.EXPERIAN_CLIENT_SECRET);
}

function hasTransUnionCredentials() {
  return Boolean(env.TRANSUNION_API_URL && env.TRANSUNION_API_KEY);
}

function hasEquifaxCredentials() {
  return Boolean(env.EQUIFAX_API_URL && env.EQUIFAX_API_KEY);
}

function resolveEncryptionKey(): Buffer {
  const configured = env.CREDIT_ENCRYPTION_KEY ?? env.SESSION_SECRET;
  if (!configured) {
    throw new Error('No encryption key configured for credit applications');
  }
  if (configured.length === 64 && /^[a-f0-9]+$/i.test(configured)) {
    return Buffer.from(configured, 'hex');
  }
  try {
    const base64 = Buffer.from(configured, 'base64');
    if (base64.length === 32) {
      return base64;
    }
  } catch (error) {
    // fallthrough to hash based derivation
  }
  const hash = crypto.createHash('sha256');
  hash.update(configured);
  return hash.digest();
}

function encryptSensitive(value: string): string {
  const key = resolveEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

function decryptSensitive(payload: string): string {
  const [ivEncoded, tagEncoded, dataEncoded] = payload.split(':');
  if (!ivEncoded || !tagEncoded || !dataEncoded) {
    throw new Error('Encrypted value is malformed');
  }
  const key = resolveEncryptionKey();
  const iv = Buffer.from(ivEncoded, 'base64');
  const authTag = Buffer.from(tagEncoded, 'base64');
  const encrypted = Buffer.from(dataEncoded, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

async function createCreditReportPdf(
  application: Prisma.CreditApplication,
  report: Prisma.CreditReport,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Credit Report Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Applicant: ${application.firstName} ${application.lastName}`);
    doc.text(`Pulled On: ${report.pulledAt.toISOString()}`);
    doc.text(`Bureau: ${report.bureau}`);
    doc.text(`Pull Type: ${report.pullType}`);
    doc.moveDown();

    const scores: Array<[string, Prisma.Decimal | null]> = [
      ['Experian', report.experianScore ? new Prisma.Decimal(report.experianScore) : null],
      ['TransUnion', report.transUnionScore ? new Prisma.Decimal(report.transUnionScore) : null],
      ['Equifax', report.equifaxScore ? new Prisma.Decimal(report.equifaxScore) : null],
      ['Merged', report.mergedScore ? new Prisma.Decimal(report.mergedScore) : null],
    ];
    doc.font('Helvetica-Bold').text('Scores');
    doc.moveDown(0.5);
    doc.font('Helvetica');
    scores
      .filter(([, value]) => value)
      .forEach(([label, value]) => {
        doc.text(`${label}: ${value?.toFixed(0)}`);
      });

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Summary');
    doc.moveDown(0.5);
    doc.font('Helvetica');
    doc.text(`Total Accounts: ${report.totalAccounts}`);
    doc.text(`Open Accounts: ${report.openAccounts}`);
    doc.text(`Revolving Credit: $${report.totalRevolvingCredit.toFixed(2)}`);
    doc.text(`Revolving Balance: $${report.totalRevolvingBalance.toFixed(2)}`);
    doc.text(`Utilization: ${report.utilizationPercent.toFixed(2)}%`);
    doc.text(`Installment Debt: $${report.totalInstallmentDebt.toFixed(2)}`);
    doc.text(`Monthly Obligations: $${report.monthlyDebtObligations.toFixed(2)}`);
    doc.text(`On-Time Payments: ${report.onTimePaymentPercent.toFixed(2)}%`);

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Delinquencies');
    doc.moveDown(0.5);
    doc.font('Helvetica');
    doc.text(`30 Days Late: ${report.late30Days}`);
    doc.text(`60 Days Late: ${report.late60Days}`);
    doc.text(`90+ Days Late: ${report.late90PlusDays}`);
    doc.text(`Collections: ${report.collections}`);
    doc.text(`Charge-offs: ${report.chargeOffs}`);
    doc.text(`Bankruptcies: ${report.bankruptcies}`);
    doc.text(`Foreclosures: ${report.foreclosures}`);
    doc.text(`Hard Inquiries (24 mo): ${report.hardInquiries}`);
    doc.text(`Soft Inquiries (24 mo): ${report.softInquiries}`);

    doc.end();
  });
}

function determineScoreRange(score?: number | null): string | null {
  if (score === null || score === undefined) {
    return null;
  }
  if (score >= 800) return 'Excellent';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
}

function simulateReport(application: Prisma.CreditApplication & { tenantId: string }, bureau: Bureau): ExperianResponse {
  const seed = parseInt(application.id.replace(/[^0-9]/g, '').slice(-5) || '700', 10);
  const baseScore = 650 + (seed % 100);
  const experianScore = bureau === 'transunion' || bureau === 'equifax' ? baseScore + 5 : baseScore;
  const transUnionScore = bureau === 'experian' || bureau === 'equifax' ? baseScore - 3 : baseScore + 2;
  const equifaxScore = bureau === 'experian' || bureau === 'transunion' ? baseScore - 1 : baseScore + 4;
  const mergedScore = Math.round((experianScore + transUnionScore + equifaxScore) / 3);
  const totalAccounts = 12 + (seed % 5);
  const openAccounts = 8 + (seed % 3);
  const totalRevolvingCredit = 25000 + (seed % 5000);
  const totalRevolvingBalance = 8200 + (seed % 2000);
  const utilizationPercent = Number(((totalRevolvingBalance / totalRevolvingCredit) * 100).toFixed(2));
  const totalInstallmentDebt = 18000 + (seed % 3000);
  const monthlyDebtObligations = Number(((totalInstallmentDebt / 60) + 450).toFixed(2));
  const onTimePaymentPercent = Number((95 + (seed % 4)).toFixed(2));
  const late30Days = seed % 2;
  const late60Days = seed % 3 === 0 ? 1 : 0;
  const late90PlusDays = 0;
  const collections = seed % 4 === 0 ? 1 : 0;
  const chargeOffs = 0;
  const bankruptcies = 0;
  const foreclosures = 0;
  const hardInquiries = 2 + (seed % 2);
  const softInquiries = 5 + (seed % 3);

  const tradeLines = Array.from({ length: openAccounts }, (_, index) => ({
    creditor: `Creditor ${index + 1}`,
    accountType: index % 2 === 0 ? 'Revolving' : 'Installment',
    balance: Number((Math.random() * 5000 + 500).toFixed(2)),
    highCredit: Number((Math.random() * 8000 + 2000).toFixed(2)),
    status: 'Open',
    openedOn: new Date(Date.now() - (index + 1) * 180 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'Current',
  }));

  return {
    experianScore: bureau === 'experian' || bureau === 'tri-merge' ? experianScore : undefined,
    transUnionScore: bureau === 'transunion' || bureau === 'tri-merge' ? transUnionScore : undefined,
    equifaxScore: bureau === 'equifax' || bureau === 'tri-merge' ? equifaxScore : undefined,
    mergedScore: bureau === 'tri-merge' ? mergedScore : undefined,
    scoreRange: determineScoreRange(mergedScore),
    totalAccounts,
    openAccounts,
    totalRevolvingCredit,
    totalRevolvingBalance,
    utilizationPercent,
    totalInstallmentDebt,
    monthlyDebtObligations,
    onTimePaymentPercent,
    late30Days,
    late60Days,
    late90PlusDays,
    collections,
    chargeOffs,
    bankruptcies,
    foreclosures,
    hardInquiries,
    softInquiries,
    tradeLines,
    raw: {
      simulated: true,
      bureau,
      tenantId: application.tenantId,
    },
  };
}

async function executeExperianPull(request: ExperianRequest): Promise<ExperianResponse> {
  if (!hasExperianCredentials()) {
    throw new Error('Experian credentials are not configured');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': env.EXPERIAN_API_KEY!,
    Authorization: `Basic ${Buffer.from(`${env.EXPERIAN_CLIENT_ID}:${env.EXPERIAN_CLIENT_SECRET}`).toString('base64')}`,
  };

  const response = await fetch(env.EXPERIAN_API_URL!, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text();
    throw BadRequest(`Experian credit pull failed: ${message}`);
  }

  const payload = (await response.json()) as Record<string, any>;
  const scores = payload?.scores ?? {};
  const summary = payload?.summary ?? {};
  const inquiries = payload?.inquiries ?? {};
  const tradeLines = Array.isArray(payload?.tradeLines) ? payload.tradeLines : [];

  return {
    experianScore: scores.experian ?? undefined,
    transUnionScore: scores.transUnion ?? undefined,
    equifaxScore: scores.equifax ?? undefined,
    mergedScore: scores.merged ?? undefined,
    scoreRange: payload?.scoreRange ?? determineScoreRange(scores.merged ?? scores.experian ?? null),
    totalAccounts: summary.totalAccounts ?? 0,
    openAccounts: summary.openAccounts ?? 0,
    totalRevolvingCredit: summary.totalRevolvingCredit ?? 0,
    totalRevolvingBalance: summary.totalRevolvingBalance ?? 0,
    utilizationPercent: summary.utilizationPercent ?? 0,
    totalInstallmentDebt: summary.totalInstallmentDebt ?? 0,
    monthlyDebtObligations: summary.monthlyDebtObligations ?? 0,
    onTimePaymentPercent: summary.onTimePaymentPercent ?? 0,
    late30Days: summary.late30Days ?? 0,
    late60Days: summary.late60Days ?? 0,
    late90PlusDays: summary.late90PlusDays ?? 0,
    collections: summary.collections ?? 0,
    chargeOffs: summary.chargeOffs ?? 0,
    bankruptcies: summary.bankruptcies ?? 0,
    foreclosures: summary.foreclosures ?? 0,
    hardInquiries: inquiries.hard ?? 0,
    softInquiries: inquiries.soft ?? 0,
    tradeLines: tradeLines.map((line: any) => ({
      creditor: String(line.creditor ?? 'Unknown'),
      accountType: String(line.accountType ?? 'Unknown'),
      balance: Number(line.balance ?? 0),
      highCredit: line.highCredit ? Number(line.highCredit) : undefined,
      status: String(line.status ?? 'Unknown'),
      openedOn: line.openedOn ?? new Date().toISOString(),
      lastUpdatedOn: line.lastUpdatedOn ?? new Date().toISOString(),
      paymentStatus: line.paymentStatus ?? undefined,
    })),
    raw: payload,
    pdfBuffer: payload?.pdfContent ? Buffer.from(payload.pdfContent, 'base64') : undefined,
  };
}

async function performBureauPull(application: Prisma.CreditApplication, bureau: Bureau, pullType: PullType): Promise<ExperianResponse> {
  switch (bureau) {
    case 'experian':
      if (!hasExperianCredentials()) {
        return simulateReport(application, bureau);
      }
      return executeExperianPull({
        bureau,
        pullType,
        consumer: {
          firstName: application.firstName,
          middleName: application.middleName ?? undefined,
          lastName: application.lastName,
          ssn: decryptSensitive(application.ssn),
          dateOfBirth: application.dateOfBirth.toISOString().split('T')[0]!,
          phone: application.phone,
          email: application.email,
        },
        addresses: {
          current: {
            street: application.currentStreet,
            city: application.currentCity,
            state: application.currentState,
            postalCode: application.currentZip,
          },
          previous: application.previousStreet
            ? {
                street: application.previousStreet,
                city: application.previousCity ?? '',
                state: application.previousState ?? '',
                postalCode: application.previousZip ?? '',
              }
            : undefined,
        },
        employment: {
          employerName: application.employer,
          jobTitle: application.jobTitle,
          yearsEmployed: application.yearsEmployed,
          monthsEmployed: application.monthsEmployed,
          annualIncome: Number(application.monthlyIncome.mul(12).toFixed(2)),
        },
      });
    case 'transunion':
      if (!hasTransUnionCredentials()) {
        return simulateReport(application, bureau);
      }
      return simulateReport(application, bureau);
    case 'equifax':
      if (!hasEquifaxCredentials()) {
        return simulateReport(application, bureau);
      }
      return simulateReport(application, bureau);
    case 'tri-merge':
    default:
      return simulateReport(application, bureau);
  }
}

export interface CreditApplicationDto {
  id: string;
  dealId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  ssnMasked?: string | null;
  dateOfBirth: string;
  phone: string;
  email: string;
  currentStreet: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  yearsAtAddress: number;
  monthsAtAddress: number;
  residenceType: string;
  monthlyPayment?: string | null;
  previousStreet?: string | null;
  previousCity?: string | null;
  previousState?: string | null;
  previousZip?: string | null;
  employer: string;
  jobTitle: string;
  yearsEmployed: number;
  monthsEmployed: number;
  monthlyIncome: string;
  employerPhone: string;
  otherIncomeSource?: string | null;
  otherIncomeAmount?: string | null;
  coApplicant?: unknown | null;
  references: CreditReferenceInput[];
  authorizeCredit: boolean;
  certifyAccuracy: boolean;
  privacyConsent: boolean;
  signature?: string | null;
  signedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditReportDto {
  id: string;
  dealId: string;
  bureau: string;
  pullType: string;
  experianScore?: number | null;
  transUnionScore?: number | null;
  equifaxScore?: number | null;
  mergedScore?: number | null;
  scoreRange?: string | null;
  totalAccounts: number;
  openAccounts: number;
  totalRevolvingCredit: string;
  totalRevolvingBalance: string;
  utilizationPercent: string;
  totalInstallmentDebt: string;
  monthlyDebtObligations: string;
  onTimePaymentPercent: string;
  late30Days: number;
  late60Days: number;
  late90PlusDays: number;
  collections: number;
  chargeOffs: number;
  bankruptcies: number;
  foreclosures: number;
  hardInquiries: number;
  softInquiries: number;
  tradeLines: Array<Record<string, unknown>>;
  rawResponse: Record<string, unknown>;
  pdfUrl?: string | null;
  pulledAt: string;
}

export class CreditBureauService {
  constructor(private readonly db = prisma) {}

  private toDto(record: Prisma.CreditApplication): CreditApplicationDto {
    const decrypted = (() => {
      try {
        return decryptSensitive(record.ssn);
      } catch {
        return null;
      }
    })();
    return {
      id: record.id,
      dealId: record.dealId,
      firstName: record.firstName,
      middleName: record.middleName,
      lastName: record.lastName,
      ssnMasked: maskSsn(decrypted),
      dateOfBirth: record.dateOfBirth.toISOString(),
      phone: record.phone,
      email: record.email,
      currentStreet: record.currentStreet,
      currentCity: record.currentCity,
      currentState: record.currentState,
      currentZip: record.currentZip,
      yearsAtAddress: record.yearsAtAddress,
      monthsAtAddress: record.monthsAtAddress,
      residenceType: record.residenceType,
      monthlyPayment: decimalToString(record.monthlyPayment),
      previousStreet: record.previousStreet,
      previousCity: record.previousCity,
      previousState: record.previousState,
      previousZip: record.previousZip,
      employer: record.employer,
      jobTitle: record.jobTitle,
      yearsEmployed: record.yearsEmployed,
      monthsEmployed: record.monthsEmployed,
      monthlyIncome: decimalToString(record.monthlyIncome) ?? '0.00',
      employerPhone: record.employerPhone,
      otherIncomeSource: record.otherIncomeSource,
      otherIncomeAmount: decimalToString(record.otherIncomeAmount),
      coApplicant: record.coApplicant,
      references: (record.references as CreditReferenceInput[]) ?? [],
      authorizeCredit: record.authorizeCredit,
      certifyAccuracy: record.certifyAccuracy,
      privacyConsent: record.privacyConsent,
      signature: record.signature,
      signedAt: record.signedAt ? record.signedAt.toISOString() : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private toReportDto(record: Prisma.CreditReport & { creditApplication: { dealId: string } }): CreditReportDto {
    return {
      id: record.id,
      dealId: record.creditApplication.dealId,
      bureau: record.bureau,
      pullType: record.pullType,
      experianScore: record.experianScore ?? null,
      transUnionScore: record.transUnionScore ?? null,
      equifaxScore: record.equifaxScore ?? null,
      mergedScore: record.mergedScore ?? null,
      scoreRange: record.scoreRange ?? null,
      totalAccounts: record.totalAccounts,
      openAccounts: record.openAccounts,
      totalRevolvingCredit: record.totalRevolvingCredit.toFixed(2),
      totalRevolvingBalance: record.totalRevolvingBalance.toFixed(2),
      utilizationPercent: record.utilizationPercent.toFixed(2),
      totalInstallmentDebt: record.totalInstallmentDebt.toFixed(2),
      monthlyDebtObligations: record.monthlyDebtObligations.toFixed(2),
      onTimePaymentPercent: record.onTimePaymentPercent.toFixed(2),
      late30Days: record.late30Days,
      late60Days: record.late60Days,
      late90PlusDays: record.late90PlusDays,
      collections: record.collections,
      chargeOffs: record.chargeOffs,
      bankruptcies: record.bankruptcies,
      foreclosures: record.foreclosures,
      hardInquiries: record.hardInquiries,
      softInquiries: record.softInquiries,
      tradeLines: (record.tradeLines as Array<Record<string, unknown>>) ?? [],
      rawResponse: (record.rawResponse as Record<string, unknown>) ?? {},
      pdfUrl: record.pdfUrl,
      pulledAt: record.pulledAt.toISOString(),
    };
  }

  async saveApplication(tenantId: string, userId: string, input: CreditApplicationInput) {
    const deal = await this.db.dealJacket.findFirst({ where: { id: input.dealId, tenantId } });
    if (!deal) {
      throw NotFound('Deal jacket not found for credit application');
    }

    const existing = await this.db.creditApplication.findUnique({ where: { dealId: input.dealId } });
    const encryptedSsn = input.ssn
      ? encryptSensitive(input.ssn.replace(/[^0-9]/g, ''))
      : existing?.ssn ?? null;

    if (!encryptedSsn) {
      throw BadRequest('SSN is required for a credit application');
    }

    const data: Prisma.CreditApplicationUpsertArgs['create'] = {
      tenantId,
      dealId: input.dealId,
      firstName: input.firstName.trim(),
      middleName: input.middleName?.trim() || null,
      lastName: input.lastName.trim(),
      ssn: encryptedSsn,
      dateOfBirth: toIsoDate(input.dateOfBirth),
      phone: input.phone.trim(),
      email: input.email.trim().toLowerCase(),
      currentStreet: input.currentStreet.trim(),
      currentCity: input.currentCity.trim(),
      currentState: input.currentState.trim(),
      currentZip: input.currentZip.trim(),
      yearsAtAddress: input.yearsAtAddress,
      monthsAtAddress: input.monthsAtAddress,
      residenceType: input.residenceType.trim(),
      monthlyPayment: decimalFrom(input.monthlyPayment),
      previousStreet: input.previousStreet?.trim() || null,
      previousCity: input.previousCity?.trim() || null,
      previousState: input.previousState?.trim() || null,
      previousZip: input.previousZip?.trim() || null,
      employer: input.employer.trim(),
      jobTitle: input.jobTitle.trim(),
      yearsEmployed: input.yearsEmployed,
      monthsEmployed: input.monthsEmployed,
      monthlyIncome: decimalFrom(input.monthlyIncome) ?? new Prisma.Decimal(input.monthlyIncome),
      employerPhone: input.employerPhone.trim(),
      otherIncomeSource: input.otherIncomeSource?.trim() || null,
      otherIncomeAmount: decimalFrom(input.otherIncomeAmount),
      coApplicant: coApplicantToJson(input.coApplicant),
      references: ensureReferences(input.references),
      authorizeCredit: input.authorizeCredit,
      certifyAccuracy: input.certifyAccuracy,
      privacyConsent: input.privacyConsent,
      signature: input.signature?.trim() || null,
      signedAt: input.signature ? (input.signedAt ? toIsoDate(input.signedAt) : new Date()) : existing?.signedAt ?? null,
    };

    const record = existing
      ? await this.db.creditApplication.update({
          where: { id: existing.id },
          data,
        })
      : await this.db.creditApplication.create({ data });

    await logAudit(tenantId, userId, existing ? 'UPDATE_CREDIT_APPLICATION' : 'CREATE_CREDIT_APPLICATION', 'credit', {
      dealId: input.dealId,
      applicationId: record.id,
    });

    return this.toDto(record);
  }

  async getApplication(tenantId: string, dealId: string) {
    const record = await this.db.creditApplication.findFirst({ where: { dealId, tenantId } });
    if (!record) {
      return null;
    }
    return this.toDto(record);
  }

  async pullCredit({ dealId, bureau, pullType, tenantId, userId, ipAddress }: PullCreditInput) {
    const application = await this.db.creditApplication.findFirst({ where: { dealId, tenantId } });
    if (!application) {
      throw BadRequest('A credit application is required before pulling credit');
    }

    if (
      pullType === 'hard' &&
      (!application.authorizeCredit || !application.certifyAccuracy || !application.privacyConsent)
    ) {
      throw Forbidden('Cannot perform a hard pull without applicant consents');
    }

    const reportPayload = await performBureauPull(application, bureau, pullType);

    const reportData: Prisma.CreditReportUpsertArgs['create'] = {
      tenantId,
      creditApplicationId: application.id,
      bureau: bureau.toUpperCase(),
      pullType: pullType.toUpperCase(),
      experianScore: reportPayload.experianScore ?? null,
      transUnionScore: reportPayload.transUnionScore ?? null,
      equifaxScore: reportPayload.equifaxScore ?? null,
      mergedScore: reportPayload.mergedScore ?? null,
      scoreRange: reportPayload.scoreRange ?? determineScoreRange(
        reportPayload.mergedScore ?? reportPayload.experianScore ?? null,
      ),
      totalAccounts: reportPayload.totalAccounts,
      openAccounts: reportPayload.openAccounts,
      totalRevolvingCredit: new Prisma.Decimal(reportPayload.totalRevolvingCredit.toFixed(2)),
      totalRevolvingBalance: new Prisma.Decimal(reportPayload.totalRevolvingBalance.toFixed(2)),
      utilizationPercent: new Prisma.Decimal(reportPayload.utilizationPercent.toFixed(2)),
      totalInstallmentDebt: new Prisma.Decimal(reportPayload.totalInstallmentDebt.toFixed(2)),
      monthlyDebtObligations: new Prisma.Decimal(reportPayload.monthlyDebtObligations.toFixed(2)),
      onTimePaymentPercent: new Prisma.Decimal(reportPayload.onTimePaymentPercent.toFixed(2)),
      late30Days: reportPayload.late30Days,
      late60Days: reportPayload.late60Days,
      late90PlusDays: reportPayload.late90PlusDays,
      collections: reportPayload.collections,
      chargeOffs: reportPayload.chargeOffs,
      bankruptcies: reportPayload.bankruptcies,
      foreclosures: reportPayload.foreclosures,
      hardInquiries: reportPayload.hardInquiries,
      softInquiries: reportPayload.softInquiries,
      tradeLines: reportPayload.tradeLines as Prisma.JsonValue,
      rawResponse: reportPayload.raw as Prisma.JsonValue,
      pulledBy: userId,
      pulledAt: new Date(),
    };

    const report = await this.db.creditReport.upsert({
      where: { creditApplicationId: application.id },
      create: reportData,
      update: reportData,
      include: { creditApplication: { select: { dealId: true } } },
    });

    if (!reportData.rawResponse) {
      reportData.rawResponse = reportPayload.raw as Prisma.JsonValue;
    }

    let pdfUrl: string | null = report.pdfUrl ?? null;
    try {
      if (reportPayload.pdfBuffer) {
        const documentId = generateDocumentId();
        const key = buildDealDocumentKey({
          tenantId,
          dealId,
          documentId,
          originalName: `${bureau}-credit-report.pdf`,
        });
        const upload = await uploadBufferToS3({
          key,
          body: reportPayload.pdfBuffer,
          contentType: 'application/pdf',
          metadata: {
            tenantId,
            dealId,
            creditApplicationId: application.id,
            bureau,
          },
        });
        pdfUrl = upload.url;
      } else {
        const pdfBuffer = await createCreditReportPdf(application, report);
        const documentId = generateDocumentId();
        const key = buildDealDocumentKey({
          tenantId,
          dealId,
          documentId,
          originalName: `${bureau}-credit-report.pdf`,
        });
        const upload = await uploadBufferToS3({
          key,
          body: pdfBuffer,
          contentType: 'application/pdf',
          metadata: {
            tenantId,
            dealId,
            creditApplicationId: application.id,
            bureau,
          },
        });
        pdfUrl = upload.url;
      }
    } catch (error) {
      if (env.NODE_ENV === 'development') {
        console.warn('Unable to upload credit report PDF', error);
      }
    }

    if (pdfUrl && report.pdfUrl !== pdfUrl) {
      await this.db.creditReport.update({
        where: { id: report.id },
        data: { pdfUrl },
      });
      report.pdfUrl = pdfUrl;
    }

    await logAudit(tenantId, userId, 'PULL_CREDIT_REPORT', 'credit', {
      dealId,
      bureau,
      pullType,
      ipAddress,
    });

    return this.toReportDto(report);
  }

  async getReport(tenantId: string, dealId: string) {
    const report = await this.db.creditReport.findFirst({
      where: { tenantId, creditApplication: { dealId } },
      include: { creditApplication: { select: { dealId: true } } },
    });
    if (!report) {
      return null;
    }
    return this.toReportDto(report);
  }

  async shareReport({ dealId, tenantId, userId, recipients, message }: ShareCreditReportInput) {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw BadRequest('At least one recipient is required to share a credit report');
    }

    const report = await this.db.creditReport.findFirst({
      where: { tenantId, creditApplication: { dealId } },
      include: { creditApplication: true },
    });

    if (!report) {
      throw NotFound('No credit report available to share');
    }

    const pdfUrl = report.pdfUrl;
    const score = report.mergedScore ?? report.experianScore ?? report.transUnionScore ?? report.equifaxScore;
    const subject = `Credit Score Update for Deal ${report.creditApplication.dealId}`;
    const html = `
      <p>Hello,</p>
      <p>The latest credit pull for deal <strong>${report.creditApplication.dealId}</strong> is now available.</p>
      <p>Primary score: <strong>${score ?? 'Unavailable'}</strong></p>
      ${message ? `<p>${message}</p>` : ''}
      ${pdfUrl ? `<p>You can download the report <a href="${pdfUrl}" target="_blank">here</a>.</p>` : ''}
      <p>Sent by Autolytiq F&I Suite.</p>
    `;

    sgMail.setApiKey(env.SENDGRID_API_KEY);
    await sgMail.send({
      to: recipients,
      from: env.SENDGRID_FROM_EMAIL,
      subject,
      html,
    });

    await logAudit(tenantId, userId, 'SHARE_CREDIT_REPORT', 'credit', {
      dealId,
      recipients,
    });

    return { status: 'sent', recipients, sentAt: new Date().toISOString(), pdfUrl };
  }
}

export const creditBureauService = new CreditBureauService();
