/* =========================================================
   Atmosphere: shore waves, footprints, drifting sky, falling petals,
   shooting stars, rainbows and a gentle soundscape
   ========================================================= */
let devSpeed=1,wind=0.4,windT=0;

// --- waves lapping at every shoreline ---
const FOAMN=700;
const foamMat=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.7,depthWrite:false});
const foamIM=new T.InstancedMesh(new T.PlaneGeometry(1.04,0.2).rotateX(-Math.PI/2),foamMat,FOAMN);foamIM.frustumCulled=false;foamIM.count=0;scene.add(foamIM);
function updateFoam(tt){let n=0;_s.set(1,1,1);
  for(const isl of islands){if(!isl.edges)continue;const R=islR(isl)/0.62+30;if(Math.hypot(isl.cx-cam.tx,isl.cz-cam.tz)>R)continue;
    for(const e of isl.edges){if(n>=FOAMN)break;const dx=e[0]-cam.tx,dz=e[1]-cam.tz;if(dx*dx+dz*dz>1000)continue;
      const w=0.5+0.5*Math.sin(tt*1.3+e[4]),off=0.08+w*0.24;_e.set(0,Math.atan2(e[2],e[3]),0);_q.setFromEuler(_e);
      _m.compose(_v.set(e[0]+e[2]*off,0.028,e[1]+e[3]*off),_q,_s.set(1,1,0.35+(1-w)*0.9));foamIM.setMatrixAt(n++,_m);}}
  foamIM.count=n;foamIM.instanceMatrix.needsUpdate=true;foamMat.opacity=0.55+0.2*(1-nightF);}

// --- footprints in the sand, dust and footsteps ---
const FPN=70;const fpIM=new T.InstancedMesh(new T.PlaneGeometry(0.1,0.15).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xb89a6a,transparent:true,opacity:0.55,depthWrite:false}),FPN);
fpIM.frustumCulled=false;fpIM.count=0;scene.add(fpIM);const prints=[];let stepAcc=0,stepSide=1,lastVX=null,lastVZ=null;
function footstep(){const x=vil.x,z=vil.z,k=K(Math.round(x),Math.round(z)),t=landMap.get(k);if(!isLandT(t))return;stepSide=-stepSide;
  const r=villager.rotation.y,ox=Math.cos(r)*0.07*stepSide,oz=-Math.sin(r)*0.07*stepSide;
  if(t==='sand'){prints.push({x:x+ox,z:z+oz,r,age:0});if(prints.length>FPN)prints.shift();emit(x,0.33,z,{vx:(Math.random()-0.5)*0.6,vy:0.5,vz:(Math.random()-0.5)*0.6,life:0.4,max:0.4,size:0.05,color:0xe8d4a8,g:2});}
  else if(Math.random()<0.3)emit(x,topY(Math.round(x),Math.round(z))+0.05,z,{vx:(Math.random()-0.5)*0.5,vy:0.6,vz:(Math.random()-0.5)*0.5,life:0.45,max:0.45,size:0.04,color:0x6aa843,g:3});
  if(S.sound&&AC)noise(0.05,t==='sand'?0.025:0.018,t==='sand'?1600:800,1.2);}
function updatePrints(dt){let n=0;for(const p of prints){p.age+=dt;const s=p.age<6?1:Math.max(0,1-(p.age-6)/3);if(s<=0)continue;
  _e.set(0,p.r,0);_q.setFromEuler(_e);_m.compose(_v.set(p.x,TOP.sand+0.012,p.z),_q,_s.set(s,1,s));fpIM.setMatrixAt(n++,_m);}
  fpIM.count=n;fpIM.instanceMatrix.needsUpdate=true;}

// --- sky: drifting clouds, the moon, shooting stars, rainbows ---
const skyCloudMat=new T.MeshBasicMaterial({vertexColors:true,fog:false,transparent:true,opacity:0.95,depthWrite:false});
const skyClouds=[];
for(let i=0;i<18;i++){const R=mulberry(i*97+11),p=[];const n=5+Math.floor(R()*4);
  for(let j=0;j<n;j++){const x=(j-n/2)*0.8+(R()-0.5)*0.4,s=0.9+R()*0.9;p.push(P(ICO,0xffffff,x,s*0.3,(R()-0.5)*0.6,0,R()*3,0,s*1.4,s,s*1.1),P(ICO,0xdfe6f2,x,0,(R()-0.5)*0.6,0,R()*3,0,s*1.3,s*0.5,s));}
  const m=new T.Mesh(merge(p),skyCloudMat);m.frustumCulled=false;m.renderOrder=-1;scene.add(m);
  skyClouds.push({m,a:i/18*6.283+R()*0.3,d:120+R()*50,f:0.25+R()*0.7,s:4+R()*3});}
const moon=new T.Group();
{const disc=new T.Mesh(new T.CircleGeometry(5,24),new T.MeshBasicMaterial({color:0xfff4d6,fog:false,transparent:true}));moon.add(disc);
  for(const [x,y,r] of [[-1.6,1,1.1],[1.4,-0.8,1.4],[0.4,2.2,0.7],[-0.6,-2,0.8]]){const c=new T.Mesh(new T.CircleGeometry(r,14),new T.MeshBasicMaterial({color:0xece0bc,fog:false,transparent:true}));c.position.set(x,y,0.05);moon.add(c);}
  const halo=new T.Mesh(new T.CircleGeometry(9,24),new T.MeshBasicMaterial({color:0xfff4d6,fog:false,transparent:true,opacity:0.12,depthWrite:false}));halo.position.z=-0.1;moon.add(halo);
  moon.traverse(o=>{o.frustumCulled=false;});scene.add(moon);}
const shootGeo=new T.BufferGeometry();shootGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));
const shootLine=new T.Line(shootGeo,new T.LineBasicMaterial({color:0xfffbe8,transparent:true,fog:false}));shootLine.frustumCulled=false;shootLine.visible=false;scene.add(shootLine);
let shoot=null;
function spawnShootingStar(){const side=Math.random()<0.5?1:-1;
  shoot={th:cam.yaw+Math.PI+(Math.random()-0.5)*0.5-side*0.25,f:0.75+Math.random()*0.25,vth:side*0.45,vf:-0.55,t:0,life:1.2,wished:false};
  shootLine.visible=true;if(!S.starTip){S.starTip=1;toast('A shooting star! Tap quickly while it falls to make a wish.','',ICON.star);}}
function makeWish(){if(!shoot||shoot.wished)return;shoot.wished=true;S.wishes=(S.wishes||0)+1;SFX.rare();
  for(let i=0;i<12;i++)sparkle(vil.x,1.2,vil.z,0xfff6c0);toast('You wished upon a shooting star… something might wash ashore tomorrow.','rare',ICON.star);}
const RB_COLS=[0xe8504a,0xf09040,0xf6d04a,0x6ac860,0x4a9ae8,0x8a6ad0];const rainbow=new T.Group();
RB_COLS.forEach((c,i)=>{const m=new T.Mesh(new T.TorusGeometry(58-i*2.2,1.1,4,64,Math.PI),new T.MeshBasicMaterial({color:c,fog:false,transparent:true,opacity:0,depthWrite:false}));m.frustumCulled=false;rainbow.add(m);});
rainbow.visible=false;scene.add(rainbow);let rainbowT=0;
function stopRain(){S.rain=false;S.rainUntil=0;if(S.hour>7&&S.hour<18){rainbowT=50;toast('The rain has stopped… look, a rainbow!','rare',ICON.star);}}
function duskEvent(){S.meteor=!S.rain&&Math.random()<0.22;if(S.meteor)toast('Tonight there will be a meteor shower! Tap the sky when a star falls to make a wish.','rare',ICON.star);}
const STAR_T=[],STAR_F=[];for(let i=0;i<STARN;i++){STAR_T.push(Math.random()*6.283);STAR_F.push(Math.random()*1.3);}
function skyPos(theta,f,d,out,curved=true){const cp=camera.position,hc=cp.y,aT=cam.pitch-camera.fov/2*Math.PI/180,aH=Math.atan(2*Math.sqrt(Math.max(0.05,hc)*CURVE)),a=lerp(aH,aT,f);
  return out.set(cp.x+Math.sin(theta)*d,hc-d*Math.tan(a)+(curved?CURVE*d*d:0),cp.z+Math.cos(theta)*d);}
function skySpan(d){const hc=camera.position.y,aT=cam.pitch-camera.fov/2*Math.PI/180,aH=Math.atan(2*Math.sqrt(Math.max(0.05,hc)*CURVE));return d*(Math.tan(aH)-Math.tan(aT));}
function updateSky(dt,tt){
  const cp=camera.position,sky=skyHz,night=nightF,fwd=cam.yaw+Math.PI;
  for(const c of skyClouds){c.a+=dt*0.004*(0.5+wind);skyPos(c.a,c.f,c.d,c.m.position);c.m.scale.setScalar(c.s*c.d/140);c.m.lookAt(cp.x,c.m.position.y,cp.z);}
  skyCloudMat.color.setRGB(1,1,1).lerp(sky,0.25+rainMix*0.35).lerp(skyGlow,skyGA*0.45).multiplyScalar(1-night*0.6);skyCloudMat.opacity=0.95;
  moon.visible=night>0.05;
  if(moon.visible){skyPos(fwd+0.28,0.55,150,moon.position);moon.scale.setScalar(0.8);moon.lookAt(cp);moon.traverse(o=>{if(o.material)o.material.opacity=(o.material.color.getHex()===0xfff4d6&&o.geometry.parameters.radius===9?0.12:1)*night*(1-rainMix);});}
  stars.visible=night>0.02;if(stars.visible){const pa=starGeo.attributes.position.array;for(let i=0;i<STARN;i++){skyPos(STAR_T[i],STAR_F[i],190,_v,false);pa[i*3]=_v.x;pa[i*3+1]=_v.y;pa[i*3+2]=_v.z;}starGeo.attributes.position.needsUpdate=true;}
  // shooting stars
  if(!shoot&&night>0.8&&!S.rain&&Math.random()<dt*(S.meteor?0.35:0.025))spawnShootingStar();
  if(shoot){shoot.t+=dt;shoot.th+=shoot.vth*dt;shoot.f+=shoot.vf*dt;const pa=shootGeo.attributes.position.array,tl=0.18;
    skyPos(shoot.th,shoot.f,140,_v);pa[0]=_v.x;pa[1]=_v.y;pa[2]=_v.z;skyPos(shoot.th-shoot.vth*tl,shoot.f-shoot.vf*tl,140,_v);pa[3]=_v.x;pa[4]=_v.y;pa[5]=_v.z;shootGeo.attributes.position.needsUpdate=true;
    shootLine.material.opacity=Math.sin(Math.min(1,shoot.t/shoot.life)*Math.PI);if(shoot.t>shoot.life){shoot=null;shootLine.visible=false;}}
  // rainbow opposite the sun
  if(rainbowT>0){rainbowT-=dt;rainbow.visible=true;skyPos(fwd+0.2,-0.05,175,rainbow.position);rainbow.scale.setScalar(skySpan(175)*0.95/58);rainbow.lookAt(cp.x,rainbow.position.y,cp.z);
    const o=Math.min(1,rainbowT/8,(50-rainbowT)/4)*0.5*(1-night);rainbow.children.forEach(m=>m.material.opacity=o);}else rainbow.visible=false;
}

// --- falling petals, leaves, snow, embers and spores around the player ---
const MOTEN=150,moteGeo=new T.BufferGeometry(),motePos=new Float32Array(MOTEN*3),moteCol=new Float32Array(MOTEN*3);
moteGeo.setAttribute('position',new T.BufferAttribute(motePos,3));moteGeo.setAttribute('color',new T.BufferAttribute(moteCol,3));
const moteMat=new T.PointsMaterial({size:3,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:0.95,depthWrite:false});
const motes=new T.Points(moteGeo,moteMat);motes.frustumCulled=false;scene.add(motes);
const MOTE_KINDS={petals:{n:40,size:3,cols:[0xf7c3d3,0xfbe3ea,0xffffff],vy:-0.35,sway:0.7},leaves:{n:65,size:3,cols:[0xe8803a,0xd8502a,0xf0b040,0xb8602a],vy:-0.5,sway:0.9},
  snow:{n:150,size:2,cols:[0xffffff,0xe8f0ff],vy:-0.6,sway:0.4},embers:{n:60,size:2,cols:[0xff9a3a,0xffcf6a,0xff6a2a],vy:0.7,sway:0.5},
  pollen:{n:45,size:2,cols:[0xfff4b0,0xffffff],vy:-0.05,sway:0.25},spores:{n:55,size:2,cols:[0xc8f0a8,0xe0ffc8],vy:0.12,sway:0.3}};
let moteKind='',moteSt=[];
function wantMotes(){if(S.rain)return'';const isl=S.sea?null:curIsl(),b=isl?isl.biome:(S.sea?regionAt(vil.x,vil.z):'open');const night=nightF>0.6;
  if(b==='snow')return'snow';if(b==='autumn')return'leaves';if(b==='volcano')return'embers';if(b==='swamp')return'spores';
  if(night)return'';if(b==='home'||b==='meadow')return'petals';if(b==='tropic'||b==='pine')return'pollen';return'';}
function updateMotes(dt,tt){const k=wantMotes();
  if(k!==moteKind){moteKind=k;moteSt=[];const K2=MOTE_KINDS[k];moteGeo.setDrawRange(0,K2?K2.n:0);
    if(K2){moteMat.size=K2.size;for(let i=0;i<K2.n;i++){const c=_c.set(K2.cols[i%K2.cols.length]);moteCol.set([c.r,c.g,c.b],i*3);
      moteSt.push({x:cam.tx+(Math.random()-0.5)*28,y:Math.random()*8,z:cam.tz+(Math.random()-0.5)*28,ph:Math.random()*6.28,sp:0.6+Math.random()*0.8});}moteGeo.attributes.color.needsUpdate=true;}}
  const K2=MOTE_KINDS[moteKind];if(!K2)return;
  for(let i=0;i<moteSt.length;i++){const m=moteSt[i];m.y+=K2.vy*m.sp*dt;m.x+=(wind*0.8+Math.sin(tt*1.2+m.ph)*K2.sway)*dt;m.z+=Math.cos(tt*0.9+m.ph)*K2.sway*dt;
    if(K2.vy<0&&m.y<0.1)m.y=8;if(K2.vy>0&&m.y>8){m.y=0.3;}
    if(m.x-cam.tx>14)m.x-=28;if(m.x-cam.tx<-14)m.x+=28;if(m.z-cam.tz>14)m.z-=28;if(m.z-cam.tz<-14)m.z+=28;
    motePos[i*3]=m.x;motePos[i*3+1]=m.y;motePos[i*3+2]=m.z;}
  moteGeo.attributes.position.needsUpdate=true;moteMat.opacity=moteKind==='snow'||moteKind==='embers'?0.95:0.9*(1-nightF*0.7);}

// --- soundscape: music box melody, birdsong, crickets, rain ---
const SCALES={day:[523.25,587.33,659.25,783.99,880,1046.5,1174.66],eve:[392,440,523.25,587.33,659.25,783.99],night:[293.66,329.63,392,440,493.88,587.33]};
let musT=1,beat=0,mel=2,birdT=4,crickT=3;
function pluck(f,v=0.02,d=0.9){const a=AC;if(!a||!S.sound)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type='triangle';o.frequency.value=f;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+0.05);}
function chirp(){const a=AC;if(!a||!S.sound)return;const n=2+Math.floor(Math.random()*3),base=2200+Math.random()*1400;
  for(let i=0;i<n;i++){const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*0.11;o.type='sine';o.frequency.setValueAtTime(base,t);o.frequency.exponentialRampToValueAtTime(base*1.35,t+0.07);
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.012,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+0.1);}}
function crickets(){for(let i=0;i<6;i++)setTimeout(()=>noise(0.03,0.012,4800,6),i*55);}
function updateAudio(dt){if(!AC||!S.sound)return;
  if(waves){waves.g.gain.value=0.018+rainMix*0.035;if(waves.f)waves.f.frequency.value=420+rainMix*1600;}
  if(S.music!==false){musT-=dt;if(musT<=0){const night=nightF>0.6,sc=night?SCALES.night:S.hour>16?SCALES.eve:SCALES.day;musT=night?0.85:0.55;beat++;
    mel=clamp(mel+Math.round((Math.random()-0.5)*3),0,sc.length-1);if(Math.random()<(night?0.45:0.6))pluck(sc[mel],night?0.014:0.017,night?1.4:0.9);
    if(beat%8===0)pluck(sc[0]/2,0.02,1.8);if(beat%8===4)pluck(sc[2]/2,0.014,1.4);}}
  const land=!S.sea;
  if(nightF<0.3&&!S.rain&&land){birdT-=dt;if(birdT<=0){birdT=3+Math.random()*7;chirp();}}
  if(nightF>0.6&&!S.rain&&land){crickT-=dt;if(crickT<=0){crickT=1.5+Math.random()*3;crickets();}}}

function updateAtmos(dt,tt){
  windT-=dt;if(windT<=0){windT=4+Math.random()*6;}wind=lerp(wind,0.3+0.5*Math.sin(tt*0.13)+0.25*Math.sin(tt*0.41),Math.min(1,dt));
  updateFoam(tt);updatePrints(dt);updateSky(dt,tt);updateMotes(dt,tt);updateAudio(dt);
  if(!S.sea){if(lastVX!==null){const d=Math.hypot(vil.x-lastVX,vil.z-lastVZ);if(d>0.001&&d<1){stepAcc+=d;if(stepAcc>0.3){stepAcc=0;footstep();}}}
    else stepAcc=0;}
  lastVX=vil.x;lastVZ=vil.z;
  // idle: glance around like a villager
  if(!S.sea&&!fishing&&!caught&&vil.idle>2.5)villager.rotation.y+=Math.sin(tt*0.9)*0.006;
  // swamp islands hold a low mist
  const sw=(curIsl()||{}).biome==='swamp'?1:0;fogBoost=lerp(fogBoost,sw,Math.min(1,dt*0.8));
}
let fogBoost=0;

