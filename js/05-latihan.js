/* ==========================================================================
   GL v7 · MESIN LATIHAN (#/latihan)
   - Kuis bergaya Quizizz: layar permainan penuh, hitung mundur, timer per soal,
     poin + bonus kecepatan, beruntun, power-up, musik & efek suara.
   - Drag & drop interaktif: kartu diseret dengan efek pegas dan miring, kotak
     tujuan menyala, urutan disusun ulang langsung (sortable), animasi periksa.
   - Simulasi monokrom: mesin tik, indikator kesiapan, layar akibat tiap
     keputusan, peta cabang cerita, suara latar.
   Nilai TIDAK berubah: kuis = benar ÷ jumlah soal × 100 (waktu habis = salah),
   simulasi = rata-rata skor jalur. Poin kuis hanya untuk keseruan.
   Hasil disimpan di localStorage "gl-latihan" (format v5), pengaturan suara di "gl-sfx".
   Semua suara disintesis dengan Web Audio (tanpa file audio).
   ========================================================================== */
const GLX=(()=>{
const KEY="gl-latihan",q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const r1=n=>Math.round(n*10)/10,fmt=n=>n==null?"–":r1(n).toLocaleString("id-ID",{maximumFractionDigits:1});
const pad=n=>String(n).padStart(2,"0"),LT="ABCD",nf=n=>Math.round(n).toLocaleString("id-ID");
const mix=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const rmq=()=>matchMedia("(prefers-reduced-motion:reduce)").matches,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ping=(x,y,n)=>{try{boom(x,y,n)}catch(e){}},say=m=>{try{toast(m)}catch(e){}},obs=()=>{try{window.observe&&window.observe()}catch(e){}};
const chapT=b=>GLD.COURSE.chapters[b].t,lesT=(b,l)=>GLD.COURSE.chapters[b].l[l].t;
const lesA=(b,l)=>`<a href="#/lesson/${b}-${l}">${esc(lesT(b,l))}</a>`;
const dur=ms=>{const s=Math.round(ms/1000);return `${Math.floor(s/60)}:${pad(s%60)}`};
const pick1=a=>a[Math.random()*a.length|0];

/* ---------- penyimpanan ---------- */
/* data dibaca/ditulis lewat GLS.db: berversi, tervalidasi, cadangan memori bila penyimpanan diblokir */
const load=()=>GLS.db.load(),save=d=>GLS.db.save(d);
const cap=(a,n=40)=>{while(a.length>n)a.shift()};

/* ---------- level & kategori ---------- */
const level=v=>GLS.score.pita(v);
function hitung(d=load()){const sc=GLS.score,pg=d.kuis.best.all?d.kuis.best.all.score:null;
 const asp=GLD.SIM.map(s=>{const b=d.sim[s.id]&&d.sim[s.id].best;return{s,w:s.w,v:b?b.score:null,legacy:!!(b&&b.legacy)}});
 const sim=sc.simulasi(asp),akhir=sc.akhir(pg,sim),{ki,capped}=sc.kategori(akhir,pg);
 return{pg,asp,sim,akhir,ki,capped}}

/* ==================================================================
   MOTION · Web Animations API (mati otomatis saat prefers-reduced-motion)
   ================================================================== */
const EZ="cubic-bezier(.2,.72,.24,1)",SPR="cubic-bezier(.34,1.56,.64,1)";
function A(el,kf,o){if(!el||!el.animate||rmq())return null;try{return el.animate(kf,Object.assign({duration:420,easing:EZ,fill:"backwards"},o))}catch(e){return null}}
const UP=[{opacity:0,transform:"translateY(18px)"},{opacity:1,transform:"none"}];
function enter(root,gap=60){if(!root)return;[...root.children].slice(0,12).forEach((e,i)=>A(e,UP,{duration:520,delay:i*gap}))}
function countUp(el,to,o={}){if(!el||to==null)return;const fr=o.from||0,d=o.d||900,f=o.f||fmt;if(rmq()){el.textContent=f(to);return}const t0=performance.now();
 (function st(t){const k=clamp((t-t0)/d,0,1),e=1-Math.pow(1-k,3);el.textContent=f(fr+(to-fr)*e);if(k<1)requestAnimationFrame(st)})(t0)}
const wait=ms=>new Promise(r=>setTimeout(r,rmq()?Math.min(ms,80):ms));
const shake=el=>A(el,[{transform:"translateX(0)"},{transform:"translateX(-9px)"},{transform:"translateX(8px)"},{transform:"translateX(-5px)"},{transform:"translateX(3px)"},{transform:"none"}],{duration:460});
const bump=(el,s=1.08)=>A(el,[{transform:"scale(1)"},{transform:`scale(${s})`},{transform:"none"}],{duration:420,easing:SPR});

/* ---------- ikon (SVG garis, mengikuti warna teks) ---------- */
const I=(d,f)=>`<svg class="gi${f?" f":""}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const IC={x:I('<path d="M6 6l12 12M18 6L6 18"/>'),note:I('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
 vol:I('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 010 6M19 6.5a8 8 0 010 11"/>'),flame:I('<path d="M12 2c.8 3.6 6 5.6 6 11.6A6 6 0 016 13.6c0-2.8 1.6-4.6 2.8-5.6.2 2 1 3 2.2 3.2C11.3 8 10.4 5 12 2z"/>',1),
 bolt:I('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',1),snow:I('<path d="M12 2v20M4 7l16 10M20 7L4 17M9 4l3 2 3-2M9 20l3-2 3 2"/>'),shield:I('<path d="M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5z"/>',1),
 half:I('<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 010 18z" fill="currentColor"/>'),check:I('<path d="M4 12.5l5 5L20 6.5"/>'),cross:I('<path d="M6 6l12 12M18 6L6 18"/>'),
 clock:I('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>'),star:I('<path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/>',1),
 play:I('<path d="M7 4.5v15l12.5-7.5z"/>',1),arrow:I('<path d="M5 12h14M13 6l6 6-6 6"/>'),up:I('<path d="M6 15l6-6 6 6"/>'),down:I('<path d="M6 9l6 6 6-6"/>'),
 redo:I('<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>'),grip:I('<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',1)};

/* ==================================================================
   SUARA · disintesis langsung (Web Audio). Musik kuis, suara latar simulasi, efek.
   ================================================================== */
const SND=(()=>{
 const PK="gl-sfx",P={sfx:true,music:true,timer:45,pu:true};try{Object.assign(P,JSON.parse(localStorage.getItem(PK)||"{}"))}catch(e){}
 const keep=()=>{try{localStorage.setItem(PK,JSON.stringify(P))}catch(e){}};
 let C=null,FXG=null,MUG=null,NB=null,mu=null,want=null;
 function init(){if(C)return C;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  try{C=new AC();const M=C.createGain();M.gain.value=.85;M.connect(C.destination);FXG=C.createGain();FXG.connect(M);MUG=C.createGain();MUG.gain.value=.5;MUG.connect(M);
   NB=C.createBuffer(1,C.sampleRate,C.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(e){C=null}return C}
 function wake(){const c=init();if(c&&c.state!=="running")try{c.resume()}catch(e){}return c}
 function tone(f,d,o={}){if(!C)return;const t=C.currentTime+(o.at||0),g=C.createGain(),s=C.createOscillator();s.type=o.type||"sine";s.frequency.setValueAtTime(f,t);if(o.to)s.frequency.exponentialRampToValueAtTime(o.to,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.v||.15,t+(o.a||.006));g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(g);g.connect(o.out||FXG);s.start(t);s.stop(t+d+.05)}
 function hiss(d,o={}){if(!C||!NB)return;const t=C.currentTime+(o.at||0),s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=NB;f.type=o.ft||"bandpass";f.frequency.setValueAtTime(o.f||1200,t);if(o.to)f.frequency.exponentialRampToValueAtTime(o.to,t+d);f.Q.value=o.q||.8;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.v||.1,t+(o.a||.01));g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(o.out||FXG);s.start(t,Math.random()*.4);s.stop(t+d+.05)}
 const N=m=>440*Math.pow(2,(m-69)/12);
 const FX={
  tap(){tone(880,.05,{type:"triangle",v:.07})},
  sel(){tone(520,.08,{type:"triangle",v:.1,to:820})},
  lock(){tone(330,.08,{type:"square",v:.045});tone(495,.1,{type:"square",v:.04,at:.05})},
  ok(){[72,76,79,84].forEach((m,i)=>tone(N(m),.28,{type:"triangle",v:.15,at:i*.075}));tone(N(96),.6,{v:.04,at:.3})},
  no(){tone(N(50),.22,{type:"sawtooth",v:.07});tone(N(45),.42,{type:"sawtooth",v:.07,at:.14});hiss(.2,{f:300,v:.04})},
  tick(u){tone(u?1500:1100,.03,{type:"square",v:u?.05:.03})},
  count(){tone(N(74),.18,{type:"square",v:.07})},
  go(){[79,83,86,91].forEach(m=>tone(N(m),.45,{type:"square",v:.035}));hiss(.4,{f:800,to:5000,v:.05})},
  streak(){tone(300,.4,{type:"sawtooth",to:1500,v:.045});[84,88,91,96].forEach((m,i)=>tone(N(m),.16,{type:"triangle",v:.09,at:.22+i*.06}))},
  power(){[88,91,95,100,103].forEach((m,i)=>tone(N(m),.18,{v:.08,at:i*.045}))},
  timeup(){tone(440,.6,{type:"square",to:110,v:.06})},
  fan(){[[60,64,67],[62,65,69],[64,67,72]].forEach((c,i)=>c.forEach(m=>tone(N(m+12),i<2?.18:.9,{type:"square",v:.035,at:i*.16})));[72,76,79,84].forEach((m,i)=>tone(N(m+12),.22,{type:"triangle",v:.06,at:.52+i*.08}))},
  sad(){[67,63,60].forEach((m,i)=>tone(N(m),.4,{type:"triangle",v:.08,at:i*.22}))},
  pick(){tone(380,.09,{type:"triangle",to:760,v:.1});hiss(.05,{f:3000,v:.02})},
  drop(){tone(170,.14,{to:80,v:.22});hiss(.06,{f:1500,v:.04})},
  back(){hiss(.28,{f:2400,to:500,v:.06});tone(500,.2,{type:"triangle",to:250,v:.04})},
  over(){tone(1250,.025,{type:"square",v:.02})},
  swap(){tone(600,.07,{type:"triangle",to:900,v:.06});tone(900,.07,{type:"triangle",to:620,v:.05,at:.05})},
  step(k){tone(N(72+((k||0)%8)*2),.13,{type:"triangle",v:.09})},
  dud(){tone(150,.12,{type:"triangle",v:.1})},
  type(){tone(1900+Math.random()*900,.014,{type:"square",v:.009})},
  whoosh(){hiss(.45,{f:250,to:3500,v:.05})},
  stamp(){hiss(.09,{f:180,ft:"lowpass",v:.35});tone(70,.25,{v:.28})},
  good(){[76,83,88].forEach((m,i)=>tone(N(m),.7,{v:.07,at:i*.11}))},
  mid(){tone(N(69),.35,{type:"triangle",v:.06});tone(N(72),.35,{type:"triangle",v:.05,at:.12})},
  bad(){tone(N(45),.55,{v:.18,to:N(40)});hiss(.15,{f:200,ft:"lowpass",v:.1})}};
 function play(k,a){if(!P.sfx||!wake())return;try{FX[k]&&FX[k](a)}catch(e){}}
 /* musik kuis: progresi I–V–vi–IV, 124 bpm, dijadwalkan dengan lookahead */
 const PROG=[[60,64,67],[55,59,62],[57,60,64],[53,57,60]];
 function qstep(i,t){const bar=(i>>4)&3,s=i&15,c=PROG[bar],at=Math.max(0,t-C.currentTime),nt=(m,d,ty,v)=>tone(N(m),d,{type:ty,v,at,out:MUG});
  if(s%4===0)nt(c[0]-24,.24,"triangle",.24);if(s%4===2)nt(c[0]-12,.12,"triangle",.1);if(s%8===4)c.forEach(m=>nt(m,.12,"square",.022));
  if(s%2===0)hiss(.035,{f:8000,ft:"highpass",v:.022,at,out:MUG});if(s%2===0&&bar%2===1)nt(c[[0,1,2,1,0,2,1,2][(s>>1)&7]]+12,.1,"sine",.035);if(s===14&&bar===3)nt(c[2]+12,.2,"sine",.05)}
 function start(kind){if(!wake())return;mu={kind};
  if(kind==="quiz"){const spb=60/124/4;mu.i=0;mu.nt=C.currentTime+.08;mu.iv=setInterval(()=>{if(!C||!mu)return;while(mu&&mu.nt<C.currentTime+.15){qstep(mu.i,mu.nt);mu.i++;mu.nt+=spb}},30)}
  else{const g=C.createGain(),t=C.currentTime;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.55,t+2.5);g.connect(MUG);
   const lp=C.createBiquadFilter();lp.type="lowpass";lp.frequency.value=420;lp.connect(g);
   const os=[45,52,57].map((m,i)=>{const o=C.createOscillator(),og=C.createGain();o.type=i?"sine":"triangle";o.frequency.value=N(m);o.detune.value=(i-1)*7;og.gain.value=i?.05:.07;o.connect(og);og.connect(lp);o.start();return o});
   const lfo=C.createOscillator(),lg=C.createGain();lfo.frequency.value=.07;lg.gain.value=180;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
   const ns=C.createBufferSource(),nfl=C.createBiquadFilter(),ng=C.createGain();ns.buffer=NB;ns.loop=true;nfl.type="lowpass";nfl.frequency.value=900;ng.gain.value=.03;ns.connect(nfl);nfl.connect(ng);ng.connect(g);ns.start();
   mu.g=g;mu.nodes=[...os,lfo,ns];mu.iv=setInterval(()=>{if(Math.random()<.45)tone(N(pick1([69,72,76,79,81])),3,{v:.022,a:.03,out:MUG})},2600)}}
 function stopM(){if(!mu)return;const m=mu;mu=null;clearInterval(m.iv);if(m.g&&C){const t=C.currentTime;try{m.g.gain.cancelScheduledValues(t);m.g.gain.setValueAtTime(Math.max(m.g.gain.value,.0002),t);m.g.gain.exponentialRampToValueAtTime(.0001,t+.6)}catch(e){}setTimeout(()=>m.nodes.forEach(n=>{try{n.stop()}catch(e){}}),700)}}
 function apply(){const k=P.music?want:null;if(mu&&mu.kind===k)return;stopM();if(k)start(k)}
 function music(k){want=k||null;apply()}
 function set(k,v){P[k]=v;keep();if(k==="music")apply()}
 document.addEventListener("visibilitychange",()=>{if(!C)return;try{document.hidden?C.suspend():C.resume()}catch(e){}});
 return{play,music,wake,set,P,keep}})();
const sndCtl=()=>`<span class="gx-snd"><button type="button" data-snd="music" aria-pressed="${SND.P.music}" aria-label="Musik" title="Musik">${IC.note}</button><button type="button" data-snd="sfx" aria-pressed="${SND.P.sfx}" aria-label="Efek suara" title="Efek suara">${IC.vol}</button></span>`;

/* ==================================================================
   KUIS · gaya Quizizz (layar penuh)
   ================================================================== */
let QZ=null,OV=null,INERT=[],TQ=0;
const MODES=()=>[["all","Gabungan",GLD.QUIZ.length]].concat(GLD.COURSE.chapters.map((c,i)=>["b"+i,"Bab "+(i+1)+" · "+c.t,GLD.QUIZ.filter(x=>x.b===i).length]));
const modeName=m=>(MODES().find(x=>x[0]===m)||[0,"Kuis"])[1];
const PU={x2:["2×","Poin ganda","Poin soal ini dikali dua jika benar","bolt"],frz:["Beku","Bekukan waktu","Timer soal ini berhenti","snow"],shd:["Perisai","Perisai beruntun","Jika salah, beruntunmu tidak hilang","shield"],ff:["50:50","Hapus dua","Menghapus dua pilihan yang salah","half"]};
const CHEER={ok:["Mantap!","Keren!","Tepat sekali!","Luar biasa!","Jago!","Pertahankan!"],no:["Hampir!","Tidak apa-apa, baca penjelasannya","Belajar dari sini","Tetap semangat!"],to:["Sedikit lebih cepat, ya!","Waktunya habis!"]};
const running=()=>QZ&&QZ.list&&!QZ.done;

function quizHome(){const d=load(),P=GLD.PASS_MCQ,pb=d.kuis.ptsBest||{};
 return `${running()?`<div class="gq-resume"><div><span class="mono">Kuis belum selesai</span><b>${esc(modeName(QZ.m))} · soal ${Math.min(QZ.i+1,QZ.list.length)} dari ${QZ.list.length} · ${nf(QZ.pts)} poin</b></div><div class="gq-rr"><button class="btn p" data-qz="resume">Lanjutkan</button><button class="btn" data-qz="drop">Batalkan</button></div></div>`:""}
 <div class="lx-intro"><h3>Kuis pilihan ganda</h3><p>Setiap soal punya empat pilihan (A–D) dan satu jawaban benar. Urutan soal dan pilihan diacak di setiap percobaan. Benar = 1, salah = 0, nilai = benar ÷ jumlah soal × 100. Batas lulus: <b>${P}</b>.</p><p class="lx-note">Nilai yang masuk ke Nilai Akhir (bobot 30%) adalah skor terbaik dari mode <b>Gabungan</b>. Mode per bab bisa dipakai untuk berlatih. Saat bermain ada timer, poin, beruntun, dan power-up. Poin hanya untuk keseruan; nilaimu tetap dihitung dari jumlah jawaban benar.</p></div>
 <div class="gq-modes">${MODES().map(([m,t,n],i)=>{const b=d.kuis.best[m];return `<button class="gq-mode m${i}" data-qz="open" data-m="${m}" style="--i:${i}"><span class="gq-mtag">${m==="all"?"Masuk nilai akhir":"Latihan per bab"}</span><b>${esc(t)}</b><small>${n} soal${b?` · terbaik ${fmt(b.score)} ${b.score>=P?"(lulus)":"(belum lulus)"}`:" · belum dikerjakan"}${pb[m]?` · rekor ${nf(pb[m])} poin`:""}</small><span class="gq-play">${IC.play}${b?"Main lagi":"Main"}</span><i class="gq-deco" aria-hidden="true"></i></button>`}).join("")}</div>
 <p class="qz-kbd" style="margin-top:14px">Tips: saat bermain, tekan 1–4 atau A–D untuk menjawab, Enter untuk lanjut, dan Esc untuk keluar.</p>`}
function reviewHTML(){return `<div class="gq-rv">${QZ.list.map((it,i)=>{const a=QZ.ans[i],good=a>=0&&it.o[a].ok,kk=it.o.findIndex(o=>o.ok),st=good?"ok":a<0?"to":"no";
 return `<details class="${st}"><summary><span class="gq-rn">${pad(i+1)}</span><span class="gq-rs">${good?IC.check:a<0?IC.clock:IC.cross}</span><span class="gq-rq">${esc(it.x.q)}</span></summary><div class="gq-rb"><p><b>Jawabanmu:</b> ${a<0?"tidak menjawab (waktu habis)":`${LT[a]}. ${esc(it.o[a].t)}`}</p>${good?"":`<p><b>Kunci:</b> ${LT[kk]}. ${esc(it.o[kk].t)}</p>`}<p><b>Penjelasan:</b> ${esc(it.x.e)}</p><p class="lx-src">Materi: ${lesA(it.x.b,it.x.l)}</p></div></details>`}).join("")}</div>`}
const qScore=()=>{const n=QZ.list.length,ben=QZ.ans.filter((a,i)=>a>=0&&QZ.list[i].o[a].ok).length;return{n,ben,sc:ben/n*100}};
function quizRes(){const{n,ben,sc}=qScore(),P=GLD.PASS_MCQ,ok=sc>=P;
 return `<div class="qres gq-pres"><div><span class="mono">${esc(modeName(QZ.m))} · hasil terakhir</span><div class="lx-big" data-cu="${sc}">${fmt(sc)}</div><span class="badge ${ok?"ok":"no"}">${ok?"Lulus":"Belum lulus"}</span><p>Benar ${ben} dari ${n} soal · ${ben}/${n} × 100 = ${fmt(sc)} · batas lulus ${P} · ${nf(QZ.pts)} poin · beruntun terbaik ${QZ.maxS} · waktu ${dur((QZ.t1||Date.now())-QZ.t0)}</p>
 <div class="row"><button class="btn p" data-qz="open" data-m="${QZ.m}">Main lagi</button><button class="btn" data-qz="home">Pilih mode lain</button></div></div></div>
 <h3 class="lx-h">Pembahasan</h3>${reviewHTML()}`}
function drawQuiz(fx){const p=q("#ltp");if(!p||cur!=="kuis")return;p.innerHTML=QZ&&QZ.done?quizRes():quizHome();obs();
 const b=q(".lx-big[data-cu]",p);if(b&&fx)countUp(b,+b.dataset.cu,{d:1100});if(fx)enter(p)}
function quizClick(e){const b=e.target.closest("[data-qz]");if(!b)return;const a=b.dataset.qz;
 if(a==="open"){if(running()&&QZ.ans.length&&!confirm("Kuis yang belum selesai akan dibatalkan. Mulai kuis baru?"))return;SND.wake();SND.play("tap");lobby(b.dataset.m)}
 else if(a==="resume"&&running()){SND.wake();ovOpen();paint()}
 else if(a==="drop"||a==="home"){QZ=null;SND.play("tap");drawQuiz(true)}}

/* ---------- overlay layar penuh ---------- */
function ovOpen(){if(!OV){OV=document.createElement("div");OV.id="gqz";OV.className="gq";OV.hidden=true;OV.setAttribute("role","dialog");OV.setAttribute("aria-modal","true");OV.setAttribute("aria-label","Kuis GrowthLab");OV.setAttribute("data-lenis-prevent","");
  OV.innerHTML=`<div class="gq-bg" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="gq-in" id="gqin"></div>`;document.body.appendChild(OV);OV.addEventListener("click",ovClick)}
 if(OV._open)return;clearTimeout(OV._t);OV._open=true;OV.hidden=false;document.documentElement.classList.add("gx-lock");
 INERT=qa("body>*").filter(e=>e!==OV&&!/^(SCRIPT|STYLE|CANVAS)$/.test(e.tagName)&&!e.inert&&!e.classList.contains("toast")&&!e.classList.contains("cf"));INERT.forEach(e=>e.inert=true);
 try{window.__lenis&&window.__lenis.stop()}catch(_){}OV.scrollTop=0;requestAnimationFrame(()=>OV.classList.add("on"))}
function ovClose(silent){if(!OV||!OV._open)return;OV._open=false;qTimerStop();SND.music(null);const c=q("#gqcf");c&&c.remove();OV.classList.remove("on");INERT.forEach(e=>e.inert=false);INERT=[];document.documentElement.classList.remove("gx-lock");
 try{window.__lenis&&window.__lenis.start()}catch(_){}
 OV._t=setTimeout(()=>{if(!OV._open){OV.hidden=true;q("#gqin").innerHTML=""}},rmq()?0:320);
 if(QZ&&!QZ.list)QZ=null;if(!silent){drawQuiz(true);const f=q("#ltp");f&&f.focus({preventScroll:true})}}
const ovOn=()=>!!(OV&&OV._open);
function paint(){const box=q("#gqin");if(!box||!QZ)return;
 if(QZ.phase==="lobby"){box.innerHTML=lobbyHTML();const s=q(".gq-start",box);s&&s.focus({preventScroll:true});return}
 if(QZ.phase==="res"){paintRes();return}
 if(QZ.phase==="count"){countdown();return}
 if(QZ.phase==="lock"||QZ.phase==="next"){setTimeout(paint,650);return}
 showQ(true)}

function lobby(m){QZ={m,phase:"lobby",lim:SND.P.timer,pu:SND.P.pu};ovOpen();paint();A(q(".gq-lcard"),[{opacity:0,transform:"translateY(30px) scale(.94)"},{opacity:1,transform:"none"}],{duration:520,easing:SPR})}
function lobbyHTML(){const m=QZ.m,mi=MODES().find(x=>x[0]===m),b=load().kuis.best[m],tm=[[0,"Santai"],[20,"20 dtk"],[30,"30 dtk"],[45,"45 dtk"],[60,"60 dtk"]];
 return `<div class="gq-top"><span class="gq-brand"><i aria-hidden="true">G</i>GrowthLab <b>Kuis</b></span><div class="gq-ctl">${sndCtl()}<button class="gq-ib" data-qz="close" aria-label="Tutup">${IC.x}</button></div></div>
 <div class="gq-lobby"><div class="gq-lcard">
  <span class="gq-tag">${m==="all"?"Masuk nilai akhir":"Latihan per bab"}</span><h2>${esc(mi[1])}</h2>
  <p class="gq-lmeta"><span>${mi[2]} soal</span><span>Batas lulus ${GLD.PASS_MCQ}</span>${b?`<span>Terbaik ${fmt(b.score)}</span>`:""}</p>
  <div class="gq-set"><span>Timer per soal</span><div class="gq-seg" role="radiogroup" aria-label="Timer per soal">${tm.map(([v,t])=>`<button type="button" role="radio" aria-checked="${QZ.lim===v}" data-qz="tm" data-v="${v}">${t}</button>`).join("")}</div></div>
  <div class="gq-set"><span>Power-up</span><button type="button" class="gq-sw" role="switch" aria-checked="${QZ.pu}" data-qz="pu"><i aria-hidden="true"></i>${QZ.pu?"Aktif":"Mati"}</button></div>
  <ul class="gq-rules"><li>Jawaban benar = 600 poin + bonus kecepatan (maks. 400) + bonus beruntun.</li><li>${QZ.lim?"Jika waktu habis, soal dihitung salah.":"Mode santai: tanpa batas waktu. Bonus kecepatan tetap dihitung."}</li>${QZ.pu?`<li>Setiap 3 jawaban benar berturut-turut, kamu mendapat satu power-up.${m==="all"?" Power-up 50:50 tidak tersedia di mode Gabungan agar nilai akhir tetap adil.":""}</li>`:""}<li>Poin hanya untuk keseruan. Nilai = benar ÷ jumlah soal × 100.</li></ul>
  <button type="button" class="gq-start" data-qz="go">${IC.play}<span>Mulai</span></button><small class="gq-hint">Tekan Enter untuk mulai</small>
 </div></div>`}
function begin(){const m=QZ.m,lim=QZ.lim,pu=QZ.pu,pool=m==="all"?GLD.QUIZ:GLD.QUIZ.filter(x=>"b"+x.b===m);SND.wake();
 QZ={m,lim,pu,i:0,ans:[],times:[],parts:[],pts:0,stk:0,maxS:0,inv:{},act:{},t0:Date.now(),phase:"count",list:mix(pool).map(x=>({x,o:mix(x.o.map((t,k)=>({t,ok:k===x.a})))}))};
 countdown()}
async function countdown(){QZ.phase="count";const tok=QZ.tok={};const box=q("#gqin");box.innerHTML=`${hudHTML()}<div class="gq-count" data-qz="skip"><b id="gqc" aria-live="assertive">3</b><small>Bersiap…</small></div>`;
 for(const t of ["3","2","1","Mulai!"]){if(QZ.tok!==tok||!ovOn())return;const b=q("#gqc");if(!b)return;b.textContent=t;b.className=t.length>1?"go":"";
  A(b,[{transform:"scale(2.4)",opacity:0},{transform:"scale(1)",opacity:1,offset:.35},{transform:"scale(.92)",opacity:.9}],{duration:740,easing:"cubic-bezier(.2,.8,.3,1)",fill:"forwards"});SND.play(t.length>1?"go":"count");await wait(t.length>1?560:700)}
 if(QZ.tok!==tok||!ovOn())return;QZ.tok=null;SND.music("quiz");showQ()}
function skipCount(){if(!QZ||QZ.phase!=="count")return;QZ.tok=null;SND.play("go");SND.music("quiz");showQ()}

function hudHTML(){const n=QZ.list.length;return `<div class="gq-hud"><div class="gq-tbar${QZ.lim?"":" off"}${QZ.act&&QZ.act.frz?" frz":""}" aria-hidden="true"><i id="gqtb"></i></div><div class="gq-row">
 <span class="gq-pill" id="gqn" aria-label="Soal ${Math.min(QZ.i+1,n)} dari ${n}">${Math.min(QZ.i+1,n)}<small>/${n}</small></span>
 ${QZ.lim?`<span class="gq-pill gq-time${QZ.act&&QZ.act.frz?" frz":""}" id="gqt">${IC.clock}<b>${QZ.lim}</b></span>`:""}
 <span class="gq-pill gq-stk${QZ.stk>=2?" on":""}" id="gqs" title="Beruntun">${IC.flame}<b>${QZ.stk}</b></span><span class="gq-sp"></span>
 <span class="gq-pill gq-pts" id="gqp"><b>${nf(QZ.pts)}</b><small>poin</small></span>
 <div class="gq-ctl">${sndCtl()}<button class="gq-ib" data-qz="quit" aria-label="Keluar dari kuis">${IC.x}</button></div></div></div>`}
function puHTML(){if(!QZ.pu)return "";const ks=Object.keys(PU).filter(k=>QZ.inv[k]>0||QZ.act[k]);
 return `<div class="gq-pu" id="gqpu">${ks.length?ks.map(k=>`<button type="button" class="gq-pub p-${k}${QZ.act[k]?" act":""}" data-qz="pu-use" data-p="${k}" title="${PU[k][2]}"${QZ.act[k]||QZ.phase!=="q"?" disabled":""}><i>${IC[PU[k][3]]}</i><span>${PU[k][1]}${QZ.act[k]?" · aktif":""}</span>${QZ.inv[k]>1?`<em>${QZ.inv[k]}</em>`:""}</button>`).join(""):`<span class="gq-puh">${IC.bolt} Jawab benar 3× berturut-turut untuk mendapat power-up</span>`}</div>`}
function qHTML(){const it=QZ.list[QZ.i],x=it.x,a=QZ.ans[QZ.i],ans=a!=null,kk=it.o.findIndex(o=>o.ok);
 return `${hudHTML()}<div class="gq-stage" id="gqst"><div class="gq-qc"><span class="gq-chip">Bab ${x.b+1} · ${esc(lesT(x.b,x.l))}</span><p id="gqq" tabindex="-1">${esc(x.q)}</p></div>
  <div class="gq-opts" role="group" aria-labelledby="gqq">${it.o.map((o,k)=>{const cl=ans?(k===kk?" ok":k===a?" no":" fade"):"";return `<button type="button" class="gq-o${cl}" data-qz="ans" data-k="${k}" style="--c:var(--q${k});--i:${k}"${ans||QZ.hide&&QZ.hide.has(k)?" disabled":""}${QZ.hide&&QZ.hide.has(k)?" data-gone":""}><b aria-hidden="true">${LT[k]}</b><span>${esc(o.t)}</span>${ans&&(k===kk||k===a)?`<i class="gq-mk">${k===kk?IC.check:IC.cross}</i>`:""}</button>`}).join("")}</div>
 </div>${puHTML()}<div class="gq-ban" id="gqban" aria-live="assertive"></div><div class="gq-sheet" id="gqsh"></div>`}
function showQ(keep){const box=q("#gqin");if(!box)return;
 if(!keep){QZ.phase="q";QZ.hide=null;QZ.act.x2=false;QZ.act.frz=false;QZ.left=QZ.lim*1000;QZ.el=0}
 box.innerHTML=qHTML();OV.scrollTop=0;
 if(QZ.phase==="q"){A(q(".gq-qc"),[{opacity:0,transform:"translateY(-26px) scale(.96)"},{opacity:1,transform:"none"}],{duration:480,easing:SPR});
  qa(".gq-o").forEach((o,i)=>A(o,[{opacity:0,transform:"translateY(46px) scale(.9)"},{opacity:1,transform:"none"}],{duration:480,easing:SPR,delay:150+i*70}));
  const f=q("#gqq");f&&f.focus({preventScroll:true});QZ.ready=performance.now()+(rmq()?0:420);QZ.ls=null;qTimerStart()}
 else{const it=QZ.list[QZ.i],a=QZ.ans[QZ.i],ok=a>=0&&it.o[a].ok;QZ.phase="rev";sheet(ok,a,it.o.findIndex(o=>o.ok),true)}}
function qTimerStart(){qTimerStop();let last=performance.now();const L=QZ.lim*1000;
 const fr=t=>{if(!QZ||QZ.phase!=="q"||!ovOn()){TQ=0;return}const dt=Math.min(t-last,120);last=t;
  if(!QZ.paused&&t>=QZ.ready){QZ.el+=dt;if(L&&!QZ.act.frz)QZ.left=Math.max(0,QZ.left-dt)}
  if(L){const b=q("#gqtb");if(b){const r=QZ.left/L;b.style.transform=`scaleX(${r})`;b.parentNode.dataset.lv=r<.25?"2":r<.5?"1":"0"}
   const s=Math.ceil(QZ.left/1000),tt=q("#gqt b");if(tt&&tt.textContent!==String(s))tt.textContent=s;
   if(s!==QZ.ls){QZ.ls=s;if(s<=5&&s>0&&!QZ.act.frz&&!QZ.paused&&t>=QZ.ready){SND.play("tick",s<=3);bump(q("#gqt"),1.22)}}
   if(QZ.left<=0){TQ=0;answer(-1);return}}
  TQ=requestAnimationFrame(fr)};TQ=requestAnimationFrame(fr)}
function qTimerStop(){if(TQ)cancelAnimationFrame(TQ);TQ=0}
function answer(k){if(!QZ||QZ.phase!=="q")return;if(k>=0&&QZ.hide&&QZ.hide.has(k))return;QZ.phase="lock";qTimerStop();QZ.ans[QZ.i]=k;QZ.times[QZ.i]=QZ.el;
 const os=qa(".gq-o");os.forEach((b,j)=>{b.disabled=true;b.classList.add(j===k?"pick":"dim")});qa(".gq-pub").forEach(b=>b.disabled=true);
 if(k>=0){SND.play("lock");A(os[k],[{transform:"scale(1)"},{transform:"scale(.93)"},{transform:"scale(1.02)"}],{duration:320,fill:"forwards"})}else SND.play("timeup");
 setTimeout(()=>reveal(k),k>=0?(rmq()?60:560):320)}
function reveal(k){if(!QZ||QZ.phase!=="lock")return;const it=QZ.list[QZ.i],ok=k>=0&&it.o[k].ok,kk=it.o.findIndex(o=>o.ok),stk0=QZ.stk;let gain=0,saved=false;QZ.phase="rev";
 if(ok){QZ.stk++;QZ.maxS=Math.max(QZ.maxS,QZ.stk);const L=QZ.lim*1000,fr=L?QZ.left/L:clamp(1-QZ.el/30000,0,1),bon=Math.round(40*fr)*10,sb=QZ.stk>=2?Math.min(QZ.stk-1,5)*100:0;
  gain=(600+bon+sb)*(QZ.act.x2?2:1);QZ.pts+=gain;QZ.parts[QZ.i]={bon,sb,x2:!!QZ.act.x2}}
 else if(QZ.act.shd&&QZ.stk>0){saved=true;QZ.act.shd=false}else QZ.stk=0;
 const award=ok&&QZ.pu&&QZ.stk%3===0?pick1(["x2","shd"].concat(QZ.lim?["frz"]:[]).concat(QZ.m!=="all"?["ff"]:[])):null;if(award)QZ.inv[award]=(QZ.inv[award]||0)+1;
 if(!ovOn())return;
 const os=qa(".gq-o");os.forEach((b,j)=>{b.classList.remove("dim","pick");b.classList.add(j===kk?"ok":j===k?"no":"fade");if(j===kk||j===k)b.insertAdjacentHTML("beforeend",`<i class="gq-mk">${j===kk?IC.check:IC.cross}</i>`)});
 bump(os[kk],1.06);if(k>=0&&!ok)shake(os[k]);SND.play(ok?"ok":"no");
 if(ok&&os[kk]){const r=os[kk].getBoundingClientRect();ping(r.left+r.width/2,r.top+r.height/3,30)}
 const ban=q("#gqban");if(ban){ban.className="gq-ban on "+(ok?"ok":k<0?"to":"no");
  ban.innerHTML=`<div class="gq-ban-in"><span class="gq-ban-ic">${ok?IC.check:k<0?IC.clock:IC.cross}</span><b>${ok?"Benar!":k<0?"Waktu habis!":"Salah"}</b>${ok?`<span class="gq-gain" id="gqg">+${nf(gain)}</span>`:""}<em>${esc(pick1(CHEER[ok?"ok":k<0?"to":"no"]))}</em></div>`;
  A(ban.firstChild,[{transform:"translateY(-140%) scale(.8)"},{transform:"translateY(10%) scale(1.04)",offset:.6},{transform:"none"}],{duration:560,easing:EZ})}
 if(ok)setTimeout(()=>flyPts(gain),rmq()?0:560);
 setTimeout(()=>streakFx(stk0,saved),ok?380:200);
 if(award)setTimeout(()=>{SND.play("power");popMsg(`${IC[PU[award][3]]} Power-up baru: ${PU[award][1]}`,"pw");const pu=q("#gqpu");if(pu){pu.outerHTML=puHTML();qa("#gqpu .gq-pub").forEach(b=>b.disabled=true);const nb=q(`.gq-pub.p-${award}`);nb&&A(nb,[{transform:"scale(0) rotate(-200deg)"},{transform:"none"}],{duration:620,easing:SPR})}},1000);
 setTimeout(()=>sheet(ok,k,kk),rmq()?0:700)}
function flyPts(g){const s=q("#gqg"),t=q("#gqp");if(!t)return;const fin=()=>{countUp(t.querySelector("b"),QZ.pts,{from:QZ.pts-g,d:600,f:nf});bump(t,1.2)};
 if(!s||rmq()||!OV)return fin();const a=s.getBoundingClientRect(),b=t.getBoundingClientRect(),f=document.createElement("span");f.className="gq-fly";f.textContent=s.textContent;f.style.left=a.left+"px";f.style.top=a.top+"px";OV.appendChild(f);
 const an=f.animate([{transform:"none",opacity:1},{transform:`translate(${(b.left-a.left)*.45}px,${(b.top-a.top)*.5-50}px) scale(1.35)`,offset:.45},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px) scale(.5)`,opacity:.3}],{duration:720,easing:"cubic-bezier(.5,0,.3,1)",fill:"forwards"});
 const end=()=>{f.remove();fin()};an.finished.then(end,end)}
function streakFx(prev,saved){const p=q("#gqs");if(!p)return;p.querySelector("b").textContent=QZ.stk;p.classList.toggle("on",QZ.stk>=2);
 if(QZ.stk>=2&&QZ.stk>prev){A(p,[{transform:"scale(1)"},{transform:"scale(1.4) rotate(-8deg)"},{transform:"none"}],{duration:560,easing:SPR});if(QZ.stk>=3){SND.play("streak");popMsg(`${IC.flame} ${QZ.stk} benar beruntun!`,"stk")}}
 else if(saved)popMsg(`${IC.shield} Perisai menjaga beruntunmu (${QZ.stk})`,"shd");
 else if(prev>=2&&!QZ.stk)A(p,[{opacity:1},{opacity:.2},{opacity:1}],{duration:500})}
function popMsg(h,c){if(!OV)return;const m=document.createElement("div");m.className="gq-pop "+c;m.setAttribute("role","status");m.innerHTML=h;OV.appendChild(m);
 A(m,[{opacity:0,transform:"translate(-50%,24px) scale(.8)"},{opacity:1,transform:"translate(-50%,0) scale(1)",offset:.18},{opacity:1,transform:"translate(-50%,0) scale(1)",offset:.82},{opacity:0,transform:"translate(-50%,-24px)"}],{duration:1900,fill:"forwards",easing:"ease-out"});setTimeout(()=>m.remove(),1950)}
function sheet(ok,k,kk,quiet){const it=QZ.list[QZ.i],x=it.x,last=QZ.i+1>=QZ.list.length,sh=q("#gqsh"),p=QZ.parts[QZ.i];if(!sh)return;
 sh.innerHTML=`<div class="gq-sh-in ${ok?"ok":k<0?"to":"no"}"><div class="gq-exp"><p><b>${ok?"Jawabanmu benar.":k<0?"Kamu belum menjawab.":`Jawabanmu: ${LT[k]}.`}</b> ${ok?"":`Jawaban yang benar: <b>${LT[kk]}</b>. `}${esc(x.e)}</p>${ok&&p?`<small class="gq-brk">600 dasar + ${nf(p.bon)} kecepatan${p.sb?` + ${nf(p.sb)} beruntun`:""}${p.x2?" · ×2 poin ganda":""}</small>`:""}<span class="lx-src">Materi: ${lesA(x.b,x.l)}</span></div>
 <button type="button" class="gq-next" data-qz="next" id="gqnext">${last?"Lihat hasil":"Soal berikutnya"}${IC.arrow}</button></div>`;
 sh.classList.add("on");if(!quiet)A(sh.firstChild,[{transform:"translateY(115%)"},{transform:"none"}],{duration:480,easing:SPR});
 const nb=q("#gqnext");nb&&nb.focus({preventScroll:true})}
function qNext(){if(!QZ||QZ.phase!=="rev")return;QZ.phase="next";SND.play("tap");const st=q("#gqst");
 const go=()=>{QZ.i++;if(QZ.i>=QZ.list.length){qFinish();return}showQ()};
 if(rmq()||!st)return go();const sh=q("#gqsh .gq-sh-in"),bn=q("#gqban .gq-ban-in");sh&&A(sh,[{transform:"none"},{transform:"translateY(115%)"}],{duration:240,fill:"forwards"});bn&&A(bn,[{opacity:1},{opacity:0,transform:"translateY(-30px)"}],{duration:220,fill:"forwards"});
 const a=A(st,[{opacity:1,transform:"none"},{opacity:0,transform:"translateX(-70px)"}],{duration:260,fill:"forwards",easing:"ease-in"});a?a.finished.then(go,go):go()}
function usePU(k){if(!QZ||QZ.phase!=="q"||!(QZ.inv[k]>0))return;QZ.inv[k]--;SND.play("power");
 if(k==="ff"){const it=QZ.list[QZ.i];QZ.hide=new Set(mix(it.o.map((o,j)=>o.ok?-1:j).filter(j=>j>=0)).slice(0,2));qa(".gq-o").forEach((b,j)=>{if(QZ.hide.has(j)){b.disabled=true;b.dataset.gone=""}})}
 else{QZ.act[k]=true;if(k==="frz"){const t=q(".gq-tbar");t&&t.classList.add("frz");const p=q("#gqt");p&&p.classList.add("frz")}}
 const pu=q("#gqpu");if(pu)pu.outerHTML=puHTML();popMsg(`${IC[PU[k][3]]} ${PU[k][1]} dipakai`,"pw")}
function qFinish(){qTimerStop();SND.music(null);const{n,ben,sc}=qScore(),d=load(),b=d.kuis.best[QZ.m];
 QZ.t1=Date.now();const rec={score:r1(sc),benar:ben,n,t:Date.now(),dur:QZ.t1-QZ.t0,poin:QZ.pts,streak:QZ.maxS};
 d.kuis.ptsBest=d.kuis.ptsBest||{};QZ.prevPts=d.kuis.ptsBest[QZ.m]||0;if(QZ.pts>QZ.prevPts)d.kuis.ptsBest[QZ.m]=QZ.pts;
 if(!b||rec.score>=b.score)d.kuis.best[QZ.m]=rec;d.kuis.hist.push(Object.assign({m:QZ.m},rec));cap(d.kuis.hist);save(d);window.GLG&&GLG.emit("quiz",{m:QZ.m,score:rec.score,benar:ben,n});QZ.done=true;QZ.phase="res";
 paintRes(true);if(QZ.m==="all")nilai(true);drawQuiz()}
function resHTML(){const{n,ben,sc}=qScore(),P=GLD.PASS_MCQ,ok=sc>=P,to=QZ.ans.filter(a=>a<0).length,avg=QZ.times.reduce((a,b)=>a+(b||0),0)/n;
 const bd=[[ben===n,"Sempurna","Semua jawaban benar"],[QZ.maxS>=5,"Beruntun "+QZ.maxS,"Lima jawaban benar berturut-turut atau lebih"],[avg<10000&&ok,"Kilat","Rata-rata kurang dari 10 detik per soal"],[ok,"Lulus","Nilai mencapai batas lulus "+P],[QZ.prevPts>0&&QZ.pts>QZ.prevPts,"Rekor poin baru","Melewati rekor poinmu sebelumnya"]].filter(x=>x[0]);
 return `<div class="gq-top"><span class="gq-brand"><i aria-hidden="true">G</i>GrowthLab <b>Kuis</b></span><div class="gq-ctl">${sndCtl()}<button class="gq-ib" data-qz="close" aria-label="Tutup">${IC.x}</button></div></div>
 <div class="gq-res"><div class="gq-rcard"><span class="gq-tag">${esc(modeName(QZ.m))} · selesai</span>
  <div class="gq-ring${ok?"":" low"}" style="--a:${ben/n}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="v" cx="60" cy="60" r="52" pathLength="100"/></svg><div><b id="gqsc">${fmt(sc)}</b><small>nilai</small></div></div>
  <span class="badge ${ok?"ok":"no"}">${ok?"Lulus":"Belum lulus"}</span><p class="gq-rline">Benar ${ben} dari ${n} soal · ${ben}/${n} × 100 = ${fmt(sc)} · batas lulus ${P}</p>
  <div class="gq-stats">${[["Benar",ben,"ok"],["Salah",n-ben-to,"no"],["Waktu habis",to,"to"],["Poin",nf(QZ.pts),"pt"],["Beruntun terbaik",QZ.maxS,"st"],["Waktu",dur(QZ.t1-QZ.t0),"tm"]].map(([a,b,c],i)=>`<div class="s-${c}" style="--i:${i}"><b>${b}</b><small>${a}</small></div>`).join("")}</div>
  ${bd.length?`<div class="gq-badges">${bd.map((x,i)=>`<span title="${esc(x[2])}" style="--i:${i}">${IC.star}${esc(x[1])}</span>`).join("")}</div>`:""}
  <div class="gq-rbtn"><button type="button" class="gq-start sm" data-qz="again">${IC.redo}<span>Main lagi</span></button><button type="button" class="gq-gh" data-qz="review">Lihat pembahasan</button><button type="button" class="gq-gh" data-qz="close">Tutup</button></div>
 </div><h3 class="gq-rh" id="gqrv">Pembahasan</h3>${reviewHTML()}</div>`}
function paintRes(fx){const box=q("#gqin");if(!box)return;box.innerHTML=resHTML();OV.scrollTop=0;const{sc}=qScore(),ok=sc>=GLD.PASS_MCQ;
 A(q(".gq-rcard"),[{opacity:0,transform:"translateY(40px) scale(.94)"},{opacity:1,transform:"none"}],{duration:600,easing:SPR});
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const r=q(".gq-ring");r&&r.classList.add("go")}));countUp(q("#gqsc"),sc,{d:1400});
 const f=q(".gq-start.sm");f&&f.focus({preventScroll:true});
 if(fx){SND.play(ok?"fan":"sad");if(ok)setTimeout(()=>{ping(innerWidth*.3,innerHeight*.3,34);ping(innerWidth*.7,innerHeight*.3,34)},350)}}
function confirmQuit(){if(!OV||q("#gqcf"))return;QZ.paused=true;const m=document.createElement("div");m.id="gqcf";m.className="gq-cf";
 m.innerHTML=`<div class="gq-cfb" role="alertdialog" aria-modal="true" aria-labelledby="gqcft" aria-describedby="gqcfd"><b id="gqcft">Keluar dari kuis?</b><p id="gqcfd">Kamu bisa melanjutkannya nanti dari tab Kuis selama halaman ini belum ditutup. Percobaan ini belum disimpan sebagai nilai.</p><div><button type="button" class="gq-gh dk" data-qz="cf-quit">Keluar</button><button type="button" class="gq-start sm" data-qz="cf-stay"><span>Lanjut main</span></button></div></div>`;
 OV.appendChild(m);A(m.firstChild,[{transform:"scale(.85)",opacity:0},{transform:"none",opacity:1}],{duration:320,easing:SPR});const s=q("[data-qz=cf-stay]",m);s&&s.focus()}
function cfClose(){const m=q("#gqcf");m&&m.remove();if(QZ)QZ.paused=false;const f=q("#gqnext")||q("#gqq");f&&f.focus({preventScroll:true})}
function ovClick(e){const b=e.target.closest("[data-qz]");if(!b||!QZ)return;const a=b.dataset.qz;
 if(a==="close"||a==="quit"){if(running()&&QZ.phase!=="lobby")confirmQuit();else{SND.play("tap");ovClose()}}
 else if(a==="cf-stay"){SND.play("tap");cfClose()}else if(a==="cf-quit"){cfClose();ovClose()}
 else if(a==="go"){SND.wake();SND.play("tap");begin()}else if(a==="skip")skipCount()
 else if(a==="tm"){QZ.lim=+b.dataset.v;SND.set("timer",QZ.lim);SND.play("tap");paint()}
 else if(a==="pu"){QZ.pu=!QZ.pu;SND.set("pu",QZ.pu);SND.play("tap");paint()}
 else if(a==="ans")answer(+b.dataset.k);else if(a==="next")qNext();else if(a==="pu-use")usePU(b.dataset.p)
 else if(a==="again"){SND.play("tap");QZ={m:QZ.m,lim:QZ.lim,pu:QZ.pu,phase:"lobby"};begin()}
 else if(a==="review"){const h=q("#gqrv");h&&OV.scrollTo({top:h.offsetTop-20,behavior:rmq()?"auto":"smooth"})}}
function quizKey(e){if(!ovOn()||!QZ||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key,tg=e.target,onBtn=tg&&tg.closest&&tg.closest("button,a,input,summary");
 if(k==="Escape"){e.preventDefault();if(q("#gqcf"))cfClose();else if(running()&&QZ.phase!=="lobby")confirmQuit();else ovClose();return}
 if(k==="Tab"){const f=qa("button:not(:disabled),a[href],summary",OV).filter(x=>x.offsetParent&&!x.closest("[hidden]"));if(f.length){if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}}return}
 if(q("#gqcf"))return;
 if(QZ.phase==="lobby"&&k==="Enter"&&!onBtn){e.preventDefault();SND.play("tap");begin();return}
 if(QZ.phase==="count"&&(k==="Enter"||k===" ")){e.preventDefault();skipCount();return}
 if(QZ.phase==="q"){const i="1234".indexOf(k)>=0?"1234".indexOf(k):"abcd".indexOf((k||"").toLowerCase());if(i>=0&&k.length===1){e.preventDefault();answer(i)}return}
 if(QZ.phase==="rev"&&(k==="Enter"||k===" ")&&!onBtn){e.preventDefault();qNext()}}

/* ==================================================================
   DRAG & DROP · "group sort" (kelompokkan) & "rank order" (urutkan)
   ================================================================== */
let DD=null,DR=null,supp=false,DTI=0;
function ddStart(id){const S=GLD.DND.find(s=>s.id===id)||GLD.DND[0],ord=S.mode==="order";let seq=mix(S.items.map((_,i)=>i));
 if(ord)for(let t=0;t<8&&seq.every((v,j)=>S.items[v].k===String(j+1));t++)seq=mix(seq);
 DD={S,ord,bins:ord?[]:S.bins,cap:ord?0:(S.cap||0),order:seq,seq:ord?seq.slice():null,place:{},sel:null,checked:false,rv:false,res:"",moves:0,t0:0,t1:0,rot:S.items.map(()=>+(Math.random()*5-2.5).toFixed(1))}}
const posOf=i=>DD.ord?String(DD.seq.indexOf(i)+1):DD.place[i];
const ddEl=()=>DD&&DD.t0?(DD.t1||Date.now())-DD.t0:0;
function ddTimerGo(){if(!DD.t0)DD.t0=Date.now();if(DTI||DD.t1)return;DTI=setInterval(()=>{const t=q("#gdtm");if(!t||cur!=="dnd"||!DD||DD.t1){ddTimerStop();return}t.textContent=dur(ddEl())},1000)}
function ddTimerStop(){clearInterval(DTI);DTI=0}
function ddCard(i){const it=DD.S.items[i],z=posOf(i),st=DD.checked&&z!=null?(it.k===z?" ok":" no"):"",sh=st&&DD.rv?" show":"",mk=st?`<i class="gd-mk" aria-hidden="true">${st===" ok"?IC.check:IC.cross}</i>`:"";
 if(DD.ord){const p=DD.seq.indexOf(i),n=DD.seq.length;return `<li class="gd-card gd-r${st}${sh}${DD.sel===i?" sel":""}" data-i="${i}" tabindex="0" aria-roledescription="kartu urutan" aria-describedby="gdkh" aria-label="Posisi ${p+1} dari ${n}: ${esc(it.t)}${st?st===" ok"?" (benar)":" (belum tepat)":""}"><span class="gd-num" aria-hidden="true">${p+1}</span><span class="gd-txt">${esc(it.t)}</span>${mk}<span class="gd-mv"><button type="button" data-mv="-1" tabindex="-1" aria-label="Naikkan"${p===0?" disabled":""}>${IC.up}</button><button type="button" data-mv="1" tabindex="-1" aria-label="Turunkan"${p===n-1?" disabled":""}>${IC.down}</button></span></li>`}
 return `<button type="button" class="gd-card${st}${sh}${DD.sel===i?" sel":""}" data-i="${i}" style="--r:${z==null?DD.rot[i]:0}deg" aria-pressed="${DD.sel===i}"><span class="gd-grip">${IC.grip}</span><span class="gd-txt">${esc(it.t)}</span>${mk}</button>`}
function ddHTML(){const d=load(),S=DD.S,b=d.dnd[S.id],n=S.items.length,pool=DD.order.filter(i=>DD.place[i]==null),placed=n-pool.length,ben=DD.checked?S.items.filter((it,i)=>posOf(i)===it.k).length:0;
 const sets=`<div class="gd-sets" role="group" aria-label="Pilih set">${GLD.DND.map((s,i)=>{const o=d.dnd[s.id],pf=o&&o.best.benar===o.best.n;return `<button type="button" class="gd-set${pf?" done":""}" data-dd="set" data-id="${s.id}" aria-pressed="${s.id===S.id}"><span>${pad(i+1)}</span>${esc(s.t)}${pf?IC.check:""}</button>`}).join("")}</div>`;
 const head=`<div class="gd-head"><div class="gd-ht"><span class="mono">${DD.ord?"Susun urutan":"Kelompokkan kartu"} · ${n} kartu</span><h3>${esc(S.t)}</h3><p>${S.p} <span class="lx-src">Materi: ${lesA(S.les[0],S.les[1])}</span></p></div>
  <div class="gd-hud"><div class="gd-st"><b id="gdpl">${DD.checked?ben+"/"+n:DD.ord?DD.moves:placed+"/"+n}</b><small>${DD.checked?"benar":DD.ord?"langkah":"ditempatkan"}</small></div><div class="gd-st"><b id="gdtm">${dur(ddEl())}</b><small>waktu</small></div><div class="gd-st"><b>${b?b.best.benar+"/"+b.best.n:"–"}</b><small>terbaik${b&&b.bestT?" · "+dur(b.bestT):""}</small></div>${sndCtl()}</div></div>
  <div class="gd-prog" aria-hidden="true"><i style="--p:${DD.checked?ben/n:DD.ord?0:placed/n}"></i></div>`;
 const body=DD.ord?`<p class="lx-note">Seret kartu ke atas atau ke bawah untuk menyusun urutan; kartu lain otomatis bergeser. Bisa juga memakai tombol panah di kartu, atau ketuk satu kartu lalu ketuk posisi tujuannya.</p><p class="sr" id="gdkh">Tekan Spasi atau Enter untuk mengangkat kartu, panah atas atau bawah untuk memindahkannya, lalu Spasi atau Enter untuk menaruh.</p><div class="gd-board gd-rb"><ol class="gd-rank" aria-label="Urutan langkah">${DD.seq.map(ddCard).join("")}</ol></div>`
  :`<p class="lx-note">Seret kartu ke kotak yang tepat; kotak menyala saat kartu siap dilepas. Bisa juga tanpa menyeret: ketuk/klik kartu, lalu ketuk kotak tujuan. Kartu yang sudah ditaruh bisa dipindah lagi.${DD.cap?" Setiap kotak hanya muat satu kartu; kartu lama otomatis kembali ke tumpukan.":""}</p>
  <div class="gd-board"><div class="gd-pool dz" data-z="pool"><button type="button" class="gd-tgt" data-z="pool"><span>Tumpukan kartu</span><small>${pool.length?pool.length+" kartu tersisa":"Semua kartu sudah ditempatkan"}${DD.sel!=null&&DD.place[DD.sel]!=null?" · ketuk untuk mengembalikan":""}</small></button><div class="gd-deck">${pool.map(ddCard).join("")||`<p class="gd-empty">${IC.check}<span>Semua kartu sudah di kotak. Tekan <b>Periksa jawaban</b>!</span></p>`}</div></div>
  <div class="gd-bins" style="--n2:${Math.min(DD.bins.length,2)}">${DD.bins.map((bn,j)=>{const inn=DD.order.filter(i=>DD.place[i]===bn.k);return `<div class="gd-bin dz" data-z="${esc(bn.k)}" style="--h:${j}"><button type="button" class="gd-tgt" data-z="${esc(bn.k)}"><span>${esc(bn.t)}</span><em class="gd-cnt">${inn.length}${DD.cap?"/"+DD.cap:""}</em><small>${DD.sel!=null?"Ketuk untuk menaruh di sini":inn.length?"":"Seret kartu ke sini"}</small></button><div class="gd-list">${inn.map(ddCard).join("")}</div></div>`}).join("")}</div></div>`;
 const row=`<div class="gd-row"><button type="button" class="btn p gd-check${(DD.ord||!pool.length)&&!DD.checked?" ready":""}" data-dd="check"${DD.shown?" disabled":""}>Periksa jawaban</button><button type="button" class="btn" data-dd="reset">${IC.redo} Acak ulang</button>${DD.checked&&!DD.perfect&&!DD.ord?`<button type="button" class="btn" data-dd="back">Kembalikan yang salah</button>`:""}${DD.checked&&!DD.perfect?`<button type="button" class="chip" data-dd="show">Tunjukkan jawaban</button>`:""}<span class="dres gd-res" aria-live="polite">${DD.res||""}</span></div><p class="sr" id="dlive" aria-live="assertive"></p>`;
 return `<div class="gd${DD.sel!=null?" picking":""}" data-mode="${S.mode}">${sets}${head}${body}${row}</div>`}
function drawDD(fi,o={}){const p=q("#ltp");if(!p||cur!=="dnd")return;const fl=o.flip&&!rmq(),old={};
 if(fl)qa(".gd-card",p).forEach(e=>{old[e.dataset.i]=e.getBoundingClientRect()});if(o.from)old[o.from.i]=o.from.r;
 p.innerHTML=ddHTML();
 if(fl)qa(".gd-card",p).forEach(e=>{const i=+e.dataset.i,r=old[i];if(!r)return;const nr=e.getBoundingClientRect(),dx=r.left-nr.left,dy=r.top-nr.top;if(Math.abs(dx)<1&&Math.abs(dy)<1)return;
  const me=o.from&&o.from.i===i,rot=DD.ord||DD.place[i]!=null?0:DD.rot[i];
  e.animate([{transform:`translate(${dx}px,${dy}px) rotate(${me?o.from.rot||0:rot}deg) scale(${me?1.06:1})`},{transform:`rotate(${rot}deg)`}],{duration:me?360:460,easing:"cubic-bezier(.2,.9,.3,1.12)"})});
 if(fi!=null){const f=q(`.gd-card[data-i="${fi}"]`,p);f&&f.focus({preventScroll:true})}
 if(o.bump)bump(q(`.gd-bin[data-z="${o.bump}"]`,p),1.03)}
function deal(){if(rmq())return;qa(".gd-card").forEach((c,j)=>{const i=+c.dataset.i,rot=DD.ord||DD.place[i]!=null?0:DD.rot[i];
 A(c,[{opacity:0,transform:`translateY(-36px) rotate(${rot-12}deg) scale(.8)`},{opacity:1,transform:`rotate(${rot}deg)`}],{duration:460,easing:SPR,delay:j*45})})}
const live=m=>{const l=q("#dlive");if(l)l.textContent=m};
function ddDirty(){DD.checked=false;DD.rv=false;DD.res="";DD.perfect=false;DD.tok=null}
function ddPlace(i,z,from){if(i==null)return;const S=DD.S;z=z==="pool"?null:z;const prev=DD.place[i];let kick=[];
 if(z!=null&&DD.cap){const occ=DD.order.filter(k=>DD.place[k]===z&&k!==i);if(occ.length>=DD.cap){kick=occ.slice(0,occ.length-DD.cap+1);kick.forEach(k=>delete DD.place[k])}}
 if(z==null)delete DD.place[i];else DD.place[i]=z;if(prev!==z)DD.moves++;DD.sel=null;ddDirty();ddTimerGo();
 drawDD(i,{flip:true,from:from?{i,r:from.r,rot:from.rot}:null,bump:z});SND.play(z==null?"back":"drop");if(kick.length)setTimeout(()=>SND.play("swap"),140);
 const bn=DD.bins.find(b=>b.k===z);live(`“${S.items[i].t}” ditaruh di ${bn?bn.t:"tumpukan kartu"}.${kick.length?" Kartu sebelumnya kembali ke tumpukan.":""}`);
 if(Object.keys(DD.place).length===S.items.length){bump(q(".gd-check"),1.1);SND.play("sel")}}
function rankMove(i,to,focus){const a=DD.seq,p=a.indexOf(i);to=clamp(to,0,a.length-1);if(p===to)return;a.splice(p,1);a.splice(to,0,i);DD.moves++;ddDirty();ddTimerGo();drawDD(focus?i:null,{flip:true});SND.play("swap");live(`Dipindah ke posisi ${to+1} dari ${a.length}.`)}
function ddCheck(){if(DD.shown)return;const S=DD.S,n=S.items.length,ben=S.items.filter((it,i)=>posOf(i)===it.k).length,sisa=DD.ord?0:n-Object.keys(DD.place).length;
 DD.checked=true;DD.rv=false;DD.perfect=ben===n;DD.res=`${ben} dari ${n} benar${sisa?` · ${sisa} kartu belum ditempatkan`:""}`;if(DD.perfect&&!DD.t1)DD.t1=Date.now();if(DD.perfect)ddTimerStop();
 const d=load(),o=d.dnd[S.id]||{best:{benar:0,n},n:0};o.n++;if(ben>=o.best.benar)o.best={benar:ben,n,t:Date.now()};if(DD.perfect&&DD.t0){const el=DD.t1-DD.t0;if(!o.bestT||el<o.bestT)o.bestT=el}d.dnd[S.id]=o;save(d);window.GLG&&GLG.emit("dnd",{id:S.id,benar:ben,n});
 DD.sel=null;drawDD();live(DD.res);
 const cs=qa(".gd-card.ok,.gd-card.no").sort((a,b)=>{const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return x.top-y.top||x.left-y.left});const tok=DD.tok={};
 const fin=()=>{if(DD.tok!==tok)return;DD.rv=true;cs.forEach(c=>c.classList.add("show"));
  if(DD.perfect){stamp("Sempurna!");SND.play("fan");const r=q(".gd-row");if(r){const b=r.getBoundingClientRect();ping(b.left+140,b.top,34)}say("Sempurna! Semua jawaban tepat.")}else{SND.play(ben/n>=.5?"mid":"no");say(DD.res+".")}
  const rs=q(".gd-res");rs&&A(rs,[{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],{duration:320})};
 if(rmq())return fin();
 cs.forEach((c,j)=>setTimeout(()=>{if(DD.tok!==tok)return;c.classList.add("show");const ok=c.classList.contains("ok");ok?bump(c,1.06):shake(c);SND.play(ok?"step":"dud",j)},120+j*115));
 setTimeout(fin,260+cs.length*115)}
function stamp(t){const b=q(".gd-board");if(!b)return;const s=document.createElement("div");s.className="gd-stamp";s.setAttribute("aria-hidden","true");s.textContent=t;b.appendChild(s);SND.play("stamp");
 A(s,[{opacity:0,transform:"translate(-50%,-50%) scale(2.6) rotate(-16deg)"},{opacity:1,transform:"translate(-50%,-50%) scale(1) rotate(-8deg)"}],{duration:440,easing:"cubic-bezier(.3,1.4,.5,1)"})}
function ddBackWrong(){const w=Object.keys(DD.place).map(Number).filter(i=>DD.place[i]!==DD.S.items[i].k);w.forEach(i=>delete DD.place[i]);ddDirty();DD.res=`${w.length} kartu dikembalikan ke tumpukan. Coba lagi!`;drawDD(null,{flip:true});SND.play("back");live(DD.res)}
function ddShow(){const S=DD.S;DD.tok=null;if(DD.ord)DD.seq=S.items.map((_,i)=>i).sort((a,b)=>+S.items[a].k-+S.items[b].k);else S.items.forEach((it,i)=>DD.place[i]=it.k);
 DD.checked=true;DD.rv=true;DD.perfect=true;DD.shown=true;DD.res="Ini susunan yang benar. Tekan Acak ulang untuk mencoba lagi dari awal.";DD.sel=null;drawDD(null,{flip:true});SND.play("whoosh");live(DD.res)}
/* seret: pegas + miring mengikuti kecepatan; urutan bergeser langsung */
function ddDown(e){const el=e.target.closest(".gd-card");if(!el||e.button>0||e.target.closest("[data-mv]")||DD.shown)return;DR={i:+el.dataset.i,el,x:e.clientX,y:e.clientY,id:e.pointerId,on:false,touch:e.pointerType==="touch"};
 /* layar sentuh: tahan sebentar untuk mengangkat kartu, usapan biasa tetap menggulir halaman */
 if(DR.touch){const d=DR;d.hold=setTimeout(()=>{if(DR!==d||d.on)return;d.armed=true;try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}dragBegin()},220)}}
function ddMove(e){if(!DR||e.pointerId!==DR.id)return;if(!DR.on){const m=Math.hypot(e.clientX-DR.x,e.clientY-DR.y);if(DR.touch){if(m>8){clearTimeout(DR.hold);DR=null}return}if(m<6)return;dragBegin()}
 e.preventDefault();DR.cx=e.clientX;DR.cy=e.clientY;
 if(DD.ord)rankOver();else{const z=document.elementFromPoint(e.clientX,e.clientY),dz=z&&z.closest(".gd .dz");if(dz!==DR.z){qa(".gd .dz.over").forEach(x=>x.classList.remove("over"));if(dz){dz.classList.add("over");SND.play("over")}DR.z=dz}}}
function dragBegin(){const r=DR.el.getBoundingClientRect(),g=DR.el.cloneNode(true);g.classList.add("gd-ghost");g.classList.remove("sel","ok","no","show");g.removeAttribute("data-i");g.removeAttribute("tabindex");g.setAttribute("aria-hidden","true");
 g.style.width=r.width+"px";g.style.height=r.height+"px";DR.dx=DR.x-r.left;DR.dy=DR.y-r.top;DR.px=r.left;DR.py=r.top;DR.rot=0;DR.s=1;DR.cx=DR.x;DR.cy=DR.y;
 g.style.transform=`translate(${r.left}px,${r.top}px)`;document.body.appendChild(g);DR.g=g;DR.on=true;DR.el.classList.add("gd-ph");document.body.classList.add("dnd-on");const w=q(".gd");w&&w.classList.add("dragging");
 if(DD.sel!=null){DD.sel=null;qa(".gd-card.sel").forEach(c=>c.classList.remove("sel"))}try{window.__lenis&&window.__lenis.stop()}catch(_){}SND.play("pick");ddTimerGo();requestAnimationFrame(dragLoop)}
function dragLoop(){if(!DR||!DR.on)return;const k=rmq()?1:.36,tx=DR.cx-DR.dx,ty=DR.cy-DR.dy,nx=DR.px+(tx-DR.px)*k,ny=DR.py+(ty-DR.py)*k,vx=nx-DR.px;DR.px=nx;DR.py=ny;
 DR.rot+=(clamp(vx*1.2,-14,14)-DR.rot)*.2;DR.s+=(1.06-DR.s)*.25;DR.g.style.transform=`translate(${nx}px,${ny}px) rotate(${rmq()?0:DR.rot}deg) scale(${rmq()?1:DR.s})`;
 const y=DR.cy,E=80;if(y<E)scrollBy(0,-Math.ceil((E-y)/5));else if(y>innerHeight-E)scrollBy(0,Math.ceil((y-innerHeight+E)/5));if(DD.ord&&(y<E||y>innerHeight-E))rankOver();
 requestAnimationFrame(dragLoop)}
function rankOver(){const L=q(".gd-rank");if(!L||!DR)return;const all=qa(".gd-card",L),cs=all.filter(c=>c!==DR.el);let ref=null;for(const c of cs){const r=c.getBoundingClientRect();if(DR.cy<r.top+r.height/2){ref=c;break}}
 if(ref===DR.el.nextElementSibling||(!ref&&!DR.el.nextElementSibling))return;
 const old=new Map(all.map(c=>[c,c.getBoundingClientRect()]));L.insertBefore(DR.el,ref);
 qa(".gd-card",L).forEach((c,j)=>{c.querySelector(".gd-num").textContent=j+1;if(c===DR.el){const gn=DR.g&&DR.g.querySelector(".gd-num");if(gn)gn.textContent=j+1}if(c===DR.el||rmq())return;const o=old.get(c),n=c.getBoundingClientRect(),dy=o.top-n.top;if(Math.abs(dy)<1)return;c.getAnimations().forEach(a=>a.cancel());c.animate([{transform:`translateY(${dy}px)`},{transform:"none"}],{duration:260,easing:EZ})});SND.play("over")}
function landGhost(g,to,cb){if(rmq()||!to||!to.isConnected){g.remove();cb();return}const b=to.getBoundingClientRect();
 const an=g.animate([{transform:g.style.transform},{transform:`translate(${b.left}px,${b.top}px) rotate(0deg) scale(1)`}],{duration:300,easing:"cubic-bezier(.2,.9,.3,1.1)",fill:"forwards"});const end=()=>{g.remove();cb()};an.finished.then(end,end)}
function ddUp(e){if(!DR||e.pointerId!==DR.id)return;const d=DR;DR=null;clearTimeout(d.hold);if(!d.on)return;supp=true;setTimeout(()=>supp=false,0);
 document.body.classList.remove("dnd-on");const w=q(".gd");w&&w.classList.remove("dragging");qa(".gd .dz.over").forEach(x=>x.classList.remove("over"));try{window.__lenis&&window.__lenis.start()}catch(_){}
 const cancel=e.type==="pointercancel";
 if(DD.ord){const ids=qa(".gd-rank .gd-card").map(c=>+c.dataset.i),ch=ids.some((v,j)=>v!==DD.seq[j]);
  landGhost(d.g,d.el,()=>{d.el.classList.remove("gd-ph");if(ch){DD.seq=ids;DD.moves++;ddDirty();drawDD();live(`Dipindah ke posisi ${ids.indexOf(d.i)+1} dari ${ids.length}.`)}});SND.play(ch?"drop":"back");return}
 if(!cancel&&d.z){const r=d.g.getBoundingClientRect();d.g.remove();ddPlace(d.i,d.z.dataset.z,{r,rot:d.rot});return}
 landGhost(d.g,d.el,()=>d.el.classList.remove("gd-ph"));SND.play("back")}
function ddClick(e){const b=e.target.closest("[data-dd]");
 if(b){const a=b.dataset.dd;if(a==="set"){SND.play("tap");ddStart(b.dataset.id);drawDD();enter(q(".gd"),40);deal()}else if(a==="reset"){ddStart(DD.S.id);drawDD();SND.play("whoosh");deal();say("Kartu diacak ulang.")}else if(a==="check")ddCheck();else if(a==="back")ddBackWrong();else if(a==="show")ddShow();return}
 if(DD.shown)return;
 const mv=e.target.closest("[data-mv]");if(mv){const c=mv.closest(".gd-card"),i=+c.dataset.i;rankMove(i,DD.seq.indexOf(i)+(+mv.dataset.mv),false);return}
 if(supp)return;
 const it=e.target.closest(".gd-card");if(it){const i=+it.dataset.i;
  if(DD.sel!=null&&DD.sel!==i){if(DD.ord){const s=DD.sel;DD.sel=null;rankMove(s,DD.seq.indexOf(i),true);return}const z=it.closest(".dz");if(z&&z.dataset.z!=="pool"){ddPlace(DD.sel,z.dataset.z);return}}
  DD.sel=DD.sel===i?null:i;SND.play(DD.sel!=null?"sel":"tap");drawDD(i);if(DD.sel!=null){bump(q(`.gd-card[data-i="${i}"]`),1.04);live(DD.ord?`Dipilih: “${DD.S.items[i].t}”. Ketuk kartu lain untuk memindahkannya ke posisi itu.`:`Dipilih: “${DD.S.items[i].t}”. Sekarang pilih kotak tujuan.`)}return}
 const t=e.target.closest(".gd-tgt")||e.target.closest(".dz");if(t&&DD.sel!=null){const z=(t.dataset.z!=null?t:t.closest(".dz")).dataset.z;ddPlace(DD.sel,z)}}
function ddKey(e){const c=e.target.closest&&e.target.closest(".gd-rank .gd-card");if(!c||!DD||!DD.ord||DD.shown)return;const i=+c.dataset.i,k=e.key;
 if(k===" "||k==="Enter"){e.preventDefault();DD.sel=DD.sel===i?null:i;SND.play(DD.sel!=null?"sel":"drop");drawDD(i);live(DD.sel!=null?`Kartu diangkat, posisi ${DD.seq.indexOf(i)+1} dari ${DD.seq.length}. Gunakan panah atas atau bawah, lalu Spasi untuk menaruh.`:`Kartu ditaruh di posisi ${DD.seq.indexOf(i)+1}.`)}
 else if(k==="ArrowUp"||k==="ArrowDown"){e.preventDefault();const d=k==="ArrowUp"?-1:1;if(DD.sel===i)rankMove(i,DD.seq.indexOf(i)+d,true);else{const n=DD.seq[DD.seq.indexOf(i)+d];if(n!=null){const f=q(`.gd-card[data-i="${n}"]`);f&&f.focus()}}}
 else if(k==="Escape"&&DD.sel!=null){DD.sel=null;drawDD(i)}}

/* Simulasi: lihat GLSV (script#gl-sim-view) dan GLS (script#gl-sim-core). */

/* ==================================================================
   NILAI AKHIR
   ================================================================== */
/* nilai akhir baru dibuka setelah kuis Gabungan, semua set drag & drop (minimal sekali dicek), dan ketiga simulasi selesai */
function syarat(d){const H=hitung(d),dn=GLD.DND.filter(s=>d.dnd[s.id]&&d.dnd[s.id].n>0).length,sm=H.asp.filter(a=>a.v!=null).length;
 const it=[["Kuis mode Gabungan",H.pg!=null?1:0,1,"#/latihan/kuis"],["Drag & Drop",dn,GLD.DND.length,"#/latihan/dnd"],["Simulasi",sm,GLD.SIM.length,"#/latihan/sim"]];
 return {it,ok:it.every(x=>x[1]>=x[2])}}
function lockHTML(d){const S=syarat(d),n=S.it.filter(x=>x[1]>=x[2]).length;
 return `<div class="nilai nl-lock"><div class="nl-lk-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4"/></svg></div>
  <div><span class="mono">Nilai akhir terkunci · ${n}/3 syarat</span><h3>Selesaikan semua latihan dulu, ya</h3><p>Nilai akhirmu akan muncul setelah kuis, drag &amp; drop, dan simulasi semuanya selesai.</p>
  <ul class="nl-req">${S.it.map(([t,v,m,hf])=>`<li class="${v>=m?"ok":""}"><span class="nl-ck" aria-hidden="true">${v>=m?"✓":""}</span><span>${t}</span><small>${m>1?`${v}/${m}`:v?"selesai":"belum"}</small>${v>=m?"":`<a class="chip" href="${hf}">Kerjakan →</a>`}</li>`).join("")}</ul></div></div>`}
function nilaiHTML(){const d=load();if(!syarat(d).ok)return lockHTML(d);const H=hitung(d),P=GLD.PASS_MCQ,K=H.ki!=null?GLD.KATEGORI[H.ki]:null;
 const miss=[];if(H.pg==null)miss.push("kuis mode Gabungan");H.asp.forEach((a,i)=>{if(a.v==null)miss.push("Skenario "+(i+1))});
 const hist=[].concat(d.kuis.hist.map(h=>({t:h.t,x:`Kuis ${h.m==="all"?"Gabungan":"Bab "+(+h.m.slice(1)+1)}: ${fmt(h.score)} (${h.benar}/${h.n})`})),
  ...GLD.SIM.map((s,i)=>((d.sim[s.id]||{}).hist||[]).map(h=>({t:h.t,x:`Skenario ${i+1}: ${fmt(h.score)} · ${GLD.LEVEL[level(h.score)][0]}${h.legacy?" (versi lama)":""}`}))),
  d.akhir.hist.map(h=>({t:h.t,x:`Nilai akhir: ${fmt(h.akhir)} · ${h.kat}`}))).sort((a,b)=>b.t-a.t).slice(0,12);
 const tgl=t=>new Date(t).toLocaleString("id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
 return `<div class="nilai"><div class="nl-head"><span class="mono">Nilai akhir</span><div class="lx-big"${H.akhir!=null?` data-cu="${H.akhir}"`:""}>${fmt(H.akhir)}</div>
  ${K?`<span class="badge k${H.ki}">${esc(K[0])}</span><p>${esc(K[2])}${H.capped?` <b>Catatan:</b> nilai pilihan gandamu belum mencapai batas lulus ${P}, sehingga kategori dibatasi di “Cukup Siap”.`:""}</p>`:`<p>Lengkapi dulu: ${miss.join(", ")}.</p>`}</div>
  <div class="nl-grid"><div class="nl-c"><span class="mono">Pilihan ganda · bobot 30%</span><b${H.pg!=null?` data-cu="${H.pg}"`:""}>${fmt(H.pg)}</b><small>${H.pg==null?"Belum ada skor mode Gabungan.":`Skor terbaik mode Gabungan · ${H.pg>=P?"lulus":"belum lulus"} (batas ${P})`}</small><small>Kontribusi: ${fmt(H.pg)} × 0,30 = <b>${H.pg==null?"–":fmt(H.pg*GLD.W_MCQ)}</b></small><i class="nl-bar" style="--w:${(H.pg||0)/100}"></i></div>
  <div class="nl-c"><span class="mono">Simulasi · bobot 70%</span><b${H.sim!=null?` data-cu="${H.sim}"`:""}>${fmt(H.sim)}</b><small>${H.sim==null?"Selesaikan ketiga skenario.":"Gabungan berbobot tiga aspek"}</small><small>Kontribusi: ${fmt(H.sim)} × 0,70 = <b>${H.sim==null?"–":fmt(H.sim*GLD.W_SIM)}</b></small><i class="nl-bar" style="--w:${(H.sim||0)/100}"></i></div></div>
  <div class="nl-tw"><table class="nl-t"><thead><tr><th>Aspek simulasi</th><th>Bobot</th><th>Skor</th><th>Level</th><th>Kontribusi</th></tr></thead><tbody>${H.asp.map(a=>`<tr><td>${esc(a.s.aspek)}${a.legacy?` <small class="nl-old">skor versi lama</small>`:""}</td><td data-l="Bobot">${Math.round(a.s.w*100)}%</td><td data-l="Skor">${fmt(a.v)}</td><td data-l="Level">${a.v==null?"–":GLD.LEVEL[level(a.v)][0]}</td><td data-l="Kontribusi">${a.v==null?"–":fmt(a.v*a.s.w)}</td></tr>`).join("")}</tbody></table></div>
  <p class="nl-f">Nilai Akhir = (Nilai Pilihan Ganda × 0,30) + (Nilai Simulasi × 0,70)${H.akhir!=null?` = (${fmt(H.pg)} × 0,30) + (${fmt(H.sim)} × 0,70) = <b>${fmt(H.akhir)}</b>`:""}</p>
  <div class="nl-k">${GLD.KATEGORI.map(([t],i)=>`<span class="${H.ki===i?"on":""}">${esc(GLS.score.katLabel(i))} · ${esc(t)}</span>`).join("")}</div>
  <details class="nl-h"><summary>Riwayat percobaan (${hist.length})</summary>${hist.length?`<ul>${hist.map(h=>`<li><small>${tgl(h.t)}</small> ${esc(h.x)}</li>`).join("")}</ul>`:"<p>Belum ada percobaan.</p>"}</details>
  <div class="nl-print"><label>Nama untuk kartu hasil<input id="nlname" maxlength="60" autocomplete="name" placeholder="Nama lengkap"></label><button class="btn p" data-n="print">Cetak kartu hasil</button></div>
  <button class="chip" data-n="reset">Hapus semua hasil latihan</button></div>`}
let nlIO=null;
function nilaiFx(box){if(!box||rmq()||!("IntersectionObserver" in window))return;nlIO&&nlIO.disconnect();nlIO=new IntersectionObserver(es=>{if(!es.some(x=>x.isIntersecting))return;nlIO.disconnect();
 qa("[data-cu]",box).forEach(el=>countUp(el,+el.dataset.cu,{d:1300}));qa(".nl-c,.nl-tw,.nl-f,.nl-k",box).forEach((e,i)=>A(e,UP,{duration:560,delay:120+i*80}));setTimeout(()=>box.classList.add("go"),200)},{threshold:.25});nlIO.observe(box)}
function cetak(){const d=load(),H=hitung(d),K=H.ki!=null?GLD.KATEGORI[H.ki]:null;let nm="";try{nm=(q("#nlname").value||"").trim();const u=JSON.parse(localStorage.getItem("gl-ui")||"{}");u.nama=nm;localStorage.setItem("gl-ui",JSON.stringify(u))}catch(_){}
 let n=0;try{n=done.size}catch(_){}
 const old=q("#cetak");if(old)old.remove();const el=(t,txt,cls)=>{const e=document.createElement(t);if(txt!=null)e.textContent=txt;if(cls)e.className=cls;return e};
 const c=el("section");c.id="cetak";c.append(el("h1","Kartu Hasil Belajar GrowthLab"),el("p","Self Development for Job Seeker · "+new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})),el("h2","Nama: "+(nm||"................................")));
 const tb=el("table"),row=(a,b)=>{const r=el("tr");r.append(el("th",a),el("td",b));tb.append(r)};
 row("Pelajaran selesai",`${n} dari ${GLD.COURSE.chapters.reduce((a,c)=>a+c.l.length,0)}`);row("Nilai pilihan ganda (30%)",H.pg==null?"belum ada":fmt(H.pg)+(H.pg>=GLD.PASS_MCQ?" (lulus)":" (belum lulus)"));
 H.asp.forEach((a,i)=>row(`Simulasi aspek ${i+1}: ${a.s.aspek} (${Math.round(a.s.w*100)}%)`,a.v==null?"belum ada":`${fmt(a.v)} · ${GLD.LEVEL[level(a.v)][0]}`));
 row("Nilai simulasi (70%)",H.sim==null?"belum lengkap":fmt(H.sim));c.append(tb,el("h2","Nilai akhir"),el("p",H.akhir==null?"Belum lengkap":fmt(H.akhir),"big"),el("p",K?K[0]+". "+K[2]:"Lengkapi kuis Gabungan dan ketiga simulasi."),el("p","Rumus: Nilai Akhir = (Nilai Pilihan Ganda × 0,30) + (Nilai Simulasi × 0,70). Kartu ini adalah umpan balik belajar mandiri, bukan sertifikat resmi."));
 document.body.append(c);const fin=()=>{c.remove();removeEventListener("afterprint",fin)};addEventListener("afterprint",fin);try{window.print()}catch(_){}}
function nmFill(){const i=q("#nlname");if(i)try{i.value=JSON.parse(localStorage.getItem("gl-ui")||"{}").nama||""}catch(_){}}
function nilai(celebrate){const box=q("#nilai");if(box){box.innerHTML=nilaiHTML();nmFill();nilaiFx(box)}
 const d=load(),H=hitung(d);if(H.akhir==null||!syarat(d).ok)return;const v=r1(H.akhir);
 if(d.akhir.last!==v){d.akhir.last=v;d.akhir.hist.push({akhir:v,pg:H.pg,sim:r1(H.sim),kat:GLD.KATEGORI[H.ki][0],t:Date.now()});cap(d.akhir.hist,20);save(d);if(box){box.innerHTML=nilaiHTML();nmFill();nilaiFx(box)}
  if(celebrate&&v>=71){setTimeout(()=>{ping(innerWidth/2,innerHeight/2,48);say(`Nilai akhir ${fmt(v)}: ${GLD.KATEGORI[H.ki][0]}!`)},500)}}}
function nilaiClick(e){const b=e.target.closest("[data-n]");if(b&&b.dataset.n==="print"){cetak();return}if(b&&b.dataset.n==="reset"){if(!confirm("Hapus semua skor dan riwayat latihan di browser ini?"))return;GLS.db.clear();QZ=null;DD=null;GLSV.reset();nilai();tab(cur);say("Hasil latihan dihapus.")}}

/* ==================================================================
   TAB & MOUNT
   ================================================================== */
const TABS=[["kuis","Kuis"],["dnd","Drag & Drop"],["sim","Simulasi"]];let cur="kuis";
function scrollTop(){const t=q(".lx-tabs");if(t){const y=t.getBoundingClientRect().top+scrollY-90;if(Math.abs(scrollY-y)>40)try{window.__lenis?window.__lenis.scrollTo(y,{immediate:rmq(),force:true}):scrollTo(0,y)}catch(_){scrollTo(0,y)}}}
function tab(t,user){const prev=cur;cur=TABS.some(x=>x[0]===t)?t:"kuis";qa(".lx-tabs [role=tab]").forEach(b=>{const on=b.dataset.t===cur;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1});
 const p=q("#ltp");if(!p)return;p.setAttribute("aria-labelledby","lt-"+cur);p.dataset.cur=cur;
 if(prev!==cur||!user){if(cur!=="sim")GLSV.stop();if(cur!=="dnd")ddTimerStop()}
 if(cur==="kuis")drawQuiz();else if(cur==="dnd"){if(!DD)ddStart(GLD.DND[0].id);drawDD();if(DD.t0&&!DD.t1)ddTimerGo();deal()}else{GLSV.draw(!!user);const st=GLSV.state();if(st&&st.ph!=="hasil")SND.music("amb")}
 if(user){SND.play("tap");bump(q("#lt-"+cur),1.05)}enter(p,50)}
const tabsHTML=()=>`<div class="lx-tabs" role="tablist" aria-label="Jenis latihan">${TABS.map(([k,t],i)=>`<button role="tab" id="lt-${k}" data-t="${k}" aria-controls="ltp"><span class="mono">${pad(i+1)}</span>${t}<small>${k==="kuis"?GLD.QUIZ.length+" soal · bobot 30%":k==="dnd"?GLD.DND.length+" set · latihan":GLD.SIM.length+" skenario · bobot 70%"}</small></button>`).join("")}</div><div id="ltp" class="lx-panel" role="tabpanel" tabindex="-1"></div>`;
let wired=false;
function mount(t,sub){const p=q("#ltp");if(!p)return;
 const tb=q(".lx-tabs");tb.onclick=e=>{const b=e.target.closest("[role=tab]");if(b&&b.dataset.t!==cur)tab(b.dataset.t,true)};
 tb.onkeydown=e=>{if(!/Arrow(Left|Right)|Home|End/.test(e.key))return;e.preventDefault();const i=TABS.findIndex(x=>x[0]===cur),n=e.key==="Home"?0:e.key==="End"?TABS.length-1:(i+(e.key==="ArrowRight"?1:-1)+TABS.length)%TABS.length;tab(TABS[n][0],true);q("#lt-"+TABS[n][0]).focus()};
 p.onclick=e=>{if(cur==="kuis")quizClick(e);else if(cur==="dnd")ddClick(e);else GLSV.click(e)};
 p.onpointerdown=e=>{if(cur==="dnd")ddDown(e)};p.onkeydown=e=>{if(cur==="dnd")ddKey(e)};p.oncontextmenu=e=>{if(cur==="dnd"&&e.target.closest(".gd-card"))e.preventDefault()};
 if(!p._tm){p._tm=1;p.addEventListener("touchmove",e=>{if(DR&&DR.touch&&(DR.armed||DR.on)&&e.cancelable)e.preventDefault()},{passive:false})}
 if(!wired){wired=true;addEventListener("pointermove",e=>{if(DR)ddMove(e)},{passive:false});addEventListener("pointerup",ddUp);addEventListener("pointercancel",ddUp);
  addEventListener("keydown",e=>{quizKey(e);if(cur==="sim")GLSV.key(e)});
  document.addEventListener("click",e=>{const b=e.target.closest("[data-snd]");if(!b)return;const k=b.dataset.snd,v=!SND.P[k];SND.wake();SND.set(k,v);qa(`[data-snd="${k}"]`).forEach(x=>x.setAttribute("aria-pressed",v));if(v)SND.play("tap")});
  document.addEventListener("visibilitychange",()=>{if(QZ&&QZ.phase==="q"&&!q("#gqcf"))QZ.paused=document.hidden});
  addEventListener("hashchange",()=>{if(/^#\/latihan/.test(location.hash))return;if(ovOn())ovClose(true);SND.music(null);GLSV.stop();ddTimerStop()})}
 const n=q("#nilai");if(n)n.onclick=nilaiClick;
 tab(t||cur);nilai();
 if(sub){if(cur==="kuis"&&MODES().some(m=>m[0]===sub)&&!(running()&&QZ.m===sub))lobby(sub);else if(cur==="dnd"&&GLD.DND.some(s=>s.id===sub)){ddStart(sub);drawDD();deal()}else if(cur==="sim"&&GLD.SIM.some(s=>s.id===sub)){const st=GLSV.state();if(!(st&&st.cid===sub))GLSV.open(sub)}}
 if(t)setTimeout(scrollTop,750)}
return{mount,tabsHTML,hitung,load,nQuiz:GLD.QUIZ.length,nSim:GLD.SIM.length,esc,
 ui:{SND,IC,A,enter,countUp,sndCtl,fmt,lesA,chapT,say,bump,pad,mix,rmq,scrollTop,nilai:c=>nilai(c)}};
})();
