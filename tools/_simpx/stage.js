/* Screenshot panggung simulasi asli dengan aset pixel: node tools/_simpx/stage.js <prefix> [webkit]
   Membuka tiap kasus, situasi 1, memilih jawaban pertama, lalu memotret panggung sebelum dan sesudah reaksi. */
const pw = require("playwright");
(async () => {
  const [pre, eng = "chromium"] = process.argv.slice(2);
  const b = eng === "webkit" ? await pw.webkit.launch() : await pw.chromium.launch({ channel: "chrome" });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("mer-done", JSON.stringify(["0-0","0-1","0-2","0-3","0-4","1-0","1-1","1-2","1-3","1-4","2-0","2-1","2-2","2-3","2-4"])) } catch (e) {} ; window.GL_NO_GATE = 1 });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("http://localhost:8000/?t=" + Date.now() + "#/latihan/sim"); await p.waitForFunction(() => !document.getElementById("zpre") && document.querySelector(".gs-file"), null, { timeout: 20000 }); await p.waitForTimeout(800);
  await p.screenshot({ path: `${pre}-daftar.png` });
  const ids = await p.evaluate(() => GLD.SIM.filter(c => !c.soon).map(c => c.id));
  for (const id of ids) {
    await p.click(`.gs-file[data-id="${id}"]`); await p.waitForSelector('[data-sm="go"]'); await p.click('[data-sm="go"]'); await p.waitForTimeout(2600);
    const st = await p.$(".gv-stage"); await st.screenshot({ path: `${pre}-${id}-a.png` });
    const info = await p.evaluate(() => ({ px: document.querySelectorAll(".gv-stage .ch[data-px]").length, bg: !!document.querySelector(".gv-stage image.bgp") }));
    try { await p.click(".gv-x"); await p.waitForSelector(".gv-cs.on .gv-c", { timeout: 8000 }); await p.click(".gv-cs.on .gv-c"); await p.waitForTimeout(1100); await st.screenshot({ path: `${pre}-${id}-b.png` }) } catch (e) { console.log("pilih gagal", e.message.split("\n")[0]) }
    console.log(id, JSON.stringify(info));
    await p.goto("http://localhost:8000/?t=" + Date.now() + "#/latihan/sim"); await p.waitForSelector(".gs-file"); await p.waitForTimeout(600);
  }
  console.log("error:", errs.length ? errs : "tidak ada"); await b.close();
})();
