/* Latar animasi hero beranda (2026-11-21, pilihan pengguna "C + sedikit B"):
   bintang pixel yang berkelip dan awan pixel yang lewat pelan (gaya Labi dan simulasi pixel),
   ditambah tiga cahaya lembut yang bergeser pelan seperti latar video GrowthLab.
   Semua animasi lewat CSS (css/24-latar-hero.css); prefers-reduced-motion membuat semuanya diam. */
(() => {
  const H = document.querySelector('[data-v="home"]>.hero');
  if (!H || H.querySelector(".hbg")) return;
  const L = document.createElement("div");
  L.className = "hbg"; L.setAttribute("aria-hidden", "true");
  let sd = 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;   /* acak tetap: tata letak sama tiap kunjungan */
  const star = c => `<svg viewBox="0 0 7 7" shape-rendering="crispEdges"><path fill="${c}" d="M3 0h1v2H3zM3 5h1v2H3zM0 3h2v1H0zM5 3h2v1H5zM2 2h3v3H2z"/></svg>`;
  const cloud = '<svg viewBox="0 0 24 9" shape-rendering="crispEdges"><path fill="#fff3d6" d="M6 2h4V1h4v1h2v2h3v1h3v3H1V6h2V4h3z"/></svg>';
  let h = "";
  /* cahaya lembut: [warna, ukuran, kiri %, atas %, geser x, geser y, durasi] */
  [["143,92,255", 640, -8, -18, "90px", "60px", 18], ["31,180,255", 520, 62, -22, "-80px", "90px", 22], ["255,107,61", 420, 48, 62, "70px", "-70px", 20]]
    .forEach(([c, s, x, y, dx, dy, d]) => { h += `<i class="hbg-bl" style="width:${s}px;height:${s}px;left:${x}%;top:${y}%;--c:${c};--x:${dx};--y:${dy};--d:${d}s"></i>` });
  for (let i = 0; i < 30; i++)
    h += `<i class="hbg-px" style="left:${(r() * 100).toFixed(1)}%;top:${(r() * 100).toFixed(1)}%;--s:${[12, 18, 24][i % 3]}px;--d:${(2.6 + r() * 3).toFixed(2)}s;--dl:${(-r() * 5).toFixed(2)}s">${star(["#ffd23f", "#fff3d6", "#7ee0d2", "#ffd23f"][i % 4])}</i>`;
  for (let i = 0; i < 4; i++)
    h += `<i class="hbg-cl" style="top:${10 + i * 22}%;width:${(120 + r() * 140).toFixed(0)}px;--d:${(45 + r() * 30).toFixed(0)}s;--dl:${(-r() * 75).toFixed(1)}s">${cloud}</i>`;
  L.innerHTML = h;
  H.prepend(L);
})();
