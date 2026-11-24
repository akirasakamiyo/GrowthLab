/* Ilustrasi doodle pixel (2026-11-13), menggantikan ilustrasi garis di bingkai hero halaman.
   Tiap adegan digambar ke grid 78x60 piksel (rasio bingkai 1,3): satu lapisan latar diam + beberapa sprite pixel
   yang digerakkan halus (60 fps, easing) dengan requestAnimationFrame, hanya saat terlihat. Tidak ada aset tambahan.
   Pakai: GLPIX.has(kunci), GLPIX.html(kunci, warnaLatar) (dekoratif, aria-hidden).
   Format adegan: lihat komentar di atas def(). */
window.GLPIX = (() => {
  const W = 78, H = 60;
  const C = { K: "#1b1740", O: "#ff5a3c", Y: "#ffd23f", T: "#14b8a6", V: "#7c5cff", W: "#ffffff", N: "#0a1a6b",
    OD: "#d93d22", YD: "#e8a91a", TD: "#0e8a7c", VD: "#5b3fd6", WD: "#dfe6ff", BR: "#b5652b", BD: "#7d3f17",
    SK: "#f2b48a", SKD: "#d98a5f", HB: "#7a3b1d", PK: "#ff9ec4", G: "#9aa3c7" };
  const hex = c => { c = c.replace("#", ""); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)) };
  const toHex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)) };
  const lt = (c, t = .25) => mix(c, "#ffffff", t), dk = (c, t = .25) => mix(c, "#000000", t);
  /* huruf pixel 3x5 */
  const FONT = { A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "101111111111101", O: "010101101101010", P: "110101110100100", Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010", U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010", Z: "111001010100111", "?": "110001010000010", "!": "010010010000010", "0": "111101101101111", "1": "010110010010111", "2": "110001010100111", "3": "110001010001110", "4": "101101111001001", "5": "111100110001110", "6": "011100111101111", "7": "111001010010010", "8": "111101111101111", "9": "111101111001110", "+": "000010111010000", "-": "000000111000000", ".": "000000000000010", ":": "000010000010000", " ": "000000000000000" };

  function grid(w = W, h = H) {
    const W = w, H = h;
    const g = Array.from({ length: H }, () => Array(W).fill(null));
    const p = {
      W, H, g, C, mix, lt, dk,
      get(x, y) { x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < W && y < H ? g[y][x] : null },
      set(x, y, c) { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c; return p },
      fill(c) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y][x] = c; return p },
      /* kotak; ink = garis tepi 1px; r = sudut dipotong (1 atau 2) */
      rect(x, y, w, h, c, ink, r = 0) {
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
          const cx = Math.min(i, w - 1 - i), cy = Math.min(j, h - 1 - j);
          if (r && cx + cy < r) continue;
          const edge = i == 0 || j == 0 || i == w - 1 || j == h - 1 || (r && cx + cy == r);
          p.set(x + i, y + j, ink && edge ? ink : c);
        } return p
      },
      circ(cx, cy, r, c, ink) {
        for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = x * x + y * y; if (d <= r * r + r * .8) p.set(cx + x, cy + y, ink && d > (r - 1) * (r - 1) + (r - 1) * .8 ? ink : c) }
        return p
      },
      ell(cx, cy, rx, ry, c, ink) {
        for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) { const d = (x * x) / (rx * rx) + (y * y) / (ry * ry); if (d <= 1.05) { const e = ((Math.abs(x) + 1) ** 2) / (rx * rx) + (y * y) / (ry * ry) > 1.05 || (x * x) / (rx * rx) + ((Math.abs(y) + 1) ** 2) / (ry * ry) > 1.05; p.set(cx + x, cy + y, ink && e ? ink : c) } }
        return p
      },
      line(x0, y0, x1, y1, c, t = 1) {
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 || 1;
        for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; for (let a = 0; a < t; a++) for (let b = 0; b < t; b++) p.set(x + a - (t >> 1), y + b - (t >> 1), c) }
        return p
      },
      /* garis tebal bertepi tinta (kayu, tiang, tangkai) */
      stick(x0, y0, x1, y1, c, ink = C.K) { return p.line(x0, y0, x1, y1, ink, 3).line(x0, y0, x1, y1, c, 1) },
      poly(P, c, ink) {
        const ys = P.map(q => q[1]);
        for (let y = Math.min(...ys); y <= Math.max(...ys); y++) { const xs = []; for (let i = 0; i < P.length; i++) { const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length]; if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + (y - ay) * (bx - ax) / (by - ay)) } xs.sort((a, b) => a - b); for (let k = 0; k < xs.length; k += 2) for (let x = Math.ceil(xs[k]); x <= Math.floor(xs[k + 1]); x++) p.set(x, y, c) }
        if (ink) for (let i = 0; i < P.length; i++) p.line(P[i][0], P[i][1], P[(i + 1) % P.length][0], P[(i + 1) % P.length][1], ink);
        return p
      },
      /* sprite teks: tiap karakter kunci palet, '.' kosong */
      spr(x, y, rows, pal) { rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== "." && pal[ch]) p.set(x + i, y + j, pal[ch]) })); return p },
      text(x, y, s, c, scale = 1) {
        [...String(s).toUpperCase()].forEach((ch, k) => { const f = FONT[ch] || FONT[" "]; for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (f[j * 3 + i] == "1") for (let a = 0; a < scale; a++) for (let b = 0; b < scale; b++) p.set(x + (k * 4 + i) * scale + a, y + j * scale + b, c) });
        return p
      },
      textW: (s, scale = 1) => (String(s).length * 4 - 1) * scale,
      /* bayangan cel di tepi kanan-bawah tiap bidang warna (map: warna -> warna gelap), dalam kotak opsional */
      shade(map, box = [0, 0, W, H], d = 2) {
        const src = g.map(r => r.slice()); const [bx, by, bw, bh] = box;
        for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) { const c = src[y] && src[y][x]; if (!map[c]) continue; const n = src[y + d] && src[y + d][x + d]; if (n !== c && n !== map[c]) p.set(x, y, map[c]) }
        return p
      },
      /* bintang kecil berkedip, ukuran 1 atau 2 */
      star(x, y, c, s = 1) { p.set(x, y, c); for (let k = 1; k <= s + 1; k++) p.set(x - k, y, c).set(x + k, y, c).set(x, y - k, c).set(x, y + k, c); return p },
      /* latar: warna halaman + titik dither + awan/lantai opsional */
      bg(c, o = {}) {
        p.fill(c); const d = lt(c, .18);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x * 7 + y * 13) % 23 == 0) p.set(x, y, d);
        if (o.floor != null) { const f = o.floorC || dk(c, .18); p.rect(0, o.floor, W, H - o.floor, f); p.line(0, o.floor, W - 1, o.floor, C.K); for (let x = 3; x < W; x += 9) p.set(x, o.floor + 3 + (x % 3), dk(f, .15)).set(x + 1, o.floor + 3 + (x % 3), dk(f, .15)) }
        return p
      },
      cloud(x, y) { return p.rect(x + 2, y, 8, 2, C.W).rect(x, y + 2, 14, 3, C.W).rect(x + 1, y + 5, 12, 1, C.WD) },
      /* tokoh kecil (kepala + badan), tinggi kira-kira 20px; o: {hair, shirt, mouth:'smile'|'open'|'o', blink, arm:'up'|'wave'} */
      kid(x, y, o = {}) {
        const sh = o.shirt || C.O, hr = o.hair || C.K;
        p.rect(x - 7, y + 10, 15, 10, sh, C.K, 2); p.shade({ [sh]: dk(sh, .2) }, [x - 7, y + 10, 15, 10], 2);
        p.circ(x, y + 3, 6, C.SK, C.K);
        p.rect(x - 5, y - 3, 11, 3, hr).set(x - 6, y - 1, hr).set(x + 6, y - 1, hr).set(x - 6, y, hr).set(x + 6, y, hr);
        if (o.hair2) p.set(x - 6, y + 1, hr).set(x + 6, y + 1, hr).set(x - 6, y + 2, hr).set(x + 6, y + 2, hr);
        if (o.blink) p.set(x - 2, y + 3, C.K).set(x - 3, y + 3, C.K).set(x + 2, y + 3, C.K).set(x + 3, y + 3, C.K);
        else p.set(x - 2, y + 3, C.K).set(x + 2, y + 3, C.K);
        if (o.mouth == "open") p.rect(x - 1, y + 5, 3, 2, C.K); else if (o.mouth == "o") p.set(x, y + 6, C.K); else p.set(x - 1, y + 6, C.K).set(x, y + 6, C.K).set(x + 1, y + 6, C.K).set(x - 2, y + 5, C.K).set(x + 2, y + 5, C.K);
        p.set(x - 4, y + 5, C.PK).set(x + 4, y + 5, C.PK);
        if (o.arm == "up") p.stick(x + 7, y + 12, x + 11, y + 4, sh);
        if (o.arm == "wave") p.stick(x + 7, y + 12, x + 12, y + 6, sh).set(x + 12, y + 5, C.SK);
        return p
      },
      png() {
        const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const cx = cv.getContext("2d");
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x]) { cx.fillStyle = g[y][x]; cx.fillRect(x, y, 1, 1) }
        return cv
      }
    };
    return p;
  }

  /* ---------- easing (u = 0..1) ---------- */
  const cl = u => u < 0 ? 0 : u > 1 ? 1 : u;
  const E = {
    cl, lin: u => cl(u),
    seg: (u, a, b) => cl((u - a) / (b - a)),                 /* bagian waktu a..b dinormalkan ke 0..1 */
    io: u => (u = cl(u), u < .5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2),
    out: u => (u = cl(u), 1 - (1 - u) ** 3),
    in: u => (u = cl(u), u * u * u),
    expo: u => (u = cl(u), u == 1 ? 1 : 1 - 2 ** (-10 * u)),
    back: u => (u = cl(u), 1 + 2.70158 * (u - 1) ** 3 + 1.70158 * (u - 1) ** 2),
    spring: (u, f = 3, d = 6) => (u = cl(u), 1 - Math.exp(-d * u) * Math.cos(f * 2 * Math.PI * u)),  /* 0 -> 1 dengan pantulan */
    wob: (u, f = 3, d = 5) => (u = cl(u), Math.exp(-d * u) * Math.sin(f * 2 * Math.PI * u)),      /* getaran meredam, mulai & akhir 0 */
    sin: (u, n = 1) => Math.sin(u * n * 2 * Math.PI),
    lerp: (a, b, t) => a + (b - a) * t
  };

  /* ---------- adegan berlapis ----------
     def(kunci, {dur, still, base(p,c), parts:[{w,h,ax,ay,frames,draw(q,c,f), at(u,t,c)}], fg(p,c)})
     base: lapisan diam (latar sudah dicat p.bg(c)). parts: sprite pixel kecil yang digerakkan HALUS tiap frame layar (60 fps):
     at(u) mengembalikan {x,y (posisi titik poros ax,ay dalam koordinat grid, boleh pecahan), r (derajat), s|sx|sy (skala), o (opasitas), f (indeks bingkai sprite)}.
     w, h: ukuran grid adegan (bawaan 78x60; kartu pelajaran memakai 90x30).
     fg: lapisan diam di atas semua part (opsional). still: nilai u untuk tampilan tanpa gerak (prefers-reduced-motion). */
  const S = {}, cache = {};
  const def = (k, o) => { S[k] = o };
  const url = q => q.png().toDataURL("image/png");
  const build = (k, c) => {
    const id = k + c; if (cache[id]) return cache[id];
    const s = S[k], gw = s.w || W, gh = s.h || H, b = grid(gw, gh); b.bg(c); s.base && s.base(b, c);
    const parts = (s.parts || []).map(pt => { const urls = []; for (let f = 0; f < (pt.frames || 1); f++) { const q = grid(pt.w, pt.h); pt.draw(q, c, f); urls.push(url(q)) } return { pt, urls } });
    let fg = null; if (s.fg) { const q = grid(gw, gh); s.fg(q, c); fg = url(q) }
    return cache[id] = { s, base: url(b), parts, fg };
  };
  const html = (k, c) => {
    const m = build(k, c);
    return `<div class="pxl" data-px="${k}" data-c="${c}" aria-hidden="true"><img class="pxb" src="${m.base}" alt="">${m.parts.map(({ pt, urls }, i) => `<img class="pxp" data-i="${i}" src="${urls[0]}" alt="" style="transform-origin:${pt.ax || 0}px ${pt.ay || 0}px">`).join("")}${m.fg ? `<img class="pxb" src="${m.fg}" alt="">` : ""}</div>`;
  };
  /* ---------- pemutar: satu requestAnimationFrame untuk semua adegan yang terlihat ---------- */
  const RM = matchMedia("(prefers-reduced-motion:reduce)");
  const live = new Set(); let raf = 0;
  const pose = (el, u, t) => {
    const m = el._m, k = el._k; if (!k) return;
    m.parts.forEach(({ pt, urls }, i) => {
      const img = el._imgs[i], a = pt.at ? pt.at(u, t, el._c) : {}, x = a.x ?? pt.ax ?? 0, y = a.y ?? pt.ay ?? 0;
      const sx = a.sx ?? a.s ?? 1, sy = a.sy ?? a.s ?? 1, ax = pt.ax || 0, ay = pt.ay || 0;
      img.style.width = pt.w * k + "px"; img.style.height = pt.h * k + "px"; img.style.transformOrigin = `${ax * k}px ${ay * k}px`;
      img.style.transform = `translate(${((x - ax) * k).toFixed(2)}px,${((y - ay) * k).toFixed(2)}px) rotate(${(a.r || 0).toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      img.style.opacity = a.o ?? 1;
      const f = Math.max(0, Math.min(urls.length - 1, a.f | 0)); if (img._f !== f) { img._f = f; img.src = urls[f] }
    });
  };
  const tick = now => {
    raf = 0; if (!live.size) return;
    live.forEach(el => { const d = el._m.s.dur || 3, t = (now / 1000) % d; pose(el, t / d, t) });
    raf = requestAnimationFrame(tick);
  };
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !RM.matches) { live.add(e.target); if (!raf) raf = requestAnimationFrame(tick) } else live.delete(e.target);
  }), { rootMargin: "80px" }) : null;
  const ro = "ResizeObserver" in window ? new ResizeObserver(es => es.forEach(e => { const el = e.target; if (!el._m) return; el._k = el.clientWidth / (el._m.s.w || W); if (!live.has(el)) still(el) })) : null;
  const still = el => { const s = el._m.s, u = s.still ?? 0; pose(el, u, u * (s.dur || 3)) };
  const bind = el => {
    if (el._m) return; el._m = build(el.dataset.px, el.dataset.c); el._c = el.dataset.c; el._imgs = [...el.querySelectorAll(".pxp")]; el._k = el.clientWidth / (el._m.s.w || W);
    still(el); ro && ro.observe(el); io && io.observe(el);
  };
  const scan = () => document.querySelectorAll(".pxl[data-px]").forEach(bind);
  if ("MutationObserver" in window) new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", scan); scan();
  return { def, html, has: k => !!S[k], grid, build, pose, C, E, W, H, S };
})();

/* ===================== ADEGAN ===================== */
(() => {
  const { C, E } = GLPIX, { K, O, Y, W, BR, OD, YD, WD } = C;
  const starSpr = col => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 2) });
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  /* Tujuan belajar: panah melesat dari kanan, menancap di pusat sasaran, sasaran bergetar, bintang meletup */
  GLPIX.def("tujuan", {
    dur: 3.2, still: .6,
    base(p, c) {
      const gr = p.dk(c, .2); p.rect(0, 46, 78, 14, gr); p.line(0, 46, 77, 46, K);
      for (let x = 2; x < 78; x += 7) p.set(x, 45, p.dk(gr, .15)).set(x + 1, 44, p.dk(gr, .15)).set(x + 2, 45, p.dk(gr, .15));
      p.stick(26, 34, 20, 50, BR); p.stick(38, 34, 44, 50, BR); p.rect(16, 49, 32, 2, p.dk(gr, .2));
    },
    parts: [
      { w: 15, h: 6, ax: 7, ay: 3, draw: q => q.cloud(0, 0), at: u => ({ x: 11 + 2.5 * E.sin(u), y: 9 }) },
      { w: 15, h: 6, ax: 7, ay: 3, draw: q => q.cloud(0, 0), at: u => ({ x: 65 - 2 * E.sin(u), y: 13 }) },
      { w: 39, h: 39, ax: 19, ay: 19,
        draw(q) { [[19, K], [18, O], [15, K], [14, W], [11, K], [10, O], [7, K], [6, Y]].forEach(([r, col]) => q.circ(19, 19, r, col)); q.shade({ [O]: OD, [W]: WD, [Y]: YD }); q.rect(7, 6, 3, 1, W).rect(6, 7, 1, 2, W) },
        at: u => { const w = E.wob(E.seg(u, .28, .8), 3, 4); return { x: 32 + w * 1.2, y: 26, r: w * 7, sx: 1 + w * .04, sy: 1 - w * .04 } } },
      /* panah horizontal (ujung di kiri), diputar -23 derajat */
      { w: 34, h: 9, ax: 0, ay: 4,
        draw(q) { q.line(1, 4, 27, 4, K, 3).line(1, 4, 27, 4, BR, 1); q.poly([[0, 4], [3, 1], [3, 7]], "#c9d2f0", K);
          q.poly([[24, 4], [29, 0], [33, 0], [29, 4]], O, K); q.poly([[24, 4], [29, 8], [33, 8], [29, 4]], W, K) },
        at: u => { const fly = E.seg(u, .04, .28) ** 1.6, w = E.wob(E.seg(u, .28, .8), 3, 4), out = E.seg(u, .86, .98);
          return { x: E.lerp(98, 33, fly) + w * 1.2, y: E.lerp(-5, 25, fly), r: -23 + w * 9, o: 1 - out } } },
      { w: 14, h: 9, ax: 0, ay: 4, draw: q => { q.line(2, 1, 13, 1, W); q.line(0, 4, 9, 4, W); q.line(3, 7, 12, 7, W) },
        at: u => { const fly = E.seg(u, .04, .28) ** 1.6; return { x: E.lerp(98, 33, fly) + 30, y: E.lerp(-5, 25, fly) - 11, r: -23, o: u < .27 && u > .05 ? .8 : 0 } } },
      { ...starSpr(Y), at: u => ({ x: 55, y: 10, ...pop(u, .3, .4, .7, .8) }) },
      { ...starSpr(W), at: u => ({ x: 13, y: 12, ...pop(u, .34, .44, .72, .82) }) },
      { ...starSpr(W), at: u => ({ x: 59, y: 33, ...pop(u, .38, .48, .74, .84) }) }
    ]
  });
})();

/* ---- el ---- */
(() => { const { C, E } = GLPIX;
  /* Katalog e-learning: kartu pelajaran di layar laptop naik-turun bergelombang, kursor meluncur dan mengklik kartu kuning,
     kartu memantul naik dengan lencana centang, lalu semuanya kembali tenang */
  const { K, O, Y, T, W, N, WD, G, BR, BD, OD, YD, TD } = C;
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  const bz = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  const cols = [[O, OD], [Y, YD], [T, TD]];
  const icons = [
    ["K....", "KK...", "KKK..", "KK...", "K...."],
    [".KKK.", "K...K", "K...K", ".KKK.", ".K.K."],
    ["KKKKK", "K...K", "KKKKK", ".K...", "K...."]
  ];
  const wave = (u, i) => 3 * Math.sin(Math.PI * E.io(E.seg(u, .04 + i * .08, .3 + i * .08)));
  const sel = u => E.spring(E.seg(u, .6, .8), 1.6, 5) * (1 - E.io(E.seg(u, .84, .97)));
  const press = u => Math.sin(Math.PI * E.seg(u, .555, .61));
  const lift = (u, i) => wave(u, i) + (i == 1 ? 5 * sel(u) : 0);
  const starSpr = (col, x, y, ph) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 2),
    at: u => ({ x, y, s: .65 + .35 * (.5 + .5 * E.sin(u + ph, 2)) }) });
  const card = i => ({ w: 12, h: 18, ax: 6, ay: 17, frames: i == 1 ? 2 : 1,
    draw(q, c, f) {
      const [col, cd] = cols[i];
      q.rect(0, 0, 12, 18, W, K, 1);
      q.rect(1, 1, 10, 7, col); q.line(1, 8, 10, 8, K);
      q.set(0, 1, K).set(1, 0, K);
      q.spr(4, 2, icons[i], { K });
      q.line(2, 10, 9, 10, G); q.line(2, 12, 7, 12, G);
      q.rect(2, 14, 8, 2, WD); q.rect(2, 14, f ? 8 : [6, 3, 5][i], 2, col);
      q.shade({ [W]: WD, [col]: cd }, [0, 0, 12, 18], 1);
      q.set(2, 2, q.lt(col, .55)).set(3, 2, q.lt(col, .55)).set(2, 3, q.lt(col, .55));
    },
    at(u) {
      const wv = E.seg(u, .04 + i * .08, .3 + i * .08), st = .06 * Math.sin(2 * Math.PI * E.io(wv));
      const pr = i == 1 ? press(u) : 0, sp = i == 1 ? E.wob(E.seg(u, .6, .86), 2, 5) : 0;
      return { x: 19 + i * 15, y: 35 - lift(u, i), sx: 1 + .14 * pr - .08 * sp - st * .5, sy: 1 - .16 * pr + .1 * sp + st, f: i == 1 && u > .6 && u < .965 ? 1 : 0 };
    } });
  const shadow = i => ({ w: 10, h: 2, ax: 5, ay: 0, draw: q => q.rect(0, 0, 10, 2, q.mix(WD, G, .45), null, 1),
    at: u => { const l = lift(u, i); return { x: 19 + i * 15, y: 37, sx: Math.min(1, .3 + l / 6), o: Math.min(1, l / 1.5) } } });
  const steam = k => ({ w: 3, h: 5, ax: 1, ay: 4, draw: q => q.set(1, 0, W).set(0, 1, W).set(1, 2, W).set(2, 3, W).set(1, 4, W),
    at: u => { const ph = (u * 2 + k * .5) % 1; return { x: 68 + k * 3 + .7 * Math.sin(2 * Math.PI * (ph + k * .3)), y: 35 - 5 * ph, o: .85 * Math.sin(Math.PI * ph) } } });

  GLPIX.def("el", {
    dur: 4, still: .7,
    base(p, c) {
      /* meja kayu */
      p.rect(0, 47, 78, 13, BR); p.line(0, 47, 77, 47, K); p.line(0, 48, 77, 48, p.lt(BR, .25));
      for (let x = 5; x < 78; x += 11) p.line(x, 52 + (x % 3), x + 4, 52 + (x % 3), BD);
      /* layar laptop */
      p.rect(9, 5, 50, 38, N, K, 2);
      p.set(33, 6, G).set(34, 6, G);
      p.rect(12, 8, 44, 32, W);
      p.rect(12, 8, 44, 3, WD); p.set(14, 9, O).set(16, 9, Y).set(18, 9, T);
      p.rect(36, 9, 18, 1, p.mix(WD, G, .5));
      p.set(11, 7, p.lt(N, .35)).set(12, 6, p.lt(N, .35));
      /* engsel + alas */
      p.poly([[6, 43], [62, 43], [65, 47], [3, 47]], WD, K);
      p.line(7, 44, 61, 44, W); p.line(5, 46, 63, 46, G);
      p.rect(28, 44, 12, 1, G);
      /* mug */
      p.rect(66, 37, 8, 10, T, K, 1);
      p.set(74, 39, K).set(75, 40, K).set(75, 41, K).set(75, 42, K).set(74, 43, K);
      p.rect(67, 40, 6, 2, W); p.shade({ [T]: TD, [W]: WD }, [66, 37, 8, 10], 1);
      p.set(67, 38, p.lt(T, .5));
    },
    parts: [
      starSpr(Y, 66, 10, 0), starSpr(W, 71, 24, .35),
      steam(0), steam(1),
      shadow(0), shadow(1), shadow(2),
      card(0), card(1), card(2),
      /* lencana centang di kartu terpilih */
      { w: 9, h: 9, ax: 4, ay: 4,
        draw(q) { q.circ(4, 4, 4, T, K); q.set(2, 4, W).set(3, 5, W).set(4, 4, W).set(5, 3, W).set(6, 2, W); q.set(2, 2, q.lt(T, .5)) },
        at: u => { const a = pop(u, .63, .71, .84, .92), w = E.wob(E.seg(u, .7, .9), 2, 4); return { x: 40, y: 35 - lift(u, 1) - 17, o: a.o, sx: a.s * (1 + .12 * w), sy: a.s * (1 - .12 * w) } } },
      { ...starSpr(O, 0, 0, 0), at: u => ({ x: 25, y: 14, ...pop(u, .62, .7, .8, .88) }) },
      { ...starSpr(T, 0, 0, 0), at: u => ({ x: 50, y: 14, ...pop(u, .65, .73, .82, .9) }) },
      /* kursor */
      { w: 7, h: 11, ax: 0, ay: 0,
        draw: q => q.spr(0, 0, ["K......", "KK.....", "KWK....", "KWWK...", "KWWWK..", "KWWWWK.", "KWWWWWK", "KWWKKKK", "KWKKWK.", "KK.KWK.", "....KK."], { K, W }),
        at(u) {
          let x, y, r;
          if (u < .56) { const t = E.io(E.seg(u, .3, .56)); x = bz(84, 60, 36, t); y = bz(36, 46, 29, t); r = -14 * Math.sin(Math.PI * t) }
          else { const t = E.io(E.seg(u, .8, .97)); x = bz(36, 58, 84, t); y = bz(29, 16, 22, t); r = 12 * Math.sin(Math.PI * t) }
          return { x, y, r, s: 1 - .2 * press(u) };
        } }
    ]
  });
})();

/* ---- kontak ---- */
(() => { const { C, E } = GLPIX;
  /* Kontak: surat keluar dari amplop, berubah jadi pesawat kertas, meluncur melengkung (berputar mengikuti arah terbang)
     dengan jejak titik, masuk ke layar ponsel; ponsel bergoyang dan hati meletup */
  const { K, O, Y, T, W, N, WD, G, OD, YD, TD, PK } = C;
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  const bz = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  const P0 = [21, 13], P1 = [42, -2], P2 = [62, 23];
  const fl = u => E.io(E.seg(u, .33, .62));
  const bob = u => .8 * E.sin(u, 2);
  const kick = u => Math.sin(Math.PI * E.seg(u, .2, .34));
  const PAPER = "#fff6dc";
  const envAt = u => ({ x: 21, y: 47 + bob(u), sx: 1 + .08 * kick(u), sy: 1 - .1 * kick(u) });
  const rise = u => 14 * E.back(E.seg(u, .05, .19)) + 12 * E.io(E.seg(u, .2, .3));
  const dots = [.12, .21, .3, .39, .48, .57, .66, .75, .84];
  const starSpr = (col, x, y, ph) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 2),
    at: u => ({ x, y, s: .6 + .4 * (.5 + .5 * E.sin(u + ph, 2)) }) });

  GLPIX.def("kontak", {
    dur: 4.2, still: .72,
    base(p, c) {
      const gr = p.dk(c, .2); p.rect(0, 48, 78, 12, gr); p.line(0, 48, 77, 48, K);
      for (let x = 4; x < 78; x += 8) p.set(x, 52 + (x % 3), p.dk(gr, .15)).set(x + 1, 52 + (x % 3), p.dk(gr, .15));
      p.rect(8, 49, 28, 2, p.dk(gr, .22)); p.rect(55, 49, 18, 2, p.dk(gr, .22));
    },
    parts: [
      { w: 15, h: 6, ax: 7, ay: 3, draw: q => q.cloud(0, 0), at: u => ({ x: 10 + 1.5 * E.sin(u), y: 7 }) },
      starSpr(Y, 40, 26, 0), starSpr(W, 46, 41, .4),
      /* amplop: bagian belakang + tutup terbuka */
      { w: 31, h: 30, ax: 15, ay: 28,
        draw(q) {
          q.rect(1, 11, 29, 18, q.dk(WD, .12), K);
          q.poly([[1, 11], [29, 11], [15, 1]], Y, K);
          q.shade({ [Y]: YD }, [0, 0, 31, 12], 1); q.set(14, 4, q.lt(Y, .5)).set(15, 3, q.lt(Y, .5));
        },
        at: envAt },
      /* surat */
      { w: 21, h: 16, ax: 10, ay: 15,
        draw(q) {
          q.rect(0, 0, 21, 16, PAPER, K, 1);
          q.line(3, 3, 13, 3, G); q.line(3, 5, 17, 5, G); q.line(3, 7, 15, 7, G);
          q.spr(14, 9, [".O.O.", "OOOOO", ".OOO.", "..O.."], { O });
        },
        at(u) {
          const e = envAt(u), out = E.in(E.seg(u, .25, .3)), back = E.back(E.seg(u, .86, .96));
          const gone = u > .3 && u < .86;
          return { x: 21, y: e.y - (gone ? 0 : rise(u) * (u < .86 ? 1 : 0)), sx: gone ? .001 : (u < .86 ? 1 - out : back), sy: 1, o: gone ? 0 : 1 };
        } },
      /* amplop: kantong depan */
      { w: 31, h: 30, ax: 15, ay: 28,
        draw(q) {
          q.poly([[1, 11], [15, 20], [29, 11], [29, 28], [1, 28]], W, K);
                    q.shade({ [W]: WD }, [0, 0, 31, 30], 2);
          q.spr(12, 19, [".K.K.", "KOKOK", "KOOOK", ".KOK.", "..K.."], { K, O }); q.set(13, 20, W);
          q.rect(23, 22, 4, 4, T, K); q.set(24, 23, q.lt(T, .5));
        },
        at: envAt },
      /* jejak titik */
      ...dots.map(t => ({ w: 2, h: 2, ax: 1, ay: 1, draw: (q, c) => q.rect(0, 0, 2, 2, q.lt(c, .72)),
        at: u => { const k = E.cl((fl(u) - t) * 9); return { x: bz(P0[0], P1[0], P2[0], t), y: bz(P0[1], P1[1], P2[1], t), s: Math.max(.001, E.back(k) * (1 - E.io(E.seg(u, .7 + t * .1, .8 + t * .1)))), o: k > 0 && u < .9 ? 1 : 0 } } })),
      /* ponsel */
      { w: 19, h: 34, ax: 9, ay: 33,
        draw(q) {
          q.rect(0, 0, 19, 34, N, K, 2);
          q.rect(2, 4, 15, 24, T);
          q.line(7, 2, 11, 2, q.lt(N, .4)); q.rect(8, 30, 3, 1, q.lt(N, .4));
          q.shade({ [T]: TD }, [2, 4, 15, 24], 1);
          q.rect(4, 7, 8, 4, W, null, 1); q.rect(7, 13, 8, 4, Y, null, 1); q.rect(4, 19, 6, 4, W, null, 1);
          q.set(1, 3, q.lt(N, .4)).set(1, 4, q.lt(N, .4));
        },
        at(u) { const w = E.wob(E.seg(u, .61, .92), 3, 4); return { x: 63, y: 47, r: 6 * w, sx: 1 - .05 * w, sy: 1 + .05 * w } } },
      /* hati yang meletup dari ponsel */
      { w: 9, h: 8, ax: 4, ay: 4,
        draw: q => q.spr(0, 0, [".KK.KK.", "KOOKOOK", "KOWOOOK", "KOOOOOK", ".KOOOK.", "..KOK..", "...K..."].map(r => r + ".."), { K, O, W }),
        at(u) { const a = pop(u, .63, .71, .86, .95), m = E.out(E.seg(u, .66, .9)); return { x: 63 + 1.5 * Math.sin(m * 6), y: E.lerp(28, 11, m), s: a.s * (1 + .15 * E.sin(u, 4)), o: a.o } } },
      { ...starSpr(Y, 0, 0, 0), at: u => ({ x: 52, y: 15, ...pop(u, .64, .72, .8, .88) }) },
      { ...starSpr(W, 0, 0, 0), at: u => ({ x: 73, y: 19, ...pop(u, .67, .75, .82, .9) }) },
      /* pesawat kertas */
      { w: 15, h: 11, ax: 7, ay: 6,
        draw: q => q.spr(0, 0, [
          "KK.............",
          "KWKK...........",
          ".KWWKK.........",
          ".KWWWWKK.......",
          "..KWWWWWKK.....",
          "..KWWWWWWWKK...",
          "...KWWWWWWWWKK.",
          "...KKKKKKKKKKKK",
          "....KDDDDDDKK..",
          "....KDDDKK.....",
          ".....KKK......."], { K, W, D: WD }),
        at(u) {
          if (u < .33) { const a = E.back(E.seg(u, .3, .33)); return { x: P0[0], y: P0[1], r: Math.atan2(P1[1] - P0[1], P1[0] - P0[0]) * 180 / Math.PI + 4 * E.sin(u, 5), sx: Math.max(.001, a), sy: 1, o: u > .3 ? 1 : 0 } }
          const t = fl(u), x = bz(P0[0], P1[0], P2[0], t), y = bz(P0[1], P1[1], P2[1], t);
          const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]), dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
          const s = 1 - .9 * E.in(E.seg(u, .5, .62)) - .1 * E.seg(u, .62, .64);
          return { x, y, r: Math.atan2(dy, dx) * 180 / Math.PI + 4 * E.sin(u, 5), s: Math.max(.001, s), o: u < .64 ? 1 : 0 };
        } }
    ]
  });
})();

/* ---- faq ---- */
(() => { const { C, E } = GLPIX;
  /* FAQ: gelembung bicara besar dengan "?" yang bergoyang pegas, gelembung "?" oranye dan "!" kuning meletup lalu melayang,
     bohlam ide menyala di akhir */
  const { K, O, Y, T, W, V, VD, WD, G, OD, YD } = C;
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  /* garis tepi tinta 1px di sekeliling semua piksel berwarna */
  const ol = q => { const s = q.g.map(r => r.slice()); for (let y = 0; y < q.H; y++) for (let x = 0; x < q.W; x++) { if (s[y][x]) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const v = s[y + b] && s[y + b][x + a]; return v && v !== K })) q.set(x, y, K) } return q };
  const mask = (q, rows, col, k, ox = 1, oy = 1) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch == "X") q.rect(ox + i * k, oy + j * k, k, k, col) }));
  const QM = [".XXXX.", "XX..XX", "XX..XX", "...XX.", "..XX..", "..XX..", "......", "..XX..", "..XX.."];
  const fb = u => 1.2 * E.sin(u);
  const shake = u => E.wob(E.seg(u, .04, .42), 3, 3.5) + .6 * E.wob(E.seg(u, .52, .86), 2, 4);
  const starSpr = (col, x, y, ph) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 2),
    at: u => ({ x, y, s: .6 + .4 * (.5 + .5 * E.sin(u + ph, 2)) }) });

  GLPIX.def("faq", {
    dur: 4.4, still: .62,
    base(p, c) {
    },
    parts: [
      starSpr(Y, 7, 53, .5), starSpr(W, 72, 53, 0),
      /* gelembung besar */
      { w: 42, h: 40, ax: 5, ay: 38,
        draw(q) {
          q.rect(1, 1, 40, 30, W, K, 2);
          for (let j = 0; j <= 8; j++) { const xl = Math.round(8 - 3 * j / 8), xr = Math.round(17 - 1.5 * j); for (let x = xl; x <= xr; x++) q.set(x, 30 + j, x == xl || x == xr || j == 8 ? K : W) }
          q.shade({ [W]: WD }, [0, 0, 42, 31], 2);
          q.set(4, 3, WD).set(3, 4, WD);
        },
        at(u) { const sh = shake(u); return { x: 8, y: 47 + fb(u), sx: 1 + .03 * sh, sy: 1 - .03 * sh } } },
      /* tanda tanya besar */
      { w: 14, h: 20, ax: 7, ay: 18,
        draw(q) { mask(q, QM, V, 2); q.shade({ [V]: VD }, [0, 0, 14, 20], 1); ol(q); q.set(4, 2, q.lt(V, .55)).set(3, 3, q.lt(V, .55)).set(3, 4, q.lt(V, .55)) },
        at(u) { const sh = shake(u), hop = Math.sin(Math.PI * E.io(E.seg(u, .04, .16))); return { x: 24, y: 32 + fb(u) - 2 * hop, r: 12 * sh, sx: 1 - .06 * hop, sy: 1 + .05 * hop } } },
      /* gelembung oranye "?" */
      { w: 19, h: 20, ax: 3, ay: 19,
        draw(q) {
          q.rect(0, 0, 19, 15, O, K, 2);
          q.poly([[3, 14], [8, 14], [2, 19]], O, K); q.line(4, 14, 7, 14, O);
          q.shade({ [O]: OD }, [0, 0, 19, 20], 1);
          q.text(7, 2, "?", W, 2); q.set(2, 2, q.lt(O, .5)).set(3, 2, q.lt(O, .5)).set(2, 3, q.lt(O, .5));
        },
        at(u) { const a = pop(u, .08, .18, .86, .94); return { x: 53, y: 24 + 1.5 * E.sin(u + .2, 2) * E.io(E.seg(u, .1, .24)), s: a.s, o: a.o, r: 6 * E.wob(E.seg(u, .12, .42), 2, 4) } } },
      /* gelembung kuning "!" */
      { w: 16, h: 19, ax: 3, ay: 18,
        draw(q) {
          q.rect(0, 0, 16, 14, Y, K, 2);
          q.poly([[3, 13], [8, 13], [2, 18]], Y, K); q.line(4, 13, 7, 13, Y);
          q.shade({ [Y]: YD }, [0, 0, 16, 19], 1);
          q.text(5, 2, "!", K, 2); q.set(2, 2, q.lt(Y, .6)).set(3, 2, q.lt(Y, .6)).set(2, 3, q.lt(Y, .6));
        },
        at(u) { const a = pop(u, .2, .3, .87, .95); return { x: 53, y: 56 + 1.5 * E.sin(u + .6, 2) * E.io(E.seg(u, .22, .36)), s: a.s, o: a.o, r: -6 * E.wob(E.seg(u, .24, .52), 2, 4) } } },
      /* sinar bohlam */
      { w: 19, h: 17, ax: 9, ay: 9,
        draw(q) { q.line(2, 3, 4, 5, Y); q.line(16, 3, 14, 5, Y); q.line(0, 9, 2, 9, Y); q.line(16, 9, 18, 9, Y); q.line(2, 15, 4, 13, Y); q.line(16, 15, 14, 13, Y) },
        at(u) { const a = pop(u, .42, .52, .84, .92); return { x: 66, y: 27 + E.sin(u, 2), s: a.s * (1 + .12 * E.sin(u, 6)), o: a.o } } },
      /* bohlam */
      { w: 11, h: 15, ax: 5, ay: 7,
        draw(q) {
          q.circ(5, 5, 4, Y, K); q.rect(3, 9, 5, 5, G, K); q.line(4, 11, 6, 11, K);
          q.shade({ [Y]: YD, [G]: q.dk(G, .2) }, [0, 0, 11, 15], 1); q.set(3, 3, W).set(4, 2, W).set(3, 4, q.lt(Y, .6));
        },
        at(u) { const a = pop(u, .38, .48, .86, .94); return { x: 66, y: 29 + E.sin(u, 2), s: a.s, o: a.o, r: 10 * E.wob(E.seg(u, .44, .72), 2, 4) } } },
      { ...starSpr(W, 0, 0, 0), at: u => ({ x: 46, y: 46, ...pop(u, .22, .32, .74, .82) }) },
      { ...starSpr(Y, 0, 0, 0), at: u => ({ x: 47, y: 30, ...pop(u, .4, .5, .78, .86) }) }
    ]
  });
})();

/* ---- shield ---- */
(() => { const { C, E } = GLPIX;
  /* Syarat & privasi: perisai teal melayang, gembok jatuh terkunci (gagang menutup dengan pantulan),
     centang putih meletup di perisai, kilau bintang bermunculan; gagang terbuka lagi untuk loop */
  const { K, O, Y, T, W, WD, G, OD, YD, TD } = C;
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  const ol = q => { const s = q.g.map(r => r.slice()); for (let y = 0; y < q.H; y++) for (let x = 0; x < q.W; x++) { if (s[y][x]) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const v = s[y + b] && s[y + b][x + a]; return v && v !== K })) q.set(x, y, K) } return q };
  /* bentuk perisai: lebar setengah per baris, sisi atas sedikit melengkung, bawah meruncing */
  const inShield = (x, y, inset) => {
    const cx = 16.5, top = 1 + inset + 2 * (1 - ((x + .5 - cx) / 16) ** 2), H = 37 - inset * 1.6;
    if (y < top || y > H) return false;
    const yy = y - 1, t = yy < 20 ? 0 : (yy - 20) / (H - 21);
    const hw = (16 - inset) * (t <= 0 ? 1 : Math.cos(Math.min(1, t) * Math.PI / 2) ** .85);
    return Math.abs(x + .5 - cx) <= hw - .2;
  };
  const SIL = "#d6ddf5", SILD = "#9aa3c7";
  const fs = u => 1.5 * E.sin(u);
  const fl = u => 1.2 * E.sin(u + .2);
  const snap = u => E.wob(E.seg(u, .2, .42), 2, 5);
  /* gagang: 0 = tertutup, -6 = terbuka */
  const shk = u => {
    const close = E.in(E.seg(u, .12, .2)), open = E.io(E.seg(u, .86, .97));
    return -6 * (1 - close) - 6 * open - 1.6 * Math.abs(E.wob(E.seg(u, .2, .4), 1.5, 5)) * (u > .2 && u < .86 ? 1 : 0);
  };
  const starSpr = (col, x, y, ph) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 2),
    at: u => ({ x, y, s: .6 + .4 * (.5 + .5 * E.sin(u + ph, 2)) }) });

  GLPIX.def("shield", {
    dur: 4, still: .6,
    base(p, c) {
      const gr = p.dk(c, .2); p.rect(0, 52, 78, 8, gr); p.line(0, 52, 77, 52, K);
      for (let x = 3; x < 78; x += 9) p.set(x, 55 + (x % 2), p.dk(gr, .15)).set(x + 1, 55 + (x % 2), p.dk(gr, .15));
    },
    parts: [
      starSpr(W, 70, 9, 0), starSpr(Y, 7, 40, .5),
      /* bayangan */
      { w: 26, h: 3, ax: 13, ay: 1, draw: (q, c) => q.ell(13, 1, 12, 1, q.dk(c, .38)), at: u => ({ x: 30, y: 54, sx: 1 - .06 * fs(u), o: .9 }) },
      { w: 18, h: 3, ax: 9, ay: 1, draw: (q, c) => q.ell(9, 1, 8, 1, q.dk(c, .38)), at: u => ({ x: 54, y: 54, sx: 1 - .06 * fl(u), o: .9 }) },
      /* perisai */
      { w: 34, h: 40, ax: 17, ay: 20,
        draw(q) {
          const RIM = Y, IN = T, IN2 = q.dk(T, .14);
          for (let y = 0; y < 40; y++) for (let x = 0; x < 34; x++) {
            if (!inShield(x, y, 0)) continue;
            q.set(x, y, inShield(x, y, 3) ? (x <= 16 ? IN : IN2) : RIM);
          }
          /* garis tinta antara bingkai dan isi */
          const s = q.g.map(r => r.slice());
          for (let y = 0; y < 40; y++) for (let x = 0; x < 34; x++) if (s[y][x] == RIM && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const v = s[y + b] && s[y + b][x + a]; return v == IN || v == IN2 })) q.set(x, y, K);
          ol(q);
          q.shade({ [RIM]: YD }, [0, 0, 34, 40], 1);
          q.set(4, 3, W).set(5, 3, W).set(3, 4, W).set(3, 5, W);
          q.set(7, 7, q.lt(T, .4)).set(8, 7, q.lt(T, .4)).set(7, 8, q.lt(T, .4));
        },
        at: u => ({ x: 30, y: 27 + fs(u), r: .8 * E.sin(u + .1) }) },
      /* centang */
      { w: 18, h: 15, ax: 9, ay: 8,
        draw(q) { q.line(3, 7, 6, 10, W, 3); q.line(6, 10, 13, 3, W, 3); ol(q); q.set(13, 2, WD).set(5, 11, WD).set(6, 11, WD) },
        at(u) { const a = pop(u, .24, .34, .84, .92), w = E.wob(E.seg(u, .3, .6), 2, 4); return { x: 30, y: 26 + fs(u), sx: a.s * (1 + .1 * w), sy: a.s * (1 - .1 * w), o: a.o } } },
      /* gagang gembok */
      { w: 15, h: 21, ax: 7, ay: 13,
        draw(q) {
          for (let y = 0; y < 21; y++) for (let x = 0; x < 15; x++) {
            const dx = x - 7, dy = y - 7, d = Math.hypot(dx, dy);
            if ((y <= 7 && d > 2.6 && d <= 4.7) || (y > 7 && y <= 19 && (x == 3 || x == 4 || x == 10 || x == 11))) q.set(x, y, SIL);
          }
          ol(q); q.shade({ [SIL]: SILD }, [0, 0, 15, 21], 1); q.set(4, 6, W).set(4, 5, W).set(5, 4, W);
        },
        at(u) { const w = snap(u); return { x: 53, y: 38 + fl(u) + shk(u) + 14 * .12 * w } } },
      /* badan gembok */
      { w: 18, h: 15, ax: 9, ay: 14,
        draw(q) {
          q.rect(0, 0, 18, 15, O, K, 1);
          q.shade({ [O]: OD }, [0, 0, 18, 15], 1);
          q.line(1, 3, 16, 3, q.dk(O, .1)); q.line(1, 11, 16, 11, q.dk(O, .1));
          q.circ(9, 6, 1, K); q.rect(8, 7, 3, 3, K); q.set(9, 6, q.dk(K, 0));
          q.set(2, 1, q.lt(O, .5)).set(3, 1, q.lt(O, .5)).set(1, 2, q.lt(O, .5)).set(2, 5, q.lt(O, .3));
        },
        at(u) { const w = snap(u); return { x: 53, y: 50 + fl(u), sx: 1 + .1 * w, sy: 1 - .12 * w } } },
      /* garis "klik": tiga sinar memancar dari atas gagang */
      ...[[-1, -1], [0, -1], [1, -1]].map(([dx, dy]) => ({ w: 3, h: 3, ax: 1, ay: 1,
        draw: q => dx ? q.set(dx < 0 ? 0 : 2, 0, W).set(1, 1, W).set(dx < 0 ? 2 : 0, 2, W) : q.line(1, 0, 1, 2, W),
        at: u => { const t = E.seg(u, .2, .32), m = 4 + 4 * E.out(t); return { x: 53 + dx * m * .9, y: 31 + fl(u) + dy * m, o: t > 0 && t < 1 ? 1 - E.in(t) : 0 } } })),
      { ...starSpr(Y, 0, 0, 0), at: u => ({ x: 10, y: 12, ...pop(u, .3, .4, .76, .84) }) },
      { ...starSpr(W, 0, 0, 0), at: u => ({ x: 52, y: 10, ...pop(u, .34, .44, .78, .86) }) },
      { ...starSpr(Y, 0, 0, 0), at: u => ({ x: 69, y: 33, ...pop(u, .38, .48, .8, .88) }) }
    ]
  });
})();

/* ---- petunjuk ---- */
(() => { const { C, E } = GLPIX; const { K, Y, YD, T, TD, W, WD, BR, BD, O } = C;
  const G = "#5cc35a", GD = "#3d9447", GL = "#8fe07a";
  /* papan panah: dir 1 = menunjuk kanan. Sprite: ujung/badan di baris 1..9, padding 1px */
  const SIGNS = [
    { dir: 1, x0: 18, x1: 54, y: 12, col: Y, colD: YD, word: "MULAI", t0: .06 },
    { dir: -1, x0: 19, x1: 58, y: 24, col: T, colD: TD, word: "BACA", t0: .2 },
    { dir: 1, x0: 20, x1: 54, y: 36, col: W, colD: WD, word: "COBA", t0: .34 }
  ];
  const PX = 38; /* tiang */
  const sign = s => {
    const tipX = s.dir > 0 ? s.x1 + 4 : s.x0 - 4, left = Math.min(s.x0, tipX), right = Math.max(s.x1, tipX);
    const ox = left - 2, oy = s.y - 2, w = right - left + 5, h = 13;
    return {
      w, h, ax: PX - ox, ay: s.y + 4 - oy, frames: 9,
      draw(q, c, f) {
        const a = s.x0 - ox, b = s.x1 - ox, t = tipX - ox, y0 = 2, y1 = 10;
        const P = s.dir > 0 ? [[a, y0], [b, y0], [t, 6], [b, y1], [a, y1]] : [[b, y0], [a, y0], [t, 6], [a, y1], [b, y1]];
        q.poly(P, s.col, K);
        q.shade({ [s.col]: s.colD }, [0, 0, w, h], 1);
        /* kilau: pita diagonal yang menyapu */
        if (f > 0) {
          const bx = left - ox - 4 + (f - 1) * (w + 6) / 7, hl = s.col == W ? "#ffffff" : q.lt(s.col, .65);
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const v = q.get(x, y); if (v != s.col && v != s.colD) continue;
            const d = x + (y - 6) * .6 - bx;
            if ((d > -1.5 && d < 1.5) || (d > 3 && d < 4.2)) q.set(x, y, s.col == W ? "#cfe6ff" : hl);
          }
        }
        /* sorotan kiri atas */
        const hx = s.dir > 0 ? a + 2 : a + 2;
        if (s.col != W) q.rect(hx, y0 + 2, 3, 1, W).set(hx, y0 + 3, W); else q.rect(hx, y0 + 2, 3, 1, "#cfd8f5");
        /* tulisan */
        const cx = Math.round((a + b) / 2 + 1);
        if (s.word[0] == "M") { /* M lebar 5px supaya tidak terbaca H */
          const rest = s.word.slice(1), tw = 6 + q.textW(rest), x0 = cx - (tw >> 1);
          q.spr(x0, 4, ["K...K", "KK.KK", "K.K.K", "K...K", "K...K"], { K }); q.text(x0 + 6, 4, rest, K);
        } else { const tw = q.textW(s.word); q.text(cx - (tw >> 1), 4, s.word, K) }
      },
      at(u) {
        const sw = E.seg(u, s.t0, s.t0 + .5), wob = E.wob(sw, 3, 4.5);
        const ant = Math.sin(Math.PI * E.seg(u, s.t0 - .06, s.t0)) * 3; /* antisipasi: tarik balik sedikit */
        const idle = .7 * E.sin(u + s.t0 * 2);
        const g = E.seg(u, s.t0 + .03, s.t0 + .22);
        return { x: PX + s.dir * (1.6 * Math.max(0, wob) - ant * .25), y: s.y + 4, r: s.dir * (-10 * wob + ant) + idle,
          sx: 1 + .05 * Math.abs(wob), sy: 1 - .03 * Math.abs(wob), f: g > 0 && g < 1 ? 1 + Math.floor(g * 8) : 0 };
      }
    };
  };
  const starSpr = (col, sz = 2) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, sz) });
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  GLPIX.def("petunjuk", {
    dur: 4, still: .7,
    base(p, c) {
      /* bukit jauh (lebih gelap dari latar) */
      const hill = p.dk(c, .14);
      for (let x = 0; x < 78; x++) { const h1 = 41 - Math.round(5 * Math.sin((x + 6) / 9)), h2 = 44 - Math.round(3 * Math.sin((x + 30) / 6)); for (let y = Math.min(h1, h2); y < 48; y++) p.set(x, y, y >= h2 ? p.dk(c, .24) : hill) }
      /* tanah rumput */
      p.rect(0, 48, 78, 12, G); p.line(0, 48, 77, 48, K); p.rect(0, 54, 78, 6, GD); p.line(0, 54, 77, 54, p.dk(GD, .15));
      for (let x = 1; x < 78; x += 6) p.set(x, 47, K).set(x + 1, 46, K).set(x + 2, 47, K).set(x + 1, 47, G);
      for (let x = 4; x < 78; x += 11) p.set(x, 51, GL).set(x + 1, 50, GL);
      /* tiang kayu */
      p.ell(PX, 50, 9, 2, GD);
      p.rect(PX - 3, 9, 7, 42, BR, K); p.rect(PX - 2, 10, 1, 39, "#d9894a"); p.rect(PX + 1, 10, 2, 40, BD);
      for (let y = 15; y < 47; y += 6) p.set(PX - 1, y, BD).set(PX, y + 1, BD);
      p.rect(PX - 5, 6, 11, 4, BD, K, 1); p.rect(PX - 4, 7, 3, 1, "#d9894a");
      /* semak: gabungan lingkaran, tepi tinta dihitung dari bentuk */
      const bush = (cs, base) => {
        const inn = (x, y) => y <= base && cs.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * .6);
        for (let y = 20; y <= base; y++) for (let x = 0; x < 78; x++) if (inn(x, y)) {
          const e = !inn(x - 1, y) || !inn(x + 1, y) || !inn(x, y - 1) || y == base;
          const d = !inn(x + 1, y + 1) || !inn(x + 2, y + 2) || y >= base - 1;
          p.set(x, y, e ? K : d ? GD : G);
        }
        const [hx, hy, hr] = cs[0]; p.set(hx - hr + 2, hy - hr + 2, GL).set(hx - hr + 3, hy - hr + 2, GL).set(hx - hr + 2, hy - hr + 3, GL);
      };
      bush([[9, 42, 5], [15, 45, 3], [3, 44, 4]], 48); bush([[69, 43, 4], [75, 42, 4], [63, 46, 3]], 48);
      /* bunga */
      [[24, 47, W], [56, 47, Y], [73, 51, W], [5, 52, Y]].forEach(([x, y, col]) => { p.set(x, y + 2, GD).set(x, y + 1, GD); p.set(x - 1, y, col).set(x + 1, y, col).set(x, y - 1, col).set(x, y, col == Y ? O : Y) });
    },
    parts: [
      { w: 15, h: 6, ax: 7, ay: 3, draw: q => q.cloud(0, 0), at: u => ({ x: 12 + 2.5 * E.sin(u), y: 7 + .6 * E.sin(u, 2) }) },
      { w: 15, h: 6, ax: 7, ay: 3, draw: q => q.cloud(0, 0), at: u => ({ x: 66 - 2 * E.sin(u), y: 15 }) },
      ...SIGNS.map(sign),
      /* kupu-kupu kecil terbang membentuk angka 8 */
      { w: 9, h: 7, ax: 4, ay: 3,
        draw(q) { q.spr(0, 0, [".KK...KK.", "KWPK.KPPK", "KPPPKPPPK", ".KPPKPPK.", ".KDDKDDK.", "..KK.KK.."], { K, P: C.PK, D: "#e0709f", W }) },
        at: u => { const a = 2 * Math.PI * u; return { x: 68.5 + 4 * Math.sin(a), y: 30 + 3.5 * Math.sin(2 * a) - 1.2 * Math.abs(Math.sin(a * 8)), r: 12 * Math.cos(a), sx: .3 + .7 * Math.abs(Math.cos(a * 8)) } } },
      { ...starSpr(W), at: u => ({ x: 63, y: 8, ...pop(u, .14, .24, .5, .6) }) },
      { ...starSpr(Y, 1), at: u => ({ x: 8, y: 22, ...pop(u, .28, .38, .62, .72) }) },
      { ...starSpr(W, 1), at: u => ({ x: 10, y: 33, ...pop(u, .42, .52, .74, .84) }) },
      { ...starSpr(Y, 1), at: u => ({ x: 26, y: 5, ...pop(u, .56, .64, .8, .9) }) }
    ]
  });
})();

/* ---- alur ---- */
(() => { const { C, E } = GLPIX; const { K, O, OD, Y, YD, T, TD, V, VD, W, WD, PK } = C;
  /* empat batu loncatan (pusat permukaan atas) */
  const ST = [[13, 45, O, OD], [30, 32, Y, YD], [47, 43, T, TD], [62, 28, V, VD]];
  const FY = 3; /* kaki Labi berdiri di bagian belakang permukaan batu supaya angka tetap terlihat */
  /* waktu mendarat di tiap batu dan jadwal loncatan */
  const LAND = [.08, .3, .5, .7], HOP = [[.17, .3], [.37, .5], [.57, .7]];
  const hopH = [10, 9, 11];
  const labi = u => {
    const x1 = ST[0][0], y1 = ST[0][1] - FY;
    /* jatuh masuk dari atas ke batu 1 */
    if (u < LAND[0]) { const s = E.seg(u, 0, LAND[0]); const k = Math.max(E.back(E.seg(u, 0, .05)), .001); return { x: x1, y: y1 - 12 * (1 - s * s), o: u > .002 ? 1 : 0, sx: .9 * k, sy: 1.15 * k } }
    let x = x1, y = y1, sx = 1, sy = 1, r = 0, s = 1;
    for (let i = 0; i < 3; i++) {
      const [a, b] = HOP[i], xa = ST[i][0], ya = ST[i][1] - FY, xb = ST[i + 1][0], yb = ST[i + 1][1] - FY;
      if (u >= LAND[i] && u < b) {
        const land = E.wob(E.seg(u, LAND[i], LAND[i] + .09), 1, 3.5);  /* mendarat: gepeng lalu memanjang sedikit */
        const ant = Math.sin(Math.PI * E.seg(u, a - .045, a));            /* antisipasi: jongkok sebelum loncat */
        if (u < a) { x = xa; y = ya; sy = 1 - .3 * land - .2 * ant; sx = 1 + .22 * land + .15 * ant }
        else { const t = E.seg(u, a, b), m = E.io(t) * .55 + t * .45; x = E.lerp(xa, xb, m); y = E.lerp(ya, yb, m) - hopH[i] * 4 * t * (1 - t);
          sy = 1 + .18 * Math.sin(Math.PI * t); sx = 1 - .12 * Math.sin(Math.PI * t); r = (xb > xa ? 1 : -1) * 8 * Math.sin(Math.PI * t) }
        return { x, y, sx, sy, r };
      }
    }
    /* di batu 4: mendarat, lalu loncat senang sambil berputar, lalu menghilang */
    const x4 = ST[3][0], y4 = ST[3][1] - FY;
    const land = E.wob(E.seg(u, LAND[3], LAND[3] + .09), 1, 3.5);
    const ant = Math.sin(Math.PI * E.seg(u, .76, .79)), jt = E.seg(u, .79, .87);
    const land2 = E.wob(E.seg(u, .87, .93), 1, 3.5);
    const g = E.seg(u, .92, .98); s = g < .3 ? 1 + .25 * E.out(g / .3) : 1.25 * (1 - E.in((g - .3) / .7));
    return { x: x4, y: y4 - 11 * 4 * jt * (1 - jt), sx: (1 + .22 * land + .15 * ant + .2 * land2) * Math.max(s, .001), sy: (1 - .3 * land - .2 * ant - .25 * land2 + .12 * Math.sin(Math.PI * jt)) * Math.max(s, .001),
      r: -360 * E.io(jt), o: s > .02 ? 1 : 0 };
  };
  const stone = ([cx, cy, col, colD], i) => ({
    w: 21, h: 17, ax: 10, ay: 15,
    draw(q) {
      q.ell(10, 10, 9, 5, colD, K); q.rect(1, 5, 19, 5, colD); q.rect(1, 5, 1, 6, K).rect(19, 5, 1, 6, K);
      q.ell(10, 5, 9, 5, col, K);
      q.set(4, 2, W).set(5, 2, W).set(3, 3, W).set(6, 1, q.lt(col, .45)).set(7, 1, q.lt(col, .45));
      for (let x = 13; x < 18; x++) q.set(x, 13 - (x > 15 ? 1 : 0), q.dk(colD, .2));
      /* angka putih bertepi tinta */
      const d = String(i + 1), tx = 9, ty = 3, tmp = GLPIX.grid(21, 17); tmp.text(tx, ty, d, W);
      for (let y = 0; y < 17; y++) for (let x = 0; x < 21; x++) if (tmp.get(x, y)) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) if (!tmp.get(x + k, y + j)) q.set(x + k, y + j, K);
      q.text(tx, ty, d, W);
    },
    at(u) { const w = E.wob(E.seg(u, LAND[i], LAND[i] + .16), 2, 4.5); return { x: cx, y: cy + 10, sx: 1 + .14 * w, sy: 1 - .2 * w } }
  });
  const ring = ([cx, cy], i) => ({
    w: 27, h: 15, ax: 13, ay: 7, draw: q => q.ell(13, 7, 12, 6, null, W),
    at(u) { const s = E.seg(u, LAND[i], LAND[i] + .2); return { x: cx, y: cy + 1, s: .5 + .8 * E.out(s), o: s > 0 && s < 1 ? (1 - s) * .9 : 0 } }
  });
  const starSpr = (col, sz = 2) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, sz) });
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  const twinkle = (x, y, ph) => ({ w: 5, h: 5, ax: 2, ay: 2, draw: q => q.star(2, 2, C.WD, 1), at: u => { const k = .5 + .5 * E.sin(u + ph, 2); return { x, y, s: .4 + .6 * k, o: .35 + .65 * k } } });
  GLPIX.def("alur", {
    dur: 4.6, still: .78,
    base(p, c) {
      /* jalan berkelok di antara batu */
      const road = p.lt(c, .16), dot = p.lt(c, .6);
      const pts = []; for (let i = 0; i < 3; i++) { const [xa, ya] = ST[i], [xb, yb] = ST[i + 1], mx = (xa + xb) / 2, my = (ya + yb) / 2 + (i % 2 ? -7 : 7);
        for (let k = 0; k <= 40; k++) { const t = k / 40, x = (1 - t) ** 2 * xa + 2 * t * (1 - t) * mx + t * t * xb, y = (1 - t) ** 2 * ya + 2 * t * (1 - t) * my + t * t * yb; pts.push([x, y + 4]) } }
      pts.forEach(([x, y]) => p.line(x, y, x, y, road, 5));
      let acc = 0; pts.forEach(([x, y], k) => { if (k) acc += Math.hypot(x - pts[k - 1][0], y - pts[k - 1][1]); if (acc > 3.2) { acc = 0; p.set(x, y, dot) } });
      /* bulan sabit */
      p.circ(11, 11, 6, Y); p.circ(14, 8, 5, c);
      for (let y = 4; y < 19; y++) for (let x = 4; x < 19; x++) if (p.get(x, y) == Y && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => p.get(x + a, y + b) != Y && p.get(x + a, y + b) != K)) p.set(x, y, K);
      for (let y = 4; y < 19; y++) for (let x = 4; x < 19; x++) if (p.get(x, y) == Y && p.get(x + 1, y + 1) != Y) p.set(x, y, YD);
      p.set(7, 10, C.W).set(7, 11, C.W);
      /* tiang bendera di batu 4 */
      p.ell(73, 34, 4, 1, p.dk(c, .35)); p.stick(73, 6, 73, 33, C.WD); p.circ(73, 5, 1, Y, K);
      /* bintang diam */
      [[24, 4], [47, 6], [4, 30], [75, 47], [36, 56]].forEach(([x, y]) => p.set(x, y, p.lt(c, .45)));
    },
    parts: [
      twinkle(28, 13, 0), twinkle(42, 9, .3), twinkle(54, 6, .6), twinkle(70, 50, .15), twinkle(27, 54, .45), twinkle(6, 26, .75),
      ...ST.map(ring),
      ...ST.map(stone),
      /* bendera: muncul dengan pantulan, berkibar */
      { w: 12, h: 9, ax: 11, ay: 1,
        draw(q) { q.poly([[11, 1], [1, 1], [3, 4], [1, 7], [11, 7]], O, K); q.shade({ [O]: OD }, [0, 0, 12, 9], 1); q.rect(5, 3, 3, 1, W).rect(6, 2, 1, 3, W) },
        at(u, t) { const s = E.back(E.seg(u, .7, .78)) * (1 - E.in(E.seg(u, .92, .98))); return { x: 72, y: 6, sx: Math.max(s, .001) * (1 - .12 * Math.abs(E.sin(u, 8))), sy: Math.max(s, .001), r: 3 * E.sin(u, 8), o: s > .02 ? 1 : 0 } } },
      /* Labi (labu Erlenmeyer bertunas) */
      { w: 13, h: 16, ax: 6, ay: 15,
        draw(q) {
          q.spr(0, 0, [".KKK.....KKK.", "KVVVK...KTTTK", "KVVVVK.KTTTTK", ".KVVVVKTTTTK.", "..KKKKGKKKK..", "....KWWWK....", "....KWWWK....", "...KWWWWWK...", "..KWWWWWWWK..", ".KWWKWWWKWWK.", ".KWWWWWWWWWK.", "KOOOOOOOOOOOK", "KOOPOOOOOPOOK", "KOOOOOOOOOOOK", "KDDDDDDDDDDDK", ".KKKKKKKKKKK."],
            { K, V, T, W, O, G: "#3fbf5a", P: PK, D: OD });
          q.set(2, 1, q.lt(V, .4)).set(9, 1, q.lt(T, .4)).set(3, 8, WD).set(2, 9, WD).set(2, 10, WD).set(1, 11, q.lt(O, .4));
        },
        at: u => labi(u) },
      { ...starSpr(Y), at: u => ({ x: 52, y: 10, ...pop(u, .72, .8, .9, .96) }) },
      { ...starSpr(W, 1), at: u => ({ x: 67, y: 47, ...pop(u, .75, .83, .9, .97) }) },
      { ...starSpr(W), at: u => ({ x: 47, y: 24, ...pop(u, .78, .86, .91, .98) }) }
    ]
  });
})();

/* ---- peta ---- */
(() => { const { C, E } = GLPIX; const { K, O, OD, Y, YD, T, TD, V, VD, W, WD } = C;
  const GR = "#3fbf5a", GRD = "#2a9445";
  /* simpul: [cx, cy, w, h, warna, gelap, masuk, keluar, fase-ayun] */
  const N = {
    root: [39, 10, 27, 13, Y, YD, -1, 2],
    o: [13, 31, 20, 11, O, OD, .17, .86],
    v: [39, 31, 20, 11, V, VD, .21, .855],
    t: [65, 31, 20, 11, T, TD, .25, .85],
    w1: [27, 49, 18, 9, W, WD, .4, .8],
    w2: [51, 49, 18, 9, W, WD, .45, .79]
  };
  /* garis: dari simpul a ke simpul b, tumbuh mulai waktu g */
  const L = [["root", "o", .08], ["root", "v", .11], ["root", "t", .14], ["v", "w1", .31], ["v", "w2", .35]];
  const bob = (k, u) => .6 * E.sin(u * 2 + { root: 0, o: .2, v: .45, t: .7, w1: .3, w2: .6 }[k] / 2);
  const node = k => {
    const [cx, cy, w, h, col, colD, tin, tout] = N[k];
    return {
      w: w + 2, h: h + 2, ax: w >> 1, ay: h >> 1,
      draw(q, c) {
        q.rect(1, 1, w, h, q.dk(c, .35), null, 2);              /* bayangan jatuh */
        q.rect(0, 0, w, h, col, K, 2);
        q.shade({ [col]: colD }, [0, 0, w, h], 1);
        q.set(2, 2, W).set(3, 2, W).set(2, 3, W);
        if (col == W) q.set(2, 2, "#cfd8f5").set(3, 2, "#cfd8f5").set(2, 3, "#cfd8f5");
        if (k == "root") { const s = "TOPIK"; q.text((w - q.textW(s) >> 1) + 1, 4, s, K); }
        else { const ink = col == W ? C.G : q.dk(colD, .25); const ln = w - 9; q.rect(4, 3, ln, 1, ink).rect(4, 5, ln - 4, 1, ink); if (h > 9) q.rect(4, 7, ln - 2, 1, ink) }
      },
      at(u) {
        if (k == "root") { /* akar selalu ada: jongkok (antisipasi) lalu memantul saat cabang melesat keluar */
          const ant = Math.sin(Math.PI * E.seg(u, 0, .07)), w = E.wob(E.seg(u, .07, .3), 2, 4.5);
          return { x: cx, y: cy + bob(k, u), sx: 1 + .08 * ant - .07 * w, sy: 1 - .1 * ant + .09 * w, r: 0 } }
        const a = E.seg(u, tin, tin + .12), z = E.seg(u, tout, tout + .06);
        const s = E.back(a) * (1 - E.in(z)), w2 = E.wob(E.seg(u, tin + .04, tin + .22), 2, 4);
        return { x: cx, y: cy + bob(k, u), s: Math.max(s, .001), r: 5 * w2, o: s > .02 ? 1 : 0 };
      }
    };
  };
  const link = ([a, b, g]) => {
    const [x0, y0] = N[a], [x1, y1] = N[b], len = Math.round(Math.hypot(x1 - x0, y1 - y0)), ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
    const ta = N[b][7] + .045;
    return {
      w: len + 3, h: 5, ax: 1, ay: 2,
      draw(q, c) { q.line(1, 2, len + 1, 2, K, 3); q.line(1, 2, len + 1, 2, q.lt(c, .55), 1) },
      at(u) { const s = E.io(E.seg(u, g, g + .1)) * (1 - E.io(E.seg(u, ta, ta + .05))); return { x: x0, y: y0 + bob(a, u), r: ang, sx: Math.max(s, .001), o: s > .01 ? 1 : 0 } }
    };
  };
  const starSpr = (col, sz = 2) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, sz) });
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  GLPIX.def("peta", {
    dur: 4.8, still: .66,
    base(p, c) {
      /* kertas grid samar di latar */
      const gl = p.lt(c, .07);
      for (let y = 4; y < 58; y += 6) for (let x = 2; x < 77; x++) if (p.get(x, y) == c) p.set(x, y, gl);
      for (let x = 3; x < 77; x += 6) for (let y = 2; y < 58; y++) if (p.get(x, y) == c) p.set(x, y, gl);
    },
    parts: [
      ...L.map(link),
      /* titik cahaya mengalir dari akar ke cabang (gerak sekunder saat diam) */
      ...L.map(([a, b], i) => ({ w: 5, h: 5, ax: 2, ay: 2, draw: q => q.rect(1, 1, 3, 3, W).set(2, 0, W).set(2, 4, W).set(0, 2, W).set(4, 2, W).set(2, 2, Y),
        at(u) { const t0 = i < 3 ? .6 + i * .025 : .67 + (i - 3) * .025, t = E.seg(u, t0, t0 + .095), m = E.lerp(.3, .74, E.io(t)), [x0, y0] = N[a], [x1, y1] = N[b];
          return { x: E.lerp(x0, x1, m), y: E.lerp(y0, y1, m), s: .6 + .4 * Math.sin(Math.PI * t), o: t > 0 && t < 1 ? Math.min(1, Math.sin(Math.PI * t) * 2.5) : 0 } } })),
      ...Object.keys(N).map(node),
      /* centang di simpul terakhir */
      { w: 11, h: 11, ax: 5, ay: 5,
        draw(q) { q.circ(5, 5, 5, GR, K); q.shade({ [GR]: GRD }, [0, 0, 11, 11], 1); q.spr(2, 3, ["....W", "...WW", "W.WW.", "WWW..", ".W..."], { W }) },
        at(u) { const s = E.back(E.seg(u, .55, .63)) * (1 - E.in(E.seg(u, .75, .79))); return { x: 61, y: 44 + bob("w2", u), s: Math.max(s, .001), r: -20 * (1 - E.out(E.seg(u, .55, .64))), o: s > .02 ? 1 : 0 } } },
      { ...starSpr(Y), at: u => ({ x: 70, y: 46, ...pop(u, .6, .68, .72, .78) }) },
      { ...starSpr(W, 1), at: u => ({ x: 63, y: 55, ...pop(u, .63, .71, .73, .79) }) },
      { ...starSpr(W), at: u => ({ x: 9, y: 9, ...pop(u, .08, .16, .4, .5) }) },
      { ...starSpr(Y, 1), at: u => ({ x: 69, y: 9, ...pop(u, .11, .19, .44, .54) }) },
      { ...starSpr(W, 1), at: u => ({ x: 9, y: 50, ...pop(u, .45, .53, .7, .8) }) }
    ]
  });
})();

/* ---- glosarium ---- */
(() => { const { C, E } = GLPIX; const { K, O, OD, Y, YD, T, TD, V, VD, W, WD, BR, BD } = C;
  const SP = 39, TOP = 10, PW = 30, PH = 34;           /* punggung buku, atas halaman, lebar & tinggi halaman */
  const LG = "#b9c2e6";                               /* garis entri */
  /* satu halaman di koordinat lokal: kolom lx = 1..PW dari punggung; dir 1 = ke kanan. mirrorTxt untuk sisi belakang halaman yang dibalik */
  const page = (q, ox, oy, dir, letter, col, colD, dim) => {
    const dip = lx => Math.max(0, 3 - lx);
    const px = lx => ox + dir * lx;
    const paper = dim ? "#e4e9fb" : W, paperD = dim ? "#c9d1f0" : WD;
    for (let lx = 1; lx <= PW; lx++) {
      const t = oy + 1 + dip(lx), b = oy + PH + dip(lx);
      for (let y = t; y <= b; y++) q.set(px(lx), y, y == t || y == b || lx == PW ? K : (lx >= PW - 2 || y >= b - 2) ? paperD : paper);
    }
    /* isi: huruf besar + garis entri, ditulis lewat grid sementara supaya bisa dicerminkan */
    const tmp = GLPIX.grid(PW + 2, PH + 6), L0 = 6;
    const GLY = { A: ["...###...", "..#####..", "..##.##..", ".###.###.", ".##...##.", ".##...##.", "###...###", "#########", "#########", "###...###", "###...###", "###...###", "###...###"],
      Z: ["#########", "#########", "......###", ".....###.", ".....##..", "....###..", "...###...", "..###....", "..##.....", ".###.....", "###......", "#########", "#########"] }[letter];
    tmp.spr(L0 + 1, 6, GLY, { "#": K }); tmp.spr(L0, 5, GLY, { "#": col });
    for (let y = 0; y < 13; y++) for (let x = 0; x < 9; x++) if (GLY[y][x] == "#" && (GLY[y + 1] || "")[x + 1] != "#" && x < 8 && y < 12 && GLY[y][x + 1] != "#") tmp.set(L0 + x, 5 + y, colD);
    const hl = tmp.lt(col, .55); if (letter == "A") tmp.set(L0 + 3, 5, hl).set(L0 + 2, 6, hl).set(L0 + 1, 8, hl); else tmp.set(L0, 5, hl).set(L0 + 1, 5, hl).set(L0, 6, hl);
    [[23, 16], [26, 12], [29, 18]].forEach(([y, w], i) => tmp.rect(L0, y, w, 1, i == 1 ? colD : LG));
    tmp.rect(L0 + 12, 7, 7, 1, LG).rect(L0 + 11, 9, 5, 1, LG).rect(L0 + 11, 13, 6, 1, LG).rect(L0 + 11, 15, 4, 1, LG);
    const flip = dir < 0 ? 1 : 0;   /* teks tetap terbaca: halaman kiri digambar dengan tata letak dari kiri ke kanan */
    for (let y = 0; y < PH + 6; y++) for (let x = 0; x < PW + 2; x++) { const v = tmp.get(x, y); if (!v) continue;
      /* x di tmp = jarak dari tepi kiri halaman yang terbaca */
      const lx = dir > 0 ? x + 1 : PW - x;
      if (lx < 4 || lx > PW - 3) continue;
      q.set(px(lx), oy + y + dip(lx) * 0, v) }
  };
  GLPIX.def("glosarium", {
    dur: 3.8, still: .85,
    base(p, c) {
      const sh = p.dk(c, .22);
      p.ell(SP, 52, 31, 3, sh);
      /* sampul */
      p.rect(SP - PW - 3, TOP + 4, 2 * PW + 7, PH + 2, V, K, 2); p.shade({ [V]: VD }, [0, 0, 78, 60], 1);
      /* tebal halaman */
      for (let k = 0; k < 2; k++) { p.line(SP - PW + k, TOP + PH + 2 + k, SP - 1, TOP + PH + 2 + k, k ? WD : W); p.line(SP + 1, TOP + PH + 2 + k, SP + PW - k, TOP + PH + 2 + k, k ? WD : W) }
      p.line(SP - PW - 1, TOP + PH + 4, SP + PW + 1, TOP + PH + 4, K);
      page(p, SP, TOP, -1, "A", O, OD);
      page(p, SP, TOP, 1, "Z", T, TD);
      p.line(SP, TOP + 4, SP, TOP + PH + 4, K);
      p.set(SP - 1, TOP + 4, K).set(SP + 1, TOP + 4, K);
    },
    parts: [
      /* pita pembatas buku, bergoyang setelah halaman mendarat */
      { w: 7, h: 12, ax: 3, ay: 0,
        draw(q) { q.rect(2, 0, 4, 10, O, K); q.rect(3, 1, 1, 7, q.lt(O, .35)); q.set(2, 10, K).set(5, 10, K).set(3, 9, K).set(4, 9, K).set(2, 9, O).set(5, 9, O); q.rect(3, 9, 2, 1, K) },
        at: u => ({ x: SP + 9, y: TOP + PH + 4, r: 18 * E.wob(E.seg(u, .44, .9), 3, 4) + 4 * E.sin(u) }) },
      /* halaman yang dibalik: poros di punggung buku. f: 0 depan, 1 depan teduh, 2 belakang teduh, 3 belakang */
      { w: PW + 2, h: PH + 6, ax: 0, ay: 0, frames: 4,
        draw(q, c, f) {
          if (f < 2) page(q, 0, 0, 1, "Z", T, TD, f == 1);
          else { const tq = GLPIX.grid(PW + 2, PH + 6); page(tq, PW + 1, 0, -1, "A", O, OD, f == 2);
            for (let y = 0; y < PH + 6; y++) for (let x = 0; x <= PW + 1; x++) { const v = tq.get(PW + 1 - x, y); if (v) q.set(x, y, v) } }
        },
        at(u) {
          const lift = Math.sin(Math.PI * E.seg(u, .06, .14)) * .06;                  /* antisipasi: sudut halaman terangkat sedikit */
          const t = E.io(E.seg(u, .12, .44)), sx = Math.cos(Math.PI * t) - lift;
          const land = E.wob(E.seg(u, .44, .6), 1.5, 4);
          const on = u > .07 && u < .6;
          return { x: SP, y: TOP - 1.6 * Math.sin(Math.PI * t), sx: (Math.abs(sx) < .02 ? .02 * Math.sign(sx || 1) : sx) * (1 + (t > .5 ? .02 * land : 0)), sy: 1 + .05 * Math.sin(Math.PI * t), o: on ? 1 : 0,
            f: sx > 0 ? (sx > .55 ? 0 : 1) : (sx < -.55 ? 3 : 2) };
        } },
      /* bintang saat halaman mendarat */
      ...[[6, 9, W, 2, .44], [14, 4, Y, 1, .47], [73, 24, W, 1, .5]].map(([x, y, col, sz, a]) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, sz),
        at: u => { const s = E.back(E.seg(u, a, a + .08)) * (1 - E.io(E.seg(u, a + .2, a + .3))); return { x, y, s: Math.max(s, .001), o: s > .02 ? 1 : 0 } } })),
      /* kaca pembesar melayang */
      { w: 21, h: 21, ax: 7, ay: 7,
        draw(q) {
          q.stick(12, 12, 18, 18, BR); q.line(18, 18, 19, 19, K); q.set(13, 13, BD).set(14, 14, BD);
          q.circ(7, 7, 6, Y, K); q.circ(7, 7, 4, "rgba(214,240,255,.55)", K);
          q.set(5, 4, W).set(4, 5, W).set(4, 6, W).set(6, 4, W);
          q.shade({ [Y]: YD }, [0, 0, 21, 21], 1);
        },
        at: u => { const a = 2 * Math.PI * u; return { x: 61 + 2.5 * Math.sin(a), y: 36 + 2 * Math.sin(2 * a), r: -8 + 6 * Math.sin(a + 1) } } }
    ]
  });
})();

/* ---- komunitas ---- */
(() => { const { C, E } = GLPIX;
  /* Belajar bareng: tiga anak di balik meja belajar bergiliran bicara.
     Anak kiri bertanya (?), anak tengah dapat ide (lampu, tangan terangkat, melompat kecil), anak kanan senang (hati). */
  const { K, W, O, OD, Y, T, TD, V, VD, BR, BD, SK, SKD, HB, G, WD, PK } = C;
  const GR = "#3ccf6e";
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  const env = (u, a, b) => E.io(E.seg(u, a, a + .05)) * (1 - E.io(E.seg(u, b - .06, b)));
  /* lompatan: antisipasi pepat, regang saat naik, mendarat pepat lalu memantul */
  const hop = (u, t0, H) => {
    const a = E.seg(u, t0, t0 + .04), air = E.seg(u, t0 + .04, t0 + .13), land = E.seg(u, t0 + .13, t0 + .26);
    let y = 0, s = 0;
    if (u >= t0 && u < t0 + .04) s = -.12 * E.out(a);
    else if (air > 0 && air < 1) { y = -H * Math.sin(Math.PI * air); s = air < .3 ? E.lerp(-.12, .1, E.out(air / .3)) : E.lerp(.1, .03, E.seg(air, .3, 1)) }
    else if (land > 0 && land < 1) s = -.1 * Math.exp(-5 * land) * Math.cos(3 * Math.PI * land);
    return { y, sx: 1 - s * .8, sy: 1 + s };
  };
  /* anak setengah badan (kepala besar), poros di bawah tengah */
  const bust = (q, o, f) => {
    const cx = 11, cy = 12, sh = o.shirt, hr = o.hair, hl = q.lt(hr, .35);
    if (o.bun) { q.circ(cx + 1, cy - 9, 3, hr, K); q.set(cx, cy - 10, hl) }
    if (o.long) q.rect(cx - 9, cy - 3, 19, 14, hr, K, 2);
    q.rect(cx - 10, cy + 7, 21, 13, sh, K, 3); q.shade({ [sh]: q.dk(sh, .2) }, [0, cy + 7, 23, 13], 2);
    q.rect(cx - 3, cy + 7, 7, 2, W, K).set(cx, cy + 8, SK);
    q.circ(cx, cy, 8, SK, K);
    for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) {
      if (q.get(cx + i, cy + j) !== SK) continue;
      if (j <= -5 || (j <= -3 && (i <= -2 || i >= 3 || o.long)) || (Math.abs(i) >= 7 && j <= 1) || (o.long && Math.abs(i) >= 6 && j <= 4)) q.set(cx + i, cy + j, hr);
    }
    if (o.tuft) q.spr(cx - 2, cy - 10, ["K..K.", "KK.KK", "KHHHK"].map(r => r), { K, H: hr });
    q.set(cx - 4, cy - 6, hl).set(cx - 3, cy - 6, hl).set(cx - 5, cy - 5, hl);
    q.shade({ [SK]: SKD }, [cx - 8, cy - 8, 17, 17], 1);
    if (f == 2) { q.line(cx - 4, cy + 1, cx - 3, cy + 1, K); q.line(cx + 3, cy + 1, cx + 4, cy + 1, K) }
    else { q.rect(cx - 4, cy, 2, 2, K).set(cx - 4, cy, W); q.rect(cx + 3, cy, 2, 2, K).set(cx + 3, cy, W) }
    if (o.glasses) { q.rect(cx - 6, cy - 1, 5, 4, null, K); q.rect(cx + 2, cy - 1, 5, 4, null, K); q.line(cx - 1, cy, cx + 1, cy, K) }
    q.set(cx - 6, cy + 3, PK).set(cx - 5, cy + 3, PK).set(cx + 5, cy + 3, PK).set(cx + 6, cy + 3, PK);
    if (f == 1) q.rect(cx - 1, cy + 4, 3, 3, K).set(cx, cy + 5, C.O);
    else q.set(cx - 1, cy + 5, K).set(cx, cy + 5, K).set(cx + 1, cy + 5, K).set(cx - 2, cy + 4, K).set(cx + 2, cy + 4, K);
  };
  const KX = [14, 39, 64], KY = 48;
  const LOOK = [{ shirt: T, hair: K, glasses: 1, tuft: 1 }, { shirt: V, hair: HB, long: 1 }, { shirt: O, hair: K, bun: 1 }];
  const TURN = [[.02, .33], [.35, .66], [.68, .99]];
  const kidAt = (i, u) => {
    const e = env(u, ...TURN[i]);
    let y = KY + .5 * E.sin(u + i / 6, 2) - e * 1.1 * Math.abs(Math.sin(u * 2 * Math.PI * 7));
    let r = e * 3 * E.sin(u, 3), sx = 1, sy = 1 + e * .03 * E.sin(u, 7);
    if (i == 1) { const h = hop(u, .36, 4); y += h.y; sx *= h.sx; sy *= h.sy }
    const talk = e > .3 && E.sin(u, 9) > 0;
    const blink = [[.5, .53], [.82, .85], [.2, .23]][i], bl = u > blink[0] && u < blink[1];
    return { x: KX[i], y, r, sx, sy, f: talk ? 1 : bl ? 2 : 0 };
  };
  const kid = i => ({ w: 23, h: 32, ax: 11, ay: 31, frames: 3, draw: (q, c, f) => bust(q, LOOK[i], f), at: u => kidAt(i, u) });
  /* gelembung bicara; ikon 7x7 di tengah */
  const ICON = {
    q: [[".VVVV.", "VV..VV", "....VV", "...VV.", "..VV..", "......", "..VV.."], { V }],
    bulb: [["..KKK..", ".KYYYK.", "KYWYYYK", "KYYYYYK", ".KYYYK.", "..KGK..", "..KKK.."], { K, Y, W, G }],
    heart: [[".KK.KK.", "KOOKOOK", "KOWOOOK", "KOOOOOK", ".KOOOK.", "..KOK..", "...K..."], { K, O, W }]
  };
  const bubble = (icon, right, tip, t) => ({ w: 15, h: 15, ax: right ? 11 : 3, ay: 14,
    draw(q) {
      q.rect(0, 0, 15, 12, W, K, 1); q.shade({ [W]: WD }, [0, 0, 15, 12], 1);
      if (right) q.spr(8, 11, ["KWWK", ".KWK", "..KK", "...K"], { K, W }); else q.spr(3, 11, ["KWWK", "KWK.", "KK..", "K..."], { K, W });
      const [rows, pal] = ICON[icon]; q.spr(icon == "q" ? 5 : 4, 2, rows, pal);
      if (icon == "heart") q.shade({ [O]: OD }, [4, 2, 7, 7], 1);
    },
    at: u => { const p = pop(u, t[0], t[0] + .07, t[1], t[1] + .05); return { x: tip[0], y: tip[1] + .4 * E.sin(u, 2), r: 8 * E.wob(E.seg(u, t[0], t[0] + .25), 2, 5) * (right ? -1 : 1), ...p } } });
  const starSpr = (col, s = 1) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, s) });
  const miniHeart = { w: 5, h: 4, ax: 2, ay: 2, draw: q => q.spr(0, 0, [".O.O.", "OOOOO", ".OOO.", "..O.."], { O }) };

  GLPIX.def("komunitas", {
    dur: 4.4, still: .55,
    base(p, c) {
      const fl = p.dk(c, .2); p.rect(0, 55, 78, 5, fl); p.line(0, 55, 77, 55, K);
      for (let x = 4; x < 78; x += 10) p.set(x, 57, p.dk(fl, .15)).set(x + 1, 57, p.dk(fl, .15));
      /* jendela kiri atas */
      p.rect(3, 4, 10, 11, p.lt(c, .6), K, 1); p.line(8, 5, 8, 13, K); p.line(4, 9, 11, 9, K); p.set(5, 6, W).set(6, 6, W).set(5, 7, W);
    },
    parts: [
      /* lengan anak tengah (di belakang badannya), terangkat saat dapat ide */
      { w: 7, h: 14, ax: 3, ay: 12,
        draw(q) { q.stick(3, 12, 3, 4, V); q.circ(3, 2, 2, SK, K) },
        at: u => {
          const k = kidAt(1, u), rr = k.r * Math.PI / 180, ox = 8 * k.sx, oy = -9 * k.sy;
          const up = E.back(E.seg(u, .38, .45)), down = E.io(E.seg(u, .58, .65));
          const k2 = up * (1 - down), ang = E.lerp(130, 28, k2) + 14 * E.sin(E.seg(u, .45, .58), 2) * (1 - down);
          return { o: k2 > .01 ? 1 : 0, x: k.x + ox * Math.cos(rr) - oy * Math.sin(rr), y: k.y + ox * Math.sin(rr) + oy * Math.cos(rr), r: ang };
        } },
      kid(0), kid(1), kid(2),
      /* meja kayu */
      { w: 74, h: 15, ax: 0, ay: 0,
        draw(q) {
          const top = q.lt(BR, .3);
          q.stick(5, 7, 5, 14, BD); q.stick(68, 7, 68, 14, BD);
          q.rect(0, 0, 74, 4, top, K, 1); q.rect(2, 3, 70, 5, BR, K);
          q.shade({ [BR]: BD, [top]: BR }, [0, 0, 74, 8], 1); q.line(3, 1, 26, 1, q.lt(top, .4));
        },
        at: () => ({ x: 2, y: 42 }) },
      /* buku terbuka anak kiri, halamannya dibalik saat ia mulai bicara */
      { w: 18, h: 8, ax: 9, ay: 7, frames: 2,
        draw(q, c, f) {
          q.rect(0, 5, 18, 3, TD, K); q.rect(1, 1, 8, 6, W, K); q.rect(9, 1, 8, 6, W, K);
          q.line(3, 3, 6, 3, G); q.line(3, 4, 5, 4, G); q.line(11, 3, 14, 3, G); q.line(11, 4, 13, 4, G);
          if (f) { for (let y = 0; y < 7; y++) for (let x = 10; x < 18; x++) q.g[y][x] = null; q.rect(10, 5, 8, 3, TD, K); q.rect(8, 0, 3, 7, W, K) }
        },
        at: u => ({ x: 15, y: 43, f: u > .05 && u < .09 ? 1 : 0 }) },
      /* laptop (punggung layar) dengan logo tunas */
      { w: 19, h: 8, ax: 9, ay: 7,
        draw(q) {
          q.rect(0, 0, 19, 7, G, K, 1); q.rect(0, 6, 19, 2, q.dk(G, .25), K);
          q.shade({ [G]: q.dk(G, .15) }, [0, 0, 19, 6], 1); q.set(2, 1, W).set(3, 1, W);
          q.spr(7, 1, ["GG.LL", ".GKL.", "..K.."], { G: GR, L: T, K });
        },
        at: () => ({ x: 39, y: 43 }) },
      /* tumpukan buku anak kanan */
      { w: 14, h: 8, ax: 7, ay: 7,
        draw(q) { q.rect(0, 4, 14, 4, O, K); q.rect(2, 1, 11, 4, T, K); q.line(1, 6, 12, 6, W); q.line(3, 3, 11, 3, W); q.shade({ [O]: OD, [T]: TD }, [0, 0, 14, 8], 1) },
        at: () => ({ x: 65, y: 43 }) },
      bubble("q", false, [18, 20], [.05, .27]),
      bubble("bulb", false, [43, 20], [.40, .60]),
      bubble("heart", true, [60, 20], [.72, .92]),
      { ...starSpr(W), at: u => ({ x: 37, y: 8, ...pop(u, .44, .5, .58, .63) }) },
      { ...starSpr(O), at: u => ({ x: 59, y: 11, ...pop(u, .46, .52, .59, .64) }) },
      ...[0, 1].map(i => ({ ...miniHeart, at: u => { const t = E.seg(u, .78 + i * .05, .95 + i * .03); return { x: [45, 68][i] + 1.2 * E.sin(t, 1), y: 16 - 9 * E.out(t), o: t > 0 && t < 1 ? Math.sin(Math.PI * t) ** .5 : 0, s: .6 + .4 * E.back(E.seg(t, 0, .3)) } } }))
    ]
  });
})();

/* ---- tentang ---- */
(() => { const { C, E } = GLPIX;
  /* Tentang GrowthLab: dua anggota tim melambai di kiri-kanan, Labi (labu Erlenmeyer bertunas) melompat dua kali di tengah,
     tunasnya ikut bergoyang (gerak susulan), hati muncul di puncak lompatan. */
  const { K, W, O, OD, Y, YD, T, TD, V, N, SK, SKD, HB, PK, WD } = C;
  const GL = "#fff7ea", GLD = "#e6dccb", LV = "#9d86ff", LVD = "#7a62e6";
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  /* lompatan Labi: antisipasi pepat, regang naik, mendarat pepat, memantul meredam */
  const hop = (u, t0, H) => {
    const a = E.seg(u, t0, t0 + .05), air = E.seg(u, t0 + .05, t0 + .19), land = E.seg(u, t0 + .19, t0 + .36);
    let y = 0, s = 0;
    if (u >= t0 && u < t0 + .05) s = -.16 * E.out(a);
    else if (air > 0 && air < 1) { y = -H * Math.sin(Math.PI * air); s = air < .3 ? E.lerp(-.16, .12, E.out(air / .3)) : air < .7 ? E.lerp(.12, -.02, E.io(E.seg(air, .3, .55))) : E.lerp(-.02, .08, E.seg(air, .7, 1)) }
    else if (land > 0 && land < 1) s = -.15 * Math.exp(-5 * land) * Math.cos(3 * Math.PI * land);
    return { y, s };
  };
  const labiAt = u => {
    const h1 = hop(u, .07, 8), h2 = hop(u, .47, 8), y = h1.y + h2.y, s = h1.s + h2.s;
    const idle = (y == 0 && s == 0) ? .02 * E.sin(u, 4) : 0;
    const air = y < -.5;
    return { x: 39, y: 50 + y, sx: 1 - (s + idle) * .8, sy: 1 + s + idle, air };
  };
  /* anak berdiri; poros di telapak kaki */
  const kidDraw = (q, o, f) => {
    const cx = 11, cy = 10, sh = o.shirt, hr = o.hair, hl = q.lt(hr, .35), side = o.side;
    if (o.long) q.rect(cx - 9, cy - 3, 19, 15, hr, K, 2);
    /* lengan diam di sisi luar */
    q.stick(cx - 8 * side, 19, cx - 10 * side, 26, sh); q.circ(cx - 10 * side, 27, 1, SK, K);
    q.rect(cx - 6, 27, 5, 7, N, K); q.rect(cx + 2, 27, 5, 7, N, K);
    q.rect(cx - 7, 33, 6, 3, K).set(cx - 6, 33, q.lt(K, .4)); q.rect(cx + 2, 33, 6, 3, K).set(cx + 3, 33, q.lt(K, .4));
    q.rect(cx - 8, 17, 17, 12, sh, K, 2); q.shade({ [sh]: q.dk(sh, .2), [N]: q.lt(N, .15) }, [0, 17, 23, 18], 2);
    q.rect(cx - 3, 17, 7, 2, W, K).set(cx, 18, SK);
    q.circ(cx, cy, 8, SK, K);
    for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) {
      if (q.get(cx + i, cy + j) !== SK) continue;
      if (j <= -5 || (j <= -3 && (i * side <= -2 || i * side >= 3 || o.long)) || (Math.abs(i) >= 7 && j <= 1) || (o.long && Math.abs(i) >= 6 && j <= 4)) q.set(cx + i, cy + j, hr);
    }
    if (o.tuft) q.spr(cx - 2, cy - 10, ["K..K.", "KK.KK", "KHHHK"], { K, H: hr });
    q.set(cx - 4, cy - 6, hl).set(cx - 3, cy - 6, hl).set(cx - 5, cy - 5, hl);
    q.shade({ [SK]: SKD }, [cx - 8, cy - 8, 17, 17], 1);
    if (f == 1) { q.set(cx - 5, cy + 1, K).set(cx - 4, cy, K).set(cx - 3, cy + 1, K); q.set(cx + 3, cy + 1, K).set(cx + 4, cy, K).set(cx + 5, cy + 1, K) }
    else { q.rect(cx - 4, cy, 2, 2, K).set(cx - 4, cy, W); q.rect(cx + 3, cy, 2, 2, K).set(cx + 3, cy, W) }
    q.set(cx - 6, cy + 3, PK).set(cx - 5, cy + 3, PK).set(cx + 5, cy + 3, PK).set(cx + 6, cy + 3, PK);
    q.rect(cx - 1, cy + 4, 3, 2, K).set(cx, cy + 5, O);
  };
  const KIDS = [{ x: 14, shirt: T, hair: K, tuft: 1, side: 1, ph: 0 }, { x: 64, shirt: Y, hair: HB, long: 1, side: -1, ph: .12 }];
  const kidAt = (i, u) => {
    const k = KIDS[i], b = E.sin(u + k.ph, 4);
    return { x: k.x, y: 50, r: 1.5 * b * k.side, sy: 1 + .02 * Math.abs(b), sx: 1 - .01 * Math.abs(b), f: E.sin(u + k.ph, 2) > .6 ? 1 : 0 };
  };
  const arm = i => ({ w: 7, h: 14, ax: 3, ay: 12,
    draw(q) { const k = KIDS[i]; q.stick(3, 12, 3, 7, k.shirt); q.stick(3, 7, 3, 4, SK); q.circ(3, 2, 2, SK, K); q.set(2, 1, W) },
    at: u => {
      const k = KIDS[i], a = kidAt(i, u), rr = a.r * Math.PI / 180, ox = 8 * k.side * a.sx, oy = -16 * a.sy;
      return { x: a.x + ox * Math.cos(rr) - oy * Math.sin(rr), y: a.y + ox * Math.sin(rr) + oy * Math.cos(rr), r: k.side * (38 + 24 * E.sin(u + k.ph + .1, 4)) };
    } });
  const kid = i => ({ w: 23, h: 37, ax: 11, ay: 35, frames: 2, draw: (q, c, f) => kidDraw(q, KIDS[i], f), at: u => kidAt(i, u) });
  const starSpr = (col, s = 1) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, s) });
  const twinkle = (x, y, col, ph) => ({ ...starSpr(col), at: u => { const t = (u * 2 + ph) % 1, k = Math.sin(Math.PI * E.seg(t, 0, .4)); return { x, y, s: Math.max(k, .001), r: 45 * t, o: k > .03 ? 1 : 0 } } });

  GLPIX.def("tentang", {
    dur: 4, still: .2,
    base(p, c) {
      p.circ(39, 30, 22, p.lt(c, .07)); p.circ(39, 30, 16, p.lt(c, .12));
      const fl = p.dk(c, .22); p.rect(0, 47, 78, 13, fl); p.line(0, 47, 77, 47, K);
      for (let x = 3; x < 78; x += 9) p.set(x, 52 + (x % 3), p.dk(fl, .15)).set(x + 1, 52 + (x % 3), p.dk(fl, .15));
    },
    parts: [
      twinkle(6, 8, Y, 0), twinkle(72, 12, W, .35), twinkle(30, 6, W, .7), twinkle(52, 9, Y, .15),
      /* bayangan Labi */
      { w: 19, h: 3, ax: 9, ay: 1, draw: q => q.ell(9, 1, 9, 1, "rgba(20,10,60,.35)"), at: u => { const l = labiAt(u), k = E.cl((50 - l.y) / 8); return { x: 39, y: 50, sx: 1 - .45 * k, sy: 1 - .3 * k, o: 1 - .4 * k } } },
      arm(0), arm(1), kid(0), kid(1),
      /* Labi */
      { w: 33, h: 30, ax: 16, ay: 28, frames: 3,
        draw(q, c, f) {
          const o = 2;
          q.rect(o + 4, 26, 6, 3, K); q.rect(o + 18, 26, 6, 3, K);          /* kaki */
          q.poly([[o + 11, 2], [o + 17, 2], [o + 17, 7], [o + 26, 21], [o + 27, 24], [o + 25, 26], [o + 3, 26], [o + 1, 24], [o + 2, 21], [o + 11, 7]], GL, K);
          for (let y = 18; y < 26; y++) for (let x = 0; x < 33; x++) if (q.get(x, y) === GL) q.set(x, y, y == 18 ? q.lt(O, .35) : O);
          q.rect(o + 9, 0, 11, 3, GL, K, 1);
          q.spr(o - 1, 18, ["..K.", ".KWK", "KWWK", ".KK."], { K, W: GL }); q.spr(o + 26, 18, [".K..", "KWK.", "KWWK", ".KK."], { K, W: GL });   /* tangan kecil */
          q.shade({ [GL]: GLD, [O]: OD }, [0, 0, 33, 27], 1);
          q.set(o + 12, 3, W).set(o + 12, 4, W).set(o + 9, 11, W).set(o + 8, 13, W);
          q.set(o + 7, 21, W).set(o + 20, 23, q.lt(O, .45)).set(o + 12, 24, q.lt(O, .45)).set(o + 21, 20, W);
          const cx = o + 14;
          if (f == 1) { q.set(cx - 5, 14, K).set(cx - 4, 13, K).set(cx - 3, 14, K); q.set(cx + 3, 14, K).set(cx + 4, 13, K).set(cx + 5, 14, K) }
          else if (f == 2) { q.line(cx - 5, 14, cx - 3, 14, K); q.line(cx + 3, 14, cx + 5, 14, K) }
          else { q.rect(cx - 5, 12, 2, 3, K).set(cx - 5, 12, W); q.rect(cx + 4, 12, 2, 3, K).set(cx + 4, 12, W) }
          q.set(cx - 7, 16, PK).set(cx - 6, 16, PK).set(cx + 6, 16, PK).set(cx + 7, 16, PK);
          if (f == 1) q.rect(cx - 1, 15, 3, 2, K).set(cx, 16, q.lt(O, .2)); else q.set(cx - 1, 16, K).set(cx, 17, K).set(cx + 1, 16, K);
        },
        at: u => { const l = labiAt(u); return { x: l.x, y: l.y, sx: l.sx, sy: l.sy, f: l.air ? 1 : (u > .86 && u < .89) ? 2 : 0 } } },
      /* tunas: gerak susulan mengikuti kecepatan lompatan */
      { w: 21, h: 11, ax: 10, ay: 10,
        draw(q) {
          q.stick(10, 10, 10, 6, TD);
          q.ell(5, 5, 5, 3, T, K); q.ell(15, 4, 5, 3, LV, K);
          q.shade({ [T]: TD, [LV]: LVD }, [0, 0, 21, 11], 1); q.set(3, 4, q.lt(T, .5)).set(4, 3, q.lt(T, .5)).set(13, 3, q.lt(LV, .5)).set(14, 2, q.lt(LV, .5));
        },
        at: u => {
          const l = labiAt(u), vy = (labiAt(u + .01).y - labiAt(u - .01).y) / .02;
          return { x: l.x, y: l.y - 27 * l.sy, r: Math.max(-14, Math.min(14, vy * .12)) + 9 * E.wob(E.seg(u, .26, .5), 2, 4) + 9 * E.wob(E.seg(u, .66, .9), 2, 4) + 2 * E.sin(u, 2), sx: 1 + (l.sx - 1) * .5, sy: 1 + (l.sy - 1) * .5 };
        } },
      ...[.19, .59].map(t => ({ w: 9, h: 8, ax: 4, ay: 4,
        draw: q => { q.spr(0, 0, [".KK.KK.", "KPPKPPK", "KPWPPPK", "KPPPPPK", ".KPPPK.", "..KPK..", "...K..."], { K, P: PK }); q.shade({ [PK]: q.dk(PK, .15) }, [0, 0, 9, 8], 1) },
        at: u => { const k = pop(u, t - .02, t + .05, t + .2, t + .26), r = E.out(E.seg(u, t, t + .26)); return { x: (t > .5 ? 53 : 25) + (t > .5 ? 2 : -2) * r, y: 14 - 7 * r, r: 10 * E.wob(E.seg(u, t, t + .2), 2, 4), ...k } } }))
    ]
  });
})();

/* ---- k0 ---- */
(() => { const { C, E } = GLPIX;
  /* Bedah lowongan bareng: poster LOKER tertempel di papan gabus. Kaca pembesar meluncur halus memindai baris demi baris,
     berhenti di gaji yang terlalu muluk (50JT), lingkaran merah tergambar, lencana "!" meletup dan poster bergoyang di pinnya. */
  const { K, W, O, OD, Y, YD, T, TD, BR, BD, G, WD, V } = C;
  const CORK = "#d9a066", CORKD = "#b97f45", RED = "#ff3b5c", REDD = "#c81e44";
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  /* lintasan halus: Catmull-Rom berwaktu (keys: [u,x,y]), kecepatan nol di titik tahan */
  const path = (u, K_) => {
    u = ((u % 1) + 1) % 1; let i = 0; while (i < K_.length - 2 && u > K_[i + 1][0]) i++;
    const P = j => K_[Math.max(0, Math.min(K_.length - 1, j))], a = P(i), b = P(i + 1), dt = b[0] - a[0] || 1, t = E.cl((u - a[0]) / dt);
    const tan = j => { const p0 = P(j - 1), p1 = P(j), p2 = P(j + 1); if (j <= 0 || j >= K_.length - 1) return [0, 0];
      if ((p0[1] == p1[1] && p0[2] == p1[2]) || (p2[1] == p1[1] && p2[2] == p1[2])) return [0, 0];
      const d = p2[0] - p0[0]; return [(p2[1] - p0[1]) / d, (p2[2] - p0[2]) / d] };
    const m0 = tan(i), m1 = tan(i + 1), t2 = t * t, t3 = t2 * t, h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
    return [h00 * a[1] + h10 * dt * m0[0] + h01 * b[1] + h11 * dt * m1[0], h00 * a[2] + h10 * dt * m0[1] + h01 * b[2] + h11 * dt * m1[1]];
  };
  /* kaca pembesar: masuk dari kanan bawah, memindai, tahan di "50JT", lalu kembali */
  const KEYS = [[0, 57, 43], [.05, 57, 43], [.16, 29, 21], [.25, 47, 23], [.34, 29, 27], [.43, 33, 32], [.55, 33, 32], [.65, 45, 41], [.8, 49, 42], [.92, 57, 43], [1, 57, 43]];
  const glassAt = u => {
    const [x, y] = path(u, KEYS), [x2] = path(u + .01, KEYS), [x0] = path(u - .01, KEYS), vx = (x2 - x0) / .02;
    const zoom = E.back(E.seg(u, .45, .52)) * (1 - E.io(E.seg(u, .55, .62)));
    const bob = .6 * E.sin(u, 3);
    return { x, y: y + bob, r: -12 + Math.max(-14, Math.min(14, vx * .06)), s: 1 + .14 * zoom };
  };
  const shake = u => E.wob(E.seg(u, .56, .9), 2.5, 4);

  GLPIX.def("k0", {
    dur: 4.4, still: .74,
    base(p, c) {
      const wl = p.dk(c, .18); p.rect(0, 51, 78, 9, wl); p.line(0, 51, 77, 51, K);
      for (let x = 5; x < 78; x += 11) p.set(x, 55, p.dk(wl, .15)).set(x + 1, 55, p.dk(wl, .15));
      /* papan gabus berbingkai kayu */
      p.rect(4, 4, 70, 44, BR, K, 1); p.rect(7, 7, 64, 38, CORK, K);
      p.shade({ [BR]: BD }, [4, 4, 70, 44], 1); p.line(5, 5, 30, 5, p.lt(BR, .35));
      for (let y = 8; y < 44; y++) for (let x = 8; x < 70; x++) if ((x * 5 + y * 11) % 17 == 0) p.set(x, y, CORKD);
      p.rect(4, 47, 70, 2, BD); p.line(4, 48, 73, 48, K);
      /* catatan tempel kiri & kanan */
      p.rect(9, 10, 11, 11, Y, K); p.shade({ [Y]: YD }, [9, 10, 11, 11], 1); p.line(11, 13, 17, 13, YD); p.line(11, 15, 16, 15, YD); p.line(11, 17, 15, 17, YD);
      p.circ(14, 10, 1, T, K);
      p.rect(59, 26, 10, 10, T, K); p.shade({ [T]: TD }, [59, 26, 10, 10], 1); p.line(61, 29, 66, 29, W); p.line(61, 31, 65, 31, W);
      p.circ(64, 26, 1, V, K);
      p.rect(10, 28, 9, 13, W, K); p.shade({ [W]: WD }, [10, 28, 9, 13], 1); p.rect(12, 30, 5, 4, p.lt(T, .4)); p.line(12, 36, 16, 36, G); p.line(12, 38, 15, 38, G);
    },
    parts: [
      /* poster lowongan, berayun dari pin di atas */
      { w: 34, h: 40, ax: 17, ay: 1,
        draw(q) {
          q.rect(0, 1, 34, 38, W, K); q.shade({ [W]: WD }, [0, 1, 34, 38], 1);
          q.rect(0, 1, 34, 10, O, K); q.shade({ [O]: OD }, [0, 1, 34, 10], 1);
          q.text(Math.round((34 - q.textW("LOKER")) / 2), 4, "LOKER", W);
          q.circ(17, 1, 1, RED, K); q.set(16, 0, W);
          [[14, 26], [17, 20], [20, 24]].forEach(([y, l]) => { q.line(4, y, 4 + l - 1, y, G); });
          q.text(4, 24, "50JT", K);
          q.line(4, 32, 25, 32, G); q.line(4, 35, 18, 35, G);
          q.rect(24, 33, 6, 4, q.lt(T, .3), K);
        },
        at: u => ({ x: 39, y: 7, r: 3 * shake(u) + .6 * E.sin(u, 2) }) },
      /* lingkaran spidol merah di sekitar "50JT" (ikut ayunan poster) */
      { w: 23, h: 13, ax: 11, ay: 6,
        draw(q) { q.ell(11, 6, 10, 5, null, RED); q.ell(11, 6, 9, 4, null, RED); q.set(20, 2, RED).set(21, 1, RED) },
        at: u => { const k = E.back(E.seg(u, .47, .55)) * (1 - E.io(E.seg(u, .84, .9))), a = 3 * shake(u) * Math.PI / 180;
          const ox = -6, oy = 25; return { x: 39 + ox * Math.cos(a) - oy * Math.sin(a), y: 7 + ox * Math.sin(a) + oy * Math.cos(a), r: 3 * shake(u) - 4, s: Math.max(k, .001), o: k > .02 ? 1 : 0 } } },
      /* kaca pembesar */
      { w: 24, h: 24, ax: 8, ay: 8,
        draw(q) {
          q.line(13, 13, 21, 21, K, 4); q.line(14, 14, 20, 20, BR, 2); q.set(15, 14, q.lt(BR, .35)).set(17, 16, q.lt(BR, .35));
          q.circ(8, 8, 7, "rgba(220,238,255,.28)", K); q.circ(8, 8, 6, null, "#b9c4ec");
          q.set(4, 5, W).set(5, 4, W).set(4, 6, W).set(6, 3, W).set(11, 12, W);
        },
        at: u => glassAt(u) },
      /* lencana peringatan "!" */
      { w: 15, h: 15, ax: 7, ay: 7,
        draw(q) { q.circ(7, 7, 6, RED, K); q.shade({ [RED]: REDD }, [0, 0, 15, 15], 1); q.rect(6, 3, 3, 6, W).rect(6, 10, 3, 2, W); q.set(4, 4, q.lt(RED, .5)) },
        at: u => { const k = pop(u, .56, .64, .84, .9); return { x: 59, y: 19 + .8 * E.sin(u, 4), r: 14 * E.wob(E.seg(u, .56, .8), 2.5, 4), ...k } } },
      /* garis kejut di sekitar lencana */
      { w: 21, h: 21, ax: 10, ay: 10,
        draw(q) { q.line(10, 0, 10, 1, W); q.line(2, 3, 3, 4, W); q.line(18, 3, 17, 4, W); q.line(0, 11, 1, 11, W) },
        at: u => { const k = E.out(E.seg(u, .58, .7)); return { x: 59, y: 19, s: .7 + .5 * k, o: k > 0 && k < 1 ? 1 - k * k : 0 } } },
      ...[[69, 11, Y, .6], [15, 25, W, .64], [69, 41, W, .68]].map(([x, y, col, t]) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 1),
        at: u => { const k = pop(u, t, t + .07, t + .16, t + .22); return { x, y, r: 90 * E.seg(u, t, t + .22), ...k } } }))
    ]
  });
})();

/* ---- k1 ---- */
(() => { const { C, E } = GLPIX;
  /* Latihan wawancara berpasangan: dua anak duduk berhadapan di meja kecil.
     Kiri (pewawancara, papan klip) bertanya "?" sambil condong; kanan mengangguk mendengarkan,
     lalu menjawab dengan metode STAR (huruf muncul satu per satu, tangan bergestur); kiri mengangguk dan mencatat, bintang meletup. */
  const { K, W, O, Y, YD, T, TD, V, VD, BR, BD, SK, SKD, HB, PK, G, WD, N } = C;
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  const env = (u, a, b, e = .05) => E.io(E.seg(u, a, a + e)) * (1 - E.io(E.seg(u, b - e, b)));
  const nod = (u, a, n = 2, len = .14) => { const t = E.seg(u, a, a + len); return t > 0 && t < 1 ? Math.sin(Math.PI * t) * Math.abs(Math.sin(n * Math.PI * t)) : 0 };
  const KIDS = [
    { x: 15, dir: 1, shirt: T, hair: K, glasses: 1, tuft: 1, talk: [.03, .36], lean: [.02, .4] },
    { x: 63, dir: -1, shirt: V, hair: HB, long: 1, talk: [.45, .8], lean: [.43, .84] }
  ];
  const SEAT = 46;
  const bodyAt = (i, u) => {
    const k = KIDS[i], ln = env(u, ...k.lean, .08), br = E.sin(u + i * .3, 2);
    return { x: k.x, y: SEAT, r: k.dir * (1 + 3 * ln), sx: 1 - .012 * br, sy: 1 + .02 * br };
  };
  /* titik relatif badan (ox,oy dari poros bawah) setelah transformasi badan */
  const attach = (b, ox, oy) => { const a = b.r * Math.PI / 180, X = ox * b.sx, Y_ = oy * b.sy; return [b.x + X * Math.cos(a) - Y_ * Math.sin(a), b.y + X * Math.sin(a) + Y_ * Math.cos(a)] };
  const talking = (i, u) => { const [a, b] = KIDS[i].talk; return u > a + .02 && u < b - .03 && E.sin(u, 15) > -.2 };
  const headAt = (i, u) => {
    const k = KIDS[i], b = bodyAt(i, u), [x, y] = attach(b, 0, -13);
    const nd = i == 1 ? 9 * (nod(u, .17, 2, .16) + nod(u, .86, 1, .1) * .6) : 9 * nod(u, .6, 2, .16);
    const tk = env(u, ...k.talk, .05) * 2.5 * E.sin(u, 6);
    const bl = i == 0 ? (u > .52 && u < .545) : (u > .3 && u < .325) || (u > .93 && u < .955);
    return { x, y: y + nd * .08, r: b.r + k.dir * (nd + tk), f: talking(i, u) ? 1 : bl ? 2 : 0 };
  };
  const headDraw = (q, o, f) => {
    const cx = 9, cy = 9, hr = o.hair, hl = q.lt(hr, .35), d = o.dir;
    if (o.long) q.rect(cx - 9, cy - 3, 19, 15, hr, K, 2);
    q.circ(cx, cy, 8, SK, K);
    for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) {
      if (q.get(cx + i, cy + j) !== SK) continue;
      if (j <= -5 || (j <= -3 && (i * d <= -2 || i * d >= 4 || o.long)) || (i * d <= -6 && j <= 2) || (i * d >= 7 && j <= 0) || (o.long && Math.abs(i) >= 6 && j <= 4)) q.set(cx + i, cy + j, hr);
    }
    if (o.tuft) q.spr(cx - 2, cy - 10, ["K..K.", "KK.KK", "KHHHK"], { K, H: hr });
    q.set(cx - 4, cy - 6, hl).set(cx - 3, cy - 6, hl).set(cx - 5, cy - 5, hl);
    q.shade({ [SK]: SKD }, [cx - 8, cy - 8, 17, 17], 1);
    const ex = [cx - 4 + d, cx + 3 + d];
    if (f == 2) ex.forEach(x => q.line(x, cy + 1, x + 1, cy + 1, K));
    else ex.forEach(x => q.rect(x, cy, 2, 2, K).set(x + (d > 0 ? 1 : 0), cy, W));
    if (o.glasses) { q.rect(ex[0] - 2, cy - 1, 5, 4, null, K); q.rect(ex[1] - 1, cy - 1, 5, 4, null, K); q.line(ex[0] + 3, cy, ex[1] - 1, cy, K) }
    q.set(cx - 6 + d, cy + 3, PK).set(cx - 5 + d, cy + 3, PK).set(cx + 5 + d, cy + 3, PK).set(cx + 6 + d, cy + 3, PK);
    const mx = cx + d;
    if (f == 1) q.rect(mx - 1, cy + 4, 3, 3, K).set(mx, cy + 5, O);
    else q.set(mx - 1, cy + 5, K).set(mx, cy + 5, K).set(mx + 1, cy + 5, K).set(mx - 2, cy + 4, K).set(mx + 2, cy + 4, K);
  };
  const bodyDraw = (q, o) => {
    const sh = o.shirt;
    q.rect(0, 0, 23, 15, sh, K, 3); q.shade({ [sh]: q.dk(sh, .22) }, [0, 0, 23, 15], 2);
    q.set(3, 2, q.lt(sh, .35)).set(4, 2, q.lt(sh, .35)).set(3, 3, q.lt(sh, .35));
    q.rect(8, 0, 7, 3, W, K).set(11, 1, SK).set(11, 2, SK);
    if (o.glasses) q.spr(10, 2, ["KOK", ".K.", "KOK", "KOK", "KOK", ".K."], { K, O: Y });
  };
  /* lengan: sprite mengarah ke atas, poros di bahu */
  const armAt = (i, u) => {
    const k = KIDS[i], b = bodyAt(i, u), [x, y] = attach(b, 8 * k.dir, -10);
    let r;
    if (i == 0) { const lift = E.back(E.seg(u, .03, .12)) * (1 - E.io(E.seg(u, .33, .42))), wr = env(u, .6, .8, .03) * 4 * E.sin(u, 12);
      r = 128 - 30 * lift + wr }
    else { const g = E.back(E.seg(u, .47, .56)) * (1 - E.io(E.seg(u, .76, .84)));
      r = -128 + 88 * g + g * 10 * E.sin(E.seg(u, .56, .76), 2) }
    return { x, y, r };
  };
  const arm = i => ({ w: 7, h: 13, ax: 3, ay: 11,
    draw(q) { const sh = KIDS[i].shirt; q.stick(3, 11, 3, 6, sh); q.stick(3, 6, 3, 4, SK); q.circ(3, 2, 2, SK, K); q.set(2, 1, W) },
    at: u => armAt(i, u) });
  const hand = (i, u, L = 9.5) => { const a = armAt(i, u), t = a.r * Math.PI / 180; return [a.x + L * Math.sin(t), a.y - L * Math.cos(t), a.r] };
  const LETTERS = ["S", "T", "A", "R"], LC = [O, T, V, YD];

  GLPIX.def("k1", {
    dur: 5, still: .76,
    base(p, c) {
      p.circ(39, 24, 21, p.lt(c, .08)); p.circ(39, 24, 15, p.lt(c, .14));
      const fl = p.dk(c, .2); p.rect(0, 50, 78, 10, fl); p.line(0, 50, 77, 50, K);
      for (let x = 4; x < 78; x += 10) p.set(x, 54 + (x % 3), p.dk(fl, .15)).set(x + 1, 54 + (x % 3), p.dk(fl, .15));
      /* kursi: sandaran di sisi luar, dudukan, kaki */
      [[15, 1], [63, -1]].forEach(([x, d]) => {
        p.rect(d > 0 ? 3 : 71, 27, 4, 21, BR, K, 1);
        p.rect(x - 11, 45, 23, 3, BR, K); p.stick(x - 9, 48, x - 9, 52, BD); p.stick(x + 9, 48, x + 9, 52, BD);
        p.shade({ [BR]: BD }, [x - 15, 28, 31, 22], 1);
      });
      /* meja kecil */
      p.stick(39, 41, 39, 50, BD); p.rect(33, 50, 13, 2, BD, K);
      const top = p.lt(BR, .3); p.rect(28, 37, 23, 3, top, K, 1); p.rect(29, 39, 21, 3, BR, K);
      p.shade({ [BR]: BD, [top]: BR }, [28, 37, 23, 5], 1); p.line(30, 38, 38, 38, p.lt(top, .4));
      /* cangkir & kertas CV di meja */
      p.rect(36, 32, 6, 6, W, K); p.shade({ [W]: WD }, [36, 32, 6, 6], 1); p.set(42, 34, K).set(43, 34, K).set(43, 35, K).set(42, 36, K); p.rect(37, 33, 4, 1, p.lt(T, .2));
      p.line(37, 30, 37, 31, WD); p.line(39, 29, 39, 31, WD);
    },
    parts: [
      arm(0), arm(1),
      ...[0, 1].map(i => ({ w: 23, h: 15, ax: 11, ay: 14, draw: q => bodyDraw(q, KIDS[i]), at: u => bodyAt(i, u) })),
      ...[0, 1].map(i => ({ w: 19, h: 21, ax: 9, ay: 17, frames: 3, draw: (q, c, f) => headDraw(q, KIDS[i], f), at: u => headAt(i, u) })),
      /* papan klip pewawancara, menempel di tangan kiri */
      { w: 11, h: 13, ax: 3, ay: 9,
        draw(q) { q.rect(0, 1, 10, 12, BR, K, 1); q.rect(1, 3, 8, 9, W, K); q.rect(3, 0, 4, 3, G, K); q.line(3, 6, 7, 6, G); q.line(3, 8, 6, 8, G); q.line(3, 10, 7, 10, G); q.shade({ [W]: WD }, [1, 3, 8, 9], 1) },
        at: u => { const [x, y] = hand(0, u, 9); return { x, y, r: -8 + 4 * E.sin(u, 2) } } },
      /* pena mencatat */
      { w: 3, h: 8, ax: 1, ay: 7,
        draw(q) { q.line(1, 0, 1, 5, K, 3); q.line(1, 1, 1, 5, Y); q.set(1, 7, K).set(1, 6, SK) },
        at: u => { const [x, y] = hand(0, u, 9), w = env(u, .6, .8, .04); return { x: x + 4 + 2 * w * E.sin(u, 10), y: y + 3 + 1.5 * w * E.sin(u, 20), r: 20, o: w > .02 ? 1 : 0, s: .6 + .4 * w } } },
      /* gelembung "?" */
      { w: 15, h: 15, ax: 3, ay: 14,
        draw(q) { q.rect(0, 0, 15, 12, W, K, 1); q.shade({ [W]: WD }, [0, 0, 15, 12], 1); q.spr(3, 11, ["KWWK", "KWK.", "KK..", "K..."], { K, W });
          q.spr(5, 2, [".VVVV.", "VV..VV", "....VV", "...VV.", "..VV..", "......", "..VV.."], { V }) },
        at: u => { const p = pop(u, .04, .11, .37, .42); return { x: 22, y: 16 + .4 * E.sin(u, 2), r: 9 * E.wob(E.seg(u, .04, .3), 2, 5), ...p } } },
      /* gelembung STAR: huruf muncul satu per satu */
      { w: 23, h: 15, ax: 18, ay: 14, frames: 5,
        draw(q, c, f) { q.rect(0, 0, 23, 12, W, K, 1); q.shade({ [W]: WD }, [0, 0, 23, 12], 1); q.spr(15, 11, ["KWWK", ".KWK", "..KK", "...K"], { K, W });
          for (let k = 0; k < f; k++) q.text(4 + k * 4, 4, LETTERS[k], LC[k]) },
        at: u => { const p = pop(u, .46, .53, .84, .89), f = 1 + Math.floor(E.seg(u, .49, .66) * 3.999); return { x: 56, y: 16 + .4 * E.sin(u, 2), r: -8 * E.wob(E.seg(u, .46, .7), 2, 5), f, ...p } } },
      /* bintang pujian */
      ...[[33, 9, Y, .74], [46, 20, W, .78], [70, 9, W, .8]].map(([x, y, col, t]) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 1),
        at: u => { const k = pop(u, t, t + .06, t + .14, t + .19); return { x, y: y - 2 * E.out(E.seg(u, t, t + .19)), r: 90 * E.seg(u, t, t + .19), ...k } } }))
    ]
  });
})();

/* ---- k2 ---- */
(() => { const { C, E } = GLPIX; GLPIX.def("k2", {
  /* Lingkaran umpan balik: empat anak duduk mengelilingi karpet bundar; hati umpan balik berpindah halus searah jarum jam
     dari satu anak ke anak berikutnya (antisipasi, melengkung, mendarat dengan pantulan); penerima melompat kecil & tersenyum lebar */
  dur: 4.4, still: .1,
  base(p, c) {
    const { K, W, O, OD, Y } = C;
    const cx = 39, cy = 34;
    /* karpet bundar hangat */
    const rug = p.mix(Y, W, .62), rugD = p.mix(Y, W, .2), rugS = p.mix(Y, W, .42);
    p.ell(cx, cy + 2, 13, 8, p.dk(c, .22));
    p.ell(cx, cy, 13, 8, rug, K);
    p.ell(cx, cy, 10, 6, rugD);
    p.ell(cx, cy, 8, 4, rug);
    p.shade({ [rug]: rugS, [rugD]: p.dk(rugD, .12) }, [cx - 13, cy - 8, 27, 17], 1);
    for (let a = 0; a < 14; a++) { const t = a / 14 * 2 * Math.PI; p.set(cx + Math.round(11.5 * Math.cos(t)), cy + Math.round(7 * Math.sin(t)), O) }
    p.spr(cx - 3, cy - 2, [".O.O.", "OOOOO", ".OOO.", "..O.."], { O: OD }).set(cx - 2, cy - 2, OD);
    /* lintasan melingkar putus-putus + mata panah searah jarum jam (jalur hati) */
    const rx = 21, ry = 19.8, col = p.lt(c, .78);
    const N = 110;
    for (let k = 0; k < N; k++) { if (k % 5 >= 3) continue; const a = k / N * 2 * Math.PI; p.set(cx + Math.round(rx * Math.cos(a)), cy + Math.round(ry * Math.sin(a)), col) }
    /* mata panah: atas ke kanan, kanan ke bawah, bawah ke kiri, kiri ke atas */
    p.spr(cx - 1, cy - 20 - 3, ["K...", "KK..", "KWK.", "KWWK", "KWK.", "KK..", "K..."], { K, W: col });
    p.spr(cx + 21 - 3, cy - 1, ["KKKKKKK", ".KWWWK.", "..KWK..", "...K..."], { K, W: col });
    p.spr(cx - 2, cy + 20 - 3, ["...K", "..KK", ".KWK", "KWWK", ".KWK", "..KK", "...K"], { K, W: col });
    p.spr(cx - 21 - 3, cy - 2, ["...K...", "..KWK..", ".KWWWK.", "KKKKKKK"], { K, W: col });
  },
  parts: (() => {
    const { K, W, SK, SKD, PK, O, OD, Y, V, HB } = C;
    /* anak (kepala + bahu) 21x21, poros tengah bawah. f: 0 senyum, 1 senang, 2 kedip */
    const bust = (shirt, hair, long) => (q, c, f) => {
      const x = 10, y = 7, sd = q.dk(shirt, .22);
      q.ell(10, 21, 8, 7, shirt, K); q.line(3, 20, 17, 20, K); q.shade({ [shirt]: sd }, [1, 13, 19, 8], 2);
      q.set(4, 16, q.lt(shirt, .4)).set(5, 15, q.lt(shirt, .4)).set(3, 17, q.lt(shirt, .4));
      q.circ(x, y, 6, SK, K);
      for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) {
        if (q.get(x + i, y + j) !== SK) continue;
        if (j <= -3 || (Math.abs(i) >= 5 && j <= (long ? 3 : 0)) || (j == -2 && (i <= -1 || i >= 3)) ) q.set(x + i, y + j, hair);
      }
      if (long) { q.set(x - 6, y + 3, K).set(x + 6, y + 3, K) }
      q.set(x - 3, y - 4, q.lt(hair, .45)).set(x - 2, y - 5, q.lt(hair, .45)).set(x - 1, y - 5, q.lt(hair, .45));
      q.set(x + 4, y + 3, SKD).set(x + 3, y + 4, SKD).set(x + 5, y + 2, SKD);
      if (f == 1) { q.set(x - 3, y + 1, K).set(x - 2, y, K).set(x - 1, y + 1, K).set(x + 1, y + 1, K).set(x + 2, y, K).set(x + 3, y + 1, K) }
      else if (f == 2) { q.set(x - 3, y + 1, K).set(x - 2, y + 1, K).set(x + 2, y + 1, K).set(x + 3, y + 1, K) }
      else { q.set(x - 2, y, K).set(x - 2, y + 1, K).set(x + 2, y, K).set(x + 2, y + 1, K) }
      q.set(x - 4, y + 2, PK).set(x + 4, y + 2, PK);
      if (f == 1) q.rect(x - 1, y + 3, 3, 2, K).set(x, y + 4, O);
      else q.set(x - 1, y + 4, K).set(x, y + 4, K).set(x + 1, y + 4, K).set(x - 2, y + 3, K).set(x + 2, y + 3, K);
    };
    /* jalur hati: elips melalui empat titik pegang di samping bahu tiap anak */
    const cx = 39, cy = 34, rx = 21, ry = 19.8;
    const A0 = -3 * Math.PI / 4, LEG = .25, HOLD = .3, ARR = .85;
    const ioBack = t => t < .5 ? (1 - E.back(1 - 2 * t)) / 2 : (1 + E.back(2 * t - 1)) / 2;
    const prog = u => { u = ((u % 1) + 1) % 1; const L = Math.floor(u / LEG) % 4, v = (u - L * LEG) / LEG, t = E.seg(v, HOLD, ARR); return { L, v, t, k: L + ioBack(t) } };
    const posAt = u => { const { t, k, v } = prog(u); const a = A0 + k * Math.PI / 2, arc = Math.sin(Math.PI * t);
      return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) - 4 * arc + (t == 0 || t == 1 ? .8 * Math.sin(v * 4 * Math.PI) : 0), arc, t, v } };
    /* selisih fase sejak hati tiba di anak i */
    const since = (u, i) => { const ta = (((i + 3) % 4) * LEG + ARR * LEG) % 1; return ((u - ta) % 1 + 1) % 1 };
    const kidAt = (i, x, y, shirt, hair, long) => ({
      w: 21, h: 21, ax: 10, ay: 20, frames: 3,
      at(u) {
        const d = since(u, i), hop = E.wob(E.seg(d, 0, .22), 1.6, 3.5);
        const L = Math.floor(u / LEG) % 4, v = (u - L * LEG) / LEG;
        const give = L == i ? -E.wob(E.seg(v, .16, .44), 1, 2.5) : 0;   /* membungkuk sebentar lalu meregang saat melepas */
        const br = .02 * E.sin(u + i * .25, 2);
        const blink = Math.abs(((u + i * .29) % 1) - .55) < .015;
        const f = d < .22 || (L == i && v < .42) ? 1 : blink ? 2 : 0;
        return { x, y: y - 2 * Math.max(0, hop), sx: 1 - .1 * hop + .1 * give - br, sy: 1 + .08 * hop - .1 * give + br, f };
      },
      draw: bust(shirt, hair, long)
    });
    const heart = q => {
      q.spr(0, 0, [".KKK.KKK.", "KOOOKOOOK", "KOOOOOOOK", "KOOOOOOOK", ".KOOOOOK.", "..KOOOK..", "...KOK...", "....K...."], { K, O });
      q.shade({ [O]: OD }, [0, 0, 9, 8], 1);
      q.set(2, 2, W).set(2, 3, W).set(3, 2, W);
    };
    const spark = (col, s) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, s) });
    const trail = (lag, col, sc) => ({ ...spark(col, 1), at(u) { const P = posAt(u - lag), Q = posAt(u); const s = sc * Q.arc; return { x: P.x, y: P.y, s: Math.max(s, .001), o: s > .05 ? .95 : 0, r: 360 * u * 3 } } });
    const twinkle = (x, y, col, ph) => ({ ...spark(col, 1), at(u) { const w = (u * 2 + ph) % 1, s = E.back(E.seg(w, 0, .22)) * (1 - E.io(E.seg(w, .4, .62))); return { x, y, s: Math.max(s, .001), o: s > .02 ? 1 : 0, r: 90 * E.io(w) } } });
    return [
      twinkle(39, 6, W, 0), twinkle(5, 33, Y, .33), twinkle(73, 34, W, .66),
      kidAt(0, 12, 26, O, K), kidAt(1, 66, 26, Y, HB, 1), kidAt(3, 12, 56, PK, HB, 1), kidAt(2, 66, 56, V, K),
      trail(.035, W, .9), trail(.018, Y, 1.1),
      { w: 9, h: 8, ax: 4, ay: 4, draw: heart,
        at(u) {
          const P = posAt(u);
          let land = 0; for (let i = 0; i < 4; i++) { const d = since(u, i); if (d < .12) land = E.wob(E.seg(d, 0, .12), 1.5, 3) }
          const beat = P.t == 0 ? .1 * Math.max(0, Math.sin(P.v / HOLD * Math.PI * 2)) : 0, s = 1 + .4 * P.arc + beat;
          return { x: P.x, y: P.y, sx: s * (1 + .25 * land), sy: s * (1 - .25 * land), r: 10 * Math.sin(P.t * Math.PI * 2) };
        } }
    ];
  })()
}); })();

/* ---- k3 ---- */
(() => { const { C, E } = GLPIX; GLPIX.def("k3", {
  /* Peta kekuatan kelompok: tiga anak berdiri di panggung kecil; bergiliran, sebuah bintang berwarna melesat keluar dari atas
     kepala tiap anak (antisipasi, overshoot, berputar pelan) sementara si anak bersorak; lalu garis kilau menyambungkan
     ketiga bintang menjadi rasi bintang kelompok, berdenyut bersama, lalu memudar untuk loop berikutnya */
  dur: 4.4, still: .8,
  base(p, c) {
    const { K, W, Y, T, O } = C;
    /* bintang kecil di langit */
    const s1 = p.lt(c, .45), s2 = p.lt(c, .25);
    [[8, 8], [27, 5], [50, 6], [70, 9], [5, 30], [73, 28], [31, 26], [47, 25], [60, 33], [18, 34]].forEach(([x, y], i) => i % 3 ? p.set(x, y, s2) : p.set(x, y, s1).set(x - 1, y, s2).set(x + 1, y, s2).set(x, y - 1, s2).set(x, y + 1, s2));
    /* panggung */
    const st = p.lt(c, .22), stD = p.lt(c, .1), stL = p.lt(c, .38);
    p.rect(0, 53, 78, 7, stD); p.line(0, 53, 77, 53, K);
    p.rect(2, 43, 74, 13, st, K, 1);
    p.line(3, 44, 74, 44, stL);
    p.rect(3, 51, 72, 4, p.lt(c, .12)); p.line(3, 50, 74, 50, K);
    for (let x = 9; x < 72; x += 10) p.set(x, 52, stL).set(x + 1, 52, stL);
    /* lingkaran pijakan warna kekuatan */
    [[16, Y], [39, T], [62, O]].forEach(([x, col]) => { p.ell(x, 47, 9, 2, p.mix(col, st, .3)); p.line(x - 7, 46, x - 4, 46, p.mix(col, W, .45)) });
  },
  parts: (() => {
    const { K, W, SK, SKD, PK, O, OD, Y, YD, T, TD, HB, G } = C;
    const COL = [[Y, YD], [T, TD], [O, OD]];
    const KX = [16, 39, 62], SY = [18, 14, 18], FEET = 48;
    const AT = [.06, .22, .38];
    /* anak seluruh badan 23x27, poros di tengah kaki. f: 0 diam, 1 bersorak (tangan ke atas), 2 kedip */
    const kid = (shirt, hair, long) => (q, c, f) => {
      const x = 11, y = 7, sd = q.dk(shirt, .22), pants = "#3d4f9e";
      /* kaki */
      q.rect(7, 21, 4, 5, pants, K).rect(12, 21, 4, 5, pants, K);
      q.rect(6, 25, 5, 2, K).rect(12, 25, 5, 2, K);
      /* lengan */
      if (f == 1) { q.stick(6, 15, 2, 8, shirt); q.stick(16, 15, 20, 8, shirt); q.rect(1, 6, 2, 2, SK).rect(20, 6, 2, 2, SK) }
      /* badan */
      q.rect(5, 13, 13, 10, shirt, K, 2); q.shade({ [shirt]: sd }, [5, 13, 13, 10], 2);
      if (f != 1) { q.stick(5, 15, 3, 20, shirt); q.stick(17, 15, 19, 20, shirt); q.set(3, 21, SK).set(19, 21, SK).set(3, 22, K).set(19, 22, K) }
      q.set(7, 15, q.lt(shirt, .45)).set(7, 16, q.lt(shirt, .45));
      /* kepala */
      q.circ(x, y, 6, SK, K);
      for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) {
        if (q.get(x + i, y + j) !== SK) continue;
        if (j <= -3 || (Math.abs(i) >= 5 && j <= (long ? 3 : 0)) || (j == -2 && (i <= -1 || i >= 3))) q.set(x + i, y + j, hair);
      }
      q.set(x - 3, y - 4, q.lt(hair, .45)).set(x - 2, y - 5, q.lt(hair, .45)).set(x - 1, y - 5, q.lt(hair, .45));
      q.set(x + 4, y + 3, SKD).set(x + 3, y + 4, SKD).set(x + 5, y + 2, SKD);
      if (f == 1) { q.set(x - 3, y + 1, K).set(x - 2, y, K).set(x - 1, y + 1, K).set(x + 1, y + 1, K).set(x + 2, y, K).set(x + 3, y + 1, K); q.rect(x - 1, y + 3, 3, 2, K).set(x, y + 4, O) }
      else { if (f == 2) q.set(x - 3, y + 1, K).set(x - 2, y + 1, K).set(x + 2, y + 1, K).set(x + 3, y + 1, K); else q.set(x - 2, y, K).set(x - 2, y + 1, K).set(x + 2, y, K).set(x + 2, y + 1, K);
        q.set(x - 1, y + 4, K).set(x, y + 4, K).set(x + 1, y + 4, K).set(x - 2, y + 3, K).set(x + 2, y + 3, K) }
      q.set(x - 4, y + 2, PK).set(x + 4, y + 2, PK);
    };
    /* bintang lima sudut 15x15 */
    const bigStar = (col, cd) => q => {
      const P = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 3.1 : 7; P.push([Math.round(7 + r * Math.cos(a)), Math.round(7.6 + r * Math.sin(a))]) }
      q.poly(P, col, K); q.shade({ [col]: cd }, [0, 0, 15, 15], 1);
      q.set(6, 4, W).set(6, 5, W).set(5, 6, W);
    };
    const kidPart = i => ({
      w: 23, h: 27, ax: 11, ay: 26, frames: 3,
      draw: kid([Y, T, O][i], [HB, C.BR, HB][i], i == 2),
      at(u) {
        const a = AT[i], pre = E.seg(u, a - .07, a), hop = E.wob(E.seg(u, a, a + .2), 1.4, 3.2);
        const squash = Math.sin(Math.PI * pre) * .14 * (u < a ? 1 : 0);
        const jump = Math.max(0, hop);
        /* sorak bersama saat rasi lengkap */
        const all = E.wob(E.seg(u, .74, .9), 1.3, 3) * .8;
        const br = .015 * E.sin(u + i * .2, 2);
        const cheer = (u > a - .01 && u < a + .22) || (u > .73 && u < .86);
        const blink = Math.abs(((u + i * .31) % 1) - .5) < .012;
        return { x: KX[i], y: FEET - 3.5 * jump - 2.5 * Math.max(0, all), sx: 1 + squash - .1 * hop - br, sy: 1 - squash + .12 * hop + br, f: cheer ? 1 : blink ? 2 : 0 };
      }
    });
    const starPart = i => ({
      w: 15, h: 15, ax: 7, ay: 8, draw: bigStar(...COL[i]),
      at(u) {
        const a = AT[i], g = E.seg(u, a, a + .14), out = E.seg(u, .86, .97);
        const rise = E.back(g), pulse = E.wob(E.seg(u, .74, .9), 1.3, 3);
        const s = E.back(E.seg(u, a, a + .1)) * (1 - E.in(out)) * (1 + .18 * pulse);
        const yHead = FEET - 27;
        const y = E.lerp(yHead, SY[i], rise) + (u > a + .14 ? 1 * Math.sin((u - a - .14) * 2 * Math.PI * 1.5) : 0) - 6 * E.in(out);
        const r = -200 * (1 - E.out(E.seg(u, a, a + .2))) + 7 * Math.sin((u + i * .3) * 2 * Math.PI * 2) * E.seg(u, a + .15, a + .3) + 120 * E.in(out);
        return { x: KX[i], y, s: Math.max(s, .001), r, o: s > .02 ? 1 : 0 };
      }
    });
    /* garis kilau putus-putus dari bintang i ke i+1, tumbuh dari titik awal */
    const linePart = i => {
      const x0 = KX[i], y0 = SY[i], x1 = KX[i + 1], y1 = SY[i + 1], dx = x1 - x0, dy = y1 - y0;
      const w = Math.abs(dx) + 5, h = Math.abs(dy) + 5, ox = 2, oy = dy < 0 ? h - 3 : 2;
      return {
        w, h, ax: ox, ay: oy,
        draw(q) { const n = Math.max(Math.abs(dx), Math.abs(dy)); for (let k = 0; k <= n; k++) { if (k % 4 == 3) continue; const x = ox + dx * k / n, y = oy + dy * k / n; q.set(x, y, k % 4 == 1 ? W : C.WD) } },
        at(u) { const t = E.io(E.seg(u, .56 + i * .08, .66 + i * .08)), out = E.seg(u, .84, .94); return { x: x0, y: y0, sx: Math.max(t, .001), sy: Math.max(t, .001), o: t > .01 ? 1 - out : 0 } }
      };
    };
    const spark = (x, y, col, a, b) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 1),
      at(u) { const s = E.back(E.seg(u, a, a + .06)) * (1 - E.io(E.seg(u, b, b + .08))); return { x, y, s: Math.max(s, .001), o: s > .02 ? 1 : 0, r: 180 * E.seg(u, a, b + .08) } } });
    const twinkle = (x, y, col, ph) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 1),
      at(u) { const w = (u * 2 + ph) % 1, s = E.back(E.seg(w, 0, .2)) * (1 - E.io(E.seg(w, .35, .6))); return { x, y, s: Math.max(s, .001), o: s > .02 ? .9 : 0 } } });
    return [
      twinkle(8, 8, C.WD, 0), twinkle(70, 9, C.WD, .5), twinkle(6, 30, Y, .25),
      kidPart(0), kidPart(1), kidPart(2),
      linePart(0), linePart(1),
      starPart(0), starPart(1), starPart(2),
      spark(27, 8, W, .64, .8), spark(51, 8, W, .72, .84), spark(39, 5, Y, .75, .86), spark(73, 18, W, .76, .86), spark(6, 19, W, .77, .86)
    ];
  })()
}); })();

/* ---- k4 ---- */
(() => { const { C, E } = GLPIX; GLPIX.def("k4", {
  /* Jurnal syukur & refleksi mingguan: buku catatan terbuka di meja; hati di halaman kiri berdetak "lub-dub",
     pensil menulis empat baris di halaman kanan kata demi kata (bergerak mengikuti tulisan, mengangkat saat ganti baris),
     selesai menulis hati meletup + kilau, kalender kecil mendapat centang hari ini, lalu tulisan memudar untuk loop berikutnya */
  dur: 5, still: .84,
  base(p, c) {
    const { K, W, WD, V, VD, T, TD, O, G } = C;
    /* meja */
    const dk = p.dk(c, .2), dk2 = p.dk(c, .32);
    p.rect(0, 47, 78, 13, dk); p.line(0, 47, 77, 47, K);
    for (let x = 4; x < 78; x += 13) p.line(x, 51, x + 6, 51, dk2);
    for (let x = 10; x < 78; x += 17) p.line(x, 55, x + 4, 55, dk2);
    /* bayangan buku */
    p.rect(9, 53, 62, 2, dk2);
    /* sampul */
    p.rect(6, 20, 66, 34, V, K, 2);
    p.rect(7, 50, 64, 3, VD);
    /* halaman: kiri & kanan sedikit melengkung */
    p.poly([[9, 21], [23, 19], [38, 22], [38, 51], [23, 49], [9, 51]], W, K);
    p.poly([[40, 22], [55, 19], [69, 21], [69, 51], [55, 49], [40, 51]], W, K);
    /* bayangan lipatan tengah & tumpukan kertas */
    p.line(37, 23, 37, 50, WD).line(36, 24, 36, 49, WD); p.line(41, 23, 41, 50, WD);
    p.line(39, 22, 39, 52, K);
    p.line(10, 52, 37, 52, WD).line(41, 52, 68, 52, WD);
    /* tulisan judul halaman kiri */
    p.text(13, 23, "SYUKUR", VD);
    /* garis pemanis halaman kiri */
    for (let x = 13; x < 35; x += 3) p.set(x, 46, G);
    /* garis buku halaman kanan */
    [27, 33, 39, 45].forEach(y => { for (let x = 43; x < 67; x++) p.set(x, y + 2, WD) });
    p.set(44, 23, G).set(45, 23, G).set(46, 23, G).set(48, 23, G).set(49, 23, G);
    /* pita pembatas */
    p.rect(60, 50, 3, 6, O, K); p.set(61, 55, c);
  },
  parts: (() => {
    const { K, W, WD, O, OD, V, VD, T, TD, PK, G, Y, SK, BR } = C;
    const LY = [27, 33, 39, 45], X0 = 43;
    const WORDS = [[5, 4, 7], [6, 4, 5], [4, 7, 6], [6, 4]];
    const LS = [.08, .26, .44, .62], LD = .14;   /* mulai & lama menulis tiap baris */
    const len = i => WORDS[i].reduce((a, b) => a + b, 0) + 2 * (WORDS[i].length - 1);
    /* jejak tulisan tangan (coretan) */
    const scrib = (q, n, seed) => { for (let x = 0; x < n; x++) { const y = 3 - Math.round((Math.sin(x * 1.9 + seed) + 1) * .6); q.set(x, y, VD); if ((x * 7 + seed) % 5 == 2) q.set(x, y - 1, VD).set(x, y - 2, VD) } };
    /* kemajuan pensil */
    const pen = u => {
      const rest = { x: 61, y: 33 };
      for (let i = 0; i < 4; i++) {
        const a = LS[i], b = a + LD;
        if (u >= a && u <= b) { const t = (u - a) / LD; return { x: X0 + t * len(i), y: LY[i] + .9 * Math.sin(t * len(i) * 1.1), lift: 0, t, i } }
        const nx = i < 3 ? LS[i + 1] : null;
        if (u > b && nx != null && u < nx) { const t = E.io((u - b) / (nx - b)); return { x: E.lerp(X0 + len(i), X0, t), y: E.lerp(LY[i], LY[i + 1], t) - 4 * Math.sin(Math.PI * t), lift: Math.sin(Math.PI * t), i: -1 } }
      }
      if (u < LS[0]) { const t = E.io(E.seg(u, 0, LS[0])); return { x: E.lerp(rest.x, X0, t), y: E.lerp(rest.y, LY[0], t) - 3 * Math.sin(Math.PI * t), lift: 1 - t, i: -1 } }
      const t = E.io(E.seg(u, LS[3] + LD + .02, .9)); return { x: E.lerp(X0 + len(3), rest.x, t), y: E.lerp(LY[3], rest.y, t) - 4 * Math.sin(Math.PI * t), lift: t, i: -1 };
    };
    const parts = [];
    /* kata-kata, muncul saat pensil melewati */
    WORDS.forEach((ws, i) => { let off = 0; ws.forEach((w, j) => { const x = X0 + off, a = off / len(i), b = (off + w) / len(i), seed = i * 3 + j;
      parts.push({ w: w + 1, h: 5, ax: 0, ay: 2, draw: q => scrib(q, w, seed),
        at(u) { const t = E.seg(u, LS[i], LS[i] + LD), k = E.seg(t, a, b), fade = E.seg(u, .9 + i * .015, .95 + i * .015);
          return { x, y: LY[i], sx: Math.max(k, .001), o: k > 0 ? 1 - fade : 0 } } });
      off += w + 2 }) });
    /* hati berdetak di halaman kiri */
    const heart = q => {
      q.spr(0, 0, [".KKK...KKK.", "KOOOK.KOOOK", "KOOOOKOOOOK", "KOOOOOOOOOK", "KOOOOOOOOOK", ".KOOOOOOOK.", "..KOOOOOK..", "...KOOOK...", "....KOK....", ".....K....."], { K, O });
      q.shade({ [O]: OD }, [0, 0, 11, 10], 1);
      q.set(2, 2, W).set(2, 3, W).set(3, 2, W).set(4, 1, C.PK);
    };
    parts.push({ w: 11, h: 10, ax: 5, ay: 5, draw: heart,
      at(u) { const b = (u * 4) % 1, lub = E.wob(E.seg(b, 0, .3), 1, 4), dub = E.wob(E.seg(b, .14, .44), 1, 4);
        const big = E.wob(E.seg(u, .8, 1), 1.5, 3.5);
        const s = 1 + .1 * Math.max(0, lub) + .07 * Math.max(0, dub) + .35 * big; return { x: 24, y: 36, sx: s, sy: s * (1 - .04 * big), r: 6 * big } } });
    /* garis jejak denyut di bawah hati (kecil) */
    /* kalender kecil di kanan atas */
    parts.push({ w: 16, h: 15, ax: 8, ay: 14, draw(q) {
      q.rect(0, 2, 16, 13, W, K, 1); q.rect(1, 3, 14, 3, T); q.line(1, 6, 14, 6, K);
      q.set(4, 1, K).set(4, 2, K).set(4, 3, K).set(11, 1, K).set(11, 2, K).set(11, 3, K);
      for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) q.rect(2 + i * 3, 8 + j * 3, 2, 2, j == 1 && i == 3 ? C.PK : WD);
      q.shade({ [W]: WD, [T]: TD }, [0, 2, 16, 13], 1) },
      at(u) { const w = E.wob(E.seg(u, .78, .95), 1.5, 3.5); return { x: 36, y: 17 + .8 * E.sin(u, 1), r: 6 * w + 2 * E.sin(u, 1), sx: 1 + .08 * w, sy: 1 - .08 * w } } });
    /* centang hari ini di kalender */
    parts.push({ w: 9, h: 8, ax: 4, ay: 4, draw: q => { q.spr(0, 0, ["......KK.", ".....KOK.", "KK..KOK..", "KOKKOK...", ".KOOK....", "..KK....."], { K, O }) },
      at(u) { const s = E.back(E.seg(u, .8, .86)) * (1 - E.in(E.seg(u, .93, .99))); return { x: 39, y: 12, s: Math.max(s, .001), o: s > .02 ? 1 : 0 } } });
    /* matahari kecil: sinar berputar pelan + wajah */
    parts.push({ w: 25, h: 25, ax: 12, ay: 12, draw(q) {
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, L = k % 2 ? 7.4 : 8.2; q.line(12 + 6.4 * Math.cos(a), 12 + 6.4 * Math.sin(a), 12 + L * Math.cos(a), 12 + L * Math.sin(a), k % 2 ? OD : O, 2) } },
      at(u) { return { x: 13, y: 11.5, r: 45 * u * 2, s: 1 + .05 * E.sin(u, 2) } } });
    parts.push({ w: 15, h: 15, ax: 7, ay: 7, draw(q) { q.circ(7, 7, 5, O, K); q.shade({ [O]: OD }, [0, 0, 15, 15], 1); q.set(4, 4, W).set(5, 3, W).set(4, 5, W);
      q.set(5, 6, K).set(9, 6, K).set(5, 7, K).set(9, 7, K).set(6, 9, K).set(7, 9, K).set(8, 9, K).set(5, 8, K).set(9, 8, K).set(4, 8, PK).set(10, 8, PK) },
      at(u) { return { x: 13, y: 11.5 + .6 * E.sin(u, 2), r: 5 * E.sin(u, 1) } } });
    /* pensil, poros di ujung grafit */
    parts.push({ w: 21, h: 5, ax: 0, ay: 2, draw(q) {
      q.poly([[1, 2], [5, 0], [5, 4]], "#f2c79a", K); q.set(0, 2, K).set(1, 2, K).set(2, 2, K);
      q.rect(5, 0, 11, 5, V, K); q.line(6, 1, 14, 1, q.lt(V, .4)); q.line(6, 3, 14, 3, VD);
      q.rect(15, 0, 3, 5, G, K); q.rect(17, 0, 4, 5, PK, K, 1) },
      at(u) { const P = pen(u); return { x: P.x, y: P.y - 1 - 2.5 * P.lift, r: -58 + 6 * P.lift + (P.i >= 0 ? 3 * Math.sin(P.t * 40) : 0) } } });
    /* kilau saat selesai */
    const pop = (x, y, col, a) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, 1),
      at(u) { const s = E.back(E.seg(u, a, a + .06)) * (1 - E.io(E.seg(u, a + .1, a + .18))); return { x, y, s: Math.max(s, .001), o: s > .02 ? 1 : 0, r: 120 * E.seg(u, a, a + .18) } } });
    parts.push(pop(15, 31, V, .8), pop(33, 30, C.PK, .83), pop(31, 42, O, .86), pop(48, 7, W, .82), pop(25, 6, W, .85), pop(72, 14, W, .88));
    return parts;
  })()
}); })();

/* ---- k5 ---- */
(() => { const { C, E } = GLPIX; GLPIX.def("k5", {
  /* Tantangan ide kreatif: bohlam besar yang mengantuk berkedip-kedip lalu menyala (antisipasi jongkok, meregang dengan pantulan),
     cincin cahaya mengembang, sinar meletup; garis peta pikiran tumbuh ke empat catatan tempel yang meletup bergantian
     dan bergoyang seperti ditempel, kilau bermunculan; lalu semuanya surut dan bohlam meredup untuk loop berikutnya */
  dur: 4.6, still: .66,
  base(p, c) {
    /* bayangan bohlam di bawah */
    p.ell(39, 53, 9, 2, p.dk(c, .2));
  },
  parts: (() => {
    const { K, W, WD, Y, YD, O, OD, T, TD, V, VD, PK, G } = C;
    const BX = 39, BY = 50, GY = 26;           /* poros bohlam (dasar ulir) & jarak ke pusat kaca */
    const cen = () => ({ x: BX, y: BY - GY });
    /* transformasi bohlam: jongkok sebelum menyala, meregang + pantulan, melayang pelan */
    const bulb = u => {
      const pre = Math.sin(Math.PI * E.seg(u, .13, .21)) * (u < .21 ? 1 : 0);
      const pop = E.wob(E.seg(u, .21, .5), 2, 4.5);
      const off = E.wob(E.seg(u, .86, 1), 1, 4) * .5;
      const fl = .8 * E.sin(u, 2);
      return { x: BX + .4 * E.sin(u, 1), y: BY + fl * 0 - 2 * Math.max(0, pop) + 1.2 * pre, sx: 1 + .1 * pre - .08 * pop + .04 * off, sy: 1 - .12 * pre + .12 * pop - .04 * off, r: 1.5 * E.sin(u, 1) - 3 * pop };
    };
    /* opasitas kaca menyala: kedip-kedip lalu tetap, redup di akhir */
    const lit = u => {
      if (u < .08) return 0;
      if (u < .2) { const k = (u - .08) / .12; return [1, 0, 0, 1, 0, .6, 0, 1, 1, 0, 1, 1][Math.min(11, k * 12 | 0)] }
      return 1 - E.io(E.seg(u, .86, .97));
    };
    const glass = on => q => {
      const gc = on ? Y : W, gd = on ? YD : WD, gl = on ? q.lt(Y, .55) : W;
      /* kaca */
      q.circ(14, 13, 12, gc, K);
      q.poly([[7, 22], [21, 22], [19, 29], [9, 29]], gc, K);
      q.circ(14, 13, 11, gc);
      q.line(9, 22, 19, 22, gc).line(8, 21, 20, 21, gc);
      q.shade({ [gc]: gd }, [0, 0, 29, 30], 2);
      if (on) { q.circ(14, 14, 6, gl); q.shade({ [gl]: gc }, [6, 6, 17, 17], 1) }
      /* kilau kiri atas */
      q.rect(6, 6, 2, 1, W).rect(5, 7, 1, 3, W).set(8, 5, W).set(9, 5, W);
      /* filamen */
      const fc = on ? O : G;
      q.line(11, 28, 11, 24, fc).line(17, 28, 17, 24, fc);
      q.line(12, 23, 16, 23, fc).set(11, 24, fc).set(17, 24, fc);
      if (on) q.set(13, 22, W).set(15, 22, W);
      /* wajah */
      if (on) {
        q.rect(9, 10, 2, 3, K).rect(18, 10, 2, 3, K).set(9, 10, W).set(18, 10, W);
        q.rect(12, 14, 5, 2, K).set(13, 16, K).set(14, 16, K).set(15, 16, K).set(13, 15, O).set(14, 15, OD).set(15, 15, O);
        q.set(7, 14, PK).set(8, 14, PK).set(20, 14, PK).set(21, 14, PK);
      } else {
        q.line(8, 12, 10, 12, K).line(18, 12, 20, 12, K).set(8, 11, K).set(20, 11, K);
        q.line(13, 15, 15, 15, K);
        q.set(8, 14, q.mix(PK, W, .4)).set(20, 14, q.mix(PK, W, .4));
      }
      /* ulir */
      q.rect(8, 29, 13, 8, G, K, 1);
      q.line(9, 31, 19, 31, q.dk(G, .3)).line(9, 33, 19, 33, q.dk(G, .3)).line(9, 35, 19, 35, q.dk(G, .3));
      q.line(9, 30, 11, 30, W).line(9, 32, 10, 32, W).line(9, 34, 10, 34, W);
      q.rect(11, 37, 7, 3, K).rect(12, 37, 5, 2, q.dk(G, .3));
    };
    const bulbPart = on => ({ w: 29, h: 40, ax: 14, ay: 39, draw: glass(on),
      at: u => ({ ...bulb(u), o: on ? lit(u) : 1 }) });
    /* cincin cahaya mengembang */
    const ring = (a, col) => ({ w: 41, h: 41, ax: 20, ay: 20,
      draw: q => { q.circ(20, 20, 18, col); q.circ(20, 20, 16, null); for (let y = 0; y < 41; y++) for (let x = 0; x < 41; x++) { const d = Math.hypot(x - 20, y - 20); if (d < 16.6) q.g[y][x] = null } },
      at: u => { const t = E.seg(u, a, a + .26), b = bulb(u); return { x: b.x, y: b.y - GY, s: Math.max(.001, .6 + .7 * E.out(t)), o: t > 0 && t < 1 ? .85 * (1 - E.in(t)) : 0 } } });
    /* sinar bohlam */
    const rays = { w: 47, h: 47, ax: 23, ay: 23,
      draw: q => { for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + k * Math.PI / 4, r0 = 17, r1 = k % 2 ? 20.5 : 18.5;
        q.line(23 + r0 * Math.cos(a), 23 + r0 * Math.sin(a), 23 + r1 * Math.cos(a), 23 + r1 * Math.sin(a), K, 3) }
        for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + k * Math.PI / 4, r0 = 17, r1 = k % 2 ? 20.5 : 18.5;
        q.line(23 + r0 * Math.cos(a), 23 + r0 * Math.sin(a), 23 + r1 * Math.cos(a), 23 + r1 * Math.sin(a), k % 2 ? W : Y, 1) } },
      at: u => { const b = bulb(u), s = E.back(E.seg(u, .2, .3)) * (1 - E.in(E.seg(u, .84, .92))) * (1 + .05 * E.sin(u, 4));
        return { x: b.x, y: b.y - GY, s: Math.max(s, .001), o: s > .03 ? 1 : 0, r: 8 * E.sin(u, 1) } } };
    /* catatan tempel di ujung peta pikiran */
    const NOTES = [
      { x: 12, y: 8, col: T, cd: TD, a: .32, icon: "star" },
      { x: 66, y: 8, col: V, cd: VD, a: .38, icon: "heart" },
      { x: 66, y: 38, col: W, cd: WD, a: .44, icon: "ide" },
      { x: 12, y: 38, col: PK, cd: q => q, a: .5, icon: "lines" }
    ];
    const note = n => ({ w: 17, h: 15, ax: 8, ay: 1,
      draw(q) {
        const cd = n.cd === WD ? WD : typeof n.cd == "function" ? q.dk(PK, .18) : n.cd;
        q.rect(1, 2, 15, 12, n.col, K, 1); q.shade({ [n.col]: cd }, [1, 2, 15, 12], 2);
        /* sudut terlipat */
        q.set(14, 12, K).set(13, 12, cd).set(14, 11, cd).set(13, 13, K).set(14, 13, null).set(15, 12, null).set(15, 13, null).set(14, 12, K);
        /* selotip */
        q.rect(5, 0, 7, 3, q.mix(Y, W, .45), K);
        q.set(3, 4, W).set(3, 5, W).set(4, 4, W);
        const ink = n.col === W ? VD : K;
        if (n.icon == "star") { const P = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 2 : 4.6; P.push([Math.round(8 + r * Math.cos(a)), Math.round(8.4 + r * Math.sin(a))]) } q.poly(P, Y, K); q.set(7, 7, W) }
        if (n.icon == "heart") q.spr(4, 5, [".KK.KK.", "KPPKPPK", "KPPPPPK", ".KPPPK.", "..KPK..", "...K..."], { K, P: PK }).set(5, 6, W);
        if (n.icon == "ide") q.text(3, 6, "IDE", O);
        if (n.icon == "lines") { q.line(4, 6, 12, 6, ink).line(4, 8, 10, 8, ink).line(4, 10, 11, 10, ink).set(13, 6, W) }
        
      },
      at(u) {
        const t = E.seg(u, n.a, n.a + .1), s = E.back(t) * (1 - E.in(E.seg(u, .82 + n.a * .1, .9 + n.a * .1)));
        const sw = E.wob(E.seg(u, n.a, n.a + .3), 2, 4);
        const side = n.x < 39 ? -1 : 1;
        return { x: n.x + side * 2 * (1 - E.out(t)), y: n.y + 1.5 * (1 - E.out(t)) + .7 * E.sin(u + n.a, 2) * E.seg(u, n.a + .1, n.a + .2), s: Math.max(s, .001), o: s > .03 ? 1 : 0, r: 18 * sw * side + 2.5 * E.sin(u + n.a * 2, 1) };
      } });
    /* garis putus-putus dari bohlam ke catatan, tumbuh dari bohlam */
    const link = n => {
      const { x: x0, y: y0 } = cen(), x1 = n.x, y1 = n.y + 7, dx = x1 - x0, dy = y1 - y0;
      const w = Math.abs(dx) + 5, h = Math.abs(dy) + 5, ox = dx < 0 ? w - 3 : 2, oy = dy < 0 ? h - 3 : 2;
      return { w, h, ax: ox, ay: oy,
        draw(q) { const N = Math.max(Math.abs(dx), Math.abs(dy)); for (let k = 0; k <= N; k++) { if (k % 4 == 3) continue; const x = ox + dx * k / N, y = oy + dy * k / N; q.set(x, y, W); q.set(x, y + 1, q.dk(C.O, .25)) } },
        at(u) { const t = E.io(E.seg(u, n.a - .05, n.a + .05)), out = E.in(E.seg(u, .8 + n.a * .1, .88 + n.a * .1)); const s = Math.max(.001, t * (1 - out));
          return { x: x0, y: y0, s, o: s > .02 ? 1 : 0 } } };
    };
    const spark = (x, y, col, a, sz = 1) => ({ w: 9, h: 9, ax: 4, ay: 4, draw: q => q.star(4, 4, col, sz),
      at(u) { const s = E.back(E.seg(u, a, a + .06)) * (1 - E.io(E.seg(u, a + .12, a + .2))); return { x, y, s: Math.max(s, .001), o: s > .02 ? 1 : 0, r: 90 * E.seg(u, a, a + .2) } } });
    return [
      ...NOTES.map(link),
      ring(.2, W), ring(.27, Y),
      rays,
      bulbPart(false), bulbPart(true),
      ...NOTES.map(note),
      spark(26, 6, W, .23, 2), spark(55, 9, Y, .27), spark(23, 30, W, .56), spark(56, 31, Y, .6, 2), spark(50, 52, W, .66), spark(70, 26, W, .7), spark(8, 26, Y, .74)
    ];
  })()
}); })();
