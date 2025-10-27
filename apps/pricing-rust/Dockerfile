# Build stage
FROM rust:1.75-slim as builder

WORKDIR /app

# Install protobuf compiler
RUN apt-get update && apt-get install -y protobuf-compiler && rm -rf /var/lib/apt/lists/*

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Copy source
COPY src ./src
COPY proto ./proto
COPY build.rs ./

# Build release binary
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install ca-certificates for HTTPS
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1001 pricing

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/pricing-service ./

# Change ownership
RUN chown -R pricing:pricing /app

USER pricing

# Expose gRPC port
EXPOSE 50051

CMD ["./pricing-service"]
