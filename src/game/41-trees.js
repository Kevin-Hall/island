// a leaf card: a flattened four-sided blade from (x,y,z) along direction d, dark at its base and light at its tip
const lerpHex=(a,b,t)=>_a.set(a).lerp(_b.set(b),t).getHex();
const LEAF_CARD=new T.SphereGeometry(0.5,6,3); // a rounded, low-poly leaf blade (36 triangles)
function card(p,x,y,z,d,len,wid,cTip,cBase){const tilt=Math.acos(clamp(d[1],-1,1)),ry=Math.atan2(d[0],d[2]);
  p.push(PG(LEAF_CARD,cTip,cBase,x+d[0]*len/2,y+d[1]*len/2,z+d[2]*len/2,tilt,ry,0,wid,len,wid*0.3));}
// a round canopy shingled with leaf cards that droop outward; tips lighten toward the top, like Animal Crossing's trees
function canopy(p,R,cols,cx,cy,cz,rad){const Rr=rad*1.55;p.push(P(ICO2,cols[2],cx,cy,cz,0,R()*3,0,Rr*1.3,Rr*1.1,Rr*1.3));
  const N=Math.round(30+Rr*26),ga=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<N;i++){const yy=1-(i+0.5)/N*1.8;if(yy<-0.7)continue;const r=Math.sqrt(Math.max(0,1-yy*yy)),a=i*ga+R()*0.2,dx=Math.cos(a)*r,dz=Math.sin(a)*r;
    // each leaf hangs outward-and-down from a point on the canopy's surface
    const hx=dx*0.6,hy=-1+yy*0.25,hz=dz*0.6,hl=Math.hypot(hx,hy,hz),d=[-hx/hl,-hy/hl,-hz/hl],h=(yy+1)/2;
    const len=Rr*(0.52+R()*0.1),sx=cx+dx*Rr*0.78,sy=cy+yy*Rr*0.66+0.1*Rr,sz=cz+dz*Rr*0.78;card(p,sx+d[0]*len*0.25,sy+d[1]*len*0.25,sz+d[2]*len*0.25,[hx/hl,hy/hl,hz/hl],len,Rr*0.5,lerpHex(cols[1],cols[0],0.35+h*0.65),lerpHex(cols[2],cols[1],h*0.5));}}
function trunkP(p,R,col,h,w=0.13,dk){p.push(P(TRUNK,col,0,(h+0.45)/2,0,0,R()*3,0,w*2,h+0.45,w*2),P(CYL8,col,0,h+0.3,0,0,0,0,w*1.5,0.3,w*1.5));
  for(let i=0;i<4;i++){const a=i/4*6.283+R();p.push(P(CYL6,dk||col,Math.cos(a)*w*1.1,0.05,Math.sin(a)*w*1.1,Math.sin(a)*0.9,0,-Math.cos(a)*0.9,0.07,0.24,0.07));}
  for(let i=0;i<3;i++){const a=i/3*6.283+R(),y=h*(0.62+R()*0.25);p.push(P(CYL6,col,Math.cos(a)*0.16,y+0.1,Math.sin(a)*0.16,Math.sin(a)*0.8,0,-Math.cos(a)*0.8,0.06,0.42,0.06));}
  for(let i=0;i<3;i++)p.push(P(BOX,dk||col,Math.cos(i*2.1)*w*0.95,0.2+i*0.18,Math.sin(i*2.1)*w*0.95,0,i*2.1,0,0.03,0.12,0.03));}
const PALMS=['palm','palmtall','palmfan','palmtwin'];
// beach tiles a palm can stand on: flat sand (not the slope into the water), spread a few tiles apart
function palmSpots(isl,R,n,ok){const out=[];for(const [x,z] of shuffle(isl.sand.slice(),R)){if(out.length>=n)break;const c=SAND_CH.get(K(x,z));if(!c||Math.min(...c)<0.17||!ok(x,z))continue;
  if(out.some(([a,b])=>Math.abs(a-x)+Math.abs(b-z)<3))continue;out.push([x,z]);}return out;}
// a palm: a segmented trunk leaning along x, fronds of drooping leaflets shaded dark at the stem to light at the tip, optional coconuts
function palmParts(p,R,{n,lean,fronds,flen,cols,nuts,pitch=0.45,ox=0,trunk=[0xa8844a,0x94703e]}){let tx=ox,ty=0;
  for(let i=0;i<n;i++){const u=i/Math.max(1,n-1);tx=ox+lean*u*u*n*0.14;ty=0.1+i*0.22;p.push(P(CYL12,trunk[i%2],tx,ty,0,0,i*0.4,-lean*0.5*u,0.2-u*0.05,0.24,0.2-u*0.05),P(CYL12,0x7a5a34,tx,ty+0.11,0,0,0,-lean*0.5*u,0.22-u*0.05,0.03,0.22-u*0.05));}
  ty+=0.14;
  for(let i=0;i<fronds;i++){const a=i/fronds*6.283+R()*0.3;let fx=tx,fy=ty,fz=0,pt=pitch+R()*0.3;
    for(let k=0;k<flen;k++){const L=0.19,c=lerpHex(cols[0],cols[1],k/(flen-1)),nx=fx+Math.sin(a)*Math.cos(pt)*L,ny=fy+Math.sin(pt)*L,nz=fz+Math.cos(a)*Math.cos(pt)*L;
      const mx=(fx+nx)/2,my=(fy+ny)/2,mz=(fz+nz)/2;p.push(P(BOX,lerpHex(0x3a7a2e,cols[0],0.5),mx,my,mz,-pt,a,0,0.045,0.035,L+0.02));
      const w=0.3*(1-k/(flen+2));for(const sd of [-1,1])lf(p,c,mx+Math.cos(a)*sd*0.02,my-0.01,mz-Math.sin(a)*sd*0.02,a+sd*1.05,-0.3,w,0.11,0.03);
      fx=nx;fy=ny;fz=nz;pt-=0.24;}}
  for(let i=0;i<nuts;i++){const a=i*2.1;p.push(P(ICO2,0x6a4428,tx+Math.cos(a)*0.12,ty-0.14,Math.sin(a)*0.12,0,0,0,0.18,0.2,0.18));}}
function treeParts(kind,R,colRock){
  const p=[];
  switch(kind){
    case'oak':trunkP(p,R,0x7a5230,0.9,0.13,0x5e3e24);canopy(p,R,[0x7cc050,0x5f9e3a,0x467e2c],0,1.3,0,0.55,11,0.62);
      if(R()<0.4)for(let i=0;i<5;i++){const a=R()*6.28;p.push(P(ICO2,0xe8453a,Math.cos(a)*0.62,1.05+R()*0.4,Math.sin(a)*0.62,0,0,0,0.1,0.1,0.1));}break;
    case'maple':case'mapleR':{const c=kind==='maple'?[0xf4a444,0xe8803a,0xc85e24]:[0xec6a4a,0xc8402a,0x982a22];
      trunkP(p,R,0x6a4428,0.9,0.12,0x4e3020);canopy(p,R,c,0,1.3,0,0.55,11,0.6);
      for(let i=0;i<5;i++)lf(p,c[i%3],(R()-0.5)*1.4,0.02,(R()-0.5)*1.4,R()*6.28,0,0.13,0.1,0.02);break;}
    case'pine':case'snowpine':{const sn=kind==='snowpine',tip=sn?0xeef6fb:0x86cc6c,mid=sn?0x7aa898:0x4a9448,base=sn?0x2f5a4c:0x1f5230;
      p.push(P(TRUNK,0x8a5a36,0,0.55,0,0,0,0,0.3,1.1,0.3));for(let i=0;i<4;i++){const a=i*1.7+R();p.push(P(ICO2,0xc8905a,Math.cos(a)*0.12,0.3+i*0.14,Math.sin(a)*0.12,0,a,0,0.06,0.08,0.04));}
      // tiers of drooping leaf cards around a dark core, tips lightest — like the pines in Pocket Camp / New Leaf
      for(let i=0;i<6;i++){const t=i/5,y=0.8+i*0.36,rad=1.1-t*0.74;p.push(P(CONE12,base,0,y+0.14,0,0,R(),0,rad*1.45,0.62,rad*1.45));
        const n=Math.round(15-t*8);for(let k=0;k<n;k++){const a=k/n*6.283+i*0.41+R()*0.12,tl=2.0+R()*0.18,d=[Math.sin(a)*Math.sin(tl),Math.cos(tl),Math.cos(a)*Math.sin(tl)];
          card(p,Math.sin(a)*rad*0.2,y+0.42,Math.cos(a)*rad*0.2,d,rad*0.95+0.18,0.34-t*0.1,k%2?tip:lerpHex(tip,mid,0.35),base);}}
      for(let k=0;k<5;k++){const a=k/5*6.283,d=[Math.sin(a)*0.5,0.86,Math.cos(a)*0.5];card(p,0,2.72,0,d,0.34,0.14,tip,mid);}break;}
    case'palm':palmParts(p,R,{n:9,lean:(R()-0.5)*0.6,fronds:8,flen:6,cols:[0x3f8a34,0x7cc453],nuts:3});break;
    case'palmtall':palmParts(p,R,{n:13,lean:(R()<0.5?-1:1)*(0.55+R()*0.3),fronds:9,flen:7,cols:[0x4a9a3a,0x96d864],nuts:2});break;
    case'palmfan':palmParts(p,R,{n:4,lean:0,fronds:12,flen:5,pitch:0.95,cols:[0x2f7a3a,0x6ab85a],nuts:0,trunk:[0x8a6a3e,0x7a5a34]});break;
    case'palmtwin':palmParts(p,R,{n:8,lean:-0.5,fronds:7,flen:6,cols:[0x3f8a34,0x7cc453],nuts:2,ox:-0.12});palmParts(p,R,{n:11,lean:0.55,fronds:8,flen:6,cols:[0x4a9a3a,0x88cc5a],nuts:0,ox:0.12});break;
    case'bush':canopy(p,R,[0x8ad060,0x5aa040,0x2e6a2a],0,0.3,0,0.2);if(R()<0.5)for(let i=0;i<5;i++){const a=R()*6.28;bloom(p,0xffffff,0xf6d04a,Math.sin(a)*0.3,0.42+R()*0.12,Math.cos(a)*0.3,0.07);}break;
    case'flowerbed':wildflowers(p,R,[0xf7f2e8,0xf2a6c8,0xf6d04a,0xb8a8f2],9,0.36);for(let i=0;i<10;i++)lf(p,GREENS[i%4],(R()-0.5)*0.6,0.02,(R()-0.5)*0.6,R()*6.28,0.35,0.16,0.07);break;
    case'rockM':rockP(p,R,colRock,0.85);p.push(P(ICO2,0x5a8a44,0,0.36,0,0,R()*3,0,0.52,0.12,0.44),P(ICO2,0x6a9a4a,0.1,0.38,0.08,0,0,0,0.3,0.1,0.26));for(let i=0;i<6;i++)lf(p,GREENS[i%4],(R()-0.5)*0.4,0.38,(R()-0.5)*0.3,R()*6.28,0.4,0.12,0.06);break;
    case'rock':rockP(p,R,colRock,0.75);break;
    case'ice':p.push(P(OCT,0xc8ecff,0,0.55,0,0,R()*3,0.1,0.4,1.1,0.4),P(OCT,0xe8f8ff,0.22,0.35,0.1,0,R()*3,-0.3,0.26,0.7,0.26),P(OCT,0xb0e0f8,-0.2,0.28,-0.08,0,R()*3,0.4,0.2,0.56,0.2),P(OCT,0xdaf4ff,0.05,0.18,0.24,0,R()*3,-0.6,0.14,0.36,0.14));break;
    case'dead':{p.push(P(TRUNK,0x3a3036,0,0.6,0,0,0,0,0.2,1.2,0.2));const br=(x,y,z,rz,ry,l,w)=>p.push(P(CYL6,0x3a3036,x,y,z,0,ry,rz,w,l,w));
      br(0.2,1.0,0,-0.8,0,0.55,0.08);br(-0.15,0.8,0.05,0.9,0.4,0.45,0.07);br(0.38,1.24,0,-0.2,0,0.3,0.05);br(-0.32,1.0,0.1,0.3,0.2,0.26,0.04);br(0.05,1.3,-0.1,0.5,1.2,0.35,0.05);break;}
    case'basalt':for(let i=0;i<5;i++){const h=0.4+R()*0.9,x=(R()-0.5)*0.55,z=(R()-0.5)*0.55;p.push(P(CYL6,i%2?0x2e2830:0x3a3440,x,h/2,z,0,R(),0,0.3,h,0.3),P(CYL6,0x4a4450,x,h+0.01,z,0,0,0,0.26,0.03,0.26));}break;
    case'willow':trunkP(p,R,0x4a3a2a,0.95,0.14,0x3a2e22);canopy(p,R,[0x6a8a4a,0x4a6a3a,0x3a5a30],0,1.2,0,0.5,9,0.55);
      for(let i=0;i<14;i++){const a=i/14*6.283+R()*0.2,r=0.55+R()*0.12;for(let k=0;k<4;k++)lf(p,k%2?0x5a7a44:0x44643a,Math.sin(a)*(r+k*0.02),1.05-k*0.2,Math.cos(a)*(r+k*0.02),a,-1.45,0.24,0.07,0.025);}break;
    case'reeds':for(let i=0;i<8;i++){const x=(R()-0.5)*0.6,z=(R()-0.5)*0.6,h=0.5+R()*0.35;p.push(P(CYL6,0x6a8a3a,x,h/2,z,0,0,(R()-0.5)*0.15,0.04,h,0.04),P(CYL12,0x7a4a2a,x,h-0.06,z,0,0,0,0.09,0.2,0.09),P(CONE4,0x6a8a3a,x,h+0.08,z,0,0,0,0.02,0.12,0.02));
      lf(p,0x5a8a34,x,0.05,z,R()*6.28,1.1,h*0.7,0.05,0.02);}break;
  }
  return p;
}
function rockP(p,R,col,s){const c2=new T.Color(col).multiplyScalar(0.86).getHex(),c3=new T.Color(col).lerp(new T.Color(0xffffff),0.18).getHex();
  p.push(P(ICO,col,0,0.17*s,0,R(),R()*3,R()*0.3,0.8*s,0.5*s,0.68*s),P(ICO,c3,0.05*s,0.3*s,-0.02,R(),R()*3,0,0.52*s,0.24*s,0.46*s),P(ICO,c2,0.3*s,0.1*s,0.18*s,R(),R()*3,0,0.4*s,0.3*s,0.38*s));
  for(let i=0;i<4;i++){const a=R()*6.28;p.push(P(ICO,i%2?c2:col,Math.cos(a)*0.45*s,0.03,Math.sin(a)*0.45*s,R(),R(),R(),0.12,0.08,0.1));}}
function vnoise(x,z,seed){const X=Math.floor(x/3),Z=Math.floor(z/3),fx=x/3-X,fz=z/3-Z,o=seed%997;const h=(a,b)=>hash(a*1.7+o,b*2.3-o);
  const sx=fx*fx*(3-2*fx),sz=fz*fz*(3-2*fz);return lerp(lerp(h(X,Z),h(X+1,Z),sx),lerp(h(X,Z+1),h(X+1,Z+1),sx),sz);}
function levelOf(isl,x,z){
  if(isl.home){if(farmQ(x,z)<1.2)return 0;const n=vnoise(x,z,S.worldSeed|0),hx=hash(S.worldSeed%97,3)<0.5?-9:9;
    if(z<-0.66*TOWN_D+n*2.4&&Math.abs(x-hx*TOWN_W/16)<6+n*2.5)return 2;return z<-0.29*TOWN_D+(n-0.5)*3.6?1:0;}
  if(isl.biome==='swamp')return 0;
  if(isl.biome==='volcano'&&Math.hypot(x-isl.cx,z-isl.cz)<3.2)return 0;
  const d=islDist(isl,x,z),R=isl.r,n=vnoise(x,z,isl.seed);let l=0;
  if(d<R*0.62&&n>0.45)l=1;if(R>6.4&&d<R*0.36&&n>0.52)l=2;if(R>9.5&&d<R*0.3&&n>0.5)l=3;if(R>9.5&&l===0&&d<R*0.5&&n>0.62)l=1;return l;}
const GRASS_SLAB=new T.BoxGeometry(1,0.14,1);
