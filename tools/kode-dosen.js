// Buat hash SHA-256 untuk kode fasilitator dashboard dosen (#/dosen).
// Pakai: node tools/kode-dosen.js "kode-baru"  lalu tempel hash ke daftar AKSES di js/41-dosen.js.
// Kodenya sendiri JANGAN ditulis di repo; bagikan ke dosen lewat jalur pribadi.
const kode = process.argv[2];
if (!kode || kode.length < 8) { console.error('Pakai: node tools/kode-dosen.js "kode-minimal-8-karakter"'); process.exit(1) }
console.log(require("crypto").createHash("sha256").update(kode).digest("hex"));
