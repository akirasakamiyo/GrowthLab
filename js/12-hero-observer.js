(()=>{const h=document.querySelector('.hero');if(!h)return;new IntersectionObserver(e=>document.body.classList.toggle('inhero',e[0].isIntersecting),{threshold:.4}).observe(h)})();
