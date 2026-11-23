/* Tokoh "ibu" pixel art 64x64 (preview, tools/_simpx). Teknik sama dengan hero.js:
   - Kepala+hijab (termasuk kain yang menjuntai ke dada), wajah, tunik, rok, tangan, sepatu = PETA PIKSEL TANGAN.
   - Lengan = tabung berpita tetap (pola kolom tangan) dari titik sendi.
   - Garis tepi luar 1 px: kiri/atas = versi gelap warna bidang, kanan/bawah = navy.
   - Bagian jauh memakai palet satu tingkat lebih gelap.
   Proporsi: 2 px lebih pendek dari hero, badan lebih berisi (tunik 22 px), rok panjang sampai mata kaki. */
(() => {
  const NV = "#1b1740";
  const PAL = {
    /* kulit sawo */ A: "#f0c296", a: "#e2ac7e", s: "#d39a6c", d: "#b17656", e: "#86505a", k: "#5a3042", b: "#e5826c",
    /* hijab koral */ G: "#ffc79a", F: "#ffa077", Z: "#f07a5a", z: "#c9545c", y: "#8f3b5e",
    /* tunik lavender */ T: "#a88ef0", t: "#7b5cd6", u: "#5a40b0", v: "#3e2b86",
    /* rok gelap */ P: "#5a5a94", p: "#3d3d6b", q: "#2f2e5a", Q: "#222047",
    /* sepatu flat */ W: "#c98a86", Y: "#a5646f", X: "#7b4660", r: "#5b3654", R: "#3d2748",
    /* mata, mulut */ N: NV, V: "#3d2c7a", I: "#7b62c4", L: "#ab95ea", m: "#7c3445", o: NV, w: "#fffaf0", c: "#e8735a",
    /* bros emas */ J: "#ffd23f", K: "#d68a2e"
  };
  const FAR = { A: "a", a: "s", s: "d", d: "e", e: "e", k: "k", b: "d", G: "F", F: "Z", Z: "z", z: "y", y: "y", T: "t", t: "u", u: "v", v: "v", P: "p", p: "q", q: "Q", Q: "Q", W: "Y", Y: "X", X: "X", r: "R", R: "R" };
  const MAT = {}; const mats = { skin: "AasdekbmNVILwc", hijab: "GFZzyJK", tunic: "Ttuv", skirt: "PpqQ", shoe: "WYXrR" };
  for (const [k, s] of Object.entries(mats)) for (const ch of s) MAT[ch] = k;
  const LITO = { skin: "#6e3b46", hijab: "#7e2a4e", tunic: "#33246f", skirt: NV, shoe: "#4a2c4c" };

  const map = (rows) => rows.map(r => r ? " ".repeat(r[0]) + r[1] : "");

  /* ======================= PETA TANGAN ======================= */
  /* kepala berhijab (25 x 22), hadap 3/4 kanan. koordinat "wajah" (kolom 0 = x kepala + 2).
     kubah: sorotan kiri atas (G/F), lipatan vertikal z di belakang kepala, tepi depan hijab berupa pita
     terang yang membingkai dahi, pipi jauh dibatasi pita tipis berbayang. '.' = transparan. */
  const HEAD = [
    [9, "FGGFZZz"],
    [6, "FGGGGGFZZZzz"],
    [4, "FGGGGGGFFZZZZZzz"],
    [3, "FGGGGGFFFZZZZZZZzz"],
    [2, "FGGGGFFFZZZZZZZZZZzz"],
    [1, "FGGGFFFZZZZZZZZZZZZzz"],
    [1, "FGGFFZZZZZZZZZZZZZZzzy"],
    [1, "FFZZZZZZFFFFFFFFFFFZzy"],
    [1, "FZZZZZZFGGGGGGGGGGGFzy"],
    [0, "FFZZZZZzFdddddddddddFzy"],
    [0, "FFZZZZzFdaAAasssssssdzy"],
    [0, "FFZZZZzFsaAassssssssdzy"],
    [0, "FFZZZZzFsassssssssssdzy"],
    [0, "FFZZZZzFssssssssssssdzy"],
    [0, "FFZZZZzFssssssssssssdzy"],
    [0, "FFZzZZzFssssssssssssdzy"],
    [0, "FFZzZZzFsssssssssssddzy"],
    [0, "FFZzZZzzFssssssssssddzy"],
    [0, "FFZzZZzzFsssssssssddZzy"],
    [1, "ZZzZZzzzFdsssssssddZzy"],
    [1, "zZzZZzzzzFddssssddFZzy"],
    [2, "yzZzZzzzzFddddddFZzy"]
  ];
  /* kain hijab yang menjuntai menutup bahu dan dada (khimar), koordinat sama dengan HEAD.
     baris 19-21 = pengisi di balik dagu supaya tidak bolong saat kepala bergerak. J/K = bros emas kecil. */
  const DRAPE = [
    [1, "ZZZZZZZZZZZZZZZZZZZZZ"],
    [1, "ZZZZZZZZZZZZZZZZZZZZZ"],
    [1, "ZZZZZZZZZZZZZZZZZZZZZ"],
    [1, "FFZZZZZZZzyyyyyyzZZzzy"],
    [0, "FGFZZZZZZZZzyyyyzZZZzzy"],
    [-1, "FGGFZZZZZZzZZZzzzZZZZzzy"],
    [-1, "FGFFZZZZZZzZZZZZZZZZZZzzy"],
    [-2, "FGFFZZZZZZZzZZZZZZZZZZzzzy"],
    [-2, "FFFZZZZZZZzZZZZZZZZZZZzzzy"],
    [-2, "FFZZZZZZZzZZZZZZZZZZZZzzzy"],
    [-2, "FZZZZZZZzZZZZZZZZZZZZzzzzy"],
    [-1, "zZZZZZzZZZZZZZZZZZZZzzzy"],
    [0, "yzzZzzZZZZZZZZZZZzzzzy"],
    [3, "yyzzzzzzzzzzzzzy"]
  ];
  const BROOCH = [[17, 23, "J"], [18, 23, "K"], [16, 24, "J"], [17, 24, "w"], [18, 24, "J"], [19, 24, "K"], [17, 25, "K"], [18, 25, "K"]];
  /* mata dekat 4x5 & mata jauh 3x5 (sama dengan hero: anak mewarisi mata ibunya) */
  const EYE = {
    open: { n: ["NNNN", "NwNN", "NwVN", "NIIN", " LL "], f: ["NNN", "wNN", "wVN", "IIN", "LL "] },
    up: { n: ["NNNN", "NIVN", "NLIN", "NwwN", " NN "], f: ["NNN", "IVN", "LIN", "wwN", "NN "] },
    blink: { n: ["    ", "    ", "N  N", " NN ", "    "], f: ["   ", "   ", "N  ", " NN", "   "] },
    happy: { n: ["    ", " NN ", "N  N", "N  N", "    "], f: ["   ", " NN", "N  ", "N  ", "   "] },
    wide: { n: [" NN ", "NwwN", "NwVN", "NwwN", " NN "], f: ["NN ", "wwN", "wVN", "wwN", "NN "] },
    sad: { n: ["    ", "    ", "NNNN", "NIIN", " LL "], f: ["   ", "   ", "NNN", "IIN", "LL "] },
    down: { n: ["    ", "    ", "NNNN", " NN ", "    "], f: ["   ", "   ", "NNN", " NN", "   "] }
  };
  /* alis (relatif sudut kiri atas mata dekat): [dx, dy] */
  const BROW = {
    calm: [[0, -1], [1, -2], [2, -2], [7, -2], [8, -2]],
    sad: [[0, -1], [1, -2], [2, -3], [7, -3], [8, -2]],
    up: [[0, -3], [1, -3], [2, -3], [7, -3], [8, -3]],
    think: [[0, -1], [1, -2], [2, -2], [7, -3], [8, -3]]
  };
  /* mulut relatif titik (12,17) di kepala */
  const MOUTH = {
    smile: [[0, 0, "m"], [1, 1, "m"], [2, 1, "m"], [3, 0, "m"]],
    grin: [[0, 0, "m"], [1, 0, "m"], [2, 0, "m"], [3, 0, "m"], [4, 0, "m"], [0, 1, "m"], [1, 1, "w"], [2, 1, "w"], [3, 1, "c"], [4, 1, "m"], [1, 2, "m"], [2, 2, "c"], [3, 2, "m"]],
    hmm: [[0, 1, "m"], [1, 1, "m"], [2, 0, "m"], [3, 0, "m"]],
    flat: [[1, 1, "m"], [2, 1, "m"], [3, 1, "m"]],
    frown: [[0, 1, "m"], [1, 0, "m"], [2, 0, "m"], [3, 1, "m"]],
    o: [[1, 0, "m"], [2, 0, "m"], [0, 1, "m"], [1, 1, "c"], [2, 1, "c"], [3, 1, "m"], [1, 2, "m"], [2, 2, "m"]]
  };
  /* tunik (22 x 22): bahu sempit, perut berisi, lipatan kain, sulaman koral di dekat kelim */
  const TORSO = map([
    [4, "ttttttttttttttu"],
    [2, "Tttttttttttttttuuu"],
    [1, "TTttttttttttttttuuuv"],
    [1, "TTttttttttttttttuuuv"],
    [1, "TTttttttttttttttuuuv"],
    [1, "TTtttttttttttttuuuuv"],
    [1, "TTtttttttttttttuuuuv"],
    [1, "TTtttttttttttttuuuuv"],
    [1, "TTttttttutttttuuuuuv"],
    [0, "TTTttttttuttttttuuuuuv"],
    [0, "TTTttttttuttttttuuuuuv"],
    [0, "TTTtttttttutttttuuuuuv"],
    [0, "TTTtttttttutttttuuuuuv"],
    [0, "TTTttttttttutttttuuuuv"],
    [0, "TTttttttttutttttuuuuuv"],
    [0, "TTtttttttuttttttuuuuuv"],
    [0, "TTtttttttuttttttuuuuuv"],
    [0, "TTttttttutttttttuuuuuv"],
    [0, "TZtttZtttZtttZtttzuuzv"],
    [0, "TTtttttttttttttttuuuuv"],
    [0, "TuuuuuuuuuuuuuuuuuuuvQ".replace("Q", "v")]
  ]);
  /* rok panjang (20 x 10), bagian atasnya tertutup tunik */
  const SKIRT = map([
    [1, "Pppppppppppppqqqqq"],
    [1, "Pppppppppppppqqqqq"],
    [1, "Pppppppppppppqqqqq"],
    [1, "Ppppppqpppppppqqqq"],
    [1, "Ppppppqpppppppqqqq"],
    [1, "PPpppppqppppppqqqQ"],
    [0, "PPpppppqpppppppqqqqQ"],
    [0, "Pppppppqppppppqpqqqq"],
    [0, "ppppppqppppppppqqqqQ"],
    [0, "qqqqqqqqqqqqqqqqqQQQ"]
  ]);
  /* tangan: jangkar = pergelangan (ox, oy). chin & up: jari mengarah ke atas */
  const HAND = {
    open: { ox: -1, oy: 1, rows: [" as ", "aass", "asdd", " dd "] },
    fist: { ox: -1, oy: 1, rows: [" aa ", "aAas", "asdd", " dd "] },
    chin: { ox: -1, oy: -4, rows: ["  a ", "  as", " aAs", "aAsd", "asdd", " dd "] },
    up: { ox: -1, oy: -4, rows: ["a a ", "aAa ", "aAAs", "aAsd", "asd ", " d  "] }
  };
  /* sepatu flat: tumit kiri, ujung bulat kanan */
  const SHOE = { ox: -3, oy: 2, rows: ["YWWWWWY ", "YYYYYYWY", "rrrrrrrR"] };

  /* ======================= KOMPOSISI (sama dengan hero) ======================= */
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

  /* ======================= BAGIAN ======================= */
  function arm(F, sh, el, wr, hand, far) {
    /* lengan panjang gamis: lengan atas lebar, lengan bawah 4 px, manset gelap di ujung pergelangan */
    const g = far ? "armF" : "arm", upw = wr[1] < el[1];
    F.draw(tube([el, wr], "Ttuu", { rowPat: (j, n) => (upw ? j === 0 : j === n - 1) ? "uvvv" : null }), { grp: g + "l", rim: "v", far });
    F.draw(tube([sh, el], "Tttuu", { capTop: 1 }), { grp: g, rim: "v", far });
    const H = HAND[hand || "open"];
    F.draw(spr(H.rows, Math.round(wr[0]) + H.ox, Math.round(wr[1]) + H.oy), { grp: g + "h", rim: "e", far });
  }
  /* koordinat wajah: kolom c -> x + 2 + c */
  const rowsPx = (R, x, y, j0 = 0) => { const px = []; R.forEach(([s, str], j) => [...str].forEach((ch, i) => { if (ch !== ".") px.push([x + 2 + s + i, y + j0 + j, ch]) })); return px };
  function drape(F, x, y) {
    F.draw([...rowsPx(DRAPE, x, y, 19), ...BROOCH.map(([c, r, ch]) => [x + 2 + c, y + r, ch])], { grp: "drape", rim: "y", rimSkip: (X, Y, dx, dy) => dy !== 1 });
  }
  function head(F, x, y, P) {
    const all = rowsPx(HEAD, x, y), hij = all.filter(p => MAT[p[2]] === "hijab"), skin = all.filter(p => MAT[p[2]] !== "hijab");
    F.draw(hij, { grp: "head" });
    const C = P.face || {}, fx = C.fx || 0, fy = C.fy || 0, E = EYE[C.eyes || "open"], X = x + 2 + fx, Y = y + fy;
    const ex = X + 9, ey = Y + 12, px = skin.slice();
    for (const [dx, dy] of BROW[C.brow || "calm"]) px.push([ex + dx, ey + dy, "k"]);
    px.push(...spr(E.n, ex, ey + (E.dy || 0)), ...spr(E.f, ex + 7, ey + (E.dy || 0)));
    if (!C.eyes || C.eyes === "open" || C.eyes === "up") px.push([ex - 1, ey, "N"]);
    px.push([X + 15, Y + 16, "d"]);
    if (C.flush) px.push([X + 9, Y + 17, "b"], [X + 10, Y + 17, "b"], [X + 11, Y + 17, "b"], [X + 18, Y + 17, "b"], [X + 19, Y + 17, "b"]);
    else px.push([X + 9, Y + 17, "b"], [X + 10, Y + 17, "b"], [X + 18, Y + 17, "b"]);
    /* garis senyum keibuan: lekuk tipis di atas kedua sudut mulut */
    if (C.lines !== 0) px.push([X + 11, Y + 19, "d"], [X + 16, Y + 19, "d"]);
    for (const [dx, dy, ch] of MOUTH[C.mouth || "smile"]) px.push([X + 12 + dx, Y + 18 + dy, ch]);
    /* fitur wajah tidak boleh keluar dari bukaan hijab */
    const open = new Set(skin.map(([a, b]) => b * 64 + a));
    F.draw(px.filter(([a, b]) => open.has(b * 64 + a)), { grp: "face", rim: "y", rimSkip: (X2, Y2, dx, dy) => dy !== 1 });
  }

  /* ======================= RENDER ======================= */
  function render(g, P) {
    const F = Fig(g.W, g.H), J = P.jump || 0, B = P.by || 0;
    const sw = P.shadow ?? 12, SH = "#a5714f";
    for (let y = 61; y <= 63; y++) { const hw = y === 62 ? sw : y === 61 ? sw - 2 : sw - 4; for (let x = 32 - hw; x <= 32 + hw; x++) g.set(x, y, SH) }
    const A = P.arms;
    arm(F, A.f.sh, A.f.el, A.f.wr, A.f.hand, 1);
    const fs = P.feet || { n: [27, 57], f: [35, 56] };
    F.draw(spr(SHOE.rows, fs.f[0] + SHOE.ox, fs.f[1] + SHOE.oy + J), { grp: "shoeF", rim: "o", far: 1 });
    F.draw(spr(SHOE.rows, fs.n[0] + SHOE.ox, fs.n[1] + SHOE.oy + J), { grp: "shoe", rim: "o" });
    F.draw(spr(SKIRT, 22, 49 + J), { grp: "skirt", rim: "Q", rimSkip: (X, Y, dx, dy) => dy !== 1 });
    F.draw(spr(TORSO, 21, 30 + B + J - (P.breath || 0)), { grp: "torso", rim: "v", rimSkip: (X, Y, dx, dy) => dy !== 1 });
    if (!P.armLate) arm(F, A.n.sh, A.n.el, A.n.wr, A.n.hand, 0);
    drape(F, 18, 8 + B + J - (P.breath || 0));
    head(F, 18 + (P.hx || 0), 8 + (P.hy || 0) + J, P);
    if (P.armLate) arm(F, A.n.sh, A.n.el, A.n.wr, A.n.hand, 0);
    if (P.farLate) arm(F, A.f.sh, A.f.el, A.f.wr, A.f.hand, 1);
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
    n: { sh: [23, 34 + dy], el: [21 - sw * .4, 40 + dy], wr: [21 - sw, 45 + dy - Math.abs(sw) * .2], hand },
    f: { sh: [40, 34 + dy], el: [42 + sw * .4, 40 + dy], wr: [42 + sw, 45 + dy - Math.abs(sw) * .2], hand }
  });

  const idle = {
    fps: 8, frames: 8, draw(g, f) {
      const br = [0, 0, 1, 1, 1, 1, 0, 0][f], hb = [0, 0, 0, 1, 1, 1, 1, 0][f];
      render(g, { breath: br, hy: -hb, arms: armsAt(-br), face: { eyes: f === 6 ? "blink" : "open", mouth: "smile" } });
    }
  };
  /* angguk 2x: turun cepat, naik pelan; wajah ikut turun di dalam bukaan hijab, mata menyipit senang */
  const nod = {
    fps: 8, frames: 6, draw(g, f) {
      const hy = [0, 2, 1, 0, 2, 1][f], fy = [0, 1, 0, 0, 1, 0][f];
      render(g, { hy, by: 0, arms: armsAt(0), face: { eyes: fy ? "happy" : f % 3 === 2 ? "down" : "open", mouth: "smile", fy } });
    }
  };
  /* geleng: kepala dan wajah bergeser kiri-kanan, mulut datar, alis sedih lembut */
  const shake = {
    fps: 8, frames: 6, draw(g, f) {
      const hx = [0, -1, -1, 0, 1, 1][f], fx = [0, -1, -1, 0, 1, 1][f];
      render(g, { hx, arms: armsAt(0), face: { eyes: "open", mouth: "flat", brow: "sad", fx, lines: 0 } });
    }
  };
  /* kaget ("astaga!"): badan tersentak naik, kedua telapak terangkat di samping kepala, "!" di atas kepala */
  const SU = [
    { j: -1, hy: 0, u: .6, s: 1 }, { j: -2, hy: -1, u: 1, s: 2 }, { j: -1, hy: -1, u: 1, s: 2 },
    { j: 0, hy: 0, u: 1, s: 2 }, { j: 0, hy: 0, u: .9, s: 2 }, { j: 0, hy: 0, u: .9, s: 1 }
  ];
  const surprised = {
    fps: 10, frames: 6, draw(g, f) {
      const k = SU[f], j = k.j, L = (a, c) => a + (c - a) * k.u;
      render(g, {
        jump: j, hy: k.hy, armLate: 1, farLate: 1, shadow: j ? 10 : 12,
        arms: { n: { sh: [22, 38 + j], el: [L(21, 18), L(43, 37) + j], wr: [L(23, 19), L(46, 31) + j], hand: k.u > .8 ? "up" : "open" },
          f: { sh: [42, 38 + j], el: [L(43, 46), L(43, 37) + j], wr: [L(41, 45), L(46, 31) + j], hand: k.u > .8 ? "up" : "open" } },
        face: { eyes: "wide", mouth: "o", brow: "up", lines: 0 },
        fx(g) { bang(g, 50, 1 + j, k.s) }
      });
    }
  };
  /* sedih: kepala menunduk, bahu turun, napas panjang, setetes air mata */
  const sad = {
    fps: 6, frames: 8, draw(g, f) {
      const br = [0, 0, 1, 1, 1, 0, 0, 0][f], hb = [0, 0, 0, 1, 1, 1, 0, 0][f];
      render(g, {
        by: 1, breath: br, hy: 2 - hb, arms: { n: { sh: [24, 35 - br], el: [24, 41 - br], wr: [26, 46 - br], hand: "open" }, f: { sh: [39, 35 - br], el: [40, 41 - br], wr: [38, 46 - br], hand: "open" } },
        face: { eyes: "sad", mouth: "frown", brow: "sad", lines: 0 },
        fx(g) { if (f >= 2 && f <= 6) tear(g, 37, 22 + (f - 2), f) }
      });
    }
  };
  /* senang: memantul kecil, tangan bertaut di dada, hati koral berdenyut */
  const happy = {
    fps: 8, frames: 6, draw(g, f) {
      const j = [0, -1, -2, -1, 0, 0][f], b = [1, 0, 0, 0, 1, 0][f];
      render(g, {
        jump: j, by: b, hy: b, armLate: 1, farLate: 1, shadow: [12, 11, 10, 11, 12, 12][f],
        arms: { n: { sh: [24, 34 + j + b], el: [23, 41 + j + b], wr: [30, 38 + j + b], hand: "fist" }, f: { sh: [39, 34 + j + b], el: [41, 41 + j + b], wr: [33, 38 + j + b], hand: "fist" } },
        face: { eyes: "happy", mouth: "grin" },
        fx(g) { heart(g, 8, 14, [1, 2, 2, 1, 1, 2][f]); heart(g, 50, 8, [2, 1, 1, 2, 2, 1][f]) }
      });
    }
  };
  /* berpikir: tangan dekat di dagu, tangan jauh menyangga siku, mata ke atas, titik pikiran */
  const thinking = {
    fps: 6, frames: 6, draw(g, f) {
      const br = [0, 0, 1, 1, 1, 0][f], hb = [0, 0, 0, 1, 1, 1][f];
      render(g, {
        breath: br, hy: -hb, armLate: 1,
        arms: { n: { sh: [23, 37 - br], el: [26, 42 - br], wr: [33, 32 - hb], hand: "chin" }, f: { sh: [39, 34 - br], el: [41, 40 - br], wr: [40, 45 - br], hand: "open" } },
        face: { eyes: "up", mouth: "hmm", brow: "think", lines: 0 },
        fx(g) { const on = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1], [0, 0, 1]][f]; if (on[0]) dot(g, 45, 10, 0); if (on[1]) dot(g, 50, 6, 0); if (on[2]) dot(g, 55, 1, 1) }
      });
    }
  };

  /* ======================= EFEK ======================= */
  const Wt = "#fffaf0";
  function dot(g, x, y, big) {
    const S = "#d6cdee", r = big ? ["  oo  ", " oWWo ", "oWWWSo", "oWWSSo", " oSSo ", "  oo  "] : [" oo ", "oWWo", "oWSo", " oo "];
    r.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, ch === "o" ? NV : ch === "W" ? Wt : S) }));
  }
  /* tanda seru kuning bertepi navy; s = 1 kecil, 2 besar */
  function bang(g, x, y, s) {
    const C = { o: NV, Y: "#ffd23f", D: "#e09a2a", W: Wt };
    const r = s > 1 ? [" ooo ", "oWYYo", "oYYDo", "oYYDo", "oYYDo", " oYo ", " oDo ", "  o  ", " ooo ", "oYYDo", " ooo "]
      : ["     ", " ooo ", " oWo ", " oYo ", " oYo ", " oDo ", "  o  ", "     ", " ooo ", " oDo ", " ooo "];
    r.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, C[ch]) }));
  }
  function heart(g, x, y, s) {
    const C = { o: NV, Z: "#f07a5a", z: "#c9545c", G: "#ffc79a" };
    const r = s > 1 ? [" oo oo ", "oGZoZZo", "oZZZZzo", " oZZzo ", "  ozo  ", "   o   "] : ["       ", " o o   ", "oGoZo  ", " oZo   ", "  o    ", "       "];
    r.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== " ") g.set(x + i - (s > 1 ? 0 : -1), y + j, C[ch]) }));
  }
  function tear(g, x, y, f) {
    const B = "#7fb8ec", L = "#d8ecfb";
    g.set(x, y, L).set(x, y + 1, B).set(x - 1, y + 1, B).set(x + 1, y + 1, B).set(x, y + 2, B);
  }

  SIMPX.char("ibu", { w: 64, h: 64, anims: { idle, nod, shake, surprised, sad, happy, thinking } });
})();
