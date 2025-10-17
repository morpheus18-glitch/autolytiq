-- ============================================================================
-- CLICKHOUSE SCHEMA FOR CUSTOMER EVENT TRACKING
-- High-performance columnar database optimized for analytics
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS automotive_tracking;
USE automotive_tracking;

-- ============================================================================
-- MAIN EVENTS TABLE
-- Stores all raw customer interaction events
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_events (
    -- Event Identification
    event_id UUID DEFAULT generateUUIDv4(),
    event_name LowCardinality(String),
    event_timestamp DateTime64(3) DEFAULT now64(3),
    
    -- Session & User
    session_id String,
    customer_id Nullable(String),
    anonymous_id String,
    tenant_id String,
    
    -- Page Context
    page_url String,
    page_title String,
    page_path String,
    referrer Nullable(String),
    referrer_domain Nullable(String),
    
    -- Device & Browser
    user_agent String,
    device_type LowCardinality(String),  -- desktop, mobile, tablet
    browser LowCardinality(String),
    browser_version String,
    os LowCardinality(String),
    os_version String,
    screen_width UInt16,
    screen_height UInt16,
    
    -- Geographic
    ip_address IPv4,
    country LowCardinality(String),
    region String,
    city String,
    postal_code Nullable(String),
    latitude Nullable(Float32),
    longitude Nullable(Float32),
    
    -- Event Properties (flexible JSON)
    properties String,  -- JSON string of event-specific data
    
    -- Engagement Metrics
    time_on_page Nullable(UInt32),  -- seconds
    scroll_depth Nullable(UInt8),    -- percentage
    
    -- Attribution
    utm_source Nullable(String),
    utm_medium Nullable(String),
    utm_campaign Nullable(String),
    utm_term Nullable(String),
    utm_content Nullable(String),
    
    -- Technical
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_timestamp)
ORDER BY (tenant_id, event_timestamp, session_id)
TTL event_timestamp + INTERVAL 2 YEAR
SETTINGS index_granularity = 8192;

-- Indexes for common queries
ALTER TABLE customer_events ADD INDEX idx_customer_id customer_id TYPE bloom_filter GRANULARITY 1;
ALTER TABLE customer_events ADD INDEX idx_event_name event_name TYPE bloom_filter GRANULARITY 1;
ALTER TABLE customer_events ADD INDEX idx_session_id session_id TYPE bloom_filter GRANULARITY 1;

-- ============================================================================
-- SESSIONS TABLE (Materialized View)
-- Aggregates events into sessions for faster analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_sessions (
    session_id String,
    tenant_id String,
    customer_id Nullable(String),
    anonymous_id String,
    
    -- Session Timing
    session_start DateTime,
    session_end DateTime,
    session_duration UInt32,  -- seconds
    
    -- Engagement Metrics
    event_count UInt32,
    page_views UInt32,
    unique_pages UInt32,
    bounce Boolean,  -- single page session
    
    -- Conversion Events
    form_submissions UInt16,
    test_drive_requests UInt16,
    finance_applications UInt16,
    phone_clicks UInt16,
    
    -- Vehicle Interaction
    vehicles_viewed Array(String),
    vehicle_view_count UInt16,
    
    -- Entry & Exit
    landing_page String,
    exit_page String,
    referrer Nullable(String),
    
    -- Attribution
    utm_source Nullable(String),
    utm_medium Nullable(String),
    utm_campaign Nullable(String),
    
    -- Device
    device_type LowCardinality(String),
    browser LowCardinality(String),
    
    -- Geographic
    country LowCardinality(String),
    city String,
    
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(session_start)
ORDER BY (tenant_id, session_start, customer_id)
TTL session_start + INTERVAL 2 YEAR;

-- ============================================================================
-- MATERIALIZED VIEW: Session Aggregation
-- Automatically aggregates events into sessions
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS sessions_mv TO customer_sessions AS
SELECT
    session_id,
    tenant_id,
    any(customer_id) as customer_id,
    any(anonymous_id) as anonymous_id,
    
    min(event_timestamp) as session_start,
    max(event_timestamp) as session_end,
    dateDiff('second', min(event_timestamp), max(event_timestamp)) as session_duration,
    
    count() as event_count,
    countIf(event_name = 'page_view') as page_views,
    uniq(page_path) as unique_pages,
    countIf(event_count = 1 AND event_name = 'page_view') as bounce,
    
    countIf(event_name = 'form_submit') as form_submissions,
    countIf(event_name = 'test_drive_request') as test_drive_requests,
    countIf(event_name = 'finance_application') as finance_applications,
    countIf(event_name = 'phone_click') as phone_clicks,
    
    groupUniqArray(JSONExtractString(properties, 'vehicleId')) as vehicles_viewed,
    countIf(event_name = 'vehicle_view') as vehicle_view_count,
    
    any(page_path) as landing_page,
    anyLast(page_path) as exit_page,
    any(referrer) as referrer,
    
    any(utm_source) as utm_source,
    any(utm_medium) as utm_medium,
    any(utm_campaign) as utm_campaign,
    
    any(device_type) as device_type,
    any(browser) as browser,
    any(country) as country,
    any(city) as city,
    
    now() as created_at
FROM customer_events
GROUP BY session_id, tenant_id;

-- ============================================================================
-- CUSTOMER PROFILES (Aggregated)
-- Lifetime engagement metrics per customer
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_profiles (
    customer_id String,
    tenant_id String,
    
    -- Lifetime Metrics
    first_seen DateTime,
    last_seen DateTime,
    total_sessions UInt32,
    total_events UInt32,
    total_page_views UInt32,
    
    -- Engagement Score
    engagement_score Float32,
    
    -- Interests
    vehicles_viewed Array(String),
    makes_interested Array(String),
    price_range_min Nullable(UInt32),
    price_range_max Nullable(UInt32),
    
    -- Conversion
    total_form_submissions UInt16,
    total_test_drives UInt16,
    total_finance_apps UInt16,
    total_phone_calls UInt16,
    
    -- Recency
    days_since_last_visit UInt16,
    
    updated_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (tenant_id, customer_id);

-- ============================================================================
-- VEHICLE INTEREST TABLE
-- Tracks which vehicles customers are interested in
-- ============================================================================

CREATE TABLE IF NOT EXISTS vehicle_interests (
    vehicle_id String,
    customer_id String,
    tenant_id String,
    
    -- Interest Signals
    view_count UInt16,
    total_time_viewed UInt32,  -- seconds
    shares UInt8,
    comparisons UInt8,
    
    -- Engagement Actions
    clicked_photos UInt8,
    clicked_features UInt8,
    clicked_financing UInt8,
    requested_test_drive Boolean,
    submitted_lead_form Boolean,
    
    first_viewed DateTime,
    last_viewed DateTime,
    
    -- Interest Score
    interest_score Float32,
    
    updated_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (tenant_id, vehicle_id, customer_id);

-- ============================================================================
-- FUNNEL ANALYSIS TABLE
-- Tracks conversion funnel progress
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversion_funnels (
    funnel_id UUID DEFAULT generateUUIDv4(),
    tenant_id String,
    customer_id String,
    session_id String,
    
    -- Funnel Steps (timestamp when reached)
    step_1_visit Nullable(DateTime),
    step_2_vehicle_view Nullable(DateTime),
    step_3_detail_view Nullable(DateTime),
    step_4_financing_click Nullable(DateTime),
    step_5_form_submit Nullable(DateTime),
    step_6_test_drive Nullable(DateTime),
    step_7_deal_created Nullable(DateTime),
    
    -- Completion
    completed Boolean,
    steps_completed UInt8,
    time_to_complete Nullable(UInt32),  -- seconds
    
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (tenant_id, created_at)
TTL created_at + INTERVAL 1 YEAR;

-- ============================================================================
-- HEATMAP DATA TABLE
-- Stores click coordinates for heatmap visualization
-- ============================================================================

CREATE TABLE IF NOT EXISTS click_heatmap (
    tenant_id String,
    page_path String,
    
    -- Click Position
    x_position UInt16,
    y_position UInt16,
    viewport_width UInt16,
    viewport_height UInt16,
    
    -- Normalized Position (0-100%)
    x_percent UInt8,
    y_percent UInt8,
    
    -- Element Info
    element_tag LowCardinality(String),
    element_id Nullable(String),
    element_class Nullable(String),
    
    click_timestamp DateTime,
    session_id String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(click_timestamp)
ORDER BY (tenant_id, page_path, click_timestamp)
TTL click_timestamp + INTERVAL 90 DAY;
