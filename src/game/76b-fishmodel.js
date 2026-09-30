/* =========================================================
   Fish in 3D: each species gets its own shape. The body is one smooth lofted surface (elliptical rings along its
   length, a slim tail stalk swelling to the belly and tapering to the snout), painted per vertex: a dark back, its
   colour on the flanks, a pale belly, and its markings (clownfish bands, koi patches, trout spots, a rainbow
   stripe, lantern lights…). Every fin is cut to follow the body's own outline where it meets it, so fins grow out of
   the fish instead of floating beside it. The shape comes from the name (tall angelfish, long pike, torpedo tuna,
   sharks, flatfish lying on their side, eels, puffers…) and the size. Models point +z (nose), up +y, about 2 × (0.32 +
   size × 0.1) long, as the old ones were (the museum and the leaping fish scale to that). Geometry is cached per species.
   ========================================================= */
const FISH_GEO=new Map();let FISH_ID=null;
const fsm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
function fishKind(id,F){if(F.junk)return'boot';const sp=F.spr;
  if(sp==='puffer')return id==='sunfish'?'sunfish':'puffer';if(sp==='squid'||sp==='jelly'||sp==='narwhal'||sp==='axo')return sp;if(sp==='octo')return/crab/.test(id)?'crab':'octo';
  if(sp==='ray')return/plaice|sole|flounder/.test(id)?'flat':'ray';if(sp==='eel')return'eel';if(/craw|crab|lobster/.test(id))return'crab';
  if(/hammer/.test(id))return'hammer';if(/whaleshark/.test(id))return'whale';if(/shark/.test(id))return'shark';if(/marlin|sword|sail/.test(id))return'bill';
  if(/tuna|mackerel|bonito|mahi|barracuda/.test(id))return'tuna';if(/flying/.test(id))return'flying';
  if(/angel|butterfly|tang|trigger|discus|moonfish|dawnbream|bream|bluegill|sunset/.test(id))return'tall';
  if(/pike|gar$|needle|oarfish|lantern|ayu|herring|anchovy|sardine|minnow|mullet|dace|icefish|goby|blenny|mudskipper/.test(id))return'long';
  if(/cat|bowfin|snakehead|coelacanth|grouper|cod|pollock|icecod/.test(id))return'heavy';return'fish';}
// the body: rings of (top height, belly depth, half-width, centre y, centre x) along t = 0 (tail) … 1 (nose)
function fishLoft(L,prof,color){const NZ=22,NR=16,pos=[],col=[],idx=[];const c=new T.Color();
  for(let i=0;i<=NZ;i++){const t=i/NZ,z=-L/2+t*L,[ht,hb,w,yc,xc]=prof(t);
    for(let j=0;j<NR;j++){const a=j/NR*6.2832,sa=Math.sin(a),ca=Math.cos(a);pos.push(xc+w*ca,yc+(sa>0?ht:hb)*sa,z);color(c,t,sa,ca,i,j);col.push(c.r,c.g,c.b);}}
  for(let i=0;i<NZ;i++)for(let j=0;j<NR;j++){const a=i*NR+j,b=i*NR+(j+1)%NR,cc=(i+1)*NR+j,d=(i+1)*NR+(j+1)%NR;idx.push(a,b,cc,b,d,cc);}
  const [,,,y0,x0]=prof(0),[,,,y1,x1]=prof(1),tc=pos.length/3;pos.push(x0,y0,-L/2);color(c,0,0,1,0,0);col.push(c.r,c.g,c.b);const nc=tc+1;pos.push(x1,y1,L/2);color(c,1,0,1,NZ,0);col.push(c.r,c.g,c.b);
  for(let j=0;j<NR;j++){idx.push(tc,(j+1)%NR,j);idx.push(nc,NZ*NR+j,NZ*NR+(j+1)%NR);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const ng=g.toNonIndexed();g.dispose();return ng;}
// a flat fin from an outline in (z, y), standing in the fish's midline plane (or turned for side fins)
function finGeo(pts,th=0.014){const sh=new T.Shape();sh.moveTo(-pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)sh.lineTo(-pts[i][0],pts[i][1]);sh.closePath();
  const g=new T.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false,curveSegments:2});g.translate(0,0,-th/2);g.rotateY(Math.PI/2);return g;}
function fishModel(F){const g=new T.Group();if(!FISH_ID)FISH_ID=new Map(Object.entries(FISH).map(([k,v])=>[v,k]));const id=FISH_ID.get(F)||'fish';
  let c=FISH_GEO.get(id);if(!c){c=buildFish(id,F);FISH_GEO.set(id,c);}
  for(const [geo,mat] of c){const m=new T.Mesh(geo,mat||vcMat);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;g.add(m);}return g;}
function buildFish(id,F){const out=[],kind=fishKind(id,F),s=0.32+F.size*0.1,L=s*2;
  const col=new T.Color(F.col||'#8a9ab0'),dk=new T.Color(F.dk||'#3a4a5a'),fin=new T.Color(F.fin||F.dk||'#5a3a2a').getHex(),belly=col.clone().lerp(new T.Color(0xffffff),0.45),back=col.clone().lerp(dk,0.6);
  const parts=[],eye=(x,y,z,r)=>{r*=2;for(const sd of [-1,1])parts.push(P(SPH_LO,0xffffff,sd*x,y,z,0,0,0,r,r,r*0.8),P(SPH_LO,0x1a1420,sd*(x+r*0.32),y,z+r*0.12,0,0,0,r*0.62,r*0.66,r*0.5),P(SPH_XS,0xffffff,sd*(x+r*0.55),y+r*0.22,z+r*0.3,0,0,0,r*0.2,r*0.2,r*0.2));};
  const limb=(c,x0,y0,z0,phi,psi,len,rad)=>{const dx=Math.sin(psi)*Math.sin(phi),dy=Math.cos(phi),dz=Math.cos(psi)*Math.sin(phi);parts.push(P(CYL6,c,x0+dx*len/2,y0+dy*len/2,z0+dz*len/2,phi,psi,0,rad,len,rad));return[x0+dx*len,y0+dy*len,z0+dz*len];};
  const hsh=(i,j)=>{const v=Math.sin(i*127.1+j*311.7+id.length*17.3)*43758.5;return v-Math.floor(v);};
  // ---- specials first
  if(kind==='boot'){parts.push(P(BOX,0x6a4a30,0,0,0,0,0,0,0.22,0.4,0.24),P(BOX,0x6a4a30,0,-0.16,0.16,0,0,0,0.22,0.12,0.36),P(BOX,0x3a2a20,0,-0.24,0.1,0,0,0,0.24,0.04,0.5));out.push([merge(parts)]);return out;}
  if(kind==='squid'){parts.push(PG(CONE12,F.col,F.dk,0,0,-s*0.1,-Math.PI/2,0,0,s*0.5,s*1.2,s*0.5),P(SPH_LO,F.col,0,0,s*0.5,0,0,0,s*0.42,s*0.42,s*0.36));
    for(const sd of [-1,1])parts.push(P(CONE4,F.fin||F.dk,sd*s*0.2,0,-s*0.55,0,0,sd*1.3,s*0.3,s*0.4,s*0.04));
    for(let i=0;i<8;i++){const a=i/8*6.28;limb(F.col,Math.cos(a)*s*0.14,Math.sin(a)*s*0.14,s*0.7,Math.PI/2+Math.sin(a)*0.25,Math.cos(a)*0.25,s*(0.7+(i%2)*0.25),s*0.07);}
    eye(s*0.3,s*0.08,s*0.55,s*0.1);out.push([merge(parts)]);return out;}
  if(kind==='jelly'){parts.push(PG(SPH,F.col,F.dk,0,0,0,0,0,0,s*0.9,s*0.55,s*0.9));for(let i=0;i<8;i++){const a=i/8*6.28;parts.push(P(CYL5,F.col,Math.cos(a)*s*0.5,-s*0.5,Math.sin(a)*s*0.5,0.2*Math.cos(a),0,0.2*Math.sin(a),s*0.03,s*0.9,s*0.03));}
    out.push([merge(parts),lumMat]);return out;}
  if(kind==='octo'){parts.push(PG(SPH,F.col,F.dk,0,s*0.3,0,0,0,0,s*0.75,s*0.8,s*0.7));for(let i=0;i<8;i++){const a=i/8*6.28,psi=Math.PI/2-a;const e=limb(F.col,Math.cos(a)*s*0.2,-s*0.05,Math.sin(a)*s*0.2,2.0,psi,s*0.55,s*0.16);limb(F.col,e[0],e[1],e[2],1.4,psi,s*0.4,s*0.11);parts.push(P(SPH_LO,F.col,...e,0,0,0,s*0.16,s*0.16,s*0.16));}
    eye(s*0.26,s*0.35,s*0.5,s*0.12);out.push([merge(parts)]);return out;}
  if(kind==='crab'){parts.push(PG(SPH_LO,F.col,F.dk,0,0,0,0,0,0,s*1.5,s*0.62,s*1.15));
    for(const sd of [-1,1]){for(let i=0;i<3;i++){const e=limb(F.dk,sd*s*0.6,-s*0.05,-s*0.3+i*s*0.24,1.2,sd*(Math.PI/2+0.3-i*0.25),s*0.45,s*0.07);limb(F.dk,...e,2.5,sd*(Math.PI/2+0.3-i*0.25),s*0.4,s*0.06);}
      const e=limb(F.col,sd*s*0.4,0,s*0.4,1.3,sd*0.55,s*0.5,s*0.1);parts.push(P(SPH_LO,F.col,e[0],e[1],e[2]+s*0.12,0,sd*0.3,0,s*0.42,s*0.28,s*0.5),P(CONE5,F.dk,e[0]+sd*s*0.06,e[1],e[2]+s*0.42,Math.PI/2,0,0,s*0.12,s*0.26,s*0.12));}
    for(const sd of [-1,1])limb(F.dk,sd*s*0.14,s*0.2,s*0.45,0.5,0,s*0.2,s*0.04);eye(s*0.14,s*0.42,s*0.52,s*0.06);out.push([merge(parts)]);return out;}
  if(kind==='axo'){const bp=t=>{const h=s*0.3*(0.45+0.55*fsm(0,0.45,t));return[h,h,h*1.1,0,0];};out.push([fishLoft(L*0.9,bp,(c,t,sa)=>c.copy(col).lerp(belly,Math.max(0,-sa)*0.6))]);
    parts.push(P(SPH_LO,F.col,0,s*0.02,L*0.45,0,0,0,s*0.34,s*0.28,s*0.36));for(const sd of [-1,1])for(let i=0;i<3;i++)parts.push(P(CYL6,fin,sd*s*0.34,s*0.14+i*s*0.08,L*0.42,0,0,sd*(0.9+i*0.35),s*0.05,s*0.3,s*0.05));
    for(const sd of [-1,1])for(const z of [L*0.28,-L*0.1])parts.push(P(CYL6,F.col,sd*s*0.24,-s*0.14,z,0,0,sd*0.8,s*0.05,s*0.22,s*0.05));eye(s*0.26,s*0.12,L*0.55,s*0.06);
    parts.push(P(finGeo([[-L*0.45,0],[-L*0.1,s*0.18],[-L*0.1,-s*0.12]]),fin,0,0,0));out.push([merge(parts)]);return out;}
  // ---- the lofted fishes
  const T0={narwhal:[0.3,0.9,0.18,0.45,2.2],fish:[0.3,0.55,0.18,0.52,1.9],tall:[0.62,0.3,0.14,0.48,1.6],long:[0.17,0.55,0.3,0.45,1.5],heavy:[0.3,0.72,0.28,0.4,2.2],tuna:[0.28,0.75,0.1,0.45,1.7],shark:[0.2,0.78,0.16,0.5,1.8],
    hammer:[0.2,0.78,0.16,0.5,2.4],whale:[0.24,0.85,0.2,0.5,2.6],bill:[0.24,0.62,0.12,0.5,1.8],flying:[0.2,0.62,0.16,0.5,1.8],eel:[0.09,0.9,0.7,0.5,1.8],puffer:[0.62,0.95,0.3,0.5,2.4],sunfish:[0.9,0.25,0.9,0.5,2.2],
    flat:[0.6,0.14,0.2,0.45,1.8],ray:[0.12,4.2,0.3,0.55,1.6]}[kind]||[0.3,0.55,0.18,0.52,1.9];
  const [hr,wr,ped,peak,headP]=T0,H=L*hr,W=H*wr,Lb=kind==='bill'?L*0.88:L;
  const prof=t=>{let h;if(kind==='eel')h=Math.max(0.15,Math.min(1,t*4))*(t>0.9?Math.pow(Math.max(0,1-(t-0.9)/0.1),0.5)*0.9+0.1:1);
    else if(kind==='sunfish')h=t<0.1?0.55+t*4.5:t<peak?1:Math.pow(Math.max(0,1-Math.pow((t-peak)/(1-peak),headP)),0.5);
    else if(t<=peak){const u=fsm(0.04,peak,t);h=ped+(1-ped)*Math.pow(u,0.75);}else{const v=(t-peak)/(1-peak);h=Math.pow(Math.max(0,1-Math.pow(v,headP)),0.5);}
    let ht=H*h,hb=H*h*(kind==='tall'?1.05:kind==='heavy'?1.12:0.95),w=W*h*(0.55+0.45*fsm(0,0.5,t));
    if(kind==='heavy'&&t>0.75){const f=(t-0.75)/0.25;hb*=1-0.25*f;ht*=1-0.15*f;w*=1+0.2*f;} // broad, flat head
    const xc=kind==='eel'?Math.sin(t*Math.PI*2.2)*H*1.6:0;return[ht,hb,w,0,xc];};
  const at=z=>prof(Math.max(0,Math.min(1,(z+Lb/2)/Lb)));
  const pat=(()=>{if(/clown/.test(id))return'clown';if(/koi|maplekoi/.test(id))return'koi';if(/trout|char|salmon|grayling|steelhead/.test(id))return'trout';if(/whaleshark/.test(id))return'whale';
    if(/perch|stickle|lion|tiger|bass$|seabass|sergeant/.test(id))return'bands';if(/rainbow|mahi|parrot|tang|wrasse/.test(id))return'rainbow';if(/lantern|ghost|moon/.test(id))return'lights';if(/mackerel|tuna/.test(id))return'waves';return'';})();
  const bodyCol=(c,t,sa,ca,i,j)=>{c.copy(col);if(sa>0)c.lerp(back,Math.pow(sa,1.2)*0.85);else c.lerp(belly,Math.pow(-sa,1.2)*0.85);const side=Math.abs(ca)>0.35;
    if(pat==='clown'&&[0.28,0.58,0.84].some(b=>Math.abs(t-b)<0.045))c.set(0xffffff);
    if(pat==='clown'&&[0.28,0.58,0.84].some(b=>Math.abs(Math.abs(t-b)-0.05)<0.012))c.set(0x2b1e2e);
    if(pat==='koi'&&sa>-0.2&&Math.sin(t*9+j*0.8)+Math.sin(t*5-j*1.3)>0.9)c.copy(dk);
    if(pat==='trout'&&sa>-0.1&&hsh(i,j)>0.8)c.lerp(dk,0.7);
    if((pat==='trout'||pat==='rainbow')&&Math.abs(sa)<0.2&&side&&t>0.15&&t<0.85)c.lerp(new T.Color(F.fin||'#f08aa0'),0.6);
    if(pat==='whale'&&sa>-0.2&&hsh(i,j)>0.72)c.set(0xf4f0e6);
    if(pat==='bands'&&sa>-0.3&&[0.3,0.48,0.66].some(b=>Math.abs(t-b)<0.04))c.lerp(dk,0.55);
    if(pat==='waves'&&sa>0.25&&Math.sin(t*40+sa*8)>0.4)c.lerp(dk,0.5);
    if(pat==='lights'&&sa<-0.4&&j%2===0&&i%3===0)c.set(0xfff2a0);};
  out.push([fishLoft(Lb,prof,bodyCol)]);
  // fins: outlines that start inside the body, following its top, bottom or tail stalk exactly
  const top=z=>{const [ht]=at(z);return ht;},bot=z=>{const [,hb]=at(z);return-hb;},along=(z0,z1,n,f)=>{const a=[];for(let i=0;i<=n;i++){const z=z0+(z1-z0)*i/n;a.push([z,f(z)]);}return a;};
  const zAt=t=>-Lb/2+t*Lb;
  const dorsal=(t0,t1,hgt,sweep=0.3,notch=false)=>{const z0=zAt(t0),z1=zAt(t1),base=along(z0,z1,6,z=>top(z)-H*0.12).reverse();const pk=[z0+(z1-z0)*(1-sweep),top(z0+(z1-z0)*(1-sweep))+hgt];
    const tip=notch?[[z1-(z1-z0)*0.15,top(z1)+hgt*0.35],[z0+(z1-z0)*0.55,top(z0+(z1-z0)*0.55)+hgt*0.5]]:[];return[...base,[z0,top(z0)],pk,...tip,[z1,top(z1)+hgt*0.15]];};
  const ventral=(t0,t1,hgt,sweep=0.4)=>{const z0=zAt(t0),z1=zAt(t1),base=along(z0,z1,6,z=>bot(z)+H*0.12).reverse();return[...base,[z0,bot(z0)],[z0+(z1-z0)*(1-sweep),bot(z0+(z1-z0)*(1-sweep))-hgt],[z1,bot(z1)-hgt*0.12]];};
  const finParts=[];const addFin=(pts,colr=fin,th)=>finParts.push(P(finGeo(pts,th),colr,0,0,0));
  // the tail: its root is the tail stalk itself (a little inside it), so it can't come away
  const tz=-Lb/2,tr=Math.max(top(tz+0.02),H*0.1),tl=L*({tuna:0.26,shark:0.3,hammer:0.3,whale:0.26,bill:0.3,tall:0.2,long:0.2,heavy:0.2,flying:0.26,flat:0.2,puffer:0.18,eel:0.12}[kind]||0.24);
  const root=[[tz+L*0.06,tr*0.9],[tz+L*0.06,-tr*0.9]];
  if(kind==='ray')parts.push(PG(CONE8,F.dk,F.col,0,0,tz-L*0.28,-Math.PI/2,0,0,H*0.18,L*0.6,H*0.18));
  else if(kind==='eel')addFin([[tz+L*0.08,0],[tz-tl,tr*1.8],[tz-tl*1.1,0],[tz-tl,-tr*1.8]]);
  else if(kind==='sunfish')addFin([[tz+L*0.02,H*0.8],[tz-L*0.1,H*0.6],[tz-L*0.12,0],[tz-L*0.1,-H*0.6],[tz+L*0.02,-H*0.8]]);
  else if(kind==='shark'||kind==='hammer'||kind==='whale')addFin([...root,[tz-tl*0.4,-tr*2.2],[tz-tl*0.3,-tr*0.6],[tz-tl*1.1,tr*3.2],[tz-tl*0.6,tr*1.4]]);
  else if(kind==='tuna'||kind==='bill'||kind==='flying')addFin([...root,[tz-tl,-H*0.95],[tz-tl*0.45,-tr*0.2],[tz-tl*0.45,tr*0.2],[tz-tl,H*0.95]]);
  else if(kind==='heavy'||kind==='flat')addFin([...root,[tz-tl*0.7,-H*0.6],[tz-tl,-H*0.2],[tz-tl,H*0.2],[tz-tl*0.7,H*0.6]]);
  else addFin([...root,[tz-tl*0.85,-H*(kind==='tall'?0.9:0.75)],[tz-tl*0.55,-tr*0.3],[tz-tl*0.55,tr*0.3],[tz-tl*0.85,H*(kind==='tall'?0.9:0.75)]]);
  // back and belly fins, by kind
  switch(kind){
    case'tall':addFin(dorsal(0.14,0.7,H*0.7,0.75));addFin(ventral(0.14,0.62,H*0.65,0.75));break;
    case'long':addFin(dorsal(0.14,0.34,H*0.9,0.4));addFin(ventral(0.14,0.32,H*0.7,0.4));break;
    case'tuna':addFin(dorsal(0.52,0.68,H*0.55,0.3));addFin(dorsal(0.3,0.4,H*0.45,0.2));addFin(ventral(0.3,0.4,H*0.45,0.2));for(let i=0;i<4;i++){addFin(dorsal(0.08+i*0.05,0.11+i*0.05,H*0.14,0.3));addFin(ventral(0.08+i*0.05,0.11+i*0.05,H*0.14,0.3));}break;
    case'shark':case'hammer':case'whale':addFin(dorsal(0.46,0.62,H*1.1,0.1));addFin(dorsal(0.18,0.24,H*0.45,0.1));addFin(ventral(0.16,0.22,H*0.35,0.2));break;
    case'bill':addFin(dorsal(0.3,0.8,H*1.5,0.85,true));addFin(ventral(0.18,0.3,H*0.5,0.4));break;
    case'eel':addFin(dorsal(0.05,0.62,H*0.8,0.5));addFin(ventral(0.05,0.45,H*0.7,0.5));break;
    case'flat':addFin(dorsal(0.08,0.86,H*0.25,0.5));addFin(ventral(0.08,0.72,H*0.22,0.5));break;
    case'puffer':addFin(dorsal(0.2,0.34,H*0.35,0.3));addFin(ventral(0.2,0.34,H*0.3,0.3));break;
    case'ray':break;
    case'sunfish':addFin(dorsal(0.12,0.3,H*1.1,0.2));addFin(ventral(0.12,0.3,H*1.1,0.2));break;
    case'heavy':addFin(dorsal(0.2,0.62,H*0.45,0.5));addFin(ventral(0.18,0.36,H*0.4,0.4));break;
    default:{const spiny=/perch|bass|lion|bream|snapper|grouper|wrasse|goby/.test(id);addFin(dorsal(0.42,0.72,H*(spiny?0.75:0.6),0.6,spiny));if(spiny||/trout|salmon|char/.test(id))addFin(dorsal(0.2,0.36,H*0.5,0.4));addFin(ventral(0.2,0.38,H*0.5,0.45));}}
  // paired fins: set into the flank just behind the gills, angled back
  const pz=zAt(kind==='tall'?0.62:0.7),[,phb,pw]=at(pz),pl=kind==='flying'?L*0.55:kind==='shark'||kind==='whale'||kind==='hammer'?L*0.24:L*0.14;
  if(kind!=='ray')for(const sd of [-1,1]){const g2=finGeo([[0.02,0],[0.02,-pl*0.25],[-pl,-pl*0.5],[-pl*0.7,0]]);finParts.push(P(g2,fin,sd*pw*0.8,-phb*0.3,pz,0,sd*(kind==='flying'?1.3:0.5),sd*0.4));}
  if(kind==='shark'||kind==='whale'||kind==='heavy'){const vz=zAt(0.36),[,vhb,vw]=at(vz);for(const sd of [-1,1])finParts.push(P(finGeo([[0.02,0],[-L*0.09,-L*0.05],[-L*0.08,0]]),fin,sd*vw*0.5,-vhb*0.8,vz,0,sd*0.4,sd*0.6));}
  // eyes on the head's surface, and species details
  const et=kind==='bill'?0.84:kind==='shark'||kind==='whale'?0.86:0.82,ez=zAt(et),[eht,,ew]=at(ez),er=Math.max(0.03,H*(kind==='tall'?0.11:kind==='long'?0.16:0.14));
  if(kind==='flat'){for(const d of [0.2,-0.25])parts.push(P(SPH_LO,0xffffff,ew*0.85,eht*d+er,ez,0,0,0,er,er,er),P(SPH_LO,0x1a1420,ew*0.85+er*0.4,eht*d+er,ez+er*0.1,0,0,0,er*0.6,er*0.6,er*0.6));}
  else if(kind==='ray')eye(ew*0.18,eht*0.85,ez,er*0.8);
  else eye(Math.cos(0.45)*ew*0.9,Math.sin(0.45)*eht*0.9,ez,er);
  if(kind==='narwhal')parts.push(PG(CONE8,0xf4ecd8,0xd8ccb0,0,H*0.1,Lb/2+L*0.35,Math.PI/2,0,0,H*0.12,L*0.75,H*0.12));
  if(kind==='bill')parts.push(PG(CONE8,F.dk,F.col,0,0,Lb/2+L*0.14,Math.PI/2,0,0,H*0.1,L*0.3,H*0.1));
  if(kind==='hammer')parts.push(PG(SPH_LO,F.col,F.dk,0,0,Lb/2-L*0.06,0,0,0,H*1.6,H*0.25,L*0.08));
  if(/cat|carp|koi|loach|barbel/.test(id))for(const sd of [-1,1])parts.push(P(CYL5,F.dk,sd*H*0.18,-H*0.12,Lb/2-L*0.02,0.5,0,sd*1.2,0.012,L*0.18,0.012));
  if(kind==='puffer'){for(let i=0;i<22;i++){const a=i*2.4,b=Math.acos(1-2*(i+0.5)/22),zz=Math.cos(b)*Lb*0.35;const [h1,,w1]=at(zz);const x=Math.sin(b)*Math.cos(a)*w1,y=Math.sin(b)*Math.sin(a)*h1;
    parts.push(P(CONE5,F.dk,x*1.02,y*1.02,zz,Math.atan2(Math.hypot(x,zz),y),Math.atan2(x,zz),0,0.02,H*0.25,0.02));}}
  if(pat==='lights')parts.push(P(SPH_XS,0xfff6c0,0,H*0.8,Lb/2-L*0.05,0,0,0,H*0.16,H*0.16,H*0.16));
  const gm=merge([...parts,...finParts]);out.push([gm]);
  if(kind==='flat'){for(const o of out)o[0].rotateZ(Math.PI/2);}
  return out;}
