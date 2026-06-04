#!/usr/bin/env bash
# Run ON the Hostinger VPS after you pushed changes to GitHub (main).
# Stops containers, pulls latest code, rebuilds Docker, verifies the site is live.
#
# One-time on VPS:
#   cd /var/www/Zaroor-shop
#   chmod +x scripts/go-live.sh
#
# Every update:
#   cd /var/www/Zaroor-shop && ./scripts/go-live.sh
#
# Optional env:
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
  echo "Missing server/.env — run: cp server/.env.example server/.env && nano server/.env" >&2
  exit 1
fi

echo "==> [1/5] Stop running containers"
docker compose -f "$compose_file" down

echo "==> [2/5] Pull latest from GitHub ($branch)"
git fetch origin "$branch"
git checkout "$branch"
git pull origin "$branch"

echo "==> [3/5] Rebuild and start"
docker compose -f "$compose_file" up --build -d --remove-orphans

echo "==> [4/5] Container status"
docker compose -f "$compose_file" ps

echo "==> [5/5] Health check"
sleep 5
curl -sf http://127.0.0.1:5000/api/health | grep -q '"success":true' \
  || { echo "API health check failed — run: docker compose logs server" >&2; exit 1; }

curl -sf -o /dev/null http://127.0.0.1:3000/ \
  || { echo "Client check failed — run: docker compose logs client" >&2; exit 1; }

echo ""
echo "==> Live: https://zaroor.shop"
echo "==> Done $(date -u +%Y-%m-%dT%H:%M:%SZ)"
