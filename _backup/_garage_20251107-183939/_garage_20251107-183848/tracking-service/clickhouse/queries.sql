-- ============================================================================
-- COMMON ANALYTICS QUERIES
-- Pre-built queries for common tracking analytics
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. Real-time Active Users (Last 5 Minutes)
-- -----------------------------------------------------------------------------
SELECT
    tenant_id,
    count(DISTINCT session_id) as active_sessions,
    count(DISTINCT customer_id) as identified_users,
    count(DISTINCT anonymous_id) as anonymous_users
FROM customer_events
WHERE event_timestamp >= now() - INTERVAL 5 MINUTE
GROUP BY tenant_id;

-- -----------------------------------------------------------------------------
-- 2. Top Pages by Traffic
-- -----------------------------------------------------------------------------
SELECT
    page_path,
    count() as views,
    count(DISTINCT session_id) as unique_visitors,
    avg(time_on_page) as avg_time_seconds,
    countIf(event_name = 'form_submit') as conversions,
    (conversions / unique_visitors) * 100 as conversion_rate
FROM customer_events
WHERE tenant_id = '{tenant_id}'
  AND event_timestamp >= now() - INTERVAL 7 DAY
  AND event_name = 'page_view'
GROUP BY page_path
ORDER BY views DESC
LIMIT 20;

-- -----------------------------------------------------------------------------
-- 3. Traffic Sources
-- -----------------------------------------------------------------------------
SELECT
    coalesce(utm_source, 'Direct') as source,
    coalesce(utm_medium, 'None') as medium,
    count(DISTINCT session_id) as sessions,
    sum(page_views) as total_page_views,
    avg(session_duration) as avg_session_duration,
    sum(form_submissions) as total_conversions,
    (total_conversions / sessions) * 100 as conversion_rate
FROM customer_sessions
WHERE tenant_id = '{tenant_id}'
  AND session_start >= now() - INTERVAL 30 DAY
GROUP BY source, medium
ORDER BY sessions DESC;

-- -----------------------------------------------------------------------------
-- 4. Most Viewed Vehicles
-- -----------------------------------------------------------------------------
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
WHERE tenant_id = '{tenant_id}'
  AND event_name = 'vehicle_view'
  AND event_timestamp >= now() - INTERVAL 7 DAY
  AND JSONHas(properties, 'vehicleId')
GROUP BY vehicle_id, make, model, year
ORDER BY view_count DESC
LIMIT 50;

-- -----------------------------------------------------------------------------
-- 5. Conversion Funnel Analysis
-- -----------------------------------------------------------------------------
SELECT
    countIf(step_1_visit IS NOT NULL) as visitors,
    countIf(step_2_vehicle_view IS NOT NULL) as vehicle_viewers,
    countIf(step_3_detail_view IS NOT NULL) as detail_viewers,
    countIf(step_4_financing_click IS NOT NULL) as financing_clicks,
    countIf(step_5_form_submit IS NOT NULL) as form_submissions,
    countIf(step_6_test_drive IS NOT NULL) as test_drives,
    countIf(step_7_deal_created IS NOT NULL) as deals_created,
    
    -- Conversion Rates
    (vehicle_viewers / visitors) * 100 as visit_to_view_rate,
    (detail_viewers / vehicle_viewers) * 100 as view_to_detail_rate,
    (financing_clicks / detail_viewers) * 100 as detail_to_finance_rate,
    (form_submissions / financing_clicks) * 100 as finance_to_form_rate,
    (test_drives / form_submissions) * 100 as form_to_test_drive_rate,
    (deals_created / test_drives) * 100 as test_drive_to_deal_rate,
    
    -- Overall Conversion
    (deals_created / visitors) * 100 as overall_conversion_rate
FROM conversion_funnels
WHERE tenant_id = '{tenant_id}'
  AND created_at >= now() - INTERVAL 30 DAY;

-- -----------------------------------------------------------------------------
-- 6. Customer Journey Reconstruction
-- -----------------------------------------------------------------------------
SELECT
    event_timestamp,
    event_name,
    page_path,
    page_title,
    JSONExtractString(properties, 'vehicleId') as vehicle_id,
    time_on_page,
    device_type
FROM customer_events
WHERE customer_id = '{customer_id}'
  AND tenant_id = '{tenant_id}'
ORDER BY event_timestamp ASC;

-- -----------------------------------------------------------------------------
-- 7. High-Intent Leads (Hot Leads)
-- -----------------------------------------------------------------------------
SELECT
    customer_id,
    count() as total_events,
    countIf(event_name = 'vehicle_view') as vehicle_views,
    countIf(event_name = 'financing_calculator') as finance_calcs,
    countIf(event_name = 'form_submit') as form_submits,
    max(event_timestamp) as last_activity,
    dateDiff('hour', max(event_timestamp), now()) as hours_since_activity,
    
    -- Intent Score Calculation
    (vehicle_views * 5) + 
    (finance_calcs * 10) + 
    (form_submits * 20) as intent_score
FROM customer_events
WHERE tenant_id = '{tenant_id}'
  AND event_timestamp >= now() - INTERVAL 7 DAY
  AND customer_id IS NOT NULL
GROUP BY customer_id
HAVING intent_score >= 50
ORDER BY intent_score DESC, last_activity DESC
LIMIT 100;

-- -----------------------------------------------------------------------------
-- 8. Session Replay Data
-- Get all events for a session in order
-- -----------------------------------------------------------------------------
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
WHERE session_id = '{session_id}'
  AND tenant_id = '{tenant_id}'
ORDER BY event_timestamp ASC;

-- -----------------------------------------------------------------------------
-- 9. Device & Browser Analytics
-- -----------------------------------------------------------------------------
SELECT
    device_type,
    browser,
    count(DISTINCT session_id) as sessions,
    avg(session_duration) as avg_duration,
    sum(page_views) as total_page_views,
    sum(form_submissions) as conversions,
    (conversions / sessions) * 100 as conversion_rate
FROM customer_sessions
WHERE tenant_id = '{tenant_id}'
  AND session_start >= now() - INTERVAL 30 DAY
GROUP BY device_type, browser
ORDER BY sessions DESC;

-- -----------------------------------------------------------------------------
-- 10. Geographic Distribution
-- -----------------------------------------------------------------------------
SELECT
    country,
    city,
    count(DISTINCT session_id) as sessions,
    count(DISTINCT customer_id) as unique_customers,
    avg(session_duration) as avg_session_duration,
    sum(form_submissions) as total_conversions
FROM customer_sessions
WHERE tenant_id = '{tenant_id}'
  AND session_start >= now() - INTERVAL 30 DAY
GROUP BY country, city
ORDER BY sessions DESC
LIMIT 50;

-- -----------------------------------------------------------------------------
-- 11. Time-based Activity Patterns
-- Find peak hours
-- -----------------------------------------------------------------------------
SELECT
    toHour(event_timestamp) as hour_of_day,
    toDayOfWeek(event_timestamp) as day_of_week,
    count() as event_count,
    count(DISTINCT session_id) as unique_sessions
FROM customer_events
WHERE tenant_id = '{tenant_id}'
  AND event_timestamp >= now() - INTERVAL 30 DAY
GROUP BY hour_of_day, day_of_week
ORDER BY hour_of_day, day_of_week;

-- -----------------------------------------------------------------------------
-- 12. Bounce Rate Analysis
-- -----------------------------------------------------------------------------
SELECT
    landing_page,
    count() as total_sessions,
    countIf(bounce = 1) as bounced_sessions,
    (bounced_sessions / total_sessions) * 100 as bounce_rate,
    avg(session_duration) as avg_duration
FROM customer_sessions
WHERE tenant_id = '{tenant_id}'
  AND session_start >= now() - INTERVAL 7 DAY
GROUP BY landing_page
ORDER BY total_sessions DESC
LIMIT 20;
