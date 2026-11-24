/* ==================================================================
   Halaman Laporan pengembangan (#/laporan), 2026-11-24, permintaan Rifa dan dosen.
   Ringkasan proses pengembangan GrowthLab mengikuti model Hannafin dan Peck:
   analisis kebutuhan, desain, pengembangan dan implementasi, dengan evaluasi dan revisi di setiap tahap.
   Sumber: CATATAN.md, riwayat git (cabang kode), notulensi pertemuan dosen.
   Hasil uji ahli media dan uji pengguna diisi di UJI setelah dilaksanakan.
   Dipanggil dari renderPage (js/09-app.js) lewat GLLAP.html(helper). Gaya di css/30-laporan.css.
   ================================================================== */
window.GLLAP = (() => {
  const TAHAP = [
    ["1", "Analisis kebutuhan", "Mengidentifikasi masalah, karakteristik sasaran, dan kebutuhan belajar.", "#ffd23f"],
    ["2", "Desain", "Merancang materi, tujuan, alur, storyboard, tampilan, dan strategi evaluasi.", "#14b8a6"],
    ["3", "Pengembangan dan implementasi", "Membangun produk, menerbitkannya, lalu menguji dan memperbaikinya.", "#ff6b3d"]
  ];
  const ANALISIS = [
    ["Masalah", "Lulusan SMK memiliki tingkat pengangguran terbuka tertinggi dibandingkan jenjang pendidikan lain (BPS, Februari 2025: 8 persen). Selain keterampilan teknis, dunia kerja menuntut kemampuan mengelola diri, mengelola emosi, dan berpikir jernih."],
    ["Sasaran", "Peserta didik SMK kelas XII dan lulusan baru yang sedang atau akan mencari kerja."],
    ["Kebutuhan", "Materi soft skill yang ringkas, latihan yang langsung memberi umpan balik, dan kesempatan berlatih mengambil keputusan dalam situasi kerja tanpa risiko."],
    ["Kondisi belajar", "Belajar mandiri melalui ponsel atau laptop, tanpa akun, dan tetap dapat digunakan ketika koneksi internet terbatas."],
    ["Keluaran", "GBIM (Garis Besar Isi Media) dengan judul pengembangan, sasaran, topik, dan ruang lingkup tiga bab."]
  ];
  const DESAIN = [
    ["Jabaran Materi", "15 pelajaran dalam 3 bab (Self-Management, Emotional Intelligence, Thinking Skill). Judul pelajaran mengikuti Jabaran Materi."],
    ["Tujuan pembelajaran", "15 tujuan berformat ABCD, satu per pelajaran, beserta tabel kesesuaian tujuan, materi, dan alat evaluasi."],
    ["Alur belajar", "Materi, latihan soal, simulasi, lalu nilai akhir. Latihan setiap bab terbuka setelah semua pelajaran di bab tersebut selesai."],
    ["Storyboard", "Skenario dan rancangan tampilan setiap halaman, termasuk interaksi dan umpan balik."],
    ["Strategi evaluasi", "Nilai Akhir = Pilihan Ganda × 30% + Simulasi × 70%, dengan batas lulus pilihan ganda 70."],
    ["Desain visual", "Warna biru, kuning, dan oranye, huruf Anton dan Bricolage Grotesque, serta maskot Labi (labu Erlenmeyer bertunas) sebagai simbol belajar lewat mencoba."]
  ];
  const LINI = [
    ["Sebelum 9 Okt", "Versi awal", "Prototipe satu file HTML berisi 15 pelajaran dari Draft Tim 9 dan 19 aktivitas “Coba sendiri”."],
    ["8–9 Okt", "Latihan dan simulasi", "Kuis dan drag and drop bergaya permainan, serta tiga simulasi kasus kerja bercabang. Riwayat perubahan mulai dicatat di Git."],
    ["20 Okt", "Penyesuaian materi", "Materi disesuaikan dengan Jabaran Materi resmi. Pustaka dan huruf disimpan di dalam produk agar tidak bergantung pada layanan luar."],
    ["21 Okt", "Revisi setelah presentasi", "Produk diterbitkan melalui GitHub Pages dan tata letak dibuat memenuhi lebar layar."],
    ["22–24 Okt", "Gamifikasi dan simulasi", "XP, level, lencana, dan target mingguan. Simulasi ditulis ulang agar adaptif dan berdasar kasus nyata."],
    ["6–14 Nov", "Pengalaman belajar", "Pemandu pelajaran, kunci latihan per bab, maskot Labi, ilustrasi animasi, layar pemuatan, dan navigasi sidebar."],
    ["17–22 Nov", "Revisi masukan dosen", "Materi tampil sebelum aktivitas, peta konsep, identitas pengembang, dan tabel kesesuaian tujuan, materi, dan evaluasi."],
    ["24 Nov", "Penyempurnaan", "Bahasa dibuat lebih natural, aplikasi dapat dipasang (PWA), video penjelasan di halaman panduan, tema gelap, beranda dashboard, dan laporan ini."]
  ];
  const REVISI = [
    ["Pertemuan 6 (7 Okt)", "Hasil akhir harus dapat dipakai tanpa internet dan tanpa tautan atau layanan eksternal.", "Pustaka, huruf, dan gambar disimpan di dalam produk. Asisten menjawab dari materi tanpa layanan AI luar. Produk dapat dipasang sebagai aplikasi dan dibuka tanpa internet."],
    ["Jabaran Materi resmi (20 Okt)", "Materi harus sesuai dengan Jabaran Materi.", "Enam pelajaran ditulis ulang dan urutan Bab 2 disesuaikan dengan GBIM."],
    ["Revisi presentasi (21 Okt)", "Produk dipublikasikan melalui GitHub dan konten memenuhi layar.", "Produk diterbitkan di GitHub Pages dan tata letak dibuat lebar."],
    ["Pertemuan 11 (11 Nov)", "Materi ditampilkan sebelum aktivitas dan kuis.", "Urutan halaman pelajaran: materi dan poin utama lebih dulu, lalu aktivitas, uji pemahaman, dan cek cepat."],
    ["Pertemuan 11 (11 Nov)", "Bahasa lebih natural dan mudah dipahami.", "Seluruh teks materi, soal, glosarium, dan antarmuka ditinjau dan ditulis ulang."],
    ["Pertemuan 11 (11 Nov)", "Panduan memuat tujuan, peta konsep, referensi, dan identitas pengembang.", "Keempat halaman tersedia di menu Panduan, ditambah petunjuk, alur belajar, glosarium, dan FAQ."],
    ["Arahan dosen (24 Nov)", "Paket offline dan SCORM tidak digunakan.", "Paket dihapus dan digantikan aplikasi yang dapat dipasang (PWA)."],
    ["Evaluasi teknis tim", "Produk harus berjalan baik di berbagai perangkat dan mudah dibaca.", "Pengujian otomatis di Chrome dan Safari untuk layar komputer dan ponsel, serta kontras teks memenuhi WCAG AA."]
  ];
  /* status uji coba: ganti st menjadi "selesai" dan isi hasil setelah uji dilaksanakan */
  const UJI = [
    { t: "Uji ahli media", who: "Dosen muda Teknologi Pendidikan", how: "Penilaian dengan instrumen ahli media yang telah ditentukan, disertai dokumentasi.", when: "Sebelum Pertemuan 15", st: "belum", hasil: "" },
    { t: "Uji coba pengguna (one-to-one)", who: "Minimal 5 pengguna dari kelompok sasaran", how: "Uji satu per satu dengan angket pengalaman dan kelayakan multimedia, disertai dokumentasi.", when: "Setelah revisi dari ahli media", st: "belum", hasil: "" }
  ];

  const n = () => { try { const D = window.GLD; return { q: D.QUIZ.length, d: D.DND.length, s: D.SIM.length, g: D.GLOS.length } } catch (e) { return { q: 48, d: 8, s: 3, g: 87 } } };
  const ICO = {
    chk: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
  };
  const rows = L => `<dl class="lap-dl">${L.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;

  function html({ hero, sec, cta, A_, fr, LT, CR, CO }) {
    const c = n();
    return hero(LT[3], [["Panduan", "#/petunjuk"], ["Laporan pengembangan"]], "Panduan · Laporan pengembangan", "Laporan <em>pengembangan</em>",
      "Ringkasan proses pengembangan GrowthLab dari rancangan awal sampai versi saat ini, disusun mengikuti model pengembangan Hannafin dan Peck.",
      `<a class="btn p" href="#/laporan" data-sc="lap-tahap">Model pengembangan</a><a class="btn" href="#/laporan" data-sc="lap-revisi">Evaluasi dan revisi</a><a class="btn" href="#/laporan" data-sc="lap-uji">Uji coba produk</a>`,
      fr(CO[3], "peta"))
      + sec(LT[3], CR, `
        <div class="lap-stat rv">
          <div><b>3 bab</b><span>15 pelajaran</span></div>
          <div><b>${c.q + 60}</b><span>soal: ${c.q} kuis, 60 uji pemahaman</span></div>
          <div><b>${c.d + c.s}</b><span>aktivitas: ${c.d} drag and drop, ${c.s} simulasi</span></div>
          <div><b>200+</b><span>perubahan tercatat, 9 Okt sampai 24 Nov 2026</span></div>
        </div>
        <h2 class="rv" id="lap-tahap">Model pengembangan</h2>
        <p class="rv lead2">Model Hannafin dan Peck terdiri atas tiga tahap. Evaluasi dan revisi dilakukan di setiap tahap, bukan hanya di akhir, sehingga produk diperbaiki terus selama dikembangkan.</p>
        <div class="lap-hp rv">${TAHAP.map(([no, t, d, col]) => `<div class="lap-ph" style="--c:${col}"><span class="no">${no}</span><b>${t}</b><p>${d}</p></div>`).join('<span class="lap-ar" aria-hidden="true"></span>')}
          <div class="lap-loop"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg>Evaluasi dan revisi di setiap tahap</span></div></div>

        <h2 class="rv" style="margin-top:56px">Tahap 1. Analisis kebutuhan</h2>
        <div class="rv">${rows(ANALISIS)}</div>

        <h2 class="rv" style="margin-top:56px">Tahap 2. Desain</h2>
        <div class="rv">${rows(DESAIN)}</div>
        <p class="rv lead2" style="margin-top:14px">Rincian tujuan dan kesesuaiannya dengan materi dan evaluasi ada di halaman <a href="#/tujuan">Tujuan belajar</a>. Isi bab dan pelajaran dapat dilihat di <a href="#/peta">Peta konsep</a>.</p>

        <h2 class="rv" style="margin-top:56px">Tahap 3. Pengembangan dan implementasi</h2>
        <p class="rv lead2">Produk dibangun sebagai situs web statis dengan HTML, CSS, dan JavaScript, tanpa server dan tanpa akun. Progres disimpan di peramban peserta. Produk diterbitkan di GitHub Pages dan dapat dipasang sebagai aplikasi.</p>
        <ol class="lap-tl rv">${LINI.map(([d, t, x]) => `<li><time>${d}</time><div><b>${t}</b><p>${x}</p></div></li>`).join("")}</ol>`)
      + sec(CR, LT[3], `
        <h2 class="rv" id="lap-revisi">Evaluasi dan revisi</h2>
        <p class="rv lead2">Masukan dari dosen dan hasil evaluasi internal, beserta tindak lanjutnya pada produk.</p>
        <div class="lap-tw rv"><table class="lap-tb"><thead><tr><th scope="col">Sumber</th><th scope="col">Masukan</th><th scope="col">Tindak lanjut</th></tr></thead><tbody>
          ${REVISI.map(([s, m, t]) => `<tr><th scope="row">${s}</th><td>${m}</td><td><span class="ok">${ICO.chk}</span>${t}</td></tr>`).join("")}</tbody></table></div>

        <h2 class="rv" id="lap-uji" style="margin-top:56px">Uji coba produk</h2>
        <p class="rv lead2">Sesuai arahan dosen, produk diuji oleh ahli media lalu oleh pengguna. Hasil uji dan revisinya akan dicantumkan di bagian ini.</p>
        <div class="lap-uj rv">${UJI.map(u => `<div class="lap-u${u.st === "selesai" ? " done" : ""}"><span class="lap-st">${u.st === "selesai" ? ICO.chk + "Selesai" : ICO.clock + "Belum dilaksanakan"}</span><h3>${u.t}</h3>
          ${rows([["Penguji", u.who], ["Cara", u.how], ["Waktu", u.when]].concat(u.hasil ? [["Hasil", u.hasil]] : []))}</div>`).join("")}</div>`)
      + cta(CR, "Lihat produknya langsung", A_("#/course", "Buka materi", "p") + A_("#/tentang", "Identitas pengembang"));
  }
  return { html };
})();
/* file ini dimuat sesudah js/09-app.js: kalau halaman dibuka langsung di #/laporan, render ulang setelah semua skrip siap */
addEventListener("DOMContentLoaded", () => { if (/^#\/laporan/.test(location.hash) && typeof route === "function") route() });
