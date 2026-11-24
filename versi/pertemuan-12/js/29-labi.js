/* Labi, maskot GrowthLab (2026-11-12). Gaya dan sprite di css/22-labi.css dan assets/maskot/labi.png.
   LABI.html(pose, kelas) membuat elemen maskot; LABI.cheer(teks) memunculkan Labi melompat dengan balon kata
   (dipakai saat pelajaran ditandai selesai). Beranda: Labi menyapa sebentar saat halaman dibuka. */
(() => {
  const html = (pose = "idle", cls = "") => `<span class="labi ${pose} ${cls}" role="img" aria-label="Labi, maskot GrowthLab"></span>`;
  let box = null, tm = 0;
  const cheer = text => {
    if (!box) { box = document.createElement("div"); box.className = "labi-cheer"; box.setAttribute("aria-hidden", "true"); document.body.appendChild(box) }
    box.innerHTML = html("happy") + `<span class="labi-say"></span>`;
    box.querySelector(".labi-say").textContent = text;
    clearTimeout(tm); box.classList.remove("on"); void box.offsetWidth; box.classList.add("on");
    tm = setTimeout(() => box.classList.remove("on"), 2600);
  };
  window.LABI = { html, cheer };
  /* sapaan di beranda: balon kata tampil 3 detik setelah halaman dibuka, lalu muncul lagi saat disentuh/hover */
  const hl = document.querySelector(".hero-labi");
  if (hl) {
    setTimeout(() => { hl.classList.add("say"); setTimeout(() => hl.classList.remove("say"), 3200) }, 1400);
    hl.addEventListener("click", () => { hl.classList.add("say"); setTimeout(() => hl.classList.remove("say"), 2400) });
  }
})();
