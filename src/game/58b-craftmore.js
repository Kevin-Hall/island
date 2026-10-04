/* =========================================================
   More to make at the Workbench.
   - Every piece of decor can now be made by hand: saplings from acorns and pinecones, wildflowers and cattails from
     fiber, a mailbox, rug, parasol, bird bath, lamppost, picnic set, sundial, hammock, arbor, market stall, swing,
     fountain, Lucky Clover and windmill, and the marble and hex tiles.
   - Treats you cook from what you forage, to eat, share or sell (sellable consumables: CONSUM[k].sell):
     Berry Jam (any berries: a spring in your step for the day, the café's Tailwind buff), Fruit Pie (share it: every
     neighbour warms to you), Forest Stew (mushrooms and acorns: villagers warm up twice as fast today).
   - Handy things that do something: a Bug Lure (butterflies and beetles come to you), a Shimmer Lure (your next five
     casts draw a rarer fish), a Rain Stick or Sun Charm (sets tomorrow's weather), Growth Tonic (every growing crop
     jumps on), a Treasure Map (an X somewhere on your island with something rare beneath), Fireworks and Sky
     Lanterns (just lovely).
   Ingredients can name a group (`any:berry`, `any:fruit`, `any:fish`) instead of one item: any of them will do.
   ========================================================= */
const ANY={berry:{name:'Any berries',keys:()=>['g:berries','g:blackberries','g:huckleberries','g:redcurrants','g:gooseberries','g:cloudberries'],icon:'g:berries'},
  fruit:{name:'Any fruit',keys:()=>['g:apple','g:pear','g:peach','g:cherries'],icon:'g:apple'},
  fish:{name:'Any fish',keys:()=>Object.keys(S.inv).filter(k=>k.startsWith('f:')).sort((a,b)=>priceOf(a)-priceOf(b)),icon:'f:sardine'}};
const anyOf=k=>k.startsWith('any:')?ANY[k.slice(4)]:null;
Object.assign(CONSUM,{
  jam:{name:'Berry Jam',price:180,sell:1,cat:'treat',desc:'Eat a spoonful for a spring in your step: you walk and sail faster for the rest of the day.'},
  pie:{name:'Fruit Pie',price:360,sell:1,cat:'treat',desc:'Share it round: every neighbour warms to you.'},
  stew:{name:'Forest Stew',price:280,sell:1,cat:'treat',desc:'A hearty bowl. Neighbours warm up to you twice as fast today.'},
  buglure:{name:'Bug Lure',price:40,cat:'handy',desc:'A dab of sweet berry nectar: butterflies and beetles come to you.'},
  fishlure:{name:'Shimmer Lure',price:60,cat:'handy',desc:'Your next five casts draw a rarer fish.'},
  rainstick:{name:'Rain Stick',price:50,cat:'handy',desc:'Shake it and tomorrow it will rain (your crops get watered).'},
  suncharm:{name:'Sun Charm',price:50,cat:'handy',desc:'Hang it up and tomorrow will be clear and bright.'},
  tonic:{name:'Growth Tonic',price:80,cat:'handy',desc:'Every growing crop on your island jumps ahead by 40%.'},
  map:{name:'Treasure Map',price:120,cat:'handy',desc:'Marks an X somewhere on your island. Dig there for something rare.'},
  firework:{name:'Firework',price:30,cat:'fun',desc:'Light it and stand back! Best after dark.'},
  skylantern:{name:'Sky Lantern',price:40,cat:'fun',desc:'Let it go and make a wish as it drifts up into the sky.'}});
RECIPES.push(
  // decor you could only buy before
  {out:['b','flowers',2],in:{'m:fiber':3},lvl:1},{out:['b','cattail',2],in:{'m:fiber':2},lvl:1},{out:['b','rock',1],in:{'m:stone':3},lvl:1},
  {out:['b','pine',1],in:{'g:pinecone':2,'m:fiber':1},lvl:1},{out:['b','oak',1],in:{'g:acorn':3,'m:fiber':1},lvl:2},{out:['b','palm',1],in:{'m:wood':4,'g:shell':3},lvl:3},
  {out:['b','mailbox',1],in:{'m:wood':4,'m:stone':1},lvl:1},{out:['b','rug',1],in:{'m:fiber':8,'any:berry':2},lvl:2},{out:['b','parasol',1],in:{'m:wood':3,'m:fiber':6},lvl:2},
  {out:['b','birdbath',1],in:{'m:stone':6},lvl:3},{out:['b','lamppost',1],in:{'m:stone':4,'m:wood':2,'b:firefly':1},lvl:3},{out:['b','picnic',1],in:{'m:wood':6,'m:fiber':4},lvl:3},
  {out:['b','marble',4],in:{'m:stone':6},lvl:4},{out:['b','hextile',4],in:{'m:stone':4},lvl:3},
  {out:['b','sundial',1],in:{'m:stone':8,'g:oldcoin':1},lvl:4},{out:['b','hammock',1],in:{'m:wood':4,'m:fiber':10},lvl:4},{out:['b','arbor',1],in:{'m:wood':8,'m:fiber':6},lvl:4},
  {out:['b','stall',1],in:{'m:wood':12,'m:fiber':6},lvl:4},{out:['b','swing',1],in:{'m:wood':8,'m:fiber':6},lvl:5},{out:['b','fountain',1],in:{'m:stone':20,'g:glass':2},lvl:5},
  {out:['b','clover',1],in:{'g:clover4':3,'m:stone':4},lvl:5},{out:['b','windmill',1],in:{'m:wood':30,'m:stone':20,'m:fiber':10},lvl:6},
  // garden pieces you can make by hand
  {out:['b','logbench',1],in:{'m:wood':6},lvl:1},{out:['b','toadstool',1],in:{'g:mushroom':3,'m:fiber':2},lvl:1},{out:['b','bunting',2],in:{'m:wood':2,'m:fiber':6},lvl:1},
  {out:['b','firepit',1],in:{'m:stone':10,'m:wood':4},lvl:2},{out:['b','snowman',1],in:{'m:stone':2,'m:wood':2,'m:fiber':2},lvl:1},{out:['b','stonelantern',1],in:{'m:stone':12,'b:firefly':1},lvl:2},
  // treats
  {out:['x','jam',1],in:{'any:berry':3},lvl:1},{out:['x','pie',1],in:{'any:fruit':3,'c:wheat':1},lvl:2},{out:['x','stew',1],in:{'g:mushroom':2,'g:acorn':2},lvl:1},
  // handy and fun
  {out:['x','buglure',2],in:{'any:berry':2,'m:fiber':1},lvl:1},{out:['x','fishlure',1],in:{'g:glass':1,'g:shell':2,'m:fiber':1},lvl:2},
  {out:['x','rainstick',1],in:{'m:wood':2,'m:fiber':2,'g:shell':3},lvl:2},{out:['x','suncharm',1],in:{'g:glass':1,'m:stone':2,'m:fiber':1},lvl:2},
  {out:['x','tonic',1],in:{'x:fert':2,'g:clover4':1},lvl:3},{out:['x','fert',2],in:{'m:fiber':5},lvl:1},
  {out:['x','map',1],in:{'g:oldcoin':1,'m:fiber':2},lvl:2},{out:['x','firework',3],in:{'m:fiber':2,'m:stone':1,'g:shell':1},lvl:1},{out:['x','skylantern',2],in:{'m:fiber':3,'b:firefly':1},lvl:2});
const isMat=k=>k.startsWith('m:')||k.startsWith('x:')&&!(CONSUM[k.slice(2)]||{}).sell;

// what the new things do (useItem, 58-crafting, passes them here)
function useMore(k){const id=k.slice(2),C=CONSUM[id],y=villager.position.y;if(!C)return;let ok=true;
  switch(id){
    case'jam':S.buff=S.buff||{};S.buff.tail=S.day;hearts(vil.x,y+1,vil.z);toast('Mmm, berry jam! A spring in your step for the rest of the day.','',ICON['x:jam']);break;
    case'stew':S.buff=S.buff||{};S.buff.friend=S.day;hearts(vil.x,y+1,vil.z);addXP(10);toast('A hearty bowl of stew. Neighbours will warm to you twice as fast today.','',ICON['x:stew']);break;
    case'pie':{let n=0;for(const v of npcs){const d=S.npc[v.i];if(!d)continue;d.f=Math.min(10,(d.f||0)+1);n++;if(v.g&&v.g.visible)hearts(v.x,v.y+1,v.z);}
      if(!n){toast('Nobody lives here to share it with yet. Save it for when you have neighbours (or sell it).','',ICON['x:pie']);ok=false;break;}
      hearts(vil.x,y+1,vil.z);toast(`You share the pie round. All ${n} of your neighbours love it!`,'rare',ICON['x:pie']);break;}
    case'buglure':{if(S.sea||inside){toast('Use it out on the island.');ok=false;break;}for(let i=0;i<4;i++){const a=i*1.57+Math.random();spawnBugAt(vil.x+Math.cos(a)*1.6,vil.z+Math.sin(a)*1.6,i===3);}
      for(let i=0;i<8;i++)sparkle(vil.x,y+0.6,vil.z,0xf6c8a0);toast('A sweet smell drifts out... here they come!','',ICON['x:buglure']);break;}
    case'fishlure':S.lure=(S.lure||0)+5;toast(`Shimmer Lure on! Your next ${S.lure} casts will draw something special.`,'',ICON['x:fishlure']);break;
    case'rainstick':S.wxNext=Object.keys(WX).includes('rain')?'rain':S.wxNext;noise(1.2,0.05,3000,0.5);toast('Shhhh-shhh... the rain stick whispers. Tomorrow it will rain.','',ICON['x:rainstick']);break;
    case'suncharm':S.wxNext='clear';sparkle(vil.x,y+1.2,vil.z,0xfff0a0);toast('The charm catches the light. Tomorrow will be clear and bright.','',ICON['x:suncharm']);break;
    case'tonic':{const ks=Object.keys(S.tiles).filter(q=>S.tiles[q].crop&&S.tiles[q].crop.p<1);if(!ks.length){toast('Nothing is growing right now.');ok=false;break;}
      for(const q of ks){const c=S.tiles[q].crop,s0=stageOf(c.p);c.p=Math.min(0.995,c.p+0.4);if(stageOf(c.p)!==s0)syncCrop(q);const [x,z]=q.split(',').map(Number);sparkle(x,topY(x,z)+0.4,z,0x9af0a8);}
      toast(`Growth Tonic! ${ks.length} crop${ks.length>1?'s':''} shot up.`,'rare',ICON['x:tonic']);break;}
    case'map':if(S.sea||!curIsl()||!curIsl().home){toast('Read it on your own island.');ok=false;break;}buryTreasure();break;
    case'firework':if(S.sea||inside){toast('Light it outside, on dry land.');ok=false;break;}launchFirework(vil.x,vil.z);break;
    case'skylantern':if(inside){toast('Take it outside first.');ok=false;break;}releaseLantern(vil.x,vil.z);toast('You let it go and make a wish...','',ICON['x:skylantern']);break;}
  // (things to watch happen: put the bag away so you can see them)
  if(ok){takeOf(k,1);SFX.pop();if(/^(firework|skylantern|buglure|map)$/.test(id))setTimeout(closeSheet,0);}}

// ---- fireworks: a rocket climbs with a fizzing trail, then bursts into a chrysanthemum of sparks ----
const craftFx=[];
function launchFirework(x,z){const y0=topY(Math.round(x),Math.round(z))+0.3,col=pickR([[0xff6a8a,0xffd0e0],[0x8ad0ff,0xe0f4ff],[0xffe070,0xfff6c8],[0xa8ff9a,0xe8ffe0],[0xd8a0ff,0xf4e0ff]]);
  craftFx.push({k:'rocket',x:x+0.4,z:z+0.3,y:y0,vy:4.6,t:0,col});noise(0.5,0.04,4000,0.6);}
function releaseLantern(x,z){const g=new T.Group();/* a paper lantern: wider at the top, a rounded crown, a little flame showing through the open base */g.add(M([PG(SPH_LO,0xffd090,0xff9a50,0,0.24,0,0,0,0,0.32,0.42,0.32),P(CYL8,0xd8783a,0,0.05,0,0,0,0,0.16,0.03,0.16),P(SPH_XS,0xfff0a0,0,0.05,0,0,0,0,0.08,0.1,0.08)],lumMat));
  const l=new T.PointLight(0xffb060,0.6,4);l.position.y=0.15;g.add(l);g.position.set(x+0.3,villager.position.y+0.9,z+0.3);scene.add(g);craftFx.push({k:'lantern',g,t:0,ph:Math.random()*6});tone(660,0.3,'sine',0.02);}
function updateCraftFx(dt){for(let i=craftFx.length-1;i>=0;i--){const f=craftFx[i];f.t+=dt;
  if(f.k==='rocket'){f.y+=f.vy*dt;f.vy-=3*dt;emit(f.x,f.y,f.z,{vy:-0.4,life:0.5,max:0.5,size:0.06,color:0xffe0a0,g:1});
    if(f.vy<1.5||f.t>1.6){craftFx.splice(i,1);for(let j=0;j<70;j++){const u=Math.random()*6.283,v=Math.acos(Math.random()*2-1),sp=1.9+Math.random()*0.5;
        emit(f.x,f.y,f.z,{vx:Math.sin(v)*Math.cos(u)*sp,vy:Math.cos(v)*sp,vz:Math.sin(v)*Math.sin(u)*sp,life:1.6+Math.random()*0.6,max:2.2,size:0.08,color:j%3?f.col[0]:f.col[1],g:1.2});}
      noise(0.6,0.09,240,0.7);setTimeout(()=>{for(let j=0;j<6;j++)setTimeout(()=>noise(0.05,0.02,5000),j*60);},400);}}
  else if(f.k==='lantern'){const g=f.g;g.position.y+=dt*0.55;g.position.x+=Math.sin(f.t*0.6+f.ph)*dt*0.25+dt*0.12;g.position.z+=Math.cos(f.t*0.5+f.ph)*dt*0.2;g.rotation.y+=dt*0.3;
    if(f.t>22){g.scale.setScalar(Math.max(0.01,1-(f.t-22)/3));if(f.t>25){scene.remove(g);craftFx.splice(i,1);}}}}}

// the Shimmer Lure: called when a cast lands; reels in the rarest of a few rolls
function lureCast(f){if(!(S.lure>0))return null;const riv=f.wy>0;let best=null;
  for(let i=0;i<4;i++){const k=riv?chooseFish((curIsl()||{}).biome,false,true):chooseFish(regionAt(f.px,f.pz),landDist(f.px,f.pz)>2.8);if(k&&(!best||FISH[k].w<FISH[best].w))best=k;}
  if(!best)return null;S.lure--;const a=Math.random()*6.28;spawnShadowAt(f.px+Math.cos(a)*(riv?0.5:1.4),f.pz+Math.sin(a)*(riv?0.5:1.4),best,f.wy||0);
  for(let i=0;i<5;i++)sparkle(f.px,0.2+(f.wy||0),f.pz,0xbff4ff);floatText(f.px,0.8+(f.wy||0),f.pz,'shimmer!'+(S.lure?` (${S.lure} left)`:''),'gold');return shadows[shadows.length-1];}
