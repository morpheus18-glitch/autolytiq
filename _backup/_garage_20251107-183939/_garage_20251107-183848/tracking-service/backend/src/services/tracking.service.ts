import { createClient, ClickHouseClient } from '@clickhouse/client';
import { EventEmitter } from 'events';

interface TrackingEvent {
  event_id?: string;
  event_name: string;
  event_timestamp: number;
  session_id: string;
  customer_id?: string;
  anonymous_id: string;
  tenant_id: string;
  page_url: string;
  page_title: string;
  page_path: string;
  referrer?: string;
  user_agent: string;
  device_type: string;
  browser: string;
  browser_version: string;
  os: string;
  screen_width: number;
  screen_height: number;
  properties: Record<string, any>;
  ip_address?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  created_at?: Date;
}

export class TrackingService extends EventEmitter {
  private clickhouse: ClickHouseClient;
  private batchQueue: TrackingEvent[] = [];
  private batchSize: number = 100;
  private flushInterval: number = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    super();
    
    this.clickhouse = createClient({
      host: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USER || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || '',
      database: process.env.CLICKHOUSE_DATABASE || 'automotive_tracking',
    });

    this.startBatchFlushing();
  }

  /**
   * Record events to ClickHouse
   */
  async recordEvents(events: TrackingEvent[]): Promise<void> {
    try {
      // Add to batch queue
      this.batchQueue.push(...events);

      // Flush if batch is full
      if (this.batchQueue.length >= this.batchSize) {
        await this.flushBatch();
      }
    } catch (error) {
      console.error('Error queueing events:', error);
      throw error;
    }
  }

  /**
   * Flush batch to ClickHouse
   */
  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const eventsToFlush = [...this.batchQueue];
    this.batchQueue = [];

    try {
      // Enrich events with geo data (if available)
      const enrichedEvents = await this.enrichEvents(eventsToFlush);

      // Format for ClickHouse
      const formattedEvents = enrichedEvents.map(event => ({
        event_id: event.event_id || this.generateUUID(),
        event_name: event.event_name,
        event_timestamp: new Date(event.event_timestamp),
        session_id: event.session_id,
        customer_id: event.customer_id || null,
        anonymous_id: event.anonymous_id,
        tenant_id: event.tenant_id,
        page_url: event.page_url,
        page_title: event.page_title,
        page_path: event.page_path,
        referrer: event.referrer || null,
        referrer_domain: event.referrer ? this.extractDomain(event.referrer) : null,
        user_agent: event.user_agent,
        device_type: event.device_type,
        browser: event.browser,
        browser_version: event.browser_version,
        os: event.os,
        os_version: '',
        screen_width: event.screen_width,
        screen_height: event.screen_height,
        ip_address: event.ip_address || '0.0.0.0',
        country: 'US', // Would use IP geolocation service
        region: '',
        city: '',
        postal_code: null,
        latitude: null,
        longitude: null,
        properties: JSON.stringify(event.properties),
        time_on_page: event.properties?.time_seconds ?? null,
        scroll_depth: event.properties?.scroll_depth ?? null,
        utm_source: event.utm_source || null,
        utm_medium: event.utm_medium || null,
        utm_campaign: event.utm_campaign || null,
        utm_term: event.utm_term || null,
        utm_content: event.utm_content || null,
        created_at: event.created_at ? new Date(event.created_at) : new Date(),
      }));

      // Insert into ClickHouse
      await this.clickhouse.insert({
        table: 'customer_events',
        values: formattedEvents,
        format: 'JSONEachRow',
      });

      console.log(`Flushed ${formattedEvents.length} events to ClickHouse`);

      // Emit event for downstream processing
      this.emit('events_recorded', formattedEvents);
    } catch (error) {
      console.error('Error flushing batch to ClickHouse:', error);
      // Re-queue events on failure
      this.batchQueue.unshift(...eventsToFlush);
    }
  }

  /**
   * Enrich events with additional data
   */
  private async enrichEvents(events: TrackingEvent[]): Promise<TrackingEvent[]> {
    // In production, would call IP geolocation API
    // For now, return as-is
    return events;
  }

  /**
   * Start automatic batch flushing
   */
  private startBatchFlushing(): void {
    this.flushTimer = setInterval(() => {
      if (this.batchQueue.length > 0) {
        this.flushBatch();
      }
    }, this.flushInterval);
  }

  /**
   * Queue events for ML analysis
   */
  async queueForAnalysis(events: TrackingEvent[]): Promise<void> {
    // In production, would queue to Redis/RabbitMQ for Celery workers
    console.log(`Queued ${events.length} high-intent events for ML analysis`);
    
    // Emit event for processing
    this.emit('high_intent_events', events);
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  }

  /**
   * Generate UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flushBatch();
    await this.clickhouse.close();
  }
}
