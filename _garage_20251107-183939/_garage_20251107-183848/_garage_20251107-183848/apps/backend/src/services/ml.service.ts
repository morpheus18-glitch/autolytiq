import axios from 'axios';
import { env } from '../config/env';
import type {
  LeadFeaturePayload,
  LeadInsightsPayload,
  LeadScoreResponsePayload,
  NextActionResponsePayload,
  SentimentRequestPayload,
  SentimentResponsePayload,
} from '../types/ml';
import type {
  ApprovalPrediction,
  ApprovalPredictionRequest,
  CounterAnalysisPayload,
  CounterAnalysisResponse,
  OptimizationPayload,
  OptimizationResponse,
} from '../domain/desking/types';

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRYABLE_CODES = new Set(['ECONNABORTED', 'ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT']);

class CircuitBreaker {
  private failureCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttempt = 0;

  constructor(private readonly failureThreshold = 5, private readonly resetTimeout = 30000) {}

  private transitionToOpen() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.resetTimeout;
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.transitionToOpen();
    }
  }

  async exec<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const error = new Error('ML service circuit breaker is open');
        (error as Error & { status?: number }).status = 503;
        throw error;
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class MLService {
  private readonly client = axios.create({
    baseURL: env.ML_SERVICE_URL,
    timeout: 300, // 300ms - fail fast with fallbacks
    headers: { 'Content-Type': 'application/json' },
  });

  private readonly circuitBreaker = new CircuitBreaker();
  private readonly maxRetries = 3;
  private readonly baseDelay = 200;

  private buildHeaders(requestId?: string, tenantId?: string) {
    return {
      Authorization: `Bearer ${env.ML_SERVICE_TOKEN}`,
      ...(requestId ? { 'X-Request-Id': requestId } : {}),
      ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
    };
  }

  private isRetryable(error: unknown) {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    const status = error.response?.status;
    if (status && RETRYABLE_STATUS.has(status)) {
      return true;
    }

    if (error.code && RETRYABLE_CODES.has(error.code)) {
      return true;
    }

    return false;
  }

  private wrapError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const message =
        (typeof error.response?.data === 'object' && error.response?.data && 'detail' in error.response.data
          ? (error.response.data as Record<string, unknown>).detail
          : undefined) || error.message;
      const wrapped = new Error(`ML service request failed${status ? ` (status ${status})` : ''}: ${message}`);
      (wrapped as Error & { status?: number }).status = status;
      return wrapped;
    }

    return error instanceof Error ? error : new Error('Unknown ML service error');
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.maxRetries) {
      try {
        return await this.circuitBreaker.exec(operation);
      } catch (error) {
        lastError = error;
        if (!this.isRetryable(error) || attempt === this.maxRetries) {
          throw this.wrapError(error);
        }
        await delay(this.baseDelay * 2 ** attempt);
        attempt += 1;
      }
    }

    throw this.wrapError(lastError);
  }

  async scoreLead(payload: LeadFeaturePayload): Promise<LeadScoreResponsePayload> {
    const headers = this.buildHeaders(payload.requestId, payload.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post<LeadScoreResponsePayload>('/score-lead', payload, { headers });
      return response.data;
    });
  }

  async nextAction(
    payload: { leadId: string; prompt: string; channel?: string | null; context: LeadInsightsPayload; requestId?: string },
  ): Promise<NextActionResponsePayload> {
    const headers = this.buildHeaders(payload.requestId, payload.context.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post<NextActionResponsePayload>('/next-action', payload, { headers });
      return response.data;
    });
  }

  async sentimentAnalysis(payload: SentimentRequestPayload): Promise<SentimentResponsePayload> {
    const headers = this.buildHeaders(payload.requestId, payload.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post<SentimentResponsePayload>('/sentiment-analysis', payload, { headers });
      return response.data;
    });
  }

  async optimizeDeal(
    payload: OptimizationPayload,
    options: { tenantId: string; requestId?: string },
  ): Promise<{ result: OptimizationResponse; traceId?: string }> {
    const headers = this.buildHeaders(options.requestId, options.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post<OptimizationResponse>('/desking/optimize', payload, { headers });
      const traceId = response.headers['x-ml-trace-id'];
      return { result: response.data, traceId: typeof traceId === 'string' ? traceId : undefined };
    });
  }

  async analyzeCounter(
    payload: CounterAnalysisPayload,
    options: { tenantId: string; requestId?: string },
  ): Promise<{ result: CounterAnalysisResponse; traceId?: string }> {
    const headers = this.buildHeaders(options.requestId, options.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post<CounterAnalysisResponse>('/desking/counter', payload, { headers });
      const traceId = response.headers['x-ml-trace-id'];
      return { result: response.data, traceId: typeof traceId === 'string' ? traceId : undefined };
    });
  }

  async predictApproval(
    payload: ApprovalPredictionRequest,
    options: { tenantId: string; requestId?: string },
  ): Promise<{ result: ApprovalPrediction; traceId?: string }> {
    const headers = this.buildHeaders(options.requestId, options.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.post<ApprovalPrediction>('/desking/approval', payload, { headers });
      const traceId = response.headers['x-ml-trace-id'];
      return { result: response.data, traceId: typeof traceId === 'string' ? traceId : undefined };
    });
  }

  async closeProbability(params: {
    leadId: string;
    score?: number;
    engagementScore?: number;
    daysInPipeline?: number;
    lastInteractionDays?: number | null;
    similarity?: number;
    requestId?: string;
    tenantId?: string;
  }): Promise<{ probability: number; horizonDays: number; requestId: string }> {
    const headers = this.buildHeaders(params.requestId, params.tenantId);
    return this.withRetry(async () => {
      const response = await this.client.get<{ probability: number; horizonDays: number; requestId: string }>(
        '/close-probability',
        {
          headers,
          params: {
            leadId: params.leadId,
            score: params.score,
            engagementScore: params.engagementScore,
            daysInPipeline: params.daysInPipeline,
            lastInteractionDays: params.lastInteractionDays ?? undefined,
            similarity: params.similarity,
          },
        },
      );
      return response.data;
    });
  }
}

export const mlService = new MLService();
