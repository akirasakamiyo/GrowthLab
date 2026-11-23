const {chromium}=require("playwright");const S="/private/tmp/claude-501/-Users-rifahaqi-Desktop-GL-HUB-MOTION/3bb73e09-68ea-4919-a162-a2249a307a42/scratchpad/";
(async()=>{const b=await chromium.launch({channel:"chrome"});const lockMode=process.argv[2]==="lock";
const done=[];for(let i=0;i<3;i++)for(let j=0;j<5;j++)if(!lockMode||i===0&&j<2)done.push(i+"-"+j);
for(const [w,hh,tag] of [[1280,800,"d"],[390,844,"m"]]){const c=await b.newContext({viewport:{width:w,height:hh}});
await c.addInitScript(d=>{localStorage.setItem("mer-done",JSON.stringify(d));window.GL_NO_GATE=1},done);
const p=await c.newPage();await p.goto("http://localhost:8000/#/peta");await p.waitForTimeout(4000);
const y=await p.evaluate(()=>{document.querySelectorAll(".rv").forEach(e=>e.classList.add("in"));const r=document.querySelector(".peta").getBoundingClientRect();return r.top+scrollY-20});
const H=await p.evaluate(()=>document.querySelector(".peta").offsetHeight);
for(let k=0;k*hh<H+40&&k<8;k++){await p.evaluate(v=>{if(window.__lenis)window.__lenis.scrollTo(v,{immediate:true,force:true});else scrollTo(0,v)},y+k*(hh-60));await p.waitForTimeout(700);await p.screenshot({path:S+`pt-${tag}${lockMode?"L":""}-${k}.png`})}
console.log(tag,H);await c.close()}await b.close()})();
