import type { Request } from 'express';
import { randomUUID } from 'node:crypto';

const REQUEST_ID_HEADER = 'x-request-id';

export function resolveRequestId(req: Request): string {
  const header = req.get(REQUEST_ID_HEADER) ?? req.get(REQUEST_ID_HEADER.toUpperCase());
  if (header && header.trim().length > 0) {
    return header.trim();
  }
  const generated = randomUUID();
  req.headers[REQUEST_ID_HEADER] = generated;
  return generated;
}
