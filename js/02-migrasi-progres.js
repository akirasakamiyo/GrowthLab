/* 2026-10-20: urutan Bab 2 mengikuti Jabaran Materi (Communicate with Empathy pindah ke urutan terakhir).
   Kunci progres lama "1-x" (pelajaran selesai, catatan, cek cepat) dipetakan ulang satu kali. */
(()=>{try{const LS=localStorage;if(LS.getItem("gl-ord")==="2")return;
 const M={"1-1":"1-4","1-2":"1-1","1-3":"1-2","1-4":"1-3"},f=k=>M[k]||k;
 const d=JSON.parse(LS.getItem("mer-done")||"null");if(Array.isArray(d))LS.setItem("mer-done",JSON.stringify(d.map(f)));
 const u=JSON.parse(LS.getItem("gl-ui")||"null");
 if(u&&typeof u==="object"){for(const n of["notes","cek"])if(u[n]&&typeof u[n]==="object"){const o={};for(const k in u[n])o[f(k)]=u[n][k];u[n]=o}LS.setItem("gl-ui",JSON.stringify(u))}
 LS.setItem("gl-ord","2")}catch(e){}})();
