/* ==================================================================
   KIRIM PROGRES LIVE KE DOSEN (opt-in), 2026-11-24
   - Mati sampai peserta menyalakannya di Pengaturan (butuh nama + kode kelas). Tanpa login.
   - Yang dikirim: nama, id perangkat (gl-log), event lesson_done dan quiz dari log Fase 5
     (termasuk jawaban per soal), daftar pelajaran selesai, dan tanda "aktif" sekali sehari.
   - Offline: tidak ada yang hilang; event dikirim saat online (penunjuk waktu terakhir terkirim).
   - Penerima: Google Apps Script milik pengelola (tools/apps-script/Code.gs). Kosongkan URL = fitur mati.
   Status di localStorage "gl-sync".
   ================================================================== */
window.GLSYNC = (() => {
  /* URL web app Apps Script (…/exec). Diisi pengelola setelah deploy, lihat tools/apps-script/PASANG.md */
  const URL_WEB_APP = "";
  const url = window.GLSYNC_URL_TEST || URL_WEB_APP;
  const KEY = "gl-sync", TYPES = { lesson_done: 1, quiz: 1 }, BATCH = 150;
  const st = () => { try { return Object.assign({ on: false, kelas: "", sentT: 0, snap: "", aktif: "", last: 0, err: "" }, JSON.parse(localStorage.getItem(KEY) || "{}")) } catch (e) { return { on: false, kelas: "", sentT: 0, snap: "", aktif: "", last: 0, err: "" } } };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch (e) {} };
  const nama = () => { try { return String((JSON.parse(localStorage.getItem("gl-ui") || "{}") || {}).nama || "").trim() } catch (e) { return "" } };
  const day = t => new Date(t).toISOString().slice(0, 10);
  const ERR = { kelas: "Kode kelas tidak dikenali. Cek lagi ke dosenmu.", nama: "Isi namamu dulu di bagian Profil.", laju: "Terlalu banyak kiriman. Dicoba lagi nanti.", pid: "Catatan belajar belum siap.", jaringan: "Belum terkirim (tidak ada internet). Dikirim otomatis saat online." };
  let busy = false, timer = 0;
  const notify = () => { try { document.dispatchEvent(new CustomEvent("gl-sync")) } catch (e) {} };

  async function post(body) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), redirect: "follow" });
    return r.json();
  }

  /* kirim semua event baru; dipanggil setelah aktivitas, saat dimuat, dan saat kembali online */
  async function sync() {
    const s = st();
    if (!url || !s.on || busy) return;
    if (!nama()) { s.err = ERR.nama; save(s); notify(); return }
    if (!navigator.onLine) { s.err = ERR.jaringan; save(s); notify(); return }
    const L = window.GLG && GLG.storage.get("gl-log");
    if (!L || !L.device) return;
    busy = true;
    try {
      const now = Date.now(), done = (GLG.storage.get("mer-done") || []).slice().sort(), snap = done.join(",");
      const evs = L.events.filter(e => TYPES[e.type] && e.t > s.sentT).map(e => ({ t: e.t, type: e.type, data: e.data }));
      const extra = [];
      if (snap !== s.snap) extra.push({ t: now, type: "snapshot", data: { done } });
      if (s.aktif !== day(now)) extra.push({ t: now, type: "aktif", data: {} });
      const qv = window.GLDH && typeof GLD !== "undefined" ? GLDH.quizVersion(GLD.QUIZ) : null;
      let all = [...evs, ...extra];
      if (!all.length) { s.err = ""; save(s); return }
      while (all.length) {
        const part = all.slice(0, BATCH);
        let r;
        try { r = await post({ op: "kirim", kelas: s.kelas, pid: L.device, nama: nama(), qv, ev: part }) } catch (e) { s.err = ERR.jaringan; break }
        if (!r || !r.ok) { s.err = ERR[r && r.err] || "Pengiriman ditolak server."; break }
        part.forEach(e => { if (TYPES[e.type]) s.sentT = Math.max(s.sentT, e.t); if (e.type === "snapshot") s.snap = snap; if (e.type === "aktif") s.aktif = day(now) });
        s.last = Date.now(); s.err = ""; all = all.slice(BATCH);
      }
      save(s);
    } finally { busy = false; notify() }
  }
  const later = (ms = 1500) => { clearTimeout(timer); timer = setTimeout(sync, ms) };

  /* nyalakan/matikan; menyalakan mengirim juga riwayat sebelumnya (sentT mulai dari 0 bila kelas berganti) */
  function set(on, kelas) {
    const s = st();
    if (kelas != null) { const k = String(kelas).trim().toUpperCase(); if (k !== s.kelas) { s.kelas = k; s.sentT = 0; s.snap = ""; s.aktif = "" } }
    s.on = !!on; s.err = ""; save(s); notify();
    if (s.on) later(100);
  }

  if (url) {
    /* GLG (gamifikasi + log) dimuat setelah file ini: berlangganan setelah halaman selesai dimuat */
    addEventListener("load", () => { if (window.GLG) { GLG.on("lesson", () => later()); GLG.on("quiz", () => later()) } later(3000) });
    addEventListener("online", () => later(500));
  }
  return { url, state: st, set, sync, later };
})();
