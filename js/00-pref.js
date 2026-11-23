/* ==================================================================
   PREFERENSI PENGGUNA (2026-11-23): tema, animasi, aksesibilitas, audio & video.
   Disimpan di localStorage "gl-pref", terpisah dari progres belajar (mer-done, gl-latihan, gl-gami, ...)
   dan dari profil (nama di "gl-ui"), jadi reset progres tidak menyentuhnya.
   Dimuat di <head> sebelum CSS: kelas dan data-theme di <html> sudah terpasang sebelum halaman tampil (tanpa kedip tema).
   API: GLP.get(), GLP.set({...}), GLP.vol() 0..1, GLP.autoplay(), GLP.reduced(); event "gl-pref" di window saat berubah.
   ================================================================== */
(() => {
  const KEY = "gl-pref";
  const DEF = { theme: "system", anim: true, motion: false, text: "normal", contrast: false, volume: 80, muted: false, autoplay: true, transcript: false };
  const read = () => { try { const d = JSON.parse(localStorage.getItem(KEY) || "{}"); return d && typeof d === "object" && !Array.isArray(d) ? d : {} } catch (e) { return {} } };
  /* data rusak atau dari versi lain: ambil hanya nilai yang valid, sisanya bawaan */
  const clean = d => {
    const o = Object.assign({}, DEF);
    if (["system", "light", "dark"].includes(d.theme)) o.theme = d.theme;
    if (["normal", "besar"].includes(d.text)) o.text = d.text;
    ["anim", "motion", "contrast", "muted", "autoplay", "transcript"].forEach(k => { if (typeof d[k] === "boolean") o[k] = d[k] });
    if (Number.isFinite(d.volume)) o.volume = Math.max(0, Math.min(100, Math.round(d.volume)));
    return o;
  };
  let P = clean(read()), saved = true;
  const realMM = window.matchMedia.bind(window), mqDark = realMM("(prefers-color-scheme: dark)"), sysRM = realMM("(prefers-reduced-motion: reduce)");
  /* "Animasi antarmuka" mati atau "Kurangi gerakan" aktif: skrip yang memeriksa prefers-reduced-motion ikut menganggapnya aktif */
  const userRM = () => !P.anim || P.motion;
  window.matchMedia = function (q) {
    const m = realMM(q), s = String(q);
    if (!/prefers-reduced-motion/.test(s)) return m;
    const want = /no-preference/.test(s) ? () => m.matches && !userRM() : () => m.matches || userRM();
    return { media: m.media, get matches() { return want() }, onchange: null,
      addEventListener: (t, f) => m.addEventListener(t, f), removeEventListener: (t, f) => m.removeEventListener(t, f),
      addListener: f => m.addListener(f), removeListener: f => m.removeListener(f), dispatchEvent: e => m.dispatchEvent(e) };
  };
  const apply = () => {
    const h = document.documentElement, dark = P.theme === "dark" || (P.theme === "system" && mqDark.matches);
    h.dataset.theme = dark ? "dark" : "light";
    h.classList.toggle("gl-noanim", !P.anim);
    h.classList.toggle("gl-rm", P.motion);
    h.classList.toggle("gl-big", P.text === "besar");
    h.classList.toggle("gl-hc", P.contrast);
    h.classList.toggle("gl-reduce", userRM());   // salinan aturan @media (prefers-reduced-motion) di css/28-kurangi-gerak.css
    const mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.content = dark ? "#0e1230" : "#ffc83d";
  };
  const emit = () => { try { dispatchEvent(new CustomEvent("gl-pref", { detail: Object.assign({}, P) })) } catch (e) {} };
  apply();
  mqDark.addEventListener && mqDark.addEventListener("change", () => { if (P.theme === "system") { apply(); emit() } });
  window.GLP = {
    DEF, KEY,
    get: () => Object.assign({}, P),
    set(patch) {
      P = clean(Object.assign({}, P, patch));
      try { localStorage.setItem(KEY, JSON.stringify(P)); saved = true } catch (e) { saved = false }
      apply(); emit(); return Object.assign({}, P);
    },
    saved: () => saved,
    dark: () => document.documentElement.dataset.theme === "dark",
    systemDark: () => mqDark.matches,
    systemRM: () => sysRM.matches,
    vol: () => P.muted ? 0 : P.volume / 100,
    reduced: () => userRM() || sysRM.matches,
    /* video diputar otomatis hanya bila diizinkan dan gerakan tidak sedang dikurangi */
    autoplay: () => P.autoplay && !userRM() && !sysRM.matches
  };
})();
