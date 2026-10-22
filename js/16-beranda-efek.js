(()=>{try{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],rm=matchMedia("(prefers-reduced-motion:reduce)").matches,p2=n=>String(n).padStart(2,"0");
document.body.insertAdjacentHTML("beforeend",'<div id="sp"></div><div id="cnt"><b id="cn">01</b> <span>/ <i id="ct" style="font-style:normal">01</i></span></div><div id="cue"><i></i>Scroll</div>');
const hero=$(".hero");
if(hero&&!$(".band")){const t=["Belajar","Tumbuh","Berkarya","Berani"].map(x=>`<span>${x}</span>`).join("");hero.insertAdjacentHTML("afterend",`<div class="band" aria-hidden="true"><div class="mq">${t+t+t+t}</div></div>`)}
const st=$("#stats");
/* manifesto "Belajar yang hebat dimulai dari langkah kecil" dihapus atas permintaan pengguna (2026-10-20) */
const ft=$("footer");if(ft&&!$(".wm"))ft.insertAdjacentHTML("beforeend",`<div class="wm" aria-hidden="true">${[..."GROWTH LAB"].map((c,i)=>`<b style="--k:${i}">${c===" "?"&nbsp;":c}</b>`).join("")}</div>`);
const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("sin","in");sio.unobserve(e.target)}}),{threshold:.2}),
cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in2");setTimeout(()=>e.target.classList.add("done"),1600);cio.unobserve(e.target)}}),{threshold:.1}),
nio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;nio.unobserve(e.target);const el=e.target,m=el.textContent.match(/^(\D*)(\d+)(\D*)$/);if(!m||rm||document.hidden||+m[2]===0)return;const n=+m[2],t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/1400),v=Math.round(n*(1-Math.pow(1-k,4)));el.textContent=m[1]+v+m[3];if(k<1)requestAnimationFrame(f)})(t0)}),{threshold:.6});
function split(){
 $$("article>*,.chead>*,.side>*").forEach(e=>{if(e.dataset.st&&!e.dataset.rt){e.dataset.rt=1}});if(window.__v!==document.body.dataset.view){window.__v=document.body.dataset.view;$$("article>*,.chead>*,.side>*,#chaps .chap").forEach(e=>{e.classList.remove("in2","done");delete e.dataset.st})}
 $$("h1,h2,.qt").forEach(h=>{if(h.closest(".modal,.chat")||h.querySelector(".sw,.w")||!h.textContent.trim())return;let k=0;h.classList.remove("sin");
  const walk=n=>[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.append(w);return}const s=document.createElement("span"),b=document.createElement("b");s.className="sw";b.textContent=w;b.style.setProperty("--k",k++);s.append(b);f.append(s)});c.replaceWith(f)}else if(c.nodeType===1)walk(c)});
  walk(h);sio.observe(h)});
 $$(".grid>.card,.usp>.us,.mg>.mc,.stg>.stp,.s3>*,.pol>*,.fq>details,.ba>div,.chap,.step,article>:not(h1),.chead>*,.side>*").forEach((e,i)=>{if(e.dataset.st)return;e.dataset.st=1;e.classList.add("st");e.style.setProperty("--n",i%6);cio.observe(e)});
 $$(".us strong").forEach(e=>{if(!e.dataset.nc){e.dataset.nc=1;nio.observe(e)}});
 $$(".wm").forEach(e=>sio.observe(e));
}
const o=window.observe;window.observe=function(){o&&o();try{split();cnt()}catch(e){}};
/* scroll: progress, counter, manifesto, nav, fx */
const nav=$(".nav"),F=$$("#fxl u"),cfg=[[.1,.15,.05],[.8,.3,.08],[.06,.62,.04],[.9,.72,.06],[.5,.88,.07],[.62,.08,.1]];
let mx=0,my=0,ly=scrollY,tk=0,tot=0;
function cnt(){const S=$$("[data-v]:not([hidden]) .blk");tot=S.length;$("#ct").textContent=p2(tot||1);$("#cnt").style.display=tot>1?"":"none"}
function draw(){tk=0;const sy=scrollY,H=innerHeight+260,max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 $("#sp").style.transform=`scaleX(${sy/max})`;document.body.classList.toggle("scrolled",sy>60);
 const d=sy-ly;ly=sy;if(nav&&!$("#links.open"))nav.classList.toggle("hide",sy>240&&d>3);else if(nav)nav.classList.remove("hide");
 const S=$$("[data-v]:not([hidden]) .blk");let a=0;S.forEach((s,i)=>{const r=s.getBoundingClientRect();if(r.top<innerHeight*.5)a=i});$("#cn").textContent=p2(a+1);
 const mf=$("#manifesto");if(mf){const r=mf.getBoundingClientRect(),pr=Math.max(0,Math.min(1,(innerHeight*.85-r.top)/(r.height*.8))),w=$$(".mf span"),n=Math.round(pr*w.length);w.forEach((x,i)=>x.classList.toggle("on",i<n))}
 if(!rm)F.forEach((u,i)=>{const[x,y,s]=cfg[i],py=(((y*innerHeight-sy*s*1.4)%H)+H)%H-130;u.style.transform=`translate3d(${x*innerWidth+mx*(30+i*14)}px,${py}px,0) rotate(${sy*(.03+i*.01)+i*30}deg)`})}
const go=()=>{if(!tk)tk=requestAnimationFrame(draw)};
addEventListener("scroll",go,{passive:true});addEventListener("resize",go);addEventListener("hashchange",()=>setTimeout(go,300));
addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;go()},{passive:true});
/* tombol magnetik */
/* posisi dihitung dari pusat tombol TANPA geseran magnet (dulu memakai rect yang sudah tergeser, jadi tombol bergetar), lalu dihaluskan per frame */
let mb=null,mt={x:0,y:0},mc={x:0,y:0},mraf=0;const mclr=b=>{b.style.translate="";b.__mg=null};
const mstep=()=>{mraf=0;mc.x+=(mt.x-mc.x)*.22;mc.y+=(mt.y-mc.y)*.22;const done=Math.abs(mt.x-mc.x)<.05&&Math.abs(mt.y-mc.y)<.05;if(done){mc.x=mt.x;mc.y=mt.y}
 const b=mb||mstep.last;if(b){if(!mb&&done&&!mt.x&&!mt.y){mclr(b);mstep.last=null;return}b.style.translate=mc.x.toFixed(2)+"px "+mc.y.toFixed(2)+"px";b.__mg=mc}if(!done)mraf=requestAnimationFrame(mstep)};
const mgo=()=>{if(!mraf)mraf=requestAnimationFrame(mstep)};
document.addEventListener("pointermove",e=>{if(rm||e.pointerType==="touch")return;const b=e.target.closest&&e.target.closest(".btn,.lb");
 if(mb&&mb!==b){mstep.last=mb;mb=null;mt={x:0,y:0};if(b){mclr(mstep.last);mstep.last=null;mc={x:0,y:0}}}
 if(b){mb=b;const r=b.getBoundingClientRect(),g=b.__mg||{x:0,y:0},cx=r.left+r.width/2-g.x,cy=r.top+r.height/2-g.y;
  mt={x:Math.max(-10,Math.min(10,(e.clientX-cx)*.2)),y:Math.max(-8,Math.min(8,(e.clientY-cy)*.3))}}
 mgo()},{passive:true});
document.documentElement.addEventListener("mouseleave",()=>{if(mb){mstep.last=mb;mb=null;mt={x:0,y:0};mgo()}});
window.observe();draw();
}catch(e){console.warn("oblo layer",e)}})();
