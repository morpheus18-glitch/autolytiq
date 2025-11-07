import { Router } from 'express';
import {
  recordEvents,
  getDashboardAnalytics,
  getCustomerJourney,
  getSessionReplay,
  getHotLeads,
  getVehicleAnalytics,
  getHeatmapData,
  exportAnalytics,
} from '../controllers/tracking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Event ingestion endpoint does not require authentication but expects API key if configured
router.post('/events', recordEvents);

// Authenticated analytics endpoints
router.get('/analytics/dashboard', authenticate, getDashboardAnalytics);
router.get('/analytics/customer/:customerId', authenticate, getCustomerJourney);
router.get('/analytics/session/:sessionId', authenticate, getSessionReplay);
router.get('/analytics/hot-leads', authenticate, getHotLeads);
router.get('/analytics/vehicles', authenticate, getVehicleAnalytics);
router.get('/analytics/heatmap/:pagePath', authenticate, getHeatmapData);
router.get('/analytics/export', authenticate, exportAnalytics);

export default router;
