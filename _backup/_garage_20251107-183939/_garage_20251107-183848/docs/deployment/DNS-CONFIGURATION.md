# DNS Configuration for autolytiq.com

## Required DNS Records

To make the site accessible at autolytiq.com and enable HTTPS, configure the following DNS records with your domain registrar:

### Load Balancer IP Address
```
45.55.98.200
```

### A Records (Point to Load Balancer)
```
Type    Host                Value           TTL
A       @                   45.55.98.200    3600
A       www                 45.55.98.200    3600
A       app                 45.55.98.200    3600
A       api                 45.55.98.200    3600
A       ml                  45.55.98.200    3600
A       dms                 45.55.98.200    3600
```

### Alternative: CNAME Records (for subdomains)
If your DNS provider requires CNAME records for subdomains instead:
```
Type    Host                Value                           TTL
A       @                   45.55.98.200                    3600
CNAME   www                 autolytiq.com                   3600
CNAME   app                 autolytiq.com                   3600
CNAME   api                 autolytiq.com                   3600
CNAME   ml                  autolytiq.com                   3600
CNAME   dms                 autolytiq.com                   3600
```

## Domain Mapping

| Domain | Service | Purpose |
|--------|---------|---------|
| autolytiq.com | Frontend | Main application |
| www.autolytiq.com | Frontend | Main application (www alias) |
| app.autolytiq.com | Frontend | Application interface |
| api.autolytiq.com | Backend | REST API |
| ml.autolytiq.com | ML Service | Machine Learning API |
| dms.autolytiq.com | Frontend | DMS interface |

## HTTPS/TLS Certificates

- **Certificate Authority**: Let's Encrypt (via cert-manager)
- **Certificate Type**: Wildcard certificate for *.autolytiq.com + autolytiq.com
- **Auto-renewal**: Enabled (30 days before expiration)
- **TLS Protocols**: TLSv1.2, TLSv1.3
- **HSTS**: Enabled with 1-year max-age

## Verification Steps

After configuring DNS:

1. **Check DNS propagation** (may take 5-60 minutes):
   ```bash
   dig autolytiq.com
   dig app.autolytiq.com
   dig api.autolytiq.com
   ```

2. **Verify ingress**:
   ```bash
   kubectl get ingress -n autolytiq-prod
   kubectl get certificates -n autolytiq-prod
   ```

3. **Check certificate status**:
   ```bash
   kubectl describe certificate autolytiq-tls -n autolytiq-prod
   ```

4. **Test HTTPS access**:
   ```bash
   curl -I https://autolytiq.com
   curl -I https://app.autolytiq.com
   curl -I https://api.autolytiq.com/health
   ```

## Security Features Enabled

✅ **HTTPS Enforcement**: All HTTP traffic redirected to HTTPS
✅ **Strong SSL/TLS**: TLSv1.2+ with secure cipher suites
✅ **HSTS**: Strict-Transport-Security header (1 year)
✅ **Security Headers**: X-Frame-Options, X-Content-Type-Options, CSP
✅ **Rate Limiting**: 100 requests/second per IP
✅ **Connection Limits**: 20 concurrent connections per IP
✅ **DDoS Protection**: Connection limits and bandwidth throttling
✅ **Bot Protection**: User-agent filtering in nginx
✅ **Network Policy**: Restricted pod-to-pod communication

## Certificate Issuance

Let's Encrypt will automatically issue certificates once DNS is properly configured. The process:

1. cert-manager creates an HTTP-01 challenge
2. Challenge served at `http://domain/.well-known/acme-challenge/`
3. Let's Encrypt verifies domain ownership
4. Certificate issued and stored in Kubernetes secret
5. Auto-renewal 30 days before expiration

**Note**: Certificate issuance requires DNS to be pointing to the load balancer IP (45.55.98.200) for all domains.

## Troubleshooting

If certificates don't issue:
```bash
# Check certificate events
kubectl describe certificate autolytiq-tls -n autolytiq-prod

# Check challenges
kubectl get challenges -n autolytiq-prod

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Verify DNS resolution
nslookup autolytiq.com
```

## CloudFlare (Optional)

If using CloudFlare:
1. Set SSL/TLS mode to "Full (strict)"
2. Disable "Always Use HTTPS" (let nginx handle redirects)
3. Enable "Authenticated Origin Pulls" for extra security
4. Configure rate limiting at CloudFlare level for additional DDoS protection
