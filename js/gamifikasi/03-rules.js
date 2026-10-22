/* ==================================================================
   GAMIFIKASI · rule engine (XP & level). Tidak menyentuh DOM.
   ================================================================== */
(() => {
  const G = window.GLG, C = G.CFG, X = C.xp;

  /* ---------- level ---------- */
  G.need = n => Math.round(C.level.a * Math.pow(Math.max(0, n - 1), C.level.p));   // XP kumulatif ke level n
  G.levelOf = xp => { let n = 1; while (G.need(n + 1) <= xp) n++; return n };
  G.tier = n => C.tiers.reduce((t, [m, nm]) => n >= m ? nm : t, C.tiers[0][1]);
  G.total = () => G.state().ledger.reduce((a, e) => a + e.xp, 0);
  G.info = () => {
    const xp = G.total(), level = G.levelOf(xp), from = G.need(level), to = G.need(level + 1);
    return { xp, level, tier: G.tier(level), from, to, p: (xp - from) / (to - from) };
  };

  /* ---------- label aktivitas ---------- */
  const lessonT = k => { const [i, j] = String(k).split("-").map(Number); try { return GLD.COURSE.chapters[i].l[j].t } catch (e) { return `Pelajaran ${i + 1}.${j + 1}` } };
  const quizT = m => m === "all" ? "Kuis Gabungan" : "Kuis Bab " + (+String(m).slice(1) + 1);
  const dndT = id => { const s = typeof GLD !== "undefined" && GLD.DND.find(x => x.id === id); return "Drag & drop: " + (s ? s.t : id) };
  const simT = id => { const s = typeof GLD !== "undefined" && GLD.SIM.find(x => x.id === id); return "Simulasi: " + (s ? s.t : id) };

  /* ---------- potensi XP dari skor ---------- */
  const pot = {
    quiz: d => (d.m === "all" ? X.quiz.all : X.quiz.bab) * d.score / 100 + (d.score >= 100 ? X.quiz.perfect : 0),
    dnd: d => X.dnd.base * d.benar / d.n + (d.benar === d.n ? X.dnd.perfect : 0),
    sim: d => X.sim.base * d.score / 100 + (d.score >= X.sim.bonusAt ? X.sim.bonus : 0)
  };
  const got = act => G.state().ledger.filter(e => e.key.startsWith(act + "#")).reduce((a, e) => a + e.xp, 0);

  /* aktivitas berskor: XP = (potensi skor ini − XP yang sudah didapat untuk aktivitas ini) × faktor percobaan.
     Mengulang dengan skor sama = 0 XP; naik skor = dapat selisihnya, makin kecil di percobaan berikutnya. */
  function scored(type, id, d, label, factor) {
    const S = G.state(), act = type + ":" + id, n = (S.att[act] || 0) + 1;
    S.att[act] = n;
    const f = factor ?? X.retry[Math.min(n, X.retry.length) - 1];
    const xp = Math.max(0, pot[type](d) - got(act)) * f;
    return G.add(type, xp, act + "#" + n, { label, score: d.score ?? Math.round(d.benar / d.n * 100), attempt: n });
  }

  /* ---------- aturan per jenis event ---------- */
  const R = {
    lesson: d => G.add("lesson", X.lesson.xp, "lesson:" + d.k, { label: lessonT(d.k) }),
    quiz: (d, f) => scored("quiz", d.m, d, quizT(d.m), f),
    dnd: (d, f) => scored("dnd", d.id, d, dndT(d.id), f),
    sim: (d, f) => scored("sim", d.id, d, simT(d.id), f)
  };

  /* catat aktivitas → kembalikan { e (event ledger atau null), before, after } */
  G.award = (type, d, factor) => {
    const before = G.info(), e = R[type] ? R[type](d, factor) : null;
    G.save();
    return { e, before, after: G.info() };
  };

  /* data lama → ledger (sekali, saat modul pertama kali aktif). Dihitung seperti percobaan pertama, tanpa notifikasi. */
  G.backfill = () => {
    const get = k => { try { return JSON.parse(localStorage.getItem(k) || "null") } catch (e) { return null } };
    const done = get("mer-done"), lx = get("gl-latihan");
    if (Array.isArray(done)) done.forEach(k => R.lesson({ k }));
    if (lx && typeof lx === "object") {
      const kb = lx.kuis && lx.kuis.best || {};
      for (const m in kb) if (kb[m] && typeof kb[m].score === "number") R.quiz({ m, score: kb[m].score }, 1);
      for (const id in lx.dnd || {}) { const b = lx.dnd[id] && lx.dnd[id].best; if (b && b.n) R.dnd({ id, benar: b.benar, n: b.n }, 1) }
      for (const id in lx.sim || {}) { const b = lx.sim[id] && lx.sim[id].best; if (b && typeof b.score === "number") R.sim({ id, score: b.score }, 1) }
    }
    G.state().ledger.forEach(e => e.meta.awal = true);
    G.state().seenLevel = G.info().level;
    G.save();
  };
})();
