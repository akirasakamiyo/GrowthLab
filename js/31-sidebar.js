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

  /* ---------- ikon pixel art 12x12 (2026-11-14), satu gaya dengan Labi dan ilustrasi pixel ----------
     Tiap ikon digambar per piksel: # = garis (currentColor), f = bidang warna menu (var(--c)), h = sorotan krem, . = kosong.
     Digambar sebagai <path> berisi kotak-kotak, shape-rendering crispEdges supaya tepinya tajam. */
  const PX = {
    home: ["............", ".....##.....", "....#ff#....", "...#ffff#...", "..#ffffff#..", ".##########.", "..#hhhhhh#..", "..#h#ff#h#..", "..#h#ff#h#..", "..#h#ff#h#..", "..########..", "............"],
    katalog: ["............", ".####..####.", ".#ff#..#hh#.", ".#ff#..#hh#.", ".####..####.", "............", "............", ".####..####.", ".#hh#..#ff#.", ".#hh#..#ff#.", ".####..####.", "............"],
    course: ["............", ".###....###.", "#fff#..#hhh#", "#ffff##hhhh#", "#ffff##hhhh#", "#ffff##hhhh#", "#ffff##hhhh#", "#ffff##hhhh#", "#ffff##hhhh#", ".####..####.", ".....##.....", "............"],
    latihan: ["............", "....####....", ".###h##h###.", ".#ffffffff#.", ".#ffffff#f#.", ".#fffff#ff#.", ".#f#ff#fff#.", ".#ff##ffff#.", ".#ffffffff#.", ".#ffffffff#.", ".##########.", "............"],
    nilai: ["............", ".........###", ".........#f#", ".....###.#f#", ".....#h#.#f#", ".....#h#.#f#", ".###.#h#.#f#", ".#f#.#h#.#f#", ".#f#.#h#.#f#", ".#f#.#h#.#f#", "############", "............"],
    panduan: [".....##.....", "..########..", "..#fffffff#.", "..#ffffffff#", "..#fffffff#.", "..########..", ".....##.....", ".########...", ".#hhhhhhh#..", "#hhhhhhhh#..", ".#hhhhhhh#..", ".########..."],
    lain: ["............", "............", "............", "............", "............", ".hh..hh..hh.", ".hhf.hhf.hhf", "..ff..ff..ff", "............", "............", "............", "............"],
    petunjuk: ["............", ".##########.", ".#ffffffff#.", ".#fffhhfff#.", ".#ffffffff#.", ".#ffhhhfff#.", ".#fffhhfff#.", ".#fffhhfff#.", ".#ffhhhhff#.", ".#ffffffff#.", ".##########.", "............"],
    tujuan: ["............", "....####....", "..##hhhh##..", ".#hh####hh#.", ".#h#ffff#h#.", "#hh#f##f#hh#", "#hh#f##f#hh#", ".#h#ffff#h#.", ".#hh####hh#.", "..##hhhh##..", "....####....", "............"],
    alur: ["............", "........###.", ".hhhhhhh#f#.", ".h......###.", ".h..........", ".hhhhhhhhh..", ".........h..", ".........h..", "###......h..", "#f#hhhhhhh..", "###.........", "............"],
    peta: ["............", ".##########.", ".#ff#hh#ff#.", ".#ff#hh#ff#.", ".#ff#hh#ff#.", ".#ff#hh#ff#.", ".#ff#hh#ff#.", ".#ff#hh#ff#.", ".#ff#hh#ff#.", ".#ff#hh#ff#.", ".##########.", "............"],
    glosarium: ["............", ".#########..", ".#hffffff#..", ".#hff##ff#..", ".#hf#ff#f#..", ".#hf####f#..", ".#hf#ff#f#..", ".#hffffff#..", ".##########.", ".#hhhhhhhh#.", ".##########.", "............"],
    referensi: ["............", "..########..", "..#ffffff#..", "..#fhhhff#..", "..#ffffff#..", "..#fhhhhf#..", "..#ffffff#..", "..#ffffff#..", "..#ff##ff#..", "..#f#..#f#..", "..##....##..", "............"],
    faq: ["............", ".##########.", ".#ff###fff#.", ".#f#fff#ff#.", ".#fffff#ff#.", ".#ffff#fff#.", ".#fff#ffff#.", ".#ffffffff#.", ".#fff#ffff#.", ".#f########.", ".##.........", "............"],
    komunitas: ["............", ".###....###.", "#fff#..#hhh#", "#fff#..#hhh#", ".###....###.", "............", ".###....###.", "#fff#..#hhh#", "#fff#..#hhh#", "#fff#..#hhh#", "#####..#####", "............"],
    tentang: ["............", "............", "..###..###..", ".#hhf##fff#.", "#hfffffffff#", "#ffffffffff#", ".#ffffffff#.", "..#ffffff#..", "...#ffff#...", "....#ff#....", ".....##.....", "............"],
    panel: ["............", "............", ".##########.", ".#hh#.....#.", ".#hh#.....#.", ".#hh#.....#.", ".#hh#.....#.", ".#hh#.....#.", ".#hh#.....#.", ".##########.", "............", "............"],
    chev: ["............", "............", "............", "....##......", ".....##.....", "......##....", "......##....", ".....##.....", "....##......", "............", "............", "............"]
  };
  const pxPath = (rows, ch) => rows.map((r, y) => { let d = "", x = 0; while (x < r.length) { if (r[x] !== ch) { x++; continue } let n = 0; while (r[x + n] === ch) n++; d += `M${x} ${y}h${n}v1h-${n}z`; x += n } return d }).join("");
  const I = {};
  for (const k in PX) {
    const r = PX[k], h = pxPath(r, "h"), f = pxPath(r, "f");
    I[k] = `<svg class="pxi" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${f ? `<path class="f" d="${f}"/>` : ""}${h ? `<path class="h" d="${h}"/>` : ""}<path class="o" d="${pxPath(r, "#")}"/></svg>`;
  }
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
