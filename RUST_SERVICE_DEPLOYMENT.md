# Rust Pricing Service Deployment Guide

**Status**: ✅ Integration Complete
**Date**: November 4, 2025
**Service**: Price Engine (gRPC)
**Port**: 50051

## Overview

The Rust pricing service is a high-performance gRPC microservice that handles real-time payment calculations, gross profit analysis, market data, and price markdown suggestions. It's designed for sub-100ms response times.

## Architecture

```
┌─────────────┐      HTTP/REST      ┌──────────────────┐      gRPC       ┌────────────────┐
│   Frontend  │ ─────────────────> │  Node.js Backend │ ──────────────> │  Rust Service  │
│   (React)   │  /api/pricing/*    │  (Express.js)    │   Port 50051   │  (Price Engine)│
└─────────────┘                     └──────────────────┘                 └────────────────┘
```

### Components Created

#### 1. **Rust gRPC Service** (`/services/rust/price-engine/`)
- **Proto Definitions**: `/services/rust/proto/price_engine.proto`
- **Payment Calculator**: High-performance loan calculations
- **Gross Calculator**: Profit breakdown analysis
- **Market Pricing**: Competitive pricing data
- **Markdown Suggester**: Aging-based price recommendations

**Key Files**:
- `src/main.rs` - Service entry point
- `src/server.rs` - gRPC server implementation
- `src/services/payment_calculator.rs` - Core payment logic
- `Dockerfile` - Multi-stage build configuration

#### 2. **Node.js Bridge Service** (`/apps/backend/src/`)
- **gRPC Client**: `/lib/grpc/priceEngineClient.ts`
- **Service Wrapper**: `/services/rustPricing.service.ts`
- **REST API Routes**: `/routes/pricing.routes.ts`

**Exposed Endpoints**:
```
POST /api/pricing/calculate-payment
POST /api/pricing/calculate-gross
POST /api/pricing/market-data
POST /api/pricing/suggest-markdown
GET  /api/pricing/health
```

#### 3. **Frontend Integration** (`/apps/frontend/src/`)
- **API Client**: `/services/pricingApi.ts`
- **Hook Integration**: `/hooks/useDealCalculation.ts` (updated)
- **Context Integration**: Uses existing `DealStudioContext`

## Deployment Steps

### Option A: Docker Compose (Recommended for Development)

1. **Build and start the Rust service**:
```bash
cd /root/autolytiq
docker-compose up -d rust-price-engine
```

2. **Verify the service is running**:
```bash
docker ps | grep rust-price-engine
docker logs rust-price-engine
```

3. **Health check**:
```bash
grpcurl -plaintext localhost:50051 autolytiq.pricing.PriceEngine/GetHealth
```

### Option B: Standalone Docker Build

1. **Build the Docker image**:
```bash
cd /root/autolytiq
docker build \
  -f services/rust/Dockerfile \
  --build-arg SERVICE_NAME=price-engine \
  -t autolytiq-price-engine:latest \
  .
```

2. **Run the container**:
```bash
docker run -d \
  --name rust-price-engine \
  -p 50051:50051 \
  -e DATABASE_URL="sqlite:////srv/app/storage/dev.db" \
  -e RUST_LOG=info \
  autolytiq-price-engine:latest
```

### Option C: Local Development (Cargo)

1. **Install dependencies**:
```bash
cd /root/autolytiq/services/rust
cargo build --release -p price-engine
```

2. **Run the service**:
```bash
cargo run --release -p price-engine
```

3. **Service will listen on**: `0.0.0.0:50051`

## Environment Variables

### Rust Service
```bash
DATABASE_URL=sqlite:////srv/app/storage/dev.db
REDIS_URL=redis://localhost:6379
RUST_LOG=info
PRICE_ENGINE_PORT=50051
```

### Node.js Backend
```bash
PRICE_ENGINE_URL=localhost:50051  # gRPC service address
```

## API Examples

### Calculate Payment
```bash
curl -X POST http://localhost:3000/api/pricing/calculate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amountFinanced": 30000,
    "apr": 5.99,
    "termMonths": 60
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "monthlyPayment": 579.98,
    "totalInterest": 4798.80,
    "totalPayment": 34798.80,
    "amortizationSchedule": [...]
  }
}
```

### Health Check
```bash
curl http://localhost:3000/api/pricing/health
```

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "message": "Rust pricing service is operational",
  "sampleCalculation": {
    "monthlyPayment": 579.98
  }
}
```

## Performance Benchmarks

### Target Metrics
- **Payment Calculation**: < 100ms
- **Gross Calculation**: < 150ms
- **Market Data**: < 500ms (includes DB queries)
- **Throughput**: > 1000 requests/second

### Optimization Features
- **Binary Search**: Payment lock reverse calculation (10-15 iterations)
- **Caching**: Intelligent fingerprint-based result caching
- **Debouncing**: 50ms client-side debounce
- **Abort Control**: Cancel in-flight requests
- **Connection Pooling**: Database and Redis connections

## Testing

### Frontend Integration Test
```typescript
import { calculatePayment } from '@/services/pricingApi';

const result = await calculatePayment({
  amountFinanced: 30000,
  apr: 5.99,
  termMonths: 60,
});

console.log(`Monthly Payment: $${result.monthlyPayment.toFixed(2)}`);
```

### Backend Test
```bash
cd /root/autolytiq/apps/backend
npm test -- --grep "Rust Pricing Service"
```

### Rust Unit Tests
```bash
cd /root/autolytiq/services/rust
cargo test -p price-engine
```

## Monitoring

### Logs
```bash
# Docker
docker logs -f rust-price-engine

# Kubernetes
kubectl logs -f deployment/rust-price-engine -n autolytiq
```

### Health Endpoint
```bash
# gRPC health check
grpcurl -plaintext localhost:50051 autolytiq.pricing.PriceEngine/GetHealth

# REST API health check
curl http://localhost:3000/api/pricing/health
```

### Metrics (if Prometheus is configured)
- `rust_price_engine_requests_total`
- `rust_price_engine_request_duration_seconds`
- `rust_price_engine_errors_total`

## Troubleshooting

### Service Won't Start
1. **Check port availability**:
   ```bash
   lsof -i :50051
   ```

2. **Verify database connection**:
   ```bash
   sqlite3 /srv/app/storage/dev.db ".tables"
   ```

3. **Check logs**:
   ```bash
   docker logs rust-price-engine --tail 100
   ```

### Connection Refused from Backend
1. **Verify service is running**:
   ```bash
   docker ps | grep rust-price-engine
   ```

2. **Test gRPC connectivity**:
   ```bash
   grpcurl -plaintext localhost:50051 list
   ```

3. **Check environment variable**:
   ```bash
   echo $PRICE_ENGINE_URL
   ```

### Slow Performance
1. **Check database indexes**
2. **Verify Redis is running**
3. **Monitor resource usage**:
   ```bash
   docker stats rust-price-engine
   ```

## Production Considerations

### Scaling
- Deploy multiple instances behind a load balancer
- Use gRPC load balancing (client-side or proxy-based)
- Consider using Kubernetes HPA for auto-scaling

### Security
- Enable TLS for gRPC connections in production
- Implement authentication/authorization
- Use network policies to restrict access

### High Availability
- Deploy at least 2 replicas
- Use health checks for automatic failover
- Implement circuit breakers in the Node.js bridge

## Next Steps

1. **Deploy Rust Service**: Follow deployment steps above
2. **Test Integration**: Verify mobile Deal Studio uses Rust calculations
3. **Monitor Performance**: Ensure < 100ms response times
4. **AI Integration (Phase C)**: Connect ML service for recommendations

## Related Documentation

- [Rust Service Architecture](./services/rust/ARCHITECTURE.md)
- [Rust Service README](./services/rust/README.md)
- [Deal Studio Integration](./DEAL_STUDIO_RUST_INTEGRATION.md)
- [API Documentation](./API_DOCUMENTATION.md)

## Support

For issues or questions:
- GitHub Issues: https://github.com/morpheus18-glitch/autolytiq/issues
- Slack Channel: #rust-services
- Email: dev@autolytiq.com

---

**Status**: ✅ Ready for Deployment
**Last Updated**: November 4, 2025
**Maintainer**: Claude Code Team
