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
