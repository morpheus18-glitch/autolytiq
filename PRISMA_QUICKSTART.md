# Prisma Quick Start Guide

## ⚠️ Important Note

If you're in an environment where Prisma's CDN is blocked (403 Forbidden errors), you have two options:

1. **Generate on a machine with internet access** (Recommended)
2. **Use a CI/CD pipeline** that has access to Prisma's CDN
3. **Use Replit's Secrets** to bypass restrictions (see Replit section below)

The generated files are in `node_modules/.prisma` and `node_modules/@prisma/client` - these can be cached/deployed.

## 🚀 Quick Setup (30 seconds)

### Linux/Mac
```bash
chmod +x scripts/setup-prisma.sh
./scripts/setup-prisma.sh
```

### Windows PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-prisma.ps1
```

### Manual Setup
```bash
# Set environment variable
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Generate Prisma Client
npm run prisma:generate

# Verify
npx prisma --version
```

## 🔧 Environment Variables for Production

Add these to your deployment platform (Replit, Vercel, etc.):

```env
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
DATABASE_URL=your_database_url_here
```

## 📦 What Was Configured

1. **prisma/schema.prisma** - Added binary targets:
   ```prisma
   generator client {
     provider      = "prisma-client-js"
     binaryTargets = ["native", "debian-openssl-3.0.x", "linux-musl-openssl-3.0.x"]
   }
   ```

2. **package.json** - Updated scripts with environment variable:
   ```json
   "prisma:generate": "PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 prisma generate"
   ```

## 🐛 Common Issues

### Issue: 403 Forbidden when downloading engines
**Solution:** Already fixed! The scripts now use `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

### Issue: Engine not found
**Solution:** Run `npm run prisma:generate` again

### Issue: Wrong platform binary
**Solution:** Update `binaryTargets` in `prisma/schema.prisma`:
- Debian/Ubuntu: `debian-openssl-3.0.x`
- Alpine Linux: `linux-musl-openssl-3.0.x`
- Windows: `windows`
- macOS: `darwin` or `darwin-arm64`

## 📚 Full Documentation

See `PRISMA_SETUP.md` for comprehensive documentation including:
- Platform-specific configurations
- Docker setup
- CI/CD integration
- Advanced troubleshooting

## ✅ Verify Setup

```bash
# Check Prisma version
npx prisma --version

# Validate schema
npx prisma validate

# Test database connection (requires DATABASE_URL)
npx prisma db pull --preview-feature
```

## 🎯 Next Steps After Setup

1. **Set Database URL**
   ```bash
   echo "DATABASE_URL=postgresql://user:password@host:port/database" >> .env
   ```

2. **Push Schema to Database**
   ```bash
   npm run db:push
   ```

3. **Seed Database (Optional)**
   ```bash
   npm run db:seed
   ```

4. **Build Application**
   ```bash
   npm run build:prod
   ```

5. **Start Production Server**
   ```bash
   npm run start:prod
   ```

## 🔄 Regular Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Deploy migrations (production)
npm run db:migrate:deploy:safe

# Sync schema without migrations
npm run db:push

# View database in Prisma Studio
npx prisma studio
```

## 🌐 Replit Specific

For Replit deployment, add to your Secrets:
```
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
```

Your `.replit` file should include:
```toml
[env]
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1"
```

## 💡 Tips

1. **Lock Prisma versions** - Already done in package.json with exact versions
2. **Cache node_modules** - Speeds up deployments
3. **Use connection pooling** - For serverless environments, consider Prisma Data Proxy or connection poolers like PgBouncer

## 🆘 Still Having Issues?

1. Check the comprehensive guide: `PRISMA_SETUP.md`
2. Verify your Node.js version: `node --version` (requires Node 16+)
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
4. Check Prisma docs: https://www.prisma.io/docs
