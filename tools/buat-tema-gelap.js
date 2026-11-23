/* Membuat css/27-tema-gelap.css dari semua CSS situs (urutan sesuai index.html).
   Setiap deklarasi warna terang (latar putih/krem, teks biru tua, garis tipis gelap) dipetakan ke padanannya di tema gelap,
   dengan selektor yang sama diawali html[data-theme=dark]. Juga membuat aturan kontras tinggi untuk teks abu.
   Pengecualian dan penyesuaian manual ada di css/26-pengaturan.css (dimuat sesudahnya).
   Jalankan ulang setiap kali CSS berubah:  node tools/buat-tema-gelap.js */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), OUT = "css/27-tema-gelap.css", SKIP = new Set([OUT, "css/26-pengaturan.css", "css/28-kurangi-gerak.css"]);
const SIDEBAR = /\.sbn|#sbn/;   // sidebar sudah gelap di kedua tema: aturannya tidak dipetakan
const files = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<link rel="stylesheet" href="(css\/[^"]+)"/g)].map(m => m[1]).filter(f => !SKIP.has(f));

/* ---------- warna ---------- */
const hexRe = /#([0-9a-fA-F]{3,8})\b/g, rgbaRe = /rgba?\(([^)]+)\)/g;
const toRGB = h => { h = h.replace("#", ""); if (h.length <= 4) h = h.split("").map(c => c + c).join(""); const n = parseInt(h.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255, h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1] };
const lum = ([r, g, b]) => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b) };
const sat = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0 };
const colorsIn = v => { v = resolve(v); const out = []; for (const m of v.matchAll(hexRe)) out.push(toRGB(m[0])); for (const m of v.matchAll(rgbaRe)) { const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat); if (p.length >= 3) out.push([p[0], p[1], p[2], p[3] ?? 1]) } return out };
/* nilai variabel :root versi terang, supaya var(--ink), var(--sun) dsb. ikut dikenali */
const VARS = {};
const resolve = v => { for (let k = 0; k < 4 && /var\(--/.test(v); k++) v = v.replace(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g, (m, n, d) => VARS[n] || d || m); return v };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05) };
const hex = c => "#" + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
/* cerahkan warna teks jenuh (oranye, ungu, hijau tua) sampai terbaca di atas kartu gelap */
const brighten = c => { let k = 0, m = c; while (contrast(m, [26, 31, 71]) < 4.6 && k < 20) { k++; m = c.map((v, i) => i < 3 ? v + (255 - v) * k * .05 : v) } return hex(m) };
const isLightBg = c => lum(c) > .62 && (sat(c) < .22 || lum(c) > .8);   // putih, krem, lavender, dan warna pastel pucat          // putih, krem, lavender pucat
const isInk = c => lum(c) < .07 && c[3] > .5;                   // biru tua / hitam pekat
const isMuted = c => lum(c) >= .07 && lum(c) < .3 && sat(c) < .55 && c[3] > .5; // abu kebiruan
const isDarkLine = c => lum(c) < .07 && c[3] <= .5 && Math.max(c[0], c[1], c[2]) > 12;   // garis/tint tipis biru tua (hitam transparan = bayangan, dibiarkan)
const isSun = c => lum(c) > .45 && sat(c) >= .5 && c[3] > .8;     // latar kuning cerah: teksnya selalu gelap
const isTint = c => lum(c) < .25 && sat(c) > .5 && c[3] > .5;     // teks berwarna jenuh yang gelap

const SURF = l => l > .9 ? "#1a1f47" : "#141838";               // kartu putih / kertas krem
const INK = "#eef0ff", MUT = "#b9bee8";
const swap = (v, f) => resolve(v).replace(/#([0-9a-fA-F]{3,8})\b|rgba?\([^)]+\)/g, s => { const c = colorsIn(s)[0]; const r = c && f(c); return r || s });

/* ---------- pengurai CSS sederhana (aturan, @media/@supports bersarang; @keyframes/@font-face dilewati) ---------- */
function parse(src) {
  src = src.replace(/\/\*[\s\S]*?\*\//g, "");
  let i = 0;
  function block() {
    const items = [];
    while (i < src.length) {
      const c = src[i];
      if (c === "}") { i++; return items }
      let j = i, depth = 0, q = null;
      while (j < src.length) { const ch = src[j]; if (q) { if (ch === q) q = null } else if (ch === '"' || ch === "'") q = ch; else if (ch === "(") depth++; else if (ch === ")") depth--; else if ((ch === "{" || ch === "}" || ch === ";") && depth <= 0) break; j++ }
      const pre = src.slice(i, j).trim();
      if (src[j] === ";") { i = j + 1; continue }       // @import dsb.
      if (src[j] === "}") { i = j; continue }
      if (j >= src.length) return items;
      i = j + 1;
      if (/^@(media|supports)/.test(pre)) items.push({ at: pre, kids: block() });
      else if (/^@/.test(pre)) { skip() }
      else { const k = src.indexOf("}", i); items.push({ sel: pre, body: src.slice(i, k) }); i = k + 1 }
    }
    return items;
  }
  function skip() { let d = 1; while (i < src.length && d) { if (src[i] === "{") d++; else if (src[i] === "}") d--; i++ } }
  return block();
}
const splitTop = (s, sep) => { const out = []; let d = 0, cur = "", q = null; for (const ch of s) { if (q) { if (ch === q) q = null } else if (ch === '"' || ch === "'") q = ch; else if (ch === "(" || ch === "[") d++; else if (ch === ")" || ch === "]") d--; if (ch === sep && d === 0 && !q) { out.push(cur); cur = "" } else cur += ch } if (cur.trim()) out.push(cur); return out };
const decls = body => splitTop(body, ";").map(d => { const k = d.indexOf(":"); return k < 0 ? null : { p: d.slice(0, k).trim().toLowerCase(), v: d.slice(k + 1).trim() } }).filter(Boolean);
const pref = (sel, scope) => splitTop(sel, ",").map(s => { s = s.trim(); if (/^(html|:root)\b/.test(s)) return null; return `${scope} ${s.replace(/^body/, "body")}` }).filter(Boolean).join(",");

function mapRule(sel, body) {
  const D = decls(body), dark = [], hcL = [], hcD = [];
  const bgDecl = D.find(d => /^background(-color)?$/.test(d.p));
  const bgCols = bgDecl ? colorsIn(bgDecl.v) : [];
  const ownBgColored = bgCols.length && !bgCols.every(isLightBg);  // latar berwarna (kuning, oranye, biru tua): teksnya dibiarkan
  /* variabel warna per bagian (--b latar bagian, --bg/--bg2 kertas, --fg/--ink teks, --mut teks abu) */
  const vb = D.find(d => d.p === "--b"), vbCol = vb ? colorsIn(vb.v) : [], secColored = vbCol.length && !vbCol.every(isLightBg);
  for (const { p, v } of D) {
    if (!p.startsWith("--")) continue;
    const c = colorsIn(v)[0]; if (!c || /gradient/.test(v)) continue;
    if (["--b", "--prev", "--bg", "--bg2"].includes(p) && isLightBg(c)) dark.push(`${p}:${SURF(lum(c)) === "#1a1f47" && p !== "--b" ? "#0e1230" : p === "--bg2" ? "#181c40" : SURF(lum(c)) === "#1a1f47" ? "#161a3d" : "#0e1230"}`);
    else if (["--fg", "--ink"].includes(p) && isInk(c) && !secColored) dark.push(`${p}:${INK}`);
    else if (p === "--mut" && (isMuted(c) || isInk(c)) && !secColored) { dark.push(`--mut:${MUT}`); hcL.push("--mut:#11163f"); hcD.push("--mut:#fff") }
  }
  const themeVar = bgDecl && /var\(--(bg2?|b|prev)\)/.test(bgDecl.v);   // token tema, bukan warna tetap
  if (!themeVar && bgCols.length === 1 && isSun(bgCols[0]) && !(D.find(d => d.p === "color" && colorsIn(d.v)[0] && lum(colorsIn(d.v)[0]) > .8)))
    dark.push("color:#14185e", "--ink:#14185e", "--fg:#14185e", "--mut:#3d3862", "--acc-t:#b23a12");
  if (vbCol.length === 1 && isSun(vbCol[0])) dark.push("--ink:#14185e", "--fg:#14185e", "--mut:#3d3862", "--acc-t:#b23a12", "color:#14185e");
  for (const { p, v } of D) {
    if (p.startsWith("--")) continue;
    const imp = /!important/.test(v) ? "!important" : "";
    if (/^background(-color)?$/.test(p)) {
      const cs = colorsIn(v); if (!cs.length) continue;
      if (/gradient|url\(/.test(v)) { if (cs.every(c => isLightBg(c) || c[3] < .3)) dark.push(`${p}:${swap(v, c => isLightBg(c) ? (c[3] < 1 ? `rgba(26,31,71,${c[3]})` : SURF(lum(c))) : null)}`); continue }
      if (cs.length === 1 && isLightBg(cs[0])) { dark.push(`${p}:${swap(v, c => c[3] < 1 ? `rgba(26,31,71,${Math.max(c[3], .6)})` : SURF(lum(c)))}`); if (cs[0][3] > .8 && !D.some(d => d.p === "color")) dark.push(`color:${INK}`) }
      else if (cs.length === 1 && isInk(cs[0]) && /var\(--(ink|fg)\)/.test(v)) dark.push(`${p}:#2b3170`);   // isian biru tua lewat var(--ink): tetap gelap
      else if (cs.length === 1 && isDarkLine(cs[0])) dark.push(`${p}:${swap(v, c => `rgba(233,235,255,${c[3]})`)}`);
    } else if (p === "color") {
      const c = colorsIn(v)[0]; if (!c || ownBgColored) continue;
      if (/var\(--(ink|fg|mut)\)/.test(v)) continue;   // sudah ikut token gelap
      if (isInk(c)) { dark.push(`color:${INK}${imp}`); hcD.push("color:#fff") }
      else if (lum(c) < .07 && c[3] <= .5) dark.push(`color:rgba(233,235,255,${Math.min(1, c[3] + .25)})${imp}`)
      else if (isTint(c)) dark.push(`color:${brighten(c)}${imp}`)
      else if (isMuted(c)) { dark.push(`color:${MUT}${imp}`);  hcL.push("color:#11163f"); hcD.push("color:#fff") }
    } else if (/^border(-(top|right|bottom|left))?(-color)?$|^outline(-color)?$/.test(p)) {
      if (!colorsIn(v).length) continue;
      const nv = swap(v, c => isDarkLine(c) ? `rgba(233,235,255,${Math.min(1, c[3] + .06)})` : isInk(c) ? "rgba(233,235,255,.6)" : isLightBg(c) && c[3] > .5 ? "rgba(255,255,255,.16)" : null);
      if (nv !== v) dark.push(`${p}:${nv}`);
      const nh = swap(v, c => isDarkLine(c) ? `rgba(14,26,58,${Math.min(1, c[3] * 2.6)})` : null);
      if (nh !== v) hcL.push(`${p}:${nh}`);
    } else if (p === "box-shadow") {
      const nv = swap(v, c => isInk(c) ? "rgba(0,0,0,.55)" : isLightBg(c) && c[3] > .5 ? "rgba(255,255,255,.1)" : null);
      if (nv !== v) dark.push(`box-shadow:${nv}`);
    }
  }
  return { dark, hcL, hcD };
}
let out = [`/* DIBUAT OTOMATIS oleh tools/buat-tema-gelap.js, jangan diedit tangan. Penyesuaian manual: css/26-pengaturan.css */`];
const emit = (items, wrap) => {
  for (const it of items) {
    if (it.kids) { const inner = []; emitTo(it.kids, inner); if (inner.length) out.push(`${it.at}{\n${inner.join("\n")}\n}`); continue }
    emitTo([it], out);
  }
};
function emitTo(items, sink) {
  for (const it of items) {
    if (it.kids) { const inner = []; emitTo(it.kids, inner); if (inner.length) sink.push(`${it.at}{${inner.join("")}}`); continue }
    if (/@|from|to|\d%/.test(it.sel) && !/[.#\[:a-z]/i.test(it.sel)) continue;
    if (SIDEBAR.test(it.sel)) continue;
    const { dark, hcL, hcD } = mapRule(it.sel, it.body);
    const S = (scope, d) => { const s = pref(it.sel, scope); if (s && d.length) sink.push(`${s}{${d.join(";")}}`) };
    /* :where() = specificity nol: urutan cascade sama dengan tema terang, jadi aturan yang lebih spesifik tetap menang */
    S(":where(html[data-theme=dark])", dark); S(":where(html.gl-hc[data-theme=light])", hcL); S(":where(html.gl-hc[data-theme=dark])", hcD);
  }
}
let n = 0;
/* lintasan pertama: kumpulkan variabel :root (yang terakhir menang, sama seperti cascade) */
for (const f of files) { const walk = items => items.forEach(it => { if (it.kids) return; if (/^(:root|html)$/.test(it.sel.trim())) decls(it.body).forEach(d => { if (d.p.startsWith("--")) VARS[d.p] = d.v }) }); walk(parse(fs.readFileSync(path.join(ROOT, f), "utf8"))) }
for (const f of files) { const before = out.length; out.push(`/* ${f} */`); emit(parse(fs.readFileSync(path.join(ROOT, f), "utf8"))); n += out.length - before - 1 }
fs.writeFileSync(path.join(ROOT, OUT), out.join("\n") + "\n");

/* ---------- css/28-kurangi-gerak.css: salinan semua blok @media (prefers-reduced-motion: reduce)
   untuk html.gl-reduce, supaya sakelar "Animasi antarmuka"/"Kurangi gerakan" di Pengaturan
   berefek sama persis dengan setelan perangkat ---------- */
const RM_OUT = "css/28-kurangi-gerak.css", RMQ = /prefers-reduced-motion\s*:\s*reduce/;
const rmSel = sel => splitTop(sel, ",").map(s => { s = s.trim(); if (/^(html|:root)\b/.test(s)) return s.replace(/^(html|:root)/, "html.gl-reduce"); return `:where(html.gl-reduce) ${s}` }).join(",");
const rmOut = [`/* DIBUAT OTOMATIS oleh tools/buat-tema-gelap.js dari blok @media (prefers-reduced-motion: reduce). Jangan diedit tangan. */`];
function rmWalk(items, inRM, sink) {
  for (const it of items) {
    if (it.kids) {
      if (RMQ.test(it.at)) { const rest = it.at.replace(/^@media\s*/, "").split(/\s+and\s+/i).filter(q => !RMQ.test(q)).join(" and "); const inner = []; rmWalk(it.kids, true, inner); if (inner.length) sink.push(rest ? `@media ${rest}{${inner.join("")}}` : inner.join("\n")) }
      else { const inner = []; rmWalk(it.kids, inRM, inner); if (inner.length) sink.push(`${it.at}{${inner.join("")}}`) }
    } else if (inRM) sink.push(`${rmSel(it.sel)}{${it.body}}`);
  }
}
for (const f of files) { const inner = []; rmWalk(parse(fs.readFileSync(path.join(ROOT, f), "utf8")), false, inner); if (inner.length) rmOut.push(`/* ${f} */`, ...inner) }
fs.writeFileSync(path.join(ROOT, RM_OUT), rmOut.join("\n") + "\n");
console.log(`${RM_OUT}: ${rmOut.length - 1} baris`);
console.log(`${OUT}: ${n} blok dari ${files.length} file CSS`);
