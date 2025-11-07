    ./
    ├── BUILD_REPORT.md
    ├── DEAL_STUDIO_IMPLEMENTATION_PLAN.md
    ├── DEPLOYMENT_FLOW.txt
    ├── DEPLOY_FRONTEND_MANUAL.sh
    ├── INSIGHT_ENGINE_BUILD_LOG.md
    ├── Makefile
    ├── PATCHES/
    │   └── full.patch
    ├── PHASE_4_COMPLETION_SUMMARY.md
    ├── README.md
    ├── apps/
    │   ├── backend/
    │   │   ├── Dockerfile
    │   │   ├── nodemon.json
    │   │   ├── package.json
    │   │   ├── public/
    │   │   │   ├── aiq-logo.png
    │   │   │   ├── assets/
    │   │   │   │   ├── RolePresetCard-DDiB9Mqu.js
    │   │   │   │   ├── chart-vendor-D6emtngP.js
    │   │   │   │   ├── dashboard-Crty4BIB.js
    │   │   │   │   ├── form-vendor-xKQyAupW.js
    │   │   │   │   ├── icon-vendor-BhKQ_I_U.js
    │   │   │   │   ├── index-BFJYXlMe.js
    │   │   │   │   ├── index-CkKRseFT.css
    │   │   │   │   ├── react-vendor-0MbT-QNE.js
    │   │   │   │   ├── role-presets-BIdZAnU3.js
    │   │   │   │   ├── router-vendor-DU6arULo.js
    │   │   │   │   ├── settings-BvSBOIh1.js
    │   │   │   │   ├── sitemap-kC5F8ZsK.js
    │   │   │   │   ├── ui-vendor-V8GXQrNS.js
    │   │   │   │   └── user-permissions-j9GdvkpX.js
    │   │   │   └── index.html
    │   │   ├── scripts/
    │   │   │   └── postbuild.mjs
    │   │   ├── src/
    │   │   │   ├── config/
    │   │   │   │   ├── env.ts
    │   │   │   │   ├── permissions.ts
    │   │   │   │   └── scoring.ts
    │   │   │   ├── controllers/
    │   │   │   │   ├── activity.controller.ts
    │   │   │   │   ├── appointment.controller.ts
    │   │   │   │   ├── communication.controller.ts
    │   │   │   │   ├── desking.controller.ts
    │   │   │   │   └── webhooks.controller.ts
    │   │   │   ├── domain/
    │   │   │   │   └── desking/
    │   │   │   │       ├── schemas.ts
    │   │   │   │       └── types.ts
    │   │   │   ├── events/
    │   │   │   │   ├── index.ts
    │   │   │   │   └── topics.ts
    │   │   │   ├── fi/
    │   │   │   │   └── compliance.service.ts
    │   │   │   ├── index.ts
    │   │   │   ├── index.ts.backup
    │   │   │   ├── integrations/
    │   │   │   │   ├── accounting.integration.ts
    │   │   │   │   ├── crm.integration.ts
    │   │   │   │   ├── fi.integration.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   └── inventory.integration.ts
    │   │   │   ├── lib/
    │   │   │   │   ├── errors.ts
    │   │   │   │   ├── event-bus.ts
    │   │   │   │   ├── grpc/
    │   │   │   │   │   └── priceEngineClient.ts
    │   │   │   │   ├── logger.ts
    │   │   │   │   ├── prisma.ts
    │   │   │   │   ├── request.ts
    │   │   │   │   ├── socket.ts
    │   │   │   │   └── storage/
    │   │   │   │       └── s3.ts
    │   │   │   ├── middleware/
    │   │   │   │   ├── auth.ts
    │   │   │   │   ├── context.ts
    │   │   │   │   ├── rbac.ts
    │   │   │   │   └── tenant.ts
    │   │   │   ├── proto/
    │   │   │   │   └── pricing/
    │   │   │   │       └── v1/
    │   │   │   │           └── pricing.proto
    │   │   │   ├── queues/
    │   │   │   │   ├── appointment.jobs.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── routes/
    │   │   │   │   ├── accounting.routes.ts
    │   │   │   │   ├── activity.routes.ts
    │   │   │   │   ├── appointment.routes.ts
    │   │   │   │   ├── appraisal.routes.ts
    │   │   │   │   ├── auth.routes.ts
    │   │   │   │   ├── automation.routes.ts
    │   │   │   │   ├── communication.routes.ts
    │   │   │   │   ├── customer.routes.ts
    │   │   │   │   ├── dashboard.routes.ts
    │   │   │   │   ├── desking.routes.ts
    │   │   │   │   ├── fi/
    │   │   │   │   │   ├── compliance.routes.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── health.routes.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── insights.ts
    │   │   │   │   ├── inventory.routes.ts
    │   │   │   │   ├── leads.ts
    │   │   │   │   ├── merchandising.routes.ts
    │   │   │   │   ├── ml.routes.ts
    │   │   │   │   ├── notes.ts
    │   │   │   │   ├── notifications.ts
    │   │   │   │   ├── pipeline.routes.ts
    │   │   │   │   ├── pricing-intelligence.routes.ts
    │   │   │   │   ├── pricing.routes.ts
    │   │   │   │   ├── search.routes.ts
    │   │   │   │   ├── search.ts
    │   │   │   │   ├── service-order.routes.ts
    │   │   │   │   ├── tax.ts
    │   │   │   │   ├── timeline.routes.ts
    │   │   │   │   ├── vehicle.routes.ts
    │   │   │   │   ├── vin.ts
    │   │   │   │   └── webhooks.routes.ts
    │   │   │   ├── scripts/
    │   │   │   │   ├── benchmark-performance.ts
    │   │   │   │   ├── seed-permissions.ts
    │   │   │   │   └── verify-deal-integrity.ts
    │   │   │   ├── server.ts
    │   │   │   ├── services/
    │   │   │   │   ├── accounting.service.ts
    │   │   │   │   ├── activity.service.ts
    │   │   │   │   ├── appointment.service.ts
    │   │   │   │   ├── appointment.types.ts
    │   │   │   │   ├── appraisal.service.ts
    │   │   │   │   ├── approvalPredictor.service.ts
    │   │   │   │   ├── automation.service.ts
    │   │   │   │   ├── commission.service.ts
    │   │   │   │   ├── communication.service.ts
    │   │   │   │   ├── customer/
    │   │   │   │   │   └── search.service.ts
    │   │   │   │   ├── dashboard.service.ts
    │   │   │   │   ├── deal-event.service.ts
    │   │   │   │   ├── dealEventLog.service.ts
    │   │   │   │   ├── dealOptimizer.service.ts
    │   │   │   │   ├── desking.service.ts
    │   │   │   │   ├── financial-reporting.service.ts
    │   │   │   │   ├── grossCalculator.service.ts
    │   │   │   │   ├── inbox.service.ts
    │   │   │   │   ├── insights/
    │   │   │   │   │   ├── evaluator.ts
    │   │   │   │   │   ├── fetchers.ts
    │   │   │   │   │   ├── queue.ts
    │   │   │   │   │   └── rules.builtin.ts
    │   │   │   │   ├── inventory.service.ts
    │   │   │   │   ├── lead-intelligence.service.ts
    │   │   │   │   ├── lead-routing.service.ts
    │   │   │   │   ├── lead-score.service.ts
    │   │   │   │   ├── lenderRules.service.ts
    │   │   │   │   ├── marketPricing.service.ts
    │   │   │   │   ├── merchandising.service.ts
    │   │   │   │   ├── ml-cache.service.ts
    │   │   │   │   ├── ml.service.ts
    │   │   │   │   ├── notification.service.ts
    │   │   │   │   ├── outbox.service.ts
    │   │   │   │   ├── paymentCalculator.service.ts
    │   │   │   │   ├── pipeline.service.ts
    │   │   │   │   ├── pricing-intelligence.service.ts
    │   │   │   │   ├── pricing.service.ts
    │   │   │   │   ├── rustPricing.service.ts
    │   │   │   │   ├── search.service.ts
    │   │   │   │   ├── sendgrid.service.ts
    │   │   │   │   ├── service-order.service.ts
    │   │   │   │   ├── similarDeals.service.ts
    │   │   │   │   ├── tax.service.ts
    │   │   │   │   ├── timeline.service.ts
    │   │   │   │   ├── twilio.service.ts
    │   │   │   │   └── webhook.service.ts
    │   │   │   ├── shared/
    │   │   │   │   └── search-vector.ts
    │   │   │   ├── sockets/
    │   │   │   │   └── lead.channel.ts
    │   │   │   ├── types/
    │   │   │   │   ├── context.ts
    │   │   │   │   ├── express.d.ts
    │   │   │   │   ├── js-yaml.d.ts
    │   │   │   │   ├── ml.ts
    │   │   │   │   └── roles.ts
    │   │   │   ├── utils/
    │   │   │   │   ├── authz.ts
    │   │   │   │   ├── http-errors.ts
    │   │   │   │   └── pdf.ts
    │   │   │   ├── validations/
    │   │   │   │   ├── activity.validation.ts
    │   │   │   │   ├── appointment.validation.ts
    │   │   │   │   ├── communication.validation.ts
    │   │   │   │   └── desking.validation.ts
    │   │   │   └── workers/
    │   │   │       └── deskingWorker.ts
    │   │   ├── tsconfig.json
    │   │   └── tsup.config.ts
    │   ├── frontend/
    │   │   ├── Dockerfile
    │   │   ├── README.md
    │   │   ├── _archive_20251107-173529/
    │   │   │   ├── components/
    │   │   │   │   ├── ErrorBoundary.tsx
    │   │   │   │   ├── accounting/
    │   │   │   │   │   ├── AccountTree.tsx
    │   │   │   │   │   ├── BalanceDisplay.tsx
    │   │   │   │   │   ├── ExportButton.tsx
    │   │   │   │   │   ├── FinancialChart.tsx
    │   │   │   │   │   ├── JournalEntryLine.tsx
    │   │   │   │   │   ├── StatementHeader.tsx
    │   │   │   │   │   ├── crm-integration.tsx
    │   │   │   │   │   └── inventory-integration.tsx
    │   │   │   │   ├── admin/
    │   │   │   │   │   └── user-form.tsx
    │   │   │   │   ├── calculators/
    │   │   │   │   │   ├── GrossCalculator.tsx
    │   │   │   │   │   └── PaymentCalculator.tsx
    │   │   │   │   ├── common/
    │   │   │   │   │   └── TaxQuoteBadge.tsx
    │   │   │   │   ├── communications/
    │   │   │   │   │   ├── CalendarGrid.tsx
    │   │   │   │   │   ├── DispositionModal.tsx
    │   │   │   │   │   ├── KPIGroup.tsx
    │   │   │   │   │   ├── TemplatePicker.tsx
    │   │   │   │   │   └── UnifiedFilters.tsx
    │   │   │   │   ├── dashboard/
    │   │   │   │   │   ├── DashboardLayout.tsx
    │   │   │   │   │   └── DashboardWidget.tsx
    │   │   │   │   ├── deal-desk/
    │   │   │   │   │   ├── ai-assistant.tsx
    │   │   │   │   │   ├── ai-optimization-wrapper.tsx
    │   │   │   │   │   ├── fees-section.tsx
    │   │   │   │   │   ├── finance-section.tsx
    │   │   │   │   │   ├── kpi-cards.tsx
    │   │   │   │   │   ├── lender-matcher.tsx
    │   │   │   │   │   ├── payment-scenarios.tsx
    │   │   │   │   │   ├── products-section.tsx
    │   │   │   │   │   ├── profit-optimizer.tsx
    │   │   │   │   │   └── trade-section.tsx
    │   │   │   │   ├── deal-studio/
    │   │   │   │   │   ├── DealStudio.tsx
    │   │   │   │   │   ├── desktop/
    │   │   │   │   │   │   ├── AICompanionPanel.tsx
    │   │   │   │   │   │   ├── CenterPanel.tsx
    │   │   │   │   │   │   ├── CustomerDossierPanel.tsx
    │   │   │   │   │   │   ├── DealStudioDesktop.tsx
    │   │   │   │   │   │   ├── LeftPanel.tsx
    │   │   │   │   │   │   ├── LiveSimulatorPanel.tsx
    │   │   │   │   │   │   ├── RightPanel.tsx
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── mobile/
    │   │   │   │   │   │   ├── AICoachTab.tsx
    │   │   │   │   │   │   ├── ActionBar.tsx
    │   │   │   │   │   │   ├── CompactDossierHeader.tsx
    │   │   │   │   │   │   ├── DealStudioMobile.tsx
    │   │   │   │   │   │   ├── SimulatorTab.tsx
    │   │   │   │   │   │   ├── TabControl.tsx
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── shared/
    │   │   │   │   │   │   ├── AICoachCard.tsx
    │   │   │   │   │   │   ├── CustomerDetailModal.tsx
    │   │   │   │   │   │   ├── CustomerVehicleSelector.tsx
    │   │   │   │   │   │   ├── DealInputWithSlider.tsx
    │   │   │   │   │   │   ├── DealSlider.tsx
    │   │   │   │   │   │   ├── DealStructureSummary.tsx
    │   │   │   │   │   │   ├── FIProductSelector.tsx
    │   │   │   │   │   │   ├── LivePaymentDisplay.tsx
    │   │   │   │   │   │   ├── ProfitBadge.tsx
    │   │   │   │   │   │   ├── VehicleDetailModal.tsx
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   └── utils/
    │   │   │   │   │       └── generateChatSummary.ts
    │   │   │   │   ├── desking/
    │   │   │   │   │   ├── AIInsightPanel.tsx
    │   │   │   │   │   ├── DealTimelineTracker.tsx
    │   │   │   │   │   ├── GrossMeter.tsx
    │   │   │   │   │   ├── LenderRecommendationCard.tsx
    │   │   │   │   │   ├── PanelErrorBoundary.tsx
    │   │   │   │   │   ├── PaymentScenarioCard.tsx
    │   │   │   │   │   ├── PencilPrintPreview.tsx
    │   │   │   │   │   └── ProbabilityIndicator.tsx
    │   │   │   │   ├── enterprise/
    │   │   │   │   │   ├── advanced-reporting.tsx
    │   │   │   │   │   ├── ai-advanced-reporting.tsx
    │   │   │   │   │   ├── ai-customer-intelligence.tsx
    │   │   │   │   │   ├── ai-customer-lifecycle.tsx
    │   │   │   │   │   ├── ai-production-suite.tsx
    │   │   │   │   │   ├── ai-system-health.tsx
    │   │   │   │   │   ├── ai-unified-dashboard.tsx
    │   │   │   │   │   ├── ai-workflow-automation.tsx
    │   │   │   │   │   ├── customer-360-intelligence.tsx
    │   │   │   │   │   ├── customer-intelligence.tsx
    │   │   │   │   │   ├── production-suite.tsx
    │   │   │   │   │   ├── real-time-collaboration.tsx
    │   │   │   │   │   └── workflow-automation.tsx
    │   │   │   │   ├── examples/
    │   │   │   │   │   └── NotesExamples.tsx
    │   │   │   │   ├── forms/
    │   │   │   │   │   ├── CustomerEntryForm.tsx
    │   │   │   │   │   └── VehicleEntryForm.tsx
    │   │   │   │   ├── inventory/
    │   │   │   │   │   ├── audit-timeline.tsx
    │   │   │   │   │   ├── media-gallery.tsx
    │   │   │   │   │   └── valuation-card.tsx
    │   │   │   │   ├── layout/
    │   │   │   │   │   ├── app-shell.tsx
    │   │   │   │   │   ├── card-grid.tsx
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── responsive-table.tsx
    │   │   │   │   │   └── stats-grid.tsx
    │   │   │   │   ├── leads/
    │   │   │   │   │   ├── AIInsights.tsx
    │   │   │   │   │   ├── ActivityFeed.tsx
    │   │   │   │   │   ├── AppointmentCard.tsx
    │   │   │   │   │   ├── CallWidget.tsx
    │   │   │   │   │   ├── LeadCard.tsx
    │   │   │   │   │   ├── LeadScoreBadge.tsx
    │   │   │   │   │   └── SMSThread.tsx
    │   │   │   │   ├── logout-button.tsx
    │   │   │   │   ├── loose/
    │   │   │   │   │   ├── activity-feed.tsx
    │   │   │   │   │   ├── ai-negotiation-assistant.tsx
    │   │   │   │   │   ├── competitive-insights.tsx
    │   │   │   │   │   ├── customer-modal.tsx
    │   │   │   │   │   ├── customer-quick-actions.tsx
    │   │   │   │   │   ├── intelligent-inventory-manager.tsx
    │   │   │   │   │   ├── lead-distribution-config.tsx
    │   │   │   │   │   ├── lead-management-grid.tsx
    │   │   │   │   │   ├── lead-modal.tsx
    │   │   │   │   │   ├── metrics-grid.tsx
    │   │   │   │   │   ├── ml-performance-heatmap-fixed.tsx
    │   │   │   │   │   ├── ml-performance-heatmap.tsx
    │   │   │   │   │   ├── role-permissions-config.tsx
    │   │   │   │   │   ├── smart-crm-assistant.tsx
    │   │   │   │   │   ├── tracking-pixel.tsx
    │   │   │   │   │   ├── vehicle-modal.tsx
    │   │   │   │   │   ├── vin-decoder.tsx
    │   │   │   │   │   └── workflow-integration.tsx
    │   │   │   │   ├── search/
    │   │   │   │   │   ├── advanced-search.tsx
    │   │   │   │   │   ├── search-filters.tsx
    │   │   │   │   │   └── search-results.tsx
    │   │   │   │   ├── security/
    │   │   │   │   │   └── PIIDrawer.tsx
    │   │   │   │   ├── settings/
    │   │   │   │   │   ├── AuditLogTable.tsx
    │   │   │   │   │   ├── ColorPicker.tsx
    │   │   │   │   │   ├── ImageUploader.tsx
    │   │   │   │   │   ├── PermissionSelector.tsx
    │   │   │   │   │   ├── PermissionsMatrix.tsx
    │   │   │   │   │   ├── RichTextEditor.tsx
    │   │   │   │   │   ├── RolePresetCard.tsx
    │   │   │   │   │   ├── TestConnectionButton.tsx
    │   │   │   │   │   └── ToggleSwitch.tsx
    │   │   │   │   ├── shared/
    │   │   │   │   │   ├── CustomerProfileCard.tsx
    │   │   │   │   │   ├── DealCard.tsx
    │   │   │   │   │   ├── NotesPanel.tsx
    │   │   │   │   │   ├── QuickViewLinks.tsx
    │   │   │   │   │   ├── VINScanner.tsx
    │   │   │   │   │   └── VehicleDetailsCard.tsx
    │   │   │   │   ├── theme-toggle.tsx
    │   │   │   │   ├── ui/
    │   │   │   │   │   ├── alert-dialog.tsx
    │   │   │   │   │   ├── alert.tsx
    │   │   │   │   │   ├── badge.tsx
    │   │   │   │   │   ├── button.tsx
    │   │   │   │   │   ├── card.tsx
    │   │   │   │   │   ├── checkbox.tsx
    │   │   │   │   │   ├── collapsible-section.tsx
    │   │   │   │   │   ├── collapsible.tsx
    │   │   │   │   │   ├── dialog.tsx
    │   │   │   │   │   ├── dropdown-menu.tsx
    │   │   │   │   │   ├── form.tsx
    │   │   │   │   │   ├── input.tsx
    │   │   │   │   │   ├── label.tsx
    │   │   │   │   │   ├── module-header.tsx
    │   │   │   │   │   ├── pagination.tsx
    │   │   │   │   │   ├── select.tsx
    │   │   │   │   │   ├── skeleton.tsx
    │   │   │   │   │   ├── slider.tsx
    │   │   │   │   │   ├── switch.tsx
    │   │   │   │   │   ├── tab-navigation.tsx
    │   │   │   │   │   ├── table.tsx
    │   │   │   │   │   ├── textarea.tsx
    │   │   │   │   │   └── toggle.tsx
    │   │   │   │   ├── ui.ts
    │   │   │   │   ├── vehicle/
    │   │   │   │   │   └── VehicleLookup.tsx
    │   │   │   │   ├── widgets/
    │   │   │   │   │   ├── ActiveDealsWidget.tsx
    │   │   │   │   │   ├── DealershipOverviewWidget.tsx
    │   │   │   │   │   ├── HotLeadsWidget.tsx
    │   │   │   │   │   ├── PendingTasksWidget.tsx
    │   │   │   │   │   ├── SalesLeaderboardWidget.tsx
    │   │   │   │   │   ├── SystemHealthWidget.tsx
    │   │   │   │   │   └── TodayAppointmentsWidget.tsx
    │   │   │   │   └── workspace/
    │   │   │   │       ├── session-bar.tsx
    │   │   │   │       ├── simple-session-bar.tsx
    │   │   │   │       └── workspace-provider.tsx
    │   │   │   ├── config/
    │   │   │   │   ├── api.ts
    │   │   │   │   └── navigation.ts
    │   │   │   ├── contexts/
    │   │   │   │   ├── DealStudioContext.tsx
    │   │   │   │   ├── QuickViewContext.tsx
    │   │   │   │   └── theme-context.tsx
    │   │   │   ├── design-tokens/
    │   │   │   │   └── deal-studio.ts
    │   │   │   ├── features/
    │   │   │   │   ├── desking/
    │   │   │   │   │   ├── hooks.ts
    │   │   │   │   │   └── types.ts
    │   │   │   │   └── fi/
    │   │   │   │       ├── api.ts
    │   │   │   │       ├── components/
    │   │   │   │       │   ├── DealStatusBadge.tsx
    │   │   │   │       │   ├── DocumentViewer.tsx
    │   │   │   │       │   └── StipulationTracker.tsx
    │   │   │   │       └── pages/
    │   │   │   │           ├── ComplianceEngine.tsx
    │   │   │   │           ├── CreditApplication.tsx
    │   │   │   │           ├── CreditBureau.tsx
    │   │   │   │           ├── DealFunding.tsx
    │   │   │   │           ├── DealJacket.tsx
    │   │   │   │           ├── DocumentSigning.tsx
    │   │   │   │           ├── FIManagerDashboard.tsx
    │   │   │   │           ├── LenderSubmission.tsx
    │   │   │   │           ├── MenuPresentation.tsx
    │   │   │   │           └── ProductContracts.tsx
    │   │   │   ├── hooks/
    │   │   │   │   ├── dashboard/
    │   │   │   │   │   └── useDashboardLayout.ts
    │   │   │   │   ├── use-advanced-search.ts
    │   │   │   │   ├── use-debounced-value.ts
    │   │   │   │   ├── use-lead-socket.ts
    │   │   │   │   ├── use-pixel-tracker.ts
    │   │   │   │   ├── use-scroll-lock.ts
    │   │   │   │   ├── use-search.ts
    │   │   │   │   ├── use-workspace-integration.ts
    │   │   │   │   ├── useAuth.ts
    │   │   │   │   ├── useDealCalculation.ts
    │   │   │   │   ├── useDealStudioLauncher.ts
    │   │   │   │   ├── useInsightActions.ts
    │   │   │   │   ├── useInsightsQueue.ts
    │   │   │   │   ├── useIsMobile.ts
    │   │   │   │   ├── useLeadScore.ts
    │   │   │   │   ├── useLivePricing.ts
    │   │   │   │   ├── useNotifications.ts
    │   │   │   │   ├── usePaymentLock.ts
    │   │   │   │   ├── usePermissions.ts
    │   │   │   │   ├── usePricing.ts
    │   │   │   │   ├── useTaxQuote.ts
    │   │   │   │   └── useVINDecoder.ts
    │   │   │   ├── index-new.css
    │   │   │   ├── lib/
    │   │   │   │   ├── accountingApi.ts
    │   │   │   │   ├── api.ts
    │   │   │   │   ├── auth.ts
    │   │   │   │   ├── authUtils.ts
    │   │   │   │   ├── dashboard/
    │   │   │   │   │   ├── cardRegistry.ts
    │   │   │   │   │   └── resolveCards.ts
    │   │   │   │   ├── design-tokens.ts
    │   │   │   │   ├── email.ts
    │   │   │   │   ├── leadsApi.ts
    │   │   │   │   ├── mlService.ts
    │   │   │   │   ├── pixel-tracker.ts
    │   │   │   │   ├── pricingService.ts
    │   │   │   │   ├── queryClient.ts
    │   │   │   │   ├── scroll-lock.ts
    │   │   │   │   ├── settingsApi.ts
    │   │   │   │   ├── settingsSecurityApi.ts
    │   │   │   │   ├── settingsUsersApi.ts
    │   │   │   │   ├── templatesApi.ts
    │   │   │   │   ├── theme-utils.ts
    │   │   │   │   ├── theme.ts
    │   │   │   │   ├── userHomePath.ts
    │   │   │   │   └── utils.ts
    │   │   │   ├── modules/
    │   │   │   │   └── dashboard/
    │   │   │   │       ├── DashboardScreen.tsx
    │   │   │   │       ├── applyLayoutRecipe.ts
    │   │   │   │       ├── dashboardLoader.ts
    │   │   │   │       └── index.ts
    │   │   │   ├── pages/
    │   │   │   │   ├── accounting/
    │   │   │   │   │   ├── AccountingDashboard.tsx
    │   │   │   │   │   ├── AccountingLayout.tsx
    │   │   │   │   │   ├── BalanceSheet.tsx
    │   │   │   │   │   ├── CashFlowStatement.tsx
    │   │   │   │   │   ├── GLAccountForm.tsx
    │   │   │   │   │   ├── GLAccounts.tsx
    │   │   │   │   │   ├── JournalEntries.tsx
    │   │   │   │   │   ├── JournalEntryForm.tsx
    │   │   │   │   │   ├── PLStatement.tsx
    │   │   │   │   │   ├── Payroll.tsx
    │   │   │   │   │   ├── PayrollCalculation.tsx
    │   │   │   │   │   ├── TaxReports.tsx
    │   │   │   │   │   ├── accounting-dashboard.tsx
    │   │   │   │   │   ├── chart-of-accounts.tsx
    │   │   │   │   │   ├── deal-finalization.tsx
    │   │   │   │   │   ├── finance-reserves.tsx
    │   │   │   │   │   ├── monthly-close.tsx
    │   │   │   │   │   ├── reports.tsx
    │   │   │   │   │   ├── transactions.tsx
    │   │   │   │   │   └── vehicle-profit.tsx
    │   │   │   │   ├── accounting.tsx
    │   │   │   │   ├── admin/
    │   │   │   │   │   ├── communication-settings.tsx
    │   │   │   │   │   ├── comprehensive-settings.tsx
    │   │   │   │   │   ├── dealer-configuration.tsx
    │   │   │   │   │   ├── departments.tsx
    │   │   │   │   │   ├── integration-setup.tsx
    │   │   │   │   │   ├── lead-distribution.tsx
    │   │   │   │   │   ├── ml-developer-admin.tsx
    │   │   │   │   │   ├── ml-developer.tsx
    │   │   │   │   │   ├── ml-model-comparison.tsx
    │   │   │   │   │   ├── multi-store-management.tsx
    │   │   │   │   │   ├── multi-store.tsx
    │   │   │   │   │   ├── performance-tracking.tsx
    │   │   │   │   │   ├── role-management.tsx
    │   │   │   │   │   ├── role-presets.tsx
    │   │   │   │   │   ├── roles.tsx
    │   │   │   │   │   ├── security-center.tsx
    │   │   │   │   │   ├── system-configuration.tsx
    │   │   │   │   │   ├── system-health.tsx
    │   │   │   │   │   ├── system-settings.tsx
    │   │   │   │   │   ├── training-center.tsx
    │   │   │   │   │   ├── user-management.tsx
    │   │   │   │   │   ├── user-permissions.tsx
    │   │   │   │   │   ├── user-profile.tsx
    │   │   │   │   │   └── users.tsx
    │   │   │   │   ├── admin.tsx
    │   │   │   │   ├── analytics/
    │   │   │   │   │   ├── crm-analytics.tsx
    │   │   │   │   │   ├── customer-lifecycle.tsx
    │   │   │   │   │   └── dashboard.tsx
    │   │   │   │   ├── auth/
    │   │   │   │   │   ├── forgot-password.tsx
    │   │   │   │   │   └── reset-password.tsx
    │   │   │   │   ├── communications/
    │   │   │   │   │   ├── call-center.tsx
    │   │   │   │   │   ├── communication-center.tsx
    │   │   │   │   │   ├── demo.tsx
    │   │   │   │   │   ├── email-composer.tsx
    │   │   │   │   │   └── sms-inbox.tsx
    │   │   │   │   ├── communications.tsx
    │   │   │   │   ├── crm/
    │   │   │   │   │   ├── lead-pipeline.tsx
    │   │   │   │   │   └── pipeline.tsx
    │   │   │   │   ├── customers/
    │   │   │   │   │   ├── detail.tsx
    │   │   │   │   │   ├── phone-calls.tsx
    │   │   │   │   │   ├── profile.tsx
    │   │   │   │   │   └── texting-portal.tsx
    │   │   │   │   ├── customers.tsx
    │   │   │   │   ├── dashboard/
    │   │   │   │   │   ├── accounting.tsx
    │   │   │   │   │   ├── admin.tsx
    │   │   │   │   │   ├── developer.tsx
    │   │   │   │   │   ├── finance.tsx
    │   │   │   │   │   ├── inventory.tsx
    │   │   │   │   │   ├── role-landing.tsx
    │   │   │   │   │   ├── sales-alt.tsx
    │   │   │   │   │   ├── sales.tsx
    │   │   │   │   │   └── service.tsx
    │   │   │   │   ├── dashboard.tsx
    │   │   │   │   ├── deal-studio/
    │   │   │   │   │   ├── AICompanion.tsx
    │   │   │   │   │   ├── CustomerDossier.tsx
    │   │   │   │   │   ├── LiveSimulator.tsx
    │   │   │   │   │   └── index.tsx
    │   │   │   │   ├── deal-studio-demo.tsx
    │   │   │   │   ├── deal-studio-desktop-demo.tsx
    │   │   │   │   ├── deal-studio-mobile-demo.tsx
    │   │   │   │   ├── deals/
    │   │   │   │   │   └── deal-desk.tsx
    │   │   │   │   ├── deals.tsx
    │   │   │   │   ├── demo-quick-view.tsx
    │   │   │   │   ├── desking/
    │   │   │   │   │   ├── ApprovalAnalysis.tsx
    │   │   │   │   │   ├── CustomerCounter.tsx
    │   │   │   │   │   ├── DealCalculator.tsx
    │   │   │   │   │   ├── DealComparison.tsx
    │   │   │   │   │   ├── DeskingWorkspace.tsx
    │   │   │   │   │   └── InitialPencil.tsx
    │   │   │   │   ├── fi/
    │   │   │   │   │   ├── configuration.tsx
    │   │   │   │   │   ├── contracting.tsx
    │   │   │   │   │   ├── deal-jackets.tsx
    │   │   │   │   │   └── lender-submissions.tsx
    │   │   │   │   ├── finance/
    │   │   │   │   │   ├── compliance-manager.tsx
    │   │   │   │   │   ├── finance-reports.tsx
    │   │   │   │   │   ├── lenders.tsx
    │   │   │   │   │   └── rates.tsx
    │   │   │   │   ├── inventory/
    │   │   │   │   │   ├── TradeAppraisal.tsx
    │   │   │   │   │   ├── competitive-pricing.tsx
    │   │   │   │   │   ├── data-center.tsx
    │   │   │   │   │   ├── detail.tsx
    │   │   │   │   │   ├── lot-management.tsx
    │   │   │   │   │   ├── pricing.tsx
    │   │   │   │   │   ├── trade-appraisals.tsx
    │   │   │   │   │   └── vehicle-detail.tsx
    │   │   │   │   ├── inventory.tsx
    │   │   │   │   ├── landing.tsx
    │   │   │   │   ├── leads/
    │   │   │   │   │   ├── LeadDetail.tsx
    │   │   │   │   │   ├── LeadsDashboard.tsx
    │   │   │   │   │   ├── lead-management.tsx
    │   │   │   │   │   └── market-leads.tsx
    │   │   │   │   ├── login.tsx
    │   │   │   │   ├── misc/
    │   │   │   │   │   ├── DesignShowcase.tsx
    │   │   │   │   │   ├── auth-test.tsx
    │   │   │   │   │   ├── communication-demo.tsx
    │   │   │   │   │   ├── fi-dashboard.tsx
    │   │   │   │   │   ├── professional-deal-desk.tsx
    │   │   │   │   │   └── professional-deal-desk.tsx.backup
    │   │   │   │   ├── not-found.tsx
    │   │   │   │   ├── notes-demo.tsx
    │   │   │   │   ├── reports/
    │   │   │   │   │   ├── financial.tsx
    │   │   │   │   │   ├── inventory.tsx
    │   │   │   │   │   ├── sales.tsx
    │   │   │   │   │   └── service.tsx
    │   │   │   │   ├── reports.tsx
    │   │   │   │   ├── search/
    │   │   │   │   │   └── ai-smart.tsx
    │   │   │   │   ├── search.tsx
    │   │   │   │   ├── service/
    │   │   │   │   │   ├── appointments.tsx
    │   │   │   │   │   ├── history.tsx
    │   │   │   │   │   ├── parts.tsx
    │   │   │   │   │   ├── reports.tsx
    │   │   │   │   │   ├── schedule.tsx
    │   │   │   │   │   ├── service-orders.tsx
    │   │   │   │   │   └── service-overview.tsx
    │   │   │   │   ├── service.tsx
    │   │   │   │   ├── settings/
    │   │   │   │   │   ├── AnalyticsSettings.tsx
    │   │   │   │   │   ├── BrandingSettings.tsx
    │   │   │   │   │   ├── DataSettings.tsx
    │   │   │   │   │   ├── DealershipSettings.tsx
    │   │   │   │   │   ├── DeveloperSettings.tsx
    │   │   │   │   │   ├── FormsSettings.tsx
    │   │   │   │   │   ├── IntegrationsSettings.tsx
    │   │   │   │   │   ├── NotificationsSettings.tsx
    │   │   │   │   │   ├── PricingRulesSettings.tsx
    │   │   │   │   │   ├── SecuritySettings.tsx
    │   │   │   │   │   ├── SettingsLayout.tsx
    │   │   │   │   │   ├── UsersSettings.tsx
    │   │   │   │   │   └── useSettingsSection.ts
    │   │   │   │   ├── settings.tsx
    │   │   │   │   ├── showroom/
    │   │   │   │   │   └── showroom-manager.tsx
    │   │   │   │   ├── sitemap.tsx
    │   │   │   │   └── tools/
    │   │   │   │       └── workflow-assistant.tsx
    │   │   │   ├── screens/
    │   │   │   │   ├── deal/
    │   │   │   │   │   ├── DealStudioDesktop.tsx
    │   │   │   │   │   ├── README.md
    │   │   │   │   │   ├── components/
    │   │   │   │   │   │   └── PaymentPanel.tsx
    │   │   │   │   │   ├── hooks/
    │   │   │   │   │   │   └── usePaymentLock.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── showroom/
    │   │   │   │       └── ShowroomBoard.tsx
    │   │   │   ├── services/
    │   │   │   │   ├── aiDealService.ts
    │   │   │   │   ├── pricingApi.ts
    │   │   │   │   └── vinDecoder.ts
    │   │   │   ├── stores/
    │   │   │   │   ├── communications-store.ts
    │   │   │   │   ├── lead-dashboard-store.ts
    │   │   │   │   └── workspace-context.ts
    │   │   │   └── types/
    │   │   │       └── leads.ts
    │   │   ├── eslint.config.js
    │   │   ├── index.html
    │   │   ├── nginx.conf
    │   │   ├── package.json
    │   │   ├── public/
    │   │   │   └── aiq-logo.png
    │   │   ├── src/
    │   │   │   ├── App.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── ErrorBoundary.tsx
    │   │   │   │   ├── accounting/
    │   │   │   │   │   ├── AccountTree.tsx
    │   │   │   │   │   ├── BalanceDisplay.tsx
    │   │   │   │   │   ├── ExportButton.tsx
    │   │   │   │   │   ├── FinancialChart.tsx
    │   │   │   │   │   ├── JournalEntryLine.tsx
    │   │   │   │   │   ├── StatementHeader.tsx
    │   │   │   │   │   ├── crm-integration.tsx
    │   │   │   │   │   └── inventory-integration.tsx
    │   │   │   │   ├── admin/
    │   │   │   │   │   └── user-form.tsx
    │   │   │   │   ├── calculators/
    │   │   │   │   │   ├── GrossCalculator.tsx
    │   │   │   │   │   └── PaymentCalculator.tsx
    │   │   │   │   ├── common/
    │   │   │   │   │   └── TaxQuoteBadge.tsx
    │   │   │   │   ├── communications/
    │   │   │   │   │   ├── CalendarGrid.tsx
    │   │   │   │   │   ├── DispositionModal.tsx
    │   │   │   │   │   ├── KPIGroup.tsx
    │   │   │   │   │   ├── TemplatePicker.tsx
    │   │   │   │   │   └── UnifiedFilters.tsx
    │   │   │   │   ├── dashboard/
    │   │   │   │   │   ├── DashboardLayout.tsx
    │   │   │   │   │   └── DashboardWidget.tsx
    │   │   │   │   ├── deal-desk/
    │   │   │   │   │   ├── ai-assistant.tsx
    │   │   │   │   │   ├── ai-optimization-wrapper.tsx
    │   │   │   │   │   ├── fees-section.tsx
    │   │   │   │   │   ├── finance-section.tsx
    │   │   │   │   │   ├── kpi-cards.tsx
    │   │   │   │   │   ├── lender-matcher.tsx
    │   │   │   │   │   ├── payment-scenarios.tsx
    │   │   │   │   │   ├── products-section.tsx
    │   │   │   │   │   ├── profit-optimizer.tsx
    │   │   │   │   │   └── trade-section.tsx
    │   │   │   │   ├── deal-studio/
    │   │   │   │   │   ├── DealStudio.tsx
    │   │   │   │   │   ├── desktop/
    │   │   │   │   │   │   ├── AICompanionPanel.tsx
    │   │   │   │   │   │   ├── CenterPanel.tsx
    │   │   │   │   │   │   ├── CustomerDossierPanel.tsx
    │   │   │   │   │   │   ├── DealStudioDesktop.tsx
    │   │   │   │   │   │   ├── LeftPanel.tsx
    │   │   │   │   │   │   ├── LiveSimulatorPanel.tsx
    │   │   │   │   │   │   ├── RightPanel.tsx
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── mobile/
    │   │   │   │   │   │   ├── AICoachTab.tsx
    │   │   │   │   │   │   ├── ActionBar.tsx
    │   │   │   │   │   │   ├── CompactDossierHeader.tsx
    │   │   │   │   │   │   ├── DealStudioMobile.tsx
    │   │   │   │   │   │   ├── SimulatorTab.tsx
    │   │   │   │   │   │   ├── TabControl.tsx
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── shared/
    │   │   │   │   │   │   ├── AICoachCard.tsx
    │   │   │   │   │   │   ├── CustomerDetailModal.tsx
    │   │   │   │   │   │   ├── CustomerVehicleSelector.tsx
    │   │   │   │   │   │   ├── DealInputWithSlider.tsx
    │   │   │   │   │   │   ├── DealSlider.tsx
    │   │   │   │   │   │   ├── DealStructureSummary.tsx
    │   │   │   │   │   │   ├── FIProductSelector.tsx
    │   │   │   │   │   │   ├── LivePaymentDisplay.tsx
    │   │   │   │   │   │   ├── ProfitBadge.tsx
    │   │   │   │   │   │   ├── VehicleDetailModal.tsx
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   └── utils/
    │   │   │   │   │       └── generateChatSummary.ts
    │   │   │   │   ├── desking/
    │   │   │   │   │   ├── AIInsightPanel.tsx
    │   │   │   │   │   ├── DealTimelineTracker.tsx
    │   │   │   │   │   ├── GrossMeter.tsx
    │   │   │   │   │   ├── LenderRecommendationCard.tsx
    │   │   │   │   │   ├── PanelErrorBoundary.tsx
    │   │   │   │   │   ├── PaymentScenarioCard.tsx
    │   │   │   │   │   ├── PencilPrintPreview.tsx
    │   │   │   │   │   └── ProbabilityIndicator.tsx
    │   │   │   │   ├── enterprise/
    │   │   │   │   │   ├── advanced-reporting.tsx
    │   │   │   │   │   ├── ai-advanced-reporting.tsx
    │   │   │   │   │   ├── ai-customer-intelligence.tsx
    │   │   │   │   │   ├── ai-customer-lifecycle.tsx
    │   │   │   │   │   ├── ai-production-suite.tsx
    │   │   │   │   │   ├── ai-system-health.tsx
    │   │   │   │   │   ├── ai-unified-dashboard.tsx
    │   │   │   │   │   ├── ai-workflow-automation.tsx
    │   │   │   │   │   ├── customer-360-intelligence.tsx
    │   │   │   │   │   ├── customer-intelligence.tsx
    │   │   │   │   │   ├── production-suite.tsx
    │   │   │   │   │   ├── real-time-collaboration.tsx
    │   │   │   │   │   └── workflow-automation.tsx
    │   │   │   │   ├── examples/
    │   │   │   │   │   └── NotesExamples.tsx
    │   │   │   │   ├── forms/
    │   │   │   │   │   ├── CustomerEntryForm.tsx
    │   │   │   │   │   └── VehicleEntryForm.tsx
    │   │   │   │   ├── inventory/
    │   │   │   │   │   ├── audit-timeline.tsx
    │   │   │   │   │   ├── media-gallery.tsx
    │   │   │   │   │   └── valuation-card.tsx
    │   │   │   │   ├── layout/
    │   │   │   │   │   ├── app-shell.tsx
    │   │   │   │   │   ├── card-grid.tsx
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── responsive-table.tsx
    │   │   │   │   │   └── stats-grid.tsx
    │   │   │   │   ├── leads/
    │   │   │   │   │   ├── AIInsights.tsx
    │   │   │   │   │   ├── ActivityFeed.tsx
    │   │   │   │   │   ├── AppointmentCard.tsx
    │   │   │   │   │   ├── CallWidget.tsx
    │   │   │   │   │   ├── LeadCard.tsx
    │   │   │   │   │   ├── LeadScoreBadge.tsx
    │   │   │   │   │   └── SMSThread.tsx
    │   │   │   │   ├── logout-button.tsx
    │   │   │   │   ├── loose/
    │   │   │   │   │   ├── activity-feed.tsx
    │   │   │   │   │   ├── ai-negotiation-assistant.tsx
    │   │   │   │   │   ├── competitive-insights.tsx
    │   │   │   │   │   ├── customer-modal.tsx
    │   │   │   │   │   ├── customer-quick-actions.tsx
    │   │   │   │   │   ├── intelligent-inventory-manager.tsx
    │   │   │   │   │   ├── lead-distribution-config.tsx
    │   │   │   │   │   ├── lead-management-grid.tsx
    │   │   │   │   │   ├── lead-modal.tsx
    │   │   │   │   │   ├── metrics-grid.tsx
    │   │   │   │   │   ├── ml-performance-heatmap-fixed.tsx
    │   │   │   │   │   ├── ml-performance-heatmap.tsx
    │   │   │   │   │   ├── role-permissions-config.tsx
    │   │   │   │   │   ├── smart-crm-assistant.tsx
    │   │   │   │   │   ├── tracking-pixel.tsx
    │   │   │   │   │   ├── vehicle-modal.tsx
    │   │   │   │   │   ├── vin-decoder.tsx
    │   │   │   │   │   └── workflow-integration.tsx
    │   │   │   │   ├── search/
    │   │   │   │   │   ├── advanced-search.tsx
    │   │   │   │   │   ├── search-filters.tsx
    │   │   │   │   │   └── search-results.tsx
    │   │   │   │   ├── security/
    │   │   │   │   │   └── PIIDrawer.tsx
    │   │   │   │   ├── settings/
    │   │   │   │   │   ├── AuditLogTable.tsx
    │   │   │   │   │   ├── ColorPicker.tsx
    │   │   │   │   │   ├── ImageUploader.tsx
    │   │   │   │   │   ├── PermissionSelector.tsx
    │   │   │   │   │   ├── PermissionsMatrix.tsx
    │   │   │   │   │   ├── RichTextEditor.tsx
    │   │   │   │   │   ├── RolePresetCard.tsx
    │   │   │   │   │   ├── TestConnectionButton.tsx
    │   │   │   │   │   └── ToggleSwitch.tsx
    │   │   │   │   ├── shared/
    │   │   │   │   │   ├── CustomerProfileCard.tsx
    │   │   │   │   │   ├── DealCard.tsx
    │   │   │   │   │   ├── NotesPanel.tsx
    │   │   │   │   │   ├── QuickViewLinks.tsx
    │   │   │   │   │   ├── VINScanner.tsx
    │   │   │   │   │   └── VehicleDetailsCard.tsx
    │   │   │   │   ├── theme-toggle.tsx
    │   │   │   │   ├── ui/
    │   │   │   │   │   ├── alert-dialog.tsx
    │   │   │   │   │   ├── alert.tsx
    │   │   │   │   │   ├── badge.tsx
    │   │   │   │   │   ├── button.tsx
    │   │   │   │   │   ├── card.tsx
    │   │   │   │   │   ├── checkbox.tsx
    │   │   │   │   │   ├── collapsible-section.tsx
    │   │   │   │   │   ├── collapsible.tsx
    │   │   │   │   │   ├── dialog.tsx
    │   │   │   │   │   ├── dropdown-menu.tsx
    │   │   │   │   │   ├── form.tsx
    │   │   │   │   │   ├── input.tsx
    │   │   │   │   │   ├── label.tsx
    │   │   │   │   │   ├── module-header.tsx
    │   │   │   │   │   ├── pagination.tsx
    │   │   │   │   │   ├── select.tsx
    │   │   │   │   │   ├── skeleton.tsx
    │   │   │   │   │   ├── slider.tsx
    │   │   │   │   │   ├── switch.tsx
    │   │   │   │   │   ├── tab-navigation.tsx
    │   │   │   │   │   ├── table.tsx
    │   │   │   │   │   ├── textarea.tsx
    │   │   │   │   │   └── toggle.tsx
    │   │   │   │   ├── ui.ts
    │   │   │   │   ├── vehicle/
    │   │   │   │   │   └── VehicleLookup.tsx
    │   │   │   │   ├── widgets/
    │   │   │   │   │   ├── ActiveDealsWidget.tsx
    │   │   │   │   │   ├── DealershipOverviewWidget.tsx
    │   │   │   │   │   ├── HotLeadsWidget.tsx
    │   │   │   │   │   ├── PendingTasksWidget.tsx
    │   │   │   │   │   ├── SalesLeaderboardWidget.tsx
    │   │   │   │   │   ├── SystemHealthWidget.tsx
    │   │   │   │   │   └── TodayAppointmentsWidget.tsx
    │   │   │   │   └── workspace/
    │   │   │   │       ├── session-bar.tsx
    │   │   │   │       ├── simple-session-bar.tsx
    │   │   │   │       └── workspace-provider.tsx
    │   │   │   ├── config/
    │   │   │   │   ├── api.ts
    │   │   │   │   └── navigation.ts
    │   │   │   ├── contexts/
    │   │   │   │   ├── DealStudioContext.tsx
    │   │   │   │   ├── QuickViewContext.tsx
    │   │   │   │   └── theme-context.tsx
    │   │   │   ├── design-tokens/
    │   │   │   │   └── deal-studio.ts
    │   │   │   ├── features/
    │   │   │   │   ├── desking/
    │   │   │   │   │   ├── hooks.ts
    │   │   │   │   │   └── types.ts
    │   │   │   │   └── fi/
    │   │   │   │       ├── api.ts
    │   │   │   │       ├── components/
    │   │   │   │       │   ├── DealStatusBadge.tsx
    │   │   │   │       │   ├── DocumentViewer.tsx
    │   │   │   │       │   └── StipulationTracker.tsx
    │   │   │   │       └── pages/
    │   │   │   │           ├── ComplianceEngine.tsx
    │   │   │   │           ├── CreditApplication.tsx
    │   │   │   │           ├── CreditBureau.tsx
    │   │   │   │           ├── DealFunding.tsx
    │   │   │   │           ├── DealJacket.tsx
    │   │   │   │           ├── DocumentSigning.tsx
    │   │   │   │           ├── FIManagerDashboard.tsx
    │   │   │   │           ├── LenderSubmission.tsx
    │   │   │   │           ├── MenuPresentation.tsx
    │   │   │   │           └── ProductContracts.tsx
    │   │   │   ├── hooks/
    │   │   │   │   ├── dashboard/
    │   │   │   │   │   └── useDashboardLayout.ts
    │   │   │   │   ├── use-advanced-search.ts
    │   │   │   │   ├── use-debounced-value.ts
    │   │   │   │   ├── use-lead-socket.ts
    │   │   │   │   ├── use-pixel-tracker.ts
    │   │   │   │   ├── use-scroll-lock.ts
    │   │   │   │   ├── use-search.ts
    │   │   │   │   ├── use-workspace-integration.ts
    │   │   │   │   ├── useAuth.ts
    │   │   │   │   ├── useDealCalculation.ts
    │   │   │   │   ├── useDealStudioLauncher.ts
    │   │   │   │   ├── useInsightActions.ts
    │   │   │   │   ├── useInsightsQueue.ts
    │   │   │   │   ├── useIsMobile.ts
    │   │   │   │   ├── useLeadScore.ts
    │   │   │   │   ├── useLivePricing.ts
    │   │   │   │   ├── useNotifications.ts
    │   │   │   │   ├── usePaymentLock.ts
    │   │   │   │   ├── usePermissions.ts
    │   │   │   │   ├── usePricing.ts
    │   │   │   │   ├── useTaxQuote.ts
    │   │   │   │   └── useVINDecoder.ts
    │   │   │   ├── index-new.css
    │   │   │   ├── index.css
    │   │   │   ├── lib/
    │   │   │   │   ├── accountingApi.ts
    │   │   │   │   ├── api.ts
    │   │   │   │   ├── auth.ts
    │   │   │   │   ├── authUtils.ts
    │   │   │   │   ├── dashboard/
    │   │   │   │   │   ├── cardRegistry.ts
    │   │   │   │   │   └── resolveCards.ts
    │   │   │   │   ├── design-tokens.ts
    │   │   │   │   ├── email.ts
    │   │   │   │   ├── leadsApi.ts
    │   │   │   │   ├── mlService.ts
    │   │   │   │   ├── pixel-tracker.ts
    │   │   │   │   ├── pricingService.ts
    │   │   │   │   ├── queryClient.ts
    │   │   │   │   ├── scroll-lock.ts
    │   │   │   │   ├── settingsApi.ts
    │   │   │   │   ├── settingsSecurityApi.ts
    │   │   │   │   ├── settingsUsersApi.ts
    │   │   │   │   ├── templatesApi.ts
    │   │   │   │   ├── theme-utils.ts
    │   │   │   │   ├── theme.ts
    │   │   │   │   ├── userHomePath.ts
    │   │   │   │   └── utils.ts
    │   │   │   ├── main.tsx
    │   │   │   ├── modules/
    │   │   │   │   └── dashboard/
    │   │   │   │       ├── DashboardScreen.tsx
    │   │   │   │       ├── applyLayoutRecipe.ts
    │   │   │   │       ├── dashboardLoader.ts
    │   │   │   │       └── index.ts
    │   │   │   ├── pages/
    │   │   │   │   ├── accounting/
    │   │   │   │   │   ├── AccountingDashboard.tsx
    │   │   │   │   │   ├── AccountingLayout.tsx
    │   │   │   │   │   ├── BalanceSheet.tsx
    │   │   │   │   │   ├── CashFlowStatement.tsx
    │   │   │   │   │   ├── GLAccountForm.tsx
    │   │   │   │   │   ├── GLAccounts.tsx
    │   │   │   │   │   ├── JournalEntries.tsx
    │   │   │   │   │   ├── JournalEntryForm.tsx
    │   │   │   │   │   ├── PLStatement.tsx
    │   │   │   │   │   ├── Payroll.tsx
    │   │   │   │   │   ├── PayrollCalculation.tsx
    │   │   │   │   │   ├── TaxReports.tsx
    │   │   │   │   │   ├── accounting-dashboard.tsx
    │   │   │   │   │   ├── chart-of-accounts.tsx
    │   │   │   │   │   ├── deal-finalization.tsx
    │   │   │   │   │   ├── finance-reserves.tsx
    │   │   │   │   │   ├── monthly-close.tsx
    │   │   │   │   │   ├── reports.tsx
    │   │   │   │   │   ├── transactions.tsx
    │   │   │   │   │   └── vehicle-profit.tsx
    │   │   │   │   ├── accounting.tsx
    │   │   │   │   ├── admin/
    │   │   │   │   │   ├── communication-settings.tsx
    │   │   │   │   │   ├── comprehensive-settings.tsx
    │   │   │   │   │   ├── dealer-configuration.tsx
    │   │   │   │   │   ├── departments.tsx
    │   │   │   │   │   ├── integration-setup.tsx
    │   │   │   │   │   ├── lead-distribution.tsx
    │   │   │   │   │   ├── ml-developer-admin.tsx
    │   │   │   │   │   ├── ml-developer.tsx
    │   │   │   │   │   ├── ml-model-comparison.tsx
    │   │   │   │   │   ├── multi-store-management.tsx
    │   │   │   │   │   ├── multi-store.tsx
    │   │   │   │   │   ├── performance-tracking.tsx
    │   │   │   │   │   ├── role-management.tsx
    │   │   │   │   │   ├── role-presets.tsx
    │   │   │   │   │   ├── roles.tsx
    │   │   │   │   │   ├── security-center.tsx
    │   │   │   │   │   ├── system-configuration.tsx
    │   │   │   │   │   ├── system-health.tsx
    │   │   │   │   │   ├── system-settings.tsx
    │   │   │   │   │   ├── training-center.tsx
    │   │   │   │   │   ├── user-management.tsx
    │   │   │   │   │   ├── user-permissions.tsx
    │   │   │   │   │   ├── user-profile.tsx
    │   │   │   │   │   └── users.tsx
    │   │   │   │   ├── admin.tsx
    │   │   │   │   ├── analytics/
    │   │   │   │   │   ├── crm-analytics.tsx
    │   │   │   │   │   ├── customer-lifecycle.tsx
    │   │   │   │   │   └── dashboard.tsx
    │   │   │   │   ├── auth/
    │   │   │   │   │   ├── forgot-password.tsx
    │   │   │   │   │   └── reset-password.tsx
    │   │   │   │   ├── communications/
    │   │   │   │   │   ├── call-center.tsx
    │   │   │   │   │   ├── communication-center.tsx
    │   │   │   │   │   ├── demo.tsx
    │   │   │   │   │   ├── email-composer.tsx
    │   │   │   │   │   └── sms-inbox.tsx
    │   │   │   │   ├── communications.tsx
    │   │   │   │   ├── crm/
    │   │   │   │   │   ├── lead-pipeline.tsx
    │   │   │   │   │   └── pipeline.tsx
    │   │   │   │   ├── customers/
    │   │   │   │   │   ├── detail.tsx
    │   │   │   │   │   ├── phone-calls.tsx
    │   │   │   │   │   ├── profile.tsx
    │   │   │   │   │   └── texting-portal.tsx
    │   │   │   │   ├── customers.tsx
    │   │   │   │   ├── dashboard/
    │   │   │   │   │   ├── accounting.tsx
    │   │   │   │   │   ├── admin.tsx
    │   │   │   │   │   ├── developer.tsx
    │   │   │   │   │   ├── finance.tsx
    │   │   │   │   │   ├── inventory.tsx
    │   │   │   │   │   ├── role-landing.tsx
    │   │   │   │   │   ├── sales-alt.tsx
    │   │   │   │   │   ├── sales.tsx
    │   │   │   │   │   └── service.tsx
    │   │   │   │   ├── dashboard.tsx
    │   │   │   │   ├── deal-studio/
    │   │   │   │   │   ├── AICompanion.tsx
    │   │   │   │   │   ├── CustomerDossier.tsx
    │   │   │   │   │   ├── LiveSimulator.tsx
    │   │   │   │   │   └── index.tsx
    │   │   │   │   ├── deal-studio-demo.tsx
    │   │   │   │   ├── deal-studio-desktop-demo.tsx
    │   │   │   │   ├── deal-studio-mobile-demo.tsx
    │   │   │   │   ├── deals/
    │   │   │   │   │   └── deal-desk.tsx
    │   │   │   │   ├── deals.tsx
    │   │   │   │   ├── demo-quick-view.tsx
    │   │   │   │   ├── desking/
    │   │   │   │   │   ├── ApprovalAnalysis.tsx
    │   │   │   │   │   ├── CustomerCounter.tsx
    │   │   │   │   │   ├── DealCalculator.tsx
    │   │   │   │   │   ├── DealComparison.tsx
    │   │   │   │   │   ├── DeskingWorkspace.tsx
    │   │   │   │   │   └── InitialPencil.tsx
    │   │   │   │   ├── fi/
    │   │   │   │   │   ├── configuration.tsx
    │   │   │   │   │   ├── contracting.tsx
    │   │   │   │   │   ├── deal-jackets.tsx
    │   │   │   │   │   └── lender-submissions.tsx
    │   │   │   │   ├── finance/
    │   │   │   │   │   ├── compliance-manager.tsx
    │   │   │   │   │   ├── finance-reports.tsx
    │   │   │   │   │   ├── lenders.tsx
    │   │   │   │   │   └── rates.tsx
    │   │   │   │   ├── inventory/
    │   │   │   │   │   ├── TradeAppraisal.tsx
    │   │   │   │   │   ├── competitive-pricing.tsx
    │   │   │   │   │   ├── data-center.tsx
    │   │   │   │   │   ├── detail.tsx
    │   │   │   │   │   ├── lot-management.tsx
    │   │   │   │   │   ├── pricing.tsx
    │   │   │   │   │   ├── trade-appraisals.tsx
    │   │   │   │   │   └── vehicle-detail.tsx
    │   │   │   │   ├── inventory.tsx
    │   │   │   │   ├── landing.tsx
    │   │   │   │   ├── leads/
    │   │   │   │   │   ├── LeadDetail.tsx
    │   │   │   │   │   ├── LeadsDashboard.tsx
    │   │   │   │   │   ├── lead-management.tsx
    │   │   │   │   │   └── market-leads.tsx
    │   │   │   │   ├── login.tsx
    │   │   │   │   ├── misc/
    │   │   │   │   │   ├── DesignShowcase.tsx
    │   │   │   │   │   ├── auth-test.tsx
    │   │   │   │   │   ├── communication-demo.tsx
    │   │   │   │   │   ├── fi-dashboard.tsx
    │   │   │   │   │   ├── professional-deal-desk.tsx
    │   │   │   │   │   └── professional-deal-desk.tsx.backup
    │   │   │   │   ├── not-found.tsx
    │   │   │   │   ├── notes-demo.tsx
    │   │   │   │   ├── reports/
    │   │   │   │   │   ├── financial.tsx
    │   │   │   │   │   ├── inventory.tsx
    │   │   │   │   │   ├── sales.tsx
    │   │   │   │   │   └── service.tsx
    │   │   │   │   ├── reports.tsx
    │   │   │   │   ├── search/
    │   │   │   │   │   └── ai-smart.tsx
    │   │   │   │   ├── search.tsx
    │   │   │   │   ├── service/
    │   │   │   │   │   ├── appointments.tsx
    │   │   │   │   │   ├── history.tsx
    │   │   │   │   │   ├── parts.tsx
    │   │   │   │   │   ├── reports.tsx
    │   │   │   │   │   ├── schedule.tsx
    │   │   │   │   │   ├── service-orders.tsx
    │   │   │   │   │   └── service-overview.tsx
    │   │   │   │   ├── service.tsx
    │   │   │   │   ├── settings/
    │   │   │   │   │   ├── AnalyticsSettings.tsx
    │   │   │   │   │   ├── BrandingSettings.tsx
    │   │   │   │   │   ├── DataSettings.tsx
    │   │   │   │   │   ├── DealershipSettings.tsx
    │   │   │   │   │   ├── DeveloperSettings.tsx
    │   │   │   │   │   ├── FormsSettings.tsx
    │   │   │   │   │   ├── IntegrationsSettings.tsx
    │   │   │   │   │   ├── NotificationsSettings.tsx
    │   │   │   │   │   ├── PricingRulesSettings.tsx
    │   │   │   │   │   ├── SecuritySettings.tsx
    │   │   │   │   │   ├── SettingsLayout.tsx
    │   │   │   │   │   ├── UsersSettings.tsx
    │   │   │   │   │   └── useSettingsSection.ts
    │   │   │   │   ├── settings.tsx
    │   │   │   │   ├── showroom/
    │   │   │   │   │   └── showroom-manager.tsx
    │   │   │   │   ├── sitemap.tsx
    │   │   │   │   └── tools/
    │   │   │   │       └── workflow-assistant.tsx
    │   │   │   ├── routes/
    │   │   │   │   └── index.tsx
    │   │   │   ├── screens/
    │   │   │   │   ├── deal/
    │   │   │   │   │   ├── DealStudioDesktop.tsx
    │   │   │   │   │   ├── README.md
    │   │   │   │   │   ├── components/
    │   │   │   │   │   │   └── PaymentPanel.tsx
    │   │   │   │   │   ├── hooks/
    │   │   │   │   │   │   └── usePaymentLock.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── showroom/
    │   │   │   │       └── ShowroomBoard.tsx
    │   │   │   ├── services/
    │   │   │   │   ├── aiDealService.ts
    │   │   │   │   ├── pricingApi.ts
    │   │   │   │   └── vinDecoder.ts
    │   │   │   ├── stores/
    │   │   │   │   ├── communications-store.ts
    │   │   │   │   ├── lead-dashboard-store.ts
    │   │   │   │   └── workspace-context.ts
    │   │   │   ├── styles/
    │   │   │   │   ├── design-tokens.ts
    │   │   │   │   └── global.css
    │   │   │   └── types/
    │   │   │       └── leads.ts
    │   │   ├── tailwind.config.js
    │   │   ├── tsconfig.json
    │   │   └── vite.config.ts
    │   ├── frontend-dev/
    │   │   ├── index.html
    │   │   ├── package.json
    │   │   ├── postcss.config.js
    │   │   ├── src/
    │   │   │   ├── App.tsx
    │   │   │   ├── components/
    │   │   │   │   ├── layout/
    │   │   │   │   │   └── AppShell.tsx
    │   │   │   │   └── ui/
    │   │   │   │       ├── button.tsx
    │   │   │   │       └── card.tsx
    │   │   │   ├── index.css
    │   │   │   ├── lib/
    │   │   │   │   └── utils.ts
    │   │   │   ├── main.tsx
    │   │   │   ├── pages/
    │   │   │   │   ├── home.tsx
    │   │   │   │   ├── not-found.tsx
    │   │   │   │   └── settings.tsx
    │   │   │   ├── routes.ts
    │   │   │   └── types/
    │   │   │       └── navigation.ts
    │   │   ├── tsconfig.json
    │   │   └── vite.config.ts
    │   ├── ml_backend/
    │   │   ├── Dockerfile
    │   │   ├── config/
    │   │   │   └── scoring.yaml
    │   │   ├── config.py
    │   │   ├── docker-compose.yml
    │   │   ├── main.py
    │   │   ├── models/
    │   │   │   ├── __init__.py
    │   │   │   ├── feature_engineering.py
    │   │   │   └── price_model.py
    │   │   ├── pipeline/
    │   │   │   ├── __init__.py
    │   │   │   ├── retrain.py
    │   │   │   └── run_pipeline.py
    │   │   ├── requirements.txt
    │   │   ├── scraper/
    │   │   │   ├── __init__.py
    │   │   │   ├── autotrader.py
    │   │   │   ├── base_scraper.py
    │   │   │   └── cargurus.py
    │   │   ├── services/
    │   │   │   ├── __init__.py
    │   │   │   ├── deal_optimizer.py
    │   │   │   ├── inventory_optimizer.py
    │   │   │   ├── lead_scorer.py
    │   │   │   └── pricing_service.py
    │   │   ├── ui/
    │   │   │   ├── dashboard.py
    │   │   │   └── flask_api.py
    │   │   └── utils/
    │   │       ├── __init__.py
    │   │       ├── data_storage.py
    │   │       └── deduplication.py
    │   ├── pricing-rust/
    │   │   ├── Cargo.lock
    │   │   ├── Cargo.toml
    │   │   ├── Dockerfile
    │   │   ├── buf.gen.yaml
    │   │   ├── buf.yaml
    │   │   ├── build.rs
    │   │   ├── proto/
    │   │   │   └── pricing/
    │   │   │       └── v1/
    │   │   │           └── pricing.proto
    │   │   └── src/
    │   │       ├── main.rs
    │   │       ├── proto/
    │   │       │   └── mod.rs
    │   │       └── service.rs
    │   └── worker/
    │       ├── Dockerfile
    │       ├── index.js
    │       └── package.json
    ├── backups/
    │   └── frontend-src-20251106-195100.tar.gz
    ├── components.json
    ├── deploy-command-center.sh*
    ├── docker-compose.yml
    ├── docs/
    │   ├── CHANGELOG.md
    │   ├── DOCUMENTATION_INDEX.md
    │   ├── DOCUMENTATION_STATUS_REPORT.md
    │   ├── GLOSSARY.md
    │   ├── IMPLEMENTATION_SUMMARY.md
    │   ├── README.md
    │   ├── SAFE_OPERATIONS.md
    │   ├── architecture/
    │   │   ├── AGENTS.md
    │   │   ├── ARCHITECTURE.md
    │   │   ├── ARCHITECTURE_GUIDE.md
    │   │   ├── CLAUDE.md
    │   │   ├── CRM-TIMELINE-ARCHITECTURE.md
    │   │   ├── DB_SCHEMA_AUDIT.md
    │   │   ├── MULTITENANCY_AI_ARCHITECTURE.md
    │   │   ├── PROJECT_CONTEXT.md
    │   │   ├── REDIS_AUDIT.md
    │   │   ├── ROLE_BASED_DASHBOARD_AUDIT.md
    │   │   ├── RUST_SERVICES_AUDIT.md
    │   │   ├── Step3.txt
    │   │   ├── Step4.txt
    │   │   ├── Step5.txt
    │   │   ├── Step6.txt
    │   │   ├── accounting-dashboard.jsx
    │   │   ├── automotive-desking-ui.jsx
    │   │   ├── comprehensive-schema.prisma
    │   │   ├── crm-customer-dashboard.jsx
    │   │   └── inventory-management-ui.jsx
    │   ├── archive/
    │   │   ├── duplicates/
    │   │   │   ├── AGENTS.md
    │   │   │   ├── Buildguide.md
    │   │   │   ├── DOCUMENTATION.md
    │   │   │   ├── INDEX.md
    │   │   │   ├── QUICKSTART.md
    │   │   │   ├── README 2.md
    │   │   │   └── implementation-guide.md
    │   │   ├── outdated/
    │   │   │   ├── ARCHITECTURAL_ISSUES_ANALYSIS.md
    │   │   │   ├── COMPONENT_LIBRARY_COMPLETE.md
    │   │   │   ├── COMPONENT_LIBRARY_STATUS.md
    │   │   │   ├── DASHBOARD_DEPLOYMENT.md
    │   │   │   ├── DEPLOYMENT.md
    │   │   │   ├── DEPLOYMENT_FIXES_AND_ARCHITECTURE_PLAN.md
    │   │   │   ├── DEPLOYMENT_SOLUTION.md
    │   │   │   ├── DESIGN_SYSTEM_IMPLEMENTATION.md
    │   │   │   ├── FRONTEND-COMPONENTS-PLAN.md
    │   │   │   ├── ROUTING_NIGHTMARE_FIX.md
    │   │   │   ├── UI-DESIGN-SYSTEM-COMPLETE.md
    │   │   │   ├── infra-plan.md
    │   │   │   └── menu-structure.md
    │   │   ├── planning/
    │   │   │   └── 2025-11-05/
    │   │   │       ├── DASHBOARD_IMPLEMENTATION_STATUS.md
    │   │   │       ├── README.md
    │   │   │       └── ROLE_BASED_DASHBOARD_ARCHITECTURE.md
    │   │   └── session-logs/
    │   │       ├── 2025-11-05/
    │   │       │   ├── AUTOLYTIQ_401_ERROR_ANALYSIS.md
    │   │       │   ├── CODE-IMPROVEMENTS-SUMMARY.md
    │   │       │   ├── DEPLOYMENT-COMPLETE-SUMMARY.md
    │   │       │   ├── FIXES_APPLIED.md
    │   │       │   ├── PRISMA_ENGINE_AND_SEED_ANALYSIS.md
    │   │       │   └── sprint5-6-audit.md
    │   │       └── 2025-11-06/
    │   │           ├── CLEANUP_EXECUTION_PLAN.md
    │   │           ├── CLEANUP_PROGRESS.md
    │   │           ├── CLEANUP_SESSION_SUMMARY.md
    │   │           ├── COMPONENT_MIGRATION_STATUS.md
    │   │           ├── CRITICAL_BUG_REPORT.md
    │   │           ├── DOCKER_BUILD_SUCCESS.md
    │   │           ├── FIXES_SUMMARY.md
    │   │           ├── FRONTEND_AUDIT_REPORT.md
    │   │           ├── FRONTEND_CLEANUP_SUMMARY.md
    │   │           ├── FRONTEND_MIGRATION_LOG.md
    │   │           ├── MIGRATION_COMPLETE.md
    │   │           ├── MIGRATION_EXECUTION_PLAN.md
    │   │           ├── OVERLAP_MATRIX.md
    │   │           ├── PHASE_2_SUMMARY.md
    │   │           ├── PHASE_4_5_IMPLEMENTATION.md
    │   │           ├── STATUS_UPDATE.md
    │   │           └── STREAMLINED_MIGRATION.md
    │   ├── deployment/
    │   │   ├── CI_PIPELINE_PLAN.md
    │   │   ├── DEPLOYMENT-VERIFICATION-CHECKLIST.md
    │   │   ├── DEPLOYMENT_GUIDE.md
    │   │   ├── DEPLOYMENT_READINESS.md
    │   │   ├── DEPLOYMENT_STATUS.md
    │   │   ├── DNS-CONFIGURATION.md
    │   │   ├── ENV_MATRIX.md
    │   │   ├── GITHUB_ACTIONS_WORKFLOWS.md
    │   │   ├── K8S_READINESS.md
    │   │   └── QUICK_START.md
    │   ├── desking.postman.json
    │   ├── features/
    │   │   ├── CRM-ADAPTIVE-LEAD-SCORING.md
    │   │   ├── CRM-CAPABILITIES-ANALYSIS.md
    │   │   ├── CUSTOM-PERMISSIONS-IMPLEMENTATION.md
    │   │   ├── ENTERPRISE_CRM_EXTENSION.md
    │   │   ├── ML-DESKING-VERIFICATION-RESULTS.md
    │   │   └── REVOLUTIONARY-CRM-IMPLEMENTATION-PLAN.md
    │   ├── guides/
    │   │   ├── SCHEMA_MIGRATION_GUIDE.md
    │   │   ├── TROUBLESHOOTING.md
    │   │   └── provider_setup_walkthrough.md
    │   ├── operations/
    │   │   ├── AUDIT_SUMMARY.md
    │   │   ├── SECURITY-SUMMARY.md
    │   │   ├── SYSTEM_STATUS.md
    │   │   ├── ops.md
    │   │   └── secrets.md
    │   ├── postman/
    │   │   └── fi-module.postman_collection.json
    │   ├── resources/
    │   │   ├── assets/
    │   │   │   ├── 60460DF2-3086-47E0-AF52-CED6FEB5E75C_1753166830119.png
    │   │   │   ├── IMG_0458_1760132680592.jpeg
    │   │   │   ├── IMG_0459_1760191968788.jpeg
    │   │   │   ├── IMG_0460_1760191968788.jpeg
    │   │   │   ├── IMG_0461_1760191968788.png
    │   │   │   ├── IMG_0462_1760191968788.png
    │   │   │   ├── IMG_0463_1760191968788.jpeg
    │   │   │   ├── IMG_0464_1760191968788.png
    │   │   │   ├── IMG_0465_1760191968788.png
    │   │   │   ├── IMG_0466_1760191968788.png
    │   │   │   ├── IMG_2785_1752796016992.jpeg
    │   │   │   ├── IMG_5834_1752796016992.dng
    │   │   │   ├── IMG_7634_1752786208719.jpeg
    │   │   │   ├── IMG_7634_1752786852660.jpeg
    │   │   │   ├── IMG_8572_1752786852661.dng
    │   │   │   ├── IMG_9636_1752785632694.png
    │   │   │   ├── IMG_9636_1752798024083.png
    │   │   │   ├── IMG_9641_1752812872696.jpeg
    │   │   │   ├── IMG_9648_1752881847517.jpeg
    │   │   │   ├── IMG_9660_1752967192293.jpeg
    │   │   │   ├── IMG_9668_1753122277113.png
    │   │   │   ├── IMG_9680_1753166272785.jpeg
    │   │   │   ├── IMG_9683_1753185474939.jpeg
    │   │   │   ├── IMG_9684_1753188694780.jpeg
    │   │   │   ├── IMG_9692_1753301970774.png
    │   │   │   ├── IMG_9693_1753301970774.png
    │   │   │   ├── Pasted--Causal-Aware-MLOps-System-Technical-Brief-for-DevOps-Executive-Summary-We-ve-architected-a-n-1753919324383_1753919324383.txt
    │   │   │   ├── Pasted--DMD-Dealership-Management-Dashboard-OS-This-system-provides-dealerships-with-an-intuitive-cen-1752769338691_1752769338691.txt
    │   │   │   ├── Pasted--DOCTYPE-html-html-xmlns-http-www-w3-org-1999-xhtml-class-t-chrome-t-chrome101-head-meta-c-1752967662601_1752967662604.txt
    │   │   │   ├── Pasted--Now-you-re-building-the-Deal-Desk-nerve-center-the-master-deal-screen-that-mirrors-what-CDK-Re-1752868560047_1752868560047.txt
    │   │   │   ├── Pasted--Security-and-Performance-Enhancements-import-CryptoJS-from-crypto-js-import-debounce-f-1753204929930_1753204929931.txt
    │   │   │   ├── Pasted-1-Inventory-Table-View-Searchable-Clickable-Display-a-searchable-and-filterable-list-of-vehic-1752813656319_1752813656319.txt
    │   │   │   ├── Pasted-Absolutely-You-re-asking-for-a-high-level-architecture-and-UX-brief-for-building-a-true-Showroom-Ma-1752951494830_1752951494831.txt
    │   │   │   ├── Pasted-Ah-now-we-re-getting-to-the-root-of-it-Your-app-is-likely-suffering-from-dual-rendering-of-the-s-1753191575615_1753191575615.txt
    │   │   │   ├── Pasted-Crystal-clear-you-re-talking-about-the-true-hub-and-spoke-architecture-that-those-top-tier-platfor-1753202579725_1753202579726.txt
    │   │   │   ├── Pasted-Got-it-We-won-t-touch-your-logic-or-wiring-You-want-the-missing-desk-F-I-fields-a-clean-m-1760241454514_1760241454514.txt
    │   │   │   ├── Pasted-Here-are-key-areas-to-focus-on-for-elevating-your-dealer-management-platform-to-enterprise-grade--1753988379216_1753988379216.txt
    │   │   │   ├── Pasted-Here-s-a-comprehensive-checklist-for-debugging-ML-AI-integration-issues-in-your-Next-js-Python-set-1753989122254_1753989122255.txt
    │   │   │   ├── Pasted-Here-s-a-tight-end-to-end-agent-prompt-you-can-paste-into-your-build-agent-It-tells-it-what-to-del-1760135309703_1760135309703.txt
    │   │   │   ├── Pasted-I-can-see-you-re-encountering-PostgreSQL-unique-constraint-violations-when-trying-to-insert-vehicles-1760822741332_1760822741332.txt
    │   │   │   ├── Pasted-Let-s-take-the-brakes-off-and-show-what-a-truly-next-gen-dealership-enterprise-automotive-platform-c-1753155912422_1753155912423.txt
    │   │   │   ├── Pasted-Now-you-re-building-true-enterprise-compliance-heavy-dealer-F-I-automation-the-kind-of-feature-that-1753158041799_1753158041799.txt
    │   │   │   ├── Pasted-Now-you-re-talking-about-building-a-true-AI-powered-automotive-lead-engine-a-feature-that-would-mak-1753811833056_1753811833056.txt
    │   │   │   ├── Pasted-Perfect-You-re-looking-for-a-Total-Functionality-Enforcement-Protocol-prompt-one-that-forces-your-1753860993873_1753860993873.txt
    │   │   │   ├── Pasted-Perfect-now-you-re-thinking-like-an-actual-enterprise-architect-You-want-a-comprehensive-role-base-1753106727699_1753106727700.txt
    │   │   │   ├── Pasted-Phenomenal-advanced-question-exactly-the-sort-of-challenge-that-defines-modern-next-gen-dealer-pl-1753129065033_1753129065034.txt
    │   │   │   ├── Pasted-This-is-an-advanced-pain-point-for-anyone-building-a-complex-codebase-with-AI-or-rapid-prototyping--1753196854661_1753196854662.txt
    │   │   │   ├── Pasted-This-is-exactly-the-sort-of-explicit-canonical-architecture-doc-that-actually-enables-a-hyper-intel-1753861427430_1753861427430.txt
    │   │   │   ├── Pasted-To-build-an-enterprise-grade-dealership-software-suite-you-would-use-a-cloud-native-microservices--1753223188194_1753223188194.txt
    │   │   │   ├── Pasted-Understood-You-are-orchestrating-continuous-real-time-retraining-of-ML-models-using-live-web-scrap-1753892806790_1753892806790.txt
    │   │   │   ├── Pasted-You-are-Repo-Surgeon-Objective-Reconcile-routes-imports-and-API-endpoints-remove-duplicates--1760123003275_1760123003275.txt
    │   │   │   ├── Pasted-You-need-a-ML-Operations-MLOps-dashboard-here-s-how-to-architect-this-for-your-dealer-manage-1753989101729_1753989101729.txt
    │   │   │   ├── Pasted-You-re-hitting-on-the-core-issue-the-interface-needs-to-match-how-dealership-staff-actually-thin-1753988389029_1753988389029.txt
    │   │   │   ├── Pasted-You-want-an-instruction-or-meta-prompt-that-is-so-explicit-and-robust-it-drives-your-AI-agent-in-1753860757042_1753860757043.txt
    │   │   │   ├── Pasted-import-React-useCallback-useMemo-from-react-import-Menu-X-ChevronLeft-Ch-1753199942501_1753199942502.txt
    │   │   │   ├── Pasted-import-React-useState-useEffect-from-react-import-UserPlus-Car-Calculator-FileSignatur-1753212160516_1753212160516.txt
    │   │   │   ├── Pasted-import-Users-Car-Calculator-FileText-UserPlus-Search-PlusCircle-Settings-BarChart3-Clipbo-1753212121871_1753212121872.txt
    │   │   │   ├── Pasted-import-Users-Car-Calculator-FileText-UserPlus-Search-PlusCircle-Settings-BarChart3-Clipbo-1753212131725_1753212131726.txt
    │   │   │   ├── accounting-dashboard_1760585742687.jsx
    │   │   │   ├── automotive-desking-ui_1760585742687.jsx
    │   │   │   ├── canon_audit_1760209573794.mjs
    │   │   │   ├── crm-customer-dashboard_1760585742687.jsx
    │   │   │   ├── image_1752884154368.png
    │   │   │   ├── image_1752949007532.png
    │   │   │   ├── image_1752952459871.png
    │   │   │   ├── image_1753118769224.png
    │   │   │   ├── image_1753118884387.png
    │   │   │   ├── image_1753219659198.png
    │   │   │   ├── image_1753219689729.png
    │   │   │   ├── image_1753219729347.png
    │   │   │   ├── image_1753287453522.png
    │   │   │   ├── image_1753287500388.png
    │   │   │   ├── image_1753287521625.png
    │   │   │   ├── image_1753825227026.png
    │   │   │   └── inventory-management-ui_1760585742687.jsx
    │   │   └── route-truth.yml
    │   ├── specs/
    │   │   ├── ACCOUNTING_FINANCE_SYSTEM.md
    │   │   ├── DATA_ENTRY_SYSTEM.md
    │   │   ├── DEAL_STUDIO_DESIGN_PLAN.md
    │   │   ├── INSIGHT_RULES_ENGINE.md
    │   │   ├── INTELLIGENT_SEARCH_ARCHITECTURE.md
    │   │   ├── INVENTORY_INTEGRATION_MAP.md
    │   │   ├── PLATFORM_GAP_ANALYSIS.md
    │   │   ├── TEKION_INSPIRED_ROADMAP.md
    │   │   └── VIN_DECODER_IMPLEMENTATION.md
    │   └── ui/
    │       ├── COLOR_ACCESSIBILITY.md
    │       ├── COMPONENT_LIBRARY.md
    │       ├── COMPONENT_MIGRATION_PLAN.md
    │       ├── LAYOUT_PRESETS.md
    │       ├── MOBILE_COMPONENTS_GUIDE.md
    │       ├── NOTES_COMPONENT_GUIDE.md
    │       ├── PAGE_MIGRATION_GUIDE.md
    │       └── ROUTER_COMPARISON.md
    ├── docs_backup_20251107.tgz
    ├── infrastructure/
    │   ├── docker/
    │   │   ├── Dockerfile.backend
    │   │   ├── Dockerfile.frontend
    │   │   ├── Dockerfile.ml
    │   │   ├── clickhouse-init/
    │   │   ├── init-scripts/
    │   │   ├── models/
    │   │   ├── nginx/
    │   │   │   ├── frontend.conf
    │   │   │   ├── nginx.conf
    │   │   │   ├── postgres-stream.conf
    │   │   │   └── ssl/
    │   │   └── uploads/
    │   ├── k8s/
    │   │   ├── dev/
    │   │   │   ├── README.md
    │   │   │   ├── backend-configmap.yaml
    │   │   │   ├── backend-deployment.yaml
    │   │   │   ├── backend-secrets.yaml
    │   │   │   ├── backend-service.yaml
    │   │   │   ├── frontend-deployment.yaml
    │   │   │   ├── frontend-service.yaml
    │   │   │   ├── namespace.yaml
    │   │   │   ├── postgres-secret.yaml
    │   │   │   ├── postgres-service.yaml
    │   │   │   └── postgres-statefulset.yaml
    │   │   └── production/
    │   │       ├── API-ROUTES.md
    │   │       ├── README.md
    │   │       ├── backend-deployment.yaml
    │   │       ├── celery-worker-deployment.yaml
    │   │       ├── clusterissuer.yaml
    │   │       ├── frontend-deployment.yaml
    │   │       ├── grafana-stack.yaml
    │   │       ├── helm/
    │   │       │   ├── backend/
    │   │       │   │   ├── Chart.yaml
    │   │       │   │   ├── templates/
    │   │       │   │   │   ├── _helpers.tpl
    │   │       │   │   │   ├── configmap.yaml
    │   │       │   │   │   ├── deployment.yaml
    │   │       │   │   │   ├── hpa.yaml
    │   │       │   │   │   └── service.yaml
    │   │       │   │   └── values.yaml
    │   │       │   ├── frontend/
    │   │       │   │   ├── Chart.yaml
    │   │       │   │   ├── templates/
    │   │       │   │   │   ├── _helpers.tpl
    │   │       │   │   │   ├── deployment.yaml
    │   │       │   │   │   ├── hpa.yaml
    │   │       │   │   │   ├── ingress.yaml
    │   │       │   │   │   └── service.yaml
    │   │       │   │   └── values.yaml
    │   │       │   ├── pricing-rust/
    │   │       │   │   ├── Chart.yaml
    │   │       │   │   ├── templates/
    │   │       │   │   │   ├── _helpers.tpl
    │   │       │   │   │   ├── deployment.yaml
    │   │       │   │   │   ├── hpa.yaml
    │   │       │   │   │   └── service.yaml
    │   │       │   │   └── values.yaml
    │   │       │   └── worker/
    │   │       │       ├── Chart.yaml
    │   │       │       ├── templates/
    │   │       │       │   ├── _helpers.tpl
    │   │       │       │   └── deployment.yaml
    │   │       │       └── values.yaml
    │   │       ├── hpa.yaml
    │   │       ├── ingress.yaml
    │   │       ├── manifests/
    │   │       │   └── prisma-migrate-job.yaml
    │   │       ├── ml-service-deployment.yaml
    │   │       ├── namespace.yaml
    │   │       ├── network-policy.yaml
    │   │       ├── nginx-security-config.yaml
    │   │       ├── node-exporter-daemonset.yaml
    │   │       ├── postgres-deployment.yaml
    │   │       ├── prisma-migrate-job.yaml
    │   │       ├── prometheus-stack.yaml
    │   │       ├── pvc.yaml
    │   │       ├── redis-deployment.yaml
    │   │       ├── rust-comm-service-deployment.yaml
    │   │       ├── rust-pricing-deployment.yaml
    │   │       └── scoring-configmap.yaml
    │   ├── monitoring/
    │   │   ├── alerts.yml
    │   │   ├── grafana/
    │   │   │   ├── dashboards/
    │   │   │   └── provisioning/
    │   │   │       ├── dashboards/
    │   │   │       │   └── default.yml
    │   │   │       └── datasources/
    │   │   │           └── prometheus.yml
    │   │   ├── grafana-dashboards/
    │   │   │   └── dms-overview.json
    │   │   ├── grafana-datasources/
    │   │   │   └── prometheus.yaml
    │   │   └── prometheus.yml
    │   └── scripts/
    │       ├── backup-db.sh*
    │       ├── deploy.sh*
    │       └── restore-db.sh*
    ├── jest.config.ts
    ├── k8s-migrate-job.yaml
    ├── k8s-seed-job-psql.yaml
    ├── k8s-seed-job.yaml
    ├── k8s-snapshot-20251103-172610/
    │   ├── RESTORE-GUIDE.md
    │   ├── autolytiq-prod-all.yaml
    │   ├── cluster-rbac.yaml
    │   ├── deployments/
    │   │   └── autolytiq-prod-deployments.yaml
    │   ├── ingresses/
    │   │   └── all-ingresses.yaml
    │   ├── monitoring-all.yaml
    │   ├── original-manifests/
    │   │   ├── API-ROUTES.md
    │   │   ├── README.md
    │   │   ├── backend-deployment.yaml
    │   │   ├── celery-worker-deployment.yaml
    │   │   ├── clusterissuer.yaml
    │   │   ├── frontend-deployment.yaml
    │   │   ├── grafana-stack.yaml
    │   │   ├── helm/
    │   │   │   ├── backend/
    │   │   │   │   ├── Chart.yaml
    │   │   │   │   ├── templates/
    │   │   │   │   │   ├── _helpers.tpl
    │   │   │   │   │   ├── configmap.yaml
    │   │   │   │   │   ├── deployment.yaml
    │   │   │   │   │   ├── hpa.yaml
    │   │   │   │   │   └── service.yaml
    │   │   │   │   └── values.yaml
    │   │   │   ├── frontend/
    │   │   │   │   ├── Chart.yaml
    │   │   │   │   ├── templates/
    │   │   │   │   │   ├── _helpers.tpl
    │   │   │   │   │   ├── deployment.yaml
    │   │   │   │   │   ├── hpa.yaml
    │   │   │   │   │   ├── ingress.yaml
    │   │   │   │   │   └── service.yaml
    │   │   │   │   └── values.yaml
    │   │   │   ├── pricing-rust/
    │   │   │   │   ├── Chart.yaml
    │   │   │   │   ├── templates/
    │   │   │   │   │   ├── _helpers.tpl
    │   │   │   │   │   ├── deployment.yaml
    │   │   │   │   │   ├── hpa.yaml
    │   │   │   │   │   └── service.yaml
    │   │   │   │   └── values.yaml
    │   │   │   └── worker/
    │   │   │       ├── Chart.yaml
    │   │   │       ├── templates/
    │   │   │       │   ├── _helpers.tpl
    │   │   │       │   └── deployment.yaml
    │   │   │       └── values.yaml
    │   │   ├── hpa.yaml
    │   │   ├── ingress.yaml
    │   │   ├── manifests/
    │   │   │   └── prisma-migrate-job.yaml
    │   │   ├── ml-service-deployment.yaml
    │   │   ├── namespace.yaml
    │   │   ├── network-policy.yaml
    │   │   ├── nginx-security-config.yaml
    │   │   ├── node-exporter-daemonset.yaml
    │   │   ├── postgres-deployment.yaml
    │   │   ├── prisma-migrate-job.yaml
    │   │   ├── prometheus-stack.yaml
    │   │   ├── pvc.yaml
    │   │   ├── redis-deployment.yaml
    │   │   ├── rust-pricing-deployment.yaml
    │   │   └── scoring-configmap.yaml
    │   ├── secrets/
    │   │   └── autolytiq-prod-secrets.yaml
    │   ├── services/
    │   │   └── autolytiq-prod-services.yaml
    │   └── storageclasses.yaml
    ├── kubeconfig.yaml
    ├── ml-service -> ml_service/
    ├── ml_backend/
    │   └── config/
    │       └── scoring.yaml
    ├── ml_service/
    │   ├── Dockerfile
    │   ├── __init__.py
    │   ├── app/
    │   │   ├── __init__.py
    │   │   ├── config/
    │   │   │   └── scoring.py
    │   │   ├── main.py
    │   │   ├── routers/
    │   │   │   ├── __init__.py
    │   │   │   └── desking.py
    │   │   ├── schemas/
    │   │   │   ├── __init__.py
    │   │   │   └── desking.py
    │   │   ├── services/
    │   │   │   ├── __init__.py
    │   │   │   ├── approval_predictor.py
    │   │   │   ├── calculations.py
    │   │   │   ├── close_predictor.py
    │   │   │   ├── counter_analyzer.py
    │   │   │   └── deal_optimizer.py
    │   │   └── utils/
    │   │       ├── __init__.py
    │   │       ├── pydantic.py
    │   │       └── tracing.py
    │   ├── config/
    │   │   ├── __init__.py
    │   │   └── env.py
    │   ├── requirements-worker.txt
    │   ├── requirements.txt
    │   ├── scripts/
    │   │   └── smoke_enqueue.py
    │   ├── tests/
    │   │   ├── test_ablation_weights.py
    │   │   ├── test_deal_optimizer.py
    │   │   └── test_env_settings.py
    │   └── workers/
    │       ├── __init__.py
    │       ├── celery_app.py
    │       ├── schedules.py
    │       └── tasks.py
    ├── package-lock.json
    ├── package.json
    ├── packages/
    │   ├── build-config/
    │   │   ├── package.json
    │   │   ├── tsconfig.package.json
    │   │   └── tsup.base.ts
    │   ├── customization/
    │   │   ├── package.json
    │   │   ├── src/
    │   │   │   ├── index.ts
    │   │   │   ├── loader.ts
    │   │   │   └── schema.ts
    │   │   ├── tsconfig.json
    │   │   └── tsup.config.ts
    │   ├── db/
    │   │   ├── get-docker.sh
    │   │   ├── index.ts
    │   │   ├── migrations/
    │   │   │   ├── 1760804502_fi_lenders_submissions/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20241020000000_fix_search_vector_app_layer/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20241101020000_add_custom_permissions/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20241105000000_store_authentication/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20241106000000_tenant_auth_cleanup/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20251018165050_fi_menu_products/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20251101_multitenancy_ai_desking/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20251105_add_dashboard_tables/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20251105_add_intelligent_search/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20251219153000_fi_compliance_checklist/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260101090000_fi_funding/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260203090000_part6_inventory_schema/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260207090000_part6_pipeline_schema/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260215090000_add_desking_domain/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260315090010_credit_submission_drafts/
    │   │   │   │   └── migration.sql
    │   │   │   ├── add-rls.sql
    │   │   │   ├── fi_contracts_signatures/
    │   │   │   │   └── migration.sql
    │   │   │   ├── fi_credit_app_report/
    │   │   │   │   └── migration.sql
    │   │   │   ├── fi_init_deal_jacket_docs/
    │   │   │   │   └── migration.sql
    │   │   │   └── migration_lock.toml
    │   │   ├── migrations.backup/
    │   │   │   ├── 1760804502_fi_lenders_submissions/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20241020000000_fix_search_vector_app_layer/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20241105000000_store_authentication/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20241106000000_tenant_auth_cleanup/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20251018165050_fi_menu_products/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20251219153000_fi_compliance_checklist/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260101090000_fi_funding/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260203090000_part6_inventory_schema/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260207090000_part6_pipeline_schema/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260215090000_add_desking_domain/
    │   │   │   │   └── migration.sql
    │   │   │   ├── 20260315090010_credit_submission_drafts/
    │   │   │   │   └── migration.sql
    │   │   │   ├── add-rls.sql
    │   │   │   ├── fi_contracts_signatures/
    │   │   │   │   └── migration.sql
    │   │   │   ├── fi_credit_app_report/
    │   │   │   │   └── migration.sql
    │   │   │   ├── fi_init_deal_jacket_docs/
    │   │   │   │   └── migration.sql
    │   │   │   └── migration_lock.toml
    │   │   ├── package.json
    │   │   ├── prisma/
    │   │   │   └── schema.prisma
    │   │   ├── seed/
    │   │   │   ├── README.md
    │   │   │   ├── config.ts
    │   │   │   ├── data/
    │   │   │   │   ├── glAccounts.ts
    │   │   │   │   ├── widgetDefinitions.ts
    │   │   │   │   └── workflowStages.ts
    │   │   │   ├── index.ts
    │   │   │   ├── seeders/
    │   │   │   │   ├── seedCustomers.ts
    │   │   │   │   ├── seedDeals.ts
    │   │   │   │   ├── seedGLAccounts.ts
    │   │   │   │   ├── seedInsightRules.ts
    │   │   │   │   ├── seedLenders.ts
    │   │   │   │   ├── seedTenant.ts
    │   │   │   │   ├── seedUsers.ts
    │   │   │   │   ├── seedVehicles.ts
    │   │   │   │   ├── seedWidgetDefinitions.ts
    │   │   │   │   └── seedWorkflows.ts
    │   │   │   └── utils/
    │   │   ├── seed-insights.ts
    │   │   ├── seed-old-backup.ts
    │   │   └── seed.ts
    │   ├── design-system/
    │   ├── insights-engine/
    │   │   ├── README.md
    │   │   ├── package.json
    │   │   ├── src/
    │   │   │   ├── engine.ts
    │   │   │   ├── index.ts
    │   │   │   ├── memory.ts
    │   │   │   ├── registry.ts
    │   │   │   ├── rules/
    │   │   │   │   ├── deal-funding-risk.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── lead-revisit-opportunity.ts
    │   │   │   │   ├── recon-stalled.ts
    │   │   │   │   └── title-delay-risk.ts
    │   │   │   ├── rules-core.ts
    │   │   │   └── signal-model.ts
    │   │   ├── test-rules.ts
    │   │   ├── tsconfig.json
    │   │   ├── tsconfig.tsbuildinfo
    │   │   └── tsup.config.ts
    │   ├── layout-recipes/
    │   │   ├── package.json
    │   │   ├── src/
    │   │   │   ├── accounting/
    │   │   │   ├── dashboards/
    │   │   │   ├── deal/
    │   │   │   ├── index.ts
    │   │   │   ├── service/
    │   │   │   └── types.ts
    │   │   ├── tsconfig.json
    │   │   └── tsup.config.ts
    │   ├── policy-engine/
    │   │   ├── package.json
    │   │   ├── src/
    │   │   │   ├── applyMasks.ts
    │   │   │   ├── evaluate.ts
    │   │   │   ├── index.ts
    │   │   │   ├── registry.ts
    │   │   │   └── rules.ts
    │   │   ├── tsconfig.json
    │   │   └── tsup.config.ts
    │   ├── shared/
    │   │   ├── package.json
    │   │   ├── src/
    │   │   │   ├── index.ts
    │   │   │   ├── insights/
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── predicates/
    │   │   │   │   │   ├── deals.ts
    │   │   │   │   │   ├── inventory.ts
    │   │   │   │   │   ├── leads.ts
    │   │   │   │   │   ├── service.ts
    │   │   │   │   │   └── time.ts
    │   │   │   │   ├── registry.ts
    │   │   │   │   ├── scoring.ts
    │   │   │   │   └── types.ts
    │   │   │   ├── insights.ts
    │   │   │   ├── rbac.ts
    │   │   │   ├── schema/
    │   │   │   │   └── index.ts
    │   │   │   ├── schema.ts
    │   │   │   ├── schemas/
    │   │   │   │   └── card.ts
    │   │   │   ├── settings-schema/
    │   │   │   │   └── index.ts
    │   │   │   ├── settings-schema.ts
    │   │   │   └── settings-schema.ts.old
    │   │   ├── tsconfig.json
    │   │   └── tsup.config.ts
    │   ├── state-bus/
    │   │   ├── package.json
    │   │   ├── src/
    │   │   │   ├── events.ts
    │   │   │   ├── index.ts
    │   │   │   ├── projector.ts
    │   │   │   └── pubsub.ts
    │   │   ├── tsconfig.json
    │   │   └── tsup.config.ts
    │   ├── tokens/
    │   │   ├── package-lock.json
    │   │   ├── package.json
    │   │   ├── scripts/
    │   │   │   └── build-tokens.ts
    │   │   ├── src/
    │   │   │   ├── colors-new.ts
    │   │   │   └── index.ts
    │   │   ├── tokens.json
    │   │   ├── tsconfig.json
    │   │   └── tsup.config.ts
    │   └── ui/
    │       ├── apps/
    │       │   └── frontend/
    │       │       └── src/
    │       │           └── pages/
    │       │               └── deal-studio/
    │       ├── package.json
    │       ├── postcss.config.js
    │       ├── src/
    │       │   ├── components/
    │       │   │   ├── Accordion.tsx
    │       │   │   ├── Alert.tsx
    │       │   │   ├── AlertDialog.tsx
    │       │   │   ├── AppShell.tsx
    │       │   │   ├── Avatar.tsx
    │       │   │   ├── Badge.tsx
    │       │   │   ├── Breadcrumb.tsx
    │       │   │   ├── Button.tsx
    │       │   │   ├── Calendar.tsx
    │       │   │   ├── Card.tsx
    │       │   │   ├── Checkbox.tsx
    │       │   │   ├── Collapse.tsx
    │       │   │   ├── Collapsible.tsx
    │       │   │   ├── CollapsibleSection.tsx
    │       │   │   ├── ColorContrastChecker.tsx
    │       │   │   ├── CustomerCard.tsx
    │       │   │   ├── Dialog.tsx
    │       │   │   ├── Dropdown.tsx
    │       │   │   ├── DropdownMenu.tsx
    │       │   │   ├── EmptyState.tsx
    │       │   │   ├── ErrorBoundary.tsx
    │       │   │   ├── FeatureFlag.tsx
    │       │   │   ├── FocusTrap.tsx
    │       │   │   ├── Form.tsx
    │       │   │   ├── FormField.tsx
    │       │   │   ├── Input.tsx
    │       │   │   ├── IntelligentSearch.tsx
    │       │   │   ├── Label.tsx
    │       │   │   ├── LaneBoard.tsx
    │       │   │   ├── LaneCard.tsx
    │       │   │   ├── LoadingBoundary.tsx
    │       │   │   ├── MobileCard.tsx
    │       │   │   ├── Modal.tsx
    │       │   │   ├── Notes.tsx
    │       │   │   ├── PageContainer.tsx
    │       │   │   ├── PageHeader.tsx
    │       │   │   ├── Pagination.tsx
    │       │   │   ├── Popover.tsx
    │       │   │   ├── Progress.tsx
    │       │   │   ├── QuickAction.tsx
    │       │   │   ├── QuickView.tsx
    │       │   │   ├── Radio.tsx
    │       │   │   ├── RadixCommand.tsx
    │       │   │   ├── RadixPopover.tsx
    │       │   │   ├── RadixSelect.tsx
    │       │   │   ├── RadixTooltip.tsx
    │       │   │   ├── ResponsiveActions.tsx
    │       │   │   ├── ResponsiveGrid.tsx
    │       │   │   ├── RoleGuard.tsx
    │       │   │   ├── ScrollArea.tsx
    │       │   │   ├── SearchInput.tsx
    │       │   │   ├── Select.tsx
    │       │   │   ├── Separator.tsx
    │       │   │   ├── Sheet.tsx
    │       │   │   ├── Sidebar.tsx
    │       │   │   ├── Skeleton.tsx
    │       │   │   ├── SkipLink.tsx
    │       │   │   ├── Slider.tsx
    │       │   │   ├── StatCard.tsx
    │       │   │   ├── Stepper.tsx
    │       │   │   ├── Switch.tsx
    │       │   │   ├── Table.tsx
    │       │   │   ├── Tabs.tsx
    │       │   │   ├── TenantSwitcher.tsx
    │       │   │   ├── Textarea.tsx
    │       │   │   ├── Toast.tsx
    │       │   │   ├── Toaster.tsx
    │       │   │   ├── Toggle.tsx
    │       │   │   ├── ToggleGroup.tsx
    │       │   │   ├── Tooltip.tsx
    │       │   │   ├── UniformShell.tsx
    │       │   │   ├── VehicleCard.tsx
    │       │   │   ├── VisuallyHidden.tsx
    │       │   │   └── widgets/
    │       │   │       ├── InsightCard.tsx
    │       │   │       ├── InsightList.tsx
    │       │   │       └── StatusPulse.tsx
    │       │   ├── hooks/
    │       │   │   ├── useBreakpoint.ts
    │       │   │   ├── useColorContrast.ts
    │       │   │   ├── useMobile.ts
    │       │   │   └── useTheme.ts
    │       │   ├── index.ts
    │       │   ├── layouts/
    │       │   │   ├── FocusStudioLayout.tsx
    │       │   │   ├── FullDensityLayout.tsx
    │       │   │   ├── ListDetailLayout.tsx
    │       │   │   └── ShowroomManagerLayout.tsx
    │       │   ├── lib/
    │       │   │   └── queryClient.ts
    │       │   ├── patterns/
    │       │   │   └── cards/
    │       │   │       ├── CardShell.tsx
    │       │   │       ├── ListCard.tsx
    │       │   │       ├── MetricCard.tsx
    │       │   │       ├── TrendCard.tsx
    │       │   │       └── index.ts
    │       │   ├── primitives/
    │       │   │   ├── Box.tsx
    │       │   │   ├── Inline.tsx
    │       │   │   ├── Stack.tsx
    │       │   │   ├── Surface.tsx
    │       │   │   ├── Text.tsx
    │       │   │   └── index.ts
    │       │   ├── providers/
    │       │   │   └── AppProviders.tsx
    │       │   ├── styles.css
    │       │   ├── test/
    │       │   │   └── setup.ts
    │       │   ├── types/
    │       │   └── utils/
    │       │       ├── cn.ts
    │       │       └── colorAccessibility.ts
    │       ├── tailwind.config.js
    │       ├── tsconfig.json
    │       ├── tsup.config.ts
    │       └── vitest.config.ts
    ├── playwright.config.ts
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    ├── postcss.config.js
    ├── pyproject.toml
    ├── quick-seed.cjs*
    ├── rust-toolchain.toml
    ├── scripts/
    │   ├── README.md
    │   ├── apply_stabilize_patch.sh*
    │   ├── audit-markdown.sh
    │   ├── build-all.sh*
    │   ├── check-component-coverage.sh*
    │   ├── check-markdown-location.sh*
    │   ├── check-used-components.sh*
    │   ├── clean_docs.sh*
    │   ├── cleanup.sh*
    │   ├── db-backup.sh*
    │   ├── db-maintenance.ts
    │   ├── db-migrate-production.ts
    │   ├── db-push-safe.sh*
    │   ├── deploy-production.sh*
    │   ├── deploy-to-droplet.sh*
    │   ├── deployment-health-check.sh*
    │   ├── fix-component-props.sh*
    │   ├── fix-prisma-naming.mjs
    │   ├── health-check.ts
    │   ├── migrate-ui-imports-smart.sh*
    │   ├── migrate-ui-imports.sh*
    │   ├── migrate-ui-imports.ts
    │   ├── preflight-check.sh*
    │   ├── quick-deploy.sh*
    │   ├── repo-audit.ts
    │   ├── rollback.sh*
    │   ├── routing-cleanup.sh*
    │   ├── run-migrations.mjs
    │   ├── safe-migrate-deploy.ts
    │   ├── scan-secrets.sh*
    │   ├── setup-droplet.sh*
    │   ├── setup-prisma.ps1
    │   ├── setup-prisma.sh*
    │   ├── smoke.sh*
    │   ├── start-production.sh*
    │   ├── sync.sh*
    │   ├── update-changelog.sh*
    │   ├── validate-deployment.sh*
    │   └── verify-production-build.sh*
    ├── secret-patch.yaml
    ├── security-check.sh*
    ├── security-config.js
    ├── services/
    │   ├── rust/
    │   │   ├── ARCHITECTURE.md
    │   │   ├── Cargo.toml
    │   │   ├── Dockerfile
    │   │   ├── README.md
    │   │   ├── cache-service/
    │   │   │   ├── Cargo.toml
    │   │   │   ├── build.rs
    │   │   │   └── src/
    │   │   │       └── main.rs
    │   │   ├── comm-service/
    │   │   │   ├── Cargo.toml
    │   │   │   ├── build.rs
    │   │   │   └── src/
    │   │   │       ├── circuit_breaker.rs
    │   │   │       ├── idempotency.rs
    │   │   │       ├── main.rs
    │   │   │       ├── metrics.rs
    │   │   │       ├── retry.rs
    │   │   │       └── server.rs
    │   │   ├── docker-compose.yml
    │   │   ├── ops/
    │   │   ├── price-engine/
    │   │   │   ├── Cargo.toml
    │   │   │   ├── build.rs
    │   │   │   └── src/
    │   │   │       ├── config.rs
    │   │   │       ├── db.rs
    │   │   │       ├── main.rs
    │   │   │       ├── models.rs
    │   │   │       ├── server.rs
    │   │   │       └── services/
    │   │   │           ├── gross_calculator.rs
    │   │   │           ├── markdown_suggester.rs
    │   │   │           ├── market_pricing.rs
    │   │   │           ├── mod.rs
    │   │   │           └── payment_calculator.rs
    │   │   ├── proto/
    │   │   │   ├── cache_service.proto
    │   │   │   ├── comm_service.proto
    │   │   │   ├── common.proto
    │   │   │   └── price_engine.proto
    │   │   ├── rate-limiter/
    │   │   │   ├── Cargo.toml
    │   │   │   └── src/
    │   │   │       └── main.rs
    │   │   ├── scripts/
    │   │   │   ├── build.sh*
    │   │   │   ├── dev.sh*
    │   │   │   └── test.sh*
    │   │   ├── shared/
    │   │   │   ├── Cargo.toml
    │   │   │   └── src/
    │   │   │       ├── config.rs
    │   │   │       ├── db.rs
    │   │   │       ├── error.rs
    │   │   │       ├── lib.rs
    │   │   │       ├── logging.rs
    │   │   │       ├── middleware.rs
    │   │   │       ├── redis_client.rs
    │   │   │       ├── telemetry.rs
    │   │   │       └── types.rs
    │   │   └── tax-svc/
    │   │       ├── Cargo.toml
    │   │       ├── Dockerfile
    │   │       └── src/
    │   │           ├── cache.rs
    │   │           ├── handlers.rs
    │   │           ├── main.rs
    │   │           ├── models.rs
    │   │           ├── tax_rules.rs
    │   │           └── utils.rs
    │   └── rust-pricing/
    │       └── Dockerfile
    ├── skaffold.yaml
    ├── ssl-verify.js
    ├── structure.md
    ├── tailwind.config.ts
    ├── tests/
    │   ├── deployment.test.ts
    │   ├── e2e/
    │   │   └── desking.spec.ts
    │   ├── jest.setup.ts
    │   ├── perf/
    │   │   └── desking-optimize.js
    │   └── services/
    │       ├── approvalPredictor.service.test.ts
    │       ├── dealOptimizer.service.test.ts
    │       ├── grossCalculator.test.ts
    │       ├── lenderRules.test.ts
    │       ├── marketPricing.test.ts
    │       ├── paymentCalculator.test.ts
    │       └── similarDeals.test.ts
    ├── tracking-service/
    │   ├── backend/
    │   │   ├── Dockerfile
    │   │   ├── package-lock.json
    │   │   ├── package.json
    │   │   ├── src/
    │   │   │   ├── app.ts
    │   │   │   ├── controllers/
    │   │   │   │   └── tracking.controller.ts
    │   │   │   ├── index.ts
    │   │   │   ├── middleware/
    │   │   │   │   └── auth.ts
    │   │   │   ├── models/
    │   │   │   │   └── event.model.ts
    │   │   │   ├── routes/
    │   │   │   │   └── tracking.routes.ts
    │   │   │   └── services/
    │   │   │       ├── analytics.service.ts
    │   │   │       └── tracking.service.ts
    │   │   └── tsconfig.json
    │   ├── clickhouse/
    │   │   ├── queries.sql
    │   │   └── schema.sql
    │   ├── docker-compose.tracking.yml
    │   └── frontend/
    │       ├── package.json
    │       ├── src/
    │       │   ├── hooks/
    │       │   │   └── useTracking.ts
    │       │   ├── lib/
    │       │   │   ├── analytics.ts
    │       │   │   └── tracker.ts
    │       │   └── types/
    │       │       └── tracking.types.ts
    │       └── tsconfig.json
    ├── trigger_frontend.sh*
    ├── tsconfig.base.json
    ├── tsconfig.json
    ├── uv.lock
    ├── var/
    │   ├── bin/
    │   │   └── gitleaks*
    │   └── reports/
    │       └── infra-audit.json
    └── vitest.config.ts
    
    419 directories, 1804 files
