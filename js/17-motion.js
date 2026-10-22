/* ---------- v9: lapisan motion ala motion.zajno.com ---------- */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],body=document.body;
const rm=!/[?&]motion\b/.test(location.search)&&matchMedia("(prefers-reduced-motion:reduce)").matches,fine=matchMedia("(pointer:fine)").matches;
const pre=$("#zpre"),endPre=()=>{body.classList.remove("zload");pre&&pre.remove()};
const ok=window.gsap&&window.ScrollTrigger;
let lenis=null;

/* tombol bulat kiri-bawah (dipakai juga tanpa motion) */
body.insertAdjacentHTML("beforeend",'<button id="ztop" type="button" aria-label="Gulir ke bawah"><svg viewBox="0 0 52 52" aria-hidden="true"><circle class="zt0" cx="26" cy="26" r="23"/><circle class="zt1" cx="26" cy="26" r="23"/><path d="M20 20l12 12M32 22v10H22"/></svg></button>');
const zt=$("#ztop"),zt1=$("#ztop .zt1");
function topUI(){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=Math.min(1,scrollY/max),up=scrollY>innerHeight*.6;
 zt1.style.strokeDashoffset=(144.5*(1-p)).toFixed(1);zt.classList.toggle("up",up);zt.setAttribute("aria-label",up?"Kembali ke atas":"Gulir ke bawah")}
zt.onclick=()=>{const up=scrollY>innerHeight*.6,y=up?0:scrollY+innerHeight*.9;lenis?lenis.scrollTo(y,{duration:up?1.8:1.2}):scrollTo({top:y,behavior:rm?"auto":"smooth"})};
addEventListener("scroll",topUI,{passive:true});addEventListener("resize",topUI);topUI();

if(!ok||rm){endPre();return}
try{
gsap.registerPlugin(ScrollTrigger);if(window.MotionPathPlugin)gsap.registerPlugin(MotionPathPlugin);
ScrollTrigger.config({ignoreMobileResize:true});

/* ---------- section baru (disisipkan di beranda) ---------- */
const hero=$(".hero"),mf=$("#manifesto"),el=$("#elearn"),dc=$("#discover");
if(hero&&!$(".zcue"))hero.insertAdjacentHTML("beforeend",'<div class="zcue" aria-hidden="true"><span class="zln"></span><span class="zrg"><i></i></span></div>');

const S='class="zs zdr"';
let rungs="";for(let k=1;k<=6;k++){const y=640-k*50,x=170+(640-y)/310*60;rungs+=`<path ${S} d="M${x.toFixed(1)} ${y}H${(x+60).toFixed(1)}"/>`}
let rays="";for(let k=0;k<12;k++){const a=k/12*Math.PI*2,c=Math.cos(a),s=Math.sin(a);rays+=`<path ${S} d="M${(600+c*88).toFixed(1)} ${(190+s*88).toFixed(1)}L${(600+c*108).toFixed(1)} ${(190+s*108).toFixed(1)}"/>`}
const CLOUD="M80 300a36 36 0 0 1 8-70a52 52 0 0 1 96-26a44 44 0 0 1 80 22a38 38 0 0 1 16 74Z";
const ART=`<svg class="zla" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
 <g class="zcA"><path ${S} d="${CLOUD}"/></g>
 <g class="zcB" transform="translate(820 -40) scale(1.15)"><path ${S} d="${CLOUD}"/></g>
 <g class="zsun"><circle ${S} cx="600" cy="190" r="70"/>${rays}<circle class="zpop" cx="600" cy="190" r="10" fill="#ffd23f"/></g>
 <path ${S} d="M0 640H1200"/>
 <path ${S} d="M170 640L230 330M230 640L290 330"/>${rungs}
 <path ${S} id="zstair" d="M880 640V590H950V540H1020V490H1090V440H1160"/>
 <path ${S} d="M360 640Q480 590 600 630Q720 590 840 640M360 640V662Q480 617 600 657Q720 617 840 662V640M600 630V657M402 626Q482 604 570 622M630 622Q718 604 798 626"/>
 <path ${S} d="M600 630C600 560 585 520 600 450C610 410 600 380 600 362"/>
 <path ${S} d="M598 520C550 515 520 480 525 445C570 450 595 480 598 520Z"/>
 <path ${S} d="M602 470C650 462 680 425 672 390C630 398 605 430 602 470Z"/>
 <circle class="zpop" cx="600" cy="352" r="11" fill="#ff6b3d"/>
 <path class="zs f zdr" id="zmp" d="M140 560C300 380 430 520 520 420S760 230 900 330S1060 470 1140 380"/>
 <rect class="zpl" width="74" height="30" rx="15" fill="#ffd23f"/>
 <rect class="zpl2" width="58" height="26" rx="13" fill="#fff"/>
</svg>`;
/* v8.2: bagian 'Langkah kecil / Tumbuh sedikit, setiap hari' (#garis) dihapus atas permintaan pengguna */
const big=[..."Interaktif"].map(c=>`<span>${c}</span>`).join("");
/* v8.2: bagian 'Interaktif / Belajar Tumbuh Berkarya' (#pil) dihapus atas permintaan pengguna */
/* v8.2: bagian 'Ayo lihat kursus kami' (#geser) dihapus atas permintaan pengguna */
$$("[data-v=home] .blk:not(.hero)").forEach(s=>{if(!s.querySelector(":scope>.ztab"))s.insertAdjacentHTML("afterbegin",'<span class="ztab" aria-hidden="true"><i></i></span>')});
["#auth","#chat","#cm","#links"].forEach(s=>{const e=$(s);e&&e.setAttribute("data-lenis-prevent","")});
window.observe&&window.observe();

/* ---------- awan di puncak footer ---------- */
const ft=$("footer");
function cloudPath(seed,base,amp){let x=1440,d=`M0 0H1440V${base}`,r=seed;const rnd=()=>{r=(r*9301+49297)%233280;return r/233280};
 while(x>0){const w=90+rnd()*120,nx=Math.max(0,x-w),ny=base+(rnd()-.5)*amp;d+=`A${((x-nx)*.62).toFixed(1)} ${((x-nx)*.62).toFixed(1)} 0 0 1 ${nx.toFixed(1)} ${ny.toFixed(1)}`;x=nx}return d+"Z"}
if(ft&&!$(".zcl")){const c=getComputedStyle($("#done")||ft).backgroundColor;
 ft.insertAdjacentHTML("afterbegin",`<div class="zcl" aria-hidden="true"><svg viewBox="0 0 1440 210" preserveAspectRatio="none"><path class="zc2" d="${cloudPath(7,150,70)}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5" vector-effect="non-scaling-stroke"/><path class="zc1" d="${cloudPath(3,110,60)}" fill="${c}"/></svg></div>`)}

/* ---------- Lenis: scroll halus ---------- */
if(window.Lenis){
 /* 2026-10-20: scroll roda/trackpad dibuat native (tanpa efek halus/lambat) atas permintaan pengguna; Lenis tetap dipakai untuk scrollTo */
 lenis=new Lenis({smoothWheel:false,syncTouch:false});
 lenis.on("scroll",ScrollTrigger.update);
 gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
 const siv=Element.prototype.scrollIntoView;
 Element.prototype.scrollIntoView=function(o){if(lenis&&!this.closest("[data-lenis-prevent]")){lenis.scrollTo(this,{offset:-96,immediate:!(o&&o.behavior==="smooth"),force:true});return}return siv.call(this,o)};
 addEventListener("hashchange",()=>{lenis.stop();setTimeout(()=>{lenis.start();lenis.resize();ScrollTrigger.refresh()},650)});
 window.__lenis=lenis;
}

/* ---------- preloader ---------- */
lenis&&lenis.stop();
const n={v:0},zn=pre&&pre.querySelector(".zn");
const pt=gsap.timeline({onComplete:()=>{endPre();lenis&&lenis.start();ScrollTrigger.refresh()}});
if(pre){
 pt.to(n,{v:100,duration:1.5,ease:"power2.inOut",onUpdate:()=>zn.textContent=String(Math.round(n.v)).padStart(3,"0")},0)
  .to("#zpre .zd",{scale:1,duration:.35,ease:"back.out(3)"},.1)
  .to("#zpre .zd",{y:0,duration:.8,ease:"bounce.out"},.25)
  .to("#zpre .zl",{scaleX:1,duration:.5,ease:"expo.out"},.75)
  .to("#zpre .zl",{scaleX:innerWidth/46*1.1,duration:.8,ease:"expo.inOut"},1.35)
  .to("#zpre .zd",{scale:3.2,duration:.6,ease:"expo.inOut"},1.45)
  .to("#zpre .zc,#zpre .zn",{opacity:0,duration:.3},1.95)
  .add(()=>body.classList.remove("zload"),2.05)
  .to(pre,{clipPath:"inset(0 0 100% 0)",duration:1,ease:"expo.inOut"},2)
  .fromTo(".zcue .zln",{scaleX:0},{scaleX:1,duration:1.4,ease:"expo.out"},2.4)
  .fromTo(".zcue .zrg",{scale:0},{scale:1,duration:.8,ease:"back.out(2)"},2.6);
}else endPre();

/* ---------- hero: menjauh saat discroll ---------- */
const trg=(t,o)=>({trigger:t,scrub:true,...o});
if(hero){
 gsap.to(".hero .hg",{y:-150,opacity:.15,scale:.96,ease:"none",scrollTrigger:trg(hero,{start:"top top",end:"bottom top"})});
 gsap.fromTo(hero,{clipPath:"inset(0% 0% 0% 0% round 0px 0px 0px 0px)"},{clipPath:"inset(0% 2.5% 0% 2.5% round 0px 0px 64px 64px)",ease:"none",scrollTrigger:trg(hero,{start:"top top",end:"bottom top"})});
 gsap.to(".zcue",{y:-60,opacity:0,ease:"none",scrollTrigger:trg(hero,{start:"top top",end:"25% top"})});
}

/* ---------- manifesto: kata naik satu per satu ---------- */
if(mf){const w=$$(".mf span");gsap.fromTo(w,{yPercent:70,rotate:5,opacity:.2},{yPercent:0,rotate:0,opacity:1,stagger:.08,ease:"power2.out",scrollTrigger:trg(mf,{start:"top 85%",end:"bottom 75%"})})}

/* ---------- line-art tergambar + pill di jalur ---------- */
const ga=$("#garis");
if(ga){
 const dr=$$("#garis .zdr");dr.forEach(p=>{const L=Math.ceil(p.getTotalLength());p.style.strokeDasharray=L;p.style.strokeDashoffset=L});
 const tl=gsap.timeline({defaults:{ease:"none"},scrollTrigger:{trigger:ga,start:"top 65%",end:"bottom bottom",scrub:1}});
 tl.fromTo(".zcap .wrap",{y:80,autoAlpha:0},{y:0,autoAlpha:1,duration:.6,immediateRender:true},0)
  .to(dr,{strokeDashoffset:0,duration:.8,stagger:{amount:1}},0)
  .fromTo("#garis .zpop",{scale:0,transformOrigin:"50% 50%"},{scale:1,duration:.3,stagger:.2,ease:"back.out(3)"},1.2)
  .to(".zcA",{x:-70,duration:3},0).to(".zcB",{x:"+=70",duration:3},0)
  .to(".zsun",{rotate:30,svgOrigin:"600 190",duration:3},0);
 if(window.MotionPathPlugin){
  tl.fromTo(".zpl",{opacity:0},{opacity:1,duration:.1},1.3)
   .to(".zpl",{motionPath:{path:"#zmp",align:"#zmp",alignOrigin:[.5,.5],autoRotate:true},duration:1.7},1.3)
   .fromTo(".zpl2",{opacity:0},{opacity:1,duration:.1},1.6)
   .to(".zpl2",{motionPath:{path:"#zstair",align:"#zstair",alignOrigin:[.5,1],autoRotate:false},duration:1.4},1.6);
 }else gsap.set(".zpl,.zpl2",{display:"none"});
 tl.fromTo(".zcap .wrap",{y:0},{y:-40,duration:.6,immediateRender:false},2.4);
}

/* ---------- pill miring masuk dari samping ---------- */
const pl=null;/* #pil dihapus */
if(pl){
 const P=$$(".zp"),R=[-9,7,-5];
 const tl=gsap.timeline({defaults:{ease:"power3.out"},scrollTrigger:{trigger:pl,start:"top top",end:"bottom bottom",scrub:1}});
 tl.fromTo(".zbig span",{yPercent:115},{yPercent:0,duration:.6,stagger:.05},0);
 P.forEach((p,i)=>tl.fromTo(p,{xPercent:i%2?160:-160,rotate:i%2?40:-40},{xPercent:0,rotate:R[i],duration:1},.35+i*.3));
 tl.to(".zbig",{scale:.9,opacity:.35,duration:.8,ease:"none"},1.2).to(P,{y:i=>-30-i*12,duration:.8,ease:"none"},1.6);
}

/* ---------- teks besar digeser horizontal ---------- */
const gs=null;/* #geser dihapus */
if(gs){const row=$(".zrow");
 gsap.fromTo(row,{x:()=>innerWidth},{x:()=>-(row.scrollWidth-innerWidth*.15),ease:"none",scrollTrigger:{trigger:gs,start:"top top",end:"bottom bottom",scrub:1,invalidateOnRefresh:true}});
 gsap.to(".zrow i",{rotate:720,ease:"none",scrollTrigger:trg(gs,{start:"top top",end:"bottom bottom"})});
}

/* ---------- section: tab bergerak + isi naik pelan ---------- */
$$("[data-v=home] .blk:not(.hero)").forEach(s=>{
 const t=s.querySelector(":scope>.ztab i");if(t)gsap.fromTo(t,{x:-20},{x:20,ease:"none",scrollTrigger:trg(s,{start:"top bottom",end:"bottom top"})});
 const w=s.querySelector(":scope>.wrap");if(w&&!/^(garis|pil|geser)$/.test(s.id))gsap.fromTo(w,{y:90},{y:0,ease:"none",scrollTrigger:trg(s,{start:"top bottom",end:"top 30%"})});
});

/* ---------- kartu bertingkat (offset & delay) ---------- */
function stair(){const g=$("#grid");if(!g)return;ScrollTrigger.getById("zstair")?.kill();const c=[...g.children];
 gsap.fromTo(c,{"--zy":i=>((i%3)*80+70)+"px"},{"--zy":i=>((i%3)*-24)+"px",ease:"none",scrollTrigger:{id:"zstair",trigger:g,start:"top bottom",end:"bottom 35%",scrub:true}})}
stair();new MutationObserver(stair).observe($("#grid")||document.createElement("i"),{childList:true});

/* ---------- awan footer bergerak ---------- */
/* 2026-10-20: awan footer dibuat diam (latar bergerak dihilangkan atas permintaan pengguna) */

/* ---------- pill fisika (Matter.js) di CTA akhir ---------- */
const dn=$("#done");
if(dn&&window.Matter&&!$(".zphys")){
 const{Engine,Bodies,Composite,Body,Mouse,MouseConstraint}=Matter;
 const box=document.createElement("div");box.className="zphys";box.setAttribute("aria-hidden","true");dn.prepend(box);
 const W=["Belajar","Tumbuh","Refleksi","Empati","Resiliensi","Mandiri","Siap kerja","Berpikir kritis","Kreatif","Strategis","Fokus","Naik level"],C=["y","o","b","w"];
 const els=W.slice(0,innerWidth<700?7:W.length).map((t,i)=>{const e=document.createElement("span");e.className="zb "+C[i%4];e.textContent=t;box.append(e);return e});
 const eng=Engine.create({gravity:{y:1.1}}),T=200;let bw=0,bh=0,walls=[],B=[],raf=0,last=0,dropped=false;
 function dims(){bw=dn.clientWidth;bh=dn.clientHeight}
 function mkWalls(){walls.length&&Composite.remove(eng.world,walls);dims();
  walls=[Bodies.rectangle(bw/2,bh+T/2,bw*3,T,{isStatic:true}),Bodies.rectangle(-T/2,bh/2,T,bh*6,{isStatic:true}),Bodies.rectangle(bw+T/2,bh/2,T,bh*6,{isStatic:true})];Composite.add(eng.world,walls)}
 mkWalls();
 function drop(){dropped=true;els.forEach((e,i)=>{const w=e.offsetWidth,h=e.offsetHeight,b=Bodies.rectangle(bw*(.12+Math.random()*.76),-h-i*70,w,h,{chamfer:{radius:h/2-1},restitution:.4,friction:.3,density:.002,angle:(Math.random()-.5)*.9});b.el=e;b.w=w;b.h=h;B.push(b);gsap.to(e,{opacity:1,duration:.3,delay:.1})});Composite.add(eng.world,B)}
 function loop(t){const dt=Math.min(1000/30,last?t-last:1000/60);last=t;Engine.update(eng,dt);
  for(const b of B){if(b.position.y>bh+300)Body.setPosition(b,{x:bw/2,y:-100});b.el.style.transform=`translate(${(b.position.x-b.w/2).toFixed(1)}px,${(b.position.y-b.h/2).toFixed(1)}px) rotate(${b.angle.toFixed(3)}rad)`}
  raf=requestAnimationFrame(loop)}
 new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){if(!dropped)drop();if(!raf){last=0;raf=requestAnimationFrame(loop)}}else if(raf){cancelAnimationFrame(raf);raf=0}}),{threshold:.25}).observe(dn);
 if(fine){const m=Mouse.create(box);["mousewheel","DOMMouseScroll","wheel"].forEach(ev=>m.element.removeEventListener(ev,m.mousewheel));
  ["touchmove","touchstart","touchend"].forEach((ev,i)=>m.element.removeEventListener(ev,[m.mousemove,m.mousedown,m.mouseup][i]));
  Composite.add(eng.world,MouseConstraint.create(eng,{mouse:m,constraint:{stiffness:.2,damping:.1,render:{visible:false}}}))}
 else box.addEventListener("pointerdown",e=>{const r=box.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  B.forEach(b=>{const dx=b.position.x-x,dy=b.position.y-y,d=Math.hypot(dx,dy)||1;if(d<240)Body.applyForce(b,b.position,{x:dx/d*.02*b.mass,y:-.05*b.mass})})});
 let rz=0;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(mkWalls,200)});
}

/* refresh setelah font & gambar siap */
document.fonts&&document.fonts.ready.then(()=>ScrollTrigger.refresh());
addEventListener("load",()=>ScrollTrigger.refresh());
}catch(e){console.warn("zmotion layer",e);endPre();lenis&&lenis.start()}
})();
