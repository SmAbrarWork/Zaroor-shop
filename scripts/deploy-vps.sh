#!/usr/bin/env bash
# Run ON the Hostinger VPS (or via SSH from CI) after code is on GitHub.
# Pulls latest main, rebuilds Docker, verifies health.
#
# Usage (on VPS):
#   cd /var/www/Zaroor-shop && ./scripts/deploy-vps.sh
#
# Env overrides:
#   DEPLOY_BRANCH=main
#   DEPLOY_COMPOSE_FILE=docker-compose.yml

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

branch="${DEPLOY_BRANCH:-main}"
compose_file="${DEPLOY_COMPOSE_FILE:-docker-compose.yml}"

if [[ ! -f "$compose_file" ]]; then
  echo "Missing compose file: $compose_file" >&2
  exit 1
fi

if [[ ! -f server/.env ]]; then
  echo "Missing server/.env — create from server/.env.example before deploying." >&2
  exit 1
fi

echo "==> Deploying $(basename "$repo_root") (branch: $branch)"
git fetch origin "$branch"
git checkout "$branch"
git pull origin "$branch"

echo "==> Building and starting containers"
docker compose -f "$compose_file" up --build -d --remove-orphans

echo "==> Container status"
docker compose -f "$compose_file" ps

echo "==> Health check"
sleep 3
curl -sf http://127.0.0.1:5000/api/health | grep -q '"success":true' \
  || { echo "API health check failed" >&2; exit 1; }

curl -sf -o /dev/null http://127.0.0.1:3000/ \
  || { echo "Client check failed" >&2; exit 1; }

echo "==> Deploy OK ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
