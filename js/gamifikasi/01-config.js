/* ==================================================================
   GAMIFIKASI · konfigurasi (data saja, tanpa logika)
   Ubah angka XP / level di sini. Penjelasan lengkap: GAMIFICATION.md
   ================================================================== */
window.GLG = window.GLG || {};
GLG.CFG = {
  schemaVersion: 2,                         // versi struktur localStorage "gl-gami" (2: + badges, days)
  xp: {
    lesson: { xp: 20 },                     // satu kali per pelajaran
    quiz:   { bab: 30, all: 50, perfect: 15 },  // XP = bobot × skor/100 (+ bonus bila 100)
    dnd:    { base: 15, perfect: 5 },       // XP = base × benar/n (+ bonus bila semua benar)
    sim:    { base: 80, bonusAt: 85, bonus: 10 },
    /* Percobaan ulang hanya memberi XP untuk PENINGKATAN skor (selisih dari XP yang sudah didapat
       untuk aktivitas itu), dikali faktor berikut: percobaan ke-1, ke-2, ke-3, ke-4 dan seterusnya. */
    retry: [1, 0.6, 0.35, 0.2]
  },
  /* XP kumulatif untuk mencapai level n = a × (n − 1)^p  →  L2 55, L3 156, L4 286, L5 440, L6 615, L7 808 */
  level: { a: 55, p: 1.5 },
  /* sebutan level bertema karier: [level minimum, nama] */
  tiers: [[1, "Pemula"], [3, "Calon Kandidat"], [5, "Siap Interview"], [7, "Job Ready"]],

  /* ---------- badge (Fase 2) ----------
     Setiap badge: id unik, nama, syarat (teks untuk pengguna), ikon (karakter), warna, xp, rule.
     Jenis rule yang tersedia (lihat GLG.badgeRule di 03-rules.js):
       chapter {i}        semua pelajaran bab ke-i selesai
       quizScore {min}    skor kuis (mode apa pun) minimal `min`
       quizPass {m}       lulus kuis mode m (batas lulus = GLD.PASS_MCQ)
       dndPerfect {n}     n set drag & drop dengan semua jawaban benar
       simCount {n}       n kasus simulasi tamat
       simScore {min}     skor salah satu simulasi minimal `min`
       weeks {n}          n minggu memenuhi target streak (lihat streak.target)
       final {}           nilai akhir terbuka (semua latihan selesai)                         */
  badges: [
    { id: "bab1", name: "Pengelola Diri", req: "Selesaikan semua pelajaran Bab 1 Self-Management", icon: "1", color: "#ff6b3d", xp: 15, rule: { type: "chapter", i: 0 } },
    { id: "bab2", name: "Peka Emosi", req: "Selesaikan semua pelajaran Bab 2 Emotional Intelligence", icon: "2", color: "#e0a400", xp: 15, rule: { type: "chapter", i: 1 } },
    { id: "bab3", name: "Pemikir Tajam", req: "Selesaikan semua pelajaran Bab 3 Thinking Skill", icon: "3", color: "#2a56f5", xp: 15, rule: { type: "chapter", i: 2 } },
    { id: "lulus", name: "Lulus Uji Konsep", req: "Lulus kuis Gabungan (skor minimal 70)", icon: "✓", color: "#1fa463", xp: 20, rule: { type: "quizPass", m: "all" } },
    { id: "sempurna", name: "Skor Sempurna", req: "Dapatkan skor 100 di kuis mana saja", icon: "★", color: "#d4a000", xp: 15, rule: { type: "quizScore", min: 100 } },
    { id: "teliti", name: "Teliti", req: "Jawab semua kartu benar di 6 set drag & drop", icon: "◆", color: "#8a4fff", xp: 15, rule: { type: "dndPerfect", n: 6 } },
    { id: "kasus1", name: "Pemecah Kasus", req: "Tamatkan satu simulasi kasus", icon: "?", color: "#14b8a6", xp: 10, rule: { type: "simCount", n: 1 } },
    { id: "kasus3", name: "Siap Lapangan", req: "Tamatkan ketiga simulasi kasus", icon: "⚑", color: "#0e8c7e", xp: 20, rule: { type: "simCount", n: 3 } },
    { id: "unggul", name: "Keputusan Unggul", req: "Raih skor minimal 85 di salah satu simulasi", icon: "▲", color: "#ff4f8b", xp: 15, rule: { type: "simScore", min: 85 } },
    { id: "konsisten", name: "Konsisten", req: "Penuhi target belajar mingguan (3 hari dalam seminggu)", icon: "↻", color: "#ff8a00", xp: 10, rule: { type: "weeks", n: 1 } },
    { id: "tekun", name: "Tekun", req: "Penuhi target belajar mingguan selama 3 minggu", icon: "≡", color: "#c25e00", xp: 20, rule: { type: "weeks", n: 3 } },
    { id: "tuntas", name: "Tuntas", req: "Selesaikan kuis, drag & drop, dan simulasi sampai nilai akhir terbuka", icon: "♛", color: "#1b1740", xp: 25, rule: { type: "final" } }
  ],

  /* ---------- streak mingguan (Fase 2) ----------
     Minggu dihitung Senin–Minggu menurut jam perangkat. "Hari belajar" = hari ada aktivitas
     (pelajaran selesai, kuis, drag & drop, atau simulasi). Minggu "terpenuhi" bila hari belajar ≥ target.
     Hari libur: setiap `earnEvery` minggu terpenuhi memberi 1 jatah libur (maks `maxFreeze`);
     minggu yang terlewat otomatis ditutup jatah libur sehingga streak tidak putus.            */
  streak: { target: 3, earnEvery: 2, maxFreeze: 2 }
};
