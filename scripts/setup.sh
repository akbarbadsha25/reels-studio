#!/usr/bin/env bash
# Installs everything reels-studio needs. Safe to re-run.
# Runs automatically at the start of every Claude Code session (see .claude/settings.json),
# and works by hand on macOS: ./scripts/setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

log() { echo "[setup] $*" >&2; }

if [[ "$(uname)" == "Darwin" ]]; then
  command -v brew >/dev/null || { log "Install Homebrew first: https://brew.sh"; exit 1; }
  for pkg in node ffmpeg python@3.12; do brew list "$pkg" >/dev/null 2>&1 || brew install "$pkg"; done
  PIP="python3 -m pip install --user --break-system-packages"
else
  if ! command -v ffmpeg >/dev/null; then
    log "installing ffmpeg"
    (sudo -n true 2>/dev/null && SUDO=sudo || SUDO=""; $SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg) >/dev/null
  fi
  command -v node >/dev/null || { log "Node.js 18+ is required"; exit 1; }
  PIP="pip3 install --quiet --break-system-packages"
fi

# Node deps (Remotion). Skip when the lockfile hasn't changed since last install.
if [[ ! -d node_modules || package-lock.json -nt node_modules/.package-lock.json ]]; then
  log "installing node modules"
  npm ci --no-fund --no-audit --loglevel=error
fi

# Whisper for auto-captions.
python3 -c "import faster_whisper" 2>/dev/null || { log "installing faster-whisper"; $PIP faster-whisper==1.2.1; }

# Remotion needs headless Chrome. Cloud containers ship one in /opt/pw-browsers (found by render.mjs);
# elsewhere let Remotion fetch its own.
if ! ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell >/dev/null 2>&1; then
  npx --no-install remotion browser ensure >/dev/null 2>&1 || log "could not pre-download Chrome; Remotion will retry at render time"
fi

log "ready: node $(node -v), $(ffmpeg -version | head -1 | cut -d' ' -f1-3)"
