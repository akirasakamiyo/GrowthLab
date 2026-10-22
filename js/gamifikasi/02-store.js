/* ==================================================================
   GAMIFIKASI · event bus, lapisan penyimpanan, ledger XP
   - GLG.emit(tipe, data) dipanggil kode lama di titik sambung (pelajaran selesai, kuis, drag & drop, simulasi).
   - GLG.storage adalah satu-satunya tempat yang menyentuh localStorage: ganti objek ini untuk pindah ke backend.
   - Ledger (daftar event XP) = sumber kebenaran. Total XP & level selalu dihitung ulang dari ledger.
   ================================================================== */
(() => {
  const G = window.GLG;

  /* event bus kecil */
  const L = {};
  G.on = (t, f) => (L[t] = L[t] || []).push(f);
  G.emit = (t, d) => (L[t] || []).forEach(f => { try { f(d) } catch (e) { console.error("[gamifikasi]", e) } });

  /* penyimpanan: localStorage, jatuh ke memori bila diblokir (mis. Safari privat) */
  const mem = {};
  G.storage = {
    get(k) { try { const v = localStorage.getItem(k); return v == null ? (mem[k] ?? null) : JSON.parse(v) } catch (e) { return mem[k] ?? null } },
    set(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); return true } catch (e) { return false } }
  };

  /* ganti penyimpanan (mis. adapter Supabase/Firebase) dengan objek { get(key), set(key, value) } yang sinkron.
     Adapter async bisa memakai cache lokal ini lalu menyinkronkan di belakang. Panggil sebelum 04-ui.js dimuat. */
  G.useStorage = adapter => { if (adapter && typeof adapter.get === "function" && typeof adapter.set === "function") { G.storage = adapter; S = null } };

  const KEY = "gl-gami";
  const fresh = () => ({ schemaVersion: G.CFG.schemaVersion, on: true, ledger: [], att: {}, seenLevel: 1, badges: {}, days: [], created: Date.now() });
  /* migrasi skema: MIG[n] mengubah data versi n menjadi n+1. Data lama tidak pernah ditimpa, hanya dilengkapi. */
  const MIG = {
    1: s => { s.badges = s.badges || {}; s.days = s.days || []; s.needDays = true; s.schemaVersion = 2 }   // Fase 2: badge & streak
  };
  const migrate = s => { while (s.schemaVersion < G.CFG.schemaVersion && MIG[s.schemaVersion]) MIG[s.schemaVersion](s); return s };
  const valid = s => s && typeof s === "object" && Array.isArray(s.ledger) && typeof s.schemaVersion === "number";

  let S = null, isNew = false;
  G.state = () => {
    if (S) return S;
    const r = G.storage.get(KEY);
    if (valid(r)) { S = migrate(r); const f = fresh(); for (const k in f) if (!(k in S)) S[k] = f[k] }
    else { S = fresh(); isNew = true }
    return S;
  };
  G.isNew = () => (G.state(), isNew);
  G.save = () => G.storage.set(KEY, S);

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  G.has = key => G.state().ledger.some(e => e.key === key);
  /* tambah event XP; idempotencyKey yang sama tidak pernah memberi reward dua kali */
  G.add = (type, xp, key, meta) => {
    if (G.has(key)) return null;
    const e = { id: uid(), type, xp: Math.max(0, Math.round(xp)), t: Date.now(), key, meta: meta || {} };
    G.state().ledger.push(e); G.save(); return e;
  };
})();
