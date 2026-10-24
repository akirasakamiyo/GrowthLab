/* ==========================================================================
   GL v8 · TAMPILAN SIMULASI (GLSV) — state machine permainan + layar.
   Fase situasi: narasi → pilih → kunci → reaksi → umpan → (Lanjut) situasi berikut / hasil.
   Setiap transisi dijaga fase, jadi klik ganda, "Lewati", Back/Forward, dan pindah tab
   tidak bisa menumpuk animasi. Semua timer/rAF lewat FX dan dibersihkan saat keluar.
   Panggung animasi (karakter, latar, partikel) ada di GLSTG (blok script#gl-sim-stage).
   ========================================================================== */
const GLSV=(()=>{
const U=GLX.ui,{SND,IC,A,enter,countUp,fmt,lesA,chapT,say,bump,pad,mix,rmq}=U,esc=GLX.esc;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const S=GLS.score,E=GLS.eng,N=GLS.SITU,DEBUG=/[?&]debug=1(&|$)/.test(location.search);
const ST=()=>window.GLSTG;
const pitaT=v=>{const p=S.pita(v);return p==null?"–":GLD.LEVEL[p][0]};
const CCOL=["#14b8a6","#ff6b3d","#8854c0"],ccOf=c=>CCOL[GLD.SIM.indexOf(c)%CCOL.length];
const tone=s=>["good","good","mid","bad"][S.pita(s)];

/* ---------- efek terkelola ---------- */
const FX={t:new Set(),r:new Set(),
 to(fn,ms){const id=setTimeout(()=>{FX.t.delete(id);fn()},rmq()?0:ms);FX.t.add(id);return id},
 raf(fn){const id=requestAnimationFrame(x=>{FX.r.delete(id);fn(x)});FX.r.add(id);return id},
 clear(){FX.t.forEach(clearTimeout);FX.t.clear();FX.r.forEach(cancelAnimationFrame);FX.r.clear();const g=ST();g&&g.stop()},
 size:()=>FX.t.size+FX.r.size};

let V=null;
const panel=()=>{const p=q("#ltp");return p&&p.dataset.cur==="sim"?p:null};
const data=()=>GLS.db.load();
function runOf(d,c){const o=d.sim[c.id],r=o&&o.run;if(!r)return null;const st=E.replay(c,r.ids);return st&&!E.done(st)?st:null}
function saveRun(c,st){const d=data(),o=d.sim[c.id]||(d.sim[c.id]={best:null,last:null,hist:[],endings:[],run:null});o.run=st?{cv:c.cv,ids:st.ids.slice(),t:Date.now()}:null;GLS.db.save(d)}
function finalize(c,st){const rec=E.result(c,st),e=E.ending(c,st),d=data(),o=d.sim[c.id]||(d.sim[c.id]={best:null,last:null,hist:[],endings:[],run:null});
 const prev=o.best,better=S.lebihBaik(rec,prev),saved={score:rec.score,ending:rec.ending,path:rec.path,t:rec.t};
 if(better)o.best=saved;o.last=saved;o.hist=(o.hist||[]).concat(saved).slice(-20);if(!o.endings.includes(e.id))o.endings=o.endings.concat(e.id);o.run=null;
 const ok=GLS.db.save(d);window.GLG&&GLG.emit("sim",{id:c.id,score:rec.score});U.nilai();return{rec,e,prev,better,found:o.endings.length,persist:ok}}

/* ---------- mesin tik ---------- */
let TW=null;
function typeAll(root,done){if(TW)TW.kill();const els=qa("[data-tw]",root);let alive=true,ei=0,ci=0,last=0,acc=0;
 const fin=()=>{if(!alive)return;alive=false;TW=null;els.forEach(e=>{e.textContent=e.dataset.tw;e.classList.add("on","done")});done&&done()};
 if(rmq()||!els.length){fin();return}TW={skip:fin,kill:()=>{alive=false;TW=null}};
 const step=t=>{if(!alive)return;if(!last)last=t;acc+=Math.min(t-last,100);last=t;let n=Math.floor(acc/14);acc-=n*14;
  while(n-->0&&ei<els.length){const e=els[ei],tx=e.dataset.tw;ci++;e.textContent=tx.slice(0,ci);e.classList.add("on");if(ci%3===0)SND.play("type");if(ci>=tx.length){e.classList.add("done");ei++;ci=0}}
  if(ei>=els.length){fin();return}FX.raf(step)};FX.raf(step)}

/* ---------- komponen kecil ---------- */
const dots=(k,ph)=>`<ol class="gs-dots" aria-label="Situasi ${k} dari ${N}">${Array.from({length:N},(_,j)=>`<li class="${j<k-1?"d":j===k-1?(ph==="hasil"?"d":"c"):""}"></li>`).join("")}</ol>`;
const bar=k=>`<div class="gs-bar"><span class="gs-m">Kasus ${pad(GLD.SIM.indexOf(V.c)+1)} · ${esc(V.c.aspek)}</span><span class="gs-m gv-sn">Situasi ${Math.min(k,N)}/${N}</span>${dots(k,V.ph)}<div class="gs-ctl">${U.sndCtl()}<button type="button" class="gs-ib" data-sm="quit" aria-label="Keluar ke daftar kasus (progres tersimpan)" title="Keluar (progres tersimpan)">${IC.x}</button></div></div>`;
const meterHTML=(c,m,dm)=>`<div class="gv-ms">${c.meters.map((x,i)=>`<div class="gv-m" data-k="${x.k}" role="img" aria-label="${esc(x.t)}: ${Math.round(m[x.k])} dari 100"><span class="gs-m">${esc(x.t)}</span><b>${Math.round(m[x.k])}</b>${dm?`<em class="gv-dm ${dm[i]>0?"up":dm[i]<0?"dn":""}">${dm[i]>0?"+":""}${dm[i]}</em>`:""}<i class="gv-mb"><i style="transform:scaleX(${m[x.k]/100})"></i></i></div>`).join("")}</div>`;
function setMeters(m,dm){qa(".gv-m").forEach((el,i)=>{const k=el.dataset.k,b=q("b",el),bar=q(".gv-mb i",el),from=+b.textContent;bar.style.transform=`scaleX(${m[k]/100})`;countUp(b,m[k],{from,d:800,f:v=>Math.round(v)});el.setAttribute("aria-label",`${q("span",el).textContent}: ${Math.round(m[k])} dari 100`);
 if(dm&&dm[i]){const e=document.createElement("em");e.className="gv-dm "+(dm[i]>0?"up":"dn");e.textContent=(dm[i]>0?"+":"")+dm[i];el.appendChild(e);A(e,[{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],{duration:400})}})}

/* ---------- layar: daftar kasus ---------- */
function homeHTML(){const d=data();
 const cards=GLD.SIM.map((c,i)=>{const o=d.sim[c.id],b=o&&o.best,play=E.playable(c),run=play?runOf(d,c):null,found=o?o.endings.length:0;
  const stat=!play?"Segera hadir":run?`Situasi ${run.ids.length+1}/${N} · sedang berjalan`:b&&!b.legacy?`Selesai · ending ${found}/${c.endings.length}`:`Situasi 0/${N}`;
  const best=b?`Terbaik ${fmt(b.score)} · ${pitaT(b.score)}${b.legacy?" · versi lama":""}`:"Skor terbaik: –";
  const tg=play?"button":"div";return `<${tg} ${play?`type="button" data-sm="open" `:""}class="gs-file${play?"":" soon"}" data-id="${c.id}" style="--i:${i};--cc:${CCOL[i%CCOL.length]}"><span class="gs-fn gs-m"><span>Kasus ${pad(i+1)} / ${pad(GLD.SIM.length)}</span><span>${play?(run?"Lanjutkan":b&&!b.legacy?"✓":"Baru"):"Segera hadir"}</span></span>
   <span class="gs-fi">${ST()?ST().thumb(c):""}</span><span class="gs-ft">${esc(c.t)}</span><span class="gs-m">Aspek ${i+1} · bobot ${Math.round(c.w*100)}%</span><span class="gs-fa">${esc(c.aspek)}</span><span class="gs-fd">${esc(c.intro)}</span>
   <span class="gs-fm"><span>${best}</span><span>${stat}</span></span><span class="gs-go">${!play?"Segera hadir":`${run?"Lanjutkan":b&&!b.legacy?"Main ulang":"Mulai kasus"} ${IC.arrow}`}</span></${tg}>`}).join("");
 return `<div class="gs-home"><div class="gs-hh"><span class="gs-m">// Simulasi kasus dunia kerja</span><h3 class="gs-h">Pilih <span>kasusmu</span></h3>
  <p>Setiap kasus berisi ${N} situasi. Pilihanmu menentukan alur cerita, kondisi tokoh, dan ending-nya. Setiap pilihan bernilai 0–100 sesuai rubrik dan terkunci setelah dipilih. Coba jalur lain lewat <b>Main ulang</b>.</p>
  <p class="gs-note">Skor aspek = rata-rata skor ${N} pilihanmu. Nilai simulasi = (Aspek 1 × 0,35) + (Aspek 2 × 0,35) + (Aspek 3 × 0,30), memakai skor terbaik tiap kasus. Bobot simulasi di Nilai Akhir: 70%.${GLS.db.persistent()?"":" <b>Penyimpanan browser tidak tersedia</b>, jadi progres hanya bertahan sampai halaman ditutup."}</p></div>
 <div class="gs-files">${cards}</div><div class="gs-foot">${U.sndCtl()}<span class="gs-m">Progres tersimpan otomatis setelah setiap pilihan</span></div>${DEBUG?debugHTML():""}</div>`}

/* ---------- layar: pembuka kasus ---------- */
function introHTML(){const c=V.c,i=GLD.SIM.indexOf(c),run=V.resume;
 return `<div class="gs-title"><span class="gs-m">Kasus ${pad(i+1)} / ${pad(GLD.SIM.length)} · ${esc(c.aspek)}</span><h3 class="gs-h"><span class="sr">${esc(c.t)}</span><span class="gs-scr" aria-hidden="true" data-t="${esc(c.t)}">${esc(c.t)}</span></h3>
  <p class="gs-intro"><span class="sr">${esc(c.intro)}</span><span class="gs-tw" aria-hidden="true" data-tw="${esc(c.intro)}"></span></p>
  ${c.dasar?`<details class="gs-dasar"><summary>Dasar kasus nyata</summary><p>${esc(c.dasar.x)}</p><ul>${c.dasar.src.map(s=>`<li>${esc(s.t)} <a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.o)}</a></li>`).join("")}</ul></details>`:""}
  <p class="gs-m gv-im">${N} situasi · 2 meter: ${c.meters.map(m=>esc(m.t)).join(" & ")} · ${c.endings.length} kemungkinan ending</p>
  <div class="gs-tbtn">${run?`<button type="button" class="gs-btn" data-sm="resume">${IC.play} Lanjutkan dari situasi ${run.ids.length+1}/${N}</button><button type="button" class="gs-btn gh" data-sm="restart">${IC.redo} Mulai ulang</button>`:`<button type="button" class="gs-btn" data-sm="go">${IC.play} Mulai kasus</button>`}<button type="button" class="gs-btn gh" data-sm="home">Kembali</button></div><span class="gs-m">Tekan Enter untuk ${run?"melanjutkan":"mulai"}</span></div>`}

/* ---------- layar: situasi ---------- */
function situHTML(){const c=V.c,st=V.st,k=st.ids.length+1,tx=E.text(c,st),locked=V.ph!=="narasi"&&V.ph!=="pilih",ad=E.adaptive?E.adaptive(c,st):null;
 return `<div class="gv" data-ph="${V.ph}" style="--cc:${ccOf(c)}">${bar(k)}${meterHTML(c,locked?V.after.meters:st.meters)}
  <div class="gv-stage" id="gvst" aria-hidden="true">${ST()?ST().scene(c,E.node(c,st),st):""}</div>
  ${ad?`<span class="gv-adapt" data-a="${ad}">${ad==="bantu"?"Cerita menyesuaikan caramu bermain: ada yang mau membantumu":"Cerita menyesuaikan caramu bermain: tantangannya naik"}</span>`:""}
  <p class="gv-x" id="simx" tabindex="-1"><span class="sr">${esc(tx)}</span><span class="gs-tw" aria-hidden="true" data-tw="${esc(tx)}"></span></p>
  <div class="gv-cs" role="group" aria-labelledby="simx">${V.ord.map((ch,j)=>`<button type="button" class="gv-c" data-sm="pick" data-c="${ch.id}" style="--i:${j}"><kbd>${j+1}</kbd><span>${esc(ch.t)}</span></button>`).join("")}</div>
  <div class="gv-fb" id="gvfb" aria-live="polite"></div>
  <div class="gv-act"><span class="gs-m gv-hint">Pilih dengan tombol 1–${V.ord.length} · Spasi untuk mempercepat</span><button type="button" class="gs-btn gh gv-skip" data-sm="skip">Lewati animasi</button><button type="button" class="gs-btn gv-next" data-sm="next" id="gvnext" disabled>${E.done(V.after||st)&&V.after?"Lihat hasil":"Lanjut"} ${IC.arrow}</button></div></div>`}
function fbHTML(){const ch=V.pick,p=S.pita(ch.s);
 return `<div class="gv-fbin t-${tone(ch.s)}"><div class="gv-sc"><span class="gs-m">Skor pilihan</span><b id="gvsc">${ch.s}</b><small>${GLD.LEVEL[p][0]}</small></div><div><span class="gs-m">Dampak keputusan ${V.after.ids.length}</span><p>${esc(ch.fb)}</p></div></div>`}
function enterNode(){V.ph="narasi";V.ord=mix(E.choices(V.c,V.st));V.pick=null;V.after=null;const p=panel();if(!p)return;FX.clear();p.innerHTML=situHTML();
 const g=ST();g&&g.enter(q("#gvst",p),V.c,E.node(V.c,V.st),V.st);A(q(".gv-stage",p),[{opacity:0},{opacity:1}],{duration:500});
 const x=q("#simx",p);x&&x.focus({preventScroll:true});typeAll(q("#simx",p),showChoices)}
function showChoices(){if(!V||V.ph!=="narasi")return;V.ph="pilih";const p=panel();if(!p)return;q(".gv",p).dataset.ph="pilih";q(".gv-cs",p).classList.add("on")}
function pick(id){if(!V||V.ph!=="pilih")return;const r=E.choose(V.c,V.st,id);if(!r)return;
 V.ph="kunci";V.pick=r.ch;V.after=r.st;V.done=E.done(r.st);
 if(V.done)V.fin=finalize(V.c,r.st);else saveRun(V.c,r.st);   // pilihan langsung disimpan: refresh tidak bisa mengulang/menukar pilihan
 const p=panel();if(!p)return;q(".gv",p).dataset.ph="kunci";
 qa(".gv-c",p).forEach(b=>{b.disabled=true;const me=b.dataset.c===id;b.classList.add(me?"chosen":"gone");if(me)b.setAttribute("aria-pressed","true")});
 SND.play("stamp");FX.to(react,450)}
function react(){if(!V||V.ph!=="kunci")return;V.ph="reaksi";const p=panel();if(!p)return;q(".gv",p).dataset.ph="reaksi";
 const g=ST(),ch=V.pick,tn=tone(ch.s);g&&g.react(ch.rx,tn,ch);SND.play(tn==="good"?"good":tn==="mid"?"mid":"bad");
 FX.to(()=>{if(!V||V.ph!=="reaksi")return;g&&g.mood(tn);setMeters(V.after.meters,V.c.meters.map(m=>V.after.meters[m.k]-V.st.meters[m.k]));FX.to(feedback,rmq()?0:700)},rmq()?0:1500)}
function feedback(){if(!V||(V.ph!=="reaksi"&&V.ph!=="kunci"))return;V.ph="umpan";const p=panel();if(!p)return;q(".gv",p).dataset.ph="umpan";
 const f=q("#gvfb",p);f.innerHTML=fbHTML();A(f.firstChild,[{opacity:0,transform:"translateY(12px)"},{opacity:1,transform:"none"}],{duration:420});countUp(q("#gvsc",p),V.pick.s,{d:600,f:v=>Math.round(v)});
 const nb=q("#gvnext",p);nb.disabled=false;nb.innerHTML=`${V.done?"Lihat hasil":"Lanjut"} ${IC.arrow}`;nb.focus({preventScroll:true});
 const sk=q(".gv-skip",p);sk&&(sk.hidden=true)}
function skip(){if(!V)return;
 if(V.ph==="narasi"){TW?TW.skip():showChoices();return}
 if(V.ph==="kunci"||V.ph==="reaksi"){FX.clear();const g=ST(),tn=tone(V.pick.s);g&&g.settle(V.pick.rx,tn);const ms=V.c.meters;qa(".gv-m").forEach(el=>{const k=el.dataset.k;q("b",el).textContent=Math.round(V.after.meters[k]);q(".gv-mb i",el).style.transform=`scaleX(${V.after.meters[k]/100})`});V.ph="reaksi";feedback()}}
function next(){if(!V||V.ph!=="umpan")return;SND.play("whoosh");
 if(V.done){V.ph="hasil";V.st=V.after;draw(true);return}
 V.st=V.after;enterNode()}
/* gambar ulang statis bila kembali ke tab/halaman di tengah fase */
function restore(p){const g=ST();g&&g.enter(q("#gvst",p),V.c,E.node(V.c,V.st),V.st,true);qa("[data-tw]",p).forEach(e=>{e.textContent=e.dataset.tw;e.classList.add("on","done")});
 if(V.ph==="narasi")V.ph="pilih";q(".gv",p).dataset.ph=V.ph==="pilih"?"pilih":"umpan";q(".gv-cs",p).classList.add("on");
 if(V.ph!=="pilih"){qa(".gv-c",p).forEach(b=>{b.disabled=true;b.classList.add(b.dataset.c===V.pick.id?"chosen":"gone")});g&&g.settle(V.pick.rx,tone(V.pick.s));V.ph="reaksi";feedback()}}

/* ---------- layar: hasil ---------- */
function hasilHTML(){const c=V.c,F=V.fin,e=F.e,sc=F.rec.score,p=S.pita(sc),i=GLD.SIM.indexOf(c),log=V.st.log;
 const head=e.type==="fail"?"Belum berhasil":e.type==="win"?"Berhasil":"Hampir sampai";
 return `<div class="gv-end t-${e.type}" style="--cc:${ccOf(c)}"><div class="gv-ehero" id="gvend" aria-hidden="true">${ST()?ST().ending(c,e.type):""}<div class="gv-ebig">${head}</div></div>
 <div class="gv-eh"><span class="gs-m">Kasus ${pad(i+1)} selesai · ending ${F.found}/${c.endings.length} ditemukan</span><h3 class="gs-h" id="gvet" tabindex="-1">${esc(e.t)}</h3><p class="gv-ex">${esc(e.x)}</p></div>
 <div class="gv-score"><div><span class="gs-m">Skor aspek</span><b id="gvbig">${fmt(sc)}</b><small>/100</small></div><div class="gs-stamp l${p}">${GLD.LEVEL[p][0]}</div>
  <p class="gv-best">${F.prev&&!F.prev.legacy?(F.better?`Skor terbaik baru! Sebelumnya ${fmt(F.prev.score)}.`:`Skor terbaikmu tetap ${fmt(F.prev.score)}.`):F.prev&&F.prev.legacy?`Skor versi lama (${fmt(F.prev.score)}) diganti hasil ini.`:"Skor ini menjadi skor terbaikmu."}${F.persist?"":" (Tersimpan sementara: penyimpanan browser tidak tersedia.)"}</p></div>
 <p class="gv-desk"><b>${esc(c.aspek)} · ${GLD.LEVEL[p][0]} (${S.pitaLabel(p)}).</b> ${esc(GLD.DESK[c.aspek][p])}</p>
 ${meterHTML(c,V.st.meters)}
 <h4 class="gs-h4">Ringkasan jalurmu</h4><ol class="gv-trail">${log.map((l,j)=>`<li style="--i:${j}"><span class="gs-m">Situasi ${j+1}</span><p class="gv-tc">${esc(l.t)}</p><b>${l.s}</b><p class="gv-tf">${esc(l.fb)}</p></li>`).join("")}</ol>
 <p class="gs-note">Skor aspek = rata-rata (${log.map(l=>l.s).join(" + ")}) ÷ ${N} = ${fmt(F.rec.raw)}.</p>
 <h4 class="gs-h4">Pelajari lagi</h4><ul class="gs-les">${c.les.map(([b,l])=>`<li>${lesA(b,l)} <small>· ${esc(chapT(b))}</small></li>`).join("")}</ul>
 <div class="gs-tbtn"><button type="button" class="gs-btn" data-sm="restart">${IC.redo} Main ulang</button><button type="button" class="gs-btn gh" data-sm="home">Kasus lain</button></div></div>`}

/* ---------- debug (?debug=1) ---------- */
function debugHTML(){const V2=GLS.validateAll(),T=GLS.tests(),bad=T.filter(t=>!t.ok),err=V2.reduce((a,v)=>a+v.errors.length,0);
 try{err||bad.length?console.error("[GLS debug] validator/tes gagal",V2.flatMap(v=>v.errors),bad):console.info(`[GLS debug] validator OK, ${T.length} tes lolos`)}catch(e){}
 return `<details class="gv-dbg" open><summary>Debug: validator ${err?"✕ "+err+" error":"✓"} · tes ${T.length-bad.length}/${T.length}</summary>
  ${V2.map(v=>`<p><b>${v.id}</b> ${v.soon?"segera hadir":`${v.paths} jalur · ending ${Object.entries(v.ends).map(([k,n])=>k+":"+n).join(", ")}`}</p>${v.errors.map(e=>`<p class="no">✕ ${esc(e)}</p>`).join("")}`).join("")}
  <ul>${T.map(t=>`<li class="${t.ok?"ok":"no"}">${t.ok?"✓":"✕"} ${esc(t.name)}${t.ok?"":" → "+esc(t.detail)}</li>`).join("")}</ul>
  <p>Uji ending (mengisi skor sungguhan): ${GLD.SIM.filter(E.playable).map(c=>["best","mid","worst"].map(m=>`<button type="button" class="chip" data-sm="dbg" data-id="${c.id}" data-m="${m}">${c.id} ${m==="best"?"terbaik":m==="mid"?"tengah":"terburuk"}</button>`).join(" ")).join(" ")}</p></details>`}

/* ---------- gambar & navigasi ---------- */
function draw(fx){const p=panel();if(!p)return;FX.clear();if(TW)TW.kill();
 if(!V){p.innerHTML=homeHTML();if(fx)enter(q(".gs-hh",p));return}
 if(V.ph==="intro"){p.innerHTML=introHTML();const s=q(".gs-scr",p);s&&scramble(s);typeAll(p);SND.play("whoosh");const b=q(".gs-tbtn .gs-btn",p);b&&b.focus({preventScroll:true});return}
 if(V.ph==="hasil"){p.innerHTML=hasilHTML();const g=ST(),e=V.fin.e;g&&g.endingPlay(q("#gvend",p),e.type);countUp(q("#gvbig",p),V.fin.rec.score,{d:1400});
  const t=q("#gvet",p);t&&t.focus({preventScroll:true});FX.to(()=>{const s=q(".gs-stamp",p);if(s){s.classList.add("in");SND.play("stamp")}},1300);FX.raf(()=>FX.raf(()=>{const x=q(".gv-end",p);x&&x.classList.add("go")}));
  SND.play(e.type==="win"?"fan":e.type==="fail"?"sad":"mid");return}
 p.innerHTML=situHTML();restore(p)}
function scramble(el){if(rmq())return;const t=el.dataset.t,G="▓▒░█<>/\\|#*+=-_",t0=performance.now();
 const st=n=>{const k=Math.min(1,(n-t0)/900),c=Math.floor(t.length*k);el.textContent=t.slice(0,c)+[...t.slice(c)].map(x=>x===" "?" ":G[Math.random()*G.length|0]).join("");if(k<1)FX.raf(st);else el.textContent=t};FX.raf(st)}
function open(id){const c=E.kasus(id);if(!c||!E.playable(c)){say("Kasus ini segera hadir.");return}const g=ST();g&&g.preload&&g.preload(c);SND.wake();SND.music("amb");V={c,ph:"intro",resume:runOf(data(),c)};draw(true);U.scrollTop()}
function begin(resume){const c=V.c;let st=resume&&V.resume?V.resume:null;if(!st){st=E.start(c);saveRun(c,st)}V={c,st,ph:"narasi"};SND.play("tap");enterNode()}
function home(){FX.clear();if(TW)TW.kill();V=null;SND.play("tap");draw(true)}
function click(e){const b=e.target.closest("[data-sm]");
 if(!b){if(V&&V.ph==="narasi"&&e.target.closest(".gv-x"))skip();else if(TW&&e.target.closest(".gs-intro"))TW.skip();return}
 if(b.disabled)return;const a=b.dataset.sm;
 if(a==="open")open(b.dataset.id);else if(a==="go")begin(false);else if(a==="resume")begin(true);
 else if(a==="restart"){const c=V.c;saveRun(c,null);V={c,ph:"intro",resume:null};begin(false)}
 else if(a==="home"||a==="quit")home();else if(a==="pick")pick(b.dataset.c);else if(a==="skip")skip();else if(a==="next")next();
 else if(a==="dbg"){const c=E.kasus(b.dataset.id),st=E.auto(c,b.dataset.m);V={c,st,ph:"hasil",fin:finalize(c,st)};draw(true)}}
function key(e){const p=panel();if(!p||e.ctrlKey||e.metaKey||e.altKey)return;const r=p.getBoundingClientRect();if(r.bottom<80||r.top>innerHeight-80)return;
 const tg=e.target,k=e.key;if(tg&&tg.closest&&tg.closest("input,textarea,select"))return;const onBtn=tg&&tg.closest&&tg.closest("button,a,summary");
 if(!V)return;
 if(V.ph==="intro"){if(k===" "&&TW&&!onBtn){e.preventDefault();TW.skip()}else if(k==="Enter"&&!onBtn){const b=q(".gs-tbtn .gs-btn",p);if(b){e.preventDefault();b.click()}}return}
 if(V.ph==="pilih"&&/^[1-5]$/.test(k)){const ch=V.ord[+k-1];if(ch){e.preventDefault();pick(ch.id)}return}
 if(k===" "||k==="Enter"){if(onBtn&&V.ph==="umpan")return;if(V.ph==="narasi"||V.ph==="kunci"||V.ph==="reaksi"){e.preventDefault();skip()}else if(V.ph==="umpan"&&!onBtn){e.preventDefault();next()}}}
/* keluar halaman/tab: hentikan semua efek; state permainan tetap di memori & penyimpanan */
function stop(){FX.clear();if(TW)TW.kill();SND.music(null)}
function reset(){stop();V=null}
return{draw,open,click,key,stop,reset,fxSize:FX.size,state:()=>V&&{cid:V.c.id,ph:V.ph,ids:(V.after||V.st||{ids:[]}).ids.slice(),cur:V.st?V.st.ids.slice():[]}};
})();
