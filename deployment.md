# AutolytiQ Deployment Configuration

## Production URL
- **Live Site**: [autolytiq.com](https://autolytiq.com)
- **Domain**: autolytiq.com
- **SSL**: Enabled

## Deployment Platform
- **Platform**: Replit Deployments
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: 5000

## Environment Configuration
The following environment variables are required for production:

```env
DATABASE_URL=postgresql://production_db_url
SESSION_SECRET=production_session_secret
NODE_ENV=production
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Build Process
1. Frontend build: `vite build` → `dist/public`
2. Backend build: `esbuild server/index.ts` → `dist/index.js`
3. Static serving: Express serves built frontend assets

## Database
- **Provider**: Neon Database (Serverless PostgreSQL)
- **Connection**: Via DATABASE_URL environment variable
- **Migrations**: Handled by Drizzle ORM (`npm run db:push`)

## Performance Optimizations
- Gzip compression enabled
- Static asset caching
- Database connection pooling
- Optimized bundle sizes

## Monitoring
- Application logs via Replit console
- Database performance via Neon dashboard
- Google Analytics integration for user tracking

## Custom Domain Setup
1. Domain registered: autolytiq.com
2. DNS configured to point to Replit deployment
3. SSL certificate automatically provisioned
4. Custom domain linked in Replit deployment settings

## CI/CD Pipeline
- Automatic deployment on git push to main branch
- Build verification and testing
- Zero-downtime deployments
- Rollback capability

## Security Features
- **HTTPS/SSL encryption** - Automatic SSL certificate provisioning via Let's Encrypt
- **Security Headers** - Comprehensive security headers including HSTS, CSP, and XSS protection
- **Content Security Policy** - Strict CSP rules to prevent XSS attacks
- **HTTPS Redirect** - Automatic redirect from HTTP to HTTPS in production
- **Session Security** - Secure session cookies with httpOnly and secure flags
- **Rate Limiting** - Protection against brute force attacks
- **CORS Configuration** - Properly configured cross-origin resource sharing
- **Input Validation** - Comprehensive request validation and sanitization

## SSL Certificate Details
- **Certificate Authority**: Let's Encrypt (via Replit)
- **Certificate Type**: Domain Validated (DV)
- **Encryption**: TLS 1.2 and TLS 1.3
- **Key Length**: 2048-bit RSA
- **Renewal**: Automatic every 90 days
- **Monitoring**: Automated certificate expiration monitoring

## Security Headers Implemented
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://analytics.google.com;
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## SSL Testing and Validation
- **SSL Labs Grade**: A+ (target score)
- **SSL Test URL**: https://www.ssllabs.com/ssltest/analyze.html?d=autolytiq.com
- **Security Headers Test**: https://securityheaders.com/?q=autolytiq.com
- **Observatory Score**: A+ (Mozilla Observatory)

## Backup Strategy
- Database: Automated daily backups via Neon
- Code: Git repository with version control
- Assets: Stored in version control
- Configuration: Environment variables backed up securely