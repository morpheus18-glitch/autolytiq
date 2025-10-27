# Rust Services Architecture

## Overview

This directory contains high-performance Rust microservices that complement the Node.js orchestrator, providing:
- **PriceEngine**: Fast pricing calculations with market data analysis
- **CommService**: Reliable gRPC communication layer with idempotency and retries
- **Additional enhancements**: Caching, rate limiting, and event processing

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Node.js Orchestrator (Port 5000)                │
│  - REST API layer                                                   │
│  - Business logic coordination                                      │
│  - WebSocket hub                                                    │
│  - Multi-tenancy enforcement                                        │
└────────────┬────────────────────────────────────┬───────────────────┘
             │                                    │
             │ gRPC (with retries,                │ gRPC
             │ circuit breaker,                   │
             │ idempotency)                       │
             │                                    │
    ┌────────▼─────────────┐          ┌─────────▼──────────────┐
    │  Rust PriceEngine    │          │  Rust CommService      │
    │  (Port 50051)        │          │  (Port 50052)          │
    │                      │          │                        │
    │  - Market pricing    │          │  - Idempotency layer   │
    │  - Gross calc        │          │  - Retry logic         │
    │  - Payment calc      │          │  - Circuit breaker     │
    │  - Markdown suggest  │          │  - Request dedup       │
    └──────────────────────┘          └────────────────────────┘
             │                                    │
             │                                    │
             └────────────────┬───────────────────┘
                              │
                    ┌─────────▼──────────────┐
                    │  PostgreSQL + Redis    │
                    │  - Pricing data        │
                    │  - Market comps        │
                    │  - Cache layer         │
                    │  - Idempotency store   │
                    └────────────────────────┘
```

## Services

### 1. PriceEngine (price-engine/)
**Purpose**: High-performance pricing calculations replacing TypeScript services

**Features**:
- Market data analysis (competitive range, comps filtering)
- Gross profit calculations (front-end, finance reserve, back-end)
- Payment amortization (monthly payment, APR, DTI/PTI)
- Markdown suggestions based on aging
- Batch pricing operations

**Performance Benefits**:
- 10-100x faster calculations vs Node.js
- Zero-copy deserialization with Protocol Buffers
- Concurrent request handling with Tokio
- Memory-efficient data structures

**Proto Services**:
```protobuf
service PriceEngine {
  rpc GetMarketData(MarketDataRequest) returns (MarketDataResponse);
  rpc CalculateGross(GrossRequest) returns (GrossResponse);
  rpc CalculatePayment(PaymentRequest) returns (PaymentResponse);
  rpc SuggestMarkdown(MarkdownRequest) returns (MarkdownResponse);
  rpc BatchPrice(BatchPriceRequest) returns (stream BatchPriceResponse);
}
```

### 2. CommService (comm-service/)
**Purpose**: Reliable communication layer with idempotency and retry logic

**Features**:
- **Idempotency**: Deduplicates requests using `X-Idempotency-Key` header
- **Retries**: Exponential backoff with jitter (configurable max attempts)
- **Circuit Breaker**: Opens after N failures, half-open after timeout
- **Request Tracking**: Correlation IDs for distributed tracing
- **Metrics**: Latency histograms, error rates, circuit breaker state

**Idempotency Store**:
- Redis-backed with TTL (24h default)
- Key format: `idempotency:{tenantId}:{idempotencyKey}`
- Value: Cached gRPC response (serialized)

**Retry Strategy**:
```rust
initial_backoff: 100ms
max_backoff: 10s
multiplier: 2.0
jitter: ±25%
max_attempts: 5
retryable_codes: [UNAVAILABLE, DEADLINE_EXCEEDED, RESOURCE_EXHAUSTED]
```

**Proto Services**:
```protobuf
service CommService {
  rpc ForwardRequest(ForwardRequestMessage) returns (ForwardResponseMessage);
  rpc GetHealth(HealthRequest) returns (HealthResponse);
  rpc GetMetrics(MetricsRequest) returns (MetricsResponse);
}
```

### 3. Shared Library (shared/)
**Purpose**: Common utilities and middleware for all Rust services

**Components**:
- **Middleware**: Logging, auth, tenancy, metrics
- **Database**: Diesel ORM helpers, connection pooling
- **Redis**: Connection management, serialization helpers
- **Error Handling**: Structured errors with gRPC status mapping
- **Config**: Environment-based configuration with validation
- **Telemetry**: OpenTelemetry integration (traces + metrics)

### 4. Cache Service (cache-service/)
**Purpose**: High-performance caching layer with Redis

**Features**:
- Multi-level caching (in-memory LRU + Redis)
- Cache-aside pattern with automatic population
- Tenant-isolated cache namespaces
- TTL management per cache type
- Cache invalidation via events

**Use Cases**:
- Market comps caching (5min TTL)
- User session caching (1hr TTL)
- Configuration caching (invalidate on update)

### 5. Rate Limiter (rate-limiter/)
**Purpose**: Token bucket rate limiting per tenant/user

**Features**:
- Redis-backed token bucket algorithm
- Configurable limits per tenant tier
- Sliding window rate limiting
- Distributed rate limiting (multi-instance safe)

**Limits Example**:
```rust
free_tier: 100 req/min
pro_tier: 1000 req/min
enterprise_tier: 10000 req/min
```

## Technology Stack

### Core Dependencies
- **tonic** (0.11): gRPC framework
- **tokio** (1.36): Async runtime
- **diesel** (2.1): PostgreSQL ORM
- **redis** (0.24): Redis client
- **serde** (1.0): Serialization
- **tracing** (0.1): Structured logging
- **tower** (0.4): Middleware framework

### Build & Dev Tools
- **prost** (0.12): Protobuf codegen
- **tonic-build** (0.11): gRPC codegen
- **cargo-watch**: Auto-reload on changes
- **cargo-nextest**: Fast test runner

## Project Structure

```
services/rust/
├── Cargo.toml                    # Workspace root
├── proto/                        # Protocol Buffer definitions
│   ├── price_engine.proto
│   ├── comm_service.proto
│   ├── cache_service.proto
│   └── common.proto              # Shared messages
├── price-engine/                 # PriceEngine service
│   ├── Cargo.toml
│   ├── build.rs                  # Proto compilation
│   ├── src/
│   │   ├── main.rs               # Service entry point
│   │   ├── server.rs             # gRPC server impl
│   │   ├── services/
│   │   │   ├── market_pricing.rs
│   │   │   ├── gross_calculator.rs
│   │   │   └── payment_calculator.rs
│   │   ├── models/               # Domain models
│   │   ├── db/                   # Database access
│   │   └── config.rs             # Configuration
│   └── tests/
├── comm-service/                 # Communication service
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   ├── server.rs
│   │   ├── idempotency.rs        # Idempotency logic
│   │   ├── retry.rs              # Retry logic
│   │   ├── circuit_breaker.rs    # Circuit breaker
│   │   └── metrics.rs            # Prometheus metrics
│   └── tests/
├── shared/                       # Shared utilities
│   ├── Cargo.toml
│   ├── src/
│   │   ├── lib.rs
│   │   ├── middleware/           # gRPC middleware
│   │   ├── db/                   # Database utilities
│   │   ├── redis/                # Redis utilities
│   │   ├── error.rs              # Error types
│   │   └── config.rs             # Config helpers
│   └── tests/
├── cache-service/                # Cache service
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   ├── server.rs
│   │   ├── cache.rs              # Multi-level cache
│   │   └── eviction.rs           # LRU eviction
│   └── tests/
├── rate-limiter/                 # Rate limiter
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   ├── server.rs
│   │   └── token_bucket.rs       # Token bucket algorithm
│   └── tests/
└── scripts/
    ├── dev.sh                    # Run all services in dev
    ├── proto-gen.sh              # Generate proto code
    └── test.sh                   # Run all tests
```

## Communication Flow

### Example: Price Calculation Request

```
1. Node.js Controller receives POST /api/deals/price
   ↓
2. Controller calls Rust gRPC client with idempotency key
   ↓
3. CommService checks Redis for cached response
   ↓ (cache miss)
4. CommService forwards to PriceEngine with retry logic
   ↓
5. PriceEngine queries PostgreSQL for market comps
   ↓
6. PriceEngine calculates pricing (market range, gross, payment)
   ↓
7. PriceEngine returns gRPC response
   ↓
8. CommService caches response in Redis (TTL: 24h)
   ↓
9. CommService returns to Node.js
   ↓
10. Node.js returns JSON to client
```

### Idempotency Flow

```
Request with X-Idempotency-Key: "abc123"
   ↓
CommService checks Redis: GET idempotency:tenant1:abc123
   ↓
If exists:
  - Return cached response immediately (no downstream call)
If not exists:
  - Forward to target service
  - Cache response: SET idempotency:tenant1:abc123 {response} EX 86400
  - Return response
```

## Configuration

### Environment Variables

```bash
# PriceEngine
PRICE_ENGINE_PORT=50051
PRICE_ENGINE_DB_URL=postgresql://user:pass@localhost:5432/autolytiq
PRICE_ENGINE_REDIS_URL=redis://localhost:6379
PRICE_ENGINE_LOG_LEVEL=info

# CommService
COMM_SERVICE_PORT=50052
COMM_SERVICE_REDIS_URL=redis://localhost:6379
COMM_SERVICE_MAX_RETRIES=5
COMM_SERVICE_INITIAL_BACKOFF_MS=100
COMM_SERVICE_MAX_BACKOFF_MS=10000
COMM_SERVICE_CIRCUIT_BREAKER_THRESHOLD=10
COMM_SERVICE_CIRCUIT_BREAKER_TIMEOUT_MS=30000

# Shared
RUST_LOG=info,price_engine=debug,comm_service=debug
JAEGER_ENDPOINT=http://localhost:14268/api/traces
```

## Performance Characteristics

### PriceEngine Benchmarks (Expected)

| Operation | Node.js (TypeScript) | Rust (gRPC) | Speedup |
|-----------|---------------------|-------------|---------|
| Market data filtering | 15ms | 0.5ms | 30x |
| Gross calculation | 5ms | 0.2ms | 25x |
| Payment amortization | 8ms | 0.3ms | 27x |
| Batch pricing (100 deals) | 1200ms | 35ms | 34x |

### Memory Usage

- Node.js pricing service: ~150MB resident
- Rust PriceEngine: ~15MB resident (10x reduction)

### Concurrency

- Node.js: Limited by event loop (max ~10k concurrent)
- Rust: Tokio runtime (100k+ concurrent with same latency)

## Development Workflow

### Local Development

```bash
# Start all Rust services
cd services/rust
./scripts/dev.sh

# Or individually
cargo run --bin price-engine
cargo run --bin comm-service
cargo run --bin cache-service
```

### Testing

```bash
# Run all tests
cargo nextest run

# Run with coverage
cargo llvm-cov nextest

# Integration tests
cargo test --test integration
```

### Proto Changes

```bash
# Regenerate gRPC code
./scripts/proto-gen.sh

# Or via cargo
cargo build  # build.rs runs automatically
```

## Deployment

### Docker

Each service has its own Dockerfile:
```dockerfile
FROM rust:1.76-alpine AS builder
# Build optimized release binary

FROM alpine:3.19
# Run binary with minimal runtime
```

### Kubernetes

Services deployed as separate deployments:
```yaml
price-engine-deployment.yaml   # 3 replicas
comm-service-deployment.yaml   # 2 replicas
cache-service-deployment.yaml  # 2 replicas
```

### Health Checks

All services expose:
- `/health` - Liveness probe
- `/ready` - Readiness probe (checks DB/Redis connectivity)
- `/metrics` - Prometheus metrics

## Migration Strategy

### Phase 1: Parallel Run (Week 1-2)
- Deploy Rust services alongside Node.js pricing services
- Node.js calls both (TypeScript + Rust) and compares results
- Log discrepancies for investigation
- No user-facing changes

### Phase 2: Gradual Rollout (Week 3-4)
- Route 10% of pricing requests to Rust
- Monitor latency, errors, and correctness
- Increase to 50%, then 100% over 2 weeks

### Phase 3: Deprecation (Week 5-6)
- Remove TypeScript pricing services
- Rust becomes primary pricing engine
- Archive old code

## Monitoring & Observability

### Metrics (Prometheus)
- Request latency histograms (p50, p95, p99)
- Error rates by gRPC method
- Circuit breaker state transitions
- Cache hit/miss ratios
- Idempotency cache hits

### Logs (Structured JSON)
```json
{
  "timestamp": "2025-10-27T10:30:00Z",
  "level": "info",
  "service": "price-engine",
  "tenant_id": "tenant_abc123",
  "request_id": "req_xyz789",
  "method": "GetMarketData",
  "duration_ms": 12,
  "status": "success"
}
```

### Traces (OpenTelemetry)
- Distributed traces from Node.js → CommService → PriceEngine
- Span attributes: tenant_id, user_id, method, duration
- Export to Jaeger/Tempo

## Benefits Summary

1. **Performance**: 25-35x faster pricing calculations
2. **Reliability**: Built-in retries, circuit breakers, idempotency
3. **Scalability**: Handles 10-100x more concurrent requests
4. **Memory Efficiency**: 90% reduction in memory usage
5. **Type Safety**: Compile-time guarantees for pricing logic
6. **Observability**: Structured logging, metrics, distributed tracing
7. **Cost Savings**: Fewer instances needed for same throughput

## Future Enhancements

- **Event Broker**: Rust-based distributed event bus (replace in-memory)
- **Real-time Analytics**: Stream processing with Rust for live dashboards
- **ML Inference**: Rust ONNX runtime for local model inference
- **Data Pipeline**: High-throughput ETL for data warehouse sync
