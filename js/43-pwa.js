/* 2026-11-24: PWA. Mendaftarkan service worker (sw.js) supaya GrowthLab bisa dipasang sebagai aplikasi dan dibuka tanpa internet,
   lalu menyimpan tawaran pasang dari browser (Chrome, Edge, Android) untuk tombol "Pasang" di Pengaturan.
   Safari (iPhone, iPad, Mac) tidak punya tawaran itu; Pengaturan menampilkan langkah manualnya. */
(() => {
  const ua = navigator.userAgent;
  const P = window.GLPWA = {
    prompt: null,
    onchange: null,
    standalone: matchMedia("(display-mode: standalone)").matches || navigator.standalone === true,
    ios: /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1),
    safari: /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|Android/.test(ua),
    async install() {
      const e = P.prompt; if (!e) return false;
      P.prompt = null; e.prompt();
      const r = await e.userChoice.catch(() => ({}));
      P.onchange && P.onchange();
      return r.outcome === "accepted";
    }
  };
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); P.prompt = e; P.onchange && P.onchange() });
  addEventListener("appinstalled", () => { P.prompt = null; P.standalone = true; P.onchange && P.onchange() });
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol))
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
})();
