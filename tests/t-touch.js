// Tes gestur sentuh drag & drop (Chrome, CDP): usap = gulir, tahan lalu seret = pindah kartu.
const { chromium } = require("playwright");
const sl = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (c, m) => { console.log((c ? "ok: " : "GAGAL: ") + m); if (!c) fails++ };
(async () => {
  const b = await chromium.launch({ channel: "chrome" });
  const ctx = await b.newContext({ viewport: { width: 375, height: 740 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.goto("http://localhost:8000/index.html?t=" + Date.now() + "#/latihan/dnd/stres");
  await p.waitForFunction(() => !document.getElementById("zpre") && document.querySelector(".gd-card"), null, { timeout: 15000 });
  await sl(1500);
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
  await p.evaluate(() => { const e = document.querySelector(".gd-deck"), y = e.getBoundingClientRect().top + scrollY - 120; window.__lenis ? __lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y) });
  await sl(400);
  // 1) usap cepat ke atas di atas kartu → halaman tergulir, tidak ada kartu terangkat
  let box = await p.locator(".gd-deck .gd-card").first().boundingBox();
  const y0 = await p.evaluate(() => scrollY);
  await touch("touchStart", box.x + 60, box.y + 20);
  for (let s = 1; s <= 10; s++) { await touch("touchMove", box.x + 60, box.y + 20 - s * 25); await sl(16) }
  await touch("touchEnd"); await sl(700);
  const y1 = await p.evaluate(() => scrollY);
  ok(y1 > y0 + 50, `usap di atas kartu menggulir halaman (${y0} → ${y1})`);
  ok(!(await p.$(".gd-ghost")) && (await p.$$(".gd-bin .gd-card")).length === 0, "usap tidak memindahkan kartu");
  // 2) tahan 300 ms lalu seret ke kotak "Stres"
  await p.evaluate(() => { const e = document.querySelector(".gd-deck"), y = e.getBoundingClientRect().top + scrollY - 100; window.__lenis ? __lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y) });
  await sl(400);
  const info = await p.evaluate(() => { const c = document.querySelector(".gd-deck .gd-card"), t = c.querySelector(".gd-txt").textContent, k = GLD.DND.find(s => s.id === "stres").items.find(x => x.t === t).k; return { t, k } });
  box = await p.locator(".gd-deck .gd-card").first().boundingBox();
  await p.evaluate(() => { window.__ev = []; ["pointerdown", "pointermove", "pointerup", "pointercancel", "touchcancel"].forEach(t => addEventListener(t, e => { if (__ev.length < 400) __ev.push(t + ":" + Math.round(e.clientX || 0) + "," + Math.round(e.clientY || 0)) }, true)) });
  await touch("touchStart", box.x + 60, box.y + 20); await sl(320);
  ok(!!(await p.$(".gd-ghost")), "tahan sebentar → kartu terangkat (ghost muncul)");
  // geser ke bawah sampai kotak tujuan terlihat (auto-scroll membantu), cari posisi kotak terkini
  let tx = box.x + 60, ty = box.y + 20;
  const mv = async (x, y, n = 8) => { for (let s = 1; s <= n; s++) { await touch("touchMove", tx + (x - tx) * s / n, ty + (y - ty) * s / n); await sl(30) } tx = x; ty = y };
  for (let s = 0; s < 60; s++) { // bawa jari ke tepi bawah agar halaman menggulir otomatis sampai kotak terlihat
    const bb = await p.locator(`.gd-bin[data-z="${info.k}"]`).boundingBox();
    if (bb.y + 40 < 560) break;
    await mv(tx, 715, 3); await sl(120);
  }
  const bb = await p.locator(`.gd-bin[data-z="${info.k}"]`).boundingBox();
  await mv(bb.x + bb.width / 2, Math.max(bb.y + 40, 120), 10);
  await sl(200); await touch("touchEnd"); await sl(800);
  const placed = await p.evaluate(({ t, k }) => [...document.querySelectorAll(`.gd-bin[data-z="${k}"] .gd-card .gd-txt`)].some(e => e.textContent === t), info);
  ok(placed, `tahan-lalu-seret menaruh kartu ke kotak ${info.k}`);
  if (!placed) { const ev = await p.evaluate(() => __ev); console.log(ev.length, ev.filter(x => !x.startsWith("pointermove")).join(" "), ev.slice(-4).join(" ")) }
  ok(!(await p.$(".gd-ghost")), "ghost hilang setelah dilepas");
  // 3) ketuk-pilih tetap jalan
  const c2 = await p.locator(".gd-deck .gd-card").first(); await c2.tap(); await sl(300);
  ok(!!(await p.$(".gd-card.sel")), "ketuk kartu → terpilih");
  await p.locator('.gd-bin[data-z="b"] .gd-tgt').tap(); await sl(600);
  ok((await p.$$('.gd-bin[data-z="b"] .gd-card')).length >= 1 && !(await p.$(".gd-card.sel")), "ketuk kotak → kartu terpilih ditaruh");
  ok(errs.length === 0, "tanpa error halaman " + errs.join("|"));
  console.log(fails ? `SELESAI dengan ${fails} kegagalan` : "SEMUA LOLOS");
  await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error("CRASH", e); process.exit(2) });
