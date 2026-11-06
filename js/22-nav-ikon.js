/* navbar ikon (2026-11-06): di desktop tiap menu tampil sebagai ikon; tulisannya memanjang keluar saat hover/fokus.
   Di HP (menu burger) tulisan tetap tampil penuh. Tulisan tidak dihapus, jadi pembaca layar tetap membacanya. */
(() => {
  const links = document.getElementById("links"); if (!links) return;
  const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const IC = {
    course: `<svg viewBox="0 0 24 24" ${S}><path d="M3 5.5c2.8-1 5.8-1 9 1.2 3.2-2.2 6.2-2.2 9-1.2v13c-2.8-1-5.8-1-9 1.2-3.2-2.2-6.2-2.2-9-1.2z"/><path d="M12 6.7v13.2"/></svg>`,
    latihan: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".9" fill="currentColor"/></svg>`,
    petunjuk: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.2 5-5 2.2 2.2-5z"/></svg>`,
    pill: `<svg viewBox="0 0 24 24" ${S}><path d="M7 4h10v4.5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 3 3.6M17 6h2.5a2.5 2.5 0 0 1-3 3.6M12 13.5V17M8.5 20h7M10 17h4"/></svg>`,
    lg: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20c.8-3.6 3.6-5.6 7.2-5.6s6.4 2 7.2 5.6"/></svg>`
  };
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
  const lg = document.getElementById("lg"); if (lg) lg.classList.add("ni-lg");
})();
