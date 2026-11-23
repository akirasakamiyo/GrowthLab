/* ==================================================================
   HALAMAN PENGATURAN (#/pengaturan), 2026-11-23
   Enam bagian: profil, tampilan, aksesibilitas, audio & video, progres belajar, tentang.
   - Preferensi lewat GLP (js/00-pref.js, kunci "gl-pref").
   - Nama memakai sistem yang sudah ada: gl-ui.nama (dipakai juga oleh sertifikat dan Nilai akhir) dan sapaan Beranda (greet() di js/09-app.js).
   - Angka progres dibaca dari penyimpanan asli (mer-done, gl-latihan lewat GLX, gl-gami lewat GLG); tidak ada angka contoh.
   - Reset progres menghapus data belajar saja; nama, pengaturan, dan catatan aktivitas tetap.
   Dipanggil dari renderPage() di js/09-app.js: GLSET.html() lalu GLSET.bind(root).
   ================================================================== */
window.GLSET = (() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nf = n => Number(n).toLocaleString("id-ID");
  const say = m => { try { toast(m) } catch (e) {} };
  const ls = { get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, json(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v } catch (e) { return d } } };
  const nameNow = () => { const u = ls.json("gl-ui", {}); return (u && typeof u.nama === "string" ? u.nama : "").trim() };
  const NAME_RE = /^[\p{L}][\p{L}\p{M} .'’-]*$/u, NAME_MAX = 40;
  const checkName = v => { v = v.trim().replace(/\s+/g, " "); if (!v) return [null, "Nama tidak boleh kosong."]; if (v.length < 2) return [null, "Nama minimal 2 huruf."]; if (v.length > NAME_MAX) return [null, `Nama maksimal ${NAME_MAX} karakter.`]; if (!NAME_RE.test(v)) return [null, "Gunakan huruf, spasi, titik, atau tanda hubung saja."]; return [v, ""] };
  const first = v => (v || "").split(" ")[0];

  /* ikon garis tangan, gaya sama dengan ikon sidebar (currentColor, ujung bulat) */
  const SV = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const IC = {
    light: `<svg ${SV}><circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M5.5 18.5l1.6-1.6M16.9 7.1l1.6-1.6"/></svg>`,
    dark: `<svg ${SV}><path d="M19.6 14.6A8 8 0 0 1 9.4 4.4a8 8 0 1 0 10.2 10.2z"/></svg>`,
    system: `<svg ${SV}><rect x="3.2" y="4.4" width="17.6" height="12" rx="2.2"/><path d="M8.6 20h6.8M12 16.4V20"/><path d="M12 7.2v6.4" opacity=".5"/></svg>`,
    vol: `<svg ${SV}><path d="M4 9.4h3.4L12 5.6v12.8l-4.6-3.8H4z"/><path d="M15.6 9c.9.8 1.3 1.8 1.3 3s-.4 2.2-1.3 3M18 6.8c1.5 1.4 2.3 3.2 2.3 5.2s-.8 3.8-2.3 5.2"/></svg>`,
    mute: `<svg ${SV}><path d="M4 9.4h3.4L12 5.6v12.8l-4.6-3.8H4z"/><path d="M16 9.6l4.6 4.8M20.6 9.6L16 14.4"/></svg>`
  };
  const SECS = [["profil", "Profil"], ["tampilan", "Tampilan"], ["akses", "Aksesibilitas"], ["media", "Audio & video"], ["progres", "Progres belajar"], ["tentang", "Tentang GrowthLab"]];

  const sw = (k, on, label, desc, id = "st-" + k) => `<div class="gst-row"><div class="gst-l"><b id="${id}-l">${label}</b><p id="${id}-d">${desc}</p></div>
    <button type="button" class="gst-sw" role="switch" aria-checked="${on}" aria-labelledby="${id}-l" aria-describedby="${id}-d" data-p="${k}"><i aria-hidden="true"></i></button></div>`;
  const seg = (k, val, label, desc, opts) => `<div class="gst-row gst-row-col"><div class="gst-l"><b id="st-${k}-l">${label}</b><p>${desc}</p></div>
    <div class="gst-seg" role="radiogroup" aria-labelledby="st-${k}-l">${opts.map(([v, t, ic]) => `<button type="button" role="radio" aria-checked="${v === val}" tabindex="${v === val ? 0 : -1}" data-p="${k}" data-val="${v}">${ic || ""}<span>${t}</span></button>`).join("")}</div></div>`;
  const sec = (k, t, n, desc, body) => `<section class="gst-s" id="st-${k}" aria-labelledby="st-${k}-h"><header class="gst-sh"><span class="gst-n" aria-hidden="true">${String(n).padStart(2, "0")}</span><div><h2 id="st-${k}-h">${t}</h2><p>${desc}</p></div></header>${body}</section>`;

  function stats() {
    const L = typeof done !== "undefined" ? done.size : 0, T = typeof total !== "undefined" ? total : 0;
    let lx = null; try { lx = typeof GLX !== "undefined" && GLX.load ? GLX.load() : null } catch (e) {}
    const hasD = typeof GLD !== "undefined", nCh = hasD ? GLD.COURSE.chapters.length : 0;
    const kuis = lx ? Object.keys(lx.kuis.best).length : 0, dnd = lx ? Object.keys(lx.dnd).length : 0, sim = lx ? Object.values(lx.sim).filter(s => s.best).length : 0;
    let I = null, B = null; try { I = window.GLG ? GLG.info() : null; B = window.GLG ? GLG.badgeList() : null } catch (e) {}
    let store = true; try { localStorage.setItem("gl-t", "1"); localStorage.removeItem("gl-t") } catch (e) { store = false }
    return { L, T, kuis, kuisN: nCh + 1, dnd, dndN: hasD && GLD.DND ? GLD.DND.length : 0, sim, simN: hasD ? GLD.SIM.length : 0, I, badges: B ? B.filter(b => b.got).length : 0, badgesN: B ? B.length : 0, store };
  }

  function html() {
    const P = GLP.get(), nm = nameNow(), S = stats(), pct = S.T ? Math.round(S.L / S.T * 100) : 0;
    const row = (t, v, sub = "") => `<div><dt>${t}</dt><dd><b>${v}</b>${sub ? `<small>${sub}</small>` : ""}</dd></div>`;
    return `<div class="gst"><div class="wrap gst-w">
      <header class="gst-top"><span class="gst-k">Pengaturan</span><h1>Atur GrowthLab-mu</h1>
        <p>Profil, tampilan, aksesibilitas, dan suara. Semua pilihan tersimpan di browser ini dan langsung berlaku.</p></header>
      <div class="gst-g">
        <nav class="gst-nav" aria-label="Bagian pengaturan">${SECS.map(([k, t], i) => `<button type="button" data-st="st-${k}" ${i ? "" : 'aria-current="true"'}><span>${String(i + 1).padStart(2, "0")}</span>${t}</button>`).join("")}</nav>
        <div class="gst-c">
        ${sec("profil", "Profil", 1, "Nama dipakai untuk sapaan di Beranda, sertifikat, dan rapor Nilai akhir.", `
          <form class="gst-name" id="st-form" novalidate>
            <label class="gst-lbl" for="st-nm">Nama panggilan atau nama lengkap</label>
            <div class="gst-in"><input id="st-nm" type="text" maxlength="${NAME_MAX}" autocomplete="name" spellcheck="false" value="${esc(nm)}" placeholder="Tulis namamu" aria-describedby="st-nm-e st-nm-p"></div>
            <p class="gst-err" id="st-nm-e" role="alert"></p>
            <div class="gst-prev" id="st-nm-p" aria-live="polite"><span class="gst-k">Pratinjau di Beranda</span><span class="gst-greet" id="st-greet"></span></div>
            <div class="gst-act"><button type="button" class="btn" id="st-nm-x" disabled>Batal</button><button type="submit" class="btn p" id="st-nm-s" disabled>Simpan perubahan</button></div>
          </form>`)}
        ${sec("tampilan", "Tampilan", 2, "Tema warna dan gerak antarmuka.",
          seg("theme", P.theme, "Tema", "Ikuti perangkat memakai tema terang atau gelap sesuai pengaturan laptop/HP-mu.", [["light", "Terang", IC.light], ["dark", "Gelap", IC.dark], ["system", "Ikuti perangkat", IC.system]])
          + sw("anim", P.anim, "Animasi antarmuka", "Animasi dekoratif seperti maskot bergerak, latar beranimasi, efek gulir, dan transisi halaman. Kalau dimatikan, situs tampil diam seperti mode kurangi gerakan di perangkat; umpan balik penting (tombol, centang, notifikasi) tetap ada. Halaman dimuat ulang sebentar supaya berlaku di semua bagian."))}
        ${sec("akses", "Aksesibilitas", 3, "Biar lebih nyaman dibaca dan dipakai.",
          seg("text", P.text, "Ukuran teks", "Memperbesar teks di seluruh situs sekitar 12%.", [["normal", "Normal", '<span class="gst-aa" aria-hidden="true">Aa</span>'], ["besar", "Besar", '<span class="gst-aa big" aria-hidden="true">Aa</span>']])
          + sw("contrast", P.contrast, "Kontras tinggi", "Teks abu-abu jadi lebih pekat, garis dan tepi tombol lebih tegas, fokus keyboard lebih tebal.")
          + sw("motion", P.motion, "Kurangi gerakan", `Mematikan efek parallax dan gulir halus, menghentikan animasi berulang, dan mempersingkat transisi. Halaman dimuat ulang sebentar.${GLP.systemRM() ? " <em>Perangkatmu sudah meminta gerakan dikurangi, jadi ini sudah berlaku.</em>" : ""}`))}
        ${sec("media", "Audio & video", 4, "Berlaku untuk video di situs dan suara di Latihan.", `
          <div class="gst-row gst-row-col"><div class="gst-l"><b id="st-vol-l">Volume</b><p>Dipakai saat kamu menyalakan suara video, dan untuk efek suara serta musik Latihan.</p></div>
            <div class="gst-vol"><button type="button" class="gst-ib" id="st-mute" aria-pressed="${P.muted}" aria-label="${P.muted ? "Nyalakan suara" : "Bisukan suara"}">${P.muted ? IC.mute : IC.vol}</button>
              <input type="range" id="st-vol" min="0" max="100" step="5" value="${P.volume}" aria-labelledby="st-vol-l" aria-valuetext="${P.volume} persen" style="--v:${P.volume}%" ${P.muted ? 'class="off"' : ""}>
              <output id="st-vol-o" for="st-vol">${P.muted ? "Bisu" : P.volume + "%"}</output></div></div>
          ${typeof GLX !== "undefined" && GLX.ui ? sw("sfx", !!GLX.ui.SND.P.sfx, "Efek suara Latihan", "Bunyi klik, benar, dan salah saat kuis dan drag &amp; drop.") + sw("music", !!GLX.ui.SND.P.music, "Musik Latihan", "Musik latar pelan selama kuis dan simulasi.") : ""}
          ${sw("autoplay", P.autoplay, "Putar video otomatis", "Video tanpa suara di Beranda dan halaman panduan diputar saat terlihat. Kalau dimatikan, video diam sampai kamu menekan tombol suaranya.")}
          ${sw("transcript", P.transcript, "Buka versi teks video", "Versi teks video tutorial di halaman Petunjuk langsung terbuka tanpa perlu diklik.")}`)}
        ${sec("progres", "Progres belajar", 5, "Ringkasan dari data yang tersimpan di browser ini.", `
          <dl class="gst-dl">
            ${row("Pelajaran selesai", `${S.L}/${S.T}`, `${pct}%`)}
            ${row("Kuis dikerjakan", `${S.kuis}/${S.kuisN}`, "mode kuis")}
            ${row("Drag &amp; drop", `${S.dnd}/${S.dndN}`, "set")}
            ${row("Simulasi", `${S.sim}/${S.simN}`, "kasus")}
            ${S.I ? row("XP", nf(S.I.xp), `Level ${S.I.level}, ${esc(S.I.tier)}`) : ""}
            ${S.badgesN ? row("Lencana", `${S.badges}/${S.badgesN}`) : ""}
          </dl>
          <p class="gst-store ${S.store ? "ok" : "warn"}"><i aria-hidden="true"></i>${S.store ? "Tersimpan otomatis di browser ini. Data hilang kalau data situs browser dihapus, jadi unduh cadangan di panel Perjalanan karier sebelum ganti perangkat." : "Browser memblokir penyimpanan (mis. mode privat). Progres hanya bertahan selama tab ini terbuka."}</p>
          <div class="gst-row gst-danger"><div class="gst-l"><b>Reset progres belajar</b><p>Menghapus progres pelajaran, hasil latihan, XP, level, lencana, dan streak. Nama dan pengaturan tidak ikut terhapus.</p></div>
            <button type="button" class="btn gst-btn-d" id="st-reset">Reset progres</button></div>`)}
        ${sec("tentang", "Tentang GrowthLab", 6, "", `
          <div class="gst-about"><span class="logo" aria-hidden="true">${($(".nav .logo") || {}).innerHTML || ""}</span><div><b>GrowthLab</b><p>Self Development for Job Seeker. Media belajar soft skill untuk pencari kerja: 15 pelajaran, kuis, drag &amp; drop, dan simulasi wawancara.</p></div></div>
          <dl class="gst-dl gst-dl2">
            ${row("Platform", "Situs web statis", "Berjalan di browser, bisa dipakai offline; tersedia paket offline dan SCORM 1.2")}
            ${row("Pengembang", "Kelompok 8", "Teknologi Pendidikan, FIP, Universitas Negeri Jakarta")}
          </dl>
          <p class="gst-more"><a href="#/tentang">Lihat identitas pengembang lengkap</a></p>`)}
        </div>
      </div></div></div>
    <div class="gst-modal" id="st-modal" hidden><div class="gst-mbox" role="alertdialog" aria-modal="true" aria-labelledby="st-m-t" aria-describedby="st-m-d">
      <h2 id="st-m-t">Reset progres belajar?</h2>
      <div id="st-m-d"><p>Data berikut akan dihapus dari browser ini dan <b>tidak bisa dikembalikan</b>:</p>
        <ul><li>Pelajaran yang sudah selesai (${S.L} pelajaran) dan jawaban di kotak "Coba sendiri"</li><li>Hasil kuis, drag &amp; drop, simulasi, dan uji pemahaman, termasuk Nilai akhir</li><li>XP, level, lencana, streak, dan misi mingguan</li></ul>
        <p class="gst-keep">Tetap disimpan: nama, semua pengaturan, dan catatan aktivitas belajar.</p></div>
      <div class="gst-act"><button type="button" class="btn" id="st-m-x">Batal</button><button type="button" class="btn gst-btn-d" id="st-m-ok">Ya, reset progres</button></div>
    </div></div>`;
  }

  /* kunci progres belajar; gl-ui juga berisi jawaban "Coba sendiri", jadi hanya namanya yang disisakan */
  const PROGRESS_KEYS = ["mer-done", "gl-badge", "gl-latihan", "gl-uji", "gl-gami"];
  function resetProgress() {
    const nm = nameNow();
    try {
      PROGRESS_KEYS.forEach(k => localStorage.removeItem(k));
      localStorage.setItem("gl-ui", JSON.stringify(nm ? { nama: nm } : {}));
      sessionStorage.setItem("gl-flash", "Progres belajar sudah direset. Nama dan pengaturanmu tetap.");
    } catch (e) { say("Reset gagal: browser memblokir penyimpanan."); return false }
    /* modul progres menyimpan salinan di memori; muat ulang supaya semua tampilan mulai dari data kosong */
    location.hash = "#/pengaturan"; location.reload(); return true;
  }

  function bind(root) {
    /* navigasi bagian: gulir, bukan ganti hash (hash dipakai router) */
    const nav = $(".gst-nav", root), secs = $$(".gst-s", root);
    nav.addEventListener("click", e => { const b = e.target.closest("[data-st]"); if (!b) return; const t = $("#" + b.dataset.st, root); const y = t.getBoundingClientRect().top + scrollY - (innerWidth <= 760 ? 130 : 90);
      try { window.__lenis ? window.__lenis.scrollTo(y, { immediate: GLP.reduced() }) : scrollTo({ top: y, behavior: GLP.reduced() ? "auto" : "smooth" }) } catch (_) { scrollTo(0, y) }
      t.querySelector("h2").setAttribute("tabindex", "-1"); t.querySelector("h2").focus({ preventScroll: true }) });
    if ("IntersectionObserver" in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$("[data-st]", nav).forEach(b => b.toggleAttribute("aria-current", b.dataset.st === e.target.id)) }), { rootMargin: "-30% 0px -60% 0px" }); secs.forEach(s => io.observe(s)) }

    /* profil */
    const inp = $("#st-nm", root), err = $("#st-nm-e", root), sv = $("#st-nm-s", root), cx = $("#st-nm-x", root), gr = $("#st-greet", root);
    const sync = () => { const saved = nameNow(), [v, m] = checkName(inp.value), dirty = inp.value.trim().replace(/\s+/g, " ") !== saved;
      gr.textContent = v ? `Halo, ${first(v)}. Lanjut dari yang kemarin, yuk.` : saved ? `Halo, ${first(saved)}. Lanjut dari yang kemarin, yuk.` : "Belum ada nama, jadi Beranda tidak menampilkan sapaan.";
      sv.disabled = !dirty || !v; cx.disabled = !dirty; if (!dirty || v) { err.textContent = ""; inp.removeAttribute("aria-invalid") } return { v, m, dirty } };
    inp.addEventListener("input", sync); sync();
    inp.addEventListener("blur", () => { const { v, m, dirty } = sync(); if (dirty && !v) { err.textContent = m; inp.setAttribute("aria-invalid", "true") } });
    cx.onclick = () => { inp.value = nameNow(); sync(); inp.focus() };
    $("#st-form", root).onsubmit = e => { e.preventDefault(); const { v, m } = sync(); if (!v) { err.textContent = m; inp.setAttribute("aria-invalid", "true"); inp.focus(); return }
      try { const u = ls.json("gl-ui", {}) || {}; u.nama = v; localStorage.setItem("gl-ui", JSON.stringify(u)) } catch (_) { err.textContent = "Gagal menyimpan: browser memblokir penyimpanan."; return }
      inp.value = v; sync(); try { window.greet && greet() } catch (_) {} say(`Nama disimpan. Halo, ${first(v)}!`) };

    /* sakelar dan pilihan */
    root.addEventListener("click", e => {
      const s = e.target.closest(".gst-sw"); if (s) { const on = s.getAttribute("aria-checked") !== "true"; s.setAttribute("aria-checked", on); setPref(s.dataset.p, on); return }
      const r = e.target.closest('.gst-seg [role="radio"]'); if (r) pick(r);
    });
    root.addEventListener("keydown", e => { const r = e.target.closest('.gst-seg [role="radio"]'); if (!r || !/Arrow(Left|Right|Up|Down)/.test(e.key)) return; e.preventDefault();
      const all = $$('[role="radio"]', r.parentNode), i = all.indexOf(r), n = all[(i + (/Right|Down/.test(e.key) ? 1 : all.length - 1)) % all.length]; pick(n); n.focus() });
    function pick(r) { $$('[role="radio"]', r.parentNode).forEach(b => { const on = b === r; b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1 }); setPref(r.dataset.p, r.dataset.val) }
    function setPref(k, v) {
      if (k === "sfx" || k === "music") { try { GLX.ui.SND.set(k, v) } catch (_) {} return say(v ? "Dinyalakan." : "Dimatikan.") }
      GLP.set({ [k]: v });
      /* animasi dibaca sekali saat modul dimuat (Lenis, GSAP, parallax, transisi halaman): muat ulang supaya berlaku di semua bagian */
      if (k === "anim" || k === "motion") {
        try { sessionStorage.setItem("gl-flash", k === "anim" ? (v ? "Animasi antarmuka dinyalakan." : "Animasi antarmuka dimatikan.") : (v ? "Gerakan dikurangi." : "Gerakan kembali normal.")); sessionStorage.setItem("gl-flash-to", k === "anim" ? "st-tampilan" : "st-akses") } catch (_) {}
        setTimeout(() => location.reload(), 150); return;
      }
      const msg = { theme: { light: "Tema terang dipakai.", dark: "Tema gelap dipakai.", system: "Tema mengikuti perangkat." }[v], text: v === "besar" ? "Teks diperbesar." : "Ukuran teks normal." }[k];
      say(msg || (v ? "Dinyalakan." : "Dimatikan."));
    }

    /* volume */
    const vol = $("#st-vol", root), out = $("#st-vol-o", root), mu = $("#st-mute", root);
    const paint = () => { const P = GLP.get(); vol.value = P.volume; vol.style.setProperty("--v", P.volume + "%"); vol.classList.toggle("off", P.muted); vol.setAttribute("aria-valuetext", P.muted ? "bisu" : P.volume + " persen");
      out.textContent = P.muted ? "Bisu" : P.volume + "%"; mu.setAttribute("aria-pressed", P.muted); mu.setAttribute("aria-label", P.muted ? "Nyalakan suara" : "Bisukan suara"); mu.innerHTML = P.muted ? IC.mute : IC.vol };
    vol.addEventListener("input", () => { GLP.set({ volume: +vol.value, muted: +vol.value === 0 ? GLP.get().muted : false }); paint() });
    mu.onclick = () => { GLP.set({ muted: !GLP.get().muted }); paint(); say(GLP.get().muted ? "Suara dibisukan." : "Suara dinyalakan.") };

    /* reset dengan modal konfirmasi */
    const modal = $("#st-modal", root), box = $(".gst-mbox", modal); let back = null;
    const openM = () => { back = document.activeElement; modal.hidden = false; requestAnimationFrame(() => modal.classList.add("on")); $("#st-m-x", modal).focus(); try { window.__lenis && window.__lenis.stop() } catch (_) {} };
    const closeM = () => { modal.classList.remove("on"); modal.hidden = true; try { window.__lenis && window.__lenis.start() } catch (_) {} back && back.focus() };
    $("#st-reset", root).onclick = openM; $("#st-m-x", modal).onclick = closeM;
    $("#st-m-ok", modal).onclick = () => { const b = $("#st-m-ok", modal); b.disabled = true; b.textContent = "Mereset…"; if (!resetProgress()) { b.disabled = false; b.textContent = "Ya, reset progres"; closeM() } };
    modal.addEventListener("click", e => { if (e.target === modal) closeM() });
    modal.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); closeM() }
      if (e.key === "Tab") { const f = $$("button:not([disabled])", box), a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() } } });
  }

  /* pesan setelah muat ulang (mis. sesudah reset) */
  addEventListener("load", () => { let m = null, to = null; try { m = sessionStorage.getItem("gl-flash"); to = sessionStorage.getItem("gl-flash-to"); sessionStorage.removeItem("gl-flash"); sessionStorage.removeItem("gl-flash-to") } catch (e) {}
    if (to) setTimeout(() => { const t = document.getElementById(to); if (t) { const y = t.getBoundingClientRect().top + scrollY - 90; try { window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y) } catch (_) { scrollTo(0, y) } } }, 700);
    if (m) setTimeout(() => say(m), 900) });
  return { html, bind, checkName };
})();
