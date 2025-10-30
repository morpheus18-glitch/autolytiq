# syntax=docker/dockerfile:1.7

ARG RUST_VERSION=1.83

FROM rust:${RUST_VERSION}-slim-bookworm AS builder
WORKDIR /app

ARG SERVICE_NAME=price-engine

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      pkg-config \
      libssl-dev \
      libpq-dev \
      clang \
      protobuf-compiler \
 && rm -rf /var/lib/apt/lists/*

COPY services/rust/Cargo.toml ./Cargo.toml
COPY services/rust/price-engine/Cargo.toml price-engine/Cargo.toml
COPY services/rust/shared/Cargo.toml shared/Cargo.toml
COPY services/rust/cache-service/Cargo.toml cache-service/Cargo.toml
COPY services/rust/comm-service/Cargo.toml comm-service/Cargo.toml
COPY services/rust/rate-limiter/Cargo.toml rate-limiter/Cargo.toml

RUN mkdir -p \
      price-engine/src \
      shared/src \
      cache-service/src \
      comm-service/src \
      rate-limiter/src \
 && echo 'fn main() {}' > price-engine/src/main.rs \
 && echo 'fn main() {}' > cache-service/src/main.rs \
 && echo 'fn main() {}' > comm-service/src/main.rs \
 && echo 'fn main() {}' > rate-limiter/src/main.rs \
 && echo 'pub fn placeholder() {}' > shared/src/lib.rs

# Build dependencies with cache mount
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    cargo fetch --manifest-path Cargo.toml

COPY services/rust/shared ./shared
COPY services/rust/cache-service ./cache-service
COPY services/rust/comm-service ./comm-service
COPY services/rust/rate-limiter ./rate-limiter
COPY services/rust/price-engine ./price-engine
COPY services/rust/proto ./proto

# Build with cache mount but copy binary OUT before mount disappears
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    cargo build --manifest-path Cargo.toml --release -p ${SERVICE_NAME} && \
    cp target/release/${SERVICE_NAME} /tmp/service-binary

# Copy the binary to a known location that persists
RUN cp /tmp/service-binary target/release/${SERVICE_NAME}

FROM debian:12-slim AS runtime
ARG SERVICE_NAME=price-engine

ENV RUST_LOG=info \
    DATABASE_URL="sqlite:////srv/app/storage/dev.db"

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates \
      libssl3 \
      libpq5 \
      curl \
 && rm -rf /var/lib/apt/lists/* \
 && curl -fsSL https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/v0.4.23/grpc_health_probe-linux-amd64 \
      -o /usr/local/bin/grpc_health_probe \
 && chmod +x /usr/local/bin/grpc_health_probe \
 && groupadd --system --gid 1001 rustsvc \
 && useradd --system --uid 1001 --gid rustsvc --home /srv/app --shell /usr/sbin/nologin rustsvc

WORKDIR /srv/app
COPY --from=builder /app/target/release/${SERVICE_NAME} /usr/local/bin/app
RUN mkdir -p storage \
 && chown -R rustsvc:rustsvc /srv/app

USER rustsvc
EXPOSE 50051
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD /usr/local/bin/grpc_health_probe -addr=127.0.0.1:50051 || exit 1

ENTRYPOINT ["/usr/local/bin/app"]
