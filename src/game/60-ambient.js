/* =========================================================
   Ambient life: villager, boat, clouds, gulls, glints, fireflies, rain, particles
   ========================================================= */
const villager=new T.Group();
{const body=M([P(ICO2,0xf6f3ee,0,0.46,0,0,0,0,0.5,0.46,0.46),P(ICO2,0xf6f3ee,0,0.36,-0.16,0,0,0,0.12,0.12,0.1),
  P(ICO2,0xf6f3ee,-0.2,0.22,0.03,0,0,0.5,0.08,0.16,0.08),P(ICO2,0xf6f3ee,0.2,0.22,0.03,0,0,-0.5,0.08,0.16,0.08),P(ICO2,0xf6f3ee,0,0.14,-0.16,0,0,0,0.1,0.1,0.1),P(CYL12,0xf4f0ea,0,0.27,0,0,0,0,0.26,0.03,0.22),
  P(ICO2,0xf6f3ee,-0.12,0.74,0,0,0,0.15,0.1,0.26,0.08),P(ICO2,0xf6f3ee,0.12,0.74,0,0,0,-0.15,0.1,0.26,0.08),
  P(ICO,0xf3a6b6,-0.12,0.74,0.03,0,0,0.15,0.05,0.18,0.03),P(ICO,0xf3a6b6,0.12,0.74,0.03,0,0,-0.15,0.05,0.18,0.03),
  P(ICO,0x2b1e2e,-0.1,0.48,0.215,0,0,0,0.06,0.08,0.03),P(ICO,0x2b1e2e,0.1,0.48,0.215,0,0,0,0.06,0.08,0.03),
  P(ICO,0xffffff,-0.09,0.5,0.228,0,0,0,0.02,0.025,0.01),P(ICO,0xffffff,0.11,0.5,0.228,0,0,0,0.02,0.025,0.01),
  P(ICO,0xf39ab0,-0.17,0.41,0.19,0,0,0,0.07,0.04,0.03),P(ICO,0xf39ab0,0.17,0.41,0.19,0,0,0,0.07,0.04,0.03),
  P(CYL12,0xd8453a,0,0.16,0,0,0,0,0.3,0.2,0.26),P(ICO2,0xf6d04a,0,0.2,0.135,0,0,0,0.035,0.035,0.02),P(ICO2,0xf6d04a,0,0.13,0.14,0,0,0,0.035,0.035,0.02),P(BOX,0xd8453a,0.13,0.13,0.14,0,0,0.3,0.07,0.14,0.03),
  P(ICO,0xf6f3ee,-0.19,0.17,0.02,0,0,0,0.1,0.1,0.1),P(ICO,0xf6f3ee,0.19,0.17,0.02,0,0,0,0.1,0.1,0.1),
  P(ICO2,0x8a5a3a,-0.08,0.03,0.02,0,0,0,0.12,0.07,0.16),P(ICO2,0x8a5a3a,0.08,0.03,0.02,0,0,0,0.12,0.07,0.16),P(BOX,0xf4f0ea,-0.08,0.02,0.09,0,0,0,0.1,0.02,0.02),P(BOX,0xf4f0ea,0.08,0.02,0.09,0,0,0,0.1,0.02,0.02)]);
  villager.add(body);scene.add(villager);}
const vil={x:S.px,z:S.pz,tx:S.px,tz:S.pz,idle:0,hop:0,y:0.5,cb:null};

const boatMesh=new T.Group();
{const bp=[];for(let i=0;i<4;i++)bp.push(P(BOX,i%2?0x8a5a30:0xa87444,0,0.05+i*0.055,0,0,0,0,0.6-i*0.0+0.02*i,0.05,1.28));
  for(let i=0;i<5;i++)bp.push(P(BOX,0xf8f4ea,0,1.05,-0.25+i*0.12,0,0,0,0.03+Math.sin(i/4*3.14)*0.1,0.92-Math.abs(i-2)*0.04,0.13),P(BOX,0xd8453a,0.001,1.05,-0.25+i*0.12,0,0,0,0.035+Math.sin(i/4*3.14)*0.1,0.14,0.13));
  bp.push(P(BOX,0x5a3a26,0,0.3,-0.35,0,0,0,0.58,0.05,0.16),P(CYL12,0xd0c8b0,0.36,0.24,-0.2,0,0,1.57,0.06,0.1,0.06),P(CYL12,0xd0c8b0,-0.36,0.24,-0.2,0,0,1.57,0.06,0.1,0.06),
    P(BOX,0x8a6a44,0.34,0.3,-0.1,0.4,0,0.2,0.04,0.04,0.9),P(BOX,0xa87444,0.38,0.14,-0.55,0.4,0,0.2,0.1,0.02,0.2),P(BOX,0x3a2a20,0,1.02,0.02,0.72,0,0,0.01,0.01,1.5),P(BOX,0x3a2a20,0,0.6,0.62,-0.2,0,0,0.01,0.01,0.8),
    P(ICO2,0xf6d04a,0,0.3,0.72,0,0,0,0.06,0.06,0.06));boatMesh.add(M(bp));}
boatMesh.add(M([P(BOX,0x9a6a3a,0,0.12,0,0,0,0,0.64,0.22,1.3),P(BOX,0x7a4a2a,0,0.24,0,0,0,0,0.5,0.03,1.1),P(CONE4,0x9a6a3a,0,0.12,0.78,Math.PI/2,Math.PI/4,0,0.46,0.3,0.22),
  P(BOX,0xd8453a,0,0.21,0,0,0,0,0.66,0.05,1.32),P(BOX,0xa27a50,0,0.26,0.3,0,0,0,0.62,0.04,0.14),P(BOX,0x6a4a30,0,0.95,0.3,0,0,0,0.05,1.4,0.05),
  P(BOX,0xf6d04a,0,1.72,0.4,0,0,0,0.02,0.12,0.2),P(BOX,0xf6d04a,0,1.7,0.52,0,0,0,0.02,0.08,0.06)]));
scene.add(boatMesh);
let sail=null;

const cloudMat=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false});
const clouds=[];
for(let i=0;i<6;i++){const R=mulberry(i*31+5),p=[];for(let j=0;j<5;j++)p.push(P(BOX,0xffffff,(R()-0.5)*3,0,(R()-0.5)*1.8,0,0,0,1.5+R()*2,0.6,1.2+R()*1.4));
  const m=new T.Mesh(merge(p),cloudMat);m.castShadow=true;m.frustumCulled=false;m.userData={ox:-40+i*14,oz:(R()-0.5)*40,sp:0.35+R()*0.3};m.position.y=11;scene.add(m);clouds.push(m);}

const gulls=[];
for(let i=0;i<3;i++){const g=new T.Group();g.add(M([P(ICO2,0xf4f4f0,0,0,0,0,0,0,0.14,0.12,0.36),P(ICO2,0xf4f4f0,0,0.04,0.17,0,0,0,0.1,0.1,0.1),P(CONE4,0xf6d04a,0,0.03,0.25,1.57,0,0,0.04,0.08,0.03),P(CONE4,0xdedee6,0,0,-0.22,-1.57,0,0,0.1,0.12,0.03),P(ICO2,0x1a1420,0.04,0.06,0.2,0,0,0,0.02,0.02,0.02),P(ICO2,0x1a1420,-0.04,0.06,0.2,0,0,0,0.02,0.02,0.02)]));
  const wl=M([P(BOX,0xdedee6,-0.2,0,0,0,0,0,0.4,0.03,0.14)]),wr=M([P(BOX,0xdedee6,0.2,0,0,0,0,0,0.4,0.03,0.14)]);g.add(wl,wr);
  g.userData={wl,wr,r:5+i*2,sp:0.25+i*0.07,ph:i*2.1,y:4+i*0.8};scene.add(g);gulls.push(g);}

const npcBoat=new T.Group();
npcBoat.add(M([P(BOX,0xf2eee6,0,0.12,0,0,0,0,0.6,0.24,1.7),P(BOX,0xc0503a,0,0.2,0,0,0,0,0.62,0.06,1.72),P(CONE4,0xf2eee6,0,0.12,0.95,Math.PI/2,Math.PI/4,0,0.42,0.4,0.24),
  P(BOX,0x6a4a30,0,1.2,-0.1,0,0,0,0.06,2.0,0.06),P(BOX,0xf8f4ea,0,1.25,-0.45,0,0,0,0.03,1.5,0.62),P(BOX,0xf8f4ea,0,0.95,0.3,0,0,0,0.03,1.0,0.5)]));
scene.add(npcBoat);

const glintMat=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.85,depthWrite:false});
const GLINTS=140;const glints=new T.InstancedMesh(new T.PlaneGeometry(0.4,0.08).rotateX(-Math.PI/2),glintMat,GLINTS);glints.frustumCulled=false;scene.add(glints);
const glintData=[];for(let i=0;i<GLINTS;i++)glintData.push({x:Math.random()*70,z:Math.random()*70,ph:Math.random()*6.28,sp:0.6+Math.random()*1.4});

const FF=40;const ffGeo=new T.BufferGeometry();ffGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(FF*3),3));
const ffMat=new T.PointsMaterial({color:0xe6ff8a,size:2,sizeAttenuation:false,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false});
const fireflies=new T.Points(ffGeo,ffMat);fireflies.frustumCulled=false;scene.add(fireflies);const ffData=[];let ffIsl=-2;
function placeFireflies(isl){ffData.length=0;ffIsl=isl?isl.id:-1;if(!isl||!isl.grass.length)return;for(let i=0;i<FF;i++){const [x,z]=pickR(isl.grass);ffData.push({x,z,ph:Math.random()*6.28});}}

const RAIN=280;const rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(RAIN*6),3));
const rain=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:0xcad8ff,transparent:true,opacity:0.6}));rain.frustumCulled=false;scene.add(rain);
const rainData=[];for(let i=0;i<RAIN;i++)rainData.push({x:(Math.random()-0.5)*30,y:Math.random()*14,z:(Math.random()-0.5)*30});

const PMAX=500;const pIM=new T.InstancedMesh(BOX,new T.MeshBasicMaterial({color:0xffffff}),PMAX);pIM.frustumCulled=false;
for(let i=0;i<PMAX;i++)pIM.setColorAt(i,_c.set(0xffffff));pIM.count=0;scene.add(pIM);
const parts=[];
function emit(x,y,z,o){if(parts.length>=PMAX)parts.shift();parts.push(Object.assign({x,y,z,vx:0,vy:0,vz:0,life:1,max:1,size:0.08,color:0xffffff,g:0,spin:0},o));}
function sparkle(x,y,z,color=0xffffff){emit(x+(Math.random()-0.5)*0.6,y+Math.random()*0.4,z+(Math.random()-0.5)*0.6,{vy:0.35,life:1.1,max:1.1,size:0.07,color,spin:1});}
function burst(x,y,z,color,n=10,spd=1.6,size=0.08,g=5){for(let i=0;i<n;i++){const a=Math.random()*6.28;emit(x,y,z,{vx:Math.cos(a)*spd*Math.random(),vy:1.2+Math.random()*spd,vz:Math.sin(a)*spd*Math.random(),life:0.7,max:0.7,size,color,g});}}
function hearts(x,y,z){for(let i=0;i<6;i++)emit(x+(Math.random()-0.5)*0.4,y+Math.random()*0.2,z+(Math.random()-0.5)*0.4,{vy:0.9+Math.random()*0.4,life:0.9,max:0.9,size:0.09,color:i%2?0xf39ab0:0xffc8d8,spin:1});}
function updateParticles(dt){let n=0;
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;if(p.life<=0){parts.splice(i,1);continue;}p.vy-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}
  for(const p of parts){const s=p.size*(p.spin?Math.sin(p.life/p.max*Math.PI):Math.min(1,p.life/p.max*2));
    _e.set(0,p.spin?p.life*4:0,p.spin?0.785:0);_q.setFromEuler(_e);_m.compose(_v.set(p.x,p.y,p.z),_q,_s.set(s,s,s));pIM.setMatrixAt(n,_m);pIM.setColorAt(n,_c.set(p.color));n++;}
  pIM.count=n;pIM.instanceMatrix.needsUpdate=true;if(pIM.instanceColor)pIM.instanceColor.needsUpdate=true;}

const cursor=M([P(BOX,0xffffff,0,0,-0.47,0,0,0,1,0.04,0.06),P(BOX,0xffffff,0,0,0.47,0,0,0,1,0.04,0.06),P(BOX,0xffffff,-0.47,0,0,0,0,0,0.06,0.04,1),P(BOX,0xffffff,0.47,0,0,0,0,0,0.06,0.04,1)],new T.MeshBasicMaterial({color:0xfff6e2}));
cursor.castShadow=false;cursor.visible=false;scene.add(cursor);let cursorT=0;
function cursorAt(x,z,color=0xfff6e2){cursor.material.color.set(color);cursor.position.set(x,topY(x,z)+0.1,z);cursor.visible=true;cursorT=1.4;}

