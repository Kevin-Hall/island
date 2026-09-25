// fuzzy grass: clumps of thin tapered blades, instanced over every grass tile; they sway in the wind and part around the villager
const grassU={uTime:{value:0},uWind:{value:1},uPl:{value:new T.Vector3(0,-99,0)}};
const grassMat=toon({vertexColors:true});grassMat.depthWrite=false;const flowerMat=toon({vertexColors:true}); // kept out of the depth buffer so the outline pass doesn't ink every blade
const swayCompile=sh=>{Object.assign(sh.uniforms,grassU);
  sh.vertexShader='uniform float uTime;uniform float uWind;uniform vec3 uPl;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  #ifdef USE_INSTANCING
  vec2 gp=vec2(instanceMatrix[3][0],instanceMatrix[3][2])+position.xz;
  #else
  vec2 gp=position.xz;
  #endif
  float gh=max(position.y,0.)*8.;
  float gw=sin(uTime*1.6+gp.x*0.55+gp.y*0.35)*0.55+sin(uTime*3.7+gp.x*2.1-gp.y*1.7)*0.2+0.25;
  transformed.x+=gw*gh*0.035*uWind;transformed.z+=gw*gh*0.018*uWind;
  vec2 pd=gp-uPl.xz;float pl=length(pd);float push=(1.-smoothstep(0.15,0.6,pl))*step(abs(uPl.y-instanceMatrix[3][1]),0.5);
  transformed.xz+=normalize(pd+0.0001)*push*gh*0.05;transformed.y-=push*gh*0.012;`);};
grassMat.onBeforeCompile=swayCompile;flowerMat.onBeforeCompile=swayCompile;
const BLADES=(()=>{const R=mulberry(77),pos=[],col=[],nor=[];
  for(let i=0;i<13;i++){const a=R()*6.283,r=Math.sqrt(R())*0.17,x=Math.cos(a)*r,z=Math.sin(a)*r,h=0.07+R()*0.08,w=0.024+R()*0.012,ry=R()*3.14,la=R()*6.283,ln=0.02+R()*0.04;
    const cx=Math.cos(ry)*w,cz=Math.sin(ry)*w,b=0.8+R()*0.08,t=R()<0.3?0.86:1.14+R()*0.12;
    const tx=x+Math.cos(la)*ln,tz=z+Math.sin(la)*ln;
    // both windings, all normals up, so every blade is lit like the lawn from either side
    pos.push(x-cx,0,z-cz,x+cx,0,z+cz,tx,h,tz, x+cx,0,z+cz,x-cx,0,z-cz,tx,h,tz);for(let k=0;k<2;k++){col.push(b,b,b,b,b,b,t,t,t*0.97);nor.push(0,1,0,0,1,0,0,1,0);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));return g;})();
const GRASS_DENS={}; // blades per tile by biome; 0 by default now that grass is a ground texture (set e.g. meadow:4 to bring blades back)
function clumpMat(x,z,j){const y=topY(x,z),h1=hash(x*7.1+j*3.3,z*2.9-j),h2=hash(z*5.3-j*1.7,x*3.7+j*2.1),h3=hash(x+j*9.1,z-j*4.3);
  const gx=(j%3-1)*0.3+(h1-0.5)*0.26,gz=(Math.floor(j/3)-0.5)*0.46+(h2-0.5)*0.3;
  const cm=CMASK.get(K(x,z));if(cm&&inNotch(cm,gx*1.15,gz*1.15))return _m.makeScale(0,0,0);
  _q.identity();return _m.compose(_v.set(x+gx,y,z+gz),_q,_s.set(0.85+h3*0.4,0.7+h1*0.7,0.85+h2*0.4));}
function buildGrass(isl,g){const B=BIOMES[isl.biome],per=GRASS_DENS[isl.biome]||0;isl.gIM=null;if(!per||!isl.grass.length)return;
  const im=new T.InstancedMesh(BLADES,grassMat,isl.grass.length*per);isl.gIdx=new Map();let i=0;
  for(const [x,z] of isl.grass){isl.gIdx.set(K(x,z),i);const base=_c.setHex(groundCol(B.grass,x,z,isl.seed));const bc=base.clone();
    for(let j=0;j<per;j++,i++){im.setMatrixAt(i,clumpMat(x,z,j));im.setColorAt(i,_c.copy(bc).offsetHSL(0,0,(hash(x*3+j,z*5-j)-0.5)*0.05));}}
  isl.gHid=null;im.userData.per=per;im.renderOrder=3;im.receiveShadow=true;im.castShadow=false;im.frustumCulled=false;g.add(im);isl.gIM=im;}
// hide the blades where something sits on the home island (tilled soil, the house, furniture)
function refreshHomeGrass(){const isl=islands&&islands[0];if(!isl)return;if(isl.gIM){const im=isl.gIM,per=im.userData.per;if(!isl.gHid)isl.gHid=new Map();let ch=false;
  for(const [k,i0] of isl.gIdx){const [x,z]=k.split(',').map(Number);const hide=!!(S.tiles[k]||objAt(x,z)||fixedAt(x,z)||TOWN.path.has(k));if(isl.gHid.get(k)===hide)continue;isl.gHid.set(k,hide);ch=true;
    for(let j=0;j<per;j++){if(hide)im.setMatrixAt(i0+j,_m.makeScale(0,0,0));else im.setMatrixAt(i0+j,clumpMat(x,z,j));}}
  if(ch)im.instanceMatrix.needsUpdate=true;}
  const dirty=new Set();if(!TOWN.fHid)TOWN.fHid=new Map();for(const [k,arr] of TOWN.flora){const [x,z]=k.split(',').map(Number);const hide=!!(S.tiles[k]||objAt(x,z)||fixedAt(x,z));if(TOWN.fHid.get(k)===hide)continue;TOWN.fHid.set(k,hide);
    for(const [fm,i,mat] of arr){fm.setMatrixAt(i,hide?_m.makeScale(0,0,0):_m.fromArray(mat));dirty.add(fm);}}for(const fm of dirty)fm.instanceMatrix.needsUpdate=true;}
const TUFT_GEO=merge([P(BOX,0xffffff,0,0.07,0,0.25,0,0.2,0.035,0.16,0.05),P(BOX,0xdddddd,0.06,0.06,0.03,-0.2,0.6,-0.3,0.035,0.13,0.05),P(BOX,0xeeeeee,-0.05,0.05,-0.03,0.3,1.2,0.4,0.035,0.11,0.05),P(BOX,0xd4d4d4,0.02,0.05,-0.06,-0.35,2,0.1,0.035,0.1,0.05)]);
const riverU={uTime:{value:0}};
