#!/bin/bash
# PostToolUse: format the file Claude just edited with Prettier.
file=$(jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.mts|*.json|*.css|*.md) ;;
  *) exit 0 ;;
esac
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
npx --no-install prettier --write --ignore-unknown "$file" >/dev/null 2>&1 || true
