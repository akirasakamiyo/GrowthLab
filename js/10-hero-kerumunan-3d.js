(()=>{
const cv=document.getElementById("crowd");if(!cv)return;const hero=cv.parentElement;let R;
try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:"high-performance"})}catch(e){cv.remove();return}
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
R.outputEncoding=THREE.sRGBEncoding;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(36,1,.1,80);
const camBase=new THREE.Vector3(0,1.2,14);cam.position.copy(camBase);cam.lookAt(0,.6,0);
const C=h=>new THREE.Color(h).convertSRGBToLinear();

/* Environment studio (pantulan lembut ala Spline) */
(()=>{const c=document.createElement("canvas");c.width=512;c.height=256;const x=c.getContext("2d");
 const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,"#7a52d8");g.addColorStop(.45,"#3a1f90");g.addColorStop(1,"#150a3a");x.fillStyle=g;x.fillRect(0,0,512,256);
 const blob=(px,py,r,col,a)=>{const rg=x.createRadialGradient(px,py,0,px,py,r);rg.addColorStop(0,col);rg.addColorStop(1,col+"00");x.globalAlpha=a;x.fillStyle=rg;x.fillRect(px-r,py-r,r*2,r*2);x.globalAlpha=1};
 blob(130,70,60,"#ffffff",.75);blob(60,120,90,"#ff6fd8",.9);blob(380,110,90,"#4ad8ff",.8);blob(256,40,60,"#ffd9a8",.7);blob(450,70,60,"#ff7ad9",.6);
 const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.encoding=THREE.sRGBEncoding;
 const pm=new THREE.PMREMGenerator(R);pm.compileEquirectangularShader();S.environment=pm.fromEquirectangular(t).texture;t.dispose();pm.dispose()})();

/* Cahaya: key (bayangan lembut), rim biru, fill pink */
S.add(new THREE.HemisphereLight(0xb89cff,0x1a0b45,.4));
const key=new THREE.DirectionalLight(0xfff0f8,1.3);key.position.set(-6,9,10);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);{const s=key.shadow.camera;s.left=-11;s.right=11;s.top=11;s.bottom=-11;s.near=1;s.far=40}
key.shadow.radius=6;key.shadow.bias=-.0004;key.shadow.normalBias=.03;S.add(key);
const rim=new THREE.DirectionalLight(0x6fa8ff,1.6);rim.position.set(8,4,-6);S.add(rim);
const fill=new THREE.PointLight(0xff5fd0,.8,40);fill.position.set(6,-1,9);S.add(fill);

/* Material "clay" glossy */
const clay=(o={})=>new THREE.MeshPhysicalMaterial(Object.assign({roughness:.38,metalness:0,clearcoat:.4,clearcoatRoughness:.35,envMapIntensity:.5},o));
function grad(geo,top,bot){const p=geo.attributes.position,col=new Float32Array(p.count*3),a=top.clone().convertSRGBToLinear(),b=bot.clone().convertSRGBToLinear(),t=new THREE.Color();
 geo.computeBoundingBox();const y0=geo.boundingBox.min.y,y1=geo.boundingBox.max.y;
 for(let i=0;i<p.count;i++){t.copy(b).lerp(a,(p.getY(i)-y0)/(y1-y0));col[i*3]=t.r;col[i*3+1]=t.g;col[i*3+2]=t.b}
 geo.setAttribute("color",new THREE.BufferAttribute(col,3));return geo}

const headMat=clay({vertexColors:true,color:0xffffff,roughness:.34,clearcoat:.5,clearcoatRoughness:.25});
const hl=new THREE.MeshBasicMaterial({color:0xffffff});
const sph=new THREE.SphereGeometry(1,28,20),TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const M=(hex,o)=>clay(Object.assign({color:C(hex),roughness:.45},o||{}));
const white=M(0xffffff,{roughness:.2,clearcoat:.8});
function ell(par,mat,s,p,r){const m=new THREE.Mesh(sph,mat);m.scale.set(s[0],s[1],s[2]);if(p)m.position.set(p[0],p[1],p[2]);if(r)m.rotation.set(r[0]||0,r[1]||0,r[2]||0);par.add(m);return m}
function mesh(par,geo,mat,p,r,s){const m=new THREE.Mesh(geo,mat);if(p)m.position.set(p[0],p[1],p[2]);if(r)m.rotation.set(r[0]||0,r[1]||0,r[2]||0);if(s)m.scale.set(s[0],s[1],s[2]);par.add(m);return m}
function rboxGeo(w,h,d,r){const g=new THREE.BoxGeometry(w,h,d,8,8,8),p=g.attributes.position,nr=new Float32Array(p.count*3),v=new THREE.Vector3(),c=new THREE.Vector3(),hx=w/2-r,hy=h/2-r,hz=d/2-r;
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);c.set(clamp(v.x,-hx,hx),clamp(v.y,-hy,hy),clamp(v.z,-hz,hz));v.sub(c).normalize();nr[i*3]=v.x;nr[i*3+1]=v.y;nr[i*3+2]=v.z;v.multiplyScalar(r).add(c);p.setXYZ(i,v.x,v.y,v.z)}
 g.setAttribute("normal",new THREE.BufferAttribute(nr,3));return g}
const hx=c=>"#"+new THREE.Color(c).getHexString();
/* Pola baju: kanvas kecil -> tekstur */
function pattern(type,c1,c2){const cv=document.createElement("canvas");cv.width=128;cv.height=256;const x=cv.getContext("2d");x.fillStyle=hx(c1);x.fillRect(0,0,128,256);x.fillStyle=hx(c2);x.strokeStyle=hx(c2);
 if(type==="stripes")for(let y=0;y<256;y+=24)x.fillRect(0,y,128,11);
 else if(type==="vstripes")for(let i=0;i<128;i+=16)x.fillRect(i,0,8,256);
 else if(type==="dots")for(let r=0;r<10;r++)for(let c=0;c<5;c++){x.beginPath();x.arc(c*32+(r%2)*16,r*28+10,6,0,TAU);x.fill()}
 else if(type==="plaid"){x.globalAlpha=.55;for(let i=0;i<256;i+=32)x.fillRect(0,i,128,11);for(let i=0;i<128;i+=32)x.fillRect(i,0,11,256);x.globalAlpha=1}
 else if(type==="blocks"){x.fillRect(0,90,128,166)}
 else if(type==="zig"){x.lineWidth=7;for(let y=0;y<256;y+=34){x.beginPath();for(let i=0;i<=8;i++)x[i?"lineTo":"moveTo"](i*16,y+(i%2)*14);x.stroke()}}
 else if(type==="gradient"){const g=x.createLinearGradient(0,0,0,170);g.addColorStop(0,hx(c1));g.addColorStop(1,hx(c2));x.fillStyle=g;x.fillRect(0,0,128,256)}
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t}
const profile=[[.84,-7.8],[.8,-4],[.72,-1.2],[.7,-.6],[.62,-.22],[.46,.0],[.22,.1],[0,.12]].map(p=>new THREE.Vector2(p[0],p[1]));
function bodyG(){const g=new THREE.LatheGeometry(profile,40),p=g.attributes.position,uv=g.attributes.uv,col=new Float32Array(p.count*3),a=C(0xffffff),b=C(0x8a80b8),t=new THREE.Color();
 for(let i=0;i<p.count;i++){const y=p.getY(i);uv.setY(i,clamp((y+4)/4.12,0,1));t.copy(b).lerp(a,clamp((y+3)/3.1,0,1));col[i*3]=t.r;col[i*3+1]=t.g;col[i*3+2]=t.b}
 g.setAttribute("color",new THREE.BufferAttribute(col,3));return g}

const DK=0x241a5c;
/* 19 karakter: tiap orang beda kulit, bentuk, wajah, rambut/topi, dan baju */
const SPECS=[
 {skin:0xfbd0aa,eyes:"round",brow:"angry",nose:"round",hair:["spikes",0x1b1428],cl:{p:"stripes",a:0xff6b4a,b:0xf4f1ff}},
 {skin:0x6b4226,eyes:"happy",brow:"none",nose:"button",mouth:"smile",blush:1,hat:["beanie",0xffc83d,0xff6b4a],cl:{p:"solid",a:0x14b8a6,b:0},acc:["scarf",0xe040a0]},
 {type:"alien",skin:0x8be8c0,shape:[1.0,1.08,1],eyes:"three",brow:"none",nose:"none",mouth:"smile",ear:0,cl:{p:"dots",a:0x1f2a6b,b:0xffc83d}},
 {skin:0xd99a72,eyes:"round",brow:"raised",nose:"big",mouth:"mustache",mc:0x3a2216,hat:["tophat",0x1d1a2b,0xe03a3a],cl:{p:"solid",a:0xf4f1ff,b:0},acc:["tie",0xe03a3a]},
 {skin:0xff8fc0,eyes:"big",brow:"angry",nose:"button",mouth:"open",frk:1,ec:0x3b5bdb,hair:["pigtails",0x3b5bdb],cl:{p:"solid",a:0x8fd64a,b:0},acc:["hood",0xff8a2b]},
 {skin:0xa8704c,eyes:"sleepy",brow:"flat",nose:"round",hat:["cap",0x4aa8ff,0x1f6fd0],cl:{p:"plaid",a:0xe03a3a,b:0x2b2a3a}},
 {type:"robot",skin:0xc8d0e0,eyes:"robot",mouth:"grid",cl:{p:"blocks",a:0x4aa8ff,b:0x1f2a6b},acc:["badge",0xffc83d],bw:1.05},
 {skin:0xf2b48c,eyes:"round",brow:"angry",nose:"point",hat:["party",0xff8a2b,0xffc83d],cl:{p:"vstripes",a:0x1f2a6b,b:0x6fe3b4}},
 {skin:0x2fc4b2,shape:[1.1,.92,1],eyes:"shades",brow:"none",nose:"round",mouth:"smile",hair:["afro",0x8a4fff],cl:{p:"zig",a:0xffc83d,b:0xff6b4a}},
 {skin:0x4a2c1a,eyes:"round",brow:"raised",nose:"button",mouth:"smile",gl:"round",ec:0x3a2216,hat:["beret",0xe03a3a],cl:{p:"solid",a:0xb89cff,b:0},acc:["buttons",0xf4f1ff]},
 {skin:0xfbd0aa,eyes:"happy",brow:"none",nose:"big",mouth:"beard",mc:0xf1eef8,hat:["wizard",0x6d4cff,0xffc83d],cl:{p:"gradient",a:0x1f2a6b,b:0x6d4cff},acc:["bow",0xffc83d]},
 {skin:0x7fb9ff,eyes:"round",brow:"angry",nose:"round",mouth:"tongue",hair:["bun",0xff6fa8],ec:0x1f2a6b,cl:{p:"dots",a:0xff6b4a,b:0xf4f1ff},acc:["bowtie",0xffc83d]},
 {skin:0xff7a6b,eyes:"big",brow:"raised",nose:"round",mouth:"smile",blush:1,hat:["crown",0xffc83d,0xe040a0],ec:0x6d1f3a,cl:{p:"blocks",a:0xe040a0,b:0xf4f1ff},acc:["badge",0x14b8a6]},
 {skin:0xf2b48c,eyes:"round",brow:"flat",nose:"small",mouth:"smile",gl:"round",hat:["grad",0x1d1a2b,0xffc83d],cl:{p:"stripes",a:0x9ad0ff,b:0xf4f1ff},acc:["tie",0x1f2a6b]},
 {skin:0x7ed957,eyes:"happy",brow:"none",nose:"button",mouth:"o",hat:["sprout"],cl:{p:"plaid",a:0x2fa84f,b:0xf4f1ff},acc:["pocket",0xffc83d]},
 {skin:0xa8704c,eyes:"round",brow:"angry",nose:"round",mouth:"grin",hair:["mohawk",0xff4fa0],cl:{p:"solid",a:0x2b2a3a,b:0},acc:["hood",0x14b8a6],ec:0x3a2216},
 {skin:0xffd9d9,eyes:"dot",brow:"none",nose:"button",mouth:"smile",blush:1,hat:["propeller",0xffc83d,0x4aa8ff],cl:{p:"stripes",a:0xffc83d,b:0xf4f1ff}},
 {type:"cyclops",skin:0xff9a5a,eyes:"cyclops",brow:"angry",nose:"none",mouth:"grin",ec:0x1f6a3a,hat:["horns",0xf4f1ff],cl:{p:"plaid",a:0x14b8a6,b:0x1f2a6b}},
 {skin:0xd99a72,shape:[1.0,1.0,1.0],eyes:"round",brow:"raised",nose:"big",mouth:"mustache",mc:0x1b1428,hat:["chef",0xffffff],cl:{p:"solid",a:0xf4f1ff,b:0},acc:["buttons",0x8a80b8]}
];
const crowd=new THREE.Group();S.add(crowd);const heads=[];window.__glCrowd={heads};/* untuk pengujian otomatis */
const rows=[[-2.9,0,2.9],[-4.4,-1.5,1.5,4.4],[-5.8,-2.9,0,2.9,5.8],[-4.4,-1.5,1.5,4.4],[-2.9,0,2.9]];
let n=0;
function build(s){
 const g=new THREE.Group(),h=new THREE.Group(),cg=new THREE.Group(),anims=[],eyes=[];
 const bw=s.bw||1;cg.scale.set(bw,1,bw);g.add(cg);h.position.y=.3;g.add(h);
 const body=new THREE.Mesh(bodyG(),clay({map:pattern(s.cl.p,s.cl.a,s.cl.b),vertexColors:true,color:0xffffff,roughness:.62,clearcoat:.15,clearcoatRoughness:.5}));body.scale.set(bw,1,bw);g.add(body);
 /* kepala */
 const robot=s.type==="robot",sh=s.shape||[1.04,.96,1],base=new THREE.Color(s.skin);
 let A=.6*sh[0],B=.6*sh[1],Cz=.6*sh[2];
 const sk=M(s.skin,{roughness:.42,clearcoat:.4});
 if(robot){A=.56;B=.46;Cz=.48;mesh(h,rboxGeo(1.12,.92,.96,.2),M(s.skin,{roughness:.3,metalness:.55,clearcoat:.5,envMapIntensity:.9}))}
 else{const hg=grad(new THREE.SphereGeometry(.6,48,36),base.clone().offsetHSL(0,.02,.06),base.clone().offsetHSL(.02,0,-.12));mesh(h,hg,headMat,null,null,sh)}
 const Z=new THREE.Vector3(0,0,1);
 function put(o,x,y,off,roll){if(robot){o.position.set(x,y,.485+(off||0));if(roll)o.rotation.z=roll}
  else{const z=Cz*Math.sqrt(Math.max(1-(x/A)**2-(y/B)**2,0)),nn=new THREE.Vector3(x/(A*A),y/(B*B),z/(Cz*Cz)).normalize();o.position.set(x,y,z).addScaledVector(nn,off||0);o.quaternion.setFromUnitVectors(Z,nn);if(roll)o.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Z,roll))}
  h.add(o);return o}
 /* telinga */
 if(s.ear!==0&&!robot)[-1,1].forEach(sd=>{const e=ell(h,sk,[.1,.14,.1],[sd*A*1.0,0,0]);e.scale.multiplyScalar(s.ear||1)});
 if(robot)[-1,1].forEach(sd=>mesh(h,new THREE.CylinderGeometry(.09,.09,.14,16),M(0x8a93a8,{metalness:.6}),[sd*.6,0,0],[0,0,Math.PI/2]));
 /* mata */
 const pm=M(s.ec||DK,{roughness:.25,clearcoat:1,clearcoatRoughness:.1}),dark=M(DK,{roughness:.3,clearcoat:.8});
 function eye(x,y,sc,lid){const w=new THREE.Group(),e=new THREE.Group();e.scale.setScalar(sc||1);w.add(e);
  ell(e,white,[.17,.18,.1],[0,0,0]);ell(e,pm,[.085,.09,.05],[0,0,.065]);ell(e,hl,[.03,.03,.012],[.03,.035,.105]);ell(e,hl,[.015,.015,.01],[-.025,-.03,.103]);
  if(lid)ell(e,sk,[.19,.1,.13],[0,.095,.03],[0,0,0]);
  put(w,x,y,-.07);eyes.push(w);return w}
 const et=s.eyes;let eyeY=.08,browY=.34;
 if(et==="round"||et==="sleepy"){[-1,1].forEach(sd=>eye(sd*.22,eyeY,1,et==="sleepy"))}
 else if(et==="big"){eyeY=.06;browY=.4;[-1,1].forEach(sd=>eye(sd*.24,eyeY,1.35))}
 else if(et==="happy"){[-1,1].forEach(sd=>{const w=new THREE.Group();mesh(w,new THREE.TorusGeometry(.085,.03,12,24,Math.PI),dark);put(w,sd*.22,.05,.0);eyes.push(w)})}
 else if(et==="dot"){[-1,1].forEach(sd=>{const w=new THREE.Group();ell(w,pm,[.075,.09,.05]);ell(w,hl,[.025,.025,.012],[.025,.035,.045]);put(w,sd*.22,.07,.0);eyes.push(w)})}
 else if(et==="robot"){[-1,1].forEach(sd=>{const w=new THREE.Group();mesh(w,new THREE.BoxGeometry(.2,.13,.05),M(0x5ef2ff,{emissive:C(0x2adfff),emissiveIntensity:.9,roughness:.3}));put(w,sd*.24,.08,.0);eyes.push(w)})}
 else if(et==="cyclops"){eyeY=.04;browY=.4;eye(0,eyeY,1.75)}
 else if(et==="three"){eye(-.26,.0,.8);eye(.26,.0,.8);eye(0,.3,.62);browY=.45}
 else if(et==="shades"){const lm=M(0x14102a,{roughness:.1,clearcoat:1,envMapIntensity:1.3});[-1,1].forEach(sd=>{const l=ell(new THREE.Group(),lm,[.2,.15,.05]);const w=l.parent;w.add(l);put(w,sd*.23,.07,.0);ell(w,hl,[.04,.02,.01],[-.06,.07,.05],[0,0,.4])});const br=new THREE.Group();mesh(br,new THREE.BoxGeometry(.12,.03,.03),lm);put(br,0,.1,.0)}
 if(s.gl==="round"){const gm=M(0x2b2a3a,{roughness:.3});[-1,1].forEach(sd=>{const w=new THREE.Group();mesh(w,new THREE.TorusGeometry(.2,.03,12,36),gm);put(w,sd*.22,.08,.07)});const br=new THREE.Group();mesh(br,new THREE.BoxGeometry(.1,.025,.025),gm);put(br,0,.1,.08)}
 /* alis */
 if(s.brow&&s.brow!=="none"){const bm=M(s.bc||DK,{roughness:.3,clearcoat:.8});[-1,1].forEach(sd=>{const tilt=s.brow==="angry"?.15+.2:s.brow==="raised"?-.18:0;const b=ell(new THREE.Group(),bm,[.17,.045,.05]);const w=b.parent;w.add(b);put(w,sd*(et==="cyclops"?.2:.22),browY,.0,(sd<0?-1:1)*tilt)})}
 /* hidung */
 if(s.nose!=="none"&&!robot){const nm=sk;let nd=s.nose;
  if(nd==="point"){const c=new THREE.Mesh(new THREE.ConeGeometry(.07,.22,20),nm);c.rotation.x=Math.PI/2;const w=new THREE.Group();w.add(c);put(w,0,-.07,.07)}
  else{const sz={round:.09,button:.065,big:.13,small:.055}[nd]||.09;put(ell(new THREE.Group(),nm,[sz,sz,sz]).parent||new THREE.Group(),0,-.07,0)}}
 /* mulut */
 const mm=M(0x3a1a2a,{roughness:.4});
 function arc(w,r,tube,rot,mat){mesh(w,new THREE.TorusGeometry(r,tube,10,28,Math.PI),mat,null,[0,0,rot])}
 const mt=s.mouth;
 if(mt==="smile"){const w=new THREE.Group();arc(w,.11,.02,Math.PI,mm);put(w,0,-.19,.0)}
 else if(mt==="grin"){const w=new THREE.Group();arc(w,.16,.025,Math.PI,mm);ell(w,white,[.13,.04,.02],[0,-.09,.0]);put(w,0,-.18,.0)}
 else if(mt==="open"||mt==="o"){const w=new THREE.Group();ell(w,mm,[mt==="o"?.07:.1,mt==="o"?.09:.08,.03]);ell(w,M(0xff6f8f),[.06,.035,.02],[0,-.03,.012]);put(w,0,-.2,.0)}
 else if(mt==="tongue"){const w=new THREE.Group();arc(w,.11,.02,Math.PI,mm);ell(w,M(0xff6f8f),[.05,.07,.02],[.03,-.13,.0]);put(w,0,-.18,.0)}
 else if(mt==="mustache"){const mc=M(s.mc||0x3a2216,{roughness:.6});[-1,1].forEach(sd=>{const w=new THREE.Group();ell(w,mc,[.13,.05,.06],[0,0,0],[0,0,sd*.3]);put(w,sd*.1,-.17,.02)})}
 else if(mt==="beard"){const bm=M(s.mc||0xf1eef8,{roughness:.7,clearcoat:0});const w=new THREE.Group();ell(w,bm,[.46,.34,.3],[0,-.18,.04]);put(w,0,-.36,.1);[-1,1].forEach(sd=>{const m2=new THREE.Group();ell(m2,bm,[.13,.05,.06],[0,0,0],[0,0,sd*.3]);put(m2,sd*.1,-.14,.04)})}
 else if(mt==="grid"){const gm=M(0x39425a,{roughness:.4});for(let i=-2;i<=2;i++){const w=new THREE.Group();mesh(w,new THREE.BoxGeometry(.03,.1,.03),gm);put(w,i*.07,-.22,.0)}}
 /* blush & bintik */
 if(s.blush){const bm=new THREE.MeshBasicMaterial({color:0xff6f9a,transparent:true,opacity:.45,depthWrite:false});[-1,1].forEach(sd=>{const w=new THREE.Group();ell(w,bm,[.1,.065,.02]);put(w,sd*.36,-.07,.0)})}
 if(s.frk){const fm=M(0x8a4a2a,{roughness:.6});[[-.3,-.04],[-.38,-.08],[-.3,-.11],[.3,-.04],[.38,-.08],[.3,-.11]].forEach(p=>{const w=new THREE.Group();ell(w,fm,[.018,.018,.01]);put(w,p[0],p[1],.0)})}
 if(s.type==="alien"){[-1,1].forEach(sd=>{const st=mesh(h,new THREE.CylinderGeometry(.015,.015,.4,8),M(0x2b2a3a),[sd*.22,.72,0],[0,0,-sd*.25]);ell(h,M(0xff4fa0,{emissive:C(0xff4fa0),emissiveIntensity:.5}),[.07,.07,.07],[sd*.28,.93,0])})}
 if(s.type==="robot"){mesh(h,new THREE.CylinderGeometry(.015,.015,.3,8),M(0x39425a),[0,.6,0]);const ball=ell(h,M(0xff4f6a,{emissive:C(0xff2a4a),emissiveIntensity:.8}),[.07,.07,.07],[0,.78,0]);anims.push(t=>{ball.scale.setScalar(.07*(1+Math.sin(t*2)*.12))})}
 /* rambut */
 const hairCap=(R,yb,col,rx)=>{const th=Math.acos(clamp(yb/R,-1,1)),m=new THREE.Mesh(new THREE.SphereGeometry(R,40,24,0,TAU,0,th),M(col,{roughness:.55,clearcoat:.3}));m.scale.set(sh[0],sh[1],sh[2]);if(rx)m.rotation.x=rx;h.add(m);return m};
 if(s.hair){const t=s.hair[0],c=s.hair[1],hm=M(c,{roughness:.55,clearcoat:.3});
  if(t==="spikes"){hairCap(.64,.34,c);for(let i=0;i<8;i++){const a=i/8*TAU,cn=mesh(h,new THREE.ConeGeometry(.12,.42,16),hm,[Math.cos(a)*.3,.58,Math.sin(a)*.28-.02],[Math.sin(a)*.55,0,-Math.cos(a)*.55])}mesh(h,new THREE.ConeGeometry(.13,.5,16),hm,[0,.7,0])}
  else if(t==="afro"){ell(h,hm,[.8,.68,.72],[0,.42,-.22])}
  else if(t==="pigtails"){hairCap(.64,.36,c);[-1,1].forEach(sd=>{ell(h,hm,[.17,.17,.17],[sd*.7,.22,-.08]);mesh(h,new THREE.ConeGeometry(.14,.5,16),hm,[sd*.74,-.08,-.08],[Math.PI,0,sd*.12])})}
  else if(t==="bun"){hairCap(.64,.36,c);ell(h,hm,[.22,.22,.22],[0,.7,-.05])}
  else if(t==="mohawk"){for(let k=0;k<7;k++){const al=-1.1+k*.37;mesh(h,new THREE.ConeGeometry(.1,.4+.12*Math.cos(al*1.2),14),hm,[0,Math.cos(al)*.6+.12,Math.sin(al)*.6],[al,0,0])}}}
 /* topi */
 if(s.hat){const t=s.hat[0],c1=s.hat[1],c2=s.hat[2]||c1,m1=M(c1,{roughness:.55,clearcoat:.3}),m2=M(c2,{roughness:.5,clearcoat:.3});
  const cap=(R,yb,m)=>{const th=Math.acos(clamp(yb/R,-1,1)),x=new THREE.Mesh(new THREE.SphereGeometry(R,40,24,0,TAU,0,th),m);x.scale.set(sh[0],sh[1],sh[2]);h.add(x);return x};
  if(t==="beanie"){cap(.68,.34,m1);mesh(h,new THREE.TorusGeometry(.56,.08,14,40),m2,[0,.36,0],[Math.PI/2,0,0],[sh[0],sh[2],1]);ell(h,m2,[.15,.15,.15],[0,.72,0])}
  else if(t==="party"){mesh(h,new THREE.ConeGeometry(.3,.65,32),m1,[0,.86,0]);ell(h,m2,[.07,.07,.07],[0,1.2,0]);mesh(h,new THREE.TorusGeometry(.2,.025,8,24),m2,[0,.72,0],[Math.PI/2,0,0])}
  else if(t==="cap"){cap(.66,.36,m1);ell(h,m2,[.5,.035,.4],[0,.4,.55],[.14,0,0]);ell(h,m2,[.05,.05,.05],[0,.68,0])}
  else if(t==="tophat"){mesh(h,new THREE.CylinderGeometry(.58,.58,.05,40),m1,[0,.5,0]);mesh(h,new THREE.CylinderGeometry(.36,.36,.55,36),m1,[0,.78,0]);mesh(h,new THREE.CylinderGeometry(.37,.37,.1,36),m2,[0,.58,0])}
  else if(t==="beret"){ell(h,m1,[.66,.24,.66],[.04,.56,0],[0,0,.15]);mesh(h,new THREE.CylinderGeometry(.035,.04,.1,10),m1,[.04,.8,0])}
  else if(t==="wizard"){mesh(h,new THREE.LatheGeometry([[.5,.0],[.9,-.08],[.92,-.03],[.55,.1],[.0,.1]].map(p=>new THREE.Vector2(p[0],p[1])),40),m1,[0,.45,0]);mesh(h,new THREE.ConeGeometry(.42,1.0,32),m1,[0,1.0,0],[0,0,.1]);mesh(h,new THREE.CylinderGeometry(.46,.5,.1,32),m2,[0,.6,0]);[[.2,.95,.36],[-.15,1.25,.28],[.1,1.4,.2]].forEach(p=>ell(h,m2,[.05,.05,.03],p))}
  else if(t==="crown"){mesh(h,new THREE.CylinderGeometry(.4,.4,.22,32,1,true),M(c1,{metalness:.5,roughness:.3,side:THREE.DoubleSide}),[0,.55,0]);for(let i=0;i<6;i++){const a=i/6*TAU;mesh(h,new THREE.ConeGeometry(.09,.26,12),M(c1,{metalness:.5,roughness:.3}),[Math.cos(a)*.4,.78,Math.sin(a)*.4]);ell(h,m2,[.045,.045,.045],[Math.cos(a)*.4,.93,Math.sin(a)*.4])}}
  else if(t==="grad"){mesh(h,new THREE.CylinderGeometry(.4,.42,.2,32),m1,[0,.6,0]);mesh(h,new THREE.BoxGeometry(1.1,.06,1.1),m1,[0,.74,0],[0,Math.PI/4,0]);mesh(h,new THREE.CylinderGeometry(.012,.012,.5,6),m2,[.38,.64,.38],[0,0,.0]);ell(h,m2,[.05,.1,.05],[.38,.36,.38])}
  else if(t==="sprout"){mesh(h,new THREE.CylinderGeometry(.025,.035,.35,10),M(0x2fa84f),[0,.74,0]);const lf=new THREE.Group();lf.position.set(0,.9,0);h.add(lf);[-1,1].forEach(sd=>ell(lf,M(sd<0?0x6fd96a:0x2fc46a,{roughness:.4}),[.24,.07,.12],[sd*.22,.04,0],[0,0,sd*.45]));anims.push(t=>{lf.rotation.z=Math.sin(t*1.2)*.12;lf.rotation.y=Math.sin(t*.8)*.3})}
  else if(t==="propeller"){cap(.66,.36,m1);ell(h,m2,[.5,.035,.4],[0,.4,.55],[.14,0,0]);mesh(h,new THREE.CylinderGeometry(.02,.02,.2,8),M(0x39425a),[0,.74,0]);const pr=new THREE.Group();pr.position.set(0,.86,0);h.add(pr);[0,Math.PI].forEach(r=>ell(pr,r?M(0xe03a3a):M(0x4aa8ff),[.3,.02,.07],[Math.cos(r)*.28,0,0]));anims.push(t=>{pr.rotation.y=t*2.4})}
  else if(t==="horns"){[-1,1].forEach(sd=>mesh(h,new THREE.ConeGeometry(.1,.4,16),m1,[sd*.3,.66,0],[0,0,-sd*.3]))}
  else if(t==="chef"){mesh(h,new THREE.CylinderGeometry(.4,.36,.3,32),m1,[0,.62,0]);[[0,.95,0,.3],[.25,.88,.1,.24],[-.25,.88,.1,.24],[0,.88,-.25,.24],[.2,.85,-.2,.2]].forEach(p=>ell(h,m1,[p[3],p[3],p[3]],[p[0],p[1],p[2]]))}}
 /* baju: aksesori */
 if(s.acc){const t=s.acc[0],am=M(s.acc[1],{roughness:.5,clearcoat:.3});
  if(t==="scarf"){mesh(cg,new THREE.TorusGeometry(.64,.13,16,40),am,[0,-.36,0],[Math.PI/2,0,0]);mesh(cg,new THREE.BoxGeometry(.22,.6,.07),am,[.28,-.78,.68],[0,0,.08])}
  else if(t==="hood"){mesh(cg,new THREE.TorusGeometry(.64,.16,16,40),am,[0,-.34,-.02],[Math.PI/2,0,0]);[-1,1].forEach(sd=>{mesh(cg,new THREE.CylinderGeometry(.015,.015,.5,6),M(0xf4f1ff),[sd*.12,-.72,.7]);ell(cg,M(0xf4f1ff),[.03,.03,.03],[sd*.12,-.98,.7])})}
  else if(t==="tie"){ell(cg,M(0xf4f1ff),[.2,.08,.06],[-.18,-.3,.65],[0,0,.7]);ell(cg,M(0xf4f1ff),[.2,.08,.06],[.18,-.3,.65],[0,0,-.7]);ell(cg,am,[.1,.09,.06],[0,-.36,.68]);mesh(cg,new THREE.ConeGeometry(.15,.65,4),am,[0,-.78,.7],[Math.PI,Math.PI/4,0],[1,1,.3])}
  else if(t==="bowtie"||t==="bow"){[-1,1].forEach(sd=>mesh(cg,new THREE.ConeGeometry(.12,.24,12),am,[sd*.13,-.36,.67],[0,0,sd*Math.PI/2]));ell(cg,am,[.07,.07,.07],[0,-.36,.7])}
  else if(t==="buttons"){[-.68,-1.05,-1.42].forEach(y=>ell(cg,am,[.06,.06,.04],[0,y,.71]))}
  else if(t==="badge"){mesh(cg,new THREE.CylinderGeometry(.12,.12,.04,24),am,[.3,-.72,.68],[Math.PI/2,0,0]);ell(cg,hl,[.04,.04,.02],[.3,-.72,.71])}
  else if(t==="pocket"){mesh(cg,rboxGeo(.3,.28,.06,.04),am,[.3,-.95,.7])}}
 g.traverse(o=>{if(o.isMesh&&!o.material.isMeshBasicMaterial){o.castShadow=true;o.receiveShadow=true}});
 return{g,h,eyes,upd:anims.length?(t=>anims.forEach(f=>f(t))):null}}
rows.forEach((row,k)=>row.forEach(x=>{
 const y=3.3-k*1.35+(Math.random()-.5)*.3,b=build(SPECS[n%SPECS.length]);
 b.g.position.set(x+(Math.random()-.5)*.3,y,k*.8);crowd.add(b.g);
 heads.push({h:b.h,eyes:b.eyes,upd:b.upd,g:b.g,ph:Math.random()*6.28,bl:2+Math.random()*4,gy:y,hy:b.h.position.y,s:1,v:0,d:9});n++}));

const tgt=new THREE.Object3D(),P=new THREE.Vector3(),wp=new THREE.Vector3(),pr=new THREE.Vector3(),m={x:0,y:0,t:-1e5,on:false},q=new THREE.Quaternion(),pq=new THREE.Quaternion(),eu=new THREE.Euler();
addEventListener("pointermove",e=>{m.x=e.clientX/innerWidth*2-1;m.y=-(e.clientY/innerHeight*2-1);m.t=performance.now();m.on=true},{passive:true});
/* klik: karakter terdekat "boing" */
addEventListener("pointerdown",e=>{m.x=e.clientX/innerWidth*2-1;m.y=-(e.clientY/innerHeight*2-1);m.on=true;if(!heads.length)return;let b=heads[0];heads.forEach(o=>{if(o.d<b.d)b=o});if(b.d<.3)b.v+=9;kick()},{passive:true});
/* v6: kanvas dibatasi setinggi layar di desktop (hero bisa lebih tinggi dari layar), skala kerumunan mengikuti lebar,
   dan resolusi dibatasi agar ringan di layar Retina/Safari */
function size(){const w=hero.clientWidth,H=hero.clientHeight,hv=Math.min(H,Math.max(innerHeight,320)),wide=w/hv>1.15;
 R.setPixelRatio(Math.min(devicePixelRatio||1,1.5,Math.sqrt(3.2e6/Math.max(1,w*H))));R.setSize(w,H,false);
 /* desktop: bingkai kamera mengikuti tinggi layar (hv); sisa kanvas di bawahnya melanjutkan adegan, jadi tidak ada garis potong */
 if(wide){cam.aspect=w/hv;cam.setViewOffset(w,hv,0,0,w,H)}else{cam.aspect=w/H;cam.clearViewOffset()}cam.updateProjectionMatrix();
 const fade=wide&&H>hv+8?`linear-gradient(#000 ${hv-110}px,transparent ${hv+90}px)`:"";cv.style.webkitMaskImage=fade;cv.style.maskImage=fade;
 if(wide){const vh=2*camBase.z*Math.tan(cam.fov*Math.PI/360),vw=vh*cam.aspect,s=Math.min(1,vw*.62/12.8);crowd.scale.setScalar(s);crowd.position.set(vw/2-6.1*s,-.4+(1-s)*1.2,0)}
 else{crowd.position.set(0,-3.2,0);crowd.scale.setScalar(.75)}kick()}
new ResizeObserver(size).observe(hero);addEventListener("resize",size);
let vis=true,raf=0,last=performance.now(),cx=0,cy=0;
new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)kick()}).observe(hero);
function tick(now){raf=0;const t=now/1000,dt=Math.min((now-last)/1000,.05);last=now;
 const live=m.on&&now-m.t<2500;
 let mx=m.x,my=m.y;if(!live){mx=Math.sin(t*.5)*.8;my=Math.sin(t*.37)*.4}
 /* parallax kamera halus */
 const kc=rm?1:1-Math.exp(-dt*3);cx+=(mx*.9-cx)*kc;cy+=(my*.4-cy)*kc;
 cam.position.set(camBase.x+cx,camBase.y+cy,camBase.z);cam.lookAt(0,.6,0);cam.updateMatrixWorld();
 P.set(mx*14,my*7+1,9);
 heads.forEach(o=>{
  if(o.upd)o.upd(t);o.g.position.y=o.gy+(rm?0:Math.sin(t*1.1+o.ph)*.05);
  o.g.updateMatrixWorld(true);
  o.h.getWorldPosition(wp);
  tgt.position.copy(wp);tgt.lookAt(P);q.copy(tgt.quaternion);
  o.h.parent.getWorldQuaternion(pq);q.premultiply(pq.invert());
  eu.setFromQuaternion(q,"YXZ");eu.y=Math.max(-.9,Math.min(.9,eu.y));eu.x=Math.max(-.5,Math.min(.45,eu.x));eu.z=Math.sin(t*.8+o.ph)*.04;
  o.h.quaternion.slerp(q.setFromEuler(eu),rm?1:1-Math.exp(-dt*7));
  /* jarak ke kursor -> kepala membesar kenyal (squash & stretch) */
  pr.copy(wp).project(cam);o.d=m.on?Math.hypot((pr.x-m.x)*cam.aspect,pr.y-m.y):9;
  const near=live?Math.max(0,1-o.d/.35):0,target=1+near*.12;
  if(rm){o.s=target;o.v=0}else{o.v+=(-140*(o.s-target)-10*o.v)*dt;o.s+=o.v*dt}
  const sy=o.s*(1+(rm?0:Math.sin(t*1.6+o.ph)*.012)),sxz=1/Math.sqrt(sy);
  o.h.scale.set(sxz,sy,sxz);o.h.position.y=o.hy+(o.s-1)*.5;
  const bl=(t+o.ph)%o.bl<.12?.1:1;o.eyes.forEach(ey=>ey.scale.y=bl)});
 R.render(S,cam);
 if(vis&&!document.hidden&&!rm)kick()}
/* v6: dulu last=t di setiap frame membuat dt selalu 0, sehingga kepala tidak pernah menoleh ke kursor */
function kick(){if(!raf)raf=requestAnimationFrame(t=>{if(t-last>100)last=t-16;tick(t)})}
cv.addEventListener("webglcontextrestored",()=>{size();kick()});
addEventListener("pointermove",kick,{passive:true});document.addEventListener("visibilitychange",kick);size();
})();
