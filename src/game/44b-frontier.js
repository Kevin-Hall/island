/* =========================================================
   The frontier: endless islands past the charted world
   ========================================================= */
// Past the last charted island the sea is cut into FR_C×FR_C cells. Each cell holds 0–3 islands rolled from the world
// seed and the cell's index alone (frCell), so a cell always holds the same islands. A cell is rolled when you sail
// near it; cells that hold islands are listed in S.front in the order they were rolled, so their islands keep their ids
// (and with them S.disc, S.restore, S.picked) across saves. Islands are built as they come within FR_BUILD of you and
// taken down again past FR_DROP (frStream), one build per tick so sailing never stalls for long.
// The further out, the stranger: FR_TIERS are bands of distance past the charted world (frR0), and each band draws on
// wilder styles (FSTY: palettes, giant decor, floating isles), wilder coasts (isl.wob, atolls) and taller land (frLevel).
const FR_C=80,FR_GEN=250,FR_BUILD=170,FR_DROP=245;
const FR_TIERS=[
  {d:0,  name:'the Outer Isles', blurb:'Bigger islands, taller hills, trees like towers.'},
  {d:230,name:'Strange Waters',  blurb:'Crystal, candy and mushroom isles. Nothing out here grows the way it should.'},
  {d:520,name:'the Weird Sea',   blurb:'Floating islands, neon rock and the bones of something enormous.'},
  {d:880,name:'the World’s Edge',blurb:'Rainbow ground, starlit void. The sea itself is changing colour.'}];
// a style is the look of a strange island; `like` is the ordinary biome it plays as (its fish, bugs, plants and finds)
const FSTY={
  giant:  {tier:0,name:'Giant',deco:'giant'},
  crystal:{tier:1,name:'Crystal',like:'snow',grass:[0xa8d8ec,0xbce4f2,0x98cce6],sand:[0xeef2fa,0xe2e8f6],cliff:0x7a7ac8,rock:0x9a9ae0,tuft:0x8ac8e0,trees:['ice','snowpine'],td:0.3,deco:'crystal',
           names:[['Prism','Quartz','Glimmer','Shard','Opal','Gleam'],['Spires','Isle','Reach','Facet']]},
  shroom: {tier:1,name:'Mushroom',like:'swamp',grass:[0x8a70b0,0x9a80bc,0x7a62a0],sand:[0xcab4a4,0xbea898],cliff:0x5a4a70,rock:0x7a6a90,tuft:0xb492d8,trees:['willow','bush'],td:0.25,deco:'shroom',
           names:[['Spore','Puffcap','Morel','Toadstool','Truffle','Fungal'],['Hollow','Isle','Grove','Ring']]},
  candy:  {tier:1,name:'Candy',like:'meadow',grass:[0xf6a6c8,0xfab8d6,0xf098c0],sand:[0xfff2dc,0xfae8cc],cliff:0xd07aa0,rock:0xf0d0e8,tuft:0xffc8e0,trees:['cherry'],td:0.2,deco:'candy',
           names:[['Sugar','Gumdrop','Toffee','Taffy','Sherbet','Lolly'],['Isle','Bay','Drop','Cove']]},
  bloom:  {tier:1,name:'Giant Bloom',like:'meadow',grass:[0x72c05a,0x80cc64,0x66b44e],sand:[0xf0dcaa,0xe8d29e],cliff:0x9a7050,rock:0xa8a0b0,tuft:0x5aa048,trees:['bush','flowerbed','oak'],td:0.35,deco:'bloom',
           names:[['Petal','Nectar','Pollen','Posy','Blossom','Stamen'],['Isle','Garden','Knoll','Meadow']]},
  coral:  {tier:1,name:'Coral',like:'tropic',grass:[0xf0a080,0xf4b090,0xe89474],sand:[0xfff0d0,0xf8e4c0],cliff:0xc86a5a,rock:0xf0c0a0,tuft:0xff9a7a,trees:['palm','palmfan'],td:0.3,deco:'coral',
           names:[['Anemone','Polyp','Brine','Conch','Urchin','Kelp'],['Reef','Isle','Key','Shoal']]},
  neon:   {tier:2,name:'Neon Obsidian',like:'volcano',grass:[0x2c2640,0x342c4a,0x261f36],sand:[0x1c1a28,0x24202e],cliff:0x1e1a2a,rock:0x2a2438,tuft:0x8a3ad8,trees:['basalt'],td:0.15,deco:'neon',
           names:[['Neon','Void','Glitch','Umbra','Flux','Static'],['Shard','Isle','Maw','Rift']]},
  sky:    {tier:2,name:'Sky',like:'meadow',grass:[0x8ad070,0x98da7a,0x7cc464],sand:[0xf2e2b8,0xe8d6a8],cliff:0x9a8a70,rock:0xb0a898,tuft:0x6ab850,trees:['oak','bush','pine'],td:0.5,deco:'sky',
           names:[['Cloud','Zephyr','Gale','Nimbus','Soar','Drift'],['Isle','Heights','Perch','Eyrie']]},
  bone:   {tier:2,name:'Bone',like:'autumn',grass:[0xa89878,0xb4a484,0x9c8c6c],sand:[0xe0d4bc,0xd4c8ae],cliff:0x7a6a58,rock:0xc8bca4,tuft:0xb8ac90,trees:['dead'],td:0.3,deco:'bones',
           names:[['Ossuary','Rib','Marrow','Skull','Fang','Tusk'],['Isle','Rest','Barrow','Rise']]},
  spire:  {tier:2,name:'Spire',like:'pine',grass:[0x4a8a5a,0x549466,0x42804e],sand:[0xc8b8a0,0xbcac94],cliff:0x6a6a78,rock:0x7a7a88,tuft:0x3a7a48,trees:['pine','pine','snowpine'],td:0.6,deco:'spire',shape:'spire',
           names:[['Needle','Pinnacle','Stack','Tor','Steeple','Crag'],['Isle','Spires','Peaks','Teeth']]},
  rainbow:{tier:3,name:'Rainbow',like:'meadow',grass:[0xf0a0a0,0xa0e0a0,0xa0b0f0],sand:[0xfff6e8,0xf6ecdc],cliff:0xb08ac8,rock:0xe8d8f8,tuft:0xffffff,trees:['cherry','bush'],td:0.25,deco:'rainbow',hue:1,
           names:[['Prism','Spectrum','Chroma','Iris','Hue','Glee'],['Isle','Arc','Bow','Band']]},
  void:   {tier:3,name:'Starlit Void',like:'snow',grass:[0x1c1a34,0x24203e,0x16142a],sand:[0x2c2844,0x342e4e],cliff:0x0e0c1a,rock:0x3a3458,tuft:0x9a9aff,trees:[],td:0,deco:'void',
           names:[['Star','Nebula','Hush','Null','Comet','Aether'],['Isle','Rift','Veil','Deep']]}};
let frR0=1e9,frT=0,frTier=-1;const frSeen=new Set();
const frPast=(x,z)=>Math.hypot(x,z)-frR0; // how far past the charted world a point is
function frTierAt(x,z){const d=frPast(x,z);let t=-1;FR_TIERS.forEach((T,i)=>{if(d>=T.d)t=i;});return t;}
// the style of a new island at a given distance: mostly the band's own styles, some from the band before, the odd one from the next
function frStyle(R,tier){if(tier<=0)return R()<0.35?'giant':R()<0.12?pickStyle(R,1):null;
  const r=R(),t=r<0.62?Math.min(tier,3):r<0.9?tier-1:Math.min(3,tier+1);if(t<=0)return R()<0.5?'giant':null;return pickStyle(R,t);}
function pickStyle(R,t){const ks=Object.keys(FSTY).filter(k=>FSTY[k].tier===t);return ks[Math.floor(R()*ks.length)];}
// the islands in cell (i,j), placed so they stay inside the cell (so never touch a neighbour's) and outside the charted world
function frCell(i,j){const R=mulberry(hi(S.worldSeed|0,i,j,0xf207)),out=[],cx0=i*FR_C,cz0=j*FR_C;
  if(Math.hypot(cx0,cz0)+FR_C*0.72<frR0)return out;
  const r0=R(),n=r0<0.16?0:r0<0.66?1:r0<0.9?2:3;
  for(let k=0;k<n;k++){for(let t=0;t<14;t++){
    const tier=Math.max(0,frTierAt(cx0,cz0)),w=clamp(frPast(cx0,cz0)/900,0,1);
    let r=n===1?7+R()*(5+7*w):4.5+R()*(2.5+2*w);const sx=1-(R()-0.5)*(0.35+0.55*w),wob=1+R()*w*2.4;
    const ext0=f=>r*f*Math.max(1,1/sx)*(1+0.26*wob)+3.2;if(ext0(1)>FR_C/2-5)r*=(FR_C/2-5)/ext0(1);const ext=ext0(1),room=FR_C/2-4-ext;
    const x=Math.round(cx0+(R()-0.5)*2*Math.max(0,room)),z=Math.round(cz0+(R()-0.5)*2*Math.max(0,room));
    const st=frStyle(R,tier),S0=st&&FSTY[st],biome=S0&&S0.like||BIOME_IDS[Math.floor(R()*BIOME_IDS.length)];
    if(Math.hypot(x,z)-ext<frR0||out.some(o=>Math.hypot(o.cx-x,o.cz-z)<o.ext+ext+3))continue;
    const hole=r>=9&&!(S0&&S0.shape)&&R()<0.1+0.2*w?0.3+R()*0.12:0;
    const mode=S0&&S0.shape==='spire'?'spire':R()<0.25+0.2*w?'mesa':R()<0.3*w?'spire':'hills';
    const tiers=mode==='spire'?Math.round(8+R()*(5+8*w)):Math.round(2+R()*(2+6*w));
    const pk=[];for(let q=0,m=mode==='spire'?3+Math.floor(R()*4):0;q<m;q++){const a=R()*6.283,dd=R()*r*0.5;pk.push([x+Math.cos(a)*dd/sx,z+Math.sin(a)*dd,1.4+R()*1.8,tiers*(0.6+R()*0.4)]);}
    const B=BIOMES[biome],nm=S0&&S0.names||B.names,name=nm[0][Math.floor(R()*nm[0].length)]+' '+nm[1][Math.floor(R()*nm[1].length)];
    out.push({cx:x,cz:z,r,r0:r,ext,grass:[],sand:[],keys:[],sx,wob,hole,mode,tiers,pk,biome,style:st,name,fr:1,tier,w,grand:r>12,rw:1,
      riverN:!hole&&r>=9&&mode!=='spire'&&biome!=='volcano'?1:0,p1:R()*6.28,p2:R()*6.28,p3:R()*6.28,seed:Math.floor(R()*1e9)});break;}}
  return out;}
// the land's height on a frontier island: rolling hills, flat-topped mesas, needle spires, or a ridge round an atoll
function frLevel(isl,x,z){const d=islDist(isl,x,z),R=isl.r,n=vnoise(x,z,isl.seed),T=isl.tiers;let h;
  if(isl.hole){const e=(d-R*isl.hole)/(R*(1-isl.hole));h=(1-Math.abs(e-0.5)*2)*T*(0.35+0.8*n);}
  else if(isl.mode==='spire'){h=(n-0.5)*1.2;for(const [px,pz,pr,ph] of isl.pk){const q=Math.hypot(x-px,z-pz)/pr;if(q<1.6)h=Math.max(h,ph*(1-q/1.6)**0.9);}}
  else if(isl.mode==='mesa'){const e=1-d/R;h=e>0.38+n*0.16?T:e>0.22?T*0.45:e>0.12?1:0;}
  else h=Math.pow(clamp(1-d/R,0,1),0.8)*T*(0.5+0.9*n);
  return clamp(Math.floor(h),0,T);}
// the look of an island: its biome, overridden by its style's palette
function islLook(isl){if(!isl.style)return BIOMES[isl.biome];if(isl._look)return isl._look;const F=FSTY[isl.style],o=Object.assign({},BIOMES[isl.biome]);
  for(const k of ['grass','sand','cliff','rock','tuft','trees','td'])if(F[k])o[k]=F[k];return isl._look=o;}
const islKind=isl=>isl.home?'Home':isl.style&&FSTY[isl.style].like?FSTY[isl.style].name:(isl.style?FSTY[isl.style].name+' ':'')+BIOMES[isl.biome].name;
// the rainbow isles paint every tile its own hue
function frHue(isl,x,z,col){if(!isl.style||!FSTY[isl.style].hue)return col;const h=((x*0.045+z*0.03+vnoise(x,z,isl.seed)*0.5)%1+1)%1;return _gc1.setHSL(h,0.55,0.72).getHex();}

/* ---- streaming ---- */
function frontierBoot(){frSeen.clear();frTier=-1;let m=0;for(const i of islands)if(!i.fr)m=Math.max(m,Math.hypot(i.cx,i.cz)+islR(i)/0.62+4);frR0=m+16;
  for(const c of S.front||[])frAddCell(c,false);frStream(true);}
function frAddCell(c,fresh){if(frSeen.has(c))return;frSeen.add(c);const [i,j]=c.split(',').map(Number),list=frCell(i,j);
  if(fresh&&list.length)(S.front||(S.front=[])).push(c);for(const o of list){o.id=islands.length;o.cell=c;islands.push(o);}}
const frPos=()=>S.sea&&S.boat?[S.boat.x,S.boat.z]:[vil.x,vil.z];
function frStream(all){const [px,pz]=frPos();
  if(Math.hypot(px,pz)>frR0-FR_GEN){const i0=Math.round(px/FR_C),j0=Math.round(pz/FR_C),r=Math.ceil(FR_GEN/FR_C);
    for(let i=i0-r;i<=i0+r;i++)for(let j=j0-r;j<=j0+r;j++){if(Math.hypot(i*FR_C-px,j*FR_C-pz)>FR_GEN+FR_C*0.72)continue;const c=i+','+j;if(!frSeen.has(c))frAddCell(c,true);}}
  let best=null,bd=1e9;const drop=[],here=curIsl();
  for(const isl of islands){if(!isl.fr)continue;const d=Math.hypot(isl.cx-px,isl.cz-pz)-isl.ext;
    if(isl.group){if(d>FR_DROP&&isl!==here&&!(sail&&sail.land===isl.id))drop.push(isl);}
    else if(d<FR_BUILD){if(all)frBuild(isl,true);else if(d<bd){bd=d;best=isl;}}}
  for(const isl of drop)frDrop(isl);if(drop.length)rebuildSeaGrid();
  if(best)frBuild(best);if(all)rebuildSeaGrid();}
function frBuild(isl,quiet){const t0=performance.now();buildIsland(isl);
  if(!quiet){for(const k of isl.keys){if(!isLandT(landMap.get(k)))continue;const [x,z]=k.split(',').map(Number);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)seaMargin.add(K(x+dx,z+dz));}
    cullIslands();}
  frBuild.ms=performance.now()-t0;(frBuild.log||(frBuild.log=[])).push([Math.round(frBuild.ms),isl.keys.length]);if(frBuild.log.length>300)frBuild.log.shift();
  if(!quiet&&sail&&sail.land===isl.id&&S.sea)sailToIsland(isl);/* now the coast exists, steer for it properly */}
function frDrop(isl){const g=isl.group;scene.remove(g);g.traverse(o=>{if(o.isInstancedMesh)o.dispose();
    else if(o.geometry&&!Object.values(RTILE).includes(o.geometry)&&o.geometry!==TILE_PLANE&&o.geometry!==BOX&&o.geometry!==POOL_GEO&&o.geometry!==BLADES)o.geometry.dispose();});
  if(isl.pgroup){scene.remove(isl.pgroup);isl.pgroup.traverse(o=>{if(o.geometry)o.geometry.dispose();});isl.pgroup=null;}
  const riv=new Set();for(const k of isl.keys){if(landMap.get(k)==='river')riv.add(k);landMap.delete(k);islMap.delete(k);lvlMap.delete(k);riverSurf.delete(k);bridgeY.delete(k);SAND_CH.delete(k);CMASK.delete(k);}
  Object.assign(isl,{group:null,keys:[],bc:null,edges:null,veg:[],grass:[],sand:[],tch:null,tMesh:null,riverG:null,heartG:null,residentG:null,casters:null,detail:null,flats:[],bob:null,floraLod:null,rtiles:null,falls:null});
  landList=landList.filter(L=>L[3]!==isl.id);if(riv.size)riverList=riverList.filter(([x,z])=>!riv.has(K(x,z)));depthDirty=true;}
// the land list (40-world) grows and shrinks by one island at a time out here, instead of being rebuilt from the whole map
function frLandAdd(isl){depthDirty=true;for(const k of isl.keys){const t=landMap.get(k),[x,z]=k.split(',').map(Number);if(t==='river')riverList.push([x,z,riverSurf.get(k)]);else if(isLandT(t))landList.push([x,z,t,isl.id,topY(x,z)]);}}
// crossing into a stranger band of sea
function frCheckTier(){const [px,pz]=frPos(),t=frTierAt(px,pz);if(t===frTier)return;const up=t>frTier&&frTier!==-1||t>(S.frMax??-1);frTier=t;
  if(t>=0&&up&&t>(S.frMax??-1)){S.frMax=t;const T=FR_TIERS[t];toast(`You've sailed into <b>${T.name}</b>. ${T.blurb}`,'rare',ICON.chart);SFX.discover();}}
function updateFrontier(dt,tt){frT-=dt;if(frT<=0){frT=0.4;frStream(false);frCheckTier();}
  for(const isl of islands)if(isl.bob&&isl.group&&isl.group.visible)isl.bob.forEach((m,i)=>{m.position.y=Math.sin(tt*0.55+i*2.1+isl.id)*0.32;});}
// the sea (and a little of the sky) changes colour the further out you go
const FR_SEA=[[0,0x3565cc,0],[230,0x2a9ab0,0.3],[520,0x6a4ad0,0.42],[880,0x9a3ab8,0.5],[1300,0x2a1a6a,0.55]];
const _frc=new T.Color();
function frTint(){if(frR0>1e8)return;const d=frPast(cam.tx,cam.tz);if(d<=0)return;let i=0;while(i<FR_SEA.length-2&&FR_SEA[i+1][0]<=d)i++;const A=FR_SEA[i],B=FR_SEA[i+1],t=clamp((d-A[0])/(B[0]-A[0]),0,1);
  _frc.set(A[1]).lerp(_c.set(B[1]),t);const k=lerp(A[2],B[2],t);if(k<=0)return;
  for(const c of [waterMat.color,s1Mat.color,s2Mat.color])c.lerp(_frc,k);skyHz.lerp(_frc,k*0.3);skyZen.lerp(_frc,k*0.45);}

/* ---- strange decor ---- */
function rodG(p,geo,col,x0,y0,z0,x1,y1,z1,w){const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.hypot(dx,dy,dz);
  p.push(P(geo,col,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,Math.atan2(Math.hypot(dx,dz),dy),Math.atan2(dx,dz),0,w,L,w));}
// a chain of rods along a list of points
function chainG(p,geo,col,pts,w,cols){for(let i=0;i<pts.length-1;i++)rodG(p,geo,cols?cols[i%cols.length]:col,...pts[i],...pts[i+1],w*(cols?1:1-i/pts.length*0.4));}
function frDeco(isl,g,blocked){const F=FSTY[isl.style];if(!F)return;const R=mulberry(isl.seed^0xdec0),p=[],gl=[],fl=[[],[]],veg=[],B=islLook(isl);
  const free=shuffle(isl.grass.filter(([x,z])=>!blocked.has(K(x,z))),R),take=(n,sp=0)=>{const out=[];for(const t of free){if(out.length>=n)break;const [x,z]=t;
      if(blocked.has(K(x,z)))continue;if(sp&&out.some(([a,b])=>Math.hypot(a-x,b-z)<sp))continue;out.push(t);for(let dx=-sp>>1;dx<=sp>>1;dx++)for(let dz=-sp>>1;dz<=sp>>1;dz++)blocked.add(K(x+dx,z+dz));}return out;};
  const N=Math.max(4,Math.round(isl.grass.length/(isl.w>0.5?10:14))),Y=(x,z)=>topY(x,z)-0.02;
  switch(F.deco){
    case'giant':for(const [x,z] of take(Math.max(2,Math.round(N*0.5)),3)){const s=2+R()*1.6,kinds=B.trees||['oak'];veg.push(...shift(scaleParts(treeParts(kinds[Math.floor(R()*kinds.length)],R,B.rock),s),x,Y(x,z),z,R()*6.28));}break;
    case'crystal':for(const [x,z] of take(N,2)){const y=Y(x,z),n=4+Math.floor(R()*5),big=R()<0.35?2.4:1.2;
        for(let i=0;i<n;i++){const a=R()*6.28,t=0.15+R()*0.45,h=(1+R()*2.6)*big,w=(0.22+R()*0.2)*big,c=[0x4ac8ff,0x9a6aff,0xff6ac8,0x4ae8c0,0x6a8aff][Math.floor(R()*5)],ex=x+Math.sin(a)*t*h,ez=z+Math.cos(a)*t*h;
          const glow=R()<0.3,L=glow?gl:p;rodG(L,CYL6,c,x+Math.sin(a)*0.1,y,z+Math.cos(a)*0.1,x+(ex-x)*0.78,y+h*0.78,z+(ez-z)*0.78,w);rodG(L,CONE6,c,x+(ex-x)*0.78,y+h*0.78,z+(ez-z)*0.78,ex,y+h,ez,w);}}break;
    case'shroom':for(const [x,z] of take(N,3)){const y=Y(x,z),h=1.6+R()*4.2,cw=1.2+h*0.45+R()*0.8,cap=[0xd84a4a,0xa858d8,0xe8904a,0x6ae0d0,0xf0e0c8][Math.floor(R()*5)],glow=R()<0.35,lean=(R()-0.5)*0.4;
        const tx=x+lean,tz=z+lean*0.5;rodG(p,CYL12,0xf2e8d4,x,y,z,tx,y+h,tz,0.28+h*0.06);p.push(P(SPH_LO,0xe8dcc4,x,y+0.1,z,0,0,0,0.9+h*0.12,0.4,0.9+h*0.12));
        (glow?gl:p).push(P(SPH,cap,tx,y+h+cw*0.1,tz,0,0,0,cw,cw*0.5,cw));p.push(P(CYL12,0xe6d6bc,tx,y+h-0.02,tz,0,0,0,cw*0.9,0.12,cw*0.9));
        for(let i=0;i<7;i++){const a=R()*6.28,e=0.3+R()*0.9;gl.push(P(SPH_XS,0xfff8ec,tx+Math.cos(a)*Math.sin(e)*cw*0.46,y+h+cw*0.1+Math.cos(e)*cw*0.24,tz+Math.sin(a)*Math.sin(e)*cw*0.46,0,0,0,0.22,0.1,0.22));}
        for(let i=0;i<3;i++){const a=R()*6.28,d=0.8+R()*0.8,sx=x+Math.cos(a)*d,sz=z+Math.sin(a)*d,sh=0.3+R()*0.4;rodG(p,CYL8,0xf2e8d4,sx,y,sz,sx,y+sh,sz,0.1);p.push(P(SPH_LO,cap,sx,y+sh,sz,0,0,0,0.4,0.22,0.4));}}break;
    case'candy':for(const [x,z] of take(N,2)){const y=Y(x,z),r=R(),c1=[0xff5a8a,0x5ac8ff,0xffc83a,0x8ae05a,0xc07aff][Math.floor(R()*5)];
        if(r<0.4){const h=2+R()*2.2,rad=0.8+R()*0.7,ry=R()*6.28;rodG(p,CYL8,0xfaf6f0,x,y,z,x,y+h,z,0.12);
          for(let k=0;k<4;k++)p.push(P(CYL12,k%2?0xffffff:c1,x+Math.sin(ry)*k*0.02,y+h+rad*0.8,z+Math.cos(ry)*k*0.02,Math.PI/2,ry,0,rad*2*(1-k*0.22),0.2,rad*2*(1-k*0.22)));}
        else if(r<0.7){const h=2.4+R()*2,a=R()*6.28,pts=[[x,y,z],[x,y+h*0.5,z],[x,y+h,z]];for(let k=1;k<=5;k++){const t=k/5*Math.PI;pts.push([x+Math.sin(a)*(1-Math.cos(t))*0.5,y+h+Math.sin(t)*0.5,z+Math.cos(a)*(1-Math.cos(t))*0.5]);}
          const pp=[];for(let i=0;i<pts.length-1;i++)for(let s=0;s<3;s++){const u=s/3,v=(s+1)/3,A=pts[i],Bq=pts[i+1];pp.push([[A[0]+(Bq[0]-A[0])*u,A[1]+(Bq[1]-A[1])*u,A[2]+(Bq[2]-A[2])*u],[A[0]+(Bq[0]-A[0])*v,A[1]+(Bq[1]-A[1])*v,A[2]+(Bq[2]-A[2])*v]]);}
          pp.forEach(([A,Bq],i)=>rodG(p,CYL8,i%2?0xffffff:0xe83a4a,...A,...Bq,0.26));}
        else for(let i=0;i<3;i++){const a=R()*6.28,d=R()*0.7,s=0.6+R()*0.8;p.push(P(SPH,[0xff6a9a,0x6ad0ff,0xffd04a,0x9ae86a,0xc08aff][Math.floor(R()*5)],x+Math.cos(a)*d,y+s*0.3,z+Math.sin(a)*d,0,0,0,s,s*1.1,s));}}break;
    case'bloom':for(const [x,z] of take(N,2)){const y=Y(x,z),h=2+R()*3.4,a=R()*6.28,tx=x+Math.sin(a)*0.5,tz=z+Math.cos(a)*0.5,pc=[0xff6a8a,0xffb03a,0xb86aff,0xfff0f0,0xff4a4a,0x6aa8ff][Math.floor(R()*6)],pn=6+Math.floor(R()*3),pr=0.7+h*0.2;
        chainG(veg,CYL8,0x4a9a3a,[[x,y,z],[x+Math.sin(a)*0.15,y+h*0.5,z+Math.cos(a)*0.15],[tx,y+h,tz]],0.16);
        for(const s of [-1,1])veg.push(P(SPH_LO,0x5aac48,x+Math.sin(a+s*1.4)*0.5,y+h*0.3,z+Math.cos(a+s*1.4)*0.5,0,a+s*1.4,0.5*s,0.3,0.08,0.9));
        for(let i=0;i<pn;i++){const b=i/pn*6.28;veg.push(P(SPH_LO,pc,tx+Math.cos(b)*pr*0.55,y+h,tz+Math.sin(b)*pr*0.55,0,-b,0,pr*0.55,0.12,pr*1.05));}
        veg.push(P(SPH_LO,0xf6c83a,tx,y+h+0.08,tz,0,0,0,pr*0.55,0.3,pr*0.55));}break;
    case'coral':for(const [x,z] of take(N,2)){const y=Y(x,z),c=[0xff7a6a,0xff9ac8,0xb87aff,0xffb04a][Math.floor(R()*4)];
        const grow=(x0,y0,z0,a,e,L,d)=>{const x1=x0+Math.sin(e)*Math.sin(a)*L,y1=y0+Math.cos(e)*L,z1=z0+Math.sin(e)*Math.cos(a)*L;rodG(p,CYL8,c,x0,y0,z0,x1,y1,z1,0.26-d*0.05);
          if(d>=3){p.push(P(SPH_XS,lerpHex(c,0xffffff,0.35),x1,y1,z1,0,0,0,0.3,0.3,0.3));return;}for(let k=0;k<2;k++)grow(x1,y1,z1,a+(k?1:-1)*(0.5+R()*0.6),Math.min(1.1,e+0.25+R()*0.2),L*0.78,d+1);};
        grow(x,y,z,R()*6.28,0.1,0.9+R()*0.7,0);if(R()<0.4)p.push(P(SPH,lerpHex(c,0xffe0c0,0.4),x+0.9,y+0.3,z+0.6,0,0,0,1,0.7,1));}break;
    case'neon':for(const [x,z] of take(N,2)){const y=Y(x,z),n=1+Math.floor(R()*3),gc=[0xff4ae0,0x3af0ff,0x9aff4a,0xffe04a][Math.floor(R()*4)];
        for(let i=0;i<n;i++){const a=R()*6.28,d=i?0.6+R()*0.4:0,h=2+R()*4.5,w=0.5+R()*0.4,bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,tx=bx+(R()-0.5)*0.8,tz=bz+(R()-0.5)*0.8;
          rodG(p,CONE6,0x1a1628,bx,y,bz,tx,y+h,tz,w);for(let k=1;k<=3;k++){const t=k/4.5;gl.push(P(CYL12,gc,bx+(tx-bx)*t,y+h*t,bz+(tz-bz)*t,0,0,0,w*(1-t)*1.08,0.07,w*(1-t)*1.08));}}
        if(R()<0.5)fl[Math.floor(R()*2)].push(P(SPH,gc,x,y+4+R()*3,z,0,0,0,0.5,0.5,0.5));}
      fl.glow=1;break;
    case'sky':for(const [x,z] of (()=>{/* floating isles don't need free ground under them */const o=[];for(const t of shuffle(isl.grass.slice(),R))if(o.length<Math.max(5,N)&&!o.some(([a,b])=>Math.hypot(a-t[0],b-t[1])<3.6))o.push(t);return o;})()){const y=Y(x,z)+3+R()*5,w=1.2+R()*2,L=fl[Math.floor(R()*2)];
        L.push(P(CONE8,0x8a7a64,x,y-w*0.55,z,Math.PI,R()*3,0,w*1.9,w*1.2,w*1.9),P(CONE8,0x6a5a4a,x+0.2,y-w*1.1,z,Math.PI,R()*3,0,w*0.9,w*0.8,w*0.9),P(CYL12,B.grass[0],x,y+0.05,z,0,0,0,w*1.95,0.24,w*1.95));
        if(R()<0.7)L.push(...shift(scaleParts(treeParts(R()<0.5?'oak':'pine',R,B.rock),0.8),x,y+0.15,z,R()*6.28));
        if(R()<0.35){const a=R()*6.28,ex=x+Math.cos(a)*w*0.85,ez=z+Math.sin(a)*w*0.85;L.push(P(BOX,0xd8f0ff,ex,y-w*1.5,ez,0,a,0,0.3,w*3,0.12));}}
      // and a few boulders hanging over the sea round the island
      for(let i=0;i<6;i++){const a=R()*6.28,d=isl.r*(1.05+R()*0.4),x=isl.cx+Math.cos(a)*d/isl.sx,z=isl.cz+Math.sin(a)*d,y=3+R()*6,w=0.5+R()*0.9;fl[i%2].push(P(ICO,0x8a8278,x,y,z,R(),R(),R(),w*1.4,w,w*1.2),P(CYL12,B.grass[1],x,y+w*0.45,z,0,0,0,w*1.1,0.12,w*1.1));}break;
    case'bones':{const sp=take(Math.max(1,Math.round(N*0.25)),6);for(const [x,z] of sp){const y=Y(x,z),a=R()*6.28,L=5+R()*5,ux=Math.sin(a),uz=Math.cos(a),vx=uz,vz=-ux,bc=0xece2cc;
        for(let i=0;i<=10;i++){const t=i/10-0.5;p.push(P(SPH_LO,bc,x+ux*t*L,y+0.5+Math.sin(i*0.5)*0.1,z+uz*t*L,0,0,0,0.55,0.5,0.55));}
        for(let i=1;i<8;i++){const t=i/8-0.5,bx=x+ux*t*L,bz=z+uz*t*L,hh=1.8+Math.sin(i/8*Math.PI)*1.8;
          for(const s of [-1,1]){const pts=[];for(let k=0;k<=6;k++){const q=k/6*Math.PI*0.88;pts.push([bx+vx*s*Math.sin(q)*hh*0.62,y+0.5+(1-Math.cos(q))*hh*0.62,bz+vz*s*Math.sin(q)*hh*0.62]);}chainG(p,CYL8,bc,pts,0.22);}}
        const hx=x+ux*(L/2+1.4),hz=z+uz*(L/2+1.4);p.push(P(SPH,bc,hx,y+1.1,hz,0,a,0,2.2,1.8,2.4),P(SPH_LO,0x2a2420,hx+vx*0.5+ux*0.9,y+1.4,hz+vz*0.5+uz*0.9,0,0,0,0.55,0.5,0.4),P(SPH_LO,0x2a2420,hx-vx*0.5+ux*0.9,y+1.4,hz-vz*0.5+uz*0.9,0,0,0,0.55,0.5,0.4),P(BOX,bc,hx+ux*0.9,y+0.3,hz+uz*0.9,0,a,0,1.3,0.35,1));
        for(const s of [-1,1])chainG(p,CYL8,0xf6eedc,[[hx+vx*s*0.7+ux*0.8,y+0.6,hz+vz*s*0.7+uz*0.8],[hx+vx*s*1.1+ux*1.8,y+1.1,hz+vz*s*1.1+uz*1.8],[hx+vx*s*1+ux*2.4,y+2,hz+vz*s*1+uz*2.4]],0.3);}}break;
    case'spire':for(const [x,z] of take(Math.round(N*0.4),3)){const y=Y(x,z),h=2.5+R()*3;rodG(p,CONE4,0x7a7a88,x,y,z,x,y+h,z,0.9);}
      // sea stacks: rock columns standing out of the shallows, grass and a pine on top
      {const sh=isl.keys.filter(k=>landMap.get(k)==='s2').map(k=>k.split(',').map(Number));for(const [x,z] of shuffle(sh,R).slice(0,5)){const h=3+R()*6,w=0.9+R()*0.9;
        p.push(P(CYL8,0x6a6a78,x,h/2-0.5,z,0,R()*3,0,w,h+1,w*0.9),P(CYL8,B.grass[0],x,h+0.02,z,0,0,0,w*1.02,0.12,w*0.92));veg.push(...shift(treeParts('pine',R,B.rock),x,h+0.05,z,R()*6));}}break;
    case'rainbow':{const cols=[0xff4a4a,0xff9a3a,0xffe04a,0x5ad05a,0x4aa8ff,0x6a5ad8,0xb05ad8],a=R()*3.14,ux=Math.cos(a),uz=Math.sin(a),rad=Math.min(isl.r*0.9,9),y0=topY(isl.cx,isl.cz);
        cols.forEach((c,k)=>{const r=rad-k*0.38,pts=[];for(let i=0;i<=16;i++){const q=i/16*Math.PI;pts.push([isl.cx+ux*Math.cos(q)*r,y0-0.5+Math.sin(q)*r,isl.cz+uz*Math.cos(q)*r]);}chainG(gl,BOX,c,pts,0.38);});
        for(const [x,z] of take(N,2)){const y=Y(x,z),c=[0xffb8d8,0xb8e8ff,0xfff0a8,0xc8ffc8,0xe0c8ff][Math.floor(R()*5)],h=1.6+R()*1.6;rodG(veg,CYL8,0xf8f0f8,x,y,z,x,y+h,z,0.18);
          for(let i=0;i<5;i++)veg.push(P(SPH,c,x+(R()-0.5)*1.2,y+h+R()*0.6,z+(R()-0.5)*1.2,0,0,0,0.9+R()*0.5,0.8+R()*0.4,0.9+R()*0.5));}}break;
    case'void':for(const [x,z] of take(N,2)){const y=Y(x,z),h=1.5+R()*2.8;rodG(p,CYL6,0x0c0a14,x,y,z,x+(R()-0.5)*0.4,y+h,z+(R()-0.5)*0.4,0.24);
        for(let i=0;i<3;i++)gl.push(P(ICO0,[0xe8e8ff,0xc8b8ff,0xa8e8ff][i],x+(R()-0.5)*1,y+h+(R()-0.3)*0.8,z+(R()-0.5)*1,R(),R(),R(),0.8+R()*0.6,0.8+R()*0.6,0.8+R()*0.6));
        if(R()<0.5){const L=fl[Math.floor(R()*2)],ry=y+4+R()*4,rr=0.9+R()*0.8;for(let i=0;i<14;i++){const b=i/14*6.28,b2=(i+1)/14*6.28;rodG(L,BOX,0xf0e8ff,x+Math.cos(b)*rr,ry+Math.sin(b)*rr,z,x+Math.cos(b2)*rr,ry+Math.sin(b2)*rr,z,0.12);}}}
      for(const [x,z] of isl.grass)if(hash(x*3.3,z*1.9)<0.28)gl.push(P(ICO0,hash(z,x)<0.5?0xffffff:0xb8b0ff,x+(hash(x,z*5)-0.5)*0.8,topY(x,z)+0.04,z+(hash(z*7,x)-0.5)*0.8,0,hash(x,z)*6,0,0.12,0.06,0.12));
      fl.glow=1;break;}
  if(p.length){const m=M(p);m.userData.core=1;g.add(m);}
  if(gl.length){const m=M(gl,lumMat);m.castShadow=false;m.userData.core=1;g.add(m);}
  if(veg.length)addVeg(isl,g,veg);
  isl.bob=[];for(const L of [fl[0],fl[1]])if(L.length){const m=M(L,fl.glow?lumMat:vcMat);m.userData.core=1;const w=new T.Group();w.add(m);w.userData.core=1;g.add(w);isl.bob.push(w);}}
