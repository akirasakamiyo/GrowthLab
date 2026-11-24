/* ==================================================================
   Beranda versi dashboard (2026-11-24, permintaan Rifa).
   - Pengunjung baru (belum ada pelajaran selesai): beranda lama tetap (judul "Kenali diri, baru lamar kerja.").
   - Setelah minimal 1 pelajaran selesai: kolom kiri hero diganti sapaan + ajakan lanjut ke pelajaran berikutnya,
     video promo tetap di kanan (dengan Labi di pojoknya), lalu papan "Perjalananmu": 15 petak pelajaran per bab,
     kunci kuis tiap bab, dan tahap akhir (simulasi, nilai akhir).
   Data hanya dibaca dari yang sudah ada: done/C/nextUp/locked (js/09-app.js), GLK.latLock, GLG (XP, streak),
   gl-ui.nama (Pengaturan). Gaya di css/29-beranda.css.
   ================================================================== */
window.GLDASH = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/></svg>',
    case: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6"/></svg>'
  };
  const name = () => { try { return ((JSON.parse(localStorage.getItem("gl-ui") || "{}").nama || "") + "").trim().split(/\s+/)[0] } catch (e) { return "" } };
  const on = () => typeof done !== "undefined" && done.size > 0;

  function hero(left) {
    const all = done.size >= total, [i, j] = nextUp(), ch = C.chapters[i], L = ch.l[j], no = C.chapters.slice(0, i).reduce((a, c) => a + c.l.length, 0) + j + 1;
    const left2 = ch.l.length - chCount(i), nm = name();
    const lead = all
      ? "Ke-15 pelajaran sudah kamu selesaikan. Sekarang kerjakan latihan dan simulasi untuk membuka nilai akhir dan sertifikatmu."
      : `Pelajaran ${no} dari ${total}, Bab ${i + 1} · ${esc(ch.t)}. ${left2 > 1 ? `Selesaikan ${left2} pelajaran lagi di bab ini untuk membuka Kuis Bab ${i + 1}.` : `Ini pelajaran terakhir di bab ini. Setelah selesai, Kuis Bab ${i + 1} langsung terbuka.`}`;
    left.innerHTML = `<p class="dsh-hi">${nm ? `Halo, <b>${esc(nm)}.</b>` : "Selamat datang lagi."}</p>
      <h1 class="dsh-h1"><span>${all ? "Semua materi" : "Lanjut ke"}</span><span class="y">${all ? "sudah tuntas." : esc(L.t) + "."}</span></h1>
      <p class="dsh-lead">${lead}</p>
      <div class="dsh-act"><a class="dsh-btn p" href="${all ? "#/latihan" : "#/lesson/" + i + "-" + j}">${all ? "Buka latihan" : "Lanjutkan pelajaran"}${ICON.arrow}</a></div>`;
  }

  function board() {
    const [ni, nj] = nextUp(), all = done.size >= total;
    let info = "";
    try { if (window.GLG && GLG.info) { const I = GLG.info(), S = GLG.streak ? GLG.streak() : null;
      info = `<span class="xp">${ICON.bolt}<b>Level ${I.level}</b> · ${I.xp.toLocaleString("id-ID")} XP</span>` + (S && S.cur ? `<span class="fl">${ICON.flame}<b>${S.cur} minggu</b> berturut-turut</span>` : "") } } catch (e) {}
    let k = 0, n = 0;
    const babs = C.chapters.map((ch, i) => {
      const tiles = ch.l.map((L, j) => {
        const key = i + "-" + j, d = done.has(key), now = !all && i === ni && j === nj, lk = locked(i, j); n++;
        const cls = d ? "dt d" : now ? "dt now" : lk ? "dt kc" : "dt";
        const lab = `Pelajaran ${n}: ${L.t}${d ? ", selesai" : now ? ", berikutnya" : lk ? ", terkunci" : ""}`;
        const inner = (d ? ICON.check : n) + (now ? '<span class="dmini" aria-hidden="true"></span>' : "") + `<span class="dtip" aria-hidden="true">${esc(L.t)}</span>`;
        return lk ? `<span class="${cls}" role="img" aria-label="${esc(lab)}">${inner}</span>`
          : `<a class="${cls}" href="#/lesson/${key}" aria-label="${esc(lab)}" style="--i:${d ? k++ : 0}">${inner}</a>`;
      }).join("");
      const Q = GLK.latLock("kuis", "b" + i), c = chCount(i), sisa = ch.l.length - c;
      const gate = Q.ok
        ? `<a class="dgate ok" href="#/latihan/kuis/b${i}"><i>${ICON.play}</i><span><b>Kuis Bab ${i + 1}</b> sudah terbuka, kerjakan sekarang</span></a>`
        : `<p class="dgate"><i>${ICON.lock}</i><span><b>Kuis Bab ${i + 1}</b> ${c ? `terbuka setelah ${sisa} pelajaran lagi` : "terkunci"}</span></p>`;
      return `<div class="dbab" style="--c:${ch.c1}"><h3>${esc(ch.t)}<small>${c} dari ${ch.l.length}</small></h3><div class="drow">${tiles}</div>${gate}</div>`;
    }).join("");
    const simOk = C.chapters.some((_, i) => chDone(i));
    return `<div class="dbh"><h2 id="dsh-pj">Perjalananmu</h2><div class="dmeta">${info}</div></div>
      <div class="dbabs">${babs}</div>
      <div class="dend"><span>${all ? "Langkah berikutnya:" : "Setelah bab tuntas:"}</span>
        <a class="dstop${simOk ? " ok" : ""}" href="#/latihan"><i>${ICON.case}</i>Simulasi 3 kasus kerja</a><span class="dar" aria-hidden="true"></span>
        <a class="dstop" href="#/latihan"><i>${ICON.trophy}</i>Nilai akhir dan sertifikat</a></div>`;
  }

  function render() {
    const sec = $('[data-v="home"] .hero'); if (!sec) return;
    const orig = $(".hg > div:first-child", sec), art = $("#hero-art");
    let left = $(".dsh-left", sec), bd = $("#dsh-board");
    if (!on()) {   /* pengunjung baru: beranda lama */
      document.body.classList.remove("dash"); if (left) left.remove(); if (bd) bd.remove(); if (orig) orig.hidden = false;
      const lb = $(".dsh-labi"); if (lb) lb.remove(); return;
    }
    document.body.classList.add("dash");
    if (orig) orig.hidden = true;
    if (!left) { left = document.createElement("div"); left.className = "dsh-left"; orig ? orig.after(left) : $(".hg", sec).prepend(left) }
    hero(left);
    if (art && !$(".dsh-labi", art)) art.insertAdjacentHTML("afterbegin", '<span class="labi idle dsh-labi" aria-hidden="true"></span>');
    if (!bd) { bd = document.createElement("section"); bd.id = "dsh-board"; bd.className = "dsh-board"; bd.setAttribute("aria-labelledby", "dsh-pj"); sec.after(bd) }
    bd.innerHTML = `<div class="wrap">${board()}</div>`;
    const hg = $("#hgreet"); if (hg) hg.remove();
  }
  return { render };
})();
/* gamifikasi (XP, streak) dimuat sesudah file ini: render ulang setelah semua skrip siap */
addEventListener("DOMContentLoaded", () => { if (document.body.dataset.view === "home") GLDASH.render() });
