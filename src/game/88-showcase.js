/* =========================================================
   Dev: the showcase farm. One tap turns this save into a late-game, hand-planned farm (what a player who has
   put in the hours could build): the field grown to full size and fenced, a stone avenue and cross path, sprinkler-fed
   vegetable plots, an orchard round a windmill, striped flower beds with beehives, and lanterns and planters along
   the paths. It also maxes progress (Villa, tools, level, every island found and restored, a full museum).
   The real save is copied to SAVE_KEY+'-real' first, and "Restore my save" puts it back.
   ========================================================= */
const REAL_KEY=SAVE_KEY+'-real';
const hasRealSave=()=>{try{return !!localStorage.getItem(REAL_KEY);}catch(e){return false;}};
function restoreRealSave(){let s=null;try{s=localStorage.getItem(REAL_KEY);}catch(e){}if(!s)return;
  resetting=true;try{localStorage.setItem(SAVE_KEY,s);localStorage.removeItem(REAL_KEY);}catch(e){}location.reload();}

function loadShowcase(){
  try{if(!S.showcase)localStorage.setItem(REAL_KEY,JSON.stringify(S));}catch(e){toast('Could not back up your save, so the showcase was not loaded.');return;}
  S.showcase=1;
  // late-game progress
  S.land=LAND_UP.length;S.house=HOUSE_UP.length;S.rod=RODS.length-1;S.can=CANS.length-1;
  S.xp=Math.max(S.xp,LV[LV.length-1]);S.shells=Math.max(S.shells,250000);S.earned=Math.max(S.earned,1200000);S.harvested=Math.max(S.harvested||0,4800);S.day=Math.max(S.day,120);
  S.boat=null;S.tut=2;S.tipTools=1;S.tipSeed=1;S.tipPaint=1;S.boatTip=1;S.farmInit=1;S.farmClear=1;S.hour=9.5;S.rain=false;S.sea=false;
  for(const isl of islands)if(!isl.home){S.disc[isl.id]=1;S.restore[isl.id]=RESTORE_N;}
  S.moved={};for(let n=0;n<6;n++)S.moved[n]=1;
  for(const [cat,,pre,tab] of DEX_CATS)for(const k in tab)S.alm[pre+k]=1;
  for(const id of CROP_IDS){for(const v of VARIANTS)S.alm[id+'|'+v.id]=1;S.almR[id]=1;}
  buildIsland(islands[0]); // the field grows with S.land
  layShowcaseFarm();
  const g=showcaseGate;vil.x=vil.tx=g[0]-1.5;vil.z=vil.tz=g[1]+0.5;
  S.showcaseNew=1;save();resetting=true;location.reload();}

let showcaseGate=[FARM.x,FARM.z];
function layShowcaseFarm(){
  const home=islands[0],F=new Set(),occ=new Set();let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const [x,z] of home.grass)if(farmQ(x,z)<1){F.add(K(x,z));x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}
  const inField=(x,z)=>farmQ(x,z)<1.3&&islMap.get(K(x,z))===0&&x<FARM.x+12;
  S.debris=[];S.weeds=[];S.finds=(S.finds||[]).filter(f=>!inField(Math.round(f.x),Math.round(f.z)));
  S.objs=S.objs.filter(o=>!inField(o.x,o.z));for(const k of Object.keys(S.tiles)){const [x,z]=k.split(',').map(Number);if(inField(x,z))delete S.tiles[k];}
  const has=(x,z)=>F.has(K(x,z)),ring=(x,z)=>has(x,z)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>!has(x+a,z+b));
  const free=(x,z)=>has(x,z)&&!occ.has(K(x,z)),inner=(x,z)=>free(x,z)&&!ring(x,z);
  const obj=(k,x,z,r=0)=>{if(!free(x,z))return false;occ.add(K(x,z));S.objs.push({id:S.nextId++,k,x,z,r});return true;};
  const R=mulberry((S.worldSeed|0)^0x5c0a);
  const crop=(t,x,z,ripe=0.85)=>{if(!inner(x,z))return false;occ.add(K(x,z));const r=R(),on=r<ripe;
    const v=!on?null:r<0.035?'golden':r<0.05?'crystal':r<0.055?'rainbow':r<0.14?'giant':'normal';
    S.tiles[K(x,z)]={w:1,crop:{t,p:on?1:0.55+R()*0.35,v,m:0}};return true;};
  const GZ=[FARM.z-1,FARM.z],PX=Math.round((x0+x1)/2)-1;showcaseGate=[x1,FARM.z];
  // fence ring with an open gate where the bridge comes in; posts either side of the gate get flower pots
  for(const k of F){const [x,z]=k.split(',').map(Number);if(!ring(x,z))continue;
    if(GZ.includes(z)&&x>PX){obj('stonepath',x,z);continue;}
    if(x===x1&&(z===GZ[0]-1||z===GZ[1]+1)){obj('flowerpot',x,z);continue;}
    obj('fence',x,z,has(x,z-1)&&has(x,z+1)?Math.PI/2:0);}
  // a two-wide stone avenue from the gate, and a cross path through the middle
  for(let x=x0;x<=x1;x++)for(const z of GZ)obj('stonepath',x,z);
  for(let z=z0;z<=z1;z++)if(!GZ.includes(z))obj('stonepath',PX,z);
  // the avenue's edges: tulip planters and lanterns on the vegetable side, hedges on the orchard side, pots on the garden side
  for(let x=x0+1;x<x1;x++){if(x===PX)continue;const n=GZ[0]-1,s=GZ[1]+1,lamp=(x-PX)%4===2||(x-PX)%4===-2;
    if(lamp){obj('lantern',x,n);obj('lantern',x,s);continue;}
    if(x>PX){obj('planter',x,n);if(x===PX+1)obj('well',x,s);else if(x===x1-2)obj('signpost',x,s,-Math.PI/2);else obj('planter',x,s);}
    else{obj('hedge',x,n);if(x===PX-1)obj('bench',x,s,Math.PI);else if(x===PX-3)obj('birdhouse',x,s);else if(x===PX-5)obj('gnome',x,s);else obj('flowerpot',x,s);}}
  // east: packed 3×3 vegetable plots, each round a sprinkler (a few round a scarecrow, beehive or lucky clover); leftover edges
  // get a border of sunflowers along the fence and wheat elsewhere
  const plots=(dir,list,centres)=>{let b=0;
    for(let cz=(dir<0?GZ[0]:GZ[1])+dir*3;cz>z0&&cz<z1;cz+=dir*3)for(let cx=PX+2;cx<x1;cx+=3){if(!inner(cx,cz))continue;
      const t=list[b%list.length],c=centres[b%centres.length];b++;obj(c,cx,cz);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)if(dx||dz)crop(t,cx+dx,cz+dz);}};
  plots(-1,['tomato','corn','cabbage','pepper','carrot','eggplant','potato','onion'],['sprinkler','sprinkler','scarecrow','sprinkler','sprinkler','beehive']);
  plots(1,['pumpkin','strawberry','blueberry','watermelon','lettuce','wheat','radish','turnip'],['sprinkler','clover','sprinkler','sprinkler','scarecrow','sprinkler']);
  for(const k of F){const [x,z]=k.split(',').map(Number);if(x<=PX||!inner(x,z)||z===GZ[0]-1||z===GZ[1]+1)continue;
    crop([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>ring(x+a,z+b))?'sunflower':'wheat',x,z,0.95);}
  // north-west: a windmill in the far corner with hay bales, then an orchard of fruit trees on a two-tile grid, and a trellis row by the avenue
  {let wm=null;for(let s=2;s<8&&!wm;s++)for(let dx=0;dx<=s&&!wm;dx++){const x=x0+1+dx,z=z0+1+(s-dx);if(inner(x,z)&&inner(x+1,z)&&inner(x,z+1)&&inner(x+1,z+1))wm=[x,z];}
    if(wm){obj('windmill',wm[0],wm[1],Math.PI*0.25);occ.add(K(wm[0]+1,wm[1]));occ.add(K(wm[0],wm[1]+1));obj('haybale',wm[0]+1,wm[1]+1);obj('haybale',wm[0]+2,wm[1]);}}
  const trellisZ=GZ[0]-2;for(let x=x0+1;x<PX;x++)crop((x-PX)%2?'grape':'peas',x,trellisZ,0.95);
  for(let z=trellisZ-2;z>z0;z-=2)for(let x=PX-2;x>x0;x-=2){const t=((PX-x)/2+(trellisZ-z)/2)%3;crop(t===0?'peach':t===1?'starfruit':'peach',x,z,0.95);}
  for(let z=trellisZ-3;z>z0;z-=4){const x=PX-3;if(inner(x,z))obj('beehive',x,z);}
  // south-west: striped flower beds (two rows each, a grass row between), beehives along the path end
  const beds=['tulip','lavender','sunflower','moonflower','tulip','lavender'];let row=0;
  for(let z=GZ[1]+2;z<z1;z++,row++){const band=Math.floor(row/3),gap=row%3===2;if(gap)continue;
    for(let x=x0+1;x<PX;x++){if(x===PX-1&&row%3===0){obj('beehive',x,z);continue;}crop(beds[band%beds.length],x,z,0.95);}}
  // wildflowers along the inside of the fence
  for(const k of F){const [x,z]=k.split(',').map(Number);if(inner(x,z)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>ring(x+a,z+b))&&hash(x*2.3,z*1.7)<0.45)obj('flowers',x,z);}
}
// shown once after the reload
if(S.showcaseNew){delete S.showcaseNew;setTimeout(()=>toast('Showcase farm loaded. Your own save is kept safe: open the Island menu and tap <b>Restore my save</b> to go back.','rare',ICON.sprout),1600);}
