/**
 * Tax Service Gateway Proxy
 *
 * Proxies requests to Rust tax-svc
 * POST /api/tax/quote → tax-svc:8080/tax/quote
 */

import { Router, Request, Response } from 'express';
import { logger } from '../lib/logger';

export const taxRouter = Router();

const TAX_SERVICE_URL = process.env.TAX_SERVICE_URL || 'http://localhost:8080';
const TAX_SERVICE_TIMEOUT = parseInt(process.env.TAX_SERVICE_TIMEOUT || '5000', 10);

/**
 * Calculate tax and title quote
 * POST /api/tax/quote
 */
taxRouter.post('/quote', async (req: Request, res: Response) => {
  try {
    const {
      vin,
      address,
      county,
      salePrice,
      tradeValue,
      fees,
    } = req.body;

    // Validate required fields
    if (!address || !address.postal || !address.state || !salePrice) {
      return res.status(400).json({
        error: 'Missing required fields: address (postal, state), salePrice',
      });
    }

    const tenantId = (req as any).tenantId || 'default';

    // Proxy to Rust tax service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TAX_SERVICE_TIMEOUT);

    try {
      const response = await fetch(`${TAX_SERVICE_URL}/tax/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({
          vin,
          address,
          county,
          salePrice,
          tradeValue,
          fees,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Tax service error: ${response.statusText}`);
      }

      const data = await response.json();

      return res.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    logger.error('Failed to calculate tax quote', error instanceof Error ? error : undefined, { body: req.body });

    if ((error as any).name === 'AbortError') {
      return res.status(504).json({
        error: 'Tax service timeout',
        message: 'The tax service did not respond in time',
      });
    }

    return res.status(500).json({
      error: 'Failed to calculate tax quote',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health check (proxies to tax service)
 * GET /api/tax/health
 */
taxRouter.get('/health', async (req: Request, res: Response) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${TAX_SERVICE_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Tax service unhealthy');
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(503).json({
      error: 'Tax service unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
