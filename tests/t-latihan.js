// Tes latihan v7: kuis ala Quizizz, drag & drop, simulasi monokrom, nilai akhir.
// Pakai: BASE=http://localhost:8000/index.html node t-latihan.js [chrome|webkit] [w] [h] [reduce] [full]
const { chromium, webkit } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8000/index.html";
const [, , which = "chrome", W = "1280", H = "800", rm = "", full = ""] = process.argv;
const sl = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(`[${which} ${W}x${H}${rm ? " reduce" : ""}]`, ...a);
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; log("GAGAL:", m) } else log("ok:", m) };

(async () => {
  const bt = which === "webkit" ? webkit : chromium;
  const browser = await bt.launch(which === "chrome" ? { channel: "chrome" } : {});
  const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, reducedMotion: rm ? "reduce" : "no-preference", hasTouch: +W < 600 });
  await ctx.addInitScript(() => { try { if (!localStorage.getItem("mer-done")) localStorage.setItem("mer-done", JSON.stringify(["0-0","0-1","0-2","0-3","0-4","1-0","1-1","1-2","1-3","1-4","2-0","2-1","2-2","2-3","2-4"])) } catch (e) {} });   // semua pelajaran selesai: latihan baru terbuka setelah pelajaran bab terkait selesai (t-kunci.js menguji kuncinya)
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") { const t = m.text(); if (!/api\/config|api\/me|WebGL|Failed to load resource|GPU stall|GroupMarkerNotSet/i.test(t)) errs.push(m.type() + ": " + t) } });
  await page.goto(BASE + "?t=" + Date.now() + "#/latihan/kuis", { waitUntil: "load" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !document.getElementById("zpre") && document.querySelector("[data-qz=\"open\"]"), null, { timeout: 15000 });
  await sl(800);
  const hscroll = async tag => { const r = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(r[0] <= r[1] + 1, `tanpa scroll horizontal (${tag}) ${r[0]}/${r[1]}`) };
  await hscroll("panel kuis");

  /* ---------- KUIS ---------- */
  const correctIdx = () => page.evaluate(() => {
    const qt = document.getElementById("gqq").textContent.trim(), x = GLD.QUIZ.find(z => z.q === qt), ans = x.o[x.a];
    return [...document.querySelectorAll(".gq-o")].findIndex(b => b.querySelector("span").textContent === ans);
  });
  async function playQuiz(mode, plan) { // plan(i) -> "ok" | "no"
    await page.click(`[data-qz="open"][data-m="${mode}"]`);
    await page.waitForSelector(".gq-lcard .gq-start", { state: "visible" });
    await page.click('.gq-seg [data-v="0"]'); // santai, tanpa timer
    await page.waitForSelector(".gq-lcard .gq-start", { state: "visible" }); await sl(700); await page.click(".gq-lcard .gq-start", { force: true });
    let i = 0;
    for (; i < 60; i++) {
      await page.waitForSelector(".gq-o:not(:disabled), .gq-res", { timeout: 15000 });
      if (await page.$(".gq-res")) break;
      const c = await correctIdx(), want = plan(i), k = want === "ok" ? c : (c + 1) % 4;
      if (i % 2) await page.keyboard.press(String(k + 1)); else await page.click(`.gq-o[data-k="${k}"]`);
      await page.waitForSelector("#gqnext", { state: "visible", timeout: 8000 });
      if (i === 0) { await hscroll("kuis soal"); }
      await page.click("#gqnext");
    }
    return i;
  }
  const n1 = await playQuiz("b0", i => (i < 3 ? "ok" : i === 3 ? "no" : "ok"));
  const r1 = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem("gl-latihan")); return [d.kuis.best.b0, GLD.QUIZ.filter(x => x.b === 0).length, document.querySelector("#gqsc").textContent] });
  ok(r1[0] && r1[0].n === r1[1] && r1[0].benar === r1[1] - 1, `kuis Bab 1 tersimpan benar ${r1[0] && r1[0].benar}/${r1[1]}`);
  ok(Math.abs(r1[0].score - Math.round((r1[1] - 1) / r1[1] * 1000) / 10) < 0.01, `nilai kuis = benar/jumlah×100 (${r1[0].score})`);
  ok(r1[0].poin > 0, `poin tercatat ${r1[0].poin}`);
  await sl(rm ? 100 : 1600);
  ok((await page.textContent("#gqsc")).replace(",", ".") == String(r1[0].score), "angka cincin hasil sesuai nilai " + (await page.textContent("#gqsc")));
  await hscroll("hasil kuis");
  // power-up muncul setelah 3 benar beruntun (latihan per bab)
  // keluar
  await page.click('.gq-rbtn [data-qz="close"]');
  await page.waitForSelector("#gqz", { state: "hidden" });
  ok(await page.$(".gq-pres"), "panel menampilkan hasil + pembahasan setelah ditutup");
  ok(!(await page.evaluate(() => document.querySelector("main").inert)), "inert dilepas setelah overlay ditutup");
  await page.click('[data-qz="home"]');

  // keluar di tengah lalu lanjutkan
  await page.click('[data-qz="open"][data-m="b1"]');
  await page.waitForSelector(".gq-lcard .gq-start", { state: "visible" }); await sl(700); await page.click(".gq-lcard .gq-start", { force: true });
  await page.waitForSelector(".gq-o:not(:disabled)");
  await page.keyboard.press("Escape");
  await page.waitForSelector("#gqcf");
  await page.click('[data-qz="cf-quit"]');
  await page.waitForSelector("#gqz", { state: "hidden" });
  ok(await page.$('[data-qz="resume"]'), "kartu 'Lanjutkan' muncul setelah keluar di tengah kuis");
  await page.click('[data-qz="resume"]');
  await page.waitForSelector(".gq-o:not(:disabled)");
  ok(true, "kuis bisa dilanjutkan");
  await page.keyboard.press("Escape"); await page.click('[data-qz="cf-quit"]'); await page.click('[data-qz="drop"]');

  if (full) {
    const nAll = await playQuiz("all", () => "ok");
    const ra = await page.evaluate(() => JSON.parse(localStorage.getItem("gl-latihan")).kuis.best.all);
    ok(ra && ra.score === 100 && ra.benar === 34, `Gabungan semua benar = ${ra && ra.score}`);
    await page.click('.gq-rbtn [data-qz="close"]'); await page.click('[data-qz="home"]');
  }
  // timer habis (sekali, desktop chrome)
  if (which === "chrome" && W === "1280" && !rm) {
    await page.click('[data-qz="open"][data-m="b2"]');
    await page.click('.gq-seg [data-v="20"]');
    await page.waitForSelector(".gq-lcard .gq-start", { state: "visible" }); await sl(700); await page.click(".gq-lcard .gq-start", { force: true });
    await page.waitForSelector(".gq-o:not(:disabled)");
    await page.waitForSelector(".gq-ban.to", { timeout: 26000 });
    ok(true, "waktu habis → banner 'Waktu habis!'");
    await page.keyboard.press("Escape"); await page.click('[data-qz="cf-quit"]'); await page.click('[data-qz="drop"]');
    await page.click('[data-qz="open"][data-m="b2"]'); await page.click('.gq-seg [data-v="45"]'); await page.keyboard.press("Escape");
  }

  /* ---------- DRAG & DROP ---------- */
  await page.click("#lt-dnd");
  await page.waitForSelector(".gd");
  await sl(600);
  await hscroll("drag & drop");
  const sets = await page.evaluate(() => GLD.DND.map(s => s.id));
  for (const id of sets) {
    await page.click(`[data-dd="set"][data-id="${id}"]`);
    await sl(rm ? 50 : 700);
    const info = await page.evaluate(id => { const S = GLD.DND.find(s => s.id === id); return { mode: S.mode, items: S.items.map(x => [x.t, x.k]) } }, id);
    if (info.mode === "bin") {
      for (const [t, k] of info.items) {
        const card = page.locator(".gd-card", { hasText: t }).first();
        if (id === "stres" && which === "chrome" && !rm && +W >= 1000 && t === info.items[0][0]) { // seret dengan mouse
          await page.evaluate(k => { const e = document.querySelector(`.gd-bin[data-z="${k}"]`), y = e.getBoundingClientRect().top + scrollY - 260; window.__lenis ? __lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y) }, k); await sl(300);
          const a = await card.boundingBox(), b = await page.locator(`.gd-bin[data-z="${k}"]`).boundingBox();
          log("seret dari", Math.round(a.x), Math.round(a.y), "ke", Math.round(b.x + 60), Math.round(b.y + 60));
          await page.mouse.move(a.x + 30, a.y + a.height / 2); await page.mouse.down();
          for (let s = 1; s <= 12; s++) await page.mouse.move(a.x + 30 + (b.x + 60 - a.x - 30) * s / 12, a.y + a.height / 2 + (b.y + 60 - a.y - a.height / 2) * s / 12);
          await sl(120); await page.mouse.up(); await sl(500);
          ok(await page.evaluate(([t, k]) => !!document.querySelector(`.gd-bin[data-z="${k}"] .gd-card`) && [...document.querySelectorAll(`.gd-bin[data-z="${k}"] .gd-card`)].some(c => c.textContent.includes(t)), [t, k]), "seret kartu dengan mouse ke kotak");
          continue;
        }
        await card.click(); await sl(rm ? 30 : 250);
        await page.click(`.gd-bin[data-z="${k}"] .gd-tgt`); await sl(rm ? 30 : 500);
      }
    } else {
      const n = info.items.length;
      for (let j = 0; j < n; j++) {
        const t = info.items.find(x => x[1] === String(j + 1))[0];
        const order = await page.$$eval(".gd-rank .gd-card .gd-txt", e => e.map(x => x.textContent));
        const p = order.indexOf(t);
        if (p === j) continue;
        if (j % 2) { // ketuk kartu, lalu ketuk posisi tujuan
          await page.locator(".gd-rank .gd-card", { hasText: t }).click(); await sl(rm ? 30 : 250);
          await page.locator(".gd-rank .gd-card").nth(j).click(); await sl(rm ? 30 : 600);
        } else { // tombol panah naik
          for (let s = 0; s < p - j; s++) { await page.locator(".gd-rank .gd-card", { hasText: t }).locator('[data-mv="-1"]').click(); await sl(rm ? 30 : 500) }
        }
      }
    }
    await page.click('[data-dd="check"]');
    await sl(rm ? 150 : 2200);
    const res = await page.textContent(".gd-res");
    ok(/^(\d+) dari \1 benar$/.test(res.trim()), `set ${id}: ${res.trim()}`);
  }
  const dn = await page.evaluate(() => Object.entries(JSON.parse(localStorage.getItem("gl-latihan")).dnd).map(([k, v]) => k + ":" + v.best.benar + "/" + v.best.n).join(" "));
  log("dnd tersimpan", dn);

  /* simulasi diuji terpisah di t-sim.js */
  // pindah halaman: overlay & suara berhenti
  await page.click('#lt-kuis'); if (await page.$('[data-qz="home"]')) await page.click('[data-qz="home"]'); await page.click('[data-qz="open"][data-m="b0"]');
  await page.waitForSelector(".gq-lcard");
  await page.evaluate(() => location.hash = "#/course");
  await sl(900);
  ok(await page.evaluate(() => document.getElementById("gqz").hidden && !document.documentElement.classList.contains("gx-lock")), "overlay tertutup saat pindah ke halaman lain");

  ok(errs.length === 0, "tanpa error console" + (errs.length ? ": " + errs.slice(0, 5).join(" | ") : ""));
  log(fails ? `SELESAI dengan ${fails} kegagalan` : "SEMUA LOLOS");
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(`[${which} ${W}x${H}] CRASH`, e); process.exit(2) });
