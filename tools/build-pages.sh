#!/bin/sh
# Menyalin versi web terbaru ke folder repo GitHub Pages (default: ~/Desktop/growthlab-web).
# Setelah dijalankan: buka GitHub Desktop → Commit → Push origin.
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$HOME/Desktop/growthlab-web}"
mkdir -p "$OUT/assets"
cp "$SRC/GrowthLab_v5.html" "$OUT/index.html"
rsync -a --delete "$SRC/vendor/" "$OUT/vendor/"
rsync -a --delete "$SRC/assets/sim/" "$OUT/assets/sim/"
rsync -a --delete "$SRC/assets/sb/" "$OUT/assets/sb/"
touch "$OUT/.nojekyll"
echo "Selesai: $OUT"
