/* Sidebar ala LMS (2026-11-14), menggantikan navbar kapsul di atas.
   Desktop (>= 1100px): sidebar 248px. Tombol panel (seperti di Claude) menciutkannya jadi rel ikon 76px; pilihan disimpan.
   Tablet (761–1099px): selalu rel ikon.
   HP (<= 760px): navbar lama tetap jadi bar atas; tombol Menu membuka sidebar ini sebagai laci dari kiri.
   Supaya ringkas, grup Panduan dan Lainnya bisa dilipat. Di mode rel, grup jadi satu ikon yang membuka menu melayang.
   Navbar lama (header.nav, #links) tidak dihapus: gamifikasi dan progres masih menulis ke sana, sidebar membaca dari situ. */
(() => {
  const $ = s => document.querySelector(s), body = document.body;
  if (!$("header.nav")) return;
  const RM = matchMedia("(prefers-reduced-motion: reduce)");
  const HP = matchMedia("(max-width: 760px)"), DESK = matchMedia("(min-width: 1100px)");
  const st = { get: k => { try { return localStorage.getItem(k) } catch (_) { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch (_) {} } };

  /* ---------- ikon duotone: garis tinta + bidang warna (var(--c)) ---------- */
  const S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const I = {
    home: `<svg ${S}><path class="f" d="M5 11.5V20h5v-5h4v5h5v-8.5" stroke="none"/><path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-5h4v5h5V10"/></svg>`,
    katalog: `<svg ${S}><rect class="f" x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect class="f" x="13" y="13" width="8" height="8" rx="2"/></svg>`,
    course: `<svg ${S}><path class="f" d="M12 6c-2-1.6-5-2-8-1.6V19c3-.4 6 0 8 1.6z"/><path d="M12 6c-2-1.6-5-2-8-1.6V19c3-.4 6 0 8 1.6 2-1.6 5-2 8-1.6V4.4c-3-.4-6 0-8 1.6zM12 6v14.6"/></svg>`,
    latihan: `<svg ${S}><rect class="f" x="4" y="3" width="16" height="18" rx="3"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/><rect x="4" y="3" width="16" height="18" rx="3"/></svg>`,
    nilai: `<svg ${S}><rect class="f" x="10" y="5" width="4" height="15" rx="1"/><path d="M4 20h16M6 20v-6M12 20V5M18 20v-9"/></svg>`,
    panduan: `<svg ${S}><circle class="f" cx="12" cy="12" r="9" stroke="none"/><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>`,
    lain: `<svg ${S}><circle class="f" cx="12" cy="12" r="9" stroke="none"/><circle cx="7.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="16.5" cy="12" r="1"/></svg>`,
    petunjuk: `<svg ${S}><circle class="f" cx="12" cy="12" r="9" stroke="none"/><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>`,
    tujuan: `<svg ${S}><circle cx="12" cy="12" r="9"/><circle class="f" cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/></svg>`,
    alur: `<svg ${S}><circle class="f" cx="5" cy="18" r="2.5"/><circle class="f" cx="19" cy="6" r="2.5"/><path d="M7.5 18H13a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5.5"/></svg>`,
    peta: `<svg ${S}><path class="f" d="M9 3v15l6 3V6z" stroke="none"/><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>`,
    glosarium: `<svg ${S}><path class="f" d="M6 3h14v14H6a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2z" stroke="none"/><path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14"/><path d="M9.5 13l2.5-6 2.5 6M10.4 11h3.2"/></svg>`,
    referensi: `<svg ${S}><path class="f" d="M6 3h12v18l-6-4-6 4z"/><path d="M10 8h4"/></svg>`,
    faq: `<svg ${S}><path class="f" d="M4 5h16v11H9l-5 4z"/><path d="M10 9a2 2 0 1 1 2.8 1.8c-.5.2-.8.7-.8 1.2M12 14h.01"/></svg>`,
    komunitas: `<svg ${S}><circle class="f" cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="9" cy="8" r="3"/><path d="M16 4a3 3 0 0 1 0 6M18 14c2 .6 3 2.6 3 6"/></svg>`,
    tentang: `<svg ${S}><path class="f" d="M12 20s-7-4.2-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4C19 15.8 12 20 12 20z"/></svg>`,
    panel: `<svg ${S}><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9.5 4v16"/></svg>`,
    chev: `<svg ${S}><path d="M9 6l6 6-6 6"/></svg>`
  };
  /* [kunci, label, alamat, warna] */
  const UTAMA = [["home", "Beranda", "#/", "#ff7a3d"], ["katalog", "Katalog", "#/e-learning", "#7c5cff"], ["course", "Materi", "#/course", "#2b55ff"], ["latihan", "Latihan", "#/latihan", "#14b8a6"], ["nilai", "Nilai akhir", "#/latihan", "#f5a524"]];
  const GRUP = [
    ["panduan", "Panduan", "#ff5a3c", [["petunjuk", "Petunjuk", "", "#ff5a3c"], ["tujuan", "Tujuan belajar", "", "#14b8a6"], ["alur", "Alur belajar", "", "#7c5cff"], ["peta", "Peta konsep", "", "#2b55ff"], ["glosarium", "Glosarium", "", "#f5a524"], ["referensi", "Referensi", "", "#ff7a3d"], ["faq", "FAQ", "", "#e0459b"]]],
    ["lain", "Lainnya", "#7c5cff", [["komunitas", "Belajar bareng", "", "#14b8a6"], ["tentang", "Tentang & tim", "", "#e0459b"]]]
  ];
  const ic = (k, c) => `<span class="sbn-ic" style="--c:${c}">${I[k]}</span>`;
  const item = ([k, t, h, c]) => `<a href="${h || "#/" + k}" data-sk="${k}" data-tip="${t}" aria-label="${t}">${ic(k, c)}<span class="sbn-t">${t}</span>${k === "course" ? '<b class="sbn-n" id="sbn-n"></b>' : ""}</a>`;
  const grup = ([g, t, c, list]) => `<div class="sbn-g" data-g="${g}">
      <button type="button" class="sbn-gh" aria-expanded="false" aria-controls="sbn-g-${g}" data-tip="${t}">${ic(g, c)}<span class="sbn-t">${t}</span><span class="sbn-cv">${I.chev}</span></button>
      <div class="sbn-gl" id="sbn-g-${g}" role="group" aria-label="${t}">${list.map(item).join("")}</div></div>`;

  const logo = ($(".nav .logo") || {}).innerHTML || "";
  const side = document.createElement("nav");
  side.className = "sbn"; side.id = "sbn"; side.setAttribute("aria-label", "Navigasi utama");
  side.innerHTML = `<div class="sbn-top"><a class="sbn-brand" href="#/" data-tip="GrowthLab, ke beranda" aria-label="GrowthLab, ke beranda"><span class="logo" aria-hidden="true">${logo}</span><b>GrowthLab</b></a>
      <button type="button" class="sbn-tg" id="sbn-tg" aria-label="Ciutkan sidebar" aria-pressed="false" data-tip="Ciutkan sidebar">${I.panel}</button></div>
    <div class="sbn-nav">${UTAMA.map(item).join("")}<i class="sbn-sep" aria-hidden="true"></i>${GRUP.map(grup).join("")}</div>
    <button type="button" class="sbn-me" data-gx-open data-tip="Perjalanan karier" aria-label="Buka perjalanan karier: level, badge, dan sertifikat">
      <span class="labi idle" aria-hidden="true"></span>
      <span class="sbn-mt"><b>Perjalanan karier</b><small id="sbn-lv">Lv 1 · Pemula</small><i class="sbn-pb" aria-hidden="true"><i></i></i></span>
    </button>`;
  const dim = document.createElement("div"); dim.className = "sbn-dim";
  const tip = document.createElement("div"); tip.className = "sbn-tip"; tip.setAttribute("aria-hidden", "true");
  const fly = document.createElement("div"); fly.className = "sbn-fly"; fly.hidden = true;
  $("header.nav").after(side, dim, tip, fly);
  body.classList.add("sbx");
  side.setAttribute("data-lenis-prevent", "");

  /* ---------- ciutkan / bentangkan (desktop) ---------- */
  const tg = $("#sbn-tg");
  const rel = () => !HP.matches && (!DESK.matches || body.classList.contains("sbn-min"));
  const setMin = m => {
    body.classList.toggle("sbn-min", m); st.set("gl-sb-min", m ? "1" : "0");
    tg.setAttribute("aria-pressed", m); const t = m ? "Bentangkan sidebar" : "Ciutkan sidebar"; tg.setAttribute("aria-label", t); tg.dataset.tip = t;
    tutupFly(); dispatchEvent(new Event("resize"));
  };
  tg.addEventListener("click", () => setMin(!body.classList.contains("sbn-min")));
  setMin(st.get("gl-sb-min") === "1");
  addEventListener("keydown", e => { if ((e.metaKey || e.ctrlKey) && e.key === "\\" && DESK.matches) { e.preventDefault(); setMin(!body.classList.contains("sbn-min")) } });

  /* ---------- grup lipat (mode lebar) / menu melayang (mode rel) ---------- */
  const buka = JSON.parse(st.get("gl-sb-grup") || "{}");
  const setGrup = (g, o, simpan = true) => {
    const el = side.querySelector(`[data-g="${g}"]`); el.classList.toggle("open", o); el.querySelector(".sbn-gh").setAttribute("aria-expanded", o);
    if (simpan) { buka[g] = o; st.set("gl-sb-grup", JSON.stringify(buka)) }
  };
  function tutupFly() { if (!fly.hidden) { fly.hidden = true; fly.innerHTML = ""; side.querySelectorAll(".sbn-gh.fly-on").forEach(b => { b.classList.remove("fly-on"); b.setAttribute("aria-expanded", "false") }) } }
  side.querySelectorAll(".sbn-gh").forEach(b => b.addEventListener("click", () => {
    const g = b.parentElement.dataset.g;
    if (!rel()) { setGrup(g, !b.parentElement.classList.contains("open")); return }
    if (b.classList.contains("fly-on")) { tutupFly(); return }
    tutupFly();
    fly.innerHTML = `<p>${b.dataset.tip}</p>` + b.nextElementSibling.innerHTML.replace(/ id="[^"]*"/g, "");
    fly.hidden = false; b.classList.add("fly-on"); b.setAttribute("aria-expanded", "true");
    const r = b.getBoundingClientRect(); fly.style.left = r.right + 10 + "px";
    fly.style.top = Math.max(8, Math.min(r.top - 8, innerHeight - fly.offsetHeight - 8)) + "px";
    tandai(); (fly.querySelector("a.cur") || fly.querySelector("a")).focus({ preventScroll: true });
  }));
  fly.addEventListener("click", e => { if (e.target.closest("a")) tutupFly() });
  document.addEventListener("click", e => { if (!fly.hidden && !fly.contains(e.target) && !e.target.closest(".sbn-gh")) tutupFly() });
  fly.addEventListener("keydown", e => { if (e.key === "Escape") { const b = side.querySelector(".sbn-gh.fly-on"); tutupFly(); b && b.focus() } });

  /* ---------- tooltip label di mode rel (hover dan fokus keyboard) ---------- */
  const tunjuk = el => {
    if (!rel() || !el || el.classList.contains("fly-on")) { tip.classList.remove("on"); return }
    tip.textContent = el.dataset.tip; const r = el.getBoundingClientRect();
    tip.style.left = r.right + 12 + "px"; tip.style.top = r.top + r.height / 2 + "px"; tip.classList.add("on");
  };
  side.addEventListener("pointerover", e => tunjuk(e.target.closest("[data-tip]")));
  side.addEventListener("pointerleave", () => tip.classList.remove("on"));
  side.addEventListener("focusin", e => { if (e.target.matches(":focus-visible")) tunjuk(e.target.closest("[data-tip]")) });
  side.addEventListener("focusout", () => tip.classList.remove("on"));
  side.addEventListener("scroll", () => { tip.classList.remove("on"); tutupFly() }, { passive: true });

  /* ---------- menu aktif ---------- */
  function tandai() {
    const [s0 = ""] = location.hash.replace(/^#\/?/, "").split("/"), s = s0 || "home";
    const key = s === "lesson" ? "course" : s === "e-learning" ? "katalog" : s;
    document.querySelectorAll(".sbn [data-sk], .sbn-fly [data-sk]").forEach(a => {
      const on = a.dataset.sk === key; a.classList.toggle("cur", on); on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
    GRUP.forEach(([g]) => {
      const el = side.querySelector(`[data-g="${g}"]`), aktif = !!el.querySelector("a.cur");
      el.classList.toggle("has-cur", aktif);
      if (aktif && !el.classList.contains("open")) setGrup(g, true, false);
    });
  }
  GRUP.forEach(([g]) => setGrup(g, !!buka[g], false));
  tandai();
  addEventListener("hashchange", () => { tandai(); tutupFly(); setOpen(false, true) });

  /* ---------- Nilai akhir: buka Latihan lalu gulir ke bagian nilai ---------- */
  side.addEventListener("click", e => {
    const a = e.target.closest('[data-sk="nilai"]'); if (!a) return;
    e.preventDefault(); e.stopPropagation(); setOpen(false, true);
    const go = () => { const n = $("#nilai-sec"); if (n && !n.closest("[hidden]")) n.scrollIntoView({ behavior: RM.matches ? "auto" : "smooth", block: "start" }) };
    if (/^#\/latihan\/?$/.test(location.hash)) { go(); return }
    location.hash = "#/latihan"; setTimeout(go, 1300);   /* tunggu tirai transisi (520 ms) dan Lenis aktif lagi (650 ms) */
  }, true);

  /* ---------- angka progres Materi + kartu profil ---------- */
  const sprog = $("#sprog"), chip = $("#gx-chip"), lv = $("#sbn-lv"), nn = $("#sbn-n");
  const prog = () => {
    const m = sprog && sprog.textContent.match(/(\d+)\s*\/\s*(\d+)/); if (m) nn.textContent = `${m[1]}/${m[2]}`;
    side.style.setProperty("--p", getComputedStyle(document.documentElement).getPropertyValue("--p") || 0);
  };
  const level = () => { const m = chip && (chip.getAttribute("aria-label") || "").match(/Level\s*(\d+),\s*([^,]+)/); if (m) lv.textContent = `Lv ${m[1]} · ${m[2].trim()}` };
  prog(); level();
  sprog && new MutationObserver(prog).observe(sprog, { childList: true, characterData: true, subtree: true });
  chip && new MutationObserver(level).observe(chip, { attributes: true, attributeFilter: ["aria-label"] });
  new MutationObserver(prog).observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

  /* ---------- HP: tombol Menu membuka sidebar sebagai laci ---------- */
  const burger = $("#burger");
  const latar = () => [...body.children].filter(el => el !== side && el !== dim && !el.matches("header.nav, script, style, .sbn-tip, .sbn-fly"));
  const kunciLaci = () => { side.inert = HP.matches && !body.classList.contains("sbn-open") };
  function setOpen(o, dariNavigasi) {
    const was = body.classList.contains("sbn-open"); if (!o && !was) { kunciLaci(); return }
    body.classList.toggle("sbn-open", o);
    latar().forEach(el => { el.inert = o });
    if (burger) { burger.setAttribute("aria-expanded", o); burger.textContent = o ? "Tutup" : "Menu" }
    kunciLaci();
    if (o) setTimeout(() => { const a = side.querySelector("a.cur") || side.querySelector("a"); a && a.focus({ preventScroll: true }) }, 60);
    else if (!dariNavigasi && burger && side.contains(document.activeElement)) burger.focus();
  }
  if (burger) { burger.setAttribute("aria-controls", "sbn"); burger.onclick = () => setOpen(!body.classList.contains("sbn-open")) }
  dim.addEventListener("click", () => setOpen(false));
  addEventListener("keydown", e => { if (e.key === "Escape" && body.classList.contains("sbn-open")) setOpen(false) });
  side.addEventListener("click", e => { if (e.target.closest("a[href]")) setOpen(false, true) });
  HP.addEventListener("change", () => { if (!HP.matches) setOpen(false, true); kunciLaci(); tutupFly() });
  DESK.addEventListener("change", tutupFly);
  kunciLaci();
})();
