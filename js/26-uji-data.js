/* Uji pemahaman per pelajaran (2026-11-07).
   Tiap pelajaran 4 soal yang menguji pemahaman, bukan hafalan:
   - kasus : studi kasus pilihan ganda, tiap pilihan punya penjelasan sendiri  {t:"kasus", s, o:[[teks, benar?, penjelasan]], bag}
   - dua   : soal dua tingkat (jawaban + alasan); paham bila keduanya benar     {t:"dua", s, o:[[teks, benar?]], r:[[alasan, benar?, penjelasan]], bag}
   - jelas : jelaskan dengan kata-katamu, lalu cocokkan dengan poin kunci       {t:"jelas", s, m:contoh jawaban, p:[3 poin kunci], bag}
   bag = indeks subbagian materi (h2#s-N) yang disarankan untuk dibaca ulang. */
window.GLUJI_DATA = {
  "0-0": [
    { t: "kasus", bag: 1, s: "Nadia jago mengedit video. Hasilnya selalu dipuji, tapi setiap kali selesai mengedit ia merasa sangat lelah dan malas mengulanginya. Menurut S.I.G.N, apa kesimpulan paling tepat?", o: [
      ["Editing video jelas kekuatan utamanya karena hasilnya bagus.", false, "Hasil bagus baru memenuhi tanda Success. Kekuatan sejati juga harus mengisi energi, bukan menguras."],
      ["Ini kemungkinan keterampilan yang ia kuasai, tapi belum tentu kekuatan, karena tanda Needs (energi terisi) tidak muncul.", true, "Tepat. Kalau sebuah aktivitas selalu menguras energi, ia lebih mirip keterampilan yang dipelajari daripada kekuatan."],
      ["Nadia harus berhenti mengedit video karena itu kelemahannya.", false, "Bukan kelemahan, hasilnya justru bagus. Hanya saja, aktivitas ini belum memenuhi semua tanda kekuatan."],
      ["Tanda Instinct sudah cukup membuktikan editing adalah kekuatannya.", false, "Di cerita ini tidak ada petunjuk Instinct (bersemangat sebelum mulai). Yang terlihat justru ia malas mengulanginya."]] },
    { t: "kasus", bag: 3, s: "Raka kuat di analisis data, tapi kurang percaya diri saat presentasi. Timnya harus mempresentasikan hasil riset minggu depan. Langkah yang paling sesuai dengan prinsip strengths building adalah…", o: [
      ["Raka memaksa diri menjadi presenter utama supaya kelemahannya hilang.", false, "Melatih kelemahan boleh, tapi memaksakan diri di momen penting justru berisiko. Prinsipnya: kembangkan kekuatan, kelola kelemahan."],
      ["Raka mengerjakan analisis datanya, lalu bekerja sama dengan rekan yang kuat berbicara untuk presentasi.", true, "Tepat. Pakai kekuatan utamamu, dan untuk kelemahan, cari rekan yang kuat di bagian itu."],
      ["Raka menolak ikut kelompok karena presentasi bukan bidangnya.", false, "Menghindar bukan solusi. Kelemahan cukup dikelola lewat kerja sama, bukan dihindari."],
      ["Raka menutupi kelemahannya supaya tidak ada yang tahu.", false, "Materi menekankan kamu tidak harus menutupi kelemahan sendirian. Justru terbuka dan bekerja sama."]] },
    { t: "dua", bag: 0, s: "Pernyataan: “Bakat saja sudah cukup untuk menjadi kekuatan.”", o: [["Setuju", false], ["Tidak setuju", true]], r: [
      ["Karena kekuatan = bakat alami × investasi waktu; tanpa latihan, bakat tidak berkembang menjadi kekuatan.", true, "Benar. Rumusnya perkalian: kalau investasi waktunya nol, hasilnya tidak menjadi kekuatan."],
      ["Karena bakat adalah bawaan lahir dan tidak bisa diubah.", false, "Alasan ini keliru. Justru bakat bisa dikembangkan lewat latihan."],
      ["Karena kekuatan hanya bisa dinilai oleh orang lain.", false, "Masukan orang lain membantu memetakan kekuatan, tapi bukan definisi kekuatan itu sendiri."]] },
    { t: "jelas", bag: 2, s: "Jelaskan dengan kata-katamu: bagaimana cara kamu memetakan kekuatan dirimu sebelum menulis CV?", m: "Aku mulai dari diri sendiri: mengingat kegiatan yang bikin aku larut sampai lupa waktu (flow) dan mengeceknya dengan S.I.G.N. Lalu aku minta pendapat jujur dari guru, teman, atau mentor tentang hal yang menurut mereka paling aku kuasai, dan memakai hasilnya untuk menonjolkan kekuatan itu di CV.", p: ["Menyebut kondisi flow atau kegiatan yang bikin lupa waktu", "Mengecek dengan tanda S.I.G.N", "Meminta masukan dari orang lain (guru, teman, mentor)"] }
  ],
  "0-1": [
    { t: "kasus", bag: 1, s: "Dimas ditolak di tahap wawancara. Ia berpikir, “Aku memang tidak menarik di mata HRD.” Ia jadi lesu dan berhenti melamar selama dua minggu. Bagian mana dari segitiga kognitif yang paling perlu diubah lebih dulu?", o: [
      ["Kejadiannya, yaitu penolakan wawancara.", false, "Kejadiannya sudah lewat dan tidak bisa diubah. Kejadian itu sebenarnya netral."],
      ["Pikirannya, yaitu “aku memang tidak menarik di mata HRD”.", true, "Tepat. Pikiran otomatis itulah yang memicu rasa lesu dan akhirnya membuat Dimas berhenti melamar."],
      ["Perasaannya, dengan memaksa diri untuk senang.", false, "Perasaan sulit diubah langsung. Perasaan ikut membaik ketika pikirannya diganti."],
      ["Tindakannya, dengan langsung melamar 50 perusahaan.", false, "Tindakan memang penting, tapi tanpa mengubah pikirannya, rasa lesu akan kembali dan siklusnya berulang."]] },
    { t: "kasus", bag: 2, s: "Saat rapat, ide Sinta dipotong oleh rekannya. Ia langsung merasa panas dan ingin membalas dengan ketus. Menurut materi, apa yang sebaiknya ia lakukan lebih dulu?", o: [
      ["Langsung membalas supaya tidak diremehkan.", false, "Bereaksi spontan justru membuatnya terbawa emosi sesaat."],
      ["Berhenti sejenak (pause) dan memperhatikan pikiran apa yang barusan muncul.", true, "Tepat. Jeda singkat memberi ruang untuk sadar diri (self-awareness) sebelum bereaksi."],
      ["Diam saja dan memendam kekesalannya sampai rapat selesai.", false, "Memendam berbeda dengan menyadari. Tujuannya bukan menahan, tapi memilih respons dengan sadar."],
      ["Keluar dari ruang rapat.", false, "Menghindar tidak menyelesaikan apa pun dan bisa terlihat tidak profesional."]] },
    { t: "dua", bag: 0, s: "Dua orang mengalami kejadian yang sama, yaitu ditolak kerja, tapi responsnya bisa sangat berbeda. Mengapa?", o: [["Karena kejadiannya sebenarnya berbeda", false], ["Karena cara mereka memikirkan kejadian itu berbeda", true]], r: [
      ["Kejadian pada dasarnya netral; emosi dipicu oleh self-talk sesaat setelah kejadian.", true, "Benar. Yang menentukan respons adalah pikiran tentang kejadian, bukan kejadiannya."],
      ["Karena sebagian orang memang terlahir lebih kuat mentalnya.", false, "Alasan ini tidak sesuai materi. Respons bisa dilatih dengan mengubah pikiran."],
      ["Karena perasaan selalu muncul sebelum pikiran.", false, "Urutannya kebalikannya: pikiran memicu perasaan, lalu perasaan mendorong tindakan."]] },
    { t: "jelas", bag: 3, s: "Ceritakan pakai kata-katamu: bagaimana memutus siklus negatif “aku pasti gagal → cemas → menunda belajar”?", m: "Pertama aku sadari dulu pikiran “aku pasti gagal” itu muncul. Lalu aku ganti dengan kalimat yang lebih masuk akal dan adil, misalnya “aku belum tentu gagal kalau aku siapkan dari sekarang”. Begitu pikirannya berubah, cemasnya berkurang, dan aku jadi lebih mudah mulai belajar.", p: ["Menyadari pikiran negatif yang muncul", "Mengganti dengan pikiran yang lebih masuk akal dan adil", "Menjelaskan bahwa perasaan dan tindakan ikut berubah"] }
  ],
  "0-2": [
    { t: "kasus", bag: 0, s: "Tia mendapat satu komentar kurang baik dari 20 komentar positif atas presentasinya. Ia terus memikirkan satu komentar itu dan yakin presentasinya buruk. Jebakan pikiran apa yang paling dekat?", o: [
      ["Mind Reading", false, "Mind reading berarti menebak isi pikiran orang tanpa bukti. Di sini komentarnya nyata."],
      ["All-or-Nothing", true, "Tepat. Tia melihat secara ekstrem: satu kekurangan membuat semuanya dianggap buruk."],
      ["Personalization", false, "Personalization berarti menyalahkan diri atas hal di luar kendali. Itu tidak terjadi di cerita ini."],
      ["Growth Mindset", false, "Growth mindset bukan jebakan pikiran, melainkan pola pikir yang sehat."]] },
    { t: "kasus", bag: 1, s: "Bagas berpikir, “HRD belum membalas, pasti aku tidak lolos.” Ia lalu bertanya pada dirinya, “Apa buktinya? Bisa jadi prosesnya memang lama.” Langkah Cognitive Reframing yang sedang ia lakukan adalah…", o: [
      ["Catch it", false, "Catch adalah menyadari pikiran itu muncul. Bagas sudah lewat tahap ini."],
      ["Check it", true, "Tepat. Ia sedang menguji pikirannya: fakta atau sekadar dugaan karena cemas?"],
      ["Change it", false, "Change adalah mengganti kalimatnya. Bagas baru mengecek buktinya."],
      ["Fixed mindset", false, "Itu bukan langkah reframing, melainkan pola pikir yang kaku."]] },
    { t: "dua", bag: 2, s: "Rani gagal tes coding pertamanya lalu berkata, “Aku memang bukan orang IT, percuma belajar.” Pola pikir apa ini?", o: [["Fixed mindset", true], ["Growth mindset", false]], r: [
      ["Ia menganggap kemampuannya sudah dari sananya dan tidak bisa berubah.", true, "Benar. Itu ciri fixed mindset. Growth mindset melihat kemampuan bisa dikembangkan lewat latihan."],
      ["Ia menghargai proses belajar yang sudah ia jalani.", false, "Kebalikannya. Ia justru menganggap usahanya percuma."],
      ["Ia menganggap kegagalan sebagai masukan untuk memperbaiki cara belajar.", false, "Itu ciri growth mindset, bukan yang ditunjukkan Rani."]] },
    { t: "jelas", bag: 1, s: "Pakai Catch–Check–Change untuk pikiran ini: “Aku ditolak sekali, berarti aku tidak akan pernah diterima di mana pun.” Tuliskan ketiga langkahnya.", m: "Catch: aku sadar sedang berpikir semuanya pasti gagal. Check: faktanya baru satu perusahaan yang menolak, dan masih banyak lowongan lain; ini dugaan, bukan fakta. Change: “Satu penolakan bukan akhir. Aku perbaiki lamaranku dan coba lagi di tempat lain.”", p: ["Catch: menyadari pikiran itu muncul", "Check: membedakan fakta dan dugaan", "Change: menuliskan kalimat pengganti yang seimbang dan mengarah ke jalan keluar"] }
  ],
  "0-3": [
    { t: "kasus", bag: 0, s: "Kasir sebuah toko sering salah memberi kembalian. Manajer langsung menegur kasirnya. Setelah ditelusuri, ternyata mesin kasir sering error dan tidak pernah diperbaiki. Apa pelajaran utamanya?", o: [
      ["Teguran adalah solusi yang tepat karena kasirnya yang salah.", false, "Teguran hanya menangani gejala. Kesalahan akan terulang selama mesinnya rusak."],
      ["Bedakan gejala dari akar masalah: kesalahan kembalian adalah gejala, mesin error adalah akarnya.", true, "Tepat. Solusi jangka panjangnya adalah memperbaiki mesin, bukan sekadar menegur."],
      ["Ganti kasirnya dengan orang baru.", false, "Ini solusi plester. Kasir baru akan mengalami masalah yang sama."],
      ["Masalah ini tidak perlu dianalisis karena terlalu kecil.", false, "Masalah kecil yang berulang justru tanda ada akar masalah yang belum ditemukan."]] },
    { t: "kasus", bag: 1, s: "Tim OSIS sedang mencari ide penggalangan dana. Satu anggota langsung bilang, “Ide jualan makanan itu jelek, sudah biasa.” Apa yang keliru dari situasi ini?", o: [
      ["Tidak ada yang keliru, kritik bikin ide lebih cepat terpilih.", false, "Di tahap divergen, menilai ide terlalu cepat justru mematikan ide lain."],
      ["Ide dinilai terlalu cepat; di tahap brainstorming, kumpulkan ide sebanyak mungkin dulu tanpa disaring.", true, "Tepat. Penilaian dilakukan nanti di tahap konvergen."],
      ["Seharusnya cukup satu orang yang memberi ide.", false, "Justru mengajak orang lain membuat pilihan solusinya lebih banyak dan beragam."],
      ["Mereka seharusnya langsung membuat action plan.", false, "Action plan dibuat setelah solusi terbaik dipilih, bukan di tahap mencari ide."]] },
    { t: "dua", bag: 2, s: "Kamu punya tiga ide solusi. Ide A dampaknya besar tapi butuh dana yang tidak kamu punya. Ide B dampaknya sedang dan bisa dijalankan minggu ini. Mana yang lebih masuk akal dipilih sekarang?", o: [["Ide A", false], ["Ide B", true]], r: [
      ["Karena keputusan harus menimbang kelayakan (feasibility), dampak, waktu, dan sumber daya, bukan dampaknya saja.", true, "Benar. Matriks penilaian memastikan solusi yang dipilih benar-benar bisa dijalankan."],
      ["Karena ide pertama yang muncul biasanya paling bagus.", false, "Alasan ini keliru. Urutan muncul tidak menentukan kualitas ide."],
      ["Karena dampak besar selalu berarti berisiko dan sebaiknya dihindari.", false, "Dampak besar tidak buruk. Masalahnya, sumber dayanya belum ada."]] },
    { t: "jelas", bag: 0, s: "Pakai teknik 5 Whys: “Aku sering terlambat masuk kerja.” Tuliskan minimal tiga “kenapa?” sampai kamu menemukan akar masalahnya.", m: "Kenapa terlambat? Aku bangun kesiangan. Kenapa kesiangan? Aku tidur larut. Kenapa tidur larut? Aku main ponsel sampai tengah malam. Kenapa main ponsel? Aku tidak punya batas waktu layar. Akar masalahnya: tidak ada kebiasaan berhenti memakai ponsel sebelum tidur, jadi solusinya memasang batas waktu, bukan sekadar menambah alarm.", p: ["Bertanya “kenapa” berulang, minimal tiga kali", "Menemukan penyebab dasar, bukan berhenti di gejala", "Solusi yang diusulkan menyasar akar masalah"] }
  ],
  "0-4": [
    { t: "kasus", bag: 0, s: "Andi bangga bisa belajar 14 jam sehari menjelang tes kerja. Belakangan ia mudah marah, susah fokus, dan tidurnya kacau. Apa yang paling tepat menggambarkan kondisinya?", o: [
      ["Ia sangat produktif, jadi tidak perlu berubah.", false, "Sibuk belum tentu produktif. Gejalanya justru tanda bahaya."],
      ["Ia mengalami toxic productivity dan tubuhnya memberi sinyal untuk berhenti sejenak sebelum burnout.", true, "Tepat. Mudah marah, susah fokus, dan tidur terganggu adalah sinyal yang perlu didengarkan."],
      ["Ia hanya kurang kopi.", false, "Kafein menutupi gejala, bukan menyelesaikan kelelahan."],
      ["Ia perlu liburan mahal supaya pulih.", false, "Pemulihan tidak harus mahal. Yang dibutuhkan adalah istirahat dan kebiasaan dasar yang rutin."]] },
    { t: "kasus", bag: 1, s: "Mana yang paling sesuai dengan arti self-care yang sebenarnya?", o: [
      ["Belanja barang mahal setiap kali stres.", false, "Ini cara kabur sebentar dari masalah, bukan merawat diri."],
      ["Tidur cukup, makan bergizi, dan membatasi konten yang membuatmu cemas, dilakukan rutin.", true, "Tepat. Self-care adalah kebiasaan dasar yang dilakukan dengan sadar untuk menjaga fisik dan mental."],
      ["Membatalkan semua kewajiban selama sebulan.", false, "Itu menghindar, bukan merawat diri secara berkelanjutan."],
      ["Liburan sekali setahun saja sudah cukup.", false, "Self-care yang efektif bersifat rutin, bukan sesekali."]] },
    { t: "dua", bag: 3, s: "Mana rencana self-care yang lebih mungkin bertahan?", o: [["Olahraga 2 jam setiap hari mulai besok", false], ["Jalan kaki 15 menit setiap pagi", true]], r: [
      ["Kebiasaan kecil yang rutin lebih mudah dijaga daripada rencana besar yang cepat ditinggalkan.", true, "Benar. Mulai dari 1–2 kebiasaan kecil, lalu jalankan setiap hari."],
      ["Karena olahraga berat berbahaya untuk kesehatan.", false, "Bukan soal bahaya. Rencana yang terlalu berat biasanya cepat ditinggalkan."],
      ["Karena jalan kaki lebih murah.", false, "Biaya bukan inti materinya. Intinya: realistis dan konsisten."]] },
    { t: "jelas", bag: 2, s: "Susun rencana self-care sederhana untuk dirimu yang mencakup sisi fisik, mental, dan sosial.", m: "Fisik: tidur sebelum jam 23.00 dan minum air yang cukup. Mental: menulis jurnal 5 menit sebelum tidur dan membisukan akun yang bikin aku membandingkan diri. Sosial: telepon sahabat seminggu sekali dan berani menolak ajakan yang bikin aku capek.", p: ["Ada kebiasaan untuk sisi fisik", "Ada kebiasaan untuk sisi mental atau emosional", "Ada kebiasaan untuk sisi sosial (support system atau batasan)"] }
  ],
  "1-0": [
    { t: "kasus", bag: 0, s: "Setelah atasannya membatalkan proyek yang sudah ia kerjakan seminggu, Ega bilang, “Aku kesal.” Menurut materi, langkah self-awareness berikutnya yang paling baik adalah…", o: [
      ["Membiarkan kekesalan itu lewat tanpa dipikirkan.", false, "Menyadari bukan berarti mengabaikan. Emosinya perlu dikenali lebih jelas."],
      ["Menamai perasaannya lebih spesifik, misalnya kecewa karena usahanya tidak dihargai.", true, "Tepat. Nama perasaan yang lebih tepat membantu memilih respons yang tepat pula."],
      ["Langsung protes ke atasannya.", false, "Bereaksi sebelum mengenali emosinya bisa membuat situasi memanas."],
      ["Menyalahkan rekan kerjanya.", false, "Itu mengalihkan masalah, bukan mengenali emosi diri."]] },
    { t: "kasus", bag: 1, s: "Dalam rapat, seorang rekan menjawab “iya, nggak apa-apa” dengan nada datar, tangan bersedekap, dan tidak menatap siapa pun. Apa yang sebaiknya kamu tangkap?", o: [
      ["Ia setuju karena ia bilang “iya”.", false, "Kata-katanya bilang setuju, tapi isyarat nonverbalnya mengatakan hal lain."],
      ["Isyarat nonverbalnya menunjukkan ia mungkin keberatan, jadi ada baiknya ditanyakan dengan lembut.", true, "Tepat. Bahasa tubuh dan nada suara sering lebih jujur daripada kata-kata."],
      ["Ia memang orang yang dingin.", false, "Itu cap, bukan pembacaan situasi. Social awareness berarti membaca keadaannya saat itu."],
      ["Abaikan saja, itu bukan urusanmu.", false, "Kepekaan sosial justru membantu mencegah salah paham di tim."]] },
    { t: "dua", bag: 2, s: "Kamu tahu kamu mudah tersulut saat lelah, dan kamu melihat timmu sedang tegang menjelang tenggat. Apa respons yang paling cerdas secara emosi?", o: [["Menunda diskusi sensitif dan menurunkan nada bicara", true], ["Menyampaikan semua kritik sekarang supaya cepat selesai", false]], r: [
      ["Karena memadukan pengetahuan tentang diri sendiri dan suasana orang lain membantu memilih respons yang paling pas.", true, "Benar. Itu inti dinamika sosial berbasis kecerdasan emosional."],
      ["Karena kritik tidak pernah boleh disampaikan di tempat kerja.", false, "Kritik boleh. Yang penting waktunya dan caranya tepat."],
      ["Karena emosi harus selalu ditahan.", false, "Kecerdasan emosional bukan menahan emosi, tapi menyadari dan memilih respons."]] },
    { t: "jelas", bag: 0, s: "Jelaskan dengan kata-katamu: mengapa kecerdasan emosional dimulai dari “sadar”, bukan dari “menahan marah”?", m: "Karena aku tidak bisa mengatur sesuatu yang tidak aku sadari. Kalau aku sudah tahu apa yang aku rasakan, apa pemicunya, dan sinyal tubuhku, aku bisa memilih respons sebelum emosinya mengambil alih. Menahan marah tanpa sadar penyebabnya cuma menunda ledakan.", p: ["Menyebut bahwa emosi perlu dikenali dulu sebelum diatur", "Menyebut pemicu (trigger) atau sinyal tubuh", "Menjelaskan bahwa kesadaran membantu memilih respons"] }
  ],
  "1-1": [
    { t: "kasus", bag: 0, s: "Sudah enam bulan Wulan bekerja. Ia tidak lagi cemas, tapi merasa hampa, sinis terhadap pekerjaannya, dan tidak peduli lagi apakah hasilnya bagus. Ini lebih dekat ke…", o: [
      ["Stres biasa, karena ia sedang sibuk.", false, "Stres ditandai keterlibatan berlebihan dan cemas. Wulan justru menarik diri."],
      ["Burnout, karena ia menarik diri secara emosional dan kehilangan motivasi.", true, "Tepat. Disengagement, sinis, dan hampa adalah tanda burnout."],
      ["Eustress, tekanan yang bikin semangat.", false, "Eustress membuat bersemangat, bukan hampa."],
      ["Tanda ia sudah sangat profesional.", false, "Tidak peduli pada hasil kerja bukan tanda profesional, tapi tanda kelelahan kronis."]] },
    { t: "kasus", bag: 2, s: "Tenggat laporan Yudi tidak bisa diundur, dan ia panik sampai susah berpikir. Strategi coping mana yang paling cocok dilakukan lebih dulu?", o: [
      ["Problem-focused: minta tenggat diundur.", false, "Di cerita ini tenggatnya tidak bisa diubah, jadi strategi ini kurang tepat."],
      ["Emotion-focused: tarik napas dalam beberapa menit untuk menenangkan diri, lalu kerjakan bertahap.", true, "Tepat. Saat sumber masalah belum bisa diubah, tenangkan emosi dulu agar bisa berpikir jernih."],
      ["Mengabaikan laporan sampai paniknya hilang sendiri.", false, "Menghindar justru menambah tekanan menjelang tenggat."],
      ["Begadang tanpa istirahat sampai selesai.", false, "Itu menguras energi dan bisa memperparah stres."]] },
    { t: "dua", bag: 3, s: "Atasan memintamu mengambil tugas tambahan, padahal bebanmu sudah melebihi kapasitas. Respons mana yang lebih sehat?", o: [["“Saya ingin membantu, tapi minggu ini saya sedang mengejar laporan A. Boleh kita bahas prioritasnya?”", true], ["“Siap, Pak,” lalu begadang setiap malam", false]], r: [
      ["Menetapkan batasan dengan tegas tapi sopan melindungi energi, dan tetap menghargai atasan.", true, "Benar. Berani bilang tidak dengan cara yang baik adalah bagian dari manajemen energi."],
      ["Karena menolak atasan selalu menunjukkan profesionalisme.", false, "Bukan soal menolak, tapi menyampaikan batasan dan mendiskusikan prioritas."],
      ["Karena tugas tambahan selalu tidak penting.", false, "Tugasnya bisa saja penting. Masalahnya ada pada kapasitas yang sudah penuh."]] },
    { t: "jelas", bag: 1, s: "Sebutkan satu pemicu stres dari luar dan satu dari dalam dirimu, lalu satu gejala awal yang biasa kamu rasakan.", m: "Dari luar: tenggat tugas yang menumpuk di minggu yang sama. Dari dalam: aku perfeksionis, jadi lama menyelesaikan sesuatu. Gejala awalku: sakit kepala dan jadi gampang tersinggung.", p: ["Menyebut pemicu dari luar (beban, tenggat, konflik, lingkungan)", "Menyebut pemicu dari dalam (perfeksionis, overthinking, pesimis)", "Menyebut gejala awal fisik, emosi, atau perilaku"] }
  ],
  "1-2": [
    { t: "kasus", bag: 0, s: "Atasan berkata dengan nada tinggi, “Laporanmu berantakan, angkanya tidak cocok!” Respons mana yang paling sesuai materi?", o: [
      ["“Bapak juga tidak pernah menjelaskan formatnya!”", false, "Ini membela diri dan menyerang balik, reaksi spontan yang justru menghambat."],
      ["Diam sejenak, lalu: “Baik, Pak. Bagian angka mana yang tidak cocok? Saya periksa sekarang.”", true, "Tepat. Beri jeda, pisahkan isi kritik dari nadanya, lalu fokus ke perbaikan."],
      ["Diam saja, lalu menangis di kamar mandi.", false, "Merasa sedih itu wajar, tapi kritiknya tetap perlu ditanggapi supaya bisa diperbaiki."],
      ["Menganggap atasan membencimu.", false, "Kritik atas hasil kerja bukan serangan pribadi."]] },
    { t: "kasus", bag: 1, s: "Setelah gagal tes, Lia berkata, “Aku memang orang yang gagal.” Kalimat mana yang mencerminkan resilience?", o: [
      ["“Aku tidak akan ikut tes lagi.”", false, "Ini menyerah, kebalikan dari bangkit kembali."],
      ["“Aku gagal di tes ini karena belum latihan soal berwaktu. Itu bisa aku latih.”", true, "Tepat. Kegagalan dilihat sebagai kejadian yang bisa dievaluasi, bukan identitas."],
      ["“Semua ini salah penyelenggara tes.”", false, "Menyalahkan pihak lain menghalangi evaluasi diri."],
      ["“Aku tidak apa-apa,” sambil memendam semuanya.", false, "Resilience bukan menahan sakit, tapi pulih dan belajar."]] },
    { t: "dua", bag: 2, s: "Kamu menerima masukan “presentasimu membosankan”. Mana yang lebih berguna sebagai langkah berikutnya?", o: [["“Aku perlu melatih intonasi dan membuat slide yang lebih ringkas.”", true], ["“Aku harus jadi orang yang lebih menarik.”", false]], r: [
      ["Masukan yang umum perlu diubah menjadi langkah konkret yang bisa langsung dipraktikkan (actionable).", true, "Benar. Target yang jelas lebih mudah dilatih dan diukur."],
      ["Karena masukan dari orang lain tidak perlu dipikirkan terlalu dalam.", false, "Justru masukan perlu diolah agar berguna."],
      ["Karena kelemahan sebaiknya disembunyikan.", false, "Materi menekankan menerima kelemahan tanpa malu sebagai langkah pertama."]] },
    { t: "jelas", bag: 1, s: "Lakukan post-mortem singkat atas satu kegagalanmu: apa yang meleset, apa pelajarannya, dan apa yang akan kamu lakukan berbeda?", m: "Yang meleset: aku kehabisan waktu di tes tertulis karena terlalu lama di soal pertama. Pelajarannya: aku perlu mengatur waktu per soal. Ke depan: aku latihan soal berwaktu dan melewati soal yang sulit dulu.", p: ["Menjelaskan apa yang meleset secara faktual", "Menarik pelajaran tanpa menyalahkan diri sebagai orang yang gagal", "Menulis tindakan berbeda yang konkret"] }
  ],
  "1-3": [
    { t: "kasus", bag: 0, s: "Setelah gajian, Bimo membeli ponsel baru dan merasa senang selama seminggu, lalu kembali hampa. Jenis kebahagiaan apa yang ia rasakan?", o: [
      ["Eudaimonik, karena ia senang.", false, "Eudaimonik berasal dari makna dan pengembangan diri, bukan dari barang."],
      ["Hedonis, yaitu senang sesaat dari hal di luar diri.", true, "Tepat. Kesenangan hedonis wajar, tapi cepat memudar."],
      ["Life satisfaction penuh.", false, "Kepuasan hidup muncul dari keselarasan harapan dan kenyataan, bukan pembelian."],
      ["Gratitude.", false, "Gratitude adalah latihan bersyukur, bukan kesenangan dari membeli barang."]] },
    { t: "kasus", bag: 1, s: "Fitri merasa hidupnya selalu kurang dibanding teman-temannya. Kebiasaan mana yang paling sesuai materi untuk membantunya?", o: [
      ["Lebih sering melihat media sosial teman supaya termotivasi.", false, "Membandingkan diri justru memperkuat fokus pada kekurangan."],
      ["Menulis 3–5 hal kecil yang disyukuri setiap hari.", true, "Tepat. Jurnal syukur melatih otak memperhatikan hal baik yang sudah dimiliki."],
      ["Memaksa diri selalu tersenyum.", false, "Bahagia tidak berarti menolak perasaan sedih."],
      ["Menunggu sampai punya pekerjaan baru bisa bahagia.", false, "Bahagia bukan hadiah di masa depan. Bahagia bisa dilatih sekarang."]] },
    { t: "dua", bag: 0, s: "Pernyataan: “Orang yang bahagia tidak pernah merasa sedih.”", o: [["Benar", false], ["Salah", true]], r: [
      ["Bahagia yang sebenarnya mencakup kemampuan menerima semua perasaan sambil tetap tenang di dalam hati.", true, "Benar. Sedih dan marah tetap bagian dari hidup yang sehat."],
      ["Karena kesedihan selalu membuat orang tidak bahagia selamanya.", false, "Alasan ini keliru. Kesedihan bisa datang dan pergi tanpa menghapus kebahagiaan."],
      ["Karena bahagia hanya bisa dicapai lewat barang mahal.", false, "Materi justru menekankan makna dan hubungan, bukan barang."]] },
    { t: "jelas", bag: 2, s: "Hubungkan kegiatanmu sehari-hari (sekolah, kuliah, atau kerja) dengan satu nilai yang kamu pegang. Mengapa kegiatan itu bermakna untukmu?", m: "Aku belajar akuntansi karena aku memegang nilai kemandirian: aku ingin bisa membantu usaha keluarga mengatur keuangan. Saat bosan, aku ingat bahwa setiap laporan yang aku pelajari mendekatkanku ke tujuan itu.", p: ["Menyebut kegiatan sehari-hari yang konkret", "Menyebut nilai atau alasan (why) yang dipegang", "Menjelaskan hubungan kegiatan itu dengan makna atau orang lain"] }
  ],
  "1-4": [
    { t: "kasus", bag: 0, s: "Temanmu bercerita baru saja gagal wawancara. Respons mana yang menunjukkan empati, bukan simpati?", o: [
      ["“Kasihan banget kamu.”", false, "Ini simpati: merasa kasihan dari sudut pandang kita sendiri."],
      ["“Wajar kamu kecewa, kamu sudah siap-siap seminggu. Mau cerita bagian mana yang paling bikin berat?”", true, "Tepat. Ini memvalidasi emosinya dan mencoba memahami dari sudut pandangnya."],
      ["“Ah, gitu doang. Masih banyak lowongan.”", false, "Ini mengecilkan masalahnya, kebalikan dari empati."],
      ["“Aku dulu juga gagal tiga kali, lebih parah.”", false, "Ini mengalihkan fokus ke dirimu sendiri."]] },
    { t: "kasus", bag: 2, s: "Rekan setimmu terlambat menyerahkan bagian laporan. Kalimat mana yang asertif dan welas asih?", o: [
      ["“Kamu selalu telat! Gara-gara kamu kita bisa kena tegur.”", false, "Ini agresif dan menuduh."],
      ["Diam saja, lalu mengerjakan bagiannya sendiri sampai larut.", false, "Ini pasif. Kebutuhanmu tidak tersampaikan."],
      ["“Aku khawatir laporan kita terlambat. Ada yang bisa aku bantu supaya bagianmu selesai sore ini?”", true, "Tepat. Pesan “aku” menyampaikan kekhawatiran dengan jelas tanpa menyerang."],
      ["“Terserah kamu deh.”", false, "Ini menghindar, bukan berkomunikasi."]] },
    { t: "dua", bag: 1, s: "Saat temanmu bercerita, kamu sudah menyiapkan solusi di kepala sejak kalimat pertama. Apakah ini mendengarkan aktif?", o: [["Ya", false], ["Bukan", true]], r: [
      ["Mendengarkan aktif berarti mendengar untuk memahami, bukan menunggu giliran bicara sambil menyusun balasan.", true, "Benar. Tahan asumsi dan solusi sampai kamu benar-benar paham ceritanya."],
      ["Karena memberi solusi selalu dilarang.", false, "Solusi boleh, asalnya setelah benar-benar memahami ceritanya."],
      ["Karena mendengarkan aktif berarti diam total tanpa respons.", false, "Mendengarkan aktif justru disertai respons, seperti mengangguk dan paraphrasing."]] },
    { t: "jelas", bag: 2, s: "Temanmu bilang, “Tenggatku dimajukan, padahal aku juga lagi sakit.” Tulis respons paraphrasing yang menunjukkan kamu paham.", m: "“Jadi kamu lagi tertekan karena tenggatnya tiba-tiba lebih cepat, padahal badanmu juga lagi nggak fit, ya? Pasti berat banget.”", p: ["Merangkum ulang isi ceritanya dengan kalimat sendiri", "Menyebut perasaan yang mungkin ia rasakan", "Tidak langsung menghakimi atau buru-buru memberi solusi"] }
  ],
  "2-0": [
    { t: "kasus", bag: 0, s: "Penjualan sebuah toko turun. Manajer langsung memberi diskon besar. Penjualan naik sebentar, lalu turun lagi dan keuntungan ikut menipis. Pola pikir apa yang dipakai manajer?", o: [
      ["System thinking, karena ia bertindak cepat.", false, "Bertindak cepat bukan ciri system thinking. Ia tidak memikirkan dampak berikutnya."],
      ["Pola pikir linear: satu sebab, solusi cepat, tanpa memikirkan dampak berikutnya.", true, "Tepat. Diskon menambal gejala dan memunculkan masalah baru (keuntungan menipis)."],
      ["Critical thinking, karena ia memakai data penjualan.", false, "Ia memakai data, tapi tidak menelusuri akar masalah dan hubungan antarbagian."],
      ["Strategic thinking, karena ada tujuan menaikkan penjualan.", false, "Tujuannya jangka pendek dan tidak mempertimbangkan sistemnya."]] },
    { t: "kasus", bag: 1, s: "Karyawan yang lelah membuat banyak kesalahan, kesalahan menambah lembur, dan lembur membuat karyawan makin lelah. Ini contoh…", o: [
      ["Balancing loop", false, "Balancing loop menahan perubahan agar stabil. Di sini masalahnya justru membesar."],
      ["Reinforcing loop (siklus penguat) ke arah buruk", true, "Tepat. Akibat kembali memperkuat sebabnya sehingga dampaknya makin besar."],
      ["Hubungan linear satu arah", false, "Hubungannya melingkar, bukan satu arah."],
      ["Mental model", false, "Mental model adalah keyakinan yang mendasari sistem, bukan siklus sebab-akibat ini."]] },
    { t: "dua", bag: 2, s: "Pada Model Gunung Es, aturan “semua pesanan wajib lewat satu kasir” termasuk lapisan apa?", o: [["Underlying structure", true], ["Event", false]], r: [
      ["Karena aturan atau prosedur adalah struktur yang membuat pola masalah terus terjadi.", true, "Benar. Struktur ada di bawah pola; mengubahnya mencegah kejadian berulang."],
      ["Karena aturan adalah kejadian yang paling terlihat di permukaan.", false, "Yang terlihat di permukaan adalah event, misalnya keluhan hari ini."],
      ["Karena aturan sama dengan keyakinan seseorang.", false, "Keyakinan ada di lapisan mental model, lebih dalam dari struktur."]] },
    { t: "jelas", bag: 2, s: "Pilih satu masalah di sekitarmu (sekolah, kerja, atau rumah). Petakan dengan empat lapisan Model Gunung Es.", m: "Event: hari ini kelas terlambat mulai. Pattern: setiap Senin selalu terlambat. Structure: upacara selesai mepet dan jarak lapangan ke kelas jauh. Mental model: dianggap wajar kalau Senin telat. Solusinya: jadwal pelajaran pertama dimundurkan 10 menit setiap Senin.", p: ["Menyebut event (kejadian yang tampak)", "Menyebut pattern dan struktur penyebabnya", "Menyebut mental model atau solusi yang menyentuh lapisan dalam"] }
  ],
  "2-1": [
    { t: "kasus", bag: 0, s: "“Perusahaan ini punya 500 karyawan, kantornya nyaman, jadi pasti tempat kerja terbaik.” Bagian mana yang termasuk fakta?", o: [
      ["“Kantornya nyaman”", false, "Nyaman adalah penilaian pribadi, jadi opini."],
      ["“Pasti tempat kerja terbaik”", false, "Ini kesimpulan yang belum ada buktinya, jadi asumsi."],
      ["“Punya 500 karyawan”", true, "Tepat. Jumlah karyawan bisa dibuktikan dengan data."],
      ["Semuanya fakta.", false, "Hanya jumlah karyawan yang bisa dibuktikan. Sisanya opini dan asumsi."]] },
    { t: "kasus", bag: 2, s: "Kamu menerima tawaran kerja lewat WhatsApp: gaji Rp9 juta tanpa pengalaman, diminta transfer biaya pelatihan, kontak memakai email gratisan. Langkah paling kritis adalah…", o: [
      ["Segera transfer agar tidak kehabisan kuota.", false, "Biaya pendaftaran adalah tanda penipuan."],
      ["Cek situs dan media sosial resmi perusahaan, lalu bandingkan dengan sumber lain sebelum menanggapi.", true, "Tepat. Cek sumber, rekam jejak, dan bandingkan informasi sebelum percaya."],
      ["Percaya karena yang membagikan adalah teman dekat.", false, "Kepercayaan pada pembagi bukan bukti kebenaran informasi."],
      ["Langsung datang ke alamat yang diberikan.", false, "Datang tanpa verifikasi bisa berbahaya."]] },
    { t: "dua", bag: 1, s: "Kamu yakin perusahaan A buruk, lalu hanya membaca ulasan negatif tentangnya dan melewatkan ulasan positif. Ini…", o: [["Confirmation bias", true], ["Berpikir kritis", false]], r: [
      ["Kita cenderung hanya mencari dan mempercayai informasi yang cocok dengan keyakinan sendiri.", true, "Benar. Itu definisi confirmation bias, jalan pintas otak yang membuat penilaian keliru."],
      ["Karena membaca ulasan negatif selalu salah.", false, "Ulasan negatif boleh dibaca. Masalahnya ada pada sikap mengabaikan bukti yang berlawanan."],
      ["Karena ulasan positif pasti palsu.", false, "Itu asumsi tanpa bukti."]] },
    { t: "jelas", bag: 2, s: "Susun argumen singkat yang kuat untuk pernyataan: “Lulusan SMK perlu ikut magang sebelum melamar kerja.”", m: "Premis: banyak lowongan meminta pengalaman kerja. Bukti: data lowongan di situs kerja menunjukkan sebagian besar posisi admin meminta pengalaman minimal enam bulan. Kesimpulan: magang memberi pengalaman nyata yang meningkatkan peluang lolos seleksi.", p: ["Ada premis atau alasan yang jelas", "Ada bukti atau data yang bisa dicek", "Kesimpulan mengikuti premis, bukan opini semata"] }
  ],
  "2-2": [
    { t: "kasus", bag: 1, s: "Visi Ayu: menjadi desainer grafis profesional dalam tiga tahun. Mana yang termasuk taktik?", o: [
      ["Menjadi desainer grafis profesional", false, "Ini visi atau tujuan akhir."],
      ["Fokus membangun portofolio dan pengalaman nyata di bidang desain", false, "Ini arah besar (strategi)."],
      ["Membuat satu desain poster setiap minggu dan mengunggahnya ke portofolio daring", true, "Tepat. Taktik adalah cara spesifik untuk menjalankan strategi."],
      ["Ingin sukses", false, "Terlalu umum. Ini bukan strategi maupun taktik."]] },
    { t: "kasus", bag: 0, s: "Saat memetakan kondisi, Doni menulis: “Banyak toko daring butuh admin media sosial.” Ini termasuk…", o: [
      ["Kelemahan internal", false, "Kebutuhan pasar datang dari luar diri, jadi bukan kondisi internal."],
      ["Peluang eksternal", true, "Tepat. Peluang adalah kondisi di luar diri yang bisa dimanfaatkan."],
      ["Sumber daya internal", false, "Sumber daya adalah yang kamu punya, misalnya waktu, uang, dan keahlian."],
      ["Ancaman eksternal", false, "Ancaman adalah hal di luar yang bisa menghambatmu."]] },
    { t: "dua", bag: 3, s: "Rencanamu kursus sertifikasi tiga bulan, tapi tiba-tiba kamu diterima kerja shift malam. Sebaiknya…", o: [["Mengubah jadwal kursus ke akhir pekan, tujuan tetap sama", true], ["Membatalkan tujuan menjadi network engineer", false]], r: [
      ["Taktik boleh berubah saat keadaan berubah, asal arahnya tetap menuju visi jangka panjang.", true, "Benar. Itu kelenturan strategis (agility)."],
      ["Karena rencana yang sudah dibuat tidak boleh diubah sama sekali.", false, "Rencana bukan aturan kaku."],
      ["Karena visi jangka panjang harus mengikuti situasi sesaat.", false, "Yang menyesuaikan adalah taktik, bukan visinya."]] },
    { t: "jelas", bag: 2, s: "Ubah satu tujuan kariermu menjadi tiga tonggak (milestone) yang bisa diukur.", m: "Tujuan: bekerja sebagai admin keuangan dalam satu tahun. Bulan 1–2: lulus kursus Excel dasar dan mendapat sertifikat. Bulan 3–4: menyelesaikan lima proyek laporan sederhana untuk portofolio. Bulan 5–6: mengirim 30 lamaran yang disesuaikan per lowongan.", p: ["Ada tujuan akhir yang jelas", "Ada tiga target jangka pendek yang berurutan", "Setiap target bisa diukur (angka, waktu, atau bukti)"] }
  ],
  "2-3": [
    { t: "kasus", bag: 0, s: "Setelah wawancara pertamanya, Rina menyimpulkan bahwa ia perlu menyiapkan contoh pengalaman. Di wawancara berikutnya ia mencoba menceritakan PKL-nya dengan runtut. Tahap siklus Kolb yang terakhir ini adalah…", o: [
      ["Pengalaman konkret", false, "Itu tahap mengalami kejadiannya."],
      ["Observasi reflektif", false, "Itu tahap mengamati kejadiannya dengan kritis."],
      ["Konseptualisasi abstrak", false, "Itu tahap menarik kesimpulan, yang ia lakukan sebelumnya."],
      ["Eksperimen aktif", true, "Tepat. Ia mencoba pelajarannya di situasi baru."]] },
    { t: "kasus", bag: 1, s: "Mana yang termasuk berpikir reflektif, bukan sekadar menyesali?", o: [
      ["“Kenapa sih aku selalu sial?”", false, "Ini menyesali nasib tanpa menguraikan kejadiannya."],
      ["“Apa yang terjadi, apa yang aku rasakan, apa yang sudah baik dan kurang, dan apa yang akan aku lakukan berbeda?”", true, "Tepat. Ini mengikuti pertanyaan pemandu Model Refleksi Gibbs."],
      ["“Ya sudahlah, lupakan saja.”", false, "Melupakan tanpa mengambil pelajaran membuat pengalaman lewat begitu saja."],
      ["“Semua ini salah pewawancaranya.”", false, "Menyalahkan pihak lain bukan analisis diri."]] },
    { t: "dua", bag: 3, s: "Refleksi dianggap belum selesai bila…", o: [["Berhenti di perenungan tanpa rencana aksi", true], ["Sudah ada rencana tindakan berbeda untuk lain kali", false]], r: [
      ["Bagian terpenting refleksi adalah mengubah wawasan menjadi rencana aksi nyata.", true, "Benar. Pertanyaannya: kalau terjadi lagi, apa yang akan kulakukan berbeda?"],
      ["Karena refleksi cukup dilakukan di dalam hati.", false, "Refleksi perlu dituangkan menjadi langkah nyata agar berguna."],
      ["Karena rencana aksi membuat refleksi terlalu panjang.", false, "Rencana aksi justru inti dari refleksi."]] },
    { t: "jelas", bag: 3, s: "Ceritakan satu pengalaman kerja kelompok atau PKL dengan metode STAR.", m: "Situation: saat PKL di kantor desa, arsip surat menumpuk. Task: aku diminta merapikan arsip dalam dua minggu. Action: aku membuat sistem penomoran dan daftar arsip di Excel. Result: pencarian surat yang tadinya 15 menit jadi kurang dari 2 menit.", p: ["Situation dan Task dijelaskan singkat", "Action menyebut tindakan spesifikmu sendiri", "Result menyebut hasil yang terukur"] }
  ],
  "2-4": [
    { t: "kasus", bag: 0, s: "Saat diminta mengusulkan ide promosi, Nina diam saja karena takut idenya ditertawakan. Hambatan kreativitas apa ini?", o: [
      ["Rigid thinking", false, "Rigid thinking adalah terpaku pada prosedur."],
      ["Fear of failure (takut dikritik atau salah)", true, "Tepat. Rasa takut ini membunuh ide sebelum sempat berkembang."],
      ["Combinatorial play", false, "Itu teknik menggabungkan ide, bukan hambatan."],
      ["Incubation period", false, "Itu cara memberi waktu agar ide matang, bukan hambatan."]] },
    { t: "kasus", bag: 1, s: "Tim kamu sedang brainstorming dan sudah punya 5 ide. Seorang anggota ingin langsung memilih yang terbaik. Saran yang paling tepat adalah…", o: [
      ["Setuju, 5 ide sudah cukup.", false, "Di tahap brainstorming, kejar jumlah ide dulu."],
      ["Kumpulkan ide lebih banyak dulu tanpa menilai, baru menyaring di tahap berikutnya.", true, "Tepat. Penilaian dipisahkan dari tahap mengumpulkan ide."],
      ["Pilih ide yang paling aman saja.", false, "Ide aman belum tentu solusi terbaik, dan ide lain belum sempat muncul."],
      ["Batalkan sesi karena idenya kurang bagus.", false, "Ide yang belum sempurna bisa dikembangkan nanti."]] },
    { t: "dua", bag: 2, s: "Tari menggabungkan resep kue keluarganya dengan keahlian fotografi ponsel untuk membuat katalog jualan daring. Ini contoh…", o: [["Combinatorial play", true], ["Mind mapping", false]], r: [
      ["Dua ide atau keahlian yang sudah ada digabung menjadi solusi baru.", true, "Benar. Itu inti combinatorial play."],
      ["Karena ia menulis topik di tengah lalu membuat cabang.", false, "Itu deskripsi mind mapping, bukan yang dilakukan di sini."],
      ["Karena ia menghindari kritik.", false, "Tidak ada hubungannya dengan kritik."]] },
    { t: "jelas", bag: 1, s: "Buat mind map singkat dalam bentuk teks untuk topik “Cara menunjukkan kemampuanku tanpa pengalaman kerja”. Tulis minimal tiga cabang.", m: "Topik: menunjukkan kemampuan tanpa pengalaman. Cabang 1, portofolio: proyek sekolah dan desain pribadi. Cabang 2, media sosial: unggah proses kerja dan hasil. Cabang 3, kegiatan: panitia acara sekolah dan kerja sukarela. Hubungan antarcabang: hasil kegiatan bisa dimasukkan ke portofolio.", p: ["Ada satu topik utama", "Ada minimal tiga cabang ide", "Menunjukkan hubungan antarcabang atau ide yang bisa dikembangkan"] }
  ]
};
