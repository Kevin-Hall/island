/* =========================================================
   Swimming and the reef. Walk off the beach into the sea round your island and you swim at the surface; press Dive
   and the camera follows you under, into a bounded reef shelf: a sandy seabed that drops away from the coast, seaweed,
   coral, rocks and shells, light rays and drifting specks, caustics on the sand, and the bright underside of the waves.
   The seabed isn't a second terrain: it's read off the island's own tile grid, as a distance-to-shore field (reefD,
   the same chamfer distance the water shader paints its shallows with), so it always meets the coast you have.
   Rules: no drowning. Breath lasts SWIM.BREATH seconds; when it runs out you float up, no harm done. At the reef's
   edge the water darkens and a gentle current turns you back. The tide moves the edge (a bigger reef at high tide)
   and at low tide the shallow shelf is too shallow to dive (surface only, like tide pools).
   ========================================================= */
const SWIM={BREATH:30/* seconds of air */,REEF_HI:9,REEF_LO:6.5/* how far out the reef reaches (tiles from shore) at high and low tide */,
  DIVE_MIN_HI:0.85,DIVE_MIN_LO:1.35/* least water depth you can dive in */,SURF_SP:0.55,UW_SP:0.72/* × walking speed */,
  DIVE_SP:1.3,RISE_SP:1.8/* depth change per second holding Dive or Up (let go and you stay at that depth) */,REFILL:4/* s to refill at the surface */};
const swim={on:false,depth:0,hold:false,up:false,breath:1,uw:0,rip:0,camD0:null,pitch0:null,bubT:0,ringT:0,pushT:0,outT:0,sayT:0};
let reef=null,reefDirty=true,reefG=null;
const tideK=()=>clamp((tideY+0.075)/0.09,0,1);/* 0 at the lowest tide, 1 at the highest */
const reefR=()=>lerp(SWIM.REEF_LO,SWIM.REEF_HI,tideK());
// ---- the distance field and the seabed ----
// the reef is built a stage at a time (reefGen), a few milliseconds a frame as you come down to the shore (reefStep),
// so wading in never stalls; buildReef runs it all at once when it's needed right now
let reefJob=null;
function* reefGen(){const isl=islands[0];if(!isl||!isl.keys||!isl.keys.length){reef=null;return;}
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const k of isl.keys){const [x,z]=k.split(',').map(Number);if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z;}
  const M=15;x0-=M;z0-=M;x1+=M;z1+=M;const nx=x1-x0+1,nz=z1-z0+1,d=new Float32Array(nx*nz).fill(99);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const t=landMap.get(K(x0+i,z0+j));if(isLandT(t)||t==='river')d[j*nx+i]=0;}
  yield;
  const D=1.414;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let v=d[j*nx+i];if(i)v=Math.min(v,d[j*nx+i-1]+1);if(j){v=Math.min(v,d[(j-1)*nx+i]+1);if(i)v=Math.min(v,d[(j-1)*nx+i-1]+D);if(i<nx-1)v=Math.min(v,d[(j-1)*nx+i+1]+D);}d[j*nx+i]=v;}
  for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){let v=d[j*nx+i];if(i<nx-1)v=Math.min(v,d[j*nx+i+1]+1);if(j<nz-1){v=Math.min(v,d[(j+1)*nx+i]+1);if(i<nx-1)v=Math.min(v,d[(j+1)*nx+i+1]+D);if(i)v=Math.min(v,d[(j+1)*nx+i-1]+D);}d[j*nx+i]=v;}
  reef={x0,z0,nx,nz,d};yield;yield* seabedGen();}
function buildReef(){reefDirty=false;reefJob=reefGen();while(!reefJob.next().done);reefJob=null;}
function reefStep(ms){if(!reefJob){if(!reefDirty)return;reefDirty=false;reefJob=reefGen();}const t=performance.now();while(performance.now()-t<ms)if(reefJob.next().done){reefJob=null;return;}}
// distance to shore at any point (bilinear; 99 off the map)
function reefD(x,z){if(!reef)return 99;const fx=x-reef.x0,fz=z-reef.z0,i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=reef.nx-1||j>=reef.nz-1)return 99;
  const u=fx-i,v=fz-j,n=reef.nx,d=reef.d;return lerp(lerp(d[j*n+i],d[j*n+i+1],u),lerp(d[(j+1)*n+i],d[(j+1)*n+i+1],u),v);}
// the seabed: sand just under the waterline at the coast, shelving down to about 4 below, then dropping off past the reef's edge
function seabedY(x,z){const d=reefD(x,z);if(d>=99)return -9;const n=vnoise(x*0.7+5,z*0.7-3,77)*0.5+vnoise(x*1.9,z*1.9,31)*0.18;
  return -0.42-3.0*smooth(0.4,7.5,d)-n*smooth(0.8,3,d)-3.2*smooth(9.2,12,d);}
const inReef=(x,z)=>{const d=reefD(x,z);return d>0.35&&d<reefR()+2.5;};
// can you swim here? (the sea round your island, not the land, rivers or the dock)
function swimmable(x,z){const t=landMap.get(K(Math.round(x),Math.round(z)));return !isLandT(t)&&t!=='river'&&reefD(x,z)<SWIM.REEF_HI+2.5&&!onDock(x,z);}
const onDock=(x,z)=>{const isl=islands[0];return isl&&isl.dockZ!==undefined&&Math.abs(x-DOCK.x)<0.9&&z>isl.dockZ-0.2&&z<isl.dockZ+6.2;};
const waterDepth=(x,z)=>tideY-seabedY(x,z);
const canDive=(x,z)=>waterDepth(x,z)>lerp(SWIM.DIVE_MIN_LO,SWIM.DIVE_MIN_HI,tideK());

// seabed material: toon-shaded sand with caustics drifting across it
const causU={uT:{value:0},uK:{value:0}};
const seabedMat=new T.MeshToonMaterial({gradientMap:grad,vertexColors:true});
seabedMat.onBeforeCompile=sh=>{sh.uniforms.uT=causU.uT;sh.uniforms.uK=causU.uK;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSw;').replace('#include <begin_vertex>','#include <begin_vertex>\nvSw=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSw;uniform float uT;uniform float uK;')
    .replace('#include <color_fragment>',`#include <color_fragment>
      {vec2 p=vSw.xz*1.25;float t=uT*.55;
       float a=sin(p.x+sin(p.y*1.2+t)*1.3+t)*sin(p.y*1.1+sin(p.x*.9-t*1.2)*1.2-t*.8);
       float b=sin(p.x*1.7-sin(p.y*.8-t*.7)+t*.6)*sin(p.y*1.6+sin(p.x*1.3+t)-t);
       float c=smoothstep(.62,.98,abs(a))*.7+smoothstep(.7,1.,abs(b))*.5;
       diffuseColor.rgb+=vec3(.42,.66,.74)*c*uK*.55*clamp(1.+vSw.y*.18,.25,1.);
       float rp=sin(vSw.x*3.3+sin(vSw.z*.6)*1.6+vSw.z*1.1)*.5+.5;diffuseColor.rgb*=.92+.12*rp;}`);};
// kelp: tall ribbons that sway in the swell (the tips move most)
const kelpU={uT:{value:0}};
const kelpMat=new T.MeshToonMaterial({gradientMap:grad,color:0xffffff});
kelpMat.onBeforeCompile=sh=>{sh.uniforms.uT=kelpU.uT;
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vKh;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=.4+.75*vKh;');
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;varying float vKh;').replace('#include <begin_vertex>',`#include <begin_vertex>
    vKh=position.y;
    {vec3 o=vec3(0.);
     #ifdef USE_INSTANCING
     o=instanceMatrix[3].xyz;
     #endif
     float h=transformed.y*transformed.y;transformed.x+=sin(uT*1.3+o.x*.7+o.z*.4+transformed.y*1.4)*.22*h;transformed.z+=cos(uT*1.1+o.z*.6+transformed.y)*.14*h;}`);};
const KELP_GEO=(()=>{const g=new T.BoxGeometry(0.16,1,0.03,1,6,1);g.translate(0,0.5,0);const g2=g.clone().rotateY(Math.PI/2);const m=merge([P(g,0xffffff),P(g2,0xffffff,0,0,0,0,0,0,0.8,0.85,1)]);m.deleteAttribute('color');return m;})();
function* seabedGen(){const G=new T.Group();G.visible=false;const {x0,z0,nx,nz}=reef,R=mulberry((S.worldSeed|0)^0x5eab);
  // the seabed mesh: one vertex per grid corner (half a tile off the tile centres, where the coast tiles' edges are)
  const pos=[],col=[],idx=[],vi=new Int32Array(nx*nz).fill(-1),c=new T.Color(),sand=new T.Color(0xc8b484),deep=new T.Color(0x3e5a74),alg=new T.Color(0x5e8a4e),mid=new T.Color(0x9a9068);
  for(let j=0;j<nz;j++){if(j%12===11)yield;for(let i=0;i<nx;i++){const x=x0+i+0.5,z=z0+j+0.5,d=reefD(x,z);if(d>13.5)continue;vi[j*nx+i]=pos.length/3;const y=seabedY(x,z);pos.push(x,y,z);
    c.copy(sand).lerp(mid,smooth(1,5,d)).lerp(deep,smooth(5,11.5,d));const a=vnoise(x*0.5+9,z*0.5+2,13);if(a>0.58&&d>1.5)c.lerp(alg,Math.min(1,(a-0.58)*4)*0.6);c.multiplyScalar(0.94+hash(x*3,z*5)*0.1);col.push(c.r,c.g,c.b);}}
  for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=vi[j*nx+i],b=vi[j*nx+i+1],cc=vi[(j+1)*nx+i],e=vi[(j+1)*nx+i+1];if(a<0||b<0||cc<0||e<0)continue;
    if(reef.d[j*nx+i]<0.1&&reef.d[j*nx+i+1]<0.1&&reef.d[(j+1)*nx+i]<0.1&&reef.d[(j+1)*nx+i+1]<0.1)continue;/* under solid land: skip */idx.push(a,cc,b,b,cc,e);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const bed=new T.Mesh(g,seabedMat);bed.frustumCulled=false;bed.receiveShadow=true;G.add(bed);yield;
  // scatter: kelp, coral, rocks and shells, on the seabed, thinning towards the drop-off
  const kelp=[],rp=[],cp=[],sp=[];
  for(let j=0;j<nz;j++){if(j%10===9)yield;for(let i=0;i<nx;i++){const x=x0+i,z=z0+j,d=reef.d[j*nx+i];if(d<1||d>10.5)continue;const h=hash(x*1.73+11,z*2.37-5);
    const px=x+(hash(z,x*3)-0.5)*0.8,pz=z+(hash(x*7,z)-0.5)*0.8,y=seabedY(px,pz);
    if(h<0.3&&d>1.6){const n=1+(hash(x,z*9)*3|0);for(let k=0;k<n;k++)kelp.push([px+(R()-0.5)*0.5,y-0.05,pz+(R()-0.5)*0.5,0.8+R()*1.1*Math.min(1,(d-1)/3),R()*6.28,R()<0.5?0x4f8a3a:R()<0.5?0x6a9a3a:0x7a8a32]);}
    else if(h<0.36){const s=0.25+R()*0.45;rp.push(PG(SPH,0x7a8494,0x3a4454,px,y+s*0.18,pz,0,R()*6,0,s*1.6,s,s*1.3),PG(SPH_LO,0x6a8a5a,0x3a5a3a,px+s*0.2,y+s*0.55,pz,0,0,0,s*0.7,s*0.2,s*0.6));}
    else if(h<0.44&&d>2){coral(cp,R,px,y,pz);}
    else if(h<0.47){const k=R();if(k<0.4)sp.push(P(ICO,0xf6d6d0,px,y+0.03,pz,0,R()*6,0,0.2,0.07,0.18),P(BOX,0xf0a0a8,px,y+0.06,pz,0,R()*6,0,0.03,0.02,0.16));
      else if(k<0.7)for(let a=0;a<5;a++){const an=a/5*6.28;sp.push(P(BOX,0xf08a4a,px+Math.sin(an)*0.08,y+0.03,pz+Math.cos(an)*0.08,0,an,0,0.06,0.04,0.16));}
      else sp.push(P(CONE6,0xf0d8c0,px,y+0.06,pz,0,R()*6,Math.PI/2,0.14,0.24,0.14));}}}
  yield;
  if(kelp.length){const im=new T.InstancedMesh(KELP_GEO,kelpMat,kelp.length);kelp.forEach(([x,y,z,h,r,cl],i)=>{_e.set(0,r,0);_q.setFromEuler(_e);_m.compose(_v.set(x,y,z),_q,_s.set(1,h,1));im.setMatrixAt(i,_m);im.setColorAt(i,_c.setHex(cl));});im.frustumCulled=false;G.add(im);}yield;
  for(const p of [rp,cp,sp])for(let o=0;o<p.length;o+=80){const m=M(p.slice(o,o+80));m.frustumCulled=false;G.add(m);yield;}/* in batches, a frame apart */
  if(reefG){scene.remove(reefG);reefG.traverse(o=>{if(o.geometry&&o.geometry!==KELP_GEO)o.geometry.dispose();if(o.isInstancedMesh)o.dispose();});}
  reefG=G;reefG.visible=swim.on;scene.add(reefG);}
// a coral head: branching staghorn, a round brain coral, or a fan
function coral(p,R,x,y,z){const cols=[[0xf07a8a,0xb04a5a],[0xf6a04a,0xb86a2a],[0xb07ad8,0x6a4a98],[0xf6d04a,0xb8962a],[0x6ad0c0,0x3a8a80]],[a,b]=cols[Math.floor(R()*cols.length)],k=R();
  if(k<0.4){for(let i=0;i<5;i++){const an=R()*6.28,tl=0.2+R()*0.6,L=0.3+R()*0.35;p.push(PG(CYL5,a,b,x+Math.cos(an)*Math.sin(tl)*L*0.5,y+Math.cos(tl)*L*0.5,z+Math.sin(an)*Math.sin(tl)*L*0.5,Math.sin(an)*tl,0,-Math.cos(an)*tl,0.06,L,0.06),
      P(SPH_XS,a,x+Math.cos(an)*Math.sin(tl)*L,y+Math.cos(tl)*L,z+Math.sin(an)*Math.sin(tl)*L,0,0,0,0.09,0.09,0.09));}}
  else if(k<0.75){const s=0.3+R()*0.3;p.push(PG(SPH,a,b,x,y+s*0.3,z,0,R()*6,0,s,s*0.7,s),PG(SPH_LO,a,b,x+s*0.3,y+s*0.2,z+s*0.1,0,0,0,s*0.6,s*0.45,s*0.6));}
  else{const an=R()*6.28;for(let i=0;i<3;i++)p.push(PG(SPH_LO,a,b,x+Math.cos(an)*0.05*i,y+0.3+i*0.04,z+Math.sin(an)*0.05*i,0,an+i*0.3,(i-1)*0.3,0.55-i*0.1,0.5-i*0.08,0.05));}}

// ---- the underwater atmosphere ----
const uwSurf=(()=>{const m=new T.MeshBasicMaterial({color:0x9ae0f0,side:T.BackSide});m.defines={NO_CURVE:''};/* a flat lid over the reef: the world's curve would bend it down out of view */const u={uT:{value:0}};
  m.onBeforeCompile=sh=>{sh.uniforms.uT=u.uT;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vUw;').replace('#include <begin_vertex>','#include <begin_vertex>\nvUw=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vUw;uniform float uT;').replace('#include <color_fragment>',`#include <color_fragment>
      {vec2 p=vUw.xz;float w=sin(p.x*1.3+uT*1.1+sin(p.y*.9+uT*.7))*sin(p.y*1.1-uT*.9+sin(p.x*.7));float r=smoothstep(.55,.95,abs(w));
       diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.92,1.,1.),r*.55);}`);};
  const mesh=new T.Mesh(new T.PlaneGeometry(140,140,1,1).rotateX(-Math.PI/2),m);mesh.frustumCulled=false;mesh.visible=false;mesh.userData.u=u;scene.add(mesh);return mesh;})();
const UW_RAY_TEX=(()=>{const cv=document.createElement('canvas');cv.width=4;cv.height=64;const x=cv.getContext('2d'),g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.5,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,4,64);const t=new T.CanvasTexture(cv);return t;})();
const uwRays=[...Array(8)].map((_,i)=>{const m=new T.Mesh(new T.PlaneGeometry(0.9+Math.random()*0.8,7),new T.MeshBasicMaterial({color:0xcff4ff,map:UW_RAY_TEX,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
  m.frustumCulled=false;m.visible=false;m.userData={ox:(Math.random()-0.5)*14,oz:(Math.random()-0.5)*14,ph:Math.random()*6.28,sp:0.2+Math.random()*0.3};scene.add(m);return m;});
const SNOW_N=240,snowGeo=new T.BufferGeometry(),snowPos=new Float32Array(SNOW_N*3);snowGeo.setAttribute('position',new T.BufferAttribute(snowPos,3));
const uwSnow=new T.Points(snowGeo,new T.PointsMaterial({color:0xd8f0ff,size:0.08,transparent:true,opacity:0.75,depthWrite:false}));uwSnow.frustumCulled=false;uwSnow.visible=false;scene.add(uwSnow);
let snowInit=false;
const BUB_N=28,bubMesh=new T.InstancedMesh(ICO0,new T.MeshBasicMaterial({color:0xe8faff,transparent:true,opacity:0.7,depthWrite:false}),BUB_N);bubMesh.frustumCulled=false;bubMesh.count=0;scene.add(bubMesh);
const bubs=[];
function bubble(x,y,z,s=0.07){if(bubs.length>=BUB_N)bubs.shift();bubs.push({x,y,z,s,t:0,ph:Math.random()*6.28});}
function updateBubbles(dt){let n=0;for(let i=bubs.length-1;i>=0;i--){const b=bubs[i];b.t+=dt;b.y+=dt*(0.7+b.s*4);b.x+=Math.sin(b.t*6+b.ph)*dt*0.12;if(b.y>tideY-0.04){bubs.splice(i,1);if(Math.random()<0.3)ripple(b.x,b.z);}}
  for(const b of bubs){_m.compose(_v.set(b.x,b.y,b.z),_q.identity(),_s.setScalar(b.s*(1+Math.sin(b.t*9)*0.12)));bubMesh.setMatrixAt(n++,_m);}bubMesh.count=n;bubMesh.instanceMatrix.needsUpdate=true;}

// ---- getting in and out ----
function swimK(){return swim.on?(swim.under?SWIM.UW_SP:SWIM.SURF_SP):1;}
function swimY(tt){return tideY-0.34-swim.depth+Math.sin(tt*2.2)*0.035*Math.max(0,1-swim.depth*4);/* chest-deep and bobbing at the surface */}
// the deepest you can go here: just above the seabed
const maxDepth=(x,z)=>Math.max(0,waterDepth(x,z)-0.72);
function enterWater(){swim.on=true;swim.depth=0;swim.breath=1;swim.hold=swim.up=false;swim.under=false;burst(vil.x,tideY+0.05,vil.z,0xe8f6ff,14,1.6,0.07,5);SFX.splash();ripple(vil.x,vil.z,true);
  if(!reef)buildReef();if(reefG)reefG.visible=true;showSwimUI(true);if(!S.tipSwim){S.tipSwim=1;setTimeout(()=>say('Splash! Press <b>Dive</b> to look under the waves.'),700);}}
function leaveWater(){surfaceNow();swim.on=false;swim.depth=0;burst(vil.x,tideY+0.1,vil.z,0xe8f6ff,10,1.3,0.06,5);noise(0.2,0.06,900);showSwimUI(false);if(reefG)reefG.visible=false;}
function surfaceNow(){swim.under=false;swim.hold=swim.up=false;swim.chase=null;}
// Dive pressed: go under (to a comfortable depth) if there's water enough; already under, holding it takes you deeper
function divePress(){if(swim.under)return true;const md=maxDepth(vil.x,vil.z);if(!canDive(vil.x,vil.z)||md<0.6){SFX.no();return false;}
  swim.under=true;swim.tgt=Math.min(1.1,md);swim.breath=Math.max(swim.breath,0.35);SFX.splash();return true;}
function swimTo(x,z){swim.chase=null;vil.path=null;vil.idle=0;vil.cb=null;
  // from dry land: walk (round anything in the way) to the water's edge nearest where you're heading, then wade in
  if(!swim.on&&isLand(Math.round(vil.x),Math.round(vil.z))){const d=Math.hypot(x-vil.x,z-vil.z),n=Math.ceil(d/0.3);let sh=null;
    for(let i=n;i>=0;i--){const px=vil.x+(x-vil.x)*i/n,pz=vil.z+(z-vil.z)*i/n;if(isLand(Math.round(px),Math.round(pz))){sh=[Math.round(px),Math.round(pz)];break;}}
    if(sh&&Math.hypot(sh[0]-vil.x,sh[1]-vil.z)>0.8){routeVil(sh[0],sh[1]);(vil.path||(vil.path=[])).push([x,z]);return;}}
  vil.tx=x;vil.tz=z;}
// the reef's edge: past it the water turns dark and a current nudges you back towards the island
function reefPush(dt){const d=reefD(vil.x,vil.z),R0=reefR();if(d<=R0-0.3)return;
  const e=0.5,gx=reefD(vil.x+e,vil.z)-reefD(vil.x-e,vil.z),gz=reefD(vil.x,vil.z+e)-reefD(vil.x,vil.z-e),gl=Math.hypot(gx,gz)||1,over=d-(R0-0.3),k=Math.min(3.2,0.9+over*1.6);
  vil.x-=gx/gl*k*dt;vil.z-=gz/gl*k*dt;if(d>R0+1.2){vil.tx=vil.x-gx/gl*1.5;vil.tz=vil.z-gz/gl*1.5;vil.path=null;}/* a firm turn back at the limit */
  swim.pushT-=dt;if(swim.pushT<=0&&over>0.4){swim.pushT=9;say('The current is strong out here. Better stay on the reef.');}}

// ---- each frame ----
function updateSwim(dt,tt){causU.uT.value=kelpU.uT.value=uwSurf.userData.u.uT.value=tt;
  if((reefDirty||reefJob)&&swim.on)reefStep(8);/* the coast changed while you swim: the reef catches up over a few frames */
  // get the reef ready as you come down to the shore, a few milliseconds a frame, so wading in never stalls
  else if(reefJob)reefStep(3);
  else if(reefDirty&&!S.sea&&!inside&&(swim.prebT=(swim.prebT||0)-dt)<=0){swim.prebT=0.5;const rx=Math.round(vil.x),rz=Math.round(vil.z);let sea=false;
    for(let dx=-6;dx<=6&&!sea;dx++)for(let dz=-6;dz<=6;dz++)if(isSeaT(landMap.get(K(rx+dx,rz+dz)))){sea=true;break;}if(sea&&islMap.get(K(rx,rz))===0)reefStep(3);}
  const wet=!S.sea&&!inside&&reef&&swimmable(vil.x,vil.z)&&!isLand(Math.round(vil.x),Math.round(vil.z));
  if(wet&&!swim.on)enterWater();else if(!wet&&swim.on)leaveWater();
  if(!swim.on){swim.uw=Math.max(0,swim.uw-dt*3);applyUw(dt,tt);return;}
  // climbing out onto the dock: up the ladder and onto the planks' landward end
  if(onDock(vil.x+Math.sin(villager.rotation.y)*0.5,vil.z+Math.cos(villager.rotation.y)*0.5)&&Math.hypot(vil.tx-vil.x,vil.tz-vil.z)>0.2){const isl=islands[0];let lz=isl.dockZ-1;for(let i=0;i<4&&!isLand(DOCK.x,lz);i++)lz--;
    leaveWater();vil.x=vil.tx=DOCK.x;vil.z=vil.tz=lz;vil.path=null;vil.hop=0.4;return;}
  reefPush(dt);
  // up and down: you're either at the surface or under (swim.under); under, you hold a depth (swim.tgt) that Dive and Up
  // move, and your actual depth glides after it, so nothing snaps
  const md=maxDepth(vil.x,vil.z),look=[vil.x+(vil.tx-vil.x)*0.25,vil.z+(vil.tz-vil.z)*0.25],mdA=Math.min(md,Math.hypot(vil.tx-vil.x,vil.tz-vil.z)>0.3?maxDepth(look[0],look[1]):md);
  if(swim.under){if(swim.hold)swim.tgt+=SWIM.DIVE_SP*dt;if(swim.up)swim.tgt-=SWIM.RISE_SP*dt;
    const ch=swim.chase;if(ch){if(!seaLife.includes(ch)||!vil.cb)swim.chase=null;else if(!swim.hold&&!swim.up)swim.tgt=tideY-0.34-ch.y;}/* following something you tapped down to its depth */
    swim.tgt=clamp(swim.tgt,0.55,Math.max(0.55,mdA));
    if(swim.breath<=0||mdA<0.6||swim.up&&swim.tgt<=0.56||isLand(Math.round(look[0]),Math.round(look[1])))surfaceNow();}
  const want=swim.under?swim.tgt:0;swim.depth+=clamp((want-swim.depth)*3,-SWIM.RISE_SP,SWIM.DIVE_SP)*dt;swim.depth=clamp(swim.depth,0,Math.max(0,md));if(!swim.under&&swim.depth<0.01)swim.depth=0;
  // breath: runs down under water, refills at the surface
  if(swim.under&&swim.depth>0.3){swim.breath=Math.max(0,swim.breath-dt/SWIM.BREATH);if(swim.breath<=0&&swim.sayT<=0){swim.sayT=6;say('Out of breath. Up you float!');}}
  else swim.breath=Math.min(1,swim.breath+dt/SWIM.REFILL);swim.sayT-=dt;
  // bubbles from you under water, ripples round you at the surface
  const moving=Math.hypot(vil.tx-vil.x,vil.tz-vil.z)>0.05;
  if(swim.under&&swim.depth>0.3){swim.bubT-=dt;if(swim.bubT<=0){swim.bubT=0.25+Math.random()*0.5;bubble(vil.x+(Math.random()-0.5)*0.15,vil.y+0.55,vil.z+(Math.random()-0.5)*0.15,0.04+Math.random()*0.05);}}
  else{swim.ringT-=dt;if(swim.ringT<=0){swim.ringT=moving?0.35:1.4;ripple(vil.x,vil.z);}}
  updateBubbles(dt);swimHUD();
  swim.uw=clamp(swim.uw+(swim.under?dt:-dt)*1.6,0,1);/* the camera's trip down and back up */
  applyUw(dt,tt);}
function applyUw(dt,tt){
  // how far under the lens itself is: every underwater look (fog, colour, rays, muffling) follows the camera, not you,
  // so there's never blue fog above the waves or a clear view under them
  const camUnder=camera.position.y<tideY-0.02;if(camUnder!==swim.camUnder){if(swim.camUnder!==undefined){swim.rip=1;noise(0.35,0.07,500);SFX.splash();}swim.camUnder=camUnder;}
  swim.look=clamp((swim.look||0)+(camUnder?dt:-dt)*6,0,1);swim.rip=Math.max(0,swim.rip-dt*1.6);
  if(swim.rec)swim.rec.push([+(camera.position.y-tideY).toFixed(2),+swim.look.toFixed(2),+swim.depth.toFixed(2),swim.under?1:0,+cam.dist.toFixed(1)]);
  const k=swim.look,u=postMat.uniforms;u.uw.value=k*k*(3-2*k);u.rip.value=swim.rip;u.tm.value=tt;
  const on=k>0.02;uwSurf.visible=on;uwSnow.visible=on;for(const r of uwRays)r.visible=on;updateSchools(dt,tt,on&&swim.uw>0.3);if(reefG)reefG.visible=swim.on;
  audioMuffle(k>0.5);
  // under water, the rest of the archipelago and the sun's shadows are lost in the blue: don't draw them (a big saving on a phone)
  swim.noShadow=k>0.5;if(k>0.5)for(const isl of islands)if(!isl.home&&isl.group)isl.group.visible=false;
  // the camera: glides down with you and closes in; the ceiling it may not rise past comes down with it, so it slips
  // under the surface part-way down (and back up through it on the way home), never popping
  const e=swim.uw*swim.uw*(3-2*swim.uw);
  if(swim.uw>0&&swim.camD0===null){swim.camD0=cam.dist;swim.pitch0=cam.pitch;swim.pitchU=0.22;}
  if(swim.camD0!==null){cam.dist=lerp(swim.camD0,7,e);cam.ty=lerp(0,vil.y+0.25,e);
    if(e>0.999)swim.pitchU=cam.pitch=clamp(cam.pitch,-0.5,0.8);else cam.pitch=lerp(swim.pitch0,swim.pitchU,e);
    cam.yMax=tideY-0.28+(1-e)*60;if(swim.uw<=0){cam.dist=swim.camD0;cam.pitch=swim.pitch0;cam.ty=0;cam.yMax=undefined;swim.camD0=null;}}
  if(!on)return;
  // fog and light: sunlit blue near the top, darker deep down and past the reef's edge, much darker at night
  const edge=smooth(reefR()-1.5,reefR()+1.5,reefD(vil.x,vil.z)),dep=clamp(-vil.y/5,0,1),light=(1-nightF*0.72)*(1-rainMix*0.25);
  _c.setHex(0x2a8cc0).lerp(_a.setHex(0x0e4a78),dep*0.6+edge*0.5).multiplyScalar(light);scene.fog.color.lerp(_c,k);u.uwC.value.copy(_c);u.uwL.value=light;
  {const kf=k;scene.fog.near=lerp(scene.fog.near,camD()*0.35,kf);scene.fog.far=lerp(scene.fog.far,camD()+11-edge*5,kf);}
  causU.uK.value=k*light*(1-rainMix*0.5);
  uwSurf.position.set(vil.x,tideY-0.01,vil.z);uwSurf.material.color.setHex(0x9ae0f0).multiplyScalar(0.35+0.65*light);
  // light rays slanting down from the surface, drifting and breathing
  for(const r of uwRays){const q=r.userData;r.position.set(vil.x+q.ox+Math.sin(tt*q.sp+q.ph)*1.2,tideY-3.4,vil.z+q.oz+Math.cos(tt*q.sp*0.8+q.ph)*1.2);r.rotation.set(0,cam.yaw,0.18);
    r.material.opacity=k*light*(1-edge*0.7)*(0.12+0.1*Math.sin(tt*0.7+q.ph))*(1-rainMix*0.6);}
  // specks of marine snow drifting round you
  if(!snowInit){snowInit=true;for(let i=0;i<SNOW_N;i++){snowPos[i*3]=(Math.random()-0.5)*16;snowPos[i*3+1]=-Math.random()*5;snowPos[i*3+2]=(Math.random()-0.5)*16;}}
  for(let i=0;i<SNOW_N;i++){let x=snowPos[i*3],y=snowPos[i*3+1],z=snowPos[i*3+2];x+=Math.sin(tt*0.3+i)*dt*0.05;y-=dt*0.04;z+=Math.cos(tt*0.25+i*1.3)*dt*0.05;
    const px=vil.x,pz=vil.z;if(x-px>8)x-=16;if(x-px<-8)x+=16;if(z-pz>8)z-=16;if(z-pz<-8)z+=16;const sb=seabedY(x,z);if(y<sb||y>tideY-0.1)y=tideY-0.2-Math.random()*Math.max(0.3,tideY-sb-0.3);snowPos[i*3]=x;snowPos[i*3+1]=y;snowPos[i*3+2]=z;}
  snowGeo.attributes.position.needsUpdate=true;}
// under water the sky is the sea: the backdrop takes the fog's colour
function uwSky(){const k=swim.uw;if(k<=0.02)return;if(k>0.5){for(const c of skyClouds)c.m.visible=false;moon.visible=false;rainbow.visible=false;shootLine.visible=false;}/* nothing of the sky shows through the sea */const u=skyMat.uniforms;u.zen.value.lerp(scene.fog.color,k);u.hz.value.lerp(scene.fog.color,k);u.ga.value*=1-k;u.disc.value*=1-k;}

// ---- the swim pose: stretched out, a slow kick ----
// a character (61b) keeps its idle clip in the water, with a slight forward lean and a gentle bob instead of strokes
function swimPose(dt,tt,moving){const b=villager.children[0];if(!b)return;const uw=swim.under&&swim.depth>0.3,kick=moving?1:0.45;
  if(b.userData.anim){b.rotation.x=lerp(b.rotation.x,uw?0.6:0.3,Math.min(1,dt*5));b.rotation.z=Math.sin(tt*1.7)*0.04;b.position.y=lerp(b.position.y,(uw?0.2:0.06)+Math.sin(tt*2.2)*0.035,Math.min(1,dt*5));b.scale.set(1,1,1);return;}
  const lean=uw?1.05:0.7;
  b.rotation.x=lerp(b.rotation.x,lean,Math.min(1,dt*5));b.rotation.z=Math.sin(tt*2.6)*0.08*kick;b.position.y=lerp(b.position.y,uw?0.25:0.12,Math.min(1,dt*5));
  if(playerLimbs)swingLimbs(playerLimbs,tt*(moving?6:3),0.55*kick);else b.scale.set(1+Math.sin(tt*6)*0.03*kick,1-Math.sin(tt*6)*0.03*kick,1);}
function unPose(){const b=villager.children[0];if(b){b.rotation.z=0;b.position.y=0;}}

// ---- the dive controls and the breath meter ----
function showSwimUI(on){const el=$('swimUI');if(!el)return;el.hidden=!on;if(!on){unPose();swim.hold=swim.up=false;}}
function swimHUD(){const el=$('swimUI');if(!el||el.hidden)return;const b=$('breath');const dv=canDive(vil.x,vil.z);
  $('bDive').classList.toggle('off',!dv&&!swim.under);$('bUp').hidden=!swim.under;b.hidden=swim.breath>=0.999&&!swim.under;
  b.firstElementChild.style.width=(swim.breath*100).toFixed(1)+'%';b.classList.toggle('low',swim.breath<0.25);
  $('diveHint').textContent=!dv&&!swim.under?(tideK()<0.4?'Too shallow at low tide':'Too shallow to dive'):'';}
function initSwimUI(){const d=$('bDive'),u=$('bUp');if(!d)return;$('icoDive').src=PIX.dive;$('icoUp').src=PIX.up;
  // Dive: press to go under; hold to go deeper; a quick tap while under brings you back up. Up: hold to rise, tap to surface
  d.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();d.t0=performance.now();d.was=swim.under;if(divePress()){swim.hold=true;swim.up=false;}});
  u.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();u.t0=performance.now();swim.up=true;swim.hold=false;});
  for(const ev of ['pointerup','pointercancel','pointerleave']){
    d.addEventListener(ev,()=>{if(!swim.hold)return;swim.hold=false;if(ev==='pointerup'&&d.was&&performance.now()-d.t0<260)surfaceNow();});
    u.addEventListener(ev,()=>{if(!swim.up)return;swim.up=false;if(ev==='pointerup'&&performance.now()-u.t0<260)surfaceNow();});}
  // keyboard: hold Space (or E) to dive, Q to come up
  window.addEventListener('keydown',e=>{if(!swim.on||sheet)return;if((e.code==='Space'||e.key==='e')&&!e.repeat){if(divePress()){swim.hold=true;swim.up=false;}e.preventDefault();}if(e.key==='q')surfaceNow();});
  window.addEventListener('keyup',e=>{if(e.code==='Space'||e.key==='e')swim.hold=false;});}
// where a tap lands under water: on a level with you (so you can swim towards anything you see)
function uwPoint(cx,cy){ndc.set(cx/window.innerWidth*2-1,-(cy/window.innerHeight)*2+1);ray.setFromCamera(ndc,camera);const y=vil.y+0.3;_plane.constant=-y;
  if(ray.ray.intersectPlane(_plane,_hit)&&Math.hypot(_hit.x-vil.x,_hit.z-vil.z)<14)return _hit.clone();
  const dx=ray.ray.direction.x,dz=ray.ray.direction.z,l=Math.hypot(dx,dz)||1;return new T.Vector3(vil.x+dx/l*3,y,vil.z+dz/l*3);}
// a tap while you're in the sea (returns true if it was handled here)
function swimTap(cx,cy){if(S.sea||inside)return false;
  if(swim.on&&swim.uw>0.5){if(seaLifeTap(cx,cy))return true;const p=uwPoint(cx,cy);swimTo(p.x,p.z);return true;}
  const w=waterPoint(cx,cy);if(!w)return false;const tx=Math.round(w.x),tz=Math.round(w.z);if(isLand(tx,tz))return false;
  if(!reef)buildReef();if(!swimmable(w.x,w.z))return false;const here=curIsl();if(!swim.on&&(!here||!here.home))return false;
  if(!swim.on&&S.tool==='rod')return false;/* the rod still casts from the shore */
  swimTo(w.x,w.z);return true;}

// little schools of reef fish, just for life: they wheel round a drifting centre near you (not catchable)
const SCHOOL_N=16,schoolGeo=merge([PG(SPH_LO,0xffffff,0xb8c8d8,0,0,0,0,0,0,0.07,0.08,0.2),P(CONE5,0xe8f0f8,0,0,-0.12,-Math.PI/2,0,0,0.06,0.08,0.02)]);
const schools=[0x6ab0f0,0xf0c050,0xa8e0e0].map(col=>{const im=new T.InstancedMesh(schoolGeo,vcMat,SCHOOL_N);im.frustumCulled=false;im.visible=false;for(let i=0;i<SCHOOL_N;i++)im.setColorAt(i,_c.setHex(col).multiplyScalar(0.85+Math.random()*0.3));scene.add(im);
  return{im,x:0,y:-1.5,z:0,a:Math.random()*6.28,r:1.2+Math.random(),ph:[...Array(SCHOOL_N)].map(()=>[Math.random()*6.28,Math.random()*0.5,(Math.random()-0.5)*0.5,0.8+Math.random()*0.4]),set:false};});
function updateSchools(dt,tt,on){for(const s of schools){s.im.visible=on;if(!on){s.set=false;continue;}
  if(!s.set||Math.hypot(s.x-vil.x,s.z-vil.z)>12){for(let it=0;it<10;it++){const a=Math.random()*6.28,r=3+Math.random()*5,x=vil.x+Math.cos(a)*r,z=vil.z+Math.sin(a)*r;if(reefD(x,z)>1.5&&reefD(x,z)<reefR()&&waterDepth(x,z)>1.3){s.x=x;s.z=z;s.y=lerp(seabedY(x,z)+0.5,tideY-0.5,Math.random());s.set=true;break;}}}
  s.a+=dt*0.25;const cx=s.x+Math.cos(s.a)*1.5,cz=s.z+Math.sin(s.a*0.8)*1.5;
  s.ph.forEach(([p,ro,yo,sp],i)=>{const a=tt*0.9*sp+p,x=cx+Math.cos(a)*(s.r+ro),z=cz+Math.sin(a)*(s.r+ro),y=s.y+yo+Math.sin(tt*1.3+p)*0.1;
    _e.set(0,a+Math.PI,Math.sin(tt*8+p)*0.15,'YXZ');_q.setFromEuler(_e);_m.compose(_v.set(x,y,z),_q,_s.setScalar(1));s.im.setMatrixAt(i,_m);});s.im.instanceMatrix.needsUpdate=true;}}
initSwimUI();
