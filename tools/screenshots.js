#!/usr/bin/env node
/* Mengambil screenshot untuk README GitHub → docs/screenshots/*.png
   Pakai: BASE=http://localhost:8010/index.html node tools/screenshots.js   (perlu Playwright & server lokal yang jalan) */
const { webkit } = require("playwright");
const path = require("path"), OUT = path.join(__dirname, "..", "docs", "screenshots");
const BASE = process.env.BASE || "http://localhost:8000/index.html";
const sl = ms => new Promise(r => setTimeout(r, ms));
/* contoh progres supaya tampilan terlihat "hidup" */
const SEED = {
  "mer-done": ["0-0", "0-1", "0-2", "0-3", "0-4", "1-0", "1-1", "1-2", "2-0"],
  "gl-latihan": { v: 2, kuis: { best: { b0: { score: 90, benar: 9, n: 10, t: 1 }, b1: { score: 80, benar: 8, n: 10, t: 1 } }, hist: [], ptsBest: {} }, dnd: { traps: { best: { benar: 4, n: 4, t: 1 }, n: 1 }, stres: { best: { benar: 7, n: 8, t: 1 }, n: 1 } }, sim: { s1: { best: { score: 88, ending: "bangkit", path: [95, 96, 95, 95, 96], t: 1 }, last: null, hist: [], endings: ["bangkit"], run: null } }, akhir: { last: null, hist: [] } }
};
(async () => {
  const b = await webkit.launch();
  const shot = async (name, hash, opt = {}, act) => {
    const ctx = await b.newContext({ viewport: opt.vp || { width: 1440, height: 900 }, deviceScaleFactor: opt.dpr || 1, isMobile: !!opt.mobile, reducedMotion: "reduce" });
    await ctx.addInitScript(s => { if (!sessionStorage.getItem("__s")) { for (const k in s) localStorage.setItem(k, JSON.stringify(s[k])); sessionStorage.setItem("__s", "1") } window.GL_NO_GATE = 1 }, SEED);
    const p = await ctx.newPage();
    await p.goto(BASE + "?shot=1#" + hash); await sl(3500);
    if (act) await act(p);
    await p.screenshot({ path: path.join(OUT, name + ".png") });
    console.log("ok", name); await ctx.close();
  };
  await shot("01-beranda", "/");
  await shot("02-materi", "/course");
  await shot("03-pelajaran", "/lesson/1-2", {}, async p => { await p.evaluate(() => scrollTo(0, 0)); await sl(800) });
  await shot("04-kuis", "/latihan/kuis/b1", {}, async p => {
    await p.evaluate(() => { const t = document.querySelector('[data-qz="tm"]'); t && t.click(); document.querySelector('[data-qz="go"]').click() }); await sl(4500);
  });
  await shot("05-simulasi", "/latihan/sim", {}, async p => {
    await p.evaluate(() => document.querySelector('.gs-file[data-id="s2"]').click()); await sl(1200);
    await p.evaluate(() => document.querySelector('[data-sm="go"]').click()); await sl(2500);
    await p.evaluate(() => { const s = document.querySelector('[data-sm="skip"]'); s && s.click() }); await sl(800);
    await p.evaluate(() => { const g = document.querySelector(".gv"); g && g.scrollIntoView({ block: "start" }); scrollBy(0, -90) }); await sl(800);
  });
  await shot("06-gamifikasi", "/course", {}, async p => { await p.evaluate(() => GLG.open()); await sl(1200) });
  await shot("07-hp", "/", { vp: { width: 390, height: 844 }, dpr: 2, mobile: true });
  await b.close();
})();
