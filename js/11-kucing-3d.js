(()=>{
const sec=document.getElementById("done"),box=document.getElementById("cat3d");
if(!sec||!box||typeof THREE==="undefined")return;
const cv=box.querySelector("canvas");let R;
try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:"high-performance"})}catch(e){return}
sec.classList.add("has3d");
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
R.setPixelRatio(Math.min(devicePixelRatio||1,2));
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(28,1.45,.1,50);
const C=h=>new THREE.Color(h).convertSRGBToLinear();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* Studio environment: softbox putih + semburat ungu/pink/biru untuk pantulan glossy */
(()=>{const c=document.createElement("canvas");c.width=1024;c.height=512;const x=c.getContext("2d");
 const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,"#e4d6ff");g.addColorStop(.5,"#7a55e0");g.addColorStop(1,"#1a0f3d");x.fillStyle=g;x.fillRect(0,0,1024,512);
 const blob=(px,py,r,col,a)=>{const rg=x.createRadialGradient(px,py,0,px,py,r);rg.addColorStop(0,col);rg.addColorStop(1,col+"00");x.globalAlpha=a;x.fillStyle=rg;x.fillRect(px-r,py-r,r*2,r*2);x.globalAlpha=1};
 blob(250,130,170,"#ffffff",1);blob(780,160,130,"#ffffff",.85);blob(520,50,100,"#ffe3f3",.9);blob(90,320,140,"#ff7ad9",.85);blob(920,340,150,"#5aa8ff",.95);blob(520,330,120,"#9a7bff",.7);
 x.globalAlpha=.85;x.fillStyle="#fff";x.fillRect(395,170,36,170);x.globalAlpha=1;
 const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.encoding=THREE.sRGBEncoding;
 const pm=new THREE.PMREMGenerator(R);pm.compileEquirectangularShader();S.environment=pm.fromEquirectangular(t).texture;t.dispose();pm.dispose()})();

/* Cahaya */
const key=new THREE.DirectionalLight(0xffffff,1.1);key.position.set(-3,4,5);S.add(key);
const rimV=new THREE.DirectionalLight(0xb78cff,1.8);rimV.position.set(3,3,-3);S.add(rimV);
const rimP=new THREE.DirectionalLight(0xff7ac8,1.5);rimP.position.set(-4,2,-3);S.add(rimP);
const fillB=new THREE.PointLight(0x6f8cff,1.1,30);fillB.position.set(4,-1,5);S.add(fillB);

const phys=(o)=>new THREE.MeshPhysicalMaterial(Object.assign({metalness:0,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.4},o));
function vgrad(geo,fn){const p=geo.attributes.position,col=new Float32Array(p.count*3),t=new THREE.Color();
 for(let i=0;i<p.count;i++){fn(t,p.getX(i),p.getY(i),p.getZ(i));col[i*3]=t.r;col[i*3+1]=t.g;col[i*3+2]=t.b}
 geo.setAttribute("color",new THREE.BufferAttribute(col,3));return geo}
const lerpC=(out,a,b,k)=>out.copy(C(a)).lerp(C(b),clamp(k,0,1));

/* Kepala: elipsoid mochi, bawah lebih datar */
const A=1.2,Bt=1.0,Bb=.8,Zc=.95;
const hg=new THREE.SphereGeometry(1,96,64);
{const p=hg.attributes.position,nr=new Float32Array(p.count*3),v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){const x=p.getX(i)*A,y0=p.getY(i),b=y0>=0?Bt:Bb,y=y0*b,z=p.getZ(i)*Zc;p.setXYZ(i,x,y,z);
  v.set(x/(A*A),y/(b*b),z/(Zc*Zc)).normalize();nr[i*3]=v.x;nr[i*3+1]=v.y;nr[i*3+2]=v.z}
 hg.setAttribute("normal",new THREE.BufferAttribute(nr,3))}
vgrad(hg,(t,x,y)=>lerpC(t,0x07040f,0x1f1542,(y+.8)/1.8));
const headMat=phys({vertexColors:true,color:0xffffff,roughness:.22,clearcoatRoughness:.08,envMapIntensity:1.6});

const root=new THREE.Group(),head=new THREE.Group();root.add(head);S.add(root);
head.add(new THREE.Mesh(hg,headMat));
const Z=new THREE.Vector3(0,0,1);
function surf(x,y,off){const b=y>=0?Bt:Bb,z=Zc*Math.sqrt(Math.max(1-(x/A)**2-(y/b)**2,0));
 const n=new THREE.Vector3(x/(A*A),y/(b*b),z/(Zc*Zc)).normalize();return{p:new THREE.Vector3(x,y,z).addScaledVector(n,off||0),n}}
function put(o,x,y,off,roll){const s=surf(x,y,off);o.position.copy(s.p);o.quaternion.setFromUnitVectors(Z,s.n);
 if(roll)o.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Z,roll));head.add(o);return o}

/* Telinga runcing + bagian dalam */
const prof=(pts,sr,sh)=>pts.map(p=>new THREE.Vector2(p[0]*sr,p[1]*sh));
const eP=[[.46,-.25],[.45,-.1],[.4,.2],[.3,.6],[.18,1],[.08,1.26],[.03,1.36],[0,1.38]];
const earMat=phys({color:C(0x1b1235),roughness:.24,envMapIntensity:1.7});
const inMat=phys({color:C(0x3a2c7a),roughness:.3,emissive:C(0x20154f),emissiveIntensity:.25,envMapIntensity:1.2});
const ears=[];
[-1,1].forEach(sd=>{const g=new THREE.Group();g.position.set(sd*.78,.45,-.1);head.add(g);
 const e=new THREE.Mesh(new THREE.LatheGeometry(prof(eP,1,1),56),earMat);e.scale.z=.55;g.add(e);
 const ie=new THREE.Mesh(new THREE.LatheGeometry(prof(eP,.6,.82),48),inMat);ie.scale.z=.3;ie.position.set(-sd*.03,.08,.14);g.add(ie);
 g.userData.lean=sd*-.14;g.rotation.z=g.userData.lean;ears.push(g)});
/* anting oranye di telinga kanan */
const goldM=phys({color:C(0xff9a2e),roughness:.25,emissive:C(0x7a3000),emissiveIntensity:.25});
[[.33,.55,.0,.3,1.25,.5],[.3,.34,.0,.5,1.1,-.35]].forEach(a=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.13,.026,12,40),goldM);r.position.set(a[0],a[1],a[2]);r.rotation.set(a[3],a[4],a[5]);ears[1].add(r)});

/* Mata besar: cincin putih + isi biru-hitam glossy */
const whiteM=phys({color:0xffffff,roughness:.18,envMapIntensity:1.2});
const irisG=vgrad(new THREE.SphereGeometry(1,48,32),(t,x,y)=>lerpC(t,0x050420,0x2323a8,(x-y)*.5*1.15+.35));
const irisM=phys({vertexColors:true,color:0xffffff,roughness:.06,clearcoatRoughness:.02,envMapIntensity:2,emissive:C(0x0a0a50),emissiveIntensity:.35});
const hlM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92});
const hlB=new THREE.MeshBasicMaterial({color:0x8f9cff,transparent:true,opacity:.75});
const eyes=[],sph=new THREE.SphereGeometry(1,24,16);
[-1,1].forEach(sd=>{const e=new THREE.Group(),pu=new THREE.Group();
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.3,.055,32,96),whiteM);ring.scale.set(1,1.5,1);e.add(ring);
 const iris=new THREE.Mesh(irisG,irisM);iris.scale.set(.3,.46,.09);iris.position.z=-.01;pu.add(iris);
 const h1=new THREE.Mesh(sph,hlM);h1.scale.set(.032,.16,.014);h1.position.set(-.12,.16,.074);h1.rotation.z=.4;pu.add(h1);
 const h2=new THREE.Mesh(sph,hlM);h2.scale.set(.03,.03,.012);h2.position.set(-.06,.31,.06);pu.add(h2);
 const h3=new THREE.Mesh(sph,hlB);h3.scale.set(.05,.11,.012);h3.position.set(.12,-.2,.07);h3.rotation.z=.35;pu.add(h3);
 e.add(pu);put(e,sd*.62,-.1,.015,sd*-.08);eyes.push({e,pu})});

/* Alis (dua titik ungu), hidung pink, mulut "w" */
const browM=phys({color:C(0x8a76c8),roughness:.3,emissive:C(0x2a1f55),emissiveIntensity:.5});
[-1,1].forEach(sd=>{const b=new THREE.Mesh(sph,browM);b.scale.set(.13,.07,.04);put(b,sd*.5,.68,0,sd*-.12)});
const nose=new THREE.Mesh(sph,phys({color:C(0xff4d94),roughness:.22,emissive:C(0x7a0a38),emissiveIntensity:.4,envMapIntensity:1.2}));nose.scale.set(.14,.1,.085);put(nose,0,-.38,.012);
{const s=new THREE.Mesh(sph,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}));s.scale.set(.03,.016,.01);s.position.set(-.04,.04,.07);nose.add(s)}
const mouthM=phys({color:C(0xcdbdf7),roughness:.4,emissive:C(0x5a48a0),emissiveIntensity:.4,clearcoat:.3});
const mouth=new THREE.Group();
mouth.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-.16,.03,0],[-.08,-.035,0],[0,.015,0],[.08,-.035,0],[.16,.03,0]].map(a=>new THREE.Vector3(...a))),48,.011,8),mouthM));
const mv=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,.1,8),mouthM);mv.position.y=.07;mouth.add(mv);
put(mouth,0,-.56,.012);

/* Interaksi */
const sp=()=>({x:0,v:0});
const yaw=sp(),pit=sp(),rol=sp(),pop=sp(),px=sp(),py=sp(),eL=sp(),eR=sp();
const step=(s,t,k,d,dt)=>{s.v+=(k*(t-s.x)-d*s.v)*dt;s.x+=s.v*dt};
const pt={x:0,y:0,t:-1e5};let hover=false;
addEventListener("pointermove",e=>{pt.x=e.clientX;pt.y=e.clientY;pt.t=performance.now();kick()},{passive:true});
function center(){const r=box.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height*.52,r:r.height*.4,vis:r.bottom>0&&r.top<innerHeight}}
addEventListener("pointerdown",e=>{pt.x=e.clientX;pt.y=e.clientY;pt.t=performance.now();const c=center();
 if(Math.hypot(e.clientX-c.x,e.clientY-c.y)<c.r){pop.v+=4;eL.v+=9;eR.v-=9;blinkAt=performance.now()/1000}kick()},{passive:true});
let blinkAt=-9,nextBlink=2.5,nextTw=4;
function size(){const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;
 const z=Math.max(7.4,5.4/(.4986*cam.aspect));cam.position.set(0,.55,z);cam.lookAt(0,.55,0);cam.updateProjectionMatrix();kick()}
new ResizeObserver(size).observe(box);
let vis=false,raf=0,last=performance.now();
new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis){last=performance.now();kick()}}).observe(box);
function tick(now){raf=0;const t=now/1000,dt=Math.min((now-last)/1000,.033);last=now;if(dt<=0){kick();return}
 const c=center(),live=now-pt.t<3000;let dx,dy;
 if(live){dx=(pt.x-c.x)/(innerWidth*.5);dy=(c.y-pt.y)/(innerHeight*.5)}else{dx=Math.sin(t*.6)*.55;dy=Math.sin(t*.45+1)*.3}
 dx=clamp(dx,-1.2,1.2);dy=clamp(dy,-1.2,1.2);
 hover=live&&Math.hypot(pt.x-c.x,pt.y-c.y)<c.r;
 const k=rm?400:70,d=rm?40:10;
 step(yaw,clamp(dx,-1,1)*.7,k,d,dt);step(pit,-clamp(dy,-1,1)*.42,k,d,dt);step(rol,-dx*.09,50,8,dt);
 step(px,dx*.32,40,9,dt);step(py,dy*.14,40,9,dt);step(pop,hover?.07:0,130,9,dt);
 /* telinga mengikuti gerakan kepala (follow-through) + kedutan acak */
 if(!rm&&t>nextTw){(Math.random()<.5?eL:eR).v+=(Math.random()<.5?-1:1)*8;nextTw=t+3+Math.random()*5}
 step(eL,clamp(-yaw.v*.05,-.4,.4),170,9,dt);step(eR,clamp(-yaw.v*.05,-.4,.4),170,9,dt);
 head.rotation.set(pit.x,yaw.x,rol.x);
 const s=1+pop.x,bob=rm?0:Math.sin(t*1.5)*.05;
 head.scale.set(s/Math.sqrt(1+pop.x*.6),s*(1+pop.x*.3)/1,s);
 root.position.set(px.x,py.x+bob,0);
 ears[0].rotation.z=ears[0].userData.lean+eL.x;ears[1].rotation.z=ears[1].userData.lean+eR.x;
 /* mata: kilau diam, isi bergeser mengikuti arah lihat; kedip */
 if(t>nextBlink){blinkAt=t;nextBlink=t+2.5+Math.random()*3.5}
 const bu=(t-blinkAt)/.16,bl=bu>=0&&bu<1?1-.92*Math.sin(bu*Math.PI):1;
 eyes.forEach(o=>{o.e.scale.y=bl;o.pu.position.set(clamp(yaw.x,-.7,.7)*.05,clamp(-pit.x,-.45,.45)*.08,0)});
 R.render(S,cam);
 if(vis&&!document.hidden&&!rm)kick()}
function kick(){if(!raf&&vis)raf=requestAnimationFrame(t=>{last=t-16;tick(t)})}
document.addEventListener("visibilitychange",kick);size();
})();
