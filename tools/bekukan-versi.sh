#!/bin/sh
# Membekukan versi produk saat ini ke <repo situs>/versi/<slug>/ supaya bisa dibandingkan dengan versi terbaru.
# Pakai (setelah commit): ./tools/bekukan-versi.sh pertemuan-12
#   lalu ./tools/build-pages.sh --push untuk menerbitkan semuanya.
# Slug harus sudah ada di DAFTAR pada js/46-versi.js (nama dan tanggal versi untuk label dan kartu Tentang).
# Folder versi yang sudah ada tidak ditimpa kecuali TIMPA=1.
set -e
SLUG="$1"; WEB="${2:-$HOME/Desktop/growthlab-web}"
SRC="$(cd "$(dirname "$0")/.." && pwd)"
case "$SLUG" in ""|*[!a-z0-9-]*) echo "Pakai: tools/bekukan-versi.sh <slug>, huruf kecil, angka, dan tanda hubung"; exit 1;; esac
grep -q "slug: \"$SLUG\"" "$SRC/js/46-versi.js" || { echo "Slug $SLUG belum ada di DAFTAR js/46-versi.js"; exit 1; }
DEST="$WEB/versi/$SLUG"
if [ -e "$DEST" ] && [ -z "$TIMPA" ]; then echo "Sudah ada: $DEST (pakai TIMPA=1 untuk menimpa)"; exit 1; fi
rm -rf "$DEST"
"$SRC/tools/build-pages.sh" "$DEST" >/dev/null
rm -rf "$DEST/README.md" "$DEST/docs" "$DEST/.nojekyll"
echo "Dibekukan: $DEST (commit $(git -C "$SRC" rev-parse --short HEAD))"
