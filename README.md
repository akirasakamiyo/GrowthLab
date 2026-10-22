# GrowthLab: Self Development for Job Seeker

Media pembelajaran interaktif berbasis website — Kelompok 8, Teknologi Pendidikan FIP UNJ.
Live: https://akirasakamiyo.github.io/GrowthLab/

## Struktur folder

```
index.html            kerangka halaman (markup saja)
css/                  gaya, dimuat berurutan sesuai nomor
  01-base.css           warna, tipografi, komponen dasar
  02-oblo.css           gaya visual utama (kartu, tombol, navbar)
  03-motion.css         animasi scroll (GSAP/Lenis)
  04-materi.css         halaman materi & latihan
  05-interaktif.css     aktivitas "Coba sendiri", beranda, peta konsep, glosarium
  06-latihan-game.css   kuis ala Quizizz & drag and drop
  07-simulasi.css       simulasi cerita bercabang
  08-simulasi-panggung.css  adegan & tokoh simulasi
  09-ilustrasi.css      animasi ilustrasi materi
  10-layout-lebar.css   revisi dosen: konten penuh layar 16:9
  11-lencana-bab.css    lencana saat bab tuntas 5/5
  12-nilai-terkunci.css nilai akhir terkunci sampai semua latihan selesai
js/                   skrip, dimuat berurutan sesuai nomor
  03-data.js            SEMUA ISI: materi Bab 1–3, kuis, drag & drop, simulasi, glosarium (edit teks di sini)
  04-sim-core.js        logika & rumus nilai simulasi
  05-latihan.js         kuis, drag & drop, nilai akhir
  06/07-sim-*.js        tampilan & panggung simulasi
  08-ui.js              widget beranda, peta, glosarium
  09-app.js             router halaman, progres, lencana bab
  10–19                 efek visual (hero 3D, chat, motion, hover)
  20-scorm.js           laporan nilai ke LMS (SCORM 1.2)
vendor/               pustaka & font lokal (GSAP, Lenis, Matter, three.js) — tidak perlu internet
assets/sim/           gambar latar simulasi
assets/sb/            screenshot untuk storyboard
tools/ dan tests/ ada di repo kerja (tidak ikut dipublikasikan)
tests/                tes otomatis (lihat tests/README.md)
arsip/                versi lama (v4, cadangan v6) — tidak dipakai
```

## Menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal: `node tests/serve.js` lalu buka http://localhost:8000.

## Membuat paket offline & update GitHub

```bash
node tools/build-offline.js          # dist/GrowthLab_offline.zip dan dist/GrowthLab_SCORM12.zip
./tools/build-pages.sh --push        # salin ke ~/Desktop/growthlab-web lalu push ke GitHub
```

## Unduh versi offline

- [GrowthLab_offline.zip](https://akirasakamiyo.github.io/GrowthLab/offline/GrowthLab_offline.zip) — ekstrak, lalu buka `index.html` (tanpa internet).
- [GrowthLab_SCORM12.zip](https://akirasakamiyo.github.io/GrowthLab/offline/GrowthLab_SCORM12.zip) — paket SCORM 1.2 untuk diunggah ke LMS (Moodle, dll.).

Isi kedua ZIP modular, sama seperti struktur di atas.
