/* ==================================================================
   GrowthLab, PENERIMA DATA LIVE (Google Apps Script), 2026-11-24
   Dipasang di akun Google pengelola (bukan di situs). Panduan: tools/apps-script/PASANG.md
   - Peserta (tanpa login, opt-in) mengirim catatan belajar: op "kirim".
   - Dashboard dosen (#/dosen) mengambil data dengan kode fasilitator yang DICEK DI SINI: op "data".
   Tidak ada rahasia di file ini. Kode kelas dan hash kode dosen disimpan di Script Properties:
     KELAS       daftar kode kelas yang boleh mengirim, dipisah koma, mis. "TP8-2026"
     DOSEN_HASH  SHA-256 (hex) kode fasilitator, dipisah koma bila lebih dari satu
   ================================================================== */
var SHEET = "Data";
var COLS = ["diterima", "kelas", "pid", "nama", "t", "type", "data", "qv"];
var TYPES = { lesson_done: 1, quiz: 1, snapshot: 1, aktif: 1 };
var MAX_EV = 200, MAX_DATA = 4000, RATE_N = 600, RATE_S = 600;   // maks 600 event per perangkat per 10 menit

function doPost(e) {
  var b;
  try { b = JSON.parse((e && e.postData && e.postData.contents) || "") } catch (x) { return out({ ok: false, err: "json" }) }
  if (!b || typeof b !== "object") return out({ ok: false, err: "json" });
  if (b.op === "kirim") return out(kirim(b));
  if (b.op === "data") return out(ambil(b));
  return out({ ok: false, err: "op" });
}
function doGet() { return out({ ok: true, app: "growthlab-live", v: 1 }) }

/* ---------- peserta mengirim ---------- */
function kirim(b) {
  var P = PropertiesService.getScriptProperties();
  var kelasOk = String(P.getProperty("KELAS") || "").split(",").map(norm).filter(String);
  var kelas = norm(b.kelas);
  if (!kelas || kelasOk.indexOf(kelas) < 0) return { ok: false, err: "kelas" };
  var pid = String(b.pid || "");
  if (!/^[a-z0-9-]{4,40}$/i.test(pid)) return { ok: false, err: "pid" };
  var nama = String(b.nama || "").replace(/\s+/g, " ").trim().slice(0, 60);
  if (nama.length < 2) return { ok: false, err: "nama" };
  var ev = Array.isArray(b.ev) ? b.ev.slice(0, MAX_EV) : [];
  var now = Date.now(), rows = [];
  ev.forEach(function (x) {
    if (!x || typeof x.t !== "number" || x.t < 1.7e12 || x.t > now + 864e5 || !TYPES[x.type]) return;
    var d = JSON.stringify(x.data || {});
    if (d.length > MAX_DATA) return;
    rows.push([now, kelas, pid, nama, x.t, x.type, d, String(b.qv || "").slice(0, 20)]);
  });
  if (!rows.length) return { ok: true, n: 0 };
  /* batas laju per perangkat */
  var C = CacheService.getScriptCache(), k = "n:" + pid, used = +(C.get(k) || 0);
  if (used + rows.length > RATE_N) return { ok: false, err: "laju" };
  C.put(k, String(used + rows.length), RATE_S);
  var L = LockService.getScriptLock(); L.waitLock(10000);
  try { var sh = sheet(); sh.getRange(sh.getLastRow() + 1, 1, rows.length, COLS.length).setValues(rows) } finally { L.releaseLock() }
  return { ok: true, n: rows.length };
}

/* ---------- dosen mengambil (kode dicek di server) ---------- */
function ambil(b) {
  var P = PropertiesService.getScriptProperties(), C = CacheService.getScriptCache();
  var fails = +(C.get("gagal") || 0);
  if (fails >= 20) return { ok: false, err: "tunggu" };              // 20 kode salah: kunci 10 menit
  var ok = String(P.getProperty("DOSEN_HASH") || "").split(",").map(function (s) { return s.trim().toLowerCase() }).filter(String);
  if (!b.kode || ok.indexOf(sha256(String(b.kode))) < 0) { C.put("gagal", String(fails + 1), 600); Utilities.sleep(700); return { ok: false, err: "kode" } }
  var v = sheet().getDataRange().getValues(), by = {}, seen = {};
  for (var i = 1; i < v.length; i++) {
    var r = v[i], pid = String(r[2]), key = pid + "|" + r[4] + "|" + r[5];
    if (seen[key]) continue; seen[key] = 1;                          // kiriman ulang (respons hilang) tidak dihitung dua kali
    var p = by[pid] || (by[pid] = { pid: pid, kelas: r[1], nama: "", qv: "", last: 0, ev: [] });
    if (+r[0] >= p.last) { p.last = +r[0]; p.nama = String(r[3]); p.qv = String(r[7] || ""); p.kelas = r[1] }
    var d; try { d = JSON.parse(r[6]) } catch (x) { d = {} }
    p.ev.push({ t: +r[4], type: String(r[5]), data: d });
  }
  /* dibentuk seperti file laporan (growthlab-log v2) supaya dashboard memakai jalur baca yang sama */
  var reps = Object.keys(by).map(function (pid) {
    var p = by[pid], done = {};
    p.ev.sort(function (a, c) { return a.t - c.t });
    p.ev.forEach(function (e) { if (e.type === "snapshot" && Array.isArray(e.data.done)) e.data.done.forEach(function (k) { done[k] = 1 }) });
    return { format: "growthlab-log", version: 2, live: true, kelas: p.kelas, exported: new Date(p.last).toISOString(), summary: { device: pid },
      peserta: { nama: p.nama, done: Object.keys(done) }, qv: p.qv || null, sessions: [], events: p.ev.slice(-5000) };
  });
  return { ok: true, at: Date.now(), reports: reps };
}

function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.getRange(1, 1, 1, COLS.length).setValues([COLS]); sh.setFrozenRows(1) }
  return sh;
}
function norm(s) { return String(s || "").trim().toUpperCase() }
function sha256(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8).map(function (x) { return ("0" + (x & 255).toString(16)).slice(-2) }).join("") }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON) }
