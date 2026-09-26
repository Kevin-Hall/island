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
// hide islands out of view; and only islands near the sun's shadow box (±18 around the camera target) render into the
// shadow map, since shadows further out are never drawn: this halves the triangles when zoomed out
function cullIslands(){const view=cam.dist+70;for(const isl of islands){const b=isl.bc;if(!b)continue;const d=Math.hypot(b.x-cam.tx,b.z-cam.tz)-b.r,vis=d<view;
    // wild plants are small: only draw them when you're reasonably close (each one is its own mesh)
    if(isl.group)isl.group.visible=vis;if(isl.pgroup)isl.pgroup.visible=vis&&cam.dist+Math.max(0,d)<46;
    // level of detail for trees: light meshes when the island is far away or you're zoomed well out (with a little hysteresis)
    const far=cam.dist+Math.max(0,d),low=isl.lowOn?far>42:far>47;if(isl.veg&&low!==isl.lowOn){isl.lowOn=low;for(const [hi,lo] of [...isl.veg,...(isl.floraLod||[])]){hi.visible=!low;if(lo)lo.visible=low;}}
    const sh=vis&&d<26;if(isl.group&&isl.shadowOn!==sh){isl.shadowOn=sh;if(!isl.casters){isl.casters=[];isl.group.traverse(o=>{if(o.castShadow)isl.casters.push(o);});}for(const o of isl.casters)o.castShadow=sh;}}}
// terrain baker: collects tiles (a geometry scaled and placed without rotation, a colour, optional sand corner heights) into one mesh
const _flatGeo=new Map();const flatGeo=g=>{let n=_flatGeo.get(g);if(!n){n=g.index?g.toNonIndexed():g;_flatGeo.set(g,n);}return n;};
const bilerp4=(c,lx,lz)=>{const u=clamp(lx+0.5,0,1),v=clamp(lz+0.5,0,1);return lerp(lerp(c[0],c[1],u),lerp(c[3],c[2],u),v);};
// hide(dx,dz) says whether a side facing that neighbour is covered; bottoms are never visible, and cap:false drops the top too
function makeBake(){const L=[];let n=0;return{
  add(geo,x,y,z,sx,sy,sz,col=0xffffff,ch=null,hide=null,cap=true){const g=flatGeo(geo);L.push([g,x,y,z,sx,sy,sz,col,ch,hide,cap]);n+=g.attributes.position.count;},
  mesh(mat,colors=true){if(!n)return null;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=colors?new Float32Array(n*3):null;let o=0;
    for(const [g,x,y,z,sx,sy,sz,c,ch,hide,cap] of L){const P0=g.attributes.position.array,N0=g.attributes.normal.array,cnt=g.attributes.position.count;if(colors)_c.setHex(c);
      for(let t=0;t<cnt;t+=3){const a=t*3;
        // face normal from the local triangle: skip bottoms, covered tops, and sides that butt against a neighbour as tall
        const ux=P0[a+3]-P0[a],uy=P0[a+4]-P0[a+1],uz=P0[a+5]-P0[a+2],vx=P0[a+6]-P0[a],vy=P0[a+7]-P0[a+1],vz=P0[a+8]-P0[a+2];
        let fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx;const fl=Math.hypot(fx,fy,fz)||1;fx/=fl;fy/=fl;fz/=fl;
        if(fy<-0.5)continue;if(fy>0.5&&!cap)continue;
        if(hide&&Math.abs(fy)<0.5){const ax=Math.abs(fx),az=Math.abs(fz);if((ax>0.9||az>0.9)&&hide(ax>az?Math.sign(fx):0,ax>az?0:Math.sign(fz)))continue;}
        for(let k=0;k<3;k++){const i3=(t+k)*3,j=o*3,lx=P0[i3],ly=P0[i3+1],lz=P0[i3+2];
          pos[j]=x+lx*sx;pos[j+1]=ch&&ly>0.99?bilerp4(ch,lx,lz):y+ly*sy;pos[j+2]=z+lz*sz;
          const nx=N0[i3]/sx,ny=N0[i3+1]/sy,nz=N0[i3+2]/sz,l=Math.hypot(nx,ny,nz)||1;nor[j]=nx/l;nor[j+1]=ny/l;nor[j+2]=nz/l;
          if(col){col[j]=_c.r;col[j+1]=_c.g;col[j+2]=_c.b;}o++;}}}
    const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(pos.subarray(0,o*3),3));bg.setAttribute('normal',new T.BufferAttribute(nor.subarray(0,o*3),3));if(col)bg.setAttribute('color',new T.BufferAttribute(col.subarray(0,o*3),3));
    const m=new T.Mesh(bg,mat);m.frustumCulled=false;m.receiveShadow=true;return m;}};}
// sand corner heights from distance to open water: the waterline, halfway, then the full beach height
const isSeaT=t=>!isLandT(t)&&t!=='river';
function shapeBeach(isl){const d=new Map(),H=[0.03,0.17,TOP.sand,TOP.sand];let q=[];
  for(const [x,z] of isl.sand){SAND_CH.delete(K(x,z));if(CORNERS.some(([dx,dz])=>isSeaT(landMap.get(K(x+dx,z+dz)))||isSeaT(landMap.get(K(x+dx,z)))||isSeaT(landMap.get(K(x,z+dz))))){d.set(K(x,z),1);q.push([x,z]);}}
  for(const [x,z] of q)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=K(x+dx,z+dz);if(landMap.get(k)==='sand'&&!d.has(k))d.set(k,2);}
  const dOf=(x,z)=>{const k=K(x,z),t=landMap.get(k);return isSeaT(t)?0:t==='sand'?d.get(k)||3:3;};
  for(const [x,z] of isl.sand)SAND_CH.set(K(x,z),CORNERS.map(([sx,sz])=>H[Math.min(dOf(x,z),dOf(x+sx,z),dOf(x,z+sz),dOf(x+sx,z+sz))]));}
function buildIsland(isl){
  if(isl.group){scene.remove(isl.group);isl.group.traverse(o=>{if(o.isInstancedMesh)o.dispose();else if(o.geometry&&!Object.values(RTILE).includes(o.geometry)&&o.geometry!==TILE_PLANE&&o.geometry!==BOX&&o.geometry!==POOL_GEO&&o.geometry!==BLADES)o.geometry.dispose();});}
  if(isl.keys)for(const k of isl.keys){landMap.delete(k);islMap.delete(k);lvlMap.delete(k);riverSurf.delete(k);bridgeY.delete(k);}
  const g=new T.Group();isl.group=g;isl.heartG=null;isl.residentG=null;isl.flats=[];isl.veg=[];isl.lowOn=false;isl.casters=null;isl.shadowOn=undefined;isl.keys=[];isl.grass=[];isl.sand=[];const a1=[],a2=[];
  const span=Math.ceil(islR(isl)/0.62+3),B=islandBiome(isl);
  for(let x=isl.home?Math.min(isl.cx-span,FARM.x-11):isl.cx-span;x<=isl.cx+span;x++)for(let z=isl.cz-span;z<=isl.cz+span;z++){
    const t=tileTypeI(isl,x,z);if(!t)continue;const k=K(x,z);
    if(landMap.has(k)&&islMap.get(k)!==isl.id)continue;
    landMap.set(k,t);islMap.set(k,isl.id);isl.keys.push(k);
    if(t==='grass'){const l=levelOf(isl,x,z);if(l)lvlMap.set(k,l);}
    (t==='grass'?isl.grass:t==='sand'?isl.sand:t==='s1'?a1:a2).push([x,z]);}
  if(isl.riverN)carveRivers(isl,g);
  shapeBeach(isl);
  if(isl.home){layoutTown(isl);setPathMask(TOWN.path);musShow.g=null;musShow.sig='';refreshMuseumShow();}
  // grass tiles: a grassy slab on top of a dirt or rock cliff, like the tiers of Wild World
  // grass and sand tiles, drawn with rounded outer corners; the notch shows whatever lies just below (sand, lower grass, or the sea)
  const byMask=new Map(),under=[];const put=(mask,e)=>{if(!byMask.has(mask))byMask.set(mask,{g:[],s:[]});byMask.get(mask)[e.kind].push(e);};
  const sandCol=(x,z)=>{const c=_c.setHex(groundCol(B.sand,x,z,isl.seed)).multiplyScalar(0.97+hash(x*5,z*3)*0.04);
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>hclass(x+dx,z+dz)===-9))c.lerp(_a.set(0xb89868),0.28);return c.getHex();};
  for(const [x,z] of isl.grass){const L=hclass(x,z);let mask=0;
    CORNERS.forEach(([dx,dz],b)=>{const n=[hclass(x+dx,z),hclass(x,z+dz),hclass(x+dx,z+dz)];if(n.some(v=>v>=L||v===-5))return;mask|=1<<b;
      const hm=Math.max(...n);if(hm>=0)under.push([x+dx*0.25,z+dz*0.25,TOP.grass+hm*LVH,groundCol(B.grass,x+dx,z+dz,isl.seed),grassTopMat]);
      else if(hm===-1)under.push([x+dx*0.25,z+dz*0.25,topY(x+dx,z+dz),sandCol(x+dx,z+dz),sandMat]);});
    CMASK.set(K(x,z),mask);put(mask,{kind:'g',x,z});}
  for(const [x,z] of isl.sand){let mask=0;CORNERS.forEach(([dx,dz],b)=>{if([hclass(x+dx,z),hclass(x,z+dz),hclass(x+dx,z+dz)].every(v=>v===-9))mask|=1<<b;});put(mask,{kind:'s',x,z});}
  // all of an island's tiles are baked into one mesh per material (tile colours in vertex colours, the beach slope in the
  // vertices), so the whole island costs a handful of draw calls instead of an instanced batch per corner shape
  const cliffB=makeBake(),topB=makeBake(),sandB=makeBake(),underG=makeBake(),underS=makeBake(),s1B=makeBake(),s2B=makeBake();
  for(const [mask,{g:gl,s:sl}] of byMask){const geo=rtileGeo(mask);
    for(const {x,z} of gl){const ty=topY(x,z),hid=(dx,dz)=>landMap.get(K(x+dx,z+dz))==='grass'&&topY(x+dx,z+dz)>=ty-1e-3;
      cliffB.add(geo,x,-0.6,z,1,ty-0.14+0.6,1,_c.set(B.cliff).multiplyScalar(0.92+hash(z,x)*0.12).getHex(),null,hid,false);
      topB.add(geo,x,ty-0.14,z,1,0.14,1,groundCol(B.grass,x,z,isl.seed),null,hid);}
    for(const {x,z} of sl)sandB.add(geo,x,-0.6,z,1,TOP.sand+0.6,1,sandCol(x,z),SAND_CH.get(K(x,z)),(dx,dz)=>{const t=landMap.get(K(x+dx,z+dz));return t==='sand'||t==='grass';});}
  for(const [x,z,ty,col,mat] of under)(mat===sandMat?underS:underG).add(BOX,x,(ty-0.6)/2,z,0.5,ty+0.6,0.5,col);
  for(const [B0,mat,cast] of [[cliffB,cliffMat,true],[topB,grassTopMat,true],[sandB,sandMat,false],[underG,grassTopMat,false],[underS,sandMat,false]]){const m=B0.mesh(mat);if(m){m.castShadow=cast;g.add(m);}}
  if(isl.grass.length)buildGrass(isl,g);
  // shallow-water bands, with rounded outer corners so the coast doesn't step in squares
  const shc=(x,z)=>{const t=landMap.get(K(x,z));return t==='s1'?1:t==='s2'?2:t?0:3;};
  const flat=(list,mat,y,lvl)=>{const groups=new Map();for(const [x,z] of list){let mask=0;CORNERS.forEach(([dx,dz],b)=>{if([shc(x+dx,z),shc(x,z+dz),shc(x+dx,z+dz)].every(v=>v>lvl))mask|=1<<b;});
      if(!groups.has(mask))groups.set(mask,[]);groups.get(mask).push([x,z]);}
    const bk=makeBake();for(const [mask,l] of groups)for(const [x,z] of l)bk.add(rtileGeo(mask),x,y,z,1,0.002,1,0xffffff,null,()=>true);const m=bk.mesh(mat,false);if(m){m.receiveShadow=false;g.add(m);isl.flats.push(m);}};
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
    const R=mulberry(isl.seed),parts=[],tp=[],glowParts=[];
    if(isl.biome==='volcano'){
      parts.push(P(CONE8,0x4a4048,isl.cx,1.4,isl.cz,0,0,0,4.6,2.8,4.6),P(CYL8,0x3a3238,isl.cx,2.75,isl.cz,0,0,0,1.3,0.14,1.3));
      glowParts.push(P(CYL8,0xf06a2a,isl.cx,2.8,isl.cz,0,0,0,1.0,0.1,1.0));
      for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)if(dx*dx+dz*dz<=5)blocked.add(K(isl.cx+dx,isl.cz+dz));
      isl.vent=[isl.cx,3,isl.cz];
    }
    pickHeart(isl,blocked);/* the withered heart tree (79-voyage) */
    const gr=shuffle(isl.grass.slice(),R),n=Math.round(gr.length*(isl.grand?0.08:0.15));
    let placed=0;for(const [x,z] of gr){if(placed>=n)break;if(blocked.has(K(x,z)))continue;
      tp.push(...shift(treeParts(B.trees[Math.floor(R()*B.trees.length)],R,B.rock),x+(R()-0.5)*0.3,topY(x,z),z+(R()-0.5)*0.3,R()*6.28));blocked.add(K(x,z));placed++;}
    const sa=shuffle(isl.sand.slice(),R);for(let i=0;i<Math.min(4,sa.length);i++){const [x,z]=sa[i];parts.push(...shift(treeParts(isl.biome==='swamp'?'reeds':'rock',R,B.rock),x,topY(x,z),z,R()*6));blocked.add(K(x,z));}
    {const pn=({tropic:0.12,meadow:0.04,autumn:0.03,volcano:0.04})[isl.biome]||0;
      if(pn)for(const [x,z] of palmSpots(isl,R,Math.min(isl.grand?10:6,Math.ceil(isl.sand.length*pn)),(x,z)=>!blocked.has(K(x,z)))){
        tp.push(...shift(treeParts(PALMS[Math.floor(R()*PALMS.length)],R,B.rock),x+(R()-0.5)*0.2,topY(x,z),z+(R()-0.5)*0.2,R()*6.28));blocked.add(K(x,z));}}
    if(parts.length)g.add(M(parts));addVeg(isl,g,tp);
    if(glowParts.length){const m=M(glowParts,lumMat);m.castShadow=false;g.add(m);}
    buildHeart(isl);
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

