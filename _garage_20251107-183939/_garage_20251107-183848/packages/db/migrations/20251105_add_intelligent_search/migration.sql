-- CreateTable: Search Queries History
CREATE TABLE "search_queries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "parsed_query" JSONB,
    "result_type" TEXT NOT NULL,
    "result_count" INTEGER NOT NULL,
    "execution_time" INTEGER NOT NULL,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Popular Searches Cache
CREATE TABLE "popular_searches" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "query" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "last_used" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "popular_searches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Search Queries
CREATE INDEX "search_queries_tenant_id_user_id_idx" ON "search_queries"("tenant_id", "user_id");
CREATE INDEX "search_queries_tenant_id_created_at_idx" ON "search_queries"("tenant_id", "created_at");
CREATE INDEX "search_queries_query_idx" ON "search_queries"("query");

-- CreateIndex: Popular Searches
CREATE UNIQUE INDEX "popular_searches_tenant_id_query_key" ON "popular_searches"("tenant_id", "query");
CREATE INDEX "popular_searches_tenant_id_category_idx" ON "popular_searches"("tenant_id", "category");
CREATE INDEX "popular_searches_tenant_id_count_idx" ON "popular_searches"("tenant_id", "count");

-- AddForeignKey
ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "popular_searches" ADD CONSTRAINT "popular_searches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================================================

-- Full-text search for customers (name, email, phone)
CREATE INDEX IF NOT EXISTS idx_customers_fulltext_search ON customers USING gin(
  to_tsvector('english',
    COALESCE(first_name, '') || ' ' ||
    COALESCE(last_name, '') || ' ' ||
    COALESCE(email, '') || ' ' ||
    COALESCE(phone, '') || ' ' ||
    COALESCE(mobile, '')
  )
);

-- Full-text search for vehicles (make, model, vin, stock number)
CREATE INDEX IF NOT EXISTS idx_vehicles_fulltext_search ON vehicles USING gin(
  to_tsvector('english',
    COALESCE(make, '') || ' ' ||
    COALESCE(model, '') || ' ' ||
    COALESCE(trim, '') || ' ' ||
    COALESCE(vin, '') || ' ' ||
    COALESCE(stock_number, '')
  )
);

-- Full-text search for leads
CREATE INDEX IF NOT EXISTS idx_leads_fulltext_search ON leads USING gin(
  to_tsvector('english',
    COALESCE(first_name, '') || ' ' ||
    COALESCE(last_name, '') || ' ' ||
    COALESCE(email, '') || ' ' ||
    COALESCE(phone, '')
  )
);

-- ============================================================================
-- PERFORMANCE INDEXES FOR COMMON SEARCH FILTERS
-- ============================================================================

-- Customers: Credit score filtering
CREATE INDEX IF NOT EXISTS idx_customers_credit_score ON customers(tenant_id, credit_score) WHERE credit_score IS NOT NULL;

-- Vehicles: Days in stock filtering
CREATE INDEX IF NOT EXISTS idx_vehicles_created_date ON vehicles(tenant_id, created_at DESC) WHERE status = 'available';

-- Vehicles: Status filtering
CREATE INDEX IF NOT EXISTS idx_vehicles_status_tenant ON vehicles(tenant_id, status, created_at DESC);

-- Deals: Age filtering
CREATE INDEX IF NOT EXISTS idx_deals_created_date ON deals(tenant_id, created_at DESC);

-- Deals: Status and stage filtering
CREATE INDEX IF NOT EXISTS idx_deals_stage_status ON deals(tenant_id, stage, status, created_at DESC);

-- Appraisals: Value variance filtering
CREATE INDEX IF NOT EXISTS idx_appraisals_values ON appraisals(tenant_id, estimated_value, payoff_amount)
  WHERE status = 'completed';

-- Leads: Status and score filtering
CREATE INDEX IF NOT EXISTS idx_leads_status_score ON leads(tenant_id, status, lead_score DESC, created_at DESC);

-- ============================================================================
-- SEARCH HELPER FUNCTIONS
-- ============================================================================

-- Function: Calculate days between dates
CREATE OR REPLACE FUNCTION days_since(d TIMESTAMPTZ) RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(DAY FROM (NOW() - d))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate age of record in days
CREATE OR REPLACE FUNCTION record_age_days(created TIMESTAMPTZ) RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(DAY FROM (NOW() - created))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- SEARCH ANALYTICS VIEWS (Optional - for reporting)
-- ============================================================================

-- View: Top searches by tenant
CREATE OR REPLACE VIEW v_top_searches_by_tenant AS
SELECT
  sq.tenant_id,
  sq.query,
  COUNT(*) as search_count,
  AVG(sq.result_count) as avg_results,
  AVG(sq.execution_time) as avg_execution_time,
  MAX(sq.created_at) as last_searched
FROM search_queries sq
WHERE sq.created_at >= NOW() - INTERVAL '30 days'
GROUP BY sq.tenant_id, sq.query
ORDER BY search_count DESC;

-- View: Search performance metrics
CREATE OR REPLACE VIEW v_search_performance AS
SELECT
  sq.tenant_id,
  DATE(sq.created_at) as search_date,
  COUNT(*) as total_searches,
  AVG(sq.execution_time) as avg_execution_time,
  MAX(sq.execution_time) as max_execution_time,
  AVG(sq.result_count) as avg_results,
  SUM(CASE WHEN sq.clicked THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as click_through_rate
FROM search_queries sq
GROUP BY sq.tenant_id, DATE(sq.created_at)
ORDER BY search_date DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE search_queries IS 'Tracks all search queries for analytics and learning';
COMMENT ON TABLE popular_searches IS 'Cache of popular searches for autocomplete suggestions';
COMMENT ON COLUMN search_queries.parsed_query IS 'NLP-parsed structure of the query';
COMMENT ON COLUMN search_queries.execution_time IS 'Query execution time in milliseconds';
COMMENT ON COLUMN search_queries.clicked IS 'Whether user clicked on any result';
COMMENT ON COLUMN popular_searches.tenant_id IS 'NULL means global popular search';
