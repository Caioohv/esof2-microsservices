#!/bin/sh
set -e

consul kv put config/auth-service/cors-origin "${CORS_ORIGIN:-*}"
consul kv put config/auth-service/port "3001"
consul kv put config/user-service/port "3002"
consul kv put config/store-service/port "3004"

echo "[consul-init] KV store seeded"
