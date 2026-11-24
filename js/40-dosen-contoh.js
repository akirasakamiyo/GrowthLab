/* ==================================================================
   DASHBOARD DOSEN, DATA CONTOH (2026-11-24)
   HANYA untuk demo sebelum laporan asli terkumpul. Tidak pernah disimpan dan tidak
   tercampur dengan laporan asli (dashboard menampilkan pita "Data contoh").
   Matikan: set GLDOSEN_DEMO = false di bawah (tombol "Coba dengan data contoh" hilang),
   atau hapus file ini beserta <script>-nya di index.html.
   Data dibuat dalam format laporan asli (growthlab-log v2), jadi melewati jalur baca yang sama.
   ================================================================== */
(function (root) {
  root.GLDOSEN_DEMO = true;
  const DAY = 864e5;
  /* nama rekaan untuk demo; satu sengaja sangat panjang untuk menguji tampilan */
  const NAMA = ["Ayu Lestari", "Bima Pratama", "Citra Maharani", "Dimas Saputra", "Eka Wulandari", "Fajar Nugroho", "Gita Anggraini", "Hendra Wijaya", "Indah Permatasari", "Joko Santoso",
    "Kartika Sari", "Lukman Hakim", "Maya Rahmawati", "Nanda Putri", "Oki Firmansyah", "Putri Ayuningtyas", "Rizky Ramadhan", "Sinta Dewi", "Taufik Hidayat", "Utari Kusuma",
    "Vina Oktaviani", "Wahyu Kurniawan", "Yoga Aditya", "Zahra Nurul Fitriani Kusumawardhani Putri Ramadhani"];
  /* skenario: [jumlah pelajaran selesai, profil kemampuan 0..1, hari sejak aktif terakhir, pola kuis] */
  const SK = [
    [15, .95, 1, "lulus"], [15, .9, 2, "lulus"], [15, .85, 0, "lulus"], [15, .88, 3, "lulus"], [15, .8, 5, "lulus"],
    [12, .75, 1, "jalan"], [10, .7, 2, "jalan"], [9, .8, 0, "jalan"], [7, .65, 4, "jalan"], [6, .7, 1, "jalan"], [5, .75, 2, "jalan"], [4, .6, 3, "jalan"], [3, 0, 1, "nol"], [11, .72, 6, "jalan"],
    [8, .6, 12, "jalan"], [5, .55, 20, "jalan"],          // stuck: tidak aktif
    [10, .35, 1, "gagal3"], [6, .3, 2, "gagal3"],          // stuck: 3x gagal berturut-turut
    [9, .4, 3, "gagal2"], [5, .45, 1, "gagal2"],           // stuck: selalu di bawah batas lulus
    [0, 0, 0, "belum"], [0, 0, 0, "belum"], [0, 0, 0, "belum"], [0, 0, 0, "belum"]];

  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

  function make(GLD, now) {
    const ch = GLD.COURSE.chapters, Q = GLD.QUIZ, pass = GLD.PASS_MCQ;
    /* tiga soal dibuat "sulit" dengan distraktor favorit, agar analisis soal punya contoh miskonsepsi */
    const hard = { [Q.findIndex(x => x.b === 0)]: 1, [Q.findIndex(x => x.b === 1) + 3]: 1, [Q.findIndex(x => x.b === 2) + 5]: 1 };
    const qv = root.GLDH ? root.GLDH.quizVersion(Q) : null;
    return SK.map((sk, n) => {
      const R = rng(1000 + n * 7919), [nl, skill, idle, pola] = sk;
      const keys = []; ch.forEach((c, i) => c.l.forEach((_, j) => keys.push(i + "-" + j)));
      const done = keys.slice(0, nl), last = now - idle * DAY - Math.floor(R() * 6) * 36e5;
      let t = last - (nl + 6) * DAY * .9; const ev = [], step = () => (t += DAY * (.4 + R() * .8));
      const sid = "s" + n;
      done.forEach(k => ev.push({ t: Math.min(step(), last), type: "lesson_done", sid, data: { k } }));
      const quiz = (i, target) => {
        const pool = Q.map((x, q) => [x, q]).filter(([x]) => x.b === i);
        const ans = pool.map(([x, q]) => {
          const p = hard[q] ? (R() < .15 ? x.a : (x.a + 1) % x.o.length) : R() < target ? x.a : R() < .1 ? -1 : (x.a + 1 + Math.floor(R() * (x.o.length - 1))) % x.o.length;
          return [q, p, p === x.a ? 1 : 0] });
        const ben = ans.filter(a => a[2]).length;
        ev.push({ t: Math.min(step(), last), type: "quiz", sid, data: { m: "b" + i, score: Math.round(ben / ans.length * 1000) / 10, benar: ben, n: ans.length, ans } });
        return ben / ans.length * 100;
      };
      ch.forEach((c, i) => {
        const babDone = done.filter(k => k.startsWith(i + "-")).length === c.l.length;
        if (!babDone || pola === "nol" || pola === "belum") return;
        if (pola === "gagal3" && i === ch.findIndex((cc, ii) => done.filter(k => k.startsWith(ii + "-")).length === cc.l.length)) { for (let x = 0; x < 3; x++) quiz(i, skill); return }
        if (pola === "gagal2" && i === 0) { quiz(i, skill); quiz(i, skill + .05); return }
        let s = quiz(i, skill), tries = 1; while (s < pass && tries < 3) { s = quiz(i, Math.min(1, skill + .15 * tries)); tries++ }
      });
      if (ev.length) ev.push({ t: last, type: "view", sid, data: { v: "#/latihan" } });
      ev.sort((a, b) => a.t - b.t);
      return { format: "growthlab-log", version: 2, exported: new Date(now - Math.floor(idle / 2) * DAY).toISOString(), demo: true,
        summary: { device: "contoh-" + String(n + 1).padStart(2, "0") }, peserta: { nama: NAMA[n], done }, qv,
        sessions: ev.length ? [{ id: sid, start: ev[0].t, end: last, events: ev.length }] : [], events: ev };
    });
  }
  root.GLDOSEN_CONTOH = { make };
})(typeof window !== "undefined" ? window : globalThis);
