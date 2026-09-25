/* =========================================================
   Farming & island actions
   ========================================================= */
function walkTo(x,z){const dx=x-vil.x,dz=z-vil.z,d=Math.hypot(dx,dz)||1;routeVil(x-dx/d*0.62,z-dz/d*0.62);vil.idle=0;vil.cb=null;}
function goTo(x,z,cb){routeVil(x,z);vil.idle=0;vil.cb=cb||null;}
// only rivers block walking (the villager hops up cliffs); detour over a bridge with a small A* when needed
const walkable=(x,z)=>{const t=landMap.get(K(x,z));return t==='grass'||t==='sand'||t==='bridge';};
function lineClear(x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/0.2);for(let i=1;i<=n;i++){if(landMap.get(K(Math.round(x0+(x1-x0)*i/n),Math.round(z0+(z1-z0)*i/n)))==='river')return false;}return true;}
// a tiny binary min-heap keyed on element[3]
function heapPush(h,n){h.push(n);let i=h.length-1;while(i>0){const p=(i-1)>>1;if(h[p][3]<=h[i][3])break;[h[p],h[i]]=[h[i],h[p]];i=p;}}
function heapPop(h){const top=h[0],last=h.pop();if(h.length){h[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<h.length&&h[l][3]<h[m][3])m=l;if(r<h.length&&h[r][3]<h[m][3])m=r;if(m===i)break;[h[m],h[i]]=[h[i],h[m]];i=m;}}return top;}
function landPath(sx,sz,tx,tz,opt={}){const W=(x,z)=>walkable(x,z)&&!(opt.block&&opt.block(x,z)&&!(x===tx&&z===tz));if(!W(tx,tz))return null;const open=[[sx,sz,0,0]],g=new Map([[K(sx,sz),0]]),from=new Map();let it=0;
  while(open.length&&it++<(opt.max||5000)){const [x,z,gc]=heapPop(open);if(gc>g.get(K(x,z)))continue;
    if(x===tx&&z===tz){const p=[[x,z]];let k=K(x,z);while(from.has(k)){const q=from.get(k);p.unshift(q);k=K(q[0],q[1]);}return p;}
    for(const [dx,dz] of opt.four?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,nz=z+dz;if(!W(nx,nz))continue;if(dx&&dz&&(!W(x+dx,z)||!W(x,z+dz)))continue;
      const ng=gc+(dx&&dz?1.414:1)*(opt.cost?opt.cost(nx,nz,x,z):1),k=K(nx,nz);if(g.has(k)&&g.get(k)<=ng)continue;g.set(k,ng);from.set(k,[x,z]);heapPush(open,[nx,nz,ng,ng+Math.hypot(tx-nx,tz-nz)]);}}
  return null;}
function routeVil(tx,tz){vil.path=null;const sx=Math.round(vil.x),sz=Math.round(vil.z);
  if(!S.sea&&walkable(sx,sz)&&riverList.length&&!lineClear(vil.x,vil.z,tx,tz)){const p=landPath(sx,sz,Math.round(tx),Math.round(tz));
    if(p){const all=[...p.slice(1,-1),[tx,tz]],pts=[];let cx=vil.x,cz=vil.z,i=0;
      while(i<all.length){let j=all.length-1;while(j>i&&!lineClear(cx,cz,all[j][0],all[j][1]))j--;pts.push(all[j]);cx=all[j][0];cz=all[j][1];i=j+1;}
      const f=pts.shift();vil.tx=f[0];vil.tz=f[1];vil.path=pts;return;}}
  vil.tx=tx;vil.tz=tz;}
function plant(k,x,z){
  const id=S.seed,info=id==='mystery'?MYSTERY:CROPS[id];
  if(S.free[id]){S.free[id]--;if(!S.free[id])delete S.free[id];}
  else if(S.shells<info.seed){toast(`You need ${info.seed} shells for ${info.name}. Sell something or go exploring.`);SFX.no();return;}
  else S.shells-=info.seed;
  const type=id==='mystery'?pickR(CROP_IDS):id;
  S.tiles[k].crop={t:type,p:0,v:null,m:id==='mystery'?1:0};syncCrop(k);SFX.plant();burst(x,0.6,z,0x6a4a30,6,0.8,0.06);walkTo(x,z);
  if(id==='mystery')floatText(x,1.2,z,'? '+CROPS[type].name);
  if(S.tut===0){S.tut=1;setTimeout(()=>toast(`Seeds only grow on days they're watered — switch to the <b>watering can</b> and tap the soil.`,'',ICON.sprout),600);}
}
function harvest(k,x,z){
  const t=S.tiles[k],c=t.crop,C=CROPS[c.t],V=VAR[c.v||'normal'];const key=c.t+'|'+V.id;
  const first=gain(key);S.harvested++;
  t.crop=null;syncCrop(k);walkTo(x,z);vil.hop=0.3;
  burst(x,0.8,z,C.col,10,1.5,0.08);if(V.id!=='normal')for(let i=0;i<10;i++)sparkle(x,0.8,z,0xfff0a0);
  floatText(x,1.3,z,'+ '+(V.name?V.name+' ':'')+C.name,V.id!=='normal'?'gold':'');
  addXP(Math.max(2,Math.round(C.price*V.mult/8)));
  if(first&&V.id!=='normal'){SFX.rare();toast(`New discovery! <b>${V.name} ${C.name}</b> added to your Islandex.`,'rare',seedIcon(c.t),V.id);}else SFX.harvest();
  checkRow(c.t);
  if(S.tut<2){S.tut=2;setTimeout(()=>toast('Tap the shipping bin by your tent, or open your Bag, to sell.','',ICON.bag),700);
    setTimeout(()=>toast('While crops grow, board your boat at the dock and explore other islands to fill your Islandex!','',ICON.boat),5200);}
}
function checkRow(type){if(S.almR[type])return;if(VARIANTS.every(v=>S.alm[type+'|'+v.id])){S.almR[type]=1;const r=CROPS[type].price*6;S.shells+=r;SFX.level();
  toast(`Crop page complete: ${CROPS[type].name}! Reward +${fmt(r)} shells`,'rare',seedIcon(type),'rainbow');}}

// buildings, the bin and placed decor respond to a tap whatever tool you hold; returns true if it handled the tap
function useFixed(x,z){
  const f=fixedAt(x,z);
  if(f==='bin'){walkTo(x,z);openSheet('bag');return true;}
  if(f==='house'){goTo(HOUSE_AT.x+0.5,HOUSE_AT.z+2.2,()=>enterHouse('home'));return true;}
  if(f&&townTap(f,x,z))return true;
  const o=objAt(x,z);if(o){const B=BUILD[o.k];walkTo(x,z);toast(`<b>${B.name}</b> — ${B.desc}`);return true;}
  return false;}
// the farming actions tools perform (71-tools decides which one a tap means)
function canTill(x,z){const k=K(x,z);return !S.tiles[k]&&landMap.get(k)==='grass'&&!TOWN.path.has(k)&&freeTile(x,z)&&!fixedAt(x,z)&&!objAt(x,z)&&!debrisAt(x,z);}
function tillAt(x,z){if(!canTill(x,z))return false;S.tiles[K(x,z)]={w:S.rain?1:0,crop:null};rebuildSoil();SFX.till();burst(x,0.6,z,0x8a5a3a,8,1.2,0.07);vil.hop=0.25;
  if(!S.tipSeed){S.tipSeed=1;setTimeout(()=>toast('Nice soil! Pick <b>Seeds</b> from your tools and tap it to plant.','',seedIcon(S.seed)),600);}return true;}
function fillAt(x,z){const k=K(x,z),t=S.tiles[k];if(!t||t.crop)return false;delete S.tiles[k];rebuildSoil();noise(0.08,0.04,700);burst(x,0.5,z,0x6ab84a,8,1.0,0.06);return true;}
function waterAt(x,z){const r=S.can?1:0;let n=0;for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const q=S.tiles[K(x+dx,z+dz)];if(q&&!q.w){q.w=1;n++;}}
  for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)for(let i=0;i<5;i++)emit(x+dx+(Math.random()-0.5)*0.5,1.2,z+dz+(Math.random()-0.5)*0.5,{vy:-1,life:0.5,max:0.5,size:0.06,color:0x8ac4ff,g:6});
  SFX.water();if(!n)return false;rebuildSoil();
  if(S.tut===1){S.tut=1.5;setTimeout(()=>toast('Watered soil stays wet until the next dawn. Crops ripen while you explore.','',ICON.sprout),600);}return true;}
function tendAt(x,z){const k=K(x,z),t=S.tiles[k];if(!t||!t.crop)return false;const c=t.crop,C=CROPS[c.t];
  if(c.p>=1){harvest(k,x,z);return true;}
  if(c.td!==S.day){c.td=S.day;const s0=stageOf(c.p);c.p=Math.min(0.995,c.p+0.08);if(stageOf(c.p)!==s0)syncCrop(k);hearts(x,0.9,z);tone(880,0.08,'triangle',0.04);setTimeout(()=>tone(1175,0.1,'triangle',0.035),70);vil.hop=0.25;
    floatText(x,1.2,z,'tended +8%');return true;}
  let hint='';if(C.night&&!isNight())hint=' · blooms only at night';if(C.day&&isNight())hint=' · slow at night';if(!t.w)hint+=' · needs water';
  toast(`${C.name} · ${Math.floor(c.p*100)}% grown · already tended today${hint}`,'',seedIcon(c.t));return true;}
function houseTap(){
  if(S.hour>=19||S.hour<5){setAction(`It's getting late… sleep until morning in your ${HOUSES[S.house].toLowerCase()}?`,[{label:'Sleep',cls:'go',fn:sleep},{label:'Stay up',fn:clearAction}],'Home');}
  else toast(`Your ${HOUSES[S.house].toLowerCase()}.${S.house<3?' Upgrade it in Shop → Island.':' Home sweet villa.'}`);
}
function sleep(){clearAction();$('fade').classList.add('on');
  setTimeout(()=>{const sec=((6.02-S.hour+24)%24)*DAY_LEN/24;const out=simulate(sec);afterSim(out,'While you slept');$('fade').classList.remove('on');},650);}
function afterSim(out,label){rebuildSoil();syncAllCrops();syncLife();for(const isl of islands)if(isl.pgroup)syncPlants(isl);
  if(out.length){const rare=out.filter(c=>c.v!=='normal').length;toast(`${label}: ${out.length} crop${out.length>1?'s':''} ripened${rare?` — ${rare} rare!`:''}`,rare?'rare':'',ICON.sprout);}
  toast(`Day ${S.day}${S.rain?' — rain today':''}. The market wants <b>${CROPS[S.demand].name}</b>.`,'',seedIcon(S.demand));}
function editTap(x,z){
  if(!onHome(x,z))return;
  const f=fixedAt(x,z);if(f){toast(f==='house'?'Your home stays put — upgrade it in Shop → Island.':'The shipping bin stays by your home.');return;}
  const o=objAt(x,z);
  if(o){const B=BUILD[o.k];setAction(`<b>${B.name}</b>`,[
    {label:'Move',cls:'go',fn:()=>{removeObj(o);S.store[o.k]=(S.store[o.k]||0)+1;startPlace(o.k,true,o.r||0);}},
    {label:'Store',fn:()=>{removeObj(o);S.store[o.k]=(S.store[o.k]||0)+1;toast(`${B.name} put in storage. Place it again from the Shop.`);clearAction();}},
    {label:'Cancel',fn:clearAction}]);return;}
  const k=K(x,z),t=S.tiles[k];if(!t)return;
  if(t.crop){const C=CROPS[t.crop.t];setAction(`Dig up this ${C.name}? The seed will be lost.`,[{label:'Dig up',cls:'warn',fn:()=>{t.crop=null;syncCrop(k);SFX.till();burst(x,0.6,z,0x8a5a3a,8);clearAction();}},{label:'Keep',fn:clearAction}]);return;}
  delete S.tiles[k];rebuildSoil();SFX.till();burst(x,0.55,z,0x6aa843,6,1,0.06);
}
function removeObj(o){S.objs=S.objs.filter(q=>q!==o);syncObjs();SFX.place();}

/* =========================================================
   Placement (home island only)
   ========================================================= */
let placing=null,ghost=null;
const ghostMat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.7,depthWrite:false});
function canPlace(x,z){return onHome(x,z)&&isLand(x,z)&&!TOWN.path.has(K(x,z))&&landMap.get(K(x,z))!=='bridge'&&!debrisAt(x,z)&&!S.tiles[K(x,z)]&&!objAt(x,z)&&!fixedAt(x,z)&&!findAt(x,z)&&!weedAt(x,z);}
function nearestValid(x0,z0){let best=null,bd=1e9;for(const [x,z] of [...islands[0].grass,...islands[0].sand]){if(!canPlace(x,z))continue;const d=(x-x0)**2+(z-z0)**2;if(d<bd){bd=d;best=[x,z];}}return best;}
function startPlace(kind,fromStore,rot=0){
  closeSheet();clearAction();
  if(S.sea||!onHome(Math.round(vil.x),Math.round(vil.z))){toast('Decor can only be placed on your home island.');return;}
  const spot=nearestValid(Math.round(vil.x),Math.round(vil.z));
  if(!spot){toast('No free space left — expand your island in Shop → Island.');return;}
  placing={kind,fromStore,rot,x:spot[0],z:spot[1]};
  ghost=objGroup(kind,S.nextId,rot);ghost.traverse(o=>{if(o.isMesh){if(o.userData.noThumb)o.visible=false;else{o.material=ghostMat;o.castShadow=false;}}});
  scene.add(ghost);moveGhost(spot[0],spot[1]);
}
function moveGhost(x,z){if(!placing)return;placing.x=x;placing.z=z;ghost.position.set(x,topY(x,z),z);ghost.rotation.y=placing.rot;
  const ok=canPlace(x,z);ghostMat.color.set(ok?0xffffff:0xff6a5a);cursorAt(x,z,ok?0xfff6e2:0xff6a5a);cursorT=1e9;placeBar();}
function placeBar(){const B=BUILD[placing.kind],n=S.store[placing.kind]||0,ok=canPlace(placing.x,placing.z);
  const cost=placing.fromStore?`from storage (${n} left)`:`${B.cost} shells`;
  const btns=[];if(B.rot)btns.push({label:'Rotate',fn:()=>{placing.rot=(placing.rot+Math.PI/2)%(Math.PI*2);moveGhost(placing.x,placing.z);}});
  btns.push({label:'Place',cls:'go',disabled:!ok||(!placing.fromStore&&S.shells<B.cost),fn:doPlace},{label:'Done',fn:endPlace});
  setAction(`<b>${B.name}</b> · ${cost}<br><small>Tap a tile to move it${ok?'':' — this spot is taken'}</small>`,btns);}
function doPlace(){const B=BUILD[placing.kind];const {x,z}=placing;if(!canPlace(x,z))return;
  if(placing.fromStore){S.store[placing.kind]--;if(!S.store[placing.kind])delete S.store[placing.kind];}
  else{if(S.shells<B.cost){SFX.no();return;}S.shells-=B.cost;}
  S.objs.push({id:S.nextId++,k:placing.kind,x,z,r:placing.rot});syncObjs();SFX.place();burst(x,topY(x,z)+0.2,z,0xf6eedb,12,1.4,0.08);walkTo(x,z);
  if(placing.fromStore?!S.store[placing.kind]:!B.multi){endPlace();toast(`${B.name} placed.`);return;}
  const nxt=nearestValid(x,z);if(nxt)moveGhost(nxt[0],nxt[1]);else endPlace();}
function endPlace(){if(ghost){scene.remove(ghost);ghost=null;}placing=null;cursor.visible=false;cursorT=0;clearAction();}

