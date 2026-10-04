/* =========================================================
   The town: a Wild World-style village generated from the world seed —
   plaza with a town tree, shops, a museum, a town hall, villager homes, dirt paths, lamps and trees
   ========================================================= */
const TOWN={fHid:null,name:'',plaza:[0,0],benches:[],cafeSeats:[],light:null,bld:[],path:new Map(),fixed:new Map(),plot:[],board:null,lamps:[],flora:new Map(),res:new Map()};
// (wild flowers and clover: 54b-flora)
const PEBBLE_GEO=merge([P(ICO,0xb8b4ac,0,0.02,0,0,0.3,0,0.14,0.07,0.11),P(ICO,0xa09c94,0.1,0.015,0.06,0,1,0,0.09,0.05,0.08),P(ICO,0xc8c4bc,-0.08,0.015,0.07,0,2,0,0.07,0.04,0.06)]);
const DOCK={x:1,z:12};
function scaleParts(ps,s){return ps.map(p=>Object.assign({},p,{x:p.x*s,y:p.y*s,z:p.z*s,sx:p.sx*s,sy:p.sy*s,sz:p.sz*s}));}
const TOWN_NAMES=[['Maple','Willow','Clover','Honey','Pebble','Juniper','Bramble','Acorn','Sunny','Misty','Hazel','Plum','Fern','Button'],['wick','brook','ton','dale','haven','ford','vale','bury','field','hollow']];
function layoutTown(isl){
  const R=mulberry((S.worldSeed|0)^0x70a1);TOWN.fHid=null;TOWN.flora.clear();TOWN.res.clear();TOWN.bld=[];TOWN.path.clear();TOWN.fixed.clear();TOWN.plot=[];TOWN.lamps=[];TOWN.light=null;
  TOWN.name=TOWN_NAMES[0][Math.floor(R()*TOWN_NAMES[0].length)]+TOWN_NAMES[1][Math.floor(R()*TOWN_NAMES[1].length)];if(S.islandName)TOWN.name=S.islandName;
  const G=(x,z)=>landMap.get(K(x,z))==='grass'&&islMap.get(K(x,z))===0&&farmQ(x,z)>1.15;
  const L=(x,z)=>lvlMap.get(K(x,z))||0,taken=k=>TOWN.fixed.has(k)||TOWN.path.has(k);
  const fits=(x0,z0,w,h,pad)=>{const l=L(x0,z0);for(let dx=-pad;dx<w+pad;dx++)for(let dz=-pad;dz<h+pad;dz++){const x=x0+dx,z=z0+dz;
    if(!G(x,z)||taken(K(x,z)))return false;if(dx>=0&&dx<w&&dz>=0&&dz<h&&L(x,z)!==l)return false;}return true;};
  // dock: the south beach column nearest x=1 with no river nearby
  const d0=S.home&&S.home.dockX!==undefined?S.home.dockX:1;for(let r=0;r<12;r++){let ok=false;for(const x of [d0+r,d0-r]){let zz=null;for(let z=0;z<24*homeScale();z++)if(isLandT(landMap.get(K(x,z)))&&landMap.get(K(x,z))!=='bridge')zz=z;
      if(zz!==null&&landMap.get(K(x,zz))==='sand'&&![...Array(7)].some((_,i)=>riverSurf.has(K(x-3+i,zz))||riverSurf.has(K(x-3+i,zz-2)))){DOCK.x=x;DOCK.z=zz;ok=true;break;}}if(ok)break;}
  let pc=null,plotSet=new Set(),home=null;
  if(S.scratch){// a wild island: only what you've built stands; the Island Heart grows where you planted your driftseed
    if(S.heart&&S.heart.revived&&!S.heartAt){const h=heartSpot(isl);S.heartAt={x:h[0],z:h[1]};} // saves from the old heart hunt keep their tree
    pc=S.heartAt?[S.heartAt.x,S.heartAt.z]:S.homeAt?[S.homeAt.x+2,S.homeAt.z+3]:[DOCK.x,DOCK.z-3];TOWN.plaza=pc;TOWN.board=null;
    if(S.heartAt)TOWN.fixed.set(K(pc[0],pc[1]),'tree');
    for(const s of S.builds||[]){const b={t:s.t,x:s.x,z:s.z,n:s.n,roof:s.roof,door:[s.x,s.z+2],locked:S.day<=s.day};TOWN.bld.push(b);// under construction until the next morning
      for(let dx=0;dx<2;dx++)for(let dz=0;dz<2;dz++)TOWN.fixed.set(K(s.x+dx,s.z+dz),b.locked?'plot':b.t);}
    if(S.homeAt){HOUSE_AT.x=S.homeAt.x;HOUSE_AT.z=S.homeAt.z;home={t:'home',x:HOUSE_AT.x,z:HOUSE_AT.z,door:[HOUSE_AT.x,HOUSE_AT.z+2]};TOWN.bld.push(home);
      if(!S.house)TOWN.fixed.set(K(HOUSE_AT.x-1,HOUSE_AT.z+2),'decor'); // the tent's bonfire
      const binC=[[home.x+2,home.z+1],[home.x-1,home.z+1],[home.x+2,home.z],[home.x-1,home.z]].find(([x,z])=>isLand(x,z)&&!taken(K(x,z))&&!S.debris.some(d=>d.x===x&&d.z===z));if(binC){BIN_AT.x=binC[0];BIN_AT.z=binC[1];}else{BIN_AT.x=home.x+2;BIN_AT.z=home.z+1;}}
    else{HOUSE_AT.x=HOUSE_AT.z=9999;BIN_AT.x=BIN_AT.z=9999;}
    {const o=outpostSpot();if(o)TOWN.fixed.set(K(o.x,o.z),'outpost');}
    for(const e of ['tent','fire'])if(S.home&&S.home[e]){const [x,z]=S.home[e];for(let dx=0;dx<(e==='tent'?2:1);dx++)for(let dz=0;dz<(e==='tent'?2:1);dz++)TOWN.fixed.set(K(x+dx,z+dz),'decor');}
    for(const k in S.paths||{})if(S.paths[k]>=PATH_WEAR&&landMap.get(k)==='grass'&&!TOWN.fixed.has(k))TOWN.path.set(k,1);
  }else{
    // plaza: a flat 5x5 square near the middle
    for(let r=0;r<10&&!pc;r++)for(let dx=-r;dx<=r&&!pc;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const x=dx,z=1+dz;if(fits(x-2,z-2,5,5,0)){pc=[x,z];break;}}
    pc=pc||[0,1];TOWN.plaza=pc;for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const k=K(pc[0]+dx,pc[1]+dz);TOWN.path.set(k,2);}
    TOWN.fixed.set(K(pc[0],pc[1]),'tree');TOWN.board=[pc[0]+2,pc[1]-2];TOWN.fixed.set(K(...TOWN.board),'board');
    // buildings: civic ones close to the plaza, homes spread around
    const want=[{t:'hall',d:[4,7]},{t:'shop',d:[4,8]},{t:'museum',d:[4,9]},{t:'cafe',d:[4,10]},{t:'home',d:[5,9]}];for(let i=0;i<6;i++)want.push({t:'vh',d:[6,24],n:i});
    for(const w of want){let best=null,bs=-1e9;
      for(let it=0;it<900;it++){const x=Math.floor((R()-0.5)*2*(TOWN_W-3)),z=Math.floor((R()-0.5)*2*(TOWN_D-3))-1;if(!fits(x,z,2,3,1))continue;
        const d=Math.hypot(x+0.5-pc[0],z+1-pc[1]);if(d<w.d[0]||d>w.d[1])continue;let near=99;for(const b of TOWN.bld)near=Math.min(near,Math.hypot(b.x-x,b.z-z));
        const sc=(w.t==='vh'?Math.min(near,9)*0.6:-Math.abs(d-w.d[0]-1))+R()*1.5;if(sc>bs){bs=sc;best=[x,z];}}
      if(!best)continue;const [x,z]=best,b={t:w.t,x,z,n:w.n,door:[x,z+2]};
      // not built yet (Island Heart): the footprint is kept as a surveyed plot
      b.locked=w.t==='home'?false:w.t==='vh'?!movedIn(w.n):!unlocked(w.t);TOWN.bld.push(b);
      for(let dx=0;dx<2;dx++)for(let dz=0;dz<2;dz++)TOWN.fixed.set(K(x+dx,z+dz),w.t==='home'?'house':b.locked?'plot':w.t);}
    home=TOWN.bld.find(b=>b.t==='home')||{x:pc[0]-6,z:pc[1]-1,door:[pc[0]-6,pc[1]+1]};
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
  plotSet=new Set(TOWN.plot.map(([x,z])=>K(x,z)));
  }
  // static town meshes
  const p=[],gl=[],tp=[]/* trees, meshed with a far LOD (addVeg) */,y0=(x,z)=>topY(x,z);
  // the Island Heart (it grows with your level) + benches + bulletin board
  if(!S.scratch||S.heartAt){const H=heartTreeParts(S.scratch?level():10);tp.push(...shift(H.tp,pc[0],y0(...pc),pc[1],0.4));p.push(...shift(H.p,pc[0],y0(...pc),pc[1],0.4));gl.push(...shift(H.gl,pc[0],y0(...pc),pc[1],0.4));}
  if(!S.scratch)for(let i=0;i<10;i++){const a=i/10*6.283;bloom(p,[0xf2a6c8,0xffffff,0xf6d04a][i%3],0xf6d04a,pc[0]+Math.cos(a)*0.85,y0(...pc)+0.05,pc[1]+Math.sin(a)*0.85,0.07);}
  TOWN.cafeSeats=[];{const c=TOWN.bld.find(q=>q.t==='cafe'&&!q.locked);if(c)TOWN.cafeSeats.push([c.x,c.z+1],[c.x+1,c.z+1]);}
  TOWN.benches=[];if(!S.scratch)for(const [bx,bz,r] of [[pc[0]-2,pc[1]+2,0],[pc[0]+2,pc[1]+2,0]]){TOWN.benches.push([bx,bz]);const q=[];for(const [x,z] of [[-0.38,-0.1],[0.38,-0.1],[-0.38,0.12],[0.38,0.12]])q.push(P(BOX,0x5a3a2a,x,0.12,z,0,0,0,0.06,0.24,0.06));
    q.push(P(BOX,0xb07a44,0,0.26,0,0,0,0,0.9,0.06,0.34),P(BOX,0xb07a44,0,0.52,-0.16,0,0,0,0.9,0.18,0.05));p.push(...shift(q,bx,y0(bx,bz),bz,r));TOWN.fixed.set(K(bx,bz),'decor');}
  if(TOWN.board){const [bx,bz]=TOWN.board,q=[P(CYL8,0x6a4428,-0.36,0.45,0,0,0,0,0.07,0.9,0.07),P(CYL8,0x6a4428,0.36,0.45,0,0,0,0,0.07,0.9,0.07),P(BOX,0x9a6a3a,0,0.62,0,0,0,0,0.9,0.52,0.06),P(BOX,0x7a5230,0,0.92,0,0,0,0,1.0,0.07,0.12),
    P(BOX,0xf6ecd0,-0.2,0.66,0.035,0,0,0.08,0.22,0.26,0.01),P(BOX,0xf2c8d8,0.14,0.6,0.035,0,0,-0.1,0.2,0.2,0.01),P(BOX,0xd8ecf4,0.22,0.74,0.035,0,0,0.05,0.14,0.12,0.01)];p.push(...shift(q,bx,y0(bx,bz),bz,0));}
  if(S.scratch&&S.outpost){const o=S.outpost;p.push(...shift(outpostParts(),o.x,y0(o.x,o.z),o.z,o.r||0));}
  // buildings
  for(const b of TOWN.bld){if(b.t==='home')continue;const bx=b.x+0.5,bz=b.z+0.5,by=Math.min(y0(b.x,b.z),y0(b.x+1,b.z+1));
    if(b.locked){if(b.t!=='vh'||unlocked('vh'+b.n))p.push(...shift(plotParts(b,b.t==='vh'),bx,by,bz,0));continue;}
    const q=townBuilding(b,R);p.push(...shift(q.p,bx,by,bz,0));gl.push(...shift(q.gl,bx,by,bz,0));
    if(q.lit)TOWN.lamps.push([bx,by,bz+1.3]);}
  // lamps along the paths, trees and flowers on the open grass
  let pn=0;if(!S.scratch)for(const [k,v] of TOWN.path){if(v!==1)continue;if(++pn%7)continue;const [x,z]=k.split(',').map(Number);
    const side=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dz])=>[x+dx,z+dz]).find(([a,c])=>G(a,c)&&!taken(K(a,c))&&!plotSet.has(K(a,c)));if(!side)continue;
    const [lx,lz]=side,ly=y0(lx,lz);p.push(P(CYL8,0x3e3444,lx,ly+0.55,lz,0,0,0,0.07,1.1,0.07),P(BOX,0x3e3444,lx,ly+1.22,lz,0,0,0,0.26,0.05,0.26),P(CONE4,0x3e3444,lx,ly+1.32,lz,0,0.785,0,0.3,0.14,0.3));
    gl.push(P(BOX,0xfff0b8,lx,ly+1.1,lz,0,0,0,0.18,0.2,0.18));TOWN.lamps.push([lx,ly,lz]);TOWN.fixed.set(K(lx,lz),'decor');}
  const kinds=applyHomeStyle().trees;
  if(!S.scratch)for(const [x,z] of isl.grass){const k=K(x,z);if(!G(x,z)||taken(k)||plotSet.has(k)||farmQ(x,z)<1.4)continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>TOWN.path.has(K(x+dx,z+dz))||TOWN.fixed.has(K(x+dx,z+dz))&&TOWN.fixed.get(K(x+dx,z+dz))!=='decor'))continue;
    const h=hash(x*1.7+3,z*2.3-1);if(h>0.11)continue;const kd=h<0.1?kinds[Math.floor(hash(z,x)*4)]:kinds[4+Math.floor(hash(x,z)*4)];
    tp.push(...shift(treeParts(kd,mulberry(hi(x,z,5)),0x9a9ea8),x+(hash(z,x+1)-0.5)*0.2,y0(x,z),z+(hash(x+2,z)-0.5)*0.2,hash(x,z)*6.28));TOWN.fixed.set(k,'decor');if(['oak','pine','maple','mapleR','cherry','palm','palmtall','palmfan'].includes(kd))TOWN.res.set(k,'tree');}
  // town rocks to chip stone from, and a flower planter in the plaza's free corner
  if(!S.scratch){let n=0;for(const [x,z] of shuffle(isl.grass.slice(),R)){if(n>=7)break;const k=K(x,z);if(!G(x,z)||taken(k)||plotSet.has(k)||farmQ(x,z)<1.4)continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>TOWN.path.has(K(x+dx,z+dz))))continue;const rp=[];rockP(rp,mulberry(hi(x,z,9)),0x9a9ea8,0.75);p.push(...shift(rp,x,y0(x,z),z,hash(x,z)*6));
    TOWN.fixed.set(k,'decor');TOWN.res.set(k,'rock');n++;}}
  if(!S.scratch){const [px,pz]=[pc[0]-2,pc[1]-2];const q=[P(BOX,0xb0a898,0,0.15,0,0,0,0,0.8,0.3,0.8),P(BOX,0x5a3a2a,0,0.31,0,0,0,0,0.7,0.02,0.7)];wildflowers(q,mulberry(3),[0xf2a6c8,0xf6d04a,0xffffff,0xe86a5a],8,0.3);
    p.push(...shift(q.slice(0,2),px,y0(px,pz),pz,0),...shift(q.slice(2),px,y0(px,pz)+0.31,pz,0));TOWN.fixed.set(K(px,pz),'decor');}
  // the lighthouse: on the town's coast, as far from the plaza as it can be while staying in town; its beam turns at night
  {let best=null,bd=-1;for(const [x,z] of isl.grass){const k=K(x,z);if(taken(k)||plotSet.has(k)||S.tiles[k])continue;const d=Math.hypot(x-pc[0],z-pc[1]);if(d<9*homeScale()||d>22*homeScale()||d<=bd)continue;
      if(![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>isSeaT(landMap.get(K(x+dx,z+dz)))||landMap.get(K(x+dx,z+dz))==='sand'))continue;best=[x,z];bd=d;}
    if(best&&unlocked('light')){const [x,z]=best,y=y0(x,z);TOWN.fixed.set(K(x,z),'lighthouse');TOWN.light={x,z,y:y+2.72};
      p.push(P(CYL12,0x9a9ea8,x,y+0.14,z,0,0,0,0.9,0.28,0.9),P(CYL12,0xf4f0ea,x,y+1.3,z,0,0,0,0.62,2.1,0.62));for(const yy of [0.75,1.45,2.1])p.push(P(CYL12,0xd8453a,x,y+yy,z,0,0,0,0.64,0.24,0.64));
      p.push(P(CYL12,0x3a3a44,x,y+2.4,z,0,0,0,0.9,0.06,0.9),P(CONE12,0xd8453a,x,y+3.02,z,0,0,0,0.62,0.34,0.62),P(ICO2,0xd8b050,x,y+3.22,z,0,0,0,0.1,0.1,0.1),P(BOX,0x5a3a2a,x,y+0.42,z+0.3,0,0,0,0.22,0.4,0.04));
      for(let i=0;i<8;i++){const a=i/8*6.283;p.push(P(BOX,0x3a3a44,x+Math.cos(a)*0.42,y+2.52,z+Math.sin(a)*0.42,0,-a,0,0.02,0.18,0.02));}
      gl.push(P(CYL12,0xfff0b8,x,y+2.72,z,0,0,0,0.46,0.44,0.46));}}
  // palms along the town beach (shake or chop them like the other trees), clear of the dock and your boat
  if(!(S.home&&S.home.preset))for(const [x,z] of palmSpots(isl,R,8,(x,z)=>!taken(K(x,z))&&Math.hypot(x-DOCK.x,z-DOCK.z)>3.5&&!(S.boat&&Math.hypot(x-S.boat.x,z-S.boat.z)<2.5))){const k=K(x,z);
    tp.push(...shift(treeParts(PALMS[Math.floor(hash(x,z)*PALMS.length)],mulberry(hi(x,z,13)),0x9a9ea8),x,y0(x,z),z,hash(z,x)*6.28));TOWN.fixed.set(k,'decor');TOWN.res.set(k,'tree');}
  if(S.home&&S.home.fire){const [x,z]=S.home.fire,y=y0(x,z),q=campfireParts(1.3);p.push(...shift(q.p,x,y,z,0));addFire(isl.group,x,y,z,1.3);}
  if(S.home&&S.home.tent){const [x,z]=S.home.tent,t=houseGroup(0);t.position.set(x+0.5,y0(x,z),z+0.5);t.rotation.y=-0.4;isl.group.add(t);}
  isl.group.add(M(p));addVeg(isl,isl.group,tp);if(gl.length){const m=M(gl,glowMat);m.castShadow=false;isl.group.add(m);}
  // flowers, clover and pebbles: instanced over the open grass (hidden again wherever you till or build)
  {const lists=FLORA_GEOS.map(()=>[]),clov=[],peb=[];
    const wild=S.scratch?new Set(S.debris.filter(d=>d.k!=='weed').map(d=>K(d.x,d.z))):null;
    for(const [x,z] of isl.grass){const k=K(x,z);if(!G(x,z)||taken(k)||farmQ(x,z)<1.3||(wild&&wild.has(k)))continue;const h=hash(x*4.1-2,z*3.3+7);
      if(wild&&season()==='winter')continue;/* no wildflowers under the snow */const fd=Math.pow(homeScale(),-1.5)/* a big preset island spreads its flowers thinner */*(wild?(wildMeadow(x,z)>0.6?2.6:0.55):1)/* wild flowers grow in fields */;if(h<0.34*fd)lists[floraIndex(x,z)].push([x,z]);else if(h<0.43*fd&&h>=0.34*fd)clov.push([x,z]);}
    for(const [k,v] of TOWN.path){if(v!==1)continue;const [x,z]=k.split(',').map(Number);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(G(x+dx,z+dz)&&!TOWN.path.has(K(x+dx,z+dz))&&hash(x*7+dx,z*5+dz)<0.35)peb.push([x+dx*0.46,z+dz*0.46,x,z]);}
    const mk=(geo,list,mat,track)=>{if(!list.length)return null;const im=new T.InstancedMesh(geo,mat,list.length);list.forEach(([x,z,tx,tz],i)=>{const tile=tx===undefined?[x,z]:[tx,tz];
        _e.set(0,hash(x,z)*6.28,0);_q.setFromEuler(_e);_m.compose(_v.set(x+(tx===undefined?(hash(z,x)-0.5)*0.4:0),y0(...tile),z+(tx===undefined?(hash(x+1,z)-0.5)*0.4:0)),_q,_s.set(0.9,0.9+hash(z*2,x)*0.2,0.9));im.setMatrixAt(i,_m);
        if(track){const k=K(x,z);if(!TOWN.flora.has(k))TOWN.flora.set(k,[]);TOWN.flora.get(k).push([im,i,_m.toArray()]);}});
      im.frustumCulled=false;im.receiveShadow=true;isl.group.add(im);return im;};
    // each flower batch also gets a light twin for when you're zoomed out (cullIslands swaps them; clover just hides)
    isl.floraLod=[];FLORA_GEOS.forEach((g0,i)=>{const hi=mk(g0,lists[i],flowerMat,true);if(!hi)return;const lo=mk(FLORA_LO[i],lists[i],flowerMat,true);lo.visible=false;isl.floraLod.push([hi,lo]);});
    {const c=mk(CLOVER_GEO,clov,flowerMat,true);if(c)isl.floraLod.push([c,null]);}mk(PEBBLE_GEO,peb,vcMat,false);}
  for(const [x,y,z] of TOWN.lamps){const pm=pool(y+0.03,1);pm.position.x=x;pm.position.z=z;isl.group.add(pm);}}
// one building's parts, centred on its 2x2 footprint, door facing +z
function townBuilding(b,R){const p=[],gl=[];let lit=true;
  if(b.t==='shop'){p.push(P(BOX,0xc8905a,0,0.55,0,0,0,0,1.8,1.1,1.5),P(BOX,0xa87444,0,0.05,0,0,0,0,1.86,0.1,1.56));roof(p,0x4f8a4a,0xc8905a,1.9,0.8,1.5,1.1);
    for(let i=0;i<7;i++)p.push(P(BOX,i%2?0xf4f0e6:0xd8453a,-0.78+i*0.26,0.98,0.86,0.35,0,0,0.26,0.05,0.5));
    p.push(P(BOX,0x6a4a30,0,0.38,0.76,0,0,0,0.42,0.72,0.04),P(BOX,0xf6ecd0,0,1.36,0.78,0,0,0,0.9,0.26,0.04),P(ICO2,0x5fae44,-0.28,1.36,0.8,0,0,0,0.12,0.14,0.04));
    gl.push(P(BOX,0x404a60,-0.6,0.55,0.76,0,0,0,0.34,0.3,0.03),P(BOX,0x404a60,0.6,0.55,0.76,0,0,0,0.34,0.3,0.03));
    for(const [x,c] of [[-0.95,0xa87444],[0.98,0x9a6a3a]])p.push(P(BOX,c,x,0.16,1.05,0,0.3,0,0.3,0.3,0.3),P(ICO2,x<0?0xf08a2a:0xe0303a,x,0.36,1.05,0,0,0,0.14,0.12,0.14));
    /* hanging sign: a basket of produce */p.push(P(BOX,0x5a3a2a,0.72,1.1,0.95,0,0,0,0.5,0.04,0.04),P(BOX,0xf6ecd0,0.82,0.92,0.95,0,0,0,0.34,0.26,0.03),P(BOX,0x8a5a3a,0.82,0.88,0.97,0,0,0,0.2,0.08,0.02),P(ICO2,0xe0303a,0.76,0.96,0.97,0,0,0,0.07,0.07,0.02),P(ICO2,0xf08a2a,0.86,0.97,0.97,0,0,0,0.07,0.07,0.02),P(ICO2,0x6ab84a,0.82,1.01,0.97,0,0,0,0.06,0.05,0.02));}
  else if(b.t==='museum'){// a grand little museum: stone steps, columns, a glass dome with a gold fish weathervane, aquarium windows and banners
    const ST=0xeee6d4,ST2=0xd8d0c0,GOLD=0xd8b050;
    p.push(P(BOX,0xc8c0b0,0,0.06,0,0,0,0,2.2,0.12,2.0),P(BOX,ST,0,0.8,-0.25,0,0,0,2.0,1.36,1.3),P(BOX,ST2,0,0.2,-0.25,0,0,0,2.04,0.16,1.34),P(BOX,GOLD,0,1.44,-0.25,0,0,0,2.06,0.06,1.36));
    for(let i=0;i<3;i++)p.push(P(BOX,i%2?ST2:0xe0d8c8,0,0.05+i*0.05,0.95-i*0.12,0,0,0,1.3-i*0.12,0.1+i*0.1,0.14));
    for(const x of [-0.78,-0.26,0.26,0.78])p.push(P(CYL12,0xf8f4ea,x,0.8,0.72,0,0,0,0.15,1.2,0.15),P(BOX,ST2,x,0.23,0.72,0,0,0,0.22,0.06,0.22),P(BOX,ST2,x,1.4,0.72,0,0,0,0.22,0.06,0.22));
    p.push(P(BOX,ST,0,1.5,0.62,0,0,0,2.1,0.12,0.5),P(PRISM,ST2,0,1.74,0.62,0,0,0,2.1,0.36,0.5),P(CYL12,GOLD,0,1.68,0.88,1.57,0,0,0.3,0.03,0.3),P(CYL12,0x8a6040,0,1.68,0.9,1.57,0,0,0.22,0.02,0.22));
    for(const [x,y] of [[0,1.68],[-0.07,1.72],[0.07,1.72],[-0.07,1.64],[0.07,1.64]])p.push(P(CYL6,0x6aa86a,x,y,0.91,1.57,0,0,0.06,0.01,0.06));/* turtle-shell crest */
    // door and the two aquarium windows (your fish swim in front of the blue glass, see refreshMuseumShow)
    p.push(P(BOX,GOLD,0,0.56,0.41,0,0,0,0.5,0.8,0.02),P(BOX,0x5a3a2a,0,0.54,0.42,0,0,0,0.42,0.72,0.02),P(ICO2,GOLD,0.12,0.54,0.44,0,0,0,0.04,0.04,0.03));
    for(const x of [-0.62,0.62])p.push(P(BOX,GOLD,x,0.8,0.405,0,0,0,0.46,0.5,0.02),P(BOX,0x4aa0d0,x,0.8,0.41,0,0,0,0.4,0.44,0.02),P(BOX,0xe8d6a8,x,0.61,0.43,0,0,0,0.4,0.05,0.05));
    // dome with a gold finial and a fish weathervane
    p.push(P(CYL12,ST2,0,1.6,-0.3,0,0,0,1.0,0.24,1.0),P(ICO2,0x7ac8c0,0,1.72,-0.3,0,0,0,0.96,0.78,0.96),P(CYL12,GOLD,0,1.72,-0.3,0,0,0,1.0,0.04,1.0),P(CYL8,GOLD,0,2.2,-0.3,0,0,0,0.03,0.3,0.03),
      P(ICO2,GOLD,0,2.36,-0.3,0,0,0,0.05,0.1,0.22),P(CONE4,GOLD,0,2.36,-0.44,1.57,0.785,0,0.1,0.1,0.02));
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;p.push(P(BOX,0xfbf8f0,Math.sin(a)*0.46,1.9,-0.3+Math.cos(a)*0.46,0,a,0,0.02,0.3,0.1));}
    // banners: fish in blue, butterfly in green
    for(const [x,c,e] of [[-0.98,0x3a6ab0,'fish'],[0.98,0x4a8a4a,'bug']]){p.push(P(BOX,GOLD,x,1.38,0.82,0,0,0,0.3,0.03,0.03),P(BOX,c,x,1.12,0.82,0,0,0,0.26,0.5,0.02),P(PRISM,c,x,0.82,0.82,Math.PI,0,0,0.26,0.1,0.02));
      if(e==='fish')p.push(P(ICO2,0xf6d04a,x,1.14,0.835,0,0,0,0.12,0.08,0.02),P(CONE4,0xf6d04a,x+0.08,1.14,0.835,0,0,1.57,0.06,0.06,0.01));
      else p.push(P(ICO2,0xf6d04a,x-0.05,1.16,0.835,0,0,0.5,0.08,0.1,0.02),P(ICO2,0xf6d04a,x+0.05,1.16,0.835,0,0,-0.5,0.08,0.1,0.02),P(ICO2,0xf39ab0,x-0.04,1.07,0.835,0,0,0.3,0.06,0.07,0.02),P(ICO2,0xf39ab0,x+0.04,1.07,0.835,0,0,-0.3,0.06,0.07,0.02));}
    // flower planters at the front corners (your butterflies visit them)
    for(const x of [-0.95,0.95]){p.push(P(BOX,ST2,x,0.2,1.0,0,0,0,0.42,0.28,0.36),P(BOX,0x5a3a2a,x,0.35,1.0,0,0,0,0.36,0.02,0.3));const q=[];wildflowers(q,mulberry(x>0?5:6),[0xf2a6c8,0xf6d04a,0xffffff,0xb8a8f2],7,0.15);p.push(...shift(q,x,0.36,1.0,0));}
    gl.push(P(BOX,0xfff0b8,-0.26,1.2,0.86,0,0,0,0.1,0.14,0.1),P(BOX,0xfff0b8,0.26,1.2,0.86,0,0,0,0.1,0.14,0.1));}
  else if(b.t==='cafe'){// the harbour café: a sailcloth awning, a big window, a coffee-cup sign and a little patio with parasols
    p.push(P(BOX,0xf4ecdc,0,0.55,-0.35,0,0,0,1.8,1.1,1.1),P(BOX,0x9a9ea8,0,0.05,-0.35,0,0,0,1.86,0.1,1.16),P(BOX,0x86c8b8,0,1.12,-0.35,0,0,0,1.86,0.06,1.16));roof(p,0x86c8b8,0xf4ecdc,1.9,0.6,1.1,1.1,0,-0.35);
    for(let i=0;i<7;i++)p.push(P(BOX,i%2?0xfbf8f0:0x86c8b8,-0.78+i*0.26,0.96,0.34,0.4,0,0,0.26,0.03,0.42));
    p.push(P(BOX,0x6a4a3a,-0.45,0.38,0.21,0,0,0,0.4,0.72,0.03),P(ICO2,0xd8b050,-0.34,0.38,0.235,0,0,0,0.04,0.04,0.02));gl.push(P(BOX,0x404a60,0.35,0.55,0.21,0,0,0,0.7,0.46,0.02));p.push(P(BOX,0xfbf8f0,0.35,0.55,0.2,0,0,0,0.78,0.54,0.02));
    p.push(P(CYL12,0xfbf8f0,0,1.55,-0.2,0,0,0,0.34,0.3,0.34),P(CYL12,0x7a4a2a,0,1.7,-0.2,0,0,0,0.3,0.02,0.3),P(CYL12,0xfbf8f0,0.2,1.55,-0.2,1.57,0,0,0.14,0.05,0.14),P(BOX,0x86c8b8,0,1.35,-0.2,0,0,0,0.06,0.2,0.06));
    for(const x of [-0.5,0.5]){p.push(P(CYL12,0xfbf8f0,x,0.36,0.62,0,0,0,0.34,0.03,0.34),P(CYL6,0x5a4a3a,x,0.18,0.62,0,0,0,0.04,0.36,0.04),P(CYL6,0x5a4a3a,x,0.62,0.62,0,0,0,0.03,0.5,0.03));
      for(let i=0;i<8;i++){const a=i/8*6.283;p.push(P(CONE4,i%2?0xfbf8f0:0xe8866a,x+Math.cos(a)*0.12,0.9,0.62+Math.sin(a)*0.12,Math.sin(a)*0.5,0,-Math.cos(a)*0.5,0.22,0.12,0.12));}
      p.push(P(CYL12,0xd8b050,x+0.06,0.4,0.6,0,0,0,0.06,0.06,0.06));}
    p.push(P(BOX,0x3a3a44,0.95,0.3,0.55,0.2,0,0,0.3,0.44,0.04),P(BOX,0xfbf8f0,0.95,0.34,0.575,0.2,0,0,0.2,0.02,0.01),P(BOX,0xfbf8f0,0.95,0.26,0.575,0.2,0,0,0.16,0.02,0.01));}
  else if(b.t==='hall'){p.push(P(BOX,0xf1e3c6,0,0.62,0,0,0,0,2.0,1.24,1.5),P(BOX,0xb8ae9a,0,0.06,0,0,0,0,2.06,0.12,1.56));roof(p,0x5a6ab0,0xf1e3c6,2.1,0.8,1.5,1.24);
    p.push(P(BOX,0xf1e3c6,0,1.95,0.1,0,0,0,0.6,0.7,0.6),P(CONE4,0x5a6ab0,0,2.5,0.1,0,0.785,0,0.9,0.44,0.9),P(CYL12,0xf6f0e0,0,2.0,0.41,1.57,0,0,0.36,0.03,0.36),P(BOX,0x3a2a2a,0.04,2.03,0.43,0,0,0.6,0.02,0.16,0.01),P(BOX,0x3a2a2a,0,2.0,0.43,0,0,0,0.12,0.02,0.01));
    p.push(P(BOX,0x6a4a3a,0,0.42,0.76,0,0,0,0.5,0.8,0.04),P(CYL8,0x8a8e98,0.95,0.9,0.95,0,0,0,0.04,1.8,0.04),P(BOX,0x5fae44,1.08,1.66,0.95,0,0,0,0.26,0.18,0.02),P(ICO2,0xf6d04a,1.08,1.66,0.965,0,0,0,0.08,0.08,0.01));
    for(const x of [-0.62,0.62])gl.push(P(BOX,0x404a60,x,0.72,0.76,0,0,0,0.3,0.36,0.03));}
  else archHouse(b.n|0,p,gl);/* every neighbour's house in a real architectural style (55c) */
  return{p,gl,lit};}
// a campfire in a ring of stones, crossed logs and a flame
function campfireParts(s=1){const p=[],gl=[];
  // a ring of chunky stones, a bed of ash and glowing embers, and a teepee of logs leaning in over it
  for(let i=0;i<12;i++){const a=i/12*6.283+0.1,r=0.44*s*(0.94+hash(i,3)*0.12);p.push(PG(SPH_LO,i%3?0x8e8a94:0x7a7682,0x4a4652,Math.cos(a)*r,0.08*s,Math.sin(a)*r,0,a,0,(0.2+hash(i,7)*0.06)*s,(0.15+hash(i,5)*0.05)*s,0.17*s));}
  p.push(P(SPH_LO,0x3a2e2a,0,0.03*s,0,0,0,0,0.72*s,0.06*s,0.72*s),P(SPH_XS,0xff7a28,0,0.07*s,0,0,0,0,0.42*s,0.07*s,0.42*s),P(SPH_XS,0xffb040,0.05*s,0.09*s,-0.04*s,0,0,0,0.2*s,0.05*s,0.2*s));
  for(let i=0;i<6;i++){const a=i/6*6.283+0.4,lean=0.5;p.push(PG(CYL6,i%2?0x8a5a34:0x6e4428,0x3a2418,Math.cos(a)*0.2*s,0.27*s,Math.sin(a)*0.2*s,-Math.sin(a)*lean,0,Math.cos(a)*lean,0.075*s,0.62*s,0.075*s));}/* leaning in to meet over the fire */
  // a couple of spare logs by the fire
  p.push(P(CYL6,0x8a5a34,0.62*s,0.06*s,0.3*s,Math.PI/2,0.5,0,0.1*s,0.5*s,0.1*s),P(CYL6,0x6e4428,0.66*s,0.06*s,0.44*s,Math.PI/2,0.35,0,0.1*s,0.46*s,0.1*s),P(CYL6,0xd8b890,0.86*s,0.06*s,0.44*s,Math.PI/2,0.35,0,0.07*s,0.02*s,0.07*s));
  return{p,gl:flameParts(s)};}
// the flame alone: licking tongues round a bright core, white-gold at the root and red at the tips; flameMat makes them
// sway and flicker in the shader, and updateFires grows it from a daytime flicker to a roaring bonfire at night
function flameParts(s=1){const p=[PG(SCONE,0xff4a18,0xffc040,0,0.5*s,0,0,0,0,0.5*s,1.0*s,0.5*s),PG(SCONE,0xffa030,0xfff6c8,0,0.34*s,0,0,0.5,0,0.3*s,0.62*s,0.3*s)];
  for(let i=0;i<7;i++){const a=i/7*6.283,r=0.16*s,h=(0.55+hash(i,11)*0.4)*s;p.push(PG(SCONE,i%2?0xe8401a:0xff6a24,0xffd060,Math.cos(a)*r,h*0.5,Math.sin(a)*r,Math.sin(a)*0.22,a,-Math.cos(a)*0.22,0.24*s,h,0.24*s));}
  return p;}
// a wooden bench (plank seat on two little legs)
function benchParts(p,x,z,r){const q=[P(BOX,0x9a6438,0,0.2,0,0,0,0,0.9,0.07,0.3),P(BOX,0x7a4a2a,-0.34,0.09,0,0,0,0,0.08,0.18,0.24),P(BOX,0x7a4a2a,0.34,0.09,0,0,0,0,0.08,0.18,0.24)];p.push(...shift(q,x,0,z,r));}
// every fire: the flames sway in their shader, grow at dusk into a roaring bonfire that throws warm light and a glow on the
// ground, and send up sparks (and a thread of smoke by day). One shared point light sits in the fire nearest the camera.
const fires=new Set(),flameU={uT:{value:0}},_fv=new T.Vector3();
const flameMat=new T.MeshBasicMaterial({vertexColors:true});
flameMat.onBeforeCompile=sh=>{sh.uniforms.uT=flameU.uT;sh.uniforms.glowA=GLOW_A;sh.fragmentShader='uniform float glowA;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.a=1.-glowA;');/* (a light source: 30-render GLOW_A) */sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  float fh=max(transformed.y,0.0),fw=fh*fh*1.8;
  transformed.x+=(sin(uT*8.0+fh*7.0+position.z*6.0)*0.08+sin(uT*15.0+fh*13.0+position.x*4.0)*0.03)*fw;
  transformed.z+=(cos(uT*7.0+fh*6.0+position.x*6.0)*0.08+cos(uT*13.0+fh*11.0)*0.03)*fw;
  transformed.y*=1.0+sin(uT*11.0+position.x*9.0+position.z*7.0)*0.14*fh;`);};
const firePoolMat=new T.MeshBasicMaterial({map:glowTex,color:0xffb070,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:0});
const fireLight=new T.PointLight(0xff9a4c,0,10,2);scene.add(fireLight);/* one warm light, carried to whichever fire is nearest the view */
function addFire(parent,x,y,z,s=1){const f=M(flameParts(s),flameMat);f.castShadow=false;f.receiveShadow=false;f.position.set(x,y+0.04*s,z);f.userData.s=s;parent.add(f);fires.add(f);
  const pm=new T.Mesh(POOL_GEO,firePoolMat);pm.position.set(x,y+0.04,z);pm.scale.setScalar(1.5*s);pm.userData.noThumb=true;pm.renderOrder=2;pm.frustumCulled=false;parent.add(pm);return f;}
// how lit a fire wants to be: a small flame by day, a bonfire from dusk (and whenever you sit by it or have just lit it)
function fireWant(x,z){const near=Math.hypot(x-vil.x,z-vil.z)<3.5,boost=near&&(rest||pitch&&pitch.lit);return boost?1:0.4+0.6*smooth(0.12,0.55,nightF);}
function updateFires(dt,tt){flameU.uT.value=tt;let best=null,bd=26*26,bl=0;
  for(const f of fires){if(!f.parent){fires.delete(f);continue;}let o=f.parent,vis=true,root=f;while(o){/* (from the parent: a fire that has died down hides itself) */if(!o.visible){vis=false;break;}root=o;o=o.parent;}if(!vis||root!==scene)continue;/* (previews and thumbnails aren't in the world) */
    f.getWorldPosition(_v);const u=f.userData,s=u.s||1,want=u.hold!==undefined?u.hold:fireWant(_v.x,_v.z);if(u.lit===undefined)u.lit=want;
    const was=u.lit;u.lit+=(want-u.lit)*Math.min(1,dt*(want>u.lit?1.6:0.5));
    const near=Math.abs(_v.x-cam.tx)<24&&Math.abs(_v.z-cam.tz)<24;
    // flaring up: a whoosh and a shower of sparks as it catches
    if(was<0.7&&u.lit>=0.7&&near){if(Math.hypot(_v.x-vil.x,_v.z-vil.z)<8){noise(0.6,0.07,420,0.6);noise(0.3,0.04,1600,1);}for(let i=0;i<22;i++){const a=Math.random()*6.28;emit(_v.x,_v.y+0.4*s,_v.z,{vx:Math.cos(a)*0.8,vy:1.4+Math.random()*1.4,vz:Math.sin(a)*0.8,life:1.4,max:1.4,size:0.045,color:Math.random()<0.5?0xffb040:0xffe080,g:0.4,sw:0.6,ph:Math.random()*6});}}
    const L=u.lit,ph=f.id*1.7,fl=1+Math.sin(tt*9+ph)*0.05+Math.sin(tt*23+ph)*0.03;f.scale.set(L*fl,L*(1+Math.sin(tt*6.3+ph)*0.08),L*fl);f.rotation.y+=dt*0.35;f.visible=L>0.02;
    if(near){if(Math.random()<dt*(2+L*12))emit(_v.x+(Math.random()-0.5)*0.3*s,_v.y+(0.4+L*0.5)*s,_v.z+(Math.random()-0.5)*0.3*s,{vx:(Math.random()-0.5)*0.3,vy:0.8+Math.random()*0.9*L,vz:(Math.random()-0.5)*0.3,life:1.3,max:1.3,size:0.03+L*0.02,color:Math.random()<0.5?0xffb040:0xffe080,g:0,sw:0.7,ph:Math.random()*6});
      if(nightF<0.35&&Math.random()<dt*1.4)emit(_v.x+(Math.random()-0.5)*0.15,_v.y+(0.6+L*0.4)*s,_v.z+(Math.random()-0.5)*0.15,{vx:0.12,vy:0.45,vz:0.04,life:3,max:3,size:0.09,color:0xd8d2cc,g:-0.05,sw:0.5,ph:Math.random()*6});}
    const d=(_v.x-cam.tx)**2+(_v.z-cam.tz)**2;if(d<bd){bd=d;best=_fv.copy(_v);bl=L*s;}}
  const fk=0.85+Math.sin(tt*13)*0.08+Math.sin(tt*29)*0.05+Math.sin(tt*5.3)*0.05;
  if(best){fireLight.position.set(best.x,best.y+0.9,best.z);fireLight.intensity=Math.max(0,nightF*0.9+0.08)*Math.min(bl,1.1)*1.15*fk;/* a warm pool round the fire, fading out over a few steps */}else fireLight.intensity=0;
  firePoolMat.opacity=clamp(nightF*1.1+0.05,0,1)*clamp(bl,0,1)*fk*0.7;}
/* ---- the lighthouse beam: two long shafts of light turning slowly from the lantern once dusk falls. Each is a wide
   soft cone reaching far out over the sea and a narrower bright core inside it, both fading smoothly to nothing along
   their length (brightness in the vertex colours, drawn additively, so dark is see-through), with a glow at the lamp ---- */
const beamMat=new T.MeshBasicMaterial({color:0xffe6a0,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,fog:false,side:T.DoubleSide});
// a cone with its tip at the origin, opening along +x to radius 1 at x=1; brightness falls off with distance (and is
// softened right at the tip so the lamp doesn't flare)
function beamGeo(fall){const g=new T.ConeGeometry(1,1,24,16,true).translate(0,-0.5,0).rotateZ(Math.PI/2),p=g.attributes.position,c=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const t=clamp(p.getX(i),0,1),v=Math.pow(1-t,fall)*smooth(0,0.04,t);c[i*3]=c[i*3+1]=c[i*3+2]=v;}
  g.setAttribute('color',new T.BufferAttribute(c,3));return g;}
let beam=null,beamGlow=null;
function updateLighthouse(dt,tt){const L=TOWN.light,isl=islands[0];if(!L||!isl||!isl.group){return;}
  if(!beam||beam.parent!==isl.group){beam=new T.Group();const wide=beamGeo(1.6),core=beamGeo(2.4);
    for(const s of [0,Math.PI]){const arm=new T.Group();arm.rotation.y=s;arm.rotation.z=-0.035;/* (dipping a touch, to sweep the water) */
      const w=new T.Mesh(wide,beamMat);w.scale.set(46,3.6,3.6);const c=new T.Mesh(core,beamMat);c.scale.set(34,1.1,1.1);arm.add(w,c);beam.add(arm);}
    beamGlow=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xffe0a0,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,fog:false}));beamGlow.scale.set(2.6,2.6,1);beam.add(beamGlow);
    beam.position.set(L.x,L.y,L.z);beam.renderOrder=3;isl.group.add(beam);}
  const on=clamp((nightF-0.25)*2.5,0,1);beamMat.opacity=on*0.55;beamGlow.material.opacity=on*0.9;beam.visible=on>0.01;if(beam.visible){beam.rotation.y=tt*0.5;beamGlow.rotation.y=0;}}
