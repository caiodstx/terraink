#!/usr/bin/env bash
# Deploys mapagrama (this repo) to the VPS AND pushes/syncs main in the
# same run — see CLAUDE.md's Fase 7.5 note: main was once 50 commits
# behind what was actually deployed, a real AGPL-3.0 compliance gap
# (the Corresponding Source of what's running in production needs to be
# publicly reachable, and the stale default branch didn't reflect it).
# One command instead of remembering several separate steps.
#
# Run from the repo root: bash scripts/deploy-frontend.sh
set -euo pipefail

VPS_HOST="deploy@159.69.93.51"
SSH_KEY="$HOME/.ssh/id_ed25519"
REMOTE_DIR="~/mapagrama"
API_REPO_DIR="~/mapagrama-api"

if [ -n "$(git status --short)" ]; then
  echo "Working tree has uncommitted changes — commit before deploying," \
       "so what's pushed to GitHub actually matches what's deployed." >&2
  git status --short >&2
  exit 1
fi

echo "== typecheck =="
bun run typecheck

echo "== syncing source to VPS =="
tar -czf - src index.html public scripts package.json vite.config.js tsconfig.json nginx.conf Dockerfile .gitignore \
  | ssh -i "$SSH_KEY" "$VPS_HOST" "tar -xzf - -C $REMOTE_DIR"

echo "== building + restarting frontend container =="
ssh -i "$SSH_KEY" "$VPS_HOST" "cd $API_REPO_DIR && docker compose build frontend && docker compose up -d frontend"

CURRENT_BRANCH="$(git branch --show-current)"

echo "== pushing $CURRENT_BRANCH =="
git push origin "$CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "== syncing main (AGPL — public repo's default branch must reflect what's deployed) =="
  git fetch origin main
  git checkout main
  git merge --no-ff "origin/$CURRENT_BRANCH" -m "Merge $CURRENT_BRANCH: deploy sync ($(date +%Y-%m-%d))"
  git push origin main
  git checkout "$CURRENT_BRANCH"
fi

echo "== done: deployed and pushed (main included) =="
