#!/bin/bash
set -e

echo "Building Rust services..."

# Build all services in release mode
cargo build --release

echo ""
echo "Build complete! Binaries available at:"
echo "  - target/release/price-engine"
echo "  - target/release/comm-service"
echo "  - target/release/cache-service"
echo "  - target/release/rate-limiter"
