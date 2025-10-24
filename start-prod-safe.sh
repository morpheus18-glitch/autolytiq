#!/bin/bash
# SAFE PRODUCTION START - NO MIGRATIONS
# This script ONLY starts the application
# It will NEVER attempt to run database migrations

set -e

echo "🚀 Starting AutolytiQ Production"
echo "📦 Database migrations are NOT run by this script"
echo "✅ Starting application server..."

# Just start the app - nothing else
exec node dist/index.js
