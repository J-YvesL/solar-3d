#!/usr/bin/env bash
set -euo pipefail

NVM_VERSION="v0.40.3"
NODE_VERSION="24"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[ok]${NC} $1"; }
warn() { echo -e "${YELLOW}[..] $1${NC}"; }
fail() { echo -e "${RED}[!!] $1${NC}"; }

# ── nvm ──────────────────────────────────────────────────────────────────────

NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  ok "nvm already installed"
else
  warn "nvm not found — installing $NVM_VERSION..."
  curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
  ok "nvm installed"
fi

# Load nvm in current shell
# shellcheck source=/dev/null
source "$NVM_DIR/nvm.sh"

# ── Node 24 ──────────────────────────────────────────────────────────────────

CURRENT_NODE=$(node --version 2>/dev/null || echo "none")
MAJOR=$(echo "$CURRENT_NODE" | sed 's/v\([0-9]*\).*/\1/')

if [ "$MAJOR" = "$NODE_VERSION" ]; then
  ok "Node.js $CURRENT_NODE is active (matches $NODE_VERSION)"
else
  warn "Node.js $NODE_VERSION not active (current: $CURRENT_NODE) — installing..."
  nvm install "$NODE_VERSION"
  nvm alias default "$NODE_VERSION"
  nvm use "$NODE_VERSION"
  ok "Node.js $(node --version) is now active"
fi

# ── pnpm ─────────────────────────────────────────────────────────────────────

if command -v pnpm &>/dev/null; then
  ok "pnpm $(pnpm --version) already installed"
else
  warn "pnpm not found — installing via corepack..."
  corepack enable
  corepack prepare pnpm@latest --activate
  ok "pnpm $(pnpm --version) installed"
fi

# ── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "────────────────────────────────────────"
echo "  nvm   $(nvm --version)"
echo "  node  $(node --version)"
echo "  pnpm  $(pnpm --version)"
echo "────────────────────────────────────────"
echo ""
echo "Run:  pnpm install && pnpm dev"
echo ""

# Remind user to reload shell if nvm was just installed
if ! grep -q 'NVM_DIR' "${BASH_PROFILE:-$HOME/.bashrc}" 2>/dev/null || \
   ! grep -q 'NVM_DIR' "$HOME/.bashrc" 2>/dev/null; then
  warn "Reload your shell to make nvm permanent:  source ~/.bashrc"
fi
