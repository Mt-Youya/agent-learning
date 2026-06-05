#!/usr/bin/env sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

printf '\033[90m  cleaning node_modules ...\033[0m\n'
find . \
  -not -path './.git/*' \
  -name 'node_modules' \
  -type d \
  -prune \
  -exec rm -rf {} +

printf '\033[90m  cleaning build artifacts ...\033[0m\n'
find . \
  -not -path './.git/*' \
  -not -path '*/node_modules/*' \
  \( -name '.next' -o -name 'out' -o -name 'dist' -o -name '.turbo' -o -name '.cache' \) \
  -type d \
  -prune \
  -exec rm -rf {} +

printf '\033[90m  cleaning lock file ...\033[0m\n'
rm -f pnpm-lock.yaml

printf '\033[32m  done.\033[0m\n'
