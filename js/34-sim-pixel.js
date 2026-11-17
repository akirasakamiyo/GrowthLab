/* Simulasi pixel HD (2026-11-14): runtime sprite tokoh 64x64 dan latar 320x150 untuk panggung simulasi (js/07-sim-stage.js).
   Aset digambar per piksel di js/35-sim-pixel-aset.js lewat SIMPX.char(...) dan SIMPX.bg(...) memakai GLPIX.grid.
   - SIMPX.has(id) / SIMPX.hasBg(sc): apakah aset pixel tersedia (kalau tidak, panggung memakai SVG/JPG lama).
   - SIMPX.frames(id, anim, opt): array data URI tiap frame (disimpan di cache).
   - SIMPX.bgURL(sc): data URI latar.
   - Pemutar: satu requestAnimationFrame menukar href <image class="pxs"> sesuai kelas pose-* di elemen .ch[data-px].
     Pose "still" atau prefers-reduced-motion menampilkan satu frame diam. */
window.SIMPX = (() => {
  const chars = {}, bgs = {}, cache = {}, bgCache = {};
  const char = (k, o) => { chars[k] = o }, bg = (k, o) => { bgs[k] = o };
  /* nama pose panggung -> nama animasi sprite; animasi yang tidak ada jatuh ke idle */
  const POSE = { idle: "idle", walkin: "walk", walk: "walk", nod: "nod", shake: "shake", surprised: "surprised", sad: "sad", happy: "happy", "angry-tense": "angry", thinking: "thinking" };
  const animOf = (id, pose) => { const a = chars[id] && chars[id].anims, n = POSE[pose] || "idle"; return a && a[n] ? n : "idle" };

  /* ganti warna kemeja hero per kasus: tiap hex di shirtRamp digeser ke warna target dengan selisih terang yang sama */
  const hex2hsl = h => { h = h.replace("#", ""); const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); let hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [hh * 60, s, l] };
  const hsl2hex = (h, s, l) => { const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0") }; return "#" + f(0) + f(8) + f(4) };
  const rampMap = (ramp, target) => {
    if (!ramp || !ramp.length || !target) return null;
    const L = ramp.map(c => hex2hsl(c)[2]), base = L[Math.floor(L.length / 2)], [th, ts, tl] = hex2hsl(target), m = {};
    ramp.forEach((c, i) => { const l = Math.max(.04, Math.min(.96, tl + (L[i] - base))); m[c.toLowerCase()] = hsl2hex(th, ts, l) });
    return m;
  };
  const optKey = o => o ? JSON.stringify([!!o.lan, o.shirt || ""]) : "";

  const frames = (id, anim, opt) => {
    const o = chars[id]; if (!o) return [];
    const key = id + "|" + anim + "|" + optKey(opt); if (cache[key]) return cache[key];
    const A = o.anims[anim] || o.anims.idle, map = opt && opt.shirt ? rampMap(o.shirtRamp, opt.shirt) : null, out = [];
    for (let f = 0; f < A.frames; f++) {
      const g = GLPIX.grid(o.w, o.h); A.draw(g, f, opt || {});
      if (map) for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) { const c = g.g[y][x]; if (c && map[String(c).toLowerCase()]) g.g[y][x] = map[String(c).toLowerCase()] }
      out.push(g.png().toDataURL("image/png"));
    }
    return cache[key] = out;
  };
  const bgURL = sc => { if (bgCache[sc]) return bgCache[sc]; const o = bgs[sc]; if (!o) return ""; const g = GLPIX.grid(o.w, o.h); o.draw(g); return bgCache[sc] = g.png().toDataURL("image/png") };
  /* frame yang dipakai saat diam: idle = frame pertama, pose lain = frame tengah (pose paling terbaca) */
  const stillFrame = (anim, n) => anim === "idle" || anim === "walk" ? 0 : Math.floor(n / 2);

  /* ---------- pemutar ---------- */
  const RM = matchMedia("(prefers-reduced-motion:reduce)");
  let raf = 0;
  const optOf = el => { try { return JSON.parse(el.dataset.pxo || "null") } catch (_) { return null } };
  const tick = now => {
    raf = 0; let live = 0;
    document.querySelectorAll(".ch[data-px]").forEach(el => {
      const img = el.querySelector("image.pxs"); if (!img) return;
      const cls = el.getAttribute("class") || "", m = /pose-([a-z-]+)/.exec(cls), pose = m ? m[1] : "idle", id = el.dataset.px;
      const anim = animOf(id, pose), opt = optOf(el), fr = frames(id, anim, opt), A = chars[id].anims[anim];
      if (!fr.length) return;
      const still = /\bstill\b/.test(cls) || RM.matches;
      if (el._anim !== anim) { el._anim = anim; el._t0 = now }
      const i = still ? stillFrame(anim, fr.length) : Math.floor((now - el._t0) / (1000 / (A.fps || 8))) % fr.length;
      if (el._i !== i || el._src !== fr[i]) { el._i = i; el._src = fr[i]; img.setAttribute("href", fr[i]) }
      if (!still && el.isConnected) live++;
    });
    if (live) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick) };
  if ("MutationObserver" in window) new MutationObserver(ms => { if (ms.some(m => m.type === "attributes" ? m.target.matches && m.target.matches(".ch[data-px]") : [...m.addedNodes].some(n => n.querySelector && (n.matches?.(".ch[data-px]") || n.querySelector(".ch[data-px]"))))) kick() })
    .observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });

  /* SVG tokoh untuk panggung 640x300: sprite 64x64 diperbesar 4x, kaki (baris 61) di titik (0,0) kelompok .chw.
     .hd = kotak kepala tak terlihat, dipakai panggung untuk posisi efek (keringat, bintang) */
  const Z = 3.4;   /* 64 px x 3,4 = tokoh setinggi ~185 dari panggung 300, supaya balon kata di atas kepala tidak menutupi wajah */
  const svgChar = (id, who, o, still) => {
    const c = chars[who], anim = "idle", fr = frames(who, anim, o.opt), foot = c.foot ?? 61;
    return `<g class="ch pose-idle ex-neutral${still ? " still" : ""}" data-ch="${id}" data-px="${who}"${o.opt ? ` data-pxo='${JSON.stringify(o.opt)}'` : ""}>
<image class="pxs" href="${fr[0] || ""}" x="${-c.w / 2 * Z}" y="${-(foot + 1) * Z}" width="${c.w * Z}" height="${c.h * Z}" preserveAspectRatio="none" style="image-rendering:pixelated;image-rendering:crisp-edges"/>
<rect class="hd" x="-44" y="-197" width="88" height="82" fill="none"/></g>`;
  };
  return { char, bg, chars, bgs, has: k => !!chars[k], hasBg: k => !!bgs[k], frames, bgURL, svgChar, kick, POSE };
})();
