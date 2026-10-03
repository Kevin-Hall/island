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
  return pickW(FISH,k=>{const F=FISH[k];if(F.hab==='river'?!river:(river&&!F.junk))return false;if(!(F.bio.includes('any')||F.bio.includes(region)))return false;if(F.time==='day'&&night)return false;if(F.time==='night'&&!night)return false;if(F.rain&&!S.rain)return false;if(!dexOk(F,S.sea?(region==='home'?islands[0]:null):curIsl()))return false;if(!river&&F.hab==='deep'&&!deep)return false;if(!river&&F.hab==='shore'&&deep)return false;return true;},
    (k,F)=>F.junk?F.w*(1-S.rod*0.35):F.w<6?F.w*(1+S.rod*0.6):F.w);}
const rodMats=ROD_COL.map(c=>new T.MeshBasicMaterial({color:c}));
function setRod(){const mt=S.rod===2?goldMat:rodMats[S.rod];for(const j of rodSegs)j.children[0].material=mt;}

// ---- fish shadows swimming in the water, like Animal Crossing ----
const shadows=[];
const shadowMat=new T.MeshBasicMaterial({color:0x0c1638,transparent:true,opacity:0.42,depthWrite:false});
const SHADOW_GEO=new T.CircleGeometry(0.5,16).rotateX(-Math.PI/2);
// a forked tail, pivoting at the root (shape y is backwards once laid flat)
const TAIL_GEO=(()=>{const sh=new T.Shape();sh.moveTo(0,-0.15);sh.lineTo(-0.5,0.95);sh.quadraticCurveTo(0,0.62,0.5,0.95);sh.lineTo(0,-0.15);return new T.ShapeGeometry(sh).rotateX(-Math.PI/2);})();
const PEC_GEO=new T.CircleGeometry(0.5,8).rotateX(-Math.PI/2);
const FIN_GEO=merge([P(CONE4,0x4a5668,0,0.16,0,0,Math.PI/4,0,0.05,0.32,0.34)]);
// how big a fish's shadow is, and its build: slim darting minnows, deep-bodied bream, long eels, wide rays
function fishShape(F){const riv=F.hab==='river';let L=(0.38+F.size*0.25)*(riv?0.82:1),W=L*0.34,tail=1,wag=1,kick=1.5-F.size*0.08,every=0.9+F.size*0.18;
  switch(F.spr){case'eel':W=L*0.13;L*=1.25;tail=0.4;wag=1.8;break;case'ray':W=L*0.95;L*=0.8;tail=0.5;wag=0.3;every*=1.4;break;
    case'puffer':W=L*0.62;tail=0.8;kick*=0.7;break;case'jelly':case'octo':case'squid':W=L*0.5;tail=0.5;wag=0.4;every*=1.3;break;case'narwhal':W=L*0.3;L*=1.1;break;}
  return{L,W,tail,wag,kick,every};}
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
  const F=FISH[fish],sp=fishShape(F),mat=gold?goldShadowMat:shadowMat,g=new T.Group(),body=new T.Mesh(SHADOW_GEO,mat);body.frustumCulled=false;body.scale.set(sp.W,1,sp.L);g.add(body);
  const tp=new T.Group();tp.position.z=-sp.L*0.42;g.add(tp);const tail=new T.Mesh(TAIL_GEO,mat);tail.frustumCulled=false;tail.scale.set(sp.W*1.15*sp.tail+0.06,1,sp.L*0.34*sp.tail+0.05);tp.add(tail);
  for(const sd of [-1,1]){const pf=new T.Mesh(PEC_GEO,mat);pf.frustumCulled=false;pf.scale.set(sp.W*0.45,1,sp.W*0.28);pf.position.set(sd*sp.W*0.48,0,sp.L*0.12);pf.rotation.y=sd*0.6;g.add(pf);}
  if(F.size>=5&&F.hab!=='river'&&F.spr!=='ray'){const fin=new T.Mesh(FIN_GEO,vcMat);fin.frustumCulled=false;fin.scale.setScalar(0.7+F.size*0.1);g.add(fin);}/* the big ones cut the surface */
  g.position.set(px,0.015,pz);const h=Math.random()*6.28;g.rotation.y=h;g.scale.setScalar(0.01);scene.add(g);
  shadows.push({g,tp,fish,sp,ax:px,az:pz,x:px,z:pz,t:0,life:45+Math.random()*40,out:0,hooked:false,heading:h,dir:h,v:0,kickT:Math.random(),ph:Math.random()*6,nd:0,tx:px+Math.sin(h)*1.2,tz:pz+Math.cos(h)*1.2,wy,riv:wy>0,gold:!!gold,len:sp.L});
}
function nearestShadow(x,z,r){let best=null,bd=r;for(const s of shadows){if(s.out||s.hooked)continue;const d=Math.hypot(s.x-x,s.z-z);if(d<bd){bd=d;best=s;}}return best;}
function fleeShadow(s,fx,fz){if(!s)return;s.hooked=false;s.out=0.001;s.heading=s.dir=Math.atan2(s.x-fx,s.z-fz);s.v=3.2;}
const wet=(s,x,z)=>s.riv?landMap.get(K(Math.round(x),Math.round(z)))==='river':!isLand(Math.round(x),Math.round(z));
// swimming like a fish: turn toward where it wants to go at a limited rate, then a flick of the tail sends it off in a
// burst that coasts to a stop (faster, more often, the further it has to go); the tail beats with the speed
function fishSwim(s,dt,eager){const sp=s.sp;s.dir+=clamp(angDiff(s.dir,s.heading),-dt*(2.2+eager*2),dt*(2.2+eager*2));
  s.kickT-=dt*(1+eager*1.5);if(s.kickT<=0){s.kickT=sp.every*(0.6+Math.random()*0.8);if(eager>=0)s.v=Math.max(s.v,sp.kick*(0.6+Math.random()*0.5)*(0.5+eager*0.7));}
  s.v*=Math.exp(-dt*1.8);const nx=s.x+Math.sin(s.dir)*s.v*dt,nz=s.z+Math.cos(s.dir)*s.v*dt;
  if(wet(s,nx,nz)){s.x=nx;s.z=nz;}else{s.heading=s.dir+Math.PI*(0.6+Math.random()*0.4);s.v*=0.2;}}
function updateShadows(dt){const walking=Math.hypot(vil.tx-vil.x,vil.tz-vil.z)>0.05;
  for(let i=shadows.length-1;i>=0;i--){const s=shadows[i];s.t+=dt;
    if(s.out){s.out+=dt;s.v=Math.max(s.v*Math.exp(-dt*1.2),1.2);s.x+=Math.sin(s.dir)*s.v*dt;s.z+=Math.cos(s.dir)*s.v*dt;
      if(s.out>1.4){scene.remove(s.g);shadows.splice(i,1);continue;}}
    else if(!s.hooked){
      // mill about home: pick a new spot now and then, and hang still between (fins barely moving)
      const dx=s.tx-s.x,dz=s.tz-s.z,d=Math.hypot(dx,dz);
      if(d<0.25&&Math.random()<dt*0.35||Math.random()<dt*0.08){const a=Math.random()*6.28,r=0.6+Math.random()*1.4;s.tx=s.ax+Math.cos(a)*r;s.tz=s.az+Math.sin(a)*r;}
      if(d>0.25)s.heading=Math.atan2(dx,dz);fishSwim(s,dt,d>0.25?Math.min(1,d/2)*0.6:-1);
      // startled by footsteps on the bank: a quick dart away, then it settles again
      const pd=Math.hypot(s.x-vil.x,s.z-vil.z);if(walking&&pd<1.6+s.len*0.4&&s.v<1.5){s.heading=s.dir=Math.atan2(s.x-vil.x,s.z-vil.z);s.v=2.6;s.tx=s.x+Math.sin(s.dir)*2;s.tz=s.z+Math.cos(s.dir)*2;}
      if(s.t>s.life||pd>24)s.out=0.001;}
    // the tail beats with speed (a lazy scull when hovering), the body sways against it
    s.ph+=dt*(2.2+s.v*11+(s.thrash||0)*20)*s.sp.wag;const amp=(0.18+Math.min(1,s.v)*0.45+(s.thrash||0)*0.5)*Math.min(1.4,s.sp.wag);
    s.tp.rotation.y=Math.sin(s.ph)*amp;const sway=-Math.sin(s.ph)*amp*0.18;
    s.nd*=Math.exp(-dt*6);const ox=Math.sin(s.dir)*s.nd,oz=Math.cos(s.dir)*s.nd;
    s.g.position.set(s.x+ox,0.015+(s.wy||tideY),s.z+oz);s.g.rotation.y=s.dir+sway+(s.thrash?Math.sin(s.t*31)*0.35*s.thrash:0);
    const grow=Math.min(1,s.t*1.5),fade=s.out?Math.max(0.01,1-s.out/1.4):1;s.g.scale.setScalar(Math.max(0.01,grow*fade));}}

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
let caught=null;
// after a catch you hold it up, side-on to the camera, and it stays there (flapping now and then) while the camera leans
// in and a card says what it is; a tap puts it away and the camera eases back out
let camBack=null;
function updateCaught(dt,tt){if(camBack!==null&&!caught){cam.dist=lerp(cam.dist,camBack,Math.min(1,dt*3));if(Math.abs(cam.dist-camBack)<0.05){cam.dist=camBack;camBack=null;}}
  if(!caught)return;caught.t+=dt;const c=caught,u=Math.min(1,c.t/0.55);
  const hx=vil.x,hz=vil.z,hy=(S.sea?0.14:vil.y)+1.6;c.g.rotation.order='YXZ';
  if(c.t<0.55){c.g.position.set(lerp(c.fx,hx,u),lerp(c.fy??0.1,hy,u)+Math.sin(u*Math.PI)*1.4,lerp(c.fz,hz,u));if(c.spin)c.g.rotation.y+=dt*14;else c.g.rotation.x+=dt*12;c.g.scale.setScalar(lerp(0.6,c.sc,u));}
  else{const k=c.t-0.55,flap=Math.sin(tt*14)*Math.max(0,Math.sin(k*1.7))**8*0.22; // a flap every few seconds
    const pop=1+Math.sin(Math.min(1,k*4)*Math.PI)*0.12;c.g.scale.setScalar(c.sc*pop);
    c.g.position.set(hx,hy+Math.sin(tt*2.2)*0.04,hz);if(c.spin)c.g.rotation.set(0.12,cam.yaw+Math.sin(tt*1.4)*0.6,0);/* (a bug or a find turns slowly, shown off) */else c.g.rotation.set(0,cam.yaw+Math.PI/2+flap*0.6,c.roll+flap);villager.rotation.y+=angDiff(villager.rotation.y,cam.yaw)*Math.min(1,dt*6);
    if(c.d0===undefined){c.d0=cam.dist;}cam.dist=lerp(cam.dist,Math.min(c.d0,14),Math.min(1,dt*2.5));
    if(!c.shown){c.shown=true;catchCard(c.card);}}}
function catchCard(d){let el=$('catchCard');if(!el){el=document.createElement('div');el.id='catchCard';el.className='catchcard';document.body.appendChild(el);}
  if(!d){el.classList.remove('on');return;}
  const tags=[d.item?d.cat:'',d.junk||d.sea||d.item?'':`${d.kg} kg`,d.junk?'':d.rar,d.rec?'Record!':'',d.gold?'Golden!':'',d.shiny?'Shiny!':''].filter(Boolean);
  el.classList.toggle('rare',!!d.rare);
  el.innerHTML=`<small>${d.verb||'You caught'}</small><b>${d.art} ${d.name}</b>${tags.length?`<span>${tags.map(t=>`<em>${t}</em>`).join('')}</span>`:''}<p>${d.quip}</p>${d.first?'<i class="new">New to your Islandex!</i>':''}<i>Tap anywhere to put it away</i>`;
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');}
// the same moment for a bug, whenever it's new to you or rare (a common one you've had before just pops up and away; finds
// and plants never stop you: they pop up, with the Islandex's own card when new): held up overhead, turning slowly, with a card
let revSkip=null;/* (its card says it's new, so the Islandex's own discovery card stands aside) */
const bigMoment=(key,w,shiny)=>!S.alm[key]||w<5||!!shiny;
function holdUp(key,g,x,y,z,sc,verb,first,shiny){if(caught){popHold(g,x,z,sc*0.7,y);return;}
  g.traverse(o=>{if(o.isMesh)o.castShadow=false;});g.position.set(x,y,z);scene.add(g);const I=itemInfo(key)||{name:'?',w:20},L=REVEAL_LINES[key[0]]||REVEAL_LINES.g;
  const [dg,dt]=dexCount();caught={g,t:0,fx:x,fy:y,fz:z,sc,roll:0,spin:1,card:{item:1,art:'',name:I.name,verb,cat:{b:'Bug',g:'Find',p:'Wild plant'}[key[0]],rar:I.w?rarity(I.w):'',rare:I.w<5,shiny,
    quip:L[Math.floor(Math.random()*L.length)]+(first?`<br><small>${dg+1===1?'The first':`No. ${dg+1} of ${dt}`} in your Islandex</small>`:''),first}};
  if(first||I.w<5){SFX.discover&&SFX.discover();for(let i=0;i<14;i++)sparkle(x,y+0.4,z,I.w<5?0xffe070:0xfff6e2);}}
function dismissCatch(){if(!caught||caught.t<0.6)return;scene.remove(caught.g);if(caught.d0!==undefined)camBack=caught.d0;catchCard(null);caught=null;}

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
  if(caught){scene.remove(caught.g);catchCard(null);}const g=fishModel(F);scene.add(g);const kind=fishKind(id,F);
  caught={g,t:0,fx:f.px,fz:f.pz,msg:'',sc:Math.max(0.8,Math.min(1.35,1.1/(2*(0.32+F.size*0.1)))),roll:/ray|flat|crab|octo|jelly/.test(kind)?0.9:0};
  addXP(F.junk?1:Math.round(F.price/12)+2);
  const art=/^[aeiou]/i.test(F.name)?'an':'a';
  const msg=`I caught ${art} <b>${F.name.toLowerCase()}</b>! ${QUIPS[id]||'What a catch!'}${F.junk?'':` <small>${kg} kg${rec&&!first?' · record!':''}${F.w<6?' · '+rarity(F.w):''}</small>`}`;
  if(F.w<6&&!F.junk){SFX.rare();for(let i=0;i<12;i++)sparkle(vil.x,1.4,vil.z,0xfff0a0);}else SFX.catch();
  endFishing();caught.msg=msg;caught.card={art:art==='an'?'An':'A',name:F.name,quip:QUIPS[id]||'What a catch!',kg,rar:rarity(F.w),rec:rec&&!first,first:first&&!F.junk,junk:F.junk,gold:f.target.gold};}
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
  else if(f.state==='approach'){const s=f.target,dx=f.px-s.x,dz=f.pz-s.z,d=Math.hypot(dx,dz);
    bobber.position.set(f.px,Math.sin(tt*2.2)*0.015,f.pz);
    const reach=0.12+s.len*0.5;
    // it comes in in darts, and when it's close it stops to look, sometimes turning half away before it commits
    if(f.look>0){f.look-=dt;s.heading=Math.atan2(dx,dz)+(f.lookOff||0);fishSwim(s,dt,0);s.v=Math.min(s.v,0.3);if(f.look<=0)f.lookOff=0;}
    else if(d>reach){s.heading=Math.atan2(dx,dz)+Math.sin(f.t*1.3)*0.35*Math.min(1,d);fishSwim(s,dt,d<1.4?0.25:0.7);
      if(d<1.4&&!f.looked){f.looked=1;f.look=0.7+Math.random()*1.1;s.v*=0.2;if(Math.random()<0.4)f.lookOff=(Math.random()<0.5?-1:1)*(0.8+Math.random()*0.6);}}
    else{s.v=0;s.heading=Math.atan2(dx,dz);f.state='nibble';f.t=0;f.nibLeft=1+Math.floor(Math.random()*4);f.next=0.5+Math.random()*0.9;}}
  else if(f.state==='nibble'){let dip=0;
    if(f.t>=f.next){if(f.nibLeft>0){f.nibLeft--;f.dipT=0.2;f.target.nd=0.12+f.target.len*0.06;f.target.ph+=2;SFX.nibble();ripple(f.px,f.pz);f.next=f.t+0.8+Math.random()*1.0;}
      else{f.state='bite';f.t=0;f.target.thrash=1;f.target.nd=0.2;SFX.bite();ripple(f.px,f.pz,true);burst(f.px,0.05,f.pz,0xffffff,14,1.4,0.07,5);floatText(f.px,0.8,f.pz,'!','gold');}}
    if(f.dipT>0){f.dipT-=dt;dip=0.06;bend+=0.3*(f.dipT/0.2);taut=0.7;}/* each nibble tugs the tip */
    bobber.position.set(f.px,Math.sin(tt*2.2)*0.015-dip,f.pz);}
  else if(f.state==='bite'){bobber.position.set(f.px+Math.sin(tt*40)*0.02,-0.16,f.pz);/* hooked: the rod bows right over and shudders, and you lean back against it */
    bend=0.95+Math.sin(tt*38)*0.1;taut=1;rod.rotation.x=1.0+Math.sin(tt*23)*0.05;fishLean=-0.12;if(Math.random()<dt*10)emit(f.px,(f.wy||0)+0.03,f.pz,{vx:(Math.random()-0.5),vy:0.8,vz:(Math.random()-0.5),life:0.4,max:0.4,size:0.05,color:0xe8f4ff,g:5});
    if(f.t>f.win){endFishing('It got away…');return;}}
  if(!fishing)return;
  if(f.state!=='cast'){bendRod(bend);bobber.position.y+=f.wy||tideY;/* a river's surface, or the sea at today's tide */drawLine(bobber.position.x,bobber.position.y+0.18,bobber.position.z,taut,f.wy||tideY);}}

