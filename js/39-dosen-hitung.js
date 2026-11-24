/* ==================================================================
   DASHBOARD DOSEN, LOGIKA HITUNG (2026-11-24)
   Murni: tidak menyentuh DOM atau penyimpanan, jadi bisa diuji di Node (tests/t-dosen.js).
   Masukan: laporan peserta = file "growthlab-log" yang diunduh peserta dari halaman Pengaturan
   (log pengukuran Fase 5, js/gamifikasi/06-log.js). Versi 1 (tanpa nama/jawaban) tetap diterima.
   Semua ambang ada di GLDH.CFG, ubah di satu tempat itu saja.
   ================================================================== */
(function (root) {
  const CFG = {
    /* peserta "stuck" (ditandai perlu dibantu) bila memenuhi SALAH SATU aturan di bawah */
    stuck: {
      inactiveDays: 7,      // a) tidak ada aktivitas selama ≥ 7 hari padahal belum selesai
      failStreak: 3,        // b) ≥ 3 kali gagal berturut-turut di kuis bab yang sama (dan belum pernah lulus bab itu)
      belowPassMin: 2       // c) semua percobaan kuis suatu bab di bawah batas lulus, minimal 2 percobaan
    },
    activeDays: 7,          // KPI "peserta aktif": ada aktivitas dalam 7 hari terakhir
    suspectWrong: 0.7,      // soal ditandai mencurigakan bila > 70% jawaban salah...
    suspectMinN: 5,         // ...dan sudah dijawab minimal 5 kali (di bawah itu datanya terlalu sedikit)
    maxFileBytes: 5e6,      // batas ukuran satu file laporan
    maxEvents: 5000
  };
  const DAY = 864e5;
  const isNum = v => typeof v === "number" && isFinite(v);
  const str = v => typeof v === "string";
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const r1 = n => n == null ? null : Math.round(n * 10) / 10;

  /* sidik soal: berubah kalau teks/urutan soal kuis diubah, supaya jawaban lama tidak salah dipetakan */
  function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 } return h.toString(36) }
  const quizVersion = quiz => fnv(quiz.map(x => x.q + "|" + x.a + "|" + x.o.length).join("\n"));

  /* ---------- 1. baca file laporan (data tidak tepercaya: semua field diperiksa) ---------- */
  function parse(text) {
    let o;
    if (str(text) && text.length > CFG.maxFileBytes) return { ok: false, err: "File terlalu besar (maks 5 MB)." };
    try { o = str(text) ? JSON.parse(text) : text } catch (e) { return { ok: false, err: "Bukan file JSON yang valid." } }
    if (!o || o.format !== "growthlab-log" || !Array.isArray(o.events)) return { ok: false, err: "Bukan laporan GrowthLab (format growthlab-log)." };
    const pid = str(o.summary && o.summary.device) ? o.summary.device.slice(0, 40) : null;
    if (!pid) return { ok: false, err: "Laporan tidak punya id perangkat." };
    const P = o.peserta || {};
    const nama = str(P.nama) ? P.nama.replace(/\s+/g, " ").trim().slice(0, 120) : "";
    const exported = Date.parse(o.exported) || 0;
    const ev = o.events.slice(-CFG.maxEvents).filter(e => e && isNum(e.t) && str(e.type));
    const lessons = {};   // kunci pelajaran "i-j" -> waktu selesai pertama
    const attempts = [];  // percobaan kuis
    const acts = [];      // semua waktu aktivitas
    ev.forEach(e => {
      const d = e.data || {};
      if (e.type !== "view" && e.type !== "session_start") acts.push(e.t);
      if (e.type === "lesson_done" && str(d.k)) { if (!(d.k in lessons) || e.t < lessons[d.k]) lessons[d.k] = e.t }
      if (e.type === "quiz" && str(d.m) && isNum(d.score) && d.score >= 0 && d.score <= 100 && isNum(d.n) && d.n > 0) {
        const ans = Array.isArray(d.ans) ? d.ans.filter(a => Array.isArray(a) && a.length >= 3 && a.every(Number.isInteger)).slice(0, 200) : null;
        attempts.push({ m: d.m, score: d.score, benar: isNum(d.benar) ? d.benar : null, n: d.n, t: e.t, ans });
      }
    });
    (Array.isArray(o.sessions) ? o.sessions : []).forEach(s => { if (s && isNum(s.end)) acts.push(s.end) });
    const done = new Set(Object.keys(lessons));
    if (Array.isArray(P.done)) P.done.forEach(k => str(k) && done.add(k));
    attempts.sort((a, b) => a.t - b.t);
    return { ok: true, rep: { pid, nama, exported, done: [...done], lessons, attempts, last: acts.length ? Math.max(...acts) : null, qv: str(o.qv) ? o.qv : null, version: o.version } };
  }

  /* gabungkan banyak laporan: perangkat sama -> pakai laporan yang paling baru diekspor */
  function merge(reps) {
    const by = new Map();
    reps.forEach(r => { const o = by.get(r.pid); if (!o || r.exported >= o.exported) by.set(r.pid, r) });
    return [...by.values()];
  }

  /* ---------- 2. analisis ---------- */
  /* ctx: { chapters:[{t, n}], quiz:[{b,q,o,a}], pass, now, qv } */
  function analyze(reps, ctx) {
    const C = Object.assign({}, CFG, ctx.cfg || {}), S = Object.assign({}, CFG.stuck, (ctx.cfg || {}).stuck || {});
    const nB = ctx.chapters.length, total = ctx.chapters.reduce((a, c) => a + c.n, 0), pass = ctx.pass, now = ctx.now;
    const valid = new Set(); ctx.chapters.forEach((c, i) => { for (let j = 0; j < c.n; j++) valid.add(i + "-" + j) });
    const warn = [];
    const babName = m => m === "all" ? "Kuis Gabungan" : "Kuis Bab " + (+m.slice(1) + 1);

    const peserta = reps.map(r => {
      const done = r.done.filter(k => valid.has(k));
      const pct = total ? done.length / total * 100 : 0;
      /* posisi terakhir: pelajaran selesai dengan urutan paling jauh */
      let far = null; done.forEach(k => { const [i, j] = k.split("-").map(Number); if (!far || i > far[0] || (i === far[0] && j > far[1])) far = [i, j] });
      const perBab = ctx.chapters.map((c, i) => {
        const at = r.attempts.filter(a => a.m === "b" + i);
        const lessonsDone = done.filter(k => k.startsWith(i + "-")).length;
        return { attempts: at, best: at.length ? Math.max(...at.map(a => a.score)) : null, lessonsDone, complete: lessonsDone === c.n };
      });
      const bests = perBab.map(b => b.best).filter(v => v != null);
      const avg = mean(bests);
      const started = done.length > 0 || r.attempts.length > 0;
      const selesai = done.length === total && perBab.every(b => b.best != null && b.best >= pass);
      /* aturan stuck, masing-masing dengan alasan yang bisa dibaca dosen */
      const reasons = [];
      if (started && !selesai) {
        if (r.last == null) reasons.push({ k: "a", t: "Tidak ada catatan waktu aktivitas." });
        else { const d = Math.floor((now - r.last) / DAY); if (d >= S.inactiveDays) reasons.push({ k: "a", t: `Tidak aktif ${d} hari (batas ${S.inactiveDays} hari), padahal belum selesai.` }) }
        perBab.forEach((b, i) => {
          if (!b.attempts.length || b.best >= pass) return;
          let streak = 0; for (let x = b.attempts.length - 1; x >= 0 && b.attempts[x].score < pass; x--) streak++;
          const nm = babName("b" + i), best = String(r1(b.best)).replace(".", ",");
          if (streak >= S.failStreak) reasons.push({ k: "b", bab: i, t: `Gagal ${streak}× berturut-turut di ${nm} (terbaik ${best}, batas lulus ${pass}).` });
          else if (b.attempts.length >= S.belowPassMin) reasons.push({ k: "c", bab: i, t: `Skor ${nm} selalu di bawah ${pass} (${b.attempts.length} percobaan, terbaik ${best}).` });
        });
      }
      const status = !started ? "belum" : selesai ? "selesai" : reasons.length ? "stuck" : "berjalan";
      /* soal yang dijawab salah, dari percobaan dengan sidik soal yang cocok */
      const qOk = !ctx.qv || !r.qv || r.qv === ctx.qv;
      const wrong = {};
      if (qOk) r.attempts.forEach(a => (a.ans || []).forEach(([q, p, ok]) => { if (ok || !ctx.quiz[q]) return; const w = wrong[q] || (wrong[q] = { q, n: 0, picks: {} }); w.n++; w.picks[p] = (w.picks[p] || 0) + 1 }));
      return {
        pid: r.pid, nama: r.nama, done: done.length, total, pct: r1(pct), far, avg: r1(avg), last: r.last, status, reasons, started, qOk,
        attempts: r.attempts.map(a => ({ m: a.m, label: babName(a.m), score: r1(a.score), benar: a.benar, n: a.n, t: a.t, lulus: a.score >= pass })),
        perBab: perBab.map(b => ({ best: r1(b.best), n: b.attempts.length, lessonsDone: b.lessonsDone, complete: b.complete })),
        wrong: Object.values(wrong).sort((a, b) => b.n - a.n)
      };
    });
    if (reps.some(r => r.qv && ctx.qv && r.qv !== ctx.qv)) warn.push("Sebagian laporan dibuat dengan versi soal yang berbeda; jawaban per soal dari laporan itu tidak dipakai di analisis soal.");
    const names = {}; peserta.forEach(p => { const k = p.nama.toLowerCase(); if (k) names[k] = (names[k] || 0) + 1 });
    if (Object.values(names).some(n => n > 1)) warn.push("Ada nama yang sama dari perangkat berbeda. Bisa jadi satu peserta memakai dua perangkat, atau dua peserta bernama sama.");

    /* KPI */
    const aktif = peserta.filter(p => p.last != null && now - p.last <= C.activeDays * DAY).length;
    const kpi = {
      total: peserta.length, aktif, stuck: peserta.filter(p => p.status === "stuck").length,
      selesai: peserta.filter(p => p.status === "selesai").length, belum: peserta.filter(p => p.status === "belum").length,
      avgPct: r1(mean(peserta.map(p => p.pct))), avgScore: r1(mean(peserta.map(p => p.avg).filter(v => v != null)))
    };

    /* per bab: rata-rata skor terbaik peserta yang mencoba, jumlah percobaan, tingkat penyelesaian materi */
    const bab = ctx.chapters.map((c, i) => {
      const tried = peserta.filter(p => p.perBab[i].n > 0);
      return {
        i, t: c.t, avg: r1(mean(tried.map(p => p.perBab[i].best))), tried: tried.length,
        attempts: peserta.reduce((a, p) => a + p.perBab[i].n, 0),
        lulus: tried.filter(p => p.perBab[i].best >= pass).length,
        complete: peserta.filter(p => p.perBab[i].complete).length,
        completeRate: peserta.length ? r1(peserta.filter(p => p.perBab[i].complete).length / peserta.length * 100) : null
      };
    });

    /* analisis butir soal: semua jawaban dari semua percobaan (bab dan gabungan) */
    const items = ctx.quiz.map((x, q) => ({ q, b: x.b, text: x.q, opts: x.o, key: x.a, n: 0, wrong: 0, who: new Set(), dist: {} }));
    reps.forEach(r => { if (ctx.qv && r.qv && r.qv !== ctx.qv) return; r.attempts.forEach(a => (a.ans || []).forEach(([q, p, ok]) => {
      const it = items[q]; if (!it) return; const pk = p >= 0 && p < it.opts.length ? p : -1;
      it.n++; it.who.add(r.pid); if (!(pk === it.key && ok)) it.wrong++; it.dist[pk] = (it.dist[pk] || 0) + 1 })) });
    const soal = items.map(it => {
      let top = null; Object.entries(it.dist).forEach(([p, n]) => { p = +p; if (p === it.key) return; if (!top || n > top.n) top = { p, n } });
      const pw = it.n ? it.wrong / it.n : null;
      return { q: it.q, b: it.b, text: it.text, opts: it.opts, key: it.key, n: it.n, peserta: it.who.size, wrong: it.wrong, pctWrong: pw == null ? null : r1(pw * 100),
        dist: it.dist, top, suspect: pw != null && it.n >= C.suspectMinN && pw > C.suspectWrong, few: it.n > 0 && it.n < C.suspectMinN };
    }).sort((a, b) => (b.pctWrong ?? -1) - (a.pctWrong ?? -1) || b.n - a.n || a.q - b.q);

    return { peserta, kpi, bab, soal, warn, pass, cfg: { stuck: S, activeDays: C.activeDays, suspectWrong: C.suspectWrong, suspectMinN: C.suspectMinN } };
  }

  /* ---------- 3. CSV (dipisah koma, UTF-8 dengan BOM supaya Excel membaca huruf dengan benar) ---------- */
  const cell = v => { const s = v == null ? "" : String(v); return /[",\n\r;]/.test(s) || /^[=+\-@]/.test(s) ? `"${(/^[=+\-@]/.test(s) ? "'" : "") + s.replace(/"/g, '""')}"` : s };
  const csv = rows => "﻿" + rows.map(r => r.map(cell).join(",")).join("\r\n");
  const iso = t => t ? new Date(t).toISOString().slice(0, 16).replace("T", " ") : "";
  const ST = { selesai: "Selesai", berjalan: "Berjalan", stuck: "Perlu dibantu", belum: "Belum mulai" };
  const farLabel = p => p.far ? `Bab ${p.far[0] + 1} pelajaran ${p.far[1] + 1}` : "";
  const progresCSV = A => csv([["Nama", "Id perangkat", "Status", "Posisi terakhir", "Pelajaran selesai", "Progres (%)", "Skor rata-rata", ...A.bab.map(b => `Skor terbaik Bab ${b.i + 1}`), "Aktivitas terakhir", "Alasan perlu dibantu"],
    ...A.peserta.map(p => [p.nama || "(tanpa nama)", p.pid, ST[p.status], farLabel(p), `${p.done}/${p.total}`, p.pct, p.avg, ...p.perBab.map(b => b.best), iso(p.last), p.reasons.map(x => x.t).join(" | ")])]);
  const LT = "ABCD";
  const soalCSV = A => csv([["Peringkat", "Bab", "Soal", "Kunci", "Jumlah jawaban", "Jumlah peserta", "Salah (%)", "Distraktor terbanyak", "Dipilih (kali)", ...LT.split("").map(l => "Pilih " + l), "Waktu habis", "Tanda"],
    ...A.soal.map((s, i) => [s.n ? i + 1 : "", s.b + 1, s.text, LT[s.key], s.n, s.peserta, s.pctWrong, s.top ? (s.top.p < 0 ? "Waktu habis" : LT[s.top.p] + ". " + s.opts[s.top.p]) : "", s.top ? s.top.n : "", ...LT.split("").map((_, k) => s.dist[k] || 0), s.dist[-1] || 0, s.suspect ? "Mencurigakan" : s.few ? "Data sedikit" : s.n ? "" : "Belum dijawab"])]);
  const stuckCSV = A => csv([["Nama", "Id perangkat", "Posisi terakhir", "Progres (%)", "Skor rata-rata", "Aktivitas terakhir", "Alasan"],
    ...A.peserta.filter(p => p.status === "stuck").map(p => [p.nama || "(tanpa nama)", p.pid, farLabel(p), p.pct, p.avg, iso(p.last), p.reasons.map(x => x.t).join(" | ")])]);

  /* ---------- 4. SHA-256 (untuk kode fasilitator; tanpa crypto.subtle agar jalan juga dari file://) ---------- */
  function sha256(msg) {
    const K = [], H = [], isP = n => { for (let f = 2; f * f <= n; f++) if (n % f === 0) return false; return true }, fr = x => (x - Math.floor(x)) * 4294967296 | 0;
    for (let n = 2, c = 0; c < 64; n++) if (isP(n)) { if (c < 8) H[c] = fr(Math.pow(n, 1 / 2)); K[c++] = fr(Math.pow(n, 1 / 3)) }
    const b = [...unescape(encodeURIComponent(msg))].map(c => c.charCodeAt(0)), l = b.length * 8;
    b.push(0x80); while (b.length % 64 !== 56) b.push(0);
    for (let i = 7; i >= 0; i--) b.push(i > 3 ? 0 : (l >>> (i * 8)) & 255);
    const rr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < b.length; o += 64) {
      const w = []; for (let i = 0; i < 16; i++) w[i] = (b[o + i * 4] << 24) | (b[o + i * 4 + 1] << 16) | (b[o + i * 4 + 2] << 8) | b[o + i * 4 + 3];
      for (let i = 16; i < 64; i++) { const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0 }
      let [a, bb, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) { const t1 = (h + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0; h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0 }
      [a, bb, c, d, e, f, g, h].forEach((v, i) => H[i] = (H[i] + v) | 0);
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, "0")).join("");
  }

  const api = { CFG, parse, merge, analyze, quizVersion, progresCSV, soalCSV, stuckCSV, sha256, STATUS: ST };
  root.GLDH = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
