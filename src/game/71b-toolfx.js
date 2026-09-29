/* =========================================================
   What tools leave behind: holes you dig, flung earth, wood chips, and trees that topple when you fell them
   ========================================================= */
// ---- holes: a dark pit, a ring of turned earth and a little spoil heap to one side; they settle back in after a while ----
function holeParts(sand){const pit=sand?0x6a5436:0x24160e,wall=sand?0xb89c6a:0x4a3220,cl=sand?[0xe0c890,0xcdb27a]:[0x6a4a30,0x7c5a3a],R=mulberry(7),p=[];
  p.push(P(CYL12,wall,0,0.012,0,0,0,0,0.7,0.024,0.62),P(CYL12,pit,0,0.02,0,0,0,0,0.5,0.024,0.43));
  for(let i=0;i<10;i++){const a=i/10*6.283+R()*0.3;p.push(P(SPH_XS,cl[i%2],Math.cos(a)*0.36,0.03,Math.sin(a)*0.31,0,a,0,0.13+R()*0.05,0.07,0.1));}
  p.push(PG(SPH_LO,cl[1],cl[0],0.62,0.02,0.05,0,0.3,0,0.46,0.2,0.36));for(let i=0;i<4;i++)p.push(P(SPH_XS,cl[i%2],0.5+R()*0.3,0.1+R()*0.04,-0.1+R()*0.3,0,0,0,0.1,0.08,0.09));
  return p;}
const HOLE_GEO=[merge(holeParts(false)),merge(holeParts(true))];
const holes=[];
function holeAt(x,z,size){let h=holes.find(q=>q.x===x&&q.z===z);
  if(!h){const sand=landMap.get(K(x,z))==='sand',m=new T.Mesh(HOLE_GEO[sand?1:0],vcMat);m.receiveShadow=true;m.castShadow=false;m.frustumCulled=false;
    m.position.set(x,topY(x,z),z);m.rotation.y=Math.atan2(vil.x-x,vil.z-z)+1.9;/* the heap goes off to your side */m.scale.setScalar(0.01);scene.add(m);
    h={x,z,m,s:0.01,to:0,t:0};holes.push(h);if(holes.length>10)holes[0].t=1e9;}
  h.to=Math.max(h.to,size);h.t=0;return h;}
function updateHoles(dt){for(let i=holes.length-1;i>=0;i--){const h=holes[i];h.t+=dt;const want=h.t>150?0:h.to;/* after a couple of minutes it fills back in */
  h.s+=(want-h.s)*Math.min(1,dt*(want>h.s?12:0.8));h.m.scale.set(h.s,Math.min(1,h.s*1.2),h.s);if(want===0&&h.s<0.03){scene.remove(h.m);holes.splice(i,1);}}}
// earth flung off the blade in an arc, off to one side
function dirtFlick(x,z,n=10,sand){const y=topY(x,z),a0=Math.atan2(vil.x-x,vil.z-z)+1.9,cols=sand?[0xe0c890,0xcdb27a]:[0x6a4a30,0x8a6440,0x5a3c26];
  for(let i=0;i<n;i++){const a=a0+(Math.random()-0.5)*0.9,sp=0.9+Math.random()*1.1;emit(x,y+0.12,z,{vx:Math.sin(a)*sp,vy:1.8+Math.random()*1.4,vz:Math.cos(a)*sp,life:0.8,max:0.8,size:0.05+Math.random()*0.04,color:pickR(cols),g:7});}}
// one stab of the shovel into a dig spot: a hole opens a little more each time
function digStab(x,z,size){const sand=landMap.get(K(x,z))==='sand';holeAt(x,z,size);dirtFlick(x,z,size<1?8:12,sand);noise(0.12,0.1,sand?900:380,0.8);vil.hop=Math.max(vil.hop,0.12);}
// wood chips kicked out of a trunk towards you
function chips(x,z,y){const a0=Math.atan2(vil.x-x,vil.z-z);for(let i=0;i<9;i++){const a=a0+(Math.random()-0.5)*1.6,sp=0.8+Math.random()*1.2;
  emit(x+Math.sin(a0)*0.15,y,z+Math.cos(a0)*0.15,{vx:Math.sin(a)*sp,vy:1+Math.random()*1.4,vz:Math.cos(a)*sp,life:0.7,max:0.7,size:0.04+Math.random()*0.03,color:pickR([0xd8b080,0xb08050,0xe8c898]),g:6,spin:1});}}

// ---- felling: the tree creaks, tips away from you, speeds up, hits the ground with a thump and a bounce, then is gone ----
const falls=[];
function fellTree(d){const hd=Math.atan2(d.x-vil.x,d.z-vil.z),sc=d.sc||1,g=new T.Group(),m=new T.Mesh(debrisGeo('tree',d.v,false),leafMat);
  m.rotation.y=(d.r||0)-hd;m.scale.setScalar(sc);m.castShadow=true;m.frustumCulled=false;g.rotation.order='YXZ';g.rotation.y=hd;g.position.set(d.x,topY(d.x,d.z),d.z);g.add(m);scene.add(g);
  falls.push({g,m,a:0.03,w:0.35,t:0,hit:0,gone:0,x:d.x,z:d.z,hd,sc});tone(95,0.55,'sawtooth',0.025,70);setTimeout(()=>tone(80,0.4,'sawtooth',0.02,60),260);floatText(d.x,1.9,d.z,'Timber!','gold');}
function updateFalls(dt){for(let i=falls.length-1;i>=0;i--){const f=falls[i];f.t+=dt;
  if(f.t<0.4){f.g.rotation.x=0.02+Math.sin(f.t*45)*0.015*(1-f.t/0.4);/* a shudder and a creak before it goes */continue;}
  if(f.hit<2){f.w+=(Math.sin(f.a)*5.5+0.4)*dt;f.a+=f.w*dt;
    if(f.a>=1.48){f.a=1.48;if(!f.hit){f.hit=1;f.w=-f.w*0.22;const s=season(),lc=s==='autumn'?[0xe8803a,0xf4a444]:s==='winter'?[0xffffff,0xdce8f2]:[0x6ab84a,0x4a9a3a],y=topY(f.x,f.z);
        noise(0.4,0.14,180,0.7);tone(70,0.25,'sine',0.08,45);camShake=Math.max(camShake,0.7);
        for(let k=1;k<=5;k++){const r=k*0.45*f.sc,px=f.x+Math.sin(f.hd)*r,pz=f.z+Math.cos(f.hd)*r;burst(px,y+0.3,pz,lc[k%2],k>2?10:5,1.6,0.08,3);burst(px,y+0.05,pz,0xc8b08a,5,1.2,0.07,4);}}
      else{f.hit=2;f.gone=f.t;}}}
  f.g.rotation.x=f.a;
  if(f.hit===2&&f.t-f.gone>1.3){const u=(f.t-f.gone-1.3)/0.45;f.m.scale.setScalar(f.sc*Math.max(0.001,1-u));
    if(u>=1){const y=topY(f.x,f.z);for(let k=1;k<=4;k++){const r=k*0.5*f.sc;burst(f.x+Math.sin(f.hd)*r,y+0.3,f.z+Math.cos(f.hd)*r,0xf6eedb,6,1,0.07,2);}scene.remove(f.g);falls.splice(i,1);}}}}
function updateToolFx(dt){updateHoles(dt);updateTills(dt);if(falls.length)updateFalls(dt);}

// tilling: the blade bites in, grass tufts and clods of earth fly up and tumble back, a puff of dust, and the new soil
// swells up out of the grass with its furrows
const tills=[];
function tillFx(x,z){const y=topY(x,z),a0=Math.atan2(vil.x-x,vil.z-z);
  for(let i=0;i<9;i++){const a=a0+(Math.random()-0.5)*1.8,sp=0.6+Math.random()*1.2;emit(x+(Math.random()-0.5)*0.5,y+0.08,z+(Math.random()-0.5)*0.5,{vx:Math.sin(a)*sp,vy:1.4+Math.random()*1.6,vz:Math.cos(a)*sp,life:0.9,max:0.9,size:0.06+Math.random()*0.05,color:pickR([0x6a4a30,0x8a6440,0x5a3c26]),g:7});}
  for(let i=0;i<7;i++){const a=Math.random()*6.28;emit(x+(Math.random()-0.5)*0.6,y+0.1,z+(Math.random()-0.5)*0.6,{vx:Math.cos(a)*0.7,vy:1.2+Math.random(),vz:Math.sin(a)*0.7,life:1.1,max:1.1,size:0.05,color:pickR([0x6ab84a,0x8ad05a,0x4a9a3a]),g:4,spin:1});}
  for(let i=0;i<6;i++){const a=i/6*6.28;emit(x+Math.cos(a)*0.3,y+0.06,z+Math.sin(a)*0.3,{vx:Math.cos(a)*0.5,vy:0.25,vz:Math.sin(a)*0.5,life:0.8,max:0.8,size:0.12,color:0xc8b08a,g:0.2});}
  vil.hop=Math.max(vil.hop,0.1);const k=K(x,z);tills.push({k,t:0});}
// fresh soil rises from flat to its full height, overshooting a touch, in the soil batch (45-crops)
function updateTills(dt){if(!tills.length||!soilIM)return;let ch=false;const keys=Object.keys(S.tiles);
  for(let i=tills.length-1;i>=0;i--){const q=tills[i];q.t+=dt;const j=keys.indexOf(q.k);if(j<0){tills.splice(i,1);continue;}
    const u=Math.min(1,q.t/0.45),s=u<1?Math.max(0.05,Math.sin(u*Math.PI*0.72)/Math.sin(Math.PI*0.72)*(1+0.25*Math.sin(u*Math.PI))):1;
    soilIM.getMatrixAt(j,_m);_m.decompose(_v,_q,_s);_s.y=s;_m.compose(_v,_q,_s);soilIM.setMatrixAt(j,_m);ch=true;if(u>=1)tills.splice(i,1);}
  if(ch)soilIM.instanceMatrix.needsUpdate=true;}
