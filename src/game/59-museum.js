/* =========================================================
   The museum: a hall you can walk around in, filled with what you've caught.
   Left wing: aquarium tanks where your fish swim (river, shore & open sea, deep sea).
   Right wing: a glass butterfly garden for flying bugs and terrariums for crawlers.
   Centre: your biggest catch on a spotlit plinth, and Grandpa Tully, the old sea-turtle curator, by the door.
   Outside (musShow): aquarium windows with a few of your fish, and your butterflies around the planters.
   ========================================================= */
const musGlass=new T.MeshLambertMaterial({color:0xd8f4ff,transparent:true,opacity:0.16,depthWrite:false});
const musWater=new T.MeshBasicMaterial({color:0x3a9ad8,transparent:true,opacity:0.2,depthWrite:false});
const musLit=new T.MeshBasicMaterial({vertexColors:true});
const caughtFish=()=>Object.keys(FISH).filter(k=>S.alm['f:'+k]&&!FISH[k].junk);
const caughtBugs=()=>Object.keys(BUGS).filter(k=>S.alm['b:'+k]);
const TANKS=[{name:'River & Pond',hab:['river'],x:-4.95,z:-1.9,w:1.1,d:2.6},{name:'Shore & Open Sea',hab:['shore','any'],x:-4.95,z:1.3,w:1.1,d:2.6},{name:'Deep Sea',hab:['deep'],x:-2.9,z:-3.85,w:3.0,d:1.1}];
const TANK_H=1.35,TANK_Y=0.5;
// Grandpa Tully, the museum's curator: a very old sea turtle in spectacles and a knitted scarf
function turtleModel(){const p=[],sk=0x7ab87a,skd=0x5a9a5e,sh=0x3f7a4e,shl=0x6aa86a;
  p.push(P(ICO2,sh,0,0.56,-0.1,0,0,0,0.62,0.7,0.42),P(ICO2,0x2f5e3c,0,0.5,-0.12,0,0,0,0.66,0.52,0.4),P(ICO2,0xe8d8a0,0,0.52,0.08,0,0,0,0.44,0.58,0.26));
  for(const [x,y] of [[0,0.66],[-0.16,0.5],[0.16,0.5],[-0.1,0.8],[0.1,0.8],[0,0.4]])p.push(P(ICO2,shl,x,y,-0.3,0,0,0,0.16,0.14,0.06));
  for(let i=0;i<3;i++)p.push(P(BOX,0xd0c088,0,0.36+i*0.14,0.2,0,0,0,0.3-i*0.03,0.012,0.02));
  p.push(P(CYL8,sk,0,0.9,0.02,0,0,0,0.16,0.14,0.16),P(ICO2,sk,0,1.04,0.06,0,0,0,0.38,0.32,0.36),P(ICO2,skd,0,0.97,0.2,0,0,0,0.2,0.1,0.1));
  for(const sd of [-1,1])p.push(P(ICO2,0xfbf8f0,sd*0.1,1.08,0.21,0,0,0,0.1,0.1,0.05),P(ICO2,0x2b1e2e,sd*0.1,1.08,0.235,0,0,0,0.05,0.06,0.02),
    P(CYL12,0xc8a060,sd*0.1,1.08,0.24,1.57,0,0,0.15,0.01,0.15),P(ICO2,sk,sd*0.3,0.62,0.02,0,0,sd*0.7,0.12,0.34,0.1),P(ICO2,skd,sd*0.13,0.14,0.04,0,0,0,0.16,0.1,0.2));
  p.push(P(BOX,0xc8a060,0,1.09,0.245,0,0,0,0.06,0.01,0.01),P(BOX,0x3a2a2a,0,0.97,0.25,0,0,0,0.1,0.015,0.01),P(ICO2,0xf39ab0,-0.14,1.0,0.21,0,0,0,0.05,0.03,0.02),P(ICO2,0xf39ab0,0.14,1.0,0.21,0,0,0,0.05,0.03,0.02));
  p.push(P(CYL12,0xd8604a,0,0.86,0.02,0,0,0,0.3,0.08,0.28),P(BOX,0xd8604a,0.1,0.72,0.16,0.2,0,0.2,0.08,0.22,0.03),P(BOX,0xf4f0ea,0.1,0.64,0.175,0.2,0,0.2,0.08,0.03,0.03));
  const g=new T.Group();g.add(M(p));return g;}
const TULLY_LINES=['Welcome, welcome! Take your time. I’ve had two hundred years; you can have an afternoon.','When I was a hatchling these islands had no names. Now look at them.',
  'Every fish you bring swims a little happier here. I like to think so, anyway.','The butterflies keep me young. Well. Younger.','I’ve collected shells since before your grandparents’ grandparents. Never found a matching pair.',
  'The sea brings everything home in the end. Driftwood, bottles, curious visitors…','Slow and steady fills a museum, my friend.'];
function tullyTalk(){const [g,t]=dexCount();setAction(`<b>Grandpa Tully</b><br>${pickR(TULLY_LINES)}<br><span class="sub">Collection: ${g} of ${t} discovered.</span>`,
  [{label:'Islandex',cls:'go',fn:()=>{clearAction();openSheet('dex','fish');}},{label:'Bye!',fn:clearAction}],'Curator');tone(330,0.18,'triangle',0.04);setTimeout(()=>tone(262,0.22,'triangle',0.04),160);}
function buildMuseum(){const RW=11,RD=9,WH=3.2,p=[],gl=[],lit=[],glass=[],water=[],anim=[],props=[{x:0,z:RD/2-0.35,w:1.2,d:0.6,label:'exit'}];
  const g=new T.Group(),BLUE=0x355f8a,GREEN=0x4a7a4a,CREAM=0xf2e6cc,GOLD=0xd8b050,WOODD=0x6a4428;
  // floor: marble checks with a red carpet running up to the centrepiece
  for(let x=0;x<RW;x++)for(let z=0;z<RD;z++)p.push(P(BOX,(x+z)%2?0xcfc3ae:0xb3a690,-RW/2+0.5+x,-0.05,-RD/2+0.5+z,0,0,0,1,0.1,1));
  p.push(P(BOX,0xb83a3a,0,0.005,1.2,0,0,0,1.4,0.02,6.6),P(BOX,GOLD,-0.72,0.01,1.2,0,0,0,0.06,0.02,6.6),P(BOX,GOLD,0.72,0.01,1.2,0,0,0,0.06,0.02,6.6));
  // walls: blue for the fish wing, green for the bugs, cream in the middle, gold trim
  const wall=(x,z,w,d,c)=>p.push(P(BOX,c,x,WH/2,z,0,0,0,w,WH,d));
  wall(-3.35,-RD/2-0.05,4.3,0.1,BLUE);wall(3.35,-RD/2-0.05,4.3,0.1,GREEN);wall(0,-RD/2-0.05,2.4,0.1,CREAM);wall(-RW/2-0.05,0,0.1,RD,BLUE);wall(RW/2+0.05,0,0.1,RD,GREEN);
  for(const [x,z,w,d] of [[0,-RD/2+0.01,RW,0.04],[-RW/2+0.01,0,0.04,RD],[RW/2-0.01,0,0.04,RD]])p.push(P(BOX,GOLD,x,0.1,z,0,0,0,w,0.2,d),P(BOX,GOLD,x,WH-0.08,z,0,0,0,w,0.12,d));
  for(let i=0;i<9;i++)p.push(P(ICO2,0x5a8ac0,-5.3+i*0.5,2.5,-RD/2+0.02,0,0,0,0.3,0.14,0.02),P(ICO2,0x6aa06a,1.3+i*0.5,2.5,-RD/2+0.02,0,0,0,0.26,0.16,0.02));
  // back arch with the museum crest: a turtle shell in a gold roundel
  p.push(P(BOX,0xe8d8b8,-1.1,1.4,-RD/2+0.08,0,0,0,0.2,2.8,0.12),P(BOX,0xe8d8b8,1.1,1.4,-RD/2+0.08,0,0,0,0.2,2.8,0.12),P(CYL12,GOLD,0,2.55,-RD/2+0.06,1.57,0,0,0.9,0.04,0.9),P(CYL12,0x8a6040,0,2.55,-RD/2+0.09,1.57,0,0,0.7,0.04,0.7));
  for(const [x,y] of [[0,2.55],[-0.18,2.64],[0.18,2.64],[-0.18,2.46],[0.18,2.46],[0,2.74],[0,2.36]])p.push(P(CYL6,0x6aa86a,x,y,-RD/2+0.11,1.57,0,0,0.16,0.02,0.16));
  // columns along the carpet
  for(const x of [-1.5,1.5])for(const z of [-1.2,1.6]){p.push(P(CYL12,0xf4efe4,x,WH/2,z,0,0,0,0.34,WH,0.34),P(BOX,0xe0d8c8,x,0.08,z,0,0,0,0.46,0.16,0.46),P(BOX,0xe0d8c8,x,WH-0.1,z,0,0,0,0.46,0.16,0.46));}
  // ---- fish wing: tanks with sand, weed and rocks; your fish swim inside ----
  const fish=caughtFish();
  for(const T0 of TANKS){const {x,z,w,d}=T0,list=fish.filter(k=>T0.hab.includes(FISH[k].hab||'any'));
    p.push(P(BOX,0x5a4a3a,x,TANK_Y/2,z,0,0,0,w+0.14,TANK_Y,d+0.14),P(BOX,GOLD,x,TANK_Y,z,0,0,0,w+0.16,0.04,d+0.16),P(BOX,0x3a3440,x,TANK_Y+TANK_H+0.04,z,0,0,0,w+0.12,0.08,d+0.12),P(BOX,0xc8b488,x,TANK_Y+0.05,z,0,0,0,w,0.1,d));
    lit.push(P(BOX,0x4aa0d0,x-(w<d?w/2-0.02:0),TANK_Y+TANK_H/2,z-(w<d?0:d/2-0.02),0,0,0,w<d?0.02:w,TANK_H,w<d?d:0.02));
    const R=mulberry(hi(Math.round(x*10),Math.round(z*10),3));
    for(let i=0;i<6;i++){const sx=x+(R()-0.5)*(w-0.2),sz=z+(R()-0.5)*(d-0.2);for(let k=0;k<4;k++)lf(p,[0x3a8a4a,0x4aa05a,0x2e7a3e][k%3],sx,TANK_Y+0.1,sz,R()*6.28,1.3,0.3+R()*0.35,0.06,0.02);}
    for(let i=0;i<3;i++)p.push(P(ICO2,[0x9a9ea8,0xb8b0a0,0x8a8e98][i],x+(R()-0.5)*(w-0.3),TANK_Y+0.12,z+(R()-0.5)*(d-0.3),0,R()*3,0,0.18+R()*0.12,0.12,0.16));
    glass.push(P(BOX,0xffffff,x,TANK_Y+TANK_H/2,z,0,0,0,w,TANK_H,d));water.push(P(BOX,0xffffff,x,TANK_Y+TANK_H/2-0.03,z,0,0,0,w-0.04,TANK_H-0.1,d-0.04));
    // a little plaque on the tank's front edge
    p.push(P(BOX,GOLD,w<d?x+w/2+0.08:x,TANK_Y*0.6,w<d?z:z+d/2+0.08,0,0,0,w<d?0.02:0.5,0.14,w<d?0.5:0.02));
    list.forEach((k,i)=>{const F=FISH[k],m=fishModel(F),s=0.32+F.size*0.1,sc=Math.min(0.7,0.42/(s*1.4));m.scale.setScalar(sc);g.add(m);
      anim.push({m,kind:'fish',x,z,a:(w/2-0.22)*(0.45+((i*0.37)%0.55)),b:(d/2-0.2)*(0.45+((i*0.53)%0.55)),y:TANK_Y+0.3+((i*0.29)%1)*(TANK_H-0.55),sp:(0.35+((i*0.17)%0.4))*(i%2?1:-1),ph:i*1.7});});
    props.push({x,z,w:w+0.3,d:d+0.3,label:'tank',info:()=>toast(list.length?`<b>${T0.name}</b> · ${list.map(k=>FISH[k].name).join(', ')}`:`<b>${T0.name}</b> tank · still empty. Catch some fish and they’ll swim here!`,'',ICON.fish)});}
  // ---- bug wing: a glass butterfly garden, and terrariums for the crawlers ----
  const bugs=caughtBugs(),fly=bugs.filter(k=>(BUGS[k].kind||'fly')!=='crawl'),crawl=bugs.filter(k=>BUGS[k].kind==='crawl');
  {const x=3.3,z=-3.05,w=3.6,d=2.3,h=2.2,R=mulberry(77);
    p.push(P(BOX,0x6a5a4a,x,0.06,z,0,0,0,w+0.1,0.12,d+0.1),P(BOX,0x6aa84a,x,0.13,z,0,0,0,w,0.04,d),P(BOX,0x3a3440,x,h+0.04,z,0,0,0,w+0.08,0.08,d+0.08));
    for(const [cx,cz] of [[-1,-1],[1,-1],[-1,1],[1,1]])p.push(P(BOX,0x3a3440,x+cx*w/2,h/2,z+cz*d/2,0,0,0,0.06,h,0.06));
    p.push(...shift(scaleParts(treeParts('oak',mulberry(9),0x9a9ea8),0.55),x+1.1,0.15,z-0.4,0));
    for(let i=0;i<14;i++){const fx=x+(R()-0.5)*(w-0.4),fz=z+(R()-0.5)*(d-0.4);stemP(p,0x4f8a34,fx,fz,0.18,0.15);bloom(p,[0xf2a6c8,0xf6d04a,0xffffff,0xe86a5a,0xb8a8f2][i%5],0xf6d04a,fx,0.33+0.15,fz,0.07,6,0.9);}
    glass.push(P(BOX,0xffffff,x,h/2+0.1,z,0,0,0,w,h,d));
    fly.forEach((k,i)=>{const m=bugGroup(BUGS[k]);m.scale.setScalar(0.8);g.add(m);anim.push({m,kind:'fly',x,z,rx:w/2-0.35,rz:d/2-0.3,y:0.7+((i*0.23)%1)*1.0,ph:i*2.1,sp:0.5+((i*0.13)%0.5)});});
    props.push({x,z,w:w+0.3,d:d+0.3,label:'garden',info:()=>toast(fly.length?`<b>Butterfly Garden</b> · ${fly.map(k=>BUGS[k].name).join(', ')}`:'<b>Butterfly Garden</b> · no residents yet. Catch flying bugs with your net!','',ICON.fly)});}
  for(let i=0;i<4;i++){const x=4.75,z=-0.6+i*1.25,here=crawl.slice(i*2,i*2+2);
    p.push(P(BOX,0xe0d8c8,x,0.35,z,0,0,0,0.7,0.7,0.8),P(BOX,GOLD,x,0.71,z,0,0,0,0.74,0.04,0.84),P(BOX,0x8a6a44,x,0.76,z,0,0,0,0.64,0.06,0.74),P(CYL8,0x7a5230,x,0.83,z,1.57,0.3,0,0.08,0.5,0.08),P(BOX,GOLD,x-0.36,0.45,z,0,0,0,0.02,0.12,0.36));
    lf(p,0x4aa05a,x-0.15,0.8,z+0.2,1,0.6,0.2,0.1);lf(p,0x3a8a4a,x+0.18,0.8,z-0.22,4,0.6,0.22,0.1);
    glass.push(P(BOX,0xffffff,x,1.05,z,0,0,0,0.64,0.6,0.74));
    here.forEach((k,j)=>{const m=bugGroup(BUGS[k]);m.scale.setScalar(1.1);m.position.set(x+(j?0.12:-0.12),0.86,z+(j?-0.15:0.15));m.rotation.y=j?2:-1;g.add(m);anim.push({m,kind:'crawl',ph:i+j});});
    props.push({x,z,w:0.9,d:1.0,label:'case',info:()=>toast(here.length?here.map(k=>`<b>${BUGS[k].name}</b>`).join(' & '):'An empty terrarium, waiting for a beetle or two.','',ICON.crawl)});}
  // ---- centrepiece: your biggest catch, turning slowly on a spotlit plinth ----
  {const best=fish.slice().sort((a,b)=>FISH[b].size-FISH[a].size||FISH[b].price-FISH[a].price)[0],z=-2.3;
    p.push(P(CYL12,0xe8e0d0,0,0.3,z,0,0,0,1.0,0.6,1.0),P(CYL12,GOLD,0,0.62,z,0,0,0,1.04,0.05,1.04),P(CYL12,0x3a3440,0,0.66,z,0,0,0,0.86,0.04,0.86));
    glass.push(P(ICO2,0xffffff,0,1.15,z,0,0,0,0.95,1.0,0.95));lit.push(P(CONE12,0xfff4c8,0,2.9,z,0,0,0,0.3,0.2,0.3));
    if(best){const m=fishModel(FISH[best]);m.scale.setScalar(Math.min(1.1,0.75/((0.32+FISH[best].size*0.1)*1.2)));m.position.set(0,1.12,z);g.add(m);anim.push({m,kind:'spin'});}
    props.push({x:0,z,w:1.2,d:1.2,label:'centre',info:()=>toast(best?`<b>Star exhibit:</b> your ${FISH[best].name}, the biggest catch in the collection!`:'The star exhibit plinth is waiting for your first catch.','rare',ICON.star)});}
  // ---- the curator's desk by the door ----
  {const x=-2.7,z=2.9;p.push(P(BOX,0x8a5a3a,x,0.45,z,0,0,0,1.4,0.9,0.6),P(BOX,0xa8744a,x,0.92,z,0,0,0,1.5,0.06,0.7),P(BOX,0xd8453a,x+0.4,0.98,z,0,0.3,0,0.36,0.06,0.26),P(BOX,0xf4f0ea,x+0.4,1.02,z,0,0.3,0,0.3,0.02,0.22));
    lit.push(P(ICO2,0xfff0c0,x-0.5,1.2,z,0,0,0,0.16,0.14,0.16));p.push(P(CYL8,GOLD,x-0.5,1.02,z,0,0,0,0.04,0.2,0.04));
    const tully=turtleModel();tully.position.set(x,0.45,z-0.55);tully.rotation.y=0.5;g.add(tully);anim.push({m:tully,kind:'curator'});
    props.push({x,z:z-0.3,w:1.6,d:1.2,label:'curator',info:tullyTalk});}
  // entrance mat and potted palms
  p.push(P(BOX,0x3a6a8a,0,0.01,RD/2-0.35,0,0,0,1.2,0.02,0.5));for(const x of [-1.2,1.2]){const f=furn('plant');p.push(...shift(f.p,x,0,RD/2-0.5,0));}
  g.add(M(p));if(gl.length)g.add(M(gl,glowMat));g.add(new T.Mesh(merge(lit),musLit));
  const wm=new T.Mesh(merge(water),musWater);wm.renderOrder=1;g.add(wm);const gm=new T.Mesh(merge(glass),musGlass);gm.renderOrder=2;g.add(gm);
  const l1=new T.PointLight(0x9ad0ff,0.35,6);l1.position.set(-3.8,2.4,-0.5);g.add(l1);
  const tick=(dt,tt)=>{for(const a of anim){const m=a.m;
    if(a.kind==='fish'){const t=tt*a.sp+a.ph,px=a.x+Math.cos(t)*a.a,pz=a.z+Math.sin(t)*a.b;m.position.set(px,a.y+Math.sin(tt*1.3+a.ph)*0.05,pz);m.rotation.y=Math.atan2(-Math.sin(t)*a.a*a.sp,Math.cos(t)*a.b*a.sp);m.rotation.z=Math.sin(tt*6+a.ph)*0.08;}
    else if(a.kind==='fly'){const t=tt*a.sp+a.ph,px=a.x+Math.sin(t)*a.rx,pz=a.z+Math.sin(t*1.7+1)*a.rz;const ox=m.position.x,oz=m.position.z;m.position.set(px,a.y+Math.sin(t*2.3)*0.25,pz);
      if(Math.hypot(px-ox,pz-oz)>1e-4)m.rotation.y=Math.atan2(px-ox,pz-oz);const u=m.userData;if(u.wl){const f=Math.sin(tt*(u.drag?30:16)+a.ph)*(u.drag?0.4:0.9);u.wl.rotation.z=f;u.wr.rotation.z=-f;}}
    else if(a.kind==='crawl')m.rotation.y+=Math.sin(tt*0.8+a.ph)*0.004;
    else if(a.kind==='spin')m.rotation.y+=dt*0.5;
    else if(a.kind==='curator'){m.position.y=0.45+Math.abs(Math.sin(tt*1.2))*0.015;m.rotation.z=Math.sin(tt*0.8)*0.03;}}};
  return{g,props,RW,RD,follow:true,tick,title:`The ${TOWN.name} Museum`};}

/* ---- outside: aquarium windows and butterflies around the planters, refreshed when the collection grows ---- */
const musShow={g:null,anim:[],sig:''};
function museumSpot(){const b=TOWN.bld.find(q=>q.t==='museum');return b?{b,x:b.x+0.5,z:b.z+0.5,y:Math.min(topY(b.x,b.z),topY(b.x+1,b.z+1))}:null;}
function refreshMuseumShow(){const at=museumSpot(),isl=islands[0];if(!at||!isl||!isl.group)return;const fish=caughtFish(),fly=caughtBugs().filter(k=>(BUGS[k].kind||'fly')!=='crawl');
  const sig=fish.length+'|'+fly.length;if(sig===musShow.sig&&musShow.g)return;musShow.sig=sig;
  if(musShow.g){isl.group.remove(musShow.g);musShow.g.traverse(o=>{if(o.geometry&&o.geometry!==BOX)o.geometry.dispose();});}
  const g=new T.Group();g.position.set(at.x,at.y,at.z);musShow.g=g;musShow.anim=[];isl.group.add(g);
  // the two aquarium windows sit at x=±0.62 on the facade (z≈0.53); a few of your fish swim behind the glass
  const show=fish.slice(-6);show.forEach((k,i)=>{const F=FISH[k],m=fishModel(F),s=0.32+F.size*0.1;m.scale.setScalar(Math.min(0.32,0.2/(s*1.4)));g.add(m);
    musShow.anim.push({m,kind:'fish',x:i%2?0.62:-0.62,y:0.72+((i>>1)%3)*0.09,sp:0.6+(i%3)*0.25,ph:i*1.9});});
  fly.slice(-5).forEach((k,i)=>{const m=bugGroup(BUGS[k]);m.scale.setScalar(BUG_SCALE);g.add(m);musShow.anim.push({m,kind:'fly',x:i%2?0.95:-0.95,ph:i*2.3,sp:0.7+(i%3)*0.2});});}
function updateMuseumShow(dt,tt){if(!musShow.g)return;for(const a of musShow.anim){const m=a.m;
  if(a.kind==='fish'){const t=tt*a.sp+a.ph,px=a.x+Math.sin(t)*0.16;m.position.set(px,a.y+Math.sin(tt*1.7+a.ph)*0.03,0.5);m.rotation.y=Math.cos(t)>0?Math.PI/2:-Math.PI/2;}
  else{const t=tt*a.sp+a.ph,ox=m.position.x,oz=m.position.z,px=a.x+Math.sin(t)*0.3,pz=1.05+Math.sin(t*1.6)*0.25;m.position.set(px,0.45+Math.sin(t*2.2)*0.15,pz);if(Math.hypot(px-ox,pz-oz)>1e-4)m.rotation.y=Math.atan2(px-ox,pz-oz);
    const u=m.userData;if(u.wl){const f=Math.sin(tt*16+a.ph)*0.9;u.wl.rotation.z=f;u.wr.rotation.z=-f;}}}}
