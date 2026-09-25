// flowing water (or lava): a toon material whose colour shimmers with world position and time
function flowMat(col,hi,emi,fall){const m=toon({color:col,emissive:emi||0,emissiveIntensity:emi?0.9:0,side:fall?T.DoubleSide:T.FrontSide});
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=riverU.uTime;
    sh.vertexShader='varying vec3 vRW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n  vec4 rw=vec4(transformed,1.);\n  #ifdef USE_INSTANCING\n  rw=instanceMatrix*rw;\n  #endif\n  vRW=(modelMatrix*rw).xyz;');
    sh.fragmentShader='uniform float uTime;varying vec3 vRW;\n'+sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );',fall?
      `vec4 diffuseColor = vec4( diffuse, opacity );
      float st=fract(vRW.y*2.4+uTime*2.6+sin(vRW.x*7.+vRW.z*7.)*0.7);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(${hi}),step(0.62,st)*0.85);`:
      `vec4 diffuseColor = vec4( diffuse, opacity );
      float w=sin(vRW.x*2.6+uTime*1.4)+sin(vRW.z*3.1-uTime*1.8)+sin((vRW.x-vRW.z)*1.7+uTime*0.9);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(${hi}),smoothstep(1.7,2.5,w)*0.8);diffuseColor.rgb*=0.93+0.07*sin(vRW.x*1.3+vRW.z*0.7+uTime*0.6);`);};
  return m;}
const RIVER_MATS={water:flowMat(0x4f9ae0,'0.86,0.95,1.0'),swamp:flowMat(0x4a8070,'0.7,0.86,0.78'),snow:flowMat(0x72b4e8,'0.92,0.98,1.0'),lava:flowMat(0xe0582a,'1.0,0.86,0.3',0xb03a10)};
const FALL_MATS={water:flowMat(0x7ab8f0,'0.95,0.99,1.0',0,1),swamp:flowMat(0x6a9a88,'0.85,0.95,0.9',0,1),snow:flowMat(0x9accf4,'1.0,1.0,1.0',0,1),lava:flowMat(0xf0782a,'1.0,0.92,0.4',0xc04a10,1)};
const FALL_PLANE=new T.PlaneGeometry(1,1);
// carve rivers from an inland pond down to the sea; they drop a tier at a time as waterfalls and get wooden bridges
function carveRivers(isl,g){const R=mulberry(isl.seed^0x71e5),B=BIOMES[isl.biome],lava=isl.biome==='volcano',wide=isl.rw||1,mk=lava?'lava':isl.biome==='swamp'?'swamp':isl.biome==='snow'?'snow':'water';
  const typeAt=(x,z)=>islMap.get(K(x,z))===isl.id?landMap.get(K(x,z)):null;
  const lvl=(x,z)=>{const t=typeAt(x,z);return t==='grass'?(lvlMap.get(K(x,z))||0):t==='sand'?-1:-9;};
  const tiles=new Map(),mains=[];const a0=isl.home?Math.PI/2:R()*6.283,off=lava?4.6:isl.home?0:isl.r*0.08;
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
  const bed=new T.InstancedMesh(BOX,vcMatFlat,list.length),wat=new T.InstancedMesh(TILE_PLANE,RIVER_MATS[mk],list.length);
  list.forEach((q,i)=>{const bt=q.surf-0.14,h=bt+0.6;_m.compose(_v.set(q.x,-0.6+h/2,q.z),_q.identity(),_s.set(1,h,1));bed.setMatrixAt(i,_m);bed.setColorAt(i,_c.set(lava?0x3a2a2a:B.cliff||0x9a7050).multiplyScalar(0.72));
    _m.makeTranslation(q.x,q.surf,q.z);wat.setMatrixAt(i,_m);});
  for(const m of [bed,wat]){m.frustumCulled=false;m.receiveShadow=true;g.add(m);}
  const fp=[];isl.falls=[];
  for(const q of list)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const k2=K(q.x+dx,q.z+dz);if(!riverSurf.has(k2))continue;const s2=riverSurf.get(k2);
    if(s2<q.surf-0.05){const h=q.surf-s2+0.02;fp.push(P(FALL_PLANE,0xffffff,q.x+dx*0.5,s2+h/2,q.z+dz*0.5,0,Math.atan2(dx,dz),0,1,h,1));isl.falls.push([q.x+dx*0.62,s2,q.z+dz*0.62]);}}
  if(fp.length){const m=new T.Mesh(merge(fp),FALL_MATS[mk]);m.frustumCulled=false;g.add(m);}
  if(pb.length)g.add(M(pb.filter(Boolean)));}
