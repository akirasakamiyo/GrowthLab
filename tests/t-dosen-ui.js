// Tes ujung ke ujung dashboard dosen: kuis mencatat jawaban per soal -> peserta unduh laporan di Pengaturan
// -> dosen ditolak tanpa kode -> buka dengan kode -> impor laporan -> data contoh, saring, cari, urut, detail, CSV, kunci.
// Jalankan (server: node tests/serve.js): node tests/t-dosen-ui.js [chrome|webkit] [lebar]
const { chromium, webkit } = require("playwright");
const fs = require("fs");
const BASE = process.env.BASE || "http://localhost:8000/index.html";
const which = process.argv[2] || "chrome", W = +(process.argv[3] || 1280);
const sl = ms => new Promise(r => setTimeout(r, ms));
const KODE = "kode-uji-otomatis-123";   // hanya ditambahkan sementara ke halaman selama tes, tidak ada di kode situs
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("✕", m) } };
(async () => {
  const b = await (which === "webkit" ? webkit : chromium).launch(which === "chrome" ? { channel: "chrome" } : {});
  const ctx = await b.newContext({ viewport: { width: W, height: 860 }, acceptDownloads: true }), p = await ctx.newPage(), errs = [];
  p.on("pageerror", e => errs.push("pageerror " + e.message));
  p.on("console", m => { if (/error|warning/.test(m.type())) { const t = m.text(); if (!/api\/config|api\/me|WebGL|Failed to load resource|GPU stall|GroupMarkerNotSet/i.test(t)) errs.push(m.type() + " " + t) } });
  await p.goto(BASE + "?t=" + Date.now() + "#/latihan/kuis", { waitUntil: "load" });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem("mer-done", JSON.stringify(["0-0", "0-1", "0-2", "0-3", "0-4"])); localStorage.setItem("gl-ui", JSON.stringify({ nama: "Uji Peserta" })) });
  await p.reload({ waitUntil: "load" });
  await p.waitForFunction(() => !document.getElementById("zpre") && document.querySelector('[data-qz="open"][data-m="b0"]'), null, { timeout: 15000 }); await sl(800);
  const hs = async tag => { const r = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(r[0] <= r[1] + 1, `tanpa scroll horizontal (${tag}) ${r[0]}/${r[1]}`) };

  /* 1. kuis bab 1: 3 soal pertama salah, sisanya benar */
  await p.click('[data-qz="open"][data-m="b0"]'); await p.waitForSelector(".gq-lcard .gq-start", { state: "visible" });
  await p.click('.gq-seg [data-v="0"]'); await sl(700); await p.click(".gq-lcard .gq-start", { force: true });
  for (let i = 0; i < 40; i++) {
    await p.waitForSelector(".gq-o:not(:disabled), .gq-res", { timeout: 15000 }); if (await p.$(".gq-res")) break;
    const c = await p.evaluate(() => { const qt = document.getElementById("gqq").textContent.trim(), x = GLD.QUIZ.find(z => z.q === qt); return [...document.querySelectorAll(".gq-o")].findIndex(b => b.querySelector("span").textContent === x.o[x.a]) });
    await p.click(`.gq-o[data-k="${i < 3 ? (c + 1) % 4 : c}"]`); await p.waitForSelector("#gqnext", { state: "visible", timeout: 8000 }); await p.click("#gqnext");
  }
  const lg = await p.evaluate(() => { const L = JSON.parse(localStorage.getItem("gl-log")), q = L.events.filter(e => e.type === "quiz").pop(); return q && q.data });
  ok(lg && Array.isArray(lg.ans) && lg.ans.length === lg.n, "log Fase 5 mencatat jawaban per soal");
  ok(lg && lg.ans.filter(a => a[2]).length === lg.benar && lg.benar === lg.n - 3, "jumlah jawaban benar di log sama dengan skor");
  ok(lg && await p.evaluate(ans => ans.every(([q, k, ok]) => GLD.QUIZ[q] && GLD.QUIZ[q].b === 0 && (GLD.QUIZ[q].a === k) === !!ok), lg.ans), "indeks soal dan opsi di log menunjuk soal asli");
  await p.keyboard.press("Escape"); await sl(400);

  /* 2. peserta mengunduh laporan dari Pengaturan */
  await p.evaluate(() => location.hash = "#/pengaturan"); await sl(1200);
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#st-lap-b")]);
  const file = await dl.path(), rep = JSON.parse(fs.readFileSync(file, "utf8"));
  ok(rep.format === "growthlab-log" && rep.version === 2 && rep.peserta.nama === "Uji Peserta" && rep.peserta.done.length === 5 && rep.qv, "laporan v2 berisi nama, pelajaran, sidik soal");
  await p.evaluate(() => { localStorage.setItem("gl-ui", "{}") }); await p.evaluate(() => location.hash = "#/"); await sl(500); await p.evaluate(() => location.hash = "#/pengaturan"); await sl(1000);
  await p.click("#st-lap-b"); await sl(200);
  ok(/Isi dan simpan namamu/.test(await p.textContent("#st-lap-e")), "tanpa nama: laporan tidak diunduh, ada pesan");

  /* 3. dashboard tertutup tanpa kode */
  await p.evaluate(() => location.hash = "#/dosen"); await sl(1200);
  ok(await p.$("#dsn-gate") && !(await p.$(".dsn-t")), "peserta melihat gerbang, bukan data");
  ok(/bukan untukmu/.test(await p.textContent(".dsn-top")), "pesan penolakan jelas");
  ok(await p.title() === "Dashboard Dosen · GrowthLab" || /Dashboard Dosen/.test(await p.title()), "judul tab");
  await p.fill("#dsn-code", "salah-kode"); await p.click("#dsn-gate button"); await sl(200);
  ok(/tidak dikenali/.test(await p.textContent("#dsn-gate-e")) && !(await p.$(".dsn-bar")), "kode salah ditolak");
  await p.evaluate(h => GLDOSEN.AKSES.push({ label: "tes", hash: h }), require("../js/39-dosen-hitung.js").sha256(KODE));
  await p.fill("#dsn-code", KODE); await p.click("#dsn-gate button"); await sl(500);
  ok(await p.$(".dsn-empty") && await p.$("#dsn-in"), "kode benar: dashboard kosong dengan petunjuk");
  await hs("dashboard kosong");

  /* 4. impor laporan asli */
  await p.setInputFiles("#dsn-in", file); await sl(700);
  const n1 = await p.$$eval(".dsn-t tbody tr", r => r.length);
  ok(n1 === 1 && /Uji Peserta/.test(await p.textContent(".dsn-t tbody")), "laporan asli terimpor: 1 peserta");
  ok(await p.$$eval(".dsn-si", r => r.length) === 15, "analisis soal dari jawaban asli (15 soal bab 1)");
  await p.setInputFiles("#dsn-in", { name: "rusak.json", mimeType: "application/json", buffer: Buffer.from("{nope") }); await sl(500);
  ok(/rusak\.json/.test(await p.textContent("#dsn-msg")) && (await p.$$eval(".dsn-t tbody tr", r => r.length)) === 1, "file rusak dilaporkan, data lama tetap");
  await p.reload({ waitUntil: "load" }); await p.waitForFunction(() => !document.getElementById("zpre"), null, { timeout: 15000 }); await sl(1200);
  /* kode uji hanya ada di memori halaman: setelah muat ulang gerbang harus muncul lagi */
  ok(await p.$("#dsn-gate"), "kode yang tidak ada di daftar AKSES tidak bisa dipakai lagi setelah muat ulang");
  await p.evaluate(h => { GLDOSEN.AKSES.push({ label: "tes", hash: h }); location.hash = "#/" }, require("../js/39-dosen-hitung.js").sha256(KODE)); await sl(600);
  await p.evaluate(() => location.hash = "#/dosen"); await sl(1000);
  ok((await p.$$eval(".dsn-t tbody tr", r => r.length)) === 1, "laporan tersimpan setelah muat ulang (sesi masih terbuka)");

  /* 5. data contoh */
  await p.click('[data-dsn="demo"]'); await sl(700);
  ok(await p.$(".dsn-demo") && (await p.$$eval(".dsn-t tbody tr", r => r.length)) === 24, "data contoh: 24 peserta dengan pita");
  ok((await p.$$eval(".dsn-kpi", r => r.length)) === 5, "5 kartu KPI");
  ok((await p.$$eval(".dsn-bb", r => r.length)) === 3 && await p.$(".dsn-bt em"), "grafik 3 bab dengan garis batas lulus");
  ok(await p.$(".dsn-si.sus"), "ada soal ditandai mencurigakan");
  await p.click('[data-f="stuck"]'); await sl(200);
  ok((await p.$$eval(".dsn-t tbody tr", r => r.length)) === 6, "saring 'perlu dibantu' = 6");
  await p.click('[data-f="semua"]'); await p.fill("#dsn-q", "ayu"); await sl(200);
  ok((await p.$$eval(".dsn-t tbody tr", r => r.length)) === 2, "cari 'ayu' = Ayu Lestari, Putri Ayuningtyas");
  await p.fill("#dsn-q", "zzz"); await sl(150);
  ok(/Tidak ada peserta yang cocok/.test(await p.textContent(".dsn-t tbody")), "pencarian kosong: pesan");
  await p.fill("#dsn-q", "");
  if (W > 760) { await p.click('[data-sort="pct"]'); await sl(150); const pc = await p.$$eval(".dsn-t tbody tr .dsn-pv", r => r.map(x => parseInt(x.textContent))); ok(pc.every((v, i) => !i || pc[i - 1] >= v), "urut progres menurun");
    ok(await p.$eval('[data-sort="pct"]', b => b.parentNode.getAttribute("aria-sort")) === "descending", "aria-sort"); }
  await p.focus('[data-f="semua"]'); await p.keyboard.press("ArrowRight"); await sl(150);
  ok(await p.$eval('[data-f="selesai"]', b => b.getAttribute("aria-checked")) === "true", "saringan bisa dengan panah keyboard");
  await p.click('[data-f="semua"]');
  /* detail */
  await p.click('.dsn-stk .dsn-who'); await sl(400);
  ok(await p.$eval("#dsn-dlg", d => d.open) && /Kenapa perlu dibantu/.test(await p.textContent("#dsn-dlg")) && /Riwayat percobaan/.test(await p.textContent("#dsn-dlg")), "detail peserta: alasan, riwayat, skor per bab");
  ok(await p.evaluate(() => document.activeElement && document.activeElement.classList.contains("dsn-x")), "fokus pindah ke tombol tutup");
  await p.keyboard.press("Escape"); await sl(300);
  ok(!(await p.$eval("#dsn-dlg", d => d.open)), "Escape menutup detail");
  /* CSV */
  for (const [k, rows] of [["progres", 25], ["stuck", 7], ["soal", null]]) {
    const [d] = await Promise.all([p.waitForEvent("download"), p.click(`[data-csv="${k}"]`)]);
    const t = fs.readFileSync(await d.path(), "utf8"), L = t.split("\r\n");
    ok(t.charCodeAt(0) === 0xfeff && (rows == null ? L.length === 49 : L.length === rows) && /CONTOH/.test(d.suggestedFilename()), `CSV ${k}: ${L.length} baris, ${d.suggestedFilename()}`);
  }
  await hs("dashboard data contoh");
  await p.click('[data-dsn="demo-off"]'); await sl(400);
  ok((await p.$$eval(".dsn-t tbody tr", r => r.length)) === 1, "kembali ke data asli: data contoh tidak tercampur");
  /* kunci */
  await p.click('[data-dsn="lock"]'); await sl(400);
  ok(await p.$("#dsn-gate") && !(await p.$(".dsn-t")), "kunci dashboard: kembali ke gerbang");
  ok(!errs.length, "tanpa error console: " + errs.join(" | "));
  await b.close();
  console.log(`t-dosen-ui (${which} ${W}): ${bad ? bad + " gagal" : "semua lulus"}`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
