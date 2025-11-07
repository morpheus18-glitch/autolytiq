export interface TrackingEvent {
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
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  browser_version: string;
  os: string;
  screen_width: number;
  screen_height: number;
  
  properties: Record<string, any>;
  
  time_on_page?: number;
  scroll_depth?: number;
  
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface CustomerSession {
  session_id: string;
  tenant_id: string;
  customer_id?: string;
  
  session_start: Date;
  session_end: Date;
  session_duration: number;
  
  event_count: number;
  page_views: number;
  unique_pages: number;
  bounce: boolean;
  
  vehicles_viewed: string[];
  landing_page: string;
  exit_page: string;
  
  device_type: string;
  browser: string;
  country: string;
  city: string;
}

export interface AnalyticsMetrics {
  active_users: number;
  total_sessions: number;
  avg_session_duration: number;
  bounce_rate: number;
  conversion_rate: number;
  
  top_pages: Array<{
    page_path: string;
    views: number;
    unique_visitors: number;
    avg_time: number;
  }>;
  
  traffic_sources: Array<{
    source: string;
    medium: string;
    sessions: number;
    conversion_rate: number;
  }>;
}
