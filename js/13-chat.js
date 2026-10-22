(()=>{
const $=s=>document.querySelector(s),box=$("#chat"),fab=$("#chatfab"),cm=$("#cm"),inp=$("#cin"),cq=$("#cq");
/* 2026-10-20: asisten berjalan offline (jawaban dari materi & FAQ), tanpa layanan AI eksternal */
let hist=[],started=false,busy=false;
$("#chmode").lastChild.textContent=" Offline · jawaban dari materi GrowthLab";
/* basis jawaban mode demo: diperbarui untuk GrowthLab v5 */
const HASD=typeof GLD!=="undefined",NQ=HASD?GLD.QUIZ.length:0,NS=HASD?GLD.SIM.length:0,ND=HASD?GLD.DND.length:0;
const KB=[
 [/halo|hai|hello|selamat (pagi|siang|sore|malam)|^hi\b/,{t:"Halo! Aku asisten GrowthLab. Tanyakan soal bab dan pelajaran, latihan, cara menghitung nilai, atau kategori kelulusan."}],
 [/nilai akhir|hitung|rumus|bobot|skor|persen/,{t:"Nilai Akhir = (Nilai Pilihan Ganda × 0,30) + (Nilai Simulasi × 0,70). Nilai pilihan ganda = benar ÷ jumlah soal × 100, diambil dari skor terbaik kuis Gabungan. Nilai simulasi = Aspek 1 × 0,35 + Aspek 2 × 0,35 + Aspek 3 × 0,30, dengan skor tiap aspek berupa rata-rata pilihan di jalur yang kamu ambil.",a:["Lihat alur & cara hitung","#/alur"]}],
 [/sertifikat|lulus|kelulusan|kategori|siap kerja|predikat|level/,{t:`Kategori nilai akhir: ${GLD.KATEGORI.slice(0,-1).map(([t],i)=>GLS.score.katLabel(i)+" "+t).join(", ")}, di bawah ${GLD.KATEGORI[GLD.KATEGORI.length-2][1]} ${GLD.KATEGORI[GLD.KATEGORI.length-1][0]}. Batas lulus kuis pilihan ganda adalah ${GLD.PASS_MCQ}; kalau belum lulus, kategori paling tinggi adalah Cukup Siap. Prototipe ini belum menerbitkan sertifikat; kategorimu tampil di kartu Nilai Akhir.`,a:["Buka kartu Nilai Akhir","#/latihan"]}],
 [/simulasi|skenario|branching/,{t:`Ada ${NS} skenario simulasi: ditolak setelah wawancara (Self-Management & Resiliensi, 35%), kritik keras dari atasan saat magang (Kecerdasan Emosional & Komunikasi, 35%), dan tenggat proyek tim (Thinking Skill & Pemecahan Masalah, 30%). Setiap skenario punya ${GLS.SITU} situasi bercabang dengan beberapa kemungkinan ending; pilihan terkunci setelah dipilih.`,a:["Mulai simulasi","#/latihan"]}],
 [/drag|seret|cocokkan|pasangkan/,{t:`Ada ${ND} set drag & drop, misalnya memasangkan jebakan pikiran, memilah stres dan burnout, serta fakta, opini, dan asumsi. Bisa dengan mouse, sentuhan, atau keyboard. Latihan ini tidak masuk nilai akhir.`,a:["Coba drag & drop","#/latihan"]}],
 [/kuis|quiz|soal|pilihan ganda|latihan|tes/,{t:`Menu Latihan berisi kuis pilihan ganda (${NQ} soal, bobot 30%), drag & drop (${ND} set, latihan pemahaman), dan simulasi (${NS} skenario, bobot 70%). Kuis bisa dikerjakan per bab atau Gabungan; urutan soal dan pilihan diacak setiap percobaan.`,a:["Buka Latihan","#/latihan"]}],
 [/bab|materi|pelajaran|topik|isi|kurikulum|silabus/,{t:"Ada 3 bab dan 15 pelajaran. Self-Management: Recognise Your Strengths, Thoughts Feelings & What You Do, Change Your Thinking, Problem Solving, Keeping Well. Emotional Intelligence: Emotional and Social Awareness, Facing Stress and Burnout, Criticism Weakness and Failure, Happiness in Life, Communicate with Empathy. Thinking Skill: System, Critical, Strategic, Reflective, dan Creative Thinking.",a:["Buka materi","#/course"]}],
 [/peta|konsep map|mind ?map situs/,{t:"Peta konsep menampilkan seluruh isi GrowthLab: Beranda, Materi (3 bab, 15 pelajaran), dan Latihan. Klik simpulnya untuk membuka halaman terkait; simpul bercentang sudah selesai.",a:["Buka peta konsep","#/peta"]}],
 [/glosarium|istilah|arti kata|artinya/,{t:"Glosarium berisi arti istilah asing di materi, misalnya burnout, growth mindset, atau STAR, lengkap dengan tautan ke pelajarannya.",a:["Buka glosarium","#/glosarium"]}],
 [/coba sendiri|aktivitas|interaktif|simulator|jurnal|catatan/,{t:"Setiap pelajaran punya aktivitas “Coba sendiri” (misalnya simulator segitiga kognitif, tangga 5 Whys, latihan napas, penyusun jawaban STAR), soal cek cepat, dan kolom catatan pribadi yang tersimpan otomatis.",a:["Coba di pelajaran pertama","#/lesson/0-0"]}],
 [/rekomendasi|mulai dari mana|bab mana|kenali kebutuhan/,{t:"Mulailah dari Bab 1 Self-Management, lalu lanjutkan ke Bab 2 dan Bab 3. Lihat juga peta konsep untuk gambaran seluruh isi GrowthLab.",a:["Buka peta konsep","#/peta"]}],
 [/cetak|print|kartu hasil|rapor/,{t:"Di kartu Nilai Akhir (menu Latihan), isi namamu lalu tekan “Cetak kartu hasil” untuk mencetak atau menyimpan ringkasan nilaimu sebagai PDF.",a:["Buka Latihan","#/latihan"]}],
 [/tujuan|kompetensi|indikator/,{t:"Tujuan belajar per bab diturunkan dari GBIM. Lihat daftarnya di halaman Tujuan Belajar.",a:["Tujuan belajar","#/tujuan"]}],
 [/petunjuk|panduan|cara (pakai|guna)|bagaimana (memakai|menggunakan)/,{t:"Pilih bab di menu Materi, baca pelajarannya, tekan Tandai selesai, lalu kerjakan Latihan. Progres tersimpan otomatis di browser.",a:["Petunjuk penggunaan","#/petunjuk"]}],
 [/alur|urutan|tahap/,{t:"Alur belajar: Materi (3 bab) → Latihan soal (kuis + drag & drop) → Simulasi → Nilai akhir.",a:["Alur belajar","#/alur"]}],
 [/harga|biaya|bayar|berbayar|gratis|pembayaran/,{t:"GrowthLab gratis untuk pembelajaran dan tidak memerlukan akun."}],
 [/progres|simpan|hilang|reset|hapus/,{t:"Progres pelajaran dan hasil latihan tersimpan otomatis di browser ini (localStorage). Datanya hilang jika kamu menghapus data situs atau berganti perangkat. Hasil latihan bisa dihapus lewat tombol di kartu Nilai Akhir."}],
 [/akun|masuk|login|daftar/,{t:"Saat dibuka tanpa server, GrowthLab berjalan dalam mode lokal: tidak perlu akun dan semua tersimpan di browser."}],
 [/mulai|cara belajar|belajar dari mana/,{t:"Mulai dari Bab 1 Self-Management, pelajaran Recognise Your Strengths. Setelah ketiga bab selesai, lanjutkan ke Latihan.",a:["Mulai Bab 1","#/lesson/0-0"]}],
 [/tentang|pembuat|kelompok|siapa/,{t:"GrowthLab dibuat oleh Kelompok 8 (Adam Faruq, Muhammad Azriel, Rifa Haqi Putra Wibowo, Thumpal Alvin), Prodi Teknologi Pendidikan FIP UNJ, 2024.",a:["Tentang GrowthLab","#/tentang"]}],
 [/kontak|hubungi|admin|email|cs/,{t:"Kamu bisa menulis pesan lewat halaman Kontak (prototipe: pesan belum dikirim ke mana pun).",a:["Buka Kontak","#/kontak"]}],
 [/faq|tanya|bantuan/,{t:"Pertanyaan yang sering muncul ada di halaman FAQ.",a:["Buka FAQ","#/faq"]}]];
/* jawaban per pelajaran: dicocokkan dengan judul dan kata kunci di data materi */
const lesKB=q=>{if(!HASD)return null;const C=GLD.COURSE;for(let i=0;i<C.chapters.length;i++)for(let j=0;j<C.chapters[i].l.length;j++){const l=C.chapters[i].l[j];
 if(q.includes(l.t.toLowerCase())||(l.kw||[]).some(k=>q.includes(k)))return{t:`Itu dibahas di Bab ${i+1} (${C.chapters[i].t}), pelajaran “${l.t}”. Intinya: ${l.poin}`,a:["Buka pelajaran","#/lesson/"+i+"-"+j]}}return null};
const local=q=>{q=q.toLowerCase();const l=lesKB(q);for(const [re,a] of KB)if(re.test(q)&&!(l&&/bab|materi|pelajaran|topik|isi/.test(re.source)))return a;if(l)return l;return{t:"Maaf, aku belum punya jawaban untuk itu. Coba tanyakan soal bab, pelajaran, latihan, cara menghitung nilai, atau kategori kelulusan.",a:["Buka FAQ","#/faq"]}};
function add(role,o){const d=document.createElement("div");d.className="cb "+role;const t=document.createElement("span");t.textContent=o.t;d.append(t);
 if(o.a){const a=document.createElement("a");a.className="btn";a.href=o.a[1];a.textContent=o.a[0];a.onclick=()=>{if(innerWidth<=520)setOpen(false)};d.append(document.createElement("br"),a)}
 cm.append(d);cm.scrollTop=cm.scrollHeight;return d}
function typing(){const d=document.createElement("div");d.className="cb bot typing";d.setAttribute("aria-label","Sedang mengetik");d.innerHTML="<i></i><i></i><i></i>";cm.append(d);cm.scrollTop=cm.scrollHeight;return d}
async function ask(text){
 if(busy||!text.trim())return;busy=true;add("me",{t:text});hist.push({role:"user",content:text});inp.value="";cq.hidden=true;
 const ty=typing();let out;
 try{
  await new Promise(r=>setTimeout(r,550+Math.random()*400));out=local(text)
 }catch(e){out=local(text)}
 ty.remove();add("bot",out);hist.push({role:"assistant",content:out.t});busy=false;
 try{sessionStorage.setItem("gl-chat",JSON.stringify(hist.slice(-20)))}catch(e){}}
function setOpen(o){box.classList.toggle("open",o);box.setAttribute("aria-hidden",!o);fab.setAttribute("aria-expanded",o);
 if(o){if(!started){started=true;add("bot",{t:"Halo! Aku asisten GrowthLab. Tanyakan soal bab, pelajaran, latihan, cara menghitung nilai, atau kategori kelulusan."});
  ["Ada bab apa saja?","Latihan apa saja?","Cara menghitung nilai","Kategori kelulusan"].forEach(q=>{const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=q;b.onclick=()=>ask(q);cq.append(b)})}
  setTimeout(()=>inp.focus(),200)}else fab.focus()}
fab.onclick=()=>setOpen(!box.classList.contains("open"));$("#chx").onclick=()=>setOpen(false);
$("#cform").onsubmit=e=>{e.preventDefault();ask(inp.value)};
addEventListener("keydown",e=>{if(e.key==="Escape"&&box.classList.contains("open")&&$("#auth").hidden)setOpen(false)});
})();
