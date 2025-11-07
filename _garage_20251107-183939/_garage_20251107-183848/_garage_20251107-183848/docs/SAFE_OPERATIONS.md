# Safe Operations Guide

**Generated**: 2025-11-06  
**Purpose**: Plan → Apply workflow for production changes

---

## Principles

1. **Plan before apply** - Review changes before execution
2. **Branch strategy** - Feature branches + PRs
3. **Pre-merge checks** - Typecheck, lint, test, build
4. **Rollback ready** - Know how to undo changes

---

## Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/add-vehicle-card

# Make changes
# ...

# Run local checks
pnpm -w typecheck
pnpm -w lint
pnpm -w build

# Commit with conventional commits
git commit -m "feat(ui): add VehicleCard component"

# Push
git push origin feature/add-vehicle-card
```

### 2. Pull Request

**Required Checks** (GitHub Actions):
- ✅ TypeScript compilation
- ✅ ESLint passes
- ✅ Build succeeds
- ✅ Tests pass (when available)

**Review Checklist**:
- [ ] Code follows patterns in PROJECT_CONTEXT.md
- [ ] No direct API calls (use @repo/domain)
- [ ] Design tokens used (no hardcoded colors)
- [ ] Mobile responsive
- [ ] No PII leaks

### 3. Merge to Main

```bash
# Squash merge (recommended)
gh pr merge --squash

# Or: Rebase merge
gh pr merge --rebase
```

### 4. Deployment

**Automatic**: CI/CD triggers on push to main  
**Manual**: Run deployment script

```bash
# Deploy specific service
./scripts/deploy.sh frontend

# Or K8s command
kubectl set image deployment/frontend \
  frontend=registry.digitalocean.com/autolytiq/frontend:latest \
  -n autolytiq-prod
```

---

## Rollback Procedures

### Application Rollback

```bash
# Undo last deployment
kubectl rollout undo deployment/frontend -n autolytiq-prod

# Rollback to specific revision
kubectl rollout history deployment/frontend -n autolytiq-prod
kubectl rollout undo deployment/frontend --to-revision=5 -n autolytiq-prod

# Verify
kubectl rollout status deployment/frontend -n autolytiq-prod
```

### Database Rollback

**Prisma**: No automatic rollback

**Manual**:
1. Identify failing migration
2. Write down migration SQL
3. Deploy fix via new migration
4. OR: Restore from backup (last resort)

### Git Rollback

```bash
# Revert commit
git revert <commit-sha>
git push origin main

# Force rollback (DANGEROUS)
git reset --hard <previous-commit>
git push --force origin main  # ⚠️  Only in emergency
```

---

## Pre-Merge Checklist

**Before merging PR**:
- [ ] All CI checks pass
- [ ] Code reviewed by 1+ developers
- [ ] No merge conflicts
- [ ] Changelog/docs updated (if needed)
- [ ] Migration scripts tested (if DB changes)
- [ ] Breaking changes documented

---

## Emergency Procedures

### Site Down

1. Check K8s pods: `kubectl get pods -n autolytiq-prod`
2. Check recent deployments: `kubectl rollout history deployment/frontend`
3. Rollback if recent deploy: `kubectl rollout undo deployment/frontend`
4. Check logs: `kubectl logs -l app=frontend --tail=100`
5. Escalate if persists

### Database Issue

1. Check connection: `kubectl exec deployment/backend -- psql $DATABASE_URL -c "SELECT 1"`
2. Check migration status: `prisma migrate status`
3. Rollback app if migration failed
4. Contact DO support for managed DB issues

### Redis Down

1. Check Redis health: `kubectl exec deployment/backend -- redis-cli ping`
2. Restart Redis pods (if self-hosted)
3. Contact DO support (if managed)
4. App should degrade gracefully (check logs)

---

## Monitoring

**Watch for**:
- Error rates spike
- Latency increases
- Pod restarts
- Failed health checks

**Tools**:
- Kubernetes Dashboard
- Grafana (if set up)
- Sentry (error tracking)
- DO Monitoring

