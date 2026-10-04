/* =========================================================
   Rain and snow you can feel.
   Rain: dense streaks slanting with the wind (two layers, near and far), each one landing in a little ring on the ground
   or a ripple on the water; puddles that gather on open ground while it rains, shine, splash when you walk through them
   and dry up slowly after; and everything out in it darkens a touch while it's wet.
   Snow: soft round flakes in two sizes, fluttering down, near and far; and it settles. While it snows the tops of
   everything on your island (ground, trees, roofs, rocks, fences) slowly turn white, patchy at first, then a blanket, and
   melt away slowly after. Your footprints show in it.
   The settling and wetness are drawn in the main materials themselves (weatherLook: a few lines after their colour,
   whitening upward-facing surfaces by snow cover, darkening by wetness), driven by WXU.
   ========================================================= */
const WXU={cov:{value:S.snowCov||0},wet:{value:S.rain?0.8:0},ctr:{value:new T.Vector4(0,0,999,0)}};
function weatherLook(m){if(!m||m.userData.wxLook)return;m.userData.wxLook=1;const base=m.onBeforeCompile;
  m.onBeforeCompile=function(sh,r){if(base)base.call(this,sh,r);sh.uniforms.uSnowCov=WXU.cov;sh.uniforms.uWet=WXU.wet;sh.uniforms.uSnowC=WXU.ctr;
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uSnowCov;uniform float uWet;uniform vec4 uSnowC;')
      .replace('#include <color_fragment>',`#include <color_fragment>
      {
      #ifdef FLAT_SHADED
        vec3 vn_=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition)));
      #else
        vec3 vn_=normalize(vNormal);
      #endif
        vec3 wn_=(vec4(vn_,0.)*viewMatrix).xyz,wp_=cameraPosition+(vec4(-vViewPosition,0.)*viewMatrix).xyz;
        float up_=smoothstep(0.3,0.8,wn_.y),inR_=1.-smoothstep(uSnowC.z-6.,uSnowC.z,length(wp_.xz-uSnowC.xy));
        float n_=0.5+0.25*sin(wp_.x*2.1+sin(wp_.z*1.3))+0.25*sin(wp_.z*2.7+wp_.x*0.6);
        float sc_=clamp((uSnowCov*1.4-n_*0.5)*2.2,0.,1.)*up_*inR_;
        diffuseColor.rgb=mix(diffuseColor.rgb*(1.-0.2*uWet*up_),vec3(0.93,0.96,1.02),sc_);
      }`);};
  // (three caches programs by onBeforeCompile's source, which is now this same wrapper for every material: key it by the
  // original too, so each keeps its own shader)
  const key=(base?base.toString():'')+'|wx';m.customProgramCacheKey=()=>key;m.needsUpdate=true;}
for(const m of [vcMat,vcMatFlat,leafMat,bushMat,grassTopMat,sandMat,cliffMat,soilMat,cropBatchMat,fruitMat,grassMat,flowerMat,nearGrassMat])weatherLook(m);

// ---- rain ----
// (streaks with real width: hairlines vanish in the pixel pass)
const RAIN_N=520,rainMat2=new T.MeshBasicMaterial({color:0xe4eefa,transparent:true,opacity:0.32,depthWrite:false});
const rain2=new T.InstancedMesh(new T.BoxGeometry(0.028,1,0.028).translate(0,0.5,0),rainMat2,RAIN_N);rain2.frustumCulled=false;rain2.visible=false;rain2.count=0;scene.add(rain2);
const _rq=new T.Quaternion(),_rd=new T.Vector3(),_ry=new T.Vector3(0,1,0);
const rainD2=[];for(let i=0;i<RAIN_N;i++)rainD2.push({x:0,y:-1,z:0,s:0.8+Math.random()*0.5,l:0.45+Math.random()*0.4});
// splashes: little rings that open and fade where a drop lands (additive, so fading the colour to black hides them)
const SPL_N=160,splIM=new T.InstancedMesh(new T.RingGeometry(0.36,0.5,14).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.7,blending:T.AdditiveBlending,depthWrite:false}),SPL_N);
splIM.frustumCulled=false;splIM.count=0;for(let i=0;i<SPL_N;i++)splIM.setColorAt(i,_c.set(0));scene.add(splIM);const spl=[];
function splash(x,y,z,big){if(spl.length>=SPL_N)spl.shift();spl.push({x,y,z,t:0,big});}
// puddles on open ground: shiny grey-blue pools that grow while it rains and shrink as they dry
const PUD_N=22,pudIM=new T.InstancedMesh(new T.CircleGeometry(0.5,18).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x9ab0c8,transparent:true,opacity:0.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),PUD_N);
pudIM.frustumCulled=false;pudIM.count=0;scene.add(pudIM);let puds=[],pudAt=null,pudSplT=0;
function placePuddles(){puds=[];pudAt=[cam.tx,cam.tz];const R=Math.random;
  for(let it=0;it<240&&puds.length<PUD_N;it++){const x=Math.round(cam.tx+(R()-0.5)*30),z=Math.round(cam.tz+(R()-0.5)*30),t=landMap.get(K(x,z));
    if(t!=='grass'&&t!=='sand')continue;if(debrisAt(x,z)||objAt(x,z)||fixedAt(x,z)&&fixedAt(x,z)!=='path'||S.tiles[K(x,z)])continue;if(puds.some(p=>Math.abs(p.tx-x)<2&&Math.abs(p.tz-z)<2))continue;
    puds.push({tx:x,tz:z,x:x+(R()-0.5)*0.4,z:z+(R()-0.5)*0.4,s:0.5+R()*0.8,sx:0.8+R()*0.5,r:R()*3});}}
// ---- snow ----
const flakeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.45,'rgba(255,255,255,0.85)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);return new T.CanvasTexture(c);})();
const flakes=[0.34,0.2].map((sz,j)=>{const n=j?420:200,g=new T.BufferGeometry(),p=new Float32Array(n*3);g.setAttribute('position',new T.BufferAttribute(p,3));
  const m=new T.Points(g,new T.PointsMaterial({size:sz,map:flakeTex,transparent:true,opacity:0.95,depthWrite:false,color:0xffffff}));m.frustumCulled=false;m.visible=false;scene.add(m);
  const d=[];for(let i=0;i<n;i++)d.push({x:0,y:-99,z:0,ph:Math.random()*6.28,sp:0.55+Math.random()*0.5});return{m,g,p,d};});
let snowFall=0;
function snowingHere(){if(inside)return false;const isl=S.sea?null:curIsl(),b=isl?isl.biome:(S.sea?regionAt(vil.x,vil.z):'open');return !S.rain&&(wxNow()==='snow'&&(!isl||isl.home)||b==='snow');}
function groundY(x,z){const k=K(Math.round(x),Math.round(z));if(riverSurf.has(k))return[riverSurf.get(k),1];const t=landMap.get(k);return isLandT(t)?[topY(Math.round(x),Math.round(z)),0]:[tideY,1];}
let wxCtrSet=false;
function updateWeatherFx(dt,tt){
  if(!wxCtrSet&&islands[0]&&islands[0].grass){const h=islands[0];let r=0;for(const [x,z] of h.grass.concat(h.sand))r=Math.max(r,Math.hypot(x-h.cx,z-h.cz));WXU.ctr.value.set(h.cx,h.cz,r+4,0);wxCtrSet=true;}
  // wetness lags the rain: things soak quickly and dry slowly
  WXU.wet.value=clamp(WXU.wet.value+(rainFall>0.15&&!inside?dt/18:-dt/150),0,1);
  // snow settles while it snows on your island and melts away slowly after
  const homeSnow=wxNow()==='snow'&&!S.rain;WXU.cov.value=clamp(WXU.cov.value+(homeSnow?dt/80:-dt/(season()==='winter'?900:240)),0,1);S.snowCov=+WXU.cov.value.toFixed(3);
  // ---- rain streaks ----
  const rf=inside?0:rainFall,storm=wxNow()==='storm',vx=(wind*2.2+(storm?2.5:0.8)),vz=wind*0.6,vy=-(storm?20:16);
  rain2.visible=rf>0.02;rainMat2.opacity=0.32*rf*(storm?1.2:1);
  if(rain2.visible){const live=Math.floor(RAIN_N*Math.min(1,rf*(storm?1:0.8)));_rd.set(-vx,-vy,-vz).normalize();_rq.setFromUnitVectors(_ry,_rd);let n=0;
    for(let i=0;i<live;i++){const r=rainD2[i];
      if(r.y<-0.5){/* (re)start above the view, nearer drops more often */const near=i%3!==0,sp=near?14:30;r.x=cam.tx+(Math.random()-0.5)*sp-vx*0.6;r.z=cam.tz+(Math.random()-0.5)*sp;r.y=8+Math.random()*7;}
      r.x+=vx*dt*r.s;r.z+=vz*dt*r.s;r.y+=vy*dt*r.s;
      const [gy,wet]=groundY(r.x,r.z);if(r.y<=gy){if(i%2===0&&Math.abs(r.x-cam.tx)<13&&Math.abs(r.z-cam.tz)<13)splash(r.x,gy+0.02,r.z,wet);r.y=-1;continue;}
      const L=r.l*(storm?0.85:0.65);_m.compose(_v.set(r.x,r.y,r.z),_rq,_s.set(1,L,1));rain2.setMatrixAt(n++,_m);}
    rain2.count=n;rain2.instanceMatrix.needsUpdate=true;}
  // splashes
  {let n=0;for(let i=spl.length-1;i>=0;i--){const s=spl[i];s.t+=dt;const T0=s.big?0.55:0.3;if(s.t>T0){spl.splice(i,1);continue;}}
    for(const s of spl){const T0=s.big?0.55:0.32,q=s.t/T0,sc=(s.big?0.7:0.42)*(0.2+q);_m.compose(_v.set(s.x,s.y,s.z),_q.identity(),_s.set(sc,1,sc));splIM.setMatrixAt(n,_m);splIM.setColorAt(n,_c.setScalar((1-q)*(s.big?0.6:0.45)));n++;}
    splIM.count=n;splIM.instanceMatrix.needsUpdate=true;if(splIM.instanceColor)splIM.instanceColor.needsUpdate=true;}
  // puddles
  const wl=WXU.wet.value;
  if(wl>0.05&&!inside&&!S.sea){if(!pudAt||Math.hypot(cam.tx-pudAt[0],cam.tz-pudAt[1])>12)placePuddles();let n=0;
    for(const p of puds){const s=p.s*smooth(0.05,0.85,wl);if(s<0.02)continue;_e.set(0,p.r,0);_q.setFromEuler(_e);_m.compose(_v.set(p.x,topY(p.tx,p.tz)+0.012,p.z),_q,_s.set(s*p.sx,1,s));pudIM.setMatrixAt(n++,_m);
      // splash through it
      if(pudSplT<=0&&Math.hypot(vil.x-p.x,vil.z-p.z)<s*0.55&&Math.hypot(vil.x-(vil.tx??vil.x),vil.z-(vil.tz??vil.z))>0.2){pudSplT=0.28;noise(0.08,0.03,1400,1.5);
        for(let k=0;k<7;k++)emit(vil.x,topY(p.tx,p.tz)+0.05,vil.z,{vx:(Math.random()-0.5)*1.6,vy:1+Math.random()*1.2,vz:(Math.random()-0.5)*1.6,life:0.45,max:0.45,size:0.05,color:0xc8dcf0,g:7});splash(vil.x,topY(p.tx,p.tz)+0.02,vil.z,1);}}
    pudIM.count=n;pudIM.instanceMatrix.needsUpdate=true;pudIM.material.opacity=0.35+0.2*wl;}else pudIM.count=0;
  if(pudSplT>0)pudSplT-=dt;
  // ---- snowflakes ----
  snowFall=clamp(snowFall+(snowingHere()?dt:-dt)*0.4,0,1);
  for(const F of flakes){F.m.visible=snowFall>0.02;if(!F.m.visible)continue;F.m.material.opacity=0.95*snowFall;const live=Math.floor(F.d.length*snowFall);
    for(let i=0;i<F.d.length;i++){const f=F.d[i],o=i*3;if(i>=live){F.p[o+1]=-99;continue;}
      if(f.y<-50){f.x=cam.tx+(Math.random()-0.5)*30;f.z=cam.tz+(Math.random()-0.5)*30;f.y=groundY(f.x,f.z)[0]+Math.random()*11;}
      f.y-=f.sp*dt;f.x+=(wind*0.5+Math.sin(tt*1.1+f.ph)*0.35)*dt;f.z+=Math.cos(tt*0.8+f.ph*1.7)*0.3*dt;
      if(f.y<groundY(f.x,f.z)[0]){f.y=groundY(f.x,f.z)[0]+9+Math.random()*3;f.x=cam.tx+(Math.random()-0.5)*30;f.z=cam.tz+(Math.random()-0.5)*30;}
      if(f.x-cam.tx>15)f.x-=30;if(f.x-cam.tx<-15)f.x+=30;if(f.z-cam.tz>15)f.z-=30;if(f.z-cam.tz<-15)f.z+=30;
      F.p[o]=f.x;F.p[o+1]=f.y;F.p[o+2]=f.z;}
    F.g.attributes.position.needsUpdate=true;}}
