import { Router, Request, Response } from 'express';
import { rustPricingService } from '../services/rustPricing.service';
import { logger } from '../lib/logger';

export const pricingRouter = Router();

/**
 * Calculate payment details
 * POST /api/pricing/calculate-payment
 */
pricingRouter.post('/calculate-payment', async (req: Request, res: Response) => {
  try {
    const { amountFinanced, apr, termMonths, grossMonthlyIncome, totalMonthlyDebt } = req.body;

    // Validate required fields
    if (!amountFinanced || !apr || !termMonths) {
      return res.status(400).json({
        error: 'Missing required fields: amountFinanced, apr, termMonths',
      });
    }

    const tenantId = (req as any).tenantId || 'default';

    const result = await rustPricingService.calculatePayment({
      tenantId,
      amountFinanced,
      apr,
      termMonths,
      grossMonthlyIncome,
      totalMonthlyDebt,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to calculate payment', error instanceof Error ? error : undefined, { body: req.body });
    return res.status(500).json({
      error: 'Failed to calculate payment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Calculate gross profit breakdown
 * POST /api/pricing/calculate-gross
 */
pricingRouter.post('/calculate-gross', async (req: Request, res: Response) => {
  try {
    const {
      vehiclePrice,
      vehicleCost,
      pack,
      tradeValue,
      tradePayoff,
      tradeAllowance,
      rateMarkup,
      termMonths,
      amountFinanced,
      participation,
      products,
    } = req.body;

    if (!vehiclePrice || !vehicleCost) {
      return res.status(400).json({
        error: 'Missing required fields: vehiclePrice, vehicleCost',
      });
    }

    const tenantId = (req as any).tenantId || 'default';

    const result = await rustPricingService.calculateGross({
      tenantId,
      vehiclePrice,
      vehicleCost,
      pack,
      tradeValue,
      tradePayoff,
      tradeAllowance,
      rateMarkup,
      termMonths,
      amountFinanced,
      participation,
      products,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to calculate gross', error instanceof Error ? error : undefined, { body: req.body });
    return res.status(500).json({
      error: 'Failed to calculate gross',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get market data and competitive pricing
 * POST /api/pricing/market-data
 */
pricingRouter.post('/market-data', async (req: Request, res: Response) => {
  try {
    const { year, make, model, trim, mileage, zipCode, radiusMiles, timeWindowDays } = req.body;

    if (!year || !make || !model || !mileage) {
      return res.status(400).json({
        error: 'Missing required fields: year, make, model, mileage',
      });
    }

    const tenantId = (req as any).tenantId || 'default';

    const result = await rustPricingService.getMarketData({
      tenantId,
      year,
      make,
      model,
      trim,
      mileage,
      zipCode,
      radiusMiles,
      timeWindowDays,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to get market data', error instanceof Error ? error : undefined, { body: req.body });
    return res.status(500).json({
      error: 'Failed to get market data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Suggest price markdown based on aging
 * POST /api/pricing/suggest-markdown
 */
pricingRouter.post('/suggest-markdown', async (req: Request, res: Response) => {
  try {
    const { currentPrice, cost, daysInStock, marketRange } = req.body;

    if (!currentPrice || !cost || daysInStock === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: currentPrice, cost, daysInStock',
      });
    }

    const tenantId = (req as any).tenantId || 'default';

    const result = await rustPricingService.suggestMarkdown({
      tenantId,
      currentPrice,
      cost,
      daysInStock,
      marketRange,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to suggest markdown', error instanceof Error ? error : undefined, { body: req.body });
    return res.status(500).json({
      error: 'Failed to suggest markdown',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health check for Rust pricing service
 * GET /api/pricing/health
 */
pricingRouter.get('/health', async (_req: Request, res: Response) => {
  try {
    // Test a simple calculation to verify the service is working
    const result = await rustPricingService.calculatePayment({
      tenantId: 'healthcheck',
      amountFinanced: 30000,
      apr: 5.99,
      termMonths: 60,
    });

    return res.json({
      success: true,
      status: 'healthy',
      message: 'Rust pricing service is operational',
      sampleCalculation: {
        monthlyPayment: result.monthlyPayment,
      },
    });
  } catch (error) {
    logger.error('Rust pricing service health check failed', error instanceof Error ? error : undefined);
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Rust pricing service is not available',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default pricingRouter;
