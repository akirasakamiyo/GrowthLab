(()=>{const row=document.querySelector('.hero .row');if(!row)return;const[go,see]=row.querySelectorAll('a.btn');
go.addEventListener('click',e=>{e.preventDefault();if(done.size>=total){location.hash='#/latihan';return}const[i,j]=nextUp();location.hash='#/lesson/'+i+'-'+j});
const lab=()=>{go.firstChild.textContent=done.size>=total?'Ke Latihan ':done.size?'Lanjut belajar ':'Mulai belajar '};lab();setTimeout(lab,1500);addEventListener('hashchange',()=>setTimeout(lab,900))})();
