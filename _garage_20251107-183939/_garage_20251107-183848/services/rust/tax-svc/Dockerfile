# Multi-stage build for Rust tax service
FROM rust:1.75-slim as builder

WORKDIR /usr/src/tax-svc

# Copy manifests
COPY Cargo.toml ./

# Copy source code
COPY src ./src

# Build release binary
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary from builder
COPY --from=builder /usr/src/tax-svc/target/release/tax-svc /app/tax-svc

# Expose port
EXPOSE 8080

# Set environment variables
ENV RUST_LOG=info
ENV BIND_ADDR=0.0.0.0:8080
ENV REDIS_URL=redis://redis:6379

# Run the binary
CMD ["/app/tax-svc"]
