#!/usr/bin/env bash
# Local deploy helper: commit, push to origin, then on your VPS: git pull
# and rebuild/restart Docker services.
# Usage: ./scripts/deploy-remote.sh "your commit message"
# Or load env first:
#   set -a
#   source ./.env.deploy
#   set +a
#   ./scripts/deploy-remote.sh "your commit message"
#
# Env overrides: DEPLOY_SSH_KEY, DEPLOY_HOST, DEPLOY_REMOTE_DIR,
#   DEPLOY_COMPOSE_FILE (default: docker-compose.yml)

set -euo pipefail

commit_message="${1:-}"
if [[ -z "$commit_message" ]]; then
  echo "Usage: $0 <commit-message>" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

ssh_key="${DEPLOY_SSH_KEY:-}"
host="${DEPLOY_HOST:-}"
remote_dir="${DEPLOY_REMOTE_DIR:-}"
compose_file="${DEPLOY_COMPOSE_FILE:-docker-compose.yml}"

if [[ -z "$ssh_key" || -z "$host" || -z "$remote_dir" ]]; then
  cat >&2 <<'EOF'
Missing required deploy configuration.
Set these environment variables before running:
  DEPLOY_SSH_KEY   (path to private key)
  DEPLOY_HOST      (e.g. root@your-vps-ip)
  DEPLOY_REMOTE_DIR (path to repo on server)
Example:
  DEPLOY_SSH_KEY=~/.ssh/hostinger_vps \
  DEPLOY_HOST=root@203.0.113.10 \
  DEPLOY_REMOTE_DIR=/var/www/Zaroor-shop \
  ./scripts/deploy-remote.sh "your commit message"
EOF
  exit 1
fi

if [[ ! -f "$ssh_key" ]]; then
  echo "SSH key not found: $ssh_key" >&2
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "Nothing to commit (working tree clean or only unstaged ignorable changes)." >&2
  exit 1
fi

git commit -m "$commit_message"
branch="$(git branch --show-current)"
git push origin "$branch"

q_dir=$(printf '%q' "$remote_dir")
q_compose=$(printf '%q' "$compose_file")

ssh -i "$ssh_key" -o IdentitiesOnly=yes "$host" \
  "cd ${q_dir} && git pull && docker compose -f ${q_compose} up --build -d --remove-orphans"

echo "Deploy finished on ${host}:${remote_dir} (${compose_file}: up --build -d)"
