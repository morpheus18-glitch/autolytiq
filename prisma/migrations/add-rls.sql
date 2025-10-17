-- Row Level Security configuration for tenant isolation
-- Ensure the application sets `SET app.current_tenant = '<tenant-id>';` per request

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_settings WHERE name = 'app.current_tenant') THEN
    PERFORM set_config('app.current_tenant', '', false);
  END IF;
END
$$;

-- Helper policy creation function
CREATE OR REPLACE FUNCTION ensure_tenant_policy(table_name TEXT) RETURNS VOID AS $$
DECLARE
  policy_name TEXT := table_name || '_tenant_isolation';
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
  EXECUTE format('CREATE POLICY %I ON %I USING ("tenantId" = current_setting(''app.current_tenant'')::text) WITH CHECK ("tenantId" = current_setting(''app.current_tenant'')::text)', policy_name, table_name);
END;
$$ LANGUAGE plpgsql;

SELECT ensure_tenant_policy('User');
SELECT ensure_tenant_policy('Customer');
SELECT ensure_tenant_policy('CustomerInteraction');
SELECT ensure_tenant_policy('CustomerVehicle');
SELECT ensure_tenant_policy('Vehicle');
SELECT ensure_tenant_policy('VehicleHistory');
SELECT ensure_tenant_policy('Deal');
SELECT ensure_tenant_policy('DealDocument');
SELECT ensure_tenant_policy('GLAccount');
SELECT ensure_tenant_policy('JournalEntry');
SELECT ensure_tenant_policy('JournalEntryLine');
SELECT ensure_tenant_policy('Commission');
SELECT ensure_tenant_policy('Report');
SELECT ensure_tenant_policy('Notification');
SELECT ensure_tenant_policy('AuditLog');
SELECT ensure_tenant_policy('SystemSetting');

DROP FUNCTION ensure_tenant_policy(TEXT);
