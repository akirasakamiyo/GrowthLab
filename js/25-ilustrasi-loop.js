/* ilustrasi loop (2026-11-07): adegan pendek bergaya garis tinta yang berputar terus seperti video loop.
   Dipakai di bingkai halaman Latihan, Alur belajar, dan gambar Ringkasan kursus.
   Semua bagian satu adegan memakai durasi yang sama (--d) supaya tetap sinkron. */
window.GLLOOP = (() => {
  const K = "#1b1740", Y = "#ffd23f", O = "#ff5a3c", T = "#14b8a6", W = "#fff", P = "#fffaf0";
  const s = (c, w = 5) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const svg = (d, body) => `<svg class="lp" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" style="--d:${d}s" aria-hidden="true">${body}</svg>`;

  /* Latihan: jarum stopwatch berputar, tiga centang tergambar bergantian, lalu ulang */
  const latihan = () => svg(6, `
    <g class="lp-tap"><rect x="104" y="46" width="34" height="18" rx="5" fill="${O}" ${s(K, 4)}/></g>
    <circle cx="121" cy="150" r="78" fill="${W}" ${s(K, 6)}/>
    <g ${s(K, 3)} opacity=".35">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<path d="M121 82v10" transform="rotate(${i * 30} 121 150)"/>`).join("")}</g>
    <g class="lp-hand"><path d="M121 150V92" ${s(O, 7)}/></g>
    <circle cx="121" cy="150" r="11" fill="${K}"/>
    <rect x="236" y="62" width="128" height="176" rx="16" fill="${Y}" ${s(K, 6)}/>
    ${[0, 1, 2].map(i => `<path class="lp-chk lp-c${i}" d="M258 ${108 + i * 52}l12 14 24-26" pathLength="1" ${s(K, 7)}/>
    <path class="lp-ln lp-c${i}" d="M306 ${110 + i * 52}h40" pathLength="1" ${s(K, 6)}/>`).join("")}
    <g class="lp-star">${[[220, 60], [384, 250], [60, 250]].map(([x, y], i) => `<path class="lp-tw lp-t${i}" d="M${x} ${y - 12}v24M${x - 12} ${y}h24" ${s(W, 4)}/>`).join("")}</g>`);

  /* Alur belajar: bidak berjalan 1 → 2 → 3 → 4, tiap titik menyala saat dilewati */
  const alurPath = "M70 225C110 150 160 140 190 175S260 245 290 180S330 95 350 90";
  const alur = () => svg(6.4, `
    <path d="${alurPath}" ${s(K, 7)} stroke-dasharray="2 16" opacity=".55"/>
    <path class="lp-trail" d="${alurPath}" pathLength="1" ${s(Y, 7)}/>
    ${[[70, 225, O, "1", "Materi"], [190, 175, Y, "2", "Latihan"], [290, 180, T, "3", "Simulasi"], [350, 90, "#7c5cff", "4", "Nilai"]].map(([x, y, c, n, t], i) => `
    <g class="lp-node lp-n${i}" style="transform-origin:${x}px ${y}px"><circle cx="${x}" cy="${y}" r="24" fill="${c}" ${s(K, 6)}/>
    <text x="${x}" y="${y + 9}" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="25" fill="${i === 1 ? K : W}">${n}</text></g>
    <text class="lp-lbl lp-n${i}" x="${x}" y="${y + (i === 3 ? -36 : 50)}" text-anchor="middle" font-family="DM Sans,system-ui,sans-serif" font-weight="700" font-size="15" fill="${W}">${t}</text>`).join("")}
    <g class="lp-pawn" style="offset-path:path('${alurPath}')"><circle r="13" fill="${W}" ${s(K, 5)}/></g>`);

  /* Ringkasan kursus: toga → CV yang menumbuhkan tunas → koper yang dilingkari */
  const kursus = (c = K, a = O, b = T) => svg(7, `
    <g ${s(c, 4.5)}><path d="M28 70l52-22 52 22-52 22z"/><path d="M52 81v24c18 12 38 12 56 0V81"/><path d="M132 70v28" stroke="${a}"/><circle cx="132" cy="103" r="4.5" stroke="${a}"/></g>
    <path class="lp-p1" d="M86 112C98 170 140 196 182 200" pathLength="1" ${s(c, 3.5)} stroke-dasharray="0.02 0.035"/>
    <g ${s(c, 4.5)} transform="rotate(-6 210 240)"><path d="M160 196h88l18 18v82H160z"/><path d="M248 196v18h18"/><rect x="174" y="212" width="26" height="30" rx="4"/><path d="M210 220h36M210 234h24M174 258h76" stroke-width="3.5"/></g>
    <g class="lp-sprout" style="transform-origin:212px 198px"><path d="M212 198c-4-26 2-46 16-64" ${s(a, 4.5)}/><path class="lp-leaf1" d="M222 158c-20-1-36-14-38-32 22-1 36 13 38 32z" ${s(a, 4.5)}/><path class="lp-leaf2" d="M228 142c11-20 31-28 48-22-4 20-24 29-48 22z" ${s(a, 4.5)}/></g>
    <path class="lp-p2" d="M246 196C284 186 306 150 312 116" pathLength="1" ${s(c, 3.5)} stroke-dasharray="0.02 0.035"/>
    <g ${s(c, 4.5)}><rect x="282" y="48" width="78" height="56" rx="8"/><path d="M306 48v-10h30v10M282 70h78"/><rect x="314" y="64" width="14" height="12" rx="3" stroke="${a}"/></g>
    <path class="lp-ring" d="M270 40c18-28 104-28 112 6 6 30-44 76-98 66-38-8-34-56 6-66" pathLength="1" ${s(b, 4)}/>
    <path class="lp-tw lp-t0" d="M372 170v24M360 182h24" ${s(b, 3.5)}/><path class="lp-tw lp-t1" d="M36 240v20M26 250h20" ${s(c, 3.5)}/>`);


  /* kartu bab: viewBox lebih pendek (400×200) supaya pas di gambar kartu */
  const svg2 = (d, body) => `<svg class="lp" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet" style="--d:${d}s" aria-hidden="true">${body}</svg>`;
  /* Bab 1 Self-Management: centang tergambar, tunas tumbuh di pot, matahari berputar */
  const bab0 = () => svg2(6, `
    <rect x="70" y="34" width="78" height="104" rx="9" fill="${W}" ${s(K, 5)}/>
    ${[0, 1, 2].map(i => `<path class="lp-chk lp-c${i}" d="M84 ${62 + i * 28}l8 9 16-17" pathLength="1" ${s(K, 6)}/><path class="lp-ln lp-c${i}" d="M114 ${64 + i * 28}h22" pathLength="1" ${s(K, 5)}/>`).join("")}
    <g class="lp-sun" style="transform-origin:316px 52px">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M316 18v12" transform="rotate(${i * 45} 316 52)" ${s(K, 5)}/>`).join("")}</g>
    <circle class="lp-glow" cx="316" cy="52" r="18" fill="${Y}" ${s(K, 5)}/>
    <g class="lp-sprout" style="transform-origin:236px 150px"><path d="M236 150c-2-26 0-46 4-62" ${s(K, 5)}/><path class="lp-leaf1" d="M238 120c-18-2-30-12-32-26 18-1 30 10 32 26z" fill="${T}" ${s(K, 4.5)}/><path class="lp-leaf2" d="M240 104c8-18 26-26 40-22-3 18-21 26-40 22z" fill="${T}" ${s(K, 4.5)}/></g>
    <path d="M206 146h60l-8 40h-44z" fill="${O}" ${s(K, 5)}/><path d="M200 146h72" ${s(K, 6)}/>`);
  /* Bab 2 Emotional Intelligence: dua orang terhubung, hati berdenyut, hati kecil melayang */
  const person = (x, body, hair) => `<path d="M${x - 40} 190c0-30 18-46 40-46s40 16 40 46z" fill="${body}" ${s(K, 5)}/><circle cx="${x}" cy="112" r="24" fill="#f2b48c" ${s(K, 5)}/><path d="M${x - 24} 108c0-18 10-28 24-28s24 10 24 28c-12-8-34-8-48 0z" fill="${hair}" ${s(K, 4)}/><circle cx="${x - 8}" cy="114" r="3" fill="${K}"/><circle cx="${x + 8}" cy="114" r="3" fill="${K}"/><path d="M${x - 8} 124q8 7 16 0" ${s(K, 3)}/>`;
  const heart = (x, y, k) => `<path d="M${x} ${y + 14 * k}c-${20 * k}-${12 * k}-${26 * k}-${24 * k}-${20 * k}-${32 * k}s${16 * k}-${8 * k} ${20 * k} ${2 * k}c${4 * k}-${10 * k} ${14 * k}-${10 * k} ${20 * k}-${2 * k}s0 ${20 * k}-${20 * k} ${32 * k}z"`;
  const bab1 = () => svg2(5, `
    ${person(124, T, K)}${person(276, "#7c5cff", "#7a3b1d")}
    <path class="lp-link" d="M150 168c30 10 70 10 100 0" pathLength="1" ${s(K, 4.5)} stroke-dasharray=".04 .05"/>
    <g class="lp-beat" style="transform-origin:200px 70px">${heart(200, 70, 1.6)} fill="${O}" ${s(K, 5)}/></g>
    ${[[172, 92, 0], [230, 96, 1], [200, 100, 2]].map(([x, y, i]) => `<g class="lp-float lp-f${i}">${heart(x, y, .55)} fill="none" ${s(K, 3)}/></g>`).join("")}`);
  /* Bab 3 Thinking Skill: roda gigi berputar di bohlam, "?" muncul, bohlam menyala, lalu "!" */
  const gear = (x, y, r, c) => `<g class="lp-gear" style="transform-origin:${x}px ${y}px">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${x - 4}" y="${y - r - 7}" width="8" height="10" rx="2" fill="${K}" transform="rotate(${i * 45} ${x} ${y})"/>`).join("")}<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${s(K, 4)}/><circle cx="${x}" cy="${y}" r="${r * .35}" fill="${W}" ${s(K, 3)}/></g>`;
  const bab2 = () => svg2(6, `
    <circle class="lp-halo" cx="200" cy="82" r="66" fill="${Y}" opacity=".0"/>
    <path d="M200 26c-34 0-58 24-58 56 0 22 12 36 24 48v16h68v-16c12-12 24-26 24-48 0-32-24-56-58-56z" fill="${Y}" ${s(K, 6)}/>
    <rect x="170" y="146" width="60" height="22" rx="6" fill="${W}" ${s(K, 5)}/><path d="M178 157h44" ${s(K, 4)}/>
    ${gear(184, 82, 17, K).replace(`fill="${K}" ${s(K, 4)}`, `fill="${K}" ${s(K, 4)}`)}<g class="lp-gear2" style="transform-origin:224px 98px">${gear(224, 98, 11, O).replace('class="lp-gear"', 'class="lp-gear-r"')}</g>
    <g class="lp-q"><rect x="60" y="112" width="46" height="40" rx="8" fill="${W}" ${s(K, 5)}/><text x="83" y="142" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="26" fill="${K}">?</text></g>
    <g class="lp-ex"><rect x="294" y="112" width="46" height="40" rx="8" fill="${T}" ${s(K, 5)}/><text x="317" y="142" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="26" fill="${W}">!</text></g>
    ${[0, 1, 2, 3, 4].map(i => `<path class="lp-ray" d="M200 2v-0" transform="rotate(${-60 + i * 30} 200 82)" ${s(W, 0)}/>`).join("")}
    <g class="lp-rays">${[-60, -30, 0, 30, 60].map(a => `<path d="M200 4v12" transform="rotate(${a} 200 82)" ${s(K, 5)}/>`).join("")}</g>`);


  /* video loop bergaya video promo (render 6 detik, berulang mulus). Dipakai untuk kursus, kartu bab, latihan, petunjuk. */
  const vid = n => `<video class="vloop" src="assets/video/loop/${n}.mp4" poster="assets/video/loop/${n}.jpg" autoplay muted loop playsinline preload="metadata" disablepictureinpicture aria-hidden="true"></video>`;
  if (!window.__vloopIO && "IntersectionObserver" in window) {
    const rm = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const io = window.__vloopIO = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !rm) { const p = v.play(); p && p.catch(() => {}) } else v.pause() }), { rootMargin: "80px" });
    new MutationObserver(() => document.querySelectorAll("video.vloop:not([data-io])").forEach(v => { v.dataset.io = 1; if (rm) { v.removeAttribute("autoplay"); v.pause() } io.observe(v) })).observe(document.body, { childList: true, subtree: true });
  }
  /* lukisan impasto kartu bab (2026-11-12): Bab 1 kintsugi, Bab 2 dua lentera, Bab 3 gunung es */
  const luk = (n, alt) => `<img class="luk" src="assets/lukisan/bab${n}.jpg" alt="${alt}" width="1000" height="500" decoding="async">`;
  return { latihan: () => vid("latihan"), petunjuk: () => vid("petunjuk"), alur, kursus: () => vid("kursus"), c0: () => luk(1, "Lukisan pot retak bertambal emas dengan tunas"), c1: () => luk(2, "Lukisan dua lentera yang cahayanya saling bertemu"), c2: () => luk(3, "Lukisan gunung es dengan bara kecil di dasarnya"), svgLatihan: latihan, svgKursus: kursus };
})();
