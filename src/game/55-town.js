/* =========================================================
   The town: a Wild World-style village generated from the world seed —
   plaza with a town tree, shops, a museum, a town hall, villager homes, dirt paths, lamps and trees
   ========================================================= */
const TOWN={fHid:null,name:'',plaza:[0,0],bld:[],path:new Map(),fixed:new Map(),plot:[],board:null,lamps:[],flora:new Map(),res:new Map()};
// wild flower clumps (one geometry per colour), clover and pebbles for the town's grass
const FLOWER_SP={tulip:[0xe8453a,0xf6d04a,0xf2a6c8,0xffffff,0x9a6ad0],rose:[0xd8303a,0xf8f4ee,0xf6d04a,0xf2a6c8],cosmos:[0xf2a6c8,0xf8f4ee,0xe86a8a,0xf6a830],
  pansy:[0x7a5ad0,0xf6d04a,0xe8453a,0x8ac8f0],lily:[0xf8f4ee,0xf08a2a,0xf2a6c8],hyacinth:[0x6a7ae0,0xf2a6c8,0xf8f4ee],daisy:[0xffffff,0xf6e6f0]};
const dkc=(c,f=0.78)=>new T.Color(c).multiplyScalar(f).getHex();
function flowerHead(p,sp,c,x,y,z,R){
  switch(sp){
    case'tulip':for(let k=0;k<6;k++)lf(p,k%2?c:dkc(c,0.88),x,y-0.03,z,k/6*6.283+R()*0.2,1.3,0.14,0.085,0.035);p.push(P(ICO2,dkc(c,0.7),x,y+0.015,z,0,0,0,0.07,0.08,0.07));break;
    case'rose':for(let k=0;k<6;k++)lf(p,c,x,y,z,k/6*6.283,0.35,0.09,0.08,0.04);p.push(P(ICO2,c,x,y+0.02,z,0,0,0,0.12,0.09,0.12),P(ICO2,dkc(c,0.8),x,y+0.05,z,0,1,0,0.08,0.06,0.08),P(ICO2,dkc(c,0.65),x,y+0.07,z,0,2,0,0.04,0.035,0.04));break;
    case'cosmos':for(let k=0;k<8;k++)lf(p,c,x,y,z,k/8*6.283,0.12,0.14,0.05,0.025);p.push(P(ICO2,0xf6c030,x,y+0.01,z,0,0,0,0.05,0.035,0.05));break;
    case'pansy':for(let k=0;k<5;k++){const a=k/5*6.283;p.push(P(ICO2,k<2?dkc(c,0.8):c,x+Math.cos(a)*0.05,y+0.01,z+Math.sin(a)*0.05,0,-a,0.2,0.09,0.02,0.08));}p.push(P(ICO2,0x3a2a4a,x,y+0.02,z,0,0,0,0.06,0.02,0.06),P(ICO2,0xf6d04a,x,y+0.03,z,0,0,0,0.025,0.02,0.025));break;
    case'lily':for(let k=0;k<6;k++)lf(p,k%2?c:dkc(c,0.92),x,y,z,k/6*6.283,0.75,0.17,0.06,0.03);for(let k=0;k<3;k++)p.push(P(BOX,0xe8903a,x+Math.cos(k*2.1)*0.02,y+0.07,z+Math.sin(k*2.1)*0.02,0.3*Math.cos(k),k,0.3*Math.sin(k),0.008,0.1,0.008));break;
    case'hyacinth':for(let k=0;k<14;k++){const a=k*2.4,h=y+k*0.012,r=0.035-k*0.0012;p.push(P(ICO2,k%3?c:dkc(c,0.85),x+Math.cos(a)*r,h,z+Math.sin(a)*r,0,a,0,0.045,0.04,0.045));}break;
    default:bloom(p,c,0xf6d04a,x,y,z,0.1,10,0.15);}}
const FLOWER_H={tulip:0.26,rose:0.24,cosmos:0.34,pansy:0.1,lily:0.3,hyacinth:0.14,daisy:0.2};
const FLORA_KEYS=[],FLORA_GEOS=[];
for(const sp in FLOWER_SP)FLOWER_SP[sp].forEach((c,ci)=>{const R=mulberry(hi(sp.length,ci,31)),p=[];
  for(let s=0;s<3;s++){const a=s*2.1+R(),r=s?0.14+R()*0.06:0.02,x=Math.cos(a)*r,z=Math.sin(a)*r,h=FLOWER_H[sp]*(0.85+R()*0.3);stemP(p,0x4f8a34,x,z,h);
    if(sp==='tulip'){lf(p,GREENS[s%4],x,0.01,z,a,1.15,0.2,0.08);lf(p,GREENS[(s+1)%4],x,0.01,z,a+3,1.05,0.18,0.07);}
    else if(sp==='pansy'||sp==='hyacinth')for(let k=0;k<3;k++)lf(p,GREENS[k%4],x,0.01,z,a+k*2.1,0.35,0.1,0.07);
    else{lf(p,GREENS[s%4],x,h*0.35,z,a,0.45,0.12,0.06);lf(p,GREENS[(s+2)%4],x,h*0.55,z,a+2.6,0.45,0.1,0.05);}
    flowerHead(p,sp,c,x,h,z,R);}
  FLORA_KEYS.push(sp+ci);FLORA_GEOS.push(merge(p));});
function floraIndex(x,z){const sps=Object.keys(FLOWER_SP),sp=sps[Math.floor(hash(Math.floor(x/5)+11,Math.floor(z/5)-3)*sps.length)],cols=FLOWER_SP[sp];
  const ci=Math.floor(hash(Math.floor(x/3)-5,Math.floor(z/3)+9)*cols.length);return FLORA_KEYS.indexOf(sp+ci);}
const CLOVER_GEO=(()=>{const R=mulberry(5),p=[];for(let i=0;i<7;i++){const cx=(R()-0.5)*0.55,cz=(R()-0.5)*0.55,y=0.03+R()*0.04,r0=R()*6.28;for(let j=0;j<3;j++)lf(p,GREENS[(i+j)%4],cx,y,cz,r0+j*2.09,0.12,0.09,0.08);if(i===2)bloom(p,0xffffff,0xf2c8d8,cx,y+0.05,cz,0.04,6,0.9);}return merge(p);})();
const PEBBLE_GEO=merge([P(ICO,0xb8b4ac,0,0.02,0,0,0.3,0,0.14,0.07,0.11),P(ICO,0xa09c94,0.1,0.015,0.06,0,1,0,0.09,0.05,0.08),P(ICO,0xc8c4bc,-0.08,0.015,0.07,0,2,0,0.07,0.04,0.06)]);
const DOCK={x:1,z:12};
function scaleParts(ps,s){return ps.map(p=>Object.assign({},p,{x:p.x*s,y:p.y*s,z:p.z*s,sx:p.sx*s,sy:p.sy*s,sz:p.sz*s}));}
const TOWN_NAMES=[['Maple','Willow','Clover','Honey','Pebble','Juniper','Bramble','Acorn','Sunny','Misty','Hazel','Plum','Fern','Button'],['wick','brook','ton','dale','haven','ford','vale','bury','field','hollow']];
function layoutTown(isl){
  const R=mulberry((S.worldSeed|0)^0x70a1);TOWN.fHid=null;TOWN.flora.clear();TOWN.res.clear();TOWN.bld=[];TOWN.path.clear();TOWN.fixed.clear();TOWN.plot=[];TOWN.lamps=[];
  TOWN.name=TOWN_NAMES[0][Math.floor(R()*TOWN_NAMES[0].length)]+TOWN_NAMES[1][Math.floor(R()*TOWN_NAMES[1].length)];
  const G=(x,z)=>landMap.get(K(x,z))==='grass'&&islMap.get(K(x,z))===0&&farmQ(x,z)>1.15;
  const L=(x,z)=>lvlMap.get(K(x,z))||0,taken=k=>TOWN.fixed.has(k)||TOWN.path.has(k);
  const fits=(x0,z0,w,h,pad)=>{const l=L(x0,z0);for(let dx=-pad;dx<w+pad;dx++)for(let dz=-pad;dz<h+pad;dz++){const x=x0+dx,z=z0+dz;
    if(!G(x,z)||taken(K(x,z)))return false;if(dx>=0&&dx<w&&dz>=0&&dz<h&&L(x,z)!==l)return false;}return true;};
  // dock: the south beach column nearest x=1 with no river nearby
  for(let r=0;r<12;r++){let ok=false;for(const x of [1+r,1-r]){let zz=null;for(let z=0;z<24;z++)if(isLandT(landMap.get(K(x,z)))&&landMap.get(K(x,z))!=='bridge')zz=z;
      if(zz!==null&&landMap.get(K(x,zz))==='sand'&&![...Array(7)].some((_,i)=>riverSurf.has(K(x-3+i,zz))||riverSurf.has(K(x-3+i,zz-2)))){DOCK.x=x;DOCK.z=zz;ok=true;break;}}if(ok)break;}
  // plaza: a flat 5x5 square near the middle
  let pc=null;for(let r=0;r<10&&!pc;r++)for(let dx=-r;dx<=r&&!pc;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const x=dx,z=1+dz;if(fits(x-2,z-2,5,5,0)){pc=[x,z];break;}}
  pc=pc||[0,1];TOWN.plaza=pc;for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const k=K(pc[0]+dx,pc[1]+dz);TOWN.path.set(k,2);}
  TOWN.fixed.set(K(pc[0],pc[1]),'tree');TOWN.board=[pc[0]+2,pc[1]-2];TOWN.fixed.set(K(...TOWN.board),'board');
  // buildings: civic ones close to the plaza, homes spread around
  const want=[{t:'hall',d:[4,7]},{t:'shop',d:[4,8]},{t:'museum',d:[4,9]},{t:'home',d:[5,9]}];for(let i=0;i<6;i++)want.push({t:'vh',d:[6,24],n:i});
  for(const w of want){let best=null,bs=-1e9;
    for(let it=0;it<900;it++){const x=Math.floor((R()-0.5)*2*(TOWN_W-3)),z=Math.floor((R()-0.5)*2*(TOWN_D-3))-1;if(!fits(x,z,2,3,1))continue;
      const d=Math.hypot(x+0.5-pc[0],z+1-pc[1]);if(d<w.d[0]||d>w.d[1])continue;let near=99;for(const b of TOWN.bld)near=Math.min(near,Math.hypot(b.x-x,b.z-z));
      const sc=(w.t==='vh'?Math.min(near,9)*0.6:-Math.abs(d-w.d[0]-1))+R()*1.5;if(sc>bs){bs=sc;best=[x,z];}}
    if(!best)continue;const [x,z]=best,b={t:w.t,x,z,n:w.n,door:[x,z+2]};TOWN.bld.push(b);
    for(let dx=0;dx<2;dx++)for(let dz=0;dz<2;dz++)TOWN.fixed.set(K(x+dx,z+dz),w.t==='home'?'house':w.t);}
  const home=TOWN.bld.find(b=>b.t==='home')||{x:pc[0]-6,z:pc[1]-1,door:[pc[0]-6,pc[1]+1]};
  HOUSE_AT.x=home.x;HOUSE_AT.z=home.z;TOWN.fixed.delete(K(home.x,home.z));TOWN.fixed.delete(K(home.x+1,home.z));TOWN.fixed.delete(K(home.x,home.z+1));TOWN.fixed.delete(K(home.x+1,home.z+1));
  const binC=[[home.x+2,home.z+1],[home.x-1,home.z+1],[home.x+2,home.z]].find(([x,z])=>G(x,z)&&!taken(K(x,z)));if(binC){BIN_AT.x=binC[0];BIN_AT.z=binC[1];}
  // dirt paths: doors → plaza, plaza → dock and the farm bridge (4-way, reusing earlier paths where possible)
  const lay=(sx,sz,tx,tz)=>{const p=landPath(sx,sz,tx,tz,{four:true,max:9000,block:(x,z)=>TOWN.fixed.has(K(x,z))||(x===BIN_AT.x&&z===BIN_AT.z)||(x>=HOUSE_AT.x&&x<=HOUSE_AT.x+1&&z>=HOUSE_AT.z&&z<=HOUSE_AT.z+1),
      cost:(x,z,px,pz)=>(TOWN.path.has(K(x,z))?0.35:1)+(L(x,z)!==L(px,pz)?3:0)});if(!p)return;for(const [x,z] of p){const t=landMap.get(K(x,z));if(t==='grass'&&!TOWN.path.has(K(x,z)))TOWN.path.set(K(x,z),1);}};
  for(const b of TOWN.bld)lay(b.door[0],b.door[1],pc[0],pc[1]+2);
  lay(pc[0],pc[1]+2,DOCK.x,DOCK.z);
  {let wx=null;for(let x=-TOWN_W;x<0;x++)if(G(x,FARM.z)){wx=x;break;}if(wx!==null)lay(pc[0]-2,pc[1],wx,FARM.z);}
  // the player's garden plot beside their house
  for(const [ox,oz] of [[-4,0],[3,0],[-4,2],[3,2],[0,4]]){const x0=home.x+ox,z0=home.z+oz;if(fits(x0,z0,3,2,0)){for(let dx=0;dx<3;dx++)for(let dz=0;dz<2;dz++)TOWN.plot.push([x0+dx,z0+dz]);break;}}
  const plotSet=new Set(TOWN.plot.map(([x,z])=>K(x,z)));
  // static town meshes
  const p=[],gl=[],y0=(x,z)=>topY(x,z);
  // town tree + benches + bulletin board
  p.push(...shift(scaleParts(treeParts('oak',mulberry(7),0x9a9ea8),1.55),pc[0],y0(...pc),pc[1],0.4));
  for(let i=0;i<10;i++){const a=i/10*6.283;bloom(p,[0xf2a6c8,0xffffff,0xf6d04a][i%3],0xf6d04a,pc[0]+Math.cos(a)*0.85,y0(...pc)+0.05,pc[1]+Math.sin(a)*0.85,0.07);}
  for(const [bx,bz,r] of [[pc[0]-2,pc[1]+2,0],[pc[0]+2,pc[1]+2,0]]){const q=[];for(const [x,z] of [[-0.38,-0.1],[0.38,-0.1],[-0.38,0.12],[0.38,0.12]])q.push(P(BOX,0x5a3a2a,x,0.12,z,0,0,0,0.06,0.24,0.06));
    q.push(P(BOX,0xb07a44,0,0.26,0,0,0,0,0.9,0.06,0.34),P(BOX,0xb07a44,0,0.52,-0.16,0,0,0,0.9,0.18,0.05));p.push(...shift(q,bx,y0(bx,bz),bz,r));TOWN.fixed.set(K(bx,bz),'decor');}
  {const [bx,bz]=TOWN.board,q=[P(CYL8,0x6a4428,-0.36,0.45,0,0,0,0,0.07,0.9,0.07),P(CYL8,0x6a4428,0.36,0.45,0,0,0,0,0.07,0.9,0.07),P(BOX,0x9a6a3a,0,0.62,0,0,0,0,0.9,0.52,0.06),P(BOX,0x7a5230,0,0.92,0,0,0,0,1.0,0.07,0.12),
    P(BOX,0xf6ecd0,-0.2,0.66,0.035,0,0,0.08,0.22,0.26,0.01),P(BOX,0xf2c8d8,0.14,0.6,0.035,0,0,-0.1,0.2,0.2,0.01),P(BOX,0xd8ecf4,0.22,0.74,0.035,0,0,0.05,0.14,0.12,0.01)];p.push(...shift(q,bx,y0(bx,bz),bz,0));}
  // buildings
  for(const b of TOWN.bld){if(b.t==='home')continue;const q=townBuilding(b,R),bx=b.x+0.5,bz=b.z+0.5,by=Math.min(y0(b.x,b.z),y0(b.x+1,b.z+1));p.push(...shift(q.p,bx,by,bz,0));gl.push(...shift(q.gl,bx,by,bz,0));
    if(q.lit)TOWN.lamps.push([bx,by,bz+1.3]);}
  // lamps along the paths, trees and flowers on the open grass
  let pn=0;for(const [k,v] of TOWN.path){if(v!==1)continue;if(++pn%7)continue;const [x,z]=k.split(',').map(Number);
    const side=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dz])=>[x+dx,z+dz]).find(([a,c])=>G(a,c)&&!taken(K(a,c))&&!plotSet.has(K(a,c)));if(!side)continue;
    const [lx,lz]=side,ly=y0(lx,lz);p.push(P(CYL8,0x3e3444,lx,ly+0.55,lz,0,0,0,0.07,1.1,0.07),P(BOX,0x3e3444,lx,ly+1.22,lz,0,0,0,0.26,0.05,0.26),P(CONE4,0x3e3444,lx,ly+1.32,lz,0,0.785,0,0.3,0.14,0.3));
    gl.push(P(BOX,0xfff0b8,lx,ly+1.1,lz,0,0,0,0.18,0.2,0.18));TOWN.lamps.push([lx,ly,lz]);TOWN.fixed.set(K(lx,lz),'decor');}
  const kinds=['oak','oak','oak','pine','maple','bush','flowerbed','bush'];
  for(const [x,z] of isl.grass){const k=K(x,z);if(!G(x,z)||taken(k)||plotSet.has(k)||farmQ(x,z)<1.4)continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>TOWN.path.has(K(x+dx,z+dz))||TOWN.fixed.has(K(x+dx,z+dz))&&TOWN.fixed.get(K(x+dx,z+dz))!=='decor'))continue;
    const h=hash(x*1.7+3,z*2.3-1);if(h>0.11)continue;const kd=h<0.1?kinds[Math.floor(hash(z,x)*4)]:kinds[4+Math.floor(hash(x,z)*4)];
    p.push(...shift(treeParts(kd,mulberry(hi(x,z,5)),0x9a9ea8),x+(hash(z,x+1)-0.5)*0.2,y0(x,z),z+(hash(x+2,z)-0.5)*0.2,hash(x,z)*6.28));TOWN.fixed.set(k,'decor');if(['oak','pine','maple'].includes(kd))TOWN.res.set(k,'tree');}
  // town rocks to chip stone from, and a flower planter in the plaza's free corner
  {let n=0;for(const [x,z] of shuffle(isl.grass.slice(),R)){if(n>=7)break;const k=K(x,z);if(!G(x,z)||taken(k)||plotSet.has(k)||farmQ(x,z)<1.4)continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>TOWN.path.has(K(x+dx,z+dz))))continue;rockP(p,mulberry(hi(x,z,9)),0x9a9ea8,0.75);const rp=p.splice(p.length-7,7);p.push(...shift(rp,x,y0(x,z),z,hash(x,z)*6));
    TOWN.fixed.set(k,'decor');TOWN.res.set(k,'rock');n++;}}
  {const [px,pz]=[pc[0]-2,pc[1]-2];const q=[P(BOX,0xb0a898,0,0.15,0,0,0,0,0.8,0.3,0.8),P(BOX,0x5a3a2a,0,0.31,0,0,0,0,0.7,0.02,0.7)];wildflowers(q,mulberry(3),[0xf2a6c8,0xf6d04a,0xffffff,0xe86a5a],8,0.3);
    p.push(...shift(q.slice(0,2),px,y0(px,pz),pz,0),...shift(q.slice(2),px,y0(px,pz)+0.31,pz,0));TOWN.fixed.set(K(px,pz),'decor');}
  isl.group.add(M(p));if(gl.length){const m=M(gl,glowMat);m.castShadow=false;isl.group.add(m);}
  // flowers, clover and pebbles: instanced over the open grass (hidden again wherever you till or build)
  {const lists=FLORA_GEOS.map(()=>[]),clov=[],peb=[];
    for(const [x,z] of isl.grass){const k=K(x,z);if(!G(x,z)||taken(k)||farmQ(x,z)<1.3)continue;const h=hash(x*4.1-2,z*3.3+7);
      if(h<0.34)lists[floraIndex(x,z)].push([x,z]);else if(h<0.43)clov.push([x,z]);}
    for(const [k,v] of TOWN.path){if(v!==1)continue;const [x,z]=k.split(',').map(Number);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(G(x+dx,z+dz)&&!TOWN.path.has(K(x+dx,z+dz))&&hash(x*7+dx,z*5+dz)<0.35)peb.push([x+dx*0.46,z+dz*0.46,x,z]);}
    const mk=(geo,list,mat,track)=>{if(!list.length)return;const im=new T.InstancedMesh(geo,mat,list.length);list.forEach(([x,z,tx,tz],i)=>{const tile=tx===undefined?[x,z]:[tx,tz];
        _e.set(0,hash(x,z)*6.28,0);_q.setFromEuler(_e);_m.compose(_v.set(x+(tx===undefined?(hash(z,x)-0.5)*0.4:0),y0(...tile),z+(tx===undefined?(hash(x+1,z)-0.5)*0.4:0)),_q,_s.set(1.15,1.0+hash(z*2,x)*0.35,1.15));im.setMatrixAt(i,_m);
        if(track){const k=K(x,z);if(!TOWN.flora.has(k))TOWN.flora.set(k,[]);TOWN.flora.get(k).push([im,i,_m.toArray()]);}});
      im.frustumCulled=false;im.receiveShadow=true;isl.group.add(im);};
    FLORA_GEOS.forEach((g0,i)=>mk(g0,lists[i],flowerMat,true));mk(CLOVER_GEO,clov,flowerMat,true);mk(PEBBLE_GEO,peb,vcMat,false);}
  for(const [x,y,z] of TOWN.lamps){const pm=pool(y+0.03,1);pm.position.x=x;pm.position.z=z;isl.group.add(pm);}}
// one building's parts, centred on its 2x2 footprint, door facing +z
function townBuilding(b,R){const p=[],gl=[];let lit=true;
  if(b.t==='shop'){p.push(P(BOX,0xc8905a,0,0.55,0,0,0,0,1.8,1.1,1.5),P(BOX,0xa87444,0,0.05,0,0,0,0,1.86,0.1,1.56));roof(p,0x4f8a4a,0xc8905a,1.9,0.8,1.5,1.1);
    for(let i=0;i<7;i++)p.push(P(BOX,i%2?0xf4f0e6:0xd8453a,-0.78+i*0.26,0.98,0.86,0.35,0,0,0.26,0.05,0.5));
    p.push(P(BOX,0x6a4a30,0,0.38,0.76,0,0,0,0.42,0.72,0.04),P(BOX,0xf6ecd0,0,1.36,0.78,0,0,0,0.9,0.26,0.04),P(ICO2,0x5fae44,-0.28,1.36,0.8,0,0,0,0.12,0.14,0.04));
    gl.push(P(BOX,0x404a60,-0.6,0.55,0.76,0,0,0,0.34,0.3,0.03),P(BOX,0x404a60,0.6,0.55,0.76,0,0,0,0.34,0.3,0.03));
    for(const [x,c] of [[-0.95,0xa87444],[0.98,0x9a6a3a]])p.push(P(BOX,c,x,0.16,1.05,0,0.3,0,0.3,0.3,0.3),P(ICO2,x<0?0xf08a2a:0xe0303a,x,0.36,1.05,0,0,0,0.14,0.12,0.14));}
  else if(b.t==='museum'){p.push(P(BOX,0xe8e0d0,0,0.6,-0.1,0,0,0,1.9,1.2,1.4),P(BOX,0xc8c0b0,0,0.05,0.1,0,0,0,2.1,0.1,1.9),P(BOX,0xd8d0c0,0,0.14,0.75,0,0,0,1.8,0.08,0.3));
    for(let i=0;i<4;i++)p.push(P(CYL12,0xf4f0e6,-0.72+i*0.48,0.7,0.62,0,0,0,0.16,1.1,0.16));
    p.push(P(BOX,0xd8d0c0,0,1.28,0.2,0,0,0,2.0,0.12,1.2),P(PRISM,0xc8c0b0,0,1.5,0.2,0,0,0,1.12,0.34,1.2),P(PRISM,0x9aa8c8,0,1.49,0.2,0,0,0,0.9,0.28,1.22),P(BOX,0x6a5a4a,0,0.42,0.52,0,0,0,0.42,0.72,0.04));
    p.push(P(ICO2,0xf6d04a,0,1.52,0.82,0,0,0,0.14,0.14,0.03));gl.push(P(BOX,0x404a60,-0.62,0.8,0.52,0,0,0,0.2,0.34,0.03),P(BOX,0x404a60,0.62,0.8,0.52,0,0,0,0.2,0.34,0.03));}
  else if(b.t==='hall'){p.push(P(BOX,0xf1e3c6,0,0.62,0,0,0,0,2.0,1.24,1.5),P(BOX,0xb8ae9a,0,0.06,0,0,0,0,2.06,0.12,1.56));roof(p,0x5a6ab0,0xf1e3c6,2.1,0.8,1.5,1.24);
    p.push(P(BOX,0xf1e3c6,0,1.95,0.1,0,0,0,0.6,0.7,0.6),P(CONE4,0x5a6ab0,0,2.5,0.1,0,0.785,0,0.9,0.44,0.9),P(CYL12,0xf6f0e0,0,2.0,0.41,1.57,0,0,0.36,0.03,0.36),P(BOX,0x3a2a2a,0.04,2.03,0.43,0,0,0.6,0.02,0.16,0.01),P(BOX,0x3a2a2a,0,2.0,0.43,0,0,0,0.12,0.02,0.01));
    p.push(P(BOX,0x6a4a3a,0,0.42,0.76,0,0,0,0.5,0.8,0.04),P(CYL8,0x8a8e98,0.95,0.9,0.95,0,0,0,0.04,1.8,0.04),P(BOX,0x5fae44,1.08,1.66,0.95,0,0,0,0.26,0.18,0.02),P(ICO2,0xf6d04a,1.08,1.66,0.965,0,0,0,0.08,0.08,0.01));
    for(const x of [-0.62,0.62])gl.push(P(BOX,0x404a60,x,0.72,0.76,0,0,0,0.3,0.36,0.03));}
  else{// a villager's home: pastel walls, trimmed windows with shutters and flower boxes, porch, fenced front garden
    const W0=[0xf6e6d0,0xf2d8e0,0xdcecf0,0xf4ecc0,0xe0f0d8,0xeadcf4][b.n%6],RF=[0xd8604a,0x5a8ad8,0x6ab85a,0xe0a040,0x9a6ad0,0xe0708a][b.n%6],TR=0xfbf8f0,DR=new T.Color(RF).multiplyScalar(0.7).getHex();
    p.push(P(BOX,W0,0,0.5,-0.1,0,0,0,1.5,1.0,1.3),P(BOX,0xb0a898,0,0.06,-0.1,0,0,0,1.58,0.12,1.38));
    for(const [cx,cz] of [[-0.75,0.55],[0.75,0.55],[-0.75,-0.75],[0.75,-0.75]])p.push(P(BOX,TR,cx,0.52,cz,0,0,0,0.07,0.96,0.07));
    p.push(P(BOX,TR,0,0.98,0.56,0,0,0,1.56,0.05,0.04));roof(p,RF,W0,1.6,0.8,1.3,1.0,0,-0.1);
    // door: frame, panelled door, knob, little awning, steps and a mat
    p.push(P(BOX,TR,-0.3,0.39,0.56,0,0,0,0.42,0.74,0.03),P(BOX,DR,-0.3,0.36,0.575,0,0,0,0.32,0.64,0.03),P(BOX,RF,-0.3,0.5,0.59,0,0,0,0.22,0.18,0.01),P(BOX,RF,-0.3,0.24,0.59,0,0,0,0.22,0.18,0.01),
      P(ICO2,0xf6d04a,-0.19,0.36,0.6,0,0,0,0.045,0.045,0.03),P(BOX,RF,-0.3,0.8,0.66,0.5,0,0,0.5,0.03,0.24),P(BOX,0xc8c0b0,-0.3,0.05,0.72,0,0,0,0.5,0.1,0.26),P(BOX,0xd8453a,-0.3,0.105,0.74,0,0,0,0.34,0.01,0.18));
    // front window with frame, cross bars, shutters and a flower box
    const wx=0.35,wy=0.55;gl.push(P(BOX,0x404a60,wx,wy,0.565,0,0,0,0.28,0.26,0.02));
    p.push(P(BOX,TR,wx,wy,0.55,0,0,0,0.36,0.34,0.02),P(BOX,TR,wx,wy,0.58,0,0,0,0.03,0.26,0.01),P(BOX,TR,wx,wy,0.58,0,0,0,0.28,0.03,0.01),
      P(BOX,RF,wx-0.24,wy,0.575,0,0,0,0.1,0.34,0.02),P(BOX,RF,wx+0.24,wy,0.575,0,0,0,0.1,0.34,0.02),P(BOX,0x8a5a3a,wx,wy-0.23,0.62,0,0,0,0.38,0.08,0.1));
    for(let i=0;i<4;i++)bloom(p,[0xf2a6c8,0xffffff,0xf6d04a,0xb8a8f2][(i+b.n)%4],0xf6d04a,wx-0.13+i*0.09,wy-0.18,0.62,0.045);
    // side window, round attic window, chimney with cap, door lantern
    gl.push(P(BOX,0x404a60,0.76,0.55,-0.1,0,0,0,0.02,0.26,0.28),P(CYL12,0x404a60,0,1.3,0.56,1.57,0,0,0.2,0.02,0.2));p.push(P(BOX,TR,0.755,0.55,-0.1,0,0,0,0.02,0.34,0.36),P(CYL12,TR,0,1.3,0.55,1.57,0,0,0.26,0.02,0.26));
    p.push(P(BOX,0xa0523a,0.45,1.5,-0.35,0,0,0,0.2,0.5,0.2),P(BOX,0x6a3a2a,0.45,1.77,-0.35,0,0,0,0.26,0.05,0.26));
    gl.push(P(BOX,0xfff0b8,0.02,0.62,0.62,0,0,0,0.08,0.1,0.08));p.push(P(BOX,0x3e3444,0.02,0.7,0.62,0,0,0,0.11,0.03,0.11));
    // mailbox and a picket fence around the front garden (gap at the door)
    p.push(P(BOX,0x6a4a30,0.85,0.22,0.95,0,0,0,0.05,0.44,0.05),P(BOX,RF,0.85,0.5,0.95,0,0,0,0.18,0.14,0.24),P(CYL12,RF,0.85,0.57,0.95,1.57,0,1.57,0.18,0.24,0.18),P(BOX,0xe8453a,0.95,0.6,1.0,0,0,0,0.02,0.14,0.04));
    for(const [x0,x1] of [[-0.98,-0.58],[-0.02,0.7]]){for(let x=x0;x<=x1+0.001;x+=0.1)p.push(P(BOX,TR,x,0.13,0.98,0,0,0,0.035,0.26,0.03));p.push(P(BOX,TR,(x0+x1)/2,0.19,0.98,0,0,0,x1-x0+0.04,0.03,0.025),P(BOX,TR,(x0+x1)/2,0.08,0.98,0,0,0,x1-x0+0.04,0.03,0.025));}
    for(const sx of [-0.85,0.15])for(let i=0;i<3;i++)bloom(p,[0xf2a6c8,0xffffff,0xf6d04a,0xb8a8f2][(i+b.n)%4],0xf6d04a,sx+i*0.18,0.1,0.8,0.06);}
  return{p,gl,lit};}
