import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';
import { getTenantId } from './prisma.js';

/**
 * Request context storage for tracing
 * Stores traceId and other contextual data per request
 */
interface RequestContext {
  traceId: string;
  spanId?: string;
  parentSpanId?: string;
  userId?: string;
  [key: string]: unknown;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Initialize request context with a new trace ID
 * Call this at the beginning of each HTTP request handler
 */
export function initializeRequestContext(context?: Partial<RequestContext>): RequestContext {
  const ctx: RequestContext = {
    traceId: context?.traceId ?? randomUUID(),
    spanId: context?.spanId ?? randomUUID(),
    parentSpanId: context?.parentSpanId,
    userId: context?.userId,
    ...context,
  };

  requestContext.enterWith(ctx);
  return ctx;
}

/**
 * Get current request context
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

/**
 * Run code within a request context
 */
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return requestContext.run(context, fn);
}

/**
 * Get current trace ID
 * Falls back to 'no-trace' if not in a traced context
 */
export function getTraceId(): string {
  const ctx = requestContext.getStore();
  return ctx?.traceId ?? 'no-trace';
}

/**
 * Get current span ID
 */
export function getSpanId(): string | undefined {
  const ctx = requestContext.getStore();
  return ctx?.spanId;
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Structured log entry
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  traceId: string;
  spanId?: string;
  tenantId?: string;
  userId?: string;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  [key: string]: unknown;
}

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>,
  error?: Error,
): LogEntry {
  const ctx = requestContext.getStore();
  const tenantId = getTenantId();

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    traceId: ctx?.traceId ?? 'no-trace',
    spanId: ctx?.spanId,
    tenantId,
    userId: ctx?.userId,
    ...metadata,
  };

  if (error) {
    entry.error = {
      message: error.message,
      stack: error.stack,
      code: (error as Error & { code?: string }).code,
    };
  }

  return entry;
}

/**
 * Structured logger with OpenTelemetry context
 *
 * Features:
 * - Automatic trace ID injection
 * - Tenant ID from context
 * - User ID from context
 * - JSON structured output
 * - Compatible with log aggregation tools (DataDog, Splunk, etc.)
 */
export const logger = {
  /**
   * Log debug message (verbose, only in development)
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = createLogEntry(LogLevel.DEBUG, message, metadata);
      console.debug(JSON.stringify(entry));
    }
  },

  /**
   * Log informational message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    const entry = createLogEntry(LogLevel.INFO, message, metadata);
    console.log(JSON.stringify(entry));
  },

  /**
   * Log warning message (potential issues)
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    const entry = createLogEntry(LogLevel.WARN, message, metadata);
    console.warn(JSON.stringify(entry));
  },

  /**
   * Log error message
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const entry = createLogEntry(LogLevel.ERROR, message, metadata, error);
    console.error(JSON.stringify(entry));
  },

  /**
   * Log operation timing (for performance monitoring)
   */
  timing(operation: string, durationMs: number, metadata?: Record<string, unknown>): void {
    const entry = createLogEntry(LogLevel.INFO, `Operation completed: ${operation}`, {
      operation,
      durationMs,
      ...metadata,
    });
    console.log(JSON.stringify(entry));
  },
};

/**
 * Performance timing helper
 *
 * Usage:
 * ```
 * const timer = perfTimer('database-query');
 * // ... do work ...
 * timer.end({ query: 'SELECT * FROM customers' });
 * ```
 */
export function perfTimer(operation: string) {
  const start = Date.now();

  return {
    end(metadata?: Record<string, unknown>): number {
      const duration = Date.now() - start;
      logger.timing(operation, duration, metadata);
      return duration;
    },
  };
}

/**
 * Async function wrapper with automatic timing and error logging
 *
 * Usage:
 * ```
 * const result = await traced('calculate-quote', async () => {
 *   return calculateQuote(data);
 * });
 * ```
 */
export async function traced<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const timer = perfTimer(operation);

  try {
    const result = await fn();
    timer.end(metadata);
    return result;
  } catch (error) {
    timer.end({ ...metadata, success: false });
    logger.error(`Operation failed: ${operation}`, error as Error, metadata);
    throw error;
  }
}

/**
 * Express middleware for request tracing
 *
 * Usage in Express:
 * ```
 * app.use(requestTracingMiddleware);
 * ```
 */
export function requestTracingMiddleware(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
): void {
  // Extract trace ID from headers (for distributed tracing)
  const traceId =
    (req.headers['x-trace-id'] as string) ??
    (req.headers['x-request-id'] as string) ??
    randomUUID();

  const userId = (req as Express.Request & { user?: { id?: string } }).user?.id;

  // Initialize context for this request
  initializeRequestContext({
    traceId,
    userId,
  });

  // Inject trace ID into response headers
  res.setHeader('X-Trace-Id', traceId);

  // Log request
  logger.info('HTTP request received', {
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
  });

  // Log response when finished
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
}

// Type augmentation for Express
declare global {
  namespace Express {
    interface Request {
      traceId?: string;
    }
    interface Response {}
    interface NextFunction {}
  }
}
