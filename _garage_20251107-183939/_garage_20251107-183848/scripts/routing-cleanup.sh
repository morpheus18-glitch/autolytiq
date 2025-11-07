#!/bin/bash
# routing-cleanup.sh - Fix routing nightmare by removing duplicate pages

set -e

echo "🧹 Phase 1: Deleting 23 duplicate pages in misc/"

# Array of duplicates to delete
duplicates=(
  "customers.tsx"
  "deals.tsx"
  "inventory.tsx"
  "CommunicationCenter.tsx"
  "CallCenter.tsx"
  "EmailComposer.tsx"
  "SMSInbox.tsx"
  "CustomerProfile.tsx"
  "customer-detail.tsx"
  "CRMAnalytics.tsx"
  "vehicle-detail.tsx"
  "trade-appraisals.tsx"
  "lot-management.tsx"
  "inventory-pricing.tsx"
  "inventory-detail.tsx"
  "competitive-pricing.tsx"
  "showroom-manager.tsx"
  "market-leads.tsx"
  "crm-lead-management.tsx"
  "AppointmentCalendar.tsx"
  "reports.tsx"
  "forgot-password.tsx"
  "reset-password.tsx"
)

deleted=0
for file in "${duplicates[@]}"; do
  if [ -f "apps/frontend/src/pages/misc/$file" ]; then
    echo "  ✓ Deleting misc/$file"
    rm "apps/frontend/src/pages/misc/$file"
    ((deleted++))
  fi
done

echo "✅ Phase 1 complete: Deleted $deleted duplicate files"
echo ""
echo "📋 Phase 2: Reorganizing legitimate misc pages"

# Create directories if needed
mkdir -p apps/frontend/src/pages/fi
mkdir -p apps/frontend/src/pages/search
mkdir -p apps/frontend/src/pages/tools

moved=0
# Move to proper locations
if [ -f apps/frontend/src/pages/misc/ml-model-comparison.tsx ]; then
  mv apps/frontend/src/pages/misc/ml-model-comparison.tsx apps/frontend/src/pages/admin/
  echo "  ✓ Moved ml-model-comparison.tsx → admin/"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/ml-developer-admin.tsx ]; then
  mv apps/frontend/src/pages/misc/ml-developer-admin.tsx apps/frontend/src/pages/admin/
  echo "  ✓ Moved ml-developer-admin.tsx → admin/"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/multi-store-management.tsx ]; then
  mv apps/frontend/src/pages/misc/multi-store-management.tsx apps/frontend/src/pages/admin/
  echo "  ✓ Moved multi-store-management.tsx → admin/"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/system-health.tsx ]; then
  mv apps/frontend/src/pages/misc/system-health.tsx apps/frontend/src/pages/admin/
  echo "  ✓ Moved system-health.tsx → admin/"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/fi-configuration.tsx ]; then
  mv apps/frontend/src/pages/misc/fi-configuration.tsx apps/frontend/src/pages/fi/configuration.tsx
  echo "  ✓ Moved fi-configuration.tsx → fi/configuration.tsx"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/automotive-data-center.tsx ]; then
  mv apps/frontend/src/pages/misc/automotive-data-center.tsx apps/frontend/src/pages/inventory/data-center.tsx
  echo "  ✓ Moved automotive-data-center.tsx → inventory/data-center.tsx"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/analytics.tsx ]; then
  mv apps/frontend/src/pages/misc/analytics.tsx apps/frontend/src/pages/analytics/dashboard.tsx
  echo "  ✓ Moved analytics.tsx → analytics/dashboard.tsx"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/ai-smart-search.tsx ]; then
  mv apps/frontend/src/pages/misc/ai-smart-search.tsx apps/frontend/src/pages/search/ai-smart.tsx
  echo "  ✓ Moved ai-smart-search.tsx → search/ai-smart.tsx"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/workflow-assistant.tsx ]; then
  mv apps/frontend/src/pages/misc/workflow-assistant.tsx apps/frontend/src/pages/tools/workflow-assistant.tsx
  echo "  ✓ Moved workflow-assistant.tsx → tools/workflow-assistant.tsx"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/role-landing.tsx ]; then
  mv apps/frontend/src/pages/misc/role-landing.tsx apps/frontend/src/pages/dashboard/
  echo "  ✓ Moved role-landing.tsx → dashboard/"
  ((moved++))
fi

if [ -f apps/frontend/src/pages/misc/sales.tsx ]; then
  mv apps/frontend/src/pages/misc/sales.tsx apps/frontend/src/pages/dashboard/sales-alt.tsx
  echo "  ✓ Moved sales.tsx → dashboard/sales-alt.tsx"
  ((moved++))
fi

echo "✅ Phase 2 complete: Reorganized $moved pages"
echo ""
echo "📊 Remaining misc/ files:"
remaining=$(ls -1 apps/frontend/src/pages/misc/*.tsx 2>/dev/null | wc -l)
echo "   $remaining files remain in misc/"
echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update routes/index.tsx to remove deleted Misc* imports"
echo "   2. Add imports for reorganized pages"
echo "   3. Test all pages load correctly"
echo "   4. Commit changes with: git add -A && git commit -m 'Fix routing: delete 23 duplicates, reorganize 11 pages'"
