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
