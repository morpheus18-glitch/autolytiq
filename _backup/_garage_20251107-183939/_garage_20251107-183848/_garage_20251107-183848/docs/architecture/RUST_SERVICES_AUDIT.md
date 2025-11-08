# Rust Services Audit

**Generated**: 2025-11-06  
**Workspace**: `services/rust/`  
**Services**: 4 crates (price-engine, comm-service, cache-service, rate-limiter)

---

## Service Inventory

### 1. Price Engine
**Path**: `services/rust/price-engine/`  
**Binary**: `price-engine`  
**Protocol**: gRPC  
**Port**: 50051  
**Purpose**: Real-time payment calculations

**Health Endpoint**: gRPC `health.Health/Check`

**Expected Env**:
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
RUST_LOG=info
SERVICE_PORT=50051
```

### 2. Comm Service
**Path**: `services/rust/comm-service/`  
**Binary**: `comm-service`  
**Port**: 50052  
**Purpose**: Communications orchestration

### 3. Cache Service
**Path**: `services/rust/cache-service/`  
**Binary**: `cache-service`  
**Port**: 50053  
**Purpose**: Distributed caching layer

### 4. Rate Limiter
**Path**: `services/rust/rate-limiter/`  
**Binary**: `rate-limiter`  
**Port**: 50054  
**Purpose**: API rate limiting

---

## Build Commands

```bash
cd services/rust

# Build all services
cargo build --release

# Build specific service
cargo build --release --bin price-engine

# Run service
cargo run --release --bin price-engine

# Run tests
cargo test
```

---

## Docker Build

**Dockerfile Location**: `services/rust/Dockerfile` or per-service

**Multi-stage Build**:
```dockerfile
FROM rust:1.75 AS builder
WORKDIR /app
COPY . .
RUN cargo build --release --bin price-engine

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/price-engine /usr/local/bin/
CMD ["price-engine"]
```

---

## gRPC Contracts

**Proto Files**: `services/rust/proto/` or `services/rust/shared/proto/`

**Check for**:
- pricing.proto
- health.proto (standard gRPC health check)

---

## K8s Service Names

```yaml
apiVersion: v1
kind: Service
metadata:
  name: price-engine
spec:
  ports:
  - port: 50051
    targetPort: 50051
```

**Backend Connection**:
```typescript
import * as grpc from '@grpc/grpc-js';

const client = new PriceEngineClient(
  process.env.PRICE_ENGINE_URL || 'price-engine:50051',
  grpc.credentials.createInsecure()
);
```

---

## Logging

**RUST_LOG** levels:
```
RUST_LOG=trace   # Most verbose
RUST_LOG=debug
RUST_LOG=info    # Recommended
RUST_LOG=warn
RUST_LOG=error
```

**Structured Logging**: Use `tracing` crate

---

## Performance

**Target Latency**: < 100ms (p95)  
**Concurrency**: Tokio async runtime  
**Connection Pooling**: Diesel or sqlx

