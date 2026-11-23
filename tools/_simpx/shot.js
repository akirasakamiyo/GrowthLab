/* Screenshot preview simulasi pixel: node tools/_simpx/shot.js <out.png> [z] [bg=..&ch=..]
   Butuh server tes di :8000. Mencetak error halaman (harus kosong). */
const { chromium } = require("playwright");
(async () => {
  const [out, z = "4", qs = ""] = process.argv.slice(2);   /* qs contoh: "bg=kamar&ch=ibu" */
  const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage({ viewport: { width: 1500, height: 900 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()) });
  await p.goto(`http://localhost:8000/tools/_simpx/preview.html?sheet=1&z=${z}${qs ? "&" + qs : ""}`); await p.waitForTimeout(800);
  await p.screenshot({ path: out, fullPage: true });
  const real = errs.filter(e => !/404/.test(e)); console.log("error:", real.length ? real : "tidak ada (404 = file aset yang belum dibuat, abaikan)"); await b.close();
})();
