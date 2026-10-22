/* ---------- v6: elemen dekoratif yang kini bisa diklik ---------- */
(()=>{
/* host Netlify menampilkan badge di kanan bawah: geser tombol chat & penghitung agar tidak tertutup */
if(/\.netlify\.app$/.test(location.hostname))document.body.classList.add("nfhost");
/* Safari memulihkan halaman dari cache Back/Forward: render ulang kanvas 3D agar tidak kosong */
addEventListener("pageshow",e=>{if(e.persisted){dispatchEvent(new Event("resize"));setTimeout(()=>dispatchEvent(new Event("resize")),400)}});
const MAP={"Belajar":"#/course","Tumbuh":"#/lesson/0-2","Refleksi":"#/lesson/2-3","Empati":"#/lesson/1-4","Resiliensi":"#/lesson/1-2","Mandiri":"#/petunjuk","Siap kerja":"#/latihan","Berpikir kritis":"#/lesson/2-1","Kreatif":"#/lesson/2-4","Strategis":"#/lesson/2-2","Fokus":"#/lesson/0-4","Naik level":"#/latihan/sim"};
let pd=null;
addEventListener("pointerdown",e=>{if(e.target.closest&&e.target.closest(".zphys"))pd={x:e.clientX,y:e.clientY,t:performance.now()}},true);
addEventListener("pointerup",e=>{const s=pd;pd=null;if(!s||Math.hypot(e.clientX-s.x,e.clientY-s.y)>6||performance.now()-s.t>450)return;
 const hit=[...document.querySelectorAll(".zphys .zb")].find(b=>{const r=b.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom});
 if(hit&&MAP[hit.textContent.trim()])location.hash=MAP[hit.textContent.trim()]},true);
const tip=()=>document.querySelectorAll(".zphys .zb").forEach(b=>{const k=MAP[b.textContent.trim()];if(k)b.title="Klik: buka "+(k.startsWith("#/lesson")?"pelajaran terkait":k.replace("#/",""))});
setTimeout(tip,1500);setTimeout(tip,4000);
document.addEventListener("click",e=>{const c=e.target.closest&&e.target.closest(".zcue .zrg");if(c){const t=document.getElementById("stats");t&&t.scrollIntoView({behavior:"smooth"})}});
const zr=document.querySelector(".zcue .zrg");if(zr)zr.title="Gulir ke isi";
document.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;const g=e.target.closest&&e.target.closest("[data-go][role=link]");if(g){e.preventDefault();g.click()}});
})();
