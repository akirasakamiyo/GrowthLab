/* Aset pixel simulasi (2026-11-14): tokoh 64x64 dan latar 320x150, digambar per piksel dengan GLPIX.grid.
   Dipakai oleh js/34-sim-pixel.js. Satu blok per aset. */

/* ===== hero ===== */
/* Tokoh "hero" pixel art 64x64 (preview, tools/_simpx). Putaran 3: 9 animasi + variasi kostum.
   - Kepala+rambut, wajah (mata, alis, mulut), torso, tangan, sepatu, kartu ID adalah PETA PIKSEL TANGAN
     (baris string + huruf palet). Kode hanya menaruhnya di posisi per frame. Lengan & kaki = tabung berpita
     tetap (pola kolom tangan) yang ditarik dari titik sendi; lebarnya dijaga konstan per baris supaya lengan
     miring tidak bergerigi.
   - Tiap bagian depan memberi garis dalam berwarna (rim) di atas bagian di belakangnya.
   - Garis tepi luar otomatis 1 px: sisi kiri/atas = versi gelap warna bidang, sisi kanan/bawah = navy.
   - Bagian jauh (lengan/kaki/sepatu kanan) memakai palet satu tingkat lebih gelap.
   - draw(g, f, opt): opt.lan === true menambah tali lanyard + kartu ID di dada (ikut gerak torso).
   - shirtRamp: semua hex kemeja teal (terang -> gelap, termasuk garis tepi gelap kemeja). Hex ini tidak dipakai
     bagian lain, jadi panggung boleh menukarnya. shirtRamps berisi ramp pengganti siap pakai (biru, oranye). */
(() => {
  const NV = "#1b1740";
  const PAL = {
    /* kulit */ A: "#ffe0b8", a: "#f2c597", s: "#e2a97e", d: "#c27e66", e: "#94565a", k: "#7a4048", b: "#ee907e",
    /* rambut */ i: "#a0714a", H: "#71482f", h: "#4a2e22", j: "#2b1830",
    /* kemeja teal */ T: "#5fcfb5", t: "#22a39a", u: "#19788a", v: "#1a4f6e",
    /* kerah */ l: "#c4f2df", c: "#7fdcc3", C: "#3fb0a2",
    /* celana */ P: "#6c7db3", p: "#3d4c80", q: "#2e386b", Q: "#232a55",
    /* sepatu */ W: "#fffaf0", Y: "#e9dcc4", X: "#bfa9b0", r: "#e8735a", R: "#b0505c",
    /* mata, mulut */ N: NV, V: "#3d2c7a", I: "#7b62c4", L: "#ab95ea", m: "#7c3445", o: NV,
    /* lanyard: tali kuning, kartu */ G: "#ffc83d", g: "#d68a2e", n: "#8fb0e6", z: "#5d6fae",
    /* marah: flush merah; air mata: sorot putih kebiruan + badan biru */
    F: "#e8606a", f: "#c4445e", U: "#e6f6ff", O: "#7cc0ee"
  };
  /* urut terang -> gelap; v juga dipakai sebagai garis tepi gelap kemeja */
  const SHIRT = ["l", "c", "T", "C", "t", "u", "v"].map(k => PAL[k]);
  /* satu tingkat lebih gelap untuk bagian jauh */
  const FAR = { A: "a", a: "s", s: "d", d: "e", e: "e", k: "k", b: "d", i: "H", H: "h", h: "j", j: "j", T: "t", t: "u", u: "v", v: "v", l: "c", c: "C", C: "u", P: "p", p: "q", q: "Q", Q: "Q", W: "Y", Y: "X", X: "X", r: "R", R: "R" };
  const MAT = {}; const mats = { skin: "AasdekbmNVILFfUO", hair: "iHhj", teal: "TtuvlcC", pants: "PpqQ", shoe: "WYX", sole: "rR", lan: "Ggnz" };
  for (const [k, s] of Object.entries(mats)) for (const ch of s) MAT[ch] = k;
  /* warna garis tepi sisi terang per bahan (versi gelap bidang) */
  const LITO = { skin: "#8a4b52", hair: "#24132a", teal: PAL.v, pants: NV, shoe: "#7f6f90", sole: "#7d3552", lan: "#8a4b52" };

  /* peta dari [kolomMulai, "isi"] per baris */
  const map = (rows) => rows.map(r => r ? " ".repeat(r[0]) + r[1] : "");

  /* ======================= PETA TANGAN ======================= */
  /* kepala + rambut (24 x 22), hadap 3/4 kanan. tanpa garis tepi luar (dibuat otomatis). */
  const HEAD = map([
    [14, "h"],
    [8, "H...hh"],
    [8, "hH.hhhh"],
    [7, "hHHhhhhhhh"],
    [5, "hhHiiiHhhhhhhh"],
    [4, "hHiiHHhhhhhhhhjj"],
    [3, "hHiHhhhhhhhhhhhjj"],
    [3, "HiHhhhhhhhhhhhhhjj"],
    [2, "hHhhhhhHHhhhjHHhhjj"],
    [2, "hhhhhhjhhHHhdhhHhjj"],
    [2, "hhhhhhddhhhHsddhHdj"],
    [2, "hhjjjhssddhhsssdjsd"],
    [2, "hjddjjssssdjssssdsd"],
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
  /* varian jambul (baris 0-2) untuk rambut yang ikut bergoyang; 2 = condong kanan (geleng) */
  const TUFT = [
    map([[14, "h"], [8, "H...hh"], [8, "hH.hhhh"]]),
    map([[13, "h"], [7, "H....hh"], [8, "hH.hhhh"]]),
    map([[15, "h"], [9, "H..hh"], [8, "hH.hhhh"]])
  ];
  /* mata dekat 4x5 & mata jauh 3x5 (relatif kepala, mulai baris 13) */
  const EYE = {
    open: { n: ["NNNN", "NWNN", "NWVN", "NIIN", " LL "], f: ["NNN", "WNN", "WVN", "IIN", "LL "], lash: 1 },
    up: { n: ["NNNN", "NIVN", "NLIN", "NWWN", " NN "], f: ["NNN", "IVN", "LIN", "WWN", "NN "] },
    blink: { n: ["    ", "    ", "N  N", " NN ", "    "], f: ["   ", "   ", "N  ", " NN", "   "] },
    happy: { n: ["    ", " NN ", "N  N", "N  N", "    "], f: ["   ", " NN", "N  ", "N  ", "   "] },
    /* kaget: mata bulat putih, pupil kecil, satu baris lebih tinggi */
    wide: { n: [" NN ", "NWWN", "NWNN", "NWNN", "NWWN", " NN "], f: [" N ", "WWN", "WNN", "WNN", "WWN", " N "], dy: -1 },
    /* sedih: kelopak turun, menatap ke bawah */
    sad: { n: ["    ", "NNNN", "NNVN", "NIIN", " LL "], f: ["   ", "NNN", "NVN", "IIN", "LL "] },
    /* marah: kelopak miring turun ke arah hidung */
    angry: { n: ["N   ", "NNN ", "NWNN", "NIVN", " NN "], f: ["  N", " NN", "NWN", "IVN", "NN "] },
    /* ragu: kelopak setengah, datar */
    flat: { n: ["    ", "NNNN", "NWVN", "NIIN", " LL "], f: ["   ", "NNN", "WVN", "IIN", "LL "], lash: 1 },
    /* lirik (geleng): iris + titik sorot digeser ke arah gerak kepala */
    lookL: { n: ["    ", "NNNN", "WVNN", "IINN", "LL  "], f: ["   ", "NNN", "WVN", "IIN", "LL "], lash: 1 },
    lookR: { n: ["    ", "NNNN", "NNWV", "NNII", "  LL"], f: ["   ", "NNN", "NWV", "NII", " LL"], lash: 1 }
  };
  /* alis (relatif kepala). kulit di bawahnya (S) ikut dicat supaya alis tidak tenggelam di poni */
  const BROW = {
    think: { px: [[9, 12], [10, 12], [11, 12], [12, 12], [16, 11], [17, 10], [18, 10]], sk: [[16, 12], [17, 11], [18, 11], [17, 12], [18, 12]] },
    /* sedih: ujung dalam (dekat hidung) naik tajam, ujung luar turun; warna tergelap supaya lepas dari poni */
    sad: { c: "j", px: [[8, 12], [9, 12], [10, 12], [11, 11], [12, 10], [16, 10], [17, 11], [18, 12]], sk: [[8, 11], [9, 11], [10, 11], [11, 10], [12, 11], [11, 12], [12, 12], [16, 11], [17, 10], [17, 12], [18, 11], [16, 12]] },
    /* marah: V tebal 2 px, ujung dalam menekan ke mata */
    angry: { c: "j", px: [[8, 11], [9, 11], [8, 12], [9, 12], [10, 12], [11, 12], [10, 13], [11, 13], [12, 13], [16, 12], [17, 12], [16, 13], [17, 11], [18, 11], [18, 12], [19, 11]],
      sk: [[8, 10], [9, 10], [10, 11], [11, 11], [12, 12], [12, 11], [13, 12], [15, 12], [16, 11], [17, 10], [18, 10]] },
    worry: { px: [[9, 12], [10, 12], [11, 11], [12, 11], [16, 11], [17, 11], [18, 12]], sk: [[9, 11], [10, 11], [18, 11]] },
    high: { px: [[9, 10], [10, 10], [11, 10], [12, 11], [16, 11], [17, 10], [18, 10]], sk: [[9, 11], [10, 11], [11, 11], [9, 12], [10, 12], [11, 12], [12, 12], [16, 12], [17, 11], [18, 11], [17, 12], [18, 12]] }
  };
  const MOUTH = {
    smile: [[12, 19, "m"], [13, 20, "m"], [14, 20, "m"], [15, 19, "m"]],
    grin: [[12, 19, "m"], [13, 19, "m"], [14, 19, "m"], [15, 19, "m"], [16, 19, "m"], [12, 20, "m"], [13, 20, "W"], [14, 20, "W"], [15, 20, "r"], [16, 20, "m"], [13, 21, "m"], [14, 21, "r"], [15, 21, "m"]],
    hmm: [[12, 20, "m"], [13, 20, "m"], [14, 19, "m"], [15, 19, "m"]],
    flat: [[12, 20, "m"], [13, 20, "m"], [14, 20, "m"], [15, 20, "k"]],
    wavy: [[12, 20, "m"], [13, 19, "m"], [14, 20, "m"], [15, 20, "k"]],
    frown: [[12, 20, "m"], [13, 19, "m"], [14, 19, "m"], [15, 20, "m"]],
    /* sedih: lengkung turun 3 px + bibir bawah gelap */
    pout: [[12, 20, "m"], [13, 19, "m"], [14, 20, "m"], [13, 20, "e"]],
    O: [[13, 19, "m"], [14, 19, "m"], [12, 20, "m"], [13, 20, "o"], [14, 20, "k"], [15, 20, "m"], [13, 21, "m"], [14, 21, "m"]],
    o: [[13, 20, "m"], [14, 20, "m"], [13, 21, "m"], [14, 21, "k"]],
    grit: [[12, 19, "m"], [13, 19, "m"], [14, 19, "m"], [15, 19, "m"], [16, 19, "m"], [12, 20, "m"], [13, 20, "W"], [14, 20, "Y"], [15, 20, "W"], [16, 20, "m"], [13, 21, "m"], [14, 21, "m"], [15, 21, "m"]]
  };
  /* torso (17 x 16), kemeja teal berkerah */
  const TORSO = map([
    [4, "lccsssdcc"],
    [2, "TllllcsdclcCu"],
    [1, "TTclllcCdccCuuv"],
    [1, "TtuCcccCCcCuttu"],
    [1, "TttuCcCuuCutttu"],
    [1, "Ttttuuuuuuttuuu"],
    [1, "Ttttttttctttuuu"],
    [1, "tttuttttuttuuuu"],
    [1, "ttttuttttttuuuu"],
    [1, "tttttutttttuuuu"],
    [1, "ttttttttttttuuu"],
    [1, "ttttttttctutuuu"],
    [1, "ttttttttuutuuuu"],
    [1, "tttttttttttuuuu"],
    [1, "ttttttttttuuuuu"],
    [1, "tttttttttuuuuuv"]
  ]);
  /* lanyard relatif torso: dua tali dari kerah, bertemu di klip, kartu 5x5 (foto + baris nama + strip koral) */
  const LANYARD = map([
    null,
    [5, "G....g"],
    [5, "G....g"],
    [6, "G..g"],
    [6, "G..g"],
    [7, "Gg"],
    [7, "zz"],
    [5, "WWWWY"],
    [5, "WnnXY"],
    [5, "WnzWY"],
    [5, "WXXXY"],
    [5, "rrrrR"]
  ]);
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
    const rows = HEAD.slice(); const tu = TUFT[P.tuft || 0]; rows[0] = tu[0]; rows[1] = tu[1]; rows[2] = tu[2];
    const px = spr(rows, x, y);
    const F2 = P.face || {}, E = EYE[F2.eyes || "open"], [ox, oy] = F2.off || [0, 0], fx = x + ox, fy = y + oy;
    /* geser wajah (menoleh/menunduk): isi celah dengan kulit dulu supaya tidak bolong */
    if (ox || oy) for (let j = 11; j <= 21; j++) for (let i = 3; i <= 19; i++) { const ch = rows[j] && rows[j][i]; if (ch === "s" && rows[j - oy] && rows[j - oy][i - ox] === "s") { } }
    const B = BROW[F2.brow];
    if (B) { for (const [bx, by] of B.sk) px.push([fx + bx, fy + by, "s"]); }
    px.push(...spr(E.n, fx + 9, fy + 13 + (E.dy || 0)), ...spr(E.f, fx + 16, fy + 13 + (E.dy || 0)));
    if (E.lash) px.push([fx + 8, fy + 13, "N"]);
    if (B) for (const [bx, by] of B.px) px.push([fx + bx, fy + by, B.c || "h"]);
    px.push([fx + 15, fy + 17, "d"]); /* hidung: satu piksel bayangan di dalam wajah */
    if (F2.flush === 2) px.push([fx + 7, fy + 18, "f"], [fx + 8, fy + 18, "F"], [fx + 9, fy + 18, "F"], [fx + 10, fy + 18, "F"], [fx + 11, fy + 18, "f"], [fx + 8, fy + 19, "f"], [fx + 9, fy + 19, "f"],
      [fx + 16, fy + 18, "f"], [fx + 17, fy + 18, "F"], [fx + 18, fy + 18, "F"], [fx + 17, fy + 19, "f"]);
    else if (F2.flush) px.push([fx + 8, fy + 18, "b"], [fx + 9, fy + 18, "b"], [fx + 10, fy + 18, "b"], [fx + 17, fy + 18, "b"], [fx + 18, fy + 18, "b"], [fx + 9, fy + 17, "b"]);
    else px.push([fx + 8, fy + 18, "b"], [fx + 9, fy + 18, "b"], [fx + 18, fy + 18, "b"]);
    for (const [mx, my, ch] of MOUTH[F2.mouth || "smile"]) px.push([fx + mx, fy + my, ch]);
    /* air mata 1x2 menempel di pipi bawah mata dekat: t = baris turun (0 = baru menetes dari kelopak) */
    if (F2.tear != null) { const ty = fy + 18 + F2.tear; px.push([fx + 10, ty, "U"], [fx + 10, ty + 1, "O"]) }
    F.draw(px, { grp: "head", rim: "o", rimSkip: (X, Y, dx, dy) => dy !== 1 });
  }

  /* ======================= RENDER ======================= */
  function render(g, P) {
    const F = Fig(g.W, g.H), J = P.jump || 0, B = P.by || 0, TX = P.tx || 0;
    /* bayangan tanah: elips padat 3 baris, tanpa alfa */
    /* bayangan tanah: navy transparan (warna latar ikut tembus, jadi tidak "menyala" di karpet ungu / kamar malam).
       dua tingkat bertepi keras: inti lebih pekat, tepi lebih tipis; tanpa gradasi halus */
    const sw = P.shadow ?? 13, SH = "rgba(27,23,64,.42)", SHL = "rgba(27,23,64,.24)";
    for (let y = 61; y <= 63; y++) { const hw = y === 62 ? sw : y === 61 ? sw - 2 : sw - 4, core = y === 62 ? sw - 3 : hw - 2; for (let x = 32 - hw; x <= 32 + hw; x++) g.set(x, y, Math.abs(x - 32) <= core ? SH : SHL) }
    const A = P.arms;
    arm(F, A.f.sh, A.f.el, A.f.wr, A.f.hand, 1, TX);
    leg(F, [34, 45 + B + J], P.legs.f.a, P.legs.f.s, 1);
    F.draw(spr(HIP, 24, 42 + B + J), { grp: "pants" });
    leg(F, [28, 45 + B + J], P.legs.n.a, P.legs.n.s, 0);
    const tox = 23 + TX, toy = 28 + B + J - (P.breath || 0);
    F.draw(spr(TORSO, tox, toy), { grp: "torso", rim: "v", rimSkip: (X, Y, dx, dy) => dy !== 1 });
    if (P.lan) F.draw(spr(LANYARD, tox, toy), { grp: "lan", rim: "v", rimSkip: (X, Y) => Y < toy + 7 });
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
  const lan = o => !!(o && o.lan);

  const idle = {
    fps: 8, frames: 8, draw(g, f, o) {
      const br = [0, 0, 1, 1, 1, 1, 0, 0][f], hb = [0, 0, 0, 1, 1, 1, 1, 0][f]; /* kepala tertinggal 1 frame dari dada */
      render(g, { lan: lan(o), breath: br, hy: -hb, arms: armsAt(-br), legs: standLegs(), tuft: [0, 0, 0, 0, 1, 1, 1, 0][f],
        face: { eyes: f === 6 ? "blink" : "open", mouth: "smile" } });
    }
  };

  /* walk: contact, down, passing, up (x2). [ankle x, y, sepatu] */
  const WK = [
    { b: 0, n: [34, 57, "heel"], f: [26, 56, "toe"], s: -5 },
    { b: 1, n: [32, 57, "flat"], f: [27, 54, "toe"], s: -3 },
    { b: 0, n: [29, 57, "flat"], f: [33, 53, "flat"], s: 0 },
    { b: -1, n: [26, 56, "toe"], f: [37, 55, "heel"], s: 3 },
    { b: 0, n: [24, 56, "toe"], f: [38, 56, "heel"], s: 5 },
    { b: 1, n: [26, 54, "toe"], f: [35, 56, "flat"], s: 3 },
    { b: 0, n: [31, 54, "flat"], f: [32, 56, "flat"], s: 0 },
    { b: -1, n: [35, 56, "heel"], f: [29, 55, "toe"], s: -3 }
  ];
  const walk = {
    fps: 10, frames: 8, draw(g, f, o) {
      const k = WK[f], kp = WK[(f + 7) % 8], s = k.s;
      const A = { n: { sh: [25, 31 + k.b], el: [24 + s * .45, 36 + k.b], wr: [24 + s, 40 + k.b - Math.abs(s) * .15], hand: "open" },
        f: { sh: [38, 31 + k.b], el: [39 - s * .4, 36 + k.b], wr: [40 - s * .9, 40 + k.b - Math.abs(s) * .15], hand: "open" } };
      render(g, { lan: lan(o), by: k.b, hy: kp.b - k.b, arms: A, legs: { n: { a: [k.n[0], k.n[1] + 0], s: k.n[2] }, f: { a: [k.f[0], k.f[1]], s: k.f[2] } },
        tuft: kp.b > 0 ? 1 : 0, face: { eyes: "open", mouth: "smile" } });
    }
  };

  /* nod: angguk 2x (turun cepat, naik pelan), wajah ikut menunduk 1 px, senyum; mata terpejam senang di titik terendah */
  const nod = {
    fps: 8, frames: 6, draw(g, f, o) {
      const hy = [0, 2, 1, 0, 2, 1][f], fy = [0, 1, 0, 0, 1, 0][f], br = [0, 0, 1, 0, 0, 1][f];
      render(g, { lan: lan(o), breath: br, hy, arms: armsAt(-br), legs: standLegs(), tuft: [1, 0, 0, 1, 0, 0][f],
        face: { eyes: hy === 2 ? "happy" : "open", mouth: "smile", off: [0, fy] } });
    }
  };

  /* shake: geleng 2x. kepala + wajah bergeser kiri/kanan, jambul tertinggal berlawanan, mulut datar ragu */
  /* kepala menyapu kiri-kanan +-2 px; pupil melirik ke arah gerak berikutnya (memimpin),
     jambul ikut kecepatan frame sebelumnya (tertinggal 1 frame); dada ikut sedikit berlawanan */
  const SHX = [-2, -1, 1, 2, 1, -1];
  const shake = {
    fps: 8, frames: 6, draw(g, f, o) {
      const hx = SHX[f], vNext = SHX[(f + 1) % 6] - hx, vPrev = hx - SHX[(f + 5) % 6];
      const ox = Math.abs(hx) === 2 ? Math.sign(hx) : 0;
      render(g, { lan: lan(o), hx, arms: armsAt(0), legs: standLegs(), tuft: vPrev > 0 ? 1 : 2, breath: Math.abs(hx) === 2 ? 0 : 1,
        face: { eyes: vNext > 0 ? "lookR" : "lookL", brow: "worry", mouth: f % 3 === 0 ? "flat" : "wavy", off: [ox, 0] } });
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
        lan: lan(o), by: k.b, jump: k.j, hy: k.hy, legs, shadow: k.sh, tuft: air ? 1 : 0,
        arms: {
          n: { sh: [25, 31 + b], el: [L(24, 21), L(36, 35) + b], wr: [L(24, 21), L(40, 30) + b], hand: "open" },
          f: { sh: [38, 31 + b], el: [L(39, 42), L(36, 35) + b], wr: [L(40, 43), L(40, 30) + b], hand: "open" }
        },
        face: { eyes: "wide", brow: "high", mouth: "O" },
        fx(g) { exclaim(g, 45, Math.max(0, 2 + k.j) + (k.ex === 1 ? 2 : 0), k.ex) }
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
      /* air mata: menggenang di kelopak (f1), lalu turun menempel di pipi 1 px per frame, hilang di rahang */
      const tear = [null, -1, 0, 0, 1, 1, 2, null][f];
      render(g, {
        lan: lan(o), by: 2, breath: br, hy: 4 - hb + (br < 0 ? 1 : 0), hx: 1, legs: standLegs(), tuft: 0,
        arms: { n: { sh: [25, 34 - br], el: [25, 39], wr: [26, 44], hand: "open" }, f: { sh: [38, 34 - br], el: [38, 39], wr: [38, 44], hand: "open" } },
        face: { eyes: f === 7 ? "blink" : "sad", brow: "sad", mouth: br < 0 ? "o" : "pout", off: [0, 1], tear }
      });
    }
  };
  function puff(g, x, y, s) {
    const C = { N: "#5a5290", W: "#f3eefb", S: "#c9c0e4" };
    const R = s ? [" NNN ", "NWWSN", "NWSSN", " NNN "] : [" NN ", "NWSN", " NN "];
    R.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== " ") g.set(x + i, y + j, C[ch]) }));
  }

  /* angry: dada membusung, bahu naik, kepalan di samping, gemetar 1 px, alis menukik, urat kesal berdenyut */
  const angry = {
    fps: 10, frames: 6, draw(g, f, o) {
      /* badan condong 1 px ke depan (kanan), kepala 1 px lagi; gemetar 1 px di kepala; kepalan dekat naik ke depan dada dan menghentak */
      const tx = 1, hx = 1 + [0, 1, 0, 1, 0, 1][f], pulse = [1, 1, 0, 0, 1, 0][f], pump = [0, 1, 0, 0, 1, 0][f];
      render(g, {
        lan: lan(o), breath: 1, tx, hx, hy: -1, legs: { n: { a: [26, 57], s: "flat" }, f: { a: [37, 56], s: "flat" } },
        arms: { n: { sh: [25, 30], el: [24, 37], wr: [31, 34 + pump], hand: "fist" }, f: { sh: [38, 30], el: [41, 35], wr: [41, 39], hand: "fist" } },
        face: { eyes: "angry", brow: "angry", mouth: "grit", flush: 2 },
        fx(g) {
          vein(g, 37 + tx + hx, 3, pulse);
          /* garis kesal: tiga goresan pendek di kiri kepala, bergantian */
          const Z = "#ef5b5b", ZD = "#a8324a";
          const d = f % 2, L3 = [[[17, 9], [16, 8], [15, 7]], [[15, 12], [14, 12], [13, 12]], [[16, 15], [15, 16], [14, 17]]];
          L3.forEach(st => st.forEach(([x, y], i) => g.set(x - d, y, i === 2 ? ZD : Z)));
        }
      });
    }
  };
  /* urat kesal (tanda silang anime): empat busur merah yang melengkung ke arah tengah, berdenyut besar/kecil */
  function vein(g, x, y, big) {
    const C = { R: "#ef5b5b", D: "#a8324a", N: NV };
    const R = big
      ? [".N...N.", "NRN.NRN", ".RD.DR.", ".......", ".RD.DR.", "NRN.NRN", ".N...N."]
      : [".......", ".N...N.", ".RN.NR.", "..D.D..", ".RN.NR.", ".N...N.", "......."];
    R.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== ".") g.set(x + i, y + j, C[ch]) }));
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
        lan: lan(o), by: k.b, jump: k.j, hy: k.hy, legs, shadow: k.sh, tuft: k.j < 0 ? 1 : 0,
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
        lan: lan(o), breath: br, hy: -hb, legs: standLegs(), armLate: 1, tuft: hb,
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

  /* ramp pengganti kemeja (urutan sama dengan shirtRamp): bayangan bergeser ke ungu, sorotan ke kuning hangat */
  const shirtRamps = {
    teal: SHIRT.slice(),
    biru: ["#eef4ff", "#c4dcff", "#acd0ff", "#9cc6ff", "#8fc1ff", "#6688d6", "#3f4a96"],
    oranye: ["#fff0c4", "#ffd389", "#ffbc66", "#ffae55", "#ff9f43", "#d9673f", "#93394c"]
  };

  SIMPX.char("hero", {
    w: 64, h: 64, shirtRamp: SHIRT, shirtRamps,
    anims: { idle, walk, nod, shake, surprised, sad, happy, angry, thinking }
  });
})();

/* ===== ibu ===== */
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

/* ===== teman ===== */
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

/* ===== atasan ===== */
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

/* ===== rekan ===== */
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

/* ===== rekan2 ===== */
/* Tokoh "rekan2" pixel art 64x64 (preview, tools/_simpx). Teknik sama persis dengan hero.js:
   - Kepala + rambut coklat sebahu (poni samping, ujung rambut jatuh di bahu dan ikut berayun), wajah, kacamata bulat,
     torso (blus ungu berkerah bulat, pinggang ramping, kelim melebar), lanyard koral + kartu ID, tangan, sepatu flat
     = PETA PIKSEL TANGAN. Lengan = tabung berpita: lengan blus 3/4 (kelim terang di bawah siku), lengan bawah kulit.
   - Garis tepi luar 1 px: kiri/atas = versi gelap warna bidang, kanan/bawah = navy. Bagian jauh satu tingkat lebih gelap.
   Proporsi sama dengan hero. Alis tipis hanya tampak di bagian dahi yang tidak tertutup poni. */
(() => {
  const NV = "#1b1740", TALL = 0;
  const PAL = {
    /* kulit */ A: "#fde6c8", a: "#f6cfa6", s: "#e8b48a", d: "#c98a6c", e: "#9a5c62", k: "#6e3a4a", b: "#f39a8a",
    /* rambut coklat */ i: "#b98456", H: "#865636", h: "#5a3a22", j: "#3a2128", f: "#2c1824",
    /* blus ungu */ l: "#f1dffb", c: "#d8b8f3", C: "#b993e3", T: "#bb8ae8", t: "#a06cd5", u: "#7b4cb6", v: "#523184",
    /* celana */ P: "#5a5a94", p: "#3d3d6b", q: "#2f2e5a", Q: "#222047",
    /* sepatu flat */ W: "#cf5d72", Y: "#9e3f60", X: "#6e2c50", r: "#4a2440", R: "#2e1830",
    /* mata, mulut */ N: NV, V: "#4a2a22", I: "#93603e", L: "#cf9f6e", m: "#b0485a", o: NV, w: "#fffaf0", x: "#e8735a",
    /* kacamata bulat plum */ g: "#6e3462", y: "#b77f93", G: "#fffaf0",
    /* lanyard koral + kartu ID */ "1": "#ff9c84", "2": "#d0606a", "9": "#5d6fae", "3": "#fffaf0", "4": "#e9dcc4", "0": "#bfa9b0", "5": "#8fb0e6", "6": "#5d6fae", "7": "#e8735a", "8": "#b0505c"
  };
  const FAR = { A: "a", a: "s", s: "d", d: "e", e: "e", k: "k", b: "d", i: "H", H: "h", h: "j", j: "j", f: "j",
    l: "c", c: "C", C: "u", T: "t", t: "u", u: "v", v: "v", P: "p", p: "q", q: "Q", Q: "Q", W: "Y", Y: "X", X: "X", r: "R", R: "R" };
  const MAT = {}; const mats = { skin: "AasdekbmNVILwxgyG", hair: "iHhjf", shirt: "lcCTtuv", pants: "PpqQ", shoe: "WYX", sole: "rR", lan: "1234567890" };
  for (const [k, s] of Object.entries(mats)) for (const ch of s) MAT[ch] = k;
  const LITO = { skin: "#8a4b52", hair: "#24121c", shirt: PAL.v, pants: NV, shoe: "#5a1f45", sole: NV, lan: "#8a3048" };

  const map = (rows) => rows.map(r => r ? " ".repeat(r[0]) + r[1] : "");

  /* ======================= PETA TANGAN ======================= */
  /* kepala + rambut sebahu (24 x 26), hadap 3/4 kanan. Kubah dengan pita kilau i, poni disapu ke kanan menutup
     separuh dahi, rambut menutup telinga, sisi jauh tampak di belakang rahang, ujung belakang jatuh di bahu.
     '.' = transparan (leher dari torso tampak). */
  const HEAD = map([
    null,
    [8, "hHHHhh"],
    [6, "hHHiiiHhhh"],
    [4, "hHHiiiiiHHhhh"],
    [3, "hHHiiiiiiHHhhhh"],
    [2, "hHHHHiiiiHHHhhhhj"],
    [2, "hHHHHHHHHHhhhhhhjj"],
    [1, "hhHHHHHHHhhhhhhhhhjj"],
    [1, "hhHHHHHhhhhhhhhhhhhjj"],
    [1, "hiHHHhhhhhhhhhhjdssjj"],
    [1, "hiHHhhhhhhhjdsssssdjj"],
    [1, "hiHHhhhhjdssssssssdjj"],
    [1, "hiHhhhjdssssssssssshj"],
    [1, "hHHhhjssssssssssssshj"],
    [1, "hHHhhjssssssssssssshj"],
    [1, "hHHjhjdsssssssssssdhj"],
    [1, "hHHjhjddsssssssssdhj"],
    [1, "hHhjhHjdsssssssssshj"],
    [1, "hHhjhHjdsssssssssdhj"],
    [1, "hHhjhHhjdssssssssdhj"],
    [1, "hHhjhHhjedssssssdhj"],
    [1, "hHhjhHhhjeddsddehj"],
    [1, "hHhjhHhhhj......jhj"],
    [1, "hHhhhhhhhj.......jj"],
    [1, "jhHhhhhhj"],
    [2, "jjhhhjj"]
  ]);
  /* ujung rambut (baris 22-25) berayun: 1 = tertinggal ke kiri, 2 = terayun ke kanan */
  const TUFT = [
    null,
    map([[0, "hhHhjhHhhhj......jhj"], [0, "hhHhjhhhhhj.......jj"], [0, "jhhHhhhhj"], [1, "jjhhhjj"]]),
    map([[1, "hHhjhHhhhj......jhj"], [2, "hHjhhhhhj.......jj"], [2, "jhHhhhhhj"], [3, "jjhhhjj"]])
  ];
  const TUFT_ROW = 22;
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
  /* alis tipis coklat (relatif kepala); hanya digambar di atas kulit dahi, sisanya tersembunyi di balik poni */
  const BROW = {
    calm: { px: [[11, 10], [12, 10], [13, 11], [16, 10], [17, 10], [18, 11]] },
    think: { px: [[11, 11], [12, 11], [13, 11], [16, 10], [17, 9], [18, 10]] },
    sad: { px: [[11, 11], [12, 10], [13, 10], [16, 10], [17, 10], [18, 11]] },
    worry: { px: [[11, 11], [12, 10], [13, 10], [16, 10], [17, 11], [18, 11]] },
    high: { px: [[11, 9], [12, 9], [13, 10], [16, 9], [17, 9], [18, 10]] }
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
  /* kacamata bulat berbingkai plum: sudut lensa dipotong, sisi atas gelap (g), sisi bawah lebih terang (y) */
  const GLASS = [
    [9, 12, "g"], [10, 12, "g"], [11, 12, "g"], [12, 12, "g"], [8, 13, "g"], [13, 13, "g"], [14, 13, "g"],
    [8, 14, "y"], [8, 15, "y"], [8, 16, "y"], [8, 17, "y"], [13, 14, "y"], [13, 15, "y"], [13, 16, "y"], [13, 17, "y"], [9, 18, "y"], [10, 18, "y"], [11, 18, "y"], [12, 18, "y"],
    [16, 12, "g"], [17, 12, "g"], [18, 12, "g"], [15, 13, "g"], [19, 13, "g"],
    [15, 14, "y"], [15, 15, "y"], [15, 16, "y"], [15, 17, "y"], [19, 14, "y"], [19, 15, "y"], [19, 16, "y"], [19, 17, "y"], [16, 18, "y"], [17, 18, "y"], [18, 18, "y"]
  ];
  /* torso (17 x 16): blus ungu berkerah bulat (peter pan) terang, lipatan kerut di dada, pinggang ramping,
     kelim melebar menutup panggul */
  const TORSO = map([
    [4, "cllsssdlc"],
    [2, "TcllsssddllCu"],
    [1, "TTccllldlllCuuv"],
    [1, "TtuCcCtttCcCutu"],
    [1, "Ttttuttttttuttu"],
    [1, "Tttttutttttuuuu"],
    [1, "Ttttttuttttuuuu"],
    [1, "tTtttttuttuuuuu"],
    [1, "ttttttttutuuuuu"],
    [2, "tttttttutuuuu"],
    [2, "tttttttuuuuuu"],
    [2, "ttttttutuuuuu"],
    [1, "Ttttttttutuuuuu"],
    [1, "tttttttutttuuuu"],
    [0, "Tttttttttutttuuuv"],
    [0, "uuuuuuuuuuuuuuuuv"]
  ]);
  /* lanyard koral relatif torso: dua tali dari kerah, klip, kartu 5x5 (foto + baris nama + strip koral) */
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
  /* sepatu flat: rendah, ujung membulat, punggung kaki terbuka sedikit (kulit a), sol tipis */
  const SHOE = {
    flat: { ox: -3, oy: 1, rows: ["Ya      ", "YWaaWY  ", "YWWWWWWY", "rrrrrrrR"] },
    toe: { ox: -3, oy: 0, rows: ["Y       ", "YWa     ", "rYWWaY  ", " rrYWWWY", "   rrrrR"] },
    heel: { ox: -3, oy: 0, rows: ["        ", "YWaaaWWY", "YYWWWWrR", "rrrrrR  "] }
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
  /* lengan blus 3/4: lengan bawah kulit (3 px) digambar dulu, lalu lengan blus (5 px) dari bahu melewati siku
     sampai 45% lengan bawah, berakhir kelim terang */
  function arm(F, sh, el, wr, hand, far, tx = 0) {
    sh = [sh[0] + tx, sh[1] - TALL]; el = [el[0] + tx, el[1] - TALL]; wr = [wr[0] + tx, wr[1] - TALL];
    const mx = el[0] + (wr[0] - el[0]) * .45, my = el[1] + (wr[1] - el[1]) * .45, g = far ? "armF" : "arm";
    F.draw(tube([el, wr], "asd"), { grp: g + "s", rim: "e", far });
    F.draw(tube([sh, el, [mx, my]], "Tttuu", { capTop: 1, rowPat: (j, n) => j === n - 1 ? "llcCu" : null }), { grp: g, rim: "v", far });
    const H = HAND[hand || "open"];
    F.draw(spr(H.rows, Math.round(wr[0]) + H.ox, Math.round(wr[1]) + H.oy), { grp: g + "h", rim: "e", far });
  }
  function head(F, x, y, P) {
    const rows = HEAD.slice(); const tu = TUFT[P.tuft || 0]; if (tu) tu.forEach((r, k) => rows[TUFT_ROW + k] = r)
    const px = spr(rows, x, y);
    const F2 = P.face || {}, E = EYE[F2.eyes || "open"], [ox, oy] = F2.off || [0, 0], fx = x + ox, fy = y + oy;
    /* dahi dibersihkan dulu (kulit) supaya alis yang naik tidak menimpa garis rambut */
    for (const [bx, by] of [[8, 10], [12, 10], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9], [16, 9], [17, 9], [18, 9], [9, 10], [10, 10], [11, 10], [16, 10], [17, 10], [18, 10], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11], [16, 11], [17, 11], [18, 11]]) {
      const ch = rows[by] && rows[by][bx - ox]; if (ch === "s" || ch === "d") px.push([fx + bx, fy + by, "s"]);
    }
    px.push(...spr(E.n, fx + 9, fy + 13 + (E.dy || 0)), ...spr(E.f, fx + 16, fy + 13 + (E.dy || 0)));
    const B = BROW[F2.brow || "calm"];
    for (const [bx, by] of B.px) { const ch = rows[by] && rows[by][bx - ox]; if (ch === "s" || ch === "d") px.push([fx + bx, fy + by, "h"]) }
    px.push([fx + 15, fy + 17, "d"], [fx + 14, fy + 18, "d"]); /* hidung + bayangan bawahnya */
    px.push([fx + 9, fy + 19, "b"], [fx + 10, fy + 19, "b"], [fx + 17, fy + 19, "b"]); /* rona pipi */
    if (0) px.push([fx + 9, fy + 19, "b"], [fx + 10, fy + 19, "b"], [fx + 17, fy + 19, "b"]);
    for (const [mx, my, ch] of MOUTH[F2.mouth || "smile"]) px.push([fx + mx, fy + my, ch]);
    for (const [gx, gy, c] of GLASS) px.push([fx + gx, fy + gy, c]);
    px.push([fx + 9, fy + 13, "G"]);
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
        armLate: 1, tuft: k.j < 0 ? 1 : 0, face: { eyes: "happy", mouth: "grin", brow: "high" },
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

  SIMPX.char("rekan2", { w: 64, h: 64, anims: { idle, nod, shake, surprised, sad, happy, thinking } });
})();

/* ===== kantor ===== */
/* Latar "kantor" (320x150) untuk adegan simulasi: kantor startup kecil yang hangat, pagi hari.
   Putaran 2 (kritik art director):
   - Tanpa dither sama sekali: semua gradasi berupa pita/cluster warna datar.
   - Tiap benda digambar di lapisan sendiri lalu diberi garis tepi otomatis yang SELEKTIF:
     sisi kiri/atas = versi gelap warna bidang di sebelahnya, sisi kanan/bawah = tinta latar (navy lembut).
   - Aksen latar hanya koral dan biru (saturasi diturunkan); teal/mint khusus tokoh. Tanaman hijau zaitun.
   - Kaki tokoh di y 125 (floorY), sejajar alas rak/pot/meja. Jendela dipendekkan: ambang di y 59-65, di atas kepala tokoh (rambut mulai ~y 67).
   - Lantai papan mengarah ke penonton (sambungan menyempit ke titik hilang x 160), tanpa serat kayu.
   - Cahaya jendela di lantai jatuh di kanan tokoh (x > 128), dua tone datar, supaya sepatu tidak hilang.
   - Semua benda yang berdiri punya bayangan kontak 2 piksel di lantai. */
(() => {
  const W = 320, H = 150, FLOOR = 118;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const th = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return th(x.map((v, i) => v + (y[i] - v) * t)) };
  /* versi gelap bergeser ke ungu-biru (untuk garis tepi sisi kiri/atas dan bidang bayangan) */
  const dkc = (c, t = .4) => mix(mix(c, "#3a3470", t * .6), "#000000", t * .3);

  const P = {
    ink: "#5d5584", inkD: "#463f6c",
    wall: "#f3e5c8", wallL: "#f8eedb", wallS: "#eadab9", wallD: "#dcc6a3",
    trim: "#f7efde", trimL: "#fcf7ec", trimS: "#e2d3b8",
    wain: "#ecdbbb", wainS: "#dcc6a2",
    sky0: "#b9d1ea", sky1: "#c9dcef", sky2: "#d9e6f1", skyS: "#a9c2df", sun: "#fbf3df",
    cloud: "#f5f7f5", cloudS: "#e1eaf1",
    bld: "#c2cae3", bldW: "#d7ddee",
    frame: "#f1e6d1", frameL: "#faf4e8", frameS: "#d9c9ad",
    wood: "#d29d6c", woodG: "#c99262", woodS: "#b27c53", woodD: "#956547",
    lit: "#e8bd89", lit2: "#e0b17d", litS: "#c99262",
    shelf: "#b37552", shelfL: "#c78a62", shelfS: "#955f42", shelfIn: "#7d5444", shelfD: "#684538",
    coral: "#e3937c", coralL: "#efb29d", coralS: "#c2735f",
    blue: "#94b1d6", blueL: "#b9cde6", blueS: "#7491bb",
    cream: "#f2e5c9", creamL: "#fbf4e3", creamS: "#d8c6a4",
    tan: "#d3ae86", tanL: "#e3c6a3", tanS: "#b48c65",
    ol: "#a3a85d", olL: "#c1c47e", olS: "#7f8a4d", olD: "#5d6843",
    metal: "#665f8a", metalL: "#847ea8", metalD: "#4a436f",
    screen: "#bcd6ee", screenL: "#deebf6", screenS: "#9ebee0",
    board: "#fbfaf5", boardS: "#ebe7ea", boardF: "#cbc5d8", boardFD: "#a7a1bd", marker: "#7d77a6", markerL: "#aaa5c6"
  };
  /* bayangan kontak & bayangan bawah meja: satu tingkat lebih gelap, datar */
  const SHADOW = { [P.wood]: P.woodS, [P.woodG]: P.woodS, [P.woodS]: P.woodD, [P.lit]: P.litS, [P.lit2]: P.litS, [P.litS]: P.woodS };

  /* daun fiddle-leaf hasil gambar tangan (8x10), sisi kanan-bawah sudah bertepi gelap */
  const LEAF = [
    "...ab...",
    "..aabbd.",
    ".aabbbcd",
    "aabbbbcd",
    "abbbbccd",
    "abbbbccd",
    ".bbbccd.",
    ".bbccdd.",
    "..bcdd..",
    "...dd..."];
  const LEAF_F = LEAF.map(r => [...r].reverse().join("").replace(/a/g, "x").replace(/d/g, "a").replace(/x/g, "d"));

  const draw = g => {
    let cur = g;
    const set = (x, y, c) => cur.set(x, y, c), get = (x, y) => cur.get(x, y);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) };
    const HL = (x, y, w, c) => R(x, y, w, 1, c), VL = (x, y, h, c) => R(x, y, 1, h, c);
    const line = (a, b, c, d, col) => cur.line(a, b, c, d, col);
    const spr = (x, y, rows, pal) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(x + i, y + j, pal[ch]) }));
    const remap = (x, y, map) => { const c = g.get(x, y); if (c && map[c]) g.set(x, y, map[c]) };
    const contact = (x, y, w, h = 2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) remap(x + i, y + j, SHADOW) };
    /* satu benda = satu lapisan; garis tepi selektif dihitung dari bentuknya */
    const obj = (fn, o = {}) => {
      const t = GLPIX.grid(W, H); cur = t; fn(); cur = g;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = t.g[y][x]; if (c) g.set(x, y, c) }
      if (o.ol === false) return;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (t.g[y][x]) continue;
        const l = t.get(x - 1, y), u = t.get(x, y - 1), r = t.get(x + 1, y), d = t.get(x, y + 1);
        if (l || u) g.set(x, y, o.ink || P.ink); else if (r || d) g.set(x, y, dkc(r || d));
      }
    };

    /* ================= DINDING ================= */
    R(0, 0, W, FLOOR, P.wall);
    R(0, 0, W, 5, P.trim); HL(0, 5, W, P.trimS); HL(0, 6, W, P.wallD); HL(0, 7, W, P.wallS);
    /* plint tinggi; tanpa list dinding supaya tidak ada garis melintang di dagu/leher tokoh (y 79-104) */
    R(0, 110, W, 8, P.trim); HL(0, 110, W, P.trimS); HL(0, 111, W, P.trimL); HL(0, 116, W, P.trimS); HL(0, 117, W, P.wainS);

    /* ================= LANTAI: papan mengarah ke penonton ================= */
    const VPX = 160, VPY = 30, FW = 15;
    const strip = (x, y) => Math.floor((VPX + (x - VPX) * (FLOOR - VPY) / (y - VPY) - VPX) / FW);
    for (let y = FLOOR; y < H; y++) for (let x = 0; x < W; x++) set(x, y, strip(x, y) & 1 ? P.woodG : P.wood);
    /* sambungan memanjang: garis lurus ke titik hilang */
    for (let k = -12; k <= 12; k++) {
      const x0 = VPX + k * FW, x1 = VPX + (x0 - VPX) * (H - 1 - VPY) / (FLOOR - VPY);
      line(x0, FLOOR, Math.round(x1), H - 1, P.woodS);
    }
    /* sambungan ujung papan: jarang, satu per papan */
    for (let y = FLOOR + 2; y < H; y++) for (let x = 0; x < W; x++) {
      const s = strip(x, y), jy = FLOOR + 6 + ((s * 13 + 91) % 23);
      if (y === jy && get(x, y) !== P.woodS) set(x, y, P.woodS);
    }
    HL(0, FLOOR, W, P.woodD); HL(0, FLOOR + 1, W, P.woodS);

    /* cahaya jendela di lantai: dua panel miring ke kanan, datar, di kanan tokoh */
    const LIT = { [P.wood]: P.lit, [P.woodG]: P.lit2, [P.woodS]: P.litS };
    for (let y = FLOOR + 3; y < H; y++) {
      const t = (y - FLOOR - 3) / (H - FLOOR - 4);
      if (t > .3 && t < .38) continue;                              /* bayangan kusen melintang */
      [[134, 154, 152, 182], [158, 178, 186, 216]].forEach(([a0, a1, b0, b1]) => {
        const x0 = Math.round(a0 + (b0 - a0) * t), x1 = Math.round(a1 + (b1 - a1) * t);
        for (let x = x0; x <= x1; x++) remap(x, y, LIT);
      });
    }

    /* ================= JENDELA ================= */
    const WX = 70, WY = 9, WW = 102, WH = 50, gx = WX + 4, gy = WY + 4, gw = WW - 8, gh = WH - 8;
    const MUL = WX + WW / 2 - 2, TR = WY + 19;
    /* bayangan ambang di dinding (solid) */
    R(WX - 3, WY + WH + 5, WW + 9, 2, P.wallD);
    obj(() => {
      /* langit: tiga pita datar */
      for (let y = gy; y < gy + gh; y++) HL(gx, y, gw, y < gy + 12 ? P.sky0 : y < gy + 24 ? P.sky1 : P.sky2);
      /* matahari datar */
      for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 17) set(gx + 13 + x, gy + 8 + y, P.sun);
      /* awan: cluster datar + satu baris bayangan */
      const cloud = (x, y, w) => { HL(x + 3, y, w - 7, P.cloud); R(x + 1, y + 1, w - 2, 1, P.cloud); R(x, y + 2, w, 1, P.cloud); HL(x + 1, y + 3, w - 2, P.cloudS) };
      cloud(gx + 30, gy + 6, 16); cloud(gx + 66, gy + 13, 13); cloud(gx + 6, gy + 22, 10);
      /* siluet kota satu tone; jendela gedung berupa beberapa cluster 2x2 */
      const sky = [[0, 34], [8, 29], [15, 36], [24, 26], [33, 31], [41, 23], [49, 30], [58, 27], [66, 34], [73, 25], [83, 32], [90, 37]];
      sky.forEach(([bx, by], i) => { const w = (sky[i + 1] ? sky[i + 1][0] : gw) - bx; R(gx + bx, gy + by, w, gh - by, P.bld) });
      [[27, 30], [27, 35], [44, 27], [47, 33], [76, 29], [79, 34], [12, 40], [61, 31], [36, 36]].forEach(([x, y]) => R(gx + x, gy + y, 2, 2, P.bldW));
      /* bayangan kusen di kaca */
      HL(gx, gy, gw, P.skyS); HL(gx, TR + 3, gw, P.skyS);
      /* kusen */
      const fb = (x, y, w, h) => R(x, y, w, h, P.frame);
      fb(WX, WY, WW, 4); fb(WX, WY + WH - 4, WW, 4); fb(WX, WY, 4, WH); fb(WX + WW - 4, WY, 4, WH); fb(MUL, WY, 4, WH); fb(WX, TR, WW, 3);
      HL(WX, WY, WW, P.frameL); VL(WX, WY, WH, P.frameL); HL(WX + 4, TR, WW - 8, P.frameL); VL(MUL, WY + 4, WH - 8, P.frameL);
      [WX + WW - 1, MUL + 3].forEach(x => VL(x, WY + 1, WH - 2, P.frameS));
      [WY + WH - 1, TR + 2].forEach(y => HL(WX + 1, y, WW - 2, P.frameS));
      /* ambang */
      R(WX - 5, WY + WH, WW + 10, 4, P.trim); HL(WX - 5, WY + WH, WW + 10, P.trimL); HL(WX - 5, WY + WH + 3, WW + 10, P.trimS);
    });
    /* benda kecil di ambang */
    obj(() => {
      const x = WX + 12, y = WY + WH;   /* kaktus zaitun dalam pot koral */
      R(x, y - 5, 5, 5, P.coral); VL(x, y - 5, 5, P.coralL); VL(x + 4, y - 5, 5, P.coralS); HL(x - 1, y - 6, 7, P.coralL);
      R(x + 1, y - 12, 3, 6, P.ol); VL(x + 1, y - 12, 6, P.olL); VL(x + 3, y - 12, 6, P.olS); set(x + 2, y - 13, P.ol);
      R(x - 1, y - 10, 1, 3, P.ol); set(x, y - 8, P.ol);
    });
    obj(() => {
      const x = WX + WW - 24, y = WY + WH;
      R(x, y - 3, 15, 3, P.blue); HL(x, y - 3, 15, P.blueL); HL(x, y - 1, 15, P.blueS);
      R(x + 2, y - 5, 11, 2, P.cream); HL(x + 2, y - 5, 11, P.creamL); VL(x + 12, y - 5, 2, P.creamS);
    });

    /* ================= RAK BUKU (kiri) ================= */
    const SX = 4, SY = 50, SW = 44, SH = 72;   /* alas di y 121 */
    R(SX + SW + 1, SY + 3, 2, SH - 7, P.wallD);                 /* bayangan di dinding, solid */
    contact(SX - 1, SY + SH, SW + 5);
    obj(() => {
      R(SX, SY, SW, SH, P.shelf); HL(SX, SY, SW, P.shelfL); VL(SX, SY, SH, P.shelfL); VL(SX + SW - 1, SY, SH, P.shelfS);
      R(SX + 3, SY + 3, SW - 6, SH - 9, P.shelfIn);
      const comp = [[SY + 3, SY + 22], [SY + 25, SY + 44]];
      [SY + 22, SY + 44].forEach(y => { R(SX + 3, y, SW - 6, 3, P.shelf); HL(SX + 3, y, SW - 6, P.shelfL); HL(SX + 3, y + 2, SW - 6, P.shelfS) });
      comp.forEach(([a, b]) => { HL(SX + 3, a, SW - 6, P.shelfD); VL(SX + 3, a, b - a, P.shelfD) });
      /* buku: koral, biru, krem, coklat muda */
      const BK = [[P.coral, P.coralL, P.coralS], [P.blue, P.blueL, P.blueS], [P.cream, P.creamL, P.creamS], [P.tan, P.tanL, P.tanS]];
      const book = (x, base, w, h, ci) => {
        const [c, l, s] = BK[ci]; R(x, base - h, w, h, c); VL(x, base - h, h, l); VL(x + w - 1, base - h, h, s);
        if (h > 11) { HL(x + 1, base - h + 2, w - 2, s); HL(x + 1, base - 3, w - 2, s) }
      };
      const lean = (x, base, w, h, ci) => { const [c, l, s] = BK[ci]; for (let j = 0; j < h; j++) { const o = Math.floor((h - 1 - j) / 3); R(x + o, base - h + j, w, 1, c); set(x + o, base - h + j, l); set(x + o + w - 1, base - h + j, s) } };
      const row = (y, items) => { let x = SX + 4; items.forEach(([w, h, ci, gap = 0]) => { book(x, y, w, h, ci); x += w + gap }) };
      row(SY + 22, [[3, 15, 0], [4, 17, 1], [3, 13, 3], [4, 16, 2, 2]]); lean(SX + 22, SY + 22, 3, 13, 1);
      /* kotak arsip koral di kanan rak atas */
      R(SX + 29, SY + 9, 11, 13, P.coral); HL(SX + 29, SY + 9, 11, P.coralL); VL(SX + 29, SY + 9, 13, P.coralL); VL(SX + 39, SY + 9, 13, P.coralS); R(SX + 32, SY + 13, 5, 2, P.creamL);
      row(SY + 44, [[4, 16, 2], [3, 17, 3], [4, 14, 1, 3], [3, 16, 0], [4, 17, 2], [3, 15, 1], [3, 13, 3]]);
      /* laci */
      [SX + 4, SX + 23].forEach(x => { R(x, SY + 48, 17, 17, P.shelfL); HL(x, SY + 48, 17, P.tanL); VL(x + 16, SY + 48, 17, P.shelfS); HL(x, SY + 64, 17, P.shelfS); R(x + 6, SY + 55, 5, 2, P.shelfD) });
      HL(SX + 1, SY + SH - 1, SW - 2, P.shelfS);
      /* atas rak: tumpukan buku + pot gantung */
      R(SX + 3, SY - 4, 15, 2, P.blue); HL(SX + 3, SY - 4, 15, P.blueL); VL(SX + 17, SY - 4, 2, P.blueS);
      R(SX + 4, SY - 2, 13, 2, P.coral); HL(SX + 4, SY - 2, 13, P.coralL); VL(SX + 16, SY - 2, 2, P.coralS);
      R(SX + 29, SY - 6, 8, 6, P.cream); VL(SX + 29, SY - 6, 6, P.creamL); VL(SX + 36, SY - 6, 6, P.creamS); HL(SX + 28, SY - 7, 10, P.creamS);
      spr(SX + 27, SY - 12, ["..ab.b..", ".abbabc.", "abbcbbcc", ".bc..cc."], { a: P.olL, b: P.ol, c: P.olS });
    });
    /* tanaman rambat menjuntai di sisi kanan rak */
    obj(() => {
      for (let k = 0; k < 8; k++) {
        const y = SY - 1 + k * 4, x = SX + 37 + [0, 1, 1, 0, -1, 0, 1, 1][k];
        VL(x + 1, y, 4, P.olD);
        if (k === 5) continue;
        const s = k % 2 ? 2 : -2;
        spr(x + s, y + 1, ["ab", "bc"], { a: P.olL, b: P.ol, c: P.olS });
      }
    }, { ink: P.olD });

    /* ================= LAMPU GANTUNG ================= */
    const pend = (x, len, glow) => {
      const y0 = 8 + len;
      obj(() => {
        VL(x, 7, len, P.metal);
        R(x - 2, y0 - 1, 5, 2, P.metalL);
        for (let j = 0; j < 7; j++) { const hw = 3 + j; HL(x - hw, y0 + 1 + j, hw * 2 + 1, P.coral); set(x - hw, y0 + 1 + j, P.coralL); set(x - hw + 1, y0 + 1 + j, P.coralL); set(x + hw, y0 + 1 + j, P.coralS) }
        HL(x - 9, y0 + 7, 19, P.coralS);
        R(x - 2, y0 + 8, 5, 1, P.creamL); HL(x - 1, y0 + 9, 3, P.creamL);
      });
    };
    pend(40, 10, true);
    pend(292, 12, true);

    /* ================= TANAMAN POT BESAR ================= */
    const PX = 60, PB = 126;
    contact(PX - 8, PB, 19);
    const back = [[-13, -47, 0], [1, -55, 1], [10, -44, 1], [-17, -31, 0]];
    const front = [[-8, -43, 0], [4, -47, 1], [-14, -24, 0], [9, -30, 1], [-3, -33, 0], [3, -21, 1]];
    /* batang tanpa garis tepi (supaya tidak jadi garis ganda), daun & pot dengan garis tepi */
    obj(() => [...back, ...front].forEach(([dx, dy]) => line(PX, PB - 15, PX + dx + 4, PB + dy + 9, P.olD)), { ol: false });
    obj(() => {
      const fr = { a: P.olL, b: P.ol, c: P.olS, d: P.olD }, bk = { a: P.ol, b: P.olS, c: P.olD, d: P.olD };
      back.forEach(([dx, dy, f]) => spr(PX + dx, PB + dy, f ? LEAF_F : LEAF, bk));
      front.forEach(([dx, dy, f]) => spr(PX + dx, PB + dy, f ? LEAF_F : LEAF, fr));
      /* pot koral, sedikit mengecil ke bawah */
      for (let j = 0; j < 13; j++) { const hw = 7 - Math.floor(j / 5), y = PB - 13 + j; HL(PX - hw, y, hw * 2 + 1, P.coral); VL(PX - hw, y, 1, P.coralL); set(PX - hw + 1, y, P.coralL); set(PX + hw, y, P.coralS); set(PX + hw - 1, y, P.coralS) }
      R(PX - 8, PB - 16, 17, 3, P.coral); HL(PX - 8, PB - 16, 17, P.coralL); HL(PX - 8, PB - 14, 17, P.coralS); set(PX + 8, PB - 15, P.coralS);
      HL(PX - 5, PB - 1, 11, P.coralS);
    });

    /* ================= JAM DINDING ================= */
    const KX = 208, KY = 22;
    for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) if (x * x + y * y <= 72) g.set(KX + x + 2, KY + y + 2, P.wallD);
    obj(() => {
      for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) {
        const d = x * x + y * y; if (d > 72) continue;
        set(KX + x, KY + y, d > 42 ? (x + y < 0 ? P.coralL : x + y > 4 ? P.coralS : P.coral) : (d > 30 && x + y < -2 ? P.boardS : P.board));
      }
      [[0, -5], [5, 0], [0, 5], [-5, 0]].forEach(([x, y]) => set(KX + x, KY + y, P.marker));
      VL(KX, KY - 4, 4, P.inkD); HL(KX + 1, KY, 3, P.inkD); set(KX, KY, P.coralS);
    });

    /* ================= POSTER (dinding kanan, nilai rendah) ================= */
    const QX = 246, QY = 22, QW = 24, QH = 30;
    R(QX + 1, QY + QH + 1, QW, 1, P.wallD); VL(QX + QW + 1, QY + 2, QH, P.wallD);
    obj(() => {
      R(QX, QY, QW, QH, P.tan); HL(QX, QY, QW, P.tanL); VL(QX, QY, QH, P.tanL); HL(QX, QY + QH - 1, QW, P.tanS); VL(QX + QW - 1, QY, QH, P.tanS);
      R(QX + 2, QY + 2, QW - 4, QH - 4, P.creamL);
      for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (x * x + y * y <= 10) set(QX + 14 + x, QY + 10 + y, P.coralL);
      /* bukit biru pucat, dua lapis */
      for (let x = QX + 2; x < QX + QW - 2; x++) {
        const h1 = Math.round(7 - Math.abs(x - QX - 8) * .7), h2 = Math.round(5 - Math.abs(x - QX - 17) * .5);
        if (h1 > 0) VL(x, QY + QH - 6 - h1, h1, P.blueL);
        if (h2 > 0) VL(x, QY + QH - 4 - h2, h2, P.blue);
      }
      R(QX + 2, QY + QH - 4, QW - 4, 2, P.blue);
    });

    /* ================= WHITEBOARD ================= */
    const BX = 180, BY = 40, BW = 56, BH = 40;
    R(BX + 2, BY + BH + 3, BW, 2, P.wallD); R(BX + BW + 1, BY + 3, 2, BH, P.wallD);
    obj(() => {
      R(BX, BY, BW, BH, P.boardF); HL(BX, BY, BW, P.boardS); VL(BX, BY, BH, P.boardS); HL(BX, BY + BH - 1, BW, P.boardFD); VL(BX + BW - 1, BY, BH, P.boardFD);
      R(BX + 2, BY + 2, BW - 4, BH - 4, P.board); HL(BX + 2, BY + 2, BW - 4, P.boardS); VL(BX + 2, BY + 2, BH - 4, P.boardS);
      /* baki spidol */
      R(BX + 4, BY + BH, BW - 8, 2, P.boardF); HL(BX + 4, BY + BH + 1, BW - 8, P.boardFD);
      R(BX + 10, BY + BH - 1, 6, 1, P.blueS); R(BX + 18, BY + BH - 1, 6, 1, P.coralS); R(BX + 40, BY + BH - 2, 7, 2, P.metalL);
    });
    /* coretan (di atas papan, tanpa garis tepi) */
    const scr = (pts, c) => { for (let i = 0; i < pts.length - 1; i++) g.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c) };
    scr([[BX + 6, BY + 7], [BX + 9, BY + 6], [BX + 12, BY + 8], [BX + 15, BY + 6], [BX + 18, BY + 7], [BX + 22, BY + 6], [BX + 25, BY + 7]], P.blueS);
    for (let x = BX + 6; x < BX + 26; x++) g.set(x, BY + 9, P.coral);
    for (let y = BY + 14; y < BY + 28; y++) g.set(BX + 6, y, P.marker);
    for (let x = BX + 6; x < BX + 28; x++) g.set(x, BY + 27, P.marker);
    [[9, 22, P.blueL], [14, 19, P.blue], [19, 16, P.coral], [24, 18, P.blueS]].forEach(([dx, top, c]) => { for (let y = BY + top; y < BY + 27; y++) for (let i = 0; i < 3; i++) g.set(BX + dx + i, y, c) });
    scr([[BX + 9, BY + 19], [BX + 15, BY + 16], [BX + 20, BY + 13], [BX + 25, BY + 14]], P.coralS);
    [[BY + 14, 1], [BY + 19, 1], [BY + 24, 0]].forEach(([y, ok]) => {
      for (let i = 0; i < 4; i++) { g.set(BX + 32 + i, y, P.marker); g.set(BX + 32 + i, y + 3, P.marker); g.set(BX + 32, y + i, P.marker); g.set(BX + 35, y + i, P.marker) }
      if (ok) [[33, 1], [34, 2], [35, 1], [36, 0], [37, -1]].forEach(([dx, dy]) => g.set(BX + dx, y + dy, P.blueS));
      scr([[BX + 39, y + 2], [BX + 42, y + 1], [BX + 45, y + 2], [BX + 48, y + 1]], P.markerL);
    });
    const note = (x, y, c, l, s) => { for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) g.set(x + i, y + j, j === 0 ? l : i === 8 || j === 8 ? s : c); for (let i = 2; i < 7; i++) g.set(x + i, y + 3, s); for (let i = 2; i < 6; i++) g.set(x + i, y + 5, s) };
    note(BX + 9, BY + 28, P.coralL, P.creamL, P.coral); note(BX + 21, BY + 28, P.blueL, P.creamL, P.blue);

    /* ================= MEJA KERJA (kanan) ================= */
    const MX = 244, MW = 74, MT = 98, MF = 127;
    /* gelap datar di bawah meja (dinding, plint, lantai terhalang) */
    for (let y = MT + 5; y < MF; y++) for (let x = MX; x < MX + MW; x++) { const c = g.get(x, y); if (c) g.set(x, y, SHADOW[c] || dkc(c, .12)) }
    contact(MX - 1, MF, MW + 4);
    obj(() => {
      R(MX + 2, MT + 5, 3, MF - MT - 5, P.metal); VL(MX + 2, MT + 5, MF - MT - 5, P.metalL);
      /* kabinet laci */
      const KXc = MX + MW - 22; R(KXc, MT + 5, 20, MF - MT - 5, P.cream); VL(KXc, MT + 5, MF - MT - 5, P.creamL); VL(KXc + 19, MT + 5, MF - MT - 5, P.creamS);
      [MT + 13, MT + 21].forEach(y => HL(KXc + 1, y, 18, P.creamS));
      [MT + 9, MT + 17, MT + 24].forEach(y => R(KXc + 7, y, 6, 1, P.metal));
      /* daun meja: permukaan atas 1 piksel + tepi depan */
      HL(MX - 2, MT, MW + 2, P.tanL); R(MX - 2, MT + 1, MW + 2, 3, P.wood); HL(MX - 2, MT + 4, MW + 2, P.woodS);
    });
    /* monitor */
    const OX = 254, OY = 68, OW = 32, OH = 22;
    R(OX + 2, OY + OH + 1, OW, 1, P.wallD); VL(OX + OW, OY + 2, OH, P.wallD);
    obj(() => {
      R(OX + 13, OY + OH, 6, 6, P.metal); VL(OX + 13, OY + OH, 6, P.metalL); R(OX + 8, MT - 2, 16, 2, P.metal); HL(OX + 8, MT - 2, 16, P.metalL);
      R(OX, OY, OW, OH, P.metal); HL(OX, OY, OW, P.metalL); VL(OX, OY, OH, P.metalL); HL(OX, OY + OH - 1, OW, P.metalD); VL(OX + OW - 1, OY, OH, P.metalD);
      R(OX + 2, OY + 2, OW - 4, OH - 5, P.screen); R(OX + 2, OY + OH - 6, OW - 4, 3, P.screenS);
      R(OX + 4, OY + 4, 11, 2, P.screenL); HL(OX + 4, OY + 8, 8, P.coralL); HL(OX + 4, OY + 10, 10, P.creamL); HL(OX + 4, OY + 12, 6, P.blueL);
      R(OX + 18, OY + 4, 10, 11, P.screenL); R(OX + 20, OY + 10, 2, 4, P.blue); R(OX + 23, OY + 7, 2, 7, P.coral); R(OX + 26, OY + 9, 1, 5, P.blueS);
      /* keyboard */
      HL(OX - 2, MT - 2, 22, P.board); HL(OX - 2, MT - 1, 22, P.boardFD); R(OX + 24, MT - 2, 3, 2, P.board);
    }, { ink: P.inkD });
    /* lampu meja (biru) */
    const LX = 300;
    obj(() => {
      R(LX - 4, MT - 2, 9, 2, P.blue); HL(LX - 4, MT - 2, 9, P.blueL);
      line(LX, MT - 3, LX - 3, MT - 15, P.blueS); line(LX + 1, MT - 3, LX - 2, MT - 15, P.blue);
      line(LX - 3, MT - 16, LX + 4, MT - 22, P.blueS); line(LX - 2, MT - 16, LX + 5, MT - 22, P.blue);
      for (let j = 0; j < 5; j++) { HL(LX + 4 - j, MT - 24 + j, 6 + j * 2, j < 2 ? P.blueL : P.blue); set(LX + 9 + j, MT - 24 + j, P.blueS) }
      HL(LX + 5, MT - 19, 4, P.creamL);
    });
    /* cangkir & sukulen */
    obj(() => {
      R(288, MT - 6, 5, 6, P.coral); VL(288, MT - 6, 6, P.coralL); VL(292, MT - 6, 6, P.coralS); set(293, MT - 4, P.coralS); set(293, MT - 3, P.coralS);
    });
    obj(() => {
      R(309, MT - 5, 6, 5, P.cream); VL(309, MT - 5, 5, P.creamL); VL(314, MT - 5, 5, P.creamS);
      spr(308, MT - 9, [".a.b.", "abbbc", ".bcc."], { a: P.olL, b: P.ol, c: P.olS }); HL(309, MT - 6, 6, P.olS);
    });
    /* kursi kantor membelakangi (dikecilkan, sandaran di bawah pinggang tokoh) */
    const CX = 268, CY = 107;
    contact(CX - 13, CY + 24, 28);
    obj(() => {
      R(CX - 9, CY, 19, 12, P.blue); HL(CX - 8, CY, 17, P.blueL); VL(CX - 9, CY + 1, 11, P.blueL); VL(CX + 9, CY + 1, 11, P.blueS); VL(CX + 8, CY + 2, 9, P.blueS); HL(CX - 8, CY + 11, 17, P.blueS);
      cur.g[CY][CX - 9] = null; cur.g[CY][CX + 9] = null;
      R(CX - 1, CY + 12, 3, 2, P.metal);
      R(CX - 11, CY + 14, 23, 3, P.blue); HL(CX - 11, CY + 14, 23, P.blueL); HL(CX - 11, CY + 16, 23, P.blueS);
      R(CX - 1, CY + 17, 3, 3, P.metal); VL(CX - 1, CY + 17, 3, P.metalL);
      HL(CX - 9, CY + 20, 19, P.metalL); HL(CX - 9, CY + 21, 19, P.metal);
      [CX - 10, CX, CX + 9].forEach(x => R(x, CY + 22, 2, 2, P.metalD));
    });
  };

  SIMPX.bg("kantor", { w: W, h: H, floorY: 125, standX: 110, draw });
})();

/* ===== kamar ===== */
/* Latar "kamar" (320x150): kamar remaja pagi hari. Teknik sama dengan kantor.js:
   - tanpa dither; gradasi = pita warna datar; tiap benda satu lapisan dengan garis tepi selektif
     (sisi kiri/atas = versi gelap bidang, sisi kanan/bawah = tinta navy lembut);
   - lantai papan mengarah ke penonton, bayangan kontak 2 piksel untuk benda yang berdiri;
   - dinding bertemu lantai di y 106, kaki tokoh di y 125; area tokoh x 100-270 dibiarkan lega.
   File ini dan kamar-malam.js memakai kode yang SAMA; hanya konstanta NIGHT/ID di bawah yang berbeda.
   Versi malam: isi jendela, lampu meja, layar laptop, lampu tumbler bergaya "emisif" dan tidak digelapkan;
   piksel lain diturunkan ke palet malam (bergeser ke biru-ungu) lalu dinaikkan lagi dalam pita datar
   di sekitar sumber cahaya (lampu kuning hangat, layar biru, cahaya bulan di lantai). */
(() => {
  const NIGHT = false, ID = "kamar";
  const W = 320, H = 150, FLOOR = 106;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const th = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return th(x.map((v, i) => v + (y[i] - v) * t)) };
  const dkc = (c, t = .4) => mix(mix(c, "#3a3470", t * .6), "#000000", t * .3);

  const P = {
    ink: "#5d5584", inkD: "#463f6c",
    wall: "#dfe1ef", wallL: "#e9eaf4", wallS: "#d3d6ea", wallD: "#c0c4df",
    trim: "#f7f1e3", trimL: "#fdfaf2", trimS: "#e2d8c4", trimD: "#cfc2ab",
    sky0: "#b9d1ea", sky1: "#cfdfee", sky2: "#e6e9e6", sky3: "#f6e6c4", skyS: "#a9c2df", sun: "#fff4d2", sunH: "#fbe39a",
    cloud: "#f8f8f4", cloudS: "#e3e8ef",
    roof: "#c7b0c6", roofS: "#a990ad", tree: "#a9b98a", treeS: "#8c9c74",
    frame: "#f6f0e2", frameL: "#fdfaf3", frameS: "#dccfb6",
    yel: "#f2c14e", yelL: "#f8da82", yelS: "#d99d3c", yelD: "#b27a3c",
    coral: "#e3937c", coralL: "#efb29d", coralS: "#c2735f",
    blue: "#94b1d6", blueL: "#b9cde6", blueS: "#7491bb", blueD: "#5e7aa6",
    cream: "#f2e5c9", creamL: "#fbf4e3", creamS: "#d8c6a4",
    tan: "#d3ae86", tanL: "#e3c6a3", tanS: "#b48c65",
    ol: "#a3a85d", olL: "#c1c47e", olS: "#7f8a4d", olD: "#5d6843",
    birch: "#e3bd8f", birchL: "#f0d3ac", birchS: "#c79a6d", birchD: "#a27757",
    wood: "#d29d6c", woodG: "#c99262", woodS: "#b27c53", woodD: "#956547",
    lit: "#e8bd89", lit2: "#e0b17d", litS: "#c99262",
    metal: "#665f8a", metalL: "#847ea8", metalD: "#4a436f",
    lap: "#cfcde0", lapL: "#e6e5f0", lapS: "#a9a6c4",
    scr: "#f4f7fc", scrS: "#dfe7f3", scrB: "#7e9fd0", scrT: "#b4bfd6",
    rug: "#ecc35f", rugL: "#f6db8f", rugS: "#d6a647", rugC: "#f6ead0", rugB: "#e3937c",
    pil: "#fbf7ee", pilS: "#e4dccb", sheet: "#f3ecdc", sheetS: "#dcd0b8",
    cork: "#d8ab78", corkS: "#bd8d5f"
  };
  const SHADOW = { [P.wood]: P.woodS, [P.woodG]: P.woodS, [P.woodS]: P.woodD, [P.lit]: P.litS, [P.lit2]: P.litS, [P.litS]: P.woodS,
    [P.rug]: P.rugS, [P.rugL]: P.rug, [P.rugC]: P.rugL, [P.rugS]: P.yelD, [P.rugB]: P.coralS };

  /* ====== peta piksel tangan ====== */
  /* daun bulat kecil (pothos) */
  const LF = [".ab.", "abbc", "bbcc", ".cd."];
  /* pot gantung + tanaman di rak */
  const SUCC = ["..a.b..", ".abbbc.", "abbcbcc", ".bc.cc."];
  /* amplop surat di layar (5x4) */
  const ENV = ["abbba", "babab", "bbabb", "aaaaa"];
  /* bulan sabit 9x9 */
  const MOON = [
    "...aab...",
    "..aab....",
    ".aab.....",
    ".aab.....",
    "aaab.....",
    ".aaab....",
    ".aaaab...",
    "..aaaaab.",
    "...aaab.."];
  /* kucing boneka di kasur (8x7) */
  const PLUSH = [
    "a.....a.",
    "aa...aa.",
    "abbbbbac",
    "bdbbdbbc",
    "bbbebbbc",
    ".bbbbbc.",
    "..cccc.."];

  const draw = g => {
    let cur = g;
    const set = (x, y, c) => cur.set(x, y, c), get = (x, y) => cur.get(x, y);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) };
    const HL = (x, y, w, c) => R(x, y, w, 1, c), VL = (x, y, h, c) => R(x, y, 1, h, c);
    const line = (a, b, c, d, col) => cur.line(a, b, c, d, col);
    const spr = (x, y, rows, pal) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(x + i, y + j, pal[ch]) }));
    const remap = (x, y, map) => { const c = g.get(x, y); if (c && map[c]) g.set(x, y, map[c]) };
    const contact = (x, y, w, h = 2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) remap(x + i, y + j, SHADOW) };
    /* piksel emisif (tidak digelapkan malam hari) */
    const EM = new Set(), em = (x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) EM.add((y + j) * W + x + i) };
    /* label lapisan per piksel (dipakai pencahayaan malam): 1 jendela, 2 tirai, 3 kursi, 4 meja & isinya */
    const TAG = new Uint8Array(W * H), tg = o => o.tag | 0;
    const obj = (fn, o = {}) => {
      const t = GLPIX.grid(W, H); cur = t; fn(); cur = g;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = t.g[y][x]; if (c) { g.set(x, y, c); TAG[y * W + x] = tg(o) } }
      if (o.ol === false) return;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (t.g[y][x]) continue;
        const l = t.get(x - 1, y), u = t.get(x, y - 1), r = t.get(x + 1, y), d = t.get(x, y + 1);
        if (l || u) { g.set(x, y, o.ink || P.ink); TAG[y * W + x] = tg(o) } else if (r || d) { g.set(x, y, dkc(r || d)); TAG[y * W + x] = tg(o) }
      }
    };
    /* kotak 4 tingkat: isi, sorot kiri/atas, bayang kanan/bawah */
    const box = (x, y, w, h, c, l, s) => { R(x, y, w, h, c); HL(x, y, w, l); VL(x, y, h, l); VL(x + w - 1, y + 1, h - 1, s); HL(x + 1, y + h - 1, w - 1, s) };

    /* ================= DINDING ================= */
    R(0, 0, W, FLOOR, P.wall);
    /* wallpaper garis tegak lembut, berhenti sebelum plint */
    for (let x = 6; x < W; x += 14) R(x, 8, 2, 91, P.wallS);
    R(0, 0, W, 5, P.trim); HL(0, 5, W, P.trimS); HL(0, 6, W, P.wallD); HL(0, 7, W, P.wallS);
    R(0, 99, W, 7, P.trim); HL(0, 98, W, P.wallD); HL(0, 99, W, P.trimS); HL(0, 100, W, P.trimL); HL(0, 104, W, P.trimS); HL(0, 105, W, P.trimD);

    /* ================= LANTAI ================= */
    const VPX = 160, VPY = 20, FW = 15;
    const strip = (x, y) => Math.floor((VPX + (x - VPX) * (FLOOR - VPY) / (y - VPY) - VPX) / FW);
    for (let y = FLOOR; y < H; y++) for (let x = 0; x < W; x++) set(x, y, strip(x, y) & 1 ? P.woodG : P.wood);
    for (let k = -14; k <= 14; k++) {
      const x0 = VPX + k * FW, x1 = VPX + (x0 - VPX) * (H - 1 - VPY) / (FLOOR - VPY);
      line(x0, FLOOR, Math.round(x1), H - 1, P.woodS);
    }
    for (let y = FLOOR + 2; y < H; y++) for (let x = 0; x < W; x++) {
      const s = strip(x, y), jy = FLOOR + 6 + ((s * 13 + 91) % 23);
      if (y === jy && get(x, y) !== P.woodS) set(x, y, P.woodS);
    }
    HL(0, FLOOR, W, P.woodD); HL(0, FLOOR + 1, W, P.woodS);
    /* cahaya jendela di lantai (kiri, di bawah kursi; jauh dari sepatu tokoh) */
    const LIT = { [P.wood]: P.lit, [P.woodG]: P.lit2, [P.woodS]: P.litS };
    for (let y = FLOOR + 3; y < H; y++) {
      const t = (y - FLOOR - 3) / (H - FLOOR - 4);
      if (t > .34 && t < .42) continue;
      [[22, 44, 34, 62], [48, 70, 66, 94]].forEach(([a0, a1, b0, b1]) => {
        const x0 = Math.round(a0 + (b0 - a0) * t), x1 = Math.round(a1 + (b1 - a1) * t);
        for (let x = x0; x <= x1; x++) remap(x, y, LIT);
      });
    }

    /* ================= KARPET ================= */
    obj(() => {
      const T = 111, B = 141;
      for (let y = T; y <= B; y++) {
        const t = (y - T) / (B - T), x0 = Math.round(89 - 14 * t), x1 = Math.round(247 + 16 * t);
        for (let x = x0; x <= x1; x++) {
          const u = (x - x0) / (x1 - x0);
          let c = P.rug;
          if (y === T || x === x0) c = P.rugL;
          else if (y === B || x === x1) c = P.rugS;
          else if (y === T + 3 || y === B - 3 || x === x0 + 5 || x === x1 - 5) c = P.rugC;
          else if (y === T + 4 || y === B - 2 || x === x0 + 6 || x === x1 - 4) c = P.rugS;
          if ((y < T + 3 || y > B - 3) && (x === x0 + 5 || x === x1 - 5)) c = y === T || y === B ? c : P.rug;
          set(x, y, c);
        }
      }
      /* motif belah ketupat koral di tengah */
      [[125, 3], [168, 5], [211, 3]].forEach(([cx, r]) => { const cy = 126;
        for (let j = -r; j <= r; j++) { const w = (r - Math.abs(j)) * 2; for (let i = -w; i <= w; i++) set(cx + i, cy + j, Math.abs(i) >= w - 1 ? P.rugB : r > 3 && Math.abs(i) < w - 3 ? P.rugL : P.rug) } });
      /* rumbai depan */
      for (let x = 77; x <= 261; x += 2) set(x, B + 1, P.rugC);
    }, { ink: P.yelD });

    /* ================= JENDELA + TIRAI ================= */
    const WX = 18, WY = 12, WW = 64, WH = 46, gx = WX + 4, gy = WY + 4, gw = WW - 8, gh = WH - 8;
    const MUL = WX + WW / 2 - 2, TR = WY + 17;
    R(WX - 3, WY + WH + 5, WW + 9, 2, P.wallD);
    obj(() => {
      if (!NIGHT) {
        for (let y = gy; y < gy + gh; y++) HL(gx, y, gw, y < gy + 10 ? P.sky0 : y < gy + 20 ? P.sky1 : y < gy + 29 ? P.sky2 : P.sky3);
        /* matahari pagi rendah + halo pita */
        for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) { const d = x * x + y * y; if (d <= 50 && d > 26) set(gx + 14 + x, gy + 25 + y, P.sky3) }
        for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { const d = x * x + y * y; if (d <= 26) set(gx + 14 + x, gy + 25 + y, d > 17 ? P.sunH : P.sun) }
        const cloud = (x, y, w) => { HL(x + 3, y, w - 7, P.cloud); R(x + 1, y + 1, w - 2, 1, P.cloud); R(x, y + 2, w, 1, P.cloud); HL(x + 1, y + 3, w - 2, P.cloudS) };
        cloud(gx + 30, gy + 6, 14); cloud(gx + 4, gy + 9, 10);
        /* atap rumah tetangga + pohon */
        [[0, 31, 18], [17, 34, 16], [33, 30, 23]].forEach(([bx, by, w]) => { for (let j = 0; j < gh - by; j++) { const o = Math.max(0, 4 - j); HL(gx + bx + o, gy + by + j, w - o * 2, j < 2 ? P.roofS : P.roof) } });
        for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 34) set(gx + 46 + x, gy + 28 + y, y > 2 || x > 3 ? P.treeS : P.tree);
        R(gx + 9, gy + 35, 3, 2, P.yelL); R(gx + 40, gy + 35, 3, 2, P.cream);
      } else {
        for (let y = gy; y < gy + gh; y++) HL(gx, y, gw, y < gy + 10 ? "#2a2a5c" : y < gy + 20 ? "#33336b" : y < gy + 29 ? "#3e3b78" : "#4b4482");
        spr(gx + 38, gy + 4, MOON, { a: "#fbeec0", b: "#d9c88f" });
        [[6, 5], [16, 12], [28, 4], [50, 16], [22, 22], [8, 20], [44, 26]].forEach(([x, y], i) => { set(gx + x, gy + y, i % 3 ? "#cfd6f5" : "#fff4d2"); if (i % 3 === 0) { set(gx + x - 1, gy + y, "#8f93cc"); set(gx + x + 1, gy + y, "#8f93cc"); set(gx + x, gy + y - 1, "#8f93cc"); set(gx + x, gy + y + 1, "#8f93cc") } });
        [[0, 31, 18], [17, 34, 16], [33, 30, 23]].forEach(([bx, by, w]) => { for (let j = 0; j < gh - by; j++) { const o = Math.max(0, 4 - j); HL(gx + bx + o, gy + by + j, w - o * 2, j < 2 ? "#1c1b45" : "#252456") } });
        for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 34) set(gx + 46 + x, gy + 28 + y, "#1f2a48");
        R(gx + 9, gy + 35, 3, 2, "#f8cf6a"); R(gx + 40, gy + 35, 3, 2, "#f2b85a");
      }
      HL(gx, gy, gw, NIGHT ? "#22224f" : P.skyS); HL(gx, TR + 3, gw, NIGHT ? "#22224f" : P.skyS);
      const fb = (x, y, w, h) => R(x, y, w, h, P.frame);
      fb(WX, WY, WW, 4); fb(WX, WY + WH - 4, WW, 4); fb(WX, WY, 4, WH); fb(WX + WW - 4, WY, 4, WH); fb(MUL, WY, 4, WH); fb(WX, TR, WW, 3);
      HL(WX, WY, WW, P.frameL); VL(WX, WY, WH, P.frameL); HL(WX + 4, TR, WW - 8, P.frameL); VL(MUL, WY + 4, WH - 8, P.frameL);
      [WX + WW - 1, MUL + 3].forEach(x => VL(x, WY + 1, WH - 2, P.frameS));
      [WY + WH - 1, TR + 2].forEach(y => HL(WX + 1, y, WW - 2, P.frameS));
      R(WX - 5, WY + WH, WW + 10, 4, P.trim); HL(WX - 5, WY + WH, WW + 10, P.trimL); HL(WX - 5, WY + WH + 3, WW + 10, P.trimS);
    }, { tag: 1 });
    if (NIGHT) for (let y = gy; y < gy + gh; y++) for (let x = gx; x < gx + gw; x++) { const c = g.get(x, y); if (c && c !== P.frame && c !== P.frameL && c !== P.frameS) EM.add(y * W + x) }
    /* kaktus di ambang */
    obj(() => {
      const x = WX + 46, y = WY + WH;
      R(x, y - 5, 6, 5, P.yel); VL(x, y - 5, 5, P.yelL); VL(x + 5, y - 5, 5, P.yelS); HL(x - 1, y - 6, 8, P.yelL);
      R(x + 1, y - 12, 4, 6, P.ol); VL(x + 1, y - 12, 6, P.olL); VL(x + 4, y - 12, 6, P.olS); HL(x + 2, y - 13, 2, P.ol);
      R(x + 5, y - 10, 2, 1, P.ol); set(x + 6, y - 11, P.olL);
    }, { tag: 1 });
    /* rel tirai */
    obj(() => { HL(8, 9, 84, P.metalL); HL(8, 10, 84, P.metal); R(6, 8, 3, 4, P.yelS); R(91, 8, 3, 4, P.yelS) }, { ink: P.inkD });
    /* tirai kuning: lipatan tegak, diikat di y 46 lalu melebar */
    const curtain = (x0, dir) => obj(() => {
      const FOLD = [P.yelL, P.yel, P.yel, P.yelS, P.yel, P.yelL, P.yel, P.yelS, P.yelS, P.yel, P.yelL, P.yel];
      for (let y = 11; y <= 74; y++) {
        let w = 12;
        if (y > 38 && y <= 46) w = 12 - Math.round((y - 38) * .75);
        else if (y > 46) w = Math.min(13, 6 + Math.round((y - 46) * .28));
        for (let i = 0; i < w; i++) {
          const k = Math.floor(i * 12 / w), x = dir > 0 ? x0 + i : x0 - i;
          set(x, y, y === 74 ? P.yelS : FOLD[dir > 0 ? k : 11 - k]);
        }
        /* lipatan atas (kerut di rel) */
        if (y === 11) for (let i = 0; i < w; i += 3) set(dir > 0 ? x0 + i : x0 - i, y, P.yelS);
      }
      /* tali pengikat */
      const tx = dir > 0 ? x0 : x0 - 6; R(tx, 45, 7, 2, P.coral); HL(tx, 45, 7, P.coralL);
    }, { ink: P.yelD, tag: 2 });
    curtain(7, 1); curtain(93, -1);

    /* ================= MEJA BELAJAR ================= */
    const DX = 4, DW = 84, DT = 79, DF = 107;   /* tepi kanan meja x 87: jauh dari bahu/dagu tokoh (x ~100) */
    for (let y = DT + 5; y < DF; y++) for (let x = DX; x < DX + DW; x++) { const c = g.get(x, y); if (c) g.set(x, y, SHADOW[c] || dkc(c, .14)) }
    contact(DX - 1, DF, DW + 3);
    obj(() => {
      /* laci kiri */
      box(DX + 2, DT + 5, 26, DF - DT - 5, P.birch, P.birchL, P.birchS);
      [DT + 14].forEach(y => { HL(DX + 3, y, 24, P.birchS); HL(DX + 3, y + 1, 24, P.birchL) });
      [DT + 9, DT + 20].forEach(y => { R(DX + 12, y, 6, 2, P.yel); HL(DX + 12, y + 1, 6, P.yelS) });
      /* kaki kanan */
      R(DX + DW - 6, DT + 5, 4, DF - DT - 5, P.birch); VL(DX + DW - 6, DT + 5, DF - DT - 5, P.birchL); VL(DX + DW - 3, DT + 5, DF - DT - 5, P.birchS);
      /* daun meja */
      HL(DX, DT, DW, P.birchL); R(DX, DT + 1, DW, 3, P.birch); HL(DX, DT + 4, DW, P.birchS);
    }, { tag: 4 });
    /* tumpukan buku */
    obj(() => {
      box(DX + 6, DT - 3, 16, 3, P.blue, P.blueL, P.blueS);
      box(DX + 7, DT - 6, 14, 3, P.coral, P.coralL, P.coralS);
      box(DX + 6, DT - 9, 15, 3, P.cream, P.creamL, P.creamS); HL(DX + 18, DT - 8, 2, P.yel);
    });
    /* gelas pensil */
    obj(() => {
      line(DX + 27, DT - 12, DX + 28, DT - 6, P.yelS); set(DX + 27, DT - 13, P.coral);
      line(DX + 31, DT - 11, DX + 30, DT - 6, P.blueS); set(DX + 31, DT - 12, P.blueD);
      R(DX + 26, DT - 6, 7, 6, P.blue); VL(DX + 26, DT - 6, 6, P.blueL); VL(DX + 32, DT - 6, 6, P.blueS); HL(DX + 26, DT - 6, 7, P.blueL);
    });
    /* laptop dengan email lowongan */
    const LX = 40, LY = 61;
    obj(() => {
      /* tutup/layar */
      R(LX, LY, 26, 17, P.lap); HL(LX, LY, 26, P.lapL); VL(LX, LY, 17, P.lapL); VL(LX + 25, LY + 1, 16, P.lapS);
      R(LX + 2, LY + 2, 22, 13, P.scr);
      /* bilah atas biru + titik */
      HL(LX + 2, LY + 2, 22, P.scrB); HL(LX + 2, LY + 3, 22, P.scrB); set(LX + 3, LY + 2, P.coralL); set(LX + 5, LY + 2, P.yelL);
      /* daftar kiri */
      R(LX + 2, LY + 4, 5, 11, P.scrS); HL(LX + 3, LY + 6, 3, P.scrT); HL(LX + 3, LY + 8, 2, P.scrT); HL(LX + 3, LY + 10, 3, P.scrT);
      /* amplop kuning + baris teks + tombol "lamar" */
      spr(LX + 9, LY + 5, ENV, { a: P.yelS, b: P.yel });
      HL(LX + 15, LY + 5, 7, P.scrT); HL(LX + 15, LY + 7, 5, P.scrT);
      HL(LX + 9, LY + 10, 13, P.scrT); HL(LX + 9, LY + 12, 9, P.scrT);
      R(LX + 18, LY + 12, 5, 2, P.coral);
      /* alas keyboard */
      R(LX - 3, LY + 17, 32, 2, P.lapL); HL(LX - 3, LY + 18, 32, P.lapS); R(LX + 9, LY + 17, 8, 1, P.lapS);
    }, { ink: P.inkD });
    if (NIGHT) em(LX + 2, LY + 2, 22, 13);
    /* lampu meja (kuning, kepala menunduk ke kiri) */
    const AX = 84;
    obj(() => {
      R(AX - 4, DT - 2, 10, 2, P.yel); HL(AX - 4, DT - 2, 10, P.yelL); HL(AX - 3, DT - 1, 8, P.yelS);
      line(AX + 1, DT - 3, AX + 3, DT - 14, P.yelS); line(AX + 2, DT - 3, AX + 4, DT - 14, P.yel);
      line(AX + 3, DT - 15, AX - 3, DT - 20, P.yelS); line(AX + 4, DT - 15, AX - 2, DT - 20, P.yel);
      /* kap */
      spr(AX - 11, DT - 23, [
        "....abbb..",
        "..abbbbbc.",
        ".abbbbbbbc",
        "abbbbbbbcc",
        "cccccccccd"], { a: P.yelL, b: P.yel, c: P.yelS, d: P.yelD });
      HL(AX - 9, DT - 18, 6, NIGHT ? "#fff6d4" : P.creamL);
    });
    if (NIGHT) em(AX - 9, DT - 18, 6, 1);
    /* gelas */
    obj(() => { R(70, DT - 6, 5, 6, P.cream); VL(70, DT - 6, 6, P.creamL); VL(74, DT - 6, 6, P.creamS); set(75, DT - 4, P.creamS); set(75, DT - 3, P.creamS); HL(71, DT - 6, 3, P.tanS) });

    /* ================= RAK DINDING KECIL ================= */
    const SX = 104, SY = 36, SW = 44;
    R(SX + 2, SY + 3, SW, 1, P.wallD);
    obj(() => {
      /* buku berdiri */
      const BK = [[P.coral, P.coralL, P.coralS], [P.blue, P.blueL, P.blueS], [P.yel, P.yelL, P.yelS], [P.cream, P.creamL, P.creamS]];
      let x = SX + 3;
      [[3, 12, 1], [3, 14, 0], [4, 11, 2], [3, 13, 3]].forEach(([w, h, ci]) => { const [c, l, s] = BK[ci]; R(x, SY - h, w, h, c); VL(x, SY - h, h, l); VL(x + w - 1, SY - h, h, s); HL(x + 1, SY - h + 2, w - 2, s); x += w });
      /* piala kecil */
      R(SX + 22, SY - 2, 6, 2, P.tan); HL(SX + 22, SY - 2, 6, P.tanL);
      R(SX + 24, SY - 5, 2, 3, P.yelS);
      spr(SX + 21, SY - 11, ["abbbbbc", "abbbbbc", ".abbbc.", "..abc.."], { a: P.yelL, b: P.yel, c: P.yelS });
      /* pot tanaman */
      R(SX + 34, SY - 6, 7, 6, P.cream); VL(SX + 34, SY - 6, 6, P.creamL); VL(SX + 40, SY - 6, 6, P.creamS); HL(SX + 33, SY - 7, 9, P.creamS);
      spr(SX + 34, SY - 11, SUCC, { a: P.olL, b: P.ol, c: P.olS });
      /* papan rak + siku */
      R(SX, SY, SW, 3, P.birch); HL(SX, SY, SW, P.birchL); HL(SX, SY + 2, SW, P.birchS);
      [SX + 5, SX + SW - 7].forEach(bx => spr(bx, SY + 3, ["aab", ".ab", "..b"], { a: P.metalL, b: P.metal }));
    });
    /* sulur menjuntai dari pot */
    obj(() => {
      for (let k = 0; k < 4; k++) { const y = SY + 1 + k * 4, x = SX + 41 + [0, 1, 0, -1][k]; VL(x, y, 4, P.olD); spr(x + (k % 2 ? 1 : -3), y + 1, LF.slice(0, 3), { a: P.olL, b: P.ol, c: P.olS, d: P.olD }) }
    }, { ink: P.olD });

    /* ================= POSTER ================= */
    const QX = 162, QY = 16, QW = 26, QH = 34;
    R(QX + 1, QY + QH, QW, 1, P.wallD); VL(QX + QW, QY + 2, QH - 1, P.wallD);
    obj(() => {
      R(QX, QY, QW, QH, P.blueD);
      /* langit pita */
      R(QX + 1, QY + 1, QW - 2, 10, P.blueS); R(QX + 1, QY + 11, QW - 2, 9, P.blue); R(QX + 1, QY + 20, QW - 2, 6, P.blueL);
      /* bintang besar */
      spr(QX + 9, QY + 4, ["...a...", "...a...", "aaabaaa", ".abbba.", "..aba..", ".aa.aa.", ".a...a."], { a: P.yel, b: P.yelL });
      /* gunung + teks */
      for (let x = QX + 1; x < QX + QW - 1; x++) { const h = Math.max(0, 9 - Math.abs(x - QX - 9)), h2 = Math.max(0, 6 - Math.abs(x - QX - 19)); if (h) VL(x, QY + 26 - h, h, x < QX + 9 ? P.creamL : P.cream); if (h2 && h2 >= h) VL(x, QY + 26 - h2, h2, P.creamS) }
      R(QX + 1, QY + 26, QW - 2, QH - 27, P.yel);
      HL(QX + 4, QY + 28, 18, P.yelD); HL(QX + 7, QY + 30, 12, P.yelS);
      [[QX, QY], [QX + QW - 1, QY]].forEach(([x, y]) => set(x, y, P.coral));
    });

    /* ================= PAPAN GABUS ================= */
    const CBX = 198, CBY = 26, CBW = 28, CBH = 20;
    R(CBX + 1, CBY + CBH, CBW, 1, P.wallD); VL(CBX + CBW, CBY + 2, CBH - 1, P.wallD);
    obj(() => {
      box(CBX, CBY, CBW, CBH, P.birch, P.birchL, P.birchS);
      R(CBX + 2, CBY + 2, CBW - 4, CBH - 4, P.cork); HL(CBX + 2, CBY + 2, CBW - 4, P.corkS); VL(CBX + 2, CBY + 2, CBH - 4, P.corkS);
      /* foto polaroid, catatan, jadwal */
      R(CBX + 4, CBY + 4, 8, 9, P.creamL); R(CBX + 5, CBY + 5, 6, 5, P.blueL); HL(CBX + 5, CBY + 9, 6, P.ol); set(CBX + 7, CBY + 4, P.coral);
      R(CBX + 14, CBY + 5, 9, 8, P.yelL); HL(CBX + 15, CBY + 7, 6, P.yelS); HL(CBX + 15, CBY + 9, 4, P.yelS); set(CBX + 18, CBY + 5, P.blueS);
      R(CBX + 12, CBY + 13, 7, 4, P.coralL); HL(CBX + 13, CBY + 14, 4, P.coral);
    });

    /* ================= LAMPU TUMBLER ================= */
    const bulbs = [];
    obj(() => {
      const x0 = 232, x1 = 318, y0 = 42, sag = 7;
      for (let x = x0; x <= x1; x++) { const t = (x - x0) / (x1 - x0), y = Math.round(y0 + sag * 4 * t * (1 - t) - 3 * t); set(x, y, P.metal); if ((x - x0) % 9 === 4) bulbs.push([x, y + 1]) }
      bulbs.forEach(([x, y], i) => {
        const c = [P.yel, P.coralL, P.blueL][i % 3], on = NIGHT ? "#fff1b8" : c, sd = NIGHT ? "#ffd56e" : dkc(c, .18);
        set(x, y, P.metalD); set(x + 1, y, P.metalD);
        R(x, y + 1, 2, 2, on); set(x + 1, y + 2, sd); set(x, y + 3, sd);
      });
    }, { ol: false });
    if (NIGHT) bulbs.forEach(([x, y]) => em(x, y + 1, 2, 3));

    /* ================= POSTER KECIL DI ATAS KASUR ================= */
    const KX = 262, KY = 12, KW = 22, KH = 24;
    R(KX + 1, KY + KH, KW, 1, P.wallD); VL(KX + KW, KY + 2, KH - 1, P.wallD);
    obj(() => {
      box(KX, KY, KW, KH, P.creamL, P.trimL, P.creamS);
      R(KX + 2, KY + 2, KW - 4, KH - 4, P.coral);
      for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 18) set(KX + 11 + x, KY + 10 + y, x + y < -2 ? P.yelL : P.yel);
      R(KX + 2, KY + 16, KW - 4, 6, P.coralS); HL(KX + 5, KY + 18, 12, P.creamL);
    });

    /* ================= KASUR (kanan) ================= */
    const BX = 226, BR = 318, BT = 84, BF = 113;
    contact(BX - 1, BF, BR - BX + 4);
    obj(() => {
      /* sandaran kepala (kanan, menempel dinding) */
      R(302, 58, 16, 52, P.blue); HL(302, 58, 16, P.blueL); VL(302, 58, 52, P.blueL); VL(317, 59, 51, P.blueS);
      R(305, 62, 10, 20, P.blueS); HL(305, 62, 10, P.blueD); VL(305, 62, 20, P.blueD); R(306, 63, 8, 18, P.blue); HL(306, 63, 8, P.blueL);
      HL(304, 57, 12, P.blueL);
      /* rangka */
      R(BX + 4, 98, BR - BX - 20, 9, P.blue); HL(BX + 4, 98, BR - BX - 20, P.blueL); HL(BX + 4, 106, BR - BX - 20, P.blueS);
      [BX + 6, BR - 22].forEach(x => { R(x, 107, 4, BF - 107, P.blueS); VL(x, 107, BF - 107, P.blue) });
      /* kasur + sprei */
      R(BX + 4, BT, BR - BX - 20, 14, P.sheet); HL(BX + 4, BT, BR - BX - 20, P.pil); HL(BX + 4, BT + 13, BR - BX - 20, P.sheetS);
      /* sandaran kaki (kiri) */
      R(BX, 76, 6, 36, P.blue); VL(BX, 76, 36, P.blueL); HL(BX, 76, 6, P.blueL); VL(BX + 5, 77, 35, P.blueS); cur.g[76][BX] = null; cur.g[76][BX + 5] = null;
    });
    /* bantal */
    obj(() => {
      spr(282, 74, [
        "..aaaaaaaaaaa...",
        ".aabbbbbbbbbbba.",
        "aabbbbbbbbbbbbbc",
        "abbbbbbbbbbbbbbc",
        "abbbbbbbbbbbbbcc",
        "bbbbbbbbbbbbbbcc",
        ".bbbbbbbbbbbbcc.",
        "..cccccccccccc.."], { a: P.trimL, b: P.pil, c: P.pilS });
    });
    /* selimut kuning: permukaan atas terang (4 baris), tepi lipat, sisi depan bermotif, keliman bawah */
    obj(() => {
      const x0 = BX + 6, x1 = 286, TOP = BT - 3, EDGE = BT + 1, BOT = 102;
      for (let y = TOP; y <= BOT; y++) for (let x = x0; x <= x1; x++) {
        const fx = x - x0, fy = y - EDGE;
        let c;
        if (y < EDGE) c = y === TOP ? P.creamL : P.yelL;
        else if (y === EDGE) c = P.yelS;
        else if (y >= BOT - 1) c = P.yelS;
        else {
          c = P.yel;
          /* motif bunga kecil krem berselang-seling */
          const mx = (fx + (Math.floor(fy / 5) % 2) * 5) % 10, my = fy % 5;
          if ((mx === 4 && (my === 1 || my === 3)) || (my === 2 && (mx === 3 || mx === 5))) c = P.yelL;
          if (mx === 4 && my === 2) c = P.creamL;
        }
        if (x >= x1 - 1 && y >= EDGE) c = P.yelS;
        set(x, y, c);
      }
      /* keliman sedikit bergelombang */
      for (let x = x0; x <= x1; x++) if ((x - x0) % 12 > 5) set(x, BOT + 1, P.yelS);
      /* lipatan sprei krem di dekat bantal */
      R(x1 - 9, TOP, 8, 3, P.sheet); HL(x1 - 9, TOP, 8, P.pil); HL(x1 - 9, TOP + 2, 8, P.sheetS);
      /* lipatan kain tegak (sisi gelap 1 px + sorot 1 px) */
      [x0 + 17, x0 + 39].forEach(x => { VL(x, EDGE + 3, BOT - EDGE - 3, P.yelS); VL(x + 1, EDGE + 4, BOT - EDGE - 5, P.yelL) });
    }, { ink: P.yelD });
    /* boneka kucing */
    obj(() => spr(268, 75, PLUSH, { a: P.coralS, b: P.creamL, c: P.creamS, d: P.inkD, e: P.coral }));

    /* ================= KURSI MEJA (di depan meja) ================= */
    const CX = 58, CY = 74;
    contact(CX - 13, CY + 39, 28);
    obj(() => {
      /* sandaran */
      spr(CX - 9, CY, [
        "..aaaaaaaaaaaaa...",
        ".abbbbbbbbbbbbbc..",
        "abbbbbbbbbbbbbbbc.",
        "abbbbbbbbbbbbbbbc.",
        "abbbbbbbbbbbbbbbc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbcc..",
        ".abbbbbbbbbbbccc..",
        "..cccccccccccc...."], { a: P.coralL, b: P.coral, c: P.coralS });
      R(CX - 1, CY + 13, 3, 7, P.metal); VL(CX - 1, CY + 13, 7, P.metalL);
      /* dudukan */
      spr(CX - 12, CY + 20, [
        ".aaaaaaaaaaaaaaaaaaaaa.",
        "abbbbbbbbbbbbbbbbbbbbbc",
        "abbbbbbbbbbbbbbbbbbbbcc",
        ".ccccccccccccccccccccc."], { a: P.coralL, b: P.coral, c: P.coralS });
      R(CX - 1, CY + 24, 3, 9, P.metal); VL(CX - 1, CY + 24, 9, P.metalL);
      HL(CX - 10, CY + 33, 21, P.metalL); HL(CX - 10, CY + 34, 21, P.metal);
      [CX - 11, CX, CX + 10].forEach(x => R(x, CY + 35, 2, 2, P.metalD));
    });

    /* ================= MALAM: palet gelap + cahaya pita ================= */
    if (NIGHT) {
      const cache = new Map();
      const tone = (c, k) => {
        const key = c + k; if (cache.has(key)) return cache.get(key);
        const n = mix(mix(c, "#1b1a4e", .6), "#05041a", .4);           /* dasar malam: biru-ungu dalam */
        const v = k === 0 ? n
          : k === 1 ? mix(mix(c, "#2a1f50", .56), "#c8703c", .2)         /* hangat redup */
          : k === 2 ? mix(mix(c, "#4a2c4a", .2), "#ffb24f", .24)         /* hangat terang */
          : k === 3 ? mix(n, "#6a9cf4", .3)                              /* cahaya layar */
          : k === 5 ? mix(n, "#5f8ff0", .15)                             /* cahaya layar, pita luar */
          : k === 6 ? mix(n, "#d0843c", .16)                              /* hangat paling luar */
          : mix(n, "#7f8fd8", .16);                                      /* cahaya bulan */
        cache.set(key, v); return v;
      };
      /* sumber: kap lampu (bola di x 75-80, y 61) menyorot ke bawah berupa kerucut berpita; layar laptop
         menerangi meja & sandaran kursi di depannya (bukan cakram di dinding) */
      const lamp = (x, y) => {
        const cx = 77.5, dy = y - 61;
        if (dy >= 0 && y <= DT + 3) {                                    /* kerucut ke meja */
          const half = 3.5 + dy * 1.15, ax = Math.abs(x - cx - dy * .15);
          if (ax <= half * .55 && dy < 15) return 2; if (ax <= half) return 1;
        }
        if (y > DT + 3 && y <= DT + 6 && Math.abs(x - cx) <= 16) return 1;   /* tepi depan meja */
        const e = Math.hypot((x - cx) / 1.35, y - 59);                    /* halo kecil di dinding sekitar kap */
        if (e < 5.5) return 2; if (e < 11) return 1; if (e < 18) return 6;
        return 0;
      };
      const screen = (x, y) => {
        if (y < LY + 15 || y > LY + 25) return 0;
        const dy = y - LY - 15, x0 = LX - 2 - dy * .45, x1 = LX + 27 + dy * .45;
        if (x < x0 || x > x1) return 0;
        return dy < 5 && x > x0 + 3 && x < x1 - 3 ? 3 : 5;
      };
      const moon = (x, y) => {
        if (y < FLOOR + 3) return 0; const t = (y - FLOOR - 3) / (H - FLOOR - 4); if (t > .34 && t < .42) return 0;
        return [[22, 44, 34, 62], [48, 70, 66, 94]].some(([a0, a1, b0, b1]) => x >= Math.round(a0 + (b0 - a0) * t) && x <= Math.round(a1 + (b1 - a1) * t)) ? 4 : 0;
      };
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (EM.has(y * W + x)) continue; const c = g.get(x, y); if (!c) continue;
        let k = lamp(x, y); if (!k) k = screen(x, y); if (!k) k = moon(x, y);
        /* lampu tumbler: halo kecil hangat */
        if (!k) for (const [bx, by] of bulbs) if (Math.abs(x - bx) <= 3 && Math.abs(y - by - 1) <= 3 && Math.abs(x - bx) + Math.abs(y - by - 1) <= 4) { k = 1; break }
        g.set(x, y, tone(c, k));
      }
      /* bola lampu menyala */
      R(AX - 8, DT - 17, 4, 1, "#ffe9a8"); set(AX - 6, DT - 16, "#ffd36e");
    }
  };

  SIMPX.bg(ID, { w: W, h: H, floorY: 125, standX: 110, dark: NIGHT, draw });
})();

/* ===== kamar-malam ===== */
/* Latar "kamar-malam" (320x150): kamar remaja yang sama, malam hari (salinan kamar.js dengan NIGHT = true). Teknik sama dengan kantor.js:
   - tanpa dither; gradasi = pita warna datar; tiap benda satu lapisan dengan garis tepi selektif
     (sisi kiri/atas = versi gelap bidang, sisi kanan/bawah = tinta navy lembut);
   - lantai papan mengarah ke penonton, bayangan kontak 2 piksel untuk benda yang berdiri;
   - dinding bertemu lantai di y 106, kaki tokoh di y 125; area tokoh x 100-270 dibiarkan lega.
   File ini dan kamar-malam.js memakai kode yang SAMA; hanya konstanta NIGHT/ID di bawah yang berbeda.
   Versi malam: isi jendela, lampu meja, layar laptop, lampu tumbler bergaya "emisif" dan tidak digelapkan;
   piksel lain diturunkan ke palet malam (bergeser ke biru-ungu) lalu dinaikkan lagi dalam pita datar
   di sekitar sumber cahaya (lampu kuning hangat, layar biru, cahaya bulan di lantai). */
(() => {
  const NIGHT = true, ID = "kamar-malam";
  const W = 320, H = 150, FLOOR = 106;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const th = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return th(x.map((v, i) => v + (y[i] - v) * t)) };
  const dkc = (c, t = .4) => mix(mix(c, "#3a3470", t * .6), "#000000", t * .3);

  const P = {
    ink: "#5d5584", inkD: "#463f6c",
    wall: "#dfe1ef", wallL: "#e9eaf4", wallS: "#d3d6ea", wallD: "#c0c4df",
    trim: "#f7f1e3", trimL: "#fdfaf2", trimS: "#e2d8c4", trimD: "#cfc2ab",
    sky0: "#b9d1ea", sky1: "#cfdfee", sky2: "#e6e9e6", sky3: "#f6e6c4", skyS: "#a9c2df", sun: "#fff4d2", sunH: "#fbe39a",
    cloud: "#f8f8f4", cloudS: "#e3e8ef",
    roof: "#c7b0c6", roofS: "#a990ad", tree: "#a9b98a", treeS: "#8c9c74",
    frame: "#f6f0e2", frameL: "#fdfaf3", frameS: "#dccfb6",
    yel: "#f2c14e", yelL: "#f8da82", yelS: "#d99d3c", yelD: "#b27a3c",
    coral: "#e3937c", coralL: "#efb29d", coralS: "#c2735f",
    blue: "#94b1d6", blueL: "#b9cde6", blueS: "#7491bb", blueD: "#5e7aa6",
    cream: "#f2e5c9", creamL: "#fbf4e3", creamS: "#d8c6a4",
    tan: "#d3ae86", tanL: "#e3c6a3", tanS: "#b48c65",
    ol: "#a3a85d", olL: "#c1c47e", olS: "#7f8a4d", olD: "#5d6843",
    birch: "#e3bd8f", birchL: "#f0d3ac", birchS: "#c79a6d", birchD: "#a27757",
    wood: "#d29d6c", woodG: "#c99262", woodS: "#b27c53", woodD: "#956547",
    lit: "#e8bd89", lit2: "#e0b17d", litS: "#c99262",
    metal: "#665f8a", metalL: "#847ea8", metalD: "#4a436f",
    lap: "#cfcde0", lapL: "#e6e5f0", lapS: "#a9a6c4",
    scr: "#f4f7fc", scrS: "#dfe7f3", scrB: "#7e9fd0", scrT: "#b4bfd6",
    rug: "#ecc35f", rugL: "#f6db8f", rugS: "#d6a647", rugC: "#f6ead0", rugB: "#e3937c",
    pil: "#fbf7ee", pilS: "#e4dccb", sheet: "#f3ecdc", sheetS: "#dcd0b8",
    cork: "#d8ab78", corkS: "#bd8d5f"
  };
  const SHADOW = { [P.wood]: P.woodS, [P.woodG]: P.woodS, [P.woodS]: P.woodD, [P.lit]: P.litS, [P.lit2]: P.litS, [P.litS]: P.woodS,
    [P.rug]: P.rugS, [P.rugL]: P.rug, [P.rugC]: P.rugL, [P.rugS]: P.yelD, [P.rugB]: P.coralS };

  /* ====== peta piksel tangan ====== */
  /* daun bulat kecil (pothos) */
  const LF = [".ab.", "abbc", "bbcc", ".cd."];
  /* pot gantung + tanaman di rak */
  const SUCC = ["..a.b..", ".abbbc.", "abbcbcc", ".bc.cc."];
  /* amplop surat di layar (5x4) */
  const ENV = ["abbba", "babab", "bbabb", "aaaaa"];
  /* bulan sabit 9x9 */
  const MOON = [
    "...aab...",
    "..aab....",
    ".aab.....",
    ".aab.....",
    "aaab.....",
    ".aaab....",
    ".aaaab...",
    "..aaaaab.",
    "...aaab.."];
  /* kucing boneka di kasur (8x7) */
  const PLUSH = [
    "a.....a.",
    "aa...aa.",
    "abbbbbac",
    "bdbbdbbc",
    "bbbebbbc",
    ".bbbbbc.",
    "..cccc.."];

  const draw = g => {
    let cur = g;
    const set = (x, y, c) => cur.set(x, y, c), get = (x, y) => cur.get(x, y);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) };
    const HL = (x, y, w, c) => R(x, y, w, 1, c), VL = (x, y, h, c) => R(x, y, 1, h, c);
    const line = (a, b, c, d, col) => cur.line(a, b, c, d, col);
    const spr = (x, y, rows, pal) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(x + i, y + j, pal[ch]) }));
    const remap = (x, y, map) => { const c = g.get(x, y); if (c && map[c]) g.set(x, y, map[c]) };
    const contact = (x, y, w, h = 2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) remap(x + i, y + j, SHADOW) };
    /* piksel emisif (tidak digelapkan malam hari) */
    const EM = new Set(), em = (x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) EM.add((y + j) * W + x + i) };
    const obj = (fn, o = {}) => {
      const t = GLPIX.grid(W, H); cur = t; fn(); cur = g;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = t.g[y][x]; if (c) g.set(x, y, c) }
      if (o.ol === false) return;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (t.g[y][x]) continue;
        const l = t.get(x - 1, y), u = t.get(x, y - 1), r = t.get(x + 1, y), d = t.get(x, y + 1);
        if (l || u) g.set(x, y, o.ink || P.ink); else if (r || d) g.set(x, y, dkc(r || d));
      }
    };
    /* kotak 4 tingkat: isi, sorot kiri/atas, bayang kanan/bawah */
    const box = (x, y, w, h, c, l, s) => { R(x, y, w, h, c); HL(x, y, w, l); VL(x, y, h, l); VL(x + w - 1, y + 1, h - 1, s); HL(x + 1, y + h - 1, w - 1, s) };

    /* ================= DINDING ================= */
    R(0, 0, W, FLOOR, P.wall);
    /* wallpaper garis tegak lembut, berhenti sebelum plint */
    for (let x = 6; x < W; x += 14) R(x, 8, 2, 91, P.wallS);
    R(0, 0, W, 5, P.trim); HL(0, 5, W, P.trimS); HL(0, 6, W, P.wallD); HL(0, 7, W, P.wallS);
    R(0, 99, W, 7, P.trim); HL(0, 98, W, P.wallD); HL(0, 99, W, P.trimS); HL(0, 100, W, P.trimL); HL(0, 104, W, P.trimS); HL(0, 105, W, P.trimD);

    /* ================= LANTAI ================= */
    const VPX = 160, VPY = 20, FW = 15;
    const strip = (x, y) => Math.floor((VPX + (x - VPX) * (FLOOR - VPY) / (y - VPY) - VPX) / FW);
    for (let y = FLOOR; y < H; y++) for (let x = 0; x < W; x++) set(x, y, strip(x, y) & 1 ? P.woodG : P.wood);
    for (let k = -14; k <= 14; k++) {
      const x0 = VPX + k * FW, x1 = VPX + (x0 - VPX) * (H - 1 - VPY) / (FLOOR - VPY);
      line(x0, FLOOR, Math.round(x1), H - 1, P.woodS);
    }
    for (let y = FLOOR + 2; y < H; y++) for (let x = 0; x < W; x++) {
      const s = strip(x, y), jy = FLOOR + 6 + ((s * 13 + 91) % 23);
      if (y === jy && get(x, y) !== P.woodS) set(x, y, P.woodS);
    }
    HL(0, FLOOR, W, P.woodD); HL(0, FLOOR + 1, W, P.woodS);
    /* cahaya jendela di lantai (kiri, di bawah kursi; jauh dari sepatu tokoh) */
    const LIT = { [P.wood]: P.lit, [P.woodG]: P.lit2, [P.woodS]: P.litS };
    for (let y = FLOOR + 3; y < H; y++) {
      const t = (y - FLOOR - 3) / (H - FLOOR - 4);
      if (t > .34 && t < .42) continue;
      [[22, 44, 34, 62], [48, 70, 66, 94]].forEach(([a0, a1, b0, b1]) => {
        const x0 = Math.round(a0 + (b0 - a0) * t), x1 = Math.round(a1 + (b1 - a1) * t);
        for (let x = x0; x <= x1; x++) remap(x, y, LIT);
      });
    }

    /* ================= KARPET ================= */
    obj(() => {
      const T = 111, B = 141;
      for (let y = T; y <= B; y++) {
        const t = (y - T) / (B - T), x0 = Math.round(104 - 14 * t), x1 = Math.round(262 + 16 * t);
        for (let x = x0; x <= x1; x++) {
          const u = (x - x0) / (x1 - x0);
          let c = P.rug;
          if (y === T || x === x0) c = P.rugL;
          else if (y === B || x === x1) c = P.rugS;
          else if (y === T + 3 || y === B - 3 || x === x0 + 5 || x === x1 - 5) c = P.rugC;
          else if (y === T + 4 || y === B - 2 || x === x0 + 6 || x === x1 - 4) c = P.rugS;
          if ((y < T + 3 || y > B - 3) && (x === x0 + 5 || x === x1 - 5)) c = y === T || y === B ? c : P.rug;
          set(x, y, c);
        }
      }
      /* motif belah ketupat koral di tengah */
      [[140, 3], [183, 5], [226, 3]].forEach(([cx, r]) => { const cy = 126;
        for (let j = -r; j <= r; j++) { const w = (r - Math.abs(j)) * 2; for (let i = -w; i <= w; i++) set(cx + i, cy + j, Math.abs(i) >= w - 1 ? P.rugB : r > 3 && Math.abs(i) < w - 3 ? P.rugL : P.rug) } });
      /* rumbai depan */
      for (let x = 92; x <= 276; x += 2) set(x, B + 1, P.rugC);
    }, { ink: P.yelD });

    /* ================= JENDELA + TIRAI ================= */
    const WX = 18, WY = 12, WW = 64, WH = 46, gx = WX + 4, gy = WY + 4, gw = WW - 8, gh = WH - 8;
    const MUL = WX + WW / 2 - 2, TR = WY + 17;
    R(WX - 3, WY + WH + 5, WW + 9, 2, P.wallD);
    obj(() => {
      if (!NIGHT) {
        for (let y = gy; y < gy + gh; y++) HL(gx, y, gw, y < gy + 10 ? P.sky0 : y < gy + 20 ? P.sky1 : y < gy + 29 ? P.sky2 : P.sky3);
        /* matahari pagi rendah + halo pita */
        for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) { const d = x * x + y * y; if (d <= 50 && d > 26) set(gx + 14 + x, gy + 25 + y, P.sky3) }
        for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { const d = x * x + y * y; if (d <= 26) set(gx + 14 + x, gy + 25 + y, d > 17 ? P.sunH : P.sun) }
        const cloud = (x, y, w) => { HL(x + 3, y, w - 7, P.cloud); R(x + 1, y + 1, w - 2, 1, P.cloud); R(x, y + 2, w, 1, P.cloud); HL(x + 1, y + 3, w - 2, P.cloudS) };
        cloud(gx + 30, gy + 6, 14); cloud(gx + 4, gy + 9, 10);
        /* atap rumah tetangga + pohon */
        [[0, 31, 18], [17, 34, 16], [33, 30, 23]].forEach(([bx, by, w]) => { for (let j = 0; j < gh - by; j++) { const o = Math.max(0, 4 - j); HL(gx + bx + o, gy + by + j, w - o * 2, j < 2 ? P.roofS : P.roof) } });
        for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 34) set(gx + 46 + x, gy + 28 + y, y > 2 || x > 3 ? P.treeS : P.tree);
        R(gx + 9, gy + 35, 3, 2, P.yelL); R(gx + 40, gy + 35, 3, 2, P.cream);
      } else {
        for (let y = gy; y < gy + gh; y++) HL(gx, y, gw, y < gy + 10 ? "#2a2a5c" : y < gy + 20 ? "#33336b" : y < gy + 29 ? "#3e3b78" : "#4b4482");
        spr(gx + 38, gy + 4, MOON, { a: "#fbeec0", b: "#d9c88f" });
        [[6, 5], [16, 12], [28, 4], [50, 16], [22, 22], [8, 20], [44, 26]].forEach(([x, y], i) => { set(gx + x, gy + y, i % 3 ? "#cfd6f5" : "#fff4d2"); if (i % 3 === 0) { set(gx + x - 1, gy + y, "#8f93cc"); set(gx + x + 1, gy + y, "#8f93cc"); set(gx + x, gy + y - 1, "#8f93cc"); set(gx + x, gy + y + 1, "#8f93cc") } });
        [[0, 31, 18], [17, 34, 16], [33, 30, 23]].forEach(([bx, by, w]) => { for (let j = 0; j < gh - by; j++) { const o = Math.max(0, 4 - j); HL(gx + bx + o, gy + by + j, w - o * 2, j < 2 ? "#1c1b45" : "#252456") } });
        for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 34) set(gx + 46 + x, gy + 28 + y, "#1f2a48");
        R(gx + 9, gy + 35, 3, 2, "#f8cf6a"); R(gx + 40, gy + 35, 3, 2, "#f2b85a");
      }
      HL(gx, gy, gw, NIGHT ? "#22224f" : P.skyS); HL(gx, TR + 3, gw, NIGHT ? "#22224f" : P.skyS);
      const fb = (x, y, w, h) => R(x, y, w, h, P.frame);
      fb(WX, WY, WW, 4); fb(WX, WY + WH - 4, WW, 4); fb(WX, WY, 4, WH); fb(WX + WW - 4, WY, 4, WH); fb(MUL, WY, 4, WH); fb(WX, TR, WW, 3);
      HL(WX, WY, WW, P.frameL); VL(WX, WY, WH, P.frameL); HL(WX + 4, TR, WW - 8, P.frameL); VL(MUL, WY + 4, WH - 8, P.frameL);
      [WX + WW - 1, MUL + 3].forEach(x => VL(x, WY + 1, WH - 2, P.frameS));
      [WY + WH - 1, TR + 2].forEach(y => HL(WX + 1, y, WW - 2, P.frameS));
      R(WX - 5, WY + WH, WW + 10, 4, P.trim); HL(WX - 5, WY + WH, WW + 10, P.trimL); HL(WX - 5, WY + WH + 3, WW + 10, P.trimS);
    });
    if (NIGHT) for (let y = gy; y < gy + gh; y++) for (let x = gx; x < gx + gw; x++) { const c = g.get(x, y); if (c && c !== P.frame && c !== P.frameL && c !== P.frameS) EM.add(y * W + x) }
    /* kaktus di ambang */
    obj(() => {
      const x = WX + 46, y = WY + WH;
      R(x, y - 5, 6, 5, P.yel); VL(x, y - 5, 5, P.yelL); VL(x + 5, y - 5, 5, P.yelS); HL(x - 1, y - 6, 8, P.yelL);
      R(x + 1, y - 12, 4, 6, P.ol); VL(x + 1, y - 12, 6, P.olL); VL(x + 4, y - 12, 6, P.olS); HL(x + 2, y - 13, 2, P.ol);
      R(x + 5, y - 10, 2, 1, P.ol); set(x + 6, y - 11, P.olL);
    });
    /* rel tirai */
    obj(() => { HL(8, 9, 84, P.metalL); HL(8, 10, 84, P.metal); R(6, 8, 3, 4, P.yelS); R(91, 8, 3, 4, P.yelS) }, { ink: P.inkD });
    /* tirai kuning: lipatan tegak, diikat di y 46 lalu melebar */
    const curtain = (x0, dir) => obj(() => {
      const FOLD = [P.yelL, P.yel, P.yel, P.yelS, P.yel, P.yelL, P.yel, P.yelS, P.yelS, P.yel, P.yelL, P.yel];
      for (let y = 11; y <= 74; y++) {
        let w = 12;
        if (y > 38 && y <= 46) w = 12 - Math.round((y - 38) * .75);
        else if (y > 46) w = Math.min(13, 6 + Math.round((y - 46) * .28));
        for (let i = 0; i < w; i++) {
          const k = Math.floor(i * 12 / w), x = dir > 0 ? x0 + i : x0 - i;
          set(x, y, y === 74 ? P.yelS : FOLD[dir > 0 ? k : 11 - k]);
        }
        /* lipatan atas (kerut di rel) */
        if (y === 11) for (let i = 0; i < w; i += 3) set(dir > 0 ? x0 + i : x0 - i, y, P.yelS);
      }
      /* tali pengikat */
      const tx = dir > 0 ? x0 : x0 - 6; R(tx, 45, 7, 2, P.coral); HL(tx, 45, 7, P.coralL);
    }, { ink: P.yelD });
    curtain(7, 1); curtain(93, -1);

    /* ================= MEJA BELAJAR ================= */
    const DX = 4, DW = 94, DT = 79, DF = 107;
    for (let y = DT + 5; y < DF; y++) for (let x = DX; x < DX + DW; x++) { const c = g.get(x, y); if (c) g.set(x, y, SHADOW[c] || dkc(c, .14)) }
    contact(DX - 1, DF, DW + 3);
    obj(() => {
      /* laci kiri */
      box(DX + 2, DT + 5, 26, DF - DT - 5, P.birch, P.birchL, P.birchS);
      [DT + 14].forEach(y => { HL(DX + 3, y, 24, P.birchS); HL(DX + 3, y + 1, 24, P.birchL) });
      [DT + 9, DT + 20].forEach(y => { R(DX + 12, y, 6, 2, P.yel); HL(DX + 12, y + 1, 6, P.yelS) });
      /* kaki kanan */
      R(DX + DW - 6, DT + 5, 4, DF - DT - 5, P.birch); VL(DX + DW - 6, DT + 5, DF - DT - 5, P.birchL); VL(DX + DW - 3, DT + 5, DF - DT - 5, P.birchS);
      /* daun meja */
      HL(DX, DT, DW, P.birchL); R(DX, DT + 1, DW, 3, P.birch); HL(DX, DT + 4, DW, P.birchS);
    });
    /* tumpukan buku */
    obj(() => {
      box(DX + 6, DT - 3, 16, 3, P.blue, P.blueL, P.blueS);
      box(DX + 7, DT - 6, 14, 3, P.coral, P.coralL, P.coralS);
      box(DX + 6, DT - 9, 15, 3, P.cream, P.creamL, P.creamS); HL(DX + 18, DT - 8, 2, P.yel);
    });
    /* gelas pensil */
    obj(() => {
      line(DX + 27, DT - 12, DX + 28, DT - 6, P.yelS); set(DX + 27, DT - 13, P.coral);
      line(DX + 31, DT - 11, DX + 30, DT - 6, P.blueS); set(DX + 31, DT - 12, P.blueD);
      R(DX + 26, DT - 6, 7, 6, P.blue); VL(DX + 26, DT - 6, 6, P.blueL); VL(DX + 32, DT - 6, 6, P.blueS); HL(DX + 26, DT - 6, 7, P.blueL);
    });
    /* laptop dengan email lowongan */
    const LX = 40, LY = 61;
    obj(() => {
      /* tutup/layar */
      R(LX, LY, 26, 17, P.lap); HL(LX, LY, 26, P.lapL); VL(LX, LY, 17, P.lapL); VL(LX + 25, LY + 1, 16, P.lapS);
      R(LX + 2, LY + 2, 22, 13, P.scr);
      /* bilah atas biru + titik */
      HL(LX + 2, LY + 2, 22, P.scrB); HL(LX + 2, LY + 3, 22, P.scrB); set(LX + 3, LY + 2, P.coralL); set(LX + 5, LY + 2, P.yelL);
      /* daftar kiri */
      R(LX + 2, LY + 4, 5, 11, P.scrS); HL(LX + 3, LY + 6, 3, P.scrT); HL(LX + 3, LY + 8, 2, P.scrT); HL(LX + 3, LY + 10, 3, P.scrT);
      /* amplop kuning + baris teks + tombol "lamar" */
      spr(LX + 9, LY + 5, ENV, { a: P.yelS, b: P.yel });
      HL(LX + 15, LY + 5, 7, P.scrT); HL(LX + 15, LY + 7, 5, P.scrT);
      HL(LX + 9, LY + 10, 13, P.scrT); HL(LX + 9, LY + 12, 9, P.scrT);
      R(LX + 18, LY + 12, 5, 2, P.coral);
      /* alas keyboard */
      R(LX - 3, LY + 17, 32, 2, P.lapL); HL(LX - 3, LY + 18, 32, P.lapS); R(LX + 9, LY + 17, 8, 1, P.lapS);
    }, { ink: P.inkD });
    if (NIGHT) em(LX + 2, LY + 2, 22, 13);
    /* lampu meja (kuning, kepala menunduk ke kiri) */
    const AX = 84;
    obj(() => {
      R(AX - 4, DT - 2, 10, 2, P.yel); HL(AX - 4, DT - 2, 10, P.yelL); HL(AX - 3, DT - 1, 8, P.yelS);
      line(AX + 1, DT - 3, AX + 3, DT - 14, P.yelS); line(AX + 2, DT - 3, AX + 4, DT - 14, P.yel);
      line(AX + 3, DT - 15, AX - 3, DT - 20, P.yelS); line(AX + 4, DT - 15, AX - 2, DT - 20, P.yel);
      /* kap */
      spr(AX - 11, DT - 23, [
        "....abbb..",
        "..abbbbbc.",
        ".abbbbbbbc",
        "abbbbbbbcc",
        "cccccccccd"], { a: P.yelL, b: P.yel, c: P.yelS, d: P.yelD });
      HL(AX - 9, DT - 18, 6, NIGHT ? "#fff6d4" : P.creamL);
    });
    if (NIGHT) em(AX - 9, DT - 18, 6, 1);
    /* gelas */
    obj(() => { R(70, DT - 6, 5, 6, P.cream); VL(70, DT - 6, 6, P.creamL); VL(74, DT - 6, 6, P.creamS); set(75, DT - 4, P.creamS); set(75, DT - 3, P.creamS); HL(71, DT - 6, 3, P.tanS) });

    /* ================= RAK DINDING KECIL ================= */
    const SX = 104, SY = 36, SW = 44;
    R(SX + 2, SY + 3, SW, 1, P.wallD);
    obj(() => {
      /* buku berdiri */
      const BK = [[P.coral, P.coralL, P.coralS], [P.blue, P.blueL, P.blueS], [P.yel, P.yelL, P.yelS], [P.cream, P.creamL, P.creamS]];
      let x = SX + 3;
      [[3, 12, 1], [3, 14, 0], [4, 11, 2], [3, 13, 3]].forEach(([w, h, ci]) => { const [c, l, s] = BK[ci]; R(x, SY - h, w, h, c); VL(x, SY - h, h, l); VL(x + w - 1, SY - h, h, s); HL(x + 1, SY - h + 2, w - 2, s); x += w });
      /* piala kecil */
      R(SX + 22, SY - 2, 6, 2, P.tan); HL(SX + 22, SY - 2, 6, P.tanL);
      R(SX + 24, SY - 5, 2, 3, P.yelS);
      spr(SX + 21, SY - 11, ["abbbbbc", "abbbbbc", ".abbbc.", "..abc.."], { a: P.yelL, b: P.yel, c: P.yelS });
      /* pot tanaman */
      R(SX + 34, SY - 6, 7, 6, P.cream); VL(SX + 34, SY - 6, 6, P.creamL); VL(SX + 40, SY - 6, 6, P.creamS); HL(SX + 33, SY - 7, 9, P.creamS);
      spr(SX + 34, SY - 11, SUCC, { a: P.olL, b: P.ol, c: P.olS });
      /* papan rak + siku */
      R(SX, SY, SW, 3, P.birch); HL(SX, SY, SW, P.birchL); HL(SX, SY + 2, SW, P.birchS);
      [SX + 5, SX + SW - 7].forEach(bx => spr(bx, SY + 3, ["aab", ".ab", "..b"], { a: P.metalL, b: P.metal }));
    });
    /* sulur menjuntai dari pot */
    obj(() => {
      for (let k = 0; k < 4; k++) { const y = SY + 1 + k * 4, x = SX + 41 + [0, 1, 0, -1][k]; VL(x, y, 4, P.olD); spr(x + (k % 2 ? 1 : -3), y + 1, LF.slice(0, 3), { a: P.olL, b: P.ol, c: P.olS, d: P.olD }) }
    }, { ink: P.olD });

    /* ================= POSTER ================= */
    const QX = 162, QY = 16, QW = 26, QH = 34;
    R(QX + 1, QY + QH, QW, 1, P.wallD); VL(QX + QW, QY + 2, QH - 1, P.wallD);
    obj(() => {
      R(QX, QY, QW, QH, P.blueD);
      /* langit pita */
      R(QX + 1, QY + 1, QW - 2, 10, P.blueS); R(QX + 1, QY + 11, QW - 2, 9, P.blue); R(QX + 1, QY + 20, QW - 2, 6, P.blueL);
      /* bintang besar */
      spr(QX + 9, QY + 4, ["...a...", "...a...", "aaabaaa", ".abbba.", "..aba..", ".aa.aa.", ".a...a."], { a: P.yel, b: P.yelL });
      /* gunung + teks */
      for (let x = QX + 1; x < QX + QW - 1; x++) { const h = Math.max(0, 9 - Math.abs(x - QX - 9)), h2 = Math.max(0, 6 - Math.abs(x - QX - 19)); if (h) VL(x, QY + 26 - h, h, x < QX + 9 ? P.creamL : P.cream); if (h2 && h2 >= h) VL(x, QY + 26 - h2, h2, P.creamS) }
      R(QX + 1, QY + 26, QW - 2, QH - 27, P.yel);
      HL(QX + 4, QY + 28, 18, P.yelD); HL(QX + 7, QY + 30, 12, P.yelS);
      [[QX, QY], [QX + QW - 1, QY]].forEach(([x, y]) => set(x, y, P.coral));
    });

    /* ================= PAPAN GABUS ================= */
    const CBX = 198, CBY = 26, CBW = 28, CBH = 20;
    R(CBX + 1, CBY + CBH, CBW, 1, P.wallD); VL(CBX + CBW, CBY + 2, CBH - 1, P.wallD);
    obj(() => {
      box(CBX, CBY, CBW, CBH, P.birch, P.birchL, P.birchS);
      R(CBX + 2, CBY + 2, CBW - 4, CBH - 4, P.cork); HL(CBX + 2, CBY + 2, CBW - 4, P.corkS); VL(CBX + 2, CBY + 2, CBH - 4, P.corkS);
      /* foto polaroid, catatan, jadwal */
      R(CBX + 4, CBY + 4, 8, 9, P.creamL); R(CBX + 5, CBY + 5, 6, 5, P.blueL); HL(CBX + 5, CBY + 9, 6, P.ol); set(CBX + 7, CBY + 4, P.coral);
      R(CBX + 14, CBY + 5, 9, 8, P.yelL); HL(CBX + 15, CBY + 7, 6, P.yelS); HL(CBX + 15, CBY + 9, 4, P.yelS); set(CBX + 18, CBY + 5, P.blueS);
      R(CBX + 12, CBY + 13, 7, 4, P.coralL); HL(CBX + 13, CBY + 14, 4, P.coral);
    });

    /* ================= LAMPU TUMBLER ================= */
    const bulbs = [];
    obj(() => {
      const x0 = 232, x1 = 318, y0 = 42, sag = 7;
      for (let x = x0; x <= x1; x++) { const t = (x - x0) / (x1 - x0), y = Math.round(y0 + sag * 4 * t * (1 - t) - 3 * t); set(x, y, P.metal); if ((x - x0) % 9 === 4) bulbs.push([x, y + 1]) }
      bulbs.forEach(([x, y], i) => {
        const c = [P.yel, P.coralL, P.blueL][i % 3], on = NIGHT ? "#fff1b8" : c, sd = NIGHT ? "#ffd56e" : dkc(c, .18);
        set(x, y, P.metalD); set(x + 1, y, P.metalD);
        R(x, y + 1, 2, 2, on); set(x + 1, y + 2, sd); set(x, y + 3, sd);
      });
    }, { ol: false });
    if (NIGHT) bulbs.forEach(([x, y]) => em(x, y + 1, 2, 3));

    /* ================= POSTER KECIL DI ATAS KASUR ================= */
    const KX = 262, KY = 12, KW = 22, KH = 24;
    R(KX + 1, KY + KH, KW, 1, P.wallD); VL(KX + KW, KY + 2, KH - 1, P.wallD);
    obj(() => {
      box(KX, KY, KW, KH, P.creamL, P.trimL, P.creamS);
      R(KX + 2, KY + 2, KW - 4, KH - 4, P.coral);
      for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 18) set(KX + 11 + x, KY + 10 + y, x + y < -2 ? P.yelL : P.yel);
      R(KX + 2, KY + 16, KW - 4, 6, P.coralS); HL(KX + 5, KY + 18, 12, P.creamL);
    });

    /* ================= KASUR (kanan) ================= */
    const BX = 226, BR = 318, BT = 84, BF = 113;
    contact(BX - 1, BF, BR - BX + 4);
    obj(() => {
      /* sandaran kepala (kanan, menempel dinding) */
      R(302, 58, 16, 52, P.blue); HL(302, 58, 16, P.blueL); VL(302, 58, 52, P.blueL); VL(317, 59, 51, P.blueS);
      R(305, 62, 10, 20, P.blueS); HL(305, 62, 10, P.blueD); VL(305, 62, 20, P.blueD); R(306, 63, 8, 18, P.blue); HL(306, 63, 8, P.blueL);
      HL(304, 57, 12, P.blueL);
      /* rangka */
      R(BX + 4, 98, BR - BX - 20, 9, P.blue); HL(BX + 4, 98, BR - BX - 20, P.blueL); HL(BX + 4, 106, BR - BX - 20, P.blueS);
      [BX + 6, BR - 22].forEach(x => { R(x, 107, 4, BF - 107, P.blueS); VL(x, 107, BF - 107, P.blue) });
      /* kasur + sprei */
      R(BX + 4, BT, BR - BX - 20, 14, P.sheet); HL(BX + 4, BT, BR - BX - 20, P.pil); HL(BX + 4, BT + 13, BR - BX - 20, P.sheetS);
      /* sandaran kaki (kiri) */
      R(BX, 76, 6, 36, P.blue); VL(BX, 76, 36, P.blueL); HL(BX, 76, 6, P.blueL); VL(BX + 5, 77, 35, P.blueS); cur.g[76][BX] = null; cur.g[76][BX + 5] = null;
    });
    /* bantal */
    obj(() => {
      spr(282, 74, [
        "..aaaaaaaaaaa...",
        ".aabbbbbbbbbbba.",
        "aabbbbbbbbbbbbbc",
        "abbbbbbbbbbbbbbc",
        "abbbbbbbbbbbbbcc",
        "bbbbbbbbbbbbbbcc",
        ".bbbbbbbbbbbbcc.",
        "..cccccccccccc.."], { a: P.trimL, b: P.pil, c: P.pilS });
    });
    /* selimut kuning: permukaan atas terang (4 baris), tepi lipat, sisi depan bermotif, keliman bawah */
    obj(() => {
      const x0 = BX + 6, x1 = 286, TOP = BT - 3, EDGE = BT + 1, BOT = 102;
      for (let y = TOP; y <= BOT; y++) for (let x = x0; x <= x1; x++) {
        const fx = x - x0, fy = y - EDGE;
        let c;
        if (y < EDGE) c = y === TOP ? P.creamL : P.yelL;
        else if (y === EDGE) c = P.yelS;
        else if (y >= BOT - 1) c = P.yelS;
        else {
          c = P.yel;
          /* motif bunga kecil krem berselang-seling */
          const mx = (fx + (Math.floor(fy / 5) % 2) * 5) % 10, my = fy % 5;
          if ((mx === 4 && (my === 1 || my === 3)) || (my === 2 && (mx === 3 || mx === 5))) c = P.yelL;
          if (mx === 4 && my === 2) c = P.creamL;
        }
        if (x >= x1 - 1 && y >= EDGE) c = P.yelS;
        set(x, y, c);
      }
      /* keliman sedikit bergelombang */
      for (let x = x0; x <= x1; x++) if ((x - x0) % 12 > 5) set(x, BOT + 1, P.yelS);
      /* lipatan sprei krem di dekat bantal */
      R(x1 - 9, TOP, 8, 3, P.sheet); HL(x1 - 9, TOP, 8, P.pil); HL(x1 - 9, TOP + 2, 8, P.sheetS);
      /* lipatan kain tegak (sisi gelap 1 px + sorot 1 px) */
      [x0 + 17, x0 + 39].forEach(x => { VL(x, EDGE + 3, BOT - EDGE - 3, P.yelS); VL(x + 1, EDGE + 4, BOT - EDGE - 5, P.yelL) });
    }, { ink: P.yelD });
    /* boneka kucing */
    obj(() => spr(268, 75, PLUSH, { a: P.coralS, b: P.creamL, c: P.creamS, d: P.inkD, e: P.coral }));

    /* ================= KURSI MEJA (di depan meja) ================= */
    const CX = 58, CY = 74;
    contact(CX - 13, CY + 39, 28);
    obj(() => {
      /* sandaran */
      spr(CX - 9, CY, [
        "..aaaaaaaaaaaaa...",
        ".abbbbbbbbbbbbbc..",
        "abbbbbbbbbbbbbbbc.",
        "abbbbbbbbbbbbbbbc.",
        "abbbbbbbbbbbbbbbc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbbcc.",
        "abbbbbbbbbbbbbcc..",
        ".abbbbbbbbbbbccc..",
        "..cccccccccccc...."], { a: P.coralL, b: P.coral, c: P.coralS });
      R(CX - 1, CY + 13, 3, 7, P.metal); VL(CX - 1, CY + 13, 7, P.metalL);
      /* dudukan */
      spr(CX - 12, CY + 20, [
        ".aaaaaaaaaaaaaaaaaaaaa.",
        "abbbbbbbbbbbbbbbbbbbbbc",
        "abbbbbbbbbbbbbbbbbbbbcc",
        ".ccccccccccccccccccccc."], { a: P.coralL, b: P.coral, c: P.coralS });
      R(CX - 1, CY + 24, 3, 9, P.metal); VL(CX - 1, CY + 24, 9, P.metalL);
      HL(CX - 10, CY + 33, 21, P.metalL); HL(CX - 10, CY + 34, 21, P.metal);
      [CX - 11, CX, CX + 10].forEach(x => R(x, CY + 35, 2, 2, P.metalD));
    });

    /* ================= MALAM: palet gelap + cahaya pita ================= */
    if (NIGHT) {
      const cache = new Map();
      const tone = (c, k) => {
        const key = c + k; if (cache.has(key)) return cache.get(key);
        const n = mix(mix(c, "#1b1a4e", .6), "#05041a", .4);           /* dasar malam: biru-ungu dalam */
        const v = k === 0 ? n
          : k === 1 ? mix(mix(c, "#2a1f50", .56), "#c8703c", .2)         /* hangat redup */
          : k === 2 ? mix(mix(c, "#4a2c4a", .2), "#ffb24f", .24)         /* hangat terang */
          : k === 3 ? mix(n, "#6a9cf4", .3)                              /* cahaya layar */
          : k === 5 ? mix(n, "#5f8ff0", .15)                             /* cahaya layar, pita luar */
          : k === 6 ? mix(n, "#d0843c", .16)                              /* hangat paling luar */
          : mix(n, "#7f8fd8", .16);                                      /* cahaya bulan */
        cache.set(key, v); return v;
      };
      /* sumber: kap lampu (bola di x 75-80, y 61) menyorot ke bawah berupa kerucut berpita; layar laptop
         menerangi meja & sandaran kursi di depannya (bukan cakram di dinding) */
      const lamp = (x, y) => {
        const cx = 77.5, dy = y - 61;
        if (dy >= 0 && y <= DT + 3) {                                    /* kerucut ke meja */
          const half = 3.5 + dy * 1.15, ax = Math.abs(x - cx - dy * .15);
          if (ax <= half * .55 && dy < 15) return 2; if (ax <= half) return 1;
        }
        if (y > DT + 3 && y <= DT + 6 && Math.abs(x - cx) <= 16) return 1;   /* tepi depan meja */
        const e = Math.hypot((x - cx) / 1.35, y - 59);                    /* halo kecil di dinding sekitar kap */
        if (e < 5.5) return 2; if (e < 11) return 1; if (e < 18) return 6;
        return 0;
      };
      const screen = (x, y) => {
        if (y < LY + 15 || y > LY + 25) return 0;
        const dy = y - LY - 15, x0 = LX - 2 - dy * .45, x1 = LX + 27 + dy * .45;
        if (x < x0 || x > x1) return 0;
        return dy < 5 && x > x0 + 3 && x < x1 - 3 ? 3 : 5;
      };
      const moon = (x, y) => {
        if (y < FLOOR + 3) return 0; const t = (y - FLOOR - 3) / (H - FLOOR - 4); if (t > .34 && t < .42) return 0;
        return [[22, 44, 34, 62], [48, 70, 66, 94]].some(([a0, a1, b0, b1]) => x >= Math.round(a0 + (b0 - a0) * t) && x <= Math.round(a1 + (b1 - a1) * t)) ? 4 : 0;
      };
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (EM.has(y * W + x)) continue; const c = g.get(x, y); if (!c) continue;
        let k = lamp(x, y); if (!k) k = screen(x, y); if (!k) k = moon(x, y);
        /* lampu tumbler: halo kecil hangat */
        if (!k) for (const [bx, by] of bulbs) if (Math.abs(x - bx) <= 3 && Math.abs(y - by - 1) <= 3 && Math.abs(x - bx) + Math.abs(y - by - 1) <= 4) { k = 1; break }
        g.set(x, y, tone(c, k));
      }
      /* bola lampu menyala */
      R(AX - 8, DT - 17, 4, 1, "#ffe9a8"); set(AX - 6, DT - 16, "#ffd36e");
    }
  };

  SIMPX.bg(ID, { w: W, h: H, floorY: 125, standX: 110, dark: NIGHT, draw });
})();

/* ===== rumah ===== */
/* Latar "rumah" (320x150): ruang keluarga yang hangat, sore. Teknik sama dengan kantor.js / kamar.js:
   - tanpa dither; gradasi = pita warna datar; tiap benda satu lapisan dengan garis tepi selektif
     (sisi kiri/atas = tinta navy lembut, sisi kanan/bawah = versi gelap bidang);
   - lantai papan mengarah ke penonton, bayangan kontak 2 piksel untuk benda yang berdiri;
   - dinding bertemu lantai di y 106, kaki tokoh di y 125; area tokoh x 100-270 dibiarkan lega:
     sandaran sofa (biru berdebu) rendah di belakang NPC, bingkai foto keluarga di atas kepala hero.
   - Aksen: koral/terakota hangat + biru berdebu; tanaman zaitun; dinding peach hangat. */
(() => {
  const W = 320, H = 150, FLOOR = 106;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const th = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return th(x.map((v, i) => v + (y[i] - v) * t)) };
  const dkc = (c, t = .4) => mix(mix(c, "#3a3470", t * .6), "#000000", t * .3);

  const P = {
    ink: "#5d5584", inkD: "#463f6c",
    wall: "#f1dcc6", wallL: "#f7e8d6", wallS: "#e8cfb6", wallD: "#d8b99e",
    trim: "#f7efe0", trimL: "#fdf8ee", trimS: "#e4d4bb", trimD: "#d0bc9f",
    sky0: "#b9d1ea", sky1: "#cfdfee", sky2: "#f1e3c8", sky3: "#f6d3a6", skyS: "#a9c2df", sun: "#fff1cf", sunH: "#f9d68e",
    cloud: "#fbf3e6", cloudS: "#eedbd0",
    hill: "#b9b98a", hillS: "#9ea576", roof: "#c99a8a", roofS: "#a87c74",
    frame: "#f6f0e2", frameL: "#fdfaf3", frameS: "#dccfb6",
    sheer: "#fbf3e3", sheerS: "#ecdcc0", sheerD: "#d9c3a0",
    yel: "#f2c14e", yelL: "#f8da82", yelS: "#d99d3c", yelD: "#b27a3c",
    coral: "#e3937c", coralL: "#efb29d", coralS: "#c2735f", coralD: "#a35a50",
    blue: "#8fa8cf", blueL: "#b3c6e3", blueS: "#728cb8", blueD: "#5b739f",
    cream: "#f2e5c9", creamL: "#fbf4e3", creamS: "#d8c6a4",
    tan: "#d3ae86", tanL: "#e3c6a3", tanS: "#b48c65",
    ol: "#a3a85d", olL: "#c1c47e", olS: "#7f8a4d", olD: "#5d6843",
    walnut: "#b98256", walnutL: "#cf9a6c", walnutS: "#99673f", walnutD: "#7a4f35",
    wood: "#cf9867", woodG: "#c68e5e", woodS: "#ad7850", woodD: "#8f6245",
    lit: "#e6ba86", lit2: "#ddae7a", litS: "#c68e5e",
    metal: "#665f8a", metalL: "#847ea8", metalD: "#4a436f",
    rug: "#efdcbc", rugL: "#f8ecd6", rugS: "#dcc29b", rugB: "#d9826b", rugBL: "#e9a28b", rugBS: "#b8655a",
    skin: "#f2c597", skinS: "#d39a6c", hair: "#71482f", hairD: "#4a2e22"
  };
  const SHADOW = { [P.wood]: P.woodS, [P.woodG]: P.woodS, [P.woodS]: P.woodD, [P.lit]: P.litS, [P.lit2]: P.litS, [P.litS]: P.woodS,
    [P.rug]: P.rugS, [P.rugL]: P.rug, [P.rugS]: P.tanS, [P.rugB]: P.rugBS, [P.rugBL]: P.rugB, [P.rugBS]: P.coralD };

  /* ====== peta piksel tangan ====== */
  /* daun fiddle-leaf (8x10), sama dengan kantor */
  const LEAF = [
    "...ab...",
    "..aabbd.",
    ".aabbbcd",
    "aabbbbcd",
    "abbbbccd",
    "abbbbccd",
    ".bbbccd.",
    ".bbccdd.",
    "..bcdd..",
    "...dd..."];
  const LEAF_F = LEAF.map(r => [...r].reverse().join("").replace(/a/g, "x").replace(/d/g, "a").replace(/x/g, "d"));
  /* vas keramik leher ramping (9x12) */
  const VASE = [
    "...abc...",
    "...abc...",
    "..aabcc..",
    ".aabbbcc.",
    "aabbbbbcc",
    "abbbbbbcc",
    "abbbbbbcc",
    "abbbbbbcd",
    ".abbbbcd.",
    ".abbbccd.",
    "..bcccd..",
    "...ddd..."];
  /* bunga kecil (5x5): kelopak a/b, putik c */
  const FLW = [".aa..", "abbaa", "abcba", ".abb.", "..b.."];
  /* teko keramik (13x10) */
  const POT = [
    "....aab......",
    "...abbbc.....",
    "..aaaaaaaa...",
    "eabbbbbbbbc.f",
    "eabbbbbbbbccf",
    "e.abbbbbbbcff",
    "..abbbbbbbcf.",
    "..abbbbbbccd.",
    "...bbbbbccd..",
    "....dddddd..."];
  /* bantal sofa 15x12 (sudut runcing khas bantal) */
  const PILLOW = [
    "aa...........b",
    "aaabbbbbbbbbbc",
    ".abbbbbbbbbbc.",
    ".abbbbbbbbbbc.",
    ".abbbbbbbbbbc.",
    ".abbbbbbbbbbc.",
    ".abbbbbbbbbcc.",
    ".abbbbbbbbbcc.",
    ".bbbbbbbbbccc.",
    "bcccccccccccdd",
    "c...........dd"];
  /* foto keluarga: kepala + bahu (7x8) */
  const PERSON = [
    "..hhh..",
    ".hhhhh.",
    ".hssss.",
    ".ssssS.",
    "..sss..",
    ".ccccc.",
    "ccccccC",
    "ccccccC"];
  /* jam dinding kecil kayu (11x11) */
  const CLOCK = [
    "...aaab....",
    ".aabbbbbc..",
    ".abcccccbd.",
    "abcccccccbd",
    "abccceccbbd",
    "abccceeccbd",
    "abcccccccbd",
    "abcccccccbd",
    ".bbcccccbdd",
    "..bbbbbbdd.",
    "....ddddd.."];

  const draw = g => {
    let cur = g;
    const set = (x, y, c) => cur.set(x, y, c), get = (x, y) => cur.get(x, y);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) };
    const HL = (x, y, w, c) => R(x, y, w, 1, c), VL = (x, y, h, c) => R(x, y, 1, h, c);
    const line = (a, b, c, d, col) => cur.line(a, b, c, d, col);
    const spr = (x, y, rows, pal) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(x + i, y + j, pal[ch]) }));
    const remap = (x, y, map) => { const c = g.get(x, y); if (c && map[c]) g.set(x, y, map[c]) };
    const contact = (x, y, w, h = 2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) remap(x + i, y + j, SHADOW) };
    const obj = (fn, o = {}) => {
      const t = GLPIX.grid(W, H); cur = t; fn(); cur = g;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = t.g[y][x]; if (c) g.set(x, y, c) }
      if (o.ol === false) return;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (t.g[y][x]) continue;
        const l = t.get(x - 1, y), u = t.get(x, y - 1), r = t.get(x + 1, y), d = t.get(x, y + 1);
        if (l || u) g.set(x, y, o.ink || P.ink); else if (r || d) g.set(x, y, dkc(r || d));
      }
    };
    const box = (x, y, w, h, c, l, s) => { R(x, y, w, h, c); HL(x, y, w, l); VL(x, y, h, l); VL(x + w - 1, y + 1, h - 1, s); HL(x + 1, y + h - 1, w - 1, s) };
    /* bayangan jatuh solid di dinding (kanan-bawah benda) */
    const wallSh = (x, y, w, h) => { R(x + 2, y + h, w - 1, 1, P.wallD); VL(x + w, y + 2, h - 1, P.wallD) };

    /* ================= DINDING ================= */
    R(0, 0, W, FLOOR, P.wall);
    /* motif wallpaper: belah ketupat kecil jarang, satu tone, baris berselang */
    for (let y = 16, r = 0; y < 94; y += 13, r++) for (let x = 6 + (r % 2) * 9; x < W; x += 18) {
      set(x, y - 1, P.wallS); set(x - 1, y, P.wallS); set(x + 1, y, P.wallS); set(x, y + 1, P.wallS);
    }
    /* list langit-langit + rel foto */
    R(0, 0, W, 5, P.trim); HL(0, 5, W, P.trimS); HL(0, 6, W, P.wallD); HL(0, 7, W, P.wallS);
    /* plint */
    R(0, 99, W, 7, P.trim); HL(0, 98, W, P.wallD); HL(0, 99, W, P.trimS); HL(0, 100, W, P.trimL); HL(0, 104, W, P.trimS); HL(0, 105, W, P.trimD);

    /* ================= LANTAI ================= */
    const VPX = 160, VPY = 20, FW = 15;
    const strip = (x, y) => Math.floor((VPX + (x - VPX) * (FLOOR - VPY) / (y - VPY) - VPX) / FW);
    for (let y = FLOOR; y < H; y++) for (let x = 0; x < W; x++) set(x, y, strip(x, y) & 1 ? P.woodG : P.wood);
    for (let k = -14; k <= 14; k++) {
      const x0 = VPX + k * FW, x1 = VPX + (x0 - VPX) * (H - 1 - VPY) / (FLOOR - VPY);
      line(x0, FLOOR, Math.round(x1), H - 1, P.woodS);
    }
    for (let y = FLOOR + 2; y < H; y++) for (let x = 0; x < W; x++) {
      const s = strip(x, y), jy = FLOOR + 6 + ((s * 17 + 53) % 23);
      if (y === jy && get(x, y) !== P.woodS) set(x, y, P.woodS);
    }
    HL(0, FLOOR, W, P.woodD); HL(0, FLOOR + 1, W, P.woodS);
    /* cahaya jendela sore di lantai (kiri, jatuh agak ke kanan) */
    const LIT = { [P.wood]: P.lit, [P.woodG]: P.lit2, [P.woodS]: P.litS };
    for (let y = FLOOR + 3; y < H; y++) {
      const t = (y - FLOOR - 3) / (H - FLOOR - 4);
      if (t > .36 && t < .44) continue;
      [[16, 38, 30, 58], [42, 64, 62, 90]].forEach(([a0, a1, b0, b1]) => {
        const x0 = Math.round(a0 + (b0 - a0) * t), x1 = Math.round(a1 + (b1 - a1) * t);
        for (let x = x0; x <= x1; x++) remap(x, y, LIT);
      });
    }

    /* ================= KARPET OVAL ================= */
    obj(() => {
      const CX = 196, CY = 128, RX = 104, RY = 15;
      for (let y = CY - RY; y <= CY + RY; y++) for (let x = CX - RX; x <= CX + RX; x++) {
        const e = ((x - CX) / RX) ** 2 + ((y - CY) / RY) ** 2; if (e > 1) continue;
        const e2 = ((x - CX) / (RX - 9)) ** 2 + ((y - CY) / (RY - 3)) ** 2, e3 = ((x - CX) / (RX - 13)) ** 2 + ((y - CY) / (RY - 4)) ** 2;
        const e4 = ((x - CX) / (RX - 40)) ** 2 + ((y - CY) / (RY - 7)) ** 2;
        let c;
        if (e2 > 1) c = y < CY - 2 ? P.rugBL : y > CY + 4 ? P.rugBS : P.rugB;     /* pinggir koral */
        else if (e3 > 1) c = y < CY ? P.rugL : P.rugS;                              /* pita krem */
        else c = P.rug;
        if (e4 <= 1) c = e4 > .72 ? P.rugB : y < CY ? P.rugL : P.rug;                  /* medali tengah */
        set(x, y, c);
      }
      /* motif: tiga belah ketupat biru di medali + titik koral */
      [[-22, 2], [0, 3], [22, 2]].forEach(([dx, r]) => { const cx = CX + dx, cy = CY;
        for (let j = -r; j <= r; j++) { const w = (r - Math.abs(j)) * 2; for (let i = -w; i <= w; i++) set(cx + i, cy + j, Math.abs(i) >= w - 1 ? P.blueS : P.blueL) } });
      /* rumbai di kedua ujung */
      for (let j = -3; j <= 3; j += 2) { HL(CX - RX - 3, CY + j, 3, P.rugL); HL(CX + RX + 1, CY + j, 3, P.rugS) }
      [-48, 48].forEach(dx => { set(CX + dx, CY, P.rugBS); set(CX + dx - 1, CY, P.rugB); set(CX + dx + 1, CY, P.rugB) });
    }, { ink: P.coralD });

    /* ================= JENDELA + TIRAI TIPIS ================= */
    const WX = 14, WY = 12, WW = 58, WH = 48, gx = WX + 4, gy = WY + 4, gw = WW - 8, gh = WH - 8;
    const MUL = WX + WW / 2 - 2, TR = WY + 17;
    R(WX - 3, WY + WH + 5, WW + 9, 2, P.wallD);
    obj(() => {
      for (let y = gy; y < gy + gh; y++) HL(gx, y, gw, y < gy + 10 ? P.sky0 : y < gy + 19 ? P.sky1 : y < gy + 28 ? P.sky2 : P.sky3);
      /* matahari sore rendah + halo pita */
      for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) { const d = x * x + y * y; if (d <= 50 && d > 26) set(gx + 36 + x, gy + 27 + y, P.sky3) }
      for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { const d = x * x + y * y; if (d <= 26) set(gx + 36 + x, gy + 27 + y, d > 17 ? P.sunH : P.sun) }
      const cloud = (x, y, w) => { HL(x + 3, y, w - 7, P.cloud); R(x + 1, y + 1, w - 2, 1, P.cloud); R(x, y + 2, w, 1, P.cloud); HL(x + 1, y + 3, w - 2, P.cloudS) };
      cloud(gx + 4, gy + 6, 14); cloud(gx + 30, gy + 12, 11);
      /* bukit + atap rumah tetangga */
      for (let x = 0; x < gw; x++) { const h = Math.round(8 + 3 * Math.sin(x / 7)); VL(gx + x, gy + gh - h, h, x % 17 < 9 ? P.hill : P.hillS) }
      [[3, 30, 15], [28, 33, 13]].forEach(([bx, by, w]) => { for (let j = 0; j < gh - by; j++) { const o = Math.max(0, 4 - j); HL(gx + bx + o, gy + by + j, w - o * 2, j < 2 ? P.roofS : P.roof) } });
      R(gx + 8, gy + 36, 2, 2, P.yelL); R(gx + 33, gy + 38, 2, 2, P.cream);
      HL(gx, gy, gw, P.skyS); HL(gx, TR + 3, gw, P.skyS);
      const fb = (x, y, w, h) => R(x, y, w, h, P.frame);
      fb(WX, WY, WW, 4); fb(WX, WY + WH - 4, WW, 4); fb(WX, WY, 4, WH); fb(WX + WW - 4, WY, 4, WH); fb(MUL, WY, 4, WH); fb(WX, TR, WW, 3);
      HL(WX, WY, WW, P.frameL); VL(WX, WY, WH, P.frameL); HL(WX + 4, TR, WW - 8, P.frameL); VL(MUL, WY + 4, WH - 8, P.frameL);
      [WX + WW - 1, MUL + 3].forEach(x => VL(x, WY + 1, WH - 2, P.frameS));
      [WY + WH - 1, TR + 2].forEach(y => HL(WX + 1, y, WW - 2, P.frameS));
      R(WX - 5, WY + WH, WW + 10, 4, P.trim); HL(WX - 5, WY + WH, WW + 10, P.trimL); HL(WX - 5, WY + WH + 3, WW + 10, P.trimS);
    });
    /* rel tirai kayu */
    obj(() => { HL(5, 9, 76, P.walnutL); HL(5, 10, 76, P.walnut); R(3, 8, 3, 4, P.walnutS); R(80, 8, 3, 4, P.walnutS) }, { ink: P.inkD });
    /* tirai krem tipis: lipatan tegak lembut, diikat tali koral */
    const curtain = (x0, dir) => obj(() => {
      const FOLD = [P.sheer, P.sheer, P.sheerS, P.sheer, P.sheer, P.sheerS, P.sheerD, P.sheerS, P.sheer, P.sheerS];
      for (let y = 11; y <= 70; y++) {
        let w = 10;
        if (y > 38 && y <= 45) w = 10 - Math.round((y - 38) * .7);
        else if (y > 45) w = Math.min(11, 5 + Math.round((y - 45) * .26));
        for (let i = 0; i < w; i++) {
          const k = Math.floor(i * 10 / w), x = dir > 0 ? x0 + i : x0 - i;
          set(x, y, y === 70 ? P.sheerD : FOLD[dir > 0 ? k : 9 - k]);
        }
        if (y === 11) for (let i = 0; i < w; i += 3) set(dir > 0 ? x0 + i : x0 - i, y, P.sheerD);
      }
      const tx = dir > 0 ? x0 : x0 - 5; R(tx, 44, 6, 2, P.coral); HL(tx, 44, 6, P.coralL);
    }, { ink: P.sheerD });
    curtain(5, 1); curtain(81, -1);

    /* ================= BUFET RENDAH DI BAWAH JENDELA ================= */
    const BX = 6, BW = 70, BT = 80, BF = 108;
    contact(BX - 1, BF, BW + 3);
    obj(() => {
      /* kaki runcing */
      [BX + 3, BX + BW - 6].forEach(x => { R(x, BT + 22, 3, BF - BT - 22, P.walnut); VL(x, BT + 22, BF - BT - 22, P.walnutL); VL(x + 2, BT + 22, BF - BT - 22, P.walnutS) });
      /* badan */
      box(BX, BT + 3, BW, 20, P.walnut, P.walnutL, P.walnutS);
      /* dua pintu + satu deret laci */
      [[BX + 3, 21], [BX + 26, 21]].forEach(([x, w]) => { box(x, BT + 6, w, 14, P.walnutL, P.tanL, P.walnutS); R(x + 2, BT + 8, w - 4, 10, P.walnut); HL(x + 2, BT + 8, w - 4, P.walnutS) });
      box(BX + 49, BT + 6, 18, 6, P.walnutL, P.tanL, P.walnutS); box(BX + 49, BT + 13, 18, 7, P.walnutL, P.tanL, P.walnutS);
      [[BX + 22, BT + 12], [BX + 27, BT + 12], [BX + 57, BT + 8], [BX + 57, BT + 16]].forEach(([x, y]) => { R(x, y, 2, 2, P.yel); set(x + 1, y + 1, P.yelS) });
      /* daun bufet */
      HL(BX - 2, BT, BW + 4, P.walnutL); R(BX - 2, BT + 1, BW + 4, 2, P.walnut); HL(BX - 2, BT + 3, BW + 4, P.walnutD);
    });
    /* vas bunga di bufet */
    obj(() => {
      const x = BX + 8, y = BT - 12;
      /* tangkai */
      line(x + 4, y, x + 1, y - 9, P.olS); line(x + 4, y, x + 7, y - 11, P.olS); line(x + 4, y, x + 4, y - 14, P.olS);
      spr(x + 3, y - 6, ["ab", "bc"], { a: P.olL, b: P.ol, c: P.olS }); spr(x - 1, y - 5, ["ab", ".c"], { a: P.olL, b: P.ol, c: P.olS });
      spr(x - 2, y - 13, FLW, { a: P.coralL, b: P.coral, c: P.yel });
      spr(x + 5, y - 15, FLW, { a: P.yelL, b: P.yel, c: P.coralS });
      spr(x + 2, y - 19, FLW, { a: P.creamL, b: P.cream, c: P.yel });
      spr(x, y, VASE, { a: P.blueL, b: P.blue, c: P.blueS, d: P.blueD });
      HL(x + 2, y + 5, 5, P.creamL);
    });
    /* tumpukan buku + radio kecil */
    obj(() => {
      box(BX + 24, BT - 3, 18, 3, P.coral, P.coralL, P.coralS);
      box(BX + 25, BT - 6, 15, 3, P.cream, P.creamL, P.creamS); HL(BX + 36, BT - 5, 2, P.blueS);
    });
    obj(() => {
      const x = BX + 48, y = BT - 11;
      box(x, y, 18, 11, P.coral, P.coralL, P.coralS);
      R(x + 2, y + 2, 8, 7, P.coralS); for (let j = 0; j < 3; j++) HL(x + 3, y + 3 + j * 2, 6, P.coralD);
      R(x + 12, y + 2, 4, 3, P.creamL); HL(x + 12, y + 4, 4, P.creamS); set(x + 13, y + 3, P.coralD);
      R(x + 12, y + 7, 2, 2, P.cream); set(x + 13, y + 8, P.creamS);
      line(x + 14, y - 1, x + 16, y - 5, P.metalL); set(x + 16, y - 6, P.metal);
    });

    /* ================= TANAMAN POT BESAR (antara bufet dan hero) ================= */
    const PX = 86, PB = 118;
    contact(PX - 7, PB, 16);
    const back = [[-12, -54, 0], [1, -62, 1], [8, -50, 1], [-15, -38, 0]];
    const front = [[-8, -50, 0], [3, -55, 1], [-13, -30, 0], [7, -37, 1], [-3, -41, 0], [2, -27, 1]];
    obj(() => [...back, ...front].forEach(([dx, dy]) => line(PX, PB - 15, PX + dx + 4, PB + dy + 9, P.olD)), { ol: false });
    obj(() => {
      const fr = { a: P.olL, b: P.ol, c: P.olS, d: P.olD }, bk = { a: P.ol, b: P.olS, c: P.olD, d: P.olD };
      back.forEach(([dx, dy, f]) => spr(PX + dx, PB + dy, f ? LEAF_F : LEAF, bk));
      front.forEach(([dx, dy, f]) => spr(PX + dx, PB + dy, f ? LEAF_F : LEAF, fr));
      /* keranjang anyaman krem: pita horizontal datar */
      for (let j = 0; j < 14; j++) { const hw = 7 - Math.floor(j / 6), y = PB - 14 + j; HL(PX - hw, y, hw * 2 + 1, j % 3 === 2 ? P.creamS : P.cream); set(PX - hw, y, P.creamL); set(PX + hw, y, P.tanS); set(PX + hw - 1, y, j % 3 === 2 ? P.tanS : P.creamS) }
      R(PX - 8, PB - 17, 17, 3, P.tan); HL(PX - 8, PB - 17, 17, P.tanL); HL(PX - 8, PB - 15, 17, P.tanS);
      HL(PX - 5, PB - 1, 11, P.tanS);
    });

    /* ================= GALERI FOTO KELUARGA (di atas kepala hero) ================= */
    const frameArt = (x, y, w, h, matC, draw2) => {
      wallSh(x, y, w, h);
      obj(() => { box(x, y, w, h, P.walnut, P.walnutL, P.walnutD); R(x + 2, y + 2, w - 4, h - 4, matC); HL(x + 2, y + 2, w - 4, P.creamS); draw2(x + 3, y + 3, w - 6, h - 6) });
    };
    const pal = (c, C, h) => ({ h: h || P.hair, s: P.skin, S: P.skinS, c, C });
    /* foto besar: keluarga empat orang dengan langit biru */
    frameArt(104, 16, 34, 26, P.creamL, (x, y, w, h) => {
      R(x, y, w, h, P.blueL); R(x, y + h - 6, w, 6, P.hill); HL(x, y + h - 6, w, P.olL);
      spr(x + 2, y + h - 10, PERSON, pal(P.coral, P.coralS, P.hairD));
      spr(x + 9, y + h - 12, PERSON, pal(P.blue, P.blueS));
      spr(x + 17, y + h - 8, PERSON.slice(0, 6), pal(P.yel, P.yelS));
      spr(x + 21, y + h - 11, PERSON, pal(P.cream, P.creamS, P.hairD));
    });
    /* foto kecil kiri-bawah: wisuda (toga) */
    frameArt(142, 14, 18, 22, P.creamL, (x, y, w, h) => {
      R(x, y, w, h, P.coralL);
      spr(x + 5, y + 4, PERSON, pal(P.inkD, P.ink));
      HL(x + 4, y + 3, 9, P.inkD); HL(x + 6, y + 2, 5, P.inkD); set(x + 12, y + 4, P.yel); set(x + 12, y + 5, P.yel);
      HL(x + 1, y + h - 2, w - 2, P.coral);
    });
    /* foto kecil kanan: bayi/kucing — bundar di bingkai kotak */
    frameArt(142, 40, 18, 16, P.creamL, (x, y, w, h) => {
      R(x, y, w, h, P.yelL);
      spr(x + 3, y + 2, [
        "a.....a.",
        "aa...aa.",
        "abbbbbac",
        "bdbbdbbc",
        "bbbebbbc",
        ".bbbbbc.",
        "..cccc.."], { a: P.tanS, b: P.creamL, c: P.creamS, d: P.inkD, e: P.coral });
      HL(x, y + h - 2, w, P.yel);
    });
    /* foto memanjang di bawah: pantai */
    frameArt(108, 46, 30, 12, P.creamL, (x, y, w, h) => {
      R(x, y, w, 3, P.blueL); R(x, y + 3, w, 2, P.blue); R(x, y + 5, w, h - 5, P.cream);
      for (let y2 = -2; y2 <= 2; y2++) for (let x2 = -2; x2 <= 2; x2++) if (x2 * x2 + y2 * y2 <= 5) set(x + 19 + x2, y + 1 + y2, P.yelL);
      set(x + 6, y + 4, P.walnut); VL(x + 6, y + 2, 4, P.walnutS); spr(x + 4, y, ["a.a.a", ".aaa."], { a: P.ol });
    });

    /* ================= JAM DINDING ================= */
    wallSh(176, 16, 11, 11);
    obj(() => {
      spr(176, 16, CLOCK, { a: P.walnutL, b: P.walnut, c: P.creamL, d: P.walnutD, e: P.inkD });
      [[181, 18], [184, 21], [181, 24], [178, 21]].forEach(([x, y]) => set(x, y, P.walnutS));
      set(181, 21, P.coralS);
      /* bandul */
      VL(181, 27, 6, P.walnutD); R(180, 33, 3, 3, P.yel); set(180, 33, P.yelL); set(182, 35, P.yelS);
    });

    /* ================= LUKISAN DI ATAS SOFA ================= */
    const LX = 214, LY = 18, LW = 64, LH = 38;
    wallSh(LX, LY, LW, LH);
    obj(() => {
      box(LX, LY, LW, LH, P.yelS, P.yelL, P.yelD); HL(LX + 1, LY + 1, LW - 2, P.yel); VL(LX + 1, LY + 1, LH - 2, P.yel);
      R(LX + 3, LY + 3, LW - 6, LH - 6, P.sky2);
      const x = LX + 3, y = LY + 3, w = LW - 6, h = LH - 6;
      /* langit senja pita */
      R(x, y, w, 8, P.coralL); R(x, y + 8, w, 7, P.sky3); R(x, y + 15, w, 5, P.sky2);
      for (let j = -5; j <= 0; j++) for (let i = -5; i <= 5; i++) if (i * i + j * j <= 26) set(x + 40 + i, y + 19 + j, j > -3 ? P.sunH : P.sun);
      /* bukit tiga lapis */
      for (let i = 0; i < w; i++) {
        const h1 = Math.round(9 + 5 * Math.sin(i / 9 + 1)), h2 = Math.round(6 + 3 * Math.sin(i / 6 + 3)), h3 = Math.round(3 + 2 * Math.sin(i / 11));
        VL(x + i, y + h - h1, h1, P.blueL); VL(x + i, y + h - h2, h2, P.blue); VL(x + i, y + h - h3, h3, P.blueS);
      }
      /* burung */
      [[12, 6], [18, 9]].forEach(([bx, by]) => { set(x + bx - 1, y + by, P.coralS); set(x + bx + 1, y + by, P.coralS); set(x + bx, y + by + 1, P.coralS) });
    });

    /* ================= SOFA (kanan, NPC berdiri di depannya) ================= */
    const SX = 194, SR = 300, ST = 78, SF = 112;
    contact(SX - 1, SF, SR - SX + 3);
    obj(() => {
      /* sandaran: pita datar, sudut atas membulat */
      R(SX + 6, ST, SR - SX - 12, 22, P.blue); HL(SX + 7, ST, SR - SX - 14, P.blueL); HL(SX + 6, ST + 1, SR - SX - 12, P.blueL);
      /* dua bantal sandaran */
      [[SX + 10, 42], [SX + 54, 42]].forEach(([x, w]) => {
        R(x, ST + 3, w, 15, P.blue); HL(x + 1, ST + 3, w - 2, P.blueL); VL(x, ST + 4, 13, P.blueL);
        VL(x + w - 1, ST + 4, 14, P.blueS); HL(x + 1, ST + 17, w - 2, P.blueS);
        /* kancing jahitan */
        [x + 10, x + w / 2, x + w - 10].forEach(bx => { set(bx, ST + 9, P.blueS); set(bx, ST + 10, P.blueD) });
      });
      VL(SX + 52, ST + 3, 15, P.blueD);
      /* dudukan: dua bantal duduk, bidang atas terang, muka depan membulat, alas gelap */
      VL(SX + 10, ST + 18, 1, P.blueS); HL(SX + 10, ST + 17, SR - SX - 20, P.blueD);
      [[SX + 10, 43], [SX + 53, 43]].forEach(([x, w]) => {
        R(x, ST + 18, w, 4, P.blueL); HL(x + 1, ST + 18, w - 2, "#cbd8ec");
        R(x, ST + 22, w, 7, P.blue); HL(x, ST + 22, w, P.blueL); HL(x + 1, ST + 28, w - 2, P.blueS);
        VL(x, ST + 19, 9, P.blueL); VL(x + w - 1, ST + 19, 9, P.blueS); set(x + w - 1, ST + 28, P.blueD);
        /* pipa jahitan muka depan */
        HL(x + 2, ST + 23, w - 4, P.blueS);
      });
      R(SX + 4, ST + 29, SR - SX - 8, 3, P.blueS); HL(SX + 4, ST + 31, SR - SX - 8, P.blueD);
      /* kaki kayu runcing */
      [SX + 8, SR - 11].forEach(x => { R(x, ST + 32, 3, SF - ST - 32, P.walnut); VL(x, ST + 32, SF - ST - 32, P.walnutL); set(x + 2, SF - 1, P.walnutD) });
    });
    /* lengan sofa (gulungan bulat, satu lapisan per lengan) */
    const arm = (x, flip) => obj(() => {
      const ARM = [
        "..aaaaaa..",
        ".abbbbbbb.",
        "abbbbbbbbc",
        "abbbbbbbbc",
        "abbbbbbbcc",
        ".bbbbbbcc.",
        ".bbbbbbbc."];
      spr(x, ST + 10, ARM, { a: P.blueL, b: P.blue, c: P.blueS });
      for (let y = ST + 17; y < ST + 31; y++) { HL(x + 1, y, 8, P.blue); set(x + 1, y, P.blueL); set(x + 8, y, P.blueS); set(x + 7, y, flip ? P.blueS : P.blue) }
      HL(x + 1, ST + 31, 8, P.blueD);
      /* jahitan ujung gulungan */
      spr(x + 3, ST + 12, ["ab.", "b.b", ".bc"], { a: P.blueL, b: P.blueS, c: P.blueD });
    });
    arm(SX, false); arm(SR - 10, true);
    /* bantal dekoratif */
    obj(() => spr(SX + 12, ST + 8, PILLOW, { a: P.creamL, b: P.cream, c: P.creamS, d: P.tanS }));
    obj(() => {
      spr(SR - 28, ST + 8, PILLOW, { a: P.coralL, b: P.coral, c: P.coralS, d: P.coralD });
      /* motif garis krem */
      [3, 6].forEach(dy => HL(SR - 26, ST + 8 + dy, 10, P.coralL));
    });
    /* motif bantal krem: bintik kuning */
    [[SX + 16, ST + 12], [SX + 20, ST + 14], [SX + 17, ST + 16], [SX + 22, ST + 11]].forEach(([x, y]) => g.set(x, y, P.yelS));
    /* selimut rajut kuning terlipat di lengan kanan */
    obj(() => {
      spr(SR - 14, ST + 9, [
        "..aaaaaaa.",
        ".abbbbbbbc",
        "abbbbbbbbc",
        "cccccccccd",
        "abbbbbbbbc",
        "abbbbbbbbc",
        "abbbbbbbcc",
        "abbbbbbbcc",
        "abbbbbbbcc",
        "abbbbbbccd",
        ".bbbbbbccd",
        "..dd..dd.."], { a: P.yelL, b: P.yel, c: P.yelS, d: P.yelD });
      /* rumbai */
      [SR - 13, SR - 10, SR - 7].forEach(x => VL(x, ST + 21, 2, P.yelS));
    }, { ink: P.yelD });

    /* ================= MEJA SAMPING + LAMPU (paling kanan) ================= */
    const TX = 302, TT = 92, TF = 114;
    contact(TX - 1, TF, 20);
    obj(() => {
      /* kaki tiga, daun bulat (dilihat sedikit dari atas: elips 2 piksel) */
      [TX + 2, TX + 14].forEach(x => { line(x + 1, TT + 3, x, TF - 1, P.walnutS); line(x + 2, TT + 3, x + 1, TF - 1, P.walnut) });
      line(TX + 8, TT + 3, TX + 8, TF - 3, P.walnutD);
      HL(TX + 2, TT + 12, 14, P.walnutS);
      HL(TX + 1, TT, 17, P.walnutL); HL(TX, TT + 1, 19, P.walnut); HL(TX, TT + 2, 19, P.walnutS);
    });
    obj(() => {
      /* lampu meja keramik + kap kain krem */
      const x = TX + 9;
      spr(x - 4, TT - 10, [
        "..aab..",
        ".abbbc.",
        "abbbbbc",
        "abbbbcc",
        "abbbbcc",
        ".abbcc.",
        "..ccd..",
        ".abbcd.",
        "abbbccd",
        "abbbccd"], { a: P.coralL, b: P.coral, c: P.coralS, d: P.coralD });
      VL(x, TT - 14, 4, P.metal);
      for (let j = 0; j < 11; j++) { const hw = 5 + Math.floor(j / 2), y = TT - 26 + j; HL(x - hw, y, hw * 2 + 1, j < 2 ? P.creamL : P.cream); set(x - hw, y, P.creamL); set(x + hw, y, P.creamS); set(x + hw - 1, y, P.creamS) }
      HL(x - 10, TT - 16, 21, P.creamS);
    });
    /* cangkir teh di meja samping */
    obj(() => { R(TX + 2, TT - 4, 4, 4, P.creamL); VL(TX + 5, TT - 4, 4, P.creamS); set(TX + 1, TT - 3, P.creamS); HL(TX + 2, TT - 4, 4, P.tan) });

    /* ================= TEKO DI BUFET? tidak: teko di meja kecil depan kiri hero ================= */
    /* (meja kopi rendah kecil di kiri hero, di atas lantai, tidak menutupi kaki) */
    const CTX = 32, CTT = 112, CTF = 124;
    contact(CTX - 2, CTF, 46);
    obj(() => {
      /* daun meja oval tebal */
      for (let y = CTT; y < CTT + 6; y++) {
        const t = (y - CTT) / 5, hw = Math.round(21 * Math.sqrt(1 - ((t - .45) / .55) ** 2 * .45));
        HL(CTX + 21 - hw, y, hw * 2 + 1, y === CTT ? P.walnutL : y < CTT + 3 ? P.walnut : y === CTT + 3 ? P.walnutS : P.walnutD);
      }
      HL(CTX + 4, CTT + 1, 30, P.walnutL);
      /* kaki pendek */
      [CTX + 5, CTX + 34].forEach(x => { R(x, CTT + 6, 3, CTF - CTT - 6, P.walnutS); VL(x, CTT + 6, CTF - CTT - 6, P.walnut) });
      /* rak bawah + majalah */
      HL(CTX + 6, CTF - 4, 31, P.walnut); HL(CTX + 6, CTF - 3, 31, P.walnutD);
      R(CTX + 12, CTF - 6, 12, 2, P.blue); HL(CTX + 12, CTF - 6, 12, P.blueL); R(CTX + 14, CTF - 7, 9, 1, P.coralL);
    });
    obj(() => {
      spr(CTX + 6, CTT - 10, POT, { a: P.creamL, b: P.cream, c: P.creamS, d: P.tanS, e: P.creamS, f: P.creamS });
      HL(CTX + 9, CTT - 6, 6, P.blue); HL(CTX + 9, CTT - 5, 6, P.blueL);
    });
    obj(() => {
      [[CTX + 23, 0], [CTX + 30, 1]].forEach(([x]) => { R(x, CTT - 3, 4, 3, P.creamL); VL(x + 3, CTT - 3, 3, P.creamS); HL(x, CTT - 3, 4, P.coral); set(x + 4, CTT - 2, P.creamS) });
    });
  };

  SIMPX.bg("rumah", { w: W, h: H, floorY: 125, standX: 110, draw });
})();

/* ===== teras ===== */
/* Latar "teras" (320x150): teras depan rumah, sore hari, di luar. Teknik sama dengan kantor.js / kamar.js:
   - tanpa dither; gradasi = pita warna datar; tiap benda satu lapisan dengan garis tepi selektif
     (sisi kiri/atas = tinta navy lembut, sisi kanan/bawah = versi gelap bidang);
   - lantai dek papan mengarah ke penonton, bayangan kontak 2 piksel untuk benda yang berdiri;
   - dinding rumah (papan biru berdebu) di kiri bertemu dek di y 106; kaki tokoh di y 125.
   - Kanan: pagar kayu rendah (atas di y 80, di bawah dada NPC), semak, pohon rindang, langit sore
     biru -> peach. Cahaya dari kiri atas: bayangan jatuh ke kanan-bawah. */
(() => {
  const W = 320, H = 150, FLOOR = 106;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const th = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return th(x.map((v, i) => v + (y[i] - v) * t)) };
  const dkc = (c, t = .4) => mix(mix(c, "#3a3470", t * .6), "#000000", t * .3);

  const P = {
    ink: "#5d5584", inkD: "#463f6c",
    sky0: "#a6c2e6", sky1: "#b9d0ec", sky2: "#cddbee", sky3: "#e6dde0", sky4: "#f4d6b4", sky5: "#f8c99a",
    cloud: "#fdf5e8", cloudM: "#f6e2d2", cloudS: "#dfc8d0",
    far: "#b6bdd8", farS: "#a2a9c9", farR: "#c7a7ae", farW: "#efe2cf",
    side: "#a9bedf", sideL: "#c2d3ec", sideS: "#93a9cf", sideD: "#7d93bd",
    trim: "#f7efe0", trimL: "#fdf8ee", trimS: "#e2d3b8", trimD: "#c9b597",
    tile: "#d9826b", tileL: "#e9a28b", tileS: "#b8655a", tileD: "#93504f",
    door: "#d9826b", doorL: "#e9a28b", doorS: "#bd6a5c", doorD: "#9c5452",
    glass: "#cfe0f1", glassL: "#eef4fa", glassS: "#aec6e2",
    yel: "#f2c14e", yelL: "#f8da82", yelS: "#d99d3c", yelD: "#b27a3c",
    coral: "#e3937c", coralL: "#efb29d", coralS: "#c2735f",
    cream: "#f2e5c9", creamL: "#fbf4e3", creamS: "#d8c6a4",
    tan: "#d3ae86", tanL: "#e3c6a3", tanS: "#b48c65",
    ol: "#a3a85d", olL: "#c1c47e", olS: "#7f8a4d", olD: "#5d6843", olX: "#4b5640",
    bark: "#9a7058", barkL: "#b48a6c", barkS: "#7b5848",
    fence: "#e1bd8f", fenceL: "#efd3ac", fenceS: "#c49a6d", fenceD: "#a27757",
    walnut: "#b98256", walnutL: "#cf9a6c", walnutS: "#99673f", walnutD: "#7a4f35",
    wood: "#c99a6b", woodG: "#c09062", woodS: "#a77a52", woodD: "#8b6346",
    shd: "#b08560", shdG: "#a87d58", shdS: "#94704e",
    metal: "#665f8a", metalL: "#847ea8", metalD: "#4a436f",
    grass: "#b5b56c", grassS: "#9a9f5c"
  };
  /* bayangan di dek: satu tingkat lebih gelap, datar, sedikit ke ungu */
  const SHADOW = { [P.wood]: P.shd, [P.woodG]: P.shdG, [P.woodS]: P.shdS, [P.shd]: P.shdS, [P.shdG]: P.shdS, [P.shdS]: P.woodD,
    [P.coral]: P.coralS, [P.coralL]: P.coral, [P.coralS]: P.tileD, [P.cream]: P.creamS, [P.creamL]: P.cream, [P.creamS]: P.tanS };

  /* ====== peta piksel tangan ====== */
  /* gumpalan daun pohon (12x9), sorot kiri atas */
  const CLUMP = [
    "...aaab.....",
    ".aaabbbbb...",
    "aabbbbbbbbc.",
    "abbbbbbbbbcc",
    "abbbbbbbbccc",
    ".bbbbbbbcccd",
    ".bbbbbbcccd.",
    "..cccccccdd.",
    "....dddd...."];
  /* semak bulat (16x10) */
  const BUSH = [
    "....aaab........",
    "..aaabbbbaab....",
    ".aabbbbbbbbbbc..",
    "aabbbbbbbbbbbbc.",
    "abbbbbbbbbbbbccc",
    "abbbbbbbbbbbcccc",
    "bbbbbbbbbbbccccd",
    ".bbbbbbbbcccccd.",
    "..ccccccccccdd..",
    "....dddddddd...."];
  /* bunga di pot jendela (5x4) */
  const FLW = [".aa..", "abca.", ".aab.", "..d.."];
  /* lampu dinding (7x12) */
  const SCONCE = [
    "..aab..",
    ".abbbc.",
    "abbbbbc",
    "adeeefc",
    "adeeefc",
    "adeeefc",
    "adeeefc",
    "abbbbbc",
    ".bcccc.",
    "...c...",
    "..gcg..",
    "..ggg.."];
  /* keset "SELAMAT DATANG": cukup motif garis */
  /* daun pakis gantung (6x4) */
  const FERN = ["ab....", ".abb..", "..bbbc", "....cc"];
  const FERN_F = FERN.map(r => [...r].reverse().join(""));

  const draw = g => {
    let cur = g;
    const set = (x, y, c) => cur.set(x, y, c), get = (x, y) => cur.get(x, y);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) };
    const HL = (x, y, w, c) => R(x, y, w, 1, c), VL = (x, y, h, c) => R(x, y, 1, h, c);
    const line = (a, b, c, d, col) => cur.line(a, b, c, d, col);
    const spr = (x, y, rows, pal) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(x + i, y + j, pal[ch]) }));
    const remap = (x, y, map) => { const c = g.get(x, y); if (c && map[c]) g.set(x, y, map[c]) };
    const contact = (x, y, w, h = 2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) remap(x + i, y + j, SHADOW) };
    const obj = (fn, o = {}) => {
      const t = GLPIX.grid(W, H); cur = t; fn(); cur = g;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = t.g[y][x]; if (c) g.set(x, y, c) }
      if (o.ol === false) return;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (t.g[y][x]) continue;
        const l = t.get(x - 1, y), u = t.get(x, y - 1), r = t.get(x + 1, y), d = t.get(x, y + 1);
        if (l || u) g.set(x, y, o.ink || P.ink); else if (r || d) g.set(x, y, dkc(r || d));
      }
    };
    const box = (x, y, w, h, c, l, s) => { R(x, y, w, h, c); HL(x, y, w, l); VL(x, y, h, l); VL(x + w - 1, y + 1, h - 1, s); HL(x + 1, y + h - 1, w - 1, s) };
    const disc = (cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * .6) set(cx + x, cy + y, c) };

    /* ================= LANGIT SORE (pita datar) ================= */
    const SKY = [[0, P.sky0], [16, P.sky1], [32, P.sky2], [48, P.sky3], [62, P.sky4], [72, P.sky5]];
    for (let y = 0; y < FLOOR; y++) { let c = P.sky0; SKY.forEach(([a, k]) => { if (y >= a) c = k }); HL(0, y, W, c) }
    /* awan: lapisan datar, bawah keunguan, atas terang kena matahari dari kiri */
    const cloud = (x, y, w) => {
      HL(x + 4, y, w - 10, P.cloud); HL(x + 2, y + 1, w - 5, P.cloud); R(x, y + 2, w, 2, P.cloudM);
      HL(x + 1, y + 4, w - 2, P.cloudS); HL(x + 3, y + 1, 4, P.cloud);
    };
    cloud(206, 8, 30); cloud(236, 26, 22); cloud(196, 40, 16);
    /* kota/bukit jauh, satu tone kabut */
    for (let x = 190; x < W; x++) { const h = Math.round(10 + 4 * Math.sin(x / 13) + 2 * Math.sin(x / 5.3)); VL(x, 86 - h, h, x % 40 < 22 ? P.far : P.farS) }
    [[200, 70, 16], [226, 73, 12], [262, 68, 18]].forEach(([bx, by, w]) => {
      for (let j = 0; j < 86 - by; j++) { const o = Math.max(0, 4 - j); HL(bx + o, by + j, w - o * 2, j < 3 ? P.farR : P.far) }
      R(bx + 4, by + 8, 2, 2, P.farW); R(bx + w - 6, by + 8, 2, 2, P.farW);
    });
    /* rumput halaman di balik pagar */
    R(186, 86, W - 186, FLOOR - 86, P.grass); HL(186, 86, W - 186, P.olL); for (let x = 188; x < W; x += 7) { set(x, 85, P.grass); set(x + 3, 85, P.olL) }

    /* ================= POHON RINDANG (kanan) ================= */
    obj(() => {
      /* batang + cabang */
      R(290, 34, 9, 60, P.bark); VL(290, 34, 60, P.barkL); VL(291, 34, 60, P.barkL); VL(297, 34, 60, P.barkS); VL(298, 34, 60, P.barkS);
      line(292, 46, 280, 32, P.bark); line(293, 46, 281, 32, P.bark); line(291, 46, 279, 32, P.barkL);
      line(297, 42, 308, 28, P.barkS); line(296, 42, 307, 28, P.bark);
      R(287, 90, 15, 3, P.bark); HL(287, 90, 15, P.barkL); set(287, 92, P.barkS); set(301, 92, P.barkS);
      /* guratan kulit kayu: garis tegak pendek */
      [[294, 54, 6], [295, 70, 5], [293, 80, 4]].forEach(([x, y, h]) => VL(x, y, h, P.barkS));
    });
    obj(() => {
      /* tajuk: gumpalan berlapis, belakang lebih gelap */
      const bk = { a: P.ol, b: P.olS, c: P.olD, d: P.olX }, fr = { a: P.olL, b: P.ol, c: P.olS, d: P.olD };
      /* massa dasar tajuk (gabungan lingkaran), sisi kanan-bawah satu tingkat lebih gelap */
      const M = [[252, 32, 11], [268, 20, 14], [290, 12, 16], [310, 20, 14], [264, 38, 10], [286, 32, 14], [312, 38, 11], [300, 4, 12]];
      const inM = (x, y) => M.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r);
      for (let y = 0; y < 52; y++) for (let x = 236; x < W; x++) if (inM(x, y)) set(x, y, inM(x + 3, y + 4) ? P.olS : P.olD);
      [[300, -4], [312, 4], [268, 2], [286, 10], [306, 22], [256, 18], [276, 26], [310, 36]].forEach(([x, y]) => spr(x, y, CLUMP, bk));
      [[282, -2], [262, 8], [298, 10], [242, 22], [270, 16], [288, 26], [252, 32], [304, 30], [270, 36], [314, 16]].forEach(([x, y]) => spr(x, y, CLUMP, fr));
    }, { ink: P.olX });

    /* ================= SEMAK DI BALIK PAGAR ================= */
    obj(() => {
      const fr = { a: P.olL, b: P.ol, c: P.olS, d: P.olD };
      [[192, 78], [212, 80], [236, 77], [258, 80], [280, 78], [302, 79]].forEach(([x, y], i) => spr(x, y, BUSH, i % 2 ? { a: P.ol, b: P.olS, c: P.olD, d: P.olX } : fr));
      /* bunga kecil di semak */
      [[198, 82], [244, 81], [286, 82], [218, 85], [308, 84]].forEach(([x, y], i) => { set(x, y, i % 2 ? P.creamL : P.coralL); set(x + 1, y, i % 2 ? P.cream : P.coral) });
    }, { ink: P.olX });

    /* ================= DEK KAYU ================= */
    const VPX = 160, VPY = 20, FW = 15;
    const strip = (x, y) => Math.floor((VPX + (x - VPX) * (FLOOR - VPY) / (y - VPY) - VPX) / FW);
    for (let y = FLOOR; y < H; y++) for (let x = 0; x < W; x++) set(x, y, strip(x, y) & 1 ? P.woodG : P.wood);
    for (let k = -14; k <= 14; k++) {
      const x0 = VPX + k * FW, x1 = VPX + (x0 - VPX) * (H - 1 - VPY) / (FLOOR - VPY);
      line(x0, FLOOR, Math.round(x1), H - 1, P.woodS);
    }
    for (let y = FLOOR + 2; y < H; y++) for (let x = 0; x < W; x++) {
      const s = strip(x, y), jy = FLOOR + 6 + ((s * 11 + 37) % 23);
      if (y === jy && get(x, y) !== P.woodS) set(x, y, P.woodS);
    }
    HL(0, FLOOR, W, P.woodD); HL(0, FLOOR + 1, W, P.woodS);
    /* tepi dek di depan (papan melintang + bayangan) */
    HL(0, H - 3, W, P.woodS); R(0, H - 2, W, 2, P.woodD);

    /* ================= DINDING RUMAH (kiri) ================= */
    const HR = 184;
    obj(() => {
      /* papan siding horizontal: tiap 6 px, sorot atas + bayangan bawah */
      for (let y = 8; y < FLOOR; y++) { const k = (y - 8) % 6; HL(0, y, HR, k === 0 ? P.sideL : k === 5 ? P.sideS : P.side) }
      /* bayangan atap di dinding: pita datar */
      for (let y = 8; y < 18; y++) for (let x = 0; x < HR; x++) { const c = get(x, y); set(x, y, c === P.sideL ? P.side : c === P.side ? P.sideS : P.sideD) }
      /* plint batu */
      R(0, 98, HR, 8, P.trimS); HL(0, 98, HR, P.trim); HL(0, 105, HR, P.trimD);
      for (let x = 0; x < HR; x += 12) VL(x + (Math.floor(x / 12) % 2) * 6, 99, 6, P.trimD);
      /* tepi kanan dinding (sudut rumah) */
      R(HR - 4, 8, 4, 98, P.trim); VL(HR - 4, 8, 98, P.trimL); VL(HR - 1, 8, 98, P.trimS);
    });

    /* ================= PINTU ================= */
    const DX = 22, DY = 40, DW = 30, DH = FLOOR - DY;
    obj(() => {
      /* kusen krem */
      R(DX - 4, DY - 4, DW + 8, DH + 4, P.trim); HL(DX - 4, DY - 4, DW + 8, P.trimL); VL(DX - 4, DY - 4, DH + 4, P.trimL); VL(DX + DW + 3, DY - 3, DH + 3, P.trimS);
      HL(DX - 6, DY - 6, DW + 12, P.trimL); R(DX - 6, DY - 5, DW + 12, 2, P.trim); HL(DX - 6, DY - 3, DW + 12, P.trimS);
      /* daun pintu */
      box(DX, DY, DW, DH, P.door, P.doorL, P.doorS);
      /* jendela kecil atas: tiga kaca berbentuk kipas */
      R(DX + 5, DY + 4, DW - 10, 10, P.doorD);
      R(DX + 6, DY + 5, DW - 12, 8, P.glass); HL(DX + 6, DY + 5, DW - 12, P.glassS); R(DX + 7, DY + 6, 4, 2, P.glassL);
      VL(DX + 12, DY + 5, 8, P.doorS); VL(DX + 18, DY + 5, 8, P.doorS);
      /* panel timbul 2x2 */
      [[DX + 5, DY + 18, 9, 18], [DX + 16, DY + 18, 9, 18], [DX + 5, DY + 40, 9, 20], [DX + 16, DY + 40, 9, 20]].forEach(([x, y, w, h]) => {
        R(x, y, w, h, P.door); HL(x, y, w, P.doorS); VL(x, y, h, P.doorS); HL(x, y + h - 1, w, P.doorL); VL(x + w - 1, y, h, P.doorL);
        R(x + 2, y + 2, w - 4, h - 4, P.doorL); VL(x + w - 3, y + 2, h - 4, P.door);
      });
      /* gagang kuningan */
      R(DX + DW - 6, DY + 36, 3, 3, P.yel); set(DX + DW - 6, DY + 36, P.yelL); set(DX + DW - 4, DY + 38, P.yelS); set(DX + DW - 5, DY + 41, P.yelD);
    });
    /* lampu dinding di sebelah pintu */
    obj(() => spr(DX + DW + 9, 46, SCONCE, { a: P.metalL, b: P.metal, c: P.metalD, d: P.yelL, e: P.creamL, f: P.yel, g: P.metal }), { ink: P.inkD });
    /* nomor rumah */
    obj(() => {
      box(DX + DW + 6, 63, 12, 9, P.creamL, P.trimL, P.creamS);
      spr(DX + DW + 8, 65, [".a..aaa", "aa....a", ".a..aaa", ".a..a..", "aaa.aaa"], { a: P.inkD });
    }, { ink: P.inkD });
    /* ================= JENDELA + POT BUNGA ================= */
    const WX = 96, WY = 22, WW = 60, WH = 34, gx = WX + 4, gy = WY + 4, gw = WW - 8, gh = WH - 8, MUL = WX + WW / 2 - 2;
    obj(() => {
      /* kaca memantulkan langit: dua pita + kilau miring */
      for (let y = gy; y < gy + gh; y++) HL(gx, y, gw, y < gy + 9 ? P.glassS : y < gy + 18 ? P.glass : P.sky3);
      for (let k = 0; k < 6; k++) { set(gx + 4 + k, gy + 10 - k, P.glassL); set(gx + 5 + k, gy + 10 - k, P.glassL); set(MUL + 7 + k, gy + 14 - k, P.glassL) }
      /* tirai dalam rumah terlihat di sudut */
      for (let y = gy; y < gy + gh; y++) { const w = 4 + Math.floor((y - gy) / 9); HL(gx, y, w, P.coralL); set(gx + w - 1, y, P.coral); HL(gx + gw - w, y, w, P.coralL); set(gx + gw - w, y, P.coral) }
      const fb = (x, y, w, h) => R(x, y, w, h, P.trim);
      fb(WX, WY, WW, 4); fb(WX, WY + WH - 4, WW, 4); fb(WX, WY, 4, WH); fb(WX + WW - 4, WY, 4, WH); fb(MUL, WY, 4, WH);
      HL(WX, WY, WW, P.trimL); VL(WX, WY, WH, P.trimL); VL(MUL, WY + 4, WH - 8, P.trimL);
      [WX + WW - 1, MUL + 3].forEach(x => VL(x, WY + 1, WH - 2, P.trimS)); HL(WX + 1, WY + WH - 1, WW - 2, P.trimS);
      HL(gx, gy, gw, P.sideD);
      /* daun jendela (shutter) kiri-kanan */
      [[WX - 11, 0], [WX + WW + 1, 1]].forEach(([x]) => { box(x, WY, 10, WH, P.sideS, P.sideL, P.sideD); for (let y = WY + 3; y < WY + WH - 2; y += 3) HL(x + 2, y, 6, P.sideD) });
    });
    /* kotak bunga di bawah jendela */
    obj(() => {
      const y = WY + WH;
      /* bunga & daun */
      for (let i = 0; i < 9; i++) { const x = WX + 2 + i * 6; spr(x, y - 6 + (i % 2), FLW, i % 3 === 1 ? { a: P.yelL, b: P.yel, c: P.coralS, d: P.olS } : { a: P.coralL, b: P.coral, c: P.yel, d: P.olS }) }
      for (let i = 0; i < 18; i++) { const x = WX + 1 + i * 3; spr(x, y - 2, ["ab", "bc"], { a: P.olL, b: P.ol, c: P.olS }) }
      /* kotak kayu */
      box(WX - 2, y, WW + 4, 7, P.walnut, P.walnutL, P.walnutS); HL(WX - 1, y + 3, WW + 2, P.walnutS);
    });

    /* ================= ATAP TERAS (atas, memanjang) ================= */
    obj(() => {
      /* genteng terakota: barisan lengkung kecil */
      R(0, 0, 200, 5, P.tile);
      for (let x = 0; x < 200; x++) { const k = x % 8; set(x, 0, k < 2 ? P.tileL : P.tile); set(x, 4, k === 7 || k === 0 ? P.tileD : P.tileS); if (k === 0) VL(x, 1, 3, P.tileS) }
      for (let x = 0; x < 200; x += 8) { set(x + 2, 1, P.tileL); set(x + 3, 1, P.tileL) }
      /* lisplang krem */
      HL(0, 5, 202, P.trimL); R(0, 6, 202, 2, P.trim); HL(0, 8, 202, P.trimS);
    });
    /* tiang teras */
    const PX = 188;
    obj(() => {
      box(PX, 9, 7, 89, P.trim, P.trimL, P.trimS); VL(PX + 5, 10, 88, P.trimS);
      /* kepala & alas tiang */
      box(PX - 2, 9, 11, 3, P.trimL, P.trimL, P.trimS);
      box(PX - 2, 96, 11, 12, P.trim, P.trimL, P.trimD); HL(PX - 1, 99, 9, P.trimS);
    });
    /* pot gantung pakis di bawah atap */
    obj(() => {
      const x = 168, y = 28;
      line(x, 9, x - 5, y, P.metalL); line(x, 9, x + 5, y, P.metalL);
      /* daun pakis menjuntai */
      const pal = { a: P.olL, b: P.ol, c: P.olS };
      spr(x - 11, y - 2, FERN_F, pal); spr(x + 5, y - 2, FERN, pal);
      spr(x - 12, y + 3, FERN_F, pal); spr(x + 6, y + 3, FERN, pal);
      [[x - 9, y + 6, 6], [x + 8, y + 6, 7], [x - 3, y + 7, 5], [x + 2, y + 7, 8]].forEach(([vx, vy, h]) => { VL(vx, vy, h, P.olS); set(vx - 1, vy + h - 2, P.ol); set(vx + 1, vy + h - 4, P.olL) });
      spr(x - 6, y - 4, [".aab.ab.ab..", "aabbbbbbbbc.", ".bbbcbbbccc."], pal);
      /* pot */
      for (let j = 0; j < 7; j++) { const hw = 6 - Math.floor(j / 3); HL(x - hw, y + j, hw * 2 + 1, P.coral); set(x - hw, y + j, P.coralL); set(x + hw, y + j, P.coralS) }
      HL(x - 7, y, 15, P.coralL); HL(x - 4, y + 7, 9, P.coralS);
    });

    /* ================= PAGAR KAYU (kanan, di depan semak) ================= */
    const FX0 = 196, FT = 80;
    obj(() => {
      /* palang */
      [FT + 6, FT + 20].forEach(y => { R(FX0, y, W - FX0, 3, P.fence); HL(FX0, y, W - FX0, P.fenceL); HL(FX0, y + 2, W - FX0, P.fenceS) });
      /* bilah runcing */
      for (let x = FX0 + 2; x < W; x += 8) {
        const top = FT + ((x / 8) % 3 === 0 ? 0 : 1);
        R(x, top + 2, 5, FLOOR + 2 - top - 2, P.fence);
        VL(x, top + 2, FLOOR - top, P.fenceL); VL(x + 4, top + 2, FLOOR - top, P.fenceS);
        HL(x + 1, top, 3, P.fenceL); set(x + 2, top - 1, P.fenceL); HL(x, top + 1, 5, P.fence); set(x, top + 1, P.fenceL); set(x + 4, top + 1, P.fenceS);
        /* paku */
        set(x + 2, FT + 7, P.fenceD); set(x + 2, FT + 21, P.fenceD);
      }
    });
    /* bayangan pagar & tiang di dek: jatuh ke kanan-bawah (matahari sore dari kiri) */
    for (let y = FLOOR + 2; y < FLOOR + 6; y++) for (let x = FX0; x < W; x++) remap(x, y, SHADOW);
    for (let j = 0; j < 14; j++) for (let i = 0; i < 6; i++) remap(PX + 6 + i + j * 2, FLOOR + 2 + j, SHADOW);

    /* ================= KESET DI DEPAN PINTU ================= */
    obj(() => {
      for (let y = 109; y < 115; y++) { const o = (114 - y) * .4; HL(Math.round(DX - 3 + o), y, Math.round(DW + 6 - o * 2), y === 109 ? P.tanL : y === 114 ? P.tanS : P.tan) }
      for (let x = DX; x < DX + DW; x += 3) { set(x, 111, P.tanS); set(x + 1, 112, P.tanS) }
      HL(DX + 2, 110, DW - 4, P.coralL); HL(DX + 2, 113, DW - 4, P.coralS);
    }, { ink: P.yelD });

    /* ================= TANAMAN POT BESAR DI SAMPING PINTU ================= */
    const TX = 72, TB = 116;
    contact(TX - 8, TB, 18);
    obj(() => {
      /* daun ular (sansevieria): bilah tegak runcing, peta per bilah */
      const blade = (x, y, h, lean, pal) => { for (let j = 0; j < h; j++) { const t = j / h, w = j < 3 ? 1 : 3, ox = Math.round(lean * (1 - t) ** 2); HL(x + ox, y + j, w, pal.b); set(x + ox, y + j, pal.a); if (w > 1) set(x + ox + w - 1, y + j, pal.c) } };
      const pl = { a: P.olL, b: P.ol, c: P.olS }, pd = { a: P.ol, b: P.olS, c: P.olD };
      blade(TX - 6, TB - 34, 20, -4, pd); blade(TX + 4, TB - 36, 22, 4, pd);
      blade(TX - 3, TB - 40, 26, -2, pl); blade(TX + 1, TB - 44, 30, 1, pl); blade(TX + 5, TB - 32, 18, 5, pl); blade(TX - 8, TB - 28, 14, -5, pl);
      /* garis kuning tepi daun */
      VL(TX + 1, TB - 40, 20, P.yelL);
      /* pot terakota tinggi */
      for (let j = 0; j < 16; j++) { const hw = 7 - Math.floor(j / 6), y = TB - 16 + j; HL(TX - hw, y, hw * 2 + 1, P.coral); set(TX - hw, y, P.coralL); set(TX - hw + 1, y, P.coralL); set(TX + hw, y, P.coralS); set(TX + hw - 1, y, P.coralS) }
      R(TX - 8, TB - 19, 17, 3, P.coral); HL(TX - 8, TB - 19, 17, P.coralL); HL(TX - 8, TB - 17, 17, P.coralS);
      HL(TX - 4, TB - 9, 9, P.coralS); HL(TX - 4, TB - 8, 9, P.coralL);
    });

    /* ================= KURSI TERAS (kayu + bantal kuning) ================= */
    const CX = 272, CB = 122;
    contact(CX - 2, CB, 40);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 30; i++) remap(CX + 6 + i + j * 2, CB + 2 + j, SHADOW);
    obj(() => {
      /* kaki belakang */
      [CX + 4, CX + 30].forEach(x => { R(x, 88, 3, CB - 88, P.walnutS); VL(x, 88, CB - 88, P.walnut) });
      /* sandaran bilah */
      box(CX + 3, 84, 31, 4, P.walnut, P.walnutL, P.walnutS);
      for (let x = CX + 7; x < CX + 31; x += 6) { R(x, 88, 3, 14, P.walnut); VL(x, 88, 14, P.walnutL); VL(x + 2, 88, 14, P.walnutS) }
      /* bantal sandaran kuning */
      spr(CX + 7, 89, [
        ".aaaaaaaaaaaaaaaaaaa..",
        "abbbbbbbbbbbbbbbbbbbbc",
        "abbbbbbbbbbbbbbbbbbbbc",
        "abbbbbbbbbbbbbbbbbbbcc",
        "abbbbbbbbbbbbbbbbbbbcc",
        "abbbbbbbbbbbbbbbbbbccc",
        ".bbbbbbbbbbbbbbbbbccc.",
        "..cccccccccccccccccc.."], { a: P.yelL, b: P.yel, c: P.yelS });
      [CX + 14, CX + 22].forEach(x => { set(x, 92, P.yelS); set(x, 93, P.yelD) });
      /* dudukan + bantal duduk */
      R(CX + 1, 102, 36, 3, P.yelL); HL(CX + 2, 101, 34, P.yelL); R(CX + 1, 104, 36, 3, P.yel); HL(CX + 1, 106, 36, P.yelS);
      box(CX, 107, 38, 3, P.walnut, P.walnutL, P.walnutS);
      /* sandaran tangan */
      [CX - 2, CX + 33].forEach(x => { box(x, 96, 7, 3, P.walnutL, P.tanL, P.walnutS); R(x + 2, 99, 3, 8, P.walnut); VL(x + 2, 99, 8, P.walnutL) });
      /* kaki depan */
      [CX + 1, CX + 34].forEach(x => { R(x, 110, 3, CB - 110, P.walnut); VL(x, 110, CB - 110, P.walnutL); VL(x + 2, 110, CB - 110, P.walnutS) });
    });
    /* pot kecil di lantai dekat kursi */
    obj(() => {
      const x = 316, b = 120;
      for (let j = 0; j < 8; j++) { const hw = 5 - Math.floor(j / 4); HL(x - hw, b - 8 + j, hw * 2 + 1, P.cream); set(x - hw, b - 8 + j, P.creamL); set(x + hw, b - 8 + j, P.creamS) }
      HL(x - 6, b - 9, 13, P.creamL); HL(x - 6, b - 8, 13, P.creamS);
      spr(x - 7, b - 17, ["..a..ab..a...", ".abb.bbcabbc.", "abbbcbbbbbbcc", ".bbcbbcbbcc..", "..bcc..cc...."], { a: P.olL, b: P.ol, c: P.olS });
      [[x - 4, b - 17], [x + 2, b - 18], [x + 5, b - 15]].forEach(([fx, fy]) => { set(fx, fy, P.coralL); set(fx + 1, fy, P.coral); set(fx, fy + 1, P.coral) });
    });
    contact(310, 120, 10);
  };

  SIMPX.bg("teras", { w: W, h: H, floorY: 125, standX: 110, draw });
})();

/* ===== meja ===== */
/* Latar "meja" (320x150): meja kerja panjang di kantor, dilihat lebih dekat. Satu dunia dengan kantor.js:
   - Teknik sama: tiap benda satu lapisan + garis tepi selektif otomatis (kiri/atas = versi gelap bidang, kanan/bawah = tinta navy lembut),
     tanpa dither, gradasi berupa pita datar, cahaya dari kiri atas, bayangan kontak 2 piksel.
   - Perspektif sama: sambungan dinding-lantai y 118, lantai papan ke titik hilang x 160, kaki tokoh di y 125.
   - Isi: jendela kecil berkerai (kiri), papan gabus sticky notes 3 kolom (TODO/PROSES/BERES), rak dinding + kalender (kanan),
     meja panjang dengan lampu meja, tumpukan dokumen, laptop, kopi, tempat pena, buku, sukulen; di bawah meja kabinet, tempat sampah, ransel.
   - Area tokoh berupa lantai kosong: meja dipotong jadi dua (x 4-88 dan x 220-316) + kabinet printer rendah di tengah,
     sehingga hero (x 90-130) dan NPC (x 175-215) berdiri di lantai. Permukaan meja y 97, sama dengan meja kantor. */
(() => {
  const W = 320, H = 150, FLOOR = 118;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const th = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return th(x.map((v, i) => v + (y[i] - v) * t)) };
  const dkc = (c, t = .4) => mix(mix(c, "#3a3470", t * .6), "#000000", t * .3);

  const P = {
    ink: "#5d5584", inkD: "#463f6c",
    wall: "#f3e5c8", wallL: "#f8eedb", wallS: "#eadab9", wallD: "#dcc6a3",
    trim: "#f7efde", trimL: "#fcf7ec", trimS: "#e2d3b8", wainS: "#dcc6a2",
    sky0: "#b9d1ea", sky1: "#c9dcef", sky2: "#d9e6f1", skyS: "#a9c2df", sun: "#fbf3df", bld: "#c2cae3", bldW: "#d7ddee",
    frame: "#f1e6d1", frameL: "#faf4e8", frameS: "#d9c9ad",
    wood: "#d29d6c", woodG: "#c99262", woodS: "#b27c53", woodD: "#956547",
    lit: "#e8bd89", lit2: "#e0b17d", litS: "#c99262",
    coral: "#e3937c", coralL: "#efb29d", coralS: "#c2735f",
    blue: "#94b1d6", blueL: "#b9cde6", blueS: "#7491bb",
    cream: "#f2e5c9", creamL: "#fbf4e3", creamS: "#d8c6a4",
    tan: "#d3ae86", tanL: "#e3c6a3", tanS: "#b48c65",
    ol: "#a3a85d", olL: "#c1c47e", olS: "#7f8a4d", olD: "#5d6843",
    metal: "#665f8a", metalL: "#847ea8", metalD: "#4a436f",
    screen: "#bcd6ee", screenL: "#deebf6", screenS: "#9ebee0",
    board: "#fbfaf5", boardS: "#ebe7ea", boardF: "#cbc5d8", boardFD: "#a7a1bd", marker: "#7d77a6", markerL: "#aaa5c6",
    /* khusus meja: gabus + kertas catatan warna-warni (saturasi rendah, satu keluarga dengan koral/biru) */
    cork: "#cf9f6e", corkL: "#dcb487", corkS: "#b6865b", corkD: "#a27552",
    yel: "#f0d58c", yelL: "#f8e7b4", yelS: "#d3b46b",
    lil: "#b9abdf", lilL: "#d5cbef", lilS: "#958ac4",
    paper: "#fdf9ef", paperS: "#e6dccb"
  };
  const SHADOW = { [P.wood]: P.woodS, [P.woodG]: P.woodS, [P.woodS]: P.woodD, [P.lit]: P.litS, [P.lit2]: P.litS, [P.litS]: P.woodS };

  const draw = g => {
    let cur = g;
    const set = (x, y, c) => cur.set(x, y, c), get = (x, y) => cur.get(x, y);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) };
    const HL = (x, y, w, c) => R(x, y, w, 1, c), VL = (x, y, h, c) => R(x, y, 1, h, c);
    const line = (a, b, c, d, col) => cur.line(a, b, c, d, col);
    const spr = (x, y, rows, pal) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(x + i, y + j, pal[ch]) }));
    const remap = (x, y, map) => { const c = g.get(x, y); if (c && map[c]) g.set(x, y, map[c]) };
    const contact = (x, y, w, h = 2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) remap(x + i, y + j, SHADOW) };
    const obj = (fn, o = {}) => {
      const t = GLPIX.grid(W, H); cur = t; fn(); cur = g;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = t.g[y][x]; if (c) g.set(x, y, c) }
      if (o.ol === false) return;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (t.g[y][x]) continue;
        const l = t.get(x - 1, y), u = t.get(x, y - 1), r = t.get(x + 1, y), d = t.get(x, y + 1);
        if (l || u) g.set(x, y, o.ink || P.ink); else if (r || d) g.set(x, y, dkc(r || d));
      }
    };
    /* kotak bervolume: sisi kiri/atas terang, kanan/bawah gelap */
    const box = (x, y, w, h, [c, l, s]) => { R(x, y, w, h, c); HL(x, y, w, l); VL(x, y, h, l); VL(x + w - 1, y, h, s); HL(x + 1, y + h - 1, w - 1, s) };

    /* ================= DINDING ================= */
    R(0, 0, W, FLOOR, P.wall);
    R(0, 0, W, 5, P.trim); HL(0, 5, W, P.trimS); HL(0, 6, W, P.wallD); HL(0, 7, W, P.wallS);
    R(0, 110, W, 8, P.trim); HL(0, 110, W, P.trimS); HL(0, 111, W, P.trimL); HL(0, 116, W, P.trimS); HL(0, 117, W, P.wainS);

    /* ================= LANTAI (sama dengan kantor) ================= */
    const VPX = 160, VPY = 30, FW = 15;
    const strip = (x, y) => Math.floor((VPX + (x - VPX) * (FLOOR - VPY) / (y - VPY) - VPX) / FW);
    for (let y = FLOOR; y < H; y++) for (let x = 0; x < W; x++) set(x, y, strip(x, y) & 1 ? P.woodG : P.wood);
    for (let k = -12; k <= 12; k++) { const x0 = VPX + k * FW, x1 = VPX + (x0 - VPX) * (H - 1 - VPY) / (FLOOR - VPY); line(x0, FLOOR, Math.round(x1), H - 1, P.woodS) }
    for (let y = FLOOR + 2; y < H; y++) for (let x = 0; x < W; x++) { const s = strip(x, y), jy = FLOOR + 6 + ((s * 13 + 91) % 23); if (y === jy && get(x, y) !== P.woodS) set(x, y, P.woodS) }
    HL(0, FLOOR, W, P.woodD); HL(0, FLOOR + 1, W, P.woodS);
    /* cahaya jendela kiri jatuh miring ke kanan, di kiri hero */
    const LIT = { [P.wood]: P.lit, [P.woodG]: P.lit2, [P.woodS]: P.litS };
    for (let y = FLOOR + 4; y < H; y++) {
      const t = (y - FLOOR - 4) / (H - FLOOR - 5); if (t > .42 && t < .5) continue;
      const x0 = Math.round(22 + 26 * t), x1 = Math.round(40 + 36 * t);
      for (let x = x0; x <= x1; x++) remap(x, y, LIT);
    }

    /* ================= JENDELA BERKERAI (kiri) ================= */
    const WX = 8, WY = 11, WWd = 46, WH = 51, gx = WX + 3, gy = WY + 3, gw = WWd - 6, gh = WH - 6;
    R(WX - 2, WY + WH + 4, WWd + 6, 2, P.wallD);
    obj(() => {
      for (let y = gy; y < gy + gh; y++) HL(gx, y, gw, y < gy + 26 ? P.sky0 : y < gy + 38 ? P.sky1 : P.sky2);
      /* siluet kota di bawah kerai */
      [[0, 38], [7, 33], [13, 40], [20, 31], [28, 36], [34, 30]].forEach(([bx, by], i, a) => { const w = (a[i + 1] ? a[i + 1][0] : gw) - bx; R(gx + bx, gy + by, w, gh - by, P.bld) });
      [[9, 36], [22, 34], [22, 39], [36, 33], [30, 40]].forEach(([x, y]) => R(gx + x, gy + y, 2, 2, P.bldW));
      HL(gx + 6, gy + 31, 9, P.sky2); HL(gx + 4, gy + 32, 12, P.sky2);
      /* kerai: bilah 3 px (terang, isi, bayangan) setengah turun */
      for (let y = gy; y < gy + 27; y += 3) { HL(gx, y, gw, P.creamL); HL(gx, y + 1, gw, P.cream); HL(gx, y + 2, gw, P.creamS) }
      R(gx - 1, gy + 27, gw + 2, 2, P.tan); HL(gx - 1, gy + 27, gw + 2, P.tanL);
      /* tali kerai */
      VL(gx + gw - 5, gy + 29, 9, P.creamS); R(gx + gw - 6, gy + 38, 3, 2, P.tan);
      /* kusen */
      R(WX, WY, WWd, 3, P.frame); R(WX, WY + WH - 3, WWd, 3, P.frame); R(WX, WY, 3, WH, P.frame); R(WX + WWd - 3, WY, 3, WH, P.frame);
      HL(WX, WY, WWd, P.frameL); VL(WX, WY, WH, P.frameL); VL(WX + WWd - 1, WY + 1, WH - 2, P.frameS); HL(WX + 1, WY + WH - 1, WWd - 2, P.frameS);
      /* kotak kerai di atas */
      R(WX - 1, WY - 2, WWd + 2, 4, P.trim); HL(WX - 1, WY - 2, WWd + 2, P.trimL); HL(WX - 1, WY + 1, WWd + 2, P.trimS);
      /* ambang */
      R(WX - 3, WY + WH, WWd + 6, 4, P.trim); HL(WX - 3, WY + WH, WWd + 6, P.trimL); HL(WX - 3, WY + WH + 3, WWd + 6, P.trimS);
    });

    /* ================= PAPAN GABUS STICKY NOTES ================= */
    const BX = 88, BY = 13, BW = 128, BH = 50;
    R(BX + 2, BY + BH, BW, 2, P.wallD); R(BX + BW, BY + 2, 2, BH, P.wallD);
    obj(() => {
      box(BX, BY, BW, BH, [P.wood, P.tanL, P.woodS]); VL(BX + 1, BY + 1, BH - 2, P.lit); HL(BX + 1, BY + 1, BW - 2, P.lit);
      R(BX + 3, BY + 3, BW - 6, BH - 6, P.cork); HL(BX + 3, BY + 3, BW - 6, P.corkS); VL(BX + 3, BY + 3, BH - 6, P.corkS);
      /* tekstur gabus: cluster kecil 1-2 px, pola tetap (bukan dither) */
      for (let i = 0; i < 70; i++) { const x = BX + 5 + ((i * 37) % (BW - 10)), y = BY + 5 + ((i * 23 + (i >> 3) * 7) % (BH - 10)); set(x, y, i % 3 ? P.corkL : P.corkD); if (i % 4 === 0) set(x + 1, y, P.corkL) }
      HL(BX + 1, BY + BH - 2, BW - 2, P.woodS); HL(BX + 2, BY + BH - 1, BW - 3, P.woodD);
    });
    /* kolom: label + catatan (lapisan sendiri bertepi supaya catatan tampak menempel) */
    const COLS = [["TODO", P.coral, P.coralL, P.coralS], ["PROSES", P.blue, P.blueL, P.blueS], ["BERES", P.ol, P.olL, P.olS]];
    const colW = 40;
    const NOTE = { y: [P.yel, P.yelL, P.yelS], c: [P.coralL, P.creamL, P.coral], b: [P.blueL, P.screenL, P.blue], l: [P.lilL, P.creamL, P.lil], w: [P.paper, P.board, P.paperS] };
    const sticky = (x, y, k, lines = 2, curl = 1, done = 0) => {
      const [c, l, s] = NOTE[k];
      R(x, y, 11, 10, c); HL(x, y, 11, l); HL(x, y + 1, 11, l);           /* pita perekat lebih terang */
      VL(x + 10, y + 2, 8, s); HL(x, y + 9, 11, s);
      for (let i = 0; i < lines; i++) HL(x + 2, y + 4 + i * 2, i === lines - 1 ? 4 : 6, s);
      if (done) { set(x + 7, y + 6, P.olS); set(x + 8, y + 7, P.olS); set(x + 9, y + 6, P.olS); set(x + 9, y + 5, P.olS) }
      if (curl) { set(x + 10, y + 9, null); set(x + 9, y + 9, l); set(x + 10, y + 8, l) }
    };
    COLS.forEach(([lab, c, l, s], i) => {
      const cx = BX + 5 + i * colW;
      obj(() => {
        /* label kertas berwarna */
        R(cx + 2, BY + 6, colW - 6, 7, c); HL(cx + 2, BY + 6, colW - 6, l); HL(cx + 2, BY + 12, colW - 6, s);
        cur.text(cx + 2 + Math.floor((colW - 6 - cur.textW(lab)) / 2), BY + 7, lab, P.creamL);
      });
      if (i < 2) for (let y = BY + 6; y < BY + BH - 5; y += 2) g.set(cx + colW - 2, y, P.corkS);   /* garis kolom putus-putus */
    });
    const notes = [
      [BX + 6, BY + 16, "y", 2], [BX + 20, BY + 18, "c", 3], [BX + 8, BY + 29, "l", 2], [BX + 22, BY + 31, "y", 1], [BX + 13, BY + 40, "c", 2, 0],
      [BX + 46, BY + 16, "b", 3], [BX + 60, BY + 17, "y", 2, 0], [BX + 48, BY + 29, "y", 2], [BX + 62, BY + 30, "l", 3],
      [BX + 86, BY + 16, "w", 2, 1, 1], [BX + 100, BY + 18, "b", 2, 1, 1], [BX + 88, BY + 29, "y", 1, 0, 1], [BX + 102, BY + 31, "c", 2, 1, 1], [BX + 94, BY + 41, "l", 2, 1, 1]
    ];
    notes.forEach(([x, y, k, n, cu = 1, d = 0]) => obj(() => sticky(x, y, k, n, cu, d)));
    /* foto polaroid + pin bulat */
    obj(() => {
      const x = BX + 52, y = BY + 41; R(x, y, 12, 6, P.paper); VL(x + 11, y, 6, P.paperS);
      R(x + 1, y + 1, 10, 4, P.sky1); R(x + 1, y + 3, 10, 2, P.olL); set(x + 8, y + 2, P.sun); set(x + 3, y + 3, P.ol); set(x + 4, y + 2, P.ol);
    });
    [[BX + 26, BY + 17, P.coral], [BX + 66, BY + 16, P.blueS], [BX + 57, BY + 40, P.coralS], [BX + 105, BY + 17, P.ol], [BX + 14, BY + 28, P.lilS]].forEach(([x, y, c]) => { g.set(x, y, c); g.set(x + 1, y, mix(c, P.ink, .3)); g.set(x, y - 1, mix(c, "#ffffff", .4)) });

    /* ================= RAK DINDING + KALENDER (kanan) ================= */
    const SX = 234, SY = 35, SW = 78;
    R(SX + 2, SY + 3, SW, 2, P.wallD);
    obj(() => {
      /* ordner berdiri: punggung berwarna dengan label krem dan lubang jari */
      const BIN = [[P.blue, P.blueL, P.blueS], [P.blue, P.blueL, P.blueS], [P.coral, P.coralL, P.coralS], [P.cream, P.creamL, P.creamS], [P.tan, P.tanL, P.tanS]];
      BIN.forEach((b, i) => { const x = SX + 4 + i * 7, h = 20 - (i === 3 ? 3 : 0); box(x, SY - h, 6, h, b); R(x + 1, SY - h + 4, 4, 5, P.paper); HL(x + 2, SY - h + 6, 2, b[2]); R(x + 2, SY - 6, 2, 3, b[2]) });
      /* ordner miring bersandar */
      for (let j = 0; j < 18; j++) { const o = Math.floor((17 - j) / 3), x = SX + 40 + o; R(x, SY - 18 + j, 6, 1, P.lil); set(x, SY - 18 + j, P.lilL); set(x + 5, SY - 18 + j, P.lilS) }
      /* kotak arsip + tanaman merambat */
      box(SX + 54, SY - 9, 14, 9, [P.cream, P.creamL, P.creamS]); R(SX + 58, SY - 6, 6, 2, P.creamS);
      box(SX + 69, SY - 7, 7, 7, [P.coral, P.coralL, P.coralS]); HL(SX + 68, SY - 8, 9, P.coralL);
      spr(SX + 66, SY - 13, ["..ab.ab..", ".abbcbbc.", "abbc.bbcc", ".bc...cc."], { a: P.olL, b: P.ol, c: P.olS });
      /* papan rak + siku */
      R(SX, SY, SW, 3, P.wood); HL(SX, SY, SW, P.tanL); HL(SX, SY + 2, SW, P.woodS);
      [SX + 8, SX + SW - 10].forEach(x => { R(x, SY + 3, 2, 6, P.metal); VL(x, SY + 3, 6, P.metalL); for (let k = 0; k < 4; k++) set(x + 2 + k, SY + 3 + k, P.metal) });
    });
    /* daun menjuntai dari pot rak */
    obj(() => { for (let k = 0; k < 5; k++) { const y = SY + 1 + k * 4, x = SX + 72 + [0, 1, 0, -1, 0][k]; VL(x + 1, y, 4, P.olD); spr(x + (k % 2 ? 2 : -2), y + 1, ["ab", "bc"], { a: P.olL, b: P.ol, c: P.olS }) } }, { ink: P.olD });
    /* kalender dinding */
    const CX = 252, CY = 52, CW = 22, CH = 26;
    R(CX + 2, CY + CH, CW, 1, P.wallD); VL(CX + CW, CY + 2, CH - 1, P.wallD);
    obj(() => {
      R(CX, CY, CW, CH, P.paper); VL(CX + CW - 1, CY, CH, P.paperS); HL(CX, CY + CH - 1, CW, P.paperS);
      R(CX, CY, CW, 7, P.coral); HL(CX, CY, CW, P.coralL); HL(CX, CY + 6, CW, P.coralS);
      [CX + 4, CX + 9, CX + 14, CX + 19].forEach(x => { if (x < CX + CW - 1) { set(x, CY + 2, P.coralS); set(x, CY - 1, P.metal); set(x, CY, P.metalL) } });
      HL(CX + 3, CY + 4, CW - 6, P.creamL);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const x = CX + 2 + c * 4, y = CY + 9 + r * 4; R(x, y, 2, 2, r === 2 && c === 3 ? P.coral : P.boardF) }
      set(CX + 14, CY + 16, P.coralS); /* lingkaran tanggal */
    });
    /* paku + tali kalender */
    g.set(CX + 10, CY - 3, P.metal); g.line(CX + 10, CY - 2, CX + 4, CY, P.inkD); g.line(CX + 11, CY - 2, CX + 17, CY, P.inkD);

    /* ================= MEJA KERJA: dua meja + kabinet printer rendah =================
       Meja dipotong supaya lantai di depan tokoh kosong: hero x 90-130 dan NPC x 175-215 berdiri di lantai, bukan di dalam meja.
       Tinggi permukaan disamakan dengan meja kantor acuan (MT 97). */
    const MT = 97, MF = 122;
    const DESKS = [[4, 88], [220, 316]];
    /* stopkontak di plint (terlihat di lantai kosong di belakang NPC) */
    obj(() => { R(186, 104, 8, 6, P.trimL); VL(193, 104, 6, P.trimS); HL(186, 109, 8, P.trimS); set(188, 106, P.metal); set(191, 106, P.metal) });
    DESKS.forEach(([a, b]) => {
      for (let y = MT + 5; y < MF; y++) for (let x = a; x < b; x++) { const c = g.get(x, y); if (c) g.set(x, y, SHADOW[c] || dkc(c, y < MT + 8 ? .3 : .2)) }
      contact(a - 1, MF, b - a + 3);
    });
    const desk = (a, b, legs, cabs) => obj(() => {
      legs.forEach(x => { R(x, MT + 5, 3, MF - MT - 5, P.metal); VL(x, MT + 5, MF - MT - 5, P.metalL); R(x - 2, MF - 2, 7, 2, P.metalD) });
      cabs.forEach(([x, w]) => {
        R(x, MT + 5, w, MF - MT - 5, P.cream); VL(x, MT + 5, MF - MT - 5, P.creamL); VL(x + w - 1, MT + 5, MF - MT - 5, P.creamS);
        [MT + 11, MT + 18].forEach(y => HL(x + 1, y, w - 2, P.creamS));
        [MT + 8, MT + 14, MT + 21].forEach(y => { R(x + w / 2 - 4, y, 8, 1, P.metal); set(x + w / 2 - 4, y - 1, P.metalL) });
        HL(x, MF - 1, w, P.creamS);
      });
      /* daun meja: permukaan 3 baris + tepi depan */
      HL(a, MT - 2, b - a, P.tanL); HL(a, MT - 1, b - a, P.lit); HL(a, MT, b - a, P.lit2);
      R(a, MT + 1, b - a, 3, P.wood); HL(a, MT + 1, b - a, P.tanL); HL(a, MT + 4, b - a, P.woodS);
      set(a, MT - 2, null); set(b - 1, MT - 2, null);
    });
    desk(4, 88, [82], [[10, 30]]);
    desk(220, 316, [224], [[282, 30]]);

    /* ---- kabinet printer rendah di tengah (di antara kedua tokoh, tidak lebih tinggi dari dada) ---- */
    const KX = 136, KW = 32, KT = 102;
    contact(KX - 1, MF, KW + 3);
    obj(() => {
      box(KX, KT, KW, MF - KT, [P.cream, P.creamL, P.creamS]);
      HL(KX + 1, KT + 1, KW - 2, P.creamL);
      [KT + 10].forEach(y => { HL(KX + 1, y, KW - 2, P.creamS); HL(KX + 1, y + 1, KW - 2, P.creamL) });
      [KT + 5, KT + 15].forEach(y => { R(KX + KW / 2 - 4, y, 8, 1, P.metal); set(KX + KW / 2 - 4, y - 1, P.metalL) });
      R(KX + 2, MF - 2, KW - 4, 2, P.creamS);
      /* permukaan kayu tipis */
      R(KX - 1, KT - 2, KW + 2, 2, P.wood); HL(KX - 1, KT - 2, KW + 2, P.tanL); HL(KX - 1, KT - 1, KW + 2, P.woodS);
    });
    /* printer: badan krem, panel kontrol biru, kertas keluar di baki */
    obj(() => spr(KX + 3, KT - 15, [
      "...pppppppppp.........",
      "...qqqqqqqqqq.........",
      ".aaaaaaaaaaaaaaaaaaab.",
      "abbbbbbbbbbbbbbbbbbbcc",
      "abbbbbbbbbbbbbddeebbcc",
      "abbbbbbbbbbbbbddbfbbcc",
      "abbbbbbbbbbbbbbbbbbbcc",
      "agggggggggggggggggggcc",
      "abppppppppppppppbbbbcc",
      "abqqqqqqqqqqqqqqbbbbcc",
      "abbbbbbbbbbbbbbbbbbbcc",
      "abbbbbbbbbbbbbbbbbbbcc",
      ".cccccccccccccccccccc.",
      ".hh................hh."], { a: P.creamL, b: P.cream, c: P.creamS, d: P.blue, e: P.ol, f: P.coral, g: P.metalD, h: P.metal, p: P.paper, q: P.paperS }));

    /* ---- lampu meja koral (kiri): alas, lengan dua ruas berengsel, kap kubah + bohlam ---- */
    const LX = 20;
    obj(() => {
      spr(LX - 6, MT - 5, ["...abbbbc...", ".aabbbbbbcc.", "aabbbbbbbbcc", "cccccccccccc"], { a: P.coralL, b: P.coral, c: P.coralS });
      for (let j = 0; j < 13; j++) { const x = LX - 1 + Math.round(j * 5 / 12); set(x, MT - 6 - j, P.coralL); set(x + 1, MT - 6 - j, P.coralS) }
      spr(LX + 3, MT - 21, ["ab.", "bbc", ".c."], { a: P.metalL, b: P.metal, c: P.metalD });
      for (let j = 0; j < 4; j++) { set(LX + 6 + j * 2, MT - 21 - j, P.coralL); set(LX + 7 + j * 2, MT - 21 - j, P.coral); set(LX + 6 + j * 2, MT - 20 - j, P.coralS); set(LX + 7 + j * 2, MT - 20 - j, P.coralS) }
      spr(LX + 12, MT - 27, [
        "...aab....",
        "..aabbc...",
        ".aabbbbc..",
        "aabbbbbbc.",
        "abbbbbbbcc",
        ".dddddddd.",
        "..eeeeee.."], { a: P.coralL, b: P.coral, c: P.coralS, d: P.coralS, e: P.creamL });
    });
    /* genangan cahaya lampu di permukaan meja */
    for (let x = LX + 10; x < LX + 26; x++) { g.set(x, MT - 2, P.creamL); if (x > LX + 12 && x < LX + 24) g.set(x, MT - 1, P.lit) }

    /* ---- tumpukan dokumen (peta tangan): sisi kertas bergaris, map berwarna, klip ---- */
    const DOC = { p: P.paper, q: P.paperS, s: P.creamS, b: P.blue, B: P.blueS, n: P.blueL, c: P.coral, C: P.coralS, l: P.lil, L: P.lilS, y: P.yel, Y: P.yelS, m: P.metalL, k: P.metalD };
    obj(() => spr(50, MT - 10, [
      "..........yyyy...",
      "..........yyyY...",
      "..........yyY....",
      "ppppppppppppppps.",
      "qqqqqqqqqqqqqqqs.",
      "pppppppppppppppps",
      "qqqqqqqqqqqqqqqqs",
      "nnnnnnnnnnnnnnnnb",
      "bbbbbbbbbbbbbbbbB",
      "BBBBBBBBBBBBBBBBB"], DOC));
    obj(() => spr(68, MT - 14, [
      "...yyyyyy.......",
      "...yyyyyY.......",
      ".pppppppppppppps",
      ".qqqqqqqqqqqqqqs",
      "ppppppppppppppps",
      "ccqqqqqqqqqqqqqs",
      "cCppppppppppppps",
      ".qqqqqqqqqqqqqqs",
      ".pppppppppppppps",
      ".qqqqqqqqqqqqqqs",
      "lllllllllllllllL",
      "LLLLLLLLLLLLLLLL",
      ".ppppppppppppps.",
      ".qqqqqqqqqqqqqs."], DOC));

    /* ---- laptop (meja kanan) ---- */
    const OX = 228, OW = 32, OH = 21;
    obj(() => {
      R(OX - 3, MT - 3, OW + 6, 2, P.metalL); HL(OX - 3, MT - 3, OW + 6, P.boardF); HL(OX - 2, MT - 2, OW + 4, P.metal);
      box(OX, MT - 3 - OH, OW, OH, [P.metal, P.metalL, P.metalD]);
      R(OX + 2, MT - OH - 1, OW - 4, OH - 4, P.screen); HL(OX + 2, MT - OH - 1, OW - 4, P.screenL);
      /* isi layar: lembar kerja + grafik batang */
      R(OX + 3, MT - OH + 1, 13, 1, P.coralL); for (let r = 0; r < 4; r++) { HL(OX + 3, MT - OH + 3 + r * 2, 13, P.screenL); set(OX + 8, MT - OH + 3 + r * 2, P.screenS) }
      R(OX + 18, MT - OH + 1, 10, 12, P.screenL); R(OX + 19, MT - 10, 2, 3, P.blue); R(OX + 22, MT - 13, 2, 6, P.coral); R(OX + 25, MT - 15, 2, 8, P.blueS);
      set(OX + OW / 2, MT - OH - 2, P.metalD);
    }, { ink: P.inkD });

    /* ---- kopi, tempat pena ---- */
    obj(() => {
      R(266, MT - 7, 7, 7, P.cream); VL(266, MT - 7, 7, P.creamL); VL(272, MT - 7, 7, P.creamS); HL(266, MT - 7, 7, P.woodD);
      HL(267, MT - 7, 5, P.woodS); spr(273, MT - 6, ["aa.", "..a", "..a", "aa."], { a: P.creamS }); R(268, MT - 4, 3, 2, P.coral);
    });
    /* uap kopi (tanpa garis tepi) */
    [[268, MT - 9], [269, MT - 10], [268, MT - 11], [270, MT - 12], [271, MT - 13], [270, MT - 14]].forEach(([x, y]) => g.set(x, y, P.creamL));
    obj(() => {
      box(279, MT - 8, 6, 8, [P.blue, P.blueL, P.blueS]);
      [[280, 4, P.coral], [282, 6, P.olS], [283, 3, P.metal]].forEach(([x, h, c]) => { VL(x, MT - 8 - h, h, P.yel); set(x, MT - 9 - h, c) });
    });

    /* ---- buku bertumpuk + sukulen di atasnya ---- */
    obj(() => {
      box(289, MT - 4, 22, 4, [P.blue, P.blueL, P.blueS]); HL(290, MT - 2, 18, P.paper);
      box(291, MT - 8, 18, 4, [P.coral, P.coralL, P.coralS]); HL(292, MT - 6, 14, P.paper);
      box(290, MT - 11, 16, 3, [P.tan, P.tanL, P.tanS]);
    });
    obj(() => {
      box(294, MT - 17, 9, 6, [P.cream, P.creamL, P.creamS]); HL(293, MT - 18, 11, P.creamL);
      spr(292, MT - 23, ["..a.ab..", ".abbabc.", "abbcbbcc", ".bc..cc.", "..bccc.."], { a: P.olL, b: P.ol, c: P.olS });
    });

    /* ================= DI BAWAH MEJA ================= */
    /* tempat sampah kawat biru dengan kertas remuk */
    obj(() => {
      for (let j = 0; j < 14; j++) { const hw = 6 - Math.floor(j / 7), y = MF - 14 + j; HL(56 - hw, y, hw * 2 + 1, P.blueS); set(56 - hw, y, P.blue); set(56 + hw, y, P.metal); if (j % 3 === 1) HL(57 - hw, y, hw * 2 - 1, P.blue) }
      HL(49, MF - 15, 15, P.blueL);
      spr(51, MF - 19, [".aab..", "aabbc.", "abbcc.", ".cc..."], { a: P.paper, b: P.board, c: P.paperS });
    });
    /* ransel koral bersandar di kabinet kanan: tali gantung, kantong depan bergaris resleting, tali samping */
    obj(() => {
      spr(262, MF - 19, [
        ".....aaaa.......",
        "....a....c......",
        "...aabbbbbcc....",
        "..abbbbbbbbbc...",
        ".abbbbbbbbbbbc..",
        ".abbbbbbbbbbbcc.",
        ".abbbbbbbbbbbcc.",
        "aabbbbbbbbbbbbcc",
        "abbaeeeeeeeebbcc",
        "abbaffffffffdbcc",
        "abbaffffgfffdbcc",
        "abbaffffgfffdbcc",
        "abbaffffffffdbcc",
        "abbaffffffffdbcc",
        "abbbddddddddbbcc",
        ".bbbbbbbbbbbbcc.",
        ".ccccccccccccc..",
        "..cccccccccc...."], { a: P.coralL, b: P.coral, c: P.coralS, d: P.coralS, e: P.creamL, f: P.coralL, g: P.metal });
    });
    contact(260, MF, 19);
  };

  SIMPX.bg("meja", { w: W, h: H, floorY: 125, standX: 110, draw });
})();

/* ===== lobi ===== */
/* Latar "lobi" (320x150): lobi gedung kantor modern, pagi hari. Satu dunia dengan kantor.js:
   - Teknik sama: tiap benda satu lapisan + garis tepi selektif otomatis (kiri/atas = tinta navy lembut, kanan/bawah = versi gelap bidang),
     tanpa dither, gradasi berupa pita datar, cahaya dari kiri atas, bayangan kontak 2 piksel.
   - Perspektif sama: sambungan dinding-lantai y 118, sambungan lantai ke titik hilang x 160, kaki tokoh di y 125.
   - Isi: dinding kaca tinggi (kiri) dengan kota + pohon, tanaman besar dalam planter tinggi, dinding bilah kayu dengan logo,
     meja resepsionis, lampu bola gantung, sofa tunggu + lukisan (kanan), lantai batu mengilap dengan pantulan jendela. */
(() => {
  const W = 320, H = 150, FLOOR = 118;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const th = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return th(x.map((v, i) => v + (y[i] - v) * t)) };
  const dkc = (c, t = .4) => mix(mix(c, "#3a3470", t * .6), "#000000", t * .3);

  const P = {
    ink: "#5d5584", inkD: "#463f6c",
    wall: "#f3e5c8", wallL: "#f8eedb", wallS: "#eadab9", wallD: "#dcc6a3",
    trim: "#f7efde", trimL: "#fcf7ec", trimS: "#e2d3b8", wainS: "#dcc6a2",
    sky0: "#b9d1ea", sky1: "#c9dcef", sky2: "#d9e6f1", skyS: "#a9c2df", sun: "#fbf3df", cloud: "#f5f7f5", cloudS: "#e1eaf1",
    bld: "#c2cae3", bldL: "#ced5ea", bldW: "#d7ddee", bldS: "#b1b9d6",
    wood: "#d29d6c", woodG: "#c99262", woodS: "#b27c53", woodD: "#956547",
    coral: "#e3937c", coralL: "#efb29d", coralS: "#c2735f",
    blue: "#94b1d6", blueL: "#b9cde6", blueS: "#7491bb", blueD: "#5f79a3",
    cream: "#f2e5c9", creamL: "#fbf4e3", creamS: "#d8c6a4",
    tan: "#d3ae86", tanL: "#e3c6a3", tanS: "#b48c65",
    ol: "#a3a85d", olL: "#c1c47e", olS: "#7f8a4d", olD: "#5d6843",
    metal: "#665f8a", metalL: "#847ea8", metalD: "#4a436f",
    screen: "#bcd6ee", screenL: "#deebf6", screenS: "#9ebee0",
    board: "#fbfaf5", boardS: "#ebe7ea", boardF: "#cbc5d8",
    /* lantai batu poles: krem keabuan, nat hangat, kilap kekuningan */
    refl: "#eceae2", refl2: "#e4e1d8", stone: "#eadcc4", stoneG: "#e2d2b7", stoneL: "#f5ecdc", stoneL2: "#efe3cd", grout: "#d2bfa1", stoneS: "#cdb999", stoneD: "#b8a283"
  };
  const SHADOW = { [P.stone]: P.stoneS, [P.stoneG]: P.stoneS, [P.stoneL]: P.stoneS, [P.stoneL2]: P.stoneS, [P.grout]: P.stoneD, [P.stoneS]: P.stoneD };

  const LEAF = [
    "...ab...",
    "..aabbd.",
    ".aabbbcd",
    "aabbbbcd",
    "abbbbccd",
    "abbbbccd",
    ".bbbccd.",
    ".bbccdd.",
    "..bcdd..",
    "...dd..."];
  const LEAF_F = LEAF.map(r => [...r].reverse().join("").replace(/a/g, "x").replace(/d/g, "a").replace(/x/g, "d"));

  const draw = g => {
    let cur = g;
    const set = (x, y, c) => cur.set(x, y, c), get = (x, y) => cur.get(x, y);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) };
    const HL = (x, y, w, c) => R(x, y, w, 1, c), VL = (x, y, h, c) => R(x, y, 1, h, c);
    const line = (a, b, c, d, col) => cur.line(a, b, c, d, col);
    const spr = (x, y, rows, pal) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(x + i, y + j, pal[ch]) }));
    const remap = (x, y, map) => { const c = g.get(x, y); if (c && map[c]) g.set(x, y, map[c]) };
    const contact = (x, y, w, h = 2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) remap(x + i, y + j, SHADOW) };
    const obj = (fn, o = {}) => {
      const t = GLPIX.grid(W, H); cur = t; fn(); cur = g;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = t.g[y][x]; if (c) g.set(x, y, c) }
      if (o.ol === false) return;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (t.g[y][x]) continue;
        const l = t.get(x - 1, y), u = t.get(x, y - 1), r = t.get(x + 1, y), d = t.get(x, y + 1);
        if (l || u) g.set(x, y, o.ink || P.ink); else if (r || d) g.set(x, y, dkc(r || d));
      }
    };
    const box = (x, y, w, h, [c, l, s]) => { R(x, y, w, h, c); HL(x, y, w, l); VL(x, y, h, l); VL(x + w - 1, y, h, s); HL(x + 1, y + h - 1, w - 1, s) };

    /* ================= DINDING ================= */
    R(0, 0, W, FLOOR, P.wall);
    R(0, 0, W, 5, P.trim); HL(0, 5, W, P.trimS); HL(0, 6, W, P.wallD); HL(0, 7, W, P.wallS);
    R(0, 110, W, 8, P.trim); HL(0, 110, W, P.trimS); HL(0, 111, W, P.trimL); HL(0, 116, W, P.trimS); HL(0, 117, W, P.wainS);
    /* lampu sorot plafon (titik datar) */
    [118, 300].forEach(x => { HL(x - 2, 5, 5, P.trimL); HL(x - 1, 6, 3, P.creamL) });

    /* ================= LANTAI BATU POLES ================= */
    const VPX = 160, VPY = 30, TW = 26;
    const ROWS = [FLOOR, FLOOR + 5, FLOOR + 11, FLOOR + 19, FLOOR + 30, H + 1];
    const colOf = (x, y) => Math.floor((VPX + (x - VPX) * (FLOOR - VPY) / (y - VPY) - VPX) / TW);
    const rowOf = y => ROWS.findIndex((r, i) => y >= r && y < ROWS[i + 1]);
    for (let y = FLOOR; y < H; y++) for (let x = 0; x < W; x++) set(x, y, (colOf(x, y) + rowOf(y)) & 1 ? P.stoneG : P.stone);
    for (let k = -10; k <= 10; k++) { const x0 = VPX + k * TW + TW / 2, x1 = VPX + (x0 - VPX) * (H - 1 - VPY) / (FLOOR - VPY); line(Math.round(x0), FLOOR, Math.round(x1), H - 1, P.grout) }
    ROWS.slice(1, 5).forEach(y => HL(0, y, W, P.grout));
    HL(0, FLOOR, W, P.stoneD); HL(0, FLOOR + 1, W, P.stoneS);

    /* ================= DINDING KACA TINGGI (kiri) ================= */
    const GX0 = -2, GX1 = 92, GY0 = 8, GY1 = 117, MULS = [29, 60], TRN = 40;
    obj(() => {
      const gx = GX0, gw = GX1 - GX0;
      for (let y = GY0; y < GY1; y++) HL(gx, y, gw, y < 30 ? P.sky0 : y < 56 ? P.sky1 : P.sky2);
      /* awan datar */
      const cloud = (x, y, w) => { HL(x + 3, y, w - 7, P.cloud); R(x + 1, y + 1, w - 2, 1, P.cloud); R(x, y + 2, w, 1, P.cloud); HL(x + 1, y + 3, w - 2, P.cloudS) };
      cloud(8, 16, 15); cloud(64, 24, 12); cloud(36, 46, 10);
      /* menara kota: dua lapis, depan lebih tegas, jendela berupa kisi 2x1 */
      [[0, 58, 16], [14, 50, 12], [40, 62, 14], [52, 44, 13], [72, 54, 18]].forEach(([x, y, w]) => R(x, y, w, 100 - y, P.bldL));
      const tower = (x, y, w) => {
        R(x, y, w, 104 - y, P.bld); VL(x, y, 104 - y, P.bldW); VL(x + w - 1, y, 104 - y, P.bldS);
        for (let yy = y + 4; yy < 100; yy += 5) for (let xx = x + 2; xx < x + w - 2; xx += 4) HL(xx, yy, 2, P.bldW);
      };
      tower(4, 64, 14); tower(24, 52, 12); tower(44, 70, 11); tower(64, 60, 15); tower(83, 72, 10);
      /* pohon & pagar tanaman di luar */
      const bush = (x, y, w, h) => {
        for (let j = 0; j < h; j++) { const ins = j === 0 ? 3 : j === 1 ? 1 : 0; HL(x + ins, y + j, w - ins * 2, j < 3 ? P.olL : j < h - 3 ? P.ol : P.olS) }
        for (let k = 0; k < w; k += 5) set(x + k + 2, y + 4, P.olL), set(x + k + 3, y + h - 4, P.olS);
      };
      bush(-2, 100, 30, 14); bush(26, 104, 20, 10); bush(44, 98, 26, 16); bush(68, 103, 26, 11);
      /* pantulan miring di kaca: pita terang tipis, dua per panel */
      const panes = [[GX0, MULS[0]], [MULS[0] + 3, MULS[1]], [MULS[1] + 3, GX1]];
      panes.forEach(([a, b], pi) => [[6, 4], [16, 2]].forEach(([off, w]) => {
        for (let y = GY0 + 2; y < GY1 - 2; y++) {
          const x0 = a + off + Math.round((GY1 - y) * .55) - 30 + pi * 3;
          for (let i = 0; i < w; i++) { const x = x0 + i; if (x >= a && x < b) { const c = get(x, y); set(x, y, c === P.sky0 ? P.sky1 : c === P.sky1 ? P.sky2 : c === P.bld ? P.bldW : c === P.bldL ? P.bldW : c === P.ol ? P.olL : c === P.sky2 ? P.screenL : c) } }
        }
      }));
      /* rangka logam ramping */
      const bar = (x, y, w, h) => { R(x, y, w, h, P.metal); if (w <= h) VL(x, y, h, P.metalL); else HL(x, y, w, P.metalL) };
      bar(GX0, GY0, gw + 2, 3); bar(GX0, TRN, gw + 2, 2);
      MULS.forEach(x => bar(x, GY0, 3, GY1 - GY0)); bar(GX1, GY0, 3, GY1 - GY0);
      R(GX0, GY1 - 4, gw + 5, 5, P.metal); HL(GX0, GY1 - 4, gw + 5, P.metalL); HL(GX0, GY1, gw + 5, P.metalD);
    });
    /* kilap & pantulan dinding kaca di lantai: pita tegak memudar, nat tetap terlihat */
    const RF = { [P.stone]: P.stoneL, [P.stoneG]: P.stoneL2 }, RF2 = { [P.stone]: P.refl, [P.stoneG]: P.refl2 };
    [[0, 28], [33, 59], [64, 91]].forEach(([a, b]) => {
      for (let y = FLOOR + 2; y < H; y++) {
        const d = y - FLOOR; if (d > 22 || d === 7 || d === 8) continue;
        const ins = Math.floor(d / 4);
        for (let x = a + ins; x <= b - ins; x++) remap(x, y, d < 11 && x > a + ins + 1 && x < b - ins - 1 ? RF2 : RF);
      }
    });
    /* titik kilap kecil di beberapa ubin */
    [[118, 136], [210, 140], [262, 130], [180, 145], [300, 144]].forEach(([x, y]) => { g.set(x, y, P.stoneL); g.set(x + 1, y, P.stoneL); g.set(x + 2, y, P.stoneL2) });

    /* ================= DINDING BILAH KAYU + LOGO ================= */
    const SX = 164, SW = 116, SY = 8, SB = 110;
    R(SX + SW, SY + 2, 2, SB - SY - 2, P.wallD);
    obj(() => {
      for (let x = SX; x < SX + SW; x++) {
        const k = (x - SX) % 5;
        VL(x, SY, SB - SY, k === 4 ? P.woodS : k === 0 ? P.tanL : k === 3 ? P.woodG : P.wood);
      }
      HL(SX, SY, SW, P.tanL); HL(SX, SY + 1, SW, P.lit || P.tanL);
      /* lis lampu tersembunyi di bawah bilah */
      HL(SX, SB - 3, SW, P.woodD); HL(SX, SB - 2, SW, P.creamL); HL(SX, SB - 1, SW, P.cream);
    });
    /* pendaran lampu lis di bilah (pita datar, satu tingkat lebih terang) */
    for (let y = SB - 9; y < SB - 3; y++) for (let x = SX; x < SX + SW; x++) { const c = g.get(x, y); if (y >= SB - 6) g.set(x, y, c === P.woodS ? P.wood : c === P.wood || c === P.woodG ? P.tan : c === P.tanL ? P.tanL : c) }
    /* papan logo: pelat krem membulat, bayangan solid di bilah */
    const LX = 186, LY = 26, LW = 72, LH = 22;
    R(LX + 2, LY + LH, LW, 2, P.woodD); VL(LX + LW, LY + 2, LH, P.woodD); VL(LX + LW + 1, LY + 2, LH, P.woodS);
    obj(() => {
      R(LX, LY, LW, LH, P.creamL); set(LX, LY, null); set(LX + LW - 1, LY, null); set(LX, LY + LH - 1, null); set(LX + LW - 1, LY + LH - 1, null);
      HL(LX + 1, LY, LW - 2, P.board); VL(LX, LY + 1, LH - 2, P.board);
      VL(LX + LW - 1, LY + 1, LH - 2, P.creamS); HL(LX + 1, LY + LH - 1, LW - 2, P.creamS); HL(LX + 1, LY + LH - 2, LW - 2, P.cream);
      /* ikon: tunas krem di kotak koral membulat (gambar tangan) */
      spr(LX + 4, LY + 4, [
        "..aaaaaaaaaa..",
        ".aabbbbbbbbbc.",
        "aabbbbbbbbddbc",
        "abbbbbbbbdddbc",
        "abddbbbbdddbbc",
        "abdddbbbddbbbc",
        "abbdddbbdbbbbc",
        "abbbbddddbbbbc",
        "abbbbbbdbbbbbc",
        "abbbbbbdbbbbbc",
        "abbbbeeeeebbbc",
        "abbbbbbbbbbbcc",
        ".bccccccccccc.",
        "..cccccccccc.."], { a: P.coralL, b: P.coral, c: P.coralS, d: P.creamL, e: P.coralS });
      cur.text(LX + 23, LY + 5, "GROWTH", P.inkD);
      cur.text(LX + 23, LY + 12, "LAB", P.coralS);
      HL(LX + 36, LY + 14, 30, P.creamS);
    });

    /* ================= PAPAN PETUNJUK (dinding antara kaca dan bilah) ================= */
    const NX = 104, NY = 22, NW = 42, NH = 25;
    R(NX + 2, NY + NH, NW, 2, P.wallD); VL(NX + NW, NY + 2, NH, P.wallD);
    obj(() => {
      box(NX, NY, NW, NH, [P.metal, P.metalL, P.metalD]);
      HL(NX + 3, NY + 12, NW - 6, P.metalD);
      cur.text(NX + 4, NY + 4, "LIFT", P.creamL);
      spr(NX + 31, NY + 4, ["..a..", "..aa.", "aaaaa", "..aa.", "..a.."], { a: P.coralL });
      cur.text(NX + 4, NY + 16, "RAPAT", P.creamL);
      spr(NX + 31, NY + 16, ["..a..", ".aaa.", "aaaaa", "..a..", "..a.."], { a: P.blueL });
    }, { ink: P.inkD });

    /* ================= LAMPU BOLA GANTUNG ================= */
    const globe = (x, len) => {
      const y0 = 8 + len;
      obj(() => {
        VL(x, 7, len, P.metal);
        R(x - 2, y0, 5, 2, P.metal); HL(x - 2, y0, 5, P.metalL);
        for (let y = -5; y <= 5; y++) for (let xx = -5; xx <= 5; xx++) { const d = xx * xx + y * y; if (d <= 28) set(x + xx, y0 + 7 + y, d < 6 && xx + y < 0 ? P.board : xx + y < -3 ? P.creamL : xx + y > 4 ? P.cream : P.creamL) }
        set(x - 2, y0 + 4, P.board); set(x - 3, y0 + 5, P.board);
      });
    };
    globe(174, 34); globe(270, 30);

    /* ================= TANAMAN BESAR (planter tinggi) ================= */
    const PX = 150, PB = 126;
    contact(PX - 10, PB, 22);
    /* tiga batang utama; daun menempel bergantian kiri-kanan, rapat seperti fiddle-leaf dewasa */
    const STEMS = [[-15, -64], [-1, -80], [16, -70], [7, -52]], LV = [];
    STEMS.forEach(([tx, ty], si) => [.3, .46, .62, .78, .9, 1].forEach((t, k) => {
      const x = Math.round(PX + tx * t), y = Math.round(PB - 22 + (ty + 22) * t), right = (k + si) % 2;
      LV.push([x + (right ? 1 : -8), y - 7 + (right ? 2 : 0), right, (k + si * 2) % 3 === 0]);
    }));
    obj(() => STEMS.forEach(([tx, ty]) => { line(PX, PB - 22, PX + tx, PB + ty, P.olD); line(PX + 1, PB - 22, PX + tx + 1, PB + ty, P.olS) }), { ol: false });
    obj(() => {
      const fr = { a: P.olL, b: P.ol, c: P.olS, d: P.olD }, bk = { a: P.ol, b: P.olS, c: P.olD, d: P.olD };
      LV.filter(l => l[3]).forEach(([x, y, f]) => spr(x, y, f ? LEAF_F : LEAF, bk));
      LV.filter(l => !l[3]).forEach(([x, y, f]) => spr(x, y, f ? LEAF_F : LEAF, fr));
      /* planter silinder tinggi: krem dengan pita koral */
      for (let y = PB - 22; y < PB; y++) { const hw = 8; HL(PX - hw, y, hw * 2 + 1, P.cream); set(PX - hw, y, P.creamL); set(PX - hw + 1, y, P.creamL); set(PX + hw, y, P.creamS); set(PX + hw - 1, y, P.creamS) }
      R(PX - 8, PB - 13, 17, 3, P.coral); HL(PX - 8, PB - 13, 17, P.coralL); HL(PX - 8, PB - 11, 17, P.coralS); set(PX + 8, PB - 12, P.coralS);
      R(PX - 9, PB - 24, 19, 3, P.cream); HL(PX - 9, PB - 24, 19, P.creamL); HL(PX - 9, PB - 22, 19, P.creamS);
      HL(PX - 7, PB - 1, 15, P.creamS);
    });

    /* ================= MEJA RESEPSIONIS ================= */
    const DX = 172, DW = 96, LT = 84, DT = 90, DB = 123;
    /* monitor (punggung) & map di meja kerja di balik ambalan */
    obj(() => {
      box(214, 64, 26, 18, [P.metal, P.metalL, P.metalD]); R(217, 67, 20, 2, P.metalL); R(225, 82, 4, 3, P.metal);
      box(244, 72, 5, 12, [P.blue, P.blueL, P.blueS]); box(249, 74, 5, 10, [P.coral, P.coralL, P.coralS]);
    }, { ink: P.inkD });
    contact(DX - 1, DB, DW + 4);
    for (let y = DB + 3; y < DB + 9; y++) if (y !== DB + 6) for (let x = DX + 2; x < DX + DW - 2; x++) remap(x, y, RF);
    obj(() => {
      /* panel depan krem, alas tersembunyi gelap */
      R(DX, DT, DW, DB - DT - 3, P.cream); VL(DX, DT, DB - DT - 3, P.creamL); VL(DX + 1, DT, DB - DT - 3, P.creamL); VL(DX + DW - 1, DT, DB - DT - 3, P.creamS); VL(DX + DW - 2, DT, DB - DT - 3, P.creamS);
      HL(DX, DT, DW, P.creamS);
      /* pita aksen koral + garis panel */
      R(DX, DT + 9, DW, 3, P.coral); HL(DX, DT + 9, DW, P.coralL); HL(DX, DT + 11, DW, P.coralS);
      [DX + 32, DX + 64].forEach(x => { VL(x, DT + 12, DB - DT - 15, P.creamS); VL(x + 1, DT + 12, DB - DT - 15, P.creamL) });
      R(DX + 2, DB - 3, DW - 4, 3, P.metal); HL(DX + 2, DB - 3, DW - 4, P.metalD);
      /* ambalan atas: kayu, menjorok ke depan */
      R(DX - 3, LT, DW + 6, 6, P.wood); HL(DX - 3, LT, DW + 6, P.tanL); HL(DX - 3, LT + 1, DW + 6, P.tanL); HL(DX - 3, LT + 4, DW + 6, P.woodS); HL(DX - 3, LT + 5, DW + 6, P.woodD);
      /* logo kecil di panel kanan */
      const lx = DX + 74, ly = DT + 17;
      spr(lx - 4, ly - 4, [".aaaaaaa.", "abbbbbddc", "abddbddbc", "abbddbbbc", "abbbdbbbc", "abbbdbbbc", "abbbbbbbc", ".ccccccc."], { a: P.coralL, b: P.coral, c: P.coralS, d: P.creamL });
    });
    /* benda di ambalan */
    obj(() => {
      /* bel layanan */
      spr(252, LT - 5, [".abb.", "abbbc", "abbbc", "ddddd"], { a: P.metalL, b: P.metal, c: P.metalD, d: P.metalD }); set(254, LT - 6, P.metalL);
    }, { ink: P.inkD });
    obj(() => {
      /* vas bunga */
      R(178, LT - 7, 5, 7, P.blue); VL(178, LT - 7, 7, P.blueL); VL(182, LT - 7, 7, P.blueS);
      VL(179, LT - 13, 6, P.olS); VL(181, LT - 12, 5, P.olS);
      spr(176, LT - 17, [".ab.ab.", "abbcbbc", ".cc.cc.", "...a..."], { a: P.coralL, b: P.coral, c: P.coralS });
    });
    obj(() => {
      /* dudukan brosur */
      R(236, LT - 9, 9, 9, P.creamS); R(237, LT - 8, 3, 8, P.blueL); R(241, LT - 7, 3, 7, P.coralL); HL(236, LT - 2, 9, P.creamS);
    });

    /* ================= SOFA TUNGGU + LUKISAN (kanan) ================= */
    const AX = 286, AY = 36, AW = 28, AH = 26;
    R(AX + 2, AY + AH, AW, 2, P.wallD); VL(AX + AW, AY + 2, AH, P.wallD);
    obj(() => {
      box(AX, AY, AW, AH, [P.tan, P.tanL, P.tanS]);
      R(AX + 2, AY + 2, AW - 4, AH - 4, P.creamL);
      for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 40) set(AX + 10 + x, AY + 11 + y, y < -2 ? P.coralL : P.coral);
      R(AX + 15, AY + 6, 8, 12, P.blue); HL(AX + 15, AY + 6, 8, P.blueL); VL(AX + 22, AY + 6, 12, P.blueS);
      HL(AX + 2, AY + AH - 6, AW - 4, P.olS); R(AX + 2, AY + AH - 5, AW - 4, 3, P.ol);
    });
    const FX = 280;
    contact(FX - 1, 123, W - FX + 2);
    obj(() => {
      /* sandaran */
      R(FX + 4, 90, W - FX, 14, P.blue); HL(FX + 4, 90, W - FX, P.blueL); HL(FX + 4, 91, W - FX, P.blueL); VL(FX + 4, 90, 14, P.blueL);
      [FX + 24].forEach(x => VL(x, 93, 10, P.blueS));
      /* bantal koral */
      spr(FX + 10, 92, [
        ".aaaaaaaa.",
        "aabbbbbbbc",
        "abbbbbbbbc",
        "abbbbbbbbc",
        "abbbbbbbcc",
        "abbbbbbbcc",
        "abbbbbbbcc",
        ".cccccccc."], { a: P.coralL, b: P.coral, c: P.coralS });
      /* dudukan */
      R(FX + 4, 104, W - FX, 6, P.blue); HL(FX + 4, 104, W - FX, P.blueL); HL(FX + 4, 109, W - FX, P.blueS); VL(FX + 24, 105, 4, P.blueS);
      R(FX + 2, 110, W - FX, 8, P.blueS); HL(FX + 2, 110, W - FX, P.blue); HL(FX + 2, 117, W - FX, P.blueD);
      /* lengan */
      R(FX, 97, 7, 21, P.blue); HL(FX, 97, 7, P.blueL); VL(FX, 97, 21, P.blueL); VL(FX + 6, 98, 20, P.blueS); HL(FX + 1, 117, 6, P.blueD);
      set(FX, 97, null);
      /* kaki logam */
      [FX + 2, FX + 32].forEach(x => { R(x, 118, 2, 4, P.metal); set(x, 118, P.metalL) });
    });
    /* meja samping kecil dengan majalah */
    obj(() => {
      R(270, 104, 9, 2, P.wood); HL(270, 104, 9, P.tanL); VL(274, 106, 15, P.metal); R(271, 121, 7, 1, P.metalD);
      R(271, 102, 7, 2, P.blueL); HL(271, 103, 7, P.blueS); R(272, 101, 5, 1, P.coralL);
    });
    contact(270, 122, 10, 1);
  };

  SIMPX.bg("lobi", { w: W, h: H, floorY: 125, standX: 110, draw });
})();

/* ===== pantry ===== */
/* Latar "pantry" (320x150): pantry kantor kecil yang rapi, siang hari. Satu dunia dengan kantor.js:
   - Teknik sama: tiap benda satu lapisan + garis tepi selektif otomatis (kiri/atas = tinta navy lembut, kanan/bawah = versi gelap bidang),
     tanpa dither, gradasi berupa pita datar, cahaya dari kiri atas, bayangan kontak 2 piksel.
   - Perspektif sama: sambungan dinding-lantai y 118, lantai papan ke titik hilang x 160, kaki tokoh di y 125.
   - Aksen teal (diturunkan saturasinya supaya tidak bersaing dengan kaos hero): kabinet atas & bawah, ubin backsplash.
   - Isi: dispenser galon + papan pengumuman (kiri), jam, kabinet atas, meja dapur dengan ketel, keran, mesin kopi & mug, kulkas (kanan). */
(() => {
  const W = 320, H = 150, FLOOR = 118;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const th = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return th(x.map((v, i) => v + (y[i] - v) * t)) };
  const dkc = (c, t = .4) => mix(mix(c, "#3a3470", t * .6), "#000000", t * .3);

  const P = {
    ink: "#5d5584", inkD: "#463f6c",
    wall: "#f3e5c8", wallL: "#f8eedb", wallS: "#eadab9", wallD: "#dcc6a3",
    trim: "#f7efde", trimL: "#fcf7ec", trimS: "#e2d3b8", wainS: "#dcc6a2",
    wood: "#d29d6c", woodG: "#c99262", woodS: "#b27c53", woodD: "#956547",
    lit: "#e8bd89", lit2: "#e0b17d", litS: "#c99262",
    coral: "#e3937c", coralL: "#efb29d", coralS: "#c2735f",
    blue: "#94b1d6", blueL: "#b9cde6", blueS: "#7491bb",
    cream: "#f2e5c9", creamL: "#fbf4e3", creamS: "#d8c6a4",
    tan: "#d3ae86", tanL: "#e3c6a3", tanS: "#b48c65",
    ol: "#a3a85d", olL: "#c1c47e", olS: "#7f8a4d", olD: "#5d6843",
    metal: "#665f8a", metalL: "#847ea8", metalD: "#4a436f",
    screen: "#bcd6ee", screenL: "#deebf6", screenS: "#9ebee0",
    board: "#fbfaf5", boardS: "#ebe7ea", boardF: "#cbc5d8", boardFD: "#a7a1bd",
    cork: "#cf9f6e", corkL: "#dcb487", corkS: "#b6865b", corkD: "#a27552",
    yel: "#f0d58c", yelL: "#f8e7b4", yelS: "#d3b46b",
    paper: "#fdf9ef", paperS: "#e6dccb",
    /* teal pantry: kalem, condong ke biru di bayangan, ke krem di sorotan */
    teal: "#86b9ae", tealL: "#acd2c6", tealS: "#679a95", tealD: "#4f7a80",
    tile: "#e3eee6", tileL: "#f1f6f1", tileG: "#c9dbd3", tileT: "#b9d8cd",
    water: "#b9d6ee", waterL: "#dcebf7", waterS: "#93b7dc"
  };
  const SHADOW = { [P.wood]: P.woodS, [P.woodG]: P.woodS, [P.woodS]: P.woodD, [P.lit]: P.litS, [P.lit2]: P.litS, [P.litS]: P.woodS };

  const draw = g => {
    let cur = g;
    const set = (x, y, c) => cur.set(x, y, c), get = (x, y) => cur.get(x, y);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) };
    const HL = (x, y, w, c) => R(x, y, w, 1, c), VL = (x, y, h, c) => R(x, y, 1, h, c);
    const line = (a, b, c, d, col) => cur.line(a, b, c, d, col);
    const spr = (x, y, rows, pal) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(x + i, y + j, pal[ch]) }));
    const remap = (x, y, map) => { const c = g.get(x, y); if (c && map[c]) g.set(x, y, map[c]) };
    const contact = (x, y, w, h = 2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) remap(x + i, y + j, SHADOW) };
    const obj = (fn, o = {}) => {
      const t = GLPIX.grid(W, H); cur = t; fn(); cur = g;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = t.g[y][x]; if (c) g.set(x, y, c) }
      if (o.ol === false) return;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (t.g[y][x]) continue;
        const l = t.get(x - 1, y), u = t.get(x, y - 1), r = t.get(x + 1, y), d = t.get(x, y + 1);
        if (l || u) g.set(x, y, o.ink || P.ink); else if (r || d) g.set(x, y, dkc(r || d));
      }
    };
    const box = (x, y, w, h, [c, l, s]) => { R(x, y, w, h, c); HL(x, y, w, l); VL(x, y, h, l); VL(x + w - 1, y, h, s); HL(x + 1, y + h - 1, w - 1, s) };
    const TEAL = [P.teal, P.tealL, P.tealS];

    /* ================= DINDING ================= */
    R(0, 0, W, FLOOR, P.wall);
    R(0, 0, W, 5, P.trim); HL(0, 5, W, P.trimS); HL(0, 6, W, P.wallD); HL(0, 7, W, P.wallS);
    R(0, 110, W, 8, P.trim); HL(0, 110, W, P.trimS); HL(0, 111, W, P.trimL); HL(0, 116, W, P.trimS); HL(0, 117, W, P.wainS);

    /* ================= LANTAI (sama dengan kantor) ================= */
    const VPX = 160, VPY = 30, FW = 15;
    const strip = (x, y) => Math.floor((VPX + (x - VPX) * (FLOOR - VPY) / (y - VPY) - VPX) / FW);
    for (let y = FLOOR; y < H; y++) for (let x = 0; x < W; x++) set(x, y, strip(x, y) & 1 ? P.woodG : P.wood);
    for (let k = -12; k <= 12; k++) { const x0 = VPX + k * FW, x1 = VPX + (x0 - VPX) * (H - 1 - VPY) / (FLOOR - VPY); line(x0, FLOOR, Math.round(x1), H - 1, P.woodS) }
    for (let y = FLOOR + 2; y < H; y++) for (let x = 0; x < W; x++) { const s = strip(x, y), jy = FLOOR + 6 + ((s * 13 + 91) % 23); if (y === jy && get(x, y) !== P.woodS) set(x, y, P.woodS) }
    HL(0, FLOOR, W, P.woodD); HL(0, FLOOR + 1, W, P.woodS);
    /* pantulan lampu bawah kabinet di lantai depan meja dapur (pita datar) */
    const LIT = { [P.wood]: P.lit, [P.woodG]: P.lit2, [P.woodS]: P.litS };
    for (let y = FLOOR + 8; y < FLOOR + 20; y++) { const t = (y - FLOOR - 8) / 12; if (t > .45 && t < .55) continue; for (let x = Math.round(158 + 10 * t); x < Math.round(262 + 14 * t); x++) remap(x, y, LIT) }

    /* ================= PAPAN PENGUMUMAN (kiri atas) ================= */
    const BX = 44, BY = 16, BW = 52, BH = 42;
    R(BX + 2, BY + BH, BW, 2, P.wallD); R(BX + BW, BY + 2, 2, BH, P.wallD);
    obj(() => {
      box(BX, BY, BW, BH, [P.wood, P.tanL, P.woodS]); VL(BX + 1, BY + 1, BH - 2, P.lit); HL(BX + 1, BY + 1, BW - 2, P.lit);
      R(BX + 3, BY + 3, BW - 6, BH - 6, P.cork); HL(BX + 3, BY + 3, BW - 6, P.corkS); VL(BX + 3, BY + 3, BH - 6, P.corkS);
      for (let i = 0; i < 30; i++) { const x = BX + 5 + ((i * 29) % (BW - 10)), y = BY + 5 + ((i * 17 + (i >> 2) * 5) % (BH - 10)); set(x, y, i % 3 ? P.corkL : P.corkD) }
      HL(BX + 1, BY + BH - 2, BW - 2, P.woodS); HL(BX + 2, BY + BH - 1, BW - 3, P.woodD);
    });
    /* lembaran: judul teal, jadwal piket bergaris, menu koral, catatan kuning, foto */
    obj(() => {
      R(BX + 6, BY + 5, 24, 7, P.teal); HL(BX + 6, BY + 5, 24, P.tealL); HL(BX + 6, BY + 11, 24, P.tealS);
      cur.text(BX + 10, BY + 6, "INFO", P.creamL);
    });
    obj(() => {
      R(BX + 6, BY + 15, 18, 20, P.paper); VL(BX + 23, BY + 15, 20, P.paperS); HL(BX + 6, BY + 34, 18, P.paperS);
      HL(BX + 8, BY + 17, 10, P.tealS);
      for (let r = 0; r < 5; r++) { HL(BX + 8, BY + 20 + r * 3, 3, P.boardF); HL(BX + 12, BY + 20 + r * 3, r === 2 ? 5 : 9, P.boardF) }
      [[0, 1], [1, 1], [3, 1]].forEach(([r]) => { set(BX + 8, BY + 20 + r * 3, P.tealS) });
    });
    obj(() => {
      R(BX + 33, BY + 6, 14, 17, P.coralL); HL(BX + 33, BY + 6, 14, P.creamL); VL(BX + 46, BY + 7, 16, P.coral); HL(BX + 33, BY + 22, 14, P.coral);
      R(BX + 35, BY + 9, 10, 4, P.creamL); set(BX + 37, BY + 10, P.coralS); set(BX + 38, BY + 11, P.coralS); set(BX + 40, BY + 10, P.coralS); set(BX + 42, BY + 11, P.coralS);
      HL(BX + 35, BY + 15, 9, P.coral); HL(BX + 35, BY + 17, 7, P.coral); HL(BX + 35, BY + 19, 8, P.coral);
    });
    obj(() => {
      R(BX + 27, BY + 25, 11, 10, P.yel); HL(BX + 27, BY + 25, 11, P.yelL); HL(BX + 27, BY + 26, 11, P.yelL); VL(BX + 37, BY + 27, 8, P.yelS); HL(BX + 27, BY + 34, 11, P.yelS);
      HL(BX + 29, BY + 29, 6, P.yelS); HL(BX + 29, BY + 31, 4, P.yelS);
    });
    obj(() => {
      R(BX + 40, BY + 26, 9, 9, P.paper); VL(BX + 48, BY + 26, 9, P.paperS);
      R(BX + 41, BY + 27, 7, 5, P.blueL); R(BX + 41, BY + 30, 7, 2, P.olL); set(BX + 46, BY + 28, P.creamL); set(BX + 43, BY + 30, P.ol);
    });
    [[BX + 17, BY + 5, P.coral], [BX + 15, BY + 15, P.tealS], [BX + 39, BY + 6, P.blueS], [BX + 32, BY + 25, P.coral], [BX + 44, BY + 26, P.olS]].forEach(([x, y, c]) => { g.set(x, y, c); g.set(x + 1, y, mix(c, P.ink, .3)); g.set(x, y - 1, mix(c, "#ffffff", .4)) });

    /* ================= JAM DINDING ================= */
    const KX = 118, KY = 26;
    for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) if (x * x + y * y <= 54) g.set(KX + x + 2, KY + y + 2, P.wallD);
    obj(() => {
      for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) {
        const d = x * x + y * y; if (d > 54) continue;
        set(KX + x, KY + y, d > 32 ? (x + y < 0 ? P.tealL : x + y > 3 ? P.tealS : P.teal) : (d > 22 && x + y < -2 ? P.boardS : P.board));
      }
      [[0, -4], [4, 0], [0, 4], [-4, 0]].forEach(([x, y]) => set(KX + x, KY + y, P.boardFD));
      VL(KX, KY - 3, 3, P.inkD); HL(KX - 3, KY, 3, P.inkD); set(KX, KY, P.coralS);
    });

    /* ================= DISPENSER GALON (kiri) ================= */
    const DSX = 12, DSW = 22, DST = 86, DSB = 123;
    contact(DSX - 1, DSB, DSW + 3);
    obj(() => {
      /* badan */
      R(DSX, DST, DSW, DSB - DST, P.cream); VL(DSX, DST, DSB - DST, P.creamL); VL(DSX + 1, DST, DSB - DST, P.creamL); VL(DSX + DSW - 1, DST, DSB - DST, P.creamS); VL(DSX + DSW - 2, DST, DSB - DST, P.creamS);
      HL(DSX, DST, DSW, P.creamL); HL(DSX, DSB - 1, DSW, P.creamS);
      /* ceruk keran */
      R(DSX + 3, DST + 5, DSW - 6, 12, P.metal); HL(DSX + 3, DST + 5, DSW - 6, P.metalD); R(DSX + 4, DST + 15, DSW - 8, 2, P.boardF); HL(DSX + 4, DST + 16, DSW - 8, P.boardFD);
      spr(DSX + 6, DST + 6, ["aa..bb", "aa..bb", ".c...d"], { a: P.coral, b: P.blue, c: P.coralS, d: P.blueS });
      /* pintu kabinet bawah */
      R(DSX + 3, DST + 21, DSW - 6, 12, P.cream); HL(DSX + 3, DST + 21, DSW - 6, P.creamS); VL(DSX + 3, DST + 21, 12, P.creamS); R(DSX + DSW - 7, DST + 25, 1, 4, P.metal);
      /* leher + galon terbalik */
      R(DSX + 7, DST - 3, 8, 3, P.metalL); HL(DSX + 7, DST - 1, 8, P.metal);
      const gx = DSX + 1, gy = DST - 27;
      spr(gx, gy, [
        "...aaaaaaaaaaaaaa...",
        "..abbbbbbbbbbbbbbc..",
        ".abbaabbbbbbbbbbbcc.",
        ".abaabbbbbbbbbbbbbc.",
        ".abaabbbbbbbbbbbbbc.",
        ".abaabbbbbbbbbbbbbc.",
        ".aaaaaaaaaaaaaaaaac.",
        ".abbbbbbbbbbbbbbbbc.",
        ".abaabbbbbbbbbbbbbc.",
        ".abaabbbbbbbbbbbbbc.",
        ".abaabbbbbbbbbbbbbc.",
        ".abaabbbbbbbbbbbbcc.",
        ".aaaaaaaaaaaaaaaaac.",
        ".abbbbbbbbbbbbbbbbc.",
        ".abaabbbbbbbbbbbbbc.",
        ".abaabbbbbbbbbbbbbc.",
        ".abaabbbbbbbbbbbbcc.",
        ".abbbbbbbbbbbbbbbcc.",
        "..abbbbbbbbbbbbbcc..",
        "...cbbbbbbbbbbbcc...",
        ".....cccbbbbccc.....",
        ".......abbbbc.......",
        ".......abbbbc.......",
        ".......cccccc......."], { a: P.waterL, b: P.water, c: P.waterS });
      /* label galon */
      R(gx + 6, gy + 8, 9, 4, P.creamL); HL(gx + 7, gy + 9, 6, P.blueS);
    });
    /* tabung gelas kertas di sisi dispenser */
    obj(() => { R(DSX + DSW, DST + 3, 4, 16, P.boardS); VL(DSX + DSW, DST + 3, 16, P.board); VL(DSX + DSW + 3, DST + 3, 16, P.boardF); spr(DSX + DSW, DST + 19, ["abbc", ".bc."], { a: P.creamL, b: P.paper, c: P.paperS }) });

    /* ================= KABINET ATAS + BACKSPLASH ================= */
    const UX = 140, UW = 136, UY = 12, UH = 36, CT = 86;
    /* backsplash ubin metro (8x4, bersilang), pita teal di tengah */
    obj(() => {
      for (let y = UY + UH; y < CT; y++) for (let x = UX; x < UX + UW; x++) {
        const r = Math.floor((y - UY - UH) / 4), off = r % 2 ? 4 : 0, gxl = (x - UX + off) % 8 === 0, gyl = (y - UY - UH) % 4 === 3;
        const band = r === 6;
        set(x, y, gxl || gyl ? P.tileG : band ? P.tileT : ((x - UX + off) % 8 === 1 || (y - UY - UH) % 4 === 0) ? P.tileL : P.tile);
      }
    }, { ink: P.tileG });
    /* lampu di bawah kabinet: pita terang di ubin atas */
    for (let y = UY + UH; y < UY + UH + 3; y++) for (let x = UX + 2; x < UX + UW - 2; x++) { const c = g.get(x, y); g.set(x, y, c === P.tileG ? P.tile : P.tileL) }
    R(UX + 2, UY + UH + 4, UW, 2, P.tileG);
    obj(() => {
      const DW = UW / 4;
      for (let i = 0; i < 4; i++) {
        const x = UX + i * DW;
        box(x, UY, DW, UH, TEAL); VL(x + 1, UY + 1, UH - 2, P.tealL);
        /* panel shaker: bingkai dalam */
        HL(x + 4, UY + 4, DW - 8, P.tealS); VL(x + 4, UY + 4, UH - 8, P.tealS); HL(x + 4, UY + UH - 5, DW - 8, P.tealL); VL(x + DW - 5, UY + 4, UH - 8, P.tealL);
        const hx = i % 2 ? x + 3 : x + DW - 4; R(hx, UY + UH - 12, 1, 6, P.metal); set(hx, UY + UH - 12, P.metalL);
      }
      HL(UX - 2, UY - 2, UW + 4, P.trimL); R(UX - 2, UY - 1, UW + 4, 1, P.trimS);
      R(UX, UY + UH, UW, 2, P.tealD); HL(UX + 4, UY + UH + 1, UW - 8, P.creamL);
    });

    /* rak terbuka dengan mug (di atas mesin kopi) */
    const RX = 222, RY = 64;
    obj(() => {
      const MUG = [[P.coral, P.coralL, P.coralS], [P.cream, P.creamL, P.creamS], [P.teal, P.tealL, P.tealS], [P.blue, P.blueL, P.blueS], [P.yel, P.yelL, P.yelS]];
      MUG.forEach((m, i) => { const x = RX + 3 + i * 10; box(x, RY - 7, 6, 7, m); spr(x + 6, RY - 6, ["aa", ".a", "aa"], { a: m[2] }) });
      R(RX, RY, 52, 3, P.wood); HL(RX, RY, 52, P.tanL); HL(RX, RY + 2, 52, P.woodS);
      [RX + 4, RX + 46].forEach(x => { R(x, RY + 3, 2, 4, P.metal); set(x + 2, RY + 3, P.metal); set(x + 3, RY + 3, P.metal) });
    });

    /* ================= MEJA DAPUR + KABINET BAWAH ================= */
    const KB = 123;
    for (let y = CT + 4; y < KB; y++) for (let x = UX - 2; x < UX + UW + 2; x++) { const c = g.get(x, y); if (c && SHADOW[c] && y >= FLOOR) g.set(x, y, SHADOW[c]) }
    contact(UX - 2, KB, UW + 4);
    obj(() => {
      const DW = UW / 4;
      for (let i = 0; i < 4; i++) {
        const x = UX + i * DW;
        /* laci atas */
        box(x, CT + 4, DW, 8, TEAL); R(x + DW / 2 - 4, CT + 7, 8, 1, P.metal); set(x + DW / 2 - 4, CT + 6, P.metalL);
        /* pintu */
        box(x, CT + 12, DW, KB - CT - 15, TEAL); VL(x + 1, CT + 13, KB - CT - 17, P.tealL);
        HL(x + 4, CT + 15, DW - 8, P.tealS); VL(x + 4, CT + 15, KB - CT - 22, P.tealS); HL(x + 4, KB - 7, DW - 8, P.tealL); VL(x + DW - 5, CT + 15, KB - CT - 22, P.tealL);
        const hx = i % 2 ? x + 3 : x + DW - 4; R(hx, CT + 16, 1, 6, P.metal); set(hx, CT + 16, P.metalL);
      }
      /* plint kaki */
      R(UX + 1, KB - 3, UW - 2, 3, P.tealD); HL(UX + 1, KB - 3, UW - 2, P.metalD);
      /* daun meja batu krem: permukaan 2 baris + tepi depan */
      HL(UX - 3, CT, UW + 6, P.board); HL(UX - 3, CT + 1, UW + 6, P.creamL); R(UX - 3, CT + 2, UW + 6, 2, P.cream); HL(UX - 3, CT + 3, UW + 6, P.creamS);
    });

    /* ---- ketel listrik koral ---- */
    obj(() => spr(146, CT - 13, [
      "....aab.....",
      "...abbbc....",
      ".aabbbbbcc..",
      "aabbbbbbbcdd",
      "abbbbbbbbc.d",
      "abeebbbbbc.d",
      "abeebbbbbcdd",
      "abbbbbbbbc..",
      "abbbbbbbbcc.",
      ".bbbbbbbbc..",
      "ffffffffff..",
      "ffggggggff..",
      "............"], { a: P.coralL, b: P.coral, c: P.coralS, d: P.coralS, e: P.creamL, f: P.metal, g: P.metalD }));
    /* ---- keran leher angsa + sabun ---- */
    obj(() => {
      R(186, CT - 2, 8, 2, P.metal); HL(186, CT - 2, 8, P.metalL);
      VL(189, CT - 16, 14, P.metalL); VL(190, CT - 16, 14, P.metal);
      spr(189, CT - 19, [".aab.", "ab.bc", "a...c", "....c", "....d"], { a: P.metalL, b: P.metal, c: P.metal, d: P.metalD });
      R(195, CT - 4, 3, 2, P.metal);
    });
    obj(() => { box(200, CT - 9, 5, 9, [P.tealL, P.tileL, P.teal]); R(201, CT - 12, 3, 3, P.metal); set(203, CT - 13, P.metalL); HL(201, CT - 5, 3, P.creamL) });
    /* ---- pemanggang roti krem dengan tuas koral ---- */
    obj(() => spr(161, CT - 11, [
      "..aaaaaaaaaaaa..",
      ".abddbbbbddbbbc.",
      "abbbbbbbbbbbbbcc",
      "abbbbbbbbbbbbbce",
      "abbffffffffbbbce",
      "abbbbbbbbbbbbbc.",
      "abbbbbbbbbbbbbc.",
      "abbbbbbbbbbbbcc.",
      ".bbbbbbbbbbbbc..",
      ".gg.........gg.."], { a: P.creamL, b: P.cream, c: P.creamS, d: P.metalD, e: P.coral, f: P.creamS, g: P.metal }));
    /* ---- mesin kopi espresso ---- */
    const MX = 228, MY = 62;
    obj(() => {
      box(MX, MY + 6, 26, CT - MY - 6, [P.metal, P.metalL, P.metalD]);
      R(MX - 1, MY + 4, 28, 3, P.cream); HL(MX - 1, MY + 4, 28, P.creamL); HL(MX - 1, MY + 6, 28, P.creamS);
      /* panel atas: layar teal + tombol */
      R(MX + 3, MY + 9, 10, 4, P.tealS); HL(MX + 4, MY + 10, 6, P.tealL); [MX + 16, MX + 19, MX + 22].forEach((x, i) => R(x, MY + 10, 2, 2, i ? P.creamL : P.coral));
      /* ceruk + kepala seduh + cangkir */
      R(MX + 3, MY + 15, 20, CT - MY - 19, P.metalD); HL(MX + 3, MY + 15, 20, P.inkD);
      R(MX + 9, MY + 15, 8, 3, P.metalL); HL(MX + 9, MY + 17, 8, P.metal); set(MX + 12, MY + 18, P.tan); set(MX + 13, MY + 18, P.tan); set(MX + 12, MY + 19, P.tan);
      spr(MX + 9, MY + 20, ["abbbbc..", "abbbbcd.", "abbbbc.d", ".bbbc.d.", "........"], { a: P.creamL, b: P.cream, c: P.creamS, d: P.creamS });
      R(MX + 4, CT - 4, 18, 2, P.metalL); HL(MX + 4, CT - 3, 18, P.metal);
      /* tuas uap */
      R(MX + 24, MY + 15, 3, 2, P.metalL); VL(MX + 25, MY + 17, 6, P.metalL);
    }, { ink: P.inkD });
    /* uap dari cangkir (tanpa tepi) */
    [[0, 0], [1, -1], [0, -2], [1, -3]].forEach(([dx, dy]) => g.set(MX + 12 + dx, MY + 19 + dy, P.creamL));
    /* toples biji kopi + gula */
    obj(() => { box(258, CT - 10, 7, 10, [P.creamL, P.board, P.creamS]); R(259, CT - 6, 5, 5, P.woodS); R(258, CT - 12, 7, 2, P.tan); HL(258, CT - 12, 7, P.tanL) });
    obj(() => { box(266, CT - 7, 6, 7, [P.creamL, P.board, P.creamS]); R(266, CT - 9, 6, 2, P.teal); HL(266, CT - 9, 6, P.tealL) });

    /* ================= KULKAS (kanan) ================= */
    const FX = 281, FT = 24, FB = 123, FW2 = 40;
    contact(FX - 1, FB, FW2 + 2);
    obj(() => {
      R(FX, FT, FW2, FB - FT, P.creamL); VL(FX, FT, FB - FT, P.board); VL(FX + 1, FT, FB - FT, P.board); HL(FX, FT, FW2, P.board);
      VL(FX + FW2 - 1, FT, FB - FT, P.creamS);
      /* sambungan freezer */
      HL(FX, FT + 30, FW2, P.creamS); HL(FX, FT + 31, FW2, P.cream);
      /* panel samping teduh (sisi kanan) */
      R(FX + 34, FT + 1, 6, FB - FT - 4, P.cream); VL(FX + 34, FT + 1, FB - FT - 4, P.creamS);
      /* gagang */
      R(FX + 4, FT + 18, 2, 10, P.metal); VL(FX + 4, FT + 18, 10, P.metalL);
      R(FX + 4, FT + 35, 2, 18, P.metal); VL(FX + 4, FT + 35, 18, P.metalL);
      /* kaki */
      R(FX + 1, FB - 3, FW2 - 2, 3, P.metal); HL(FX + 1, FB - 3, FW2 - 2, P.metalD);
    });
    /* magnet, foto, daftar belanja */
    obj(() => { R(FX + 12, FT + 8, 10, 12, P.paper); VL(FX + 21, FT + 8, 12, P.paperS); for (let i = 0; i < 4; i++) HL(FX + 14, FT + 11 + i * 2, i === 3 ? 4 : 6, P.boardF); set(FX + 16, FT + 7, P.coral); set(FX + 17, FT + 7, P.coralS) });
    obj(() => { R(FX + 10, FT + 40, 11, 9, P.paper); R(FX + 11, FT + 41, 9, 5, P.blueL); R(FX + 11, FT + 44, 9, 2, P.olL); set(FX + 17, FT + 42, P.creamL); set(FX + 15, FT + 39, P.teal) });
    obj(() => { R(FX + 23, FT + 46, 7, 7, P.yel); HL(FX + 23, FT + 46, 7, P.yelL); VL(FX + 29, FT + 47, 6, P.yelS); HL(FX + 24, FT + 49, 4, P.yelS) });
    [[FX + 25, FT + 58, P.teal], [FX + 14, FT + 62, P.coral], [FX + 22, FT + 66, P.blue]].forEach(([x, y, c]) => obj(() => { R(x, y, 3, 3, c); set(x, y, mix(c, "#ffffff", .4)) }));
    /* di atas kulkas: kotak + tanaman kecil */
    obj(() => { box(FX + 4, FT - 8, 14, 8, [P.tan, P.tanL, P.tanS]); HL(FX + 6, FT - 5, 10, P.tanS) });
    obj(() => {
      box(FX + 24, FT - 6, 8, 6, [P.coral, P.coralL, P.coralS]);
      spr(FX + 22, FT - 12, ["..a.ab..", ".abbabc.", "abbcbbcc", ".bc..cc."], { a: P.olL, b: P.ol, c: P.olS });
    });
  };

  SIMPX.bg("pantry", { w: W, h: H, floorY: 125, standX: 110, draw });
})();

/* ===== rapat ===== */
/* Latar "rapat" (320x150): ruang rapat kantor, siang hari. Satu dunia dengan kantor.js:
   - Teknik sama: tiap benda satu lapisan + garis tepi selektif otomatis (kiri/atas = tinta navy lembut, kanan/bawah = versi gelap bidang),
     tanpa dither, gradasi berupa pita datar, cahaya dari kiri atas, bayangan kontak 2 piksel.
   - Perspektif sama: sambungan dinding-lantai y 118, lantai papan ke titik hilang x 160, kaki tokoh di y 125.
   - Aksen ungu (lilac kalem): panel akustik di belakang TV, kursi rapat, karpet.
   - Isi: jendela + tanaman lidah mertua (kiri), TV presentasi dengan grafik naik, lampu linear, meja rapat panjang dengan kursi,
     whiteboard peta pikiran (kanan). Area hero (x 96-130) dibiarkan lega; NPC menutupi meja yang polos. */
(() => {
  const W = 320, H = 150, FLOOR = 118;
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const th = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return th(x.map((v, i) => v + (y[i] - v) * t)) };
  const dkc = (c, t = .4) => mix(mix(c, "#3a3470", t * .6), "#000000", t * .3);

  const P = {
    ink: "#5d5584", inkD: "#463f6c",
    wall: "#f3e5c8", wallL: "#f8eedb", wallS: "#eadab9", wallD: "#dcc6a3",
    trim: "#f7efde", trimL: "#fcf7ec", trimS: "#e2d3b8", wainS: "#dcc6a2",
    sky0: "#b9d1ea", sky1: "#c9dcef", sky2: "#d9e6f1", skyS: "#a9c2df", sun: "#fbf3df", cloud: "#f5f7f5", cloudS: "#e1eaf1",
    bld: "#c2cae3", bldW: "#d7ddee",
    frame: "#f1e6d1", frameL: "#faf4e8", frameS: "#d9c9ad",
    wood: "#d29d6c", woodG: "#c99262", woodS: "#b27c53", woodD: "#956547",
    lit: "#e8bd89", lit2: "#e0b17d", litS: "#c99262",
    coral: "#e3937c", coralL: "#efb29d", coralS: "#c2735f",
    blue: "#94b1d6", blueL: "#b9cde6", blueS: "#7491bb",
    cream: "#f2e5c9", creamL: "#fbf4e3", creamS: "#d8c6a4",
    tan: "#d3ae86", tanL: "#e3c6a3", tanS: "#b48c65",
    ol: "#a3a85d", olL: "#c1c47e", olS: "#7f8a4d", olD: "#5d6843",
    metal: "#665f8a", metalL: "#847ea8", metalD: "#4a436f",
    screen: "#bcd6ee", screenL: "#deebf6", screenS: "#9ebee0",
    board: "#fbfaf5", boardS: "#ebe7ea", boardF: "#cbc5d8", boardFD: "#a7a1bd", marker: "#7d77a6", markerL: "#aaa5c6",
    yel: "#f0d58c", yelL: "#f8e7b4", yelS: "#d3b46b",
    water: "#cfe2f2", waterL: "#e9f2fa", waterS: "#a9c6e2",
    /* ungu ruang rapat: lilac kalem, bayangan condong ke biru-navy */
    lil: "#b9abdf", lilL: "#d5cbef", lilS: "#958ac4", lilD: "#776ca9",
    pan: "#d3c8ea", panL: "#e1d9f1", panS: "#bdb0dc",
    rug: "#aa9dd2", rugL: "#bcb1de", rugS: "#9184c0"
  };
  const SHADOW = { [P.wood]: P.woodS, [P.woodG]: P.woodS, [P.woodS]: P.woodD, [P.lit]: P.litS, [P.lit2]: P.litS, [P.litS]: P.woodS, [P.rug]: P.rugS, [P.rugL]: P.rugS, [P.rugS]: P.lilD };

  const draw = g => {
    let cur = g;
    const set = (x, y, c) => cur.set(x, y, c), get = (x, y) => cur.get(x, y);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c) };
    const HL = (x, y, w, c) => R(x, y, w, 1, c), VL = (x, y, h, c) => R(x, y, 1, h, c);
    const line = (a, b, c, d, col) => cur.line(a, b, c, d, col);
    const spr = (x, y, rows, pal) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(x + i, y + j, pal[ch]) }));
    const remap = (x, y, map) => { const c = g.get(x, y); if (c && map[c]) g.set(x, y, map[c]) };
    const contact = (x, y, w, h = 2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) remap(x + i, y + j, SHADOW) };
    const obj = (fn, o = {}) => {
      const t = GLPIX.grid(W, H); cur = t; fn(); cur = g;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = t.g[y][x]; if (c) g.set(x, y, c) }
      if (o.ol === false) return;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (t.g[y][x]) continue;
        const l = t.get(x - 1, y), u = t.get(x, y - 1), r = t.get(x + 1, y), d = t.get(x, y + 1);
        if (l || u) g.set(x, y, o.ink || P.ink); else if (r || d) g.set(x, y, dkc(r || d));
      }
    };
    const box = (x, y, w, h, [c, l, s]) => { R(x, y, w, h, c); HL(x, y, w, l); VL(x, y, h, l); VL(x + w - 1, y, h, s); HL(x + 1, y + h - 1, w - 1, s) };

    /* ================= DINDING ================= */
    R(0, 0, W, FLOOR, P.wall);
    R(0, 0, W, 5, P.trim); HL(0, 5, W, P.trimS); HL(0, 6, W, P.wallD); HL(0, 7, W, P.wallS);
    R(0, 110, W, 8, P.trim); HL(0, 110, W, P.trimS); HL(0, 111, W, P.trimL); HL(0, 116, W, P.trimS); HL(0, 117, W, P.wainS);

    /* ================= LANTAI (sama dengan kantor) ================= */
    const VPX = 160, VPY = 30, FW = 15;
    const strip = (x, y) => Math.floor((VPX + (x - VPX) * (FLOOR - VPY) / (y - VPY) - VPX) / FW);
    for (let y = FLOOR; y < H; y++) for (let x = 0; x < W; x++) set(x, y, strip(x, y) & 1 ? P.woodG : P.wood);
    for (let k = -12; k <= 12; k++) { const x0 = VPX + k * FW, x1 = VPX + (x0 - VPX) * (H - 1 - VPY) / (FLOOR - VPY); line(x0, FLOOR, Math.round(x1), H - 1, P.woodS) }
    for (let y = FLOOR + 2; y < H; y++) for (let x = 0; x < W; x++) { const s = strip(x, y), jy = FLOOR + 6 + ((s * 13 + 91) % 23); if (y === jy && get(x, y) !== P.woodS) set(x, y, P.woodS) }
    HL(0, FLOOR, W, P.woodD); HL(0, FLOOR + 1, W, P.woodS);
    /* cahaya jendela kiri jatuh miring ke kanan, berhenti sebelum kaki hero */
    const LIT = { [P.wood]: P.lit, [P.woodG]: P.lit2, [P.woodS]: P.litS };
    for (let y = FLOOR + 4; y < H; y++) {
      const t = (y - FLOOR - 4) / (H - FLOOR - 5); if (t > .42 && t < .5) continue;
      [[12, 34, 22, 48], [40, 62, 56, 82]].forEach(([a0, a1, b0, b1]) => { for (let x = Math.round(a0 + (b0 - a0) * t); x <= Math.round(a1 + (b1 - a1) * t); x++) remap(x, y, LIT) });
    }

    /* ================= KARPET UNGU (di bawah meja rapat) ================= */
    const rugEdge = y => Math.round(VPX + (138 - VPX) * (y - VPY) / (FLOOR + 2 - VPY));
    obj(() => {
      for (let y = FLOOR + 2; y < 141; y++) { const x0 = rugEdge(y); HL(x0, y, W - x0, y === FLOOR + 2 ? P.rugL : y === 140 ? P.rugS : P.rug); set(x0, y, P.rugL); set(x0 + 1, y, P.rugL) }
      /* motif garis tipis sejajar tepi */
      for (let y = FLOOR + 5; y < 138; y++) { const x0 = rugEdge(y) + 5; set(x0, y, P.rugS) }
      HL(rugEdge(FLOOR + 5) + 5, FLOOR + 5, W, P.rugS); HL(rugEdge(137) + 5, 137, W, P.rugS);
    });

    /* ================= JENDELA + KERAI GULUNG (kiri) ================= */
    const WX = 6, WY = 10, WWd = 66, WH = 52, gx = WX + 4, gy = WY + 4, gw = WWd - 8, gh = WH - 8, MUL = WX + WWd / 2 - 2;
    R(WX - 3, WY + WH + 5, WWd + 9, 2, P.wallD);
    obj(() => {
      for (let y = gy; y < gy + gh; y++) HL(gx, y, gw, y < gy + 16 ? P.sky0 : y < gy + 28 ? P.sky1 : P.sky2);
      for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (x * x + y * y <= 10) set(gx + 44 + x, gy + 14 + y, P.sun);
      const cloud = (x, y, w) => { HL(x + 3, y, w - 7, P.cloud); R(x + 1, y + 1, w - 2, 1, P.cloud); R(x, y + 2, w, 1, P.cloud); HL(x + 1, y + 3, w - 2, P.cloudS) };
      cloud(gx + 4, gy + 14, 14);
      const sky = [[0, 32], [6, 27], [13, 34], [21, 24], [29, 30], [36, 22], [44, 29], [51, 33]];
      sky.forEach(([bx, by], i) => { const w = (sky[i + 1] ? sky[i + 1][0] : gw) - bx; R(gx + bx, gy + by, w, gh - by, P.bld) });
      [[23, 27], [23, 32], [38, 25], [40, 31], [8, 31], [31, 34], [46, 33]].forEach(([x, y]) => R(gx + x, gy + y, 2, 2, P.bldW));
      /* kerai gulung tergulung di atas: kain krem 6 baris */
      for (let y = gy; y < gy + 7; y++) HL(gx, y, gw, y === gy + 6 ? P.creamS : y < gy + 2 ? P.creamL : P.cream);
      R(gx + gw / 2 - 1, gy + 7, 3, 2, P.tan);
      const fb = (x, y, w, h) => R(x, y, w, h, P.frame);
      fb(WX, WY, WWd, 4); fb(WX, WY + WH - 4, WWd, 4); fb(WX, WY, 4, WH); fb(WX + WWd - 4, WY, 4, WH); fb(MUL, WY, 4, WH);
      HL(WX, WY, WWd, P.frameL); VL(WX, WY, WH, P.frameL); VL(MUL, WY + 4, WH - 8, P.frameL);
      [WX + WWd - 1, MUL + 3].forEach(x => VL(x, WY + 1, WH - 2, P.frameS)); HL(WX + 1, WY + WH - 1, WWd - 2, P.frameS);
      R(WX - 5, WY + WH, WWd + 10, 4, P.trim); HL(WX - 5, WY + WH, WWd + 10, P.trimL); HL(WX - 5, WY + WH + 3, WWd + 10, P.trimS);
    });

    /* ================= TANAMAN LIDAH MERTUA (bawah jendela) ================= */
    const PX = 38, PB = 125;
    contact(PX - 9, PB, 20);
    obj(() => {
      spr(PX - 12, PB - 52, [
        ".........a..............",
        "........ab..............",
        "........abc.......a.....",
        "...a....abc......ab.....",
        "...ab...abc......abc....",
        "...abc..abbc.....abc....",
        "...abc..abbc....aabc....",
        "....abc.abdc....abdc....",
        "....abc.abdc....abdc..a.",
        "....abdcabbc...aabbc.ab.",
        "....abdcabbc...abdbc.ab.",
        ".a..abbcabdc...abdbcabc.",
        ".ab.abbcabdc...abbbcabc.",
        ".abcabdcabbc..aabdbcabc.",
        ".abcabdcabbc..abbdcabbc.",
        "..abcabcabdc..abbdcabdc.",
        "..abcabcabdc.aabdbcabdc.",
        "..abdcabcabcaabbbcabdc..",
        "..abdcabcabcabbdbcabbc..",
        "...abcabcabcabbdbcabbc..",
        "...abcabcabcabdbcabdc...",
        "...abbcabcabcabdbcabc...",
        "...abbcabcabcabbbcabc...",
        "....abcabcabcabdbcabc...",
        "....abcabcabcabbcabc....",
        "....abcabbcabcabcabc....",
        ".....abcabcabcabcabc....",
        ".....abcabcabcabcbc.....",
        "......abcabcabcabc......",
        "......abcabcabcabc......",
        ".......abcabcabcc.......",
        ".......abcabcabcc......."], { a: P.olL, b: P.ol, c: P.olS, d: P.yelS });
      /* pot krem berpita ungu */
      for (let j = 0; j < 20; j++) { const hw = 8 - Math.floor(j / 8), y = PB - 20 + j; HL(PX - hw, y, hw * 2 + 1, P.cream); set(PX - hw, y, P.creamL); set(PX - hw + 1, y, P.creamL); set(PX + hw, y, P.creamS); set(PX + hw - 1, y, P.creamS) }
      R(PX - 9, PB - 22, 19, 3, P.cream); HL(PX - 9, PB - 22, 19, P.creamL); HL(PX - 9, PB - 20, 19, P.creamS);
      R(PX - 8, PB - 12, 17, 3, P.lil); HL(PX - 8, PB - 12, 17, P.lilL); HL(PX - 8, PB - 10, 17, P.lilS);
      HL(PX - 6, PB - 1, 13, P.creamS);
    });

    /* ================= PANEL AKUSTIK UNGU + TV ================= */
    const AX = 92, AW = 132, AY = 8, AB = 110;
    R(AX + AW, AY + 2, 2, AB - AY - 2, P.wallD);
    obj(() => {
      const cw = 22, ch = 17;
      for (let y = AY; y < AB; y++) for (let x = AX; x < AX + AW; x++) {
        const i = (x - AX) % cw, j = (y - AY) % ch;
        set(x, y, i === cw - 1 || j === ch - 1 ? P.panS : i === 0 || j === 0 ? P.panL : P.pan);
      }
      HL(AX, AY, AW, P.panL);
    });
    /* lampu linear di plafon */
    obj(() => { VL(186, 6, 6, P.metal); VL(286, 6, 6, P.metal); R(170, 12, 132, 2, P.metal); HL(170, 12, 132, P.metalL); HL(171, 14, 130, P.creamL) });
    const TX = 114, TY = 16, TW = 88, TH = 48;
    R(TX + 3, TY + TH, TW, 2, P.lilD); VL(TX + TW, TY + 3, TH, P.lilD); VL(TX + TW + 1, TY + 3, TH, P.panS);
    obj(() => {
      box(TX, TY, TW, TH, [P.metalD, P.metal, P.inkD]);
      const sx = TX + 3, sy = TY + 3, sw = TW - 6, sh = TH - 7;
      R(sx, sy, sw, sh, P.board); HL(sx, sy, sw, P.boardS);
      /* bilah judul ungu + teks */
      R(sx, sy, sw, 7, P.lil); HL(sx, sy, sw, P.lilL); HL(sx, sy + 6, sw, P.lilS);
      cur.text(sx + 3, sy + 1, "TARGET Q3", P.board);
      R(sx + sw - 9, sy + 2, 6, 3, P.creamL);
      /* sumbu */
      VL(sx + 6, sy + 10, sh - 14, P.boardFD); HL(sx + 6, sy + sh - 4, sw - 34, P.boardFD);
      for (let k = 0; k < 4; k++) HL(sx + 7, sy + 12 + k * 6, sw - 35, P.boardS);
      /* batang naik: ungu muda ke ungu tua, batang terakhir koral */
      [[0, 5, P.lilL, P.lil], [1, 9, P.lilL, P.lil], [2, 13, P.lil, P.lilS], [3, 18, P.lil, P.lilS], [4, 24, P.coralL, P.coral]].forEach(([i, h, l, c]) => {
        const x = sx + 10 + i * 8; R(x, sy + sh - 4 - h, 5, h, c); VL(x, sy + sh - 4 - h, h, l); HL(x, sy + sh - 4 - h, 5, l);
      });
      /* garis tren + panah naik */
      const pts = [[sx + 12, sy + sh - 12], [sx + 20, sy + sh - 16], [sx + 28, sy + sh - 19], [sx + 36, sy + sh - 25], [sx + 45, sy + sh - 32]];
      for (let i = 0; i < pts.length - 1; i++) line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], P.coralS);
      spr(sx + 43, sy + sh - 35, ["aaaa", "..aa", ".a.a", "a..."], { a: P.coralS });
      /* kartu angka di kanan */
      box(sx + sw - 26, sy + 10, 23, 13, [P.lilL, P.board, P.lil]); cur.text(sx + sw - 23, sy + 14, "+48", P.lilD);
      spr(sx + sw - 9, sy + 13, ["..a", ".aa", "aaa"], { a: P.ol });
      box(sx + sw - 26, sy + 25, 23, 9, [P.boardS, P.board, P.boardF]); HL(sx + sw - 23, sy + 28, 14, P.boardF); HL(sx + sw - 23, sy + 30, 10, P.boardF);
      /* kaki TV: lampu siaga */
      set(TX + TW - 6, TY + TH - 2, P.ol);
    }, { ink: P.inkD });

    /* ================= WHITEBOARD PETA PIKIRAN (kanan) ================= */
    const BX = 238, BY = 22, BW = 76, BH = 44;
    R(BX + 2, BY + BH + 3, BW, 2, P.wallD); R(BX + BW, BY + 3, 2, BH, P.wallD);
    obj(() => {
      R(BX, BY, BW, BH, P.boardF); HL(BX, BY, BW, P.boardS); VL(BX, BY, BH, P.boardS); HL(BX, BY + BH - 1, BW, P.boardFD); VL(BX + BW - 1, BY, BH, P.boardFD);
      R(BX + 2, BY + 2, BW - 4, BH - 4, P.board); HL(BX + 2, BY + 2, BW - 4, P.boardS); VL(BX + 2, BY + 2, BH - 4, P.boardS);
      R(BX + 4, BY + BH, BW - 8, 2, P.boardF); HL(BX + 4, BY + BH + 1, BW - 8, P.boardFD);
      R(BX + 10, BY + BH - 1, 6, 1, P.lilS); R(BX + 18, BY + BH - 1, 6, 1, P.coralS); R(BX + 52, BY + BH - 2, 8, 2, P.metalL);
    });
    /* coretan: elips pusat + cabang ke kotak, di atas papan tanpa tepi */
    const cx = BX + 38, cy = BY + 21;
    for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2; g.set(Math.round(cx + Math.cos(t) * 10), Math.round(cy + Math.sin(t) * 5), P.lilS) }
    g.text(cx - 5, cy - 2, "IDE", P.lilD);
    [[BX + 10, BY + 8, cx - 9, cy - 2], [BX + 10, BY + 32, cx - 9, cy + 3], [BX + 62, BY + 8, cx + 9, cy - 2], [BX + 62, BY + 32, cx + 9, cy + 3]].forEach(([x, y, ex, ey], i) => {
      g.line(x + (i < 2 ? 8 : -1), y + 2, ex, ey, P.markerL);
      for (let k = 0; k < 9; k++) { g.set(x - 1 + k, y - 1, P.marker); g.set(x - 1 + k, y + 5, P.marker) } for (let k = 0; k < 7; k++) { g.set(x - 1, y - 1 + k, P.marker); g.set(x + 7, y - 1 + k, P.marker) }
      g.line(x + 1, y + 2, x + 5, y + 2, i % 2 ? P.coral : P.blueS);
    });
    const note = (x, y, c, l, s) => { for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) g.set(x + i, y + j, j === 0 ? l : i === 8 || j === 8 ? s : c); for (let i = 2; i < 7; i++) g.set(x + i, y + 3, s); for (let i = 2; i < 6; i++) g.set(x + i, y + 5, s) };
    note(BX + 22, BY + 30, P.yel, P.yelL, P.yelS); note(BX + 46, BY + 30, P.lilL, P.creamL, P.lil);

    /* ================= MEJA RAPAT + KURSI ================= */
    const MX = 150, MT = 92, MF = 122;
    /* sandaran kursi di balik meja */
    const chair = x => obj(() => spr(x, 70, [
      "..aaaaaaaaaaaaaa..",
      ".aabbbbbbbbbbbbbc.",
      "aabbbbbbbbbbbbbbcc",
      "abbbbbbbbbbbbbbbcc",
      "abbbbbbbbbbbbbbbcc",
      "abbdbbbbbbbbbbdbcc",
      "abbdbbbbbbbbbbdbcc",
      "abbdbbbbbbbbbbdbcc",
      "abbdbbbbbbbbbbdbcc",
      "abbdbbbbbbbbbbdbcc",
      "abbdbbbbbbbbbbdbcc",
      "abbbbbbbbbbbbbbbcc",
      "abbbbbbbbbbbbbbbcc",
      ".bbbbbbbbbbbbbbcc.",
      "..cccccccccccccc..",
      "......eeeeee......",
      "......eeeeee......",
      "......eeeeee......",
      "......eeeeee......",
      "......eeeeee......",
      "......eeeeee......",
      "......eeeeee......"], { a: P.lilL, b: P.lil, c: P.lilS, d: P.lilS, e: P.metal }));
    [166, 204, 242, 280].forEach(chair);
    /* gelap di bawah meja */
    for (let y = MT + 5; y < MF; y++) for (let x = MX; x < W; x++) { const c = g.get(x, y); if (c) g.set(x, y, SHADOW[c] || dkc(c, y < MT + 8 ? .3 : .2)) }
    contact(MX - 1, MF, W - MX + 1);
    obj(() => {
      /* dudukan kursi & kaki bintang terlihat di bawah meja */
      [175, 213, 251, 289].forEach(x => { R(x - 1, MT + 5, 3, 13, P.metalD); R(x - 7, MF - 3, 15, 2, P.metalD); set(x - 7, MF - 1, P.inkD); set(x + 7, MF - 1, P.inkD); set(x, MF - 1, P.inkD) });
    }, { ol: false });
    obj(() => {
      /* kaki meja: panel ujung kayu + kaki logam tengah */
      R(MX + 2, MT + 5, 4, MF - MT - 5, P.woodS); VL(MX + 2, MT + 5, MF - MT - 5, P.wood);
      [232].forEach(x => { R(x, MT + 5, 3, MF - MT - 5, P.metal); VL(x, MT + 5, MF - MT - 5, P.metalL); R(x - 3, MF - 2, 9, 2, P.metalD) });
      /* daun meja kayu */
      HL(MX, MT - 2, W - MX, P.tanL); HL(MX, MT - 1, W - MX, P.lit); HL(MX, MT, W - MX, P.lit2);
      R(MX, MT + 1, W - MX, 3, P.wood); HL(MX, MT + 1, W - MX, P.tanL); HL(MX, MT + 4, W - MX, P.woodS);
    });
    /* pantulan lampu linear di permukaan meja */
    for (let x = 176; x < 296; x++) g.set(x, MT - 1, x % 30 < 22 ? P.creamL : P.lit);

    /* ---- barang di meja ---- */
    /* laptop terbuka (punggung tutup, menghadap kursi) */
    obj(() => { box(256, MT - 15, 22, 13, [P.metalL, P.boardF, P.metal]); set(266, MT - 9, P.lilL); set(267, MT - 9, P.lilL); R(254, MT - 2, 26, 2, P.metal); HL(254, MT - 2, 26, P.metalL) }, { ink: P.inkD });
    /* buku catatan + pena */
    obj(() => { R(162, MT - 3, 16, 3, P.coral); HL(162, MT - 3, 16, P.coralL); HL(163, MT - 2, 14, P.paper); line(166, MT - 5, 175, MT - 6, P.metalD) });
    /* teko air & gelas */
    obj(() => spr(222, MT - 15, [
      "..aaaaa..",
      ".abbbbbc.",
      ".abbbbbcdd",
      "abbbbbbcc.d",
      "abeebbbcc.d",
      "abeebbbbc.d",
      "abbbbbbbcdd",
      "abbbbbbbc.",
      "abffffffc.",
      "abffffffc.",
      "abffffffc.",
      "abffffffc.",
      ".bffffffc.",
      ".cccccccc.",
      ".........."], { a: P.waterL, b: P.water, c: P.waterS, d: P.waterS, e: P.board, f: P.screen }));
    obj(() => { [[236, 0], [243, 1]].forEach(([x]) => { R(x, MT - 6, 5, 6, P.water); VL(x, MT - 6, 6, P.waterL); VL(x + 4, MT - 6, 6, P.waterS); R(x + 1, MT - 3, 3, 2, P.screen) }) });
    /* mug ungu + map */
    obj(() => { box(292, MT - 7, 6, 7, [P.lil, P.lilL, P.lilS]); spr(298, MT - 6, ["aa", ".a", "aa"], { a: P.lilS }) });
    obj(() => { R(302, MT - 2, 18, 2, P.blue); HL(302, MT - 2, 18, P.blueL); R(304, MT - 4, 14, 2, P.creamL); HL(304, MT - 3, 14, P.creamS) });
    /* tanaman kecil di tengah meja */
    obj(() => {
      box(196, MT - 6, 9, 6, [P.cream, P.creamL, P.creamS]); HL(195, MT - 7, 11, P.creamL);
      spr(194, MT - 13, ["..a.ab..", ".abbabc.", "abbcbbcc", ".bc..cc.", "..bccc.."], { a: P.olL, b: P.ol, c: P.olS });
    });
  };

  SIMPX.bg("rapat", { w: W, h: H, floorY: 125, standX: 110, draw });
})();
