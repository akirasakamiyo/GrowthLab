/* navbar ikon (2026-11-06): di desktop tiap menu tampil sebagai ikon; tulisannya memanjang keluar saat hover/fokus.
   Di HP (menu burger) tulisan tetap tampil penuh. Tulisan tidak dihapus, jadi pembaca layar tetap membacanya. */
(() => {
  const links = document.getElementById("links"); if (!links) return;
  const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  /* ikon doodle berwarna yang selalu bergerak (revisi 2026-11-06); garis ikut currentColor, isi berwarna */
  const IC = {
    course: `<svg viewBox="0 0 28 28" ${S}><path fill="#ffc83d" d="M3.5 7.2c3.4-1.6 6.6-1.3 10.3 1.4v14.6c-3.6-2.5-6.9-2.8-10.3-1.4z"/><g class="dn-page"><path fill="#fff" d="M13.8 8.6c3.6-2.7 6.9-3 10.6-1.4v14.6c-3.7-1.4-7-1.1-10.6 1.4z"/><path d="M16.6 11.6c1.8-.9 3.6-1.1 5.4-.6M16.6 15c1.8-.9 3.6-1.1 5.4-.6" stroke-width="1.6"/></g></svg>`,
    latihan: `<svg viewBox="0 0 28 28" ${S}><circle cx="13" cy="15" r="10" fill="#fff"/><circle cx="13" cy="15" r="6.4" fill="#ff6b3d"/><circle cx="13" cy="15" r="2.6" fill="#fff"/><g class="dn-dart"><path d="M13.4 14.6L24.5 3.6" stroke-width="2.2"/><path fill="#7ee0d2" d="M22.2 2.6l3.6-.4-.4 3.6-2.6.3z"/></g></svg>`,
    petunjuk: `<svg viewBox="0 0 28 28" ${S}><circle cx="14" cy="14" r="11" fill="#7ee0d2"/><circle cx="14" cy="14" r="7.6" fill="#fff" stroke-width="1.6"/><g class="dn-needle"><path fill="#ff6b3d" d="M14 6.6l2.4 7.4H11.6z" stroke-width="1.6"/><path fill="#2340d8" d="M14 21.4L11.6 14h4.8z" stroke-width="1.6"/></g><circle cx="14" cy="14" r="1.3" fill="currentColor"/></svg>`,
    pill: `<svg viewBox="0 0 28 28" ${S}><g class="dn-cup"><path fill="#ffc83d" d="M8 4.5h12v5.5a6 6 0 0 1-12 0z"/><path d="M8 6.5H5a3 3 0 0 0 3.6 4.3M20 6.5h3a3 3 0 0 1-3.6 4.3M14 16v4M10 23.5h8M11.5 20h5"/></g><path class="dn-spark" fill="#fff" d="M22.5 1.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" stroke-width="1.2"/></svg>`,
    lg: `<svg viewBox="0 0 28 28" ${S}><circle cx="14" cy="10" r="4.4" fill="#ffc83d"/><path fill="#7ee0d2" d="M5.6 23.4c.9-4.2 4.2-6.5 8.4-6.5s7.5 2.3 8.4 6.5z"/></svg>`
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
