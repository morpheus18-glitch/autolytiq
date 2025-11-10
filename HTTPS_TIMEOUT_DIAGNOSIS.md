# Kubernetes Ingress HTTPS Timeout - Root Cause Analysis

## Executive Summary

**Root Cause**: Network Policy blocking port 80 traffic from ingress-nginx namespace to frontend pods.

**Impact**: HTTPS requests to https://autolytiq.com timeout after 60 seconds with HTTP 499/504 errors.

**Fix**: Add port 80 to the NetworkPolicy ingress rules for traffic from ingress-nginx namespace.

---

## Diagnostic Timeline

### 1. Initial Symptoms
- HTTPS requests to https://autolytiq.com timeout
- HTTP redirects work (308 → HTTPS) but HTTPS fails
- curl with -k to https://45.55.98.200 returns HTTP 504
- Ingress controller logs show:
  - "client sent an HTTP request to an HTTPS server" (TLS handshake errors)
  - HTTP 499 (client closed connection)
  - "upstream timed out (110: Operation timed out) while connecting to upstream"

### 2. Configuration Review

#### Ingress Configuration (/root/autolytiq/k8s/ingress.yaml)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: autolytiq-ingress
  namespace: autolytiq-prod
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - autolytiq.com
        - www.autolytiq.com
      secretName: autolytiq-tls
  rules:
    - host: autolytiq.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: autolytiq-backend
                port:
                  number: 3000
          - path: /health
            pathType: Prefix
            backend:
              service:
                name: autolytiq-backend
                port:
                  number: 3000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: autolytiq-frontend
                port:
                  number: 80  # ← Frontend service on port 80
```

**Status**: ✅ Ingress configuration is correct

#### TLS Certificate
```bash
kubectl get certificate -n autolytiq-prod autolytiq-tls
# NAME            READY   SECRET          AGE
# autolytiq-tls   True    autolytiq-tls   8d
```

Certificate details:
- Issuer: Let's Encrypt (letsencrypt-prod)
- Status: Ready
- Hosts: autolytiq.com, www.autolytiq.com
- Valid: 2025-11-08 to 2026-02-06

**Status**: ✅ TLS certificate is valid and properly configured

#### Frontend Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: autolytiq-frontend
  namespace: autolytiq-prod
spec:
  type: ClusterIP
  selector:
    app: autolytiq
    component: frontend
  ports:
    - name: http
      port: 80
      targetPort: 80
      protocol: TCP
```

Service endpoints:
```
10.109.36.89:80  (autolytiq-frontend-5fc9d9f745-85kxg)
10.109.37.78:80  (autolytiq-frontend-5fc9d9f745-v4lfv)
```

**Status**: ✅ Service is healthy with 2 ready endpoints

#### Frontend Pods
```bash
kubectl exec -n autolytiq-prod autolytiq-frontend-5fc9d9f745-85kxg -- ps aux
# nginx: master process nginx -g daemon off;
# nginx: worker process

kubectl exec -n autolytiq-prod autolytiq-frontend-5fc9d9f745-85kxg -- ss -tlnp
# 0.0.0.0:80    LISTEN    1/nginx: master pro
```

Pod logs show successful health checks:
```
10.109.36.11 - - [08/Nov/2025:20:52:00 +0000] "GET / HTTP/1.1" 200 3184 "-" "kube-probe/1.33" "-"
```

**Status**: ✅ Frontend pods are running and responding on port 80

### 3. Network Connectivity Testing

#### Pod-to-Pod (Internal)
```bash
kubectl exec -n autolytiq-prod autolytiq-frontend-5fc9d9f745-85kxg -- \
  wget -O- --timeout=2 http://10.109.36.89:80/
# ✅ SUCCESS - Returns HTML in < 1 second
```

#### Ingress Controller to Frontend Service
```bash
kubectl exec -n ingress-nginx ingress-nginx-controller-5dcb5b7bff-sd4mn -- \
  curl -v -H "Host: autolytiq.com" http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/
# ❌ TIMEOUT after 120+ seconds
# Trying 10.108.34.99:80...
# [hangs indefinitely]
```

**This is the smoking gun!** The ingress controller cannot reach the frontend service on port 80.

### 4. Network Policy Analysis

Current NetworkPolicy in autolytiq-prod namespace:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: autolytiq-network-policy
  namespace: autolytiq-prod
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 5000  # backend
        - protocol: TCP
          port: 3000  # frontend (legacy)
        - protocol: TCP
          port: 8080  # frontend (nginx)
        - protocol: TCP
          port: 8000  # ml-service
        # ❌ PORT 80 IS MISSING!
```

The policy allows:
- ✅ Port 3000 (backend)
- ✅ Port 5000 (backend alternative)
- ✅ Port 8000 (ml-service)
- ✅ Port 8080 (alternative)
- ❌ Port 80 (frontend nginx) - **MISSING!**

Ingress-nginx namespace has correct label:
```bash
kubectl get namespace ingress-nginx --show-labels
# NAME            STATUS   AGE   LABELS
# ingress-nginx   Active   10d   name=ingress-nginx  ✅
```

---

## Root Cause Confirmation

The NetworkPolicy allows the ingress-nginx namespace to access ports 3000, 5000, 8000, and 8080, but **NOT port 80**, which is the port the frontend service uses.

This explains all observed symptoms:
1. **Health checks work** - Kubernetes health probes come from within the same namespace (allowed by second ingress rule with `podSelector: {}`)
2. **Pod-to-pod works** - Internal communication is allowed
3. **Ingress to frontend fails** - Port 80 is blocked from ingress-nginx namespace
4. **60-second timeout** - nginx default proxy_connect_timeout
5. **HTTP 499/504** - Client gives up, nginx reports upstream timeout

---

## The Fix

### Step 1: Apply Updated NetworkPolicy

```bash
kubectl apply -f /root/autolytiq/network-policy-fixed.yaml
```

**File location**: `/root/autolytiq/network-policy-fixed.yaml`

**Changes**:
- Added `port: 80` to ingress rules from ingress-nginx namespace
- Added `port: 80` to inter-pod communication rules
- Added `port: 50052` for rust-comm-service gRPC

### Step 2: Verify Network Policy Applied

```bash
kubectl get networkpolicy -n autolytiq-prod autolytiq-network-policy -o yaml
```

Look for port 80 in the ingress rules:
```yaml
spec:
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - port: 80    # ← Should be present now
          protocol: TCP
```

### Step 3: Test Connectivity from Ingress Controller

```bash
kubectl exec -n ingress-nginx \
  $(kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -o jsonpath='{.items[0].metadata.name}') -- \
  curl -s -o /dev/null -w "%{http_code}" -H "Host: autolytiq.com" \
  http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/
```

**Expected output**: `200` (should return in < 1 second)

### Step 4: Test HTTPS Endpoint

```bash
# From outside the cluster
curl -v https://autolytiq.com/
```

**Expected output**:
```
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
< HTTP/2 200
< content-type: text/html
...
<!DOCTYPE html>
```

### Step 5: Monitor Ingress Controller Logs

```bash
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=50 -f
```

**Expected**: No more "upstream timed out" or HTTP 499/504 errors for autolytiq.com

### Step 6: Verify Certificate is Working

```bash
curl -vI https://autolytiq.com 2>&1 | grep -A 5 "SSL connection"
```

**Expected**:
```
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* Server certificate:
*  subject: CN=autolytiq.com
*  issuer: C=US; O=Let's Encrypt; CN=R12
*  SSL certificate verify ok.
```

---

## Complete Configuration Files

### Fixed NetworkPolicy (/root/autolytiq/network-policy-fixed.yaml)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: autolytiq-network-policy
  namespace: autolytiq-prod
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # Allow traffic from ingress controller
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 80    # frontend nginx (FIXED - was missing!)
        - protocol: TCP
          port: 3000  # backend
        - protocol: TCP
          port: 5000  # backend (alternative)
        - protocol: TCP
          port: 8000  # ml-service
        - protocol: TCP
          port: 8080  # alternative ports
    # Allow inter-pod communication within namespace
    - from:
        - podSelector: {}
      ports:
        - protocol: TCP
          port: 80    # frontend nginx
        - protocol: TCP
          port: 3000  # backend
        - protocol: TCP
          port: 5000  # backend (alternative)
        - protocol: TCP
          port: 8000  # ml-service
        - protocol: TCP
          port: 8080  # alternative ports
        - protocol: TCP
          port: 50051  # rust-pricing gRPC
        - protocol: TCP
          port: 50052  # rust-comm-service gRPC
        - protocol: TCP
          port: 6379   # redis
  egress:
    # Allow all egress (can be restricted later based on requirements)
    - to:
        - podSelector: {}
    - to:
        - namespaceSelector: {}
    - ports:
        - protocol: TCP
        - protocol: UDP
```

---

## Technical Details

### Why TLS Handshake Errors?

The "client sent an HTTP request to an HTTPS server" errors in logs are from IP `10.109.5.26`, which appears to be a transient pod (not currently running). These are unrelated to the main timeout issue but indicate some client/probe is attempting HTTP on the HTTPS port 443.

### Why HTTP 499 and 504?

1. **HTTP 499**: Client closed the connection before nginx could respond
   - Happens when browsers/clients give up waiting (typically 30-60 seconds)
   - nginx logs this when it was still waiting for the upstream

2. **HTTP 504 Gateway Timeout**: Upstream server didn't respond in time
   - nginx default `proxy_connect_timeout` is 60 seconds
   - Ingress configuration sets this to 60s explicitly
   - After 60s with no response from backend, nginx returns 504

### Network Policy Evaluation Order

Kubernetes NetworkPolicies use OR logic for rules:
1. If ANY ingress rule matches, traffic is allowed
2. Our policy has two ingress rules:
   - Rule 1: From ingress-nginx namespace → specific ports
   - Rule 2: From same namespace (podSelector: {}) → specific ports

Health checks work because they originate from within autolytiq-prod namespace (Rule 2), but external traffic through ingress-nginx is blocked on port 80 (Rule 1 doesn't include port 80).

---

## Verification Commands Summary

```bash
# 1. Apply the fix
kubectl apply -f /root/autolytiq/network-policy-fixed.yaml

# 2. Verify policy updated
kubectl get networkpolicy -n autolytiq-prod autolytiq-network-policy -o yaml | grep -A 2 "port: 80"

# 3. Test from ingress controller
kubectl exec -n ingress-nginx \
  $(kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -o jsonpath='{.items[0].metadata.name}') -- \
  curl -s -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -H "Host: autolytiq.com" \
  http://autolytiq-frontend.autolytiq-prod.svc.cluster.local:80/ \
  -o /dev/null

# 4. Test HTTPS externally
curl -v https://autolytiq.com/

# 5. Monitor logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=20 -f

# 6. Check certificate
echo | openssl s_client -connect autolytiq.com:443 -servername autolytiq.com 2>/dev/null | \
  openssl x509 -noout -subject -issuer -dates
```

---

## Prevention

To prevent this issue in the future:

1. **Document Port Requirements**: Maintain a list of all ports used by each service
   - Frontend: 80 (nginx)
   - Backend: 3000 (node.js)
   - ML Service: 8000 (FastAPI)
   - Rust Pricing: 50051 (gRPC)
   - Rust Comm: 50052 (gRPC)
   - Redis: 6379

2. **Test Network Policies**: After applying any NetworkPolicy changes, test connectivity:
   ```bash
   # Test script
   for port in 80 3000 8000; do
     kubectl exec -n ingress-nginx <ingress-pod> -- \
       curl -s -o /dev/null -w "Port $port: %{http_code}\n" \
       http://<service>.<namespace>.svc.cluster.local:$port/
   done
   ```

3. **Monitor Ingress Logs**: Set up alerts for:
   - HTTP 499 (client timeout)
   - HTTP 504 (gateway timeout)
   - "upstream timed out"
   - "connection refused"

4. **Use Network Policy Testing Tools**:
   - `kubectl auth can-i` for RBAC
   - `netshoot` pod for network debugging
   - Cilium CLI for network policy visualization (if using Cilium)

---

## Related Files

- NetworkPolicy: `/root/autolytiq/network-policy-fixed.yaml`
- Ingress: `/root/autolytiq/k8s/ingress.yaml`
- Frontend Deployment: `/root/autolytiq/k8s/frontend-deployment.yaml`
- Backend Deployment: `/root/autolytiq/k8s/backend-deployment.yaml`

---

## References

- Kubernetes NetworkPolicy: https://kubernetes.io/docs/concepts/services-networking/network-policies/
- NGINX Ingress Controller: https://kubernetes.github.io/ingress-nginx/
- cert-manager: https://cert-manager.io/
- Let's Encrypt: https://letsencrypt.org/

---

**Generated**: 2025-11-08
**Status**: Ready to apply fix
**Risk Level**: Low (only adding permissions, not removing)
