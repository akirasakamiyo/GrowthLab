/* pemandu pelajaran (2026-11-06): bila pengguna lama di satu pelajaran (atau menekan "Pelajaran berikut")
   tetapi belum menyelesaikan isinya, muncul kartu interaktif berisi langkah menuju pelajaran berikutnya.
   Setiap langkah tercentang otomatis dan bisa diklik untuk melompat ke bagiannya. */
(() => {
  const DELAY = 60000, SNOOZE = 120000;
  const $ = s => document.querySelector(s);
  let card = null, key = null, t0 = 0, timer = 0, snoozeUntil = 0, read = false, tried = false, seen = new Set(), raf = 0;
  const art = () => $("#lart");
  const doneSet = () => { try { return new Set(JSON.parse(localStorage.getItem("mer-done") || "[]")) } catch (e) { return new Set() } };
  const isDone = () => key && doneSet().has(key);
  const cekState = () => { const g = [...document.querySelectorAll("#cek .lab-seg.tf")]; return { n: g.length, a: g.filter(x => x.querySelector("button:disabled")).length } };
  const hasLab = () => !!document.querySelector("#lart section.lab:not(#cek)");
  const steps = () => {
    const c = cekState();
    return [
      { id: "baca", t: "Baca materinya sampai bawah", ok: read, go: () => jump("#lart .take") },
      ...(hasLab() ? [{ id: "coba", t: "Coba aktivitas “Coba sendiri”", ok: tried, go: () => jump("#lart section.lab:not(#cek)") }] : []),
      { id: "cek", t: `Jawab semua Cek pemahaman (${c.a}/${c.n})`, ok: c.n > 0 && c.a >= c.n, go: () => jump("#cek") },
      { id: "tandai", t: "Tekan “Tandai selesai”", ok: isDone(), go: () => jump("#mark") }
    ];
  };
  /* lompat ke bagian + sorotan berdenyut */
  function jump(sel) {
    const el = $(sel); if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY - innerHeight * .28;
    try { window.__lenis ? __lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y, behavior: "smooth" }) } catch (e) { scrollTo(0, y) }
    el.classList.remove("gp-hl"); void el.offsetWidth; el.classList.add("gp-hl"); setTimeout(() => el.classList.remove("gp-hl"), 2600);
  }
  const MASKOT = `<svg class="gp-m" viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="26" r="11"/><path d="M14 60c1-11 7-17 16-17s15 6 16 17"/><circle cx="26" cy="25" r="1.2" fill="currentColor"/><circle cx="34" cy="25" r="1.2" fill="currentColor"/><path d="M26 31c2 2 6 2 8 0"/><g class="gp-arm"><path d="M44 48c4-4 6-10 6-16"/></g><g class="gp-bulb"><path stroke="#ffc83d" d="M50 6a7 7 0 0 1 4 12.5V22h-8v-3.5A7 7 0 0 1 50 6z"/><path stroke="#ffc83d" d="M47 25h6M50 0v-3M58 5l2-2M42 5l-2-2"/></g></g></svg>`;
  function render(reason) {
    if (!card) {
      card = document.createElement("aside"); card.className = "gp"; card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "Pemandu pelajaran");
      document.body.appendChild(card);
      card.addEventListener("click", e => {
        const b = e.target.closest("[data-gp]"); if (!b) return; const a = b.dataset.gp;
        if (a === "x") hide(true);
        else if (a === "snooze") hide(true);
        else if (a === "next") { const s = steps().find(x => !x.ok); s && s.go() }
        else if (a === "skip") { hide(false); const n = $("#nextl"); if (n) { n.dataset.gpOk = "1"; n.click(); delete n.dataset.gpOk } }
        else if (a === "lanjut") { hide(false); const n = $("#nextl"); if (n) { n.dataset.gpOk = "1"; n.click(); delete n.dataset.gpOk } }
        else if (a.startsWith("s:")) { const s = steps().find(x => x.id === a.slice(2)); s && s.go() }
      });
    }
    const S = steps(), nOk = S.filter(s => s.ok).length, all = nOk === S.length, C = 2 * Math.PI * 16;
    const head = all ? "Mantap, pelajaran ini beres!" : reason === "next" ? "Eits, ada yang belum selesai" : "Butuh bantuan untuk lanjut?";
    const sub = all ? "Kamu sudah siap ke pelajaran berikutnya." : "Selesaikan langkah ini supaya pelajaran berikutnya terbuka. Klik langkahnya untuk langsung ke bagiannya.";
    card.innerHTML = `<button type="button" class="gp-x" data-gp="x" aria-label="Tutup pemandu">×</button>
      <div class="gp-h">${MASKOT}<div><b>${head}</b><small>${sub}</small></div>
        <span class="gp-ring" aria-label="${nOk} dari ${S.length} langkah selesai"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" class="bg"/><circle cx="20" cy="20" r="16" class="fg" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - nOk / S.length)).toFixed(1)}"/></svg><i>${nOk}/${S.length}</i></span></div>
      <ol class="gp-l">${S.map((s, k) => `<li class="${s.ok ? "ok" : ""}${!s.ok && S.slice(0, k).every(x => x.ok) ? " now" : ""}"><button type="button" data-gp="s:${s.id}"><span class="gp-c" aria-hidden="true">${s.ok ? "✓" : k + 1}</span><span>${s.t}</span><span class="gp-go" aria-hidden="true">→</span></button></li>`).join("")}</ol>
      <div class="gp-a">${all ? `<button type="button" class="btn p" data-gp="lanjut">Pelajaran berikutnya →</button>`
        : `<button type="button" class="btn p" data-gp="next">Tunjukkan yang belum</button>${reason === "next" ? `<button type="button" class="btn" data-gp="skip">Tetap lanjut</button>` : `<button type="button" class="btn" data-gp="snooze">Nanti saja</button>`}`}</div>`;
    card.dataset.reason = reason || "";
    requestAnimationFrame(() => card.classList.add("on"));
  }
  function hide(snooze) { if (snooze) snoozeUntil = Date.now() + SNOOZE; if (card) card.classList.remove("on") }
  const visible = () => card && card.classList.contains("on");
  /* pantau keadaan halaman */
  function tick() {
    if (!key) return;
    const a = art(); if (a) { const r = a.getBoundingClientRect(); if (r.bottom < innerHeight * 1.15) read = true }
    if (visible()) render(card.dataset.reason);
    else if (!isDone() && Date.now() - t0 > DELAY && Date.now() > snoozeUntil) render("idle");
  }
  function enter() {
    const m = location.hash.match(/^#\/lesson\/(\d+)-(\d+)/);
    clearInterval(timer); hide(false);
    if (!m) { key = null; return }
    key = m[1] + "-" + m[2]; t0 = Date.now(); read = false; tried = false; snoozeUntil = 0;
    timer = setInterval(tick, 1500);
  }
  /* interaksi di aktivitas "Coba sendiri" */
  document.addEventListener("click", e => { if (e.target.closest("#lart section.lab:not(#cek)")) { tried = true; if (visible()) render(card.dataset.reason) } else if (e.target.closest("#cek") && visible()) setTimeout(() => render(card.dataset.reason), 50) }, true);
  document.addEventListener("input", e => { if (e.target.closest("#lart section.lab:not(#cek)")) tried = true }, true);
  /* "Pelajaran berikut" sebelum langkahnya beres: tampilkan pemandu dulu */
  document.addEventListener("click", e => {
    const n = e.target.closest("#nextl"); if (!n || n.dataset.gpOk || isDone()) return;
    const S = steps().filter(s => s.id !== "tandai"); if (S.every(s => s.ok)) return;
    e.preventDefault(); e.stopImmediatePropagation(); render("next");
  }, true);
  addEventListener("hashchange", enter);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && visible()) hide(true) });
  enter();
})();
