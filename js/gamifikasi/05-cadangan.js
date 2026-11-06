/* ==================================================================
   GAMIFIKASI · Fase 4: cadangan progres (ekspor/impor JSON) & sertifikat
   - Bagian ini SELALU tampil di panel (juga saat mode gamifikasi nonaktif),
     karena cadangan progres berguna untuk semua pengguna.
   - Semua lewat GLG.storage, jadi tetap jalan bila penyimpanan diganti ke backend.
   ================================================================== */
(() => {
  const G = window.GLG, C = G.CFG;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  /* semua key progres GrowthLab yang ikut dicadangkan */
  const KEYS = ["mer-done", "gl-latihan", "gl-ui", "gl-badge", "gl-ord", "gl-gami", "gl-log"];
  const FORMAT = "growthlab-progres";

  /* ---------- unduh file tanpa server (Blob + <a download>) ---------- */
  function download(name, blob) {
    const a = document.createElement("a"), u = URL.createObjectURL(blob);
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  }
  const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` };

  /* ---------- ekspor / impor ---------- */
  G.exportData = () => {
    const data = {};
    KEYS.forEach(k => { const v = G.storage.get(k); if (v != null) data[k] = v });
    return { format: FORMAT, version: 1, exported: new Date().toISOString(), schemaVersion: C.schemaVersion, data };
  };
  G.exportFile = () => download(`growthlab-progres-${stamp()}.json`, new Blob([JSON.stringify(G.exportData(), null, 2)], { type: "application/json" }));
  /* validasi ketat: hanya key yang dikenal, tipe yang wajar; data gl-gami dimigrasikan saat dimuat ulang */
  G.parseImport = txt => {
    let o; try { o = JSON.parse(txt) } catch (e) { throw new Error("File bukan JSON yang valid.") }
    if (!o || o.format !== FORMAT || typeof o.data !== "object") throw new Error("File ini bukan cadangan progres GrowthLab.");
    const d = {};
    for (const k of KEYS) if (k in o.data) d[k] = o.data[k];
    if (d["mer-done"] && !Array.isArray(d["mer-done"])) throw new Error("Data pelajaran rusak.");
    if (d["gl-gami"] && !Array.isArray(d["gl-gami"].ledger)) throw new Error("Data gamifikasi rusak.");
    if (d["gl-latihan"] && typeof d["gl-latihan"] !== "object") throw new Error("Data latihan rusak.");
    if (!Object.keys(d).length) throw new Error("File cadangan kosong.");
    return d;
  };
  G.importData = d => { KEYS.forEach(k => { if (k in d) G.storage.set(k, d[k]) }); };

  /* ---------- sertifikat (PNG dari canvas, tanpa pustaka) ---------- */
  const allDone = () => { const s = new Set(G.storage.get("mer-done") || []); return GLD.COURSE.chapters.every((ch, i) => ch.l.every((_, j) => s.has(i + "-" + j))) };
  const nameOf = () => { const u = G.storage.get("gl-ui") || {}; return (u.nama || "").trim() };
  /* sertifikat bergaya formal (revisi 2026-11-06): bingkai guilloche, serif klasik, nama huruf sambung,
     segel emas berpita, dua tanda tangan pengembang. Font serif & script diambil dari font bawaan perangkat. */
  G.certificate = name => {
    const W = 2400, H = 1697, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const x = cv.getContext("2d"), I = G.info(), H2 = typeof GLX !== "undefined" ? GLX.hitung() : {};
    const SERIF = '"Bodoni 72","Didot","Baskerville","Libre Baskerville","Georgia","Times New Roman",serif';
    const SCRIPT = '"Snell Roundhand","Apple Chancery","Segoe Script","Brush Script MT","Lucida Handwriting",cursive';
    const SANS = "'DM Sans',Inter,Arial,sans-serif";
    const NAVY = "#14224d", GOLD = "#b8912f", GOLD2 = "#e3c06a", INK = "#2a2f45";
    const font = (st, w, sz, f) => { x.font = `${st} ${w} ${sz}px ${f}` };
    /* teks berjarak huruf, rata tengah (canvas letterSpacing belum merata di semua browser) */
    const spaced = (t, cx, y, sp) => { const ws = [...t].map(c => x.measureText(c).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (t.length - 1); let px = cx - tw / 2; x.textAlign = "left"; [...t].forEach((c, k) => { x.fillText(c, px, y); px += ws[k] + sp }); x.textAlign = "center" };
    const fit = (t, max, st, w, sz, f) => { font(st, w, sz, f); while (x.measureText(t).width > max && sz > 20) { sz -= 4; font(st, w, sz, f) } return sz };
    const wrap = (t, cx, y, max, lh) => { const out = []; let ln = ""; t.split(" ").forEach(w => { const tst = ln ? ln + " " + w : w; if (x.measureText(tst).width > max && ln) { out.push(ln); ln = w } else ln = tst }); out.push(ln); out.forEach((l, k) => x.fillText(l, cx, y + k * lh)); return out.length };

    /* kertas */
    const bg = x.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, W * .7); bg.addColorStop(0, "#fffdf6"); bg.addColorStop(1, "#f3ead2");
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    /* pola guilloche untuk pita bingkai */
    const tile = document.createElement("canvas"); tile.width = 72; tile.height = 72; const t = tile.getContext("2d");
    t.fillStyle = NAVY; t.fillRect(0, 0, 72, 72); t.strokeStyle = "rgba(227,192,106,.55)"; t.lineWidth = 1.2;
    for (let k = 0; k < 6; k++) { t.beginPath(); for (let px = 0; px <= 72; px += 2) { const py = 36 + Math.sin(px / 72 * Math.PI * 2 + k * Math.PI / 3) * 26; px ? t.lineTo(px, py) : t.moveTo(px, py) } t.stroke() }
    for (let k = 0; k < 6; k++) { t.beginPath(); for (let py = 0; py <= 72; py += 2) { const px = 36 + Math.sin(py / 72 * Math.PI * 2 + k * Math.PI / 3) * 26; py ? t.lineTo(px, py) : t.moveTo(px, py) } t.stroke() }
    const O = 46, B = 64;
    x.fillStyle = x.createPattern(tile, "repeat");
    x.beginPath(); x.rect(O, O, W - 2 * O, H - 2 * O); x.rect(O + B, O + B, W - 2 * (O + B), H - 2 * (O + B)); x.fill("evenodd");
    const line = (o, w, c) => { x.strokeStyle = c; x.lineWidth = w; x.strokeRect(o, o, W - 2 * o, H - 2 * o) };
    line(O, 6, GOLD); line(O + B, 6, GOLD); line(O + B + 18, 2, GOLD); line(O + B + 26, 1, GOLD2);
    /* roset di sudut */
    const roset = (cx, cy, r) => { x.save(); x.translate(cx, cy); x.strokeStyle = GOLD; x.lineWidth = 2;
      for (let k = 0; k < 12; k++) { x.rotate(Math.PI / 6); x.beginPath(); x.ellipse(r * .5, 0, r * .5, r * .18, 0, 0, Math.PI * 2); x.stroke() }
      x.fillStyle = GOLD; x.beginPath(); x.arc(0, 0, r * .16, 0, Math.PI * 2); x.fill(); x.restore() };
    const ci = O + B + 70;[[ci, ci], [W - ci, ci], [ci, H - ci], [W - ci, H - ci]].forEach(([a, b]) => roset(a, b, 46));

    /* kepala */
    x.textAlign = "center"; x.fillStyle = GOLD; font("", 700, 26, SANS); spaced("GROWTHLAB  ·  SELF DEVELOPMENT FOR JOB SEEKER", W / 2, 268, 7);
    x.fillStyle = NAVY; font("", 400, 150, SERIF); spaced("SERTIFIKAT", W / 2, 432, 26);
    x.fillStyle = GOLD; font("", 400, 46, SERIF); spaced("PENYELESAIAN PROGRAM", W / 2, 510, 14);
    /* hiasan pemisah */
    const orn = (cx, cy, w) => { x.strokeStyle = GOLD; x.lineWidth = 2.5; x.beginPath(); x.moveTo(cx - w, cy); x.lineTo(cx - 26, cy); x.moveTo(cx + 26, cy); x.lineTo(cx + w, cy); x.stroke();
      x.fillStyle = GOLD; x.beginPath(); x.moveTo(cx, cy - 14); x.lineTo(cx + 18, cy); x.lineTo(cx, cy + 14); x.lineTo(cx - 18, cy); x.closePath(); x.fill();
      [-1, 1].forEach(s => { x.beginPath(); x.arc(cx + s * (w + 10), cy, 5, 0, Math.PI * 2); x.fill() }) };
    orn(W / 2, 560, 300);
    x.fillStyle = "#5b6077"; font("italic", 400, 42, SERIF); x.fillText("Dengan bangga diberikan kepada", W / 2, 650);
    /* nama */
    const nm = name || "Peserta GrowthLab";
    x.fillStyle = NAVY; fit(nm, W - 900, "", 400, 150, SCRIPT); x.fillText(nm, W / 2, 800);
    const nw = Math.max(620, x.measureText(nm).width / 2 + 60); x.strokeStyle = GOLD; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2 - nw, 838); x.lineTo(W / 2 + nw, 838); x.stroke();
    /* isi */
    const nb = GLD.COURSE.chapters.length, nl = GLD.COURSE.chapters.reduce((n, c) => n + c.l.length, 0), K = H2 && H2.ki != null ? GLD.KATEGORI[H2.ki][0] : null;
    const ak = H2 && H2.akhir != null ? String(Math.round(H2.akhir * 10) / 10).replace(".", ",") : null;
    x.fillStyle = INK; font("italic", 400, 38, SERIF);
    wrap(`atas keberhasilannya menyelesaikan program pembelajaran mandiri Self Development for Job Seeker yang meliputi ${nb} bab dan ${nl} pelajaran soft skill: ${GLD.COURSE.chapters.map(c => c.t).join(", ").replace(/, ([^,]*)$/, ", dan $1")}${K && ak ? `, dengan predikat “${K}” dan nilai akhir ${ak}` : ""}.`, W / 2, 920, 1500, 56);
    x.fillStyle = GOLD; font("", 700, 24, SANS);
    spaced(`LEVEL ${I.level} · ${I.tier.toUpperCase()}     ✦     ${I.xp.toLocaleString("id-ID")} XP     ✦     ${G.badgeList().filter(b => b.got).length} DARI ${C.badges.length} BADGE`, W / 2, 1102, 4);

    /* segel emas berpita */
    x.save(); x.translate(W / 2, 1272); x.scale(.82, .82); const sx = 0, sy = 0;
    [[-1, "#1f3a7a"], [1, "#a8321f"]].forEach(([s, col]) => { x.fillStyle = col; x.beginPath(); x.moveTo(sx + s * 20, sy + 40); x.lineTo(sx + s * 110, sy + 210); x.lineTo(sx + s * 72, sy + 186); x.lineTo(sx + s * 50, sy + 232); x.lineTo(sx + s * -30, sy + 70); x.closePath(); x.fill() });
    const sg = x.createRadialGradient(sx - 40, sy - 40, 10, sx, sy, 150); sg.addColorStop(0, "#fbe7a6"); sg.addColorStop(.55, "#d9b14f"); sg.addColorStop(1, "#9c7420");
    x.fillStyle = sg; x.beginPath(); for (let k = 0; k < 72; k++) { const a = k / 72 * Math.PI * 2, r = k % 2 ? 128 : 142; x.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r) } x.closePath(); x.fill();
    x.strokeStyle = "#8a6518"; x.lineWidth = 2; x.beginPath(); x.arc(sx, sy, 112, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.arc(sx, sy, 78, 0, Math.PI * 2); x.stroke();
    /* tulisan melingkar */
    x.fillStyle = "#5a3f08"; font("", 700, 19, SANS);
    const ring = "GROWTHLAB  ✦  SELF DEVELOPMENT  ✦  " + new Date().getFullYear() + "  ✦  ";
    const step = Math.PI * 2 / ring.length; [...ring].forEach((c, k) => { x.save(); x.translate(sx, sy); x.rotate(-Math.PI / 2 + k * step); x.translate(0, -88); x.fillText(c, 0, 0); x.restore() });
    x.fillStyle = "#5a3f08"; font("", 400, 70, SERIF); x.fillText("GL", sx, sy + 24);
    x.restore();

    /* tanda tangan */
    const sig = (cx, nmS) => { x.fillStyle = NAVY; fit(nmS, 520, "", 400, 70, SCRIPT); x.fillText(nmS, cx, 1360);
      x.strokeStyle = INK; x.lineWidth = 2; x.beginPath(); x.moveTo(cx - 290, 1384); x.lineTo(cx + 290, 1384); x.stroke();
      x.fillStyle = INK; font("", 700, 24, SANS); spaced(nmS.toUpperCase(), cx, 1426, 3); x.fillStyle = "#6b6f86"; font("italic", 400, 28, SERIF); x.fillText("Pengembang GrowthLab", cx, 1466) };
    sig(560, "Rifa Haqi Putra Wibowo"); sig(W - 560, "Thumpal Alvin");
    /* kaki */
    const tgl = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    let h = 0; for (const c of nm + tgl) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const no = `GL-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${(h % 65536).toString(16).toUpperCase().padStart(4, "0")}`;
    x.fillStyle = "#6b6f86"; font("", 400, 24, SANS); x.fillText(`Diterbitkan ${tgl}   ·   No. ${no}   ·   Teknologi Pendidikan FIP Universitas Negeri Jakarta`, W / 2, H - O - B - 74);
    x.fillStyle = "#9a9db0"; font("italic", 400, 22, SERIF); x.fillText("Sertifikat ini merupakan umpan balik belajar mandiri, bukan sertifikat resmi.", W / 2, H - O - B - 42);
    return cv;
  };
  G.certFile = name => {
    const cv = G.certificate(name), fn = `sertifikat-growthlab-${(name || "peserta").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.png`;
    if (cv.toBlob) cv.toBlob(b => download(fn, b), "image/png");
    else download(fn, new Blob([Uint8Array.from(atob(cv.toDataURL("image/png").split(",")[1]), c => c.charCodeAt(0))], { type: "image/png" }));
  };

  /* ---------- bagian panel ---------- */
  G.panelExtra = G.panelExtra || [];
  G.panelExtra.push(() => {
    const ok = allDone();
    return `<section class="gx-sec gx-keep" aria-labelledby="gx-ct"><span class="mono" id="gx-ct">Sertifikat penyelesaian</span>
      ${ok ? `<p>Semua bab selesai. Tulis namamu lalu unduh sertifikat (gambar PNG) berisi profil kesiapan kerjamu.</p>
        <label class="gx-lbl">Nama di sertifikat<input id="gx-nm" maxlength="60" autocomplete="name" value="${esc(nameOf())}" placeholder="Nama lengkap"></label>
        <div class="gx-row"><button type="button" class="btn p" data-gxb="cert">Unduh sertifikat</button></div>`
      : `<p>Sertifikat terbuka setelah semua ${GLD.COURSE.chapters.reduce((n, c) => n + c.l.length, 0)} pelajaran di ${GLD.COURSE.chapters.length} bab selesai.</p>`}
    </section>
    <section class="gx-sec gx-keep" aria-labelledby="gx-bk"><span class="mono" id="gx-bk">Cadangan progres</span>
      <p>Progres tersimpan di browser ini saja. Unduh cadangan sebelum ganti perangkat atau menghapus data browser, lalu pulihkan di perangkat baru.</p>
      <div class="gx-row"><button type="button" class="btn" data-gxb="export">Unduh cadangan (.json)</button>
        <label class="btn gx-file">Pulihkan dari file<input type="file" accept="application/json,.json" data-gxb="import"></label></div>
      <p class="gx-msg" role="status" aria-live="polite"></p></section>`;
  });

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-gxb]"); if (!b || b.tagName === "INPUT") return;
    if (b.dataset.gxb === "export") { if (G.log) G.log("export", {}); G.exportFile(); msg(b, "Cadangan diunduh.") }
    if (b.dataset.gxb === "cert") {
      const nm = (document.querySelector("#gx-nm") || {}).value || "";
      try { const u = G.storage.get("gl-ui") || {}; u.nama = nm.trim(); G.storage.set("gl-ui", u) } catch (_) {}
      if (G.log) G.log("sertifikat", {});
      G.certFile(nm.trim()); msg(b, "Sertifikat diunduh.");
    }
  });
  document.addEventListener("change", e => {
    const inp = e.target.closest('input[data-gxb="import"]'); if (!inp || !inp.files[0]) return;
    const f = inp.files[0]; inp.value = "";
    if (f.size > 5e6) return msg(inp, "File terlalu besar.");
    f.text().then(t => {
      let d; try { d = G.parseImport(t) } catch (err) { return msg(inp, err.message) }
      if (!confirm("Progres di browser ini akan diganti dengan isi file cadangan. Lanjutkan?")) return;
      G.importData(d); msg(inp, "Progres dipulihkan. Memuat ulang…"); setTimeout(() => location.reload(), 600);
    });
  });
  function msg(el, t) { const m = el.closest(".gx-sec").querySelector(".gx-msg"); if (m) m.textContent = t }
})();
