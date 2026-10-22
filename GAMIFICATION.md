# Gamifikasi GrowthLab

Lapisan gamifikasi opsional di atas fitur belajar yang sudah ada. Prinsipnya:
- **Reward = kompetensi.** XP datang dari pelajaran yang selesai dan *skor* latihan. Mengulang latihan hanya memberi XP bila skornya naik.
- **Bisa dimatikan.** Toggle "Mode gamifikasi" ada di panel detail (klik chip level di navbar, atau tombol *Detail* di kartu Progres halaman Materi; saat nonaktif, kartu itu menampilkan tautan *Atur* untuk menyalakannya lagi). Saat nonaktif, semua elemen gamifikasi tersembunyi dan situs berjalan seperti biasa. XP tetap dicatat diam-diam, jadi tidak hilang bila diaktifkan lagi.
- **Tanpa leaderboard**, tanpa library tambahan, tanpa server.

Status: **Fase 1** (XP, level, notifikasi), **Fase 2** (badge, streak mingguan), **Fase 3** (quest mingguan, profil kesiapan kerja, remedial & petunjuk, saran urutan simulasi), **Fase 4** (cadangan progres, sertifikat, antarmuka penyimpanan), **Fase 5** (log pengukuran lokal).

## File

| File | Isi |
|---|---|
| `js/gamifikasi/01-config.js` | **Semua angka aturan** (XP, kurva level, nama level). Ubah di sini. |
| `js/gamifikasi/02-store.js` | Event bus `GLG.emit/on`, lapisan penyimpanan `GLG.storage`, ledger, versi skema & migrasi |
| `js/gamifikasi/03-rules.js` | Rule engine: hitung XP per event, total, level. Tidak menyentuh DOM. |
| `js/gamifikasi/04-ui.js` | Chip navbar, kartu level & streak, notifikasi `aria-live` (XP, badge, naik level, target minggu), panel detail (level, streak, koleksi badge) + toggle |
| `js/gamifikasi/05-cadangan.js` | Ekspor/impor progres (JSON) dan sertifikat PNG. Selalu tampil di panel, juga saat gamifikasi nonaktif. |
| `js/gamifikasi/06-log.js` | Log pengukuran lokal (sesi & event), ringkasan, unduh JSON/CSV |
| `css/13-gamifikasi.css` | Gaya. `html.gx-off` menyembunyikan semua elemen `.gx`. |

### Titik sambung di kode lama (hanya satu baris per tempat)

| Tempat | Event |
|---|---|
| `js/09-app.js` `markL()` dan `nextL()` (tombol *Tandai selesai* / *Pelajaran berikut*) | `GLG.emit("lesson", {k})` |
| `js/05-latihan.js` `qFinish()` (kuis selesai) | `GLG.emit("quiz", {m, score, benar, n, wrong})` (`wrong` = daftar [bab, pelajaran] soal yang salah) |
| `js/05-latihan.js` `showQ()` (soal tampil) | `GLG.emit("qshow", {m, b, l, ok, run, i, box})` untuk petunjuk |
| `js/05-latihan.js` `ddCheck()` (drag & drop dicek) | `GLG.emit("dnd", {id, benar, n})` |
| `js/06-sim-view.js` `finalize()` (simulasi tamat) | `GLG.emit("sim", {id, score})` |

Semua dipanggil sebagai `window.GLG&&GLG.emit(...)`, jadi kode lama tetap jalan walau folder gamifikasi dihapus.

## Aturan XP (Fase 1)

| Aktivitas | XP |
|---|---|
| Pelajaran selesai | 20, sekali per pelajaran |
| Kuis per bab | 30 × skor/100, +15 bila skor 100 |
| Kuis Gabungan | 50 × skor/100, +15 bila skor 100 |
| Drag & drop (per set) | 15 × benar/jumlah, +5 bila semua benar |
| Simulasi (per kasus) | 80 × skor/100, +10 bila skor ≥ 85 |

**Percobaan ulang:** XP = (potensi XP skor baru − XP yang sudah didapat untuk aktivitas itu) × faktor percobaan
`[1; 0,6; 0,35; 0,2]` untuk percobaan ke-1, 2, 3, dan 4 dst. Skor sama atau lebih rendah = 0 XP.
Contoh: kuis bab 80 → 24 XP; ulang dapat 100 → (45 − 24) × 0,6 = 13 XP.

Maksimal sekitar 890 XP bila semua aktivitas dikerjakan dengan skor sempurna di percobaan pertama.

## Badge (Fase 2)

Badge berbasis kompetensi, didefinisikan sebagai data di `GLG.CFG.badges` (`01-config.js`). Setiap badge memberi XP kecil sekali saja (key `badge:<id>`).

| Badge | Syarat | XP |
|---|---|---|
| Pengelola Diri / Peka Emosi / Pemikir Tajam | Semua pelajaran Bab 1 / 2 / 3 selesai | 15 |
| Lulus Uji Konsep | Lulus kuis Gabungan (≥ 70) | 20 |
| Skor Sempurna | Skor 100 di kuis mana saja | 15 |
| Teliti | Semua kartu benar di 6 set drag & drop | 15 |
| Pemecah Kasus | Tamatkan 1 simulasi | 10 |
| Siap Lapangan | Tamatkan 3 simulasi | 20 |
| Keputusan Unggul | Skor simulasi ≥ 85 | 15 |
| Konsisten | Target mingguan tercapai 1 minggu | 10 |
| Tekun | Streak mingguan 3 minggu | 20 |
| Tuntas | Semua latihan selesai (nilai akhir terbuka) | 25 |

Badge bab menggantikan notifikasi "Lencana baru" lama; medali di daftar bab halaman Materi tetap tampil (tersembunyi saat gamifikasi nonaktif).
Badge yang syaratnya sudah terpenuhi sebelum fitur ini ada dicatat diam-diam saat halaman dibuka.

### Menambah badge baru

1. Tambah objek di `GLG.CFG.badges`: `{ id, name, req, icon, color, xp, rule: { type, ... } }`.
2. `rule.type` memakai salah satu jenis yang ada (`chapter`, `quizScore`, `quizPass`, `dndPerfect`, `simCount`, `simScore`, `weeks`, `final`).
3. Butuh jenis baru? Tambah fungsi di `GLG.badgeRule` (`03-rules.js`) yang mengembalikan `{ cur, max }`; badge didapat saat `cur >= max`, dan `cur/max` tampil sebagai progres di koleksi.

## Streak mingguan (Fase 2)

- Minggu = Senin–Minggu menurut jam perangkat. **Hari belajar** = hari dengan aktivitas (pelajaran selesai, kuis, drag & drop, simulasi).
- Target: **3 hari belajar per minggu** (`GLG.CFG.streak.target`). Bukan streak harian, jadi cocok untuk jadwal yang tidak teratur.
- Streak = jumlah minggu berturut-turut yang target-nya tercapai. Minggu yang sedang berjalan tidak memutus streak.
- **Hari libur:** setiap 2 minggu target tercapai memberi 1 hari libur (maks 2). Minggu yang terlewat otomatis memakai hari libur sehingga streak tidak putus.
- Bila putus, pesan yang tampil mengajak mulai lagi ("Belajar itu maraton, bukan sprint"), tanpa hukuman XP.
- Streak dihitung ulang dari daftar `days` setiap kali, tanpa status tersembunyi.

## Quest mingguan (Fase 3)

- Setiap Senin dipilih 2 tujuan (`GLG.CFG.quest.pick`) dari daftar `quest.goals`, misalnya "Selesaikan 2 pelajaran" dan "Belajar di 3 hari berbeda". Tujuan yang tidak mungkin lagi (mis. pelajaran sudah habis) tidak dipilih.
- Pilihan disimpan per minggu di `quests` supaya tidak berubah di tengah minggu. Selesai semua tujuan → **30 XP** sekali per minggu (key `quest:<senin>`).
- Progres dihitung dari ledger minggu itu (pelajaran baru selesai, kuis/drag & drop/simulasi dikerjakan) dan daftar hari belajar. Tidak selesai = tidak ada hukuman.

## Profil kesiapan kerja / skill map (Fase 3)

Radar SVG 3 soft skill (satu per bab). Skor tiap skill 0–100 =
`20% × pelajaran bab selesai + 40% × skor kuis bab terbaik + 40% × skor simulasi terbaik` (bobot di `GLG.CFG.skillWeight`, pemetaan bab↔simulasi di `GLG.CFG.skills`).

## Remedial & petunjuk (Fase 3)

- **Remedial:** bila skor kuis di bawah batas lulus (70), muncul kartu "Saran belajar ulang" berisi sampai 3 pelajaran dengan soal salah terbanyak (tautan langsung ke pelajarannya). Saran juga tersimpan di panel sampai kuis mode itu diulang dengan skor lulus.
- **Petunjuk bertahap** (hanya kuis per bab; kuis Gabungan untuk nilai akhir tetap tanpa petunjuk):
  tahap 1 (−2 XP) menampilkan poin utama pelajaran terkait, tahap 2 (−3 XP) menghilangkan satu jawaban salah.
  Biaya dicatat sebagai event `hint` ber-XP negatif; total XP tidak pernah di bawah 0, dan tombol nonaktif bila XP belum cukup.

## Saran urutan simulasi / unlock ringan (Fase 3)

Simulasi kasus ke-*i* disarankan setelah lulus Kuis Bab *i*. Bila belum, membuka simulasi menampilkan dialog dengan dua pilihan:
**Kerjakan Kuis Bab i** atau **Lewati, main sekarang** (pilihan lewati diingat per simulasi di `skip`). Tidak ada konten yang benar-benar dikunci,
jadi nilai akhir tetap bisa diselesaikan dengan urutan apa pun. Saat gamifikasi nonaktif, dialog ini tidak muncul.
Untuk tes otomatis, set `window.GL_NO_GATE = 1` sebelum halaman dimuat.

## Cadangan progres & sertifikat (Fase 4)

- **Unduh cadangan (.json)**: semua key progres (`mer-done`, `gl-latihan`, `gl-ui`, `gl-badge`, `gl-ord`, `gl-gami`) dalam satu file
  `{ "format": "growthlab-progres", "version": 1, "exported": "...", "schemaVersion": 2, "data": { ... } }`. Berjalan tanpa server (Blob + `<a download>`).
- **Pulihkan dari file**: file divalidasi (format, tipe data, hanya key yang dikenal, maks 5 MB), minta konfirmasi, lalu halaman dimuat ulang.
  Data `gl-gami` versi lama otomatis dimigrasikan saat dimuat.
- **Sertifikat penyelesaian**: terbuka setelah 15 pelajaran selesai. Gambar PNG 1600×1130 (canvas, tanpa pustaka) berisi nama, bab, profil kesiapan kerja,
  level, XP, badge, dan nilai akhir bila sudah ada. Nama disimpan di `gl-ui.nama` (sama dengan kartu hasil cetak yang sudah ada).
- **Antarmuka penyimpanan**: semua akses data gamifikasi lewat `GLG.storage = { get(key), set(key, value) }`.
  Untuk pindah ke backend, panggil `GLG.useStorage(adapter)` sebelum `04-ui.js` dimuat; adapter async bisa memakai cache lokal lalu sinkron di belakang.
  Bagian lama situs (progres pelajaran & latihan) masih memakai localStorage langsung.

## Log pengukuran (Fase 5)

Key **`gl-log`**, hanya di browser, tidak pernah dikirim ke pihak mana pun. Tetap mencatat walau mode gamifikasi nonaktif.

```json
{ "schemaVersion": 1, "device": "q7ov6u36", "created": 1761100000000,
  "sessions": [{ "id": "knazknoj", "start": 1761100000000, "end": 1761101800000, "events": 12 }],
  "events": [{ "t": 1761100000000, "type": "quiz", "sid": "knazknoj", "data": { "m": "b0", "score": 60, "benar": 6, "n": 10 } }] }
```

- `device` = id acak per browser (anonim, bukan data pribadi). Sesi baru bila jeda > 30 menit. Maks 3.000 event (yang terlama dibuang).
- Jenis event: `session_start`, `view` (halaman), `lesson_done`, `quiz`, `dnd`, `sim`, `xp`, `badge`, `level_up`, `quest_done`, `hint`, `gate_skip`, `gami_toggle`, `export`, `sertifikat`.
- Panel → *Catatan aktivitas belajar*: ringkasan (sesi, hari aktif, menit, completion rate) dan unduh **.json** (ringkasan + sesi + event) atau **.csv** (satu baris per event). Log juga ikut dalam file cadangan progres.
- Ringkasan `quiz` berisi skor **percobaan pertama vs terbaik** per mode kuis, bisa dipakai sebagai data pre/post sederhana.

## Level

XP kumulatif untuk mencapai level *n* = `55 × (n − 1)^1,5`.

| Level | XP minimum | Sebutan |
|---|---|---|
| 1 | 0 | Pemula |
| 2 | 55 | Pemula |
| 3 | 156 | Calon Kandidat |
| 4 | 286 | Calon Kandidat |
| 5 | 440 | Siap Interview |
| 6 | 615 | Siap Interview |
| 7 | 808 | Job Ready |

Job Ready butuh sekitar 90% dari XP maksimal, jadi menandakan penguasaan hampir seluruh materi dan latihan.

## Data di localStorage

Key **`gl-gami`** (key lama `mer-done`, `gl-latihan`, `gl-ui`, `gl-badge` tidak diubah):

```json
{
  "schemaVersion": 2,
  "on": true,
  "ledger": [
    { "id": "lzx1abc", "type": "quiz", "xp": 24, "t": 1761100000000,
      "key": "quiz:b0#1", "meta": { "label": "Kuis Bab 1", "score": 80, "attempt": 1 } }
  ],
  "att": { "quiz:b0": 1 },
  "seenLevel": 2,
  "badges": { "bab1": 1761100000000 },
  "days": ["2026-10-20", "2026-10-22"],
  "quests": { "2026-10-19": { "goals": ["days", "quiz"] } },
  "remedial": { "b1": { "t": 1761100000000, "score": 40, "les": [{ "k": "1-0", "c": 3 }] } },
  "skip": { "s2": 1761100000000 },
  "created": 1761100000000
}
```

- `ledger` adalah sumber kebenaran; total XP dan level selalu dihitung ulang darinya.
- `key` = idempotencyKey. Event dengan key yang sudah ada tidak memberi XP lagi
  (`lesson:<bab-pelajaran>`, `quiz:<mode>#<percobaan>`, `dnd:<id>#<percobaan>`, `sim:<id>#<percobaan>`).
- Saat pertama kali aktif, progres lama (pelajaran selesai, skor terbaik kuis/drag & drop/simulasi) diubah jadi
  ledger (`meta.awal = true`) tanpa notifikasi, jadi pengguna lama langsung punya XP sesuai progresnya.
- `badges`: id badge → waktu didapat. `days`: tanggal lokal (YYYY-MM-DD) yang ada aktivitas belajarnya.
- **Migrasi skema:** naikkan `schemaVersion` di `01-config.js`, lalu tambah fungsi `MIG[versiLama]` di `02-store.js`.
  Versi 1 → 2 (Fase 2) menambah `badges` dan `days`; hari belajar diisi dari riwayat ledger & latihan, data lain tidak diubah.

## Mematikan gamifikasi

- Pengguna: panel detail → *Mode gamifikasi* → Nonaktif.
- Pengembang (hapus total): hapus 4 baris `<script src="js/gamifikasi/...">` dan `<link ... 13-gamifikasi.css>` di `index.html`.

## Catatan keamanan

Semua data ada di browser pengguna, jadi XP dan skor bisa diubah lewat devtools. Ini diterima untuk prototipe.
Logika XP sengaja terisolasi di `03-rules.js` dan penyimpanan di `GLG.storage`, supaya nanti bisa dipindah ke server
(Supabase/Firebase) dengan memvalidasi event di sisi server tanpa mengubah tampilan.
