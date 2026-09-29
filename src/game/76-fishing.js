/* =========================================================
   Fishing (from any shore, or from the boat)
   ========================================================= */
let fishing=null;
const bobber=M([P(ICO,0xf4f0ea,0,0.03,0,0,0,0,0.16,0.12,0.16),P(ICO,0xd8453a,0,0.1,0,0,0,0,0.14,0.1,0.14),P(BOX,0x2b1e2e,0,0.18,0,0,0,0,0.02,0.08,0.02)]);
bobber.castShadow=false;bobber.visible=false;scene.add(bobber);
// the line is a chain of thin segments (real geometry, so it shows through the pixel pass and gets outlined like everything else)
const LINE_N=18,linePts=new Float32Array(LINE_N*3),_la=new T.Vector3(),_lb=new T.Vector3(),UP=new T.Vector3(0,1,0);
const fishLine=new T.InstancedMesh(BOX,new T.MeshBasicMaterial({color:0xfaf6ec}),LINE_N-1);fishLine.frustumCulled=false;fishLine.castShadow=false;fishLine.visible=false;scene.add(fishLine);
// the rod is four jointed segments, thinner towards the tip, so it can flex: back on the cast, and hard over when a fish pulls
const rod=new T.Group();rod.position.set(0.2,0.22,0.08);rod.rotation.x=0.95;rod.visible=false;villager.add(rod);
const rodSegs=[],ROD_SEG=0.27,rodTip=new T.Object3D();
{let par=rod;for(let i=0;i<4;i++){const j=new T.Group();j.position.y=i?ROD_SEG:0;const m=new T.Mesh(BOX,null);m.scale.set(0.04-i*0.006,ROD_SEG,0.04-i*0.006);m.position.y=ROD_SEG/2;j.add(m);par.add(j);rodSegs.push(j);par=j;}
  rodTip.position.y=ROD_SEG;par.add(rodTip);rod.add(M([P(CYL12,0x5a5a6a,0,0.1,0.04,0,0,1.57,0.07,0.035,0.07),P(BOX,0x3a3440,0,0.05,0,0,0,0,0.05,0.12,0.05)]));}
function bendRod(b){for(let i=0;i<4;i++)rodSegs[i].rotation.x=b*(0.1+i*0.12);}
const ROD_COL=[0x9a7a4a,0x6a4a8a,0xf5c542];
const TIP=new T.Vector3();
// what happens after a cast ends: a yank (you caught it) or the line reeling back in; the rod stays out until it's done
let rodAfter=null;
function fishWindow(F){return(F.w>=15?1.0:F.w>=6?0.82:F.w>=2.5?0.66:0.55)*(1+S.rod*0.22);}
function chooseFish(region,deep,river){const night=isNight();
  return pickW(FISH,k=>{const F=FISH[k];if(F.hab==='river'?!river:(river&&!F.junk))return false;if(!(F.bio.includes('any')||F.bio.includes(region)))return false;if(F.time==='day'&&night)return false;if(F.time==='night'&&!night)return false;if(F.rain&&!S.rain)return false;if(!river&&F.hab==='deep'&&!deep)return false;if(!river&&F.hab==='shore'&&deep)return false;return true;},
    (k,F)=>F.junk?F.w*(1-S.rod*0.35):F.w<6?F.w*(1+S.rod*0.6):F.w);}
const rodMats=ROD_COL.map(c=>new T.MeshBasicMaterial({color:c}));
function setRod(){const mt=S.rod===2?goldMat:rodMats[S.rod];for(const j of rodSegs)j.children[0].material=mt;}

// ---- fish shadows swimming in the water, like Animal Crossing ----
const shadows=[];
const shadowMat=new T.MeshBasicMaterial({color:0x0c1638,transparent:true,opacity:0.42,depthWrite:false});
const SHADOW_GEO=new T.CircleGeometry(0.5,16).rotateX(-Math.PI/2);
const FIN_GEO=merge([P(CONE4,0x4a5668,0,0.16,0,0,Math.PI/4,0,0.05,0.32,0.34)]);
function spawnShadow(){
  if(shadows.filter(s=>!s.out).length>=5)return;
  let px,pz;
  if(S.sea){const a=Math.random()*6.283,r=3+Math.random()*7;px=vil.x+Math.sin(a)*r;pz=vil.z+Math.cos(a)*r;}
  else{const isl=curIsl();if(!isl||!isl.sand.length)return;
    if(isl.rtiles&&!isl.lava&&Math.random()<0.5){const q=pickR(isl.rtiles);if(Math.hypot(q.x-vil.x,q.z-vil.z)>13||landMap.get(K(q.x,q.z))!=='river')return;
      const gold=Math.random()<0.06,fish=gold?goldFish(isl.biome,false,true):null;spawnShadowAt(q.x+(Math.random()-0.5)*0.4,q.z+(Math.random()-0.5)*0.4,fish||chooseFish(isl.biome,false,true),q.surf,!!fish);return;}
    const [sx,sz]=pickR(isl.sand);if(Math.hypot(sx-vil.x,sz-vil.z)>13)return;
    const cx=isl.home?0:isl.cx,cz=isl.home?0:isl.cz,d0=Math.hypot(sx-cx,sz-cz)||1,r=1.8+Math.random()*2.6;px=sx+(sx-cx)/d0*r;pz=sz+(sz-cz)/d0*r;}
  if(landMap.has(K(Math.round(px),Math.round(pz)))&&isLand(Math.round(px),Math.round(pz)))return;
  const deep=landDist(px,pz)>2.8,region=regionAt(px,pz),gf=Math.random()<0.06?goldFish(region,deep,false):null;spawnShadowAt(px,pz,gf||chooseFish(region,deep),0,!!gf);
  if(gf&&Math.hypot(px-vil.x,pz-vil.z)<10)say('Something golden glints in the water…');}
function spawnShadowAt(px,pz,fish,wy,gold){if(!fish)return;
  const F=FISH[fish],g=new T.Group(),m=new T.Mesh(SHADOW_GEO,gold?goldShadowMat:shadowMat);m.frustumCulled=false;const sz=0.24+F.size*0.13;m.scale.set(sz,1,sz*2.1);g.add(m);
  if(F.size>=5||F.fin){const fin=new T.Mesh(FIN_GEO,vcMat);fin.frustumCulled=false;fin.scale.setScalar(0.7+F.size*0.1);g.add(fin);}
  g.position.set(px,0.015,pz);const h=Math.random()*6.28;g.rotation.y=h;scene.add(g);
  shadows.push({g,fish,ax:px,az:pz,x:px,z:pz,t:0,life:45+Math.random()*40,out:0,hooked:false,heading:h,tx:px,tz:pz,wy,riv:wy>0,gold:!!gold});
}
function nearestShadow(x,z,r){let best=null,bd=r;for(const s of shadows){if(s.out||s.hooked)continue;const d=Math.hypot(s.x-x,s.z-z);if(d<bd){bd=d;best=s;}}return best;}
function fleeShadow(s,fx,fz){if(!s)return;s.hooked=false;s.out=0.001;s.heading=Math.atan2(s.x-fx,s.z-fz);}
function updateShadows(dt){
  for(let i=shadows.length-1;i>=0;i--){const s=shadows[i];s.t+=dt;
    if(s.out){s.out+=dt;s.x+=Math.sin(s.heading)*dt*3.5;s.z+=Math.cos(s.heading)*dt*3.5;s.g.scale.setScalar(Math.max(0.01,1-s.out/1.2));
      if(s.out>1.2){scene.remove(s.g);shadows.splice(i,1);continue;}}
    else if(!s.hooked){
      if(Math.random()<dt*0.5){const a=Math.random()*6.28;s.tx=s.ax+Math.cos(a)*1.8;s.tz=s.az+Math.sin(a)*1.8;}
      const dx=s.tx-s.x,dz=s.tz-s.z,d=Math.hypot(dx,dz);
      if(d>0.05){const nx=s.x+dx/d*0.4*dt,nz=s.z+dz/d*0.4*dt;if(s.riv?landMap.get(K(Math.round(nx),Math.round(nz)))==='river':!isLand(Math.round(nx),Math.round(nz))){s.x=nx;s.z=nz;}s.heading=Math.atan2(dx,dz);}
      if(s.t>s.life||Math.hypot(s.x-vil.x,s.z-vil.z)>24)s.out=0.001;}
    s.g.position.set(s.x,0.015+(s.wy||0),s.z);s.g.rotation.y+=angDiff(s.g.rotation.y,s.heading)*Math.min(1,dt*4);}}

// ---- ripples ----
const rings=[];const RING_GEO=new T.RingGeometry(0.28,0.36,24).rotateX(-Math.PI/2);
function ripple(x,z,big){const m=new T.Mesh(RING_GEO,new T.MeshBasicMaterial({color:0xf4f8ff,transparent:true,opacity:0.9,depthWrite:false}));m.frustumCulled=false;m.position.set(x,0.03+waterY(x,z),z);scene.add(m);rings.push({m,t:0,big:big?1.8:1});}
function updateRings(dt){for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.t+=dt;const u=r.t/0.9;r.m.scale.setScalar(1+u*2.2*r.big);r.m.material.opacity=0.9*(1-u);if(u>=1){scene.remove(r.m);r.m.material.dispose();rings.splice(i,1);}}}

// ---- the catch: fish leaps out and is held up high ----
const QUIPS={sardine:"It's packed with flavour!",mackerel:"It's a slick one!",boot:"…Someone out there has one wet sock.",bream:"I'm beaming!",bass:"No, wait — it's at least a C+!",puffer:"Don't get puffed up about it!",
  squid:"Ink-credible!",jelly:"It's positively glowing!",octopus:"It's got all its arms around me!",rainbow:"Colour me impressed!",tuna:"I'm on a roll!",moonfish:"It fell from the night sky!",
  oarfish:"It just keeps going and going!",coelacanth:"It's a living fossil!",clown:"No clowning around!",angel:"Heaven-sent!",parrot:"Pretty bird… er, fish!",manta:"What a wingspan!",
  salmon:"Pink and proud!",char:"How char-ming!",kingsalmon:"Fit for a king!",flounder:"Flat-out fantastic!",snapper:"Oh, snap!",sunset:"It looks like the evening sky!",cod:"Cod you believe it?",
  icefish:"Chill out!",narwhal:"The unicorn of the sea!",lavaeel:"Hot, hot, hot!",ember:"Still warm!",obsidian:"What a sharp-looking catch!",catfish:"Purr-fect!",eel:"I'm shocked!",gar:"So many teeth!",
  axolotl:"It's smiling at me!",flying:"Did it just fly?!",mahi:"So nice they named it twice!",marlin:"What a sword!",whaleshark:"The biggest fish in the sea!"};
function fishModel(F){const s=0.32+F.size*0.1,g=new T.Group();
  if(F.junk){g.add(M([P(BOX,0x6a4a30,0,0,0,0,0,0,0.22,0.4,0.24),P(BOX,0x6a4a30,0,-0.16,0.16,0,0,0,0.22,0.12,0.36),P(BOX,0x3a2a20,0,-0.24,0.1,0,0,0,0.24,0.04,0.5)]));return g;}
  const bl=new T.Color(F.col).lerp(new T.Color(0xffffff),0.45).getHex(),fn=F.fin||F.dk;
  g.add(M([P(ICO2,F.col,0,0,0,0,0,0,s*0.42,s*0.55,s),P(ICO2,bl,0,-s*0.1,s*0.04,0,0,0,s*0.36,s*0.38,s*0.86),P(ICO2,F.dk,0,s*0.12,-s*0.05,0,0,0,s*0.3,s*0.34,s*0.8),
    P(ICO2,F.col,0,0,-s*0.48,0,0,0,s*0.2,s*0.26,s*0.3),
    P(CONE4,fn,0,s*0.16,-s*0.72,-2.3,Math.PI/4,0,s*0.3,s*0.4,s*0.06),P(CONE4,fn,0,-s*0.16,-s*0.72,-0.84,Math.PI/4,0,s*0.3,s*0.4,s*0.06),
    P(PRISM,fn,0,s*0.3,-s*0.05,0,0,0,0.012,s*0.14,s*0.5),P(PRISM,fn,0,-s*0.26,-s*0.2,Math.PI,0,0,0.012,s*0.08,s*0.26),
    P(ICO2,fn,s*0.22,-s*0.06,s*0.12,0,0.6,0.5,0.02,s*0.1,s*0.18),P(ICO2,fn,-s*0.22,-s*0.06,s*0.12,0,-0.6,-0.5,0.02,s*0.1,s*0.18),
    P(ICO2,0xffffff,s*0.18,s*0.08,s*0.33,0,0,0,0.07,0.07,0.07),P(ICO2,0xffffff,-s*0.18,s*0.08,s*0.33,0,0,0,0.07,0.07,0.07),
    P(ICO2,0x1a1420,s*0.2,s*0.08,s*0.345,0,0,0,0.045,0.05,0.045),P(ICO2,0x1a1420,-s*0.2,s*0.08,s*0.345,0,0,0,0.045,0.05,0.045),
    P(ICO2,F.dk,0,-s*0.04,s*0.52,0,0,0,s*0.16,0.03,s*0.06)]));return g;}
let caught=null;
function updateCaught(dt,tt){if(!caught)return;caught.t+=dt;const c=caught,u=Math.min(1,c.t/0.55);
  const hx=vil.x,hz=vil.z,hy=(S.sea?0.14:vil.y)+1.15;
  if(c.t<0.55){c.g.position.set(lerp(c.fx,hx,u),lerp(0.1,hy,u)+Math.sin(u*Math.PI)*1.4,lerp(c.fz,hz,u));c.g.rotation.x+=dt*12;}
  else{c.g.position.set(hx,hy+Math.sin(tt*6)*0.03,hz);c.g.rotation.set(-Math.PI/2+Math.sin(tt*9)*0.15,cam.yaw+Math.PI/2,0);villager.rotation.y+=angDiff(villager.rotation.y,cam.yaw)*Math.min(1,dt*6);
    if(!c.shown){c.shown=true;say(c.msg);}if(c.t>3)dismissCatch();}}/* held up for a moment, then away: no box to close */
function dismissCatch(){if(!caught||caught.t<0.6)return;scene.remove(caught.g);caught=null;}

// no menu while you fish: a tap anywhere reels in (onTap), with one hint the first time
function fishingBar(){clearAction();if(!S.tipFish){S.tipFish=1;setTimeout(()=>say('Tap the moment the bobber is <b>pulled under</b>!'),900);}}
function startFishing(px,pz){
  const isl=curIsl();if(!isl)return;
  const sh=nearestShadow(px,pz,1.6);
  let best=null,bd=1e9;for(const [x,z] of [...isl.grass,...isl.sand]){if(objAt(x,z)||fixedAt(x,z))continue;const d=(x-px)**2+(z-pz)**2;if(d<bd){bd=d;best=[x,z];}}
  if(!best)return;
  if(sh){const dx=best[0]-sh.x,dz=best[1]-sh.z,d=Math.hypot(dx,dz)||1;px=sh.x+dx/d*1.1;pz=sh.z+dz/d*1.1;bd=(px-best[0])**2+(pz-best[1])**2;}
  let dist=Math.sqrt(bd)||1;const dx=(px-best[0])/dist,dz=(pz-best[1])/dist;
  if(dist>4.8){dist=4.8;px=best[0]+dx*dist;pz=best[1]+dz*dist;}
  if(dist<0.9){dist=0.9;px=best[0]+dx*dist;pz=best[1]+dz*dist;}
  fishing={px,pz,sx:best[0]+dx*0.38,sz:best[1]+dz*0.38,state:'walk',t:0,wy:waterY(px,pz)};
  routeVil(fishing.sx,fishing.sz);vil.idle=0;vil.cb=null;setRod();fishingBar();
}
function startBoatFishing(){if(!S.sea||fishing)return;sail=null;const b=S.boat;
  const sh=nearestShadow(b.x,b.z,9);let px,pz;
  if(sh){b.r=Math.atan2(sh.x-b.x,sh.z-b.z);const d=Math.hypot(sh.x-b.x,sh.z-b.z);const cd=Math.max(1.4,d-1.1);px=b.x+Math.sin(b.r)*cd;pz=b.z+Math.cos(b.r)*cd;}
  else{px=b.x+Math.sin(b.r)*2.8;pz=b.z+Math.cos(b.r)*2.8;}
  if(isLand(Math.round(px),Math.round(pz))){toast('Turn your boat toward open water to cast.');return;}
  fishing={px,pz,state:'cast',t:0,fromBoat:true};rodAfter=null;rod.visible=true;setRod();fishingBar();}
function endFishing(msg){if(!fishing)return;const f=fishing;if(f.target&&!f.caughtIt)fleeShadow(f.target,f.px,f.pz);
  if(rod.visible&&f.state!=='walk')rodAfter={t:0,kind:f.caughtIt?'yank':'reel',bx:bobber.position.x,by:bobber.position.y,bz:bobber.position.z,r0:rod.rotation.x};
  else{bobber.visible=fishLine.visible=rod.visible=false;rod.rotation.x=0.95;bendRod(0);}
  fishLean=0;fishing=null;clearAction();if(msg)toast(msg);}
function reel(){const f=fishing;if(!f)return;
  if(f.state==='bite'){catchFish();return;}
  if(f.state==='nibble'||f.state==='approach'){SFX.no();endFishing('Too soon! The fish got spooked.');return;}
  endFishing();}
function catchFish(){const f=fishing,id=f.target.fish,F=FISH[id],key='f:'+id;const first=gain(key);buzz(25);
  if(f.target.gold){const b=F.price;S.shells+=b;setTimeout(()=>{SFX.discover();stamp('A golden catch!',`${F.name} · +${b} bonus shells`,true);flyShells(10);},700);for(let i=0;i<24;i++)sparkle(f.px+(Math.random()-0.5),0.4+Math.random(),f.pz+(Math.random()-0.5),0xffe27a);}
  const kg=Math.round((F.size*(0.5+Math.random()*0.9)+Math.random()*0.3)*F.size*10)/10;const rec=!F.junk&&kg>(S.rec[id]||0);if(!F.junk)S.rec[id]=Math.max(S.rec[id]||0,kg);
  f.caughtIt=true;const s=f.target;scene.remove(s.g);shadows.splice(shadows.indexOf(s),1);
  burst(f.px,0.1,f.pz,0xe8f4ff,18,1.9,0.08,5);ripple(f.px,f.pz,true);SFX.splash();vil.hop=0.3;
  if(caught)scene.remove(caught.g);const g=fishModel(F);scene.add(g);caught={g,t:0,fx:f.px,fz:f.pz,msg:''};
  addXP(F.junk?1:Math.round(F.price/12)+2);
  const art=/^[aeiou]/i.test(F.name)?'an':'a';
  const msg=`I caught ${art} <b>${F.name.toLowerCase()}</b>! ${QUIPS[id]||'What a catch!'}${F.junk?'':` <small>${kg} kg${rec&&!first?' · record!':''}${F.w<6?' · '+rarity(F.w):''}</small>`}`;
  if(F.w<6&&!F.junk){SFX.rare();for(let i=0;i<12;i++)sparkle(vil.x,1.4,vil.z,0xfff0a0);}else SFX.catch();
  endFishing();caught.msg=msg+(first&&!F.junk?'<br><b style="color:#1c9a8c">New to your Islandex!</b>':'');}
// the line: from the rod tip to the bobber, sagging onto the water when slack and pulled straight when taut
function drawLine(bx,by,bz,taut,wy){const pa=linePts,sag=(1-taut)*0.55*Math.min(1,Math.hypot(bx-TIP.x,bz-TIP.z)/2);
  for(let i=0;i<LINE_N;i++){const s=i/(LINE_N-1);let y=lerp(TIP.y,by,s)-sag*4*s*(1-s)*(1-s*0.35);if(s>0.3)y=Math.max(y,wy+0.012);pa[i*3]=lerp(TIP.x,bx,s);pa[i*3+1]=y;pa[i*3+2]=lerp(TIP.z,bz,s);}
  for(let i=0;i<LINE_N-1;i++){_la.fromArray(pa,i*3);_lb.fromArray(pa,i*3+3);const len=_la.distanceTo(_lb)||1e-4;_v.addVectors(_la,_lb).multiplyScalar(0.5);
    _lb.sub(_la).divideScalar(len);_q.setFromUnitVectors(UP,_lb);_m.compose(_v,_q,_s.set(0.018,len,0.018));fishLine.setMatrixAt(i,_m);}
  fishLine.instanceMatrix.needsUpdate=true;}
function updateRodAfter(dt){const r=rodAfter;r.t+=dt;villager.updateMatrixWorld(true);rodTip.getWorldPosition(TIP);
  if(r.kind==='yank'){/* snap the rod up and back, the tip whipping, the line following the fish out of the water */const u=Math.min(1,r.t/0.6);
    rod.rotation.x=u<0.25?lerp(r.r0,-0.35,u/0.25):lerp(-0.35,0.95,smooth(0.25,1,u));bendRod(u<0.25?-0.5:-0.5*Math.exp(-(u-0.25)*9)*Math.cos((u-0.25)*30));fishLean=u<0.5?-0.18:0;
    if(caught&&caught.t<0.55){fishLine.visible=true;bobber.visible=false;const p=caught.g.position;drawLine(p.x,p.y,p.z,1,-9);}else fishLine.visible=false;
    if(u>=1)rodAfter=null;}
  else{/* reel in: the bobber skips back across the water to the tip */const u=Math.min(1,r.t/0.45);rod.rotation.x=lerp(r.r0,0.55,smooth(0,0.4,u));bendRod(0.25*Math.sin(u*Math.PI));
    const x=lerp(r.bx,TIP.x,u),z=lerp(r.bz,TIP.z,u),y=u<0.7?r.by+Math.abs(Math.sin(u*14))*0.08:lerp(r.by,TIP.y,(u-0.7)/0.3);bobber.position.set(x,y,z);drawLine(x,y+0.18,z,0.9,-9);
    if(u>0.1&&u<0.7&&Math.random()<dt*14)emit(x,r.by+0.02,z,{vy:0.4,life:0.3,max:0.3,size:0.04,color:0xe8f4ff,g:3});if(u>=1)rodAfter=null;}
  if(!rodAfter){bobber.visible=fishLine.visible=rod.visible=false;rod.rotation.x=0.95;bendRod(0);fishLean=0;}}
function updateFishing(dt,tt){updateShadows(dt);updateRings(dt);updateCaught(dt,tt);
  const f=fishing;if(!f){if(rodAfter)updateRodAfter(dt);return;}f.t+=dt;
  if(f.state==='walk'){if(Math.hypot(vil.x-f.sx,vil.z-f.sz)<0.06){f.state='cast';f.t=0;rodAfter=null;rod.visible=true;villager.rotation.y=Math.atan2(f.px-f.sx,f.pz-f.sz);}
    else if(f.t>14)endFishing();return;}
  if(f.fromBoat)villager.rotation.y=S.boat.r;
  villager.updateMatrixWorld(true);rodTip.getWorldPosition(TIP);
  const CAST=0.95,REL=0.42;/* the cast: a wind-up over the shoulder, a whip forward (the tip lagging, then flicking), the bobber flying out in an arc */
  if(f.state==='cast'){const u=Math.min(1,f.t/CAST);
    if(u<0.32){const k=smooth(0,0.32,u);rod.rotation.x=lerp(0.95,-0.95,k);bendRod(0.25*k);fishLean=-0.16*k;}
    else if(u<0.46){const k=(u-0.32)/0.14;rod.rotation.x=lerp(-0.95,1.35,k*k);bendRod(lerp(0.25,-0.7,k));fishLean=lerp(-0.16,0.28,k);if(!f.whoosh){f.whoosh=1;SFX.cast();}}
    else{const k=(u-0.46)/0.54;rod.rotation.x=lerp(1.35,0.72,smooth(0,1,k));bendRod(0.45*Math.exp(-k*4)*Math.cos(k*16));fishLean=lerp(0.28,0.06,k);}
    fishLine.visible=true;bobber.visible=true;
    if(u<REL){bobber.position.copy(TIP);bobber.position.y-=0.18;drawLine(TIP.x,TIP.y-0.02,TIP.z,1,-9);}
    else{const q=(u-REL)/(1-REL),bx=lerp(TIP.x,f.px,q),bz=lerp(TIP.z,f.pz,q),by=lerp(TIP.y,f.wy||tideY,q)+Math.sin(q*Math.PI)*1.3;bobber.position.set(bx,by,bz);drawLine(bx,by+0.18,bz,0.75,-9);}
    if(u>=1){SFX.plop();ripple(f.px,f.pz);burst(f.px,0.05,f.pz,0xe8f4ff,6,0.8,0.05,4);f.t=0;
      let s=nearestShadow(f.px,f.pz,3.6);
      if(!s&&S.inv['x:bait']>0){const riv=f.wy>0,fish=riv?chooseFish((curIsl()||{}).biome,false,true):chooseFish(S.sea?regionAt(f.px,f.pz):regionAt(f.px,f.pz),landDist(f.px,f.pz)>2.8);
        if(fish){const a=Math.random()*6.28;spawnShadowAt(f.px+Math.cos(a)*(riv?0.5:1.6),f.pz+Math.sin(a)*(riv?0.5:1.6),fish,f.wy||0);s=shadows[shadows.length-1];takeOf('x:bait',1);floatText(f.px,0.8+(f.wy||0),f.pz,'bait!');}}
      if(s){s.hooked=true;f.target=s;f.state='approach';f.win=fishWindow(FISH[s.fish])*(s.gold?0.55:1);}/* golden ones bite and let go fast */else f.state='empty';}}
  let bend=0.06+Math.sin(tt*1.3)*0.03,taut=0.15;if(f.state!=='cast'){rod.rotation.x=0.72+Math.sin(tt*1.1)*0.03;fishLean=0.05;}/* waiting: the rod rests, swaying a little */
  if(f.state==='empty'){bobber.position.set(f.px,Math.sin(tt*2.2)*0.015,f.pz);
    if(f.t>2){const s=nearestShadow(f.px,f.pz,3.6);if(s){s.hooked=true;f.target=s;f.state='approach';f.t=0;f.win=fishWindow(FISH[s.fish])*(s.gold?0.55:1);}}
    if(f.t>6)endFishing("Nothing's biting here. Cast close to a fish shadow!");}
  else if(f.state==='approach'){const s=f.target,dx=f.px-s.x,dz=f.pz-s.z,d=Math.hypot(dx,dz);s.heading=Math.atan2(dx,dz);
    bobber.position.set(f.px,Math.sin(tt*2.2)*0.015,f.pz);
    const reach=0.2+s.g.children[0].scale.z*0.5;
    if(d>reach){const sp=0.55+Math.random()*0.15;s.x+=dx/d*sp*dt;s.z+=dz/d*sp*dt;}
    else{f.state='nibble';f.t=0;f.nibLeft=1+Math.floor(Math.random()*4);f.next=0.5+Math.random()*0.9;}}
  else if(f.state==='nibble'){let dip=0;
    if(f.t>=f.next){if(f.nibLeft>0){f.nibLeft--;f.dipT=0.2;SFX.nibble();ripple(f.px,f.pz);f.next=f.t+0.8+Math.random()*1.0;}
      else{f.state='bite';f.t=0;SFX.bite();ripple(f.px,f.pz,true);burst(f.px,0.05,f.pz,0xffffff,14,1.4,0.07,5);floatText(f.px,0.8,f.pz,'!','gold');}}
    if(f.dipT>0){f.dipT-=dt;dip=0.06;bend+=0.3*(f.dipT/0.2);taut=0.7;}/* each nibble tugs the tip */
    bobber.position.set(f.px,Math.sin(tt*2.2)*0.015-dip,f.pz);}
  else if(f.state==='bite'){bobber.position.set(f.px+Math.sin(tt*40)*0.02,-0.16,f.pz);/* hooked: the rod bows right over and shudders, and you lean back against it */
    bend=0.95+Math.sin(tt*38)*0.1;taut=1;rod.rotation.x=1.0+Math.sin(tt*23)*0.05;fishLean=-0.12;if(Math.random()<dt*10)emit(f.px,(f.wy||0)+0.03,f.pz,{vx:(Math.random()-0.5),vy:0.8,vz:(Math.random()-0.5),life:0.4,max:0.4,size:0.05,color:0xe8f4ff,g:5});
    if(f.t>f.win){endFishing('It got away…');return;}}
  if(!fishing)return;
  if(f.state!=='cast'){bendRod(bend);bobber.position.y+=f.wy||tideY;/* a river's surface, or the sea at today's tide */drawLine(bobber.position.x,bobber.position.y+0.18,bobber.position.z,taut,f.wy||tideY);}}

