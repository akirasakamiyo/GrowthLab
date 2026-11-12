/* Transisi antarhalaman bergaya lukisan impasto (WebGL).
   Fase masuk: cat tebal menutup layar (sapuan kuas besar ATAU tutul pisau palet yang mekar).
   Fase keluar: pisau palet mengerok cat (meninggalkan gundukan cat dan goresan tipis) ATAU sapuan kuas berlanjut sampai ujungnya pecah jadi serat kering.
   Ketebalan cat dihitung sebagai peta tinggi, lalu diberi cahaya (diffuse + kilap basah) dan bayangan di atas halaman.
   Dipakai oleh handler hashchange di js/09-app.js lewat GLPaint.play(route). Jika WebGL tidak ada, GLPaint.ok = false dan tirai lama yang dipakai. */
(() => {
  const RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const cv = document.createElement("canvas");
  cv.id = "paintfx"; cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:61;pointer-events:none;display:none";
  const gl = !RM && (cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false }) || cv.getContext("experimental-webgl"));
  window.GLPaint = { ok: false };
  if (!gl) return;

  const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const FS = `precision highp float;
uniform vec2 uR;uniform float uA,uMode,uIn,uTail,uK,uAng,uKAng,uBump;
uniform vec2 uE;              // setengah lebar layar terputar (x, y)
uniform sampler2D uN;
uniform vec3 uSC[5],uSC2[5];uniform float uST[5];
uniform vec4 uD[16];uniform vec3 uDC[16];uniform float uDR;
uniform vec3 uBase;
float C3(float x){x=clamp(x,0.,1.);return x<.5?4.*x*x*x:1.-pow(-2.*x+2.,3.)*.5;}
float BK(float x){x=clamp(x,0.,1.);float c=1.5;return 1.+(c+1.)*pow(x-1.,3.)+c*pow(x-1.,2.);}
vec4 N(vec2 q){return texture2D(uN,q);}
vec3 COL;float HH;float AA;
void strokes(vec2 p){
  float c=cos(uAng),s=sin(uAng);vec2 q=vec2(c*p.x+s*p.y,-s*p.x+c*p.y);
  float hw=uE.y/5.*1.32;
  for(int i=0;i<5;i++){
    float fi=float(i);
    float yc=-uE.y+(fi+.5)*(2.*uE.y/5.);
    float wob=(N(vec2(q.x*.09+fi*.23,fi*.31+.5)).b-.5)*hw*.55;
    float e=hw*(1.+(N(vec2(q.x*.13+fi*.7,fi*.13)).g-.5)*.35);
    float dy=q.y-yc-wob;
    float u=dy/e;
    if(abs(u)>1.08)continue;
    float cap=(1.-sqrt(max(0.,1.-u*u)))*e*.85;
    float L=uE.x+hw;
    float f=mix(-L-.05,L+.12,C3((uIn-uST[i])/.6))-cap;
    float g=mix(-L-.6,L+.65,C3((uTail-uST[i]*.7)/.62))+cap*.4;
    vec4 nf=N(vec2(q.x*.16+fi*.37,u*.26+fi*.21));
    vec4 nm=N(vec2(q.x*.21+fi*.11,u*.07+fi*.5));
    float streak=nf.r*.75+nm.g*.25;
    float ue=abs(u)+(nf.a-.5)*.05+(nm.r-.5)*.06;
    float a=1.-smoothstep(.92,1.,ue);
    a*=smoothstep(0.,.006,f-q.x);
    float dz=(q.x-g)/.42;
    a*=smoothstep(-.06,.06,dz-streak*1.05);
    if(a<=0.)continue;
    float rim=.38*smoothstep(.5,.9,abs(u))*(1.-smoothstep(.9,1.,ue));
    float bulge=.85*exp(-(f-q.x)*10.)*(1.-u*u*.6);
    float tr=N(vec2(q.x*.5+fi*.3,u*.08+fi*.37+.11)).g;
    float gro=1.-abs(nf.r*2.-1.);
    float h=.4+.34*gro+.12*nm.g+.22*smoothstep(.55,.85,tr)+rim+bulge;
    h*=.45+.55*smoothstep(0.,1.2,dz);
    vec3 cc=mix(uSC[i],uSC2[i],smoothstep(.58,.8,nm.b)*.65);
    cc=mix(cc,vec3(1.,.97,.9),smoothstep(.82,.97,nf.g)*.22);
    COL=mix(COL,cc,a);HH=mix(HH,h+HH*.18,a);AA=AA+a*(1.-AA);
  }
}
void dabs(vec2 p){
  for(int i=0;i<16;i++){
    vec4 d=uD[i];vec2 v=p-d.xy;float r=length(v);
    if(r>uDR*1.35)continue;
    float gr=BK((uIn-d.z)/.42);
    if(gr<=0.)continue;
    float an=atan(v.y,v.x)/6.2832;
    float R=uDR*gr*(1.+(N(vec2(an*2.+d.w,.3)).g-.5)*.32);
    float u=r/R;
    float ue=u+(N(vec2(an*3.+d.w,r*.4)).a-.5)*.04;
    float a=1.-smoothstep(.95,1.,ue);
    if(a<=0.)continue;
    float sw=an+r*(.9+d.w*.2);
    vec4 nf=N(vec2(sw,r*.55+d.w));
    float dome=sqrt(max(0.,1.-u*u))*.48;
    float rim=.42*smoothstep(.62,.93,u)*(1.-smoothstep(.93,1.,ue));
    float h=(.3+dome+.32*nf.r+rim)*smoothstep(0.,.35,gr);
    vec3 cc=mix(uDC[i],uDC[int(mod(float(i)+5.,16.))],smoothstep(.6,.85,N(vec2(sw*2.,r*.2)).b)*.55);
    COL=mix(COL,cc,a);HH=mix(HH,h+HH*.15,a);AA=AA+a*(1.-AA);
  }
}
void base(vec2 p){
  COL=uBase;HH=0.;AA=0.;
  float b=smoothstep(.78,1.,uIn);
  if(b>0.){vec4 n=N(p*vec2(.18,.6));HH=(.3+.3*n.r)*b;AA=b;COL=mix(uBase,uBase*1.25,n.b*.5);}
  if(uMode<.5){
    if(uTail>0.){float c=cos(uAng),s=sin(uAng);vec2 q=vec2(c*p.x+s*p.y,-s*p.x+c*p.y);float L=uE.x+uE.y/5.*1.32;
      float fb=(q.y+uE.y)/(2.*uE.y/5.)-.5;float b0=clamp(floor(fb),0.,4.),b1=clamp(floor(fb)+1.,0.,4.);float st=1.;
      for(int i=0;i<5;i++){if(float(i)==b0||float(i)==b1)st=min(st,uST[i]);}
      float gb=mix(-L-.6,L+.65,C3((uTail-st*.7)/.62))+.15;AA*=smoothstep(-.03,.03,q.x-gb);}
    strokes(p);
  }else dabs(p);
}
float KS;  // posisi pisau relatif titik (s - k)
void knife(vec2 p){
  if(uK<=0.){KS=9.;return;}
  float c=cos(uKAng),s=sin(uKAng);
  float sp=dot(p,vec2(c,s)),pp=dot(p,vec2(-s,c));
  float E=.5*(uA*abs(c)+abs(s));
  float k=mix(-E-.4,E+.45,C3(uK))+(N(vec2(pp*.25,.7)).g-.5)*.035;
  float d=sp-k;KS=d;
  if(d<0.){
    float res=smoothstep(.5,.85,N(vec2(pp*.5,sp*.03)).r)*.6*(1.-smoothstep(0.,.45,-d));
    float fl=step(.9,N(p*vec2(.9,.9)+.31).a)*(1.-smoothstep(0.,.25,-d));
    AA*=max(res,fl);HH*=.35;
  }else{
    float pile=exp(-d*16.);
    HH+=1.3*pile*smoothstep(0.,.004,d)*(.7+.6*N(vec2(pp*.4,.2)).r);
  }
}
void scene(vec2 p){base(p);knife(p);}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uR)/uR.y;
  float e=1.6/uR.y;
  scene(p);vec3 col=COL;float h=HH,a=AA,ks=KS;
  scene(p+vec2(e,0.));float hx=HH;
  scene(p+vec2(0.,e));float hy=HH;
  if(ks>=0.&&ks<.25){
    float c=cos(uKAng),s=sin(uKAng);
    base(p-vec2(c,s)*(ks+.07));
    col=mix(col,COL,exp(-ks*11.)*.6);
  }
  scene(p+vec2(-.007,.01));float sh=AA;
  vec3 n=normalize(vec3((h-hx)*uBump/e,(h-hy)*uBump/e,1.));
  vec3 L=normalize(vec3(-.45,.55,.72));
  float df=max(dot(n,L),0.);
  float sp=pow(max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.),26.)*.5;
  vec3 c=col*(.42+.72*df)*(.86+.14*smoothstep(.15,.8,h))+sp*vec3(1.,.97,.9)*smoothstep(.0,.3,a);
  float sa=(1.-a)*sh*.38;
  gl_FragColor=vec4(c*a,a+sa);
}`;

  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn("paintfx", gl.getShaderInfoLog(o)); return null } return o };
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const al = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["uR", "uA", "uMode", "uIn", "uTail", "uK", "uAng", "uKAng", "uBump", "uE", "uN", "uSC", "uSC2", "uST", "uD", "uDC", "uDR", "uBase"].forEach(k => U[k] = gl.getUniformLocation(pr, k));

  /* tekstur derau yang bisa diulang: R halus (64 sel), G sedang (16), B kasar (4), A acak per piksel */
  const S = 256, tex = new Uint8Array(S * S * 4);
  const lat = (n, seed) => { const a = new Float32Array(n * n); let x = seed; for (let i = 0; i < a.length; i++) { x = (x * 1664525 + 1013904223) >>> 0; a[i] = x / 4294967296 } return a };
  const sm = t => t * t * (3 - 2 * t);
  const vn = (cells, seed) => { const g = lat(cells, seed), out = new Float32Array(S * S), k = cells / S;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const fx = x * k, fy = y * k, x0 = fx | 0, y0 = fy | 0, tx = sm(fx - x0), ty = sm(fy - y0), x1 = (x0 + 1) % cells, y1 = (y0 + 1) % cells;
      const a = g[y0 * cells + x0], b = g[y0 * cells + x1], c = g[y1 * cells + x0], d = g[y1 * cells + x1];
      out[y * S + x] = a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty } return out };
  const f64 = vn(64, 7), f128 = vn(128, 11), f16 = vn(16, 3), f32 = vn(32, 5), f4 = vn(4, 9), f8 = vn(8, 13), rnd = lat(S, 17);
  for (let i = 0; i < S * S; i++) {
    tex[i * 4] = Math.min(255, (f64[i] * .7 + f128[i] * .3) * 255);
    tex[i * 4 + 1] = Math.min(255, (f16[i] * .7 + f32[i] * .3) * 255);
    tex[i * 4 + 2] = Math.min(255, (f4[i] * .7 + f8[i] * .3) * 255);
    tex[i * 4 + 3] = rnd[i] * 255;
  }
  const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, S, S, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.uniform1i(U.uN, 0);
  gl.disable(gl.BLEND); gl.clearColor(0, 0, 0, 0);

  /* palet landing page */
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const PAL = ["#2b55ff", "#ffd23f", "#ff6b3d", "#fff4e0", "#1d34d8", "#6d8bff", "#ffb03a"].map(hex);
  const rnd1 = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]] } return a };

  let scale = Math.min(devicePixelRatio || 1, 2) * .62, W = 0, H = 0, A = 1;
  const size = () => {
    const w = innerWidth, h = innerHeight, maxPx = 1.7e6;
    let s = scale; if (w * h * s * s > maxPx) s = Math.sqrt(maxPx / (w * h));
    W = Math.max(2, Math.round(w * s)); H = Math.max(2, Math.round(h * s)); A = w / h;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H }
    gl.viewport(0, 0, W, H); gl.uniform2f(U.uR, W, H); gl.uniform1f(U.uA, A);
  };

  let cfg = null;
  const setup = mode => {
    const m = mode != null ? mode : (Math.random() < .58 ? 0 : 1);
    /* sudut sapuan: condong sedikit, arah acak (kiri-kanan, kanan-kiri, atas-bawah) */
    const dirs = [0, Math.PI, Math.PI / 2, -Math.PI / 2];
    const ang = dirs[Math.random() * 4 | 0] + rnd1(-.38, .38);
    const c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang));
    gl.uniform1f(U.uMode, m); gl.uniform1f(U.uAng, ang);
    gl.uniform2f(U.uE, .5 * (A * c + s), .5 * (A * s + c));
    const order = shuffle([0, 1, 2, 3, 4]), cols = shuffle([0, 1, 2, 3, 4, 5, 6]);
    const sc = [], sc2 = [], st = [];
    for (let i = 0; i < 5; i++) { sc.push(...PAL[cols[i]]); sc2.push(...PAL[cols[(i + 3) % 7]]); st.push(order[i] * .085) }
    gl.uniform3fv(U.uSC, sc); gl.uniform3fv(U.uSC2, sc2); gl.uniform1fv(U.uST, st);
    /* tutul: kisi 4x4 yang digeser acak, mekar berurutan dari titik acak */
    const cols4 = 4, rows4 = 4, cw = A / cols4, ch = 1 / rows4, ox = rnd1(-.5, .5) * A, oy = rnd1(-.5, .5), D = [], DC = [];
    for (let j = 0; j < rows4; j++) for (let i = 0; i < cols4; i++) {
      const x = -A / 2 + (i + .5) * cw + rnd1(-.25, .25) * cw, y = -.5 + (j + .5) * ch + rnd1(-.25, .25) * ch;
      const dist = Math.hypot(x - ox, y - oy);
      D.push(x, y, Math.min(.55, dist * .32 + rnd1(0, .08)), rnd1(0, 4)); DC.push(...PAL[(Math.random() * 7) | 0]);
    }
    gl.uniform4fv(U.uD, D); gl.uniform3fv(U.uDC, DC);
    gl.uniform1f(U.uDR, Math.hypot(cw, ch) * .62 + .05);
    gl.uniform3fv(U.uBase, PAL[[0, 4][Math.random() * 2 | 0]]);
    gl.uniform1f(U.uBump, .016);
    /* keluar: 0 = pisau palet mengerok, 1 = sapuan berlanjut (hanya untuk mode sapuan) */
    const out = m === 0 && Math.random() < .5 ? 1 : 0;
    gl.uniform1f(U.uKAng, ang + rnd1(-.9, .9) + (Math.random() < .5 ? Math.PI : 0));
    cfg = { m, out };
  };
  const draw = (tin, tout) => {
    gl.uniform1f(U.uIn, tin);
    gl.uniform1f(U.uTail, cfg.out === 1 ? tout : 0);
    gl.uniform1f(U.uK, cfg.out === 0 ? tout : 0);
    gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const DIN = 760, HOLD = 90, DOUT = 900;
  let run = 0, covered = false, pending = null;
  const play = onCover => {
    if (run) { if (covered) { try { onCover() } catch (e) { console.error(e) } } else pending = onCover; return }
    const id = ++run; covered = false; pending = onCover;
    size(); setup(); cv.style.display = "block"; cv.style.pointerEvents = "auto";
    const t0 = performance.now(); let last = t0, slow = 0;
    /* rute diganti lewat timer, bukan rAF, supaya tetap tepat waktu walau render lambat */
    setTimeout(() => { if (run !== id) return; covered = true; cv.style.pointerEvents = "none"; const f = pending; pending = null; try { f && f() } catch (e) { console.error(e) } }, DIN + 20);
    const tick = now => {
      if (run !== id) return;
      const dt = now - last; last = now;
      if (dt > 45 && now - t0 > 120 && ++slow > 3 && scale > .3) { scale *= .7; slow = 0; size() }
      const el = now - t0;
      if (el < DIN + HOLD) draw(Math.min(1, el / DIN), 0);
      else if (el < DIN + HOLD + DOUT) draw(1, (el - DIN - HOLD) / DOUT);
      else { cv.style.display = "none"; run = 0; covered = false; return }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  /* untuk pratinjau dan pengujian: gambar satu bingkai pada waktu tertentu */
  const frame = (mode, tin, tout, out, keep) => { size(); if (!keep || !cfg) setup(mode); if (out != null) cfg.out = out; cv.style.display = "block"; draw(tin, tout || 0) };
  const hide = () => { cv.style.display = "none" };
  addEventListener("resize", () => { if (run) size() });
  const mount = () => document.body.appendChild(cv);
  document.body ? mount() : addEventListener("DOMContentLoaded", mount);
  window.GLPaint = { ok: true, play, frame, hide, get busy() { return !!run } };
})();
