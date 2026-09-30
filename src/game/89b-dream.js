/* =========================================================
   Dev: the Dream Island. A usual-sized home island as a player who has put in the hours would have it: every level,
   the whole Islandex, every island charted and restored, the best rod and can, and the land laid out by hand, lined
   up on the grid the way people do in cosy island games:
     - the villa under the northern cliff, a terracotta patio out front (picnic table, parasol, chairs) and a walled
       home garden of rare flowers with a rose arbor, a swing, a sundial and a bird bath
     - a brick plaza round the grown Island Heart, lamps at the corners and benches facing the tree
     - Main Street: the shop, café, museum and hall in a row on a cobbled road, planters between them
     - Cottage Row: six neighbours' cottages facing the sea, each with a picket-fenced garden of rare flowers
     - the orchard (peach, starfruit, dragon fruit) and a tea garden on decking by the pond
     - the farm across the river: two fenced fields, a row per crop, every one a legendary harvest (prismatic,
       crystal, golden, moonlit, giant), sprinklers down the paths, beehives, a windmill and a market stall
     - a boardwalk on the lake, a beach lounge with parasols and a bonfire, and a lookout on the cliff top
   Temporary like Acornfield: your save is backed up first and "Restore my save" in Settings brings it back.
   ========================================================= */
const DREAM={seed:4242,scale:1.4,shape:[0.05,0.03,0.02,1,2,3,3.6],coves:[[1.2,0.2,0.25],[4.4,0.18,0.2]],cliff:[0.44,0],wild:0.4,dockX:-8,
  home:[-7,-8],heart:[-7,4],fire:[12,18],
  civic:[['shop',-25,8],['cafe',-21,8],['museum',-17,8],['hall',-13,8]],
  cottages:[[-25,13,0x4f9a4a],[-21,13,0x8a6ad0],[-17,13,0x4a6ad0],[-13,13,0x3aa8a0],[-9,13,0xe0913a],[-5,13,0xd87a9a]]};
function loadDream(){
  try{if(!S.showcase)localStorage.setItem(REAL_KEY,JSON.stringify(S));}catch(e){toast('Could not back up your save, so the Dream Island was not loaded.');return;}
  const D=DREAM;S.showcase=1;S.worldSeed=D.seed;
  S.home={style:'meadow',shape:D.shape,coves:D.coves,cliff:D.cliff,wild:D.wild,scale:D.scale,dockX:D.dockX,fire:D.fire};
  S.scratch=1;S.wild=1;S.islandName='Driftseed Haven';S.homeAt={x:D.home[0],z:D.home[1]};S.house=3;
  S.heartAt={x:D.heart[0],z:D.heart[1]};S.heart={planted:1,revived:1};
  S.builds=[...D.civic.map(([t,x,z])=>({t,x,z,day:0,done:1})),...D.cottages.map(([x,z,roof],n)=>({t:'vh',n,x,z,roof,day:0,done:1}))];
  S.moved={};D.cottages.forEach((c,n)=>S.moved[n]=1);S.kits={};
  S.debris=[];S.weeds=[];S.finds=[];S.objs=[];S.tiles={};S.paths={};S.farmInit=0;S.tidy=1;S.day=Math.max(S.day||1,2);
  S.boat=null;S.sea=false;S.tut=2;S.tipTools=1;S.tipSeed=1;S.tipPaint=1;S.boatTip=1;S.rain=false;
  vil.x=vil.tx=-6.5;vil.z=vil.tz=9.5;S.dreamLay=1;S.dreamNew=1;
  save();resetting=true;location.reload();}

// everything a long-time player has: levels, shells, the whole book, the best tools
function dreamProgress(){
  S.xp=Math.max(S.xp,LV[LV.length-1]);S.shells=Math.max(S.shells,250000);S.earned=Math.max(S.earned||0,1500000);S.harvested=Math.max(S.harvested||0,5200);S.day=Math.max(S.day,140);
  S.rod=RODS.length-1;S.can=CANS.length-1;S.metMarlo=1;S.tipFish=1;
  for(const isl of islands)if(!isl.home){S.disc[isl.id]=1;S.restore[isl.id]=RESTORE_N;}
  for(const [,,pre,tab] of DEX_CATS)for(const k in tab)S.alm[pre+k]=Math.max(S.alm[pre+k]||0,1);
  for(const id of CROP_IDS){for(const v of VARIANTS)S.alm[id+'|'+v.id]=1;S.almR[id]=1;}
  for(const k of ['m:wood','m:stone','m:fiber'])S.inv[k]=(S.inv[k]||0)+60;
  // a few of each new piece in storage, to try placing
  for(const k of ['picnic','parasol','chair','lamppost','rug','brick','deck','cobble','gravel','flagstone','terracotta','mossy','marble','hextile','stonepath','picket','topiary','urn','arbor','hammock','swing','fountain','birdbath','sundial','stall','mailbox'])S.store[k]=(S.store[k]||0)+(BUILD[k].multi?6:2);}

// lay the island out on the real land (after boot has built it and grown the wild)
function layDream(){dreamProgress();const D=DREAM,R=mulberry(D.seed^0x7e1),occ=new Set();let id=S.nextId||1;
  const k2=K,T0=(x,z)=>landMap.get(K(x,z)),grass=(x,z)=>T0(x,z)==='grass'&&islMap.get(K(x,z))===0,land=(x,z)=>grass(x,z)||T0(x,z)==='sand'&&islMap.get(K(x,z))===0;
  const bld=[D.home,...D.civic.map(c=>[c[1],c[2]]),...D.cottages];const inBld=(x,z)=>bld.some(([bx,bz])=>x>=bx&&x<=bx+1&&z>=bz&&z<=bz+1);
  for(const [x,z] of bld)for(let dx=0;dx<2;dx++)for(let dz=0;dz<2;dz++)occ.add(k2(x+dx,z+dz));occ.add(k2(...D.heart));occ.add(k2(...D.fire));
  occ.add(k2(D.home[0]+2,D.home[1]+1));occ.add(k2(D.home[0]-1,D.home[1]+1));/* the crate/bin spots by the villa */
  // two layers, as in the game: floors (focc) and the pieces that stand on them (occ)
  let hi=false;const focc=new Set();const obj=(k,x,z,r=0,onSand)=>{const fl=isFloor(k),o=fl?focc:occ;if(!(onSand?land(x,z):grass(x,z))||o.has(k2(x,z))||fl&&S.tiles[k2(x,z)]||!hi&&(lvlMap.get(k2(x,z))||0)>0)return false;S.objs.push({id:id++,k,x,z,r});o.add(k2(x,z));return true;};
  const pave=(k,x0,z0,x1,z1,r=0)=>{for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)obj(k,x,z,r);};
  const swap=(k,x,z,r=0)=>{const i=S.objs.findIndex(o=>o.x===x&&o.z===z&&!isFloor(o.k));if(i>=0){S.objs.splice(i,1);occ.delete(k2(x,z));}return obj(k,x,z,r);}; // a piece standing on the paving
  const EX=['rainbow','crystal','golden','moonlit','giant'];
  const crop=(t,x,z,v)=>{if(!grass(x,z)||occ.has(k2(x,z))||focc.has(k2(x,z)))return;S.tiles[k2(x,z)]={w:1,crop:{t,p:1,v:v||EX[Math.floor(R()*EX.length)],m:0}};occ.add(k2(x,z));};
  const dirt=(x,z)=>{if(grass(x,z)&&!occ.has(k2(x,z))&&!focc.has(k2(x,z))){S.paths[k2(x,z)]=PATH_WEAR;occ.add(k2(x,z));}};
  const fenceRect=(k,x0,z0,x1,z1,gates=[])=>{const g=(x,z)=>gates.some(([a,b])=>a===x&&b===z);
    for(let x=x0;x<=x1;x++)for(const z of [z0,z1])if(!g(x,z))obj(k,x,z,0);for(let z=z0+1;z<z1;z++)for(const x of [x0,x1])if(!g(x,z))obj(k,x,z,Math.PI/2);};
  const lane=(a,b)=>{const p=landPath(a[0],a[1],b[0],b[1],{four:true,max:20000,block:(x,z)=>inBld(x,z)||occ.has(k2(x,z))&&!S.paths[k2(x,z)]&&!(x===b[0]&&z===b[1]),cost:(x,z)=>S.paths[k2(x,z)]?0.4:1});
    if(p)for(const [x,z] of p)dirt(x,z);};
  const [hx,hz]=D.home,[cx,cz]=D.heart;

  // ---- the villa: a terracotta patio across the front and the walk down to the plaza; a hammock corner to the west
  pave('terracotta',hx-4,hz+2,hx+3,hz+4);pave('brick',cx-1,hz+5,cx+1,cz-4);
  swap('parasol',hx-4,hz+2);swap('picnic',hx-3,hz+3,0);swap('urn',hx-4,hz+4);swap('topiary',hx-2,hz+2);swap('topiary',hx+2,hz+2);
  swap('urn',hx+3,hz+2);swap('chair',hx+3,hz+3,-Math.PI/2);swap('rug',hx+2,hz+4);swap('chair',hx+3,hz+4,-Math.PI/2);
  obj('mailbox',cx+2,hz+5);obj('lamppost',cx-2,hz+5);obj('swing',hx-6,hz+3,Math.PI/2);
  obj('hammock',hx-4,hz,0);obj('topiary',hx-6,hz);obj('topiary',hx-2,hz);obj('birdhouse',hx-3,hz-1);obj('flowerpot',hx-5,hz-1);obj('flowerpot',hx-1,hz-1);
  // ---- the home garden between the villa and the river: beds of every flower in its rarest forms, behind a rose arbor
  {const x0=hx+5,x1=hx+7,z0=hz-1,z1=hz+5;fenceRect('picket',x0-1,z0-1,x1+1,z1+1,[[x0+1,z1+1]]);obj('arbor',x0+1,z1+1,0);
    const fl=['tulip','lavender','moonflower','sunflower'];
    for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){if(x===x0+1){obj(z===z0+2||z===z1-1?'hextile':'gravel',x,z);if(z===z0+2)obj('sundial',x,z);if(z===z1-1)obj('birdbath',x,z);continue;}crop(fl[(z<z0+3?0:2)+(x<x0+1?0:1)],x,z,EX[(x+z+8)&3]);}}
  // ---- the plaza: brick round the Island Heart, wildflowers at its feet, benches facing it, lamps at the corners
  for(let x=cx-3;x<=cx+3;x++)for(let z=cz-3;z<=cz+5;z++){if(Math.abs(x-cx)<=1&&Math.abs(z-cz)<=1){if(x!==cx||z!==cz)obj('flowers',x,z);continue;}obj('brick',x,z);}
  for(const [dx,dz,r] of [[-3,-1,Math.PI/2],[-3,1,Math.PI/2],[3,-1,-Math.PI/2],[3,1,-Math.PI/2],[-1,3,Math.PI],[1,3,Math.PI]])swap('bench',cx+dx,cz+dz,r);
  for(const [dx,dz] of [[-3,-3],[3,-3],[-3,3],[3,3]])swap('lamppost',cx+dx,cz+dz);
  for(const [dx,dz] of [[-2,-3],[2,-3]])swap('urn',cx+dx,cz+dz);
  // ---- Main Street: a cobbled road in front of the shop, café, museum and hall; planters and lamps between them
  pave('cobble',-26,10,cx+3,11);obj('marble',-27,8);obj('marble',-27,9);
  for(const x of [-23,-19,-15]){obj('planter',x,9,0);obj('lamppost',x+1,9);obj('topiary',x,8);obj('topiary',x+1,8);}
  obj('lamppost',-11,9);obj('planter',-11,8,Math.PI/2);obj('signpost',-27,10,Math.PI/2);
  // the café's terrace at the west end of the street
  obj('parasol',-27,8);obj('chair',-27,9,Math.PI*0.5);
  // ---- Cottage Row: each cottage gets a picket-fenced front garden of rare flowers and a mailbox by its gate
  const cfl=['tulip','sunflower','lavender','moonflower','tulip','lavender'];
  D.cottages.forEach(([x,z],i)=>{obj('hedge',x-1,z-1);obj('hedge',x+2,z-1);if(i%2===0)obj('lamppost',x+3,z-1);else obj('topiary',x+3,z-1);
    for(let gz=z+2;gz<=z+3;gz++){obj('stonepath',x,gz);crop(cfl[i],x-1,gz,EX[(i+gz)%4]);crop(cfl[i],x+1,gz,EX[(i+gz+1)%4]);crop(cfl[(i+2)%6],x+2,gz,EX[(i+gz+2)%4]);}
    obj('picket',x-1,z+4);obj('stonepath',x,z+4);obj('mailbox',x+1,z+4);obj('picket',x+2,z+4);
    obj(i%2?'birdbath':'flowerpot',x+2,z+1);obj('flowerpot',x-1,z+1);});
  // ---- the orchard (fenced, in rows) and the tea garden on decking by the pond
  {fenceRect('fence',-27,-9,-15,-1,[[-21,-1]]);const tr=['peach','starfruit','peach','dragonfruit'];
    for(let z=-8;z<=-2;z+=2)for(let x=-26;x<=-16;x+=2)crop(tr[((z+8)/2)|0],x,z,EX[(x/2+z/2+40)%5|0]);
    for(let z=-8;z<=-2;z++)obj('mossy',-21,z);obj('beehive',-26,-7+6);obj('scarecrow',-16,-2);}
  pave('deck',-24,2,-17,6);
  for(const [x,z] of [[-23,3],[-19,3]]){swap('picnic',x,z,0);swap('parasol',x-1,z);}
  swap('stall',-18,5,0);swap('rug',-22,5);swap('rug',-21,5);swap('chair',-24,6,0);swap('chair',-23,6,0);swap('lamppost',-17,2);swap('lamppost',-24,2);
  for(const x of [-16,-15])for(const z of [2,6])obj('cattail',x,z);obj('cattail',-10,3);obj('cattail',-10,5);
  // ---- the farm across the river: two fenced fields, a row per crop (each its own legendary form), paths between
  const X0=10,X1=22,Z0=-3,Z1=13,MID=16;
  {const veg=['turnip','radish','carrot','lettuce','onion','potato','cabbage','strawberry','wheat','peas','pepper','tomato','corn','eggplant','blueberry','pumpkin','watermelon','grape',
      'sunflower','tulip','lavender','moonflower','strawberry','wheat','pumpkin','corn','watermelon','blueberry'];
    fenceRect('fence',X0-1,Z0-1,X1+1,Z1+1,[[X0-1,4],[MID,Z1+1],[MID,Z0-1]]);obj('gravel',X0-1,4);obj('gravel',MID,Z1+1);obj('gravel',MID,Z0-1);let row=0;
    for(let z=Z0;z<=Z1;z++){const path=(z-Z0)%4===3;
      for(let x=X0;x<=X1;x++){if(x===MID){obj('gravel',x,z);continue;}if(!path)continue;
        if(x===X0&&z===8||x===X1&&z===0)obj('scarecrow',x,z);else if((x-X0)%3===1)obj('sprinkler',x,z);else dirt(x,z);}
      if(path)continue;for(const [a,b] of [[X0,MID-1],[MID+1,X1]]){const t=veg[row%veg.length],v=EX[row%EX.length];row++;for(let x=a;x<=b;x++)crop(t,x,z,v);}}
    for(let z=Z0;z<=Z1;z+=3)obj('beehive',X1+3,z);
    obj('stall',MID-2,Z1+2,0);obj('stall',MID+2,Z1+2,0);obj('lamppost',MID-1,Z1+2);obj('lamppost',MID+1,Z1+2);obj('haybale',MID+4,Z1+2);obj('haybale',MID-4,Z1+2);
    if(obj('windmill',20,-8,Math.PI*0.2)){occ.add(k2(21,-8));occ.add(k2(20,-7));}for(const [x,z] of [[22,-7],[18,-7],[23,-9],[22,-10]])obj('haybale',x,z);
    // the lake boardwalk: decking along the shore with chairs looking out over the water
    pave('deck',11,-6,15,-5,Math.PI/2);swap('chair',12,-6,Math.PI);swap('chair',14,-6,Math.PI);swap('parasol',13,-5);obj('lamppost',10,-6);obj('lamppost',16,-6);dirt(16,-5);}
  // ---- the beach: a lounge of parasols, chairs and rugs round the bonfire, palms along the top of the sand
  {const [fx,fz]=D.fire;for(const [dx,dz,r] of [[-2,0,Math.PI/2],[2,0,-Math.PI/2],[0,-2,0]])obj('bench',fx+dx,fz+dz,r,true);
    for(const [x,z] of [[fx-6,fz],[fx+6,fz]]){obj('parasol',x,z,0,true);obj('chair',x-1,z+1,0,true);obj('chair',x+1,z+1,0,true);obj('rug',x,z+1,0,true);}
    for(let x=-24;x<=22;x+=5){for(let z=15;z<=22;z++)if(T0(x,z)==='sand'&&!occ.has(k2(x,z))&&T0(x,z-1)!=='sand'){obj('palm',x,z,R()*6,true);break;}}}
  // ---- the lookout on the cliff top, over the river's source
  {hi=true;let lx=-6,lz=-14;pave('deck',lx-1,lz,lx+1,lz+1);swap('chair',lx-1,lz+1,0);swap('chair',lx+1,lz+1,0);swap('parasol',lx,lz);obj('lamppost',lx+2,lz);obj('signpost',lx-2,lz+1,0);hi=false;}
  // ---- lanes: the street to the river bridges and the farm gates, the dock up through Cottage Row, round the pond
  lane([cx+4,11],[X0-2,4]);lane([cx+4,11],[MID,Z1+2]);lane([hx+6,hz+7],[cx+4,cz-2]);lane([-9,18],[DOCK.x,DOCK.z-1]);lane([MID,Z0-2],[MID,-5]);
  S.nextId=id;
  // ---- clear the wild off everything that's been made, and off the lowland meadows round the town and farm
  const kept=(x,z)=>(lvlMap.get(k2(x,z))||0)>0||x>=24||z>=15&&x>=-2||x<=-27;
  const near=(x,z)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(occ.has(k2(x+a,z+b))||focc.has(k2(x+a,z+b))||inBld(x+a,z+b))return true;return false;};
  S.debris=S.debris.filter(d=>!near(d.x,d.z)&&(kept(d.x,d.z)||d.k==='tree'&&R()<0.5&&d.x>-3&&d.x<9));
  S.weeds=[];S.finds=S.finds.filter(f=>!near(f.x,f.z));
  rebuildHome();}
if(S.dreamNew){delete S.dreamNew;setTimeout(()=>toast('Welcome to <b>Driftseed Haven</b>, a dream island: every level, every page, and the whole island laid out by hand. Your own save is safe: open Settings and tap <b>Restore my save</b> to go back.','rare',ICON.star),1800);}
