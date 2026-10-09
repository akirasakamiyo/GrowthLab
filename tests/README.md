# Tes GrowthLab

Butuh Node.js. Untuk tes browser, pasang Playwright sekali: `npm i playwright@1.47.2` (di folder mana pun yang dipakai untuk menjalankan tes).

| Perintah | Isi |
|---|---|
| `node tests/t-core.js` | Validator data cerita + tes rumus, penyimpanan, migrasi (tanpa browser) |
| `node tests/serve.js` | Server statis lokal di port 8000 (dibutuhkan tes browser) |
| `node tests/t-sim.js chrome 1280` | Simulasi end-to-end (alur, refresh, Back/Forward, data lama/rusak/diblokir, debug) |
| `node tests/t-latihan.js chrome 1280 800` | Kuis & drag-and-drop |
| `node tests/t-smoke.js chrome 1280` | Semua halaman tanpa error console |
| `node tests/t-touch.js` | Gestur sentuh drag-and-drop |

Argumen browser: `chrome` atau `webkit`; tambahkan `reduce` untuk prefers-reduced-motion. Di browser, buka `GrowthLab_v5.html?debug=1#/latihan/sim` untuk melihat hasil validator, tes, dan tombol uji ending.
