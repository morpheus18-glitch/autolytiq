import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Production-ready error handler middleware
 * Logs errors and returns appropriate responses
 */
export function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction) {
  // Log error details
  logError(err, req);

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    error: getErrorMessage(err),
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Log error with appropriate level based on status code
 */
function logError(err: ApiError, req: Request) {
  const statusCode = err.statusCode || 500;
  const logLevel = statusCode >= 500 ? 'error' : 'warn';

  const logMessage = {
    level: logLevel,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    error: {
      message: err.message,
      code: err.code,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    requestId: (req as any).id,
  };

  if (logLevel === 'error') {
    console.error(JSON.stringify(logMessage));
  } else {
    console.warn(JSON.stringify(logMessage));
  }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(err: ApiError): string {
  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return getPrismaErrorMessage(err);
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return 'Invalid data provided';
  }

  // Handle custom API errors
  if (err.statusCode && err.statusCode < 500) {
    return err.message;
  }

  // Production: Don't expose internal errors
  if (env.NODE_ENV === 'production') {
    return 'An unexpected error occurred';
  }

  return err.message;
}

/**
 * Convert Prisma errors to user-friendly messages
 */
function getPrismaErrorMessage(err: Prisma.PrismaClientKnownRequestError): string {
  switch (err.code) {
    case 'P2002':
      return 'A record with this information already exists';
    case 'P2025':
      return 'Record not found';
    case 'P2003':
      return 'Related record not found';
    case 'P2014':
      return 'Invalid relationship between records';
    default:
      return 'Database operation failed';
  }
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not Found',
    code: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.path}`,
  });
}

/**
 * Create API error with status code
 */
export function createApiError(message: string, statusCode: number = 500, code?: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

// Common error creators
export const BadRequestError = (message: string) => createApiError(message, 400, 'BAD_REQUEST');
export const UnauthorizedError = (message: string = 'Unauthorized') =>
  createApiError(message, 401, 'UNAUTHORIZED');
export const ForbiddenError = (message: string = 'Forbidden') =>
  createApiError(message, 403, 'FORBIDDEN');
export const NotFoundError = (message: string) => createApiError(message, 404, 'NOT_FOUND');
export const ConflictError = (message: string) => createApiError(message, 409, 'CONFLICT');
export const ValidationError = (message: string, details?: unknown) => {
  const error = createApiError(message, 422, 'VALIDATION_ERROR');
  error.details = details;
  return error;
};
