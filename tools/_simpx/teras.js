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
