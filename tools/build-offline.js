#!/usr/bin/env node
/* Membuat paket offline GrowthLab dari GrowthLab_v5.html.
   Hasil di dist/:
   - GrowthLab_offline.html  : SATU file berisi semua (pustaka JS, font, gambar simulasi). Bisa dibuka langsung tanpa internet.
   - GrowthLab_offline.zip   : file di atas sebagai index.html (untuk LMS yang menerima paket HTML/ZIP biasa).
   - GrowthLab_SCORM12.zip   : index.html + imsmanifest.xml (paket SCORM 1.2 untuk Moodle dan LMS sejenis).
   Jalankan: node tools/build-offline.js */
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "dist");
const read = p => fs.readFileSync(path.join(ROOT, p));
let html = read("GrowthLab_v5.html").toString("utf8");

/* 1. pustaka JS: <script src="vendor/x.js"> -> skrip inline */
html = html.replace(/<script src="(vendor\/[^"]+\.js)"><\/script>/g, (m, src) =>
  "<script>/* " + src + " */\n" + read(src).toString("utf8").replace(/<\/script/gi, "<\\/script") + "\n</script>");

/* 2. font: fonts.css -> <style> dengan woff2 sebagai data URI */
html = html.replace('<link href="vendor/fonts/fonts.css" rel="stylesheet">', () => {
  const css = read("vendor/fonts/fonts.css").toString("utf8").replace(/url\(([^)]+\.woff2)\)/g, (m, f) =>
    "url(data:font/woff2;base64," + read("vendor/fonts/" + f).toString("base64") + ")");
  return "<style id=\"gl-fonts\">\n" + css + "</style>";
});

/* 3. gambar latar simulasi -> window.GL_SIMIMG (dipakai SIMSRC di script#gl-sim-*) */
const img = {};
for (const f of fs.readdirSync(path.join(ROOT, "assets/sim")).filter(f => f.endsWith(".jpg")))
  img[f.replace(/\.jpg$/, "")] = "data:image/jpeg;base64," + read("assets/sim/" + f).toString("base64");
html = html.replace("</head>", () => "<script>window.GL_SIMIMG=" + JSON.stringify(img) + ";</script>\n</head>");

/* pemeriksaan: tidak boleh ada sumber eksternal yang tersisa */
const ext = [...html.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)/g)].map(m => m[1]);
const vend = [...html.matchAll(/(?:src|href)="(vendor\/|assets\/)[^"]*"/g)].map(m => m[0]);
if (ext.length || vend.length) { console.error("Masih ada sumber di luar paket:", ext, vend); process.exit(1); }

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "GrowthLab_offline.html"), html);

/* ZIP biasa: index.html */
const tmp = path.join(OUT, ".tmp");
fs.mkdirSync(tmp);
fs.writeFileSync(path.join(tmp, "index.html"), html);
execFileSync("zip", ["-q", "-X", "-9", path.join(OUT, "GrowthLab_offline.zip"), "index.html"], { cwd: tmp });

/* ZIP SCORM 1.2: index.html + imsmanifest.xml */
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="growthlab-kelompok8" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="org-growthlab">
    <organization identifier="org-growthlab">
      <title>GrowthLab: Self Development for Job Seeker</title>
      <item identifier="item-growthlab" identifierref="res-growthlab" isvisible="true">
        <title>GrowthLab: Self Development for Job Seeker</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res-growthlab" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>
`;
fs.writeFileSync(path.join(tmp, "imsmanifest.xml"), manifest);
execFileSync("zip", ["-q", "-X", "-9", path.join(OUT, "GrowthLab_SCORM12.zip"), "imsmanifest.xml", "index.html"], { cwd: tmp });
fs.rmSync(tmp, { recursive: true, force: true });

const mb = f => (fs.statSync(path.join(OUT, f)).size / 1048576).toFixed(1) + " MB";
console.log("Selesai:");
for (const f of ["GrowthLab_offline.html", "GrowthLab_offline.zip", "GrowthLab_SCORM12.zip"]) console.log("  dist/" + f + "  " + mb(f));
