/* ==================================================================
   GAMIFIKASI · konfigurasi (data saja, tanpa logika)
   Ubah angka XP / level di sini. Penjelasan lengkap: GAMIFICATION.md
   ================================================================== */
window.GLG = window.GLG || {};
GLG.CFG = {
  schemaVersion: 1,                         // versi struktur localStorage "gl-gami"
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
  tiers: [[1, "Pemula"], [3, "Calon Kandidat"], [5, "Siap Interview"], [7, "Job Ready"]]
};
