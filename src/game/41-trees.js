// canopy of many leafy puffs (lighter on top) with little leaves poking out for a fuzzy silhouette
function canopy(p,R,cols,cx,cy,cz,rad,n,puff){
  for(let i=0;i<n;i++){const a=i/n*6.283+R()*0.6,e=(R()-0.35)*1.3,r=rad*(0.55+R()*0.35);const x=cx+Math.cos(a)*Math.cos(e)*r,y=cy+Math.sin(e)*r*0.8,z=cz+Math.sin(a)*Math.cos(e)*r;
    const c=cols[y>cy+rad*0.25?0:y<cy-rad*0.15?2:1],sz=puff*(0.75+R()*0.5);p.push(P(ICO2,c,x,y,z,R(),R()*3,R(),sz,sz*0.85,sz));}
  p.push(P(ICO2,cols[1],cx,cy,cz,0,R()*3,0,rad*1.5,rad*1.25,rad*1.5));
  for(let i=0;i<n*3;i++){const a=R()*6.283,e=(R()-0.3)*1.2,r=rad*1.02;lf(p,cols[i%3],cx+Math.cos(a)*Math.cos(e)*r,cy+Math.sin(e)*r*0.85,cz+Math.sin(a)*Math.cos(e)*r,a+1.57,0.3+e*0.6,0.2,0.12,0.03);}}
function trunkP(p,R,col,h,w=0.13,dk){p.push(P(TRUNK,col,0,(h+0.45)/2,0,0,R()*3,0,w*2,h+0.45,w*2),P(CYL8,col,0,h+0.3,0,0,0,0,w*1.5,0.3,w*1.5));
  for(let i=0;i<4;i++){const a=i/4*6.283+R();p.push(P(CYL6,dk||col,Math.cos(a)*w*1.1,0.05,Math.sin(a)*w*1.1,Math.sin(a)*0.9,0,-Math.cos(a)*0.9,0.07,0.24,0.07));}
  for(let i=0;i<3;i++){const a=i/3*6.283+R(),y=h*(0.62+R()*0.25);p.push(P(CYL6,col,Math.cos(a)*0.16,y+0.1,Math.sin(a)*0.16,Math.sin(a)*0.8,0,-Math.cos(a)*0.8,0.06,0.42,0.06));}
  for(let i=0;i<3;i++)p.push(P(BOX,dk||col,Math.cos(i*2.1)*w*0.95,0.2+i*0.18,Math.sin(i*2.1)*w*0.95,0,i*2.1,0,0.03,0.12,0.03));}
function treeParts(kind,R,colRock){
  const p=[];
  switch(kind){
    case'oak':trunkP(p,R,0x7a5230,0.9,0.13,0x5e3e24);canopy(p,R,[0x7cc050,0x5f9e3a,0x467e2c],0,1.3,0,0.55,11,0.62);
      if(R()<0.4)for(let i=0;i<5;i++){const a=R()*6.28;p.push(P(ICO2,0xe8453a,Math.cos(a)*0.62,1.05+R()*0.4,Math.sin(a)*0.62,0,0,0,0.1,0.1,0.1));}break;
    case'maple':case'mapleR':{const c=kind==='maple'?[0xf4a444,0xe8803a,0xc85e24]:[0xec6a4a,0xc8402a,0x982a22];
      trunkP(p,R,0x6a4428,0.9,0.12,0x4e3020);canopy(p,R,c,0,1.3,0,0.55,11,0.6);
      for(let i=0;i<5;i++)lf(p,c[i%3],(R()-0.5)*1.4,0.02,(R()-0.5)*1.4,R()*6.28,0,0.13,0.1,0.02);break;}
    case'pine':case'snowpine':{p.push(P(TRUNK,0x6b4526,0,0.45,0,0,0,0,0.26,0.9,0.26));
      const sn=kind==='snowpine';
      for(let i=0;i<7;i++){const s=1.4-i*0.18,y=0.7+i*0.3,col=sn?(i%2?0x3a6a5a:0x2f5a4c):(i%2?0x2e5c2c:0x3a7034);
        p.push(P(CONE12,col,0,y,0,0,i*0.5+R()*0.3,0,s,0.62,s));
        for(let k=0;k<9;k++){const a=k/9*6.283+i*0.4+R()*0.3;p.push(P(CONE4,k%2?col:(sn?0x467a68:0x44803c),Math.cos(a)*s*0.45,y-0.24,Math.sin(a)*s*0.45,Math.sin(a)*1.15,0,-Math.cos(a)*1.15,0.14,0.3,0.1));}
        if(sn)p.push(P(CONE12,0xf4f8ff,0,y+0.1,0,0,i,0,s*0.75,0.38,s*0.75));}
      p.push(P(CONE12,sn?0xf4f8ff:0x44803c,0,2.85,0,0,0,0,0.3,0.4,0.3));break;}
    case'palm':{const lean=(R()-0.5)*0.6,N=9;let tx=0,ty=0;
      for(let i=0;i<N;i++){const u=i/N;tx=lean*u*u*1.3;ty=0.1+i*0.22;p.push(P(CYL12,i%2?0xa8844a:0x94703e,tx,ty,0,0,i*0.4,-lean*0.5*u,0.2-u*0.05,0.24,0.2-u*0.05),P(CYL12,0x7a5a34,tx,ty+0.11,0,0,0,-lean*0.5*u,0.22-u*0.05,0.03,0.22-u*0.05));}
      ty+=0.14;
      for(let i=0;i<8;i++){const a=i/8*6.283+R()*0.3,up=R()*0.3;let fx=tx,fy=ty,fz=0,pitch=0.45+up;
        for(let k=0;k<6;k++){const L=0.19,c=k%2?0x4f9a3a:0x5fae44;const nx=fx+Math.sin(a)*Math.cos(pitch)*L,ny=fy+Math.sin(pitch)*L,nz=fz+Math.cos(a)*Math.cos(pitch)*L;
          const mx=(fx+nx)/2,my=(fy+ny)/2,mz=(fz+nz)/2;p.push(P(BOX,0x4a8a34,mx,my,mz,-pitch,a,0,0.045,0.035,L+0.02));
          const w=0.3*(1-k/8);for(const sd of [-1,1])lf(p,c,mx+Math.cos(a)*sd*0.02,my-0.01,mz-Math.sin(a)*sd*0.02,a+sd*1.05,-0.3,w,0.11,0.03);
          fx=nx;fy=ny;fz=nz;pitch-=0.24;}}
      for(let i=0;i<3;i++){const a=i*2.1;p.push(P(ICO2,0x6a4428,tx+Math.cos(a)*0.12,ty-0.14,Math.sin(a)*0.12,0,0,0,0.18,0.2,0.18));}break;}
    case'bush':p.push(P(ICO2,0x4a8a34,0,0.25,0,0,R()*3,0,0.66,0.46,0.66));for(let i=0;i<30;i++){const a=R()*6.283,e=R()*1.1;lf(p,GREENS[i%4],Math.sin(a)*0.32*Math.cos(e),0.22+Math.sin(e)*0.22,Math.cos(a)*0.32*Math.cos(e),a,0.2+e*0.5,0.22,0.14);}
      if(R()<0.5)for(let i=0;i<5;i++){const a=R()*6.28;bloom(p,0xffffff,0xf6d04a,Math.sin(a)*0.3,0.32+R()*0.12,Math.cos(a)*0.3,0.07);}break;
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
