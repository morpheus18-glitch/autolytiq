#!/bin/bash
set -e

# Start all Rust services in development mode

echo "Starting Rust services in development mode..."

# Set environment variables
export RUST_LOG=debug
export PRICE_ENGINE__DATABASE__URL=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:5432/autolytiq"}
export PRICE_ENGINE__REDIS__URL=${REDIS_URL:-"redis://localhost:6379"}
export COMM_SERVICE__REDIS__URL=${REDIS_URL:-"redis://localhost:6379"}

# Start services in background
echo "Starting PriceEngine on port 50051..."
cargo run --bin price-engine &
PRICE_ENGINE_PID=$!

echo "Starting CommService on port 50052..."
cargo run --bin comm-service &
COMM_SERVICE_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down services..."
    kill $PRICE_ENGINE_PID $COMM_SERVICE_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

echo ""
echo "Services started:"
echo "  - PriceEngine: http://localhost:50051"
echo "  - CommService: http://localhost:50052"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait
