/* =========================================================
   Ambience and life around you: a soundscape that follows where you stand (wind, leaves, river, surf), morning mist
   and sunbeams through the woods, wildlife that flushes out as you walk, fish that leap, flocks passing over;
   and the small rewards of gathering: a streak that builds as you pick things up, and each find flying into your bag.
   Also `say`, the quiet caption over your head that stands in for most messages.
   ========================================================= */
// ---- a caption over your head instead of a message box: one line at a time, gone in a moment ----
let sayEl=null,sayT=0;
function say(html,icon){if(!sayEl){sayEl=document.createElement('div');sayEl.className='say';document.body.appendChild(sayEl);}
  sayEl.innerHTML=(icon?`<img class="px" src="${icon}" alt="">`:'')+`<span>${html}</span>`;sayT=Math.min(5,2.2+html.replace(/<[^>]+>/g,'').length*0.025);
  sayEl.classList.remove('on');void sayEl.offsetWidth;sayEl.classList.add('on');}
function updateSay(dt){if(!sayEl||sayT<=0)return;sayT-=dt;if(sayT<=0){sayEl.classList.remove('on');return;}
  const [sx,sy]=toScreen(vil.x,(S.sea?0.14:vil.y)+1.55,vil.z);sayEl.style.transform=`translate(${Math.round(sx)}px,${Math.round(sy)}px) translate(-50%,-100%)`;}

// ---- the gathering streak: every find within a few seconds of the last builds it; milestones pay out ----
const streak={n:0,t:0,el:null};
const STREAK_NOTES=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.5,1568];
function streakBump(){streak.n++;streak.t=7;const n=streak.n;
  pluck(STREAK_NOTES[Math.min(n-1,STREAK_NOTES.length-1)],0.03,0.5);
  if(n<2)return;if(!streak.el){streak.el=document.createElement('div');streak.el.className='streak';document.body.appendChild(streak.el);}
  streak.el.innerHTML=`<b>×${n}</b><span>gathering streak</span><i><u></u></i>`;streak.el.classList.add('on');streak.el.classList.remove('pop');void streak.el.offsetWidth;streak.el.classList.add('pop');
  if(n%5===0){const b=n*8;S.shells+=b;addXP(Math.ceil(n/5));flyShells(Math.min(10,4+n/5));SFX.coin();floatText(vil.x,1.6,vil.z,`Streak ×${n}! +${b}`,'gold');
    for(let i=0;i<14;i++)sparkle(vil.x+(Math.random()-0.5)*1.4,0.8+Math.random(),vil.z+(Math.random()-0.5)*1.4,pickR([0xfff0a0,0xffc8e0,0xbff4ff]));}}
function updateStreak(dt){if(streak.n===0)return;streak.t-=dt;if(streak.el){const u=streak.el.querySelector('u');if(u)u.style.width=Math.max(0,streak.t/7*100)+'%';}
  if(streak.t<=0){streak.n=0;if(streak.el)streak.el.classList.remove('on');}}
// a find sails off your head into the bag button
function flyItem(key){const ic=ICON[key],to=$('bMenu');if(!ic||!to)return;setTimeout(()=>{const [sx,sy]=toScreen(vil.x,(vil.y||0)+1.2,vil.z),r=to.getBoundingClientRect(),s=document.createElement('img');
  s.src=ic;s.className='flyitem';s.style.left=sx+'px';s.style.top=sy+'px';document.body.appendChild(s);
  requestAnimationFrame(()=>{s.style.transform=`translate(${r.left+r.width/2-sx-15}px,${r.top+r.height/2-sy-15}px) scale(.55)`;s.style.opacity='0.3';});
  setTimeout(()=>{s.remove();to.classList.remove('bump');void to.offsetWidth;to.classList.add('bump');tone(1300,0.03,'triangle',0.018);},560);},520);}

// ---- wildlife around you ----
let flushT=0,jumpT=8,flockT=25;
// walking through flowers and long grass stirs things up: a butterfly lifts off, a bird bursts from a bush
function stirWildlife(){if(flushT>0||S.sea||inside)return;const x=Math.round(vil.x),z=Math.round(vil.z),isl=curIsl();if(!isl||landMap.get(K(x,z))!=='grass')return;
  let flora=0,bush=null;for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(TOWN.flora&&TOWN.flora.has(K(x+dx,z+dz)))flora++;const d=debrisAt(x+dx,z+dz);if(d&&(d.k==='bush'||d.k==='weed'))bush=d;}
  const night=isNight(),r=Math.random();
  if(!night&&flora>0&&r<0.06+flora*0.015){const a=Math.random()*6.28;spawnBugAt(vil.x+Math.cos(a)*0.9,vil.z+Math.sin(a)*0.9,false);for(let i=0;i<5;i++)emit(vil.x,vil.y+0.2,vil.z,{vx:(Math.random()-0.5)*0.8,vy:0.8,vz:(Math.random()-0.5)*0.8,life:0.7,max:0.7,size:0.04,color:0x9ad05a,g:2});flushT=5;}
  else if(bush&&bush.k==='bush'&&r<0.08&&!night){critterAt('bird',bush.x,bush.z,true);noise(0.2,0.05,1800);flushT=6;}}
// a fish leaps out of the water near you, and leaves its shadow behind to cast at
function fishJump(){const isl=curIsl();if(!isl||isl.lava)return;let wx,wz,wy=0,riv=false;
  const rs=[];for(let dx=-7;dx<=7;dx++)for(let dz=-7;dz<=7;dz++){const k=K(Math.round(vil.x)+dx,Math.round(vil.z)+dz);if(riverSurf.has(k))rs.push([Math.round(vil.x)+dx,Math.round(vil.z)+dz,riverSurf.get(k)]);}
  if(rs.length&&Math.random()<0.6){const q=pickR(rs);wx=q[0]+(Math.random()-0.5)*0.4;wz=q[1]+(Math.random()-0.5)*0.4;wy=q[2]||0;riv=true;}
  else{let ok=false;for(let it=0;it<12&&!ok;it++){const a=Math.random()*6.28,d=3+Math.random()*5;wx=vil.x+Math.cos(a)*d;wz=vil.z+Math.sin(a)*d;const rx=Math.round(wx),rz=Math.round(wz);ok=!isLand(rx,rz)&&landMap.get(K(rx,rz))!=='river'&&landDist(wx,wz)>1.2;}if(!ok)return;wy=tideY;}
  const id=riv?chooseFish(isl.biome,false,true):chooseFish(regionAt(wx,wz),landDist(wx,wz)>2.8);if(!id||FISH[id].junk)return;
  const g=fishModel(FISH[id]);g.scale.setScalar(0.7);scene.add(g);const a=Math.random()*6.28;leaps.push({g,x:wx,z:wz,y:wy,dx:Math.cos(a)*0.8,dz:Math.sin(a)*0.8,t:0,id,riv});
  ripple(wx,wz,false);burst(wx,wy+0.05,wz,0xe8f4ff,8,1.1,0.05,5);if(Math.hypot(wx-vil.x,wz-vil.z)<9)noise(0.18,0.05,1400,1);}
const leaps=[];
function updateLeaps(dt){for(let i=leaps.length-1;i>=0;i--){const l=leaps[i];l.t+=dt;const u=l.t/0.7;
  l.g.position.set(l.x+l.dx*u,l.y+Math.sin(Math.min(1,u)*Math.PI)*0.8,l.z+l.dz*u);l.g.rotation.set(-Math.cos(u*Math.PI)*1.1,Math.atan2(l.dx,l.dz),0);
  if(u>=1){const x=l.x+l.dx,z=l.z+l.dz;scene.remove(l.g);leaps.splice(i,1);ripple(x,z,true);burst(x,l.y+0.05,z,0xe8f4ff,12,1.4,0.06,5);if(Math.hypot(x-vil.x,z-vil.z)<9)SFX.plop();
    if(!fishing)spawnShadowAt(x,z,l.id,l.riv?l.y:0);}}}
// a skein of birds passing over, high up
const flocks=[];const FLOCK_GEO=merge([P(BOX,0x3a3440,-0.14,0,0,0,0,0.35,0.26,0.02,0.07),P(BOX,0x3a3440,0.14,0,0,0,0,-0.35,0.26,0.02,0.07),P(SPH_XS,0x3a3440,0,0,0.02,0,0,0,0.07,0.05,0.12)]);
function spawnFlock(){const n=5+Math.floor(Math.random()*4),a=Math.random()*6.28,g=new T.Group(),ms=[];
  for(let i=0;i<n;i++){const m=new T.Mesh(FLOCK_GEO,vcMat);m.castShadow=false;const row=Math.ceil(i/2),sd=i%2?1:-1;m.position.set(sd*row*0.55,Math.random()*0.2,-row*0.5);g.add(m);ms.push(m);}
  g.position.set(cam.tx-Math.cos(a)*24,7+Math.random()*2,cam.tz-Math.sin(a)*24);g.rotation.y=Math.atan2(Math.cos(a),Math.sin(a));scene.add(g);flocks.push({g,ms,vx:Math.cos(a)*3.2,vz:Math.sin(a)*3.2,t:0});
  setTimeout(()=>{if(S.sound&&!S.sea)for(let i=0;i<3;i++)setTimeout(chirp,i*260);},3500);}
function updateFlocks(dt,tt){for(let i=flocks.length-1;i>=0;i--){const f=flocks[i];f.t+=dt;f.g.position.x+=f.vx*dt;f.g.position.z+=f.vz*dt;
  f.ms.forEach((m,j)=>{m.scale.set(1,1+Math.sin(tt*9+j)*0.6,1);m.rotation.z=Math.sin(tt*9+j)*0.35;});if(f.t>16){scene.remove(f.g);flocks.splice(i,1);}}}

// ---- light: morning mist, and sunbeams slanting through the trees early and late in the day ----
const RAY_TEX=(()=>{const c=document.createElement('canvas');c.width=16;c.height=64;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,64);
  g.addColorStop(0,'rgba(255,240,200,0)');g.addColorStop(0.35,'rgba(255,236,190,0.9)');g.addColorStop(1,'rgba(255,230,180,0)');x.fillStyle=g;x.fillRect(0,0,16,64);
  const h=x.createLinearGradient(0,0,16,0);h.addColorStop(0,'rgba(0,0,0,1)');h.addColorStop(0.5,'rgba(0,0,0,0)');h.addColorStop(1,'rgba(0,0,0,1)');x.globalCompositeOperation='destination-out';x.fillStyle=h;x.fillRect(0,0,16,64);
  return new T.CanvasTexture(c);})();
const rayMat=new T.MeshBasicMaterial({map:RAY_TEX,transparent:true,blending:T.AdditiveBlending,depthWrite:false,depthTest:false,opacity:0,side:T.DoubleSide,fog:false});/* shafts of light hang in the air in front of the leaves */
const RAY_GEO=new T.PlaneGeometry(1,1).translate(0,0.5,0);const rays=[];for(let i=0;i<7;i++){const m=new T.Mesh(RAY_GEO,rayMat);m.frustumCulled=false;m.visible=false;m.renderOrder=3;scene.add(m);rays.push({m,ph:Math.random()*6.28,x:0,z:0});}
let rayT=0,rayK=0;
function updateRays(dt,tt){const h=S.hour,golden=S.rain||S.sea||inside?0:Math.max(smooth(6,7.2,h)*(1-smooth(9.5,11,h)),smooth(15.5,16.8,h)*(1-smooth(18.6,19.4,h)));
  rayT-=dt;if(rayT<=0){rayT=2;/* re-seat them among the trees near you */const ts=S.debris.filter(d=>d.k==='tree'&&Math.abs(d.x-cam.tx)<9&&Math.abs(d.z-cam.tz)<9);rayK=Math.min(1,ts.length/6);
    for(const r of rays){if(r.m.visible&&Math.abs(r.x-cam.tx)<10&&Math.abs(r.z-cam.tz)<10)continue;if(!ts.length){r.m.visible=false;continue;}/* in a gap beside a tree, where the light gets through */const t=pickR(ts);let gx=t.x,gz=t.z;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1]])if(!debrisAt(t.x+a,t.z+b)&&isLand(t.x+a,t.z+b)){gx=t.x+a;gz=t.z+b;break;}r.x=gx+(Math.random()-0.5)*0.6;r.z=gz+(Math.random()-0.5)*0.6;r.ph=Math.random()*6.28;}}
  const a=golden*rayK;rayMat.opacity=a*0.5;const sunSide=h<12?1:-1;
  for(const r of rays){r.m.visible=a>0.02&&r.x!==0;if(!r.m.visible)continue;r.m.position.set(r.x,topY(Math.round(r.x),Math.round(r.z))||0.3,r.z);r.m.rotation.set(0,cam.yaw,0.42*sunSide);
    const w=0.7+0.3*Math.sin(tt*0.4+r.ph);r.m.scale.set(0.3+0.35*w,7,1);if(Math.random()<dt*0.8*a)emit(r.x+(Math.random()-0.5)*0.4,1+Math.random()*2,r.z+(Math.random()-0.5)*0.4,{vy:-0.05,life:3,max:3,size:0.03,color:0xfff4c8,g:0,sw:0.4,ph:Math.random()*6});}}

// ---- the soundscape follows you: wind always, leaves in the woods, the river when it's near, surf by the shore ----
let beds=null,envT=0;const env={sea:0,river:0,trees:0};
function bed(type,freq,q){const a=AC,s=a.createBufferSource();s.buffer=noiseBuf;s.loop=true;s.playbackRate.value=0.6+Math.random()*0.5;const f=a.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
  const g=a.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(a.destination);s.start(0,Math.random()*2);return{g,f};}
function startBeds(){if(beds||!AC||!noiseBuf)return;beds={wind:bed('lowpass',380,0.7),leaves:bed('highpass',3200,0.5),river:bed('bandpass',1100,0.7)};}
function senseEnv(){const x=Math.round(vil.x),z=Math.round(vil.z);let sea=9,riv=9,tr=0;
  for(let dx=-6;dx<=6;dx++)for(let dz=-6;dz<=6;dz++){const d=Math.hypot(dx,dz);if(d>6.5)continue;const k=K(x+dx,z+dz);
    if(riverSurf.has(k))riv=Math.min(riv,d);else if(!isLand(x+dx,z+dz))sea=Math.min(sea,d);const db=S.debris.length&&d<5?debrisAt(x+dx,z+dz):null;if(db&&db.k==='tree')tr++;}
  env.sea=S.sea?1:clamp(1-(sea-1)/6,0,1);env.river=clamp(1-(riv-0.5)/5,0,1);env.trees=clamp(tr/14,0,1);}
function updateBeds(dt,tt){if(!AC)return;if(!beds){if(noiseBuf)startBeds();return;}const on=S.sound&&!inside?1:0,k=Math.min(1,dt*1.5),gust=0.55+0.45*Math.sin(tt*0.23)*Math.sin(tt*0.61+1);
  beds.wind.g.gain.value=lerp(beds.wind.g.gain.value,on*(0.012+0.02*wind*gust+rainMix*0.01),k);beds.wind.f.frequency.value=260+gust*260;
  beds.leaves.g.gain.value=lerp(beds.leaves.g.gain.value,on*env.trees*(0.004+0.012*gust)*(S.rain?0.4:1),k);
  beds.river.g.gain.value=lerp(beds.river.g.gain.value,on*env.river*0.03,k);
  if(waves)waves.g.gain.value=lerp(waves.g.gain.value,on*(0.006+0.03*env.sea+rainMix*0.03),k);}
// a few voices of the island now and then: a woodpecker in the woods, an owl at night, frogs by the water after dark
let voiceT=6;
function islandVoice(){const night=nightF>0.6;
  if(!night&&env.trees>0.3&&Math.random()<0.35){for(let i=0;i<9;i++)setTimeout(()=>noise(0.025,0.05,1700+Math.random()*200,4),i*45);return;}
  if(night&&env.trees>0.2&&Math.random()<0.4){tone(392,0.35,'sine',0.02,370);setTimeout(()=>tone(370,0.55,'sine',0.018,330),420);return;}
  if(night&&env.river>0.2){for(let i=0;i<3;i++)setTimeout(()=>tone(160+Math.random()*30,0.09,'square',0.012,120),i*180);}}

function updateAmbience(dt,tt){updateSay(dt);updateStreak(dt);updateLeaps(dt);updateFlocks(dt,tt);updateRays(dt,tt);
  if(flushT>0)flushT-=dt;
  envT-=dt;if(envT<=0){envT=0.6;if(!S.sea&&!inside)senseEnv();else{env.river=env.trees=0;env.sea=S.sea?1:0;}}
  updateBeds(dt,tt);
  if(S.sea||inside)return;
  voiceT-=dt;if(voiceT<=0){voiceT=8+Math.random()*14;if(S.sound&&AC)islandVoice();}
  jumpT-=dt;if(jumpT<=0){jumpT=7+Math.random()*9;if(env.sea>0.15||env.river>0.1)fishJump();}
  flockT-=dt;if(flockT<=0){flockT=35+Math.random()*50;if(nightF<0.4&&!S.rain)spawnFlock();}
  // dawn mist: a soft haze over the island until the sun burns it off
  const mist=smooth(4.5,6,S.hour)*(1-smooth(7.5,9,S.hour))*0.5;fogBoost=Math.max(fogBoost,mist);}
