/* =========================================================
   Sailing
   ========================================================= */
function boatNear(){if(S.sea||!S.boat)return false;return Math.hypot(vil.x-S.boat.x,vil.z-S.boat.z)<8;}
function boardBoat(then){if(S.sea)return;const b=S.boat,isl=curIsl();if(!isl)return;
  let best=null,bd=1e9;for(const [x,z] of [...isl.grass,...isl.sand]){const d=(x-b.x)**2+(z-b.z)**2;if(d<bd){bd=d;best=[x,z];}}
  if(!best||bd>16){toast(isl.home?'Your boat is moored elsewhere.':'Your boat is moored on another shore.');return;}
  if(fishing)endFishing();clearAction();
  goTo(best[0],best[1],()=>{S.sea=true;vil.hop=0.35;SFX.splash();burst(b.x,0.2,b.z,0xe8f4ff,10,1.2,0.07,4);ctxSig='';updateHUD();
    if(!S.boatTip){S.boatTip=1;toast('Tap the sea to sail. Tap an island to go ashore. Open the Chart to find your way.','',ICON.chart);}
    if(then)then();});}
// ---- sea pathfinding (A* over the tile grid, keeping a one-tile margin from every shore) ----
let seaMargin=new Set();
function rebuildSeaGrid(){seaMargin=new Set();for(const L of landList)for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)seaMargin.add(K(L[0]+dx,L[1]+dz));}
// boats may not enter land or rivers (rivers cross islands, so treating them as sea opened shortcuts through the town)
function seaBlocked(x,z){const t=landMap.get(K(x,z));return isLandT(t)||t==='river';}
function planPath(sx,sz,tx,tz){
  let gx=Math.round(tx),gz=Math.round(tz);
  if(seaBlocked(gx,gz)){let f=null;for(let r=1;r<6&&!f;r++)for(let dx=-r;dx<=r&&!f;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;if(!seaBlocked(gx+dx,gz+dz)){f=[gx+dx,gz+dz];break;}}if(!f)return null;[gx,gz]=f;}
  const x0=Math.round(sx),z0=Math.round(sz),hh=(x,z)=>{const dx=Math.abs(x-gx),dz=Math.abs(z-gz);return Math.max(dx,dz)+0.414*Math.min(dx,dz);};
  const heap=[],push=n=>{heap.push(n);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p].f<=heap[i].f)break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}},
    pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<heap.length&&heap[l].f<heap[m].f)m=l;if(r<heap.length&&heap[r].f<heap[m].f)m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
  const gs=new Map(),came=new Map(),sk=K(x0,z0);gs.set(sk,0);push({x:x0,z:z0,f:hh(x0,z0)});let n=0,found=false;
  while(heap.length&&n<60000){const c=pop(),ck=K(c.x,c.z);n++;if(c.x===gx&&c.z===gz){found=true;break;}const cg=gs.get(ck);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(!dx&&!dz)continue;const nx=c.x+dx,nz=c.z+dz;if(Math.abs(nx)>300||Math.abs(nz)>300)continue;if(seaBlocked(nx,nz))continue;
      if(dx&&dz&&(seaBlocked(c.x+dx,c.z)||seaBlocked(c.x,c.z+dz)))continue;
      const nk=K(nx,nz),cost=(dx&&dz?1.414:1)*(seaMargin.has(nk)?4:1),ng=cg+cost;if(ng<(gs.get(nk)??1e9)){gs.set(nk,ng);came.set(nk,ck);push({x:nx,z:nz,f:ng+hh(nx,nz)});}}}
  if(!found)return null;
  const cells=[];let k=K(gx,gz);while(k){const [x,z]=k.split(',').map(Number);cells.push([x,z]);k=came.get(k);}cells.reverse();
  const clear=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(d/0.35);for(let i=1;i<n;i++){const t=i/n,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t);if(seaBlocked(Math.round(x),Math.round(z))||(seaMargin.has(K(Math.round(x),Math.round(z)))&&!seaMargin.has(K(Math.round(a[0]),Math.round(a[1])))&&!seaMargin.has(K(Math.round(b[0]),Math.round(b[1])))))return false;}return true;};
  const out=[];let cur=[sx,sz],i=0;
  while(i<cells.length-1){let j=cells.length-1;while(j>i+1&&!clear(cur,cells[j]))j--;out.push(cells[j]);cur=cells[j];i=j;}
  out.push([tx,tz]);return out;}
function sailTo(x,z,land,name){const b=S.boat;const path=planPath(b.x,b.z,x,z)||[[x,z]];
  sail={dx:x,dz:z,land:land===undefined?null:land,name:name||'',path,idx:0,chk:0,lx:b.x,lz:b.z,replans:0};ctxSig='';updateCtx();}

const floaters=[];let floatT=6;
function floaterModel(k){const p=[];
  if(k==='crate'){p.push(P(BOX,0xa87444,0,0,0,0,0,0,0.5,0.4,0.5));for(const y of [-0.12,0.12])p.push(P(BOX,0x7a5230,0,y,0,0,0,0,0.52,0.06,0.52));p.push(P(BOX,0x7a5230,0,0,0,0,0,0.78,0.06,0.62,0.52));}
  else if(k==='bottle'){p.push(P(CYL12,0x7ac8a8,0,0,0,0,0,1.57,0.14,0.36,0.14),P(CYL12,0x7ac8a8,0.24,0,0,0,0,1.57,0.06,0.12,0.06),P(CYL12,0x9a6a3a,0.32,0,0,0,0,1.57,0.05,0.06,0.05),P(BOX,0xf6ecd0,0,0,0,0,0,0,0.2,0.06,0.07));}
  else{p.push(P(CYL12,0x8a6a44,0,0,0,0,0.3,1.57,0.16,0.9,0.16),P(CYL12,0xd8b078,0.45,0,0,0,0.3,1.57,0.14,0.02,0.14),P(CYL6,0x7a5a3a,0.1,0.08,0.1,0.6,0.3,0.4,0.04,0.3,0.04));lf(p,0x5aa050,-0.2,0.08,0,0.4,0.2,0.16,0.1);}
  const g=new T.Group();g.add(M(p));return g;}
function floaterAt(cx,cy){for(const f of floaters){const s=toScreen(f.x,0.1,f.z);if(Math.hypot(s[0]-cx,s[1]-cy)<44)return f;}return null;}
function collectFloater(f){scene.remove(f.g);floaters.splice(floaters.indexOf(f),1);SFX.splash();burst(f.x,0.2,f.z,0xbfe4ff,10,1.4,0.06);
  if(f.k==='bottle'){openBottle();return;}
  if(f.k==='drift'){const n=2+Math.floor(Math.random()*2);gain('m:wood',n);floatText(f.x,0.9,f.z,'+'+n+' Wood (driftwood)','gold');SFX.pop();return;}
  const r=Math.random();if(r<0.45){const n=40+Math.floor(Math.random()*120);S.shells+=n;floatText(f.x,0.9,f.z,'+'+n+' shells','gold');SFX.coin();}
  else if(r<0.75){const id=pickR(CROP_IDS.filter(i=>CROPS[i].lvl<=level()));S.free[id]=(S.free[id]||0)+2;floatText(f.x,0.9,f.z,'+2 '+CROPS[id].name+' seeds','gold');SFX.pop();}
  else{gain('m:stone',2);gain('m:fiber',2);floatText(f.x,0.9,f.z,'+2 Stone · +2 Fiber','gold');SFX.pop();}
  addXP(2);updateHUD();}
const dolphins=[];let dolph=null,dolphT=18;
for(let i=0;i<2;i++){const g=new T.Group();g.add(M([P(ICO2,0x6a8ab0,0,0,0,0,0,0,0.26,0.24,0.8),P(ICO2,0xe4ecf4,0,-0.06,0.04,0,0,0,0.2,0.14,0.64),P(ICO2,0x6a8ab0,0,-0.02,0.42,0,0,0,0.1,0.09,0.2),
  P(CONE4,0x5a7aa0,0,0.16,-0.05,-0.5,Math.PI/4,0,0.12,0.2,0.05),P(BOX,0x5a7aa0,0,0,-0.42,0,0,0,0.4,0.03,0.12),P(ICO2,0x1a1420,0.1,0.04,0.28,0,0,0,0.03,0.03,0.03),P(ICO2,0x1a1420,-0.1,0.04,0.28,0,0,0,0.03,0.03,0.03)]));
  g.visible=false;scene.add(g);dolphins.push(g);}
function updateSeaLife(dt,tt){
  const b=S.boat;
  if(S.sea&&b&&sail){floatT-=dt;if(floatT<=0&&floaters.length<4){floatT=8+Math.random()*9;
      for(let t=0;t<6;t++){const a=b.r+(Math.random()-0.5)*1.3,d=8+Math.random()*7,x=b.x+Math.sin(a)*d,z=b.z+Math.cos(a)*d;
        if(seaMargin.has(K(Math.round(x),Math.round(z))))continue;const r=Math.random(),k=r<0.2?'bottle':r<0.55?'crate':'drift';const g=floaterModel(k);scene.add(g);floaters.push({k,x,z,g,ph:Math.random()*6});break;}}
    dolphT-=dt;if(dolphT<=0&&!dolph){dolphT=22+Math.random()*20;dolph={t:0,side:Math.random()<0.5?-1:1};}}
  for(const f of [...floaters]){f.g.position.set(f.x,0.04+Math.sin(tt*2+f.ph)*0.04,f.z);f.g.rotation.set(Math.sin(tt*1.3+f.ph)*0.12,f.ph+tt*0.2,Math.cos(tt*1.1+f.ph)*0.1);
    if(Math.random()<dt*1.5)emit(f.x+(Math.random()-0.5)*0.6,0.03,f.z+(Math.random()-0.5)*0.6,{vy:0.1,life:0.6,max:0.6,size:0.05,color:0xf4fbff});
    if(S.sea&&b&&Math.hypot(b.x-f.x,b.z-f.z)<1.3)collectFloater(f);else if(Math.hypot(f.x-cam.tx,f.z-cam.tz)>45){scene.remove(f.g);floaters.splice(floaters.indexOf(f),1);}}
  if(dolph&&b){dolph.t+=dt;const T2=3.2,fx=Math.sin(b.r),fz=Math.cos(b.r),rx=fz*dolph.side,rz=-fx*dolph.side;
    dolphins.forEach((g,i)=>{const t=dolph.t-i*0.35,ph=(t%1.3)/1.3,leap=Math.sin(ph*Math.PI);const along=-1.5+t*1.4+i*0.5,off=1.7+i*0.55;
      g.visible=t>0&&t<T2&&leap>0.05;g.position.set(b.x+fx*along+rx*off,-0.25+leap*0.95,b.z+fz*along+rz*off);g.rotation.set(-Math.cos(ph*Math.PI)*0.9,b.r,0);
      if(t>0&&t<T2&&(ph<0.04||ph>0.96)&&Math.random()<0.5)burst(g.position.x,0.05,g.position.z,0xe4f4ff,5,1.1,0.06,6);});
    if(dolph.t>T2+0.4){dolph=null;dolphins.forEach(g=>g.visible=false);}}}
// instant travel to an island you've already found: the boat drops you off on its near shore
function fastTravel(isl){sail=null;$('fade').classList.add('on');SFX.horn();
  setTimeout(()=>{let bx,bz;
    if(isl.home){bx=DOCK.x+1.05;bz=isl.dockZ+2.4;}
    else{const L=Math.hypot(isl.cx,isl.cz)||1,ux=-isl.cx/L,uz=-isl.cz/L;let best=null,bs=-1e9;for(const [x,z] of isl.sand){const q=(x-isl.cx)*ux+(z-isl.cz)*uz;if(q>bs){bs=q;best=[x,z];}}
      if(!best)best=isl.grass[0];bx=best[0];bz=best[1];for(let i=0;i<16;i++){bx+=ux*0.5;bz+=uz*0.5;if(!seaMargin.has(K(Math.round(bx),Math.round(bz))))break;}}
    for(const f of floaters)scene.remove(f.g);floaters.length=0;
    S.boat={x:bx,z:bz,r:Math.atan2(isl.cx-bx,isl.cz-bz)};S.sea=true;vil.x=vil.tx=bx;vil.z=vil.tz=bz;
    disembark(isl.id);cam.tx=vil.x;cam.tz=vil.z;ctxSig='';updateCtx();updateHUD();save();
    setTimeout(()=>$('fade').classList.remove('on'),180);},650);}
function sailHome(){const isl=islands[0];sailTo(DOCK.x+1.05,isl.dockZ+2.4,0,'Home');}
function sailToIsland(isl){if(!S.sea){boardBoat(()=>sailToIsland(isl));return;}
  let best=null,bd=1e9;for(const [x,z] of [...isl.sand,...isl.grass]){const d=(x-S.boat.x)**2+(z-S.boat.z)**2;if(d<bd){bd=d;best=[x,z];}}
  if(!best)return;const d=Math.sqrt(bd)||1,ux=(S.boat.x-best[0])/d,uz=(S.boat.z-best[1])/d;
  sailTo(best[0]+ux*1.3,best[1]+uz*1.3,isl.id,isl.home?'Home':isl.name);}
function disembark(islId){const isl=islands[islId];if(!isl)return false;const b=S.boat;
  let best=null,bd=1e9;for(const [x,z] of [...isl.sand,...isl.grass]){const d=(x-b.x)**2+(z-b.z)**2;if(d<bd){bd=d;best=[x,z];}}
  if(!best||bd>10.5){toast('Sail a little closer to the shore.');return false;}
  sail=null;S.sea=false;vil.hop=0.4;vil.y=0.15;SFX.splash();goTo(best[0],best[1]);ctxSig='';
  if(!isl.home){if(!S.disc[isl.id]||!(S.log||[]).some(e=>e.t==='island'&&e.name===isl.name))logEvent('island',{name:isl.name});S.disc[isl.id]=1;toast(`Welcome to <b>${isl.name}</b>. Look for wild plants, bugs and shells, and fish from the shore.`,'',ICON.boat);}
  updateHUD();return true;}
const blockedAt=(x,z)=>seaBlocked(Math.round(x),Math.round(z));
function updateBoat(dt,tt){
  const b=S.boat;if(!b)return;
  if(S.sea&&sail){
    let wp=sail.path[Math.min(sail.idx,sail.path.length-1)];
    if(sail.idx<sail.path.length-1&&Math.hypot(wp[0]-b.x,wp[1]-b.z)<0.9){sail.idx++;wp=sail.path[sail.idx];}
    const dx=wp[0]-b.x,dz=wp[1]-b.z,d=Math.hypot(dx,dz),fin=sail.idx>=sail.path.length-1;
    const want=Math.atan2(dx,dz);let head=null;
    for(const off of [0,0.3,-0.3,0.6,-0.6,1,-1,1.4,-1.4,1.9,-1.9]){const h=want+off;if(!blockedAt(b.x+Math.sin(h)*1.1,b.z+Math.cos(h)*1.1)&&!blockedAt(b.x+Math.sin(h)*0.6,b.z+Math.cos(h)*0.6)){head=h;break;}}
    const nearLand=sail.land!==null&&landDist(b.x,b.z,islands[sail.land])<2.4;
    // stuck check: replan if we barely moved in 2 seconds
    sail.chk+=dt;if(sail.chk>2){const moved=Math.hypot(b.x-sail.lx,b.z-sail.lz);sail.chk=0;sail.lx=b.x;sail.lz=b.z;
      if(moved<0.5&&!nearLand){if(sail.replans++<3){const p=planPath(b.x,b.z,sail.dx,sail.dz);if(p){sail.path=p;sail.idx=0;}}else head=null;}}
    if((fin&&d<0.5)||head===null||nearLand){const tgt=sail.land;sail=null;ctxSig='';if(tgt!==null)disembark(tgt);updateCtx();}
    else{b.r+=angDiff(b.r,head)*Math.min(1,dt*3.5);const sp=fin?Math.min(7.5,1.5+d*1.5):7.5;
      const nx=b.x+Math.sin(b.r)*sp*dt,nz=b.z+Math.cos(b.r)*sp*dt;if(!blockedAt(nx+Math.sin(b.r)*0.5,nz+Math.cos(b.r)*0.5)){b.x=nx;b.z=nz;}
      if(Math.random()<dt*14)emit(b.x-Math.sin(b.r)*0.7+(Math.random()-0.5)*0.3,0.03,b.z-Math.cos(b.r)*0.7+(Math.random()-0.5)*0.3,{life:1.6,max:1.6,size:0.13,color:0xe8f0ff});}
  }
  boatMesh.position.set(b.x,Math.sin(tt*1.5)*0.04,b.z);boatMesh.rotation.y=b.r;boatMesh.rotation.z=Math.sin(tt*1.1)*0.05;
  if(S.sea){vil.x=vil.tx=b.x-Math.sin(b.r)*0.15;vil.z=vil.tz=b.z-Math.cos(b.r)*0.15;}
}
const flots=[];
function updateFlotsam(dt,tt){
  if(S.sea&&flots.length<3&&Math.random()<dt*0.12){const a=Math.random()*6.283,r=12+Math.random()*18,x=S.boat.x+Math.sin(a)*r,z=S.boat.z+Math.cos(a)*r;
    if(!landMap.has(K(Math.round(x),Math.round(z)))){const k=Math.random()<0.65?'crate':'bottle';const g=findGroup(k);g.position.set(x,0,z);scene.add(g);flots.push({k,g,x,z,ph:Math.random()*6});}}
  for(let i=flots.length-1;i>=0;i--){const f=flots[i];f.g.position.y=Math.sin(tt*1.6+f.ph)*0.05-0.05;f.g.rotation.y+=dt*0.2;if(Math.random()<dt*0.7)sparkle(f.x,0.2,f.z,0xffffff);
    const d=Math.hypot(f.x-vil.x,f.z-vil.z);
    if(S.sea&&d<1.5){scene.remove(f.g);flots.splice(i,1);SFX.splash();burst(f.x,0.2,f.z,0xe8f4ff,10,1.2,0.07,4);
      if(f.k==='bottle'){const first=!S.alm['g:bottle'];S.alm['g:bottle']=(S.alm['g:bottle']||0)+1;if(first)setTimeout(()=>checkDex('g:bottle'),600);openBottle();}
      else{const r=Math.random();if(r<0.5){const n=40+Math.floor(Math.random()*120);S.shells+=n;floatText(f.x,0.8,f.z,'+'+n+' shells','gold');SFX.coin();}
        else if(r<0.8){const id=pickR(CROP_IDS.filter(i=>CROPS[i].lvl<=level()));S.free[id]=(S.free[id]||0)+2;floatText(f.x,0.8,f.z,'+2 '+CROPS[id].name+' seeds','gold');SFX.pop();}
        else{const k=pickW(FINDS,k=>['glass','pearl','drift','fossil','amber'].includes(k));const first=gain('g:'+k);floatText(f.x,0.8,f.z,'+ '+FINDS[k].name,'gold');SFX.harvest();if(first)toast(`New in your Islandex: <b>${FINDS[k].name}</b>`,'',ICON['g:'+k]);}}}
    else if(d>70){scene.remove(f.g);flots.splice(i,1);}}}
function checkDiscovery(){const x=vil.x,z=vil.z;for(const isl of islands){if(S.disc[isl.id])continue;if(Math.hypot(x-isl.cx,z-isl.cz)<isl.r/0.7+16){S.disc[isl.id]=1;SFX.discover();
  toast(`Discovered <b>${isl.name}</b> — a ${BIOMES[isl.biome].name.toLowerCase()} island!`,'rare',ICON.chart);addXP(20);}}}


// ---- the villager sailboat: loops a sea route planned around the home island and farm field (never through land) ----
const npcRoute={pts:null,len:[],total:0,d:0};
function seaNear(x,z){if(!seaBlocked(x,z)&&!seaMargin.has(K(x,z)))return[x,z];for(let r=1;r<12;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;if(!seaBlocked(x+dx,z+dz)&&!seaMargin.has(K(x+dx,z+dz)))return[x+dx,z+dz];}return null;}
function buildNpcRoute(){const b=islands[0].bc||{x:0,z:0,r:30},R=b.r+6;
  let corners=[[1,-1],[1,1],[-1,1],[-1,-1]].map(([sx,sz])=>seaNear(Math.round(b.x+sx*R),Math.round(b.z+sz*R*0.8))).filter(Boolean);
  let legs=null;for(let tries=0;tries<3&&corners.length>=2&&!legs;tries++){legs=[];for(let i=0;i<corners.length;i++){const a=corners[i],c=corners[(i+1)%corners.length],p=planPath(a[0],a[1],c[0],c[1]);if(!p){corners.splice((i+1)%corners.length,1);legs=null;break;}legs.push(p);}}
  if(!legs)return;const out=[corners[0]];for(const p of legs)out.push(...p);out.pop();/* planPath omits its start, so seed with corner 0; the last leg ends back there, so the loop closes along a planned leg */
  if(out.length<4)return;npcRoute.pts=out;npcRoute.len=[0];for(let i=1;i<out.length;i++)npcRoute.len.push(npcRoute.len[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));
  npcRoute.total=npcRoute.len[npcRoute.len.length-1]+Math.hypot(out[0][0]-out[out.length-1][0],out[0][1]-out[out.length-1][1]);}
function updateNpcBoat(dt,tt){if(!npcRoute.pts){buildNpcRoute();if(!npcRoute.pts){npcBoat.visible=false;return;}}
  const R=npcRoute;R.d=(R.d+dt*1.6)%R.total;let i=R.len.findIndex(l=>l>R.d)-1;if(i<0)i=R.len[R.len.length-1]<=R.d?R.pts.length-1:0;
  const a=R.pts[i],b=R.pts[(i+1)%R.pts.length],seg=Math.hypot(b[0]-a[0],b[1]-a[1])||1,u=clamp((R.d-R.len[i])/seg,0,1);
  const x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u,h=Math.atan2(b[0]-a[0],b[1]-a[1]);
  npcBoat.visible=true;npcBoat.position.set(x,Math.sin(tt*1.3)*0.03,z);npcBoat.rotation.y+=angDiff(npcBoat.rotation.y,h)*Math.min(1,dt*1.5);npcBoat.rotation.z=Math.sin(tt*0.9)*0.04;
  if(Math.random()<dt*9&&Math.hypot(x-cam.tx,z-cam.tz)<50)emit(x-Math.sin(npcBoat.rotation.y)*0.9+(Math.random()-0.5)*0.3,0.03,z-Math.cos(npcBoat.rotation.y)*0.9+(Math.random()-0.5)*0.3,{life:2.2,max:2.2,size:0.14,color:0xe8f0ff});}
