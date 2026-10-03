/* =========================================================
   The wild island. A game started by arriving at sea (S.scratch) begins on untouched land: forests, thickets, rocky
   ground under the cliffs and open meadows, laid out by noise from the world seed and the island's style. Nothing is
   built; everything wild is ordinary farm debris (74-life), so it's cleared with the same tools, and trees are a
   debris kind of their own: chop one down with the axe and its stump stays to be dug out.
   Also here: where the Island Heart stood in saves from before you planted your own driftseed, and desire paths.
   ========================================================= */
// the wild trees change with the real seasons; the kinds themselves (oak, pine, maple, cherry, apple, pear, peach, birch,
// spruce, poplar) are in 41b-treesp. Winter strips the broadleaf trees to bare, snow-dusted branches.
function bareTree(p,R,snow){trunkP(p,R,0x6a5444,0.9,0.13,0x4e3e32);
  for(let i=0;i<7;i++){const a=i/7*6.283+R()*0.4,tl=0.55+R()*0.4,L=0.55+R()*0.3,y=0.95+R()*0.5,x=Math.cos(a)*Math.sin(tl)*L*0.5,z=Math.sin(a)*Math.sin(tl)*L*0.5;
    p.push(P(CYL6,0x5e4a3c,x,y+Math.cos(tl)*L*0.5,z,Math.sin(a)*tl,0,-Math.cos(a)*tl,0.05,L,0.05));
    const tx=Math.cos(a)*Math.sin(tl)*L,ty=y+Math.cos(tl)*L,tz=Math.sin(a)*Math.sin(tl)*L;for(let k=0;k<2;k++){const b2=a+(k?0.6:-0.6);p.push(P(CYL6,0x6a5444,tx+Math.cos(b2)*0.12,ty+0.1,tz+Math.sin(b2)*0.12,Math.sin(b2)*0.7,0,-Math.cos(b2)*0.7,0.03,0.3,0.03));}
    if(snow)p.push(P(SPH_LO,0xf4f8fa,tx,ty+0.03,tz,0,R()*3,0,0.16,0.07,0.16));}
  if(snow)p.push(P(SPH_LO,0xf4f8fa,0,1.02,0,0,0,0,0.34,0.09,0.34));}
function wildTreeParts(v){const s=season(),R=mulberry(hi(v,31,S.worldSeed|0)),p=[];
  if(treeSp(v).id==='pine')return PINE_TREE(s,R);speciesParts(v,s,R,p);return p;}
// which kind grows where: pine and spruce stands (with the odd birch), little wild orchards, and mixed broadleaf woods
function wildSpecies(x,z,R){const sd=(S.worldSeed|0)%1000,n1=vnoise(x*0.5+31,z*0.5-17,sd+11),n2=vnoise(x*0.45-9,z*0.45+23,sd+29),r=R();
  const ik=isleKind();/* an island's character (85b) sets its mix: its main trees in broad stands, the others between */
  const sp=ik?(n1>0.55?ik.mixB:ik.mixA)[Math.floor(r*(n1>0.55?ik.mixB:ik.mixA).length)]:n1>0.66?(r<0.5?1:r<0.82?8:7):n2>0.7?[4,4,5,6,3][Math.floor(R()*5)]:[0,0,0,0,2,2,2,7,7,9,9,3,4,5,6,1][Math.floor(r*16)];
  return sp+(TREE_SP[sp].shapes>1&&R()<0.4?TREE_NS:0);}
const wildTreeKinds=()=>['wild',season()];

// (old saves only) the heart's clearing: inland grass well away from the landing beach, with room around it
function heartSpot(isl){const R=mulberry((S.worldSeed|0)^0x4ea7);let best=null,bs=-1e9;
  for(let it=0;it<400;it++){const [x,z]=isl.grass[Math.floor(R()*isl.grass.length)];if(farmQ(x,z)<1.6)continue;const d=Math.hypot(x-DOCK.x,z-DOCK.z);if(d<9)continue;
    let ok=true;for(let dx=-2;dx<=2&&ok;dx++)for(let dz=-2;dz<=2&&ok;dz++){const k=K(x+dx,z+dz);if(landMap.get(k)!=='grass'||(lvlMap.get(k)||0)!==(lvlMap.get(K(x,z))||0))ok=false;}
    if(!ok)continue;const sc=-Math.abs(d-15)+R()*4+(lvlMap.get(K(x,z))||0)*2;if(sc>bs){bs=sc;best=[x,z];}}
  return best||[0,1];}

// the wild island's zones, shared by the woods (genWild), the ground colour (44-terrain) and the flower fields (55-town):
// how wooded a spot is, and how much of a flower meadow
function wildForest(x,z){const sd=(S.worldSeed|0)%1000;return vnoise(x*0.9+sd,z*0.9-sd,sd)*0.7+vnoise(x*2.3,z*2.3,sd+3)*0.3;}
function wildMeadow(x,z){return vnoise(x*0.3+7,z*0.3-3,(S.worldSeed|0)%991);}
// cover the home island in wild growth (called once when you make landfall, or when previewing an island from the sea)
function genWild(){const isl=islands[0],R=mulberry((S.worldSeed|0)^0x3a1d),sd=(S.worldSeed|0)%1000;
  const keep=new Set();const clear=(x,z,r)=>{for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)if(dx*dx+dz*dz<=r*r+1)keep.add(K(x+dx,z+dz));};
  clear(DOCK.x,DOCK.z-2,4); // the beach you land on is open ground
  const cliffEdge=(x,z)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>(lvlMap.get(K(x+a,z+b))||0)>(lvlMap.get(K(x,z))||0));
  const wet=(x,z)=>{for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if(riverSurf.has(K(x+a,z+b)))return true;return false;};
  const fAmt=(S.home&&S.home.wild)||0.5;
  for(const [x,z] of isl.grass){const k=K(x,z);if(keep.has(k)||farmQ(x,z)<1.3||S.debris.some(d=>d.x===x&&d.z===z))continue;
    const f=wildForest(x,z),r=R();let kd=null;
    const forest=f>0.8-fAmt*0.25,thicket=f>0.66-fAmt*0.25; // groves and copses with open meadow between
    if(cliffEdge(x,z)&&r<0.16)kd=r<0.05?'boulder':'rock';
    // tidy, readable woods: trees with a few bushes at their feet, bushy edges, and open meadows with only the odd weed or stone
    else if(forest&&!wet(x,z))kd=r<0.34?'tree':r<0.42?'bush':null;
    else if(thicket)kd=r<0.1?'tree':r<0.22?'bush':r<0.25?'weed':null;
    else kd=r<0.022?'weed':r<0.03?'twig':r<0.04?'rock':r<0.055?'bush':null;
    if(!kd)continue;const d=newDebris(x,z,kd);d.v=kd==='tree'?wildSpecies(x,z,R):Math.floor(R()*3);d.r=R()*6.28;if(kd==='tree')d.sc=0.8+R()*0.45;S.debris.push(d);}
  // two or three grand old trees standing alone in the meadows: landmarks you can see from across the island
  {let n=0;for(const [x,z] of shuffle(isl.grass.slice(),R)){if(n>=3)break;if(keep.has(K(x,z))||farmQ(x,z)<1.3||townQ(x,z)>0.7||wet(x,z))continue;
    if(S.debris.some(d=>Math.abs(d.x-x)<=2&&Math.abs(d.z-z)<=2))continue;const d=newDebris(x,z,'tree');d.v=(isleKind()?isleKind().grand:[10,12,3])[n%3];d.r=R()*6.28;d.sc=1.75+R()*0.3;d.grand=1;S.debris.push(d);n++;}}}

/* ---- paths wear in where you walk: every step onto a grass tile counts, and a well-trodden tile turns to path ---- */
const PATH_WEAR=10;
let wearAt='';
function wearPaths(){if(!S.scratch||S.sea||inside)return;const x=Math.round(vil.x),z=Math.round(vil.z),k=K(x,z);if(k===wearAt)return;wearAt=k;
  if(landMap.get(k)!=='grass'||islMap.get(k)!==0||S.tiles[k]||fixedAt(x,z))return;S.paths=S.paths||{};const n=(S.paths[k]||0)+1;S.paths[k]=n;
  if(n===PATH_WEAR&&!TOWN.path.has(k)){TOWN.path.set(k,1);setPathMask(TOWN.path);nearT=0;refreshHomeGrass();}}
