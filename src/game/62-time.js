/* =========================================================
   Time of day
   ========================================================= */
const KF=[
 {h:0,   sun:0x9ab0ff,si:.42,sky:0x5a6cb4,gnd:0x2c3466,hi:.78,water:0x1f3470,s1:0x3a5aa0,s2:0x2c4688,n:1,gl:0xc8d4ff,hz:0x141c46,zen:0x070b26,glow:0x4a5a9a,ga:.18},
 {h:4.8, sun:0x9aa8f0,si:.4,sky:0x6070b4,gnd:0x303868,hi:.76,water:0x243a78,s1:0x3e5ea4,s2:0x30488c,n:1,gl:0xc8d4ff,hz:0x1c2656,zen:0x0c1434,glow:0x7a6aa8,ga:.25},
 {h:6,   sun:0xff9a6a,si:.55,sky:0xffb896,gnd:0x5a4a6e,hi:.55,water:0x3a62b8,s1:0x86a4dc,s2:0x5d82cc,n:.25,gl:0xffe0c8,hz:0xf4b090,zen:0x5a78c8,glow:0xffa060,ga:1},
 {h:8,   sun:0xffe6c4,si:.95,sky:0xd8e6ff,gnd:0x76866a,hi:.62,water:0x3565cc,s1:0x7ea6e8,s2:0x5584da,n:0,gl:0xffffff,hz:0xb4d8ff,zen:0x5aa0ea,glow:0xfff0c0,ga:.3},
 {h:12.5,sun:0xffffff,si:1.05,sky:0xeaf2ff,gnd:0x80927a,hi:.68,water:0x376bd6,s1:0x82ade8,s2:0x588ade,n:0,gl:0xffffff,hz:0xbfe2ff,zen:0x3c8ce8,glow:0xfffbe8,ga:.15},
 {h:16.5,sun:0xffe0b0,si:.95,sky:0xffe6c8,gnd:0x7a7a6a,hi:.64,water:0x3a66c8,s1:0x86a6e0,s2:0x5a82d2,n:0,gl:0xffffff,hz:0xd4dcf4,zen:0x5896e0,glow:0xffe0a0,ga:.35},
 {h:18.3,sun:0xff8a54,si:.72,sky:0xff9c7a,gnd:0x5e4868,hi:.58,water:0x4c5aa8,s1:0x9a92cc,s2:0x6e70ba,n:.3,gl:0xffd0a0,hz:0xf89a78,zen:0x4a5aae,glow:0xffb050,ga:1},
 {h:19.4,sun:0xb07ad0,si:.4,sky:0x8a6ab0,gnd:0x3a3060,hi:.68,water:0x2e3a80,s1:0x505ea6,s2:0x3c4a92,n:.8,gl:0xe0c8ff,hz:0x4a3a78,zen:0x221f5a,glow:0xff7a6a,ga:.6},
 {h:21,  sun:0x9ab0ff,si:.42,sky:0x5a6cb4,gnd:0x2c3466,hi:.78,water:0x1f3470,s1:0x3a5aa0,s2:0x2c4688,n:1,gl:0xc8d4ff,hz:0x141c46,zen:0x070b26,glow:0x4a5a9a,ga:.18},
 {h:24,  sun:0x9ab0ff,si:.42,sky:0x5a6cb4,gnd:0x2c3466,hi:.78,water:0x1f3470,s1:0x3a5aa0,s2:0x2c4688,n:1,gl:0xc8d4ff,hz:0x141c46,zen:0x070b26,glow:0x4a5a9a,ga:.18},
];
const _a=new T.Color(),_b=new T.Color(),GREY=new T.Color(0x8a90a0);
let nightF=0,rainMix=S.rain?1:0;
function lerpCol(target,key,A,B,t,rm=0){target.copy(_a.set(A[key])).lerp(_b.set(B[key]),t);if(rm)target.lerp(GREY,rm*0.35);return target;}
function applyTime(){
  const h=S.hour;let i=0;while(i<KF.length-2&&KF[i+1].h<=h)i++;const A=KF[i],B=KF[i+1],t=(h-A.h)/(B.h-A.h);
  const rm=rainMix;
  lerpCol(sun.color,'sun',A,B,t,rm);lerpCol(hemi.color,'sky',A,B,t,rm);lerpCol(hemi.groundColor,'gnd',A,B,t,rm);
  hemi.intensity=lerp(A.hi,B.hi,t)*(1-rm*0.1);
  const dip=smooth(0,0.5,Math.abs(h-5.5))*smooth(0,0.5,Math.abs(h-19.25));
  sun.intensity=lerp(A.si,B.si,t)*(1-rm*0.55)*(0.25+0.75*dip);
  lerpCol(waterMat.color,'water',A,B,t,rm);lerpCol(s1Mat.color,'s1',A,B,t,rm);lerpCol(s2Mat.color,'s2',A,B,t,rm);lerpCol(glintMat.color,'gl',A,B,t);
  lerpCol(skyHz,'hz',A,B,t,rm);lerpCol(skyZen,'zen',A,B,t,rm);lerpCol(skyGlow,'glow',A,B,t);skyGA=lerp(A.ga,B.ga,t)*(1-rm*0.8);scene.fog.color.copy(skyHz);
  nightF=lerp(A.n,B.n,t);
  let tt;if(h>=5.5&&h<19.25)tt=(h-5.5)/13.75;else tt=((h-19.25+24)%24)/10.25;
  const az=lerp(-1.25,1.25,tt)+0.6,el=0.28+Math.sin(tt*Math.PI)*0.9;
  sun.position.set(cam.tx+Math.cos(el)*Math.sin(az)*32,Math.sin(el)*32,cam.tz+Math.cos(el)*Math.cos(az)*32);sun.target.position.set(cam.tx,0,cam.tz);
  glowMat.emissiveIntensity=nightF*1.3+rm*0.2;poolMat.opacity=nightF*0.55;lumMat.emissiveIntensity=0.6+nightF*0.8;
  moonMat.emissiveIntensity=0.35+nightF*0.9;ffMat.opacity=nightF*0.95;starMat.uniforms.op.value=nightF*(1-rm);
}
function timeName(h){if(h<5)return'night';if(h<7)return'dawn';if(h<11)return'morning';if(h<14)return'midday';if(h<17)return'afternoon';if(h<19.3)return'dusk';if(h<22)return'evening';return'night';}
function clockStr(h){let hh=Math.floor(h),mm=Math.floor((h-hh)*6)*10;const ap=hh<12?'am':'pm';hh=hh%12||12;return hh+':'+String(mm).padStart(2,'0')+' '+ap;}

/* =========================================================
   Simulation
   ========================================================= */
let sprayT=0;
function dawn(quiet){
  S.day++;for(const k in S.tiles)S.tiles[k].w=0;regrowDebris();
  S.rain=Math.random()<0.18;S.rainUntil=S.rain&&Math.random()<0.6?11+Math.random()*5:0;S.meteor=false;
  const wishes=Math.min(4,S.wishes||0);S.wishes=0;for(let i=0;i<wishes;i++){const c=islands[0].sand.filter(([x,z])=>freeTile(x,z));if(c.length){const [x,z]=pickR(c);S.finds.push({k:'starfrag',x,z});}}
  if(wishes&&!quiet)setTimeout(()=>toast('Star fragments washed up on your beach overnight!','rare',ICON['g:starfrag']),1200);
  if(S.rain)for(const k in S.tiles)S.tiles[k].w=1;
  let spr=0;for(const o of S.objs)if(o.k==='sprinkler'){spr++;for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const t=S.tiles[K(o.x+dx,o.z+dz)];if(t)t.w=1;}}
  const un=CROP_IDS.filter(id=>CROPS[id].lvl<=level());S.demand=pickR(un);
  for(let i=0;i<2;i++)spawnFind(true,islands[0]);for(let i=0;i<2;i++)spawnWeed(true);makeOrders();
  if(!quiet){rebuildSoil();syncLife();if(spr&&!S.rain){sprayT=2.5;}
    toast(`Day ${S.day} — ${S.rain?'rain is watering everything':'crops are thirsty'}. New orders are in, and wild plants have regrown.`,'',ICON.sprout);}
}
function rollVariant(x,z,mystery){
  const b=bonus.get(K(x,z));let boost=1+(b?Math.min(3,b.clover)*0.5:0);if(mystery)boost*=3;
  const r=Math.random();let acc=0;
  for(const id of ['rainbow','crystal','golden','moonlit','giant']){const v=VAR[id];const ch=id==='moonlit'?(isNight()?v.chance:0):v.chance;acc+=ch*boost;if(r<acc)return id;}
  return'normal';
}
function growCrops(dt,quiet,out){
  const night=isNight();
  for(const k in S.tiles){const t=S.tiles[k],c=t.crop;if(!c||c.p>=1||!t.w)continue;const C=CROPS[c.t];
    let r=hasWindmill?1.15:1;if(C.night)r*=night?1:0;if(C.day)r*=night?0.4:1.4;const b=bonus.get(k);if(b&&b.bee)r*=1.3;if(weedSlow.has(k))r*=0.75;
    if(r<=0)continue;const s0=stageOf(c.p);c.p=Math.min(1,c.p+dt*r/C.grow);
    if(c.p>=1){const [x,z]=k.split(',').map(Number);c.v=rollVariant(x,z,c.m);if(out)out.push(c);
      if(!quiet){syncCrop(k);if(c.v!=='normal'){const V=VAR[c.v];toast(`A <b>${V.name} ${C.name}</b> is ready to harvest!`,'rare',seedIcon(c.t),c.v);SFX.rare();burst(x,0.9,z,0xfff0a0,14,1.4,0.07,2);}else SFX.pop();}}
    else if(!quiet&&stageOf(c.p)!==s0)syncCrop(k);}
}
function advance(dt){const prev=S.hour;S.hour+=dt*24/DAY_LEN;if(S.hour>=24)S.hour-=24;if(prev<6&&S.hour>=6)dawn(false);if(prev<19&&S.hour>=19)duskEvent();
  if(S.rain&&S.rainUntil&&S.hour>=S.rainUntil&&S.hour<19&&S.hour>6)stopRain();growCrops(dt,false);}
function simulate(sec){const out=[];let left=sec;while(left>0){const d=Math.min(1,left);left-=d;const prev=S.hour;S.hour+=d*24/DAY_LEN;if(S.hour>=24)S.hour-=24;if(prev<6&&S.hour>=6)dawn(true);growCrops(d,true,out);}return out;}

