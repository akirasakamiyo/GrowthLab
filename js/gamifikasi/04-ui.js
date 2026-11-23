/* ==================================================================
   GAMIFIKASI, tampilan (chip XP di navbar, kartu level di halaman Materi,
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
  const on = () => true; /* mode gamifikasi selalu aktif */
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

  /* ---------- streak ---------- */
  const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const weekDots = s => `<span class="gx-week" aria-hidden="true">${s.weekDays.map((d, i) => `<i class="${d.on ? "on" : ""}${d.today ? " td" : ""}" title="${HARI[i]}">${HARI[i][0]}</i>`).join("")}</span>`;
  const streakLine = s => {
    const w = `Minggu ini ${Math.min(s.thisWeek, 7)}/${s.target} hari belajar`;
    if (s.thisWeek >= s.target) return `${w}, target tercapai`;
    if (s.cur > 0) return `${w}, streak ${s.cur} minggu`;
    if (s.broke) return `${w}, yuk mulai lagi minggu ini`;
    return w;
  };

  /* ---------- quest, skill map, remedial (Fase 3) ---------- */
  const questLine = q => q.claimed ? "Misi minggu ini selesai" : `Misi minggu ini ${q.goals.filter(g => g.cur >= g.n).length}/${q.goals.length}`;
  const lesLink = k => { const [i, j] = k.split("-").map(Number); let t = k; try { t = GLD.COURSE.chapters[i].l[j].t } catch (e) {} return `<a href="#/lesson/${i}-${j}">Bab ${i + 1}, ${esc(t)}</a>` };
  function remedialHTML(r, m) {
    const mode = m === "all" ? "Gabungan" : "Bab " + (+m.slice(1) + 1);
    return `<p>Skor kuis ${mode} terakhir ${String(r.score).replace(".", ",")}. Coba ulang dulu pelajaran yang paling banyak salahnya:</p>
      <ul class="gx-rem">${r.les.map(x => `<li>${lesLink(x.k)} <small>${x.c} soal salah</small></li>`).join("")}</ul>`;
  }
  let sheetEl = null;
  function sheet(html) {
    if (!on()) return;
    if (sheetEl) sheetEl.remove();
    sheetEl = document.createElement("div");
    sheetEl.className = "gx gx-sheet"; sheetEl.setAttribute("role", "region"); sheetEl.setAttribute("aria-label", "Saran belajar ulang");
    sheetEl.innerHTML = `<button type="button" class="gx-x" aria-label="Tutup saran">×</button><span class="mono">Saran belajar ulang</span>${html}`;
    document.body.appendChild(sheetEl);
    sheetEl.addEventListener("click", e => { if (e.target.closest(".gx-x") || e.target.closest("a")) { sheetEl.remove(); sheetEl = null } });
  }

  /* ---------- render ---------- */
  const bar = p => `<span class="gx-bar" aria-hidden="true"><i style="--w:${Math.max(0, Math.min(1, p))}"></i></span>`;
  function render() {
    const I = G.info();
    chip.innerHTML = `${STAR}<b>Lv ${I.level}</b><span>${nf(I.xp)} XP</span>`;
    chip.setAttribute("aria-label", `Level ${I.level}, ${I.tier}, ${I.xp} XP. Buka detail`);
    card.innerHTML = `<div class="gx-card-h">${STAR}<div><span class="mono">Level ${I.level}, ${esc(I.tier)}</span><b>${nf(I.xp)} XP</b></div>
      <button type="button" class="chip" data-gx-open>Detail</button></div>${bar(I.p)}
      <small>${nf(I.to - I.xp)} XP lagi ke Level ${I.level + 1}${G.tier(I.level + 1) !== I.tier ? `, ${esc(G.tier(I.level + 1))}` : ""}</small>
      <div class="gx-card-s">${weekDots(G.streak())}<span>${streakLine(G.streak())}</span></div>
      <small>${questLine(G.quest())}, lencana ${G.badgeList().filter(b => b.got).length}/${G.CFG.badges.length}</small>`;
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
  const medal = b => `<span class="gx-medal${b.got === false ? " lock" : ""}" style="--bc:${esc(b.color)}" aria-hidden="true">${b.got === false ? '<i class="lk"></i>' : esc(b.icon)}</span>`;
  function show(r, sb) {
    render();
    if (!r) return;
    let delay = 0;
    if (r.e && r.e.xp) {
      toast(`<b>+${r.e.xp} XP</b><span>${esc(r.e.meta.label || "")}</span>`, "", 3200);
      if (!RM()) { chip.classList.remove("bump"); void chip.offsetWidth; chip.classList.add("bump") }
    }
    (r.badges || []).forEach(b => { delay += 700; setTimeout(() => toast(`${medal(b)}<div><b>Badge baru: ${esc(b.name)}</b><span>${esc(b.req)}${b.e && b.e.xp ? `, +${b.e.xp} XP` : ""}</span></div>`, "bdg", 5200), delay) });
    if (r.quest && r.quest.xp) { delay += 700; setTimeout(() => toast(`<div><b>Quest mingguan selesai! +${r.quest.xp} XP</b><span>Semua tujuan minggu ini tercapai. Quest baru muncul Senin depan.</span></div>`, "bdg", 5200), delay) }
    if (r.remedial) { const m = Object.keys(G.state().remedial).find(k => G.state().remedial[k] === r.remedial); setTimeout(() => sheet(remedialHTML(r.remedial, m)), 900) }
    const sa = G.streak();
    if (sb && sb.thisWeek < sa.target && sa.thisWeek >= sa.target) { delay += 700; setTimeout(() => toast(`<div><b>Target minggu ini tercapai!</b><span>${sa.target} hari belajar minggu ini. Mantap, pertahankan ritmenya.</span></div>`, "bdg", 4600), delay) }
    const S = G.state();
    if (r.after.level > (S.seenLevel || 1)) {
      S.seenLevel = r.after.level; G.save();
      setTimeout(() => toast(`${STAR}<b>Naik ke Level ${r.after.level}!</b><span>Sekarang kamu: ${esc(r.after.tier)}</span>`, "lvl", 5200), delay + 700);
    }
  }
  ["lesson", "quiz", "dnd", "sim"].forEach(t => G.on(t, d => { const sb = G.streak(); show(G.award(t, d), sb) }));

  /* ---------- panel detail "Perjalanan karier" (revisi 2026-11-06: satu gulir, jalan karier, flip badge) ---------- */
  const ring = (p, r = 22, w = 5) => { const c = 2 * Math.PI * r; return `<svg class="gx-ring" viewBox="0 0 ${2 * r + w * 2} ${2 * r + w * 2}" aria-hidden="true"><circle cx="${r + w}" cy="${r + w}" r="${r}" class="bg" stroke-width="${w}"/><circle cx="${r + w}" cy="${r + w}" r="${r}" class="fg" stroke-width="${w}" style="--c:${c.toFixed(1)};--o:${(c * (1 - Math.max(0, Math.min(1, p)))).toFixed(1)}"/></svg>` };
  const FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fl" d="M12 2.5c1 3.4 5.5 5.6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.7 1.3-4.4 2.6-5.6.3 1.6 1 2.6 2.1 3.1-.4-3.1.1-5.8.8-8.5z"/><path class="fi" d="M12 13c.8 1.4 2.4 2.2 2.4 4.1a2.4 2.4 0 0 1-4.8 0c0-1.3.9-2.2 2.4-4.1z"/></svg>';
  const SNOW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/></svg>';
  /* ---------- panel v3 (2026-11-23): gaya LMS GrowthLab (kertas krem, judul Anton biru tua, nomor oranye seperti daftar bab).
     Dibaca dari atas ke bawah: level + status + bar XP, tangga karier dengan Labi, lalu kartu bernomor. ---------- */
  const seg = (p, n) => Array.from({ length: n }, (_, k) => `<i class="${k < Math.floor(p * n) ? "on" : k === Math.floor(p * n) && p * n % 1 > 0 ? "now" : ""}" style="--k:${k}"></i>`).join("");
  const mod = (n, id, title, em, body, ac, cls = "") => `<section class="gx3-mod ${cls}" style="--ac:${ac}" aria-labelledby="${id}"><h3 id="${id}"><span class="gx3-n" aria-hidden="true">${String(n).padStart(2, "0")}</span><span class="gx3-t">${title}</span>${em ? `<em>${em}</em>` : ""}</h3>${body}</section>`;
  function heroHTML(I, C) {
    const ns = C.tiers.map(([m]) => G.need(m)), n = ns.length - 1;
    const now = C.tiers.reduce((t, [m], k) => I.level >= m ? k : t, 0);
    return `<header class="gx3-hero">
      <div class="gx3-id">
        <span class="gx3-k">Perjalanan kariermu</span>
        <div class="gx3-tt"><span class="gx3-lv" aria-label="Level ${I.level}"><small>Level</small><b data-cu="${I.level}">${I.level}</b></span><h2 id="gx-dt">${esc(I.tier)}</h2></div>
        <p class="gx3-xp"><b class="gx3-xpn" data-cu="${I.xp}">${nf(I.xp)}</b> XP · <em>${nf(I.to - I.xp)} XP lagi ke Level ${I.level + 1}</em></p>
        <div class="gx3-bar big" role="img" aria-label="Progres level ${Math.round(I.p * 100)} persen"><i style="--w:${Math.max(0, Math.min(1, I.p)).toFixed(3)}"></i></div>
        <p class="gx3-segl"><span>Lv ${I.level} · ${nf(I.from)} XP</span><span>Lv ${I.level + 1} · ${nf(I.to)} XP</span></p>
      </div>
      <ol class="gx3-stairs" aria-label="Tangga karier">${C.tiers.map(([m, nm], k) => `<li class="${k < now ? "on" : k === now ? "now" : ""}" style="--k:${k};--h:${(k + 1) / (n + 1)}">
        ${k === now ? '<span class="gx3-me" aria-hidden="true"><span class="labi happy"></span></span>' : ""}<span class="gx3-step" aria-hidden="true">${k < now ? "✓" : k + 1}</span>
        <b>${esc(nm)}</b><small>Lv ${m}${k === n ? "+" : "–" + (C.tiers[k + 1][0] - 1)} · ${nf(ns[k])} XP</small></li>`).join("")}</ol>
    </header>`;
  }
  function questHTML(q) {
    return mod(1, "gx-qt", "Misi minggu ini", `+${q.xp} XP`,
      `<ul class="gx3-quest">${q.goals.map(g => { const ok = g.cur >= g.n, c = Math.min(g.cur, g.n); return `<li class="${ok ? "ok" : ""}"><span class="gx3-chk" aria-hidden="true">${ok ? "✓" : ""}</span><b>${esc(g.t)}</b><span class="gx3-q">${c}/${g.n}${ok ? " · selesai" : ""}</span><span class="gx3-seg sm" aria-hidden="true">${seg(c / g.n, g.n)}</span></li>` }).join("")}</ul>
      <p class="gx-how">${q.claimed ? "Misi minggu ini sudah selesai. Misi baru muncul Senin depan." : "Misinya ganti tiap Senin. Kalau nggak selesai juga nggak apa-apa."}</p>`, "#e2552b");
  }
  function streakHTML(s) {
    const msg = s.thisWeek >= s.target ? "Target minggu ini tercapai. Hari tambahan tetap dihitung."
      : s.broke ? "Minggu lalu terlewat, nggak apa-apa. Yuk mulai lagi minggu ini."
      : `${s.target - s.thisWeek} hari belajar lagi untuk target minggu ini.`;
    return mod(2, "gx-st", "Streak mingguan", `${Math.min(s.thisWeek, 7)}/${s.target} hari`,
      `<div class="gx3-days">${s.weekDays.map((d, i) => `<span class="${d.on ? "on" : ""}${d.today ? " td" : ""}" style="--k:${i}" title="${HARI[i]}${d.on ? ": belajar" : ""}"><span class="gx3-cell">${d.on ? FLAME : ""}</span><small>${d.today ? "Hari ini" : HARI[i]}</small></span>`).join("")}</div>
      <div class="gx3-stats"><div><b>${s.cur}</b><small>minggu berturut-turut</small></div><div><b>${s.best}</b><small>rekor terbaik</small></div><div class="fz"><b>${SNOW}${s.freeze}</b><small>hari libur</small></div></div>
      <p class="gx-how">${msg} Setiap ${G.CFG.streak.earnEvery} minggu target tercapai memberi 1 hari libur (maks ${G.CFG.streak.maxFreeze}) yang otomatis menjaga streak.</p>`, "#e2552b");
  }
  function feedHTML(recent) {
    return mod(4, "gx-ft", "XP terakhir", "",
      `${recent.length ? `<ol class="gx3-log">${recent.map((e, k) => `<li style="--k:${k}"><b>+${e.xp} XP</b><span>${esc(e.meta.label || e.type)}${e.meta.awal ? " <small>(progres sebelumnya)</small>" : ""}</span></li>`).join("")}</ol>` : "<p>Belum ada XP. Selesaikan satu pelajaran atau latihan dulu.</p>"}
      <p class="gx-how">XP datang dari pelajaran dan skor latihan. Kalau mengulang latihan, XP cuma nambah kalau skormu naik.</p>`, "#e2552b");
  }
  function skillHTML() {
    const sk = G.skills(), CL = ["#ff5a3c", "#6d4cff", "#2ec27e"];
    return mod(3, "gx-sk", "Profil kesiapan kerja", "",
      `<ul class="gx3-tubes" aria-label="Profil kesiapan kerja: ${sk.map(s => `${esc(s.t)} ${s.v}`).join(", ")}">${sk.map((s, k) => `<li style="--w:${s.v / 100};--tc:${CL[k % 3]};--k:${k}"><span class="gx3-tube" aria-hidden="true"><i></i></span><strong>${s.v}<small>/100</small></strong><b>${esc(s.t)}</b><small>Pelajaran ${s.les}% · kuis ${s.quiz || "–"} · simulasi ${s.sim || "–"}</small></li>`).join("")}</ul>
      <p class="gx-how">Skor = 20% pelajaran bab + 40% kuis bab terbaik + 40% simulasi terbaik.</p>`, "#4ee6ff");
  }
  function remHTML() {
    const R = G.state().remedial || {}, ks = Object.keys(R);
    if (!ks.length) return "";
    return mod(5, "gx-rm", "Saran belajar ulang", "", ks.map(m => remedialHTML(R[m], m)).join(""), "#e2552b");
  }
  function badgesHTML() {
    const L = G.badgeList(), n = L.filter(b => b.got).length;
    return mod(6, "gx-bt", "Koleksi lencana", `${n}/${L.length}`,
      `<p class="gx-how">Klik lencananya buat lihat syarat dan progresnya.</p>
      <ul class="gx3-badges">${L.map((b, k) => `<li style="--k:${k}"><button type="button" class="gx-flip ${b.got ? "got" : ""}" aria-pressed="false" aria-label="${esc(b.name)}, ${b.got ? "sudah didapat" : "terkunci"}. Balik untuk melihat syarat">
        <span class="f"><span class="gx3-hex" style="--bc:${esc(b.color)}">${b.got ? esc(b.icon) : '<i class="lk"></i>'}</span><b>${esc(b.name)}</b><small>${b.got ? "Didapat " + new Date(b.at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : b.max > 1 ? `${b.cur}/${b.max}` : "Terkunci"}</small>${!b.got && b.max > 1 ? `<span class="gx3-bar"><i style="--w:${b.cur / b.max}"></i></span>` : ""}</span>
        <span class="bk" style="--bc:${esc(b.color)}"><small>Syarat</small><span>${esc(b.req)}</span><em>+${b.xp} XP</em></span></button></li>`).join("")}</ul>`, "#e2552b", "gx3-wide");
  }
  /* animasi setelah panel tampil: angka hitung naik, lalu kelas .go memicu transisi CSS */
  function animate(root) {
    const rm = RM();
    root.querySelectorAll("[data-cu]").forEach(el => { const to = +el.dataset.cu; if (rm || !to) return; const t0 = performance.now();
      (function f(t) { const k = Math.min(1, (t - t0) / 1200), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = nf(v); if (k < 1) requestAnimationFrame(f) })(t0) });
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("go")));
  }
  let dlg = null, back = null;
  function open() {
    close(); back = document.activeElement;
    const I = G.info(), C = G.CFG;
    const recent = G.state().ledger.filter(e => e.xp > 0).slice(-6).reverse();
    dlg = document.createElement("div");
    dlg.className = "gx-dlg"; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-labelledby", "gx-dt");
    /* data-lenis-prevent: gulir mouse di dalam panel tidak ditelan smooth scroll halaman */
    dlg.setAttribute("data-lenis-prevent", "");
    dlg.innerHTML = `<div class="gx-dlg-in gx-wide gx-v3" data-lenis-prevent>
      <div class="gx3-xw"><button type="button" class="gx-x gx3-x" aria-label="Tutup">×</button></div>
      ${heroHTML(I, C)}
      <div class="gx3-grid">
        <div class="gx3-col">${questHTML(G.quest())}${streakHTML(G.streak())}</div>
        <div class="gx3-col">${skillHTML()}${feedHTML(recent)}${remHTML()}</div>
        ${badgesHTML()}
      </div>
      <div class="gx3-extra">${(G.panelExtra || []).map(f => { try { return f() } catch (e) { return "" } }).join("")}</div>
    </div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener("click", e => {
      if (e.target === dlg || e.target.closest(".gx-x")) return close();
      const fb = e.target.closest(".gx-flip"); if (fb) { const on = fb.classList.toggle("flip"); fb.setAttribute("aria-pressed", String(on)) }
    });
    dlg.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close() }
      if (e.key === "Tab") { const f = [...dlg.querySelectorAll("button,input,a[href],[tabindex='0']")].filter(x => x.offsetParent !== null), a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() } }
    });
    dlg.querySelector(".gx-x").focus();
    document.documentElement.classList.add("gx-lock");
    try { window.__lenis && window.__lenis.stop() } catch (e) {}
    animate(dlg.querySelector(".gx-dlg-in"));
  }
  function close() {
    if (!dlg) return; dlg.remove(); dlg = null;
    document.documentElement.classList.remove("gx-lock");
    try { window.__lenis && window.__lenis.start() } catch (e) {}
    if (back && back.focus) back.focus();
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-gx-open],#gx-chip"); if (b) { e.preventDefault(); open() } });
  G.open = open;

  /* ---------- petunjuk bertahap di kuis per bab (Fase 3) ---------- */
  G.on("qshow", d => {
    if (!on() || !/^b\d$/.test(d.m) || !d.box) return;
    const L = (() => { try { return GLD.COURSE.chapters[d.b].l[d.l] } catch (e) { return null } })();
    const cost = G.CFG.hint.costs, base = `hint:${d.run}:${d.i}:`;
    const w = document.createElement("div"); w.className = "gx gx-hint"; d.box.appendChild(w);
    const draw = () => {
      const s1 = G.has(base + 1), s2 = G.has(base + 2), xp = G.total();
      w.innerHTML = (s1 && L ? `<p class="gx-hint-t"><b>Ingat lagi “${esc(L.t)}”:</b> ${esc(String(L.poin || "").replace(/<[^>]+>/g, ""))}</p>` : "")
        + (!s1 ? `<button type="button" class="gx-hb" data-h="1"${xp < cost[0] ? " disabled" : ""}>Petunjuk, −${cost[0]} XP</button>`
          : !s2 ? `<button type="button" class="gx-hb" data-h="2"${xp < cost[1] ? " disabled" : ""}>Hilangkan 1 jawaban salah, −${cost[1]} XP</button>` : "")
        + (xp < cost[s1 ? 1 : 0] && !s2 ? `<small>XP-mu belum cukup buat beli petunjuk.</small>` : "");
    };
    w.addEventListener("click", e => {
      const b = e.target.closest("[data-h]"); if (!b) return;
      const st = +b.dataset.h, ev = G.spend(cost[st - 1], base + st, { label: `Petunjuk kuis Bab ${d.b + 1}` });
      if (!ev) return;
      if (st === 2) { const opts = [...document.querySelectorAll(".gq-o:not([disabled])")].filter(o => !d.ok[+o.dataset.k]); if (opts[0]) { opts[0].disabled = true; opts[0].dataset.gone = "" } }
      render(); draw(); toast(`<b>−${cost[st - 1]} XP</b><span>Petunjuk dipakai</span>`, "", 2200);
    });
    draw();
  });

  /* ---------- unlock ringan simulasi (Fase 3): saran, bukan kunci ---------- */
  document.addEventListener("click", e => {
    const b = e.target.closest('[data-sm="open"]');
    if (!b || !on() || window.GL_NO_GATE || b.dataset.gxPass) return;
    const g = G.simGate(b.dataset.id); if (!g) return;
    e.preventDefault(); e.stopImmediatePropagation();
    close(); back = b;
    dlg = document.createElement("div");
    dlg.className = "gx-dlg"; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-labelledby", "gx-gt");
    dlg.innerHTML = `<div class="gx-dlg-in"><button type="button" class="gx-x" aria-label="Tutup">×</button>
      <span class="mono">Saran urutan belajar</span><h2 id="gx-gt">Kuis Bab ${g.bab + 1} dulu, yuk</h2>
      <p>Simulasi ini menguji penerapan materi Bab ${g.bab + 1}. Biasanya lebih lancar kalau kamu sudah lulus Kuis Bab ${g.bab + 1} (skor minimal ${typeof GLD !== "undefined" ? GLD.PASS_MCQ : 70}). Tapi kamu yang menentukan.</p>
      <div class="gx-row"><a class="btn p" href="#/latihan/kuis/b${g.bab}">Kerjakan Kuis Bab ${g.bab + 1}</a><button type="button" class="btn" data-skip>Lewati, main sekarang</button></div></div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener("click", ev => {
      if (ev.target === dlg || ev.target.closest(".gx-x") || ev.target.closest("a")) return close();
      if (ev.target.closest("[data-skip]")) { G.skipGate(b.dataset.id); close(); b.dataset.gxPass = "1"; b.click(); delete b.dataset.gxPass }
    });
    dlg.addEventListener("keydown", ev => { if (ev.key === "Escape") close() });
    dlg.querySelector("[data-skip]").focus();
  }, true);

  applyOn(); render();
})();
