// Tes logika dashboard dosen (js/39-dosen-hitung.js) dengan contoh kecil yang bisa dihitung manual.
// Jalankan: node tests/t-dosen.js
const H = require("../js/39-dosen-hitung.js");
const DAY = 864e5, NOW = Date.parse("2026-11-24T12:00:00Z");
let bad = 0, n = 0;
const t = (name, ok, got) => { n++; if (!ok) { bad++; console.log("✕", name, got === undefined ? "" : JSON.stringify(got)) } };
const near = (a, b) => a != null && Math.abs(a - b) < 0.05;

/* kursus mini: 2 bab x 2 pelajaran, 4 soal (2 per bab), batas lulus 70 */
const QUIZ = [{ b: 0, q: "S1", o: ["a", "b", "c", "d"], a: 0 }, { b: 0, q: "S2", o: ["a", "b", "c", "d"], a: 1 }, { b: 1, q: "S3", o: ["a", "b", "c", "d"], a: 2 }, { b: 1, q: "S4", o: ["a", "b"], a: 0 }];
const CTX = { chapters: [{ t: "Bab A", n: 2 }, { t: "Bab B", n: 2 }], quiz: QUIZ, pass: 70, now: NOW, qv: H.quizVersion(QUIZ) };
const ev = (type, d, t) => ({ t, type, sid: "s", data: d });
const quiz = (m, score, ans, t) => ev("quiz", { m, score, benar: ans.filter(a => a[2]).length, n: ans.length, ans }, t);
const rep = (id, nama, events, extra = {}) => Object.assign({ format: "growthlab-log", version: 2, exported: new Date(NOW).toISOString(), summary: { device: id }, peserta: { nama, done: [] }, qv: CTX.qv, sessions: [], events }, extra);
const P = raw => { const r = H.parse(JSON.stringify(raw)); if (!r.ok) throw new Error(r.err); return r.rep };

/* A: selesai semua, lulus kedua bab */
const A = rep("A", "Ani", [ev("lesson_done", { k: "0-0" }, NOW - 5 * DAY), ev("lesson_done", { k: "0-1" }, NOW - 5 * DAY), ev("lesson_done", { k: "1-0" }, NOW - 4 * DAY), ev("lesson_done", { k: "1-1" }, NOW - 4 * DAY),
  quiz("b0", 100, [[0, 0, 1], [1, 1, 1]], NOW - 3 * DAY), quiz("b1", 50, [[2, 2, 1], [3, 1, 0]], NOW - 2 * DAY), quiz("b1", 100, [[2, 2, 1], [3, 0, 1]], NOW - DAY)]);
/* B: bab 0 selesai, gagal 3x berturut-turut di bab 0 -> stuck (b) */
const B = rep("B", "Budi", [ev("lesson_done", { k: "0-0" }, NOW - 3 * DAY), ev("lesson_done", { k: "0-1" }, NOW - 3 * DAY),
  quiz("b0", 50, [[0, 2, 0], [1, 1, 1]], NOW - 3 * DAY), quiz("b0", 0, [[0, 2, 0], [1, 3, 0]], NOW - 2 * DAY), quiz("b0", 50, [[0, 2, 0], [1, 1, 1]], NOW - DAY)]);
/* C: 1 pelajaran, tidak aktif 10 hari -> stuck (a) */
const C = rep("C", "Cici", [ev("lesson_done", { k: "0-0" }, NOW - 10 * DAY)]);
/* D: dua percobaan bab 0 di bawah batas -> stuck (c); jawaban salah memakai waktu habis (-1) */
const D = rep("D", "Dodi", [ev("lesson_done", { k: "0-0" }, NOW - DAY), ev("lesson_done", { k: "0-1" }, NOW - DAY), quiz("b0", 50, [[0, -1, 0], [1, 1, 1]], NOW - DAY), quiz("b0", 50, [[0, 3, 0], [1, 1, 1]], NOW - DAY / 2)]);
/* E: belum mulai sama sekali, nama sangat panjang */
const E = rep("E", "X".repeat(300), []);

const R = H.analyze(H.merge([A, B, C, D, E].map(P)), CTX);
const by = Object.fromEntries(R.peserta.map(p => [p.pid, p]));

/* status dan aturan stuck */
t("A selesai", by.A.status === "selesai", by.A.status);
t("B stuck karena gagal 3x (aturan b)", by.B.status === "stuck" && by.B.reasons.length === 1 && by.B.reasons[0].k === "b", by.B.reasons);
t("C stuck karena tidak aktif 10 hari (aturan a)", by.C.status === "stuck" && by.C.reasons[0].k === "a" && /10 hari/.test(by.C.reasons[0].t), by.C.reasons);
t("D stuck karena selalu di bawah batas (aturan c)", by.D.status === "stuck" && by.D.reasons.map(r => r.k).join() === "c", by.D.reasons);
t("E belum mulai, bukan stuck", by.E.status === "belum" && !by.E.reasons.length, by.E);
t("nama panjang dipotong 120 karakter", by.E.nama.length === 120);

/* progres dan skor */
t("progres A 100%, B 50%, C 25%", by.A.pct === 100 && by.B.pct === 50 && by.C.pct === 25);
t("skor rata-rata A = rata-rata skor terbaik per bab = (100+100)/2", by.A.avg === 100, by.A.avg);
t("skor rata-rata B = 50 (terbaik bab 0)", by.B.avg === 50, by.B.avg);
t("peserta tanpa percobaan: skor rata-rata null", by.C.avg === null && by.E.avg === null);
t("posisi terakhir A = bab 2 pelajaran 2", by.A.far && by.A.far.join() === "1,1", by.A.far);

/* KPI */
t("KPI total 5, stuck 3, selesai 1, belum 1", R.kpi.total === 5 && R.kpi.stuck === 3 && R.kpi.selesai === 1 && R.kpi.belum === 1, R.kpi);
t("KPI aktif 7 hari = A, B, D (C 10 hari lalu, E tanpa aktivitas)", R.kpi.aktif === 3, R.kpi.aktif);
t("KPI rata progres = (100+50+25+50+0)/5 = 45", near(R.kpi.avgPct, 45), R.kpi.avgPct);
t("KPI rata skor = (100+50+50)/3 = 66,7", near(R.kpi.avgScore, 66.7), R.kpi.avgScore);

/* per bab */
t("bab 1: rata skor terbaik (100+50+50)/3 = 66,7; 3 peserta; 6 percobaan; 1 lulus", near(R.bab[0].avg, 66.7) && R.bab[0].tried === 3 && R.bab[0].attempts === 6 && R.bab[0].lulus === 1, R.bab[0]);
t("bab 1 materi tuntas: A, B, D = 3 dari 5 = 60%", R.bab[0].complete === 3 && R.bab[0].completeRate === 60, R.bab[0]);
t("bab 2: 1 peserta, rata 100, 2 percobaan", R.bab[1].avg === 100 && R.bab[1].tried === 1 && R.bab[1].attempts === 2, R.bab[1]);

/* analisis soal */
const S = Object.fromEntries(R.soal.map(s => [s.q, s]));
/* soal 0: A benar 1x; B salah 3x pilih C(2); D salah 2x (waktu habis, D(3)) -> 6 jawaban, 5 salah = 83,3% */
t("soal 1: 6 jawaban, 3 peserta, 83,3% salah", S[0].n === 6 && S[0].peserta === 3 && near(S[0].pctWrong, 83.3), S[0]);
t("soal 1: distraktor terbanyak C (3x)", S[0].top && S[0].top.p === 2 && S[0].top.n === 3, S[0].top);
t("soal 1: sebaran waktu habis tercatat sebagai -1", S[0].dist[-1] === 1 && S[0].dist[3] === 1, S[0].dist);
t("soal 1 mencurigakan (>70% salah, >=5 jawaban)", S[0].suspect === true);
t("soal 2: 6 jawaban, 1 salah = 16,7%", S[1].n === 6 && near(S[1].pctWrong, 16.7), S[1]);
t("soal 4: 2 jawaban, 50% salah, data sedikit, bukan mencurigakan", S[3].n === 2 && S[3].pctWrong === 50 && S[3].few && !S[3].suspect, S[3]);
t("urutan: persentase salah tertinggi di atas", R.soal[0].q === 0);

/* kasus tepi */
const Z = H.analyze([], CTX);
t("data kosong: KPI nol/null, tanpa error", Z.kpi.total === 0 && Z.kpi.avgPct === null && Z.kpi.avgScore === null && Z.bab.every(b => b.avg === null && b.completeRate === null));
t("soal tanpa penjawab: n 0, pctWrong null, tidak mencurigakan", Z.soal.every(s => s.n === 0 && s.pctWrong === null && !s.suspect));
t("file bukan JSON ditolak", !H.parse("bukan json").ok);
t("JSON format lain ditolak", !H.parse('{"format":"lain","events":[]}').ok);
t("laporan tanpa id perangkat ditolak", !H.parse('{"format":"growthlab-log","events":[]}').ok);
t("event rusak diabaikan, bukan error", H.parse({ format: "growthlab-log", summary: { device: "x" }, events: [null, { t: "x" }, { t: 1, type: "quiz", data: { m: "b0", score: 900, n: 1 } }] }).rep.attempts.length === 0);
t("laporan versi 1 (tanpa nama, tanpa jawaban) tetap terbaca", (() => { const r = H.parse({ format: "growthlab-log", version: 1, summary: { device: "v1" }, events: [ev("quiz", { m: "b0", score: 80, benar: 2, n: 2 }, NOW)] }); return r.ok && r.rep.nama === "" && r.rep.attempts[0].ans === null })());
t("laporan baru dari perangkat sama menggantikan yang lama", (() => { const o = P(rep("A", "Ani", [], { exported: "2026-11-01T00:00:00Z" })), b = P(rep("A", "Ani baru", [], { exported: "2026-11-20T00:00:00Z" })); const m = H.merge([b, o]); return m.length === 1 && m[0].nama === "Ani baru" })());
t("versi soal berbeda: jawaban tidak dipakai, ada peringatan", (() => { const x = H.analyze([P(rep("Q", "Q", [quiz("b0", 0, [[0, 3, 0]], NOW)], { qv: "lain" }))], CTX); return x.soal.every(s => s.n === 0) && x.warn.length === 1 && x.peserta[0].wrong.length === 0 })());
t("nama sama dari dua perangkat: ada peringatan", H.analyze([P(rep("1", "Sama", [])), P(rep("2", "sama", []))], CTX).warn.some(w => /nama yang sama/.test(w)));
t("ambang bisa diubah: inactiveDays 15 -> C tidak stuck", H.analyze([P(C)], Object.assign({}, CTX, { cfg: { stuck: { inactiveDays: 15 } } })).peserta[0].status === "berjalan");

/* CSV */
const csv = H.progresCSV(R);
t("CSV progres: BOM, kepala kolom, 5 baris data", csv.charCodeAt(0) === 0xfeff && csv.split("\r\n").length === 6 && /^﻿Nama,/.test(csv));
t("CSV aman dari formula injection", (() => { const x = H.analyze([P(rep("F", "=HYPERLINK(1)", []))], CTX); return H.progresCSV(x).includes(`"'=HYPERLINK(1)"`) })());
t("CSV stuck hanya berisi 3 peserta stuck", H.stuckCSV(R).split("\r\n").length === 4);
t("CSV soal: 4 soal + kepala", H.soalCSV(R).split("\r\n").length === 5);

/* SHA-256 */
t("sha256 cocok dengan nilai baku", H.sha256("abc") === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");

console.log(`t-dosen: ${n} kasus, ${bad} gagal`); process.exit(bad ? 1 : 0);
