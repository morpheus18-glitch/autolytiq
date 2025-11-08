-- CreateEnum
CREATE TYPE "WidgetCategory" AS ENUM ('SALES', 'SERVICE', 'FINANCE', 'ACCOUNTING', 'INVENTORY', 'ANALYTICS', 'ADMIN', 'DEVELOPER');

-- CreateEnum
CREATE TYPE "WidgetType" AS ENUM ('METRIC', 'LIST', 'CHART', 'CALENDAR', 'TABLE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WidgetSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'WIDE', 'FULL');

-- CreateTable
CREATE TABLE "dashboard_layouts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "role" "UserRole",
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "layout" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dashboard_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widget_definitions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "WidgetCategory" NOT NULL,
    "type" "WidgetType" NOT NULL,
    "default_size" "WidgetSize" NOT NULL,
    "min_size" "WidgetSize" NOT NULL,
    "max_size" "WidgetSize" NOT NULL,
    "permissions" TEXT[],
    "data_source" TEXT NOT NULL,
    "refresh_interval" INTEGER,
    "config_schema" JSONB,
    "component_path" TEXT NOT NULL,
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widget_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_widget_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "widget_key" TEXT NOT NULL,
    "config" JSONB,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_widget_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dashboard_layouts_tenant_id_idx" ON "dashboard_layouts"("tenant_id");

-- CreateIndex
CREATE INDEX "dashboard_layouts_user_id_idx" ON "dashboard_layouts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_layouts_user_id_role_key" ON "dashboard_layouts"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "widget_definitions_key_key" ON "widget_definitions"("key");

-- CreateIndex
CREATE INDEX "user_widget_preferences_user_id_idx" ON "user_widget_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_widget_preferences_user_id_widget_key_key" ON "user_widget_preferences"("user_id", "widget_key");

-- AddForeignKey
ALTER TABLE "dashboard_layouts" ADD CONSTRAINT "dashboard_layouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_layouts" ADD CONSTRAINT "dashboard_layouts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_widget_preferences" ADD CONSTRAINT "user_widget_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
