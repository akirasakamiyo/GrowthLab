/* ==========================================================================
   GL v8 · INTI SIMULASI & NILAI (GLS) — tanpa DOM, bisa diuji di Node.
   - GLS.score : SATU-SATUNYA tempat rumus nilai (aspek, simulasi, akhir, pita, kategori).
   - GLS.db    : penyimpanan "gl-latihan" berversi (v2) + validasi + migrasi v1,
                 cadangan di memori bila localStorage diblokir/penuh (Safari privat).
   - GLS.eng   : engine cerita bercabang (graf berlapis 5 situasi, flag, meter, ending).
   - GLS.validate / GLS.tests : validator data dan tes otomatis (dipakai di ?debug=1).
   ========================================================================== */
const GLS=(()=>{
const r1=n=>Math.round(n*10)/10,isNum=v=>typeof v==="number"&&isFinite(v),isObj=v=>!!v&&typeof v==="object"&&!Array.isArray(v);
const in100=v=>isNum(v)&&v>=0&&v<=100,str=v=>typeof v==="string";
const RX=["idle","walk","nod","shake","surprised","sad","happy","angry-tense","thinking"];
const SITU=5;

/* ---------- RUMUS (satu sumber kebenaran) ---------- */
const score={
 /* indeks pita rubrik: 0 Sangat Baik (86–100), 1 Baik (71–85), 2 Cukup (56–70), 3 Perlu Bimbingan (≤55).
    Nilai dibulatkan 1 desimal dulu (keputusan lama, CATATAN §3.3): 55,5 → Perlu Bimbingan. */
 pita(v){if(!isNum(v))return null;const x=r1(v);return GLD.LEVEL.findIndex(([,m])=>x>=m)},
 /* skor aspek per kasus = rata-rata skor pilihan di jalur yang diambil */
 aspek(scores){return Array.isArray(scores)&&scores.length&&scores.every(in100)?scores.reduce((a,b)=>a+b,0)/scores.length:null},
 /* Nilai Simulasi = Σ (skor terbaik kasus × bobot kasus) — bobot di GLD.SIM[i].w (0,35/0,35/0,30) */
 simulasi(asp){return asp.length&&asp.every(a=>in100(a.v)&&isNum(a.w))?asp.reduce((t,a)=>t+a.v*a.w,0):null},
 /* Nilai Akhir = PG × 0,30 + Simulasi × 0,70 */
 akhir(pg,sim){return in100(pg)&&in100(sim)?pg*GLD.W_MCQ+sim*GLD.W_SIM:null},
 /* kategori Nilai Akhir; jika PG < PASS_MCQ, kategori maksimal "Cukup Siap" (aturan PDF, CATATAN §3.2) */
 kategori(akhir,pg){if(!isNum(akhir))return{ki:null,capped:false};let ki=GLD.KATEGORI.findIndex(([,m])=>r1(akhir)>=m),capped=false;if(isNum(pg)&&pg<GLD.PASS_MCQ&&ki<2){ki=2;capped=true}return{ki,capped}},
 lulusPG:pg=>isNum(pg)&&pg>=GLD.PASS_MCQ,
 /* skor baru menggantikan skor terbaik jika lebih tinggi/sama, atau jika skor lama berasal dari versi skenario lama */
 lebihBaik:(rec,best)=>!best||!!best.legacy||rec.score>=best.score,
 pitaLabel:i=>{const L=GLD.LEVEL,lo=L[i][1],hi=i?L[i-1][1]-1:100;return i===L.length-1?`≤ ${L[i-1][1]-1}`:`${lo}–${hi}`},
 katLabel:i=>{const K=GLD.KATEGORI,lo=K[i][1],hi=i?K[i-1][1]-1:100;return i===K.length-1?`< ${K[i-1][1]}`:`${lo}–${hi}`}
};

/* ---------- PENYIMPANAN ---------- */
function mkStore(get){const mem={};let s=null;try{s=get();if(s){const t="__gl_t";s.setItem(t,"1");s.removeItem(t)}}catch(e){s=null}
 return{persistent:()=>!!s,
  get(k){if(Object.prototype.hasOwnProperty.call(mem,k))return mem[k];if(s){try{return s.getItem(k)}catch(e){}}return null},
  set(k,v){mem[k]=v;if(s){try{s.setItem(k,v);return true}catch(e){}}return false},
  del(k){mem[k]=null;if(s){try{s.removeItem(k)}catch(e){}}}}}
const KEY="gl-latihan",VER=2;
const blank=()=>({v:VER,kuis:{best:{},hist:[],ptsBest:{}},dnd:{},sim:{},akhir:{last:null,hist:[]}});
const arr=(a,f,max)=>Array.isArray(a)?a.filter(f).slice(-max):[];
const okQ=r=>isObj(r)&&in100(r.score)&&isNum(r.benar)&&isNum(r.n)&&r.n>0;
const simRec=(r,legacy)=>isObj(r)&&in100(r.score)?Object.assign({score:r1(r.score),t:isNum(r.t)?r.t:0,ending:str(r.ending)?r.ending:null,path:arr(r.path,in100,SITU)},legacy||r.legacy?{legacy:true}:{}):null;
function cleanRun(r,c){if(!isObj(r)||!c||r.cv!==c.cv||!Array.isArray(r.ids)||r.ids.length>=SITU||!r.ids.every(str))return null;return{cv:r.cv,ids:r.ids.slice(),t:isNum(r.t)?r.t:0}}
/* bersihkan + migrasi data apa pun yang dibaca dari penyimpanan; bagian yang rusak dibuang, tidak pernah melempar error */
function clean(d){const o=blank();if(!isObj(d)||(d.v!==1&&d.v!==VER))return o;const v1=d.v===1;
 const k=isObj(d.kuis)?d.kuis:{};
 if(isObj(k.best))for(const m in k.best)if(okQ(k.best[m]))o.kuis.best[m]=k.best[m];
 o.kuis.hist=arr(k.hist,h=>okQ(h)&&str(h.m),40);
 if(isObj(k.ptsBest))for(const m in k.ptsBest)if(isNum(k.ptsBest[m]))o.kuis.ptsBest[m]=k.ptsBest[m];
 if(isObj(d.dnd))for(const id in d.dnd){const x=d.dnd[id];if(isObj(x)&&isObj(x.best)&&isNum(x.best.benar)&&isNum(x.best.n)){o.dnd[id]={best:{benar:x.best.benar,n:x.best.n,t:isNum(x.best.t)?x.best.t:0},n:isNum(x.n)?x.n:1};if(isNum(x.bestT))o.dnd[id].bestT=x.bestT}}
 if(isObj(d.sim))GLD.SIM.forEach(c=>{const x=d.sim[c.id];if(!isObj(x))return;
  /* v1 = skenario versi lama (sebelum cerita 5 situasi): skor tetap dihitung ke Nilai Akhir tetapi ditandai "versi lama"
     dan otomatis diganti oleh hasil pertama di versi baru */
  const s={best:simRec(x.best,v1),last:simRec(x.last,v1),hist:arr(x.hist,h=>!!simRec(h),20).map(h=>simRec(h,v1)),endings:v1?[]:arr(x.endings,str,12),run:v1?null:cleanRun(x.run,c)};
  if(s.best||s.run||s.hist.length)o.sim[c.id]=s});
 const a=isObj(d.akhir)?d.akhir:{};o.akhir.last=isNum(a.last)?a.last:null;o.akhir.hist=arr(a.hist,h=>isObj(h)&&isNum(h.akhir),20);
 return o}
function mkDB(store){return{
 load(){let d=null;try{d=JSON.parse(store.get(KEY)||"null")}catch(e){d=null}return clean(d)},
 save(d){try{d.v=VER;return store.set(KEY,JSON.stringify(d))}catch(e){return false}},
 clear(){store.del(KEY)},persistent:()=>store.persistent()}}
let db=null;const DB=()=>db||(db=mkDB(mkStore(()=>window.localStorage)));

/* ---------- ENGINE CERITA BERCABANG ---------- */
const eng={
 kasus:id=>GLD.SIM.find(s=>s.id===id)||null,
 playable:c=>!!(c&&!c.soon&&c.nodes),
 cond(w,st){if(!w)return true;const F=st.flags||{},L=v=>Array.isArray(v)?v:[v];
  if(w.f!=null&&!L(w.f).every(f=>F[f]))return false;
  if(w.nf!=null&&L(w.nf).some(f=>F[f]))return false;
  if(w.pita&&!w.pita.includes(score.pita(score.aspek(st.scores))))return false;
  if(w.m){const[k,op,v]=w.m,x=st.meters[k];if(op==="<"?!(x<v):!(x>=v))return false}
  return true},
 start(c){return{cid:c.id,node:c.start,ids:[],scores:[],flags:{},meters:Object.fromEntries(c.meters.map(m=>[m.k,50])),log:[]}},
 node:(c,st)=>st.node?c.nodes[st.node]:null,
 choices(c,st){const n=eng.node(c,st);return n?n.c.filter(ch=>eng.cond(ch.req,st)):[]},
 text(c,st){const n=eng.node(c,st);if(!n)return "";const v=(n.v||[]).find(x=>eng.cond(x.w,st));return v?v.x:n.x},
 choose(c,st,id){const ch=eng.choices(c,st).find(x=>x.id===id);if(!ch)return null;
  const ns={cid:st.cid,node:ch.n,ids:st.ids.concat(id),scores:st.scores.concat(ch.s),flags:Object.assign({},st.flags),meters:Object.assign({},st.meters),log:st.log.concat({node:st.node,id,t:ch.t,s:ch.s,fb:ch.fb,rx:ch.rx})};
  (ch.set||[]).forEach(f=>{ns.flags[f]=true});
  c.meters.forEach((m,i)=>{const dl=ch.m?ch.m[i]:Math.round((ch.s-60)/4);ns.meters[m.k]=Math.max(0,Math.min(100,ns.meters[m.k]+dl))});
  return{st:ns,ch}},
 done:st=>st.node==null,
 ending(c,st){return c.endings.find(e=>eng.cond(e.w,st))||c.endings[c.endings.length-1]},
 replay(c,ids){if(!eng.playable(c)||!Array.isArray(ids))return null;let st=eng.start(c);for(const id of ids){if(eng.done(st))return null;const r=eng.choose(c,st,id);if(!r)return null;st=r.st}return st},
 /* jalur otomatis untuk debug/tes: pilih skor tertinggi, terendah, atau tengah */
 auto(c,mode){let st=eng.start(c);while(!eng.done(st)){const cs=eng.choices(c,st).slice().sort((a,b)=>b.s-a.s);const ch=mode==="best"?cs[0]:mode==="worst"?cs[cs.length-1]:cs[Math.floor(cs.length/2)];st=eng.choose(c,st,ch.id).st}return st},
 result(c,st){const sc=score.aspek(st.scores),e=eng.ending(c,st);return{score:r1(sc),raw:sc,ending:e.id,path:st.scores.slice(),t:Date.now()}}
};
/* id pilihan stabil: a, b, c, d, e sesuai urutan di data */
function prep(){GLD.SIM.forEach(c=>{if(!eng.playable(c))return;for(const k in c.nodes)c.nodes[k].c.forEach((ch,i)=>{if(!ch.id)ch.id="abcde"[i]})})}
prep();

/* ---------- VALIDATOR DATA ---------- */
function validate(c){const errors=[],warn=[],E=m=>errors.push(`${c.id}: ${m}`);
 if(!eng.playable(c))return{id:c.id,soon:true,errors,warn,paths:0,ends:{}};
 if(!isNum(c.cv))E("cv (versi konten) wajib angka");
 if(!Array.isArray(c.meters)||c.meters.length!==2)E("harus ada tepat 2 meter");
 if(!c.nodes[c.start])E(`node awal "${c.start}" tidak ada`);
 const setF=new Set(),useF=new Set(),useW=w=>{if(!w)return;[].concat(w.f||[],w.nf||[]).forEach(f=>useF.add(f))};
 for(const [k,n] of Object.entries(c.nodes)){
  if(!(Number.isInteger(n.lv)&&n.lv>=1&&n.lv<=SITU))E(`${k}: lv harus 1–${SITU}`);
  if(!str(n.x)||!n.x.trim())E(`${k}: narasi kosong`);
  (n.v||[]).forEach(v=>useW(v.w));
  if(!Array.isArray(n.c)||!n.c.length){E(`${k}: tidak punya pilihan`);continue}
  n.c.forEach(ch=>{const p=`${k}.${ch.id}`;
   if(!Number.isInteger(ch.s)||ch.s<0||ch.s>100)E(`${p}: skor ${ch.s} di luar 0–100`);
   if(!str(ch.t)||!ch.t.trim())E(`${p}: teks pilihan kosong`);
   if(!str(ch.fb)||!ch.fb.trim())E(`${p}: feedback kosong`);
   if(!RX.includes(ch.rx))E(`${p}: reaction "${ch.rx}" tidak dikenal`);
   if(ch.m&&!(Array.isArray(ch.m)&&ch.m.length===2&&ch.m.every(isNum)))E(`${p}: m harus [angka, angka]`);
   (ch.set||[]).forEach(f=>setF.add(f));useW(ch.req);
   if(n.lv<SITU){if(!c.nodes[ch.n])E(`${p}: next "${ch.n}" tidak ada`);else if(c.nodes[ch.n].lv!==n.lv+1)E(`${p}: next "${ch.n}" bukan situasi ${n.lv+1}`)}
   else if(ch.n!=null)E(`${p}: situasi ${SITU} harus berakhir (n: null)`)})}
 (c.endings||[]).forEach(e=>useW(e.w));
 useF.forEach(f=>{if(!setF.has(f))E(`flag "${f}" dipakai sebagai syarat tetapi tidak pernah diaktifkan`)});
 if(!Array.isArray(c.endings)||c.endings.length<3)E("ending kurang dari 3");
 else{["win","mid","fail"].forEach(t=>{if(!c.endings.some(e=>e.type===t))E(`tidak ada ending bertipe ${t}`)});if(c.endings[c.endings.length-1].w)E("ending terakhir harus tanpa syarat (default)");c.endings.forEach(e=>{if(!str(e.t)||!str(e.x))E(`ending ${e.id}: judul/teks kosong`)})}
 const seen=new Set(),ends={};let paths=0;
 const walk=st=>{if(errors.length>40)return;
  if(eng.done(st)){paths++;if(st.ids.length!==SITU)E(`jalur ${st.ids.join("")} berisi ${st.ids.length} situasi, harus ${SITU}`);const e=eng.ending(c,st);ends[e.id]=(ends[e.id]||0)+1;return}
  if(st.ids.length>=SITU){E(`jalur ${st.ids.join("")} lebih dari ${SITU} situasi`);return}
  const n=eng.node(c,st);if(!n){E(`node "${st.node}" tidak ada`);return}seen.add(st.node);
  const vis=eng.choices(c,st);if(vis.length<3||vis.length>4)E(`${st.node}: ${vis.length} pilihan terlihat (harus 3–4) saat flag {${Object.keys(st.flags).join(", ")}}`);
  vis.forEach(ch=>{const r=eng.choose(c,st,ch.id);if(r)walk(r.st)})};
 if(c.nodes[c.start])walk(eng.start(c));
 Object.keys(c.nodes).forEach(k=>{if(!seen.has(k))E(`${k}: node yatim (tidak bisa dicapai)`)});
 (c.endings||[]).forEach(e=>{if(!ends[e.id])E(`ending "${e.id}" tidak pernah tercapai`)});
 return{id:c.id,errors,warn,paths,ends}}
const validateAll=()=>GLD.SIM.map(validate);

/* ---------- TES OTOMATIS ---------- */
function tests(){const T=[],t=(name,ok,detail)=>T.push({name,ok:!!ok,detail:detail==null?"":String(detail)}),near=(a,b)=>isNum(a)&&Math.abs(a-b)<1e-9;
 t("PASS_MCQ = 70",GLD.PASS_MCQ===70,GLD.PASS_MCQ);
 t("Bobot PG 0,30 dan simulasi 0,70",near(GLD.W_MCQ,.3)&&near(GLD.W_SIM,.7));
 t("Bobot aspek 0,35/0,35/0,30",GLD.SIM.map(s=>s.w).join()==="0.35,0.35,0.3");
 t("Skor aspek = rata-rata jalur",near(score.aspek([95,80,62,40,20]),59.4),score.aspek([95,80,62,40,20]));
 t("Skor aspek: jalur kosong/skor tidak valid → null",score.aspek([])===null&&score.aspek([101])===null&&score.aspek([50,"x"])===null);
 t("Nilai Simulasi (contoh CATATAN)",near(score.simulasi([{w:.35,v:95},{w:.35,v:43.8},{w:.3,v:55}]),65.08));
 t("Nilai Simulasi null jika ada kasus belum dimainkan",score.simulasi([{w:.35,v:95},{w:.35,v:null},{w:.3,v:55}])===null);
 t("Nilai Akhir = PG×0,30 + Sim×0,70",near(score.akhir(88.2,65.08),72.016));
 t("Nilai Akhir 0 dan 100",near(score.akhir(0,0),0)&&near(score.akhir(100,100),100));
 [[100,0],[86,0],[85.96,0],[85.9,1],[85,1],[71,1],[70.9,2],[70,2],[56,2],[55.9,3],[55.5,3],[55,3],[0,3]].forEach(([v,p])=>t(`Pita rubrik ${v} → ${GLD.LEVEL[p][0]}`,score.pita(v)===p,score.pita(v)));
 [[100,0],[86,0],[85,1],[71,1],[70,2],[56,2],[55,3],[0,3]].forEach(([v,k])=>t(`Kategori ${v} (PG lulus) → ${GLD.KATEGORI[k][0]}`,score.kategori(v,100).ki===k,score.kategori(v,100).ki));
 t("Kategori dibatasi Cukup Siap bila PG < 70",score.kategori(90,69.9).ki===2&&score.kategori(90,69.9).capped&&score.kategori(90,70).ki===0);
 t("Skor terbaik: lebih tinggi/sama menggantikan",score.lebihBaik({score:70},{score:70})&&score.lebihBaik({score:71},{score:70})&&!score.lebihBaik({score:69},{score:70}));
 t("Skor terbaik: skor versi lama selalu diganti",score.lebihBaik({score:10},{score:90,legacy:true}));
 /* penyimpanan palsu untuk tes */
 const fake=(init,mode)=>{const m=Object.assign({},init);return{getItem:k=>{if(mode==="block")throw Error("SecurityError");return k in m?m[k]:null},setItem:(k,v)=>{if(mode==="block")throw Error("SecurityError");if(mode==="quota"&&k===KEY)throw Error("QuotaExceededError");m[k]=String(v)},removeItem:k=>{delete m[k]}}};
 const dbOf=(init,mode)=>mkDB(mkStore(()=>fake(init,mode)));
 let x;
 x=dbOf({[KEY]:"{rusak"}).load();t("JSON rusak → data kosong tanpa error",x.v===VER&&!Object.keys(x.sim).length);
 x=dbOf({[KEY]:JSON.stringify({v:2,kuis:"x",dnd:[1],sim:{s1:{best:{score:"90"}}},akhir:5})}).load();t("Tipe data salah → bagian rusak dibuang",isObj(x.kuis.best)&&!x.sim.s1&&x.akhir.last===null);
 x=dbOf({[KEY]:JSON.stringify({v:99,sim:{s1:{best:{score:90}}}})}).load();t("Versi skema tak dikenal → data kosong",!x.sim.s1);
 x=dbOf({}).load();t("Penyimpanan kosong → data kosong",x.v===VER);
 const v1={v:1,kuis:{best:{all:{score:88.2,benar:30,n:34,t:1}},hist:[{m:"all",score:88.2,benar:30,n:34,t:1}]},dnd:{stres:{best:{benar:8,n:8,t:1},n:2}},sim:{s1:{best:{score:38.3,level:"Perlu Bimbingan",path:[20,15,80],t:1},hist:[{score:38.3,path:[20,15,80],t:1}],seen:["a1"]},s9:{best:{score:50}}},akhir:{last:72,hist:[{akhir:72,t:1}]}};
 x=dbOf({[KEY]:JSON.stringify(v1)}).load();
 t("Migrasi v1 → v2: kuis & drag-drop tetap",x.kuis.best.all.score===88.2&&x.dnd.stres.best.benar===8);
 t("Migrasi v1 → v2: skor simulasi lama ditandai versi lama",x.sim.s1&&x.sim.s1.best.score===38.3&&x.sim.s1.best.legacy===true&&!x.sim.s9);
 let d2=dbOf({},"block");x=d2.load();x.sim.s1={best:{score:80,t:1,path:[80]},hist:[],endings:[],run:null,last:null};d2.save(x);
 t("localStorage diblokir → tersimpan di memori",d2.load().sim.s1&&d2.load().sim.s1.best.score===80&&!d2.persistent());
 d2=dbOf({[KEY]:JSON.stringify({v:2,kuis:{best:{all:{score:50,benar:17,n:34}}}})},"quota");x=d2.load();x.kuis.best.all={score:90,benar:31,n:34};d2.save(x);
 t("Penyimpanan penuh → data terbaru tetap terbaca",d2.load().kuis.best.all.score===90);
 GLD.SIM.filter(eng.playable).forEach(c=>{
  const st=eng.auto(c,"best"),bad=eng.replay(c,["z"]);
  t(`${c.id}: replay jalur valid sama dengan jalur asli`,JSON.stringify(eng.replay(c,st.ids).scores)===JSON.stringify(st.scores));
  t(`${c.id}: replay pilihan tidak dikenal → null`,bad===null);
  t(`${c.id}: permainan tersimpan dari versi konten lain dibuang`,cleanRun({cv:c.cv+1,ids:[]},c)===null&&!!cleanRun({cv:c.cv,ids:[]},c));
  ["best","mid","worst"].forEach(m=>{const s=eng.auto(c,m),r=eng.result(c,s);t(`${c.id}: jalur otomatis ${m} = 5 situasi, skor ${r.score}, ending ${r.ending}`,s.ids.length===SITU&&near(r.raw,s.scores.reduce((a,b)=>a+b,0)/SITU))});
  t(`${c.id}: jalur terbaik → ending win`,eng.ending(c,eng.auto(c,"best")).type==="win");
  t(`${c.id}: jalur terburuk → ending fail`,eng.ending(c,eng.auto(c,"worst")).type==="fail")});
 return T}

return{score,eng,db:{load:()=>DB().load(),save:d=>DB().save(d),clear:()=>DB().clear(),persistent:()=>DB().persistent()},mkStore,mkDB,clean,cleanRun,validate,validateAll,tests,RX,SITU,KEY,VER,r1};
})();
