/* =========================================================
   The wild island. A game started by arriving at sea (S.scratch) begins on untouched land: forests, thickets, rocky
   ground under the cliffs and open meadows, laid out by noise from the world seed and the island's style. Nothing is
   built; everything wild is ordinary farm debris (74-life), so it's cleared with the same tools, and trees are a
   debris kind of their own: chop one down with the axe and its stump stays to be dug out.
   Also here: where the Island Heart stood in saves from before you planted your own driftseed, and desire paths.
   ========================================================= */
// the wild trees change with the real seasons. Four kinds (instanced debris variants): 0 and 2 round broadleaf trees,
// 1 an evergreen pine, 3 a flowering/fruiting tree. Spring: fresh green with blossom (3 is a cherry in bloom); summer: deep
// green (3 carries red fruit); autumn: amber, scarlet and gold; winter: bare branches dusted with snow, and snowy pines.
const TREE_COLS={spring:[[0x8ed06a,0x5aa846,0x356e32],null,[0x82c460,0x4f9a40,0x2e662e],[0xffd8e6,0xf4a8c4,0xd07a9a]],
  summer:[[0x6cb44a,0x468f38,0x27602a],null,[0x5ea842,0x3a8034,0x21552a],[0x78bc50,0x4a9438,0x2a642a]],
  autumn:[[0xf4a444,0xe8803a,0xc85e24],null,[0xec6a4a,0xc8402a,0x982a22],[0xf6d060,0xe0b040,0xb08a28]]};
function bareTree(p,R,snow){trunkP(p,R,0x6a5444,0.9,0.13,0x4e3e32);
  for(let i=0;i<7;i++){const a=i/7*6.283+R()*0.4,tl=0.55+R()*0.4,L=0.55+R()*0.3,y=0.95+R()*0.5,x=Math.cos(a)*Math.sin(tl)*L*0.5,z=Math.sin(a)*Math.sin(tl)*L*0.5;
    p.push(P(CYL6,0x5e4a3c,x,y+Math.cos(tl)*L*0.5,z,Math.sin(a)*tl,0,-Math.cos(a)*tl,0.05,L,0.05));
    const tx=Math.cos(a)*Math.sin(tl)*L,ty=y+Math.cos(tl)*L,tz=Math.sin(a)*Math.sin(tl)*L;for(let k=0;k<2;k++){const b2=a+(k?0.6:-0.6);p.push(P(CYL6,0x6a5444,tx+Math.cos(b2)*0.12,ty+0.1,tz+Math.sin(b2)*0.12,Math.sin(b2)*0.7,0,-Math.cos(b2)*0.7,0.03,0.3,0.03));}
    if(snow)p.push(P(SPH_LO,0xf4f8fa,tx,ty+0.03,tz,0,R()*3,0,0.16,0.07,0.16));}
  if(snow)p.push(P(SPH_LO,0xf4f8fa,0,1.02,0,0,0,0,0.34,0.09,0.34));}
function wildTreeParts(v){const s=season(),R=mulberry(hi(v,31,S.worldSeed|0)),p=[];v%=4;
  if(v===1)return treeParts(s==='winter'?'snowpine':'pine',R,0x9a9ea8).map(q=>Object.assign(q,{x:q.x*0.78,y:q.y*0.78,z:q.z*0.78,sx:q.sx*0.78,sy:q.sy*0.78,sz:q.sz*0.78}));
  if(s==='winter'){bareTree(p,R,true);return p;}
  // a small round-crowned tree on a clear trunk, about a tile across (a lollipop, like a storybook island's)
  const cols=TREE_COLS[s][v],cy=1.08,rd=0.42;trunkP(p,R,0x7a5230,0.62,0.12,0x5e3e24);canopy(p,R,cols,0,cy,0,rd);
  if(s==='spring'&&v===0)dots(p,R,10,0,cy+0.2,0,0.6,0.4,[0xffffff,0xfbe0ea],0xf6d04a,0.07);
  if(s==='summer'&&v===3)fruit(p,R,5,0xe0402e,0,cy,0,rd);
  if(s==='autumn'&&v===3)fruit(p,R,4,0xf08a2a,0,cy,0,rd);
  if(s==='autumn')for(let i=0;i<6;i++)p.push(P(SPH_XS,cols[i%3],(R()-0.5)*1.6,0.02,(R()-0.5)*1.6,0,R()*3,0,0.16,0.02,0.11));
  return p;}
const wildTreeKinds=()=>['wild',season()];

// (old saves only) the heart's clearing: inland grass well away from the landing beach, with room around it
function heartSpot(isl){const R=mulberry((S.worldSeed|0)^0x4ea7);let best=null,bs=-1e9;
  for(let it=0;it<400;it++){const [x,z]=isl.grass[Math.floor(R()*isl.grass.length)];if(farmQ(x,z)<1.6)continue;const d=Math.hypot(x-DOCK.x,z-DOCK.z);if(d<9)continue;
    let ok=true;for(let dx=-2;dx<=2&&ok;dx++)for(let dz=-2;dz<=2&&ok;dz++){const k=K(x+dx,z+dz);if(landMap.get(k)!=='grass'||(lvlMap.get(k)||0)!==(lvlMap.get(K(x,z))||0))ok=false;}
    if(!ok)continue;const sc=-Math.abs(d-15)+R()*4+(lvlMap.get(K(x,z))||0)*2;if(sc>bs){bs=sc;best=[x,z];}}
  return best||[0,1];}

// cover the home island in wild growth (called once when you make landfall, or when previewing an island from the sea)
function genWild(){const isl=islands[0],R=mulberry((S.worldSeed|0)^0x3a1d),sd=(S.worldSeed|0)%1000;
  const keep=new Set();const clear=(x,z,r)=>{for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)if(dx*dx+dz*dz<=r*r+1)keep.add(K(x+dx,z+dz));};
  clear(DOCK.x,DOCK.z-2,4); // the beach you land on is open ground
  const cliffEdge=(x,z)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>(lvlMap.get(K(x+a,z+b))||0)>(lvlMap.get(K(x,z))||0));
  const wet=(x,z)=>{for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if(riverSurf.has(K(x+a,z+b)))return true;return false;};
  const fAmt=(S.home&&S.home.wild)||0.5;
  for(const [x,z] of isl.grass){const k=K(x,z);if(keep.has(k)||farmQ(x,z)<1.3||S.debris.some(d=>d.x===x&&d.z===z))continue;
    const f=vnoise(x*0.9+sd,z*0.9-sd,sd)*0.7+vnoise(x*2.3,z*2.3,sd+3)*0.3,r=R();let kd=null;
    const forest=f>0.8-fAmt*0.25,thicket=f>0.66-fAmt*0.25; // groves and copses with open meadow between
    if(cliffEdge(x,z)&&r<0.16)kd=r<0.05?'boulder':'rock';
    // tidy, readable woods: trees with a few bushes at their feet, bushy edges, and open meadows with only the odd weed or stone
    else if(forest&&!wet(x,z))kd=r<0.34?'tree':r<0.42?'bush':null;
    else if(thicket)kd=r<0.1?'tree':r<0.22?'bush':r<0.25?'weed':null;
    else kd=r<0.022?'weed':r<0.03?'twig':r<0.04?'rock':r<0.055?'bush':null;
    if(!kd)continue;const d=newDebris(x,z,kd);d.v=Math.floor(R()*(kd==='tree'?4:3));d.r=R()*6.28;if(kd==='tree')d.sc=0.8+R()*0.45;S.debris.push(d);}}

/* ---- paths wear in where you walk: every step onto a grass tile counts, and a well-trodden tile turns to path ---- */
const PATH_WEAR=10;
let wearAt='';
function wearPaths(){if(!S.scratch||S.sea||inside)return;const x=Math.round(vil.x),z=Math.round(vil.z),k=K(x,z);if(k===wearAt)return;wearAt=k;
  if(landMap.get(k)!=='grass'||islMap.get(k)!==0||S.tiles[k]||fixedAt(x,z))return;S.paths=S.paths||{};const n=(S.paths[k]||0)+1;S.paths[k]=n;
  if(n===PATH_WEAR&&!TOWN.path.has(k)){TOWN.path.set(k,1);setPathMask(TOWN.path);nearT=0;refreshHomeGrass();}}
