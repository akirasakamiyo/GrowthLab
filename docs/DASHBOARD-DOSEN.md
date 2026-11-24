# Dashboard dosen / fasilitator (`#/dosen`)

Dashboard ini dipakai dosen atau fasilitator untuk memantau progres dan hasil belajar seluruh peserta tanpa menanyai mereka satu per satu. Ada lima komponen:

1. Ringkasan
2. Peserta yang perlu dibantu
3. Progres per peserta
4. Skor per bab
5. Soal yang paling sering salah

## Alur data

GrowthLab berjalan offline dan tidak punya server. Karena itu datanya tidak dikirim otomatis. Datanya berpindah lewat file:

1. **Peserta** membuka *Pengaturan → Progres belajar → Unduh laporan*. Peserta wajib mengisi nama dulu.
2. Peserta mengirim file `growthlab-laporan-YYYY-MM-DD.json` ke dosen, misalnya lewat folder Google Drive kelas atau WhatsApp.
3. **Dosen** membuka `#/dosen`, memasukkan kode fasilitator, lalu memilih *Impor laporan*. Dosen bisa memilih banyak file sekaligus atau menyeretnya ke halaman.
4. Laporan disimpan hanya di browser dosen (localStorage `gl-dosen`). Kalau satu perangkat mengirim laporan yang lebih baru, laporan lama dari perangkat itu otomatis tergantikan.

Isi laporan diambil dari **log pengukuran Fase 5** (`gl-log`, [js/gamifikasi/06-log.js](../js/gamifikasi/06-log.js)):

| Bagian | Isi |
|---|---|
| `summary.device` | Id acak per browser. Dipakai untuk mengenali laporan dari perangkat yang sama. |
| `peserta.nama` | Nama yang diisi peserta di Pengaturan. |
| `peserta.done` | Daftar kunci pelajaran yang sudah selesai (`"bab-pelajaran"`, dihitung dari 0). |
| `events[]` | Mencatat `lesson_done {k}` dan `quiz {m, score, benar, n, ans}`, masing-masing dengan waktu `t` dalam ms. |
| `ans` | `[indeks soal di GLD.QUIZ, opsi asli yang dipilih (-1 = waktu habis), 1 benar / 0 salah]` |
| `qv` | Sidik teks soal. Kalau soal kuis diubah, jawaban per soal dari laporan lama tidak dipakai di analisis soal. |

Laporan versi 1 (sebelum 24 Nov 2026) tetap bisa diimpor, tapi tanpa nama dan tanpa jawaban per soal.

## Cara membuka

Buka `…/GrowthLab/#/dosen`, atau ikuti tautan *Dashboard dosen & fasilitator* di Pengaturan bagian Tentang. Kode fasilitator dibagikan lewat jalur pribadi dan **tidak ditulis di repo**.

Kalau ingin mencoba tanpa data asli, tekan **Coba dengan data contoh**. Tombol itu menampilkan 24 peserta rekaan dengan pita kuning "Data contoh". Data contoh tidak disimpan dan tidak tercampur dengan laporan asli.

## Mengubah pengaturan

| Yang diubah | Tempat |
|---|---|
| Ambang "perlu dibantu" (hari tidak aktif, jumlah gagal berturut-turut, minimal percobaan di bawah batas) | `CFG.stuck` di [js/39-dosen-hitung.js](../js/39-dosen-hitung.js) |
| Batas "aktif", ambang soal mencurigakan (% salah, minimal jumlah jawaban) | `CFG` di file yang sama |
| Batas lulus kuis | `PASS_MCQ` di [js/03-data.js](../js/03-data.js). Nilai ini dipakai seluruh situs. |
| Daftar kode fasilitator | `AKSES` di [js/41-dosen.js](../js/41-dosen.js). Buat hash-nya dengan `node tools/kode-dosen.js "kode-baru"` lalu tempel. |
| Mematikan data contoh | Set `root.GLDOSEN_DEMO = false` di [js/40-dosen-contoh.js](../js/40-dosen-contoh.js). |

## Definisi

- **Progres:** jumlah pelajaran selesai dibagi total pelajaran (15).
- **Skor rata-rata peserta:** rata-rata skor *terbaik* tiap kuis bab yang pernah dikerjakan. Kuis Gabungan tidak dihitung di sini.
- **Selesai:** semua pelajaran selesai dan semua kuis bab lulus.
- **Belum mulai:** belum ada pelajaran selesai dan belum ada kuis.
- **Perlu dibantu (stuck):** peserta yang sudah mulai, belum selesai, dan memenuhi salah satu aturan berikut. Alasannya ditampilkan di dashboard.
  - a) tidak ada aktivitas selama ≥ 7 hari;
  - b) gagal ≥ 3 kali berturut-turut di kuis bab yang belum pernah ia lulusi;
  - c) semua percobaan kuis suatu bab di bawah batas lulus, minimal 2 percobaan.
- **Aktif 7 hari:** ada aktivitas (pelajaran, kuis, sesi) dalam 7 hari terakhir dihitung dari waktu dashboard dibuka.
- **Skor per bab:** rata-rata skor terbaik dari peserta yang sudah mencoba kuis bab itu, ditambah jumlah percobaan, jumlah yang lulus, dan jumlah yang materinya tuntas.
- **Analisis soal:** dihitung dari semua jawaban di semua percobaan, termasuk Kuis Gabungan.
  - % salah = jawaban salah ÷ semua jawaban.
  - Soal ditandai *mencurigakan* bila lebih dari 70% jawabannya salah dan sudah dijawab minimal 5 kali.
  - Distraktor terbanyak = opsi salah yang paling sering dipilih.

## Keamanan dan batasan (jujur)

- **Kode fasilitator hanya pembatas tampilan, bukan pengamanan.** Situs ini statis di GitHub Pages, jadi siapa pun yang membaca kode situs bisa melewati gerbang itu. Data peserta tetap aman karena **tidak pernah ada di situs**. Data hanya ada di file yang dikirim peserta dan di browser dosen. Peserta yang melewati gerbang hanya akan melihat dashboard kosong.
- Yang disimpan di repo hanya hash SHA-256 dari kode. Kode yang pendek atau mudah ditebak tetap bisa ditebak, jadi pakai kode acak minimal 12 karakter.
- Laporan bisa diubah oleh peserta sebelum dikirim, karena isinya JSON biasa. Untuk penilaian resmi, cocokkan dengan nilai yang terekam di LMS (SCORM) bila situs dipasang di LMS kampus.
- Pengumpulan tidak otomatis atau live. Kalau nanti dibutuhkan, alternatifnya adalah backend dengan login Google dan aturan akses di database (mis. Supabase dengan Row Level Security). Konsekuensinya: situs tidak lagi sepenuhnya offline dan perlu project serta OAuth sendiri.
- Log menyimpan maksimal 3.000 event dan 40 percobaan kuis per browser. Data dari perangkat lain atau dari browser yang datanya dihapus tidak ikut terbawa.

## Pengujian

```bash
node tests/t-dosen.js                        # logika: contoh kecil yang dihitung manual + kasus tepi
node tests/serve.js &                         # server lokal port 8000
node tests/t-dosen-ui.js chrome 1280          # ujung ke ujung: kuis -> laporan -> impor -> dashboard
node tests/t-dosen-ui.js webkit 390           # Safari, lebar ponsel
```
