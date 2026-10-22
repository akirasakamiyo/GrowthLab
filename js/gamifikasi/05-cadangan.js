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
  G.certificate = name => {
    const W = 1600, H = 1130, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const x = cv.getContext("2d"), I = G.info(), sk = G.skills(), H2 = typeof GLX !== "undefined" ? GLX.hitung() : {};
    const F = (w, s, f) => `${w} ${s}px ${f}`, D = "'DM Sans',Inter,Arial,sans-serif", A = "Anton,Impact,'Arial Narrow',sans-serif";
    x.fillStyle = "#fffaf0"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#ffc83d"; x.fillRect(0, 0, W, 26); x.fillRect(0, H - 26, W, 26);
    x.strokeStyle = "#1b1740"; x.lineWidth = 6; x.strokeRect(50, 60, W - 100, H - 120);
    x.textAlign = "center"; x.fillStyle = "#e2552b"; x.font = F(700, 26, D);
    x.fillText("GROWTHLAB · SELF DEVELOPMENT FOR JOB SEEKER", W / 2, 150);
    x.fillStyle = "#1b1740"; x.font = F(400, 96, A); x.fillText("SERTIFIKAT PENYELESAIAN", W / 2, 270);
    x.font = F(400, 30, D); x.fillStyle = "#3a4370"; x.fillText("Diberikan kepada", W / 2, 345);
    x.font = F(400, 84, A); x.fillStyle = "#2a56f5";
    let nm = name || "Peserta GrowthLab"; while (x.measureText(nm).width > W - 300 && nm.length > 3) nm = nm.slice(0, -2) + "…";
    x.fillText(nm, W / 2, 445);
    x.font = F(400, 28, D); x.fillStyle = "#3a4370";
    x.fillText(`telah menyelesaikan ${GLD.COURSE.chapters.length} bab dan ${GLD.COURSE.chapters.reduce((n, c) => n + c.l.length, 0)} pelajaran soft skill:`, W / 2, 505);
    x.font = F(700, 30, D); x.fillStyle = "#1b1740"; x.fillText(GLD.COURSE.chapters.map(c => c.t).join("  ·  "), W / 2, 550);
    /* profil kesiapan kerja */
    x.textAlign = "left"; x.font = F(700, 22, D); x.fillStyle = "#e2552b"; x.fillText("PROFIL KESIAPAN KERJA", 230, 640);
    sk.forEach((s, i) => {
      const y = 690 + i * 70;
      x.font = F(700, 26, D); x.fillStyle = "#1b1740"; x.fillText(s.t, 230, y);
      x.fillStyle = "#e8ecfa"; x.fillRect(230, y + 14, 620, 18);
      x.fillStyle = "#ffb11f"; x.fillRect(230, y + 14, 620 * s.v / 100, 18);
      x.font = F(700, 24, D); x.fillStyle = "#1b1740"; x.textAlign = "right"; x.fillText(s.v + "/100", 970, y); x.textAlign = "left";
    });
    /* ringkasan */
    const rows = [["Level", `${I.level} · ${I.tier}`], ["Total XP", String(I.xp)], ["Badge", `${G.badgeList().filter(b => b.got).length} dari ${C.badges.length}`]];
    if (H2 && H2.akhir != null) rows.push(["Nilai akhir", String(Math.round(H2.akhir * 10) / 10).replace(".", ",")]);
    x.font = F(700, 22, D); x.fillStyle = "#e2552b"; x.fillText("RINGKASAN", 1080, 640);
    rows.forEach(([k, v], i) => { const y = 690 + i * 52; x.font = F(400, 24, D); x.fillStyle = "#3a4370"; x.fillText(k, 1080, y); x.font = F(700, 26, D); x.fillStyle = "#1b1740"; x.fillText(v, 1240, y) });
    x.textAlign = "center"; x.font = F(400, 22, D); x.fillStyle = "#3a4370";
    x.fillText(`Diterbitkan ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · Media pembelajaran Kelompok 8, Teknologi Pendidikan FIP UNJ`, W / 2, 960);
    x.font = F(400, 18, D); x.fillStyle = "#7a83a8";
    x.fillText("Sertifikat ini adalah umpan balik belajar mandiri, bukan sertifikat resmi.", W / 2, 995);
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
