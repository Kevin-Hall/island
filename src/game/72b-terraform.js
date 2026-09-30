/* =========================================================
   Landscaping (the Landscaping tool, from level TERRA.LV): raise or lower your island's ground one cliff tier at a
   time, up to TERRA.MAX tiers. It works on the island's own tile grid, nothing new: each changed tile's tier is saved
   in S.terra (key → level 0..MAX, or -1 for water) and levelOf (41-trees) reads it back, so the island rebuilds with
   its cliffs where you put them. Lowering a ground-level tile beside the sea, a river or a pond floods it: it
   becomes part of the island's water (a pond tile, carved like the rivers, 43-rivers). Raising a pond tile drains it.
   Not allowed: under buildings, decor, floors, debris, soil or crops; the beach (sand) and the natural rivers.
   Tap a tile to change it, or hold and drag to brush several and change them all at once when you let go.
   Tap the tool again to switch between raising and lowering. Each tile changed costs TERRA.COST shells.
   ========================================================= */
const TERRA={COST:150/* shells per tile per tier */,LV:8/* Island Heart level it unlocks at */,MAX:3};
const terraOn=()=>level()>=TERRA.LV;
const terraMode=()=>S.terraMode==='lower'?'lower':'raise';
// what a tile can become: returns {to, why} (to: new level, -1 for water; why: why not, if it can't)
function terraPlan(x,z,mode){const k=K(x,z),t=landMap.get(k);if(islMap.get(k)!==0)return{why:'Only on your island.'};
  if(fixedAt(x,z)||objAt(x,z)||floorAt(x,z))return{why:'Something is built there.'};
  if(debrisAt(x,z))return{why:'Clear it first.'};if(S.tiles[k])return{why:'That\'s your soil. Fill it in first.'};
  if(findAt(x,z))return{why:'Pick up what\'s lying there first.'};
  const tw=S.terra&&S.terra[k]===-1;
  if(t==='river'&&tw)return mode==='raise'?{to:0}:{why:'It\'s as deep as it goes.'};
  if(t==='river')return{why:'The island\'s own streams stay where they are.'};
  if(t==='sand')return{why:'The beach stays a beach.'};if(t!=='grass')return{why:'You can\'t landscape there.'};
  const L=lvlMap.get(k)||0;
  if(mode==='raise')return L>=TERRA.MAX?{why:'That\'s as high as it goes.'}:{to:L+1};
  if(L>0)return{to:L-1};
  // ground level: lowering floods it, but only next to water (no dry holes)
  const wet=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>{const t2=landMap.get(K(x+dx,z+dz));return t2==='river'||isSeaT(t2);});
  return wet?{to:-1}:{why:'Nothing lower here, unless there\'s water beside it.'};}
function terraApply(tiles,mode){if(!terraOn()){toast(`Landscaping unlocks at Island Heart level ${TERRA.LV}.`);return;}
  const plan=[],seen=new Set();let why='';for(const [x,z] of tiles){const k=K(x,z);if(seen.has(k))continue;seen.add(k);const p=terraPlan(x,z,mode);if(p.why){why=p.why;continue;}plan.push([x,z,p.to]);}
  if(!plan.length){if(why){toast(why);SFX.no();}return;}
  const cost=plan.length*TERRA.COST;if(S.shells<cost){toast(`That needs <b>${fmt(cost)}</b> shells (${TERRA.COST} a tile).`,'',ICON.shell);SFX.no();return;}
  S.shells-=cost;S.terra=S.terra||{};const before=plan.map(([x,z])=>[x,z,topY(x,z)]);
  for(const [x,z,to] of plan)S.terra[K(x,z)]=to;
  rebuildHome();terraFx(before);updateHUD();save();
  floatText(vil.x,vil.y+1.4,vil.z,`${mode==='raise'?'Raised':'Lowered'} ${plan.length} tile${plan.length>1?'s':''} · −${fmt(cost)}`,'');}
function terraTap(x,z){cursorAt(x,z);actAt(x,z,()=>{swingTool();terraApply([[x,z]],terraMode());});}
// each changed tile pops: a block of earth rising or sinking into place, a puff of dust and a soft thud
const terraPops=[];const terraMat=new T.MeshToonMaterial({gradientMap:grad,color:0x8a6a44,transparent:true});
function terraFx(before){camShake=Math.max(camShake,0.25);tone(95,0.22,'sine',0.14,55);noise(0.18,0.09,260,0.7);
  for(const [x,z,y0] of before){const y1=topY(x,z),m=new T.Mesh(BOX,terraMat.clone());m.frustumCulled=false;scene.add(m);terraPops.push({m,x,z,y0,y1,t:0});
    for(let i=0;i<8;i++)emit(x+(Math.random()-0.5)*0.9,Math.max(y0,y1)+0.1,z+(Math.random()-0.5)*0.9,{vx:(Math.random()-0.5)*1.2,vy:0.8+Math.random()*0.8,vz:(Math.random()-0.5)*1.2,life:0.7,max:0.7,size:0.08,color:y1<0.2?0xbfe6ff:0xc8a878,g:3});}}
function updateTerra(dt){for(let i=terraPops.length-1;i>=0;i--){const p=terraPops[i];p.t+=dt;const u=Math.min(1,p.t/0.32),e=1+Math.sin(u*Math.PI)*0.12;/* a little overshoot */
  const y=lerp(p.y0,p.y1,u*u*(3-2*u)),h=Math.max(0.05,y+0.6);p.m.position.set(p.x,y-h/2,p.z);p.m.scale.set(1.02*e,h,1.02*e);p.m.material.opacity=u<0.7?0.9:0.9*(1-(u-0.7)/0.3);
  if(p.t>0.4){scene.remove(p.m);p.m.material.dispose();terraPops.splice(i,1);}}}
function terraToggle(){S.terraMode=terraMode()==='raise'?'lower':'raise';SFX.ui();floatText(vil.x,vil.y+1.3,vil.z,S.terraMode==='raise'?'Raise the land':'Lower the land');renderTools();}
