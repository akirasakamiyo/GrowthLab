/* pemandu pelajaran (revisi 2026-11-06): hint MELAYANG di dekat bagian yang belum dikerjakan.
   Muncul bila pengguna lama di pelajaran (60 dtk) atau menekan "Pelajaran berikut" sebelum selesai.
   Gelembung menunjuk langkah berikutnya (aktivitas, soal yang belum dijawab, tombol Tandai selesai);
   bila bagian itu di luar layar, muncul pil di tepi layar untuk melompat ke sana. */
(() => {
  const DELAY = 60000, SNOOZE = 120000;
  const $ = s => document.querySelector(s);
  let key = null, t0 = 0, timer = 0, snoozeUntil = 0, read = false, tried = false, show = false, reason = "", raf = 0, tgtEl = null;
  const doneSet = () => { try { return new Set(JSON.parse(localStorage.getItem("mer-done") || "[]")) } catch (e) { return new Set() } };
  const isDone = () => key && doneSet().has(key);
  const LAB = "#lart section.lab:not(#cek)";
  const cekItems = () => [...document.querySelectorAll("#cek .tf-i")];
  const unanswered = () => cekItems().filter(x => !x.querySelector("button:disabled"));
  const steps = () => {
    const c = cekItems(), u = unanswered(), hasLab = !!$(LAB);
    return [
      ...(hasLab ? [{ id: "coba", ok: tried, el: () => $(LAB), t: "Coba yang ini dulu, yuk.", s: "Klik atau isi, lalu lihat hasilnya." }] : []),
      { id: "cek", ok: c.length > 0 && !u.length, el: () => u[0] || $("#cek"), t: "Yang ini belum dijawab, nih.", s: `Benar atau salah? (${c.length - u.length}/${c.length} beres)` },
      { id: "baca", ok: read, el: () => $("#lart .take"), t: "Baca sampai sini dulu.", s: "Ini poin utamanya." },
      { id: "tandai", ok: isDone(), el: () => $("#mark"), t: "Udah semua? Tandai selesai di sini.", s: "Pelajaran berikutnya langsung kebuka." }
    ];
  };
  /* elemen hint */
  const B = document.createElement("div"); B.className = "gph"; B.setAttribute("role", "status"); B.setAttribute("aria-live", "polite");
  const P = document.createElement("button"); P.type = "button"; P.className = "gph-pill";
  document.body.append(B, P);
  const BULB_LAMA = `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="gph-glow" d="M12 1v2M4.5 4.5 6 6M19.5 4.5 18 6M2 12h2M20 12h2"/><path d="M8.5 15.5A6 6 0 1 1 15.5 15.5V18h-7z"/><path d="M9.5 21h5"/></g></svg>`;
  function jump(el) {
    if (!el) return; const y = el.getBoundingClientRect().top + scrollY - innerHeight * .35;
    try { window.__lenis ? __lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y, behavior: "smooth" }) } catch (e) { scrollTo(0, y) }
  }
  function paint() {
    const S = steps(), k = S.findIndex(s => !s.ok);
    if (tgtEl) tgtEl.classList.remove("gph-tgt");
    if (!show || k < 0 && reason !== "next") { B.classList.remove("on"); P.classList.remove("on"); tgtEl = null; return }
    if (k < 0) { show = false; B.classList.remove("on"); P.classList.remove("on"); return }
    const st = S[k], el = st.el(); tgtEl = el; if (!el) return;
    el.classList.add("gph-tgt");
    const nOk = S.filter(s => s.ok).length;
    B.innerHTML = `<span class="gph-tape" aria-hidden="true"></span><b>${st.t}</b><em>${st.s}</em>
      ${reason === "next" ? `<button type="button" class="gph-skip" data-h="skip">tetap lanjut →</button>` : ""}
      <button type="button" class="gph-x" data-h="x" aria-label="Sembunyikan hint">×</button>
      <svg class="gph-arrow" viewBox="0 0 60 60" aria-hidden="true"><path d="M48 6C50 26 38 42 14 50"/><path d="M24 54L13 50l6-10"/></svg>`;
    P.innerHTML = `<span class="gph-arr">↓</span><span class="gph-pre">Masih ada yang belum:</span> <b>${st.t.replace(/[.,].*$/, "")}</b>`;
    B.classList.add("on");
  }
  /* posisi mengikuti elemen target saat digulir */
  function place() {
    raf = requestAnimationFrame(place);
    if (!B.classList.contains("on") || !tgtEl) { P.classList.remove("on"); return }
    const r = tgtEl.getBoundingClientRect(), bw = B.offsetWidth, bh = B.offsetHeight, top0 = 92;
    const off = r.bottom < top0 + 20 || r.top > innerHeight - 40;
    B.classList.toggle("off", off); P.classList.toggle("on", off); P.classList.toggle("up", r.bottom < top0 + 20);
    if (off) return;
    const above = r.top - bh - 54 > top0;
    const x = Math.min(Math.max(12, r.left + Math.min(24, r.width * .1)), innerWidth - bw - 12);
    const y = above ? r.top - bh - 50 : Math.min(r.bottom + 50, innerHeight - bh - 12);
    B.style.transform = `translate(${x}px,${y}px)`; B.classList.toggle("below", !above);
    B.style.setProperty("--ax", Math.min(Math.max(22, r.left + 30 - x), bw - 30) + "px");
  }
  B.addEventListener("click", e => {
    const b = e.target.closest("[data-h]");
    if (!b) { const S = steps().find(s => !s.ok); S && jump(S.el()); return }
    if (b.dataset.h === "x") { show = false; snoozeUntil = Date.now() + SNOOZE; paint() }
    if (b.dataset.h === "skip") { show = false; paint(); const n = $("#nextl"); if (n) { n.dataset.gpOk = "1"; n.click(); delete n.dataset.gpOk } }
  });
  P.addEventListener("click", () => jump(tgtEl));
  function tick() {
    if (!key) return;
    const tk = $("#lart .take"); if (tk && tk.getBoundingClientRect().top < innerHeight * .9) read = true;
    if (!show && !isDone() && Date.now() - t0 > DELAY && Date.now() > snoozeUntil) { show = true; reason = "idle" }
    if (isDone()) show = false;
    paint();
  }
  function enter() {
    const m = location.hash.match(/^#\/lesson\/(\d+)-(\d+)/);
    clearInterval(timer); show = false; paint();
    if (!m) { key = null; return }
    key = m[1] + "-" + m[2]; t0 = Date.now(); read = false; tried = false; snoozeUntil = 0;
    timer = setInterval(tick, 1200);
  }
  document.addEventListener("click", e => { if (e.target.closest(LAB)) tried = true; if (show && e.target.closest("#lart")) setTimeout(paint, 60) }, true);
  document.addEventListener("input", e => { if (e.target.closest(LAB)) tried = true }, true);
  /* "Pelajaran berikut" sebelum langkahnya beres: munculkan hint di bagian yang belum */
  document.addEventListener("click", e => {
    const n = e.target.closest("#nextl"); if (!n || n.dataset.gpOk || isDone()) return;
    if (steps().filter(s => s.id !== "tandai").every(s => s.ok)) return;
    e.preventDefault(); e.stopImmediatePropagation(); show = true; reason = "next"; paint();
    const s = steps().find(x => !x.ok); s && jump(s.el());
  }, true);
  addEventListener("hashchange", enter);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && show) { show = false; snoozeUntil = Date.now() + SNOOZE; paint() } });
  /* untuk pratinjau/pengujian: GLPemandu.show() menampilkan hint tanpa menunggu */
  window.GLPemandu = { show: (r = "idle") => { show = true; reason = r; paint() } };
  place(); enter();
})();
