/* =========================================================
   Fishing (from any shore, or from the boat)
   ========================================================= */
let fishing=null;
const bobber=M([P(ICO,0xf4f0ea,0,0.03,0,0,0,0,0.16,0.12,0.16),P(ICO,0xd8453a,0,0.1,0,0,0,0,0.14,0.1,0.14),P(BOX,0x2b1e2e,0,0.18,0,0,0,0,0.02,0.08,0.02)]);
bobber.castShadow=false;bobber.visible=false;scene.add(bobber);
const lineGeo=new T.BufferGeometry();lineGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));
const fishLine=new T.Line(lineGeo,new T.LineBasicMaterial({color:0xf4f0ea}));fishLine.frustumCulled=false;fishLine.visible=false;scene.add(fishLine);
const rod=M([P(BOX,0xffffff,0,0.5,0,0,0,0,0.035,1.0,0.035)]);rod.castShadow=false;rod.position.set(0.2,0.22,0.08);rod.rotation.x=0.95;rod.visible=false;villager.add(rod);
const ROD_COL=[0x9a7a4a,0x6a4a8a,0xf5c542];
const TIP=new T.Vector3();
function fishWindow(F){return(F.w>=15?1.0:F.w>=6?0.82:F.w>=2.5?0.66:0.55)*(1+S.rod*0.22);}
function chooseFish(region,deep,river){const night=isNight();
  return pickW(FISH,k=>{const F=FISH[k];if(F.hab==='river'?!river:(river&&!F.junk))return false;if(!(F.bio.includes('any')||F.bio.includes(region)))return false;if(F.time==='day'&&night)return false;if(F.time==='night'&&!night)return false;if(F.rain&&!S.rain)return false;if(!river&&F.hab==='deep'&&!deep)return false;if(!river&&F.hab==='shore'&&deep)return false;return true;},
    (k,F)=>F.junk?F.w*(1-S.rod*0.35):F.w<6?F.w*(1+S.rod*0.6):F.w);}
function setRod(){rod.material=S.rod===2?goldMat:new T.MeshBasicMaterial({color:ROD_COL[S.rod]});}

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
      spawnShadowAt(q.x+(Math.random()-0.5)*0.4,q.z+(Math.random()-0.5)*0.4,chooseFish(isl.biome,false,true),q.surf);return;}
    const [sx,sz]=pickR(isl.sand);if(Math.hypot(sx-vil.x,sz-vil.z)>13)return;
    const cx=isl.home?0:isl.cx,cz=isl.home?0:isl.cz,d0=Math.hypot(sx-cx,sz-cz)||1,r=1.8+Math.random()*2.6;px=sx+(sx-cx)/d0*r;pz=sz+(sz-cz)/d0*r;}
  if(landMap.has(K(Math.round(px),Math.round(pz)))&&isLand(Math.round(px),Math.round(pz)))return;
  const deep=landDist(px,pz)>2.8,region=regionAt(px,pz);spawnShadowAt(px,pz,chooseFish(region,deep),0);}
function spawnShadowAt(px,pz,fish,wy){if(!fish)return;
  const F=FISH[fish],g=new T.Group(),m=new T.Mesh(SHADOW_GEO,shadowMat);m.frustumCulled=false;const sz=0.24+F.size*0.13;m.scale.set(sz,1,sz*2.1);g.add(m);
  if(F.size>=5||F.fin){const fin=new T.Mesh(FIN_GEO,vcMat);fin.frustumCulled=false;fin.scale.setScalar(0.7+F.size*0.1);g.add(fin);}
  g.position.set(px,0.015,pz);const h=Math.random()*6.28;g.rotation.y=h;scene.add(g);
  shadows.push({g,fish,ax:px,az:pz,x:px,z:pz,t:0,life:45+Math.random()*40,out:0,hooked:false,heading:h,tx:px,tz:pz,wy,riv:wy>0});
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
    if(!c.shown){c.shown=true;setAction(c.msg,[],'Fishing',dismissCatch);}}}
function dismissCatch(){if(!caught||caught.t<0.6)return;scene.remove(caught.g);caught=null;SFX.ui();clearAction();}

function fishingBar(msg){setAction(msg||`Wait for a nibble… when the bobber is <b>pulled under</b>, tap!`,[{label:'Reel in',cls:'go',fn:reel},{label:'Stop',fn:()=>endFishing()}],'Fishing');}
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
  fishing={px,pz,state:'cast',t:0,fromBoat:true};rod.visible=true;setRod();SFX.cast();fishingBar();}
function endFishing(msg){if(!fishing)return;const f=fishing;if(f.target&&!f.caughtIt)fleeShadow(f.target,f.px,f.pz);
  bobber.visible=fishLine.visible=rod.visible=false;rod.rotation.x=0.95;fishing=null;clearAction();if(msg)toast(msg);}
function reel(){const f=fishing;if(!f)return;
  if(f.state==='bite'){catchFish();return;}
  if(f.state==='nibble'||f.state==='approach'){SFX.no();endFishing('Too soon! The fish got spooked.');return;}
  endFishing();}
function catchFish(){const f=fishing,id=f.target.fish,F=FISH[id],key='f:'+id;const first=gain(key);
  const kg=Math.round((F.size*(0.5+Math.random()*0.9)+Math.random()*0.3)*F.size*10)/10;const rec=!F.junk&&kg>(S.rec[id]||0);if(!F.junk)S.rec[id]=Math.max(S.rec[id]||0,kg);
  f.caughtIt=true;const s=f.target;scene.remove(s.g);shadows.splice(shadows.indexOf(s),1);
  burst(f.px,0.1,f.pz,0xe8f4ff,18,1.9,0.08,5);ripple(f.px,f.pz,true);SFX.splash();vil.hop=0.3;
  if(caught)scene.remove(caught.g);const g=fishModel(F);scene.add(g);caught={g,t:0,fx:f.px,fz:f.pz,msg:''};
  addXP(F.junk?1:Math.round(F.price/12)+2);
  const art=/^[aeiou]/i.test(F.name)?'an':'a';
  const msg=`I caught ${art} <b>${F.name.toLowerCase()}</b>! ${QUIPS[id]||'What a catch!'}${F.junk?'':` <small>${kg} kg${rec&&!first?' · record!':''}${F.w<6?' · '+rarity(F.w):''}</small>`}`;
  if(F.w<6&&!F.junk){SFX.rare();for(let i=0;i<12;i++)sparkle(vil.x,1.4,vil.z,0xfff0a0);}else SFX.catch();
  endFishing();caught.msg=msg+(first&&!F.junk?'<br><b style="color:#1c9a8c">New to your Islandex!</b>':'');}
function updateFishing(dt,tt){updateShadows(dt);updateRings(dt);updateCaught(dt,tt);
  const f=fishing;if(!f)return;f.t+=dt;
  if(f.state==='walk'){if(Math.hypot(vil.x-f.sx,vil.z-f.sz)<0.06){f.state='cast';f.t=0;rod.visible=true;villager.rotation.y=Math.atan2(f.px-f.sx,f.pz-f.sz);SFX.cast();}
    else if(f.t>14)endFishing();return;}
  if(f.fromBoat)villager.rotation.y=S.boat.r;
  villager.updateMatrixWorld(true);TIP.set(0,1,0);rod.localToWorld(TIP);
  if(f.state==='cast'){const u=Math.min(1,f.t/0.55);rod.rotation.x=u<0.35?lerp(0.95,-0.7,u/0.35):lerp(-0.7,0.95,(u-0.35)/0.65);bobber.visible=fishLine.visible=true;
    bobber.position.set(lerp(TIP.x,f.px,u),lerp(TIP.y,0,u)+Math.sin(u*Math.PI)*1.2,lerp(TIP.z,f.pz,u));
    if(u>=1){SFX.plop();ripple(f.px,f.pz);burst(f.px,0.05,f.pz,0xe8f4ff,6,0.8,0.05,4);f.t=0;
      let s=nearestShadow(f.px,f.pz,3.6);
      if(!s&&S.inv['x:bait']>0){const riv=f.wy>0,fish=riv?chooseFish((curIsl()||{}).biome,false,true):chooseFish(S.sea?regionAt(f.px,f.pz):regionAt(f.px,f.pz),landDist(f.px,f.pz)>2.8);
        if(fish){const a=Math.random()*6.28;spawnShadowAt(f.px+Math.cos(a)*(riv?0.5:1.6),f.pz+Math.sin(a)*(riv?0.5:1.6),fish,f.wy||0);s=shadows[shadows.length-1];takeOf('x:bait',1);floatText(f.px,0.8+(f.wy||0),f.pz,'bait!');}}
      if(s){s.hooked=true;f.target=s;f.state='approach';f.win=fishWindow(FISH[s.fish]);}else f.state='empty';}}
  else if(f.state==='empty'){bobber.position.set(f.px,Math.sin(tt*2.2)*0.015,f.pz);
    if(f.t>2){const s=nearestShadow(f.px,f.pz,3.6);if(s){s.hooked=true;f.target=s;f.state='approach';f.t=0;f.win=fishWindow(FISH[s.fish]);}}
    if(f.t>6)endFishing("Nothing's biting here. Cast close to a fish shadow!");}
  else if(f.state==='approach'){const s=f.target,dx=f.px-s.x,dz=f.pz-s.z,d=Math.hypot(dx,dz);s.heading=Math.atan2(dx,dz);
    bobber.position.set(f.px,Math.sin(tt*2.2)*0.015,f.pz);
    const reach=0.2+s.g.children[0].scale.z*0.5;
    if(d>reach){const sp=0.55+Math.random()*0.15;s.x+=dx/d*sp*dt;s.z+=dz/d*sp*dt;}
    else{f.state='nibble';f.t=0;f.nibLeft=1+Math.floor(Math.random()*4);f.next=0.5+Math.random()*0.9;}}
  else if(f.state==='nibble'){let dip=0;
    if(f.t>=f.next){if(f.nibLeft>0){f.nibLeft--;f.dipT=0.2;SFX.nibble();ripple(f.px,f.pz);f.next=f.t+0.8+Math.random()*1.0;}
      else{f.state='bite';f.t=0;SFX.bite();ripple(f.px,f.pz,true);burst(f.px,0.05,f.pz,0xffffff,14,1.4,0.07,5);floatText(f.px,0.8,f.pz,'!','gold');}}
    if(f.dipT>0){f.dipT-=dt;dip=0.06;}
    bobber.position.set(f.px,Math.sin(tt*2.2)*0.015-dip,f.pz);}
  else if(f.state==='bite'){bobber.position.set(f.px+Math.sin(tt*40)*0.02,-0.16,f.pz);
    if(f.t>f.win){endFishing('It got away…');return;}}
  if(!fishing)return;
  if(f.wy)bobber.position.y+=f.wy;
  const pa=lineGeo.attributes.position.array;pa[0]=TIP.x;pa[1]=TIP.y;pa[2]=TIP.z;pa[3]=bobber.position.x;pa[4]=bobber.position.y+0.18;pa[5]=bobber.position.z;lineGeo.attributes.position.needsUpdate=true;}

