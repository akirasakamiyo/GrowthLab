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
