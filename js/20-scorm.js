/* 2026-10-20: laporan ke LMS (SCORM 1.2). Hanya aktif bila halaman dibuka dari LMS yang menyediakan API SCORM;
   di browser biasa skrip ini diam. Yang dikirim: nilai akhir (0–100) dan status selesai. Progres tetap di localStorage. */
(()=>{
const find=w=>{for(let n=0;w&&n<12;n++){try{if(w.API&&w.API.LMSInitialize)return w.API}catch(e){}if(w.parent===w)break;w=w.parent}return null};
let api=find(window);try{if(!api&&window.opener)api=find(window.opener)}catch(e){}
if(!api||String(api.LMSInitialize(""))!=="true")return;
const get=k=>{try{return String(api.LMSGetValue(k)||"")}catch(e){return""}},set=(k,v)=>{try{api.LMSSetValue(k,String(v))}catch(e){}};
if(/^(not attempted|)$/.test(get("cmi.core.lesson_status")))set("cmi.core.lesson_status","incomplete");
set("cmi.core.score.min",0);set("cmi.core.score.max",100);api.LMSCommit("");
let last="";
function sync(){if(typeof GLX==="undefined"||!GLX.hitung)return;let H;try{H=GLX.hitung()}catch(e){return}
 if(H.akhir==null)return;const v=String(Math.round(H.akhir));if(v===last)return;last=v;
 set("cmi.core.score.raw",v);set("cmi.core.lesson_status","completed");api.LMSCommit("")}
const t0=Date.now();let fin=false;
function finish(){if(fin)return;fin=true;sync();const s=Math.round((Date.now()-t0)/1000),hh=String(Math.floor(s/3600)).padStart(2,"0"),mm=String(Math.floor(s%3600/60)).padStart(2,"0"),ss=String(s%60).padStart(2,"0");
 set("cmi.core.session_time",`${hh}:${mm}:${ss}`);set("cmi.core.exit","suspend");try{api.LMSCommit("");api.LMSFinish("")}catch(e){}}
setInterval(sync,10000);addEventListener("hashchange",()=>setTimeout(sync,800));addEventListener("pagehide",finish);addEventListener("beforeunload",finish);
})();
