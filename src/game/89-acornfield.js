/* =========================================================
   Dev: Acornfield, a hand-laid island (from the concept art), grown into a whole storybook island about ten times the
   size of a usual home island. One tap in Settings swaps this save for it. It's laid out in districts:
     - the village square: a stone-paved plaza round the grown Island Heart, benches and lamps, with the town hall,
       general store, harbour café and museum looking onto it
     - your house just south of the square, with a fenced front garden
     - Cottage Lane to the west: six neighbours' cottages (coloured roofs) along a winding lane, each with a garden
     - the farm to the east: three fenced fields of crops, an orchard, a windmill, hay bales, scarecrows and beehives
     - the flower gardens between the square and the sea: striped beds either side of a stone walk
     - the harbour on the south-west beach (the pier and your boat) and a campsite on the east beach
     - the north woods on a raised plateau, with a lookout bench at the trailhead
   Your real save is copied first (as for the showcase farm); "Restore my save" brings it back.
   The island's shape comes from S.home (preset, scale, dockX, fire, tent); the buildings are placed before the reload,
   and everything else is laid once after it (layAcornfield), when the land exists to lay paths on.
   ========================================================= */
const ACORN={seed:24117,scale:2.6,home:[-8,6],heart:[0,0],fire:[31,27],tent:[34,23],dockX:-30,
  civic:[['hall',-1,-10],['shop',-10,-6],['cafe',8,-6],['museum',16,-3]],
  // Cottage Lane: [x, z, roof colour] (2x2 footprints, doors on the +z side)
  cottages:[[-22,-9,0x4f9a4a],[-31,-4,0x8a6ad0],[-24,3,0x4a6ad0],[-37,6,0x3aa8a0],[-29,13,0xe0913a],[-19,13,0xd87a9a]]};
function loadAcornfield(){
  try{if(!S.showcase)localStorage.setItem(REAL_KEY,JSON.stringify(S));}catch(e){toast('Could not back up your save, so Acornfield was not loaded.');return;}
  S.showcase=1;S.worldSeed=ACORN.seed;
  S.home={style:'meadow',shape:[0.012,0.008,0.004,0,1,2,7],coves:[[2.4,0.1,0.25]],cliff:[0.62,1],wild:0.5,preset:'acorn',scale:ACORN.scale,dockX:ACORN.dockX,fire:ACORN.fire,tent:ACORN.tent};
  S.scratch=1;S.wild=1;S.islandName='Acornfield';S.homeAt={x:ACORN.home[0],z:ACORN.home[1]};S.house=3;
  S.heartAt={x:ACORN.heart[0],z:ACORN.heart[1]};S.heart={planted:1,revived:1};S.xp=Math.max(S.xp||0,LV[10]+100);
  S.builds=[...ACORN.civic.map(([t,x,z])=>({t,x,z,day:0,done:1})),...ACORN.cottages.map(([x,z,roof],n)=>({t:'vh',n,x,z,roof,day:0,done:1}))];
  S.moved={};ACORN.cottages.forEach((c,n)=>S.moved[n]=1);S.kits={};
  S.debris=[];S.weeds=[];S.finds=[];S.objs=[];S.tiles={};S.paths={};S.farmInit=1;S.tidy=1;S.day=Math.max(S.day,2);S.shells=Math.max(S.shells,2315);
  S.boat=null;S.sea=false;S.tut=2;S.tipTools=1;S.tipSeed=1;S.tipPaint=1;S.boatTip=1;S.rain=false;
  vil.x=vil.tx=1.5;vil.z=vil.tz=5.5;S.acornLay=1;S.acornNew=1;
  save();resetting=true;location.reload();}

// lay the island out on the real land
function layAcornfield(){const occ=new Set(),K2=(x,z)=>K(x,z),grass=(x,z)=>landMap.get(K(x,z))==='grass'&&islMap.get(K(x,z))===0,flat=(x,z)=>grass(x,z)&&!(lvlMap.get(K(x,z))||0);
  const R=mulberry(ACORN.seed^0x51);let id=S.nextId||1;
  const mark=(x,z,r=0)=>{for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)occ.add(K2(x+dx,z+dz));};
  const foot=(x,z,w=2,d=2)=>{for(let dx=0;dx<w;dx++)for(let dz=0;dz<d;dz++)mark(x+dx,z+dz);};
  const bld=[ACORN.home,...ACORN.civic.map(c=>[c[1],c[2]]),...ACORN.cottages,ACORN.tent];for(const [x,z] of bld)foot(x,z);mark(...ACORN.fire,1);
  const blocked=(x,z)=>bld.some(([bx,bz])=>x>=bx&&x<=bx+1&&z>=bz&&z<=bz+1);
  const obj=(k,x,z,r=0)=>{if(!grass(x,z)||occ.has(K2(x,z)))return false;S.objs.push({id:id++,k,x,z,r});occ.add(K2(x,z));return true;};
  const crop=(t,x,z)=>{if(!flat(x,z)||occ.has(K2(x,z)))return;S.tiles[K2(x,z)]={w:1,crop:{t,p:1,v:R()<0.06?'giant':'normal',m:0}};occ.add(K2(x,z));};
  const fenceRect=(x0,z0,x1,z1,gate)=>{for(let x=x0;x<=x1;x++){if(!(gate&&gate[1]===z0&&Math.abs(x-gate[0])<1))obj('fence',x,z0);if(!(gate&&gate[1]===z1&&Math.abs(x-gate[0])<1))obj('fence',x,z1);}
    for(let z=z0+1;z<z1;z++){obj('fence',x0,z,Math.PI/2);obj('fence',x1,z,Math.PI/2);}};
  // ---- paths: a network of dirt lanes between the districts (laid before anything else claims the ground)
  const pathOn=[];const onPath=new Set();
  const lay=(a,b)=>{const p=landPath(a[0],a[1],b[0],b[1],{four:true,max:40000,block:blocked,cost:(x,z)=>(onPath.has(K2(x,z))?0.35:1)+(lvlMap.get(K2(x,z))?2:0)});if(!p)return;
    for(const [x,z] of p){if(!grass(x,z))continue;const k=K2(x,z);if(!onPath.has(k)){onPath.add(k);pathOn.push([x,z]);}S.paths[k]=PATH_WEAR;occ.add(k);}};
  const door=([x,z])=>[x,z+2],sq=ACORN.heart;
  const S4=[[sq[0],sq[1]+5],[sq[0]-5,sq[1]],[sq[0]+5,sq[1]],[sq[0],sq[1]-5]]; // the square's four gates
  lay(S4[0],door(ACORN.home));lay(S4[0],[DOCK.x,DOCK.z-1]);                                   // south: home and the harbour
  for(const c of ACORN.civic)lay(door([c[1],c[2]]),c[1]<sq[0]-3?S4[1]:c[1]>sq[0]+3?S4[2]:S4[3]); // civic doors to the square
  lay(S4[1],[-26,1]);for(const c of ACORN.cottages)lay(door(c),[-26,1]);                        // west: Cottage Lane
  lay(S4[2],[22,-6]);lay([22,-6],[32,-6]);                                                     // east: the farm road
  lay(S4[0],[3,20]);lay([3,20],[26,26]);lay([26,26],door(ACORN.tent));                           // south-east: gardens to the camp
  lay(S4[3],[0,-24]);                                                                          // north: the woods trail
  // ---- the village square: stone paving round the Island Heart, a bench on each side, lamps at the corners
  for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++){const d=Math.max(Math.abs(dx),Math.abs(dz));if(d<2)continue;const x=sq[0]+dx,z=sq[1]+dz;
    delete S.paths[K2(x,z)];occ.delete(K2(x,z));obj('stonepath',x,z);}
  mark(sq[0],sq[1],1);
  for(const [dx,dz,r] of [[-3,-3,0],[3,-3,0],[-3,3,Math.PI],[3,3,Math.PI]]){const i=S.objs.findIndex(o=>o.x===sq[0]+dx&&o.z===sq[1]+dz);if(i>=0)S.objs.splice(i,1);occ.delete(K2(sq[0]+dx,sq[1]+dz));obj('bench',sq[0]+dx,sq[1]+dz,r);}
  for(const [dx,dz] of [[-5,-5],[5,-5],[-5,5],[5,5]])obj('lantern',sq[0]+dx,sq[1]+dz);
  for(const [dx,dz] of [[-5,-2],[-5,2],[5,-2],[5,2],[-2,5],[2,5]])obj('planter',sq[0]+dx,sq[1]+dz);
  // ---- your house: a picket-fenced front garden with flowers, a birdhouse and a gnome
  {const [hx,hz]=ACORN.home;fenceRect(hx-2,hz-1,hx+3,hz+4,[hx+0.5,hz+4]);for(const [x,z] of [[hx-1,hz+2],[hx-1,hz+3],[hx+2,hz+2],[hx+2,hz+3]])obj('flowers',x,z);
    obj('birdhouse',hx-1,hz);obj('gnome',hx+2,hz);obj('flowerpot',hx-1,hz+1);obj('flowerpot',hx+2,hz+1);}
  // ---- Cottage Lane: each cottage gets a little garden, and the lane gets lamps, a well and a signpost
  ACORN.cottages.forEach(([x,z],i)=>{for(const [dx,dz] of [[-1,0],[2,0],[-1,1],[2,1]])obj(i%2?'flowers':'hedge',x+dx,z+dz);obj('flowerpot',x-1,z+2);obj('flowerpot',x+2,z+2);
    if(i%3===0)obj('chime',x+2,z-1);});
  obj('well',-26,-1);obj('signpost',-20,1,Math.PI/2);obj('bench',-27,8,0);
  // ---- the farm: three fenced fields, an orchard, a windmill with hay, scarecrows, sprinklers and a row of beehives
  const field=(x0,z0,w,d,list,gate)=>{fenceRect(x0-1,z0-1,x0+w,z0+d,gate);for(let dx=0;dx<w;dx++)for(let dz=0;dz<d;dz++){const x=x0+dx,z=z0+dz;
      if(dx===Math.floor(w/2)&&dz===Math.floor(d/2)){obj(dz%2?'scarecrow':'sprinkler',x,z);continue;}crop(list[Math.floor(dz/Math.max(1,d/list.length))%list.length],x,z);}};
  field(20,-18,9,4,['carrot','cabbage'],[24,-14]);field(20,-12,9,4,['tomato','pepper'],[24,-8]);field(33,-18,8,5,['wheat','pumpkin','corn'],[36,-13]);
  for(let x=33;x<=41;x+=2)for(let z=-10;z<=-4;z+=2)crop((x+z)%4?'peach':'starfruit',x,z); // the orchard
  if(obj('windmill',43,-17,Math.PI*0.25)){occ.add(K2(44,-17));occ.add(K2(43,-16));}obj('haybale',44,-15);obj('haybale',42,-14);obj('haybale',45,-14);
  for(let x=20;x<=28;x+=2)obj('beehive',x,-3);obj('signpost',19,-6,-Math.PI/2);
  // ---- the flower gardens: striped beds either side of a stone walk from the square down towards the sea
  {const beds=['tulip','lavender','sunflower','tulip','moonflower','lavender'];
    for(let z=8;z<=18;z++){obj('stonepath',3,z);if(z%3===2)continue;const t=beds[Math.floor((z-8)/3)%beds.length];for(let x=-2;x<=1;x++)crop(t,x,z);for(let x=5;x<=8;x++)crop(beds[(Math.floor((z-8)/3)+2)%beds.length],x,z);}
    for(const z of [10,15])obj('lantern',4,z);obj('bench',2,19,Math.PI);obj('bench',4,19,Math.PI);}
  // ---- the campsite on the east beach: benches and hay round the fire
  {const [cx,cz]=ACORN.fire;obj('bench',cx-1,cz+1,0);obj('bench',cx+1,cz-1,Math.PI/2);obj('haybale',cx+1,cz+1);obj('lantern',cx-2,cz-1);}
  // ---- the north woods: a signposted trailhead and a lookout bench up on the plateau
  obj('signpost',1,-23,0);for(let z=-40;z<=-28;z++)if(grass(0,z)&&(lvlMap.get(K2(0,z))||0)>=1&&!occ.has(K2(0,z))){obj('bench',0,z,Math.PI);mark(0,z,2);break;}
  // ---- lamps along the lanes, one every so often, on the grass beside the path
  pathOn.forEach(([x,z],i)=>{if(i%9!==4)return;const s=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[x+a,z+b]).find(([a,b])=>grass(a,b)&&!occ.has(K2(a,b)));if(s)obj('lantern',...s);});
  S.nextId=id;
  // ---- trees: a clear ring round everything laid so far, then the woods, groves round the edges, and loners in the meadows
  for(const k of [...occ]){const [x,z]=k.split(',').map(Number);mark(x,z,1);}for(let dz=-3;dz<=1;dz++)for(let dx=-2;dx<=2;dx++)occ.add(K2(DOCK.x+dx,DOCK.z+dz));
  mark(sq[0],sq[1],6);for(let x=-2;x<=8;x++)for(let z=7;z<=20;z++)occ.add(K2(x,z));for(let x=18;x<=46;x++)for(let z=-20;z<=-2;z++)occ.add(K2(x,z));
  for(const [x,z] of islands[0].grass){if(occ.has(K2(x,z))||!grass(x,z))continue;const e=townQ(x,z),n=vnoise(x*0.7+3,z*0.7-5,ACORN.seed%997),r=R(),lv=lvlMap.get(K2(x,z))||0;
    let kd=null;
    if(z<-24||lv)kd=r<(lv?0.34:0.27)?'tree':r<0.33?'bush':null;                    // the north woods
    else if(e>0.82&&z<24)kd=r<0.28?'tree':r<0.33?'bush':null;                      // groves round the east and west edges
    else if(n>0.72)kd=r<0.26?'tree':r<0.31?'bush':null;                            // copses in the meadows
    else kd=r<0.022?'tree':r<0.04?'bush':r<0.046?'rock':null;                     // the odd lone tree
    if(!kd)continue;const d=newDebris(x,z,kd);d.r=R()*6.28;
    if(kd==='tree'){d.v=(z<-24||lv)&&R()<0.62||R()<0.14?(R()<0.7?1:8):wildSpecies(x,z,R);d.sc=0.85+R()*0.3;}else d.v=Math.floor(R()*3);S.debris.push(d);}
  rebuildHome();}
if(S.acornNew){delete S.acornNew;setTimeout(()=>toast('Welcome to <b>Acornfield</b>: the village square, Cottage Lane, the farm, the flower gardens, the harbour and the north woods. Your own save is kept safe: open Settings and tap <b>Restore my save</b> to go back.','rare',ICON.sprout),1600);}
