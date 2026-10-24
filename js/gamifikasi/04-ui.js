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

  /* ---------- quest, skill map, remedial (Fase 3) ---------- */
  const questLine = q => q.claimed ? "Quest minggu ini selesai" : `Quest minggu ini ${q.goals.filter(g => g.cur >= g.n).length}/${q.goals.length}`;
  const lesLink = k => { const [i, j] = k.split("-").map(Number); let t = k; try { t = GLD.COURSE.chapters[i].l[j].t } catch (e) {} return `<a href="#/lesson/${i}-${j}">Bab ${i + 1} · ${esc(t)}</a>` };
  function radar(sk) {
    const R = 70, cx = 100, cy = 92, ang = i => -Math.PI / 2 + i * 2 * Math.PI / sk.length;
    const pt = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r].map(v => v.toFixed(1)).join(",");
    const ring = f => sk.map((_, i) => pt(i, R * f)).join(" ");
    return `<svg class="gx-radar" viewBox="0 0 200 190" role="img" aria-label="Profil kesiapan kerja: ${sk.map(s => `${s.t} ${s.v}`).join(", ")}">
      ${[.25, .5, .75, 1].map(f => `<polygon points="${ring(f)}" class="gr"/>`).join("")}
      ${sk.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R).split(",")[0]}" y2="${pt(i, R).split(",")[1]}" class="ga"/>`).join("")}
      <polygon points="${sk.map((s, i) => pt(i, R * Math.max(.04, s.v / 100))).join(" ")}" class="gv"/>
      ${sk.map((s, i) => { const [x, y] = pt(i, R + 14).split(","); return `<text x="${x}" y="${y}" text-anchor="${+x < cx - 5 ? "end" : +x > cx + 5 ? "start" : "middle"}">${s.v}</text>` }).join("")}
    </svg>`;
  }
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
    card.innerHTML = `<div class="gx-card-h">${STAR}<div><span class="mono">Level ${I.level} · ${esc(I.tier)}</span><b>${nf(I.xp)} XP</b></div>
      <button type="button" class="chip" data-gx-open>Detail</button></div>${bar(I.p)}
      <small>${nf(I.to - I.xp)} XP lagi ke Level ${I.level + 1}${G.tier(I.level + 1) !== I.tier ? ` · ${esc(G.tier(I.level + 1))}` : ""}</small>
      <div class="gx-card-s">${weekDots(G.streak())}<span>${streakLine(G.streak())}</span></div>
      <small>${questLine(G.quest())} · Badge ${G.badgeList().filter(b => b.got).length}/${G.CFG.badges.length}</small>`;
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

  /* ---------- panel detail + toggle ---------- */
  function questHTML(q) {
    return `<section class="gx gx-sec" aria-labelledby="gx-qt"><span class="mono" id="gx-qt">Quest minggu ini · +${q.xp} XP</span>
      <ul class="gx-quest">${q.goals.map(g => `<li class="${g.cur >= g.n ? "ok" : ""}"><span aria-hidden="true">${g.cur >= g.n ? "✓" : ""}</span><div><b>${esc(g.t)}</b><span class="gx-bp"><i style="--w:${g.cur / g.n}"></i></span></div><small>${g.cur}/${g.n}</small></li>`).join("")}</ul>
      <p class="gx-how">${q.claimed ? "Quest minggu ini sudah selesai. Quest baru muncul Senin depan." : "Quest berganti setiap Senin. Kerjakan sesuai waktumu, tidak ada hukuman bila tidak selesai."}</p></section>`;
  }
  function skillHTML() {
    const sk = G.skills();
    return `<section class="gx gx-sec" aria-labelledby="gx-sk"><span class="mono" id="gx-sk">Profil kesiapan kerja</span>
      <div class="gx-skill">${radar(sk)}<ul>${sk.map(s => `<li><b>${esc(s.t)}</b><span class="gx-bp"><i style="--w:${s.v / 100}"></i></span><small>${s.v}/100 · pelajaran ${s.les}% · kuis ${s.quiz || "–"} · simulasi ${s.sim || "–"}</small></li>`).join("")}</ul></div>
      <p class="gx-how">Skor = 20% pelajaran bab selesai + 40% skor kuis bab terbaik + 40% skor simulasi terbaik.</p></section>`;
  }
  function remHTML() {
    const R = G.state().remedial || {}, ks = Object.keys(R);
    if (!ks.length) return "";
    return `<section class="gx gx-sec" aria-labelledby="gx-rm"><span class="mono" id="gx-rm">Saran belajar ulang</span>${ks.map(m => remedialHTML(R[m], m)).join("")}</section>`;
  }
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
    dlg.innerHTML = `<div class="gx-dlg-in gx-wide">
      <button type="button" class="gx-x" aria-label="Tutup">×</button>
      <h2 id="gx-dt">Perjalanan karier kamu</h2>
      <div class="gx-cols">
        <div class="gx-col">
          <div class="gx gx-sum">${STAR}<div><b>Level ${I.level} · ${esc(I.tier)}</b><span>${nf(I.xp)} XP · ${nf(I.to - I.xp)} XP lagi ke Level ${I.level + 1}</span></div></div>
          <div class="gx">${bar(I.p)}</div>
          <ol class="gx gx-ladder">${C.tiers.map(([m, nm], i) => { const nx = C.tiers[i + 1], hit = I.level >= m;
            return `<li class="${hit ? "on" : ""}"><span aria-hidden="true">${hit ? "✓" : ""}</span><b>${esc(nm)}</b><small>Level ${m}${nx ? "–" + (nx[0] - 1) : "+"} · mulai ${nf(G.need(m))} XP</small></li>` }).join("")}</ol>
          <div class="gx"><span class="mono">XP terakhir</span>${recent.length ? `<ul class="gx-rec">${recent.map(e => `<li><b>+${e.xp}</b> ${esc(e.meta.label || e.type)}${e.meta.awal ? " <small>(progres sebelumnya)</small>" : ""}</li>`).join("")}</ul>` : "<p>Belum ada XP. Selesaikan pelajaran atau latihan untuk mulai.</p>"}
          <p class="gx-how">XP didapat dari pelajaran yang selesai dan skor latihan. Mengulang latihan hanya menambah XP bila skormu naik.</p></div>
          <div class="gx-set"><div><b id="gx-tl">Mode gamifikasi</b><small>Matikan bila kamu ingin belajar tanpa XP dan level. Progres belajar tetap tersimpan.</small></div>
            <button type="button" class="gx-sw" role="switch" aria-checked="${on()}" aria-labelledby="gx-tl"><i></i><span>${on() ? "Aktif" : "Nonaktif"}</span></button></div>
        </div>
        <div class="gx-col gx">
          ${questHTML(G.quest())}
          ${streakHTML(G.streak())}
          ${skillHTML()}
          ${remHTML()}
        </div>
        <div class="gx-col">
          ${badgesHTML()}
          ${(G.panelExtra || []).map(f => { try { return f() } catch (e) { return "" } }).join("")}
        </div>
      </div>
    </div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener("click", e => {
      if (e.target === dlg || e.target.closest(".gx-x")) return close();
      if (e.target.closest(".gx-sw")) { G.state().on = !on(); G.save(); if (G.log) G.log("gami_toggle", { on: on() }); applyOn(); render(); open() }
    });
    dlg.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close() }
      if (e.key === "Tab") { const f = [...dlg.querySelectorAll("button,input,a[href]")].filter(x => x.offsetParent !== null), a = f[0], z = f[f.length - 1];
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

  /* ---------- petunjuk bertahap di kuis per bab (Fase 3) ---------- */
  G.on("qshow", d => {
    if (!on() || !/^b\d$/.test(d.m) || !d.box) return;
    const L = (() => { try { return GLD.COURSE.chapters[d.b].l[d.l] } catch (e) { return null } })();
    const cost = G.CFG.hint.costs, base = `hint:${d.run}:${d.i}:`;
    const w = document.createElement("div"); w.className = "gx gx-hint"; d.box.appendChild(w);
    const draw = () => {
      const s1 = G.has(base + 1), s2 = G.has(base + 2), xp = G.total();
      w.innerHTML = (s1 && L ? `<p class="gx-hint-t"><b>Ingat lagi “${esc(L.t)}”:</b> ${esc(String(L.poin || "").replace(/<[^>]+>/g, ""))}</p>` : "")
        + (!s1 ? `<button type="button" class="gx-hb" data-h="1"${xp < cost[0] ? " disabled" : ""}>Petunjuk · −${cost[0]} XP</button>`
          : !s2 ? `<button type="button" class="gx-hb" data-h="2"${xp < cost[1] ? " disabled" : ""}>Hilangkan 1 jawaban salah · −${cost[1]} XP</button>` : "")
        + (xp < cost[s1 ? 1 : 0] && !s2 ? `<small>XP belum cukup untuk petunjuk.</small>` : "");
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
