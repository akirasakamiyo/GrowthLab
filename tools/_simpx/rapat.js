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
