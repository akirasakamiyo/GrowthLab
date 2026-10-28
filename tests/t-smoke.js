// Smoke test seluruh rute: tanpa error/peringatan console, tanpa scroll horizontal.
const { chromium, webkit } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8000/index.html";
const which = process.argv[2] || "chrome", W = +(process.argv[3] || 1280);
const sl = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await (which === "webkit" ? webkit : chromium).launch(which === "chrome" ? { channel: "chrome" } : {});
  const p = await b.newPage({ viewport: { width: W, height: 800 } }); const errs = [];
  p.on("pageerror", e => errs.push("pageerror " + e.message));
  p.on("console", m => { if (/error|warning/.test(m.type())) { const t = m.text(); if (!/api\/config|api\/me|WebGL|Failed to load resource|GPU stall|GroupMarkerNotSet/i.test(t)) errs.push(m.type() + " " + t) } });
  await p.goto(BASE + "?s=" + Date.now() + "#/", { waitUntil: "load" });
  await p.waitForFunction(() => !document.getElementById("zpre"), null, { timeout: 15000 }); await sl(1500);
  const routes = ["#/", "#/course", "#/lesson/0-0", "#/lesson/2-4", "#/latihan", "#/latihan/kuis/b0", "#/course", "#/latihan/dnd/ps", "#/latihan/sim/s1", "#/peta", "#/glosarium", "#/tujuan", "#/petunjuk", "#/alur", "#/e-learning", "#/tentang", "#/faq"];
  let bad = 0;
  for (const r of routes) {
    await p.evaluate(r => location.hash = r, r); await sl(1300);
    const [sw, iw, ov] = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth, !!(document.getElementById("gqz") && !document.getElementById("gqz").hidden)]);
    const exp = r === "#/latihan/kuis/b0";
    if (sw > iw + 1 && r !== "#/") { bad++; console.log("GAGAL scroll horizontal", r, sw, iw) }
    if (ov !== exp) { bad++; console.log("GAGAL overlay kuis", r, ov) }
    if (r === "#/latihan/sim/s1") { const t = await p.$(".gs-title"); if (!t) { bad++; console.log("GAGAL tautan langsung simulasi") } else { await p.keyboard.press("Enter"); await sl(900); if (!(await p.$(".gv-x"))) { bad++; console.log("GAGAL Enter memulai kasus") } } }
    if (r === "#/latihan/dnd/ps" && !(await p.$('.gd[data-mode="order"]'))) { bad++; console.log("GAGAL tautan langsung dnd") }
  }
  // beranda tetap bersih dari error (soal kilat sudah dihapus dari beranda)
  await p.evaluate(() => location.hash = "#/"); await sl(1500);
  const kil = await p.$("#kilat .opt, .opt");
  if (kil) { await p.evaluate(() => { const o = document.querySelector("#kilat .opt") || document.querySelector(".opt"); o.scrollIntoView(); o.click() }); await sl(400) }
  if (errs.length) { bad++; console.log("GAGAL console:", errs.slice(0, 8).join(" | ")) }
  console.log(`[smoke ${which} ${W}] ` + (bad ? `${bad} masalah` : "SEMUA LOLOS"));
  await b.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error("CRASH", e); process.exit(2) });
