export interface HttpErrorLike {
  status?: number;
  message?: string;
}

function hasStatusAndMessage(error: unknown): error is HttpErrorLike {
  return typeof error === 'object' && error !== null;
}

export function resolveHttpError(
  error: unknown,
  fallbackStatus = 500,
  fallbackMessage = 'Unexpected error',
): { status: number; message: string } {
  const status =
    hasStatusAndMessage(error) && typeof error.status === 'number'
      ? error.status
      : fallbackStatus;

  if (error instanceof Error) {
    return { status, message: error.message || fallbackMessage };
  }

  if (hasStatusAndMessage(error) && typeof error.message === 'string') {
    return { status, message: error.message };
  }

  return { status, message: fallbackMessage };
}
