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

  /* ---------- ikon doodle HD (2026-11-14), digambar khusus untuk GrowthLab ----------
     Garis tinta tangan (currentColor, ujung bulat, sedikit miring) di atas bidang warna menu (var(--c))
     yang sengaja digeser sedikit dari garisnya, seperti sablon/risograph. Bukan set ikon bawaan. */
  const S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="dd"';
  const I = {
    home: `<svg ${S}><path class="f" d="M6.6 11.2L12.8 6.2l6.6 5.2v9.2H6.7z"/><path d="M3.6 11.4C6.4 9 9.2 6.7 12 4.4c2.9 2.2 5.7 4.5 8.4 6.8"/><path d="M5.7 10v9.5c4.3.4 8.5.4 12.7 0V9.8"/><path d="M10 19.7v-4.6c1.3-.9 2.7-.9 4 0v4.6"/><path d="M16.2 7.1V4.5h2v4.2"/></svg>`,
    katalog: `<svg ${S}><rect class="f" x="4.4" y="4.8" width="7" height="7" rx="2" transform="rotate(-6 7.9 8.3)"/><rect class="f" x="4.6" y="14.6" width="6.8" height="6.8" rx="2"/><rect x="3.2" y="3.4" width="7.2" height="7.2" rx="2.2" transform="rotate(-6 6.8 7)"/><rect x="13.6" y="3.2" width="7.2" height="7.2" rx="2.2" transform="rotate(4 17.2 6.8)"/><rect x="3.4" y="13.6" width="7.2" height="7.2" rx="2.2" transform="rotate(3 7 17.2)"/><path class="f" d="M17.6 13.4c.3 2.3 1.3 3.3 3.6 3.6-2.3.3-3.3 1.3-3.6 3.6-.3-2.3-1.3-3.3-3.6-3.6 2.3-.3 3.3-1.3 3.6-3.6z"/><path d="M17.2 13.2c.3 2.3 1.3 3.3 3.6 3.6-2.3.3-3.3 1.3-3.6 3.6-.3-2.3-1.3-3.3-3.6-3.6 2.3-.3 3.3-1.3 3.6-3.6z"/></svg>`,
    course: `<svg ${S}><path class="f" d="M12.8 7.4c2.2-1.6 4.7-2.1 7.6-1.7v12.4c-2.9-.3-5.3.2-7.6 1.6z"/><path d="M12 6.6C9.8 5 7.1 4.5 3.8 4.9v12.8c3.2-.4 5.9.1 8.2 1.8 2.3-1.7 5-2.2 8.2-1.8V4.9c-3.3-.4-6 .1-8.2 1.7zM12 6.6v12.8"/><path d="M6.4 8.6c1.2-.1 2.3.1 3.3.6M6.4 11.8c1.2-.1 2.3.1 3.3.6"/></svg>`,
    latihan: `<svg ${S}><rect class="f" x="6.2" y="6" width="13.4" height="15.2" rx="2.4"/><rect x="4.6" y="4.4" width="13.8" height="16.2" rx="2.6" transform="rotate(-2 11.5 12.5)"/><path d="M9 5.6V4.6c0-1.2.9-1.9 2.5-1.9s2.5.7 2.5 1.9v1z"/><path d="M8.2 13.2l2.4 2.6 4.8-5.8"/></svg>`,
    nilai: `<svg ${S}><path class="f" d="M11 8.4h4v12h-4z"/><path class="f" d="M19.6 3.6l.6 1.5 1.6.2-1.2 1 .4 1.6-1.4-.8-1.4.8.4-1.6-1.2-1 1.6-.2z"/><path d="M3.6 20.4c5.6-.3 11.2-.3 16.8.1"/><path d="M5.6 20.2v-6.6h3.6v6.6M10.2 20.2V8.8h3.6v11.4M14.8 20.3v-9h3.6v9"/><path d="M19 3.2l.6 1.5 1.6.2-1.2 1 .4 1.6-1.4-.8-1.4.8.4-1.6-1.2-1 1.6-.2z"/></svg>`,
    panduan: `<svg ${S}><path class="f" d="M12.8 5.4h7l2 2.3-2 2.3h-7z"/><path class="f" d="M11.6 11.8H5.4l-1.8 2.2 1.8 2.2h6.2z"/><path d="M12 2.8v18.6M8.6 21.4h6.8"/><path d="M12 4.6h7l2.2 2.4-2.2 2.4h-7"/><path d="M12 11h-6.6l-2 2.3 2 2.4H12"/></svg>`,
    lain: `<svg ${S}><circle class="f" cx="6.8" cy="12.9" r="2.1"/><circle class="f" cx="12.8" cy="12.9" r="2.1"/><circle class="f" cx="18.8" cy="12.9" r="2.1"/><circle cx="6" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="18" cy="12" r="1.9"/></svg>`,
    petunjuk: `<svg ${S}><path class="f" d="M13 4.6a6 6 0 0 1 4.2 10.4c-.8.8-1.2 1.6-1.2 2.6h-5.4c0-1-.4-1.9-1.2-2.6A6 6 0 0 1 13 4.6z"/><path d="M12 3.4a6.1 6.1 0 0 0-4 10.7c.8.7 1.2 1.6 1.2 2.6h5.6c0-1 .4-1.9 1.2-2.6A6.1 6.1 0 0 0 12 3.4z"/><path d="M9.6 19.2h4.8M10.4 21.4h3.2"/><path d="M10.2 9.4c.4-1 1.1-1.6 2-1.8"/><path d="M2.6 9.4h1.2M20.2 9.4h1.2M4.4 3.8l.9.9M19.6 3.8l-.9.9"/></svg>`,
    tujuan: `<svg ${S}><circle class="f" cx="12.6" cy="13.2" r="8"/><circle cx="11.6" cy="12.4" r="8.4"/><circle cx="11.6" cy="12.4" r="4.6"/><circle cx="11.6" cy="12.4" r="1"/><path d="M11.8 12.2l8.4-8.2M17.2 3.2l3.2.4.4 3.2"/></svg>`,
    alur: `<svg ${S}><circle class="f" cx="5.8" cy="18.8" r="2.5"/><path class="f" d="M18.4 3.6l4 1.8-4 1.8z"/><circle cx="5" cy="18" r="2.2"/><path d="M7.6 18h5.9c2 0 3.2-1.2 3.2-2.8s-1.2-2.8-3.2-2.8h-3c-2 0-3.2-1.2-3.2-2.8S8.5 6.8 10.5 6.8h4.6" stroke-dasharray="0.01 2.7"/><path d="M17.8 10V2.8l3.8 1.7-3.8 1.7"/></svg>`,
    peta: `<svg ${S}><path class="f" d="M9.8 5l5.4 2.4v13.4l-5.4-2.4z"/><path d="M3.4 6.4L9 4l6 2.6L20.6 4v13.6L15 20l-6-2.6-5.6 2.4z"/><path d="M9 4v13.4M15 6.6V20"/><path d="M17.8 9.6c0-1 .7-1.6 1.4-1.6"/></svg>`,
    glosarium: `<svg ${S}><path class="f" d="M7.2 4.2h12.6v13.6H7.6c-.9 0-1.6.4-2 1z"/><path d="M4.4 19V5.4c0-1.3.9-2.2 2.2-2.2h12.8v14.2H6.6c-1.3 0-2.2.8-2.2 2s.9 2 2.2 2h12.8"/><path d="M9.4 13.4l2.6-6.6 2.6 6.6M10.3 11.4h3.4"/></svg>`,
    referensi: `<svg ${S}><path class="f" d="M8.2 4.4h10v16.4l-5-3.4-5 3.4z"/><path d="M6.8 3.2h10.4v17.4l-5.2-3.6-5.2 3.6z"/><path d="M9.6 8h4.8M9.6 11h3"/></svg>`,
    faq: `<svg ${S}><path class="f" d="M5.4 5.4h14.4c.9 0 1.6.7 1.6 1.6v8.8c0 .9-.7 1.6-1.6 1.6h-7.6l-4.4 3.6v-3.6H5.4c-.9 0-1.6-.7-1.6-1.6V7c0-.9.7-1.6 1.6-1.6z"/><path d="M4.4 4.2h14.4c1 0 1.8.8 1.8 1.8v8.8c0 1-.8 1.8-1.8 1.8h-7.4l-4.6 3.8v-3.8H4.4c-1 0-1.8-.8-1.8-1.8V6c0-1 .8-1.8 1.8-1.8z"/><path d="M9.6 8.6c0-1.2.9-2 2.1-2s2.1.8 2.1 1.9c0 1.6-2.1 1.7-2.1 3.2"/><path d="M11.7 14.2h.01"/></svg>`,
    komunitas: `<svg ${S}><circle class="f" cx="9.4" cy="8.6" r="3.5"/><path class="f" d="M3.8 20.6c.4-3.6 2.8-5.8 5.8-5.8s5.4 2.2 5.8 5.8z"/><circle cx="8.6" cy="7.8" r="3.4"/><path d="M2.8 20.2c.5-3.7 2.8-5.9 5.8-5.9s5.3 2.2 5.8 5.9"/><path d="M15.4 4.8c1.9-.3 3.6 1 3.6 3s-1.4 3.2-3.2 3.2"/><path d="M17.2 14.6c2.3.6 3.6 2.6 4 5.6"/></svg>`,
    tentang: `<svg ${S}><path class="f" d="M12.8 20.6s-7.6-4.4-7.6-10.2a4.2 4.2 0 0 1 7.6-2.5 4.2 4.2 0 0 1 7.6 2.5c0 5.8-7.6 10.2-7.6 10.2z"/><path d="M12 19.8S4.4 15.4 4.4 9.6A4.2 4.2 0 0 1 12 7.1a4.2 4.2 0 0 1 7.6 2.5c0 5.8-7.6 10.2-7.6 10.2z"/><path d="M7.6 9.4c.2-1 .9-1.7 1.8-1.9"/></svg>`,
    panel: `<svg ${S}><rect class="f" x="4.4" y="5.4" width="5.4" height="14.2" rx="2"/><rect x="3.2" y="4.2" width="17.6" height="15.6" rx="3.4"/><path d="M9.4 4.4v15.2"/></svg>`,
    chev: `<svg ${S}><path d="M9.2 6.2c2.1 1.9 4 3.8 5.8 5.8-1.8 2-3.7 3.9-5.8 5.8"/></svg>`
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
