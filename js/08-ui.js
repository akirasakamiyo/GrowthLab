/* ==========================================================================
   GL v6 · UI INTERAKTIF
   - Aktivitas "Coba sendiri" di setiap pelajaran (LABS -> widget W.*)
   - Cek cepat (benar/salah), catatan pribadi, daftar isi, info waktu baca
   - Beranda: kartu panduan, lanjutkan belajar, latihan, soal kilat
   - Halaman peta konsep (#/peta) dan glosarium (#/glosarium)
   Masukan pengguna hanya ditulis lewat textContent/value. Data tersimpan di localStorage "gl-ui".
   ========================================================================== */
const GLU=(()=>{
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=GLX.esc,pad=n=>String(n).padStart(2,"0");
const mix=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const reduce=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
const KEY="gl-ui";
const load=()=>{try{const d=JSON.parse(localStorage.getItem(KEY)||"{}");return d&&typeof d==="object"?d:{}}catch(e){return{}}};
const save=d=>{try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}};
const upd=f=>{const d=load();f(d);save(d);return d};
const say=m=>{try{toast(m)}catch(e){}};
const pop=(el,n=24)=>{try{const r=el.getBoundingClientRect();boom(r.left+r.width/2,r.top+12,n)}catch(e){}};
function h(tag,a,...kids){const e=document.createElement(tag);
 if(a)for(const k in a){const v=a[k];if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k==="html")e.innerHTML=v;else if(k==="text")e.textContent=v;else if(k.slice(0,2)==="on")e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?"":v)}
 for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(String(c)))}return e}
const CH=()=>GLD.COURSE.chapters,lesT=(b,l)=>CH()[b].l[l].t;
const isDone=k=>{try{return done.has(k)}catch(e){return false}};
const tg=(label,on,cls="chip")=>h("button",{type:"button",class:cls,"aria-pressed":String(!!on)},label);
const setP=(b,on)=>b.setAttribute("aria-pressed",String(!!on));
const step=(n,t)=>h("p",{class:"lab-s"},h("b",{},n),t);
function frame(box,title,desc,tag="Coba sendiri"){box.textContent="";box.classList.add("lab");const bd=h("div",{class:"lab-b"});
 box.append(h("div",{class:"lab-h"},h("span",{class:"lab-tag"},h("i",{"aria-hidden":"true"}),tag),h("h3",{},title),desc?h("p",{class:"lab-d",html:desc}):null),bd);box.dataset.title=title;return bd}
function choices(list,ok,onOk,hint,okText="Tepat!"){const fb=h("p",{class:"lab-fb","aria-live":"polite"});
 const g=h("div",{class:"lab-opts"},list.map((t,k)=>{const b=h("button",{type:"button",class:"lab-opt"},t);b.onclick=()=>{
  if(k===ok){b.classList.add("ok");qa("button",g).forEach(x=>x.disabled=true);fb.className="lab-fb good";fb.textContent=okText;onOk&&setTimeout(onOk,650)}
  else{b.classList.add("no");b.disabled=true;fb.className="lab-fb bad";fb.textContent=hint}};return b}));return[g,fb]}
const copy=(t,btn)=>{const done_=()=>{const o=btn.textContent;btn.textContent="Tersalin ✓";setTimeout(()=>btn.textContent=o,1500)};
 try{navigator.clipboard.writeText(t).then(done_,()=>{fallback()})}catch(e){fallback()}
 function fallback(){const ta=h("textarea",{style:"position:fixed;opacity:0"});ta.value=t;document.body.append(ta);ta.select();try{document.execCommand("copy");done_()}catch(e){say("Salin manual teks di atas.")}ta.remove()}};
const ICO={
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
 guide:'<path d="M4 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-6a3 3 0 0 0-3 3"/><path d="M20 5v13h-7"/>',
 route:'<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7"/>',
 map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
 quiz:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 drag:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/><path d="M11 7h4a2 2 0 0 1 2 2v3"/><path d="m15 10 2 2 2-2"/>',
 sim:'<circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12c5 0 5-7 10-7M7 12c5 0 5 7 10 7"/>',
 book:'<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
 abc:'<path d="M3 18 7 6l4 12M4.5 14h5"/><path d="M14 6h3.5a2.5 2.5 0 0 1 0 5H14zm0 5h4a2.5 2.5 0 0 1 0 5h-4z"/>',
 play:'<path d="M7 4v16l13-8z"/>',spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
 up:'<path d="M7 17 17 7M9 7h8v8"/>',chat:'<path d="M7 4h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6l-4 3.5V16H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"/>',
 check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',chev:'<circle cx="12" cy="12" r="9"/><path d="m8 10 4 4 4-4"/>',bar:'<path d="M4 12h16"/><path d="M4 12h9" stroke-width="4"/>',
 note:'<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8 12h8M8 16h5"/>',print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'};
const ico=(k,cls="ico")=>`<span class="${cls}" aria-hidden="true"><svg viewBox="0 0 24 24">${ICO[k]}</svg></span>`;

/* ==================================================================
   WIDGET "COBA SENDIRI" PER PELAJARAN
   ================================================================== */
const W={
/* 0-0 Recognise Your Strengths */
sign(box){const bd=frame(box,"Uji kekuatanmu dengan S.I.G.N","Pilih satu aktivitas, lalu ketuk tanda yang benar-benar kamu rasakan saat melakukannya.");
 const S=[["S","Success","Hasilku efektif dan di atas rata-rata"],["I","Instinct","Aku sudah antusias bahkan sebelum memulai"],["G","Growth","Aku cepat paham dan terus berkembang"],["N","Needs","Aku merasa puas dan berenergi setelahnya"]];
 const PRE=["Mendesain poster","Menjelaskan materi ke teman","Memperbaiki perangkat","Mengatur acara kelas","Menulis laporan","Melayani pelanggan"];let act=PRE[0],on=[0,0,0,0];
 const inp=h("input",{type:"text",class:"lab-in",maxlength:"60",placeholder:"Atau tulis aktivitasmu sendiri…","aria-label":"Aktivitas lain"});
 const chips=h("div",{class:"chips lab-chips",role:"group","aria-label":"Pilih aktivitas"},PRE.map(p=>{const b=tg(p,p===act);b.onclick=()=>{act=p;inp.value="";qa("button",chips).forEach(x=>setP(x,x===b));draw()};return b}));
 inp.oninput=()=>{const v=inp.value.trim();if(v){act=v;qa("button",chips).forEach(x=>setP(x,false))}draw()};
 const grid=h("div",{class:"sg-grid"},S.map(([L,w,d],k)=>{const b=h("button",{type:"button",class:"sg","aria-pressed":"false"},h("b",{},L),h("span",{},w),h("small",{},d));b.onclick=()=>{on[k]=on[k]?0:1;setP(b,on[k]);draw()};return b}));
 const meter=h("div",{class:"lab-meter","aria-hidden":"true"},[0,1,2,3].map(()=>h("i")));const res=h("p",{class:"lab-res","aria-live":"polite"});const list=h("ul",{class:"lab-list"});
 const n=()=>on.reduce((a,b)=>a+b,0);
 const sv=h("button",{type:"button",class:"btn p"},"Simpan ke daftar kekuatanku");
 sv.onclick=()=>{const k=n();upd(d=>{d.kuat=(d.kuat||[]).filter(x=>x.a!==act);d.kuat.unshift({a:act,n:k});d.kuat=d.kuat.slice(0,8)});drawList();say("Tersimpan di daftar kekuatanmu.");if(k===4)pop(sv)};
 function draw(){const k=n();qa("i",meter).forEach((x,i)=>x.classList.toggle("on",i<k));
  res.textContent=`“${act}”: ${k}/4 tanda. `+(k===4?"Kemungkinan besar ini kekuatanmu. Tonjolkan di CV dan saat wawancara!":k===3?"Potensi kuat. Tambah investasi waktu agar menjadi kekuatan.":k===2?"Masih berupa potensi. Lakukan lebih sering dan amati tanda lainnya.":"Mungkin bukan kekuatan utamamu. Kelola lewat kolaborasi dengan teman yang kuat di bidang ini.")}
 function drawList(){list.textContent="";const L=load().kuat||[];if(L.length)list.append(h("li",{class:"lab-lh"},"Daftar kekuatanku"));
  L.forEach(x=>{const del=h("button",{type:"button",class:"lab-x","aria-label":"Hapus "+x.a},"×");del.onclick=()=>{upd(d=>{d.kuat=(d.kuat||[]).filter(y=>y.a!==x.a)});drawList()};list.append(h("li",{},h("span",{},x.a),h("b",{},x.n+"/4"),del))});list.hidden=!L.length}
 bd.append(step("1","Pilih atau tulis satu aktivitas."),chips,inp,step("2","Ketuk tanda yang kamu rasakan."),grid,meter,res,h("div",{class:"lab-row"},sv),list);draw();drawList()},

/* 0-1 Thoughts, Feelings, & What You Do */
tri(box){const bd=frame(box,"Simulator segitiga kognitif","Peristiwanya sama, tetapi pikiran yang berbeda menghasilkan perasaan dan tindakan yang berbeda. Coba bandingkan.");
 const E=[{e:"Sudah dua minggu lamaran kerjamu belum dibalas.",n:["“Pasti aku ditolak. Aku memang tidak layak.”","Cemas, sedih, putus asa","Berhenti melamar dan menunda memperbaiki CV"],r:["“Proses rekrutmen memang bisa lama. Aku bisa menindaklanjuti dengan sopan.”","Tenang dan tetap berharap","Mengirim email tindak lanjut dan tetap melamar ke tempat lain"]},
  {e:"Saat wawancara, pewawancara mengernyitkan dahi ketika kamu menjawab.",n:["“Jawabanku pasti salah. Dia menganggapku bodoh.”","Panik dan malu","Bicara makin cepat dan kehilangan fokus"],r:["“Mungkin dia sedang berpikir. Aku bisa bertanya apakah jawabanku sudah jelas.”","Lebih tenang dan percaya diri","Menjawab runtut dan memberi contoh konkret"]},
  {e:"Supervisor magang memintamu merevisi laporan.",n:["“Aku memang tidak becus bekerja.”","Malu dan kesal","Merevisi asal-asalan sambil menggerutu"],r:["“Revisi berarti ada bagian yang bisa diperbaiki. Aku tanyakan bagian mana yang paling penting.”","Fokus dan termotivasi","Bertanya dengan jelas, lalu memperbaiki laporan dengan teliti"]}];
 let ei=0,m="n";
 const evs=h("div",{class:"chips lab-chips",role:"group","aria-label":"Pilih peristiwa"},E.map((x,k)=>{const b=tg("Peristiwa "+(k+1),!k);b.onclick=()=>{ei=k;qa("button",evs).forEach(y=>setP(y,y===b));draw()};return b}));
 const seg=h("div",{class:"lab-seg",role:"group","aria-label":"Pilih jenis pikiran"},[["n","Pikiran otomatis (negatif)"],["r","Pikiran rasional"]].map(([k,t])=>{const b=h("button",{type:"button","aria-pressed":String(k===m)},t);b.onclick=()=>{m=k;qa("button",seg).forEach(y=>setP(y,y===b));draw()};return b}));
 const card=t=>h("div",{class:"tri-c"},h("span",{class:"mono"},t),h("p"));const cE=card("Peristiwa (netral)"),cP=card("Pikiran"),cF=card("Perasaan"),cT=card("Tindakan");
 const ar=()=>h("span",{class:"tri-a","aria-hidden":"true"},"→");const flow=h("div",{class:"tri-flow","aria-live":"polite"},cE,ar(),cP,ar(),cF,ar(),cT);const cap=h("p",{class:"lab-res"});
 function draw(){const x=E[ei],v=x[m];flow.dataset.m=m;q("p",cE).textContent=x.e;q("p",cP).textContent=v[0];q("p",cF).textContent=v[1];q("p",cT).textContent=v[2];
  cap.textContent=m==="n"?"Pikiran otomatis yang negatif memicu emosi berat, lalu mendorong tindakan yang merugikan. Coba ganti ke pikiran rasional.":"Dengan pikiran yang rasional, perasaan lebih stabil dan tindakan lebih solutif. Inilah cara memutus siklus negatif.";
  flow.classList.remove("flip");void flow.offsetWidth;flow.classList.add("flip")}
 bd.append(step("1","Pilih peristiwa."),evs,step("2","Ganti cara berpikirnya, lalu lihat perubahannya."),seg,flow,cap);draw()},

/* 0-2 Change Your Thinking */
reframe(box){const bd=frame(box,"Latihan Catch–Check–Change","Pilih satu pikiran negatif, lalu ubah dalam tiga langkah.");
 const TR=["All-or-Nothing","Catastrophizing","Mind Reading","Personalization"];
 const T=[{t:"“Aku gagal di tes ini. Aku tidak akan pernah dapat kerja.”",trap:1,f:["Semua orang pasti menganggapku bodoh.","Ini baru satu tes dari banyak kesempatan.","Aku memang selalu gagal."],fi:1,r:["“Aku memang payah.”","“Semua baik-baik saja, tidak perlu dipikirkan.”","“Tes ini belum berhasil. Aku akan mencari bagian yang lemah dan berlatih untuk tes berikutnya.”"],ri:2},
  {t:"“HRD belum membalas karena pasti dia tidak suka padaku.”",trap:2,f:["HRD belum membalas emailku selama tiga hari kerja.","HRD membenciku.","Aku pasti kandidat terburuk."],fi:0,r:["“Tiga hari belum tentu berarti ditolak. Aku tunggu seminggu, lalu menindaklanjuti dengan sopan.”","“Aku tidak akan melamar ke sana lagi.”","“HRD-nya memang tidak profesional.”"],ri:0},
  {t:"“Kalau tidak diterima di perusahaan besar, karierku gagal total.”",trap:0,f:["Perusahaan kecil tidak ada gunanya.","Banyak karier dimulai dari perusahaan kecil atau menengah.","Hanya perusahaan besar yang menghargai lulusan SMK."],fi:1,r:["“Aku hanya mau perusahaan besar.”","“Perusahaan besar adalah salah satu pilihan. Pengalaman di perusahaan menengah juga bisa membangun karierku.”","“Lebih baik tidak bekerja dulu.”"],ri:1},
  {t:"“Timku kalah lomba karena aku salah bicara satu kali.”",trap:3,f:["Juri pasti hanya memperhatikan kesalahanku.","Semua kekalahan ini karena aku.","Penilaian lomba memakai banyak kriteria dan melibatkan seluruh anggota tim."],fi:2,r:["“Kesalahanku jadi pelajaran, tetapi hasil lomba dipengaruhi banyak faktor. Aku akan berlatih bicara lebih tenang.”","“Aku tidak akan ikut lomba lagi.”","“Teman-temanku yang salah.”"],ri:0}];
 let ti=0,st=0;
 const pick=h("div",{class:"chips lab-chips",role:"group","aria-label":"Pilih pikiran"},T.map((x,k)=>{const b=tg("Pikiran "+(k+1),!k);b.onclick=()=>{ti=k;st=0;qa("button",pick).forEach(y=>setP(y,y===b));draw()};return b}));
 const th=h("p",{class:"rf-t"}),steps=h("ol",{class:"rf-steps"},["Catch it","Check it","Change it"].map(t=>h("li",{},t))),area=h("div",{class:"rf-area"});
 function draw(){const x=T[ti];th.textContent=x.t;qa("li",steps).forEach((li,k)=>{li.classList.toggle("on",k===st);li.classList.toggle("done",k<st)});area.textContent="";
  if(st===0){const[g,fb]=choices(TR,x.trap,()=>{st=1;draw()},"Belum tepat. Ingat lagi ciri tiap jebakan pikiran.","Tepat! Kamu menangkap jebakan pikirannya.");area.append(step("1","Catch it: jebakan pikiran apa ini?"),g,fb)}
  else if(st===1){const[g,fb]=choices(x.f,x.fi,()=>{st=2;draw()},"Itu masih asumsi atau perasaan, bukan fakta yang bisa dibuktikan.","Tepat! Itu fakta yang bisa dibuktikan.");area.append(step("2","Check it: mana yang merupakan fakta?"),g,fb)}
  else if(st===2){const[g,fb]=choices(x.r,x.ri,()=>{st=3;draw()},"Kalimat ini belum rasional atau belum berorientasi solusi.","Tepat! Kalimat ini rasional, berimbang, dan berorientasi solusi.");area.append(step("3","Change it: pilih kalimat pengganti terbaik."),g,fb)}
  else{const nx=h("button",{type:"button",class:"btn"},"Coba pikiran berikutnya");nx.onclick=()=>{ti=(ti+1)%T.length;st=0;qa("button",pick).forEach((y,k)=>setP(y,k===ti));draw()};
   area.append(h("div",{class:"rf-sum"},h("div",{},h("span",{class:"mono"},"Pikiran lama"),h("p",{},x.t)),h("div",{},h("span",{class:"mono"},"Pikiran baru"),h("p",{},x.r[x.ri]))),h("div",{class:"lab-row"},nx));pop(area,22)}}
 bd.append(pick,th,steps,area);draw()},

/* 0-3 Problem Solving */
whys(box){const bd=frame(box,"Tangga 5 Whys","Tekan tombol “Mengapa?” untuk menggali dari gejala sampai akar masalah.");
 const Wy=[["Mengapa laporannya terlambat?","Data penjualan baru lengkap pada Jumat sore."],["Mengapa datanya baru lengkap Jumat sore?","Setiap cabang mengirim data dengan format berbeda, jadi harus dirapikan manual."],["Mengapa formatnya berbeda-beda?","Belum ada template bersama untuk semua cabang."],["Mengapa belum ada template?","Tidak ada yang ditugasi membuat dan membagikannya."],["Mengapa tidak ada yang ditugasi?","Pembagian tanggung jawab soal format data belum pernah dibahas di tim."]];
 let n=0;const lad=h("ol",{class:"why-l"}),out=h("div",{class:"why-root","aria-live":"polite"}),dots=h("div",{class:"why-dots","aria-hidden":"true"},Wy.map(()=>h("i")));
 const btn=h("button",{type:"button",class:"btn p"},"Tanya: Mengapa?"),rs=h("button",{type:"button",class:"btn"},"Ulangi");
 function draw(){lad.textContent="";Wy.slice(0,n).forEach(([a,b],k)=>lad.append(h("li",{},h("b",{},a),h("span",{},b))));qa("i",dots).forEach((x,k)=>x.classList.toggle("on",k<n));
  btn.hidden=n>=Wy.length;out.hidden=n<Wy.length;out.textContent="";
  if(n>=Wy.length)out.append(h("span",{class:"mono"},"Akar masalah ditemukan"),h("p",{},"Belum ada pembagian tanggung jawab dan template data bersama untuk semua cabang."),h("p",{class:"lab-d"},"Solusi yang menyentuh akar: tunjuk penanggung jawab, buat satu template, dan sepakati tenggat pengiriman data. Lembur setiap Jumat hanyalah solusi plester."))}
 btn.onclick=()=>{n++;draw();if(n===Wy.length)pop(out)};rs.onclick=()=>{n=0;draw()};
 bd.append(h("div",{class:"why-case"},h("span",{class:"mono"},"Gejala (symptom)"),h("p",{},"Laporan mingguan tim magangmu selalu terlambat.")),dots,lad,out,h("div",{class:"lab-row"},btn,rs));draw()},
matrix(box){const bd=frame(box,"Matriks pemilihan solusi","Geser nilai 1–5 untuk setiap kriteria. Total tertinggi menjadi kandidat solusi terbaik. Coba ubah sesuai pendapatmu.");
 const A=["Membuat template data bersama","Lembur setiap Jumat malam","Meminta tenggat laporan dimundurkan"],K=["Kelayakan","Dampak","Waktu","Sumber daya"],V=[[5,5,3,4],[4,2,4,2],[3,2,5,5]];
 const cards=A.map((t,i)=>{const tot=h("b",{class:"mx-t"});const rows=K.map((k,j)=>{const r=h("input",{type:"range",min:"1",max:"5",step:"1",value:String(V[i][j]),"aria-label":`${k} untuk ${t}`});const o=h("output",{},String(V[i][j]));r.oninput=()=>{V[i][j]=+r.value;o.textContent=r.value;draw()};return h("label",{class:"mx-r"},h("span",{},k),r,o)});
  const c=h("div",{class:"mx-c"},h("p",{class:"mx-n"},t),...rows,h("p",{class:"mx-f"},"Total: ",tot));c._t=tot;return c});
 const res=h("p",{class:"lab-res","aria-live":"polite"});
 function draw(){const S=V.map(r=>r.reduce((a,b)=>a+b,0)),mx=Math.max(...S);cards.forEach((c,i)=>{c._t.textContent=S[i]+" / 20";c.classList.toggle("best",S[i]===mx)});
  res.textContent=`Kandidat terbaik: ${A[S.indexOf(mx)]} (${mx}/20). Sebelum memutuskan, timbang juga risikonya dan susun action plan: apa, siapa, kapan.`}
 bd.append(h("div",{class:"mx"},cards),res);draw()},

/* 0-4 Keeping Well */
well(box){const bd=frame(box,"Cek kesejahteraanku","Nilai kondisimu minggu ini (1 = sangat kurang, 5 = sangat baik). Hasilnya hanya tersimpan di browsermu.");
 const A=[["Fisik","Tidur, makan, dan gerak tubuh","Rutinkan olahraga ringan, makan bergizi, dan minum air yang cukup."],["Mental","Fokus dan pikiran","Batasi informasi negatif dari media sosial, tulis jurnal, atau latihan pernapasan."],["Emosional","Perasaan sehari-hari","Kenali dan beri nama perasaanmu, lalu ceritakan ke orang yang kamu percaya."],["Sosial","Hubungan dengan orang lain","Hubungi support system-mu dan tetapkan batasan dari lingkungan yang toxic."]];
 const V=(load().well||[3,3,3,3]).slice(0,4);const res=h("div",{class:"wl-res","aria-live":"polite"});
 const rows=A.map(([t,d],i)=>{const bar=h("i",{style:`--v:${V[i]/5}`});const r=h("input",{type:"range",min:"1",max:"5",value:String(V[i]),"aria-label":t});const o=h("output",{},String(V[i]));
  r.oninput=()=>{V[i]=+r.value;o.textContent=r.value;bar.style.setProperty("--v",V[i]/5);upd(x=>{x.well=V});draw()};return h("div",{class:"wl-r"},h("div",{},h("b",{},t),h("small",{},d)),r,o,h("span",{class:"wl-b","aria-hidden":"true"},bar))});
 function draw(){const mn=Math.min(...V),i=V.indexOf(mn),avg=V.reduce((a,b)=>a+b,0)/4;res.textContent="";
  res.append(h("span",{class:"mono"},`Rata-rata ${avg.toLocaleString("id-ID",{maximumFractionDigits:1})} / 5`),h("p",{},mn>=4?"Keseimbanganmu baik. Pertahankan kebiasaan yang sudah berjalan.":`Aspek yang paling perlu dirawat: ${A[i][0]}. ${A[i][2]}`))}
 bd.append(h("div",{class:"wl"},rows),res);draw()},
habit(box){const bd=frame(box,"Pelacak kebiasaan self-care","Pilih 1–2 kebiasaan sederhana, lalu centang setiap hari kamu melakukannya. Konsisten lebih penting daripada ekstrem.");
 const H=["Tidur sebelum pukul 23.00","Jalan kaki 15 menit","Minum 8 gelas air","Menulis jurnal 5 menit","Batasi media sosial maks. 1 jam","Mengobrol dengan keluarga"],D=["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
 const now=new Date(),dow=(now.getDay()+6)%7,mon=new Date(now);mon.setDate(now.getDate()-dow);const wk=mon.toISOString().slice(0,10);
 let S=load().habit;if(!S||S.w!==wk)S={w:wk,pick:(S&&S.pick)||[],c:{}};const sv=()=>upd(d=>{d.habit=S});
 const chips=h("div",{class:"chips lab-chips",role:"group","aria-label":"Pilih kebiasaan"}),grid=h("div",{class:"hb"}),res=h("p",{class:"lab-res","aria-live":"polite"});
 function draw(){chips.textContent="";H.forEach((t,i)=>{const b=tg(t,S.pick.includes(i));b.onclick=()=>{if(S.pick.includes(i))S.pick=S.pick.filter(x=>x!==i);else if(S.pick.length>=2){say("Pilih maksimal 2 kebiasaan agar mudah dipertahankan.");return}else S.pick.push(i);sv();draw()};chips.append(b)});
  grid.textContent="";if(!S.pick.length){grid.append(h("p",{class:"lab-d"},"Belum ada kebiasaan yang dipilih."))}
  else{grid.append(h("div",{class:"hb-r hb-h"},h("span"),...D.map((d,k)=>h("span",{class:k===dow?"today":""},d))));
   S.pick.forEach(i=>{const c=S.c[i]||(S.c[i]=[0,0,0,0,0,0,0]);grid.append(h("div",{class:"hb-r"},h("span",{class:"hb-n"},H[i]),...D.map((d,k)=>{const b=h("button",{type:"button",class:"hb-d"+(k===dow?" today":""),"aria-pressed":String(!!c[k]),"aria-label":`${H[i]}, ${d}`},c[k]?"✓":"");b.onclick=()=>{c[k]=c[k]?0:1;sv();draw();if(c[k]&&k===dow)say("Mantap! Satu langkah kecil hari ini.")};return b})))})}
  const tot=S.pick.reduce((a,i)=>a+(S.c[i]||[]).reduce((x,y)=>x+y,0),0);res.textContent=S.pick.length?`Minggu ini: ${tot} dari ${S.pick.length*7} centang. Data direset otomatis setiap Senin.`:""}
 bd.append(chips,grid,res);draw()},

/* 1-0 Emotional and Social Awareness */
emo(box){const bd=frame(box,"Roda emosi: beri nama perasaanmu","Alih-alih sekadar “kesal”, coba temukan nama emosi yang lebih spesifik.");
 const E=[["Marah","#ff6b3d","rahang mengeras, wajah panas, napas memburu",[["Kesal","ada hal kecil yang mengganggumu"],["Tidak dihargai","usahamu terasa diabaikan"],["Frustrasi","kamu terhalang mencapai tujuan"],["Tersinggung","kata-kata orang lain menyentuh harga dirimu"]]],
  ["Sedih","#2b55ff","badan lemas, dada terasa berat, ingin menyendiri",[["Kecewa","harapanmu tidak terpenuhi"],["Tertinggal","kamu membandingkan diri dengan orang lain"],["Kesepian","kamu butuh terhubung dengan orang lain"],["Putus asa","kamu merasa tidak ada jalan keluar"]]],
  ["Takut","#6d4cff","jantung berdebar, telapak tangan berkeringat, napas pendek",[["Cemas","kamu khawatir pada hal yang belum terjadi"],["Gugup","kamu menghadapi situasi baru yang penting"],["Ragu","kamu belum yakin pada kemampuanmu"],["Panik","kamu merasa kehilangan kendali"]]],
  ["Lelah","#14b8a6","mata berat, sulit fokus, mudah tersinggung",[["Jenuh","rutinitas terasa monoton"],["Kewalahan","tuntutan melebihi kapasitasmu"],["Terkuras","energimu habis setelah beraktivitas"],["Apatis","kamu mulai tidak peduli; waspadai tanda burnout"]]],
  ["Senang","#ffd23f","badan terasa ringan, mudah tersenyum, bersemangat",[["Lega","beban yang kamu pikul akhirnya selesai"],["Bangga","usahamu membuahkan hasil"],["Bersyukur","kamu menghargai hal baik yang kamu miliki"],["Antusias","kamu menantikan sesuatu yang berarti"]]]];
 let bi=-1;const base=h("div",{class:"emo-b",role:"group","aria-label":"Emosi dasar"}),spec=h("div",{class:"chips lab-chips",role:"group","aria-label":"Emosi spesifik"}),out=h("div",{class:"emo-o","aria-live":"polite"});
 E.forEach(([t,c],i)=>{const b=h("button",{type:"button","aria-pressed":"false",style:`--c:${c}`},h("i",{"aria-hidden":"true"}),t);b.onclick=()=>{bi=i;qa("button",base).forEach(x=>setP(x,x===b));drawSpec()};base.append(b)});
 function drawSpec(){spec.textContent="";out.textContent="";const[t,c,tb,L]=E[bi];L.forEach(([n,a])=>{const b=tg(n,false);b.onclick=()=>{qa("button",spec).forEach(x=>setP(x,x===b));out.textContent="";out.style.setProperty("--c",c);
  out.append(h("span",{class:"mono"},`${t} → ${n}`),h("p",{},h("b",{},`“Aku merasa ${n.toLowerCase()}”`),` artinya ${a}.`),h("p",{},h("b",{},"Sinyal tubuh yang sering muncul: "),tb+"."),h("p",{},h("b",{},"Langkah berikutnya: "),"ambil jeda, tarik napas panjang, lalu pilih respons yang paling membantu, misalnya bercerita, beristirahat, atau menyampaikan kebutuhanmu secara asertif."))};spec.append(b)})}
 bd.append(step("1","Pilih emosi dasar yang paling dekat dengan perasaanmu."),base,step("2","Pilih nama yang lebih spesifik."),spec,out)},

/* 1-1 Communicate with Empathy */
imsg(box){const bd=frame(box,"Perakit pesan “saya” (I-message)","Susun kalimat asertif dari pilihan berikut, lalu uji kemampuanmu membedakan gaya respons.");
 const P=[["Saya merasa","khawatir","kewalahan","bingung","kecewa"],["ketika","laporan tim belum terkumpul","tugas baru datang di tengah tenggat","arahan berubah tanpa kabar","rapat dimulai tanpa agenda"],["karena","tenggat klien besok pagi","aku takut kualitas kerja kita turun","aku perlu waktu menyesuaikan rencana","kita jadi sulit fokus"],["Saya harap","kita bisa membagi tugas sore ini","kita sepakati prioritas dulu","setiap perubahan dikabari lewat grup","ada agenda singkat sebelum rapat"]];
 const sel=P.map(([lab,...o])=>{const s=h("select",{"aria-label":lab},o.map(x=>h("option",{},x)));s.onchange=draw;return h("label",{class:"im-f"},h("span",{},lab),s)});
 const out=h("p",{class:"im-o","aria-live":"polite"}),cp=h("button",{type:"button",class:"btn"},"Salin kalimat");cp.onclick=()=>copy(out.textContent,cp);
 function draw(){const v=sel.map(l=>q("select",l).value);out.textContent=`“Saya merasa ${v[0]} ketika ${v[1]}, karena ${v[2]}. Saya harap ${v[3]}.”`}
 const R=[["“Ya sudah, tidak apa-apa,” padahal kamu kesal dan memendamnya.",0],["“Kamu ini tidak tahu sopan santun, ya!”",2],["“Aku kurang nyaman laptopku dipakai tanpa izin. Lain kali tolong tanya dulu, ya.”",1]],G=["Pasif","Asertif","Agresif"];
 const cls=h("div",{class:"im-c"},mix(R).map(([t,k])=>{const fb=h("p",{class:"lab-fb","aria-live":"polite"});const g=h("div",{class:"lab-seg"},G.map((x,i)=>{const b=h("button",{type:"button"},x);b.onclick=()=>{if(i===k){qa("button",g).forEach(y=>{y.disabled=true});b.classList.add("ok");fb.className="lab-fb good";fb.textContent=`Tepat, ini respons ${x.toLowerCase()}.`}else{b.classList.add("no");b.disabled=true;fb.className="lab-fb bad";fb.textContent="Belum tepat. Perhatikan: memendam, menyerang, atau jujur sambil menghormati?"}};return b}));return h("div",{class:"im-i"},h("p",{},t),g,fb)}));
 bd.append(step("1","Pilih isi setiap bagian."),h("div",{class:"im"},sel),out,h("div",{class:"lab-row"},cp),step("2","Situasi: rekan kerja memakai laptopmu tanpa izin. Apa gaya tiap respons berikut?"),cls);draw()},

/* 1-2 Facing Stress and Burnout */
stres(box){const bd=frame(box,"Cek tanda stres dan burnout","Centang yang kamu alami dua minggu terakhir. Ini latihan refleksi, <b>bukan diagnosis</b>.");
 const L=[["Jantung berdebar dan cemas menjelang tenggat","s"],["Merasa terlalu banyak hal yang harus dikejar","s"],["Sulit tidur karena memikirkan tugas","s"],["Tetap yakin keadaan membaik setelah tugas selesai","s"],["Tidak peduli lagi dengan hasil pekerjaan","b"],["Merasa hampa atau mati rasa","b"],["Sinis terhadap pekerjaan dan orang sekitar","b"],["Merasa tidak ada jalan keluar","b"]];
 const on=new Set(),res=h("div",{class:"st-res","aria-live":"polite"});
 const list=h("div",{class:"st-l"},L.map(([t],i)=>{const b=h("button",{type:"button",class:"st-i","aria-pressed":"false"},h("i",{"aria-hidden":"true"}),t);b.onclick=()=>{on.has(i)?on.delete(i):on.add(i);setP(b,on.has(i));draw()};return b}));
 function draw(){const s=[...on].filter(i=>L[i][1]==="s").length,b=[...on].filter(i=>L[i][1]==="b").length;res.textContent="";
  res.append(h("div",{class:"st-bars"},h("span",{},"Tanda stres",h("i",{style:`--v:${s/4}`}),`${s}/4`),h("span",{},"Tanda burnout",h("i",{style:`--v:${b/4}`}),`${b}/4`)),
   h("p",{},!s&&!b?"Belum ada yang dicentang.":b>=2?"Ada beberapa tanda burnout (disengagement). Jangan dipendam: atur ulang beban, tetapkan batasan, dan bicarakan dengan orang tepercaya, guru BK, atau tenaga profesional.":s>=2?"Tandanya lebih mengarah ke stres (over-engagement). Coba problem-focused coping untuk sumber masalahnya dan latihan pernapasan di bawah untuk emosimu.":"Tekananmu masih ringan. Tetap jaga istirahat berkualitas."))}
 bd.append(list,res);draw()},
breath(box){const bd=frame(box,"Latihan napas kotak (4-4-4-4)","Teknik emotion-focused coping sederhana: ikuti lingkaran selama beberapa putaran.");
 const P=[["Tarik napas",1],["Tahan",1],["Hembuskan",0],["Tahan",0]];let on=false,i=0,c=4,cyc=0,tm=0;
 const lab=h("b",{class:"br-l"},"Siap?"),num=h("span",{class:"br-n"},"4"),orb=h("div",{class:"br-o","aria-hidden":"true"},h("i"));const info=h("p",{class:"lab-res","aria-live":"polite"},"Tekan Mulai, lalu ikuti petunjuknya.");
 const btn=h("button",{type:"button",class:"btn p"},"Mulai");
 function tick(){c--;if(c<=0){i=(i+1)%4;c=4;if(i===0){cyc++;info.textContent=`Putaran selesai: ${cyc}. Lakukan 3–4 putaran saat merasa tegang.`}}render()}
 function render(){lab.textContent=P[i][0];num.textContent=String(c);orb.classList.toggle("big",!!P[i][1]);orb.dataset.p=String(i)}
 btn.onclick=()=>{on=!on;btn.textContent=on?"Berhenti":"Mulai";if(on){i=0;c=4;render();tm=setInterval(tick,1000)}else{clearInterval(tm);lab.textContent="Bagus!";num.textContent="";orb.classList.remove("big")}};
 addEventListener("hashchange",()=>{if(on){on=false;clearInterval(tm);btn.textContent="Mulai"}},{once:true});
 bd.append(h("div",{class:"br"},orb,h("div",{class:"br-t"},lab,num)),info,h("div",{class:"lab-row"},btn))},

/* 1-3 Criticism, Weakness and Failure */
pick(box){const bd=frame(box,"Ubah kritik menjadi rencana","Pilih respons atau insight yang paling membantu pertumbuhanmu.");
 const I=[["Supervisor menegurmu dengan nada tinggi di depan tim. Respons pertamamu?",["Langsung membela diri dan mencari alasan.","Mengambil jeda, bernapas, lalu bertanya bagian mana yang perlu diperbaiki.","Membalas dengan nada yang sama tinggi."],1,"Jeda reaktif mematikan refleks defensif."],
  ["Kritik: “Presentasimu membosankan.” Mana insight yang bisa ditindaklanjuti?",["Aku memang tidak berbakat presentasi.","Penontonnya saja yang tidak fokus.","Aku perlu melatih intonasi suara dan membuat slide yang lebih visual."],2,"Kritik abstrak diubah menjadi target yang spesifik."],
  ["Kritik: “Laporanmu berantakan.” Mana insight yang bisa ditindaklanjuti?",["Aku akan memakai template dan mengecek ulang angka sebelum mengirim.","Atasan memang selalu mencari kesalahan.","Lain kali aku tidak mau mengerjakan laporan."],0,"Fokus pada hasil kerja, bukan pada perasaan diserang."],
  ["Kamu gagal di tahap psikotes. Pertanyaan post-mortem yang paling membantu?",["“Kenapa aku selalu sial?”","“Bagian mana yang meleset, dan strategi apa yang akan kuubah?”","“Siapa yang membuat soal sesulit ini?”"],1,"Post-mortem fokus pada faktor yang meleset dan strategi berikutnya."]];
 let sc=0,dn=0;const res=h("p",{class:"lab-res","aria-live":"polite"});
 const items=I.map(([t,o,k,e],n)=>{const wrap=h("div",{class:"pk-i"},h("p",{class:"pk-q"},h("b",{},pad(n+1)+". "),t));let first=true;const fb=h("p",{class:"lab-fb","aria-live":"polite"});
  const g=h("div",{class:"lab-opts"},o.map((x,i)=>{const b=h("button",{type:"button",class:"lab-opt"},x);b.onclick=()=>{if(i===k){b.classList.add("ok");qa("button",g).forEach(y=>y.disabled=true);fb.className="lab-fb good";fb.textContent="Tepat! "+e;if(first)sc++;dn++;draw()}else{first=false;b.classList.add("no");b.disabled=true;fb.className="lab-fb bad";fb.textContent="Belum tepat. Coba pilih yang lebih membangun."}};return b}));wrap.append(g,fb);return wrap});
 function draw(){res.textContent=dn<I.length?`${dn} dari ${I.length} selesai.`:`Selesai! ${sc} dari ${I.length} benar pada percobaan pertama.`;if(dn===I.length&&sc===I.length)pop(res)}
 bd.append(...items,res);draw()},

/* 1-4 Happiness in Life */
syukur(box){const bd=frame(box,"Jurnal syukur harian","Tuliskan tiga hal kecil yang kamu syukuri hari ini. Jurnal hanya tersimpan di browser ini.");
 const today=new Date().toISOString().slice(0,10);const ins=[1,2,3].map(n=>h("input",{type:"text",class:"lab-in",maxlength:"120",placeholder:`Hal ${n} yang kusyukuri…`,"aria-label":`Hal ${n} yang disyukuri`}));
 const sv=h("button",{type:"button",class:"btn p"},"Simpan jurnal hari ini"),list=h("div",{class:"gj"}),stat=h("p",{class:"lab-res","aria-live":"polite"});
 const cur=(load().jurnal||[]).find(x=>x.d===today);if(cur)cur.i.forEach((t,k)=>{if(ins[k])ins[k].value=t});
 sv.onclick=()=>{const it=ins.map(x=>x.value.trim()).filter(Boolean);if(!it.length){say("Tulis minimal satu hal yang kamu syukuri.");ins[0].focus();return}
  upd(d=>{d.jurnal=(d.jurnal||[]).filter(x=>x.d!==today);d.jurnal.unshift({d:today,i:it});d.jurnal=d.jurnal.slice(0,30)});draw();say("Jurnal syukur tersimpan.");if(it.length>=3)pop(sv)};
 function streak(J){let s=0;const set=new Set(J.map(x=>x.d)),d=new Date();for(;;){const k=d.toISOString().slice(0,10);if(set.has(k)){s++;d.setDate(d.getDate()-1)}else break}return s}
 function draw(){const J=load().jurnal||[];list.textContent="";J.slice(0,5).forEach(x=>{list.append(h("div",{class:"gj-i"},h("span",{class:"mono"},new Date(x.d+"T00:00").toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})),h("ul",{},x.i.map(t=>h("li",{},t)))))});
  stat.textContent=J.length?`${J.length} hari tercatat · beruntun ${streak(J)} hari.`:"Belum ada jurnal tersimpan."}
 bd.append(h("div",{class:"gj-f"},ins),h("div",{class:"lab-row"},sv),stat,list);draw()},
values(box){const bd=frame(box,"Temukan “mengapa”-mu","Pilih sampai tiga nilai inti (core values) yang paling penting bagimu.");
 const V=["Keluarga","Belajar hal baru","Membantu orang lain","Kemandirian","Kreativitas","Kejujuran","Kesehatan","Stabilitas","Tantangan","Kebersamaan tim"];let on=load().values||[];
 const chips=h("div",{class:"chips lab-chips",role:"group","aria-label":"Nilai inti"}),out=h("div",{class:"vl-o","aria-live":"polite"});
 function draw(){chips.textContent="";V.forEach(v=>{const b=tg(v,on.includes(v));b.onclick=()=>{if(on.includes(v))on=on.filter(x=>x!==v);else if(on.length>=3){say("Pilih maksimal tiga nilai.");return}else on.push(v);upd(d=>{d.values=on});draw()};chips.append(b)});
  out.textContent="";if(on.length)out.append(h("span",{class:"mono"},"Kalimat “mengapa”-ku"),h("p",{},`Aku bekerja dan belajar karena aku menghargai ${on.join(", ").replace(/, ([^,]*)$/," dan $1").toLowerCase()}.`),h("p",{class:"lab-d"},"Gunakan nilai ini saat memilih lowongan dan menjawab pertanyaan “Mengapa kamu melamar di sini?”"))}
 bd.append(chips,out);draw()},

/* 2-0 System Thinking */
loop(box){const bd=frame(box,"Putar lingkaran umpan balik","Pilih skenario, lalu tekan Putar untuk melihat bagaimana akibat kembali memengaruhi sebabnya.");
 const S=[["Penguat positif","+",["Rajin latihan wawancara","Makin lancar menjawab","Makin percaya diri"],"Setiap putaran memperkuat putaran berikutnya ke arah yang baik."],["Penguat negatif","+",["Menghindari latihan","Makin gugup saat tes","Makin takut mencoba"],"Lingkaran yang sama bisa berputar ke arah buruk. Putus di satu titik, misalnya mulai latihan kecil."],["Penyeimbang","−",["Beban kerja naik","Kelelahan meningkat","Istirahat, energi pulih"],"Sistem menahan perubahan agar kembali stabil."]];
 let si=0,run=0;const NS="http://www.w3.org/2000/svg";
 const svg=document.createElementNS(NS,"svg");svg.setAttribute("viewBox","0 0 360 300");svg.setAttribute("class","lp-svg");svg.setAttribute("aria-hidden","true");
 const P=[[180,58],[300,232],[60,232]];
 svg.innerHTML=`<path class="lp-arc" d="M228 74 Q300 110 300 178"/><path class="lp-arc" d="M246 250 Q180 282 114 250"/><path class="lp-arc" d="M60 178 Q60 110 132 74"/><polygon class="lp-h" points="300,190 292,174 308,174"/><polygon class="lp-h" points="104,246 120,240 118,256"/><polygon class="lp-h" points="142,70 128,64 132,80"/>`+P.map(([x,y],k)=>`<g class="lp-n" data-k="${k}"><circle cx="${x}" cy="${y}" r="50"/></g>`).join("")+`<text class="lp-s" x="180" y="168" text-anchor="middle"></text>`;
 const labs=P.map(([x,y])=>h("span",{class:"lp-t",style:`left:${x/3.6}%;top:${y/3}%`}));const stage=h("div",{class:"lp"},svg,...labs);
 const chips=h("div",{class:"chips lab-chips",role:"group","aria-label":"Skenario"},S.map((s,k)=>{const b=tg(s[0],!k);b.onclick=()=>{si=k;qa("button",chips).forEach(x=>setP(x,x===b));draw()};return b}));
 const cap=h("p",{class:"lab-res","aria-live":"polite"}),go=h("button",{type:"button",class:"btn p"},"Putar");
 function draw(){const s=S[si];labs.forEach((l,k)=>l.textContent=s[2][k]);q(".lp-s",svg).textContent=s[1];stage.dataset.t=s[1]==="+"?"r":"b";cap.textContent=s[3];qa(".lp-n",svg).forEach(n=>n.classList.remove("on"))}
 go.onclick=()=>{clearInterval(run);let k=0;const n=qa(".lp-n",svg);const stepF=()=>{n.forEach((x,i)=>x.classList.toggle("on",i===k%3));labs.forEach((x,i)=>x.classList.toggle("on",i===k%3));cap.textContent=`Langkah ${k%3+1}: ${S[si][2][k%3]} → ${S[si][2][(k+1)%3]}`;k++;if(k>6){clearInterval(run);setTimeout(()=>{n.forEach(x=>x.classList.remove("on"));labs.forEach(x=>x.classList.remove("on"));cap.textContent=S[si][3]},700)}};stepF();run=setInterval(stepF,reduce()?1200:800)};
 bd.append(chips,stage,cap,h("div",{class:"lab-row"},go));draw()},

/* 2-1 Critical Thinking */
flag(box){const bd=frame(box,"Detektif lowongan palsu","Ketuk baris yang menurutmu mencurigakan, lalu periksa jawabanmu.");
 const L=[["PT Maju Sentosa Abadi membuka lowongan Staf Administrasi.",0,"Informasi umum, belum mencurigakan."],["Gaji Rp8.000.000 per bulan untuk lulusan baru tanpa pengalaman.",1,"Gaji jauh di atas rata-rata posisi pemula adalah tanda bahaya."],["Persyaratan: lulusan SMK semua jurusan, teliti, menguasai Excel.",0,"Persyaratan wajar."],["Kirim CV ke alamat email gratisan, bukan domain resmi perusahaan.",1,"Perusahaan resmi umumnya memakai email berdomain perusahaan."],["Wajib transfer Rp150.000 untuk biaya seragam sebelum wawancara.",1,"Perusahaan resmi tidak memungut biaya rekrutmen."],["Wawancara di kantor sesuai alamat pada situs resmi perusahaan.",0,"Bisa dicek kebenarannya, jadi tidak mencurigakan."],["Lowongan hanya berlaku hari ini, segera daftar sebelum kehabisan!",1,"Tekanan waktu berlebihan sering dipakai penipu agar kamu tidak sempat mengecek."]];
 const on=new Set();let chk=false;const ad=h("div",{class:"fl-ad"},h("span",{class:"mono"},"Lowongan dari pesan berantai"));
 const rows=L.map(([t],i)=>{const b=h("button",{type:"button",class:"fl-r","aria-pressed":"false"},h("span",{},t),h("small"));b.onclick=()=>{if(chk)return;on.has(i)?on.delete(i):on.add(i);setP(b,on.has(i))};ad.append(b);return b});
 const res=h("p",{class:"lab-res","aria-live":"polite"}),go=h("button",{type:"button",class:"btn p"},"Periksa"),rs=h("button",{type:"button",class:"btn"},"Ulangi");
 go.onclick=()=>{chk=true;let ok=0;rows.forEach((b,i)=>{const f=L[i][1],m=on.has(i);b.classList.toggle("hit",f&&m);b.classList.toggle("miss",f&&!m);b.classList.toggle("wrong",!f&&m);q("small",b).textContent=(f?"Tanda bahaya: ":"Aman: ")+L[i][2];if(f===+m||(f&&m)||(!f&&!m))ok++});
  const tot=L.filter(x=>x[1]).length,hit=[...on].filter(i=>L[i][1]).length,fp=[...on].filter(i=>!L[i][1]).length;res.textContent=`Kamu menemukan ${hit} dari ${tot} tanda bahaya${fp?` dan menandai ${fp} baris yang sebenarnya aman`:""}. Kesimpulan: jangan transfer uang, cek situs resmi, dan bandingkan dengan sumber lain.`;if(hit===tot&&!fp)pop(res)};
 rs.onclick=()=>{chk=false;on.clear();rows.forEach(b=>{b.className="fl-r";setP(b,false);q("small",b).textContent=""});res.textContent=""};
 bd.append(ad,h("div",{class:"lab-row"},go,rs),res)},

/* 2-2 Strategic Thinking */
smart(box){const bd=frame(box,"Perakit target SMART","Isi kolomnya untuk mengubah keinginan menjadi target karier yang realistis. Tersimpan otomatis di browser ini.");
 const F=[["s","Spesifik","Apa yang ingin kamu capai?","mis. lulus sertifikasi jaringan dasar"],["m","Terukur","Bagaimana mengukur keberhasilannya?","mis. nilai ujian minimal 80"],["a","Dapat dicapai","Sumber daya apa yang kamu punya?","mis. kursus daring gratis, 1 jam setiap hari"],["r","Relevan","Mengapa penting untuk visimu?","mis. syarat menjadi teknisi jaringan"]];
 const T=["1 bulan","3 bulan","6 bulan","1 tahun"];const S=load().smart||{};
 const ins=F.map(([k,t,qq,ph])=>{const i=h("input",{type:"text",class:"lab-in",maxlength:"120",placeholder:ph,"aria-label":`${t}: ${qq}`});i.value=S[k]||"";i.oninput=draw;return h("label",{class:"sm-f"},h("span",{},h("b",{},t[0]),` ${t} · ${qq}`),i)});
 const sel=h("select",{"aria-label":"Berbatas waktu"},T.map(t=>h("option",{},t)));if(S.t)sel.value=S.t;sel.onchange=draw;
 const out=h("p",{class:"im-o","aria-live":"polite"}),meter=h("div",{class:"lab-meter m5","aria-hidden":"true"},[0,1,2,3,4].map(()=>h("i"))),cp=h("button",{type:"button",class:"btn"},"Salin target"),ex=h("button",{type:"button",class:"btn"},"Pakai contoh");
 cp.onclick=()=>copy(out.textContent,cp);
 ex.onclick=()=>{const E=["lulus sertifikasi jaringan dasar","nilai ujian minimal 80","kursus daring gratis, 1 jam setiap hari","itu syarat menjadi teknisi jaringan di penyedia internet"];ins.forEach((l,k)=>q("input",l).value=E[k]);sel.value="6 bulan";draw()};
 function draw(){const v=ins.map(l=>q("input",l).value.trim()),t=sel.value,n=v.filter(Boolean).length+1;upd(d=>{d.smart={s:v[0],m:v[1],a:v[2],r:v[3],t}});qa("i",meter).forEach((x,k)=>x.classList.toggle("on",k<n));
  out.textContent=v[0]?`Dalam ${t}, aku akan ${v[0]}${v[1]?`, diukur dari ${v[1]}`:""}${v[2]?`, dengan memanfaatkan ${v[2]}`:""}${v[3]?`, karena ${v[3]}`:""}.`:"Mulai dari kolom Spesifik untuk melihat kalimat targetmu."}
 bd.append(h("div",{class:"sm"},ins,h("label",{class:"sm-f"},h("span",{},h("b",{},"T")," Berbatas waktu · Kapan tenggatnya?"),sel)),meter,out,h("div",{class:"lab-row"},cp,ex));draw()},

/* 2-3 Reflective Thinking */
star(box){const bd=frame(box,"Penyusun jawaban STAR","Tulis satu pengalamanmu (PKL, organisasi, atau proyek sekolah). Pratinjau jawaban wawancaramu muncul di bawah.");
 const F=[["s","Situation","Apa situasi atau konteksnya?","mis. Saat PKL di bengkel, pelanggan sering menunggu lebih dari dua jam."],["t","Task","Apa tugas atau tanggung jawabmu?","mis. Saya bertugas mencatat antrean servis."],["a","Action","Tindakan spesifik apa yang kamu lakukan?","mis. Saya membuat jadwal antrean di spreadsheet dan pengingat lewat WhatsApp."],["r","Result","Apa hasilnya? Usahakan terukur.","mis. Waktu tunggu turun menjadi sekitar 45 menit."]];
 const S=load().star||{};const tas=F.map(([k,t,qq,ph])=>{const a=h("textarea",{rows:"2",maxlength:"400",placeholder:ph,"aria-label":`${t}: ${qq}`});a.value=S[k]||"";a.oninput=draw;return h("label",{class:"sr-f"},h("span",{},h("b",{},k.toUpperCase()),` ${t} · ${qq}`),a)});
 const out=h("div",{class:"sr-o","aria-live":"polite"}),cnt=h("small",{}),cp=h("button",{type:"button",class:"btn"},"Salin jawaban"),ex=h("button",{type:"button",class:"btn"},"Pakai contoh");
 cp.onclick=()=>copy(tas.map(l=>q("textarea",l).value.trim()).filter(Boolean).join(" "),cp);
 ex.onclick=()=>{tas.forEach((l,k)=>q("textarea",l).value=F[k][3].replace(/^mis\. /,""));draw()};
 function draw(){const v=tas.map(l=>q("textarea",l).value.trim());upd(d=>{d.star={s:v[0],t:v[1],a:v[2],r:v[3]}});out.textContent="";
  if(!v.some(Boolean)){out.append(h("p",{class:"lab-d"},"Pratinjau akan muncul di sini."));cnt.textContent="";return}
  out.append(h("span",{class:"mono"},"Pratinjau jawaban"),h("p",{},...v.map((x,k)=>x?[h("mark",{class:"k"+k},F[k][0][0]),` ${x} `]:null)));const w=v.join(" ").split(/\s+/).filter(Boolean).length;cnt.textContent=`${w} kata · ${v.filter(Boolean).length}/4 bagian terisi${v.every(Boolean)?" · siap dilatih!":""}`}
 bd.append(h("div",{class:"sr"},tas),out,cnt,h("div",{class:"lab-row"},cp,ex));draw()},

/* 2-4 Creative Thinking */
ide(box){const bd=frame(box,"Tantangan brainstorming + kartu pemicu ide","Atur waktu, tulis ide sebanyak mungkin tanpa menilai, lalu kocok kartu pemicu ide untuk memancing ide baru.");
 const topic=h("input",{type:"text",class:"lab-in",maxlength:"100","aria-label":"Topik brainstorming"});topic.value="Cara menunjukkan kemampuan tanpa pengalaman kerja";
 const SC=[["Ide “buruk” dulu","Tulis tiga ide paling aneh atau “buruk” untuk topik ini. Ide buruk sering membuka jalan ke ide bagus."],["Inkubasi","Tinggalkan topik ini sejenak, misalnya jalan kaki lima menit, lalu tulis ide pertama yang muncul saat kembali."],["Ubah lingkungan","Bayangkan kamu mengerjakan ini di tempat lain, misalnya pasar atau kantor startup. Ide apa yang muncul?"],["Mind map","Tulis topik di tengah, lalu buat tiga cabang: orang, alat, dan tempat. Isi tiap cabang dengan dua ide."],["Berpikir lateral","Bagaimana jika masalahnya didekati dari arah sebaliknya? Misalnya, alih-alih mencari lowongan, buat orang yang mencarimu."],["Combinatorial play","Gabungkan dua hal yang sudah kamu kuasai menjadi satu ide baru. Misalnya keahlianmu dengan media sosial."],["Uji adaptasi","Pilih satu ide liarmu. Apa yang perlu diubah agar bisa dijalankan minggu ini dengan sumber daya yang ada?"]];

 const card=h("div",{class:"scm-c","aria-live":"polite"},h("b",{},"Kartu pemicu ide"),h("p",{},"Tekan “Kocok kartu” untuk memulai."));const draw=h("button",{type:"button",class:"btn"},"Kocok kartu");
 draw.onclick=()=>{const[t,d]=SC[Math.floor(Math.random()*SC.length)];card.textContent="";card.append(h("b",{},t),h("p",{},d));card.classList.remove("flip");void card.offsetWidth;card.classList.add("flip")};
 const sel=h("select",{"aria-label":"Durasi"},[["60","1 menit"],["180","3 menit"],["300","5 menit"]].map(([v,t])=>h("option",{value:v},t)));
 const clock=h("b",{class:"bs-clk"},"01:00"),start=h("button",{type:"button",class:"btn p"},"Mulai"),idea=h("input",{type:"text",class:"lab-in",maxlength:"120",placeholder:"Tulis ide lalu tekan Enter…","aria-label":"Ide baru"}),list=h("ol",{class:"bs-l"}),cnt=h("p",{class:"lab-res","aria-live":"polite"},"0 ide");
 let left=60,tm=0,run=false;const fmt=s=>`${pad(Math.floor(s/60))}:${pad(s%60)}`;sel.onchange=()=>{if(!run){left=+sel.value;clock.textContent=fmt(left)}};
 const stop=()=>{run=false;clearInterval(tm);start.textContent="Mulai lagi";const n=list.children.length;cnt.textContent=`Waktu habis! Kamu menghasilkan ${n} ide. Sekarang pilih 1–2 ide terbaik untuk diuji.`;if(n>=5)pop(cnt)};
 start.onclick=()=>{if(run){stop();return}run=true;left=+sel.value;clock.textContent=fmt(left);start.textContent="Selesai";idea.focus();tm=setInterval(()=>{left--;clock.textContent=fmt(Math.max(0,left));if(left<=0)stop()},1000)};
 idea.onkeydown=e=>{if(e.key!=="Enter")return;e.preventDefault();const v=idea.value.trim();if(!v)return;list.append(h("li",{},v));idea.value="";cnt.textContent=`${list.children.length} ide${run?"":" (timer belum berjalan)"}`};
 addEventListener("hashchange",()=>{if(run){run=false;clearInterval(tm);start.textContent="Mulai"}},{once:true});
 bd.append(h("label",{class:"sm-f"},h("span",{},"Topik"),topic),h("div",{class:"bs"},h("div",{class:"bs-t"},clock,sel,start),idea,cnt,list),h("div",{class:"scm"},card,draw))}
};
/* lokasi widget per pelajaran: kunci "bab-pelajaran", at = sisipkan setelah bagian ke-n */
const LABS={"0-0":[{at:1,w:"sign"}],"0-1":[{at:1,w:"tri"}],"0-2":[{at:1,w:"reframe"}],"0-3":[{at:0,w:"whys"},{at:2,w:"matrix"}],"0-4":[{at:0,w:"well"},{at:3,w:"habit"}],
 "1-0":[{at:0,w:"emo"}],"1-4":[{at:2,w:"imsg"}],"1-1":[{at:1,w:"stres"},{at:2,w:"breath"}],"1-2":[{at:2,w:"pick"}],"1-3":[{at:1,w:"syukur"},{at:2,w:"values"}],
 "2-0":[{at:1,w:"loop"}],"2-1":[{at:2,w:"flag"}],"2-2":[{at:2,w:"smart"}],"2-3":[{at:2,w:"star"}],"2-4":[{at:1,w:"ide"}]};
const labsAt=(key,k)=>(LABS[key]||[]).filter(x=>x.at===k).map(x=>`<section class="lab" data-w="${x.w}" id="lab-${x.w}"></section>`).join("");

/* ---------- cek cepat, catatan, daftar isi, info ---------- */
function cek(box,i,j){const L=GLD.CEK.filter(c=>c.b===i&&c.l===j);if(!L.length){box.remove();return}
 const bd=frame(box,"Cek cepat","Benar atau salah? Jawab untuk memastikan kamu sudah paham.","Cek pemahaman");let sc=0,dn=0;const res=h("p",{class:"lab-res","aria-live":"polite"});
 L.forEach((c,n)=>{const fb=h("p",{class:"lab-fb","aria-live":"polite"});const g=h("div",{class:"lab-seg tf"},[["Benar",true],["Salah",false]].map(([t,v])=>{const b=h("button",{type:"button"},t);b.onclick=()=>{qa("button",g).forEach(x=>x.disabled=true);const ok=v===c.v;b.classList.add(ok?"ok":"no");if(ok)sc++;dn++;fb.className="lab-fb "+(ok?"good":"bad");fb.textContent=(ok?"Tepat! ":`Kurang tepat, pernyataan ini ${c.v?"benar":"salah"}. `)+c.e;draw()};return b}));
  bd.append(h("div",{class:"tf-i"},h("p",{},h("b",{},pad(n+1)+". "),c.s),g,fb))});
 const again=h("button",{type:"button",class:"btn"},"Ulangi cek cepat");again.hidden=true;again.onclick=()=>{cek(box,i,j)};
 function draw(){res.textContent=dn<L.length?"":`Skormu ${sc}/${L.length}. ${sc===L.length?"Mantap, kamu siap lanjut!":"Baca lagi bagian terkait, lalu coba ulang."}`;again.hidden=dn<L.length;if(dn===L.length){upd(d=>{d.cek=d.cek||{};d.cek[i+"-"+j]=sc+"/"+L.length});if(sc===L.length)pop(res)}}
 bd.append(res,h("div",{class:"lab-row"},again))}
function note(box,i,j){const k=i+"-"+j;box.textContent="";const ta=h("textarea",{rows:"4",maxlength:"2000",placeholder:"Tulis hal penting yang kamu pelajari atau ingin kamu coba…","aria-label":"Catatan pribadi untuk pelajaran ini"});
 ta.value=(load().notes||{})[k]||"";const st=h("small",{"aria-live":"polite"},ta.value?"Tersimpan di browser ini.":"");let t=0;
 ta.oninput=()=>{clearTimeout(t);st.textContent="Menyimpan…";t=setTimeout(()=>{upd(d=>{d.notes=d.notes||{};if(ta.value.trim())d.notes[k]=ta.value;else delete d.notes[k]});st.textContent="Tersimpan di browser ini."},500)};
 box.append(h("span",{class:"mono",html:ico("note","ico isg")+" Catatan pribadiku"}),ta,st)}
function toc(art){const nav=q(".toc",art);if(!nav)return;nav.textContent="";const hs=qa("h2[id], .lab[id], .cek[id]",art);
 nav.append(h("span",{class:"mono"},"Di pelajaran ini"),h("div",{class:"toc-l"},hs.map(x=>{const lab=x.tagName==="H2"?x.textContent.trim():(x.classList.contains("cek")?"✓ Cek cepat":"★ "+(x.dataset.title||"Coba sendiri"));
  const b=h("button",{type:"button",class:"chip"+(x.tagName==="H2"?"":" t2")},lab);b.onclick=()=>{const y=Math.max(0,x.getBoundingClientRect().top+scrollY-110);try{if(window.__lenis){window.__lenis.scrollTo(y,{force:true,immediate:reduce(),onComplete:()=>{const d=x.getBoundingClientRect().top-110;if(Math.abs(d)>14)window.__lenis.scrollTo(scrollY+d,{force:true,duration:.5})}});return}}catch(e){}scrollTo({top:y,behavior:reduce()?"auto":"smooth"})};return b})))}
function meta(art,i,j){const m=q(".lmeta",art);if(!m)return;const w=(art.textContent||"").split(/\s+/).filter(Boolean).length,min=Math.max(3,Math.round(w/180)),nl=(LABS[i+"-"+j]||[]).length,nc=GLD.CEK.filter(c=>c.b===i&&c.l===j).length;
 m.textContent=`± ${min} menit baca · ${nl} aktivitas interaktif · ${nc} soal cek cepat`}
function lesson(art,i,j){meta(art,i,j);qa(".lab[data-w]",art).forEach(box=>{try{W[box.dataset.w](box)}catch(e){console.warn("lab",box.dataset.w,e)}});
 const c=q(".cek",art);c&&cek(c,i,j);const n=q(".note",art);n&&note(n,i,j);toc(art)}

/* ==================================================================
   BERANDA
   ================================================================== */
function home(){pdn();lanjut();diag();latih();kilat()}
function pdn(){const b=q("#pdn");if(!b||b.dataset.ok)return;b.dataset.ok=1;
 b.innerHTML=[["#/tujuan","target","Tujuan belajar","Kompetensi yang ingin dicapai di tiap bab, diturunkan dari GBIM."],["#/petunjuk","guide","Petunjuk penggunaan","Cara memakai situs, arti ikon, menyimpan progres, dan mengerjakan latihan."],["#/alur","route","Alur belajar","Materi → Latihan soal → Simulasi → Nilai akhir, beserta cara menghitung nilai."],["#/peta","map","Peta konsep","Seluruh isi GrowthLab dalam satu peta. Klik simpulnya untuk langsung membuka."]]
  .map(([hf,ic,t,d],i)=>`<a class="stp pdc" href="${hf}"><span class="pd-top"><b>${pad(i+1)}</b>${ico(ic,"ico ibg")}</span><h3>${t}</h3><p>${d}</p><span class="go">Buka →</span></a>`).join("")}
function lanjut(){const b=q("#lanjut");if(!b)return;let n=0,tot=0;try{n=done.size;tot=total}catch(e){}const all=tot&&n>=tot;let ni=0,nj=0;try{[ni,nj]=nextUp()}catch(e){}
 const d=GLX.load(),H=GLX.hitung(d),simN=GLD.SIM.filter(s=>d.sim[s.id]&&d.sim[s.id].best).length,ch=CH()[ni],L=ch.l[nj];
 b.innerHTML=`<span class="mono">${all?"Materi selesai":"Lanjutkan belajar"}</span><h3>${all?"Saatnya latihan!":esc(L.t)}</h3><p>${all?"Semua 15 pelajaran sudah kamu tandai selesai. Uji kesiapanmu di menu Latihan.":`Bab ${ni+1} · ${esc(ch.t)} · Pelajaran ${pad(nj+1)}`}</p>
 <div class="lj-bar" aria-hidden="true"><i style="--p:${tot?n/tot:0}"></i></div><p class="lj-s">${n}/${tot} pelajaran · kuis terbaik ${H.pg==null?"–":String(H.pg).replace(".",",")} · simulasi ${simN}/${GLD.SIM.length}${H.akhir!=null?` · nilai akhir ${Math.round(H.akhir*10)/10}`.replace(".",","):""}</p>
 <div class="row" style="margin-top:16px"><a class="btn p" href="${all?"#/latihan":`#/lesson/${ni}-${nj}`}">${all?"Ke Latihan":n?"Lanjutkan":"Mulai belajar"}</a><a class="btn" href="#/course">Semua bab</a></div>
 <div class="lj-bab">${CH().map((c,i)=>{const k=c.l.filter((_,j)=>isDone(i+"-"+j)).length;return `<a href="#/course/${i+1}"><span>Bab ${i+1} · ${esc(c.t)}</span><i style="--p:${k/c.l.length}" aria-hidden="true"></i><b>${k}/${c.l.length}</b></a>`}).join("")}</div>
 ${(()=>{const day=Math.floor(Date.now()/864e5),all15=CH().flatMap((c,i)=>c.l.map((l,j)=>[i,j,l])),[pi,pj,pl]=all15[day%all15.length];return `<a class="lj-tip" href="#/lesson/${pi}-${pj}"><span class="mono">Poin hari ini · ${esc(pl.t)}</span><p>“${pl.poin}”</p></a>`})()}`}
const DG=[["Aku sulit menyebutkan kelebihanku saat ditanya HRD.",0,[0,0]],["Aku mudah panik atau menunda saat menghadapi tes kerja.",0,[0,1]],["Aku tersinggung atau defensif saat dikritik.",1,[1,2]],["Aku merasa lelah dan kehilangan semangat mencari kerja.",1,[1,1]],["Aku bingung memilih lowongan atau karier yang realistis.",2,[2,2]],["Aku sulit menceritakan pengalamanku secara runtut saat wawancara.",2,[2,3]]];
function diag(){const b=q("#diag");if(!b)return;b.textContent="";const st=load().diag;
 const head=h("div",{},h("span",{class:"mono"},"Kenali kebutuhanmu"),h("h3",{},"Mulai dari bab yang paling kamu butuhkan"),h("p",{},"Jawab enam pernyataan singkat. Kami sarankan bab dan pelajaran yang cocok untukmu."));
 if(st&&st.r!=null){showRes(st);return}
 const ans=DG.map(()=>-1),go=h("button",{type:"button",class:"btn p",disabled:true},"Lihat rekomendasi");
 const list=h("div",{class:"dg-l"},DG.map(([t],i)=>{const g=h("div",{class:"lab-seg dg-s",role:"group","aria-label":t},["Jarang","Kadang","Sering"].map((x,v)=>{const bt=h("button",{type:"button","aria-pressed":"false"},x);bt.onclick=()=>{ans[i]=v;qa("button",g).forEach(y=>setP(y,y===bt));go.disabled=ans.includes(-1)};return bt}));return h("div",{class:"dg-i"},h("p",{},t),g)}));
 go.onclick=()=>{const sc=[0,1,2].map(c=>DG.reduce((a,[,k],i)=>a+(k===c?ans[i]:0),0)),mx=Math.max(...sc),r=sc.indexOf(mx);const top=DG.map((x,i)=>[ans[i],x[2]]).filter(([a,,],i)=>DG[i][1]===r).sort((a,b)=>b[0]-a[0]).map(x=>x[1]);
  const res={r,sc,les:top,t:Date.now()};upd(d=>{d.diag=res});showRes(res);pop(b)};
 b.append(head,list,h("div",{class:"lab-row"},go));
 function showRes(s){b.textContent="";const ch=CH()[s.r];const rs=h("button",{type:"button",class:"btn"},"Ulangi");rs.onclick=()=>{upd(d=>{delete d.diag});diag()};
  b.append(h("div",{},h("span",{class:"mono"},"Rekomendasi untukmu"),h("h3",{},`Fokus pertama: Bab ${s.r+1} · ${ch.t}`),h("p",{},ch.d),
   h("ul",{class:"chk dg-r"},s.les.map(([bb,l])=>h("li",{},h("a",{href:`#/lesson/${bb}-${l}`},lesT(bb,l))))),
   h("div",{class:"dg-sc","aria-hidden":"true"},s.sc.map((v,i)=>h("span",{},`Bab ${i+1}`,h("i",{style:`--v:${v/4}`})))),
   h("div",{class:"row"},h("a",{class:"btn p",href:`#/course/${s.r+1}`},`Buka Bab ${s.r+1}`),rs)))}}
function latih(){const b=q("#latc");if(!b)return;const d=GLX.load(),H=GLX.hitung(d),simN=GLD.SIM.filter(s=>d.sim[s.id]&&d.sim[s.id].best).length,dnN=GLD.DND.filter(s=>d.dnd[s.id]&&d.dnd[s.id].best.benar===d.dnd[s.id].best.n).length;
 b.innerHTML=[["#/latihan/kuis","quiz","Kuis",`${GLD.QUIZ.length} soal pilihan ganda · bobot 30%`,H.pg==null?"Belum dikerjakan":`Skor terbaik ${String(H.pg).replace(".",",")}`],["#/latihan/dnd","drag","Drag & Drop",`${GLD.DND.length} set latihan pemahaman`,`${dnN}/${GLD.DND.length} set sempurna`],["#/latihan/sim","sim","Simulasi",`${GLD.SIM.length} skenario dunia kerja · bobot 70%`,`${simN}/${GLD.SIM.length} skenario selesai`]]
  .map(([hf,ic,t,dd,s],i)=>`<a class="stp lt" href="${hf}"><span class="pd-top"><b>${pad(i+1)}</b>${ico(ic,"ico ibg")}</span><h3>${t}</h3><p>${dd}</p><p class="lt-s">${s}</p><span class="go">Mainkan →</span></a>`).join("")}
let KQ=null,ks={b:0,n:0};
function kilat(){const b=q("#kilat");if(!b)return;const Q=GLD.QUIZ;let it=KQ;if(!it){const x=Q[Math.floor(Math.random()*Q.length)];it=KQ={x,o:mix(x.o.map((t,k)=>({t,ok:k===x.a}))),a:null}}
 b.textContent="";const x=it.x;const fb=h("div",{class:"kl-fb","aria-live":"polite"});
 const g=h("div",{class:"opts"},it.o.map((o,k)=>{const bt=h("button",{type:"button",class:"opt"},h("b",{},"ABCD"[k]),h("span",{},o.t));bt.onclick=()=>{if(it.a!=null)return;it.a=k;ks.n++;if(o.ok)ks.b++;render()};return bt}));
 const nx=h("button",{type:"button",class:"btn p"},"Soal lain");nx.onclick=()=>{KQ=null;kilat()};
 function render(){qa(".opt",g).forEach((bt,k)=>{if(it.a!=null){bt.disabled=true;if(it.o[k].ok)bt.classList.add("ok");else if(k===it.a)bt.classList.add("no")}});fb.textContent="";
  if(it.a!=null){const ok=it.o[it.a].ok;fb.append(h("p",{},h("b",{},ok?"Benar! ":"Belum tepat. "),x.e),h("p",{class:"kl-s"},`Sesi ini: ${ks.b}/${ks.n} benar · Materi: `,h("a",{href:`#/lesson/${x.b}-${x.l}`},lesT(x.b,x.l))),h("div",{class:"row"},nx,h("a",{class:"btn",href:"#/latihan/kuis"},"Kuis lengkap")));if(ok)pop(fb,16)}}
 b.append(h("div",{class:"kl-h"},h("span",{class:"mono",html:ico("spark","ico isg")+" Soal kilat"}),h("small",{},`Bab ${x.b+1} · ${lesT(x.b,x.l)}`)),h("p",{class:"qq"},x.q),g,fb);render()}

/* ==================================================================
   PETA KONSEP & GLOSARIUM
   ================================================================== */
function peta(){const d=GLX.load(),C=CH(),best=GLX.hitung(d);
 const babOk=i=>C[i].l.every((l,j)=>isDone(i+"-"+j)),allOk=C.every((c,i)=>babOk(i));
 /* node: k=jenis (p langkah, m menu, t terminal, d keputusan, db data, g bantuan); x,y = pusat */
 const N=(k,x,y,w,h,t,href,ok)=>({k,x,y,w,h,t,href,ok});
 const mk=(W,H,nodes,edges,labels,groups,id)=>{
  const shape=n=>{const x0=n.x-n.w/2,y0=n.y-n.h/2,w=n.w,h=n.h;
   if(n.k==="d")return `<polygon points="${n.x},${y0} ${x0+w},${n.y} ${n.x},${y0+h} ${x0},${n.y}"/>`;
   if(n.k==="db")return `<path d="M${x0},${y0+10}a${w/2},10 0 0 1 ${w},0v${h-20}a${w/2},10 0 0 1 ${-w},0z"/><path d="M${x0},${y0+10}a${w/2},10 0 0 0 ${w},0" fill="none"/>`;
   if(n.k==="g")return `<ellipse cx="${n.x}" cy="${n.y}" rx="${w/2}" ry="${h/2}"/>`;
   return `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="${n.k==="t"?h/2:12}"/>`};
  const node=n=>{const L=n.t,ty=n.y-(L.length-1)*9+5+(n.k==="db"?8:0);
   const tx=`<text x="${n.x}" y="${ty}" text-anchor="middle">${L.map((l,i)=>`<tspan x="${n.x}" dy="${i?18:0}">${esc(l)}</tspan>`).join("")}</text>`;
   const ck=n.ok?`<g class="pk-ck"><circle cx="${n.x+n.w/2-6}" cy="${n.y-n.h/2+6}" r="10"/><path d="M${n.x+n.w/2-11},${n.y-n.h/2+6}l4,4l7,-8"/></g>`:"";
   const inner=`<g class="pk-s">${shape(n)}</g>${tx}${ck}`,lab=L.join(" ")+(n.ok?" (selesai)":"");
   return n.href?`<a class="pk-n pk-${n.k}${n.ok?" ok":""}" href="${n.href}"${n.href==="#chat"?' data-chat="1"':""} aria-label="${esc(lab)}">${inner}</a>`:`<g class="pk-n pk-${n.k}">${inner}</g>`};
  const lb=([x,y,t])=>{const w=t.length*7.4+16;return `<g class="pk-lb"><rect x="${x-w/2}" y="${y-10}" width="${w}" height="20" rx="10"/><text x="${x}" y="${y+4}" text-anchor="middle">${t}</text></g>`};
  return `<svg class="pk-svg pk-v${id}" viewBox="0 0 ${W} ${H}" role="group" aria-label="Alur belajar GrowthLab"><defs><marker id="pkar-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#1b1740"/></marker></defs>
  ${groups.map(([x,y,w,h,t])=>`<rect class="pk-grp" x="${x}" y="${y}" width="${w}" height="${h}" rx="18"/><text class="pk-gt" x="${x+w/2}" y="${y+17}" text-anchor="middle">${t}</text>`).join("")}
  ${edges.map(e=>`<path class="pk-e" d="${e[0]}"${e[1]===0?"":` marker-end="url(#pkar-${id})"`}/>`).join("")}${nodes.map(node).join("")}${labels.map(lb).join("")}</svg>`};
 const bab=(x,y,w,i)=>N("p",x,y,w,44,["Bab "+(i+1)],"#/course/"+(i+1),babOk(i));
 const D=mk(1200,890,[
  N("t",130,100,200,70,["Masuk Beranda","GrowthLab"],"#/"),N("d",350,100,180,120,["Pengguna","baru?"]),
  N("m",580,100,150,64,["Menu Panduan"],"#/tujuan"),N("p",810,100,190,78,["Cek tujuan, petunjuk","& peta konsep"],"#/tujuan"),
  N("m",1080,100,140,64,["Menu Materi /","Katalog"],"#/e-learning",allOk),N("p",1080,262,140,64,["Pilih bab","pembelajaran"],"#/course"),
  bab(624,277,124,0),bab(760,277,124,1),bab(896,277,124,2),
  N("p",640,410,190,64,["Baca konsep &","diagram"],"#/lesson/0-0"),N("p",870,410,190,64,["Aktivitas","(Coba sendiri)"],"#/lesson/0-0"),
  N("m",755,540,210,64,["Latihan & tantangan"],"#/latihan"),
  N("p",570,665,170,58,["Kuis interaktif"],"#/latihan/kuis",best.pg!=null),N("p",755,665,170,58,["Drag & drop"],"#/latihan/dnd"),N("p",940,665,170,58,["Simulasi kasus"],"#/latihan/sim",best.sim!=null),
  N("db",130,800,130,84,["Progres","disimpan"]),N("m",360,800,170,64,["Menu progres"],"#/course"),N("p",600,800,210,72,["Cek persentase belajar","& jalur belajar"],"#/course"),
  N("d",850,800,190,120,["Semua modul","selesai?"]),N("t",1075,800,160,70,["Sesi belajar","selesai"],"#/latihan",best.akhir!=null),
  N("g",130,370,110,110,["Bantuan"]),N("p",360,300,190,56,["Chat asisten AI","GrowthLab"],"#chat"),N("p",360,370,190,50,["Glosarium istilah"],"#/glosarium"),N("p",360,440,190,50,["FAQ"],"#/faq")
 ],[["M230,100H258"],["M440,100H505"],["M655,100H715"],["M905,100H985"],["M350,40V16H1080V68"],["M1080,132V230"],["M1010,262H979"],
  ["M760,308V342H640V378"],["M760,342H870V378"],["M640,442V484H755V508"],["M870,442V484H755",0],["M755,572V636"],["M755,608H570V636"],["M755,608H940V636"],
  ["M570,694V722H130V758"],["M755,694V722",0],["M940,694V722H755",0],["M195,800H271"],["M445,800H491"],["M705,800H751"],["M945,800H991"],["M850,860V874H1176V100H1154"],
  ["M185,370H240",0],["M240,300V440",0],["M240,300H263"],["M240,370H263"],["M240,440H263"]],
  [[472,90,"YA"],[700,16,"TIDAK"],[968,788,"SUDAH"],[1010,874,"BELUM"]],[[545,216,430,92,"BAB · BEBAS URUTAN"]],"d");
 const M=mk(420,1810,[
  N("t",210,50,220,60,["Masuk Beranda","GrowthLab"],"#/"),N("d",210,170,190,110,["Pengguna","baru?"]),N("m",210,300,200,56,["Menu Panduan"],"#/tujuan"),
  N("p",210,396,230,70,["Cek tujuan, petunjuk","& peta konsep"],"#/tujuan"),N("m",210,520,200,60,["Menu Materi /","Katalog"],"#/e-learning",allOk),
  N("p",210,630,220,60,["Pilih bab","pembelajaran"],"#/course"),bab(88,748,102,0),bab(210,748,102,1),bab(332,748,102,2),
  N("p",110,860,170,64,["Baca konsep &","diagram"],"#/lesson/0-0"),N("p",310,860,170,64,["Aktivitas","(Coba sendiri)"],"#/lesson/0-0"),
  N("m",210,980,220,60,["Latihan & tantangan"],"#/latihan"),
  N("p",80,1100,120,64,["Kuis","interaktif"],"#/latihan/kuis",best.pg!=null),N("p",210,1100,120,64,["Drag","& drop"],"#/latihan/dnd"),N("p",340,1100,120,64,["Simulasi","kasus"],"#/latihan/sim",best.sim!=null),
  N("db",210,1240,150,84,["Progres","disimpan"]),N("m",210,1350,200,60,["Menu progres"],"#/course"),N("p",210,1460,230,70,["Cek persentase belajar","& jalur belajar"],"#/course"),
  N("d",210,1620,200,120,["Semua modul","selesai?"]),N("t",210,1760,200,66,["Sesi belajar","selesai"],"#/latihan",best.akhir!=null)
 ],[["M210,80V115"],["M210,225V272"],["M210,328V361"],["M210,431V490"],["M305,170H402V520H312"],["M210,550V600"],["M210,660V680"],
  ["M210,790V822H110V828"],["M210,822H310V828"],["M110,892V935H210V950"],["M310,892V935H210",0],["M210,1010V1068"],["M210,1040H80V1068"],["M210,1040H340V1068"],
  ["M80,1132V1160H210",0],["M340,1132V1160H210",0],["M210,1132V1198"],["M210,1282V1320"],["M210,1380V1425"],["M210,1495V1560"],["M210,1680V1727"],["M110,1620H16V520H108"]],
  [[232,252,"YA"],[352,160,"TIDAK"],[232,1706,"SUDAH"],[62,1608,"BELUM"]],[[34,680,352,110,"BAB · BEBAS URUTAN"]],"m");
 const help=`<div class="pk-help"><b>Bantuan, kapan saja</b><a href="#chat" data-chat="1">Chat asisten AI</a><a href="#/glosarium">Glosarium istilah</a><a href="#/faq">FAQ</a></div>`;
 if(!peta.b){peta.b=1;document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("[data-chat]");if(a){e.preventDefault();const f=document.getElementById("chatfab");f&&f.click()}})}
 return `<div class="peta rv">${D}${M}${help}<p class="pk-leg"><span class="pk-lk pk-ly">Menu utama</span><span class="pk-lk">Langkah</span><span class="pk-lk pk-lt">Awal / akhir</span><span class="pk-lk pk-ld">Keputusan</span><span class="pk-lk pk-lc"><i aria-hidden="true">✓</i>Sudah selesai</span></p></div>`}
function glos(){const L=GLD.GLOS.slice().sort((a,b)=>a.t.localeCompare(b.t,"id"));
 return `<div class="sbar rv"><input id="gq" type="search" placeholder="Cari istilah, misalnya: burnout, STAR, bias…" aria-label="Cari istilah"><div class="chips" id="gch" role="group" aria-label="Saring bab"><button class="chip" aria-pressed="true" data-b="-1">Semua</button>${CH().map((c,i)=>`<button class="chip" aria-pressed="false" data-b="${i}">${esc(c.t)}</button>`).join("")}</div></div>
 <p class="mono gl-n" id="gn" aria-live="polite"></p><div class="gl" id="glist">${L.map(g=>`<div class="gl-i" data-b="${g.b}" data-s="${esc((g.t+" "+g.a).toLowerCase())}"><dt><i>${esc(g.t)}</i></dt><dd>${esc(g.a)}</dd><a href="#/lesson/${g.b}-${g.l}">${esc(lesT(g.b,g.l))} →</a></div>`).join("")}</div><p id="gnone" hidden>Istilah tidak ditemukan.</p>`}
function bindGlos(){let qv="",bb=-1;const I=qa("#glist .gl-i");const draw=()=>{let n=0;I.forEach(e=>{const s=(bb<0||+e.dataset.b===bb)&&(!qv||e.dataset.s.includes(qv));e.hidden=!s;if(s)n++});q("#gn").textContent=`${n} istilah`;q("#gnone").hidden=!!n};
 q("#gq").oninput=e=>{qv=e.target.value.toLowerCase().trim();draw()};qa("#gch .chip").forEach(c=>c.onclick=()=>{bb=+c.dataset.b;qa("#gch .chip").forEach(x=>setP(x,x===c));draw()});draw()}

return{lesson,labsAt,home,peta,glos,bindGlos,ico,LABS,W,load};
})();
