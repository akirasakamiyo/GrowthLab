// Jalankan validator + tes GLS di Node (tanpa browser)
const fs=require("fs"),path=require("path"),ROOT=path.join(__dirname,"..");
const h=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
const blk=id=>{const m=h.match(new RegExp(`<script src="([^"]+)" id="${id}"></script>`));return fs.readFileSync(path.join(ROOT,m[1]),"utf8")};
const window={localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}};
const {GLD,GLS}=new Function("window","document",blk("gl-data")+";"+blk("gl-sim-core")+";return{GLD,GLS}")(window,{});
let bad=0;
for(const v of GLS.validateAll()){if(v.soon){console.log(`[validator] ${v.id}: segera hadir (dilewati)`);continue}
 console.log(`[validator] ${v.id}: ${v.paths} jalur, ending ${JSON.stringify(v.ends)}, ${v.errors.length} error`);v.errors.forEach(e=>{bad++;console.log("   ✕",e)})}
for(const t of GLS.tests()){if(!t.ok){bad++;console.log("✕",t.name,t.detail)}}
console.log(`tes: ${GLS.tests().length} kasus, ${bad} gagal`);process.exit(bad?1:0);
