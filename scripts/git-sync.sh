#!/usr/bin/env bash
# Git sync verification helper for agents and CI.
#
# Usage:
#   ./scripts/git-sync.sh           # Fail if working tree is dirty; report ahead/behind
#   ./scripts/git-sync.sh --push    # Same checks, then push current branch to origin
#
# Does NOT auto-commit. Agents must commit intentional changes before running with --push.

set -euo pipefail

PUSH=false
if [[ "${1:-}" == "--push" ]]; then
  PUSH=true
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "error: uncommitted changes exist (commit or stash before sync)" >&2
  git status -sb
  exit 1
fi

git fetch origin

BRANCH="$(git branch --show-current)"
echo "branch: ${BRANCH}"
git status -sb
git log -1 --oneline

UPSTREAM="origin/${BRANCH}"
if git rev-parse --verify "${UPSTREAM}" >/dev/null 2>&1; then
  AHEAD="$(git rev-list --count "${UPSTREAM}..HEAD" 2>/dev/null || echo 0)"
  BEHIND="$(git rev-list --count "HEAD..${UPSTREAM}" 2>/dev/null || echo 0)"
  echo "ahead: ${AHEAD}, behind: ${BEHIND}"
  if [[ "${AHEAD}" != "0" || "${BEHIND}" != "0" ]]; then
    echo "warning: branch is not in sync with ${UPSTREAM}" >&2
    exit 1
  fi
  echo "synced with ${UPSTREAM}"
else
  echo "warning: no upstream ${UPSTREAM} (push may be needed)" >&2
fi

if [[ "${PUSH}" == "true" ]]; then
  git push origin "${BRANCH}"
  git fetch origin
  git status -sb
fi
