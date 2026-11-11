// Tes kunci latihan (2026-11-11): kuis, drag & drop, dan simulasi terkunci sampai SEMUA pelajaran bab terkait selesai.
// Aturan: Kuis Bab N -> Bab N; Kuis Gabungan -> ketiga bab; set drag & drop -> bab les[0]; simulasi s1/s2/s3 -> Bab 1/2/3.
// Pakai: BASE=http://localhost:8000/index.html node t-kunci.js [chrome|webkit] [w] [h]
const { chromium, webkit } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8000/index.html";
const [, , which = "chrome", W = "1280", H = "800"] = process.argv;
const sl = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(`[${which} ${W}x${H}]`, ...a);
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; log("GAGAL:", m) } else log("ok:", m) };
const BAB = i => [0, 1, 2, 3, 4].map(j => `${i}-${j}`);

(async () => {
  const bt = which === "webkit" ? webkit : chromium;
  const browser = await bt.launch(which === "chrome" ? { channel: "chrome" } : {});
  const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, hasTouch: +W < 600 });
  await ctx.addInitScript(() => { window.GL_NO_GATE = 1 });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push("pageerror " + e.message));
  p.on("console", m => { if (m.type() === "error") { const t = m.text(); if (!/api\/config|api\/me|Failed to load resource/i.test(t)) errs.push(t) } });

  /* membuka halaman dengan progres tertentu (daftar kunci pelajaran selesai) */
  const open = async (done, hash) => {
    await p.goto(BASE + "?s=" + Date.now() + "#/", { waitUntil: "load" });
    await p.evaluate(d => { localStorage.clear(); if (d.length) localStorage.setItem("mer-done", JSON.stringify(d)) }, done);
    await p.goto(BASE + "?s=" + Date.now() + hash, { waitUntil: "load" });
    await p.waitForFunction(() => !document.getElementById("zpre"), null, { timeout: 15000 }); await sl(1600);
  };
  const n = sel => p.$$eval(sel, e => e.length);
  const hashTo = async h => { await p.evaluate(h => location.hash = h, h); await sl(1500) };

  /* ---------- A. pengguna baru: semuanya terkunci ---------- */
  await open([], "#/latihan/kuis");
  ok(await n(".gq-main.is-lock") === 1 && await n(".gq-row.is-lock") === 3, "A1 kuis: Gabungan dan tiga kuis bab terkunci");
  ok(await n('[data-qz="open"]') === 0, "A2 kuis: tidak ada tombol Main yang bisa diklik");
  ok(/Bab 1/.test(await p.textContent(".gq-row.is-lock")) && /0 dari 5 pelajaran selesai/.test(await p.textContent(".gq-row.is-lock")), "A3 kuis: baris terkunci menyebut bab dan progres pelajaran");
  const go1 = await p.getAttribute(".gq-main.is-lock .lk-go", "href");
  ok(go1 === "#/lesson/0-0", "A4 kuis: tombol Lanjut belajar menuju pelajaran pertama (" + go1 + ")");
  await hashTo("#/latihan/kuis/b0");
  ok(await n("#gqz .gq-lcard") === 0 && /Selesaikan semua pelajaran Bab 1 dulu/.test(await p.textContent("#toast")), "A5 kuis: tautan langsung ke kuis Bab 1 ditolak dengan pesan");
  await hashTo("#/latihan/kuis/all");
  ok(await n("#gqz .gq-lcard") === 0 && /Bab 1, Bab 2, dan Bab 3/.test(await p.textContent("#toast")), "A6 kuis: tautan langsung ke kuis Gabungan ditolak, pesan menyebut ketiga bab");

  await hashTo("#/latihan/dnd");
  ok(await n(".gd-set.is-lock") === 6 && await n(".gd-lockp") === 1 && await n(".gd-card") === 0, "A7 drag & drop: enam level terkunci, papan diganti panel kunci");
  await hashTo("#/latihan/dnd/stres");
  ok(/Bab 2/.test(await p.textContent(".gd-lockp")), "A8 drag & drop: set 'stres' (bab 2) menyebut Bab 2");
  await hashTo("#/latihan/sim");
  ok(await n(".gs-file.is-lock") === 3 && await n('.gs-file [data-sm="open"], [data-sm="open"].gs-file') === 0, "A9 simulasi: tiga kasus terkunci, tidak ada tombol buka");
  await hashTo("#/latihan/sim/s1");
  ok(await n(".gs-title") === 0, "A10 simulasi: tautan langsung ke kasus 1 tidak membuka kasus");

  await hashTo("#/course/1");
  ok(await n(".chap.open .btn.is-lock") >= 1 || await n(".btn.is-lock") >= 1, "A11 halaman bab: tombol Kuis Bab 1 terkunci");
  ok(await p.$$eval('a[href="#/latihan/kuis/b0"]', e => e.length) === 0, "A12 halaman bab: tidak ada tautan aktif ke kuis Bab 1");
  const quest = await p.evaluate(() => GLG.quest().goals.map(g => g.type));
  ok(quest.every(t => t === "lesson" || t === "days"), "A13 misi mingguan hanya yang bisa dikerjakan (" + quest.join(", ") + ")");

  /* ---------- B. 4 dari 5 pelajaran Bab 1 selesai: masih terkunci ---------- */
  await open(BAB(0).slice(0, 4), "#/latihan/kuis");
  ok(await n(".gq-row.is-lock") === 3, "B1 Bab 1 belum tuntas (4 dari 5): kuis Bab 1 tetap terkunci");
  ok(/4 dari 5 pelajaran selesai/.test(await p.textContent(".gq-row.is-lock")), "B2 progres 4 dari 5 ditampilkan");

  /* ---------- C. Bab 1 tuntas ---------- */
  await open(BAB(0), "#/latihan/kuis");
  ok(await n('.gq-row[data-m="b0"]') === 1 && await n(".gq-row.is-lock") === 2 && await n(".gq-main.is-lock") === 1, "C1 kuis: hanya Bab 1 terbuka; Bab 2, Bab 3, Gabungan terkunci");
  await hashTo("#/latihan/kuis/b0");
  ok(await n("#gqz .gq-lcard") === 1, "C2 tautan langsung ke kuis Bab 1 membuka lobi kuis");
  await p.keyboard.press("Escape"); await sl(600);
  await hashTo("#/latihan/kuis/b1");
  ok(await n("#gqz .gq-lcard") === 0 || !(await p.$eval("#gqz", e => e.classList.contains("on"))), "C3 kuis Bab 2 tetap terkunci");
  await hashTo("#/latihan/dnd");
  ok(await n(".gd-set.is-lock") === 2 && await n(".gd-card") > 0, "C4 drag & drop: 4 set Bab 1 terbuka, 2 set (Bab 2 dan Bab 3) terkunci, papan set pertama tampil");
  const lockedIds = await p.$$eval(".gd-set.is-lock", e => e.map(x => x.dataset.id));
  ok(lockedIds.sort().join() === "foa,stres", "C5 drag & drop: yang terkunci adalah 'stres' dan 'foa' (" + lockedIds.join() + ")");
  await hashTo("#/latihan/sim");
  ok(await n(".gs-file.is-lock") === 2 && await n('[data-sm="open"]') === 1, "C6 simulasi: Kasus 1 terbuka, Kasus 2 dan 3 terkunci");

  /* ---------- D. Bab 1 dan Bab 2 tuntas: Gabungan masih terkunci, dan menyebut Bab 3 ---------- */
  await open([...BAB(0), ...BAB(1)], "#/latihan/kuis");
  ok(await n(".gq-main.is-lock") === 1 && /Bab 3/.test(await p.textContent(".gq-main.is-lock")) && !/Bab 1/.test(await p.textContent(".gq-main.is-lock p")), "D1 Gabungan masih terkunci dan hanya menyebut Bab 3");

  /* ---------- E. semua selesai ---------- */
  await open([...BAB(0), ...BAB(1), ...BAB(2)], "#/latihan/kuis");
  ok(await n(".is-lock") === 0 && await n('[data-qz="open"]') === 4, "E1 semua selesai: keempat mode kuis terbuka");
  await hashTo("#/latihan/dnd");
  ok(await n(".gd-set.is-lock") === 0 && await n(".gd-card") > 0, "E2 semua set drag & drop terbuka");
  await hashTo("#/latihan/sim");
  ok(await n(".gs-file.is-lock") === 0 && await n('[data-sm="open"]') === 3, "E3 semua kasus simulasi terbuka");

  ok(errs.length === 0, "tanpa error console" + (errs.length ? ": " + errs.slice(0, 5).join(" | ") : ""));
  log(fails ? `SELESAI dengan ${fails} kegagalan` : "SEMUA LOLOS");
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(`[${which} ${W}x${H}] CRASH`, e); process.exit(2) });
