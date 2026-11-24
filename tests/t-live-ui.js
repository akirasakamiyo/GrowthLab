// Tes ujung ke ujung data live: peserta (opt-in di Pengaturan) -> tiruan Apps Script (Code.gs asli) -> dashboard dosen.
// Jaringan ke Apps Script dicegat Playwright dan dijalankan oleh tests/gas-mock.js, jadi tidak perlu deploy.
// Jalankan (server: node tests/serve.js): node tests/t-live-ui.js [chrome|webkit] [lebar]
const { chromium, webkit } = require("playwright");
const crypto = require("crypto"), gas = require("./gas-mock.js");
const BASE = process.env.BASE || "http://localhost:8000/index.html", URL = "https://script.google.com/macros/s/UJI/exec";
const which = process.argv[2] || "chrome", W = +(process.argv[3] || 1280);
const sl = ms => new Promise(r => setTimeout(r, ms));
const KODE = "kode-uji-live-456", sha = s => crypto.createHash("sha256").update(s).digest("hex");
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("✕", m) } };
(async () => {
  const G = gas({ KELAS: "TP8-2026", DOSEN_HASH: sha(KODE) });
  const b = await (which === "webkit" ? webkit : chromium).launch(which === "chrome" ? { channel: "chrome" } : {});
  const errs = [];
  const mk = async () => {
    const c = await b.newContext({ viewport: { width: W, height: 860 } });
    await c.addInitScript(u => { window.GLSYNC_URL_TEST = u }, URL);
    await c.route(URL, async rt => { const req = rt.request(); if (req.method() !== "POST") return rt.fulfill({ status: 200, body: "{}" });
      rt.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(G.call(req.postData() || "")) }) });
    const p = await c.newPage();
    p.on("pageerror", e => errs.push("pageerror " + e.message));
    p.on("console", m => { if (/error|warning/.test(m.type())) { const t = m.text(); if (!/api\/config|api\/me|WebGL|Failed to load resource|GPU stall|GroupMarkerNotSet|ERR_INTERNET_DISCONNECTED/i.test(t)) errs.push(m.type() + " " + t) } });
    return [c, p];
  };
  const ready = p => p.waitForFunction(() => !document.getElementById("zpre"), null, { timeout: 15000 });

  /* ---------- peserta ---------- */
  const [cP, P] = await mk();
  await P.goto(BASE + "?t=" + Date.now() + "#/pengaturan", { waitUntil: "load" });
  await P.evaluate(() => { localStorage.clear(); localStorage.setItem("mer-done", JSON.stringify(["0-0", "0-1"])) }); await P.reload({ waitUntil: "load" }); await ready(P); await sl(1500);
  ok(await P.$("#st-sync-w"), "sakelar kirim otomatis tampil bila URL terpasang");
  ok(/Mati/.test(await P.textContent("#st-sync-s")), "awal: mati (opt-in)");
  await sl(2500);
  ok(G.rows.length === 0, "tidak ada data terkirim sebelum peserta menyalakan");
  await P.click('[data-p="sync"]'); await sl(300);
  ok(/namamu/.test(await P.textContent("#st-sync-s")) && await P.getAttribute('[data-p="sync"]', "aria-checked") === "false", "tanpa nama: sakelar kembali mati");
  await P.fill("#st-nm", "Sari Peserta"); await P.click("#st-form button[type=submit]"); await sl(300);
  await P.click('[data-p="sync"]'); await sl(300);
  ok(/kode kelas/.test(await P.textContent("#st-sync-s")) && await P.getAttribute('[data-p="sync"]', "aria-checked") === "false", "tanpa kode kelas: sakelar kembali mati");
  await P.fill("#st-kls", "salah"); await P.click('[data-p="sync"]'); await sl(1200);
  ok(/tidak dikenali/.test(await P.textContent("#st-sync-s")), "kode kelas salah: pesan dari server");
  await P.fill("#st-kls", "tp8-2026"); await P.dispatchEvent("#st-kls", "change"); await sl(1200);
  ok(/Terakhir terkirim/.test(await P.textContent("#st-sync-s")), "kode benar: terkirim");
  ok(G.rows.some(r => r[5] === "snapshot") && G.rows.some(r => r[5] === "aktif") && G.rows.every((r, i) => !i || r[3] === "Sari Peserta"), "snapshot pelajaran + aktif terkirim dengan nama");
  /* kuis lewat bus event (perekaman jawaban per soal sudah diuji di t-dosen-ui) */
  const quiz = () => P.evaluate(() => GLG.emit("quiz", { m: "b0", score: 40, benar: 2, n: 5, ans: [[0, 0, 1], [1, 0, 0], [2, 3, 0], [3, 1, 0], [4, 2, 1]].map(([q, k, o]) => [GLD.QUIZ.indexOf(GLD.QUIZ.filter(x => x.b === 0)[q]), k, o]) }));
  await quiz(); await sl(2500);
  ok(G.rows.filter(r => r[5] === "quiz").length === 1, "kuis terkirim otomatis");
  /* offline: diantre, lalu terkirim saat online */
  await cP.setOffline(true); await quiz(); await sl(2500);
  ok(G.rows.filter(r => r[5] === "quiz").length === 1 && /internet/.test(await P.textContent("#st-sync-s")), "offline: belum terkirim, pesan jelas");
  await cP.setOffline(false); await P.evaluate(() => dispatchEvent(new Event("online"))); await sl(1800);
  ok(G.rows.filter(r => r[5] === "quiz").length === 2, "kembali online: antrean terkirim");
  await P.reload({ waitUntil: "load" }); await ready(P); await sl(5000);
  ok(G.rows.filter(r => r[5] === "quiz").length === 2, "muat ulang tidak mengirim ulang event lama");
  await P.click('[data-p="sync"]'); await sl(300); await quiz(); await sl(2500);
  ok(G.rows.filter(r => r[5] === "quiz").length === 2 && /Mati/.test(await P.textContent("#st-sync-s")), "dimatikan: berhenti mengirim");

  /* ---------- dosen ---------- */
  const [, D] = await mk();
  await D.goto(BASE + "?t=" + Date.now() + "#/", { waitUntil: "load" }); await ready(D); await sl(800);
  await D.evaluate(h => { GLDOSEN.AKSES.push({ label: "tes", hash: h }); location.hash = "#/dosen" }, sha(KODE)); await sl(1200);
  await D.fill("#dsn-code", KODE); await D.click("#dsn-gate button"); await sl(1500);
  ok(/Data live diperbarui/.test(await D.textContent("#dsn-msg")), "dashboard mengambil data live otomatis");
  ok(/Sari Peserta/.test(await D.textContent(".dsn-t tbody")) && (await D.$$eval(".dsn-t tbody tr", r => r.length)) === 1, "peserta live muncul tanpa impor");
  ok(/2\/15/.test(await D.textContent(".dsn-t tbody")), "pelajaran selesai dari snapshot");
  ok(await D.$$eval(".dsn-si", r => r.length) === 5, "analisis soal dari jawaban live");
  await D.click('[data-dsn="lock"]'); await sl(300);
  G.props.DOSEN_HASH = sha("kode-lain");
  await D.fill("#dsn-code", KODE); await D.click("#dsn-gate button"); await sl(1500);
  ok(/menolak kode/.test(await D.textContent("#dsn-msg")) && !(await D.$(".dsn-t")), "server menolak kode: tidak ada data, pesan jelas");
  ok(!errs.length, "tanpa error console: " + errs.join(" | "));
  await b.close();
  console.log(`t-live-ui (${which} ${W}): ${bad ? bad + " gagal" : "semua lulus"}`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1) });
