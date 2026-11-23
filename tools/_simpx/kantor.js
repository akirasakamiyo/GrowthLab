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
