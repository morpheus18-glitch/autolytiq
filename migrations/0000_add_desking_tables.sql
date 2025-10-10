CREATE TABLE "accounting_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"deal_id" text NOT NULL,
	"account_code" text NOT NULL,
	"account_name" text NOT NULL,
	"debit" integer DEFAULT 0,
	"credit" integer DEFAULT 0,
	"memo" text,
	"entry_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"details" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"insight" jsonb NOT NULL,
	"confidence" numeric(3, 2),
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"lead_id" integer,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"scheduled_date" timestamp NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"assigned_to" text NOT NULL,
	"location" text,
	"vehicle_id" integer,
	"confirmation_sent" boolean DEFAULT false,
	"reminder_sent" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" varchar,
	"actor_name" varchar,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"changes" jsonb,
	"metadata" jsonb,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calc_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_name" varchar NOT NULL,
	"source_version" varchar NOT NULL,
	"effective_from" timestamp NOT NULL,
	"effective_to" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chart_of_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"sub_category" text,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "chart_of_accounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "co_applicants" (
	"id" serial PRIMARY KEY NOT NULL,
	"credit_application_id" integer NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"date_of_birth" text NOT NULL,
	"ssn" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"employment_history" json,
	"current_income" numeric(10, 2),
	"credit_score" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"message" text NOT NULL,
	"message_type" text DEFAULT 'comment' NOT NULL,
	"attachments" jsonb,
	"mentions" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"assigned_to" varchar,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"setting_key" text NOT NULL,
	"setting_value" jsonb,
	"display_name" text,
	"description" text,
	"category" text NOT NULL,
	"data_type" text NOT NULL,
	"is_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "communication_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"lead_id" integer,
	"type" text NOT NULL,
	"direction" text NOT NULL,
	"channel" text NOT NULL,
	"subject" text,
	"content" text,
	"sent_by" text,
	"sent_to" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"read_at" timestamp,
	"replied_at" timestamp,
	"attachments" json,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitive_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"trim" varchar(100),
	"mileage" integer,
	"price" numeric(10, 2) NOT NULL,
	"source" varchar(255) NOT NULL,
	"source_url" varchar(500),
	"location" varchar(255),
	"condition" varchar(50),
	"features" text[],
	"images" text[],
	"scraped_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "competitor_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"competitor_domain" text NOT NULL,
	"visit_duration" integer,
	"pages_visited" integer,
	"last_visited" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"application_date" timestamp DEFAULT now() NOT NULL,
	"full_name" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"ssn" text NOT NULL,
	"employment_history" json,
	"current_income" numeric(10, 2),
	"rent_mortgage" numeric(10, 2),
	"consent_given" boolean DEFAULT false,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"approval_amount" numeric(10, 2),
	"interest_rate" numeric(5, 2),
	"term_months" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_pulls" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"deal_id" integer,
	"pulled_by" varchar NOT NULL,
	"bureau" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"credit_score" integer,
	"report_data" jsonb,
	"consent_given" boolean DEFAULT false,
	"consent_timestamp" timestamp,
	"purpose" varchar NOT NULL,
	"cost_cents" integer,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"call_type" text NOT NULL,
	"phone_number" text NOT NULL,
	"duration" integer,
	"call_status" text NOT NULL,
	"notes" text,
	"recording_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_credit_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"application_status" text NOT NULL,
	"lender_name" text,
	"credit_score" integer,
	"approved_amount" integer,
	"interest_rate" numeric,
	"term_months" integer,
	"monthly_payment" integer,
	"down_payment" integer,
	"application_data" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "customer_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"is_verified" boolean DEFAULT false,
	"verified_by" integer,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"interaction_type" text NOT NULL,
	"element_id" text,
	"vehicle_id" integer,
	"data" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_lead_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"source_type" text NOT NULL,
	"source_name" text,
	"campaign_id" text,
	"referral_customer_id" integer,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"conversion_value" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"note_type" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"is_private" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"event_description" text NOT NULL,
	"event_data" jsonb,
	"source" text NOT NULL,
	"user_id" varchar,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "customer_trade_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"mileage" integer,
	"condition" text NOT NULL,
	"estimated_value" integer,
	"actual_value" integer,
	"vin" text,
	"images" text[],
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_vehicles_of_interest" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"vehicle_id" integer,
	"make" text,
	"model" text,
	"year" integer,
	"min_price" integer,
	"max_price" integer,
	"preferred_features" text[],
	"priority" text DEFAULT 'medium' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"cell_phone" text,
	"work_phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"date_of_birth" text,
	"drivers_license_number" text,
	"drivers_license_state" text,
	"ssn" text,
	"credit_score" integer,
	"income" numeric(10, 2),
	"employment" json,
	"banking_info" json,
	"insurance" json,
	"preferences" json,
	"lead_source" text,
	"referred_by" text,
	"communication_preferences" json,
	"purchase_history" json,
	"service_history" json,
	"follow_up_schedule" json,
	"tags" json,
	"notes" text,
	"lead_score" integer DEFAULT 0,
	"buying_timeframe" text,
	"budget_range" json,
	"trade_in_vehicle" json,
	"digital_profile" json,
	"customer_journey" json,
	"sales_consultant" text,
	"status" text DEFAULT 'prospect' NOT NULL,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"name" text NOT NULL,
	"license_number" text,
	"license_state" text,
	"license_expiry" timestamp,
	"profile_image" text,
	"ssn_encrypted" text,
	"preferred_contact_method" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "deal_gross" (
	"id" text PRIMARY KEY NOT NULL,
	"deal_id" text NOT NULL,
	"front_end_gross" integer DEFAULT 0,
	"finance_reserve" integer DEFAULT 0,
	"product_gross" integer DEFAULT 0,
	"pack_cost" integer DEFAULT 0,
	"net_gross" integer DEFAULT 0,
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deal_products" (
	"id" text PRIMARY KEY NOT NULL,
	"deal_id" text NOT NULL,
	"product_name" text NOT NULL,
	"retail_price" integer NOT NULL,
	"cost" integer NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" text PRIMARY KEY NOT NULL,
	"deal_number" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"vehicle_id" text,
	"vin" text,
	"msrp" integer,
	"sale_price" integer,
	"customer_id" text,
	"buyer_name" text NOT NULL,
	"co_buyer_name" text,
	"trade_vin" text,
	"trade_year" integer,
	"trade_make" text,
	"trade_model" text,
	"trade_trim" text,
	"trade_mileage" integer,
	"trade_condition" text,
	"trade_allowance" integer DEFAULT 0,
	"trade_payoff" integer DEFAULT 0,
	"trade_actual_cash_value" integer DEFAULT 0,
	"payoff_lender_name" text,
	"payoff_lender_address" text,
	"payoff_lender_city" text,
	"payoff_lender_state" text,
	"payoff_lender_zip" text,
	"payoff_lender_phone" text,
	"payoff_account_number" text,
	"payoff_amount" integer DEFAULT 0,
	"payoff_per_diem" numeric(10, 2) DEFAULT '0',
	"payoff_good_through" date,
	"insurance_company" text,
	"insurance_agent" text,
	"insurance_phone" text,
	"insurance_policy_number" text,
	"insurance_effective_date" date,
	"insurance_expiration_date" date,
	"insurance_deductible" integer,
	"insurance_coverage" json,
	"deal_type" text NOT NULL,
	"cash_down" integer DEFAULT 0,
	"rebates" integer DEFAULT 0,
	"sales_tax" integer DEFAULT 0,
	"doc_fee" integer DEFAULT 0,
	"title_fee" integer DEFAULT 0,
	"registration_fee" integer DEFAULT 0,
	"finance_balance" integer DEFAULT 0,
	"credit_status" text,
	"credit_tier" text,
	"term" integer,
	"rate" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"finalized_at" timestamp,
	"sales_person_id" text,
	"finance_manager_id" text,
	CONSTRAINT "deals_deal_number_unique" UNIQUE("deal_number")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "duplicate_customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"primary_customer_id" integer NOT NULL,
	"duplicate_customer_id" integer NOT NULL,
	"similarity_score" numeric(3, 2) NOT NULL,
	"matching_fields" jsonb NOT NULL,
	"status" text DEFAULT 'detected' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_number" text NOT NULL,
	"user_id" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"position" text NOT NULL,
	"department_id" integer NOT NULL,
	"hire_date" timestamp NOT NULL,
	"termination_date" timestamp,
	"salary" numeric,
	"hourly_rate" numeric,
	"payroll_type" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"emergency_contact" text,
	"emergency_phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_number_unique" UNIQUE("employee_number"),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "enterprise_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text,
	"permissions" text[] NOT NULL,
	"hierarchy" integer DEFAULT 0,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "enterprise_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "fee_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"jurisdiction_id" integer NOT NULL,
	"code" varchar NOT NULL,
	"label" varchar NOT NULL,
	"applies_to" varchar NOT NULL,
	"amount_cents" integer NOT NULL,
	"taxable" boolean DEFAULT false,
	"effective_from" timestamp NOT NULL,
	"effective_to" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fi_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" integer NOT NULL,
	"details" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fi_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar NOT NULL,
	"description" text,
	"provider" varchar NOT NULL,
	"cost_structure" jsonb NOT NULL,
	"retail_pricing" jsonb NOT NULL,
	"margin" numeric(5, 2),
	"eligibility_criteria" jsonb,
	"term_options" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "finance_menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"deal_id" integer,
	"presented_by" varchar NOT NULL,
	"vehicle_id" integer,
	"base_payment" numeric(8, 2) NOT NULL,
	"selected_products" jsonb,
	"total_product_cost" numeric(10, 2) DEFAULT '0',
	"final_payment" numeric(8, 2) NOT NULL,
	"customer_response" varchar,
	"digital_signature" text,
	"presentation_data" jsonb,
	"notes" text,
	"presented_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_type" text NOT NULL,
	"reference_id" integer,
	"description" text NOT NULL,
	"amount" numeric NOT NULL,
	"category" text NOT NULL,
	"account" text NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intent_scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"score" integer NOT NULL,
	"factors" text[],
	"model_version" varchar,
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jurisdictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"country" varchar(2) DEFAULT 'US' NOT NULL,
	"state" varchar(2) NOT NULL,
	"county" varchar,
	"city" varchar,
	"zip" varchar(10) NOT NULL,
	"geo_hash" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_jurisdiction" UNIQUE("state","county","city","zip")
);
--> statement-breakpoint
CREATE TABLE "kpi_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_name" text NOT NULL,
	"metric_value" numeric(15, 2) NOT NULL,
	"metric_type" text NOT NULL,
	"department" text,
	"period" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_activity" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"detail" text NOT NULL,
	"source" varchar,
	"timestamp" timestamp DEFAULT now(),
	"confidence" integer DEFAULT 100,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "lead_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"trigger" varchar NOT NULL,
	"message" text NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"status" varchar DEFAULT 'new',
	"created_at" timestamp DEFAULT now(),
	"actioned_by" varchar,
	"actioned_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "lead_assignment_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"assigned_from" varchar(100),
	"assigned_to" varchar(100) NOT NULL,
	"assigned_by" varchar(100) NOT NULL,
	"reason" varchar(200),
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"communication_type" varchar(50) NOT NULL,
	"direction" varchar(10) NOT NULL,
	"subject" varchar(200),
	"content" text,
	"performed_by" varchar(100),
	"scheduled_for" timestamp,
	"completed_at" timestamp,
	"outcome" varchar(100),
	"next_follow_up" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_distribution_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_name" varchar(100) NOT NULL,
	"source" varchar(100),
	"lead_type" varchar(50),
	"priority" varchar(20),
	"vehicle_type" varchar(50),
	"assignment_method" varchar(50) DEFAULT 'round_robin',
	"assign_to_role" varchar(100),
	"assign_to_user" varchar(100),
	"max_leads_per_user" integer DEFAULT 10,
	"business_hours_only" boolean DEFAULT true,
	"weekends_included" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"url" varchar NOT NULL,
	"type" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_scraped" timestamp,
	"total_leads_found" integer DEFAULT 0,
	"success_rate" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"lead_number" text NOT NULL,
	"source" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"temperature" text DEFAULT 'warm' NOT NULL,
	"interested_vehicles" json,
	"budget" json,
	"timeline" text,
	"trade_in_info" json,
	"financing" json,
	"assigned_to" text NOT NULL,
	"last_activity" timestamp,
	"next_follow_up" timestamp,
	"activities" json,
	"tags" json,
	"notes" text,
	"conversion_probability" numeric(5, 2),
	"estimated_value" numeric(10, 2),
	"competitor_info" json,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"interested_in" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leads_lead_number_unique" UNIQUE("lead_number")
);
--> statement-breakpoint
CREATE TABLE "lease_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand" varchar NOT NULL,
	"model" varchar,
	"year" integer,
	"residual_source" varchar,
	"mf_source" varchar,
	"term" integer NOT NULL,
	"mileage" integer NOT NULL,
	"residual_pct" numeric(5, 4) NOT NULL,
	"money_factor" numeric(8, 6) NOT NULL,
	"effective_from" timestamp NOT NULL,
	"effective_to" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lender_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"deal_id" integer,
	"credit_pull_id" integer,
	"lender_name" varchar NOT NULL,
	"lender_code" varchar NOT NULL,
	"submitted_by" varchar NOT NULL,
	"application_data" jsonb NOT NULL,
	"response_data" jsonb,
	"status" varchar DEFAULT 'pending',
	"approval_amount" numeric(10, 2),
	"interest_rate" numeric(5, 4),
	"term_months" integer,
	"monthly_payment" numeric(8, 2),
	"stipulations" jsonb,
	"reserve_amount" numeric(8, 2),
	"backend_eligibility" jsonb,
	"expiration_date" timestamp,
	"submitted_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lot_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer,
	"zone" varchar NOT NULL,
	"row" varchar NOT NULL,
	"spot" varchar NOT NULL,
	"full_position" varchar NOT NULL,
	"is_occupied" boolean DEFAULT false NOT NULL,
	"notes" text,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_benchmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_name" text NOT NULL,
	"our_value" numeric(15, 2) NOT NULL,
	"market_average" numeric(15, 2),
	"regional_average" numeric(15, 2),
	"percentile" integer,
	"vehicle_segment" text,
	"timeframe" text NOT NULL,
	"data_source" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"phone" varchar,
	"contact" varchar,
	"source" varchar NOT NULL,
	"source_url" varchar,
	"post_content" text,
	"vehicle_interest" text[] DEFAULT '{}',
	"intent_score" integer DEFAULT 0,
	"lifecycle_stage" varchar DEFAULT 'awareness' NOT NULL,
	"region" varchar,
	"budget_range" varchar,
	"timeframe" varchar,
	"last_seen" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_converted" boolean DEFAULT false,
	"converted_customer_id" varchar,
	"status" varchar DEFAULT 'new'
);
--> statement-breakpoint
CREATE TABLE "market_trends" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"trend" varchar(100) NOT NULL,
	"direction" varchar(20) NOT NULL,
	"strength" numeric(5, 2) NOT NULL,
	"timeframe" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"data_points" integer NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "merchandising_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer,
	"strategy" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"priority" integer NOT NULL,
	"estimated_impact" varchar(20) NOT NULL,
	"implementation_cost" numeric(10, 2),
	"expected_roi" numeric(5, 2),
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"variables" jsonb,
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_name" varchar(100) NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"workflows" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"integrations" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notifications" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"enabled" boolean DEFAULT true,
	"push_enabled" boolean DEFAULT true,
	"email_enabled" boolean DEFAULT false,
	"sms_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" varchar PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"trigger" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message_template" text NOT NULL,
	"action_url" varchar,
	"priority" varchar DEFAULT 'normal',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"type" varchar NOT NULL,
	"priority" varchar DEFAULT 'normal' NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"action_url" varchar,
	"action_data" jsonb,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"page_url" text NOT NULL,
	"page_title" text,
	"time_on_page" integer DEFAULT 0,
	"scroll_depth" integer DEFAULT 0,
	"exit_page" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_number" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar,
	"manufacturer" varchar,
	"manufacturer_part_number" varchar,
	"vehicle_make" varchar,
	"vehicle_model" varchar,
	"vehicle_year" integer,
	"quantity" integer DEFAULT 0 NOT NULL,
	"min_quantity" integer DEFAULT 0,
	"location" varchar,
	"cost" integer,
	"retail_price" integer,
	"condition" varchar DEFAULT 'new',
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parts_part_number_unique" UNIQUE("part_number")
);
--> statement-breakpoint
CREATE TABLE "payroll" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"pay_period_start" timestamp NOT NULL,
	"pay_period_end" timestamp NOT NULL,
	"hours_worked" numeric DEFAULT '0',
	"regular_hours" numeric DEFAULT '0',
	"overtime_hours" numeric DEFAULT '0',
	"gross_pay" numeric NOT NULL,
	"taxes" numeric DEFAULT '0',
	"deductions" numeric DEFAULT '0',
	"net_pay" numeric NOT NULL,
	"status" text NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "phone_calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"user_id" varchar,
	"direction" text NOT NULL,
	"phone_number" text NOT NULL,
	"status" text NOT NULL,
	"duration" integer,
	"recording_url" text,
	"call_notes" text,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"call_purpose" text,
	"outcome" text,
	"tags" jsonb,
	"cost" numeric(8, 4),
	"external_call_id" text,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictive_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"score_type" text NOT NULL,
	"score" numeric(3, 2) NOT NULL,
	"factors" jsonb,
	"model_version" text NOT NULL,
	"confidence" numeric(3, 2),
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer,
	"make" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"current_price" numeric(10, 2) NOT NULL,
	"suggested_price" numeric(10, 2) NOT NULL,
	"market_average" numeric(10, 2) NOT NULL,
	"price_range" json,
	"competitor_count" integer NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"price_position" varchar(20) NOT NULL,
	"recommended_action" varchar(50) NOT NULL,
	"factors" json,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"department_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"sales_person_id" integer NOT NULL,
	"sale_price" integer NOT NULL,
	"sale_date" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "salesperson_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"salesperson_id" integer NOT NULL,
	"note" text NOT NULL,
	"flagged_for_manager" boolean DEFAULT false,
	"flagged_at" timestamp,
	"reviewed_at" timestamp,
	"reviewed_by" integer,
	"is_private" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_order_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_order_id" integer NOT NULL,
	"part_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric NOT NULL,
	"unit_price" numeric NOT NULL,
	"total_cost" numeric NOT NULL,
	"total_price" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_order_number" text NOT NULL,
	"customer_id" integer NOT NULL,
	"vehicle_id" integer,
	"service_advisor_id" integer,
	"technician_id" integer,
	"status" text NOT NULL,
	"service_type" text NOT NULL,
	"description" text NOT NULL,
	"labor_hours" numeric DEFAULT '0',
	"labor_rate" numeric NOT NULL,
	"parts_total" numeric DEFAULT '0',
	"labor_total" numeric DEFAULT '0',
	"tax_amount" numeric DEFAULT '0',
	"total_amount" numeric DEFAULT '0',
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_orders_work_order_number_unique" UNIQUE("work_order_number")
);
--> statement-breakpoint
CREATE TABLE "service_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_number" text NOT NULL,
	"part_name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"supplier" text,
	"cost" numeric NOT NULL,
	"retail_price" numeric NOT NULL,
	"quantity_in_stock" integer DEFAULT 0 NOT NULL,
	"minimum_stock" integer DEFAULT 0 NOT NULL,
	"location" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_parts_part_number_unique" UNIQUE("part_number")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "showroom_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"vehicle_id" integer,
	"stock_number" varchar(50),
	"salesperson_id" integer,
	"lead_source" varchar(50),
	"event_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"deal_stage" varchar(50) DEFAULT 'vehicle_selection' NOT NULL,
	"notes" text,
	"time_entered" timestamp DEFAULT now() NOT NULL,
	"time_exited" timestamp,
	"session_date" date DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "showroom_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"visit_date" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"assigned_salesperson" text,
	"scheduled_time" timestamp,
	"arrived_time" timestamp,
	"meeting_start_time" timestamp,
	"test_drive_start_time" timestamp,
	"left_time" timestamp,
	"sold_time" timestamp,
	"vehicle_of_interest" text,
	"comments" text,
	"status_history" json,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_config_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"change_description" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"user_id" varchar(100) NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_roles" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"permissions" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"username" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"role" varchar NOT NULL,
	"department" varchar NOT NULL,
	"phone" varchar,
	"address" text,
	"bio" text,
	"profile_image_url" varchar,
	"is_active" boolean DEFAULT true,
	"permissions" text[],
	"preferences" jsonb,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_users_email_unique" UNIQUE("email"),
	CONSTRAINT "system_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"lead_id" integer,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_to" text NOT NULL,
	"assigned_by" text,
	"due_date" timestamp,
	"completed_at" timestamp,
	"completed_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"jurisdiction_id" integer NOT NULL,
	"applies_to" varchar NOT NULL,
	"basis" varchar NOT NULL,
	"rate" numeric(6, 4) NOT NULL,
	"precedence" integer DEFAULT 0,
	"effective_from" timestamp NOT NULL,
	"effective_to" timestamp,
	"is_compound" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "text_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"sender_id" varchar,
	"direction" text NOT NULL,
	"phone_number" text NOT NULL,
	"message_body" text NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"message_type" text DEFAULT 'sms' NOT NULL,
	"attachments" jsonb,
	"campaign_id" integer,
	"thread_id" text,
	"cost" numeric(8, 4),
	"delivered_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"year" integer NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"trim" text,
	"vin" text NOT NULL,
	"mileage" integer,
	"condition" text,
	"estimated_value" numeric(10, 2),
	"kbb_value" numeric(10, 2),
	"mmr_value" numeric(10, 2),
	"actual_value" numeric(10, 2),
	"photos" json,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"appraised_at" timestamp,
	"appraised_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_enterprise_roles" (
	"user_id" varchar NOT NULL,
	"role_id" integer NOT NULL,
	"assigned_by" varchar(100),
	"assigned_at" timestamp DEFAULT now(),
	CONSTRAINT "user_enterprise_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"provider" varchar DEFAULT 'replit',
	"username" text,
	"password" text,
	"name" text,
	"phone" text,
	"role_id" integer,
	"department_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" varchar(36) NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"vin" text NOT NULL,
	"stock_no" varchar(32),
	"stock_is_override" boolean DEFAULT false,
	"trim" text,
	"mileage" integer,
	"price" integer NOT NULL,
	"original_price" integer,
	"cost_price" integer,
	"status" text NOT NULL,
	"condition" text DEFAULT 'good',
	"description" text,
	"image_url" text,
	"listing" json,
	"media" json,
	"valuations" json,
	"specifications" json,
	"location" json,
	"audit_logs" json,
	"price_history" json,
	"tags" json,
	"ai_insights" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "vehicles_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
CREATE TABLE "visitor_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"visitor_id" text NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"referrer" text,
	"landing_page" text,
	"device_type" text,
	"browser_name" text,
	"operating_system" text,
	"country" text,
	"city" text,
	"is_returning_visitor" boolean DEFAULT false,
	"total_page_views" integer DEFAULT 0,
	"session_duration" integer DEFAULT 0,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "visitor_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "workflow_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"execution_data" jsonb,
	"error" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "workflow_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger_type" text NOT NULL,
	"trigger_conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"department" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "xml_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"raw_xml" text NOT NULL,
	"source" varchar(100) NOT NULL,
	"lead_id" varchar(100),
	"customer_name" varchar(200),
	"customer_email" varchar(200),
	"customer_phone" varchar(50),
	"interested_in" varchar(500),
	"message" text,
	"vehicle_of_interest" varchar(200),
	"appointment_requested" boolean DEFAULT false,
	"trade_in_vehicle" varchar(200),
	"financing_preferred" boolean DEFAULT false,
	"lead_type" varchar(50) DEFAULT 'inquiry',
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(50) DEFAULT 'new',
	"assigned_to" varchar(100),
	"assigned_by" varchar(100),
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deal_profitability" (
	"id" serial PRIMARY KEY NOT NULL,
	"deal_id" integer NOT NULL,
	"vehicle_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"vehicle_cost" numeric(12, 2) NOT NULL,
	"recon_cost" numeric(12, 2) DEFAULT '0.00',
	"pack_cost" numeric(12, 2) DEFAULT '0.00',
	"total_cost" numeric(12, 2) NOT NULL,
	"selling_price" numeric(12, 2) NOT NULL,
	"trade_allowance" numeric(12, 2) DEFAULT '0.00',
	"trade_actual_value" numeric(12, 2) DEFAULT '0.00',
	"cash_down" numeric(12, 2) DEFAULT '0.00',
	"net_trade_position" numeric(12, 2) DEFAULT '0.00',
	"front_end_gross" numeric(12, 2) NOT NULL,
	"warranty_revenue" numeric(12, 2) DEFAULT '0.00',
	"gap_revenue" numeric(12, 2) DEFAULT '0.00',
	"maintenance_revenue" numeric(12, 2) DEFAULT '0.00',
	"insurance_revenue" numeric(12, 2) DEFAULT '0.00',
	"other_fi_products" numeric(12, 2) DEFAULT '0.00',
	"back_end_gross" numeric(12, 2) DEFAULT '0.00',
	"finance_reserve" numeric(12, 2) DEFAULT '0.00',
	"reserve_rate" numeric(5, 4) DEFAULT '0.0000',
	"buy_rate" numeric(5, 4) DEFAULT '0.0000',
	"sell_rate" numeric(5, 4) DEFAULT '0.0000',
	"finance_company" varchar(100),
	"reserve_split_type" varchar(20) DEFAULT 'percentage',
	"salesperson_split" numeric(5, 2) DEFAULT '50.00',
	"manager_split" numeric(5, 2) DEFAULT '25.00',
	"house_split" numeric(5, 2) DEFAULT '25.00',
	"salesperson_reserve" numeric(12, 2) DEFAULT '0.00',
	"manager_reserve" numeric(12, 2) DEFAULT '0.00',
	"house_reserve" numeric(12, 2) DEFAULT '0.00',
	"total_gross" numeric(12, 2) NOT NULL,
	"total_profit" numeric(12, 2) NOT NULL,
	"profit_margin" numeric(5, 2) NOT NULL,
	"is_finalized" boolean DEFAULT false,
	"finalized_at" timestamp,
	"finalized_by" varchar(100),
	"econtract_status" varchar(50) DEFAULT 'pending',
	"econtract_id" varchar(100),
	"econtract_sent_at" timestamp,
	"econtract_signed_at" timestamp,
	"journal_entry_id" integer,
	"is_posted_to_books" boolean DEFAULT false,
	"posted_to_books_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "deal_profitability_deal_id_unique" UNIQUE("deal_id")
);
--> statement-breakpoint
CREATE TABLE "econtract_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_name" varchar(100) NOT NULL,
	"template_type" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	"template_content" text NOT NULL,
	"required_fields" jsonb DEFAULT '[]'::jsonb,
	"optional_fields" jsonb DEFAULT '[]'::jsonb,
	"signature_pages" jsonb DEFAULT '[]'::jsonb,
	"witness_required" boolean DEFAULT false,
	"notary_required" boolean DEFAULT false,
	"state" varchar(2),
	"compliance_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fi_product_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_name" varchar(100) NOT NULL,
	"product_type" varchar(50) NOT NULL,
	"provider" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true,
	"cost_percentage" numeric(5, 2) DEFAULT '0.00',
	"base_commission" numeric(5, 2) DEFAULT '0.00',
	"tier_commissions" jsonb DEFAULT '[]'::jsonb,
	"coverage_months" integer,
	"coverage_miles" integer,
	"deductible" numeric(12, 2),
	"max_claim" numeric(12, 2),
	"description" text,
	"terms" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_number" varchar(50) NOT NULL,
	"entry_date" date NOT NULL,
	"description" text NOT NULL,
	"reference" varchar(100),
	"deal_id" integer,
	"vehicle_id" integer,
	"customer_id" integer,
	"total_debit" numeric(12, 2) NOT NULL,
	"total_credit" numeric(12, 2) NOT NULL,
	"is_posted" boolean DEFAULT false,
	"posted_at" timestamp,
	"posted_by" varchar(100),
	"memo" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"created_by" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "journal_entries_entry_number_unique" UNIQUE("entry_number")
);
--> statement-breakpoint
CREATE TABLE "journal_entry_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"journal_entry_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"description" text,
	"debit_amount" numeric(12, 2) DEFAULT '0.00',
	"credit_amount" numeric(12, 2) DEFAULT '0.00',
	"memo" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "monthly_financials" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"account_id" integer NOT NULL,
	"beginning_balance" numeric(12, 2) DEFAULT '0.00',
	"monthly_debits" numeric(12, 2) DEFAULT '0.00',
	"monthly_credits" numeric(12, 2) DEFAULT '0.00',
	"ending_balance" numeric(12, 2) DEFAULT '0.00',
	"ytd_debits" numeric(12, 2) DEFAULT '0.00',
	"ytd_credits" numeric(12, 2) DEFAULT '0.00',
	"ytd_balance" numeric(12, 2) DEFAULT '0.00',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_system_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."system_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co_applicants" ADD CONSTRAINT "co_applicants_credit_application_id_credit_applications_id_fk" FOREIGN KEY ("credit_application_id") REFERENCES "public"."credit_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_thread_id_collaboration_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."collaboration_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_threads" ADD CONSTRAINT "collaboration_threads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_threads" ADD CONSTRAINT "collaboration_threads_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_analytics" ADD CONSTRAINT "competitor_analytics_session_id_visitor_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."visitor_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_applications" ADD CONSTRAINT "credit_applications_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_pulls" ADD CONSTRAINT "credit_pulls_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_pulls" ADD CONSTRAINT "credit_pulls_deal_id_sales_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_calls" ADD CONSTRAINT "customer_calls_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_calls" ADD CONSTRAINT "customer_calls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_credit_applications" ADD CONSTRAINT "customer_credit_applications_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_credit_applications" ADD CONSTRAINT "customer_credit_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_documents" ADD CONSTRAINT "customer_documents_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_documents" ADD CONSTRAINT "customer_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_session_id_visitor_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."visitor_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_lead_sources" ADD CONSTRAINT "customer_lead_sources_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_lead_sources" ADD CONSTRAINT "customer_lead_sources_referral_customer_id_customers_id_fk" FOREIGN KEY ("referral_customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_timeline" ADD CONSTRAINT "customer_timeline_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_timeline" ADD CONSTRAINT "customer_timeline_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_trade_ins" ADD CONSTRAINT "customer_trade_ins_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_vehicles_of_interest" ADD CONSTRAINT "customer_vehicles_of_interest_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_vehicles_of_interest" ADD CONSTRAINT "customer_vehicles_of_interest_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_gross" ADD CONSTRAINT "deal_gross_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_products" ADD CONSTRAINT "deal_products_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_customers" ADD CONSTRAINT "duplicate_customers_primary_customer_id_customers_id_fk" FOREIGN KEY ("primary_customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_customers" ADD CONSTRAINT "duplicate_customers_duplicate_customer_id_customers_id_fk" FOREIGN KEY ("duplicate_customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_customers" ADD CONSTRAINT "duplicate_customers_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_catalog" ADD CONSTRAINT "fee_catalog_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_menus" ADD CONSTRAINT "finance_menus_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_menus" ADD CONSTRAINT "finance_menus_deal_id_sales_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_menus" ADD CONSTRAINT "finance_menus_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intent_scores" ADD CONSTRAINT "intent_scores_lead_id_market_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."market_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activity" ADD CONSTRAINT "lead_activity_lead_id_market_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."market_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_alerts" ADD CONSTRAINT "lead_alerts_lead_id_market_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."market_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_assignment_history" ADD CONSTRAINT "lead_assignment_history_lead_id_xml_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."xml_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_communications" ADD CONSTRAINT "lead_communications_lead_id_xml_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."xml_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_applications" ADD CONSTRAINT "lender_applications_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_applications" ADD CONSTRAINT "lender_applications_deal_id_sales_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lender_applications" ADD CONSTRAINT "lender_applications_credit_pull_id_credit_pulls_id_fk" FOREIGN KEY ("credit_pull_id") REFERENCES "public"."credit_pulls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lot_positions" ADD CONSTRAINT "lot_positions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchandising_strategies" ADD CONSTRAINT "merchandising_strategies_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_session_id_visitor_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."visitor_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_calls" ADD CONSTRAINT "phone_calls_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_calls" ADD CONSTRAINT "phone_calls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_insights" ADD CONSTRAINT "pricing_insights_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salesperson_notes" ADD CONSTRAINT "salesperson_notes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salesperson_notes" ADD CONSTRAINT "salesperson_notes_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salesperson_notes" ADD CONSTRAINT "salesperson_notes_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_order_parts" ADD CONSTRAINT "service_order_parts_service_order_id_service_orders_id_fk" FOREIGN KEY ("service_order_id") REFERENCES "public"."service_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_order_parts" ADD CONSTRAINT "service_order_parts_part_id_service_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."service_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_service_advisor_id_users_id_fk" FOREIGN KEY ("service_advisor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showroom_sessions" ADD CONSTRAINT "showroom_sessions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showroom_sessions" ADD CONSTRAINT "showroom_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showroom_sessions" ADD CONSTRAINT "showroom_sessions_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showroom_visits" ADD CONSTRAINT "showroom_visits_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_messages" ADD CONSTRAINT "text_messages_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_messages" ADD CONSTRAINT "text_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_vehicles" ADD CONSTRAINT "trade_vehicles_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_enterprise_roles" ADD CONSTRAINT "user_enterprise_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_enterprise_roles" ADD CONSTRAINT "user_enterprise_roles_role_id_enterprise_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."enterprise_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_system_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."system_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_template_id_workflow_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workflow_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_profitability" ADD CONSTRAINT "deal_profitability_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_financials" ADD CONSTRAINT "monthly_financials_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_entity" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_actor" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_created" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_jurisdiction_zip" ON "jurisdictions" USING btree ("zip");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_tax_rules_jurisdiction" ON "tax_rules" USING btree ("jurisdiction_id","effective_from","effective_to");