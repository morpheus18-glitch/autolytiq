import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Simple in-memory rate limiter
 * For production with multiple instances, consider using Redis
 */
export function rateLimiter(options?: {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: Request) => string;
}) {
  const windowMs = options?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = options?.maxRequests ?? env.RATE_LIMIT_MAX_REQUESTS;
  const keyGenerator = options?.keyGenerator ?? defaultKeyGenerator;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      // Reset or initialize
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      setRateLimitHeaders(res, store[key], maxRequests);
      return next();
    }

    store[key].count++;

    setRateLimitHeaders(res, store[key], maxRequests);

    if (store[key].count > maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

function defaultKeyGenerator(req: Request): string {
  // Use IP address as the key
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function setRateLimitHeaders(
  res: Response,
  entry: { count: number; resetTime: number },
  maxRequests: number,
) {
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
}

/**
 * Stricter rate limit for authentication endpoints
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
});

/**
 * Rate limit for API endpoints
 */
export const apiRateLimiter = rateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
});
