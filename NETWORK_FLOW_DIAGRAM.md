# Network Flow Diagram - HTTPS Timeout Issue

## Current State (BROKEN)

```
Internet
   |
   | HTTPS Request
   | https://autolytiq.com
   |
   v
┌─────────────────────────────────────┐
│  DigitalOcean Load Balancer         │
│  IP: 45.55.98.200                   │
│  Port 443 (HTTPS)                   │
└─────────────────────────────────────┘
   |
   | TLS Termination at Load Balancer
   | Forwards to Ingress Controller
   |
   v
┌─────────────────────────────────────┐
│  Namespace: ingress-nginx           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ingress-nginx-controller      │ │
│  │ Pod IP: 10.109.5.80           │ │
│  │ Listening: 80 (HTTP), 443     │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
   |
   | Attempts to route to:
   | autolytiq-frontend.autolytiq-prod.svc.cluster.local:80
   |
   | ❌ BLOCKED BY NETWORKPOLICY ❌
   |    NetworkPolicy allows:
   |    ✓ Port 3000 from ingress-nginx
   |    ✓ Port 5000 from ingress-nginx
   |    ✓ Port 8000 from ingress-nginx
   |    ✓ Port 8080 from ingress-nginx
   |    ✗ Port 80 from ingress-nginx ← MISSING!
   |
   v
┌─────────────────────────────────────┐
│  Namespace: autolytiq-prod          │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ NetworkPolicy                 │ │
│  │ Name: autolytiq-network-policy│ │
│  │                               │ │
│  │ Ingress Rules:                │ │
│  │   From: ingress-nginx         │ │
│  │   Ports: 3000, 5000, 8000,    │ │
│  │          8080                 │ │
│  │   ❌ 80 NOT IN LIST!          │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Service: autolytiq-frontend   │ │
│  │ ClusterIP: 10.108.34.99       │ │
│  │ Port: 80 → TargetPort: 80     │ │
│  │                               │ │
│  │ ⏱️ NEVER REACHED              │ │
│  │ ⌛ Timeout after 60 seconds   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌─────────────────┬─────────────┐ │
│  │ Pod 1           │ Pod 2       │ │
│  │ 10.109.36.89:80 │10.109.37.78 │ │
│  │ ✅ HEALTHY      │ ✅ HEALTHY  │ │
│  │ nginx running   │nginx running│ │
│  └─────────────────┴─────────────┘ │
└─────────────────────────────────────┘

Result: HTTP 504 Gateway Timeout after 60 seconds
Logs: "upstream timed out (110: Operation timed out)"
```

---

## Fixed State (WORKING)

```
Internet
   |
   | HTTPS Request
   | https://autolytiq.com
   |
   v
┌─────────────────────────────────────┐
│  DigitalOcean Load Balancer         │
│  IP: 45.55.98.200                   │
│  Port 443 (HTTPS)                   │
└─────────────────────────────────────┘
   |
   | TLS Termination + Certificate
   | Subject: CN=autolytiq.com
   | Issuer: Let's Encrypt R12
   | Valid until: 2026-02-06
   |
   v
┌─────────────────────────────────────┐
│  Namespace: ingress-nginx           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ingress-nginx-controller      │ │
│  │ Pod IP: 10.109.5.80           │ │
│  │                               │ │
│  │ Routes:                       │ │
│  │   autolytiq.com/     → :80   │ │
│  │   autolytiq.com/api  → :3000 │ │
│  │   autolytiq.com/health→:3000 │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
   |
   | HTTP request to:
   | autolytiq-frontend.autolytiq-prod.svc.cluster.local:80
   |
   | ✅ ALLOWED BY NETWORKPOLICY ✅
   |    NetworkPolicy allows:
   |    ✓ Port 80 from ingress-nginx    ← ADDED!
   |    ✓ Port 3000 from ingress-nginx
   |    ✓ Port 5000 from ingress-nginx
   |    ✓ Port 8000 from ingress-nginx
   |    ✓ Port 8080 from ingress-nginx
   |
   v
┌─────────────────────────────────────┐
│  Namespace: autolytiq-prod          │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ NetworkPolicy                 │ │
│  │ Name: autolytiq-network-policy│ │
│  │                               │ │
│  │ Ingress Rules:                │ │
│  │   From: ingress-nginx         │ │
│  │   Ports: 80, 3000, 5000,      │ │
│  │          8000, 8080           │ │
│  │   ✅ 80 NOW INCLUDED!         │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Service: autolytiq-frontend   │ │
│  │ ClusterIP: 10.108.34.99       │ │
│  │ Port: 80 → TargetPort: 80     │ │
│  │                               │ │
│  │ Endpoints:                    │ │
│  │   - 10.109.36.89:80           │ │
│  │   - 10.109.37.78:80           │ │
│  └───────────────────────────────┘ │
│          |            |              │
│          v            v              │
│  ┌─────────────────┬─────────────┐ │
│  │ Pod 1           │ Pod 2       │ │
│  │ 10.109.36.89:80 │10.109.37.78 │ │
│  │ ✅ RECEIVES REQ │✅ RECEIVES  │ │
│  │ nginx responds  │nginx respond│ │
│  │ HTTP 200 + HTML │HTTP 200+HTML│ │
│  └─────────────────┴─────────────┘ │
└─────────────────────────────────────┘
   |
   | HTTP 200 OK
   | Content-Type: text/html
   | <!DOCTYPE html>...
   |
   v
┌─────────────────────────────────────┐
│  Ingress Controller                 │
│  Proxies response back              │
└─────────────────────────────────────┘
   |
   | HTTPS response with TLS
   |
   v
┌─────────────────────────────────────┐
│  Load Balancer                      │
│  Forwards to client                 │
└─────────────────────────────────────┘
   |
   | HTTPS Response
   | HTTP/2 200
   |
   v
  User Browser
  ✅ Page loads successfully!

Result: HTTP 200 OK in < 1 second
Logs: "GET / HTTP/2.0" 200
```

---

## Key Differences

| Aspect | Before (Broken) | After (Fixed) |
|--------|----------------|---------------|
| NetworkPolicy Ports | 3000, 5000, 8000, 8080 | **80**, 3000, 5000, 8000, 8080 |
| Ingress → Frontend | ❌ Blocked | ✅ Allowed |
| Response Time | 60s timeout | < 1s success |
| HTTP Status | 504 Gateway Timeout | 200 OK |
| User Experience | Page doesn't load | ✅ Page loads |

---

## Why Health Checks Still Worked

```
┌─────────────────────────────────────┐
│  Namespace: autolytiq-prod          │
│                                     │
│  Kubelet (on same node)             │
│     |                               │
│     | Health probe:                 │
│     | GET http://10.109.36.89:80/   │
│     |                               │
│     | ✅ Allowed by 2nd rule:       │
│     |    From: podSelector: {}      │
│     |    (same namespace)           │
│     v                               │
│  ┌─────────────────┐                │
│  │ Frontend Pod    │                │
│  │ 10.109.36.89:80 │                │
│  │ Status: Running │                │
│  │ Ready: 1/1      │                │
│  └─────────────────┘                │
└─────────────────────────────────────┘
```

Health checks originate from within the `autolytiq-prod` namespace (kubelet runs on the same node), so they're allowed by the second NetworkPolicy rule that permits inter-pod communication.

External traffic from `ingress-nginx` namespace was blocked because the first rule (specific to ingress-nginx) didn't include port 80.

---

## Traffic Flow After Fix

1. **Client** → https://autolytiq.com
2. **Load Balancer** (45.55.98.200:443) → TLS termination
3. **Ingress Controller** (ingress-nginx namespace) → Routes based on host/path
4. **NetworkPolicy** → ✅ Allows port 80 from ingress-nginx
5. **Frontend Service** (autolytiq-frontend:80) → Load balances to pods
6. **Frontend Pod** (nginx on port 80) → Returns HTML
7. **Response** → Back through ingress controller → Load balancer → Client

Total time: **< 1 second** ✅

---

## Monitoring Points

```
┌─────────────┐
│   Client    │ ← Monitor: Browser DevTools (Network tab)
└─────────────┘
       ↓
┌─────────────┐
│Load Balancer│ ← Monitor: DO Dashboard, LB metrics
└─────────────┘
       ↓
┌─────────────┐
│   Ingress   │ ← Monitor: kubectl logs -n ingress-nginx
└─────────────┘   Look for: HTTP status, upstream errors
       ↓
┌─────────────┐
│ NetworkPolicy│ ← Monitor: Test with curl from ingress pod
└─────────────┘   Verify: Port 80 in policy
       ↓
┌─────────────┐
│  Service    │ ← Monitor: kubectl get endpoints
└─────────────┘   Verify: Endpoints exist
       ↓
┌─────────────┐
│    Pod      │ ← Monitor: kubectl logs, health checks
└─────────────┘   Verify: nginx listening on port 80
```

---

## Prevention Checklist

- [ ] Document all service ports in a central location
- [ ] Update NetworkPolicy when adding/changing services
- [ ] Test connectivity after any NetworkPolicy change
- [ ] Monitor ingress logs for "upstream timed out" errors
- [ ] Set up alerts for HTTP 504/499 responses
- [ ] Review NetworkPolicy during quarterly security audits
- [ ] Use consistent port numbers (avoid mixing 80/8080/3000 for same type of service)

---

**Generated**: 2025-11-08
**Issue**: Kubernetes NetworkPolicy missing port 80
**Status**: Fix ready to apply
