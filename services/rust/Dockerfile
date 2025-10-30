# Multi-stage Dockerfile for Rust services
FROM rust:1.76-alpine AS builder

# Install build dependencies
RUN apk add --no-cache musl-dev protobuf-dev

WORKDIR /app

# Copy workspace files
COPY Cargo.toml 
# Cargo.lock ./
COPY proto/ ./proto/
COPY shared/ ./shared/

# Accept build-time argument for which service to build
ARG SERVICE_NAME

# Copy the specific service
COPY ${SERVICE_NAME}/ ./${SERVICE_NAME}/

# Build the service in release mode
RUN cargo build --release --bin ${SERVICE_NAME}

# Runtime stage
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache ca-certificates libgcc

# Accept the service name again for the runtime stage
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/target/release/${SERVICE_NAME} /app/service

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose gRPC port (default, can be overridden)
EXPOSE 50051

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/app/service", "--health-check"] || exit 1

CMD ["/app/service"]
