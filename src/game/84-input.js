/* =========================================================
   Input: tap, drag-rotate, pinch-zoom (picking honours the world's curve)
   ========================================================= */
const ray=new T.Raycaster(),ndc=new T.Vector2(),_plane=new T.Plane(new T.Vector3(0,1,0),0),_hit=new T.Vector3();
function waterPoint(cx,cy){ndc.set(cx/window.innerWidth*2-1,-(cy/window.innerHeight)*2+1);ray.setFromCamera(ndc,camera);let y=0,p=null;
  for(let i=0;i<5;i++){_plane.constant=-y;if(!ray.ray.intersectPlane(_plane,_hit))return null;p=_hit.clone();y=curveY(p.x,p.z);}return p;}
function pick(cx,cy){
  let best=null,bd=1e9;
  for(const L of landList){const dx=L[0]-cam.tx,dz=L[1]-cam.tz;if(dx*dx+dz*dz>2500)continue;const s=toScreen(L[0],L[4],L[1]);if(s[2]>1)continue;const d=(s[0]-cx)**2+(s[1]-cy)**2;if(d<bd){bd=d;best=L;}}
  let tp=40;if(best){const a=toScreen(best[0],best[4],best[1]),b=toScreen(best[0]+1,best[4],best[1]),c=toScreen(best[0],best[4],best[1]+1);tp=Math.max(Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(a[0]-c[0],a[1]-c[1]),8);}
  const hot=[];for(const o of S.objs){const h=OBJ_H[o.k];if(h)hot.push([o.x,o.z,topY(o.x,o.z)+h*0.6]);}
  hot.push([HOUSE_AT.x,HOUSE_AT.z+1,1.0],[HOUSE_AT.x+1,HOUSE_AT.z+1,1.0]);for(const b of TOWN.bld)if(b.t!=='home')hot.push([b.x,b.z+1,topY(b.x,b.z)+0.9],[b.x+1,b.z+1,topY(b.x,b.z)+0.9]);if(TOWN.board)hot.push([TOWN.board[0],TOWN.board[1],topY(TOWN.board[0],TOWN.board[1])+0.6]);
  let hb=null,hd=Math.max(22,tp*0.5);for(const [x,z,y] of hot){const s=toScreen(x,y,z);const d=Math.hypot(s[0]-cx,s[1]-cy);if(d<hd){hd=d;hb={x,z};}}
  if(hb)return hb;
  let rb=null,rd=1e9;for(const L of riverList){const dx=L[0]-cam.tx,dz=L[1]-cam.tz;if(dx*dx+dz*dz>2500)continue;const s=toScreen(L[0],L[2],L[1]);if(s[2]>1)continue;const d=(s[0]-cx)**2+(s[1]-cy)**2;if(d<rd){rd=d;rb=L;}}
  if(rb&&rd<bd&&Math.sqrt(rd)<tp*0.8)return{x:rb[0],z:rb[1],river:true};
  if(best&&Math.sqrt(bd)<tp*0.8)return{x:best[0],z:best[1]};
  return null;}
function onTap(cx,cy){
  if(inside){if(!$('actionBar').hidden&&!$('actionBar').classList.contains('tapnext')){clearAction();return;}roomTap(cx,cy);return;}
  if(shoot&&!shoot.wished){makeWish();return;}
  if(caught){dismissCatch();return;}
  if(fishing){reel();return;}
  if(!S.sea&&S.boat&&!placing){const s=toScreen(S.boat.x,0.4,S.boat.z);if(Math.hypot(s[0]-cx,s[1]-cy)<40){boardBoat();return;}}
  const hit=pick(cx,cy);
  if(placing){if(hit)moveGhost(hit.x,hit.z);return;}
  if(S.sea){clearAction();
    {const fl=floaterAt(cx,cy);if(fl){sailTo(fl.x,fl.z,null,'');return;}}
    if(hit){const isl=islandAt(hit.x,hit.z);if(isl){cursorAt(hit.x,hit.z);if(landDist(S.boat.x,S.boat.z,isl)<2.4)disembark(isl.id);
        else{const d=Math.hypot(hit.x-S.boat.x,hit.z-S.boat.z)||1,ux=(S.boat.x-hit.x)/d,uz=(S.boat.z-hit.z)/d;sailTo(hit.x+ux*1.2,hit.z+uz*1.2,isl.id,isl.home?'Home':(S.disc[isl.id]?isl.name:''));}}}
    else{const w=waterPoint(cx,cy);if(w)sailTo(w.x,w.z,null,'');}
    return;}
  if(tapLife(cx,cy)){clearAction();updateHUD();return;}
  if(hit&&hit.river){clearAction();const ri=islandAt(hit.x,hit.z),here0=curIsl();if(!ri||!here0||ri.id!==here0.id)return;
    if(ri.lava){toast('That lava is far too hot to fish in!');return;}startFishing(hit.x,hit.z);return;}
  if(!hit){clearAction();const w=waterPoint(cx,cy);if(w&&!isLand(Math.round(w.x),Math.round(w.z)))startFishing(w.x,w.z);return;}
  if(!$('actionBar').hidden)clearAction();
  const here=curIsl(),there=islandAt(hit.x,hit.z);
  if(here&&there&&here.id!==there.id){toast(`That's ${S.disc[there.id]?there.name:'another island'} — take your boat to get there.`);return;}
  cursorAt(hit.x,hit.z);
  {const db=there&&there.home&&S.mode!=='edit'?debrisAt(hit.x,hit.z):null;if(db){hitDebris(db);updateHUD();return;}const wd=weedAt(hit.x,hit.z);if(wd){pullWeed(wd);updateHUD();return;}const fd=findAt(hit.x,hit.z);if(fd){collectFind(fd);updateHUD();return;}const pl=plantAt(hit.x,hit.z);if(pl){pickPlant(pl);updateHUD();return;}}
  if(there&&!there.home){goTo(hit.x,hit.z);return;}
  if(S.mode==='edit')editTap(hit.x,hit.z);else farmTap(hit.x,hit.z);
  updateHUD();}
function tapLife(cx,cy){
  {let bn=null,bd=48;for(const n of npcs){if(!n.g.visible)continue;const s=toScreen(n.x,n.y+0.5,n.z);const d=Math.hypot(s[0]-cx,s[1]-cy);if(d<bd){bd=d;bn=n;}}if(bn){talkTo(bn);return true;}}
  if(crow&&crow.state!=='out'){const s=toScreen(crowG.position.x,crowG.position.y+0.15,crowG.position.z);if(Math.hypot(s[0]-cx,s[1]-cy)<50){shooCrow();return true;}}
  let best=null,bd=46;for(const b of bugs){if(b.out)continue;const s=toScreen(b.g.position.x,b.g.position.y,b.g.position.z);const d=Math.hypot(s[0]-cx,s[1]-cy);if(d<bd){bd=d;best=b;}}
  if(best){catchBug(best);return true;}return false;}
const ptrs=new Map();let drag=null,pinch=null,paint=null,holdT=null;
function paintMode(x,z){if(!onHome(x,z))return null;if(debrisAt(x,z))return'clear';if(fixedAt(x,z)||objAt(x,z))return null;
  const t=S.tiles[K(x,z)];if(!t)return landMap.get(K(x,z))==='grass'&&!TOWN.path.has(K(x,z))?'till':null;if(!t.crop)return'plant';if(t.crop.p>=1)return'harvest';return t.w?'tend':'water';}
const PAINT_LBL={till:'Tilling',plant:'Planting',water:'Watering',harvest:'Harvesting',tend:'Tending',clear:'Clearing'};
function paintAt(x,z){const k=K(x,z);if(!paint||paint.stop||paint.done.has(k)||!onHome(x,z))return;paint.done.add(k);const t=S.tiles[k];let did=false;
  switch(paint.mode){
    case'till':if(!t&&landMap.get(k)==='grass'&&freeTile(x,z)&&!fixedAt(x,z)){S.tiles[k]={w:S.rain?1:0,crop:null};burst(x,0.6,z,0x8a5a3a,6,1.1,0.06);SFX.till();paint.soil=did=true;}break;
    case'plant':if(t&&!t.crop){const sh=S.shells,fr=S.free[S.seed];plant(k,x,z);did=!!t.crop;if(!did)paint.stop=true;}break;
    case'water':if(t&&!t.w){t.w=1;for(let i=0;i<5;i++)emit(x+(Math.random()-0.5)*0.5,1.2,z+(Math.random()-0.5)*0.5,{vy:-1,life:0.5,max:0.5,size:0.06,color:0x8ac4ff,g:6});if(paint.n%3===0)SFX.water();paint.soil=did=true;}break;
    case'harvest':if(t&&t.crop&&t.crop.p>=1){harvest(k,x,z);did=true;}break;
    case'tend':if(t&&t.crop&&t.crop.p<1&&t.crop.td!==S.day){const c=t.crop,s0=stageOf(c.p);c.td=S.day;c.p=Math.min(0.995,c.p+0.08);if(stageOf(c.p)!==s0)syncCrop(k);hearts(x,0.9,z);tone(880+paint.n*40,0.06,'triangle',0.03);did=true;}break;
    case'clear':{const d=debrisAt(x,z);if(d){hitDebris(d);did=true;}break;}}
  if(did){paint.n++;cursorAt(x,z);walkTo(x,z);if(paint.soil){rebuildSoil();paint.soil=false;}}}
function endPaint(){if(!paint)return;const n=paint.n,m=paint.mode;paint=null;clearAction();updateHUD();if(n>1)floatText(vil.x,1.3,vil.z,PAINT_LBL[m]+' ×'+n);}
function pinchDist(){const [a,b]=[...ptrs.values()];return Math.hypot(a.x-b.x,a.y-b.y)||1;}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===1){drag={sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY,moved:false};clearTimeout(holdT);
    if(!inside&&!S.sea&&!placing&&!fishing&&!caught&&S.mode!=='edit'){const x0=e.clientX,y0=e.clientY;
      holdT=setTimeout(()=>{if(!drag||drag.moved||ptrs.size!==1)return;const hit=pick(x0,y0);if(!hit)return;const mode=paintMode(hit.x,hit.z);if(!mode)return;
        paint={mode,done:new Set(),n:0};drag.moved=true;drag.paint=true;SFX.ui();setAction(`<b>${PAINT_LBL[mode]}…</b> keep your finger down and drag across tiles`,[],'Farming');paintAt(hit.x,hit.z);},300);}}
  else if(ptrs.size===2){clearTimeout(holdT);if(paint)endPaint();if(drag)drag.moved=true;pinch={d0:pinchDist(),z0:cam.dist};}
  if(!AC||!waves){ac();if(S.sound)startWaves();}});
canvas.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2&&pinch){cam.dist=clamp(pinch.z0*pinch.d0/pinchDist(),8,60);return;}
  if(paint&&ptrs.size===1){const hit=pick(e.clientX,e.clientY);if(hit)paintAt(hit.x,hit.z);return;}
  if(ptrs.size===1&&drag){const dx=e.clientX-drag.lx,dy=e.clientY-drag.ly;drag.lx=e.clientX;drag.ly=e.clientY;
    if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>9)drag.moved=true;
    if(drag.moved&&!inside){cam.yaw-=dx*0.009;cam.pitch=clamp(cam.pitch+dy*0.005,0.35,1.2);}}});
function endPtr(e){if(!ptrs.has(e.pointerId))return;const wasOne=ptrs.size===1;ptrs.delete(e.pointerId);clearTimeout(holdT);if(paint&&ptrs.size===0)endPaint();
  if(wasOne&&drag&&!drag.moved&&e.type==='pointerup')onTap(e.clientX,e.clientY);
  if(ptrs.size<2)pinch=null;if(ptrs.size===1){const p=[...ptrs.values()][0];drag={sx:p.x,sy:p.y,lx:p.x,ly:p.y,moved:true};}if(ptrs.size===0)drag=null;}
canvas.addEventListener('pointerup',endPtr);canvas.addEventListener('pointercancel',endPtr);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=>{e.preventDefault();cam.dist=clamp(cam.dist*(1+e.deltaY*0.001),8,60);},{passive:false});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(placing)endPlace();else if(sheet)closeSheet();else clearAction();}});

