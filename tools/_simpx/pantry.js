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
