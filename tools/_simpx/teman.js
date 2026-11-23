/* Tokoh "teman" pixel art 64x64 (preview, tools/_simpx): teman sebaya yang ceria. Rangka, proporsi, IK kaki,
   tabung lengan, garis tepi otomatis dan semua pose diambil dari hero.js supaya satu dunia.
   - Kepala: topi baseball merah dipakai sedikit miring (kubah + pet ke kanan-depan + logo bulat), rambut hitam
     pendek keluar di belakang topi dan cambang; semua PETA PIKSEL TANGAN.
   - Kaos kuning berleher bulat dengan grafis bintang merah kecil di dada, jeans biru, sneakers merah bersol putih.
   - Bagian jauh memakai palet satu tingkat lebih gelap; bayangan bergeser ke ungu, sorotan ke kuning hangat. */
(() => {
  const NV = "#1b1740";
  const PAL = {
    /* kulit sawo matang */ A: "#e9b27c", a: "#d39463", s: "#b9784a", d: "#93573c", e: "#6b3a3e", k: "#4c2536", b: "#d8705c",
    /* rambut hitam (sorotan kebiruan) */ i: "#5c5f8c", H: "#3b3a60", h: "#262341", j: "#15122b",
    /* topi merah */ 1: "#ffa48c", 2: "#f5645c", 3: "#e63946", 4: "#ad2943", 5: "#73203e",
    /* kaos kuning */ T: "#fff1a6", t: "#ffd23f", u: "#e0a136", v: "#8c4b4f",
    /* jeans */ P: "#5d9be0", p: "#2b6cb0", q: "#22528f", Q: "#1b3a6c",
    /* sneakers: badan merah, sol putih */ W: "#f5645c", Y: "#c93a4a", X: "#8d2a46", r: "#fffaf0", R: "#c9b8c4",
    /* mata, mulut, putih mata/gigi */ N: NV, V: "#3d2c7a", I: "#7b62c4", L: "#ab95ea", m: "#6e2b3d", o: NV, w: "#fffaf0", y: "#e9dcc4", c: "#e8735a"
  };
  const SHIRT = ["T", "t", "u", "v"].map(k => PAL[k]);
  const FAR = { A: "a", a: "s", s: "d", d: "e", e: "e", k: "k", b: "d", i: "H", H: "h", h: "j", j: "j", T: "t", t: "u", u: "v", v: "v", P: "p", p: "q", q: "Q", Q: "Q", W: "Y", Y: "X", X: "X", r: "R", R: "R", 1: "2", 2: "3", 3: "4", 4: "5", 5: "5" };
  const MAT = {}; const mats = { skin: "AasdekbmNVILwyc", hair: "iHhj", cap: "12345", shirt: "Ttuv", pants: "PpqQ", shoe: "WYX", sole: "rR" };
  for (const [k, s] of Object.entries(mats)) for (const ch of s) MAT[ch] = k;
  const LITO = { skin: "#5e2f33", hair: "#0f0c20", cap: "#62183a", shirt: "#8c4b4f", pants: NV, shoe: "#5e1c3c", sole: "#8f7c92" };

  /* peta dari [kolomMulai, "isi"] per baris */
  const map = (rows) => rows.map(r => r ? " ".repeat(r[0]) + r[1] : "");

  /* ======================= PETA TANGAN ======================= */
  /* kepala (25 x 22), hadap 3/4 kanan: kubah topi (sorotan kiri atas, jahitan panel, kancing atas), pet
     miring turun ke kanan-depan dengan bayangan di bawahnya, rambut hitam di belakang topi dan cambang di depan
     telinga. Baris 10-11 = dahi dalam bayangan pet. Wajah (baris 13-21) sama persis dengan hero. */
  const HEAD = map([
    [11, "23334"],
    [7, "222233333334"],
    [5, "21112233333334"],
    [3, "2111122333333334"],
    [2, "21112233333333334"],
    [2, "212223333333333334"],
    [2, "22233333333333333" + "4" + "11223"],
    [2, "44444444444" + "1122222223" + "34"],
    [2, "hhHhhhhhhhh" + "3333333334" + "5"],
    [2, "hHhhhhhhjhh" + "dd" + "55555555"],
    [2, "hhhhhhjhsdddddddddd"],
    [2, "hhjjhdssssdddsssssd"],
    [2, "hjjdhassssssssssssd"],
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
  /* jahitan panel topi + logo bulat putih berbintik kuning di depan kubah */
  const CAPDET = [[11, 1, "3"], [10, 2, "3"], [9, 3, "3"], [8, 4, "3"], [8, 5, "3"], [15, 1, "4"], [16, 2, "4"], [17, 3, "4"],
    [14, 3, "w"], [15, 3, "w"], [14, 4, "w"], [15, 4, "y"]];
  /* jumput rambut yang mencuat di belakang topi; 0 diam, 1 terangkat, 2 terkulai (ikut gerak kepala) */
  const TUFT = [
    [[1, 8, "h"], [0, 9, "h"], [1, 9, "H"], [0, 10, "j"]],
    [[1, 7, "h"], [0, 8, "h"], [1, 8, "H"], [0, 9, "j"]],
    [[1, 9, "h"], [0, 10, "h"], [1, 10, "H"], [1, 11, "j"]]
  ];
  /* mata dekat 4x5 & mata jauh 3x5 (relatif kepala, mulai baris 13) */
  const EYE = {
    open: { n: ["NNNN", "NwNN", "NwVN", "NIIN", " LL "], f: ["NNN", "wNN", "wVN", "IIN", "LL "], lash: 1 },
    up: { n: ["NNNN", "NIVN", "NLIN", "NwwN", " NN "], f: ["NNN", "IVN", "LIN", "wwN", "NN "] },
    blink: { n: ["    ", "    ", "N  N", " NN ", "    "], f: ["   ", "   ", "N  ", " NN", "   "] },
    happy: { n: ["    ", " NN ", "N  N", "N  N", "    "], f: ["   ", " NN", "N  ", "N  ", "   "] },
    /* kaget: mata bulat putih, pupil kecil, satu baris lebih tinggi */
    wide: { n: [" NN ", "NwwN", "NwNN", "NwNN", "NwwN", " NN "], f: [" N ", "wwN", "wNN", "wNN", "wwN", " N "], dy: -1 },
    /* sedih: kelopak turun, menatap ke bawah */
    sad: { n: ["    ", "NNNN", "NNVN", "NIIN", " LL "], f: ["   ", "NNN", "NVN", "IIN", "LL "] },
    /* marah: kelopak miring turun ke arah hidung */
    angry: { n: ["N   ", "NNN ", "NwNN", "NIVN", " NN "], f: ["  N", " NN", "NwN", "IVN", "NN "] },
    /* ragu: kelopak setengah, datar */
    flat: { n: ["    ", "NNNN", "NwVN", "NIIN", " LL "], f: ["   ", "NNN", "wVN", "IIN", "LL "], lash: 1 }
  };
  /* alis (relatif kepala). kulit di bawahnya (S) ikut dicat supaya alis tidak tenggelam di poni */
  const BROW = {
    norm: { px: [[9, 12], [10, 11], [11, 11], [12, 11], [16, 11], [17, 11], [18, 12]], sk: [] },
    think: { px: [[9, 12], [10, 12], [11, 12], [12, 12], [16, 11], [17, 10], [18, 10]], sk: [[16, 12], [17, 11], [18, 11], [17, 12], [18, 12]] },
    sad: { px: [[9, 12], [10, 12], [11, 11], [12, 11], [16, 11], [17, 12], [18, 12]], sk: [[9, 11], [10, 11], [16, 12], [17, 11], [18, 11]] },
    angry: { px: [[9, 11], [10, 11], [11, 12], [12, 12], [16, 12], [17, 11], [18, 11]], sk: [[11, 11], [12, 11], [16, 11]] },
    worry: { px: [[9, 12], [10, 12], [11, 11], [12, 11], [16, 11], [17, 11], [18, 12]], sk: [[9, 11], [10, 11], [18, 11]] },
    high: { px: [[9, 10], [10, 10], [11, 10], [12, 11], [16, 11], [17, 10], [18, 10]], sk: [[9, 11], [10, 11], [11, 11], [9, 12], [10, 12], [11, 12], [12, 12], [16, 12], [17, 11], [18, 11], [17, 12], [18, 12]] }
  };
  const MOUTH = {
    smile: [[12, 19, "m"], [13, 20, "m"], [14, 20, "m"], [15, 19, "m"]],
    grin: [[12, 19, "m"], [13, 19, "m"], [14, 19, "m"], [15, 19, "m"], [16, 19, "m"], [12, 20, "m"], [13, 20, "w"], [14, 20, "w"], [15, 20, "c"], [16, 20, "m"], [13, 21, "m"], [14, 21, "c"], [15, 21, "m"]],
    hmm: [[12, 20, "m"], [13, 20, "m"], [14, 19, "m"], [15, 19, "m"]],
    flat: [[12, 20, "m"], [13, 20, "m"], [14, 20, "m"], [15, 20, "k"]],
    wavy: [[12, 20, "m"], [13, 19, "m"], [14, 20, "m"], [15, 20, "k"]],
    frown: [[12, 20, "m"], [13, 19, "m"], [14, 19, "m"], [15, 20, "m"]],
    O: [[13, 19, "m"], [14, 19, "m"], [12, 20, "m"], [13, 20, "o"], [14, 20, "k"], [15, 20, "m"], [13, 21, "m"], [14, 21, "m"]],
    o: [[13, 20, "m"], [14, 20, "m"], [13, 21, "m"], [14, 21, "k"]],
    grit: [[12, 19, "m"], [13, 19, "m"], [14, 19, "m"], [15, 19, "m"], [16, 19, "m"], [12, 20, "m"], [13, 20, "w"], [14, 20, "y"], [15, 20, "w"], [16, 20, "m"], [13, 21, "m"], [14, 21, "m"], [15, 21, "m"]]
  };
  /* torso (17 x 16): kaos kuning berleher bulat (rib gelap), lipatan kain, kelim bawah */
  const TORSO = map([
    [4, "Ttusssdut"],
    [2, "TTTTtuuuuutuu"],
    [1, "TTTtttttttttuuv"],
    [1, "TTttttttttttuuu"],
    [1, "TTttttttttttuuu"],
    [1, "Tttttttttttttuu"],
    [1, "Tttttttttttttuu"],
    [1, "Ttttutttttttuuu"],
    [1, "Ttttuttttttttuu"],
    [1, "Tttttuttttttuuu"],
    [1, "Tttttuttttttuuu"],
    [1, "Ttttttttttttuuu"],
    [1, "tttttttttttuuuu"],
    [1, "tttttttttttuuuu"],
    [1, "uuuuuuuuuuuuuuv"],
    [1, "uuuuuuuuuuuuuvv"]
  ]);
  /* grafis bintang merah kecil di dada (relatif torso) */
  const STAR = [[9, 4, "2"], [8, 5, "2"], [9, 5, "3"], [10, 5, "3"], [11, 5, "4"], [7, 5, "2"], [8, 6, "3"], [9, 6, "3"], [10, 6, "4"], [8, 7, "3"], [10, 7, "4"]];
  /* panggul celana (15 x 4) */
  const HIP = map([[0, "ppppppppppppqqq"], [0, "ppppppppppppqqq"], [0, "QqqqqqqqqqqqqqQ"], [0, "Ppppppppppppqqq"]]);
  /* tangan: peta 4-5 px dengan buku jari, ibu jari, dan celah jari (bukan mitten). jangkar = pergelangan */
  const HAND = {
    open: { ox: -1, oy: 0, rows: [" aa ", "aAas", "aAsds", "asds", " dd "] },
    fist: { ox: -1, oy: -1, rows: [" aa ", "aAAs", "asds", "aAsd", " dd "] },
    chin: { ox: -1, oy: -4, rows: ["  a ", "  as", " aAs", "aAsd", "asdd", " dd "] }
  };
  /* sepatu, tumit di kiri, ujung bulat 1-2-3 di kanan; titik jangkar = pergelangan */
  const SHOE = {
    flat: { ox: -3, oy: 1, rows: ["YWWY    ", "YWWWWWY ", "YYYYYYWY", "rrrrrrrR"] },
    toe: { ox: -3, oy: 0, rows: ["YW      ", "YWWW    ", "rYWWWY  ", " rrYYYWY", "   rrrrR"] },
    heel: { ox: -3, oy: 0, rows: ["      W ", "YWWWWWWY", "YYYYYYrR", "rrrrrR  "] }
  };

  /* ======================= KOMPOSISI ======================= */
  function Fig(W, H) {
    const L = new Array(W * H).fill(null), G = new Array(W * H).fill(null);
    const ok = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    /* px: [[x,y,huruf]] ; o: {grp, rim, far} */
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
  /* tabung berpita: tiap baris diberi lebar pola yang SAMA, dipusatkan di garis tengah ruas.
     Hanya bila ruas sangat landai (geser > lebar per baris) baris dipanjangkan supaya tetap tersambung. */
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
  /* IK dua ruas: lutut/siku menekuk ke arah dir (+1 = depan/kanan) */
  function ik(ax, ay, bx, by, l1, l2, dir) {
    const dx = bx - ax, dy = by - ay, d = Math.min(Math.hypot(dx, dy), l1 + l2 - .001);
    const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))), base = Math.atan2(dy, dx), t = base - dir * a;
    return [ax + Math.cos(t) * l1, ay + Math.sin(t) * l1];
  }

  /* ======================= BAGIAN ======================= */
  function leg(F, hip, ank, shoe, far) {
    const kn = ik(hip[0], hip[1], ank[0], ank[1], 6.2, 6.4, 1);
    const px = tube([hip, kn, ank], "Ppppq", { rowPat: (j, n) => j === n - 1 ? "qqqqQ" : null });
    F.draw(px, { grp: far ? "legF" : "pants", rim: "Q", far });
    const S = SHOE[shoe || "flat"];
    F.draw(spr(S.rows, Math.round(ank[0]) + S.ox, Math.round(ank[1]) + S.oy), { grp: far ? "shoeF" : "shoe", rim: "o", far });
  }
  function arm(F, sh, el, wr, hand, far, tx = 0) {
    sh = [sh[0] + tx, sh[1]]; el = [el[0] + tx, el[1]]; wr = [wr[0] + tx, wr[1]];
    /* lengan baju pendek: dari bahu ke 70% lengan atas, lalu lengan bawah kulit */
    const mx = sh[0] + (el[0] - sh[0]) * .7, my = sh[1] + (el[1] - sh[1]) * .7;
    const g = far ? "armF" : "arm";
    F.draw(tube([[mx, my], el, wr], "asd"), { grp: g + "s", rim: "e", far });
    F.draw(tube([sh, [mx, my]], "Tttuu", { capTop: 1, rowPat: (j, n) => j === n - 1 ? "uuuuv" : null }), { grp: g, rim: "v", far });
    const H = HAND[hand || "open"];
    F.draw(spr(H.rows, Math.round(wr[0]) + H.ox, Math.round(wr[1]) + H.oy), { grp: g + "h", rim: "e", far });
  }
  function head(F, x, y, P) {
    const px = [...spr(HEAD, x, y), ...TUFT[P.tuft || 0].map(([a, b, ch]) => [x + a, y + b, ch]), ...CAPDET.map(([a, b, ch]) => [x + a, y + b, ch])];
    const F2 = P.face || {}, E = EYE[F2.eyes || "open"], [ox, oy] = F2.off || [0, 0], fx = x + ox, fy = y + oy;
    const B = BROW[F2.brow || "norm"];
    if (B) { for (const [bx, by] of B.sk) px.push([fx + bx, fy + by, "s"]); }
    px.push(...spr(E.n, fx + 9, fy + 13 + (E.dy || 0)), ...spr(E.f, fx + 16, fy + 13 + (E.dy || 0)));
    if (E.lash) px.push([fx + 8, fy + 13, "N"]);
    if (B) for (const [bx, by] of B.px) px.push([fx + bx, fy + by, "j"]);
    px.push([fx + 15, fy + 17, "d"]); /* hidung: satu piksel bayangan di dalam wajah */
    if (F2.flush) px.push([fx + 8, fy + 18, "b"], [fx + 9, fy + 18, "b"], [fx + 10, fy + 18, "b"], [fx + 17, fy + 18, "b"], [fx + 18, fy + 18, "b"], [fx + 9, fy + 17, "b"]);
    else px.push([fx + 8, fy + 18, "b"], [fx + 9, fy + 18, "b"], [fx + 18, fy + 18, "b"]);
    for (const [mx, my, ch] of MOUTH[F2.mouth || "smile"]) px.push([fx + mx, fy + my, ch]);
    F.draw(px, { grp: "head", rim: "o", rimSkip: (X, Y, dx, dy) => dy !== 1 });
  }

  /* ======================= RENDER ======================= */
  function render(g, P) {
    const F = Fig(g.W, g.H), J = P.jump || 0, B = P.by || 0, TX = P.tx || 0;
    /* bayangan tanah: elips padat 3 baris, tanpa alfa */
    const sw = P.shadow ?? 13, SH = "#a5714f";
    for (let y = 61; y <= 63; y++) { const hw = y === 62 ? sw : y === 61 ? sw - 2 : sw - 4; for (let x = 32 - hw; x <= 32 + hw; x++) g.set(x, y, SH) }
    const A = P.arms;
    arm(F, A.f.sh, A.f.el, A.f.wr, A.f.hand, 1, TX);
    leg(F, [34, 45 + B + J], P.legs.f.a, P.legs.f.s, 1);
    F.draw(spr(HIP, 24, 42 + B + J), { grp: "pants" });
    leg(F, [28, 45 + B + J], P.legs.n.a, P.legs.n.s, 0);
    const tox = 23 + TX, toy = 28 + B + J - (P.breath || 0);
    F.draw(spr(TORSO, tox, toy), { grp: "torso", rim: "v", rimSkip: (X, Y, dx, dy) => dy !== 1 });
    F.draw(STAR.map(([a, b, ch]) => [tox + a, toy + b, ch]), { grp: "torso" });
    if (!P.armLate) arm(F, A.n.sh, A.n.el, A.n.wr, A.n.hand, 0, TX);
    head(F, 20 + (P.hx || 0) + TX, 6 + (P.hy || 0) + J, P);
    if (P.armLate) arm(F, A.n.sh, A.n.el, A.n.wr, A.n.hand, 0, TX);
    /* tempel ke grid + garis tepi luar selektif */
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

  const idle = {
    fps: 8, frames: 8, draw(g, f, o) {
      const br = [0, 0, 1, 1, 1, 1, 0, 0][f], hb = [0, 0, 0, 1, 1, 1, 1, 0][f]; /* kepala tertinggal 1 frame dari dada */
      render(g, { breath: br, hy: -hb, arms: armsAt(-br), legs: standLegs(), tuft: [0, 0, 0, 0, 1, 1, 1, 0][f],
        face: { eyes: f === 6 ? "blink" : "open", mouth: "smile" } });
    }
  };

  /* nod: angguk 2x (turun cepat, naik pelan), wajah ikut menunduk 1 px, senyum; mata terpejam senang di titik terendah */
  const nod = {
    fps: 8, frames: 6, draw(g, f, o) {
      const hy = [0, 2, 1, 0, 2, 1][f], fy = [0, 1, 0, 0, 1, 0][f], br = [0, 0, 1, 0, 0, 1][f];
      render(g, { breath: br, hy, arms: armsAt(-br), legs: standLegs(), tuft: [1, 0, 0, 1, 0, 0][f],
        face: { eyes: hy === 2 ? "happy" : "open", mouth: "smile", off: [0, fy] } });
    }
  };

  /* shake: geleng 2x. kepala + wajah bergeser kiri/kanan, jambul tertinggal berlawanan, mulut datar ragu */
  const shake = {
    fps: 8, frames: 6, draw(g, f, o) {
      const hx = [0, -1, 1, 0, -1, 1][f], ox = [0, -1, 1, 0, -1, 1][f];
      render(g, { hx, arms: armsAt(0), legs: standLegs(), tuft: hx < 0 ? 2 : hx > 0 ? 1 : 0,
        face: { eyes: "flat", brow: "worry", mouth: f % 3 === 0 ? "flat" : "wavy", off: [ox, 0] } });
    }
  };

  /* surprised: tersentak lompat kecil, tangan terangkat terbuka, mata bulat, mulut O, tanda seru muncul */
  const SP = [
    { j: -2, b: 0, hy: 1, up: .8, sh: 10, ex: 1 },
    { j: -3, b: 0, hy: 0, up: 1, sh: 9, ex: 2 },
    { j: -1, b: 0, hy: -1, up: 1, sh: 11, ex: 2 },
    { j: 0, b: 1, hy: 0, up: .8, sh: 13, ex: 2 },
    { j: 0, b: 0, hy: 0, up: .7, sh: 13, ex: 2 },
    { j: 0, b: 0, hy: 0, up: .6, sh: 13, ex: 3 }
  ];
  const surprised = {
    fps: 10, frames: 6, draw(g, f, o) {
      const k = SP[f], u = k.up, L = (a, c) => a + (c - a) * u, b = k.b + k.j, air = k.j < 0;
      const legs = { n: { a: [27, 57 + k.j - (air ? 1 : 0)], s: air ? "toe" : "flat" }, f: { a: [36, 56 + k.j - (air ? 1 : 0)], s: air ? "toe" : "flat" } };
      render(g, {
        by: k.b, jump: k.j, hy: k.hy, legs, shadow: k.sh, tuft: air ? 1 : 0,
        arms: {
          n: { sh: [25, 31 + b], el: [L(24, 21), L(36, 35) + b], wr: [L(24, 21), L(40, 30) + b], hand: "open" },
          f: { sh: [38, 31 + b], el: [L(39, 42), L(36, 35) + b], wr: [L(40, 43), L(40, 30) + b], hand: "open" }
        },
        face: { eyes: "wide", brow: "high", mouth: "O" },
        fx(g) { exclaim(g, 48, Math.max(0, 2 + k.j) + (k.ex === 1 ? 2 : 0), k.ex) }
      });
    }
  };
  /* tanda seru: 1 = muncul kecil, 2 = penuh, 3 = penuh miring sedikit (goyang) */
  function exclaim(g, x, y, s) {
    const C = { N: NV, Y: "#ffd23f", D: "#e09a2a", W: "#fffaf0" };
    const R = s === 1 ? [" NN ", "NWYN", "NYDN", " NN ", "NYDN", " NN "]
      : s === 3 ? ["  NNN", " NWYN", " NYYN", " NYDN", "NYDN ", "NYDN ", " NN  ", "     ", "NYDN ", " NN  "]
        : [" NNN", "NWYN", "NYYN", "NYDN", "NYDN", "NYDN", " NN ", "    ", "NYDN", " NN "];
    R.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, C[ch]) }));
    if (s === 2) { /* garis kejut kecil di kiri-kanan */
      g.set(x - 2, y + 1, C.Y).set(x - 3, y, C.Y).set(x + 6, y + 1, C.Y).set(x + 7, y, C.Y);
    }
  }

  /* sad: kepala tertunduk, bahu turun, tangan lunglai; menghela napas (dada naik lalu turun + embusan) */
  const sad = {
    fps: 6, frames: 8, draw(g, f, o) {
      const br = [0, 0, 1, 1, 0, -1, -1, 0][f], hb = [0, 0, 0, 1, 1, 0, 0, 0][f];
      render(g, {
        by: 1, breath: br, hy: 2 - hb + (br < 0 ? 1 : 0), hx: 1, legs: standLegs(), tuft: 0,
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

  /* happy: jongkok antisipasi -> lompat (lutut ditekuk di puncak) -> mendarat squash */
  const HP = [
    { j: 0, b: 2, hy: 1, up: 0, legs: { n: [27, 57, "flat"], f: [36, 56, "flat"] }, sh: 13 },
    { j: -2, b: 0, hy: 0, up: .7, legs: { n: [27, 56, "toe"], f: [36, 55, "toe"] }, sh: 10 },
    { j: -4, b: 0, hy: -1, up: 1, legs: { n: [25, 53, "toe"], f: [34, 52, "toe"] }, sh: 8 },
    { j: -2, b: 0, hy: 0, up: 1, legs: { n: [27, 55, "toe"], f: [36, 54, "toe"] }, sh: 10 },
    { j: 0, b: 1, hy: 1, up: .8, legs: { n: [27, 57, "flat"], f: [36, 56, "flat"] }, sh: 13 },
    { j: 0, b: 0, hy: 0, up: .4, legs: { n: [27, 57, "flat"], f: [36, 56, "flat"] }, sh: 13 }
  ];
  const happy = {
    fps: 8, frames: 6, draw(g, f, o) {
      const k = HP[f], u = k.up, L = (a, c) => a + (c - a) * u, b = k.b + k.j;
      const legs = { n: { a: [k.legs.n[0], k.legs.n[1] + k.j], s: k.legs.n[2] }, f: { a: [k.legs.f[0], k.legs.f[1] + k.j], s: k.legs.f[2] } };
      render(g, {
        by: k.b, jump: k.j, hy: k.hy, legs, shadow: k.sh, tuft: k.j < 0 ? 1 : 0,
        arms: {
          n: { sh: [25, 31 + b], el: [L(23, 20), L(36, 27) + b], wr: [L(22, 19), L(40, 20) + b], hand: "fist" },
          f: { sh: [38, 31 + b], el: [L(40, 42), L(36, 28) + b], wr: [L(41, 43), L(40, 21) + b], hand: "fist" }
        },
        face: { eyes: "happy", mouth: "grin" },
        fx(g) {
          /* dua bintang di posisi tetap, hanya ukurannya berdenyut */
          const s1 = [1, 2, 3, 2, 1, 2][f], s2 = [3, 2, 1, 2, 3, 2][f];
          star(g, 9, 14, s1); star(g, 53, 10, s2);
        }
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

  /* thinking: siku di samping torso, tangan di dagu, mata ke atas, alis berpikir, titik gelembung bergantian */
  const thinking = {
    fps: 6, frames: 6, draw(g, f, o) {
      const br = [0, 0, 1, 1, 1, 0][f], hb = [0, 0, 0, 1, 1, 1][f];
      render(g, {
        breath: br, hy: -hb, legs: standLegs(), armLate: 1, tuft: hb,
        arms: { n: { sh: [25, 31 - br], el: [26, 39], wr: [33, 31 - hb], hand: "chin" }, f: { sh: [38, 31 - br], el: [39, 36 - br], wr: [38, 40 - br], hand: "open" } },
        face: { eyes: "up", brow: "think", mouth: "hmm" },
        fx(g) { const on = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1], [0, 0, 1]][f]; if (on[0]) dot(g, 47, 12, 0); if (on[1]) dot(g, 52, 7, 0); if (on[2]) dot(g, 57, 1, 1) }
      });
    }
  };
  function dot(g, x, y, big) {
    const Wt = "#fffaf0", S = "#d6cdee", r = big ? ["  oo  ", " oWWo ", "oWWWSo", "oWWSSo", " oSSo ", "  oo  "] : [" oo ", "oWWo", "oWSo", " oo "];
    r.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, ch === "o" ? NV : ch === "W" ? Wt : S) }));
  }

  SIMPX.char("teman", {
    w: 64, h: 64, shirtRamp: SHIRT,
    anims: { idle, nod, shake, surprised, sad, happy, thinking }
  });
})();
