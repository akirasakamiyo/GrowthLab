/* ==================================================================
   GAMIFIKASI · tampilan (chip XP di navbar, kartu level di halaman Materi,
   notifikasi +XP, naik level, panel detail & toggle "Mode gamifikasi")
   Semua elemen berkelas .gx dan disembunyikan oleh html.gx-off.
   ================================================================== */
(() => {
  const G = window.GLG, $ = s => document.querySelector(s), RM = () => matchMedia("(prefers-reduced-motion:reduce)").matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nf = n => n.toLocaleString("id-ID");
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';

  /* ---------- data awal ---------- */
  if (G.isNew()) { G.backfill(); G.backfillDays() }
  else if (G.state().needDays) G.backfillDays();
  /* badge yang syaratnya sudah terpenuhi sebelum modul ini ada: dicatat diam-diam */
  G.checkBadges();
  G.state().seenLevel = Math.max(G.state().seenLevel || 1, G.info().level); G.save();
  const on = () => G.state().on !== false;
  const applyOn = () => document.documentElement.classList.toggle("gx-off", !on());

  /* ---------- elemen tetap ---------- */
  const links = $("#links"), pill = links && links.querySelector("a.pill");
  const chip = document.createElement("button");
  chip.type = "button"; chip.className = "gx gx-chip"; chip.id = "gx-chip";
  if (pill) links.insertBefore(chip, pill);

  const panel = $("#ring") && $("#ring").closest(".panel");
  const card = document.createElement("div");
  card.className = "gx gx-card"; card.id = "gx-card";
  if (panel) panel.appendChild(card);

  const live = document.createElement("div");
  live.className = "gx gx-live"; live.setAttribute("aria-live", "polite"); live.setAttribute("role", "status");
  document.body.appendChild(live);

  /* saat mode nonaktif: catatan kecil di kartu Progres agar mode bisa dinyalakan lagi */
  const offNote = document.createElement("p");
  offNote.className = "gx-offnote";
  offNote.innerHTML = 'Mode gamifikasi nonaktif. <button type="button" data-gx-open>Atur</button>';
  if (panel) panel.appendChild(offNote);

  /* ---------- streak ---------- */
  const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const weekDots = s => `<span class="gx-week" aria-hidden="true">${s.weekDays.map((d, i) => `<i class="${d.on ? "on" : ""}${d.today ? " td" : ""}" title="${HARI[i]}">${HARI[i][0]}</i>`).join("")}</span>`;
  const streakLine = s => {
    const w = `Minggu ini ${Math.min(s.thisWeek, 7)}/${s.target} hari belajar`;
    if (s.thisWeek >= s.target) return `${w} · target tercapai`;
    if (s.cur > 0) return `${w} · streak ${s.cur} minggu`;
    if (s.broke) return `${w} · yuk mulai lagi minggu ini`;
    return w;
  };

  /* ---------- render ---------- */
  const bar = p => `<span class="gx-bar" aria-hidden="true"><i style="--w:${Math.max(0, Math.min(1, p))}"></i></span>`;
  function render() {
    const I = G.info();
    chip.innerHTML = `${STAR}<b>Lv ${I.level}</b><span>${nf(I.xp)} XP</span>`;
    chip.setAttribute("aria-label", `Level ${I.level}, ${I.tier}, ${I.xp} XP. Buka detail`);
    card.innerHTML = `<div class="gx-card-h">${STAR}<div><span class="mono">Level ${I.level} · ${esc(I.tier)}</span><b>${nf(I.xp)} XP</b></div>
      <button type="button" class="chip" data-gx-open>Detail</button></div>${bar(I.p)}
      <small>${nf(I.to - I.xp)} XP lagi ke Level ${I.level + 1}${G.tier(I.level + 1) !== I.tier ? ` · ${esc(G.tier(I.level + 1))}` : ""}</small>
      <div class="gx-card-s">${weekDots(G.streak())}<span>${streakLine(G.streak())}</span></div>
      <small>Badge ${G.badgeList().filter(b => b.got).length}/${G.CFG.badges.length}</small>`;
  }

  /* ---------- notifikasi ---------- */
  function toast(html, cls, ms) {
    if (!on()) return;
    const t = document.createElement("div");
    t.className = "gx-toast " + (cls || ""); t.innerHTML = html;
    live.appendChild(t);
    while (live.children.length > 3) live.firstChild.remove();
    requestAnimationFrame(() => t.classList.add("in"));
    setTimeout(() => { t.classList.remove("in"); setTimeout(() => t.remove(), RM() ? 0 : 400) }, ms || 3200);
  }
  const medal = b => `<span class="gx-medal${b.got === false ? " lock" : ""}" style="--bc:${esc(b.color)}" aria-hidden="true">${b.got === false ? "🔒︎" : esc(b.icon)}</span>`;
  function show(r, sb) {
    render();
    if (!r) return;
    let delay = 0;
    if (r.e && r.e.xp) {
      toast(`<b>+${r.e.xp} XP</b><span>${esc(r.e.meta.label || "")}</span>`, "", 3200);
      if (!RM()) { chip.classList.remove("bump"); void chip.offsetWidth; chip.classList.add("bump") }
    }
    (r.badges || []).forEach(b => { delay += 700; setTimeout(() => toast(`${medal(b)}<div><b>Badge baru: ${esc(b.name)}</b><span>${esc(b.req)}${b.e && b.e.xp ? ` · +${b.e.xp} XP` : ""}</span></div>`, "bdg", 5200), delay) });
    const sa = G.streak();
    if (sb && sb.thisWeek < sa.target && sa.thisWeek >= sa.target) { delay += 700; setTimeout(() => toast(`<div><b>Target minggu ini tercapai!</b><span>${sa.target} hari belajar minggu ini. Mantap, pertahankan ritmenya.</span></div>`, "bdg", 4600), delay) }
    const S = G.state();
    if (r.after.level > (S.seenLevel || 1)) {
      S.seenLevel = r.after.level; G.save();
      setTimeout(() => toast(`${STAR}<b>Naik ke Level ${r.after.level}!</b><span>Sekarang kamu: ${esc(r.after.tier)}</span>`, "lvl", 5200), delay + 700);
    }
  }
  ["lesson", "quiz", "dnd", "sim"].forEach(t => G.on(t, d => { const sb = G.streak(); show(G.award(t, d), sb) }));

  /* ---------- panel detail + toggle ---------- */
  function streakHTML(s) {
    const msg = s.thisWeek >= s.target ? "Target minggu ini sudah tercapai. Hari belajar tambahan tetap dihitung."
      : s.broke ? "Minggu lalu terlewat, nggak apa-apa. Belajar itu maraton, bukan sprint. Yuk mulai lagi minggu ini."
      : `${s.target - s.thisWeek} hari belajar lagi untuk memenuhi target minggu ini.`;
    return `<section class="gx gx-sec" aria-labelledby="gx-st"><span class="mono" id="gx-st">Streak mingguan</span>
      <div class="gx-streak">${weekDots(s)}<div><b>${Math.min(s.thisWeek, 7)}/${s.target} hari minggu ini</b><span>${s.cur} minggu berturut-turut · terbaik ${s.best}</span></div></div>
      <p>${msg}</p>
      <p class="gx-how">Hari libur tersimpan: <b>${s.freeze}</b>. Setiap ${G.CFG.streak.earnEvery} minggu target tercapai memberi 1 hari libur (maks ${G.CFG.streak.maxFreeze}); minggu yang terlewat otomatis memakai hari libur supaya streak tidak putus.</p></section>`;
  }
  function badgesHTML() {
    const L = G.badgeList(), n = L.filter(b => b.got).length;
    return `<section class="gx gx-sec" aria-labelledby="gx-bt"><span class="mono" id="gx-bt">Koleksi badge · ${n}/${L.length}</span>
      <ul class="gx-badges">${L.map(b => `<li class="${b.got ? "got" : ""}">${medal(b)}<div><b>${esc(b.name)}</b><small>${b.got ? "Didapat " + new Date(b.at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : esc(b.req)}</small>${!b.got && b.max > 1 ? `<span class="gx-bp"><i style="--w:${b.cur / b.max}"></i></span><small>${b.cur}/${b.max}</small>` : ""}</div><span class="sr">${b.got ? "sudah didapat" : "terkunci"}</span></li>`).join("")}</ul></section>`;
  }
  let dlg = null, back = null;
  function open() {
    close(); back = document.activeElement;
    const I = G.info(), C = G.CFG;
    const recent = G.state().ledger.filter(e => e.xp > 0).slice(-6).reverse();
    dlg = document.createElement("div");
    dlg.className = "gx-dlg"; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-labelledby", "gx-dt");
    dlg.innerHTML = `<div class="gx-dlg-in">
      <button type="button" class="gx-x" aria-label="Tutup">×</button>
      <span class="mono">Gamifikasi</span><h2 id="gx-dt">Perjalanan karier kamu</h2>
      <div class="gx gx-sum">${STAR}<div><b>Level ${I.level} · ${esc(I.tier)}</b><span>${nf(I.xp)} XP · ${nf(I.to - I.xp)} XP lagi ke Level ${I.level + 1}</span></div></div>
      <div class="gx">${bar(I.p)}</div>
      <ol class="gx gx-ladder">${C.tiers.map(([m, nm], i) => { const nx = C.tiers[i + 1], hit = I.level >= m;
        return `<li class="${hit ? "on" : ""}"><span aria-hidden="true">${hit ? "✓" : ""}</span><b>${esc(nm)}</b><small>Level ${m}${nx ? "–" + (nx[0] - 1) : "+"} · mulai ${nf(G.need(m))} XP</small></li>` }).join("")}</ol>
      ${streakHTML(G.streak())}
      ${badgesHTML()}
      <div class="gx"><span class="mono">XP terakhir</span>${recent.length ? `<ul class="gx-rec">${recent.map(e => `<li><b>+${e.xp}</b> ${esc(e.meta.label || e.type)}${e.meta.awal ? " <small>(progres sebelumnya)</small>" : ""}</li>`).join("")}</ul>` : "<p>Belum ada XP. Selesaikan pelajaran atau latihan untuk mulai.</p>"}
      <p class="gx-how">XP didapat dari pelajaran yang selesai dan skor latihan. Mengulang latihan hanya menambah XP bila skormu naik.</p></div>
      <div class="gx-set"><div><b id="gx-tl">Mode gamifikasi</b><small>Matikan bila kamu ingin belajar tanpa XP dan level. Progres belajar tetap tersimpan.</small></div>
        <button type="button" class="gx-sw" role="switch" aria-checked="${on()}" aria-labelledby="gx-tl"><i></i><span>${on() ? "Aktif" : "Nonaktif"}</span></button></div>
    </div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener("click", e => {
      if (e.target === dlg || e.target.closest(".gx-x")) return close();
      if (e.target.closest(".gx-sw")) { G.state().on = !on(); G.save(); applyOn(); render(); open() }
    });
    dlg.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close() }
      if (e.key === "Tab") { const f = [...dlg.querySelectorAll("button")], a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() } }
    });
    dlg.querySelector(".gx-x").focus();
    try { window.__lenis && window.__lenis.stop() } catch (e) {}
  }
  function close() {
    if (!dlg) return; dlg.remove(); dlg = null;
    try { window.__lenis && window.__lenis.start() } catch (e) {}
    if (back && back.focus) back.focus();
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-gx-open],#gx-chip"); if (b) { e.preventDefault(); open() } });
  G.open = open;

  applyOn(); render();
})();
