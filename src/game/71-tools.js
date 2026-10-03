/* =========================================================
   Tools. Tap anywhere to walk there. The equipped tool decides what a tap on a tile does,
   Animal Crossing style: the villager walks up, faces the tile and swings.
   To add a tool: an entry in TOOLS, an icon in SPR, a held model in HELD_PARTS, and a case in toolTap (and paintMode for drag).
   ========================================================= */
const TOOLS=[
  {k:'hand',  name:'Hands',        tip:'Walk, pick up, harvest, tend crops and shake trees'},
  {k:'hoe',   name:'Hoe',          tip:'Till grass into soil for planting'},
  {k:'shovel',name:'Shovel',       tip:'Dig up glinting spots, break rocks, fill soil back in'},
  {k:'can',   name:'Watering Can', tip:'Water your soil'},
  {k:'seeds', name:'Seeds',        tip:'Plant in dug soil (tap again to choose a seed)'},
  {k:'axe',   name:'Axe',          tip:'Chop trees, stumps, bushes and twigs for wood'},
  {k:'net',   name:'Net',          tip:'Catch bugs'},
  {k:'rod',   name:'Fishing Rod',  tip:'Tap the water to cast'},
  {k:'terra', name:'Landscaping',  tip:'Raise or lower the land a tier, or dig and fill water (pick on the bar over the tool button); hold and drag to brush',lv:8}];
const TOOL_OF={};for(const t of TOOLS)TOOL_OF[t.k]=t;
// which tool clears each kind of farm debris (weeds come up with any tool)
const DEBRIS_TOOL={weed:null,twig:'axe',bush:'axe',stump:'axe',rock:'shovel',boulder:'shovel',tree:'axe'};
const toolIcon=k=>PIX[k]||(k==='seeds'?seedIcon(S.seed):ICON[k]); // the pixel set (22d-pixicons)

/* ---- tool bar ---- */
// the ring fans out up and to the left of the corner button: three tools close in, the rest in a wider arc
const fanAng=(i,n)=>i<3?[204,234,264][i]:198+(i-3)*72/Math.max(1,n-4);
const toolsHave=()=>TOOLS.filter(t=>!t.lv||level()>=t.lv);/* the Landscaping tool waits for its Island Heart level */
function renderTools(){const TL=toolsHave(),n=TL.length;$('tools').innerHTML=TL.map((t,i)=>`<button class="tool${S.tool===t.k?' on':''}" data-tool="${t.k}" style="--a:${fanAng(i,n)}deg;--r:${i<3?88:158}px" aria-label="${t.name}" title="${t.name} (${i+1})"><img class="pix" src="${toolIcon(t.k)}" alt=""><span>${t.k==='terra'?'Landscaping: '+TERRA_MODES[terraMode()]:t.name}</span></button>`).join('');
  $('icoTool').src=toolIcon(S.tool);$('bTool').title=TOOL_OF[S.tool]?TOOL_OF[S.tool].name:'Tools';}
function equip(k){if(!TOOL_OF[k]||!toolsHave().includes(TOOL_OF[k]))return;if(S.tool===k&&k==='seeds'){openSheet('seeds');return;}if(S.tool===k&&k==='terra'){terraToggle();return;}
  S.tool=k;SFX.ui();renderTools();showApps(false);showHeld();floatText(vil.x,1.25,vil.z,TOOL_OF[k].name);save();}
$('tools').addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b)equip(b.dataset.tool);});
window.addEventListener('keydown',e=>{if(sheet||inside||e.target.tagName==='INPUT')return;const i=+e.key-1,TL=toolsHave();if(i>=0&&i<TL.length)equip(TL[i].k);});
// tap-to-do: the thing you tap picks the tool (Animal Crossing / Club Penguin style), so you rarely need the tool bar
function autoTool(k){if(S.tool===k||!TOOL_OF[k])return;S.tool=k;renderTools();showHeld();}
let hintAt=0;function toolHint(msg,k){const now=performance.now();if(now-hintAt<2500)return;hintAt=now;toast(msg,'',k?toolIcon(k):undefined);}

/* ---- the tool in the villager's hand (models point along +y from the grip; +z is forward) ---- */
const HELD_PARTS={
  hoe:[P(CYL6,0x9a6a3a,0,0.26,0,0,0,0,0.035,0.58,0.035),P(BOX,0x6a6e78,0,0.54,0.05,0,0,0,0.04,0.05,0.1),P(BOX,0xb8bcc8,0,0.5,0.13,0.25,0,0,0.15,0.1,0.025),P(BOX,0xe0e4ec,0,0.455,0.14,0.25,0,0,0.15,0.015,0.028)],
  shovel:[P(CYL6,0x9a6a3a,0,0.2,0,0,0,0,0.035,0.44,0.035),P(BOX,0x6a4a2a,0,0.0,0,0,0,0,0.1,0.03,0.03),P(BOX,0xb8bcc8,0,0.48,0,0,0,0,0.13,0.16,0.025),P(BOX,0x9a9ea8,0,0.4,0,0,0,0,0.13,0.02,0.03)],
  axe:[P(CYL6,0x9a6a3a,0,0.18,0,0,0,0,0.035,0.4,0.035),P(BOX,0x8e929c,0,0.34,0.06,0,0,0,0.035,0.11,0.13),P(BOX,0xd8dce4,0,0.34,0.13,0,0,0,0.037,0.12,0.025)],
  can:[P(CYL12,0xe0883a,0,0.02,0.1,0,0,0,0.17,0.15,0.15),P(CYL12,0xb8662a,0,0.1,0.1,0,0,0,0.12,0.02,0.1),P(CYL6,0xe0883a,0,0.06,0.23,1.0,0,0,0.03,0.18,0.03),P(BOX,0xb8662a,0,0.13,0.07,0,0,0,0.03,0.08,0.1)],
  seeds:[P(ICO2,0xd8b078,0,0.0,0.06,0,0,0,0.12,0.14,0.11),P(BOX,0x8a5a3a,0,0.07,0.06,0,0,0,0.07,0.02,0.07)],
  net:[P(CYL6,0x9a6a3a,0,0.26,0,0,0,0,0.03,0.56,0.03),P(CYL12,0x8a6a44,0,0.62,0,1.57,0,0,0.26,0.02,0.26),P(CYL12,0xf4f4ee,0,0.62,0.005,1.57,0,0,0.22,0.02,0.22)],
  rod:[P(CYL6,0x9a7a4a,0,0.45,0,0,0,0,0.025,0.95,0.025),P(CYL12,0x5a5a6a,0,0.08,0.03,0,0,1.57,0.06,0.03,0.06)],
  terra:[P(CYL6,0x9a6a3a,0,0.22,0,0,0,0,0.04,0.48,0.04),P(BOX,0x5a8a3a,0,0.5,0,0,0,0,0.2,0.1,0.06),P(BOX,0xb8bcc8,0,0.46,0.035,0,0,0,0.22,0.16,0.02)]};
const HELD_TILT={hoe:0.5,shovel:0.55,axe:0.35,can:0.1,seeds:0,net:0.45,rod:0.85,terra:0.5};
const toolHold=new T.Group();toolHold.position.set(0.3,0.22,0.08);toolHold.scale.setScalar(1.35);villager.add(toolHold);
const heldMesh={};for(const k in HELD_PARTS){const m=M(HELD_PARTS[k]);m.castShadow=true;m.visible=false;toolHold.add(m);heldMesh[k]=m;}
function showHeld(){for(const k in heldMesh)heldMesh[k].visible=S.tool===k;}
// every use of a tool is a little performance: a wind-up, the strike (the moment its effect happens, `hit`), and a
// follow-through. Keys are [u, tool pitch, tool roll, tool lift, body lean]; the body leans back to wind up and into the blow.
const TOOL_ANIM={
  hoe:{d:0.52,hit:0.5,k:[[0,0,0,0,0],[0.38,-1.8,0,0.1,-0.24],[0.5,1.25,0,-0.08,0.4],[0.68,1.05,0,-0.1,0.36],[0.86,0.5,0,-0.04,0.12],[1,0,0,0,0]]},/* up over the head, down hard, drag it back through the earth */
  shovel:{d:0.5,hit:0.42,k:[[0,0,0,0,0],[0.3,-0.9,0,0.06,-0.16],[0.42,1.05,0,-0.1,0.38],[0.62,1.0,0,-0.12,0.34],[0.8,-0.35,0.25,0,-0.12],[1,0,0,0,0]]},/* stab in, then lever the dirt out */
  axe:{d:0.5,hit:0.56,k:[[0,0,0,0,0],[0.45,-1.9,0.3,0.08,-0.22],[0.56,0.9,0,-0.04,0.34],[0.7,0.8,0,-0.04,0.3],[1,0,0,0,0]]},/* a slow wind-up over the shoulder, a fast chop */
  net:{d:0.38,hit:0.5,k:[[0,0,0,0,0],[0.25,-0.4,-1.2,0.05,-0.08],[0.55,0.95,1.1,-0.05,0.28],[0.75,0.8,1.2,-0.05,0.22],[1,0,0,0,0]]},/* a big sideways swoop */
  can:{d:0.6,hit:0.3,k:[[0,0,0,0,0],[0.25,0.95,0,0.04,0.12],[0.75,1.0,0.1,0.04,0.14],[1,0,0,0,0]]},/* tip and pour */
  seeds:{d:0.42,hit:0.5,k:[[0,0,0,0,0],[0.35,-0.6,0,0.04,-0.06],[0.55,0.7,0,0.06,0.16],[1,0,0,0,0]]},/* a scattering toss */
  rod:{d:0.4,hit:0.5,k:[[0,0,0,0,0],[0.5,0.5,0,0,0.12],[1,0,0,0,0]]},
  terra:{d:0.5,hit:0.5,k:[[0,0,0,0,0],[0.38,-1.6,0,0.1,-0.2],[0.5,1.2,0,-0.1,0.4],[0.7,1.0,0,-0.1,0.34],[1,0,0,0,0]]},/* a big two-handed thump */
  hand:{d:0.3,hit:0.45,k:[[0,0,0,0,0],[0.45,0,0,0,0.3],[1,0,0,0,0]]}};/* reach out */
let anim=null,poseLean=0,fishLean=0;const _hq=new T.Quaternion(),_he=new T.Euler(),_hv=new T.Vector3();
// the hand a character holds its tools in (CHARS' hand: a bone, and where the palm is from it), once its model is in
function handOf(b){if(!b||!b.userData.char)return null;if(b.userData.hand)return b.userData.hand;const H=charDef(b.userData.char.c).hand;if(!H)return null;
  let bone=null;b.traverse(o=>{if(o.isBone&&o.name===H.bone&&!bone)bone=o;});if(!bone)return null;return b.userData.hand={bone,off:new T.Vector3(...H.off),arm:!!H.arm,w:0};}
function swingTool(onHit){if(anim&&anim.hit)fireHit(anim);anim={A:TOOL_ANIM[S.tool]||TOOL_ANIM.hand,t:0,t0:performance.now(),hit:onHit||null};}
function fireHit(a){const h=a.hit;a.hit=null;if(h)h();}
function animKey(K,u){let i=1;while(i<K.length-1&&K[i][0]<u)i++;const a=K[i-1],b=K[i],t=smooth(0,1,(u-a[0])/(b[0]-a[0]||1));return[lerp(a[1],b[1],t),lerp(a[2],b[2],t),lerp(a[3],b[3],t),lerp(a[4],b[4],t)];}
function updateTool(dt){toolHold.visible=!S.sea&&!fishing&&!rodAfter;const base=HELD_TILT[S.tool]||0;let v=[0,0,0,0];
  if(anim){const a=anim;a.t+=dt;/* frames or the clock, whichever is further on, so a slow frame never stalls a swing */
    const u=a.fz??Math.min(1,Math.max(a.t,(performance.now()-a.t0)/1000)/a.A.d);/* (fz: held at one moment, for the debug pose) */v=animKey(a.A.k,u);
    if(a.hit&&u>=a.A.hit)fireHit(a);if(anim===a&&u>=1)anim=null;}
  toolHold.rotation.set(base+v[0],0,v[1]);poseLean=anim?v[3]:fishLean;
  // a character holds it in its hand: the grip follows the hand on the tool's side wherever its clips move it, and a
  // code-built one (Pip, Sprig, Mochi) reaches out with that arm to carry it, raising it for the wind-up and bringing
  // it down through the blow
  const hb=handOf(villager.children[0]),holding=hb&&((toolHold.visible&&heldMesh[S.tool])||(fishing&&!S.sea));
  if(hb){hb.w=lerp(hb.w,holding?1:0,Math.min(1,dt*10));
    if(hb.arm&&hb.w>0.01){const x=fishing?-0.85:-0.5+(v[0]<0?0.95*v[0]:-0.4*v[0]);_hq.setFromEuler(_he.set(x,0,0.22+0.35*v[1]));hb.bone.quaternion.slerp(_hq,hb.w);}
    villager.updateMatrixWorld(true);const p=villager.worldToLocal(hb.bone.localToWorld(_hv.copy(hb.off)));toolHold.position.copy(p);rod.position.copy(p);}
  else{toolHold.position.set(0.3,0.22+v[2],0.08);rod.position.set(0.2,0.22,0.08);}
  if(camShake>0)camShake=Math.max(0,camShake-dt*0.5);}

/* ---- tapping the world ---- */
// walk up to a tile, face it, swing, then do the action
function actAt(x,z,fn){const run=()=>{villager.rotation.y=Math.atan2(x-vil.x,z-vil.z);swingTool(()=>{fn();updateHUD();});};
  if(Math.hypot(x-vil.x,z-vil.z)<1.1){vil.tx=vil.x;vil.tz=vil.z;vil.path=null;vil.cb=null;run();return;}
  walkTo(x,z);vil.cb=run;}
function toolTap(x,z,isl){const tool=S.tool,k=K(x,z);
  if(tool==='terra'&&isl&&isl.home){terraTap(x,z);return;}
  {const fd0=findAt(x,z);if(fd0&&fd0.k==='glint'){actAt(x,z,()=>openGlint(fd0));return;}if(fd0&&fd0.k==='tuft'){actAt(x,z,()=>rustleTuft(fd0));return;}}
  {const fd=findAt(x,z);if(fd&&(fd.k==='dig'||fd.k==='bubbles')){autoTool('shovel');actAt(x,z,()=>{digStab(x,z,0.6);/* two stabs: the hole opens, then whatever's buried comes up */swingTool(()=>{digStab(x,z,1);digSpot(fd);});});return;}if(fd){actAt(x,z,()=>collectFind(fd));return;}const pl=plantAt(x,z);if(pl){actAt(x,z,()=>pickPlant(pl));return;}}
  if(isl&&!isl.home&&nearHeart(isl,x,z)){actAt(x,z,()=>heartTap(isl));return;}
  // another island: its trees come down to the axe (a tap with anything else just walks there), and placed decor can be
  // tapped like at home
  if(isl&&!isl.home){const t=isl.trees&&isl.trees.get(k);if(t){if(tool==='axe')actAt(x,z,()=>chopWild(isl,t));else{if(!S.axeHint){S.axeHint=1;toast('Hold the axe to cut down trees here.');}goTo(x,z);}return;}}
  if(!isl||!isl.home){goTo(x,z);return;}
  // town trees and rocks: shake or chop a tree, break a rock with the shovel
  const res=fixedAt(x,z)==='decor'&&TOWN.res.get(k);
  if(res==='tree'){actAt(x,z,tool==='axe'?()=>chopTree(x,z):()=>gatherRes(x,z));return;}
  if(res){if(tool!=='axe')autoTool('shovel');actAt(x,z,()=>gatherRes(x,z));return;}
  if(useFixed(x,z))return;
  const db=debrisAt(x,z);
  // trees and bushes: a tap shakes or rustles them (only the axe, held on purpose, chops)
  if(db&&(db.k==='tree'||db.k==='bush')&&tool!=='axe'){actAt(x,z,()=>db.k==='tree'?shakeTree(db):rustleBush(db));return;}
  if(db){const need=DEBRIS_TOOL[db.k];if(need)autoTool(need);actAt(x,z,()=>hitDebris(db));return;}
  {const wd=weedAt(x,z);if(wd){actAt(x,z,()=>pullWeed(wd));return;}}
  const t=S.tiles[k];
  if(t&&t.crop&&t.crop.p>=1&&tool!=='shovel'){actAt(x,z,()=>harvest(k,x,z));return;}
  // soil: a thirsty crop gets watered, a growing one tended, empty soil planted with your chosen seed
  if(t&&tool!=='shovel'&&tool!=='can'){
    if(t.crop&&!t.w){autoTool('can');actAt(x,z,()=>waterAt(x,z));return;}
    if(t.crop){autoTool('hand');actAt(x,z,()=>tendAt(x,z));return;}
    if(!t.crop){autoTool('seeds');actAt(x,z,()=>plant(k,x,z));return;}}
  switch(tool){
    case'hoe':if(canTill(x,z)){actAt(x,z,()=>tillAt(x,z));return;}if(t)toolHint(t.crop?'Something is growing there.':'That soil is already tilled.');else if(TOWN.path.has(k))toolHint('Better not till the path!');break;
    case'shovel':if(t&&!t.crop){actAt(x,z,()=>fillAt(x,z));return;}if(canTill(x,z)){autoTool('hoe');actAt(x,z,()=>tillAt(x,z));return;}
      if(t)toolHint('Something is growing there.');else if(TOWN.path.has(k))toolHint('Better not dig up the town path!');break;
    case'can':actAt(x,z,()=>waterAt(x,z));return;
    case'seeds':if(t&&!t.crop){actAt(x,z,()=>plant(k,x,z));return;}if(!t&&landMap.get(k)==='grass')toolHint('Till the ground with the <b>hoe</b> first.','hoe');break;
    case'hand':if(t&&t.crop){actAt(x,z,()=>tendAt(x,z));return;}break;
    case'axe':case'net':actAt(x,z,()=>{});return;}
  goTo(x,z);}
// chop a town tree for wood: a few logs a day per tree, and the tree stays
// a tree on another island: three blows, then it falls; it stays felled (S.felled), and the island is rebuilt without it
function chopWild(isl,t){walkTo(t.x,t.z);vil.hop=0.2;t.hp=(t.hp??3)-1;const y=topY(t.x,t.z)+0.45;tone(140,0.07,'triangle',0.06);noise(0.06,0.04,900);chips(t.x,t.z,y);
  if(t.hp>0)return;const F=S.felled||(S.felled={}),k=K(t.x,t.z);(F[isl.id]||(F[isl.id]=[])).push(k);fellTree({x:t.x,z:t.z,v:Math.floor(hash(t.x,t.z)*3),sc:1,r:hash(t.z,t.x)*6.28});
  buildIsland(isl);rebuildLandList();cullIslands();
  const n=3+(Math.random()<0.5?1:0)+(Math.random()<0.5?1:0);gain('m:wood',n);floatText(t.x,1.6,t.z,'+'+n+' '+MATS.wood.name,'gold');save();}
function chopTree(x,z){const k=K(x,z),sh=S.shook[k]||{d:0,n:0,c:0};if(sh.d!==S.day){sh.d=S.day;sh.n=0;sh.c=0;}sh.c=sh.c||0;S.shook[k]=sh;const y=topY(x,z);
  tone(150,0.06,'triangle',0.07);noise(0.07,0.05,900);burst(x,y+0.5,z,0x9a6a3a,8,1.2,0.06);burst(x,y+1.5,z,0x6ab84a,6,1.0,0.07,3);
  if(sh.c>=3){toast('This tree has given all the wood it can today.');return;}sh.c++;
  const n=sh.c===3?2:1;gain('m:wood',n);floatText(x,y+1.2,z,'+'+n+' Wood','gold');SFX.pop();addXP(1);}
