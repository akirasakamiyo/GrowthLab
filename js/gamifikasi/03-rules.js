/* ==================================================================
   GAMIFIKASI · rule engine (XP & level). Tidak menyentuh DOM.
   ================================================================== */
(() => {
  const G = window.GLG, C = G.CFG, X = C.xp;

  /* ---------- level ---------- */
  G.need = n => Math.round(C.level.a * Math.pow(Math.max(0, n - 1), C.level.p));   // XP kumulatif ke level n
  G.levelOf = xp => { let n = 1; while (G.need(n + 1) <= xp) n++; return n };
  G.tier = n => C.tiers.reduce((t, [m, nm]) => n >= m ? nm : t, C.tiers[0][1]);
  G.total = () => Math.max(0, G.state().ledger.reduce((a, e) => a + e.xp, 0));
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

  /* catat aktivitas → kembalikan { e (event ledger atau null), badges (badge baru), before, after } */
  G.award = (type, d, factor) => {
    const before = G.info();
    if (G.markDay) G.markDay();
    const e = R[type] ? R[type](d, factor) : null;
    const badges = G.checkBadges ? G.checkBadges() : [];
    const quest = G.checkQuest ? G.checkQuest() : null;
    const remedial = type === "quiz" && G.remedial ? G.remedial(d) : null;
    G.save();
    const after = G.info();
    if (G.log) {
      if (e && e.xp) G.log("xp", { xp: e.xp, key: e.key });
      badges.forEach(b => G.log("badge", { id: b.id }));
      if (quest) G.log("quest_done", { wk: quest.key });
      if (after.level > before.level) G.log("level_up", { level: after.level });
    }
    return { e, badges, quest, remedial, before, after };
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

/* ==================================================================
   Fase 2 · streak mingguan & badge
   ================================================================== */
(() => {
  const G = window.GLG, C = G.CFG;

  /* ---------- hari & minggu (zona waktu perangkat) ---------- */
  const p2 = n => String(n).padStart(2, "0");
  G.dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` };
  const parse = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d) };
  /* Senin minggu itu (jam 00:00 lokal) */
  const monday = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d };
  G.weekKey = t => G.dayKey(monday(t));

  G.markDay = (t = Date.now()) => { const S = G.state(), k = G.dayKey(t); if (!S.days.includes(k)) { S.days.push(k); S.days.sort(); G.save() } };

  /* hari belajar dari data lama (sekali, saat migrasi ke skema 2) */
  G.backfillDays = () => {
    const S = G.state(), ts = S.ledger.filter(e => !e.meta.awal).map(e => e.t);
    const lx = G.storage.get("gl-latihan");
    if (lx) {
      ((lx.kuis && lx.kuis.hist) || []).forEach(h => ts.push(h.t));
      for (const id in lx.sim || {}) ((lx.sim[id] && lx.sim[id].hist) || []).forEach(h => ts.push(h.t));
    }
    ts.filter(t => t > 1.5e12 && t <= Date.now()).forEach(t => { const k = G.dayKey(t); if (!S.days.includes(k)) S.days.push(k) });
    S.days.sort(); delete S.needDays; G.save();
  };

  /* streak dihitung ulang dari daftar hari (deterministik, tanpa status tersembunyi) */
  G.streak = (now = Date.now()) => {
    const T = C.streak, S = G.state(), per = {};
    S.days.forEach(k => { const w = G.weekKey(parse(k)); per[w] = (per[w] || 0) + 1 });
    const thisW = G.weekKey(now), weekDays = [];
    const mon = monday(now);
    for (let i = 0; i < 7; i++) { const d = new Date(mon); d.setDate(mon.getDate() + i); weekDays.push({ k: G.dayKey(d), on: S.days.includes(G.dayKey(d)), today: G.dayKey(d) === G.dayKey(now) }) }
    let cur = 0, best = 0, met = 0, freeze = 0, earned = 0, used = 0, broke = false;
    const keys = Object.keys(per);
    if (keys.length) {
      const d = parse(keys.sort()[0]);
      for (; G.dayKey(d) <= thisW; d.setDate(d.getDate() + 7)) {
        const w = G.dayKey(d), n = per[w] || 0, ok = n >= T.target;
        if (ok) { cur++; met++; broke = false; if (met % T.earnEvery === 0 && freeze < T.maxFreeze) { freeze++; earned++ } }
        else if (w === thisW) { /* minggu berjalan belum selesai: tidak memutus streak */ }
        else if (freeze > 0) { freeze--; used++ }
        else { if (cur > 0) broke = true; cur = 0 }
        best = Math.max(best, cur);
      }
    }
    return { target: T.target, thisWeek: per[thisW] || 0, weekDays, cur, best, met, freeze, used, broke };
  };

  /* ---------- badge ---------- */
  const lx = () => G.storage.get("gl-latihan") || {};
  const doneSet = () => new Set(G.storage.get("mer-done") || []);
  const PASS = () => (typeof GLD !== "undefined" && GLD.PASS_MCQ) || 70;
  /* setiap rule mengembalikan { cur, max } → badge didapat bila cur >= max */
  G.badgeRule = {
    chapter: r => { const ch = GLD.COURSE.chapters[r.i], d = doneSet(); return { cur: ch.l.filter((_, j) => d.has(r.i + "-" + j)).length, max: ch.l.length } },
    quizScore: r => { const b = (lx().kuis || {}).best || {}; return { cur: Object.values(b).some(x => x && x.score >= r.min) ? 1 : 0, max: 1 } },
    quizPass: r => { const b = ((lx().kuis || {}).best || {})[r.m]; return { cur: b && b.score >= PASS() ? 1 : 0, max: 1 } },
    dndPerfect: r => { const d = lx().dnd || {}; return { cur: Math.min(r.n, Object.values(d).filter(x => x && x.best && x.best.n && x.best.benar === x.best.n).length), max: r.n } },
    simCount: r => { const s = lx().sim || {}; return { cur: Math.min(r.n, Object.values(s).filter(x => x && x.best).length), max: r.n } },
    simScore: r => { const s = lx().sim || {}; return { cur: Object.values(s).some(x => x && x.best && x.best.score >= r.min) ? 1 : 0, max: 1 } },
    weeks: r => ({ cur: Math.min(r.n, G.streak().best), max: r.n }),
    final: () => {
      const d = lx(), q = ((d.kuis || {}).best || {}).all ? 1 : 0;
      const dn = GLD.DND.filter(s => d.dnd && d.dnd[s.id] && d.dnd[s.id].n > 0).length, sm = GLD.SIM.filter(s => d.sim && d.sim[s.id] && d.sim[s.id].best).length;
      return { cur: q + dn + sm, max: 1 + GLD.DND.length + GLD.SIM.length };
    }
  };
  G.badgeList = () => C.badges.map(b => {
    let pr = { cur: 0, max: 1 };
    try { pr = G.badgeRule[b.rule.type](b.rule) } catch (e) {}
    const at = G.state().badges[b.id];
    return Object.assign({}, b, pr, { got: !!at, at });
  });
  /* periksa semua badge; yang baru terpenuhi dicatat + XP-nya masuk ledger. Mengembalikan badge baru. */
  G.checkBadges = () => {
    const S = G.state(), out = [];
    G.badgeList().forEach(b => {
      if (b.got || b.cur < b.max) return;
      S.badges[b.id] = Date.now();
      const e = G.add("badge", b.xp || 0, "badge:" + b.id, { label: "Badge " + b.name });
      out.push(Object.assign(b, { e, got: true, at: S.badges[b.id] }));
    });
    if (out.length) G.save();
    return out;
  };
})();

/* ==================================================================
   Fase 3 · quest mingguan, skill map, remedial, petunjuk, unlock ringan
   ================================================================== */
(() => {
  const G = window.GLG, C = G.CFG;
  const lx = () => G.storage.get("gl-latihan") || {};
  const PASS = () => (typeof GLD !== "undefined" && GLD.PASS_MCQ) || 70;
  const inWeek = (t, wk) => G.weekKey(t) === wk;

  /* ---------- quest ---------- */
  const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const lessonsLeft = () => { const d = new Set(G.storage.get("mer-done") || []); return GLD.COURSE.chapters.reduce((n, ch, i) => n + ch.l.filter((_, j) => !d.has(i + "-" + j)).length, 0) };
  G.quest = (now = Date.now()) => {
    const wk = G.weekKey(now), S = G.state(), Q = C.quest;
    S.quests = S.quests || {};
    if (!S.quests[wk]) {
      /* pilih tujuan minggu ini sekali, lalu simpan agar tidak berubah walau kondisi berubah */
      const pool = Q.goals.filter(g => g.type !== "lesson" || lessonsLeft() >= g.n);
      const h = hash(wk), picked = [];
      for (let k = 0; picked.length < Math.min(Q.pick, pool.length); k++) { const g = pool[(h + k * 7) % pool.length]; if (!picked.includes(g)) picked.push(g) }
      S.quests[wk] = { goals: picked.map(g => g.type) };
      G.save();
    }
    const ev = S.ledger.filter(e => !e.meta.awal && inWeek(e.t, wk));
    const count = type => type === "days" ? S.days.filter(k => G.weekKey(new Date(k.replace(/-/g, "/"))) === wk).length : ev.filter(e => e.type === type).length;
    const goals = S.quests[wk].goals.map(type => { const g = Q.goals.find(x => x.type === type); return { type, t: g.t, n: g.n, cur: Math.min(g.n, count(type)) } });
    return { wk, goals, done: goals.every(g => g.cur >= g.n), claimed: G.has("quest:" + wk), xp: Q.xp };
  };
  G.checkQuest = () => { const q = G.quest(); if (q.done && !q.claimed) return G.add("quest", q.xp, "quest:" + q.wk, { label: "Quest mingguan selesai" }); return null };

  /* ---------- skill map ---------- */
  G.skills = () => {
    const d = new Set(G.storage.get("mer-done") || []), L = lx(), W = C.skillWeight;
    return C.skills.map(s => {
      const ch = GLD.COURSE.chapters[s.bab], les = ch.l.filter((_, j) => d.has(s.bab + "-" + j)).length / ch.l.length;
      const qb = (((L.kuis || {}).best || {})["b" + s.bab] || {}).score || 0;
      const sm = ((((L.sim || {})[s.sim] || {}).best) || {}).score || 0;
      return { t: s.t, v: Math.round((les * W.lesson + qb / 100 * W.quiz + sm / 100 * W.sim) * 100), les: Math.round(les * 100), quiz: qb, sim: sm };
    });
  };

  /* ---------- remedial ---------- */
  G.remedial = d => {
    const S = G.state(); S.remedial = S.remedial || {};
    if (!d || d.score >= PASS() || !Array.isArray(d.wrong)) { if (d) delete S.remedial[d.m]; G.save(); return null }
    const n = {};
    d.wrong.forEach(([b, l]) => { const k = b + "-" + l; n[k] = (n[k] || 0) + 1 });
    const les = Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, C.remedial.max).map(([k, c]) => ({ k, c }));
    S.remedial[d.m] = { t: Date.now(), score: d.score, les }; G.save();
    return S.remedial[d.m];
  };

  /* ---------- petunjuk berbayar XP (boleh negatif; total tidak pernah di bawah 0) ---------- */
  G.spend = (cost, key, meta) => {
    if (G.has(key) || G.total() < cost) return null;
    const e = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), type: "hint", xp: -cost, t: Date.now(), key, meta: meta || {} };
    G.state().ledger.push(e); G.save(); if (G.log) G.log("hint", { key }); return e;
  };

  /* ---------- unlock ringan: simulasi bab i disarankan setelah lulus kuis bab i ---------- */
  G.simGate = id => {
    const i = GLD.SIM.findIndex(s => s.id === id), S = G.state();
    if (i < 0 || (S.skip || {})[id]) return null;
    const b = ((lx().kuis || {}).best || {})["b" + i];
    return b && b.score >= PASS() ? null : { bab: i };
  };
  G.skipGate = id => { const S = G.state(); S.skip = S.skip || {}; S.skip[id] = Date.now(); G.save(); if (G.log) G.log("gate_skip", { id }) };
})();
