// a leaf card: a flattened four-sided blade from (x,y,z) along direction d, dark at its base and light at its tip
const lerpHex=(a,b,t)=>_a.set(a).lerp(_b.set(b),t).getHex();
const LEAF_CARD=new T.SphereGeometry(0.5,6,3),LEAF_CARD_LO=new T.SphereGeometry(0.5,4,2); // a rounded, low-poly leaf blade (36 triangles)
function card(p,x,y,z,d,len,wid,cTip,cBase){const tilt=Math.acos(clamp(d[1],-1,1)),ry=Math.atan2(d[0],d[2]);
  p.push(PG(LEAF_CARD,cTip,cBase,x+d[0]*len/2,y+d[1]*len/2,z+d[2]*len/2,tilt,ry,0,wid,len,wid*0.3));}
// a round canopy shingled with leaf cards that droop outward; tips lighten toward the top, like Animal Crossing's trees
// a tree crown in the style of pixel-art foliage: a dark core (the shadowed inside of the crown), rings of rounded leaf
// clumps each lit on top and dark underneath, a bright crown, light leaf highlights on top and a jagged fringe of leaves
// under the rim. cols = [light, mid, dark]; nn scales the leaf detail (bushes pass fewer)
function canopy(p,R,cols,cx,cy,cz,rad,nn){const Rr=rad*1.55,[L,Mc,Dk]=cols,hl=lerpHex(L,0xfff6c0,0.22),sh=lerpHex(Dk,0x0a1a16,0.4),q=(nn||44)/44;
  p.push(PG(ICO2,Mc,sh,cx,cy-Rr*0.08,cz,0,R()*3,0,Rr*1.6,Rr*1.25,Rr*1.6));
  const ring=(n,rr,y,s,top,bot,geo=ICO2)=>{const a0=R()*6.28;for(let i=0;i<n;i++){const a=a0+i/n*6.283+(R()-0.5)*0.45,sz=Rr*s*(0.85+R()*0.3);
    p.push(PG(geo,top,bot,cx+Math.cos(a)*Rr*rr,cy+Rr*y+(R()-0.5)*Rr*0.14,cz+Math.sin(a)*Rr*rr,0,R()*3,0,sz,sz*0.84,sz));}};
  const r0=p.length;ring(6,0.7,-0.2,0.86,lerpHex(L,Mc,0.45),Dk,ICO);for(let i=r0+1;i<p.length;i+=2)p[i].lo='drop';ring(4,0.38,0.24,0.84,lerpHex(L,Mc,0.15),lerpHex(Mc,Dk,0.3));
  p.push(PG(ICO2,L,Mc,cx+(R()-0.5)*Rr*0.2,cy+Rr*0.55,cz+(R()-0.5)*Rr*0.2,0,R()*3,0,Rr*0.86,Rr*0.66,Rr*0.86));
  // light leaf highlights catching the sun on top
  for(let i=0,n=Math.round(9*q);i<n;i++){const a=R()*6.28,r=Rr*(0.2+R()*0.5),y=cy+Rr*(0.62-r/Rr*0.55);
    p.push(Object.assign(P(LEAF0,hl,cx+Math.cos(a)*r,y,cz+Math.sin(a)*r,0,a,0,Rr*0.3,Rr*0.1,Rr*0.22),{lo:'drop'}));}
  // the ragged underside: leaves hanging out and down from the rim
  for(let i=0,n=Math.round(12*q);i<n;i++){const a=i/n*6.283+R()*0.3,r=Rr*(0.95+R()*0.12);
    card(p,cx+Math.cos(a)*r*0.9,cy-Rr*0.32+(R()-0.5)*Rr*0.1,cz+Math.sin(a)*r*0.9,[Math.cos(a)*0.7,-0.7,Math.sin(a)*0.7],Rr*0.36,Rr*0.26,Mc,Dk);}}
// a dense, lumpy bush: one tall leafy mound with three lower lobes around it, lit on top (s scales it, q thins the leaves; returns the top height)
function bushClump(p,R,cols,s=1,q=1){const [L,Mc,Dk]=cols,sh=lerpHex(Dk,0x0a1a16,0.4);
  // a rounded mound: dark core, four side clumps and a sunlit top, then a crown of leaf tufts and a ragged skirt
  p.push(PG(ICO2,Mc,sh,0,0.26*s,0,0,R()*3,0,0.8*s,0.56*s,0.8*s));
  const a0=R()*6.283;for(let i=0;i<4;i++){const a=a0+i*1.571+(R()-0.5)*0.4,sz=(0.4+R()*0.08)*s;p.push(PG(ICO,lerpHex(L,Mc,0.4),Dk,Math.cos(a)*0.22*s,(0.22+R()*0.05)*s,Math.sin(a)*0.22*s,0,R()*3,0,sz,sz*0.82,sz));}
  p.push(PG(ICO2,L,Mc,0,0.42*s,0,0,R()*3,0,0.52*s,0.4*s,0.52*s));
  for(let i=0,n=Math.round(7*q);i<n;i++){const a=i/n*6.283+R()*0.4;card(p,Math.cos(a)*0.1*s,0.55*s,Math.sin(a)*0.1*s,[Math.cos(a)*0.55,0.83,Math.sin(a)*0.55],0.2*s,0.14*s,lerpHex(L,0xfff6c0,0.2),Mc);}
  for(let i=0,n=Math.round(8*q);i<n;i++){const a=i/n*6.283+R()*0.3;card(p,Math.cos(a)*0.36*s,0.14*s,Math.sin(a)*0.36*s,[Math.cos(a)*0.75,-0.65,Math.sin(a)*0.75],0.2*s,0.15*s,Mc,Dk);}
  return 0.55*s;}
function trunkP(p,R,col,h,w=0.13,dk){p.push(P(TRUNK,col,0,(h+0.45)/2,0,0,R()*3,0,w*2,h+0.45,w*2),P(CYL8,col,0,h+0.3,0,0,0,0,w*1.5,0.3,w*1.5));
  for(let i=0;i<4;i++){const a=i/4*6.283+R();p.push(P(CYL6,dk||col,Math.cos(a)*w*1.1,0.05,Math.sin(a)*w*1.1,Math.sin(a)*0.9,0,-Math.cos(a)*0.9,0.07,0.24,0.07));}
  for(let i=0;i<3;i++){const a=i/3*6.283+R(),y=h*(0.62+R()*0.25);p.push(Object.assign(P(CYL6,col,Math.cos(a)*0.16,y+0.1,Math.sin(a)*0.16,Math.sin(a)*0.8,0,-Math.cos(a)*0.8,0.06,0.42,0.06),{lo:'drop'}));}
  for(let i=0;i<3;i++)p.push(Object.assign(P(BOX,dk||col,Math.cos(i*2.1)*w*0.95,0.2+i*0.18,Math.sin(i*2.1)*w*0.95,0,i*2.1,0,0.03,0.12,0.03),{lo:'drop'}));}
const PALMS=['palm','palmtall','palmfan','palmtwin'];
// the far-away version of a batch of tree parts: a third of the leaf cards and palm leaflets (a bit bigger, so the silhouette holds)
function lowParts(parts){let n=0,m=0;const out=[];for(const p of parts){
  if(p.lo==='drop')continue;if(p.geo===ICO2&&p.c2!==undefined){out.push(Object.assign({},p,{geo:ICO}));continue;}if(p.lo==='wide'){out.push(Object.assign({},p,{geo:LEAF_CARD_LO,sx:p.sx*1.8}));continue;}/* palm fronds: keep every main blade, wider, drop the side blades */
  if(p.geo===LEAF_CARD){if(n++%3)continue;out.push(Object.assign({},p,{geo:LEAF_CARD_LO,sx:p.sx*1.4,sy:p.sy*1.15,sz:p.sz*1.4}));}
  else if(p.geo===LEAF0&&p.sx<0.16){if(m++%3)continue;out.push(Object.assign({},p,{sx:p.sx*1.7}));}
  else if(p.geo===BOX&&p.sx<0.06&&p.sz>0.1){if(m++%2)continue;out.push(Object.assign({},p,{sz:p.sz*2}));}/* palm frond stems: every other, doubled */
  else out.push(p);}return out;}
// adds an island's trees as a detailed mesh plus a light one; cullIslands shows one or the other by viewing distance
function addVeg(isl,g,parts){if(!parts.length)return;const hi=M(parts),lo=M(lowParts(parts));lo.visible=false;g.add(hi,lo);(isl.veg||(isl.veg=[])).push([hi,lo]);}
// beach tiles a palm can stand on: flat sand (not the slope into the water), spread a few tiles apart
function palmSpots(isl,R,n,ok){const out=[];for(const [x,z] of shuffle(isl.sand.slice(),R)){if(out.length>=n)break;const c=SAND_CH.get(K(x,z));if(!c||Math.min(...c)<0.17||!ok(x,z))continue;
  if(out.some(([a,b])=>Math.abs(a-x)+Math.abs(b-z)<3))continue;out.push([x,z]);}return out;}
// a palm, Animal Crossing style: a fat ringed trunk bending along a gentle curve, and broad drooping fronds built from
// leaf cards (dark at the stem, light at the tip) with side blades that give the frond a serrated, feathery edge
function palmParts(p,R,{n,lean,fronds,seg=4,flen=0.34,wid=0.34,cols,nuts,pitch=0.55,droop=0.3,spread=0.5,ox=0,trunk=[0xb08a52,0x967040]}){
  const H=0.22;let tx=ox,ty=0;p.push(P(ICO2,lerpHex(trunk[1],0x5a3a22,0.25),ox,0.04,0,0,0,0,0.36,0.14,0.36));
  for(let i=0;i<n;i++){const u=(i+0.5)/n,r=0.27-u*0.11,rz=-Math.atan(lean*1.27*u);tx=ox+lean*u*u*n*0.14;ty=0.1+i*H;
    p.push(P(CYL12,trunk[i%2],tx,ty,0,0,i*0.7,rz,r,H*1.04,r),P(CYL12,lerpHex(trunk[1],0x5a3a22,0.4),tx,ty+H/2-0.015,0,0,0,rz,r*1.1,0.035,r*1.1));}
  ty+=H/2;p.push(P(ICO2,cols[0],tx,ty+0.06,0,0,0,0,0.34,0.24,0.34));
  for(let i=0;i<fronds;i++){const a=i/fronds*6.283+R()*0.25;let x=tx,y=ty+0.1,z=0,pt=pitch+R()*0.25;
    for(let k=0;k<seg;k++){const d=[Math.sin(a)*Math.cos(pt),Math.sin(pt),Math.cos(a)*Math.cos(pt)],w=wid*(k===0?0.7:k===seg-1?0.62:1),
        cb=lerpHex(cols[0],cols[1],k/seg),ct=lerpHex(cols[0],cols[1],(k+1)/seg);
      card(p,x,y,z,d,flen,w,ct,cb);p[p.length-1].lo='wide';
      if(k>0)for(const sd of [-1,1]){const b=a+sd*spread,q=pt-0.18,e=[Math.sin(b)*Math.cos(q),Math.sin(q),Math.cos(b)*Math.cos(q)];card(p,x,y,z,e,flen*0.8,w*0.55,lerpHex(ct,cols[0],0.15),cb);p[p.length-1].lo='drop';}
      x+=d[0]*flen*0.9;y+=d[1]*flen*0.9;z+=d[2]*flen*0.9;pt-=droop;}}
  for(let i=0;i<nuts;i++){const a=i*2.1+0.4,cx=tx+Math.cos(a)*0.13,cz=Math.sin(a)*0.13;p.push(P(ICO2,0x6a4428,cx,ty-0.02,cz,0,0,0,0.18,0.19,0.18),P(ICO,0x9a7448,cx-0.03,ty+0.02,cz+0.04,0,0,0,0.06,0.05,0.04));}}
function treeParts(kind,R,colRock){
  const p=[];
  switch(kind){
    case'oak':trunkP(p,R,0x7a5230,0.9,0.13,0x5e3e24);canopy(p,R,[0x6cb04a,0x4c8e3a,0x2f6a2c],0,1.3,0,0.55);
      if(R()<0.4)for(let i=0;i<5;i++){const a=R()*6.28;p.push(P(ICO2,0xe8453a,Math.cos(a)*0.62,1.05+R()*0.4,Math.sin(a)*0.62,0,0,0,0.1,0.1,0.1));}break;
    case'cherry':trunkP(p,R,0x6a4436,0.9,0.12,0x4e3228);canopy(p,R,[0xffd8e6,0xf4a8c4,0xd07a9a],0,1.3,0,0.55);
      for(let i=0;i<6;i++)lf(p,[0xf8c8d8,0xffe4ee][i%2],(R()-0.5)*1.5,0.02,(R()-0.5)*1.5,R()*6.28,0,0.1,0.08,0.02);break;
    case'maple':case'mapleR':{const c=kind==='maple'?[0xf4a444,0xe8803a,0xc85e24]:[0xec6a4a,0xc8402a,0x982a22];
      trunkP(p,R,0x6a4428,0.9,0.12,0x4e3020);canopy(p,R,c,0,1.3,0,0.55);
      for(let i=0;i<5;i++)lf(p,c[i%3],(R()-0.5)*1.4,0.02,(R()-0.5)*1.4,R()*6.28,0,0.13,0.1,0.02);break;}
    case'pine':case'snowpine':{const sn=kind==='snowpine',tip=0x8ad470,mid=0x3e9448,base=0x1a4a2c;
      p.push(PG(TRUNK,0x7a4e30,0x5a3622,0,0.45,0,0,0,0,0.3,0.9,0.3));for(let i=0;i<4;i++){const a=i*1.7+R();p.push(P(CYL6,0x6a4428,Math.cos(a)*0.14,0.06,Math.sin(a)*0.14,Math.sin(a)*1.1,0,-Math.cos(a)*1.1,0.07,0.26,0.07));}
      // stacked tiers, each dark at its skirt and lighter towards the top, with a scalloped edge and sunlit needle tufts
      for(let i=0;i<5;i++){const t=i/4,y=0.62+i*0.42,rad=1.08-t*0.72,h=0.78-t*0.16,top=lerpHex(mid,tip,0.25+t*0.5),bot=lerpHex(base,mid,t*0.35);
        p.push(PG(CONE12,top,bot,0,y+h/2,0,0,R(),0,rad*2,h,rad*2));
        const n=Math.round(12-t*5);for(let k=0;k<n;k++){const a=k/n*6.283+i*0.5+R()*0.15;card(p,Math.cos(a)*rad*0.78,y+0.06,Math.sin(a)*rad*0.78,[Math.cos(a)*0.62,-0.78,Math.sin(a)*0.62],rad*0.42,0.24-t*0.06,bot,lerpHex(base,0x0a1a16,0.3));}
        for(let k=0;k<Math.round(5-t*2);k++){const a=R()*6.28,r=rad*(0.3+R()*0.3);card(p,Math.cos(a)*r,y+h*(0.55-r/rad*0.45),Math.sin(a)*r,[Math.cos(a)*0.6,0.8,Math.sin(a)*0.6],0.2,0.12,lerpHex(tip,0xfff6c0,0.3),tip);}
        if(sn)p.push(PG(CONE12,0xffffff,0xd8e8f0,0,y+h*0.72,0,0,R(),0,rad*1.5,h*0.5,rad*1.5));}
      p.push(PG(CONE8,sn?0xffffff:lerpHex(tip,0xfff6c0,0.3),tip,0,2.72,0,0,0,0,0.3,0.42,0.3));break;}
    case'palm':palmParts(p,R,{n:9,lean:(R()-0.5)*0.6,fronds:8,cols:[0x2f7a34,0x8ad05a],nuts:3});break;
    case'palmtall':palmParts(p,R,{n:13,lean:(R()<0.5?-1:1)*(0.55+R()*0.3),fronds:9,flen:0.37,cols:[0x3a8a3a,0x9ade6a],nuts:2});break;
    case'palmfan':palmParts(p,R,{n:4,lean:0,fronds:11,seg:2,flen:0.44,wid:0.5,pitch:0.95,droop:0.35,spread:0.7,cols:[0x2a6e38,0x72c05a],nuts:0,trunk:[0x8a6a3e,0x7a5a34]});break;
    case'palmtwin':palmParts(p,R,{n:8,lean:-0.5,fronds:7,cols:[0x2f7a34,0x8ad05a],nuts:2,ox:-0.14});palmParts(p,R,{n:11,lean:0.55,fronds:8,cols:[0x3a8a3a,0x94d862],nuts:0,ox:0.14});break;
    case'bush':{const s=1.1+R()*0.2,top=bushClump(p,R,[0xa8e070,0x5aa040,0x2a5e28],s);if(R()<0.5){const bc=pickR2([0xffffff,0xf8b8c8,0xf6d04a],R);for(let i=0;i<6;i++){const a=R()*6.28,r=R()*0.3*s;bloom(p,bc,0xf6d04a,Math.sin(a)*r,top-0.04-r*0.35,Math.cos(a)*r,0.07);}}break;}
    case'flowerbed':wildflowers(p,R,[0xf7f2e8,0xf2a6c8,0xf6d04a,0xb8a8f2],9,0.36);for(let i=0;i<10;i++)lf(p,GREENS[i%4],(R()-0.5)*0.6,0.02,(R()-0.5)*0.6,R()*6.28,0.35,0.16,0.07);break;
    case'rockM':rockP(p,R,colRock,0.85);p.push(P(ICO2,0x5a8a44,0,0.36,0,0,R()*3,0,0.52,0.12,0.44),P(ICO2,0x6a9a4a,0.1,0.38,0.08,0,0,0,0.3,0.1,0.26));for(let i=0;i<6;i++)lf(p,GREENS[i%4],(R()-0.5)*0.4,0.38,(R()-0.5)*0.3,R()*6.28,0.4,0.12,0.06);break;
    case'rock':rockP(p,R,colRock,0.75);break;
    case'ice':p.push(P(OCT,0xc8ecff,0,0.55,0,0,R()*3,0.1,0.4,1.1,0.4),P(OCT,0xe8f8ff,0.22,0.35,0.1,0,R()*3,-0.3,0.26,0.7,0.26),P(OCT,0xb0e0f8,-0.2,0.28,-0.08,0,R()*3,0.4,0.2,0.56,0.2),P(OCT,0xdaf4ff,0.05,0.18,0.24,0,R()*3,-0.6,0.14,0.36,0.14));break;
    case'dead':{p.push(P(TRUNK,0x3a3036,0,0.6,0,0,0,0,0.2,1.2,0.2));const br=(x,y,z,rz,ry,l,w)=>p.push(P(CYL6,0x3a3036,x,y,z,0,ry,rz,w,l,w));
      br(0.2,1.0,0,-0.8,0,0.55,0.08);br(-0.15,0.8,0.05,0.9,0.4,0.45,0.07);br(0.38,1.24,0,-0.2,0,0.3,0.05);br(-0.32,1.0,0.1,0.3,0.2,0.26,0.04);br(0.05,1.3,-0.1,0.5,1.2,0.35,0.05);break;}
    case'basalt':for(let i=0;i<5;i++){const h=0.4+R()*0.9,x=(R()-0.5)*0.55,z=(R()-0.5)*0.55;p.push(P(CYL6,i%2?0x2e2830:0x3a3440,x,h/2,z,0,R(),0,0.3,h,0.3),P(CYL6,0x4a4450,x,h+0.01,z,0,0,0,0.26,0.03,0.26));}break;
    case'willow':trunkP(p,R,0x4a3a2a,0.95,0.14,0x3a2e22);canopy(p,R,[0x6a8a4a,0x4a6a3a,0x3a5a30],0,1.2,0,0.5);
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
    const cl=S.home&&S.home.cliff,c1=cl?cl[0]:0.29,two=cl?cl[1]:1; // a chosen island sets how far north its cliffs start, and whether there's a second tier
    if(two&&z<-(c1+0.37)*TOWN_D+n*2.4&&Math.abs(x-hx*TOWN_W/16)<6+n*2.5)return 2;return z<-c1*TOWN_D+(n-0.5)*3.6?1:0;}
  if(isl.biome==='swamp')return 0;
  if(isl.biome==='volcano'&&Math.hypot(x-isl.cx,z-isl.cz)<3.2)return 0;
  const d=islDist(isl,x,z),R=isl.r,n=vnoise(x,z,isl.seed);let l=0;
  if(d<R*0.62&&n>0.45)l=1;if(R>6.4&&d<R*0.36&&n>0.52)l=2;if(R>9.5&&d<R*0.3&&n>0.5)l=3;if(R>9.5&&l===0&&d<R*0.5&&n>0.62)l=1;return l;}
const GRASS_SLAB=new T.BoxGeometry(1,0.14,1);
