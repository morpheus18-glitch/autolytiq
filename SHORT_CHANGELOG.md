# Iteration Changelog

Each entry is appended automatically via `pnpm changelog:update` to track agent activity.
## 2025-10-30T16:36:28Z (work)

Refresh agent guide, add iteration log command, and fix frontend Docker build context.

## 2025-10-30T16:42:07Z (work)

Add Node types dependency to tokens package

## 2025-10-30T16:49:27Z (work)

Ensure frontend Docker build keeps dev dependencies

## 2025-10-30T16:54:09Z (work)

Switch frontend Docker build to pnpm installs

## 2025-10-30T17:04:27Z (work)

Sync pnpm lock and frontend build tooling

## 2025-10-30T18:22:35Z (work)

Normalize Dockerfiles and split CI per service

## 2025-10-30T18:51:59Z (work)

Add automotive DMS schema extensions

## 2025-10-30T18:58:32Z (work)

Align shared enums with automotive schema

## 2025-10-30T20:49:34Z (work)

Fix Rust service build issues and update shared utilities

## 2025-10-31T01:26:53Z (copilot/fix-build-deploy-errors)

Fix backend Docker build by copying Prisma schema before install

## 2025-10-31T01:44:37Z (copilot/fix-deploy-error-workflows)

Fix deployment errors across all 4 GitHub Actions workflows

## 2025-10-31T02:09:53Z (copilot/fix-backend-crash-loop)

Fix backend crash loop by adding missing dependencies and externalizing packages in tsup config

## 2025-10-31T02:28:05Z (copilot/debug-workflow-logs)

Fix deployment errors: register health routes, fix ML service user ID, improve probe configurations

## 2025-10-31T02:31:22Z (copilot/debug-workflow-logs)

Validated deployment fixes - all configuration checks passed

## 2025-10-31T02:35:17Z (copilot/debug-workflow-logs)

Final review complete - no security issues, ready for merge

## 2025-10-31T02:37:06Z (copilot/debug-workflow-logs)

Task complete - comprehensive documentation added

## 2025-10-31T09:19:13Z (work)

Allow ml service to run without optional integrations

## 2025-10-31T09:33:32Z (copilot/fix-deploy-errors-cluster-config)

Fixed ML service deployment config: removed hardcoded namespace, moved securityContext to pod level, restored __TAG__ placeholder. Added securityContext to frontend and rust-pricing deployments for consistency.

## 2025-10-31T09:35:12Z (copilot/fix-deploy-errors-cluster-config)

Added securityContext to celery-worker and celery-beat deployments for consistency and security best practices.

## 2025-10-31T09:36:58Z (copilot/fix-deploy-errors-cluster-config)

Fixed critical namespace inconsistencies: updated namespace.yaml to autolytiq-prod, removed hardcoded namespaces from HPA, Ingress, and PVCs to allow kubectl apply with -n flag.

## 2025-10-31T09:38:21Z (copilot/fix-deploy-errors-cluster-config)

Created comprehensive deployment configuration fixes documentation summarizing all cluster and pod config issues resolved.

## 2025-10-31T10:01:18Z (copilot/remove-unnecessary-md-files)

Fix deployment issues: corrected healthcheck paths, removed unnecessary .md files, added comprehensive logging and validation

## 2025-10-31T10:08:27Z (copilot/remove-unnecessary-md-files)

Add deployment validation tests, health check script, troubleshooting guide, and global error handlers

