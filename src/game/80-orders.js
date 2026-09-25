/* =========================================================
   Daily orders
   ========================================================= */
function cropOrder(id){const C=CROPS[id],n=C.price<60?4:C.price<200?3:2;return{k:'c:'+id,n,reward:Math.round(C.price*n*1.8),xp:Math.round(C.price*n/20)+3};}
function makeOrders(){const lv=level(),un=CROP_IDS.filter(id=>CROPS[id].lvl<=lv);const o=[cropOrder(pickR(un))];
  const bios=new Set(islands.filter(i=>S.disc[i.id]&&!i.home).map(i=>i.biome));
  if(bios.size&&Math.random()<0.55){const k=pickW(PLANTS,k=>PLANTS[k].w>=8&&PLANTS[k].bio.some(b=>bios.has(b)));o.push({k:'p:'+k,n:2,reward:Math.round(PLANTS[k].price*2*2.6+80),xp:12});}
  else if(Math.random()<0.5){let c=pickR(un);if(un.length>1)while('c:'+c===o[0].k)c=pickR(un);o.push(cropOrder(c));}
  else{const k=pickW(FINDS,k=>FINDS[k].w>=7&&FINDS[k].bio.includes('any')),n=FINDS[k].w>=14?3:2;o.push({k:'g:'+k,n,reward:Math.round(FINDS[k].price*n*2.4+40),xp:6});}
  if(Math.random()<0.6){const k=pickW(FISH,k=>FISH[k].w>=6&&!FISH[k].junk&&!FISH[k].rain&&(FISH[k].bio.includes('home')||FISH[k].bio.includes('any')||FISH[k].bio.some(b=>bios.has(b))));o.push({k:'f:'+k,n:1,reward:Math.round(FISH[k].price*2.4+60),xp:10});}
  else{const k=pickW(BUGS,k=>BUGS[k].w>=9&&(BUGS[k].bio.includes('home')||BUGS[k].bio.some(b=>bios.has(b))));o.push({k:'b:'+k,n:1,reward:Math.round(BUGS[k].price*2.4+60),xp:10});}
  S.orders=o;S.ordBonus=0;}
const TAKE_ORDER=['normal','giant','moonlit','golden','crystal','rainbow'];
function orderHave(o){if(o.k.startsWith('c:')){const t=o.k.slice(2);return TAKE_ORDER.reduce((s,v)=>s+(S.inv[t+'|'+v]||0),0);}return S.inv[o.k]||0;}
function take(key,n){S.inv[key]-=n;if(S.inv[key]<=0)delete S.inv[key];}
function deliver(i){const o=S.orders[i];if(!o||o.done||orderHave(o)<o.n)return;let n=o.n;
  if(o.k.startsWith('c:')){const t=o.k.slice(2);for(const v of TAKE_ORDER){const key=t+'|'+v,h=Math.min(n,S.inv[key]||0);if(h){take(key,h);n-=h;}if(!n)break;}}else take(o.k,n);
  o.done=1;S.shells+=o.reward;S.earned+=o.reward;addXP(o.xp);SFX.coin();toast(`Order delivered: +${fmt(o.reward)} shells`,'',ICON.shell);
  if(S.orders.every(q=>q.done)&&!S.ordBonus){S.ordBonus=1;const b=100+level()*60;S.shells+=b;S.free.mystery=(S.free.mystery||0)+1;
    setTimeout(()=>{SFX.level();toast(`All of today's orders done! Bonus +${fmt(b)} shells and a free Mystery Seed.`,'rare',ICON.mystery);},500);}}
function ordersReady(){return S.orders.some(o=>!o.done&&orderHave(o)>=o.n);}

/* =========================================================
   Island life tick
   ========================================================= */
let lifeT=4,bugT=2,crowT=40,slowT=0,shT=1;
function updateLife(dt,tt){
  const isl=curIsl();
  lifeT-=dt;if(lifeT<=0){lifeT=6;if(isl&&Math.random()<0.28)spawnFind(false,isl);if(Math.random()<0.2)spawnWeed();}
  bugT-=dt;if(bugT<=0){bugT=3+Math.random()*4;spawnBug();}
  shT-=dt;if(shT<=0){shT=2+Math.random()*3;spawnShadow();}
  crowT-=dt;if(crowT<=0){crowT=55+Math.random()*50;spawnCrow();}
  for(const f of S.finds)if(Math.random()<dt*0.4&&Math.abs(f.x-vil.x)<30&&Math.abs(f.z-vil.z)<30)sparkle(f.x,topY(f.x,f.z)+0.15,f.z,0xf4f8ff);
  slowT-=dt;if(slowT<=0){slowT=0.5;
    const ep=plantEpoch();
    for(const i of islands){if(i.home)continue;const d=Math.hypot(i.cx-cam.tx,i.cz-cam.tz);const vis=d<120;i.group.visible=vis;
      if(vis&&d<70){if(!i.pgroup||i.pEpoch!==ep)syncPlants(i);}else if(i.pgroup&&d>90){scene.remove(i.pgroup);i.pgroup.traverse(o=>{if(o.geometry)o.geometry.dispose();});i.pgroup=null;}}
    checkDiscovery();const ci=curIsl();if((ci?ci.id:-1)!==ffIsl)placeFireflies(ci);}
  for(const i of islands){if(!i.pgroup)continue;for(const m of i.pgroup.children){const Pd=PLANTS[m.userData.plant.id];if(Pd.w<5&&Math.random()<dt*1.2)sparkle(m.position.x,0.8,m.position.z,0xfff0a0);}
    if(i.vent&&Math.random()<dt*3&&Math.hypot(i.cx-cam.tx,i.cz-cam.tz)<50)emit(i.vent[0]+(Math.random()-0.5)*0.6,i.vent[1],i.vent[2]+(Math.random()-0.5)*0.6,{vy:0.9,vx:0.2,life:3,max:3,size:0.28,color:Math.random()<0.3?0xf06a2a:0x8a8490});}
  updateBugs(dt,tt);updateCrow(dt,tt);updateFishing(dt,tt);updateFlotsam(dt,tt);}

