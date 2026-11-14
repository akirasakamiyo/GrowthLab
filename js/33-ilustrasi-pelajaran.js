/* Ilustrasi pixel 90x30 untuk kartu pelajaran (2026-11-14), kunci "les<bab>-<pelajaran>". Dipakai oleh PXA() di js/09-app.js. */

/* ===== Bab 1 ===== */
/* ===== Kartu pelajaran Bab 1 (Self-Management), grid 90x30 ===== */
(() => {
  const { C, E } = GLPIX;
  const { K, W, Y, YD, T, TD, V, VD, WD, SK, SKD, HB, PK, G, N } = C;
  const RED = "#ff3b5c", REDD = "#c81e44", BL = "#8fd3ff", BLD = "#4fa8e0", LF = "#3ecf6e", LFD = "#22994c";
  const pop = (u, a, b, c2, d) => { const s = E.back(E.seg(u, a, b)) * (1 - E.io(E.seg(u, c2, d))); return { s: Math.max(s, .001), o: s > .02 ? 1 : 0 } };
  const sparkle = (col, s = 1) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, s) });
  /* lingkaran bertinta dengan bayangan cel dan sorotan */
  const disc = (p, x, y, r, col, cd) => { p.circ(x, y, r, col, K); p.shade({ [col]: cd }, [x - r, y - r, 2 * r + 1, 2 * r + 1], 1); p.set(x - r + 2, y - r + 3, W).set(x - r + 3, y - r + 2, W) };
  /* titik-titik putus antara dua titik */
  const dots = (p, x0, y0, x1, y1, col, gap = 3) => { const n = Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / gap); for (let k = 0; k <= n; k++) p.set(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, col) };

  /* ---------- 0-0 Recognise Your Strengths: perisai berbintang + S.I.G.N ---------- */
  const STAR = ["....K....", "...KYK...", "...KYK...", "KKKKYKKKK", "KYYYYYYYK", ".KYYYYYK.", "..KYYYK..", ".KYYKYYK.", ".KYK.KYK.", "KKK...KKK"];
  const SIGN = [["S", 15, 9, Y, YD, K], ["I", 27, 21, W, WD, K], ["G", 63, 21, T, TD, W], ["N", 75, 9, PK, "#e57aa6", K]];
  const shieldY = u => 15 + .9 * E.sin(u);
  GLPIX.def("les0-0", {
    w: 90, h: 30, dur: 4, still: .25,
    base(p, c) {
      p.circ(45, 15, 14, p.lt(c, .08));
      const lc = p.lt(c, .7);
      SIGN.forEach(([t, x, y]) => dots(p, x + (x < 45 ? 6 : -6), y, x < 45 ? 34 : 56, 15, lc, 2));
      SIGN.forEach(([t, x, y, col, cd, tc]) => { disc(p, x, y, 5, col, cd); if (t == "N") p.spr(x - 2, y - 2, ["K..K", "KK.K", "K.KK", "K..K", "K..K"], { K: tc }); else p.text(x - 1, y - 2, t, tc) });
      p.ell(45, 28, 7, 1, p.dk(c, .14));
    },
    parts: [
      /* perisai: bingkai putih, bidang ungu */
      { w: 21, h: 27, ax: 10, ay: 13,
        draw(q) {
          q.poly([[1, 4], [10, 1], [19, 4], [19, 13], [18, 17], [15, 21], [10, 25], [5, 21], [2, 17], [1, 13]], W, K);
          q.poly([[4, 6], [10, 4], [16, 6], [16, 13], [15, 16], [13, 19], [10, 22], [7, 19], [5, 16], [4, 13]], V, VD);
          q.shade({ [W]: WD }, [0, 0, 21, 27], 1);
          q.line(5, 7, 5, 12, q.lt(V, .35)); q.set(6, 6, q.lt(V, .35));
          q.set(3, 5, WD).set(2, 6, W);
        },
        at: u => ({ x: 45, y: shieldY(u), r: .8 * E.sin(u, 1) }) },
      /* bintang berdenyut di tengah perisai */
      { w: 9, h: 10, ax: 4, ay: 5,
        draw(q) { q.spr(0, 0, STAR, { K, Y }); q.shade({ [Y]: YD }, [0, 0, 9, 10], 1); q.set(4, 2, W).set(3, 4, W) },
        at: u => { const b = Math.max(0, E.sin(u, 2)); return { x: 45, y: shieldY(u) + .5, s: 1 + .14 * b ** 2, r: .8 * E.sin(u, 1) } } },
      /* kilau bergantian di dua sisi */
      { ...sparkle(W, 1), at: u => { const h = u < .5 ? 0 : 1, w = (u * 2) % 1, s = E.back(E.seg(w, .1, .3)) * (1 - E.io(E.seg(w, .45, .7)));
          return { x: h ? 57 : 33, y: h ? 5 : 6, s: Math.max(s, .001), o: s > .02 ? 1 : 0, r: 90 * w } } }
    ]
  });

  /* ---------- 0-1 Thoughts, Feelings & What You Do: segitiga kognitif ---------- */
  const NODES = [[45, 8], [29, 22], [61, 22]];   /* pikiran (atas), perasaan (kiri), tindakan (kanan) */
  const HEART = [".RR.RR.", "RRRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."];
  const ARROW = ["...W...", "...WW..", "WWWWWW.", "WWWWWWW", "WWWWWW.", "...WW..", "...W..."];
  /* titik kuning berkeliling: pikiran -> perasaan -> tindakan -> pikiran */
  const triAt = u => { u = ((u % 1) + 1) % 1; const L = Math.floor(u * 3), t = E.io(u * 3 - L), a = NODES[L], b = NODES[(L + 1) % 3];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] };
  GLPIX.def("les0-1", {
    w: 90, h: 30, dur: 4.5, still: .17,
    base(p, c) {
      const lc = p.lt(c, .8);
      [[0, 1], [1, 2], [2, 0]].forEach(([i, j]) => { const [x0, y0] = NODES[i], [x1, y1] = NODES[j], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) if (k % 3 < 2) p.set(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, lc) });
      /* mata panah kecil di tengah tiap sisi (arah putaran) */
      disc(p, 45, 8, 6, W, WD); disc(p, 29, 22, 6, Y, YD); disc(p, 61, 22, 6, T, TD);
      /* label */
      p.text(54, 6, "PIKIR", K); p.text(5, 20, "RASA", K); p.text(71, 20, "AKSI", K);
      p.star(11, 7, W, 1); p.star(80, 9, Y, 1);
    },
    parts: [
      /* gelembung pikiran: tiga titik yang menyala bergantian */
      { w: 9, h: 3, ax: 4, ay: 1, frames: 4,
        draw(q, c, f) { [0, 3, 6].forEach((x, k) => q.rect(x, 0, 2, 2, f && k == f - 1 ? V : K)) },
        at: u => ({ x: 45.5, y: 8.5, f: 1 + Math.floor(((u * 6) % 3)) }) },
      /* hati berdenyut (perasaan) */
      { w: 7, h: 6, ax: 3, ay: 3,
        draw(q) { q.spr(0, 0, HEART, { R: RED }); q.shade({ [RED]: REDD }, [0, 0, 7, 6], 1); q.set(1, 1, W) },
        at: u => { const d = ((u - .33) % 1 + 1) % 1, b = E.wob(E.seg(d, 0, .25), 2, 4); return { x: 29, y: 22, s: 1 + .25 * Math.abs(b) } } },
      /* panah aksi menyentak ke kanan */
      { w: 7, h: 7, ax: 3, ay: 3,
        draw(q) { q.spr(0, 0, ARROW, { W }) },
        at: u => { const d = ((u - .66) % 1 + 1) % 1, k = Math.sin(Math.PI * E.seg(d, 0, .22)); return { x: 61 + 1.6 * k, y: 22 } } },
      /* titik kuning yang berkeliling segitiga */
      { w: 5, h: 5, ax: 2, ay: 2,
        draw(q) { q.circ(2, 2, 2, Y, K); q.set(1, 1, W) },
        at: u => { const [x, y] = triAt(u), dmin = Math.min(...NODES.map(([a, b]) => Math.hypot(x - a, y - b))), o = E.cl((dmin - 6) / 3); return { x, y, o } } }
    ]
  });

  /* ---------- 0-2 Change Your Thinking: awan pikiran gelap berganti cerah ---------- */
  const sunK = u => E.io(E.seg(u, .36, .5)) * (1 - E.io(E.seg(u, .86, .98)));   /* 0 = mendung, 1 = cerah */
  const LUMPS = [[40, 11, 7], [51, 8, 7], [63, 9, 7], [71, 16, 6], [39, 19, 6], [52, 20, 7], [64, 20, 6]];
  GLPIX.def("les0-2", {
    w: 90, h: 30, dur: 5, still: .7,
    base(p, c) {
      /* bahu */
      p.ell(13, 31, 9, 5, T, K); p.shade({ [T]: TD }, [3, 25, 21, 5], 1);
      /* gelembung kecil menuju awan pikiran */
      p.circ(23, 17, 1, W, K); p.circ(28, 13, 2, W, K);
      /* awan pikiran putih */
      LUMPS.forEach(([x, y, r]) => p.circ(x, y, r, K)); LUMPS.forEach(([x, y, r]) => p.circ(x, y, r - 1, W));
      p.rect(42, 10, 26, 12, W);
      p.shade({ [W]: WD }, [30, 0, 50, 30], 1);
      p.set(37, 7, W).set(36, 8, WD);
      p.star(84, 6, Y, 1); p.star(81, 22, W, 1);
    },
    parts: [
      /* kepala anak: cemas (0) lalu tersenyum (1) */
      { w: 17, h: 17, ax: 8, ay: 8, frames: 2,
        draw(q, c, f) {
          const x = 8, y = 8; q.circ(x, y, 7, SK, K);
          for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) { if (q.get(x + i, y + j) !== SK) continue; if (j <= -4 || (j <= -2 && i <= -3) || (i <= -6 && j <= 1)) q.set(x + i, y + j, HB) }
          q.set(x - 2, y - 5, q.lt(HB, .4)).set(x - 1, y - 5, q.lt(HB, .4));
          q.shade({ [SK]: SKD }, [0, 0, 17, 17], 1);
          if (f) { q.set(x - 1, y, K).set(x, y - 1, K).set(x + 1, y, K); q.set(x + 3, y, K).set(x + 4, y - 1, K).set(x + 5, y, K);
            q.set(x, y + 3, K).set(x + 1, y + 4, K).set(x + 2, y + 4, K).set(x + 3, y + 4, K).set(x + 4, y + 3, K); q.set(x - 2, y + 2, PK).set(x + 6, y + 2, PK) }
          else { q.rect(x, y - 1, 1, 2, K).rect(x + 4, y - 1, 1, 2, K);
            q.set(x + 1, y + 4, K).set(x + 2, y + 3, K).set(x + 3, y + 4, K); q.set(x - 4, y - 1, BL).set(x - 4, y, BLD).set(x - 3, y, BL) }
        },
        at: u => { const k = sunK(u); return { x: 13, y: 18 - .8 * k + .4 * E.sin(u, 2), r: -4 + 6 * k, f: k > .5 ? 1 : 0 } } },
      /* awan mendung berhujan */
      { w: 23, h: 17, ax: 11, ay: 8, frames: 3,
        draw(q, c, f) {
          const g = "#8a93b8", gd = "#6b7399";
          [[6, 7, 4], [12, 5, 5], [17, 7, 4]].forEach(([x, y, r]) => q.circ(x, y, r, K)); q.rect(3, 8, 17, 4, K);
          [[6, 7, 3], [12, 5, 4], [17, 7, 3]].forEach(([x, y, r]) => q.circ(x, y, r, g)); q.rect(4, 8, 15, 3, g);
          q.shade({ [g]: gd }, [0, 0, 23, 13], 1); q.set(10, 2, q.lt(g, .4)).set(9, 3, q.lt(g, .4));
          [[6, 0], [11, 1], [16, 2]].forEach(([x, ph]) => { const o = (f + ph) % 3; q.line(x - o, 13 + o, x - o - 1, 14 + o, BLD) });
        },
        at: u => { const k = sunK(u); return { x: 55, y: 13 + .6 * E.sin(u, 3), o: 1 - k, s: 1 - .25 * k, f: Math.floor(u * 15) % 3 } } },
      /* matahari tersenyum */
      { w: 23, h: 23, ax: 11, ay: 11,
        draw(q) {
          for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4, x0 = 11 + 7.2 * Math.cos(t), y0 = 11 + 7.2 * Math.sin(t), x1 = 11 + 9.6 * Math.cos(t), y1 = 11 + 9.6 * Math.sin(t); q.line(x0, y0, x1, y1, YD) }
          q.circ(11, 11, 5, Y, K); q.shade({ [Y]: YD }, [5, 5, 13, 13], 1); q.set(8, 8, W).set(9, 7, W);
          q.set(9, 10, K).set(13, 10, K); q.set(9, 13, K).set(10, 14, K).set(11, 14, K).set(12, 14, K).set(13, 13, K);
        },
        at: u => { const k = sunK(u); return { x: 55, y: 14 + .5 * E.sin(u, 2), o: k, s: Math.max(.001, .5 + .5 * E.back(k)) } } }
    ]
  });

  /* ---------- 0-3 Problem Solving: kepingan puzzle terakhir masuk ---------- */
  const piece = (q, x, y, col, cd, knobs) => {
    q.rect(x, y, 11, 11, col, K);
    knobs.forEach(([kx, ky, sx, sy]) => { q.circ(kx, ky, 2, col, K); for (let k = -1; k <= 1; k++) q.set(sx ? sx : kx + k, sy ? sy : ky + k, col) });
    q.shade({ [col]: cd }, [x, y, 16, 16], 1);
    q.set(x + 2, y + 2, W).set(x + 3, y + 2, W).set(x + 2, y + 3, W);
  };
  const seat = u => E.io(E.seg(u, .18, .38)) * (1 - E.io(E.seg(u, .82, .98)));
  GLPIX.def("les0-3", {
    w: 90, h: 30, dur: 4.6, still: .6,
    base(p, c) {
      p.rect(33, 27, 25, 2, p.dk(c, .14), null, 1);
      /* slot kosong bergaris putus */
      const lc = p.lt(c, .55); for (let i = 0; i <= 10; i += 2) { p.set(45 + i, 25, lc).set(55, 15 + i, lc) }
      piece(p, 45, 5, T, TD, []);
      piece(p, 35, 5, W, WD, [[47, 10, 45, 0]]);
      piece(p, 35, 15, V, VD, [[40, 13, 0, 15]]);
      /* kaca pembesar (mencari akar masalah) */
      p.stick(19, 19, 13, 25, HB);
      p.circ(21, 14, 6, K); p.circ(21, 14, 5, "#ffe9dd"); p.circ(21, 14, 4, "#fff6f0");
      p.set(19, 11, W).set(18, 12, W).set(18, 13, W);
      p.text(20, 12, "?", K);
      /* bola lampu (jalan keluar) */
      p.circ(76, 12, 6, K); p.circ(76, 12, 5, "#fff2b0"); p.shade({ ["#fff2b0"]: YD }, [70, 6, 13, 13], 1);
      p.rect(73, 18, 7, 3, G, K); p.line(74, 19, 78, 19, WD); p.rect(74, 21, 5, 2, N, K);
      p.set(73, 9, W).set(74, 8, W).set(73, 10, W);
      p.line(75, 14, 75, 17, YD); p.line(77, 14, 77, 17, YD); p.set(76, 14, YD);
    },
    parts: [
      /* sinar lampu menyala saat puzzle lengkap */
      { w: 21, h: 21, ax: 10, ay: 10,
        draw(q) { for (let a = 0; a < 7; a++) { const t = Math.PI * (1.1 + a * .133), x0 = 10 + 8 * Math.cos(t), y0 = 10 + 8 * Math.sin(t), x1 = 10 + 10 * Math.cos(t), y1 = 10 + 10 * Math.sin(t); q.line(x0, y0, x1, y1, Y) } q.line(0, 10, 2, 10, Y); q.line(18, 10, 20, 10, Y) },
        at: u => { const k = E.cl((seat(u) - .85) / .15); return { x: 76, y: 12, o: k, s: Math.max(.001, .8 + .2 * k) } } },
      /* keping kuning: melayang, lalu masuk ke slot */
      { w: 16, h: 16, ax: 5, ay: 10,
        draw(q) { piece(q, 5, 5, Y, YD, [[3, 10, 5, 0], [10, 3, 0, 5]]) },
        at: u => { const k = seat(u), hov = 1 - k, sq = E.wob(E.seg(u, .38, .6), 2, 4);
          return { x: 45 + 12 * hov, y: 20 - 3 * hov + 1.2 * hov * E.sin(u, 2), r: 14 * hov + 3 * E.sin(u, 1) * hov, sx: 1 + .08 * sq, sy: 1 - .08 * sq } } },
      /* kilau saat terkunci */
      { ...sparkle(W, 2), at: u => ({ x: 58, y: 13, ...pop(u, .38, .46, .58, .68), r: 90 * E.seg(u, .38, .68) }) }
    ]
  });

  /* ---------- 0-4 Keeping Well: daun, napas, detak jantung, air minum ---------- */
  const ECG = [[0, 25], [17, 25], [20, 21], [23, 27], [26, 18], [29, 25], [60, 25], [63, 21], [66, 27], [69, 18], [72, 25], [89, 25]];
  const segs = ECG.slice(1).map((b, i) => { const a = ECG[i]; return [a, b, Math.hypot(b[0] - a[0], b[1] - a[1])] });
  const LEN = segs.reduce((s, x) => s + x[2], 0);
  const ecgAt = t => { let d = t * LEN; for (const [a, b, l] of segs) { if (d <= l) return [a[0] + (b[0] - a[0]) * d / l, a[1] + (b[1] - a[1]) * d / l]; d -= l } return ECG[ECG.length - 1] };
  const LEAF = ["........KKK", "......KKLLK", "....KKLLLLK", "...KLLLLLLK", "..KLLLLLDLK", ".KLLLLLDLK.", ".KLLLDDLLK.", "KLLLDLLLK..", "KLLDLLKK...", "KLDKKK.....", "KDK........", "D.........."];
  GLPIX.def("les0-4", {
    w: 90, h: 30, dur: 4, still: .3,
    base(p, c) {
      /* garis detak jantung */
      const sh = p.dk(c, .18);
      for (let i = 0; i < ECG.length - 1; i++) p.line(ECG[i][0], ECG[i][1] + 1, ECG[i + 1][0], ECG[i + 1][1] + 1, sh);
      for (let i = 0; i < ECG.length - 1; i++) p.line(ECG[i][0], ECG[i][1], ECG[i + 1][0], ECG[i + 1][1], W);
      /* gelas air */
      const gl = "#e8f7ff";
      p.poly([[74, 5], [86, 5], [85, 21], [75, 21]], gl, K);
      for (let y = 11; y < 21; y++) for (let x = 75; x < 86; x++) if (p.get(x, y) === gl) p.set(x, y, y == 11 ? W : BL);
      p.shade({ [BL]: BLD, [gl]: WD }, [74, 5, 13, 17], 1);
      p.line(77, 7, 77, 18, W); p.set(82, 14, W).set(80, 17, W);
      p.ell(80, 23, 6, 1, sh);
      p.star(32, 5, W, 1); p.star(60, 6, Y, 1);
    },
    parts: [
      /* lingkaran napas (mengembang-mengempis) */
      { w: 27, h: 27, ax: 13, ay: 13,
        draw(q, c) { q.circ(13, 13, 12, q.lt(c, .22)); q.circ(13, 13, 10, q.lt(c, .4)) },
        at: u => ({ x: 45, y: 13, s: .88 + .12 * (.5 - .5 * Math.cos(2 * Math.PI * u)) }) },
      /* titik detak menyusuri garis */
      { w: 7, h: 7, ax: 3, ay: 3,
        draw(q) { q.circ(3, 3, 2, Y, K); q.set(2, 2, W); q.set(3, 0, null) },
        at: u => { const [x, y] = ecgAt(u); return { x, y, o: E.cl(Math.min(u, 1 - u) / .03) } } },
      /* tetes air memantul pelan */
      { w: 9, h: 11, ax: 4, ay: 10,
        draw(q) { q.spr(0, 0, ["....K....", "...KBK...", "...KBK...", "..KBBBK..", ".KBBBBBK.", "KBWBBBBBK", "KBWBBBBBK", "KBBBBBBBK", ".KBBBBBK.", "..KKKKK.."], { K, B: BL, W }); q.shade({ [BL]: BLD }, [0, 0, 9, 10], 1) },
        at: u => { const h = Math.abs(Math.sin(Math.PI * u * 2)); return { x: 9, y: 17 - 3 * h, sx: 1 + .08 * (1 - h) ** 4, sy: 1 - .08 * (1 - h) ** 4 } } }
    ],
    fg(p) {
      /* lingkaran daun di atas napas */
      p.circ(45, 13, 9, W, K); p.shade({ [W]: WD }, [36, 4, 19, 19], 1);
      p.spr(40, 7, LEAF, { K, L: LF, D: LFD }); p.shade({ [LF]: LFD }, [40, 7, 11, 12], 1);
      p.set(46, 9, p.lt(LF, .5)).set(47, 8, p.lt(LF, .5));
      p.set(39, 8, W).set(38, 9, W);
    }
  });
})();

/* ===== Bab 2 ===== */
/* ===== Kartu pelajaran Bab 2: Emotional Intelligence (grid 90x30) ===== */
(() => {
  const { C, E } = GLPIX;
  const { K, W, O, OD, Y, YD, T, TD, V, VD, N, WD, SK, SKD, PK, HB, G, BR, BD } = C;
  const HEART = [".KK.KK.", "KWOKOOK", "KOOOOOK", ".KOOOK.", "..KOK..", "...K..."];
  const heartSpr = (col, cd) => ({ w: 7, h: 6, ax: 3, ay: 3, draw: q => { q.spr(0, 0, HEART, { K, W, O: col }); q.set(5, 2, cd).set(4, 3, cd) } });
  const BIGHEART = [".KKK.KKK.", "KOOOKOOOK", "KOWOOOOOK", "KOOOOOOOK", ".KOOOOOK.", "..KOOOK..", "...KOK...", "....K...."];
  const bigHeart = (col, cd) => q => { q.spr(0, 0, BIGHEART, { K, W, O: col }); q.set(6, 3, cd).set(6, 4, cd).set(5, 5, cd).set(4, 6, cd) };
  /* bintang lima sudut */
  const star5 = (n, col, cd) => q => {
    const P = [], c0 = (n - 1) / 2, R = c0, r = R * .45;
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r : R; P.push([Math.round(c0 + rr * Math.cos(a)), Math.round(c0 + .6 + rr * Math.sin(a))]) }
    q.poly(P, col, K); q.shade({ [col]: cd }, [0, 0, n, n], 1); q.set(Math.round(c0) - 1, Math.round(c0) - 1, W);
  };
  const tw = (x, y, col, ph, sz = 1) => ({ w: 7, h: 7, ax: 3, ay: 3, draw: q => q.star(3, 3, col, sz),
    at(u) { const w = (u + ph) % 1, s = E.back(E.seg(w, 0, .2)) * (1 - E.io(E.seg(w, .4, .62))); return { x, y, s: Math.max(s, .001), o: s > .02 ? 1 : 0 } } });

  /* ---------- les1-0: Emotional and Social Awareness ----------
     pengukur emosi setengah lingkaran (oranye sedih, putih netral, teal senang); jarum berayun pelan dari wajah sedih
     di kiri ke wajah senang di kanan lalu kembali; wajah yang ditunjuk membesar sedikit */
  const GX = 45, GY = 25, GR = 20;
  const needle = u => { const t = .5 - .5 * Math.cos(2 * Math.PI * u); return -66 + 132 * E.io(t) };
  const face = happy => q => {
    q.circ(6, 6, 6, W, K); q.shade({ [W]: WD }, [0, 0, 13, 13], 1);
    q.rect(3, 4, 2, 2, K).rect(8, 4, 2, 2, K).set(3, 4, W).set(8, 4, W);
    if (happy) { q.set(3, 8, K).set(4, 9, K).set(5, 9, K).set(6, 9, K).set(7, 9, K).set(8, 8, K); q.set(2, 7, PK).set(10, 7, PK) }
    else { q.set(4, 9, K).set(5, 8, K).set(6, 8, K).set(7, 8, K).set(8, 9, K); q.set(2, 3, K).set(3, 2, K).set(9, 2, K).set(10, 3, K); q.set(10, 7, "#5fc8ff").set(10, 8, "#5fc8ff") }
    q.set(3, 2, happy ? W : K);
  };
  GLPIX.def("les1-0", {
    w: 90, h: 30, dur: 4.4, still: .5,
    base(p, c) {
      for (let y = GY - GR - 1; y <= GY; y++) for (let x = GX - GR - 1; x <= GX + GR + 1; x++) {
        const dx = x - GX, dy = GY - y, d = Math.hypot(dx, dy); if (d > GR + .5) continue;
        const a = Math.atan2(dy, dx) * 180 / Math.PI;
        let col;
        if (d > GR - .5) col = K;
        else if (d > GR - 5.5) col = a > 120 ? O : a < 60 ? T : W;
        else if (d > GR - 6.5) col = K;
        else col = N;
        p.set(x, y, col);
      }
      [60, 120].forEach(a => { const r = a * Math.PI / 180; p.line(GX + 14.5 * Math.cos(r), GY - 14.5 * Math.sin(r), GX + 19.5 * Math.cos(r), GY - 19.5 * Math.sin(r), K) });
      p.shade({ [O]: OD, [W]: WD, [T]: TD }, [GX - GR, GY - GR, GR * 2 + 1, GR], 1);
      /* sorotan di busur kiri atas */
      [[-13, 12], [-12, 13], [-11, 14]].forEach(([x, y]) => p.set(GX + x, GY - y, p.lt(O, .5)));
      /* titik skala */
      for (let a = 0; a <= 180; a += 30) { const r = a * Math.PI / 180; p.set(GX + 11 * Math.cos(r), GY - 11 * Math.sin(r), a % 90 ? p.lt(N, .45) : W) }
      /* alas */
      p.line(GX - GR - 1, GY, GX + GR + 1, GY, K);
      p.rect(GX - GR - 3, GY + 1, GR * 2 + 7, 3, N, K, 1); p.line(GX - GR - 1, GY + 2, GX - 4, GY + 2, p.lt(N, .3));
    },
    parts: [
      { w: 13, h: 13, ax: 6, ay: 6, draw: face(false),
        at: u => { const k = Math.max(0, -needle(u) / 66) ** 2; return { x: 13, y: 15 + 1.2 * k, s: 1 + .12 * k } } },
      { w: 13, h: 13, ax: 6, ay: 6, draw: face(true),
        at: u => { const k = Math.max(0, needle(u) / 66) ** 2; return { x: 77, y: 15 - 1.5 * k - .8 * Math.abs(E.sin(u, 4)) * k, s: 1 + .14 * k } } },
      { w: 5, h: 17, ax: 2, ay: 15,
        draw(q) { q.line(2, 15, 2, 2, K, 3); q.line(2, 14, 2, 3, W); q.set(2, 2, O).set(2, 3, O).set(2, 1, K) },
        at: u => ({ x: GX, y: GY - 1, r: needle(u) + 2.5 * E.wob(E.seg((u + .5) % 1, 0, .25), 2, 4) }) }
    ],
    fg(p) { p.circ(GX, GY - 1, 2, O, K); p.set(GX - 1, GY - 2, W) }
  });

  /* ---------- les1-1: Facing Stress and Burnout ----------
     baterai lowong (satu sel oranye, "zzz" melayang) lalu terisi sel demi sel lewat kabel colokan, petir berdenyut,
     kilau muncul saat penuh, lalu kembali lowong */
  const BX = 26, BY = 6, BW = 34, BH = 19;
  const level = u => u < .08 || u > .9 ? 1 : 1 + Math.min(3, Math.floor(E.seg(u, .08, .62) * 3.999));
  const sleepy = u => 1 - E.io(E.seg(u, .1, .2)) + E.io(E.seg(u, .84, .94));
  const zPart = (k, x0, sz) => ({ w: sz, h: sz, ax: (sz - 1) / 2, ay: (sz - 1) / 2,
    draw(q) { const n = sz - 1; q.line(0, 0, n, 0, N); q.line(n, 0, 0, n, N); q.line(0, n, n, n, N) },
    at(u) { const ph = (u * 2 + k / 3) % 1; return { x: x0 + 2 * Math.sin(2 * Math.PI * ph), y: 16 - 12 * ph, o: Math.min(1, sleepy(u)) * Math.sin(Math.PI * ph), s: .7 + .5 * ph } } });
  GLPIX.def("les1-1", {
    w: 90, h: 30, dur: 4.6, still: .7,
    base(p, c) {
      /* kabel & colokan */
      p.line(BX - 1, 16, 14, 16, K, 2); p.line(14, 16, 14, 21, K, 2);
      p.rect(8, 21, 12, 6, O, K, 1); p.shade({ [O]: OD }, [8, 21, 12, 6], 1); p.set(10, 22, p.lt(O, .5)).set(11, 22, p.lt(O, .5));
      p.rect(10, 27, 2, 2, G).rect(16, 27, 2, 2, G).set(10, 28, K).set(17, 28, K);
      /* badan baterai: tepi tinta 2px */
      p.rect(BX, BY, BW, BH, K, null, 2); p.rect(BX + 2, BY + 2, BW - 4, BH - 4, W);
      p.rect(BX + BW, BY + 5, 3, BH - 10, K, null, 1); p.set(BX + BW, BY + 6, G).set(BX + BW, BY + 7, G);
      for (let k = 0; k < 4; k++) p.rect(BX + 4 + k * 7, BY + 4, 5, BH - 8, null, WD);
      p.line(BX + 3, BY + 2, BX + BW - 4, BY + 2, WD); p.line(BX + 2, BY + BH - 3, BX + BW - 3, BY + BH - 3, WD);
    },
    parts: [
      { w: 28, h: 11, ax: 0, ay: 0, frames: 5,
        draw(q, c, f) {
          for (let k = 0; k < f; k++) { const col = f == 1 ? O : T, cd = f == 1 ? OD : TD; q.rect(k * 7, 0, 5, 11, col, K); q.line(k * 7 + 3, 1, k * 7 + 3, 9, cd); q.line(k * 7 + 1, 9, k * 7 + 3, 9, cd); q.set(k * 7 + 1, 1, q.lt(col, .55)).set(k * 7 + 1, 2, q.lt(col, .55)) }
        },
        at: u => ({ x: BX + 4, y: BY + 4, f: level(u) }) },
      { w: 9, h: 13, ax: 4, ay: 6,
        draw(q) { q.poly([[5, 0], [0, 7], [4, 7], [3, 12], [8, 5], [4, 5], [6, 0]], W, K); q.shade({ [W]: Y }, [0, 0, 9, 13], 1) },
        at: u => { const ch = u > .08 && u < .66, pu = ch ? .1 * Math.max(0, E.sin(u * 4.5, 1)) : 0, full = E.wob(E.seg(u, .62, .82), 2, 4);
          return { x: 19, y: 8 - pu * 6 + .5 * E.sin(u, 2), s: 1 + pu + .12 * full, r: 8 * full } } },
      zPart(0, 72, 6), zPart(1, 79, 5), zPart(2, 67, 4),
      tw(66, 7, W, .38, 1), tw(84, 22, W, .44, 1)
    ].map((pt, i) => i >= 5 ? { ...pt, at: u => { const a = pt.at(u); return { ...a, o: a.o * (u > .6 && u < .9 ? 1 : 0) } } } : pt)
  });

  /* ---------- les1-2: Criticism, Weakness and Failure ----------
     papan klip catatan: grafik jatuh lalu naik lagi digambar pensil, bintang meletup di puncak; gelembung "!" (kritik) di kiri */
  const PTS = [[33, 11], [38, 20], [43, 16], [48, 21], [57, 10]];
  const SEGL = PTS.slice(1).map((q, i) => Math.hypot(q[0] - PTS[i][0], q[1] - PTS[i][1])), TOT = SEGL.reduce((a, b) => a + b, 0);
  const ptAt = t => { let d = t * TOT; for (let i = 0; i < SEGL.length; i++) { if (d <= SEGL[i] || i == SEGL.length - 1) { const k = Math.min(1, d / SEGL[i]); return [E.lerp(PTS[i][0], PTS[i + 1][0], k), E.lerp(PTS[i][1], PTS[i + 1][1], k)] } d -= SEGL[i] } };
  const drawT = u => E.io(E.seg(u, .06, .58));
  const LF = 20, OX = 30, OY = 7;
  GLPIX.def("les1-2", {
    w: 90, h: 30, dur: 4.8, still: .72,
    base(p, c) {
      p.rect(25, 3, 40, 26, BR, K, 1); p.shade({ [BR]: BD }, [25, 3, 40, 26], 1); p.line(26, 4, 36, 4, p.lt(BR, .35));
      p.rect(28, 6, 34, 21, W, K); p.shade({ [W]: WD }, [28, 6, 34, 21], 1);
      p.rect(39, 1, 12, 5, G, K, 1); p.rect(42, 0, 6, 2, null, K); p.set(40, 2, W);
      p.line(31, 9, 31, 23, G); p.line(31, 23, 59, 23, G);
      for (let x = 35; x < 59; x += 5) p.set(x, 24, G);
      /* gelembung kritik "!" */
    },
    parts: [
      { w: 15, h: 14, ax: 7, ay: 12,
        draw(q) { q.rect(0, 0, 15, 11, W, K, 1); q.shade({ [W]: WD }, [0, 0, 15, 11], 1); q.spr(9, 10, ["KWWK", ".KWK", "..KK", "...K"], { K, W });
          q.rect(6, 2, 3, 4, O).rect(6, 7, 3, 2, O); q.set(6, 2, q.lt(O, .4)) },
        at: u => { const sh = E.wob(E.seg(u, .2, .5), 3, 4); return { x: 13, y: 16 + .6 * E.sin(u, 2), r: -4 + 8 * sh } } },
      { w: 32, h: 16, ax: 0, ay: 0, frames: LF + 1,
        draw(q, c, f) {
          const t = f / LF; if (!t) return; const P = [PTS[0]]; let acc = 0;
          for (let i = 0; i < SEGL.length; i++) { acc += SEGL[i]; if (acc <= t * TOT + .01) P.push(PTS[i + 1]); else break }
          P.push(ptAt(t)); for (let i = 1; i < P.length; i++) { q.line(P[i - 1][0] - OX, P[i - 1][1] - OY, P[i][0] - OX, P[i][1] - OY, O, 2) }
          if (t >= .62) q.rect(48 - OX - 1, 21 - OY - 1, 3, 3, K);
        },
        at: u => ({ x: OX, y: OY, f: Math.round(drawT(u) * LF), o: 1 - E.io(E.seg(u, .9, .99)) }) },
      { w: 12, h: 12, ax: 1, ay: 10,
        draw(q) { q.line(3, 8, 9, 2, K, 4); q.line(3, 8, 9, 2, V, 2); q.line(4, 8, 9, 3, VD); q.line(9, 2, 10, 1, PK, 2); q.set(11, 0, K).set(10, 0, K).set(11, 1, K);
          q.set(1, 10, K).set(2, 9, SK).set(1, 9, SK).set(2, 10, SK).set(3, 9, K).set(1, 8, K).set(0, 11, K) },
        at: u => { const t = drawT(u), [x, y] = ptAt(t), go = E.io(E.seg(u, .6, .74)), back = E.io(E.seg(u, .9, 1));
          const px = E.lerp(E.lerp(x, 70, go), PTS[0][0], back), py = E.lerp(E.lerp(y, 22, go), PTS[0][1], back);
          return { x: px, y: py - .6 * Math.abs(E.sin(u * 3, 2)) * (1 - go), r: 0 } } },
      { w: 13, h: 13, ax: 6, ay: 6, draw: star5(13, O, OD),
        at: u => { const s = E.back(E.seg(u, .58, .68)) * (1 - E.io(E.seg(u, .88, .96))); return { x: 58, y: 8 + .5 * E.sin(u, 3), s: Math.max(s, .001), o: s > .02 ? 1 : 0, r: -30 * (1 - E.out(E.seg(u, .58, .75))) + 6 * E.sin(u, 2) } } },
      tw(70, 6, W, .1, 1), tw(80, 17, W, .3, 1)
    ]
  });

  /* ---------- les1-3: Happiness in Life ----------
     matahari tersenyum dengan mata terpejam bahagia di atas lingkaran halo; sinar berputar pelan, badan bernapas,
     hati kecil naik melayang di kiri dan kanan (rasa syukur) */
  const SUN = "#ffb43c", SUND = "#e98a1e", SX = 45, SY = 15;
  const hRise = (x, y0, ph, spr) => ({ ...spr, at(u) { const w = (u + ph) % 1; return { x: x + 1.5 * Math.sin(2 * Math.PI * w), y: y0 - 12 * w, o: Math.min(1, 3 * Math.sin(Math.PI * w)), s: .8 + .3 * Math.sin(Math.PI * w) } } });
  GLPIX.def("les1-3", {
    w: 90, h: 30, dur: 5, still: .3,
    base(p, c) {
      p.circ(SX, SY, 13, p.lt(c, .3)); p.circ(SX, SY, 10, p.lt(c, .55));
      /* awan kecil */
      p.rect(8, 6, 8, 2, W).rect(6, 8, 13, 3, W).rect(7, 11, 11, 1, WD); p.line(7, 7, 7, 7, W);
      p.rect(72, 22, 7, 2, W).rect(70, 24, 12, 2, W).rect(71, 26, 10, 1, WD);
    },
    parts: [
      { w: 29, h: 29, ax: 14, ay: 14, frames: 2,
        draw(q, c, f) { const L = k => (k + f) % 2 ? 11 : 13;
          for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, cs = Math.cos(a), sn = Math.sin(a); q.line(Math.round(14 + 10 * cs), Math.round(14 + 10 * sn), Math.round(14 + L(k) * cs), Math.round(14 + L(k) * sn), K, 3) }
          for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, cs = Math.cos(a), sn = Math.sin(a); q.line(Math.round(14 + 10 * cs), Math.round(14 + 10 * sn), Math.round(14 + (L(k) - .5) * cs), Math.round(14 + (L(k) - .5) * sn), O) } },
        at: u => { const b = E.sin(u, 2); return { x: SX, y: SY + .4 * b, f: (u * 4 | 0) % 2 } } },
      { w: 19, h: 19, ax: 9, ay: 9, frames: 1,
        draw(q) {
          q.circ(9, 9, 8, SUN, K); q.shade({ [SUN]: SUND }, [0, 0, 19, 19], 2);
          q.set(5, 4, W).set(4, 5, W).set(6, 4, q.lt(SUN, .5)).set(4, 6, q.lt(SUN, .5));
          /* mata terpejam bahagia ^ ^ */
          q.set(5, 8, K).set(6, 7, K).set(7, 8, K); q.set(11, 8, K).set(12, 7, K).set(13, 8, K);
          q.set(6, 11, K).set(7, 12, K).set(8, 12, K).set(9, 12, K).set(10, 12, K).set(11, 12, K).set(12, 11, K); q.rect(8, 13, 3, 1, OD);
          q.set(4, 10, PK).set(5, 10, PK).set(13, 10, PK).set(14, 10, PK);
        },
        at: u => { const b = E.sin(u, 2); return { x: SX, y: SY + .4 * b, sx: 1 + .03 * b, sy: 1 - .03 * b } } },
      hRise(16, 24, 0, heartSpr(O, OD)), hRise(25, 26, .5, heartSpr(V, VD)), hRise(70, 20, .25, heartSpr(PK, "#e57aa6")), hRise(80, 17, .75, heartSpr(O, OD)),
      tw(30, 4, W, .15, 1), tw(62, 5, W, .65, 1)
    ]
  });

  /* ---------- les1-4: Communicate with Empathy ----------
     dua anak saling menghadap; anak kiri bercerita (gelembung titik-titik berkedip), anak kanan menanggapi dengan
     gelembung berisi hati yang berdetak */
  const mouth = q => (q, c, f) => { q.rect(0, 0, 5, 3, SK); if (f) q.rect(1, 0, 3, 2, K).set(2, 1, O); else q.set(1, 1, K).set(2, 1, K).set(3, 1, K).set(0, 0, K).set(4, 0, K) };
  GLPIX.def("les1-4", {
    w: 90, h: 30, dur: 4, still: .6,
    base(p, c) {
      p.kid(13, 9, { shirt: T, hair: K });
      p.kid(77, 9, { shirt: V, hair: HB, hair2: 1 });
    },
    parts: [
      { w: 5, h: 3, ax: 2, ay: 1, frames: 2, draw: mouth(),
        at: u => ({ x: 13, y: 15, f: u < .5 && E.sin(u, 12) > 0 ? 1 : 0 }) },
      { w: 5, h: 3, ax: 2, ay: 1, frames: 2, draw: mouth(),
        at: u => ({ x: 77, y: 15, f: u >= .5 && u < .95 && E.sin(u, 12) > 0 ? 1 : 0 }) },
      { w: 24, h: 15, ax: 12, ay: 7, frames: 4,
        draw(q, c, f) { q.rect(0, 0, 24, 12, W, K, 2); q.shade({ [W]: WD }, [0, 0, 24, 12], 1); q.spr(2, 11, ["KWWK", "KWK.", "KK..", "K..."], { K, W });
          for (let k = 0; k < 3; k++) q.rect(6 + k * 5, 5, 3, 3, k < f ? N : q.lt(N, .6)) ; q.set(3, 2, W) },
        at: u => ({ x: 33, y: 8 + .6 * E.sin(u, 2), f: 1 + Math.floor((u * 6) % 3) }) },
      { w: 24, h: 15, ax: 12, ay: 7,
        draw(q) { q.rect(0, 0, 24, 12, W, K, 2); q.shade({ [W]: WD }, [0, 0, 24, 12], 1); q.spr(18, 11, ["KWWK", ".KWK", "..KK", "...K"], { K, W }) },
        at: u => ({ x: 57, y: 14 - .6 * E.sin(u, 2) }) },
      { w: 9, h: 8, ax: 4, ay: 4, draw: bigHeart(O, OD),
        at: u => { const b = Math.max(0, E.sin(u, 4)) ** 3; return { x: 57, y: 13 - .6 * E.sin(u, 2), s: 1 + .22 * b } } }
    ]
  });
})();

/* ===== Bab 3 ===== */
/* ---- Kartu pelajaran Bab 3: Thinking Skill (les2-0..4), grid 90x30 ---- */
(() => {
  const { C, E } = GLPIX;
  const { K, O, Y, T, W, OD, YD, TD, WD, BR, BD, SK, PK, G } = C;
  const PKD = "#e0789f", GLS = "#cfe0ff";
  /* bidang berbentuk bebas: inside(x,y) -> true; tepi otomatis bertinta */
  const shape = (q, x0, y0, x1, y1, inside, col, ink = K) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!inside(x, y)) continue;
      const e = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      q.set(x, y, e && ink ? ink : col);
    }
    return q;
  };
  const node = (p, x, y, r, col, dcol) => { p.circ(x, y, r, col, K); p.shade({ [col]: dcol }, [x - r, y - r, 2 * r + 1, 2 * r + 1], 1); p.set(x - r + 2, y - r + 2, W); if (r > 3) p.set(x - r + 3, y - r + 2, W).set(x - r + 2, y - r + 3, W); return p };
  /* garis jalur bertepi tinta (3px tinta + 1px warna) melalui titik-titik */
  const stroke = (p, pts, col) => { for (const t of [3, 1]) for (let i = 1; i < pts.length; i++) p.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], t == 3 ? K : col, t); return p };
  const arcPts = (cx, cy, rx, ry, a0, a1, n = 60) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [Math.round(cx + rx * Math.cos(a)), Math.round(cy + ry * Math.sin(a))] });
  const tri = (p, x, y, dx, dy, col) => {
    const L = Math.hypot(dx, dy); dx /= L; dy /= L; const nx = -dy, ny = dx;
    p.poly([[x + 3 * dx, y + 3 * dy], [x - 1.8 * dx + 2.8 * nx, y - 1.8 * dy + 2.8 * ny], [x - 1.8 * dx - 2.8 * nx, y - 1.8 * dy - 2.8 * ny]].map(a => a.map(Math.round)), col, K);
  };

  /* ===== les2-0 System Thinking: lingkaran umpan balik 4 simpul, sinyal beredar, roda gigi berputar ===== */
  const RX = 17.5, RY = 9.25, CX = 45, CY = 15;
  const sig = ph => ({ w: 5, h: 5, ax: 2, ay: 2,
    draw: q => { q.circ(2, 2, 2, Y, K); q.set(1, 1, W) },
    at: u => { const a = 2 * Math.PI * (u + ph); return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) } } });
  GLPIX.def("les2-0", {
    w: 90, h: 30, dur: 4, still: .1,
    base(p, c) {
      const dim = p.lt(c, .4);
      [[27, 15, 12, 7], [27, 15, 19, 23], [12, 7, 7, 20], [7, 20, 19, 23], [63, 15, 78, 7], [63, 15, 71, 23], [78, 7, 84, 19], [84, 19, 71, 23]].forEach(([a, b, d, e]) => p.line(a, b, d, e, dim));
      [[12, 7], [7, 20], [19, 23], [78, 7], [84, 19], [71, 23]].forEach(([x, y]) => p.circ(x, y, 1, W, K));
      stroke(p, arcPts(CX, CY, RX, RY, 0, 360, 140), W);
      const AR = ["KK...", "KOK..", "KOOK.", "KOOOK", "KOOK.", "KOK..", "KK..."];
      [[36, 1], [54, 1], [36, -1], [54, -1]].forEach(([x, d]) => { const y = Math.round(CY - d * RY * Math.sqrt(1 - ((x - CX) / RX) ** 2)); p.spr(x - 2, y - 3, d > 0 ? AR : AR.map(r => [...r].reverse().join("")), { K, O }) });
      node(p, 45, 6, 4, O, OD); node(p, 63, 15, 4, Y, YD); node(p, 45, 24, 4, T, TD); node(p, 27, 15, 4, PK, PKD);
    },
    parts: [
      { w: 17, h: 17, ax: 8, ay: 8,
        draw(q, c) {
          shape(q, 0, 0, 16, 16, (x, y) => { const dx = x - 8, dy = y - 8, r = Math.hypot(dx, dy), a = (Math.atan2(dy, dx) * 180 / Math.PI + 375) % 60; return r <= 5.3 || (r <= 7.6 && a < 30) }, W);
          q.shade({ [W]: WD }, [0, 0, 17, 17], 1); q.circ(8, 8, 2, c, K); q.set(5, 5, W)
        },
        at: u => ({ x: CX, y: CY, r: 120 * u }) },
      sig(0), sig(.5)
    ]
  });

  /* ===== les2-1 Critical Thinking: kaca pembesar memeriksa teks, lencana FAKTA (centang) dan OPINI (silang) ===== */
  const badge = (col, dcol, mark) => ({ w: 15, h: 15, ax: 7, ay: 7,
    draw(q) { q.circ(7, 7, 6, col, K); q.shade({ [col]: dcol }, [0, 0, 15, 15], 1); q.set(4, 3, q.lt(col, .5)).set(3, 4, q.lt(col, .5));
      if (mark) { q.line(4, 7, 6, 9, W, 2); q.line(6, 9, 10, 5, W, 2) } else { q.line(5, 5, 9, 9, W, 2); q.line(9, 5, 5, 9, W, 2) } } });
  GLPIX.def("les2-1", {
    w: 90, h: 30, dur: 4, still: .62,
    base(p) {
      p.rect(36, 3, 20, 25, p.dk("#2b55ff", .3)); p.rect(34, 2, 21, 25, W, K, 1); p.shade({ [W]: WD }, [34, 2, 21, 25], 1);
      p.rect(37, 9, 13, 3, Y);
      [[6, 14], [10, 11], [14, 13], [18, 9], [22, 12]].forEach(([y, l]) => p.line(37, y, 37 + l - 1, y, G));
      p.set(51, 10, T).set(52, 11, T).set(53, 10, T).set(54, 9, T);
      p.set(51, 17, O).set(53, 17, O).set(52, 18, O).set(51, 19, O).set(53, 19, O);
      p.text(14 - 9, 20, "FAKTA", W); p.text(76 - 9, 20, "OPINI", W);
    },
    parts: [
      { ...badge(T, TD, 1), at: u => ({ x: 14, y: 11, s: 1 + .14 * Math.max(0, -E.sin(u)) ** 3 }) },
      { ...badge(O, OD, 0), at: u => ({ x: 76, y: 11, s: 1 + .14 * Math.max(0, E.sin(u)) ** 3 }) },
      { w: 18, h: 18, ax: 7, ay: 7,
        draw(q) { q.line(11, 11, 16, 16, K, 4); q.line(12, 12, 16, 16, BR, 2); q.circ(7, 7, 6, "rgba(230,242,255,.45)", K); q.circ(7, 7, 5, null, "#b9c4ec"); q.set(4, 4, W).set(5, 3, W).set(3, 5, W) },
        at: u => ({ x: 45 - 5 * E.sin(u), y: 12 + 3 * E.sin(u, 2), r: -4 * E.sin(u) }) }
    ]
  });

  /* ===== les2-2 Strategic Thinking: bidak catur, peta berlipat dengan jalur putus-putus ke bendera, kompas ===== */
  const bz = t => { const P = [[27, 22], [37, 3], [50, 31], [63, 11]], s = 1 - t; return [0, 1].map(i => s * s * s * P[0][i] + 3 * s * s * t * P[1][i] + 3 * s * t * t * P[2][i] + t * t * t * P[3][i]) };
  GLPIX.def("les2-2", {
    w: 90, h: 30, dur: 4.5, still: .5,
    base(p, c) {
      /* bidak besar */
      shape(p, 0, 0, 20, 29, (x, y) => (x - 10) ** 2 + (y - 8) ** 2 <= 10.5 || (y >= 11 && y <= 12 && x >= 6 && x <= 14) || (y >= 13 && y <= 21 && Math.abs(x - 10) <= 2 + (y - 13) * .45) || (y >= 22 && y <= 25 && x >= 3 && x <= 17), W);
      p.shade({ [W]: WD }, [0, 0, 21, 30], 1); p.set(8, 6, Y).set(9, 6, Y).set(8, 7, Y); p.line(4, 26, 16, 26, p.dk(c, .3));
      /* peta */
      p.rect(23, 4, 48, 25, p.dk(c, .3));
      [W, "#e3eaff", W].forEach((col, k) => p.rect(22 + 16 * k, 3, 16, 25, col));
      p.rect(22, 3, 48, 25, null, K);
      p.poly([[29, 12], [33, 6], [37, 12]], T, K); p.set(33, 7, W).set(32, 8, W).set(34, 8, W);
      p.poly([[49, 13], [52, 9], [55, 13]], T, K); p.set(52, 10, W);
      [[37, 23], [42, 24], [60, 22]].forEach(([x, y]) => { p.rect(x - 1, y + 1, 3, 3, BR, K); p.circ(x, y - 1, 2, T, K); p.set(x - 1, y - 2, p.lt(T, .4)) });
      node(p, 44, 6, 2, Y, YD);
      let last = null, n = 0;
      for (let t = 0; t <= 1; t += .002) { const [x, y] = bz(t).map(Math.round), k = x + "," + y; if (k === last) continue; last = k; if (n++ % 4 < 2) p.set(x, y, "#5b3fd6") }
      node(p, 27, 22, 2, O, OD);
      p.line(63, 4, 63, 12, K); p.set(62, 12, K).set(64, 12, K);
      /* kompas */
      p.circ(80, 15, 7, W, K); p.circ(80, 15, 5, null, WD); p.shade({ [W]: WD }, [73, 8, 15, 15], 1);
      p.set(80, 9, K).set(80, 21, K).set(74, 15, K).set(86, 15, K);
      p.text(79, 1, "N", W);
    },
    parts: [
      { w: 8, h: 5, ax: 0, ay: 0,
        draw: q => { q.poly([[0, 0], [7, 2], [0, 4]], O, K); q.set(1, 1, q.lt(O, .4)) },
        at: u => ({ x: 64, y: 4, sx: 1 - .14 * (.5 + .5 * E.sin(u, 3)) }) },
      { w: 5, h: 13, ax: 2, ay: 6,
        draw: q => { q.poly([[2, 0], [4, 6], [0, 6]], O, K); q.poly([[0, 6], [4, 6], [2, 12]], G, K); q.set(2, 6, K) },
        at: u => ({ x: 80, y: 15, r: 16 * E.sin(u) }) },
      { w: 5, h: 7, ax: 2, ay: 6,
        draw: q => q.spr(0, 0, [".KKK.", "KYWYK", "KYYYK", ".KYK.", ".KYK.", "KYYYK", "KKKKK"], { K, Y, W }),
        at: u => { const t = E.io(E.seg(u, .06, .74)), [x, y] = bz(t), hop = 1.6 * Math.abs(Math.sin(Math.PI * 5 * t));
          return { x, y: y - 1 - hop, o: Math.min(E.seg(u, 0, .06), 1 - E.seg(u, .86, .96)) } } }
    ]
  });

  /* ===== les2-3 Reflective Thinking: cermin tangan, jurnal spiral yang sedang ditulis, siklus Kolb berputar ===== */
  const LN = [[48, 8, 10], [48, 11, 8], [48, 14, 11], [48, 17, 7], [48, 20, 9]], TOT = LN.reduce((a, l) => a + l[2], 0);
  const prog = u => E.seg(u, .05, .78) * TOT;
  const head = v => { for (const [x, y, l] of LN) { if (v <= l) return [x + v, y]; v -= l } const [x, y, l] = LN[LN.length - 1]; return [x + l, y] };
  GLPIX.def("les2-3", {
    w: 90, h: 30, dur: 5, still: .8,
    base(p, c) {
      /* cermin */
      p.stick(12, 20, 12, 27, BR); p.set(12, 27, BD);
      p.ell(12, 12, 6, 8, O, K); p.ell(12, 12, 4, 6, GLS, K); p.shade({ [O]: OD }, [5, 3, 15, 19], 1);
      p.set(10, 11, K).set(14, 11, K).set(10, 14, K).set(11, 15, K).set(12, 15, K).set(13, 15, K).set(14, 14, K);
      p.set(10, 8, W).set(11, 7, W).set(9, 9, W);
      p.star(21, 5, W, 1);
      /* jurnal */
      p.rect(29, 5, 34, 24, p.dk(c, .3)); p.rect(28, 4, 34, 24, O, K, 1);
      p.rect(29, 3, 16, 23, W, K); p.rect(46, 3, 16, 23, W, K); p.shade({ [W]: WD }, [29, 3, 33, 23], 1);
      [[8, 11], [11, 9], [14, 12], [17, 8], [20, 10]].forEach(([y, l]) => p.line(32, y, 32 + l - 1, y, G));
      for (let y = 5; y <= 22; y += 4) p.rect(43, y, 5, 3, Y, K, 1);
    },
    parts: [
      { w: 90, h: 30, ax: 0, ay: 0, frames: TOT + 1,
        draw(q, c, f) { let v = f; for (const [x, y, l] of LN) { const n = Math.min(l, v); if (n > 0) q.line(x, y, x + n - 1, y, "#5b3fd6"); v -= n } },
        at: u => ({ x: 0, y: 0, f: Math.floor(prog(u)), o: 1 - E.seg(u, .86, .96) }) },
      { w: 10, h: 10, ax: 0, ay: 9,
        draw: q => { q.stick(2, 7, 8, 1, Y); q.set(8, 1, PK).set(9, 0, K).set(1, 8, SK).set(0, 9, K) },
        at: u => { const w = u < .78 && u > .05, [hx, hy] = head(prog(u)), back = E.io(E.seg(u, .84, 1)), [sx, sy] = head(0);
          const x = u < .82 ? hx : E.lerp(hx, sx, back), y = (u < .82 ? hy : E.lerp(hy, sy, back)) - (w ? .6 + .6 * E.sin(u, 40) : 2 * Math.sin(Math.PI * back));
          return { x, y: y - (u > .78 && u < .82 ? 1 : 0) } } },
      { w: 25, h: 25, ax: 12, ay: 12,
        draw(q) {
          [0, 90, 180, 270].forEach(d => { stroke(q, arcPts(12, 12, 8, 8, d + 22, d + 60, 20), W); const a = (d + 64) * Math.PI / 180; tri(q, 12 + 8 * Math.cos(a), 12 + 8 * Math.sin(a), -Math.sin(a), Math.cos(a), Y) });
          [[0, O, OD], [90, Y, YD], [180, T, TD], [270, PK, PKD]].forEach(([d, col, dc]) => { const a = d * Math.PI / 180; node(q, Math.round(12 + 8 * Math.cos(a)), Math.round(12 + 8 * Math.sin(a)), 3, col, dc) });
        },
        at: u => ({ x: 77, y: 15, r: 90 * u }) }
    ]
  });

  /* ===== les2-4 Creative Thinking: bola lampu menyala, ide-ide terhubung, percikan mengalir ===== */
  const BX = 45, BY = 12, NL = [13, 9], NR = [77, 9];
  const spark = (to, a) => ({ w: 7, h: 7, ax: 3, ay: 3,
    draw: q => { q.star(3, 3, Y, 1); q.rect(2, 2, 3, 3, Y); q.set(3, 3, W) },
    at: u => { const s = E.seg(u, a, a + .38), t = E.io(s), sx = BX + (to[0] - BX) * .22, sy = BY + (to[1] - BY) * .22;
      return { x: E.lerp(sx, to[0], t), y: E.lerp(sy, to[1], t), o: Math.sin(Math.PI * s) > .05 ? 1 : 0, s: .7 + .3 * Math.sin(Math.PI * s) } } });
  GLPIX.def("les2-4", {
    w: 90, h: 30, dur: 4, still: .3,
    base(p, c) {
      const L = [[NL, [5, 20]], [NL, [24, 22]], [NR, [85, 20]], [NR, [67, 22]], [[BX, BY], NL], [[BX, BY], NR], [[BX, BY], [24, 22]], [[BX, BY], [67, 22]]];
      L.forEach(([[a, b], [d, e]]) => p.line(a, b, d, e, W));
      node(p, NL[0], NL[1], 4, O, OD); node(p, NR[0], NR[1], 4, T, TD);
      node(p, 24, 22, 3, W, WD); node(p, 67, 22, 3, PK, PKD);
      node(p, 5, 20, 2, Y, YD); node(p, 85, 20, 2, O, OD);
      /* bola lampu */
      p.circ(BX, BY, 8, Y, K); p.rect(BX - 4, BY + 6, 9, 3, Y); p.line(BX - 4, BY + 6, BX - 4, BY + 9, K); p.line(BX + 4, BY + 6, BX + 4, BY + 9, K);
      p.shade({ [Y]: YD }, [BX - 8, BY - 8, 17, 18], 1);
      p.rect(BX - 4, BY + 9, 9, 6, "#c3cae6", K); p.line(BX - 3, BY + 11, BX + 3, BY + 11, "#8a93b8"); p.line(BX - 3, BY + 13, BX + 3, BY + 13, "#8a93b8");
      p.rect(BX - 2, BY + 15, 5, 2, K);
      p.line(BX - 2, BY + 6, BX - 2, BY + 2, OD); p.line(BX + 2, BY + 6, BX + 2, BY + 2, OD);
      p.set(BX - 2, BY + 1, O).set(BX - 1, BY, O).set(BX, BY + 1, O).set(BX + 1, BY, O).set(BX + 2, BY + 1, O);
      p.set(BX - 5, BY - 4, W).set(BX - 4, BY - 5, W).set(BX - 5, BY - 3, W).set(BX - 3, BY - 6, W);
    },
    parts: [
      { w: 25, h: 25, ax: 12, ay: 12,
        draw(q) { [-90, -45, 0, 45, 135, 180, 225].forEach(d => { const a = d * Math.PI / 180; q.line(12 + 10 * Math.cos(a), 12 + 10 * Math.sin(a), 12 + 12 * Math.cos(a), 12 + 12 * Math.sin(a), W) }) },
        at: u => ({ x: BX, y: BY, o: .3 + .7 * (.5 + .5 * E.sin(u, 2)) }) },
      spark(NL, .08), spark(NR, .55)
    ]
  });
})();
