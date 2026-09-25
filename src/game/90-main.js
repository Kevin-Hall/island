/* =========================================================
   Main loop
   ========================================================= */
let last=performance.now(),tt=0,saveT=0,hudT=0;
function frame(now){
  const dt=Math.min(0.1,(now-last)/1000);last=now;tt+=dt;
  advance(dt*devSpeed);
  rainMix=clamp(rainMix+(S.rain?dt:-dt)*0.5,0,1);
  grassU.uTime.value=tt;riverU.uTime.value=tt;
  {const ci=S.sea?null:curIsl();if(ci&&ci.falls)for(const [x,y,z] of ci.falls){if(Math.random()<dt*3&&Math.abs(x-cam.tx)<16&&Math.abs(z-cam.tz)<16)emit(x+(Math.random()-0.5)*0.8,y+0.05,z+(Math.random()-0.5)*0.3,{vy:0.5+Math.random()*0.5,life:0.6,max:0.6,size:0.07,color:ci.lava?0xffc070:0xf4fbff,g:2});}}grassU.uWind.value=1+rainMix*1.3;grassU.uPl.value.set(vil.x,S.sea?-99:vil.y,vil.z);
  if(!S.sea){
    const dx=vil.tx-vil.x,dz=vil.tz-vil.z,d=Math.hypot(dx,dz);
    if(d>0.04){const sp=Math.min(d,dt*3),nx=vil.x+dx/d*sp,nz=vil.z+dz/d*sp;
      if(landMap.get(K(Math.round(nx),Math.round(nz)))==='river'&&landMap.get(K(Math.round(vil.x),Math.round(vil.z)))!=='river'){vil.tx=vil.x;vil.tz=vil.z;vil.path=null;}
      else{vil.x=nx;vil.z=nz;villager.rotation.y=Math.atan2(dx,dz);}}
    else if(vil.path&&vil.path.length){const p=vil.path.shift();vil.tx=p[0];vil.tz=p[1];}
    else{if(vil.cb){const cb=vil.cb;vil.cb=null;cb();}
      else if(!fishing){vil.idle+=dt;if(vil.idle>7+Math.random()*4){vil.idle=0;const isl=curIsl();if(isl){const tx=Math.round(vil.x+(Math.random()-0.5)*5),tz=Math.round(vil.z+(Math.random()-0.5)*5);
        if(islMap.get(K(tx,tz))===isl.id&&isLand(tx,tz)&&!objAt(tx,tz)&&!fixedAt(tx,tz)&&lineClear(vil.x,vil.z,tx,tz)){vil.tx=tx+(Math.random()-0.5)*0.4;vil.tz=tz+(Math.random()-0.5)*0.4;}}}}}
    if(!S.sea){const ty=surfY(vil.x,vil.z)||0.15;if(ty-vil.y>0.3&&vil.hop<=0)vil.hop=0.4;vil.y=lerp(vil.y,ty,Math.min(1,dt*10));vil.hop=Math.max(0,vil.hop-dt);
      villager.position.set(vil.x,vil.y+(d>0.04?Math.abs(Math.sin(tt*14))*0.07:0)+Math.sin(vil.hop/0.4*Math.PI)*0.3*(vil.hop>0),vil.z);}
  }
  updateBoat(dt,tt);
  if(S.sea){vil.hop=Math.max(0,vil.hop-dt);villager.position.set(vil.x,0.14+Math.sin(tt*1.5)*0.04+Math.sin(vil.hop/0.35*Math.PI)*0.3*(vil.hop>0),vil.z);if(!fishing)villager.rotation.y=S.boat.r;}
  const k=paint?0:Math.min(1,dt*3);cam.tx+=(vil.x-cam.tx)*k;cam.tz+=(vil.z-cam.tz)*k;applyCam();cullIslands(); // hold the view still while drag-farming so tiles stay under the finger
  applyTime();
  water.position.set(Math.round(cam.tx/10)*10,0,Math.round(cam.tz/10)*10);
  scene.fog.near=cam.dist+18-fogBoost*14;scene.fog.far=cam.dist+95-fogBoost*45;
  for(const {g} of cropMeshes.values())g.rotation.z=Math.sin(tt*1.6+g.userData.ph)*0.035;
  for(const {g,v,s} of cropMeshes.values())if(s===3&&v&&v!=='normal'&&Math.random()<dt*1.6)sparkle(g.position.x,0.8,g.position.z,v==='golden'?0xffe27a:v==='crystal'?0xbff4ff:v==='moonlit'?0xc8d4ff:0xffffff);
  rainbowMat.color.setHSL((tt*0.25)%1,0.85,0.6);rainbowMat.emissive.setHSL((tt*0.25)%1,0.9,0.18);
  for(const a of anims)a(tt,dt);
  updateLife(dt,tt);updateAtmos(dt,tt);updateNPCs(dt,tt);updateSeaLife(dt,tt);updateDebris(dt,tt);updateTool(dt);
  if(sprayT>0){sprayT-=dt;for(const o of S.objs)if(o.k==='sprinkler'&&Math.random()<0.8){const a=Math.random()*6.28;emit(o.x,topY(o.x,o.z)+0.4,o.z,{vx:Math.cos(a)*1.6,vy:1.6,vz:Math.sin(a)*1.6,life:0.6,max:0.6,size:0.05,color:0x9ad0ff,g:6});}}
  for(const c of clouds){const u=c.userData;u.ox+=dt*u.sp;const rx=((u.ox-cam.tx)%80+120)%80-40,rz=((u.oz-cam.tz)%80+120)%80-40;c.position.set(cam.tx+rx,11,cam.tz+rz);}
  const day=1-nightF;
  for(const g of gulls){const u=g.userData,a=tt*u.sp+u.ph;g.visible=day>0.3;g.position.set(cam.tx+Math.cos(a)*u.r,u.y+Math.sin(tt*0.7+u.ph)*0.3,cam.tz+Math.sin(a)*u.r*0.8);g.rotation.y=-a;g.rotation.z=0.25;
    const f=Math.sin(tt*7+u.ph)*0.5;u.wl.rotation.z=f;u.wr.rotation.z=-f;}
  updateNpcBoat(dt,tt);
  _e.set(0,cam.yaw,0);_q.setFromEuler(_e);
  for(let i=0;i<GLINTS;i++){const g=glintData[i];const s=Math.pow(Math.max(0,Math.sin(tt*g.sp+g.ph)),6);const gx=cam.tx+((g.x-cam.tx)%70+105)%70-35,gz=cam.tz+((g.z-cam.tz)%70+105)%70-35;
    _m.compose(_v.set(gx,0.02,gz),_q,_s.set(s,1,s));glints.setMatrixAt(i,_m);}
  glints.instanceMatrix.needsUpdate=true;
  if(nightF>0.05&&ffData.length){const pa=ffGeo.attributes.position.array;ffData.forEach((f,i)=>{pa[i*3]=f.x+Math.sin(tt*0.6+f.ph)*0.7;pa[i*3+1]=0.9+Math.sin(tt*1.3+f.ph*2)*0.4;pa[i*3+2]=f.z+Math.cos(tt*0.5+f.ph)*0.7;});ffGeo.attributes.position.needsUpdate=true;}
  fireflies.visible=nightF>0.05&&ffData.length>0;
  rain.visible=rainMix>0.02;rain.material.opacity=0.6*rainMix;
  if(rain.visible){const pa=rainGeo.attributes.position.array;for(let i=0;i<RAIN;i++){const r=rainData[i];r.y-=dt*16;r.x+=dt*2;if(r.y<0){r.y=12+Math.random()*2;r.x=cam.tx+(Math.random()-0.5)*30;r.z=cam.tz+(Math.random()-0.5)*30;}
    pa[i*6]=r.x;pa[i*6+1]=r.y;pa[i*6+2]=r.z;pa[i*6+3]=r.x-0.08;pa[i*6+4]=r.y+0.5;pa[i*6+5]=r.z;}rainGeo.attributes.position.needsUpdate=true;}
  if(cursorT>0){cursorT-=dt;cursor.visible=cursorT>0;cursor.position.y=(topY(Math.round(cursor.position.x),Math.round(cursor.position.z))||0.3)+0.1+Math.abs(Math.sin(tt*5))*0.04;}
  updateParticles(dt);
  hudT-=dt;if(hudT<=0){hudT=0.5;updateHUD();}
  tickShells(dt);
  saveT+=dt;if(saveT>5){saveT=0;save();}
  updateSkyDome();renderer.setRenderTarget(rt);if(inside){updateRoom(dt,tt);renderer.render(roomScene,roomCam);}else{renderer.render(skyScene,post.cam);renderer.autoClear=false;renderer.clearDepth();renderer.render(scene,camera);renderer.autoClear=true;}renderer.setRenderTarget(null);renderer.render(post.scene,post.cam);
  requestAnimationFrame(frame);
}

/* =========================================================
   Boot
   ========================================================= */
$('icoShell').src=ICON.shell;$('icoStar').src=ICON.star;$('icoBag').src=ICON.bag;$('icoShop').src=ICON.shop;$('icoTask').src=ICON.task;$('icoChart').src=ICON.chart;$('icoDex').src=ICON.dex;
genIslands();for(const isl of islands)buildIsland(isl);rebuildSeaGrid();
if(S.wv!==3){if(!isNew){S.sea=false;S.boat=null;S.picked={};vil.x=vil.tx=0.3;vil.z=vil.tz=2.1;}S.wv=3;}
ensureBoat(true);if(S.sea&&isLand(Math.round(S.boat.x),Math.round(S.boat.z))){S.sea=false;S.boat=null;ensureBoat(false);}
if(isNew)setupNew();
const farmNew=!S.farmInit;if(farmNew){genDebris();S.farmInit=1;}
if(isNew||(!S.sea&&!walkable(Math.round(vil.x),Math.round(vil.z)))){vil.x=vil.tx=TOWN.plaza[0]+0.5;vil.z=vil.tz=TOWN.plaza[1]+2.4;}
if(S.sea){vil.x=vil.tx=S.boat.x;vil.z=vil.tz=S.boat.z;}
syncObjs();rebuildSoil();if(!S.orders.length)makeOrders();syncLife();setRod();initNPCs();
let away=[];if(!isNew){const el=clamp((Date.now()-S.t)/1000,0,3*3600);if(el>5)away=simulate(el);}
syncAllCrops();fitZoom();cam.tx=vil.x;cam.tz=vil.z;resize();
try{makeThumbs();}catch(e){console.warn(e);}
renderTools();showHeld();if(!S.tipTools){S.tipTools=1;setTimeout(()=>toast('Tap anywhere to walk. Pick a <b>tool</b> from the bar above the dock, then tap to dig, water, plant, chop, catch bugs or fish.','',ICON.shovel),5000);}shownShells=S.shells;$('shellTxt').textContent=fmt(S.shells);applyTime();updateHUD();
window.addEventListener('resize',()=>{resize();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else{const el=clamp((Date.now()-S.t)/1000,0,3*3600);if(el>5){const out=simulate(el);afterSim(out,'While you were away');}last=performance.now();}});
window.addEventListener('pagehide',save);
$('boot').remove();
if(farmNew)setTimeout(()=>toast('Across the bridge to the west is your farm field, overgrown with weeds, rocks and stumps. Clear it to make room for crops. Tip: press and hold, then drag, to till, plant, water or harvest a whole row.','',ICON.sprout),isNew?9000:1500);
if(isNew){setTimeout(()=>toast('Welcome to Driftseed Isle! Tap soil to plant, and tap ripe crops to harvest.','',ICON.sprout),500);
  setTimeout(()=>toast('Your boat waits at the dock. Sail to other islands to fill your Islandex!','',ICON.boat),4200);}
else if(!S.boatTip)setTimeout(()=>toast('New: your boat waits at the dock! Sail to new islands and fill your Islandex.','',ICON.boat),800);
if(away.length)afterSim(away,'While you were away');
requestAnimationFrame(t=>{last=t;frame(t);});
