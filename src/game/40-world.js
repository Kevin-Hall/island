/* =========================================================
   World: home island + generated islands
   ========================================================= */
const TOP={grass:0.5,sand:0.3,bridge:0.32};
// the farm field: a flat island just west of home, joined by a wooden bridge
const FARM={x:-40,z:1};
const TOWN_W=22,TOWN_D=17;
// your island's coastline: the classic shape, carved by the bays and coves picked on the island-choice screen (S.home.shape);
// the wobble only ever pulls the coast inward, so a chosen island never grows into the farm or its neighbours
function townQ(x,z){const sc=S.home&&S.home.scale||1,dx=Math.abs(x)/(TOWN_W*sc),dz=Math.abs(z-0.5)/(TOWN_D*sc),sh=S.home&&S.home.shape,e=sh&&sh[6]||5;let q=Math.pow(dx**e+dz**e,1/e)*(1+(hash(x*0.7,z*1.1)-0.5)*0.035);
  if(sh){const a=Math.atan2((z-0.5)/TOWN_D,x/TOWN_W);let w=sh[0]*(0.5+0.5*Math.sin(2*a+sh[3]))+sh[1]*(0.5+0.5*Math.sin(3*a+sh[4]))+sh[2]*(0.5+0.5*Math.sin(5*a+sh[5]));
    for(const [ca,cd,cw] of S.home.coves||[]){const d=Math.atan2(Math.sin(a-ca),Math.cos(a-ca))/cw;w+=cd*Math.exp(-d*d);}q/=1-Math.min(0.45,w);}
  return q;}
/* ---- home island styles, chosen with the island: ground palette, town trees and wild flowers ---- */
const HOME_STYLES={
  meadow: {name:'Meadow',  grass:[0x6aa843,0x74b24a,0x629e3e],sand:[0xf0dcaa,0xe8d29e],trees:['oak','oak','oak','pine','maple','bush','flowerbed','bush'],blurb:'Round oaks, wildflowers and soft green hills.'},
  tropic: {name:'Tropical',grass:[0x58b85a,0x64c464,0x4cac52],sand:[0xe6c890,0xdcbc84],trees:['palm','palmtall','oak','palmfan','bush','bush','flowerbed','bush'],blurb:'Palms, bright sand and warm turquoise shallows.'},
  autumn: {name:'Autumn',  grass:[0x8ea440,0x9aae46,0x84983c],sand:[0xd2aa74,0xc8a06c],trees:['maple','mapleR','maple','oak','pine','bush','flowerbed','bush'],blurb:'Golden grass and maples in red and amber.'},
  blossom:{name:'Blossom', grass:[0x7ab852,0x86c25a,0x70ae4c],sand:[0xe0bc8c,0xd6b284],trees:['cherry','cherry','oak','cherry','pine','bush','flowerbed','bush'],blurb:'Cherry trees in bloom and petals on the breeze.'}};
function applyHomeStyle(){const st=HOME_STYLES[(S.home&&S.home.style)||'meadow']||HOME_STYLES.meadow;BIOMES.home.grass=S.wild?isleTint(grassCols()):st.grass;BIOMES.home.sand=st.sand;return st;}
/* ---- real seasons (a wild island follows the calendar: northern-hemisphere months, or S.seasonOv from the dev tools) ---- */
function season(){if(S.seasonOv)return S.seasonOv;const m=new Date(typeof gameNow==='function'?gameNow():Date.now()).getMonth();return m===11||m<2?'winter':m<5?'spring':m<9?'summer':'autumn';} // leaves turn in October and November, as they do in the woods
// grass palettes you can choose instead of the usual lush green (Lookbook bar; S.grassPal): each is its summer
// colours; spring lifts them a little and autumn warms them towards gold. Winter's snow is the same for all
const GRASS_PALS={
  meadow:{name:'Meadow',c:[0x7ccc54,0x88d45e,0x70c04a]},emerald:{name:'Emerald',c:[0x3e9a4e,0x48a456,0x369046]},
  sage:{name:'Sage',c:[0x88a870,0x92b078,0x7e9e66]},golden:{name:'Sunlit',c:[0x9ab84c,0xa6c056,0x90ae44]},
  mint:{name:'Mint',c:[0x78c89c,0x84d0a4,0x6cbc90]},moss:{name:'Moss',c:[0x5a8a3e,0x649446,0x528036]},
  teal:{name:'Sea Grass',c:[0x5aa880,0x64b088,0x509c74]}};
function grassCols(){const s=season(),G=GRASS_PALS[S.grassPal];if(!G||s==='winter')return SEASON_GRASS[s];
  return G.c.map(c=>s==='spring'?lerpHex(c,0xc8f0a0,0.12):s==='autumn'?lerpHex(c,0xb8a848,0.1):c);}
const SEASON_GRASS={spring:[0x6cbc4e,0x78c458,0x62b046],summer:[0x5c9640,0x66a048,0x528c38],autumn:[0x62a044,0x6caa4c,0x5a963e],winter:[0xd2ddd6,0xdfe7e2,0xc6d3cb]};
let seasonNow=null;
// when the season turns (checked each morning), the island's trees and grass change with it
function seasonCheck(force){const s=season();if(s===seasonNow&&!force)return;const first=seasonNow===null;seasonNow=s;if(!S.wild||first&&!force)return;
  applyHomeStyle();rebuildHome();if(!force)setTimeout(()=>toast({spring:'Spring has come to the island: blossom on the branches.',summer:'Summer: the woods are deep green.',autumn:'Autumn is here. The leaves are turning.',winter:'Winter: snow on the pines and bare branches.'}[s],'rare',ICON.sprout),1500);}
// each island expansion (S.land) also grows the field, west and north/south, away from the bridge. How far it can grow
// depends on the world: the widest/tallest pair of factors (each up to 1.9×) whose shallows stay 2+ tiles clear of every
// other island, picked for the most area
let farmMaxG=null;
function farmFits(gx,gz,pts){const cx=FARM.x-7.6*(gx-1);
  for(const [x,z] of pts){const dx=Math.abs(x-cx)/(7.6*gx),dz=Math.abs(z-FARM.z)/(6.6*gz);if(Math.pow(dx**4+dz**4,0.25)<1.45)return false;}return true;}
function farmGrowMax(){if(farmMaxG)return farmMaxG;if(islands.length<2)return{x:1,z:1};
  // every tile (shallows included) of the other islands anywhere near the field
  const pts=[];for(const o of islands){if(o.home||Math.hypot(o.cx-FARM.x,o.cz-FARM.z)>80)continue;const sp=Math.ceil(islR(o)/0.62+3);
    for(let x=o.cx-sp;x<=o.cx+sp;x++)for(let z=o.cz-sp;z<=o.cz+sp;z++)if(Math.abs(x-FARM.x)<45&&Math.abs(z-FARM.z)<40&&tileTypeI(o,x,z))pts.push([x,z]);}
  let best={x:1,z:1},ba=1;
  for(let i=18;i>=0;i--)for(let j=18;j>=0;j--){const gx=1+i*0.05,gz=1+j*0.05,a=gx*gz-Math.abs(gx-gz)*0.05;if(a>ba&&farmFits(gx,gz,pts)){ba=a;best={x:gx,z:gz};}}
  return farmMaxG=best;}
const farmGrow=()=>{const m=farmGrowMax(),t=Math.min(S.land||0,6)/6;return{x:1+(m.x-1)*t,z:1+(m.z-1)*t};};
const farmCX=()=>FARM.x-7.6*(farmGrow().x-1);
const farmWest=()=>Math.floor(farmCX()-7.6*farmGrow().x*1.3)-1; // the westmost column the field (with its shallows) can reach
function farmQ(x,z){if(S.wild)return 99; // a wild island is one island: you farm wherever you clear
  const g=farmGrow(),dx=Math.abs(x-farmCX())/(7.6*g.x),dz=Math.abs(z-FARM.z)/(6.6*g.z);return Math.pow(dx**4+dz**4,0.25)*(1+(hash(x*1.3,z*2.1)-0.5)*0.06);}
const landMap=new Map(),islMap=new Map();let landList=[];
let islands=[];
const isLandT=t=>t==='grass'||t==='sand'||t==='bridge';
function isLand(x,z){return isLandT(landMap.get(K(x,z)));}
const lvlMap=new Map(),LVH=0.62;
// beaches slope into the sea: each sand tile stores its four corner heights ([-x-z, +x-z, +x+z, -x+z]), set in buildIsland
const SAND_CH=new Map();
function topY(x,z){const k=K(x,z),t=landMap.get(k);if(t==='sand'){const c=SAND_CH.get(k);if(c)return(c[0]+c[1]+c[2]+c[3])/4;}return t==='grass'?TOP.grass+(lvlMap.get(k)||0)*LVH:t==='bridge'&&bridgeY.has(k)?bridgeY.get(k):t==='river'?riverSurf.get(k):TOP[t]||0;}
// ground height at any point (not just tile centres): follows the beach slope
function surfY(x,z){const tx=Math.round(x),tz=Math.round(z),c=landMap.get(K(tx,tz))==='sand'&&SAND_CH.get(K(tx,tz));if(!c)return topY(tx,tz);const u=clamp(x-tx+0.5,0,1),v=clamp(z-tz+0.5,0,1);return lerp(lerp(c[0],c[1],u),lerp(c[3],c[2],u),v);}
// rivers: water surface height per tile (bridges over a river keep theirs), and bridge deck heights
const riverSurf=new Map(),bridgeY=new Map();let riverList=[];
const waterY=(x,z)=>riverSurf.get(K(Math.round(x),Math.round(z)))||0;
function homeD(x,z){const a=Math.atan2(z,x);const f=1+0.10*Math.sin(3*a+0.7)+0.07*Math.sin(5*a+2.1)+0.05*Math.sin(7*a+4.0);return Math.hypot(x*0.82,z)/f;}
const homeScale=()=>S.home&&S.home.scale||1; // a preset island can be bigger than the usual home island
function islR(isl){return isl.home?TOWN_W*homeScale():isl.r;}
function islDist(isl,x,z){if(isl.home)return townQ(x,z)*TOWN_W;const dx=x-isl.cx,dz=z-isl.cz,a=Math.atan2(dz,dx);
  const wb=isl.wob||1,f=Math.max(0.35,1+(0.12*Math.sin(3*a+isl.p1)+0.08*Math.sin(5*a+isl.p2)+0.06*Math.sin(2*a+isl.p3))*wb+(wb>1?0.05*(wb-1)*Math.sin(9*a+isl.p1*2):0));/* frontier isles (44b) get wilder coasts */return Math.hypot(dx*isl.sx,dz)/f;}
const TRANK={grass:4,sand:3,s1:2,s2:1};
function tileTypeI(isl,x,z){const R=islR(isl),d=islDist(isl,x,z),b=BIOMES[isl.biome].beach||1.25;
  let t=d<R-b?'grass':d<R?'sand':d<R+1.0?'s1':d<R+2.1?'s2':null;
  if(isl.hole){const e=R*isl.hole-d;/* an atoll: a lagoon of open water in the middle, ringed with beach */if(e>2.1)t=null;else if(e>1)t='s2';else if(e>0)t='s1';else if(e>-b)t='sand';}
  if(isl.home){const q=townQ(x,z),bw=(0.06+0.07*clamp(z/(TOWN_D*homeScale()),0,1))/Math.sqrt(homeScale());/* a narrow ribbon of beach, widest on the south shore */t=q<1-bw?'grass':q<1?'sand':q<1.07?'s1':q<1.15?'s2':null;}
  if(isl.home){const q=farmQ(x,z),f=q<0.83?'grass':q<1?'sand':q<1.13?'s1':q<1.28?'s2':null;if(f&&(!t||TRANK[f]>TRANK[t]))t=f;}
  return t;}
function genIslands(){farmMaxG=null;
  const R=mulberry(S.worldSeed);
  islands=[{id:0,cx:0,cz:0,biome:'home',name:'Home',home:true,seed:S.worldSeed|0,riverN:S.home&&S.home.preset?0:S.home&&S.home.riv!=null?S.home.riv:1,rw:2}];
  const bl=shuffle(BIOME_IDS.slice(),R);const used=new Set();
  for(let i=0;i<13;i++){
    const biome=i<bl.length?bl[i]:bl[Math.floor(R()*bl.length)],B=BIOMES[biome];
    const r=5.2+R()*3.6;let cx=0,cz=0,ok=false;
    for(let t=0;t<90&&!ok;t++){const a=R()*6.283,d=36+(homeScale()-1)*30+i*6+R()*10+t*0.6;cx=Math.round(Math.cos(a)*d);cz=Math.round(Math.sin(a)*d);
      ok=islands.every(o=>Math.hypot(o.cx-cx,o.cz-cz)>(o.home?40*homeScale():o.r0/0.7)+r/0.7+9)&&Math.hypot(FARM.x-cx,FARM.z-cz)>13+r*1.2/0.7+7;}
    if(!ok)continue;
    let name='';for(let t=0;t<30;t++){name=B.names[0][Math.floor(R()*B.names[0].length)]+' '+B.names[1][Math.floor(R()*B.names[1].length)];if(!used.has(name))break;}used.add(name);
    islands.push({id:islands.length,cx,cz,r:r*1.2,r0:r,riverN:r*1.2>=9.4&&biome!=='volcano'?1:0,rw:1,biome,name,sx:0.78+R()*0.4,p1:R()*6.28,p2:R()*6.28,p3:R()*6.28,seed:Math.floor(R()*1e9)});
  }
  // grand isles: big, hilly islands out past the others (separate RNG so older worlds keep their layout)
  const G=mulberry(S.worldSeed^0x5eed51);
  const gb=shuffle(BIOME_IDS.slice(),G);
  for(let i=0;i<5;i++){
    const biome=gb[i],B=BIOMES[biome],r=15+G()*4;let cx=0,cz=0,ok=false;
    for(let t=0;t<120&&!ok;t++){const a=G()*6.283,d=92+(homeScale()-1)*30+i*14+G()*16+t*0.7;cx=Math.round(Math.cos(a)*d);cz=Math.round(Math.sin(a)*d);
      ok=islands.every(o=>Math.hypot(o.cx-cx,o.cz-cz)>(o.home?40*homeScale():o.r/0.7)+r/0.7+10);}
    if(!ok)continue;
    let name='';for(let t=0;t<30;t++){name='Great '+B.names[0][Math.floor(G()*B.names[0].length)]+' '+B.names[1][Math.floor(G()*B.names[1].length)];if(!used.has(name))break;}used.add(name);
    islands.push({id:islands.length,cx,cz,r,biome,name,grand:true,riverN:biome==='volcano'?1:1+(G()<0.5?1:0),rw:2,sx:0.8+G()*0.35,p1:G()*6.28,p2:G()*6.28,p3:G()*6.28,seed:Math.floor(G()*1e9)});
  }
}
function rebuildLandList(){depthDirty=true;landList=[];riverList=[];for(const [k,t] of landMap){if(t==='river'){const [x,z]=k.split(',').map(Number);riverList.push([x,z,riverSurf.get(k)]);continue;}if(!isLandT(t))continue;const [x,z]=k.split(',').map(Number);landList.push([x,z,t,islMap.get(k),topY(x,z)]);}}

