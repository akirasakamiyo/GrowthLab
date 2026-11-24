/* 2026-11-24: service worker PWA. GrowthLab bisa dipasang sebagai aplikasi dan dibuka tanpa internet.
   tools/build-pages.sh mengganti __V__ dengan commit dan membuat precache.json (daftar file yang diunduh saat pemasangan).
   - Halaman: ambil dari jaringan dulu, kalau gagal pakai salinan tersimpan.
   - File lain dari situs ini: salinan tersimpan dulu (nama css/js memuat ?v=<commit>, jadi selalu versi yang cocok).
   - Video (.mp4) dan permintaan ke server lain (data live dosen) tidak disimpan; video butuh internet.
   Saat dijalankan dari folder sumber (__V__ belum diganti), semua permintaan lewat jaringan dulu supaya perubahan langsung terlihat. */
const V = "__V__", DEV = V === "__" + "V__", C = "gl-" + V;

self.addEventListener("install", e => e.waitUntil((async () => {
  const c = await caches.open(C);
  let L = [];
  try { L = await (await fetch("precache.json", { cache: "no-store" })).json() } catch (er) {}
  /* satu file gagal tidak boleh membatalkan pemasangan */
  await Promise.all(["./", ...L].map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
  await self.skipWaiting();
})()));

self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith("gl-") && k !== C) await caches.delete(k);
  await self.clients.claim();
})()));

const simpan = async (req, res) => { if (res && res.ok && res.type === "basic") (await caches.open(C)).put(req, res.clone()).catch(() => {}); return res };

self.addEventListener("fetch", e => {
  const q = e.request, u = new URL(q.url);
  if (q.method !== "GET" || u.origin !== location.origin || q.headers.has("range") || /\.mp4$/i.test(u.pathname) || u.pathname.endsWith("/sw.js")) return;
  if (q.mode === "navigate") {
    e.respondWith(fetch(q).then(r => simpan(new Request("./"), r)).catch(async () => (await caches.match("./")) || Response.error()));
    return;
  }
  e.respondWith((async () => {
    const lama = await caches.match(q);
    if (lama && !DEV) return lama;
    try { return await simpan(q, await fetch(q)) } catch (er) { return lama || Response.error() }
  })());
});
