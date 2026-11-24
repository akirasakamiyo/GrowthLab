# GrowthLab: Self Development for Job Seeker

Multimedia pembelajaran interaktif berbasis website untuk mengembangkan *soft skill* peserta didik SMK kelas XII dan lulusan baru dalam menghadapi proses mencari kerja. Produk ini dikembangkan oleh Kelompok 8, Program Studi Teknologi Pendidikan, Fakultas Ilmu Pendidikan, Universitas Negeri Jakarta, untuk mata kuliah Pengembangan Multimedia Pendidikan.

**Alamat produk:** https://akirasakamiyo.github.io/GrowthLab/

Repositori ini (cabang `kode`) berisi kode sumber. Uraian lengkap produk beserta tangkapan layar terdapat pada [docs/README-github.md](docs/README-github.md), yang juga ditampilkan di halaman utama repositori.

## Identitas

| Komponen | Keterangan |
|---|---|
| Jenis media | Multimedia interaktif berbasis website |
| Sasaran | Peserta didik SMK kelas XII dan lulusan baru |
| Materi | 3 bab, 15 pelajaran: Self-Management, Emotional Intelligence, Thinking Skill |
| Evaluasi | 60 soal uji pemahaman, 48 soal kuis pilihan ganda, 8 set *drag and drop*, 3 simulasi kasus bercabang |
| Model pengembangan | Hannafin dan Peck |
| Dosen pengampu | Kunto Imbar Nursetyo, S.Pd., M.Pd. |
| Tim pengembang | Rifa Haqi Putra Wibowo (1101624089) dan Thumpal Alvin (1101624069) |

## Menjalankan Produk

- **Daring:** buka alamat produk di atas.
- **Sebagai aplikasi:** pada Chrome atau Edge, buka *Pengaturan → Tentang GrowthLab → Pasang*. Pada iPhone atau iPad, buka melalui Safari, lalu pilih *Bagikan → Tambah ke Layar Utama*.
- **Dari repositori:** jalankan `node tests/serve.js`, lalu buka http://localhost:8000.

## Struktur Repositori

```
index.html            kerangka halaman
css/                  tampilan, dimuat berurutan sesuai nomor
js/                   skrip, dimuat berurutan sesuai nomor
  03-data.js            seluruh isi: materi, kuis, drag and drop, simulasi, glosarium
  26-uji-data.js        soal uji pemahaman setiap pelajaran
  44-beranda.js         dashboard peserta di beranda
  45-laporan.js         halaman Laporan pengembangan (#/laporan)
  46-versi.js           daftar versi produk yang dibekukan (versi/<slug>/)
  gamifikasi/           XP, level, lencana, target mingguan, sertifikat
vendor/               pustaka dan fon lokal (tanpa CDN)
assets/               gambar, video, ikon aplikasi, maskot Labi, foto tim (assets/tim/<NIM>.jpg)
manifest.webmanifest  identitas aplikasi (PWA)
sw.js                 service worker untuk penggunaan tanpa internet
docs/                 storyboard, README halaman GitHub, tangkapan layar
tools/                skrip penerbitan dan alat bantu
tests/                pengujian otomatis (lihat tests/README.md)
arsip/                versi lama, tidak digunakan
```

## Dokumen Pendukung

| Dokumen | Isi |
|---|---|
| [CATATAN.md](CATATAN.md) | Catatan pengembangan: keputusan desain, revisi berdasarkan masukan dosen, dan hasil pengujian |
| [docs/STORYBOARD.md](docs/STORYBOARD.md) | Storyboard dan skenario pembelajaran (tersedia juga dalam format PDF) |
| [GAMIFICATION.md](GAMIFICATION.md) | Aturan XP, level, lencana, dan target mingguan |
| [tests/README.md](tests/README.md) | Daftar pengujian dan cara menjalankannya |

## Pengembangan

```bash
npm install                          # sekali saja: Playwright untuk pengujian dan tangkapan layar
node tests/serve.js                  # server lokal di port 8000
node tests/t-smoke.js chrome 1280    # contoh pengujian; daftar lengkap di tests/README.md
node tools/screenshots.js            # memperbarui tangkapan layar di docs/screenshots
./tools/build-pages.sh --push        # menerbitkan ke GitHub Pages
```

**Versi beku.** Versi untuk setiap tahap pengumpulan dibekukan dengan `./tools/bekukan-versi.sh <slug>` ke `versi/<slug>/` di situs (lihat CATATAN.md bagian 20).

**Cabang dan tag.** Kode sumber berada pada cabang `kode`. Cabang `main` berisi situs yang ditayangkan dan diisi oleh `tools/build-pages.sh`, sehingga kode tidak digabungkan ke `main`. Versi yang dikumpulkan ditandai dengan *tag*, misalnya `pertemuan-12`.

**Keterbatasan.** Progres, skor, dan XP disimpan di peramban (*localStorage*), sehingga dapat diubah melalui *developer tools*. Hal ini dapat diterima untuk prototipe tugas mata kuliah.
