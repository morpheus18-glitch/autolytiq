# syntax=docker/dockerfile:1.6

FROM rust:1.78-slim AS builder
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libssl-dev libpq-dev clang \
    && rm -rf /var/lib/apt/lists/*

COPY services/rust/Cargo.toml services/rust/Cargo.toml
COPY services/rust/Cargo.lock services/rust/Cargo.lock
COPY services/rust/price-engine/Cargo.toml services/rust/price-engine/Cargo.toml
COPY services/rust/shared/Cargo.toml services/rust/shared/Cargo.toml
COPY services/rust/cache-service/Cargo.toml services/rust/cache-service/Cargo.toml
COPY services/rust/comm-service/Cargo.toml services/rust/comm-service/Cargo.toml
COPY services/rust/rate-limiter/Cargo.toml services/rust/rate-limiter/Cargo.toml

RUN mkdir -p services/rust/price-engine/src services/rust/shared/src services/rust/cache-service/src \
    services/rust/comm-service/src services/rust/rate-limiter/src
RUN cargo fetch --locked --manifest-path services/rust/Cargo.toml

COPY services/rust /app/services/rust
RUN cargo build --locked --release --manifest-path services/rust/Cargo.toml -p price-engine

FROM debian:bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/price-engine /usr/local/bin/price-engine
RUN curl -fsSL https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/v0.4.24/grpc_health_probe-linux-amd64 \
    -o /usr/local/bin/grpc_health_probe && chmod +x /usr/local/bin/grpc_health_probe

RUN useradd --system --create-home --home-dir /app --shell /usr/sbin/nologin price
USER price

ENV RUST_LOG=info
EXPOSE 50051

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD grpc_health_probe -addr=127.0.0.1:50051 || exit 1

CMD ["/usr/local/bin/price-engine"]
