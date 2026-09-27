/* =========================================================
   The Island Heart: your level, made visible. It starts as a sapling in the square of the island you chose and grows
   with every level (farming, fishing, bugs, decorating, restoring other islands all feed it). Each level builds out
   the island: the farm bridge, the store, the boat, the museum, the café, the town hall, the lighthouse, and plots
   that neighbours move into the morning after they appear.
   Saves from before this (no S.scratch) have everything unlocked, as they always did.
   To add an unlock: an entry in HEART_UNLOCKS, then check unlocked(key) wherever it's built or used.
   ========================================================= */
const HEART_UNLOCKS=[
  {lv:2, k:'bridge', name:'Farm bridge',     icon:'sprout',desc:'A bridge across the water to the big farm field.'},
  {lv:3, k:'shop',   name:'General store',   icon:'shop',  desc:'Decor, fences, sprinklers and tool upgrades.'},
  {lv:3, k:'vh0',    name:'A plot for a neighbour',icon:'heart',desc:'Someone will move in the next morning.'},
  {lv:4, k:'boat',   name:'Your boat',       icon:'boat',  desc:'Repaired and seaworthy: sail out and explore the other islands.'},
  {lv:5, k:'museum', name:'Museum',          icon:'dex',   desc:'Every fish and bug you catch goes on display.'},
  {lv:5, k:'vh1',    name:'A second plot',   icon:'heart', desc:'Another neighbour arrives the next morning.'},
  {lv:6, k:'cafe',   name:'Harbour café',    icon:'star',  desc:'Cocoa and coffee that give you a boost for the day.'},
  {lv:7, k:'hall',   name:'Town hall',       icon:'task',  desc:'Daily requests, and expanding the farm field.'},
  {lv:7, k:'vh2',    name:'A third plot',    icon:'heart', desc:'Another neighbour arrives the next morning.'},
  {lv:8, k:'light',  name:'Lighthouse',      icon:'boat',  desc:'Its beam guides you home at night.'},
  {lv:9, k:'vh3',    name:'A fourth plot',   icon:'heart', desc:'Another neighbour arrives the next morning.'},
  {lv:10,k:'vh4',    name:'A fifth plot',    icon:'heart', desc:'Another neighbour arrives the next morning.'},
  {lv:11,k:'vh5',    name:'The last plot',   icon:'heart', desc:'Your village is complete.'}];
const unlocked=k=>{if(!S.scratch)return true;const u=HEART_UNLOCKS.find(q=>q.k===k);return !u||level()>=u.lv;};
const movedIn=n=>!S.scratch||!!(S.moved&&S.moved[n]);
const nextUnlock=()=>S.scratch?HEART_UNLOCKS.find(u=>u.lv>level())||null:null;
const heartIcon=k=>ICON[k]||ICON.star;

// the tree itself: a sapling in a ring of stones at level 1, then a round tree that grows with every level,
// gathering blossoms, and from level 8 glowing golden fruit. Returns {tp (tree, far LOD), p (plain), gl (glow)}
function heartTreeParts(lv){const R=mulberry(77),tp=[],p=[],gl=[];
  for(let i=0;i<8;i++){const a=i/8*6.283;p.push(P(ICO,i%2?0xb8b4ac:0xa8a49c,Math.cos(a)*0.62,0.06,Math.sin(a)*0.62,0,a,0,0.24,0.14,0.2));}
  if(lv<=1){p.push(PG(CYL6,0x8a6a44,0x5a3e28,0,0.28,0,0,0,0,0.07,0.56,0.07));
    for(let i=0;i<7;i++)card(p,0,0.5+(i%3)*0.05,0,[Math.sin(i*0.9)*0.7,0.7,Math.cos(i*0.9)*0.7],0.26,0.16,0x9ae070,0x3e8a3a);
    return{tp,p,gl};}
  const s=0.62+0.95*Math.min(1,(lv-2)/8);
  tp.push(...scaleParts(treeParts('oak',mulberry(7),0x9a9ea8).filter(q=>!(q.geo===ICO2&&q.color===0xe8453a)),s));
  const nb=Math.min(24,(lv-1)*3);for(let i=0;i<nb;i++){const a=i*2.39996,r=(0.55+R()*0.3)*s,y=(1.1+R()*0.6)*s;bloom(p,[0xf8c8d8,0xffffff,0xf2a6c8][i%3],0xf6d04a,Math.cos(a)*r,y,Math.sin(a)*r,0.07*s);}
  if(lv>=8)for(let i=0;i<Math.min(10,lv-5);i++){const a=i*1.9+0.4,r=0.7*s,y=(1.0+(i%3)*0.22)*s;gl.push(P(ICO2,0xffe27a,Math.cos(a)*r,y,Math.sin(a)*r,0,0,0,0.13,0.15,0.13));}
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
function plotTap(b){const k=plotKey(b),u=HEART_UNLOCKS.find(q=>q.k===k);
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
  el.querySelector('#huOk').onclick=()=>{el.remove();if(!S.scratch)return;const f=$('fade');f.classList.add('on');
    setTimeout(()=>{rebuildHome();const pc=TOWN.plaza;for(let i=0;i<40;i++)sparkle(pc[0]+(Math.random()-0.5)*3,topY(pc[0],pc[1])+0.5+Math.random()*2.5,pc[1]+(Math.random()-0.5)*3,[0xfff6e2,0xf8c8d8,0xffe27a][i%3]);
      f.classList.remove('on');updateHUD();},650);};}

// each morning, one neighbour moves into a plot that has opened up
function morningMoveIn(){if(!S.scratch)return;S.moved=S.moved||{};
  for(let n=0;n<6;n++){if(S.moved[n]||!unlocked('vh'+n))continue;const b=TOWN.bld.find(q=>q.t==='vh'&&q.n===n);if(!b)continue;
    S.moved[n]=S.day;rebuildHome();initNPCs();const v=planVillagers()[n];logEvent&&logEvent('movein',{name:v.name});
    setTimeout(()=>toast(`<b>${v.name}</b> the ${v.sp} has moved in! Go and say hello.`,'rare',ICON.heart||ICON.star),1200);return;}}
