// Tes E2E simulasi v8. Pakai: node t-sim.js [chrome|webkit] [lebar] [reduce]
const { chromium, webkit } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8000/index.html";
const [, , which = "chrome", W = "1280", rm = ""] = process.argv;
const sl = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const tag = `[sim ${which} ${W}${rm ? " reduce" : ""}]`;
const ok = (c, m) => { console.log(tag, c ? "ok:" : "GAGAL:", m); if (!c) fails++ };
const V1 = { v: 1, kuis: { best: { all: { score: 88.2, benar: 30, n: 34, t: 1 } }, hist: [] }, dnd: {}, sim: { s1: { best: { score: 38.3, level: "Perlu Bimbingan", path: [20, 15, 80], t: 1 } }, s2: { best: { score: 43.8, path: [55, 25, 45, 50], t: 1 } }, s3: { best: { score: 55, path: [15, 65, 60, 80], t: 1 } } }, akhir: { last: null, hist: [] } };

(async () => {
  const bt = which === "webkit" ? webkit : chromium;
  const browser = await bt.launch(which === "chrome" ? { channel: "chrome" } : {});
  const mk = async (opt = {}) => {
    const ctx = await browser.newContext({ viewport: { width: +W, height: 820 }, reducedMotion: rm ? "reduce" : "no-preference", hasTouch: +W < 600 });
    await ctx.addInitScript(() => { window.GL_NO_GATE = 1 });   // lewati saran urutan (gamifikasi fase 3)
    if (opt.block) await ctx.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError") } }) });
    if (opt.seed !== undefined) await ctx.addInitScript(s => { if (!sessionStorage.getItem("__seeded")) { localStorage.setItem("gl-latihan", s); sessionStorage.setItem("__seeded", "1") } }, typeof opt.seed === "string" ? opt.seed : JSON.stringify(opt.seed));
    const page = await ctx.newPage(); page.errs = [];
    page.on("pageerror", e => page.errs.push("pageerror: " + e.message));
    page.on("console", m => { if (/error|warning/.test(m.type())) { const t = m.text(); if (!/api\/config|api\/me|WebGL|Failed to load resource|GPU stall|GroupMarkerNotSet/i.test(t)) page.errs.push(m.type() + ": " + t) } });
    page.on("response", r => { if (r.status() === 404 && !/api\//.test(r.url())) page.errs.push("404 " + r.url()) });
    return { ctx, page };
  };
  const go = async (page, hash, q = "") => { await page.goto(BASE + "?t=" + Date.now() + q + hash, { waitUntil: "load" }); await page.waitForFunction(h => !document.getElementById("zpre") && (!/latihan/.test(h) || document.querySelector("#ltp")), hash, { timeout: 15000 }); await sl(600) };
  const store = page => page.evaluate(() => { try { return JSON.parse(localStorage.getItem("gl-latihan")) } catch (e) { return "ERR" } });
  // mainkan satu situasi: mode best|worst|mid|idx
  async function playOne(page, mode, how = "click") {
    await page.waitForSelector(".gv-x", { timeout: 8000 });
    await page.click(".gv-x"); // percepat mesin tik
    await page.waitForSelector(".gv-cs.on .gv-c", { timeout: 8000 });
    const pick = await page.evaluate(mode => { const bs = [...document.querySelectorAll(".gv-c")]; const st = GLSV.state(), c = GLS.eng.kasus(st.cid), node = GLS.eng.replay(c, st.cur).node, ch = c.nodes[node].c;
      const sc = bs.map(b => ch.find(x => x.id === b.dataset.c).s); let j = mode === "best" ? sc.indexOf(Math.max(...sc)) : mode === "worst" ? sc.indexOf(Math.min(...sc)) : typeof mode === "number" ? mode : 1; return { j, id: bs[j].dataset.c, s: sc[j] } }, mode);
    if (how === "key") await page.keyboard.press(String(pick.j + 1));
    else if (how === "dbl") await page.dblclick(`.gv-c[data-c="${pick.id}"]`);
    else await page.click(`.gv-c[data-c="${pick.id}"]`);
    return pick;
  }
  async function finishOne(page, skip) {
    if (skip) { await page.waitForSelector(".gv-skip", { state: "visible", timeout: 3000 }).catch(() => {}); await page.click(".gv-skip", { timeout: 1200 }).catch(() => {}) }
    await page.waitForSelector("#gvnext:not([disabled])", { timeout: 8000 });
    await page.$eval("#gvnext", b => b.click());
  }

  /* A. data kosong: daftar kasus */
  let { ctx, page } = await mk();
  await go(page, "#/latihan/sim");
  await page.evaluate(() => localStorage.clear()); await go(page, "#/latihan/sim");
  const cards = await page.$$eval(".gs-file", e => e.map(x => x.textContent.replace(/\s+/g, " ")));
  const soon = await page.evaluate(() => GLD.SIM.map(c => !!c.soon));
  ok(cards.length === 3 && cards.every((t, i) => soon[i] ? /Segera hadir/.test(t) : /Situasi 0\/5/.test(t)), "kartu awal: Situasi 0/5 (atau segera hadir)");
  const sw = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); ok(sw, "tanpa scroll horizontal (daftar kasus)");
  const soonId = await page.evaluate(() => (GLD.SIM.find(c => c.soon) || {}).id);
  if (soonId) { await page.click(`.gs-file[data-id="${soonId}"]`, { force: true }); await sl(300); ok(!(await page.$(".gs-title")), "kasus segera hadir tidak bisa dibuka") }
  /* B0. setiap kasus yang bisa dimainkan: jalur terbaik sampai tamat → ending win, skor tersimpan */
  for (const cid of await page.evaluate(() => GLD.SIM.filter(c => !c.soon).map(c => c.id).filter(id => id !== "s1"))) {
    await page.click(`.gs-file[data-id="${cid}"]`); await page.waitForSelector('[data-sm="go"]'); await page.click('[data-sm="go"]');
    const pk = []; for (let k = 1; k <= 5; k++) { pk.push(await playOne(page, "best", k % 2 ? "key" : "click")); await finishOne(page, k % 2 === 0) }
    await page.waitForSelector(".gv-end"); const dd = await store(page), ex = Math.round(pk.reduce((a, b) => a + b.s, 0) / 5 * 10) / 10;
    ok(dd.sim[cid].best.score === ex && !!(await page.$(".gv-end.t-win")), `${cid}: jalur terbaik ${pk.map(p => p.s).join("+")} → ${ex}, ending berhasil`);
    await page.$eval('.gv-end [data-sm="home"]', b => b.click()); await page.waitForSelector(".gs-file");
  }
  /* B. main penuh Kasus 1 (jalur terbaik), campuran klik/keyboard/lewati */
  await page.click('.gs-file[data-id="s1"]'); await page.waitForSelector('[data-sm="go"]'); await page.click('[data-sm="go"]');
  const picks = [];
  for (let k = 1; k <= 5; k++) {
    const sn = await page.textContent(".gv-sn"); ok(sn.includes(`Situasi ${k}/5`), `penghitung ${sn.trim()}`);
    picks.push(await playOne(page, "best", k % 2 ? "click" : "key"));
    if (k === 1) { const sw2 = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); ok(sw2, "tanpa scroll horizontal (situasi)") }
    await finishOne(page, k === 3);
  }
  await page.waitForSelector(".gv-end", { timeout: 8000 });
  const exp = Math.round(picks.reduce((a, b) => a + b.s, 0) / 5 * 10) / 10;
  let d = await store(page);
  ok(d.v === 2 && d.sim.s1.best.score === exp && !d.sim.s1.run, `skor aspek tersimpan ${d.sim.s1.best.score} = rata-rata ${picks.map(p => p.s).join("+")}/5`);
  ok(await page.$(".gv-end.t-win"), "jalur terbaik → ending Berhasil");
  await sl(rm ? 100 : 1700);
  ok((await page.textContent("#gvbig")).replace(",", ".") == String(exp), "skor di layar hasil = skor tersimpan");
  ok((await page.$$(".gv-trail li")).length === 5, "ringkasan jalur berisi 5 situasi + feedback");
  const sw3 = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); ok(sw3, "tanpa scroll horizontal (hasil)");
  await page.$eval('.gv-end [data-sm="home"]', b => b.click()); await page.waitForSelector(".gs-file");
  ok(/Selesai · ending 1\/\d/.test(await page.textContent('.gs-file[data-id="s1"]')) && /Terbaik/.test(await page.textContent('.gs-file[data-id="s1"]')), "kartu berubah: skor terbaik + ending ditemukan");

  /* C. refresh di tengah permainan → lanjutkan, pilihan tidak berubah */
  await page.click('.gs-file[data-id="s1"]'); await page.click('[data-sm="restart"],[data-sm="go"]');
  const p1 = await playOne(page, "worst"); await finishOne(page, true); const p2 = await playOne(page, 2);
  await page.waitForFunction(() => GLSV.state().ids.length === 2);
  await go(page, "#/latihan/sim");
  ok(/Situasi 3\/5/.test(await page.textContent('.gs-file[data-id="s1"]')), "setelah refresh kartu menunjukkan Situasi 3/5 sedang berjalan");
  await page.click('.gs-file[data-id="s1"]'); await page.waitForSelector('[data-sm="resume"]');
  await page.click('[data-sm="resume"]'); await page.waitForSelector(".gv-x");
  ok((await page.evaluate(() => GLSV.state().ids)).join() === [p1.id, p2.id].join(), "melanjutkan dengan 2 pilihan yang sama (terkunci)");
  ok((await page.textContent(".gv-sn")).includes("Situasi 3/5"), "lanjut di situasi 3");

  /* D. klik ganda cepat hanya mencatat satu pilihan */
  await playOne(page, 0, "dbl"); await sl(200);
  ok((await page.evaluate(() => GLSV.state().ids.length)) === 3, "klik ganda → tepat satu pilihan tercatat");
  /* E. Back/Forward di tengah animasi */
  await page.evaluate(() => { location.hash = "#/course" }); await sl(900);   // pindah halaman di tengah animasi
  ok(await page.evaluate(() => GLSV.fxSize() === 0), "keluar halaman → timer/animasi simulasi dibersihkan");
  await page.evaluate(() => history.back()); await sl(1400);                   // Back → kembali ke simulasi
  await page.waitForSelector("#gvnext:not([disabled]), .gv-x", { timeout: 8000 });
  ok((await page.evaluate(() => GLSV.state().ids.length)) === 3, "Back → state permainan utuh");
  await page.evaluate(() => history.forward()); await sl(900); await page.evaluate(() => history.back()); await sl(1400);
  await page.waitForSelector("#gvnext:not([disabled]), .gv-x", { timeout: 8000 });
  ok((await page.evaluate(() => GLSV.state().ids.length)) === 3, "Forward lalu Back → state tetap utuh");
  if (await page.$("#gvnext:not([disabled])")) await page.$eval("#gvnext", b => b.click());
  await playOne(page, "mid"); await finishOne(page, true); await playOne(page, "mid"); await finishOne(page, false);
  await page.waitForSelector(".gv-end"); ok(true, "permainan yang dilanjutkan bisa ditamatkan");
  d = await store(page); ok(d.sim.s1.best.score === exp, `skor terbaik tetap yang tertinggi (${d.sim.s1.best.score})`);
  ok(page.errs.length === 0, "console bersih (alur utama)" + (page.errs.length ? ": " + page.errs.slice(0, 4).join(" | ") : ""));
  await ctx.close();

  /* F. data lama v1 → migrasi, Nilai Akhir tetap dihitung, skor lama diganti */
  ({ ctx, page } = await mk({ seed: V1 }));
  await go(page, "#/latihan/sim");
  ok(/versi lama/.test(await page.textContent('.gs-file[data-id="s1"]')), "skor v1 ditampilkan sebagai versi lama");
  const H = await page.evaluate(() => { const h = GLX.hitung(); return [h.pg, h.sim, h.akhir] });
  ok(Math.abs(H[1] - (38.3 * .35 + 43.8 * .35 + 55 * .3)) < 1e-9 && Math.abs(H[2] - (88.2 * .3 + H[1] * .7)) < 1e-9, `Nilai Akhir dari data lama ${H.map(v => Math.round(v * 100) / 100).join(" / ")}`);
  ok(await page.evaluate(() => !!document.querySelector("#nilai .nl-lock") && !document.querySelector("#nilai .lx-big")), "drag & drop belum dikerjakan → nilai akhir masih terkunci");
  await page.click('.gs-file[data-id="s1"]'); await page.click('[data-sm="go"]');
  for (let k = 0; k < 5; k++) { await playOne(page, "worst"); await finishOne(page, true) }
  await page.waitForSelector(".gv-end.t-fail"); ok(true, "jalur terburuk → ending gagal (layar redup)");
  d = await store(page); ok(d.sim.s1.best.score < 38.3 && !d.sim.s1.best.legacy, `skor versi lama diganti hasil baru (${d.sim.s1.best.score})`);
  ok(page.errs.length === 0, "console bersih (data lama)" + (page.errs.length ? ": " + page.errs.join(" | ") : ""));
  await ctx.close();

  /* G. penyimpanan rusak */
  ({ ctx, page } = await mk({ seed: "{rusak" })); await go(page, "#/latihan/sim");
  ok((await page.$$(".gs-file")).length === 3 && page.errs.length === 0, "data rusak → halaman tetap jalan tanpa error");
  await go(page, "#/"); ok(page.errs.length === 0, "beranda tetap jalan dengan data rusak");
  await ctx.close();

  /* H. penyimpanan diblokir (Safari privat) */
  ({ ctx, page } = await mk({ block: true })); await go(page, "#/latihan/sim");
  ok(/Penyimpanan browser tidak tersedia/.test(await page.textContent(".gs-note")), "pemberitahuan penyimpanan tidak tersedia");
  await page.click('.gs-file[data-id="s1"]'); await page.click('[data-sm="go"]');
  for (let k = 0; k < 5; k++) { await playOne(page, "best"); await finishOne(page, true) }
  await page.waitForSelector(".gv-end");
  ok(await page.evaluate(() => { const r = document.querySelector('#nilai').textContent; return /Simulasi\s*1\/3/.test(r) && GLX.hitung().asp[0].v > 80 }), "skor tetap terbaca (memori) di Nilai Akhir");
  ok(page.errs.length === 0, "console bersih (penyimpanan diblokir)" + (page.errs.length ? ": " + page.errs.join(" | ") : ""));
  await ctx.close();

  /* I. mode debug: validator + tes + uji ending */
  ({ ctx, page } = await mk()); await go(page, "#/latihan/sim", "&debug=1");
  const dbg = await page.textContent(".gv-dbg summary");
  ok(/validator ✓/.test(dbg) && /tes (\d+)\/\1/.test(dbg), "debug: " + dbg.trim());
  for (const m of ["best", "mid", "worst"]) {
    await page.click(`[data-sm="dbg"][data-id="s1"][data-m="${m}"]`); await page.waitForSelector(".gv-end");
    const t = await page.$eval(".gv-end", e => e.className); ok(true, `uji ending ${m}: ${t}`);
    await page.$eval('.gv-end [data-sm="home"]', b => b.click()); await page.waitForSelector(".gv-dbg");
  }
  ok(page.errs.filter(e => !/^info/.test(e)).length === 0, "console bersih (debug)" + (page.errs.length ? ": " + page.errs.join(" | ") : ""));
  await ctx.close();
  console.log(tag, fails ? `SELESAI dengan ${fails} kegagalan` : "SEMUA LOLOS");
  await browser.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(tag, "CRASH", e); process.exit(2) });
