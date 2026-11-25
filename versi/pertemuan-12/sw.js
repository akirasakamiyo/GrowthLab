/* 2026-11-24: service worker PWA. GrowthLab bisa dipasang sebagai aplikasi dan dibuka tanpa internet.
   tools/build-pages.sh mengganti acbc3cb dengan commit dan membuat precache.json (daftar file yang diunduh saat pemasangan).
   - Halaman: ambil dari jaringan dulu, kalau gagal pakai salinan tersimpan.
   - File lain dari situs ini: salinan tersimpan dulu (nama css/js memuat ?v=<commit>, jadi selalu versi yang cocok).
   - Video (.mp4) dan permintaan ke server lain tidak disimpan; video butuh internet.
   Saat dijalankan dari folder sumber (acbc3cb belum diganti), semua permintaan lewat jaringan dulu supaya perubahan langsung terlihat.
   2026-11-24 (versi beku): salinan versi lama ada di versi/<nama>/ dengan service worker sendiri (tools/bekukan-versi.sh).
   Karena itu nama cache memuat scope, setiap service worker hanya membaca dan menghapus cache miliknya,
   dan service worker utama tidak melayani alamat di bawah versi/. */
const V = "acbc3cb", DEV = V === "__" + "V__";
const SC = new URL(self.registration.scope).pathname;          /* mis. /GrowthLab/ atau /GrowthLab/versi/pertemuan-12/ */
const UTAMA = !/\/versi\/[^/]+\/$/.test(SC);
const P = "gl:" + SC + ":", C = P + V;
/* "gl-<commit>" = nama cache sebelum versi beku ada; hanya service worker utama yang membersihkannya */
const milik = k => k.startsWith(P) || (UTAMA && k.startsWith("gl-"));

self.addEventListener("install", e => e.waitUntil((async () => {
  const c = await caches.open(C);
  let L = [];
  try { L = await (await fetch("precache.json", { cache: "no-store" })).json() } catch (er) {}
  /* satu file gagal tidak boleh membatalkan pemasangan */
  await Promise.all(["./", ...L].map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
  await self.skipWaiting();
})()));

self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (milik(k) && k !== C) await caches.delete(k);
  await self.clients.claim();
})()));

const simpan = async (req, res) => { if (res && res.ok && res.type === "basic") (await caches.open(C)).put(req, res.clone()).catch(() => {}); return res };
const cari = async req => (await caches.open(C)).match(req);

self.addEventListener("fetch", e => {
  const q = e.request, u = new URL(q.url);
  if (q.method !== "GET" || u.origin !== location.origin || q.headers.has("range") || /\.mp4$/i.test(u.pathname) || u.pathname.endsWith("/sw.js")) return;
  if (!u.pathname.startsWith(SC) || (UTAMA && u.pathname.startsWith(SC + "versi/"))) return;   /* milik versi lain */
  if (q.mode === "navigate") {
    e.respondWith(fetch(q).then(r => simpan(new Request("./"), r)).catch(async () => (await cari(new Request("./"))) || Response.error()));
    return;
  }
  e.respondWith((async () => {
    const lama = await cari(q);
    if (lama && !DEV) return lama;
    try { return await simpan(q, await fetch(q)) } catch (er) { return lama || Response.error() }
  })());
});
