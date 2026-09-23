#!/bin/bash
# Prepares Claude Code on the web sessions: installs deps so tests/lint run.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

npm install --no-audit --no-fund

# Use the sandbox's preinstalled Chromium for Playwright.
if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -x /opt/pw-browsers/chromium ]; then
  echo "export PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium" >> "$CLAUDE_ENV_FILE"
fi
