#!/usr/bin/env node
/* Membuat paket offline GrowthLab dari index.html + css/ + js/ + vendor/ + assets/.
   Isi paket tetap modular (file-file terpisah, sama seperti di VS Code), tidak digabung jadi satu file.
   Hasil di dist/:
   - GrowthLab_offline.zip : folder web lengkap. Ekstrak, lalu buka index.html di browser (tanpa internet).
   - GrowthLab_SCORM12.zip : isi yang sama + imsmanifest.xml (paket SCORM 1.2 untuk Moodle dan LMS sejenis).
   Jalankan: node tools/build-offline.js */
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "dist"), STAGE = path.join(OUT, ".paket");

/* file yang masuk paket (assets/sim/src = PNG mentah, tidak ikut) */
const list = [];
const walk = rel => {
  for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
    const r = path.posix.join(rel, e.name);
    if (e.name.startsWith(".") || r === "assets/sim/src") continue;
    e.isDirectory() ? walk(r) : list.push(r);
  }
};
list.push("index.html");
["css", "js", "vendor", "assets/sim", "assets/sb", "assets/video", "assets/lukisan", "assets/maskot"].forEach(d => fs.existsSync(path.join(ROOT, d)) && walk(d));

/* pemeriksaan: tidak boleh ada sumber eksternal (http/https) yang dimuat halaman */
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const ext = [...html.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)/g)].map(m => m[1]);
const miss = [...html.matchAll(/(?:src|href)="((?:css|js|vendor|assets)\/[^"]+)"/g)].map(m => m[1]).filter(f => !list.includes(f));
if (ext.length || miss.length) { console.error("Sumber eksternal / file hilang:", ext, miss); process.exit(1); }

fs.rmSync(OUT, { recursive: true, force: true });
for (const f of list) {
  const to = path.join(STAGE, f);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(path.join(ROOT, f), to);
}
execFileSync("zip", ["-q", "-X", "-9", "-r", path.join(OUT, "GrowthLab_offline.zip"), ...list], { cwd: STAGE });

/* SCORM 1.2: isi yang sama + imsmanifest.xml */
const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
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
${list.map(f => `      <file href="${esc(f)}"/>`).join("\n")}
    </resource>
  </resources>
</manifest>
`;
fs.writeFileSync(path.join(STAGE, "imsmanifest.xml"), manifest);
execFileSync("zip", ["-q", "-X", "-9", "-r", path.join(OUT, "GrowthLab_SCORM12.zip"), "imsmanifest.xml", ...list], { cwd: STAGE });
fs.rmSync(STAGE, { recursive: true, force: true });

const mb = f => (fs.statSync(path.join(OUT, f)).size / 1048576).toFixed(1) + " MB";
console.log(`Selesai (${list.length} file per paket):`);
for (const f of ["GrowthLab_offline.zip", "GrowthLab_SCORM12.zip"]) console.log("  dist/" + f + "  " + mb(f));
