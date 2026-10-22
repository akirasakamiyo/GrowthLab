/* ---------- content model: data materi ada di <script id="gl-data"> (objek GLD) ---------- */
const COURSES=[GLD.COURSE];
const C=COURSES[0],$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=GLX.esc,strip=s=>String(s).replace(/<[^>]+>/g,"");
let LOCAL=true;const TITLE=document.title;
let done=new Set();try{done=new Set(JSON.parse(localStorage.getItem("mer-done")||"[]"))}catch(e){}
const save=()=>{if(!A.sync){try{localStorage.setItem("mer-done",JSON.stringify([...done]))}catch(e){}}push()};
const total=C.chapters.reduce((a,c)=>a+c.l.length,0),pct=()=>done.size/total;
const nextUp=()=>{for(let i=0;i<C.chapters.length;i++)for(let j=0;j<C.chapters[i].l.length;j++)if(!done.has(i+"-"+j))return[i,j];return[0,0]};
const p2=n=>String(n).padStart(2,"0");
function phase(){$$(".brand i,.dot,.art").forEach((e,i)=>{e.style.setProperty("--ph",(i*1.618%5).toFixed(2));e.style.setProperty("--dur",(4+(i*.73%2.6)).toFixed(2)+"s")})}

/* ---------- render ---------- */
let cat="All",cur=[0,0];
function renderDiscover(){
 const cats=["Semua",...C.chapters.map(c=>c.t)];if(!cats.includes(cat))cat="Semua";
 $("#chips").innerHTML=cats.map(k=>`<button class="chip" aria-pressed="${k===cat}">${esc(k)}</button>`).join("");
 $$("#chips .chip").forEach((b,i)=>b.onclick=()=>{cat=cats[i];renderDiscover()});
 const f=C;$("#feat").innerHTML=`<div class="art" style="--c1:${f.c1}">${ILL("course")}</div><div class="body"><div><span class="mono">Unggulan · ${esc(f.k)} · ${esc(f.media)}</span><h3 style="font-size:clamp(2.2rem,4vw,3.4rem);margin:12px 0">${esc(f.t)}</h3><p style="color:var(--mut)">${esc(f.d)}</p></div><div class="tags"><span>${C.chapters.length} bab</span><span>${total} pelajaran</span><span>${GLX.nQuiz} soal</span><span>${GLX.nSim} simulasi</span></div></div>`;
 $("#feat").setAttribute("aria-label","Buka kursus "+f.t);
 $("#grid").innerHTML=C.chapters.map((c,i)=>({c,i})).filter(o=>cat==="Semua"||o.c.t===cat).map(({c,i})=>{const n=c.l.filter((_,j)=>done.has(i+"-"+j)).length;
  return `<a class="card" href="${goC(i+1)}"><div class="art" style="--c1:${c.c1}">${ILL("c"+i)}<em class="no">${p2(i+1)}</em></div><div class="body"><span class="mono">Bab ${p2(i+1)}</span><h3>${esc(c.t)}</h3><p style="color:var(--mut);font-size:.95rem">${esc(c.d)}</p><div class="tags"><span>${c.l.length} pelajaran</span><span>${n}/${c.l.length} selesai</span></div></div></a>`}).join("");
 phase();$("#feat").onclick=()=>location.hash="#/course";$("#feat").onkeydown=e=>{if(e.key==="Enter")location.hash="#/course"};
}
function renderPath(){
 const all=done.size>=total,ci=all?C.chapters.length:nextUp()[0];
 $("#pathlist").style.setProperty("--p",Math.min(1,ci/C.chapters.length));
 $("#pathlist").innerHTML=C.chapters.map((c,i)=>{const n=c.l.filter((_,j)=>done.has(i+"-"+j)).length,full=n===c.l.length;
  return `<button class="step ${full?"done":""} ${i===ci&&!all?"act":""}" data-i="${i}"><span class="dot">${full?"✓":p2(i+1)}</span><span><h3>${esc(c.t)}</h3><small>${n} / ${c.l.length} pelajaran</small></span><span class="mono">${full?"Selesai":i===ci?"Sekarang":""}</span></button>`}).join("")
  +`<a class="step ${all?"act":""}" href="#/latihan" data-x="latihan"><span class="dot">${all?"→":p2(C.chapters.length+1)}</span><span><h3>Latihan &amp; nilai akhir</h3><small>Kuis, drag &amp; drop, dan simulasi</small></span><span class="mono">${all?"Sekarang":""}</span></a>`+WK;
 $$(".step[data-i]").forEach(b=>{b.onclick=()=>{open_=+b.dataset.i;location.hash="#/course/"+(open_+1)};b.onmouseenter=()=>{setActive(+b.dataset.i);moveW(b)};b.onmouseleave=()=>moveW($(".step.act"))});
 $$(".step[data-x]").forEach(b=>{b.onmouseenter=b.onfocus=()=>moveW(b);b.onmouseleave=b.onblur=()=>moveW($(".step.act"))});requestAnimationFrame(()=>moveW($(".step.act")));
}
let open_=0;
/* lencana bab: muncul setelah semua pelajaran dalam bab selesai (5/5) */
const BADGE=[["Pengelola Diri","Kamu sudah menuntaskan semua pelajaran Self-Management."],["Peka Emosi","Kamu sudah menuntaskan semua pelajaran Emotional Intelligence."],["Pemikir Tajam","Kamu sudah menuntaskan semua pelajaran Thinking Skill."]];
const chFull=i=>C.chapters[i].l.every((_,j)=>done.has(i+"-"+j));
const MEDAL=`<svg class="medal" viewBox="0 0 48 56" aria-hidden="true"><path d="M14 2h8l6 16h-8z" fill="#3a4fd0"/><path d="M34 2h-8l-6 16h8z" fill="#ff6a3d"/><circle cx="24" cy="34" r="19" fill="#ffb11f"/><circle cx="24" cy="34" r="14.5" fill="#ffd84a" stroke="#e08e00" stroke-width="1.5"/><path d="M24 25l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2-4.5-4.4 6.2-.9z" fill="#fff"/></svg>`;
const badgeSeen=()=>{try{return JSON.parse(localStorage.getItem("gl-badge")||"[]")}catch(e){return[]}};
function badgeEarned(i){if(!BADGE[i])return;toast(`Lencana baru: “${BADGE[i][0]}”! Bab ${i+1} tuntas 5/5.`)}
function renderCourse(){
 $("#cart").innerHTML=ILL("course");$("#ckat").textContent=C.k+" · "+C.media;$("#ctitle").textContent=C.t;$("#cdesc").textContent=C.d;
 $("#cmeta").textContent=`${C.chapters.length} bab · ${total} pelajaran · ${GLX.nQuiz} soal · ${GLX.nSim} simulasi`;
 const seen=badgeSeen();
 $("#chaps").innerHTML=C.chapters.map((c,i)=>{const n=c.l.filter((_,j)=>done.has(i+"-"+j)).length;
  return `<div class="chap ${i===open_?"open":""}"><button data-i="${i}" aria-expanded="${i===open_}"><span class="mono">${p2(i+1)}</span><h3>${esc(c.t)}</h3>${n===c.l.length&&BADGE[i]?`<span class="mono chbadge ${seen.includes(i)?"":"new"}" title="Lencana ${esc(BADGE[i][0])}">${MEDAL}${n}/${c.l.length}</span>`:`<span class="mono">${n}/${c.l.length}</span>`}<svg class="chev" viewBox="0 0 18 18"><path d="M3 6l6 6 6-6"/></svg></button><div class="lessons"><div>${c.l.map((l,j)=>`<button class="les ${done.has(i+"-"+j)?"done":""}" data-k="${i}-${j}"><span class="mono">${p2(j+1)}</span><span>${esc(l.t)}${l.draft?' <small class="mono">· draf</small>':""}</span><b></b></button>`).join("")}${(()=>{const nj=c.l.findIndex((_,j)=>!done.has(i+"-"+j));return `${nj<0&&BADGE[i]?`<div class="chrew">${MEDAL}<div><span class="mono">Lencana diraih</span><b>${esc(BADGE[i][0])}</b><p>${esc(BADGE[i][1])}</p></div></div>`:""}<div class="chact"><span class="chbar" aria-hidden="true"><i style="--p:${n/c.l.length}"></i></span><a class="btn p" href="#/lesson/${i}-${nj<0?0:nj}">${nj<0?"Ulas bab":n?"Lanjut bab":"Mulai bab"}</a><a class="btn" href="#/latihan/kuis/b${i}">Kuis Bab ${i+1}</a></div>`})()}</div></div></div>`}).join("")
  +`<div class="chap"><a class="les" href="#/latihan" style="border:0;padding:30px 0"><span class="mono" style="font:400 2.4rem/1 var(--serif);color:var(--acc)">${p2(C.chapters.length+1)}</span><span><h3 style="font-size:clamp(1.8rem,3.4vw,2.8rem)">Latihan</h3><small>Kuis, drag &amp; drop, simulasi, dan nilai akhir</small></span><b></b></a></div>`;
 $$(".chap>button").forEach(b=>{b.onclick=()=>{open_=+b.dataset.i;setActive(open_);renderCourse()};});
 try{localStorage.setItem("gl-badge",JSON.stringify(C.chapters.map((_,i)=>i).filter(chFull)))}catch(e){}
 $$(".les[data-k]").forEach(b=>b.onclick=()=>location.hash="#/lesson/"+b.dataset.k);
 $("#cart").onclick=()=>$("#cont").click();$("#cart").style.cursor="pointer";$("#cart").title="Lanjut belajar";
}
/* isi pelajaran dari data: konsep/vis/contoh disisipkan setelah bagian ke-`at` (-1 = sebelum bagian pertama) */
function lessonHTML(i,j,L){const ch=C.chapters[i],last=i===C.chapters.length-1&&j===ch.l.length-1;
 const extra=k=>[L.konsep&&L.konsep.at===k?`<div class="call"><span class="mono">Konsep penting</span>${L.konsep.isi}</div>`:"",
  L.vis&&L.vis.at===k?`<figure class="vis dg">${GLD.DIAG[L.vis.d]()}<figcaption><span class="mono">Diagram</span>${L.vis.cap}</figcaption></figure>`:"",
  L.contoh&&L.contoh.at===k?`<div class="ex"><span class="mono">Contoh</span><div style="margin-top:8px">${L.contoh.isi}</div></div>`:""].join("");
 const key=i+"-"+j,flat=C.chapters.flatMap((c,a)=>c.l.map((x,b)=>[a,b])),pos=flat.findIndex(([a,b])=>a===i&&b===j),pv=flat[pos-1],nx=flat[pos+1];
 const ext=k=>extra(k)+GLU.labsAt(key,k);
 return `<span class="mono" id="lk">Bab ${p2(i+1)} · ${esc(ch.t)} · Pelajaran ${p2(j+1)}</span><h1 id="lt">${esc(L.t)}</h1>
 ${L.draft?'<span class="draft" title="Uraian ini ditulis tim pengembang karena belum ada di jabaran materi">Draf, perlu ditinjau tim</span>':""}
 <p class="ljud">${L.judul}</p><p class="lmeta"></p><p class="intro">${L.intro}</p>
 <div class="ind"><span class="mono">Indikator pelajaran ini</span><ul class="chk">${L.ind.map(x=>`<li>${x}</li>`).join("")}</ul></div>
 <nav class="toc" aria-label="Daftar isi pelajaran"></nav>
 ${ext(-1)}${L.bagian.map((b,k)=>`<h2 id="s-${k}">${b.h}</h2>${b.isi}${ext(k)}`).join("")}
 <section class="cek" id="cek"></section>
 <div class="take"><span class="mono">Poin utama</span><p style="margin-top:8px;font-family:var(--serif);font-size:1.6rem;line-height:1.25">${L.poin}</p></div>
 <div class="note"></div>
 <div class="next"><button class="btn" id="mark">Tandai selesai</button><button class="btn p" id="nextl">${last?"Lanjut ke Latihan":"Pelajaran berikut"} <svg viewBox="0 0 16 16"><path d="M2 8h12M9 3l5 5-5 5"/></svg></button></div>
 <div class="pnav">${pv?`<a href="#/lesson/${pv[0]}-${pv[1]}"><small>← Sebelumnya</small><b>${esc(C.chapters[pv[0]].l[pv[1]].t)}</b></a>`:`<a href="#/course"><small>← Kembali</small><b>Ringkasan kursus</b></a>`}${nx?`<a class="nx" href="#/lesson/${nx[0]}-${nx[1]}"><small>Berikutnya →</small><b>${esc(C.chapters[nx[0]].l[nx[1]].t)}</b></a>`:`<a class="nx" href="#/latihan"><small>Berikutnya →</small><b>Latihan &amp; nilai akhir</b></a>`}</div>`}
function renderLesson(i,j){
 cur=[i,j];const ch=C.chapters[i],L=ch&&ch.l[j];if(!L){location.hash="#/course";return}setActive(i);
 const art=$("#lart"),k=i+"-"+j;
 if(art.dataset.k!==k){art.dataset.k=k;art.innerHTML=lessonHTML(i,j,L);GLU.lesson(art,i,j);$("#mark").onclick=markL;$("#nextl").onclick=nextL;document.title=L.t+" · GrowthLab";window.observe&&window.observe()}
 $("#slist").innerHTML=ch.l.map((l,k)=>`<button class="${k===j?"act":""}" data-k="${i}-${k}">${p2(k+1)} ${esc(l.t)}${done.has(i+"-"+k)?" ✓":""}</button>`).join("");
 $$("#slist button").forEach(b=>b.onclick=()=>location.hash="#/lesson/"+b.dataset.k);
 $("#mark").textContent=done.has(k)?"Selesai ✓":"Tandai selesai";
 updateProgress();
}
function updateProgress(){
 const p=pct();document.documentElement.style.setProperty("--p",p);
 $("#navbar").style.setProperty("--p",p);$("#sbar").style.setProperty("--p",p);
 $("#ring").style.setProperty("--p",p);$("#ringt").textContent=Math.round(p*100)+"%";
 $("#ringl").textContent=`${done.size} dari ${total} pelajaran selesai`;$("#sprog").textContent=`${done.size} / ${total} pelajaran`;
 if($("#m1")){$("#m1").textContent=C.chapters.length;$("#m2").textContent=done.size;$("#m3").textContent=Math.round(p*100)+"%"}
 $("#cont").firstChild.textContent=p>=1?"Lanjut ke Latihan ":done.size?"Lanjut belajar ":"Mulai kursus ";
if($("#dh")){$("#dh").textContent=pct()>=1?"Materi selesai! Saatnya latihan.":"Siap untuk langkah pertama?";$("#cta2").textContent=p>=1?"Ke Latihan":done.size?"Lanjut belajar":"Mulai belajar";$("#cta2").href=p>=1?"#/latihan":"#/course"}
}
function markL(ev){const k=cur.join("-"),w=done.has(k);w?done.delete(k):done.add(k);save();renderLesson(...cur);if(!w){window.GLG&&GLG.emit("lesson",{k});boom(ev.clientX,ev.clientY);toast(done.size>=total?"Semua pelajaran selesai! Lanjut ke Latihan.":`Pelajaran selesai! ${done.size}/${total}`);if(chFull(cur[0])&&done.size<total)badgeEarned(cur[0])}}
function nextL(ev){let[i,j]=cur;const w=done.has(i+"-"+j);done.add(i+"-"+j);save();boom(ev.clientX,ev.clientY);if(!w){window.GLG&&GLG.emit("lesson",{k:i+"-"+j});toast(`Pelajaran selesai! ${done.size}/${total}`);if(chFull(i))badgeEarned(i)}j++;if(j>=C.chapters[i].l.length){i++;j=0}
 location.hash=i>=C.chapters.length?"#/latihan":"#/lesson/"+i+"-"+j}
$("#mark").onclick=markL;$("#nextl").onclick=nextL;
$("#back").onclick=()=>location.hash="#/course";
$("#cont").onclick=()=>{if(done.size>=total){location.hash="#/latihan";return}const[i,j]=nextUp();location.hash="#/lesson/"+i+"-"+j};
$$("[data-go]").forEach(b=>b.onclick=()=>location.hash="#/");

/* ---------- router ---------- */
function route(){
 const h=location.hash.replace("#/","");let v="home";
 v=vOfH(h);
 document.body.dataset.view=v;$$("[data-v]").forEach(e=>e.hidden=e.dataset.v!==v);
 if(v!=="lesson")document.title=TITLE;
 if(v==="course"){const n=+(h.split("/")[1]);if(n>=1&&n<=C.chapters.length){open_=n-1;setActive(open_)}renderCourse()}if(v==="page")renderPage(h);
 if(v==="lesson"){const[a,b]=(h.split("/")[1]||"0-0").split("-").map(Number);renderLesson(a||0,b||0)}
 if(v==="home"){renderPath();renderDiscover();GLU.home();setTimeout(()=>{const el=h&&document.getElementById(h);if(el)toTop(el.getBoundingClientRect().top+scrollY-96)},30)}else toTop();
 updateProgress();observe();phase();par();navOn(h);setMenu(false);
}
/* ke atas halaman: juga saat Lenis sedang dihentikan oleh lapisan motion ketika pindah rute */
function toTop(y=0){scrollTo({top:y,left:0,behavior:"instant"});try{window.__lenis&&window.__lenis.scrollTo(y,{immediate:true,force:true})}catch(e){}}
addEventListener("hashchange",()=>{const k=keyOf();if(k===lastK||RM){lastK=k;route();return}lastK=k;const c=$("#curtain");c.className="curtain in";setTimeout(()=>{route();c.className="curtain out";setTimeout(()=>{c.className="curtain"},650)},520)});
const setMenu=o=>{$("#links").classList.toggle("open",o);$("#burger").setAttribute("aria-expanded",o);$("#burger").textContent=o?"Tutup":"Menu"};$("#burger").onclick=()=>setMenu(!$("#links").classList.contains("open"));
$$("[data-close]").forEach(a=>a.addEventListener("click",()=>setMenu(false)));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
function observe(){$$(".rv:not(.in)").forEach(e=>io.observe(e))}

/* ---------- illustration kit (flat vector, original) ---------- */
const K="#1b1740",W="#fff",Y="#ffc83d",O="#ff5a3c",T="#14b8a6",V="#6d4cff",SK="#f2b48c";
const ART=k=>`<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${[
`<circle cx="150" cy="40" r="20" fill="${Y}"/><path d="M142 62h16v8h-16z" fill="${W}"/><path d="M150 8v-6M122 20l-5-4M178 20l5-4" fill="none"/><rect x="40" y="100" width="100" height="22" rx="3" fill="${O}"/><rect x="52" y="78" width="86" height="22" rx="3" fill="${T}"/><rect x="46" y="56" width="74" height="22" rx="3" fill="${V}"/><path d="M52 111h70" stroke="${W}" fill="none"/>`,
`<path d="M52 84V70a48 48 0 0 1 96 0v14" fill="none" stroke-width="8"/><rect x="40" y="76" width="22" height="40" rx="9" fill="${Y}"/><rect x="138" y="76" width="22" height="40" rx="9" fill="${Y}"/><rect x="88" y="52" width="24" height="42" rx="12" fill="${W}"/><path d="M100 94v22M84 118h32" fill="none"/>`,
`<rect x="36" y="22" width="128" height="86" rx="6" fill="${W}"/><rect rx="4" x="54" y="68" width="16" height="30" fill="${O}"/><rect rx="4" x="80" y="52" width="16" height="46" fill="${T}"/><rect rx="4" x="106" y="38" width="16" height="60" fill="${Y}"/><path d="M74 118l-10 14M126 118l10 14M100 108v22" fill="none"/><path d="M150 120l26-26 8 8-26 26-10 2z" fill="${Y}"/>`,
`<rect x="44" y="30" width="112" height="72" rx="6" fill="${W}"/><path d="M60 82l22-20 18 12 28-30" fill="none" stroke="${O}"/><rect x="28" y="102" width="144" height="10" rx="5" fill="${V}"/><path d="M168 24l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="${Y}"/>`][k%4]}</g></svg>`;
/* ---------- v8.4: ilustrasi bergerak sesuai materi ----------
 ILL(kunci) menggantikan ikon umum ART(k). Gaya sama (garis navy 3px, warna datar), tapi tiap gambar mewakili isinya
 dan beranimasi. Elemen yang beranimasi selalu dibungkus <g transform> agar posisi tidak tertimpa transform CSS.
 Animasi berhenti saat gambar di luar layar dan mati untuk prefers-reduced-motion (lihat <style id="gl-ill">). */
const ILLX=(()=>{
const g=(x,y,b)=>`<g transform="translate(${x} ${y})">${b}</g>`;
const A=(c,b,st="")=>`<g class="a ${c}"${st?` style="${st}"`:""}>${b}</g>`;
const heart=(f=O)=>`<path d="M0 7C-11-1-13-10-7-14-3-16 0-13 0-10 0-13 3-16 7-14 13-10 11-1 0 7Z" fill="${f}"/>`;
const star=(r,f=Y)=>{let d="";for(let i=0;i<10;i++){const a=Math.PI/5*i-Math.PI/2,q=i%2?r*.45:r;d+=(i?"L":"M")+(Math.cos(a)*q).toFixed(1)+" "+(Math.sin(a)*q).toFixed(1)}return`<path d="${d}Z" fill="${f}"/>`};
const spark=(f=W)=>`<path d="M0-7 2-2 7 0 2 2 0 7-2 2-7 0-2-2Z" fill="${f}"/>`;
const face=(r=10,hair=K)=>`<circle r="${r}" fill="${SK}"/><path d="M${-r} -1Q${-r} ${-r-2} 0 ${-r-2}Q${r} ${-r-2} ${r} -1Q${r*.5} ${-r*.55} 0 ${-r*.55}Q${-r*.5} ${-r*.55} ${-r} -1Z" fill="${hair}"/><circle cx="${-r*.35}" cy="${r*.15}" r="1.6" fill="${K}" stroke="none"/><circle cx="${r*.35}" cy="${r*.15}" r="1.6" fill="${K}" stroke="none"/><path d="M${-r*.3} ${r*.45}Q0 ${r*.75} ${r*.3} ${r*.45}" fill="none" stroke-width="2"/>`;
const bust=(c,hair=K,r=10)=>`<path d="M${-r*1.7} ${r*3}Q${-r*1.7} ${r*1.3} 0 ${r*1.3}Q${r*1.7} ${r*1.3} ${r*1.7} ${r*3}Z" fill="${c}"/>${face(r,hair)}`;
const txt=(x,y,s,t,f=K)=>`<text x="${x}" y="${y}" font-size="${s}" font-weight="800" font-family="system-ui,-apple-system,sans-serif" text-anchor="middle" fill="${f}" stroke="none">${t}</text>`;
const bulb=(r=26,f=Y)=>`<circle r="${r}" fill="${f}"/><rect x="${-r*.45}" y="${r*.85}" width="${r*.9}" height="${r*.55}" rx="3" fill="${W}"/><path d="M${-r*.45} ${r*1.1}h${r*.9}" fill="none" stroke-width="2"/>`;
const gear=(r,f=W)=>`<circle r="${r+3}" fill="none" stroke-width="7" stroke-dasharray="4.5 4"/><circle r="${r}" fill="${f}"/><circle r="${r*.35}" fill="${K}" stroke="none"/>`;
const rays=(r1,r2,n=8)=>{let d="";for(let i=0;i<n;i++){const a=Math.PI*2/n*i;d+=`M${(Math.cos(a)*r1).toFixed(1)} ${(Math.sin(a)*r1).toFixed(1)}L${(Math.cos(a)*r2).toFixed(1)} ${(Math.sin(a)*r2).toFixed(1)}`}return`<path d="${d}" fill="none"/>`};
const cloud=f=>`<path d="M-18 8Q-30 8-30-2Q-30-12-19-12Q-16-24-2-22Q8-30 19-20Q30-20 30-8Q38-6 36 2Q34 8 26 8Z" fill="${f}"/>`;
const tick=(d=0)=>A("a-draw",`<path d="M-6 0l4 5 9-10" fill="none" stroke="${K}" stroke-width="3.5" pathLength="1"/>`,`--d:${d}s`);
const dot=(dur,path,f=Y,r=6)=>`<circle r="${r}" fill="${f}"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${path}"/></circle>`;
const L={
/* ===== kursus & bab ===== */
course:`<path d="M10 128h180" fill="none"/>
 <rect x="36" y="100" width="40" height="28" fill="${O}"/><rect x="76" y="78" width="40" height="50" fill="${Y}"/><rect x="116" y="56" width="40" height="72" fill="${T}"/>
 ${g(150,56,`<path d="M0 0V-40" fill="none"/>`+A("a-wig",`<path d="M0-40h26l-6 8 6 8H0z" fill="${O}"/>`,"transform-origin:0% 50%"))}
 ${g(96,52,A("a-bob",bust(V,K,8)))}
 ${g(56,92,A("a-pop",`<rect x="-9" y="-7" width="18" height="13" rx="2" fill="${W}"/><path d="M-4-7v-3h8v3" fill="none" stroke-width="2"/>`,"--d:.3s;--t:4s"))}
 ${g(176,22,A("a-blink",spark(W)))}${g(26,40,A("a-blink",spark(Y),"--d:1s"))}`,
c0:`<rect x="20" y="22" width="48" height="62" rx="5" fill="${W}"/>
 ${[0,1,2].map(i=>g(32,38+i*16,tick(i*.5))+`<path d="M44 ${38+i*16}h16" fill="none" stroke-width="2.5"/>`).join("")}
 ${g(166,34,A("a-pulse",`<circle r="15" fill="${Y}"/>`))}${g(166,34,A("a-spin",rays(20,26,10)))}
 <path d="M96 104h48l-6 26h-36z" fill="${O}"/>
 ${g(120,104,A("a-grow",`<path d="M0 0V-38" fill="none"/><path d="M0-14Q-22-16-24-36-4-34 0-14z" fill="${T}"/><path d="M0-24Q20-28 22-46 2-44 0-24z" fill="${T}"/>`,"transform-origin:50% 100%"))}`,
c1:`${g(56,78,bust(T,K,16))}${g(144,78,bust(V,"#7a3b1d",16))}
 ${g(100,48,A("a-beat",`<g transform="scale(1.6)">${heart(O)}</g>`))}
 ${g(78,40,A("a-up",`<g transform="scale(.6)">${heart(Y)}</g>`))}${g(124,44,A("a-up",`<g transform="scale(.5)">${heart(W)}</g>`,"--d:1.4s"))}
 <path d="M70 116q30 10 60 0" fill="none" stroke-dasharray="5 6"/>`,
c2:`${g(100,56,bulb(32))}
 ${g(90,50,A("a-spin",gear(9),"--t:6s"))}${g(112,64,A("a-spin a-rev",gear(6,O),"--t:6s"))}
 ${g(100,56,A("a-blink",rays(40,50,10)))}
 ${g(30,104,A("a-bob",`<rect x="-14" y="-10" width="28" height="20" rx="4" fill="${W}"/>`+txt(0,5,12,"?")))}${g(170,100,A("a-bob",`<rect x="-14" y="-10" width="28" height="20" rx="4" fill="${T}"/>`+txt(0,5,12,"!",W),"--d:1s"))}`,
/* ===== Bab 1: Self-Management ===== */
"0-0":`<path d="M100 18l36 12v30c0 26-18 42-36 50-18-8-36-24-36-50V30z" fill="${V}"/>
 ${g(100,62,A("a-pulse",star(20,Y)))}
 ${[["S",34,34],["I",166,34],["G",34,104],["N",166,104]].map(([t,x,y],i)=>g(x,y,A("a-pop",`<circle r="14" fill="${[O,T,Y,W][i]}"/>`+txt(0,5,14,t),`--d:${i*.6}s;--t:4s`))).join("")}`,
"0-1":`<path d="M100 26L150 98H50Z" fill="none" stroke-dasharray="7 7"/>
 ${g(100,26,`<circle r="17" fill="${W}"/><circle cx="-7" r="2.5" fill="${K}"/><circle r="2.5" fill="${K}"/><circle cx="7" r="2.5" fill="${K}"/>`)}
 ${g(50,98,`<circle r="17" fill="${O}"/><g transform="scale(.75)">${heart(W)}</g>`)}
 ${g(150,98,`<circle r="17" fill="${T}"/><path d="M-7 0h12M1-6l6 6-6 6" fill="none" stroke="${W}"/>`)}
 ${dot(4.5,"M100 26L150 98H50Z",Y,7)}
 ${txt(152,30,10,"PIKIRAN",W)}${txt(50,130,10,"PERASAAN",W)}${txt(150,130,10,"TINDAKAN",W)}`,
"0-2":`${g(42,112,face(18))}<circle cx="66" cy="92" r="4" fill="${W}"/><circle cx="78" cy="80" r="6" fill="${W}"/>
 <path d="M86 74Q66 74 66 56Q66 38 86 40Q92 20 116 24Q130 12 148 26Q170 24 172 44Q186 50 180 64Q176 76 160 74Z" fill="${W}"/>
 ${g(124,50,A("a-fade",cloud("#a7b0d8")+`<path d="M-12 14l-3 8M0 14l-3 8M12 14l-3 8" fill="none" stroke-width="2.5"/>`))}
 ${g(124,48,A("a-fade2",`<circle r="13" fill="${Y}"/>`+rays(17,23,8)))}`,
"0-3":`${g(64,34,`<rect width="36" height="36" fill="${O}"/><circle cx="36" cy="18" r="6" fill="${O}"/>`)}
 ${g(100,34,`<rect width="36" height="36" fill="${T}"/><circle cx="18" cy="36" r="6" fill="${T}"/>`)}
 ${g(64,70,`<rect width="36" height="36" fill="${V}"/><circle cx="18" cy="0" r="6" fill="${V}"/>`)}
 ${g(100,70,A("a-snap",`<rect width="36" height="36" fill="${Y}"/><circle cx="0" cy="18" r="6" fill="${Y}"/>`))}
 ${g(160,30,A("a-blink",spark(W),"--d:1.2s"))}${g(40,116,A("a-blink",spark(Y),"--d:1.6s"))}`,
"0-4":`${g(100,60,A("a-breath",`<circle r="38" fill="${W}" opacity=".4" stroke="none"/>`))}
 ${g(100,60,`<circle r="24" fill="${W}"/><path d="M-8 8Q-12-10 8-12Q10 6-8 8z" fill="${T}"/><path d="M-8 8L4-4" fill="none" stroke-width="2"/>`)}
 ${A("a-draw",`<path d="M14 118H62l7-14 8 26 8-20 6 8H186" fill="none" stroke="${O}" stroke-width="4" pathLength="1"/>`,"--t:3.5s")}
 ${g(164,40,`<path d="M-11-14l3 30h16l3-30z" fill="${W}"/><path d="M-9-2h18l-1 14h-16z" fill="#8fd3ff"/>`)}${g(36,40,A("a-bob",`<path d="M0-10Q8 0 8 5A8 8 0 0 1-8 5Q-8 0 0-10z" fill="#8fd3ff"/>`))}`,
/* ===== Bab 2: Emotional Intelligence ===== */
"1-0":`<path d="M40 104A60 60 0 0 1 70 52" fill="none" stroke="${O}" stroke-width="16"/><path d="M70 52A60 60 0 0 1 130 52" fill="none" stroke="${Y}" stroke-width="16"/><path d="M130 52A60 60 0 0 1 160 104" fill="none" stroke="${T}" stroke-width="16"/>
 <path d="M30 104A70 70 0 0 1 170 104M50 104A50 50 0 0 1 150 104" fill="none"/>
 ${g(100,104,A("a-swing",`<path d="M0 0V-50" fill="none" stroke-width="5"/>`,"transform-origin:50% 100%"))}<circle cx="100" cy="104" r="8" fill="${K}"/>
 ${g(30,124,`<circle r="9" fill="${W}"/><path d="M-4 5q4-4 8 0" fill="none" stroke-width="2"/><circle cx="-3" cy="-2" r="1.3" fill="${K}"/><circle cx="3" cy="-2" r="1.3" fill="${K}"/>`)}
 ${g(170,124,`<circle r="9" fill="${W}"/><path d="M-4 2q4 4 8 0" fill="none" stroke-width="2"/><circle cx="-3" cy="-2" r="1.3" fill="${K}"/><circle cx="3" cy="-2" r="1.3" fill="${K}"/>`)}`,
"1-4":`${g(64,46,A("a-bob",`<path d="M-44-24h88a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10h-62l-14 12v-12h-12a10 10 0 0 1-10-10v-26a10 10 0 0 1 10-10z" fill="${W}"/>`+[-16,0,16].map((x,i)=>g(x,-1,A("a-blink",`<circle r="5" fill="${K}" stroke="none"/>`,`--d:${i*.25}s;--t:1.2s`))).join("")))}
 ${g(136,96,A("a-bob",`<path d="M-44-24h88a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10h-12v12l-14-12h-62a10 10 0 0 1-10-10v-26a10 10 0 0 1 10-10z" fill="${Y}"/>`+g(0,-2,A("a-beat",heart(O))),"--d:1.5s"))}`,
"1-1":`<rect x="46" y="40" width="100" height="58" rx="9" fill="${W}"/><rect x="146" y="58" width="10" height="22" rx="2" fill="${K}"/>
 ${g(55,49,A("a-charge",`<rect width="82" height="40" rx="4" fill="${T}" stroke="none"/>`,"transform-origin:0% 50%"))}
 ${g(96,69,A("a-pulse",`<path d="M4-20L-12 4h10l-4 16L14-4H4z" fill="${Y}"/>`))}
 <path d="M46 70H30Q18 70 18 84v30" fill="none"/><rect x="10" y="112" width="16" height="12" rx="2" fill="${O}"/>
 ${g(166,28,A("a-up",txt(0,0,14,"z",W)))}${g(178,40,A("a-up",txt(0,0,10,"z",W),"--d:1s"))}`,
"1-2":`<rect x="22" y="20" width="156" height="104" rx="8" fill="${W}"/><path d="M34 106h134M34 106V32" fill="none" stroke-width="2"/>
 ${A("a-draw",`<path d="M40 44L70 92 96 72 120 86 160 36" fill="none" stroke="${O}" stroke-width="5" pathLength="1"/>`,"--t:4s")}
 ${g(160,36,A("a-pop",`<path d="M-12 0L0-12 2 4z" fill="${O}" transform="rotate(10)"/>`+g(6,-14,star(9,Y)),"--d:1.6s;--t:4s"))}
 ${g(70,92,`<circle r="5" fill="${K}" stroke="none"/>`)}`,
"1-3":`${g(100,66,A("a-spin",rays(36,48,12),"--t:16s"))}${g(100,66,`<circle r="28" fill="${Y}"/><circle cx="-9" cy="-4" r="3" fill="${K}" stroke="none"/><circle cx="9" cy="-4" r="3" fill="${K}" stroke="none"/><path d="M-12 7Q0 19 12 7" fill="none"/><circle cx="-16" cy="6" r="4" fill="${O}" stroke="none" opacity=".6"/><circle cx="16" cy="6" r="4" fill="${O}" stroke="none" opacity=".6"/>`)}
 ${g(34,118,A("a-up",heart(O)))}${g(168,120,A("a-up",heart(V),"--d:1.2s"))}${g(58,122,A("a-up",`<g transform="scale(.6)">${heart(W)}</g>`,"--d:2s"))}`,
/* ===== Bab 3: Thinking Skill ===== */
"2-0":`<circle cx="100" cy="70" r="44" fill="none" stroke-dasharray="6 7"/>
 ${dot(5,"M100 26A44 44 0 1 1 99.9 26",W,5)}
 ${[[100,26,O],[144,70,Y],[100,114,T],[56,70,V]].map(([x,y,c],i)=>g(x,y,A("a-pulse",`<circle r="13" fill="${c}"/>`,`--d:${i*.5}s`))).join("")}
 ${g(100,70,A("a-spin",gear(9,W),"--t:7s"))}`,
"2-1":`<rect x="26" y="20" width="98" height="104" rx="6" fill="${W}"/>
 ${[0,1,2,3,4].map(i=>`<path d="M38 ${40+i*18}h${[70,56,74,48,64][i]}" fill="none" stroke-width="3"/>`).join("")}
 ${g(160,44,A("a-pop",`<rect x="-28" y="-11" width="56" height="22" rx="11" fill="${T}"/>`+txt(0,4,10,"FAKTA",W),"--t:4s"))}
 ${g(160,80,A("a-pop",`<rect x="-28" y="-11" width="56" height="22" rx="11" fill="${Y}"/>`+txt(0,4,10,"OPINI"),"--d:1s;--t:4s"))}
 ${g(160,114,A("a-pop",`<rect x="-28" y="-11" width="56" height="22" rx="11" fill="${O}"/>`+txt(0,4,10,"ASUMSI",W),"--d:2s;--t:4s"))}
 ${g(66,48,A("a-scanY",`<circle r="17" fill="#ffffff" fill-opacity=".45"/><path d="M12 12l14 14" fill="none" stroke-width="6"/>`))}`,
"2-2":`<rect x="18" y="16" width="164" height="110" rx="8" fill="${W}"/>
 ${A("a-draw",`<path d="M36 108Q60 70 92 96T150 46" fill="none" stroke="${V}" stroke-width="4" stroke-dasharray="1" pathLength="1"/>`,"--t:4s")}
 <circle cx="36" cy="108" r="7" fill="${O}"/>
 ${g(150,46,`<path d="M0 0V-26" fill="none"/>`+A("a-wig",`<path d="M0-26h20l-5 7 5 7H0z" fill="${O}"/>`,"transform-origin:0% 50%"))}
 ${g(72,46,`<path d="M-10 10L0-10 10 10z" fill="${T}"/>`)}${g(120,104,`<path d="M-8 8L0-8 8 8z" fill="${T}"/>`)}${g(132,104,`<circle r="5" fill="${Y}"/>`)}`,
"2-3":`<rect x="34" y="20" width="88" height="104" rx="6" fill="${W}"/>${[0,1,2,3,4,5].map(i=>`<circle cx="34" cy="${30+i*17}" r="4" fill="${Y}"/>`).join("")}
 ${[0,1,2,3].map(i=>A("a-draw",`<path d="M48 ${46+i*18}h${[60,48,62,40][i]}" fill="none" stroke-width="3" pathLength="1"/>`,`--d:${i*.6}s;--t:4s`)).join("")}
 ${g(156,50,A("a-spin",`<path d="M0-22A22 22 0 0 1 22 0M0 22A22 22 0 0 1-22 0" fill="none" stroke-width="4"/><path d="M22 0l-6-6M22 0l6-6M-22 0l-6 6M-22 0l6 6" fill="none" stroke-width="4"/>`,"--t:6s"))}
 ${g(156,50,`<circle r="9" fill="${O}"/>`)}${g(156,104,A("a-bob",txt(0,0,11,"STAR",W)))}`,
"2-4":`${[[40,34,O],[160,34,T],[34,104,V],[166,104,W],[100,128,O]].map(([x,y,c],i)=>A("a-draw",`<path d="M100 66L${x} ${y}" fill="none" stroke-width="3" pathLength="1"/>`,`--d:${i*.3}s;--t:4.5s`)+g(x,y,A("a-pop",`<circle r="12" fill="${c}"/>`,`--d:${i*.3+.4}s;--t:4.5s`))).join("")}
 ${g(100,60,bulb(20))}${g(150,64,A("a-blink",spark(Y)))}${g(56,70,A("a-blink",spark(W),"--d:.8s"))}`,
/* ===== kartu fitur beranda ===== */
u0:`<rect x="40" y="96" width="120" height="18" rx="3" fill="${O}"/><rect x="48" y="78" width="104" height="18" rx="3" fill="${T}"/>
 <path d="M100 74V28Q80 20 52 26v48Q80 68 100 74Q120 68 148 74V26Q120 20 100 28" fill="${W}"/>
 ${g(100,28,A("a-flip",`<path d="M0 0Q20-8 46-2v48Q20 40 0 46z" fill="${Y}"/>`,"transform-origin:0% 50%"))}`,
u1:`<rect x="30" y="22" width="140" height="88" rx="8" fill="${W}"/>${g(100,62,A("a-pulse",`<circle r="22" fill="${O}"/><path d="M-6-11l17 11-17 11z" fill="${W}"/>`))}
 <rect x="44" y="96" width="112" height="6" rx="3" fill="#dfe3f5" stroke="none"/>${g(44,96,A("a-charge",`<rect width="112" height="6" rx="3" fill="${T}" stroke="none"/>`,"transform-origin:0% 50%"))}<path d="M84 112l-6 16M116 112l6 16M70 128h60" fill="none"/>`,
u2:`<rect x="40" y="14" width="120" height="114" rx="8" fill="${W}"/>
 ${["A","B","C","D"].map((t,i)=>`<rect x="52" y="${26+i*25}" width="96" height="19" rx="9" fill="${i===1?Y:"#eef1fb"}"/>${txt(64,40+i*25,10,t)}`).join("")}
 ${g(134,61,tick(.2))}${g(160,16,A("a-pop",star(12,O),"--t:3s"))}`,
u3:`${g(40,70,`<rect x="-18" y="-14" width="36" height="28" rx="4" fill="${O}"/><path d="M-8-14v-5h16v5" fill="none"/>`)}
 ${["M58 70Q100 70 108 30","M58 70H120","M58 70Q100 70 108 110"].map((d,i)=>A("a-draw",`<path d="${d}" fill="none" stroke-width="3" pathLength="1"/>`,`--d:${i*.4}s;--t:4s`)).join("")}
 ${[[136,30,T],[148,70,Y],[136,110,V]].map(([x,y,c],i)=>g(x,y,A("a-pop",`<rect x="-22" y="-12" width="44" height="24" rx="12" fill="${c}"/>`+txt(0,4,10,["A","B","C"][i],c===Y?K:W),`--d:${i*.4+.6}s;--t:4s`))).join("")}`,
u4:`${g(100,68,`<circle r="44" fill="${W}"/>`+[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<path d="M0-38v${i%3?3:7}" transform="rotate(${i*30})" fill="none" stroke-width="2.5"/>`).join(""))}
 ${g(100,68,A("a-spin",`<path d="M0 0V-32" fill="none" stroke-width="3.5" stroke="${O}"/>`,"transform-origin:50% 100%;--t:4s"))}
 ${g(100,68,A("a-spin",`<path d="M0 0V-22" fill="none" stroke-width="5"/>`,"transform-origin:50% 100%;--t:48s"))}<circle cx="100" cy="68" r="5" fill="${K}"/>`,
/* ===== katalog & halaman ===== */
el:`<rect x="30" y="16" width="140" height="92" rx="8" fill="${W}"/><path d="M14 108h172l-10 16H24z" fill="${V}"/>
 ${[0,1,2].map(i=>g(46+i*38,34,A("a-bob",`<rect width="32" height="58" rx="5" fill="${[O,Y,T][i]}"/><rect x="5" y="40" width="22" height="5" rx="2" fill="${W}" stroke="none"/>`,`--d:${i*.4}s`))).join("")}`,
kontak:`<rect x="34" y="50" width="96" height="66" rx="6" fill="${W}"/><path d="M34 54l48 34 48-34" fill="none"/>
 ${g(146,40,A("a-fly",`<path d="M-20 4L22-14 6 18 0 6z" fill="${Y}"/><path d="M0 6L22-14" fill="none" stroke-width="2"/>`))}
 ${A("a-draw",`<path d="M64 36Q100 6 128 34" fill="none" stroke-dasharray="1" stroke-width="2" pathLength="1"/>`,"--t:3s")}`,
team:`${[[52,O,K],[100,T,"#7a3b1d"],[148,V,K]].map(([x,c,h],i)=>g(x,72,A("a-bob",bust(c,h,14),`--d:${i*.5}s`))).join("")}
 ${g(100,24,A("a-pop",`<rect x="-24" y="-12" width="48" height="24" rx="12" fill="${W}"/>`+g(0,1,`<g transform="scale(.6)">${heart(O)}</g>`),"--t:3.5s"))}`,
faq:`${g(92,60,A("a-wig",`<path d="M-50-38h100a12 12 0 0 1 12 12v44a12 12 0 0 1-12 12h-58l-18 16v-16h-24a12 12 0 0 1-12-12v-44a12 12 0 0 1 12-12z" fill="${W}"/>`+txt(0,16,46,"?",V),"--t:2.4s"))}
 ${g(162,100,A("a-pop",`<circle r="15" fill="${Y}"/>`+txt(0,6,16,"!"),"--t:3s"))}${g(34,112,A("a-pop",`<circle r="11" fill="${O}"/>`+txt(0,4,12,"?",W),"--d:1s;--t:3s"))}`,
tujuan:`${g(84,72,`<circle r="48" fill="${O}"/><circle r="36" fill="${W}"/><circle r="24" fill="${O}"/><circle r="12" fill="${Y}"/>`)}
 ${g(84,72,A("a-hit",`<path d="M0 0L96-30" fill="none" stroke-width="4"/><path d="M96-30l-14 0 4-8zM96-30l-6 12 10 0z" fill="${T}"/><path d="M0 0" />`))}`,
petunjuk:`<path d="M100 130V30" fill="none" stroke-width="6"/>
 ${g(100,40,A("a-wig",`<path d="M-4-12h56l12 12-12 12H-4z" fill="${Y}"/>`,"transform-origin:0% 50%"))}
 ${g(100,74,A("a-wig",`<path d="M4-12h-56l-12 12 12 12H4z" fill="${T}"/>`,"transform-origin:100% 50%;--d:.6s"))}
 ${g(100,104,A("a-wig",`<path d="M-4-10h44l10 10-10 10H-4z" fill="${O}"/>`,"transform-origin:0% 50%;--d:1.2s"))}<path d="M70 130h60" fill="none"/>`,
alur:`<path d="M24 104Q50 40 80 80T140 60 180 40" fill="none" stroke-dasharray="6 7"/>
 ${[[24,104,O,"1"],[80,80,Y,"2"],[140,60,T,"3"],[180,40,V,"4"]].map(([x,y,c,t])=>g(x,y,`<circle r="13" fill="${c}"/>`+txt(0,5,13,t,c===Y?K:W))).join("")}
 ${dot(5,"M24 104Q50 40 80 80T140 60 180 40",W,6)}`,
peta:`${[[50,72],[150,72],[100,122]].map(([x,y],i)=>A("a-draw",`<path d="M100 30L${x} ${y}" fill="none" pathLength="1"/>`,`--d:${i*.3}s;--t:4.5s`)).join("")}
 ${[[30,118],[70,118]].map(([x,y],i)=>A("a-draw",`<path d="M50 72L${x} ${y}" fill="none" pathLength="1"/>`,`--d:${.9+i*.3}s;--t:4.5s`)).join("")}
 ${g(100,30,`<rect x="-26" y="-13" width="52" height="26" rx="13" fill="${Y}"/>`)}
 ${[[50,72,O],[150,72,T],[100,122,V],[30,118,W],[70,118,W]].map(([x,y,c],i)=>g(x,y,A("a-pop",`<circle r="${i<3?13:9}" fill="${c}"/>`,`--d:${i*.3+.3}s;--t:4.5s`))).join("")}${g(150,72,tick(1.5))}`,
glosarium:`<path d="M100 40Q74 26 30 32v80q44-6 70 8q26-14 70-8V32q-44-6-70 8z" fill="${W}"/><path d="M100 40v80" fill="none"/>
 ${g(64,74,A("a-pop",txt(0,10,34,"A",O),"--t:3s"))}${g(136,74,A("a-pop",txt(0,10,34,"Z",V),"--d:1.5s;--t:3s"))}
 ${g(100,40,A("a-flip",`<path d="M0 0q26-14 60-10v76q-34-4-60 10z" fill="${Y}" opacity=".9"/>`,"transform-origin:0% 50%;--t:4s"))}`,
latihan:`${g(70,74,`<circle r="40" fill="${W}"/><rect x="-8" y="-52" width="16" height="10" rx="2" fill="${O}"/>`)}
 ${g(70,74,A("a-spin",`<path d="M0 0V-30" fill="none" stroke-width="4" stroke="${O}"/>`,"transform-origin:50% 100%;--t:3s"))}<circle cx="70" cy="74" r="5" fill="${K}"/>
 <rect x="124" y="30" width="60" height="84" rx="6" fill="${Y}"/>${[0,1,2].map(i=>g(140,52+i*22,tick(i*.5))+`<path d="M152 ${52+i*22}h22" fill="none" stroke-width="2.5"/>`).join("")}`,
shield:`<path d="M100 16l44 14v36c0 30-22 48-44 56-22-8-44-26-44-56V30z" fill="${T}"/>
 ${g(100,68,A("a-draw",`<path d="M-18 0l12 12 26-26" fill="none" stroke="${W}" stroke-width="8" pathLength="1"/>`,"--t:3.5s"))}
 ${g(160,30,A("a-blink",spark(W)))}${g(40,108,A("a-blink",spark(Y),"--d:1s"))}`,
/* ===== kegiatan belajar bareng ===== */
k0:`<rect x="40" y="16" width="96" height="112" rx="6" fill="${W}"/><rect x="40" y="16" width="96" height="26" rx="6" fill="${O}"/>${txt(88,34,13,"LOKER",W)}
 ${[0,1,2,3].map(i=>`<path d="M54 ${58+i*16}h${[66,50,60,40][i]}" fill="none" stroke-width="3"/>`).join("")}
 ${g(160,96,A("a-blink",`<path d="M0-18L18 14H-18z" fill="${Y}"/>`+txt(0,10,16,"!")))}
 ${g(88,66,A("a-scanY",`<circle r="16" fill="#ffffff" fill-opacity=".45"/><path d="M11 11l14 14" fill="none" stroke-width="6"/>`))}`,
k1:`${g(52,82,bust(T,K,15))}${g(148,82,bust(O,"#7a3b1d",15))}<path d="M20 130h160" fill="none"/>
 ${g(70,30,A("a-pop",`<rect x="-30" y="-14" width="60" height="28" rx="14" fill="${W}"/>`+txt(0,5,11,"KENAPA?"),"--t:4s"))}
 ${g(132,30,A("a-pop",`<rect x="-30" y="-14" width="60" height="28" rx="14" fill="${Y}"/>`+txt(0,5,11,"STAR"),"--d:2s;--t:4s"))}`,
k2:`<circle cx="100" cy="70" r="40" fill="none" stroke-dasharray="6 7"/>
 ${g(100,70,A("a-spin",`<path d="M40 0l-7-8M40 0l7-8M-40 0l-7 8M-40 0l7 8" fill="none" stroke-width="3.5"/>`,"--t:8s"))}
 ${[[100,30,O],[140,70,Y],[100,110,T],[60,70,V]].map(([x,y,c],i)=>g(x,y,A("a-bob",`<circle r="14" fill="${c}"/>`+g(0,1,`<g transform="scale(.55)">${face(14)}</g>`),`--d:${i*.4}s`))).join("")}`,
k3:`${[[46,O],[100,T],[154,V]].map(([x,c],i)=>g(x,84,bust(c,K,13))+g(x,30,A("a-pop",star(13,[Y,W,Y][i]),`--d:${i*.5}s;--t:4s`))).join("")}`,
k4:`<path d="M100 36Q76 24 36 30v84q40-6 64 6q24-12 64-6V30q-40-6-64 6z" fill="${W}"/><path d="M100 36v84" fill="none"/>
 ${g(68,62,A("a-beat",heart(O)))}
 ${[0,1,2].map(i=>A("a-draw",`<path d="M112 ${58+i*16}h${[40,30,36][i]}" fill="none" stroke-width="3" pathLength="1"/>`,`--d:${i*.6}s;--t:4s`)).join("")}
 ${g(160,100,A("a-slide",`<path d="M0 0l20-20 6 6-20 20-8 2z" fill="${Y}"/>`))}`
};
L.k5=L["2-4"];L.komunitas=L.team;L.tentang=L.team;
/* kartu fitur memakai indeks; halaman lama memakai kunci */
return k=>{const b=L[k]||L.course;return`<svg class="ill" viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${b}</g></svg>`}})();
const ILL=k=>ILLX(String(k));
/* animasi hanya berjalan untuk gambar yang terlihat (hemat baterai & tetap mulus) */
(()=>{const RMI=matchMedia("(prefers-reduced-motion:reduce)").matches;
 const io="IntersectionObserver" in window?new IntersectionObserver(es=>es.forEach(e=>{const v=e.isIntersecting&&!RMI;e.target.classList.toggle("on",v);try{v?e.target.unpauseAnimations():e.target.pauseAnimations()}catch(_){}}),{rootMargin:"60px"}):null;
 let q=0;const scan=()=>{q=0;document.querySelectorAll("svg.ill:not([data-io])").forEach(s=>{s.setAttribute("data-io","");if(io){try{s.pauseAnimations()}catch(_){}io.observe(s)}else if(!RMI)s.classList.add("on")})};
 new MutationObserver(()=>{if(!q)q=requestAnimationFrame(scan)}).observe(document.body,{childList:true,subtree:true});scan()})();
const G=(f,i,b,r,a=12)=>`<g data-par="${f}"${r?` data-rot="${r}"`:""}><g class="pop" style="--i:${i}"><g class="fl" style="--d:${i*1.7};--a:${a}">${b}</g></g></g>`;
($("#hero-art")||{}).innerHTML=`<svg viewBox="0 0 600 520"><g stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
${G(.25,0,`<ellipse cx="310" cy="280" rx="230" ry="215" fill="${Y}" stroke="none"/>`,0,4)}
${G(.4,1,`<path d="M150 70q0-26 30-26 8-24 40-16 24-4 34 16 30 2 28 26z" fill="${W}" stroke="none"/>`,0,6)}
${G(.07,2,`<path d="M40 410h520" /><rect x="60" y="404" width="480" height="16" rx="4" fill="${K}"/><path d="M90 420v70M510 420v70"/>
<path d="M214 330Q250 372 292 380" fill="none" stroke="${V}" stroke-width="26"/><rect x="130" y="290" width="96" height="116" rx="32" fill="${V}"/>
<rect x="268" y="286" width="190" height="114" rx="8" fill="${K}"/><rect x="278" y="296" width="170" height="94" fill="#fff3d6" stroke="none"/>
<rect rx="4" x="296" y="350" width="20" height="30" fill="${O}"/><rect rx="4" x="324" y="334" width="20" height="46" fill="${T}"/><rect rx="4" x="352" y="318" width="20" height="62" fill="${Y}"/><rect rx="4" x="380" y="342" width="20" height="38" fill="${V}"/><path d="M296 322l30-10 28 8 50-18" fill="none" stroke="${K}" stroke-width="3"/>
<rect x="248" y="398" width="230" height="10" rx="5" fill="${K}"/><circle cx="294" cy="380" r="12" fill="${SK}"/>
<circle cx="178" cy="250" r="38" fill="${SK}"/><path d="M140 248Q146 204 182 208 216 212 216 248 196 228 140 248z" fill="${K}"/>
<path d="M138 252Q178 192 218 252" fill="none" stroke-width="7"/><rect x="130" y="244" width="16" height="30" rx="7" fill="${O}"/><rect x="210" y="244" width="16" height="30" rx="7" fill="${O}"/>
<circle cx="166" cy="258" r="3.5" fill="${K}"/><circle cx="192" cy="258" r="3.5" fill="${K}"/><path d="M168 272Q179 282 190 272" fill="none" stroke-width="3"/>
<rect x="76" y="360" width="40" height="44" rx="6" fill="${O}"/><path d="M96 360q-30-30-6-50 20 20 6 50M96 360q30-24 20-52-24 16-20 52" fill="${T}"/>`,0,3)}
${G(-.22,3,`<g transform="rotate(-14 90 150)"><rect x="46" y="122" width="88" height="58" rx="4" fill="${O}"/><rect x="54" y="130" width="72" height="42" fill="${W}" stroke="none"/><path d="M90 122v58M64 144h18M98 144h18" /></g>`,2.5)}
${G(-.34,4,`<circle cx="505" cy="170" r="34" fill="${Y}"/><rect x="491" y="204" width="28" height="16" rx="4" fill="${W}"/><path d="M505 118v-14M462 134l-10-8M548 134l10-8M450 170h-14M560 170h14" fill="none"/><path d="M495 172l10 10 10-10" fill="none" stroke-width="3"/>`,-3)}
${G(-.16,5,`<rect x="320" y="60" width="136" height="96" rx="8" fill="${W}"/><rect rx="4" x="340" y="110" width="18" height="30" fill="${T}"/><rect rx="4" x="368" y="92" width="18" height="48" fill="${O}"/><rect rx="4" x="396" y="76" width="18" height="64" fill="${V}"/><path d="M340 74h50" fill="none"/>`,1.5)}
${G(-.28,6,`<g transform="rotate(-35 520 310)"><rect x="470" y="298" width="90" height="24" rx="4" fill="${Y}"/><path d="M560 298l28 12-28 12z" fill="${SK}"/><path d="M482 298v24" /></g>`,-4)}
${G(-.4,7,`<path d="M44 300l80-34-26 74-14-26z" fill="${T}"/><path d="M110 274l-26 40" fill="none"/>`,6)}
</g></svg>`;
($("#done-art")||{}).innerHTML=`<svg viewBox="0 0 400 270"><g stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
${G(0,0,`<circle cx="200" cy="150" r="115" fill="${Y}" stroke="none"/>`,0,5)}
${G(0,1,`<path d="M176 160L136 96M224 160L264 96" fill="none" stroke="${V}" stroke-width="22"/><rect x="164" y="146" width="72" height="92" rx="26" fill="${V}"/><path d="M184 238v22M216 238v22" fill="none" stroke-width="8"/><circle cx="136" cy="92" r="11" fill="${SK}"/><circle cx="264" cy="92" r="11" fill="${SK}"/><circle cx="200" cy="112" r="32" fill="${SK}"/><path d="M168 108Q172 74 204 78 232 82 232 108 214 92 168 108z" fill="${K}"/><circle cx="190" cy="116" r="3.5" fill="${K}"/><circle cx="210" cy="116" r="3.5" fill="${K}"/><path d="M188 126Q200 138 212 126" fill="none" stroke-width="3"/>`,0,3)}
${G(0,2,`<path d="M200 6l10 22 24 3-18 16 5 24-21-12-21 12 5-24-18-16 24-3z" fill="${O}"/>`,0,8)}
${G(0,3,`<rect rx="4" x="60" y="60" width="16" height="16" fill="${T}" transform="rotate(20 68 68)"/><rect rx="4" x="330" y="80" width="16" height="16" fill="${O}" transform="rotate(-20 338 88)"/><circle cx="324" cy="190" r="9" fill="${W}"/><circle cx="70" cy="180" r="9" fill="${V}"/>`,0,16)}
<path d="M30 262h340" fill="none"/></g></svg>`;
const WK=`<div class="walker"><svg viewBox="0 0 60 84"><g stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="10" y="32" width="14" height="26" rx="5" fill="${O}"/><rect x="16" y="30" width="30" height="32" rx="12" fill="${V}"/><path d="M24 62v16M38 62v16" fill="none" stroke-width="5"/><circle cx="32" cy="18" r="13" fill="${SK}"/><path d="M19 16Q22 3 33 5 43 7 45 17 38 10 19 16z" fill="${K}"/><circle cx="36" cy="20" r="2" fill="${K}"/></g></svg></div>`;
function moveW(el){const w=$(".walker");if(w&&el)w.style.top=(el.offsetTop+el.offsetHeight/2-42)+"px"}
function par0(){$$("[data-par]").forEach(e=>{const s=e.closest(".blk");if(!s)return;const b=s.getBoundingClientRect().top;if(b>innerHeight*1.5||b<-s.offsetHeight-300)return;e.style.setProperty("--py",(-b*e.dataset.par).toFixed(1));if(e.dataset.rot)e.style.setProperty("--pr",(-b*e.dataset.rot/100).toFixed(1))})}
let pq=0;addEventListener("scroll",()=>{if(!pq)pq=requestAnimationFrame(()=>{pq=0;par()})},{passive:true});addEventListener("resize",par);

/* ---------- v3: content builders + Kage-style pinned scene ---------- */
let burst=0,pa_=-1,mqv=1,ly2=scrollY,mqt=0;
const SKN=["#f2b48c","#d99a72","#fbd0aa","#a8704c"],HRC=[K,"#5a3a22","#8a5a2b",K],CLC=[V,O,T,Y,"#3b82f6"],BGC=["#ffd8a0","#bfe3ff","#b8efd0","#e3dcff","#ffc9b8"];
const AV=i=>`<svg viewBox="0 0 80 80" aria-hidden="true"><rect width="80" height="80" fill="${BGC[i%5]}"/><g stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M12 82q4-24 28-24t28 24z" fill="${CLC[i%5]}"/><circle cx="40" cy="36" r="17" fill="${SKN[i%4]}"/><path d="${i%2?"M22 36q-2-20 18-20t18 20q-8-10-18-9t-18 9z":"M23 34q0-20 17-20t17 20q-6-6-17-6t-17 6z"}" fill="${HRC[i%4]}"/><circle cx="34" cy="38" r="1.8" fill="${K}"/><circle cx="46" cy="38" r="1.8" fill="${K}"/><path d="M35 45q5 4 10 0" fill="none" stroke-width="2.5"/></g></svg>`;
const CO=["#6d4cff","#ff5a3c","#14b8a6","#1c2f6e","#ffc83d","#ff7a3d"];
/* ide kegiatan belajar bersama (halaman #/komunitas) */
const KOMD=[
 {t:"Bedah lowongan bareng",d:"Bersama 3–4 teman, pilih satu lowongan kerja nyata lalu bedah bersama: mana fakta, mana opini, dan apa saja tanda lowongan palsu.",s:["Setiap orang membawa satu lowongan dari sumber berbeda.","Pilah informasinya ke kolom Fakta, Opini, dan Asumsi.","Cek situs resmi perusahaan dan sepakati apakah lowongan itu layak dilamar."],les:[[2,1],[2,2]]},
 {t:"Latihan wawancara berpasangan",d:"Bergantian menjadi pewawancara dan kandidat. Kandidat menjawab dengan metode STAR, pewawancara mendengarkan secara aktif.",s:["Siapkan lima pertanyaan wawancara yang umum.","Kandidat menjawab dengan Situation, Task, Action, Result.","Pewawancara memparafrasekan jawaban, lalu memberi satu masukan spesifik."],les:[[2,3],[1,4]]},
 {t:"Lingkaran umpan balik",d:"Latih cara memberi dan menerima kritik secara profesional dalam kelompok kecil yang saling mendukung.",s:["Setiap orang menunjukkan satu karya: CV, portofolio, atau presentasi singkat.","Teman memberi satu hal yang sudah baik dan satu saran yang bisa ditindaklanjuti.","Penerima kritik berlatih jeda, berterima kasih, lalu menulis actionable insight-nya."],les:[[1,2],[0,2]]},
 {t:"Peta kekuatan kelompok",d:"Kenali kekuatan masing-masing anggota dengan metode S.I.G.N, lalu bagi peran tim berdasarkan kekuatan itu.",s:["Setiap orang menulis tiga aktivitas yang membuatnya lupa waktu.","Teman memberi validasi: kapan mereka melihatmu paling bersinar?","Susun pembagian peran tim yang saling melengkapi kelemahan."],les:[[0,0],[1,0]]},
 {t:"Jurnal syukur dan refleksi mingguan",d:"Sepakati kebiasaan kecil bersama: menulis tiga hal yang disyukuri dan satu refleksi What, So what, Now what setiap minggu.",s:["Tulis tiga hal kecil yang disyukuri setiap hari.","Akhir pekan, tulis refleksi What, So what, Now what tentang proses mencari kerja.","Saling berbagi satu rencana perbaikan untuk minggu depan."],les:[[1,3],[2,3],[0,4]]},
 {t:"Tantangan ide kreatif",d:"Gunakan brainstorming dan mind map untuk mencari cara kreatif menunjukkan kemampuan, meski belum punya pengalaman kerja.",s:["Tulis topik “Cara menunjukkan kemampuanku” di tengah kertas.","Brainstorming 10 menit tanpa menilai ide.","Pilih satu ide, buat versi sederhananya, lalu minta masukan teman."],les:[[2,4],[2,0]]}];
const KOMT=KOMD.map(k=>k.t);
const FAQ=[
 ["Apa itu GrowthLab?","GrowthLab adalah media pembelajaran interaktif berbasis website berjudul <b>Self Development for Job Seeker</b>. Media ini dibuat untuk membantu siswa SMK kelas XII dan <i>fresh graduate</i> mengembangkan soft skill sebelum dan selama mencari kerja."],
 ["Materinya apa saja?","Ada 3 bab dengan 15 pelajaran: Self-Management, Emotional Intelligence, dan Thinking Skill. Setiap pelajaran berisi uraian, konsep penting, diagram, contoh kasus, dan ringkasan."],
 ["Apakah berbayar?","Tidak. GrowthLab gratis untuk pembelajaran dan tidak memerlukan akun."],
 ["Bagaimana progres dan nilai disimpan?","Progres pelajaran dan hasil latihan tersimpan otomatis di browser yang kamu pakai (localStorage). Kalau kamu membersihkan data browser atau berganti perangkat, progresnya tidak ikut pindah."],
 ["Bagaimana nilai akhir dihitung?","Nilai Akhir = (Nilai Pilihan Ganda × 0,30) + (Nilai Simulasi × 0,70). Nilai pilihan ganda diambil dari skor terbaik kuis Gabungan, sedangkan nilai simulasi adalah gabungan berbobot tiga aspek (35%, 35%, 30%)."],
 ["Apa arti kategori kelulusan?","86–100 Sangat Siap Kerja, 71–85 Siap Kerja, 56–70 Cukup Siap / Perlu Latihan Lanjutan, dan di bawah 56 Belum Siap Kerja. Batas lulus pilihan ganda adalah 70."],
 ["Apakah ada sertifikat?","Prototipe ini belum menerbitkan sertifikat. Kategori kelulusanmu tampil di kartu Nilai Akhir pada menu Latihan."],
 ["Siapa yang membuat GrowthLab?","Kelompok 8 Program Studi Teknologi Pendidikan FIP UNJ (2024) sebagai tugas mata kuliah Pengembangan Multimedia Pendidikan. Materinya merujuk pada artikel MySkill di Medium."]];
$("#usp").innerHTML=[[C.chapters.length,"Bab materi","#/course"],[C.chapters.reduce((a,c)=>a+c.l.length,0),"Pelajaran soft skill","#/e-learning"],[GLX.nQuiz,"Soal kuis pilihan ganda","#/latihan/kuis"],[GLX.nSim,"Skenario simulasi kerja","#/latihan/sim"],["Mandiri","Belajar mandiri, kapan saja","#/petunjuk"]].map(([v,t,hf],i)=>`<a class="us" href="${hf}"><div class="ic" style="background:${BGC[i]}">${ILL("u"+i)}</div><strong>${v}</strong><span>${t}</span></a>`).join("");
$("#el-art").innerHTML=`<div class="frame" style="--c1:${CO[0]};width:100%">${ILL("el")}</div>`;
($("#kom")||{}).innerHTML=Array.from({length:6},(_,i)=>`<div data-par="${i%2?-.05:.06}"><a class="ph" href="#/komunitas/${i}" style="--r:${[-2,1.5,-1,2,-1.5,1][i]}deg"><div class="pic" style="--c1:${CO[i]}">${ILL("k"+i)}</div><p>${KOMT[i]}</p></a></div>`).join("");
$("#fq").innerHTML=FAQ.slice(0,5).map(([q,a],i)=>`<details${i?"":" open"}><summary>${q}</summary><p>${a}</p></details>`).join("");
function pin(){const p=$("#program");if(!p)return;const r=p.getBoundingClientRect();if(r.height<10)return;const pr=Math.min(1,Math.max(0,-r.top/(r.height-innerHeight))),a=Math.min(2,Math.floor(pr*3));
 if(a!==pa_){pa_=a;$$("#program [data-i]").forEach(e=>{const i=+e.dataset.i;e.classList.toggle("on",i===a);e.classList.toggle("off",i<a)});burst=1}}
function mq(){const d=Math.abs(scrollY-ly2);ly2=scrollY;mqv+=(1+Math.min(d,90)*.3-mqv)*.25;$$(".mq").forEach(e=>{const a=e.getAnimations()[0];if(a)a.playbackRate=mqv});clearTimeout(mqt);if(mqv>1.03)mqt=setTimeout(mq,60)}
function par(){par0();pin();mq()}
/* ---------- v4: akun + database (per pengguna, privat) ---------- */
let A={sync:false,name:"",email:"",id:null,color:"#6d4cff"},tt=0;
const RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),3000)}
function boom(x,y,n=26){if(RM)return;const cs=[O,Y,T,V,"#fff"];for(let i=0;i<n;i++){const e=document.createElement("i");e.className="cf";const a=Math.random()*6.283,d=70+Math.random()*150;e.style.cssText=`left:${x}px;top:${y}px;--c:${cs[i%5]};--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d-40).toFixed(0)}px;--r:${(Math.random()*720-360).toFixed(0)}deg`;document.body.appendChild(e);setTimeout(()=>e.remove(),1300)}}
$("#auth-art").innerHTML=`<svg viewBox="0 0 300 300"><g stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><circle cx="150" cy="165" r="118" fill="${Y}" stroke="none"/>
<g class="fl" style="--a:5"><path d="M112 205Q88 232 98 262" fill="none" stroke="${V}" stroke-width="24"/><rect x="105" y="172" width="90" height="112" rx="30" fill="${V}"/><circle cx="150" cy="130" r="40" fill="${SK}"/><path d="M110 126Q114 80 154 84 192 88 190 126 170 106 110 126z" fill="${K}"/><circle cx="138" cy="134" r="4" fill="${K}"/><circle cx="162" cy="134" r="4" fill="${K}"/><path d="M136 148Q150 162 164 148" fill="none"/>
<g class="wave" style="transform-origin:190px 205px"><path d="M190 205Q228 196 234 146" fill="none" stroke="${V}" stroke-width="24"/><circle cx="234" cy="134" r="13" fill="${SK}"/></g></g>
<g class="fl" style="--d:2;--a:9"><rect x="28" y="58" width="76" height="52" rx="6" fill="#fff"/><circle cx="50" cy="78" r="8" fill="${O}"/><path d="M66 74h28M66 88h20M40 98h52" fill="none" stroke-width="3"/></g>
<g class="fl" style="--d:4;--a:10"><path d="M246 44l7 16 17 2-13 11 4 17-15-9-15 9 4-17-13-11 17-2z" fill="${O}"/></g></g></svg>`;
/* ---------- v6: akun nyata (daftar, masuk, sesi, progres per akun) ---------- */
const mkStore=get=>{const mem={};let ok=true,s;try{s=get();s.setItem("gl-t","1");s.removeItem("gl-t")}catch(e){ok=false}
 return{ok,get:k=>{try{return ok?s.getItem(k):(mem[k]??null)}catch(e){return mem[k]??null}},set:(k,v)=>{try{ok?s.setItem(k,v):mem[k]=v}catch(e){mem[k]=v}},del:k=>{try{ok?s.removeItem(k):delete mem[k]}catch(e){delete mem[k]}}}};
const ST=mkStore(()=>localStorage),SS=mkStore(()=>sessionStorage);
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,norm=e=>(e||"").trim().toLowerCase();
let CFG={googleClientId:"",requireVerified:false},RT="",UI=null;
const FID={name:"an",email:"ae",password:"ap1",current:"acur",token:"aerr"};
/* 2026-10-20: mode server/akun dinonaktifkan; situs selalu berjalan lokal dan tidak memanggil jaringan apa pun */
async function api(p,o={}){const er=new Error("Fitur akun tidak tersedia di versi offline.");er.net=true;throw er}
const applyUser=u=>{UI=u;A={sync:true,id:u.id,name:u.name,email:u.email,color:u.color,verified:u.verified}};
const resetA=()=>{UI=null;A={sync:false,name:"",email:"",id:null,color:"#6d4cff"};done=new Set();ST.del("mer-done")};
let pt=0;
function push(){if(!A.sync)return;clearTimeout(pt);pt=setTimeout(flush,500)}
async function flush(){pt=0;if(!A.sync)return;try{await api("/progress",{method:"PUT",body:{done:[...done]}})}catch(e){if(e.status===401){resetA();renderAuth("login");refresh();toast("Sesi berakhir. Silakan masuk lagi.")}}}
function afterAuth(r,isNew){const u=r.user;done=new Set([...(r.done||[]),...done]);applyUser(u);ST.del("mer-done");
 flush();const first=u.name.split(" ")[0];renderAuth();refresh();closeAuth();boom(innerWidth/2,innerHeight/3,44);
 toast(isNew?`Selamat datang, ${first}! Akunmu sudah dibuat.`:`Selamat datang kembali, ${first}!`)}
async function signOut(){try{await flush()}catch(e){}try{await api("/logout",{method:"POST",body:{}})}catch(e){}resetA();renderAuth("login");refresh();closeAuth();toast("Kamu sudah keluar dari akun.")}
const strength=p=>{let n=0;if(p.length>=8)n++;if(p.length>=12)n++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))n++;if(/\d/.test(p))n++;if(/[^A-Za-z0-9]/.test(p))n++;return p.length<8?0:Math.min(4,Math.max(1,n-1))};
async function onGoogle(){}
function mountGoogle(){const box=$("#agoogle");if(box)box.hidden=true}
/* boot: konfigurasi, sesi, tautan dari email (?verify= / ?reset=) */
/* mode lokal: dibuka lewat file:// atau server statis (mis. python -m http.server) -> tanpa akun, semua tersimpan di browser */
async function hasServer(){return false}
async function boot(){const q=new URLSearchParams(location.search),vt=q.get("verify"),rt=q.get("reset");
 if(vt||rt)history.replaceState(null,"",location.pathname+location.hash);
 LOCAL=!(await hasServer());document.body.classList.toggle("glocal",LOCAL);
 if(LOCAL){renderAuth();return}
 try{const r=await api("/me");if(r.user){done=new Set([...(r.done||[]),...done]);applyUser(r.user);flush()}}catch(e){}
 renderAuth();refresh();
 if(vt){try{const r=await api("/verify",{method:"POST",body:{token:vt}});if(r.user)applyUser(r.user);renderAuth();toast(r.message)}catch(e){toast(e.message)}}
 if(rt){RT=rt;openAuth("reset")}}
let am="login";
const clearBad=()=>{$$("#auth .bad").forEach(e=>e.classList.remove("bad"));const e=$("#aerr");if(e)e.textContent=""};
function fail(id,msg){clearBad();const el=$("#"+id);if(el){el.classList.add("bad");el.focus()}$("#aerr").textContent=msg;const b=$("#auth .mbox");if(b&&!RM){b.animate([{transform:"translateX(0)"},{transform:"translateX(-8px)"},{transform:"translateX(8px)"},{transform:"translateX(0)"}],{duration:260})}}
function busyUI(on,label){const b=$("#asub");if(!b)return;b.disabled=on;b.textContent=on?"Memproses…":label}
function renderAuth(mode){const g=A.sync,first=(A.name||"").split(" ")[0]||"Pelajar";
 if(mode==="reset")am="reset";else if(g)am=(mode==="change")?"change":"account";else am=["register","forgot","reset"].includes(mode)?mode:"login";
 const tabs=`<div class="atabs" role="tablist"><button type="button" role="tab" aria-selected="${am==="login"}" data-m="login">Masuk</button><button type="button" role="tab" aria-selected="${am==="register"}" data-m="register">Daftar</button></div>`;
 const eye=`<button type="button" class="eye" data-eye aria-label="Tampilkan password">Lihat</button>`;
 const gbox=`<div id="agoogle" hidden style="display:grid;gap:10px;justify-items:center"><span class="hint">atau</span><div id="agbtn"></div></div>`;
 const meter=`<div class="meter" aria-hidden="true"><i id="amt"></i></div><span class="hint" id="amh">Gunakan huruf dan angka.</span>`;
 const L=["Terlalu pendek","Lemah","Cukup","Kuat","Sangat kuat"],CL=["#d92d20","#ff5a3c","#ffb020","#14b8a6","#0e9f6e"];
 const bindMeter=()=>{const e=$("#ap1");if(e)e.oninput=ev=>{const v=ev.target.value,s=strength(v);$("#amt").style.width=v?(s+1)*20+"%":"0";$("#amt").style.background=CL[s];$("#amh").textContent=v?`Kekuatan: ${L[s]}`:"Gunakan huruf dan angka."}};
 const run=(label,fn)=>async e=>{e.preventDefault();clearBad();busyUI(true);try{await fn()}catch(err){busyUI(false,label);fail(err.field||"aerr",err.message);if(err.code==="unverified")addResend()}};
 const addResend=()=>{const p=$("#aerr");if(!p||$("#arsd"))return;const b=document.createElement("button");b.type="button";b.id="arsd";b.className="chip";b.textContent="Kirim ulang email verifikasi";
  b.onclick=async()=>{try{const r=await api("/resend-verify",{method:"POST",body:{email:norm($("#ae").value)}});p.textContent=r.message;b.remove()}catch(e){p.textContent=e.message}};p.after(b)};
 if(am==="account"){const u=UI||{};
  $("#as").textContent="Akunku";$("#at").textContent=`Halo, ${first}!`;$("#ap").textContent="Progres belajarmu tersimpan di akunmu dan otomatis dimuat di perangkat mana pun saat kamu masuk.";
  $("#ab").innerHTML=`<div class="acc"><div class="who"><span class="ava" id="aav"></span><div><b id="aname"></b><small id="amail"></small></div></div><div class="stat"><span class="mono">Progres belajar</span><p id="astat"></p></div>${u.verified?`<p class="hint">✓ Email sudah terverifikasi.</p>`:`<p class="hint">Email belum diverifikasi. Cek inbox-mu. <a href="#" id="arv">Kirim ulang</a></p>`}<div class="row"><button class="btn p" id="acont" type="button">Lanjut belajar</button><button class="btn" id="aout" type="button">Keluar</button></div><p class="hint"><a href="#" data-m="change">${u.hasPassword?"Ganti password":"Buat password"}</a></p></div>`;
  $("#aav").textContent=first[0].toUpperCase();$("#aav").style.background=A.color;$("#aname").textContent=A.name;$("#amail").textContent=A.email;
  $("#astat").textContent=`${done.size} dari ${total} pelajaran selesai · ${Math.round(pct()*100)}%`+(u.created?` · bergabung ${new Date(u.created).toLocaleDateString("id-ID",{month:"long",year:"numeric"})}`:"");
  const rv=$("#arv");if(rv)rv.onclick=async e=>{e.preventDefault();try{const r=await api("/resend-verify",{method:"POST",body:{}});toast(r.message)}catch(er){toast(er.message)}};
  $("#acont").onclick=()=>{closeAuth();location.hash="#/course"};$("#aout").onclick=signOut}
 else if(am==="change"){const has=UI&&UI.hasPassword;
  $("#as").textContent="Keamanan";$("#at").textContent=has?"Ganti password":"Buat password";$("#ap").textContent=has?"Perangkat lain akan otomatis keluar setelah password diganti.":"Dengan password, kamu juga bisa masuk tanpa Google.";
  $("#ab").innerHTML=`<form class="af" id="af" novalidate>${has?`<label>Password saat ini<span class="pw"><input id="acur" type="password" autocomplete="current-password">${eye}</span></label>`:""}<label>Password baru<span class="pw"><input id="ap1" type="password" autocomplete="new-password" placeholder="Minimal 8 karakter">${eye}</span></label>${meter}<label>Ulangi password baru<span class="pw"><input id="ap2" type="password" autocomplete="new-password"></span></label><p class="aerr" id="aerr" role="alert"></p><button class="btn p" id="asub" type="submit">Simpan password</button></form><p class="hint"><a href="#" data-m="account">← Kembali</a></p>`;bindMeter();
  $("#af").onsubmit=run("Simpan password",async()=>{const p1=$("#ap1").value,p2=$("#ap2").value;
   if(p1.length<8)throw Object.assign(new Error("Password minimal 8 karakter."),{field:"ap1"});if(!/[A-Za-z]/.test(p1)||!/\d/.test(p1))throw Object.assign(new Error("Password harus berisi huruf dan angka."),{field:"ap1"});
   if(p1!==p2)throw Object.assign(new Error("Konfirmasi password tidak sama."),{field:"ap2"});
   await api("/change-password",{method:"POST",body:{current:has?$("#acur").value:undefined,password:p1}});UI.hasPassword=true;renderAuth("account");toast("Password berhasil disimpan.")})}
 else if(am==="forgot"){
  $("#as").textContent="Lupa password";$("#at").textContent="Atur ulang password";$("#ap").textContent="Masukkan emailmu. Kami kirim tautan untuk membuat password baru.";
  $("#ab").innerHTML=`<form class="af" id="af" novalidate><label>Email<input id="ae" type="email" autocomplete="email" inputmode="email" placeholder="nama@email.com"></label><p class="aerr" id="aerr" role="alert"></p><button class="btn p" id="asub" type="submit">Kirim tautan reset</button></form><p class="hint"><a href="#" data-m="login">← Kembali ke Masuk</a></p>`;
  $("#af").onsubmit=run("Kirim tautan reset",async()=>{const email=norm($("#ae").value);if(!EMAIL.test(email))throw Object.assign(new Error("Masukkan email yang valid."),{field:"ae"});
   const r=await api("/forgot",{method:"POST",body:{email}});$("#af").innerHTML=`<p class="hint" role="status">✓ ${r.message}</p>`})}
 else if(am==="reset"){
  $("#as").textContent="Password baru";$("#at").textContent="Buat password baru";$("#ap").textContent="Pilih password baru untuk akunmu.";
  $("#ab").innerHTML=`<form class="af" id="af" novalidate><label>Password baru<span class="pw"><input id="ap1" type="password" autocomplete="new-password" placeholder="Minimal 8 karakter">${eye}</span></label>${meter}<label>Ulangi password<span class="pw"><input id="ap2" type="password" autocomplete="new-password"></span></label><p class="aerr" id="aerr" role="alert"></p><button class="btn p" id="asub" type="submit">Simpan password</button></form>`;bindMeter();
  $("#af").onsubmit=run("Simpan password",async()=>{const p1=$("#ap1").value,p2=$("#ap2").value;
   if(p1.length<8)throw Object.assign(new Error("Password minimal 8 karakter."),{field:"ap1"});if(!/[A-Za-z]/.test(p1)||!/\d/.test(p1))throw Object.assign(new Error("Password harus berisi huruf dan angka."),{field:"ap1"});
   if(p1!==p2)throw Object.assign(new Error("Konfirmasi password tidak sama."),{field:"ap2"});
   const r=await api("/reset",{method:"POST",body:{token:RT,password:p1}});RT="";renderAuth("login");toast(r.message)})}
 else if(am==="login"){
  $("#as").textContent="Masuk";$("#at").textContent="Selamat datang kembali";$("#ap").textContent="Masuk untuk melanjutkan progres belajarmu.";
  $("#ab").innerHTML=`${tabs}<form class="af" id="af" novalidate><label>Email<input id="ae" type="email" autocomplete="email" inputmode="email" placeholder="nama@email.com"></label><label>Password<span class="pw"><input id="ap1" type="password" autocomplete="current-password" placeholder="Password kamu">${eye}</span></label><label class="chk2"><input type="checkbox" id="arem" checked> Ingat saya di perangkat ini</label><p class="aerr" id="aerr" role="alert"></p><button class="btn p" id="asub" type="submit">Masuk</button></form>${gbox}<p class="hint"><a href="#" data-m="forgot">Lupa password?</a> · Belum punya akun? <a href="#" data-m="register">Daftar gratis</a></p>`;
  $("#af").onsubmit=run("Masuk",async()=>{const email=norm($("#ae").value),pw=$("#ap1").value;
   if(!EMAIL.test(email))throw Object.assign(new Error("Masukkan email yang valid."),{field:"ae"});if(!pw)throw Object.assign(new Error("Password belum diisi."),{field:"ap1"});
   afterAuth(await api("/login",{method:"POST",body:{email,password:pw,remember:$("#arem").checked}}),false)});mountGoogle("signin_with")}
 else{
  $("#as").textContent="Daftar";$("#at").textContent="Buat akun baru";$("#ap").textContent="Gratis. Simpan progres belajarmu dan lanjutkan kapan saja.";
  $("#ab").innerHTML=`${tabs}<form class="af" id="af" novalidate><label>Nama lengkap<input id="an" type="text" autocomplete="name" placeholder="Nama kamu"></label><label>Email<input id="ae" type="email" autocomplete="email" inputmode="email" placeholder="nama@email.com"></label><label>Password<span class="pw"><input id="ap1" type="password" autocomplete="new-password" placeholder="Minimal 8 karakter">${eye}</span></label>${meter}<label>Ulangi password<span class="pw"><input id="ap2" type="password" autocomplete="new-password" placeholder="Ketik ulang password"></span></label><label class="chk2"><input type="checkbox" id="aterm"> <span>Saya setuju dengan <a href="#/terms">syarat &amp; ketentuan</a> dan <a href="#/privacy">kebijakan privasi</a>.</span></label><p class="aerr" id="aerr" role="alert"></p><button class="btn p" id="asub" type="submit">Buat akun</button></form>${gbox}<p class="hint">Sudah punya akun? <a href="#" data-m="login">Masuk</a></p>`;bindMeter();
  $("#af").onsubmit=run("Buat akun",async()=>{const name=$("#an").value.trim().replace(/\s+/g," "),email=norm($("#ae").value),p1=$("#ap1").value,p2=$("#ap2").value;
   if(name.length<2)throw Object.assign(new Error("Nama minimal 2 karakter."),{field:"an"});if(!EMAIL.test(email))throw Object.assign(new Error("Format email belum benar."),{field:"ae"});
   if(p1.length<8)throw Object.assign(new Error("Password minimal 8 karakter."),{field:"ap1"});if(!/[A-Za-z]/.test(p1)||!/\d/.test(p1))throw Object.assign(new Error("Password harus berisi huruf dan angka."),{field:"ap1"});
   if(p1!==p2)throw Object.assign(new Error("Konfirmasi password tidak sama."),{field:"ap2"});if(!$("#aterm").checked)throw Object.assign(new Error("Setujui syarat & ketentuan dulu."),{field:"aterm"});
   const r=await api("/register",{method:"POST",body:{name,email,password:p1,remember:true}});
   if(r.needsVerify){renderAuth("login");toast(r.message)}else{afterAuth(r,true);setTimeout(()=>toast(r.message),3200)}});mountGoogle("signup_with")}
 $("#auth").classList.toggle("sync",g);
 const b=$("#lg");b.textContent="";if(g){const s=document.createElement("span");s.className="ava";s.textContent=first[0].toUpperCase();s.style.background=A.color;b.append(s,first)}else b.textContent="Masuk";
 const e=$(".hero .mono");if(e)e.textContent=g?`Halo, ${first} · lanjutkan belajarmu`:"Media pembelajaran · Soft skill siap kerja"}
let lastF=null;function openAuth(m){lastF=document.activeElement;renderAuth(m);const modal=$("#auth");modal.hidden=false;requestAnimationFrame(()=>modal.classList.add("show"));setTimeout(()=>{const f=$("#an")||$("#ae")||$("#acont");f&&f.focus()},120)}
function closeAuth(){const m=$("#auth");m.classList.remove("show");lastF&&lastF.focus&&lastF.focus();setTimeout(()=>{m.hidden=true},350)}
$("#ab").addEventListener("click",e=>{const t=e.target.closest("[data-m]");if(t){e.preventDefault();renderAuth(t.dataset.m);const f=$("#an")||$("#ae");f&&f.focus();return}
 const y=e.target.closest("[data-eye]");if(y){const i=y.parentElement.querySelector("input"),sh=i.type==="password";i.type=sh?"text":"password";y.textContent=sh?"Sembunyi":"Lihat";y.setAttribute("aria-label",sh?"Sembunyikan password":"Tampilkan password");return}
 if(e.target.closest('a[href^="#/"]'))closeAuth()});
$("#lg").onclick=()=>{if(LOCAL)return;setMenu(false);openAuth()};$("#axc").onclick=closeAuth;
$("#auth").addEventListener("click",e=>{if(e.target.id==="auth")closeAuth()});addEventListener("keydown",e=>{const m=$("#auth");if(e.key==="Escape"){if(!m.hidden)closeAuth();else setMenu(false)}if(e.key==="Tab"&&!m.hidden){const f=[...m.querySelectorAll("button,a[href],input")].filter(x=>!x.disabled&&x.offsetParent);if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
function refresh(){const h=location.hash.replace("#/",""),v=document.body.dataset.view;updateProgress();if(v==="home"){renderPath();renderDiscover()}else if(v==="course")renderCourse();else if(v==="page")renderPage(h);else if(v==="lesson")renderLesson(...cur)}
renderAuth();boot();

/* ---------- v5: halaman-halaman ---------- */
const PK=["e-learning","komunitas","faq","kontak","terms","privacy","tentang","tujuan","petunjuk","alur","latihan","peta","glosarium"];
function vOfH(h){const s=h.split("/")[0];if(s==="lesson")return"lesson";if(s==="course")return"course";return PK.includes(s)?"page":"home"}
const keyOf=()=>{const h=location.hash.replace("#/",""),v=vOfH(h);return v==="home"?"home":v==="lesson"?"lesson":h};let lastK=keyOf();
const goC=n=>n?"#/course/"+n:"#/course";
const NAVK={lesson:"course","e-learning":"course",tujuan:"petunjuk",alur:"petunjuk",peta:"petunjuk",glosarium:"petunjuk"};
function navOn(h){const s0=h.split("/")[0],s=NAVK[s0]||s0;$$(".links a[data-k]").forEach(a=>a.classList.toggle("cur",a.dataset.k===s))}
const LT=["#bfe3ff","#ffd8a0","#b8efd0","#e3dcff"],CR="#fff3d6";
const A_=(h,t,c="")=>`<a class="btn ${c}" href="${h}">${t}</a>`;
const crumb=a=>`<nav class="crumb2 mono" aria-label="Breadcrumb"><a href="#/">Beranda</a>${a.map(([t,h])=>` / ${h?`<a href="${h}">${t}</a>`:`<span>${t}</span>`}`).join("")}</nav>`;
const hero=(bg,cr,kick,title,lead,btns,art)=>`<section class="blk phr" style="--b:${bg};--prev:transparent"><div class="wrap phg"><div>${crumb(cr)}<span class="mono rv" style="display:block;margin-top:20px">${kick}</span><h1 class="rv">${title}</h1><p class="lead rv" style="--d:.1s">${lead}</p><div class="row rv" style="--d:.18s">${btns}</div></div>${art}</div></section>`;
const sec=(bg,prev,inner,x="")=>`<section class="blk sc2" style="--b:${bg};--prev:${prev};${x}"><div class="wrap">${inner}</div></section>`;
const cta=(prev,t,b)=>sec("#ff5a3c",prev,`<div class="ctab"><h2 class="rv">${t}</h2><div class="rv">${b}</div></div>`,"--fg:#fff");
const fr=(c,k)=>`<div data-par=".05"><div class="rv" data-in="z"><div class="frame" style="--c1:${c}">${ILL(k)}</div></div></div>`;
const LES=C.chapters.flatMap((ch,i)=>ch.l.map((l,j)=>({i,j,ch,l,n:i*5+j})));
const lesLink=(i,j)=>`<a href="#/lesson/${i}-${j}">${esc(C.chapters[i].l[j].t)}</a>`;
const cardL=o=>`<a class="card" href="#/lesson/${o.i}-${o.j}"><div class="art" style="--c1:${o.ch.c1}">${ILL(o.i+"-"+o.j)}<em class="no">${p2(o.n+1)}</em></div><div class="body"><span class="mono">Bab ${p2(o.i+1)} · ${esc(o.ch.t)}</span><h3>${esc(o.l.t)}</h3><p style="color:var(--mut);font-size:.92rem">${esc(strip(o.l.judul))}</p><div class="tags"><span>${done.has(o.i+"-"+o.j)?"Selesai ✓":"Belum selesai"}</span>${o.l.draft?"<span>Draf</span>":""}</div></div></a>`;
const polK=i=>`<a class="ph" href="#/komunitas/${i}" style="--r:${[-2,1.5,-1,2,-1.5,1][i]}deg"><div class="pic" style="--c1:${CO[i]}">${ILL("k"+i)}</div><p>${KOMT[i]}</p></a>`;
const faqL=n=>`<div class="fq rv">${FAQ.slice(0,n).map(([q,a],i)=>`<details${i?"":" open"}><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>`;
const stp=(a)=>`<div class="stg rv">${a.map(([t,d],i)=>`<div class="stp"><b>${p2(i+1)}</b><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>`;
const lg2=a=>`<div class="lg2">${a.map(([t,d],i)=>`<h3 class="rv">${i+1}. ${t}</h3><p class="rv">${d}</p>`).join("")}</div>`;
const kt=a=>`<div class="kt rv">${a.map(([b,t])=>`<div><b>${b}</b><span>${t}</span></div>`).join("")}</div>`;
function renderPage(h){const[s,x,y]=h.split("/"),n=+x||0;let H="";const nQ=GLX.nQuiz,nS=GLX.nSim,nD=GLD.DND.length;
 if(s==="e-learning")H=hero(LT[0],[["Katalog pelajaran"]],"Materi","Katalog <em>pelajaran</em>",`Telusuri ${total} pelajaran di ${C.chapters.length} bab. Cari berdasarkan judul atau kata kunci, atau saring per bab.`,A_("#/course","Buka ringkasan kursus","p")+A_("#/peta","Peta konsep"),fr(CO[0],"el"))
  +sec(CR,LT[0],`<div class="sbar rv"><input id="q" type="search" placeholder="Cari pelajaran, misalnya: stres, STAR, empati…" aria-label="Cari pelajaran"><div class="chips" id="pchips" role="group" aria-label="Saring bab"></div></div><div class="el-top"><div class="chips" id="pst" role="group" aria-label="Saring status" style="margin:0"></div><span class="mono" id="ecount" aria-live="polite"></span></div><div class="grid" id="elg"></div><p id="none" hidden>Tidak ada pelajaran yang cocok. Coba kata kunci lain.</p>`)
  +sec("#3b2a8c",CR,`<h2 class="rv">Kenapa belajar di sini</h2><ul class="chk rv" style="color:#fff"><li>Materi disusun dari GBIM dan jabaran materi tim pengembang</li><li>Contoh kasus seputar melamar kerja, wawancara, dan magang</li><li>Kuis, drag &amp; drop, dan simulasi dengan nilai akhir yang transparan</li></ul>`,"--fg:#fff")
  +cta("#3b2a8c","Siap mulai belajar?",A_("#/course/1","Mulai dari Bab 1"));
 else if(s==="kontak")H=hero(LT[0],[["Kontak"]],"Kontak","Hubungi <em>tim</em>","Punya masukan untuk GrowthLab? Tulis pesanmu di bawah. Karena ini prototipe tugas kuliah, pesan belum dikirim ke mana pun.",A_("#/faq","Lihat FAQ","p"),fr(CO[0],"kontak"))
  +sec(CR,LT[0],`<h2 class="rv" id="kontak">Kirim pesan</h2><div class="fm rv"><label>Nama<input id="f1" autocomplete="name"></label><label>Email<input id="f3" type="email" autocomplete="email"></label><label>Pesan<textarea id="f4" rows="4"></textarea></label><button class="btn p" id="fs">Kirim pesan</button><small>Prototipe: pesan tidak dikirim dan tidak disimpan.</small></div>`);
 else if(s==="komunitas"&&!x)H=hero(LT[1],[["Belajar bareng"]],"Belajar bareng","Belajar <em>bareng</em> teman","Enam ide kegiatan kelompok untuk kelas atau teman belajar. Setiap ide terhubung ke pelajaran di GrowthLab.",A_("#/course","Buka materi","p"),fr(CO[4],"komunitas"))
  +sec("#ffc83d",LT[1],`<div class="pol">${KOMD.map((_,i)=>polK(i)).join("")}</div>`);
 else if(s==="komunitas"){const i=Math.min(n,KOMD.length-1),k=KOMD[i];H=hero("#ffc83d",[["Belajar bareng","#/komunitas"],[k.t]],"Ide kegiatan "+p2(i+1),k.t,k.d,A_(`#/lesson/${k.les[0][0]}-${k.les[0][1]}`,"Pelajari materinya","p")+A_("#/komunitas","Semua ide kegiatan"),fr(CO[i],"k"+i))
  +sec(CR,"#ffc83d",`<h2 class="rv">Langkah kegiatan</h2>${stp(k.s.map((t,j)=>["Langkah "+(j+1),t]))}<h2 class="rv" style="margin-top:44px">Pelajaran terkait</h2><ul class="chk rv">${k.les.map(([a,b])=>`<li>${lesLink(a,b)} · ${esc(C.chapters[a].t)}</li>`).join("")}</ul><p class="rv lead2" style="margin-top:18px">Saran pelaksanaan: 3–5 orang, 30–45 menit.</p>`)}
 else if(s==="faq")H=hero(LT[0],[["FAQ"]],"Bantuan","Yang sering <em>ditanyakan</em>","Belum menemukan jawabannya? Tanyakan ke asisten chat atau kirim pesan ke tim.",A_("#/kontak","Hubungi tim","p"),fr(CO[0],"faq"))+sec(CR,LT[0],faqL(FAQ.length))+cta(CR,"Masih ada pertanyaan?",A_("#/kontak","Kirim pesan"));
 else if(s==="tujuan")H=hero(LT[2],[["Tujuan belajar"]],"Panduan · Tujuan belajar","Tujuan <em>belajar</em>","Setelah menyelesaikan GrowthLab, kamu diharapkan mampu menerapkan soft skill untuk menghadapi proses mencari kerja dan dunia kerja.",A_("#/petunjuk","Petunjuk penggunaan","p")+A_("#/course","Mulai belajar"),fr(CO[2],"tujuan"))
  +sec(CR,LT[2],`<h2 class="rv">Tujuan umum</h2><p class="rv lead2">Peserta didik SMK kelas XII dan <i>fresh graduate</i> mampu mengembangkan diri (soft skill) melalui pengelolaan diri, kecerdasan emosional, dan keterampilan berpikir, sehingga lebih siap menghadapi proses rekrutmen dan dunia kerja.</p>
   <h2 class="rv" style="margin-top:40px">Tujuan per bab</h2><div class="tj rv">${C.chapters.map((ch,i)=>`<div><span class="mono">TIK/KD ${i+1}</span><h3>${esc(ch.t)}</h3><p style="margin-bottom:12px">Peserta didik mampu:</p><ol>${ch.l.map((l,j)=>`<li>${l.tuj} <small>(${lesLink(i,j)})</small></li>`).join("")}</ol></div>`).join("")}</div>`)
  +sec(LT[3],CR,`<h2 class="rv">Kompetensi yang dinilai</h2><p class="rv lead2">Pemahaman konsep diukur dengan kuis pilihan ganda (bobot 30%). Penerapan diukur lewat simulasi kasus dunia kerja (bobot 70%) pada tiga aspek:</p>${kt(GLD.SIM.map(sm=>[Math.round(sm.w*100)+"%",`<b style="font:700 1rem var(--sans)">${esc(sm.aspek)}</b>`]))}`)
  +cta(LT[3],"Siap mencapai tujuanmu?",A_("#/course/1","Mulai dari Bab 1"));
 else if(s==="petunjuk")H=hero(LT[0],[["Petunjuk penggunaan"]],"Panduan · Petunjuk penggunaan","Petunjuk <em>penggunaan</em>","Ikuti empat langkah berikut agar belajarmu di GrowthLab lancar.",A_("#/course","Mulai belajar","p")+A_("#/peta","Peta konsep")+A_("#/glosarium","Glosarium"),fr(CO[1],"petunjuk"))
  +sec(CR,LT[0],`<h2 class="rv">Langkah demi langkah</h2>${stp([["Pilih bab","Buka menu <b>Materi</b>, lalu pilih salah satu dari tiga bab. Kamu juga bisa memilih bab dari kartu di beranda."],["Baca dan tandai selesai","Baca uraian, konsep penting, diagram, dan contohnya. Tekan <b>Tandai selesai</b> atau <b>Pelajaran berikut</b>."],["Progres tersimpan","Progresmu tersimpan otomatis di browser ini. Ring progres, bilah di menu, dan jalur belajar ikut terisi."],["Kerjakan latihan","Buka menu <b>Latihan</b>: kuis, drag &amp; drop, dan simulasi. Nilaimu muncul di kartu <b>Nilai Akhir</b>."]])}`)
  +sec(LT[3],CR,`<h2 class="rv">Tips dan navigasi</h2><ul class="chk rv"><li>Di HP, tombol <b>Menu</b> membuka navigasi Materi, Latihan, dan Panduan.</li><li>Daftar pelajaran di sisi kiri halaman pelajaran memudahkanmu berpindah materi dalam satu bab.</li><li>Drag &amp; drop bisa dikerjakan dengan mouse, sentuhan, atau keyboard: pilih kartu (Tab lalu Enter), kemudian pilih kotak tujuan.</li><li>Pada tab Latihan, tombol panah kiri dan kanan berpindah antartab.</li><li>Tanyakan bab, latihan, atau cara menghitung nilai ke asisten chat (tombol <b>Tanya AI</b>). Di mode demo, jawabannya terbatas.</li><li>Progres hanya tersimpan di browser dan perangkat ini. Jangan hapus data situs jika ingin melanjutkan.</li></ul>`)
  +sec(LT[2],LT[3],`<h2 class="rv">Arti ikon dan tombol</h2><div class="ik rv">${[["up","Tombol bulat kiri bawah","Menggulir ke bawah, atau kembali ke atas setelah kamu menggulir jauh. Lingkarannya menunjukkan posisi baca.",""],["chat","Tanya AI","Asisten chat untuk pertanyaan seputar bab, latihan, dan nilai.",""],["bar","Progres kamu","Bilah di menu atas terisi sesuai pelajaran yang selesai. Klik untuk membuka ringkasan kursus.","#/course"],["chev","Panah bab","Membuka atau menutup daftar pelajaran pada halaman kursus.","#/course"],["check","Centang","Menandai pelajaran yang sudah selesai di daftar, peta konsep, dan jalur belajar.","#/peta"],["spark","Coba sendiri","Aktivitas interaktif di dalam pelajaran, misalnya simulator, kuis mini, dan alat bantu.","#/lesson/0-1"],["quiz","Cek cepat","Soal benar/salah di akhir setiap pelajaran untuk mengecek pemahamanmu.","#/lesson/0-0"],["note","Catatan pribadiku","Kolom catatan di setiap pelajaran yang tersimpan otomatis di browser.","#/lesson/0-0"],["map","Peta konsep","Peta seluruh isi GrowthLab. Klik simpulnya untuk membuka halaman terkait.","#/peta"],["abc","Glosarium","Arti istilah asing yang dipakai di materi.","#/glosarium"]].map(([ic,t,d,hf])=>`<div>${GLU.ico(ic,"ico ibg")}<div><b>${t}</b><p>${d}</p>${hf?`<a href="${hf}">Coba lihat →</a>`:""}</div></div>`).join("")}</div>`)
  +cta(LT[2],"Sudah siap?",A_("#/course/1","Mulai dari Bab 1"));
 else if(s==="alur")H=hero(LT[3],[["Alur belajar"]],"Panduan · Alur belajar","Alur <em>belajar</em>","Belajar di GrowthLab mengikuti empat tahap: materi, latihan soal, simulasi, lalu nilai akhir.",A_("#/course","Mulai dari materi","p")+A_("#/latihan","Ke Latihan"),fr(CO[3],"alur"))
  +sec(CR,LT[3],`<h2 class="rv">Empat tahap</h2>${stp([["Materi",`${C.chapters.length} bab, ${total} pelajaran: ${C.chapters.map(c=>esc(c.t)).join(", ")}.`],["Latihan soal",`Kuis pilihan ganda (${nQ} soal) dan drag &amp; drop (${nD} set) untuk menguji pemahaman konsep.`],["Simulasi",`${nS} skenario kasus dunia kerja dengan alur bercabang, satu skenario per aspek penilaian.`],["Nilai akhir","Gabungan nilai kuis (30%) dan simulasi (70%), lengkap dengan kategori kesiapan kerja."]])}`)
  +sec(LT[2],CR,`<h2 class="rv">Cara menghitung nilai</h2>${kt([["Kuis",`Benar = 1, salah = 0. Nilai = benar ÷ jumlah soal × 100. Batas lulus <b>${GLD.PASS_MCQ}</b>. Yang masuk nilai akhir adalah skor terbaik mode Gabungan.`],["Simulasi","Setiap pilihan bernilai 0–100. Skor aspek = rata-rata skor jalur yang kamu pilih. Nilai simulasi = (Aspek 1 × 0,35) + (Aspek 2 × 0,35) + (Aspek 3 × 0,30)."],["Akhir","Nilai Akhir = (Nilai Pilihan Ganda × 0,30) + (Nilai Simulasi × 0,70)."]])}
   <h2 class="rv" style="margin-top:44px">Kategori kelulusan</h2>${kt(GLD.KATEGORI.map(([t,m,d],i)=>[esc(GLS.score.katLabel(i)),`<b style="font:700 1rem var(--sans)">${esc(t)}</b><br>${esc(d)}`]))}
   <h2 class="rv" style="margin-top:44px">Level tiap aspek simulasi</h2>${kt(GLD.LEVEL.map(([t],i)=>[GLS.score.pitaLabel(i),t]))}
   <h2 class="rv" style="margin-top:44px">Rubrik penilaian simulasi</h2><div class="fq rv">${GLD.SIM.map((sm,i)=>`<details${i?"":" open"}><summary>Aspek ${i+1}: ${esc(sm.aspek)} (bobot ${Math.round(sm.w*100)}%)</summary><p>${GLD.DESK[sm.aspek].map((d,k)=>`<b>${GLD.LEVEL[k][0]} (${GLS.score.pitaLabel(k)}):</b> ${esc(d)}`).join("<br><br>")}</p></details>`).join("")}</div>`)
  +cta(LT[2],"Mulai dari tahap pertama",A_("#/course","Buka materi"));
 else if(s==="peta")H=hero(LT[1],[["Peta konsep"]],"Panduan · Peta konsep","Peta <em>konsep</em>","Seluruh isi GrowthLab dalam satu peta, mengikuti peta konsep tim. Klik simpul mana pun untuk langsung membukanya. Simpul bertanda centang sudah kamu selesaikan.",A_("#/course","Buka materi","p")+A_("#/glosarium","Glosarium"),fr(CO[3],"peta"))
  +sec(CR,LT[1],GLU.peta())+cta(CR,"Mulai menjelajah",A_("#/course/1","Mulai dari Bab 1"));
 else if(s==="glosarium")H=hero(LT[0],[["Glosarium"]],"Panduan · Glosarium","Glosarium <em>istilah</em>",`${GLD.GLOS.length} istilah asing yang dipakai di materi, lengkap dengan artinya dan tautan ke pelajarannya.`,A_("#/e-learning","Katalog pelajaran","p")+A_("#/peta","Peta konsep"),fr(CO[5],"glosarium"))
  +sec(CR,LT[0],GLU.glos());
 else if(s==="latihan")H=hero(LT[2],[["Latihan"]],"Latihan","Uji <em>kesiapanmu</em>","Kerjakan kuis pilihan ganda, drag &amp; drop, dan simulasi kasus dunia kerja. Nilai Akhir = (Pilihan Ganda × 0,30) + (Simulasi × 0,70).",`<a class="btn p" href="#/latihan" data-sc="nilai-sec">Lihat nilai akhir</a>`+A_("#/alur","Cara menghitung nilai"),fr(CO[2],"latihan"))
  +sec(CR,LT[2],GLX.tabsHTML())
  +`<section class="blk sc2" id="nilai-sec" style="--b:#0a1a6b;--prev:${CR};--fg:#fff"><div class="wrap"><h2 class="rv">Nilai akhir</h2><div id="nilai"></div></div></section>`;
 else if(s==="tentang")H=hero(LT[0],[["Tentang"]],"Tentang","Tentang <em>GrowthLab</em>","GrowthLab adalah prototipe media pembelajaran interaktif berbasis website yang dikembangkan sebagai tugas mata kuliah Pengembangan Multimedia Pendidikan.",A_("#/tujuan","Tujuan belajar","p")+A_("#/course","Buka materi"),fr(CO[0],"tentang"))
  +sec(CR,LT[0],`<h2 class="rv">Garis besar isi media</h2><table class="gb rv"><tbody>${[["Nama media",GLD.GBIM.media],["Judul proyek",GLD.GBIM.judul],["Media",GLD.GBIM.jenis],["Sasaran",GLD.GBIM.sasaran],["Topik",GLD.GBIM.topik],["Isi",`${C.chapters.length} bab, ${total} pelajaran, ${nQ} soal kuis, ${nD} set drag &amp; drop, ${nS} skenario simulasi`]].map(([a,b])=>`<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join("")}</tbody></table>`)
  +sec(LT[1],CR,`<h2 class="rv">Tim pengembang</h2><p class="rv lead2">Dibuat oleh Kelompok 8, Program Studi Teknologi Pendidikan, Fakultas Ilmu Pendidikan, Universitas Negeri Jakarta, 2024.</p><div class="team rv">${["Adam Faruq","Muhammad Azriel","Rifa Haqi Putra Wibowo","Thumpal Alvin"].map((nm,i)=>`<div><span class="tm" aria-hidden="true" style="display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:${[Y,O,T,V][i]};color:#fff;font:400 1.4rem var(--serif);margin-bottom:12px">${nm.split(" ").map(w=>w[0]).slice(0,2).join("")}</span>${nm}</div>`).join("")}</div>
   <h2 class="rv" style="margin-top:44px">Sumber materi</h2><p class="rv lead2">Materi disusun berdasarkan GBIM dan Jabaran Materi tim pengembang, dengan rujukan artikel seri soft skill MySkill.</p>`)
  +cta(LT[1],"Mulai belajar sekarang",A_("#/course/1","Buka Bab 1"));
 else{const T={terms:"Syarat &amp; ketentuan",privacy:"Kebijakan privasi"}[s]||"Informasi";
  const B=s==="privacy"?[["Data yang disimpan","Progres pelajaran (kunci <code>mer-done</code>) dan hasil latihan (kunci <code>gl-latihan</code>) disimpan di localStorage browser yang kamu pakai."],["Tidak dikirim ke server","Dalam mode lokal, tidak ada data yang dikirim ke server mana pun. Formulir kontak juga tidak mengirim pesan."],["Menghapus data","Gunakan tombol “Hapus semua hasil latihan” di menu Latihan, atau hapus data situs melalui pengaturan browser."],["Tanpa layanan pihak ketiga","Semua pustaka, font, dan gambar sudah ada di dalam paket situs, sehingga situs tidak menghubungi layanan lain dan bisa dipakai tanpa internet."]]
   :[["Tujuan penggunaan","GrowthLab adalah prototipe media pembelajaran untuk keperluan pendidikan, bukan layanan komersial."],["Akses","Gratis untuk pembelajaran dan tidak memerlukan akun. Situs dapat dibuka langsung dari file maupun dari server sederhana."],["Konten","Materi disusun oleh Kelompok 8 berdasarkan GBIM dan merujuk artikel MySkill di Medium. Hak cipta artikel sumber tetap milik penulisnya."],["Penilaian","Nilai dan kategori di menu Latihan adalah umpan balik belajar mandiri, bukan sertifikasi resmi dan bukan jaminan diterima kerja."]];
  H=hero(LT[0],[[T]],"Informasi",T,s==="privacy"?"Bagaimana GrowthLab menyimpan dan memperlakukan datamu.":"Ketentuan penggunaan prototipe GrowthLab.",A_("#/","Kembali ke beranda","p"),fr(CO[0],"shield"))+sec(CR,LT[0],lg2(B))}
 $("#pg").innerHTML=H;
 if(s==="e-learning")bindEL();
 if(s==="latihan")GLX.mount(x,y);
 if(s==="glosarium")GLU.bindGlos();
 if(s==="kontak")$("#fs").onclick=()=>{const ok=$("#f1").value.trim()&&/.+@.+\..+/.test($("#f3").value);if(!ok){toast("Isi nama dan email yang valid dulu.");return}boom(innerWidth/2,innerHeight/2,40);toast("Terima kasih! (Prototipe: pesan tidak dikirim.)");["f1","f3","f4"].forEach(k=>$("#"+k).value="")}}
function bindEL(){let q="",cat="Semua",st="Semua status";const cats=["Semua",...C.chapters.map(c=>c.t)],sts=["Semua status","Belum selesai","Selesai","Draf"];
 const okSt=o=>st==="Semua status"||(st==="Selesai"?done.has(o.i+"-"+o.j):st==="Belum selesai"?!done.has(o.i+"-"+o.j):!!o.l.draft);
 const hay=o=>(o.l.t+" "+strip(o.l.judul)+" "+o.ch.t+" "+(o.l.kw||[]).join(" ")).toLowerCase();
 const draw=()=>{const L=LES.filter(o=>(cat==="Semua"||o.ch.t===cat)&&okSt(o)&&(!q||hay(o).includes(q)));$("#elg").innerHTML=L.map(cardL).join("");$("#none").hidden=!!L.length;$("#ecount").textContent=`${L.length} dari ${LES.length} pelajaran`;
  $("#pst").innerHTML=sts.map(k=>`<button class="chip" aria-pressed="${k===st}">${k}</button>`).join("");$$("#pst .chip").forEach((b,i)=>b.onclick=()=>{st=sts[i];draw()});$("#pchips").innerHTML=cats.map(k=>`<button class="chip" aria-pressed="${k===cat}">${esc(k)}</button>`).join("");$$("#pchips .chip").forEach((b,i)=>b.onclick=()=>{cat=cats[i];draw()});window.observe&&window.observe()};
 $("#q").oninput=e=>{q=e.target.value.toLowerCase().trim();draw()};draw()}
$("#pg").addEventListener("click",e=>{const a=e.target.closest("[data-act]"),s=e.target.closest("[data-sc]");
 if(a){e.preventDefault();if(A.sync){boom(e.clientX,e.clientY);toast("Tercatat di akunmu.")}else if(LOCAL){boom(e.clientX,e.clientY);toast("Mode lokal: progres dan nilaimu tersimpan di browser ini.")}else{toast("Buat akun atau masuk dulu untuk mendaftar.");openAuth("register")}}
 if(s){e.preventDefault();document.getElementById(s.dataset.sc)?.scrollIntoView({behavior:"smooth"})}});
$("#pg").addEventListener("pointermove",e=>{const c=e.target.closest(".card");if(!c)return;const r=c.getBoundingClientRect(),w=c.offsetWidth||r.width,h=c.offsetHeight||r.height,cl=v=>Math.max(-.5,Math.min(.5,v));c.style.setProperty("--ry",(cl((e.clientX-r.left-r.width/2)/w)*8).toFixed(2)+"deg");c.style.setProperty("--rx",(-cl((e.clientY-r.top-r.height/2)/h)*8).toFixed(2)+"deg")});
$("#pg").addEventListener("pointerout",e=>{const c=e.target.closest(".card");if(c){c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")}});
/* ---------- WebGL: one shared loop, flat paper/shape field with scroll depth ---------- */
let active=0,setActive=i=>{active=i};
const canvas=$("#gl"),cur_=$("#cur");let R;
/* v8.2: latar bentuk 3D melayang dimatikan atas permintaan pengguna (mengganggu mata). Kerumunan 3D di hero tidak terpengaruh. */
const BG3D=false;if(BG3D)try{R=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true})}catch(e){document.body.classList.add("nogl")}
if(R){
 const mobile=innerWidth<760,rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
 R.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.1,100);cam.position.z=14;S.add(cam);
 S.add(new THREE.AmbientLight(0xffffff,.8));
 const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(5,8,7);S.add(dl);
 const pl=new THREE.PointLight(0xff9ac0,1.3,18);S.add(pl);
 const pl2=new THREE.PointLight(0x4a7dff,1.1,30);pl2.position.set(-8,-2,6);cam.add(pl2);
 const V2=THREE.Vector2,TAU=Math.PI*2;
  const rbox=()=>{const g=new THREE.BoxGeometry(.8,.8,.8,8,8,8),p=g.attributes.position,nr=new Float32Array(p.count*3),v=new THREE.Vector3(),c=new THREE.Vector3(),k=.26;
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);c.set(Math.max(-k,Math.min(k,v.x)),Math.max(-k,Math.min(k,v.y)),Math.max(-k,Math.min(k,v.z)));v.sub(c).normalize();nr[i*3]=v.x;nr[i*3+1]=v.y;nr[i*3+2]=v.z;v.multiplyScalar(.14).add(c);p.setXYZ(i,v.x,v.y,v.z)}
   g.setAttribute("normal",new THREE.BufferAttribute(nr,3));return g};
  const pill=()=>{const pts=[];for(let i=0;i<=10;i++){const a=-Math.PI/2+i/10*Math.PI/2;pts.push(new V2(Math.cos(a)*.26,Math.sin(a)*.26-.3))}for(let i=0;i<=10;i++){const a=i/10*Math.PI/2;pts.push(new V2(Math.cos(a)*.26,Math.sin(a)*.26+.3))}return new THREE.LatheGeometry(pts,40)};
  const helix=()=>{const pts=[];for(let i=0;i<=60;i++){const t=i/60;pts.push(new THREE.Vector3(Math.cos(t*TAU*3)*.28,(t-.5)*1.4,Math.sin(t*TAU*3)*.28))}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),160,.07,10)};
  /* [geometri, flatShading] */
  const GE=[[new THREE.IcosahedronGeometry(.62,0),1],[new THREE.TorusGeometry(.5,.19,24,56),0],[new THREE.OctahedronGeometry(.7,0),1],[new THREE.SphereGeometry(.46,32,24),0],
   [new THREE.TorusKnotGeometry(.38,.13,120,16),0],[rbox(),0],[new THREE.ConeGeometry(.5,1,40),0],[new THREE.DodecahedronGeometry(.62,0),1],[pill(),0],[new THREE.TorusGeometry(.58,.07,16,64),0],
   [new THREE.TorusKnotGeometry(.4,.1,140,12,2,5),0],[new THREE.CylinderGeometry(.55,.55,.3,44),0],[helix(),0],[new THREE.TetrahedronGeometry(.75,0),1]];
  const PAL=[0xffffff,0xff6b3d,0xffd23f,0x2346d8,0xff7ab8,0xf4efe4,0xff6b3d,0xffd23f,0xffffff];
 const H=70,n=mobile?22:44,items=[];
 for(let i=0;i<n;i++){const g=i%GE.length,col=PAL[(i*3+(i/GE.length|0)*2)%PAL.length];
  const m=new THREE.Mesh(GE[g][0],new THREE.MeshStandardMaterial({color:col,roughness:.78,metalness:0,flatShading:!!GE[g][1],transparent:true,depthWrite:false,opacity:.3}));
  const side=Math.random()<.5?-1:1,edge=!mobile&&Math.random()<.7;
  const hx=edge?side*(6+Math.random()*7):(Math.random()-.5)*16,hy=3-Math.random()*(H+8),hz=-6+Math.random()*9,sc=.7+Math.random()*1.5;
  m.material.opacity=.94;m.position.set(hx,hy,hz);m.scale.setScalar(sc);m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
  m.userData={hx,hy,hz,sc,s:sc,ox:0,oy:0,vx:0,vy:0,rx:(Math.random()-.5)*.28,ry:(Math.random()-.5)*.28,ph:Math.random()*6.28};
  S.add(m);items.push(m)}
 const mouse={x:0,y:0,on:false},rv=new THREE.Vector3();let rx=0,ry=0;
 const mw=z=>{const d=(z-cam.position.z)/rv.z;return[cam.position.x+rv.x*d,cam.position.y+rv.y*d]};
 const ray=()=>{cam.updateMatrixWorld();rv.set(mouse.x,mouse.y,.5).unproject(cam).sub(cam.position).normalize()};
 addEventListener("pointermove",e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight*2-1);mouse.on=true},{passive:true});
 addEventListener("pointerup",e=>{if(e.pointerType==="touch")mouse.on=false});document.documentElement.addEventListener("mouseleave",()=>mouse.on=false);
 addEventListener("pointerdown",e=>{if(document.body.dataset.view==="lesson")return;mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight*2-1);ray();
  items.forEach(m=>{const u=m.userData,[px,py]=mw(u.hz),dx=u.hx+u.ox-px,dy=u.hy+u.oy-py,r=Math.hypot(dx,dy)||.001,k=5/(1+r*.35);u.vx+=dx/r*k;u.vy+=dy/r*k});burst=1;kick()});
 function resize(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
 addEventListener("resize",resize);resize();
 let last=performance.now(),raf=0,ly=scrollY,vel=0;
 function tick(now){raf=0;if(mobile&&now-last<30){if(!document.hidden&&!rm)raf=requestAnimationFrame(tick);return}
  const t=now/1000,dt=Math.min((now-last)/1000,.05)||.016,kk=q=>1-Math.exp(-dt*q);last=now;
  if(document.body.dataset.view==="lesson")return;
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),f=scrollY/max;
  vel+=((scrollY-ly)/dt-vel)*kk(3);ly=scrollY;
  cam.position.y+=(-f*H-cam.position.y)*(rm?1:kk(2.6));cam.position.x+=(mouse.x*1.2-cam.position.x)*(rm?1:kk(1.6));
  rx+=(mouse.y*.05-rx)*kk(1.6);ry+=(-mouse.x*.07-ry)*kk(1.6);cam.rotation.set(rx,ry,Math.max(-.08,Math.min(.08,vel*.00004)));
  ray();const[lx,ly2]=mw(4);pl.position.set(lx,ly2,4);
  burst*=1-Math.min(1,dt*1.4);
  if(!rm)items.forEach(m=>{const u=m.userData,[px,py]=mw(u.hz),dx=u.hx+u.ox-px,dy=u.hy+u.oy-py,r=Math.hypot(dx,dy)||.001;let near=0;
   if(mouse.on&&r<3.4){near=1-r/3.4;const F=near*near*13;u.vx+=dx/r*F*dt;u.vy+=dy/r*F*dt}
   u.vx+=-u.ox*2.2*dt;u.vy+=-u.oy*2.2*dt;const dm=Math.exp(-dt*2.6);u.vx*=dm;u.vy*=dm;u.ox+=u.vx*dt;u.oy+=u.vy*dt;
   m.position.set(u.hx+u.ox,u.hy+u.oy+Math.sin(t*.35+u.ph)*.35,u.hz);
   u.s+=(u.sc*(1+near*.2)-u.s)*kk(3);m.scale.setScalar(u.s);
   const sp=(1+near*1.5+burst*2.5)*dt;m.rotation.x+=u.rx*sp;m.rotation.y+=u.ry*sp;m.rotation.z+=vel*.0001*dt*2});
  R.render(S,cam);
  if(!document.hidden&&!rm)raf=requestAnimationFrame(tick);
 }
 const kick=()=>{if(!raf)raf=requestAnimationFrame(tick)};
 document.addEventListener("visibilitychange",kick);["scroll","pointermove","hashchange","resize"].forEach(ev=>addEventListener(ev,kick,{passive:true}));
 const _s=setActive;setActive=i=>{_s(i);kick()};kick();
}
$("#grid").addEventListener("pointermove",e=>{const c=e.target.closest(".card");if(!c)return;const r=c.getBoundingClientRect(),w=c.offsetWidth||r.width,h=c.offsetHeight||r.height,cl=v=>Math.max(-.5,Math.min(.5,v));c.style.setProperty("--ry",(cl((e.clientX-r.left-r.width/2)/w)*7).toFixed(2)+"deg");c.style.setProperty("--rx",(-cl((e.clientY-r.top-r.height/2)/h)*7).toFixed(2)+"deg")});
$("#grid").addEventListener("pointerout",e=>{const c=e.target.closest(".card");if(c){c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")}});
renderDiscover();renderPath();GLU.home();/* isi beranda sejak awal agar animasi v9 (kartu bertingkat) punya target walau halaman dibuka di rute lain */
route();
