import { Request, Response } from 'express';
import { TrackingService } from '../services/tracking.service';
import { AnalyticsService } from '../services/analytics.service';
import { AuthRequest } from '../middleware/auth';

const trackingService = new TrackingService();
const analyticsService = new AnalyticsService();

/**
 * Record customer events from frontend tracking
 */
export const recordEvents = async (req: Request, res: Response) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'No events provided' });
    }

    // Validate and enrich events
    const enrichedEvents = events.map(event => ({
      ...event,
      ip_address: req.ip || req.socket.remoteAddress,
      created_at: new Date(),
    }));

    // Insert events into ClickHouse
    await trackingService.recordEvents(enrichedEvents);

    // Trigger async processing for high-intent events
    const highIntentEvents = events.filter((e: any) => 
      ['finance_application', 'test_drive_request', 'form_submit'].includes(e.event_name)
    );

    if (highIntentEvents.length > 0) {
      // Queue for ML processing (would integrate with Celery/Bull)
      await trackingService.queueForAnalysis(highIntentEvents);
    }

    res.status(200).json({ 
      success: true, 
      recorded: events.length 
    });
  } catch (error) {
    console.error('Error recording events:', error);
    res.status(500).json({ error: 'Failed to record events' });
  }
};

/**
 * Get real-time analytics dashboard data
 */
export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { period = '7d' } = req.query;

    const [
      activeUsers,
      topPages,
      trafficSources,
      conversionFunnel,
      deviceStats
    ] = await Promise.all([
      analyticsService.getActiveUsers(tenantId),
      analyticsService.getTopPages(tenantId, period as string),
      analyticsService.getTrafficSources(tenantId, period as string),
      analyticsService.getConversionFunnel(tenantId, period as string),
      analyticsService.getDeviceStats(tenantId, period as string)
    ]);

    res.json({
      active_users: activeUsers,
      top_pages: topPages,
      traffic_sources: trafficSources,
      conversion_funnel: conversionFunnel,
      device_stats: deviceStats,
      period,
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

/**
 * Get customer journey for specific customer
 */
export const getCustomerJourney = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { customerId } = req.params;

    const journey = await analyticsService.getCustomerJourney(tenantId, customerId);

    res.json({
      customer_id: customerId,
      events: journey,
    });
  } catch (error) {
    console.error('Error fetching customer journey:', error);
    res.status(500).json({ error: 'Failed to fetch customer journey' });
  }
};

/**
 * Get session replay data
 */
export const getSessionReplay = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { sessionId } = req.params;

    const sessionData = await analyticsService.getSessionReplay(tenantId, sessionId);

    res.json({
      session_id: sessionId,
      events: sessionData,
    });
  } catch (error) {
    console.error('Error fetching session replay:', error);
    res.status(500).json({ error: 'Failed to fetch session replay' });
  }
};

/**
 * Get hot leads (high intent customers)
 */
export const getHotLeads = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { limit = 50, minScore = 50 } = req.query;

    const hotLeads = await analyticsService.getHotLeads(
      tenantId,
      parseInt(limit as string, 10),
      parseInt(minScore as string, 10)
    );

    res.json({
      leads: hotLeads,
      count: hotLeads.length,
    });
  } catch (error) {
    console.error('Error fetching hot leads:', error);
    res.status(500).json({ error: 'Failed to fetch hot leads' });
  }
};

/**
 * Get vehicle interest analytics
 */
export const getVehicleAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { period = '7d' } = req.query;

    const vehicleData = await analyticsService.getVehicleAnalytics(
      tenantId,
      period as string
    );

    res.json(vehicleData);
  } catch (error) {
    console.error('Error fetching vehicle analytics:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle analytics' });
  }
};

/**
 * Get heatmap data for a specific page
 */
export const getHeatmapData = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { pagePath } = req.params;
    const { period = '7d' } = req.query;

    const heatmapData = await analyticsService.getHeatmapData(
      tenantId,
      pagePath,
      period as string
    );

    res.json({
      page_path: pagePath,
      clicks: heatmapData,
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
};

/**
 * Export analytics data
 */
export const exportAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { format = 'csv', type = 'events', startDate, endDate } = req.query;

    const data = await analyticsService.exportData(
      tenantId,
      type as string,
      startDate as string | undefined,
      endDate as string | undefined
    );

    if (format === 'csv') {
      const csv = convertToCsv(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${type}-${Date.now()}.csv`);
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Failed to export analytics' });
  }
};

function convertToCsv(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}
