# 🎯 Deployment Quick Reference

**Confused about deployment? Start here!**

This is a single-page reference for deploying AutolytiQ. For complete details, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

---

## 🚦 Choose Your Path

### 1. I Want to Try It Locally (Fastest!)

```bash
./scripts/quick-deploy.sh
# OR
pnpm deploy:local
```

**Time:** ~5 minutes  
**Requirements:** Docker installed  
**Result:** App running at http://localhost:3000

---

### 2. I Want to Deploy to Production (Kubernetes)

```bash
# Step 1: Pre-flight check
pnpm preflight:production

# Step 2: Build
pnpm build:prod

# Step 3: Deploy
pnpm deploy:production
# OR
./scripts/deploy-production.sh
```

**Time:** ~15 minutes  
**Requirements:** kubectl, helm, Kubernetes cluster  
**Result:** Production deployment to your cluster

---

### 3. I Want to Deploy to a VPS/Droplet

```bash
# Step 1: Setup droplet (one-time)
./scripts/setup-droplet.sh YOUR_IP

# Step 2: Deploy
./scripts/deploy-to-droplet.sh YOUR_IP
# OR
pnpm deploy:droplet YOUR_IP
```

**Time:** ~10 minutes  
**Requirements:** Ubuntu server with SSH access  
**Result:** Production deployment to your server

---

## 🛠️ Common Commands

| Task | Command |
|------|---------|
| **Deploy locally** | `pnpm deploy:local` |
| **Deploy to production** | `pnpm deploy:production` |
| **Check before deploying** | `pnpm preflight` |
| **Validate deployment** | `pnpm validate:deployment` |
| **Check health** | `pnpm health:check` |
| **View logs** | `docker compose logs -f` |
| **Stop services** | `docker compose down` |
| **Restart services** | `docker compose restart` |

---

## 🔍 Troubleshooting

### Services won't start?
```bash
# Check what's wrong
pnpm preflight

# View logs
docker compose logs -f
```

### Deployment failed?
```bash
# Run validation
pnpm validate:deployment

# Check health
pnpm health:check
```

### Need detailed help?
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete guide
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Common issues
- [scripts/README.md](./scripts/README.md) - All scripts explained

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] **For Local:**
  - [ ] Docker installed and running
  - [ ] Ports 3000, 5000, 5432, 6379 available
  
- [ ] **For Production (Kubernetes):**
  - [ ] kubectl configured and connected
  - [ ] helm installed
  - [ ] Docker images built and pushed
  - [ ] Secrets configured
  
- [ ] **For VPS/Droplet:**
  - [ ] Ubuntu 22.04+ server
  - [ ] SSH access configured
  - [ ] Domain name (optional but recommended)

---

## 🎓 Learning Path

1. **First time?** Start with local deployment: `pnpm deploy:local`
2. **Ready for production?** Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. **Having issues?** Check [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

## 📞 Need Help?

1. Run pre-flight check: `pnpm preflight`
2. Run validation: `pnpm validate:deployment`
3. Check troubleshooting guide: [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
4. Review deployment guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Last Updated:** 2025-10-31
