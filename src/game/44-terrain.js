// a unit tile (y 0..1) with any of its four corners rounded off; bit0=-x-z, bit1=+x-z, bit2=+x+z, bit3=-x+z
const RTILE={},TILE_R=0.42;
function rtileGeo(mask){if(RTILE[mask])return RTILE[mask];const C=[[-1,1],[1,1],[1,-1],[-1,-1]],pts=[];
  [3,2,1,0].forEach((b,j)=>{const [sx,sy]=C[b];if(mask>>b&1){const cx=sx*(0.5-TILE_R),cy=sy*(0.5-TILE_R),a0=Math.PI+j*Math.PI/2;for(let t=0;t<=5;t++){const a=a0+t/5*Math.PI/2;pts.push(new T.Vector2(cx+Math.cos(a)*TILE_R,cy+Math.sin(a)*TILE_R));}}
    else pts.push(new T.Vector2(sx*0.5,sy*0.5));});
  const g=new T.ExtrudeGeometry(new T.Shape(pts),{depth:1,bevelEnabled:false,steps:1,curveSegments:5});g.rotateX(-Math.PI/2);g.clearGroups();g.computeVertexNormals();return RTILE[mask]=g;}
const CORNERS=[[-1,-1],[1,-1],[1,1],[-1,1]];
// terrain height class of a tile, for deciding which corners to round: grass level, -1 sand, -5 river, 50 bridge, -9 water
function hclass(x,z){const t=landMap.get(K(x,z));return t==='grass'?(lvlMap.get(K(x,z))||0):t==='sand'?-1:t==='river'?-5:t==='bridge'?50:-9;}
function inNotch(mask,lx,lz){for(let b=0;b<4;b++)if(mask>>b&1){const [sx,sz]=CORNERS[b],c=0.5-TILE_R;if(lx*sx>c&&lz*sz>c&&Math.hypot(lx-sx*c,lz-sz*c)>TILE_R-0.06)return true;}return false;}
const CMASK=new Map();
const _gc1=new T.Color(),_gc2=new T.Color();
function groundCol(list,x,z,seed){const n=vnoise(x*0.7+11,z*0.7-5,seed|0),m=vnoise(x*2.1-3,z*2.1+8,(seed|0)+7);_gc1.set(list[0]).lerp(_gc2.set(list[1%list.length]),n);if(list[2])_gc1.lerp(_gc2.set(list[2]),Math.max(0,m-0.55));return _gc1.getHex();}
function islandBounds(isl){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const k of isl.keys){const [x,z]=k.split(',').map(Number);if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z;}
  isl.bc={x:(x0+x1)/2,z:(z0+z1)/2,r:Math.hypot(x1-x0,z1-z0)/2+2};}
function cullIslands(){const view=cam.dist+70;for(const isl of islands){const b=isl.bc;if(!b)continue;const vis=Math.hypot(b.x-cam.tx,b.z-cam.tz)-b.r<view;
    if(isl.group)isl.group.visible=vis;if(isl.pgroup)isl.pgroup.visible=vis;}}
function buildIsland(isl){
  if(isl.group){scene.remove(isl.group);isl.group.traverse(o=>{if(o.isInstancedMesh)o.dispose();else if(o.geometry&&!Object.values(RTILE).includes(o.geometry)&&o.geometry!==TILE_PLANE&&o.geometry!==BOX&&o.geometry!==POOL_GEO&&o.geometry!==BLADES)o.geometry.dispose();});}
  if(isl.keys)for(const k of isl.keys){landMap.delete(k);islMap.delete(k);lvlMap.delete(k);riverSurf.delete(k);bridgeY.delete(k);}
  const g=new T.Group();isl.group=g;isl.keys=[];isl.grass=[];isl.sand=[];const a1=[],a2=[];
  const span=Math.ceil(islR(isl)/0.62+3),B=BIOMES[isl.biome];
  for(let x=isl.home?Math.min(isl.cx-span,FARM.x-11):isl.cx-span;x<=isl.cx+span;x++)for(let z=isl.cz-span;z<=isl.cz+span;z++){
    const t=tileTypeI(isl,x,z);if(!t)continue;const k=K(x,z);
    if(landMap.has(k)&&islMap.get(k)!==isl.id)continue;
    landMap.set(k,t);islMap.set(k,isl.id);isl.keys.push(k);
    if(t==='grass'){const l=levelOf(isl,x,z);if(l)lvlMap.set(k,l);}
    (t==='grass'?isl.grass:t==='sand'?isl.sand:t==='s1'?a1:a2).push([x,z]);}
  if(isl.riverN)carveRivers(isl,g);
  if(isl.home){layoutTown(isl);setPathMask(TOWN.path);}
  // grass tiles: a grassy slab on top of a dirt or rock cliff, like the tiers of Wild World
  // grass and sand tiles, drawn with rounded outer corners; the notch shows whatever lies just below (sand, lower grass, or the sea)
  const byMask=new Map(),under=[];const put=(mask,e)=>{if(!byMask.has(mask))byMask.set(mask,{g:[],s:[]});byMask.get(mask)[e.kind].push(e);};
  const sandCol=(x,z)=>{const c=_c.setHex(groundCol(B.sand,x,z,isl.seed)).multiplyScalar(0.97+hash(x*5,z*3)*0.04);
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>hclass(x+dx,z+dz)===-9))c.lerp(_a.set(0xb89868),0.28);return c.getHex();};
  for(const [x,z] of isl.grass){const L=hclass(x,z);let mask=0;
    CORNERS.forEach(([dx,dz],b)=>{const n=[hclass(x+dx,z),hclass(x,z+dz),hclass(x+dx,z+dz)];if(n.some(v=>v>=L||v===-5))return;mask|=1<<b;
      const hm=Math.max(...n);if(hm>=0)under.push([x+dx*0.25,z+dz*0.25,TOP.grass+hm*LVH,groundCol(B.grass,x+dx,z+dz,isl.seed),grassTopMat]);
      else if(hm===-1)under.push([x+dx*0.25,z+dz*0.25,TOP.sand,sandCol(x+dx,z+dz),sandMat]);});
    CMASK.set(K(x,z),mask);put(mask,{kind:'g',x,z});}
  for(const [x,z] of isl.sand){let mask=0;CORNERS.forEach(([dx,dz],b)=>{if([hclass(x+dx,z),hclass(x,z+dz),hclass(x+dx,z+dz)].every(v=>v===-9))mask|=1<<b;});put(mask,{kind:'s',x,z});}
  for(const [mask,{g:gl,s:sl}] of byMask){const geo=rtileGeo(mask);
    if(gl.length){const body=new T.InstancedMesh(geo,cliffMat,gl.length);
      gl.forEach(({x,z},i)=>{const ty=topY(x,z),h=ty-0.14+0.6;_m.compose(_v.set(x,-0.6,z),_q.identity(),_s.set(1,h,1));body.setMatrixAt(i,_m);body.setColorAt(i,_c.set(B.cliff).multiplyScalar(0.92+hash(z,x)*0.12));});
      body.receiveShadow=true;body.castShadow=true;body.frustumCulled=false;g.add(body);
      // grass tops (dirt paths are painted into this material from the path mask, see 31-ground)
      {const top=new T.InstancedMesh(geo,grassTopMat,gl.length);
        gl.forEach(({x,z},i)=>{const ty=topY(x,z);_m.compose(_v.set(x,ty-0.14,z),_q.identity(),_s.set(1,0.14,1));top.setMatrixAt(i,_m);top.setColorAt(i,_c.setHex(groundCol(B.grass,x,z,isl.seed)));});
        top.receiveShadow=true;top.castShadow=true;top.frustumCulled=false;g.add(top);}}
    if(sl.length){const im=new T.InstancedMesh(geo,sandMat,sl.length);sl.forEach(({x,z},i)=>{_m.compose(_v.set(x,-0.6,z),_q.identity(),_s.set(1,TOP.sand+0.6,1));im.setMatrixAt(i,_m);im.setColorAt(i,_c.setHex(sandCol(x,z)));});
      im.receiveShadow=true;im.castShadow=true;im.frustumCulled=false;g.add(im);}}
  for(const mat of [grassTopMat,sandMat]){const list=under.filter(u=>u[4]===mat);if(!list.length)continue;const im=new T.InstancedMesh(BOX,mat,list.length);list.forEach(([x,z,ty,col],i)=>{_m.compose(_v.set(x,(ty-0.6)/2,z),_q.identity(),_s.set(0.5,ty+0.6,0.5));im.setMatrixAt(i,_m);im.setColorAt(i,_c.setHex(col));});
    im.receiveShadow=true;im.frustumCulled=false;g.add(im);}
  if(isl.grass.length)buildGrass(isl,g);
  // shallow-water bands, with rounded outer corners so the coast doesn't step in squares
  const shc=(x,z)=>{const t=landMap.get(K(x,z));return t==='s1'?1:t==='s2'?2:t?0:3;};
  const flat=(list,mat,y,lvl)=>{const groups=new Map();for(const [x,z] of list){let mask=0;CORNERS.forEach(([dx,dz],b)=>{if([shc(x+dx,z),shc(x,z+dz),shc(x+dx,z+dz)].every(v=>v>lvl))mask|=1<<b;});
      if(!groups.has(mask))groups.set(mask,[]);groups.get(mask).push([x,z]);}
    for(const [mask,l] of groups){const im=new T.InstancedMesh(rtileGeo(mask),mat,l.length);im.frustumCulled=false;l.forEach(([x,z],i)=>{_m.compose(_v.set(x,y,z),_q.identity(),_s.set(1,0.002,1));im.setMatrixAt(i,_m);});g.add(im);}};
  flat(a1,s1Mat,0.012,1);flat(a2,s2Mat,0.006,2);
  const blocked=new Set();
  if(isl.home){
    const DX=DOCK.x;isl.dockZ=DOCK.z;const dz=DOCK.z;
    const p=[];
    for(let i=0;i<8;i++){const z=dz+0.2+i*0.5;p.push(P(BOX,i%2?0xa27a50:0x94704a,DX,0.26,z,0,0,0,0.95,0.07,0.46));}
    for(let i=0;i<4;i++){const z=dz+0.6+i;p.push(P(CYL8,0x5a3a2a,DX-0.5,0.12,z,0,0,0,0.12,0.5,0.12),P(CYL8,0x5a3a2a,DX+0.5,0.12,z,0,0,0,0.12,0.5,0.12));}
    // wooden bridge west to the farm field (two planks wide), wherever water separates them
    isl.bridge=[];
    for(const bz of [FARM.z-1,FARM.z]){let x=FARM.x,n=0;while(isLandT(landMap.get(K(x,bz)))&&n++<40)x++;
      n=0;while(n++<30){const k=K(x,bz),t=landMap.get(k);if(t==='grass'||t==='sand'||t==='river')break;
        landMap.set(k,'bridge');islMap.set(k,0);if(!isl.keys.includes(k))isl.keys.push(k);isl.bridge.push([x,bz]);x++;}}
    for(const [x,z] of isl.bridge){for(let j=0;j<2;j++)p.push(P(BOX,(x+j)%2?0xa27a50:0x94704a,x-0.25+j*0.5,0.28,z,0,0,0,0.46,0.07,1.02));
      const edge=z===FARM.z-1?-0.5:z===FARM.z?0.5:0;if(edge){p.push(P(BOX,0x7a5230,x,0.52,z+edge*0.92,0,0,0,1.02,0.06,0.06),P(CYL8,0x5a3a2a,x,0.2,z+edge*0.92,0,0,0,0.1,0.72,0.1));}}
    g.add(M(p));
  }else{
    const R=mulberry(isl.seed),parts=[],glowParts=[];
    if(isl.biome==='volcano'){
      parts.push(P(CONE8,0x4a4048,isl.cx,1.4,isl.cz,0,0,0,4.6,2.8,4.6),P(CYL8,0x3a3238,isl.cx,2.75,isl.cz,0,0,0,1.3,0.14,1.3));
      glowParts.push(P(CYL8,0xf06a2a,isl.cx,2.8,isl.cz,0,0,0,1.0,0.1,1.0));
      for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)if(dx*dx+dz*dz<=5)blocked.add(K(isl.cx+dx,isl.cz+dz));
      isl.vent=[isl.cx,3,isl.cz];
    }
    const gr=shuffle(isl.grass.slice(),R),n=Math.round(gr.length*(isl.grand?0.08:0.15));
    let placed=0;for(const [x,z] of gr){if(placed>=n)break;if(blocked.has(K(x,z)))continue;
      parts.push(...shift(treeParts(B.trees[Math.floor(R()*B.trees.length)],R,B.rock),x+(R()-0.5)*0.3,topY(x,z),z+(R()-0.5)*0.3,R()*6.28));blocked.add(K(x,z));placed++;}
    const sa=shuffle(isl.sand.slice(),R);for(let i=0;i<Math.min(4,sa.length);i++){const [x,z]=sa[i];parts.push(...shift(treeParts(isl.biome==='swamp'?'reeds':'rock',R,B.rock),x,TOP.sand,z,R()*6));blocked.add(K(x,z));}
    if(parts.length)g.add(M(parts));
    if(glowParts.length){const m=M(glowParts,lumMat);m.castShadow=false;g.add(m);}
    isl.spots=gr.filter(([x,z])=>!blocked.has(K(x,z))).slice(0,Math.max(5,Math.min(isl.grand?30:18,Math.round(gr.length*0.18))));
  }
  isl.blocked=blocked;
  isl.edges=[];for(const [x,z] of [...isl.grass,...isl.sand])for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])if(!isLand(x+dx,z+dz)&&!riverSurf.has(K(x+dx,z+dz)))isl.edges.push([x+dx*0.5,z+dz*0.5,dx,dz,hash(x*3+dx,z*5+dz)*6.28]);
  // little grass tufts scattered on the wild islands
  if(!isl.home&&B.tuft){const pts=[];for(const [x,z] of isl.grass){if(blocked.has(K(x,z)))continue;const h=hash(x*3.1,z*1.7);if(h<0.45){pts.push([x+(hash(z,x*2)-0.5)*0.7,topY(x,z),z+(hash(x+5,z)-0.5)*0.7]);if(h<0.15)pts.push([x+(hash(z*3,x)-0.5)*0.7,topY(x,z),z+(hash(x,z*7)-0.5)*0.7]);}}
    if(pts.length){const im=new T.InstancedMesh(TUFT_GEO,grassMat,pts.length);pts.forEach(([x,y,z],i)=>{_e.set(0,hash(x,z)*6.28,0);_q.setFromEuler(_e);_m.compose(_v.set(x,y,z),_q,_s.set(1,0.8+hash(z,x)*0.6,1));im.setMatrixAt(i,_m);im.setColorAt(i,_c.set(B.tuft));});
      im.frustumCulled=false;im.receiveShadow=true;im.renderOrder=3;g.add(im);}}
  scene.add(g);islandBounds(isl);rebuildLandList();
}
function islandAt(x,z){const id=islMap.get(K(Math.round(x),Math.round(z)));return id===undefined?null:islands[id];}
function curIsl(){if(S.sea)return null;return islandAt(vil.x,vil.z);}
function nearestIsland(x,z){let best=null,bd=1e9;for(const isl of islands){const d=Math.hypot(x-isl.cx,z-isl.cz)-islR(isl)/0.75;if(d<bd){bd=d;best=isl;}}return[best,bd];}
function regionAt(x,z){const [isl,d]=nearestIsland(x,z);return d<9?isl.biome:'open';}
function landDist(x,z,isl){let bd=1e9;const tiles=isl?[...isl.grass,...isl.sand]:landList;for(const t of tiles){const d=(t[0]-x)**2+(t[1]-z)**2;if(d<bd)bd=d;}return Math.sqrt(bd);}
function bioLabel(b){return b==='any'?'anywhere':b==='home'?'your island':b==='open'?'the open sea':BIOMES[b].name.toLowerCase()+' isles';}

