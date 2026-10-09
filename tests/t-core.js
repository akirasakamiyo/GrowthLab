// Jalankan validator + tes GLS di Node (tanpa browser)
const fs=require("fs");const h=fs.readFileSync(process.argv[2]||require("path").join(__dirname,"..","GrowthLab_v5.html"),"utf8");
const blk=id=>{const a=h.indexOf(`<script id="${id}">`)+`<script id="${id}">`.length;return h.slice(a,h.indexOf("</script>",a))};
const window={localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}};
const {GLD,GLS}=new Function("window","document",blk("gl-data")+";"+blk("gl-sim-core")+";return{GLD,GLS}")(window,{});
let bad=0;
for(const v of GLS.validateAll()){if(v.soon){console.log(`[validator] ${v.id}: segera hadir (dilewati)`);continue}
 console.log(`[validator] ${v.id}: ${v.paths} jalur, ending ${JSON.stringify(v.ends)}, ${v.errors.length} error`);v.errors.forEach(e=>{bad++;console.log("   ✕",e)})}
for(const t of GLS.tests()){if(!t.ok){bad++;console.log("✕",t.name,t.detail)}}
console.log(`tes: ${GLS.tests().length} kasus, ${bad} gagal`);process.exit(bad?1:0);
