#!/bin/sh
# Menyalin versi web terbaru ke folder repo GitHub Pages (default: ~/Desktop/growthlab-web),
# lalu (opsional) commit + push: ./tools/build-pages.sh --push
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HOME/Desktop/growthlab-web"
PUSH=""
for a in "$@"; do case "$a" in --push) PUSH=1;; *) OUT="$a";; esac; done
mkdir -p "$OUT/assets"
cp "$SRC/index.html" "$OUT/index.html"
for d in css js vendor assets/sim assets/sb assets/video assets/lukisan assets/maskot; do rsync -a --delete --exclude src --exclude .DS_Store "$SRC/$d/" "$OUT/$d/"; done
# paket offline (hasil `node tools/build-offline.js`) untuk diunduh
if [ -d "$SRC/dist" ]; then rsync -a --delete "$SRC/dist/" "$OUT/offline/"; fi
# README & screenshot untuk halaman repo GitHub
if [ -f "$SRC/docs/README-github.md" ]; then cp "$SRC/docs/README-github.md" "$OUT/README.md"; fi
if [ -d "$SRC/docs/screenshots" ]; then mkdir -p "$OUT/docs"; rsync -a --delete "$SRC/docs/screenshots/" "$OUT/docs/screenshots/"; fi
touch "$OUT/.nojekyll"
echo "Selesai: $OUT"
if [ -n "$PUSH" ]; then
  cd "$OUT" && git add -A
  if git diff --cached --quiet; then echo "Tidak ada perubahan baru — GitHub sudah versi terbaru."
  else git commit -q -m "Update GrowthLab $(date +%Y-%m-%d)" && git push -q && echo "Sudah di-push ke GitHub (tunggu 1–2 menit, lalu refresh web)."; fi
fi
