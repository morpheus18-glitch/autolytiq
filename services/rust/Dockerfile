# syntax=docker/dockerfile:1.7

FROM rust:1.81 AS builder

WORKDIR /app

ARG BIN_NAME=price-engine

# Install build dependencies required by Diesel + TLS clients
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        pkg-config \
        libssl-dev \
        libpq-dev \
        clang \
        protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace manifests only (no Cargo.lock needed)
COPY services/rust/Cargo.toml ./Cargo.toml
COPY services/rust/price-engine/Cargo.toml price-engine/Cargo.toml
COPY services/rust/shared/Cargo.toml shared/Cargo.toml
COPY services/rust/cache-service/Cargo.toml cache-service/Cargo.toml
COPY services/rust/comm-service/Cargo.toml comm-service/Cargo.toml
COPY services/rust/rate-limiter/Cargo.toml rate-limiter/Cargo.toml

# Create minimal source tree so cargo metadata succeeds when fetching deps
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

# Prime dependency cache
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/app/target \
    cargo fetch --manifest-path Cargo.toml

# Bring in the actual sources
COPY services/rust/shared ./shared
COPY services/rust/cache-service ./cache-service
COPY services/rust/comm-service ./comm-service
COPY services/rust/rate-limiter ./rate-limiter
COPY services/rust/price-engine ./price-engine
COPY services/rust/proto ./proto

# Build the requested binary
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/app/target \
    cargo build --manifest-path Cargo.toml --release -p ${BIN_NAME}

# Minimal runtime image
FROM gcr.io/distroless/cc-debian12

ARG BIN_NAME=price-engine

# Copy shared libraries required by libpq + TLS
COPY --from=builder /lib/x86_64-linux-gnu /lib/x86_64-linux-gnu
COPY --from=builder /usr/lib/x86_64-linux-gnu /usr/lib/x86_64-linux-gnu
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

COPY --from=builder /app/target/release/${BIN_NAME} /usr/local/bin/app

USER nonroot

ENTRYPOINT ["/usr/local/bin/app"]
