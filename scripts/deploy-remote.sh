#!/usr/bin/env bash
# Backwards-compatible alias for deploy-push.sh
exec "$(dirname "$0")/deploy-push.sh" "$@"
