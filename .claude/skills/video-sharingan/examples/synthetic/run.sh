#!/usr/bin/env bash
# Rebuild the synthetic reel, analyze it, and check every number against ground truth.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$HERE/../.."
python3 "$HERE/make_synthetic.py" "$HERE"                      # -> synthetic.mp4 (gitignored) + ground_truth.json
python3 "$ROOT/scripts/sharingan.py" analyze "$HERE/synthetic.mp4" -o "$HERE/out" --title "Synthetic test reel"
cp "$HERE/out/analysis.json" "$HERE/analysis.json"
cp "$HERE/out/brief.md" "$HERE/brief.md"
mkdir -p "$HERE/img"
python3 - "$HERE" <<'PY'
import sys, cv2
h = sys.argv[1]
cv2.imwrite(f"{h}/img/shots.jpg", cv2.imread(f"{h}/out/sheets/shots.png"), [cv2.IMWRITE_JPEG_QUALITY, 80])
cv2.imwrite(f"{h}/img/focus_shot02.jpg", cv2.imread(f"{h}/out/focus/focus_shot02.png"), [cv2.IMWRITE_JPEG_QUALITY, 85])
PY
python3 "$HERE/check.py" "$HERE/ground_truth.json" "$HERE/analysis.json" -o "$HERE/results.md"
