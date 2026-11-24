/* ==================================================================
   DASHBOARD DOSEN / FASILITATOR (#/dosen), 2026-11-24
   Tampilan saja; semua perhitungan ada di js/39-dosen-hitung.js (GLDH), data contoh di js/40-dosen-contoh.js.
   Alur data: peserta mengunduh "Laporan untuk dosen" di Pengaturan (file .json dari log Fase 5),
   dosen mengimpor file-file itu di sini. Laporan disimpan HANYA di browser dosen (localStorage "gl-dosen").
   Panduan perawatan: docs/DASHBOARD-DOSEN.md
   ================================================================== */
window.GLDOSEN = (() => {
  /* ---------- AKSES: daftar kode fasilitator (simpan SHA-256-nya saja, bukan kodenya) ----------
     Tambah/ganti: jalankan  node tools/kode-dosen.js "kode-baru"  lalu tempel hasilnya di sini.
     Batasan: ini pembatas tampilan di situs statis, bukan pengamanan data. Data peserta tidak pernah
     ada di situs; data hanya ada di file yang dikirim peserta ke dosen. */
  const AKSES = [
    { label: "Dosen pengampu", hash: "01301340e1010221916ccc1732ce02123a4f7efb946f03c0cbc1e7b949a16f02" }
  ];
  const KEY = "gl-dosen", OK = "gl-dosen-ok", DAY = 864e5, LT = "ABCD";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const num = (n, d = 1) => n == null ? "–" : Number(n).toLocaleString("id-ID", { maximumFractionDigits: d });
  const say = m => { try { toast(m) } catch (e) {} };
  const ss = { get: k => { try { return sessionStorage.getItem(k) } catch (e) { return null } }, set: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v) } catch (e) {} } };
  const loadReps = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a.filter(r => r && r.pid && Array.isArray(r.attempts)) : [] } catch (e) { return [] } };
  const saveReps = a => { try { localStorage.setItem(KEY, JSON.stringify(a)); return true } catch (e) { return false } };
  const ago = t => { if (!t) return "belum ada"; const d = Math.floor((Date.now() - t) / DAY); return d <= 0 ? "hari ini" : d === 1 ? "kemarin" : d + " hari lalu" };
  const tgl = t => t ? new Date(t).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
  const ST = { selesai: ["Selesai", "ok"], berjalan: ["Berjalan", "run"], stuck: ["Perlu dibantu", "warn"], belum: ["Belum mulai", "idle"] };
  /* ikon status: bentuk berbeda per status, jadi tidak mengandalkan warna saja */
  const SI = { ok: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    run: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5l6 4.5-6 4.5z" fill="currentColor"/></svg>',
    warn: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2l6.5 11.5h-13z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 6.5v3.2M8 11.6v.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    idle: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="2.6 2.2"/></svg>' };
  const badge = s => `<span class="dsn-st dsn-${ST[s][1]}">${SI[ST[s][1]]}${ST[s][0]}</span>`;
  const pos = p => p.far ? `Bab ${p.far[0] + 1} · Pelajaran ${p.far[1] + 1}` : "–";

  const fresh = () => ({ demo: false, errs: [], q: "", f: "semua", sort: ["status", 1], A: null, live: null, liveAt: 0, liveErr: "", loading: false });
  let V = fresh();
  const KODE = "gl-dosen-kode";   // kode asli disimpan selama sesi tab saja, untuk meminta data live (dicek di server)
  const LIVE = () => !!(window.GLSYNC && GLSYNC.url);

  function ctx() {
    return { chapters: GLD.COURSE.chapters.map(c => ({ t: c.t, n: c.l.length })), quiz: GLD.QUIZ, pass: GLD.PASS_MCQ, now: Date.now(), qv: GLDH.quizVersion(GLD.QUIZ) };
  }
  function data() {
    const reps = V.demo ? GLDOSEN_CONTOH.make(GLD, Date.now()).map(r => GLDH.parse(r).rep) : [...(V.live || []), ...loadReps()];
    return reps.length ? GLDH.analyze(GLDH.merge(reps), ctx()) : null;
  }
  const unlocked = () => { const h = ss.get(OK); return !!h && AKSES.some(a => a.hash === h) };

  /* ---------- kerangka halaman ---------- */
  function html() {
    return `<div class="dsn"><div class="wrap dsn-w" id="dsn-root">${unlocked() ? "" : gate()}</div></div>`;
  }
  function gate() {
    return `<header class="dsn-top"><span class="dsn-k">Khusus dosen &amp; fasilitator</span><h1>Dashboard dosen</h1>
      <p>Halaman ini untuk dosen atau fasilitator yang memantau progres peserta. <b>Kalau kamu peserta, halaman ini bukan untukmu</b>: progres dan hasilmu ada di menu <a href="#/latihan">Latihan</a> dan <a href="#/pengaturan">Pengaturan</a>.</p></header>
      <form class="dsn-gate" id="dsn-gate" novalidate>
        <label for="dsn-code"><b>Kode fasilitator</b><span>Didapat dari pengelola GrowthLab (Kelompok 8).</span></label>
        <div class="dsn-gate-r"><input id="dsn-code" type="password" autocomplete="off" spellcheck="false" aria-describedby="dsn-gate-e" required><button class="btn p" type="submit">Buka dashboard</button></div>
        <p class="dsn-err" id="dsn-gate-e" role="alert"></p>
      </form>`;
  }

  function bind(root) {
    const R = $("#dsn-root", root); if (!R) return;
    if (!unlocked()) {
      const f = $("#dsn-gate", R), inp = $("#dsn-code", R), e = $("#dsn-gate-e", R);
      f.onsubmit = ev => { ev.preventDefault(); const v = inp.value.trim();
        if (!v) { e.textContent = "Masukkan kode fasilitator."; inp.setAttribute("aria-invalid", "true"); inp.focus(); return }
        const h = GLDH.sha256(v);
        if (!AKSES.some(a => a.hash === h)) { e.textContent = "Kode tidak dikenali. Dashboard ini hanya untuk dosen dan fasilitator."; inp.setAttribute("aria-invalid", "true"); inp.select(); return }
        ss.set(OK, h); ss.set(KODE, v); R.innerHTML = ""; draw(R, true); startLive(R) };
      setTimeout(() => inp.focus({ preventScroll: true }), 50);
      return;
    }
    draw(R); startLive(R);
  }
  /* data live: ambil bila belum ada atau sudah lebih dari 30 detik, lalu perbarui tiap menit */
  function startLive(R) { if (!LIVE() || V.demo) return; if (!V.loading && Date.now() - V.liveAt > 30000) fetchLive(R); autoLive(R) }

  /* ---------- isi dashboard ---------- */
  /* ---------- data live (Apps Script); kode fasilitator dicek di server ---------- */
  let tick = 0;
  async function fetchLive(R, quiet) {
    if (!LIVE() || V.demo || V.loading) return;
    const kode = ss.get(KODE);
    if (!kode) { V.liveErr = "Kunci lalu buka lagi dashboard dengan kode fasilitator untuk mengambil data live."; return draw(R) }
    V.loading = true; if (!quiet) draw(R);
    try {
      const r = await (await fetch(GLSYNC.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ op: "data", kode }), redirect: "follow" })).json();
      if (!r || !r.ok) V.liveErr = r && r.err === "kode" ? "Server menolak kode fasilitator. Samakan DOSEN_HASH di Apps Script dengan kode ini." : r && r.err === "tunggu" ? "Terlalu banyak kode salah. Coba lagi 10 menit lagi." : "Server menolak permintaan.";
      else { V.live = (r.reports || []).map(x => GLDH.parse(x)).filter(x => x.ok).map(x => x.rep); V.liveAt = r.at || Date.now(); V.liveErr = "" }
    } catch (e) { V.liveErr = navigator.onLine ? "Server tidak bisa dihubungi. Coba lagi sebentar lagi." : "Tidak ada internet. Data live belum bisa diambil." }
    V.loading = false;
    /* jangan mengganggu yang sedang mengetik atau membaca detail: tunda gambar ulang */
    const busy = document.activeElement && document.activeElement.id === "dsn-q" || ($("#dsn-dlg") || {}).open;
    if (quiet && busy) { const m = $("#dsn-msg", R); if (m) m.innerHTML = msgs(V.A); return }
    draw(R);
  }
  function autoLive(R) {
    clearInterval(tick);
    if (!LIVE()) return;
    tick = setInterval(() => { if (!document.body.contains(R) || !unlocked()) return clearInterval(tick); if (document.visibilityState === "visible") fetchLive(R, true) }, 60000);
  }

  function draw(R, focus) {
    let A = null, fail = null;
    try { A = data() } catch (e) { fail = e; console.error(e) }
    V.A = A;
    const n = A ? A.peserta.length : 0;
    R.innerHTML = `<header class="dsn-top"><span class="dsn-k">Dashboard dosen</span><h1>Kondisi kelas</h1>
        <p>${A ? `${n} peserta dari ${V.demo ? "data contoh" : LIVE() ? "data live dan laporan yang diimpor" : "laporan yang kamu impor"}. Batas lulus kuis ${A.pass}.` : LIVE() ? "Data live dari peserta yang menyalakan pengiriman otomatis, ditambah laporan yang kamu impor." : "Impor laporan peserta untuk melihat progres dan hasil belajar kelas."}</p></header>
      ${V.demo ? `<div class="dsn-demo" role="note"><b>Data contoh.</b> Ini peserta rekaan untuk demo, bukan data asli. Laporan asli tidak tercampur. <button type="button" class="dsn-lnk" data-dsn="demo-off">Kembali ke data asli</button></div>` : ""}
      <div class="dsn-bar">
        ${LIVE() && !V.demo ? `<button type="button" class="btn p" data-dsn="live"${V.loading ? " disabled" : ""}>${V.loading ? "Mengambil data…" : "Ambil data live terbaru"}</button>` : ""}
        <label class="btn ${LIVE() ? "" : "p "}dsn-file"><input type="file" id="dsn-in" accept=".json,application/json" multiple>Impor laporan (.json)</label>
        ${!V.demo && window.GLDOSEN_DEMO && window.GLDOSEN_CONTOH ? `<button type="button" class="btn" data-dsn="demo">Coba dengan data contoh</button>` : ""}
        ${!V.demo && loadReps().length ? `<button type="button" class="btn" data-dsn="clear">Hapus semua laporan</button>` : ""}
        <button type="button" class="btn dsn-lock" data-dsn="lock">Kunci dashboard</button>
      </div>
      <div class="dsn-drop" id="dsn-drop" hidden>Lepaskan file laporan di sini</div>
      <div id="dsn-msg" aria-live="polite">${msgs(A)}</div>
      ${fail ? `<div class="dsn-empty dsn-bad" role="alert"><b>Data tidak bisa diolah.</b><p>Ada laporan yang rusak atau tidak cocok. Hapus semua laporan lalu impor ulang filenya satu per satu untuk mencari yang bermasalah.</p></div>` : A ? body(A) : empty()}`;
    wire(R);
    if (focus) { const h = $("h1", R); h.tabIndex = -1; h.focus({ preventScroll: true }) }
  }

  function msgs(A) {
    const live = LIVE() && !V.demo ? (V.loading && !V.liveAt ? `<li>Mengambil data live dari server…</li>` : V.liveErr ? `<li class="bad"><b>Data live</b>: ${esc(V.liveErr)}</li>` : V.liveAt ? `<li class="ok">Data live diperbarui ${esc(new Date(V.liveAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))} (${V.live.length} peserta). Diperbarui otomatis tiap menit.</li>` : "") : "";
    const m = [...(live ? [live] : []), ...V.errs.map(e => `<li class="bad"><b>${esc(e.f)}</b>: ${esc(e.m)}</li>`), ...(A ? A.warn.map(w => `<li>${esc(w)}</li>`) : [])];
    return m.length ? `<ul class="dsn-msgs">${m.join("")}</ul>` : "";
  }

  function empty() {
    return `<section class="dsn-empty"><h2>Belum ada laporan peserta</h2>
      ${LIVE() ? `<p><b>Data live:</b> peserta membuka <i>Pengaturan</i> → <i>Progres belajar</i>, mengisi kode kelas, lalu menyalakan <b>Kirim progres ke dosen secara otomatis</b>. Data muncul di sini tanpa impor. Cara lain, lewat file:</p>` : ""}
      <ol><li><b>Peserta</b> membuka <i>Pengaturan</i> → <i>Progres belajar</i> → <b>Unduh laporan</b>. Mereka perlu mengisi nama dulu.</li>
      <li>Peserta mengirim file <code>growthlab-laporan-….json</code> ke kamu, misalnya lewat folder Google Drive kelas atau grup WhatsApp.</li>
      <li>Kamu menekan <b>Impor laporan</b> di atas dan memilih semua file sekaligus, atau menyeret file-filenya ke halaman ini.</li></ol>
      <p>Laporan hanya disimpan di browser ini. Laporan baru dari peserta yang sama otomatis menggantikan yang lama.</p></section>`;
  }

  const sec = (k, n, t, d, act, inner) => `<section class="dsn-s" id="dsn-${k}" aria-labelledby="dsn-${k}-h"><header class="dsn-sh"><span class="dsn-n" aria-hidden="true">${String(n).padStart(2, "0")}</span><div><h2 id="dsn-${k}-h">${t}</h2>${d ? `<p>${d}</p>` : ""}</div>${act ? `<div class="dsn-act">${act}</div>` : ""}</header>${inner}</section>`;
  const csvBtn = (k, t) => `<button type="button" class="btn dsn-csv" data-csv="${k}">${t}</button>`;

  function body(A) {
    const K = A.kpi, S = A.cfg.stuck;
    const hard = A.bab.filter(b => b.avg != null).sort((a, b) => a.avg - b.avg)[0];
    const sus = A.soal.filter(s => s.suspect).length;
    /* satu kalimat ringkas di atas, supaya kondisi kelas terbaca dalam beberapa detik */
    const line = [K.stuck ? `<b>${K.stuck} peserta perlu dibantu</b>` : "Tidak ada peserta yang perlu dibantu", hard ? `bab dengan rata-rata terendah: <b>Bab ${hard.i + 1} (${num(hard.avg)})</b>` : null, sus ? `<b>${sus} soal</b> perlu dicek ulang` : null].filter(Boolean).join(", ");
    const kp = (v, t, s, cls = "") => `<div class="dsn-kpi ${cls}"><dt>${t}</dt><dd><b>${v}</b>${s ? `<small>${s}</small>` : ""}</dd></div>`;
    return `<p class="dsn-line">${line}.</p>
    ${sec("ringkas", 1, "Ringkasan", "", "", `<dl class="dsn-kpis">
      ${kp(num(K.total, 0), "Peserta terdaftar", `${K.selesai} selesai, ${K.belum} belum mulai`)}
      ${kp(num(K.aktif, 0), "Aktif 7 hari terakhir", K.total ? num(K.aktif / K.total * 100, 0) + "% dari peserta" : "")}
      ${kp(num(K.avgPct) + "%", "Rata-rata progres", "pelajaran selesai")}
      ${kp(num(K.avgScore), "Rata-rata skor", "skor kuis bab terbaik")}
      ${kp(num(K.stuck, 0), "Perlu dibantu", "lihat alasannya di bawah", K.stuck ? "warn" : "")}</dl>`)}
    ${sec("stuck", 2, "Peserta yang perlu dibantu", `Ditandai bila: tidak aktif ≥ ${S.inactiveDays} hari padahal belum selesai, gagal ≥ ${S.failStreak}× berturut-turut di kuis bab yang sama, atau skor kuis suatu bab selalu di bawah ${A.pass} (minimal ${S.belowPassMin} percobaan).`, K.stuck ? csvBtn("stuck", "Ekspor daftar (CSV)") : "", stuckList(A))}
    ${sec("peserta", 3, "Progres per peserta", "Klik nama peserta untuk melihat riwayat percobaan, skor per bab, dan soal yang dijawab salah.", csvBtn("progres", "Ekspor tabel (CSV)"), table(A))}
    ${sec("bab", 4, "Skor per bab", `Rata-rata skor terbaik peserta yang sudah mencoba kuis bab itu. Garis tegak = batas lulus ${A.pass}.`, "", babChart(A))}
    ${sec("soal", 5, "Soal yang paling sering salah", `Dari semua jawaban kuis (bab dan gabungan). Ditandai <b>mencurigakan</b> bila lebih dari ${num(A.cfg.suspectWrong * 100, 0)}% jawaban salah dengan minimal ${A.cfg.suspectMinN} jawaban: cek apakah soalnya ambigu atau ada miskonsepsi.`, csvBtn("soal", "Ekspor analisis (CSV)"), soalList(A))}
    <dialog class="dsn-dlg" id="dsn-dlg" aria-labelledby="dsn-dlg-h" data-lenis-prevent></dialog>`;
  }

  function stuckList(A) {
    const L = A.peserta.filter(p => p.status === "stuck");
    if (!L.length) return `<p class="dsn-none">Tidak ada peserta yang memenuhi aturan "perlu dibantu".</p>`;
    return `<ul class="dsn-stk">${L.map(p => `<li><button type="button" class="dsn-who" data-pid="${esc(p.pid)}"><b title="${esc(p.nama)}">${esc(p.nama || "(tanpa nama)")}</b><small>${pos(p)} · progres ${num(p.pct, 0)}% · aktif ${ago(p.last)}</small></button>
      <ul class="dsn-why">${p.reasons.map(r => `<li>${esc(r.t)}</li>`).join("")}</ul></li>`).join("")}</ul>`;
  }

  /* ---------- tabel peserta ---------- */
  const COLS = [["nama", "Nama"], ["status", "Status"], ["far", "Posisi terakhir"], ["pct", "Progres"], ["avg", "Skor rata-rata"], ["last", "Aktivitas terakhir"]];
  const ORD = { stuck: 0, berjalan: 1, belum: 2, selesai: 3 };
  function rows(A) {
    const q = V.q.trim().toLowerCase(), f = V.f, [k, dir] = V.sort;
    const key = p => k === "nama" ? (p.nama || "").toLowerCase() : k === "status" ? ORD[p.status] : k === "far" ? (p.far ? p.far[0] * 100 + p.far[1] : -1) : p[k] ?? -1;
    return A.peserta.filter(p => (f === "semua" || p.status === f) && (!q || (p.nama || "").toLowerCase().includes(q)))
      .sort((a, b) => { const x = key(a), y = key(b); return (x < y ? -1 : x > y ? 1 : 0) * dir || (a.nama || "").localeCompare(b.nama || "", "id") });
  }
  function table(A) {
    const F = [["semua", "Semua"], ["selesai", "Selesai"], ["berjalan", "Berjalan"], ["stuck", "Perlu dibantu"], ["belum", "Belum mulai"]];
    const cnt = s => s === "semua" ? A.peserta.length : A.peserta.filter(p => p.status === s).length;
    return `<div class="dsn-tools"><label class="dsn-search"><span class="dsn-sr">Cari nama peserta</span><input type="search" id="dsn-q" placeholder="Cari nama peserta…" value="${esc(V.q)}" autocomplete="off"></label>
      <div class="dsn-seg" role="radiogroup" aria-label="Saring status">${F.map(([v, t]) => `<button type="button" role="radio" aria-checked="${V.f === v}" tabindex="${V.f === v ? 0 : -1}" data-f="${v}">${t} <span>${cnt(v)}</span></button>`).join("")}</div></div>
      <div class="dsn-tw" id="dsn-tw">${tbody(A)}</div>`;
  }
  function tbody(A) {
    const L = rows(A), [k, dir] = V.sort;
    const th = ([c, t]) => `<th scope="col" aria-sort="${c === k ? (dir > 0 ? "ascending" : "descending") : "none"}"><button type="button" data-sort="${c}">${t}<i aria-hidden="true">${c === k ? (dir > 0 ? "▲" : "▼") : "↕"}</i></button></th>`;
    return `<table class="dsn-t"><caption class="dsn-sr">Progres peserta, ${L.length} baris. Tombol di kepala kolom mengurutkan tabel.</caption><thead><tr>${COLS.map(th).join("")}</tr></thead><tbody>
      ${L.length ? L.map(p => `<tr data-pid="${esc(p.pid)}"><th scope="row"><button type="button" class="dsn-who" data-pid="${esc(p.pid)}"><b title="${esc(p.nama)}">${esc(p.nama || "(tanpa nama)")}</b></button></th>
        <td>${badge(p.status)}</td><td data-l="Posisi">${pos(p)}</td>
        <td data-l="Progres"><span class="dsn-pb"><i style="width:${p.pct}%"></i></span><span class="dsn-pv">${num(p.pct, 0)}%</span><small>${p.done}/${p.total}</small></td>
        <td data-l="Skor">${p.avg == null ? '<span class="dsn-mut">belum ada</span>' : `<b class="${p.avg < A.pass ? "dsn-low" : ""}">${num(p.avg)}</b>${p.avg < A.pass ? ' <small class="dsn-low">di bawah batas</small>' : ""}`}</td>
        <td data-l="Aktif" title="${esc(tgl(p.last))}">${ago(p.last)}</td></tr>`).join("") : `<tr><td colspan="6" class="dsn-none">Tidak ada peserta yang cocok dengan pencarian atau saringan ini.</td></tr>`}</tbody></table>`;
  }

  /* ---------- grafik per bab (HTML biasa: angka selalu tertulis, tidak bergantung warna) ---------- */
  function babChart(A) {
    const P = A.pass;
    return `<div class="dsn-chart" role="list" aria-label="Rata-rata skor kuis per bab">${A.bab.map(b => `<div class="dsn-bb" role="listitem">
      <div class="dsn-bl"><b>Bab ${b.i + 1}</b><span>${esc(b.t)}</span></div>
      <div class="dsn-bt" aria-label="${b.avg == null ? `Bab ${b.i + 1}: belum ada percobaan` : `Bab ${b.i + 1}: rata-rata ${num(b.avg)}, ${b.avg >= P ? "di atas" : "di bawah"} batas lulus ${P}`}">
        ${b.avg == null ? `<span class="dsn-mut dsn-bn">Belum ada percobaan kuis</span>` : `<i class="${b.avg < P ? "low" : ""}" style="width:${b.avg}%"></i><span class="dsn-bv">${num(b.avg)}${b.avg < P ? " · di bawah batas" : ""}</span>`}
        <em style="left:${P}%" aria-hidden="true"><span>${P}</span></em></div>
      <dl class="dsn-bs"><div><dt>Peserta mencoba</dt><dd>${b.tried}</dd></div><div><dt>Percobaan</dt><dd>${b.attempts}</dd></div><div><dt>Lulus</dt><dd>${b.tried ? `${b.lulus} (${num(b.lulus / b.tried * 100, 0)}%)` : "–"}</dd></div><div><dt>Materi tuntas</dt><dd>${b.complete} (${num(b.completeRate, 0)}%)</dd></div></dl></div>`).join("")}</div>`;
  }

  /* ---------- analisis soal ---------- */
  function soalList(A) {
    const L = A.soal.filter(s => s.n > 0), none = A.soal.length - L.length;
    if (!L.length) return `<p class="dsn-none">Belum ada jawaban per soal. Jawaban per soal tercatat sejak pembaruan 24 November 2026; minta peserta mengerjakan kuis lalu mengunduh laporan baru.</p>`;
    return `<ol class="dsn-sl">${L.slice(0, 15).map((s, i) => soalItem(s, i)).join("")}</ol>
      ${L.length > 15 ? `<details class="dsn-more"><summary>Tampilkan ${L.length - 15} soal lainnya</summary><ol class="dsn-sl" start="16">${L.slice(15).map((s, i) => soalItem(s, i + 15)).join("")}</ol></details>` : ""}
      ${none ? `<p class="dsn-mut dsn-note">${none} soal belum pernah dijawab dan tidak masuk peringkat.</p>` : ""}`;
  }
  function soalItem(s) {
    const tot = s.n, opt = (k, t) => { const c = s.dist[k] || 0, w = tot ? c / tot * 100 : 0;
      return `<li class="${k === s.key ? "key" : s.top && s.top.p === k ? "top" : ""}"><span class="dsn-ol">${k < 0 ? "–" : LT[k]}</span><span class="dsn-ot">${esc(t)}${k === s.key ? " <b>(kunci)</b>" : s.top && s.top.p === k ? " <b>(distraktor terbanyak)</b>" : ""}</span><span class="dsn-ob"><i style="width:${w}%"></i></span><span class="dsn-on">${c}× · ${num(w, 0)}%</span></li>` };
    return `<li class="dsn-si${s.suspect ? " sus" : ""}"><details><summary>
      <span class="dsn-sw"><b>${num(s.pctWrong, 0)}%</b><small>salah</small></span>
      <span class="dsn-sq"><span class="dsn-sm">Bab ${s.b + 1} · ${s.n} jawaban dari ${s.peserta} peserta${s.suspect ? ' · <span class="dsn-flag">⚑ Mencurigakan</span>' : s.few ? ' · <span class="dsn-mut">data masih sedikit</span>' : ""}</span>
        <span class="dsn-st2">${esc(s.text)}</span>
        ${s.top ? `<span class="dsn-sd">Paling sering dipilih selain kunci: <b>${s.top.p < 0 ? "tidak menjawab (waktu habis)" : LT[s.top.p] + ". " + esc(s.opts[s.top.p])}</b> (${s.top.n}×)</span>` : ""}</span></summary>
      <ul class="dsn-od" aria-label="Sebaran jawaban">${s.opts.map((t, k) => opt(k, t)).join("")}${s.dist[-1] ? opt(-1, "Tidak menjawab (waktu habis)") : ""}</ul></details></li>`;
  }

  /* ---------- detail peserta ---------- */
  function detail(pid) {
    const A = V.A, p = A && A.peserta.find(x => x.pid === pid), d = $("#dsn-dlg"); if (!p || !d) return;
    const W = p.wrong.slice(0, 12);
    d.innerHTML = `<div class="dsn-dh"><div><span class="dsn-k">Detail peserta</span><h2 id="dsn-dlg-h">${esc(p.nama || "(tanpa nama)")}</h2><p>${badge(p.status)} ${pos(p)} · progres ${num(p.pct, 0)}% (${p.done}/${p.total} pelajaran) · aktif terakhir ${ago(p.last)}${p.last ? ` (${esc(tgl(p.last))})` : ""}</p></div>
      <button type="button" class="dsn-x" data-dsn="close" aria-label="Tutup detail">✕</button></div>
      ${p.reasons.length ? `<div class="dsn-dr"><b>Kenapa perlu dibantu</b><ul>${p.reasons.map(r => `<li>${esc(r.t)}</li>`).join("")}</ul></div>` : ""}
      <h3>Skor per bab</h3><table class="dsn-t dsn-t2"><thead><tr><th scope="col">Bab</th><th scope="col">Materi</th><th scope="col">Percobaan</th><th scope="col">Skor terbaik</th></tr></thead><tbody>
        ${p.perBab.map((b, i) => `<tr><th scope="row">Bab ${i + 1}</th><td>${b.lessonsDone}/${A.bab[i] ? GLD.COURSE.chapters[i].l.length : ""}${b.complete ? " ✓" : ""}</td><td>${b.n}</td><td>${b.best == null ? '<span class="dsn-mut">–</span>' : `<b class="${b.best < A.pass ? "dsn-low" : ""}">${num(b.best)}</b> ${b.best >= A.pass ? "lulus" : "belum lulus"}`}</td></tr>`).join("")}</tbody></table>
      <h3>Riwayat percobaan kuis</h3>${p.attempts.length ? `<table class="dsn-t dsn-t2"><thead><tr><th scope="col">Waktu</th><th scope="col">Kuis</th><th scope="col">Benar</th><th scope="col">Skor</th></tr></thead><tbody>
        ${p.attempts.slice().reverse().map(a => `<tr><td>${esc(tgl(a.t))}</td><td>${esc(a.label)}</td><td>${a.benar == null ? "–" : `${a.benar}/${a.n}`}</td><td><b class="${a.lulus ? "" : "dsn-low"}">${num(a.score)}</b> ${a.lulus ? "lulus" : "belum lulus"}</td></tr>`).join("")}</tbody></table>` : `<p class="dsn-none">Belum pernah mengerjakan kuis.</p>`}
      <h3>Soal yang dijawab salah</h3>${!p.qOk ? `<p class="dsn-none">Laporan ini dibuat dengan versi soal yang berbeda, jadi jawaban per soal tidak ditampilkan.</p>` : W.length ? `<ol class="dsn-wl">${W.map(w => { const x = GLD.QUIZ[w.q], tp = Object.entries(w.picks).sort((a, b) => b[1] - a[1])[0];
          return `<li><span class="dsn-sm">Bab ${x.b + 1} · salah ${w.n}×</span><b>${esc(x.q)}</b><span>Jawabannya: ${+tp[0] < 0 ? "tidak menjawab (waktu habis)" : LT[+tp[0]] + ". " + esc(x.o[+tp[0]])}. Kunci: ${LT[x.a]}. ${esc(x.o[x.a])}</span></li>` }).join("")}</ol>${p.wrong.length > 12 ? `<p class="dsn-mut">dan ${p.wrong.length - 12} soal lainnya.</p>` : ""}` : `<p class="dsn-none">${p.attempts.some(a => a.ans) ? "Tidak ada soal yang dijawab salah." : "Belum ada jawaban per soal di laporan ini (laporan lama atau belum mengerjakan kuis)."}</p>`}`;
    try { window.__lenis && window.__lenis.stop() } catch (_) {}
    d.showModal(); $(".dsn-x", d).focus();
  }

  /* ---------- interaksi ---------- */
  function wire(R) {
    const fin = $("#dsn-in", R); if (fin) fin.onchange = () => { importFiles([...fin.files]); fin.value = "" };
    R.onclick = e => {
      const g = e.target.closest("[data-dsn]"), who = e.target.closest(".dsn-who"), so = e.target.closest("[data-sort]"), f = e.target.closest("[data-f]"), c = e.target.closest("[data-csv]");
      if (who) return detail(who.dataset.pid);
      if (so) { const k = so.dataset.sort; V.sort = [k, V.sort[0] === k ? -V.sort[1] : (k === "nama" || k === "status" || k === "far" ? 1 : -1)]; $("#dsn-tw", R).innerHTML = tbody(V.A); const b = $(`[data-sort="${k}"]`, R); b && b.focus(); return }
      if (f) return setF(f, R);
      if (c) return exportCSV(c.dataset.csv);
      if (!g) return;
      const k = g.dataset.dsn;
      if (k === "close") return closeD();
      if (k === "demo") { V.demo = true; V.errs = []; draw(R); say("Menampilkan data contoh.") }
      if (k === "demo-off") { V.demo = false; draw(R); startLive(R) }
      if (k === "live") return fetchLive(R);
      if (k === "lock") { ss.set(OK, null); ss.set(KODE, null); V = fresh(); R.innerHTML = gate(); bind(R.parentNode); say("Dashboard dikunci.") }
      if (k === "clear" && confirm(`Hapus semua ${loadReps().length} laporan peserta dari browser ini? File aslinya tidak ikut terhapus, jadi bisa diimpor lagi.`)) { saveReps([]); V.errs = []; draw(R); say("Semua laporan dihapus dari browser ini.") }
    };
    const q = $("#dsn-q", R); if (q) q.oninput = () => { V.q = q.value; $("#dsn-tw", R).innerHTML = tbody(V.A) };
    R.onkeydown = e => { const r = e.target.closest(".dsn-seg [role=radio]"); if (!r || !/Arrow(Left|Right)/.test(e.key)) return; e.preventDefault();
      const all = $$("[role=radio]", r.parentNode), n = all[(all.indexOf(r) + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length]; setF(n, R); n.focus() };
    const d = $("#dsn-dlg", R);
    if (d) { d.addEventListener("close", () => { try { window.__lenis && window.__lenis.start() } catch (_) {} }); d.addEventListener("click", e => { if (e.target === d) closeD() }) }
    /* seret-lepas file ke halaman */
    const drop = $("#dsn-drop", R);
    R.ondragover = e => { if (![...(e.dataTransfer.types || [])].includes("Files") || V.demo) return; e.preventDefault(); drop.hidden = false };
    R.ondragleave = e => { if (e.target === drop) drop.hidden = true };
    R.ondrop = e => { if (V.demo) return; e.preventDefault(); drop.hidden = true; importFiles([...e.dataTransfer.files]) };
  }
  function setF(b, R) { V.f = b.dataset.f; $$(".dsn-seg [role=radio]", R).forEach(x => { const on = x === b; x.setAttribute("aria-checked", on); x.tabIndex = on ? 0 : -1 }); $("#dsn-tw", R).innerHTML = tbody(V.A) }
  function closeD() { const d = $("#dsn-dlg"); if (d && d.open) d.close() }

  async function importFiles(files) {
    const R = $("#dsn-root"); if (!R || !files.length) return;
    V.demo = false; V.errs = [];
    const cur = loadReps(), add = [];
    for (const f of files) {
      if (f.size > GLDH.CFG.maxFileBytes) { V.errs.push({ f: f.name, m: "file terlalu besar (maks 5 MB)." }); continue }
      let txt; try { txt = await f.text() } catch (e) { V.errs.push({ f: f.name, m: "file tidak bisa dibaca." }); continue }
      const r = GLDH.parse(txt);
      if (!r.ok) { V.errs.push({ f: f.name, m: r.err }); continue }
      if (!r.rep.nama) V.errs.push({ f: f.name, m: "laporan tanpa nama (versi lama). Tetap diimpor sebagai “(tanpa nama)”; minta peserta mengisi nama di Pengaturan lalu mengunduh ulang." });
      add.push(r.rep);
    }
    const all = GLDH.merge([...cur, ...add]);
    if (add.length && !saveReps(all)) V.errs.push({ f: "Penyimpanan", m: "browser menolak menyimpan laporan (penuh atau mode privat). Laporan hanya tampil sampai halaman ditutup." });
    draw(R);
    say(add.length ? `${add.length} laporan diimpor. Total ${all.length} peserta.` : "Tidak ada laporan yang berhasil diimpor.");
  }

  function exportCSV(k) {
    const A = V.A; if (!A) return;
    const d = new Date().toISOString().slice(0, 10), txt = k === "stuck" ? GLDH.stuckCSV(A) : k === "soal" ? GLDH.soalCSV(A) : GLDH.progresCSV(A);
    const name = `growthlab-${k === "stuck" ? "peserta-perlu-dibantu" : k === "soal" ? "analisis-soal" : "progres-peserta"}${V.demo ? "-CONTOH" : ""}-${d}.csv`;
    const a = document.createElement("a"), u = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" }));
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
    say("CSV diunduh: " + name);
  }

  return { html, bind, AKSES };
})();
