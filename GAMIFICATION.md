# Gamifikasi GrowthLab

Lapisan gamifikasi opsional di atas fitur belajar yang sudah ada. Prinsipnya:
- **Reward = kompetensi.** XP datang dari pelajaran yang selesai dan *skor* latihan. Mengulang latihan hanya memberi XP bila skornya naik.
- **Bisa dimatikan.** Toggle "Mode gamifikasi" ada di panel detail (klik chip level di navbar, tombol *Detail* di halaman Materi, atau tautan *Pengaturan gamifikasi* di footer). Saat nonaktif, semua elemen gamifikasi tersembunyi dan situs berjalan seperti biasa. XP tetap dicatat diam-diam, jadi tidak hilang bila diaktifkan lagi.
- **Tanpa leaderboard**, tanpa library tambahan, tanpa server.

Status: **Fase 1** (XP, level, notifikasi). Fase berikutnya: badge & streak mingguan, quest & skill map, ekspor/impor & sertifikat, log pengukuran.

## File

| File | Isi |
|---|---|
| `js/gamifikasi/01-config.js` | **Semua angka aturan** (XP, kurva level, nama level). Ubah di sini. |
| `js/gamifikasi/02-store.js` | Event bus `GLG.emit/on`, lapisan penyimpanan `GLG.storage`, ledger, versi skema & migrasi |
| `js/gamifikasi/03-rules.js` | Rule engine: hitung XP per event, total, level. Tidak menyentuh DOM. |
| `js/gamifikasi/04-ui.js` | Chip navbar, kartu level, notifikasi `aria-live`, naik level, panel detail + toggle |
| `css/13-gamifikasi.css` | Gaya. `html.gx-off` menyembunyikan semua elemen `.gx`. |

### Titik sambung di kode lama (hanya satu baris per tempat)

| Tempat | Event |
|---|---|
| `js/09-app.js` `markL()` dan `nextL()` (tombol *Tandai selesai* / *Pelajaran berikut*) | `GLG.emit("lesson", {k})` |
| `js/05-latihan.js` `qFinish()` (kuis selesai) | `GLG.emit("quiz", {m, score, benar, n})` |
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
  "schemaVersion": 1,
  "on": true,
  "ledger": [
    { "id": "lzx1abc", "type": "quiz", "xp": 24, "t": 1761100000000,
      "key": "quiz:b0#1", "meta": { "label": "Kuis Bab 1", "score": 80, "attempt": 1 } }
  ],
  "att": { "quiz:b0": 1 },
  "seenLevel": 2,
  "created": 1761100000000
}
```

- `ledger` adalah sumber kebenaran; total XP dan level selalu dihitung ulang darinya.
- `key` = idempotencyKey. Event dengan key yang sudah ada tidak memberi XP lagi
  (`lesson:<bab-pelajaran>`, `quiz:<mode>#<percobaan>`, `dnd:<id>#<percobaan>`, `sim:<id>#<percobaan>`).
- Saat pertama kali aktif, progres lama (pelajaran selesai, skor terbaik kuis/drag & drop/simulasi) diubah jadi
  ledger (`meta.awal = true`) tanpa notifikasi, jadi pengguna lama langsung punya XP sesuai progresnya.
- **Migrasi skema:** naikkan `schemaVersion` di `01-config.js`, lalu tambah fungsi `MIG[versiLama]` di `02-store.js`.

## Mematikan gamifikasi

- Pengguna: panel detail → *Mode gamifikasi* → Nonaktif.
- Pengembang (hapus total): hapus 4 baris `<script src="js/gamifikasi/...">` dan `<link ... 13-gamifikasi.css>` di `index.html`.

## Catatan keamanan

Semua data ada di browser pengguna, jadi XP dan skor bisa diubah lewat devtools. Ini diterima untuk prototipe.
Logika XP sengaja terisolasi di `03-rules.js` dan penyimpanan di `GLG.storage`, supaya nanti bisa dipindah ke server
(Supabase/Firebase) dengan memvalidasi event di sisi server tanpa mengubah tampilan.
