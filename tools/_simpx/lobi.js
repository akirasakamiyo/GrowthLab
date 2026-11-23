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
