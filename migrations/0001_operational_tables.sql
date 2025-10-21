-- Create backups table for tracking pg_dump artifacts
CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    backup_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups (created_at DESC);

-- Daily operational reports for analytics exports
CREATE TABLE IF NOT EXISTS daily_reports (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    report_date DATE NOT NULL,
    revenue NUMERIC(18,2) DEFAULT 0,
    expenses NUMERIC(18,2) DEFAULT 0,
    profit NUMERIC(18,2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_tenant_date ON daily_reports (tenant_id, report_date DESC);
