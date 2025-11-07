# AutolytiQ Deployment Scripts

This directory contains automation scripts for deploying and managing AutolytiQ.

## 🚀 Deployment Scripts

### Quick Deploy (Local)
```bash
./scripts/quick-deploy.sh
```
One-command local deployment using Docker Compose. Perfect for getting started quickly.

**Features:**
- Checks prerequisites (Docker, Docker Compose)
- Sets up environment automatically
- Builds and starts all services
- Runs database migrations
- Performs health checks
- Shows you exactly where to access the app

### Production Deploy (Kubernetes)
```bash
./scripts/deploy-production.sh
```
Interactive production deployment to Kubernetes (DigitalOcean or any cluster).

**Features:**
- Checks prerequisites (kubectl, helm)
- Interactive configuration prompts
- Namespace and tag selection
- Helm chart deployments
- Deployment verification
- Smoke tests

### Droplet Deploy (VPS)
```bash
./scripts/deploy-to-droplet.sh YOUR_DROPLET_IP [branch]
```
Deploy to a DigitalOcean droplet or any VPS.

**Features:**
- SSH connection verification
- Code deployment
- Dependency installation
- Database migrations
- Service restart
- Health checks

## ✅ Validation Scripts

### Pre-Flight Check
```bash
./scripts/preflight-check.sh [local|production]
```
Comprehensive pre-deployment validation.

**Checks:**
- Git repository status
- Docker/Kubernetes environment
- Node.js and pnpm versions
- Environment configuration
- Dependencies and build artifacts
- Dockerfiles and docker-compose.yml
- Prisma schema validity
- Port availability

### Deployment Validation
```bash
./scripts/validate-deployment.sh
```
Validates the deployment setup before deploying.

**Checks:**
- Node.js version
- pnpm availability
- Environment files
- Prisma schema
- TypeScript compilation
- Build artifacts
- Dockerfiles
- docker-compose.yml validity
- Security issues

### Health Check
```bash
./scripts/deployment-health-check.sh
```
Post-deployment health verification.

**Checks:**
- Backend health endpoints
- Frontend availability
- ML service health
- Database connectivity
- Docker container status

## 🔧 Utility Scripts

### Update Changelog
```bash
./scripts/update-changelog.sh "Description of changes"
```
Appends a timestamped entry to SHORT_CHANGELOG.md.

### Scan Secrets
```bash
./scripts/scan-secrets.sh
```
Scans for accidentally committed secrets using gitleaks.

### Database Backup
```bash
./scripts/db-backup.sh
```
Creates a backup of the PostgreSQL database.

### Smoke Tests
```bash
./scripts/smoke.sh
```
Runs smoke tests against deployed services.

### Setup Droplet
```bash
./scripts/setup-droplet.sh DROPLET_IP
```
Initial setup of a DigitalOcean droplet (installs dependencies, configures environment).

## 📦 NPM Scripts

For convenience, many scripts are also available as npm/pnpm commands:

```bash
# Deployment
pnpm deploy:local              # Same as ./scripts/quick-deploy.sh
pnpm deploy:production         # Same as ./scripts/deploy-production.sh
# Note: deploy:droplet requires IP parameter:
#   pnpm deploy:droplet -- YOUR_DROPLET_IP [branch]

# Validation
pnpm preflight                 # Pre-flight check for local deployment
pnpm preflight:production      # Pre-flight check for production
pnpm validate:deployment       # Deployment validation
pnpm health:check              # Health check

# Development
pnpm dev                       # Start dev servers (frontend + backend)
pnpm dev:server               # Start backend only
pnpm dev:client               # Start frontend only

# Building
pnpm build                     # Build all packages
pnpm build:prod               # Build for production
pnpm build:server             # Build backend only
pnpm build:client             # Build frontend only

# Database
pnpm db:migrate:dev           # Create and apply migration
pnpm db:migrate:deploy        # Apply migrations in production
pnpm db:seed                  # Seed database

# Testing & Quality
pnpm test                      # Run all tests
pnpm test:e2e                 # Run end-to-end tests
pnpm test:deployment          # Run deployment tests
pnpm typecheck                # TypeScript type checking
pnpm lint                     # Code linting
pnpm scan:secrets             # Scan for secrets
```

## 🎯 Common Workflows

### First Time Local Setup
```bash
# 1. Pre-flight check
pnpm preflight

# 2. Quick deploy
pnpm deploy:local

# 3. Access app at http://localhost:3000
```

### Production Deployment
```bash
# 1. Pre-flight check
pnpm preflight:production

# 2. Build for production
pnpm build:prod

# 3. Deploy
pnpm deploy:production
```

### Debugging Deployment Issues
```bash
# 1. Run validation
pnpm validate:deployment

# 2. Check health
pnpm health:check

# 3. View logs
docker compose logs -f
```

## 📖 Documentation

For more detailed information, see:

- **[DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide
- **[docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)** - Kubernetes deployment details
- **[docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)** - Troubleshooting guide
- **[README.md](../README.md)** - Project overview

## 🆘 Getting Help

If you encounter issues:

1. Run `pnpm preflight` to check your environment
2. Run `pnpm validate:deployment` to validate setup
3. Check [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)
4. Review logs: `docker compose logs -f`
5. Check [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

## 📝 Script Maintenance

When adding new scripts:

1. Make them executable: `chmod +x scripts/your-script.sh`
2. Add helpful comments and error handling
3. Follow the pattern of existing scripts (colors, helper functions)
4. Document them in this README
5. Consider adding an npm script alias in package.json
6. Update the changelog: `pnpm changelog:update "Description"`
