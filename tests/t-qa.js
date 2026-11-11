// QA akhir simulasi: semua ending lewat UI, konsistensi nilai di semua tampilan, kondisi ekstrem.
// Pakai: node t-qa.js [chrome|webkit]
const { chromium, webkit } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8000/index.html";
const which = process.argv[2] || "chrome";
const sl = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const tag = `[qa ${which}]`;
const ok = (c, m) => { console.log(tag, c ? "ok:" : "GAGAL:", m); if (!c) fails++ };
const r1 = n => Math.round(n * 10) / 10;
// rumus ditulis ulang secara independen (bukan memakai GLS) untuk memeriksa angka
const pita = v => { const x = r1(v); return x >= 86 ? 0 : x >= 71 ? 1 : x >= 56 ? 2 : 3 };
const kat = (a, pg) => { let k = r1(a) >= 86 ? 0 : r1(a) >= 71 ? 1 : r1(a) >= 56 ? 2 : 3; if (pg < 70 && k < 2) k = 2; return k };

(async () => {
  const browser = await (which === "webkit" ? webkit : chromium).launch(which === "chrome" ? { channel: "chrome" } : {});
  const mk = async (o = {}) => {
    const ctx = await browser.newContext({ viewport: { width: o.w || 1280, height: 820 } });
    await ctx.addInitScript(() => { try { if (!localStorage.getItem("mer-done")) localStorage.setItem("mer-done", JSON.stringify(["0-0","0-1","0-2","0-3","0-4","1-0","1-1","1-2","1-3","1-4","2-0","2-1","2-2","2-3","2-4"])) } catch (e) {} });   // semua pelajaran selesai: latihan baru terbuka setelah pelajaran bab terkait selesai (t-kunci.js menguji kuncinya)
    await ctx.addInitScript(() => { window.GL_NO_GATE = 1 });   // lewati saran urutan (gamifikasi fase 3)
    if (o.quota) await ctx.addInitScript(() => { const f = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === "gl-latihan") throw new DOMException("penuh", "QuotaExceededError"); return f.call(this, k, v) } });
    if (o.seed) await ctx.addInitScript(s => { if (!sessionStorage.getItem("__s")) { localStorage.setItem("gl-latihan", s); sessionStorage.setItem("__s", "1") } }, JSON.stringify(o.seed));
    const page = await ctx.newPage(); page.errs = [];
    page.on("pageerror", e => page.errs.push("pageerror: " + e.message));
    page.on("console", m => { if (/error|warning/.test(m.type())) { const t = m.text(); if (!/api\/config|api\/me|WebGL|Failed to load resource|GPU stall|GroupMarkerNotSet/i.test(t)) page.errs.push(m.type() + ": " + t) } });
    page.on("response", r => { if (r.status() >= 400 && !/\/api\//.test(r.url())) page.errs.push(r.status() + " " + r.url()) });
    return { ctx, page };
  };
  const go = async (page, hash) => { await page.goto(BASE + "?t=" + Date.now() + hash, { waitUntil: "load" }); await page.waitForFunction(h => !document.getElementById("zpre") && (!/latihan/.test(h) || document.querySelector("#ltp")), hash, { timeout: 15000 }); await sl(500) };
  const store = page => page.evaluate(() => JSON.parse(localStorage.getItem("gl-latihan") || "null"));
  async function playPath(page, cid, ids, opt = {}) {
    await page.click(`.gs-file[data-id="${cid}"]`);
    await page.waitForSelector('[data-sm="go"],[data-sm="restart"]'); await page.click('[data-sm="restart"],[data-sm="go"]');
    for (let k = 0; k < ids.length; k++) {
      await page.waitForSelector(".gv-x"); await page.click(".gv-x"); await page.waitForSelector(".gv-cs.on .gv-c");
      const j = await page.$$eval(".gv-c", (bs, id) => bs.findIndex(b => b.dataset.c === id), ids[k]);
      if (j < 0) throw Error(`pilihan ${ids[k]} tidak terlihat di situasi ${k + 1}`);
      await page.keyboard.press(String(j + 1));
      if (opt.skip !== false && k % 2) { await page.waitForSelector(".gv-skip", { state: "visible", timeout: 3000 }).catch(() => {}); await page.click(".gv-skip", { timeout: 1200 }).catch(() => {}) }
      await page.waitForSelector("#gvnext:not([disabled])", { timeout: 8000 }); await page.$eval("#gvnext", b => b.click());
    }
    await page.waitForSelector(".gv-end", { timeout: 8000 });
  }

  /* 1. setiap ending di setiap kasus, dimainkan lewat UI */
  const seedPG = 82.4;
  let { ctx, page } = await mk({ seed: { v: 2, kuis: { best: { all: { score: seedPG, benar: 28, n: 34, t: 1 } }, hist: [], ptsBest: {} }, dnd: Object.fromEntries(["traps", "stres", "ccc", "ps", "foa", "sign"].map(id => [id, { best: { benar: 1, n: 1, t: 1 }, n: 1 }])), sim: {}, akhir: { last: null, hist: [] } } });
  await go(page, "#/latihan/sim");
  const plan = await page.evaluate(() => GLD.SIM.filter(GLS.eng.playable).map(c => { const E = GLS.eng, out = {};
    const walk = st => { if (E.done(st)) { const e = E.ending(c, st); if (!out[e.id]) out[e.id] = { ids: st.ids, score: GLS.score.aspek(st.scores), type: e.type }; return } E.choices(c, st).forEach(ch => walk(E.choose(c, st, ch.id).st)) };
    walk(E.start(c)); return { cid: c.id, n: c.endings.length, ends: out } }));
  const best = {};
  for (const p of plan) {
    ok(Object.keys(p.ends).length === p.n, `${p.cid}: ${p.n} ending punya jalur (${Object.keys(p.ends).join(", ")})`);
    for (const [eid, e] of Object.entries(p.ends)) {
      await playPath(page, p.cid, e.ids);
      const cls = await page.$eval(".gv-end", el => el.className), d = await store(page);
      ok(cls.includes("t-" + e.type) && d.sim[p.cid].last.ending === eid && d.sim[p.cid].last.score === r1(e.score), `${p.cid} ending "${eid}" (${e.type}) via UI, skor ${r1(e.score)}`);
      best[p.cid] = Math.max(best[p.cid] || 0, r1(e.score));
      await page.$eval('.gv-end [data-sm="home"]', b => b.click()); await page.waitForSelector(".gs-file");
    }
    const card = await page.textContent(`.gs-file[data-id="${p.cid}"]`);
    ok(card.includes(`Terbaik ${String(best[p.cid]).replace(".", ",")}`) && card.includes(`${p.n} dari ${p.n} akhir cerita`), `${p.cid}: kartu menampilkan skor terbaik ${best[p.cid]} dan ending ${p.n}/${p.n}`);
  }
  /* 2. konsistensi Nilai Simulasi & Nilai Akhir di semua tampilan */
  const W = { s1: .35, s2: .35, s3: .30 }, sim = Object.entries(best).reduce((t, [k, v]) => t + v * W[k], 0), akhir = seedPG * .3 + sim * .7;
  const H = await page.evaluate(() => GLX.hitung());
  ok(Math.abs(H.sim - sim) < 1e-9 && Math.abs(H.akhir - akhir) < 1e-9 && H.ki === kat(akhir, seedPG), `hitung(): simulasi ${r1(sim)}, akhir ${r1(akhir)}, kategori ${H.ki}`);
  const panel = await page.evaluate(() => ({ big: +document.querySelector("#nilai .lx-big").dataset.cu, sim: +document.querySelectorAll("#nilai .nl-c b[data-cu]")[1].dataset.cu, rows: [...document.querySelectorAll("#nilai .nl-t tbody tr")].map(r => r.children[2].textContent), kat: document.querySelector("#nilai .badge").textContent }));
  ok(Math.abs(panel.big - akhir) < 1e-9 && Math.abs(panel.sim - sim) < 1e-9, "panel Nilai Akhir: angka sama dengan rumus");
  ok(panel.rows.join("|") === ["s1", "s2", "s3"].map(k => String(best[k]).replace(".", ",")).join("|"), "tabel aspek = skor terbaik tiap kasus " + panel.rows.join(" / "));
  const katName = await page.evaluate(k => GLD.KATEGORI[k][0], kat(akhir, seedPG)); ok(panel.kat === katName, "kategori: " + panel.kat);
  // kartu cetak
  const cetak = await page.evaluate(() => { window.print = () => {}; document.querySelector('#nilai [data-n="print"]').click(); const t = document.querySelector("#cetak").innerText; document.querySelector("#cetak").remove(); return t });
  ok(cetak.includes(String(r1(akhir)).replace(".", ",")) && cetak.includes(String(r1(sim)).replace(".", ",")), "kartu cetak memuat nilai akhir & simulasi yang sama");
  // beranda
  /* 2026-11-06: kartu "Lanjutkan belajar" (yang dulu menampilkan nilai akhir di beranda) diganti video promo, jadi beranda tidak lagi dicek */
  // pita batas
  ok([pita(55.4), pita(55.5), pita(70.9), pita(85.96)].join() === "3,3,2,0", "pita rubrik independen sesuai brief");
  ok(page.errs.length === 0, "console bersih (semua ending)" + (page.errs.length ? ": " + page.errs.slice(0, 4).join(" | ") : ""));
  await ctx.close();

  /* 3. klik beruntun & Lewati di tengah animasi */
  ({ ctx, page } = await mk()); await go(page, "#/latihan/sim");
  await page.click('.gs-file[data-id="s2"]'); await page.click('[data-sm="go"]');
  for (let k = 0; k < 3; k++) {
    await page.waitForSelector(".gv-x"); await page.click(".gv-x"); await page.waitForSelector(".gv-cs.on .gv-c");
    await page.evaluate(() => { const b = [...document.querySelectorAll(".gv-c")]; b[0].click(); b[1].click(); b[0].click(); for (let i = 0; i < 6; i++) { document.querySelector(".gv-skip")?.click(); document.querySelector("#gvnext")?.click(); document.body.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true })) } });
    await sl(300);
  }
  await page.waitForSelector(".gv-x");
  const st = await page.evaluate(() => GLSV.state());
  ok(st.cur.length >= 1 && st.cur.length <= 3 && st.ids.length - st.cur.length <= 1, `klik beruntun: maju ${st.cur.length} situasi, ${st.ids.length} pilihan terkunci, tanpa lompatan ganda`);
  const d3 = await store(page); ok(d3.sim.s2.run.ids.join() === st.ids.join(), "pilihan tersimpan = pilihan di layar");
  /* 4. ubah ukuran layar di tengah permainan */
  for (const w of [360, 1280, 768, 360]) { await page.setViewportSize({ width: w, height: 760 }); await sl(250); const ok1 = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); ok(ok1, `ubah ukuran ke ${w}px tanpa scroll horizontal`) }
  /* 5. pindah tab browser saat animasi */
  await page.waitForSelector("#gvnext:not([disabled]), .gv-x");
  if (await page.$("#gvnext:not([disabled])")) await page.$eval("#gvnext", b => b.click());
  await page.waitForSelector(".gv-x"); await page.click(".gv-x"); await page.waitForSelector(".gv-cs.on .gv-c"); await page.keyboard.press("1");
  const other = await ctx.newPage(); await other.goto("about:blank"); await other.bringToFront(); await sl(1500); await page.bringToFront(); await other.close();
  await page.waitForSelector("#gvnext:not([disabled])", { timeout: 8000 }); ok(true, "kembali dari tab lain → animasi selesai, tombol Lanjut aktif");
  /* 6. berpindah antar kasus di tengah permainan */
  await page.click('[data-sm="quit"]'); await page.waitForSelector(".gs-file");
  const n2 = (await store(page)).sim.s2.run.ids.length;
  await page.click('.gs-file[data-id="s3"]'); await page.click('[data-sm="go"]'); await page.waitForSelector(".gv-x"); await page.click(".gv-x"); await page.waitForSelector(".gv-cs.on .gv-c"); await page.keyboard.press("2");
  await page.waitForFunction(() => GLSV.state().ids.length === 1); await page.click('[data-sm="quit"]'); await page.waitForSelector(".gs-file");
  const t2 = await page.textContent('.gs-file[data-id="s2"]'), t3 = await page.textContent('.gs-file[data-id="s3"]');
  ok(t2.includes(`situasi ${n2 + 1} dari 5`) && t3.includes("situasi 2 dari 5"), `progres per kasus terpisah (s2 situasi ${n2 + 1}, s3 situasi 2)`);
  ok(await page.evaluate(() => GLSV.fxSize() === 0), "tidak ada timer tersisa di daftar kasus");
  ok(page.errs.length === 0, "console bersih (kondisi ekstrem)" + (page.errs.length ? ": " + page.errs.slice(0, 4).join(" | ") : ""));
  await ctx.close();

  /* 7. penyimpanan penuh (QuotaExceeded) */
  ({ ctx, page } = await mk({ quota: true })); await go(page, "#/latihan/sim");
  const ids = await page.evaluate(() => GLS.eng.auto(GLS.eng.kasus("s1"), "best").ids);
  await playPath(page, "s1", ids);
  ok(await page.evaluate(() => GLX.hitung().asp[0].v > 90), "penyimpanan penuh → skor tetap dipakai (memori) tanpa error");
  ok(page.errs.length === 0, "console bersih (penyimpanan penuh)" + (page.errs.length ? ": " + page.errs.join(" | ") : ""));
  await ctx.close();

  /* 8. aksesibilitas dasar: fokus terlihat & urutan tab */
  ({ ctx, page } = await mk()); await go(page, "#/latihan/sim");
  await page.click('.gs-file[data-id="s1"]'); await page.click('[data-sm="go"]'); await page.waitForSelector(".gv-x"); await page.click(".gv-x"); await page.waitForSelector(".gv-cs.on .gv-c");
  await page.focus(".gv-c"); await page.keyboard.press("Tab");
  const foc = await page.evaluate(() => { const a = document.activeElement; return { cls: a.className, outline: getComputedStyle(a).outlineStyle, label: a.textContent.trim().slice(0, 20) } });
  ok(/gv-c/.test(foc.cls) && foc.outline !== "none", "Tab berpindah ke pilihan berikutnya dengan fokus terlihat");
  const unl = await page.evaluate(() => [...document.querySelectorAll("#ltp button")].filter(b => !b.textContent.trim() && !b.getAttribute("aria-label")).length);
  ok(unl === 0, "semua tombol simulasi punya label");
  await ctx.close();
  console.log(tag, fails ? `SELESAI dengan ${fails} kegagalan` : "SEMUA LOLOS");
  await browser.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(tag, "CRASH", e); process.exit(2) });
