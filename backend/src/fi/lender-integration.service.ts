import type { Lender } from '@prisma/client';

export type LenderSubmissionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'CONDITIONAL'
  | 'DECLINED'
  | 'COUNTERED';

export type StipulationStatus = 'REQUIRED' | 'SATISFIED' | 'WAIVED';

export interface Stipulation {
  id: string;
  description: string;
  status: StipulationStatus;
  dueDate?: string | null;
  receivedAt?: string | null;
  notes?: string | null;
}

export interface LenderDecision {
  status: LenderSubmissionStatus;
  respondedAt?: string | null;
  expiresAt?: string | null;
  amountApproved?: number | null;
  apr?: number | null;
  buyRate?: number | null;
  dealerReserve?: number | null;
  maxReserve?: number | null;
  term?: number | null;
  monthlyPayment?: number | null;
  declineReason?: string | null;
  declineCode?: string | null;
  stipulations?: Stipulation[];
  rawResponse?: unknown;
}

export interface RouteOneSubmissionApplicant {
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email?: string | null;
  phone?: string | null;
  ssn?: string | null;
  dateOfBirth?: string | null;
  creditScore?: number | null;
}

export interface RouteOneSubmissionVehicle {
  vin?: string | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  mileage?: number | null;
  stockNumber?: string | null;
}

export interface RouteOneSubmission {
  dealId: string;
  applicationId?: string | null;
  desiredTerm?: number | null;
  amountFinanced: number;
  cashDown: number;
  sellingPrice: number;
  applicants: RouteOneSubmissionApplicant[];
  vehicle?: RouteOneSubmissionVehicle | null;
  dealerNotes?: string | null;
  reserveTarget?: number | null;
}

export interface DealertrackSubmission extends RouteOneSubmission {
  lenderTier?: string | null;
}

export class IntegrationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntegrationConfigurationError';
  }
}

export class LenderIntegrationError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'LenderIntegrationError';
  }
}

interface LenderAdapter<TSubmission extends RouteOneSubmission = RouteOneSubmission> {
  submit(submission: TSubmission): Promise<LenderDecision>;
}

interface RouteOneCredentials {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  dealerId: string;
  tokenUrl?: string;
}

interface DealertrackCredentials {
  baseUrl: string;
  apiKey: string;
  dealerId: string;
}

type HttpResponse = Awaited<ReturnType<typeof fetch>>;

async function safeJson(response: HttpResponse) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new LenderIntegrationError('Unable to parse lender response JSON', {
      status: response.status,
      statusText: response.statusText,
      body: text,
      error,
    });
  }
}

function normalizeStatus(value: unknown): LenderSubmissionStatus {
  const normalized = String(value ?? 'PENDING').toUpperCase();
  if (normalized.includes('APPROVED')) {
    return 'APPROVED';
  }
  if (normalized.includes('CONDIT')) {
    return 'CONDITIONAL';
  }
  if (normalized.includes('DECLIN')) {
    return 'DECLINED';
  }
  if (normalized.includes('COUNTER')) {
    return 'COUNTERED';
  }
  return 'PENDING';
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeStipulations(raw: unknown): Stipulation[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      const identifier = record.id ?? record.code ?? record.identifier ?? index;
      const description =
        (record.description as string) ||
        (record.text as string) ||
        (record.name as string) ||
        `Stipulation ${index + 1}`;
      const statusRaw = String(record.status ?? record.state ?? 'REQUIRED').toUpperCase();
      let status: StipulationStatus = 'REQUIRED';
      if (statusRaw.includes('SATISF')) {
        status = 'SATISFIED';
      } else if (statusRaw.includes('WAIV')) {
        status = 'WAIVED';
      }
      return {
        id: String(identifier),
        description,
        status,
        dueDate: (record.dueDate as string) ?? (record.due_at as string) ?? null,
        receivedAt: (record.completedAt as string) ?? (record.received_at as string) ?? null,
        notes: (record.notes as string) ?? null,
      } satisfies Stipulation;
    })
    .filter((item): item is Stipulation => item !== null);
}

function normalizeDecision(payload: any): LenderDecision {
  const decisionSource = payload?.decision ?? payload ?? {};
  const status = normalizeStatus(decisionSource.status ?? payload?.status);

  return {
    status,
    respondedAt:
      (decisionSource.respondedAt as string) ??
      (decisionSource.decisionDate as string) ??
      (decisionSource.timestamp as string) ??
      null,
    expiresAt:
      (decisionSource.expiresAt as string) ??
      (decisionSource.expirationDate as string) ??
      (decisionSource.validThrough as string) ??
      null,
    amountApproved: normalizeNumber(decisionSource.amountApproved ?? decisionSource.approvedAmount),
    apr: normalizeNumber(decisionSource.apr ?? decisionSource.apy ?? decisionSource.rate),
    buyRate: normalizeNumber(decisionSource.buyRate ?? decisionSource.buy_rate),
    dealerReserve: normalizeNumber(decisionSource.dealerReserve ?? decisionSource.reserveAmount),
    maxReserve: normalizeNumber(decisionSource.maxReserve ?? decisionSource.reserveCap),
    term: normalizeNumber(decisionSource.term ?? decisionSource.termMonths) ?? null,
    monthlyPayment: normalizeNumber(decisionSource.monthlyPayment ?? decisionSource.payment),
    declineReason: (decisionSource.declineReason as string) ?? null,
    declineCode: (decisionSource.declineCode as string) ?? null,
    stipulations: normalizeStipulations(decisionSource.stipulations ?? payload?.stipulations),
    rawResponse: payload,
  };
}

class RouteOneAdapter implements LenderAdapter<RouteOneSubmission> {
  private token?: { accessToken: string; expiresAt: number };

  constructor(private readonly credentials: RouteOneCredentials, private readonly fetchFn: typeof fetch = fetch) {}

  private async authenticate() {
    const now = Date.now();
    if (this.token && this.token.expiresAt > now + 30_000) {
      return this.token.accessToken;
    }

    const tokenUrl = this.credentials.tokenUrl ?? `${this.credentials.baseUrl.replace(/\/$/, '')}/oauth/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
      scope: 'applications:write applications:read',
    });

    const response = await this.fetchFn(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new IntegrationConfigurationError(
        `RouteOne authentication failed with status ${response.status}: ${response.statusText}`,
      );
    }

    const json = (await safeJson(response)) as { access_token?: string; expires_in?: number } | null;
    if (!json?.access_token) {
      throw new IntegrationConfigurationError('RouteOne authentication response missing access token');
    }

    this.token = {
      accessToken: json.access_token,
      expiresAt: Date.now() + ((json.expires_in ?? 300) * 1000 - 30_000),
    };

    return this.token.accessToken;
  }

  async submit(submission: RouteOneSubmission): Promise<LenderDecision> {
    const token = await this.authenticate();
    const endpoint = `${this.credentials.baseUrl.replace(/\/$/, '')}/finance/submissions`;

    const response = await this.fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-routeone-dealer-id': this.credentials.dealerId,
      },
      body: JSON.stringify({
        dealerId: this.credentials.dealerId,
        submission,
      }),
    });

    if (response.status === 401) {
      this.token = undefined;
    }

    if (!response.ok) {
      const payload = await safeJson(response);
      throw new LenderIntegrationError(
        `RouteOne submission failed with status ${response.status}: ${response.statusText}`,
        payload,
      );
    }

    const payload = await safeJson(response);
    return normalizeDecision(payload);
  }
}

class DealertrackAdapter implements LenderAdapter<DealertrackSubmission> {
  constructor(private readonly credentials: DealertrackCredentials | null, private readonly fetchFn: typeof fetch = fetch) {}

  private ensureConfigured(): DealertrackCredentials {
    if (!this.credentials?.baseUrl || !this.credentials.apiKey || !this.credentials.dealerId) {
      throw new IntegrationConfigurationError('Dealertrack integration is not configured for this lender');
    }
    return this.credentials;
  }

  async submit(submission: DealertrackSubmission): Promise<LenderDecision> {
    const creds = this.ensureConfigured();
    const endpoint = `${creds.baseUrl.replace(/\/$/, '')}/v1/dealers/${creds.dealerId}/applications`;

    const response = await this.fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': creds.apiKey,
      },
      body: JSON.stringify({ application: submission }),
    });

    if (!response.ok) {
      const payload = await safeJson(response);
      throw new LenderIntegrationError(
        `Dealertrack submission failed with status ${response.status}: ${response.statusText}`,
        payload,
      );
    }

    const payload = await safeJson(response);
    return normalizeDecision(payload);
  }
}

export class LenderIntegrationService {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async submit(lender: Lender, submission: RouteOneSubmission): Promise<LenderDecision> {
    const adapter = this.createAdapter(lender);
    if (adapter instanceof DealertrackAdapter) {
      const payload: DealertrackSubmission = { ...submission };
      return adapter.submit(payload);
    }
    return adapter.submit(submission);
  }

  private createAdapter(lender: Lender): LenderAdapter {
    const provider = lender.apiProvider.toLowerCase();
    if (provider === 'routeone' || provider === 'route_one') {
      const credentials = this.parseCredentials<RouteOneCredentials>(lender);
      return new RouteOneAdapter(credentials, this.fetchFn);
    }

    if (provider === 'dealertrack' || provider === 'dealer_track') {
      const credentials = this.parseCredentials<DealertrackCredentials | null>(lender);
      return new DealertrackAdapter(credentials, this.fetchFn);
    }

    throw new IntegrationConfigurationError(`Unsupported lender provider: ${lender.apiProvider}`);
  }

  private parseCredentials<T>(lender: Lender): T {
    const credentials = lender.apiCredentials as unknown;
    if (!credentials || typeof credentials !== 'object') {
      throw new IntegrationConfigurationError(
        `Missing API credentials for lender ${lender.name} (${lender.id})`,
      );
    }
    return credentials as T;
  }
}

export const lenderIntegrationService = new LenderIntegrationService();
