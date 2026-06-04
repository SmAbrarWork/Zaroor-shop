#!/usr/bin/env bash
# Run on your LAPTOP — one command to ship to production:
#   1) Push latest main to GitHub (SSH remote)
#   2) SSH to Hostinger VPS → git pull → Docker rebuild → health check
#
# One-time setup:
#   cp .env.deploy.example .env.deploy
#   nano .env.deploy
#
# Usage:
#   ./scripts/deploy.sh "your commit message"   # commit + push + deploy
#   ./scripts/deploy.sh --deploy-only           # already pushed; only VPS update
#   ./scripts/deploy.sh --push-deploy           # push existing commits, then deploy

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ -f "$repo_root/.env.deploy" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$repo_root/.env.deploy"
  set +a
fi

deploy_only=false
push_deploy=false
commit_message=""
branch="${DEPLOY_BRANCH:-main}"

for arg in "$@"; do
  case "$arg" in
    --deploy-only) deploy_only=true ;;
    --push-deploy) push_deploy=true ;;
    -h|--help)
      cat <<'EOF'
Usage:
  ./scripts/deploy.sh "commit message"   Commit all changes, push main, deploy VPS
  ./scripts/deploy.sh --push-deploy      Push main (no new commit), deploy VPS
  ./scripts/deploy.sh --deploy-only      Skip git; pull + rebuild on VPS only

Requires .env.deploy (copy from .env.deploy.example).
EOF
      exit 0
      ;;
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

ssh_key="${ssh_key/#\~/$HOME}"

if [[ -z "$ssh_key" || -z "$host" || -z "$remote_dir" ]]; then
  cat >&2 <<'EOF'
Missing .env.deploy — copy and edit:
  cp .env.deploy.example .env.deploy

Required:
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
q_dir=$(printf '%q' "$remote_dir")

# --- GitHub (laptop): push via your SSH remote ---
if [[ "$deploy_only" == false ]]; then
  current_branch="$(git branch --show-current)"
  if [[ "$current_branch" != "$branch" ]]; then
    echo "Warning: you are on '$current_branch', deploy pushes '$branch'." >&2
  fi

  if [[ "$push_deploy" == true ]]; then
    echo "==> [1/2] Pushing origin/$branch (no new commit)"
    git push origin "$branch"
  else
    if [[ -z "$commit_message" ]]; then
      echo 'Usage: ./scripts/deploy.sh "commit message"' >&2
      echo '   or: ./scripts/deploy.sh --push-deploy' >&2
      echo '   or: ./scripts/deploy.sh --deploy-only' >&2
      exit 1
    fi

    echo "==> [1/2] Commit and push to GitHub ($branch)"
    git add -A
    if git diff --cached --quiet; then
      echo "Nothing to commit. Pushing existing commits..."
    else
      git commit -m "$commit_message"
    fi
    git push origin "$branch"
  fi
  echo "==> GitHub is up to date"
else
  echo "==> [1/2] Skipping git (--deploy-only)"
fi

# --- Hostinger VPS: pull + rebuild ---
echo "==> [2/2] Deploy on $ssh_target ($remote_dir)"
ssh -i "$ssh_key" -o IdentitiesOnly=yes "$ssh_target" \
  "cd ${q_dir} && chmod +x scripts/deploy-vps.sh && ./scripts/deploy-vps.sh"

echo ""
echo "==> Live: https://zaroor.shop"
echo "==> API:  https://zaroor.shop/api/health"
