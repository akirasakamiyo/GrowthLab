# Tes GrowthLab

Butuh Node.js. Untuk tes browser, pasang Playwright sekali: `npm i playwright@1.47.2` (di folder mana pun yang dipakai untuk menjalankan tes).

| Perintah | Isi |
|---|---|
| `node tests/t-core.js` | Validator data cerita + tes rumus, penyimpanan, migrasi (tanpa browser) |
| `node tests/serve.js` | Server statis lokal di port 8000 (dibutuhkan tes browser) |
| `node tests/t-sim.js chrome 1280` | Simulasi end-to-end (alur, refresh, Back/Forward, data lama/rusak/diblokir, debug) |
| `node tests/t-qa.js chrome` | QA akhir: semua ending lewat UI, konsistensi nilai di semua tampilan, klik beruntun, ubah ukuran, pindah tab/kasus, penyimpanan penuh, aksesibilitas dasar |
| `node tests/t-latihan.js chrome 1280 800` | Kuis & drag-and-drop |
| `node tests/t-kunci.js chrome 1280 800` | Kunci latihan: kuis, drag & drop, dan simulasi terkunci sampai semua pelajaran bab terkait selesai (pengguna baru, 4 dari 5 pelajaran, Bab 1 tuntas, Bab 1+2, semua selesai; tautan langsung; misi mingguan) |
| `node tests/t-smoke.js chrome 1280` | Semua halaman tanpa error console |
| `node tests/t-touch.js` | Gestur sentuh drag-and-drop |

Tes lain (t-latihan, t-qa, t-sim, t-touch, t-smoke) mengisi semua pelajaran sebagai selesai lebih dulu supaya latihan terbuka; hanya t-kunci yang menguji keadaan terkunci.

Argumen browser: `chrome` atau `webkit`; tambahkan `reduce` untuk prefers-reduced-motion. Di browser, buka `index.html?debug=1#/latihan/sim` untuk melihat hasil validator, tes, dan tombol uji ending.
