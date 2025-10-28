/**
 * Pricing API Routes
 * Endpoints for high-performance pricing calculations
 */

import { Router } from 'express';
import * as pricingService from '../services/pricing-grpc.service';

const router = Router();

/**
 * GET /api/pricing/health
 * Check if pricing service is available
 */
router.get('/health', async (req, res) => {
  try {
    const health = await pricingService.checkHealth();
    res.json(health);
  } catch (error: any) {
    res.status(503).json({
      healthy: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/pricing/market-data
 * Get market data for a vehicle
 */
router.post('/market-data', async (req, res) => {
  try {
    const { tenantId, year, make, model, trim, mileage, condition, radiusMiles, zipCode } =
      req.body;

    if (!tenantId || !year || !make || !model || !mileage || !condition) {
      return res.status(400).json({
        error: 'Missing required fields: tenantId, year, make, model, mileage, condition',
      });
    }

    const result = await pricingService.getMarketData({
      tenantId,
      userId: (req as any).user?.id,
      year: parseInt(year),
      make,
      model,
      trim,
      mileage: parseInt(mileage),
      condition,
      radiusMiles: radiusMiles ? parseInt(radiusMiles) : undefined,
      zipCode,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Market data error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pricing/calculate-gross
 * Calculate gross profit on a deal
 */
router.post('/calculate-gross', async (req, res) => {
  try {
    const {
      tenantId,
      vehiclePrice,
      vehicleCost,
      tradeInAllowance,
      tradeInActualValue,
      pack,
      additionalFees,
      fiProducts,
    } = req.body;

    if (!tenantId || vehiclePrice === undefined || vehicleCost === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: tenantId, vehiclePrice, vehicleCost',
      });
    }

    const result = await pricingService.calculateGross({
      tenantId,
      userId: (req as any).user?.id,
      vehiclePrice: parseFloat(vehiclePrice),
      vehicleCost: parseFloat(vehicleCost),
      tradeInAllowance: tradeInAllowance ? parseFloat(tradeInAllowance) : undefined,
      tradeInActualValue: tradeInActualValue ? parseFloat(tradeInActualValue) : undefined,
      pack: pack ? parseFloat(pack) : undefined,
      additionalFees,
      fiProducts,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Calculate gross error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pricing/calculate-payment
 * Calculate payment structure
 */
router.post('/calculate-payment', async (req, res) => {
  try {
    const {
      tenantId,
      amountFinanced,
      apr,
      termMonths,
      salesTaxRate,
      downPayment,
      tradeInValue,
      rebates,
    } = req.body;

    if (!tenantId || amountFinanced === undefined || apr === undefined || !termMonths) {
      return res.status(400).json({
        error: 'Missing required fields: tenantId, amountFinanced, apr, termMonths',
      });
    }

    const result = await pricingService.calculatePayment({
      tenantId,
      userId: (req as any).user?.id,
      amountFinanced: parseFloat(amountFinanced),
      apr: parseFloat(apr),
      termMonths: parseInt(termMonths),
      salesTaxRate: salesTaxRate ? parseFloat(salesTaxRate) : undefined,
      downPayment: downPayment ? parseFloat(downPayment) : undefined,
      tradeInValue: tradeInValue ? parseFloat(tradeInValue) : undefined,
      rebates: rebates ? parseFloat(rebates) : undefined,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Calculate payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
