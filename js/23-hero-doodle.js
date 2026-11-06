/* latar doodle beranda (2026-11-06): menggantikan gradien biru hero. Coretan tangan putih/kuning/koral
   yang terus bergerak pelan; ditaruh di tepi supaya teks tetap terbaca. Gerak mati bila "kurangi gerakan". */
(() => {
  const hero = document.querySelector(".hero"); if (!hero || hero.querySelector(".hero-dd")) return;
  const W = "#ffffff", Y = "#ffc83d", C = "#ff8a6b", T = "#7ee0d2";
  const s = (c, w = 4) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  /* setiap doodle: [x, y, skala, kelas animasi, jeda, isi svg (koordinat sekitar 0,0)] */
  const D = [
    [1190, 190, 1.2, "fl", 0, `<path ${s(Y)} d="M-22 6c-10-14-6-38 18-42 26-4 40 20 30 40-4 8-10 12-10 22h-26c0-8-6-12-12-20z"/><path ${s(Y)} d="M-14 34h22M-10 44h14"/><path ${s(W, 3)} d="M-4-62v-12M30-50l8-8M-38-50l-8-8M46-20h12M-54-20h-12"/>`],
    [1330, 330, 1, "tw", .4, `<path ${s(W)} d="M0-26c3 14 9 21 24 24-15 4-21 10-24 24-3-14-9-20-24-24 15-3 21-10 24-24z"/>`],
    [985, 118, .7, "tw", 1.3, `<path ${s(Y)} d="M0-26c3 14 9 21 24 24-15 4-21 10-24 24-3-14-9-20-24-24 15-3 21-10 24-24z"/>`],
    [1270, 650, .8, "tw", 2.1, `<path ${s(C)} d="M0-26c3 14 9 21 24 24-15 4-21 10-24 24-3-14-9-20-24-24 15-3 21-10 24-24z"/>`],
    [1080, 430, 1.1, "pl", 0, `<path ${s(W, 3)} stroke-dasharray="2 12" d="M-150 60c40-10 70-40 110-44"/><path ${s(W)} d="M-30 4L44-26-8 34-12 12z"/><path ${s(W, 3)} d="M-12 12L44-26"/>`],
    [1060, 770, 1, "dr", 0, `<path ${s(T)} pathLength="1" class="dd-line" d="M-90 0c20-24 40-24 60 0s40 24 60 0 40-24 60 0 40 24 60 0"/>`],
    [1355, 790, 1, "wb", .8, `<g transform="rotate(-35)"><path ${s(Y)} d="M-50-10h80l18 10-18 10h-80z"/><path ${s(W, 3)} d="M30-10v20M-50-10v20M48 0h-6"/></g>`],
    [1250, 480, 1, "fl", 1.1, `<path ${s(W)} d="M0-20c-14-8-30-8-44-2v40c14-6 30-6 44 2 14-8 30-8 44-2v-40c-14-6-30-6-44 2z"/><path ${s(W, 3)} d="M0-20v40M-34-8h22M-34 2h22M10-8h22M10 2h22"/>`],
    [1390, 520, .9, "pu", .5, `<path ${s(C)} d="M0 18C-22 4-30-8-26-18c4-10 18-12 26 0 8-12 22-10 26 0 4 10-4 22-26 36z"/>`],
    [90, 170, .9, "sp", 0, `<path ${s(T, 3.5)} d="M0 0c4-4 10 0 8 6-2 8-14 10-20 2-8-10 0-24 14-24 18 0 28 18 20 34-8 18-34 22-48 6"/>`],
    [70, 830, 1, "fl", 1.6, `<circle ${s(Y)} r="24"/><path ${s(Y)} d="M-11 0l8 9 15-17"/>`],
    [860, 90, .9, "dr2", 0, `<path ${s(W)} d="M-50 14c-14 0-18-20-4-24 2-14 22-18 30-6 8-12 30-10 32 6 14 0 16 22 0 24z"/>`],
    [620, 870, 1, "sp", 1, `<path ${s(C)} d="M-40 0c0-26 40-30 46-8 6 22-24 30-26 10-2-22 30-30 50-14"/><path ${s(C)} d="M30-12l4-10 8 8"/>`],
    [1420, 110, .8, "fl", 2.2, `<circle fill="${W}" r="5"/><circle fill="${W}" cx="18" cy="10" r="3.5"/><circle fill="${W}" cx="2" cy="22" r="2.5"/>`],
    [880, 840, .8, "tw", 2.8, `<circle fill="${Y}" r="5"/><circle fill="${Y}" cx="-16" cy="8" r="3"/>`],
    [930, 300, .75, "wb", 1.9, `<path ${s(W, 3)} d="M-16-16l32 32M16-16l-32 32"/>`],
    [560, 70, .6, "tw", .9, `<path ${s(Y)} d="M0-26c3 14 9 21 24 24-15 4-21 10-24 24-3-14-9-20-24-24 15-3 21-10 24-24z"/>`]
  ];
  const g = D.map(([x, y, k, a, d, b]) => `<g transform="translate(${x} ${y}) scale(${k})"><g class="hd-${a}" style="animation-delay:-${d}s">${b}</g></g>`).join("");
  const el = document.createElement("div"); el.className = "hero-dd"; el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">${g}</svg>`;
  hero.prepend(el);
})();
