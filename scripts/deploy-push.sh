#!/usr/bin/env bash
# From your laptop: commit, push main to GitHub, then deploy on Hostinger VPS.
# For automatic deploy on every push, use GitHub Actions (see docs/deploy-automation.md).
#
# Usage:
#   cp .env.deploy.example .env.deploy   # edit once
#   set -a && source ./.env.deploy && set +a
#   ./scripts/deploy-push.sh "your commit message"
#
# Deploy only (already pushed):
#   ./scripts/deploy-push.sh --deploy-only

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

deploy_only=false
commit_message=""

for arg in "$@"; do
  case "$arg" in
    --deploy-only) deploy_only=true ;;
    *)
      if [[ -z "$commit_message" ]]; then
        commit_message="$arg"
      fi
      ;;
  esac
done

ssh_key="${DEPLOY_SSH_KEY:-}"
host="${DEPLOY_HOST:-}"
user="${DEPLOY_USER:-root}"
remote_dir="${DEPLOY_REMOTE_DIR:-}"

if [[ -z "$ssh_key" || -z "$host" || -z "$remote_dir" ]]; then
  cat >&2 <<'EOF'
Missing deploy configuration. Set in .env.deploy:
  DEPLOY_SSH_KEY=~/.ssh/hostinger_vps
  DEPLOY_HOST=187.127.119.183
  DEPLOY_USER=root
  DEPLOY_REMOTE_DIR=/var/www/Zaroor-shop
EOF
  exit 1
fi

if [[ ! -f "$ssh_key" ]]; then
  echo "SSH key not found: $ssh_key" >&2
  exit 1
fi

ssh_target="${user}@${host}"

if [[ "$deploy_only" == false ]]; then
  if [[ -z "$commit_message" ]]; then
    echo "Usage: $0 [--deploy-only] <commit-message>" >&2
    exit 1
  fi

  git add -A
  if git diff --cached --quiet; then
    echo "Nothing to commit." >&2
    exit 1
  fi

  git commit -m "$commit_message"
  git push origin main
  echo "==> Pushed to origin/main"
fi

q_dir=$(printf '%q' "$remote_dir")
echo "==> Deploying on $ssh_target:$remote_dir"
ssh -i "$ssh_key" -o IdentitiesOnly=yes "$ssh_target" "cd ${q_dir} && chmod +x scripts/deploy-vps.sh && ./scripts/deploy-vps.sh"

echo "==> Done. Site: https://zaroor.shop"
