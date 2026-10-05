/* ---- crafting: turn materials and finds into decor and useful items ---- */
const RECIPES=[
  {out:['b','fence',4],in:{'m:wood':2},lvl:1},{out:['b','gate',1],in:{'m:wood':3},lvl:1},{out:['b','stonepath',4],in:{'m:stone':3},lvl:1},{out:['b','flowerpot',1],in:{'m:stone':2,'m:fiber':1},lvl:1},
  {out:['b','signpost',1],in:{'m:wood':3},lvl:1},{out:['b','haybale',1],in:{'m:fiber':6},lvl:1},{out:['x','fert',3],in:{'m:fiber':3,'f:sardine':1},lvl:1},
  {out:['x','bait',3],in:{'g:shell':2,'m:fiber':1},lvl:1},{out:['b','bench',1],in:{'m:wood':5},lvl:2},{out:['b','birdhouse',1],in:{'m:wood':4,'m:fiber':1},lvl:2},
  {out:['b','hedge',2],in:{'m:fiber':4,'m:wood':1},lvl:2},{out:['b','chime',1],in:{'g:shell':3,'m:fiber':2,'m:wood':1},lvl:2},{out:['b','scarecrow',1],in:{'m:wood':3,'m:fiber':4},lvl:2},
  {out:['b','lantern',1],in:{'m:stone':3,'m:wood':2,'b:firefly':1},lvl:2},{out:['b','gnome',1],in:{'m:stone':5,'m:fiber':1},lvl:3},
  {out:['b','sprinkler',1],in:{'m:stone':4,'m:wood':2,'g:glass':1},lvl:3},{out:['b','planter',1],in:{'m:wood':3,'c:tulip':2},lvl:4},
  {out:['b','well',1],in:{'m:stone':8,'m:wood':4},lvl:4},{out:['b','beehive',1],in:{'m:wood':6,'p:honeyclover':2},lvl:4},
  {out:['b','picket',4],in:{'m:wood':2,'m:fiber':1},lvl:1},{out:['b','deck',4],in:{'m:wood':4},lvl:2},{out:['b','brick',4],in:{'m:stone':4},lvl:2},
  {out:['b','cobble',4],in:{'m:stone':3},lvl:1},{out:['b','gravel',6],in:{'m:stone':2},lvl:1},{out:['b','flagstone',4],in:{'m:stone':5},lvl:2},{out:['b','terracotta',4],in:{'m:stone':3,'m:fiber':1},lvl:3},{out:['b','mossy',4],in:{'m:stone':3,'m:fiber':2},lvl:3},
  {out:['b','chair',1],in:{'m:wood':4},lvl:2},{out:['b','topiary',1],in:{'m:fiber':4,'m:wood':1,'m:stone':2},lvl:3},{out:['b','urn',1],in:{'m:stone':5,'m:fiber':2},lvl:3}];
function haveOf(k){{const A=anyOf(k);if(A)return A.keys().reduce((t,q)=>t+haveOf(q),0);}if(k.startsWith('c:')){const id=k.slice(2);let n=0;for(const q in S.inv)if(q.split('|')[0]===id)n+=S.inv[q];return n;}return S.inv[k]||0;}
function takeOf(k,n){{const A=anyOf(k);if(A){for(const q of A.keys()){const t=Math.min(n,haveOf(q));if(t)takeOf(q,t);n-=t;if(!n)break;}return;}}if(k.startsWith('c:')){const id=k.slice(2);const ks=Object.keys(S.inv).filter(q=>q.split('|')[0]===id).sort((a,b)=>priceOf(a)-priceOf(b));for(const q of ks){const t=Math.min(n,S.inv[q]);S.inv[q]-=t;n-=t;if(!S.inv[q])delete S.inv[q];if(!n)break;}return;}
  S.inv[k]-=n;if(!S.inv[k])delete S.inv[k];}
function recipeName(r){return r.out[0]==='b'?BUILD[r.out[1]].name:CONSUM[r.out[1]].name;}
function recipeIcon(r){return r.out[0]==='b'?THUMB[r.out[1]]||'':ICON['x:'+r.out[1]];}
function canCraft(r){return r.lvl<=level()&&Object.entries(r.in).every(([k,n])=>haveOf(k)>=n);}
function craft(i){const r=RECIPES[i];if(!canCraft(r)){SFX.no();return;}for(const [k,n] of Object.entries(r.in))takeOf(k,n);const [t,id,n]=r.out;
  if(t==='b')S.store[id]=(S.store[id]||0)+n;else S.inv['x:'+id]=(S.inv['x:'+id]||0)+n;jrNote('craft');
  SFX.rare();addXP(3);toast(`Crafted ${n>1?n+'× ':''}<b>${recipeName(r)}</b>${t==='b'?' — it\u2019s in your Bag, ready to place.':'.'}`,'',recipeIcon(r));}
function useItem(k){if(k==='x:fert'){const ks=Object.keys(S.tiles).filter(q=>S.tiles[q].crop&&S.tiles[q].crop.p<1);if(!ks.length){toast('Nothing is growing right now.');return;}
    for(const q of ks){const c=S.tiles[q].crop,s0=stageOf(c.p);c.p=Math.min(0.995,c.p+0.15);if(stageOf(c.p)!==s0)syncCrop(q);const [x,z]=q.split(',').map(Number);sparkle(x,topY(x,z)+0.4,z,0xb8f088);}
    takeOf(k,1);SFX.rare();toast(`Fertilised ${ks.length} crop${ks.length>1?'s':''}. They perk right up!`,'',ICON['x:fert']);}
  else if(k==='x:bait')toast('Bait is used automatically when you cast and no fish is close by.','',ICON['x:bait']);
  else useMore(k);/* the newer things (58b) */}

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
  for(const o of S.objs){if(isFloor(o.k))continue;objCtx={x:o.x,z:o.z};const g=objGroup(o.k,o.id,o.r||0);objCtx=null;if(o.tint)try{tintGroup(g,o.tint);}catch(e){}/* painted (72c) */g.position.set(o.x,topY(o.x,o.z),o.z);g.userData.tile={x:o.x,z:o.z};g.userData.obj=o;
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
  recomputeBonuses();try{syncRanch();}catch(e){}/* the animals follow their buildings (75b) */
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


// the workbench: a real place at your camp to make things (it stands beside your tent once it's pitched), and the Craft
// button's count of what you could make right now
const craftableN=()=>RECIPES.filter(r=>canCraft(r)).length;
function craftBadge(){const el=$('craftN');if(!el)return;const n=craftableN();el.hidden=!n;el.textContent=n;}
// where it stands: a free tile of grass a couple of steps from the tent, its working side towards you
function pickBench(){const h=S.homeAt;if(!h||S.bench)return;let best=null,bs=-1e9;
  for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++){const x=h.x+dx,z=h.z+dz,d=Math.hypot(dx-0.5,dz-0.5);if(d<2.2||d>4.2)continue;
    if(landMap.get(K(x,z))!=='grass'||islMap.get(K(x,z))!==0||fixedAt(x,z)||objAt(x,z)||TOWN.path.has(K(x,z))||S.tiles[K(x,z)]||riverSurf.has(K(x,z)))continue;
    if((lvlMap.get(K(x,z))||0)!==(lvlMap.get(K(h.x,h.z))||0))continue;const s=-d+(dz>0?1.5:0)+(debrisAt(x,z)?-2:0);if(s>bs){bs=s;best=[x,z];}}
  if(!best)return;S.bench={x:best[0],z:best[1],r:Math.atan2(h.x+0.5-best[0],h.z+0.5-best[1])+Math.PI};S.debris=S.debris.filter(d=>!(d.x===best[0]&&d.z===best[1]));if(typeof syncDebris==='function')syncDebris();}
function addBench(isl){const b=S.bench;if(!b)return;const W=0xb27a4c,Dk=0x7a5232,St=0xb8bcc8,y=topY(b.x,b.z),p=[];
  p.push(P(BOX,W,0,0.62,0,0,0,0,1.12,0.1,0.6),P(BOX,Dk,0,0.56,0,0,0,0,1.04,0.04,0.52));
  for(const [lx,lz] of [[-0.48,-0.22],[0.48,-0.22],[-0.48,0.22],[0.48,0.22]])p.push(P(BOX,Dk,lx,0.3,lz,0,0,0,0.09,0.6,0.09));
  p.push(P(BOX,W,0,0.18,0,0,0,0,0.98,0.05,0.46),P(BOX,0xc8955e,-0.15,0.23,0,0,0.1,0,0.7,0.05,0.16),P(BOX,0xc8955e,-0.12,0.28,0.04,0,-0.08,0,0.66,0.05,0.15));/* a shelf with planks */
  p.push(P(BOX,St,0.22,0.69,0.05,0,0.5,0,0.42,0.02,0.13),P(BOX,Dk,0.46,0.71,-0.07,0,0.5,0,0.12,0.06,0.06));/* a saw */
  p.push(P(CYL6,0x9a6a3a,-0.28,0.7,0.1,0,0,1.571,0.035,0.32,0.035),P(BOX,0x6a6e78,-0.42,0.71,0.1,0,0,0,0.07,0.08,0.14));/* a hammer */
  p.push(P(BOX,0x6a6e78,0.5,0.72,0.2,0,0,0,0.12,0.12,0.1),P(CYL8,0x8a8e98,0.5,0.78,0.2,1.571,0,0,0.04,0.16,0.04));/* a little vise */
  p.push(P(CYL8,0x9a6a3a,0.82,0.18,0.15,0,0,0,0.36,0.36,0.36),P(CYL8,0xd8b07a,0.82,0.365,0.15,0,0,0,0.33,0.02,0.33));/* a stump to sit on */
  const c=Math.cos(b.r),s=Math.sin(b.r);for(const q of p){const qx=q.x,qz=q.z;q.x=b.x+qx*c+qz*s;q.z=b.z-qx*s+qz*c;q.y+=y;q.ry+=b.r;}
  const me=M(p);me.castShadow=true;me.receiveShadow=true;isl.group.add(me);TOWN.fixed.set(K(b.x,b.z),'bench');}
