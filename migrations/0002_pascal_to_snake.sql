DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Tenant'
      AND column_name = 'billingEmail'
  ) THEN
    EXECUTE 'ALTER TABLE "Tenant" RENAME COLUMN "billingEmail" TO billing_email';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Tenant'
      AND column_name = 'subscriptionEndsAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Tenant" RENAME COLUMN "subscriptionEndsAt" TO subscription_ends_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Tenant'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Tenant" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Tenant'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Tenant" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Tenant'
  ) THEN
    EXECUTE 'ALTER TABLE "Tenant" RENAME TO tenants';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'firstName'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME COLUMN "firstName" TO first_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'lastName'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME COLUMN "lastName" TO last_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'isSuperAdmin'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME COLUMN "isSuperAdmin" TO is_super_admin';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'lastLoginAt'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME COLUMN "lastLoginAt" TO last_login_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'deletedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME COLUMN "deletedAt" TO deleted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'User'
  ) THEN
    EXECUTE 'ALTER TABLE "User" RENAME TO users';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'firstName'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "firstName" TO first_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'lastName'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "lastName" TO last_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'dateOfBirth'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "dateOfBirth" TO date_of_birth';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'driversLicenseNumber'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "driversLicenseNumber" TO drivers_license_number';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'driversLicenseState'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "driversLicenseState" TO drivers_license_state';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'addressStreet'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "addressStreet" TO address_street';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'addressCity'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "addressCity" TO address_city';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'addressState'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "addressState" TO address_state';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'addressZip'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "addressZip" TO address_zip';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'addressCountry'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "addressCountry" TO address_country';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'preferredContactMethod'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "preferredContactMethod" TO preferred_contact_method';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'leadSource'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "leadSource" TO lead_source';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'leadStatus'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "leadStatus" TO lead_status';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'leadScore'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "leadScore" TO lead_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'creditScore'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "creditScore" TO credit_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'assignedToUserId'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "assignedToUserId" TO assigned_to_user_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'lifetimeValue'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "lifetimeValue" TO lifetime_value';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
      AND column_name = 'deletedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME COLUMN "deletedAt" TO deleted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Customer'
  ) THEN
    EXECUTE 'ALTER TABLE "Customer" RENAME TO customers';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerInteraction'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerInteraction" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerInteraction'
      AND column_name = 'customerId'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerInteraction" RENAME COLUMN "customerId" TO customer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerInteraction'
      AND column_name = 'userId'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerInteraction" RENAME COLUMN "userId" TO user_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerInteraction'
      AND column_name = 'scheduledAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerInteraction" RENAME COLUMN "scheduledAt" TO scheduled_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerInteraction'
      AND column_name = 'completedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerInteraction" RENAME COLUMN "completedAt" TO completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerInteraction'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerInteraction" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerInteraction'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerInteraction" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerInteraction'
      AND column_name = 'deletedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerInteraction" RENAME COLUMN "deletedAt" TO deleted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'CustomerInteraction'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerInteraction" RENAME TO customer_interactions';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'customerId'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "customerId" TO customer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'assignedToId'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "assignedToId" TO assigned_to_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'ownerId'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "ownerId" TO owner_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'firstName'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "firstName" TO first_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'lastName'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "lastName" TO last_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'smsOptOut'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "smsOptOut" TO sms_opt_out';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'emailOptOut'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "emailOptOut" TO email_opt_out';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'callOptOut'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "callOptOut" TO call_opt_out';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'isArchived'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "isArchived" TO is_archived';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'isConverted'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "isConverted" TO is_converted';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'lastActivityAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "lastActivityAt" TO last_activity_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'lastCommunicationAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "lastCommunicationAt" TO last_communication_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'nextActionAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "nextActionAt" TO next_action_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'convertedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "convertedAt" TO converted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME TO leads';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'leadId'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME COLUMN "leadId" TO lead_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'customerId'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME COLUMN "customerId" TO customer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'userId'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME COLUMN "userId" TO user_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'dueAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME COLUMN "dueAt" TO due_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'startedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME COLUMN "startedAt" TO started_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'completedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME COLUMN "completedAt" TO completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
  ) THEN
    EXECUTE 'ALTER TABLE "Activity" RENAME TO activities';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'leadId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "leadId" TO lead_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'customerId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "customerId" TO customer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'assignedToId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "assignedToId" TO assigned_to_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'timeZone'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "timeZone" TO time_zone';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'startAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "startAt" TO start_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'endAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "endAt" TO end_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'checkedInAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "checkedInAt" TO checked_in_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'completedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "completedAt" TO completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'cancelledAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "cancelledAt" TO cancelled_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'noShowAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "noShowAt" TO no_show_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'followUpTaskId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "followUpTaskId" TO follow_up_task_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Appointment'
  ) THEN
    EXECUTE 'ALTER TABLE "Appointment" RENAME TO appointments';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LeadScore'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "LeadScore" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LeadScore'
      AND column_name = 'leadId'
  ) THEN
    EXECUTE 'ALTER TABLE "LeadScore" RENAME COLUMN "leadId" TO lead_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LeadScore'
      AND column_name = 'modelKey'
  ) THEN
    EXECUTE 'ALTER TABLE "LeadScore" RENAME COLUMN "modelKey" TO model_key';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LeadScore'
      AND column_name = 'scoreDelta'
  ) THEN
    EXECUTE 'ALTER TABLE "LeadScore" RENAME COLUMN "scoreDelta" TO score_delta';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LeadScore'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "LeadScore" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'LeadScore'
  ) THEN
    EXECUTE 'ALTER TABLE "LeadScore" RENAME TO lead_scores';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Communication'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Communication" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Communication'
      AND column_name = 'providerId'
  ) THEN
    EXECUTE 'ALTER TABLE "Communication" RENAME COLUMN "providerId" TO provider_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Communication'
      AND column_name = 'leadId'
  ) THEN
    EXECUTE 'ALTER TABLE "Communication" RENAME COLUMN "leadId" TO lead_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Communication'
      AND column_name = 'customerId'
  ) THEN
    EXECUTE 'ALTER TABLE "Communication" RENAME COLUMN "customerId" TO customer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Communication'
      AND column_name = 'activityId'
  ) THEN
    EXECUTE 'ALTER TABLE "Communication" RENAME COLUMN "activityId" TO activity_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Communication'
      AND column_name = 'userId'
  ) THEN
    EXECUTE 'ALTER TABLE "Communication" RENAME COLUMN "userId" TO user_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Communication'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Communication" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Communication'
  ) THEN
    EXECUTE 'ALTER TABLE "Communication" RENAME TO communications';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'EmailTemplate'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "EmailTemplate" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'EmailTemplate'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "EmailTemplate" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'EmailTemplate'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "EmailTemplate" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'EmailTemplate'
  ) THEN
    EXECUTE 'ALTER TABLE "EmailTemplate" RENAME TO email_templates';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'SMSTemplate'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "SMSTemplate" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'SMSTemplate'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "SMSTemplate" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'SMSTemplate'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "SMSTemplate" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'SMSTemplate'
  ) THEN
    EXECUTE 'ALTER TABLE "SMSTemplate" RENAME TO sms_templates';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Automation'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Automation" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Automation'
      AND column_name = 'isActive'
  ) THEN
    EXECUTE 'ALTER TABLE "Automation" RENAME COLUMN "isActive" TO is_active';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Automation'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Automation" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Automation'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Automation" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Automation'
  ) THEN
    EXECUTE 'ALTER TABLE "Automation" RENAME TO automations';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AutomationExecution'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "AutomationExecution" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AutomationExecution'
      AND column_name = 'automationId'
  ) THEN
    EXECUTE 'ALTER TABLE "AutomationExecution" RENAME COLUMN "automationId" TO automation_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AutomationExecution'
      AND column_name = 'triggerType'
  ) THEN
    EXECUTE 'ALTER TABLE "AutomationExecution" RENAME COLUMN "triggerType" TO trigger_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AutomationExecution'
      AND column_name = 'startedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "AutomationExecution" RENAME COLUMN "startedAt" TO started_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AutomationExecution'
      AND column_name = 'completedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "AutomationExecution" RENAME COLUMN "completedAt" TO completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'AutomationExecution'
  ) THEN
    EXECUTE 'ALTER TABLE "AutomationExecution" RENAME TO automation_executions';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerVehicle'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerVehicle" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerVehicle'
      AND column_name = 'customerId'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerVehicle" RENAME COLUMN "customerId" TO customer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerVehicle'
      AND column_name = 'purchaseDate'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerVehicle" RENAME COLUMN "purchaseDate" TO purchase_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerVehicle'
      AND column_name = 'purchasePrice'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerVehicle" RENAME COLUMN "purchasePrice" TO purchase_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerVehicle'
      AND column_name = 'currentMileage'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerVehicle" RENAME COLUMN "currentMileage" TO current_mileage';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerVehicle'
      AND column_name = 'tradedInDate'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerVehicle" RENAME COLUMN "tradedInDate" TO traded_in_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerVehicle'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerVehicle" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CustomerVehicle'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerVehicle" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'CustomerVehicle'
  ) THEN
    EXECUTE 'ALTER TABLE "CustomerVehicle" RENAME TO customer_vehicles';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'stockNumber'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "stockNumber" TO stock_number';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'exteriorColor'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "exteriorColor" TO exterior_color';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'interiorColor'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "interiorColor" TO interior_color';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'engineType'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "engineType" TO engine_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'fuelType'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "fuelType" TO fuel_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'invoiceCost'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "invoiceCost" TO invoice_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'listPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "listPrice" TO list_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'specialPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "specialPrice" TO special_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'dateReceived'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "dateReceived" TO date_received';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'dateSold'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "dateSold" TO date_sold';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'daysInStock'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "daysInStock" TO days_in_stock';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'certificationNumber'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "certificationNumber" TO certification_number';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'floorPlanId'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "floorPlanId" TO floor_plan_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'floorPlanDate'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "floorPlanDate" TO floor_plan_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'floorPlanInterestRate'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "floorPlanInterestRate" TO floor_plan_interest_rate';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'acquisitionType'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "acquisitionType" TO acquisition_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'acquisitionSource'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "acquisitionSource" TO acquisition_source';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'acquisitionDate'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "acquisitionDate" TO acquisition_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'acquisitionCost'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "acquisitionCost" TO acquisition_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'floorPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "floorPrice" TO floor_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'wholesaleValue'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "wholesaleValue" TO wholesale_value';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'marketValue'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "marketValue" TO market_value';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'targetPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "targetPrice" TO target_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'aiPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "aiPrice" TO ai_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'pricingNotes'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "pricingNotes" TO pricing_notes';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'appraisalStatus'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "appraisalStatus" TO appraisal_status';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'lastAppraisedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "lastAppraisedAt" TO last_appraised_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'reconEstimate'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "reconEstimate" TO recon_estimate';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'reconActual'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "reconActual" TO recon_actual';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'reconCompletedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "reconCompletedAt" TO recon_completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'agingBucket'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "agingBucket" TO aging_bucket';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'nextPriceReviewDate'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "nextPriceReviewDate" TO next_price_review_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
      AND column_name = 'deletedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME COLUMN "deletedAt" TO deleted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicle" RENAME TO vehicles';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleHistory'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleHistory" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleHistory'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleHistory" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleHistory'
      AND column_name = 'documentUrl'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleHistory" RENAME COLUMN "documentUrl" TO document_url';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleHistory'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleHistory" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleHistory'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleHistory" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'VehicleHistory'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleHistory" RENAME TO vehicle_histories';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'appraiserId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "appraiserId" TO appraiser_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'managerId'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "managerId" TO manager_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'exteriorColor'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "exteriorColor" TO exterior_color';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'interiorColor'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "interiorColor" TO interior_color';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'conditionGrade'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "conditionGrade" TO condition_grade';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'conditionScore'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "conditionScore" TO condition_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'conditionNotes'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "conditionNotes" TO condition_notes';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'warningLights'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "warningLights" TO warning_lights';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'estimatedValue'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "estimatedValue" TO estimated_value';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'marketValue'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "marketValue" TO market_value';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'aiSuggestedValue'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "aiSuggestedValue" TO ai_suggested_value';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'reconEstimate'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "reconEstimate" TO recon_estimate';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'submittedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "submittedAt" TO submitted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'approvedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "approvedAt" TO approved_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'rejectedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "rejectedAt" TO rejected_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'expiresAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "expiresAt" TO expires_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Appraisal'
  ) THEN
    EXECUTE 'ALTER TABLE "Appraisal" RENAME TO appraisals';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'appraisalId'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "appraisalId" TO appraisal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'estimatedCost'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "estimatedCost" TO estimated_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'actualCost'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "actualCost" TO actual_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'startedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "startedAt" TO started_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'completedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "completedAt" TO completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'beforePhotos'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "beforePhotos" TO before_photos';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'afterPhotos'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "afterPhotos" TO after_photos';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'ReconItem'
  ) THEN
    EXECUTE 'ALTER TABLE "ReconItem" RENAME TO recon_items';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PriceHistory'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "PriceHistory" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PriceHistory'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "PriceHistory" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PriceHistory'
      AND column_name = 'changedById'
  ) THEN
    EXECUTE 'ALTER TABLE "PriceHistory" RENAME COLUMN "changedById" TO changed_by_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PriceHistory'
      AND column_name = 'changeType'
  ) THEN
    EXECUTE 'ALTER TABLE "PriceHistory" RENAME COLUMN "changeType" TO change_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PriceHistory'
      AND column_name = 'oldPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "PriceHistory" RENAME COLUMN "oldPrice" TO old_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PriceHistory'
      AND column_name = 'newPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "PriceHistory" RENAME COLUMN "newPrice" TO new_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PriceHistory'
      AND column_name = 'sourceReference'
  ) THEN
    EXECUTE 'ALTER TABLE "PriceHistory" RENAME COLUMN "sourceReference" TO source_reference';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PriceHistory'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "PriceHistory" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'PriceHistory'
  ) THEN
    EXECUTE 'ALTER TABLE "PriceHistory" RENAME TO price_histories';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'auctionName'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "auctionName" TO auction_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'auctionDate'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "auctionDate" TO auction_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'runNumber'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "runNumber" TO run_number';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'hammerPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "hammerPrice" TO hammer_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'buyerFees'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "buyerFees" TO buyer_fees';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'transportCost'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "transportCost" TO transport_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'reconditioningCost'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "reconditioningCost" TO reconditioning_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'totalCost'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "totalCost" TO total_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'conditionGrade'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "conditionGrade" TO condition_grade';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'inspectorNotes'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "inspectorNotes" TO inspector_notes';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'AuctionPurchase'
  ) THEN
    EXECUTE 'ALTER TABLE "AuctionPurchase" RENAME TO auction_purchases';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'askingPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "askingPrice" TO asking_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'reservePrice'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "reservePrice" TO reserve_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'minimumAcceptable'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "minimumAcceptable" TO minimum_acceptable';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'publishedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "publishedAt" TO published_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'expiresAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "expiresAt" TO expires_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'soldAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "soldAt" TO sold_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'buyerName'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "buyerName" TO buyer_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'buyerContact'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "buyerContact" TO buyer_contact';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'WholesaleListing'
  ) THEN
    EXECUTE 'ALTER TABLE "WholesaleListing" RENAME TO wholesale_listings';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MarketComp'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "MarketComp" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MarketComp'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "MarketComp" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MarketComp'
      AND column_name = 'compVin'
  ) THEN
    EXECUTE 'ALTER TABLE "MarketComp" RENAME COLUMN "compVin" TO comp_vin';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MarketComp'
      AND column_name = 'listedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "MarketComp" RENAME COLUMN "listedAt" TO listed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MarketComp'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "MarketComp" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MarketComp'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "MarketComp" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'MarketComp'
  ) THEN
    EXECUTE 'ALTER TABLE "MarketComp" RENAME TO market_comps';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'dealNumber'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "dealNumber" TO deal_number';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'customerId'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "customerId" TO customer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'salesPersonId'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "salesPersonId" TO sales_person_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'financeManagerId'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "financeManagerId" TO finance_manager_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'dealType'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "dealType" TO deal_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'vehiclePrice'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "vehiclePrice" TO vehicle_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'netVehiclePrice'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "netVehiclePrice" TO net_vehicle_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'tradeVehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "tradeVehicleId" TO trade_vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'tradeAllowance'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "tradeAllowance" TO trade_allowance';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'tradePayoff'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "tradePayoff" TO trade_payoff';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'tradeEquity'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "tradeEquity" TO trade_equity';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'downPayment'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "downPayment" TO down_payment';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'amountFinanced'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "amountFinanced" TO amount_financed';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'monthlyPayment'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "monthlyPayment" TO monthly_payment';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'lenderName'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "lenderName" TO lender_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'lenderRate'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "lenderRate" TO lender_rate';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'dealerReserve'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "dealerReserve" TO dealer_reserve';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'docFee'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "docFee" TO doc_fee';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'registrationFee'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "registrationFee" TO registration_fee';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'salesTax'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "salesTax" TO sales_tax';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'otherFees'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "otherFees" TO other_fees';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'warrantyProduct'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "warrantyProduct" TO warranty_product';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'warrantyCost'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "warrantyCost" TO warranty_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'gapInsurance'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "gapInsurance" TO gap_insurance';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'gapCost'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "gapCost" TO gap_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'maintenancePlan'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "maintenancePlan" TO maintenance_plan';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'maintenanceCost'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "maintenanceCost" TO maintenance_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'otherProducts'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "otherProducts" TO other_products';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'frontEndGross'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "frontEndGross" TO front_end_gross';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'backEndGross'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "backEndGross" TO back_end_gross';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'totalGross'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "totalGross" TO total_gross';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'packAmount'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "packAmount" TO pack_amount';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'dealDate'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "dealDate" TO deal_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'fundedDate'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "fundedDate" TO funded_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'deliveryDate'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "deliveryDate" TO delivery_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
      AND column_name = 'deletedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME COLUMN "deletedAt" TO deleted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Deal'
  ) THEN
    EXECUTE 'ALTER TABLE "Deal" RENAME TO deals';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'customerId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "customerId" TO customer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'salespersonId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "salespersonId" TO salesperson_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'amountFinanced'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "amountFinanced" TO amount_financed';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'aiScore'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "aiScore" TO ai_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'versionPointerId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "versionPointerId" TO version_pointer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'printablePdfUrl'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "printablePdfUrl" TO printable_pdf_url';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'DealWorksheet'
  ) THEN
    EXECUTE 'ALTER TABLE "DealWorksheet" RENAME TO deal_worksheets';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
      AND column_name = 'worksheetId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME COLUMN "worksheetId" TO worksheet_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
      AND column_name = 'grossBreakdown'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME COLUMN "grossBreakdown" TO gross_breakdown';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
      AND column_name = 'closeProbability'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME COLUMN "closeProbability" TO close_probability';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
      AND column_name = 'approvalProbability'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME COLUMN "approvalProbability" TO approval_probability';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
      AND column_name = 'aiScore'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME COLUMN "aiScore" TO ai_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
      AND column_name = 'createdById'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME COLUMN "createdById" TO created_by_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'DealVersion'
  ) THEN
    EXECUTE 'ALTER TABLE "DealVersion" RENAME TO deal_versions';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditSubmissionDraft'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditSubmissionDraft" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditSubmissionDraft'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditSubmissionDraft" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditSubmissionDraft'
      AND column_name = 'worksheetId'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditSubmissionDraft" RENAME COLUMN "worksheetId" TO worksheet_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditSubmissionDraft'
      AND column_name = 'versionId'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditSubmissionDraft" RENAME COLUMN "versionId" TO version_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditSubmissionDraft'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditSubmissionDraft" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditSubmissionDraft'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditSubmissionDraft" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'CreditSubmissionDraft'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditSubmissionDraft" RENAME TO credit_submission_drafts';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'worksheetId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "worksheetId" TO worksheet_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'versionId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "versionId" TO version_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'recommendedStructure'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "recommendedStructure" TO recommended_structure';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'projectedGross'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "projectedGross" TO projected_gross';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'runById'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "runById" TO run_by_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'mlTraceId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "mlTraceId" TO ml_trace_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'DealOptimization'
  ) THEN
    EXECUTE 'ALTER TABLE "DealOptimization" RENAME TO deal_optimizations';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'worksheetId'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "worksheetId" TO worksheet_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'originalVersionId'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "originalVersionId" TO original_version_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'aiResponse'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "aiResponse" TO ai_response';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'selectedOption'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "selectedOption" TO selected_option';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'scriptUsed'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "scriptUsed" TO script_used';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'handledById'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "handledById" TO handled_by_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'CounterOffer'
  ) THEN
    EXECUTE 'ALTER TABLE "CounterOffer" RENAME TO counter_offers';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'worksheetId'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "worksheetId" TO worksheet_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'versionId'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "versionId" TO version_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'lenderId'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "lenderId" TO lender_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'lenderName'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "lenderName" TO lender_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'approvalProbability'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "approvalProbability" TO approval_probability';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'recommendedTier'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "recommendedTier" TO recommended_tier';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'estimatedRate'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "estimatedRate" TO estimated_rate';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'estimatedReserve'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "estimatedReserve" TO estimated_reserve';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'ApprovalPrediction'
  ) THEN
    EXECUTE 'ALTER TABLE "ApprovalPrediction" RENAME TO approval_predictions';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'dealNumber'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "dealNumber" TO deal_number';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'customerId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "customerId" TO customer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'salespersonId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "salespersonId" TO salesperson_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'fiManagerId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "fiManagerId" TO fi_manager_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'sellingPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "sellingPrice" TO selling_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'tradeValue'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "tradeValue" TO trade_value';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'tradePayoff'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "tradePayoff" TO trade_payoff';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'netTrade'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "netTrade" TO net_trade';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'cashDown'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "cashDown" TO cash_down';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'amountFinanced'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "amountFinanced" TO amount_financed';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'lenderId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "lenderId" TO lender_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'monthlyPayment'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "monthlyPayment" TO monthly_payment';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'fiProducts'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "fiProducts" TO fi_products';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'totalFiGross'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "totalFiGross" TO total_fi_gross';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'dealDate'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "dealDate" TO deal_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'contractDate'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "contractDate" TO contract_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'fundedDate'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "fundedDate" TO funded_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'deliveredDate'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "deliveredDate" TO delivered_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'DealJacket'
  ) THEN
    EXECUTE 'ALTER TABLE "DealJacket" RENAME TO deal_jackets';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'templateId'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "templateId" TO template_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'pdfUrl'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "pdfUrl" TO pdf_url';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'docusignEnvelopeId'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "docusignEnvelopeId" TO docusign_envelope_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'sentAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "sentAt" TO sent_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'viewedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "viewedAt" TO viewed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'signedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "signedAt" TO signed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'completedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "completedAt" TO completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'contractData'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "contractData" TO contract_data';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'generatedBy'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "generatedBy" TO generated_by';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME TO contracts';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Signature'
      AND column_name = 'contractId'
  ) THEN
    EXECUTE 'ALTER TABLE "Signature" RENAME COLUMN "contractId" TO contract_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Signature'
      AND column_name = 'signerName'
  ) THEN
    EXECUTE 'ALTER TABLE "Signature" RENAME COLUMN "signerName" TO signer_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Signature'
      AND column_name = 'signerEmail'
  ) THEN
    EXECUTE 'ALTER TABLE "Signature" RENAME COLUMN "signerEmail" TO signer_email';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Signature'
      AND column_name = 'signerRole'
  ) THEN
    EXECUTE 'ALTER TABLE "Signature" RENAME COLUMN "signerRole" TO signer_role';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Signature'
      AND column_name = 'ipAddress'
  ) THEN
    EXECUTE 'ALTER TABLE "Signature" RENAME COLUMN "ipAddress" TO ip_address';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Signature'
      AND column_name = 'signatureData'
  ) THEN
    EXECUTE 'ALTER TABLE "Signature" RENAME COLUMN "signatureData" TO signature_data';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Signature'
      AND column_name = 'signedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Signature" RENAME COLUMN "signedAt" TO signed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Signature'
  ) THEN
    EXECUTE 'ALTER TABLE "Signature" RENAME TO signatures';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
      AND column_name = 'coverageDetails'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME COLUMN "coverageDetails" TO coverage_details';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
      AND column_name = 'retailPrice'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME COLUMN "retailPrice" TO retail_price';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
      AND column_name = 'termType'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME COLUMN "termType" TO term_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
      AND column_name = 'minVehicleAge'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME COLUMN "minVehicleAge" TO min_vehicle_age';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
      AND column_name = 'maxVehicleAge'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME COLUMN "maxVehicleAge" TO max_vehicle_age';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
      AND column_name = 'minMileage'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME COLUMN "minMileage" TO min_mileage';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
      AND column_name = 'maxMileage'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME COLUMN "maxMileage" TO max_mileage';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
      AND column_name = 'isActive'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME COLUMN "isActive" TO is_active';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'FIProduct'
  ) THEN
    EXECUTE 'ALTER TABLE "FIProduct" RENAME TO fi_products';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'selectedOption'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "selectedOption" TO selected_option';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'selectedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "selectedAt" TO selected_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'selectedProducts'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "selectedProducts" TO selected_products';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'totalProductCost'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "totalProductCost" TO total_product_cost';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'totalMarkup'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "totalMarkup" TO total_markup';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'paymentImpact'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "paymentImpact" TO payment_impact';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'createdBy'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "createdBy" TO created_by';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'MenuConfiguration'
  ) THEN
    EXECUTE 'ALTER TABLE "MenuConfiguration" RENAME TO menu_configurations';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealDocument'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "DealDocument" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealDocument'
      AND column_name = 'fileName'
  ) THEN
    EXECUTE 'ALTER TABLE "DealDocument" RENAME COLUMN "fileName" TO file_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealDocument'
      AND column_name = 'fileUrl'
  ) THEN
    EXECUTE 'ALTER TABLE "DealDocument" RENAME COLUMN "fileUrl" TO file_url';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealDocument'
      AND column_name = 'mimeType'
  ) THEN
    EXECUTE 'ALTER TABLE "DealDocument" RENAME COLUMN "mimeType" TO mime_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealDocument'
      AND column_name = 'fileSize'
  ) THEN
    EXECUTE 'ALTER TABLE "DealDocument" RENAME COLUMN "fileSize" TO file_size';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealDocument'
      AND column_name = 'uploadedBy'
  ) THEN
    EXECUTE 'ALTER TABLE "DealDocument" RENAME COLUMN "uploadedBy" TO uploaded_by';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'DealDocument'
      AND column_name = 'uploadedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "DealDocument" RENAME COLUMN "uploadedAt" TO uploaded_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'DealDocument'
  ) THEN
    EXECUTE 'ALTER TABLE "DealDocument" RENAME TO deal_documents';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'federalItems'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "federalItems" TO federal_items';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'stateItems'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "stateItems" TO state_items';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'lenderItems'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "lenderItems" TO lender_items';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'internalItems'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "internalItems" TO internal_items';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'completedItems'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "completedItems" TO completed_items';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'totalItems'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "totalItems" TO total_items';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'percentComplete'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "percentComplete" TO percent_complete';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'isComplete'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "isComplete" TO is_complete';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'completedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "completedAt" TO completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'ComplianceChecklist'
  ) THEN
    EXECUTE 'ALTER TABLE "ComplianceChecklist" RENAME TO compliance_checklists';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'firstName'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "firstName" TO first_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'middleName'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "middleName" TO middle_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'lastName'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "lastName" TO last_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'dateOfBirth'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "dateOfBirth" TO date_of_birth';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'currentStreet'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "currentStreet" TO current_street';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'currentCity'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "currentCity" TO current_city';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'currentState'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "currentState" TO current_state';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'currentZip'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "currentZip" TO current_zip';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'yearsAtAddress'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "yearsAtAddress" TO years_at_address';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'monthsAtAddress'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "monthsAtAddress" TO months_at_address';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'residenceType'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "residenceType" TO residence_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'monthlyPayment'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "monthlyPayment" TO monthly_payment';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'previousStreet'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "previousStreet" TO previous_street';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'previousCity'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "previousCity" TO previous_city';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'previousState'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "previousState" TO previous_state';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'previousZip'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "previousZip" TO previous_zip';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'jobTitle'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "jobTitle" TO job_title';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'yearsEmployed'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "yearsEmployed" TO years_employed';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'monthsEmployed'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "monthsEmployed" TO months_employed';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'monthlyIncome'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "monthlyIncome" TO monthly_income';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'employerPhone'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "employerPhone" TO employer_phone';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'otherIncomeSource'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "otherIncomeSource" TO other_income_source';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'otherIncomeAmount'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "otherIncomeAmount" TO other_income_amount';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'coApplicant'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "coApplicant" TO co_applicant';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'authorizeCredit'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "authorizeCredit" TO authorize_credit';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'certifyAccuracy'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "certifyAccuracy" TO certify_accuracy';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'privacyConsent'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "privacyConsent" TO privacy_consent';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'signedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "signedAt" TO signed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'CreditApplication'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditApplication" RENAME TO credit_applications';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'creditApplicationId'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "creditApplicationId" TO credit_application_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'pullType'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "pullType" TO pull_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'experianScore'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "experianScore" TO experian_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'transUnionScore'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "transUnionScore" TO trans_union_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'equifaxScore'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "equifaxScore" TO equifax_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'mergedScore'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "mergedScore" TO merged_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'scoreRange'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "scoreRange" TO score_range';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'totalAccounts'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "totalAccounts" TO total_accounts';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'openAccounts'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "openAccounts" TO open_accounts';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'totalRevolvingCredit'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "totalRevolvingCredit" TO total_revolving_credit';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'totalRevolvingBalance'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "totalRevolvingBalance" TO total_revolving_balance';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'utilizationPercent'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "utilizationPercent" TO utilization_percent';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'totalInstallmentDebt'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "totalInstallmentDebt" TO total_installment_debt';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'monthlyDebtObligations'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "monthlyDebtObligations" TO monthly_debt_obligations';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'onTimePaymentPercent'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "onTimePaymentPercent" TO on_time_payment_percent';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'late30Days'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "late30Days" TO late30_days';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'late60Days'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "late60Days" TO late60_days';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'late90PlusDays'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "late90PlusDays" TO late90_plus_days';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'chargeOffs'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "chargeOffs" TO charge_offs';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'hardInquiries'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "hardInquiries" TO hard_inquiries';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'softInquiries'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "softInquiries" TO soft_inquiries';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'tradeLines'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "tradeLines" TO trade_lines';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'rawResponse'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "rawResponse" TO raw_response';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'pdfUrl'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "pdfUrl" TO pdf_url';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'pulledBy'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "pulledBy" TO pulled_by';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
      AND column_name = 'pulledAt'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME COLUMN "pulledAt" TO pulled_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'CreditReport'
  ) THEN
    EXECUTE 'ALTER TABLE "CreditReport" RENAME TO credit_reports';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'apiProvider'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "apiProvider" TO api_provider';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'apiCredentials'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "apiCredentials" TO api_credentials';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'isActive'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "isActive" TO is_active';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'tierRange'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "tierRange" TO tier_range';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'maxTerm'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "maxTerm" TO max_term';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'maxLtv'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "maxLtv" TO max_ltv';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'minCreditScore'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "minCreditScore" TO min_credit_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'maxCreditScore'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "maxCreditScore" TO max_credit_score';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
      AND column_name = 'applicationFee'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME COLUMN "applicationFee" TO application_fee';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Lender'
  ) THEN
    EXECUTE 'ALTER TABLE "Lender" RENAME TO lenders';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'lenderId'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "lenderId" TO lender_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'submittedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "submittedAt" TO submitted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'submittedBy'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "submittedBy" TO submitted_by';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'requestPayload'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "requestPayload" TO request_payload';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'respondedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "respondedAt" TO responded_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'responsePayload'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "responsePayload" TO response_payload';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'amountApproved'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "amountApproved" TO amount_approved';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'buyRate'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "buyRate" TO buy_rate';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'dealerReserve'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "dealerReserve" TO dealer_reserve';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'maxReserve'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "maxReserve" TO max_reserve';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'monthlyPayment'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "monthlyPayment" TO monthly_payment';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'declineReason'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "declineReason" TO decline_reason';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'declineCode'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "declineCode" TO decline_code';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'isSelected'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "isSelected" TO is_selected';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'selectedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "selectedAt" TO selected_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
      AND column_name = 'expiresAt'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME COLUMN "expiresAt" TO expires_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'LenderSubmission'
  ) THEN
    EXECUTE 'ALTER TABLE "LenderSubmission" RENAME TO lender_submissions';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingChecklist'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingChecklist" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingChecklist'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingChecklist" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingChecklist'
      AND column_name = 'completedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingChecklist" RENAME COLUMN "completedAt" TO completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingChecklist'
      AND column_name = 'reviewerId'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingChecklist" RENAME COLUMN "reviewerId" TO reviewer_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingChecklist'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingChecklist" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingChecklist'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingChecklist" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'FundingChecklist'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingChecklist" RENAME TO funding_checklists';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'lenderId'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "lenderId" TO lender_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'amountRequested'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "amountRequested" TO amount_requested';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'fundingMethod'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "fundingMethod" TO funding_method';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'bankAccountId'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "bankAccountId" TO bank_account_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'submittedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "submittedAt" TO submitted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'reviewedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "reviewedAt" TO reviewed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'approvedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "approvedAt" TO approved_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'fundedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "fundedAt" TO funded_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'fundedAmount'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "fundedAmount" TO funded_amount';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'lenderRefNumber'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "lenderRefNumber" TO lender_ref_number';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'journalEntryId'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "journalEntryId" TO journal_entry_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'createdBy'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "createdBy" TO created_by';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'FundingRequest'
  ) THEN
    EXECUTE 'ALTER TABLE "FundingRequest" RENAME TO funding_requests';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
      AND column_name = 'accountNumber'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME COLUMN "accountNumber" TO account_number';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
      AND column_name = 'accountName'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME COLUMN "accountName" TO account_name';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
      AND column_name = 'accountType'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME COLUMN "accountType" TO account_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
      AND column_name = 'normalBalance'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME COLUMN "normalBalance" TO normal_balance';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
      AND column_name = 'parentAccountId'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME COLUMN "parentAccountId" TO parent_account_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
      AND column_name = 'isActive'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME COLUMN "isActive" TO is_active';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'GLAccount'
  ) THEN
    EXECUTE 'ALTER TABLE "GLAccount" RENAME TO gl_accounts';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntry'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntry" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntry'
      AND column_name = 'entryNumber'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntry" RENAME COLUMN "entryNumber" TO entry_number';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntry'
      AND column_name = 'postingDate'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntry" RENAME COLUMN "postingDate" TO posting_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntry'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntry" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntry'
      AND column_name = 'postedById'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntry" RENAME COLUMN "postedById" TO posted_by_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntry'
      AND column_name = 'postedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntry" RENAME COLUMN "postedAt" TO posted_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntry'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntry" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntry'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntry" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntry'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntry" RENAME TO journal_entries';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntryLine'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntryLine" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntryLine'
      AND column_name = 'journalEntryId'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntryLine" RENAME COLUMN "journalEntryId" TO journal_entry_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntryLine'
      AND column_name = 'glAccountId'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntryLine" RENAME COLUMN "glAccountId" TO gl_account_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntryLine'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntryLine" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntryLine'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntryLine" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'JournalEntryLine'
  ) THEN
    EXECUTE 'ALTER TABLE "JournalEntryLine" RENAME TO journal_entry_lines';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Commission'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Commission" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Commission'
      AND column_name = 'dealId'
  ) THEN
    EXECUTE 'ALTER TABLE "Commission" RENAME COLUMN "dealId" TO deal_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Commission'
      AND column_name = 'userId'
  ) THEN
    EXECUTE 'ALTER TABLE "Commission" RENAME COLUMN "userId" TO user_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Commission'
      AND column_name = 'commissionType'
  ) THEN
    EXECUTE 'ALTER TABLE "Commission" RENAME COLUMN "commissionType" TO commission_type';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Commission'
      AND column_name = 'paidDate'
  ) THEN
    EXECUTE 'ALTER TABLE "Commission" RENAME COLUMN "paidDate" TO paid_date';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Commission'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Commission" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Commission'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Commission" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Commission'
  ) THEN
    EXECUTE 'ALTER TABLE "Commission" RENAME TO commissions';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Report'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Report" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Report'
      AND column_name = 'lastRunAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Report" RENAME COLUMN "lastRunAt" TO last_run_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Report'
      AND column_name = 'createdById'
  ) THEN
    EXECUTE 'ALTER TABLE "Report" RENAME COLUMN "createdById" TO created_by_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Report'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Report" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Report'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Report" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Report'
  ) THEN
    EXECUTE 'ALTER TABLE "Report" RENAME TO reports';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Notification'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Notification" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Notification'
      AND column_name = 'userId'
  ) THEN
    EXECUTE 'ALTER TABLE "Notification" RENAME COLUMN "userId" TO user_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Notification'
      AND column_name = 'actionUrl'
  ) THEN
    EXECUTE 'ALTER TABLE "Notification" RENAME COLUMN "actionUrl" TO action_url';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Notification'
      AND column_name = 'isRead'
  ) THEN
    EXECUTE 'ALTER TABLE "Notification" RENAME COLUMN "isRead" TO is_read';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Notification'
      AND column_name = 'readAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Notification" RENAME COLUMN "readAt" TO read_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Notification'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Notification" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Notification'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "Notification" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Notification'
  ) THEN
    EXECUTE 'ALTER TABLE "Notification" RENAME TO notifications';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowDefinition'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowDefinition" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowDefinition'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowDefinition" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowDefinition'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowDefinition" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowDefinition'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowDefinition" RENAME TO workflow_definitions';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowStage'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowStage" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowStage'
      AND column_name = 'definitionId'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowStage" RENAME COLUMN "definitionId" TO definition_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowStage'
      AND column_name = 'slaHours'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowStage" RENAME COLUMN "slaHours" TO sla_hours';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowStage'
      AND column_name = 'wipLimit'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowStage" RENAME COLUMN "wipLimit" TO wip_limit';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowStage'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowStage" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowStage'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowStage" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowStage'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowStage" RENAME TO workflow_stages';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleWorkflow'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleWorkflow" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleWorkflow'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleWorkflow" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleWorkflow'
      AND column_name = 'definitionId'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleWorkflow" RENAME COLUMN "definitionId" TO definition_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleWorkflow'
      AND column_name = 'currentStageId'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleWorkflow" RENAME COLUMN "currentStageId" TO current_stage_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleWorkflow'
      AND column_name = 'startedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleWorkflow" RENAME COLUMN "startedAt" TO started_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleWorkflow'
      AND column_name = 'completedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleWorkflow" RENAME COLUMN "completedAt" TO completed_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'VehicleWorkflow'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleWorkflow" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'VehicleWorkflow'
  ) THEN
    EXECUTE 'ALTER TABLE "VehicleWorkflow" RENAME TO vehicle_workflows';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'StageTransition'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "StageTransition" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'StageTransition'
      AND column_name = 'workflowId'
  ) THEN
    EXECUTE 'ALTER TABLE "StageTransition" RENAME COLUMN "workflowId" TO workflow_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'StageTransition'
      AND column_name = 'fromStageId'
  ) THEN
    EXECUTE 'ALTER TABLE "StageTransition" RENAME COLUMN "fromStageId" TO from_stage_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'StageTransition'
      AND column_name = 'toStageId'
  ) THEN
    EXECUTE 'ALTER TABLE "StageTransition" RENAME COLUMN "toStageId" TO to_stage_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'StageTransition'
      AND column_name = 'byUserId'
  ) THEN
    EXECUTE 'ALTER TABLE "StageTransition" RENAME COLUMN "byUserId" TO by_user_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'StageTransition'
  ) THEN
    EXECUTE 'ALTER TABLE "StageTransition" RENAME TO stage_transitions';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
      AND column_name = 'workflowId'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME COLUMN "workflowId" TO workflow_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
      AND column_name = 'stageId'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME COLUMN "stageId" TO stage_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
      AND column_name = 'dueAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME COLUMN "dueAt" TO due_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
      AND column_name = 'assigneeId'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME COLUMN "assigneeId" TO assignee_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
      AND column_name = 'costCents'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME COLUMN "costCents" TO cost_cents';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowTask'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowTask" RENAME TO workflow_tasks';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'workflowId'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "workflowId" TO workflow_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'stageId'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "stageId" TO stage_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'vehicleId'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "vehicleId" TO vehicle_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'pickupAddress'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "pickupAddress" TO pickup_address';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'dropoffAddress'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "dropoffAddress" TO dropoff_address';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'scheduledAt'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "scheduledAt" TO scheduled_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'costCents'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "costCents" TO cost_cents';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'TransportOrder'
  ) THEN
    EXECUTE 'ALTER TABLE "TransportOrder" RENAME TO transport_orders';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'definitionId'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "definitionId" TO definition_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'stageKey'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "stageKey" TO stage_key';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'bucketStart'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "bucketStart" TO bucket_start';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'avgTimeInStageMinutes'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "avgTimeInStageMinutes" TO avg_time_in_stage_minutes';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'completedCount'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "completedCount" TO completed_count';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'slaHitRate'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "slaHitRate" TO sla_hit_rate';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'wipMax'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "wipMax" TO wip_max';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'PipelineAggregate'
  ) THEN
    EXECUTE 'ALTER TABLE "PipelineAggregate" RENAME TO pipeline_aggregates';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuditLog'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "AuditLog" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuditLog'
      AND column_name = 'userId'
  ) THEN
    EXECUTE 'ALTER TABLE "AuditLog" RENAME COLUMN "userId" TO user_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuditLog'
      AND column_name = 'ipAddress'
  ) THEN
    EXECUTE 'ALTER TABLE "AuditLog" RENAME COLUMN "ipAddress" TO ip_address';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuditLog'
      AND column_name = 'userAgent'
  ) THEN
    EXECUTE 'ALTER TABLE "AuditLog" RENAME COLUMN "userAgent" TO user_agent';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuditLog'
      AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "AuditLog" RENAME COLUMN "createdAt" TO created_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'AuditLog'
  ) THEN
    EXECUTE 'ALTER TABLE "AuditLog" RENAME TO audit_logs';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'SystemSetting'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "SystemSetting" RENAME COLUMN "tenantId" TO tenant_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'SystemSetting'
      AND column_name = 'updatedById'
  ) THEN
    EXECUTE 'ALTER TABLE "SystemSetting" RENAME COLUMN "updatedById" TO updated_by_id';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'SystemSetting'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "SystemSetting" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'SystemSetting'
  ) THEN
    EXECUTE 'ALTER TABLE "SystemSetting" RENAME TO system_settings';
  END IF;
END $$;