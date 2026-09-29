// flowing water (or lava): a toon material whose colour shimmers with world position and time
function flowMat(col,hi,emi,fall){const m=toon({color:col,emissive:emi||0,emissiveIntensity:emi?0.9:0,side:fall?T.DoubleSide:T.FrontSide});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=riverU.uTime;
    sh.vertexShader='varying vec3 vRW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n  vec4 rw=vec4(transformed,1.);\n  #ifdef USE_INSTANCING\n  rw=instanceMatrix*rw;\n  #endif\n  vRW=(modelMatrix*rw).xyz;');
    sh.fragmentShader='uniform float uTime;varying vec3 vRW;\n'+sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );',fall?
      `vec4 diffuseColor = vec4( diffuse, opacity );
      float st=fract(vRW.y*2.4+uTime*2.6+sin(vRW.x*7.+vRW.z*7.)*0.7);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(${hi}),step(0.62,st)*0.85);`:
      `vec4 diffuseColor = vec4( diffuse, opacity );
      float w=sin(vRW.x*2.6+uTime*1.4)+sin(vRW.z*3.1-uTime*1.8)+sin((vRW.x-vRW.z)*1.7+uTime*0.9);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(${hi}),smoothstep(1.7,2.5,w)*0.8);diffuseColor.rgb*=0.93+0.07*sin(vRW.x*1.3+vRW.z*0.7+uTime*0.6);
      // little sparkles riding the current
      {vec2 c=floor(vRW.xz*3.+vec2(uTime*.9,uTime*.6));float h=fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);diffuseColor.rgb+=vec3(.9,.95,1.)*step(.965,h)*step(.5,sin(uTime*3.+h*30.))*.6;}`);};
  return m;}
// river water: deep in the channel and clear teal in the shallows by the banks (a blurred mask of every river tile,
// uRMask), streaks of current flowing downstream along each tile's flow (aFlow), soft foam lapping the banks, and glints
const RMASK_N=512,RMASK_O=256,rmaskData=new Uint8Array(RMASK_N*RMASK_N*4);
const rmaskTex=new T.DataTexture(rmaskData,RMASK_N,RMASK_N,T.RGBAFormat);rmaskTex.magFilter=rmaskTex.minFilter=T.LinearFilter;
let rmaskN=-1;
function buildRiverMask(){rmaskN=riverSurf.size;rmaskData.fill(0);const r=3;
  for(const k of riverSurf.keys()){const [x,z]=k.split(',').map(Number),ix=x+RMASK_O,iz=z+RMASK_O;if(ix<0||iz<0||ix>=RMASK_N||iz>=RMASK_N)continue;
    let d=r+1;for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(riverSurf.has(K(x+dx,z+dz)))continue;const e=Math.hypot(dx,dz);if(e<d)d=e;}
    const i=(iz*RMASK_N+ix)*4;rmaskData[i]=Math.round(Math.min(1,d/(r+0.6))*255);rmaskData[i+3]=255;}
  rmaskTex.needsUpdate=true;}
const rmaskU={value:rmaskTex};
function riverMat(col,deepK,shal,hi,speed){const m=toon({color:0xffffff});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=riverU.uTime;sh.uniforms.uRMask=rmaskU;
    sh.vertexShader='varying vec3 vRW;varying vec2 vFlow;attribute vec2 aFlow;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n  vFlow=aFlow;vec4 rw=vec4(transformed,1.);\n  #ifdef USE_INSTANCING\n  rw=instanceMatrix*rw;\n  #endif\n  vRW=(modelMatrix*rw).xyz;');
    sh.fragmentShader='uniform float uTime;uniform sampler2D uRMask;varying vec3 vRW;varying vec2 vFlow;\n'+sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );',`vec4 diffuseColor = vec4( diffuse, opacity );
      {vec2 fd=normalize(vFlow+vec2(0.0001,0.0));vec2 pp=vec2(-fd.y,fd.x);float u=dot(vRW.xz,fd),v=dot(vRW.xz,pp);
      float bank=texture2D(uRMask,(vRW.xz+${RMASK_O}.5)/${RMASK_N}.).r;
      vec3 deep=vec3(${col})*${deepK},shal=vec3(${shal});
      vec3 c=mix(shal,deep,smoothstep(0.1,0.6,bank));
      c*=0.95+0.05*sin(u*0.8+v*1.3-uTime*0.7);
      // streaks of current: long thin highlights drifting downstream, wobbling across the flow
      float wob=sin(v*4.1+sin(u*0.9+uTime*0.4)*1.4);
      float s1=sin((u-uTime*${speed})*2.6+wob*2.2)*0.5+0.5,s2=sin((u*1.7-uTime*${speed}*1.4)*1.9+v*6.3)*0.5+0.5;
      float streak=smoothstep(0.86,0.97,s1)*smoothstep(-0.2,0.6,sin(v*3.3+1.7))+smoothstep(0.93,0.99,s2)*0.6;
      c=mix(c,vec3(${hi}),clamp(streak,0.,1.)*0.5*smoothstep(0.1,0.35,bank));
      // foam lapping the banks, a lacy line that breathes with the water
      float lace=0.55+0.45*sin(u*5.3-uTime*2.2+v*1.7)*sin(u*2.1+uTime*1.1);
      float foam=smoothstep(0.26,0.1,bank)*lace+smoothstep(0.16,0.06,bank)*0.7;
      c=mix(c,vec3(0.86,0.92,0.94),clamp(foam,0.,1.)*0.75);
      // glints riding the current
      {vec2 g=floor(vec2(u-uTime*${speed}*0.8,v)*vec2(3.,4.));float h=fract(sin(dot(g,vec2(12.9898,78.233)))*43758.5453);c+=vec3(.9,.95,1.)*step(.975,h)*step(.4,sin(uTime*4.+h*40.))*.5*step(0.25,bank);}
      diffuseColor.rgb=c;}`);};
  return m;}
const RIVER_MATS={water:riverMat('0.06,0.25,0.5','1.0','0.24,0.56,0.62','0.62,0.84,0.94','0.9'),swamp:riverMat('0.15,0.3,0.25','1.0','0.28,0.44,0.34','0.56,0.7,0.62','0.4'),snow:riverMat('0.18,0.42,0.7','1.0','0.42,0.66,0.78','0.8,0.92,1.0','0.8'),lava:flowMat(0xe0582a,'1.0,0.86,0.3',0xb03a10)};
const FALL_MATS={water:flowMat(0x7ab8f0,'0.95,0.99,1.0',0,1),swamp:flowMat(0x6a9a88,'0.85,0.95,0.9',0,1),snow:flowMat(0x9accf4,'1.0,1.0,1.0',0,1),lava:flowMat(0xf0782a,'1.0,0.92,0.4',0xc04a10,1)};
const FALL_PLANE=new T.PlaneGeometry(1,1);
// carve rivers from an inland pond down to the sea; they drop a tier at a time as waterfalls and get wooden bridges
function carveRivers(isl,g){const R=mulberry(isl.seed^0x71e5),B=BIOMES[isl.biome],lava=isl.biome==='volcano',wide=isl.rw||1,mk=lava?'lava':isl.biome==='swamp'?'swamp':isl.biome==='snow'?'snow':'water';
  const typeAt=(x,z)=>islMap.get(K(x,z))===isl.id?landMap.get(K(x,z)):null;
  const lvl=(x,z)=>{const t=typeAt(x,z);return t==='grass'?(lvlMap.get(K(x,z))||0):t==='sand'?-1:-9;};
  const tiles=new Map(),mains=[];isl.ponds=[];const a0=isl.home?Math.PI/2:R()*6.283,off=lava?4.6:isl.home?0:isl.r*0.08;
  if(isl.home){isl.cx=Math.round((R()-0.5)*TOWN_W*0.8);isl.cz=-Math.round(TOWN_D*0.74);}
  const addT=(x,z,L,fx,fz)=>{const k=K(x,z);if(lvl(x,z)<-1)return false;const o=tiles.get(k);if(o){o.L=Math.min(o.L,L);return true;}tiles.set(k,{x,z,L,fx,fz});return true;};
  for(let r=0;r<(isl.riverN||0);r++){const ang=r===0?a0:a0+Math.PI+(R()-0.5)*1.2;let a=ang,x=isl.cx+Math.cos(ang)*off,z=isl.cz+Math.sin(ang)*off,px=Math.round(x),pz=Math.round(z);
    let L=lvl(px,pz);if(L<0)continue;const path=[[px,pz]],ph=R()*6;
    for(let s=0;s<300;s++){a+=(R()-0.5)*0.3+Math.sin(s*0.13+ph)*0.05;a+=(ang-a)*0.04;x+=Math.cos(a)*0.5;z+=Math.sin(a)*0.5;const nx=Math.round(x),nz=Math.round(z);if(nx===px&&nz===pz)continue;
      if(nx!==px&&nz!==pz)path.push([nx,pz]);path.push([nx,nz]);px=nx;pz=nz;const t=typeAt(nx,nz);if(t!=='grass'&&t!=='sand')break;}
    if(r===0)for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)if(dx*dx+dz*dz<=(wide>1?4:2)&&lvl(path[0][0]+dx,path[0][1]+dz)>=L)addT(path[0][0]+dx,path[0][1]+dz,L,1,0);
    const main=[];
    for(let i=0;i<path.length;i++){const [x0,z0]=path[i],nx=path[Math.min(i+1,path.length-1)],pv=path[Math.max(i-1,0)],fx=nx[0]-pv[0],fz=nx[1]-pv[1];
      const l0=lvl(x0,z0);if(l0<-1)break;const side=Math.abs(fx)>=Math.abs(fz)?[x0,z0+1]:[x0+1,z0];
      let Li=Math.min(L,l0);if(wide>1&&lvl(side[0],side[1])>=-1)Li=Math.min(Li,lvl(side[0],side[1]));L=Li;
      addT(x0,z0,Li,fx,fz);if(wide>1)addT(side[0],side[1],Li,fx,fz);main.push({x:x0,z:z0,fx,fz,L:Li});}
    mains.push(main);}
  if(isl.home){isl.cx=0;isl.cz=0;}
  // a wild home island also gets two or three ponds: round, reedy freshwater pools out in the meadows and woods
  if(isl.home&&S.wild&&!(S.home&&S.home.preset)){const hs=homeScale(),np=2+Math.floor(R()*2);
    for(let p=0;p<np;p++)for(let it=0;it<80;it++){const x=Math.round((R()-0.5)*2*TOWN_W*hs*0.62),z=Math.round((R()-0.5)*2*TOWN_D*hs*0.62);
      if(townQ(x,z)>0.62||lvl(x,z)<0||(z>TOWN_D*hs*0.25&&Math.abs(x)<9))continue;let near=false;for(const t of tiles.values())if(Math.abs(t.x-x)<6&&Math.abs(t.z-z)<6){near=true;break;}if(near)continue;
      const L=lvl(x,z),r=1.5+R()*1.4,ph=R()*6;
      for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++){const a=Math.atan2(dz,dx),rr=r*(1+0.22*Math.sin(a*3+ph)+0.12*Math.sin(a*5-ph));if(Math.hypot(dx,dz*1.15)>rr)continue;
        if(lvl(x+dx,z+dz)>=L&&townQ(x+dx,z+dz)<0.8)addT(x+dx,z+dz,L,1,0);}
      (isl.ponds||(isl.ponds=[])).push([x,z,r]);break;}}
  if(!tiles.size)return;
  const list=[...tiles.values()];
  for(const q of list){const k=K(q.x,q.z);q.surf=q.L<0?0.07:TOP.grass+q.L*LVH-0.2;landMap.set(k,'river');riverSurf.set(k,q.surf);lvlMap.set(k,Math.max(0,q.L));}
  isl.grass=isl.grass.filter(([x,z])=>!tiles.has(K(x,z)));isl.sand=isl.sand.filter(([x,z])=>!tiles.has(K(x,z)));isl.rtiles=list;isl.lava=lava;
  // bridges: across the flow where both banks are at the same height and there's no waterfall
  const pb=[];isl.bridges=0;
  for(const main of mains){const want=isl.home?[0.4,0.62,0.84]:wide>1?[0.3,0.62]:[0.5];
    for(const fr of want){for(let d=0;d<main.length*0.2;d++){const j=Math.floor(main.length*fr)+(d%2?-1:1)*Math.ceil(d/2);const m=main[j];if(!m||m.L<0)continue;
      const along=Math.abs(m.fx)>=Math.abs(m.fz),[ux,uz]=along?[0,1]:[1,0];let a=0,b=0;while(tiles.has(K(m.x-ux*(a+1),m.z-uz*(a+1)))&&a<3)a++;while(tiles.has(K(m.x+ux*(b+1),m.z+uz*(b+1)))&&b<3)b++;
      const e1=[m.x-ux*(a+1),m.z-uz*(a+1)],e2=[m.x+ux*(b+1),m.z+uz*(b+1)];if(typeAt(...e1)!=='grass'||typeAt(...e2)!=='grass')continue;const bl=lvlMap.get(K(...e1))||0;if(bl!==(lvlMap.get(K(...e2))||0))continue;
      const row=[];for(let t=-a;t<=b;t++)row.push([m.x+ux*t,m.z+uz*t]);if(row.some(([x,z])=>{const q=tiles.get(K(x,z));return !q||q.L!==m.L||landMap.get(K(x,z))!=='river';}))continue;
      const fl=[[m.x+(along?1:0),m.z+(along?0:1)],[m.x-(along?1:0),m.z-(along?0:1)]];if(fl.some(([x,z])=>riverSurf.has(K(x,z))&&Math.abs(riverSurf.get(K(x,z))-riverSurf.get(K(m.x,m.z)))>0.05))continue;
      const y=TOP.grass+bl*LVH-0.02;
      for(const [x,z] of row){const k=K(x,z);landMap.set(k,'bridge');bridgeY.set(k,y);
        for(let i=0;i<4;i++){const o=-0.36+i*0.24;pb.push(along?P(BOX,i%2?0xa27a50:0x94704a,x+o,y-0.04,z,0,0,0,0.22,0.07,1.0):P(BOX,i%2?0xa27a50:0x94704a,x,y-0.04,z+o,0,0,0,1.0,0.07,0.22));}
        for(const sd of [-1,1]){const rx=along?x+sd*0.47:x,rz=along?z:z+sd*0.47;
          pb.push(P(BOX,0x7a5230,rx,y+0.2,rz,0,0,0,along?0.06:1.02,0.06,along?1.02:0.06),P(CYL8,0x5a3a2a,rx,y-0.12,rz,0,0,0,0.09,0.7,0.09));}}
      isl.bridges++;break;}}}
  // river beds, water, waterfalls
  const bed=new T.InstancedMesh(BOX,vcMatFlat,list.length),wat=new T.InstancedMesh(lava?TILE_PLANE:TILE_PLANE.clone(),RIVER_MATS[mk],list.length);
  if(!lava){const fl=new Float32Array(list.length*2);list.forEach((q,i)=>{const L=Math.hypot(q.fx||0,q.fz||0)||1;fl[i*2]=(q.fx||1)/L;fl[i*2+1]=(q.fz||0)/L;});wat.geometry.setAttribute('aFlow',new T.InstancedBufferAttribute(fl,2));}
  list.forEach((q,i)=>{const bt=q.surf-0.14,h=bt+0.6;_m.compose(_v.set(q.x,-0.6+h/2,q.z),_q.identity(),_s.set(1,h,1));bed.setMatrixAt(i,_m);bed.setColorAt(i,_c.set(lava?0x3a2a2a:B.cliff||0x9a7050).multiplyScalar(0.72));
    _m.makeTranslation(q.x,q.surf,q.z);wat.setMatrixAt(i,_m);});
  for(const m of [bed,wat]){m.frustumCulled=false;m.receiveShadow=true;g.add(m);}
  // banks: a soft line of foam where the water meets the land, rounded pebbles along the edge, and tufts of reeds
  if(!lava){const fo=[],pb=[],Rb=mulberry(isl.seed^0xba2c);
    for(const q of list)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const k2=K(q.x+dx,q.z+dz),t2=landMap.get(k2);if(riverSurf.has(k2)||t2==='bridge'||!isLandT(t2))continue;
      const ex=q.x+dx*0.42,ez=q.z+dz*0.42;if(false)fo.push(P(BOX,/* (the water's own foam replaces the old strips) */0xffffff,ex,q.surf+0.012,ez,0,0,0,dz?0.96:0.12,0.01,dx?0.96:0.12));
      if(Rb()<0.45){const s=0.1+Rb()*0.1,ox=dz?(Rb()-0.5)*0.8:0,oz=dx?(Rb()-0.5)*0.8:0;pb.push(PG(SPH_LO,0x8a909c,0x565c68,q.x+dx*0.5+ox,q.surf+0.03,q.z+dz*0.5+oz,0,Rb()*3,0,s*1.4,s*0.7,s));}
      if(Rb()<0.18&&t2==='grass'){const bx=q.x+dx*0.62+(dz?(Rb()-0.5)*0.6:0),bz=q.z+dz*0.62+(dx?(Rb()-0.5)*0.6:0),by=topY(q.x+dx,q.z+dz);for(let i=0;i<4;i++){const h=0.28+Rb()*0.25;pb.push(P(CYL5,i%2?0x5a8a3a:0x6a9a44,bx+(Rb()-0.5)*0.16,by+h/2,bz+(Rb()-0.5)*0.16,(Rb()-0.5)*0.3,0,(Rb()-0.5)*0.3,0.025,h,0.025));}}}
    if(fo.length){const m=M(fo,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.55,depthWrite:false}));m.castShadow=false;m.receiveShadow=false;g.add(m);}
    if(pb.length){const m=M(pb);m.castShadow=false;g.add(m);}}
  const fp=[];isl.falls=[];
  for(const q of list)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const k2=K(q.x+dx,q.z+dz);if(!riverSurf.has(k2))continue;const s2=riverSurf.get(k2);
    if(s2<q.surf-0.05){const h=q.surf-s2+0.02;fp.push(P(FALL_PLANE,0xffffff,q.x+dx*0.5,s2+h/2,q.z+dz*0.5,0,Math.atan2(dx,dz),0,1,h,1));isl.falls.push([q.x+dx*0.62,s2,q.z+dz*0.62]);}}
  if(fp.length){const m=new T.Mesh(merge(fp),FALL_MATS[mk]);m.frustumCulled=false;g.add(m);}
  // ponds: lily pads (some flowering) floating on the water, and reeds and cattails round the edges
  if(isl.ponds&&isl.ponds.length){const lp=[],Rl=mulberry(isl.seed^0x11e5);
    for(const [px,pz,r] of isl.ponds){const sy=riverSurf.get(K(px,pz));if(sy===undefined)continue;
      for(let i=0;i<Math.round(r*4);i++){const a=Rl()*6.283,d=Rl()*r*0.8,x=px+Math.cos(a)*d,z=pz+Math.sin(a)*d;if(!riverSurf.has(K(Math.round(x),Math.round(z))))continue;const s=0.22+Rl()*0.16;
        lp.push(P(CYL8,Rl()<0.5?0x4f9a3a:0x5aa844,x,sy+0.015,z,0,Rl()*6,0,s,0.012,s));if(Rl()<0.35)bloom(lp,[0xf6b4cc,0xffffff,0xf8d0e0][i%3],0xf6d04a,x+0.03,sy+0.04,z,0.07,6,0.5);}
      for(let i=0;i<Math.round(r*6);i++){const a=Rl()*6.283,d=r+0.2+Rl()*0.9,x=px+Math.cos(a)*d,z=pz+Math.sin(a)*d,k=K(Math.round(x),Math.round(z));if(landMap.get(k)!=='grass')continue;
        const y=topY(Math.round(x),Math.round(z)),h=0.35+Rl()*0.35;lp.push(P(CYL5,0x5a8a3a,x,y+h/2,z,(Rl()-0.5)*0.2,0,(Rl()-0.5)*0.2,0.03,h,0.03));if(Rl()<0.5)lp.push(P(CYL6,0x7a4a2a,x,y+h-0.04,z,0,0,0,0.07,0.16,0.07));}}
    if(lp.length){const m=M(lp);m.castShadow=false;g.add(m);}}
  if(pb.length)g.add(M(pb.filter(Boolean)));}
