import { createClient, ClickHouseClient } from '@clickhouse/client';

interface PeriodConfig {
  interval: string;
  format: string;
}

function buildDateFilter(column: string, startDate?: string, endDate?: string): string {
  const filters: string[] = [];
  if (startDate) {
    filters.push(`${column} >= toDateTime('{startDate:String}')`);
  }
  if (endDate) {
    filters.push(`${column} <= toDateTime('{endDate:String}')`);
  }
  return filters.length ? ` AND ${filters.join(' AND ')}` : '';
}

export class AnalyticsService {
  private clickhouse: ClickHouseClient;

  constructor() {
    this.clickhouse = createClient({
      host: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USER || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || '',
      database: process.env.CLICKHOUSE_DATABASE || 'automotive_tracking',
    });
  }

  /**
   * Get period configuration
   */
  private getPeriodConfig(period: string): PeriodConfig {
    const configs: Record<string, PeriodConfig> = {
      '1h': { interval: '1 HOUR', format: '%H:%i' },
      '24h': { interval: '24 HOUR', format: '%H:00' },
      '7d': { interval: '7 DAY', format: '%Y-%m-%d' },
      '30d': { interval: '30 DAY', format: '%Y-%m-%d' },
      '90d': { interval: '90 DAY', format: '%Y-%m-%d' },
    };
    return configs[period] || configs['7d'];
  }

  /**
   * Get active users (last 5 minutes)
   */
  async getActiveUsers(tenantId: string): Promise<number> {
    const query = `
      SELECT count(DISTINCT session_id) as active_sessions
      FROM customer_events
      WHERE tenant_id = {tenantId:String}
        AND event_timestamp >= now() - INTERVAL 5 MINUTE
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId },
      format: 'JSONEachRow',
    });

    const data = await result.json<{ active_sessions: number }[]>();
    return data[0]?.active_sessions || 0;
  }

  /**
   * Get top pages by traffic
   */
  async getTopPages(tenantId: string, period: string): Promise<any[]> {
    const { interval } = this.getPeriodConfig(period);

    const query = `
      SELECT
        page_path,
        count() as views,
        count(DISTINCT session_id) as unique_visitors,
        avg(time_on_page) as avg_time_seconds,
        countIf(event_name = 'form_submit') as conversions,
        (conversions / NULLIF(unique_visitors, 0)) * 100 as conversion_rate
      FROM customer_events
      WHERE tenant_id = {tenantId:String}
        AND event_timestamp >= now() - INTERVAL ${interval}
        AND event_name = 'page_view'
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 20
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId },
      format: 'JSONEachRow',
    });

    return await result.json();
  }

  /**
   * Get traffic sources
   */
  async getTrafficSources(tenantId: string, period: string): Promise<any[]> {
    const { interval } = this.getPeriodConfig(period);

    const query = `
      SELECT
        coalesce(utm_source, 'Direct') as source,
        coalesce(utm_medium, 'None') as medium,
        count(DISTINCT session_id) as sessions,
        sum(page_views) as total_page_views,
        avg(session_duration) as avg_session_duration,
        sum(form_submissions) as conversions,
        (conversions / NULLIF(sessions, 0)) * 100 as conversion_rate
      FROM customer_sessions
      WHERE tenant_id = {tenantId:String}
        AND session_start >= now() - INTERVAL ${interval}
      GROUP BY source, medium
      ORDER BY sessions DESC
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId },
      format: 'JSONEachRow',
    });

    return await result.json();
  }

  /**
   * Get conversion funnel
   */
  async getConversionFunnel(tenantId: string, period: string): Promise<any> {
    const { interval } = this.getPeriodConfig(period);

    const query = `
      SELECT
        countIf(step_1_visit IS NOT NULL) as visitors,
        countIf(step_2_vehicle_view IS NOT NULL) as vehicle_viewers,
        countIf(step_3_detail_view IS NOT NULL) as detail_viewers,
        countIf(step_4_financing_click IS NOT NULL) as financing_clicks,
        countIf(step_5_form_submit IS NOT NULL) as form_submissions,
        countIf(step_6_test_drive IS NOT NULL) as test_drives,
        countIf(step_7_deal_created IS NOT NULL) as deals_created,
        
        (vehicle_viewers / NULLIF(visitors, 0)) * 100 as visit_to_view_rate,
        (detail_viewers / NULLIF(vehicle_viewers, 0)) * 100 as view_to_detail_rate,
        (financing_clicks / NULLIF(detail_viewers, 0)) * 100 as detail_to_finance_rate,
        (form_submissions / NULLIF(financing_clicks, 0)) * 100 as finance_to_form_rate,
        (test_drives / NULLIF(form_submissions, 0)) * 100 as form_to_test_drive_rate,
        (deals_created / NULLIF(test_drives, 0)) * 100 as test_drive_to_deal_rate,
        (deals_created / NULLIF(visitors, 0)) * 100 as overall_conversion_rate
      FROM conversion_funnels
      WHERE tenant_id = {tenantId:String}
        AND created_at >= now() - INTERVAL ${interval}
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId },
      format: 'JSONEachRow',
    });

    const data = await result.json<any[]>();
    return data[0] || {};
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(tenantId: string, period: string): Promise<any[]> {
    const { interval } = this.getPeriodConfig(period);

    const query = `
      SELECT
        device_type,
        browser,
        count(DISTINCT session_id) as sessions,
        avg(session_duration) as avg_duration,
        sum(page_views) as total_page_views,
        sum(form_submissions) as conversions,
        (conversions / NULLIF(sessions, 0)) * 100 as conversion_rate
      FROM customer_sessions
      WHERE tenant_id = {tenantId:String}
        AND session_start >= now() - INTERVAL ${interval}
      GROUP BY device_type, browser
      ORDER BY sessions DESC
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId },
      format: 'JSONEachRow',
    });

    return await result.json();
  }

  /**
   * Get customer journey
   */
  async getCustomerJourney(tenantId: string, customerId: string): Promise<any[]> {
    const query = `
      SELECT
        event_timestamp,
        event_name,
        page_path,
        page_title,
        JSONExtractString(properties, 'vehicleId') as vehicle_id,
        time_on_page,
        device_type,
        session_id
      FROM customer_events
      WHERE customer_id = {customerId:String}
        AND tenant_id = {tenantId:String}
      ORDER BY event_timestamp ASC
      LIMIT 1000
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId, customerId },
      format: 'JSONEachRow',
    });

    return await result.json();
  }

  /**
   * Get session replay data
   */
  async getSessionReplay(tenantId: string, sessionId: string): Promise<any[]> {
    const query = `
      SELECT
        event_timestamp,
        event_name,
        page_url,
        page_path,
        time_on_page,
        scroll_depth,
        properties,
        device_type,
        browser
      FROM customer_events
      WHERE session_id = {sessionId:String}
        AND tenant_id = {tenantId:String}
      ORDER BY event_timestamp ASC
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId, sessionId },
      format: 'JSONEachRow',
    });

    return await result.json();
  }

  /**
   * Get hot leads (high intent customers)
   */
  async getHotLeads(tenantId: string, limit: number, minScore: number): Promise<any[]> {
    const query = `
      SELECT
        customer_id,
        count() as total_events,
        countIf(event_name = 'vehicle_view') as vehicle_views,
        countIf(event_name = 'financing_calculator') as finance_calcs,
        countIf(event_name = 'form_submit') as form_submits,
        max(event_timestamp) as last_activity,
        dateDiff('hour', max(event_timestamp), now()) as hours_since_activity,
        
        (vehicle_views * 5) + (finance_calcs * 10) + (form_submits * 20) as intent_score
      FROM customer_events
      WHERE tenant_id = {tenantId:String}
        AND event_timestamp >= now() - INTERVAL 7 DAY
        AND customer_id IS NOT NULL
      GROUP BY customer_id
      HAVING intent_score >= {minScore:UInt32}
      ORDER BY intent_score DESC, last_activity DESC
      LIMIT {limit:UInt32}
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId, minScore, limit },
      format: 'JSONEachRow',
    });

    return await result.json();
  }

  /**
   * Get vehicle analytics
   */
  async getVehicleAnalytics(tenantId: string, period: string): Promise<any[]> {
    const { interval } = this.getPeriodConfig(period);

    const query = `
      SELECT
        JSONExtractString(properties, 'vehicleId') as vehicle_id,
        JSONExtractString(properties, 'make') as make,
        JSONExtractString(properties, 'model') as model,
        JSONExtractUInt(properties, 'year') as year,
        count() as view_count,
        count(DISTINCT customer_id) as unique_viewers,
        count(DISTINCT session_id) as unique_sessions,
        avg(time_on_page) as avg_time_viewed
      FROM customer_events
      WHERE tenant_id = {tenantId:String}
        AND event_name = 'vehicle_view'
        AND event_timestamp >= now() - INTERVAL ${interval}
        AND JSONHas(properties, 'vehicleId')
      GROUP BY vehicle_id, make, model, year
      ORDER BY view_count DESC
      LIMIT 50
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId },
      format: 'JSONEachRow',
    });

    return await result.json();
  }

  /**
   * Get heatmap data for a page
   */
  async getHeatmapData(tenantId: string, pagePath: string, period: string): Promise<any[]> {
    const { interval } = this.getPeriodConfig(period);

    const query = `
      SELECT
        x_position,
        y_position,
        viewport_width,
        viewport_height,
        x_percent,
        y_percent,
        element_tag,
        element_id,
        element_class,
        click_timestamp,
        session_id
      FROM click_heatmap
      WHERE tenant_id = {tenantId:String}
        AND page_path = {pagePath:String}
        AND click_timestamp >= now() - INTERVAL ${interval}
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId, pagePath },
      format: 'JSONEachRow',
    });

    return await result.json();
  }

  /**
   * Export data in JSON or CSV format
   */
  async exportData(
    tenantId: string,
    type: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const dateFilter = buildDateFilter('event_timestamp', startDate, endDate);

    if (type === 'sessions') {
      const query = `
        SELECT *
        FROM customer_sessions
        WHERE tenant_id = {tenantId:String}
          ${buildDateFilter('session_start', startDate, endDate)}
        ORDER BY session_start DESC
      `;

      const result = await this.clickhouse.query({
        query,
        query_params: { tenantId, startDate, endDate },
        format: 'JSONEachRow',
      });
      const data = await result.json();
      return data;
    }

    if (type === 'funnels') {
      const query = `
        SELECT *
        FROM conversion_funnels
        WHERE tenant_id = {tenantId:String}
          ${buildDateFilter('created_at', startDate, endDate)}
        ORDER BY created_at DESC
      `;

      const result = await this.clickhouse.query({
        query,
        query_params: { tenantId, startDate, endDate },
        format: 'JSONEachRow',
      });
      return await result.json();
    }

    // Default to exporting raw events
    const query = `
      SELECT *
      FROM customer_events
      WHERE tenant_id = {tenantId:String}
        ${dateFilter}
      ORDER BY event_timestamp DESC
    `;

    const result = await this.clickhouse.query({
      query,
      query_params: { tenantId, startDate, endDate },
      format: 'JSONEachRow',
    });

    const data = await result.json();
    return data;
  }

  async close(): Promise<void> {
    await this.clickhouse.close();
  }
}
