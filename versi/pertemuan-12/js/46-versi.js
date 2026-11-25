/* ==================================================================
   Versi produk (2026-11-24, permintaan Rifa dan dosen).
   Setiap tahap pengumpulan dibekukan sebagai salinan di versi/<slug>/ (tools/bekukan-versi.sh),
   sedangkan alamat utama terus dikembangkan sampai produk final (9 Desember 2026).
   Dosen bisa membuka dan membandingkan semua versi dari kartu "Versi produk" di halaman Tentang.
   - Tambah versi: tambahkan baris di DAFTAR, commit, lalu jalankan  tools/bekukan-versi.sh <slug>.
   - Di salinan beku tampil label kecil "Versi ..." dengan tautan ke versi terbaru.
   Dimuat sebelum js/09-app.js karena halaman Tentang memanggil GLVERSI.card().
   ================================================================== */
window.GLVERSI = (() => {
  const DAFTAR = [
    { slug: "pertemuan-12", nama: "Pertemuan 12", tgl: "25 November 2026",
      ket: "Produk setelah revisi masukan dosen Pertemuan 11, dikumpulkan di kolom SPS Pertemuan 12." }
  ];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const m = location.pathname.match(/^(.*\/)versi\/([^/]+)\//);
  const ROOT = m ? m[1] : location.pathname.replace(/[^/]*$/, "");
  const cur = m ? (DAFTAR.find(v => v.slug === m[2]) || { slug: m[2], nama: m[2].replace(/-/g, " "), tgl: "", ket: "" }) : null;
  const href = slug => slug ? ROOT + "versi/" + slug + "/" : ROOT;

  /* kartu daftar versi (halaman Tentang) */
  function card() {
    const rows = [{ slug: "", nama: "Versi terbaru", tgl: "Terus diperbarui", ket: "Versi yang terus dikembangkan sampai produk final, 9 Desember 2026." }, ...DAFTAR];
    return `<h2 class="rv" id="versi" style="margin-top:56px">Versi produk</h2>
      <p class="rv lead2">Setiap tahap pengumpulan disimpan sebagai versi tersendiri yang tidak berubah lagi, sehingga perkembangan produk dapat dibandingkan.</p>
      <div class="gl-vlist rv">${rows.map(v => { const aktif = cur ? cur.slug === v.slug : !v.slug;
        return `<div class="gl-v${aktif ? " on" : ""}"><div><b>${esc(v.nama)}</b><small>${esc(v.tgl)}</small><p>${esc(v.ket)}</p></div>
          ${aktif ? `<span class="gl-v-now">Sedang dibuka</span>` : `<a class="btn" href="${esc(href(v.slug))}">Buka versi ini</a>`}</div>` }).join("")}</div>`;
  }

  /* label di salinan beku */
  if (cur) addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("beforeend", `<a class="gl-vpill" href="${esc(href(""))}" title="Buka versi terbaru"><b>Versi ${esc(cur.nama)}</b><span>${cur.tgl ? esc(cur.tgl) + " · " : ""}lihat versi terbaru</span></a>`);
  });
  return { cur, card, href, DAFTAR };
})();
