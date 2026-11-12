/* navbar ikon (2026-11-06): di desktop tiap menu tampil sebagai ikon; tulisannya memanjang keluar saat hover/fokus.
   Di HP (menu burger) tulisan tetap tampil penuh. Tulisan tidak dihapus, jadi pembaca layar tetap membacanya. */
(() => {
  const links = document.getElementById("links"); if (!links) return;
  const S = 'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
  /* ikon gaya "kapur bergetar" (pilihan B, 2026-11-06): garis kapur + aksen kuning, bagian kecilnya terus bergerak.
     Getaran garis berasal dari filter #gl-boil (dipasang di bawah, juga dipakai ikon garis lain di seluruh situs). */
  const IC = {
    course: `<svg viewBox="0 0 48 48" ${S}><path d="M8 30h28v7H8zM11 22h26v8H11zM12 34h20M15 26h18"/><path d="M14 22l3-13 6 1.5-3 11.5z"/><path class="nb-acc nb-rib" d="M30 22v12l3-3 3 3V22"/></svg>`,
    latihan: `<svg viewBox="0 0 48 48" ${S}><rect x="8" y="8" width="24" height="31" rx="3"/><rect x="12" y="14" width="6" height="6" rx="1.5"/><rect x="12" y="26" width="6" height="6" rx="1.5"/><path d="M21 17h7M21 29h7"/><path class="nb-acc nb-chk" d="M12.5 29l2.4 2.6 5-6"/><g class="nb-pen"><path d="M27 31l13-13 4 4-13 13-5 1zM37 21l4 4"/></g></svg>`,
    petunjuk: `<svg viewBox="0 0 48 48" ${S}><path d="M6 12l11-4 13 4 12-4v28l-12 4-13-4-11 4zM17 8v28M30 12v28"/><path class="nb-acc nb-route" d="M10 31c5-8 10 0 14-6s8-4 10-10"/><g class="nb-pin"><path d="M34 4a6 6 0 0 1 6 6c0 5-6 10-6 10s-6-5-6-10a6 6 0 0 1 6-6z"/><circle cx="34" cy="10" r="2"/></g></svg>`,
    pill: `<svg viewBox="0 0 48 48" ${S}><path d="M13 30h22l-3 12H16zM11 27h26v4H11zM24 27V11"/><path class="nb-lf1" d="M24 24c-2-7-8-10-14-9 0 6 6 10 14 9z"/><path class="nb-lf2" d="M24 20c2-8 8-11 15-10 0 7-7 11-15 10z"/><circle class="nb-acc nb-bud" cx="24" cy="9" r="3.5"/></svg>`,
    lg: `<svg viewBox="0 0 48 48" ${S}><circle cx="24" cy="17" r="8"/><path d="M9 41c2-8 8-12 15-12s13 4 15 12"/></svg>`
  };
  /* 2026-11-07: filter kapur bergetar (#gl-boil) tidak dipasang lagi; animasinya berat di Safari */
  const wrap = (el, key) => {
    if (!el || el.classList.contains("ni")) return;
    const t = document.createElement("span"); t.className = "nav-t";
    [...el.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) t.append(n.textContent.trim() + " "), n.remove() });
    t.textContent = t.textContent.trim();
    const ic = document.createElement("span"); ic.className = "ni-ic"; ic.setAttribute("aria-hidden", "true"); ic.innerHTML = IC[key];
    el.prepend(ic, t); el.classList.add("ni");
    if (!el.title) el.title = t.textContent;
  };
  links.querySelectorAll("a[data-k]").forEach(a => wrap(a, a.dataset.k));
  const pill = links.querySelector("a.pill"); wrap(pill, "pill");
  /* cincin progres di ikon "Progres kamu" mengikuti --p di #navbar */
  const bar = document.getElementById("navbar");
  if (pill && bar) { const sync = () => pill.style.setProperty("--p", bar.style.getPropertyValue("--p") || 0); sync(); new MutationObserver(sync).observe(bar, { attributes: true, attributeFilter: ["style"] }) }
  /* tombol Masuk (hanya tampil bila ada server akun): isinya diganti 09-app, jadi cukup diberi kelas */
  /* dropdown Panduan: tutup setelah salah satu halaman dipilih (lepas fokus supaya :focus-within tidak menahannya terbuka) */
  links.querySelectorAll(".ndd-m a, .ndd > a").forEach(a => a.addEventListener("click", () => setTimeout(() => { a.blur(); const m = a.closest(".ndd"); if (m) m.classList.add("ndd-x") }, 0)));
  links.querySelectorAll(".ndd").forEach(m => m.addEventListener("mouseleave", () => m.classList.remove("ndd-x")));
  const lg = document.getElementById("lg"); if (lg) lg.classList.add("ni-lg");
})();
