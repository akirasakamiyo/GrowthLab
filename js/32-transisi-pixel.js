/* Transisi halaman "gelombang pixel" (2026-11-14), menggantikan tirai warna-warni (#curtain, js/21-transisi.js).
   1. Tutup  : dari titik yang diklik, kotak pixel muncul menyebar seperti gelombang. Tepi gelombangnya kuning,
               lalu tiap kotak mengendap jadi mozaik navy-biru (palet sidebar LMS).
   2. Tengah : halaman baru dirender di balik mozaik; nama halaman tujuan muncul besar (Anton, kuning) dengan huruf acak
               yang mengunci satu per satu, plus bar 12 kotak yang terisi.
   3. Buka   : mozaik pecah dari titik klik ke tepi. Tiap kotak berkilat kuning lalu mengecil jadi remah biru dan hilang.
   Dipanggil dari handler hashchange di js/09-app.js lewat GLTR.go(rute). prefers-reduced-motion: handler tidak memanggil ini. */
window.GLTR = (() => {
  const NAVY = ["#11184a", "#141d58", "#0b1038", "#16206a"], BLUE = "#2b55ff", BLUE2 = "#4d74ff", SUN = "#ffc83d", SUN2 = "#ffd23f", CREAM = "#fff3d6";
  const T_IN = 470, T_HOLD = 300, T_OUT = 560;
  const cv = document.createElement("canvas");
  cv.className = "gltr"; cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;z-index:9990;pointer-events:none;display:none";
  const cx = cv.getContext("2d");
  const sr = document.createElement("div");
  sr.setAttribute("role", "status"); sr.setAttribute("aria-live", "polite");
  sr.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";
  const add = () => { if (!cv.isConnected) document.body.append(cv, sr) };
  if (document.body) add(); else document.addEventListener("DOMContentLoaded", add);

  /* titik asal gelombang = posisi klik/ketuk terakhir (kalau navigasi lewat keyboard atau tombol Back: tengah layar) */
  let px = null, pt = 0;
  addEventListener("pointerdown", e => { px = [e.clientX, e.clientY]; pt = performance.now() }, true);

  const cl = u => u < 0 ? 0 : u > 1 ? 1 : u;
  const back = u => { u = cl(u); return 1 + 2.4 * (u - 1) ** 3 + 1.4 * (u - 1) ** 2 };
  const ein = u => { u = cl(u); return u * u * u };
  const hash = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296 };

  /* nama halaman tujuan untuk label tengah */
  const label = hsh => {
    const h = (hsh || "#/").replace(/^#/, ""), [, v = "", a = ""] = h.split("/");
    try {
      const C = typeof GLD !== "undefined" && GLD.COURSE;   /* GLD dideklarasikan const di 03-data.js, jadi tidak ada di window */
      if (v === "lesson" && C) {
        /* sama dengan route(): angka tidak valid jadi 0; pelajaran terkunci dialihkan ke pelajaran berikutnya yang terbuka */
        let [i, j] = a.split("-").map(Number); i = i || 0; j = j || 0;
        if (!(C.chapters[i] && C.chapters[i].l[j])) return ["Menuju", "Materi"];
        if (window.GLK && GLK.locked(i, j)) { const m = /lesson\/(\d+)-(\d+)/.exec(GLK.nextHref() || ""); if (m) { i = +m[1]; j = +m[2] } }
        const l = C.chapters[i] && C.chapters[i].l[j]; if (l) return [`Pelajaran ${i + 1}.${j + 1}`, l.t];
      }
      if (v === "course" && a && C && C.chapters[+a - 1]) return [`Bab ${a}`, C.chapters[+a - 1].t];
    } catch (_) {}
    const sb = document.querySelector(`.sbn-nav a[data-sk][href="#/${v}"]`);
    const N = { "": "Beranda", course: "Materi", "e-learning": "Katalog", latihan: "Latihan", komunitas: "Belajar bareng", tentang: "Tentang", referensi: "Referensi" };
    return ["Menuju", N[v] || (sb && sb.dataset.tip) || "GrowthLab"];
  };

  let st = null;
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight;
    cv.width = Math.round(w * d); cv.height = Math.round(h * d); cx.setTransform(d, 0, 0, d, 0, 0);
    const s = Math.round(Math.max(30, Math.min(60, w / 24)));
    return { w, h, s, cols: Math.ceil(w / s), rows: Math.ceil(h / s) };
  };

  const GL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=?";
  const drawLabel = (g, a, lock, fill) => {
    if (a <= 0) return;
    const [cap, name] = g.lab, W = g.w, H = g.h;
    let fs = Math.min(W * .095, 118);
    cx.font = `400 ${fs}px Anton, Impact, "Arial Narrow", sans-serif`;
    const up = name.toUpperCase(), mw = cx.measureText(up).width;
    if (mw > W * .86) { fs *= W * .86 / mw; cx.font = `400 ${fs}px Anton, Impact, "Arial Narrow", sans-serif` }
    /* huruf acak yang mengunci dari kiri ke kanan */
    let txt = ""; for (let i = 0; i < up.length; i++) { const c = up[i]; txt += c === " " || i / up.length < lock ? c : GL[(Math.random() * GL.length) | 0] }
    cx.save(); cx.globalAlpha = a; cx.textAlign = "center"; cx.textBaseline = "middle";
    const y = H / 2;
    cx.fillStyle = BLUE; cx.fillText(txt, W / 2 + fs * .05, y + fs * .05);           /* bayangan pixel biru */
    cx.fillStyle = SUN2; cx.fillText(txt, W / 2, y);
    cx.font = `700 ${Math.max(11, fs * .13)}px "Space Mono", ui-monospace, monospace`;
    cx.fillStyle = CREAM; cx.globalAlpha = a * .8;
    cx.fillText(cap.toUpperCase().split("").join(" "), W / 2, y - fs * .78);
    /* bar 12 kotak */
    const n = 12, b = Math.max(8, Math.round(fs * .1)), gap = Math.round(b * .35), bw = n * b + (n - 1) * gap, x0 = W / 2 - bw / 2, yb = y + fs * .7;
    for (let i = 0; i < n; i++) { cx.globalAlpha = a * (i < fill * n ? 1 : .22); cx.fillStyle = i < fill * n ? SUN : CREAM; cx.fillRect(Math.round(x0 + i * (b + gap)), Math.round(yb), b, b) }
    cx.restore();
  };

  /* jalankan rute di balik mozaik; waktu render tidak memotong fase tengah. Fokus dipindah ke judul halaman baru
     dan namanya diumumkan lewat wilayah status tersembunyi (sr), karena canvas ini aria-hidden. */
  const route = g => {
    g.routed = true; const t = performance.now();
    try { g.fn() } catch (e) { console.error(e) }
    g.t0 += performance.now() - t;
    try {
      setTimeout(() => {
        const v = [...document.querySelectorAll("[data-v]:not([hidden]) h1")].find(h => h.offsetParent);
        if (v && (!document.activeElement || document.activeElement === document.body || !document.activeElement.offsetParent)) { if (!v.hasAttribute("tabindex")) v.setAttribute("tabindex", "-1"); v.focus({ preventScroll: true }) }
      }, 80);
      sr.textContent = ""; setTimeout(() => { sr.textContent = "Halaman " + g.lab[1] }, 60);
    } catch (_) {}
  };
  const stop = () => { const g = st; st = null; if (g && !g.routed) route(g); cx.clearRect(0, 0, cv.width, cv.height); cv.style.display = "none"; cv.style.pointerEvents = "none" };
  const frame = now => {
    const g = st; if (!g) return;
    const t = now - g.t0, { s, cols, rows } = g;
    cx.clearRect(0, 0, g.w, g.h);
    let phase, p;
    if (t < T_IN) { phase = 0; p = t / T_IN }
    else if (t < T_IN + T_HOLD) { phase = 1; p = (t - T_IN) / T_HOLD }
    else { phase = 2; p = (t - T_IN - T_HOLD) / T_OUT }
    if (phase >= 1 && !g.routed) { route(g); requestAnimationFrame(frame); return }
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x, d = g.d[i], r = g.r[i];
      let lt, sz, col;
      if (phase === 0) {
        lt = cl((p * 1.55 - d) / .55); if (lt <= 0) continue;
        sz = back(lt); col = lt < .42 ? (r < .5 ? SUN : SUN2) : g.c[i];
      } else if (phase === 1) { sz = 1; col = g.c[i] }
      else {
        lt = cl((p * 1.5 - d) / .5); if (lt >= 1) continue;
        if (lt <= 0) { sz = 1; col = g.c[i] }
        else if (lt < .22) { sz = 1; col = r < .45 ? SUN : r < .55 ? CREAM : BLUE2 }
        else { sz = 1 - ein((lt - .22) / .78); col = r < .2 ? SUN : r < .6 ? BLUE2 : BLUE }
      }
      const q = Math.min(sz, 1.12) * s, ox = x * s + (s - q) / 2, oy = y * s + (s - q) / 2;
      cx.fillStyle = col; cx.fillRect(Math.round(ox), Math.round(oy), Math.ceil(q) + 1, Math.ceil(q) + 1);
    }
    /* label: masuk di ujung fase tutup, bertahan di tengah, memudar di awal fase buka */
    const la = phase === 0 ? cl((p - .6) / .4) : phase === 1 ? 1 : 1 - cl(p / .28);
    const lock = phase === 0 ? 0 : phase === 1 ? cl(p * 1.6) : 1;
    const fill = phase === 0 ? 0 : phase === 1 ? p : 1;
    drawLabel(g, la, lock, fill);
    if (phase === 2 && p >= 1) { stop(); return }
    requestAnimationFrame(frame);
  };

  const go = (fn, hsh) => {
    add();
    if (document.hidden) { if (st) stop(); fn(); return }   /* tab tersembunyi: rAF berhenti, jadi langsung pindah */
    if (st) {                                   /* pindah lagi saat transisi masih jalan */
      if (!st.routed) { st.fn = fn; st.lab = label(hsh); return }
      stop();                                   /* sedang membuka: tutup ulang dari awal untuk tujuan baru */
    }
    cv.style.display = "block";
    const g = size(), now = performance.now();
    const [ox, oy] = px && now - pt < 1500 ? px : [g.w / 2, g.h / 2];
    const n = g.cols * g.rows, seed = (Math.random() * 1e6) | 0;
    g.d = new Float32Array(n); g.r = new Float32Array(n); g.c = new Array(n);
    const far = Math.max(Math.hypot(ox, oy), Math.hypot(g.w - ox, oy), Math.hypot(ox, g.h - oy), Math.hypot(g.w - ox, g.h - oy));
    for (let y = 0; y < g.rows; y++) for (let x = 0; x < g.cols; x++) {
      const i = y * g.cols + x, r = hash(x, y, seed);
      g.d[i] = Math.min(1, Math.hypot((x + .5) * g.s - ox, (y + .5) * g.s - oy) / far + (r - .5) * .12);
      g.r[i] = hash(y, x, seed + 7);
      g.c[i] = r < .07 ? BLUE : r < .085 ? SUN : NAVY[(r * 97 | 0) % NAVY.length];
    }
    g.fn = fn; g.lab = label(hsh); g.t0 = now; g.routed = false;
    st = g; cv.style.display = "block"; cv.style.pointerEvents = "auto";
    setTimeout(() => { if (st === g && !g.routed) route(g) }, T_IN + 120);   /* pengaman bila rAF tertahan */
    requestAnimationFrame(frame);
  };
  /* ukuran layar berubah di tengah transisi (HP diputar, jendela dibesarkan): grid lama tidak lagi menutup layar, jadi selesaikan saja */
  addEventListener("resize", () => { if (st) stop() });
  return { go, label };
})();
