#!/bin/bash
set -a
[ -f .env ] && . .env
[ -f .env.local ] && . .env.local
set +a
exec "$@"
