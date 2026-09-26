/* =========================================================
   Tools. Tap anywhere to walk there. The equipped tool decides what a tap on a tile does,
   Animal Crossing style: the villager walks up, faces the tile and swings.
   To add a tool: an entry in TOOLS, an icon in SPR, a held model in HELD_PARTS, and a case in toolTap (and paintMode for drag).
   ========================================================= */
const TOOLS=[
  {k:'hand',  name:'Hands',        tip:'Walk, pick up, harvest, tend crops and shake trees'},
  {k:'shovel',name:'Shovel',       tip:'Dig grass into soil, fill soil back in and break rocks'},
  {k:'can',   name:'Watering Can', tip:'Water your soil'},
  {k:'seeds', name:'Seeds',        tip:'Plant in dug soil (tap again to choose a seed)'},
  {k:'axe',   name:'Axe',          tip:'Chop trees, stumps, bushes and twigs for wood'},
  {k:'net',   name:'Net',          tip:'Catch bugs'},
  {k:'rod',   name:'Fishing Rod',  tip:'Tap the water to cast'}];
const TOOL_OF={};for(const t of TOOLS)TOOL_OF[t.k]=t;
// which tool clears each kind of farm debris (weeds come up with any tool)
const DEBRIS_TOOL={weed:null,twig:'axe',bush:'axe',stump:'axe',rock:'shovel',boulder:'shovel'};
const toolIcon=k=>k==='seeds'?seedIcon(S.seed):ICON[k];

/* ---- tool bar ---- */
function renderTools(){$('tools').innerHTML=TOOLS.map((t,i)=>`<button class="tool${S.tool===t.k?' on':''}" data-tool="${t.k}" aria-label="${t.name}" title="${t.name} (${i+1})"><img class="px" src="${toolIcon(t.k)}" alt=""></button>`).join('');}
function equip(k){if(!TOOL_OF[k])return;if(S.tool===k&&k==='seeds'){openSheet('seeds');return;}
  S.tool=k;SFX.ui();renderTools();showHeld();floatText(vil.x,1.25,vil.z,TOOL_OF[k].name);save();}
$('tools').addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b)equip(b.dataset.tool);});
window.addEventListener('keydown',e=>{if(sheet||inside||e.target.tagName==='INPUT')return;const i=+e.key-1;if(i>=0&&i<TOOLS.length)equip(TOOLS[i].k);});
let hintAt=0;function toolHint(msg,k){const now=performance.now();if(now-hintAt<2500)return;hintAt=now;toast(msg,'',k?toolIcon(k):undefined);}

/* ---- the tool in the villager's hand (models point along +y from the grip; +z is forward) ---- */
const HELD_PARTS={
  shovel:[P(CYL6,0x9a6a3a,0,0.2,0,0,0,0,0.035,0.44,0.035),P(BOX,0x6a4a2a,0,0.0,0,0,0,0,0.1,0.03,0.03),P(BOX,0xb8bcc8,0,0.48,0,0,0,0,0.13,0.16,0.025),P(BOX,0x9a9ea8,0,0.4,0,0,0,0,0.13,0.02,0.03)],
  axe:[P(CYL6,0x9a6a3a,0,0.18,0,0,0,0,0.035,0.4,0.035),P(BOX,0x8e929c,0,0.34,0.06,0,0,0,0.035,0.11,0.13),P(BOX,0xd8dce4,0,0.34,0.13,0,0,0,0.037,0.12,0.025)],
  can:[P(CYL12,0xe0883a,0,0.02,0.1,0,0,0,0.17,0.15,0.15),P(CYL12,0xb8662a,0,0.1,0.1,0,0,0,0.12,0.02,0.1),P(CYL6,0xe0883a,0,0.06,0.23,1.0,0,0,0.03,0.18,0.03),P(BOX,0xb8662a,0,0.13,0.07,0,0,0,0.03,0.08,0.1)],
  seeds:[P(ICO2,0xd8b078,0,0.0,0.06,0,0,0,0.12,0.14,0.11),P(BOX,0x8a5a3a,0,0.07,0.06,0,0,0,0.07,0.02,0.07)],
  net:[P(CYL6,0x9a6a3a,0,0.26,0,0,0,0,0.03,0.56,0.03),P(CYL12,0x8a6a44,0,0.62,0,1.57,0,0,0.26,0.02,0.26),P(CYL12,0xf4f4ee,0,0.62,0.005,1.57,0,0,0.22,0.02,0.22)],
  rod:[P(CYL6,0x9a7a4a,0,0.45,0,0,0,0,0.025,0.95,0.025),P(CYL12,0x5a5a6a,0,0.08,0.03,0,0,1.57,0.06,0.03,0.06)]};
const HELD_TILT={shovel:0.55,axe:0.35,can:0.1,seeds:0,net:0.45,rod:0.85};
const toolHold=new T.Group();toolHold.position.set(0.3,0.22,0.08);toolHold.scale.setScalar(1.35);villager.add(toolHold);
const heldMesh={};for(const k in HELD_PARTS){const m=M(HELD_PARTS[k]);m.castShadow=true;m.visible=false;toolHold.add(m);heldMesh[k]=m;}
function showHeld(){for(const k in heldMesh)heldMesh[k].visible=S.tool===k;}
let swingT=0;const SWING=0.38;
function swingTool(){swingT=SWING;}
function updateTool(dt){toolHold.visible=!S.sea&&!fishing;const base=HELD_TILT[S.tool]||0;let off=0;
  if(swingT>0){swingT=Math.max(0,swingT-dt);const u=1-swingT/SWING;
    off=S.tool==='can'||S.tool==='seeds'?Math.sin(u*Math.PI)*0.9:/* pour or scatter */u<0.35?-1.1*u/0.35:-1.1+2.3*Math.sin((u-0.35)/0.65*Math.PI/2);/* raise, then strike */
    if(swingT===0)off=0;}
  toolHold.rotation.x=base+off;}

/* ---- tapping the world ---- */
// walk up to a tile, face it, swing, then do the action
function actAt(x,z,fn){const run=()=>{villager.rotation.y=Math.atan2(x-vil.x,z-vil.z);swingTool();fn();updateHUD();};
  if(Math.hypot(x-vil.x,z-vil.z)<1.1){vil.tx=vil.x;vil.tz=vil.z;vil.path=null;vil.cb=null;run();return;}
  walkTo(x,z);vil.cb=run;}
function toolTap(x,z,isl){const tool=S.tool,k=K(x,z);
  {const fd=findAt(x,z);if(fd){actAt(x,z,()=>collectFind(fd));return;}const pl=plantAt(x,z);if(pl){actAt(x,z,()=>pickPlant(pl));return;}}
  if(isl&&!isl.home&&nearHeart(isl,x,z)){actAt(x,z,()=>heartTap(isl));return;}
  if(!isl||!isl.home){goTo(x,z);return;}
  // town trees and rocks: shake or chop a tree, break a rock with the shovel
  const res=fixedAt(x,z)==='decor'&&TOWN.res.get(k);
  if(res==='tree'){actAt(x,z,tool==='axe'?()=>chopTree(x,z):()=>gatherRes(x,z));return;}
  if(res){if(tool==='shovel'||tool==='axe')actAt(x,z,()=>gatherRes(x,z));else{walkTo(x,z);toolHint('Break rocks with the <b>shovel</b> to get stone.','shovel');}return;}
  if(useFixed(x,z))return;
  const db=debrisAt(x,z);
  if(db){const need=DEBRIS_TOOL[db.k];if(!need||tool===need)actAt(x,z,()=>hitDebris(db));else{walkTo(x,z);toolHint(`Clear that ${db.k} with the <b>${TOOL_OF[need].name.toLowerCase()}</b>.`,need);}return;}
  {const wd=weedAt(x,z);if(wd){actAt(x,z,()=>pullWeed(wd));return;}}
  const t=S.tiles[k];
  if(t&&t.crop&&t.crop.p>=1&&tool!=='shovel'){actAt(x,z,()=>harvest(k,x,z));return;}
  switch(tool){
    case'shovel':if(canTill(x,z)){actAt(x,z,()=>tillAt(x,z));return;}if(t&&!t.crop){actAt(x,z,()=>fillAt(x,z));return;}
      if(t)toolHint('Something is growing there.');else if(TOWN.path.has(k))toolHint('Better not dig up the town path!');break;
    case'can':actAt(x,z,()=>waterAt(x,z));return;
    case'seeds':if(t&&!t.crop){actAt(x,z,()=>plant(k,x,z));return;}if(!t&&landMap.get(k)==='grass')toolHint('Dig the ground with the <b>shovel</b> first.','shovel');break;
    case'hand':if(t&&t.crop){actAt(x,z,()=>tendAt(x,z));return;}break;
    case'axe':case'net':actAt(x,z,()=>{});return;}
  goTo(x,z);}
// chop a town tree for wood: a few logs a day per tree, and the tree stays
function chopTree(x,z){const k=K(x,z),sh=S.shook[k]||{d:0,n:0,c:0};if(sh.d!==S.day){sh.d=S.day;sh.n=0;sh.c=0;}sh.c=sh.c||0;S.shook[k]=sh;const y=topY(x,z);
  tone(150,0.06,'triangle',0.07);noise(0.07,0.05,900);burst(x,y+0.5,z,0x9a6a3a,8,1.2,0.06);burst(x,y+1.5,z,0x6ab84a,6,1.0,0.07,3);
  if(sh.c>=3){toast('This tree has given all the wood it can today.');return;}sh.c++;
  const n=sh.c===3?2:1;gain('m:wood',n);floatText(x,y+1.2,z,'+'+n+' Wood','gold');SFX.pop();addXP(1);}
