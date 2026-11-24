// PWA: manifest + ikon, service worker terpasang dan menyimpan file, lalu situs tetap jalan tanpa internet.
// Menguji hasil build (bukan folder sumber), karena sw.js versi produksi dan precache.json dibuat tools/build-pages.sh.
// Jalankan: node tests/t-pwa.js chrome   |   node tests/t-pwa.js webkit
const { chromium, webkit } = require("playwright"), { execFileSync, spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const which = process.argv[2] || "chrome", PORT = 8000 + (which === "webkit" ? 32 : 31);
const sl = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (c, m) => { console.log((c ? "  ok  " : "  GAGAL ") + m); if (!c) bad++ };
(async () => {
  const OUT = fs.mkdtempSync(path.join(os.tmpdir(), "gl-pwa-"));
  execFileSync(path.join(__dirname, "..", "tools", "build-pages.sh"), [OUT], { stdio: "pipe" });
  /* versi beku di versi/pertemuan-12/ (tools/bekukan-versi.sh) untuk menguji dua service worker berdampingan */
  execFileSync(path.join(__dirname, "..", "tools", "bekukan-versi.sh"), ["pertemuan-12", OUT], { stdio: "pipe" });
  const L = JSON.parse(fs.readFileSync(path.join(OUT, "precache.json"), "utf8"));
  const sw = fs.readFileSync(path.join(OUT, "sw.js"), "utf8");
  ok(!/const V = "__V__"/.test(sw), "sw.js hasil build memakai versi commit");
  ok(L.length > 100 && !L.some(f => /\.mp4$/.test(f)) && L.every(f => fs.existsSync(path.join(OUT, f.split("?")[0]))), `precache.json: ${L.length} file, tanpa video, semua ada`);
  const srv = spawn(process.execPath, [path.join(__dirname, "serve.js"), OUT], { env: { ...process.env, PORT }, stdio: "ignore" });
  await sl(600);
  const BASE = `http://localhost:${PORT}/`;
  const b = await (which === "webkit" ? webkit : chromium).launch(which === "chrome" ? { channel: "chrome" } : {});
  const ctx = await b.newContext({ viewport: { width: which === "webkit" ? 390 : 1280, height: 800 } });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  try {
    await p.goto(BASE + "#/", { waitUntil: "load" });
    /* manifest dan ikon */
    const man = await p.evaluate(async () => { const h = document.querySelector('link[rel=manifest]').href, m = await (await fetch(h)).json();
      const ik = await Promise.all(m.icons.map(async i => (await fetch(new URL(i.src, h))).ok));
      const ap = (await fetch(document.querySelector('link[rel=apple-touch-icon]').href)).ok;
      return { m, ik, ap } });
    ok(man.m.display === "standalone" && man.m.start_url === "./" && man.m.icons.some(i => i.sizes === "512x512" && i.purpose === "maskable"), "manifest: standalone, start_url, ikon 512 maskable");
    ok(man.ik.every(Boolean) && man.ap, "ikon manifest dan apple-touch-icon bisa diunduh");
    /* service worker aktif dan precache selesai */
    await p.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.ready.then(() => true), null, { timeout: 20000 });
    /* tunggu precache selesai (polling sungguhan; fungsi async di waitForFunction selalu dianggap benar) */
    const isi = () => p.evaluate(async () => { const k = (await caches.keys()).find(k => k.startsWith("gl:/:")); return k ? (await (await caches.open(k)).keys()).length : 0 });
    for (let i = 0; i < 120 && (await isi()) < L.length; i++) await sl(500);
    ok((await isi()) >= L.length, "precache selesai: semua file tersimpan");
    const ck = await p.evaluate(async () => { const k = await caches.keys(); return k });
    ok(ck.length === 1 && /^gl:\/:[0-9a-f]{7,}$/.test(ck[0]), "satu cache bernama gl:/:<commit>: " + ck.join(","));
    await p.reload({ waitUntil: "load" });
    ok(await p.evaluate(() => !!navigator.serviceWorker.controller), "halaman dikendalikan service worker");
    /* versi beku: halaman sendiri, label versi, service worker dan cache sendiri, cache utama tetap utuh */
    const pv = await ctx.newPage();
    await pv.goto(BASE + "versi/pertemuan-12/#/", { waitUntil: "load" });
    for (let i = 0; i < 120 && !(await pv.evaluate(async () => (await caches.keys()).some(x => x.startsWith("gl:/versi/pertemuan-12/:")))); i++) await sl(500);
    await pv.reload({ waitUntil: "load" }); await sl(800);
    const vb = await pv.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); const k = await caches.keys();
      const pill = document.querySelector(".gl-vpill"); return { scope: r && new URL(r.scope).pathname, k, pill: pill && pill.textContent, href: pill && pill.getAttribute("href") } });
    ok(vb.scope === "/versi/pertemuan-12/", "versi beku punya service worker sendiri: " + vb.scope);
    ok(/Pertemuan 12/.test(vb.pill || "") && vb.href === "/", "label versi beku tampil dan menuju versi terbaru");
    ok(vb.k.length === 2 && vb.k.includes(ck[0]), "cache versi utama tidak terhapus: " + vb.k.join(","));
    await pv.close();
    await p.evaluate(() => location.hash = "#/tentang"); await sl(1500);
    const vt = await p.evaluate(() => [...document.querySelectorAll(".gl-v .btn")].map(a => a.getAttribute("href")));
    ok(vt.includes("/versi/pertemuan-12/"), "kartu Versi produk di Tentang menautkan versi beku");
    /* tombol/arahan pasang di Pengaturan */
    await p.evaluate(() => location.hash = "#/pengaturan"); await sl(1200);
    const pw = await p.evaluate(() => { const d = document.getElementById("st-pwa-d"); return d && d.textContent });
    ok(pw && /tanpa internet/.test(pw), "Pengaturan: baris Pasang sebagai aplikasi: " + (pw || "").slice(0, 70));
    ok(!(await p.evaluate(() => document.body.textContent.includes("SCORM"))), "tidak ada sisa teks SCORM di Pengaturan");
    /* tanpa internet: server dimatikan, lalu halaman dimuat ulang penuh (bukan sekadar ganti hash).
       ctx.setOffline tidak dipakai karena di WebKit Playwright ikut memblokir jawaban service worker. */
    srv.kill(); await sl(500);
    ok(await p.evaluate(() => fetch("/cek-server-mati.mp4").then(() => false, () => true)), "server benar-benar mati");
    await p.evaluate(() => location.hash = "#/"); await p.reload({ waitUntil: "load" });
    await p.waitForFunction(() => !document.getElementById("zpre"), null, { timeout: 15000 }); await sl(800);
    ok(await p.evaluate(() => document.fonts.check("16px 'Bricolage Grotesque'") && !!document.querySelector(".nav")), "offline: beranda tampil dengan font lokal");
    for (const [r, sel] of [["#/course", ".nav"], ["#/lesson/0-0", "h1"], ["#/glosarium", "h1"], ["#/latihan", "h1"]]) {
      await p.evaluate(r => location.hash = r, r); await sl(1100);
      ok(await p.evaluate(s => !!document.querySelector(s) && document.body.innerText.length > 200, sel), "offline: " + r + " tampil");
    }
    const img = await p.evaluate(async () => { const k = (await caches.keys())[0], c = await caches.open(k), inC = !!(await c.match("assets/lukisan/bab1.jpg")); try { const im = new Image(); im.src = "assets/lukisan/bab2.jpg"; const imOk = await new Promise(r => { im.onload = () => r(im.naturalWidth > 0); im.onerror = () => r(false) }); const r = await fetch("assets/lukisan/bab1.jpg").catch(e => "x"); return (imOk && r.ok) || ("img " + imOk + " fetch " + (r.ok ?? r) + " inCache " + inC) } catch (e) { return "err " + e.message + " inCache " + inC } });
    ok(img === true, "offline: gambar (lukisan bab) dari cache" + (img === true ? "" : ": " + img));
    const vid = await p.evaluate(async () => { try { return (await fetch("assets/video/faq.mp4")).ok } catch (e) { return false } });
    ok(vid === false, "offline: video tidak disimpan (butuh internet)");
    ok(!errs.length, "tanpa error halaman" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
  } catch (e) { bad++; console.log("CRASH", e.message) }
  console.log(`[pwa ${which}] ` + (bad ? `${bad} masalah` : "SEMUA LOLOS"));
  await b.close(); srv.kill(); fs.rmSync(OUT, { recursive: true, force: true });
  process.exit(bad ? 1 : 0);
})();
