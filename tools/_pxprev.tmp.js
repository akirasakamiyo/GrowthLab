/* Preview adegan GLPIX: node tools/_pxprev.tmp.js <file-adegan.js> <out.png> [warnaLatar]
   Merender tiap adegan dari file itu pada u = 0, .25, .5, .75 (dan 'still') ke satu PNG, skala 5x. Butuh server tes di :8000. */
const {chromium}=require("playwright");const fs=require("fs");
(async()=>{const [file,out,bg]=process.argv.slice(2);const b=await chromium.launch({channel:"chrome"});const p=await b.newPage();
const errs=[];p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
await p.goto("http://localhost:8000/#/tentang");await p.waitForFunction(()=>window.GLPIX);
const before=await p.evaluate(()=>Object.keys(GLPIX.S));
await p.addScriptTag({content:fs.readFileSync(file,"utf8")});
const data=await p.evaluate(({before,bg})=>{const ks=Object.keys(GLPIX.S).filter(k=>!before.includes(k));const Z=5,G=8;const rows=[];
 for(const k of ks){const m=GLPIX.build(k,bg||"#ff6b3d"),s=m.s,w=s.w||GLPIX.W,h=s.h||GLPIX.H,us=[0,.25,.5,.75,s.still??0];rows.push({k,w,h,us,m})}
 const W=Math.max(...rows.map(r=>(r.w*Z+G)*r.us.length)),H=rows.reduce((a,r)=>a+r.h*Z+G+14,0);
 const cv=document.createElement("canvas");cv.width=W;cv.height=H;const cx=cv.getContext("2d");cx.imageSmoothingEnabled=false;cx.fillStyle="#222";cx.fillRect(0,0,W,H);
 const load=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src});
 return (async()=>{let y=0;for(const r of rows){cx.fillStyle="#fff";cx.font="12px monospace";cx.fillText(r.k+"  (u=0,.25,.5,.75,still)",4,y+11);y+=14;
  const base=await load(r.m.base),fg=r.m.fg?await load(r.m.fg):null;
  for(let n=0;n<r.us.length;n++){const u=r.us[n],x0=n*(r.w*Z+G);cx.drawImage(base,x0,y,r.w*Z,r.h*Z);
   for(const {pt,urls} of r.m.parts){const a=pt.at?pt.at(u,u*(r.m.s.dur||3),bg||"#ff6b3d"):{};const f=Math.max(0,Math.min(urls.length-1,a.f|0));const im=await load(urls[f]);
    const x=a.x??pt.ax??0,yy=a.y??pt.ay??0,sx=a.sx??a.s??1,sy=a.sy??a.s??1,ax=pt.ax||0,ay=pt.ay||0;
    cx.save();cx.globalAlpha=a.o??1;cx.translate(x0+x*Z,y+yy*Z);cx.rotate((a.r||0)*Math.PI/180);cx.scale(sx,sy);cx.drawImage(im,-ax*Z,-ay*Z,pt.w*Z,pt.h*Z);cx.restore()}
   if(fg)cx.drawImage(fg,x0,y,r.w*Z,r.h*Z)}
  y+=r.h*Z+G}return {keys:rows.map(r=>r.k),png:cv.toDataURL()}})()},{before,bg});
fs.writeFileSync(out,Buffer.from(data.png.split(",")[1],"base64"));console.log("adegan:",data.keys.join(", "),"| error:",errs.length?errs:"tidak ada");await b.close()})();
