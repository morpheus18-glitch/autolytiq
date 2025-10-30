# Quick Deployment Guide - Minimal Secrets

## ⚡ Deploy NOW with Just 1 Secret

The workflow has been temporarily configured with dev defaults. You can deploy **immediately** with only the DigitalOcean token.

---

## Required Secret (Only 1!)

Configure this in your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

```
Name: DO_TOKEN
Value: <your-digitalocean-api-token>
```

Get your token from: https://cloud.digitalocean.com/account/api/tokens

---

## What Happens with Dev Defaults

The deployment will use these temporary values:

| Variable | Default Value | Production Risk |
|----------|---------------|-----------------|
| **REGISTRY** | `registry.digitalocean.com/autolytiq` | ⚠️ Ensure this matches your registry |
| **CLUSTER** | `autolytiq-cluster` | ⚠️ Ensure this matches your cluster name |
| **NS** | `autolytiq-prod` | ✅ OK for dev |
| **DATABASE_URL** | `postgresql://autolytiq:autolytiq@postgres:5432/autolytiq` | 🔴 **INSECURE** - Local credentials |
| **JWT_SECRET** | `dev-jwt-secret-change-in-production` | 🔴 **INSECURE** - Known value |
| **JWT_PUBLIC_KEY** | Dev key (base64) | 🔴 **INSECURE** - Known key |
| **CORS** | `*` (all origins) | 🔴 **INSECURE** - No restrictions |
| **URLs** | localhost/service names | ⚠️ Wrong for external access |

---

## Deploy Steps

1. **Add DO_TOKEN secret** (see above)

2. **Verify cluster name** matches `autolytiq-cluster`:
   ```bash
   doctl kubernetes cluster list
   ```
   If different, add `CLUSTER` secret with actual name

3. **Verify registry** matches `registry.digitalocean.com/autolytiq`:
   ```bash
   doctl registry get
   ```
   If different, add `REGISTRY` secret with actual URL

4. **Trigger deployment:**
   - Push to main branch, OR
   - Go to Actions → Deploy to Production → Run workflow

5. **Monitor deployment:**
   ```bash
   # Watch the workflow in GitHub Actions UI, or:
   kubectl get pods -n autolytiq-prod --watch
   ```

---

## Expected Warnings

You'll see these warnings during deployment (these are OK for dev):

- ⚠️ Backend will fail to connect to database (needs real DATABASE_URL)
- ⚠️ Health checks may fail initially
- ⚠️ Authentication won't work properly (dev JWT keys)
- ⚠️ Email/SMS features won't work (no Twilio/SendGrid)

---

## After Deployment - Configure Real Secrets

**IMPORTANT:** These dev defaults are **NOT SECURE** for production!

Follow these steps to secure your deployment:

### 1. Database Connection

**You MUST configure this for backend to work:**

```
DATABASE_URL=postgresql://user:pass@your-db-host:25060/autolytiq?sslmode=require
DIRECT_URL=postgresql://user:pass@your-db-host:25060/autolytiq?sslmode=require
```

Get from DigitalOcean → Databases → Your Database → Connection Details → Connection String

⚠️ Use **VPC (Private) Network** connection string, NOT public!

### 2. JWT Authentication

**Generate real keys:**

```bash
# Generate private key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keybits:2048

# Extract public key
openssl rsa -pubout -in private_key.pem -out public_key.pem

# Base64 encode for GitHub secret
cat public_key.pem | base64 -w 0
```

Then add:
```
JWT_SECRET=<random-256-bit-secret>
JWT_PUBLIC_KEY=<base64-encoded-public-key>
JWT_ISSUER=autolytiq-production
JWT_AUDIENCE=autolytiq-clients
```

### 3. Application URLs

```
APP_URL=https://app.autolytiq.com
API_URL=https://api.autolytiq.com
ML_SERVICE_URL=http://ml-service:8000
SOCKET_IO_CORS_ORIGIN=https://app.autolytiq.com
```

### 4. Optional Services (Leave empty if not using)

```
REDIS_URL=
SENDGRID_API_KEY=
SENDGRID_FROM=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
TWILIO_CALLER_ID=
```

---

## Troubleshooting

### Pods stuck in CrashLoopBackOff

**Check backend logs:**
```bash
kubectl logs -n autolytiq-prod deploy/backend --tail=50
```

**Most likely cause:** Invalid DATABASE_URL (using dev default)

**Fix:** Add real DATABASE_URL and DIRECT_URL secrets, redeploy

### ImagePullBackOff

**Check registry name:**
```bash
kubectl describe pod -n autolytiq-prod <pod-name> | grep -A5 "Failed"
```

**Most likely cause:** REGISTRY secret doesn't match actual registry

**Fix:** Add REGISTRY secret with correct URL

### Pods not starting

**Check secret exists:**
```bash
kubectl get secret -n autolytiq-prod app-env -o yaml
```

**Check deployment status:**
```bash
kubectl get deploy -n autolytiq-prod
kubectl describe deploy backend -n autolytiq-prod
```

---

## Cleanup Dev Defaults (After Testing)

Once you verify deployment works, **remove dev defaults from workflow**:

1. Configure all secrets per `DEPLOYMENT_FIXES_SUMMARY.md`
2. Edit `.github/workflows/deploy.yml`
3. Remove all `|| 'default-value'` fallbacks
4. Commit as "chore: require all GitHub secrets for production"

This ensures you don't accidentally deploy with insecure defaults.

---

## Summary

**NOW:**
- ✅ Deploy works with just DO_TOKEN
- ⚠️ Uses insecure dev defaults
- ⚠️ Backend won't work without real DATABASE_URL

**LATER (before going live):**
- 🔒 Add all production secrets
- 🔒 Remove dev defaults from workflow
- 🔒 Test with real credentials

---

**Ready to deploy?** Just add DO_TOKEN and push to main!
