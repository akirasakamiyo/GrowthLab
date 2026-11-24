# Memasang penerima data live (Google Apps Script)

Cukup dilakukan sekali, oleh pemilik akun Google pengelola. Waktunya sekitar 10 menit. Peserta tidak perlu login. Data mereka masuk ke Google Sheet milikmu.

## 1. Buat Sheet dan script

1. Buka [sheets.new](https://sheets.new) lalu beri nama, misalnya **GrowthLab Data Live**.
2. Pilih menu **Ekstensi → Apps Script**.
3. Hapus isi `Code.gs`, lalu tempel seluruh isi [Code.gs](Code.gs) dari folder ini. Simpan.

## 2. Isi pengaturan (Script Properties)

Pilih **Setelan proyek** (ikon roda gigi) → **Properti skrip** → **Tambahkan properti skrip**, lalu isi dua properti:

| Properti | Isi |
|---|---|
| `KELAS` | Kode kelas yang boleh mengirim data, misalnya `TP8-2026`. Kalau lebih dari satu, pisahkan dengan koma. Kode ini dibagikan ke peserta. |
| `DOSEN_HASH` | Hash dari kode fasilitator. Buat dengan perintah `node tools/kode-dosen.js "kode-fasilitator"` dan pakai **kode yang sama** dengan kode untuk membuka `#/dosen`. |

Kode fasilitator sendiri tidak pernah ditulis di mana pun. Yang disimpan hanya hash-nya.

## 3. Deploy

1. Pilih **Terapkan → Deployment baru → Jenis: Aplikasi web**.
2. Atur dua pilihan ini:
   - **Jalankan sebagai: Saya**
   - **Yang memiliki akses: Siapa saja**. Ini yang membuat peserta tidak perlu login. Data tetap tidak bisa dibaca tanpa kode fasilitator.
3. Pilih **Terapkan**, izinkan akses ke Sheet, lalu salin **URL aplikasi web** (berakhiran `/exec`).
4. Tempel URL itu ke `URL_WEB_APP` di [js/42-sinkron.js](../../js/42-sinkron.js), lalu deploy situs.

Kalau nanti `Code.gs` diubah: pilih **Terapkan → Kelola deployment → Edit → Versi: baru**. Dengan cara ini URL-nya tetap sama.

## 4. Cek

- Membuka URL `/exec` di browser harus menampilkan `{"ok":true,"app":"growthlab-live","v":1}`.
- Di situs, buka Pengaturan dan isi nama dan kode kelas, lalu nyalakan **Kirim progres ke dosen secara otomatis**. Sebuah baris baru harus muncul di tab **Data** pada Sheet.
- Buka `#/dosen` dengan kode fasilitator. Peserta tadi harus muncul dengan keterangan "Data live diperbarui …".

## Yang perlu diketahui

- **Tanpa login berarti tidak ada verifikasi identitas.** Siapa pun yang tahu kode kelas bisa mengirim data atas nama apa saja. Pembatas yang ada: kode kelas, maksimal 600 event per perangkat per 10 menit, dan validasi jenis serta ukuran data.
- Membaca data dijaga oleh kode fasilitator yang dicek **di server**. Setelah 20 kode salah, permintaan dikunci selama 10 menit.
- Kuota gratis Apps Script lebih dari cukup untuk satu kelas: sekitar 20.000 panggilan per hari.
- Untuk menghapus data, hapus baris di Sheet. Untuk berhenti menerima data, arsipkan deployment-nya.
