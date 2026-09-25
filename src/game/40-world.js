/* =========================================================
   World: home island + generated islands
   ========================================================= */
const TOP={grass:0.5,sand:0.3,bridge:0.32};
// the farm field: a flat island just west of home, joined by a wooden bridge
const FARM={x:-40,z:1};
const TOWN_W=22,TOWN_D=17;
function townQ(x,z){const dx=Math.abs(x)/TOWN_W,dz=Math.abs(z-0.5)/TOWN_D;return Math.pow(dx**5+dz**5,0.2)*(1+(hash(x*0.7,z*1.1)-0.5)*0.035);}
function farmQ(x,z){const dx=Math.abs(x-FARM.x)/7.6,dz=Math.abs(z-FARM.z)/6.6;return Math.pow(dx**4+dz**4,0.25)*(1+(hash(x*1.3,z*2.1)-0.5)*0.06);}
const landMap=new Map(),islMap=new Map();let landList=[];
let islands=[];
const isLandT=t=>t==='grass'||t==='sand'||t==='bridge';
function isLand(x,z){return isLandT(landMap.get(K(x,z)));}
const lvlMap=new Map(),LVH=0.62;
function topY(x,z){const k=K(x,z),t=landMap.get(k);return t==='grass'?TOP.grass+(lvlMap.get(k)||0)*LVH:t==='bridge'&&bridgeY.has(k)?bridgeY.get(k):t==='river'?riverSurf.get(k):TOP[t]||0;}
// rivers: water surface height per tile (bridges over a river keep theirs), and bridge deck heights
const riverSurf=new Map(),bridgeY=new Map();let riverList=[];
const waterY=(x,z)=>riverSurf.get(K(Math.round(x),Math.round(z)))||0;
function homeD(x,z){const a=Math.atan2(z,x);const f=1+0.10*Math.sin(3*a+0.7)+0.07*Math.sin(5*a+2.1)+0.05*Math.sin(7*a+4.0);return Math.hypot(x*0.82,z)/f;}
function islR(isl){return isl.home?TOWN_W:isl.r;}
function islDist(isl,x,z){if(isl.home)return townQ(x,z)*TOWN_W;const dx=x-isl.cx,dz=z-isl.cz,a=Math.atan2(dz,dx);
  const f=1+0.12*Math.sin(3*a+isl.p1)+0.08*Math.sin(5*a+isl.p2)+0.06*Math.sin(2*a+isl.p3);return Math.hypot(dx*isl.sx,dz)/f;}
const TRANK={grass:4,sand:3,s1:2,s2:1};
function tileTypeI(isl,x,z){const R=islR(isl),d=islDist(isl,x,z),b=BIOMES[isl.biome].beach||1.25;
  let t=d<R-b?'grass':d<R?'sand':d<R+1.0?'s1':d<R+2.1?'s2':null;
  if(isl.home){const q=townQ(x,z),bw=0.05+0.11*clamp(z/TOWN_D,0,1);t=q<1-bw?'grass':q<1?'sand':q<1.07?'s1':q<1.15?'s2':null;}
  if(isl.home){const q=farmQ(x,z),f=q<0.83?'grass':q<1?'sand':q<1.13?'s1':q<1.28?'s2':null;if(f&&(!t||TRANK[f]>TRANK[t]))t=f;}
  return t;}
function genIslands(){
  const R=mulberry(S.worldSeed);
  islands=[{id:0,cx:0,cz:0,biome:'home',name:'Home',home:true,seed:S.worldSeed|0,riverN:1,rw:2}];
  const bl=shuffle(BIOME_IDS.slice(),R);const used=new Set();
  for(let i=0;i<13;i++){
    const biome=i<bl.length?bl[i]:bl[Math.floor(R()*bl.length)],B=BIOMES[biome];
    const r=5.2+R()*3.6;let cx=0,cz=0,ok=false;
    for(let t=0;t<90&&!ok;t++){const a=R()*6.283,d=36+i*6+R()*10+t*0.6;cx=Math.round(Math.cos(a)*d);cz=Math.round(Math.sin(a)*d);
      ok=islands.every(o=>Math.hypot(o.cx-cx,o.cz-cz)>(o.home?40:o.r0/0.7)+r/0.7+9)&&Math.hypot(FARM.x-cx,FARM.z-cz)>13+r*1.2/0.7+7;}
    if(!ok)continue;
    let name='';for(let t=0;t<30;t++){name=B.names[0][Math.floor(R()*B.names[0].length)]+' '+B.names[1][Math.floor(R()*B.names[1].length)];if(!used.has(name))break;}used.add(name);
    islands.push({id:islands.length,cx,cz,r:r*1.2,r0:r,riverN:r*1.2>=9.4&&biome!=='volcano'?1:0,rw:1,biome,name,sx:0.78+R()*0.4,p1:R()*6.28,p2:R()*6.28,p3:R()*6.28,seed:Math.floor(R()*1e9)});
  }
  // grand isles: big, hilly islands out past the others (separate RNG so older worlds keep their layout)
  const G=mulberry(S.worldSeed^0x5eed51);
  const gb=shuffle(BIOME_IDS.slice(),G);
  for(let i=0;i<5;i++){
    const biome=gb[i],B=BIOMES[biome],r=15+G()*4;let cx=0,cz=0,ok=false;
    for(let t=0;t<120&&!ok;t++){const a=G()*6.283,d=92+i*14+G()*16+t*0.7;cx=Math.round(Math.cos(a)*d);cz=Math.round(Math.sin(a)*d);
      ok=islands.every(o=>Math.hypot(o.cx-cx,o.cz-cz)>(o.home?40:o.r/0.7)+r/0.7+10);}
    if(!ok)continue;
    let name='';for(let t=0;t<30;t++){name='Great '+B.names[0][Math.floor(G()*B.names[0].length)]+' '+B.names[1][Math.floor(G()*B.names[1].length)];if(!used.has(name))break;}used.add(name);
    islands.push({id:islands.length,cx,cz,r,biome,name,grand:true,riverN:biome==='volcano'?1:1+(G()<0.5?1:0),rw:2,sx:0.8+G()*0.35,p1:G()*6.28,p2:G()*6.28,p3:G()*6.28,seed:Math.floor(G()*1e9)});
  }
}
function rebuildLandList(){landList=[];riverList=[];for(const [k,t] of landMap){if(t==='river'){const [x,z]=k.split(',').map(Number);riverList.push([x,z,riverSurf.get(k)]);continue;}if(!isLandT(t))continue;const [x,z]=k.split(',').map(Number);landList.push([x,z,t,islMap.get(k),topY(x,z)]);}}

