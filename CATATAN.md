# CATATAN GrowthLab v5

Prototipe media pembelajaran **GrowthLab: Self Development for Job Seeker** (Kelompok 8, Teknologi Pendidikan FIP UNJ, 2024).
File hasil: `GrowthLab_v5.html` (satu file). Cadangan versi sebelumnya: `GrowthLab_v4.backup.html`.

---

## 1. Cara membuka situs

**Versi online:** https://growth-lab-motion.netlify.app/ (situs Netlify `growth-lab-motion`). Isinya `GrowthLab_v5.html` yang diunggah sebagai `index.html`. Untuk memperbarui, unggah ulang file terbaru dengan nama `index.html` ke situs yang sama. Di Netlify (dan host statis lain seperti GitHub Pages, Vercel, atau Cloudflare Pages), situs otomatis berjalan dalam mode lokal tanpa memanggil `/api`.

**Cara paling mudah:** klik dua kali `GrowthLab_v5.html`. Situs berjalan langsung dari `file://` tanpa server.

**Lewat server sederhana** (disarankan saat presentasi):

```bash
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000/GrowthLab_v5.html`.

Catatan:
- Situs memuat pustaka dari CDN: Three.js, GSAP, Lenis, Matter.js, dan Google Fonts. Dengan internet, semua animasi tampil. Tanpa internet, isi materi, latihan, dan nilai tetap berjalan, tetapi animasi 3D, motion, dan font khusus tidak muncul.
- **Mode lokal** aktif otomatis jika situs dibuka lewat `file://` atau server statis seperti `python -m http.server`. Dalam mode ini, tombol "Masuk" disembunyikan, tidak ada panggilan ke `/api/...`, dan progres serta nilai tersimpan di browser.
- **Mode server (opsional):** jika file disajikan oleh server akun versi sebelumnya (Node, `npm start`) yang menjawab `/api/config`, fitur akun lama (daftar, masuk, sinkron progres) aktif kembali seperti semula.
- Data tersimpan di `localStorage` dengan kunci `mer-done` (pelajaran selesai, format `"bab-pelajaran"`, misalnya `"0-4"`) dan `gl-latihan` (skor terbaik serta riwayat kuis, drag & drop, simulasi, dan nilai akhir).

---

## 2. Konten yang ditulis baru dan perlu ditinjau tim

### a. Enam pelajaran tanpa uraian di Jabaran Materi (ditandai `draft:true`)
Di halaman pelajaran, keenamnya diberi label **"Draf, perlu ditinjau tim"**. Uraiannya disusun dari indikator GBIM dengan struktur dan panjang yang setara dengan pelajaran lain.

| Bab | Pelajaran | Indikator GBIM yang dicakup |
|---|---|---|
| 2 | Communicate with Empathy | prinsip empati, *active listening* tanpa menghakimi, respons asertif dan welas asih |
| 3 | System Thinking | sistem vs linear, elemen dan *feedback loops*, pemetaan masalah untuk solusi holistik |
| 3 | Critical Thinking | fakta/opini/asumsi, bias kognitif dan *logical fallacy*, argumen berbasis bukti |
| 3 | Strategic Thinking | visi jangka panjang, analisis peluang/tantangan/sumber daya, langkah taktis |
| 3 | Reflective Thinking | siklus refleksi (*experiential learning*, Kolb), introspeksi terstruktur, rencana perbaikan, ditambah **metode STAR** |
| 3 | Creative Thinking | *mental blocks*, *brainstorming* dan *mind mapping* (+ SCAMPER), solusi adaptif |

### b. Bagian tambahan pada sembilan pelajaran yang uraiannya dari PDF
Isi uraian (sub-judul dan poin) diambil utuh dari Jabaran Materi. Kalimat bergaya perancang ("Menjelaskan bahwa…", "Mengajarkan…") diubah menjadi kalimat langsung untuk siswa tanpa mengurangi isi. Elemen berikut ditulis tim pengembang dan perlu ditinjau:
- **Kotak "Konsep penting"**: ringkasan definisi atau kerangka kunci dari PDF.
- **Kotak "Contoh"**: kasus pendek seputar melamar kerja atau magang (Dina, Bayu, Raka, Sari, Sinta, Bima, Fajar, Lia, Arif). Contoh di *Thoughts, Feelings, & What You Do* mengembangkan contoh *procrastination* dari PDF. Contoh di *Change Your Thinking* sekaligus memperkenalkan istilah *internal locus of control*, karena istilah ini diminta rubrik tetapi tidak ada di jabaran materi.
- **Kalimat "Poin utama"**, **keterangan diagram**, dan **daftar indikator** (indikatornya diambil dari GBIM).
- **15 diagram SVG**: rumus kekuatan + S.I.G.N, segitiga kognitif, Catch–Check–Change, alur *problem solving*, empat aspek *well-being*, Venn *self/social awareness*, siklus *active listening*, stres vs *burnout*, alur kritik → rencana, pilar kebahagiaan, linear vs *feedback loop*, matriks fakta–opini–asumsi, analisis situasi → visi, siklus Kolb, dan *mind map*.

### c. Latihan
- **29 dari 34 soal pilihan ganda ditulis baru** (soal 1–5 dari PDF dipakai persis apa adanya dan ditandai `src:"pdf"`). Setiap pelajaran punya minimal 2 soal. Arah soal mengikuti indikator rubrik: *locus of control*, resiliensi, dan regulasi emosi setelah ditolak rekrutmen; umpan balik profesional vs lingkungan kerja eksploitatif; langkah *problem solving* terstruktur, keputusan karier realistis, dan STAR.
- **6 set drag & drop**: jebakan pikiran, stres/*burnout*, urutan Catch–Check–Change, urutan *problem solving*, fakta/opini/asumsi, dan S.I.G.N.
- **3 skenario simulasi** beserta **skor 0–100 tiap pilihan** dan teks akibatnya. Skor ini perlu disepakati tim karena menentukan 70% nilai akhir.

### d. Halaman dan teks lain
Tujuan belajar per pelajaran (array `TUJ`), Petunjuk Penggunaan, Alur Belajar, Tentang, Syarat & Ketentuan, Kebijakan Privasi, FAQ, enam ide kegiatan "Belajar bareng" (menggantikan kegiatan komunitas fiktif), teks beranda dan footer, serta jawaban chat mode demo.

---

## 3. Kontradiksi dan hal tidak jelas di PDF, beserta keputusannya

1. **Batas lulus pilihan ganda: 70% atau ≥ 76%?** Rubrik menyebut 70, sedangkan tabel kategori menyebut "Lulus pilihan ganda (skor ≥ 76%)". **Keputusan:** 70 dipakai konsisten sebagai konstanta `GLD.PASS_MCQ = 70`. Untuk memakai 76, cukup ubah angka itu.
2. **Kategori "Sangat Siap" dan "Siap Kerja" mensyaratkan lulus pilihan ganda.** Jika nilai pilihan ganda < `PASS_MCQ`, kategori paling tinggi dibatasi **"Cukup Siap / Perlu Latihan Lanjutan"**, sesuai deskripsi kategori 56–70 ("belum mencapai kelulusan minimal tes kognitif"). Kartu Nilai Akhir menampilkan catatannya.
3. **Nilai desimal di batas level.** Rubrik memakai bilangan bulat ("Perlu Bimbingan ≤ 55", "Cukup 56–70"). **Keputusan:** nilai dibulatkan ke 1 desimal, lalu dibandingkan dengan ambang ≥ 86, ≥ 71, ≥ 56. Jadi 55,5 → Perlu Bimbingan dan 85,9 → Baik. Aturan yang sama berlaku untuk kategori nilai akhir.
4. **Nilai mana yang masuk Nilai Akhir?** PDF tidak menyebutnya. **Keputusan:** nilai pilihan ganda = skor terbaik **mode Gabungan** (semua 34 soal); mode per bab untuk berlatih. Nilai tiap aspek simulasi = skor terbaik skenario tersebut.
5. **Slug Medium *Critical Thinking*** di PDF tertulis `critical-thinking-2a6d25e0ed8` (11 karakter heksadesimal, slug lain 12). Kemungkinan terpotong di PDF. Tautannya dipakai apa adanya; **mohon dicek** dan perbaiki di `GLD.COURSE` jika berbeda.
6. **Salah ketik di PDF yang dirapikan:** "Thingking" → "Thinking", "Empatty" → "Empathy", "manajemen energ" → "manajemen energi". Tulisan "Draft Tim 9 / Kelompok 8" tidak diubah; situs menyebut pembuatnya Kelompok 8.
7. **Urutan Bab 2.** Di tabel GBIM, *Communicate with Empathy* berada di urutan terakhir, sedangkan di peta konsep berada di urutan kedua. **Keputusan:** mengikuti peta konsep.
8. **Soal 4 dan 5 di PDF** diawali sub-judul ("Konsep Segitiga Kognitif…", "Dampak Pola Pikir…"). Sub-judul itu dianggap label indikator, bukan bagian soal. Soal 1 berakhir dengan "sebagai." dan dipakai persis seperti di PDF.
9. **STAR dan *locus of control*** disebut rubrik, tetapi tidak ada di Jabaran Materi. STAR dimasukkan ke *Reflective Thinking* (draf), soal kuis, dan skenario 3. *Locus of control* dijelaskan di contoh *Change Your Thinking*, soal kuis, dan deskriptor simulasi.
10. **Metode penyajian GBIM "Video, Animasi".** Prototipe ini belum memuat video. Penyajiannya memakai teks, diagram, ilustrasi, dan animasi. Video bisa ditambahkan nanti.
11. **"Umpan balik profesional vs lingkungan kerja eksploitatif"** (indikator rubrik) tidak diuraikan di jabaran materi. Topik ini diwujudkan lewat soal kuis (Bab 2) dan skenario 2.

---

## 4. Cara mengubah materi, soal, dan skenario

Semua data ada di `GrowthLab_v5.html` di dalam **`<script id="gl-data">`** (objek `GLD`). Cari teks `const GLD=` di editor.

| Yang diubah | Lokasi | Format |
|---|---|---|
| Materi pelajaran | `S1`, `S2`, `S3` (Bab 1–3) → `COURSE.chapters` | `{t, judul, intro, ind:[3 indikator], bagian:[{h, isi}], konsep:{at, isi}, vis:{at, d, cap}, contoh:{at, isi}, poin, sumber, draft?, kw:[kata kunci chat/pencarian]}`. `at` = sisipkan setelah bagian ke-n (0 = setelah bagian pertama, -1 = sebelum bagian pertama). Teks boleh berisi HTML (`<i>`, `<b>`, `<ul>`). |
| Diagram | `DIAG` | fungsi yang mengembalikan SVG; kunci dipakai di `vis.d` |
| Tujuan belajar | `TUJ` (di akhir `GLD`) | `TUJ[bab][pelajaran]` = satu kalimat |
| Soal pilihan ganda | `QUIZ` | `{b: bab 0–2, l: pelajaran 0–4, q: soal, o: [A, B, C, D], a: indeks jawaban benar 0–3, e: penjelasan}`. Urutan opsi diacak otomatis; tulis saja jawaban benar di posisi mana pun lalu set `a`. |
| Drag & drop | `DND` | `{id, t: judul, p: petunjuk, mode: "bin" atau "order", cap: 1 (opsional, satu kartu per kotak), bins: [{k, t}], items: [{t, k}], les: [bab, pel]}`. Untuk `"order"`, `k` = urutan "1", "2", … dan `bins` tidak perlu ditulis. |
| Skenario simulasi | `SIM` | `{id, t, aspek, w: bobot, ilus, les: [[bab, pel]], intro, start, nodes: {idNode: {s: ilustrasi, x: cerita, c: [{t: pilihan, s: skor 0–100, r: akibat, n: idNode berikutnya atau null}]}}}`. Setiap jalur sebaiknya 3–4 keputusan. |
| Deskriptor level / kategori | `LEVEL`, `DESK`, `KATEGORI` | teks dari rubrik |
| Batas lulus dan bobot | `PASS_MCQ` (70), `W_MCQ` (0,30), `W_SIM` (0,70) | angka. Bobot aspek simulasi ada di `SIM[i].w` (0,35 / 0,35 / 0,30). |
| Soal "Cek cepat" (benar/salah) | `CEK` | `{b, l, s: pernyataan, v: true/false, e: penjelasan}`, 2 per pelajaran |
| Glosarium | `GLOS` | `[istilah, arti, bab, pelajaran]` |

Bagian lain:
- **Aktivitas "Coba sendiri"** di tiap pelajaran: `<script id="gl-ui">` (objek `GLU`). Posisi widget diatur di `LABS` (kunci `"bab-pelajaran"`, `at` = setelah bagian ke-n), dan isi tiap widget ada di objek `W` (misalnya `W.sign`, `W.tri`, `W.whys`). Beranda (`home`), peta konsep (`peta`), glosarium (`glos`), pertanyaan "Kenali kebutuhanmu" (`DG`) juga ada di sini.
- **Mesin latihan** (kuis, drag & drop, simulasi, nilai akhir): `<script id="gl-latihan">` (objek `GLX`).
- **Halaman** (Tujuan, Petunjuk, Alur, Latihan, Tentang, Syarat, Privasi, Katalog, Belajar bareng): skrip utama, fungsi `renderPage` (cari `v5: halaman-halaman`). Teks FAQ ada di array `FAQ`, dan ide kegiatan di `KOMD`.
- **Jawaban chat demo:** array `KB` di skrip chat (cari `basis jawaban mode demo`).
- **Gaya baru:** `<style id="gl5">`. Gaya OBLO (`#oblo`) dan motion v9 (`#zmotion`) tidak diubah.

---

## 5. Pembaruan v6: UI dan fitur interaktif

**Di setiap pelajaran (15 halaman)**
- Info waktu baca, **daftar isi** yang bisa diklik, navigasi "Sebelumnya/Berikutnya" dengan judul pelajaran.
- **Aktivitas "Coba sendiri"** yang sesuai materinya (19 aktivitas):

| Pelajaran | Aktivitas |
|---|---|
| Recognise Your Strengths | Uji kekuatan S.I.G.N + daftar kekuatanku (tersimpan) |
| Thoughts, Feelings, & What You Do | Simulator segitiga kognitif (pikiran otomatis vs rasional) |
| Change Your Thinking | Latihan Catch–Check–Change bertahap (4 pikiran) |
| Problem Solving | Tangga 5 Whys + matriks pemilihan solusi (slider) |
| Keeping Well | Cek kesejahteraan 4 aspek + pelacak kebiasaan mingguan |
| Emotional and Social Awareness | Roda emosi: dari emosi dasar ke nama emosi spesifik |
| Communicate with Empathy | Perakit pesan "saya" + latihan gaya pasif/asertif/agresif |
| Facing Stress and Burnout | Cek tanda stres vs burnout + latihan napas kotak 4-4-4-4 |
| Criticism, Weakness and Failure | Ubah kritik menjadi rencana (4 kasus) |
| Happiness in Life | Jurnal syukur harian (tersimpan, hitung beruntun) + "temukan mengapa-mu" |
| System Thinking | Animasi feedback loop (penguat +/−, penyeimbang) |
| Critical Thinking | Detektif lowongan palsu |
| Strategic Thinking | Perakit target SMART |
| Reflective Thinking | Penyusun jawaban STAR (pratinjau + salin) |
| Creative Thinking | Brainstorming dengan timer + kartu SCAMPER |

- **Cek cepat** (2 soal benar/salah) dan **Catatan pribadiku** (tersimpan otomatis) di akhir pelajaran.

**Beranda**
- "Mulai dari sini": kartu Tujuan, Petunjuk, Alur, dan **Peta konsep**; kartu **Lanjutkan belajar**; tes singkat **Kenali kebutuhanmu** (6 pernyataan → rekomendasi bab dan pelajaran).
- Section baru **Latihan & tantangan**: kartu Kuis/Drag & Drop/Simulasi (langsung membuka tab yang tepat) + **Soal kilat** yang bisa dimainkan di beranda.
- Ikon statistik, angka di hero, logo footer, lingkaran "scroll" di hero, dan pil kata yang bisa diseret di bagian akhir sekarang **bisa diklik** dan mengarah ke halaman terkait. Tombol hero kedua kini "Lihat katalog".

**Halaman baru dan peningkatan**
- `#/peta`: peta konsep interaktif mengikuti peta konsep di PDF; simpul bisa diklik dan bertanda centang bila selesai.
- `#/glosarium`: 77 istilah asing dengan arti dan tautan ke pelajarannya, bisa dicari dan disaring per bab.
- Katalog: filter status (Belum selesai / Selesai / Draf) dan jumlah hasil.
- Halaman kursus: bilah progres dan tombol "Mulai/Lanjut bab" + "Kuis Bab N" di tiap bab.
- Petunjuk: legenda **Arti ikon dan tombol**. Alur: rubrik penilaian simulasi lengkap per aspek.
- Latihan: tautan langsung (`#/latihan/kuis/b0`, `#/latihan/dnd/stres`, `#/latihan/sim/s2`), tombol Mulai yang jelas, pintasan keyboard 1–4/A–D, penghitung benar dan beruntun, waktu pengerjaan, dan **Cetak kartu hasil** (isi nama, lalu cetak atau simpan PDF).
- Data baru tersimpan di `localStorage` kunci `gl-ui` (catatan, jurnal, kebiasaan, daftar kekuatan, SMART, STAR, hasil "Kenali kebutuhanmu", nama untuk kartu hasil).

**Perbaikan bug v6:** kartu "Latihan" di halaman kursus sebelumnya mengarah ke `#/lesson/undefined` dan terpental kembali; sekarang membuka Latihan.

**Perlu ditinjau tim:** isi aktivitas (kasus, pilihan jawaban, umpan balik), 30 pernyataan Cek cepat, 77 definisi glosarium, dan enam pernyataan "Kenali kebutuhanmu". Semuanya ditulis tim pengembang berdasarkan materi.

---

## 6. Perbaikan bug lama yang ditemukan saat pengujian
Bug berikut sudah ada di v4 dan ikut diperbaiki tanpa mengubah blok OBLO maupun lapisan motion v9:
- Halaman pelajaran tetap dua kolom di HP (aturan `.lay` v8 menimpa media query lama). Sekarang satu kolom di ≤ 860px.
- Overlay menu HP terkurung setinggi pil navigasi karena `backdrop-filter`. Sekarang menutup layar penuh.
- Setelah pindah rute dari beranda yang sudah digulir, halaman baru terbuka di posisi bawah (footer), karena Lenis sedang dihentikan. Sekarang selalu ke atas, dan tautan seperti `#/path` mendarat di section-nya.
- Peringatan "GSAP target not found" saat situs dibuka langsung di rute selain beranda.
- Panggilan `/api/config` dan `/api/me` yang menghasilkan 404 atau error saat tanpa server.

---

### Perbaikan hero 3D (laporan pengguna di Safari)
- **Kepala karakter tidak mengikuti kursor** (bug sejak v4): fungsi `kick()` di skrip kerumunan mengatur ulang waktu frame sebelum setiap `tick()`, sehingga `dt` selalu 0 dan rotasi kepala, pegas "boing", serta parallax kamera tidak pernah bergerak. Sekarang `dt` dihitung benar, dan kepala menoleh sekitar ±0,9 rad mengikuti kursor (diuji di Chrome dan WebKit).
- **Karakter tampil raksasa, terpotong, dan terlihat "tidak termuat"** di layar lebar: judul hero pecah menjadi 4 baris sehingga hero lebih tinggi dari layar, sementara kamera membingkai seluruh hero. Sekarang ukuran judul dibatasi oleh lebar dan tinggi layar (selalu 2 baris), kamera membingkai area layar pertama (`setViewOffset`), skala kerumunan menyesuaikan lebar layar, dan bagian bawah memudar halus.
- **Lebih ringan untuk Safari:** resolusi kanvas kerumunan dibatasi (pixel ratio maksimal 1,5 dan sekitar 3,2 juta piksel). Kanvas dirender ulang saat konteks WebGL pulih atau saat halaman dipulihkan dari cache Back/Forward.
- Di host Netlify, tombol "Tanya AI" dan penghitung section digeser ke atas agar tidak tertutup badge "Powered by Netlify".

## 7. Hasil pengecekan (Playwright + Chrome, `python -m http.server 8000` dan `file://`)
- Beranda, `#/course`, ke-15 pelajaran, `#/latihan`, `#/tujuan`, `#/petunjuk`, `#/alur`, `#/tentang`, FAQ, Kontak, Belajar bareng, Syarat, dan Privasi terbuka **tanpa error atau peringatan console**, baik di `file://` maupun http. (Di Chrome headless tanpa GPU, Three.js mencatat "Error creating WebGL context". Hal yang sama terjadi pada v4, dan hilang saat WebGL perangkat lunak diaktifkan, jadi bukan dari kode.)
- Tandai selesai dan "Pelajaran berikut" melintasi batas bab (0-4 → 1-0). Pelajaran terakhir menuju Latihan. Ring progres, bilah navbar (2/15), dan jalur belajar ikut berubah, dan progres bertahan setelah refresh.
- Kuis: 30/34 → 88,2 (Lulus), 22/34 → 64,7 (Belum lulus). Urutan soal dan opsi teracak.
- Drag & drop berhasil dikerjakan dengan mouse, keyboard (Tab + Enter), dan layar sentuh 375px (seret maupun ketuk-pilih).
- Simulasi ditamatkan lewat beberapa jalur; skor = rata-rata jalur.
- **Contoh hitung manual:** PG 88,2; S1 = 95; S2 = (55+25+45+50)/4 = 43,75 ≈ 43,8; S3 = (15+65+60+80)/4 = 55.
  Simulasi = 95×0,35 + 43,8×0,35 + 55×0,30 = 33,25 + 15,33 + 16,5 = 65,08.
  Nilai Akhir = 88,2×0,30 + 65,08×0,70 = 26,46 + 45,556 = **72,0 → Siap Kerja**. Angka ini cocok dengan yang tampil di kartu Nilai Akhir.
- Tampilan diperiksa di 375px, 768px, dan 1280px, termasuk mode `prefers-reduced-motion`. Tidak ada scroll horizontal.
- `grep -i placeholder` hanya menemukan atribut petunjuk isian (`placeholder`) pada kolom input, bukan teks konten.
- **Tes v6:** ke-15 pelajaran memuat aktivitas, daftar isi, cek cepat, catatan, dan navigasi. Ke-19 aktivitas berhasil dicoba (misalnya S.I.G.N 4/4, Catch–Check–Change sampai ringkasan, 5 Whys, matriks, roda emosi, napas kotak, detektif lowongan 4/4, SMART, STAR, brainstorm). Input pengguna yang berisi tag HTML tampil sebagai teks biasa. Fitur lain yang lolos: beranda ("Kenali kebutuhanmu", soal kilat, kartu latihan), tautan ikon statistik dan hero, filter katalog, tautan langsung latihan, pintasan keyboard kuis, peta konsep, glosarium, dan cetak kartu hasil. Semua tanpa error console, di http maupun `file://`, dan tanpa scroll horizontal di 375, 768, dan 1280px.

---

## 8. Pembaruan v7: latihan bergaya game (Oktober 2026)

Hanya **fitur dan tampilan** latihan yang diubah. Isi soal, set drag & drop, skenario, skor pilihan, rubrik, dan rumus nilai **tidak diubah**. Mesin latihan ada di `<script id="gl-latihan">` (objek `GLX`), gayanya di `<style id="gl7">`. Cadangan sebelum perubahan: `GrowthLab_v5.backup-v6.html`.

**Kuis (gaya Quizizz)**
- Kuis dimainkan di layar penuh: lobi (pilih timer Santai/20/30/45/60 detik, power-up aktif/mati), hitung mundur 3-2-1, empat kotak jawaban berwarna, bilah timer, banner Benar/Salah/Waktu habis, poin yang melayang ke skor, confetti, beruntun (🔥), dan lembar penjelasan setelah setiap soal.
- Poin: 600 + bonus kecepatan (maks. 400) + bonus beruntun. **Poin hanya untuk keseruan**; nilai tetap = benar ÷ jumlah soal × 100. Jika timer habis, soal dihitung salah (sesuai rubrik benar = 1, salah = 0).
- Power-up didapat setiap 3 jawaban benar beruntun: Poin ganda, Bekukan waktu, Perisai beruntun, dan 50:50. **50:50 tidak tersedia di mode Gabungan** agar nilai akhir tetap adil.
- Layar hasil: cincin nilai, statistik, lencana (Sempurna, Beruntun, Kilat, Lulus, Rekor poin baru), dan pembahasan. Kuis yang ditutup di tengah bisa dilanjutkan dari tab Kuis.
- Musik latar dan efek suara dibuat langsung dengan Web Audio (tanpa file audio), bisa dimatikan. Pengaturan disimpan di `localStorage` kunci `gl-sfx`. Rekor poin disimpan di `gl-latihan` → `kuis.ptsBest`.

**Drag & drop** (referensi pola interaksi: Wordwall *Group Sort*/*Rank Order*, daftar *sortable* ala dnd-kit/SortableJS, kartu miring ala Trello)
- Kartu terangkat dengan efek pegas dan miring mengikuti gerakan, kotak tujuan menyala saat kartu siap dilepas, kartu "terbang" ke tempatnya, dan halaman menggulir otomatis di tepi layar.
- Set urutan berubah menjadi daftar yang bisa disusun ulang langsung (kartu lain bergeser), plus tombol panah dan keyboard (Spasi untuk angkat, ↑/↓ untuk pindah).
- Di layar sentuh, kartu diangkat dengan **tahan sebentar (±0,2 detik)**, sehingga usapan biasa tetap menggulir halaman. Ketuk kartu lalu ketuk kotak tetap bisa.
- Periksa jawaban: tanda ✓/✕ muncul satu per satu, stempel "Sempurna!", tombol **Kembalikan yang salah** dan **Tunjukkan jawaban** (hasil setelah "Tunjukkan jawaban" tidak disimpan sebagai skor). Ada penghitung waktu dan rekor waktu (`gl-latihan` → `dnd[id].bestT`).

**Simulasi (monokrom)**
- Panel hitam-putih dengan butiran film, huruf mesin tik (Space Mono), dan ilustrasi adegan yang diubah ke abu-abu.
- Kartu kasus, layar judul, narasi mesin tik (klik/Spasi untuk mempercepat), pilihan bernomor (tombol 1–4), layar **akibat** setiap keputusan dengan skor pilihan dan **indikator kesiapan** (rata-rata sementara), suara latar.
- Layar akhir: skor, stempel level, umpan balik rubrik, jejak keputusan, dan **peta cabang cerita** (situasi yang sudah ditemukan disimpan di `gl-latihan` → `sim[id].seen`).

**Motion lain:** perpindahan tab, angka nilai akhir yang menghitung naik, dan bilah kontribusi. Semua animasi otomatis dikurangi jika perangkat memakai `prefers-reduced-motion`.

**Hasil pengecekan v7 (Playwright, Chrome + WebKit):** kuis (nilai, poin, keluar–lanjutkan, waktu habis), keenam set drag & drop (mouse, ketuk, panah, keyboard, sentuh tahan-lalu-seret), ketiga skenario (skor = rata-rata jalur), dan nilai akhir (Gabungan 100 + simulasi) lolos di 375, 768, dan 1280 px, termasuk mode reduced-motion. Semua halaman lain terbuka tanpa error console di http maupun `file://`. Catatan: beranda di 1280 px punya pita marquee miring yang melebar 40 px di luar layar sejak versi sebelumnya; tidak bisa digeser pengguna karena `body` memakai `overflow-x:hidden`.
