#!/usr/bin/env bash
# Local deploy helper: commit, push to origin, then pull on the EC2 host.
# Usage: ./scripts/deploy-remote.sh "your commit message"
#
# Override defaults with env: DEPLOY_SSH_KEY, DEPLOY_HOST, DEPLOY_REMOTE_DIR

set -euo pipefail

commit_message="${1:-}"
if [[ -z "$commit_message" ]]; then
  echo "Usage: $0 <commit-message>" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

pem="${DEPLOY_SSH_KEY:-$HOME/Documents/personal/zaroor/AWS-ki-pem-file/zaroor.pem}"
host="${DEPLOY_HOST:-ubuntu@52.72.182.31}"
remote_dir="${DEPLOY_REMOTE_DIR:-/home/ubuntu/Zaroor-shop}"

if [[ ! -f "$pem" ]]; then
  echo "SSH key not found: $pem" >&2
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

ssh -i "$pem" -o IdentitiesOnly=yes "$host" "cd ${remote_dir} && git pull"

echo "Deploy pull finished on ${host}:${remote_dir}"
