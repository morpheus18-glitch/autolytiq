# AutolytiQ - Replit Production Deployment Guide

## 🚀 Quick Start Deployment

### One-Click Deploy to Replit

1. **Fork/Import Repository**
   - Go to [Replit](https://replit.com)
   - Click "Create Repl" → "Import from GitHub"
   - Enter repository URL: `https://github.com/morpheus18-glitch/autolytiq`
   - Select "Node.js" as the language

2. **Configure Secrets (Environment Variables)**
   - Click on "Secrets" (🔒) in the left sidebar
   - Add all required environment variables (see section below)

3. **Deploy**
   - Click "Deploy" button in the top right
   - Replit will automatically:
     - Install dependencies
     - Generate Prisma client
     - Build backend (tsup)
     - Build frontend (Vite)
     - Run database migrations
     - Start the production server

---

## 📋 Required Environment Variables

### Essential (Must Configure Before Deploy)

```env
# Database - Use Replit PostgreSQL or Neon
DATABASE_URL=postgresql://user:password@host:5432/autolytiq?schema=public
DIRECT_URL=postgresql://user:password@host:5432/autolytiq?schema=public

# Security - Generate strong random strings
SESSION_SECRET=<GENERATE_MINIMUM_32_CHARACTERS>
JWT_SECRET=<GENERATE_STRONG_SECRET>

# Application
NODE_ENV=production
PORT=5000
APP_URL=https://your-repl-name.replit.app
API_URL=https://your-repl-name.replit.app
```

### Optional (Add as needed)

#### Redis (For Background Jobs)
```env
REDIS_URL=redis://default:password@host:6379
```

#### Email (SendGrid)
```env
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_WEBHOOK_SIGNING_KEY=xxx
```

#### SMS (Twilio)
```env
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_MESSAGING_SERVICE_SID=MGxxx
TWILIO_PHONE_NUMBER=+1234567890
```

#### Cloud Storage (AWS S3 or Compatible)
```env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
S3_BUCKET=autolytiq-documents
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_CLOUDFRONT_URL=https://cdn.yourdomain.com
```

#### AI Features (OpenAI)
```env
OPENAI_API_KEY=sk-xxx
```

#### Payment Processing (Stripe)
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

#### Credit Bureau Integration
```env
EXPERIAN_API_URL=https://api.experian.com
EXPERIAN_API_KEY=xxx
EXPERIAN_CLIENT_ID=xxx
EXPERIAN_CLIENT_SECRET=xxx

TRANSUNION_API_URL=https://api.transunion.com
TRANSUNION_API_KEY=xxx

EQUIFAX_API_URL=https://api.equifax.com
EQUIFAX_API_KEY=xxx
```

#### E-Signature (DocuSign)
```env
DOCUSIGN_BASE_URL=https://demo.docusign.net
DOCUSIGN_INTEGRATOR_KEY=xxx
DOCUSIGN_USER_ID=xxx
DOCUSIGN_AUTH_JWT=xxx
DOCUSIGN_ACCOUNT_ID=xxx
DOCUSIGN_REDIRECT_URL=https://your-repl-name.replit.app/api/integrations/docusign/callback
```

#### Analytics
```env
CLICKHOUSE_HOST=xxx.clickhouse.cloud
CLICKHOUSE_PORT=9440
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=xxx
```

#### Security
```env
CREDIT_ENCRYPTION_KEY=<GENERATE_32_BYTE_HEX_STRING>
```

---

## 🔧 Database Setup

### Option 1: Use Replit PostgreSQL (Recommended)

1. In your Repl, click "Add a Database" button
2. Select "PostgreSQL"
3. Replit automatically creates `DATABASE_URL` secret
4. Copy the value and also set it as `DIRECT_URL`

### Option 2: Use Neon (Serverless PostgreSQL)

1. Go to [Neon](https://neon.tech) and create account
2. Create a new project
3. Copy the connection string
4. Add to Replit Secrets:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   DIRECT_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Option 3: Use Supabase

1. Go to [Supabase](https://supabase.com) and create project
2. Go to Project Settings → Database
3. Copy "Connection string" (Transaction mode)
4. Add to Replit Secrets as shown above

---

## 📦 Build Process

When you deploy, Replit automatically runs:

```bash
npm run build:prod
```

**This command does:**
1. ✅ Generate Prisma client (`prisma generate`)
2. ✅ Build backend TypeScript to JavaScript (`tsup`)
3. ✅ Build React frontend for production (`vite build`)

**Output:**
- Backend: `dist/index.js`
- Frontend: `dist/public/` (served by backend)

---

## 🚦 Startup Process

On deployment start, Replit runs:

```bash
npm run start:prod
```

`start:prod` calls `scripts/start-production.sh`, which executes `npm run db:migrate:deploy:safe` to baseline existing schemas and apply any pending migrations before booting the server.

**This command does:**
1. ✅ Run safe Prisma deploy and generate client
2. ✅ Start production server (`node dist/index.js`)

**The server will:**
- Listen on port 5000
- Serve API endpoints at `/api/*`
- Serve frontend app from `/`
- Connect to PostgreSQL database
- Initialize background job queues (if Redis configured)

---

## 🔍 Verification Steps

### After Deployment

1. **Check Deployment Logs**
   - Click on "Logs" tab in Replit
   - Verify no errors during build
   - Look for: "Server running on port 5000"

2. **Test Database Connection**
   - Open the deployed URL
   - You should see the frontend load
   - Check browser console for errors

3. **Verify API**
   - Navigate to: `https://your-repl-name.replit.app/api/health`
   - Should return: `{"status": "ok"}`

4. **Check Database Tables**
   - Go to Shell tab in Replit
   - Run:
     ```bash
     npx prisma studio
     ```
   - Opens database GUI to verify tables exist

---

## 🔄 Updating Your Deployment

### Method 1: Auto-Deploy from GitHub

1. In Replit, go to Version Control tab
2. Enable "Auto-deploy on push"
3. Every git push to main branch will trigger redeploy

### Method 2: Manual Redeploy

1. Click "Deploy" button
2. Replit rebuilds and restarts automatically

### Method 3: Shell Commands

```bash
# Pull latest code
git pull origin main

# Rebuild
npm run build:prod

# Restart (click Stop then Run in Replit)
```

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module 'prisma'"**
```bash
npm install --save-dev prisma
npm run build:prod
```

**Error: "DATABASE_URL is not set"**
- Go to Secrets tab
- Add DATABASE_URL with your connection string
- Redeploy

### Database Migration Fails

**Error: "Database connection refused"**
- Verify DATABASE_URL is correct
- Check database is running
- For Neon/Supabase, verify project is active

**Error: "Migration already applied"**
- This is safe to ignore
- Prisma skips already-applied migrations

### Application Won't Start

**Check Logs for:**
```bash
# In Shell tab:
npm run start:prod
```

**Common Issues:**
1. Missing environment variables
2. Database connection failed
3. Port already in use

**Solutions:**
- Verify all required secrets are set
- Test database connection
- Stop other processes using port 5000

### Frontend Not Loading

**Check:**
1. Build completed successfully
2. `dist/public/` folder exists
3. Backend is serving static files

**Fix:**
```bash
npm run build:client
```

---

## 📊 Monitoring

### View Logs
```bash
# In Replit Shell
npm run start:prod 2>&1 | tee app.log
```

### Check Resource Usage
- Replit Dashboard → Your Repl → "Resources"
- Monitor CPU, Memory, Storage

### Database Performance
```bash
# Connect to database
npx prisma studio

# Run queries
```

---

## 🔒 Security Checklist

- [ ] Set strong `SESSION_SECRET` (32+ characters)
- [ ] Set strong `JWT_SECRET`
- [ ] Use production database (not dev/test)
- [ ] Enable SSL for database connection
- [ ] Configure CORS properly
- [ ] Set `NODE_ENV=production`
- [ ] Use environment secrets (never hardcode)
- [ ] Enable rate limiting
- [ ] Configure proper authentication
- [ ] Regular security audits

---

## 🚀 Performance Optimization

### Enable Caching
```env
REDIS_URL=redis://your-redis-url
```

### Use CDN for Assets
```env
S3_CLOUDFRONT_URL=https://cdn.yourdomain.com
```

### Database Optimization
- Add indexes for frequently queried fields
- Use connection pooling
- Enable query caching

---

## 📱 Custom Domain Setup

### Add Custom Domain to Replit

1. Go to your Repl → "Settings"
2. Scroll to "Custom Domains"
3. Click "Add Domain"
4. Follow DNS configuration instructions

### Update Environment Variables

```env
APP_URL=https://yourdomain.com
API_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com
```

### Update OAuth Redirects

If using OAuth (Google, GitHub, etc):
- Update redirect URLs in provider settings
- Update environment variables with new domain

---

## 🔧 Advanced Configuration

### Enable All Enterprise Features

To use the full Enterprise CRM extension:

1. **Apply Enterprise Migration**
   ```bash
   npm run db:migrate:deploy:safe
   ```
   This applies all 41 enterprise tables.

2. **Configure Services**
   - Campaign email provider (SendGrid)
   - SMS provider (Twilio)
   - Document storage (S3)
   - E-signature provider (DocuSign)

3. **Enable Features in Admin**
   - Login as admin
   - Go to Settings → Features
   - Enable desired modules

### Background Workers (Optional)

For background job processing:

1. **Deploy Separate Worker Repl**
   - Create new Repl from same codebase
   - Set environment variables
   - Run: `npm run dev:worker:hp`

2. **Or Use Replit Reserved VMs**
   - Upgrade to Replit Hacker plan
   - Enable Always-On
   - Configure multiple processes

---

## 📚 Additional Resources

- [AutolytiQ Documentation](/docs)
- [Enterprise CRM Features](/docs/ENTERPRISE_CRM_EXTENSION.md)
- [API Documentation](/docs/API.md)
- [Architecture Guide](/ARCHITECTURE.md)
- [Replit Documentation](https://docs.replit.com)

---

## 🆘 Support

### Getting Help

1. **Check Logs First**
   - Replit Console → Logs tab
   - Look for error messages

2. **Review Documentation**
   - README.md
   - ENTERPRISE_CRM_EXTENSION.md
   - This deployment guide

3. **Common Commands**
   ```bash
   # Check build status
   npm run build:prod

   # Test database connection
   npx prisma db pull

   # View Prisma schema
   npx prisma studio

   # Check environment
   env | grep DATABASE
   ```

4. **Report Issues**
   - GitHub Issues: [autolytiq/issues](https://github.com/morpheus18-glitch/autolytiq/issues)
   - Include: Error logs, environment (redacted), steps to reproduce

---

## ✅ Pre-Deploy Checklist

- [ ] DATABASE_URL configured
- [ ] SESSION_SECRET set (32+ characters)
- [ ] JWT_SECRET set
- [ ] NODE_ENV=production
- [ ] APP_URL points to Replit domain
- [ ] Optional services configured (email, SMS, storage)
- [ ] Build succeeds: `npm run build:prod`
- [ ] Migrations applied: `npm run db:migrate:deploy:safe`
- [ ] Frontend builds: `npm run build:client`
- [ ] Server starts: `npm run start:prod`
- [ ] Health check works: `/api/health`
- [ ] Database connection verified
- [ ] Logs show no errors

---

## 🎉 Success!

Once deployed, your AutolytiQ instance will be available at:

**https://your-repl-name.replit.app**

Features included:
- ✅ Full automotive CRM
- ✅ Deal desking & F&I
- ✅ Inventory management
- ✅ Multi-channel campaigns
- ✅ Customer support ticketing
- ✅ Project management
- ✅ Document management
- ✅ Analytics & reporting
- ✅ Integration hub
- ✅ Enterprise features (41 new tables)

**Next Steps:**
1. Create admin account
2. Configure dealer/tenant settings
3. Import vehicle inventory
4. Set up team members
5. Configure integrations
6. Customize workflows

---

**Last Updated:** 2025-10-22
**Version:** 2.0.0 (Enterprise Edition)
**Deployment Target:** Replit Autoscale
