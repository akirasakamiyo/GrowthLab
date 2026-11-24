# GrowthLab: Self Development for Job Seeker

Media pembelajaran interaktif berbasis website untuk melatih soft skill siswa SMK kelas XII dan *fresh graduate* yang sedang mencari kerja.
Dibuat oleh Kelompok 8, Teknologi Pendidikan FIP UNJ, untuk mata kuliah Pengembangan Multimedia Pendidikan.

**Buka:** https://akirasakamiyo.github.io/GrowthLab/

## Isi

- **15 pelajaran dalam 3 bab:** Self-Management, Emotional Intelligence, dan Thinking Skill. Setiap pelajaran berisi materi, contoh kasus, aktivitas, dan cek pemahaman.
- **Latihan:** kuis pilihan ganda, drag & drop, dan simulasi kasus dunia kerja yang bercabang.
- **Nilai akhir:** 30% kuis + 70% simulasi, lengkap dengan kategori kesiapan kerja dan sertifikat.
- **Panduan:** petunjuk, tujuan belajar, peta konsep, glosarium, referensi, dan identitas pengembang.
- Gratis, tanpa akun. Progres tersimpan di browser. Bisa dipasang sebagai aplikasi (PWA) dan dipakai tanpa internet setelah dibuka sekali.

## Cara membuka

- **Online:** buka tautan di atas.
- **Sebagai aplikasi:** di Chrome atau Edge, buka *Pengaturan → Tentang GrowthLab → Pasang*. Di iPhone atau iPad, buka di Safari lalu *Bagikan → Tambah ke Layar Utama*.
- **Dari folder ini:** jalankan `node tests/serve.js`, lalu buka http://localhost:8000.

## Struktur folder

```
index.html            kerangka halaman
css/                  tampilan, dimuat berurutan sesuai nomor
js/                   skrip, dimuat berurutan sesuai nomor
  03-data.js            semua isi: materi, kuis, drag & drop, simulasi, glosarium (edit teks di sini)
  26-uji-data.js        soal uji pemahaman per pelajaran
  gamifikasi/           XP, level, lencana, streak, sertifikat
vendor/               pustaka dan font lokal (tanpa CDN)
assets/               gambar, video, ikon aplikasi, maskot Labi
manifest.webmanifest  identitas aplikasi (PWA)
sw.js                 service worker: menyimpan file supaya jalan tanpa internet
docs/                 storyboard dan bahan README halaman GitHub
tools/                skrip deploy dan alat bantu
tests/                tes otomatis (lihat tests/README.md)
arsip/                versi lama, tidak dipakai
```

## Dokumen

| File | Isi |
|---|---|
| [CATATAN.md](CATATAN.md) | Catatan pengembangan lengkap: keputusan, revisi dari dosen, hasil uji |
| [docs/STORYBOARD.md](docs/STORYBOARD.md) | Storyboard dan skenario pembelajaran (juga tersedia PDF) |
| [GAMIFICATION.md](GAMIFICATION.md) | Aturan XP, level, lencana, dan streak |
| [tests/README.md](tests/README.md) | Daftar tes dan cara menjalankannya |

## Pengembangan

```bash
npm install                          # sekali: Playwright untuk tes dan screenshot
node tests/serve.js                  # server lokal di port 8000
node tests/t-smoke.js chrome 1280    # contoh tes; daftar lengkap di tests/README.md
./tools/build-pages.sh --push        # deploy ke GitHub Pages
```

**Branch:** kode ada di branch `kode`. Branch `main` berisi situs yang tayang (diisi oleh `build-pages.sh`), jadi jangan merge kode ke `main`.
**Tag:** versi yang dikumpulkan ditandai dengan tag, misalnya `pertemuan-12`.

Progres, skor, dan XP disimpan di localStorage browser, jadi bisa diubah lewat devtools. Ini diterima untuk prototipe.
