/* =========================================================
   Dev: Acornfield, a hand-laid island (from the concept art). One tap in Settings swaps this save for it: a squarish,
   flat island with a cream beach along its south shore and a pier at its west end, your red-roofed house in the middle
   of a little village of cottages (green, purple and blue roofs, and a flat sandstone house), dirt paths between the
   doors, lamps and fences, a fenced vegetable patch, a campfire with benches, a tent, and groves of round trees and
   pines. Four neighbours live in the cottages. Everything else (seasons, clock, critters) works as usual.
   Your real save is copied first (same as the showcase farm) and "Restore my save" brings it back.
   The island's shape comes from S.home (preset, scale, dockX); its layout is laid once after the reload (layAcornfield),
   when the land exists to lay paths on.
   ========================================================= */
const ACORN={seed:24117,home:[0,4],heart:[-3,-3],fire:[9,5],tent:[10,-4],
  // [x, z, roof colour or -1 for the flat-roofed house]: the neighbours' cottages (2x2 footprints, doors on the +z side)
  cottages:[[-6,8,0x4f9a4a],[-8,1,0x8a6ad0],[2,-2,0x4a6ad0],[0,-7,-1]],
  farm:[6,0,4,2]/* x, z, width, depth */};
function loadAcornfield(){
  try{if(!S.showcase)localStorage.setItem(REAL_KEY,JSON.stringify(S));}catch(e){toast('Could not back up your save, so Acornfield was not loaded.');return;}
  S.showcase=1;S.worldSeed=ACORN.seed;
  S.home={style:'meadow',shape:[0.015,0.01,0.005,0,1,2,9],coves:[],cliff:[3,0],wild:0.5,preset:'acorn',scale:0.82,dockX:-7,fire:ACORN.fire,tent:ACORN.tent};
  S.scratch=1;S.wild=1;S.islandName='Acornfield';S.homeAt={x:ACORN.home[0],z:ACORN.home[1]};S.house=2;
  S.heartAt={x:ACORN.heart[0],z:ACORN.heart[1]};S.heart={planted:1,revived:1};S.xp=Math.max(200,Math.min(S.xp||0,270));
  S.builds=ACORN.cottages.map(([x,z,roof],n)=>({t:'vh',n,x,z,roof,day:0,done:1}));S.moved={};ACORN.cottages.forEach((c,n)=>S.moved[n]=1);S.kits={};
  S.debris=[];S.weeds=[];S.finds=[];S.objs=[];S.tiles={};S.paths={};S.farmInit=1;S.tidy=1;S.day=Math.max(S.day,2);S.shells=Math.max(S.shells,2315);
  S.boat=null;S.sea=false;S.tut=2;S.tipTools=1;S.tipSeed=1;S.tipPaint=1;S.boatTip=1;S.rain=false;
  vil.x=vil.tx=ACORN.home[0]+1.5;vil.z=vil.tz=ACORN.home[1]+2.6;S.px=vil.x;S.pz=vil.z;S.acornLay=1;S.acornNew=1;
  save();resetting=true;location.reload();}

// lay the village out on the real land: paths between the doors, the veg patch, fences, lamps, benches, then trees
function layAcornfield(){const occ=new Set(),grass=(x,z)=>landMap.get(K(x,z))==='grass'&&islMap.get(K(x,z))===0;
  const mark=(x,z,r=0)=>{for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)occ.add(K(x+dx,z+dz));};
  const foot=(x,z,w=2,d=2)=>{for(let dx=0;dx<w;dx++)for(let dz=0;dz<d;dz++)mark(x+dx,z+dz);};
  const [hx,hz]=ACORN.home;foot(hx,hz);for(const [x,z] of ACORN.cottages)foot(x,z);foot(...ACORN.tent);mark(...ACORN.fire,1);mark(...ACORN.heart,1);
  const blocked=(x,z)=>{for(const [bx,bz] of [[hx,hz],...ACORN.cottages,ACORN.tent])if(x>=bx&&x<=bx+1&&z>=bz&&z<=bz+1)return true;return false;};
  // paths: from your door to each neighbour, the campfire, the veg patch, the tent and the pier
  const pathOn=new Set();const lay=(a,b)=>{const p=landPath(a[0],a[1],b[0],b[1],{four:true,max:9000,block:blocked,cost:(x,z)=>pathOn.has(K(x,z))?0.4:1});
    if(!p)return;for(const [x,z] of p){if(!grass(x,z))continue;const k=K(x,z);S.paths[k]=PATH_WEAR;pathOn.add(k);occ.add(k);}};
  const door=([x,z])=>[x,z+2],[fx,fz,fw,fd]=ACORN.farm;
  for(const c of ACORN.cottages)lay(door([hx,hz]),door(c));
  lay(door([hx,hz]),[ACORN.fire[0]-1,ACORN.fire[1]]);lay(door(ACORN.cottages[2]),[fx-1,fz+fd]);lay([fx+fw,fz+fd],door(ACORN.tent));
  lay(door(ACORN.cottages[0]),[DOCK.x,DOCK.z-1]);
  // the vegetable patch: rows of ripe crops inside a fence, with a signpost at the gate
  const crops=['carrot','cabbage','tomato','carrot'];let id=S.nextId||1;const obj=(k,x,z,r=0)=>{if(!grass(x,z)||occ.has(K(x,z)))return;S.objs.push({id:id++,k,x,z,r});occ.add(K(x,z));};
  for(let dx=0;dx<fw;dx++)for(let dz=0;dz<fd;dz++){const x=fx+dx,z=fz+dz;if(!grass(x,z))continue;S.tiles[K(x,z)]={w:1,crop:{t:crops[dx%crops.length],p:1,v:'normal',m:0}};occ.add(K(x,z));}
  for(let x=fx-1;x<=fx+fw;x++){obj('fence',x,fz-1);if(x!==fx-1)obj('fence',x,fz+fd);}
  for(let z=fz;z<fz+fd;z++){obj('fence',fx-1,z,Math.PI/2);obj('fence',fx+fw,z,Math.PI/2);}
  obj('signpost',fx-1,fz+fd,-Math.PI/2);
  // a fence along the back of the village, and one by the green cottage
  for(let x=-4;x<=3;x++)obj('fence',x,-10);for(let z=7;z<=10;z++)obj('fence',-9,z,Math.PI/2);
  // lamps beside the paths, a pair of benches at the campfire, flowers by the doors
  for(const [x,z] of [[2,7],[-3,7],[5,3],[-6,4],[3,-4],[7,6],[-5,12]]){const s=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[x+a,z+b]).find(([a,b])=>grass(a,b)&&!occ.has(K(a,b)));if(s)obj('lantern',...s);}
  const [cx,cz]=ACORN.fire;obj('bench',cx-1,cz+1,0);obj('bench',cx+1,cz-1,Math.PI/2);obj('haybale',cx+1,cz+1);
  for(const [x,z] of [[hx+2,hz+1],[-4,10],[-6,2],[4,-1],[2,-6]])obj('flowers',x,z);
  S.nextId=id;
  // keep a clear ring round everything laid so far, then groves: pines at the back, round trees round the edges, a few loners
  for(const k of [...occ]){const [x,z]=k.split(',').map(Number);mark(x,z,1);}for(let dz=-3;dz<=1;dz++)for(let dx=-2;dx<=2;dx++)occ.add(K(DOCK.x+dx,DOCK.z+dz));
  const R=mulberry(ACORN.seed^0x51);
  for(const [x,z] of islands[0].grass){if(occ.has(K(x,z))||!grass(x,z))continue;const e=townQ(x,z),n=vnoise(x*0.9+3,z*0.9-5,ACORN.seed%997),r=R();
    let kd=null;if(e>0.74&&z<6&&r<0.42||n>0.7&&z<8&&r<0.3)kd='tree';/* groves round the back and sides; the south shore stays open */else if(r<0.035)kd='tree';else if(r<0.05)kd='bush';else if(r<0.06)kd='rock';
    if(!kd)continue;const d=newDebris(x,z,kd);d.r=R()*6.28;
    if(kd==='tree'){d.v=z<-7&&R()<0.6||R()<0.18?1:[0,2,3][Math.floor(R()*3)];d.sc=0.85+R()*0.3;}else d.v=Math.floor(R()*3);S.debris.push(d);}
  rebuildHome();}
if(S.acornNew){delete S.acornNew;setTimeout(()=>toast('Welcome to <b>Acornfield</b>. Your own save is kept safe: open Settings and tap <b>Restore my save</b> to go back.','rare',ICON.sprout),1600);}
