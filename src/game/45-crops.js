/* =========================================================
   Soil (tilled tiles)
   ========================================================= */
// tilled soil: one slab per tile (reaching out to meet tilled neighbours), painted with a soil texture laid in world
// space, so a bed reads as one field of furrows: rounded ridges catching the light, shaded troughs, speckled earth and
// the odd pebble. The instance colour tints it (dry: warm tan, watered: dark and rich).
const SOIL_GEO=new T.BoxGeometry(0.9,0.06,0.9);
const SOIL_TEX=(()=>{const N=64,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),R=mulberry(4242),img=g.createImageData(N,N),d=img.data;
  const ridge=y=>{const t=((y+0.5)/N*3)%1;/* three furrows a tile: 0 at a trough, up the lit face, over the crest, down the shaded face */
    return t<0.12?0.62+t*1.5:t<0.55?0.8+Math.sin((t-0.12)/0.43*Math.PI/2)*0.28:t<0.7?1.08-(t-0.55)*1.6:0.84-(t-0.7)*0.7;};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=ridge(y)+(R()-0.5)*0.1;const w=Math.sin(x*0.35+y*0.05)*0.02;v+=w;/* a slight waviness along the rows */
    if(R()<0.05)v-=0.12;if(R()<0.03)v+=0.1;/* speckles of darker and lighter earth */
    const i=(y*N+x)*4;d[i]=Math.min(255,v*218);d[i+1]=Math.min(255,v*208);d[i+2]=Math.min(255,v*198);d[i+3]=255;}
  g.putImageData(img,0,0);
  for(let k=0;k<7;k++){const x=R()*N,y=R()*N,r=1+R()*1.6;g.fillStyle='rgba(60,40,30,.35)';g.beginPath();g.ellipse(x+0.8,y+1,r,r*0.8,0,0,7);g.fill();/* pebbles, and clods */
    g.fillStyle=k%3?'rgba(255,246,232,.55)':'rgba(214,220,232,.9)';g.beginPath();g.ellipse(x,y,r,r*0.75,0,0,7);g.fill();}
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.NearestFilter;t.minFilter=T.LinearMipmapLinearFilter;return t;})();
const soilMat=toon({map:SOIL_TEX});
soilMat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vSoil;').replace('#include <begin_vertex>',`#include <begin_vertex>
  {vec4 sw=vec4(transformed,1.);
  #ifdef USE_INSTANCING
  sw=instanceMatrix*sw;
  #endif
  sw=modelMatrix*sw;vSoil=sw.xz+0.5;}`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vSoil;').replace('#include <map_fragment>','vec4 texelColor=mapTexelToLinear(texture2D(map,vSoil));diffuseColor*=texelColor;');};
let soilIM=null;
function rebuildSoil(){
  if(soilIM){scene.remove(soilIM);soilIM.dispose();}
  const keys=Object.keys(S.tiles);
  soilIM=new T.InstancedMesh(SOIL_GEO,soilMat,Math.max(1,keys.length));soilIM.count=keys.length;soilIM.receiveShadow=true;soilIM.frustumCulled=false;
  // each slab reaches out to meet tilled neighbours, so a plot reads as one bed of soil, not separate squares
  // (fruit trees keep just a small ring of dirt, so an orchard stays on grass)
  const tree=q=>{const c=S.tiles[q]&&S.tiles[q].crop;return !!c&&CROPS[c.t]&&CROPS[c.t].kind==='tree';};
  keys.forEach((k,i)=>{const [x,z]=k.split(',').map(Number),y=topY(x,z),tr=tree(k),n=(a,b)=>{const q=K(x+a,z+b);return !tr&&!!S.tiles[q]&&!tree(q)&&Math.abs(topY(x+a,z+b)-y)<0.05;};
    const e=tr?0.17:0.45,l=n(-1,0)?0.5:e,r=n(1,0)?0.5:e,f=n(0,-1)?0.5:e,b=n(0,1)?0.5:e;
    _m.makeScale((l+r)/0.9,1,(f+b)/0.9);_m.setPosition(x+(r-l)/2,y+0.03,z+(b-f)/2);soilIM.setMatrixAt(i,_m);soilIM.setColorAt(i,_c.set(S.tiles[k].w?0x5e4a3e:0x9c8670));});
  if(!keys.length)soilIM.setColorAt(0,_c.set(0));
  scene.add(soilIM);refreshHomeGrass();
}

/* =========================================================
   Crop models
   ========================================================= */
function stageOf(p){return p>=1?3:p>=0.5?2:p>=0.12?1:0;}
/* ---- vegetation building blocks: many small leaves and petals, read as pixel art once rendered ---- */
const LEAF0=new T.IcosahedronGeometry(0.5,0);
const GREENS=[0x4f9a3a,0x6ab84a,0x3a7a30,0x7cc458];
// a flattened leaf whose base sits at (x,y,z), pointing out along azimuth ry and tilted up by `tilt`
function lf(p,col,x,y,z,ry,tilt,len,wid,th=0.035){const c=Math.cos(tilt);p.push(P(LEAF0,col,x+Math.sin(ry)*len*0.45*c,y+Math.sin(tilt)*len*0.45,z+Math.cos(ry)*len*0.45*c,-tilt,ry,0,wid,th,len));}
function rosette(p,R,n,len,wid,y,tilt,cols=GREENS){for(let i=0;i<n;i++){const a=i/n*6.283+R()*0.45,l=len*(0.8+R()*0.4);lf(p,cols[i%cols.length],0,y+R()*0.03,0,a,tilt+R()*0.25,l,wid);}}
function stemP(p,col,x,z,h,y0=0){p.push(P(CYL6,col,x,y0+h/2,z,0,0,0,0.035,h,0.035));}
function bloom(p,col,cc,x,y,z,r,n=5,tilt=0.25){for(let i=0;i<n;i++)lf(p,i%2&&n>5?cc:col,x,y,z,i/n*6.283,tilt,r,r*0.62,0.03);p.push(P(ICO,cc,x,y+0.015,z,0,0,0,r*0.5,r*0.35,r*0.5));}
function spike(p,col,dk,x,y,z,r){for(let k=0;k<6;k++){const rr=r*(1-k*0.13);p.push(P(ICO,k%2?dk:col,x+(k%2?0.015:-0.015),y+k*r*0.75,z,0,k,0,rr,rr*0.9,rr));}}
function berries(p,col,dk,x,y,z,r,n,R){for(let i=0;i<n;i++){const bx=x+(R()-0.5)*r*2.2,by=y+(R()-0.5)*r*1.6,bz=z+(R()-0.5)*r*2.2;
  p.push(P(ICO,i%3===2?dk:col,bx,by,bz,0,R()*3,0,r,r,r),P(LEAF0,0xffffff,bx+r*0.28,by+r*0.3,bz+r*0.28,0,0,0,r*0.32,r*0.28,r*0.32));}}
function wildflowers(p,R,cols,n,spread=0.32){for(let s=0;s<n;s++){const x=(R()-0.5)*spread*2,z=(R()-0.5)*spread*2,h=0.08+R()*0.12,c=cols[Math.floor(R()*cols.length)];
  stemP(p,0x4f8a34,x,z,h);lf(p,GREENS[s%4],x,h*0.35,z,R()*6.28,0.35,0.12,0.07);lf(p,GREENS[(s+1)%4],x,h*0.6,z,R()*6.28,0.4,0.1,0.06);
  if(R()<0.3)spike(p,c,0xffffff,x,h,z,0.04);else bloom(p,c,R()<0.5?0xf6d04a:0xffffff,x,h,z,0.085);}}

function cropParts(type,stage,seed=1){
  /* Crops are drawn to fill their tile the way Stardew's do: a full mound of gradient leaf cards (dark at the base,
     light at the tip), with big, glossy produce that reads from across the farm. Stage 2 is the same plant at 65%
     size without produce. Produce uses PG gradients (light on top, dark underneath) plus a white specular dab. */
  const lf=(p,col,x,y,z,ry,tilt,len,wid)=>{const c=Math.cos(tilt);card(p,x,y,z,[Math.sin(ry)*c,Math.sin(tilt),Math.cos(ry)*c],len,wid*1.3,lerpHex(col,0xe4f880,0.16),lerpHex(col,0x14301a,0.42));};
  const LT=(c,t=0.3)=>lerpHex(c,0xffffff,t),DK=(c,t=0.35)=>lerpHex(c,0x1a1420,t);
  // a leafy dome: outer leaves long and low, inner ones short and upright, lighter toward the middle
  const mound=(p,cols,n,r,t0,t1,{y=0.02,cx=0,cz=0,w=0.55,spin=0}={})=>{for(let i=0;i<n;i++){const t=n>1?i/(n-1):0,a=i*2.39996+spin+R()*0.3,st=r*0.14*(1-t);
    const len=r*(1.05-0.38*t)*(0.85+R()*0.3);lf(p,cols[Math.min(cols.length-1,Math.floor(t*cols.length))],cx+Math.sin(a)*st,y+t*0.05,cz+Math.cos(a)*st,a,t0+(t1-t0)*t+(R()-0.5)*0.16,len,len*w);}};
  // glossy produce: a gradient ball with a highlight
  const ball=(p,col,x,y,z,r,sy=1,{geo=r>0.09?ICO2:ICO,rx=0,rz=0,shine=true}={})=>{p.push(PG(geo,LT(col,0.22),DK(col,0.32),x,y,z,rx,0,rz,r*2,r*2*sy,r*2));
    if(shine)p.push(P(LEAF0,LT(col,0.75),x-r*0.32,y+r*0.55*sy,z+r*0.5,0,0,0,r*0.45,r*0.28,r*0.4));};
  const calyx=(p,x,y,z,r,n=5,col=0x3f8f3a)=>{for(let k=0;k<n;k++)lf(p,col,x,y,z,k/n*6.283,0.35,r,r*0.5);};
  const C=CROPS[type],R=mulberry(seed),leaf=[],fruit=[];
  const LEAF=[0x2a7030,0x3e8e36,0x56a83e,0x6cbc46],LEAFB=[0x2e7a62,0x44946e,0x62ae80,0x86c898],LEAFY=[0x4a9a30,0x62b23a,0x80c846,0x9cd858],SAGE=[0x4e7e52,0x668e5e,0x7ea670];
  if(stage===0){for(let i=0;i<5;i++)leaf.push(P(ICO,0x4a3020,(R()-0.5)*0.34,0.02,(R()-0.5)*0.34,0,R()*3,0,0.1,0.05,0.1));lf(leaf,0x8cc85a,0,0.03,0,R()*6,1.2,0.07,0.04);return{leaf,fruit};}
  if(stage===1){stemP(leaf,0x5aa844,0,0,0.12);for(let i=0;i<4;i++)lf(leaf,i%2?0x8cc85a:0x6ab84a,0,0.1+i*0.012,0,i*1.7+R()*0.4,0.35+i*0.12,0.2-i*0.02,0.12);return{leaf,fruit};}
  const b=stage===3?1:0.65,ripe=stage===3;
  switch(type){
    case'turnip':case'radish':{const tr=type==='turnip',r=(tr?0.23:0.2)*(ripe?1:0),top=ripe?r*1.55:0.02;mound(leaf,LEAF,tr?13:11,(tr?0.42:0.36)*b,0.95,1.4,{y:top,w:0.55});
      if(ripe){ball(fruit,C.col,0,r*0.7,0,r,0.95);if(tr)fruit.push(PG(ICO2,LT(C.top,0.2),DK(C.top,0.2),0,r*1.05,0,0,0,0,r*1.98,r*1.05,r*1.98));fruit.push(PG(CONE8,C.col,DK(C.col,0.2),0,-0.02,0,Math.PI,0,0,0.08,0.12,0.08));}break;}
    case'carrot':mound(leaf,LEAF,18,0.52*b,1.05,1.45,{y:ripe?0.17:0.02,w:0.28});
      if(ripe){fruit.push(PG(CONE8,DK(C.col,0.3),LT(C.col,0.1),0,0.02,0,Math.PI,0,0,0.34,0.34,0.34),PG(ICO2,LT(C.col,0.25),C.col,0,0.17,0,0,0,0,0.34,0.1,0.34),P(LEAF0,LT(C.col,0.7),-0.06,0.17,0.1,0,0,0,0.09,0.03,0.05));}break;
    case'onion':for(let i=0;i<9;i++){const a=i*2.39996+R()*0.3,tl=0.18+R()*0.3,h=(0.46+R()*0.16)*b;leaf.push(PG(CONE6,LEAF[3],LEAF[1],Math.sin(a)*tl*h*0.5,0.12+h/2*Math.cos(tl),Math.cos(a)*tl*h*0.5,Math.cos(a)*tl,0,-Math.sin(a)*tl,0.07,h,0.07));}
      if(ripe){ball(fruit,C.col,0,0.14,0,0.23,0.92);fruit.push(PG(CONE8,C.col,DK(C.col,0.2),0,0.33,0,0,0,0,0.12,0.14,0.12));}break;
    case'potato':mound(leaf,LEAF,22,0.44*b,0.35,1.2,{w:0.7});mound(leaf,LEAF.slice(1),10,0.3*b,0.7,1.3,{y:0.14*b});
      if(ripe){for(let i=0;i<4;i++){const a=i*1.6+R();bloom(leaf,0xf8f2fe,0xf6d04a,Math.sin(a)*0.15,0.36,Math.cos(a)*0.15,0.07);}
        ball(fruit,C.col,0.34,0.06,0.18,0.12,0.75);ball(fruit,C.col,-0.24,0.05,0.32,0.1,0.75);ball(fruit,C.col,0.05,0.05,0.4,0.09,0.75);}break;
    case'lettuce':mound(leaf,LEAFY,20,0.44*b,0.22,1.25,{w:1.05});if(ripe){ball(leaf,0xb4e070,0,0.14,0,0.14,0.9,{shine:false});mound(leaf,[0x9cd858,0xb4e070],7,0.2,1.1,1.4,{y:0.13,w:0.9});}break;
    case'cabbage':mound(leaf,LEAFB,11,0.46*b,0.12,0.55,{w:1.05});
      if(ripe){ball(leaf,0xa8d8a0,0,0.2,0,0.22,0.9);for(let k=0;k<6;k++)lf(leaf,LEAFB[k%2+2],Math.sin(k*1.05)*0.1,0.06,Math.cos(k*1.05)*0.1,k*1.05,1.15,0.3,0.28);}break;
    case'strawberry':mound(leaf,LEAF,16,0.38*b,0.22,0.95,{w:0.95});
      if(ripe){for(let i=0;i<6;i++){const a=i*1.047+R()*0.3,x=Math.sin(a)*0.33,z=Math.cos(a)*0.33;fruit.push(PG(CONE8,DK(C.col,0.25),LT(C.col,0.1),x,0.1,z,Math.PI,0,0,0.2,0.22,0.2),P(LEAF0,LT(C.col,0.75),x-0.04,0.15,z+0.06,0,0,0,0.05,0.03,0.04));
          for(let k=0;k<4;k++)fruit.push(P(LEAF0,0xf8e080,x+Math.sin(k*1.6)*0.05,0.07+(k%2)*0.03,z+Math.cos(k*1.6)*0.05,0,0,0,0.018,0.018,0.018));calyx(leaf,x,0.17,z,0.07);}
        bloom(leaf,0xffffff,0xf6d04a,0.06,0.24,-0.05,0.08);bloom(leaf,0xffffff,0xf6d04a,-0.12,0.22,0.1,0.07);}break;
    case'wheat':{const col=ripe?C.col:0x8ccc58,hd=ripe?LT(C.col,0.25):0xb0dc70;mound(leaf,ripe?[0x9ab04a,0xb8c060,0xd8cc70]:LEAF,10,0.34*b,0.5,1.1,{w:0.25});
      for(let i=0;i<26;i++){const a=R()*6.283,r=Math.sqrt(R())*0.3,x=Math.cos(a)*r,z=Math.sin(a)*r,h=(0.62+R()*0.22)*b,lx=(R()-0.5)*0.16,lz=(R()-0.5)*0.16;
        leaf.push(PG(CYL6,col,DK(col,0.3),x+lx*h/2,h/2,z+lz*h/2,lz,0,-lx,0.028,h,0.028));
        if(stage>=2)(ripe?fruit:leaf).push(PG(LEAF0,hd,col,x+lx*h,h+0.07,z+lz*h,lz,R()*3,-lx,0.07,0.2,0.07));}break;}
    case'pepper':case'eggplant':{const pep=type==='pepper';stemP(leaf,0x3f8f3a,0,0,0.5*b);mound(leaf,LEAF,16,0.36*b,0.2,0.9,{y:0.16*b,w:0.72});mound(leaf,LEAF.slice(1),11,0.28*b,0.5,1.2,{y:0.36*b,w:0.72});
      if(ripe){const cols=pep?[C.col,0xe0402e,0xf6c030]:[C.col,C.col,DK(C.col,0.1)];for(let i=0;i<4;i++){const a=i*1.571+0.5,x=Math.sin(a)*0.3,z=Math.cos(a)*0.3,y=pep?0.18+(i%2)*0.08:0.2;
        if(pep){ball(fruit,cols[i%3],x,y,z,0.12,1.2);for(const s of [-1,1])fruit.push(PG(ICO,LT(cols[i%3],0.15),DK(cols[i%3],0.3),x+s*0.06,y-0.02,z,0,0,0,0.14,0.22,0.16));}
        else{ball(fruit,cols[i%3],x,y,z,0.11,1.8,{rx:Math.cos(a)*0.35,rz:-Math.sin(a)*0.35});}
        fruit.push(PG(CONE6,0x5aa840,0x2f7a34,x,y+(pep?0.16:0.22),z,0,0,0,0.12,0.08,0.12),P(CYL6,0x3f8f3a,x,y+(pep?0.2:0.25),z,0,0,0,0.025,0.07,0.025));}}break;}
    case'tomato':leaf.push(P(BOX,0x9a7a4a,0.06,0.5*b,0.06,0,0,0,0.035,1.0*b,0.035),P(BOX,0x9a7a4a,-0.06,0.5*b,-0.06,0,0,0,0.035,1.0*b,0.035));
      for(const [y,r] of [[0.02,0.42],[0.3,0.36],[0.56,0.3],[0.8,0.22]])mound(leaf,LEAF,12,r*b,0.25,1.0,{y:y*b,w:0.7,spin:y*7});
      if(ripe)for(let i=0;i<9;i++){const a=i*2.39996,y=0.22+(i%4)*0.17,rr=0.2+(i%3)*0.05,col=i%5===4?0xf0a030:i%7===6?0x8cc850:C.col;ball(fruit,col,Math.sin(a)*rr,y,Math.cos(a)*rr,0.075+R()*0.02);calyx(leaf,Math.sin(a)*rr,y+0.07,Math.cos(a)*rr,0.05,4);}break;
    case'tulip':{const cols=[C.col,0xf6d04a,0xe8453a,0xfff4f0,0xc890e8];for(let i=0;i<5;i++){const a=i*1.257+R()*0.4,d=i?0.2:0,x=Math.sin(a)*d,z=Math.cos(a)*d,h=(0.36+R()*0.12)*b;
        stemP(leaf,0x4f9a3a,x,z,h);lf(leaf,LEAF[2],x,0.02,z,a,1.05,0.3*b,0.12*b);lf(leaf,LEAF[1],x,0.02,z,a+2.6,1.15,0.26*b,0.11*b);
        if(ripe){const c=cols[(i+seed)%cols.length];for(let k=0;k<6;k++)lf(fruit,k%2?c:DK(c,0.12),x,h-0.02,z,k/6*6.283,1.28,0.17,0.12);fruit.push(PG(ICO2,LT(c,0.2),DK(c,0.2),x,h+0.04,z,0,0,0,0.13,0.14,0.13));}
        else if(stage===2)fruit.push(PG(ICO,0xb8e080,0x6ab84a,x,h+0.03,z,0,0,0,0.07,0.11,0.07));}break;}
    case'sunflower':{const h=1.15*b;leaf.push(PG(CYL6,LEAF[2],LEAF[0],0,h/2,0,0,0,0,0.06,h,0.06));for(let i=0;i<7;i++)lf(leaf,LEAF[i%3+1],0,0.15+i*0.13*b,0,i*2.4,0.25,0.34*b,0.3*b);
      if(ripe){const y=h+0.04;for(let k=0;k<18;k++){const a=k/18*6.283,c=k%2?C.col:LT(C.col,0.2);lf(fruit,c,Math.cos(a)*0.13,y+Math.sin(a)*0.13,0.06,0,0,0.01,0.01);
          const d=[Math.cos(a),Math.sin(a),0.18];card(fruit,Math.cos(a)*0.12,y+Math.sin(a)*0.12,0.05,d,0.2,0.12,LT(c,0.2),DK(c,0.15));}
        fruit.push(PG(CYL12,0x8a5a30,C.center,0,y,0.08,Math.PI/2,0,0,0.3,0.06,0.3),P(CYL12,0x4a2a18,0,y,0.1,Math.PI/2,0,0,0.2,0.04,0.2));calyx(leaf,0,y,0.0,0.14,8,0x4e9e3c);}
      else if(stage===2)fruit.push(PG(ICO2,0x8cc85a,0x4e9e3c,0,h+0.05,0,0,0,0,0.16,0.14,0.16));break;}
    case'corn':for(const [sx,sz,hs] of [[-0.14,0.06,1],[0.15,-0.08,0.88]]){const h=1.25*b*hs;leaf.push(PG(CYL6,LEAF[2],LEAF[0],sx,h/2,sz,0,0,0,0.075,h,0.075));
        for(let i=0;i<8;i++)lf(leaf,LEAF[i%3+1],sx,(0.12+i*0.13)*b*hs,sz,i*2.3+sx*9,0.35-i*0.02,0.5*b,0.1*b);
        if(ripe){for(let k=0;k<7;k++)leaf.push(P(BOX,0xe0c070,sx+Math.sin(k)*0.05,h+0.07,sz+Math.cos(k)*0.05,Math.sin(k)*0.45,0,Math.cos(k)*0.45,0.018,0.2,0.018));
          const a=sx*9,x=sx+Math.sin(a)*0.1,z=sz+Math.cos(a)*0.1,y=h*0.5;ball(fruit,C.col,x,y+0.06,z,0.07,2.2,{rz:-0.2});lf(leaf,0xb8e090,x,y-0.1,z,a,1.3,0.3,0.12);lf(leaf,0x9ad070,x,y-0.1,z,a+0.9,1.2,0.28,0.11);lf(leaf,0x9ad070,x,y-0.1,z,a-0.9,1.2,0.28,0.11);}}break;
    case'blueberry':bushClump(leaf,R,[0x9ad060,0x4a8a34,0x285a24],1.05*b);
      if(ripe)for(let i=0;i<7;i++){const a=i*0.9,r=0.28+R()*0.06;berries(fruit,C.col,0x2a3a8a,Math.sin(a)*r,0.22+R()*0.22,Math.cos(a)*r,0.05,4,R);}break;
    case'pumpkin':case'watermelon':{const pk=type==='pumpkin';mound(leaf,LEAF,14,0.46*b,0.02,0.38,{w:1.0});for(let i=0;i<8;i++){const a=i/8*6.283+R()*0.4;
        leaf.push(P(CYL6,0x7ab84a,Math.sin(a+0.4)*0.3,0.03,Math.cos(a+0.4)*0.3,Math.PI/2,a+0.4,0,0.025,0.26,0.025));}
      if(ripe&&pk){for(let i=0;i<8;i++){const a=i/8*6.283;fruit.push(PG(ICO2,LT(C.col,0.2),DK(C.col,0.35),Math.sin(a)*0.1,0.2,Math.cos(a)*0.1,0,a,0,0.2,0.36,0.34));}
        fruit.push(P(LEAF0,LT(C.col,0.7),-0.1,0.34,0.16,0,0,0,0.1,0.05,0.07));leaf.push(PG(CYL6,0x8a6a3a,0x5a3a2a,0,0.42,0,0,0,0.35,0.05,0.14,0.05));lf(leaf,LEAF[2],0,0.4,0,1.2,0.4,0.18,0.16);}
      if(ripe&&!pk){for(let i=0;i<12;i++){const a=i/12*6.283;fruit.push(PG(ICO2,i%2?0x4a9a44:0x2a6a2a,i%2?0x2e6e2e:0x1a4a1e,Math.sin(a)*0.07,0.2,Math.cos(a)*0.09,0,a,0,0.2,0.38,0.52));}
        fruit.push(P(LEAF0,0xe8ffe0,-0.08,0.36,0.14,0,0,0,0.1,0.04,0.08));}break;}
    case'lavender':mound(leaf,SAGE,18,0.4*b,0.55,1.3,{w:0.25});
      for(let i=0;i<22;i++){const a=R()*6.283,r=Math.sqrt(R())*0.26,x=Math.cos(a)*r,z=Math.sin(a)*r,h=(0.4+R()*0.16)*b,lx=(R()-0.5)*0.2,lz=(R()-0.5)*0.2;
        leaf.push(P(CYL6,0x6a9a5a,x+lx*h/2,h/2,z+lz*h/2,lz,0,-lx,0.022,h,0.022));if(ripe)spike(fruit,C.col,DK(C.col,0.25),x+lx*h,h-0.02,z+lz*h,0.065);else if(stage===2)spike(leaf,0x9ab88a,0x7a9a6a,x+lx*h,h-0.02,z+lz*h,0.035);}break;
    case'moonflower':stemP(leaf,0x3f8f3a,0,0,0.62*b);mound(leaf,LEAF,14,0.4*b,0.3,1.0,{w:0.8});for(let i=0;i<6;i++)lf(leaf,LEAF[i%3+1],0,0.15+i*0.08*b,0,i*2.4,0.3,0.26*b,0.22*b);
      if(ripe)for(const [x,z,y] of [[0,0,0.66],[0.2,0.1,0.44],[-0.16,-0.14,0.5]]){for(let k=0;k<6;k++)lf(fruit,k%2?C.col:LT(C.center,0.5),x,y,z,k/6*6.283,0.55,0.2,0.16);fruit.push(PG(ICO2,LT(C.center,0.3),C.center,x,y+0.02,z,0,0,0,0.1,0.07,0.1));}break;
    case'peas':{for(const sx of [-0.2,0.2])leaf.push(P(BOX,0x9a7a4a,sx,0.4*b,0,0,0,0,0.03,0.8*b,0.03));leaf.push(P(BOX,0x9a7a4a,0,0.78*b,0,0,0,0,0.44,0.025,0.025));
      mound(leaf,LEAF,10,0.3*b,0.3,1.0,{w:0.8});for(let i=0;i<18;i++){const y=(0.12+i*0.036)*b,x=Math.sin(i*1.3)*0.17;leaf.push(P(CYL6,0x6ab84a,x,y,0.02,0,0,0.5*Math.cos(i),0.02,0.1,0.02));lf(leaf,LEAF[i%3+1],x,y,0.02,i*2.3,0.25,0.18*b,0.14*b);}
      if(ripe){for(let i=0;i<5;i++){const x=-0.16+i*0.08,y=0.3+(i%3)*0.14;fruit.push(PG(ICO2,LT(C.col,0.2),DK(C.col,0.25),x,y,0.09,0,0,0.25*(i%2?1:-1),0.09,0.26,0.09),P(LEAF0,0xe0ffb0,x-0.02,y+0.04,0.13,0,0,0,0.03,0.06,0.02));}
        for(let i=0;i<3;i++)bloom(leaf,[0xf2a6c8,0xffffff,0xb8a8f2][i],0xf6d04a,-0.12+i*0.12,0.6+i*0.05,0.06,0.05);}break;}
    case'grape':{for(const sx of [-0.34,0.34])leaf.push(P(CYL6,0x7a5a3a,sx,0.45*b,0,0,0,0,0.05,0.9*b,0.05));leaf.push(P(BOX,0x8a6a44,0,0.88*b,0,0,0,0,0.76,0.035,0.035),P(CYL6,0x6a4a30,0,0.45*b,0,0,0,0.12,0.05,0.9*b,0.05));
      for(let i=0;i<22;i++){const x=-0.36+i/21*0.72;lf(leaf,LEAF[i%3+1],x,0.86*b,(i%2-0.5)*0.12,i*2.1,0.1-(i%3)*0.35,0.22*b,0.2*b);}
      for(const sx of [-0.34,0.34])for(let k=0;k<4;k++)lf(leaf,LEAF[k%3+1],sx,(0.2+k*0.16)*b,0,k*2.4+sx,0.3,0.16*b,0.14*b);
      if(ripe)for(const bx of [-0.2,0.02,0.22]){for(let row=0;row<4;row++){const n=4-row;for(let k=0;k<n;k++){const a=k/n*6.283+row;fruit.push(PG(ICO,LT(k%3===2?0x5a2a8a:C.col,0.2),DK(k%3===2?0x5a2a8a:C.col,0.2),bx+Math.cos(a)*0.024*n,0.74-row*0.085,Math.sin(a)*0.024*n+0.07,0,0,0,0.085,0.085,0.085));}}
        fruit.push(P(LEAF0,0xffffff,bx+0.03,0.74,0.1,0,0,0,0.03,0.03,0.03));}break;}
    case'peach':trunkP(leaf,R,0x7a5230,0.62*b,0.07);canopy(leaf,R,[0x7cc050,0x5f9e3a,0x467e2c],0,0.9*b,0,0.34*b);
      if(ripe)for(const [x,y,z] of [[0.32,0.72,0.12],[-0.3,0.8,0.14],[0.06,0.66,0.36],[-0.1,0.86,-0.34],[0.24,0.96,-0.2]])fruit.push(P(ICO2,C.col,x,y,z,0,0,0,0.17,0.17,0.17),P(ICO2,0xe8604a,x+0.04,y+0.02,z+0.05,0,0,0,0.1,0.1,0.1),P(LEAF0,0xffffff,x+0.05,y+0.06,z+0.05,0,0,0,0.035,0.03,0.03));break;
    case'dragonfruit':{const cc=[0x5aa84a,0x4a9040];leaf.push(P(CYL6,cc[0],0,0.3*b,0,0,0,0,0.13,0.6*b,0.13));
      for(let i=0;i<3;i++){const a=i*2.1+R(),x=Math.sin(a)*0.16,z=Math.cos(a)*0.16;leaf.push(P(CYL6,cc[i%2],x*0.6,0.3*b,z*0.6,Math.cos(a)*0.9,0,-Math.sin(a)*0.9,0.09,0.3*b,0.09),P(CYL6,cc[(i+1)%2],x*1.4,0.52*b,z*1.4,0,0,0,0.09,0.36*b,0.09));
        for(let k=0;k<3;k++)leaf.push(P(CONE4,0xf6f0d0,x*1.4+0.04,(0.38+k*0.1)*b,z*1.4,0,k,1.57,0.02,0.05,0.02));
        if(ripe){const fy=0.76*b;fruit.push(P(ICO2,C.col,x*1.4,fy,z*1.4,0,0,0,0.17,0.2,0.17));for(let k=0;k<5;k++)lf(fruit,0x8ad050,x*1.4,fy-0.02,z*1.4,k/5*6.283,0.9,0.1,0.05,0.02);}
        else if(stage===2)bloom(leaf,0xfff8e8,0xf6d04a,x*1.4,0.74*b,z*1.4,0.09,6,0.9);}break;}
    case'starfruit':trunkP(leaf,R,0x7a5230,0.62*b,0.07);canopy(leaf,R,[0x9ad060,0x6aac40,0x3e7a2c],0,0.95*b,0,0.34*b);
      if(ripe)for(const [x,y,z] of [[0.32,0.74,0.14],[-0.3,0.8,0.16],[0.06,0.66,0.38],[-0.12,0.9,-0.34],[0.26,0.98,-0.2]])fruit.push(PG(OCT,LT(C.col,0.2),DK(C.col,0.2),x,y,z,0,x*5,0.4,0.2,0.26,0.16),P(LEAF0,0xffffff,x+0.04,y+0.05,z+0.05,0,0,0,0.04,0.03,0.03));break;
  }
  return{leaf,fruit};
}
const cropRoot=new T.Group();scene.add(cropRoot);
const cropMeshes=new Map();
/* All ordinary crop meshes are baked into one batched mesh (one draw call for the whole farm); they sway in its vertex
   shader around their own base (aSway = base x, base y, phase). Only special-material parts (rare variants) stay as
   their own meshes in each crop's group. flushCrops rebuilds the batch at most once a frame. */
const cropBatchMat=toon({vertexColors:true});
cropBatchMat.onBeforeCompile=sh=>{sh.uniforms.uTime=grassU.uTime;sh.vertexShader='uniform float uTime;attribute vec3 aSway;\n'+sh.vertexShader.replace('#include <begin_vertex>',
  '#include <begin_vertex>\n  transformed.x+=(transformed.y-aSway.y)*sin(uTime*1.6+aSway.z)*0.035;');};
let cropBatch={},cropDirty=false;
// the batch materials for rare fruit: the variant's own look, swaying with the rest (colours shared, so the prismatic
// shimmer and the moonlit glow still animate)
const VBM={};for(const v in VMAT){const m=VMAT[v].clone();m.color=VMAT[v].color;m.emissive=VMAT[v].emissive;m.onBeforeCompile=cropBatchMat.onBeforeCompile;VBM[v]=m;}
function flushCrops(){if(!cropDirty)return;cropDirty=false;
  for(const k in cropBatch){cropRoot.remove(cropBatch[k]);cropBatch[k].geometry.dispose();}cropBatch={};
  for(const key of ['base',...Object.keys(VMAT)]){let n=0;for(const e of cropMeshes.values())if(e.bake&&e.bake[key])n+=e.bake[key].n;if(!n)continue;
    const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),sw=new Float32Array(n*3);let o=0;
    for(const e of cropMeshes.values()){const B=e.bake&&e.bake[key];if(!B)continue;pos.set(B.pos,o*3);nor.set(B.nor,o*3);col.set(B.col,o*3);for(let i=0;i<B.n;i++){sw[(o+i)*3]=B.px;sw[(o+i)*3+1]=B.py;sw[(o+i)*3+2]=B.ph;}o+=B.n;}
    const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(pos,3));bg.setAttribute('normal',new T.BufferAttribute(nor,3));bg.setAttribute('color',new T.BufferAttribute(col,3));bg.setAttribute('aSway',new T.BufferAttribute(sw,3));
    const m=new T.Mesh(bg,key==='base'?cropBatchMat:VBM[key]);m.castShadow=m.receiveShadow=true;m.frustumCulled=false;cropRoot.add(m);cropBatch[key]=m;}}
// move a crop group's plain meshes into its bake (world-space arrays) for the batch
function bakeCrop(e){const g=e.g;g.updateMatrixWorld(true);e.bake={};
  // plain parts go in the main batch; a rare harvest's fruit (golden, crystal…) goes in its variant's batch
  for(const key of ['base',...Object.keys(VMAT)]){const mat=key==='base'?vcMat:VMAT[key];const parts=g.children.filter(c=>c.isMesh&&c.material===mat&&!c.geometry.index);if(!parts.length)continue;
    let n=0;for(const c of parts)n+=c.geometry.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
    for(const c of parts){const G=c.geometry,g2=G.clone();g2.applyMatrix4(c.matrixWorld);pos.set(g2.attributes.position.array,o*3);nor.set(g2.attributes.normal.array,o*3);if(G.attributes.color)col.set(G.attributes.color.array,o*3);else col.fill(1,o*3,(o+G.attributes.position.count)*3);o+=G.attributes.position.count;g2.dispose();G.dispose();g.remove(c);}
    e.bake[key]={n,pos,nor,col,px:g.position.x,py:g.position.y,ph:g.userData.ph};}}
function syncCrop(k){
  const old=cropMeshes.get(k);if(old){cropRoot.remove(old.g);old.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});cropMeshes.delete(k);cropDirty=true;}
  const t=S.tiles[k];if(!t||!t.crop)return;const c=t.crop;
  const [x,z]=k.split(',').map(Number);const st=stageOf(c.p);
  const {leaf,fruit}=cropParts(c.t,st,x*73856093^z*19349663);const g=new T.Group();
  if(leaf.length)g.add(M(leaf));
  if(fruit.length){const v=c.v&&c.v!=='normal'&&c.v!=='giant'?c.v:null;g.add(M(fruit,v?VMAT[v]:vcMat));}
  g.scale.setScalar(st===3&&c.v==='giant'?1.3:0.95);
  g.position.set(x,topY(x,z)+0.06,z);g.rotation.y=CROPS[c.t].kind==='flower'?cam.yaw:hash(x,z)*6.28;
  g.userData.tile={x,z};g.userData.ph=hash(z,x)*6;
  cropRoot.add(g);const e={g,s:st,v:c.v};cropMeshes.set(k,e);bakeCrop(e);cropDirty=true;
}
function syncAllCrops(){for(const k of [...cropMeshes.keys()])syncCrop(k);for(const k in S.tiles)syncCrop(k);flushCrops();}

