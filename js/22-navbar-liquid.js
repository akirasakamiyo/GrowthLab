/* ===== Navbar "liquid glass" =====
   Manik (.lq-bead) mengikuti menu aktif (.cur yang dipasang navOn di 09-app.js).
   Saat pindah, manik melar menutupi jarak tempuh dulu, lalu menyusut ke menu tujuan.
   Panah kiri/kanan berpindah menu saat fokus ada di navbar. */
(()=>{const g=document.getElementById("lq");if(!g)return;
 const bead=g.querySelector(".lq-bead"),A=[...g.querySelectorAll("a")];
 const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
 let last=null;
 const box=a=>({l:a.offsetLeft,w:a.offsetWidth});
 function place(anim){const a=g.querySelector("a.cur");g.classList.toggle("on",!!a);if(!a){last=null;return}
  const t=box(a);bead.getAnimations().forEach(x=>x.cancel());
  if(anim&&last&&!RM&&(last.l!==t.l||last.w!==t.w)){const l=Math.min(last.l,t.l),r=Math.max(last.l+last.w,t.l+t.w);
   bead.animate([{left:last.l+"px",width:last.w+"px"},{left:l+"px",width:(r-l)+"px",offset:.45},{left:t.l+"px",width:t.w+"px"}],{duration:520,easing:"cubic-bezier(.45,0,.2,1)"})}
  bead.style.left=t.l+"px";bead.style.width=t.w+"px";last=t}
 new MutationObserver(()=>place(true)).observe(g,{subtree:true,attributes:true,attributeFilter:["class"]});
 addEventListener("resize",()=>place(false));document.fonts&&document.fonts.ready.then(()=>place(false));
 /* langsung geser saat diklik, tidak menunggu transisi halaman selesai */
 const pick=n=>A.forEach(a=>a.classList.toggle("cur",a===n));
 g.addEventListener("click",e=>{const a=e.target.closest("a");if(a&&A.includes(a))pick(a)});
 g.addEventListener("keydown",e=>{if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;const i=A.indexOf(document.activeElement);if(i<0)return;
  e.preventDefault();const n=A[(i+(e.key==="ArrowRight"?1:-1)+A.length)%A.length];n.focus();pick(n);location.hash=n.getAttribute("href")});
 place(false)})();
