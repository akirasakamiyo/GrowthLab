/* ---------- v8.2: klik & hover stabil (anti getar) ----------
 Elemen yang bergeser/miring saat di-hover dulu bergetar bila kursor di pinggirnya: elemen menjauh dari kursor,
 hover lepas, elemen kembali, hover lagi, begitu terus. Perbaikannya: setiap ":hover" di CSS ditulis ulang jadi
 ":is(:hover,.hv)", lalu kelas .hv dipertahankan selama kursor masih di dalam kotak ASAL elemen (sebelum bergeser).
 Klik di celah itu diteruskan ke elemennya. Hanya aktif di perangkat dengan mouse. */
/* Link/logo ke halaman yang sedang dibuka dulu tidak berbuat apa-apa (hash sama = tidak ada hashchange). Sekarang menggulir ke atas. */
document.addEventListener("click",e=>{if(e.button)return;const a=e.target.closest&&e.target.closest('a[href^="#/"],[data-go]');if(!a)return;
 const want=a.matches("[data-go]")?"#/":a.getAttribute("href"),now=location.hash||"#/";if(want!==now||scrollY<4)return;
 const rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
 try{window.__lenis?window.__lenis.scrollTo(0,{duration:1,immediate:rm,force:true}):scrollTo({top:0,behavior:rm?"auto":"smooth"})}catch(_){scrollTo(0,0)}});
(()=>{if(!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
const GEO=/^(transform|translate|rotate|scale|padding|margin|top|left|right|bottom|inset|width|height)/,bases=new Set(),done=new WeakSet();
const fix=rules=>{for(const r of [...rules]){if(r.cssRules&&!r.selectorText){fix(r.cssRules);continue}
 const sel=r.selectorText;if(!sel||sel.indexOf(":hover")<0||sel.indexOf(".hv")>=0)continue;
 let geo=false;for(let i=0;i<r.style.length;i++)if(GEO.test(r.style[i])){geo=true;break}
 /* yang dilacak hanya elemen yang dirinya sendiri bergeser (selektor berakhir di :hover) */
 if(geo)sel.split(",").forEach(t=>{const m=t.trim().match(/^(.*?):hover((?::not\([^()]*\))*)(?:::?(?:before|after))?$/);if(m&&m[1]&&!/:not\($/.test(m[1]))bases.add(m[1]+m[2])});
 try{r.selectorText=sel.replace(/:hover/g,":is(:hover,.hv)")}catch(e){}}};
let SEL="";
const scan=()=>{for(const sh of document.styleSheets){if(done.has(sh))continue;try{fix(sh.cssRules)}catch(e){}done.add(sh)}
 SEL=[...bases].filter(b=>{try{document.querySelector(b);return true}catch(e){return false}}).join(",")};
scan();addEventListener("load",scan);setTimeout(scan,2500);
let cur=null,box=null,lx=-1,ly=-1;
/* kotak asal = ukuran tanpa transform, dipusatkan di posisi sekarang dikurangi geseran translate */
const home=el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);let dx=0,dy=0;
 const m=cs.transform;if(m&&m!=="none"){const v=(m.match(/-?[\d.]+(?:e-?\d+)?/g)||[]).map(Number);if(v.length===6){dx=v[4];dy=v[5]}else if(v.length===16){dx=v[12];dy=v[13]}}
 const tr=cs.translate;if(tr&&tr!=="none"){const q=tr.split(" ").map(parseFloat);dx+=q[0]||0;dy+=q[1]||0}
 const w=el.offsetWidth||r.width,h=el.offsetHeight||r.height,cx=r.left+r.width/2-dx+scrollX,cy=r.top+r.height/2-dy+scrollY;
 return{l:cx-w/2-1,r:cx+w/2+1,t:cy-h/2-1,b:cy+h/2+1}};
const inBox=()=>!!box&&lx+scrollX>=box.l&&lx+scrollX<=box.r&&ly+scrollY>=box.t&&ly+scrollY<=box.b;
const drop=()=>{if(cur){cur.classList.remove("hv");cur=null;box=null}};
const check=t=>{if(cur&&!cur.isConnected)drop();
 const el=SEL&&t&&t.closest?t.closest(SEL):null;
 if(el&&el!==cur&&!(cur&&el.contains(cur)&&inBox())){drop();cur=el;box=home(el);el.classList.add("hv");return}
 if(cur&&!(t&&cur.contains(t))&&!inBox())drop()};
const mv=e=>{if(e.pointerType==="touch")return;lx=e.clientX;ly=e.clientY;check(e.target)};
document.addEventListener("pointerover",mv,{passive:true});document.addEventListener("pointermove",mv,{passive:true});
addEventListener("scroll",()=>{if(cur&&!inBox()){const t=document.elementFromPoint(lx,ly);if(!t||!cur.contains(t))drop()}},{passive:true});
document.documentElement.addEventListener("mouseleave",drop);addEventListener("blur",drop);addEventListener("hashchange",drop);
addEventListener("pointerdown",e=>{if(e.pointerType==="touch")drop()},true);
document.addEventListener("click",e=>{if(!cur||!e.isTrusted||cur.contains(e.target)||!inBox())return;
 if(e.target.closest&&e.target.closest("a,button,input,select,textarea,label,summary,[role=button],[role=tab],[tabindex]"))return;
 e.preventDefault();e.stopPropagation();cur.click()},true);
window.__hv={get sel(){return SEL},get cur(){return cur}};
})();
