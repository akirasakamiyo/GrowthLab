/* Tokoh "rekan" pixel art 64x64 (preview, tools/_simpx). Teknik sama persis dengan hero.js:
   - Kepala+rambut (jambul modern, sisi dipangkas tipis/fade), wajah, torso (kemeja mint berkancing), lanyard + kartu ID,
     tangan, sepatu kets = PETA PIKSEL TANGAN. Lengan = tabung berpita: lengan kemeja digulung (pita gulungan terang)
     di atas siku, lengan bawah kulit.
   - Garis tepi luar 1 px: kiri/atas = versi gelap warna bidang, kanan/bawah = navy. Bagian jauh satu tingkat lebih gelap.
   Proporsi sama dengan hero (rekan sebaya), dahi terlihat dengan alis hitam tebal. Lanyard biru selalu dipakai. */
(() => {
  const NV = "#1b1740", TALL = 0;
  const PAL = {
    /* kulit sawo matang */ A: "#e6a676", a: "#cc8a58", s: "#a86c42", d: "#8a5236", e: "#673a37", k: "#4a2632", b: "#c4644e",
    /* rambut hitam (kilau ungu dingin), f = fade sisi */ i: "#6a5a80", H: "#41354f", h: "#261d33", j: "#150f1f", f: "#5e3d38",
    /* kemeja mint */ l: "#c8f7d8", c: "#8fe8b6", C: "#5fd6a0", T: "#6ee3a6", t: "#3ecf8e", u: "#26a283", v: "#1d6f72",
    /* celana */ P: "#6c6c94", p: "#4a4a6a", q: "#383656", Q: "#2a2744",
    /* kets arang + sol putih */ W: "#7a7fa6", Y: "#565a80", X: "#3c3f62", r: "#f5eee2", R: "#c9bccf",
    /* mata, mulut */ N: NV, V: "#2e1c2c", I: "#5a3436", L: "#8a5a4a", m: "#5a2232", o: NV, w: "#fffaf0", x: "#e8735a",
    /* lanyard biru + kartu ID */ "1": "#6b9cf0", "2": "#3b5fb0", "9": "#5d6fae", "3": "#fffaf0", "4": "#e9dcc4", "0": "#bfa9b0", "5": "#8fb0e6", "6": "#5d6fae", "7": "#e8735a", "8": "#b0505c"
  };
  const FAR = { A: "a", a: "s", s: "d", d: "e", e: "e", k: "k", b: "d", i: "H", H: "h", h: "j", j: "j", f: "j",
    l: "c", c: "C", C: "u", T: "t", t: "u", u: "v", v: "v", P: "p", p: "q", q: "Q", Q: "Q", W: "Y", Y: "X", X: "X", r: "R", R: "R" };
  const MAT = {}; const mats = { skin: "AasdekbmNVILwx", hair: "iHhjf", shirt: "lcCTtuv", pants: "PpqQ", shoe: "WYX", sole: "rR", lan: "1234567890" };
  for (const [k, s] of Object.entries(mats)) for (const ch of s) MAT[ch] = k;
  const LITO = { skin: "#4e2a2e", hair: "#0d0915", shirt: PAL.v, pants: NV, shoe: "#2c2e4c", sole: "#8f8098", lan: "#2b3f7a" };

  const map = (rows) => rows.map(r => r ? " ".repeat(r[0]) + r[1] : "");

  /* ======================= PETA TANGAN ======================= */
  /* kepala + rambut (24 x 22), hadap 3/4 kanan. Jambul (quiff) disapu ke atas-depan dengan pita kilau ungu dingin,
     sisi dipangkas tipis (f = kulit tampak di balik rambut), dahi terlihat. */
  const HEAD = map([
    [13, "hHhj"],
    [9, "hHHiiHhhj"],
    [6, "hHHiiiiiHhhhj"],
    [5, "hHHHiiiHHhhhhjj"],
    [4, "jhhHHHHHhhhhhhjj"],
    [3, "jjhhHHHHHhhhhhhhjj"],
    [3, "jjjhhhhhhhhhhhhhhjj"],
    [2, "jjjjhhhhhhhhhhhhhjj"],
    [2, "jjfjjhhhhhhhjjjjjdd"],
    [2, "jffjjjjjjjddsssssss"],
    [2, "jfffjjjdsssssssssss"],
    [2, "jfffjjdsssssssssssd"],
    [2, "jfffjdssssssssssssd"],
    [2, "jdasddsssssssssssss"],
    [2, "jdseddssssssssssssd"],
    [3, "dsedsssssssssssssd"],
    [3, "dddssssssssssssdd"],
    [4, "ddsssssssssssssd"],
    [5, "dssssssssssssd"],
    [7, "dssssssssssd"],
    [9, "dssssssdd"],
    [11, "ddsdd"]
  ]);
  /* varian jambul (baris 0-2) yang ikut bergoyang; 1 = tertinggal ke belakang, 2 = condong ke depan */
  const TUFT = [
    null,
    map([[12, "hHhj"], [8, "hHHiiHhhj"], [6, "hHHiiiiiHhhhj"]]),
    map([[14, "hHhj"], [10, "hHiiHhhhj"], [6, "hHHiiiiiHhhhjj"]])
  ];
  /* mata dekat 4x5 & mata jauh 3x5 (relatif kepala, mulai baris 13); iris coklat tua */
  const EYE = {
    open: { n: ["NNNN", "NwNN", "NwVN", "NIIN", " LL "], f: ["NNN", "wNN", "wVN", "IIN", "LL "] },
    up: { n: ["NNNN", "NIVN", "NLIN", "NwwN", " NN "], f: ["NNN", "IVN", "LIN", "wwN", "NN "] },
    blink: { n: ["    ", "    ", "N  N", " NN ", "    "], f: ["   ", "   ", "N  ", " NN", "   "] },
    happy: { n: ["    ", " NN ", "N  N", "N  N", "    "], f: ["   ", " NN", "N  ", "N  ", "   "] },
    wide: { n: [" NN ", "NwwN", "NwNN", "NwNN", "NwwN", " NN "], f: [" N ", "wwN", "wNN", "wNN", "wwN", " N "], dy: -1 },
    sad: { n: ["    ", "NNNN", "NNVN", "NIIN", " LL "], f: ["   ", "NNN", "NVN", "IIN", "LL "] },
    flat: { n: ["    ", "NNNN", "NwVN", "NIIN", " LL "], f: ["   ", "NNN", "wVN", "IIN", "LL "] }
  };
  /* alis hitam tebal (2 baris di pangkal), selalu tampak di dahi (relatif kepala) */
  const BROW = {
    calm: { px: [[8, 12], [9, 11], [10, 11], [11, 11], [12, 11], [9, 12], [16, 11], [17, 11], [18, 11], [16, 12]] },
    think: { px: [[8, 12], [9, 12], [10, 12], [11, 12], [12, 12], [9, 11], [16, 11], [17, 10], [18, 10], [16, 12]] },
    sad: { px: [[8, 12], [9, 12], [10, 12], [11, 11], [12, 10], [11, 12], [16, 10], [17, 11], [18, 12], [16, 11]] },
    worry: { px: [[8, 12], [9, 12], [10, 11], [11, 11], [12, 11], [10, 12], [16, 11], [17, 11], [18, 12], [16, 12]] },
    high: { px: [[8, 11], [9, 10], [10, 10], [11, 10], [12, 10], [9, 11], [16, 10], [17, 10], [18, 10], [16, 11]] }
  };
  const MOUTH = {
    smile: [[12, 19, "m"], [13, 20, "m"], [14, 20, "m"], [15, 19, "m"]],
    grin: [[12, 19, "m"], [13, 19, "m"], [14, 19, "m"], [15, 19, "m"], [16, 19, "m"], [12, 20, "m"], [13, 20, "w"], [14, 20, "w"], [15, 20, "x"], [16, 20, "m"], [13, 21, "m"], [14, 21, "x"], [15, 21, "m"]],
    hmm: [[12, 20, "m"], [13, 20, "m"], [14, 19, "m"], [15, 19, "m"]],
    flat: [[12, 20, "m"], [13, 20, "m"], [14, 20, "m"], [15, 20, "k"]],
    wavy: [[12, 20, "m"], [13, 19, "m"], [14, 20, "m"], [15, 20, "k"]],
    frown: [[12, 20, "m"], [13, 19, "m"], [14, 19, "m"], [15, 20, "m"]],
    O: [[13, 19, "m"], [14, 19, "m"], [12, 20, "m"], [13, 20, "o"], [14, 20, "k"], [15, 20, "m"], [13, 21, "m"], [14, 21, "m"]],
    o: [[13, 20, "m"], [14, 20, "m"], [13, 21, "m"], [14, 21, "k"]]
  };
  const GLASS = [];
  /* torso (17 x 16): kemeja mint berkerah terbuka, plaket kancing (garis u + kancing c), lipatan kain, ujung dikeluarkan */
  const TORSO = map([
    [4, "lccsssdcc"],
    [2, "TllllcsdclcCu"],
    [1, "TTclllcCdccCuuv"],
    [1, "TtuCcccCCcCuttu"],
    [1, "TttuCcCuuCutttu"],
    [1, "Ttttuuuuuuttuuu"],
    [1, "TtttttttcttTuuu"],
    [1, "tttuttttuttuuuu"],
    [1, "ttttutttuttuuuu"],
    [1, "tttttuttcttuuuu"],
    [1, "ttttttttuttuuuu"],
    [1, "ttttttttutttuuu"],
    [1, "ttttttttcttuuuu"],
    [1, "tttttttttttuuuu"],
    [1, "ttttttttuttuuuu"],
    [1, "uuuuuuuuvuuuuuv"]
  ]);
  /* lanyard biru relatif torso: dua tali dari kerah, klip, kartu 5x5 (foto + baris nama + strip koral) */
  const LANYARD = map([
    null,
    [5, "1....2"],
    [5, "1....2"],
    [6, "1..2"],
    [6, "1..2"],
    [7, "12"],
    [7, "99"],
    [5, "33334"],
    [5, "35504"],
    [5, "35634"],
    [5, "30004"],
    [5, "77778"]
  ]);
  /* panggul celana (15 x 4) */
  const HIP = map([[0, "ppppppppppppqqq"], [0, "ppppppppppppqqq"], [0, "QqqqqqqqqqqqqqQ"], [0, "Ppppppppppppqqq"]]);
  /* tangan: peta 4-5 px dengan buku jari, ibu jari, dan celah jari. jangkar = pergelangan */
  const HAND = {
    open: { ox: -1, oy: 0, rows: [" aa ", "aAas", "aAsds", "asds", " dd "] },
    fist: { ox: -1, oy: -1, rows: [" aa ", "aAAs", "asds", "aAsd", " dd "] },
    chin: { ox: -1, oy: -4, rows: ["  a ", "  as", " aAs", "aAsd", "asdd", " dd "] }
  };
  /* kets: tumit di kiri, ujung bulat, sol putih tebal */
  const SHOE = {
    flat: { ox: -3, oy: 1, rows: ["YWWY    ", "YWWWWWY ", "YYYYYYWY", "rrrrrrrR"] },
    toe: { ox: -3, oy: 0, rows: ["YW      ", "YWWW    ", "rYWWWY  ", " rrYYYWY", "   rrrrR"] },
    heel: { ox: -3, oy: 0, rows: ["      W ", "YWWWWWWY", "YYYYYYrR", "rrrrrR  "] }
  };

  /* ======================= KOMPOSISI ======================= */
  function Fig(W, H) {
    const L = new Array(W * H).fill(null), G = new Array(W * H).fill(null);
    const ok = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    function draw(px, o = {}) {
      const own = new Set(px.map(([x, y]) => y * W + x));
      if (o.rim) for (const [x, y] of px) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const X = x + dx, Y = y + dy, k = Y * W + X; if (!ok(X, Y) || own.has(k) || !L[k] || G[k] === o.grp) continue;
        if (o.rimSkip && o.rimSkip(X, Y, dx, dy)) continue;
        L[k] = o.rim;
      }
      for (const [x, y, ch] of px) { if (!ok(x, y)) continue; const k = y * W + x; L[k] = o.far ? (FAR[ch] || ch) : ch; G[k] = o.grp }
    }
    return { W, H, L, G, draw, at: (x, y) => ok(x, y) ? L[y * W + x] : null };
  }
  const spr = (rows, ox, oy) => { const px = []; rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== " " && ch !== ".") px.push([ox + i, oy + j, ch]) })); return px };
  function tube(pts, pat, o = {}) {
    const rows = new Map(), put = (y, x0, x1) => { const r = rows.get(y); rows.set(y, r ? [Math.min(r[0], x0), Math.max(r[1], x1)] : [x0, x1]) };
    for (let s = 0; s < pts.length - 1; s++) {
      const [ax, ay] = pts[s], [bx, by] = pts[s + 1];
      if (Math.abs(by - ay) < .5) { put(Math.round(ay), Math.min(ax, bx), Math.max(ax, bx)); continue }
      const y0 = Math.round(Math.min(ay, by)), y1 = Math.round(Math.max(ay, by)), xa = y => ax + (bx - ax) * Math.max(0, Math.min(1, (y - ay) / (by - ay)));
      for (let y = y0; y <= y1; y++) { const p = xa(y - .5), q = xa(y + .5); put(y, Math.min(p, q), Math.max(p, q)) }
    }
    const ys = [...rows.keys()].sort((a, b) => a - b), w = pat.length, h0 = w >> 1, px = [];
    ys.forEach((y, j) => {
      const [x0, x1] = rows.get(y), span = Math.max(0, Math.round(x1 - x0) - (w - 1)), cx = Math.round((x0 + x1 - span) / 2);
      const cap = (o.capTop && j === 0) || (o.capBot && j === ys.length - 1);
      const P = o.rowPat && o.rowPat(j, ys.length) || pat;
      for (let i = 0; i < w + span; i++) {
        if (cap && (i === 0 || i === w + span - 1)) continue;
        const idx = i < h0 ? i : i > h0 + span ? i - span : h0;
        px.push([cx - h0 + i, y, P[idx]]);
      }
    });
    return px;
  }
  function ik(ax, ay, bx, by, l1, l2, dir) {
    const dx = bx - ax, dy = by - ay, d = Math.min(Math.hypot(dx, dy), l1 + l2 - .001);
    const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))), base = Math.atan2(dy, dx), t = base - dir * a;
    return [ax + Math.cos(t) * l1, ay + Math.sin(t) * l1];
  }

  /* ======================= BAGIAN ======================= */
  function leg(F, hip, ank, shoe, far) {
    const kn = ik(hip[0], hip[1], ank[0], ank[1], 6.2 + TALL / 2, 6.4 + TALL / 2, 1);
    const px = tube([hip, kn, ank], "Ppppq", { rowPat: (j, n) => j === n - 1 ? "qqqqQ" : null });
    F.draw(px, { grp: far ? "legF" : "pants", rim: "Q", far });
    const S = SHOE[shoe || "flat"];
    F.draw(spr(S.rows, Math.round(ank[0]) + S.ox, Math.round(ank[1]) + S.oy), { grp: far ? "shoeF" : "shoe", rim: "o", far });
  }
  /* lengan kemeja digulung: lengan atas (5 px) berakhir dua baris gulungan terang tepat di atas siku,
     lengan bawah kulit (3 px) keluar dari gulungan */
  function arm(F, sh, el, wr, hand, far, tx = 0) {
    sh = [sh[0] + tx, sh[1] - TALL]; el = [el[0] + tx, el[1] - TALL]; wr = [wr[0] + tx, wr[1] - TALL];
    const mx = sh[0] + (el[0] - sh[0]) * .85, my = sh[1] + (el[1] - sh[1]) * .85, g = far ? "armF" : "arm";
    F.draw(tube([[mx, my], el, wr], "asd"), { grp: g + "s", rim: "e", far });
    F.draw(tube([sh, [mx, my]], "Tttuu", { capTop: 1, rowPat: (j, n) => j === n - 1 ? "cCCuv" : j === n - 2 ? "llccC" : null }), { grp: g, rim: "v", far });
    const H = HAND[hand || "open"];
    F.draw(spr(H.rows, Math.round(wr[0]) + H.ox, Math.round(wr[1]) + H.oy), { grp: g + "h", rim: "e", far });
  }
  function head(F, x, y, P) {
    const rows = HEAD.slice(); const tu = TUFT[P.tuft || 0]; if (tu) { rows[0] = tu[0]; rows[1] = tu[1]; rows[2] = tu[2] }
    const px = spr(rows, x, y);
    const F2 = P.face || {}, E = EYE[F2.eyes || "open"], [ox, oy] = F2.off || [0, 0], fx = x + ox, fy = y + oy;
    /* dahi dibersihkan dulu (kulit) supaya alis yang naik tidak menimpa garis rambut */
    for (const [bx, by] of [[8, 10], [12, 10], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9], [16, 9], [17, 9], [18, 9], [9, 10], [10, 10], [11, 10], [16, 10], [17, 10], [18, 10], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11], [16, 11], [17, 11], [18, 11]]) {
      const ch = rows[by] && rows[by][bx - ox]; if (ch === "s" || ch === "d") px.push([fx + bx, fy + by, "s"]);
    }
    px.push(...spr(E.n, fx + 9, fy + 13 + (E.dy || 0)), ...spr(E.f, fx + 16, fy + 13 + (E.dy || 0)));
    const B = BROW[F2.brow || "calm"];
    for (const [bx, by] of B.px) px.push([fx + bx, fy + by, "h"]);
    px.push([fx + 15, fy + 17, "d"], [fx + 14, fy + 18, "d"]); /* hidung + bayangan bawahnya */
    px.push([fx + 8, fy + 18, "b"], [fx + 9, fy + 18, "b"], [fx + 18, fy + 18, "b"]); /* rona pipi */
    if (F2.flush) px.push([fx + 9, fy + 19, "b"], [fx + 10, fy + 19, "b"], [fx + 17, fy + 19, "b"]);
    for (const [mx, my, ch] of MOUTH[F2.mouth || "smile"]) px.push([fx + mx, fy + my, ch]);
    for (const [gx, gy, c] of GLASS) px.push([fx + gx, fy + gy, c]);
    if (GLASS.length) px.push([fx + 13, fy + 13, "G"]);
    F.draw(px, { grp: "head", rim: "o", rimSkip: (X, Y, dx, dy) => dy !== 1 });
  }

  /* ======================= RENDER ======================= */
  function render(g, P) {
    const F = Fig(g.W, g.H), J = P.jump || 0, B = P.by || 0, TX = P.tx || 0;
    const sw = P.shadow ?? 13, SH = "#a5714f";
    for (let y = 61; y <= 63; y++) { const hw = y === 62 ? sw : y === 61 ? sw - 2 : sw - 4; for (let x = 32 - hw; x <= 32 + hw; x++) g.set(x, y, SH) }
    const A = P.arms;
    arm(F, A.f.sh, A.f.el, A.f.wr, A.f.hand, 1, TX);
    leg(F, [34, 45 - TALL + B + J], P.legs.f.a, P.legs.f.s, 1);
    F.draw(spr(HIP, 24, 42 - TALL + B + J), { grp: "pants" });
    leg(F, [28, 45 - TALL + B + J], P.legs.n.a, P.legs.n.s, 0);
    const tox = 23 + TX, toy = 28 - TALL + B + J - (P.breath || 0);
    F.draw(spr(TORSO, tox, toy), { grp: "torso", rim: "v", rimSkip: (X, Y, dx, dy) => dy !== 1 });
    if (LANYARD) F.draw(spr(LANYARD, tox, toy), { grp: "lan", rim: "v", rimSkip: (X, Y) => Y < toy + 7 });
    if (!P.armLate) arm(F, A.n.sh, A.n.el, A.n.wr, A.n.hand, 0, TX);
    head(F, 20 + (P.hx || 0) + TX, 6 - TALL + (P.hy || 0) + J, P);
    if (P.armLate) arm(F, A.n.sh, A.n.el, A.n.wr, A.n.hand, 0, TX);
    const { W, H, L } = F;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const ch = L[y * W + x]; if (ch) g.set(x, y, PAL[ch]) }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (L[y * W + x]) continue;
      const r = F.at(x + 1, y), dn = F.at(x, y + 1), lf = F.at(x - 1, y), up = F.at(x, y - 1);
      if (!r && !dn && !lf && !up) continue;
      const lit = (r || dn) && !lf && !up, n = r || dn || lf || up;
      g.set(x, y, lit ? LITO[MAT[n]] || NV : NV);
    }
    if (P.fx) P.fx(g);
  }

  /* ======================= POSE ======================= */
  const armsAt = (dy = 0, sw = 0, hand = "open") => ({
    n: { sh: [25, 31 + dy], el: [24 - sw * .4, 36 + dy], wr: [24 - sw, 40 + dy - Math.abs(sw) * .2], hand },
    f: { sh: [38, 31 + dy], el: [39 + sw * .4, 36 + dy], wr: [40 + sw, 40 + dy - Math.abs(sw) * .2], hand }
  });
  const standLegs = () => ({ n: { a: [27, 57], s: "flat" }, f: { a: [36, 56], s: "flat" } });

  /* idle: napas tenang, kepala tertinggal 1 frame, kedip di frame 6 */
  const idle = {
    fps: 8, frames: 8, draw(g, f) {
      const br = [0, 0, 1, 1, 1, 1, 0, 0][f], hb = [0, 0, 0, 1, 1, 1, 1, 0][f];
      render(g, { breath: br, hy: -hb, arms: armsAt(-br), legs: standLegs(), tuft: [0, 0, 0, 0, 1, 1, 1, 0][f],
        face: { eyes: f === 6 ? "blink" : "open", mouth: "smile" } });
    }
  };
  /* nod: angguk 2x, wajah ikut menunduk, senyum, mata terpejam senang di titik terendah */
  const nod = {
    fps: 8, frames: 6, draw(g, f) {
      const hy = [0, 2, 1, 0, 2, 1][f], fy = [0, 1, 0, 0, 1, 0][f], br = [0, 0, 1, 0, 0, 1][f];
      render(g, { breath: br, hy, arms: armsAt(-br), legs: standLegs(), tuft: [1, 0, 0, 1, 0, 0][f],
        face: { eyes: hy === 2 ? "happy" : "open", mouth: "smile", off: [0, fy] } });
    }
  };
  /* shake: geleng 2x, alis cemas, mulut datar/berombak */
  const shake = {
    fps: 8, frames: 6, draw(g, f) {
      const hx = [0, -1, 1, 0, -1, 1][f];
      render(g, { hx, arms: armsAt(0), legs: standLegs(), tuft: hx < 0 ? 2 : hx > 0 ? 1 : 0,
        face: { eyes: "flat", brow: "worry", mouth: f % 3 === 0 ? "flat" : "wavy", off: [hx, 0] } });
    }
  };
  /* surprised: tersentak, tangan terangkat terbuka, mata bulat, mulut O, tanda seru */
  const SP = [
    { j: -2, b: 0, hy: 1, up: .8, sh: 10, ex: 1 },
    { j: -3, b: 0, hy: 0, up: 1, sh: 9, ex: 2 },
    { j: -1, b: 0, hy: -1, up: 1, sh: 11, ex: 2 },
    { j: 0, b: 1, hy: 0, up: .8, sh: 13, ex: 2 },
    { j: 0, b: 0, hy: 0, up: .7, sh: 13, ex: 2 },
    { j: 0, b: 0, hy: 0, up: .6, sh: 13, ex: 3 }
  ];
  const surprised = {
    fps: 10, frames: 6, draw(g, f) {
      const k = SP[f], u = k.up, L = (a, c) => a + (c - a) * u, b = k.b + k.j, air = k.j < 0;
      const legs = { n: { a: [27, 57 + k.j - (air ? 1 : 0)], s: air ? "toe" : "flat" }, f: { a: [36, 56 + k.j - (air ? 1 : 0)], s: air ? "toe" : "flat" } };
      render(g, {
        by: k.b, jump: k.j, hy: k.hy, legs, shadow: k.sh, tuft: air ? 1 : 0,
        arms: {
          n: { sh: [25, 31 + b], el: [L(24, 21), L(36, 35) + b], wr: [L(24, 21), L(40, 30) + b], hand: "open" },
          f: { sh: [38, 31 + b], el: [L(39, 42), L(36, 35) + b], wr: [L(40, 43), L(40, 30) + b], hand: "open" }
        },
        face: { eyes: "wide", brow: "high", mouth: "O" },
        fx(g) { exclaim(g, 45, 1 + k.j + (k.ex === 1 ? 2 : 0), k.ex) }
      });
    }
  };
  function exclaim(g, x, y, s) {
    const C = { N: NV, Y: "#ffd23f", D: "#e09a2a", W: "#fffaf0" };
    const R = s === 1 ? [" NN ", "NWYN", "NYDN", " NN ", "NYDN", " NN "]
      : s === 3 ? ["  NNN", " NWYN", " NYYN", " NYDN", "NYDN ", "NYDN ", " NN  ", "     ", "NYDN ", " NN  "]
        : [" NNN", "NWYN", "NYYN", "NYDN", "NYDN", "NYDN", " NN ", "    ", "NYDN", " NN "];
    R.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, C[ch]) }));
    if (s === 2) g.set(x - 2, y + 1, C.Y).set(x - 3, y, C.Y).set(x + 6, y + 1, C.Y).set(x + 7, y, C.Y);
  }
  /* sad: kepala tertunduk, bahu turun, menghela napas + embusan */
  const sad = {
    fps: 6, frames: 8, draw(g, f) {
      const br = [0, 0, 1, 1, 0, -1, -1, 0][f], hb = [0, 0, 0, 1, 1, 0, 0, 0][f];
      render(g, {
        by: 1, breath: br, hy: 2 - hb + (br < 0 ? 1 : 0), hx: 1, legs: standLegs(),
        arms: { n: { sh: [25, 33 - br], el: [25, 38], wr: [26, 43], hand: "open" }, f: { sh: [38, 33 - br], el: [38, 38], wr: [38, 43], hand: "open" } },
        face: { eyes: f === 7 ? "blink" : "sad", brow: "sad", mouth: br < 0 ? "o" : "frown", off: [0, 1] },
        fx(g) { if (f === 5) puff(g, 44, 26, 0); if (f === 6) puff(g, 46, 24, 1) }
      });
    }
  };
  function puff(g, x, y, s) {
    const C = { N: "#5a5290", W: "#f3eefb", S: "#c9c0e4" };
    const R = s ? [" NNN ", "NWWSN", "NWSSN", " NNN "] : [" NN ", "NWSN", " NN "];
    R.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, C[ch]) }));
  }
  /* happy: jongkok antisipasi -> lompat -> mendarat squash, dua kepalan diangkat tinggi */
  const HP = [
    { j: 0, b: 2, hy: 1, up: 0, legs: { n: [27, 57, "flat"], f: [36, 56, "flat"] }, sh: 13 },
    { j: -2, b: 0, hy: 0, up: .7, legs: { n: [27, 56, "toe"], f: [36, 55, "toe"] }, sh: 10 },
    { j: -4, b: 0, hy: -1, up: 1, legs: { n: [25, 53, "toe"], f: [34, 52, "toe"] }, sh: 8 },
    { j: -2, b: 0, hy: 0, up: 1, legs: { n: [27, 55, "toe"], f: [36, 54, "toe"] }, sh: 10 },
    { j: 0, b: 1, hy: 1, up: .8, legs: { n: [27, 57, "flat"], f: [36, 56, "flat"] }, sh: 13 },
    { j: 0, b: 0, hy: 0, up: .4, legs: { n: [27, 57, "flat"], f: [36, 56, "flat"] }, sh: 13 }
  ];
  const happy = {
    fps: 8, frames: 6, draw(g, f) {
      const k = HP[f], u = k.up, L = (a, c) => a + (c - a) * u, b = k.b + k.j;
      const legs = { n: { a: [k.legs.n[0], k.legs.n[1] + k.j], s: k.legs.n[2] }, f: { a: [k.legs.f[0], k.legs.f[1] + k.j], s: k.legs.f[2] } };
      render(g, {
        by: k.b, jump: k.j, hy: k.hy, legs, shadow: k.sh,
        arms: {
          n: { sh: [25, 31 + b], el: [L(23, 20), L(36, 27) + b], wr: [L(22, 19), L(40, 20) + b], hand: "fist" },
          f: { sh: [38, 31 + b], el: [L(40, 42), L(36, 28) + b], wr: [L(41, 43), L(40, 21) + b], hand: "fist" }
        },
        tuft: k.j < 0 ? 1 : 0, face: { eyes: "happy", mouth: "grin", brow: "high" },
        fx(g) { const s1 = [1, 2, 3, 2, 1, 2][f], s2 = [3, 2, 1, 2, 3, 2][f]; star(g, 10, 14, s1); star(g, 52, 9, s2) }
      });
    }
  };
  function star(g, x, y, s) {
    const C = "#ffd23f", D = "#e09a2a", Wt = "#fffaf0";
    if (s >= 3) { for (let k = 1; k <= 3; k++) { const c = k === 3 ? D : C; g.set(x - k, y, c).set(x + k, y, c).set(x, y - k, c).set(x, y + k, c) } g.set(x - 1, y - 1, D).set(x + 1, y - 1, D).set(x - 1, y + 1, D).set(x + 1, y + 1, D) }
    else if (s === 2) { for (let k = 1; k <= 2; k++) { const c = k === 2 ? D : C; g.set(x - k, y, c).set(x + k, y, c).set(x, y - k, c).set(x, y + k, c) } }
    else { g.set(x - 1, y, D).set(x + 1, y, D).set(x, y - 1, D).set(x, y + 1, D) }
    g.set(x, y, Wt);
  }
  /* thinking: tangan di dagu, mata ke atas, alis berpikir, titik pikiran bergantian */
  const thinking = {
    fps: 6, frames: 6, draw(g, f) {
      const br = [0, 0, 1, 1, 1, 0][f], hb = [0, 0, 0, 1, 1, 1][f];
      render(g, {
        breath: br, hy: -hb, legs: standLegs(), armLate: 1, tuft: hb,
        arms: { n: { sh: [25, 31 - br], el: [26, 39], wr: [33, 31 - hb], hand: "chin" }, f: { sh: [38, 31 - br], el: [39, 36 - br], wr: [38, 40 - br], hand: "open" } },
        face: { eyes: "up", brow: "think", mouth: "hmm" },
        fx(g) { const on = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1], [0, 0, 1]][f]; if (on[0]) dot(g, 43, 10, 0); if (on[1]) dot(g, 48, 6, 0); if (on[2]) dot(g, 53, 1, 1) }
      });
    }
  };
  function dot(g, x, y, big) {
    const Wt = "#fffaf0", S = "#d6cdee", r = big ? ["  oo  ", " oWWo ", "oWWWSo", "oWWSSo", " oSSo ", "  oo  "] : [" oo ", "oWWo", "oWSo", " oo "];
    r.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, ch === "o" ? NV : ch === "W" ? Wt : S) }));
  }

  SIMPX.char("rekan", { w: 64, h: 64, anims: { idle, nod, shake, surprised, sad, happy, thinking } });
})();
