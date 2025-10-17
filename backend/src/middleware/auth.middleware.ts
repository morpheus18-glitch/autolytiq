import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Unauthorized } from '../lib/errors.js';
import type { AppRole } from '../types/express.js';

type TokenPayload = JwtPayload & {
  userId: string;
  tenantId: string;
  role: AppRole;
  permissions?: string[];
};

function extractToken(authorization?: string) {
  if (!authorization) {
    return undefined;
  }
  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    throw Unauthorized('Authentication required');
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  let payload: TokenPayload;
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    payload = decoded;
  } catch (error) {
    throw Unauthorized('Invalid token');
  }
  if (!payload.userId || !payload.tenantId || !payload.role) {
    throw Unauthorized('Invalid token payload');
  }
  req.user = {
    userId: payload.userId,
    tenantId: payload.tenantId,
    role: payload.role,
    permissions: payload.permissions,
    ip: req.ip,
  };
  next();
}
