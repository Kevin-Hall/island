/* =========================================================
   The Island Heart: your level, made visible. It starts as a sapling in the square of the island you chose and grows
   with every level (farming, fishing, bugs, decorating, restoring other islands all feed it). Each level builds out
   the island: the store, the boat, the museum, the café, the town hall, the lighthouse, and plots
   that neighbours move into the morning after they appear.
   Saves from before this (no S.scratch) have everything unlocked, as they always did.
   To add an unlock: an entry in HEART_UNLOCKS, then check unlocked(key) wherever it's built or used.
   ========================================================= */
const HEART_UNLOCKS=[
  {lv:2, k:'shop',   name:'General store',   icon:'shop',  desc:'Decor, fences, sprinklers and tool upgrades.'},
  {lv:3, k:'vh0',    name:'A plot for a neighbour',icon:'heart',desc:'Someone will move in the next morning.'},
  {lv:4, k:'boat',   name:'Your boat',       icon:'boat',  desc:'Repaired and seaworthy: sail out and explore the other islands.'},
  {lv:5, k:'museum', name:'Museum',          icon:'dex',   desc:'Every fish and bug you catch goes on display.'},
  {lv:5, k:'vh1',    name:'A second plot',   icon:'heart', desc:'Another neighbour arrives the next morning.'},
  {lv:6, k:'cafe',   name:'Harbour café',    icon:'star',  desc:'Cocoa and coffee that give you a boost for the day.'},
  {lv:7, k:'hall',   name:'Town hall',       icon:'task',  desc:'A home for the daily requests and island news.'},
  {lv:7, k:'vh2',    name:'A third plot',    icon:'heart', desc:'Another neighbour arrives the next morning.'},
  {lv:8, k:'light',  name:'Lighthouse',      icon:'boat',  desc:'Its beam guides you home at night.'},
  {lv:9, k:'vh3',    name:'A fourth plot',   icon:'heart', desc:'Another neighbour arrives the next morning.'},
  {lv:10,k:'vh4',    name:'A fifth plot',    icon:'heart', desc:'Another neighbour arrives the next morning.'},
  {lv:11,k:'vh5',    name:'The last plot',   icon:'heart', desc:'Your village is complete.'}];
const unlocked=k=>{if(!S.scratch)return true;const u=HEART_UNLOCKS.find(q=>q.k===k);return !u||level()>=u.lv;};
const movedIn=n=>!S.scratch||!!(S.moved&&S.moved[n]);
// on a wild island a building stands once you've placed its kit and a night has passed
const built=t=>!S.scratch||(S.builds||[]).some(b=>b.t===t&&S.day>b.day);
const KIT_KINDS=['shop','museum','cafe','hall','vh0','vh1','vh2','vh3','vh4','vh5'];
// every building kit your level has earned and you haven't placed yet
function grantKits(){if(!S.scratch)return;S.kits=S.kits||{};const placed=k=>(S.builds||[]).some(b=>(b.t==='vh'?'vh'+b.n:b.t)===k);
  for(const u of HEART_UNLOCKS)if(KIT_KINDS.includes(u.k)&&level()>=u.lv&&!placed(u.k))S.kits[u.k]=1;}
const nextUnlock=()=>S.scratch?HEART_UNLOCKS.find(u=>u.lv>level())||null:null;
// what to do next, shown under your level (and tapping it does it where it can)
function nextGoal(){if(!S.scratch)return null;const h=S.heart||{};
  if(!S.heartAt)return{tag:'Glowing in your pack',name:'Plant your driftseed',act:'seed'};
  if(!S.homeAt)return{tag:'Home',name:'Pitch your tent',act:'tent'};
  const k=Object.keys(S.kits||{}).find(q=>S.kits[q]);if(k){const u=HEART_UNLOCKS.find(q=>q.k===k);return{tag:'Build',name:'Place: '+u.name.replace(/^A |^The /,'').toLowerCase(),act:'kit:'+k};}
  const u=nextUnlock();return u?{tag:'Heart Lv '+u.lv,name:u.name,act:'info'}:null;}
function goalTap(){const g=nextGoal();if(!g)return;SFX.ui();
  if(g.act==='tent')startBlueprint('tent');
  else if(g.act==='seed')startBlueprint('seed');
  else if(g.act.startsWith('kit:'))startBlueprint(g.act.slice(4));
  else{const u=nextUnlock();toast(`At Island Heart level ${u.lv}: <b>${u.name.toLowerCase()}</b>. ${u.desc} Farming, fishing, catching bugs, decorating and restoring other islands all help it grow.`,'',ICON.star);}}
const heartIcon=k=>ICON[k]||ICON.star;

// the tree itself. Returns {tp (far-LOD tree parts), p (plain), gl (glow)}. On a classic island it's an ancient,
// gnarled tree whose crown fills out with each level (blossom from 4, golden fruit from 8).
// On a wild island it's the driftseed you planted: a glowing seed and its first leaves (lv 1), a sapling (lv 2), then a
// young tree whose trunk thickens and crown widens with every level, blossom from level 4 and golden fruit from level 8.
function heartTreeParts(lv){if(S.scratch)return seedTreeParts(lv);return ancientTreeParts(lv);}
const HEART_LEAF=[0x8ce4ac,0x3eaa7e,0x1c6450],HEART_BARK=[0x8a6a54,0x5c4232];
function seedTreeParts(lv){const R=mulberry(91),tp=[],p=[],gl=[],[bk,bk2]=HEART_BARK;
  // a ring of pale stones round the spot you chose, and a low mound of dark soil
  const rr=lv<=2?0.42:0.9;for(let i=0;i<(lv<=2?7:10);i++){const a=i/(lv<=2?7:10)*6.283+0.2;p.push(P(ICO,i%2?0xc8c2b4:0xb4ae9e,Math.cos(a)*rr,0.05,Math.sin(a)*rr,0,a,0,0.16+R()*0.05,0.1,0.13));}
  p.push(P(ICO2,0x4e3a2c,0,0.02,0,0,0,0,lv<=2?0.5:0.7,0.08,lv<=2?0.5:0.7));
  if(lv<=1){// the seed, split open and glowing, with its first pair of leaves on a curling stem
    gl.push(P(ICO2,0xa8ffd8,0,0.13,0,0,0,0,0.2,0.18,0.2));p.push(P(ICO2,0x7a5a3a,-0.11,0.1,0.04,0,0,0.6,0.14,0.1,0.18),P(ICO2,0x7a5a3a,0.11,0.1,-0.03,0,0,-0.6,0.14,0.1,0.18));
    p.push(P(CYL6,0x5aa860,0,0.4,0,0.12,0,0,0.045,0.55,0.045));lf(p,HEART_LEAF[0],0,0.64,0.03,0.6,0.35,0.4,0.25,0.05);lf(p,HEART_LEAF[1],0,0.61,0,0.6+Math.PI,0.3,0.36,0.23,0.05);lf(p,HEART_LEAF[0],0,0.68,0,2.1,0.9,0.2,0.13,0.04);
    for(let i=0;i<6;i++){const a=i*1.05;gl.push(P(ICO,0xe0fff0,Math.cos(a)*0.3,0.25+i*0.08,Math.sin(a)*0.3,0,0,0,0.035,0.035,0.035));}return{tp,p,gl};}
  if(lv===2){// a sapling: a slim trunk, a few side shoots and a small bright crown; the seed's glow at its foot
    p.push(PG(CYL6,bk,bk2,0,0.45,0,0,0,0,0.07,0.9,0.07));for(let i=0;i<3;i++){const a=i*2.1+0.4;p.push(P(CYL6,bk,Math.cos(a)*0.08,0.55+i*0.1,Math.sin(a)*0.08,Math.sin(a)*0.9,0,-Math.cos(a)*0.9,0.025,0.22,0.025));}
    canopy(tp,R,HEART_LEAF,0,1.05,0,0.3,18);gl.push(P(ICO2,0xa8ffd8,0,0.1,0.08,0,0,0,0.08,0.07,0.08));return{tp,p,gl};}
  // a young tree that grows into a great one: g runs 0→1 over levels 3..11
  const g=Math.min(1,(lv-3)/8),h=1.1+g*1.2,w=0.12+g*0.14;
  tp.push(PG(TRUNK,bk,bk2,0,(h+0.3)/2,0,0,0.4,0,w*2,h+0.3,w*2));
  for(let i=0;i<5;i++){const a=i/5*6.283+0.3;tp.push(PG(CONE6,bk,bk2,Math.cos(a)*w*1.3,0.1,Math.sin(a)*w*1.3,Math.sin(a)*1.2,0,-Math.cos(a)*1.2,w*0.8,0.35+g*0.3,w*0.8));}
  // the heart in its trunk: a softly glowing knot
  gl.push(P(ICO2,0x9affc8,0,h*0.45,w*0.95,0,0,0,w*0.7,w*0.9,w*0.3));p.push(P(CYL12,bk2,0,h*0.45,w*0.92,1.57,0,0,w*0.95,0.03,w*1.15));
  // boughs, one more every level or two, each with its own clump of leaves; a crown on top
  const nb=Math.min(5,1+Math.floor((lv-2)/2)),tips=[];
  for(let i=0;i<5;i++){const a=i/5*6.283+0.5,tl=0.8+(i%2)*0.15,L=0.6+g*0.6,y0=h*(0.7+(i%3)*0.08);const x=Math.cos(a)*Math.sin(tl)*L,y=y0+Math.cos(tl)*L,z=Math.sin(a)*Math.sin(tl)*L;tips.push([x,y,z]);
    if(i<nb)tp.push(PG(CYL6,bk,bk2,x/2,y0+Math.cos(tl)*L/2,z/2,Math.sin(a)*tl,0,-Math.cos(a)*tl,w*0.55,L,w*0.55));}
  tips.forEach(([x,y,z],i)=>{if(i<nb)canopy(tp,R,HEART_LEAF,x,y+0.1,z,0.28+0.22*g,Math.round(16+16*g));});
  const top=h+0.35+g*0.3;canopy(tp,R,HEART_LEAF,0,top,0,0.42+0.3*g,Math.round(24+20*g));
  const crown=[...tips.slice(0,nb),[0,top,0]];
  if(lv>=4){const n=Math.min(30,(lv-3)*5);for(let i=0;i<n;i++){const [x,y,z]=crown[i%crown.length],a=R()*6.28,r=0.3+R()*0.3;bloom(p,[0xf8c8d8,0xffffff,0xf2a6c8][i%3],0xf6d04a,x+Math.cos(a)*r,y+0.1+R()*0.4,z+Math.sin(a)*r,0.08);}
    for(let i=0;i<Math.min(14,lv*2);i++){const a=i*2.39996,r=1.1+R()*0.6;bloom(p,[0xf8c8d8,0xfff4a0,0xffffff][i%3],0xf6d04a,Math.cos(a)*r,0.06,Math.sin(a)*r,0.07);}}
  if(lv>=8)for(let i=0;i<Math.min(12,(lv-7)*3);i++){const [x,y,z]=crown[i%crown.length];gl.push(P(ICO2,0xffe27a,x+(R()-0.5)*0.6,y-0.25-R()*0.25,z+(R()-0.5)*0.6,0,0,0,0.12,0.15,0.12));}
  return{tp,p,gl};}
// the ancient heart tree in the square of a classic (pre-wild) island
function ancientTreeParts(lv){const R=mulberry(77),tp=[],p=[],gl=[],dead=lv<=0,bark=dead?0x8a847a:0x6a4a34,bark2=dead?0x6e685e:0x523826;
  for(let i=0;i<9;i++){const a=i/9*6.283;p.push(P(ICO,i%2?0xb8b4ac:0xa8a49c,Math.cos(a)*1.25,0.06,Math.sin(a)*1.25,0,a,0,0.3,0.16,0.24));}
  tp.push(PG(CYL8,bark,bark2,0,0.85,0,0,0,0.04,0.62,1.7,0.62),PG(CYL8,bark,bark2,0.05,1.95,0.02,0.06,0,-0.08,0.44,0.7,0.44));
  for(let i=0;i<7;i++){const a=i/7*6.283+0.3;tp.push(PG(CONE6,bark,bark2,Math.cos(a)*0.42,0.14,Math.sin(a)*0.42,Math.sin(a)*1.2,0,-Math.cos(a)*1.2,0.2,0.75,0.2));}
  const tips=[];for(let i=0;i<5;i++){const a=i/5*6.283+0.5,tl=0.75+(i%2)*0.2,L=1.1+(i%3)*0.18;const x=Math.cos(a)*Math.sin(tl)*L*0.5,y=2.1+Math.cos(tl)*L*0.5,z=Math.sin(a)*Math.sin(tl)*L*0.5;
    tp.push(PG(CYL6,bark,bark2,x,y,z,Math.sin(a)*tl,0,-Math.cos(a)*tl,0.16,L,0.16));tips.push([Math.cos(a)*Math.sin(tl)*L,2.1+Math.cos(tl)*L,Math.sin(a)*Math.sin(tl)*L]);}
  // the knot in its trunk: a dark scar while it's withered, a softly glowing heart once revived
  (dead?p:gl).push(P(ICO2,dead?0x4a4038:0x9affc8,0,1.15,0.3,0,0,0,0.26,0.32,0.12));p.push(P(CYL12,bark2,0,1.15,0.29,1.57,0,0,0.36,0.05,0.44));
  if(dead){for(const [x,y,z] of tips)for(let k=0;k<3;k++)p.push(P(CYL6,bark2,x+(R()-0.5)*0.3,y+0.12,z+(R()-0.5)*0.3,(R()-0.5)*1.4,0,(R()-0.5)*1.4,0.05,0.4,0.05));
    for(let i=0;i<6;i++)lf(p,[0xa08a5a,0x8a7448][i%2],(R()-0.5)*1.6,0.03,(R()-0.5)*1.6,R()*6.28,0,0.12,0.08,0.02);return{tp,p,gl};}
  const cols=[0xa8ec84,0x62b858,0x2e7a3e],grow=Math.min(1,lv/7);for(let i=0;i<Math.min(16,lv*3);i++){const a=i*2.39996,r=1.6+R()*0.9;bloom(p,[0xf8c8d8,0xfff4a0,0xffffff][i%3],0xf6d04a,Math.cos(a)*r,0.08,Math.sin(a)*r,0.08);}
  tips.forEach(([x,y,z],i)=>{if(i>=Math.min(5,1+lv))return;canopy(tp,R,cols,x*0.9,y,z*0.9,0.3+0.3*grow,Math.round(10+22*grow));});
  if(lv>=3)canopy(tp,R,cols,0,2.75,0,0.45*grow+0.15,Math.round(12+20*grow));
  if(lv>=4){const nb=Math.min(30,(lv-3)*5);for(let i=0;i<nb;i++){const [x,y,z]=tips[i%5],a=R()*6.28,r=0.4+R()*0.3;bloom(p,[0xf8c8d8,0xffffff,0xf2a6c8][i%3],0xf6d04a,x*0.9+Math.cos(a)*r,y+R()*0.5,z*0.9+Math.sin(a)*r,0.09);}}
  if(lv>=8)for(let i=0;i<Math.min(12,(lv-7)*3);i++){const [x,y,z]=tips[i%5];gl.push(P(ICO2,0xffe27a,x*0.9+(R()-0.5)*0.7,y-0.3-R()*0.3,z*0.9+(R()-0.5)*0.7,0,0,0,0.14,0.17,0.14));}
  return{tp,p,gl};}

// a building that isn't built yet: surveyor's stakes and rope round its footprint, a stack of planks and a sign
function plotParts(b,reserved){const p=[];for(const [x,z] of [[-0.9,-0.9],[0.9,-0.9],[0.9,0.9],[-0.9,0.9]])p.push(P(CYL6,0x9a7a4a,x,0.22,z,0,0,0,0.06,0.44,0.06),P(CONE4,0xe8453a,x,0.47,z,0,0,0,0.08,0.08,0.08));
  for(const [x,z,ry,l] of [[0,-0.9,0,1.8],[0,0.9,0,1.8],[-0.9,0,1.57,1.8],[0.9,0,1.57,1.8]])p.push(P(BOX,0xe8dcc0,x,0.34,z,0,ry,0,l,0.02,0.02));
  if(!reserved)for(let i=0;i<3;i++)p.push(P(BOX,i%2?0xb8905a:0xa88050,-0.3,0.06+i*0.08,-0.2,0,0.1*i,0,0.8,0.07,0.22));
  else p.push(P(ICO2,0x6ab84a,-0.4,0.08,-0.3,0,0,0,0.3,0.16,0.3),P(ICO2,0x7cc458,0.35,0.07,-0.4,0,0,0,0.26,0.14,0.26));
  p.push(P(CYL6,0x7a5230,0.55,0.4,0.95,0,0,0,0.05,0.8,0.05),P(BOX,reserved?0xf8e8c0:0xf6ecd0,0.55,0.74,0.97,0,0,0,0.56,0.34,0.04),P(BOX,reserved?0xe8866a:0x8a6a44,0.55,0.74,0.995,0,0,0,0.3,0.06,0.01));
  if(reserved)p.push(P(ICO2,0xe8453a,0.49,0.8,1.0,0,0,0,0.07,0.07,0.02),P(ICO2,0xe8453a,0.61,0.8,1.0,0,0,0,0.07,0.07,0.02),P(CONE4,0xe8453a,0.55,0.73,1.0,Math.PI,0.785,0,0.12,0.09,0.02));
  return p;}
const plotKey=b=>b.t==='vh'?'vh'+b.n:b.t;
function plotTap(b){const k=plotKey(b),u=HEART_UNLOCKS.find(q=>q.k===k);if(S.scratch){toast(b.t==='vh'?'Your new neighbour is on their way. Their house will be up by tomorrow morning!':`Building work on the ${(u?u.name:b.t).toLowerCase()} is under way. It'll be finished tomorrow morning.`,'',ICON.hammer);return;}
  if(b.t==='vh'&&unlocked(k)){toast('This plot is spoken for. A new neighbour is moving in tomorrow morning!','',ICON.heart||ICON.star);return;}
  toast(u?`Future <b>${u.name.toLowerCase()}</b>. It will be built when your Island Heart reaches <b>level ${u.lv}</b>.`:'Something will be built here one day.','',ICON.star);}

// rebuild the home island after it grows (new buildings, a bigger heart tree, the bridge…)
function rebuildHome(){buildIsland(islands[0]);rebuildSeaGrid();syncObjs();rebuildSoil();syncAllCrops();syncLife();ensureBoat(true);if(typeof nearT!=='undefined')nearT=0;}

// level up: a celebration card listing what the island gained, then the island visibly grows
function heartLevelUp(before,after){const got=HEART_UNLOCKS.filter(u=>u.lv>before&&u.lv<=after),crops=CROP_IDS.filter(id=>CROPS[id].lvl>before&&CROPS[id].lvl<=after).map(id=>CROPS[id].name),
    decor=Object.keys(BUILD).filter(k=>BUILD[k].lvl>before&&BUILD[k].lvl<=after).map(k=>BUILD[k].name);
  const el=document.createElement('div');el.id='heartUp';
  el.innerHTML=`<div class="hu"><div class="hulv">${after}</div><h2>Your Island Heart grew!</h2><p class="husub">${TOWN.name} is growing with it.</p>
    ${got.map(u=>`<div class="hurow"><img class="px" src="${heartIcon(u.icon)}" alt=""><span><b>${u.name}</b><small>${u.desc}</small></span></div>`).join('')}
    ${crops.length?`<div class="hurow"><img class="px" src="${ICON.sprout}" alt=""><span><b>New seeds</b><small>${crops.join(', ')}</small></span></div>`:''}
    ${decor.length?`<div class="hurow"><img class="px" src="${ICON.shop}" alt=""><span><b>New in the store</b><small>${decor.join(', ')}</small></span></div>`:''}
    <button class="pbtn go" id="huOk">Wonderful!</button></div>`;
  document.body.appendChild(el);SFX.level();setTimeout(()=>SFX.rare&&SFX.rare(),300);
  grantKits();
  el.querySelector('#huOk').onclick=()=>{el.remove();if(!S.scratch)return;const kit=got.find(u=>KIT_KINDS.includes(u.k));if(kit)setTimeout(()=>toast(`Your <b>${kit.name.toLowerCase()}</b> kit is ready. Tap the goal under your level to choose where it goes.`,'',ICON.hammer),900);const f=$('fade');f.classList.add('on');
    setTimeout(()=>{rebuildHome();const pc=TOWN.plaza;for(let i=0;i<40;i++)sparkle(pc[0]+(Math.random()-0.5)*3,topY(pc[0],pc[1])+0.5+Math.random()*2.5,pc[1]+(Math.random()-0.5)*3,[0xfff6e2,0xf8c8d8,0xffe27a][i%3]);
      f.classList.remove('on');updateHUD();},650);};}

// each morning: whatever you placed yesterday is finished, and a neighbour moves into their new house
function morningMoveIn(quiet){if(!S.scratch)return;S.moved=S.moved||{};let changed=false;const news=[];
  for(const b of S.builds||[]){if(b.done||S.day<=b.day)continue;b.done=1;changed=true;
    if(b.t==='vh'){S.moved[b.n]=S.day;const v=planVillagers()[b.n];logEvent('movein',{name:v.name});news.push([`<b>${v.name}</b> the ${v.sp} has moved in! Go and say hello.`,'rare']);}
    else{const u=HEART_UNLOCKS.find(q=>q.k===b.t);news.push([`The <b>${(u?u.name:b.t).toLowerCase()}</b> is finished!`,'rare']);}}
  if(!changed)return;rebuildHome();initNPCs();if(!quiet)news.forEach(([m,c],i)=>setTimeout(()=>toast(m,c,ICON.star),1200+i*2600));}
