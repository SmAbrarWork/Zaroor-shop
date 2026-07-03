#!/usr/bin/env bash
# Run ON the VPS after the repo is cloned (or via SSH from GitHub Actions).
# Pulls latest main and rebuilds production Docker containers.
#
# Usage on VPS:
#   ./scripts/deploy-vps.sh
#
# Env overrides:
#   DEPLOY_REMOTE_DIR  (default: /var/www/Zaroor-shop)
#   DEPLOY_COMPOSE_FILE (default: docker-compose.prod.yml)
#   DEPLOY_GIT_BRANCH  (default: main)

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${DEPLOY_REMOTE_DIR:-$repo_root}"

branch="${DEPLOY_GIT_BRANCH:-main}"
compose_file="${DEPLOY_COMPOSE_FILE:-docker-compose.prod.yml}"

echo "==> Deploying branch ${branch} in $(pwd)"

git fetch origin "${branch}"
git reset --hard "origin/${branch}"

docker compose -f "${compose_file}" up --build -d --remove-orphans
docker compose -f "${compose_file}" ps

if curl -sf http://127.0.0.1:5000/api/health >/dev/null; then
  echo "==> API health check OK"
else
  echo "==> API health check FAILED" >&2
  exit 1
fi

echo "==> Deploy finished"
