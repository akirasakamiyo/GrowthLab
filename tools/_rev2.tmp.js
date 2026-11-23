const {chromium}=require("playwright");(async()=>{const b=await chromium.launch({channel:"chrome"});
const done=[];for(let i=0;i<3;i++)for(let j=0;j<5;j++)done.push(i+"-"+j);
for(const [w,hh,tag] of [[1280,800,"d"],[390,844,"m"]]){const c=await b.newContext({viewport:{width:w,height:hh}});
await c.addInitScript(d=>{localStorage.setItem("mer-done",JSON.stringify(d));window.GL_NO_GATE=1},done);
const p=await c.newPage();const errs=[];p.on("pageerror",e=>errs.push(e.message));
await p.goto("http://localhost:8000/#/peta");await p.waitForTimeout(2500);
await p.evaluate(()=>document.querySelectorAll(".rv").forEach(e=>e.classList.add("in")));
const el=await p.$(".peta");await el.screenshot({path:`/private/tmp/claude-501/-Users-rifahaqi-Desktop-GL-HUB-MOTION/3bb73e09-68ea-4919-a162-a2249a307a42/scratchpad/peta-${tag}.png`});
console.log(tag,"overflowX",await p.evaluate(()=>document.documentElement.scrollWidth),"konsep",await p.$$eval(".pk-k",x=>x.length),"lock",await p.$$eval(".pk-g.lock",x=>x.length));
await p.goto("http://localhost:8000/#/lesson/0-3");await p.waitForTimeout(2000);
console.log(tag,await p.evaluate(()=>{const a=document.querySelector("#lart");return [...a.querySelectorAll("h2[id],.lab-set,.lab[data-w],.take,.uji,.cek")].map(e=>e.className.split(" ")[0]+(e.id?"#"+e.id:"")).join(" > ")}));
console.log(tag,"toc",await p.$$eval(".toc .chip",x=>x.map(e=>e.textContent).join(" | ")));
if(tag==="d"){const s=await p.$(".lab-set");await s.screenshot({path:"/private/tmp/claude-501/-Users-rifahaqi-Desktop-GL-HUB-MOTION/3bb73e09-68ea-4919-a162-a2249a307a42/scratchpad/coba.png"})}
console.log("errs",errs);await c.close()}
await b.close()})();
