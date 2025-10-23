# 🚀 Deploy AutolytiQ to Replit - Quick Start

## ⚡ 5-Minute Deployment

### Step 1: Import to Replit (1 min)

1. Go to **[Replit](https://replit.com)**
2. Click **"Create Repl"** → **"Import from GitHub"**
3. Paste: `https://github.com/morpheus18-glitch/autolytiq`
4. Click **"Import"**

### Step 2: Add Database (2 min)

**Option A: Replit PostgreSQL** (Easiest)
1. Click **"+ Add a Database"** button in your Repl
2. Select **"PostgreSQL"**
3. Replit auto-creates `DATABASE_URL` secret
4. Done! ✅

**Option B: Neon Database** (Recommended for Production)
1. Go to [neon.tech](https://neon.tech)
2. Create free account → New project
3. Copy connection string
4. In Replit: Go to **Secrets** (🔒)
5. Add:
   ```
   DATABASE_URL=postgresql://[your-neon-connection-string]
   DIRECT_URL=postgresql://[your-neon-connection-string]
   ```

### Step 3: Configure Secrets (2 min)

In Replit, click **Secrets** (🔒) and add:

**Required:**
```bash
# Copy DATABASE_URL from Step 2
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Generate these (see commands below)
SESSION_SECRET=<paste-generated-secret>
JWT_SECRET=<paste-generated-secret>
```

**Generate Secrets:**
```bash
# Click "Shell" tab in Replit and run:
openssl rand -base64 32    # Copy output for SESSION_SECRET
openssl rand -base64 32    # Copy output for JWT_SECRET
```

### Step 4: Deploy! (30 seconds)

1. Click **"Deploy"** button (top right)
2. Wait for build to complete (~2 minutes)
3. Your app is live! 🎉

**Your URL:** `https://your-repl-name.replit.app`

---

## ✅ Verification

After deployment, check:

1. **App Loads**: Visit your Replit URL
2. **API Works**: Go to `https://your-repl-name.replit.app/api/health`
3. **Database Connected**: Open **Shell** tab, run:
   ```bash
   npx prisma studio
   ```

---

## 🔧 Optional: Enable Advanced Features

### Email (SendGrid)

Add to **Secrets**:
```bash
SENDGRID_API_KEY=SG.your-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### SMS (Twilio)

Add to **Secrets**:
```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

### File Storage (AWS S3)

Add to **Secrets**:
```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=autolytiq-files
AWS_REGION=us-east-1
```

### AI Features (OpenAI)

Add to **Secrets**:
```bash
OPENAI_API_KEY=sk-...
```

### Payment Processing (Stripe)

Add to **Secrets**:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📚 What Gets Deployed

### Automatically Included:

✅ **Full-stack Application**
- React frontend (built with Vite)
- Node.js backend (built with tsup)
- 41 enterprise database tables
- All migrations automatically applied

✅ **Core Features**
- Automotive CRM
- Deal Desking & F&I
- Inventory Management
- Customer Management
- Lead Tracking
- Activity Logging

✅ **Enterprise Features** (NEW!)
- Multi-channel Campaigns
- Email Sequences
- Support Ticketing
- Knowledge Base
- Project Management
- Document Management
- Custom Dashboards
- Integration Hub

### Build Process (Automatic):

```bash
npm run build:prod
```
1. ✅ Generate Prisma client
2. ✅ Build backend to `dist/index.js`
3. ✅ Build frontend to `dist/public/`

### Startup Process (Automatic):

```bash
npm run start:prod
```
> ⚠️ Run `npm run db:migrate:deploy` (or baseline existing migrations) before starting the app in production.

1. ✅ Start production server on port 5000
2. ✅ Serve API at `/api/*`
3. ✅ Serve frontend at `/`

---

## 🐛 Troubleshooting

### Build Fails

**"DATABASE_URL is not set"**
- Go to Secrets → Add DATABASE_URL

**"Cannot find module 'prisma'"**
```bash
# In Shell:
npm install
npm run build:prod
```

### App Won't Start

**Check Logs:**
- Click "Logs" tab
- Look for error messages

**Common Issues:**
1. DATABASE_URL not set → Add to Secrets
2. SESSION_SECRET too short → Must be 32+ characters
3. Database connection failed → Check database is active

### Database Issues

**"Migration failed"**
```bash
# In Shell:
npx prisma migrate deploy
```

**"Can't connect to database"**
- Verify DATABASE_URL is correct
- For Neon: Check project is active
- For Replit DB: Restart Repl

---

## 🔄 Updating Your Deployment

### Method 1: Auto-Deploy (Recommended)

1. In Replit → **Version Control** tab
2. Enable **"Auto-deploy on push"**
3. Every git push → automatic redeploy

### Method 2: Manual Redeploy

1. Click **"Deploy"** button
2. Replit rebuilds automatically

### Method 3: From Shell

```bash
git pull origin main
npm run build:prod
# Then click Stop → Run
```

---

## 📊 Monitoring

### View Logs
```bash
# In Shell:
npm run start:prod 2>&1 | tee app.log
```

### Check Database
```bash
# In Shell:
npx prisma studio
```

### View Resources
- Click your Repl name → **"Resources"** tab
- Monitor CPU, Memory, Storage

---

## 🎯 Next Steps After Deployment

1. **Create Admin Account**
   - Visit your app URL
   - Sign up with admin email

2. **Configure Dealer Settings**
   - Go to Settings → Organization
   - Add dealer information

3. **Import Data** (Optional)
   - Settings → Import
   - Upload customers, vehicles, etc.

4. **Add Team Members**
   - Settings → Users
   - Invite team members

5. **Enable Integrations**
   - Settings → Integrations
   - Connect email, SMS, storage

6. **Customize**
   - Settings → Features
   - Enable desired modules

---

## 📖 Full Documentation

- **Complete Guide**: [`docs/REPLIT_DEPLOYMENT.md`](/docs/REPLIT_DEPLOYMENT.md)
- **Enterprise Features**: [`docs/ENTERPRISE_CRM_EXTENSION.md`](/docs/ENTERPRISE_CRM_EXTENSION.md)
- **API Documentation**: [`docs/API.md`](/docs/API.md)
- **Architecture**: [`ARCHITECTURE.md`](/ARCHITECTURE.md)

---

## 🆘 Need Help?

**Common Commands:**
```bash
# Test build
npm run build:prod

# Check database
npx prisma db pull

# View schema
npx prisma studio

# Check environment
env | grep DATABASE
```

**Resources:**
- [Replit Documentation](https://docs.replit.com)
- [AutolytiQ GitHub Issues](https://github.com/morpheus18-glitch/autolytiq/issues)

---

## 🎉 You're Live!

Your AutolytiQ instance is now running at:

**`https://your-repl-name.replit.app`**

**Features Available:**
- ✅ Full Automotive CRM
- ✅ Deal Desking & F&I
- ✅ Inventory Management
- ✅ Multi-channel Campaigns
- ✅ Customer Support
- ✅ Project Management
- ✅ Document Management
- ✅ Analytics & Reporting
- ✅ Integration Hub
- ✅ 41 Enterprise Tables

**Happy Dealing! 🚗💼**

---

**Last Updated:** 2025-10-22
**Version:** 2.0.0 Enterprise Edition
**Deployment:** Replit Autoscale Ready
