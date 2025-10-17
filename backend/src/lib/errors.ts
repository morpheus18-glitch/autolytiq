import type { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string, public meta?: unknown) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const BadRequest = (message = 'Bad Request', meta?: unknown) => new HttpError(400, message, 'BAD_REQUEST', meta);
export const Unauthorized = (message = 'Unauthorized') => new HttpError(401, message, 'UNAUTHORIZED');
export const Forbidden = (message = 'Forbidden') => new HttpError(403, message, 'FORBIDDEN');
export const NotFound = (message = 'Not Found') => new HttpError(404, message, 'NOT_FOUND');
export const Unprocessable = (message = 'Unprocessable Entity', meta?: unknown) =>
  new HttpError(422, message, 'UNPROCESSABLE', meta);

export const wrapAsync = (fn: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export function errorHandler(err: any, _req: any, res: any, _next: any) {
  const status = err?.status ?? 500;
  const body = {
    error: {
      message: err?.message ?? 'Internal Server Error',
      code: err?.code ?? 'INTERNAL',
      meta: err?.meta,
    },
  };
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json(body);
}
