/* ==========================================================================
   GL v8 · PANGGUNG SIMULASI (GLSTG): adegan 2D SVG + CSS, partikel Canvas.
   - Karakter: satu komponen reusable `tokoh(opsi)` (rambut, topi, kacamata, dasi, lanyard)
     dengan pose idle, walk, nod, shake, surprised, sad, happy, angry-tense, thinking.
     Pose = kelas CSS (transform/opacity saja); ekspresi = mata/alis/mulut SVG yang ditukar lewat opacity.
   - Latar flat abu-abu + 1 warna aksen per adegan; suasana redup/cerah lewat lapisan opacity.
   - Antarmuka untuk GLSV: thumb, scene, enter, react, mood, settle, ending, endingPlay, stop.
   ========================================================================== */
window.GLSTG=(()=>{
const rmq=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
const K="#151515",W=640,H=300,FLOOR=250;
/* ---------- tokoh ---------- */
const NPC={
 hero:{skin:"#e2a97e",hair:"#2a1a12",hs:"short",shirt:"#22a39a",pants:"#34406b"},
 ibu:{skin:"#d39a6c",hair:"#f07a5a",hs:"hijab",shirt:"#7b5cd6",pants:"#3d3d6b"},
 teman:{skin:"#b9784a",hair:"#1b1b1b",hs:"cap",cap:"#e63946",shirt:"#ffd23f",pants:"#2b6cb0"},
 atasan:{skin:"#f0c8a0",hair:"#3b3b3b",hs:"short",shirt:"#2c3e75",pants:"#1f2a50",glass:true,tie:true,tieC:"#e63946"},
 rekan:{skin:"#a86c42",hair:"#151515",hs:"short",shirt:"#3ecf8e",pants:"#4a4a6a",lan:true},
 rekan2:{skin:"#e8b48a",hair:"#5a3a22",hs:"long",shirt:"#a06cd5",pants:"#3d3d6b",glass:true,lan:true}};
const HAIR={
 short:h=>`<path class="o" d="M-28 -172q-2-36 28-36t28 36q-6-16-28-17t-28 17z" fill="${h}"/>`,
 long:h=>`<path class="o" d="M-29 -174q-2-36 29-36t29 36q-8-17-29-18t-29 18z" fill="${h}"/>`,
 bun:h=>`<circle class="o" cx="0" cy="-206" r="11" fill="${h}"/><path class="o" d="M-28 -172q-2-34 28-34t28 34q-6-15-28-16t-28 16z" fill="${h}"/>`,
 cap:(h,p)=>`<path class="o" d="M-28 -172q-2-36 28-36t28 36q-6-16-28-17t-28 17z" fill="${h}"/><path class="o" d="M-29 -182q1-27 29-27t29 27z" fill="${p.cap||"#222"}"/><rect class="o" x="-4" y="-186" width="46" height="8" rx="4" fill="${p.cap||"#222"}"/>`,
 hijab:h=>`<path class="o" d="M-29 -176q1-32 29-32t29 32q-9-13-29-14t-29 14z" fill="${h}"/>`};
const HAIRBACK={long:h=>`<path class="o" d="M-31 -176q0-34 31-34t31 34v40q-7 6-14 0v-34h-34v34q-7 6-14 0z" fill="${h}"/>`,
 hijab:h=>`<path class="o" d="M-35 -176q0-38 35-38t35 38v20q0 22-35 26q-35-4-35-26z" fill="${h}"/>`};
function tokoh(id,o){const p=Object.assign({},NPC[o.who||id]||NPC.hero,o),{x,y=FLOOR,s=1,flip=false,skin="#e2a97e"}=p;
 return `<g class="chw" transform="translate(${x} ${y}) scale(${flip?-s:s} ${s})"><g class="ch pose-idle ex-neutral${o.still?" still":""}" data-ch="${id}">
<ellipse class="ch-sh" cx="0" cy="2" rx="44" ry="7"/>
<g class="ch-b">
 <g class="lg lg-l"><rect class="o" x="-21" y="-76" width="17" height="72" rx="8" fill="${p.pants}"/><rect x="-26" y="-10" width="25" height="12" rx="6" fill="#222"/></g>
 <g class="lg lg-r"><rect class="o" x="4" y="-76" width="17" height="72" rx="8" fill="${p.pants}"/><rect x="1" y="-10" width="25" height="12" rx="6" fill="#222"/></g>
 <g class="tr"><path class="o" d="M-34 -118q0-25 25-25h18q25 0 25 25v50h-68z" fill="${p.shirt}"/>${p.tie?`<path class="o" d="M0 -141l-6 9 6 32 6-32z" fill="${p.tieC||"#2a2a2a"}" stroke-width="2"/>`:""}${p.lan?`<path d="M-12 -142L0 -104 12 -142" fill="none" class="acs" stroke-width="4"/><rect x="-9" y="-106" width="18" height="22" rx="3" fill="#fff"/>`:""}</g>
 <g class="ar ar-l"><rect class="o" x="-48" y="-138" width="15" height="64" rx="7.5" fill="${p.shirt}"/><circle class="o" cx="-40.5" cy="-73" r="8.5" fill="${skin}"/></g>
 <g class="ar ar-r"><rect class="o" x="33" y="-138" width="15" height="64" rx="7.5" fill="${p.shirt}"/><circle class="o" cx="40.5" cy="-73" r="8.5" fill="${skin}"/></g>
 <g class="hd">${(HAIRBACK[p.hs]||(()=>""))(p.hair)}<rect x="-8" y="-152" width="16" height="14" fill="${p.hs==="hijab"?p.hair:skin}"/><circle class="o" cx="0" cy="-175" r="28" fill="${skin}"/>${HAIR[p.hs](p.hair,p)}
  <g class="ey-o"><ellipse cx="-9.5" cy="-175" rx="3.4" ry="4.4"/><ellipse cx="9.5" cy="-175" rx="3.4" ry="4.4"/></g>
  <g class="ey-c ln"><path d="M-14 -174q4.5-6 9 0M5 -174q4.5-6 9 0"/></g>
  <g class="ey-w"><circle cx="-9.5" cy="-175" r="5.8" fill="#fff" stroke="${K}" stroke-width="2.4"/><circle cx="9.5" cy="-175" r="5.8" fill="#fff" stroke="${K}" stroke-width="2.4"/><circle cx="-9.5" cy="-175" r="2.3"/><circle cx="9.5" cy="-175" r="2.3"/></g>
  ${p.glass?`<g class="gl ln"><circle cx="-10" cy="-175" r="8"/><circle cx="10" cy="-175" r="8"/><path d="M-2 -175h4"/></g>`:""}
  <g class="ln"><path class="bw-n" d="M-15 -187h11M4 -187h11"/><path class="bw-u" d="M-15 -192q5.5-4 11 0M4 -192q5.5-4 11 0"/><path class="bw-s" d="M-15 -185L-4 -190M4 -190L15 -185"/><path class="bw-a" d="M-15 -191L-4 -185M4 -185L15 -191"/>
   <path class="mo-n" d="M-6 -160h12"/><path class="mo-s" d="M-10 -163q10 10 20 0"/><path class="mo-f" d="M-9 -156q9-8 18 0"/><path class="mo-t" d="M-10 -160q2.5-3 5 0t5 0t5 0t5 0"/></g>
  <ellipse class="mo-o" cx="0" cy="-159" rx="4.6" ry="5.6"/>
  <g class="bl"><ellipse cx="-17" cy="-164" rx="5" ry="3" fill="#ff7a8a" opacity=".6"/><ellipse cx="17" cy="-164" rx="5" ry="3" fill="#ff7a8a" opacity=".6"/></g>
  <path class="sw" d="M27 -197q7 9 0 13q-7-4 0-13z" fill="#fff" stroke="${K}" stroke-width="2"/>
 </g>
 <g class="xm"><path d="M44 -222v-20" stroke="${K}" stroke-width="5" stroke-linecap="round"/><circle cx="44" cy="-212" r="3" fill="${K}" transform="translate(0 0)"/></g>
 <g class="tb"><circle cx="36" cy="-204" r="4" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="46" cy="-217" r="6" fill="#fff" stroke="${K}" stroke-width="2"/><ellipse cx="70" cy="-240" rx="23" ry="16" fill="#fff" stroke="${K}" stroke-width="2.4"/><text x="70" y="-233" text-anchor="middle" class="tbq">?</text></g>
</g></g></g>`}
/* ---------- latar ---------- */
const box=(x,y,w,h,f,r=6)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${K}" stroke-width="4"/>`;
const SC={
 kamar:{ac:"#ffb81f",wall:"#fdf1d8",d:()=>`${box(56,38,150,112,"#f4f4f4")}<path d="M131 38v112M56 94h150" stroke="${K}" stroke-width="4"/><circle cx="176" cy="66" r="15" class="acf glow"/>
  ${box(430,178,190,72,"#a8a8a8",10)}${box(430,150,60,40,"#eee",10)}${box(70,176,170,12,"#8a8a8a",4)}<path d="M84 188v62M226 188v62" stroke="${K}" stroke-width="4"/>${box(118,146,74,32,"#3a3a3a",4)}<rect x="124" y="151" width="62" height="21" fill="#f2f2f2"/><path d="M134 158h40M134 165h26" stroke="#888" stroke-width="3"/>`},
 "kamar-malam":{ac:"#ffd23f",wall:"#3b3f7a",dark:true,d:()=>`${box(56,38,150,112,"#4a4a4a")}<path d="M131 38v112M56 94h150" stroke="${K}" stroke-width="4"/><circle cx="170" cy="64" r="16" class="acf glow"/><circle cx="163" cy="59" r="16" fill="#4a4a4a"/>
  ${box(430,178,190,72,"#7a7a7a",10)}${box(430,150,60,40,"#cfcfcf",10)}${box(300,96,40,10,"#666",3)}<path d="M320 106v40" stroke="${K}" stroke-width="4"/><path d="M296 96l10-30h28l10 30z" class="acf" stroke="${K}" stroke-width="4"/>`},
 rumah:{ac:"#ff6b3d",wall:"#fde8d2",d:()=>`${box(80,52,96,72,"#f2f2f2")}<path d="M96 108l22-26 18 18 12-12 18 20z" class="acf"/>${box(470,60,74,90,"#eee")}<path d="M507 70v70M480 105h54" stroke="#bbb" stroke-width="3"/>
  ${box(452,176,176,60,"#8f8f8f",14)}${box(440,160,36,76,"#8f8f8f",12)}${box(604,160,36,76,"#8f8f8f",12)}${box(40,200,40,50,"#bdbdbd",6)}<path d="M60 200q-26-40 0-70q26 30 0 70z" fill="#7a7a7a" stroke="${K}" stroke-width="4"/>`},
 teras:{ac:"#2fae7b",wall:"#cfe9ff",d:()=>`<rect x="0" y="0" width="${W}" height="150" fill="#f2f2f2"/><circle cx="560" cy="58" r="26" fill="#fff" stroke="${K}" stroke-width="4"/>${[...Array(16)].map((_,i)=>`<rect x="${8+i*40}" y="150" width="14" height="100" rx="3" fill="#cfcfcf" stroke="${K}" stroke-width="3"/>`).join("")}<rect x="0" y="168" width="${W}" height="10" fill="#bdbdbd" stroke="${K}" stroke-width="3"/>
  ${box(86,196,40,54,"#8a8a8a",6)}<path d="M106 196q-34-46 0-86q34 40 0 86z" class="acf" stroke="${K}" stroke-width="4"/>${box(520,206,96,14,"#9a9a9a",4)}<path d="M530 220v30M606 220v30" stroke="${K}" stroke-width="4"/>`},
 meja:{ac:"#ff8a3d",wall:"#fff1d6",d:()=>`${box(390,40,200,120,"#f2f2f2",8)}${[[410,60],[470,70],[530,58],[430,104],[500,110]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="44" height="34" ${i===1?'class="acf"':'fill="#cfcfcf"'} stroke="${K}" stroke-width="3" transform="rotate(${i%2?4:-4} ${x+22} ${y+17})"/>`).join("")}
  ${box(40,196,560,14,"#8a8a8a",4)}<path d="M60 210v40M580 210v40" stroke="${K}" stroke-width="4"/>${box(90,170,80,26,"#fff",3)}<path d="M100 180h60M100 188h40" stroke="#999" stroke-width="3"/>${box(470,160,26,36,"#eee",5)}<path d="M120 196v-60l40-20" fill="none" stroke="${K}" stroke-width="4"/><path d="M150 106l26 12-10 18-26-12z" class="acf glow" stroke="${K}" stroke-width="3"/>`},
 lobi:{ac:"#2b55ff",wall:"#e3f0ff",d:()=>`${[0,1,2,3].map(i=>box(40+i*92,30,80,150,"#f7f7f7",2)).join("")}<path d="M40 105h360" stroke="#ccc" stroke-width="3"/>${box(440,46,150,44,"#fff",6)}<circle cx="470" cy="68" r="12" class="acf"/><path d="M492 62h80M492 76h56" stroke="${K}" stroke-width="4"/>
  ${box(430,170,190,80,"#9a9a9a",8)}<rect x="430" y="170" width="190" height="14" class="acf" stroke="${K}" stroke-width="4"/>${box(16,206,34,44,"#bbb",6)}<path d="M33 206q-24-36 0-64q24 28 0 64z" fill="#6f6f6f" stroke="${K}" stroke-width="4"/>`},
 kantor:{ac:"#ff6b3d",wall:"#e8f4f2",d:()=>`${box(40,30,170,110,"#f2f2f2",4)}${[0,1,2,3,4,5].map(i=>`<path d="M44 ${44+i*16}h162" stroke="#bbb" stroke-width="4"/>`).join("")}<circle cx="560" cy="64" r="26" fill="#fff" stroke="${K}" stroke-width="4"/><path d="M560 64v-14M560 64l10 6" stroke="${K}" stroke-width="4" stroke-linecap="round"/>
  ${box(60,186,200,14,"#8f8f8f",3)}<path d="M76 200v50M244 200v50" stroke="${K}" stroke-width="4"/>${box(96,138,74,48,"#3a3a3a",5)}<rect x="102" y="144" width="62" height="34" fill="#e8e8e8"/><path d="M132 186v-6" stroke="${K}" stroke-width="6"/>${box(190,160,48,26,"#fff",3)}<rect x="196" y="152" width="40" height="10" class="acf" stroke="${K}" stroke-width="3"/>`},
 rapat:{ac:"#8854c0",wall:"#efe7ff",d:()=>`${box(150,34,340,120,"#fbfbfb",6)}<path d="M180 128l50-36 40 22 50-48 40 26 50-36" fill="none" class="acs" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M180 140h280" stroke="#aaa" stroke-width="3"/>
  ${box(70,206,500,18,"#8a8a8a",6)}<path d="M100 224v26M540 224v26" stroke="${K}" stroke-width="4"/>${box(470,188,40,18,"#eee",3)}${box(140,190,30,16,"#fff",3)}`},
 pantry:{ac:"#14b8a6",wall:"#e2f7f3",d:()=>`${box(40,40,200,70,"#ededed",6)}<path d="M140 40v70" stroke="${K}" stroke-width="4"/>${box(30,180,300,70,"#9a9a9a",6)}<rect x="30" y="180" width="300" height="14" fill="#bdbdbd" stroke="${K}" stroke-width="4"/>
  ${box(70,126,56,54,"#555",6)}<rect x="84" y="140" width="28" height="14" class="acf"/>${box(150,154,22,26,"#fff",4)}${box(184,158,22,22,"#fff",4)}${box(520,50,80,190,"#cfcfcf",6)}<path d="M520 120h80M590 74v24M590 140v30" stroke="${K}" stroke-width="4"/>`}};
/* adegan → letak tokoh */
/* latar ilustrasi (dibuat dengan gpt-image via Figma, disimpan di assets/sim). Jika file belum ada/gagal dimuat, latar SVG di bawahnya tetap terlihat. */
/* paket offline (tools/build-offline.js) menanam gambar sebagai data URI di window.GL_SIMIMG; tanpa itu dipakai file di assets/sim */
const SIMSRC=sc=>(window.GL_SIMIMG&&window.GL_SIMIMG[sc])||`assets/sim/${sc}.jpg`;
const IMG=new Set(["kamar","kamar-malam","rumah","teras","meja","lobi","kantor","pantry","rapat"]);
function sceneSVG(sc,who,o={}){const HO=o.heroOpt||{};const S=SC[sc]||SC.kamar,two=!!who,hx=o.hx||(two?250:320),still=!!o.still;
 const npc=who==="tim"?[["rekan",430,.86],["rekan2",520,.8]]:who?[[who,420,1]]:[];
 return `<svg class="gvs${S.dark?" dark":""}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" style="--ac:${S.ac}" aria-hidden="true">
 <rect width="${W}" height="${FLOOR}" fill="${S.wall}"/><rect y="${FLOOR}" width="${W}" height="${H-FLOOR}" fill="${S.dark?"#2a2d5a":"#e0b07a"}"/><path d="M0 ${FLOOR}H${W}" stroke="${K}" stroke-width="4"/>
 <g class="bgd">${S.d()}</g>${IMG.has(sc)?`<image class="bgi" href="${SIMSRC(sc)}" x="0" y="-42" width="${W}" height="360" preserveAspectRatio="xMidYMid slice" onerror="this.remove()"/>`:""}
 ${npc.map(([id,x,s])=>tokoh("npc-"+id,{who:id,x,s,flip:true,still})).join("")}
 ${o.hero===false?"":tokoh("hero",Object.assign({},HO,{x:hx,still}))}
 <g class="bb" opacity="0"><path class="bbt" d=""/><rect class="bbr" rx="12"/><text class="bbx"></text></g>
 <rect class="at at-d" width="${W}" height="${H}" fill="#000"/><rect class="at at-l" width="${W}" height="${H}" fill="#fff"/>
</svg><canvas class="gv-pc" aria-hidden="true"></canvas>`}

/* ---------- partikel (Canvas) ---------- */
const PC={list:[],raf:0,cv:null,ctx:null,
 emit(cv,type,x,y,n){if(rmq()||!cv)return;const r=cv.getBoundingClientRect();if(!r.width)return;const dpr=Math.min(devicePixelRatio||1,2);
  if(this.cv!==cv||cv.width!==Math.round(r.width*dpr)){cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr)}this.cv=cv;this.ctx=cv.getContext("2d");this.ctx.setTransform(dpr,0,0,dpr,0,0);this.w=r.width;this.h=r.height;
  const ac=getComputedStyle(cv.parentNode.querySelector(".gvs")||cv).getPropertyValue("--ac").trim()||"#ffd23f";
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=type==="confetti"?2+Math.random()*4:type==="stars"?1+Math.random()*2:.6+Math.random();
   this.list.push({type,x:x+(type==="sweat"?(Math.random()*30-6):0),y,vx:type==="sweat"?(Math.random()-.3)*1.2:Math.cos(a)*sp,vy:type==="confetti"?-3-Math.random()*5:type==="stars"?-1.2-Math.random()*2:-.5-Math.random(),
    life:type==="confetti"?160:70,age:-i*(type==="confetti"?.5:3),rot:Math.random()*6,vr:(Math.random()-.5)*.3,size:type==="confetti"?6+Math.random()*5:type==="stars"?6+Math.random()*6:4+Math.random()*3,
    col:type==="confetti"?[ac,"#ffd23f","#2ec27e","#4c7dff","#ff5a5f","#a06cd5"][i%6]:type==="stars"?"#ffd23f":"#8ecbff"})}
  if(!this.raf)this.raf=requestAnimationFrame(t=>this.tick(t))},
 tick(){const c=this.ctx;if(!c)return;c.clearRect(0,0,this.w,this.h);
  this.list=this.list.filter(p=>{p.age++;if(p.age<0)return true;const g=p.type==="confetti"?.18:p.type==="sweat"?.12:-.01;p.vy+=g;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;const k=1-p.age/p.life;if(k<=0)return false;
   c.save();c.globalAlpha=Math.min(1,k*1.6);c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.col;c.strokeStyle="#151515";c.lineWidth=1.5;
   if(p.type==="stars"){c.beginPath();for(let j=0;j<10;j++){const rr=j%2?p.size*.45:p.size,an=j*Math.PI/5;c.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}c.closePath();c.fill();c.stroke()}
   else if(p.type==="sweat"){c.beginPath();c.moveTo(0,-p.size);c.quadraticCurveTo(p.size,p.size*.6,0,p.size);c.quadraticCurveTo(-p.size,p.size*.6,0,-p.size);c.fill();c.stroke()}
   else{c.fillRect(-p.size/2,-p.size/3,p.size,p.size*.66);c.strokeRect(-p.size/2,-p.size/3,p.size,p.size*.66)}
   c.restore();return true});
  this.raf=this.list.length?requestAnimationFrame(t=>this.tick(t)):0;if(!this.raf)c.clearRect(0,0,this.w,this.h)},
 stop(){cancelAnimationFrame(this.raf);this.raf=0;this.list=[];if(this.ctx)try{this.ctx.clearRect(0,0,this.w||0,this.h||0)}catch(e){}}};

/* ---------- pose & ekspresi ---------- */
const EX={idle:"neutral",walkin:"neutral",walk:"neutral",nod:"smile",shake:"tight",surprised:"surprised",sad:"sad",happy:"happy","angry-tense":"angry",thinking:"thinking"};
const LINE={idle:"Ya sudahlah.",walk:"Ayo, jalan!",nod:"Oke, aku coba.",shake:"Hmm, belum tentu.",surprised:"Hah?!",sad:"Hhh…",happy:"Yes, bisa!","angry-tense":"Grr… kesal!",thinking:"Coba kupikir dulu…"};
const NPCR={good:"nod",mid:"idle",bad:"surprised"};
let T=new Set(),EL=null;
const later=(fn,ms)=>{const id=setTimeout(()=>{T.delete(id);fn()},rmq()?0:ms);T.add(id)};
function pose(el,p,still){if(!el)return;el.setAttribute("class",`ch pose-${p} ex-${EX[p]||"neutral"}${still?" still":""}`);if(!still&&!rmq()){void el.getBoundingClientRect()}}
function bubble(svg,who,text,instant){const g=svg&&svg.querySelector(".bb");if(!g)return;const ch=svg.querySelector(`[data-ch="${who}"]`);if(!ch||!text){g.setAttribute("opacity","0");return}
 const words=text.split(" "),lines=[];let cur="";words.forEach(w=>{if((cur+" "+w).trim().length>22&&cur){lines.push(cur);cur=w}else cur=(cur+" "+w).trim()});if(cur)lines.push(cur);lines.splice(3);
 const m=ch.parentNode.getAttribute("transform").match(/translate\(([\d.]+) ([\d.]+)\)/),cx=+m[1],w=Math.min(260,Math.max(...lines.map(l=>l.length))*8.7+26),h=lines.length*19+16;
 let bx=Math.max(150,Math.min(490-w,who==="hero"?cx-w+30:cx-30)),by=Math.max(6,FLOOR-262-h+40);
 const r=g.querySelector(".bbr"),t=g.querySelector(".bbx"),tail=g.querySelector(".bbt");r.setAttribute("x",bx);r.setAttribute("y",by);r.setAttribute("width",w);r.setAttribute("height",h);
 const tx=Math.max(bx+14,Math.min(bx+w-14,cx+(who==="hero"?-14:14)));tail.setAttribute("d",`M${tx-8} ${by+h-2}L${tx} ${by+h+14}L${tx+9} ${by+h-2}z`);
 t.textContent="";lines.forEach((l,i)=>{const s=document.createElementNS("http://www.w3.org/2000/svg","tspan");s.setAttribute("x",bx+13);s.setAttribute("y",by+23+i*19);s.dataset.full=l;s.textContent=instant||rmq()?l:"";t.appendChild(s)});
 g.setAttribute("opacity","1");g.classList.remove("in");void g.getBoundingClientRect();g.classList.add("in");
 if(instant||rmq())return;const sp=[...t.children];let i=0,c=0;const step=()=>{if(i>=sp.length)return;const s=sp[i],f=s.dataset.full;c++;s.textContent=f.slice(0,c);if(c>=f.length){i++;c=0}later(step,22)};step()}
const quote=x=>{const m=String(x||"").match(/“([^”]+)”/);if(!m)return "";const q=m[1];return q.length>70?q.slice(0,68).replace(/\s\S*$/,"")+"…":q};
function headPt(svg,who,cv){const ch=svg&&svg.querySelector(`[data-ch="${who}"] .hd`);if(!ch||!cv)return null;const a=ch.getBoundingClientRect(),b=cv.getBoundingClientRect();return{x:a.left-b.left+a.width/2,y:a.top-b.top+a.height*.3,w:a.width/2}}
const NODEWHO=n=>n&&n.who;

return{
 thumb(c){const n=c.nodes?c.nodes[c.start]:null;return sceneSVG(n?n.sc:({mail:"kamar",boss:"kantor",team:"rapat"}[c.ilus]||"kamar"),n?n.who:null,{still:true,heroOpt:c.hero}).replace('<canvas class="gv-pc" aria-hidden="true"></canvas>',"")},
 scene(c,n,st){return sceneSVG(n.sc,NODEWHO(n),{heroOpt:c.hero})},
 enter(el,c,n,st,still){this.stop();EL=el;if(!el)return;const svg=el.querySelector(".gvs");
  const avg=st.scores.length?st.scores.reduce((a,b)=>a+b,0)/st.scores.length:null;el.dataset.mood=avg==null?"":["good","good","mid","bad"][GLS.score.pita(avg)];
  const hero=svg.querySelector('[data-ch="hero"]');pose(hero,st.ids.length?"idle":"walkin",still);
  const q=quote(GLS.eng.text(c,st)),npc=svg.querySelector('[data-ch^="npc-"]');
  if(q)later(()=>bubble(svg,npc?npc.dataset.ch:"hero",q,still),still?0:650);
  if(!still&&!st.ids.length)later(()=>pose(hero,"idle"),1700)},
 react(rx,tone,ch){const el=EL;if(!el)return;const svg=el.querySelector(".gvs"),cv=el.querySelector(".gv-pc"),hero=svg.querySelector('[data-ch="hero"]');
  pose(hero,rx);bubble(svg,"hero",LINE[rx]||"");
  const npcs=[...svg.querySelectorAll('[data-ch^="npc-"]')];later(()=>npcs.forEach(n=>pose(n,NPCR[tone]||"idle")),380);
  later(()=>{const p=headPt(svg,"hero",cv);if(!p)return;if(rx==="angry-tense"||(tone==="bad"&&rx!=="sad"))PC.emit(cv,"sweat",p.x,p.y,7);else if(rx==="happy"||tone==="good"){const n=tone==="good"?6:3;PC.emit(cv,"stars",p.x-p.w*1.4,p.y+p.w*1.6,n);PC.emit(cv,"stars",p.x+p.w*1.4,p.y+p.w*1.6,n)}else if(rx==="sad")PC.emit(cv,"sweat",p.x,p.y+6,3)},420)},
 mood(tone){if(EL)EL.dataset.mood=tone||""},
 settle(rx,tone){const el=EL;if(!el)return;this.stop();EL=el;const svg=el.querySelector(".gvs");pose(svg.querySelector('[data-ch="hero"]'),rx,true);
  svg.querySelectorAll('[data-ch^="npc-"]').forEach(n=>pose(n,NPCR[tone]||"idle",true));bubble(svg,"hero",LINE[rx]||"",true);el.dataset.mood=tone||""},
 ending(c,type){const sc=c.endScene||"lobi";return sceneSVG(sc,null,{hx:320,heroOpt:c.hero})},
 endingPlay(el,type){this.stop();EL=el;if(!el)return;const svg=el.querySelector(".gvs"),cv=el.querySelector(".gv-pc"),hero=svg&&svg.querySelector('[data-ch="hero"]');
  el.dataset.mood=type==="win"?"good":type==="fail"?"bad":"";pose(hero,type==="win"?"happy":type==="fail"?"sad":"idle");
  if(type==="win")later(()=>{const p=headPt(svg,"hero",cv);if(p){PC.emit(cv,"confetti",p.x-120,p.y+60,36);PC.emit(cv,"confetti",p.x+120,p.y+60,36)}},350);
  if(type==="mid")later(()=>bubble(svg,"hero","Langkah kecil dulu, lalu konsisten.",false),700);
  if(type==="fail")later(()=>bubble(svg,"hero","Aku belajar dari sini.",false),1600)},
 stop(){T.forEach(clearTimeout);T.clear();PC.stop()},
 preload(c){try{new Set(Object.values(c.nodes).map(n=>n.sc).concat(c.endScene||"lobi")).forEach(sc=>{if(IMG.has(sc)){const i=new Image();i.src=SIMSRC(sc)}})}catch(e){}},
 tokoh,sceneSVG,SC:Object.keys(SC),POSES:Object.keys(EX)};
})();
