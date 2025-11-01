# AutolytiQ Deployment Verification Checklist

## System Overview

This document provides a comprehensive checklist for verifying the AutolytiQ automotive dealership management system after deployment. The system includes:

- **Custom Permission System** - Granular, tenant-specific permissions
- **Advanced Design Tokens** - Consistent theming across all interfaces
- **AI-Powered Deal Desking** - ML companion for maximum profit optimization
- **Digital Deal Jackets** - Centralized customer file management
- **Multitenant Authentication** - Store-based login with role management

## Pre-Deployment Checklist

### Database

- [x] Database migration completed (`20241101020000_add_custom_permissions`)
- [x] PermissionDefinition table created
- [x] RolePreset table created
- [x] User table updated with rolePresetId and customPermissions fields
- [ ] Seed permissions and role presets (`npx tsx src/scripts/seed-permissions.ts`)
- [ ] Verify database indexes are applied
- [ ] Run database health check

### Environment Configuration

- [ ] DATABASE_URL configured correctly
- [ ] ML_SERVICE_URL pointing to ML service
- [ ] ML_SERVICE_TOKEN set
- [ ] JWT keys configured (JWT_PUBLIC_KEY, JWT_ISSUER, JWT_AUDIENCE)
- [ ] Redis connection configured
- [ ] S3/MinIO bucket configured for file storage

### Build & Compilation

- [ ] Frontend build completes without errors
- [ ] Backend TypeScript compilation successful
- [ ] Prisma client generated
- [ ] Design tokens package built
- [ ] All dependencies installed

## Post-Deployment Verification

### 1. Authentication & Authorization

#### Login Flow
- [ ] Navigate to `/login`
- [ ] Login page displays with enhanced styling
- [ ] Store ID field accepts input
- [ ] Username field accepts input
- [ ] Password field accepts input (masked)
- [ ] Submit button shows gradient animation
- [ ] Invalid credentials show error toast
- [ ] Valid credentials redirect to dashboard
- [ ] Session persists across page reloads

#### Permission System
- [ ] Super admin user has all permissions
- [ ] Users with role presets have correct permissions
- [ ] Custom user permissions override role presets
- [ ] Permission checks work on protected routes
- [ ] Unauthorized access shows 403 error

#### Admin Interfaces
- [ ] `/admin/role-presets` page loads
- [ ] Can create custom role presets
- [ ] Can edit existing role presets
- [ ] Can assign permissions to roles
- [ ] System roles cannot be deleted
- [ ] Custom roles can be deleted
- [ ] `/admin/user-permissions` page loads
- [ ] Can assign role presets to users
- [ ] Can add custom permissions per user
- [ ] Effective permissions display correctly

### 2. Design System

#### Theme Application
- [ ] Design tokens load without errors
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Theme toggle works smoothly
- [ ] Colors are consistent across pages
- [ ] Typography is consistent
- [ ] Spacing follows 8px grid
- [ ] Border radius values are consistent

#### Component Styling
- [ ] Buttons use gradient animations
- [ ] Input fields have glass morphism effect
- [ ] Cards have elevation shadows
- [ ] Modal dialogs display correctly
- [ ] Tooltips appear with correct positioning
- [ ] Badges have correct colors
- [ ] Alerts show semantic colors

### 3. Deal Desking & AI Companion

#### Desking Workspace
- [ ] Deal worksheet can be created
- [ ] Vehicle information auto-populates
- [ ] Customer information auto-populates
- [ ] Trade-in values can be entered
- [ ] Finance terms can be adjusted
- [ ] Down payment calculation works
- [ ] Monthly payment calculation accurate
- [ ] APR calculation correct

#### ML-Powered Optimization
- [ ] Click "Optimize Deal" button
- [ ] AI companion suggests deal improvements
- [ ] Gross profit recommendations display
- [ ] Payment optimization suggestions shown
- [ ] F&I product recommendations appear
- [ ] Approval probability calculated
- [ ] Deal scoring shows confidence level
- [ ] Alternative structures suggested

#### Counter Offer Analysis
- [ ] Enter customer counter offer
- [ ] AI analyzes counter offer impact
- [ ] Profit impact calculated
- [ ] Alternative responses suggested
- [ ] Negotiation strategy provided
- [ ] Risk assessment shown

### 4. Digital Deal Jackets

#### Deal Jacket Creation
- [ ] New deal jacket can be created
- [ ] Associated with customer record
- [ ] Vehicle details populate automatically
- [ ] Finance manager can be assigned
- [ ] Salesperson assigned correctly
- [ ] Lender can be selected

#### Document Management
- [ ] Upload customer ID document
- [ ] Upload proof of income
- [ ] Upload proof of residence
- [ ] Upload credit application
- [ ] Upload insurance card
- [ ] Upload trade-in title
- [ ] Documents display in jacket
- [ ] Documents can be downloaded
- [ ] Document version history tracked

#### File Organization
- [ ] Documents categorized correctly
- [ ] Quick search finds documents
- [ ] Document status indicators work
- [ ] Required documents flagged
- [ ] Missing documents highlighted
- [ ] Compliance checklist updates

### 5. Data Push/Pull Functionality

#### Auto-Population
- [ ] VIN lookup populates vehicle data
- [ ] Credit bureau pull populates customer credit info
- [ ] Customer history loads from CRM
- [ ] Trade-in valuation pulls KBB/NADA data
- [ ] Market pricing data refreshes
- [ ] Lender rate sheets update

#### External Integrations
- [ ] DMS integration sends deal data
- [ ] RouteOne credit submissions work
- [ ] 700Credit integration functional
- [ ] DocuSign integration sends documents
- [ ] Accounting export works
- [ ] Inventory feed updates

#### Field Mapping
- [ ] Customer name maps correctly
- [ ] Address fields populate
- [ ] Phone numbers format correctly
- [ ] Email addresses validate
- [ ] SSN fields encrypt properly
- [ ] VIN validates and formats

### 6. Performance & Optimization

#### Page Load Times
- [ ] Login page loads < 1s
- [ ] Dashboard loads < 2s
- [ ] Deal workspace loads < 2s
- [ ] Large tables load with pagination
- [ ] Search results appear instantly
- [ ] No UI blocking on ML requests

#### API Response Times
- [ ] Auth endpoints respond < 500ms
- [ ] Deal CRUD operations < 1s
- [ ] ML optimization < 3s
- [ ] File uploads progress smoothly
- [ ] Bulk operations complete
- [ ] WebSocket connections stable

### 7. Mobile Responsiveness

- [ ] Login page mobile-friendly
- [ ] Dashboard adapts to screen size
- [ ] Tables scroll horizontally on mobile
- [ ] Forms stack vertically on mobile
- [ ] Touch targets adequate size
- [ ] Modals fit mobile screens

### 8. Error Handling

#### User Errors
- [ ] Invalid login shows clear message
- [ ] Form validation highlights errors
- [ ] Missing required fields indicated
- [ ] Network errors display toast
- [ ] Timeout errors handled gracefully

#### System Errors
- [ ] 500 errors show user-friendly message
- [ ] Database errors logged
- [ ] ML service failures fall back gracefully
- [ ] File upload errors handled
- [ ] Circuit breaker prevents cascading failures

### 9. Security

#### Authentication
- [ ] Passwords hashed (bcrypt)
- [ ] JWT tokens expire correctly
- [ ] Refresh tokens rotate
- [ ] Session hijacking prevented
- [ ] CSRF protection enabled

#### Authorization
- [ ] Row-level security enforced
- [ ] Tenant isolation working
- [ ] API endpoints check permissions
- [ ] Sensitive data masked
- [ ] Audit logs capture actions

#### Data Protection
- [ ] HTTPS enforced
- [ ] Sensitive files encrypted at rest
- [ ] PII handled per compliance
- [ ] SQL injection prevented
- [ ] XSS attacks mitigated

### 10. Monitoring & Logging

#### Application Logs
- [ ] Request logging enabled
- [ ] Error logs captured
- [ ] Audit trail complete
- [ ] Performance metrics collected
- [ ] ML predictions logged

#### System Health
- [ ] Database connection pool healthy
- [ ] Redis cache responsive
- [ ] ML service connectivity verified
- [ ] File storage accessible
- [ ] Background jobs running

## Common Issues & Solutions

### Issue: Login fails with "Invalid credentials"
**Solution**: Check JWT configuration in .env file. Verify JWT_PUBLIC_KEY, JWT_ISSUER, and JWT_AUDIENCE match between backend and token generation.

### Issue: Permissions not applying
**Solution**: Run seed script to populate permissions: `npx tsx apps/backend/src/scripts/seed-permissions.ts`

### Issue: ML optimization times out
**Solution**: Increase ML_SERVICE_URL timeout or check ML service health. Default timeout is 300ms with circuit breaker fallback.

### Issue: File uploads fail
**Solution**: Verify S3_BUCKET and S3_ENDPOINT configuration. Check MinIO is running: `docker compose ps`

### Issue: Design tokens not loading
**Solution**: Rebuild tokens package: `cd packages/tokens && npm run build`

## Performance Benchmarks

### Target Metrics
- **Login**: < 1 second
- **Dashboard Load**: < 2 seconds
- **Deal Optimization**: < 3 seconds
- **File Upload (10MB)**: < 5 seconds
- **Search Results**: < 500ms
- **Page Transitions**: < 300ms

### Database Queries
- **Index Usage**: > 95%
- **Query Time (p95)**: < 100ms
- **Connection Pool**: 10-50 connections
- **Cache Hit Rate**: > 80%

## Support & Troubleshooting

### Logs Location
- **Backend**: `docker logs autolytiq-backend-1`
- **Database**: `docker logs autolytiq-postgres`
- **ML Service**: `docker logs autolytiq-ml-1`

### Health Check Endpoints
- **API**: `http://localhost:5000/health`
- **ML Service**: `http://localhost:8000/health`
- **Database**: Check with `docker exec autolytiq-postgres pg_isready`

### Restart Services
```bash
# Restart all services
cd /root/autolytiq
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart postgres
```

## Sign-Off

- [ ] All critical features tested
- [ ] Performance meets benchmarks
- [ ] Security verified
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Stakeholders notified

**Deployed By**: _________________
**Date**: _________________
**Environment**: [ ] Development [ ] Staging [ ] Production
**Version**: _________________
