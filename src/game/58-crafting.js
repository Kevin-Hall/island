/* ---- crafting: turn materials and finds into decor and useful items ---- */
const RECIPES=[
  {out:['b','fence',4],in:{'m:wood':2},lvl:1},{out:['b','stonepath',4],in:{'m:stone':3},lvl:1},{out:['b','flowerpot',1],in:{'m:stone':2,'m:fiber':1},lvl:1},
  {out:['b','signpost',1],in:{'m:wood':3},lvl:1},{out:['b','haybale',1],in:{'m:fiber':6},lvl:1},{out:['x','fert',3],in:{'m:fiber':3,'f:sardine':1},lvl:1},
  {out:['x','bait',3],in:{'g:shell':2,'m:fiber':1},lvl:1},{out:['b','bench',1],in:{'m:wood':5},lvl:2},{out:['b','birdhouse',1],in:{'m:wood':4,'m:fiber':1},lvl:2},
  {out:['b','hedge',2],in:{'m:fiber':4,'m:wood':1},lvl:2},{out:['b','chime',1],in:{'g:shell':3,'m:fiber':2,'m:wood':1},lvl:2},{out:['b','scarecrow',1],in:{'m:wood':3,'m:fiber':4},lvl:2},
  {out:['b','lantern',1],in:{'m:stone':3,'m:wood':2,'b:firefly':1},lvl:2},{out:['b','gnome',1],in:{'m:stone':5,'m:fiber':1},lvl:3},
  {out:['b','sprinkler',1],in:{'m:stone':4,'m:wood':2,'g:glass':1},lvl:3},{out:['b','planter',1],in:{'m:wood':3,'c:tulip':2},lvl:4},
  {out:['b','well',1],in:{'m:stone':8,'m:wood':4},lvl:4},{out:['b','beehive',1],in:{'m:wood':6,'p:honeyclover':2},lvl:4},
  {out:['b','picket',4],in:{'m:wood':2,'m:fiber':1},lvl:1},{out:['b','deck',4],in:{'m:wood':4},lvl:2},{out:['b','brick',4],in:{'m:stone':4},lvl:2},
  {out:['b','cobble',4],in:{'m:stone':3},lvl:1},{out:['b','gravel',6],in:{'m:stone':2},lvl:1},{out:['b','flagstone',4],in:{'m:stone':5},lvl:2},{out:['b','terracotta',4],in:{'m:stone':3,'m:fiber':1},lvl:3},{out:['b','mossy',4],in:{'m:stone':3,'m:fiber':2},lvl:3},
  {out:['b','chair',1],in:{'m:wood':4},lvl:2},{out:['b','topiary',1],in:{'m:fiber':4,'m:wood':1,'m:stone':2},lvl:3},{out:['b','urn',1],in:{'m:stone':5,'m:fiber':2},lvl:3}];
function haveOf(k){if(k.startsWith('c:')){const id=k.slice(2);let n=0;for(const q in S.inv)if(q.split('|')[0]===id)n+=S.inv[q];return n;}return S.inv[k]||0;}
function takeOf(k,n){if(k.startsWith('c:')){const id=k.slice(2);const ks=Object.keys(S.inv).filter(q=>q.split('|')[0]===id).sort((a,b)=>priceOf(a)-priceOf(b));for(const q of ks){const t=Math.min(n,S.inv[q]);S.inv[q]-=t;n-=t;if(!S.inv[q])delete S.inv[q];if(!n)break;}return;}
  S.inv[k]-=n;if(!S.inv[k])delete S.inv[k];}
function recipeName(r){return r.out[0]==='b'?BUILD[r.out[1]].name:CONSUM[r.out[1]].name;}
function recipeIcon(r){return r.out[0]==='b'?THUMB[r.out[1]]||'':ICON['x:'+r.out[1]];}
function canCraft(r){return r.lvl<=level()&&Object.entries(r.in).every(([k,n])=>haveOf(k)>=n);}
function craft(i){const r=RECIPES[i];if(!canCraft(r)){SFX.no();return;}for(const [k,n] of Object.entries(r.in))takeOf(k,n);const [t,id,n]=r.out;
  if(t==='b')S.store[id]=(S.store[id]||0)+n;else S.inv['x:'+id]=(S.inv['x:'+id]||0)+n;jrNote('craft');
  SFX.rare();addXP(3);toast(`Crafted ${n>1?n+'× ':''}<b>${recipeName(r)}</b>${t==='b'?' — find it in Storage to place it.':'.'}`,'',recipeIcon(r));}
function useItem(k){if(k==='x:fert'){const ks=Object.keys(S.tiles).filter(q=>S.tiles[q].crop&&S.tiles[q].crop.p<1);if(!ks.length){toast('Nothing is growing right now.');return;}
    for(const q of ks){const c=S.tiles[q].crop,s0=stageOf(c.p);c.p=Math.min(0.995,c.p+0.15);if(stageOf(c.p)!==s0)syncCrop(q);const [x,z]=q.split(',').map(Number);sparkle(x,topY(x,z)+0.4,z,0xb8f088);}
    takeOf(k,1);SFX.rare();toast(`Fertilised ${ks.length} crop${ks.length>1?'s':''}. They perk right up!`,'',ICON['x:fert']);}
  else if(k==='x:bait')toast('Bait is used automatically when you cast and no fish is close by.','',ICON['x:bait']);}

const objRoot=new T.Group();scene.add(objRoot);
const anims=[];let houseMesh=null,binMesh=null;
function syncObjs(){
  OBJ_IDX.len=-1;setTimeout(refreshHomeGrass,0);
  while(objRoot.children.length){const c=objRoot.children[0];objRoot.remove(c);c.traverse(o=>{if(o.geometry&&o.geometry!==POOL_GEO)o.geometry.dispose();});}
  anims.length=0;
  // still decor is merged by material (plain, glowing…), so a big, busy island costs a handful of draw calls, not one per
  // piece; animated or sparkling pieces, and parts that can't merge (light pools, indexed shapes), stay as they are
  const pools=[],batches=new Map(),take=c=>c.isMesh&&!c.children.length&&!c.geometry.index&&c.geometry.attributes.color&&c.material&&c.material.vertexColors;
  for(const m of floorMeshes(S.objs.filter(o=>isFloor(o.k))))objRoot.add(m); // floors: one instanced mesh per kind
  for(const o of S.objs){if(isFloor(o.k))continue;objCtx={x:o.x,z:o.z};const g=objGroup(o.k,o.id,o.r||0);objCtx=null;g.position.set(o.x,topY(o.x,o.z),o.z);g.userData.tile={x:o.x,z:o.z};g.userData.obj=o;
    if(!g.userData.anim&&!g.userData.sparkle){g.updateMatrixWorld(true);const rest=[];
      for(const c of g.children){if(c.isMesh&&c.geometry===POOL_GEO){c.updateMatrixWorld(true);pools.push(c.matrixWorld.clone());continue;}/* lamp glows: one batch for all */if(take(c)){if(!batches.has(c.material))batches.set(c.material,[]);batches.get(c.material).push(c);}else rest.push(c);}
      if(!rest.length)continue;for(const c of g.children.slice())if(!rest.includes(c))g.remove(c);}
    else for(const c of g.children.slice())if(c.isMesh&&c.geometry===POOL_GEO){c.updateMatrixWorld(true);pools.push(c.matrixWorld.clone());g.remove(c);}
    objRoot.add(g);
    if(g.userData.anim)anims.push(g.userData.anim);if(g.userData.sparkle)anims.push(()=>{if(Math.random()<0.02)sparkle(o.x,topY(o.x,o.z)+0.25,o.z,0xffe27a);});}
  for(const [mat,batch] of batches){let n=0;for(const c of batch)n+=c.geometry.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
    for(const c of batch){const G=c.geometry,g2=G.clone();g2.applyMatrix4(c.matrixWorld);pos.set(g2.attributes.position.array,o*3);nor.set(g2.attributes.normal.array,o*3);col.set(G.attributes.color.array,o*3);o+=G.attributes.position.count;g2.dispose();G.dispose();}
    const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(pos,3));bg.setAttribute('normal',new T.BufferAttribute(nor,3));bg.setAttribute('color',new T.BufferAttribute(col,3));
    const bm=new T.Mesh(bg,mat);bm.castShadow=mat!==glowMat&&mat!==lumMat;bm.receiveShadow=true;bm.frustumCulled=false;objRoot.add(bm);}
  if(pools.length){const im=new T.InstancedMesh(POOL_GEO,poolMat,pools.length);pools.forEach((m,i)=>im.setMatrixAt(i,m));im.frustumCulled=false;im.renderOrder=2;im.userData.noThumb=true;objRoot.add(im);}
  houseMesh=houseGroup(S.house);houseMesh.position.set(HOUSE_AT.x+0.5,Math.min(topY(HOUSE_AT.x,HOUSE_AT.z),topY(HOUSE_AT.x+1,HOUSE_AT.z+1))||0.3,HOUSE_AT.z+0.5);
  objRoot.add(houseMesh);
  binMesh=binGroup();binMesh.position.set(BIN_AT.x,topY(BIN_AT.x,BIN_AT.z),BIN_AT.z);binMesh.rotation.y=-0.2;objRoot.add(binMesh);
  recomputeBonuses();
}
let bonus=new Map(),hasWindmill=false;
function recomputeBonuses(){bonus=new Map();hasWindmill=S.objs.some(o=>o.k==='windmill');
  for(const o of S.objs){if(o.k!=='beehive'&&o.k!=='clover')continue;
    for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const k=K(o.x+dx,o.z+dz);const b=bonus.get(k)||{bee:0,clover:0};if(o.k==='beehive')b.bee=1;else b.clover++;bonus.set(k,b);}}}
function fixedAt(x,z){if(x>=HOUSE_AT.x&&x<=HOUSE_AT.x+1&&z>=HOUSE_AT.z&&z<=HOUSE_AT.z+1)return'house';if(x===BIN_AT.x&&z===BIN_AT.z)return'bin';return TOWN.fixed.get(K(x,z))||null;}
// two layers per tile: a floor (paving, decking…) and a piece standing on it
const OBJ_IDX={src:null,len:-1,map:new Map(),fl:new Map()};
function objIdx(){if(OBJ_IDX.src!==S.objs||OBJ_IDX.len!==S.objs.length){OBJ_IDX.map.clear();OBJ_IDX.fl.clear();for(const o of S.objs)(isFloor(o.k)?OBJ_IDX.fl:OBJ_IDX.map).set(K(o.x,o.z),o);OBJ_IDX.src=S.objs;OBJ_IDX.len=S.objs.length;}}
function objAt(x,z){objIdx();return OBJ_IDX.map.get(K(x,z))||null;}
function floorAt(x,z){objIdx();return OBJ_IDX.fl.get(K(x,z))||null;}
const onHome=(x,z)=>islMap.get(K(x,z))===0;

