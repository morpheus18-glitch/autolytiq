# GitHub Secrets Setup Guide

## Required GitHub Secrets

You need to configure these secrets in your GitHub repository for CI/CD deployment:

### 1. Navigate to Repository Settings

```
GitHub Repository → Settings → Secrets and variables → Actions → New repository secret
```

### 2. Add Required Secrets

#### DIGITALOCEAN_ACCESS_TOKEN
- **Name**: `DIGITALOCEAN_ACCESS_TOKEN`
- **Value**: Your DigitalOcean API token
- **How to get it**:
  1. Go to https://cloud.digitalocean.com/account/api/tokens
  2. Click "Generate New Token"
  3. Name it "GitHub Actions - Autolytiq"
  4. Check "Write" scope
  5. Copy the token (you won't see it again!)

#### JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: Your JWT secret key (you mentioned you already added this)
- **Example**: A random string like output from `openssl rand -base64 32`
- **Security**: Should be at least 32 characters, random, never committed to Git

#### DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: Your PostgreSQL connection string (you mentioned you already added this)
- **Format**: 
  ```
  postgresql://username:password@host:port/database?sslmode=require
  ```
- **Your value**: The DigitalOcean managed database connection string

### 3. Optional Secrets (Future)

#### SENTRY_DSN (Error tracking)
- **Name**: `SENTRY_DSN`
- **Value**: Your Sentry project DSN

#### SLACK_WEBHOOK_URL (Deployment notifications)
- **Name**: `SLACK_WEBHOOK_URL`
- **Value**: Slack incoming webhook URL

## Verify Secrets Are Set

```bash
# List secrets (names only, values are hidden)
gh secret list
```

Expected output:
```
DIGITALOCEAN_ACCESS_TOKEN
JWT_SECRET
DATABASE_URL
```

## Using Secrets Locally (Development)

### .env Files (Git-ignored)

Create these files locally (they are in .gitignore):

**apps/backend/.env**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-local-jwt-secret-for-development
DATABASE_URL=postgresql://user:pass@localhost:5432/autolytiq_dev?sslmode=disable
FRONTEND_URL=http://localhost:5173
```

**apps/frontend/.env**
```env
VITE_API_URL=http://localhost:3000
```

### Never Commit Secrets!

The `.gitignore` file should include:
```
.env
.env.local
.env.*.local
k8s/secrets.yaml  # If using actual values
```

## Manual Deployment (Alternative to GitHub Actions)

If you prefer to deploy manually instead of using CI/CD:

### 1. Create Kubernetes Secret Manually

```bash
# Make sure you're connected to your K8s cluster
kubectl config current-context

# Create secret from command line (values not stored in files)
kubectl create secret generic autolytiq-secrets \
  --from-literal=jwt-secret='YOUR_JWT_SECRET_HERE' \
  --from-literal=database-url='YOUR_DATABASE_URL_HERE' \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 2. Update Secret Values

```bash
# Update JWT secret
kubectl patch secret autolytiq-secrets -p \
  '{"stringData":{"jwt-secret":"NEW_JWT_SECRET"}}'

# Update database URL
kubectl patch secret autolytiq-secrets -p \
  '{"stringData":{"database-url":"NEW_DATABASE_URL"}}'
```

### 3. View Secret (Base64 encoded)

```bash
kubectl get secret autolytiq-secrets -o yaml
```

### 4. Decode Secret Values

```bash
# View jwt-secret
kubectl get secret autolytiq-secrets -o jsonpath='{.data.jwt-secret}' | base64 -d

# View database-url
kubectl get secret autolytiq-secrets -o jsonpath='{.data.database-url}' | base64 -d
```

## GitHub Actions Workflow Triggers

The deployment workflow (`.github/workflows/deploy.yml`) runs automatically when:

1. **Push to main/master branch**
   ```bash
   git push origin main
   ```

2. **Manual trigger** (via GitHub UI)
   - Go to Actions tab
   - Click "Build and Deploy to Kubernetes"
   - Click "Run workflow"

3. **Pull Request merge** (if merged to main)

## Environment Variables in Kubernetes

The backend deployment uses these environment variables:

```yaml
env:
  - name: PORT
    value: "3000"
  - name: NODE_ENV
    value: "production"
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: autolytiq-secrets
        key: jwt-secret
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: autolytiq-secrets
        key: database-url
```

## Security Best Practices

1. ✅ **Never commit secrets to Git**
   - Use GitHub Secrets for CI/CD
   - Use `.env` files for local development (git-ignored)

2. ✅ **Rotate secrets regularly**
   - JWT_SECRET: Every 90 days
   - DATABASE_URL password: Every 90 days
   - API tokens: Every 90 days

3. ✅ **Use different secrets for different environments**
   - Development: Different JWT secret, local database
   - Staging: Different secrets
   - Production: Strong secrets, managed database

4. ✅ **Audit secret access**
   - Check who has access to GitHub repository secrets
   - Monitor DigitalOcean access logs
   - Enable 2FA on all accounts

5. ✅ **Encrypt secrets at rest**
   - Kubernetes secrets are base64 encoded (not encrypted by default)
   - Consider using sealed-secrets or external secrets operator for extra security

## Troubleshooting

### Deployment fails with "ImagePullBackOff"
- Check DIGITALOCEAN_ACCESS_TOKEN is valid
- Verify registry name matches in workflow and deployments

### Backend pods crash with "JWT_SECRET is undefined"
- Check secret was created: `kubectl get secret autolytiq-secrets`
- Verify secret has correct keys: `kubectl describe secret autolytiq-secrets`

### Database connection fails
- Check DATABASE_URL format is correct
- Verify DigitalOcean database allows connections from K8s cluster
- Check database firewall rules in DigitalOcean console

### GitHub Actions workflow fails
- Check all required secrets are set in GitHub
- View workflow logs in Actions tab
- Verify DIGITALOCEAN_ACCESS_TOKEN has write permissions

## Testing Secret Configuration

### Test locally
```bash
cd apps/backend

# Check .env is loaded
npm run dev

# Should show:
# Backend running on http://0.0.0.0:3000
```

### Test in Kubernetes
```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pod -l app=autolytiq,component=backend -o jsonpath='{.items[0].metadata.name}')

# Check environment variables are set
kubectl exec $BACKEND_POD -- env | grep -E "JWT_SECRET|DATABASE_URL"

# Should show:
# JWT_SECRET=<your-secret>
# DATABASE_URL=postgresql://...
```

## Next Steps

1. ✅ Set up GitHub Secrets (you mentioned this is done)
2. ✅ Configure .gitignore to exclude .env files
3. Push code to GitHub
4. Watch GitHub Actions workflow run
5. Verify deployment in Kubernetes
6. Test application at your domain

---

**Current Status**: JWT_SECRET and DATABASE_URL are configured in GitHub Secrets ✅
