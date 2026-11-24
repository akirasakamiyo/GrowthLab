// Tes penerima data live (tools/apps-script/Code.gs) di Node lewat tiruan Apps Script, lalu hasilnya dibaca dashboard (GLDH).
// Jalankan: node tests/t-sinkron.js
const gas = require("./gas-mock.js"), H = require("../js/39-dosen-hitung.js"), crypto = require("crypto");
const sha = s => crypto.createHash("sha256").update(s).digest("hex");
let bad = 0, n = 0; const t = (name, ok, got) => { n++; if (!ok) { bad++; console.log("✕", name, got === undefined ? "" : JSON.stringify(got)) } };
const NOW = Date.now(), KODE = "kode-uji-server-1";
const G = gas({ KELAS: "TP8-2026, kelas-b", DOSEN_HASH: sha("lain") + "," + sha(KODE) });
const ans = [[0, 0, 1], [1, 2, 0]];
const kirim = (o = {}) => G.call(Object.assign({ op: "kirim", kelas: "tp8-2026", pid: "abc123", nama: "Ani  Lestari", qv: "q1", ev: [{ t: NOW - 1000, type: "lesson_done", data: { k: "0-0" } }, { t: NOW - 500, type: "quiz", data: { m: "b0", score: 50, benar: 1, n: 2, ans } }] }, o));

t("JSON rusak ditolak", G.call("{x").err === "json");
t("op tak dikenal ditolak", G.call({ op: "hapus" }).err === "op");
t("kode kelas salah ditolak", kirim({ kelas: "XX" }).err === "kelas" && G.rows.length === 0);
t("pid aneh ditolak", kirim({ pid: "<script>" }).err === "pid");
t("tanpa nama ditolak", kirim({ nama: " " }).err === "nama");
let r = kirim();
t("kiriman sah: 2 baris, kode kelas tidak peka huruf besar", r.ok && r.n === 2 && G.rows.length === 3 && G.rows[1][1] === "TP8-2026", r);
t("baris pertama = kepala kolom", G.rows[0].join() === "diterima,kelas,pid,nama,t,type,data,qv");
t("nama dirapikan", G.rows[1][3] === "Ani Lestari");
r = kirim({ ev: [{ t: 5, type: "quiz", data: {} }, { t: NOW, type: "hapus_semua", data: {} }, { t: NOW, type: "aktif", data: { x: "y".repeat(5000) } }] });
t("event tidak sah (waktu, jenis, ukuran) dibuang", r.ok && r.n === 0 && G.rows.length === 3, r);
kirim();   // kiriman ulang yang sama (respons hilang), harus tidak dihitung dua kali
G.call({ op: "kirim", kelas: "KELAS-B", pid: "dev-002", nama: "Budi", ev: [{ t: NOW - 100, type: "snapshot", data: { done: ["0-0", "0-1", "1-0"] } }, { t: NOW - 50, type: "aktif", data: {} }] });

t("ambil tanpa kode ditolak", G.call({ op: "data" }).err === "kode");
t("ambil kode salah ditolak", G.call({ op: "data", kode: "tebak" }).err === "kode");
t("hash kode dikirim langsung tidak berlaku", G.call({ op: "data", kode: sha(KODE) }).err === "kode");
r = G.call({ op: "data", kode: KODE });
t("kode benar: 2 peserta", r.ok && r.reports.length === 2, r.ok);
const ani = r.reports.find(x => x.summary.device === "abc123"), budi = r.reports.find(x => x.summary.device === "dev-002");
t("kiriman ganda tidak dobel", ani.events.length === 2, ani.events.length);
t("snapshot jadi daftar pelajaran selesai", budi.peserta.done.sort().join() === "0-0,0-1,1-0");
const reps = r.reports.map(x => H.parse(x)), ok = reps.every(x => x.ok);
t("laporan live bisa dibaca dashboard", ok);
const Q = [{ b: 0, q: "a", o: ["1", "2", "3", "4"], a: 0 }, { b: 0, q: "b", o: ["1", "2", "3", "4"], a: 1 }];
const A = H.analyze(reps.map(x => x.rep), { chapters: [{ t: "A", n: 2 }, { t: "B", n: 2 }], quiz: Q, pass: 70, now: NOW, qv: null });
const pa = A.peserta.find(p => p.pid === "abc123"), pb = A.peserta.find(p => p.pid === "dev-002");
t("Ani: 1 pelajaran, kuis 50, berjalan", pa.done === 1 && pa.avg === 50 && pa.status === "berjalan", pa);
t("Budi: 3 pelajaran dari snapshot, aktif hari ini", pb.done === 3 && pb.last >= NOW - 100, pb);
t("analisis soal dari data live: soal 2 salah 100%", A.soal.find(s => s.q === 1).pctWrong === 100);

/* batas laju dan kunci kode salah */
const G2 = gas({ KELAS: "K1", DOSEN_HASH: sha(KODE) });
const many = Array.from({ length: 200 }, (_, i) => ({ t: NOW - i, type: "aktif", data: {} }));
let lastErr = null; for (let i = 0; i < 4; i++) { const x = G2.call({ op: "kirim", kelas: "K1", pid: "rate1", nama: "Rr", ev: many }); if (!x.ok) lastErr = x.err }
t("lebih dari 600 event per 10 menit ditolak", lastErr === "laju" && G2.rows.length === 601, G2.rows.length);
for (let i = 0; i < 20; i++) G2.call({ op: "data", kode: "salah" + i });
t("20 kode salah: dikunci walau kode benar", G2.call({ op: "data", kode: KODE }).err === "tunggu");

console.log(`t-sinkron: ${n} kasus, ${bad} gagal`); process.exit(bad ? 1 : 0);
