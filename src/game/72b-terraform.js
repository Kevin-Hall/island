/* =========================================================
   Landscaping (the Landscaping tool, from Island Heart level TERRA.LV). Three modes, picked on the little bar that
   appears over the tool button (or by tapping the tool again): Raise lifts a tile one cliff tier (up to TERRA.MAX),
   Lower drops it one, and Water digs a pond or a stretch of river into the tile at its own height, or fills water back
   in to land (dug ponds and the island's own rivers alike). Tap a tile, or hold and drag to brush several and change
   them all when you let go. It works on the island's own tile grid: each changed tile is saved in S.terra and read back
   by levelOf (41-trees) and carveRivers (43-rivers), then the island rebuilds. S.terra values: 0..MAX a ground tier,
   -1 water at sea level, -2..-5 water at tier 0..3 (TERRA_W), and a ground tier on a river tile fills that bit of river.
   Water tiers are carved like the rivers, so water on a higher tier spills down to lower water in a little waterfall.
   Not allowed: under buildings, decor, floors, debris, soil or finds, on the beach, under a bridge. TERRA.COST shells a tile.
   ========================================================= */
const TERRA={COST:150/* shells per tile per tier */,LV:8/* Island Heart level it unlocks at */,MAX:3};
const terraOn=()=>level()>=TERRA.LV;
const TERRA_MODES={raise:'Raise',lower:'Lower',water:'Water'};
const terraMode=()=>TERRA_MODES[S.terraMode]?S.terraMode:'raise';
const TERRA_W=L=>L<0?-1:-(L+2),terraWaterL=v=>v===-1?-1:-(v+2);/* water at tier L ↔ its S.terra value */
// what a tile can become: returns {to, why} (to: new level, -1 for water; why: why not, if it can't)
function terraPlan(x,z,mode){const k=K(x,z),t=landMap.get(k);if(islMap.get(k)!==0)return{why:'Only on your island.'};
  if(fixedAt(x,z)||objAt(x,z)||floorAt(x,z))return{why:'Something is built there.'};
  if(debrisAt(x,z))return{why:'Clear it first.'};if(S.tiles[k])return{why:'That\'s your soil. Fill it in first.'};
  if(findAt(x,z))return{why:'Pick up what\'s lying there first.'};
  if(t==='bridge')return{why:'Not under a bridge.'};if(t==='sand')return{why:'The beach stays a beach.'};
  const L=lvlMap.get(k)||0,wetNear=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>{const t2=landMap.get(K(x+dx,z+dz));return t2==='river'||isSeaT(t2);});
  if(t==='river'){const surf=riverSurf.get(k)||0,wl=surf<0.2?-1:Math.round((surf-TOP.grass+0.2)/LVH);/* the water's own tier */
    if(mode==='lower')return{why:'It\'s as deep as it goes.'};
    return{to:Math.max(0,wl)};}/* raise or water: fill it back in to land */
  if(t!=='grass')return{why:'You can\'t landscape there.'};
  if(mode==='water'){const seaNear=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>{const k2=K(x+dx,z+dz),t2=landMap.get(k2);return isSeaT(t2)||t2==='river'&&(riverSurf.get(k2)||0)<0.2;});return{to:TERRA_W(L===0&&seaNear?-1:L)};}/* dig water here (by the sea it settles at sea level) */
  if(mode==='raise')return L>=TERRA.MAX?{why:'That\'s as high as it goes.'}:{to:L+1};
  if(L>0)return{to:L-1};
  return wetNear?{to:-1}:{why:'Nothing lower here. Use Water to dig a pond.'};}
function terraApply(tiles,mode){if(!terraOn()){toast(`Landscaping unlocks at Island Heart level ${TERRA.LV}.`);return;}
  const plan=[],seen=new Set();let why='';for(const [x,z] of tiles){const k=K(x,z);if(seen.has(k))continue;seen.add(k);const p=terraPlan(x,z,mode);if(p.why){why=p.why;continue;}plan.push([x,z,p.to]);}
  if(!plan.length){if(why){toast(why);SFX.no();}return;}
  const cost=plan.length*TERRA.COST;if(S.shells<cost){toast(`That needs <b>${fmt(cost)}</b> shells (${TERRA.COST} a tile).`,'',ICON.shell);SFX.no();return;}
  S.shells-=cost;S.terra=S.terra||{};const before=plan.map(([x,z])=>[x,z,topY(x,z)]);
  for(const [x,z,to] of plan)S.terra[K(x,z)]=to;
  try{terraPatch(plan,new Map(before.map(([x,z,y])=>[K(x,z),y])));}catch(e){console.warn('landscaping patch failed, rebuilding',e);rebuildHome();}
  terraFx(before);updateHUD();save();
  floatText(vil.x,vil.y+1.4,vil.z,`${{raise:'Raised',lower:'Lowered',water:'Dug or filled'}[mode]} ${plan.length} tile${plan.length>1?'s':''} · −${fmt(cost)}`,'');}
function terraTap(x,z){cursorAt(x,z);actAt(x,z,()=>{swingTool();terraApply([[x,z]],terraMode());});}
// each changed tile pops: a block of earth rising or sinking into place, a puff of dust and a soft thud
const terraPops=[];const terraMat=new T.MeshToonMaterial({gradientMap:grad,color:0x8a6a44,transparent:true});
function terraFx(before){camShake=Math.max(camShake,0.25);tone(95,0.22,'sine',0.14,55);noise(0.18,0.09,260,0.7);
  for(const [x,z,y0] of before){const y1=topY(x,z),m=new T.Mesh(BOX,terraMat.clone());m.frustumCulled=false;scene.add(m);terraPops.push({m,x,z,y0,y1,t:0});
    for(let i=0;i<8;i++)emit(x+(Math.random()-0.5)*0.9,Math.max(y0,y1)+0.1,z+(Math.random()-0.5)*0.9,{vx:(Math.random()-0.5)*1.2,vy:0.8+Math.random()*0.8,vz:(Math.random()-0.5)*1.2,life:0.7,max:0.7,size:0.08,color:y1<0.2?0xbfe6ff:0xc8a878,g:3});}}
function updateTerra(dt){terraBar();for(let i=terraPops.length-1;i>=0;i--){const p=terraPops[i];p.t+=dt;const u=Math.min(1,p.t/0.32),e=1+Math.sin(u*Math.PI)*0.12;/* a little overshoot */
  const y=lerp(p.y0,p.y1,u*u*(3-2*u)),h=Math.max(0.05,y+0.6);p.m.position.set(p.x,y-h/2,p.z);p.m.scale.set(1.02*e,h,1.02*e);p.m.material.opacity=u<0.7?0.9:0.9*(1-(u-0.7)/0.3);
  if(p.t>0.4){scene.remove(p.m);p.m.material.dispose();terraPops.splice(i,1);}}}
function setTerraMode(m){S.terraMode=m;SFX.ui();floatText(vil.x,vil.y+1.3,vil.z,{raise:'Raise the land',lower:'Lower the land',water:'Dig or fill water'}[m]);renderTools();terraBar(true);}
function terraToggle(){const ks=Object.keys(TERRA_MODES);setTerraMode(ks[(ks.indexOf(terraMode())+1)%ks.length]);}
// the mode bar over the tool button, shown while the Landscaping tool is in your hands
let terraBarOn=null;
function terraBar(force){const on=S.tool==='terra'&&terraOn()&&!S.sea&&!inside&&!swim.on;const el=$('terraUI');if(!el)return;
  if(on!==terraBarOn||force){terraBarOn=on;el.hidden=!on;if(on)el.querySelectorAll('[data-tm]').forEach(b=>b.classList.toggle('on',b.dataset.tm===terraMode()));
    if(on&&!S.tipTerra){S.tipTerra=1;setTimeout(()=>say('Pick <b>Raise</b>, <b>Lower</b> or <b>Water</b>, then tap the ground (or hold and drag to brush).'),400);}}}
$('terraUI')&&$('terraUI').addEventListener('click',e=>{const b=e.target.closest('[data-tm]');if(b){e.stopPropagation();setTerraMode(b.dataset.tm);}});

// ---- changing the island in place (no full rebuild, so no hitch): only the ground chunks round the changed tiles are
// rebaked (bakeTerrain, 44-terrain); if water moved, the rivers are re-carved on their own first ----
function terraChunks(keys){const out=new Set();for(const k of keys){const [x,z]=k.split(',').map(Number);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)out.add(tchKey(x+dx,z+dz));}return out;}
function terraPatch(plan,y0){const isl=islands[0],g=isl.group;let changed=new Set(plan.map(([x,z])=>K(x,z)));
  const water=plan.some(([x,z,to])=>to<0||landMap.get(K(x,z))==='river');
  if(water){for(const k of redoRivers(isl))changed.add(k);}
  else for(const [x,z,to] of plan){const k=K(x,z);if(to>0)lvlMap.set(k,to);else lvlMap.delete(k);}
  bakeTerrain(isl,g,terraChunks(changed));
  // grass blades and wild flowers on the changed tiles follow the ground (or go, where it's now water)
  if(water){if(isl.gIM){g.remove(isl.gIM);isl.gIM.dispose();}buildGrass(isl,g);}
  else if(isl.gIM){const im=isl.gIM,per=im.userData.per;for(const k of changed){const i0=isl.gIdx.get(k);if(i0===undefined||isl.gHid&&isl.gHid.get(k))continue;const [x,z]=k.split(',').map(Number);for(let j=0;j<per;j++)im.setMatrixAt(i0+j,clumpMat(x,z,j));}im.instanceMatrix.needsUpdate=true;}
  const dirty=new Set();for(const k of changed){const arr=TOWN.flora.get(k);if(!arr)continue;const [x,z]=k.split(',').map(Number),wet=landMap.get(k)!=='grass',dy=y0.has(k)?topY(x,z)-y0.get(k):0;
    for(const [fm,i,mat] of arr){if(wet)fm.setMatrixAt(i,_m.makeScale(0,0,0));else{mat[13]+=dy;fm.setMatrixAt(i,_m.fromArray(mat));}dirty.add(fm);}if(wet)TOWN.flora.delete(k);}
  for(const fm of dirty)fm.instanceMatrix.needsUpdate=true;
  if(water)refreshHomeGrass();
  // the lists taps and walking use
  landList=landList.filter(L=>!changed.has(K(L[0],L[1])));riverList=riverList.filter(L=>!changed.has(K(L[0],L[1])));
  for(const k of changed){const t=landMap.get(k),[x,z]=k.split(',').map(Number);if(t==='river')riverList.push([x,z,riverSurf.get(k)]);else if(isLandT(t))landList.push([x,z,t,islMap.get(k),topY(x,z)]);}
  nearT=0;}
// put every river and bridge tile back to the ground it was carved from, carve the rivers again (with your ponds),
// and return the tiles that came out different
function redoRivers(isl){const sig=k=>landMap.get(k)+'|'+(lvlMap.get(k)||0)+'|'+(riverSurf.get(k)||0),before=new Map(isl.keys.map(k=>[k,sig(k)]));
  for(const k of isl.keys){const t=landMap.get(k);if(t!=='river'&&!(t==='bridge'&&bridgeY.has(k)))continue;const [x,z]=k.split(',').map(Number),bt=tileTypeI(isl,x,z);
    landMap.set(k,bt);riverSurf.delete(k);bridgeY.delete(k);lvlMap.delete(k);if(bt==='grass'){const l=levelOf(isl,x,z);if(l)lvlMap.set(k,l);}}
  isl.grass=[];isl.sand=[];for(const k of isl.keys){const t=landMap.get(k);if(t!=='grass'&&t!=='sand')continue;const [x,z]=k.split(',').map(Number);(t==='grass'?isl.grass:isl.sand).push([x,z]);}
  if(isl.riverG){isl.group.remove(isl.riverG);isl.riverG.traverse(o=>{if(o.isInstancedMesh)o.dispose();else if(o.geometry&&o.geometry!==TILE_PLANE)o.geometry.dispose();});}
  isl.riverG=new T.Group();isl.riverG.userData.core=1;isl.group.add(isl.riverG);
  if(isl.riverN||S.terra&&Object.values(S.terra).some(v=>v<0))carveRivers(isl,isl.riverG);
  const out=[];for(const k of isl.keys)if(sig(k)!==before.get(k))out.push(k);return out;}
