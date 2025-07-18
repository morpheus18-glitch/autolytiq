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
- HTTPS/SSL encryption
- Session-based authentication
- Environment variable protection
- Input validation and sanitization
- CORS configuration

## Backup Strategy
- Database: Automated daily backups via Neon
- Code: Git repository with version control
- Assets: Stored in version control
- Configuration: Environment variables backed up securely