/* Tokoh "atasan" pixel art 64x64 (preview, tools/_simpx). Teknik sama persis dengan hero.js:
   - Kepala+rambut, wajah, kacamata, torso (kemeja + dasi + ikat pinggang), tangan, sepatu pantofel = PETA PIKSEL TANGAN.
   - Lengan & kaki = tabung berpita tetap dari titik sendi (lengan panjang kemeja + manset).
   - Garis tepi luar 1 px: kiri/atas = versi gelap warna bidang, kanan/bawah = navy. Bagian jauh satu tingkat lebih gelap.
   Proporsi: 2 px lebih tinggi dari hero (tungkai lebih panjang), rambut abu tua disisir rapi belah samping,
   dahi terlihat, alis selalu tampak, kacamata berbingkai gelap. Tanpa lanyard. */
(() => {
  const NV = "#1b1740", TALL = 2;
  const PAL = {
    /* kulit */ A: "#fff0d8", a: "#fadbb6", s: "#f0c8a0", d: "#d59b80", e: "#a3666c", k: "#7a4152", b: "#f2a08c",
    /* rambut abu tua */ i: "#a29fae", H: "#6e6c7c", h: "#3b3b47", j: "#24202f",
    /* kemeja navy */ l: "#a3b1e6", c: "#7487c9", C: "#5266a8", T: "#4b5e9e", t: "#2c3e75", u: "#222f5f", v: "#19204a",
    /* dasi merah */ x: "#ff8573", X: "#e63946", z: "#b02848", Z: "#761d46",
    /* ikat pinggang */ n: "#2b2337", M: "#ffc83d",
    /* celana */ P: "#3d4b82", p: "#1f2a50", q: "#182042", Q: "#121634",
    /* pantofel */ K: "#d7aa92", B: "#694040", D: "#43283a", r: "#2b1b2b", R: "#170f1d",
    /* mata, mulut */ N: NV, V: "#43283a", I: "#7a4a52", L: "#b98074", W: "#fffaf0", m: "#8a3a4a", o: NV,
    /* kacamata */ g: "#2e2848", y: "#c49a92", G: "#fffaf0"
  };
  const FAR = { A: "a", a: "s", s: "d", d: "e", e: "e", k: "k", b: "d", i: "H", H: "h", h: "j", j: "j",
    l: "c", c: "C", C: "u", T: "t", t: "u", u: "v", v: "v", x: "X", X: "z", z: "Z", Z: "Z",
    P: "p", p: "q", q: "Q", Q: "Q", K: "B", B: "D", D: "D", r: "R", R: "R" };
  const MAT = {}; const mats = { skin: "AasdekbmNVILWgyG", hair: "iHhj", shirt: "lcCTtuv", tie: "xXzZ", belt: "nM", pants: "PpqQ", shoe: "KBD", sole: "rR" };
  for (const [k, s] of Object.entries(mats)) for (const ch of s) MAT[ch] = k;
  const LITO = { skin: "#8a4b52", hair: "#16121f", shirt: PAL.v, tie: PAL.Z, belt: NV, pants: NV, shoe: "#2b1b2b", sole: "#170f1d" };

  const map = (rows) => rows.map(r => r ? " ".repeat(r[0]) + r[1] : "");

  /* ======================= PETA TANGAN ======================= */
  /* kepala + rambut (24 x 22), hadap 3/4 kanan. Rambut disisir rapi ke kanan dari belahan di kiri (garis j),
     pita kilau i di kubah, sisi dipangkas pendek di atas telinga, dahi lebar terlihat. */
  const HEAD = map([
    null,
    [9, "hHHHhh"],
    [6, "hHHHiiiHhhh"],
    [5, "hHHjiiiiiHHhh"],
    [4, "hHHjHiiiiiiHHhh"],
    [3, "hHHjHHHHiiiHHhhhj"],
    [3, "hHjhhhHHHHHHhhhhjj"],
    [2, "hhjhhhhhhhhhhhhjjdd"],
    [2, "hjhhhhhhhhjjjddssss"],
    [2, "hjhhhhhjjddssssssss"],
    [2, "hjhhhhjdsssssssssss"],
    [2, "hjhhhjdssssssssssss"],
    [2, "hjjhjdssssssssssssd"],
    [2, "hdasddsssssssssssss"],
    [2, "hdseddssssssssssssd"],
    [3, "dsedsssssssssssssd"],
    [3, "dddssssssssssssdd"],
    [4, "ddsssssssssssssd"],
    [5, "dssssssssssssd"],
    [7, "dssssssssssd"],
    [9, "dssssssdd"],
    [11, "ddsdd"]
  ]);
  /* mata dekat 4x5 & mata jauh 3x5 (relatif kepala, mulai baris 13); iris coklat tua */
  const EYE = {
    open: { n: ["NNNN", "NWNN", "NWVN", "NIIN", " LL "], f: ["NNN", "WNN", "WVN", "IIN", "LL "] },
    up: { n: ["NNNN", "NIVN", "NLIN", "NWWN", " NN "], f: ["NNN", "IVN", "LIN", "WWN", "NN "] },
    blink: { n: ["    ", "    ", "N  N", " NN ", "    "], f: ["   ", "   ", "N  ", " NN", "   "] },
    happy: { n: ["    ", " NN ", "N  N", "N  N", "    "], f: ["   ", " NN", "N  ", "N  ", "   "] },
    wide: { n: [" NN ", "NWWN", "NWNN", "NWNN", "NWWN", " NN "], f: [" N ", "WWN", "WNN", "WNN", "WWN", " N "], dy: -1 },
    sad: { n: ["    ", "NNNN", "NNVN", "NIIN", " LL "], f: ["   ", "NNN", "NVN", "IIN", "LL "] },
    flat: { n: ["    ", "NNNN", "NWVN", "NIIN", " LL "], f: ["   ", "NNN", "WVN", "IIN", "LL "] }
  };
  /* alis abu tua, selalu tampak di dahi (relatif kepala). sk = kulit pembersih di bawahnya */
  const BROW = {
    calm: { px: [[8, 11], [9, 10], [10, 10], [11, 10], [12, 10], [16, 10], [17, 10], [18, 10]] },
    think: { px: [[8, 11], [9, 11], [10, 11], [11, 11], [12, 11], [16, 10], [17, 9], [18, 9]] },
    sad: { px: [[8, 11], [9, 11], [10, 11], [11, 10], [12, 9], [16, 9], [17, 10], [18, 11]] },
    worry: { px: [[8, 11], [9, 11], [10, 10], [11, 10], [12, 10], [16, 10], [17, 10], [18, 11]] },
    high: { px: [[8, 10], [9, 9], [10, 9], [11, 9], [12, 9], [16, 9], [17, 9], [18, 9]] }
  };
  const MOUTH = {
    smile: [[12, 19, "m"], [13, 20, "m"], [14, 20, "m"], [15, 19, "m"]],
    grin: [[12, 19, "m"], [13, 19, "m"], [14, 19, "m"], [15, 19, "m"], [16, 19, "m"], [12, 20, "m"], [13, 20, "W"], [14, 20, "W"], [15, 20, "x"], [16, 20, "m"], [13, 21, "m"], [14, 21, "x"], [15, 21, "m"]],
    hmm: [[12, 20, "m"], [13, 20, "m"], [14, 19, "m"], [15, 19, "m"]],
    flat: [[12, 20, "m"], [13, 20, "m"], [14, 20, "m"], [15, 20, "k"]],
    wavy: [[12, 20, "m"], [13, 19, "m"], [14, 20, "m"], [15, 20, "k"]],
    frown: [[12, 20, "m"], [13, 19, "m"], [14, 19, "m"], [15, 20, "m"]],
    O: [[13, 19, "m"], [14, 19, "m"], [12, 20, "m"], [13, 20, "o"], [14, 20, "k"], [15, 20, "m"], [13, 21, "m"], [14, 21, "m"]],
    o: [[13, 20, "m"], [14, 20, "m"], [13, 21, "m"], [14, 21, "k"]]
  };
  /* kacamata berbingkai persegi: lensa dekat 6x7, lensa jauh 5x7, jembatan, gagang ke telinga, kilau lensa */
  const GLASS = [
    [6, 12, "g"], [7, 12, "g"], [8, 12, "g"], [9, 12, "g"], [10, 12, "g"], [11, 12, "g"], [12, 12, "g"], [13, 12, "g"], [14, 13, "g"],
    [15, 12, "g"], [16, 12, "g"], [17, 12, "g"], [18, 12, "g"], [19, 12, "g"],
    [8, 13, "g"], [8, 14, "g"], [8, 15, "y"], [8, 16, "y"], [9, 17, "y"], [13, 13, "y"], [13, 14, "y"], [13, 15, "y"], [13, 16, "y"],
    [15, 13, "y"], [15, 14, "y"], [15, 15, "y"], [19, 13, "g"], [19, 14, "g"], [19, 15, "y"], [19, 16, "y"], [18, 17, "y"]
  ];
  /* torso (17 x 16): kemeja navy berkerah, dasi merah (simpul + bilah meruncing), ikat pinggang bergesper */
  const TORSO = map([
    [4, "lccsssdcc"],
    [2, "TlllcxXXclcCu"],
    [1, "TTcllcxXzcCCuuv"],
    [1, "TtuCccCxXzCuttu"],
    [1, "TttMCcuxXzutttu"],
    [1, "TtulutuxXzttuuu"],
    [1, "TtuttuuxXzttuuu"],
    [1, "tttutttxXztuuuu"],
    [1, "ttttuttxXzuuuuu"],
    [1, "tttttttxXztuuuu"],
    [1, "tttttttxXzuuuuu"],
    [1, "ttttttttXZuuuuu"],
    [1, "tttttttttZtuuuu"],
    [1, "tttttttttttuuuv"],
    [1, "nnnnnnMMnnnnnnn"],
    [1, "Pppppppppppqqqq"]
  ]);
  const LANYARD = null;
  /* panggul celana (15 x 4) */
  const HIP = map([[0, "ppppppppppppqqq"], [0, "ppppppppppppqqq"], [0, "QqqqqqqqqqqqqqQ"], [0, "Ppppppppppppqqq"]]);
  /* tangan: peta 4-5 px dengan buku jari, ibu jari, dan celah jari. jangkar = pergelangan */
  const HAND = {
    open: { ox: -1, oy: 0, rows: [" aa ", "aAas", "aAsds", "asds", " dd "] },
    fist: { ox: -1, oy: -1, rows: [" aa ", "aAAs", "asds", "aAsd", " dd "] },
    chin: { ox: -1, oy: -4, rows: ["  a ", "  as", " aAs", "aAsd", "asdd", " dd "] }
  };
  /* pantofel kulit: rendah, ujung meruncing, kilau di punggung kaki, sol tipis gelap */
  const SHOE = {
    flat: { ox: -3, oy: 1, rows: ["DBBD    ", "DBBKBBD ", "DBBBBBKBD", "rrrrrrrrR"] },
    toe: { ox: -3, oy: 0, rows: ["DB      ", "DBBK    ", "rDBBKD  ", " rrDBBKD", "   rrrrR"] },
    heel: { ox: -3, oy: 0, rows: ["      B ", "DBBBKBBD", "DDBBBBrR", "rrrrrR  "] }
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
  /* lengan panjang: lengan bawah (4 px) berakhir manset terang, lengan atas (5 px) di atasnya; satu grup, jadi
     siku tidak diberi garis; tangan kulit keluar dari manset */
  function arm(F, sh, el, wr, hand, far, tx = 0) {
    sh = [sh[0] + tx, sh[1] - TALL]; el = [el[0] + tx, el[1] - TALL]; wr = [wr[0] + tx, wr[1] - TALL];
    const g = far ? "armF" : "arm";
    F.draw(tube([el, wr], "Tttu", { rowPat: (j, n) => j === n - 1 ? "lccC" : null }), { grp: g, rim: "v", far });
    F.draw(tube([sh, el], "Tttuu", { capTop: 1 }), { grp: g, rim: "v", far });
    const H = HAND[hand || "open"];
    F.draw(spr(H.rows, Math.round(wr[0]) + H.ox, Math.round(wr[1]) + H.oy + 1), { grp: g + "h", rim: "e", far });
  }
  function head(F, x, y, P) {
    const rows = HEAD.slice();
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
    px.push([fx + 7, fy + 19, "d"], [fx + 18, fy + 19, "d"]); /* garis senyum halus (usia) */
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
      render(g, { breath: br, hy: -hb, arms: armsAt(-br), legs: standLegs(),
        face: { eyes: f === 6 ? "blink" : "open", mouth: "smile" } });
    }
  };
  /* nod: angguk 2x, wajah ikut menunduk, senyum, mata terpejam senang di titik terendah */
  const nod = {
    fps: 8, frames: 6, draw(g, f) {
      const hy = [0, 2, 1, 0, 2, 1][f], fy = [0, 1, 0, 0, 1, 0][f], br = [0, 0, 1, 0, 0, 1][f];
      render(g, { breath: br, hy, arms: armsAt(-br), legs: standLegs(),
        face: { eyes: hy === 2 ? "happy" : "open", mouth: "smile", off: [0, fy] } });
    }
  };
  /* shake: geleng 2x, alis cemas, mulut datar/berombak */
  const shake = {
    fps: 8, frames: 6, draw(g, f) {
      const hx = [0, -1, 1, 0, -1, 1][f];
      render(g, { hx, arms: armsAt(0), legs: standLegs(),
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
        by: k.b, jump: k.j, hy: k.hy, legs, shadow: k.sh,
        arms: {
          n: { sh: [25, 31 + b], el: [L(24, 21), L(36, 35) + b], wr: [L(24, 21), L(40, 30) + b], hand: "open" },
          f: { sh: [38, 31 + b], el: [L(39, 42), L(36, 35) + b], wr: [L(40, 43), L(40, 30) + b], hand: "open" }
        },
        face: { eyes: "wide", brow: "high", mouth: "O" },
        fx(g) { exclaim(g, 46, 1 + k.j + (k.ex === 1 ? 2 : 0), k.ex) }
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
        fx(g) { if (f === 5) puff(g, 44, 24, 0); if (f === 6) puff(g, 46, 22, 1) }
      });
    }
  };
  function puff(g, x, y, s) {
    const C = { N: "#5a5290", W: "#f3eefb", S: "#c9c0e4" };
    const R = s ? [" NNN ", "NWWSN", "NWSSN", " NNN "] : [" NN ", "NWSN", " NN "];
    R.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, C[ch]) }));
  }
  /* happy: atasan tidak melompat tinggi: jinjit kecil + dua kepalan terangkat setinggi bahu, senyum lebar */
  const HP = [
    { j: 0, b: 1, hy: 1, up: 0, legs: { n: [27, 57, "flat"], f: [36, 56, "flat"] }, sh: 13 },
    { j: -1, b: 0, hy: 0, up: .7, legs: { n: [27, 56, "toe"], f: [36, 55, "toe"] }, sh: 11 },
    { j: -2, b: 0, hy: -1, up: 1, legs: { n: [27, 55, "toe"], f: [36, 54, "toe"] }, sh: 10 },
    { j: -1, b: 0, hy: 0, up: 1, legs: { n: [27, 56, "toe"], f: [36, 55, "toe"] }, sh: 11 },
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
          n: { sh: [25, 31 + b], el: [L(23, 21), L(36, 33) + b], wr: [L(22, 20), L(40, 26) + b], hand: "fist" },
          f: { sh: [38, 31 + b], el: [L(40, 42), L(36, 33) + b], wr: [L(41, 43), L(40, 27) + b], hand: "fist" }
        },
        face: { eyes: "happy", mouth: "grin", brow: "high" },
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
        breath: br, hy: -hb, legs: standLegs(), armLate: 1,
        arms: { n: { sh: [25, 31 - br], el: [26, 39], wr: [33, 31 - hb], hand: "chin" }, f: { sh: [38, 31 - br], el: [39, 36 - br], wr: [38, 40 - br], hand: "open" } },
        face: { eyes: "up", brow: "think", mouth: "hmm" },
        fx(g) { const on = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1], [0, 0, 1]][f]; if (on[0]) dot(g, 43, 9, 0); if (on[1]) dot(g, 48, 5, 0); if (on[2]) dot(g, 53, 0, 1) }
      });
    }
  };
  function dot(g, x, y, big) {
    const Wt = "#fffaf0", S = "#d6cdee", r = big ? ["  oo  ", " oWWo ", "oWWWSo", "oWWSSo", " oSSo ", "  oo  "] : [" oo ", "oWWo", "oWSo", " oo "];
    r.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, ch === "o" ? NV : ch === "W" ? Wt : S) }));
  }

  SIMPX.char("atasan", { w: 64, h: 64, anims: { idle, nod, shake, surprised, sad, happy, thinking } });
})();
