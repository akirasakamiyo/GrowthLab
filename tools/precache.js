#!/usr/bin/env node
/* Membuat precache.json untuk service worker (sw.js): daftar file yang diunduh saat GrowthLab dipasang sebagai aplikasi.
   Isinya: semua css/js/vendor yang dimuat index.html (persis dengan ?v=<commit>), font, ikon, gambar.
   Video .mp4 tidak ikut (terlalu besar, tetap butuh internet); poster .jpg video ikut.
   Dipanggil tools/build-pages.sh: node tools/precache.js <folder hasil> */
const fs = require("fs"), path = require("path");
const OUT = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const html = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
const L = new Set(["index.html", "manifest.webmanifest"]);
for (const m of html.matchAll(/(?:src|href)="((?:css|js|vendor|assets)\/[^"]+)"/g)) if (!/\.mp4$/i.test(m[1])) L.add(m[1]);
const walk = rel => {
  const abs = path.join(OUT, rel);
  if (!fs.existsSync(abs)) return;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const r = path.posix.join(rel, e.name);
    if (e.name.startsWith(".") || r === "assets/sim/src") continue;
    if (e.isDirectory()) walk(r);
    else if (!/\.(mp4|js|css|md)$/i.test(e.name)) L.add(r);
  }
};
["vendor", "assets"].forEach(walk);
fs.writeFileSync(path.join(OUT, "precache.json"), JSON.stringify([...L], null, 0));
const kb = [...L].reduce((s, f) => { try { return s + fs.statSync(path.join(OUT, f.split("?")[0])).size } catch (e) { return s } }, 0) / 1048576;
console.log(`precache.json: ${L.size} file, ${kb.toFixed(1)} MB`);
