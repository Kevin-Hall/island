/* =========================================================
   Dev: Hollyhock Cove, a hand-curated test island for everything recent: one walk round it passes every new thing.
   A river runs down the middle; the village is on the east bank and the farm on the west.
     - Harbour Street under the cliff: the hall, Hazel's store, the café and the museum on a cobbled street that runs
       to the lighthouse. Go in: the shop and café interiors are the cozy ones (56d).
     - the market square west of the plaza: stalls, a flower cart and rows of produce crates, baskets and sacks, each
       filled with something (58c), under bunting
     - the plaza: brick round the Island Heart, benches, lamps
     - the café's tea garden on decking: tea tables, deck chairs, stone lanterns, a koi pond
     - Cottage Row: six neighbours' cottages (each painted and dressed differently, 55b), front gardens of flowers
       behind picket fences, and a yard piece apiece from the new decor (50e)
     - the farm across the river: a fenced field of garden beds, a row per crop (45), gates, sprinklers, a scarecrow;
       a farmyard with the windmill, hay, hives and a farm stand of produce displays
     - the orchard: apple, pear, peach and cherry trees (shake them) and a berry walk of bushes of every kind (77)
     - the villa by the pond: a terracotta patio, a fire pit ring of log benches and toadstools
     - the beach: deck chairs and parasols round a bonfire; a telescope at the lookout on the cliff top
   Your bag holds a few of every new crafted thing (58b) to try. Temporary like the Dream Island: "Restore my save".
   ========================================================= */
const COVE={seed:9137,scale:1.5,shape:[0.05,0.03,0.02,1,2,3,3.4],coves:[[0.4,0.22,0.3],[3.4,0.16,0.22]],cliff:[0.4,0],wild:0.35,dockX:-6,
  home:[-9,-9],heart:[11,2],fire:[16,23],
  civic:[['hall',3,-8],['shop',8,-8],['cafe',13,-8],['museum',18,-8]],
  cottages:[[1,10,0x4a6ad0],[5,10,0xd87a9a],[9,10,0x4f9a4a],[13,10,0xe0913a],[17,10,0x8a6ad0],[21,10,0x3aa8a0]]};
function loadCove(){
  try{if(!S.showcase)localStorage.setItem(REAL_KEY,JSON.stringify(S));}catch(e){toast('Could not back up your save, so Hollyhock Cove was not loaded.');return;}
  const D=COVE;S.showcase=1;S.worldSeed=D.seed;
  S.home={style:'meadow',shape:D.shape,coves:D.coves,cliff:D.cliff,wild:D.wild,scale:D.scale,dockX:D.dockX,fire:D.fire};
  S.scratch=1;S.wild=1;S.islandName='Hollyhock Cove';S.homeAt={x:D.home[0],z:D.home[1]};S.house=3;
  S.heartAt={x:D.heart[0],z:D.heart[1]};S.heart={planted:1,revived:1};
  S.builds=[...D.civic.map(([t,x,z])=>({t,x,z,day:0,done:1})),...D.cottages.map(([x,z,roof],n)=>({t:'vh',n,x,z,roof,day:0,done:1}))];
  S.moved={};D.cottages.forEach((c,n)=>S.moved[n]=1);S.kits={};
  S.debris=[];S.weeds=[];S.finds=[];S.objs=[];S.tiles={};S.paths={};S.farmInit=0;S.tidy=1;S.day=Math.max(S.day||1,2);
  S.boat=null;S.sea=false;S.tut=2;S.tipTools=1;S.tipSeed=1;S.tipPaint=1;S.boatTip=1;S.rain=false;
  vil.x=vil.tx=D.heart[0]+0.5;vil.z=vil.tz=D.heart[1]+5.5;S.coveLay=1;S.coveNew=1;
  save();resetting=true;location.reload();}

// a bag to test with: some of everything new, and harvests to fill the displays
function coveBag(){
  for(const k of ['jam','pie','stew','buglure','fishlure','rainstick','suncharm','tonic','map','firework','skylantern'])if(CONSUM[k])S.inv['x:'+k]=(S.inv['x:'+k]||0)+3;
  for(const k of ['berries','blackberries','huckleberries','redcurrants','gooseberries','cloudberries','apple','pear','peach','cherries','acorn','mushroom','chestnut','hazelnut'])S.inv['g:'+k]=(S.inv['g:'+k]||0)+6;
  for(const k of ['pumpkin','tomato','corn','carrot','eggplant','strawberry'])S.inv[k+'|normal']=(S.inv[k+'|normal']||0)+5;
  for(const k of [...DECOR_NEW,'pcrate','pbasket','psack'])if(BUILD[k])S.store[k]=(S.store[k]||0)+(BUILD[k].multi?6:2);
  for(const id of CROP_IDS)S.free[id]=(S.free[id]||0)+10;}
const DECOR_NEW=['clothesline','feeder','barrow','stonelantern','bike','boatplanter','firepit','bunting','deckchair','toadstool','logbench','pumpkins','snowman','koipond','vane','teaset','flowercart','telescope'];

function layCove(){dreamProgress();coveBag();const D=COVE,R=mulberry(D.seed^0x5c1),occ=new Set(),focc=new Set();let id=S.nextId||1;
  const k2=K,T0=(x,z)=>landMap.get(K(x,z)),grass=(x,z)=>T0(x,z)==='grass'&&islMap.get(K(x,z))===0,land=(x,z)=>grass(x,z)||T0(x,z)==='sand'&&islMap.get(K(x,z))===0;
  const bld=[D.home,...D.civic.map(c=>[c[1],c[2]]),...D.cottages];const inBld=(x,z)=>bld.some(([bx,bz])=>x>=bx&&x<=bx+1&&z>=bz&&z<=bz+1);
  for(const [x,z] of bld)for(let dx=0;dx<2;dx++)for(let dz=0;dz<2;dz++)occ.add(k2(x+dx,z+dz));occ.add(k2(...D.heart));occ.add(k2(...D.fire));
  occ.add(k2(D.home[0]+2,D.home[1]+1));occ.add(k2(D.home[0]-1,D.home[1]+1));/* the crate/bin spots by the villa */
  let hi=false;
  const obj=(k,x,z,r=0,onSand,fill)=>{const fl=isFloor(k),o=fl?focc:occ;if(!BUILD[k]||!(onSand?land(x,z):grass(x,z))||o.has(k2(x,z))||fl&&S.tiles[k2(x,z)]||!hi&&(lvlMap.get(k2(x,z))||0)>0)return false;
    const q={id:id++,k,x,z,r};if(fill)q.fill=fill;S.objs.push(q);o.add(k2(x,z));return true;};
  const pave=(k,x0,z0,x1,z1,r=0)=>{for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)obj(k,x,z,r);};
  const swap=(k,x,z,r=0,fill)=>{const i=S.objs.findIndex(o=>o.x===x&&o.z===z&&!isFloor(o.k));if(i>=0){S.objs.splice(i,1);occ.delete(k2(x,z));}return obj(k,x,z,r,false,fill);};
  const EX=['rainbow','crystal','golden','moonlit','giant'];
  const crop=(t,x,z,v)=>{if(!grass(x,z)||occ.has(k2(x,z))||focc.has(k2(x,z)))return;S.tiles[k2(x,z)]={w:1,crop:{t,p:1,v:v||'normal',m:0}};occ.add(k2(x,z));};
  const dirt=(x,z)=>{if(grass(x,z)&&!occ.has(k2(x,z))&&!focc.has(k2(x,z))){S.paths[k2(x,z)]=PATH_WEAR;occ.add(k2(x,z));}};
  const fenceRect=(k,x0,z0,x1,z1,gates=[])=>{const g=(x,z)=>gates.some(([a,b])=>a===x&&b===z);
    for(let x=x0;x<=x1;x++)for(const z of [z0,z1])if(!g(x,z))obj(k,x,z,0);for(let z=z0+1;z<z1;z++)for(const x of [x0,x1])if(!g(x,z))obj(k,x,z,Math.PI/2);
    for(const [x,z] of gates)obj('gate',x,z,x===x0||x===x1?Math.PI/2:0);};
  const lane=(a,b)=>{const p=landPath(a[0],a[1],b[0],b[1],{four:true,max:20000,block:(x,z)=>inBld(x,z)||occ.has(k2(x,z))&&!S.paths[k2(x,z)]&&!(x===b[0]&&z===b[1]),cost:(x,z)=>S.paths[k2(x,z)]?0.4:1});
    if(p)for(const [x,z] of p)dirt(x,z);};
  const tree=(x,z,v)=>{if(!grass(x,z)||occ.has(k2(x,z)))return;const d={x,z,k:'tree',v,r:R()*6.28,hp:DEBRIS.tree.hp};S.debris.push(d);myDeb.add(d);occ.add(k2(x,z));};
  const bush=(x,z,v=2)=>{if(!grass(x,z)||occ.has(k2(x,z)))return;const d={x,z,k:'bush',v,r:R()*6.28,hp:DEBRIS.bush.hp};S.debris.push(d);myDeb.add(d);occ.add(k2(x,z));};
  const myDeb=new Set(),[cx,cz]=D.heart,[hx,hz]=D.home,win=season()==='winter';

  // ---- Harbour Street: a cobbled street along the shop fronts, lamps between them, out to the lighthouse
  pave('cobble',1,-6,22,-5);
  for(const x of [5,10,15,20]){obj('lamppost',x,-7);}
  obj('planter',2,-7,0);obj('signpost',0,-6,Math.PI/2);obj('bunting',7,-7,0);obj('bunting',12,-7,0);
  obj('flowercart',10,-7,0);/* Hazel's flowers out front of the store */obj('stonelantern',17,-7);obj('urn',22,-7);
  // the shop porch: a crate of the day's harvest either side of the door
  swap('pcrate',7,-6,0,'pumpkin|normal');swap('pbasket',10,-6,0,'g:apple');
  // the café patio: tea for two out front
  swap('teaset',12,-6,0);swap('chair',11,-6,Math.PI/2);swap('parasol',15,-6);swap('teaset',16,-6,0);swap('chair',17,-6,-Math.PI/2);
  lane([23,-5],[26,-4]);
  // ---- the plaza: brick round the Island Heart, flowers at its feet, benches facing it, lamps at the corners
  for(let x=cx-3;x<=cx+3;x++)for(let z=cz-4;z<=cz+4;z++){if(Math.abs(x-cx)<=1&&Math.abs(z-cz)<=1){if(x!==cx||z!==cz)obj('flowers',x,z);continue;}obj('brick',x,z);}
  for(const [dx,dz,r] of [[-3,-1,Math.PI/2],[-3,1,Math.PI/2],[3,-1,-Math.PI/2],[3,1,-Math.PI/2],[-1,3,Math.PI],[1,3,Math.PI]])swap('bench',cx+dx,cz+dz,r);
  for(const [dx,dz] of [[-3,-4],[3,-4],[-3,4],[3,4]])swap('lamppost',cx+dx,cz+dz);
  swap('fountain',cx,cz-3);
  // ---- the market square west of the plaza: stalls, the flower cart, and rows of produce displays under bunting
  {const mx0=2,mx1=6,mz0=-3,mz1=5;pave('flagstone',mx0,mz0,mx1,mz1);
    swap('stall',mx0+1,mz0,0);swap('stall',mx1-1,mz0,0);swap('bunting',mx0+3,mz0,0);
    const fills=[['pcrate','pumpkin|normal'],['pbasket','g:blackberries'],['psack','g:acorn'],['pcrate','g:apple'],['pbasket','g:cloudberries'],['psack','potato|normal'],
      ['pcrate','tomato|normal'],['pbasket','g:huckleberries'],['psack','g:chestnut'],['pcrate','g:pear'],['pbasket','g:redcurrants'],['psack','corn|normal'],
      ['pcrate','eggplant|normal'],['pbasket','g:gooseberries'],['psack','g:hazelnut'],['pcrate','carrot|normal'],['pbasket','g:mushroom'],['psack','wheat|normal']];
    let i=0;for(const z of [mz0+2,mz0+3,mz0+5,mz0+6])for(let x=mx0;x<=mx1;x++){if(x===mx0+2)continue;const [k,f]=fills[i++%fills.length];swap(k,x,z,z===mz0+2||z===mz0+5?Math.PI:0,f);}
    swap('flowercart',mx0,mz1,Math.PI/2);swap('lamppost',mx1,mz1);swap('pumpkins',mx0+1,mz1);swap('barrow',mx1-1,mz1,0);obj('bunting',mx0+3,mz1+1,0);}
  // ---- the café's tea garden: decking with tea tables, deck chairs, stone lanterns and a koi pond
  {const tx0=16,tx1=21,tz0=-3,tz1=2;pave('deck',tx0,tz0,tx1,tz1);
    swap('teaset',tx0+1,tz0+1);swap('chair',tx0,tz0+1,Math.PI/2);swap('chair',tx0+2,tz0+1,-Math.PI/2);
    swap('teaset',tx0+4,tz0+1);swap('chair',tx0+3,tz0+1,Math.PI/2);swap('chair',tx0+5,tz0+1,-Math.PI/2);
    swap('parasol',tx0+1,tz0);swap('parasol',tx0+4,tz0);swap('bunting',tx0+2,tz0-1+1,0);
    swap('deckchair',tx0+1,tz1,Math.PI);swap('deckchair',tx0+2,tz1,Math.PI);swap('stonelantern',tx0,tz1);swap('stonelantern',tx1,tz1);
    swap('rug',tx0+4,tz1-1);swap('pot_olive',tx1,tz0);swap('pot_fern',tx0,tz0);
    obj('koipond',tx1+2,tz0+2);obj('stonelantern',tx1+3,tz0+1);obj('toadstool',tx1+2,tz0+4);obj('cattail',tx1+3,tz0+3);obj('hedge',tx1+1,tz1+1);obj('hedge',tx1+2,tz1+1);}
  // ---- Cottage Row: a stepping-stone lane in front, a picket-fenced garden and a yard piece apiece
  {const YARD=[['clothesline','feeder'],['bike','birdbath'],['boatplanter','vane'],['barrow','pumpkins'],['toadstool','stonelantern'],['logbench','firepit']];
    const fl=[['tulip','lavender'],['sunflower','tulip'],['lavender','moonflower'],['sunflower','lavender'],['tulip','moonflower'],['moonflower','sunflower']];
    for(let x=0;x<=24;x++)obj('stonepath',x,8);
    D.cottages.forEach(([x,z],i)=>{const [a,b]=YARD[i],[f1,f2]=fl[i];
      obj('stonepath',x,z-1);obj('mailbox',x+1,z-1);obj(i%2?'topiary':'lamppost',x+2,z-1);
      obj(a,x+2,z+1,a==='bike'||a==='boatplanter'?Math.PI/2:0);obj(win&&i===4?'snowman':b,x+3,z,0);
      // the front garden: two beds of flowers and a path to the picket gate
      for(let gz=z+2;gz<=z+4;gz++){obj('stonepath',x,gz);crop(f1,x-1,gz,gz===z+3?EX[i%5]:'normal');crop(f2,x+1,gz,gz===z+2?EX[(i+2)%5]:'normal');}
      obj('picket',x-1,z+5);obj('gate',x,z+5,0);obj('picket',x+1,z+5);obj('flowerpot',x+2,z+4);});}
  // ---- the beach: deck chairs and parasols round the bonfire, logs to sit on, a little boat planter washed up
  {const [fx,fz]=D.fire;for(const [dx,dz,r] of [[-2,0,Math.PI/2],[2,0,-Math.PI/2],[0,-2,0]])obj('logbench',fx+dx,fz+dz,r,true);
    // along the top of the sand, facing the sea: a parasol between each pair of deck chairs
    const top=x=>{for(let z=16;z<=26;z++)if(T0(x,z)==='sand'&&islMap.get(k2(x,z))===0)return z;return null;};
    for(let x=fx-12;x<=fx+10;x++){if(Math.abs(x-fx)<4)continue;const z=top(x);if(z===null)continue;const m=((x-fx)%3+3)%3;obj(m===0?'parasol':'deckchair',x,z+(m===0?0:1),Math.PI,true)||obj(m===0?'parasol':'deckchair',x,z,Math.PI,true);}
    for(let x=-20;x<=26;x+=5){for(let z=17;z<=24;z++)if(T0(x,z)==='sand'&&!occ.has(k2(x,z))&&T0(x,z-1)!=='sand'){obj('palm',x,z,R()*6,true);break;}}}
  // ---- the lookout on the cliff top: a telescope, a log bench and a lantern, over the lighthouse and the sea
  {hi=true;const lx=22,lz=-13;pave('deck',lx-1,lz,lx+1,lz+1);swap('telescope',lx,lz,Math.PI);swap('logbench',lx-1,lz+1,Math.PI);swap('stonelantern',lx+1,lz+1);obj('vane',lx+2,lz);hi=false;}

  // ---- the farm across the river: a fenced field of garden beds, a row per crop, paths between with sprinklers
  const FX0=-26,FX1=-15,FZ0=-2,FZ1=6,FM=-21;
  {const rows=[['carrot','cabbage'],['tomato','pepper'],['strawberry','lettuce'],['pumpkin','eggplant'],['corn','sunflower'],['blueberry','watermelon']];
    fenceRect('fence',FX0-1,FZ0-1,FX1+1,FZ1+1,[[FM,FZ1+1],[FX1+1,2]]);let r=0;
    for(let z=FZ0;z<=FZ1;z++){const path=(z-FZ0)%3===2;
      for(let x=FX0;x<=FX1;x++){if(x===FM){obj('gravel',x,z);continue;}
        if(path){if((x-FX0)%4===1)obj('sprinkler',x,z);else if(x===FX1&&z===FZ0+2)obj('scarecrow',x,z);else dirt(x,z);continue;}}
      if(path)continue;const pr=rows[r%rows.length];r++;
      for(const [a,b,t] of [[FX0,FM-1,pr[0]],[FM+1,FX1,pr[1]]])for(let x=a;x<=b;x++)crop(t,x,z,(x+z)%7===0?EX[(x+z+40)%5]:'normal');}
    obj('gravel',FM,FZ1+1);obj('gravel',FX1+1,2);obj('scarecrow',FX0,FZ0+2);}
  // the farmyard by the river: the windmill, hay, hives, a vane, and a farm stand of produce displays
  if(obj('windmill',-11,-1,Math.PI*0.2)){occ.add(k2(-10,-1));occ.add(k2(-11,0));}
  for(const [x,z] of [[-13,-2],[-12,1],[-9,-2]])obj('haybale',x,z);
  for(const z of [3,5])obj('beehive',-13,z);obj('vane',-8,1);obj('pumpkins',-12,3);obj('barrow',-9,3,Math.PI/2);
  {pave('gravel',-10,5,-7,7);swap('stall',-9,5,0);swap('pcrate',-10,6,0,'pumpkin|normal');swap('pbasket',-9,6,0,'g:berries');swap('psack',-8,6,0,'potato|normal');swap('pcrate',-7,6,0,'corn|normal');
    swap('psack',-10,7,0,'wheat|normal');swap('pbasket',-7,7,0,'strawberry|normal');swap('lamppost',-7,5);}
  // ---- the orchard south of the farm: apple, pear, peach and cherry trees in rows (shake them), a path down the middle
  {const sp=[4,5,6,3];let n=0;for(let z=9;z<=17;z+=3)for(let x=-28;x<=-19;x+=3){if(x===-22)continue;tree(x,z,sp[n++%4]);}
    for(let z=9;z<=17;z++)obj('mossy',-22,z);obj('logbench',-21,13,-Math.PI/2);obj('feeder',-23,11);obj('birdhouse',-21,10);}
  // the berry walk along the pond: bushes of every kind (each patch of five tiles bears its own)
  for(const [x0,z0] of [[-17,15],[-12,15],[-9,13],[-12,-11],[-7,15],[-17,-4+0]]){for(let i=0;i<3;i++)bush(x0+i,z0);bush(x0+1,z0+1);}
  // ---- the villa by the pond: a terracotta patio, then a fire pit ring of log benches and toadstools
  pave('terracotta',hx-2,hz+2,hx+3,hz+3);swap('picnic',hx-1,hz+3,0);swap('parasol',hx-2,hz+2);swap('pot_monstera',hx+3,hz+2);swap('deckchair',hx+2,hz+3,Math.PI);swap('deckchair',hx+3,hz+3,Math.PI);
  obj('clothesline',hx+3,hz,0);obj('feeder',hx-2,hz);obj('pumpkins',hx-1,hz+4);obj('lamppost',hx+4,hz+4);
  {const px=hx+1,pz=hz+7;obj('firepit',px,pz);for(const [dx,dz,r,k] of [[-1,0,Math.PI/2,'logbench'],[1,0,-Math.PI/2,'logbench'],[0,-1,0,'toadstool'],[0,1,Math.PI,'toadstool']])obj(k,px+dx,pz+dz,r);
    obj('stonelantern',px-2,pz-1);obj('stonelantern',px+2,pz+1);}
  // ---- lanes: the street to the plaza and market, the villa down to the farm, the farm to the bridge, the dock up
  lane([cx,-4],[cx,cz-5]);lane([hx+1,hz+4],[FM,FZ1+2]);lane([FM,FZ1+2],[-6,8]);lane([FX1+2,2],[-10,4]);lane([-4,22],[3,9]);lane([hx+1,hz+4],[hx+1,hz+6]);
  S.nextId=id;
  // ---- clear the wild off the lowland; keep the woods on the cliff and along the far west and east edges
  const kept=(x,z)=>(lvlMap.get(k2(x,z))||0)>0||x>=26||x<=-29;
  const near=(x,z)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(occ.has(k2(x+a,z+b))||focc.has(k2(x+a,z+b))||inBld(x+a,z+b))return true;return false;};
  S.debris=S.debris.filter(d=>myDeb.has(d)||!near(d.x,d.z)&&kept(d.x,d.z));
  S.weeds=[];S.finds=S.finds.filter(f=>!near(f.x,f.z));
  rebuildHome();}
if(S.coveNew){delete S.coveNew;setTimeout(()=>toast('Welcome to <b>Hollyhock Cove</b>, a test island with everything new laid out: walk into the <b>shop</b> and <b>café</b>, browse the market, shake the orchard. Your bag has some of every crafted thing. Settings → <b>Restore my save</b> takes you home.','rare',ICON.star),1800);}
