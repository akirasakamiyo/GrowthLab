(()=>{
const $=s=>document.querySelector(s),box=$("#chat"),fab=$("#chatfab"),cm=$("#cm"),inp=$("#cin"),cq=$("#cq");
/* 2026-10-20: asisten berjalan offline (jawaban dari materi & FAQ), tanpa layanan AI eksternal */
let hist=[],started=false,busy=false;
$("#chmode").lastChild.textContent=" Offline, jawaban diambil dari materi GrowthLab";
/* basis jawaban: diperbarui 2026-11-06 untuk seluruh fitur GrowthLab (materi berurutan, gamifikasi selalu aktif,
   nilai akhir tersembunyi sampai latihan lengkap, simulasi layar penuh, sertifikat, cadangan, offline/SCORM, video promo).
   Setiap entri: k = kata kunci (dicocokkan sebagai potongan teks), t = jawaban, a = [label, tautan]. Entri dengan
   kecocokan terbanyak (panjang kata kunci) yang dipakai, jadi urutan tidak menentukan. */
const HASD=typeof GLD!=="undefined",NQ=HASD?GLD.QUIZ.length:0,NS=HASD?GLD.SIM.length:0,ND=HASD?GLD.DND.length:0;
const C=HASD?GLD.COURSE:{chapters:[]},NB=C.chapters.length,NL=C.chapters.reduce((n,c)=>n+c.l.length,0);
const SITU=window.GLS&&GLS.SITU||5,PASS=HASD?GLD.PASS_MCQ:70;
const KAT=HASD?GLD.KATEGORI.slice(0,-1).map(([t],i)=>GLS.score.katLabel(i)+" "+t).join(", ")+`, di bawah ${GLD.KATEGORI[GLD.KATEGORI.length-2][1]} ${GLD.KATEGORI[GLD.KATEGORI.length-1][0]}`:"";
const BAB=C.chapters.map((c,i)=>`Bab ${i+1} ${c.t}: ${c.l.map(l=>l.t).join(", ")}`).join(". ");
/* disusun saat pertanyaan pertama: konfigurasi gamifikasi (GLG.CFG) dimuat setelah skrip ini */
let KB=null;
const mkKB=()=>{const G=window.GLG&&GLG.CFG;
const LVL=G?G.tiers.map(([n,t])=>`${t} (mulai Level ${n})`).join(", "):"Pemula, Calon Kandidat, Siap Interview, dan Job Ready";
return[
 {k:["halo","hai","hello","selamat pagi","selamat siang","selamat sore","selamat malam","assalamualaikum"],t:"Halo! Aku Labi, asisten GrowthLab. Tanyakan apa saja soal materi, latihan, nilai, XP dan badge, sertifikat, atau cara memakai situs ini."},
 {k:["terima kasih","makasih","thanks","thx"],t:"Sama-sama! Semangat belajarnya. Kalau ada yang bingung lagi, tanya saja."},
 {k:["apa itu growthlab","growthlab itu","tentang growthlab","media apa","situs apa","web apa"],t:`GrowthLab adalah media pembelajaran interaktif berbasis website berjudul Self Development for Job Seeker, untuk siswa SMK kelas XII dan fresh graduate. Isinya ${NB} bab dan ${NL} pelajaran soft skill, latihan (kuis, drag & drop, simulasi kasus kerja), nilai akhir, dan gamifikasi. Gratis, tanpa akun, dan bisa dipakai offline.`,a:["Tentang GrowthLab","#/tentang"]},
 {k:["bab","materi","pelajaran apa","daftar pelajaran","topik","kurikulum","silabus","isi materi"],t:`Ada ${NB} bab dan ${NL} pelajaran. ${BAB}.`,a:["Buka materi","#/course"]},
 {k:["terkunci","gembok","kunci","tidak bisa dibuka","nggak bisa dibuka","gak bisa dibuka","tidak bisa diakses","berurutan","urut"],t:"Pelajaran dibuka berurutan. Pelajaran berikutnya terbuka setelah pelajaran sebelumnya kamu tandai selesai (tombol “Tandai selesai” di akhir pelajaran). Pelajaran yang masih terkunci ditandai ikon gembok di daftar pelajaran, peta konsep, dan katalog.",a:["Lanjut belajar","#/course"]},
 {k:["tandai selesai","selesai pelajaran","menyelesaikan pelajaran","centang"],t:"Baca pelajarannya sampai bawah, lalu tekan “Tandai selesai”. Pelajaran mendapat tanda centang, kamu dapat XP, dan pelajaran berikutnya terbuka."},
 {k:["isi pelajaran","dalam pelajaran","coba sendiri","aktivitas","cek cepat","catatan","jurnal","simulator"],t:"Setiap pelajaran berisi uraian, konsep penting, diagram, contoh kasus melamar kerja atau magang, aktivitas “Coba sendiri” (misalnya simulator segitiga kognitif, tangga 5 Whys, latihan napas, penyusun jawaban STAR), soal cek cepat, ringkasan, dan kolom catatan pribadi yang tersimpan otomatis.",a:["Buka pelajaran pertama","#/lesson/0-0"]},
 {k:["mulai dari mana","belajar dari mana","cara mulai","harus mulai","rekomendasi","bab mana dulu"],t:"Mulai dari Bab 1 Self-Management, pelajaran Recognise Your Strengths, lalu ikuti urutannya sampai Bab 3. Setelah itu kerjakan Latihan: kuis, drag & drop, dan simulasi.",a:["Mulai Bab 1","#/lesson/0-0"]},
 {k:["alur","urutan belajar","tahap","langkah"],t:"Alur belajar: Materi (3 bab, berurutan) → Latihan soal (kuis + drag & drop) → Simulasi kasus kerja → Nilai akhir.",a:["Lihat alur belajar","#/alur"]},
 {k:["latihan","latihan apa","menu latihan"],t:`Menu Latihan berisi kuis pilihan ganda (${NQ} soal, bobot 30%), drag & drop (${ND} set), dan simulasi kasus kerja (${NS} skenario, bobot 70%). Nilai akhir muncul setelah ketiganya selesai.`,a:["Buka Latihan","#/latihan"]},
 {k:["kuis","quiz","pilihan ganda","soal kuis","quizizz"],t:`Kuis pilihan ganda bergaya Quizizz, tampil layar penuh, ada ${NQ} soal. Bisa dikerjakan per bab atau mode Gabungan; urutan soal dan pilihan diacak tiap percobaan. Batas lulusnya ${PASS}. Yang masuk nilai akhir hanya skor terbaik mode Gabungan. Di kuis per bab ada petunjuk bertahap, dan kalau skormu di bawah batas lulus kamu diberi saran pelajaran untuk diulang. Saat main, tekan 1–4 atau A–D untuk menjawab.`,a:["Buka kuis","#/latihan/kuis"]},
 {k:["drag","drop","seret","cocokkan","pasangkan","urutkan"],t:`Ada ${ND} set drag & drop, misalnya memasangkan jebakan pikiran, memilah stres dan burnout, serta fakta, opini, dan asumsi. Bisa dimainkan dengan mouse, sentuhan, atau keyboard. Skornya tidak dihitung ke nilai akhir, tetapi semua set harus dicek minimal sekali supaya nilai akhir terbuka.`,a:["Coba drag & drop","#/latihan/dnd"]},
 {k:["simulasi","skenario","kasus kerja","branching","bercabang","ending"],t:`Ada ${NS} simulasi kasus kerja: ditolak setelah wawancara (Self-Management & Resiliensi, 35%), kritik keras dari atasan saat magang (Kecerdasan Emosional & Komunikasi, 35%), dan tenggat proyek tim (Thinking Skill & Pemecahan Masalah, 30%). Setiap kasus punya ${SITU} situasi bercabang dan 4 kemungkinan akhir cerita. Ceritanya menyesuaikan caramu bermain: kalau kesulitan ada tokoh yang membantu, kalau sedang bagus tantangannya naik. Simulasi tampil layar penuh; tekan 1–4 untuk memilih, Spasi untuk mempercepat, dan tombol X untuk keluar. Pilihan terkunci setelah dipilih, tapi progresmu tersimpan kalau keluar di tengah.`,a:["Mulai simulasi","#/latihan/sim"]},
 {k:["layar penuh","fullscreen","full screen"],t:"Kuis dan simulasi tampil layar penuh supaya fokus. Tekan tombol X (atau Esc di kuis) untuk keluar; progres simulasi tetap tersimpan."},
 {k:["nilai akhir","hitung nilai","menghitung nilai","rumus","bobot","cara hitung","persen"],t:"Nilai Akhir = (Nilai Pilihan Ganda × 0,30) + (Nilai Simulasi × 0,70). Nilai pilihan ganda = benar ÷ jumlah soal × 100, diambil dari skor terbaik kuis Gabungan. Nilai simulasi = Aspek 1 × 0,35 + Aspek 2 × 0,35 + Aspek 3 × 0,30, dengan skor tiap aspek dari pilihan di jalur yang kamu ambil.",a:["Lihat alur & cara hitung","#/alur"]},
 {k:["nilai akhir","muncul","terbuka","kapan nilai","syarat","tidak ada","ga ada","gak ada","nggak ada","hilang"],t:"Bagian Nilai akhir di menu Latihan baru muncul setelah tiga syarat selesai: kuis mode Gabungan, semua set drag & drop dicek minimal sekali, dan ketiga simulasi ditamatkan. Sebelum itu bagiannya memang disembunyikan.",a:["Buka Latihan","#/latihan"]},
 {k:["kategori","kelulusan","lulus","predikat","siap kerja","batas lulus"],t:`Kategori nilai akhir: ${KAT}. Batas lulus kuis pilihan ganda adalah ${PASS}; kalau belum lulus, kategori paling tinggi adalah Cukup Siap.`,a:["Buka Latihan","#/latihan"]},
 {k:["cetak","print","kartu hasil","rapor","pdf"],t:"Setelah nilai akhir terbuka, isi namamu di kartu Nilai akhir lalu tekan “Cetak kartu hasil” untuk mencetak atau menyimpannya sebagai PDF.",a:["Buka Latihan","#/latihan"]},
 {k:["sertifikat"],t:`Ada sertifikat penyelesaian berbentuk gambar PNG yang memuat profil kesiapan kerjamu. Sertifikat terbuka setelah semua ${NL} pelajaran selesai; unduh lewat panel Perjalanan Karier (klik level/XP di navbar). Sertifikat ini umpan balik belajar mandiri, bukan sertifikat resmi.`},
 {k:["xp","poin","experience","dapat xp"],t:G?`XP didapat dari penguasaan materi: pelajaran selesai +${G.xp.lesson.xp}, kuis per bab sampai +${G.xp.quiz.bab} dan Gabungan sampai +${G.xp.quiz.all} (bonus +${G.xp.quiz.perfect} kalau skor 100), drag & drop sampai +${G.xp.dnd.base} (+${G.xp.dnd.perfect} kalau semua benar), simulasi sampai +${G.xp.sim.base} (+${G.xp.sim.bonus} kalau skor ≥ ${G.xp.sim.bonusAt}). Mengulang latihan hanya menambah XP kalau skornya naik. Badge dan quest juga memberi XP.`:"XP didapat dari menyelesaikan pelajaran dan latihan."},
 {k:["level","naik level","tingkat"],t:G?`Level naik seiring XP (Level 2 di 55 XP, Level 3 di 156, Level 5 di 440, Level 7 di 808). Sebutan levelnya bertema karier: ${LVL}. Lihat posisimu di panel Perjalanan Karier dengan mengklik level/XP di navbar.`:`Sebutan level: ${LVL}.`},
 {k:["badge","lencana","medali","koleksi"],t:G?`Ada ${G.badges.length} badge: ${G.badges.map(b=>`${b.name} (${b.req.charAt(0).toLowerCase()+b.req.slice(1)})`).join("; ")}. Lihat koleksinya di panel Perjalanan Karier.`:"Badge didapat dari menuntaskan bab dan latihan."},
 {k:["streak","beruntun","hari libur","target mingguan","freeze"],t:G?`Streak dihitung per minggu (Senin–Minggu): targetnya belajar di ${G.streak.target} hari berbeda dalam seminggu. Setiap ${G.streak.earnEvery} minggu target tercapai kamu dapat 1 hari libur (maks ${G.streak.maxFreeze}); minggu yang terlewat otomatis memakai hari libur supaya streak tidak putus.`:"Streak dihitung per minggu."},
 {k:["quest","misi","tantangan mingguan"],t:G?`Setiap Senin ada ${G.quest.pick} quest mingguan baru, misalnya ${G.quest.goals.map(g=>g.t.toLowerCase()).join(", ")}. Selesaikan semuanya untuk +${G.quest.xp} XP. Tidak ada hukuman kalau tidak selesai.`:"Ada quest mingguan."},
 {k:["gamifikasi","perjalanan karier","panel progres","progres kamu","mematikan gamifikasi","matikan gamifikasi"],t:"Gamifikasi selalu aktif: XP, level karier, 12 badge, streak mingguan, quest mingguan, profil kesiapan kerja (radar 3 soft skill), dan sertifikat. Tidak ada leaderboard, jadi yang dibandingkan hanya progresmu sendiri. Buka panelnya dengan mengklik level/XP atau “Progres kamu” di navbar."},
 {k:["profil kesiapan","radar","skill map","kesiapan kerja"],t:"Profil kesiapan kerja menampilkan skor 0–100 untuk Self-Management, Emotional Intelligence, dan Thinking Skill. Skornya gabungan pelajaran bab yang selesai (20%), skor kuis bab terbaik (40%), dan skor simulasi terbaik (40%). Lihat di panel Perjalanan Karier."},
 {k:["progres","tersimpan","simpan","hilang","ganti perangkat","ganti hp","ganti laptop","localstorage"],t:"Progres pelajaran, latihan, dan XP tersimpan otomatis di browser yang kamu pakai. Datanya hilang kalau data browser dihapus atau kamu ganti perangkat. Supaya aman, unduh cadangan progres (file JSON) dari panel Perjalanan Karier, lalu pulihkan di perangkat baru."},
 {k:["cadangan","backup","pulihkan","restore","impor","ekspor"],t:"Di panel Perjalanan Karier ada bagian Cadangan progres: unduh semua progres, nilai, dan XP sebagai file JSON, lalu pulihkan dari file itu di browser atau perangkat lain."},
 {k:["reset","hapus skor","hapus nilai","mulai ulang","ulang dari awal"],t:"Hasil latihan bisa dihapus lewat tombol di kartu Nilai akhir (menu Latihan). Untuk mengulang semuanya dari nol, hapus data situs GrowthLab di pengaturan browser. Unduh cadangan dulu kalau masih ingin menyimpannya."},
 {k:["log","data penelitian","csv","json","catatan aktivitas"],t:"Catatan aktivitas belajar (pelajaran, kuis, drag & drop, simulasi) tersimpan hanya di browser dan bisa diunduh sebagai JSON atau CSV dari panel Perjalanan Karier untuk keperluan penelitian. Tidak ada data yang dikirim ke pihak lain."},
 {k:["offline","tanpa internet","unduh","download","zip"],t:"GrowthLab bisa dipakai tanpa internet: unduh GrowthLab_offline.zip dari halaman GitHub/README (akirasakamiyo.github.io/GrowthLab), ekstrak, lalu buka index.html di browser."},
 {k:["scorm","lms","moodle","google classroom"],t:"Untuk LMS seperti Moodle tersedia paket GrowthLab_SCORM12.zip (SCORM 1.2) di akirasakamiyo.github.io/GrowthLab. Unggah sebagai paket SCORM; nilai akhir otomatis dilaporkan ke LMS."},
 {k:["video","promo","suara video","bunyi"],t:"Di beranda ada video promo 30 detik yang berputar otomatis tanpa suara. Tekan tombol “Nyalakan suara” di pojok video untuk mendengar suaranya."},
 {k:["musik","suara","sound","audio","bisu","mute"],t:"Kuis dan simulasi punya tombol musik dan efek suara di pojok atas layar; tekan untuk menyalakan atau mematikannya."},
 {k:["peta konsep","peta","mind map","konsep map"],t:"Peta konsep menampilkan seluruh isi materi: 3 bab dan 15 pelajaran. Arahkan kursor ke simpul untuk melihat pratinjau, klik untuk membukanya. Simpul bercentang sudah selesai, simpul bergembok belum terbuka.",a:["Buka peta konsep","#/peta"]},
 {k:["referensi","sumber materi","pustaka","daftar pustaka","rujukan","sumbernya dari mana"],t:`Semua rujukan ada di halaman Referensi: ${GLD.REF.length} artikel seri soft skill MySkill di Medium (satu per pelajaran), sumber kasus simulasi, dan dokumen rancangan tim (GBIM dan Jabaran Materi).`,a:["Buka referensi","#/referensi"]},
 {k:["glosarium","istilah","kamus"],t:"Glosarium berisi arti istilah asing di materi, misalnya burnout, growth mindset, atau STAR, lengkap dengan tautan ke pelajarannya. Kamu juga bisa langsung tanya aku, misalnya “apa itu burnout?”.",a:["Buka glosarium","#/glosarium"]},
 {k:["tujuan","kompetensi","indikator","gbim","capaian"],t:"Tujuan belajar per bab diturunkan dari GBIM. Lihat daftarnya di halaman Tujuan Belajar.",a:["Tujuan belajar","#/tujuan"]},
 {k:["petunjuk","panduan","cara pakai","cara memakai","cara menggunakan","bagaimana memakai","bagaimana menggunakan","navigasi","menu"],t:"Navbar berisi Materi, Latihan, dan Panduan (tujuan belajar, petunjuk, alur, peta konsep, glosarium, FAQ). Pilih bab di Materi, baca pelajaran berurutan, tekan Tandai selesai, lalu kerjakan Latihan. Di HP, tombol Menu membuka navigasi. Tombol bulat di kiri bawah untuk menggulir, dan tombol Bingung? Tanya untuk bertanya padaku.",a:["Petunjuk penggunaan","#/petunjuk"]},
 {k:["hp","handphone","ponsel","tablet","mobile","layar kecil"],t:"GrowthLab menyesuaikan HP, tablet, dan laptop. Drag & drop bisa dimainkan dengan sentuhan, dan navigasi ada di tombol Menu."},
 {k:["harga","biaya","bayar","berbayar","gratis","pembayaran"],t:"GrowthLab gratis untuk pembelajaran dan tidak memerlukan akun."},
 {k:["akun","login","masuk","daftar","register","sign in"],t:"Tidak perlu akun. GrowthLab berjalan langsung di browser dan semua progres tersimpan di perangkatmu."},
 {k:["tanya ai","asisten","chatbot","kamu siapa","kamu ai","labi","maskot"],t:"Aku Labi, maskot sekaligus asisten offline GrowthLab. Badanku labu Erlenmeyer dengan tunas di kepala, sama seperti logo GrowthLab. Jawabanku diambil dari materi, glosarium, dan panduan situs ini, jadi aku tidak memakai layanan AI di internet."},
 {k:["pembuat","kelompok","siapa yang membuat","dibuat oleh","yang bikin","siapa yang buat","dibuat siapa","dibikin siapa","nim","tim"],t:"GrowthLab dibuat oleh Rifa Haqi Putra Wibowo (NIM 1101624089) dan Thumpal Alvin (NIM 1101624069), Kelompok 8, Prodi Teknologi Pendidikan FIP UNJ, sebagai tugas mata kuliah Pengembangan Multimedia Pendidikan. Materinya merujuk pada artikel MySkill.",a:["Tentang GrowthLab","#/tentang"]},
 {k:["kontak","hubungi","admin","email","saran","kritik untuk"],t:"Kamu bisa menulis pesan lewat halaman Kontak (prototipe: pesan belum dikirim ke mana pun).",a:["Buka Kontak","#/kontak"]},
 {k:["komunitas","belajar bareng","teman belajar","kelompok belajar"],t:"Halaman Komunitas berisi ide kegiatan belajar bersama teman, misalnya lingkaran umpan balik, peta kekuatan kelompok, dan jurnal syukur mingguan.",a:["Buka Komunitas","#/komunitas"]},
 {k:["faq","pertanyaan umum","bantuan","help"],t:"Pertanyaan yang sering muncul ada di halaman FAQ.",a:["Buka FAQ","#/faq"]}]};
const norm=s=>" "+s.toLowerCase().replace(/[^a-z0-9à-ÿ&\s-]/g," ").replace(/\s+/g," ")+" ";
/* glosarium: "apa itu burnout?" → definisi + tautan ke pelajarannya */
const glosKB=q=>{if(!HASD||!GLD.GLOS)return null;let best=null;
 for(const {t:term,a:def,b,l} of GLD.GLOS){const t=term.toLowerCase();if(q.includes(t)&&(!best||t.length>best[0].length))best=[t,term,def,b,l]}
 if(!best)return null;const [,term,def,b,l]=best,les=C.chapters[b]&&C.chapters[b].l[l];
 return{t:`${term}: ${def}${les?` Dibahas di Bab ${b+1}, pelajaran “${les.t}”.`:""}`,a:les?["Buka pelajaran",`#/lesson/${b}-${l}`]:["Buka glosarium","#/glosarium"],w:best[0].length+(/apa itu|arti|maksud|definisi|pengertian/.test(q)?20:4)}};
/* per pelajaran: dicocokkan dengan judul dan kata kunci di data materi */
const lesKB=q=>{let best=null;C.chapters.forEach((c,i)=>c.l.forEach((l,j)=>{const keys=[l.t.toLowerCase(),...(l.kw||[])];
 const w=keys.filter(k=>k&&q.includes(k)).reduce((a,k)=>a+k.length,0);
 if(w&&(!best||w>best.w)){const lock=window.GLK&&GLK.locked(i,j);
  best={t:`Itu dibahas di Bab ${i+1} (${c.t}), pelajaran “${l.t}”. Intinya: ${l.poin}${lock?" Pelajaran ini masih terkunci; selesaikan dulu pelajaran sebelumnya.":""}`,a:["Buka pelajaran","#/lesson/"+i+"-"+j],w:w+6}}}));return best};
const local=raw=>{const q=norm(raw);let best=null;KB=KB||mkKB();
 for(const e of KB){const w=e.k.filter(k=>q.includes(k)).reduce((a,k)=>a+k.length,0);if(w&&(!best||w>best.w))best={t:e.t,a:e.a,w}}
 /* pertanyaan materi yang spesifik (pelajaran/istilah) mengalahkan jawaban umum */
 for(const x of [lesKB(q),glosKB(q)])if(x&&(!best||x.w>best.w))best=x;
 return best||{t:"Maaf, aku belum punya jawaban untuk itu. Coba tanyakan soal materi atau istilah tertentu, latihan, nilai akhir, XP dan badge, sertifikat, atau cara memakai GrowthLab.",a:["Buka FAQ","#/faq"]}};
function add(role,o){const d=document.createElement("div");d.className="cb "+role;const t=document.createElement("span");t.textContent=o.t;d.append(t);
 if(o.a){const a=document.createElement("a");a.className="btn";a.href=o.a[1];a.textContent=o.a[0];a.onclick=()=>{if(innerWidth<=520)setOpen(false)};d.append(document.createElement("br"),a)}
 cm.append(d);cm.scrollTop=cm.scrollHeight;return d}
function typing(){const d=document.createElement("div");d.className="cb bot typing";d.setAttribute("aria-label","Sedang mengetik");d.innerHTML="<i></i><i></i><i></i>";cm.append(d);cm.scrollTop=cm.scrollHeight;return d}
async function ask(text){
 if(busy||!text.trim())return;busy=true;add("me",{t:text});hist.push({role:"user",content:text});inp.value="";cq.hidden=true;
 const ty=typing();let out;
 try{
  await new Promise(r=>setTimeout(r,550+Math.random()*400));out=local(text)
 }catch(e){out={t:"Maaf, ada kendala saat mencari jawaban. Coba tanyakan dengan kata lain."}}
 ty.remove();add("bot",out);hist.push({role:"assistant",content:out.t});busy=false;
 try{sessionStorage.setItem("gl-chat",JSON.stringify(hist.slice(-20)))}catch(e){}}
function setOpen(o){box.classList.toggle("open",o);box.setAttribute("aria-hidden",!o);fab.setAttribute("aria-expanded",o);
 if(o){if(!started){started=true;add("bot",{t:"Halo! Aku Labi, asisten GrowthLab. Tanyakan apa saja soal materi dan istilahnya, latihan, nilai akhir, XP dan badge, sertifikat, atau cara memakai situs ini."});
  ["Ada bab apa saja?","Kenapa pelajaran terkunci?","Cara menghitung nilai","Cara dapat XP","Apa itu burnout?","Kapan nilai akhir muncul?"].forEach(q=>{const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=q;b.onclick=()=>ask(q);cq.append(b)})}
  setTimeout(()=>inp.focus(),200)}else fab.focus()}
fab.onclick=()=>setOpen(!box.classList.contains("open"));$("#chx").onclick=()=>setOpen(false);
$("#cform").onsubmit=e=>{e.preventDefault();ask(inp.value)};
addEventListener("keydown",e=>{if(e.key==="Escape"&&box.classList.contains("open")&&$("#auth").hidden)setOpen(false)});
})();
