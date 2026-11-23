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
