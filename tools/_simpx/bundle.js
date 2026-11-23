/* Gabungkan aset pixel simulasi dari tools/_simpx/*.js ke js/35-sim-pixel-aset.js (sementara, selama aset dikerjakan) */
const fs = require("fs"), path = require("path");
const D = __dirname, OUT = path.join(D, "../../js/35-sim-pixel-aset.js");
const F = ["hero", "ibu", "teman", "atasan", "rekan", "rekan2", "kantor", "kamar", "kamar-malam", "rumah", "teras", "meja", "lobi", "pantry", "rapat"];
let s = "/* Aset pixel simulasi (2026-11-14): tokoh 64x64 dan latar 320x150, digambar per piksel dengan GLPIX.grid.\n   Dipakai oleh js/34-sim-pixel.js. Satu blok per aset. */\n";
const ada = [];
for (const f of F) { const p = path.join(D, f + ".js"); if (!fs.existsSync(p)) continue; ada.push(f); s += `\n/* ===== ${f} ===== */\n` + fs.readFileSync(p, "utf8").trim() + "\n" }
fs.writeFileSync(OUT, s); console.log("aset:", ada.join(", "), "|", (s.length / 1024).toFixed(0) + " KB");
