/* Screenshot asli situs GrowthLab (server lokal port 8000) untuk video promo. Chrome, 1440x900, dpr 1.5. */
const { chromium } = require("playwright"), fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "cap"), BASE = "http://localhost:8000/index.html";
const src = fs.readFileSync("/Users/rifahaqi/Desktop/GL HUB MOTION/tools/screenshots.js", "utf8");
const SEED = eval("(" + /const SEED = (\{[\s\S]*?\n\});/.exec(src)[1] + ")");
const MID = { ...SEED, "mer-done": ["0-0", "0-1", "0-2", "0-3", "0-4", "1-0", "1-2"], "gl-ui": { nama: "Sari" } };
const sl = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ channel: "chrome" });
  const shot = async (name, hash, seed, act) => {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, reducedMotion: "reduce" });
    await ctx.addInitScript(s => { if (!sessionStorage.getItem("__s")) { for (const k in s) localStorage.setItem(k, JSON.stringify(s[k])); sessionStorage.setItem("__s", "1") } window.GL_NO_GATE = 1 }, seed);
    const p = await ctx.newPage();
    await p.goto(BASE + "?shot=1#" + hash); await sl(3800);
    await p.evaluate(async () => { const v = document.getElementById("promo"); if (v) { v.pause(); v.currentTime = 12; await new Promise(r => { v.addEventListener("seeked", r, { once: true }); setTimeout(r, 2500) }) } });
    if (act) await act(p);
    await sl(700);
    await p.screenshot({ path: path.join(OUT, name + ".png") }); console.log("ok", name); await ctx.close();
  };
  await shot("home", "/", MID);
  await shot("course", "/course", MID);
  await shot("lesson", "/lesson/0-1", MID, async p => { await p.evaluate(() => scrollTo(0, 0)); await sl(600) });
  await shot("kuis", "/latihan/kuis/b0", SEED, async p => { await p.evaluate(() => { const t = document.querySelector('[data-qz="tm"]'); t && t.click(); document.querySelector('[data-qz="go"]').click() }); await sl(4500) });
  await shot("sim", "/latihan/sim", SEED, async p => {
    await p.evaluate(() => document.querySelector('.gs-file[data-id="s2"]').click()); await sl(1200);
    await p.evaluate(() => document.querySelector('[data-sm="go"]').click()); await sl(2500);
    await p.evaluate(() => { const s = document.querySelector('[data-sm="skip"]'); s && s.click() }); await sl(800);
    await p.evaluate(() => { const g = document.querySelector(".gv"); g && g.scrollIntoView({ block: "start" }); scrollBy(0, -90) }); await sl(800);
  });
  await shot("chat", "/lesson/1-1", MID, async p => {
    await p.evaluate(() => scrollTo(0, 0));
    await p.evaluate(() => { const b = [...document.querySelectorAll("button,a")].find(x => /Bingung\?\s*Tanya/i.test(x.textContent)); b && b.click() }); await sl(1500);
    await p.evaluate(() => { const c = [...document.querySelectorAll("#chat button")].find(x => /burnout/i.test(x.textContent)); c && c.click() }); await sl(2500);
  });
  await shot("panel", "/course", SEED, async p => { await p.evaluate(() => GLG.open()); await sl(1500) });
  await b.close();
})();
