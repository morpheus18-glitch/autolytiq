export interface ApiErrorOptions {
  readonly status?: number;
  readonly details?: unknown;
  readonly cause?: unknown;
}

export class ApiError extends Error {
  readonly code: string;

  readonly status: number;

  readonly details?: unknown;

  constructor(code: string, message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.code = code;
    this.status = options.status ?? 500;
    this.details = options.details;
    if (options.cause) {
      this.cause = options.cause;
    }
    this.name = 'ApiError';
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    const status = typeof (error as Error & { status?: number }).status === 'number'
      ? (error as Error & { status?: number }).status!
      : 500;
    return new ApiError('UNEXPECTED_ERROR', error.message, { status, cause: error });
  }

  return new ApiError('UNEXPECTED_ERROR', 'An unexpected error occurred', { status: 500 });
}
