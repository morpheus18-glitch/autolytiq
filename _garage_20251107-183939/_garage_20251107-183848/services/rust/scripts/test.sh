#!/bin/bash
set -e

echo "Running Rust service tests..."

# Run unit tests
echo "Running unit tests..."
cargo test --lib

# Run integration tests
echo "Running integration tests..."
cargo test --test '*'

# Run doctests
echo "Running doctests..."
cargo test --doc

echo ""
echo "All tests passed!"
