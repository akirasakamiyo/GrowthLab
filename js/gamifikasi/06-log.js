/* ==================================================================
   Fase 5 · log pengukuran lokal (untuk analisis retensi, completion rate, pre/post)
   - Disimpan hanya di browser (key "gl-log"), TIDAK pernah dikirim ke mana pun.
   - Tetap mencatat walau mode gamifikasi nonaktif (ini data belajar, bukan elemen permainan).
   - Bisa diunduh sebagai JSON atau CSV dari panel, dan ikut dalam file cadangan progres.
   ================================================================== */
(() => {
  const G = window.GLG, KEY = "gl-log", MAX = 3000, GAP = 30 * 60 * 1000;   // maks event tersimpan; jeda > 30 menit = sesi baru
  const rid = () => Math.random().toString(36).slice(2, 10);
  const fresh = () => ({ schemaVersion: 1, device: rid(), created: Date.now(), sessions: [], events: [] });
  let L = null;
  const st = () => {
    if (L) return L;
    const r = G.storage.get(KEY);
    L = r && Array.isArray(r.events) && Array.isArray(r.sessions) ? r : fresh();
    return L;
  };
  const save = () => G.storage.set(KEY, L);

  /* sesi: dibuka saat halaman dimuat, diperpanjang setiap ada aktivitas */
  function session(now) {
    const S = st(), last = S.sessions[S.sessions.length - 1];
    if (last && now - last.end < GAP) { last.end = now; return last }
    const s = { id: rid(), start: now, end: now, events: 0 };
    S.sessions.push(s); if (S.sessions.length > 500) S.sessions.shift();
    S.events.push({ t: now, type: "session_start", sid: s.id, data: {} });
    return s;
  }
  /* catat satu event */
  G.log = (type, data) => {
    const now = Date.now(), s = session(now), S = st();
    S.events.push({ t: now, type, sid: s.id, data: data || {} });
    s.events++;
    if (S.events.length > MAX) S.events.splice(0, S.events.length - MAX);
    save();
  };

  /* ---------- sumber event ---------- */
  session(Date.now()); save();
  G.on("lesson", d => G.log("lesson_done", { k: d.k }));
  G.on("quiz", d => G.log("quiz", { m: d.m, score: d.score, benar: d.benar, n: d.n }));
  G.on("dnd", d => G.log("dnd", { id: d.id, benar: d.benar, n: d.n }));
  G.on("sim", d => G.log("sim", { id: d.id, score: d.score }));
  let lastView = "";
  const view = () => { const v = (location.hash || "#/").split("?")[0]; if (v !== lastView) { lastView = v; G.log("view", { v }) } };
  addEventListener("hashchange", view); view();
  addEventListener("pagehide", () => { const s = st().sessions.slice(-1)[0]; if (s) { s.end = Date.now(); save() } });

  /* ---------- ringkasan untuk analisis ---------- */
  G.logSummary = () => {
    const S = st(), ev = S.events, total = GLD.COURSE.chapters.reduce((n, c) => n + c.l.length, 0);
    const done = (G.storage.get("mer-done") || []).length;
    const days = [...new Set(S.sessions.map(s => G.dayKey(s.start)))];
    const dur = S.sessions.reduce((a, s) => a + (s.end - s.start), 0);
    /* pre/post: skor percobaan pertama vs terbaik per mode kuis */
    const quiz = {};
    ev.filter(e => e.type === "quiz").forEach(e => { const q = quiz[e.data.m] || (quiz[e.data.m] = { first: e.data.score, best: e.data.score, attempts: 0 }); q.attempts++; q.best = Math.max(q.best, e.data.score) });
    return {
      device: S.device, since: new Date(S.created).toISOString(),
      sessions: S.sessions.length, activeDays: days.length, minutes: Math.round(dur / 60000),
      lessonsDone: done, lessonsTotal: total, completionRate: Math.round(done / total * 1000) / 10,
      quiz, events: ev.length
    };
  };
  G.logExport = () => ({ format: "growthlab-log", version: 1, exported: new Date().toISOString(), summary: G.logSummary(), sessions: st().sessions, events: st().events });
  const csvCell = v => { const s = typeof v === "object" ? JSON.stringify(v) : String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s };
  G.logCSV = () => ["waktu_iso,sesi,jenis,data", ...st().events.map(e => [new Date(e.t).toISOString(), e.sid, e.type, e.data].map(csvCell).join(","))].join("\n");
  G.logClear = () => { L = fresh(); save() };

  /* ---------- bagian panel ---------- */
  const dl = (name, text, type) => { const a = document.createElement("a"), u = URL.createObjectURL(new Blob([text], { type })); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000) };
  G.panelExtra = G.panelExtra || [];
  G.panelExtra.push(() => {
    const s = G.logSummary();
    return `<section class="gx-sec gx-keep" aria-labelledby="gx-lg"><span class="mono" id="gx-lg">Catatan aktivitas belajar</span>
      <p>${s.sessions} sesi · ${s.activeDays} hari aktif · sekitar ${s.minutes} menit · ${s.lessonsDone}/${s.lessonsTotal} pelajaran (${String(s.completionRate).replace(".", ",")}%).</p>
      <p class="gx-how">Catatan ini hanya tersimpan di browser ini dan tidak dikirim ke mana pun. Bisa kamu unduh untuk diserahkan ke guru/peneliti bila diminta.</p>
      <div class="gx-row"><button type="button" class="btn" data-gxl="json">Unduh (.json)</button><button type="button" class="btn" data-gxl="csv">Unduh (.csv)</button><button type="button" class="btn" data-gxl="clear">Hapus catatan</button></div></section>`;
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-gxl]"); if (!b) return;
    const k = b.dataset.gxl, d = new Date().toISOString().slice(0, 10);
    if (k === "json") dl(`growthlab-log-${d}.json`, JSON.stringify(G.logExport(), null, 2), "application/json");
    if (k === "csv") dl(`growthlab-log-${d}.csv`, G.logCSV(), "text/csv");
    if (k === "clear" && confirm("Hapus semua catatan aktivitas di browser ini? Progres belajar tidak ikut terhapus.")) { G.logClear(); b.closest(".gx-sec").querySelector("p").textContent = "Catatan dihapus." }
  });
})();
